import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import AssetTypeTabs from './components/AssetTypeTabs'
import StylePresets from './components/StylePresets'
import PromptInput from './components/PromptInput'
import AdvancedSettings from './components/AdvancedSettings'
import GenerateButton from './components/GenerateButton'
import ResultSection from './components/ResultSection'
import GalleryModal from './components/GalleryModal'
import { assetTypeStylePresets } from './constants/presets'

function App() {
  const [currentAssetType, setCurrentAssetType] = useState('free')
  const [selectedPreset, setSelectedPreset] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [transparentBg, setTransparentBg] = useState(false)
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [guidanceScale, setGuidanceScale] = useState(7.5)
  const [seed, setSeed] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [showGallery, setShowGallery] = useState(false)

  // 에셋 타입 변경 시 프리셋 리셋
  const handleAssetTypeChange = (assetType) => {
    setCurrentAssetType(assetType)
    setSelectedPreset(null)
  }

  // 프리셋 선택
  const handlePresetSelect = (presetKey) => {
    const presets = assetTypeStylePresets[currentAssetType] || {}
    setSelectedPreset(presets[presetKey] || null)
  }

  // 이미지 생성
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('프롬프트를 입력해주세요.')
      return
    }

    setIsGenerating(true)
    setError(null)
    setResult(null)

    try {
      let finalPrompt = prompt
      if (selectedPreset && selectedPreset.prompt) {
        finalPrompt = prompt + ', ' + selectedPreset.prompt
      }

      const API_URL = import.meta.env.VITE_API_URL || 'https://pearl-image-production.up.railway.app'
      // 캐시 무시를 위한 timestamp 추가
      const timestamp = Date.now()
      const response = await fetch(`${API_URL}/generate?t=${timestamp}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        cache: 'no-store', // 브라우저 캐시 완전히 무시
        body: JSON.stringify({
          prompt: finalPrompt,
          aspect_ratio: aspectRatio,
          guidance_scale: guidanceScale,
          seed: seed,
          transparent_bg: transparentBg
        })
      })

      const data = await response.json()

      if (data.success) {
        const newResult = {
          image_data: data.image_data,
          prompt: finalPrompt,
          timestamp: new Date().toISOString(),
          assetType: currentAssetType,
          preset: selectedPreset
        }
        
        setResult(newResult)
        
        // 자동으로 갤러리에 저장 (용량 제한 적용)
        try {
          const galleryItems = JSON.parse(localStorage.getItem('assetGallery') || '[]')
          const newItem = {
            id: Date.now(),
            imageData: newResult.image_data,
            prompt: newResult.prompt,
            timestamp: newResult.timestamp,
            assetType: newResult.assetType,
            preset: newResult.preset
          }
          
          // 새 아이템을 맨 앞에 추가
          galleryItems.unshift(newItem)
          
          // 최대 15개까지만 유지 (용량 절약)
          const MAX_GALLERY_ITEMS = 15
          if (galleryItems.length > MAX_GALLERY_ITEMS) {
            galleryItems.splice(MAX_GALLERY_ITEMS)
          }
          
          localStorage.setItem('assetGallery', JSON.stringify(galleryItems))
          console.log('이미지가 자동으로 갤러리에 저장되었습니다!')
        } catch (storageError) {
          console.warn('갤러리 저장 실패:', storageError)
          // 저장 공간이 부족한 경우 기존 갤러리를 절반으로 줄이고 다시 시도
          try {
            const galleryItems = JSON.parse(localStorage.getItem('assetGallery') || '[]')
            const reducedItems = galleryItems.slice(0, Math.floor(galleryItems.length / 2))
            localStorage.setItem('assetGallery', JSON.stringify(reducedItems))
            
            // 다시 저장 시도
            const newItem = {
              id: Date.now(),
              imageData: newResult.image_data,
              prompt: newResult.prompt,
              timestamp: newResult.timestamp,
              assetType: newResult.assetType,
              preset: newResult.preset
            }
            reducedItems.unshift(newItem)
            localStorage.setItem('assetGallery', JSON.stringify(reducedItems))
            console.log('갤러리 정리 후 이미지가 저장되었습니다!')
          } catch (retryError) {
            console.error('갤러리 저장에 실패했습니다:', retryError)
            alert('갤러리 저장 공간이 부족합니다. 브라우저 캐시를 정리해주세요.')
          }
        }
      } else {
        setError(data.error || '알 수 없는 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-pearl-bg-dark text-pearl-text flex flex-col">
      <Header onGalleryClick={() => setShowGallery(true)} />

      {/* Main Content - Responsive Layout */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Controls Panel */}
        <div className="w-full lg:w-1/2 flex flex-col border-b lg:border-r lg:border-b-0 border-pearl-border">
          {/* Prompt Input Section */}
          <div className="p-3 md:p-4 border-b border-pearl-border">
            <PromptInput
              prompt={prompt}
              onPromptChange={setPrompt}
              transparentBg={transparentBg}
              onTransparentBgChange={setTransparentBg}
              currentAssetType={currentAssetType}
            />
          </div>

          {/* Scrollable Settings */}
          <div className="flex-1 overflow-y-auto">
            {/* Asset Type Tabs */}
            <div className="border-b border-pearl-border">
              <AssetTypeTabs
                currentAssetType={currentAssetType}
                onAssetTypeChange={handleAssetTypeChange}
              />
            </div>

            {/* Style Presets */}
            <div className="p-3 md:p-4 border-b border-pearl-border">
              <StylePresets
                currentAssetType={currentAssetType}
                selectedPreset={selectedPreset}
                onPresetSelect={handlePresetSelect}
              />
            </div>

            {/* Advanced Settings */}
            <div className="p-3 md:p-4">
              <AdvancedSettings
                aspectRatio={aspectRatio}
                onAspectRatioChange={setAspectRatio}
                guidanceScale={guidanceScale}
                onGuidanceScaleChange={setGuidanceScale}
                seed={seed}
                onSeedChange={setSeed}
              />
            </div>
          </div>

          {/* Generate Button */}
          <div className="p-3 md:p-4 border-t border-pearl-border">
            <GenerateButton
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </div>
        </div>

        {/* Results Panel */}
        <div className="w-full lg:w-1/2 flex flex-col min-h-[400px] lg:min-h-0">
          <ResultSection
            isGenerating={isGenerating}
            result={result}
            error={error}
            onGalleryClick={() => setShowGallery(true)}
          />
        </div>
      </main>

      {/* Gallery Modal */}
      {showGallery && (
        <GalleryModal onClose={() => setShowGallery(false)} />
      )}
    </div>
  )
}

export default App 