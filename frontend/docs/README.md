# 🎰 Wedding Lottery System Documentation

This directory contains comprehensive documentation for the **婚礼幸运抽奖** (Wedding Lottery/Raffle) system.

## 📚 Documentation Files

### 1. **QUICK_REFERENCE.md** ⭐ START HERE
**Quick answers to your 3 key questions** (5-10 min read)
- How is the random number generated? (`Math.floor(Math.random() * availableCount)`)
- When is it determined? (When user stops spinning)
- Start/stop mechanism? (Keyboard controlled - SPACE, ENTER, N, R, F)
- Phase state machine diagram
- File reference sheet with line numbers

### 2. **LOTTERY_SYSTEM_ANALYSIS.md** (Deep Dive)
**Comprehensive technical analysis** (20-30 min read)
- 10 detailed sections covering every aspect
- Random number generation timing & usage
- Phase system & UI flow with ASCII diagrams
- Start/stop mechanism explained
- 3D scene architecture
- State management patterns
- Complete user flow example
- Key files reference guide
- Visual feedback by phase

### 3. **diagrams/lottery-system-architecture.svg**
**Visual architecture diagram** 
- User input & control layer
- State management & logic (Zustand store)
- 3D scene & animation engine
- Data flow arrows
- Color-coded components
- Legend with key insights
- File references
- Timing information

## 🎯 Quick Navigation

### I want to understand...

**...how the winner is chosen**
→ Read: QUICK_REFERENCE.md → "How is the random number generated?"

**...the complete user flow**
→ Read: LOTTERY_SYSTEM_ANALYSIS.md → Section 7: "Example: Complete User Flow"

**...the phase state machine**
→ Read: QUICK_REFERENCE.md → "Phase State Machine" (ASCII diagram)
→ View: diagrams/lottery-system-architecture.svg (visual diagram)

**...the code architecture**
→ Read: LOTTERY_SYSTEM_ANALYSIS.md → Section 6: "State Management"
→ View: diagrams/lottery-system-architecture.svg

**...keyboard controls**
→ Read: QUICK_REFERENCE.md → "Is there a start/stop mechanism?"
→ Check: LOTTERY_SYSTEM_ANALYSIS.md → Section 3: "START/STOP MECHANISM"

**...animation timing**
→ Read: QUICK_REFERENCE.md → "Animation Timeline Details"
→ Check: LOTTERY_SYSTEM_ANALYSIS.md → Section 3: "🎬 Animation Timeline Architecture"

**...where random is used**
→ Read: QUICK_REFERENCE.md → "Where Random Numbers Are Used"
→ Check: LOTTERY_SYSTEM_ANALYSIS.md → Section 4: "RANDOM NUMBER GENERATION - DETAILED"

## 📁 Key Files in Codebase

| File | Purpose | Lines |
|------|---------|-------|
| `src/store/useLotteryStore.ts` | Winner selection logic | 30-38 |
| `src/scenes/CardField.tsx` | 3D card animations, phase control | 113-199, 201-266 |
| `src/animations/lotteryTimeline.ts` | GSAP timeline (chase/lock/reveal) | 26-164 |
| `src/hooks/useKeyboard.ts` | Keyboard input handling | 24-68 |
| `src/types/index.ts` | Type definitions | 8-13 |
| `src/utils/constants.ts` | Timing & animation params | 38-47, 69-100 |
| `src/components/ui/WinnerReveal.tsx` | Winner display modal | 11-88 |
| `src/components/ui/ControlPanel.tsx` | Guest import UI | 5-26 |

## 🔑 Core Concepts

### Phase State Machine
```
idle → spinning → chasing → locking → revealed → (N) → idle
  ↑                                                    ↓
  └────────────────────── reset() ←────────────────────┘
```

### Random Number Generation
```javascript
Math.floor(Math.random() * available.length)
// Called ONCE when user stops spinning
```

### Keyboard Controls
- **SPACE**: Start spinning (idle) or stop spinning (spinning)
- **ENTER**: Confirm winner (revealed)
- **N**: Next round (revealed)
- **R**: Reset all (idle or revealed)
- **F**: Fullscreen toggle

### State Persistence
- `guests[]`: All participants (persists across rounds)
- `winners[]`: History of winners (persists)
- `currentRound`: Round number (increments)
- `currentWinner`: Currently selected winner
- `phase`: Current animation phase

## 🎬 Animation Phases

| Phase | Duration | Triggers | What Happens |
|-------|----------|----------|--------------|
| **idle** | ∞ | App start, after nextRound() | Cards float gently |
| **spinning** | User-controlled | SPACE (idle) | Cards orbit faster, music |
| **chasing** | 3.5s | SPACE (spinning) | Camera chases random cards |
| **locking** | 2.0s | Auto after chasing | Winner locks, others scatter |
| **revealed** | User-controlled | Auto after locking | Winner modal displays |

## 💡 Key Insights

✓ Winner is selected **when user stops spinning**, not continuously
✓ Animation during spinning is **deterministic** (math-based, not random)
✓ Each card's motion has **unique random offsets** (set once at startup)
✓ Chase targets are **random** (builds visual unpredictability)
✓ Multi-round support via **guest filtering** (hasWon flag)
✓ Entire flow controlled via **keyboard + state machine**

## 🔍 Finding Specific Features

### Random Number Generation
- **Main winner selection**: `src/store/useLotteryStore.ts` line 34
- **Card motion randomization**: `src/scenes/CardField.tsx` lines 87-96
- **Chase target randomization**: `src/animations/lotteryTimeline.ts` lines 169-180
- **Audio synthesis randomization**: `src/utils/audio.ts` (noise generation)

### UI Components
- **Guest loading**: `src/components/ui/ControlPanel.tsx`
- **Winner reveal modal**: `src/components/ui/WinnerReveal.tsx`
- **Keyboard handling**: `src/hooks/useKeyboard.ts`
- **Status display**: `src/components/ui/StatusBar.tsx`

### Animation
- **3D card management**: `src/scenes/CardField.tsx`
- **Timeline orchestration**: `src/animations/lotteryTimeline.ts`
- **Card animations**: `src/animations/cardAnimations.ts`
- **Camera animations**: `src/animations/cameraAnimations.ts`

### Store & Types
- **State management**: `src/store/useLotteryStore.ts`
- **Type definitions**: `src/types/index.ts`
- **Constants & timing**: `src/utils/constants.ts`

## 🚀 Next Steps

1. **For quick understanding**: Read `QUICK_REFERENCE.md`
2. **For implementation**: Study `src/store/useLotteryStore.ts` and `src/scenes/CardField.tsx`
3. **For visual reference**: Open `diagrams/lottery-system-architecture.svg`
4. **For deep learning**: Read `LOTTERY_SYSTEM_ANALYSIS.md`

## 📝 Document Info

- **Created**: May 2026
- **System**: Wedding Lottery (婚礼幸运抽奖)
- **Stack**: React + Three.js + GSAP + Zustand
- **Language**: TypeScript
- **Audience**: Developers, architects, stakeholders

---

**Have questions?** Refer to the appropriate document above or check the specific file references provided.
