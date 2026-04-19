import React, { useEffect, useRef, useState, useCallback } from 'react'
import type { UnitId, SimulatorId } from '../../App'
import { units, lerpColor } from './ModuleHub'

interface Props {
  unitId: UnitId
  onSelectSimulator: (sim: SimulatorId) => void
  onBack: () => void
}

// Topic metadata per unit — accent colors are computed dynamically from unit's color pair
const unitTopics: Record<UnitId, {
  id: SimulatorId
  title: string
  subtitle: string
  description: string
  icon: string
}[]> = {
  unit1: [
    { id: 'dfa', title: 'DFA Simulator', subtitle: 'Deterministic Finite Automaton', icon: 'account_circle',
      description: 'Design and simulate deterministic finite automata. Add states, define transitions, set accepting states, and step through input strings to watch the machine compute.' },
    { id: 'nfa', title: 'NFA Simulator', subtitle: 'Nondeterministic Finite Automaton', icon: 'hub',
      description: 'Explore the power of nondeterminism. Watch multiple parallel computation paths including ε-transitions as the NFA simultaneously explores all possibilities.' },
    { id: 'nfa2dfa', title: 'NFA → DFA', subtitle: 'Subset Construction Algorithm', icon: 'transform',
      description: 'Apply the subset construction theorem visually. Every NFA has an equivalent DFA — watch how powerset states are constructed step by step.' },
    { id: 'dfa-min', title: 'DFA Minimizer', subtitle: 'Myhill-Nerode Minimization', icon: 'compress',
      description: 'Reduce any DFA to its canonical minimal form. The table-filling algorithm identifies and merges equivalent states, yielding the unique minimal DFA.' },
  ],
  unit2: [
    { id: 'regex2nfa', title: 'Regex → NFA', subtitle: "Thompson's Construction", icon: 'code',
      description: 'Transform any regular expression into an NFA using Thompson\'s construction. Watch the epsilon-NFA emerge from your pattern, operator by operator.' },
    { id: 'pumping-lemma', title: 'Pumping Lemma', subtitle: 'Proof of Non-Regularity', icon: 'broken_image',
      description: 'The pumping lemma is the canonical tool for proving a language is NOT regular. Choose a language, pick a pumping length, and find the contradiction interactively.' },
  ],
  unit3: [
    { id: 'cfg', title: 'CFG Parser', subtitle: 'Context-Free Grammar Engine', icon: 'account_tree',
      description: 'Define context-free grammars with custom productions. Generate strings, parse derivation trees, and visualize the recursive structure of context-free languages.' },
    { id: 'cnf-gnf', title: 'CNF / GNF', subtitle: 'Chomsky & Greibach Normal Forms', icon: 'swap_horiz',
      description: 'Convert any CFG into Chomsky Normal Form or Greibach Normal Form. Step through elimination of unit productions, useless symbols, and ε-productions.' },
    { id: 'cfl-pumping', title: 'CFL Pumping', subtitle: "Ogden's Lemma & Beyond", icon: 'expand',
      description: 'Prove a language is not context-free using the CFL pumping lemma. Split strings into uvwxy and find all decompositions that violate the pumping property.' },
  ],
  unit4: [
    { id: 'pda', title: 'PDA Simulator', subtitle: 'Pushdown Automaton', icon: 'schema',
      description: 'Simulate pushdown automata with full stack visualization. Watch symbols push and pop in real time as the PDA navigates its state graph processing input.' },
  ],
  unit5: [
    { id: 'tm', title: 'Turing Machine', subtitle: 'Universal Computation Model', icon: 'settings_ethernet',
      description: 'Program and simulate Turing machines on an infinite tape. Define transition functions, watch the read/write head move, and explore what it means to be Turing-complete.' },
  ],
  unit6: [
    { id: 'complexity', title: 'Complexity Visualizer', subtitle: 'P, NP & The Hierarchy', icon: 'speed',
      description: 'Explore the complexity class hierarchy interactively. Understand P vs NP, polynomial reductions, NP-completeness, and where famous problems land in the landscape.' },
  ],
}

