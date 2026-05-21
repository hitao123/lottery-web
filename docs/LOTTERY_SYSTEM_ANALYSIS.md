# 婚礼幸运抽奖 (Wedding Lottery/Raffle) System - Complete Analysis

## 📋 Project Overview
This is a **3D interactive lottery system** for weddings (婚礼幸运抽奖) built with React, Three.js, and GSAP. It features:
- 3D spinning card animation
- Random winner selection
- Multi-round support
- Dynamic camera chase sequences
- Golden luxury aesthetic

---

## 1. RANDOM NUMBER GENERATION & WINNER SELECTION

### ⏰ **When is the Winner Decided?**

**KEY FINDING: Winner is selected AFTER spinning stops (on user click to stop)**

```
Timeline:
1. User presses SPACE → "spinning" phase begins (cards spin continuously)
2. User presses SPACE again → stopSpin() called
3. stopSpin() calls selectWinner() → WINNER IS SELECTED HERE ✓
4. Camera chase animation begins to hunt down the winner
5. Winner card locks to center
6. Winner revealed to audience
```

### 🎲 Winner Selection Logic

**File:** `src/store/useLotteryStore.ts` (lines 30-38)

```typescript
selectWinner: () => {
  const { guests } = get()
  // Filter out already-won guests (support for multiple rounds)
  const available = guests.filter((g) => !g.hasWon)
  if (available.length === 0) return null
  
  // RANDOM: Math.random() * available.length
  const randomIndex = Math.floor(Math.random() * available.length)
  const winner = available[randomIndex]
  set({ currentWinner: winner })
  return winner
},
```

