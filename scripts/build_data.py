"""Extract readable disk text for the family archive page.

Original floppy files are read only; the output is a UTF-8 JSON copy.
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MONTHS = 'JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC'.split()
catalog = json.loads((ROOT / 'programs.json').read_text())


def cp437(path):
    return path.read_bytes().decode('cp437').replace('\r\n', '\n').rstrip('\x1a\n')


def item(path, text=None):
    return {'path': str(path.relative_to(ROOT)), 'text': cp437(path) if text is None else text}


calendar_disk = ROOT / 'sams-calendar-program-1'
reminders = []
for month in MONTHS:
    path = calendar_disk / month
    lines = cp437(path).splitlines()
    reminders.append({'month': month, 'path': str(path.relative_to(ROOT)), 'lines': lines})

month_path = calendar_disk / 'MONTHS.DAT'
month_data = [dict(name=name, days=int(days)) for name, days in
              (line.split(',') for line in cp437(month_path).splitlines())]

contacts = []
for program_id, label in [
    ('calendar-89', 'Earlier Kern-area printout'),
    ('calendar-98-kern', '1998 Kern-area copy'),
    ('calendar-98-hemet', '1998 Hemet copy'),
]:
    listing = (ROOT / 'public' / 'listings' / f'{program_id}.txt').read_text()
    lines = []
    for line in listing.splitlines():
        number = int(line.split(maxsplit=1)[0]) if line.split() else 0
        if 4140 <= number <= 4210:
            match = re.search(r'LPRINT\s+TAB\(24\)"([^"]+)"', line)
            if match:
                lines.append(match.group(1))
    contacts.append({'programId': program_id, 'title': label, 'lines': lines})

letter = ROOT / 'sams-calendar' / 'README.DOC'
names = ROOT / 'sams-calendar-program' / 'NAMES.DOC'
note = ROOT / 'sams-calendar-program' / 'LEGNOTES.DAT'
note_records = [note.read_bytes()[i:i+41].decode('cp437').lstrip('(').rstrip()
                for i in range(0, note.stat().st_size, 41)]

documents = [
    {'title': 'The note addressed to Samuel', **item(letter)},
    {'title': 'Address-book screen template', **item(names, cp437(names).split('\x1a')[0].rstrip())},
    {'title': 'Promissory-note test text', **item(note, '\n'.join(line for line in note_records if line))},
    {'title': '1998 startup batch file', **item(ROOT / 'sams-calendar-program-1' / 'B.BAT')},
    {'title': 'Earlier startup batch file', **item(ROOT / 'sams-calendar-program' / 'B.BAT')},
    {'title': 'Hex arithmetic batch file', **item(ROOT / 'sams-calendar-program' / 'HEX.BAT')},
]

program_text = []
for program in catalog:
    listing = (ROOT / 'public' / 'listings' / f'{program["id"]}.txt').read_text()
    strings = []
    for line in listing.splitlines():
        for match in re.finditer(r'"((?:[^"]|"")*)"', line):
            value = match.group(1).replace('""', '"')
            if value.strip():
                strings.append({'line': line.split(maxsplit=1)[0], 'text': value})
    program_text.append({
        'programId': program['id'],
        'title': program['title'],
        'path': f'{program["disk"]}/{program["file"]}',
        'strings': strings,
    })

archive = {
    'monthData': {'path': str(month_path.relative_to(ROOT)), 'rows': month_data},
    'reminders': reminders,
    'contacts': contacts,
    'documents': documents,
    'programText': program_text,
}
output = ROOT / 'public' / 'archive-data.json'
output.write_text(json.dumps(archive, ensure_ascii=False, indent=2) + '\n')
print(output.relative_to(ROOT))
