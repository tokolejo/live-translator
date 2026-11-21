import zipfile
import docx
import io
import re
import csv
import json

zip_path = r'C:\Users\tokol\Downloads\IICE_2026_Abstracts_2026-11-02.zip'
committee_path = r'C:\Users\tokol\Downloads\International_Scientific_Committee_IICE_2026.docx'

glossary = {}

def add(geo, eng):
    if not geo or not eng:
        return
    geo = re.sub(r'[\s\xa0]+', ' ', geo).strip()
    eng = re.sub(r'[\s\xa0]+', ' ', eng).strip()
    
    # Strip numbering or bullet points
    geo = re.sub(r'^[0-9\.\-\–\—\s\*\#]+', '', geo).strip()
    eng = re.sub(r'^[0-9\.\-\–\—\s\*\#]+', '', eng).strip()
    
    # Strip quotes/brackets
    geo = geo.strip('.,;:"\'()[]{}«»„“')
    eng = eng.strip('.,;:"\'()[]{}«»„“')
    
    if len(geo) < 2 or len(eng) < 2 or geo == eng:
        return
        
    # Check that geo has Georgian letters and eng has Latin
    has_geo = any('\u10A0' <= c <= '\u10FF' for c in geo)
    has_eng = any('a' <= c.lower() <= 'z' for c in eng)
    if has_geo and has_eng:
        if geo not in glossary:
            glossary[geo] = eng

# 1. Base Conference & Academic Terms
base_terms = [
    ("რ. აგლაძის სახელობის არაორგანული ქიმიისა და ელექტროქიმიის ინსტიტუტი", "R. Agladze Institute of Inorganic Chemistry and Electrochemistry"),
    ("არაორგანული ქიმიისა და ელექტროქიმიის ინსტიტუტი", "Institute of Inorganic Chemistry and Electrochemistry"),
    ("საქართველოს მეცნიერებათა ეროვნული აკადემია", "Georgian National Academy of Sciences"),
    ("ივანე ჯავახიშვილის სახელობის თბილისის სახელმწიფო უნივერსიტეტი", "Ivane Javakhishvili Tbilisi State University"),
    ("თბილისის სახელმწიფო უნივერსიტეტი", "Tbilisi State University"),
    ("საქართველოს ტექნიკური უნივერსიტეტი", "Georgian Technical University"),
    ("თბილისის სახელმწიფო სამედიცინო უნივერსიტეტი", "Tbilisi State Medical University"),
    ("იაკობ გოგებაშვილის სახელობის თელავის სახელმწიფო უნივერსიტეტი", "Iakob Gogebashvili Telavi State University"),
    ("თელავის სახელმწიფო უნივერსიტეტი", "Telavi State University"),
    ("ილიას სახელმწიფო უნივერსიტეტი", "Ilia State University"),
    ("საერთაშორისო სამეცნიერო კონფერენცია", "International Scientific Conference"),
    ("საერთაშორისო სამეცნიერო კომიტეტი", "International Scientific Committee"),
    ("სამეცნიერო კომიტეტი", "Scientific Committee"),
    ("ნანოპროცესები და ნანოტექნოლოგიები", "Nanoprocesses and Nanotechnologies"),
    ("მწვანე ქიმია", "Green Chemistry"),
    ("სასარგებლო წიაღისეულისა და მეორადი ნედლეულის გადამუშავება", "Processing of Mineral and Secondary Raw Materials"),
    ("სამეცნიერო ინოვაციების პოპულარიზაცია და კომერციალიზაცია", "Popularization and Commercialization of Scientific Innovations"),
    ("სურსათის ქიმია და ხარისხი", "Food Chemistry and Quality"),
    ("მეცნიერება, ინოვაცია და პოლიტიკა", "Science, Innovation and Policy"),
    ("ზეპირი მოხსენება", "Oral Presentation"),
    ("სასტენდო მოხსენება", "Poster Presentation"),
    ("პლენარული მოხსენება", "Plenary Presentation"),
    ("მოდერატორი", "Moderator"),
    ("სექციის თავმჯდომარე", "Session Chair"),
    ("მოხსენება", "Presentation"),
    ("თეზისი", "Abstract"),
    ("თეზისების კრებული", "Book of Abstracts"),
    ("ელექტროქიმია", "Electrochemistry"),
    ("არაორგანული ქიმია", "Inorganic Chemistry"),
    ("ჰეტეროგენული კატალიზი", "Heterogeneous Catalysis"),
    ("ჰომოგენური კატალიზი", "Homogeneous Catalysis"),
    ("ფოტოელექტროლიზი", "Photoelectrolysis"),
    ("ელექტროკატალიზი", "Electrocatalysis"),
    ("ნანონაწილაკები", "Nanoparticles"),
    ("ნანოფხვნილები", "Nanopowders"),
    ("ნანოდანაფარები", "Nanocoatings"),
    ("ნანოსენსორები", "Nanosensors"),
    ("ნანომასალები", "Nanomaterials"),
    ("ნანოკომპოზიტები", "Nanocomposites"),
    ("ბიოდეგრადირებადი პოლიმერები", "Biodegradable Polymers"),
    ("ფსევდოპროტეინები", "Pseudoproteins"),
    ("ცეოლითები", "Zeolites"),
    ("სუპერკონდენსატორები", "Supercapacitors"),
    ("წყალბადის ენერგეტიკა", "Hydrogen Energy"),
    ("ლითიუმ-იონური ბატარეები", "Lithium-ion Batteries"),
    ("განახლებადი ენერგიის წყაროები", "Renewable Energy Sources"),
    ("ჩამდინარე წყლების გაწმენდა", "Wastewater Treatment"),
    ("მანგანუმის დიოქსიდი", "Manganese Dioxide"),
    ("მანგანუმის სულფატი", "Manganese Sulfate"),
    ("გოგირდწყალბადი", "Hydrogen Sulfide"),
    ("ნახევარგამტარული თხელი ფენები", "Semiconductor Thin Films"),
    ("სპექტროფოტომეტრიული ანალიზი", "Spectrophotometric Analysis"),
    ("ელექტროქიმიური მეთოდები", "Electrochemical Methods"),
    ("ცირკულარული ეკონომიკა", "Circular Economy"),
    ("ინტელექტუალური საკუთრება", "Intellectual Property")
]
for g, e in base_terms:
    add(g, e)

