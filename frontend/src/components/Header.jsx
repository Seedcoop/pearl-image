import React from 'react'
import { Gamepad2 } from 'lucide-react'

const Header = ({ onGalleryClick }) => {
  return (
    <header className="flex items-center justify-center whitespace-nowrap border-b border-pearl-border px-6 sm:px-10 py-4 shadow-md sticky top-0 z-50 bg-pearl-bg-dark relative">
      {/* 중앙 로고 */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-gradient-to-br from-pearl-primary to-pearl-accent rounded-full flex items-center justify-center shadow-lg">
          <Gamepad2 className="text-white text-xl" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-pearl-primary to-pearl-accent bg-clip-text text-transparent">
          DingADing Studio
        </h2>
      </div>
      
      {/* 우측 메뉴 */}
      <div className="absolute right-6 sm:right-10 flex items-center gap-6">
        <a className="text-pearl-text-muted hover:text-pearl-text text-sm font-medium leading-normal transition-colors" href="#">
          홈
        </a>
        <button 
          className="text-pearl-text-muted hover:text-pearl-text text-sm font-medium leading-normal transition-colors"
          onClick={onGalleryClick}
        >
          갤러리
        </button>
      </div>
    </header>
  )
}

export default Header 