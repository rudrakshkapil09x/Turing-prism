// Turing Machine Engine

export interface TMState {
  id: string
  isStart: boolean
  isHalt: boolean
  isAccept: boolean
  isReject: boolean
  x?: number
  y?: number
}

export interface TMTransition {
  from: string
  read: string
  write: string
  move: 'L' | 'R' | 'S'
  to: string
}

export interface TuringMachine {
  states: TMState[]
  transitions: TMTransition[]
  tapeAlphabet: string[]
  inputAlphabet: string[]
  blankSymbol: string
}

export interface TMConfig {
  tape: string[]
  headPosition: number
  currentState: string
  step: number
  halted: boolean
  accepted: boolean | null
}

export function createInitialConfig(tm: TuringMachine, input: string): TMConfig {
  const startState = tm.states.find(s => s.isStart)
  const tape = input.length > 0 ? input.split('') : [tm.blankSymbol]
  while (tape.length < 20) tape.push(tm.blankSymbol)
  return { tape, headPosition: 0, currentState: startState?.id ?? 'q0', step: 0, halted: false, accepted: null }
}

export function stepTM(tm: TuringMachine, config: TMConfig): TMConfig {
  if (config.halted) return config
  const currentSymbol = config.tape[config.headPosition] ?? tm.blankSymbol
  const transition = tm.transitions.find(t => t.from === config.currentState && t.read === currentSymbol)
  if (!transition) return { ...config, halted: true, accepted: false, step: config.step + 1 }
  const newTape = [...config.tape]
  newTape[config.headPosition] = transition.write
  let newHead = config.headPosition
  if (transition.move === 'R') newHead++
  else if (transition.move === 'L') newHead = Math.max(0, newHead - 1)
  while (newHead >= newTape.length) newTape.push(tm.blankSymbol)
  const newState = tm.states.find(s => s.id === transition.to)
  const halted = newState?.isHalt || newState?.isAccept || newState?.isReject || false
  const accepted = newState?.isAccept ? true : newState?.isReject ? false : null
  return { tape: newTape, headPosition: newHead, currentState: transition.to, step: config.step + 1, halted, accepted }
}

export function runTM(tm: TuringMachine, input: string, maxSteps = 500): TMConfig[] {
  const configs: TMConfig[] = [createInitialConfig(tm, input)]
  while (!configs[configs.length - 1].halted && configs.length < maxSteps) {
    configs.push(stepTM(tm, configs[configs.length - 1]))
    if (configs[configs.length - 1].halted) break
  }
  return configs
}

export function presetTM_binaryIncrement(): TuringMachine {
  return {
    states: [
      { id: 'q0', isStart: true, isHalt: false, isAccept: false, isReject: false },
      { id: 'q1', isStart: false, isHalt: false, isAccept: false, isReject: false },
      { id: 'qH', isStart: false, isHalt: true, isAccept: true, isReject: false },
    ],
    transitions: [
      { from: 'q0', read: '0', write: '0', move: 'R', to: 'q0' },
      { from: 'q0', read: '1', write: '1', move: 'R', to: 'q0' },
      { from: 'q0', read: '_', write: '_', move: 'L', to: 'q1' },
      { from: 'q1', read: '0', write: '1', move: 'S', to: 'qH' },
      { from: 'q1', read: '1', write: '0', move: 'L', to: 'q1' },
      { from: 'q1', read: '_', write: '1', move: 'S', to: 'qH' },
    ],
    tapeAlphabet: ['0', '1', '_'],
    inputAlphabet: ['0', '1'],
    blankSymbol: '_',
  }
}

export function presetTM_palindrome(): TuringMachine {
  return {
    states: [
      { id: 'q0', isStart: true, isHalt: false, isAccept: false, isReject: false },
      { id: 'q1', isStart: false, isHalt: false, isAccept: false, isReject: false },
      { id: 'q2', isStart: false, isHalt: false, isAccept: false, isReject: false },
      { id: 'q3', isStart: false, isHalt: false, isAccept: false, isReject: false },
      { id: 'q4', isStart: false, isHalt: false, isAccept: false, isReject: false },
      { id: 'qA', isStart: false, isHalt: true, isAccept: true, isReject: false },
      { id: 'qR', isStart: false, isHalt: true, isAccept: false, isReject: true },
    ],
    transitions: [
      { from: 'q0', read: 'a', write: '_', move: 'R', to: 'q1' },
      { from: 'q0', read: 'b', write: '_', move: 'R', to: 'q2' },
      { from: 'q0', read: '_', write: '_', move: 'S', to: 'qA' },
      { from: 'q1', read: 'a', write: 'a', move: 'R', to: 'q1' },
      { from: 'q1', read: 'b', write: 'b', move: 'R', to: 'q1' },
      { from: 'q1', read: '_', write: '_', move: 'L', to: 'q3' },
      { from: 'q2', read: 'a', write: 'a', move: 'R', to: 'q2' },
      { from: 'q2', read: 'b', write: 'b', move: 'R', to: 'q2' },
      { from: 'q2', read: '_', write: '_', move: 'L', to: 'q4' },
      { from: 'q3', read: 'a', write: '_', move: 'L', to: 'q0' },
      { from: 'q3', read: 'b', write: 'b', move: 'S', to: 'qR' },
      { from: 'q3', read: '_', write: '_', move: 'S', to: 'qA' },
      { from: 'q4', read: 'b', write: '_', move: 'L', to: 'q0' },
      { from: 'q4', read: 'a', write: 'a', move: 'S', to: 'qR' },
      { from: 'q4', read: '_', write: '_', move: 'S', to: 'qA' },
    ],
    tapeAlphabet: ['a', 'b', '_'],
    inputAlphabet: ['a', 'b'],
    blankSymbol: '_',
  }
}
