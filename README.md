# 🎮 Pearl Asset Generator

Pearl Abyss 스타일의 게임 에셋 생성기입니다. Gemini Imagen 3 API를 활용하여 고품질의 2D 게임 에셋을 생성할 수 있습니다.

## ✨ 주요 기능

### 🎯 에셋 타입별 특화 생성
- **캐릭터**: 게임 캐릭터 (9가지 스타일)
- **배경**: 게임 환경 및 배경 (9가지 스타일)
- **아이템**: 게임 아이템 및 오브젝트 (9가지 스타일)
- **UI 요소**: 게임 인터페이스 컴포넌트 (9가지 스타일)

### 🎨 스타일 프리셋 (36가지)
각 에셋 타입별로 전문화된 스타일:
- 애니메이션, 리얼리스틱, 픽셀 아트, 카툰, 수채화, 유화, 판타지, 사이버펑크, 일러스트레이션 등

### ⚙️ 고급 설정
- **화면 비율**: 1:1, 16:9, 9:16, 4:3, 3:4
- **가이던스 스케일**: 1-20 (창의성 vs 프롬프트 충실도)
- **시드 값**: 재현 가능한 결과를 위한 시드 설정
- **투명 배경**: PNG 투명 배경 생성 옵션
- **안전 필터**: 높은 수준의 컨텐츠 필터링 (BLOCK_MOST)

### 🖼️ 갤러리 시스템
- 로컬 스토리지 기반 이미지 저장
- 메타데이터 포함 (에셋 타입, 생성 날짜, 프롬프트, 스타일)
- 개별 다운로드/삭제 기능
- 갤러리 전체 관리

## 🛠️ 기술 스택

### Backend
- **FastAPI** - Python 웹 프레임워크
- **Gemini Imagen 3** - Google의 이미지 생성 AI
- **Uvicorn** - ASGI 서버
- **Pydantic** - 데이터 검증

### Frontend
- **React 18** - UI 라이브러리
- **Vite** - 빌드 도구 및 개발 서버
- **Tailwind CSS** - 유틸리티 우선 CSS 프레임워크
- **Lucide React** - 아이콘 라이브러리
- **Axios** - HTTP 클라이언트

## 🚀 시작하기

### 📋 사전 요구사항
- Python 3.9+
- Node.js 18+
- Gemini API 키

### 🔧 설치 및 설정

#### 1. 저장소 클론
```bash
git clone <repository-url>
cd pearl-image-gen
```

#### 2. Backend 설정
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### 3. 환경 변수 설정
```bash
# backend/.env 파일 생성
GEMINI_API_KEY=your_gemini_api_key_here
```

#### 4. Frontend 설정
```bash
cd ../frontend
npm install
```

### 🏃‍♂️ 개발 서버 실행

#### Backend 서버 (포트 8000)
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python main.py
```

#### Frontend 서버 (포트 3000)
```bash
cd frontend
npm run dev
```

앱이 http://localhost:3000 에서 실행됩니다.

## 📁 프로젝트 구조

```
pearl-image-gen/
├── backend/                 # FastAPI 백엔드
│   ├── main.py             # 메인 서버 파일
│   ├── requirements.txt    # Python 의존성
│   ├── generated_images/   # 생성된 이미지 저장소
│   └── README.md          # 백엔드 문서
├── frontend/               # React 프론트엔드
│   ├── src/
│   │   ├── components/    # React 컴포넌트
│   │   ├── constants/     # 상수 정의
│   │   ├── App.jsx       # 메인 앱 컴포넌트
│   │   └── main.jsx      # 앱 진입점
│   ├── package.json      # Node.js 의존성
│   ├── vite.config.js    # Vite 설정
│   └── README.md         # 프론트엔드 문서
└── README.md             # 이 파일
```

## 🎨 Pearl Abyss 디자인 테마

Pearl Abyss 게임 스튜디오의 시각적 언어에서 영감을 받은 다크 테마:

### 색상 팔레트
- **Primary**: #D63F27 (시그니처 레드)
- **Accent**: #E0A025 (골드 엑센트)
- **Background**: #0D1117 (다크 백그라운드)
- **Surface**: #161B22 (카드/패널)
- **Border**: #30363D (구분선)

### 디자인 특징
- 다크 테마 기반
- 그라디언트 효과
- 부드러운 애니메이션
- 반응형 디자인
- 모던 카드 인터페이스

## 📱 반응형 지원

모든 디바이스에서 최적화된 경험:
- 📱 **모바일** (320px+)
- 📱 **태블릿** (768px+)
- 💻 **데스크톱** (1024px+)

## 🔒 보안 및 안전

- **높은 수준의 안전 필터** (BLOCK_MOST)
- **컨텐츠 정책 준수**
- **사용자 데이터 보호**
- **XSS 방지**

## 🚀 배포

이 프로젝트는 **Railway (백엔드)**와 **Vercel (프론트엔드)**로 배포하도록 최적화되어 있습니다.

### 📖 자세한 배포 가이드
**[DEPLOYMENT.md](DEPLOYMENT.md)**에서 단계별 배포 방법을 확인하세요.

### 🔗 배포 플랫폼
- **백엔드**: [Railway](https://railway.app) - FastAPI 서버
- **프론트엔드**: [Vercel](https://vercel.com) - React SPA

### ⚡ 빠른 배포 단계
1. **GitHub에 코드 업로드**
2. **Railway에서 백엔드 배포** (Root Directory: `backend`)
3. **Vercel에서 프론트엔드 배포** (Root Directory: `frontend`)
4. **환경변수 설정**
   - Railway: `GEMINI_API_KEY`
   - Vercel: `VITE_API_URL`

### 🔄 자동 배포
- GitHub에 push하면 자동으로 재배포됩니다
- 각 플랫폼에서 빌드 로그를 확인할 수 있습니다

## 🤝 기여하기

1. 이 저장소를 포크하세요
2. 새로운 기능 브랜치를 만드세요 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋하세요 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성하세요

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙏 감사의 말

- **Pearl Abyss** - 디자인 영감을 제공
- **Google Gemini** - 강력한 이미지 생성 API
- **React 커뮤니티** - 훌륭한 생태계
- **FastAPI** - 빠르고 현대적인 웹 프레임워크

## 📞 지원

문제가 발생하거나 질문이 있으시면 [Issues](../../issues) 페이지에서 문의해주세요.

---

**🎮 게임 개발을 위한 AI 에셋 생성의 새로운 경험을 만나보세요!** 