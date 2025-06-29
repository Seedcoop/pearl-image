import React from 'react'
import { User, Image, Package, LayoutDashboard, Sparkles } from 'lucide-react'

const assetTypes = [
  { key: 'free', icon: Sparkles, label: '자유' },
  { key: 'character', icon: User, label: '캐릭터' },
  { key: 'background', icon: Image, label: '배경' },
  { key: 'item', icon: Package, label: '아이템' },
  { key: 'ui', icon: LayoutDashboard, label: 'UI 요소' }
]

const AssetTypeTabs = ({ currentAssetType, onAssetTypeChange }) => {
  return (
    <section>
      <div className="border-b border-pearl-border">
        <nav className="flex px-2 gap-1 sm:gap-2 overflow-x-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {assetTypes.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              className={`flex flex-col items-center justify-center border-b-[2px] pb-3 pt-3 px-3 sm:px-2 group whitespace-nowrap transition-colors min-w-0 ${
                currentAssetType === key
                  ? 'border-b-pearl-primary text-pearl-primary'
                  : 'border-b-transparent text-pearl-text-muted hover:text-pearl-text hover:border-b-pearl-accent'
              }`}
              onClick={() => onAssetTypeChange(key)}
            >
              <Icon 
                className={`mb-1 transition-colors ${
                  currentAssetType === key
                    ? 'text-pearl-primary'
                    : 'text-pearl-text-muted group-hover:text-pearl-accent'
                }`}
                size={20}
              />
              <p className="text-xs font-semibold leading-normal tracking-[0.015em]">{label}</p>
            </button>
          ))}
        </nav>
      </div>
    </section>
  )
}

export default AssetTypeTabs 