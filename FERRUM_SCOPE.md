# FERRUM — Strength Intelligence System

**Latin: ferrum (n.) — iron**

A real-time strength coaching and tracking system, delivered via Telegram bot. Companion system to Scipio. Runs on the same Mac Mini infrastructure.

---

## Why "Ferrum"

Iron. What you lift, what you're forged by. In Roman culture, the Age of Iron (aetas ferrea) was the age of hard work and discipline — no shortcuts. Pairs naturally with Scipio: one system for the fund, one for the body. Both run 24/7, both learn from your data, both speak through Telegram.

Other names considered:
- **Fortis** (strong) — too generic
- **Robur** (oak/hardness) — good but obscure
- **Virtus** (strength + moral excellence) — overloaded meaning
- **Milo** (Milo of Croton, original progressive overload) — Greek, not Latin

Ferrum wins on precision and brevity.

---

## System Overview

Ferrum is a Telegram-first training companion that:

1. **Tracks** every set, rep, and load in real time during sessions
2. **Coaches** with immediate feedback — load adjustments, form cues, fatigue flags
3. **Programs** next sessions based on actual performance, not guesswork
4. **Monitors** injury status and recovery signals
5. **Reports** weekly progress toward the 1000 lb club
6. **(Future)** Logs nutrition and advises on fuelling

---

## Architecture (mirrors Scipio)

```
~/ferrum/
├── config/
│   ├── settings.py          # Env loader, typed config (dataclasses)
│   ├── .env                  # API keys
│   └── program.json          # Current training program (machine-readable)
├── src/
│   ├── telegram/
│   │   ├── bot.py            # Command handlers + conversation flows
│   │   ├── keyboards.py      # Inline keyboards for set logging
│   │   └── formatters.py     # Message formatting (tables, summaries)
│   ├── training/
│   │   ├── program.py        # Program state, exercise DB, session builder
│   │   ├── progression.py    # Double progression logic, load decisions
│   │   ├── coach.py          # AI coaching (Claude API) — feedback, cues
│   │   └── injury.py         # Shoulder tracking, pain logging, rehab rules
│   ├── tracking/
│   │   ├── airtable_client.py  # CRUD for workout logs
│   │   ├── metrics.py        # 1RM estimation, volume tracking, PRs
│   │   └── history.py        # Query past sessions, trend analysis
│   ├── nutrition/             # Phase 3
│   │   ├── logger.py         # Meal logging, macro parsing
│   │   └── targets.py        # Caloric/macro targets by phase
│   ├── digest/
│   │   └── weekly_report.py  # Weekly summary, progress charts
│   └── utils/
│       ├── logger.py
│       ├── database.py       # SQLite for session cache
│       └── helpers.py
├── data/
│   ├── cache/ferrum.db
│   └── logs/
├── scripts/
│   ├── run_bot.py
│   └── run_weekly_digest.py
└── tests/
```

### Tech Stack
| Component | Technology | Reason |
|-----------|-----------|--------|
| Interface | python-telegram-bot (async) | Same as Scipio, proven |
| Data store | Airtable | Structured, queryable, human-readable |
| Local cache | SQLite | Fast session state, offline resilience |
| AI engine | Claude API (Anthropic) | Coaching intelligence, NL parsing |
| Scheduling | cron (same Mac Mini) | Weekly digests, reminders |
| Language | Python 3.11+ | Same as Scipio |

### Airtable Schema

**Base: Ferrum Training**

Table: **Sessions**
| Field | Type | Purpose |
|-------|------|---------|
| Date | Date | Session date |
| Day Label | Text | "Squat Heavy", "Upper A", etc. |
| Block | Text | Training block reference |
| Duration (min) | Number | Actual session duration |
| Session RPE | Number (1-10) | Overall perceived exertion |
| Notes | Long text | General session notes |
| Status | Select | Complete / Partial / Skipped |

