import os
import base64
from typing import Optional
from PIL import Image
from io import BytesIO
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from rembg import remove
import traceback

# --- Gemini API (Google AI Studio) Imports ---
from google import genai
from google.genai import types

# 환경변수 로드
load_dotenv()

# --- Gemini API 설정 ---
# Google AI Studio(https://aistudio.google.com/apikey)에서 발급받은 무료 API 키.
# 무료 티어로 Nano Banana(gemini-2.5-flash-image) 이미지 생성이 가능합니다 (결제/카드 불필요).
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY 환경변수가 필요합니다. (Google AI Studio에서 발급)")

# 이미지 생성 모델 - Nano Banana (무료 티어 지원)
IMAGE_MODEL = os.getenv("IMAGE_MODEL", "gemini-2.5-flash-image")

# Gemini 클라이언트 초기화
client = genai.Client(api_key=GEMINI_API_KEY)
print(f"인증 방식: Gemini API Key / 모델: {IMAGE_MODEL}")

# FastAPI 앱 초기화
app = FastAPI(
    title="Pearl Image Generator",
    description="Text-to-Image Generation using Gemini API (Nano Banana)",
    version="2.0.0"
)

# CORS 설정 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://dinagding-studio.vercel.app",  # 정확한 Vercel 도메인
        "https://*.vercel.app",  # Vercel 서브도메인
        "*"  # 모든 도메인 허용
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

class ImageRequest(BaseModel):
    prompt: str
    aspect_ratio: str = "1:1"
    # 아래 두 값은 Imagen 시절 파라미터로, Nano Banana에서는 지원되지 않아 무시됩니다.
    # (프론트엔드 호환을 위해 필드는 그대로 받아둠)
    guidance_scale: float = Field(default=10.0, ge=1.0, le=20.0)
    seed: Optional[int] = Field(default=None, ge=0)
    transparent_bg: bool = Field(default=False)

# React 앱을 위한 루트 경로 (빌드된 앱을 서빙할 때 사용)
# @app.get("/", response_class=HTMLResponse)
# async def home():
#     """React 앱 서빙"""
#     return FileResponse("../frontend/dist/index.html")


def _extract_image_bytes(response) -> Optional[bytes]:
    """Gemini 응답에서 첫 번째 이미지의 원본 바이트를 추출한다. 없으면 None."""
    candidates = getattr(response, "candidates", None)
    if not candidates:
        return None
    for candidate in candidates:
        content = getattr(candidate, "content", None)
        if not content or not getattr(content, "parts", None):
            continue
        for part in content.parts:
            inline_data = getattr(part, "inline_data", None)
            if inline_data is not None and getattr(inline_data, "data", None):
                data = inline_data.data
                # SDK 버전에 따라 bytes 또는 base64 str로 올 수 있어 모두 처리
                if isinstance(data, str):
                    return base64.b64decode(data)
                return data
    return None


