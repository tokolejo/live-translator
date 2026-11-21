import re
import json

with open(r'd:\PROJECTS\live translator\iice_full_glossary.txt', encoding='utf-8') as f:
    raw_lines = [l.strip() for l in f if ':' in l]

cleaned_dict = {}

def clean_term(s):
    # remove footnote numbers, superscripts, stars
    s = re.sub(r'[\d¹²³⁴⁵⁶⁷⁸⁹⁰\*\#\†\‡]', '', s)
    s = re.sub(r'[\s\xa0]+', ' ', s).strip()
    s = s.strip('.,;:"\'()[]{}«»„“/- ')
    return s

for l in raw_lines:
    parts = l.split(':', 1)
    if len(parts) != 2:
        continue
    g = clean_term(parts[0])
    e = clean_term(parts[1])
    
    # Filter junk
    if len(g) < 2 or len(e) < 2:
        continue
    # If Georgian has fragments like "სა და", "ი იქნა", "ს მიზანი"
    if re.match(r'^(სა და|ი იქნა|ს მიზანი|ევის ფარგლებში|ს იზოთერმები|წავლად|ციაში დამატებულ|როცესის|ოქსიდის|ონიკოტინმჟავას|აც შეეხება|ები მიღებულ|ატის სინთეზი|ს შეფასება|მოითვალა|ინიმალური|ზა და|ია არაწვრილ|ნული|რი ახალი|ეკრიტიკული|ღალეფექტურ|დან სიღრმული|საწინააღმდეგო|ტიანი|წარმოადგენდა|ე ფენოლთან|ს კრიტიკული|ორეზისა|ფოტოდიოდურ|ის მსგავს|ტიციდების|ექვისა|ილი ნივთიერებების|ფუძვნებული|მოკვლეულია|ნთეზირებული|ბისა და|შემცველი|ეული ღეროვანი|ს დი|ი აქტივირებული|ენციალური|აზმის|ანსმისიული)', g):
        continue
    # Check that g has Georgian and e has English
    if not any('\u10A0' <= c <= '\u10FF' for c in g):
        continue
    if not any('a' <= c.lower() <= 'z' for c in e):
        continue
        
    cleaned_dict[g] = e

print(f"Total polished entries: {len(cleaned_dict)}")

# Sort by length descending
sorted_items = sorted(cleaned_dict.items(), key=lambda x: len(x[0]), reverse=True)

with open(r'd:\PROJECTS\live translator\curated_iice_glossary.txt', 'w', encoding='utf-8') as f:
    for g, e in sorted_items:
        f.write(f"{g}: {e}\n")

print("Saved to curated_iice_glossary.txt")
