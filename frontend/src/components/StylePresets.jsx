import React from 'react'
import { Check } from 'lucide-react'
import { assetTypeStylePresets } from '../constants/presets'

const StylePresets = ({ currentAssetType, selectedPreset, onPresetSelect }) => {
  const presets = assetTypeStylePresets[currentAssetType] || {}

  return (
    <section>
      <div className="mb-3">
        <h3 className="text-pearl-text text-base sm:text-lg font-bold leading-tight tracking-[-0.015em] mb-1">스타일 프리셋</h3>
        <p className="text-pearl-text-muted text-xs">
          프리셋을 선택하면 스타일이 적용됩니다. 선택된 프리셋을 다시 클릭하면 해제됩니다.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-3">
        {Object.entries(presets).map(([key, preset]) => (
          <div
            key={key}
            className={`relative p-3 sm:p-2 rounded-lg border-2 transition-all duration-300 cursor-pointer group ${
              selectedPreset === preset
                ? 'border-pearl-primary shadow-pearl-glow-strong bg-pearl-bg-medium'
                : 'border-transparent bg-pearl-bg-medium hover:border-pearl-primary hover:shadow-pearl-glow'
            }`}
            onClick={() => onPresetSelect(key)}
          >
            {/* 선택된 프리셋 표시 */}
            {selectedPreset === preset && (
              <div className="absolute top-1 right-1 bg-pearl-primary rounded-full p-1">
                <Check size={12} className="text-white" />
              </div>
            )}
            
            <div className="flex flex-col items-center text-center space-y-1">
              <div className="text-lg sm:text-xl group-hover:scale-110 transition-transform duration-300">
                {preset.icon}
              </div>
              <h4 className={`font-semibold text-xs leading-tight ${
                selectedPreset === preset ? 'text-pearl-primary' : 'text-pearl-text'
              }`}>
                {preset.title}
              </h4>
              <p className="text-pearl-text-muted text-xs leading-snug line-clamp-2">
                {preset.description}
              </p>
              {selectedPreset === preset && (
                <p className="text-pearl-primary text-xs font-medium">
                  다시 클릭하여 해제
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default StylePresets 