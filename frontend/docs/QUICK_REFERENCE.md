# 🎰 Lottery System - Quick Reference Guide

## Your 3 Questions - Answered

### ❓ How is the random number generated?
```javascript
// File: src/store/useLotteryStore.ts (lines 30-38)
selectWinner: () => {
  const { guests } = get()
  const available = guests.filter((g) => !g.hasWon)
  
  // THE RANDOM NUMBER GENERATION HAPPENS HERE:
  const randomIndex = Math.floor(Math.random() * available.length)
  
  const winner = available[randomIndex]
  set({ currentWinner: winner })
  return winner
}
```

**Key Points:**
- Uses JavaScript's native `Math.random()`
- Formula: `Math.floor(Math.random() * availableCount)`
- Only includes guests where `hasWon === false` (supports multiple rounds)
- Result: 0 to (availableCount - 1)

---

### ❓ Is it determined on start or continuously calculated?

**Answer: DETERMINED WHEN USER STOPS SPINNING** ✓

**Timeline:**
```
1. App starts → cardData initialized with random motion parameters (once)
2. User presses SPACE → phase = 'spinning' (cards orbit - DETERMINISTIC)
3. User presses SPACE again → stopSpin() called
4. ┌─ selectWinner() called HERE ← Math.random() executed ONCE
5. ├─ currentWinner is set in store
6. └─ phase = 'chasing' (camera animation)
7. After 3.5s → phase = 'locking' (auto-transition, no randomness)
8. After 2s → phase = 'revealed' (no randomness)
```

**Important Details:**
- During `spinning` phase: Cards move in **deterministic mathematical patterns**
- No continuous randomization during animation
- Random pick happens **exactly once** per draw
- After winner selected: Timeline plays deterministically

---

### ❓ Is there a start/stop mechanism in the UI?

**Answer: YES - Keyboard Controlled** ✓

| Key | When | Action |
|-----|------|--------|
| **SPACE** | `idle` | Start spinning (phase → spinning) |
| **SPACE** | `spinning` | Stop spinning, pick winner (phase → chasing) |
| **ENTER** | `revealed` | Confirm winner (mark as hasWon) |
| **N** | `revealed` | Next round (phase → idle, increment round) |
| **R** | `idle` or `revealed` | Reset all (clear winners, reset to round 1) |
| **F** | Any | Toggle fullscreen |

**Code Location:** `src/hooks/useKeyboard.ts` (lines 24-68)

---

## Phase State Machine

```
                    START
                      ↓
                  ┌─────────┐
                  │  idle   │  ← Initial state, cards gently float
                  └────┬────┘
                       │ [SPACE]
                       ↓
                  ┌─────────┐
                  │spinning │  ← Cards orbit faster, music plays
                  └────┬────┘
                       │ [SPACE to stop]
                       ↓
                  ┌──────────┐
                  │ chasing  │  ← Camera hunts down cards
                  │ 3.5s     │  ← WINNER SELECTED HERE
                  └────┬─────┘
                       │ [auto after duration]
                       ↓
                  ┌──────────┐
                  │ locking  │  ← Winner scales, others scatter
                  │  2.0s    │  ← Dramatic effects
                  └────┬─────┘
                       │ [auto after duration]
                       ↓
                  ┌───────────┐
                  │ revealed  │  ← Winner modal displays
                  │ ∞ (user)  │  ← Wait for user input
                  └────┬──────┘
                       │ [N]
                       ↓
                    [LOOP BACK TO idle]
```

---

## Where Random Numbers Are Used

### 1. **Winner Selection** (Main)
```javascript
// src/store/useLotteryStore.ts - Line 34
const randomIndex = Math.floor(Math.random() * available.length)
```
- **When:** When user stops spinning (calls stopSpin())
- **Frequency:** Once per draw
- **Range:** 0 to (availableCount - 1)

### 2. **Card Motion Offsets** (Initialization)
```javascript
// src/scenes/CardField.tsx - Lines 87-96
emissiveOffset: Math.random() * Math.PI * 2,
floatAmplitude: 0.08 + Math.random() * 0.12,
spinYawSpeed: 1.8 + Math.random() * 1.5,
// ... 10 random values per card
```
- **When:** App startup, when guests are loaded
- **Frequency:** Once per card (100+ times)
- **Purpose:** Make each card's motion unique

### 3. **Chase Targets** (During Animation)
```javascript
// src/animations/lotteryTimeline.ts - Lines 169-180
const idx = Math.floor(Math.random() * totalCards)
```
- **When:** When stopSpin() is called
- **Frequency:** ~4 times (picking 4 random cards to visit)
- **Purpose:** Camera visits random cards before converging on winner

### 4. **Audio Synthesis** (Background)
```javascript
// src/utils/audio.ts
data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
```
- **When:** When phase is 'spinning'
- **Frequency:** Many times (audio synthesis)
- **Purpose:** Create synthesized background music

---

## Animation Timeline Details

