import re

with open(r'd:\PROJECTS\live translator\curated_iice_glossary.txt', encoding='utf-8') as f:
    glossary_content = f.read().strip()

with open(r'd:\PROJECTS\live translator\app.js', encoding='utf-8') as f:
    app_js = f.read()

# Replace DEFAULT_IICE_GLOSSARY = `...`;
pattern = r'const DEFAULT_IICE_GLOSSARY = `[^`]*`;'
replacement = f'const DEFAULT_IICE_GLOSSARY = `{glossary_content}`;'

new_app_js = re.sub(pattern, replacement, app_js, count=1)

with open(r'd:\PROJECTS\live translator\app.js', 'w', encoding='utf-8') as f:
    f.write(new_app_js)

print("Updated DEFAULT_IICE_GLOSSARY in app.js!")
