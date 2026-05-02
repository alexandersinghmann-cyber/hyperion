# [NAME TBD] — Strength Coaching System

**A Telegram bot that tracks your training in real time and coaches you toward the 1000 lb club.**
Companion to Scipio. Same Mac Mini. Same stack. Different mission.

---

## Name Options

| Name | Who | Why it fits |
|------|-----|-------------|
| **Marcus** | Marcus Aurelius — Stoic emperor | Discipline, daily practice, self-mastery. The Meditations is a training log for the mind. |
| **Titus** | Titus Flavius — "the delight of mankind" | Short, punchy, beloved. Built the Colosseum — the original arena. |
| **Cato** | Cato the Elder — relentless senator | Single-minded pursuit. "Carthago delenda est" energy. Won't stop until the goal is hit. |
| **Trajan** | Trajan — Optimus Princeps | "The best ruler." Rome at its peak. Associated with excellence and maximum performance. |

Recommendation: **Cato** or **Marcus**. Cato has the edge — it's less common, shorter to type, and the personality fits (relentless, no-nonsense, results-focused). Marcus is the safer choice if you want gravitas.

---

## What It Does (and Doesn't)

**Does:**
- Tracks every set in real time via Telegram — one tap to confirm, type only when deviating
- Gives immediate feedback after each exercise (rules-based, no latency)
- Manages warmups, extra sets, skipped exercises, and pain flags
- Runs rest timers between sets
- Makes progression decisions automatically (double progression logic)
- Generates session summaries and weekly reports
- Stores all history in Airtable for trend analysis
- Accepts program updates pushed from Cowork sessions

**Doesn't:**
- Replace program design (that stays in Cowork)
- Call an LLM mid-session (too slow, too expensive, unnecessary)
- Track nutrition (until core training is proven solid — V2)
- Plan meals, count macros, or give diet advice (V2)
- Work for anyone but you

---

## Architecture

```
~/[botname]/
├── config/
│   ├── settings.py           # Env loader, typed config
│   └── .env                  # API keys
├── src/
│   ├── bot/
│   │   ├── handlers.py       # Telegram command + callback handlers
│   │   ├── keyboards.py      # Inline keyboard builders
│   │   ├── session.py        # Active session state machine
│   │   └── formatters.py     # Message templates
│   ├── engine/
│   │   ├── progression.py    # Double progression logic
│   │   ├── program.py        # Load/read program from Airtable
│   │   └── injury.py         # Shoulder protocol rules
│   ├── data/
│   │   ├── airtable.py       # Single data layer — all reads/writes
│   │   └── models.py         # Dataclasses: Session, Exercise, Set
│   ├── reports/
│   │   └── weekly.py         # Weekly digest builder
│   └── utils/
│       ├── logger.py
│       └── helpers.py
├── data/
│   └── logs/
├── scripts/
│   └── run.py                # Entry point
└── tests/
```

### Design Principles

1. **Airtable is the single source of truth.** No SQLite, no JSON files. If Airtable is down, the bot queues writes and retries. Simple.
2. **No LLM calls during sessions.** All mid-session logic is deterministic Python. Claude is only used for weekly digests and when the Cowork session pushes program updates.
3. **One-tap is the default.** Every set should be loggable in one tap. Typing is the exception, not the rule.
4. **Session state survives disconnection.** Active session is persisted to Airtable immediately on each set. Phone dies → reopen Telegram → `/resume` picks up where you left off.
5. **The bot is the tracker. Cowork is the brain.** Program design, strategic changes, and complex coaching decisions happen in Cowork. The bot executes faithfully.

### Tech Stack

| Component | Choice | Reason |
|-----------|--------|--------|
| Interface | python-telegram-bot (async) | Same as Scipio |
| Data | Airtable (single base) | Structured, queryable, human-readable |
| Logic | Python 3.11 | Same as Scipio |
| Scheduling | cron (Mac Mini) | Weekly digest Sunday evening |
| AI | Claude API | Weekly digest only, not mid-session |
| Hosting | Mac Mini (same as Scipio) | Already running 24/7 |

---

## Airtable Schema

**One base: [BotName] Training**

