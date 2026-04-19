import React, { useState, useEffect } from 'react'
import RAGPanel from '../../shared/RAGPanel'
import { consumeRestoreSession } from '../../../engine/archive'
import { parseCFG, leftmostDerivation, presetCFG_balanced, presetCFG_palindrome, presetCFG_arithmetic } from '../../../engine/cfg'

export default function CFGParser() {
  const [grammarText, setGrammarText] = useState(presetCFG_balanced())
  const [targetString, setTargetString] = useState('aabb')
  const [derivation, setDerivation] = useState<ReturnType<typeof leftmostDerivation>>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // Auto-run on mount
  useEffect(() => {
    derive()
  }, [])

  const derive = () => {
    try {
      const cfg = parseCFG(grammarText)
      const steps = leftmostDerivation(cfg, targetString)
      setDerivation(steps)
      setCurrentStep(steps.length > 0 ? steps.length - 1 : 0)
    } catch {
      setDerivation([])
      setCurrentStep(0)
    }
  }

  useEffect(() => {
    if (isPlaying && currentStep < derivation.length - 1) {
      const t = setTimeout(() => setCurrentStep(s => s + 1), 600)
      return () => clearTimeout(t)
    } else setIsPlaying(false)
  }, [isPlaying, currentStep, derivation.length])


  useEffect(() => {
    const payload = consumeRestoreSession('cfg')
    if (payload) {
      if (payload) setGrammarText(payload)
    }
  }, [])
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 fade-up">
        <span className="font-label text-primary tracking-[0.4em] uppercase text-xs mb-2 block">Unit 03 — Context-Free Grammars</span>
        <h1 className="font-headline text-5xl md:text-7xl italic leading-[1.05] tracking-tighter text-fade-reveal">
          <span className="prism-text prism-underline active">CFG Parser</span>
        </h1>
        <p className="mt-4 max-w-xl text-on-surface-variant font-body text-sm leading-relaxed">
          Enter production rules, type a string, and watch the leftmost derivation unfold step by step.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-6 rounded-2xl fade-up" style={{ animationDelay: '0.1s' }}>
            <label className="font-label text-[10px] uppercase tracking-[0.3em] text-lavender/60 block mb-4">Grammar Productions</label>
            <textarea value={grammarText} onChange={e => setGrammarText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) derive() }} rows={5} className="w-full bg-[#0e0e0e]/50 border border-white/10 rounded-lg p-4 text-cream font-label text-sm focus:outline-none focus:border-gold resize-none transition-colors" placeholder="S -> aSb | ε" />
            <div className="text-[9px] text-on-surface-variant/40 mt-2 font-label uppercase tracking-widest text-right">Ctrl+Enter to derive</div>
            <div className="flex gap-2 mt-4">
              {[{ l: 'aⁿbⁿ', v: presetCFG_balanced(), s: 'aabb' }, { l: 'Palindrome', v: presetCFG_palindrome(), s: 'abba' }, { l: 'Arithmetic', v: presetCFG_arithmetic(), s: 'a+a*a' }].map(p => (
                <button key={p.l} onClick={() => { setGrammarText(p.v); setTargetString(p.s); setTimeout(derive, 50) }} className="px-3 py-1.5 rounded-lg text-[10px] font-label uppercase tracking-wider text-on-surface-variant bg-white/[0.02] hover:text-gold hover:bg-gold/5 border border-white/5 cursor-pointer transition-all">
                  {p.l}
                </button>
              ))}
            </div>
          </div>
          <div className="glass-panel p-6 rounded-2xl fade-up" style={{ animationDelay: '0.15s' }}>
            <label className="font-label text-[10px] uppercase tracking-[0.3em] text-lavender/60 block mb-4">Target String</label>
            <input value={targetString} onChange={e => setTargetString(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') derive() }} className="w-full bg-transparent border-b-2 border-white/10 py-3 text-2xl font-headline italic text-cream focus:outline-none focus:border-gold transition-colors" placeholder="aabb" />
            <button onClick={derive} className="mt-6 w-full py-3 prism-gradient rounded-lg text-[#131313] font-label text-[10px] uppercase tracking-wider font-bold cursor-pointer hover:scale-[1.02] transition-transform">Derive String</button>
            
            {derivation.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <button onClick={() => setCurrentStep(s => Math.max(s - 1, 0))} className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-cream hover:bg-white/10 cursor-pointer transition-colors">◀</button>
                  <input type="range" min={0} max={derivation.length - 1} value={currentStep} onChange={e => setCurrentStep(+e.target.value)} className="flex-1 accent-gold" />
                  <button onClick={() => setCurrentStep(s => Math.min(s + 1, derivation.length - 1))} className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-cream hover:bg-white/10 cursor-pointer transition-colors">▶</button>
                  <button onClick={() => setIsPlaying(!isPlaying)} className="px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/30 text-gold text-[10px] font-label uppercase tracking-widest hover:bg-gold/20 cursor-pointer transition-colors">
                    {isPlaying ? 'Pause' : 'Play'}
                  </button>
                </div>
                <div className="flex justify-between text-[10px] font-label text-on-surface-variant/40 mt-1 uppercase tracking-widest">
                  <span>Step {currentStep}/{derivation.length - 1}</span>
                  {derivation[derivation.length-1].sententialForm.join('') === targetString && <span className="text-green-500/60">VALID</span>}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-7">
          <div className="glass-panel p-8 rounded-2xl fade-up" style={{ minHeight: 500, animationDelay: '0.2s' }}>
            <label className="font-label text-[10px] uppercase tracking-[0.3em] text-lavender/60 block mb-6">Leftmost Derivation Steps</label>
            {derivation.length > 0 ? (
              <div className="space-y-4">
                {derivation.slice(0, currentStep + 1).map((step, i) => (
                  <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${i === currentStep ? 'border-gold/40 bg-gold/5 scale-[1.02] shadow-[0_10px_30px_rgba(255,219,60,0.05)]' : 'border-white/5 opacity-40 hover:opacity-70'}`}>
                    <span className="text-lavender/30 font-label text-xs w-8 flex-shrink-0">#{i}</span>
                    <div className="flex flex-wrap gap-1">
                      {step.sententialForm.map((sym, j) => {
                        const isNT = sym === sym.toUpperCase() && sym.match(/[A-Z]/)
                        return <span key={j} className={`px-2 py-1 rounded text-sm transition-all duration-300 ${isNT ? 'bg-violet/15 text-lavender border border-violet/20 font-headline italic' : sym === 'ε' ? 'text-on-surface-variant/40 italic' : 'bg-gold/10 text-gold border border-gold/20 font-label'}`}>{sym}</span>
                      })}
                    </div>
                    {step.productionUsed && (
                      <span className="ml-auto text-xs text-on-surface-variant/70 font-label bg-[#0e0e0e]/50 px-3 py-1 rounded-lg border border-white/5 whitespace-nowrap">
                        <span className="text-lavender mr-1">{step.productionUsed.head}</span> → <span className="text-gold ml-1">{step.productionUsed.body.join('')}</span>
                      </span>
                    )}
                  </div>
                ))}
                
                {derivation[derivation.length - 1].sententialForm.join('') === targetString ? (
                  <div className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center result-flash fade-up" style={{ animationDelay: `${derivation.length * 0.05}s` }}>
                    <span className="text-green-400 font-label text-sm uppercase tracking-widest font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">check_circle</span>
                      Valid Derivation Complete
                    </span>
                  </div>
                ) : (
                  <div className="mt-6 p-4 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-center">
                    <span className="text-on-surface-variant font-label text-xs uppercase tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg opacity-50">more_horiz</span>
                      Derivation Incomplete / Stuck
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px]">
                <div className="text-center">
                  <span className="material-symbols-outlined text-6xl text-white/5">account_tree</span>
                  <p className="text-on-surface-variant text-sm mt-4">Enter a grammar and target string to derive</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <RAGPanel 
        simulatorId="cfg" unit="unit3" 
        onLoadAutomata={(type, payload) => {
          if (type === 'cfg') {
            setGrammarText(payload)
            setDerivation([])
          }
        }} 
      />
    </div>
  )
}
