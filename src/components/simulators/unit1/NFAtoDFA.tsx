import React, { useState, useEffect } from 'react'
import { presetNFA_aOrBStar, subsetConstruction, type NFA } from '../../../engine/nfa'
import RAGPanel from '../../shared/RAGPanel'
import { consumeRestoreSession } from '../../../engine/archive'
import AutomataCanvas from '../../shared/AutomataCanvas'

export default function NFAtoDFA() {
  const [nfa, setNfa] = useState<NFA>(presetNFA_aOrBStar())
  const [result, setResult] = useState<ReturnType<typeof subsetConstruction> | null>(null)
  const [visibleStep, setVisibleStep] = useState(0)
  const [activeTab, setActiveTab] = useState<'input'|'result'>('input')

  // DFA Handlers
  const handleStateMoved = (id: string, x: number, y: number) => {
    setResult(prev => {
      if (!prev) return prev
      return { ...prev, dfa: { ...prev.dfa, states: prev.dfa.states.map(s => s.id === id ? { ...s, x, y } : s) } }
    })
  }

  const handleStateAdded = (x: number, y: number) => {
    setResult(prev => {
      if (!prev) return prev
      const id = `q${prev.dfa.states.length}`
      return { ...prev, dfa: { ...prev.dfa, states: [...prev.dfa.states, { id, x, y, isStart: prev.dfa.states.length === 0, isFinal: false }] } }
    })
  }

  const handleStateToggled = (id: string, prop: 'isStart' | 'isFinal') => {
    setResult(prev => {
      if (!prev) return prev
      return { ...prev, dfa: { ...prev.dfa, states: prev.dfa.states.map(s => s.id === id ? { ...s, [prop]: !s[prop] } : s) } }
    })
  }

  const handleStateDeleted = (id: string) => {
    setResult(prev => {
      if (!prev) return prev
      return { ...prev, dfa: { 
        ...prev.dfa, 
        states: prev.dfa.states.filter(s => s.id !== id),
        transitions: prev.dfa.transitions.filter(t => t.from !== id && t.to !== id)
      } }
    })
  }

  const handleTransitionAdded = (from: string, to: string) => {
    setResult(prev => {
      if (!prev) return prev
      const sym = prev.dfa.alphabet[0] || 'a'
      return { ...prev, dfa: { ...prev.dfa, transitions: [...prev.dfa.transitions, { from, to, symbol: sym }] } }
    })
  }

  const handleTransitionEdited = (idx: number, newLabel: string) => {
    setResult(prev => {
      if (!prev) return prev
      const copy = [...prev.dfa.transitions]
      copy[idx].symbol = newLabel
      return { ...prev, dfa: { ...prev.dfa, transitions: copy } }
    })
  }

  const handleTransitionDeleted = (idx: number) => {
    setResult(prev => {
      if (!prev) return prev
      const copy = [...prev.dfa.transitions]
      copy.splice(idx, 1)
      return { ...prev, dfa: { ...prev.dfa, transitions: copy } }
    })
  }

  // NFA Handlers
  const handleNfaStateMoved = (id: string, x: number, y: number) => {
    setNfa(prev => ({ ...prev, states: prev.states.map(s => s.id === id ? { ...s, x, y } : s) }))
  }

  const handleNfaStateAdded = (x: number, y: number) => {
    setNfa(prev => {
      const id = `q${prev.states.length}`
      return { ...prev, states: [...prev.states, { id, x, y, isStart: prev.states.length === 0, isFinal: false }] }
    })
  }

  const handleNfaStateToggled = (id: string, prop: 'isStart' | 'isFinal') => {
    setNfa(prev => ({ ...prev, states: prev.states.map(s => s.id === id ? { ...s, [prop]: !s[prop] } : s) }))
  }

  const handleNfaStateDeleted = (id: string) => {
    setNfa(prev => ({ 
      ...prev, 
      states: prev.states.filter(s => s.id !== id),
      transitions: prev.transitions.filter(t => t.from !== id && t.to !== id)
    }))
  }

  const handleNfaTransitionAdded = (from: string, to: string) => {
    setNfa(prev => ({ ...prev, transitions: [...prev.transitions, { from, to, symbol: 'a' }] }))
  }

  const handleNfaTransitionEdited = (idx: number, newLabel: string) => {
    setNfa(prev => {
      const copy = [...prev.transitions]
      copy[idx].symbol = newLabel
      return { ...prev, transitions: copy }
    })
  }

  const handleNfaTransitionDeleted = (idx: number) => {
    setNfa(prev => {
      const copy = [...prev.transitions]
      copy.splice(idx, 1)
      return { ...prev, transitions: copy }
    })
  }

  const convert = () => { 
    const symbols = Array.from(new Set(nfa.transitions.map(t => t.symbol).filter(s => s !== 'ε' && s !== '')))
    const nfaToConvert = { ...nfa, alphabet: symbols.length > 0 ? symbols : nfa.alphabet }
    const r = subsetConstruction(nfaToConvert)
    setResult(r)
    setVisibleStep(r.steps.length > 0 ? r.steps.length - 1 : 0)
    setActiveTab('result')
  }

  useEffect(() => {
    if (!result && activeTab === 'result') {
      convert()
    }
  }, [activeTab, result])


  useEffect(() => {
    const payload = consumeRestoreSession('nfa2dfa')
    if (payload) {
      setNfa(payload)
    }
  }, [])
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 fade-up">
        <span className="font-label text-primary tracking-[0.4em] uppercase text-xs mb-2 block">Unit 01 — Subset Construction</span>
        <h1 className="font-headline text-5xl md:text-7xl italic leading-[1.05] tracking-tighter">
          <span className="prism-text prism-underline active">NFA → DFA</span>
        </h1>
        <p className="mt-4 max-w-xl text-on-surface-variant font-body text-sm leading-relaxed">
          Animated subset construction algorithm. Watch epsilon-closures expand and merge into deterministic states. Create your custom NFA or load one.
        </p>
      </div>

      <div className="glass-panel p-2 rounded-2xl mb-6 fade-up flex justify-center gap-2" style={{ animationDelay: '0.1s' }}>
        <button 
          onClick={() => setActiveTab('input')}
          className={`flex-1 py-3 rounded-xl font-label text-[10px] uppercase tracking-wider font-bold transition-all ${activeTab === 'input' ? 'prism-gradient text-[#131313] shadow-lg' : 'text-cream hover:bg-white/5 opacity-70'} cursor-pointer`}
        >
          Edit Input NFA
        </button>
        <button 
          onClick={() => { setActiveTab('result'); convert() }}
          className={`flex-1 py-3 rounded-xl font-label text-[10px] uppercase tracking-wider font-bold transition-all ${activeTab === 'result' ? 'prism-gradient text-[#131313] shadow-lg' : 'text-cream hover:bg-white/5 opacity-70'} cursor-pointer`}
        >
          Subset Construction Output
        </button>
      </div>

      {activeTab === 'input' && (
        <div className="glass-panel p-4 rounded-2xl fade-up border-2 border-gold/20" style={{ animationDelay: '0.2s', minHeight: 600 }}>
          <div className="flex justify-center items-center gap-6 mb-4 px-2 relative z-10">
            <label className="font-label text-[10px] uppercase tracking-[0.3em] text-lavender/60 block bg-[#131313]/50 px-3 py-1 rounded backdrop-blur border border-white/5">
              Input NFA Designer
            </label>
            <button onClick={() => { setActiveTab('result'); convert() }} className="px-6 py-2 rounded-full border border-gold/40 text-gold text-xs font-label uppercase tracking-widest hover:bg-gold/10 transition-colors cursor-pointer bg-[#131313]/80 backdrop-blur shadow-lg hover:scale-105">
              Convert to DFA
            </button>
          </div>
          <div className="absolute inset-0 z-0">
            <AutomataCanvas 
              states={nfa.states} 
              transitions={nfa.transitions.map((t, idx) => ({ from: t.from, to: t.to, label: t.symbol, originalIndex: idx }))} 
              onStateMoved={handleNfaStateMoved}
              onStateAdded={handleNfaStateAdded}
              onStateToggled={handleNfaStateToggled}
              onStateDeleted={handleNfaStateDeleted}
              onTransitionAdded={handleNfaTransitionAdded}
              onTransitionEdited={handleNfaTransitionEdited}
              onTransitionDeleted={handleNfaTransitionDeleted}
              accentColor="#ffdb3c"
              height={600}
            />
          </div>
        </div>
      )}

      {activeTab === 'result' && result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-panel p-6 rounded-2xl fade-up" style={{ animationDelay: '0.2s' }}>
            <label className="font-label text-[10px] uppercase tracking-[0.3em] text-lavender/60 block mb-4">Construction Steps</label>
            <input type="range" min={0} max={result.steps.length - 1} value={visibleStep} onChange={e => setVisibleStep(+e.target.value)} className="w-full accent-gold mb-4" />
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {result.steps.map((step, i) => (
                <div key={i} className={`p-3 rounded-lg border transition-all duration-300 ${i === visibleStep ? 'border-gold/50 bg-gold/10 scale-105 shadow-[0_0_20px_rgba(255,219,60,0.1)]' : i < visibleStep ? 'border-gold/20 bg-gold/5 text-on-surface/80' : 'border-white/5 bg-white/[0.02] opacity-50'}`}>
                  <div className="text-xs font-body">{step.reason}</div>
                  {step.symbol && <div className="mt-1 text-gold font-label text-[10px] uppercase tracking-widest">On symbol: {step.symbol}</div>}
                </div>
              ))}
            </div>
          </div>
          <div className="glass-panel p-4 rounded-2xl fade-up relative" style={{ animationDelay: '0.3s', minHeight: 500 }}>
            <div className="relative z-10 px-2 pointer-events-none flex justify-center mt-2">
              <label className="font-label text-[10px] uppercase tracking-[0.3em] text-lavender/60 block mb-2 pointer-events-auto w-max bg-[#131313]/50 px-3 py-1 rounded backdrop-blur border border-white/5">
                Resulting DFA ({result.dfa.states.length} states)
              </label>
            </div>
            <div className="absolute inset-0 z-0">
              <AutomataCanvas 
                states={result.dfa.states} 
                transitions={result.dfa.transitions.map((t, idx) => ({ from: t.from, to: t.to, label: t.symbol, originalIndex: idx }))} 
                activeStates={[]}
                onStateMoved={handleStateMoved}
                onStateAdded={handleStateAdded}
                onStateToggled={handleStateToggled}
                onStateDeleted={handleStateDeleted}
                onTransitionAdded={handleTransitionAdded}
                onTransitionEdited={handleTransitionEdited}
                onTransitionDeleted={handleTransitionDeleted}
                accentColor="#ffdb3c"
                height={500}
              />
            </div>
          </div>
        </div>
      )}
      <RAGPanel 
        simulatorId="nfa2dfa" unit="unit1" 
        onLoadAutomata={(type, payload) => {
          if (type === 'nfa') {
            setNfa(payload as NFA)
            setResult(null)
          }
        }} 
      />
    </div>
  )
}
