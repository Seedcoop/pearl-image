import React, { useEffect, useState } from 'react'
import { assetTypePlaceholders } from '../constants/presets'

const PromptInput = ({ prompt, onPromptChange, transparentBg, onTransparentBgChange, currentAssetType }) => {
  const [placeholder, setPlaceholder] = useState('')

  useEffect(() => {
    const placeholders = assetTypePlaceholders[currentAssetType] || assetTypePlaceholders.character
    const randomPlaceholder = placeholders[Math.floor(Math.random() * placeholders.length)]
    setPlaceholder(`생성하고 싶은 에셋을 자세히 설명해주세요 (예: '${randomPlaceholder}')`)
  }, [currentAssetType])

  return (
    <section className="w-full">
      <div className="w-full bg-pearl-bg-medium rounded-lg shadow-sm space-y-3 p-3">
        <div>
          <label className="sr-only" htmlFor="prompt">에셋 설명</label>
          <textarea 
            className="flex w-full min-w-0 flex-1 resize-y overflow-hidden rounded-lg pearl-abyss-input focus:outline-none focus:ring-2 focus:ring-pearl-primary min-h-20 placeholder:text-pearl-text-muted p-3 text-sm font-normal leading-normal" 
            id="prompt" 
            name="prompt" 
            placeholder={placeholder}
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center space-x-3">
          <input 
            type="checkbox" 
            id="transparent_bg" 
            name="transparent_bg" 
            className="w-4 h-4 text-pearl-primary bg-pearl-bg-medium border-pearl-border rounded focus:ring-pearl-primary focus:ring-2"
            checked={transparentBg}
            onChange={(e) => onTransparentBgChange(e.target.checked)}
          />
          <label htmlFor="transparent_bg" className="text-pearl-text text-sm font-medium">투명 배경</label>
          <span className="text-pearl-text-muted text-xs">(에셋에 적합)</span>
        </div>
      </div>
    </section>
  )
}

export default PromptInput 