import React from 'react'
import { Sparkles, Loader2 } from 'lucide-react'

const GenerateButton = ({ onGenerate, isGenerating }) => {
  return (
    <button 
      onClick={onGenerate}
      disabled={isGenerating}
      className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 sm:h-12 px-6 pearl-abyss-button text-base font-bold leading-normal tracking-[0.015em] shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 animate-spin" size={20} />
          <span className="truncate">생성 중...</span>
        </>
      ) : (
        <>
          <Sparkles className="mr-2" size={20} />
          <span className="truncate">에셋 생성하기</span>
        </>
      )}
    </button>
  )
}

export default GenerateButton 