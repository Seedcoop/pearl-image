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
import json
import tempfile

# --- Vertex AI Imports ---
import vertexai
from vertexai.vision_models import ImageGenerationModel

# 환경변수 로드
load_dotenv()

# --- Vertex AI 설정 ---
GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID")
GCP_REGION = os.getenv("GCP_REGION")

if not GCP_PROJECT_ID or not GCP_REGION:
    raise ValueError("GCP_PROJECT_ID와 GCP_REGION 환경변수가 필요합니다.")

# --- 프로덕션/로컬 환경에 따른 인증 분기 ---
# Railway 같은 프로덕션 환경에서는 GCP_SA_KEY_JSON 환경변수에서 서비스 계정 키를 읽어 인증합니다.
# 로컬 환경에서는 gcloud auth application-default login으로 설정된 ADC를 사용합니다.
gcp_sa_key_json = os.getenv("GCP_SA_KEY_JSON")
if gcp_sa_key_json:
    try:
        # 서비스 계정 키를 임시 파일에 쓰고, 그 경로를 환경변수로 설정
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json') as temp_f:
            temp_f.write(gcp_sa_key_json)
            os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = temp_f.name
        print("인증 방식: 서비스 계정 (GCP_SA_KEY_JSON)")
    except Exception as e:
        print(f"서비스 계정 처리 중 오류 발생: {e}")
else:
    print("인증 방식: Application Default Credentials (로컬)")

# Vertex AI 초기화
vertexai.init(project=GCP_PROJECT_ID, location=GCP_REGION)

# FastAPI 앱 초기화
app = FastAPI(
    title="Pearl Image Generator",
    description="Text-to-Image Generation using Vertex AI Imagen",
    version="1.1.0"
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
        final_prompt += ", clean background"
        
        print(f"Final prompt: {final_prompt}")
        print(f"Aspect ratio: {request.aspect_ratio}")
        print(f"Guidance scale: {request.guidance_scale}")
        print(f"Seed: {request.seed}")
        
        # 실제 Vertex AI Imagen API 호출
        try:
            print(f"Calling Vertex AI Imagen API with prompt: {final_prompt}")
            
            # 모델 로드 (Imagen 3 정확한 이름으로 변경)
            model = ImageGenerationModel.from_pretrained("imagen-3.0-generate-002")
            
            # 이미지 생성
            response = model.generate_images(
                prompt=final_prompt,
                number_of_images=1,
                seed=request.seed,
                aspect_ratio=request.aspect_ratio,
                guidance_scale=request.guidance_scale,
                add_watermark=False  # 워터마크 비활성화
            )

            print("--- Full API Response DUMP ---")
            print(response)
            print("----------------------------")
            
            if not response.images:
                raise Exception("API가 이미지를 생성하지 않았습니다 (response.images is empty).")
            
            # 첫 번째 생성된 이미지 사용
            generated_image = response.images[0]

            # Vertex AI Image 객체에서 PIL Image로 변환
            # _image_bytes는 base64로 인코딩된 이미지 데이터
            img_bytes = generated_image._image_bytes
            img = Image.open(BytesIO(img_bytes))

        except Exception as api_error:
            print(f"Vertex AI Imagen API 호출 오류: {str(api_error)}")
            # 오류 발생 시 더미 이미지 생성 (백업용)
            from PIL import ImageDraw, ImageFont
            
            img = Image.new('RGB', (512, 512), color='lightcoral')
            draw = ImageDraw.Draw(img)
            
            try:
                font = ImageFont.load_default()
                error_text = f"API Error: {str(api_error)[:100]}..."
                draw.text((10, 10), error_text, fill='darkred', font=font)
                draw.text((10, 40), f"Prompt: {request.prompt[:50]}...", fill='darkred', font=font)
            except:
                draw.text((10, 250), "API Error", fill='darkred')
        
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
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"이미지 처리 중 심각한 오류가 발생했습니다: {str(img_error)}")
        
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
        "version": "1.1.0",
        "description": "Text-to-Image Generation using Vertex AI Imagen",
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