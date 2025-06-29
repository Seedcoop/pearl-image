import os
import asyncio
import base64
from datetime import datetime
from typing import Optional
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
from fastapi import FastAPI, HTTPException, Request, Form
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from dotenv import load_dotenv
import aiofiles
from pydantic import BaseModel, Field
from rembg import remove

# 환경변수 로드
load_dotenv()

# Gemini API 설정 - 하나의 변수로 통일
API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
if not API_KEY:
    raise ValueError("GEMINI_API_KEY 또는 GOOGLE_API_KEY 환경변수가 필요합니다")

# Gemini Client 초기화
client = genai.Client(api_key=API_KEY)

# FastAPI 앱 초기화
app = FastAPI(
    title="Pearl Image Generator",
    description="Text-to-Image Generation using Gemini Imagen 4 API",
    version="1.0.0"
)

# CORS 설정 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:3000",
        "https://*.vercel.app",  # Vercel 배포 도메인
        "*"  # 임시로 모든 도메인 허용 (나중에 특정 도메인으로 제한)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ImageRequest(BaseModel):
    prompt: str
    aspect_ratio: str = "1:1"
    guidance_scale: float = Field(default=10.0, ge=1.0, le=20.0)
    seed: Optional[int] = Field(default=None, ge=0)
    transparent_bg: bool = Field(default=False)

# React 앱을 위한 루트 경로 (빌드된 앱을 서빙할 때 사용)
# @app.get("/", response_class=HTMLResponse)
# async def home():
#     """React 앱 서빙"""
#     return FileResponse("../frontend/dist/index.html")

@app.post("/generate")
async def generate_image(request: ImageRequest):
    try:
        # 최종 프롬프트 구성
        final_prompt = request.prompt
        
        # rembg를 사용할 예정이므로 일반적인 배경으로 생성
        final_prompt += ", clean background"
        
        print(f"Final prompt: {final_prompt}")
        print(f"Aspect ratio: {request.aspect_ratio}")
        print(f"Guidance scale: {request.guidance_scale}")
        print(f"Seed: {request.seed}")
        
        # 이미지 생성 설정 구성 - 가장 기본적인 파라미터만 사용
        config = types.GenerateImagesConfig(
            number_of_images=1
        )
        
        # 실제 Imagen API 호출
        try:
            print(f"Calling Imagen API with prompt: {final_prompt}")
            response = client.models.generate_images(
                model='imagen-4.0-generate-preview-06-06',
                prompt=final_prompt,
                config=config
            )
            
            # 생성된 이미지가 있는지 확인
            if not response.generated_images:
                raise Exception("생성된 이미지가 없습니다.")
            
            # 첫 번째 생성된 이미지 사용
            generated_image = response.generated_images[0]
            
        except Exception as api_error:
            print(f"Imagen API 호출 오류: {str(api_error)}")
            # 오류 발생 시 더미 이미지 생성 (백업용)
            from PIL import ImageDraw, ImageFont
            
            img = Image.new('RGB', (512, 512), color='lightcoral')
            draw = ImageDraw.Draw(img)
            
            # 에러 메시지 표시
            try:
                font = ImageFont.load_default()
                error_text = f"API Error: {str(api_error)[:100]}..."
                draw.text((10, 10), error_text, fill='darkred', font=font)
                draw.text((10, 40), f"Prompt: {request.prompt[:50]}...", fill='darkred', font=font)
            except:
                draw.text((10, 250), "API Error", fill='darkred')
            
            # 더미 이미지로 계속 진행
            generated_image = type('obj', (object,), {'image': img})()
        
        # 생성된 이미지를 base64로 인코딩하여 브라우저로 직접 반환
        try:
            # generated_image에서 PIL Image 객체 추출
            if hasattr(generated_image, 'image'):
                genai_img = generated_image.image
            else:
                genai_img = generated_image
            
            print(f"Image type: {type(genai_img)}")
            print(f"Image attributes: {dir(genai_img)}")
            
            # Google GenAI Image를 PIL Image로 변환
            if hasattr(genai_img, '_pil_image'):
                # _pil_image 속성이 있는 경우
                img = genai_img._pil_image
            elif hasattr(genai_img, 'to_pil'):
                # to_pil 메서드가 있는 경우
                img = genai_img.to_pil()
            elif hasattr(genai_img, 'data'):
                # 바이트 데이터가 있는 경우
                img = Image.open(BytesIO(genai_img.data))
            elif hasattr(genai_img, '_image_bytes'):
                # _image_bytes 속성이 있는 경우
                img = Image.open(BytesIO(genai_img._image_bytes))
            else:
                # 다른 방법으로 시도
                try:
                    # genai_img 자체를 PIL Image로 변환 시도
                    img_bytes = bytes(genai_img)
                    img = Image.open(BytesIO(img_bytes))
                except:
                    # 실패 시 더미 이미지 생성
                    img = Image.new('RGB', (512, 512), color='white')
                    print("Failed to convert GenAI Image, using dummy image")
            
            print(f"Converted PIL Image mode: {img.mode}")
            
            # 투명 배경 처리 - rembg AI 모델 사용
            if request.transparent_bg:
                print("AI 기반 배경 제거 시작...")
                try:
                    # rembg를 사용하여 AI 기반 배경 제거
                    img = remove(img)
                    print("AI 배경 제거 완료!")
                except Exception as rembg_error:
                    print(f"rembg 오류: {str(rembg_error)}")
                    # rembg 실패 시 원본 이미지 유지
                    if img.mode != 'RGBA':
                        img = img.convert('RGBA')
            
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
            import traceback
            traceback.print_exc()
            raise Exception(f"이미지 처리 중 오류가 발생했습니다: {str(img_error)}")
        
    except Exception as e:
        print(f"Error during image generation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"이미지 생성 중 오류가 발생했습니다: {str(e)}")

@app.get("/health")
async def health_check():
    """서비스 상태 확인"""
    return {"status": "healthy", "service": "Pearl Image Generator"}

@app.get("/api/info")
async def api_info():
    """API 정보"""
    return {
        "service": "Pearl Image Generator",
        "version": "1.0.0",
        "description": "Text-to-Image Generation using Gemini Imagen 4 API",
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