// Aurora canvas hook
function useAuroraCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  colorA: string,
  colorB: string,
) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let animId: number
    let t = 0

    const hr = (hex: string) => {
      const h = parseInt(hex.replace('#',''), 16)
      return { r: (h >> 16) & 255, g: (h >> 8) & 255, b: h & 255 }
    }
    const ca = hr(colorA), cb = hr(colorB)

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const draw = () => {
      t += 0.003
      const w = canvas.width, h = canvas.height
      ctx.clearRect(0, 0, w, h)

      for (let k = 0; k < 4; k++) {
        const mix = k / 3
        const r = Math.round(ca.r + (cb.r - ca.r) * mix)
        const g = Math.round(ca.g + (cb.g - ca.g) * mix)
        const b = Math.round(ca.b + (cb.b - ca.b) * mix)
        const phase = t + k * 1.5
        const yBase = h * (0.12 + k * 0.2)
        const amp = h * 0.07

        ctx.beginPath()
        ctx.moveTo(0, h)
        for (let x = 0; x <= w; x += 3) {
          const y = yBase
            + Math.sin(x * 0.004 + phase) * amp
            + Math.sin(x * 0.009 + phase * 1.5) * amp * 0.5
            + Math.cos(x * 0.006 + phase * 0.8 + k) * amp * 0.4
          ctx.lineTo(x, y)
        }
        ctx.lineTo(w, h)
        ctx.closePath()

        const a = 0.028 - k * 0.004
        const grd = ctx.createLinearGradient(0, yBase - amp * 2, 0, yBase + amp * 2)
        grd.addColorStop(0, `rgba(${r},${g},${b},${a * 2})`)
        grd.addColorStop(0.5, `rgba(${r},${g},${b},${a})`)
        grd.addColorStop(1, `rgba(${r},${g},${b},0)`)
        ctx.fillStyle = grd
        ctx.fill()
      }

      // Floating blobs
      ;[{ x: 0.2, y: 0.3, c: ca }, { x: 0.78, y: 0.65, c: cb }].forEach(({ x, y, c }, bi) => {
        const ox = Math.sin(t * 0.6 + bi * 2.1) * w * 0.04
        const oy = Math.cos(t * 0.45 + bi) * h * 0.03
        const grd = ctx.createRadialGradient(w * x + ox, h * y + oy, 0, w * x + ox, h * y + oy, w * 0.32)
        grd.addColorStop(0, `rgba(${c.r},${c.g},${c.b},0.045)`)
        grd.addColorStop(1, `rgba(${c.r},${c.g},${c.b},0)`)
        ctx.fillStyle = grd
        ctx.fillRect(0, 0, w, h)
      })

      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); ro.disconnect() }
  }, [colorA, colorB])
}

type TopicEntry = {
  id: SimulatorId
  title: string
  subtitle: string
  description: string
  icon: string
  accent: string    // primary accent (lerped)
  accentB: string   // secondary (slightly lighter / next step)
}

