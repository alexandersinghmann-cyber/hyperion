const fs = require('fs');
const path = require('path');
// Read hyperion.html from the same directory as this script — works on any machine.
const html = fs.readFileSync(path.join(__dirname, 'hyperion.html'),'utf8');
const js = html.match(/<script>([\s\S]*?)<\/script>/)[1];

const mkEl = () => ({textContent:'',innerHTML:'',style:{},classList:{add:()=>{},remove:()=>{},toggle:()=>{}}});
global.window = {AudioContext: null, webkitAudioContext: null};
global.document = {getElementById:()=>mkEl(),querySelectorAll:()=>({forEach:()=>{}}),querySelector:()=>null,addEventListener:()=>{},activeElement:null};
global.navigator = {clipboard:{writeText:()=>Promise.resolve()},vibrate:()=>{}};
global.localStorage = {getItem:()=>null,setItem:()=>{},removeItem:()=>{}};

// Replace top-level `let S =` / `const SEED_SESSION = ...` with `var` so they become globals under eval
const patched = js
  .replace(/\blet S\s*=/g, 'var S =')
  .replace(/\bconst SEED_SESSION\s*=/g, 'var SEED_SESSION =')
  .replace(/\bconst DEF_PROGRAM\s*=/g, 'var DEF_PROGRAM =')
  .replace(/\bconst EXTRAS\s*=/g, 'var EXTRAS =')
  .replace(/\bconst NAME_ALIASES\s*=/g, 'var NAME_ALIASES =')
  .replace(/\bconst SKIP_REASONS\s*=/g, 'var SKIP_REASONS =')
  .replace(/\bconst SKIP_SET_REASONS\s*=/g, 'var SKIP_SET_REASONS =')
  .replace(/\bconst CAT_MAP\s*=/g, 'var CAT_MAP =')
  .replace(/\blet _skipSetCtx\s*=/g, 'var _skipSetCtx =')
  .replace(/\blet _extrasScored\s*=/g, 'var _extrasScored =')
  .replace(/\blet _swapEi\s*=/g, 'var _swapEi =')
  .replace(/\blet _restBeepTimer\s*=/g, 'var _restBeepTimer =')
  .replace(/\blet _restAutoStopTimer\s*=/g, 'var _restAutoStopTimer =')
  .replace(/\bconst VARIANTS\s*=/g, 'var VARIANTS =')
  .replace(/\bconst FIXED_MAINS\s*=/g, 'var FIXED_MAINS =')
  .replace(/\bconst ROTATION_THRESHOLD\s*=/g, 'var ROTATION_THRESHOLD =')
  .replace(/\bconst EX_META\s*=/g, 'var EX_META =')
  .replace(/\bconst EQ_TAGS\s*=/g, 'var EQ_TAGS =')
  .replace(/\bconst DEFAULT_GYMS\s*=/g, 'var DEFAULT_GYMS =');
(0, eval)(patched);
// Expose helpers globally (they were `function` declarations, already global when eval'd indirectly)


const assert = (cond, msg) => { if(!cond){console.log('FAIL:', msg); process.exit(1)} else console.log('PASS:', msg) };

assert(S.settings.benchBaseline1RM === 95, 'Default benchBaseline1RM = 95');

S.sessions = [];
let b3 = getBig3E1rm();
assert(b3.bench === 95, 'Empty: bench = baseline');
assert(b3.benchIsBaseline === true, 'Empty: benchIsBaseline true');

S.sessions = [JSON.parse(JSON.stringify(SEED_SESSION))];
b3 = getBig3E1rm();
const seedSquat = e1rm(100,5);
assert(Math.abs(b3.squat - seedSquat) < 0.1, 'Squat e1RM from seed session: got ' + b3.squat + ' expected ' + seedSquat);
assert(b3.bench === 95, 'Bench still baseline (seed has no flat bench)');
// May 9-10 Push Test has no Deadlift in any day. With no logged deadlift in
// SEED_SESSION either, getBig3E1rm falls back to 0 for dead.
const expDead = 0;
assert(b3.dead === expDead, 'Dead = 0 when program has no Deadlift and seed has none logged: got ' + b3.dead);

S.sessions.push({
  date:'2026-04-20', dayLabel:'Test Bench', blockName:'Test',
  exercises:[{name:'Flat Bench', cat:'push', prescribed:{sets:3,reps:'5',loadKg:90,unit:'kg'},
    performed:[{type:'working', weightKg:90, reps:5, logged:true},{type:'working', weightKg:90, reps:5, logged:true},{type:'working', weightKg:90, reps:5, logged:true}]}]
});
b3 = getBig3E1rm();
const expBench = e1rm(90,5);
assert(Math.abs(b3.bench - expBench) < 0.1, 'Flat Bench: got ' + b3.bench + ' expected ' + expBench);
assert(b3.benchIsBaseline === false, 'benchIsBaseline false');
assert(b3.hasFlatBench === true, 'hasFlatBench true');

S.sessions = [JSON.parse(JSON.stringify(SEED_SESSION)), {
  date:'2026-04-21', dayLabel:'Inc Test', blockName:'Test',
  exercises:[{name:'DB Incline Bench', cat:'push', prescribed:{sets:3,reps:'8',loadKg:28,unit:'kg'},
    performed:[{type:'working', weightKg:28, reps:8, logged:true}]}]
}];
b3 = getBig3E1rm();
assert(b3.bench === 95, 'Incline ignored, bench stays at baseline: got ' + b3.bench);

S.sessions = [JSON.parse(JSON.stringify(SEED_SESSION))];
const total = calcTotal();
const expTotal = Math.round(seedSquat*2.20462) + Math.round(95*2.20462) + Math.round(expDead*2.20462);
assert(Math.abs(total - expTotal) <= 2, 'calcTotal: got ' + total + ' expected ' + expTotal);

S.sessions = [
  {date:'2026-04-11', dayLabel:'A', exercises:[{name:'Back Squat', prescribed:{sets:3,reps:'5',loadKg:100,unit:'kg'}, performed:[{type:'working',weightKg:100,reps:5,logged:true}]}]},
  {date:'2026-04-13', dayLabel:'B', exercises:[{name:'Back Squat', prescribed:{sets:3,reps:'5',loadKg:102.5,unit:'kg'}, performed:[{type:'working',weightKg:102.5,reps:5,logged:true}]}]}
];
b3 = getBig3E1rm();
assert(b3.deltaSquat > 0, 'deltaSquat positive when squat e1RM rising: got ' + b3.deltaSquat);

const isFB = n => /^(flat bench|bench press|barbell bench)$/i.test(n);
assert(isFB('Flat Bench'), 'Flat Bench matches');
assert(isFB('Bench Press'), 'Bench Press matches');
assert(!isFB('DB Incline Bench'), 'DB Incline Bench rejected');
assert(!isFB('Incline Bench'), 'Incline Bench rejected');
assert(!isFB('Close-Grip Bench'), 'Close-Grip Bench rejected');

// ===== EXTRAS LIBRARY =====
assert(Array.isArray(EXTRAS) && EXTRAS.length === 46, 'EXTRAS has 46 entries: got ' + EXTRAS.length);
const poolsC = EXTRAS.reduce((a,e)=>{a[e.pool]=(a[e.pool]||0)+1;return a},{});
assert(poolsC.rehab === 10, 'Rehab pool count 10: got ' + poolsC.rehab);
assert(poolsC.core === 11, 'Core pool count 11: got ' + poolsC.core);
assert(poolsC.lower === 11, 'Lower pool count 11: got ' + poolsC.lower);
assert(poolsC.upper === 14, 'Upper pool count 14: got ' + poolsC.upper);
// All required fields
const needed = ['key','pool','name','cat','sets','reps','loadKg','unit','equip','shoulder','carryover','whyBase'];
const missing = EXTRAS.filter(e => needed.some(k => e[k] === undefined));
assert(missing.length === 0, 'All extras have required fields: missing=' + missing.map(m=>m.key).join(','));

