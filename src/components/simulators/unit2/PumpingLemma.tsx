import React, { useState, useEffect } from 'react'
import RAGPanel from '../../shared/RAGPanel'
import { consumeRestoreSession } from '../../../engine/archive'
import { askRAG } from '../../../engine/rag'

interface PumpingResult {
  language: string
  isRegular: boolean
  p: number
  s: string
  x: string
  y: string
  z: string
  pumped: string[]
  explanation: string
}

const knowledgeBase: PumpingResult[] = [
  { language: 'a^n b^n', isRegular: false, p: 3, s: 'aaabbb', x: 'a', y: 'aa', z: 'bbb', pumped: ['abbb', 'aaabbb', 'aaaaabbb', 'aaaaaaabbb'], explanation: 'For p=3, choose s = aᵖbᵖ = aaabbb. For any split xyz where |xy|≤p, y contains only a\'s. Pumping y gives more a\'s than b\'s → not in L. Therefore L is NOT regular.' },
  { language: 'a* b*', isRegular: true, p: 2, s: 'aabb', x: '', y: 'aa', z: 'bb', pumped: ['bb', 'aabb', 'aaaabb', 'aaaaabb'], explanation: 'This IS regular! For any string aⁱbʲ, choosing y within the a-section preserves a*b* when pumped.' },
  { language: '(ab)*', isRegular: true, p: 2, s: 'abab', x: '', y: 'ab', z: 'ab', pumped: ['ab', 'abab', 'ababab', 'abababab'], explanation: 'Regular! Decompose s so y="ab". Pumping preserves (ab)*.' },
  { language: '0^n where n is prime', isRegular: false, p: 5, s: '00000', x: '0', y: '00', z: '00', pumped: ['000', '00000', '0000000', '000000000'], explanation: 'Not regular. For s=0ᵖ, pumping y=0^k gives |xyⁱz| = p + (i-1)k. Choose i=p+1: length = p(1+k), composite.' },
  { language: 'palindromes over {a,b}', isRegular: false, p: 3, s: 'abcba', x: 'a', y: 'b', z: 'cba', pumped: ['acba', 'abcba', 'abbcba', 'abbbcba'], explanation: 'Palindromes are not regular. Pumping y breaks the palindrome symmetry.' },
]

