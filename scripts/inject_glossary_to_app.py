import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

with open(BASE_DIR / 'data' / 'curated_iice_glossary.txt', encoding='utf-8') as f:
    glossary_content = f.read().strip()

app_js_path = BASE_DIR / 'js' / 'app.js'
with open(app_js_path, encoding='utf-8') as f:
    app_js = f.read()

# Replace DEFAULT_IICE_GLOSSARY = `...`;
pattern = r'const DEFAULT_IICE_GLOSSARY = `[^`]*`;'
replacement = f'const DEFAULT_IICE_GLOSSARY = `{glossary_content}`;'

new_app_js = re.sub(pattern, replacement, app_js, count=1)

with open(app_js_path, 'w', encoding='utf-8') as f:
    f.write(new_app_js)

print("Updated DEFAULT_IICE_GLOSSARY in js/app.js!")