### Table: Program

Stores the active training block. Updated when Cowork pushes a new program.

| Field | Type | Example |
|-------|------|---------|
| Day Number | Number | 1 |
| Day Label | Text | "Squat Heavy" |
| Day Of Week | Text | "Saturday" |
| Exercise Order | Number | 1 |
| Exercise Name | Text | "Back Squat" |
| Sets | Number | 4 |
| Rep Range | Text | "5" or "8-10" |
| Load | Text | "92.5 kg" |
| Load (kg) | Number | 92.5 |
| Target Note | Text | "4×5 clean → 95 kg" |
| Tags | Multi-select | Shoulder / Rehab / Core |
| Active | Checkbox | ✓ |

One row per exercise per day. A 6-day block with ~6 exercises each = ~36 rows. Clean, small, readable.

### Table: Sessions

One row per completed session.

| Field | Type | Example |
|-------|------|---------|
| Date | Date | 2026-04-11 |
| Day Label | Text | "Squat Heavy" |
| Block | Text | "Apr 11-16" |
| Duration (min) | Number | 58 |
| Session RPE | Number | 7 |
| Status | Select | Complete / Partial / Skipped |
| Sets JSON | Long text | (structured JSON of all sets) |
| Summary | Long text | Auto-generated session summary |
| Notes | Long text | User notes |

**Sets JSON format** (stored inside Sessions, not as separate rows):
```json
[
  {
    "exercise": "Back Squat",
    "sets": [
      {"type": "warmup", "weight": 60, "reps": 5},
      {"type": "warmup", "weight": 80, "reps": 3},
      {"type": "working", "weight": 92.5, "reps": 5, "rpe": null},
      {"type": "working", "weight": 92.5, "reps": 5, "rpe": null},
      {"type": "working", "weight": 92.5, "reps": 5, "rpe": null},
      {"type": "working", "weight": 92.5, "reps": 5, "rpe": 8}
    ],
    "notes": "",
    "prescribed": {"sets": 4, "reps": "5", "load": 92.5}
  }
]
```

This keeps all set data in one row. No table explosion. Easy to query by date. Easy to export.

### Table: Exercise Log

Running record of best performances per exercise (auto-updated after each session).

| Field | Type | Example |
|-------|------|---------|
| Exercise | Text | "Back Squat" |
| Current Working Weight | Number | 92.5 |
| Best Weight × Reps | Text | "92.5 × 5" |
| Estimated 1RM | Number | 107 |
| Last Performed | Date | 2026-04-11 |
| Trend | Select | Progressing / Holding / Regressing |
| Injury Flag | Checkbox | ☐ |

~15-20 rows total. Updated automatically, never manually.

---

## Telegram Commands

**Daily use (memorise these):**

| Command | What it does |
|---------|-------------|
| `/go` | Start today's session |
| `/done` | End session, get summary |
| `/next` | Preview next session |
| `/status` | Big 3 totals + gap to 1000 lb |

**Occasional use (discoverable via /help):**

| Command | What it does |
|---------|-------------|
| `/resume` | Resume interrupted session |
| `/skip` | Skip current exercise |
| `/swap [exercise]` | Replace current exercise (suggests alternatives) |
| `/shoulder [1-5]` | Log shoulder status |
| `/help` | Show commands |

Everything else is handled by **buttons** or **natural language**.

---

## Session Flow (the core UX)

### 1. Start

User: `/go`

Bot:
```
━━━━━━━━━━━━━━━━━━━━━━
  DAY 1 — SQUAT HEAVY
  Saturday · ~60 min
━━━━━━━━━━━━━━━━━━━━━━

  1  Back Squat        4×5 @ 92.5 kg
  2  Leg Press         3×10-12 @ 380 lb
  3  DB RDL            3×8-10 @ 30 kg
  4  Hamstring Curl    3×10-12 @ 36 kg
  5  Calf Raise        3×12-15 @ 90 lb
  6  Pallof Press      2×12/s @ 35 lb

  [▶ Start Session]
```

### 2. Exercise Active

User taps `[▶ Start Session]`

