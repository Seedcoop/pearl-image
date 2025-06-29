import React, { useState, useEffect } from 'react'
import { X, Trash2, Download, Image as ImageIcon } from 'lucide-react'

const GalleryModal = ({ onClose }) => {
  const [galleryItems, setGalleryItems] = useState([])

  useEffect(() => {
    loadGalleryImages()
  }, [])

  const loadGalleryImages = () => {
    const items = JSON.parse(localStorage.getItem('assetGallery') || '[]')
    setGalleryItems(items)
  }

  const deleteItem = (id) => {
    const updatedItems = galleryItems.filter(item => item.id !== id)
    setGalleryItems(updatedItems)
    localStorage.setItem('assetGallery', JSON.stringify(updatedItems))
  }

  const clearGallery = () => {
    if (confirm('모든 갤러리 이미지를 삭제하시겠습니까?')) {
      setGalleryItems([])
      localStorage.removeItem('assetGallery')
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
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
      <div className="bg-pearl-bg-dark rounded-lg shadow-xl max-w-4xl w-11/12 max-h-5/6 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-pearl-border">
          <h2 className="text-pearl-text text-2xl font-bold">생성된 에셋 갤러리</h2>
          <div className="flex gap-4">
            <button 
              onClick={clearGallery}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              전체 삭제
            </button>
            <button 
              onClick={onClose}
              className="text-pearl-text-muted hover:text-pearl-text text-3xl transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-96">
          {galleryItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.map((item) => (
                <div key={item.id} className="bg-pearl-bg-medium rounded-lg p-4 shadow-lg">
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
                        onClick={() => downloadItem(item)}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-pearl-accent text-pearl-bg-dark rounded text-xs font-semibold hover:bg-yellow-600 transition-colors"
                      >
                        <Download size={14} className="mr-1" />
                        다운로드
                      </button>
                      <button 
                        onClick={() => deleteItem(item.id)}
                        className="flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700 transition-colors"
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
              <div className="text-pearl-text-muted text-lg">
                <ImageIcon size={48} className="mx-auto mb-4" />
                저장된 에셋이 없습니다.<br />
                에셋을 생성하고 '갤러리 저장' 버튼을 클릭하세요.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GalleryModal 