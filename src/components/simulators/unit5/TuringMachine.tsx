import React, { useState, useEffect } from 'react'
import RAGPanel from '../../shared/RAGPanel'
import { consumeRestoreSession } from '../../../engine/archive'
import { type TMConfig, createInitialConfig, stepTM, presetTM_binaryIncrement, presetTM_palindrome, type TuringMachine as TM } from '../../../engine/turing'
import AutomataCanvas from '../../shared/AutomataCanvas'

export default function TuringMachine() {
  const [tm, setTm] = useState<TM>(presetTM_binaryIncrement())
  const [input, setInput] = useState('1011')
  const [config, setConfig] = useState<TMConfig | null>(null)
  const [history, setHistory] = useState<TMConfig[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(400)

  useEffect(() => {
    let p = presetTM_binaryIncrement()
    p.states = p.states.map((s, i) => ({ ...s, x: s.x ?? 120 + i * 160, y: s.y ?? 200 }))
    setTm(p)
    const c = createInitialConfig(p, '1011')
    setConfig(c); setHistory([c])
  }, [])

  useEffect(() => {
    const payload = consumeRestoreSession('tm')
    if (payload) setTm(payload)
  }, [])

  const handleStateMoved = (id: string, x: number, y: number) =>
    setTm(prev => ({ ...prev, states: prev.states.map(s => s.id === id ? { ...s, x, y } : s) }))

  const handleStateAdded = (x: number, y: number) =>
    setTm(prev => {
      const id = 'q' + prev.states.length
      return { ...prev, states: [...prev.states, { id, x, y, isStart: prev.states.length === 0, isHalt: false, isAccept: false, isReject: false }] }
    })

  const handleStateToggled = (id: string, prop: 'isStart' | 'isFinal') =>
    setTm(prev => ({ ...prev, states: prev.states.map(s => s.id === id ? {
      ...s,
      isStart: prop === 'isStart' ? !s.isStart : s.isStart,
      isAccept: prop === 'isFinal' ? !s.isAccept : s.isAccept,
      isHalt: prop === 'isFinal' ? !s.isHalt : s.isHalt,
    } : s) }))

  const handleStateDeleted = (id: string) =>
    setTm(prev => ({
      ...prev,
      states: prev.states.filter(s => s.id !== id),
      transitions: prev.transitions.filter(t => t.from !== id && t.to !== id)
    }))

  const handleTransitionAdded = (from: string, to: string) =>
    setTm(prev => ({ ...prev, transitions: [...prev.transitions, { from, to, read: '_', write: '_', move: 'R' }] }))

  const handleTransitionEdited = (idx: number, newLabel: string) => {
    setTm(prev => {
      const copy = [...prev.transitions]
      // Format: "1→0,R" or "1->0,R"
      const match = newLabel.match(/([^\s→>]+)\s*(?:→|->)\s*([^,\s]+)\s*,\s*([LRS])/)
      if (match) {
        copy[idx] = { ...copy[idx], read: match[1], write: match[2], move: match[3] as 'L'|'R'|'S' }
      } else {
        copy[idx] = { ...copy[idx], read: newLabel[0] || '_' }
      }
      return { ...prev, transitions: copy }
    })
  }

  const handleTransitionDeleted = (idx: number) =>
    setTm(prev => { const copy = [...prev.transitions]; copy.splice(idx, 1); return { ...prev, transitions: copy } })

  useEffect(() => {
    if (isPlaying && config && !config.halted) {
      const t = setTimeout(() => {
        const next = stepTM(tm, config)
        setConfig(next); setHistory(h => [...h, next])
      }, speed)
      return () => clearTimeout(t)
    } else setIsPlaying(false)
  }, [isPlaying, config, tm, speed])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return
      if (e.key === 'Enter') init()
      if (e.key === ' ' && config) { e.preventDefault(); setIsPlaying(p => !p) }
      if (e.key === 'ArrowRight') step()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [config, tm, input])

  const init = () => { const c = createInitialConfig(tm, input); setConfig(c); setHistory([c]); setIsPlaying(false) }
  const step = () => { if (config && !config.halted) { const n = stepTM(tm, config); setConfig(n); setHistory(h => [...h, n]) } }

  const visibleStart = Math.max(0, (config?.headPosition ?? 0) - 8)
  const visibleTapeSize = 17
  const visibleTape: { idx: number, sym: string }[] = []
  for (let i = 0; i < visibleTapeSize; i++) {
    const rIdx = visibleStart + i
    visibleTape.push({ idx: rIdx, sym: config?.tape[rIdx] || '_' })
  }

  const formatTMt = (t: any) => t.read + '\u2192' + t.write + ',' + t.move

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 fade-up">
        <span className="font-label text-primary tracking-[0.4em] uppercase text-xs mb-2 block">Unit 05 — Turing Machines</span>
        <h1 className="font-headline text-5xl md:text-7xl italic leading-[1.05] tracking-tighter">
          <span className="prism-text prism-underline active">Turing Machine</span>
        </h1>
        <p className="mt-4 max-w-xl text-on-surface-variant font-body text-sm leading-relaxed">
          Infinite tape, finite control. Dbl-click canvas to add states, shift+drag to connect. Edit transitions by clicking them.
        </p>
        <div className="mt-3 flex gap-3 text-[9px] font-label uppercase tracking-wider text-on-surface-variant/30">
          <span>Enter → Load</span><span>Space → Run/Pause</span><span>→ → Step</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Controls */}
        <div className="lg:col-span-4 space-y-4">
          {/* Presets */}
          <div className="glass-panel p-6 rounded-2xl fade-up" style={{ animationDelay: '0.1s' }}>
            <label className="font-label text-[10px] uppercase tracking-[0.3em] text-lavender/60 block mb-4">Presets</label>
            <button onClick={() => {
              let p = presetTM_binaryIncrement()
              p.states = p.states.map((s, i) => ({ ...s, x: 120 + i * 160, y: 200 }))
              setTm(p); setInput('1011')
              const c = createInitialConfig(p, '1011'); setConfig(c); setHistory([c])
            }} className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-cream text-sm border border-transparent hover:border-white/10 cursor-pointer mb-2">
              <span className="text-gold font-label text-[10px] uppercase tracking-wider">Binary Increment</span>
              <div>1011 → 1100</div>
            </button>
            <button onClick={() => {
              let p = presetTM_palindrome()
              p.states = p.states.map((s, i) => ({
                ...s,
                x: 100 + (i % 3) * 170,
                y: 100 + Math.floor(i / 3) * 170
              }))
              setTm(p); setInput('abba')
              const c = createInitialConfig(p, 'abba'); setConfig(c); setHistory([c])
            }} className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-cream text-sm border border-transparent hover:border-white/10 cursor-pointer">
              <span className="text-gold font-label text-[10px] uppercase tracking-wider">Palindrome Checker</span>
              <div>abba → Accept</div>
            </button>
          </div>

          {/* Input + controls */}
          <div className="glass-panel p-6 rounded-2xl fade-up" style={{ animationDelay: '0.15s' }}>
            <label className="font-label text-[10px] uppercase tracking-[0.3em] text-lavender/60 block mb-4">Input Tape</label>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); init() } }}
              className="w-full bg-transparent border-b-2 border-white/10 py-3 text-2xl font-headline italic text-cream focus:outline-none focus:border-gold" />
            <div className="mt-4 flex gap-2 flex-wrap">
              <button onClick={init} className="flex-1 py-2 prism-gradient rounded-lg text-[#131313] font-label text-[10px] uppercase tracking-wider font-bold cursor-pointer hover:scale-105 transition-transform">Load</button>
              <button onClick={step} disabled={!config || config.halted}
                className="w-10 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-cream hover:bg-white/10 disabled:opacity-30 cursor-pointer text-xs">▶</button>
              <button onClick={() => setIsPlaying(true)} disabled={!config || config.halted}
                className="py-2 px-4 rounded-lg bg-white/5 border border-white/10 text-cream text-xs font-label uppercase disabled:opacity-30 cursor-pointer hover:bg-white/10">Run</button>
            </div>
            {history.length > 1 && (
              <div className="mt-4">
                <input type="range" min={0} max={history.length - 1} value={history.indexOf(config!)}
                  onChange={e => setConfig(history[+e.target.value])} className="w-full accent-gold" />
                <div className="flex justify-between text-[10px] text-on-surface-variant font-label mt-1">
                  <span>Step {history.indexOf(config!)}/{history.length - 1}</span>
                  {config?.halted && <span className="text-gold">HALTED</span>}
                </div>
              </div>
            )}
          </div>

          {/* Speed */}
          <div className="glass-panel p-6 rounded-2xl fade-up" style={{ animationDelay: '0.2s' }}>
            <label className="font-label text-[10px] uppercase tracking-[0.3em] text-lavender/60 block mb-3">Speed: {speed}ms</label>
            <input type="range" min={50} max={1200} value={speed} onChange={e => setSpeed(+e.target.value)} className="w-full accent-gold" />
            <div className="flex justify-between text-[9px] text-on-surface-variant/40 mt-1"><span>Fast</span><span>Slow</span></div>
          </div>

          {/* Status */}
          {config && (
            <div className="glass-panel p-6 rounded-2xl fade-up" style={{ animationDelay: '0.25s' }}>
              <label className="font-label text-[10px] uppercase tracking-[0.3em] text-lavender/60 block mb-3">Status</label>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-on-surface-variant">State</span><span className="text-cream font-headline italic">{config.currentState}</span></div>
                <div className="flex justify-between"><span className="text-on-surface-variant">Step</span><span className="text-cream">{config.step}</span></div>
                <div className="flex justify-between"><span className="text-on-surface-variant">Head</span><span className="text-cream">{config.headPosition}</span></div>
                {config.halted && (
                  <div className={'mt-2 p-3 rounded-lg result-flash ' + (config.accepted ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30')}>
                    <span className={'font-label text-xs uppercase tracking-wider ' + (config.accepted ? 'text-green-400' : 'text-red-400')}>
                      {config.accepted ? '✓ ACCEPTED' : '✗ REJECTED'} at step {config.step}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Transition table */}
          <div className="glass-panel p-6 rounded-2xl fade-up" style={{ animationDelay: '0.3s' }}>
            <label className="font-label text-[10px] uppercase tracking-[0.3em] text-lavender/60 block mb-3">Transition Table</label>
            <div className="space-y-1 text-xs text-on-surface-variant max-h-48 overflow-y-auto">
              {tm.transitions.map((t, i) => (
                <div key={i} className="py-1 border-b border-white/5 font-label px-1">
                  δ({t.from}, {t.read}) → ({t.to}, {t.write}, {t.move})
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Tape + Canvas + History */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tape */}
          <div className="glass-panel rounded-3xl p-8 shadow-[0_40px_100px_rgba(0,0,0,0.5)] fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse shadow-[0_0_10px_#ffdb3c]" />
              <span className="font-label text-[10px] uppercase tracking-[0.3em] text-cream">Infinite Tape</span>
              {isPlaying && <span className="font-label text-[9px] uppercase tracking-wider text-gold animate-pulse ml-auto">● Running</span>}
            </div>
            <div className="overflow-x-auto pb-4">
              <div className="flex justify-center min-w-max">
                <div className="flex flex-col relative px-4 pt-6 pb-2">
                  <div className="absolute top-0 left-4 transition-transform duration-300 flex justify-center w-14 z-20" 
                       style={{ transform: `translateX(${((config?.headPosition ?? 0) - visibleStart) * 56}px)` }}>
                    <span className="material-symbols-outlined text-gold text-3xl" style={{ transform: 'rotate(180deg)' }}>arrow_drop_up</span>
                  </div>
                  
                  <div className="flex gap-0 mt-2">
                    {visibleTape.map(({ idx, sym }) => {
                      const isHead = idx === config?.headPosition
                      return (
                        <div key={idx} className={'w-14 h-14 flex items-center justify-center border-y border-x-[0.5px] transition-all duration-300 ' +
                          (isHead ? 'border-gold bg-gold/15 scale-110 shadow-[0_0_20px_rgba(255,219,60,0.2)] z-10' : 'border-white/10 bg-surface/60')}>
                          <span className={'font-headline italic text-xl ' + (isHead ? 'text-gold' : sym === '_' ? 'text-on-surface-variant/30' : 'text-cream')}>{sym}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-4">
              <span className="text-xs text-on-surface-variant/40 font-label">... tape extends infinitely ...</span>
            </div>
          </div>

          {/* State Diagram Canvas — full width */}
          <div className="glass-panel rounded-2xl overflow-hidden fade-up" style={{ minHeight: 460, animationDelay: '0.15s' }}>
            <div className="p-4 border-b border-white/5 flex items-center gap-3">
              <label className="font-label text-[10px] uppercase tracking-[0.3em] text-lavender/60">State Diagram</label>
              <span className="text-[9px] text-on-surface-variant/30 font-label">Dbl-click to add states · Shift+drag to connect · Click transition to edit (format: 1→0,R)</span>
            </div>
            <AutomataCanvas
              states={tm.states as any}
              transitions={tm.transitions.map((t, idx) => ({ from: t.from, to: t.to, label: formatTMt(t), originalIndex: idx }))}
              activeStates={config && !config.halted ? [config.currentState] : []}
              onStateMoved={handleStateMoved}
              onStateAdded={handleStateAdded}
              onStateToggled={handleStateToggled}
              onStateDeleted={handleStateDeleted}
              onTransitionAdded={handleTransitionAdded}
              onTransitionEdited={handleTransitionEdited}
              onTransitionDeleted={handleTransitionDeleted}
              accentColor="#ffdb3c"
              height={400}
            />
          </div>

          {/* History */}
          {history.length > 1 && (
            <div className="glass-panel rounded-2xl p-6 max-h-56 overflow-y-auto fade-up" style={{ animationDelay: '0.2s' }}>
              <label className="font-label text-[10px] uppercase tracking-[0.3em] text-lavender/60 block mb-3">Computation History</label>
              <div className="space-y-1">
                {history.map((h, i) => (
                  <div key={i} className={'flex items-center gap-3 text-xs py-1 border-b border-white/5 transition-colors ' + (i === history.length - 1 ? 'bg-gold/5 text-gold rounded px-2' : '')}>
                    <span className="text-on-surface-variant font-label w-8">#{h.step}</span>
                    <span className="text-cream font-headline italic">{h.currentState}</span>
                    <span className="text-on-surface-variant">tape[{h.headPosition}] = {h.tape[h.headPosition]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <RAGPanel simulatorId="tm" unit="unit5" onLoadAutomata={(type, payload) => {
        if (type === 'tm') {
          const p = payload as TM
          p.states = p.states.map((s: any, i: number) => ({ ...s, x: s.x ?? 120 + (i % 4) * 170, y: s.y ?? 120 + Math.floor(i / 4) * 170 }))
          setTm(p)
          const c = createInitialConfig(p, input)
          setConfig(c); setHistory([c])
        }
      }} />
    </div>
  )
}
