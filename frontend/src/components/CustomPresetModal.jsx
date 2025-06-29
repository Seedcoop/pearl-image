import React, { useState, useEffect } from 'react'
import { X, Save, Palette } from 'lucide-react'

const CustomPresetModal = ({ isOpen, onClose, onSave, editPreset = null, currentAssetType }) => {
  const [presetData, setPresetData] = useState({
    title: '',
    description: '',
    prompt: '',
    icon: '🎨'
  })

  const availableIcons = [
    '🎨', '📸', '✏️', '🖼️', '🌸', '🎪', '🧙', '🚀', '⚪', '🌀', 
    '🤖', '🟨', '🎭', '🏰', '🌆', '🌄', '🌈', '📦', '💎', '🔷', 
    '⭐', '🎯', '📱', '🖥️', '🔧', '🎮', '🌟', '✨', '🔥', '💫'
  ]

  useEffect(() => {
    if (editPreset) {
      setPresetData(editPreset)
    } else {
      setPresetData({
        title: '',
        description: '',
        prompt: '',
        icon: '🎨'
      })
    }
  }, [editPreset, isOpen])

  const handleSave = () => {
    if (!presetData.title.trim() || !presetData.prompt.trim()) {
      alert('제목과 프롬프트는 필수 입력 항목입니다.')
      return
    }

    const customPreset = {
      ...presetData,
      id: editPreset ? editPreset.id : `custom_${Date.now()}`,
      isCustom: true,
      assetType: currentAssetType
    }

    onSave(customPreset)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-pearl-bg-dark rounded-xl border border-pearl-border max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-pearl-border">
          <h2 className="text-pearl-text text-lg font-bold flex items-center gap-2">
            <Palette size={20} />
            {editPreset ? '프리셋 편집' : '새 프리셋 추가'}
          </h2>
          <button
            onClick={onClose}
            className="text-pearl-text-muted hover:text-pearl-text"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* 아이콘 선택 */}
          <div>
            <label className="block text-pearl-text text-sm font-medium mb-2">
              아이콘
            </label>
            <div className="grid grid-cols-10 gap-2">
              {availableIcons.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setPresetData({ ...presetData, icon })}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all ${
                    presetData.icon === icon
                      ? 'bg-pearl-primary text-white'
                      : 'bg-pearl-bg-medium hover:bg-pearl-bg-light'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* 제목 */}
          <div>
            <label className="block text-pearl-text text-sm font-medium mb-2">
              제목 *
            </label>
            <input
              type="text"
              value={presetData.title}
              onChange={(e) => setPresetData({ ...presetData, title: e.target.value })}
              className="w-full px-3 py-2 bg-pearl-bg-medium border border-pearl-border rounded-lg 
                         text-pearl-text focus:border-pearl-primary focus:outline-none"
              placeholder="예: 내 스타일"
              maxLength={20}
            />
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-pearl-text text-sm font-medium mb-2">
              설명
            </label>
            <input
              type="text"
              value={presetData.description}
              onChange={(e) => setPresetData({ ...presetData, description: e.target.value })}
              className="w-full px-3 py-2 bg-pearl-bg-medium border border-pearl-border rounded-lg 
                         text-pearl-text focus:border-pearl-primary focus:outline-none"
              placeholder="예: 따뜻한 색감의 수채화 스타일"
              maxLength={50}
            />
          </div>

          {/* 프롬프트 */}
          <div>
            <label className="block text-pearl-text text-sm font-medium mb-2">
              스타일 프롬프트 *
            </label>
            <textarea
              value={presetData.prompt}
              onChange={(e) => setPresetData({ ...presetData, prompt: e.target.value })}
              className="w-full px-3 py-2 bg-pearl-bg-medium border border-pearl-border rounded-lg 
                         text-pearl-text focus:border-pearl-primary focus:outline-none resize-none"
              placeholder="예: warm colors, watercolor painting, soft brushstrokes"
              rows={3}
              maxLength={200}
            />
            <p className="text-pearl-text-muted text-xs mt-1">
              영어 키워드로 작성하세요. 쉼표로 구분합니다.
            </p>
          </div>
        </div>

        <div className="flex gap-2 p-4 border-t border-pearl-border">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-pearl-bg-medium text-pearl-text rounded-lg 
                       hover:bg-pearl-bg-light transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-pearl-primary text-white rounded-lg 
                       hover:bg-pearl-primary-dark transition-colors flex items-center justify-center gap-2"
          >
            <Save size={16} />
            저장
          </button>
        </div>
      </div>
    </div>
  )
}

export default CustomPresetModal 