import React from 'react'

interface NavbarProps {
  onBackToHub: () => void
  unitName: string
  simulatorName: string
}

export default function Navbar({ onBackToHub, unitName, simulatorName }: NavbarProps) {
  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 lg:px-12 py-5 bg-[#0e0e0e]/70 backdrop-blur-2xl border-b border-white/5">
      {/* Left: Back + Branding */}
      <div className="flex items-center gap-5">
        <button
          onClick={onBackToHub}
          className="flex items-center gap-2 group cursor-pointer px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all"
        >
          <span className="material-symbols-outlined text-lavender/60 group-hover:text-lavender transition-colors text-base">arrow_back</span>
          <span className="font-label text-[10px] uppercase tracking-[0.15em] text-on-surface-variant/50 group-hover:text-lavender transition-colors hidden sm:inline">
            Modules
          </span>
        </button>

        <div className="hidden md:flex items-center text-[10px] font-label uppercase tracking-[0.15em]">
          <span className="text-2xl font-extralight italic font-headline text-cream tracking-tighter mr-6">
            Turing Prism
          </span>
          <span className="text-on-surface-variant/30">›</span>
          <span className="mx-2 text-lavender/50">{unitName}</span>
          <span className="text-on-surface-variant/30">›</span>
          <span className="mx-2 text-gold/70">{simulatorName}</span>
        </div>
      </div>

      {/* Right: Status indicator */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.4)]" />
          <span className="font-label text-[9px] uppercase tracking-[0.2em] text-on-surface-variant/40">Active</span>
        </div>
        <span className="material-symbols-outlined text-lavender/40 cursor-pointer hover:text-gold transition-colors text-xl">
          account_circle
        </span>
      </div>
    </nav>
  )
}
