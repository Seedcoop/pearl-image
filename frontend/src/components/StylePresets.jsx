import React from 'react'
import { assetTypeStylePresets } from '../constants/presets'

const StylePresets = ({ currentAssetType, selectedPreset, onPresetSelect }) => {
  const presets = assetTypeStylePresets[currentAssetType] || {}

  return (
    <section>
      <h3 className="text-pearl-text text-lg font-bold leading-tight tracking-[-0.015em] mb-3">스타일 프리셋</h3>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.entries(presets).map(([key, preset]) => (
          <div
            key={key}
            className={`p-2 rounded-lg border-2 transition-all duration-300 cursor-pointer group ${
              selectedPreset === preset
                ? 'border-pearl-primary shadow-pearl-glow-strong'
                : 'border-transparent bg-pearl-bg-medium hover:border-pearl-primary hover:shadow-pearl-glow'
            }`}
            onClick={() => onPresetSelect(key)}
          >
            <div className="flex flex-col items-center text-center space-y-1">
              <div className="text-xl group-hover:scale-110 transition-transform duration-300">
                {preset.icon}
              </div>
              <h4 className="text-pearl-text font-semibold text-xs leading-tight">
                {preset.title}
              </h4>
              <p className="text-pearl-text-muted text-xs leading-snug line-clamp-2">
                {preset.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default StylePresets 