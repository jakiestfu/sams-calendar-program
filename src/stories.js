// Dates describe evidence in one recovered disk copy, not confirmed authorship dates.
export const chapters = [
  {
    id: 'reminders',
    year: 1988,
    date: 'March 30, 1988',
    dateIso: '1988-03-30',
    dateKind: 'Saved file dates',
    title: 'Birthday and reminder files',
    short: 'Birthday and reminder files',
    intro: 'The oldest dated files in this copy contain birthdays and reminders. The later calendar program can read these month files and print their entries.',
    evidence: 'The JAN and JUL reminder files both carry March 30, 1988 modification dates in the preserved disk copy. A saved date can differ from the date a line was written.',
    programId: 'calendar-98-hemet',
    steps: [
      {
        title: 'Dates in the files',
        code: 'JAN 25  SUZY KELLEY.....BIRTHDAY\nJUL 24  LISA FOX........BIRTHDAY',
        plain: 'Each line is a reminder. These entries may refer to Susan and Lisa; the names on the disks are “Suzy Kelley” and “Lisa Fox.”',
        source: 'JAN and JUL data files'
      },
      {
        title: 'One file for each month',
        code: 'JAN   FEB   MAR   APR   MAY   JUN\nJUL   AUG   SEP   OCT   NOV   DEC',
        plain: 'The reminders are split into twelve tiny files, one for each month. That let the calendar find only the dates it needed.',
        source: 'Disk directory'
      },
      {
        title: 'The calendar could read them back',
        code: 'OPEN "I",1,LEFT$(N(MO),3)\nWHILE NOT EOF(1):INPUT #1,F:LPRINT F:WEND',
        plain: 'In the later 1998 program, printing a month opens its three-letter file and adds each reminder to the page.',
        source: 'CALEND98.BAS, lines 4480–4490'
      }
    ]
  },
  {
    id: 'month-data',
    year: 1989,
    date: 'June 8, 1989',
    dateIso: '1989-06-08',
    dateKind: 'Saved file date',
    title: 'Month names and day counts',
    short: 'Month data file',
    intro: 'A separate file lists month names and their day counts. The calendar reads that file to lay out its dates.',
    evidence: 'MONTHS.DAT in the preserved disk copy has a June 8, 1989 modification date. The date belongs to the file, not necessarily to the calendar program.',
    programId: 'calendar-89',
    steps: [
      {
        title: 'The month list',
        code: 'DECEMBER,31\nJANUARY,31\nFEBRUARY,28\nMARCH,31\n…\nJANUARY,31',
        plain: 'The file pairs each month with its length. Extra December and January entries help the three-month view cross into another year.',
        source: 'MONTHS.DAT'
      },
      {
        title: 'The program reads the list',
        code: 'OPEN "I",1,"MONTHS.DAT"\nFOR J=0 TO 13:INPUT #1,N(J),D(J):NEXT',
        plain: 'It opens the file and stores all fourteen name-and-day pairs in memory.',
        source: 'CALEND89.BAS, line 4430'
      },
      {
        title: 'Those numbers shape the calendar',
        code: 'IF J=D(K) THEN ... K=K+1:J=0',
        plain: 'When the day count reaches the length of a month, the program starts counting days for the next month.',
        source: 'CALEND89.BAS, line 235'
      }
    ]
  },
  {
    id: 'three-months',
    year: 1990,
    date: '1990',
    dateKind: 'Year in the program',
    title: 'Three months on one screen',
    short: 'Three-month layout',
    intro: 'The calendar versions named CALEND89 and CALEND91 both use the weekday layout for January 1990. Their filenames do not tell us when they were written.',
    evidence: 'Both files set J1=2, a Monday start for January 1, 1990. This is a configured calendar year, not a verified edit date.',
    programId: 'calendar-89',
    steps: [
      {
        title: 'Make room for three months',
        code: 'DIM M(18,7)\nDIM Z(18,7)',
        plain: 'Eighteen rows hold six weeks for each of three months. Seven columns stand for the days of the week.',
        source: 'CALEND89.BAS, line 30'
      },
      {
        title: 'Choose a month',
        code: 'LINE INPUT N\nMO=VAL(N):K=MO-1',
        plain: 'A person types a month number. The program then works out the month before it and the month after it.',
        source: 'CALEND89.BAS, lines 150–151'
      },
      {
        title: 'Place every day in a grid',
        code: 'FOR B=1 TO 18\n  FOR C=1 TO 7\n    M(B,C)=J\n  NEXT C\nNEXT B',
        plain: 'Nested loops walk across days and down weeks, placing each numbered day into the right square.',
        source: 'CALEND89.BAS, lines 210–260, shortened'
      },
      {
        title: 'Show the finished view',
        code: 'PRINT N(K)+Z1 ... N(K+2)+Z3\nPRINT N(K+1)+Z2',
        plain: 'It labels the previous and next months around the selected month, then prints the prepared rows on screen.',
        source: 'CALEND89.BAS, lines 4030–4060, shortened'
      }
    ]
  },
  {
    id: 'clean-screen',
    year: 1993,
    date: 'September 27, 1993',
    dateIso: '1993-09-27',
    dateKind: 'Saved file date',
    title: 'GW-BASIC setup utility',
    short: 'Four-line setup utility',
    intro: 'This four-line program hides function-key labels, sets screen colors, clears the screen, and resets GW-BASIC for a new session.',
    evidence: 'CLEAN.BAS carries a September 27, 1993 modification date in the preserved disk copy. B.BAT, which starts it, is dated September 24, 1993.',
    programId: 'clean',
    steps: [
      {
        title: 'Hide the function-key labels',
        code: '10 KEY OFF',
        plain: 'The row of shortcut labels disappears, leaving more room for the program.',
        source: 'CLEAN.BAS, line 10'
      },
      {
        title: 'Set the colors and clear the screen',
        code: '20 COLOR 15,1\n30 CLS',
        plain: 'It sets the text and background colors, then clears the screen.',
        source: 'CLEAN.BAS, lines 20–30'
      },
      {
        title: 'Start with empty memory',
        code: '40 NEW',
        plain: 'GW-BASIC forgets the little setup program and waits for whatever he wanted to work on next.',
        source: 'CLEAN.BAS, line 40'
      }
    ]
  },
  {
    id: 'calendar-1998',
    year: 1998,
    date: 'February 26, 1998',
    dateIso: '1998-02-26',
    dateKind: 'Saved file date',
    title: '1998 calendar revision',
    short: '1998 calendar revision',
    intro: 'This copy sets the calendar for 1998 and prints local contact numbers. Two versions have the same calendar logic but different contact lists.',
    evidence: 'The CALEND98.BAS file in sams-calendar-program-1 has a February 26, 1998 modification date. The other copy has the same calendar logic but different printed contacts.',
    programId: 'calendar-98-hemet',
    steps: [
      {
        title: 'Adjust the starting weekday',
        code: 'J1=5',
        plain: 'The first day of 1998 was a Thursday. This one number shifts the whole year into place.',
        source: 'CALEND98.BAS, line 120'
      },
      {
        title: 'Keep the screen and paper views',
        code: 'PRINT ...\nLPRINT ...',
        plain: 'PRINT draws on the screen. LPRINT sends a version to the printer, so the calendar could be kept on paper.',
        source: 'CALEND98.BAS, screen and print routines'
      },
      {
        title: 'Add useful numbers to the printout',
        code: 'LPRINT "Emergency..."\nLPRINT "Fire Department..."',
        plain: 'The paper copy included local contact numbers as well as the calendar. Those old numbers should be treated as historical.',
        source: 'CALEND98.BAS, lines 4140–4210, shortened'
      }
    ]
  }
]
