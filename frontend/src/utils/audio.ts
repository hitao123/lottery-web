/**
 * Audio manager using Web Audio API.
 * Synthesizes all sounds programmatically — no external files needed.
 * Uses a warmer wedding-stage loop while spinning and a bright reveal sting.
 */

let audioCtx: AudioContext | null = null
let masterGain: GainNode | null = null
type BackgroundMode = 'off' | 'idle' | 'spinning'

let backgroundMode: BackgroundMode = 'off'
let noteTimer: ReturnType<typeof setTimeout> | null = null
let kickTimer: ReturnType<typeof setTimeout> | null = null
const DEFAULT_MASTER_VOLUME = 1
const VOLUME_STORAGE_KEY = 'lottery-master-volume'

function clampVolume(value: number) {
  return Math.min(1, Math.max(0, value))
}

function loadStoredVolume() {
  if (typeof window === 'undefined') return DEFAULT_MASTER_VOLUME
  const raw = window.localStorage.getItem(VOLUME_STORAGE_KEY)
  if (!raw) return DEFAULT_MASTER_VOLUME
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? clampVolume(parsed) : DEFAULT_MASTER_VOLUME
}

let masterVolume = loadStoredVolume()

function getCtx() {
  if (!audioCtx) {
    audioCtx = new AudioContext()
    masterGain = audioCtx.createGain()
    masterGain.gain.value = masterVolume
    masterGain.connect(audioCtx.destination)
  }
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume()
  }
  return { ctx: audioCtx, master: masterGain! }
}

function ensureAudioReady() {
  const { ctx } = getCtx()
  if (ctx.state === 'suspended') {
    void ctx.resume()
  }
}

export function getMasterVolume() {
  return masterVolume
}

export function setMasterVolume(nextVolume: number) {
  masterVolume = clampVolume(nextVolume)

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(VOLUME_STORAGE_KEY, String(masterVolume))
  }

  if (masterGain && audioCtx) {
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime)
    masterGain.gain.setTargetAtTime(masterVolume, audioCtx.currentTime, 0.08)
  }
}

// ─── Background Music ────────────────────────────────────────────────

const IDLE_CHORDS = [
  [261.63, 329.63, 392.0],
  [293.66, 369.99, 440.0],
  [329.63, 415.3, 493.88],
  [261.63, 349.23, 392.0],
]

const SPINNING_CHORDS = [
  [261.63, 329.63, 392.0],
  [293.66, 369.99, 440.0],
  [220.0, 261.63, 329.63],
  [196.0, 246.94, 392.0],
]

let arpeggioIndex = 0
function clearBackgroundTimers() {
  if (noteTimer) {
    clearTimeout(noteTimer)
    noteTimer = null
  }
  if (kickTimer) {
    clearTimeout(kickTimer)
    kickTimer = null
  }
}

function runBackgroundLoop(mode: Exclude<BackgroundMode, 'off'>) {
  const { ctx, master } = getCtx()
  arpeggioIndex = 0
  let noteSpeed = mode === 'idle' ? 940 : 360

  function playNote() {
    if (backgroundMode !== mode) return

    const chord = (mode === 'idle' ? IDLE_CHORDS : SPINNING_CHORDS)[arpeggioIndex % 4]
    arpeggioIndex++

    chord.forEach((freq, index) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = mode === 'idle' ? (index === 0 ? 'triangle' : 'sine') : index === 0 ? 'sine' : 'triangle'
      osc.frequency.value = index === 0 ? freq * 0.5 : freq
      const peakGain =
        mode === 'idle'
          ? index === 0
            ? 0.34
            : 0.2
          : index === 0
            ? 0.4
            : 0.25
      const noteDuration = mode === 'idle' ? (index === 0 ? 0.52 : 0.74) : index === 0 ? 0.34 : 0.5
      gain.gain.setValueAtTime(peakGain, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + noteDuration)
      osc.connect(gain)
      gain.connect(master)
      osc.start(ctx.currentTime + index * (mode === 'idle' ? 0.06 : 0.02))
      osc.stop(ctx.currentTime + noteDuration + 0.04)
    })

    if (mode === 'idle') {
      const sparkle = ctx.createOscillator()
      const sparkleGain = ctx.createGain()
      sparkle.type = 'sine'
      sparkle.frequency.value = 1318.5 + (arpeggioIndex % 3) * 160
      sparkleGain.gain.setValueAtTime(0.08, ctx.currentTime + 0.18)
      sparkleGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.42)
      sparkle.connect(sparkleGain)
      sparkleGain.connect(master)
      sparkle.start(ctx.currentTime + 0.18)
      sparkle.stop(ctx.currentTime + 0.48)
    }
  }

  function scheduleNotes() {
    if (backgroundMode !== mode) return
    playNote()

    if (mode === 'spinning' && noteSpeed > 280) {
      noteSpeed -= 6
    }

    noteTimer = setTimeout(scheduleNotes, noteSpeed)
  }

  const kickLoop = () => {
    if (backgroundMode !== mode) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(mode === 'idle' ? 120 : 96, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(mode === 'idle' ? 60 : 44, ctx.currentTime + 0.12)
    gain.gain.setValueAtTime(mode === 'idle' ? 0.28 : 0.34, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (mode === 'idle' ? 0.22 : 0.18))
    osc.connect(gain)
    gain.connect(master)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + (mode === 'idle' ? 0.24 : 0.2))
    kickTimer = setTimeout(kickLoop, mode === 'idle' ? 1880 : 1120)
  }

  scheduleNotes()
  kickLoop()
}

