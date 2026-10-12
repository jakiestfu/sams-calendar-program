import programs from '../programs.json'
import { chapters, experiments } from './stories.js'
import './style.css'

const base = import.meta.env.BASE_URL
const programById = new Map(programs.map(program => [program.id, program]))
const app = document.querySelector('#app')

let chapterIndex = 2
let stepIndex = 0
let selectedProgram = programById.get(chapters[chapterIndex].programId)
let player = null
let listingRequest = 0

// Birth years were supplied by the family; birthday month/day comes from the disk reminders.
const birthYears = { susan: 1957, lisa: 1961 }

app.innerHTML = `
  <header class="site-header">
    <nav class="site-nav" aria-label="Main navigation">
      <span class="brand">Sam's floppy disks</span>
      <div><a class="current" href="${base}">The story</a><a href="${base}data.html">Browse the disk data</a></div>
    </nav>
    <div class="hero">
      <p class="eyebrow">A family tour</p>
      <h1>What Sam built<span class="cursor">_</span></h1>
      <p>He made a calendar for family dates, kept improving it, and tried many other ideas in BASIC. Follow the clues on the disks, look at a few lines of code, then try the originals below.</p>
    </div>
  </header>

  <main>
    <section class="timeline-section" aria-labelledby="timeline-title">
      <div class="section-head"><p class="eyebrow">01 / Follow the clues</p><h2 id="timeline-title">A timeline from the disks</h2></div>
      <p class="section-intro">Select a stop to see what a file shows. A saved file date tells us when that copy was last changed; a year inside a program tells us which calendar it was set up to show.</p>
      <div id="timeline" class="timeline" role="group" aria-label="Timeline stops"></div>
      <article class="story-card">
        <div class="story-meta"><span id="story-date-kind" class="date-kind"></span><span id="story-date"></span></div>
        <h3 id="story-title"></h3>
        <p id="story-intro" class="story-intro"></p>
        <details class="evidence"><summary>How do we know this date?</summary><p id="story-evidence"></p></details>

        <div class="ages">
          <div><p class="eyebrow">Susan and Lisa</p><h4>Their ages in this chapter</h4><p class="age-explain">The family supplied Susan’s birth year (1957) and Lisa’s (1961). The disk lists “Suzy Kelley” on January 25 and “Lisa Fox” on July 24; the ages below use those birthday dates.</p></div>
          <div class="age-results"><p id="susan-age"></p><p id="lisa-age"></p></div>
        </div>

        <div class="walkthrough">
          <div class="walkthrough-head"><div><p class="eyebrow">02 / Read a little code</p><h4>What he told the computer to do</h4></div><span id="step-count"></span></div>
          <div class="step"><h5 id="step-title"></h5><pre id="step-code"></pre><p id="step-plain"></p><span id="step-source" class="source-note"></span></div>
          <div class="step-controls"><button id="previous-step" class="text-button" type="button">← Previous</button><div id="step-dots" aria-label="Walkthrough steps"></div><button id="next-step" class="text-button" type="button">Next →</button></div>
        </div>
      </article>
    </section>

    <section class="experiments" aria-labelledby="experiments-title">
      <div class="section-head"><p class="eyebrow">Also on the disks</p><h2 id="experiments-title">Small ideas and experiments</h2></div>
      <p class="section-intro">These programs do not have reliable writing dates, so they sit outside the timeline. Select one to bring it to the emulator.</p>
      <div id="experiment-list" class="experiment-list"></div>
    </section>

    <section class="emulator-section" id="try-it" aria-labelledby="emulator-title">
      <div class="section-head"><p class="eyebrow">03 / Try the original</p><h2 id="emulator-title">Sam's program, running in DOS</h2></div>
      <p class="section-intro">This runs the recovered GW-BASIC files in a browser emulator. Programs and their old assumptions remain as they were on the disks.</p>
      <div class="emulator-card">
        <div class="emulator-top"><div><span id="program-type" class="program-type"></span><h3 id="program-title"></h3><p id="program-summary"></p></div><span id="program-path" class="program-path"></span></div>
        <p id="program-note" class="program-note"></p>
        <div class="actions"><button id="run" class="primary" type="button">Run this program</button><button id="stop" class="secondary" type="button" disabled>Stop</button><button id="listing" class="secondary" type="button">See full source</button></div>
        <p id="status" class="status" role="status">Choose Run this program to start.</p>
        <div id="dos" class="dos" aria-label="DOS emulator"></div>
        <div id="source-panel" class="source-panel" hidden><div class="source-heading"><h4>Full decoded BASIC listing</h4><a id="download-listing" download>Download text ↗</a></div><pre id="source"></pre></div>
        <p class="emulator-help">Click inside the DOS window to type. At the BASIC prompt, <code>LIST</code> shows the source, <code>RUN</code> starts it again, and <code>SYSTEM</code> exits. Printer output may not appear in the browser.</p>
        <details class="all-programs"><summary>Choose any of the 15 programs</summary><div id="program-list"></div></details>
      </div>
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
  el('step-dots').replaceChildren(...chapter.steps.map((_, index) => {
    const dot = document.createElement('button')
    dot.type = 'button'
    dot.className = index === stepIndex ? 'dot active' : 'dot'
    dot.setAttribute('aria-label', `Step ${index + 1}`)
    dot.setAttribute('aria-current', String(index === stepIndex))
    dot.addEventListener('click', () => { stepIndex = index; renderStep() })
    return dot
  }))
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
  selectProgram(chapter.programId)
}

async function stop() {
  if (player) {
    const previous = player
    player = null
    try { await previous.stop() } catch (error) { console.warn('Emulator stop failed', error) }
  }
  el('dos').replaceChildren()
  el('stop').disabled = true
}

async function selectProgram(id, scroll = false) {
  const program = programById.get(id)
  if (!program) return
  if (program.id !== selectedProgram?.id) await stop()
  selectedProgram = program
  el('program-type').textContent = program.type
  el('program-title').textContent = program.title
  el('program-summary').textContent = program.summary
  el('program-path').textContent = `${program.disk}/${program.file}`
  el('program-note').textContent = program.note
  el('status').textContent = 'Choose Run this program to start.'
  el('source-panel').hidden = true
  el('source').textContent = ''
  listingRequest++
  renderProgramList()
  if (scroll) el('try-it').scrollIntoView({ behavior: 'smooth' })
}

function renderProgramList() {
  el('program-list').replaceChildren(...programs.map(program => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = program.id === selectedProgram.id ? 'program-choice active' : 'program-choice'
    button.textContent = program.title
    button.addEventListener('click', () => selectProgram(program.id))
    return button
  }))
}

function renderExperiments() {
  el('experiment-list').replaceChildren(...experiments.map(experiment => {
    const article = document.createElement('article')
    article.className = 'experiment-card'
    const title = document.createElement('h3')
    title.textContent = experiment.title
    const description = document.createElement('p')
    description.textContent = experiment.text
    const code = document.createElement('code')
    code.textContent = experiment.code
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = 'Try this program →'
    button.addEventListener('click', () => selectProgram(experiment.programId, true))
    article.append(title, description, code, button)
    return article
  }))
}

el('previous-step').addEventListener('click', () => { if (stepIndex > 0) { stepIndex--; renderStep() } })
el('next-step').addEventListener('click', () => { if (stepIndex < chapters[chapterIndex].steps.length - 1) { stepIndex++; renderStep() } })

el('run').addEventListener('click', async () => {
  await stop()
  if (typeof window.Dos !== 'function') {
    el('status').textContent = 'The js-dos emulator could not load. Check your connection and reload.'
    return
  }
  el('status').textContent = 'Loading the original DOS files…'
  try {
    player = window.Dos(el('dos'), {
      url: `${base}bundles/${selectedProgram.id}.jsdos`,
      autoStart: true,
      backendLocked: true,
      theme: 'retro',
      fsChanges: { local: false },
      onEvent: event => {
        if (event === 'ci-ready') el('status').textContent = 'Running. Click the DOS window to use the keyboard.'
      },
    })
    el('stop').disabled = false
  } catch (error) {
    el('status').textContent = `Could not start the emulator: ${error.message}`
  }
})

el('stop').addEventListener('click', async () => { await stop(); el('status').textContent = 'Stopped. Run this program to start again.' })

el('listing').addEventListener('click', async () => {
  const panel = el('source-panel')
  if (!panel.hidden) { panel.hidden = true; return }
  panel.hidden = false
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

renderExperiments()
selectChapter(chapterIndex)