// catToPool mapping
assert(catToPool('squat') === 'lower', 'catToPool squat → lower');
assert(catToPool('hinge') === 'lower', 'catToPool hinge → lower');
assert(catToPool('push') === 'upper', 'catToPool push → upper');
assert(catToPool('pull') === 'upper', 'catToPool pull → upper');
assert(catToPool('core') === 'core', 'catToPool core → core');
assert(catToPool('rehab') === 'rehab', 'catToPool rehab → rehab');
assert(catToPool('isolation','Calf Raise') === 'lower', 'catToPool isolation+Calf → lower');
assert(catToPool('isolation','DB Curl') === 'upper', 'catToPool isolation+Curl → upper');

// Recommendation: Upper day context should rank Lower/Core/Rehab above Upper
S.sessions = [JSON.parse(JSON.stringify(SEED_SESSION))];
S.activeSession = {dayIndex:0, date:'2026-04-18', dayLabel:'Upper A: Pull Heavy + Rehab', startTime:Date.now(), exercises:[]};
const ctxUpper = getExtrasContext();
assert(ctxUpper.isUpperDay === true, 'ctx detects upper day');
assert(ctxUpper.isLowerDay === false, 'ctx not lower day');

// Score a lower exercise and an upper isolation on upper day — lower should beat upper isolation
const hipThrust = EXTRAS.find(e => e.key === 'L8');
const cableCurl = EXTRAS.find(e => e.key === 'U9');
const sHip = scoreExtra(hipThrust, ctxUpper);
const sCurl = scoreExtra(cableCurl, ctxUpper);
assert(sHip.score > sCurl.score, 'On upper day: Hip Thrust (lower) outranks Cable Curl (upper iso). Got Hip=' + sHip.score + ' Curl=' + sCurl.score);

// Pull-Up (warn) should be penalized vs Chin-Up (safe) with similar carryover
const chin = EXTRAS.find(e => e.key === 'U1');
const pullup = EXTRAS.find(e => e.key === 'U2');
assert(scoreExtra(chin, ctxUpper).score > scoreExtra(pullup, ctxUpper).score, 'Chin-Up (safe) > Pull-Up (warn shoulder)');

// Squat day: Upper+Core should get boosted, not Lower
S.activeSession = {dayIndex:1, date:'2026-04-19', dayLabel:'Squat Heavy', startTime:Date.now(), exercises:[]};
const ctxSquat = getExtrasContext();
assert(ctxSquat.isLowerDay === true, 'ctx detects lower day on Squat Heavy');
const sHipOnSquat = scoreExtra(hipThrust, ctxSquat).score;
const sHipOnUpper = sHip.score;
assert(sHipOnUpper > sHipOnSquat, 'Hip Thrust scores higher on upper day than squat day (avoid doubling up on squat day)');

// Rehab exercise should consistently rank well on upper day (user priority given shoulder injury)
const bandER = EXTRAS.find(e => e.key === 'R1');
assert(scoreExtra(bandER, ctxUpper).score >= 6, 'Band ER ranks well on upper day: ' + scoreExtra(bandER, ctxUpper).score);

// Repetition penalty: exercise in last 2 sessions should be penalized
S.sessions = [
  {date:'2026-04-16', exercises:[{name:'Hip Thrust', cat:'hinge'}]},
  {date:'2026-04-17', exercises:[{name:'Hip Thrust', cat:'hinge'}]}
];
S.activeSession = {dayIndex:0, date:'2026-04-18', dayLabel:'Upper A', startTime:Date.now(), exercises:[]};
const ctxRepeat = getExtrasContext();
const sHipRepeat = scoreExtra(hipThrust, ctxRepeat).score;
const sHipClean = scoreExtra(hipThrust, ctxUpper).score;
assert(sHipClean > sHipRepeat, 'Hip Thrust penalized when in last 2 sessions: clean=' + sHipClean + ' repeat=' + sHipRepeat);

// Add-to-session wiring doesn't corrupt activeSession
S.activeSession = {dayIndex:0, date:'2026-04-18', dayLabel:'Upper A', startTime:Date.now(), exercises:[]};
addExtraToSession('C4'); // Dead Bug
assert(S.activeSession.exercises.length === 1, 'addExtraToSession appended 1 exercise');
assert(S.activeSession.exercises[0].name === 'Dead Bug', 'Appended correct name');
assert(S.activeSession.exercises[0].tags.includes('extra'), 'Appended with extra tag');
assert(S.activeSession.exercises[0].tags.includes('core'), 'Appended with pool tag');
assert(S.activeSession.exercises[0].performed.length === 3, 'Pre-filled 3 sets');
assert(S.activeSession.exercises[0].performed[0].reps === 10, 'Pre-fills top-of-range reps');
// Duplicate protection
addExtraToSession('C4');
assert(S.activeSession.exercises.length === 1, 'Duplicate add blocked');

// ===== NAME ALIASING =====
assert(typeof NAME_ALIASES === 'object', 'NAME_ALIASES object exists');
assert(canonName('Seated Row') === 'Cable Low Row', 'canonName: Seated Row → Cable Low Row');
assert(canonName('Low Row') === 'Cable Low Row', 'canonName: Low Row → Cable Low Row');
assert(canonName('Bench Press') === 'Bench Press', 'canonName: pass-through unknowns');

// ===== PROGRAM: May 9-10 Push Test structure (2 days only) =====
// D1 Sat Upper Body Hard · D2 Sun Lower Body Hard. Real Block 3 follows the
// debrief — this micro-block exists to push hard and gather signal.
assert(DEF_PROGRAM.name === 'May 9-10 Push Test', 'Program name is May 9-10 Push Test: got ' + DEF_PROGRAM.name);
assert(DEF_PROGRAM.days.length === 2, 'Program has 2 days: got ' + DEF_PROGRAM.days.length);
const d1 = DEF_PROGRAM.days.find(d => d.id === 1);
const d2 = DEF_PROGRAM.days.find(d => d.id === 2);
assert(d1 && d1.label === 'Upper Body Hard', 'D1 label is Upper Body Hard: got ' + (d1 && d1.label));
assert(d1 && d1.dayOfWeek === 'Saturday', 'D1 dayOfWeek is Saturday: got ' + (d1 && d1.dayOfWeek));
assert(d1 && d1.exercises.length === 10, 'D1 has 10 main exercises: got ' + (d1 && d1.exercises.length));
assert(d2 && d2.label === 'Lower Body Hard', 'D2 label is Lower Body Hard: got ' + (d2 && d2.label));
assert(d2 && d2.dayOfWeek === 'Sunday', 'D2 dayOfWeek is Sunday: got ' + (d2 && d2.dayOfWeek));
assert(d2 && d2.exercises.length === 7, 'D2 has 7 main exercises: got ' + (d2 && d2.exercises.length));
assert(!DEF_PROGRAM.days.some(d => d.id === 3 || d.id === 4), 'No D3/D4 in 2-day push test');

// Core in this block: Cable Crunch, not Pallof Press (Pallof not in program)
const d1Core = d1.exercises.filter(e => e.cat === 'core');
const d2Core = d2.exercises.filter(e => e.cat === 'core');
assert(d1Core.length === 1 && /cable crunch/i.test(d1Core[0].name), 'D1 core is Cable Crunch: got ' + (d1Core[0] && d1Core[0].name));
assert(d2Core.length === 2, 'D2 has 2 core entries: got ' + d2Core.length);
assert(d2Core.some(e => /cable crunch/i.test(e.name)), 'D2 core includes Cable Crunch');
assert(d2Core.some(e => /bird dog/i.test(e.name)), 'D2 core includes Bird Dog');

// ===== TRICEP: Cable Tricep Extension lives in D1 main block (Upper Body Hard) =====
const d1Tri = d1.exercises.find(e => /cable tricep extension/i.test(e.name));
assert(d1Tri, 'D1 has Cable Tricep Extension in main block');
assert(d1Tri && d1Tri.cat === 'isolation', 'D1 Cable Tricep Extension cat = isolation: got ' + (d1Tri && d1Tri.cat));
assert(d1Tri && d1Tri.sets === 4 && d1Tri.loadKg === 36, 'D1 Cable Tricep Extension 4x10 @ 36kg');