function setBackgroundMode(nextMode: BackgroundMode) {
  ensureAudioReady()

  if (backgroundMode === nextMode) {
    if (nextMode !== 'off' && !noteTimer && !kickTimer) {
      runBackgroundLoop(nextMode)
    }
    return
  }

  backgroundMode = nextMode
  clearBackgroundTimers()

  if (nextMode !== 'off') {
    runBackgroundLoop(nextMode)
  }
}

export function startIdleMusic() {
  setBackgroundMode('idle')
}

export function startBackgroundMusic() {
  setBackgroundMode('spinning')
}

export function stopBackgroundMusic() {
  setBackgroundMode('off')
}

// ─── Chasing Sound (rising tension) ──────────────────────────────────

export function playChasingSound() {
  const { ctx, master } = getCtx()

  // Rising whoosh
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(200, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 2)
  gain.gain.setValueAtTime(0.14, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 1.5)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3)
  osc.connect(gain)
  gain.connect(master)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 3.5)

  // Ticking sound that speeds up
  let tickDelay = 200
  let tickCount = 0
  const maxTicks = 18
  const tick = () => {
    if (tickCount >= maxTicks) return
    tickCount++
    const t = ctx.createOscillator()
    const g = ctx.createGain()
    t.type = 'sine'
    t.frequency.value = 800 + tickCount * 40
    g.gain.setValueAtTime(0.2, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
    t.connect(g)
    g.connect(master)
    t.start(ctx.currentTime)
    t.stop(ctx.currentTime + 0.06)
    tickDelay = Math.max(60, tickDelay * 0.85)
    setTimeout(tick, tickDelay)
  }
  tick()
}

// ─── Reveal Celebration Sound ────────────────────────────────────────

export function playRevealSound() {
  const { ctx, master } = getCtx()
  const now = ctx.currentTime

  // Major chord burst: C5, E5, G5, C6
  const celebrationFreqs = [523.25, 659.25, 783.99, 1046.5]

  celebrationFreqs.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, now + i * 0.05)
    gain.gain.linearRampToValueAtTime(0.34, now + i * 0.05 + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.02, now + 1.5)
    gain.gain.linearRampToValueAtTime(0, now + 2.5)
    osc.connect(gain)
    gain.connect(master)
    osc.start(now + i * 0.05)
    osc.stop(now + 2.8)
  })

  // Shimmer/sparkle effect
  for (let i = 0; i < 8; i++) {
    const delay = 0.1 + i * 0.08
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 2000 + Math.random() * 3000
    gain.gain.setValueAtTime(0.16, now + delay)
    gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12)
    osc.connect(gain)
    gain.connect(master)
    osc.start(now + delay)
    osc.stop(now + delay + 0.15)
  }

  // Impact boom
  const boom = ctx.createOscillator()
  const boomGain = ctx.createGain()
  boom.type = 'sine'
  boom.frequency.setValueAtTime(150, now)
  boom.frequency.exponentialRampToValueAtTime(30, now + 0.3)
  boomGain.gain.setValueAtTime(0.5, now)
  boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
  boom.connect(boomGain)
  boomGain.connect(master)
  boom.start(now)
  boom.stop(now + 0.5)

  // Rising chime tail
  setTimeout(() => {
    const { ctx, master } = getCtx()
    const t = ctx.currentTime
    const chimeFreqs = [1318.5, 1568.0, 2093.0] // E6, G6, C7
    chimeFreqs.forEach((f, i) => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.value = f
      g.gain.setValueAtTime(0.18, t + i * 0.12)
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.8)
      o.connect(g)
      g.connect(master)
      o.start(t + i * 0.12)
      o.stop(t + i * 0.12 + 1)
    })
  }, 500)
}

// ─── Locking Impact Sound ────────────────────────────────────────────

export function playLockingSound() {
  const { ctx, master } = getCtx()
  const now = ctx.currentTime

  // Dramatic low hit
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(100, now)
  osc.frequency.exponentialRampToValueAtTime(50, now + 0.2)
  gain.gain.setValueAtTime(0.58, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5)
  osc.connect(gain)
  gain.connect(master)
  osc.start(now)
  osc.stop(now + 0.6)

  // Reverse cymbal / white noise sweep
  const bufferSize = ctx.sampleRate * 0.5
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
  }
  const noise = ctx.createBufferSource()
  const noiseGain = ctx.createGain()
  const filter = ctx.createBiquadFilter()
  noise.buffer = buffer
  filter.type = 'highpass'
  filter.frequency.setValueAtTime(2000, now)
  filter.frequency.linearRampToValueAtTime(8000, now + 0.3)
  noiseGain.gain.setValueAtTime(0.24, now)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
  noise.connect(filter)
  filter.connect(noiseGain)
  noiseGain.connect(master)
  noise.start(now)
}

export function unlockAudio() {
  ensureAudioReady()
  if (backgroundMode !== 'off' && !noteTimer && !kickTimer) {
    runBackgroundLoop(backgroundMode)
  }
}
