import React, { useState, useEffect } from 'react'
import RAGPanel from '../../shared/RAGPanel'
import { consumeRestoreSession } from '../../../engine/archive'
import { parseCFG, convertToCNF, presetCFG_arithmetic } from '../../../engine/cfg'

export default function CNFGNFConverter() {
  const [grammarText, setGrammarText] = useState(presetCFG_arithmetic())
  const [steps, setSteps] = useState<ReturnType<typeof convertToCNF>>([])

  // Auto-run on mount
  useEffect(() => {
    convert()
  }, [])

  const convert = () => { 
    try {
      const cfg = parseCFG(grammarText)
      setSteps(convertToCNF(cfg)) 
    } catch {
      setSteps([])
    }
  }


  useEffect(() => {
    const payload = consumeRestoreSession('cnf-gnf')
    if (payload) {
      if (payload) setGrammarText(payload)
    }
  }, [])
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 fade-up">
        <span className="font-label text-primary tracking-[0.4em] uppercase text-xs mb-2 block">Unit 03 — Normal Forms</span>
        <h1 className="font-headline text-5xl md:text-7xl italic leading-[1.05] tracking-tighter text-fade-reveal">
          <span className="prism-text prism-underline active">CNF Converter</span>
        </h1>
        <p className="mt-4 max-w-xl text-on-surface-variant font-body text-sm leading-relaxed">
          Convert any context-free grammar to Chomsky Normal Form step by step. See ε-productions and unit productions removed.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-6 rounded-2xl fade-up" style={{ animationDelay: '0.1s' }}>
            <label className="font-label text-[10px] uppercase tracking-[0.3em] text-lavender/60 block mb-4">Input Grammar</label>
            <textarea value={grammarText} onChange={e => setGrammarText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) convert() }} rows={6} className="w-full bg-[#0e0e0e]/50 border border-white/10 rounded-lg p-4 text-cream font-label text-sm focus:outline-none focus:border-gold resize-none transition-colors" placeholder="S -> aSb | ε" />
            <div className="text-[9px] text-on-surface-variant/40 mt-2 font-label uppercase tracking-widest text-right mb-4">Ctrl+Enter to convert</div>
            <button onClick={convert} className="w-full py-3 prism-gradient rounded-lg text-[#131313] font-label text-[10px] uppercase tracking-wider font-bold cursor-pointer hover:scale-[1.02] transition-transform">Convert to CNF</button>
          </div>
        </div>
        <div className="lg:col-span-7">
          <div className="space-y-4">
            {steps.length > 0 ? steps.map((step, i) => (
              <div key={i} className={`glass-panel p-6 rounded-2xl transition-all duration-500 fade-up ${i === steps.length - 1 ? 'border-gold/40 border-2 bg-gold/5 shadow-[0_0_30px_rgba(255,219,60,0.1)]' : 'border-white/5 opacity-80'}`} style={{ animationDelay: `${0.1 + (i * 0.1)}s` }}>
                <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
                  <span className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold font-label ${i === steps.length - 1 ? 'bg-gold text-[#131313]' : 'bg-white/10 text-on-surface-variant'}`}>{i + 1}</span>
                  <label className={`font-label text-[10px] uppercase tracking-[0.2em] m-0 ${i === steps.length - 1 ? 'text-gold' : 'text-lavender/80'}`}>{step.description}</label>
                  {i === steps.length - 1 && <span className="ml-auto text-xs uppercase font-label tracking-widest text-green-400 opacity-80 result-flash">Final Result</span>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                  {step.productions.map((p, j) => (
                    <div key={j} className="text-sm font-label flex items-center bg-white/[0.02] px-3 py-1.5 rounded-lg border border-white/5">
                      <span className="text-lavender font-headline italic text-lg w-8">{p.head}</span> 
                      <span className="text-on-surface-variant/40 mx-2">→</span> 
                      <span className="text-gold tracking-widest text-[15px]">{p.body.join(' ') || 'ε'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )) : (
              <div className="glass-panel p-6 rounded-2xl flex items-center justify-center h-[300px]">
                <div className="text-center fade-up">
                  <span className="material-symbols-outlined text-6xl text-white/5 mb-4 block">tune</span>
                  <p className="text-on-surface-variant text-sm font-label uppercase tracking-widest">Enter a grammar to see the conversion steps</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
