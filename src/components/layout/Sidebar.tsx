import React, { useState } from 'react'
import type { SimulatorId } from '../../App'

interface SidebarProps {
  activeSimulator: SimulatorId
  onSelect: (id: SimulatorId) => void
}

const units = [
  {
    title: 'Unit 1 · Finite Automata',
    items: [
      { id: 'dfa' as SimulatorId, label: 'DFA Simulator', icon: 'memory', desc: 'Build & simulate deterministic automata' },
      { id: 'nfa' as SimulatorId, label: 'NFA Simulator', icon: 'blur_on', desc: 'Nondeterministic with ε-transitions' },
      { id: 'nfa2dfa' as SimulatorId, label: 'NFA → DFA', icon: 'transform', desc: 'Subset construction algorithm' },
      { id: 'dfa-min' as SimulatorId, label: 'DFA Minimizer', icon: 'compress', desc: 'Table-filling minimization' },
    ],
  },
  {
    title: 'Unit 2 · Regular Languages',
    items: [
      { id: 'regex2nfa' as SimulatorId, label: 'Regex → NFA', icon: 'code', desc: 'Thompson\'s construction' },
      { id: 'pumping-lemma' as SimulatorId, label: 'Pumping Lemma', icon: 'waves', desc: 'Prove languages non-regular' },
    ],
  },
  {
    title: 'Unit 3 · Context-Free',
    items: [
      { id: 'cfg' as SimulatorId, label: 'CFG Parser', icon: 'account_tree', desc: 'Leftmost derivation visualizer' },
      { id: 'cnf-gnf' as SimulatorId, label: 'CNF / GNF', icon: 'tune', desc: 'Normal form conversion' },
      { id: 'cfl-pumping' as SimulatorId, label: 'CFL Pumping', icon: 'water', desc: 'CFL pumping lemma proofs' },
    ],
  },
  {
    title: 'Unit 4 · Pushdown Automata',
    items: [
      { id: 'pda' as SimulatorId, label: 'PDA Simulator', icon: 'schema', desc: 'Stack-based automaton' },
    ],
  },
  {
    title: 'Unit 5 · Turing Machines',
    items: [
      { id: 'tm' as SimulatorId, label: 'Turing Machine', icon: 'settings_ethernet', desc: 'Infinite tape simulator' },
    ],
  },
  {
    title: 'Unit 6 · Decidability',
    items: [
      { id: 'complexity' as SimulatorId, label: 'Complexity', icon: 'speed', desc: 'P vs NP Venn diagram' },
    ],
  },
]

export default function Sidebar({ activeSimulator, onSelect }: SidebarProps) {
  const [expandedUnits, setExpandedUnits] = useState<Set<number>>(() => {
    // Open the unit that contains the active simulator
    const idx = units.findIndex(u => u.items.some(item => item.id === activeSimulator))
    return new Set(idx >= 0 ? [idx] : [0])
  })

  const toggleUnit = (idx: number) => {
    setExpandedUnits(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  // Auto-expand when activeSimulator changes
  React.useEffect(() => {
    const idx = units.findIndex(u => u.items.some(item => item.id === activeSimulator))
    if (idx >= 0) {
      setExpandedUnits(prev => new Set(prev).add(idx))
    }
  }, [activeSimulator])

  return (
    <aside className="fixed left-0 top-0 h-full hidden lg:flex flex-col py-8 pt-24 z-40 bg-[#0E0E0E] w-72 border-r border-white/5 overflow-y-auto">
      <div className="px-8 mb-6">
        <h3 className="font-headline text-2xl text-cream mb-1 italic font-light">Core Units</h3>
        <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-[0.25em]">
          Theoretical Foundations
        </p>
      </div>

      <div className="flex flex-col gap-2 px-6 flex-1">
        {units.map((unit, ui) => {
          const isExpanded = expandedUnits.has(ui)
          const hasActive = unit.items.some(item => item.id === activeSimulator)
          return (
            <div key={ui}>
              {/* Unit header — clickable to expand/collapse */}
              <button
                onClick={() => toggleUnit(ui)}
                className={`w-full flex items-center justify-between px-2 py-2 rounded-lg cursor-pointer transition-all duration-300 ${
                  hasActive ? 'text-gold' : 'text-lavender/40 hover:text-lavender/60'
                }`}
              >
                <span className="font-label text-[9px] uppercase tracking-[0.2em]">
                  {unit.title}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-label text-on-surface-variant/30">{unit.items.length}</span>
                  <span
                    className="material-symbols-outlined text-sm transition-transform duration-300"
                    style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}
                  >
                    expand_more
                  </span>
                </div>
              </button>

              {/* Simulator items — animated expand/collapse */}
              <div
                className="overflow-hidden transition-all duration-400 ease-out"
                style={{
                  maxHeight: isExpanded ? `${unit.items.length * 52}px` : '0px',
                  opacity: isExpanded ? 1 : 0,
                }}
              >
                <div className="flex flex-col gap-1 mt-1">
                  {unit.items.map((item) => {
                    const isActive = activeSimulator === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() => onSelect(item.id)}
                        title={item.desc}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 text-left cursor-pointer w-full group relative ${
                          isActive
                            ? 'text-gold font-bold bg-gold/5 border-l-2 border-gold'
                            : 'text-on-surface/40 hover:text-lavender hover:bg-white/[0.02]'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-lg transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                          {item.icon}
                        </span>
                        <div className="flex flex-col">
                          <span className="font-label uppercase tracking-[0.15em] text-[10px]">{item.label}</span>
                          {isActive && (
                            <span className="text-[8px] text-gold/50 font-label tracking-wider mt-0.5">{item.desc}</span>
                          )}
                        </div>
                        {isActive && (
                          <span className="absolute right-2 w-1.5 h-1.5 rounded-full bg-gold animate-pulse shadow-[0_0_8px_rgba(255,219,60,0.4)]" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="px-6 pt-6 mt-auto border-t border-white/5">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="w-8 h-8 rounded-full prism-gradient flex items-center justify-center">
            <span className="material-symbols-outlined text-sm text-[#131313]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          </div>
          <div>
            <p className="font-label text-[10px] text-cream uppercase tracking-wider">12 Simulators</p>
            <p className="font-label text-[8px] text-on-surface-variant/40 tracking-wider">All interactive</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