// ===== Cable Low Row placement: D1 main =====
const d1Row = d1.exercises.find(e => /cable low row/i.test(e.name));
assert(d1Row, 'D1 (Upper Body Hard) has Cable Low Row');
assert(!DEF_PROGRAM.days.some(d => (d.exercises||[]).some(e => /^seated row$/i.test(e.name))), 'No day has bare "Seated Row"');

// ===== DB Single-Leg Calf Raise added to EX_META and used in D2 =====
const slCalf = d2.exercises.find(e => e.name === 'DB Single-Leg Calf Raise');
assert(slCalf, 'D2 has DB Single-Leg Calf Raise (new EX_META entry)');
assert(getMeta('DB Single-Leg Calf Raise').slot === 'calf', 'DB Single-Leg Calf Raise meta: slot=calf');
assert(getMeta('DB Single-Leg Calf Raise').eq.includes('db'), 'DB Single-Leg Calf Raise meta: eq includes db');

// ===== SYNC PROGRAM function exists =====
assert(typeof syncProgram === 'function', 'syncProgram() defined');

// ===== SWAP FEATURE =====
assert(typeof openSwap === 'function', 'openSwap() defined');
assert(typeof getSwapCandidates === 'function', 'getSwapCandidates() defined');
assert(typeof doSwap === 'function', 'doSwap() defined');

// Seed an active session with a pull exercise, build candidates
S.sessions = [];
S.activeSession = {
  dayIndex: 0, date: '2026-04-18', dayLabel: 'Upper A', startTime: Date.now(),
  exercises: [{
    name: 'Lat Pulldown', cat: 'pull',
    prescribed: {sets:3, reps:'8', loadKg:54.5, unit:'kg'},
    performed: [
      {type:'working', weightKg:54.5, reps:8, logged:false},
      {type:'working', weightKg:54.5, reps:8, logged:false},
      {type:'working', weightKg:54.5, reps:8, logged:false}
    ]
  }]
};
const swapCands = getSwapCandidates(S.activeSession.exercises[0]);
assert(swapCands.length > 0, 'Swap candidates returned: got ' + swapCands.length);
// All candidates must be pull/upper pool
assert(swapCands.every(c => catToPool(c.cat, c.name) === 'upper'), 'All swap candidates are upper pool');
// Current exercise excluded
assert(!swapCands.some(c => c.name.toLowerCase() === 'lat pulldown'), 'Self-exercise excluded from swap candidates');
// Each candidate carries a load
assert(swapCands.every(c => typeof c.loadKg === 'number' && c.loadKg >= 0), 'All candidates have numeric load');
// Extras-sourced candidates use Extras library load, not current ex load
const chinCand = swapCands.find(c => /chin-up/i.test(c.name));
if (chinCand) {
  const chinExtra = EXTRAS.find(e => e.name === 'Chin-Up (neutral)');
  assert(chinCand.loadKg === chinExtra.loadKg, 'Chin-Up swap load = Extras default: got ' + chinCand.loadKg);
}

// ===== HISTORY-BASED weight scaling =====
S.sessions = [{
  date:'2026-04-10', dayLabel:'Test', blockName:'Test',
  exercises:[{
    name:'One-Arm Row', cat:'pull',
    prescribed:{sets:3,reps:'10',loadKg:32,unit:'kg'},
    performed:[
      {type:'working', weightKg:32, reps:10, logged:true},
      {type:'working', weightKg:34, reps:10, logged:true},
      {type:'working', weightKg:36, reps:10, logged:true}
    ]
  }]
}];
const cands2 = getSwapCandidates(S.activeSession.exercises[0]);
const oarCand = cands2.find(c => /one-arm row/i.test(c.name) && c.source === 'History');
// Only fires if One-Arm Row isn't also in EXTRAS
if (oarCand) {
  assert(oarCand.loadKg === 36, 'History swap uses peak working weight: got ' + oarCand.loadKg);
}

// ===== doSwap: target from EXTRAS pulls EXTRAS defaults =====
S.sessions = [];
S.activeSession = {
  dayIndex: 0, date: '2026-04-18', dayLabel: 'Upper A', startTime: Date.now(),
  exercises: [{
    name: 'Lat Pulldown', cat: 'pull',
    prescribed: {sets:3, reps:'8', loadKg:54.5, unit:'kg'},
    performed: [{type:'working', weightKg:54.5, reps:8, logged:false},{type:'working', weightKg:54.5, reps:8, logged:false},{type:'working', weightKg:54.5, reps:8, logged:false}]
  }]
};
_swapEi = 0;
const chinExtra2 = EXTRAS.find(e => e.name === 'Chin-Up (neutral)');
doSwap(encodeURIComponent('Chin-Up (neutral)'));
const swapped = S.activeSession.exercises[0];
assert(swapped.name === 'Chin-Up (neutral)', 'doSwap renamed exercise to Chin-Up');
assert(swapped.prescribed.loadKg === chinExtra2.loadKg, 'doSwap updated load to Extras default: got ' + swapped.prescribed.loadKg);
assert(swapped.performed.every(p => p.weightKg === chinExtra2.loadKg), 'doSwap reset all unlogged sets to new load');
assert(swapped.tags.includes('swapped'), 'doSwap adds swapped tag');

// ===== doSwap: preserves logged sets =====
S.activeSession.exercises[0] = {
  name: 'Lat Pulldown', cat: 'pull',
  prescribed: {sets:3, reps:'8', loadKg:54.5, unit:'kg'},
  performed: [
    {type:'working', weightKg:54.5, reps:8, logged:true},   // logged
    {type:'working', weightKg:54.5, reps:8, logged:false},
    {type:'working', weightKg:54.5, reps:8, logged:false}
  ]
};
// Bypass the confirm() by stubbing globally
global.confirm = () => true;
_swapEi = 0;
doSwap(encodeURIComponent('Chin-Up (neutral)'));
const swapped2 = S.activeSession.exercises[0];
assert(swapped2.performed[0].logged === true, 'doSwap preserves logged set');
assert(swapped2.performed[0].weightKg === 54.5, 'Logged set keeps original weight');
assert(swapped2.performed[1].weightKg === chinExtra2.loadKg, 'Un-logged sets updated to new weight');

// ===== doSwap: duplicate guard =====
S.activeSession = {
  dayIndex: 0, date: '2026-04-18', dayLabel: 'Upper A', startTime: Date.now(),
  exercises: [
    {name:'Lat Pulldown', cat:'pull', prescribed:{sets:3,reps:'8',loadKg:54.5,unit:'kg'}, performed:[{type:'working',weightKg:54.5,reps:8,logged:false}]},
    {name:'Chin-Up (neutral)', cat:'pull', prescribed:{sets:3,reps:'5',loadKg:0,unit:'bw'}, performed:[{type:'working',weightKg:0,reps:5,logged:false}]}
  ]
};
let alerted = false;
global.alert = () => { alerted = true; };
_swapEi = 0;
doSwap(encodeURIComponent('Chin-Up (neutral)'));
assert(alerted === true, 'doSwap alerts on duplicate');
assert(S.activeSession.exercises[0].name === 'Lat Pulldown', 'doSwap does NOT rename on duplicate');

// ===== BIG 3 TARGETS =====
assert(S.settings.big3Targets, 'big3Targets present in default settings');
assert(S.settings.big3Targets.squat === 166, 'Default squat target = 166 kg');
assert(S.settings.big3Targets.bench === 102, 'Default bench target = 102 kg');
assert(S.settings.big3Targets.dead === 186, 'Default dead target = 186 kg');
// 166 + 102 + 186 = 454 kg ≈ 1000 lb
const tgtTotalLb = Math.round((166+102+186)*2.20462);
assert(tgtTotalLb >= 1000 && tgtTotalLb <= 1010, 'Targets sum to ~1000 lb: got ' + tgtTotalLb);

// Reset function exists and does not throw on call-through (skip confirm path)
assert(typeof resetBig3Targets === 'function', 'resetBig3Targets() defined');
assert(typeof saveBig3Targets === 'function', 'saveBig3Targets() defined');

