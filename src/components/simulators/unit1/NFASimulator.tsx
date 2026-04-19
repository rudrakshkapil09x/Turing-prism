import React, { useState, useEffect } from 'react'
import RAGPanel from '../../shared/RAGPanel'
import { consumeRestoreSession } from '../../../engine/archive'
import { type NFA, type NFAStepResult, simulateNFA, presetNFA_aOrBStar } from '../../../engine/nfa'
import AutomataCanvas from '../../shared/AutomataCanvas'

export default function NFASimulator() {
  const [nfa, setNfa] = useState<NFA>(presetNFA_aOrBStar())
  const [testInput, setTestInput] = useState('aba')
  const [steps, setSteps] = useState<NFAStepResult[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showResult, setShowResult] = useState(false)

  // Auto-run on mount
  useEffect(() => {
    const r = simulateNFA(nfa, testInput)
    setSteps(r)
    setCurrentStep(0)
  }, [])

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      const t = setTimeout(() => setCurrentStep(s => s + 1), 700)
      return () => clearTimeout(t)
    } else setIsPlaying(false)
  }, [isPlaying, currentStep, steps.length])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') runSimulation()
      if (e.key === ' ' && steps.length > 0) { e.preventDefault(); setIsPlaying(p => !p) }
      if (e.key === 'ArrowRight' && steps.length > 0) setCurrentStep(s => Math.min(s + 1, steps.length - 1))
      if (e.key === 'ArrowLeft' && steps.length > 0) setCurrentStep(s => Math.max(s - 1, 0))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [steps.length])

  // Bottom bar events
  useEffect(() => {
    const handler = (e: Event) => {
      const action = (e as CustomEvent).detail?.action
      if (action === 'play') setIsPlaying(true)
      if (action === 'step') setCurrentStep(s => Math.min(s + 1, steps.length - 1))
      if (action === 'reset') { setCurrentStep(0); setIsPlaying(false) }
    }
    window.addEventListener('simulator-action', handler)
    return () => window.removeEventListener('simulator-action', handler)
  }, [steps.length])

  const runSimulation = () => {
    const r = simulateNFA(nfa, testInput)
    setSteps(r)
    setCurrentStep(0)
    setShowResult(true)
    setTimeout(() => setShowResult(false), 600)
  }

  const handleStateMoved = (id: string, x: number, y: number) => {
    setNfa(prev => ({ ...prev, states: prev.states.map(s => s.id === id ? { ...s, x, y } : s) }))
  }

  const handleStateAdded = (x: number, y: number) => {
    const id = `q${nfa.states.length}`
    setNfa(prev => ({ ...prev, states: [...prev.states, { id, x, y, isStart: prev.states.length === 0, isFinal: false }] }))
  }

  const handleStateToggled = (id: string, prop: 'isStart' | 'isFinal') => {
    setNfa(prev => ({ ...prev, states: prev.states.map(s => s.id === id ? { ...s, [prop]: !s[prop] } : s) }))
  }

  const handleStateDeleted = (id: string) => {
    setNfa(prev => ({ 
      ...prev, 
      states: prev.states.filter(s => s.id !== id),
      transitions: prev.transitions.filter(t => t.from !== id && t.to !== id)
    }))
  }

  const handleTransitionAdded = (from: string, to: string) => {
    setNfa(prev => ({ ...prev, transitions: [...prev.transitions, { from, to, symbol: 'ε' }] }))
  }

  const handleTransitionEdited = (idx: number, newLabel: string) => {
    setNfa(prev => {
      const copy = [...prev.transitions]
      copy[idx].symbol = newLabel
      const ab = new Set(prev.alphabet)
      if (newLabel !== 'ε') ab.add(newLabel)
      return { ...prev, transitions: copy, alphabet: Array.from(ab) }
    })
  }

  const handleTransitionDeleted = (idx: number) => {
    setNfa(prev => {
      const copy = [...prev.transitions]
      copy.splice(idx, 1)
      return { ...prev, transitions: copy }
    })
  }

  const activeStates = steps[currentStep]?.activeStates ?? []
  const lastStep = steps[steps.length - 1]


  useEffect(() => {
    const payload = consumeRestoreSession('nfa')
    if (payload) {
      setNfa(payload)
    }
  }, [])
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 fade-up">
        <span className="font-label text-primary tracking-[0.4em] uppercase text-xs mb-2 block">Unit 01 — Finite Automata</span>
        <h1 className="font-headline text-5xl md:text-7xl italic leading-[1.05] tracking-tighter">
          <span className="prism-text prism-underline active">NFA Simulator</span>
        </h1>
        <p className="mt-4 max-w-xl text-on-surface-variant font-body text-sm leading-relaxed">
          Nondeterministic Finite Automata with ε-transitions. Multiple states can be active simultaneously — watch them all light up.
        </p>
        <div className="mt-3 flex gap-3 text-[9px] font-label uppercase tracking-wider text-on-surface-variant/30">
          <span>Enter → Simulate</span>
          <span>Space → Play/Pause</span>
          <span>← → → Step</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-6 rounded-2xl fade-up" style={{ animationDelay: '0.1s' }}>
            <label className="font-label text-[10px] uppercase tracking-[0.3em] text-lavender/60 block mb-4">Preset</label>
            <button onClick={() => { setNfa(presetNFA_aOrBStar()); setSteps([]) }} className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-cream text-sm border border-transparent hover:border-white/10 cursor-pointer">
              <span className="text-gold font-label text-[10px] uppercase tracking-wider">NFA</span>
              <div>(a|b)* — accepts any combo of a,b</div>
            </button>
          </div>
          <div className="glass-panel p-6 rounded-2xl fade-up" style={{ animationDelay: '0.15s' }}>
            <label className="font-label text-[10px] uppercase tracking-[0.3em] text-lavender/60 block mb-4">Build</label>
            <button onClick={() => handleStateAdded(150 + Math.random() * 200, 150 + Math.random() * 200)} className="w-full py-2 px-4 rounded-lg bg-violet/10 border border-violet/30 text-lavender text-xs font-label uppercase tracking-wider hover:bg-violet/20 transition-colors cursor-pointer">+ Add State</button>
          </div>
          <div className="glass-panel p-6 rounded-2xl fade-up" style={{ animationDelay: '0.2s' }}>
            <label className="font-label text-[10px] uppercase tracking-[0.3em] text-lavender/60 block mb-4">Test String</label>
            <input value={testInput} onChange={e => setTestInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); runSimulation() }}} className="w-full bg-transparent border-b-2 border-white/10 py-3 text-2xl font-headline italic text-cream focus:outline-none focus:border-gold" placeholder="Enter string..." />
            <div className="mt-4 flex gap-2">
              <button onClick={runSimulation} className="flex-1 py-2 prism-gradient rounded-lg text-[#131313] font-label text-[10px] uppercase tracking-wider font-bold cursor-pointer hover:scale-105 transition-transform">Simulate</button>
              <button onClick={() => setIsPlaying(true)} disabled={steps.length === 0} className="py-2 px-4 rounded-lg bg-white/5 border border-white/10 text-cream text-xs font-label uppercase disabled:opacity-30 cursor-pointer hover:bg-white/10 transition-colors">Play</button>
            </div>
            {steps.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <button onClick={() => setCurrentStep(s => Math.max(s - 1, 0))} disabled={currentStep === 0} className="w-8 h-8 rounded shrink-0 bg-white/5 border border-white/10 flex items-center justify-center text-cream hover:bg-white/10 disabled:opacity-30 cursor-pointer text-xs transition-colors">◀</button>
                  <input type="range" min={0} max={steps.length - 1} value={currentStep} onChange={e => setCurrentStep(+e.target.value)} className="w-full accent-gold" />
                  <button onClick={() => setCurrentStep(s => Math.min(s + 1, steps.length - 1))} disabled={currentStep === steps.length - 1} className="w-8 h-8 rounded shrink-0 bg-white/5 border border-white/10 flex items-center justify-center text-cream hover:bg-white/10 disabled:opacity-30 cursor-pointer text-xs transition-colors">▶</button>
                </div>
                <div className="flex justify-between text-xs text-on-surface-variant mt-1">
                  <span>Step {currentStep}/{steps.length - 1}</span>
                  <span className="max-w-[120px] truncate">Active: {activeStates.join(', ') || '∅'}</span>
                  <span className={`font-bold ${showResult ? 'result-flash' : ''} ${lastStep?.accepted ? 'text-green-400' : lastStep?.accepted === false ? 'text-red-400' : ''}`}>
                    {lastStep?.accepted === true ? '✓ ACCEPTED' : lastStep?.accepted === false ? '✗ REJECTED' : ''}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="glass-panel p-6 rounded-2xl fade-up" style={{ animationDelay: '0.25s' }}>
            <label className="font-label text-[10px] uppercase tracking-[0.3em] text-lavender/60 block mb-3">Transitions</label>
            <div className="text-xs text-on-surface-variant space-y-1 max-h-48 overflow-y-auto">
              {nfa.transitions.map((t, i) => (
                <div key={i} className="py-1 border-b border-white/5 hover:bg-white/[0.02] transition-colors rounded px-1">δ({t.from}, {t.symbol}) → {t.to}</div>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-8 overflow-x-auto pb-4">
          <div className="glass-panel rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)] fade-up min-w-[700px] relative" style={{ minHeight: 500, animationDelay: '0.1s' }}>
            <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-violet animate-pulse shadow-[0_0_10px_#7b61ff]" />
              <span className="font-label text-[10px] uppercase tracking-[0.3em] text-cream">NFA — Multiple active states</span>
            </div>
            <AutomataCanvas 
              states={nfa.states} 
              transitions={nfa.transitions.map((t, idx) => ({ from: t.from, to: t.to, label: t.symbol, originalIndex: idx }))} 
              activeStates={activeStates}
              onStateMoved={handleStateMoved}
              onStateAdded={handleStateAdded}
              onStateToggled={handleStateToggled}
              onStateDeleted={handleStateDeleted}
              onTransitionAdded={handleTransitionAdded}
              onTransitionEdited={handleTransitionEdited}
              onTransitionDeleted={handleTransitionDeleted}
              accentColor="#7b61ff"
            />
          </div>
        </div>
      </div>
      <RAGPanel 
        simulatorId="nfa" unit="unit1" 
        onLoadAutomata={(type, payload) => {
          if (type === 'nfa') {
            setNfa(payload as NFA)
            setSteps([])
            setCurrentStep(0)
          }
        }} 
      />
    </div>
  )
}