**Random Number Generation Details:**
- Uses `Math.random()` (JavaScript native)
- Selected from **available guests only** (those who haven't won yet)
- Called **once** when user stops spinning (not continuous during spinning)
- Algorithm: `Math.floor(Math.random() * availableCount)`

### 🔄 State Machine: Winner Selection Flow

```
CardField.tsx (startSpin/stopSpin):
    ↓
stopSpin() is called
    ↓
selectWinner() from useLotteryStore
    ↓
Math.floor(Math.random() * available.length)
    ↓
currentWinner is set in store
    ↓
confirmWinner() marks guest as hasWon: true
    ↓
Next round: available pool shrinks
```

---

## 2. PHASE SYSTEM & UI FLOW

### 📊 Phase Machine Diagram

```
LotteryPhase = 'idle' | 'spinning' | 'chasing' | 'locking' | 'revealed'

                    ┌─────────────┐
                    │    idle     │ ← Initial state
                    └──────┬──────┘
                           │ [SPACE]
                           ↓
                    ┌─────────────┐
                    │  spinning   │ ← Cards spin (visual only)
                    │   (music)   │
                    └──────┬──────┘
                           │ [SPACE] to stop
                           ↓
                    ┌─────────────┐
                    │   chasing   │ ← Camera chases (3.5s)
                    │             │ ← Winner SELECTED here
                    └──────┬──────┘
                           │ (auto after chase)
                           ↓
                    ┌─────────────┐
                    │   locking   │ ← Winner card locks (2s)
                    │             │ ← Other cards scatter
                    └──────┬──────┘
                           │ (auto after locking)
                           ↓
                    ┌─────────────┐
                    │  revealed   │ ← Winner displayed to audience
                    │             │ ← MODAL with winner code
                    └──────┬──────┘
                           │ [N] to next round
                           ↓
                    ┌─────────────┐
                    │    idle     │ ← Next round begins
                    └─────────────┘
```

### 🎮 UI/Phase Mapping

| Phase | What Happens | Duration | UI Display |
|-------|-------------|----------|-----------|
| `idle` | Cards float gently, idle animations | ∞ | Title + Status bar |
| `spinning` | Cards orbit faster, background music | User controlled | Title + Status bar |
| `chasing` | Camera flies to random cards then winner | 3.5s | Nothing (immersive) |
| `locking` | Winner card scales up, others scatter | 2.0s | Post-processing intensifies |
| `revealed` | Winner modal pops up | ∞ | **MODAL: "NO.{code}"** |

---

## 3. START/STOP MECHANISM

### 🎮 Keyboard Controls

**File:** `src/hooks/useKeyboard.ts`

| Key | Phase | Action |
|-----|-------|--------|
| **SPACE** | `idle` → `spinning` | Start spinning |
| **SPACE** | `spinning` → (stopping) | Stop spinning, select winner |
| **ENTER** | `revealed` | Confirm winner (lock in) |
| **N** | `revealed` | Reset cards, move to next round |
| **R** | `idle` or `revealed` | Reset all (clear winners) |
| **F** | Any | Fullscreen toggle |

### 🎛️ Control Flow

```javascript
// Start Spinning
Space (idle) → startSpin()
  ├─ phase = 'spinning'
  └─ startBackgroundMusic()

// Stop Spinning  
Space (spinning) → stopSpin()
  ├─ selectWinner() ← WINNER PICKED HERE
  ├─ phase = 'chasing'
  ├─ Create GSAP timeline (chase + lock + reveal)
  ├─ timeline.play()
  └─ Auto-transitions through phases
```

### 🎬 Animation Timeline Architecture

**File:** `src/animations/lotteryTimeline.ts`

```
GSAP Master Timeline (sequential):
│
├─ [0s - 3.5s] CHASING
│  ├─ pickChaseTargets() → Math.random() card indices
│  ├─ flashCard(random cards) → visual chase effect
│  └─ camera.lookAt() → follow each target
│
├─ [3.5s - 5.5s] LOCKING (phase='locking')
│  ├─ lockWinnerCard(winner)
│  ├─ scaleWinnerCard(winner)
│  ├─ rotateToFaceCamera(winner)
│  ├─ igniteWinnerCard(winner) ← particle effects
│  ├─ scatterCards(others) ← non-winners fly away
│  └─ camera movement to front view
│
└─ [5.5s+] REVEALED (phase='revealed')
   ├─ Winner modal displays
   └─ Waiting for user to confirm (press N)
```

### 🎴 Card Animation (useFrame Loop)

**File:** `src/scenes/CardField.tsx` (lines 201-266)

```javascript
useFrame runs EVERY frame (decoupled from phase):

if (phase === 'idle'):
  // Gentle floating motion
  card.position.x = baseX + sin(t * 0.18) * orbitRadius
  card.position.y = baseY + sin(t * floatSpeed) * amplitude
  card.rotation.y += idleYawSpeed * delta

if (phase === 'spinning'):
  // Fast orbit + vertical bounce
  contraction = 0.84 + sin(t * 4.8) * 0.04
  card.position.x = baseX * contraction + sin(t * 2.7) * spinRadius
  card.position.y = baseY * 0.82 + sin(t * 2.4) * amplitude * 2.4
  card.rotation.y += spinYawSpeed * delta  ← fast rotation

if (phase === 'revealed' && guest.id === winner.id):
  // Winner card subtle bobbing
  card.position.y = sin(t * 1.9) * 0.12
  card.rotation.x = sin(t * 0.85) * 0.05
```

---

## 4. RANDOM NUMBER GENERATION - DETAILED

### 🎲 Where Random Numbers Are Used

| Location | Random Purpose | Code |
|----------|----------------|------|
| **Winner Selection** | Pick guest from available pool | `Math.floor(Math.random() * available.length)` |
| **Card Motion Init** | Per-card animation offsets | `Math.random() * Math.PI * 2` |
| **Chase Targets** | Pick random cards to visit before winner | `Math.floor(Math.random() * totalCards)` |
| **Card Spin Speed** | Varies spin speed per card | `1.8 + Math.random() * 1.5` |
| **Card Float Amplitude** | Varies bob height per card | `0.08 + Math.random() * 0.12` |
| **Audio Synthesis** | Noise generation for music | `Math.random() * 2 - 1` |

### ⏱️ Random Generation Timing

```
App Start:
├─ fibonacciSphere() → Position 100+ cards in sphere
├─ FOR EACH CARD:
│  ├─ emissiveOffset = Math.random() * PI * 2
│  ├─ floatAmplitude = 0.08 + Math.random() * 0.12
│  ├─ spinYawSpeed = 1.8 + Math.random() * 1.5
│  ├─ idleYawSpeed = 0.22 + Math.random() * 0.2
│  └─ ... (10 random values per card)
└─ [All randomization DONE - stored in cardData]

User Clicks SPACE to Stop:
├─ stopSpin() called
├─ selectWinner():
│  └─ randomIndex = Math.floor(Math.random() * available.length) ← ONCE HERE
├─ pickChaseTargets():
│  ├─ FOR i in 0..count-1:
│  │  └─ idx = Math.floor(Math.random() * totalCards) ← Random indices
│  └─ (No continuous randomization during animation)
└─ Timeline plays deterministically (no more randomness)
```

### 📌 Key Insight: Deterministic After Winner Selection

```
Phase          Randomness?    When?
─────────────────────────────────────
idle           Per-card only  App startup (once)
spinning       Per-card only  Same as idle (deterministic visual)
chasing        YES ✓          When stopSpin() called (pick chase targets)
locking        NO             Timeline plays deterministically
revealed       NO             Just displaying the winner
```

---

## 5. 3D SCENE ARCHITECTURE

### 🌐 Component Hierarchy

```
CardField (Main 3D Component)
├─ 100+ Card Components (Three.js)
│  ├─ Mesh (card geometry)
│  ├─ Material (MeshStandardMaterial - glossy gold)
│  └─ Emissive glow
│
└─ Animation System
   ├─ useFrame() loop (idle/spinning)
   ├─ GSAP Timeline (chasing/locking/revealed)
   └─ Camera animation (follow winner path)
```

### 🎨 Visual Feedback by Phase

| Phase | Visual Effect | Post-Processing |
|-------|---------------|-----------------|
| idle | Gentle float | bloomIntensity: 0.28 |
| spinning | Fast orbit + bounce | bloomIntensity: 0.62, higher noise |
| chasing | Camera moves, cards flash | bloomIntensity: 0.9, chromatic aberration |
| locking | Winner scales, others scatter | bloomIntensity: 1.45 (PEAK) |
| revealed | Winner glows, others dim | bloomIntensity: 1.02, normalized |

---

## 6. STATE MANAGEMENT

### 📦 Zustand Store (useLotteryStore)

```typescript
// Persistent Across Rounds
guests: Guest[]          // All participants
winners: Guest[]         // List of winners so far
currentRound: number     // Which round (1, 2, 3...)
currentWinner: Guest     // Currently selected (null after confirm)

// Phase Management
phase: LotteryPhase      // idle | spinning | chasing | locking | revealed

// Actions
addGuests(codes)        // Load participants
selectWinner()          // Pick random (called by CardField.stopSpin)
confirmWinner()         // Lock in winner (marks hasWon: true)
removeWinner(id)        // Undo a draw
nextRound()             // Reset phase to idle, increment round
reset()                 // Clear all winners, reset to round 1
```

### 🔄 Store Access Pattern

```javascript
// CardField.tsx subscribes to:
const guests = useLotteryStore((s) => s.guests)
const phase = useLotteryStore((s) => s.phase)
const currentWinner = useLotteryStore((s) => s.currentWinner)
const selectWinner = useLotteryStore((s) => s.selectWinner)

// useKeyboard.ts accesses:
const { phase } = useLotteryStore.getState()  // Synchronous access
useLotteryStore.getState().confirmWinner()    // Call action
```

---

## 7. EXAMPLE: COMPLETE USER FLOW

### Scenario: Second Draw of Wedding

```
Initial State:
  phase: 'idle'
  guests: [{id:1, code:'001', hasWon:false}, {id:2, code:'002', hasWon:true}, ...]
  winners: [{...guest 2...}]
  currentRound: 1

User presses SPACE:
  → startSpin() called
  → phase = 'spinning'
  → startBackgroundMusic()
  → Cards start orbiting faster
  [User watches for ~5 seconds]

User presses SPACE again:
  → stopSpin() called
  → available = guests.filter(g => !g.hasWon)  [excludes guest 2]
  → randomIndex = Math.floor(Math.random() * available.length)
  → Say randomIndex = 0 → winner = guest 1 (code: '001')
  → currentWinner = guest 1
  → phase = 'chasing'
  → pickChaseTargets() picks 3 random cards to visit
  → Camera chases those cards (3.5s)
  
  [3.5s elapsed]
  → phase = 'locking'
  → winnerCard scales up 2x
  → non-winner cards fly away dramatically
  → camera zooms to front view
  → Post-processing bloom intensifies
  
  [2s elapsed]
  → phase = 'revealed'
  → Modal displays: "NO.001 恭喜中奖"
  → User sees winner code on screen
  
User presses ENTER:
  → confirmWinner()
  → guest 1.hasWon = true
  → guest 1 added to winners list
  
User presses N:
  → resetCards() animation
  → nextRound()
  → currentRound = 2
  → phase = 'idle'
  → currentWinner = null
  → Ready for round 3...
```

---

## 8. KEY FILES REFERENCE

| File | Purpose | Lines |
|------|---------|-------|
| `src/store/useLotteryStore.ts` | Zustand store, winner selection | 30-38 |
| `src/scenes/CardField.tsx` | Main 3D scene, animation controller | 113-199 |
| `src/animations/lotteryTimeline.ts` | GSAP timeline (chase/lock/reveal) | 26-164 |
| `src/hooks/useKeyboard.ts` | Keyboard input handling | 24-68 |
| `src/types/index.ts` | LotteryPhase, Guest types | 8-13 |
| `src/utils/constants.ts` | Animation timings, scene parameters | 38-47, 69-100 |
| `src/components/ui/WinnerReveal.tsx` | Winner modal display | 11-88 |
| `src/components/ui/ControlPanel.tsx` | UI for loading guests | 5-26 |

---

## 9. SUMMARY: ANSWERS TO YOUR QUESTIONS

### ❓ Question 1: How is the random number generated?

**Answer:** `Math.floor(Math.random() * availableCount)`
- Uses JavaScript's native `Math.random()`
- Called when user stops spinning (presses SPACE during `spinning` phase)
- Filters out guests who already won
- Result: One winner per draw

### ❓ Question 2: Is it determined on start or continuously calculated?

**Answer:** **Determined when user stops spinning** ✓
- NOT determined at app start
- NOT continuously calculated during spinning
- Animation during spinning is **deterministic** (not based on random numbers)
- Random selection happens **once** when `stopSpin()` is called
- No re-randomization after that

### ❓ Question 3: Is there a start/stop mechanism in the UI?

**Answer:** **Yes - keyboard controlled** ✓
- **Start:** SPACE (when `phase === 'idle'`)
- **Stop:** SPACE (when `phase === 'spinning'`)
- After stop: Auto-plays chase → locking → revealed phases
- Then: User controls next action (N for next round, R for reset)

---

## 10. PHASE EXECUTION TIMELINE

```
User Action          Phase         Duration    What Happens
─────────────────────────────────────────────────────────────
SPACE (idle)         idle → spinning  0s        Start music, set phase
[spinning...]        spinning         ∞ (user)  Cards orbit, music plays
SPACE (spinning)     spinning → ?    0s        Pick winner, start timeline
                     chasing         3.5s      Camera chase effect
                     locking         2.0s      Winner locks, others scatter
                     revealed        ∞ (user)  Modal shows, wait for input
ENTER (revealed)     revealed         0s        confirmWinner() - mark as won
N (revealed)         revealed → idle  0s        Reset animation, nextRound()
                     idle            ∞ (user)  Back to waiting for SPACE
```

---

**Generated:** May 2026
**Codebase:** lottery-web (React + Three.js + GSAP + Zustand)