@app.post("/generate")
async def generate_image(request: ImageRequest):
    try:
        # 최종 프롬프트 구성
        final_prompt = request.prompt
        final_prompt += ", clean background"
        # Nano Banana는 seed/guidance_scale/aspect_ratio 파라미터가 없어
        # 화면 비율은 프롬프트 힌트로 전달한다.
        if request.aspect_ratio:
            final_prompt += f", aspect ratio {request.aspect_ratio}"

        print(f"Final prompt: {final_prompt}")
        print(f"Aspect ratio: {request.aspect_ratio} (프롬프트 힌트로 전달)")
        print(f"Seed/Guidance는 Nano Banana에서 미지원 → 무시됨")

        # 실제 Gemini 이미지 생성 API 호출
        try:
            print(f"Calling Gemini image API ({IMAGE_MODEL}) with prompt: {final_prompt}")

            response = client.models.generate_content(
                model=IMAGE_MODEL,
                contents=[final_prompt],
                config=types.GenerateContentConfig(
                    response_modalities=["IMAGE"],
                ),
            )

            img_bytes = _extract_image_bytes(response)

            if not img_bytes:
                # 안전 필터 등에 의해 이미지가 생성되지 않았을 가능성이 높음
                raise HTTPException(
                    status_code=400,
                    detail="입력된 프롬프트가 안전 정책에 위배될 수 있어 이미지를 생성할 수 없습니다. 더 일반적인 단어를 사용해 보세요.",
                )

            img = Image.open(BytesIO(img_bytes))

        except HTTPException:
            raise
        except Exception as api_error:
            print(f"Gemini 이미지 API 호출 오류: {str(api_error)}")
            traceback.print_exc()

            # 구체적인 에러 메시지 생성
            error_detail = str(api_error)
            if "RESOURCE_EXHAUSTED" in error_detail or "Quota" in error_detail or "429" in error_detail:
                error_message = "무료 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요."
            elif "Safety" in error_detail or "blocked" in error_detail or "SAFETY" in error_detail:
                error_message = "프롬프트가 안전 정책에 위배되어 이미지를 생성할 수 없습니다. 다른 프롬프트로 시도해주세요."
            elif "API key" in error_detail or "API_KEY" in error_detail or "401" in error_detail or "PERMISSION_DENIED" in error_detail or "403" in error_detail:
                error_message = "서버의 Gemini API 키가 유효하지 않거나 권한이 없습니다. 관리자에게 문의해주세요."
            else:
                error_message = f"이미지 생성 중 오류가 발생했습니다: {error_detail}"

            raise HTTPException(status_code=500, detail=error_message)

        # 생성된 이미지를 base64로 인코딩하여 브라우저로 직접 반환
        try:
            print(f"Successfully converted to PIL Image: {img.size} {img.mode}")

            # 투명 배경 처리 - rembg AI 모델 사용
            if request.transparent_bg:
                print("AI 기반 배경 제거 시작...")
                try:
                    # rembg를 사용하여 AI 기반 배경 제거
                    # rembg는 RGBA 모드를 기대하므로 변환
                    if img.mode != 'RGBA':
                        img = img.convert('RGBA')
                    img = remove(img)
                    print("AI 배경 제거 완료!")
                except Exception as rembg_error:
                    print(f"rembg 오류: {str(rembg_error)}")
                    # rembg 실패 시 원본 이미지 유지

            # PIL Image를 메모리 버퍼에 저장
            img_buffer = BytesIO()
            img.save(img_buffer, 'PNG')
            img_buffer.seek(0)

            # base64로 인코딩
            img_base64 = base64.b64encode(img_buffer.getvalue()).decode('utf-8')
            img_data_url = f"data:image/png;base64,{img_base64}"

            return {
                "success": True,
                "image_data": img_data_url,
                "message": "이미지가 성공적으로 생성되었습니다."
            }

        except Exception as img_error:
            print(f"이미지 처리 오류: {str(img_error)}")
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"이미지 처리 중 심각한 오류가 발생했습니다: {str(img_error)}")

    except Exception as e:
        print(f"이미지 생성 중 예측하지 못한 오류 발생: {str(e)}")
        traceback.print_exc()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"서버 내부 오류가 발생했습니다. 관리자에게 문의해주세요.")

@app.get("/health")
async def health_check():
    """서비스 상태 확인"""
    return {"status": "healthy", "service": "Pearl Image Generator"}

@app.get("/api/info")
async def api_info():
    """API 정보"""
    return {
        "service": "Pearl Image Generator",
        "version": "2.0.0",
        "description": "Text-to-Image Generation using Gemini API (Nano Banana)",
        "endpoints": {
            "/generate": "Generate image from text",
            "/health": "Health check",
            "/api/info": "API information"
        }
    }

if __name__ == "__main__":
    import uvicorn
    # Railway는 PORT 환경변수를 사용
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