export default function PumpingLemma() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<PumpingResult | null>(null)
  const [pumpCount, setPumpCount] = useState(2)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setSelected(knowledgeBase[0])
    setQuery(knowledgeBase[0].language)
  }, [])

  useEffect(() => {
    const payload = consumeRestoreSession('pumping-lemma')
    if (payload) {
      setSelected(payload)
      setQuery(payload.language || "")
    }
  }, [])

  const search = async () => {
    if (!query.trim()) return
    setError('')

    // Try local KB first (exact or close match)
    const q = query.toLowerCase().replace(/\s+/g, '')
    const found = knowledgeBase.find(k => {
      const kq = k.language.toLowerCase().replace(/\s+/g, '')
      return kq === q || kq.includes(q) || q.includes(kq)
    })
    if (found) { setSelected(found); return }

    // Always use RAG for anything not in local KB
    setIsAnalyzing(true)
    try {
      const res = await askRAG('unit2',
        'Prove whether L = { ' + query + ' } is regular using the Pumping Lemma. ' +
        'Choose p=3 or p=4. Pick concrete string s. Perform a correct xyz split with |xy|<=p, |y|>=1. ' +
        'Provide exactly 4 pumped strings (for i=0,1,2,3) as actual character strings, NOT algebraic expressions. ' +
        'Return JSON with: language, isRegular (boolean), p (number), s, x, y, z, pumped (string[4]), explanation.'
      )
      if (res.payload && typeof res.payload === 'object') {
        setSelected(res.payload as PumpingResult)
      } else {
        setError('RAG did not return a usable result. Try rephrasing your query.')
      }
    } catch (e: any) {
      setError(e.message || 'RAG query failed.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const pumpedAtI = (i: number) => {
    if (!selected) return ''
    if (selected.pumped[i] !== undefined) return selected.pumped[i]
    // synthesize: x + y^i + z
    return selected.x + selected.y.repeat(i) + selected.z
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 fade-up">
        <span className="font-label text-primary tracking-[0.4em] uppercase text-xs mb-2 block">Unit 02 — Regular Languages</span>
        <h1 className="font-headline text-5xl md:text-7xl italic leading-[1.05] tracking-tighter text-fade-reveal">
          <span className="prism-text prism-underline active">Pumping Lemma</span>
        </h1>
        <p className="mt-4 max-w-xl text-on-surface-variant font-body text-sm leading-relaxed">
          Ask about any language — known languages use cached proofs, unknown ones are analyzed by AI. Try <em>a^n b^2n</em> or <em>ww^R</em>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-6 rounded-2xl fade-up" style={{ animationDelay: '0.1s' }}>
            <label className="font-label text-[10px] uppercase tracking-[0.3em] text-gold block mb-4">Ask About a Language</label>
            <input value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
              className="w-full bg-transparent border-b-2 border-white/10 py-3 text-xl font-headline italic text-cream focus:outline-none focus:border-gold transition-all"
              placeholder="e.g. a^n b^2n" />
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
            <button onClick={search} disabled={isAnalyzing}
              className="mt-4 w-full py-3 prism-gradient rounded-lg text-[#131313] font-label text-[10px] uppercase tracking-wider font-bold cursor-pointer hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 flex justify-center items-center gap-2">
              {isAnalyzing
                ? <><span className="w-3 h-3 rounded-full border-2 border-transparent border-t-[#131313] animate-spin" /> AI Analyzing...</>
                : 'Analyze'}
            </button>
          </div>

          <div className="glass-panel p-6 rounded-2xl fade-up" style={{ animationDelay: '0.15s' }}>
            <label className="font-label text-[10px] uppercase tracking-[0.3em] text-lavender/60 block mb-3">Quick Examples</label>
            {knowledgeBase.map((k, i) => (
              <button key={i} onClick={() => { setSelected(k); setQuery(k.language); setError('') }}
                className={'w-full text-left px-3 py-2 rounded-lg transition-all cursor-pointer text-sm mb-1 border ' +
                  (selected === k ? 'bg-gold/10 border-gold/30 text-gold scale-[1.02]' : 'hover:bg-white/5 text-on-surface-variant border-transparent')}>
                <span className="font-headline italic">{k.language}</span>
                <span className={'ml-2 text-[10px] font-label uppercase ' + (k.isRegular ? 'text-green-400' : 'text-red-400')}>
                  {k.isRegular ? 'Regular' : 'Not Regular'}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8">
          {selected ? (
            <div className="space-y-6">
              <div className="glass-panel p-8 rounded-2xl fade-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-4 mb-6">
                  <span className={'text-3xl ' + (selected.isRegular ? 'drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]' : 'drop-shadow-[0_0_15px_rgba(248,113,113,0.5)]')}>
                    {selected.isRegular ? '🟢' : '🔴'}
                  </span>
                  <div>
                    <h2 className="font-headline text-3xl italic text-cream">L = {'{' + selected.language + '}'}</h2>
                    <span className={'font-label text-xs uppercase tracking-wider ' + (selected.isRegular ? 'text-green-400' : 'text-red-400')}>
                      {selected.isRegular ? 'Regular Language' : 'Not a Regular Language'}
                    </span>
                  </div>
                </div>
                <p className="text-on-surface-variant text-sm leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/5">{selected.explanation}</p>
              </div>

              <div className="glass-panel p-6 rounded-2xl fade-up" style={{ animationDelay: '0.3s' }}>
                <label className="font-label text-[10px] uppercase tracking-[0.3em] text-lavender/60 block mb-4">
                  String Decomposition (p = {selected.p}, s = {selected.s})
                </label>
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className="text-on-surface-variant text-sm mr-2 font-headline italic text-xl">s = </span>
                  <div className="flex shadow-lg rounded-lg overflow-hidden">
                    {selected.x.split('').map((c, i) => (
                      <span key={'x' + i} className="w-10 h-10 flex items-center justify-center border-r border-white/5 text-on-surface-variant text-lg bg-white/[0.03]">{c}</span>
                    ))}
                    {selected.y.split('').map((c, i) => (
                      <span key={'y' + i} title="The repeated part 'y'" className="w-10 h-10 flex items-center justify-center border-r border-gold/40 text-gold text-lg bg-gold/15 font-bold hover:bg-gold/25 cursor-help">{c}</span>
                    ))}
                    {selected.z.split('').map((c, i) => (
                      <span key={'z' + i} className="w-10 h-10 flex items-center justify-center border-r border-violet/30 text-lavender text-lg bg-violet/10">{c}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-8 text-xs text-on-surface-variant/70 mb-8 p-3 rounded-lg bg-[#0e0e0e]/50 border border-white/5">
                  <span className="flex flex-col"><span className="uppercase tracking-widest text-[9px] mb-1">Prefix x</span><span className="text-cream">{selected.x || 'ε'}</span></span>
                  <span className="flex flex-col"><span className="uppercase tracking-widest text-[9px] mb-1 text-gold">Pumped y</span><span className="text-gold font-bold">{selected.y}</span></span>
                  <span className="flex flex-col"><span className="uppercase tracking-widest text-[9px] mb-1 text-lavender">Suffix z</span><span className="text-lavender">{selected.z}</span></span>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <label className="font-label text-[10px] uppercase tracking-[0.3em] text-lavender/60 shrink-0">Pump i = {pumpCount}</label>
                  <input type="range" min={0} max={4} value={pumpCount} onChange={e => setPumpCount(+e.target.value)} className="flex-1 accent-gold" />
                </div>
                <div className="space-y-3">
                  {[0, 1, 2, 3, 4].map(i => {
                    const pumped = pumpedAtI(i)
                    return (
                      <div key={i} className={'flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 border ' +
                        (i === pumpCount ? 'bg-gold/10 border-gold/30 shadow-[0_0_20px_rgba(255,219,60,0.15)] scale-[1.02]' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]')}>
                        <span className={'text-[10px] uppercase tracking-widest font-label w-12 ' + (i === pumpCount ? 'text-gold' : 'text-on-surface-variant')}>i = {i}</span>
                        <div className="flex flex-wrap gap-0">
                          {pumped.split('').map((c, j) => (
                            <span key={j} className={'w-7 h-7 flex items-center justify-center text-sm border border-white/5 ' + (i === pumpCount ? 'text-cream border-white/10' : 'text-on-surface-variant/60')}>{c}</span>
                          ))}
                          {pumped.length === 0 && <span className="text-on-surface-variant/40 italic text-sm">ε</span>}
                        </div>
                        <span className={'text-xs ml-auto font-label ' + (i === pumpCount ? 'text-cream' : 'text-on-surface-variant/50')}>|s| = {pumped.length}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl flex items-center justify-center fade-up" style={{ minHeight: 500, animationDelay: '0.2s' }}>
              <div className="text-center">
                <span className="material-symbols-outlined text-6xl text-white/10">waves</span>
                <p className="text-on-surface-variant text-sm mt-4">Type a language and click "Analyze"</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <RAGPanel simulatorId="pumping-lemma" unit="unit2" onLoadAutomata={(type, payload) => {
        if (type === 'pumping') { setSelected(payload); setQuery(payload.language) }
      }} />
    </div>
  )
}
