import React, { useEffect, useState, useRef } from 'react'
import type { SimulatorId } from '../../App'
import { getArchives, setRestoreSession, removeArchive, type SavedSimulation } from '../../engine/archive'

interface Props {
  onNavigate: (page: 'units' | 'research' | 'archive') => void
  onNavigateToSimulator?: (unitId: string, simulatorId: SimulatorId) => void
}

export default function ArchivePage({ onNavigate, onNavigateToSimulator }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [archives, setArchives] = useState<SavedSimulation[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    setArchives(getArchives())
  }, [])

  // Track mouse position for card glow effect
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const cards = containerRef.current?.querySelectorAll('.archive-card') as NodeListOf<HTMLElement>
      cards?.forEach(card => {
        const rect = card.getBoundingClientRect()
        card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
        card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
      })
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  return (
    <div className="min-h-screen bg-[#0e0e0e] relative overflow-hidden flex flex-col" ref={containerRef}>
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden opacity-30">
        <div className="absolute bottom-[20%] left-[20%] w-[500px] h-[500px] chromatic-glow animate-float-orb" style={{ filter: 'hue-rotate(270deg)' }} />
      </div>

      {/* Top Nav */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 lg:px-12 py-5 bg-[#0e0e0e]/60 backdrop-blur-2xl border-b border-white/5">
        <button onClick={() => onNavigate('units')} className="flex items-center gap-3 group cursor-pointer">
          <span className="text-2xl font-extralight italic font-headline text-cream tracking-tighter">Turing Prism</span>
        </button>
        <div className="hidden md:flex items-center gap-12">
          <button onClick={() => onNavigate('units')} className="text-[10px] font-label uppercase text-on-surface-variant/60 hover:text-lavender transition-colors tracking-[0.2em] cursor-pointer">Theory</button>
          <button onClick={() => onNavigate('research')} className="text-[10px] font-label uppercase text-on-surface-variant/60 hover:text-lavender transition-colors tracking-[0.2em] cursor-pointer">Research</button>
          <button onClick={() => onNavigate('archive')} className="text-[10px] font-label uppercase text-gold font-medium border-b border-gold/30 tracking-[0.2em] cursor-pointer">Archive</button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pt-32 pb-24 px-8 lg:px-16 max-w-7xl mx-auto w-full z-10">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 fade-up">
          <div>
            <h1 className="font-headline text-5xl md:text-7xl italic font-light tracking-tighter text-cream mb-4">
              Saved <span className="prism-text">Archive</span>
            </h1>
            <p className="text-on-surface-variant/60 font-body max-w-md text-sm leading-relaxed">
              Your preserved state machines, grammars, and complex computational proofs. Pick up where you left off.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="glass-panel px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-lavender/50">search</span>
              <input 
                type="text" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search archive..." 
                className="bg-transparent border-none outline-none text-sm text-cream font-body placeholder:text-on-surface-variant/30 w-32 focus:w-48 transition-all"
              />
            </div>
            <button className="w-10 h-10 rounded-full glass-panel border border-white/10 flex items-center justify-center text-on-surface-variant/50 hover:text-lavender transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-sm">filter_list</span>
            </button>
          </div>
        </div>

        {/* Grid layout for archives */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {archives.filter(s => search ? s.title.toLowerCase().includes(search.toLowerCase()) || s.type.toLowerCase().includes(search.toLowerCase()) : true).map((sim, i) => (
            <div 
              key={sim.id} 
              onClick={() => {
                setRestoreSession(sim.simulator, sim.payload)
                if (onNavigateToSimulator) {
                  onNavigateToSimulator(sim.unitId, sim.simulator)
                }
              }}
              className="archive-card group relative p-6 rounded-2xl glass-panel border border-white/5 hover:border-gold/30 transition-all duration-300 fade-up cursor-pointer"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex justify-between items-start mb-10">
                <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:bg-gold/10 group-hover:border-gold/20 transition-all duration-300">
                  <span className="material-symbols-outlined text-lavender/40 group-hover:text-gold transition-colors">{sim.preview}</span>
                </div>
                <button 
                  className="text-on-surface-variant/30 hover:text-red-400 transition-colors z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeArchive(sim.id);
                    setArchives(getArchives());
                  }}
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>

              <div>
                <h3 className="font-headline text-2xl font-light text-cream group-hover:text-white transition-colors mb-1 truncate">
                  {sim.title}
                </h3>
                <div className="font-label text-[10px] uppercase tracking-[0.1em] text-on-surface-variant/50 mb-4">
                  {sim.type}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-label tracking-widest text-on-surface-variant/30 mb-1">Complexity</span>
                  <span className={`text-[10px] font-label font-medium uppercase tracking-[0.1em] ${
                    sim.complexity === 'Advanced' ? 'text-red-400' : 
                    sim.complexity === 'Intermediate' ? 'text-orange-300' : 'text-green-400'
                  }`}>
                    {sim.complexity}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase font-label tracking-widest text-on-surface-variant/30 mb-1">Last Edited</span>
                  <span className="text-[10px] font-label text-on-surface-variant tracking-wider">{sim.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
