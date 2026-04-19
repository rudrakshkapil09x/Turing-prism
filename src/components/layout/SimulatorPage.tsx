import React, { useState, useCallback } from 'react'
import type { SimulatorId, UnitId } from '../../App'
import { units, lerpColor } from '../hub/ModuleHub'

// Simulator imports
import DFASimulator from '../simulators/unit1/DFASimulator'
import NFASimulator from '../simulators/unit1/NFASimulator'
import NFAtoDFA from '../simulators/unit1/NFAtoDFA'
import DFAMinimizer from '../simulators/unit1/DFAMinimizer'
import RegexToNFA from '../simulators/unit2/RegexToNFA'
import PumpingLemma from '../simulators/unit2/PumpingLemma'
import CFGParser from '../simulators/unit3/CFGParser'
import CNFGNFConverter from '../simulators/unit3/CNFGNFConverter'
import CFLPumpingLemma from '../simulators/unit3/CFLPumpingLemma'
import PDASimulator from '../simulators/unit4/PDASimulator'
import TuringMachine from '../simulators/unit5/TuringMachine'
import ComplexityVisualizer from '../simulators/unit6/ComplexityVisualizer'

interface Props {
  unitId: UnitId
  simulatorId: SimulatorId
  onBackToUnit: () => void
  onBackToHub: () => void
}

const simulatorMap: Record<SimulatorId, React.FC> = {
  'dfa': DFASimulator,
  'nfa': NFASimulator,
  'nfa2dfa': NFAtoDFA,
  'dfa-min': DFAMinimizer,
  'regex2nfa': RegexToNFA,
  'pumping-lemma': PumpingLemma,
  'cfg': CFGParser,
  'cnf-gnf': CNFGNFConverter,
  'cfl-pumping': CFLPumpingLemma,
  'pda': PDASimulator,
  'tm': TuringMachine,
  'complexity': ComplexityVisualizer,
}

const simulatorNames: Record<SimulatorId, string> = {
  'dfa': 'DFA Simulator',
  'nfa': 'NFA Simulator',
  'nfa2dfa': 'NFA → DFA',
  'dfa-min': 'DFA Minimizer',
  'regex2nfa': 'Regex → NFA',
  'pumping-lemma': 'Pumping Lemma',
  'cfg': 'CFG Parser',
  'cnf-gnf': 'CNF / GNF',
  'cfl-pumping': 'CFL Pumping',
  'pda': 'PDA Simulator',
  'tm': 'Turing Machine',
  'complexity': 'Complexity Classes',
}

const unitSimulatorOrder: Record<UnitId, SimulatorId[]> = {
  unit1: ['dfa', 'nfa', 'nfa2dfa', 'dfa-min'],
  unit2: ['regex2nfa', 'pumping-lemma'],
  unit3: ['cfg', 'cnf-gnf', 'cfl-pumping'],
  unit4: ['pda'],
  unit5: ['tm'],
  unit6: ['complexity'],
}

