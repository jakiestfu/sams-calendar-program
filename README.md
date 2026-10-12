# Sam's calendar program and BASIC archive

My grandfather Sam was an electrician who loved puzzles and writing code. By the time I was old enough to know him, he had late-stage Alzheimer's. After he passed, my mother found his floppy disks and gave them to me. This repository preserves the files I found on them, including his calendar, small BASIC experiments, data files, and a note addressed to “Samuel.”

## What is here?

These are **GW-BASIC programs for MS-DOS**, not Visual Basic scripts. Most `.BAS` files begin with `FF` and are saved in GW-BASIC's tokenized binary format, so opening them as plain text produces gibberish. The readable copies in [`public/listings/`](public/listings/) were decoded with [PC-BASIC](https://github.com/robhagemans/pcbasic) 2.0.8; the original disk files remain unchanged. [`CALENDAR.111`](sams-calendar-program/CALENDAR.111) is also a tokenized BASIC program despite its extension.

The three folders appear to be separate disk copies or snapshots:

| Folder | Contents |
| --- | --- |
| [`sams-calendar-program/`](sams-calendar-program/) | The broadest collection: calendar revisions, other programs, utility files, month data, and printer experiments. |
| [`sams-calendar-program-1/`](sams-calendar-program-1/) | A 1998 calendar copy, the `CLEAN` utility, and calendar data. |
| [`sams-calendar/`](sams-calendar/) | Another 1998 calendar copy with the same data files and an accompanying [`README.DOC`](sams-calendar/README.DOC). |

The two `CALEND98.BAS` files have the same calendar logic but different first comments and different **printed emergency/contact lists**: one refers to Hemet and the other to the Kern area. The month and important-date data files are byte-for-byte identical across all three folders. The names in those files are historical family data, so this README does not repeat them.

## Explore the family story and disk data

