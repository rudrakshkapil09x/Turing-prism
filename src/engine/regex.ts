// Regex → NFA via Thompson's Construction
import type { NFA, NFAState, NFATransition } from './nfa'

interface RegexNode {
  type: 'char' | 'concat' | 'union' | 'star' | 'epsilon'
  value?: string
  left?: RegexNode
  right?: RegexNode
  child?: RegexNode
}

// Tokenizer
function tokenize(regex: string): string[] {
  const tokens: string[] = []
  for (let i = 0; i < regex.length; i++) {
    if (regex[i] === '\\' && i + 1 < regex.length) {
      tokens.push(regex[i + 1])
      i++
    } else {
      tokens.push(regex[i])
    }
  }
  return tokens
}

// Add explicit concat operators
function addConcatOps(tokens: string[]): string[] {
  const result: string[] = []
  const isOperand = (t: string) => t !== '(' && t !== ')' && t !== '|' && t !== '*' && t !== '+'
  for (let i = 0; i < tokens.length; i++) {
    result.push(tokens[i])
    if (i + 1 < tokens.length) {
      const curr = tokens[i]
      const next = tokens[i + 1]
      if (
        (isOperand(curr) || curr === ')' || curr === '*' || curr === '+') &&
        (isOperand(next) || next === '(')
      ) {
        result.push('·')
      }
    }
  }
  return result
}

// Shunting-yard to postfix
function toPostfix(tokens: string[]): string[] {
  const output: string[] = []
  const stack: string[] = []
  const precedence: Record<string, number> = { '|': 1, '·': 2, '*': 3, '+': 3 }

  for (const token of tokens) {
    if (token === '(') {
      stack.push(token)
    } else if (token === ')') {
      while (stack.length > 0 && stack[stack.length - 1] !== '(') {
        output.push(stack.pop()!)
      }
      stack.pop() // remove '('
    } else if (token in precedence) {
      while (
        stack.length > 0 &&
        stack[stack.length - 1] !== '(' &&
        (precedence[stack[stack.length - 1]] ?? 0) >= precedence[token]
      ) {
        output.push(stack.pop()!)
      }
      stack.push(token)
    } else {
      output.push(token)
    }
  }

  while (stack.length > 0) {
    output.push(stack.pop()!)
  }

  return output
}

let stateCounter = 0
function freshState(x: number, y: number): NFAState {
  return { id: `s${stateCounter++}`, x, y, isStart: false, isFinal: false }
}

interface NFAFragment {
  start: string
  accept: string
  states: NFAState[]
  transitions: NFATransition[]
}

function charFragment(ch: string): NFAFragment {
  const s = freshState(0, 0)
  const a = freshState(0, 0)
  return {
    start: s.id,
    accept: a.id,
    states: [s, a],
    transitions: [{ from: s.id, to: a.id, symbol: ch }],
  }
}

function concatFragments(f1: NFAFragment, f2: NFAFragment): NFAFragment {
  // Merge f1.accept with f2.start
  const transitions = [
    ...f1.transitions,
    ...f2.transitions,
    { from: f1.accept, to: f2.start, symbol: 'ε' },
  ]
  return {
    start: f1.start,
    accept: f2.accept,
    states: [...f1.states, ...f2.states],
    transitions,
  }
}

function unionFragments(f1: NFAFragment, f2: NFAFragment): NFAFragment {
  const s = freshState(0, 0)
  const a = freshState(0, 0)
  return {
    start: s.id,
    accept: a.id,
    states: [s, ...f1.states, ...f2.states, a],
    transitions: [
      ...f1.transitions,
      ...f2.transitions,
      { from: s.id, to: f1.start, symbol: 'ε' },
      { from: s.id, to: f2.start, symbol: 'ε' },
      { from: f1.accept, to: a.id, symbol: 'ε' },
      { from: f2.accept, to: a.id, symbol: 'ε' },
    ],
  }
}

function starFragment(f: NFAFragment): NFAFragment {
  const s = freshState(0, 0)
  const a = freshState(0, 0)
  return {
    start: s.id,
    accept: a.id,
    states: [s, ...f.states, a],
    transitions: [
      ...f.transitions,
      { from: s.id, to: f.start, symbol: 'ε' },
      { from: s.id, to: a.id, symbol: 'ε' },
      { from: f.accept, to: f.start, symbol: 'ε' },
      { from: f.accept, to: a.id, symbol: 'ε' },
    ],
  }
}