Table: **Sets**
| Field | Type | Purpose |
|-------|------|---------|
| Session | Link | Links to Sessions table |
| Exercise | Text | Exercise name |
| Set Number | Number | 1, 2, 3... |
| Set Type | Select | Warmup / Working / Drop / AMRAP |
| Weight (kg) | Number | Load used |
| Reps | Number | Reps completed |
| RPE | Number (1-10) | Per-set difficulty |
| Notes | Text | Pain flags, form notes |
| Prescribed Weight | Number | What was programmed |
| Prescribed Reps | Text | What was programmed |

Table: **Exercises**
| Field | Type | Purpose |
|-------|------|---------|
| Name | Text | Exercise name |
| Category | Select | Squat / Hinge / Push / Pull / Core / Isolation |
| Equipment | Multi-select | Barbell / DB / Cable / Machine / BW |
| Current Working Weight | Number | Latest working weight |
| Current Top Set | Number | Best recent performance |
| PR | Number | All-time best |
| Last Performed | Date | Recency tracking |
| Injury Flag | Checkbox | Currently limited by injury |

Table: **Body Metrics** (Phase 2+)
| Field | Type | Purpose |
|-------|------|---------|
| Date | Date | Measurement date |
| Body Weight (kg) | Number | Morning weight |
| Estimated Big 3 Total | Number | Squat + Bench + DL |
| Notes | Text | Sleep, stress, etc. |

---

## Phase 1: Core Training Bot

### Telegram Commands

```
/start          — Welcome + current program summary
/session        — Start today's session (loads prescribed workout)
/log            — Quick log: "/log squat 92.5 5" or natural language
/done           — End session, generate summary
/next           — Preview next session
/program        — View current week structure
/pr [exercise]  — Show PR history for exercise
/status         — Big 3 totals, distance to 1000 lb club
/shoulder       — Log shoulder status (pain scale + notes)
/help           — Command list
```

### Session Flow (the core UX)

This is the critical interaction. It must be faster than typing into a notes app.

**1. Start session**
User sends `/session` or "let's go"

Ferrum responds:
```
🔶 DAY 1 — SQUAT HEAVY
Saturday Apr 11 · ~60 min

1. Back Squat — 4×5 @ 92.5 kg
2. Leg Press — 3×10-12 @ 380 lb
3. DB RDL — 3×8-10 @ 30 kg/hand
4. Hamstring Curl — 3×10-12 @ 36 kg
5. Calf Raise — 3×12-15 @ 90 lb
6. Pallof Press — 2×12/side @ 35 lb

Ready when you are. Tap the exercise to begin.
```
→ Inline keyboard with exercise buttons

**2. Exercise active**
User taps "Back Squat"

Ferrum responds:
```
🏋️ BACK SQUAT
Prescribed: 4×5 @ 92.5 kg
Target: 4×5 clean → 95 kg next heavy day

Set 1 of 4 — enter weight × reps:
```
→ Quick-reply buttons: `[92.5 × 5]` `[Custom]` `[+ Warmup]`

**3. Set logging**
User taps `[92.5 × 5]` (one tap to confirm prescribed) or types "92.5 x 5" or just "done" (assumes prescribed).

Ferrum responds:
```
✓ Set 1: 92.5 kg × 5
Set 2 of 4 —
```
→ Same quick-reply buttons

If user adds a warmup: taps `[+ Warmup]`, enters "60 x 5"
```
✓ Warmup: 60 kg × 5
Set 1 of 4 —
```

**4. Exercise complete**
After all sets:
```
✓ Back Squat complete: 4×5 @ 92.5 kg
All sets hit target. → 95 kg next heavy day.

Next: Leg Press — 3×10-12 @ 380 lb
```
→ Inline keyboard: `[Start Leg Press]` `[Skip]` `[Add Note]`

**5. Mid-session coaching triggers**
If performance drops (e.g., user logs 92.5 × 3 on set 4):
```
⚠️ Set 4: 92.5 kg × 3 (target was 5)
Missed by 2 reps. Possible fatigue.

Options:
→ [Rest 3 min & retry]
→ [Drop to 87.5 and finish]
→ [Move on — note fatigue]
```

