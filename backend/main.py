import os
import math
import random
import asyncio
import base64
import time
import re
from io import BytesIO
from typing import Callable, Optional

from PIL import Image
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from rembg import remove, new_session
import traceback

# --- Google GenAI (Gemini 2.5 Flash Image / Nano Banana) ---
from google import genai
from google.genai import types
from google.genai import errors as genai_errors

load_dotenv()

# --- 설정 ---
# Google AI Studio(https://aistudio.google.com/apikey)에서 발급받은 API 키.
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY 환경변수가 필요합니다. (Google AI Studio에서 발급)")

# 이미지 생성/편집 모두 Gemini 2.5 Flash Image(Nano Banana)를 사용한다.
# Nano Banana는 RPM/RPD 기반이라 Tier 1에서 분당 수백 건을 처리할 수 있다.
# (구 imagen-4.0-fast-generate-001 은 IPM 기반 + 2026-08-17 종료 예정이라 이전함)
IMAGE_MODEL = os.getenv("IMAGE_MODEL", "gemini-2.5-flash-image")
EDIT_MODEL = os.getenv("EDIT_MODEL", "gemini-2.5-flash-image")

# Nano Banana가 지원하는 화면 비율 (image_config.aspect_ratio로 전달)
ALLOWED_ASPECT_RATIOS = {"1:1", "3:4", "4:3", "9:16", "16:9"}

# --- Rate limit / 재시도 튜닝 (env로 조정) ---
# 실측 RPM은 https://aistudio.google.com/rate-limit 에서 프로젝트별로 확인 후 반영.
GENERATE_RPM = float(os.getenv("GENERATE_RPM", "20"))
EDIT_RPM = float(os.getenv("EDIT_RPM", "20"))
# 리미터에서 이 시간(초)보다 오래 기다려야 하면 무한 대기 대신 429로 즉시 반환.
LIMITER_MAX_WAIT = float(os.getenv("LIMITER_MAX_WAIT", "20"))
# 429 응답의 Retry-After 기본값(초). 예외에서 지연을 못 읽었을 때 사용.
DEFAULT_RETRY_AFTER = int(os.getenv("DEFAULT_RETRY_AFTER", "10"))
# Gemini 호출 실패 시 백엔드 재시도 횟수(최초 시도 제외).
MODEL_RETRIES = int(os.getenv("MODEL_RETRIES", "2"))

# 사용 중인 google-genai 버전이 image_config(비율 지정)를 지원하는지 확인.
# 미지원이면 프롬프트에 비율 힌트를 넣는 방식으로 폴백한다.
_SUPPORTS_IMAGE_CONFIG = hasattr(types, "ImageConfig") and (
    "image_config" in getattr(types.GenerateContentConfig, "model_fields", {})
)

client = genai.Client(api_key=GEMINI_API_KEY)
print(
    f"인증 방식: Gemini API Key / 생성={IMAGE_MODEL} / 편집={EDIT_MODEL} / "
    f"image_config支持={_SUPPORTS_IMAGE_CONFIG}"
)