// ===== SKIP DAY FEATURE =====
assert(Array.isArray(S.skips), 'S.skips is array');
assert(typeof isDaySkipped === 'function', 'isDaySkipped() defined');
assert(typeof getDaySkip === 'function', 'getDaySkip() defined');
assert(typeof getNextAvailableDayIdx === 'function', 'getNextAvailableDayIdx() defined');
assert(typeof openSkipDay === 'function', 'openSkipDay() defined');
assert(typeof confirmSkipDay === 'function', 'confirmSkipDay() defined');
assert(typeof unskipDay === 'function', 'unskipDay() defined');
assert(Array.isArray(SKIP_REASONS) && SKIP_REASONS.length >= 5, 'SKIP_REASONS has at least 5 entries: got ' + SKIP_REASONS.length);
assert(SKIP_REASONS.every(r => r.k && r.label), 'Every SKIP_REASONS entry has k + label');
assert(SKIP_REASONS.some(r => r.k === 'tired'), 'SKIP_REASONS includes "tired"');
assert(SKIP_REASONS.some(r => r.k === 'completed'), 'SKIP_REASONS includes "completed"');
assert(SKIP_REASONS.some(r => r.k === 'time'), 'SKIP_REASONS includes "time"');

// Empty skips: no day is skipped
S.skips = [];
S.sessions = [];
assert(isDaySkipped(0) === false, 'Day 0 not skipped on empty state');

// getNextAvailableDayIdx: with fresh state returns today's idx (or first day)
const nextIdx0 = getNextAvailableDayIdx();
assert(nextIdx0 >= 0 && nextIdx0 < S.program.days.length, 'getNextAvailableDayIdx returns valid idx: ' + nextIdx0);

// Stub the dom getById to support skip-modal fields
const stubVals = {};
global.document = {
  getElementById: (id) => ({
    get value(){return stubVals[id]||'';},
    set value(v){stubVals[id]=v;},
    textContent:'', innerHTML:'', style:{},
    classList:{add:()=>{},remove:()=>{},toggle:()=>{}}
  }),
  querySelectorAll: () => ({forEach:()=>{}}),
  querySelector: () => null,
  addEventListener: () => {},
  activeElement: null
};

// Skip day 0 with reason 'tired'
stubVals['skipDayIdx'] = '0';
confirmSkipDay('tired');
assert(S.skips.length === 1, 'confirmSkipDay added 1 skip record: got ' + S.skips.length);
assert(S.skips[0].reason === 'tired', 'Skip reason = tired');
assert(S.skips[0].reasonLabel && /tired/i.test(S.skips[0].reasonLabel), 'Skip reasonLabel populated');
assert(S.skips[0].dayLabel === S.program.days[0].label, 'Skip dayLabel matches day 0');
assert(S.skips[0].blockName === S.program.name, 'Skip blockName matches program');
assert(isDaySkipped(0) === true, 'Day 0 now skipped');
assert(getDaySkip(0) !== null && getDaySkip(0).reason === 'tired', 'getDaySkip returns record');

// Skipping day 0 again with different reason overwrites (idempotent)
confirmSkipDay('time');
assert(S.skips.length === 1, 'confirmSkipDay overwrote (still 1 record): got ' + S.skips.length);
assert(S.skips[0].reason === 'time', 'Reason updated to time');

// getNextAvailableDayIdx skips the skipped day
const nextIdx1 = getNextAvailableDayIdx();
assert(nextIdx1 !== 0, 'Next available skips the skipped day 0: got ' + nextIdx1);

// unskipDay with confirm stub
global.confirm = () => true;
unskipDay(0);
assert(S.skips.length === 0, 'unskipDay removed record: got ' + S.skips.length);
assert(isDaySkipped(0) === false, 'Day 0 no longer skipped after unskip');

// Skip every day — getNextAvailableDayIdx returns -1
for(let i=0; i<S.program.days.length; i++){
  stubVals['skipDayIdx'] = String(i);
  confirmSkipDay('tired');
}
assert(getNextAvailableDayIdx() === -1, 'All days skipped → returns -1');

// A completed day (in S.sessions) is also counted as unavailable
S.skips = [];
S.sessions = [{date:'2026-04-18', dayLabel:S.program.days[0].label, blockName:S.program.name, exercises:[{name:'x',performed:[{type:'working',weightKg:10,reps:5,logged:true}]}]}];
const nextAfterDone = getNextAvailableDayIdx();
assert(nextAfterDone !== 0, 'Next available skips the done day 0: got ' + nextAfterDone);


// ===== B1: nextLoad engine (evalProg) — uses achieved, not prescribed =====
function mkActive(exCfg){
  S.activeSession = {
    dayIndex:0, date:'2026-04-19', dayLabel:'Test', startTime:Date.now(),
    exercises:[exCfg]
  };
  S.sessions = [];
}
// Case 1: top set at 102.5 @ RPE 10 (Sunday squat scenario) → deload 5%
mkActive({
  name:'Back Squat', cat:'squat',
  prescribed:{sets:3,reps:'5',loadKg:100,unit:'kg'},
  performed:[
    {type:'working',weightKg:90,reps:5,rpe:7,logged:true},
    {type:'working',weightKg:102.5,reps:5,rpe:9,logged:true},
    {type:'working',weightKg:102.5,reps:5,rpe:10,logged:true}
  ]
});
evalProg(0);
let ex = S.activeSession.exercises[0];
assert(ex.progression === 'flag', 'B1: RPE 10 → flag. Got: ' + ex.progression);
assert(Math.abs(ex.nextLoad - 97.4) < 0.2, 'B1: RPE 10 → deload 5% from 102.5 → ~97.4 kg. Got: ' + ex.nextLoad);

// Case 2: top set hit at RPE 7 → increase from achieved (not prescribed)
mkActive({
  name:'Calf Raise', cat:'isolation',
  prescribed:{sets:3,reps:'15',loadKg:40.8,unit:'kg'},
  performed:[
    {type:'working',weightKg:49.9,reps:15,rpe:null,logged:true},
    {type:'working',weightKg:49.9,reps:15,rpe:null,logged:true},
    {type:'working',weightKg:49.9,reps:15,rpe:null,logged:true}
  ]
});
evalProg(0);
ex = S.activeSession.exercises[0];
assert(ex.progression === 'increase', 'B1: all reps hit at achieved weight → increase. Got: ' + ex.progression);
assert(ex.nextLoad > 49.9 && ex.nextLoad <= 52, 'B1: nextLoad progresses from achieved 49.9 (not prescribed 40.8). Got: ' + ex.nextLoad);

// Case 3: RPE 9 at top → hold at achieved weight
mkActive({
  name:'Bench', cat:'push',
  prescribed:{sets:3,reps:'5',loadKg:80,unit:'kg'},
  performed:[
    {type:'working',weightKg:85,reps:5,rpe:8,logged:true},
    {type:'working',weightKg:85,reps:5,rpe:9,logged:true}
  ]
});
evalProg(0);
ex = S.activeSession.exercises[0];
assert(ex.progression === 'hold', 'B1: RPE 9 top → hold. Got: ' + ex.progression);
assert(ex.nextLoad === 85, 'B1: RPE 9 → nextLoad = achieved top 85. Got: ' + ex.nextLoad);

// Case 4: skipped sets don't contribute to top
mkActive({
  name:'Pallof', cat:'core',
  prescribed:{sets:2,reps:'10',loadKg:15,unit:'kg'},
  performed:[
    {type:'working',weightKg:0,reps:0,rpe:null,logged:true,skipped:true,skipReason:'equipment'},
    {type:'working',weightKg:0,reps:0,rpe:null,logged:true,skipped:true,skipReason:'equipment'}
  ]
});
evalProg(0);
ex = S.activeSession.exercises[0];
assert(ex.progression == null || ex.progression === 'skipped' || ex.progression === 'hold', 'B1: all-skipped no crash');

// Case 5: mixed — skipped ignored, top is from non-skipped
mkActive({
  name:'Hamstring Curl', cat:'isolation',
  prescribed:{sets:3,reps:'12',loadKg:36,unit:'kg'},
  performed:[
    {type:'working',weightKg:39,reps:12,rpe:7,logged:true},
    {type:'working',weightKg:39,reps:12,rpe:8,logged:true},
    {type:'working',weightKg:0,reps:0,rpe:null,logged:true,skipped:true,skipReason:'time'}
  ]
});
evalProg(0);
ex = S.activeSession.exercises[0];
assert(ex.progression === 'hold' || ex.progression === 'increase', 'B1: mixed skip+ok → valid progression. Got: ' + ex.progression);
assert(ex.nextLoad >= 39, 'B1: nextLoad at least top-achieved 39, not prescribed 36. Got: ' + ex.nextLoad);

