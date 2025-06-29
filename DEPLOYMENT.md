# 🚀 배포 가이드

## 프로젝트 구조
```
pearl-image-gen/
├── backend/          # FastAPI 백엔드
├── frontend/         # React 프론트엔드
└── DEPLOYMENT.md     # 이 파일
```

## 🔧 배포 전 준비사항

### 1. GitHub Repository 설정
- 프로젝트를 GitHub에 push
- backend/ 와 frontend/ 폴더가 루트에 있어야 함

### 2. 환경변수 준비
- **백엔드**: `GEMINI_API_KEY` 또는 `GOOGLE_API_KEY`
- **프론트엔드**: `VITE_API_URL`

---

## 🚂 백엔드 배포 (Railway)

### 1. Railway 계정 생성
- [Railway](https://railway.app) 회원가입
- GitHub 연결

### 2. 새 프로젝트 생성
1. "New Project" 클릭
2. "Deploy from GitHub repo" 선택
3. 해당 repository 선택
4. **Root Directory**: `backend` 설정 ⚠️

### 3. 환경변수 설정
Railway 대시보드에서:
```
GEMINI_API_KEY=your_gemini_api_key_here
PORT=8000
```

### 4. 배포 완료
- Railway가 자동으로 빌드하고 배포
- 배포 URL 확인 (예: `https://pearl-backend-xxxx.railway.app`)

---

## ⚡ 프론트엔드 배포 (Vercel)

### 1. Vercel 계정 생성
- [Vercel](https://vercel.com) 회원가입
- GitHub 연결

### 2. 새 프로젝트 생성
1. "New Project" 클릭
2. GitHub repository 선택
3. **Root Directory**: `frontend` 설정 ⚠️
4. Framework Preset: "Vite" 자동 감지

### 3. 환경변수 설정
Vercel 대시보드에서:
```
VITE_API_URL=https://your-railway-backend-url.railway.app
```

### 4. 배포 설정
```json
// vercel.json (frontend 폴더에 생성)
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 5. 배포 완료
- Vercel이 자동으로 빌드하고 배포
- 배포 URL 확인 (예: `https://your-app.vercel.app`)

---

## 🔒 보안 설정

### 백엔드 CORS 수정 (배포 후)
`backend/main.py`에서 CORS 설정을 특정 도메인으로 제한:
```python
allow_origins=[
    "https://your-vercel-app.vercel.app",  # 실제 Vercel 도메인
    "http://localhost:5173",  # 개발용
],
```

---

## 📝 배포 순서

1. **GitHub에 코드 push**
2. **Railway에서 백엔드 배포** → URL 확인
3. **Vercel 환경변수에 백엔드 URL 설정**
4. **Vercel에서 프론트엔드 배포**
5. **백엔드 CORS 설정에 프론트엔드 URL 추가**

---

## 🛠️ 개발 환경 설정

### 로컬 환경변수 (개발용)
```bash
# frontend/.env.local
VITE_API_URL=http://localhost:8000

# backend/.env
GEMINI_API_KEY=your_api_key_here
```

### 로컬 실행
```bash
# 백엔드 (Terminal 1)
cd backend
pip install -r requirements.txt
python main.py

# 프론트엔드 (Terminal 2)
cd frontend
npm install
npm run dev
```

---

## ⚠️ 주의사항

1. **Root Directory 설정 필수**: Railway와 Vercel 모두 올바른 폴더 지정
2. **환경변수 대소문자**: 정확히 입력
3. **CORS 설정**: 보안을 위해 실제 도메인만 허용
4. **API Key 보안**: 절대 코드에 하드코딩하지 말 것

---

## 🔄 업데이트 방법

1. GitHub에 코드 push
2. Railway/Vercel이 자동으로 재배포
3. 환경변수 변경 시 플랫폼에서 직접 수정

---

## 🆘 문제 해결

### 일반적인 오류들
- **CORS 오류**: 백엔드 CORS 설정 확인
- **404 오류**: Root Directory 설정 확인
- **API 연결 실패**: 환경변수 URL 확인
- **빌드 실패**: package.json/requirements.txt 확인 