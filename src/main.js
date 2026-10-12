import programs from '../programs.json'
import { chapters } from './stories.js'
import './style.css'

const base = import.meta.env.BASE_URL
const programById = new Map(programs.map(program => [program.id, program]))
const app = document.querySelector('#app')

let chapterIndex = 2
let stepIndex = 0
let selectedProgram = programs[0]
let player = null
let listingRequest = 0
let runRequest = 0

// Birth years were supplied by the family; birthday month/day comes from the disk reminders.
const birthYears = { susan: 1957, lisa: 1961 }

app.innerHTML = `
  <header class="site-header">
    <nav class="site-nav" aria-label="Main navigation">
      <span class="brand">Sam's floppy disks</span>
      <div><a class="current" href="${base}">The story</a><a href="${base}data.html">Browse the disk data</a></div>
    </nav>
    <div class="hero home-hero">
      <div><p class="eyebrow">Sam's BASIC archive</p><h1>Pick a program<span class="cursor">_</span></h1></div>
      <p>Click a name to run it beside the list. The family story is below.</p>
    </div>
  </header>

  <main>
    <section class="launcher-section" id="try-it" aria-labelledby="launcher-title">
      <h2 id="launcher-title" class="sr-only">Run Sam's programs</h2>
      <div class="workbench">
        <nav class="program-browser" aria-label="Programs on the disks"><div id="program-list"></div></nav>
        <div class="emulator-card" id="player">
          <div class="emulator-top"><div><span id="program-type" class="program-type"></span><h3 id="program-title"></h3><p id="program-summary"></p></div></div>
          <p id="program-note" class="program-note"></p>
          <div class="actions"><button id="run" class="secondary" type="button" hidden>Restart</button><button id="stop" class="secondary" type="button" hidden>Stop</button><button id="listing" class="secondary" type="button" aria-expanded="false">Read source</button></div>
          <p id="status" class="status" role="status"></p>
          <div id="dos" class="dos" aria-label="DOS emulator"></div>
          <p class="emulator-help">Click the DOS window to type. At the BASIC prompt: <code>LIST</code> shows code, <code>RUN</code> starts again, <code>SYSTEM</code> exits.</p>
          <div id="source-panel" class="source-panel" hidden><div class="source-heading"><div><h4>Full BASIC listing</h4><span id="program-path" class="program-path"></span></div><a id="download-listing" download>Download text ↗</a></div><pre id="source"></pre></div>
        </div>
      </div>
    </section>

    <section class="timeline-section" aria-labelledby="timeline-title">
      <div class="section-head"><p class="eyebrow">The story behind it</p><h2 id="timeline-title">How it came together</h2></div>
      <p class="section-intro">The dates below are clues from saved files or years in the code, not a complete account of when Sam wrote each program.</p>
      <div id="timeline" class="timeline" role="group" aria-label="Timeline stops"></div>
      <article class="story-card">
        <div class="story-meta"><span id="story-date-kind" class="date-kind"></span><span id="story-date"></span></div>
        <h3 id="story-title"></h3>
        <p id="story-intro" class="story-intro"></p>
        <div class="story-actions"><div class="age-results"><span id="susan-age"></span><span id="lisa-age"></span></div><button id="run-chapter" class="story-run" type="button">Run the related program ↑</button></div>
        <details class="evidence"><summary>Where does this date come from?</summary><p id="story-evidence"></p><p>Birth years came from family; January 25 and July 24 are birthday entries on the disks. The age calculation uses those entries for Susan and Lisa.</p></details>
        <div class="walkthrough">
          <div class="walkthrough-head"><h4>A few lines of code, explained</h4><span id="step-count"></span></div>
          <div class="step"><div><h5 id="step-title"></h5><p id="step-plain"></p><span id="step-source" class="source-note"></span></div><pre id="step-code"></pre></div>
          <div class="step-controls"><button id="previous-step" class="text-button" type="button">← Previous</button><button id="next-step" class="text-button" type="button">Next →</button></div>
        </div>
      </article>
    </section>
  </main>
  <footer><a href="${base}data.html">Browse every readable disk record →</a><span>The original files remain unchanged.</span></footer>
`

const el = id => document.getElementById(id)

function ageText(name, birthdayMonth, birthdayDay) {
  const chapter = chapters[chapterIndex]
  const birthYear = birthYears[name.toLowerCase()]
  if (!chapter.dateIso) return `${name}: turned ${chapter.year - birthYear} in ${chapter.year}`
  const [, month, day] = chapter.dateIso.split('-').map(Number)
  const age = chapter.year - birthYear - (month < birthdayMonth || (month === birthdayMonth && day < birthdayDay) ? 1 : 0)
  return `${name}: ${age} on this file's saved date`
}

function renderAges() {
  el('susan-age').textContent = ageText('Susan', 1, 25)
  el('lisa-age').textContent = ageText('Lisa', 7, 24)
}

function renderTimeline() {
  el('timeline').replaceChildren(...chapters.map((chapter, index) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = index === chapterIndex ? 'timeline-stop active' : 'timeline-stop'
    button.setAttribute('aria-pressed', String(index === chapterIndex))
    const year = document.createElement('strong')
    year.textContent = chapter.year
    const title = document.createElement('span')
    title.textContent = chapter.short
    const kind = document.createElement('small')
    kind.textContent = chapter.dateKind
    button.append(year, title, kind)
    button.addEventListener('click', () => selectChapter(index))
    return button
  }))
}

