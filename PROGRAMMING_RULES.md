# Hyperion Programming Rules

The rules the coach (Claude) references at every session-design step. Encoded here so they're applied consistently rather than pulled from memory. The in-app `validateSession()` function checks the same rules and surfaces warnings in the console on program save.

## Session ordering

**1. Pattern alternation.** Do not stack two exercises with the same movement pattern adjacent to each other. Interleave with the antagonist or a different plane.

- Bad: Cable Low Row → Lat Pulldown (hpull → vpull, both lat/bi dominant)
- Good: Cable Low Row → DB Incline Bench → Lat Pulldown (hpull → hpush → vpull)

**2. Antagonist rotation.** Pull/push/pull/push keeps each muscle group relatively fresh while its opposite works. Increases session density without compromising per-set quality.

**3. Compounds before isolation.** Heavy, CNS-demanding lifts go first. Isolation for the same muscle goes after. DB Curl before Bench Press is a bug; Bench before DB Curl is the rule.

**4. Fatigue buffer.** Exercises sharing 2+ prime movers need at least one unrelated lift between them. The validator flags shared primaries on adjacent exercises.

**5. Rehab and core placement.** At the end of the session, unless used as activation at the start. Never sandwich rehab between two heavy compounds.

**6. Same-pattern streak cap.** No more than 2 consecutive exercises of the same pattern (e.g., three pulls in a row). Validator warns at streak 3.

## Shoulder sequencing (user-specific)

**7. Press after activation.** Any lift tagged `shoulder_load = activation-first` must be preceded by a scap stabilizer or pull — Band Pull-Apart, Face Pull, Cable Low Row, Prone Y-Raise. Pressing cold is a known aggravator.

**8. Avoid overhead on flare days.** When the user reports a shoulder flare, swap overhead pressing for incline variants, and overhead cable tricep extension for pushdowns.

**9. Scap work gets volume priority.** External rotation, band pull-apart, face pull run every upper session — non-negotiable while the shoulder is on the injury list.

## Volume, intensity, recovery

**10. Big 3 first in the week.** Squat, bench, deadlift get the first bite of CNS every cycle. Accessories bend around them.

**11. Recovery between same-muscle hits.** 48–72h. Upper A (Sat) and Upper B (Mon) sit at 48h — A runs heavy/low-rep, B runs moderate/higher-rep to spread the stimulus.

**12. RPE cap by block phase.** Hypertrophy blocks cap at RPE 8. Strength blocks cap at RPE 9. Peak blocks allow RPE 9.5 on top singles; accessories stay RPE 8 to manage fatigue.

**13. Deload cadence.** Every 12–16 sessions, drop volume by ~40% and intensity by ~15% for one session-pair. Not on a calendar — on a session count.

## Time budget

**14. Sessions run 60–75 min.** Warmup 10 min, work sets the rest. If `estimateSessionTime()` returns >80, drop the lowest-priority accessory (usually the last iso or second rehab) until under 75.

**15. Superset eligible pairs.** Can chain two exercises if (a) no shared prime movers, (b) not both `heavy-compound`, (c) same equipment station or movable in <30s. Typical chains: DB Curl + Cable Tricep Extension; Lateral Raise + Face Pull; any iso + any rehab.

## Variation and rotation

**16. Main lifts stay fixed within a block.** Back Squat, Bench Press, Deadlift don't rotate. Progression needs a stable signal.

**17. Accessories rotate every 4 weeks (or every 14 sessions, whichever comes first).** The rotation engine walks through A→B→C→D variants per slot. Fresh stimulus, no staleness, no loss of measurability on the mains.

**18. Core work rotates per-session.** Low load, high adaptation tolerance — variety costs nothing and keeps it interesting.

## Equipment substitution

**19. Substitution preserves pattern, not exercise.** If Cable Low Row is unavailable, swap to DB Row or Chest-Supported DB Row — same `slot: hpull`. Don't swap to a vpull "because it's a pull."

**20. Substitution preserves load intent.** A 4×8-10 @ RPE 7 prescription carries to the substitute unchanged. The load adjusts (barbell row takes more load than chest-supported DB row) but sets/reps/RPE do not.

## Block structure

**21. Blocks measured in sessions, not weeks.** Variable-frequency weeks are the norm. "Block 2 = 14 sessions of hypertrophy-strength" reads correctly whether those 14 sessions span 3½ weeks or 5.

**22. Calibration before intensity.** Before committing to Block 3 intensities, test real 1RMs via top-single/double ramps in Block 2 weeks 2–3. Epley e1RM off working-set 5s under-predicts for trained lifters.

**23. Imbalance remediation is accessory work, not main work.** Unilateral DB RDL, Bulgarian Split Squat, single-arm rows, etc. go in the accessory slots. Main lifts stay bilateral.

## Emergency overrides

**24. Pain > program.** Any pain event above `mild` flags the progression engine to hold or deload, and the next session's prescription gets a manual review from the coach. No exceptions.

**25. Sleep < 6h for 2+ nights.** Cap session RPE at 7. This is coach judgment, not app-enforced — but it's a rule.

---

## How the validator enforces these

`validateSession(exList)` in hyperion.html runs rules 1, 3, 4, 6, 7, 14. Returns warning objects. The user overrides with a reason; the override is logged.

Rules 8–13, 15–25 live here as coach-enforced guidance. If a user pattern triggers one of these rules and I miss it, the failure mode is a nudge from the user — at which point I update both this doc and (if automatable) the validator.
