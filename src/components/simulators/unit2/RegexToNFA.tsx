import React, { useState, useEffect } from 'react'
import { regexToNFA } from '../../../engine/regex'
import type { NFA } from '../../../engine/nfa'
import RAGPanel from '../../shared/RAGPanel'
import { consumeRestoreSession } from '../../../engine/archive'
import AutomataCanvas from '../../shared/AutomataCanvas'

export default function RegexToNFA() {
  const [regex, setRegex] = useState('(a|b)*abb')
  const [nfa, setNfa] = useState<NFA | null>(null)
  const handleStateMoved = (id: string, x: number, y: number) => {
    setNfa(prev => prev ? ({ ...prev, states: prev.states.map(s => s.id === id ? { ...s, x, y } : s) }) : null)
  }

  const handleStateAdded = (x: number, y: number) => {
    setNfa(prev => {
      if (!prev) return prev
      const id = `q${prev.states.length}`
      return { ...prev, states: [...prev.states, { id, x, y, isStart: prev.states.length === 0, isFinal: false }] }
    })
  }

  const handleStateToggled = (id: string, prop: 'isStart' | 'isFinal') => {
    setNfa(prev => prev ? ({ ...prev, states: prev.states.map(s => s.id === id ? { ...s, [prop]: !s[prop] } : s) }) : null)
  }

  const handleStateDeleted = (id: string) => {
    setNfa(prev => prev ? ({ 
      ...prev, 
      states: prev.states.filter(s => s.id !== id),
      transitions: prev.transitions.filter(t => t.from !== id && t.to !== id)
    }) : null)
  }

  const handleTransitionAdded = (from: string, to: string) => {
    setNfa(prev => prev ? ({ ...prev, transitions: [...prev.transitions, { from, to, symbol: 'ε' }] }) : null)
  }

  const handleTransitionEdited = (idx: number, newLabel: string) => {
    setNfa(prev => {
      if (!prev) return prev
      const copy = [...prev.transitions]
      copy[idx].symbol = newLabel
      const ab = new Set(prev.alphabet)
      if (newLabel !== 'ε') ab.add(newLabel)
      return { ...prev, transitions: copy, alphabet: Array.from(ab) }
    })
  }

  const handleTransitionDeleted = (idx: number) => {
    setNfa(prev => {
      if (!prev) return prev
      const copy = [...prev.transitions]
      copy.splice(idx, 1)
      return { ...prev, transitions: copy }
    })
  }

  useEffect(() => {
    convert()
  }, [])

  const convert = () => { try { setNfa(regexToNFA(regex)) } catch { setNfa(null) } }


  useEffect(() => {
    const payload = consumeRestoreSession('regex2nfa')
    if (payload) {
      if (payload) { setRegex(payload.regex || ""); }
    }
  }, [])
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 fade-up">
        <span className="font-label text-primary tracking-[0.4em] uppercase text-xs mb-2 block">Unit 02 — Thompson's Construction</span>
        <h1 className="font-headline text-5xl md:text-7xl italic leading-[1.05] tracking-tighter text-fade-reveal">
          <span className="prism-text prism-underline active">Regex → NFA</span>
        </h1>
        <p className="mt-4 max-w-xl text-on-surface-variant font-body text-sm leading-relaxed">
          Enter any regular expression and watch Thompson's construction build the equivalent NFA step by step.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-8 rounded-2xl fade-up" style={{ animationDelay: '0.1s' }}>
            <label className="font-label text-[10px] uppercase tracking-[0.3em] text-lavender/60 block mb-6">Regular Expression</label>
            <input value={regex} onChange={e => setRegex(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); convert() }}} className="w-full bg-transparent border-b-2 border-white/10 py-4 text-3xl font-headline italic text-cream focus:outline-none focus:border-gold transition-all" placeholder="(a|b)*abb" />
            <div className="mt-6 flex gap-3">
              <button onClick={convert} className="flex-1 py-3 prism-gradient rounded-lg text-[#131313] font-label text-[10px] uppercase tracking-wider font-bold cursor-pointer hover:scale-105 transition-transform">Build NFA</button>
            </div>
            <div className="mt-6 flex flex-col gap-2">
              {['(a|b)*abb', 'a*b*', '(ab|ba)*', 'a(a|b)*b'].map(p => (
                <button key={p} onClick={() => { setRegex(p); try { setNfa(regexToNFA(p)) } catch { setNfa(null) } }} className="text-left px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-on-surface-variant text-xs border border-transparent hover:border-white/10 cursor-pointer font-label">
                  {p}
                </button>
              ))}
            </div>
            {nfa && (
              <div className="mt-6 space-y-2 fade-up">
                <div className="flex justify-between text-xs text-on-surface-variant"><span>States</span><span className="text-cream">{nfa.states.length}</span></div>
                <div className="flex justify-between text-xs text-on-surface-variant"><span>Transitions</span><span className="text-cream">{nfa.transitions.length}</span></div>
                <div className="flex justify-between text-xs text-on-surface-variant"><span>Alphabet</span><span className="text-cream">{`{${nfa.alphabet.join(', ')}}`}</span></div>
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-8 overflow-x-auto pb-4 mask-h">
          <div className="glass-panel rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)] fade-up min-w-[700px]" style={{ minHeight: 500, animationDelay: '0.2s' }}>
            {nfa ? (
              <AutomataCanvas 
                states={nfa.states} 
                transitions={nfa.transitions.map((t, idx) => ({ from: t.from, to: t.to, label: t.symbol, originalIndex: idx }))} 
                activeStates={[]}
                onStateMoved={handleStateMoved}
                onStateAdded={handleStateAdded}
                onStateToggled={handleStateToggled}
                onStateDeleted={handleStateDeleted}
                onTransitionAdded={handleTransitionAdded}
                onTransitionEdited={handleTransitionEdited}
                onTransitionDeleted={handleTransitionDeleted}
                accentColor="#ffdb3c"
              />
            ) : (
              <div className="flex items-center justify-center h-full min-h-[500px]">
                <div className="text-center fade-up">
                  <span className="material-symbols-outlined text-6xl text-white/10 mb-4 block">warning</span>
                  <p className="text-red-400/80 text-sm font-label uppercase tracking-widest">Invalid Regular Expression</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <RAGPanel 
        simulatorId="regex2nfa" unit="unit2" 
        onLoadAutomata={(type, payload) => {
          if (type === 'regex') {
            setRegex(payload)
            try { setNfa(regexToNFA(payload)) } catch { setNfa(null) }
          }
        }} 
      />
    </div>
  )
}
