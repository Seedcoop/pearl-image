import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const AdvancedSettings = ({ 
  aspectRatio, 
  onAspectRatioChange, 
  guidanceScale, 
  onGuidanceScaleChange, 
  seed, 
  onSeedChange 
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleSeedDoubleClick = () => {
    onSeedChange(Math.floor(Math.random() * 2147483647))
  }

  const handleGuidanceScaleChange = (e) => {
    const value = parseFloat(e.target.value)
    onGuidanceScaleChange(value)
  }

  const guidancePercentage = ((guidanceScale - 1) / (20 - 1)) * 100

  return (
    <section>
      <details className="group" open={isOpen}>
        <summary 
          className="flex items-center justify-between cursor-pointer list-none py-2 text-pearl-text-muted hover:text-pearl-text transition-colors"
          onClick={(e) => {
            e.preventDefault()
            setIsOpen(!isOpen)
          }}
        >
          <h3 className="text-base sm:text-lg font-bold leading-tight tracking-[-0.015em]">고급 설정</h3>
          <ChevronDown 
            className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            size={18}
          />
        </summary>
        
        {isOpen && (
          <div className="mt-3 space-y-4 bg-pearl-bg-medium p-4 sm:p-3 rounded-lg shadow-inner">
            {/* Aspect Ratio */}
            <div>
              <label className="text-pearl-text text-sm sm:text-xs font-medium leading-normal block mb-2 sm:mb-1" htmlFor="aspect_ratio">
                화면 비율
              </label>
              <select 
                id="aspect_ratio" 
                name="aspect_ratio" 
                className="w-full p-3 sm:p-2 text-sm rounded-lg pearl-abyss-input focus:outline-none focus:ring-2 focus:ring-pearl-primary"
                value={aspectRatio}
                onChange={(e) => onAspectRatioChange(e.target.value)}
              >
                <option value="1:1">1:1 (정사각형)</option>
                <option value="16:9">16:9 (가로형)</option>
                <option value="9:16">9:16 (세로형)</option>
                <option value="4:3">4:3 (일반 가로)</option>
                <option value="3:4">3:4 (일반 세로)</option>
              </select>
            </div>

            {/* Seed */}
            <div>
              <label className="text-pearl-text text-sm sm:text-xs font-medium leading-normal block mb-2 sm:mb-1" htmlFor="seed">
                시드 (선택사항)
              </label>
              <input 
                type="number" 
                id="seed" 
                name="seed" 
                placeholder="0 (랜덤)" 
                min="0" 
                max="2147483647" 
                value={seed}
                onChange={(e) => onSeedChange(parseInt(e.target.value) || 0)}
                onDoubleClick={handleSeedDoubleClick}
                className="w-full p-3 sm:p-2 text-sm rounded-lg pearl-abyss-input focus:outline-none focus:ring-2 focus:ring-pearl-primary"
                title="더블클릭하면 랜덤 시드 생성"
              />
            </div>

            {/* Guidance Scale Slider */}
            <div className="space-y-2">
              <label className="text-pearl-text text-xs font-medium leading-normal" htmlFor="guidance_scale">
                가이던스 스케일: <span className="text-pearl-accent font-bold">{guidanceScale}</span>
              </label>
              <div className="flex h-2 w-full items-center bg-pearl-bg-light rounded-full relative">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-pearl-primary to-pearl-accent transition-all duration-300"
                  style={{ width: `${guidancePercentage}%` }}
                />
                <input 
                  className="absolute w-full h-full appearance-none bg-transparent focus:outline-none cursor-pointer" 
                  id="guidance_scale" 
                  name="guidance_scale"
                  type="range" 
                  min="1" 
                  max="20" 
                  step="0.5" 
                  value={guidanceScale}
                  onChange={handleGuidanceScaleChange}
                />
              </div>
              <p className="text-pearl-text-muted text-xs leading-normal">
                낮을수록 창의적, 높을수록 프롬프트에 충실
              </p>
            </div>
          </div>
        )}
      </details>
    </section>
  )
}

export default AdvancedSettings 