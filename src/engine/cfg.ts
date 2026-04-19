// CFG Engine — Parser, CNF/GNF conversion

export interface Production {
  head: string
  body: string[] // array of symbols (each string is a terminal or non-terminal)
}

export interface CFG {
  nonTerminals: string[]
  terminals: string[]
  productions: Production[]
  startSymbol: string
}

// Parse a CFG from text like "S -> aS | bA | ε\nA -> aA | b"
export function parseCFG(text: string): CFG {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  const productions: Production[] = []
  const nonTerminals = new Set<string>()
  const terminals = new Set<string>()
  let startSymbol = ''

  for (const line of lines) {
    const [head, bodyStr] = line.split('->').map(s => s.trim())
    if (!head || !bodyStr) continue

    nonTerminals.add(head)
    if (!startSymbol) startSymbol = head

    const alternatives = bodyStr.split('|').map(s => s.trim())
    for (const alt of alternatives) {
      const symbols = alt === 'ε' ? ['ε'] : alt.split('').filter(c => c !== ' ')
      productions.push({ head, body: symbols })

      for (const sym of symbols) {
        if (sym !== 'ε') {
          if (sym === sym.toUpperCase() && sym.match(/[A-Z]/)) {
            nonTerminals.add(sym)
          } else {
            terminals.add(sym)
          }
        }
      }
    }
  }

  return {
    nonTerminals: [...nonTerminals],
    terminals: [...terminals],
    productions,
    startSymbol,
  }
}

// Derivation step
export interface DerivationStep {
  sententialForm: string[]
  productionUsed: Production | null
  position: number // which non-terminal was expanded
}

// Leftmost derivation
export function leftmostDerivation(cfg: CFG, target: string, maxSteps = 20): DerivationStep[] {
  const steps: DerivationStep[] = [{ sententialForm: [cfg.startSymbol], productionUsed: null, position: -1 }]
  
  let bestPath: DerivationStep[] = []
  let maxMatchedLength = -1

  function derive(form: string[], depth: number): boolean {
    if (depth > maxSteps) return false

    const str = form.filter(s => s !== 'ε').join('')
    if (str === target && form.every(s => cfg.terminals.includes(s) || s === 'ε')) {
      return true
    }

    // Find leftmost non-terminal
    const ntIdx = form.findIndex(s => cfg.nonTerminals.includes(s))
    
    const prefix = form.slice(0, ntIdx === -1 ? form.length : ntIdx).filter(s => s !== 'ε').join('')
    if (!target.startsWith(prefix)) return false

    if (prefix.length > maxMatchedLength || (prefix.length === maxMatchedLength && steps.length > bestPath.length)) {
      maxMatchedLength = prefix.length
      bestPath = [...steps]
    }

    if (ntIdx === -1) return str === target

    const nt = form[ntIdx]
    const applicable = cfg.productions.filter(p => p.head === nt)

    for (const prod of applicable) {
      const newForm = [...form.slice(0, ntIdx), ...prod.body, ...form.slice(ntIdx + 1)]
      steps.push({ sententialForm: [...newForm], productionUsed: prod, position: ntIdx })

      if (derive(newForm, depth + 1)) {
        return true
      }

      steps.pop()
    }

    return false
  }

  if (derive([cfg.startSymbol], 0)) {
    return steps
  }
  
  return bestPath.length > 0 ? bestPath : steps
}

// Convert to CNF (simplified)
export interface CNFStep {
  description: string
  productions: Production[]
}

export function convertToCNF(cfg: CFG): CNFStep[] {
  const steps: CNFStep[] = []
  let prods = [...cfg.productions.map(p => ({ ...p, body: [...p.body] }))]

  steps.push({ description: 'Original grammar', productions: prods.map(p => ({ ...p, body: [...p.body] })) })

  // Step 1: Remove ε productions (simplified)
  const nullable = new Set<string>()
  for (const p of prods) {
    if (p.body.length === 1 && p.body[0] === 'ε') {
      nullable.add(p.head)
    }
  }
  prods = prods.filter(p => !(p.body.length === 1 && p.body[0] === 'ε'))
  steps.push({ description: 'Remove ε-productions', productions: prods.map(p => ({ ...p, body: [...p.body] })) })

  // Step 2: Remove unit productions
  const unitFree: Production[] = []
  for (const p of prods) {
    if (p.body.length === 1 && cfg.nonTerminals.includes(p.body[0])) {
      // Unit production: A → B, replace with A → (all productions of B)
      const target = p.body[0]
      const targetProds = prods.filter(pp => pp.head === target && !(pp.body.length === 1 && cfg.nonTerminals.includes(pp.body[0])))
      for (const tp of targetProds) {
        unitFree.push({ head: p.head, body: [...tp.body] })
      }
    } else {
      unitFree.push(p)
    }
  }
  prods = unitFree
  steps.push({ description: 'Remove unit productions', productions: prods.map(p => ({ ...p, body: [...p.body] })) })

  // Step 3: Convert to proper CNF form
  let varCounter = 0
  const terminalVars = new Map<string, string>()

  const cnfProds: Production[] = []
  for (const p of prods) {
    if (p.body.length <= 2 && p.body.every(s => cfg.nonTerminals.includes(s) || (p.body.length === 1 && cfg.terminals.includes(s)))) {
      cnfProds.push(p)
      continue
    }

    // Replace terminals in body with new variables
    const newBody = p.body.map(s => {
      if (cfg.terminals.includes(s)) {
        if (!terminalVars.has(s)) {
          const newVar = `T${varCounter++}`
          terminalVars.set(s, newVar)
          cnfProds.push({ head: newVar, body: [s] })
        }
        return terminalVars.get(s)!
      }
      return s
    })

    // Break long productions into binary
    if (newBody.length <= 2) {
      cnfProds.push({ head: p.head, body: newBody })
    } else {
      let current = p.head
      for (let i = 0; i < newBody.length - 2; i++) {
        const newVar = `X${varCounter++}`
        cnfProds.push({ head: current, body: [newBody[i], newVar] })
        current = newVar
      }
      cnfProds.push({ head: current, body: [newBody[newBody.length - 2], newBody[newBody.length - 1]] })
    }
  }

  steps.push({ description: 'Chomsky Normal Form', productions: cnfProds.map(p => ({ ...p, body: [...p.body] })) })

  return steps
}

// Preset CFGs
export function presetCFG_balanced(): string {
  return 'S -> aSb | ε'
}

export function presetCFG_palindrome(): string {
  return 'S -> aSa | bSb | a | b | ε'
}

export function presetCFG_arithmetic(): string {
  return 'E -> E+T | T\nT -> T*F | F\nF -> (E) | a'
}
