import React, { useState, useRef, useEffect, useCallback } from 'react'
import { type DFA, type DFAState, type DFATransition, type DFAStepResult, createEmptyDFA, simulateDFA, presetDFA_endsWithABB, presetDFA_evenZeros } from '../../../engine/dfa'
import RAGPanel from '../../shared/RAGPanel'
import { consumeRestoreSession } from '../../../engine/archive'
import AutomataCanvas from '../../shared/AutomataCanvas'

export default function DFASimulator() {
  const [dfa, setDfa] = useState<DFA>(presetDFA_endsWithABB())
  const [testInput, setTestInput] = useState('ababb')
  const [steps, setSteps] = useState<DFAStepResult[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const playRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-run on mount to show immediate results
  useEffect(() => {
    const result = simulateDFA(dfa, testInput)
    setSteps(result)
    setCurrentStep(0)
  }, [])

  // Auto-play
  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      playRef.current = setTimeout(() => setCurrentStep(s => s + 1), 600)
    } else {
      setIsPlaying(false)
    }
    return () => { if (playRef.current) clearTimeout(playRef.current) }
  }, [isPlaying, currentStep, steps.length])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return
      if (e.key === 'Enter' && !e.ctrlKey) runSimulation()
      if (e.key === ' ' && steps.length > 0) { e.preventDefault(); setIsPlaying(p => !p) }
      if (e.key === 'ArrowRight' && steps.length > 0) setCurrentStep(s => Math.min(s + 1, steps.length - 1))
      if (e.key === 'ArrowLeft' && steps.length > 0) setCurrentStep(s => Math.max(s - 1, 0))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [steps.length])

  // Listen for bottom bar actions
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

  const runSimulation = useCallback(() => {
    const result = simulateDFA(dfa, testInput)
    setSteps(result)
    setCurrentStep(0)
    setIsPlaying(false)
    setShowResult(true)
    setTimeout(() => setShowResult(false), 600)
  }, [dfa, testInput])

  const addState = () => {
    const id = `q${dfa.states.length}`
    const newState: DFAState = {
      id, x: 150 + Math.random() * 500, y: 100 + Math.random() * 300,
      isStart: dfa.states.length === 0, isFinal: false,
    }
    setDfa({ ...dfa, states: [...dfa.states, newState] })
  }

  const handleStateMoved = (id: string, x: number, y: number) => {
    setDfa(prev => ({ ...prev, states: prev.states.map(s => s.id === id ? { ...s, x, y } : s) }))
  }

  const handleStateAdded = (x: number, y: number) => {
    const id = `q${dfa.states.length}`
    const newState: DFAState = { id, x, y, isStart: dfa.states.length === 0, isFinal: false }
    setDfa(prev => ({ ...prev, states: [...prev.states, newState] }))
  }

  const handleStateToggled = (id: string, prop: 'isStart' | 'isFinal') => {
    if (prop === 'isStart') {
      setDfa(prev => ({ ...prev, states: prev.states.map(s => ({ ...s, isStart: s.id === id ? !s.isStart : false })) }))
    } else {
      setDfa(prev => ({ ...prev, states: prev.states.map(s => s.id === id ? { ...s, isFinal: !s.isFinal } : s) }))
    }
  }

  const handleStateDeleted = (id: string) => {
    setDfa(prev => ({ 
      ...prev, 
      states: prev.states.filter(s => s.id !== id),
      transitions: prev.transitions.filter(t => t.from !== id && t.to !== id)
    }))
  }

  const handleTransitionAdded = (from: string, to: string) => {
    const defaultSymbol = dfa.alphabet[0] || 'a'
    setDfa(prev => {
      const exists = prev.transitions.find(t => t.from === from && t.to === to && t.symbol === defaultSymbol)
      if (exists) return prev
      return { ...prev, transitions: [...prev.transitions, { from, to, symbol: defaultSymbol }] }
    })
  }

  const handleTransitionEdited = (idx: number, newLabel: string) => {
    setDfa(prev => {
      const copy = [...prev.transitions]
      copy[idx].symbol = newLabel
      const ab = new Set(prev.alphabet)
      ab.add(newLabel)
      return { ...prev, transitions: copy, alphabet: Array.from(ab) }
    })
  }

  const handleTransitionDeleted = (idx: number) => {
    setDfa(prev => {
      const copy = [...prev.transitions]
      copy.splice(idx, 1)
      return { ...prev, transitions: copy }
    })
  }

  const currentActiveState = steps[currentStep]?.currentState
  const lastStep = steps[steps.length - 1]




  useEffect(() => {
    const payload = consumeRestoreSession('dfa')
    if (payload) {
      setDfa(payload)
    }
  }, [])
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 fade-up">
        <span className="font-label text-primary tracking-[0.4em] uppercase text-xs mb-2 block">Unit 01 — Finite Automata</span>
        <h1 className="font-headline text-5xl md:text-7xl italic leading-[1.05] tracking-tighter">
          <span className="prism-text prism-underline active">DFA Simulator</span>
        </h1>
        <p className="mt-4 max-w-xl text-on-surface-variant font-body text-sm leading-relaxed">
          Build, customize, and simulate Deterministic Finite Automata. Click the canvas to add states, drag to reposition, and connect with transitions.
        </p>
        <div className="mt-3 flex gap-3 text-[9px] font-label uppercase tracking-wider text-on-surface-variant/30">
          <span>Enter → Simulate</span>
          <span>Space → Play/Pause</span>
          <span>← → → Step</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Panel */}
        <div className="lg:col-span-4 space-y-4">
          {/* Presets */}
          <div className="glass-panel p-6 rounded-2xl fade-up" style={{ animationDelay: '0.1s' }}>
            <label className="font-label text-[10px] uppercase tracking-[0.3em] text-lavender/60 block mb-4">Presets</label>
            <div className="flex flex-col gap-2">
              <button onClick={() => { setDfa(presetDFA_endsWithABB()); setSteps([]); setCurrentStep(0) }} className="text-left px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-cream text-sm font-body cursor-pointer border border-transparent hover:border-white/10">
                <span className="text-gold font-label text-[10px] uppercase tracking-wider">Preset 1</span>
                <div>Ends with "abb"</div>
              </button>
              <button onClick={() => { setDfa(presetDFA_evenZeros()); setSteps([]); setCurrentStep(0) }} className="text-left px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-cream text-sm font-body cursor-pointer border border-transparent hover:border-white/10">
                <span className="text-gold font-label text-[10px] uppercase tracking-wider">Preset 2</span>
                <div>Even number of 0s</div>
              </button>
            </div>
          </div>

          {/* Build controls */}
          <div className="glass-panel p-6 rounded-2xl fade-up" style={{ animationDelay: '0.15s' }}>
            <label className="font-label text-[10px] uppercase tracking-[0.3em] text-lavender/60 block mb-4">Build</label>
            <div className="flex gap-2 mb-4">
              <button onClick={addState} className="flex-1 py-2 px-4 rounded-lg bg-violet/10 border border-violet/30 text-lavender text-xs font-label uppercase tracking-wider hover:bg-violet/20 transition-colors cursor-pointer">
                + State
              </button>
              <button onClick={() => setDfa(createEmptyDFA())} className="py-2 px-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-label uppercase tracking-wider hover:bg-red-500/20 transition-colors cursor-pointer">
                Clear
              </button>
            </div>
          </div>

          {/* Test input */}
          <div className="glass-panel p-6 rounded-2xl fade-up" style={{ animationDelay: '0.2s' }}>
            <label className="font-label text-[10px] uppercase tracking-[0.3em] text-lavender/60 block mb-4">Test String</label>
            <input
              value={testInput}
              onChange={e => setTestInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); runSimulation() }}}
              className="w-full bg-transparent border-b-2 border-white/10 py-3 text-2xl font-headline italic text-cream focus:outline-none focus:border-gold transition-all"
              placeholder="Enter string..."
            />
            <div className="mt-4 flex gap-2">
              <button onClick={runSimulation} className="flex-1 py-2 prism-gradient rounded-lg text-[#131313] font-label text-[10px] uppercase tracking-wider font-bold cursor-pointer hover:scale-105 transition-transform">
                Simulate
              </button>
              <button onClick={() => { setIsPlaying(true) }} disabled={steps.length === 0} className="py-2 px-4 rounded-lg bg-white/5 border border-white/10 text-cream text-xs font-label uppercase tracking-wider disabled:opacity-30 cursor-pointer hover:bg-white/10 transition-colors">
                Play
              </button>
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
                  <span className={`font-bold transition-all ${showResult ? 'result-flash' : ''} ${lastStep?.accepted === true ? 'text-green-400' : lastStep?.accepted === false ? 'text-red-400' : 'text-on-surface-variant'}`}>
                    {lastStep?.accepted === true ? '✓ ACCEPTED' : lastStep?.accepted === false ? '✗ REJECTED' : 'Running...'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Alphabet & transition table */}
          <div className="glass-panel p-6 rounded-2xl fade-up" style={{ animationDelay: '0.25s' }}>
            <label className="font-label text-[10px] uppercase tracking-[0.3em] text-lavender/60 block mb-4">Alphabet Σ = {`{${dfa.alphabet.join(', ')}}`}</label>
            <div className="text-xs text-on-surface-variant space-y-1 max-h-48 overflow-y-auto">
              {dfa.transitions.map((t, i) => (
                <div key={i} className="flex justify-between items-center py-1 border-b border-white/5 hover:bg-white/[0.02] transition-colors rounded px-1">
                  <span>δ({t.from}, {t.symbol}) = {t.to}</span>
                  <button onClick={() => setDfa(prev => ({ ...prev, transitions: prev.transitions.filter((_, j) => j !== i) }))} className="text-red-400/50 hover:text-red-400 cursor-pointer text-[10px]">✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="lg:col-span-8 overflow-x-auto pb-4">
          <div className="glass-panel rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative fade-up min-w-[700px]" style={{ minHeight: 500, animationDelay: '0.1s' }}>
            {/* HUD */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse shadow-[0_0_10px_#ffdb3c]" />
              <span className="font-label text-[10px] uppercase tracking-[0.3em] text-cream">
                {steps.length > 0 ? 'State: ' + steps[currentStep]?.currentState : 'Interactive Canvas'}
              </span>
            </div>

            <AutomataCanvas 
              states={dfa.states} 
              transitions={dfa.transitions.map((t, idx) => ({ from: t.from, to: t.to, label: t.symbol, originalIndex: idx }))} 
              activeStates={currentActiveState ? [currentActiveState] : []}
              onStateMoved={handleStateMoved}
              onStateAdded={handleStateAdded}
              onStateToggled={handleStateToggled}
              onStateDeleted={handleStateDeleted}
              onTransitionAdded={handleTransitionAdded}
              onTransitionEdited={handleTransitionEdited}
              onTransitionDeleted={handleTransitionDeleted}
              accentColor="#ffdb3c"
            />
            {/* Input string visualization */}
            {steps.length > 0 && (
              <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-1">
                <span className="text-[9px] font-label text-on-surface-variant/50 tracking-widest uppercase">Input Tape</span>
                <div className="flex bg-black/40 p-1.5 rounded-xl backdrop-blur-md border border-white/5">
                  {testInput.split('').map((ch, i) => (
                    <div key={i} className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-label transition-all
                      ${i === currentStep ? 'bg-gold/20 text-gold border border-gold/40 shadow-[0_0_10px_rgba(255,219,60,0.2)]' : 
                        i < currentStep ? 'text-lavender' : 'text-on-surface-variant'
                      }`}
                    >
                      {ch}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>


        </div>
      </div>
      <RAGPanel 
        simulatorId="dfa" unit="unit1" 
        onLoadAutomata={(type, payload) => {
          if (type === 'dfa') {
            setDfa(payload as DFA)
            setSteps([])
            setCurrentStep(0)
          }
        }} 
      />
    </div>
  )
}
