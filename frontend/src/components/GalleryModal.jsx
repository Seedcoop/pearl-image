import React, { useState, useEffect } from 'react'
import { X, Trash2, Download, Image as ImageIcon, Copy, FileText } from 'lucide-react'

const GalleryModal = ({ onClose }) => {
  const [galleryItems, setGalleryItems] = useState([])
  const [promptHistory, setPromptHistory] = useState([])
  const [activeTab, setActiveTab] = useState('images') // 'images' 또는 'prompts'

  useEffect(() => {
    loadGalleryImages()
    loadPromptHistory()
  }, [])

  const loadGalleryImages = () => {
    try {
      const items = JSON.parse(localStorage.getItem('assetGallery') || '[]')
      setGalleryItems(items)
    } catch (error) {
      console.error('갤러리 로드 실패:', error)
      // 손상된 데이터가 있을 경우 초기화
      setGalleryItems([])
      localStorage.removeItem('assetGallery')
    }
  }

  const loadPromptHistory = () => {
    try {
      const history = JSON.parse(localStorage.getItem('promptHistory') || '[]')
      setPromptHistory(history)
    } catch (error) {
      console.error('프롬프트 히스토리 로드 실패:', error)
      // 손상된 데이터가 있을 경우 초기화
      setPromptHistory([])
      localStorage.removeItem('promptHistory')
    }
  }

  const copyPrompt = (prompt) => {
    navigator.clipboard.writeText(prompt).then(() => {
      alert('프롬프트가 클립보드에 복사되었습니다!')
    }).catch(err => {
      console.error('복사 실패:', err)
      alert('복사에 실패했습니다. 브라우저에서 클립보드 접근을 허용해주세요.')
    })
  }

  const deleteItem = (id) => {
    try {
      const updatedItems = galleryItems.filter(item => item.id !== id)
      setGalleryItems(updatedItems)
      localStorage.setItem('assetGallery', JSON.stringify(updatedItems))
    } catch (error) {
      console.error('이미지 삭제 실패:', error)
      alert('이미지 삭제에 실패했습니다. 브라우저를 새로고침해주세요.')
    }
  }

  const clearGallery = () => {
    if (confirm('모든 갤러리 이미지를 삭제하시겠습니까?')) {
      try {
        setGalleryItems([])
        localStorage.removeItem('assetGallery')
      } catch (error) {
        console.error('갤러리 전체 삭제 실패:', error)
        alert('갤러리 삭제에 실패했습니다. 브라우저를 새로고침해주세요.')
      }
    }
  }

  const deletePrompt = (id) => {
    try {
      const updatedHistory = promptHistory.filter(item => item.id !== id)
      setPromptHistory(updatedHistory)
      localStorage.setItem('promptHistory', JSON.stringify(updatedHistory))
    } catch (error) {
      console.error('프롬프트 삭제 실패:', error)
      alert('프롬프트 삭제에 실패했습니다. 브라우저를 새로고침해주세요.')
    }
  }

  const clearPromptHistory = () => {
    if (confirm('모든 프롬프트 히스토리를 삭제하시겠습니까?')) {
      try {
        setPromptHistory([])
        localStorage.removeItem('promptHistory')
      } catch (error) {
        console.error('프롬프트 히스토리 전체 삭제 실패:', error)
        alert('프롬프트 히스토리 삭제에 실패했습니다. 브라우저를 새로고침해주세요.')
      }
    }
  }

  const downloadItem = (item) => {
    if (!item.imageData) return
    
    const link = document.createElement('a')
    link.href = item.imageData
    link.download = `asset_${item.id}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getAssetTypeLabel = (assetType) => {
    const labels = {
      character: '캐릭터',
      background: '배경',
      item: '아이템',
      ui: 'UI 요소'
    }
    return labels[assetType] || assetType
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-pearl-bg-dark rounded-lg shadow-xl max-w-4xl w-full max-h-full overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-pearl-border flex-shrink-0">
          <h2 className="text-pearl-text text-lg sm:text-2xl font-bold">갤러리 & 프롬프트 히스토리</h2>
          <div className="flex gap-2 sm:gap-4">
            <button 
              onClick={activeTab === 'images' ? clearGallery : clearPromptHistory}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-xs sm:text-sm"
            >
              전체 삭제
            </button>
            <button 
              onClick={onClose}
              className="text-pearl-text-muted hover:text-pearl-text transition-colors touch-manipulation"
            >
              <X size={24} />
            </button>
          </div>
        </div>
        
        {/* 탭 메뉴 */}
        <div className="flex border-b border-pearl-border">
          <button
            onClick={() => setActiveTab('images')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-semibold transition-colors ${
              activeTab === 'images'
                ? 'text-pearl-accent bg-pearl-bg-medium border-b-2 border-pearl-accent'
                : 'text-pearl-text-muted hover:text-pearl-text hover:bg-pearl-bg-light'
            }`}
          >
            <ImageIcon size={16} />
            이미지 갤러리 ({galleryItems.length})
          </button>
          <button
            onClick={() => setActiveTab('prompts')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-semibold transition-colors ${
              activeTab === 'prompts'
                ? 'text-pearl-accent bg-pearl-bg-medium border-b-2 border-pearl-accent'
                : 'text-pearl-text-muted hover:text-pearl-text hover:bg-pearl-bg-light'
            }`}
          >
            <FileText size={16} />
            프롬프트 히스토리 ({promptHistory.length})
          </button>
        </div>
        
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {activeTab === 'images' ? (
            // 이미지 갤러리 탭
            galleryItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {galleryItems.map((item) => (
                  <div key={item.id} className="bg-pearl-bg-medium rounded-lg p-3 sm:p-4 shadow-lg">
                    <div className="mb-3">
                      <img 
                        src={item.imageData || item.imagePath} 
                        alt="갤러리 이미지" 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-pearl-accent text-xs font-semibold">
                          {getAssetTypeLabel(item.assetType)}
                        </span>
                        <span className="text-pearl-text-muted text-xs">
                          {formatDate(item.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-pearl-text text-sm line-clamp-2">
                        {item.prompt}
                      </p>
                      
                      {item.preset && (
                        <p className="text-pearl-text-muted text-xs">
                          스타일: {item.preset.title}
                        </p>
                      )}
                      
                      <div className="flex gap-2 pt-2">
                        <button 
                          onClick={() => copyPrompt(item.prompt)}
                          className="flex items-center justify-center px-3 py-3 sm:py-2 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors touch-manipulation"
                        >
                          <Copy size={14} />
                        </button>
                        <button 
                          onClick={() => downloadItem(item)}
                          className="flex-1 flex items-center justify-center px-3 py-3 sm:py-2 bg-pearl-accent text-pearl-bg-dark rounded text-xs font-semibold hover:bg-yellow-600 transition-colors touch-manipulation"
                        >
                          <Download size={14} className="mr-1" />
                          다운로드
                        </button>
                        <button 
                          onClick={() => deleteItem(item.id)}
                          className="flex items-center justify-center px-3 py-3 sm:py-2 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700 transition-colors touch-manipulation"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-pearl-text-muted text-base sm:text-lg">
                  <ImageIcon size={48} className="mx-auto mb-4" />
                  저장된 에셋이 없습니다.<br />
                  에셋을 생성하면 자동으로 갤러리에 저장됩니다.
                </div>
              </div>
            )
          ) : (
            // 프롬프트 히스토리 탭
            promptHistory.length > 0 ? (
              <div className="space-y-3">
                {promptHistory.map((item) => (
                  <div key={item.id} className="bg-pearl-bg-medium rounded-lg p-3 sm:p-4 shadow-lg">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-pearl-accent text-xs font-semibold">
                          {getAssetTypeLabel(item.assetType)}
                        </span>
                        <span className="text-pearl-text-muted text-xs">
                          {formatDate(item.timestamp)}
                        </span>
                      </div>
                      
                      <div className="bg-pearl-bg-dark rounded p-3">
                        <p className="text-pearl-text text-sm leading-relaxed whitespace-pre-wrap">
                          {item.prompt}
                        </p>
                      </div>
                      
                      {item.preset && (
                        <p className="text-pearl-text-muted text-xs">
                          스타일: {item.preset.title}
                        </p>
                      )}
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => copyPrompt(item.prompt)}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors touch-manipulation"
                        >
                          <Copy size={14} className="mr-1" />
                          프롬프트 복사
                        </button>
                        <button 
                          onClick={() => deletePrompt(item.id)}
                          className="flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700 transition-colors touch-manipulation"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-pearl-text-muted text-base sm:text-lg">
                  <FileText size={48} className="mx-auto mb-4" />
                  저장된 프롬프트가 없습니다.<br />
                  이미지를 생성하면 프롬프트가 자동으로 저장됩니다.
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default GalleryModal 