# 2. Parse Committee docx
try:
    cdoc = docx.Document(committee_path)
    cparas = [p.text.strip() for p in cdoc.paragraphs if p.text.strip()]
    # split geo and eng sections
    # geo members start around index 5, eng members around index 20
    geo_members = []
    eng_members = []
    mode = 'geo'
    for p in cparas:
        if 'International Scientific Conference' in p:
            mode = 'eng'
        if re.match(r'^\d+\.', p):
            if mode == 'geo':
                geo_members.append(p)
            else:
                eng_members.append(p)
        elif 'ხელმძღვანელი:' in p:
            geo_members.append(p)
        elif 'Head:' in p:
            eng_members.append(p)
        elif 'მდივანი:' in p:
            geo_members.append(p)
        elif 'Secretary:' in p:
            eng_members.append(p)
            
    for gm, em in zip(geo_members, eng_members):
        # gm e.g. "1. დოქტ. თამაზ მარსაგიშვილი — თსუ..."
        # em e.g. "1. Dr. Tamaz Marsagishvili — R. Agladze..."
        gm_clean = re.sub(r'^\d+\.\s*', '', gm)
        em_clean = re.sub(r'^\d+\.\s*', '', em)
        g_parts = re.split(r'\s*[—–-]\s*', gm_clean)
        e_parts = re.split(r'\s*[—–-]\s*', em_clean)
        if len(g_parts) >= 1 and len(e_parts) >= 1:
            # Name
            g_name = re.sub(r'^(დოქტ|აკადემიკოსი|პროფ|აკად\. პროფ\.)\.?\s*', '', g_parts[0]).strip()
            e_name = re.sub(r'^(Dr|Academician|Prof|Acad\. Prof|Corr\. Member of[^,]+, Dr)\.?\s*', '', e_parts[0]).strip()
            add(g_name, e_name)
            if len(g_parts) > 1 and len(e_parts) > 1:
                add(g_parts[1], e_parts[1])
except Exception as e:
    print("Committee parse error:", e)

