import os
import re

base_path = 'c:/TOC/src/components/simulators'

for root, _, files in os.walk(base_path):
    for f in files:
        if f.endswith('.tsx'):
            full_path = os.path.join(root, f)
            with open(full_path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # Remove bad imports
            content = re.sub(r"import\s*{\s*presetDFA\s*}\s*from\s*'[^']+/engine/dfa';\n", "", content)
            content = re.sub(r"import\s*{\s*presetNFA\s*}\s*from\s*'[^']+/engine/nfa';\n", "", content)
            
            # Fix unreachable or bad presets
            content = content.replace("setDfa(payload || presetDFA())", "setDfa(payload)")
            content = content.replace("setNfa(payload || presetNFA())", "setNfa(payload)")

            with open(full_path, 'w', encoding='utf-8') as file:
                file.write(content)

print("Cleanup complete.")
