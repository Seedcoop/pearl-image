# 🚀 Pearl Image Generator - Backend

FastAPI를 기반으로 한 Gemini Imagen 3 API 서버입니다.

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
| `/` | GET | 메인 웹 인터페이스 (Frontend) |
| `/generate-image` | POST | 이미지 생성 API |
| `/health` | GET | 서버 상태 확인 |
| `/api/info` | GET | API 정보 |

### API 사용 예시

```bash
curl -X POST "http://localhost:8000/generate-image" \
  -H "Content-Type: multipart/form-data" \
  -F "prompt=A beautiful sunset over mountains" \
  -F "negative_prompt=blurry, low quality" \
  -F "aspect_ratio=16:9" \
  -F "style=photographic"
```

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