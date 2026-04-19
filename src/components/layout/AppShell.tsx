import React, { useState, useCallback, useRef } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import type { SimulatorId, UnitId } from '../../App'

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
  initialSimulator: SimulatorId
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

const unitNames: Record<UnitId, string> = {
  unit1: 'Finite Automata',
  unit2: 'Regular Languages',
  unit3: 'Context-Free',
  unit4: 'Pushdown Automata',
  unit5: 'Turing Machines',
  unit6: 'Decidability',
}

const simulatorUnitMap: Record<SimulatorId, UnitId> = {
  'dfa': 'unit1', 'nfa': 'unit1', 'nfa2dfa': 'unit1', 'dfa-min': 'unit1',
  'regex2nfa': 'unit2', 'pumping-lemma': 'unit2',
  'cfg': 'unit3', 'cnf-gnf': 'unit3', 'cfl-pumping': 'unit3',
  'pda': 'unit4',
  'tm': 'unit5',
  'complexity': 'unit6'
}

export default function AppShell({ initialSimulator, onBackToHub }: Props) {
  const [activeSimulator, setActiveSimulator] = useState<SimulatorId>(initialSimulator)
  const activeUnit = simulatorUnitMap[activeSimulator] || 'unit1'
  const [transitionKey, setTransitionKey] = useState(0)

  const switchSimulator = useCallback((id: SimulatorId) => {
    setActiveSimulator(id)
    setTransitionKey(k => k + 1)
  }, [])

  const ActiveComponent = simulatorMap[activeSimulator]

  return (
    <div className="min-h-screen bg-[#0e0e0e] relative">
      {/* Aurora background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] chromatic-glow opacity-10 animate-float-orb" />
        <div className="absolute top-1/2 -left-1/4 w-[600px] h-[600px] chromatic-glow opacity-8 animate-float-orb" style={{ filter: 'hue-rotate(180deg)', animationDelay: '-4s' }} />
      </div>

      <Navbar
        onBackToHub={onBackToHub}
        unitName={unitNames[activeUnit]}
        simulatorName={simulatorNames[activeSimulator]}
      />
      <Sidebar activeSimulator={activeSimulator} onSelect={switchSimulator} />

      <main className="lg:ml-72 pt-28 pb-12 px-8 lg:px-12 min-h-screen">
        <div key={transitionKey} className="page-enter">
          <ActiveComponent />
        </div>
      </main>
    </div>
  )
}
