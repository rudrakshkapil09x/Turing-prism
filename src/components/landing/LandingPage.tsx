import React, { useState, useEffect } from 'react'

interface Props {
  onEnter: () => void
  onNavigate?: (page: 'units' | 'research' | 'archive') => void
}

export default function LandingPage({ onEnter, onNavigate }: Props) {
  const [mounted, setMounted] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(t)
  }, [])

  const handleEnter = () => {
    setExiting(true)
    setTimeout(() => onEnter(), 700)
  }

  const handleNavigate = (page: 'units' | 'research' | 'archive') => {
    setExiting(true)
    setTimeout(() => onNavigate?.(page), 700)
  }

  return (
    <div
      className="min-h-screen bg-[#080808] relative flex flex-col"
      style={{
        overflowX: 'hidden',
        opacity: exiting ? 0 : mounted ? 1 : 0,
        transform: exiting ? 'scale(1.02)' : mounted ? 'scale(1)' : 'scale(0.98)',
        transition: 'opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      {/* Dynamic Aurora */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="aurora aurora-1" />
        <div className="aurora aurora-2" />
        <div className="aurora aurora-3" />
        <div className="aurora aurora-4" />
        {/* Noise overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }} />
      </div>

      {/* Top Nav */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-12 py-6"
        style={{
          background: 'linear-gradient(to bottom, rgba(8,8,8,0.7), transparent)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="text-2xl font-extralight italic font-headline text-cream tracking-tighter">
          Turing Prism
        </div>
        <div className="hidden md:flex items-center gap-12">
          <button onClick={() => handleNavigate('units')} className="text-[10px] font-label uppercase tracking-[0.2em] text-on-surface-variant/50 hover:text-lavender transition-colors cursor-pointer">Theory</button>
          <button onClick={() => handleNavigate('research')} className="text-[10px] font-label uppercase tracking-[0.2em] text-on-surface-variant/50 hover:text-lavender transition-colors cursor-pointer">Research</button>
          <button onClick={() => handleNavigate('archive')} className="text-[10px] font-label uppercase tracking-[0.2em] text-on-surface-variant/50 hover:text-lavender transition-colors cursor-pointer">Archive</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center relative px-12 pt-24">
        {/* Giant watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <h2 className="text-[12vw] font-light text-white/[0.015] uppercase tracking-tighter leading-none text-center select-none whitespace-nowrap">
            COMPUTATION
          </h2>
        </div>

        <div className="relative z-10 w-full max-w-5xl flex flex-col items-center text-center">
          {/* Concentric orbiting visual */}
          <div className="w-56 h-56 md:w-72 md:h-72 relative mb-16">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border border-white/[0.06] flex items-center justify-center"
              style={{ boxShadow: '0 0 80px rgba(123,97,255,0.08)' }}>
              {/* Orbiting dot 1 */}
              <div className="absolute w-full h-full" style={{ animation: 'spin 8s linear infinite' }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                  style={{ background: '#7B61FF', boxShadow: '0 0 10px #7B61FF' }} />
              </div>
              {/* Inner ring */}
              <div className="w-4/5 h-4/5 rounded-full border border-lavender/[0.08] flex items-center justify-center">
                {/* Orbiting dot 2 */}
                <div className="absolute w-4/5 h-4/5" style={{ animation: 'spin 5s linear infinite reverse' }}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                    style={{ background: '#FFD700', boxShadow: '0 0 8px #FFD700' }} />
                </div>
                {/* Core */}
                <div className="w-3/5 h-3/5 rounded-full border border-gold/[0.15] flex items-center justify-center"
                  style={{ background: 'rgba(123,97,255,0.04)' }}>
                  <span
                    className="material-symbols-outlined text-5xl text-gold opacity-60 animate-spin-slow"
                    style={{ fontVariationSettings: "'FILL' 1, 'wght' 200" }}
                  >
                    replay
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1
            className="text-6xl md:text-[6.5rem] leading-[1.05] font-headline italic font-light tracking-tighter"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'none' : 'translateY(20px)',
              transition: 'opacity 1s cubic-bezier(0.22,1,0.36,1) 0.2s, transform 1s cubic-bezier(0.22,1,0.36,1) 0.2s',
              overflow: 'visible',
            }}
          >
            <span className="prism-text">Master the</span>
            <br />
            <span className="prism-text">Theory of</span>
            <br />
            <span className="prism-text">Computation</span>
          </h1>

          {/* Subtitle */}
          <p
            className="mt-8 max-w-xl text-md text-on-surface-variant/45 font-body font-light leading-relaxed"
            style={{
              opacity: mounted ? 1 : 0,
              transition: 'opacity 1s ease 0.5s',
            }}
          >
            An editorial exploration into the limits of what can be calculated.
            From finite state machines to the recursive beauty of Turing completeness.
          </p>

          {/* CTA */}
          <div
            className="mt-14 flex items-center gap-8"
            style={{
              opacity: mounted ? 1 : 0,
              transition: 'opacity 1s ease 0.7s',
            }}
          >
            <button
              onClick={handleEnter}
              className="relative overflow-hidden px-12 py-5 rounded-full text-[#080808] font-label font-semibold uppercase tracking-[0.2em] text-[10px] hover:scale-105 transition-transform cursor-pointer group"
              style={{
                background: 'linear-gradient(135deg, #7B61FF 0%, #FFD700 100%)',
                boxShadow: '0 12px 40px rgba(123,97,255,0.25), 0 4px 12px rgba(0,0,0,0.4)',
              }}
            >
              <span className="relative z-10">Begin Exploration</span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'linear-gradient(135deg, #FFD700 0%, #7B61FF 100%)' }} />
            </button>
          </div>
        </div>

        {/* Bottom metadata */}
        <div
          className="absolute bottom-12 left-12 flex items-center gap-4"
          style={{ opacity: mounted ? 1 : 0, transition: 'opacity 1s ease 1s' }}
        >
          <div className="w-px h-12 bg-white/10" />
          <span className="font-label text-[9px] uppercase tracking-[0.4em] text-on-surface-variant/30">
            Interactive Simulator Engine
          </span>
        </div>
      </section>
    </div>
  )
}