Bot:
```
━━ BACK SQUAT ━━━━━━━━
  Prescribed: 4×5 @ 92.5 kg
  Target: 4×5 clean → 95 kg

  Set 1 of 4
  ┌─────────────────────┐
  │  [92.5 × 5  ✓]      │  ← one tap
  │  [Warmup]  [Custom]  │
  └─────────────────────┘
```

**One tap to confirm the prescribed set.** That's the whole point.

### 3. Set Logged

User taps `[92.5 × 5 ✓]`

Bot:
```
  ✓ Set 1: 92.5 kg × 5

  Set 2 of 4  ·  Rest: 2:30
  ┌─────────────────────┐
  │  [92.5 × 5  ✓]      │
  │  [Warmup]  [Custom]  │
  └─────────────────────┘
```

Rest timer counts down. Notification at 0:00.

**If user taps [Custom]:**
```
  Enter weight × reps:
  (e.g. "90 x 5" or "92.5 x 3")
```

**If user taps [Warmup]:**
```
  Enter warmup weight × reps:
  (e.g. "60 x 5")
```
Warmup logged, then back to working set prompt.

### 4. Exercise Complete

After set 4:
```
  ✓ BACK SQUAT — COMPLETE
  4 × 5 @ 92.5 kg — all sets hit

  → Move to 95 kg next heavy day

  ┌─────────────────────┐
  │  [▶ Leg Press]       │
  │  [Add Note]  [Skip]  │
  └─────────────────────┘
```

Progression decision is immediate — no API call. Pure logic:
- All sets hit top of range → increase
- 1-2 reps short on last set → hold
- Missed by 3+ → flag

### 5. Performance Drop (coaching trigger)

User logs 92.5 × 3 on set 4 (target was 5):

```
  ⚠ Set 4: 92.5 kg × 3 — missed by 2

  ┌─────────────────────┐
  │  [Rest 3 min, retry] │
  │  [Drop to 85 × 5]   │
  │  [Move on]           │
  └─────────────────────┘
```

All options are pre-computed buttons. No typing. No waiting for AI.

### 6. Pain Flag

User taps `[Add Note]` on DB Incline Bench and types "shoulder twinge":

```
  ⚠ SHOULDER — pain reported

  Per your rules:
  • Sharp → stop exercise immediately
  • Mild → drop 10-20%, reduce ROM

  ┌─────────────────────┐
  │  [Sharp — stop]      │
  │  [Mild — reduce]     │
  │  [Fine — continue]   │
  └─────────────────────┘
```

If "Sharp — stop": exercise is skipped, logged as stopped-for-pain, and the shoulder flag is recorded for the weekly report.

### 7. Session Complete

User: `/done` (or after last exercise)

```
━━━━━━━━━━━━━━━━━━━━━━
  SESSION COMPLETE
  Squat Heavy · 58 min
━━━━━━━━━━━━━━━━━━━━━━

  ✓ Back Squat      4×5 @ 92.5    → 95 kg ↑
  ✓ Leg Press       12,12,11 @ 380 → hold
  ✓ DB RDL          10,10,9 @ 30   → hold
  ✓ Ham Curl        12,11,10 @ 36  → hold
  ✓ Calf Raise      15,14,13 @ 90  → hold
  ✓ Pallof Press    12,12 @ 35     → hold

  Session RPE?
  [5] [6] [7] [8] [9]

━━━━━━━━━━━━━━━━━━━━━━
  NEXT: Upper A (Pull Heavy)
  Tomorrow · ~65 min
━━━━━━━━━━━━━━━━━━━━━━
```

Saved to Airtable. Progression decisions recorded. Done.

---

## Progression Engine

Deterministic. No AI. Runs after each exercise completes.

```
RULES:

1. DOUBLE PROGRESSION
   All sets hit top of rep range → INCREASE LOAD
   - Compounds: +2.5 kg
   - Isolation: +1 kg or next available increment
   
   All sets hit bottom of range → HOLD (still progressing)
   
   Any set misses bottom of range by 1-2 → HOLD + flag
   
   Any set misses by 3+ → flag for review in weekly digest

2. SESSION COMPARISON
   Volume down >10% vs same session last week → FATIGUE FLAG
   → Weekly digest suggests deload consideration

3. INJURY OVERRIDE
   Any shoulder pain event → freeze pressing loads
   No pain for 2 consecutive sessions → allow +1 kg attempt

4. STALL DETECTION
   Same weight × same reps for 3+ consecutive sessions → STALL
   → Weekly digest suggests change (more volume, different rep range, etc.)
```

