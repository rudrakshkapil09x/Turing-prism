import React, { useState, useEffect } from 'react'
import { presetDFA_evenZeros, minimizeDFA, type DFA } from '../../../engine/dfa'
import RAGPanel from '../../shared/RAGPanel'
import { consumeRestoreSession } from '../../../engine/archive'
import AutomataCanvas from '../../shared/AutomataCanvas'

export default function DFAMinimizer() {
  const [dfa, setDfa] = useState<DFA>(presetDFA_evenZeros())
  const [result, setResult] = useState<ReturnType<typeof minimizeDFA> | null>(null)
  const [visibleStep, setVisibleStep] = useState(0)
  const handleInputStateMoved = (id: string, x: number, y: number) => {
    setDfa(prev => ({ ...prev, states: prev.states.map(s => s.id === id ? { ...s, x, y } : s) }))
  }

  const handleInputStateAdded = (x: number, y: number) => {
    setDfa(prev => {
      const id = `q${prev.states.length}`
      return { ...prev, states: [...prev.states, { id, x, y, isStart: prev.states.length === 0, isFinal: false }] }
    })
  }

  const handleInputStateToggled = (id: string, prop: 'isStart' | 'isFinal') => {
    setDfa(prev => ({ ...prev, states: prev.states.map(s => s.id === id ? { ...s, [prop]: !s[prop] } : s) }))
  }

  const handleInputStateDeleted = (id: string) => {
    setDfa(prev => ({ 
      ...prev, 
      states: prev.states.filter(s => s.id !== id),
      transitions: prev.transitions.filter(t => t.from !== id && t.to !== id)
    }))
  }

  const handleInputTransitionAdded = (from: string, to: string) => {
    setDfa(prev => {
      const sym = prev.alphabet[0] || 'a'
      return { ...prev, transitions: [...prev.transitions, { from, to, symbol: sym }] }
    })
  }

  const handleInputTransitionEdited = (idx: number, newLabel: string) => {
    setDfa(prev => {
      const copy = [...prev.transitions]
      copy[idx].symbol = newLabel
      // ensure we expand alphabet if they use new symbols interactively
      const newAlph = new Set(prev.alphabet)
      newLabel.split(',').forEach(char => newAlph.add(char.trim()))
      return { ...prev, transitions: copy, alphabet: Array.from(newAlph) }
    })
  }

  const handleInputTransitionDeleted = (idx: number) => {
    setDfa(prev => {
      const copy = [...prev.transitions]
      copy.splice(idx, 1)
      return { ...prev, transitions: copy }
    })
  }

  const handleStateMoved = (id: string, x: number, y: number) => {
    setResult(prev => {
      if (!prev) return prev
      return { ...prev, minimizedDFA: { ...prev.minimizedDFA, states: prev.minimizedDFA.states.map(s => s.id === id ? { ...s, x, y } : s) } }
    })
  }

  const handleStateAdded = (x: number, y: number) => {
    setResult(prev => {
      if (!prev) return prev
      const id = `q${prev.minimizedDFA.states.length}`
      return { ...prev, minimizedDFA: { ...prev.minimizedDFA, states: [...prev.minimizedDFA.states, { id, x, y, isStart: prev.minimizedDFA.states.length === 0, isFinal: false }] } }
    })
  }

  const handleStateToggled = (id: string, prop: 'isStart' | 'isFinal') => {
    setResult(prev => {
      if (!prev) return prev
      return { ...prev, minimizedDFA: { ...prev.minimizedDFA, states: prev.minimizedDFA.states.map(s => s.id === id ? { ...s, [prop]: !s[prop] } : s) } }
    })
  }

  const handleStateDeleted = (id: string) => {
    setResult(prev => {
      if (!prev) return prev
      return { ...prev, minimizedDFA: { 
        ...prev.minimizedDFA, 
        states: prev.minimizedDFA.states.filter(s => s.id !== id),
        transitions: prev.minimizedDFA.transitions.filter(t => t.from !== id && t.to !== id)
      } }
    })
  }

  const handleTransitionAdded = (from: string, to: string) => {
    setResult(prev => {
      if (!prev) return prev
      const sym = prev.minimizedDFA.alphabet[0] || 'a'
      return { ...prev, minimizedDFA: { ...prev.minimizedDFA, transitions: [...prev.minimizedDFA.transitions, { from, to, symbol: sym }] } }
    })
  }

  const handleTransitionEdited = (idx: number, newLabel: string) => {
    setResult(prev => {
      if (!prev) return prev
      const copy = [...prev.minimizedDFA.transitions]
      copy[idx].symbol = newLabel
      return { ...prev, minimizedDFA: { ...prev.minimizedDFA, transitions: copy } }
    })
  }

  const handleTransitionDeleted = (idx: number) => {
    setResult(prev => {
      if (!prev) return prev
      const copy = [...prev.minimizedDFA.transitions]
      copy.splice(idx, 1)
      return { ...prev, minimizedDFA: { ...prev.minimizedDFA, transitions: copy } }
    })
  }

  // Auto-run on mount
  useEffect(() => {
    const r = minimizeDFA(dfa)
    setResult(r)
    setVisibleStep(r.steps.length - 1)
  }, [])

  const minimize = () => { 
    const r = minimizeDFA(dfa)
    setResult(r)
    setVisibleStep(0) 
  }


  useEffect(() => {
    const payload = consumeRestoreSession('dfa-min')
    if (payload) {
      if (payload) { setDfa(payload); setResult(null); }
    }
  }, [])
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 fade-up">
        <span className="font-label text-primary tracking-[0.4em] uppercase text-xs mb-2 block">Unit 01 — Table-Filling Algorithm</span>
        <h1 className="font-headline text-5xl md:text-7xl italic leading-[1.05] tracking-tighter">
          <span className="prism-text prism-underline active">DFA Minimizer</span>
        </h1>
        <p className="mt-4 max-w-xl text-on-surface-variant font-body text-sm leading-relaxed">
          Watch the table-filling algorithm identify distinguishable states and merge equivalent ones to produce the minimal DFA.
        </p>
      </div>

      <div className="glass-panel p-6 rounded-2xl mb-6 fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex justify-between items-center mb-4">
          <label className="font-label text-[10px] uppercase tracking-[0.3em] text-lavender/60 block">Input DFA To Minimize</label>
          <button onClick={minimize} className="prism-gradient px-8 py-3 rounded-full text-[#131313] font-label text-[10px] uppercase tracking-wider font-bold cursor-pointer hover:scale-105 transition-transform">
            Run Minimization
          </button>
        </div>
        <div className="text-[9px] font-label text-on-surface-variant/30 mb-2">Dbl-click to add states · Shift+drag to connect</div>
        <AutomataCanvas
          states={dfa.states}
          transitions={dfa.transitions.map((t, idx) => ({ from: t.from, to: t.to, label: t.symbol, originalIndex: idx }))}
          activeStates={[]}
          onStateMoved={handleInputStateMoved}
          onStateAdded={handleInputStateAdded}
          onStateToggled={handleInputStateToggled}
          onStateDeleted={handleInputStateDeleted}
          onTransitionAdded={handleInputTransitionAdded}
          onTransitionEdited={handleInputTransitionEdited}
          onTransitionDeleted={handleInputTransitionDeleted}
          accentColor="#a78bfa"
          height={320}
        />
      </div>

      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-panel p-6 rounded-2xl fade-up" style={{ animationDelay: '0.2s' }}>
              <label className="font-label text-[10px] uppercase tracking-[0.3em] text-lavender/60 block mb-4">Steps</label>
              <input type="range" min={0} max={result.steps.length - 1} value={visibleStep} onChange={e => setVisibleStep(+e.target.value)} className="w-full accent-gold mb-4" />
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {result.steps.map((step, i) => (
                  <div key={i} className={'p-3 rounded-lg border transition-all duration-300 ' + (i === visibleStep ? 'border-gold/50 bg-gold/10 scale-105 shadow-[0_0_20px_rgba(255,219,60,0.1)]' : i < visibleStep ? 'border-gold/20 bg-gold/5 text-on-surface/80' : 'border-white/5 bg-white/[0.02] opacity-50')}>
                    <div className="text-xs font-body">{step.reason}</div>
                    {step.marked && step.marked.length > 0 && <div className="mt-1 text-gold font-label text-[10px] uppercase tracking-widest">Marked: {step.marked.map((p: any) => '(' + p[0] + ',' + p[1] + ')').join(' ')}</div>}
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-panel p-4 rounded-2xl fade-up" style={{ animationDelay: '0.25s' }}>
              <label className="font-label text-[10px] uppercase tracking-[0.3em] text-lavender/60 block mb-3">
                Minimal DFA — {result.minimizedDFA.states.length} states (original had {dfa.states.length})
              </label>
              <div className="text-[9px] font-label text-on-surface-variant/30 mb-2">Dbl-click to add states · Shift+drag to connect</div>
              <AutomataCanvas
                states={result.minimizedDFA.states}
                transitions={result.minimizedDFA.transitions.map((t, idx) => ({ from: t.from, to: t.to, label: t.symbol, originalIndex: idx }))}
                activeStates={[]}
                onStateMoved={handleStateMoved}
                onStateAdded={handleStateAdded}
                onStateToggled={handleStateToggled}
                onStateDeleted={handleStateDeleted}
                onTransitionAdded={handleTransitionAdded}
                onTransitionEdited={handleTransitionEdited}
                onTransitionDeleted={handleTransitionDeleted}
                accentColor="#ffdb3c"
                height={420}
              />
            </div>
          </div>
        </div>
      )}
      <RAGPanel 
        simulatorId="dfa-min" unit="unit1" 
        onLoadAutomata={(type, payload) => {
          if (type === 'dfa') {
            setDfa(payload as DFA)
            setResult(null)
          }
        }} 
      />
    </div>
  )
}
