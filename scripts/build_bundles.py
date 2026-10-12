"""Build self-contained js-dos archives from the unchanged floppy-disk files."""

import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "public" / "bundles"
DEST.mkdir(parents=True, exist_ok=True)
MONTH_FILES = ["MONTHS.DAT", "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]


def add_file(archive, source, name=None):
    archive.write(source, name or source.name)


for program in json.loads((ROOT / "programs.json").read_text()):
    disk = ROOT / program["disk"]
    output = DEST / f'{program["id"]}.jsdos'
    filename = "CAL111.BAS" if program["file"] == "CALENDAR.111" else program["file"]
    config = "[sdl]\nfullscreen=false\n[dosbox]\nmachine=svga_s3\n[autoexec]\nmount c .\nc:\n"
    if "year" in program:
        config += f'date 01-01-{program["year"]}\n'
    config += f'gwbasic {filename}\n'
    with ZipFile(output, "w", ZIP_DEFLATED) as archive:
        archive.writestr(".jsdos/dosbox.conf", config)
        add_file(archive, disk / "GWBASIC.EXE")
        add_file(archive, disk / program["file"], filename)
        if program["type"] == "Calendar":
            for name in MONTH_FILES:
                add_file(archive, disk / name)
    print(output.relative_to(ROOT))