The [Vite](https://vite.dev/) site opens with an **interactive timeline above the DOS emulator**. Each stop explains one clue in everyday language, shows the source or data behind it, and walks through a few instructions one step at a time. The six smaller projects without trustworthy dates appear separately. Selecting a story or project chooses its program in the emulator below; the full decoded listing is also available there.

The separate **Browse the disk data** page (`data.html`) works without starting DOS. It collects all twelve month reminder files, the fourteen-row month table, the contact lists embedded in three calendar programs, readable notes and templates, batch-file text, and the quoted words in each of the fifteen decoded programs. It shows one copy where disk files have identical contents and gives the original path or source listing for each group. [`scripts/build_data.py`](scripts/build_data.py) regenerates its UTF-8 [`archive-data.json`](public/archive-data.json) from the recovered files and decoded listings; the originals are read only.

The disks list **“Suzy Kelley” on January 25** and **“Lisa Fox” on July 24**, but no birth years. The family supplied **Susan's birth year as 1957** and **Lisa's as 1961**. The timeline combines those years with the birthday dates on the disks to show their ages at dated stops. The site labels the sources separately because the files alone do not establish that “Suzy Kelley” and “Lisa Fox” are Susan and Lisa.

### What the dates establish

One recovered copy, [`sams-calendar-program-1/`](sams-calendar-program-1/), retains these filesystem **last-modified dates**. They are useful clues about *these copies*, not proof of when Sam first wrote a line or who edited it.

| Disk evidence | Date or year | What it supports |
| --- | --- | --- |
| [`JAN`](sams-calendar-program-1/JAN) and [`JUL`](sams-calendar-program-1/JUL) reminder files | March 30, 1988 | These saved copies of family reminders existed or were last changed by that date. |
| [`MONTHS.DAT`](sams-calendar-program-1/MONTHS.DAT) | June 8, 1989 | The saved month-name and day-count table was last changed then. |
| `J1=2` in [`CALEND89.BAS`](public/listings/calendar-89.txt) and [`CALEND91.BAS`](public/listings/calendar-91.txt) | Calendar year 1990 | The weekday anchor fits January 1, 1990. This is a year *inside the code*, not a file date. |
| [`B.BAT`](sams-calendar-program-1/B.BAT) and [`CLEAN.BAS`](sams-calendar-program-1/CLEAN.BAS) | September 24 and 27, 1993 | The starter batch file and screen-reset program have those saved dates. |
| [`CALEND98.BAS`](sams-calendar-program-1/CALEND98.BAS) | February 26, 1998 | This copy of the 1998 calendar was last changed then. |

Other copies in this Git checkout have newer import timestamps, so the site leaves the small projects undated. The accompanying [`README.DOC`](sams-calendar/README.DOC) says someone recovered and repaired files from an old floppy; it does not identify the author of that note or date every revision.

## Try the programs in a browser

The app provides decoded source listings and a [js-dos](https://js-dos.com/dos-api.html) window configured with the **original `GWBASIC.EXE`** and tokenized programs. It builds a separate `.jsdos` archive for each program from the disk files. No application server is needed after the static build; js-dos itself is loaded from its CDN, so the browser needs a connection for the emulator. The story and disk-data pages do not require the emulator to start.

With Node.js, pnpm, and Python 3 installed:

```sh
pnpm install
pnpm dev
```

Open the local address printed by Vite, follow the timeline, and click **Run this program** below it. Click inside the DOS window for keyboard input. At the GW-BASIC prompt, `LIST` displays the program, `RUN` starts it again, and `SYSTEM` exits. Open `/data.html` to read the recovered text without running DOS. For a deployable static site, run `pnpm build` and host the generated `dist/` folder on any static host. Opening `index.html` directly as a `file://` page will not work.

### GitHub Pages

The [Pages workflow](.github/workflows/pages.yml) builds and deploys this site from `main`, with a manual **Run workflow** option in GitHub Actions. Its build sets Vite's base path to `/sams-calendar-program/`, so assets and the data page load at [jakiestfu.github.io/sams-calendar-program/](https://jakiestfu.github.io/sams-calendar-program/). In the repository's **Settings → Pages**, set **Build and deployment → Source** to **GitHub Actions**. The workflow uploads `dist/`; it does not create or update a `gh-pages` branch.

The bundles are built by [`scripts/build_bundles.py`](scripts/build_bundles.py), which copies the existing interpreter, a program, and its needed data without modifying the originals. The calendar bundles set the emulated DOS date to a matching twentieth-century year because the programs assume such a date. Browser file changes, including entries made by `TELEFONE`, are temporary. Printer output and direct memory behavior may not work as they did on Sam's hardware. The app offers every distinct program to inspect or try, including unfinished drafts; “run” does not mean each one can complete its intended task.

## The calendar, in detail

The main calendar draws **the previous, selected, and following month** together. It fills an 18-row by 7-column array: six week rows for each of three months. A second array joins the seven day cells into printable rows. `MONTHS.DAT` supplies month names and lengths, with December before January and another January at the end so the three-month view can cross a year boundary. The files named `JAN` through `DEC` hold “important dates” that the printer routine reads for the chosen month.

The source combines its screen view with printer-specific commands. `LPRINT` sends calendars, important dates, and a hard-coded emergency/contact list to a DOS printer; escape sequences select printer modes. The most complete revisions have a menu for calculating a month or printing. The calendar's chosen month is entered as a number from 1 to 12; the code does not reliably validate that range.

The revisions are tied to particular years. `CALEND89.BAS` and `CALEND91.BAS` both use `J1=2`, the Monday anchor for January 1, **1990**, despite their filenames and some comments. Both `CALEND98.BAS` copies use `J1=5`, the Thursday anchor for January 1, **1998**. The year label comes from `1900 + VAL(RIGHT$(DATE$,2))`, so a modern DOS date would display a year in the 1900s. `CALEND91.BAS` sets February to 29 **before** loading `MONTHS.DAT`, which overwrites it with 28; in `CALEND89.BAS` and `CALEND98.BAS` that assignment occurs after loading, though their simple divisible-by-four rule does not handle century exceptions. The arrays used to assemble screen rows are not reset between selections, so running several months in one session may also produce stale output.

These are historical programs rather than current calendar software. The note in [`sams-calendar/README.DOC`](sams-calendar/README.DOC) says its writer had recovered material from an old floppy disk, repaired some of it, and expected trouble at the end of the millennium. It does not identify the writer; it is not enough to establish which files Sam wrote or exactly when each revision was made. An earlier version of this README reported a 1979–1993 date range. The preserved file dates listed above support specific dates from 1988 to 1998, but do not verify that earlier range.

## Program inventory

| Original file | What the decoded code does | State and dependencies |
| --- | --- | --- |
| [`CALEND89.BAS`](sams-calendar-program/CALEND89.BAS) | Three-month calendar with screen and printed views. | Uses `MONTHS.DAT` and `JAN`–`DEC`; 1990 weekday anchor. [Listing](public/listings/calendar-89.txt) |
| [`CALEND91.BAS`](sams-calendar-program/CALEND91.BAS) | Reworked three-month calendar with a two-choice menu. | Uses the same calendar data; its print menu item jumps to the end instead of printing. [Listing](public/listings/calendar-91.txt) |
| [`CALEND98.BAS` (Hemet)](sams-calendar-program-1/CALEND98.BAS) | Later calendar with a revised printed contact list. | Same 1998 calculation as the Kern copy. [Listing](public/listings/calendar-98-hemet.txt) |
| [`CALEND98.BAS` (Kern)](sams-calendar/CALEND98.BAS) | Later calendar with another printed contact list. | Same month data as the Hemet copy. [Listing](public/listings/calendar-98-kern.txt) |
| [`CALENDAR.111`](sams-calendar-program/CALENDAR.111) | An intermediate four-option calendar draft. | Incomplete: startup calls line 960 rather than the data-loading line 950, and the print option targets absent line 640. [Listing](public/listings/calendar-111.txt) |
| [`NEWCAL90.BAS`](sams-calendar-program/NEWCAL90.BAS) | A proposed menu for month, print, printer, and quit. | Menu handlers only print placeholder messages. [Listing](public/listings/newcal90.txt) |
| [`LOTTO.BAS`](sams-calendar-program/LOTTO.BAS) | Picks six random numbers from 1 through 49. | Does not remove duplicates; the screen tells the user to rerun if they occur. [Listing](public/listings/lotto.txt) |
| [`MATHTEST.BAS`](sams-calendar-program/MATHTEST.BAS) | Turns an entered number of cents into dollars, quarters, dimes, nickels, and pennies. | A compact exercise in integer division and `MOD`. [Listing](public/listings/mathtest.txt) |
| [`BILBOARD.BAS`](sams-calendar-program/BILBOARD.BAS) | Scrolls a sequence of family messages across the text screen. | Uses built-in `DATA` strings. [Listing](public/listings/billboard.txt) |
| [`BASEBALL.BAS`](sams-calendar-program/BASEBALL.BAS) | Displays a roster menu for entering players and sorting by batting or name. | Only placeholder handlers exist; its valid-input condition branches to a retry message. [Listing](public/listings/baseball.txt) |
| [`TELEFONE.BAS`](sams-calendar-program/TELEFONE.BAS) | Defines an address book with fixed 128-byte random-access records and an entry form. | Search and exit control flow are unfinished; `Telefone.dat` is created when run and is not present on the disks. [Listing](public/listings/telefone.txt) |
| [`PRNTSTYL.BAS`](sams-calendar-program/PRNTSTYL.BAS) | Sends a Citizen 180-D printer-mode chart through `LPRINT`. | No screen display. The comments say 128 styles, but eight binary switches generate 256 combinations. [Listing](public/listings/prntstyl.txt) |
| [`BAS_SEG.BAS`](sams-calendar-program/BAS_SEG.BAS) | Tests BASIC memory layout with `CLEAR`, `VARPTR`, and `PEEK`. | Hardware and interpreter-specific experiment. [Listing](public/listings/bas-seg.txt) |
| [`BSAVTEST.BAS`](sams-calendar-program/BSAVTEST.BAS) | Saves 16 bytes from segment `E000` using `BSAVE`. | Hardware and memory-specific experiment. [Listing](public/listings/bsavtest.txt) |
| [`CLEAN.BAS`](sams-calendar/CLEAN.BAS) | Sets colors, clears the screen, and issues `NEW`. | Identical on both 1998 disks; launched by `B.BAT`. [Listing](public/listings/clean.txt) |

## Other disk files

- [`MONTHS.DAT`](sams-calendar/MONTHS.DAT) contains 14 `month,days` pairs. The `JAN`–`DEC` files contain dated reminders and birthdays for the printout. Their line endings are DOS CRLF.
- [`sams-calendar/README.DOC`](sams-calendar/README.DOC) is the note addressed to Samuel. [`NAMES.DOC`](sams-calendar-program/NAMES.DOC) appears to be a formatted contact-record template with function-key labels, rather than a database of contacts.
- [`B.BAT`](sams-calendar/B.BAT) starts GW-BASIC with `CLEAN`. [`HEX.BAT`](sams-calendar-program/HEX.BAT) feeds the DOS `DEBUG` utility's hex arithmetic command and filters the result.
- [`LEGNOTES.DAT`](sams-calendar-program/LEGNOTES.DAT) contains a test promissory-note/amortization text. `COLOR.DAT`, `PRINT.DAT`, and `UPPERCAS.CMD` are binary support or experiment files whose format and relationship to the BASIC programs are not established here. `DEBUG.EXE` is a DOS executable and `GWBASIC.EXE` is the original interpreter.

The recovered executables and files have no stated reuse license in this repository. The browser app repackages the already-present `GWBASIC.EXE` into local bundles. The static build also includes family names and historical phone numbers on the data page; review both the binary's rights and those personal records before publishing the site publicly.

## Reading or running outside the browser

[PC-BASIC](https://github.com/robhagemans/pcbasic) can load the tokenized `.BAS` files directly and can convert them to text. From a disk folder, for example:

```sh
pcbasic --convert=A CALEND98.BAS CALEND98.txt
pcbasic CALEND98.BAS
```

The original `GWBASIC.EXE` requires a DOS environment. When using it, keep the calendar program in the same DOS directory as `MONTHS.DAT` and the month files. `CALENDAR.111` needs a `.BAS` filename to be loaded by name in some interpreters; the browser bundle copies it as `CAL111.BAS` without changing the repository original.

![A photograph of the recovered disks](https://i.imgur.com/DVpju4d.jpg)
