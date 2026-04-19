import React, { useState, useEffect, useCallback } from 'react'
import { type PDA, type PDAStepResult, simulatePDA, presetPDA_anbn } from '../../../engine/pda'
import RAGPanel from '../../shared/RAGPanel'
import { consumeRestoreSession } from '../../../engine/archive'
import AutomataCanvas from '../../shared/AutomataCanvas'

export default function PDASimulator() {
  const [pda, setPda] = useState<PDA>(presetPDA_anbn())
  const [testInput, setTestInput] = useState('aaabbb')
  const [steps, setSteps] = useState<PDAStepResult[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const payload = consumeRestoreSession('pda')
    if (payload) setPda(payload)
  }, [])

  const handleStateMoved = (id: string, x: number, y: number) => {
    setPda(prev => ({ ...prev, states: prev.states.map(s => s.id === id ? { ...s, x, y } : s) }))
  }
  const handleStateAdded = (x: number, y: number) => {
    setPda(prev => {
      const id = 'q' + prev.states.length
      return { ...prev, states: [...prev.states, { id, x, y, isStart: prev.states.length === 0, isFinal: false }] }
    })
  }
  const handleStateToggled = (id: string, prop: 'isStart' | 'isFinal') => {
    setPda(prev => ({ ...prev, states: prev.states.map(s => s.id === id ? { ...s, [prop]: !s[prop] } : s) }))
  }
  const handleStateDeleted = (id: string) => {
    setPda(prev => ({
      ...prev,
      states: prev.states.filter(s => s.id !== id),
      transitions: prev.transitions.filter(t => t.from !== id && t.to !== id)
    }))
  }
  const handleTransitionAdded = (from: string, to: string) => {
    setPda(prev => ({ ...prev, transitions: [...prev.transitions, { from, to, inputSymbol: 'ε', stackPop: 'ε', stackPush: [] }] }))
  }
  const handleTransitionEdited = (idx: number, newLabel: string) => {
    setPda(prev => {
      const copy = [...prev.transitions]
      const t = copy[idx]
      // format: "a,Z→aZ"
      const match = newLabel.match(/([^,\s]+)\s*,\s*([^→\->]+)\s*(?:→|->)\s*(.*)/)
      if (match) {
        t.inputSymbol = match[1].trim()
        t.stackPop = match[2].trim()
        t.stackPush = (!match[3] || match[3].trim() === 'ε') ? [] : match[3].trim().split('')
      } else {
        t.inputSymbol = newLabel
      }
      return { ...prev, transitions: copy }
    })
  }
  const handleTransitionDeleted = (idx: number) => {
    setPda(prev => {
      const copy = [...prev.transitions]; copy.splice(idx, 1)
      return { ...prev, transitions: copy }
    })
  }

  const run = useCallback(() => {
    const r = simulatePDA(pda, testInput)
    setSteps(r)
    setCurrentStep(0)
  }, [pda, testInput])

  useEffect(() => {
    run()
  }, [run])

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      const t = setTimeout(() => setCurrentStep(s => s + 1), 700)
      return () => clearTimeout(t)
    } else setIsPlaying(false)
  }, [isPlaying, currentStep, steps.length])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return
      if (e.key === 'Enter') run()
      if (e.key === ' ' && steps.length > 0) { e.preventDefault(); setIsPlaying(p => !p) }
      if (e.key === 'ArrowRight' && steps.length > 0) setCurrentStep(s => Math.min(s + 1, steps.length - 1))
      if (e.key === 'ArrowLeft' && steps.length > 0) setCurrentStep(s => Math.max(s - 1, 0))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [run, steps.length])


  const currentConfig = steps[currentStep]?.configs[0]
  const lastStep = steps[steps.length - 1]
  const formatPDA_t = (t: any) => t.inputSymbol + ',' + t.stackPop + '\u2192' + (t.stackPush.join('') || '\u03b5')

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 fade-up">
        <span className="font-label text-primary tracking-[0.4em] uppercase text-xs mb-2 block">Unit 04 — Pushdown Automata</span>
        <h1 className="font-headline text-5xl md:text-7xl italic leading-[1.05] tracking-tighter">
          <span className="prism-text prism-underline active">PDA Simulator</span>
        </h1>
        <p className="mt-4 max-w-xl text-on-surface-variant font-body text-sm leading-relaxed">Visual pushdown automaton with animated stack operations. Dbl-click canvas to add states, shift+drag to connect.</p>
        <div className="mt-3 flex gap-3 text-[9px] font-label uppercase tracking-wider text-on-surface-variant/30">
          <span>Enter → Simulate</span><span>Space → Play/Pause</span><span>← → → Step</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-6 rounded-2xl fade-up" style={{ animationDelay: '0.1s' }}>
            <label className="font-label text-[10px] uppercase tracking-[0.3em] text-gold block mb-3">Preset: L = {'{aⁿbⁿ}'}</label>
            <div className="text-xs text-on-surface-variant space-y-1 max-h-40 overflow-y-auto">
              {pda.transitions.map((t, i) => (
                <div key={i} className="py-1 border-b border-white/5 hover:bg-white/[0.02] rounded px-1 font-label">
                  δ({t.from}, {t.inputSymbol}, {t.stackPop}) → ({t.to}, {t.stackPush.join('') || 'ε'})
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl fade-up" style={{ animationDelay: '0.15s' }}>
            <label className="font-label text-[10px] uppercase tracking-[0.3em] text-lavender/60 block mb-4">Test String</label>
            <input value={testInput} onChange={e => setTestInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); run() } }}
              className="w-full bg-transparent border-b-2 border-white/10 py-3 text-2xl font-headline italic text-cream focus:outline-none focus:border-gold"
              placeholder="aaabbb" />
            <div className="mt-4 flex gap-2">
              <button onClick={run} className="flex-1 py-2 prism-gradient rounded-lg text-[#131313] font-label text-[10px] uppercase tracking-wider font-bold cursor-pointer hover:scale-105 transition-transform">Simulate</button>
              <button onClick={() => setIsPlaying(true)} disabled={steps.length === 0}
                className="py-2 px-4 rounded-lg bg-white/5 border border-white/10 text-cream text-xs font-label uppercase disabled:opacity-30 cursor-pointer hover:bg-white/10 transition-colors">Play</button>
            </div>
            {steps.length > 0 && (
              <div className="mt-4">
                {steps[currentStep]?.configs.length > 1 && (
                  <div className="text-[9px] text-on-surface-variant/40 italic mb-2 uppercase tracking-widest text-center">
                    {steps[currentStep].configs.length} active configs (first shown)
                  </div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <button onClick={() => setCurrentStep(s => Math.max(s - 1, 0))} disabled={currentStep === 0}
                    className="w-8 h-8 rounded shrink-0 bg-white/5 border border-white/10 flex items-center justify-center text-cream hover:bg-white/10 disabled:opacity-30 cursor-pointer text-xs">◀</button>
                  <input type="range" min={0} max={steps.length - 1} value={currentStep}
                    onChange={e => setCurrentStep(+e.target.value)} className="w-full accent-gold" />
                  <button onClick={() => setCurrentStep(s => Math.min(s + 1, steps.length - 1))} disabled={currentStep === steps.length - 1}
                    className="w-8 h-8 rounded shrink-0 bg-white/5 border border-white/10 flex items-center justify-center text-cream hover:bg-white/10 disabled:opacity-30 cursor-pointer text-xs">▶</button>
                </div>
                <div className="flex justify-between text-xs text-on-surface-variant mt-1">
                  <span>Step {currentStep}/{steps.length - 1}</span>
                  <span className={'font-bold ' + (lastStep?.accepted === true ? 'text-green-400' : lastStep?.accepted === false ? 'text-red-400' : '')}>
                    {lastStep?.accepted === true ? '✓ ACCEPTED' : lastStep?.accepted === false ? '✗ REJECTED' : ''}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Stack */}
          <div className="glass-panel p-6 rounded-2xl fade-up" style={{ animationDelay: '0.2s' }}>
            <label className="font-label text-[10px] uppercase tracking-[0.3em] text-lavender/60 block mb-3">Stack</label>
            <div className="flex flex-col-reverse items-center gap-0">
              {(currentConfig?.stack ?? ['Z']).map((sym, i) => {
                const isTop = i === (currentConfig?.stack.length ?? 1) - 1
                return (
                  <div key={i} className={'w-20 py-2.5 text-center border transition-all duration-300 ' + (isTop ? 'border-gold/40 bg-gold/10 text-gold scale-105' : 'border-white/10 bg-white/[0.02] text-cream')}>
                    <span className="font-headline italic text-lg">{sym}</span>
                  </div>
                )
              })}
              <div className="w-28 h-1.5 bg-white/10 rounded-full mt-2" />
              <span className="text-[9px] text-on-surface-variant/40 font-label mt-1 uppercase tracking-widest">Bottom</span>
            </div>
          </div>
        </div>

        {/* Canvas + tape */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel rounded-2xl overflow-hidden fade-up" style={{ minHeight: 480, animationDelay: '0.1s' }}>
            <div className="p-4 border-b border-white/5">
              <label className="font-label text-[10px] uppercase tracking-[0.3em] text-lavender/60">
                State Diagram — {currentConfig ? 'at ' + currentConfig.state : 'not running'}
              </label>
            </div>
            <AutomataCanvas
              states={pda.states}
              transitions={pda.transitions.map((t, idx) => ({ from: t.from, to: t.to, label: formatPDA_t(t), originalIndex: idx }))}
              activeStates={steps[currentStep] ? [...new Set(steps[currentStep].configs.map(c => c.state))] : []}
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

          {/* Input tape */}
          {steps.length > 0 && currentConfig && (
            <div className="glass-panel rounded-2xl p-6 fade-up" style={{ animationDelay: '0.2s' }}>
              <label className="font-label text-[10px] uppercase tracking-[0.3em] text-lavender/60 block mb-3">Input Tape</label>
              <div className="flex gap-1 flex-wrap mb-4">
                {testInput.split('').map((ch, i) => {
                  const consumed = testInput.length - (currentConfig.remainingInput?.length ?? 0)
                  return (
                    <div key={i} className={'w-10 h-10 flex items-center justify-center border text-sm font-label transition-all duration-300 rounded ' +
                      (i < consumed ? 'border-lavender/30 bg-lavender/10 text-lavender' :
                       i === consumed ? 'border-gold/50 bg-gold/15 text-gold scale-110' :
                       'border-white/10 text-on-surface-variant')}>
                      {ch}
                    </div>
                  )
                })}
              </div>
              
              {currentStep === steps.length - 1 && steps.length > 0 && (
                <div className={`p-4 rounded-xl border flex items-center justify-center result-flash fade-up transition-all ${lastStep?.accepted === true ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                  <span className={`font-label text-sm uppercase tracking-widest font-bold flex items-center gap-2 ${lastStep?.accepted === true ? 'text-green-400' : 'text-red-400'}`}>
                    <span className="material-symbols-outlined text-lg">
                      {lastStep?.accepted === true ? 'check_circle' : 'cancel'}
                    </span>
                    {lastStep?.accepted === true ? 'String Accepted by PDA' : 'String Rejected by PDA'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <RAGPanel simulatorId="pda" unit="unit4" onLoadAutomata={(type, payload) => {
        if (type === 'pda') { setPda(payload); setSteps([]); setCurrentStep(0) }
      }} />
    </div>
  )
}