function TopicSlide({ topic, isActive, onLaunch }: {
  topic: TopicEntry
  isActive: boolean
  onLaunch: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useAuroraCanvas(canvasRef, topic.accent, topic.accentB)

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center"
      style={{
        opacity: isActive ? 1 : 0,
        transform: isActive ? 'scale(1) translateY(0)' : 'scale(0.98) translateY(20px)',
        transition: 'opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)',
        pointerEvents: isActive ? 'auto' : 'none',
        paddingTop: '140px',
        paddingBottom: '180px',
      }}
    >
      {/* Per-slide aurora canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.85 }}
      />

      {/* Faint radial background burst */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute rounded-full"
          style={{
            width: '64vmin', height: '64vmin',
            left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, ${topic.accent}07 0%, transparent 70%)`,
            border: `1px solid ${topic.accent}07`,
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '42vmin', height: '42vmin',
            left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)',
            border: `1px solid ${topic.accent}05`,
          }}
        />
        {/* Corner rulers */}
        <div className="absolute top-32 left-16 w-14 h-px opacity-30" style={{ background: `linear-gradient(90deg, transparent, ${topic.accent})` }} />
        <div className="absolute top-32 left-16 w-px h-14 opacity-30" style={{ background: `linear-gradient(180deg, transparent, ${topic.accent})` }} />
        <div className="absolute bottom-36 right-16 w-14 h-px opacity-30" style={{ background: `linear-gradient(90deg, ${topic.accentB}, transparent)` }} />
        <div className="absolute bottom-36 right-16 w-px h-14 opacity-30" style={{ background: `linear-gradient(0deg, transparent, ${topic.accentB})` }} />
      </div>

      {/* Content */}
      <div
        className="relative text-center px-8 max-w-4xl z-10"
        style={{
          opacity: isActive ? 1 : 0,
          transform: isActive ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.8s ease 0.15s, transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.15s',
        }}
      >
        {/* Icon badge */}
        <div className="flex justify-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${topic.accent}18, ${topic.accentB}10)`,
              border: `1px solid ${topic.accent}28`,
              boxShadow: `0 0 50px ${topic.accent}20`,
            }}
          >
            <span
              className="material-symbols-outlined text-3xl"
              style={{ color: topic.accent, fontVariationSettings: "'FILL' 0, 'wght' 200" }}
            >
              {topic.icon}
            </span>
          </div>
        </div>

        {/* Subtitle label */}
        <span
          className="font-label text-[9px] uppercase tracking-[0.6em] block mb-6"
          style={{ color: `${topic.accent}55` }}
        >
          {topic.subtitle}
        </span>

        {/* Giant title */}
        <h1
          className="font-headline italic font-light tracking-tight leading-[1.05] mb-8"
          style={{
            fontSize: 'clamp(2rem, 7vw, 5.5rem)',
            background: `linear-gradient(135deg, ${topic.accent} 0%, ${topic.accentB} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: `drop-shadow(0 0 50px ${topic.accent}40)`,
            overflow: 'visible',
            padding: '0.08em 0.15em 0.12em 0.05em',
            marginRight: '-0.15em',
          }}
        >
          {topic.title}
        </h1>

        {/* Description */}
        <p
          className="font-body text-sm leading-relaxed max-w-lg mx-auto mb-12"
          style={{ color: 'rgba(255,255,255,0.36)' }}
        >
          {topic.description}
        </p>

        {/* Launch button */}
        <button
          onClick={onLaunch}
          className="relative overflow-hidden group/btn px-12 py-5 rounded-full font-label text-[11px] uppercase tracking-[0.3em] font-medium cursor-pointer transition-all duration-300 hover:scale-[1.04]"
          style={{
            background: `linear-gradient(135deg, ${topic.accent}, ${topic.accentB})`,
            color: '#080808',
            boxShadow: `0 12px 40px ${topic.accent}35, 0 4px 12px rgba(0,0,0,0.4)`,
          }}
        >
          <span className="relative z-10">Open Simulator →</span>
          <div
            className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-400"
            style={{ background: `linear-gradient(135deg, ${topic.accentB}, ${topic.accent})` }}
          />
        </button>
      </div>
    </div>
  )
}

export default function UnitDetailPage({ unitId, onSelectSimulator, onBack }: Props) {
  const unit = units.find(u => u.id === unitId)!
  const rawTopics = unitTopics[unitId]
  const n = rawTopics.length
  const [activeIdx, setActiveIdx] = useState(0)
  const [mounted, setMounted] = useState(false)

  // Build topics with lerped accent colors
  const topics: TopicEntry[] = rawTopics.map((t, i) => {
    // For single topic, t = 0.5 (midpoint). For multiple, spread 0 → 1.
    const tVal = n === 1 ? 0.5 : i / (n - 1)
    // Give each topic a small color width too: accent = tVal, accentB = tVal + small step
    const tValB = n === 1 ? 0.5 : Math.min(1, i / (n - 1) + 0.18)
    return {
      ...t,
      accent: lerpColor(unit.colorLeft, unit.colorRight, tVal),
      accentB: lerpColor(unit.colorLeft, unit.colorRight, tValB),
    }
  })

  useEffect(() => {
    setActiveIdx(0)
    setMounted(false)
    const t = setTimeout(() => setMounted(true), 60)
    return () => clearTimeout(t)
  }, [unitId])

  const goTo = useCallback((idx: number) => {
    setActiveIdx(Math.max(0, Math.min(n - 1, idx)))
  }, [n])

  // Keyboard nav
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(activeIdx + 1)
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goTo(activeIdx - 1)
      if (e.key === 'Escape') onBack()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [activeIdx, goTo, onBack])

  const activeTopic = topics[activeIdx]

  return (
    <div
      className="fixed inset-0 bg-[#080808] overflow-x-hidden"
      style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.5s ease' }}
    >
      {/* Slide-synced faint background wash */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse 90% 60% at 50% 45%, ${activeTopic.accent}08 0%, transparent 70%)`,
        }}
      />

      {/* Top Nav */}
      <nav
        className="absolute top-0 w-full z-50 flex items-center gap-4 px-8 lg:px-14 py-5"
        style={{ background: 'linear-gradient(to bottom, rgba(8,8,8,0.82), transparent)' }}
      >
        <button onClick={onBack} className="flex items-center gap-3 group cursor-pointer">
          <div
            className="w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-300 group-hover:scale-110"
            style={{ borderColor: `${unit.colorLeft}35`, background: `${unit.colorLeft}08` }}
          >
            <span className="text-sm" style={{ color: unit.colorLeft }}>←</span>
          </div>
          <span className="text-sm font-label text-white/25 group-hover:text-white/50 transition-colors">Modules</span>
        </button>
        <div className="w-px h-5 bg-white/8 mx-1" />
        <span
          className="font-headline text-base italic font-light"
          style={{
            background: `linear-gradient(90deg, ${unit.colorLeft}, ${unit.colorRight})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {unit.number} · {unit.title}
        </span>
        <div className="ml-auto font-label text-[10px] tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.15)' }}>
          {String(activeIdx + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
        </div>
      </nav>

      {/* Slides — stacked, only active is visible */}
      <div className="absolute inset-0">
        {topics.map((topic, i) => (
          <TopicSlide
            key={topic.id}
            topic={topic}
            isActive={i === activeIdx}
            onLaunch={() => onSelectSimulator(topic.id)}
          />
        ))}
      </div>

      {/* Bottom dot nav */}
      <div
        className="absolute bottom-0 w-full z-50 flex flex-col items-center pb-10 pt-6"
        style={{ background: 'linear-gradient(to top, rgba(8,8,8,0.88) 60%, transparent)' }}
      >
        <div className="flex items-center gap-4 mb-3">
          {/* Prev */}
          <button
            onClick={() => goTo(activeIdx - 1)}
            className="w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 cursor-pointer"
            style={{
              borderColor: activeIdx > 0 ? `${activeTopic.accent}35` : 'rgba(255,255,255,0.05)',
              color: activeIdx > 0 ? `${activeTopic.accent}` : 'rgba(255,255,255,0.1)',
              opacity: activeIdx > 0 ? 1 : 0.25,
            }}
          >
            <span className="text-xs">←</span>
          </button>

          {/* Dots — each colored with its own lerped accent */}
          <div className="flex items-center gap-3">
            {topics.map((t, i) => (
              <button
                key={t.id}
                onClick={() => goTo(i)}
                title={t.title}
                className="relative cursor-pointer"
                style={{
                  width: i === activeIdx ? '38px' : '8px',
                  height: '8px',
                  transition: 'width 0.35s cubic-bezier(0.22,1,0.36,1)',
                }}
              >
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: i === activeIdx
                      ? `linear-gradient(90deg, ${topics[i].accent}, ${topics[i].accentB})`
                      : t.accent + '30',
                    boxShadow: i === activeIdx ? `0 0 14px ${topics[i].accent}70` : 'none',
                    transition: 'background 0.35s ease, box-shadow 0.35s ease',
                  }}
                />
              </button>
            ))}
          </div>

          {/* Next */}
          <button
            onClick={() => goTo(activeIdx + 1)}
            className="w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 cursor-pointer"
            style={{
              borderColor: activeIdx < n - 1 ? `${activeTopic.accent}35` : 'rgba(255,255,255,0.05)',
              color: activeIdx < n - 1 ? `${activeTopic.accent}` : 'rgba(255,255,255,0.1)',
              opacity: activeIdx < n - 1 ? 1 : 0.25,
            }}
          >
            <span className="text-xs">→</span>
          </button>
        </div>

        {/* Next topic label */}
        <span className="font-label text-[8px] uppercase tracking-[0.4em]" style={{ color: 'rgba(255,255,255,0.14)' }}>
          {activeIdx < n - 1 ? `Next: ${topics[activeIdx + 1].title}` : 'Last topic in this module'}
        </span>
      </div>
    </div>
  )
}
