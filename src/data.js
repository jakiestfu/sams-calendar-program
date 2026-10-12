import './style.css'
import './data.css'

const base = import.meta.env.BASE_URL
const app = document.querySelector('#app')

app.innerHTML = `
  <header class="site-header">
    <nav class="site-nav" aria-label="Main navigation"><span class="brand">Sam's floppy disks</span><div><a href="${base}">Programs</a><a class="current" href="${base}data.html">Disk data</a></div></nav>
    <div class="hero data-hero"><p class="eyebrow">The readable records</p><h1>Inside the disks<span class="cursor">_</span></h1><p>Birthdays, month tables, old contact lists, notes, and the words written into the programs. You can read all of this without starting the emulator.</p></div>
  </header>
  <main class="data-main">
    <div class="data-intro"><p>These are text copies of the recovered files. Repeated files from the three disk folders are shown once when their contents match. Original spelling is preserved; old phone numbers are historical records.</p><p><strong>About Susan and Lisa:</strong> the family supplied their birth years, 1957 and 1961. The reminder files say “Suzy Kelley — January 25” and “Lisa Fox — July 24.” The birth years do not appear in the disk files.</p></div>
    <nav class="data-toc" aria-label="Data sections"><a href="#calendar-data">Calendar reminders</a><a href="#month-table">Month data</a><a href="#contacts">Printed contacts</a><a href="#documents">Notes and forms</a><a href="#program-words">Words in programs</a></nav>
    <section id="calendar-data" aria-labelledby="reminders-title"><div class="section-head"><p class="eyebrow">Calendar data</p><h2 id="reminders-title">Birthdays and reminders</h2></div><p class="section-intro">The calendar reads one file for each month when it prints “important dates.” These are all the recovered reminder lines.</p><div id="reminders" class="month-grid"></div></section>
    <section id="month-table" aria-labelledby="month-table-title"><div class="section-head"><p class="eyebrow">Calendar data</p><h2 id="month-table-title">How many days in each month?</h2></div><p class="section-intro">The calendar reads this little table. December appears at the beginning and January at the end to help show the months next to a selected month.</p><div id="months" class="table-card"></div></section>
    <section id="contacts" aria-labelledby="contacts-title"><div class="section-head"><p class="eyebrow">Inside the calendar programs</p><h2 id="contacts-title">Printed contact lists</h2></div><p class="section-intro">These numbers were written into BASIC code for paper printouts. The two 1998 copies show different local lists. They are not current contact information.</p><div id="contact-lists" class="contact-grid"></div></section>
    <section id="documents" aria-labelledby="documents-title"><div class="section-head"><p class="eyebrow">Other readable files</p><h2 id="documents-title">Notes, forms, and little tools</h2></div><p class="section-intro">The address-book material includes a blank screen template, but no saved telephone database was found. The letter addressed to Samuel was on one calendar disk. The promissory-note text explicitly calls itself a test.</p><div id="documents-list" class="document-grid"></div></section>
    <section id="program-words" aria-labelledby="program-words-title"><div class="section-head"><p class="eyebrow">Inside the code</p><h2 id="program-words-title">Words written into each program</h2></div><p class="section-intro">These are the quoted text strings found in every decoded BASIC listing: menus, messages, filenames, and printed words. Open a program to browse them, or read the full source listing.</p><div id="program-text" class="program-text"></div></section>
  </main>
  <footer><a href="${base}">← Back to programs</a><span>The original disk files remain unchanged.</span></footer>
`

const make = (tag, className, text) => {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

function renderReminders(data) {
  document.getElementById('reminders').replaceChildren(...data.map(month => {
    const card = make('article', 'month-card')
    card.append(make('h3', '', month.month), make('small', 'file-path', month.path))
    const list = make('ul')
    for (const line of month.lines) list.append(make('li', '', line))
    card.append(list)
    return card
  }))
}

function renderMonths(data) {
  const table = make('table')
  const header = make('thead')
  const headerRow = make('tr')
  headerRow.append(make('th', '', 'Order in file'), make('th', '', 'Month'), make('th', '', 'Days'))
  header.append(headerRow)
  const body = make('tbody')
  data.rows.forEach((row, index) => {
    const tr = make('tr')
    tr.append(make('td', '', String(index + 1)), make('td', '', row.name), make('td', '', String(row.days)))
    body.append(tr)
  })
  table.append(header, body)
  document.getElementById('months').append(make('p', 'file-path', data.path), table)
}

function renderContacts(data) {
  document.getElementById('contact-lists').replaceChildren(...data.map(group => {
    const card = make('article', 'contact-card')
    card.append(make('h3', '', group.title))
    const list = make('ul')
    for (const line of group.lines) list.append(make('li', '', line))
    card.append(list)
    const source = make('a', 'source-link', 'Read its BASIC listing →')
    source.href = `${base}listings/${group.programId}.txt`
    card.append(source)
    return card
  }))
}

function renderDocuments(data) {
  document.getElementById('documents-list').replaceChildren(...data.map(document => {
    const card = make('article', 'document-card')
    card.append(make('h3', '', document.title), make('small', 'file-path', document.path), make('pre', '', document.text))
    return card
  }))
}

function renderProgramText(data) {
  document.getElementById('program-text').replaceChildren(...data.map(program => {
    const details = make('details', 'program-record')
    const summary = make('summary')
    summary.append(make('strong', '', program.title), make('span', '', `${program.strings.length} text pieces`))
    details.append(summary, make('p', 'file-path', program.path))
    const list = make('ul')
    program.strings.forEach(string => {
      const row = make('li')
      row.append(make('span', 'line-number', `Line ${string.line}`), make('span', '', string.text))
      list.append(row)
    })
    details.append(list)
    const source = make('a', 'source-link', 'Read the full decoded program →')
    source.href = `${base}listings/${program.programId}.txt`
    details.append(source)
    return details
  }))
}

fetch(`${base}archive-data.json`)
  .then(response => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json() })
  .then(data => {
    renderReminders(data.reminders)
    renderMonths(data.monthData)
    renderContacts(data.contacts)
    renderDocuments(data.documents)
    renderProgramText(data.programText)
  })
  .catch(error => {
    const message = make('p', 'data-error', `The disk data could not be loaded: ${error.message}`)
    document.querySelector('.data-intro').append(message)
  })
