// DFA Engine — Pure logic, no React
export interface DFAState {
  id: string
  x: number
  y: number
  isStart: boolean
  isFinal: boolean
}

export interface DFATransition {
  from: string
  to: string
  symbol: string
}

export interface DFA {
  states: DFAState[]
  transitions: DFATransition[]
  alphabet: string[]
}

export interface DFAStepResult {
  currentState: string
  symbolRead: string
  accepted: boolean | null // null = still running
  step: number
}

export function createEmptyDFA(): DFA {
  return { states: [], transitions: [], alphabet: [] }
}

export function getStartState(dfa: DFA): DFAState | undefined {
  return dfa.states.find(s => s.isStart)
}

export function getTransition(dfa: DFA, stateId: string, symbol: string): string | null {
  const t = dfa.transitions.find(t => t.from === stateId && t.symbol === symbol)
  return t ? t.to : null
}

export function simulateDFA(dfa: DFA, input: string): DFAStepResult[] {
  const steps: DFAStepResult[] = []
  const start = getStartState(dfa)
  if (!start) return steps

  let current = start.id
  steps.push({ currentState: current, symbolRead: '', accepted: null, step: 0 })

  for (let i = 0; i < input.length; i++) {
    const symbol = input[i]
    const next = getTransition(dfa, current, symbol)
    if (next === null) {
      steps.push({ currentState: current, symbolRead: symbol, accepted: false, step: i + 1 })
      return steps
    }
    current = next
    const isFinal = dfa.states.find(s => s.id === current)?.isFinal ?? false
    steps.push({
      currentState: current,
      symbolRead: symbol,
      accepted: i === input.length - 1 ? isFinal : null,
      step: i + 1,
    })
  }

  if (steps.length === 1) {
    // Empty string
    const isFinal = dfa.states.find(s => s.id === current)?.isFinal ?? false
    steps[0].accepted = isFinal
  }

  return steps
}

// Minimization via table-filling algorithm
export interface MinimizationStep {
  table: boolean[][]
  reason: string
  marked: [string, string][]
}

export function minimizeDFA(dfa: DFA): { minimizedDFA: DFA; steps: MinimizationStep[] } {
  const n = dfa.states.length
  const steps: MinimizationStep[] = []
  const ids = dfa.states.map(s => s.id)

  // Distinguishability table
  const table: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false))

  // Step 1: Mark pairs where one is final and one is not
  const marked: [string, string][] = []
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const si = dfa.states[i]
      const sj = dfa.states[j]
      if (si.isFinal !== sj.isFinal) {
        table[i][j] = true
        table[j][i] = true
        marked.push([ids[i], ids[j]])
      }
    }
  }
  steps.push({
    table: table.map(r => [...r]),
    reason: 'Mark pairs where one is final and one is not',
    marked: [...marked],
  })

  // Step 2: Iterate until no more changes
  let changed = true
  while (changed) {
    changed = false
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (table[i][j]) continue
        for (const symbol of dfa.alphabet) {
          const ni = getTransition(dfa, ids[i], symbol)
          const nj = getTransition(dfa, ids[j], symbol)
          if (ni !== null && nj !== null) {
            const niIdx = ids.indexOf(ni)
            const njIdx = ids.indexOf(nj)
            if (niIdx !== -1 && njIdx !== -1 && table[niIdx][njIdx]) {
              table[i][j] = true
              table[j][i] = true
              marked.push([ids[i], ids[j]])
              changed = true
            }
          }
        }
      }
    }
    if (changed) {
      steps.push({
        table: table.map(r => [...r]),
        reason: 'Propagate distinguishability through transitions',
        marked: [...marked],
      })
    }
  }

  // Step 3: Merge equivalent states
  const groups: string[][] = []
  const assigned = new Set<string>()
  for (let i = 0; i < n; i++) {
    if (assigned.has(ids[i])) continue
    const group = [ids[i]]
    assigned.add(ids[i])
    for (let j = i + 1; j < n; j++) {
      if (!table[i][j] && !assigned.has(ids[j])) {
        group.push(ids[j])
        assigned.add(ids[j])
      }
    }
    groups.push(group)
  }

  // Build minimized DFA
  const minimizedStates: DFAState[] = groups.map((group, idx) => {
    const original = dfa.states.find(s => s.id === group[0])!
    return {
      id: group.join(','),
      x: 150 + idx * 150,
      y: 200,
      isStart: group.some(id => dfa.states.find(s => s.id === id)?.isStart ?? false),
      isFinal: group.some(id => dfa.states.find(s => s.id === id)?.isFinal ?? false),
    }
  })

  const minimizedTransitions: DFATransition[] = []
  for (const group of groups) {
    for (const symbol of dfa.alphabet) {
      const next = getTransition(dfa, group[0], symbol)
      if (next !== null) {
        const targetGroup = groups.find(g => g.includes(next))
        if (targetGroup) {
          const fromId = group.join(',')
          const toId = targetGroup.join(',')
          if (!minimizedTransitions.some(t => t.from === fromId && t.to === toId && t.symbol === symbol)) {
            minimizedTransitions.push({ from: fromId, to: toId, symbol })
          }
        }
      }
    }
  }

  return {
    minimizedDFA: {
      states: minimizedStates,
      transitions: minimizedTransitions,
      alphabet: [...dfa.alphabet],
    },
    steps,
  }
}

// Preset DFA examples
export function presetDFA_endsWithABB(): DFA {
  return {
    states: [
      { id: 'q0', x: 120, y: 200, isStart: true, isFinal: false },
      { id: 'q1', x: 300, y: 200, isStart: false, isFinal: false },
      { id: 'q2', x: 480, y: 200, isStart: false, isFinal: false },
      { id: 'q3', x: 660, y: 200, isStart: false, isFinal: true },
    ],
    transitions: [
      { from: 'q0', to: 'q1', symbol: 'a' },
      { from: 'q0', to: 'q0', symbol: 'b' },
      { from: 'q1', to: 'q1', symbol: 'a' },
      { from: 'q1', to: 'q2', symbol: 'b' },
      { from: 'q2', to: 'q1', symbol: 'a' },
      { from: 'q2', to: 'q3', symbol: 'b' },
      { from: 'q3', to: 'q1', symbol: 'a' },
      { from: 'q3', to: 'q0', symbol: 'b' },
    ],
    alphabet: ['a', 'b'],
  }
}

export function presetDFA_evenZeros(): DFA {
  return {
    states: [
      { id: 'q0', x: 200, y: 200, isStart: true, isFinal: true },
      { id: 'q1', x: 500, y: 200, isStart: false, isFinal: false },
    ],
    transitions: [
      { from: 'q0', to: 'q1', symbol: '0' },
      { from: 'q0', to: 'q0', symbol: '1' },
      { from: 'q1', to: 'q0', symbol: '0' },
      { from: 'q1', to: 'q1', symbol: '1' },
    ],
    alphabet: ['0', '1'],
  }
}
