# Pearl Asset Generator - React Frontend

React 기반의 게임 에셋 생성기 프론트엔드입니다.

## 🚀 Quick Start

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

프론트엔드가 http://localhost:3000 에서 실행됩니다.

### 3. 빌드 (배포용)
```bash
npm run build
```

빌드된 파일은 `dist/` 폴더에 생성됩니다.

## 📁 프로젝트 구조

```
frontend/
├── src/
│   ├── components/          # React 컴포넌트들
│   │   ├── Header.jsx
│   │   ├── AssetTypeTabs.jsx
│   │   ├── StylePresets.jsx
│   │   ├── PromptInput.jsx
│   │   ├── AdvancedSettings.jsx
│   │   ├── GenerateButton.jsx
│   │   ├── ResultSection.jsx
│   │   └── GalleryModal.jsx
│   ├── constants/           # 상수 정의
│   │   └── presets.js
│   ├── App.jsx             # 메인 앱 컴포넌트
│   ├── main.jsx            # 앱 진입점
│   └── index.css           # 전역 스타일
├── public/                 # 정적 파일
├── index.html             # HTML 템플릿
├── package.json           # 의존성 관리
├── vite.config.js         # Vite 설정
└── tailwind.config.js     # Tailwind CSS 설정
```

## 🎨 기술 스택

- **React 18** - UI 라이브러리
- **Vite** - 빌드 도구
- **Tailwind CSS** - 스타일링
- **Lucide React** - 아이콘
- **Axios** - HTTP 클라이언트

## 🎮 주요 기능

### 에셋 타입
- **캐릭터**: 게임 캐릭터 생성
- **배경**: 게임 배경 환경 생성
- **아이템**: 게임 아이템 생성
- **UI 요소**: 게임 UI 컴포넌트 생성

### 스타일 프리셋
각 에셋 타입별로 9가지 전문 스타일 제공:
- 애니메이션, 리얼리스틱, 픽셀 아트, 카툰, 수채화, 유화, 판타지, 사이버펑크, 일러스트레이션 등

### 고급 설정
- **화면 비율**: 1:1, 16:9, 9:16, 4:3, 3:4
- **가이던스 스케일**: 1-20 (창의성 vs 프롬프트 충실도)
- **시드**: 재현 가능한 생성을 위한 시드 값
- **투명 배경**: PNG 투명 배경 옵션

### 갤러리 시스템
- 로컬 스토리지 기반 이미지 저장
- 메타데이터 포함 (에셋 타입, 생성 날짜, 프롬프트, 스타일)
- 개별 다운로드/삭제 기능
- 전체 갤러리 관리

## 🔧 개발 모드

개발 모드에서는 백엔드(8000포트)와 프론트엔드(3000포트)가 분리되어 실행됩니다.

### 백엔드 연동
Vite 프록시 설정으로 API 요청이 자동으로 백엔드로 전달됩니다:
- `/generate` → `http://localhost:8000/generate`
- `/static` → `http://localhost:8000/static`

## 🎨 Pearl Abyss 테마

Pearl Abyss 게임 스튜디오의 디자인 언어를 기반으로 한 다크 테마:
- **Primary**: #D63F27 (빨간색)
- **Accent**: #E0A025 (노란색)
- **Background**: #0D1117 (다크)
- **Cards**: #161B22 (중간)
- **Borders**: #30363D (테두리)

## 📱 반응형 디자인

모바일, 태블릿, 데스크톱 환경에서 최적화된 반응형 디자인을 제공합니다.

## 🔒 보안

- 안전 필터 레벨 고정 (BLOCK_MOST)
- 클라이언트 사이드 데이터 검증
- XSS 방지를 위한 컨텐츠 보안 정책

## 🚀 배포

1. 빌드 생성:
```bash
npm run build
```

2. 백엔드에서 빌드된 파일 서빙:
```python
# backend/main.py에서 주석 해제
app.mount("/static", StaticFiles(directory="../frontend/dist/assets"), name="static")

@app.get("/", response_class=HTMLResponse)
async def home():
    return FileResponse("../frontend/dist/index.html")
```

## 🤝 기여하기

1. 이 저장소를 포크하세요
2. 새로운 기능 브랜치를 만드세요 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋하세요 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성하세요

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 🙏 감사의 말

- Pearl Abyss 디자인 시스템에서 영감을 받았습니다
- Gemini Imagen 3 API를 통한 이미지 생성 기능 제공
- React 및 Tailwind CSS 커뮤니티의 지원 