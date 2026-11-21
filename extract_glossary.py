import zipfile
import docx
import io
import re
import csv
import json

zip_path = r'C:\Users\tokol\Downloads\IICE_2026_Abstracts_2026-11-02.zip'
z = zipfile.ZipFile(zip_path)

# Map abstract numbers to metadata
summary_data = {}
try:
    reader = csv.DictReader(io.StringIO(z.read('SUMMARY.csv').decode('utf-8', errors='ignore')))
    for r in reader:
        num = r.get('Abstract Number') or r.get('\ufeffAbstract Number', '')
        if num:
            summary_data[num.strip()] = r
except Exception as e:
    print("CSV error:", e)

names = [n for n in z.namelist() if n.endswith('.docx')]
geos = {}
engs = {}

for n in names:
    m = re.search(r'(IICE-2026-\d+)', n)
    if m:
        code = m.group(1)
        if '_GEO' in n:
            geos[code] = n
        elif '_ENG' in n:
            engs[code] = n

common_codes = sorted(list(set(geos.keys()) & set(engs.keys())))
print(f"Found {len(common_codes)} paired abstracts.")

glossary_pairs = {}

def add_pair(geo, eng):
    geo = re.sub(r'[\s\xa0]+', ' ', geo).strip()
    eng = re.sub(r'[\s\xa0]+', ' ', eng).strip()
    # Strip numbering or punctuation
    geo = re.sub(r'^[0-9\.\-\–\s]+', '', geo).strip()
    eng = re.sub(r'^[0-9\.\-\–\s]+', '', eng).strip()
    geo = geo.strip('.,;:"\'()[]{}')
    eng = eng.strip('.,;:"\'()[]{}')
    if len(geo) > 1 and len(eng) > 1 and geo != eng:
        # Check that geo contains Georgian letters and eng contains Latin letters
        has_geo = any('\u10A0' <= c <= '\u10FF' for c in geo)
        has_eng = any('a' <= c.lower() <= 'z' for c in eng)
        if has_geo and has_eng:
            if geo not in glossary_pairs:
                glossary_pairs[geo] = eng

# 1. Base Topics
topics = [
    ("ნანოპროცესები და ნანოტექნოლოგიები", "Nanoprocesses and Nanotechnologies"),
    ("მწვანე ქიმია", "Green Chemistry"),
    ("სასარგებლო წიაღისეულისა და მეორადი ნედლეულის გადამუშავება", "Processing of Mineral and Secondary Raw Materials"),
    ("სამეცნიერო ინოვაციების პოპულარიზაცია და კომერციალიზაცია", "Popularization and Commercialization of Scientific Innovations"),
    ("სურსათის ქიმია და ხარისხი", "Food Chemistry and Quality"),
    ("მეცნიერება, ინოვაცია და პოლიტიკა", "Science, Innovation and Policy"),
    ("ზეპირი მოხსენება", "Oral Presentation"),
    ("სასტენდო მოხსენება", "Poster Presentation"),
    ("საქართველოს მეცნიერებათა ეროვნული აკადემია", "Georgian National Academy of Sciences"),
    ("არაორგანული ქიმიისა და ელექტროქიმიის ინსტიტუტი", "Institute of Inorganic Chemistry and Electrochemistry"),
    ("თბილისის სახელმწიფო უნივერსიტეტი", "Tbilisi State University"),
    ("საქართველოს ტექნიკური უნივერსიტეტი", "Georgian Technical University"),
    ("თბილისის სახელმწიფო სამედიცინო უნივერსიტეტი", "Tbilisi State Medical University"),
    ("ილიას სახელმწიფო უნივერსიტეტი", "Ilia State University")
]
for g, e in topics:
    add_pair(g, e)

# 2. Extract from pairs
for code in common_codes:
    try:
        g_name = geos[code]
        e_name = engs[code]
        g_doc = docx.Document(io.BytesIO(z.read(g_name)))
        e_doc = docx.Document(io.BytesIO(z.read(e_name)))

        g_paras = [p.text.strip() for p in g_doc.paragraphs if p.text.strip()]
        e_paras = [p.text.strip() for p in e_doc.paragraphs if p.text.strip()]

        if not g_paras or not e_paras:
            continue

        # Title pair
        g_title = g_paras[0]
        e_title = e_paras[0]
        if len(g_title) < 120 and len(e_title) < 140:
            add_pair(g_title, e_title)

        # Look for keywords
        for p in g_paras:
            if 'საკვანძო სიტყვები' in p.lower():
                # extract
                kw_geo = re.sub(r'^.*?საკვანძო სიტყვები[:\s]*', '', p, flags=re.IGNORECASE)
                geo_kws = [k.strip() for k in re.split(r'[,;•\n]', kw_geo) if k.strip()]
                for ep in e_paras:
                    if 'keyword' in ep.lower():
                        kw_eng = re.sub(r'^.*?keywords?[:\s]*', '', ep, flags=re.IGNORECASE)
                        eng_kws = [k.strip() for k in re.split(r'[,;•\n]', kw_eng) if k.strip()]
                        if len(geo_kws) == len(eng_kws):
                            for gk, ek in zip(geo_kws, eng_kws):
                                add_pair(gk, ek)

        # Look for Georgian text with English term in brackets: e.g. "ქართული (English)"
        for p in g_paras:
            matches = re.findall(r'([ა-ჰ\s\-]{3,35})\s*\(([A-Za-z0-9\s\-]{3,35})\)', p)
            for gm, em in matches:
                add_pair(gm.strip(), em.strip())

        # Author matching from SUMMARY or second paragraph
        meta = summary_data.get(code)
        if meta:
            fn = meta.get('First Name', '').strip()
            ln = meta.get('Last Name', '').strip()
            full_geo = f"{fn} {ln}".strip()
            # Find in e_paras[1] or filename
            # Often english name is in e_paras[1]
            if len(e_paras) > 1:
                e_auths = e_paras[1]
                # check if there's a match
                for word in e_auths.split(','):
                    w = word.strip()
                    # if last name or initial matches
                    if len(w) > 4 and any(c.isupper() for c in w):
                        # clean numbers from author name
                        w_clean = re.sub(r'[\d\*\,\#]', '', w).strip()
                        if len(w_clean.split()) in [2, 3]:
                            add_pair(full_geo, w_clean)
                            break
    except Exception as err:
        pass

print(f"Total extracted glossary pairs: {len(glossary_pairs)}")

# Sort by length descending so longer phrases match first!
sorted_items = sorted(glossary_pairs.items(), key=lambda x: len(x[0]), reverse=True)

with open(r'd:\PROJECTS\live translator\extracted_glossary.json', 'w', encoding='utf-8') as f:
    json.dump(dict(sorted_items), f, ensure_ascii=False, indent=2)

# Also create text format
with open(r'd:\PROJECTS\live translator\extracted_glossary.txt', 'w', encoding='utf-8') as f:
    for g, e in sorted_items:
        f.write(f"{g}: {e}\n")

print("Glossary saved to extracted_glossary.txt and extracted_glossary.json")
