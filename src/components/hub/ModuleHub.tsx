import React, { useEffect, useState } from 'react'
import type { UnitId, SimulatorId } from '../../App'

interface Props {
  onSelectUnit: (unit: UnitId, defaultSim?: SimulatorId) => void
  onNavigate?: (page: 'units' | 'research' | 'archive') => void
  onBack?: () => void
}

// Utility: linearly interpolate between two hex colors
export function lerpColor(a: string, b: string, t: number): string {
  const ah = parseInt(a.replace('#', ''), 16)
  const bh = parseInt(b.replace('#', ''), 16)
  const ar = (ah >> 16) & 255, ag = (ah >> 8) & 255, ab = ah & 255
  const br = (bh >> 16) & 255, bg = (bh >> 8) & 255, bb = bh & 255
  const rr = Math.round(ar + (br - ar) * t)
  const rg = Math.round(ag + (bg - ag) * t)
  const rb = Math.round(ab + (bb - ab) * t)
  return `#${((rr << 16) | (rg << 8) | rb).toString(16).padStart(6, '0')}`
}

export const units: {
  id: UnitId
  number: string
  title: string
  subtitle: string
  icon: string
  simulators: { label: string; id: SimulatorId }[]
  description: string
  colorLeft: string   // deep color on the left end of the gradient
  colorRight: string  // deep color on the right end of the gradient
}[] = [
  {
    id: 'unit1', number: '01', title: 'Finite Automata', subtitle: 'Deterministic & Nondeterministic',
    icon: 'memory', description: 'Build, simulate, and convert finite state machines. The foundation of all computation.',
    simulators: [
      { label: 'DFA Simulator', id: 'dfa' },
      { label: 'NFA Simulator', id: 'nfa' },
      { label: 'NFA → DFA', id: 'nfa2dfa' },
      { label: 'DFA Minimizer', id: 'dfa-min' },
    ],
    colorLeft: '#5500FF',   // deep violet
    colorRight: '#FF5500',  // deep orange
  },
  {
    id: 'unit2', number: '02', title: 'Regular Languages', subtitle: 'Patterns & Proofs',
    icon: 'code', description: "From regular expressions to automata. Prove languages are (or aren't) regular.",
    simulators: [
      { label: 'Regex → NFA', id: 'regex2nfa' },
      { label: 'Pumping Lemma', id: 'pumping-lemma' },
    ],
    colorLeft: '#CC0066',   // deep crimson
    colorRight: '#FF8800',  // deep amber
  },
  {
    id: 'unit3', number: '03', title: 'Context-Free', subtitle: 'Grammars & Normal Forms',
    icon: 'account_tree', description: 'Parse context-free grammars, convert to normal forms, and test with the CFL pumping lemma.',
    simulators: [
      { label: 'CFG Parser', id: 'cfg' },
      { label: 'CNF / GNF', id: 'cnf-gnf' },
      { label: 'CFL Pumping', id: 'cfl-pumping' },
    ],
    colorLeft: '#007744',   // deep emerald
    colorRight: '#0044FF',  // deep cobalt
  },
  {
    id: 'unit4', number: '04', title: 'Pushdown Automata', subtitle: 'Stack-Powered Machines',
    icon: 'schema', description: 'Watch symbols push and pop on the stack in real time as the PDA processes input.',
    simulators: [
      { label: 'PDA Simulator', id: 'pda' },
    ],
    colorLeft: '#DD2200',   // deep red-orange
    colorRight: '#FFAA00',  // deep gold
  },
  {
    id: 'unit5', number: '05', title: 'Turing Machines', subtitle: 'Universal Computation',
    icon: 'settings_ethernet', description: 'Infinite tape, finite control. The most powerful model of computation.',
    simulators: [
      { label: 'Turing Machine', id: 'tm' },
    ],
    colorLeft: '#9900CC',   // deep violet
    colorRight: '#0011EE',  // deep indigo
  },
  {
    id: 'unit6', number: '06', title: 'Decidability', subtitle: 'P, NP & Beyond',
    icon: 'speed', description: 'Explore complexity classes, reductions, and the biggest open problem in CS.',
    simulators: [
      { label: 'Complexity Visualizer', id: 'complexity' },
    ],
    colorLeft: '#0099DD',   // deep sky
    colorRight: '#00BB66',  // deep teal-green
  },
]

