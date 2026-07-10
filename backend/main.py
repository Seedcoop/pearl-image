import os
import base64
from io import BytesIO
from typing import Optional

from PIL import Image
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from rembg import remove, new_session
import traceback

# --- Google GenAI (Imagen) ---
from google import genai
from google.genai import types

load_dotenv()

# --- 설정 ---
# Google AI Studio(https://aistudio.google.com/apikey)에서 발급받은 API 키.
# Imagen 계열 모델은 유료(결제 활성화) 프로젝트에서만 동작합니다.
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY 환경변수가 필요합니다. (Google AI Studio에서 발급)")

# 이미지 생성 모델 - Imagen 4 Fast (텍스트 → 이미지)
IMAGE_MODEL = os.getenv("IMAGE_MODEL", "imagen-4.0-fast-generate-001")
# 이미지 편집 모델 - Gemini 2.5 Flash Image / Nano Banana (이미지 + 지시 → 이미지)
EDIT_MODEL = os.getenv("EDIT_MODEL", "gemini-2.5-flash-image")

# Imagen이 지원하는 화면 비율
ALLOWED_ASPECT_RATIOS = {"1:1", "3:4", "4:3", "9:16", "16:9"}

client = genai.Client(api_key=GEMINI_API_KEY)
print(f"인증 방식: Gemini API Key / 모델: {IMAGE_MODEL}")

app = FastAPI(
    title="Pearl Image Generator",
    description="Text-to-Image Generation using Imagen 4 Fast",
    version="3.0.0",
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


def _extract_image_bytes(response) -> Optional[bytes]:
    """Imagen 응답에서 첫 번째 이미지의 원본 바이트를 추출한다."""
    images = getattr(response, "generated_images", None)
    if not images:
        return None
    image = getattr(images[0], "image", None)
    if image is None:
        return None
    data = getattr(image, "image_bytes", None)
    if not data:
        return None
    # SDK 버전에 따라 bytes 또는 base64 str로 올 수 있어 모두 처리
    if isinstance(data, str):
        return base64.b64decode(data)
    return data


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


def _map_api_error(detail: str) -> str:
    if any(k in detail for k in ("RESOURCE_EXHAUSTED", "Quota", "429")):
        return "사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요."
    if any(k in detail for k in ("Safety", "SAFETY", "blocked", "prohibited")):
        return "안전 정책에 위배되어 이미지를 만들 수 없습니다. 다른 표현으로 시도해주세요."
    if any(k in detail for k in ("API key", "API_KEY", "401", "403", "PERMISSION_DENIED")):
        return "서버의 API 키가 유효하지 않거나 권한이 없습니다. 관리자에게 문의해주세요."
    return f"이미지 생성 중 오류가 발생했습니다: {detail}"


@app.post("/generate")
async def generate_image(request: ImageRequest):
    """텍스트 → 이미지 (Imagen 4 Fast)"""
    aspect_ratio = request.aspect_ratio if request.aspect_ratio in ALLOWED_ASPECT_RATIOS else "1:1"
    final_prompt = request.prompt.strip()

    print(f"Generating | model={IMAGE_MODEL} | ratio={aspect_ratio} | prompt={final_prompt}")

    try:
        response = client.models.generate_images(
            model=IMAGE_MODEL,
            prompt=final_prompt,
            config=types.GenerateImagesConfig(
                number_of_images=1,
                aspect_ratio=aspect_ratio,
            ),
        )
        img_bytes = _extract_image_bytes(response)
    except Exception as api_error:
        print(f"Imagen API 오류: {api_error}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=_map_api_error(str(api_error)))

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

    print(f"Editing | model={EDIT_MODEL} | mime={mime} | instruction={instruction}")

    try:
        image_part = types.Part.from_bytes(data=src_bytes, mime_type=mime)
        response = client.models.generate_content(
            model=EDIT_MODEL,
            contents=[instruction, image_part],
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE"],
            ),
        )
        img_bytes = _extract_from_candidates(response)
    except HTTPException:
        raise
    except Exception as api_error:
        print(f"편집 API 오류: {api_error}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=_map_api_error(str(api_error)))

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
        "version": "3.0.0",
        "generate_model": IMAGE_MODEL,
        "edit_model": EDIT_MODEL,
        "endpoints": {
            "/generate": "Generate image from text (Imagen 4 Fast)",
            "/edit": "Edit an uploaded image with an instruction (Gemini 2.5 Flash Image)",
            "/health": "Health check",
            "/api/info": "API information",
        },
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