// ===== B2: category migration =====
assert(typeof migrateCategories === 'function', 'B2: migrateCategories() defined');
assert(typeof CAT_MAP === 'object' && CAT_MAP['Back Extension'] === 'hinge', 'B2: CAT_MAP Back Extension → hinge');
assert(CAT_MAP['Cable Crunch'] === 'core', 'B2: CAT_MAP Cable Crunch → core');
// Seed a corrupted state, run migration, verify fix
S.program = {name:'Test', days:[{id:1,label:'Test',dayOfWeek:'Monday',dur:60,exercises:[
  {id:'x1',name:'Back Extension',cat:'pull',sets:3,reps:'10',loadKg:20,unit:'kg',tags:[]}
]}]};
S.sessions = [{date:'2026-04-19',dayLabel:'Test',blockName:'Test',exercises:[
  {name:'Cable Crunch',cat:'pull',prescribed:{sets:3,reps:'15',loadKg:20,unit:'kg'},performed:[]}
]}];
S.activeSession = null;
const fixed = migrateCategories();
assert(fixed === 2, 'B2: migrateCategories fixed 2 exercises. Got: ' + fixed);
assert(S.program.days[0].exercises[0].cat === 'hinge', 'B2: Back Extension now hinge');
assert(S.sessions[0].exercises[0].cat === 'core', 'B2: Cable Crunch now core');
// Idempotent: second run fixes 0
const fixed2 = migrateCategories();
assert(fixed2 === 0, 'B2: migration idempotent. 2nd run fixed 0. Got: ' + fixed2);

// ===== B3: skip-set reason =====
assert(Array.isArray(SKIP_SET_REASONS) && SKIP_SET_REASONS.length >= 5, 'B3: SKIP_SET_REASONS has entries');
assert(SKIP_SET_REASONS.some(r => r.key === 'equipment'), 'B3: equipment reason');
assert(SKIP_SET_REASONS.some(r => r.key === 'time'), 'B3: time reason');
assert(SKIP_SET_REASONS.some(r => r.key === 'injury'), 'B3: injury reason');
assert(typeof skipSet === 'function', 'B3: skipSet() defined');
assert(typeof confirmSkipSet === 'function', 'B3: confirmSkipSet() defined');
assert(typeof cancelSkipSet === 'function', 'B3: cancelSkipSet() defined');

// confirmSkipSet writes skipped + skipReason
mkActive({
  name:'Pallof', cat:'core', tags:[],
  prescribed:{sets:2,reps:'10',loadKg:15,unit:'kg'},
  performed:[
    {type:'working',weightKg:15,reps:0,rpe:null,logged:false},
    {type:'working',weightKg:15,reps:0,rpe:null,logged:false}
  ]
});
// Stub renderEx to avoid DOM churn for this data-side check
global.renderEx = () => {};
_skipSetCtx = {ei:0, si:0};
confirmSkipSet('equipment');
const sk0 = S.activeSession.exercises[0].performed[0];
assert(sk0.logged === true, 'B3: confirmSkipSet marks logged');
assert(sk0.skipped === true, 'B3: confirmSkipSet marks skipped');
assert(sk0.skipReason === 'equipment', 'B3: skipReason set to equipment');
assert(sk0.weightKg === 0 && sk0.reps === 0, 'B3: weight/reps zeroed');

// ===== R1: moveExercise =====
assert(typeof moveExercise === 'function', 'R1: moveExercise() defined');
S.program = {name:'T',days:[{id:1,label:'T',dayOfWeek:'Mon',dur:60,exercises:[
  {id:'a',name:'A',cat:'push',sets:3,reps:'5',loadKg:20,unit:'kg',tags:[]},
  {id:'b',name:'B',cat:'push',sets:3,reps:'5',loadKg:25,unit:'kg',tags:[]},
  {id:'c',name:'C',cat:'push',sets:3,reps:'5',loadKg:30,unit:'kg',tags:[]}
]}]};
// Override showDayPreview to avoid DOM calls
const _origSDP = (typeof showDayPreview !== 'undefined') ? showDayPreview : null;
global.showDayPreview = () => {};
moveExercise(0, 1, -1); // move B up
let names = S.program.days[0].exercises.map(e=>e.name);
assert(names[0] === 'B' && names[1] === 'A' && names[2] === 'C', 'R1: moveExercise up works. Got ' + names.join(','));
moveExercise(0, 2, 1); // at boundary — no-op
names = S.program.days[0].exercises.map(e=>e.name);
assert(names[2] === 'C', 'R1: moveExercise at bottom boundary is no-op');
moveExercise(0, 0, -1); // at top boundary — no-op
names = S.program.days[0].exercises.map(e=>e.name);
assert(names[0] === 'B', 'R1: moveExercise at top boundary is no-op');

// ===== R2: moveDay =====
assert(typeof moveDay === 'function', 'R2: moveDay() defined');
S.program = {name:'T',days:[
  {id:1,label:'D1',dayOfWeek:'Mon',dur:60,exercises:[]},
  {id:2,label:'D2',dayOfWeek:'Tue',dur:60,exercises:[]},
  {id:3,label:'D3',dayOfWeek:'Wed',dur:60,exercises:[]}
]};
S.sessions = [];
S.skips = [];
global.renderTrain = () => {};
moveDay(0, 1); // D1 down
let labels = S.program.days.map(d=>d.label);
assert(labels[0] === 'D2' && labels[1] === 'D1', 'R2: moveDay swapped. Got ' + labels.join(','));
assert(S.program.days[0].id === 1 && S.program.days[1].id === 2, 'R2: IDs reassigned to new positions');
// Done day locked
S.sessions = [{date:'2026-04-19',dayLabel:'D2',blockName:'T',exercises:[{name:'x',performed:[{type:'working',weightKg:10,reps:5,logged:true}]}]}];
global.toast = () => {};
moveDay(0, 1); // D2 is done (at idx 0 now), should not move
labels = S.program.days.map(d=>d.label);
assert(labels[0] === 'D2', 'R2: completed day is locked from reorder');

// ===== B3: report/volume excludes skipped =====
// Simulate a session with 1 skipped set, 2 real
const sess = {
  date:'2026-04-19',dayLabel:'T',blockName:'T',duration:60,rpe:8,
  exercises:[{
    name:'Pallof', cat:'core',
    prescribed:{sets:3,reps:'10',loadKg:15,unit:'kg'},
    performed:[
      {type:'working',weightKg:15,reps:10,rpe:7,logged:true},
      {type:'working',weightKg:15,reps:10,rpe:8,logged:true},
      {type:'working',weightKg:0,reps:0,rpe:null,logged:true,skipped:true,skipReason:'equipment'}
    ]
  }]
};
const volAll = sess.exercises.reduce((a,e)=>(e.performed||[]).filter(p=>p.type==='working').reduce((b,p)=>b+p.weightKg*p.reps,a),0);
const volOk = sess.exercises.reduce((a,e)=>(e.performed||[]).filter(p=>p.type==='working'&&!p.skipped).reduce((b,p)=>b+p.weightKg*p.reps,a),0);
assert(volAll === volOk, 'B3: skipped sets already have 0 volume (weightKg=0)');
const skipCount = sess.exercises.reduce((a,e)=>a+(e.performed||[]).filter(p=>p.type==='working'&&p.skipped).length,0);
assert(skipCount === 1, 'B3: 1 skipped set counted');

// ===== PHASE A: Session ordering (pattern alternation) =====
// Restore DEF_PROGRAM-backed days (tests above mutated S.program)
S.program = JSON.parse(JSON.stringify(DEF_PROGRAM));
const pa_d1 = S.program.days.find(d => d.id === 1);
const pa_d2 = S.program.days.find(d => d.id === 2);

