import React from 'react'
import { Gamepad2 } from 'lucide-react'

const Header = ({ onGalleryClick }) => {
  return (
    <header className="flex items-center justify-center whitespace-nowrap border-b border-pearl-border px-3 sm:px-6 lg:px-10 py-3 sm:py-4 shadow-md sticky top-0 z-50 bg-pearl-bg-dark relative">
      {/* 중앙 로고 */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-pearl-primary to-pearl-accent rounded-full flex items-center justify-center shadow-lg">
          <Gamepad2 className="text-white text-base sm:text-xl" />
        </div>
        <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-pearl-primary to-pearl-accent bg-clip-text text-transparent">
          <span className="hidden sm:inline">DingADing Studio</span>
          <span className="sm:hidden">DingADing</span>
        </h2>
      </div>
      
      {/* 우측 메뉴 */}
      <div className="absolute right-3 sm:right-6 lg:right-10 flex items-center gap-3 sm:gap-6">
        <a className="text-pearl-text-muted hover:text-pearl-text text-xs sm:text-sm font-medium leading-normal transition-colors" href="#">
          홈
        </a>
        <button 
          className="text-pearl-text-muted hover:text-pearl-text text-xs sm:text-sm font-medium leading-normal transition-colors"
          onClick={onGalleryClick}
        >
          갤러리
        </button>
      </div>
    </header>
  )
}

export default Header 