/**
 * Audio manager using Web Audio API.
 * Synthesizes all sounds programmatically — no external files needed.
 * Provides festive background music during spinning and celebratory burst on reveal.
 */

let audioCtx: AudioContext | null = null
let masterGain: GainNode | null = null
let bgRunning = false

function getCtx() {
  if (!audioCtx) {
    audioCtx = new AudioContext()
    masterGain = audioCtx.createGain()
    masterGain.gain.value = 0.3
    masterGain.connect(audioCtx.destination)
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return { ctx: audioCtx, master: masterGain! }
}

// ─── Background Music (spinning phase) ───────────────────────────────
// Upbeat arpeggio pattern that loops, builds energy

const SCALE = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25]
// C4, D4, E4, G4, A4, C5, D5, E5 — pentatonic-ish, festive

let arpeggioInterval: ReturnType<typeof setInterval> | null = null
let arpeggioIndex = 0
let arpeggioSpeed = 180 // ms between notes

export function startBackgroundMusic() {
  if (bgRunning) return
  bgRunning = true
  const { ctx, master } = getCtx()

  arpeggioIndex = 0
  arpeggioSpeed = 180

  function playNote() {
    if (!bgRunning) return
    const freq = SCALE[arpeggioIndex % SCALE.length]
    arpeggioIndex++

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)

    osc.connect(gain)
    gain.connect(master)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.18)

    // Slight shimmer
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'triangle'
    osc2.frequency.value = freq * 2
    gain2.gain.setValueAtTime(0.04, ctx.currentTime)
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
    osc2.connect(gain2)
    gain2.connect(master)
    osc2.start(ctx.currentTime)
    osc2.stop(ctx.currentTime + 0.12)
  }

  // Start arpeggio loop
  playNote()
  arpeggioInterval = setInterval(() => {
    if (!bgRunning) {
      if (arpeggioInterval) clearInterval(arpeggioInterval)
      return
    }
    playNote()
    // Gradually speed up for building energy
    if (arpeggioSpeed > 100) {
      arpeggioSpeed -= 0.5
      if (arpeggioInterval) {
        clearInterval(arpeggioInterval)
        arpeggioInterval = setInterval(() => {
          if (!bgRunning) {
            if (arpeggioInterval) clearInterval(arpeggioInterval)
            return
          }
          playNote()
        }, arpeggioSpeed)
      }
    }
  }, arpeggioSpeed)

  // Low pulse beat
  const kickLoop = () => {
    if (!bgRunning) return
    const { ctx, master } = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(80, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.08)
    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
    osc.connect(gain)
    gain.connect(master)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.15)
    setTimeout(kickLoop, 400)
  }
  kickLoop()
}

export function stopBackgroundMusic() {
  bgRunning = false
  if (arpeggioInterval) {
    clearInterval(arpeggioInterval)
    arpeggioInterval = null
  }
  arpeggioSpeed = 180
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
  gain.gain.setValueAtTime(0.05, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1.5)
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
    g.gain.setValueAtTime(0.08, ctx.currentTime)
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
    gain.gain.linearRampToValueAtTime(0.15, now + i * 0.05 + 0.02)
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
    gain.gain.setValueAtTime(0.06, now + delay)
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
  boomGain.gain.setValueAtTime(0.25, now)
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
      g.gain.setValueAtTime(0.08, t + i * 0.12)
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
  gain.gain.setValueAtTime(0.3, now)
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
  noiseGain.gain.setValueAtTime(0.1, now)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
  noise.connect(filter)
  filter.connect(noiseGain)
  noiseGain.connect(master)
  noise.start(now)
}