If shoulder pain logged on incline bench:
```
🔴 Pain reported on DB Incline Bench.
Decision per rules:
- Sharp pain → STOP. Switching to cable fly (neutral).
- Mild discomfort → Drop to 18 kg, reduce ROM.

What are you feeling?
→ [Sharp — stop] [Mild — reduce] [It's fine — continue]
```

**6. Session complete**
User sends `/done`

Ferrum generates:
```
SESSION COMPLETE — Squat Heavy
Duration: 58 min | 19 sets | Session RPE: 7

✅ Back Squat: 4×5 @ 92.5 — all clean
✅ Leg Press: 12,12,11 @ 380 lb
✅ DB RDL: 10,10,9 @ 30 kg
✅ Hamstring Curl: 12,11,10 @ 36 kg
✅ Calf Raise: 15,14,13 @ 90 lb
✅ Pallof Press: 12,12 @ 35 lb

PROGRESSION DECISIONS:
→ Squat: move to 95 kg next heavy day ✓
→ Leg Press: hit 12s on 2/3 — hold at 380, fill reps
→ DB RDL: 1 rep short — stay at 30 kg

NEXT SESSION: Upper A (Pull Heavy) — Tomorrow
```

### Natural Language Support

Ferrum should understand casual input, not just commands:

| User says | Ferrum does |
|-----------|-------------|
| "squat 92.5 x 5" | Logs set for current exercise |
| "warmup 60 x 5" | Logs warmup set |
| "that was hard" or "RPE 9" | Tags set with RPE |
| "shoulder hurts" | Triggers pain protocol |
| "skip calf raise" | Marks exercise skipped |
| "add face pulls" | Adds ad-hoc exercise |
| "what's next" | Shows next exercise or session |
| "how's my squat going" | Shows squat trend + 1RM estimate |

### Progression Engine (rules-based, not AI)

The progression engine is deterministic — no hallucinated load changes:

```python
def evaluate_progression(exercise, recent_sets):
    """
    Double progression:
    1. If all sets hit top of rep range → increase load
    2. If any set misses by >2 reps → flag for review
    3. If >10% drop from last session → suggest deload
    """
    prescribed_reps = exercise.rep_range  # e.g., (8, 10)
    top_of_range = prescribed_reps[1]
    
    all_hit_top = all(s.reps >= top_of_range for s in recent_sets)
    any_big_miss = any(s.reps < prescribed_reps[0] - 2 for s in recent_sets)
    
    if all_hit_top:
        return ProgressionDecision.INCREASE_LOAD
    elif any_big_miss:
        return ProgressionDecision.REVIEW  # AI coach weighs in
    else:
        return ProgressionDecision.HOLD
```

AI (Claude) only intervenes for judgment calls: injury management, deload timing, exercise substitutions, weekly program adjustments.

---

## Phase 2: Intelligence Layer

### Weekly Digest (cron — Sunday evening)

```
📊 FERRUM WEEKLY REPORT — Week of Apr 6

SESSIONS: 6/6 complete
TOTAL VOLUME: 127 sets | 14,280 kg moved

BIG 3 STATUS:
  Squat:    92.5 kg × 5 → targeting 95 kg ↑
  Deadlift: 110 kg × 5 → stable, targeting 112.5 ↑
  Bench:    N/A (shoulder rehab, incline @ 22 kg)
  Est. Total: ~710 lb | Gap to 1000: ~290 lb

TRENDS:
  Squat frequency: 3×/week (new) — responding well
  Core volume: 19 sets — up from ~6 previously
  Shoulder: 0 pain events this week ✓

NEXT WEEK PRIORITIES:
  1. Test 95 kg squat on heavy day
  2. Push deadlift to 112.5 if 110×5 is clean
  3. Attempt 24 kg incline DB if shoulder stays clear
```

### 1RM Estimation + Timeline

Track estimated 1RMs over time using Epley formula. Project a realistic timeline to 1000 lb club based on rate of progression.

