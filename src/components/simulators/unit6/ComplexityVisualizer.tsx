import React, { useState, useEffect } from 'react'
import RAGPanel from '../../shared/RAGPanel'
import { consumeRestoreSession } from '../../../engine/archive'
import { askRAG } from '../../../engine/rag'
import { complexityProblems, searchProblems, type ComplexityProblem } from '../../../engine/complexity'

export default function ComplexityVisualizer() {
  const [query, setQuery] = useState('')
  const [highlighted, setHighlighted] = useState<ComplexityProblem | null>(null)

  useEffect(() => {
    setHighlighted(complexityProblems[2] || complexityProblems[0]) // Select SAT or first as default
  }, [])

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState('')

  const search = async () => { 
    if (!query) return;
    setError('');
    
    const q = query.toLowerCase().trim()
    const found = complexityProblems.find(p => p.name.toLowerCase() === q || p.name.toLowerCase().includes(q))
    
    if (found) {
      setHighlighted(found)
      return;
    }

    setIsAnalyzing(true)
    try {
      const res = await askRAG('unit6', `Analyze the complexity class of this problem: ${query}. Respond strictly matching the schema: return its name, a list of 'class' strings like ['NP', 'NP-Complete'], a concise description, a concrete example, and an array of reductions. Add accurate content.`);
      if (res && res.payload) {
        setHighlighted(res.payload as ComplexityProblem)
      } else {
        setError('Analysis failed. Try rephrasing.')
      }
    } catch (e: any) {
      setError(e.message || 'Analysis failed.')
      console.error(e)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const pProblems = complexityProblems.filter(p => p.class.includes('P'))
  const npProblems = complexityProblems.filter(p => p.class.includes('NP'))
  const npcProblems = complexityProblems.filter(p => p.class.includes('NP-Complete'))
  const nphProblems = complexityProblems.filter(p => p.class.includes('NP-Hard'))

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 fade-up">
        <span className="font-label text-primary tracking-[0.4em] uppercase text-xs mb-2 block">Unit 06 — Decidability & Complexity</span>
        <h1 className="font-headline text-5xl md:text-7xl italic leading-[1.05] tracking-tighter text-fade-reveal">
          <span className="prism-text prism-underline active">Complexity Classes</span>
        </h1>
        <p className="mt-4 max-w-xl text-on-surface-variant font-body text-sm leading-relaxed">
          Interactive Venn diagram of P, NP, NP-Complete, and NP-Hard. Search for problems to see where they fall.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-6 rounded-2xl fade-up" style={{ animationDelay: '0.1s' }}>
            <label className="font-label text-[10px] uppercase tracking-[0.3em] text-gold block mb-4">Ask About a Problem</label>
            <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} className="w-full bg-transparent border-b-2 border-white/10 py-3 text-lg font-headline italic text-cream focus:outline-none focus:border-gold transition-colors" placeholder="e.g. Traveling Salesman" />
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
            <button onClick={search} disabled={isAnalyzing} className="mt-4 w-full py-3 prism-gradient rounded-lg text-[#131313] font-label text-[10px] uppercase tracking-wider font-bold cursor-pointer hover:scale-[1.02] transition-transform disabled:opacity-50 flex justify-center items-center gap-2">
              {isAnalyzing ? (
                <><span className="w-3 h-3 rounded-full border-2 border-transparent border-t-[#131313] animate-spin" /> AI ANALYZING...</>
              ) : 'Search / Analyze'}
            </button>
          </div>
          {highlighted && (
            <div className="glass-panel p-6 rounded-2xl border border-gold/20 fade-up shadow-[0_0_20px_rgba(255,219,60,0.05)] bg-[#0e0e0e]/80" style={{ animationDelay: '0.15s' }}>
              <h3 className="font-headline text-2xl italic text-cream mb-2">{highlighted.name}</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {highlighted.class.map(c => (
                  <span key={c} className={`px-3 py-1 rounded-full text-[10px] font-label uppercase tracking-widest ${c === 'P' ? 'bg-green-500/10 text-green-400 border border-green-500/30' : c === 'NP' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' : c === 'NP-Complete' ? 'bg-gold/15 text-gold border border-gold/40 shadow-[0_0_10px_rgba(255,219,60,0.2)]' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>{c}</span>
                ))}
              </div>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-4 bg-white/[0.02] p-3 rounded-xl border border-white/5">{highlighted.description}</p>
              <div className="text-xs text-on-surface-variant bg-[#131313] p-3 rounded-lg border border-white/5"><span className="text-lavender uppercase tracking-widest text-[9px] block mb-1">Example</span> <span className="italic">{highlighted.example}</span></div>
              {highlighted.reductions.length > 0 && (
                <div className="mt-3 text-xs text-on-surface-variant bg-[#131313] p-3 rounded-lg border border-white/5"><span className="text-gold uppercase tracking-widest text-[9px] block mb-1">Reduces to / from</span> {highlighted.reductions.join(', ')}</div>
              )}
            </div>
          )}
          <div className="glass-panel p-6 rounded-2xl max-h-64 overflow-y-auto fade-up" style={{ animationDelay: '0.2s' }}>
            <label className="font-label text-[10px] uppercase tracking-[0.3em] text-lavender/60 block mb-3">All Problems</label>
            {complexityProblems.map((p, i) => (
              <button key={i} onClick={() => setHighlighted(p)} className={`w-full text-left px-3 py-2.5 rounded-lg transition-all cursor-pointer text-xs mb-1 border ${highlighted === p ? 'bg-gold/10 border-gold/30 text-gold scale-[1.02]' : 'hover:bg-white/5 text-on-surface-variant border-transparent'}`}>
                {p.name} <span className="text-[9px] ml-2 opacity-60 uppercase tracking-widest font-label absolute right-4">{p.class[0]}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="lg:col-span-8">
          <div className="glass-panel rounded-3xl p-8 shadow-[0_40px_100px_rgba(0,0,0,0.5)] fade-up" style={{ minHeight: 600, animationDelay: '0.1s' }}>
            <svg viewBox="0 0 700 500" className="w-full h-full">
              {/* NP-Hard (outermost right) */}
              <ellipse cx="450" cy="250" rx="260" ry="220" fill="rgba(255,0,0,0.02)" stroke="rgba(255,100,100,0.2)" strokeWidth="1" strokeDasharray="8 4" className="transition-all duration-500" />
              <text x="680" y="80" className="text-sm fill-red-400/60 font-label tracking-widest" textAnchor="end">NP-Hard</text>
              
              {/* NP (left) */}
              <ellipse cx="300" cy="250" rx="240" ry="200" fill="rgba(100,100,255,0.03)" stroke="rgba(100,100,255,0.2)" strokeWidth="1.5" className="transition-all duration-500" />
              <text x="100" y="80" className="text-sm fill-blue-400/60 font-label tracking-widest">NP</text>
              
              {/* NP-Complete (intersection) */}
              <ellipse cx="375" cy="250" rx="80" ry="140" fill="rgba(255,219,60,0.06)" stroke="rgba(255,219,60,0.3)" strokeWidth="1.5" className="transition-all duration-500" />
              <text x="375" y="100" textAnchor="middle" className="text-[10px] uppercase tracking-widest fill-gold font-label">NP-Complete</text>
              
              {/* P (inside NP) */}
              <ellipse cx="230" cy="260" rx="100" ry="100" fill="rgba(0,255,100,0.04)" stroke="rgba(0,255,100,0.2)" strokeWidth="1.5" className="transition-all duration-500" />
              <text x="230" y="180" textAnchor="middle" className="text-sm fill-green-400/60 font-label tracking-widest">P</text>

              {/* Points/Labels */}
              <g className="transition-all duration-500">
                {/* P problems */}
                {pProblems.map((p, i) => {
                  const x = 180 + (i % 2) * 50
                  const y = 230 + Math.floor(i / 2) * 30
                  const isHighlighted = highlighted === p
                  return (
                    <g key={p.name} onClick={() => setHighlighted(p)} className="cursor-pointer group">
                      <circle cx={x} cy={y-3} r={isHighlighted ? 4 : 2} fill={isHighlighted ? '#4ade80' : 'rgba(74,222,128,0.5)'} className="transition-all" />
                      <text x={x} y={y+8} textAnchor="middle" className={`text-[9px] transition-all font-label tracking-wide ${isHighlighted ? 'fill-green-400 font-bold text-[10px]' : 'fill-green-400/70 group-hover:fill-green-400'}`}>{p.name.split(' ')[0]}</text>
                    </g>
                  )
                })}
                {/* NP-Complete problems */}
                {npcProblems.map((p, i) => {
                  const x = 375 + (i % 2 === 0 ? -15 : 15) // zigzag slightly
                  const y = 140 + i * 25
                  const isHighlighted = highlighted === p
                  return (
                    <g key={p.name} onClick={() => setHighlighted(p)} className="cursor-pointer group">
                      <circle cx={x} cy={y-3} r={isHighlighted ? 5 : 2.5} fill={isHighlighted ? '#ffdb3c' : 'rgba(255,219,60,0.6)'} className="transition-all" />
                      <text x={x + (i%2===0 ? -8 : 8)} y={y} textAnchor={i%2===0 ? 'end' : 'start'} className={`text-[9px] transition-all font-label tracking-wide ${isHighlighted ? 'fill-gold font-bold text-[10px]' : 'fill-gold/80 group-hover:fill-gold'}`}>{p.name.split(' ').map(w=>w[0]).join('')}</text>
                    </g>
                  )
                })}
                {/* NP-Hard only */}
                {nphProblems.filter(p => !p.class.includes('NP-Complete')).map((p, i) => {
                  const x = 550 + (i % 2) * 40
                  const y = 220 + Math.floor(i / 2) * 40
                  const isHighlighted = highlighted === p
                
  useEffect(() => {
    const payload = consumeRestoreSession('complexity')
    if (payload) {
      if (payload) { setHighlighted(payload); setQuery(payload.name || ""); }
    }
  }, [])
  return (
                    <g key={p.name} onClick={() => setHighlighted(p)} className="cursor-pointer group">
                      <circle cx={x} cy={y-3} r={isHighlighted ? 4 : 2} fill={isHighlighted ? '#f87171' : 'rgba(248,113,113,0.5)'} className="transition-all" />
                      <text x={x} y={y+10} textAnchor="middle" className={`text-[9px] transition-all font-label tracking-wide ${isHighlighted ? 'fill-red-400 font-bold text-[10px]' : 'fill-red-400/80 group-hover:fill-red-400'}`}>{p.name}</text>
                    </g>
                  )
                })}
                {/* NP only (not complete, not P) - pseudo problems or generic label */}
                <text x="300" y="380" textAnchor="middle" className="text-[10px] fill-blue-400/40 font-label italic uppercase tracking-widest">(Problems in NP\P if P≠NP)</text>
              </g>

              {/* The big question */}
              <text x="350" y="470" textAnchor="middle" className="text-xl fill-cream/10 font-headline italic tracking-widest">P = NP ?</text>
            </svg>
          </div>
        </div>
      </div>
      <RAGPanel 
        simulatorId="complexity" unit="unit6" 
        onLoadAutomata={(type, payload) => {
          if (type === 'complexity') {
            setHighlighted(payload)
            setQuery(payload.name)
          }
        }} 
      />
    </div>
  )
}