export default function ModuleHub({ onSelectUnit, onNavigate, onBack }: Props) {
  const [visibleRows, setVisibleRows] = useState<number[]>([])
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t0 = setTimeout(() => setMounted(true), 50)
    const timers: ReturnType<typeof setTimeout>[] = []
    units.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleRows(prev => [...prev, i]), 300 + i * 160))
    })
    return () => { clearTimeout(t0); timers.forEach(clearTimeout) }
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative" style={{ overflowX: 'hidden' }}>
      {/* Dynamic Aurora Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="aurora aurora-1" />
        <div className="aurora aurora-2" />
        <div className="aurora aurora-3" />
        <div className="aurora aurora-4" />
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }} />
      </div>

      {/* Top Nav */}
      <nav
        className="fixed top-0 w-full z-50 flex justify-between items-center px-8 lg:px-16 py-5"
        style={{ background: 'linear-gradient(to bottom, rgba(10,10,10,0.9), transparent)', backdropFilter: 'blur(20px)' }}
      >
        <button onClick={() => onBack?.()} className="cursor-pointer">
          <span className="text-2xl font-extralight italic font-headline text-cream tracking-tighter">Turing Prism</span>
        </button>
        <div className="hidden md:flex items-center gap-12">
          <button onClick={() => onNavigate?.('units')} className="text-[10px] font-label uppercase text-gold font-medium border-b border-gold/30 tracking-[0.2em] cursor-pointer">Theory</button>
          <button onClick={() => onNavigate?.('research')} className="text-[10px] font-label uppercase text-on-surface-variant/60 hover:text-lavender transition-colors tracking-[0.2em] cursor-pointer">Research</button>
          <button onClick={() => onNavigate?.('archive')} className="text-[10px] font-label uppercase text-on-surface-variant/60 hover:text-lavender transition-colors tracking-[0.2em] cursor-pointer">Archive</button>
        </div>
      </nav>

      {/* Hero Header */}
      <section className="pt-36 pb-12 px-8 lg:px-20">
        <div
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <span className="font-label text-[10px] uppercase tracking-[0.5em] text-lavender/40 block mb-5">Theory of Computation</span>
          <h1 className="font-headline text-6xl md:text-8xl lg:text-[7rem] italic font-light tracking-tighter leading-[1.05]" style={{ overflow: 'visible' }}>
            <div className="mb-2">
              <span className="prism-text prism-underline active">Choose Your</span>
            </div>
            <div>
              <span className="text-cream/90 pr-4">Module.</span>
            </div>
          </h1>
          <p className="mt-8 max-w-md text-on-surface-variant/50 font-body text-sm leading-relaxed">
            Each module is a self-contained journey through a layer of computational theory.
          </p>
        </div>
      </section>

      {/* Full-width Module Rows */}
      <section className="pb-32">
        {units.map((unit, i) => {
          const isVisible = visibleRows.includes(i)
          const isHovered = hoveredIdx === i

          return (
            <button
              key={unit.id}
              onClick={() => onSelectUnit(unit.id, unit.simulators[0].id)}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="w-full text-left relative group block"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateX(0)' : 'translateX(-60px)',
                transition: 'opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)',
              }}
            >
              {/* Row: full left→right gradient glow on hover */}
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-500"
                style={{
                  opacity: isHovered ? 1 : 0,
                  background: `linear-gradient(90deg, ${unit.colorLeft}14 0%, ${unit.colorRight}08 55%, transparent 100%)`,
                }}
              />

              {/* Left accent bar — gradient */}
              <div
                className="absolute left-0 top-0 bottom-0 w-[2px] transition-all duration-500"
                style={{
                  background: isHovered
                    ? `linear-gradient(to bottom, ${unit.colorLeft}, ${unit.colorRight})`
                    : 'rgba(255,255,255,0.04)',
                  boxShadow: isHovered ? `2px 0 20px ${unit.colorLeft}50` : 'none',
                }}
              />

              {/* Sparkles on hover */}
              {isHovered && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(7)].map((_, j) => {
                    const t = j / 6
                    const color = lerpColor(unit.colorLeft, unit.colorRight, t)
                    return (
                      <div
                        key={j}
                        className="absolute rounded-full sparkle-particle"
                        style={{
                          width: `${2 + (j % 3)}px`,
                          height: `${2 + (j % 3)}px`,
                          background: color,
                          left: `${6 + j * 13}%`,
                          top: `${25 + (j % 3) * 20}%`,
                          animationDelay: `${j * 0.12}s`,
                          boxShadow: `0 0 8px ${color}`,
                        }}
                      />
                    )
                  })}
                </div>
              )}

              {/* Row content */}
              <div className="px-8 lg:px-20 py-8 flex items-center justify-between gap-8 border-b border-white/[0.04]">
                {/* Number — left color glow */}
                <div className="flex-shrink-0 w-20">
                  <span
                    className="font-headline text-7xl italic font-light leading-[1.05] block"
                    style={{
                      color: isHovered ? unit.colorLeft : 'rgba(255,255,255,0.07)',
                      textShadow: isHovered
                        ? `0 0 40px ${unit.colorLeft}90, 0 0 80px ${unit.colorLeft}50`
                        : 'none',
                      transition: 'color 0.4s ease, text-shadow 0.4s ease',
                    }}
                  >
                    {unit.number}
                  </span>
                </div>

                {/* Title + subtitle */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-4 mb-2 flex-wrap">
                    <h2
                      className="font-headline text-3xl md:text-4xl italic font-light tracking-tight transition-all duration-500"
                      style={{
                        // Gradient text on hover: left → right color
                        ...(isHovered ? {
                          background: `linear-gradient(90deg, ${unit.colorLeft}, ${unit.colorRight})`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          filter: `drop-shadow(0 0 20px ${unit.colorLeft}50)`,
                        } : {
                          color: 'rgba(255,249,239,0.2)',
                        }),
                      }}
                    >
                      {unit.title}
                    </h2>
                    <span
                      className="font-label text-[10px] uppercase tracking-[0.2em] transition-all duration-500"
                      style={{ color: isHovered ? `${unit.colorLeft}90` : 'rgba(255,255,255,0.1)' }}
                    >
                      {unit.subtitle}
                    </span>
                  </div>
                  <p
                    className="text-xs leading-relaxed max-w-lg font-body transition-all duration-500"
                    style={{ color: isHovered ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)' }}
                  >
                    {unit.description}
                  </p>
                </div>

                {/* Simulator tags — shift toward right color */}
                <div className="hidden md:flex items-center gap-3 flex-wrap justify-center max-w-xs">
                  {unit.simulators.map((sim, si) => {
                    const t = unit.simulators.length > 1 ? si / (unit.simulators.length - 1) : 0.5
                    const tagColor = lerpColor(unit.colorLeft, unit.colorRight, t)
                    return (
                      <span
                        key={sim.id}
                        className="px-3 py-1.5 rounded-full text-[9px] font-label uppercase tracking-wider transition-all duration-500"
                        style={{
                          background: isHovered ? `${tagColor}14` : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${isHovered ? tagColor + '35' : 'rgba(255,255,255,0.04)'}`,
                          color: isHovered ? tagColor : 'rgba(255,255,255,0.12)',
                          boxShadow: isHovered ? `0 0 8px ${tagColor}20` : 'none',
                        }}
                      >
                        {sim.label}
                      </span>
                    )
                  })}
                </div>

                {/* Icon (right color) + Arrow */}
                <div className="flex-shrink-0 flex items-center gap-5">
                  <span
                    className="material-symbols-outlined text-3xl transition-all duration-500"
                    style={{
                      color: isHovered ? unit.colorRight : 'rgba(255,255,255,0.06)',
                      filter: isHovered ? `drop-shadow(0 0 12px ${unit.colorRight})` : 'none',
                      fontVariationSettings: "'FILL' 0, 'wght' 200",
                      transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                      transition: 'all 0.4s ease',
                    }}
                  >
                    {unit.icon}
                  </span>
                  <div
                    className="w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-500"
                    style={{
                      borderColor: isHovered ? unit.colorRight : 'rgba(255,255,255,0.06)',
                      background: isHovered ? `${unit.colorRight}12` : 'transparent',
                      boxShadow: isHovered ? `0 0 20px ${unit.colorRight}40` : 'none',
                    }}
                  >
                    <span
                      className="text-sm transition-all duration-300"
                      style={{
                        color: isHovered ? unit.colorRight : 'rgba(255,255,255,0.12)',
                        transform: isHovered ? 'translateX(2px)' : 'none',
                        display: 'inline-block',
                      }}
                    >→</span>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </section>
    </div>
  )
}