### Recovery Scoring

Simple self-reported metrics before each session:
- Sleep (1-5)
- Soreness (1-5)
- Motivation (1-5)

Ferrum uses this to flag if a session should be modified (e.g., swap heavy squat for medium if recovery score is low).

---

## Phase 3: Nutrition

### Meal Logging

Natural language via Telegram:
```
User: "lunch — chicken breast rice broccoli, ~650cal 50p 70c 15f"
User: "shake — protein powder banana milk, 350cal 35p 40c 8f"
User: "dinner out — estimate 800cal high protein"
```

Ferrum parses and logs to Airtable. Claude handles fuzzy inputs ("big bowl of pasta" → estimates macros).

### Daily Targets

Based on body weight, training phase, and goal (stay lean while gaining strength):
```
📊 TODAY'S NUTRITION
Target: 2,400 cal | 180p | 250c | 80f

Logged so far:
  Breakfast: 450 cal | 35p | 45c | 15f
  Lunch:     650 cal | 50p | 70c | 15f
  ─────────────────────────────────────
  Total:   1,100 cal | 85p | 115c | 30f
  Remaining: 1,300 cal | 95p | 135c | 50f

Training today: Squat Heavy → eat up.
```

---

## Phase 4: Advanced Features (Future)

- **Exercise substitution engine** — when hotel gym lacks equipment, auto-suggest alternatives maintaining movement intent
- **Deload auto-programming** — detect accumulated fatigue across 3-4 week blocks
- **Body composition tracking** — weight trends, lean mass estimates
- **Competition prep** — peaking protocols when targeting a 1RM test
- **Multi-user** — train partners or clients (probably a different product)

---

## Infrastructure

### Deployment (same Mac Mini as Scipio)

```bash
# Directory
mkdir -p ~/ferrum/{config,src/{telegram,training,tracking,nutrition,digest,utils},data/{cache,logs},scripts,tests}

# Cron jobs
# Weekly digest: Sunday 8pm
0 20 * * 0 cd ~/ferrum && source venv/bin/activate && python scripts/run_weekly_digest.py
# Bot: runs as persistent process via launchd or tmux
```

### API Keys Required
| Service | Purpose | New or shared with Scipio? |
|---------|---------|---------------------------|
| Telegram Bot | Interface | NEW (separate bot from Scipio) |
| Anthropic Claude API | Coaching intelligence | Can share key |
| Airtable | Data storage | NEW base, can share account |
| (Phase 3) Nutritionix API | Food database lookups | NEW |

### Security
- Bot only responds to `USER_TELEGRAM_CHAT_ID` (same pattern as Scipio)
- No sensitive data stored (just training numbers)
- .env file excluded from any version control

---

## Build Sequence

| Phase | What | Effort | Dependency |
|-------|------|--------|------------|
| 1a | Telegram bot skeleton + session flow | 3-4 hours | Telegram bot token |
| 1b | Airtable schema + client | 2 hours | Airtable account |
| 1c | Progression engine | 2 hours | None |
| 1d | AI coaching layer (Claude) | 2-3 hours | Anthropic API key |
| 2a | Weekly digest | 2 hours | Phase 1 complete |
| 2b | 1RM tracking + timeline | 1-2 hours | Phase 1 complete |
| 2c | Recovery scoring | 1 hour | Phase 1 complete |
| 3a | Nutrition logging | 3-4 hours | Phase 2 complete |
| 3b | Daily targets + tracking | 2-3 hours | Phase 3a complete |

**Total Phase 1: ~10 hours**
**Total through Phase 3: ~22 hours**

---

## What Ferrum is NOT

- Not a generic fitness app — it's YOUR coach, YOUR numbers, YOUR program
- Not a replacement for this Cowork session — Ferrum handles real-time tracking, Cowork handles program design and strategic decisions
- Not a nutrition app — it logs what you tell it and keeps you honest, it doesn't plan meals
- Not autonomous — progression is rules-based, AI only handles judgment calls
