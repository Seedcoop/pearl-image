// 스타일 프리셋 - 선택 시 프롬프트 뒤에 붙는 스타일 키워드
export const stylePresets = [
  { id: 'none', label: '기본', emoji: '✨', prompt: '' },
  { id: 'photo', label: '실사', emoji: '📸', prompt: 'photorealistic, ultra detailed, professional photography, realistic lighting' },
  { id: 'anime', label: '애니', emoji: '🌸', prompt: 'anime art style, cel shading, vibrant colors, japanese animation' },
  { id: 'digital', label: '디지털아트', emoji: '🎨', prompt: 'digital art, detailed illustration, professional digital painting' },
  { id: 'render3d', label: '3D 렌더', emoji: '💎', prompt: '3D render, octane render, high quality, realistic materials and lighting' },
  { id: 'pixel', label: '픽셀아트', emoji: '🟨', prompt: 'pixel art, 16-bit style, retro game, crisp pixels' },
  { id: 'watercolor', label: '수채화', emoji: '🖌️', prompt: 'watercolor painting, soft brushstrokes, flowing colors' },
  { id: 'cyberpunk', label: '사이버펑크', emoji: '🤖', prompt: 'cyberpunk style, neon colors, futuristic, high-tech' },
]

// Imagen 4가 지원하는 화면 비율
export const aspectRatios = [
  { id: '1:1', label: '정사각', hint: '1:1' },
  { id: '3:4', label: '세로', hint: '3:4' },
  { id: '4:3', label: '가로', hint: '4:3' },
  { id: '9:16', label: '와이드 세로', hint: '9:16' },
  { id: '16:9', label: '와이드 가로', hint: '16:9' },
]

// 프롬프트 입력 예시 (placeholder 회전용)
export const placeholderExamples = [
  '별이 쏟아지는 밤하늘 아래 호수',
  '네온이 빛나는 사이버펑크 도시 골목',
  '왕관을 쓴 귀여운 고양이',
  '빛나는 룬이 새겨진 판타지 검',
  '따뜻한 햇살이 드는 아늑한 카페',
]
