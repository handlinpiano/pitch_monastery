import './style.css'
import * as Tone from 'tone'
import { WebMidi } from 'webmidi'

// App state
const state = {
  audioStarted: false,
  midiEnabled: false,
  synth: null,
  midiInputs: [],
  midiOutputs: [],
  deferredPrompt: null
}

// Initialize synth
function initSynth() {
  state.synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: {
      attack: 0.02,
      decay: 0.1,
      sustain: 0.3,
      release: 0.8
    }
  }).toDestination()
}

// Start audio context (requires user interaction)
async function startAudio() {
  await Tone.start()
  state.audioStarted = true
  initSynth()
  updateUI()
}

// Initialize MIDI
async function initMidi() {
  try {
    await WebMidi.enable()
    state.midiEnabled = true
    state.midiInputs = WebMidi.inputs
    state.midiOutputs = WebMidi.outputs

    // Listen for MIDI input
    WebMidi.inputs.forEach(input => {
      input.addListener('noteon', e => {
        if (state.synth) {
          const note = Tone.Frequency(e.note.number, 'midi').toNote()
          state.synth.triggerAttack(note, Tone.now(), e.velocity)
          highlightKey(e.note.number, true)
        }
      })

      input.addListener('noteoff', e => {
        if (state.synth) {
          const note = Tone.Frequency(e.note.number, 'midi').toNote()
          state.synth.triggerRelease(note)
          highlightKey(e.note.number, false)
        }
      })
    })

    updateUI()
  } catch (err) {
    console.warn('MIDI not available:', err)
  }
}

// Play a note
function playNote(note) {
  if (!state.synth) return
  state.synth.triggerAttackRelease(note, '8n')
}

// Highlight keyboard key
function highlightKey(midiNote, active) {
  const key = document.querySelector(`[data-midi="${midiNote}"]`)
  if (key) {
    key.classList.toggle('active', active)
  }
}

// Generate keyboard HTML
function generateKeyboard(startNote = 48, numKeys = 25) {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  let html = ''

  for (let i = 0; i < numKeys; i++) {
    const midiNote = startNote + i
    const noteIndex = midiNote % 12
    const octave = Math.floor(midiNote / 12) - 1
    const noteName = notes[noteIndex]
    const isBlack = noteName.includes('#')
    const fullNote = `${noteName.replace('#', '')}${octave}`

    html += `<button
      class="key ${isBlack ? 'black' : 'white'}"
      data-note="${noteName}${octave}"
      data-midi="${midiNote}"
    ></button>`
  }

  return html
}

// Update UI based on state
function updateUI() {
  const app = document.getElementById('app')

  app.innerHTML = `
    <header class="header">
      <h1>Pitch Monastery</h1>
    </header>

    <main class="main">
      <div class="status">
        <div class="status-indicator">
          <span class="status-dot ${state.audioStarted ? 'connected' : ''}"></span>
          <span>Audio: ${state.audioStarted ? 'Ready' : 'Click to start'}</span>
        </div>
        <div class="status-indicator">
          <span class="status-dot ${state.midiEnabled ? 'connected' : ''}"></span>
          <span>MIDI: ${state.midiEnabled ? `${state.midiInputs.length} device(s)` : 'Not connected'}</span>
        </div>
      </div>

      ${!state.audioStarted ? `
        <div class="controls">
          <button id="startAudio" class="primary">Start Audio</button>
        </div>
      ` : `
        <div class="keyboard">
          ${generateKeyboard(48, 25)}
        </div>
      `}

      ${state.midiEnabled && state.midiInputs.length > 0 ? `
        <div class="midi-devices">
          <h3>MIDI Inputs</h3>
          <div class="device-list">
            ${state.midiInputs.map(d => `
              <div class="device">
                <span>${d.name}</span>
                <span class="device-type">Input</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </main>
  `

  // Attach event listeners
  const startBtn = document.getElementById('startAudio')
  if (startBtn) {
    startBtn.addEventListener('click', async () => {
      await startAudio()
      await initMidi()
    })
  }

  // Keyboard event listeners
  document.querySelectorAll('.key').forEach(key => {
    const note = key.dataset.note

    key.addEventListener('mousedown', () => {
      if (state.synth) {
        state.synth.triggerAttack(note)
        key.classList.add('active')
      }
    })

    key.addEventListener('mouseup', () => {
      if (state.synth) {
        state.synth.triggerRelease(note)
        key.classList.remove('active')
      }
    })

    key.addEventListener('mouseleave', () => {
      if (state.synth) {
        state.synth.triggerRelease(note)
        key.classList.remove('active')
      }
    })

    // Touch events for mobile
    key.addEventListener('touchstart', (e) => {
      e.preventDefault()
      if (state.synth) {
        state.synth.triggerAttack(note)
        key.classList.add('active')
      }
    })

    key.addEventListener('touchend', (e) => {
      e.preventDefault()
      if (state.synth) {
        state.synth.triggerRelease(note)
        key.classList.remove('active')
      }
    })
  })
}

// PWA Install prompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  state.deferredPrompt = e
  showInstallPrompt()
})

function showInstallPrompt() {
  if (!state.deferredPrompt) return

  const existing = document.querySelector('.install-prompt')
  if (existing) return

  const prompt = document.createElement('div')
  prompt.className = 'install-prompt'
  prompt.innerHTML = `
    <p>Install Pitch Monastery for offline use</p>
    <button id="installBtn">Install</button>
  `
  document.body.appendChild(prompt)

  document.getElementById('installBtn').addEventListener('click', async () => {
    state.deferredPrompt.prompt()
    const { outcome } = await state.deferredPrompt.userChoice
    if (outcome === 'accepted') {
      prompt.remove()
    }
    state.deferredPrompt = null
  })
}

// Initialize app
updateUI()
