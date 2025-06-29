import React from 'react'
import { Download, Eye, Loader2, AlertCircle } from 'lucide-react'

const ResultSection = ({ isGenerating, result, error, onGalleryClick }) => {
  const handleViewGallery = () => {
    if (onGalleryClick) {
      onGalleryClick()
    }
  }

  const handleDownload = () => {
    if (!result?.image_data) return
    
    // base64 데이터를 다운로드 가능한 링크로 변환
    const link = document.createElement('a')
    link.href = result.image_data
    link.download = `generated_asset_${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isGenerating) {
    return (
      <div className="flex-1 flex justify-center items-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-pearl-primary animate-spin" />
          <p className="text-pearl-text text-lg font-medium">에셋 생성중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex justify-center items-center p-4">
        <div className="bg-red-900/20 border border-red-600 rounded-lg p-4 max-w-md w-full">
          <h3 className="text-red-400 text-lg font-bold mb-2 flex items-center gap-2">
            <AlertCircle size={20} />
            오류 발생
          </h3>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (result) {
    return (
      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        <h2 className="text-pearl-text text-lg font-bold mb-3">생성된 에셋</h2>
        
        {/* Image Container */}
        <div className="flex-1 flex justify-center items-center mb-4">
          <div className="bg-pearl-bg-medium rounded-lg p-3 shadow-lg max-w-full max-h-full">
            <div className="bg-white rounded-lg p-2" style={{
              backgroundImage: 'none',
              backgroundColor: '#f8f9fa'
            }}>
              <img 
                src={result.image_data} 
                alt="생성된 에셋" 
                className="max-w-full max-h-full h-auto rounded-lg object-contain"
                style={{
                  backgroundColor: 'transparent',
                  maxHeight: '60vh'
                }}
              />
            </div>
          </div>
        </div>

        {/* Info and Buttons */}
        <div className="space-y-3">
          <div className="bg-pearl-bg-medium p-3 rounded-lg">
            <p className="text-pearl-text-muted text-xs mb-1"><strong>프롬프트:</strong></p>
            <p className="text-pearl-text text-sm leading-relaxed">{result.prompt}</p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleDownload}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-pearl-accent text-pearl-bg-dark rounded-lg font-semibold hover:bg-yellow-600 transition-colors text-sm"
            >
              <Download className="mr-1" size={16} />
              다운로드
            </button>
            <button 
              onClick={handleViewGallery}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-pearl-primary text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm"
            >
              <Eye className="mr-1" size={16} />
              갤러리 보기
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 초기 상태 - 아무것도 없을 때
  return (
    <div className="flex-1 flex justify-center items-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-6xl opacity-20">🎨</div>
        <h3 className="text-pearl-text text-lg font-semibold">이미지를 생성해보세요</h3>
        <p className="text-pearl-text-muted text-sm leading-relaxed">
          왼쪽에서 프롬프트를 입력하고 스타일을 선택한 후 생성 버튼을 눌러주세요.
          <br />
          생성된 이미지가 여기에 표시됩니다.
        </p>
      </div>
    </div>
  )
}

export default ResultSection 