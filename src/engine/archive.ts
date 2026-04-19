import { SimulatorId, UnitId } from '../App'

export interface SavedSimulation {
  id: string
  title: string
  simulator: SimulatorId
  unitId: UnitId
  type: string
  date: string
  states: number
  complexity: 'Beginner' | 'Intermediate' | 'Advanced'
  preview: string
  payload: any
}

// Map logical payload type or simulator to a display name and icon
const TYPE_MAPPING: Record<string, { type: string, preview: string }> = {
  'dfa': { type: 'DFA', preview: 'memory' },
  'nfa': { type: 'NFA', preview: 'bubble_chart' },
  'nfa2dfa': { type: 'NFA → DFA', preview: 'call_split' },
  'dfa-min': { type: 'DFA Minimizer', preview: 'compress' },
  'regex2nfa': { type: 'Regex → NFA', preview: 'functions' },
  'pumping-lemma': { type: 'Pumping Lemma (Regular)', preview: 'repeat' },
  'cfg': { type: 'CFG Parser', preview: 'account_tree' },
  'cnf-gnf': { type: 'CNF / GNF Converter', preview: 'transform' },
  'cfl-pumping': { type: 'CFL Pumping Lemma', preview: 'water' },
  'pda': { type: 'Pushdown Automaton', preview: 'schema' },
  'tm': { type: 'Turing Machine', preview: 'settings_ethernet' },
  'complexity': { type: 'Complexity Class', preview: 'bubble_chart' }
}

export function saveToArchive(simulatorId: SimulatorId, unitId: UnitId, prompt: string, payload: any, payloadType: string) {
  let states = 0;
  if (payload && payload.states && Array.isArray(payload.states)) {
    states = payload.states.length;
  } else if (payload && payload.productions) {
    states = Object.keys(payload.productions).length;
  } else if (payload && payload.transitions) {
    states = payload.transitions.length;
  } else if (payload && Array.isArray(payload)) {
    states = payload.length;
  }

  let complexity: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner';
  if (states > 8) complexity = 'Advanced';
  else if (states >= 4) complexity = 'Intermediate';

  const dateObj = new Date();
  const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

  const mapping = TYPE_MAPPING[simulatorId] || TYPE_MAPPING[payloadType] || { type: payloadType.toUpperCase(), preview: 'memory' };

  const archiveItem: SavedSimulation = {
    id: 'sim_' + Date.now() + '_' + Math.floor(Math.random()*1000),
    title: prompt || 'Generated Content',
    simulator: simulatorId,
    unitId: unitId,
    type: mapping.type,
    date: dateStr,
    states,
    complexity,
    preview: mapping.preview,
    payload,
  };

  const archives = getArchives();
  archives.unshift(archiveItem);
  localStorage.setItem('prism_archives', JSON.stringify(archives));
}

export function getArchives(): SavedSimulation[] {
  try {
    const raw = localStorage.getItem('prism_archives');
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return [];
}

export function removeArchive(id: string) {
  const archives = getArchives().filter(a => a.id !== id);
  localStorage.setItem('prism_archives', JSON.stringify(archives));
}

export function setRestoreSession(simulatorId: SimulatorId, payload: any) {
  localStorage.setItem('prism_restore_session', JSON.stringify({ simulatorId, payload }));
}

export function consumeRestoreSession(simulatorId: SimulatorId): any | null {
  try {
    const raw = localStorage.getItem('prism_restore_session');
    if (raw) {
      const data = JSON.parse(raw);
      if (data.simulatorId === simulatorId) {
        localStorage.removeItem('prism_restore_session');
        return data.payload;
      }
    }
  } catch(e) {}
  return null;
}