### Total Duration: ~5.5 seconds (after winner selected)

```
[0s - 3.5s] CHASING PHASE
├─ Camera flies to random card 1 (flashCard effect)
├─ Camera flies to random card 2 (flashCard effect)
├─ Camera flies to random card 3 (flashCard effect)
├─ Camera flies NEAR winner (buildups suspense)
└─ Background music playing

[3.5s - 5.5s] LOCKING PHASE
├─ phase = 'locking' (callback triggers)
├─ Winner card scales up 2x
├─ Winner card rotates to face camera
├─ Winner card gets gold particle effects (igniteWinnerCard)
├─ Other cards scatter dramatically
├─ Camera zooms to front view
├─ Post-processing bloom intensifies (PEAK: 1.45)
└─ Locking sound effect plays

[5.5s+] REVEALED PHASE
├─ Modal displays: "NO.{winner.code}"
├─ Text animations with spring physics
├─ Post-processing normalizes
├─ Waiting for user to press N (next round)
└─ Celebratory sound effect
```

---

## Component Interaction Map

```
USER INPUT LAYER
├─ ControlPanel: Load guests (1-200 range)
├─ useKeyboard: Handle SPACE/ENTER/N/R/F keys
└─ Emits to: useLotteryStore

ZUSTAND STORE (State Management)
├─ guests[]: All participants
├─ winners[]: History of winners
├─ currentWinner: Currently selected
├─ currentRound: Round counter
├─ phase: 'idle'|'spinning'|'chasing'|'locking'|'revealed'
└─ Actions:
   ├─ selectWinner() ← Math.random() HERE
   ├─ confirmWinner()
   ├─ nextRound()
   └─ reset()

CARDFIELD (3D Scene)
├─ Subscribes to: phase, guests, currentWinner
├─ useFrame loop: Animates cards based on phase
├─ startSpin(): Set phase = 'spinning'
└─ stopSpin(): 
   ├─ Call selectWinner()
   ├─ Create GSAP timeline
   └─ Set phase = 'chasing'

3D ANIMATION ENGINE
├─ useFrame loop (per-frame): Idle/spinning animations
├─ GSAP Timeline: Chasing/locking/revealed sequences
├─ Camera controller: Position & FOV animations
├─ Post-processing: Bloom, chromatic, noise
├─ Particle system: Gold/heart effects
└─ Audio synthesis: Music & sound effects

UI OUTPUT LAYER
├─ WinnerReveal: Modal display (phase==='revealed')
├─ StatusBar: Current round, phase info
└─ HUD: Title, control panel
```

---

## File Reference Sheet

| File | Lines | Key Content |
|------|-------|-------------|
| `src/store/useLotteryStore.ts` | 30-38 | `selectWinner()` - Random selection |
| `src/scenes/CardField.tsx` | 113-199 | `startSpin()`, `stopSpin()` - Phase control |
| `src/animations/lotteryTimeline.ts` | 26-164 | Timeline definition, `pickChaseTargets()` |
| `src/hooks/useKeyboard.ts` | 24-68 | Keyboard handling by phase |
| `src/types/index.ts` | 8-13 | `LotteryPhase` type definition |
| `src/utils/constants.ts` | 38-47, 69-100 | Timing, scene parameters, effects |
| `src/components/ui/WinnerReveal.tsx` | 11-88 | Winner modal display |
| `src/components/ui/ControlPanel.tsx` | 5-26 | Guest import UI |

---

## State Persistence Across Rounds

```javascript
// Round 1: 5 guests join, guest #2 wins
guests: [{..., hasWon:false}, {id:2, ..., hasWon:true}, ...]
winners: [{id:2, wonAtRound:1}]
currentRound: 1

// User presses N (nextRound)
nextRound() → {
  phase: 'idle'
  currentRound: 2
  currentWinner: null
  // guests[] and winners[] PERSIST
}

// Round 2: selectWinner() now filters:
available = guests.filter(g => !g.hasWon)
// → excludes guest #2 (already won)
```

---

## Key Insights

✓ **Winner Selection is NOT Continuous**
- Selected exactly once when user stops spinning
- No "spinning wheel" effect with changing winners

✓ **Animation is DETERMINISTIC During Spinning**
- Cards move in mathematical sine/cosine patterns
- Not based on randomness during the animation

✓ **Random Used for Visual Variety**
- Each card has unique motion offsets (calculated once)
- Chase targets are random (keeps it unpredictable)
- But winner is already picked before animation starts

✓ **UI Controls Determine Everything**
- SPACE: Starts spinning
- SPACE again: Locks in winner and plays reveal animation
- Entire flow is user-controlled via keyboard

✓ **Multi-Round Support**
- `confirmWinner()` marks guest as hasWon
- `nextRound()` increments round, resets phase
- `removeWinner()` allows undo for no-shows

---

**Generated:** May 2026 | **System:** Wedding Lottery (婚礼幸运抽奖)
