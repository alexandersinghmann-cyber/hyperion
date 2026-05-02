# Point 3 — Scope Doc

Five feature requests surfaced in your 2026-04-18 session notes. Scoped independently so each can be built or deferred on its own. Effort estimates: **S** ≈ 15 min, **M** ≈ 45 min, **L** ≈ 2 hr in build-and-test terms.

---

## 1. Abs (core) in every session

**What you said:** *"I want an abs exercise in every session going forward."*

**Current state:** Only 3 of 4 program days have a core exercise in the main block:
- D1 Upper A: none (you added Cable Crunch mid-session as ad-hoc)
- D2 Squat Heavy: Pallof Press
- D3 Deadlift Heavy: Cable Crunch
- D4 Upper B: none

**Options:**

**Option A — Hard program rule.** Add a core slot to every day in `DEF_PROGRAM`. Cost: the core slot repeats across upper days so pool balance may get lopsided; also pins my hand on load/reps for each day.

**Option B — Soft reminder.** On `endSession`, if no core exercise was logged, nudge: *"No core logged today — add one now?"* with a 1-tap insert from the Core pool of Extras. Keeps program flexible, surfaces the requirement only if forgotten.

**Option C — "Sticky" Extras default.** When opening Extras mid-session and no core has been logged, auto-focus the Core tab regardless of the recommendation engine's default. Zero friction, doesn't enforce the rule but strongly nudges.

**My recommendation: A + C combined.** Add a lightweight core exercise to each day's main block (Pallof Press on upper days, Hanging Knee Raise on upper + light days, Cable Crunch where it already exists). Plus sticky Core default in Extras on days core hasn't been logged. Option B feels like a nag; you already see the session summary.

**Concrete additions to program:**
- D1 Upper A: add Pallof Press 2×12 @ 15.9 kg (cat: core) at end of main block
- D4 Upper B: add Hanging Knee Raise 3×10 bw (cat: core) at end of main block

**Effort:** S. Program schema edit + auto-pick Core tab if `todayCoreCount===0`. One new assertion in smoke test.

---

## 2. Dropdown exercise picker when adding

**What you said:** *"Should be a drop down for exercise select when adding exercises."*

**Current state:** `addExMidSession` opens a free-text modal (`aName` input). You have to type the exercise name from scratch every time, risking typos that break history matching ("Seated row" vs "Seated Row" vs "Cable Low Row").

**What to build:**
Replace the free-text Name field with a searchable dropdown that pulls from three sources, in priority order:
1. **Extras Library (46 entries)** — full metadata pre-filled
2. **Program exercises from any day** — deduplicated by name
3. **Historical session exercise names** — dedup'd

Pick one → auto-fill sets, reps, load, unit, category. Fall back to free-text entry with "Add as new" if nothing matches.

**UX pattern:** native `<datalist>` for simplicity (works on mobile, no dep), or a lightweight custom typeahead. Since the corpus is ~60 names, native `<datalist>` is fine.

**Payoff:** The "+ Custom Exercise" button becomes a fallback, not the default. Most additions flow through Extras (with recommendation) or this picker (exact match to history).

**Effort:** M. Touches `addExMidSession`, adds a unified `getAllExerciseNames()` helper, new modal markup. Smoke test: exact-match prefill returns correct cat+load.

---

## 3. Superset support

**What you said:** *"No ability superset."*

**Current state:** Exercises are a flat list. Rest timer runs per exercise. No grouping.

**Design question:** What does "superset" mean in your workflow?
- **A1:** Two exercises back-to-back with no rest, then rest after the pair (classic bodybuilding superset).
- **A2:** Alternating A/B sets with normal rest between each (strength-style "supersetting for density").
- **A3:** Just a visual grouping in the UI ("these are done together") with no change to rest-timer logic.

**Data model:**
Add an optional `supersetId: string` field on each exercise. Exercises sharing the same `supersetId` render as a grouped card. Rest timer behavior depends on A1/A2/A3 chosen.

**UI:**
- In the exercise menu (`⋯`), add "Pair with next" → links current exercise to the one below it by auto-generated `supersetId`.
- Grouped exercises render inside a single bordered card with a `◁ Superset ▷` label.
- For A1 (no inter-exercise rest): logging set N of exercise 1 moves focus to set N of exercise 2 without starting a rest timer; rest triggers only after set N of exercise 2.

**Effort:** L. Data model is easy; the interaction model is the real work, especially the rest-timer branching. Also affects `endSession` / history rendering / pain-flag display.

**My recommendation: defer.** This is the biggest single item in the doc. Wait until you've used Extras + the abs fix for 2 weeks, then tell me whether "visual grouping only" (A3) is enough or you actually want the timer-linked version (A1). A3 is maybe M effort; A1 is L.