export default function SimulatorPage({ unitId, simulatorId, onBackToUnit, onBackToHub }: Props) {
  const [activeSimulator, setActiveSimulator] = useState<SimulatorId>(simulatorId)
  const [transitionKey, setTransitionKey] = useState(0)

  const unit = units.find(u => u.id === unitId)!
  const simsInUnit = unitSimulatorOrder[unitId]
  const n = simsInUnit.length

  // Compute lerped accent for the current simulator
  const activeSimIdx = simsInUnit.indexOf(activeSimulator)
  const tVal = n === 1 ? 0.5 : activeSimIdx / (n - 1)
  const accentColor = lerpColor(unit.colorLeft, unit.colorRight, tVal)
  const accentColorB = lerpColor(unit.colorLeft, unit.colorRight, Math.min(1, tVal + 0.25))
  // A lighter/pastel version for readable text
  const accentLight = lerpColor(accentColor, '#ffffff', 0.55)

  const ActiveComponent = simulatorMap[activeSimulator]

  const switchSimulator = useCallback((id: SimulatorId) => {
    setActiveSimulator(id)
    setTransitionKey(k => k + 1)
  }, [])

  return (
    <div
      className="min-h-screen relative"
      style={{
        background: '#080808',
        '--sim-accent': accentColor,
        '--sim-accent-b': accentColorB,
        '--sim-accent-light': accentLight,
      } as React.CSSProperties}
    >
      {/* Accent background — stronger tinting */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Top-right primary orb */}
        <div
          className="absolute rounded-full"
          style={{
            width: '900px', height: '900px',
            top: '-25%', right: '-20%',
            background: `radial-gradient(circle, ${accentColor}18 0%, ${accentColor}06 45%, transparent 70%)`,
            animation: 'float-orb 14s ease-in-out infinite',
          }}
        />
        {/* Bottom-left secondary orb */}
        <div
          className="absolute rounded-full"
          style={{
            width: '600px', height: '600px',
            bottom: '-15%', left: '-12%',
            background: `radial-gradient(circle, ${accentColorB}12 0%, ${accentColorB}04 50%, transparent 70%)`,
            animation: 'float-orb 18s ease-in-out infinite',
            animationDelay: '-8s',
          }}
        />
        {/* Subtle center wash */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${accentColor}08 0%, transparent 65%)`,
          }}
        />
        {/* Very subtle noise texture */}
        <div
          className="absolute inset-0 opacity-[0.012]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '180px 180px',
          }}
        />
      </div>

      {/* Top Navbar */}
      <nav
        className="fixed top-0 w-full z-50 flex items-center px-6 lg:px-12 py-4"
        style={{
          background: 'rgba(8,8,8,0.88)',
          backdropFilter: 'blur(28px) saturate(180%)',
          borderBottom: `1px solid ${accentColor}18`,
          boxShadow: `0 1px 0 ${accentColor}10`,
        }}
      >
        {/* Back button */}
        <button onClick={onBackToUnit} className="flex items-center gap-2 group cursor-pointer mr-6">
          <div
            className="w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 group-hover:scale-110"
            style={{ borderColor: `${accentColor}35`, background: `${accentColor}08` }}
          >
            <span className="text-xs transition-colors duration-300" style={{ color: accentColor }}>←</span>
          </div>
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-label">
          <button
            onClick={onBackToHub}
            className="text-on-surface-variant/30 hover:text-on-surface-variant/60 transition-colors cursor-pointer"
          >
            Modules
          </button>
          <span className="text-white/10">/</span>
          <button
            onClick={onBackToUnit}
            className="transition-colors cursor-pointer hover:opacity-80"
            style={{ color: `${accentColor}70` }}
          >
            {unit.title}
          </button>
          <span className="text-white/10">/</span>
          <span
            className="font-medium"
            style={{ color: accentLight }}
          >
            {simulatorNames[activeSimulator]}
          </span>
        </div>

        <div className="flex-1" />

        {/* Accent dot + brand */}
        <div className="hidden md:flex items-center gap-3">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: accentColor, boxShadow: `0 0 8px ${accentColor}` }}
          />
          <span className="text-lg font-extralight italic font-headline text-cream/20 tracking-tighter">
            Turing Prism
          </span>
        </div>
      </nav>

      {/* In-unit tabs */}
      {simsInUnit.length > 1 && (
        <div
          className="fixed top-[57px] w-full z-40 flex items-center gap-1 px-6 lg:px-12 py-2 overflow-x-auto"
          style={{
            background: 'rgba(8,8,8,0.75)',
            backdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${accentColor}10`,
          }}
        >
          {simsInUnit.map((simId, si) => {
            const st = n === 1 ? 0.5 : si / (n - 1)
            const simColor = lerpColor(unit.colorLeft, unit.colorRight, st)
            const simLight = lerpColor(simColor, '#ffffff', 0.55)
            const isActive = activeSimulator === simId
            return (
              <button
                key={simId}
                onClick={() => switchSimulator(simId)}
                className="flex-shrink-0 px-4 py-1.5 rounded-full font-label text-[10px] uppercase tracking-wider transition-all duration-300 cursor-pointer"
                style={{
                  background: isActive ? `${simColor}18` : 'transparent',
                  color: isActive ? simLight : 'rgba(255,255,255,0.22)',
                  border: `1px solid ${isActive ? simColor + '45' : 'transparent'}`,
                  boxShadow: isActive ? `0 0 14px ${simColor}25` : 'none',
                }}
              >
                {simulatorNames[simId]}
              </button>
            )
          })}
        </div>
      )}

      {/* Main content */}
      <main
        className="relative z-10 pb-16 px-6 lg:px-12 min-h-screen"
        style={{ paddingTop: simsInUnit.length > 1 ? '190px' : '150px' }}
      >
        <div key={transitionKey} className="page-enter">
          <ActiveComponent />
        </div>
      </main>
    </div>
  )
}
