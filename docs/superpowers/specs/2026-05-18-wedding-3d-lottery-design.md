# Wedding 3D Universe Lottery System — Design Spec

## Context

为婚礼现场大屏开发一个沉浸式 3D 抽奖系统。来宾持有编号卡片（如 NO.001），系统在 3D 宇宙空间中展示所有漂浮的号码卡片，通过电影感的镜头追逐和命运随机感的动画锁定中奖号码。

**目标**：打造"Apple 发布会 + 星空宇宙 + 婚礼仪式感"的视觉体验，区别于传统年会抽奖。

---

## 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 架构 | 纯前端 SPA | 婚礼单机使用，无需后端 |
| 构建 | Vite + React + TypeScript | 现代、快速 |
| 3D | React Three Fiber + Drei | 声明式、与 React 生态一致 |
| 动画 | GSAP (编排) + useFrame (持续) + Framer Motion (UI) | 三层分工 |
| 状态 | Zustand | 轻量、性能好 |
| 后期 | @react-three/postprocessing | Bloom/DOF/Vignette |
| 样式 | TailwindCSS | 快速开发 UI overlay |
| 渲染 | 独立 Mesh (非 Instanced) | 100-300 规模够用，代码简洁 |

---

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                     App (React SPA)                          │
├─────────────────────────────────────────────────────────────┤
│  UI Layer (Framer Motion)     │  3D Scene (R3F Canvas)      │
│  • HUD Overlay                │  • CardField (cards mgmt)   │
│  • WinnerReveal               │  • Environment (stars)      │
│  • ControlPanel               │  • CameraRig (GSAP)        │
│  • StatusBar                  │  • PostProcessing           │
├───────────────────────────────┤                             │
│  State (Zustand)              │  Animation Engine           │
│  • phase                      │  • GSAP Timeline            │
│  • guests[]                   │  • useFrame loops           │
│  • winners[]                  │  • Framer Motion            │
│  • currentRound               │                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 核心状态机

```
IDLE → SPINNING → CHASING → LOCKING → REVEALED → (IDLE)
```

| Phase | 触发 | 持续 | 视觉表现 |
|-------|------|------|----------|
| IDLE | 初始/N键 | 持续 | 卡片缓慢漂浮旋转，呼吸感，cinematic 缓移 |
| SPINNING | Space | ~2s | 卡片加速运动，粒子增强，Bloom 加强 |
| CHASING | 自动 | ~3-5s | 镜头快速飞越多张卡片，景深变化，速度感 |
| LOCKING | 自动 | ~2s | 目标卡吸附居中，其他散开，Bloom MAX，粒子爆发 |
| REVEALED | 自动 | 持续 | 中奖号码居中展示，金色烟花，UI panel 弹出 |

---

## 快捷键

| 按键 | 功能 |
|------|------|
| Space | 开始抽奖 (IDLE→SPINNING) |
| Enter | 确认/关闭中奖展示 |
| N | 下一轮（重置到 IDLE） |
| F | 全屏切换 |
| Esc | 取消/退出当前操作 |
| R | 重置所有数据 |

---

## 3D 场景设计

### 卡片组件 (Card)

- **几何体**：RoundedBox (Drei) 或 PlaneGeometry with rounded corners
- **材质**：MeshPhysicalMaterial (transmission + roughness 模拟玻璃)
- **文字**：Canvas Texture 预渲染到纹理，贴在 Mesh 正面
- **内容**：`NO.{code}` 主号码 + "Forever Love" / "Lucky Wedding Guest" 副文字
- **样式**：半透明玻璃 + 金色边框(emissive edge) + 四角装饰
- **尺寸**：约 1.2 x 1.8 (宽高比 2:3)

### 卡片分布

- **空间**：球形分布，半径 15-25
- **随机性**：每张卡片位置在球面上 + 微小随机偏移
- **初始旋转**：随机 Y 轴旋转

### 卡片动画 (useFrame)