# 3. Parse Abstracts Zip
z = zipfile.ZipFile(zip_path)
summary_data = {}
try:
    reader = csv.DictReader(io.StringIO(z.read('SUMMARY.csv').decode('utf-8', errors='ignore')))
    for r in reader:
        num = r.get('Abstract Number') or r.get('\ufeffAbstract Number', '')
        if num:
            summary_data[num.strip()] = r
            fn = r.get('First Name', '').strip()
            ln = r.get('Last Name', '').strip()
            aff = r.get('Affiliation', '').strip()
            if fn and ln:
                # Store author
                pass
except Exception as e:
    print("CSV error:", e)

names = [n for n in z.namelist() if n.endswith(('.docx', '.doc'))]
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

for code in common_codes:
    try:
        g_name = geos[code]
        e_name = engs[code]
        if not g_name.endswith('.docx') or not e_name.endswith('.docx'):
            continue
        g_doc = docx.Document(io.BytesIO(z.read(g_name)))
        e_doc = docx.Document(io.BytesIO(z.read(e_name)))

        g_paras = [p.text.strip() for p in g_doc.paragraphs if p.text.strip()]
        e_paras = [p.text.strip() for p in e_doc.paragraphs if p.text.strip()]

        if not g_paras or not e_paras:
            continue

        # Title
        g_title = g_paras[0]
        e_title = e_paras[0]
        if len(g_title) < 140 and len(e_title) < 150:
            add(g_title, e_title)

        # Authors: paragraph 1
        if len(g_paras) > 1 and len(e_paras) > 1:
            g_auth_str = g_paras[1]
            e_auth_str = e_paras[1]
            g_auths = [re.sub(r'[\d\*\,\#]', '', a).strip() for a in g_auth_str.split(',') if a.strip()]
            e_auths = [re.sub(r'[\d\*\,\#]', '', a).strip() for a in e_auth_str.split(',') if a.strip()]
            if len(g_auths) == len(e_auths) and len(g_auths) <= 8:
                for ga, ea in zip(g_auths, e_auths):
                    if len(ga) > 3 and len(ea) > 3:
                        add(ga, ea)

        # Keywords
        for p in g_paras:
            if 'საკვანძო სიტყვები' in p.lower():
                kw_geo = re.sub(r'^.*?საკვანძო სიტყვები[:\s]*', '', p, flags=re.IGNORECASE)
                geo_kws = [k.strip() for k in re.split(r'[,;•\n]', kw_geo) if k.strip()]
                for ep in e_paras:
                    if 'keyword' in ep.lower():
                        kw_eng = re.sub(r'^.*?keywords?[:\s]*', '', ep, flags=re.IGNORECASE)
                        eng_kws = [k.strip() for k in re.split(r'[,;•\n]', kw_eng) if k.strip()]
                        if len(geo_kws) == len(eng_kws):
                            for gk, ek in zip(geo_kws, eng_kws):
                                add(gk, ek)

        # In-text parenthetical English terms
        for p in g_paras:
            matches = re.findall(r'([ა-ჰ\s\-]{3,35})\s*\(([A-Za-z0-9\s\-]{3,35})\)', p)
            for gm, em in matches:
                # Clean prefix inflections
                gm_clean = re.sub(r'^(ს|ის|ით|ად|ზე|ში|დან|თან|და)\s+', '', gm.strip()).strip()
                if len(gm_clean) >= 3 and not re.match(r'^(ნახ|სურ|ცხრ)', gm_clean):
                    add(gm_clean, em.strip())

    except Exception as err:
        pass

# Also clean up keys: remove trailing Georgian case suffixes for single words if present
cleaned_glossary = {}
for g, e in glossary.items():
    g = re.sub(r'[\xa0\s]+', ' ', g).strip()
    e = re.sub(r'[\xa0\s]+', ' ', e).strip()
    if g and e:
        cleaned_glossary[g] = e

sorted_pairs = sorted(cleaned_glossary.items(), key=lambda x: len(x[0]), reverse=True)
print(f"Final high-precision curated terms: {len(sorted_pairs)}")

with open(r'd:\PROJECTS\live translator\iice_full_glossary.txt', 'w', encoding='utf-8') as f:
    for g, e in sorted_pairs:
        f.write(f"{g}: {e}\n")

print("Saved to iice_full_glossary.txt")