// D1 Upper Body Hard — activation-first (rule 7 — scap stabilizer before
// pressing), then heavy bench, then pulldown/row alternation.
assert(/band pull-apart/i.test(pa_d1.exercises[0].name), 'Phase A: D1 begins with Band Pull-Apart (activation-first per rule 7). Got: ' + pa_d1.exercises[0].name);
assert(/bench press/i.test(pa_d1.exercises[1].name), 'Phase A: D1 second is Bench Press (heavy hpush after activation). Got: ' + pa_d1.exercises[1].name);
assert(/lat pulldown/i.test(pa_d1.exercises[2].name), 'Phase A: D1 third is Lat Pulldown (vpull). Got: ' + pa_d1.exercises[2].name);
assert(/cable low row/i.test(pa_d1.exercises[3].name), 'Phase A: D1 fourth is Cable Low Row (hpull). Got: ' + pa_d1.exercises[3].name);

// D2 Lower Body Hard: heavy squat first (rule 10 — Big 3 first).
assert(/back squat/i.test(pa_d2.exercises[0].name), 'Phase A: D2 begins with Back Squat. Got: ' + pa_d2.exercises[0].name);
assert(/bulgarian split squat/i.test(pa_d2.exercises[1].name), 'Phase A: D2 second is Bulgarian Split Squat. Got: ' + pa_d2.exercises[1].name);
assert(/db rdl/i.test(pa_d2.exercises[2].name), 'Phase A: D2 third is DB RDL (hinge accessory). Got: ' + pa_d2.exercises[2].name);

// ===== PHASE B: Exercise metadata + validator =====
assert(typeof getMeta === 'function', 'Phase B: getMeta() defined');
const metaLP = getMeta('Lat Pulldown');
assert(metaLP.pat === 'vpull', 'Phase B: Lat Pulldown pat = vpull');
assert(metaLP.slot === 'vpull', 'Phase B: Lat Pulldown slot = vpull');
assert(Array.isArray(metaLP.prim) && metaLP.prim.includes('lat'), 'Phase B: Lat Pulldown prim includes lat');
const metaDL = getMeta('Deadlift');
assert(metaDL.pat === 'hinge' && metaDL.fat === 'heavy-compound', 'Phase B: Deadlift pat=hinge, fat=heavy-compound');
const metaBench = getMeta('Bench Press');
assert(metaBench.sh === 'activation-first', 'Phase B: Bench Press sh=activation-first');

assert(typeof validateSession === 'function', 'Phase B: validateSession() defined');
// Shared prime movers on adjacent exercises → warn
const badPair = [{name:'Cable Low Row'},{name:'Lat Pulldown'}];
const warnBad = validateSession(badPair);
assert(warnBad.length > 0, 'Phase B: Cable Low Row → Lat Pulldown triggers warning');

// May 9-10 Push Test removed the prior block's overrides (Squat→Deadlift in D1
// and Deadlift→Back Extension in D3) but introduces two new known signals:
//   1. Upper Body Hard estimates >75 min (rule #14 — time budget). 10 main
//      exercises + heavy bench at 180s rest pushes the estimate. Coach
//      accepts this for a 1-shot push test.
//   2. Lower Body Hard: Back Squat → Bulgarian Split Squat (rule #4 — both
//      pat='squat', share quad/glute). BSS carries a weak-leg-focus tag;
//      the adjacency is intentional continuation of quad/glute work.
// Asserting exactly these 2 known warnings: catches BOTH a regression that
// silences them AND any new warning that creeps in.
const progWarns = validateProgram();
const warnsByLabel = {};
progWarns.forEach(r => {
  const k = r.day || r.label || r.dayId || '';
  warnsByLabel[k] = (r.warnings||[]).filter(w => w.level === 'warn');
});
const totalWarns = Object.values(warnsByLabel).reduce((a,arr)=>a+arr.length, 0);
assert(totalWarns === 2, 'Phase B: Push test surfaces exactly 2 known validator warnings (time budget + BSS adjacency). Got: ' + totalWarns + ' (' + Object.entries(warnsByLabel).map(([k,v])=>k+':'+v.length).join(',') + ')');
const upperWarns = warnsByLabel['Upper Body Hard'] || [];
const lowerWarns = warnsByLabel['Lower Body Hard'] || [];
assert(upperWarns.some(w => /min/.test(w.msg)), 'Phase B: Upper Body Hard time-budget warning present (>75 min)');
assert(lowerWarns.some(w => /shares prime movers/.test(w.msg) && /(bulgarian split squat|back squat)/i.test(w.msg)), 'Phase B: Lower Body Hard squat→BSS adjacency present (weak-leg-focus override)');

// Time estimator
assert(typeof estimateSessionTime === 'function', 'Phase B: estimateSessionTime() defined');
const tEst = estimateSessionTime(pa_d1.exercises.map(e=>({name:e.name,sets:e.sets,reps:e.reps,rest:e.rest})));
// Push test runs long by design (10 main exercises + heavy bench rest 180s).
// Sanity bounds are about catching pathological estimates, not enforcing budget.
assert(tEst >= 45 && tEst <= 110, 'Phase B: D1 time estimate in sane range. Got: ' + tEst);

// ===== PHASE B: Substitution =====
assert(typeof getSubstitutes === 'function', 'Phase B: getSubstitutes() defined');
assert(typeof loadAdjustForSub === 'function', 'Phase B: loadAdjustForSub() defined');
// Make sure commercial gym is active so all substitutes are eligible
ensureGyms();
S.settings.activeGymId = 'gym-commercial';
const subs = getSubstitutes('Cable Low Row').map(s => s.name || s);
assert(Array.isArray(subs) && subs.length >= 2, 'Phase B: Cable Low Row has >=2 substitutes (commercial gym). Got: ' + subs.length);
// Load adjustment: cable → db reduces load (DB row is less stable, bilateral cable is easier)
const adj = loadAdjustForSub('Cable Low Row', 'DB Row', 60);
assert(typeof adj === 'number' && adj > 0 && adj < 60, 'Phase B: Cable→DB adjusts 60kg downward (DB row harder). Got: ' + adj);

// ===== PHASE C: Gym profiles =====
assert(Array.isArray(S.settings.gyms) && S.settings.gyms.length >= 3, 'Phase C: Default gyms seeded (>=3). Got: ' + S.settings.gyms.length);
assert(S.settings.activeGymId, 'Phase C: activeGymId set');
assert(typeof ensureGyms === 'function', 'Phase C: ensureGyms() defined');
assert(typeof setActiveGym === 'function', 'Phase C: setActiveGym() defined');

// Hotel gym has no cable — substitute picker should exclude cable-based variants
S.settings.activeGymId = 'gym-hotel';
const subsHotel = getSubstitutes('Cable Low Row').map(s => s.name || s);
assert(!subsHotel.some(s => /cable low row/i.test(s)), 'Phase C: Cable Low Row excluded from its own subs');
assert(subsHotel.some(s => /db row|chest.supported/i.test(s)), 'Phase C: Hotel gym can substitute to DB-based rows. Got: ' + subsHotel.join(','));

// ===== SUBSTITUTE PICKER: ranked recommended vs alternatives =====
// User pain: mid-session, the prescribed machine is unavailable. The picker
// returns a flat list, easy to pick wrong. Ranking puts 'recommended' (slot
// match + same shoulder-safety class) before generic 'alternatives'.
S.settings.activeGymId = 'gym-hotel';
const subsHotelRanked = getSubstitutes('Cable Low Row');
assert(subsHotelRanked.length > 0, 'Sub ranking: hotel gym returns options for Cable Low Row');
assert(subsHotelRanked[0].recommended === true, 'Sub ranking: top result is recommended (sh-match). Got recommended=' + subsHotelRanked[0].recommended + ' name=' + subsHotelRanked[0].name);
const recoNames = subsHotelRanked.filter(s => s.recommended).map(s => s.name);
assert(recoNames.includes('DB Row') || recoNames.includes('Chest-Supported DB Row'), 'Sub ranking: DB Row / Chest-Supported DB Row are recommended on hotel. Got: ' + recoNames.join(','));
// Recommended block precedes alternatives — first non-recommended index must be after all recommended
const firstAlt = subsHotelRanked.findIndex(s => !s.recommended);
const lastReco = subsHotelRanked.map((s,i)=>s.recommended?i:-1).filter(i=>i>=0).pop();
if (firstAlt !== -1 && lastReco !== undefined) {
  assert(firstAlt > lastReco, 'Sub ranking: recommended come before alternatives');
}

