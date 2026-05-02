# HYPERION — Strength Coaching System

**The Titan of light and watchfulness. Sees everything. Misses nothing.**

A browser-based training companion that tracks every set, makes progression decisions, and coaches you toward the 1000 lb club. Designed for mobile use at the gym.

---

## Platform Strategy

**V1: Browser (PWA-ready HTML)**
- Single self-contained HTML file
- localStorage for persistence across sessions
- Works offline once loaded
- Add to home screen on iOS/Android for app-like experience
- Deploy to Netlify for a shareable URL

**V2 (future): Telegram Bot**
- Migrate when browser limitations become clear
- Push notifications, proactive coaching, natural language input
- Same Mac Mini infrastructure as Scipio
- Migration trigger: real friction points from V1 usage

---

## V1 Feature Set

### 1. Session Management
- Load today's session from the active program
- Navigate between exercises
- Track session duration
- Session RPE at completion
- Full session summary with progression decisions
- Session history (past sessions viewable)

### 2. Set Logging (one-tap core)
- Pre-filled buttons for prescribed weight × reps (one tap to confirm)
- Add warmup sets (inserted before working sets)
- Add extra working sets
- Custom weight/reps input when deviating
- Per-set RPE (optional, tap to add)
- Per-set notes

### 3. Rest Timer
- Auto-starts after each set is logged
- Configurable default rest (2:00 for compounds, 1:30 for isolation)
- Visual countdown
- Vibration/sound alert at 0:00 (if browser supports)
- Override: tap to start next set early

### 4. Progression Engine
- Runs after each exercise completes
- Double progression: reps first, then load
- Shows clear decision: ↑ increase / → hold / ↓ flag
- Decisions persisted and visible in session summary
- Stall detection (same weight × reps for 3+ sessions)

### 5. Program Management
- View full week's program
- Edit exercises on the fly (swap, add, remove, reorder)
- Modify prescribed weight/reps for any exercise
- Import new program (paste JSON from Cowork)
- Multiple training blocks (archive old, load new)

### 6. Shoulder / Pain Tracking
- Pain flag button available during any pressing exercise
- Severity selection: Sharp / Mild / None
- Auto-triggers protocol:
  - Sharp → stop exercise, suggest alternative
  - Mild → reduce load 10-20%
- Pain events logged and visible in weekly view

### 7. Progress Dashboard
- Big 3 estimated totals + gap to 1000 lb
- Per-exercise trend (progressing / holding / stalling)
- Session history with expandable detail
- Weekly volume summary
- Shoulder pain event timeline

---

## Data Model (localStorage)

```javascript
{
  program: {
    name: "Apr 11-16 Block",
    active: true,
    days: [
      {
        id: 1,
        label: "Squat Heavy",
        dayOfWeek: "Saturday",
        targetDuration: 60,
        exercises: [
          {
            id: "ex_1",
            name: "Back Squat",
            category: "squat",
            sets: 4,
            repRange: "5",
            loadKg: 92.5,
            target: "4×5 clean → 95 kg",
            tags: [],
            restSeconds: 150
          }
        ]
      }
    ]
  },
  
  exerciseLog: {
    "Back Squat": {
      currentWorkingWeight: 92.5,
      bestPerformance: "92.5 × 5",
      estimated1RM: 107,
      lastPerformed: "2026-04-11",
      trend: "progressing",
      injuryFlag: false,
      history: [
        { date: "2026-04-11", sets: [...], progression: "increase" }
      ]
    }
  },
  
  sessions: [
    {
      id: "s_20260411",
      date: "2026-04-11",
      dayLabel: "Squat Heavy",
      duration: 58,
      rpe: 7,
      status: "complete",
      exercises: [
        {
          name: "Back Squat",
          prescribed: { sets: 4, reps: "5", loadKg: 92.5 },
          performed: [
            { type: "warmup", weightKg: 60, reps: 5 },
            { type: "warmup", weightKg: 80, reps: 3 },
            { type: "working", weightKg: 92.5, reps: 5, rpe: null },
            { type: "working", weightKg: 92.5, reps: 5, rpe: null },
            { type: "working", weightKg: 92.5, reps: 5, rpe: null },
            { type: "working", weightKg: 92.5, reps: 5, rpe: 8 }
          ],
          notes: "",
          progression: "increase",
          nextLoad: 95
        }
      ],
      painEvents: []
    }
  ],
  
  settings: {
    defaultRestCompound: 150,
    defaultRestIsolation: 90,
    soundEnabled: true,
    theme: "dark"
  }
}
```

