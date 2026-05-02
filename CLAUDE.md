# CLAUDE.md

Working notes for any AI assistant changing this repo.

## Sources of truth

1. **`hyperion.html`** — the app. Single self-contained HTML/JS, vanilla, no build, localStorage key `hyperion_v2`.
2. **`PROGRAMMING_RULES.md`** — the coaching rules the app encodes. 25 numbered rules (session ordering, shoulder sequencing, volume/recovery, time budget, rotation, substitution, block structure, overrides). The in-app `validateSession()` enforces a subset (1, 3, 4, 6, 7, 14); the rest are coach-enforced.
3. **`smoke_test.js`** — `node smoke_test.js` must print "All tests passed" + a clean validator sweep.

Scope docs (`HYPERION_SCOPE.md`, `SCOPE_v2.md`, `FERRUM_SCOPE.md`, `POINT3_SCOPE.md`) are historical and drift behind code. Don't try to keep them current.

## Role split

- **This assistant owns the codebase** — features, bugs, refactors.
- **Cowork owns coaching** — block design, log review, pain-flare adjustments.

When the user describes desired behavior, ask whether it's a coaching rule (update `PROGRAMMING_RULES.md`), a code change (update `hyperion.html`), or both. Don't volunteer block design or log-review work.

## Working norms

- **Plan mode** for any change that touches >2 functions or any UI section. Smaller fixes can go direct.
- **Smoke test must pass before commit.** Run `node smoke_test.js`.
- **let→var patch list.** Any new top-level `const` in `hyperion.html` must be added to the patch list at the top of `smoke_test.js` (around lines 14–32) so the test harness can re-evaluate the file under Node.
- **md5 sync.** `hyperion.html` and `index.html` must have matching md5 on every commit. Sync `cp hyperion.html index.html` as the *last* step before staging.
- **Never weaken `FIXED_MAINS`.** Back Squat / Bench Press / Deadlift never rotate.
- **Validator contract.** `validateSession()` surfaces warnings, never blocks. User overrides are logged with a reason — preserve that.
- **Tile/card density.** One KPI + one supporting line. Never stack kg+lb on the same line.
- **Block units.** Blocks are measured in sessions (~14), not calendar weeks.
- **Don't install dependencies.** Vanilla JS, single-file HTML by design.
- **Don't rename the active block.** Block names come from Cowork.

## Deploy loop

GitHub Pages serves `index.html` from `main` at `https://alexandersinghmann-cyber.github.io/hyperion/`.

After every commit + push that changes `index.html`:

```
python3 deploy.py
```

`deploy.py` HTTP-PUTs `index.html` via the GitHub Contents API using `.github-token` (gitignored). Git gives history + branching; `deploy.py` is the actual mechanism that refreshes the live page. Don't wire `deploy.py` into a git hook yet — keep it manual.

If a commit doesn't change `index.html` (docs-only, test-only, scope-only), skip `deploy.py`.

## Backlog (do not start without explicit go)

- **Phase D** — Imbalance diagnostic: form-video upload UI + audit notes + remediation in accessory rotation.
- **Phase E** — Sunday weekly loop: user submits N training days + per-day equipment, app generates N sessions for the week.
- **Shoulder rehab revision** — pending Cowork diagnostic.