export function regexToNFA(regex: string): NFA {
  stateCounter = 0
  const tokens = tokenize(regex)
  const withConcat = addConcatOps(tokens)
  const postfix = toPostfix(withConcat)

  const stack: NFAFragment[] = []
  const alphabet = new Set<string>()

  for (const token of postfix) {
    if (token === '·') {
      const f2 = stack.pop()!
      const f1 = stack.pop()!
      stack.push(concatFragments(f1, f2))
    } else if (token === '|') {
      const f2 = stack.pop()!
      const f1 = stack.pop()!
      stack.push(unionFragments(f1, f2))
    } else if (token === '*') {
      const f = stack.pop()!
      stack.push(starFragment(f))
    } else if (token === '+') {
      // a+ = aa*
      const f = stack.pop()!
      const fCopy = charFragment(token) // Actually we need to redo this
      // Simpler: a+ is concat(a, a*)
      stack.push(concatFragments(f, starFragment({ ...f, states: f.states.map(s => ({ ...s, id: `${s.id}'` })), transitions: f.transitions.map(t => ({ from: `${t.from}'`, to: `${t.to}'`, symbol: t.symbol })), start: `${f.start}'`, accept: `${f.accept}'` })))
    } else {
      alphabet.add(token)
      stack.push(charFragment(token))
    }
  }

  if (stack.length === 0) {
    return { states: [], transitions: [], alphabet: [] }
  }

  const result = stack[0]

  // Geometrical layout using DAG longest-path to order states into columns
  const isBackEdge = new Set<string>()
  const visited = new Set<string>()
  const recStack = new Set<string>()

  // Build adjacency
  const adj = new Map<string, string[]>()
  result.states.forEach(s => adj.set(s.id, []))
  result.transitions.forEach(t => adj.get(t.from)?.push(t.to))

  // DFS to find back-edges
  function dfsBackEdges(u: string) {
    visited.add(u)
    recStack.add(u)
    const neighbors = adj.get(u) || []
    for (const v of neighbors) {
      if (!visited.has(v)) {
        dfsBackEdges(v)
      } else if (recStack.has(v)) {
        isBackEdge.add(`${u}->${v}`)
      }
    }
    recStack.delete(u)
  }
  dfsBackEdges(result.start)

  // Topological Sort on DAG
  const topo: string[] = []
  const visitedTopo = new Set<string>()
  function dfsTopo(u: string) {
    visitedTopo.add(u)
    const neighbors = adj.get(u) || []
    for (const v of neighbors) {
      if (!isBackEdge.has(`${u}->${v}`) && !visitedTopo.has(v)) {
        dfsTopo(v)
      }
    }
    topo.push(u)
  }
  // Make sure all states are visited in case there are unreachable ones
  result.states.forEach(s => {
    if (!visitedTopo.has(s.id)) dfsTopo(s.id)
  })
  topo.reverse()

  // Longest path for column resolution
  const level = new Map<string, number>()
  result.states.forEach(s => level.set(s.id, 0))

  for (const u of topo) {
    const uLvl = level.get(u) || 0
    const neighbors = adj.get(u) || []
    for (const v of neighbors) {
      if (!isBackEdge.has(`${u}->${v}`)) {
        if (uLvl + 1 > (level.get(v) || 0)) {
          level.set(v, uLvl + 1)
        }
      }
    }
  }

  // Assign Coordinates
  const levelGroups = new Map<number, NFAState[]>()
  result.states.forEach(s => {
    const lvl = level.get(s.id) || 0
    if (!levelGroups.has(lvl)) levelGroups.set(lvl, [])
    levelGroups.get(lvl)!.push(s)
  })

  // Optional: sort level groups consistently to avoid crossing edges (simple heuristic)
  // For Thompson's, maintaining creation order usually works nicely.
  
  result.states.forEach(s => {
    const lvl = level.get(s.id) || 0
    const group = levelGroups.get(lvl)!
    const index = group.indexOf(s)
    
    s.x = 100 + (lvl * 120)
    s.y = 250 + (index - (group.length - 1) / 2) * 80
  })

  // Mark start and final
  const startState = result.states.find(s => s.id === result.start)
  if (startState) startState.isStart = true
  const finalState = result.states.find(s => s.id === result.accept)
  if (finalState) finalState.isFinal = true

  return {
    states: result.states,
    transitions: result.transitions,
    alphabet: [...alphabet],
  }
}