app = FastAPI(
    title="Pearl Image Generator",
    description="Text-to-Image & Edit using Gemini 2.5 Flash Image (Nano Banana)",
    version="4.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


class ImageRequest(BaseModel):
    prompt: str = Field(..., min_length=1)
    aspect_ratio: str = "1:1"
    transparent_bg: bool = False


class EditRequest(BaseModel):
    # 편집할 원본 이미지 (data URL "data:image/png;base64,..." 또는 순수 base64)
    image_data: str = Field(..., min_length=1)
    prompt: str = Field(..., min_length=1)
    transparent_bg: bool = False


# ---------------------------------------------------------------------------
# 토큰버킷 rate limiter (Task C)
# 버스트를 모델 RPM 밑으로 평탄화하여 실패 대신 대기로 전환한다.
# ---------------------------------------------------------------------------
class AsyncRateLimiter:
    def __init__(self, rate_per_min: float, burst: Optional[int] = None):
        self.rate = rate_per_min / 60.0  # tokens/sec
        self.capacity = burst or max(1, int(rate_per_min))
        self.tokens = float(self.capacity)
        self.updated = time.monotonic()
        self.lock = asyncio.Lock()

    async def acquire(self, max_wait: float = 20.0) -> bool:
        """토큰을 하나 소비한다. max_wait 안에 못 얻으면 False(→ caller가 429 반환)."""
        deadline = time.monotonic() + max_wait
        while True:
            async with self.lock:
                now = time.monotonic()
                self.tokens = min(
                    self.capacity, self.tokens + (now - self.updated) * self.rate
                )
                self.updated = now
                if self.tokens >= 1:
                    self.tokens -= 1
                    return True
                wait = (1 - self.tokens) / self.rate
            if time.monotonic() + wait > deadline:
                return False
            await asyncio.sleep(min(wait, 1.0))


generate_limiter = AsyncRateLimiter(GENERATE_RPM)
edit_limiter = AsyncRateLimiter(EDIT_RPM)


# ---------------------------------------------------------------------------
# 응답 파싱 헬퍼
# ---------------------------------------------------------------------------
def _extract_from_candidates(response) -> Optional[bytes]:
    """Gemini(generate_content) 응답에서 첫 번째 이미지 바이트를 추출한다."""
    for candidate in getattr(response, "candidates", None) or []:
        content = getattr(candidate, "content", None)
        parts = getattr(content, "parts", None) if content else None
        for part in parts or []:
            inline = getattr(part, "inline_data", None)
            data = getattr(inline, "data", None) if inline else None
            if data:
                return base64.b64decode(data) if isinstance(data, str) else data
    return None


def _decode_image_input(image_data: str) -> tuple[bytes, str]:
    """data URL 또는 순수 base64 문자열을 (바이트, mime) 로 디코드한다."""
    mime = "image/png"
    payload = image_data.strip()
    if payload.startswith("data:"):
        header, _, payload = payload.partition(",")
        if ";" in header and ":" in header:
            mime = header.split(":", 1)[1].split(";", 1)[0] or mime
    try:
        return base64.b64decode(payload), mime
    except Exception:
        raise HTTPException(status_code=400, detail="이미지 데이터를 읽을 수 없습니다. 올바른 이미지를 업로드해주세요.")


# rembg 세션은 첫 사용 시 한 번만 로드하고 이후 재사용한다 (요청마다 모델 재로딩 방지).
_REMBG_MODEL = os.getenv("REMBG_MODEL", "u2net")
_rembg_session = None


def _get_rembg_session():
    global _rembg_session
    if _rembg_session is None:
        _rembg_session = new_session(_REMBG_MODEL)
    return _rembg_session


def _encode_png_response(img_bytes: bytes, transparent_bg: bool) -> dict:
    """이미지 바이트를 후처리(투명배경)하고 base64 PNG data URL 응답으로 만든다."""
    try:
        img = Image.open(BytesIO(img_bytes))
        if transparent_bg:
            print("AI 배경 제거 시작...")
            try:
                if img.mode != "RGBA":
                    img = img.convert("RGBA")
                # 캐시된 세션 재사용 + 마스크 후처리로 스프라이트 경계를 더 깔끔하게
                img = remove(img, session=_get_rembg_session(), post_process_mask=True)
                print("AI 배경 제거 완료")
            except Exception as rembg_error:
                print(f"rembg 오류(원본 유지): {rembg_error}")
        buffer = BytesIO()
        img.save(buffer, "PNG")
        img_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
        return {
            "success": True,
            "image_data": f"data:image/png;base64,{img_base64}",
            "message": "이미지가 성공적으로 생성되었습니다.",
        }
    except Exception as img_error:
        print(f"이미지 처리 오류: {img_error}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"이미지 처리 중 오류가 발생했습니다: {img_error}")


# ---------------------------------------------------------------------------
# 에러 → HTTP 상태코드 매핑 (Task B)
# ---------------------------------------------------------------------------
_RETRY_DELAY_RE = re.compile(r"retry[-_ ]?(?:delay|after)['\"\s:=]+(\d+(?:\.\d+)?)\s*s", re.IGNORECASE)


def _error_code(exc: Exception) -> Optional[int]:
    """google-genai 예외의 HTTP 상태코드(.code)를 우선 사용."""
    code = getattr(exc, "code", None)
    if isinstance(code, int):
        return code
    return None


def _error_text(exc: Exception) -> str:
    parts = [str(exc)]
    for attr in ("status", "message"):
        val = getattr(exc, attr, None)
        if val:
            parts.append(str(val))
    return " ".join(parts)


def _parse_retry_delay(exc: Exception) -> Optional[float]:
    """예외에서 재시도 지연(초)을 파싱한다 (예: RetryInfo의 'retryDelay': '17s')."""
    m = _RETRY_DELAY_RE.search(_error_text(exc))
    if m:
        try:
            return float(m.group(1))
        except ValueError:
            pass
    return None


def _is_rate_limit(exc: Exception) -> bool:
    if _error_code(exc) == 429:
        return True
    text = _error_text(exc)
    return any(k in text for k in ("RESOURCE_EXHAUSTED", "Quota", "quota", "429", "rate limit", "Rate limit"))


def _is_transient(exc: Exception) -> bool:
    """재시도할 가치가 있는 일시적 오류(429/5xx)인지."""
    if _is_rate_limit(exc):
        return True
    code = _error_code(exc)
    if code is not None and 500 <= code < 600:
        return True
    text = _error_text(exc)
    return any(k in text for k in ("UNAVAILABLE", "INTERNAL", "DEADLINE_EXCEEDED", "503", "504"))


def _classify_api_error(exc: Exception) -> HTTPException:
    """Gemini 예외를 정확한 HTTP 상태코드로 매핑한다. google-genai 예외 코드 우선."""
    code = _error_code(exc)
    text = _error_text(exc)

    # 1) rate limit → 429 + Retry-After
    if _is_rate_limit(exc):
        retry = _parse_retry_delay(exc) or float(DEFAULT_RETRY_AFTER)
        return HTTPException(
            status_code=429,
            detail="사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.",
            headers={"Retry-After": str(max(1, int(math.ceil(retry))))},
        )

    # 2) 안전정책 위반 → 422
    if any(k in text for k in ("SAFETY", "Safety", "blocked", "prohibited", "PROHIBITED_CONTENT")):
        return HTTPException(
            status_code=422,
            detail="안전 정책에 위배되어 이미지를 만들 수 없습니다. 다른 표현으로 시도해주세요.",
        )

    # 3) API 키/권한 문제 → 502 (서버 설정 문제이므로 사용자에겐 관리자 문의 안내)
    if code in (401, 403) or any(
        k in text for k in ("PERMISSION_DENIED", "UNAUTHENTICATED", "API key", "API_KEY", "401", "403")
    ):
        return HTTPException(
            status_code=502,
            detail="서버의 API 키가 유효하지 않거나 권한이 없습니다. 관리자에게 문의해주세요.",
        )

    # 4) 그 외 → 500
    return HTTPException(status_code=500, detail=f"이미지 생성 중 오류가 발생했습니다: {text}")


# ---------------------------------------------------------------------------
# 지수 백오프 재시도 래퍼 (Task D)
# ---------------------------------------------------------------------------
async def _run_model_call(call: Callable[[], Optional[bytes]], *, retries: int = MODEL_RETRIES) -> Optional[bytes]:
    """블로킹 Gemini 호출을 스레드에서 실행하고, 429/일시적 5xx는 백오프 재시도한다."""
    for attempt in range(retries + 1):
        try:
            return await asyncio.to_thread(call)
        except Exception as exc:
            if attempt >= retries or not _is_transient(exc):
                raise
            delay = _parse_retry_delay(exc)
            if delay is None:
                delay = min(2 ** attempt, 8) + random.uniform(0, 0.4)
            print(f"모델 호출 재시도 {attempt + 1}/{retries} ({delay:.1f}s 대기): {exc}")
            await asyncio.sleep(delay)


# ---------------------------------------------------------------------------
# 이미지 생성/편집 호출부
# (향후 GPT Image 등 다른 프로바이더를 오버플로우로 붙일 때 이 함수들을
#  provider 인터페이스 뒤로 옮기면 된다 — 지금은 과설계를 피해 단순 유지.)
# ---------------------------------------------------------------------------
def _build_generate_config(aspect_ratio: str, prompt: str) -> tuple[types.GenerateContentConfig, str]:
    """비율을 반영한 생성 config와 (필요 시 힌트가 붙은) 프롬프트를 돌려준다."""
    if _SUPPORTS_IMAGE_CONFIG:
        config = types.GenerateContentConfig(
            response_modalities=["IMAGE"],
            image_config=types.ImageConfig(aspect_ratio=aspect_ratio),
        )
        return config, prompt
    # 폴백: 구버전 SDK — 프롬프트에 비율 힌트를 포함
    hinted = f"{prompt}\n\n(Image aspect ratio: {aspect_ratio})"
    return types.GenerateContentConfig(response_modalities=["IMAGE"]), hinted


def _generate_image_call(prompt: str, aspect_ratio: str) -> Optional[bytes]:
    config, final_prompt = _build_generate_config(aspect_ratio, prompt)
    response = client.models.generate_content(
        model=IMAGE_MODEL,
        contents=[final_prompt],
        config=config,
    )
    return _extract_from_candidates(response)


def _edit_image_call(instruction: str, src_bytes: bytes, mime: str) -> Optional[bytes]:
    image_part = types.Part.from_bytes(data=src_bytes, mime_type=mime)
    response = client.models.generate_content(
        model=EDIT_MODEL,
        contents=[instruction, image_part],
        config=types.GenerateContentConfig(response_modalities=["IMAGE"]),
    )
    return _extract_from_candidates(response)


def _too_busy_response() -> HTTPException:
    return HTTPException(
        status_code=429,
        detail="현재 요청이 많습니다. 잠시 후 다시 시도해주세요.",
        headers={"Retry-After": str(DEFAULT_RETRY_AFTER)},
    )


# ---------------------------------------------------------------------------
# 엔드포인트
# ---------------------------------------------------------------------------
@app.post("/generate")
async def generate_image(request: ImageRequest):
    """텍스트 → 이미지 (Gemini 2.5 Flash Image / Nano Banana)"""
    aspect_ratio = request.aspect_ratio if request.aspect_ratio in ALLOWED_ASPECT_RATIOS else "1:1"
    final_prompt = request.prompt.strip()

    # 버스트 평탄화: 리미터를 못 통과하면 즉시 429 (무한 대기 방지)
    if not await generate_limiter.acquire(LIMITER_MAX_WAIT):
        raise _too_busy_response()

    print(f"Generating | model={IMAGE_MODEL} | ratio={aspect_ratio} | prompt={final_prompt}")

    try:
        img_bytes = await _run_model_call(lambda: _generate_image_call(final_prompt, aspect_ratio))
    except HTTPException:
        raise
    except Exception as api_error:
        print(f"생성 API 오류: {api_error}")
        traceback.print_exc()
        raise _classify_api_error(api_error)

    if not img_bytes:
        raise HTTPException(
            status_code=400,
            detail="이미지를 생성하지 못했습니다. 프롬프트가 안전 정책에 걸렸을 수 있어요. 다른 표현으로 시도해주세요.",
        )

    return _encode_png_response(img_bytes, request.transparent_bg)


@app.post("/edit")
async def edit_image(request: EditRequest):
    """이미지 + 지시 → 편집된 이미지 (Gemini 2.5 Flash Image)"""
    src_bytes, mime = _decode_image_input(request.image_data)
    instruction = request.prompt.strip()

    if not await edit_limiter.acquire(LIMITER_MAX_WAIT):
        raise _too_busy_response()

    print(f"Editing | model={EDIT_MODEL} | mime={mime} | instruction={instruction}")

    try:
        img_bytes = await _run_model_call(lambda: _edit_image_call(instruction, src_bytes, mime))
    except HTTPException:
        raise
    except Exception as api_error:
        print(f"편집 API 오류: {api_error}")
        traceback.print_exc()
        raise _classify_api_error(api_error)

    if not img_bytes:
        raise HTTPException(
            status_code=400,
            detail="이미지를 편집하지 못했습니다. 다른 지시로 시도하거나 다른 이미지를 사용해보세요.",
        )

    result = _encode_png_response(img_bytes, request.transparent_bg)
    result["message"] = "이미지가 성공적으로 편집되었습니다."
    return result


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Pearl Image Generator"}


@app.get("/api/info")
async def api_info():
    return {
        "service": "Pearl Image Generator",
        "version": "4.0.0",
        "generate_model": IMAGE_MODEL,
        "edit_model": EDIT_MODEL,
        "generate_rpm": GENERATE_RPM,
        "edit_rpm": EDIT_RPM,
        "endpoints": {
            "/generate": "Generate image from text (Gemini 2.5 Flash Image)",
            "/edit": "Edit an uploaded image with an instruction (Gemini 2.5 Flash Image)",
            "/health": "Health check",
            "/api/info": "API information",
        },
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