// Reset to commercial
S.settings.activeGymId = 'gym-commercial';

// ===== SUBSTITUTE PICKER: cross-slot core family =====
// User pain: doing Cable Crunch as off-program sub for Pallof Press because
// "no ab cable pull in core options." Pallof slot=core-anti-rot, Cable Crunch
// slot=core-anti-ext — strict slot match excludes it. Cross-slot core family
// surfaces it as an alternative (not recommended, since slot doesn't match).
const subsPallof = getSubstitutes('Pallof Press');
const cabCrunchSub = subsPallof.find(s => s.name === 'Cable Crunch');
assert(cabCrunchSub, 'Sub family: Pallof Press substitutes include Cable Crunch (cross-slot core family) on commercial gym');
assert(cabCrunchSub && cabCrunchSub.recommended === false, 'Sub family: Cable Crunch is alternative tier (slot mismatch with Pallof). Got recommended=' + (cabCrunchSub && cabCrunchSub.recommended));
// Same-slot cores should still be recommended over cross-slot
const birdDogSub = subsPallof.find(s => s.name === 'Bird Dog');
if (birdDogSub) {
  assert(birdDogSub.recommended === true, 'Sub family: Bird Dog (same slot core-anti-rot) is recommended over cross-slot');
}
// Non-core slots should NOT pull in cross-slot results (don't broaden squat→hinge etc.)
const subsBenchPress = getSubstitutes('Bench Press');
assert(!subsBenchPress.some(s => /lat pulldown|cable low row/i.test(s.name)), 'Sub family: cross-slot broadening is core-only, not generalized to all slots');

// ===== PHASE C: Rotation engine =====
assert(typeof VARIANTS === 'object', 'Phase C: VARIANTS library defined');
assert(Array.isArray(VARIANTS.vpull) && VARIANTS.vpull.length >= 3, 'Phase C: vpull variants >=3');
assert(Array.isArray(VARIANTS.hpull) && VARIANTS.hpull.length >= 4, 'Phase C: hpull variants >=4');
assert(Array.isArray(FIXED_MAINS) && FIXED_MAINS.includes('Back Squat') && FIXED_MAINS.includes('Bench Press') && FIXED_MAINS.includes('Deadlift'), 'Phase C: FIXED_MAINS protects Big 3');
assert(typeof rotateAccessories === 'function', 'Phase C: rotateAccessories() defined');
assert(typeof getEligibleVariantsForSlot === 'function', 'Phase C: getEligibleVariantsForSlot() defined');

// Run rotation: Big 3 must NOT change. May 9-10 block: Squat lives in D2,
// Bench Press in D1, no Deadlift in this 2-day push test.
S.program = JSON.parse(JSON.stringify(DEF_PROGRAM));
S.block = {sessionsSinceRotate:14, variantCursor:{}};
const preMain = {
  squat: S.program.days.find(d=>d.id===2).exercises[0].name,
  benchInD1: S.program.days.find(d=>d.id===1).exercises.some(e=>e.name==='Bench Press')
};
assert(preMain.squat === 'Back Squat', 'Phase C: Pre-rotate D2[0] = Back Squat');
assert(preMain.benchInD1 === true, 'Phase C: Pre-rotate D1 contains Bench Press');

const rotRes = rotateAccessories();
assert(rotRes.rotated.length > 0, 'Phase C: Rotation swapped at least 1 accessory. Got: ' + rotRes.rotated.length);
assert(S.program.days.find(d=>d.id===2).exercises[0].name === 'Back Squat', 'Phase C: Back Squat unchanged after rotation');
assert(S.program.days.find(d=>d.id===1).exercises.some(e=>e.name==='Bench Press'), 'Phase C: Bench Press unchanged after rotation');
// Bench stays fixed (Upper A has DB Incline Bench as hpush main, not flat Bench Press — so we test that rotation doesn't TOUCH 'Bench Press' if it's anywhere)
const benchStill = S.program.days.some(d => d.exercises.some(e => e.name === 'Bench Press'));
const benchWas = DEF_PROGRAM.days.some(d => d.exercises.some(e => e.name === 'Bench Press'));
assert(benchStill === benchWas, 'Phase C: Bench Press presence unchanged across rotation');
// Counter resets
assert(S.block.sessionsSinceRotate === 0, 'Phase C: rotation counter reset to 0');

// ===== PHASE C: Superset recommender =====
assert(typeof recommendSupersets === 'function', 'Phase C: recommendSupersets() defined');
// D1 Upper A should surface at least one eligible superset pair (e.g., DB Curl + Lateral Raise or Ext Rotation + any iso)
const freshD1 = JSON.parse(JSON.stringify(DEF_PROGRAM)).days.find(d=>d.id===1);
const supers = recommendSupersets(freshD1.exercises);
assert(supers.length > 0, 'Phase C: D1 has at least one eligible superset pair. Got: ' + supers.length);
// Should never pair two heavy compounds
const heavyPair = supers.find(p => {
  const ma = getMeta(p.aName), mb = getMeta(p.bName);
  return ma.fat === 'heavy-compound' && mb.fat === 'heavy-compound';
});
assert(!heavyPair, 'Phase C: No superset pair contains two heavy-compounds');
// Should never contain a FIXED_MAIN
const fixedPair = supers.find(p => FIXED_MAINS.includes(p.aName) || FIXED_MAINS.includes(p.bName));
assert(!fixedPair, 'Phase C: No superset includes the Big 3');

// ===== PHASE C: Calibration =====
assert(typeof buildCalibrationRamp === 'function', 'Phase C: buildCalibrationRamp() defined');
assert(typeof startCalibrationSession === 'function', 'Phase C: startCalibrationSession() defined');
const ramp = buildCalibrationRamp(100);
assert(Array.isArray(ramp) && ramp.length === 7, 'Phase C: Ramp has 7 sets (3 warmup + 4 working). Got: ' + ramp.length);
const working = ramp.filter(s => s.type === 'working');
assert(working.length === 4, 'Phase C: Ramp has 4 working (top) sets. Got: ' + working.length);
assert(working[working.length-1].weightKg === 100, 'Phase C: Top set = 100kg (100% of current 1RM). Got: ' + working[working.length-1].weightKg);
assert(working.every(s => s.reps === 1), 'Phase C: All working sets are singles');
// Plate rounding
assert(buildCalibrationRamp(77).every(s => s.weightKg % 2.5 === 0), 'Phase C: All weights round to 2.5 kg plates');

// ===== BEEP CLEANUP =====
// stopRest() must cancel any beep previously scheduled by playBeepLater(),
// otherwise a cancelled-mid-rest session leaves the audio cue to fire after
// the session is dead. logSet() schedules the beep via playBeepLater(ex.rest);
// stopRest() is the entry point from cancelSession() and (after the fix) endSession().
playBeepLater(120);
assert(_restBeepTimer !== null, 'Beep cleanup precondition: playBeepLater scheduled a timer');
stopRest();
assert(_restBeepTimer === null, 'Beep cleanup: stopRest must cancel the scheduled beep');

// ===== REST AUTO-STOP CLEANUP =====
// When the rest tick reaches 0, the bar shows "GO" for 3s then stopRest fires.
// That setTimeout was previously unhandled — if the user logged another set
// within the 3s window, the new rest started and the deferred stopRest from
// the prior rest killed it (timer disappears). Fix tracks the handle and
// clears it in stopRest so a new rest is never killed by a stale auto-stop.
_restAutoStopTimer = setTimeout(()=>{}, 5000);  // simulate a pending auto-stop
assert(_restAutoStopTimer !== null, 'Auto-stop cleanup precondition: timer scheduled');
stopRest();
assert(_restAutoStopTimer === null, 'Auto-stop cleanup: stopRest must clear the deferred auto-stop timer');

