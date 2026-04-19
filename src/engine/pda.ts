// PDA Engine — Pushdown Automaton simulation

export interface PDAState {
  id: string
  x: number
  y: number
  isStart: boolean
  isFinal: boolean
}

export interface PDATransition {
  from: string
  to: string
  inputSymbol: string    // input symbol to read (ε for no read)
  stackPop: string       // symbol to pop from stack (ε for no pop)
  stackPush: string[]    // symbols to push (empty array for no push, rightmost is pushed first)
}

export interface PDA {
  states: PDAState[]
  transitions: PDATransition[]
  inputAlphabet: string[]
  stackAlphabet: string[]
  startStackSymbol: string
}

export interface PDAConfig {
  state: string
  remainingInput: string
  stack: string[]
}

export interface PDAStepResult {
  configs: PDAConfig[]
  transitionUsed: PDATransition | null
  step: number
  accepted: boolean | null
}

export function simulatePDA(pda: PDA, input: string): PDAStepResult[] {
  const steps: PDAStepResult[] = []
  const startState = pda.states.find(s => s.isStart)
  if (!startState) return steps

  let configs: PDAConfig[] = [{
    state: startState.id,
    remainingInput: input,
    stack: [pda.startStackSymbol],
  }]

  steps.push({
    configs: configs.map(c => ({ ...c, stack: [...c.stack] })),
    transitionUsed: null,
    step: 0,
    accepted: null,
  })

  for (let step = 1; step <= input.length + 50; step++) {
    const newConfigs: PDAConfig[] = []

    for (const config of configs) {
      // Find applicable transitions
      const applicable = pda.transitions.filter(t => {
        if (t.from !== config.state) return false
        // Check input symbol
        if (t.inputSymbol !== 'ε' && (config.remainingInput.length === 0 || config.remainingInput[0] !== t.inputSymbol)) return false
        // Check stack top
        if (t.stackPop !== 'ε' && (config.stack.length === 0 || config.stack[config.stack.length - 1] !== t.stackPop)) return false
        return true
      })

      for (const t of applicable) {
        const newStack = [...config.stack]
        if (t.stackPop !== 'ε') newStack.pop()
        for (let i = t.stackPush.length - 1; i >= 0; i--) {
          if (t.stackPush[i] !== 'ε') newStack.push(t.stackPush[i])
        }

        const newInput = t.inputSymbol === 'ε'
          ? config.remainingInput
          : config.remainingInput.slice(1)

        newConfigs.push({
          state: t.to,
          remainingInput: newInput,
          stack: newStack,
        })
      }
    }

    if (newConfigs.length === 0) break
    configs = newConfigs

    // Check acceptance (by final state)
    const accepted = configs.some(c =>
      c.remainingInput.length === 0 &&
      pda.states.find(s => s.id === c.state)?.isFinal
    )

    // Check acceptance (by empty stack)
    const acceptedByEmpty = configs.some(c =>
      c.remainingInput.length === 0 && c.stack.length === 0
    )

    steps.push({
      configs: configs.map(c => ({ ...c, stack: [...c.stack] })),
      transitionUsed: null,
      step,
      accepted: (accepted || acceptedByEmpty) ? true : (configs.every(c => c.remainingInput.length === 0) ? false : null),
    })

    if (accepted || acceptedByEmpty) break
  }

  return steps
}

// Preset: PDA for a^n b^n
export function presetPDA_anbn(): PDA {
  return {
    states: [
      { id: 'q0', x: 150, y: 200, isStart: true, isFinal: false },
      { id: 'q1', x: 400, y: 200, isStart: false, isFinal: false },
      { id: 'q2', x: 650, y: 200, isStart: false, isFinal: true },
    ],
    transitions: [
      { from: 'q0', to: 'q0', inputSymbol: 'a', stackPop: 'ε', stackPush: ['A'] },
      { from: 'q0', to: 'q1', inputSymbol: 'b', stackPop: 'A', stackPush: [] },
      { from: 'q1', to: 'q1', inputSymbol: 'b', stackPop: 'A', stackPush: [] },
      { from: 'q1', to: 'q2', inputSymbol: 'ε', stackPop: 'Z', stackPush: [] },
    ],
    inputAlphabet: ['a', 'b'],
    stackAlphabet: ['A', 'Z'],
    startStackSymbol: 'Z',
  }
}
