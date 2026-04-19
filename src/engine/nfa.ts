// NFA Engine — includes epsilon transitions and subset construction
import type { DFA, DFAState, DFATransition } from './dfa'

export interface NFAState {
  id: string
  x: number
  y: number
  isStart: boolean
  isFinal: boolean
}

export interface NFATransition {
  from: string
  to: string
  symbol: string // 'ε' for epsilon
}

export interface NFA {
  states: NFAState[]
  transitions: NFATransition[]
  alphabet: string[] // does NOT include ε
}

export function createEmptyNFA(): NFA {
  return { states: [], transitions: [], alphabet: [] }
}

// Epsilon closure of a set of states
export function epsilonClosure(nfa: NFA, stateIds: Set<string>): Set<string> {
  const closure = new Set(stateIds)
  const stack = [...stateIds]

  while (stack.length > 0) {
    const current = stack.pop()!
    const epsilonTransitions = nfa.transitions.filter(t => t.from === current && t.symbol === 'ε')
    for (const t of epsilonTransitions) {
      if (!closure.has(t.to)) {
        closure.add(t.to)
        stack.push(t.to)
      }
    }
  }

  return closure
}

// Move function: set of states reachable from stateIds on symbol
export function move(nfa: NFA, stateIds: Set<string>, symbol: string): Set<string> {
  const result = new Set<string>()
  for (const id of stateIds) {
    const transitions = nfa.transitions.filter(t => t.from === id && t.symbol === symbol)
    for (const t of transitions) {
      result.add(t.to)
    }
  }
  return result
}

export interface NFAStepResult {
  activeStates: string[]
  symbolRead: string
  accepted: boolean | null
  step: number
}

export function simulateNFA(nfa: NFA, input: string): NFAStepResult[] {
  const steps: NFAStepResult[] = []
  const startState = nfa.states.find(s => s.isStart)
  if (!startState) return steps

  let currentStates = epsilonClosure(nfa, new Set([startState.id]))
  steps.push({
    activeStates: [...currentStates],
    symbolRead: '',
    accepted: null,
    step: 0,
  })

  for (let i = 0; i < input.length; i++) {
    const symbol = input[i]
    const moved = move(nfa, currentStates, symbol)
    currentStates = epsilonClosure(nfa, moved)

    const isFinal = [...currentStates].some(id => nfa.states.find(s => s.id === id)?.isFinal ?? false)
    steps.push({
      activeStates: [...currentStates],
      symbolRead: symbol,
      accepted: i === input.length - 1 ? (currentStates.size > 0 && isFinal) : null,
      step: i + 1,
    })

    if (currentStates.size === 0) {
      steps[steps.length - 1].accepted = false
      return steps
    }
  }

  if (steps.length === 1) {
    const isFinal = [...currentStates].some(id => nfa.states.find(s => s.id === id)?.isFinal ?? false)
    steps[0].accepted = isFinal
  }

  return steps
}

// Subset construction: NFA → DFA
export interface SubsetConstructionStep {
  dfaState: string // comma-separated NFA state ids
  nfaStates: string[]
  symbol?: string
  targetDfaState?: string
  reason: string
}

export function subsetConstruction(nfa: NFA): { dfa: DFA; steps: SubsetConstructionStep[] } {
  const steps: SubsetConstructionStep[] = []
  const startState = nfa.states.find(s => s.isStart)
  if (!startState) {
    return {
      dfa: { states: [], transitions: [], alphabet: [...nfa.alphabet] },
      steps,
    }
  }

  const startClosure = epsilonClosure(nfa, new Set([startState.id]))
  const startKey = [...startClosure].sort().join(',')

  steps.push({
    dfaState: startKey,
    nfaStates: [...startClosure],
    reason: `ε-closure of start state {${startState.id}} = {${startKey}}`,
  })

  const dfaStatesMap = new Map<string, Set<string>>()
  dfaStatesMap.set(startKey, startClosure)

  const queue = [startKey]
  const dfaTransitions: DFATransition[] = []
  const processed = new Set<string>()

  while (queue.length > 0) {
    const currentKey = queue.shift()!
    if (processed.has(currentKey)) continue
    processed.add(currentKey)

    const currentNFAStates = dfaStatesMap.get(currentKey)!

    for (const symbol of nfa.alphabet) {
      const moved = move(nfa, currentNFAStates, symbol)
      const closure = epsilonClosure(nfa, moved)

      if (closure.size === 0) continue

      const targetKey = [...closure].sort().join(',')

      steps.push({
        dfaState: currentKey,
        nfaStates: [...currentNFAStates],
        symbol,
        targetDfaState: targetKey,
        reason: `δ({${currentKey}}, ${symbol}) = ε-closure(move({${currentKey}}, ${symbol})) = {${targetKey}}`,
      })

      if (!dfaStatesMap.has(targetKey)) {
        dfaStatesMap.set(targetKey, closure)
        queue.push(targetKey)
      }

      dfaTransitions.push({ from: currentKey, to: targetKey, symbol })
    }
  }

  // Build DFA states
  const dfaStates: DFAState[] = []
  let idx = 0
  for (const [key, nfaStates] of dfaStatesMap) {
    const isFinal = [...nfaStates].some(id => nfa.states.find(s => s.id === id)?.isFinal ?? false)
    dfaStates.push({
      id: key,
      x: 150 + (idx % 4) * 180,
      y: 150 + Math.floor(idx / 4) * 150,
      isStart: key === startKey,
      isFinal,
    })
    idx++
  }

  return {
    dfa: { states: dfaStates, transitions: dfaTransitions, alphabet: [...nfa.alphabet] },
    steps,
  }
}

// Presets
export function presetNFA_aOrBStar(): NFA {
  return {
    states: [
      { id: 'q0', x: 120, y: 200, isStart: true, isFinal: false },
      { id: 'q1', x: 350, y: 120, isStart: false, isFinal: false },
      { id: 'q2', x: 350, y: 280, isStart: false, isFinal: false },
      { id: 'q3', x: 580, y: 200, isStart: false, isFinal: true },
    ],
    transitions: [
      { from: 'q0', to: 'q1', symbol: 'ε' },
      { from: 'q0', to: 'q2', symbol: 'ε' },
      { from: 'q1', to: 'q3', symbol: 'a' },
      { from: 'q2', to: 'q3', symbol: 'b' },
      { from: 'q3', to: 'q0', symbol: 'ε' },
    ],
    alphabet: ['a', 'b'],
  }
}