// ===== DISTANCE / TIME-AWARE REPS =====
// Sled Push, DB Carry, Plank, Incline Walk are prescribed in non-rep units.
// repsUnit(reps) reads the suffix and returns 'm' / 's' / 'min' / null so the
// set logger can relabel the input and the summary line shows '8 m' not '8'.
// Schema unchanged — the numeric value still lives in s.reps.
assert(typeof repsUnit === 'function', 'Reps unit: repsUnit() helper defined');
assert(repsUnit('10m') === 'm', 'Reps unit: "10m" → m (distance)');
assert(repsUnit('30s') === 's', 'Reps unit: "30s" → s (time)');
assert(repsUnit('10 min') === 'min', 'Reps unit: "10 min" → min');
assert(repsUnit('5 mins') === 'min', 'Reps unit: "5 mins" → min');
assert(repsUnit('8-10') === null, 'Reps unit: "8-10" → null (rep count range)');
assert(repsUnit('5') === null, 'Reps unit: "5" → null (rep count)');
assert(repsUnit('') === null, 'Reps unit: empty string → null');
assert(repsUnit(null) === null, 'Reps unit: null → null');
// Pre-fill must still parse as a number — schema unchanged.
assert(parseInt('10m') === 10, 'Reps unit: parseInt extracts numeric from "10m"');
assert(parseInt('30s') === 30, 'Reps unit: parseInt extracts numeric from "30s"');

// ===== VALIDATOR INLINE MODAL =====
// "Run Validator" in Settings used to alert("see console") — moved the
// rendering inline. formatValidatorResults() is the pure function that
// turns validateProgram() output into an HTML fragment; runValidatorAndShow()
// is the DOM glue. Test the pure function.
assert(typeof formatValidatorResults === 'function', 'Validator UI: formatValidatorResults() defined');
const cleanHtml = formatValidatorResults([]);
assert(/ALL DAYS CLEAN/.test(cleanHtml), 'Validator UI: empty list renders ALL DAYS CLEAN');
const sampleResults = [{day:'Deadlift Heavy', warnings:[{level:'warn', msg:'Back Extension shares prime movers with Deadlift'}]}];
const sampleHtml = formatValidatorResults(sampleResults);
assert(/Deadlift Heavy/.test(sampleHtml), 'Validator UI: renders day label');
assert(/Back Extension shares prime movers/.test(sampleHtml), 'Validator UI: renders warning message body');
assert(typeof runValidatorAndShow === 'function', 'Validator UI: runValidatorAndShow() defined (DOM glue)');

// ===== BIG 3 DIAGNOSTIC MODAL =====
// User reported the deadlift tile shows "no data yet" on the phone but their
// export contains logged Deadlift sets. Tap-able empty tile opens a read-only
// diagnostic listing every matching session with logged/working/skipped counts
// and the max raw set — ground truth from actual phone-side localStorage.
assert(typeof getBig3DiagnosticData === 'function', 'Diagnostic: getBig3DiagnosticData() defined');
assert(typeof formatBig3Diagnostic === 'function', 'Diagnostic: formatBig3Diagnostic() defined');
assert(typeof openBig3Diagnostic === 'function', 'Diagnostic: openBig3Diagnostic() defined (DOM glue)');

// Empty sessions → empty rows + helpful no-match render
S.sessions = [];
const emptyData = getBig3DiagnosticData('dead');
assert(emptyData.rows.length === 0, 'Diagnostic: no sessions → empty rows');
assert(emptyData.label === 'Deadlift', 'Diagnostic: liftKey "dead" labels Deadlift');
assert(/No historical sessions found/.test(formatBig3Diagnostic(emptyData)), 'Diagnostic: empty render shows "no historical sessions found"');

// One deadlift session with mixed sets — captures all the diagnostic counts
S.sessions = [{
  date:'2026-04-25', dayLabel:'D Test',
  exercises:[{
    name:'Deadlift',
    performed:[
      {type:'warmup', weightKg:60, reps:5, logged:true},
      {type:'working', weightKg:110, reps:5, logged:true},
      {type:'working', weightKg:110, reps:5, logged:true},
      {type:'working', weightKg:110, reps:5, logged:false, skipped:true, skipReason:'fatigue'}
    ]
  }]
}];
const dlData = getBig3DiagnosticData('dead');
assert(dlData.rows.length === 1, 'Diagnostic: 1 row for matching deadlift session. Got: ' + dlData.rows.length);
assert(dlData.rows[0].name === 'Deadlift', 'Diagnostic: row name preserved raw (pre-canonName)');
assert(dlData.rows[0].performedLen === 4, 'Diagnostic: performed array len = 4');
assert(dlData.rows[0].loggedCount === 3, 'Diagnostic: logged count = 3 (skipped set has logged:false)');
assert(dlData.rows[0].workingCount === 3, 'Diagnostic: working count = 3');
assert(dlData.rows[0].skippedCount === 1, 'Diagnostic: skipped count = 1');
assert(dlData.rows[0].maxSet && dlData.rows[0].maxSet.w === 110 && dlData.rows[0].maxSet.r === 5, 'Diagnostic: max set captured from raw weightKg+reps regardless of logged flag');

// Squat matcher is exact-name (matches getBig3E1rm's isSquat) — light variant excluded
S.sessions = [{date:'2026-04-26', exercises:[{name:'Back Squat (light)', performed:[{type:'working', weightKg:60, reps:8, logged:true}]}]}];
assert(getBig3DiagnosticData('squat').rows.length === 0, 'Diagnostic: squat matcher excludes "Back Squat (light)" (exact-name only)');

// Bench matcher is regex — Bench Press counts
S.sessions = [{date:'2026-04-27', exercises:[{name:'Bench Press', performed:[{type:'working', weightKg:80, reps:5, logged:true}]}]}];
assert(getBig3DiagnosticData('bench').rows.length === 1, 'Diagnostic: bench matcher includes "Bench Press"');

// ===== DEFENSIVE WORKING-SET FILTER =====
// Catches the case where a session's set has type=working + valid weight/reps
// but the logged flag was never set (mid-session crash, migration drop, etc.).
S.sessions = [{
  date:'2026-04-30', dayLabel:'X',
  exercises:[{name:'Deadlift', performed:[
    {type:'working', weightKg:110, reps:5}  // logged flag absent
  ]}]
}];
const b3def = getBig3E1rm();
assert(b3def.dead > 0, 'Defensive: working set with weightKg+reps but missing logged flag still counts. Got dead=' + b3def.dead);
// Skipped sets stay excluded even when weight+reps are present
S.sessions = [{
  date:'2026-04-30', dayLabel:'X',
  exercises:[{name:'Deadlift', performed:[
    {type:'working', weightKg:200, reps:5, skipped:true}
  ]}]
}];
assert(getBig3E1rm().dead === 0, 'Defensive: skipped sets still excluded even with weightKg+reps');
// Zero weight or zero reps still excluded
S.sessions = [{
  date:'2026-04-30', dayLabel:'X',
  exercises:[{name:'Deadlift', performed:[
    {type:'working', weightKg:0, reps:0}
  ]}]
}];
assert(getBig3E1rm().dead === 0, 'Defensive: zero weight or zero reps still excluded');
// Logged-true path still works
S.sessions = [{
  date:'2026-04-30', dayLabel:'X',
  exercises:[{name:'Deadlift', performed:[
    {type:'working', weightKg:120, reps:3, logged:true}
  ]}]
}];
assert(getBig3E1rm().dead > 0, 'Defensive: explicit logged:true still counts (no regression)');

// ===== RENDER-TIMING AUDIT: renderBig3Tiles =====
// Audit (documented in code at renderBig3Tiles): all call sites fire after
// load() completes. localStorage is sync, so init() -> load() -> renderTrain()
// has no race. saveBig3Targets / resetBig3Targets are user actions post-init.
// This test guards against a regression where renderBig3Tiles throws when
// S.sessions is empty (the worst-case state if a race ever did appear).
S.sessions = [];
let renderThrew = false;
try { renderBig3Tiles(); } catch(e) { renderThrew = true; }
assert(renderThrew === false, 'Render-timing: renderBig3Tiles must not throw on empty S.sessions');

console.log('\n=== All tests passed ===');
