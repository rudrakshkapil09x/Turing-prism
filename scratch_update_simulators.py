import os
import re

base_path = 'c:/TOC/src/components/simulators'

simulators = [
    ('unit1/DFASimulator.tsx', 'dfa', 'setDfa(payload || presetDFA())', "import { presetDFA } from '../../../engine/dfa';"),
    ('unit1/NFASimulator.tsx', 'nfa', 'setNfa(payload || presetNFA())', "import { presetNFA } from '../../../engine/nfa';"),
    ('unit1/NFAtoDFA.tsx', 'nfa2dfa', 'setNfa(payload || presetNFA())', "import { presetNFA } from '../../../engine/nfa';"),
    ('unit1/DFAMinimizer.tsx', 'dfa-min', 'if (payload) { setDfa(payload); setResult(null); }', ""),
    ('unit2/RegexToNFA.tsx', 'regex2nfa', 'if (payload) { setRegex(payload.regex || ""); }', ""),
    ('unit2/PumpingLemma.tsx', 'pumping-lemma', 'if (payload) { setSelected(payload); setQuery(payload.language || ""); }', ""),
    ('unit3/CFGParser.tsx', 'cfg', 'if (payload) setCfg(payload)', ""),
    ('unit3/CNFGNFConverter.tsx', 'cnf-gnf', 'if (payload) setCfg(payload)', ""),
    ('unit3/CFLPumpingLemma.tsx', 'cfl-pumping', 'if (payload) { setSelected(payload); setQuery(payload.language || ""); }', ""),
    ('unit4/PDASimulator.tsx', 'pda', 'if (payload) setPda(payload)', ""),
    ('unit5/TuringMachine.tsx', 'tm', 'if (payload) setTm(payload)', ""),
    ('unit6/ComplexityVisualizer.tsx', 'complexity', 'if (payload) { setHighlighted(payload); setQuery(payload.name || ""); }', "")
]

for file_path, sim_id, restore_logic, extra_import in simulators:
    full_path = os.path.join(base_path, file_path)
    if not os.path.exists(full_path):
        continue
        
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Add consumeRestoreSession import if not present
    if 'consumeRestoreSession' not in content:
        # Find RAGPanel import and insert after
        content = re.sub(r"(import RAGPanel[^\n]+\n)", r"\1import { consumeRestoreSession } from '../../../engine/archive'\n", content, 1)
        
    # Update <RAGPanel ... /> to include simulatorId
    content = re.sub(r"(<RAGPanel\s+)unit=", f"\\1simulatorId=\"{sim_id}\" unit=", content)
    
    # Inject consumeRestoreSession inside useEffect([]) or component mount
    # Search for useEffect(() => {
    # If not found or want to be safe, just inject a new useEffect before return
    
    inject_str = f"""
  useEffect(() => {{
    const payload = consumeRestoreSession('{sim_id}')
    if (payload) {{
      {restore_logic}
    }}
  }}, [])
"""
    if f"consumeRestoreSession('{sim_id}')" not in content:
        # Insert before the final return statement (simple heuristic)
        last_return_idx = content.rfind('  return (')
        if last_return_idx != -1:
            content = content[:last_return_idx] + inject_str + content[last_return_idx:]

    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)

print('Updated all simulators.')
