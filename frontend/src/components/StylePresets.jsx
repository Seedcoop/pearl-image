import React, { useState, useEffect } from 'react'
import { Check, Plus, Edit, Trash2 } from 'lucide-react'
import { assetTypeStylePresets } from '../constants/presets'
import CustomPresetModal from './CustomPresetModal'

const StylePresets = ({ currentAssetType, selectedPreset, onPresetSelect }) => {
  const [customPresets, setCustomPresets] = useState({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPreset, setEditingPreset] = useState(null)

  const presets = assetTypeStylePresets[currentAssetType] || {}

  // 로컬 스토리지에서 사용자 정의 프리셋 로드
  useEffect(() => {
    const savedPresets = localStorage.getItem('customStylePresets')
    if (savedPresets) {
      try {
        const parsed = JSON.parse(savedPresets)
        setCustomPresets(parsed)
      } catch (error) {
        console.error('사용자 정의 프리셋 로드 오류:', error)
      }
    }
  }, [])

  // 사용자 정의 프리셋 저장
  const saveCustomPresets = (presets) => {
    localStorage.setItem('customStylePresets', JSON.stringify(presets))
    setCustomPresets(presets)
  }

  // 현재 에셋 타입의 사용자 정의 프리셋만 필터링
  const currentCustomPresets = Object.entries(customPresets).filter(
    ([key, preset]) => preset.assetType === currentAssetType
  )

  // 프리셋 저장 핸들러
  const handleSavePreset = (customPreset) => {
    const updatedPresets = {
      ...customPresets,
      [customPreset.id]: customPreset
    }
    saveCustomPresets(updatedPresets)
  }

  // 프리셋 편집 핸들러
  const handleEditPreset = (preset) => {
    setEditingPreset(preset)
    setIsModalOpen(true)
  }

  // 프리셋 삭제 핸들러
  const handleDeletePreset = (presetId) => {
    if (confirm('이 프리셋을 삭제하시겠습니까?')) {
      const updatedPresets = { ...customPresets }
      delete updatedPresets[presetId]
      saveCustomPresets(updatedPresets)
      
      // 삭제된 프리셋이 현재 선택된 프리셋이라면 선택 해제
      if (selectedPreset && selectedPreset.id === presetId) {
        onPresetSelect(null)
      }
    }
  }

  // 프리셋 선택 핸들러
  const handlePresetClick = (key, preset) => {
    if (preset.isCustom) {
      // 사용자 정의 프리셋의 경우
      if (selectedPreset && selectedPreset.id === preset.id) {
        onPresetSelect(null) // 이미 선택된 프리셋이면 해제
      } else {
        onPresetSelect(preset) // 새로운 프리셋 선택
      }
    } else {
      // 기본 프리셋의 경우
      onPresetSelect(key)
    }
  }

  // 프리셋이 선택되었는지 확인
  const isPresetSelected = (key, preset) => {
    if (preset.isCustom) {
      return selectedPreset && selectedPreset.id === preset.id
    } else {
      return selectedPreset === preset
    }
  }

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingPreset(null)
  }

  return (
    <section>
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-pearl-text text-base sm:text-lg font-bold leading-tight tracking-[-0.015em]">
            스타일 프리셋
          </h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-pearl-primary text-white 
                       rounded-lg hover:bg-pearl-primary-dark transition-colors"
          >
            <Plus size={14} />
            추가
          </button>
        </div>
        <p className="text-pearl-text-muted text-xs">
          프리셋을 선택하면 스타일이 적용됩니다. 선택된 프리셋을 다시 클릭하면 해제됩니다.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-3">
        {/* 기본 프리셋 */}
        {Object.entries(presets).map(([key, preset]) => (
          <div
            key={key}
            className={`relative p-3 sm:p-2 rounded-lg border-2 transition-all duration-300 cursor-pointer group ${
              isPresetSelected(key, preset)
                ? 'border-pearl-primary shadow-pearl-glow-strong bg-pearl-bg-medium'
                : 'border-transparent bg-pearl-bg-medium hover:border-pearl-primary hover:shadow-pearl-glow'
            }`}
            onClick={() => handlePresetClick(key, preset)}
          >
            {/* 선택된 프리셋 표시 */}
            {isPresetSelected(key, preset) && (
              <div className="absolute top-1 right-1 bg-pearl-primary rounded-full p-1">
                <Check size={12} className="text-white" />
              </div>
            )}
            
            <div className="flex flex-col items-center text-center space-y-1">
              <div className="text-lg sm:text-xl group-hover:scale-110 transition-transform duration-300">
                {preset.icon}
              </div>
              <h4 className={`font-semibold text-xs leading-tight ${
                isPresetSelected(key, preset) ? 'text-pearl-primary' : 'text-pearl-text'
              }`}>
                {preset.title}
              </h4>
              <p className="text-pearl-text-muted text-xs leading-snug line-clamp-2">
                {preset.description}
              </p>
              {isPresetSelected(key, preset) && (
                <p className="text-pearl-primary text-xs font-medium">
                  다시 클릭하여 해제
                </p>
              )}
            </div>
          </div>
        ))}

        {/* 사용자 정의 프리셋 */}
        {currentCustomPresets.map(([key, preset]) => (
          <div
            key={key}
            className={`relative p-3 sm:p-2 rounded-lg border-2 transition-all duration-300 cursor-pointer group ${
              isPresetSelected(key, preset)
                ? 'border-pearl-primary shadow-pearl-glow-strong bg-pearl-bg-medium'
                : 'border-transparent bg-pearl-bg-medium hover:border-pearl-primary hover:shadow-pearl-glow'
            }`}
            onClick={() => handlePresetClick(key, preset)}
          >
            {/* 선택된 프리셋 표시 */}
            {isPresetSelected(key, preset) && (
              <div className="absolute top-1 right-1 bg-pearl-primary rounded-full p-1">
                <Check size={12} className="text-white" />
              </div>
            )}

            {/* 사용자 정의 프리셋 컨트롤 버튼 */}
            <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleEditPreset(preset)
                }}
                className="bg-pearl-bg-dark bg-opacity-80 text-pearl-text-muted hover:text-pearl-text 
                           rounded p-1 transition-colors"
                title="편집"
              >
                <Edit size={10} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeletePreset(preset.id)
                }}
                className="bg-pearl-bg-dark bg-opacity-80 text-red-400 hover:text-red-300 
                           rounded p-1 transition-colors"
                title="삭제"
              >
                <Trash2 size={10} />
              </button>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-1">
              <div className="text-lg sm:text-xl group-hover:scale-110 transition-transform duration-300">
                {preset.icon}
              </div>
              <h4 className={`font-semibold text-xs leading-tight ${
                isPresetSelected(key, preset) ? 'text-pearl-primary' : 'text-pearl-text'
              }`}>
                {preset.title}
              </h4>
              <p className="text-pearl-text-muted text-xs leading-snug line-clamp-2">
                {preset.description}
              </p>
              {isPresetSelected(key, preset) && (
                <p className="text-pearl-primary text-xs font-medium">
                  다시 클릭하여 해제
                </p>
              )}
            </div>

            {/* 사용자 정의 프리셋 표시 */}
            <div className="absolute bottom-1 right-1 text-xs text-pearl-text-muted opacity-60">
              ✨
            </div>
          </div>
        ))}
      </div>

      {/* 사용자 정의 프리셋 모달 */}
      <CustomPresetModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSavePreset}
        editPreset={editingPreset}
        currentAssetType={currentAssetType}
      />
    </section>
  )
}

export default StylePresets 