---

## 4. Bonus pool → Extras Library replacement

**What you said:** *"Extra credit gives me more close grip lat pulldowns to do."* (Implied: the program-defined bonus list on D1 Upper A duplicated work you'd already done in the main block, since main Lat Pulldown was already narrow-grip.)

**Current state:** Each day has a `bonus: [...]` array in `DEF_PROGRAM`. The Train view's "Extra Credit · N available" section surfaces them. Extras Library (just built) is the new, smarter surface.

**Options:**

**Option A — Full replacement.** Delete `bonus:[...]` from all 4 program days. Delete `activateBonus()` and the "Extra Credit" section in `renderEx()`. Extras Library becomes the only source. Net code simplification.

**Option B — Keep both.** Program bonuses are day-specific (D1 had Close-Grip Lat Pulldown because you're running heavy pull day); Extras is generic. They coexist. Risk: two entry points for the same thing, which is exactly what makes the current bonus UI feel redundant.

**Option C — Merge.** At render time, append program bonuses (if any, for today's day) into the appropriate Extras pool as extra cards, tagged `[program]`. Then delete the separate "Extra Credit" section. Extras becomes the single surface but program-specific bonuses still get priority visibility.

**My recommendation: C.** Minor effort, preserves the program author's intent (if future blocks specify day-specific bonuses, they still surface), but the UI is unified and the user only has to think about one "add something" workflow.

**Effort:** S-to-M. In `openExtras()`, merge `day.bonus` entries into `scored` with a synthetic shoulder/carryover score and a `reasons:['Program bonus for today']` tag. Remove the old bonus section from `renderEx()`.

---

## 5. Exercise renaming / canonical names

**What you said:** *"Seated row was a low row (cable)."* and *"Lay pulldowns were narrow grip already"* (implying the program exercise name didn't match what you actually did).

**Current state:** Program exercise names are free-form strings. A rename is a JSON edit, but historical sessions keep the old name → breaks e1RM trend continuity (the sparkline relies on exact name match).

**What to build:**

**Option A — Canonical + display names.** Add `canonical: string` field. The canonical key is used for history/trend lookups; the display name can change day-to-day. Migration: backfill `canonical = current name` for existing sessions.

**Option B — Rename-with-backfill.** Add a "Rename this exercise" action that updates the program name AND walks through all historical sessions to rename matches. One-shot cleanup, no permanent schema change.

**Option C — Aliases.** Maintain an `aliases: { 'Seated Row': ['Cable Low Row', 'Low Row'] }` map. Renaming doesn't rewrite history; the e1RM function treats aliases as the same exercise.

**My recommendation:** Combine B for the current mismatch + C for future resilience. Run B once to clean up "Seated Row" → "Cable Low Row" in program + history. Add C as the standing mechanism so future renames don't need to touch data.

**Specific renames you flagged today:**
- `Seated Row` → `Cable Low Row` (in D1, D4, and all matching session history)
- `Lat Pulldown` → `Lat Pulldown (narrow)` (ambiguity flagged — optional)

**Effort:** M for B (history walker + confirm modal). S for C once data model is updated.

---

## Suggested build order

This is the order I'd recommend, each stage shippable on its own:

1. **Stage A (S, ~30 min):** Abs-every-session rule (option 1-A+C) + Core-tab sticky default. Program JSON additions + auto-pick logic. *Biggest behaviour change for your actual training quality.*

2. **Stage B (S–M, ~45 min):** Bonus → Extras merge (option 4-C). Unifies the UI into one surface. Cleans up the redundancy you complained about today.

3. **Stage C (M, ~60 min):** Dropdown exercise picker (option 2). Replaces free-text input with typeahead over Extras + program + history names.

4. **Stage D (M, ~45 min):** Exercise rename (option 5-B for the Seated Row/Cable Low Row fix + option 5-C alias map). Clean up the name mismatch without breaking trend history.

5. **Stage E (L, 2+ hr, DEFER):** Superset support (option 3). Decide A1 vs A3 first. I'd wait 2 weeks of real use to see whether you actually want it.

Total for A–D: ~3 hr. Matches the size of the Extras Library build we just shipped. Then Extras + Stage A–D together cover every single note you wrote today except superset.

---

## Open questions for you

1. **Abs rule:** are you OK with me adding Pallof Press to D1 and Hanging Knee Raise to D4 in the main block, or would you rather every core exercise be opt-in through Extras?
2. **Superset semantic:** A1 (timer-linked), A2 (alternating with normal rest), or A3 (visual only)? Answer decides build size from M to L.
3. **Rename:** do you want me to proceed with the Seated Row → Cable Low Row cleanup, or was that just a one-off note?