function renderStep() {
  const chapter = chapters[chapterIndex]
  const step = chapter.steps[stepIndex]
  el('step-count').textContent = `${stepIndex + 1} of ${chapter.steps.length}`
  el('step-title').textContent = step.title
  el('step-code').textContent = step.code
  el('step-plain').textContent = step.plain
  el('step-source').textContent = step.source
  el('previous-step').disabled = stepIndex === 0
  el('next-step').disabled = stepIndex === chapter.steps.length - 1
}

function selectChapter(index) {
  chapterIndex = index
  stepIndex = 0
  const chapter = chapters[index]
  el('story-date-kind').textContent = chapter.dateKind
  el('story-date').textContent = chapter.date
  el('story-title').textContent = chapter.title
  el('story-intro').textContent = chapter.intro
  el('story-evidence').textContent = chapter.evidence
  renderTimeline()
  renderAges()
  renderStep()
}

async function stopPlayer() {
  if (player) {
    const previous = player
    player = null
    try { await previous.stop() } catch (error) { console.warn('Emulator stop failed', error) }
  }
  el('dos').replaceChildren()
  el('stop').disabled = true
  el('stop').hidden = true
}

function renderSelectedProgram() {
  el('program-type').textContent = selectedProgram.type
  el('program-title').textContent = selectedProgram.title
  el('program-summary').textContent = selectedProgram.summary
  el('program-path').textContent = `${selectedProgram.disk}/${selectedProgram.file}`
  el('program-note').textContent = selectedProgram.note
  el('source-panel').hidden = true
  el('listing').setAttribute('aria-expanded', 'false')
  el('listing').textContent = 'Read source'
  el('source').textContent = ''
  listingRequest++
  updateProgramList()
}

function updateProgramList() {
  for (const button of el('program-list').querySelectorAll('button')) {
    const active = button.dataset.programId === selectedProgram.id
    button.classList.toggle('active', active)
    if (active) button.setAttribute('aria-current', 'true')
    else button.removeAttribute('aria-current')
  }
}

function renderProgramList() {
  const makeGroup = (label, items) => {
    const group = document.createElement('div')
    group.className = 'program-group'
    const heading = document.createElement('h3')
    heading.textContent = label
    group.append(heading, ...items.map(program => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'program-choice'
    button.dataset.programId = program.id
    button.setAttribute('aria-label', `Run ${program.title}`)
    const title = document.createElement('span')
    title.textContent = program.title
    const arrow = document.createElement('span')
    arrow.className = 'play-arrow'
    arrow.setAttribute('aria-hidden', 'true')
    arrow.textContent = 'Run ›'
    button.append(title, arrow)
    button.addEventListener('click', () => runProgram(program.id, true))
    return button
    }))
    return group
  }
  el('program-list').replaceChildren(
    makeGroup('Calendars', programs.filter(program => program.type.startsWith('Calendar'))),
    makeGroup('Other programs', programs.filter(program => !program.type.startsWith('Calendar')))
  )
}

function showPlayer() {
  const top = el('player').getBoundingClientRect().top
  if (top < 0 || top > window.innerHeight - 180) {
    el('player').scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

el('previous-step').addEventListener('click', () => { if (stepIndex > 0) { stepIndex--; renderStep() } })
el('next-step').addEventListener('click', () => { if (stepIndex < chapters[chapterIndex].steps.length - 1) { stepIndex++; renderStep() } })
el('run-chapter').addEventListener('click', () => runProgram(chapters[chapterIndex].programId, true))

async function runProgram(id, jump = false) {
  const program = programById.get(id)
  if (!program) return
  const request = ++runRequest
  el('run').hidden = true
  el('run').disabled = true
  await stopPlayer()
  if (request !== runRequest) return
  selectedProgram = program
  renderSelectedProgram()
  if (jump) showPlayer()
  if (typeof window.Dos !== 'function') {
    el('status').textContent = 'The js-dos emulator could not load. Check your connection and reload.'
    el('run').textContent = 'Try again'
    el('run').hidden = false
    el('run').disabled = false
    return
  }
  el('status').textContent = `Loading ${program.title}…`
  try {
    player = window.Dos(el('dos'), {
      url: `${base}bundles/${program.id}.jsdos`,
      autoStart: true,
      backendLocked: true,
      theme: 'retro',
      fsChanges: { local: false },
      onEvent: event => {
        if (request === runRequest && event === 'ci-ready') el('status').textContent = 'Running. Click the DOS window to type.'
      },
    })
    el('stop').disabled = false
    el('stop').hidden = false
    el('run').textContent = 'Restart'
  } catch (error) {
    el('status').textContent = `Could not start the emulator: ${error.message}`
    el('run').textContent = 'Try again'
  } finally {
    el('run').hidden = false
    el('run').disabled = false
  }
}

el('run').addEventListener('click', () => runProgram(selectedProgram.id))

el('stop').addEventListener('click', async () => {
  ++runRequest
  await stopPlayer()
  el('status').textContent = 'Stopped. Choose a program or run this one again.'
})

el('listing').addEventListener('click', async () => {
  const panel = el('source-panel')
  if (!panel.hidden) { panel.hidden = true; el('listing').setAttribute('aria-expanded', 'false'); el('listing').textContent = 'Read source'; return }
  panel.hidden = false
  el('listing').setAttribute('aria-expanded', 'true')
  el('listing').textContent = 'Hide source'
  el('source').textContent = 'Loading source…'
  const request = ++listingRequest
  const url = `${base}listings/${selectedProgram.id}.txt`
  el('download-listing').href = url
  el('download-listing').download = `${selectedProgram.id}.txt`
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const source = await response.text()
    if (request === listingRequest) el('source').textContent = source
  } catch (error) {
    if (request === listingRequest) el('source').textContent = `Could not load source: ${error.message}`
  }
})

renderProgramList()
renderSelectedProgram()
selectChapter(chapterIndex)
