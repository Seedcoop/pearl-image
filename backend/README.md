# 🚀 Pearl Image Generator - Backend

FastAPI 기반 텍스트→이미지 생성/편집 API 서버입니다. Google **Gemini 2.5 Flash Image (Nano Banana)** 모델을 사용합니다.

> ℹ️ 구 `imagen-4.0-fast-generate-001`(Imagen 4 Fast)에서 이전했습니다. Imagen 계열은 IPM(분당 이미지) 기반이라 Tier 1의 10 IPM 천장에서 버스트가 대량 실패했고, 2026-08-17 종료 예정입니다. Nano Banana는 RPM/RPD 기반이라 버스트에 훨씬 여유롭습니다.

## 📋 환경 요구사항

- Python 3.8 이상
- Gemini API 키

## 🛠️ 설치 및 설정

### 1. 가상환경 생성 (권장)

```bash
# backend 디렉토리로 이동
cd backend

# 가상환경 생성
python -m venv venv

# 가상환경 활성화
# macOS/Linux:
source venv/bin/activate

# Windows:
venv\Scripts\activate
```

### 2. 의존성 설치

```bash
pip install -r requirements.txt
```

### 3. 환경 변수 설정

**backend 폴더에 `.env` 파일을 생성**하고 다음 내용을 추가하세요:

```env
# Gemini API Key (필수)
GEMINI_API_KEY=your_gemini_api_key_here

# 모델 (선택사항 - 기본값 gemini-2.5-flash-image)
IMAGE_MODEL=gemini-2.5-flash-image
EDIT_MODEL=gemini-2.5-flash-image

# Rate limit / 재시도 (선택사항)
# 기본값 0 = 무제한: 서버에서 조이지 않고 모든 요청을 곧장 Gemini로 보냅니다.
# Google이 실제로 429를 던지면 백엔드 백오프 재시도 + 프론트 자동 재시도가 흡수합니다.
# 다시 조이려면 값을 지정하세요. 실측 RPM은 https://aistudio.google.com/rate-limit 참고.
GENERATE_RPM=0           # /generate 분당 허용치 (0 = 무제한)
EDIT_RPM=0               # /edit 분당 허용치 (0 = 무제한)
LIMITER_MAX_WAIT=20      # 리미터 최대 대기(초). 초과 시 429 + Retry-After 즉시 반환
DEFAULT_RETRY_AFTER=10   # 재시도 지연을 못 읽었을 때의 Retry-After 기본값(초)
MODEL_RETRIES=2          # Gemini 호출 실패 시 백엔드 지수 백오프 재시도 횟수

# Server Configuration (선택사항)
HOST=0.0.0.0
PORT=8000
DEBUG=True
```

**📍 중요: `.env` 파일은 반드시 `backend/` 폴더 내에 생성해야 합니다!**

### 4. Gemini API 키 발급

1. [Google AI Studio](https://makersuite.google.com/app/apikey)에서 API 키 생성
2. 생성된 키를 `.env` 파일의 `GEMINI_API_KEY`에 입력

## 🚀 서버 실행

### 방법 1: Python으로 직접 실행

```bash
# backend 디렉토리에서 실행
cd backend
python main.py
```

### 방법 2: Uvicorn으로 실행

```bash
# backend 디렉토리에서 실행
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 방법 3: 개발 모드 (자동 재시작)

```bash
# backend 디렉토리에서 실행
cd backend
uvicorn main:app --reload
```

## 📡 API 엔드포인트

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/generate` | POST | 텍스트→이미지 생성 API (JSON) |
| `/edit` | POST | 이미지+지시→편집 API (JSON) |
| `/health` | GET | 서버 상태 확인 |
| `/api/info` | GET | API 정보 |

### API 사용 예시

```bash
curl -X POST "http://localhost:8000/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "a beautiful sunset over mountains",
    "aspect_ratio": "16:9",
    "transparent_bg": false
  }'
```

응답: `{ "success": true, "image_data": "data:image/png;base64,...", "message": "..." }`

- `aspect_ratio` 지원값: `1:1`, `3:4`, `4:3`, `9:16`, `16:9` (Nano Banana의 `image_config.aspect_ratio`로 전달)
- `transparent_bg: true`면 rembg로 AI 배경 제거 후 투명 PNG 반환
- 모델은 `IMAGE_MODEL` 환경변수로 변경 가능 (기본값 `gemini-2.5-flash-image`)

### 상태 코드

| 상황 | HTTP 상태 | 비고 |
|------|-----------|------|
| 정상 | 200 | |
| 사용량 한도 초과(rate limit) | **429** | `Retry-After` 헤더 포함 → 프론트가 자동 백오프 재시도 |
| 안전 정책 위반 | 422 | |
| API 키/권한 문제 | 502 | 관리자 문의 안내 |
| 그 외 오류 | 500 | |

## 🗂️ 생성된 이미지 저장

- 생성된 이미지는 `backend/generated_images/` 폴더에 자동 저장됩니다
- 파일명 형식: `generated_YYYYMMDD_HHMMSS.png`

## 🔧 문제 해결

### 1. ModuleNotFoundError

```bash
# 가상환경이 활성화되어 있는지 확인
which python

# 의존성 재설치
pip install -r requirements.txt
```

### 2. API 키 오류

- `.env` 파일이 `backend/` 폴더에 있는지 확인
- `GEMINI_API_KEY` 값이 올바른지 확인

### 3. 포트 사용 중 오류

```bash
# 다른 포트로 실행
uvicorn main:app --port 8001
```

### 4. Frontend 파일 못 찾는 오류

```bash
# 프로젝트 루트에서 실행하지 말고 backend 폴더에서 실행
cd backend
python main.py
```

## 📁 디렉토리 구조

```
backend/
├── main.py              # FastAPI 메인 애플리케이션
├── requirements.txt     # Python 의존성
├── .env                # 환경 변수 (직접 생성)
├── generated_images/   # 생성된 이미지 저장소 (자동 생성)
└── README.md           # 이 파일
```

## 🔐 보안 주의사항

- `.env` 파일을 Git에 커밋하지 마세요
- API 키를 코드에 직접 하드코딩하지 마세요
- 프로덕션 환경에서는 HTTPS 사용을 권장합니다 