---

## UI Design

### Visual Language
- Dark theme (black/charcoal base)
- Bitcoin orange (#F7931A) as primary accent
- Green for completion/success
- Red for pain/warnings
- Purple for warmup sets
- Clean monospace numbers for weights
- Minimal text, maximum clarity

### Screen Flow

```
┌─────────────────────┐
│   HOME / DASHBOARD   │  ← landing screen
│  Big 3 totals        │
│  Today's session CTA │
│  Recent sessions     │
└──────────┬──────────┘
           │ tap "Start Session"
           ▼
┌─────────────────────┐
│   SESSION ACTIVE     │  ← gym screen
│  Exercise list       │
│  Current exercise    │
│  Set logging         │
│  Rest timer          │
└──────────┬──────────┘
           │ all exercises done or /done
           ▼
┌─────────────────────┐
│   SESSION SUMMARY    │  ← post-session
│  All exercises       │
│  Progression calls   │
│  Copy report         │
│  Next session        │
└──────────┬──────────┘
           │ tap "Program" tab
           ▼
┌─────────────────────┐
│   PROGRAM EDITOR     │  ← manage
│  View/edit exercises │
│  Import new block    │
│  Archive old blocks  │
└─────────────────────┘
```

### Navigation
Bottom tab bar (3 tabs):
1. **Today** — dashboard + start session
2. **History** — past sessions + progress
3. **Program** — view/edit training block

---

## Progression Rules (deterministic)

```
AFTER EACH EXERCISE:

1. Parse rep range (e.g., "8-10" → min=8, max=10; "5" → min=5, max=5)

2. Count working sets that hit >= max reps
   ALL hit max → INCREASE
   - Compounds (squat/dead/bench): +2.5 kg
   - Upper accessories: +2 kg  
   - Isolation: +1 kg
   
3. Count working sets below min reps
   ANY below (min - 2) → FLAG (possible fatigue/regression)
   
4. Otherwise → HOLD (still progressing within range)

5. Compare vs same exercise last session:
   Total reps down >15% → FATIGUE WARNING

6. Same weight × same reps for 3 consecutive sessions → STALL
   → Suggest: add a set, widen rep range, or flag for Cowork review

INJURY OVERRIDE:
- Pain event on exercise → freeze load for that exercise
- 2 consecutive pain-free sessions → unlock +1 increment attempt
```

---

## Session Report Format (for pasting to Cowork)

```
## ATLAS — Session Report
Day 1: Squat Heavy | Sat Apr 11 | 58 min | RPE 7

✅ Back Squat: 92.5×5 / 92.5×5 / 92.5×5 / 92.5×5 → ↑ 95 kg
   Warmup: 60×5, 80×3
✅ Leg Press: 380×12 / 380×12 / 380×11 → hold
✅ DB RDL: 30×10 / 30×10 / 30×9 → hold
✅ Ham Curl: 36×12 / 36×11 / 36×10 → hold
✅ Calf Raise: 90×15 / 90×14 / 90×13 → hold
✅ Pallof Press: 35×12 / 35×12 → hold

Shoulder: no events
```

---

## Build Checklist

- [ ] Data layer (localStorage read/write/migrate)
- [ ] Program loader (current Apr 11-16 block pre-loaded)
- [ ] Home screen (big 3 totals, today's session, recent)
- [ ] Session flow (exercise nav, set logging, one-tap confirm)
- [ ] Rest timer (countdown, vibrate/sound)
- [ ] Progression engine (auto-decisions after each exercise)
- [ ] Warmup/extra set support
- [ ] Pain tracking (flag button, severity, protocol)
- [ ] Session summary (with copy-to-clipboard report)
- [ ] Session history (past sessions, expandable)
- [ ] Program editor (swap, add, remove, edit loads)
- [ ] Import program (paste JSON)
- [ ] Progress dashboard (trends, 1RM estimates, 1000 lb gap)
- [ ] Bottom tab navigation
- [ ] PWA manifest (add-to-home-screen)
- [ ] Responsive mobile-first design
- [ ] Bitcoin orange dark theme
