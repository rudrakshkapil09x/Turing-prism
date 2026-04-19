import { GoogleGenAI } from '@google/genai'
import type { DFA } from './dfa'
import type { NFA } from './nfa'
import type { PDA } from './pda'
import type { TuringMachine } from './turing'

export type RagUnit = 'unit1' | 'unit2' | 'unit3' | 'unit4' | 'unit5' | 'unit6'

export interface RagResponse {
  type: 'dfa' | 'nfa' | 'regex' | 'cfg' | 'pda' | 'tm' | 'text' | 'pumping'
  message: string
  payload?: any
}

const getAPIKey = () => {
    // Return from env if available
    return import.meta.env.VITE_GEMINI_API_KEY
}

const getSystemPrompt = (unit: RagUnit) => {
  const base = `You are Prism AI, an expert automata theory assistant. The user will ask you to generate an automaton or theoretical structure. 
Return your response strictly as a JSON object with this exact schema:
{
  "type": "the_type",
  "message": "A helpful explanation of what you generated.",
  "payload": <the_generated_object>
}
Make sure "message" is plain text explaining the generation. Do not use markdown blocks outside the JSON if returning JSON. Just return the JSON directly.`

  switch (unit) {
    case 'unit1':
      return `${base}
Your task: Generate either a DFA or NFA based on the user's prompt. 
If they ask for an NFA or something better suited for NFA (like 'contains substring'), use "type": "nfa".
If DFA, use "type": "dfa".
The payload must match this TypeScript interface:
{
  states: { id: string, x: number, y: number, isStart: boolean, isFinal: boolean }[],
  transitions: { from: string, to: string, symbol: string }[],
  alphabet: string[]
}
For epsilon transitions in NFA, use the symbol 'ε'.
Ensure x and y coordinates are nicely spaced (e.g. x between 100 and 700, y around 200).`

    case 'unit2':
      return `${base}
Your task: If the user asks for a regular expression, return "type": "regex" and the payload is the regex string.
If the user asks to prove a language is not regular, return "type": "pumping" and payload:
{
  language: string,
  isRegular: boolean,
  p: number,
  s: string,
  x: string, y: string, z: string,
  pumped: string[],
  explanation: string
}
For pumping lemma, mathematically choose s, x, y, z to show contradiction on |xy|<=p and |y|>0, and provide 4 pumped strings in the array.`

    case 'unit3':
      return `${base}
Your task depends on what the user is asking:
1. If asking about a CFG/grammar: return "type": "cfg" and payload as a grammar string (rules separated by newlines, e.g. "S -> aSb | ε").
2. If asking about the CFL pumping lemma or whether a language is context-free: return "type": "pumping_cfl" and payload:
{
  language: string,
  isCFL: boolean,
  p: number,
  s: string,
  u: string, v: string, x: string, y: string, z: string,
  pumped: string[],
  explanation: string
}
For pumping: choose p=3, pick a concrete string s, split as uvxyz with |vxy|<=p and |vy|>=1.
The pumped array must be ACTUAL CHARACTER STRINGS (not algebra), providing strings for i=0,1,2.`

    case 'unit4':
      return `${base}
Your task: Generate a Pushdown Automaton. "type": "pda".
Payload matches:
{
  states: { id: string, x: number, y: number, isStart: boolean, isFinal: boolean }[],
  transitions: { from: string, to: string, inputSymbol: string, stackPop: string, stackPush: string[] }[],
  inputAlphabet: string[],
  stackAlphabet: string[],
  startStackSymbol: string
}
Use 'ε' for empty input or empty stack pop/push calculations.
Space x coordinates between 100 and 700, y around 200-300.`

    case 'unit5':
      return `${base}
Your task: Generate a Turing Machine. "type": "tm".
Payload matches:
{
  states: { id: string, isStart: boolean, isHalt: boolean, isAccept: boolean, isReject: boolean }[],
  transitions: { from: string, read: string, write: string, move: 'L'|'R'|'S', to: string }[],
  tapeAlphabet: string[],
  inputAlphabet: string[],
  blankSymbol: string
}
Include at minimum a start state, accept state, and reject state. Use '_' as blank symbol.`

    case 'unit6':
      return `${base}
Your task: Answer complexity theory questions. If classifying a specific problem, return "type": "complexity" and payload:
{
  name: string,
  class: string[],
  description: string,
  example: string,
  reductions: string[]
}
Otherwise return "type": "text" with a helpful explanation in message and null payload.`

    default:
      return base
  }
}

export async function askRAG(unit: RagUnit, query: string): Promise<RagResponse> {
  const apiKey = getAPIKey()
  if (!apiKey) {
    throw new Error('No VITE_GEMINI_API_KEY found in .env. Please add it to enable True RAG.')
  }

  try {
    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: query,
        config: {
            systemInstruction: getSystemPrompt(unit),
            responseMimeType: "application/json",
            temperature: 0.2
        }
    })

    const text = response.text || ''
    try {
        const parsed = JSON.parse(text)
        return parsed as RagResponse
    } catch (e) {
        return { type: 'text', message: `I couldn't generate a structured response for that. Here is what I thought: ${text}` }
    }
  } catch (err: any) {
    if (err.message?.includes('API key not valid')) {
       throw new Error('Invalid Gemini API Key. Please test your key.')
    }
    throw err
  }
}
