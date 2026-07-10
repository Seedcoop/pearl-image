import os
import base64
from io import BytesIO
from typing import Optional

from PIL import Image
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from rembg import remove
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

# 이미지 생성 모델 - Imagen 4 Fast (빠르고 저렴)
IMAGE_MODEL = os.getenv("IMAGE_MODEL", "imagen-4.0-fast-generate-001")

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


@app.post("/generate")
async def generate_image(request: ImageRequest):
    aspect_ratio = request.aspect_ratio if request.aspect_ratio in ALLOWED_ASPECT_RATIOS else "1:1"
    final_prompt = request.prompt.strip()

    print(f"Generating | model={IMAGE_MODEL} | ratio={aspect_ratio} | prompt={final_prompt}")

    # 1) Imagen 호출
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
        detail = str(api_error)
        if any(k in detail for k in ("RESOURCE_EXHAUSTED", "Quota", "429")):
            message = "사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요."
        elif any(k in detail for k in ("Safety", "SAFETY", "blocked", "prohibited")):
            message = "프롬프트가 안전 정책에 위배되어 이미지를 생성할 수 없습니다. 다른 표현으로 시도해주세요."
        elif any(k in detail for k in ("API key", "API_KEY", "401", "403", "PERMISSION_DENIED")):
            message = "서버의 API 키가 유효하지 않거나 권한이 없습니다. 관리자에게 문의해주세요."
        else:
            message = f"이미지 생성 중 오류가 발생했습니다: {detail}"
        raise HTTPException(status_code=500, detail=message)

    if not img_bytes:
        # 안전 필터로 인해 이미지가 반환되지 않은 경우가 대부분
        raise HTTPException(
            status_code=400,
            detail="이미지를 생성하지 못했습니다. 프롬프트가 안전 정책에 걸렸을 수 있어요. 다른 표현으로 시도해주세요.",
        )

    # 2) 후처리 (투명 배경) + 인코딩
    try:
        img = Image.open(BytesIO(img_bytes))

        if request.transparent_bg:
            print("AI 배경 제거 시작...")
            try:
                if img.mode != "RGBA":
                    img = img.convert("RGBA")
                img = remove(img)
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


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Pearl Image Generator"}


@app.get("/api/info")
async def api_info():
    return {
        "service": "Pearl Image Generator",
        "version": "3.0.0",
        "model": IMAGE_MODEL,
        "endpoints": {
            "/generate": "Generate image from text",
            "/health": "Health check",
            "/api/info": "API information",
        },
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