- **IDLE**：
  - 缓慢 Y 轴旋转 (speed: 0.1-0.3 rad/s)
  - 上下浮动 (sin wave, amplitude: 0.1-0.3, freq: 0.3-0.8)
  - 呼吸发光 (emissive intensity oscillation)
- **SPINNING**：
  - 加速旋转 (speed × 3-5)
  - 轨迹变复杂（增加 X/Z 轴运动）
  - 整体向中心收缩
- **LOCKING**：
  - 中奖卡：GSAP 驱动吸附到 (0,0,5) facing camera
  - 其他卡：向外爆散 + fade out

### 环境

**Layer 1 — 星空**
- Drei `<Stars>` 组件，count: 3000, depth: 80
- 背景色：深蓝渐变 (#0a0a1a → #1a1a3e)

**Layer 2 — 金色粒子**
- Points geometry, count: 800-1200
- 大小：随机 0.02-0.08
- 颜色：香槟金 #d4af37，varying opacity
- 运动：缓慢漂浮 (noise-based)

**Layer 3 — 爱心/花瓣粒子**（锁定阶段爆发）
- Sprite-based，少量 (20-50)
- 从中心向外扩散
- 触发时机：LOCKING → REVEALED 过渡

### 相机 (CameraRig)

- **IDLE**：缓慢环绕 (GSAP/useFrame，轨道运动)
- **SPINNING**：拉近 + 轻微震动
- **CHASING**：GSAP Timeline 驱动，快速飞越 3-5 张卡片位置
- **LOCKING**：平滑聚焦到中奖卡正前方 (0, 0, 8)

### 后期处理

- **Bloom**：始终开启，intensity 随 phase 变化 (0.5 → 1.5)
- **DOF**：聚焦中心距离，bokeh scale 随 phase
- **Vignette**：轻微暗角，增加电影感

---

## 色彩系统

```
--color-space-deep:    #0a0a1a    (背景)
--color-space-mid:     #1a1a3e    (星空)
--color-gold:          #d4af37    (主色调-香槟金)
--color-gold-light:    #f5e6a3    (高亮金)
--color-cream:         #fff8e7    (奶油白-文字)
--color-glass-bg:      rgba(255,255,255,0.06)  (卡片背景)
--color-glass-border:  rgba(255,215,0,0.4)     (卡片边框)
```

---

## UI 层设计

### HUD Overlay (固定在 Canvas 上层)

- **顶部**：婚礼标题 "Wedding Lucky Draw" + 当前轮次
- **底部**：状态栏（已抽奖人数 / 总人数）+ 快捷键提示
- **中奖面板**：Framer Motion 动画弹入，显示中奖号码 + 祝福语

### 控制面板 (可收起)

- 号码导入：支持输入范围（如 "1-200" 自动生成 NO.001~NO.200）
- 号码格式：统一补零为 3 位（001, 052, 188）
- 查看已中奖列表
- 重置功能（清除所有中奖记录，保留号码列表）
- 主题色设置（预留）

---

## 数据模型

```typescript
type Guest = {
  id: number
  code: string       // "001", "052", "188" etc.
  hasWon: boolean
  wonAtRound?: number
}

type LotteryPhase = 'idle' | 'spinning' | 'chasing' | 'locking' | 'revealed'

type LotteryStore = {
  // State
  phase: LotteryPhase
  guests: Guest[]
  winners: Guest[]
  currentRound: number
  currentWinner: Guest | null

  // Actions
  setPhase: (phase: LotteryPhase) => void
  addGuests: (codes: string[]) => void
  startDraw: () => void
  selectWinner: () => Guest
  confirmWinner: () => void
  nextRound: () => void
  reset: () => void
}
```

---

## 动画时间轴详细设计

```
GSAP Master Timeline (~10s total):

[0s - 2s] SPINNING
  - cards: rotation speed × 4, orbital radius shrink
  - particles: emission rate × 2, speed × 1.5
  - bloom: intensity 0.5 → 1.0
  - camera: dolly in from distance 30 → 20

[2s - 6s] CHASING
  - camera: fly-through path visiting 4-6 random card positions
  - each "visit": 0.5-0.8s, ease: power2.inOut
  - visited cards: brief glow pulse
  - DOF: focus shifts to each visited card
  - motion blur feel: slight camera rotation lag

[6s - 8s] LOCKING
  - winner card: GSAP to position (0, 0, 5), scale 1.5, face camera
  - other cards: scatter outward, opacity → 0.2
  - bloom: intensity → 2.0
  - particle burst: 50-100 gold particles from center
  - camera: smooth move to (0, 0, 10), lookAt center

[8s - 10s] REVEALED
  - UI panel: Framer Motion spring animation in
  - heart particles emit
  - winner card: gentle float + glow pulse
  - ambient: return to calm with enhanced glow
```

---

## 性能策略

| 策略 | 实现 |
|------|------|
| 避免 React rerender | 动画全部在 useFrame/GSAP 中，不触发 setState |
| 文字纹理缓存 | Canvas Texture 预生成，复用 |
| 粒子优化 | Points geometry (单 draw call) |
| 条件渲染 | 距离相机过远的卡片降低更新频率 |
| 后期处理 | 使用 half-resolution bloom |

---

## 目录结构

```
src/
├── main.tsx
├── App.tsx
├── store/
│   └── useLotteryStore.ts
├── scenes/
│   ├── LotteryScene.tsx
│   ├── Environment.tsx
│   ├── CardField.tsx
│   └── CameraRig.tsx
├── components/
│   ├── three/
│   │   ├── Card.tsx
│   │   ├── CardText.tsx
│   │   ├── StarField.tsx
│   │   ├── GoldParticles.tsx
│   │   └── HeartParticles.tsx
│   └── ui/
│       ├── HUD.tsx
│       ├── WinnerReveal.tsx
│       ├── StatusBar.tsx
│       ├── ControlPanel.tsx
│       └── SettingsModal.tsx
├── animations/
│   ├── lotteryTimeline.ts
│   ├── cardAnimations.ts
│   └── cameraAnimations.ts
├── effects/
│   └── PostProcessing.tsx
├── hooks/
│   ├── useKeyboard.ts
│   ├── useFullscreen.ts
│   └── useLotteryFlow.ts
├── utils/
│   ├── random.ts
│   ├── distributions.ts
│   └── constants.ts
└── types/
    └── index.ts
```

---

## MVP 开发阶段

### Phase 1: 基础骨架
- Vite + React + TypeScript 初始化
- TailwindCSS 配置
- R3F Canvas 基础搭建
- Zustand store + 类型定义
- Git 初始化

### Phase 2: 3D 场景 — 卡片 + 环境
- Card 组件 (几何体 + 材质 + Canvas Texture 文字)
- CardField 球形分布算法
- 待机漂浮动画 (useFrame)
- StarField + GoldParticles
- 基础 Bloom 后期

### Phase 3: 抽奖核心动画
- GSAP Master Timeline 构建
- CameraRig 运镜逻辑
- 卡片加速 → 追逐 → 锁定 → 散开
- 粒子爆发效果
- 状态机流转完整连通

### Phase 4: UI + 控制系统
- HUD overlay + StatusBar
- WinnerReveal 面板 (Framer Motion)
- 快捷键系统 (useKeyboard)
- ControlPanel (号码导入/管理)
- 全屏模式

### Phase 5: 效果打磨
- DOF 景深
- 爱心粒子
- 动画 easing 精调
- 卡片呼吸发光
- 性能测试和优化
- 边界情况处理

---

## 验证方案

1. **启动验证**：`pnpm dev` 启动后浏览器看到 3D 星空 + 漂浮卡片
2. **交互验证**：按 Space 触发完整抽奖流程，动画流畅无卡顿
3. **性能验证**：300 张卡片场景，Chrome DevTools Performance 面板确认 60fps
4. **功能验证**：多轮抽奖不重复，已中奖排除正确
5. **全屏验证**：F 键进入全屏，大屏比例正常
