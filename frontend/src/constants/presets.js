// 스타일 프리셋 - 게임 에셋 제작에 맞춘 상세 프롬프트.
// 선택 시 사용자 프롬프트 뒤에 style 키워드가 붙습니다.
export const stylePresets = [
  {
    id: 'none',
    label: '기본',
    emoji: '✨',
    prompt: '',
  },
  {
    id: 'cartoon',
    label: '카툰',
    emoji: '🎨',
    prompt:
      'cute cartoon game asset, bold clean outlines, bright saturated colors, soft cel shading, smooth gradients, friendly appealing design, centered composition, plain background, high quality 2D game art',
  },
  {
    id: 'pixel',
    label: '픽셀아트',
    emoji: '🟨',
    prompt:
      '16-bit pixel art game sprite, crisp clean pixels, limited retro color palette, clear silhouette, sharp dithering, side-scroller game asset, centered, plain background, no anti-aliasing',
  },
  {
    id: 'chibi',
    label: '치비',
    emoji: '🧸',
    prompt:
      'chibi style character, big head small body, huge expressive eyes, adorable kawaii design, thick clean outlines, pastel and vivid colors, mobile game character asset, centered, plain background',
  },
  {
    id: 'fantasy',
    label: '판타지',
    emoji: '🧙',
    prompt:
      'fantasy RPG game art, richly detailed, magical glowing accents, dramatic lighting, painterly digital illustration, epic adventure style, concept art quality, centered composition, plain background',
  },
  {
    id: 'render3d',
    label: '3D 렌더',
    emoji: '💎',
    prompt:
      'stylized 3D rendered game asset, smooth clean topology, soft studio lighting, subtle ambient occlusion, glossy polished materials, mobile game 3D icon style, octane render, centered, plain background',
  },
  {
    id: 'icon',
    label: '아이콘',
    emoji: '⭐',
    prompt:
      'game UI item icon, single centered object, bold readable silhouette, clean vector-like shading, soft inner glow and rim light, polished mobile game inventory icon, dark neutral background, high contrast',
  },
  {
    id: 'isometric',
    label: '아이소메트릭',
    emoji: '📦',
    prompt:
      'isometric game asset, 2:1 isometric perspective, clean geometric shapes, soft directional lighting, tidy stylized textures, tile-based strategy game art, centered, plain background',
  },
  {
    id: 'anime',
    label: '애니',
    emoji: '🌸',
    prompt:
      'anime style illustration, clean crisp line art, vibrant cel shading, expressive detailed eyes, dynamic shading, high quality Japanese game character art, centered, plain background',
  },
  {
    id: 'watercolor',
    label: '수채화',
    emoji: '🖌️',
    prompt:
      'soft watercolor illustration, gentle flowing brushstrokes, delicate pastel palette, textured paper feel, dreamy storybook game art, centered composition, light background',
  },
  {
    id: 'photo',
    label: '실사',
    emoji: '📸',
    prompt:
      'photorealistic render, ultra detailed textures, realistic physically based lighting, sharp focus, high dynamic range, professional product photography quality, centered, clean background',
  },
]

// Imagen 4가 지원하는 화면 비율
export const aspectRatios = [
  { id: '1:1', label: '정사각', hint: '1:1' },
  { id: '3:4', label: '세로', hint: '3:4' },
  { id: '4:3', label: '가로', hint: '4:3' },
  { id: '9:16', label: '와이드 세로', hint: '9:16' },
  { id: '16:9', label: '와이드 가로', hint: '16:9' },
]

// 생성 모드 프롬프트 예시 (placeholder 회전)
export const generateExamples = [
  '왕관을 쓴 귀여운 고양이 캐릭터',
  '빛나는 룬이 새겨진 마법 검 아이템',
  '통통한 초록 슬라임 몬스터',
  '작은 나무 보물 상자',
  '불꽃을 두른 작은 드래곤',
]

// 편집 모드 빠른 지시 프리셋 (아이들이 클릭 한 번으로 사용)
export const editQuickActions = [
  { label: '점프 포즈로', prompt: 'Change the pose so the character is jumping energetically in the air, dynamic action pose. Keep the exact same character design and art style.' },
  { label: '달리는 포즈로', prompt: 'Change the pose so the character is running fast to the side, dynamic running motion. Keep the exact same character design and art style.' },
  { label: '앉은 포즈로', prompt: 'Change the pose so the character is sitting down calmly. Keep the exact same character design and art style.' },
  { label: '웃는 표정으로', prompt: 'Change the facial expression to a big happy smile. Keep everything else exactly the same.' },
  { label: '화난 표정으로', prompt: 'Change the facial expression to an angry determined look. Keep everything else exactly the same.' },
  { label: '좌우 반전', prompt: 'Flip the character to face the opposite direction (mirror it horizontally). Keep the exact same design and art style.' },
  { label: '색상 바꾸기', prompt: 'Recolor the main outfit/body to a different vibrant color while keeping the same character and art style.' },
  { label: '배경 지우기', prompt: 'Remove the background completely and place the character on a plain solid white background.' },
]

// 편집 모드 placeholder 예시
export const editExamples = [
  '칼을 들고 있는 자세로 바꿔줘',
  '모자를 씌워줘',
  '더 활짝 웃게 해줘',
  '망토를 둘러줘',
]