---

## Weekly Digest (Sunday evening, Claude-generated)

This is the ONE place Claude API is used. Cron job collects the week's data from Airtable and sends it through Claude to generate a coaching summary.

```
━━━━━━━━━━━━━━━━━━━━━━
  WEEKLY REPORT
  Week of Apr 6-12
━━━━━━━━━━━━━━━━━━━━━━

  SESSIONS: 6/6 ✓
  VOLUME: 127 sets · 14,280 kg

  BIG 3:
  Squat     92.5 → 95 kg ↑   Est 1RM: 110 kg
  Deadlift  110 kg (stable)   Est 1RM: 127 kg
  Bench     rehab (22 kg)     —
  ─────────────────────────
  Est Total: ~720 lb (+10)
  Gap to 1000: ~280 lb

  SHOULDER: 0 pain events ✓
  CORE: 19 sets (target met)

  COACH NOTES:
  [Claude-generated analysis: 2-3 sentences
   on what went well, what to watch,
   and priority for next week]

━━━━━━━━━━━━━━━━━━━━━━
```

---

## Cowork → Bot Handoff

When I design a new training block in Cowork, the handoff works like this:

1. **Cowork** generates the program and saves it to Airtable's Program table (I can write directly to Airtable via API, or export a structured format you paste in)
2. **Bot** reads the Program table at the start of each session (`/go` pulls today's exercises)
3. **No manual sync.** Update Airtable → bot picks it up automatically.

If Airtable isn't connected to Cowork yet, fallback: I generate a JSON block, you send it to the bot via Telegram (`/load`), and the bot writes it to Airtable.

---

## Offline / Disconnection Handling

- **Session state writes to Airtable after every set.** If your phone dies after set 3, sets 1-3 are saved.
- **`/resume` loads the last incomplete session** and picks up at the next unlogged exercise.
- **If Airtable is unreachable**, sets are queued in memory and flushed when connection returns. Bot continues working — logging is never blocked.
- **Telegram is the weak point.** If you lose signal entirely, nothing works. But Telegram handles intermittent connectivity well — messages queue and deliver when signal returns.

---

## What's NOT in V1

- Nutrition logging (V2 — simple cal/protein only)
- Body weight tracking (V2)
- Exercise substitution engine (V2)
- Deload auto-programming (V2 — flagged in V1, decided in Cowork)
- Multi-user support (probably never)
- Web dashboard (Airtable IS the dashboard)

---

## API Keys Required

| Service | Purpose | New? |
|---------|---------|------|
| Telegram Bot | Interface | NEW bot via @BotFather |
| Airtable | Data | NEW base, same account as Scipio |
| Anthropic Claude | Weekly digest only | Share with Scipio |

That's it. Three services.

---

## Build Order

| Step | What | Effort |
|------|------|--------|
| 1 | Airtable base + schema | 30 min |
| 2 | Bot skeleton — /go, /done, /next, /status | 2-3 hrs |
| 3 | Session flow — inline keyboards, set logging, rest timer | 3-4 hrs |
| 4 | Progression engine | 1-2 hrs |
| 5 | Session persistence + /resume | 1 hr |
| 6 | Weekly digest (Claude API) | 2 hrs |
| 7 | Shoulder/injury tracking | 1 hr |
| 8 | Cowork → Airtable push | 1 hr |
| **Total** | | **~12 hrs** |

Build steps 1-4 first. That gives you a working bot. Steps 5-8 are refinements you add after the first week of real use.

---

## Success Criteria

After one week of use:
- [ ] Every session logged without opening a notes app
- [ ] Average <2 taps per set logged
- [ ] Progression decisions happening automatically
- [ ] Zero missed data from disconnection
- [ ] Weekly digest delivered Sunday with accurate numbers
