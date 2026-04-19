import React, { useEffect, useRef } from 'react'

interface Props {
  onNavigate: (page: 'units' | 'research' | 'archive') => void
}

const papers = [
  {
    id: 'p1',
    title: 'On Computable Numbers, with an Application to the Entscheidungsproblem',
    author: 'A. M. Turing',
    year: '1936',
    topic: 'Turing Machines',
    description: 'The foundational paper that introduced the concept of the Turing machine, proving that there are well-defined mathematical problems that cannot be solved by any computable process.',
    tags: ['Decidability', 'Turing Machines', 'Halting Problem']
  },
  {
    id: 'p2',
    title: 'Three Models for the Description of Language',
    author: 'N. Chomsky',
    year: '1956',
    topic: 'Formal Languages',
    description: 'Introduces the Chomsky hierarchy, classifying formal grammars into regular, context-free, context-sensitive, and recursively enumerable languages based on generative power.',
    tags: ['Chomsky Hierarchy', 'Context-Free Grammars', 'Linguistics']
  },
  {
    id: 'p3',
    title: 'Reducibility Among Combinatorial Problems',
    author: 'R. M. Karp',
    year: '1972',
    topic: 'Computational Complexity',
    description: 'Proves that 21 diverse combinatorial and graph-theoretic problems are NP-complete, demonstrating the profound significance of the P vs NP question.',
    tags: ['NP-Completeness', 'Complexity Theory', 'Reductions']
  },
  {
    id: 'p4',
    title: 'Finite Automata and Their Decision Problems',
    author: 'M. O. Rabin, D. Scott',
    year: '1959',
    topic: 'Automata Theory',
    description: 'Groundbreaking work introducing nondeterministic finite automata (NFAs) and demonstrating their equivalence to deterministic finite automata (DFAs).',
    tags: ['NFA', 'DFA', 'Equivalence']
  }
]

export default function ResearchPage({ onNavigate }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const cards = containerRef.current?.querySelectorAll('.research-card') as NodeListOf<HTMLElement>
      cards?.forEach(card => {
        const rect = card.getBoundingClientRect()
        card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
        card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
      })
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  return (
    <div className="min-h-screen bg-[#0e0e0e] relative overflow-hidden flex flex-col" ref={containerRef}>
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden opacity-40">
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] chromatic-glow animate-float" />
        <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] chromatic-glow animate-float" style={{ animationDelay: '-2s', filter: 'hue-rotate(90deg)' }} />
      </div>

      {/* Top Nav */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 lg:px-12 py-5 bg-[#0e0e0e]/60 backdrop-blur-2xl border-b border-white/5">
        <button onClick={() => onNavigate('units')} className="flex items-center gap-3 group cursor-pointer">
          <span className="text-2xl font-extralight italic font-headline text-cream tracking-tighter">Turing Prism</span>
        </button>
        <div className="hidden md:flex items-center gap-12">
          <button onClick={() => onNavigate('units')} className="text-[10px] font-label uppercase text-on-surface-variant/60 hover:text-lavender transition-colors tracking-[0.2em] cursor-pointer">Theory</button>
          <button onClick={() => onNavigate('research')} className="text-[10px] font-label uppercase text-gold font-medium border-b border-gold/30 tracking-[0.2em] cursor-pointer">Research</button>
          <button onClick={() => onNavigate('archive')} className="text-[10px] font-label uppercase text-on-surface-variant/60 hover:text-lavender transition-colors tracking-[0.2em] cursor-pointer">Archive</button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pt-32 pb-24 px-8 lg:px-16 max-w-5xl mx-auto w-full z-10">
        <div className="mb-16 fade-up">
          <h1 className="font-headline text-5xl md:text-7xl italic font-light tracking-tighter text-cream mb-4">
            Research & <span className="prism-text">Theorems</span>
          </h1>
          <p className="text-on-surface-variant/60 font-body max-w-2xl text-sm leading-relaxed">
            The foundational literature of computability. Explore the seminal papers that defined the boundaries of what machines can solve, paring down grand philosophy into rigorous mathematical logic.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {papers.map((paper, i) => (
            <div 
              key={paper.id} 
              className="research-card relative p-8 md:p-10 rounded-2xl glass-panel border border-white/5 group hover:border-lavender/30 transition-all duration-500 fade-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Highlight gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-lavender/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
              
              <div className="flex flex-col md:flex-row gap-6 md:gap-12 w-full relative z-10">
                {/* Year Badge */}
                <div className="flex-shrink-0 flex items-start">
                  <div className="flex items-center gap-2 text-lavender/40 group-hover:text-gold/80 transition-colors">
                    <span className="material-symbols-outlined text-xl italic" style={{ fontVariationSettings: "'wght' 200" }}>auto_stories</span>
                    <span className="font-headline italic text-2xl tracking-tighter">{paper.year}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col items-start text-left">
                  <h3 className="font-headline text-2xl md:text-3xl font-light text-cream mb-2 group-hover:text-white transition-colors cursor-pointer">
                    {paper.title}
                  </h3>
                  <div className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant/50 mb-6">
                    {paper.author} · <span className="text-lavender/50">{paper.topic}</span>
                  </div>
                  
                  <p className="text-on-surface-variant/70 text-sm leading-relaxed mb-8 max-w-3xl">
                    {paper.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-auto">
                    {paper.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-white/[0.02] border border-white/5 rounded-full text-[9px] font-label uppercase tracking-widest text-on-surface-variant/40 group-hover:border-white/10 transition-colors">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Read Button */}
                <div className="flex-shrink-0 flex items-center justify-end md:justify-start">
                  <button className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-on-surface-variant/40 hover:text-[#131313] hover:bg-gold hover:border-gold transition-all duration-300 group/btn cursor-pointer">
                    <span className="material-symbols-outlined transition-transform duration-300 group-hover/btn:translate-x-1">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
