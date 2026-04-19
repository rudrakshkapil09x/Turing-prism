import React, { useState } from 'react'
import LandingPage from './components/landing/LandingPage'
import ModuleHub from './components/hub/ModuleHub'
import UnitDetailPage from './components/hub/UnitDetailPage'
import SimulatorPage from './components/layout/SimulatorPage'
import ResearchPage from './components/pages/ResearchPage'
import ArchivePage from './components/pages/ArchivePage'

export type UnitId = 'unit1' | 'unit2' | 'unit3' | 'unit4' | 'unit5' | 'unit6'
export type SimulatorId =
  | 'dfa' | 'nfa' | 'nfa2dfa' | 'dfa-min'
  | 'regex2nfa' | 'pumping-lemma'
  | 'cfg' | 'cnf-gnf' | 'cfl-pumping'
  | 'pda'
  | 'tm'
  | 'complexity'

type AppView = 
  | { screen: 'landing' }
  | { screen: 'hub'; page: 'units' | 'research' | 'archive' }
  | { screen: 'unit-detail'; unitId: UnitId }
  | { screen: 'simulator'; unitId: UnitId; simulatorId: SimulatorId }

export default function App() {
  const [view, setView] = useState<AppView>({ screen: 'landing' })

  const navigateToHub = (page: 'units' | 'research' | 'archive' = 'units') => {
    setView({ screen: 'hub', page })
  }

  const navigateToUnit = (unitId: UnitId) => {
    setView({ screen: 'unit-detail', unitId })
    window.scrollTo({ top: 0 })
  }

  const navigateToSimulator = (unitId: UnitId, simulatorId: SimulatorId) => {
    setView({ screen: 'simulator', unitId, simulatorId })
    window.scrollTo({ top: 0 })
  }

  const navigateBack = () => {
    if (view.screen === 'simulator') {
      setView({ screen: 'unit-detail', unitId: view.unitId })
    } else if (view.screen === 'unit-detail') {
      setView({ screen: 'hub', page: 'units' })
    } else {
      setView({ screen: 'hub', page: 'units' })
    }
    window.scrollTo({ top: 0 })
  }

  switch (view.screen) {
    case 'landing':
      return (
        <LandingPage
          onEnter={() => navigateToHub('units')}
          onNavigate={(page) => {
            if (page === 'units') navigateToHub('units')
            else setView({ screen: 'hub', page })
          }}
        />
      )

    case 'hub':
      if (view.page === 'research') return <ResearchPage onNavigate={(p) => setView({ screen: 'hub', page: p })} />
      if (view.page === 'archive') return <ArchivePage onNavigate={(p) => setView({ screen: 'hub', page: p })} onNavigateToSimulator={(uid, sid) => navigateToSimulator(uid as UnitId, sid as SimulatorId)} />
      return (
        <ModuleHub
          onSelectUnit={(unitId) => navigateToUnit(unitId)}
          onNavigate={(page) => setView({ screen: 'hub', page })}
          onBack={() => setView({ screen: 'landing' })}
        />
      )

    case 'unit-detail':
      return (
        <UnitDetailPage
          unitId={view.unitId}
          onSelectSimulator={(simId) => navigateToSimulator(view.unitId, simId)}
          onBack={() => setView({ screen: 'hub', page: 'units' })}
        />
      )

    case 'simulator':
      return (
        <SimulatorPage
          unitId={view.unitId}
          simulatorId={view.simulatorId}
          onBackToUnit={() => setView({ screen: 'unit-detail', unitId: view.unitId })}
          onBackToHub={() => setView({ screen: 'hub', page: 'units' })}
        />
      )
  }
}
