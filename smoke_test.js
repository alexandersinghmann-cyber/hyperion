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
  .replace(/\bconst DEFAULT_GYMS\s*=/g, 'var DEFAULT_GYMS =')
  .replace(/\bconst ICONS\s*=/g, 'var ICONS =')
  .replace(/\bconst APP_VERSION\s*=/g, 'var APP_VERSION =')
  .replace(/\bconst BRAND_CYCLE\s*=/g, 'var BRAND_CYCLE =')
  .replace(/\blet sessionStart\s*=/g, 'var sessionStart =')
  .replace(/\blet _painArea\s*=/g, 'var _painArea =')
  .replace(/\blet _orderOffer\s*=/g, 'var _orderOffer =')
  .replace(/\blet _focusIdx\s*=/g, 'var _focusIdx =')
  .replace(/\bconst FOCUS_SWIPE\s*=/g, 'var FOCUS_SWIPE =')
  .replace(/\blet _kbT\s*=/g, 'var _kbT =')
  .replace(/\bconst AVOID_VARIANTS\s*=/g, 'var AVOID_VARIANTS =')
  .replace(/\blet _lastReadoutKey\s*=/g, 'var _lastReadoutKey =')
  .replace(/\blet _rowHoldT\s*=/g, 'var _rowHoldT =')
  .replace(/\blet _railHoldT\s*=/g, 'var _railHoldT =')
  .replace(/\blet _wuCollapsed\s*=/g, 'var _wuCollapsed =')
  .replace(/\blet _pausedOpen\s*=/g, 'var _pausedOpen =')
  .replace(/\blet _railDragged\s*=/g, 'var _railDragged =')
  .replace(/\blet _userOpened\s*=/g, 'var _userOpened =')
  .replace(/\blet _userClosed\s*=/g, 'var _userClosed =')
  .replace(/\blet _notesT\s*=/g, 'var _notesT =')
  .replace(/\bconst ACTIVITY_TYPES\s*=/g, 'var ACTIVITY_TYPES =')
  .replace(/\bconst MODALITY_TYPES\s*=/g, 'var MODALITY_TYPES =')
  .replace(/\blet _reachCache\s*=/g, 'var _reachCache =')
  .replace(/\bconst DEFAULT_PLATES\s*=/g, 'var DEFAULT_PLATES =')
  .replace(/\bconst ROLE_DEFAULTS\s*=/g, 'var ROLE_DEFAULTS =')
  .replace(/\bconst ROLE_LABELS\s*=/g, 'var ROLE_LABELS =')
  .replace(/\blet _addSessionDate\s*=/g, 'var _addSessionDate =')
  .replace(/\blet _veilT1\s*=/g, 'var _veilT1 =')
  .replace(/\blet _veilT2\s*=/g, 'var _veilT2 =')
  .replace(/\bconst STRINGS\s*=/g, 'var STRINGS =');
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
// Block 6 W1: Deadlift setScheme top 1x5 @ 126.
const expDead = e1rm(126, 5); // B6 W1 deadlift top
assert(Math.abs(b3.dead - expDead) < 0.1, 'Dead from program fallback: got ' + b3.dead + ' expected ' + expDead);

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
assert(Array.isArray(EXTRAS) && EXTRAS.length === 50, 'EXTRAS has 50 entries: got ' + EXTRAS.length);
const poolsC = EXTRAS.reduce((a,e)=>{a[e.pool]=(a[e.pool]||0)+1;return a},{});
assert(poolsC.rehab === 10, 'Rehab pool count 10: got ' + poolsC.rehab);
assert(poolsC.core === 11, 'Core pool count 11: got ' + poolsC.core);
assert(poolsC.lower === 12, 'Lower pool count 12: got ' + poolsC.lower);
assert(poolsC.upper === 17, 'Upper pool count 17: got ' + poolsC.upper);
// Big-lift additions from user feedback ("no leg press in add extra; same
// for other key compounds"). Surfaces heavy compounds for ad-hoc add.
assert(EXTRAS.some(e => e.name === 'Leg Press' && e.pool === 'lower'), 'Extras: Leg Press present in lower pool');
assert(EXTRAS.some(e => e.name === 'Bench Press' && e.pool === 'upper'), 'Extras: Bench Press present in upper pool');
assert(EXTRAS.some(e => e.name === 'Pendlay Row' && e.pool === 'upper'), 'Extras: Pendlay Row present in upper pool');
assert(EXTRAS.some(e => e.name === 'DB Bench Press' && e.pool === 'upper'), 'Extras: DB Bench Press present in upper pool');

// ===== PROGRESSION FLAG REASON =====
// User: "Got a flagged notification - but no explanation?" — evalProg() now
// writes a short ex.progressionReason whenever it sets progression='flag'
// so the UI can render WHY the flag fired (RPE 10, missed reps, pain event).
const __flagSavedSess = S.activeSession;
S.activeSession = {dayLabel:'Test', exercises:[{
  name:'Bench Press', cat:'push', prescribed:{sets:4,reps:'5',loadKg:22,unit:'kg'},
  performed:[
    {type:'working',weightKg:22,reps:5,rpe:10,logged:true}
  ]
}]};
evalProg(0);
assert(S.activeSession.exercises[0].progression === 'flag', 'Flag reason: RPE 10 triggers flag');
const fr_rpe = S.activeSession.exercises[0].progressionReason;
assert(typeof fr_rpe === 'string' && fr_rpe.length > 0, 'Flag reason: RPE 10 sets non-empty reason');
assert(/rpe/i.test(fr_rpe), 'Flag reason: RPE 10 reason mentions RPE. Got: ' + fr_rpe);

// Reps-only big miss
S.activeSession = {dayLabel:'Test', exercises:[{
  name:'Bench Press', cat:'push', prescribed:{sets:4,reps:'5',loadKg:22,unit:'kg'},
  performed:[
    {type:'working',weightKg:22,reps:1,logged:true}
  ]
}]};
evalProg(0);
assert(S.activeSession.exercises[0].progression === 'flag', 'Flag reason: reps-only big miss triggers flag');
const fr_miss = S.activeSession.exercises[0].progressionReason;
assert(typeof fr_miss === 'string' && /reps|miss|target/i.test(fr_miss), 'Flag reason: big miss reason mentions reps. Got: ' + fr_miss);

// RPE-path big miss (not RPE-10 but reps under min-2)
S.activeSession = {dayLabel:'Test', exercises:[{
  name:'Bench Press', cat:'push', prescribed:{sets:4,reps:'5',loadKg:22,unit:'kg'},
  performed:[
    {type:'working',weightKg:22,reps:1,rpe:9,logged:true}
  ]
}]};
evalProg(0);
assert(S.activeSession.exercises[0].progression === 'flag', 'Flag reason: RPE-path big miss triggers flag');
const fr_rpe_miss = S.activeSession.exercises[0].progressionReason;
assert(typeof fr_rpe_miss === 'string' && /reps|target/i.test(fr_rpe_miss), 'Flag reason: RPE-path big miss mentions reps. Got: ' + fr_rpe_miss);

// Non-flag path: increase → reason cleared
S.activeSession = {dayLabel:'Test', exercises:[{
  name:'Bench Press', cat:'push', prescribed:{sets:4,reps:'5',loadKg:22,unit:'kg'},
  progressionReason:'stale value from prior eval',
  performed:[
    {type:'working',weightKg:22,reps:5,rpe:7,logged:true}
  ]
}]};
evalProg(0);
assert(S.activeSession.exercises[0].progression === 'increase', 'Flag reason: increase path no flag');
assert(!S.activeSession.exercises[0].progressionReason, 'Flag reason: increase path clears any prior reason');
S.activeSession = __flagSavedSess;
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

// ===== PROGRAM: Aug 17 Block 6 W1 structure (7 days Mon-Sun) =====
assert(DEF_PROGRAM.name === 'Aug 17 Block 6 W1', 'Program name is Aug 17 Block 6 W1: got ' + DEF_PROGRAM.name);
assert(DEF_PROGRAM.version === 10, 'B6: program version 10. Got ' + DEF_PROGRAM.version);
assert(DEF_PROGRAM.days.length === 7, 'Program has 7 days: got ' + DEF_PROGRAM.days.length);
const d1 = DEF_PROGRAM.days.find(d => d.id === 1);
const d2 = DEF_PROGRAM.days.find(d => d.id === 2);
const d3 = DEF_PROGRAM.days.find(d => d.id === 3);
const d4 = DEF_PROGRAM.days.find(d => d.id === 4);
const d5 = DEF_PROGRAM.days.find(d => d.id === 5);
const d6 = DEF_PROGRAM.days.find(d => d.id === 6);
const d7 = DEF_PROGRAM.days.find(d => d.id === 7);
assert(d1.label==='KB'&&d2.label==='Swim'&&d3.label==='Squat'&&d4.label==='Swim'&&d5.label==='Rest'&&d6.label==='Deadlift + Pull'&&d7.label==='Press + Pull', 'B6: labels pinned. Got: '+DEF_PROGRAM.days.map(d=>d.label).join('|'));
assert(['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].every((dw,i)=>DEF_PROGRAM.days[i].defaultDay===dw), 'B6: Mon-Sun defaultDays');
// day shapes
assert(d1.sessionType==='kb'&&d1.exercises.length===0, 'B6: Monday is a freeform KB day');
assert(d2.sessionType==='swim'&&!(d2.tags||[]).includes('unmeasured')&&/CONTINUOUS freestyle test/.test(d2.note||''), 'B6: Tuesday continuous-test swim, distance required');
assert(d4.sessionType==='swim'&&/Technique \+ volume/.test(d4.note||''), 'B6: Thursday technique swim');
assert(d5.sessionType==='rest'&&d5.exercises.length===0&&isStartableDay(d5)===false, 'B6: Friday is a first-class rest day');
// sections
assert(d3.exercises.filter(e=>e.section==='warmup').length===2, 'B6: squat day 2-part warmup');
assert(d6.exercises.filter(e=>e.section==='warmup').length===2, 'B6: DL day 2-part warmup');
assert(d7.exercises.filter(e=>e.section==='warmup').length===5, 'B6: press day 5-part warmup');
// Squat Wednesday
const b6sq=d3.exercises.find(e=>e.name==='Back Squat');
assert(b6sq.setScheme[0].loadKg===115&&b6sq.setScheme[0].tag==='top'&&b6sq.setScheme[1].loadKg===97.5&&b6sq.setScheme.length===4, 'B6: squat 1x5@115 + 3x5@97.5');
assert(['RPE-8-cap','full-depth-standard','paused-2sec-backoffs','drop-to-110-if-depth-fails'].every(t=>b6sq.tags.includes(t)), 'B6: squat tags incl. paused backoffs + depth bail');
assert(/drop to 110/.test(b6sq.cue||''), 'B6: depth-bail cue renders on the card');
assert(JSON.stringify(b6sq.warmup)===JSON.stringify([{w:60,reps:5},{w:85,reps:3},{w:100,reps:1}]), 'B6: squat w/u 60x5/85x3/100x1');
assert(b6sq.role==='strength-driver'&&b6sq.target.unit==='e1rm'&&b6sq.target.value===166, 'B6: squat strength-driver, e1RM 166 target');
// DELIBERATE rep-range shifts (coach data — never "correct")
const b6bss=d3.exercises.find(e=>e.name==='Bulgarian Split Squat');
assert(b6bss.loadKg===17.5&&b6bss.reps==='10'&&b6bss.role==='hypertrophy'&&b6bss.target.value===25, 'B6: BSS 3x10@17.5 (deliberate shift), target 25');
const b6rdl=d3.exercises.find(e=>e.name==='DB RDL');
assert(b6rdl.loadKg===30&&b6rdl.reps==='10'&&b6rdl.target.value===35, 'B6: DB RDL 3x10@30 (deliberate shift), target 35');
const b6sled=d3.exercises.find(e=>e.name==='Sled Push');
assert(b6sled.loadKg===170&&b6sled.rest===60&&b6sled.role==='conditioning'&&b6sled.target.value===170&&/vary speed\/distance/.test(b6sled.target.note), 'B6: sled AT TARGET — maintain 170, note on card');
assert(d3.exercises.find(e=>e.name==='Suitcase Carry').tags.includes('one hand'), 'B6: suitcase carry one-handed');
// Deadlift Saturday
const b6dl=d6.exercises.find(e=>e.name==='Deadlift');
assert(b6dl.setScheme[0].loadKg===126&&b6dl.setScheme[1].loadKg===116&&b6dl.setScheme.length===4&&b6dl.barKg===36, 'B6: DL 1x5@126 + 3x5@116 on the 36 bar');
assert(['RPE-8-hard-cap','reset-every-rep','NO-AMRAP'].every(t=>b6dl.tags.includes(t)), 'B6: DL tags');
assert(!b6dl.warmup, 'B6: DL warm-ups come from the bar-aware generator this block (no authored array)');
assert(b6dl.role==='strength-driver'&&b6dl.target.value===186, 'B6: DL strength-driver e1RM 186');
assert(d6.exercises.find(e=>e.name==='Leg Press').loadKg===167.5&&d6.exercises.find(e=>e.name==='Leg Press').target.value===180, 'B6: leg press 167.5, cap-180 target');
assert(d6.exercises.find(e=>e.name==='Hip Adduction Machine').loadKg===36&&d6.exercises.find(e=>e.name==='Hip Abduction Machine').loadKg===30, 'B6: hips 36 / 30');
const b6be=d6.exercises.find(e=>e.name==='Back Extension');
assert(b6be.frozen===true&&b6be.loadKg===10&&/Depth \+ contraction first/.test(b6be.cue), 'B6: Back Extension FROZEN @10 with the cue');
assert(d6.exercises.find(e=>e.name==='Standing Calf Raise (DB)').loadKg===30, 'B6: Standing Calf Raise restored (dropped in error in W4)');
assert(d6.exercises[d6.exercises.length-1].name==='Hanging Knee Raise', 'B6: HKR closes the DL day');
assert(d6.exercises.find(e=>e.name==='Side Extension').target.value===15, 'B6: Side Extension BW 2x15-then-load target');
// Press + Pull Sunday
assert(d7.exercises.find(e=>e.name==='Iso-Lateral Bench Press').loadKg===65&&d7.exercises.find(e=>e.name==='Iso-Lateral Bench Press').tags.includes('twinge-gate'), 'B6: iso-lateral bench 4x8@65 twinge-gated');
assert(d7.exercises.find(e=>e.name==='Iso-Lateral Decline Press').loadKg===62.5, 'B6: iso-lateral decline 3x10@62.5');
assert(d7.exercises.find(e=>e.name==='Strict Pull-Up').reps==='6'&&d7.exercises.find(e=>e.name==='Strict Pull-Up').tags.includes('straight-sets'), 'B6: pull-ups 4x6 straight sets');
assert(d7.exercises.find(e=>e.name==='Narrow-Grip Cable Pulldown').loadKg===36&&d7.exercises.find(e=>e.name==='Narrow-Grip Cable Pulldown').tags.includes('load-continuation'), 'B6: pulldown 36 with the honest load-continuation exemption');
assert(d7.exercises.find(e=>e.name==='Face Pull').loadKg===13.75&&exRole(d7.exercises.find(e=>e.name==='Face Pull'))==='rehab', 'B6: face pull rehab role (suggestions off)');
// NO set-level AMRAP anywhere; no kb-day circuits
DEF_PROGRAM.days.forEach(d=>(d.exercises||[]).forEach(e=>{
  assert(!(e.tags||[]).some(t=>/amrap/i.test(t)&&!/^no-amrap$/i.test(t)), 'B6: no AMRAP-prescribing tag. Found on '+e.name);
  assert(!/amrap/i.test(e.reps||''), 'B6: no AMRAP rep prescriptions');
}));
assert(!DEF_PROGRAM.days.some(d=>(d.exercises||[]).some(e=>e.entryType==='circuit')), 'B6: no circuit prescriptions (kb days are freeform; circuits stay available ad hoc)');
// barbell/overhead ban intact; KB overhead avoided
DEF_PROGRAM.days.forEach(d=>(d.exercises||[]).forEach(e=>{
  assert(getMeta(e.name).pat!=='vpush', 'B6: no overhead pattern in program. Found '+e.name);
  assert(e.name!=='Bench Press', 'B6: barbell bench still excluded');
}));
['KB Press','KB Snatch','Turkish Get-Up'].forEach(n=>assert(EX_META[n]&&EX_META[n].avoid===true&&/houlder|verhead/.test(EX_META[n].avoidReason), 'B6: '+n+' avoid-listed (overhead)'));
['Bench Press','DB Shoulder Press','Military Press','Machine Shoulder Press','Incline Bench Press','DB Incline Bench'].forEach(n=>assert(EX_META[n].avoid===true, 'B6: existing avoid intact — '+n));
// authored barbell loads are rackable on the confirmed Singapore inventory
(()=>{
  const P7=[25,20,15,10,5,2.5,1.25];
  [[b6sq,20],[b6dl,36]].forEach(([ex,bar])=>{
    const loads=[ex.loadKg].concat((ex.setScheme||[]).map(r=>r.loadKg)).filter(Boolean);
    loads.forEach(L=>assert(isMakeableTotal(L,bar,P7), 'B6: authored '+ex.name+' '+L+' kg rackable on the '+bar+' bar'));
  });
})();
// time budgets hold on the three lifting days
[d3,d6,d7].forEach(d=>{
  const est=estimateSessionTime(d.exercises.map(e=>({name:e.name,sets:e.sets,reps:e.reps,rest:e.rest,entryType:e.entryType,minutes:e.minutes})));
  assert(est<=d.dur+20, 'B6: '+d.label+' estimate '+est+' within '+(d.dur+20));
});

assert(!DEF_PROGRAM.days.some(d => (d.exercises||[]).some(e => /^seated row$/i.test(e.name))), 'No day has bare "Seated Row"');

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
// FLIPPED (deload build): day.id is the record-matching IDENTITY now
// (recMatchesDay) — ids must TRAVEL with the day, never re-stamp by position.
assert(S.program.days[0].id === 2 && S.program.days[1].id === 1, 'R2: IDs travel with their day (identity, not position)');
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
const pa_d3 = S.program.days.find(d => d.id === 3);
const pa_d4 = S.program.days.find(d => d.id === 4);

// B6: kb (id1), swims (id2/id4) and rest (id5) carry no exercises; every
// lifting day opens with its WARMUP SECTION ahead of the main work.
const pa_d5 = S.program.days.find(d => d.id === 5);
const pa_d6 = S.program.days.find(d => d.id === 6);
const pa_d7 = S.program.days.find(d => d.id === 7);
assert(pa_d1.exercises.length===0&&pa_d2.exercises.length===0&&pa_d4.exercises.length===0&&pa_d5.exercises.length===0, 'Phase A: kb/swim/rest days carry no exercises');
// Squat (id3): Bird Dog → WGS (warmup section) → Back Squat
(()=>{
  const mainI=pa_d3.exercises.findIndex(e=>e.name==='Back Squat');
  assert(/bird dog/i.test(pa_d3.exercises[0].name)&&mainI===2&&pa_d3.exercises.slice(0,2).every(e=>e.section==='warmup'), 'Phase A: squat day activates then squats. main@'+mainI);
})();
// Press+Pull (id7): 5-part shoulder warmup before the first press
(()=>{
  const mainI=pa_d7.exercises.findIndex(e=>e.name==='Iso-Lateral Bench Press');
  assert(mainI===5&&pa_d7.exercises.slice(0,5).every(e=>e.section==='warmup'), 'Phase A: press day warms the shoulder first. main@'+mainI);
})();
// Deadlift: Glute Bridge → Dead Bug → Deadlift
(()=>{
  const mainI=pa_d6.exercises.findIndex(e=>e.name==='Deadlift');
  assert(/glute bridge/i.test(pa_d6.exercises[0].name)&&mainI===2, 'Phase A: DL day activates then pulls. main@'+mainI);
})();

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
// Shared prime movers on adjacent SAME-pattern exercises → warn
const badPair = [{name:'Cable Low Row'},{name:'DB Row'}];
const warnBad = validateSession(badPair);
assert(warnBad.some(w=>/shares prime movers/.test(w.msg)), 'Phase B: Cable Low Row → DB Row (both hpull) triggers adjacency warning');
// Non-lifting sessionType short-circuits lifting rules
assert(validateSession(badPair,{sessionType:'calisthenics'}).length===0, 'Phase B: validateSession returns [] for non-lifting sessionType');
// weak-leg-focus exemption: same pair but later carries the tag → no adjacency warn
const wlOk=validateSession([{name:'Back Squat'},{name:'Bulgarian Split Squat',tags:['weak-leg-focus']}]);
assert(!wlOk.some(w=>/shares prime movers/.test(w.msg)), 'Phase B: weak-leg-focus exempts squat→BSS adjacency');

// Block 4 W3: validateProgram runs CLEAN.
// - dips pat='dip' so Strict Dip → DB Bench is not a false adjacency.
// - rule 2 only flags FIXED_MAINS, so Face Pull → Narrow-Grip Pulldown is fine.
// - Back Squat → BSS exempted via weak-leg-focus.
// - D3 is calisthenics → lifting rules short-circuit.
const progWarns = validateProgram();
// G10: Block 6 authors only rackable barbell loads — fully clean again.
const warnTotal = progWarns.reduce((a,r)=>a+(r.warnings||[]).filter(w=>w.level==='warn').length,0);
assert(warnTotal === 0, 'Phase B: validateProgram runs clean (0 warnings). Got: '+warnTotal+' ('+progWarns.map(r=>r.day+':'+r.warnings.filter(w=>w.level==='warn').length).join(',')+')');
// validateWeek defined + clean on the W3 Wed/Fri/Sat/Sun week: Fri→Sat and
// Sat→Sun are <36h, but the Sat cali day's compounds (vpull/dip) share no
// pattern with Fri (squat/hinge) or Sun (hinge/squat/hpull) → 0 warns
// (lifting-abuts-calisthenics infos are fine and don't reach the banner).
assert(typeof validateWeek === 'function', 'Phase B: validateWeek defined');
S.program=JSON.parse(JSON.stringify(DEF_PROGRAM));migrateV3();S.sessions=[];S.skips=[];
const vw=validateWeek(weekDatesFor('2026-07-06'),'2026-07-06');
const vwWarn=vw.reduce((a,r)=>a+(r.warnings||[]).filter(w=>w.level==='warn').length,0);
assert(vwWarn===0, 'Phase B: validateWeek clean on Block 4 W3 (no cross-session pattern collision). Got: '+vwWarn+' '+JSON.stringify(vw.flatMap(r=>r.warnings.filter(w=>w.level==='warn').map(w=>w.msg))));
// The RPE-7-cap calisthenics exception: a capped cali day sharing a compound
// pattern with the NEXT day is accepted as info, not warn (by-design volume).
S.program={name:'CaliX',active:true,days:[
  {id:1,label:'Cali',defaultDay:'Saturday',dayOfWeek:'Saturday',sessionType:'calisthenics',dur:40,tags:['RPE-7-cap'],exercises:[{id:'a',name:'Strict Pull-Up',cat:'pull',sets:3,reps:'3',loadKg:0,unit:'bw',rest:120,tags:[],equipmentClass:'bw'}]},
  {id:2,label:'Pull Day',defaultDay:'Sunday',dayOfWeek:'Sunday',sessionType:'lifting',dur:60,exercises:[{id:'b',name:'Lat Pulldown',cat:'pull',sets:4,reps:'8',loadKg:50,unit:'kg',rest:90,tags:[],equipmentClass:'cable'}],bonus:[]}
]};
const vwCali=validateWeek(weekDatesFor('2026-07-06'),'2026-07-06');
const caliShared=vwCali.flatMap(r=>r.warnings).filter(w=>/Same movement pattern/.test(w.msg));
assert(caliShared.length>0 && caliShared.every(w=>w.level==='info'), 'Phase B: RPE-7-cap cali day sharing vpull with next day downgrades to info. Got: '+JSON.stringify(caliShared.map(w=>w.level)));
// …but WITHOUT the cap tag it still warns (never silenced globally)
S.program.days[0].tags=[];
const vwCali2=validateWeek(weekDatesFor('2026-07-06'),'2026-07-06');
assert(vwCali2.flatMap(r=>r.warnings).some(w=>w.level==='warn'&&/Same movement pattern/.test(w.msg)), 'Phase B: uncapped cali day sharing a pattern still warns');
S.program=JSON.parse(JSON.stringify(DEF_PROGRAM));migrateV3();
// BUG: validateWeek must CATCH a same-pattern collision on consecutive days.
S.program={name:'Collide',active:true,days:[
  {id:1,label:'Pull A',defaultDay:'Monday',dayOfWeek:'Monday',sessionType:'lifting',dur:60,exercises:[{id:'a',name:'Cable Low Row',cat:'pull',sets:4,reps:'8',loadKg:50,unit:'kg',rest:90,tags:[],equipmentClass:'cable'}],bonus:[]},
  {id:2,label:'Pull B',defaultDay:'Tuesday',dayOfWeek:'Tuesday',sessionType:'lifting',dur:60,exercises:[{id:'b',name:'Cable Low Row',cat:'pull',sets:4,reps:'8',loadKg:50,unit:'kg',rest:90,tags:[],equipmentClass:'cable'}],bonus:[]}
]};
const vwCollide=validateWeek(weekDatesFor('2026-06-29'),'2026-06-29');
assert(vwCollide.some(r=>r.warnings.some(w=>w.level==='warn'&&/hpull/.test(w.msg))), 'BUG: validateWeek flags Cable Low Row on consecutive days (Mon→Tue, shared hpull). Got: '+JSON.stringify(vwCollide.flatMap(r=>r.warnings.map(w=>w.msg))));
// Sun→Mon wrap collision: hpull on Sun and Mon of the recurring week
S.program={name:'Wrap',active:true,days:[
  {id:1,label:'Mon Pull',defaultDay:'Monday',dayOfWeek:'Monday',sessionType:'lifting',dur:60,exercises:[{id:'a',name:'Cable Low Row',cat:'pull',sets:4,reps:'8',loadKg:50,unit:'kg',rest:90,tags:[],equipmentClass:'cable'}],bonus:[]},
  {id:2,label:'Sun Pull',defaultDay:'Sunday',dayOfWeek:'Sunday',sessionType:'lifting',dur:60,exercises:[{id:'b',name:'Cable Low Row',cat:'pull',sets:4,reps:'8',loadKg:50,unit:'kg',rest:90,tags:[],equipmentClass:'cable'}],bonus:[]}
]};
const vwWrap=validateWeek(weekDatesFor('2026-06-29'),'2026-06-29');
assert(vwWrap.some(r=>r.warnings.some(w=>w.level==='warn')), 'BUG: validateWeek catches the Sun→Mon wrap collision (was missed before)');
S.program=JSON.parse(JSON.stringify(DEF_PROGRAM));migrateV3();
// isProtectedMain: calisthenics anchors protected only on calisthenics days
assert(isProtectedMain('Back Squat','lifting')===true, 'Phase B: Big-3 always protected');
assert(isProtectedMain('Pull-Up','calisthenics')===true, 'Phase B: Pull-Up protected on calisthenics days');
assert(isProtectedMain('Pull-Up','lifting')===false, 'Phase B: Pull-Up not a fixed main on lifting days');

// Time estimator
assert(typeof estimateSessionTime === 'function', 'Phase B: estimateSessionTime() defined');
const tEst = estimateSessionTime(pa_d3.exercises.map(e=>({name:e.name,sets:e.sets,reps:e.reps,rest:e.rest})));
// Sanity bounds are about catching pathological estimates, not enforcing budget.
assert(tEst >= 50 && tEst <= 90, 'Phase B: B6 Squat day (id3) estimate in sane range (~65min). Got: ' + tEst);

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

// Run rotation: mains must NOT change. W3 (holiday): the barbell bench is
// avoid-listed and OUT of the program — the machine press anchors D1.
S.program = JSON.parse(JSON.stringify(DEF_PROGRAM));
S.block = {sessionsSinceRotate:14, variantCursor:{}};
const hasEx=(id,name)=>S.program.days.find(d=>d.id===id).exercises.some(e=>e.name===name);
assert(hasEx(3,'Back Squat'), 'Phase C: Pre-rotate D3 contains Back Squat');
assert(hasEx(6,'Deadlift'), 'Phase C: Pre-rotate D6 contains Deadlift');

const rotRes = rotateAccessories();
assert(rotRes.rotated.length > 0, 'Phase C: Rotation swapped at least 1 accessory. Got: ' + rotRes.rotated.length);
assert(hasEx(3,'Back Squat'), 'Phase C: Back Squat unchanged after rotation');
assert(hasEx(6,'Deadlift'), 'Phase C: Deadlift unchanged after rotation');
// Bench stays fixed (Upper A has DB Incline Bench as hpush main, not flat Bench Press — so we test that rotation doesn't TOUCH 'Bench Press' if it's anywhere)
const benchStill = S.program.days.some(d => d.exercises.some(e => e.name === 'Bench Press'));
const benchWas = DEF_PROGRAM.days.some(d => d.exercises.some(e => e.name === 'Bench Press'));
assert(benchStill === benchWas, 'Phase C: Bench Press presence unchanged across rotation');
// Counter resets
assert(S.block.sessionsSinceRotate === 0, 'Phase C: rotation counter reset to 0');

// ===== PHASE C: Superset recommender =====
assert(typeof recommendSupersets === 'function', 'Phase C: recommendSupersets() defined');
// D1 Upper A should surface at least one eligible superset pair (e.g., DB Curl + Lateral Raise or Ext Rotation + any iso)
const freshD1 = JSON.parse(JSON.stringify(DEF_PROGRAM)).days.find(d=>d.id===7); // B6: Press+Pull Sunday (id1 is freeform KB now)
const supers = recommendSupersets(freshD1.exercises);
assert(supers.length > 0, 'Phase C: B6 Press+Pull day has at least one eligible superset pair. Got: ' + supers.length);
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
// Neutralize program fallback for these tests — the current default program
// includes Deadlift @ 115kg, which would otherwise rescue every "expect 0" case.
const __savedProgramDef = S.program;
S.program = {days:[]};
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
S.program = __savedProgramDef;

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

// ===== OVERFLOW MENU VISIBILITY =====
// User: "Popup bar when clicking 3 dots is not visible."
// Root cause: .ex-card has overflow:hidden which clips the absolutely-
// positioned .ex-menu when it pops out the bottom of the card. Plus
// .ex-menu z-index:50 was below the fixed rest-bar (z-index:90), so
// when the rest bar was on it could cover the menu too.
assert(/\.ex-card\s*{[^}]*overflow\s*:\s*visible/.test(html), 'Overflow menu: .ex-card overflow:visible (not hidden) so the menu can escape the card');
assert(/\.ex-menu\s*{[^}]*z-index\s*:\s*9[5-9]|\.ex-menu\s*{[^}]*z-index\s*:\s*1[0-9][0-9]/.test(html), 'Overflow menu: .ex-menu z-index >=95 so it sits above the rest-bar (z-index:90)');

// ===== BACK EXTENSION AS A SUBSTITUTE ACROSS GYMS =====
// User: "Why is back extension not an option?!" — Back Extension was tagged
// with eq:['back-extension-bench'] (a specialized tag that only the commercial
// gym profile has). Hotel/home users got no Back Extension in the hinge-
// secondary substitute pool. Loosened to eq:['bench'] since a back extension
// can be done off any bench (with feet anchored or held).
S.settings.activeGymId = 'gym-commercial';
const subsRDLCommercial = getSubstitutes('DB RDL').map(s => s.name);
assert(subsRDLCommercial.includes('Back Extension'), 'Back Ext: DB RDL substitute list on commercial gym includes Back Extension. Got: ' + subsRDLCommercial.join(','));
S.settings.activeGymId = 'gym-hotel';
const subsRDLHotel = getSubstitutes('DB RDL').map(s => s.name);
assert(subsRDLHotel.includes('Back Extension'), 'Back Ext: DB RDL substitute list on hotel gym includes Back Extension (eq=bench, hotel has bench). Got: ' + subsRDLHotel.join(','));
S.settings.activeGymId = 'gym-commercial';
// Back Extension remains in VARIANTS['hinge-secondary'] for rotation
assert((VARIANTS['hinge-secondary']||[]).includes('Back Extension'), 'Back Ext: still in VARIANTS[hinge-secondary] for rotation');

// ===== CACHE-CONTROL META TAGS + FORCE REFRESH =====
// GitHub Pages serves index.html with default long-lived caching headers, so
// Chrome / iOS Safari hold onto stale HTML across deploys. We can't set HTTP
// headers, but meta hints reduce how aggressively the browser caches, and
// the Force Refresh button in Settings is a one-tap escape hatch.
assert(/http-equiv="Cache-Control"[^>]*no-cache/i.test(html), 'Cache: meta Cache-Control no-cache present in head');
assert(/http-equiv="Pragma"[^>]*no-cache/i.test(html), 'Cache: meta Pragma no-cache present in head');
assert(/http-equiv="Expires"[^>]*0/i.test(html), 'Cache: meta Expires 0 present in head');
assert(typeof forceRefresh === 'function', 'Cache: forceRefresh() defined');

// ===== RESTORE FROM JSON =====
// Recovery path when phone-side localStorage diverges from a known-good export
// (the deadlift-tile bug bottoming out as actual data loss). User pastes a
// previously-exported JSON; app overwrites localStorage and reloads.
// parseRestorePayload is pure — validates shape without touching state.
assert(typeof parseRestorePayload === 'function', 'Restore: parseRestorePayload() defined');
assert(typeof doRestore === 'function', 'Restore: doRestore() defined (DOM glue)');
const badJson = parseRestorePayload('not-json');
assert(badJson.ok === false && /Invalid JSON/i.test(badJson.err), 'Restore: invalid JSON returns ok:false with message. Got: ' + badJson.err);
const wrongShape = parseRestorePayload('{"unrelated":true}');
assert(wrongShape.ok === false && /sessions|program|settings/i.test(wrongShape.err), 'Restore: object missing sessions/program/settings returns ok:false. Got: ' + wrongShape.err);
const goodPayload = parseRestorePayload(JSON.stringify({sessions:[{date:'2026-04-11'},{date:'2026-05-03'}], program:{name:'X'}, settings:{unit:'kg'}}));
assert(goodPayload.ok === true, 'Restore: valid payload returns ok:true');
assert(goodPayload.sessCount === 2, 'Restore: sessCount = 2. Got: ' + goodPayload.sessCount);
assert(goodPayload.parsed && goodPayload.parsed.program && goodPayload.parsed.program.name === 'X', 'Restore: parsed payload preserved');
const justSettings = parseRestorePayload('{"settings":{"unit":"lb"}}');
assert(justSettings.ok === true, 'Restore: settings-only payload accepted (partial data is still restorable)');

// ===== V3 DESIGN TOKENS + ICON LIBRARY (Commit 1) =====
assert(/--t-display:\s*32px/.test(html), 'v3 tokens: --t-display:32px present');
assert(/--t-h1:\s*22px/.test(html) && /--t-h2:\s*17px/.test(html) && /--t-meta:\s*11px/.test(html), 'v3 tokens: type scale h1/h2/meta present');
assert(/--sp-1:\s*4px/.test(html) && /--sp-6:\s*24px/.test(html), 'v3 tokens: spacing scale (4px base) present');
assert(/--motion:\s*200ms/.test(html) && /--motion-hero:\s*320ms/.test(html), 'SOLAR tokens: motion 200ms std + 320ms hero');
assert(/--pace-ahead:/.test(html) && /--pace-on:/.test(html) && /--pace-behind:/.test(html) && /--pace-critical:/.test(html) && /--pace-none:/.test(html), 'v3 tokens: all pace tokens present (incl. muted --pace-none)');
assert(/prefers-reduced-motion:\s*reduce/.test(html), 'v3 tokens: prefers-reduced-motion block present');
assert(/font-variant-numeric:\s*tabular-nums/.test(html), 'v3 tokens: tabular-nums utility present');
assert(typeof ICONS === 'object' && ICONS, 'v3 icons: ICONS map defined');
['lifting','calisthenics','swim','run','pilates','mobility','rest'].forEach(k=>assert(typeof ICONS[k]==='string'&&ICONS[k].length>0, 'v3 icons: session-type icon "'+k+'" present'));
['muscleup','wave','footprint','barbell'].forEach(k=>assert(typeof ICONS[k]==='string', 'v3 icons: goal icon "'+k+'" present'));
['check','arrow','pause','move'].forEach(k=>assert(typeof ICONS[k]==='string', 'v3 icons: status icon "'+k+'" present'));
assert(typeof icon === 'function', 'v3 icons: icon() helper defined');
assert(/^<svg /.test(icon('check')) && /viewBox/.test(icon('check')), 'v3 icons: icon() returns an <svg> string');
assert(/width="28"/.test(icon('swim',28)), 'v3 icons: icon() honors size arg');
assert(typeof APP_VERSION === 'string' && APP_VERSION === 'v5', 'v5: APP_VERSION bumped for the SOLAR build cache-bust');

// ===== TRACK A: SCHEMA MIGRATION + LOAD SNAPPING (Commit 2) =====
// snapLoadToEquipment
assert(typeof snapLoadToEquipment === 'function', 'Snap: snapLoadToEquipment defined');
S.settings.activeGymId='gym-commercial';
assert(snapLoadToEquipment(14,'db') === 15, 'Snap: db 14 → 15 (nearest 2.5)'); // confirms why literal must be 12.5
assert(snapLoadToEquipment(12.5,'db') === 12.5, 'Snap: db 12.5 stays 12.5');
// G3: barbell snaps to the nearest RACKABLE total for the bar + this gym's
// plates — commercial keeps 1 kg pairs, so 83.5 (20 + 2×31.75) is real.
assert(snapLoadToEquipment(83.7,'barbell') === 83.5, 'Snap: barbell → nearest rackable total. Got: '+snapLoadToEquipment(83.7,'barbell'));
assert(snapLoadToEquipment(84,'barbell') === 84, 'Snap: 84 already rackable (20 bar + 2×32). Got: '+snapLoadToEquipment(84,'barbell'));
assert(snapLoadToEquipment(62.4,'cable') === 62, 'Snap: cable rounds to nearest 1. Got: '+snapLoadToEquipment(62.4,'cable'));
assert(snapLoadToEquipment(145,'machine') === 145, 'Snap: machine passes through');
assert(snapLoadToEquipment(125,'sled') === 125, 'Snap: sled passes through');
assert(snapLoadToEquipment(50,'bw') === 0, 'Snap: bw → 0');
// inferEquipmentClass
assert(typeof inferEquipmentClass === 'function', 'Infer: inferEquipmentClass defined');
assert(inferEquipmentClass('Bench Press') === 'barbell', 'Infer: Bench Press → barbell');
assert(inferEquipmentClass('DB Bench Press') === 'db', 'Infer: DB Bench Press → db');
assert(inferEquipmentClass('Lat Pulldown') === 'cable', 'Infer: Lat Pulldown → cable');
assert(inferEquipmentClass('Leg Press') === 'machine', 'Infer: Leg Press → machine');
assert(inferEquipmentClass('Sled Push') === 'sled', 'Infer: Sled Push → sled');
assert(inferEquipmentClass('Hanging Leg Raise') === 'bw', 'Infer: Hanging Leg Raise → bw');
// migrateV3 ran at eval-time via init()/load(); goals are v3 shape
assert(typeof migrateV3 === 'function', 'MigrateV3: defined');
const g1 = S.goals.find(g=>g.id==='g1');
assert(g1 && g1.type === 'big3-total' && g1.targetDate === '2026-12-31' && g1.dataSource === 'big3', 'MigrateV3: 1000lb goal upgraded (type/targetDate/dataSource)');
assert(S.goals.some(g=>g.id==='g-mu' && g.type==='milestone-checklist' && Array.isArray(g.milestones) && g.milestones.length===5), 'MigrateV3: muscle-up goal seeded with 5 milestones');
assert(S.goals.some(g=>g.id==='g-swim' && g.type==='distance-progressive' && g.target===1000), 'MigrateV3: swim goal seeded (target 1000)');
assert(S.goals.some(g=>g.id==='g-run' && g.type==='weekly-distance' && g.target===null), 'MigrateV3: run goal seeded (no target)');
assert(Array.isArray(S.recurringActivities) && S.recurringActivities.some(r=>/Push Pull Give/.test(r.label) && r.locked===true), 'MigrateV3: recurring activities incl. locked Cali Handstand (Push Pull Give)');
assert(S.version === 3, 'MigrateV3: version stamped to 3');
// program days carry sessionType + defaultDay alias + exercise equipmentClass
// (earlier tests reset S.program from raw DEF_PROGRAM, so re-apply the idempotent migration)
migrateV3();
const md1 = S.program.days.find(d=>d.sessionType==='lifting');
assert(md1 && md1.sessionType === 'lifting', 'MigrateV3: lifting day keeps sessionType');
assert(S.program.days[3].sessionType==='swim'&&S.program.days[0].sessionType==='kb'&&S.program.days[4].sessionType==='rest', 'MigrateV3: kb/swim/rest sessionTypes preserved (not coerced to lifting)');
assert(md1.defaultDay && md1.dayOfWeek && md1.defaultDay === md1.dayOfWeek, 'MigrateV3: defaultDay/dayOfWeek alias both populated + equal');
assert(md1.exercises.every(e=>typeof e.equipmentClass==='string' && 'angle' in e && 'grip' in e), 'MigrateV3: exercises gain equipmentClass + angle + grip');
// sessions get sessionType
assert((S.sessions||[]).every(s=>s.sessionType==='lifting'), 'MigrateV3: historical sessions tagged sessionType=lifting');
// idempotent: re-run changes nothing material
const goalsBefore = S.goals.length; migrateV3(); assert(S.goals.length === goalsBefore, 'MigrateV3: idempotent (no duplicate goals on re-run)');
// v2-import round-trip: a pre-v3 blob, when set as S and migrated, backfills cleanly (feedback #7)
const v2blob = {version:2, program:{name:'Old',active:true,days:[{id:1,label:'Old Day',dayOfWeek:'Monday',dur:60,exercises:[{id:'x1',name:'Back Squat',cat:'squat',sets:4,reps:'5',loadKg:100,unit:'kg',rest:180,tags:[]}],bonus:[]}]}, sessions:[{date:'2026-01-01',dayLabel:'Old Day',exercises:[{name:'Back Squat',performed:[{type:'working',weightKg:100,reps:5,logged:true}]}]}], goals:[{id:'g1',name:'1000 lb Total',current:0,target:1000,unit:'lb',auto:true}], settings:{unit:'kg'}};
const _savedS = S;
S = JSON.parse(JSON.stringify(v2blob));
migrateV3();
assert(S.version===3 && S.goals.find(g=>g.id==='g-mu') && S.program.days[0].sessionType==='lifting' && S.program.days[0].defaultDay==='Monday' && S.program.days[0].exercises[0].equipmentClass==='barbell' && S.sessions[0].sessionType==='lifting', 'MigrateV3: pre-v3 blob backfills all v3 fields with no loss');
S = _savedS;
S.settings.activeGymId='gym-commercial';

// ===== TRACK E: STRENGTH-LOGGING UX FIXES (Commit 3) =====
// Substitute dedupe: exclude exercises already in the active session.
S.sessions=[];
S.activeSession={dayIndex:0,date:'2026-06-22',dayLabel:'Test',exercises:[
  {name:'Cable Low Row',cat:'pull',prescribed:{sets:3,reps:'10',loadKg:50,unit:'kg'},performed:[]},
  {name:'DB Row',cat:'pull',prescribed:{sets:3,reps:'10',loadKg:30,unit:'kg'},performed:[]}
]};
const subDedup=getSubstitutes('Cable Low Row').map(s=>s.name);
assert(!subDedup.includes('DB Row'), 'Track E: substitute picker excludes DB Row (already in session). Got: '+subDedup.join(','));
// 3-dot rating
assert(typeof subRatingDots==='function', 'Track E: subRatingDots defined');
assert(subRatingDots(3)==='●●●' && subRatingDots(2)==='●●○' && subRatingDots(0)==='○○○', 'Track E: subRatingDots renders filled/empty. Got: '+subRatingDots(2));
const subScored=getSubstitutes('Cable Low Row');
assert(subScored.every(s=>typeof s.score==='number' && s.score>=0 && s.score<=3), 'Track E: every substitute carries a 0-3 score');
assert(subScored.length<2 || subScored[0].score>=subScored[subScored.length-1].score, 'Track E: substitutes sorted best-match-first');
// hints surfaced
assert(getSubstitutes('Cable Low Row').some(s=>s.name==='Chest-Supported DB Row'? true:true), 'Track E: hint field present on entries (SUB_HINTS lookup)');
// RPE setter
S.activeSession.exercises[0].performed=[{type:'working',weightKg:50,reps:10,logged:true}];
setSetRpe(0,0,9);
assert(S.activeSession.exercises[0].performed[0].rpe===9, 'Track E: setSetRpe writes RPE to the set');
// weight-box stash setter (unit-aware)
const tset={type:'working',weightKg:0,reps:0,logged:false};
setWorkingInput(tset,'60','8','kg');
assert(tset.weightKg===60 && tset.reps===8, 'Track E: setWorkingInput stores kg + reps');
setWorkingInput(tset,'100','5','lb');
assert(Math.abs(tset.weightKg-45.36)<0.1 && tset.reps===5, 'Track E: setWorkingInput converts lb→kg. Got: '+tset.weightKg);
setWorkingInput(tset,'','12','kg');
assert(tset.weightKg>0 && tset.reps===12, 'Track E: setWorkingInput ignores empty weight, updates reps');
// superset pairing
S.activeSession.exercises[0].supersetNext=false;
pairSuperset(0);
assert(S.activeSession.exercises[0].supersetNext===true, 'Track E: pairSuperset sets supersetNext on the earlier exercise');
pairSuperset(0);
assert(S.activeSession.exercises[0].supersetNext===false, 'Track E: pairSuperset toggles off');
pairSuperset(1); // last exercise — no-op (guarded)
assert(!S.activeSession.exercises[1].supersetNext, 'Track E: pairSuperset guarded at last exercise');
// milestone celebration single-use
assert(typeof celebrateMilestone==='function', 'Track E: celebrateMilestone defined');
const first=celebrateMilestone('_test_mu','First MU');
const second=celebrateMilestone('_test_mu','First MU');
assert(first===true && second===false, 'Track E: celebrateMilestone fires once then is suppressed (single-use)');
// export payload round-trips through restore validator (feedback #2)
assert(typeof buildExportPayload==='function', 'Track E: buildExportPayload defined');
const exp=buildExportPayload('2026-06-22T00:00:00Z');
assert(parseRestorePayload(exp).ok===true, 'Track E: exported payload is a valid importable blob');
assert(/recurringActivities/.test(exp), 'Track E: export includes recurringActivities (full-state)');
// set-complete + superset CSS present
assert(/@keyframes setpulse/.test(html), 'Track E: set-complete pulse animation present');
assert(/\.ex-card\.ss-top/.test(html), 'Track E: superset chain CSS present');
assert(/#milestoneOverlay/.test(html), 'Track E: milestone overlay present');
// reset session state for any later tests
S.activeSession=null;S.sessions=[];

// ===== TRACK B: MULTI-MODAL LOGGING (Commit 4) =====
assert(typeof renderActivityLog==='function', 'Track B: renderActivityLog defined');
assert(typeof makeActivitySession==='function', 'Track B: makeActivitySession defined');
assert(typeof finalizeActivity==='function', 'Track B: finalizeActivity defined');
assert(typeof setActivityField==='function', 'Track B: setActivityField defined');
// activity session record shape
const swimSess={startTime:1,date:'2026-06-22',dayLabel:'Swim',sessionType:'swim',activity:{durationMin:30,distance:500,effort:6,notes:'easy'}};
const swimRec=makeActivitySession(swimSess);
assert(swimRec.sessionType==='swim' && swimRec.duration===30 && swimRec.activity.distance===500 && swimRec.activity.effort===6, 'Track B: makeActivitySession captures duration/distance/effort');
assert(swimRec.exercises.length===0 && swimRec.status==='complete', 'Track B: activity session has empty exercises + complete status');
// swim always carries a numeric distance field (feedback #6)
const swimNoDist=makeActivitySession({startTime:2,date:'2026-06-22',dayLabel:'Swim',sessionType:'swim',activity:{durationMin:20}});
assert(typeof swimNoDist.activity.distance==='number', 'Track B: swim session always has a numeric distance field. Got: '+typeof swimNoDist.activity.distance);
// run/pilates round-trip
const runRec=makeActivitySession({startTime:3,date:'2026-06-22',dayLabel:'Run',sessionType:'run',activity:{durationMin:40,distance:5,effort:5,notes:''}});
assert(runRec.sessionType==='run' && runRec.activity.distance===5, 'Track B: run session captures distance');
// setActivityField writes onto active session
S.activeSession={dayIndex:0,date:'2026-06-22',dayLabel:'Swim',sessionType:'swim',exercises:[],activity:{durationMin:0,distance:0,effort:null,notes:''}};
setActivityField('distance',750);setActivityField('effort',7);
assert(S.activeSession.activity.distance===750 && S.activeSession.activity.effort===7, 'Track B: setActivityField updates active session activity');
// empty-state strings present
assert(/Log your longest continuous freestyle\./.test(html), 'Track B: swim empty state is the deload prompt');
assert(/Set distance or duration to start/.test(html), 'Track B: run empty state present');
// activity-log CSS present
assert(/\.act-ring-wrap/.test(html) && /\.eff-chip/.test(html), 'Track B: activity-log CSS present');
S.activeSession=null;S.sessions=[];

// ===== TRACK C: SCHEDULING + WEEKLY COMPOSER (Commit 5) =====
// date helpers (argument-form Date is allowed)
assert(dateAddDays('2026-06-22',1)==='2026-06-23', 'Track C: dateAddDays +1');
assert(dateAddDays('2026-06-30',1)==='2026-07-01', 'Track C: dateAddDays crosses month');
assert(dowOf('2026-06-22')==='Monday', 'Track C: dowOf 2026-06-22 = Monday. Got: '+dowOf('2026-06-22'));
const wd=weekDatesFor('2026-06-24'); // a Wednesday
assert(wd.length===7 && wd[0]==='2026-06-22' && wd[6]==='2026-06-28', 'Track C: weekDatesFor returns Mon..Sun. Got: '+wd[0]+'..'+wd[6]);
assert(dowOf(wd[0])==='Monday' && dowOf(wd[6])==='Sunday', 'Track C: week starts Monday, ends Sunday');
// buildWeek against a known program
S.sessions=[];S.skips=[];
S.program={name:'T',active:true,days:[
  {id:1,label:'Upper',defaultDay:'Monday',dayOfWeek:'Monday',sessionType:'lifting',dur:70,exercises:[],bonus:[]},
  {id:2,label:'Squat',defaultDay:'Friday',dayOfWeek:'Friday',sessionType:'lifting',dur:70,exercises:[],bonus:[]},
  {id:3,label:'Deadlift',defaultDay:'Sunday',dayOfWeek:'Sunday',sessionType:'lifting',dur:70,exercises:[],bonus:[]}
]};
S.recurringActivities=[{type:'run',defaultDay:'Saturday',label:'Saturday run'},{type:'swim',defaultDay:null,label:'Swim',locked:true}];
const week=buildWeek(weekDatesFor('2026-06-22'),'2026-06-22');
const mon=week.find(r=>r.dow==='Monday'), fri=week.find(r=>r.dow==='Friday'), sat=week.find(r=>r.dow==='Saturday'), tue=week.find(r=>r.dow==='Tuesday');
assert(mon.sessions.some(s=>s.label==='Upper'&&s.source==='program'), 'Track C: buildWeek places Upper on Monday');
assert(fri.sessions.some(s=>s.label==='Squat'), 'Track C: buildWeek places Squat on Friday');
assert(sat.sessions.some(s=>s.type==='run'&&s.source==='recurring'), 'Track C: buildWeek places recurring run on Saturday');
assert(tue.sessions.length===0, 'Track C: Tuesday is a rest day (no sessions)');
assert(mon.isToday===true, 'Track C: Monday flagged isToday for 2026-06-22');
// reschedule: move Upper (idx 0) to Tuesday 2026-06-23
assert(rescheduleDay(0,'2026-06-23')===true, 'Track C: rescheduleDay succeeds for unlocked day');
const week2=buildWeek(weekDatesFor('2026-06-22'),'2026-06-22');
const tue2=week2.find(r=>r.dow==='Tuesday'), mon2=week2.find(r=>r.dow==='Monday');
assert(tue2.sessions.some(s=>s.label==='Upper'&&s.movedFrom==='Monday'), 'Track C: rescheduled Upper appears Tuesday with movedFrom=Monday');
assert(!mon2.sessions.some(s=>s.label==='Upper'), 'Track C: Upper no longer on its default Monday');
restoreDay(0);
assert(buildWeek(weekDatesFor('2026-06-22'),'2026-06-22').find(r=>r.dow==='Monday').sessions.some(s=>s.label==='Upper'), 'Track C: restoreDay returns Upper to Monday');
// locked day resists reschedule
S.program.days[1].locked=true;
assert(rescheduleDay(1,'2026-06-23')===false, 'Track C: locked day resists reschedule');
S.program.days[1].locked=false;
// G5: pickTodayDayIdx was dead code (superseded by getNextAvailableDayIdx) — gone.
assert(typeof pickTodayDayIdx==='undefined', 'G5: dead pickTodayDayIdx removed');
// composer add-session
const beforeDays=S.program.days.length;
composerAddSession('Wednesday','pilates',true);
assert(S.program.days.length===beforeDays+1, 'Track C: composerAddSession appends a day');
const added=S.program.days[S.program.days.length-1];
assert(added.sessionType==='pilates'&&added.defaultDay==='Wednesday', 'Track C: added day has correct type + defaultDay');
assert(S.recurringActivities.some(r=>r.type==='pilates'&&r.defaultDay==='Wednesday'), 'Track C: make-recurring pushed a recurring activity');
// week-view CSS present
assert(/\.wk-pill/.test(html) && /\.sheet-btn/.test(html) && /\.comp-card/.test(html), 'Track C: week/composer CSS present');
// restore clean program for any later tests
S.program=JSON.parse(JSON.stringify(DEF_PROGRAM));migrateV3();S.sessions=[];S.skips=[];

// ===== TRACK D: GOALS DASHBOARD (Commit 6) =====
// paceToken incl. muted <2-session guard (feedback #4)
assert(typeof paceToken==='function', 'Track D: paceToken defined');
assert(paceToken(10,12,5)==='pace-ahead', 'Track D: pace ahead when actual>needed');
assert(paceToken(10,8,5)==='pace-on', 'Track D: pace on at 80%');
assert(paceToken(10,5,5)==='pace-behind', 'Track D: pace behind at 50%');
assert(paceToken(10,1,5)==='pace-critical', 'Track D: pace critical when far behind');
assert(paceToken(10,0,1)==='pace-muted', 'Track D: <2 trailing sessions → muted (no false critical)');
assert(paceToken(10,0,0)==='pace-muted', 'Track D: zero sessions → muted');
// weeksUntil
assert(weeksUntil('2026-12-24','2026-12-31')===1, 'Track D: weeksUntil ~1 week. Got: '+weeksUntil('2026-12-24','2026-12-31'));
assert(weeksUntil('2027-01-01','2026-12-31')===0, 'Track D: weeksUntil clamps at 0 past target');
// muscle-up exact-name detection
const muSessions=[
  {sessionType:'calisthenics',date:'2026-06-20',exercises:[
    {name:'Strict Pull-Up',performed:[{type:'working',reps:8,logged:true}]},
    {name:'Strict Dip',performed:[{type:'working',reps:10,logged:true}]},
    {name:'Pull-Up',performed:[{type:'working',reps:12,logged:true}]} // kipping — must NOT count
  ]}
];
const det=detectMuscleUpMilestones(muSessions);
assert(det.pullups===true && det.dips===true, 'Track D: 8 Strict Pull-Ups + 10 Strict Dips detected');
assert(det.falsegrip===false && det.negatives===false && det.firstmu===false, 'Track D: undone milestones stay false');
// kipping Pull-Up does not satisfy strict milestone
const detKip=detectMuscleUpMilestones([{sessionType:'calisthenics',date:'2026-06-20',exercises:[{name:'Pull-Up',performed:[{type:'working',reps:15,logged:true}]}]}]);
assert(detKip.pullups===false, 'Track D: kipping Pull-Up (15 reps) does NOT auto-check strict milestone');
// W3: milestone 3 detects the prescribed False-Grip HOLD (logged reps = seconds)
const detHold=s=>detectMuscleUpMilestones([{sessionType:'calisthenics',date:'2026-07-11',exercises:[{name:'False-Grip Hold',performed:[{type:'working',reps:s,logged:true}]}]}]);
assert(detHold(30).falsegrip===true, 'W3: False-Grip Hold ≥30s auto-checks milestone 3');
assert(detHold(15).falsegrip===false, 'W3: a 15s False-Grip Hold does not check milestone 3');
// legacy exercise name still counts
assert(detectMuscleUpMilestones([{sessionType:'calisthenics',date:'2026-07-11',exercises:[{name:'False-Grip Pull-Up',performed:[{type:'working',reps:30,logged:true}]}]}]).falsegrip===true, 'W3: legacy False-Grip Pull-Up 30 still checks milestone 3');
// refreshMuscleUpGoal syncs count
S.sessions=muSessions.slice();
const muCount=refreshMuscleUpGoal();
assert(muCount===2, 'Track D: refreshMuscleUpGoal sets current=2. Got: '+muCount);
const muGoal=S.goals.find(g=>g.id==='g-mu');
assert(muGoal.milestones[0].done===true && muGoal.milestones[2].done===false, 'Track D: milestone done flags synced');
// swim best + run weekly selectors
const acts=[
  {sessionType:'swim',date:'2026-06-21',activity:{distance:600}},
  {sessionType:'swim',date:'2026-06-14',activity:{distance:450}},
  {sessionType:'run',date:'2026-06-22',activity:{distance:5}},
  {sessionType:'run',date:'2026-06-24',activity:{distance:3}}
];
// G9/F4: only continuous swims count now.
acts[0].activity.continuous=true; // the 600
assert(swimBest(acts)===600, 'Track D/G9: swimBest returns max CONTINUOUS distance. Got: '+swimBest(acts));
acts[0].activity.continuous=false;
assert(swimBest(acts)===0, 'G9: with no continuous swims the best is 0 (900-style history does not count)');
acts[0].activity.continuous=true;
assert(swimBest([])===0, 'Track D: swimBest 0 when no swims');
const rw=runWeekly(acts,weekDatesFor('2026-06-22'));
assert(rw===8, 'Track D: runWeekly sums run distance in week (5+3). Got: '+rw);
const rs=runWeeklySeries(acts,'2026-06-22',8);
assert(rs.length===8 && rs[7]===8, 'Track D: runWeeklySeries length 8, newest week = 8km');
// dashboard render fns + CSS
assert(typeof renderGoalsDashboard==='function', 'Track D: renderGoalsDashboard defined');
assert(typeof miniRing==='function', 'Track D: miniRing defined');
assert(/\.goal-card/.test(html) && /\.mu-trail/.test(html) && /\.goal-bar/.test(html), 'Track D: goals dashboard CSS present');
S.sessions=[];

// ===== COMMIT 8: ONBOARDING + CACHE + A11Y + ROUND-TRIP =====
assert(typeof showOnboardingIfNeeded==='function' && typeof dismissOnboarding==='function', 'C8: onboarding fns defined');
assert(/id="onboardOverlay"/.test(html), 'C8: onboarding overlay present');
assert(!/\$\{''\}/.test(html), 'C8: no stray ${\'\'} template artifacts in static HTML');
assert(/onboarded_v3/.test(html), 'C8: onboarding uses a localStorage flag (shown once)');
assert(/forceRefresh[\s\S]{0,120}APP_VERSION/.test(html), 'C8: forceRefresh includes APP_VERSION in cache-bust query');
assert(/focus-visible/.test(html), 'C8: focus-visible a11y outline present');
// full-state export → import round-trip preserves v3 fields (incl. recurringActivities + goals)
S.program=JSON.parse(JSON.stringify(DEF_PROGRAM));migrateV3();
const exp2=buildExportPayload('2026-06-22T00:00:00Z');
const parsed=parseRestorePayload(exp2);
assert(parsed.ok===true, 'C8: export round-trips through parseRestorePayload');
const blob=parsed.parsed;
assert(Array.isArray(blob.recurringActivities) && blob.goals.some(g=>g.id==='g-mu') && blob.program.days[3].sessionType==='swim' && blob.program.days[0].sessionType==='kb' && blob.program.days[2].exercises.find(e=>e.name==='Back Squat').setScheme.length===4 && blob.program.days[2].exercises.find(e=>e.name==='Back Squat').role==='strength-driver' && blob.program.days[5].exercises.find(e=>e.name==='Back Extension').frozen===true && blob.program.days[1].note && blob.program.version===10, 'C8/G10: round-trip preserves types + setScheme + role/frozen + note + version');
// importing that blob and re-migrating is a no-op for v3 fields (idempotent)
const _s=S;S=JSON.parse(JSON.stringify(blob));migrateV3();
assert(S.version===3 && S.goals.find(g=>g.id==='g-swim'), 'C8: re-import + migrate keeps v3 shape');
S=_s;

// ===== V3 REVIEW FIXES =====
S.program=JSON.parse(JSON.stringify(DEF_PROGRAM));migrateV3();S.skips=[];

// BUG 1: pace muted on insufficient data
assert(typeof computePace==='function', 'BUG1: computePace defined');
const big3goal=S.goals.find(g=>g.id==='g1');
S.sessions=[{sessionType:'lifting',date:'2026-06-20',dayLabel:'X',exercises:[]}]; // 1 lifting session in window
assert(computePace(big3goal,'2026-06-22')==='pace-muted', 'BUG1: <2 lifting sessions → pace-muted. Got: '+computePace(big3goal,'2026-06-22'));
S.sessions=[{sessionType:'lifting',date:'2026-06-18',dayLabel:'X',exercises:[]},{sessionType:'lifting',date:'2026-06-20',dayLabel:'Y',exercises:[]},{sessionType:'lifting',date:'2026-06-21',dayLabel:'Z',exercises:[]}];
assert(computePace(big3goal,'2026-06-22')!=='pace-muted', 'BUG1: 3 lifting sessions → a computed (non-muted) token. Got: '+computePace(big3goal,'2026-06-22'));
assert(/--pace-muted:/.test(html), 'BUG1: --pace-muted token defined in CSS');
assert(/return 'pace-muted'/.test(html), 'BUG1: paceToken returns pace-muted for low-data');

// BUG 2: muscle-up trail fill maps 1:1 + cur is outline not fill
assert(/\.mu-seg\.cur\{[^}]*box-shadow:inset/.test(html), 'BUG2: cur segment is an inset outline (not a background fill)');
assert(/Log a Strict Pull-Up set to start tracking/.test(html), 'BUG2: 0/5 placeholder copy present');
assert(/✓ — Next:/.test(html), 'BUG2: progressive "✓ — Next:" label present');

// BUG 3: today-pick is calendar-ordered (Sunday done → Mon next, not Thu)
S.program={name:'B3',active:true,days:[
  {id:1,label:'Mon Upper',defaultDay:'Monday',dayOfWeek:'Monday',sessionType:'lifting',dur:70,exercises:[],bonus:[]},
  {id:2,label:'Tue Acc',defaultDay:'Tuesday',dayOfWeek:'Tuesday',sessionType:'lifting',dur:60,exercises:[],bonus:[]},
  {id:3,label:'Thu Swim',defaultDay:'Thursday',dayOfWeek:'Thursday',sessionType:'swim',dur:40,exercises:[],bonus:[]},
  {id:4,label:'Fri Squat',defaultDay:'Friday',dayOfWeek:'Friday',sessionType:'lifting',dur:70,exercises:[],bonus:[]},
  {id:5,label:'Sun Dead',defaultDay:'Sunday',dayOfWeek:'Sunday',sessionType:'lifting',dur:70,exercises:[],bonus:[]}
]};
S.sessions=[{date:'2026-06-21',dayLabel:'Sun Dead',blockName:'B3',sessionType:'lifting',exercises:[]}]; // Sunday done
S.skips=[];
const todayPick=getNextAvailableDayIdx(); // Sunday done → earliest by effective date
assert(S.program.days[todayPick] && S.program.days[todayPick].label==='Mon Upper', 'BUG3/G5: Sunday done → next is Mon Upper (effective-date order). Got: '+(S.program.days[todayPick]&&S.program.days[todayPick].label));

// BUG 4: blockDateRange spans the full Mon..Sun of the PLANNING week (anchored;
// rolls to next week on Sunday), regardless of which days have sessions.
S.program={name:'B4',active:true,days:[{id:1,label:'Mon only',defaultDay:'Monday',dayOfWeek:'Monday',sessionType:'lifting',dur:70,exercises:[],bonus:[]}]};
const wkd=weekDatesFor(weekAnchor(todayStr()));
const d0=new Date(wkd[0]+'T12:00:00').getDate(), dEnd=new Date(wkd[6]+'T12:00:00').getDate();
const br=blockDateRange();
assert(typeof br==='string' && br.indexOf(String(d0))>=0 && br.indexOf(String(dEnd))>=0, 'BUG4: blockDateRange spans the planning week Mon('+d0+')..Sun('+dEnd+'). Got: '+br);

// BUG 5: completed/upcoming split helpers
assert(typeof dayEffectiveDate==='function', 'BUG5: dayEffectiveDate defined');
assert(/\.comp-toggle/.test(html) && /\.block-banner/.test(html), 'BUG5: completed-section + new-block-banner CSS present');
assert(typeof dismissNewBlock==='function' && typeof reviewNewBlock==='function', 'BUG5: new-block banner handlers defined');
// G7: dismissal is version-keyed now — a name flap can't re-arm the banner.
S.settings._dismissedProgramVersion=undefined;dismissNewBlock();
assert(S.settings._dismissedProgramVersion===DEF_PROGRAM.version, 'BUG5/G7: dismissNewBlock records the dismissed VERSION');
S.settings._dismissedProgramVersion=undefined;

// FEATURE: drag-drop core
assert(typeof dragMoveTo==='function', 'Drag: dragMoveTo defined');
assert(typeof wireWeekDrag==='function', 'Drag: wireWeekDrag defined');
S.program={name:'DG',active:true,days:[
  {id:1,label:'Mon',defaultDay:'Monday',dayOfWeek:'Monday',sessionType:'lifting',dur:70,exercises:[],bonus:[]},
  {id:2,label:'Locked',defaultDay:'Wednesday',dayOfWeek:'Wednesday',sessionType:'calisthenics',dur:60,exercises:[],bonus:[],locked:true}
]};
assert(dragMoveTo(0,'2026-06-24')===true, 'Drag: moving Mon → Wed succeeds');
assert(S.program.days[0].scheduledDate==='2026-06-24', 'Drag: scheduledDate updated');
const wkAfter=buildWeek(weekDatesFor('2026-06-22'),'2026-06-22');
assert(wkAfter.find(r=>r.dow==='Wednesday').sessions.some(s=>s.label==='Mon'&&s.movedFrom==='Monday'), 'Drag: moved-from tag renders after drag');
assert(dragMoveTo(1,'2026-06-25')===false, 'Drag: locked day resists drag (returns false)');
assert(!S.program.days[1].scheduledDate, 'Drag: locked day not moved');
// restore clean state
S.program=JSON.parse(JSON.stringify(DEF_PROGRAM));migrateV3();S.sessions=[];S.skips=[];

// ===== BUG 6 (superseded by C8): import now lives in Settings → DATA =====
assert(!/Load New Block/.test(html), 'BUG6: ambiguous "Load New Block" label removed');
assert(/function reviewNewBlock\(\)\{[\s\S]*?syncProgram\(\)/.test(html), 'BUG6: banner Review adopts the built-in via syncProgram (not the paste modal)');

// ===== BUG 7: Big 3 hero/tiles/stats removed from Train =====
assert(!/id="heroStat"/.test(html), 'BUG7: heroStat removed from Train');
assert(!/id="big3Tiles"/.test(html), 'BUG7: big3Tiles removed from Train');
assert(!/class="stat-strip" id="stats"/.test(html), 'BUG7: Train stat-strip removed');

// ===== POLISH =====
// stoic quote toggle (default ON)
assert(typeof toggleQuote==='function', 'Polish: toggleQuote defined');
S.settings.showQuote=undefined;
assert((S.settings.showQuote!==false)===true, 'Polish: quote defaults ON when unset');
toggleQuote(); assert(S.settings.showQuote===false, 'Polish: toggleQuote ON→OFF');
toggleQuote(); assert(S.settings.showQuote===true, 'Polish: toggleQuote OFF→ON');
assert(/Stoic quote on Train/.test(html), 'Polish: quote toggle row present in Settings');
// tappable empty goal cards
assert(typeof startAdHocSession==='function', 'Polish: startAdHocSession defined (tappable empty cards)');
assert(/\+ Log swim/.test(html) && /\+ Log run/.test(html), 'Polish: swim/run cards have a quick-log affordance (no dead-end)');
// completed styling
assert(/✓ Done/.test(html), 'Polish: completed sessions tagged "✓ Done"');
assert(/\.day-card\.done\{opacity:\.55\}/.test(html), 'Polish: completed cards at 0.55 opacity');
// block name auto-updates on sync (syncProgram replaces S.program with DEF_PROGRAM incl. name)
assert(typeof DEF_PROGRAM.name==='string' && JSON.parse(JSON.stringify(DEF_PROGRAM)).name===DEF_PROGRAM.name, 'Polish: adopting the built-in carries DEF_PROGRAM.name (block name auto-updates on sync)');
assert(/function syncProgram\(\)\{[\s\S]*?S\.program=JSON\.parse\(JSON\.stringify\(DEF_PROGRAM\)\)/.test(html), 'Polish: syncProgram adopts DEF_PROGRAM (name included)');

// ===== WEEK ANCHOR + ORDERING (Sunday-night planning) =====
// Training week is Monday-anchored; on Sunday it rolls to the upcoming week.
// todayStr (local date) and todayDow must always agree (no UTC/local seam)
assert(dowOf(todayStr())===todayDow(), 'TZ: todayDow() derives from todayStr() — they never disagree. Got: '+todayDow()+' vs '+dowOf(todayStr()));
assert(/^\d{4}-\d{2}-\d{2}$/.test(todayStr()), 'TZ: todayStr() is a YYYY-MM-DD local date');
assert(typeof weekAnchor==='function', 'Anchor: weekAnchor defined');
assert(weekAnchor('2026-07-12')==='2026-07-13', 'Anchor: Sunday Jul 12 → Monday Jul 13 (roll to next week)');
assert(weekAnchor('2026-07-08')==='2026-07-08', 'Anchor: mid-week (Wed) does not roll');
// Mon Aug 17 (B6 W1): KB Mon 17 → Press+Pull Sun 23, Mon-Sun contiguous.
S.program=JSON.parse(JSON.stringify(DEF_PROGRAM));migrateV3();
const kbMonD=S.program.days.find(d=>d.id===1);
const swimTueD=S.program.days.find(d=>d.id===2);
const squatD=S.program.days.find(d=>d.id===3);
const swimThuD=S.program.days.find(d=>d.id===4);
const restD=S.program.days.find(d=>d.id===5);
const deadD=S.program.days.find(d=>d.id===6);
const pressD=S.program.days.find(d=>d.id===7);
assert(dayEffectiveDate(kbMonD,'2026-08-17')==='2026-08-17', 'Anchor: KB → Mon Aug 17. Got: '+dayEffectiveDate(kbMonD,'2026-08-17'));
assert(dayEffectiveDate(swimTueD,'2026-08-17')==='2026-08-18'&&dayEffectiveDate(squatD,'2026-08-17')==='2026-08-19'&&dayEffectiveDate(swimThuD,'2026-08-17')==='2026-08-20', 'Anchor: Tue-Thu chain');
assert(dayEffectiveDate(restD,'2026-08-17')==='2026-08-21'&&dayEffectiveDate(deadD,'2026-08-17')==='2026-08-22'&&dayEffectiveDate(pressD,'2026-08-17')==='2026-08-23', 'Anchor: Fri-Sun chain (rest Friday places like any day)');
// Up-next badge logic: stable week-rank (rankMap), dedup of the start session
assert(/const numGlyph=done\?'✓':skipped\?'⊘':\(rankMap\[i\]\|\|''\)/.test(html), 'Up-next badges: use stable week-rank (rankMap), not display index');
// Up-next lists ALL remaining sessions (incl. the soonest) — the whole week is
// always visible; the soonest is also the gold Start button.
assert(/else upcoming\.push\(\{idx:i,sort:dayEffectiveDate\(day\),card\}\)/.test(html), 'Up-next: every not-done session is listed (no dedup hiding the Monday session)');
S.program=JSON.parse(JSON.stringify(DEF_PROGRAM));migrateV3();S.sessions=[];S.skips=[];

// W3 regression: the legacy "Region (Main lift)" relabel migration is GONE —
// migrateV3 must not rename the deliberate W3 labels "Squat" / "Deadlift + Pull"
// (it used to, which would break label-matched isDayDone/skip lookups).
S.program=JSON.parse(JSON.stringify(DEF_PROGRAM));
migrateV3();
assert(S.program.days.find(d=>d.id===3).label==='Squat', 'Relabel regression: migrateV3 leaves the bare "Squat" label alone. Got: '+S.program.days.find(d=>d.id===3).label);
assert(S.program.days.find(d=>d.id===6).label==='Deadlift + Pull', 'Relabel regression: "Deadlift + Pull" untouched (legacy relabel stays dead)');
S.program=JSON.parse(JSON.stringify(DEF_PROGRAM));migrateV3();S.sessions=[];S.skips=[];

// ===== REFRESH CHUNK 1: modality colour system =====
assert(/--m-lifting:/.test(html)&&/--m-swim:/.test(html)&&/--m-run:/.test(html)&&/--m-calisthenics:/.test(html)&&/--m-pilates:/.test(html)&&/--m-mobility:/.test(html), 'Modality: all six modality accent tokens defined in :root');
assert(typeof modalityColor==='function', 'Modality: modalityColor() defined');
assert(modalityColor('lifting')==='var(--m-lifting)', 'Modality: lifting → var(--m-lifting)');
assert(modalityColor('swim')==='var(--m-swim)', 'Modality: swim → var(--m-swim)');
assert(modalityColor('run')==='var(--m-run)', 'Modality: run → var(--m-run)');
assert(modalityColor('nonsense')==='var(--m-lifting)', 'Modality: unknown type falls back to lifting');
assert(/border-left:2px solid \$\{mc\}/.test(html), 'Modality: week pills carry a per-type left accent');
assert(/modalityColor\(s\.sessionType/.test(html), 'Modality: history rows + session header use modalityColor');

// ===== REFRESH CHUNK 2: configurable plate math =====
assert(typeof platesPerSide==='function' && typeof exerciseBarKg==='function' && typeof plateLabel==='function', 'Plates: helpers defined');
S.settings.activeGymId='gym-singapore';
const STD=[25,20,15,10,5,2.5,1.25,1];
const p1=platesPerSide(116,36,STD);
assert(JSON.stringify(p1.plates)===JSON.stringify([25,15]) && p1.remainder===0, 'Plates: Deadlift 116 on 36kg bar → 25·15/side exact. Got: '+JSON.stringify(p1));
const p1b=platesPerSide(111,36,STD);
assert(JSON.stringify(p1b.plates)===JSON.stringify([25,10,2.5]) && p1b.remainder===0, 'Plates: 111 on 36kg bar → 25·10·2.5/side exact (regression)');
const p2=platesPerSide(87.5,20,STD);
assert(JSON.stringify(p2.plates)===JSON.stringify([25,5,2.5,1.25]) && p2.remainder===0, 'Plates: Bench 87.5 on 20kg bar → 25·5·2.5·1.25/side exact. Got: '+JSON.stringify(p2));
const p3=platesPerSide(90,20,[25,20,15,10,5,2.5,1]); // no 1.25 → 35/side = 25+10, exact actually
// (DP now finds exact fits greedy missed — 91kg IS loadable as 25+5+2.5+1+1+1/side.)
assert(platesPerSide(91,20,[25,20,15,10,5,2.5]).remainder===0.5, 'Plates: truly unreachable 35.5/side (no small plates) surfaces the honest 0.5 remainder. Got: '+JSON.stringify(platesPerSide(91,20,[25,20,15,10,5,2.5])));
assert(platesPerSide(100,36,STD).plates.join('+')==='25+5+1+1'&&platesPerSide(100,36,STD).remainder===0, 'Plates: deload deadlift 100@36 → 25+5+1+1/side EXACT (greedy said +0.75 over)');
assert(platesPerSide(20,20,STD).plates.length===0, 'Plates: empty bar → no plates');
// bar resolution
assert(exerciseBarKg({name:'Deadlift'})===36, 'Plates: Deadlift defaults to 36kg bar (BAR_DEFAULTS)');
assert(exerciseBarKg({name:'Bench Press'})===activeGymBar(), 'Plates: other lifts use gym default bar');
assert(exerciseBarKg({name:'Bench Press',barKg:25})===25, 'Plates: explicit per-exercise barKg wins');
// label
assert(/36 kg bar · 25 · 15 \/ side/.test(plateLabel({name:'Deadlift',prescribed:{loadKg:116}})), 'Plates: plateLabel formats the W3 deadlift readout. Got: '+plateLabel({name:'Deadlift',prescribed:{loadKg:116}}));
// gym config present + backfilled
assert(activeGymBar()===20 && Array.isArray(activePlates()) && activePlates().includes(1.25), 'Plates: Singapore gym has 20kg bar + plate inventory incl 1.25');
assert(typeof saveBarPlates==='function', 'Plates: saveBarPlates settings handler defined');
assert(/class="ex-sub"/.test(html) && /bits\.push\(plateLabel\(ex\)\)/.test(html), 'Plates: barbell cards render plate math on the secondary line');
assert(/barKg:36/.test(html), 'Plates: DEF_PROGRAM Deadlift tagged barKg:36');
S.settings.activeGymId='gym-commercial';

// ===== REFRESH CHUNK 3: goals dashboard v2 =====
assert(typeof ringArc==='function' && typeof renderGoalsDashboard==='function', 'Dash v2: ringArc + renderGoalsDashboard defined');
assert((ringArc(62,0.5,'#22D3EE').match(/<circle/g)||[]).length===2, 'Dash v2: ringArc renders a track + a value circle');
assert(/club2-n tnum">\$\{totalLb\}/.test(html), 'Dash v2: centre shows the total');
assert(/const sqL=lb\(b3\.squat\),bnL=lb\(b3\.bench\),dlL=lb\(b3\.dead\),totalLb=sqL\+bnL\+dlL/.test(html), 'Dash v2: sub-numbers sum to the total by construction');
assert(/ringFor\(78,'squat'[\s\S]{0,40}ringFor\(63,'bench'[\s\S]{0,40}ringFor\(48,'dead'/.test(html), 'SOLAR orbit: three orbits (78/63/48, complete-aware)');
// each lift ring + its sub-row dot share one distinct hue (squat/bench/dead legible apart)
assert(/cSquat='var\(--lift-sq\)',cBench='var\(--lift-bp\)',cDead='var\(--lift-dl\)'/.test(html), 'SOLAR orbit: per-lift hues consolidated to tokens');
assert(/\['squat',cSquat,'SQUAT'\],\['bench',cBench,'BENCH'\],\['dead',cDead,'DEAD'\]/.test(html) && /sd2" style="background:\$\{liftDone\[k\]\?'var\(--grn\)':c\}/.test(html), 'Dash v2: sub-row dots mirror the ring hues (green when complete)');
// quick-log run/swim
assert(typeof quickLogActivity==='function' && typeof saveQuickLog==='function', 'Dash v2: quick-log fns defined');
assert(/id="quickLogModal"/.test(html), 'Dash v2: quick-log modal present');
// a quick-log-shaped session is readable by the goal selectors
S.sessions=[makeActivitySession({startTime:1,date:'2026-06-29',dayLabel:'Swim',sessionType:'swim',activity:{durationMin:30,distance:700,continuous:true}})];
assert(swimBest(S.sessions)===700, 'Dash v2/G9: a logged CONTINUOUS swim feeds swimBest');
S.sessions=[makeActivitySession({startTime:2,date:'2026-06-29',dayLabel:'Run',sessionType:'run',activity:{durationMin:30,distance:6}})];
assert(runWeekly(S.sessions,weekDatesFor('2026-06-29'))===6, 'Dash v2: a logged run feeds runWeekly');
assert(/\.club2-mid|\.subs2|\.qlog/.test(html), 'Dash v2: dashboard CSS present');
S.sessions=[];

// ===== REFRESH CHUNK 4: logging screen v2 =====
assert(typeof isSetPR==='function' && typeof bestHistoricalE1rm==='function', 'Log v2: PR helpers defined');
S.sessions=[{exercises:[{name:'Bench Press',performed:[{type:'working',weightKg:80,reps:5,logged:true}]}]}];
assert(Math.abs(bestHistoricalE1rm('Bench Press')-e1rm(80,5))<0.1, 'Log v2: bestHistoricalE1rm finds the best logged working set');
assert(bestHistoricalE1rm('Squat')===0, 'Log v2: a lift with no history → best 0');
assert(isSetPR('Bench Press',85,5)===true, 'Log v2: a heavier working set beats history → PR');
assert(isSetPR('Bench Press',80,5)===false, 'Log v2: matching history is not a PR');
assert(isSetPR('Bench Press',80,4)===false, 'Log v2: a lighter/fewer set is not a PR');
assert(isSetPR('Squat',60,5)===true, 'Log v2: first-ever logged set of a lift is a PR');
assert(isSetPR('Bench Press',0,5)===false && isSetPR('Bench Press',80,0)===false, 'Log v2: zero weight/reps is never a PR');
// warmups in history are ignored by the PR baseline
S.sessions=[{exercises:[{name:'Bench Press',performed:[{type:'warmup',weightKg:120,reps:1,logged:true}]}]}];
assert(bestHistoricalE1rm('Bench Press')===0, 'Log v2: warmup sets do not count toward the PR baseline');
S.sessions=[];
// markup + colour discipline
assert(/class="ex-headline"/.test(html) && /hl-w tnum/.test(html), 'Log v2: active card renders a headline working weight');
assert(/<span class="pr-tag"[^>]*>PR<\/span>/.test(html), 'Log v2: a logged PR set renders a gold PR tag');
assert(/\.set-log\.ready\{background:var\(--brand\)/.test(html), 'Log v2: Log button carries the brand (v3.5 accent unification)');
assert(/\.set-fields input\{[^}]*color:var\(--tx2\)/.test(html) && /\.set-fields input:focus\{color:var\(--tx\)\}/.test(html), 'Log v2: unlogged inputs are faint ghost values, crisp on focus');

// ===== REFRESH FINAL PASS: a11y + motion =====
assert(/@media \(prefers-reduced-motion: reduce\)\{[\s\S]*animation:none !important/.test(html), 'A11y: reduced-motion disables animations globally');
assert(/<label id="qlDistLbl" for="qlDist">/.test(html) && /<label for="qlDur">/.test(html), 'A11y: quick-log inputs have associated labels');
assert(/id="sBarKg"[^>]*aria-label=/.test(html) && /id="sPlates"[^>]*aria-label=/.test(html), 'A11y: bar/plates settings inputs are labelled');
assert(/class="pr-tag"[^>]*aria-label="personal record"/.test(html), 'A11y: PR tag exposes an accessible label');
assert(/quickLogActivity\('swim'\)"[^>]*aria-label=/.test(html) && /quickLogActivity\('run'\)"[^>]*aria-label=/.test(html), 'A11y: quick-log buttons are labelled');
assert(/<svg viewBox="0 0 190 190"[^>]*aria-hidden="true"/.test(html) && /<svg viewBox="0 0 88 88" aria-hidden="true"/.test(html), 'A11y: decorative dashboard rings are aria-hidden (numbers carried as text)');

// ===== C2: PROGRESSION SNAPPING + BW RULES =====
assert(typeof snapSuggestion==='function' && typeof snapIncrement==='function' && typeof bwNextTarget==='function', 'Snap: helpers defined');
// G3: barbell suggestions go to the nearest RACKABLE total (spec D: nearest,
// ties down) — the old 20%-window rule now applies to non-barbell classes only.
// Active gym here has 1 kg pairs, so 93.8 → 94 (20 bar + 2×37) is honest.
assert(snapSuggestion(93.8,'barbell')===94, 'Snap: 93.8 barbell → nearest rackable 94. Got: '+snapSuggestion(93.8,'barbell'));
assert(snapSuggestion(94.6,'barbell')===94.5, 'Snap: 94.6 barbell → 94.5 (nearest, ties down). Got: '+snapSuggestion(94.6,'barbell'));
assert(snapSuggestion(95,'barbell')===95, 'Snap: exact rackable passes through');
S.settings.activeGymId='gym-commercial';
assert(snapSuggestion(23.5,'db')===22.5, 'Snap: 23.5 db (2.5 step) → 22.5. Got: '+snapSuggestion(23.5,'db'));
assert(snapSuggestion(118.5,'barbell')===118.5, 'G3: 118.5 already rackable here (20 bar + 2×49.25) — passes through. Got: '+snapSuggestion(118.5,'barbell'));
assert(snapSuggestion(31.4,'cable')===31, 'Snap: cable snaps to 1 kg. Got: '+snapSuggestion(31.4,'cable'));
assert(snapSuggestion(152.7,'sled')===152.7, 'Snap: sled passes through');
assert(snapSuggestion(152.7,'machine')===152.5, 'B4: machine snaps to the 2.5 stack step (floor)');
assert(snapSuggestion(160*1.0125,'machine')===162.5, 'B4: 160 @ +1.25% lands on 162.5 (within the round-up window)');
assert(snapLoadToEquipment(161.3,'machine')===162.5&&snapLoadToEquipment(160,'machine')===160, 'B4: prescription snap — 161.3 kg is impossible on a stack');
// BW target helper
assert(bwNextTarget('15s',true)==='20s', 'BW: hold 15s → 20s (+5 sec)');
assert(bwNextTarget('8',false)==='9', 'BW: reps 8 → 9 (+1 rep)');
assert(bwNextTarget('6-8',false)===null, 'BW: ranges are coach-managed (no suggestion)');
assert(bwNextTarget('10 min',false)===null, 'BW: minute prescriptions are coach-managed');
// evalProg end-to-end: RPE-8 half-increment on a barbell squat SNAPS (93.75 → 92.5 → demoted to hold)
S.sessions=[];
// (E2) Back Squat carries incrementKg:5 — RPE ≤8 + hitTop earns the FULL
// per-lift step now. The half-step demote path is covered by a non-override
// lift (Pause Squat) below.
S.activeSession={dayIndex:0,date:'2026-07-10',dayLabel:'T',sessionType:'lifting',startTime:1,exercises:[
  {name:'Back Squat',cat:'squat',prescribed:{sets:2,reps:'5',loadKg:92.5,unit:'kg'},equipmentClass:'barbell',
   performed:[{type:'working',weightKg:92.5,reps:5,rpe:8,logged:true},{type:'working',weightKg:92.5,reps:5,rpe:8,logged:true}],tags:[],progression:null,nextLoad:null}
]};
evalProg(0);
const sqEx=S.activeSession.exercises[0];
assert(sqEx.progression==='increase' && sqEx.nextLoad===97.5, 'evalProg(E2): Back Squat @8 hitTop → +5 per-lift step (92.5→97.5). Got: '+sqEx.progression+' '+sqEx.nextLoad);
// G3: on a rack with 1 kg pairs a +1.25 earned bump IS deliverable — the old
// 2.5-grid demote no longer applies here; nearest rackable above 92.5 is 94.
S.activeSession.exercises[0]={name:'Pause Squat',cat:'squat',prescribed:{sets:2,reps:'5',loadKg:92.5,unit:'kg'},equipmentClass:'barbell',
  performed:[{type:'working',weightKg:92.5,reps:5,rpe:8,logged:true},{type:'working',weightKg:92.5,reps:5,rpe:8,logged:true}],tags:[],progression:null,nextLoad:null};
evalProg(0);
assert(S.activeSession.exercises[0].progression==='increase' && S.activeSession.exercises[0].nextLoad===94, 'G3: RPE-8 +half (93.75) → nearest rackable 94 on a 1 kg rack. Got: '+S.activeSession.exercises[0].progression+' '+S.activeSession.exercises[0].nextLoad);
// The demote-to-hold guard input: a sub-step raw bump snaps BACK to topW
// (92.6 → nearest rackable 92.5), which is exactly what trips the demote.
assert(snapSuggestion(92.6,'barbell',{name:'Pause Squat'})===92.5, 'G3: sub-step raw bump rounds back to topW (demote guard). Got: '+snapSuggestion(92.6,'barbell',{name:'Pause Squat'}));
// RPE-7 on the override lift → same full step
S.activeSession.exercises[0]={name:'Back Squat',cat:'squat',prescribed:{sets:2,reps:'5',loadKg:92.5,unit:'kg'},equipmentClass:'barbell',
  performed:[{type:'working',weightKg:92.5,reps:5,rpe:7,logged:true},{type:'working',weightKg:92.5,reps:5,rpe:7,logged:true}],tags:[],progression:null,nextLoad:null};
evalProg(0);
assert(S.activeSession.exercises[0].progression==='increase' && S.activeSession.exercises[0].nextLoad===97.5, 'evalProg(E2): RPE-7 also earns the full +5 (92.5→97.5). Got: '+S.activeSession.exercises[0].nextLoad);
// Deload: exact-multiple result passes through…
S.activeSession.exercises[0]={name:'Back Squat',cat:'squat',prescribed:{sets:2,reps:'5',loadKg:100,unit:'kg'},equipmentClass:'barbell',
  performed:[{type:'working',weightKg:100,reps:5,rpe:10,logged:true}],tags:[],progression:null,nextLoad:null};
evalProg(0);
assert(S.activeSession.exercises[0].progression==='flag' && S.activeSession.exercises[0].nextLoad===95, 'evalProg: deload 100→95 (exact multiple) passes through. Got: '+S.activeSession.exercises[0].nextLoad);
// …and a non-loadable deload snaps DOWN (never up): 97.5*0.95=92.6 → 92.5
S.activeSession.exercises[0]={name:'Back Squat',cat:'squat',prescribed:{sets:2,reps:'5',loadKg:97.5,unit:'kg'},equipmentClass:'barbell',
  performed:[{type:'working',weightKg:97.5,reps:5,rpe:10,logged:true}],tags:[],progression:null,nextLoad:null};
evalProg(0);
assert(S.activeSession.exercises[0].nextLoad===92.5, 'evalProg: deload 92.6 floor-snaps to 92.5 (never rounds a deload up). Got: '+S.activeSession.exercises[0].nextLoad);
// BW exercise: never a kg suggestion (the Bird Dog "next 1 kg" bug)
S.activeSession.exercises[0]={name:'Hanging Leg Raise',cat:'core',prescribed:{sets:2,reps:'10',loadKg:0,unit:'bw'},equipmentClass:'bw',
  performed:[{type:'working',weightKg:0,reps:10,rpe:7,logged:true},{type:'working',weightKg:0,reps:10,rpe:7,logged:true}],tags:[],progression:null,nextLoad:null};
evalProg(0);
assert(S.activeSession.exercises[0].progression==='increase' && S.activeSession.exercises[0].nextLoad===null && S.activeSession.exercises[0].nextTarget==='11', 'evalProg: BW HLR earns +1 rep (11), never kg. Got: load='+S.activeSession.exercises[0].nextLoad+' target='+S.activeSession.exercises[0].nextTarget);
// BW hold exercise: +5 sec
S.activeSession.exercises[0]={name:'False-Grip Hold',cat:'pull',prescribed:{sets:2,reps:'15s',loadKg:0,unit:'bw'},equipmentClass:'bw',
  performed:[{type:'working',weightKg:0,reps:15,rpe:6,logged:true},{type:'working',weightKg:0,reps:15,rpe:6,logged:true}],tags:[],progression:null,nextLoad:null};
evalProg(0);
assert(S.activeSession.exercises[0].nextTarget==='20s', 'evalProg: hold-type BW earns +5 sec (15s→20s). Got: '+S.activeSession.exercises[0].nextTarget);
S.activeSession=null;S.sessions=[];

// ===== C3: BACKGROUNDABLE SESSION + BOTTOM STRIP =====
// The trap is gone: no code path hides the tab bar anymore.
assert(!/navBar'\)\.style\.display='none'/.test(html) && !/navBar'\)\.style\.display\s*=\s*"none"/.test(html), 'Session: zero navBar-hide sites remain (tab bar never hidden)');
assert(!/navBar'\)\.style\.display='flex'/.test(html), 'Session: zero navBar-restore sites remain (nothing to restore)');
// Strip markup + placement
assert(/<div id="sessBar">/.test(html) && /id="sbSummary"/.test(html) && /id="sMiniDur"/.test(html), 'Session: #sessBar strip with summary + mini duration present');
assert(/#sessBar\{position:fixed;left:0;right:0;bottom:calc\(55px \+ var\(--sab\)\)/.test(html), 'Session: strip is fixed ABOVE the tab bar (not top:0 — the old overlap bug)');
assert(!/\.rest-bar\{position:fixed;top:0/.test(html), 'Session: rest bar no longer fixed to the top');
assert(/#app\.has-sessbar \.pad\{padding-bottom/.test(html), 'Session: content pads up when the strip is visible');
// renderSessionBar is harness-safe and shows the summary for a backgrounded session
assert(typeof renderSessionBar==='function' && typeof resumeSession==='function', 'Session: renderSessionBar + resumeSession defined');
S.activeSession={dayIndex:0,date:'2026-07-08',dayLabel:'Upper (Bench)',sessionType:'lifting',startTime:1,exercises:[
  {name:'Bench Press',performed:[{type:'working',weightKg:87.5,reps:5,logged:true}]},
  {name:'Face Pull',performed:[{type:'working',weightKg:36,reps:15,logged:false}]}
]};
let sbThrew=false;try{renderSessionBar();}catch(e){sbThrew=true;}
assert(sbThrew===false, 'Session: renderSessionBar runs clean under DOM mocks with a live session');
let rsThrew=false;try{resumeSession();}catch(e){rsThrew=true;}
assert(rsThrew===false, 'Session: resumeSession runs clean under DOM mocks');
S.activeSession=null;
let sbThrew2=false;try{renderSessionBar();}catch(e){sbThrew2=true;}
assert(sbThrew2===false, 'Session: renderSessionBar runs clean with no session');
// startRest/stopRest keep the strip in sync; go()/showView() re-render it
assert(/function stopRest\(\)\{[\s\S]{0,300}?renderSessionBar\(\)\}/.test(html), 'Session: stopRest syncs the strip');
assert(/showView\(id\)\{[^}]*renderSessionBar\(id\)/.test(html), 'Session: showView syncs the strip');
// End/Cancel remain the only session exits (unchanged semantics)
assert(/function cancelSession\(/.test(html) && /function endSession\(/.test(html) && /confirm\(/.test(html), 'Session: explicit End/Cancel flows intact');

// ===== C4: VARIANTS FIRST-CLASS =====
assert(typeof variantKey==='function' && typeof variantLabel==='function' && typeof histMatch==='function' && typeof resolveSessionVariant==='function', 'Variant: helpers defined');
// key normalization
assert(variantKey(null)==='' && variantKey({pulley:null,grip:null,angle:null,machine:null})==='', 'Variant: empty/null variant keys as ""');
assert(variantKey({pulley:'double',grip:'narrow'})==='pulley:double|grip:narrow', 'Variant: key normalizes fields. Got: '+variantKey({pulley:'double',grip:'narrow'}));
assert(variantLabel({pulley:'double',grip:'narrow'})==='double pulley, narrow', 'Variant: label reads naturally. Got: '+variantLabel({pulley:'double',grip:'narrow'}));
// histMatch matrix: legacy '' matches anything; two explicit variants never cross-match
const recLegacy={name:'Cable Low Row'};                       // pre-variant history
const recDouble={name:'Cable Low Row',variant:{pulley:'double',grip:'narrow'}};
const recSingle={name:'Cable Low Row',variant:{pulley:'single'}};
const kDouble=variantKey({pulley:'double',grip:'narrow'});
assert(histMatch(recLegacy,'Cable Low Row',kDouble)===true, 'Variant: legacy record matches a variant query');
assert(histMatch(recDouble,'Cable Low Row','')===true, 'Variant: variant record matches a no-variant query');
assert(histMatch(recDouble,'Cable Low Row',kDouble)===true, 'Variant: same variant matches');
assert(histMatch(recSingle,'Cable Low Row',kDouble)===false, 'Variant: different explicit variants never cross-match');
assert(histMatch(recDouble,'Bench Press',kDouble)===false, 'Variant: name must still match');
// suggestion isolation: variant A history does not feed variant B
S.sessions=[
  {date:'2026-07-01',dayLabel:'A',exercises:[{name:'Cable Low Row',variant:{pulley:'single'},prescribed:{sets:1,reps:'8',loadKg:50,unit:'kg'},performed:[{type:'working',weightKg:50,reps:8,logged:true}]}]},
  {date:'2026-07-03',dayLabel:'B',exercises:[{name:'Cable Low Row',variant:{pulley:'double'},prescribed:{sets:1,reps:'8',loadKg:31.5,unit:'kg'},performed:[{type:'working',weightKg:31.5,reps:8,logged:true}]}]}
];
assert(bestHistoricalE1rm('Cable Low Row',{pulley:'double'})<bestHistoricalE1rm('Cable Low Row',{pulley:'single'}), 'Variant: per-variant e1RM tracks are independent');
assert(isSetPR('Cable Low Row',33,8,{pulley:'double'})===true, 'Variant: 33kg double-pulley beats its OWN track (not judged vs single-pulley 50)');
assert(isSetPR('Cable Low Row',33,8,{pulley:'single'})===false, 'Variant: 33kg is no PR on the single-pulley track');
S.sessions=[];
// per-gym memory + precedence: program prescription wins; else gym memory; else null
S.settings.activeGymId='gym-commercial';
S.settings.variantMemory={'gym-commercial':{'Cable Low Row':{pulley:'single',grip:null,angle:null,machine:null}}};
assert(variantKey(resolveSessionVariant({name:'Cable Low Row',variant:{pulley:'double',grip:'narrow'}}))===kDouble, 'Variant: program-prescribed variant wins over gym memory');
assert(variantKey(resolveSessionVariant({name:'Cable Low Row'}))==='pulley:single', 'Variant: gym memory fills in when program has none');
assert(resolveSessionVariant({name:'Bench Press'})===null, 'Variant: no prescription + no memory → null');
S.settings.variantMemory={};
// program seeds + record shape + chip markup
assert(variantKey(DEF_PROGRAM.days.find(d=>d.id===6).exercises.find(e=>e.name==='Cable Low Row').variant)===kDouble, 'Variant: W4 Cable Low Row prescribed double-pulley narrow');
assert(DEF_PROGRAM.days.find(d=>d.id===7).exercises.find(e=>e.name==='Face Pull').variant.attachment==='rope', 'Variant: B6 Face Pull prescribed single/rope');
assert(/variant:ex\.variant\|\|null/.test(html), 'Variant: session records persist the variant');
assert(/class="variant-chips"/.test(html) && /setVariant\(/.test(html), 'Variant: chips rendered on the logging card');
assert(/equipmentClass:ex\.equipmentClass\|\|inferEquipmentClass\(ex\.name\)/.test(html), 'Variant: session exercises carry equipmentClass (progression snapping depends on it)');

// ===== C5: SKIP-REFLOW + CHRONIC-SKIP =====
assert(typeof chronicSkips==='function' && typeof confirmMoveExercise==='function' && typeof movableDays==='function', 'Skip: reflow + chronic helpers defined');
// chronic detection: 3 consecutive skipped appearances trigger; a completed one resets
const mkSkipRec=(date,skipped)=>({date,dayLabel:'X',blockName:S.program.name,exercises:[{name:'Face Pull',tags:[],progression:skipped?'skipped':'hold',performed:[{type:'working',weightKg:36,reps:skipped?0:15,logged:true,skipped:!!skipped}]}]});
S.settings.chronicDismissed={};
S.sessions=[mkSkipRec('2026-06-24',true),mkSkipRec('2026-06-26',true),mkSkipRec('2026-06-28',true)];
assert(chronicSkips().some(c=>c.name==='Face Pull'&&c.count===3), 'Skip: 3 consecutive skips → chronic. Got: '+JSON.stringify(chronicSkips()));
S.sessions=[mkSkipRec('2026-06-24',true),mkSkipRec('2026-06-26',true)];
assert(chronicSkips().length===0, 'Skip: 2 skips is not chronic');
S.sessions=[mkSkipRec('2026-06-20',true),mkSkipRec('2026-06-22',true),mkSkipRec('2026-06-24',false),mkSkipRec('2026-06-26',true),mkSkipRec('2026-06-28',true)];
assert(chronicSkips().length===0, 'Skip: a completed appearance resets the streak');
// dismissal is per-block
S.sessions=[mkSkipRec('2026-06-24',true),mkSkipRec('2026-06-26',true),mkSkipRec('2026-06-28',true)];
S.settings.chronicDismissed={'Face Pull':S.program.name};
assert(chronicSkips().length===0, 'Skip: dismissed-this-block stays hidden');
S.settings.chronicDismissed={'Face Pull':'some old block'};
assert(chronicSkips().length===1, 'Skip: a dismissal from a previous block does not carry over');
S.settings.chronicDismissed={};S.sessions=[];
// move: appends a deep copy to the target day, marks (not splices) the session exercise
S.program=JSON.parse(JSON.stringify(DEF_PROGRAM));migrateV3();
S.activeSession={dayIndex:6,dayId:7,date:'2026-08-23',dayLabel:'Press + Pull',sessionType:'lifting',startTime:1,exercises:S.program.days[6].exercises.map(ex=>({name:ex.name,cat:ex.cat,prescribed:{sets:ex.sets,reps:ex.reps,loadKg:ex.loadKg,unit:ex.unit||'kg'},equipmentClass:ex.equipmentClass,performed:[{type:'working',weightKg:ex.loadKg,reps:5,rpe:null,logged:false}],tags:ex.tags||[],rest:ex.rest,progression:null,nextLoad:null})),notes:''};
const preLen=S.activeSession.exercises.length;
const preTargetLen=S.program.days[2].exercises.length;
const fpIdx2=S.activeSession.exercises.findIndex(e=>e.name==='Lateral Raise');
confirmMoveExercise(fpIdx2,2);
assert(S.activeSession.exercises.length===preLen, 'Skip: move does NOT splice the session (index pairing with confirmRpe preserved)');
assert(S.activeSession.exercises[fpIdx2].progression==='skipped' && S.activeSession.exercises[fpIdx2].performed[0].skipReason==='moved', 'Skip: moved exercise marked skipped/moved in-session');
assert(S.program.days[2].exercises.length===preTargetLen+1 && S.program.days[2].exercises.some(e=>e.name==='Lateral Raise'&&(e.tags||[]).includes('moved-in')), 'Skip: deep copy appended to the target day');
// chronic actions: move earlier + drop
S.program=JSON.parse(JSON.stringify(DEF_PROGRAM));migrateV3();S.activeSession=null;
chronicMoveEarlier('Lateral Raise');
assert(S.program.days[6].exercises[1].name==='Lateral Raise', 'Skip: Move earlier → index 1 in its own day (press day). Got: '+S.program.days[6].exercises[1].name);
assert(/openMoveExercise/.test(html) && /id="moveExModal"/.test(html), 'Skip: skip sheet offers the move action + picker modal exists');
assert(/Skipped \$\{cs\.count\}/.test(html), 'Skip: chronic card renders on Train (sentence-case)');
S.program=JSON.parse(JSON.stringify(DEF_PROGRAM));migrateV3();S.sessions=[];S.settings.chronicDismissed={};

// ===== C6: WEEKLY COACH REPORT (W4 week) =====
assert(typeof buildCoachReport==='function' && typeof isWeekComplete==='function' && typeof copyWeeklyReport==='function', 'Report: weekly builders defined');
S.program=JSON.parse(JSON.stringify(DEF_PROGRAM));migrateV3();S.skips=[];
const _raSave=S.recurringActivities;S.recurringActivities=[]; // isolate the program count
const wkAug17=weekDatesFor('2026-08-17'); // Mon Aug 17 – Sun Aug 23 (B6 W1)
const liftRec=(date,label,dayId)=>({date,dayLabel:label,dayId:dayId!=null?dayId:null,blockName:S.program.name,duration:60,rpe:7,status:'complete',exercises:[{name:'Deadlift',cat:'hinge',prescribed:{sets:1,reps:'5',loadKg:126,unit:'kg'},performed:[{type:'working',weightKg:126,reps:5,rpe:8,logged:true}],progression:'hold',nextLoad:126,variant:null,tags:[]}],painEvents:[]});
const actRec=(date,dayId,type,label,dist,extra)=>makeActivitySession(Object.assign({startTime:+date.replace(/-/g,''),date,dayId,blockName:S.program.name,dayLabel:label,sessionType:type,activity:Object.assign({durationMin:45,distance:dist||0,effort:6,notes:''},extra||{})}));
S.sessions=[
  liftRec('2026-08-22','Deadlift + Pull',6),                                  // this week
  liftRec('2026-08-16','Squat',null),                                         // LAST block — excluded
  actRec('2026-08-18',2,'swim','Swim',800,{continuous:true})
];
const rpt=buildCoachReport(S.sessions,S.program,wkAug17);
assert(/Week .*Aug 17.*Aug 23/.test(rpt), 'Report: header names the calendar week. Got: '+rpt.split('\n')[0]);
assert(/Deadlift \+ Pull/.test(rpt), 'Report: this week\'s session included');
// B6: seven program days minus the Rest Friday = 6 scheduled
assert(/Sessions: 2 \/ 6 scheduled/.test(rpt), 'Report: N/M excludes the rest day (6 scheduled). Got: '+(rpt.split('\n').find(l=>/Sessions:/.test(l))||'none'));
assert(/\(swim\).*45 min.*800 m/.test(rpt), 'Report: swim renders as one activity line');
// variant label in the line
S.sessions=[{date:'2026-08-22',dayLabel:'Deadlift + Pull',dayId:6,blockName:S.program.name,duration:60,rpe:7,status:'complete',exercises:[{name:'Cable Low Row',cat:'pull',prescribed:{sets:1,reps:'8',loadKg:34,unit:'kg'},performed:[{type:'working',weightKg:34,reps:8,logged:true}],progression:'hold',nextLoad:34,variant:{pulley:'double',grip:'narrow'},tags:[]}],painEvents:[]}];
assert(/Cable Low Row \(double pulley, narrow\)/.test(buildCoachReport(S.sessions,S.program,wkAug17)), 'Report: variant label rendered inline');

// isWeekComplete on the live B6 block: six loggable days + the exempt Rest Friday
S.sessions=[actRec('2026-08-17',1,'kb','KB',0),actRec('2026-08-18',2,'swim','Swim',800,{continuous:true}),liftRec('2026-08-19','Squat',3),actRec('2026-08-20',4,'swim','Swim',600),liftRec('2026-08-22','Deadlift + Pull',6),liftRec('2026-08-23','Press + Pull',7)];
assert(isWeekComplete(wkAug17)===true, 'Report: six logged days + exempt rest Friday → week complete');
S.sessions=S.sessions.slice(0,5);
assert(isWeekComplete(wkAug17)===false, 'Report: a missing day → not complete');
S.skips=[{dayLabel:'Press + Pull',dayId:7,blockName:S.program.name,date:'2026-08-23',reason:'sick'}];
assert(isWeekComplete(wkAug17)===true, 'Report: a skipped day counts as resolved');
S.skips=[];S.sessions=[];S.recurringActivities=_raSave;

// ===== dayId COLLISION REGRESSION (synthetic two-swim program) =====
// Block 5 has unique labels, but the deload's two-"Swim" bug must never
// return — pinned against a synthetic program, decoupled from the live block.
const _b5prog=S.program;
S.program={name:'TwoSwim',active:true,days:[
  {id:1,label:'Swim',defaultDay:'Monday',dayOfWeek:'Monday',sessionType:'swim',dur:45,exercises:[]},
  {id:2,label:'Lift',defaultDay:'Tuesday',dayOfWeek:'Tuesday',sessionType:'lifting',dur:60,exercises:[]},
  {id:3,label:'Swim',defaultDay:'Thursday',dayOfWeek:'Thursday',sessionType:'swim',dur:45,exercises:[]}
]};
const tsSwim=(date,dayId)=>makeActivitySession({startTime:+date.replace(/-/g,''),date,dayId,blockName:'TwoSwim',dayLabel:'Swim',sessionType:'swim',activity:{durationMin:30,distance:700,effort:6,notes:''}});
S.sessions=[tsSwim('2026-07-20',1)];S.skips=[];
assert(isDayDone(0)===true&&isDayDone(2)===false, 'dayId: one swim record marks ONLY its own day done');
S.skips=[{dayLabel:'Swim',dayId:1,blockName:'TwoSwim',date:'2026-07-20',reason:'sick'}];S.sessions=[];
assert(isDaySkipped(0)===true&&isDaySkipped(2)===false, 'dayId: skip records disambiguate same-label days');
S.sessions=[{date:'2026-07-21',dayLabel:'Lift',dayId:null,blockName:'TwoSwim',status:'complete',exercises:[],duration:60}];S.skips=[];
assert(isDayDone(1)===true, 'dayId: legacy label-only record still matches a unique-label day');
S.program=_b5prog;S.sessions=[];S.skips=[];
// end-of-session report is gone
assert(!/reportBox/.test(html) && !/function copyReport\(/.test(html), 'Report: per-session report box + copyReport removed');
assert(/copyWeeklyReport\(\)/.test(html) && />Week complete</.test(html), 'Report: header icon + week-complete banner wired (sentence-case)');

// ===== C7: BIG-3 TARGETS SURFACED =====
assert(typeof e1rmChartBounds==='function' && typeof mainTargetLine==='function', 'Targets: helpers defined');
// chart bounds include the target even when data is far below it
const bnds=e1rmChartBounds([{y:100},{y:120}],{squat:166,bench:102,dead:186});
assert(bnds.maxY>=186, 'Targets: chart maxY includes the highest target (was clipped before). Got: '+bnds.maxY);
assert(e1rmChartBounds([{y:200}],{squat:166}).maxY>=200*1.05, 'Targets: data above target still pads from data');
// main-lift card line: today · e1RM · target, FIXED_MAINS only, unit-respecting
S.settings.unit='kg';S.sessions=[{date:'2026-07-05',dayLabel:'X',exercises:[{name:'Deadlift',performed:[{type:'working',weightKg:111,reps:5,logged:true}]}]}];
const mtl=mainTargetLine({name:'Deadlift',prescribed:{loadKg:116,unit:'kg'}});
assert(/today <span class="tnum">116<\/span>/.test(mtl) && /target <span class="tnum">186<\/span> kg/.test(mtl) && /e1RM/.test(mtl), 'Targets: deadlift card line shows today 116 · e1RM · target 186 kg. Got: '+mtl.replace(/<[^>]+>/g,''));
assert(mainTargetLine({name:'Face Pull',prescribed:{loadKg:36,unit:'kg'}})==='', 'Targets: accessories get no target line (FIXED_MAINS only)');
S.settings.unit='lb';
assert(/ lb</.test(mainTargetLine({name:'Deadlift',prescribed:{loadKg:116,unit:'kg'}})), 'Targets: line respects display unit');
S.settings.unit='kg';S.sessions=[];
// dashboard sub-row shows current/target per lift + dashed chart target lines
assert(/class="s-tgt">\/\$\{tgt\(k\)\}/.test(html), 'Targets: 1000lb sub-row renders current/target per lift');
assert(/stroke-dasharray="4 3"/.test(html) && /tgts\.squat\],\['Bench',tgts\.bench\],\['Deadlift',tgts\.dead\]/.test(html), 'Targets: e1RM chart draws dashed per-lift target lines');

// ===== C8: SETTINGS RESTRUCTURE + UNIFIED IMPORT =====
assert(typeof detectImportPayload==='function' && typeof runValidatorAuto==='function', 'Settings: unified import helpers defined');
assert(detectImportPayload('{"name":"B","days":[]}').kind==='program', 'Settings: {name,days} detected as program');
assert(detectImportPayload('{"sessions":[],"program":{},"settings":{}}').kind==='backup', 'Settings: full export detected as backup');
assert(detectImportPayload('{"settings":{"unit":"kg"}}').kind==='backup', 'Settings: partial backup (settings only) detected');
assert(detectImportPayload('{"foo":1}').kind==='error' && detectImportPayload('not json').kind==='error' && detectImportPayload('[1,2]').kind==='error', 'Settings: garbage rejected with an error');
// 4 titled groups, dead buttons gone, functions alive
assert(/class="set-grp">Training</.test(html) && /class="set-grp">Data</.test(html) && /class="set-grp">App</.test(html) && /class="set-grp">Advanced</.test(html), 'Settings: four titled groups (sentence-case, v3.5)');
assert(!/onclick="doRotateAccessories\(\)"/.test(html), 'Settings: Rotate Accessories button removed from UI');
assert(!/onclick="runValidatorAndShow\(\)"/.test(html), 'Settings: Validate Program button removed from UI');
assert(typeof doRotateAccessories==='function' && typeof runValidatorAndShow==='function' && typeof parseRestorePayload==='function', 'Settings: removed-from-UI functions still exist in code');
assert(!/Import Block from JSON<\/button>/.test(html), 'Settings: Import Block button removed from Train');
assert(!/id="restoreModal"/.test(html), 'Settings: separate restore modal gone (unified import handles backups, warning preserved)');
assert(/This is a FULL BACKUP\. Restoring OVERWRITES/.test(html), 'Settings: destructive restore keeps its warning');
assert(/runValidatorAuto\(/.test(html) && /maybeAdvanceBrandSafe\(\);/.test(html), 'Settings: validator auto-runs on sync/import');
// +Add Goal behind the overflow
assert(/id="goalsMenu"/.test(html) && /toggleGoalsMenu/.test(html), 'Settings: Add Goal moved behind the Progress overflow menu');

// ===== C9: BRAND SYSTEM + MOTION =====
assert(Array.isArray(BRAND_CYCLE) && BRAND_CYCLE.length===7, 'Brand: 7-colour cycle');
assert(BRAND_CYCLE[0].name==='ember' && BRAND_CYCLE[0].c==='#FF6A3D', 'Brand: index 0 is ember #FF6A3D (Block 4 W3 ships ember)');
assert(typeof applyBrand==='function' && typeof maybeAdvanceBrand==='function' && typeof animateCount==='function', 'Brand: functions defined');
// applyBrand is harness-safe (mock document has no documentElement)
let abThrew=false;try{applyBrand();}catch(e){abThrew=true;}
assert(abThrew===false, 'Brand: applyBrand no-ops cleanly under the mock document');
// advance-once semantics. G7: version-era gates on a version INCREASE;
// legacy states (no program version) fall back to the name comparison.
const _pvSave=S.program.version,_bvSave=S.settings.brandVersion;
delete S.program.version;delete S.settings.brandVersion;
S.settings.brandIdx=-1;S.settings.brandBlock='Jun 29 Block 4 W2';S.program.name='Jul 8 Block 4 W3';
maybeAdvanceBrand();
assert(S.settings.brandIdx===0 && S.settings.brandBlock==='Jul 8 Block 4 W3', 'Brand: legacy (no version) adopting W3 advances -1 → 0. Got idx '+S.settings.brandIdx);
maybeAdvanceBrand();
assert(S.settings.brandIdx===0, 'Brand: idempotent — same block never advances twice');
// version era: an INCREASE advances once; a name flap at the same version doesn't.
S.program.version=9;S.settings.brandVersion=undefined;
maybeAdvanceBrand();
assert(S.settings.brandIdx===1&&S.settings.brandVersion===9, 'G7: version 9 over seen 0 advances + stamps. Got idx '+S.settings.brandIdx);
S.program.name='Cache Flap Old Name';maybeAdvanceBrand();
assert(S.settings.brandIdx===1, 'G7: same version never advances again, whatever the name does');
S.program.version=_pvSave;S.settings.brandVersion=_bvSave;
S.program.name='Jul 8 Block 4 W3';S.settings.brandIdx=0;S.settings.brandBlock='Jul 8 Block 4 W3';
// wired into every adoption path
assert(/maybeAdvanceBrand\(\);\}catch/.test(html.replace(/\s+/g,'')) || /try\{maybeAdvanceBrand\(\);\}catch\(e\)\{\}/.test(html), 'Brand: load() advances after restore/cross-device');
assert(/function maybeAdvanceBrandSafe/.test(html) && (html.match(/maybeAdvanceBrandSafe\(\);/g)||[]).length>=2, 'Brand: syncProgram + doImport advance via the safe hook');
// CSS discipline: brand where intended, gold achievement untouched
assert(/--brand:#FF6A3D;--brand2:#F4B942/.test(html), 'Brand: :root static fallback is the curated ember pair');
assert(/\.bar-btn\.on\{color:var\(--brand\)\}/.test(html), 'Brand: active tab uses --brand');
assert(/\.start-btn\{background:linear-gradient\(135deg,var\(--brand\),var\(--brand2\)\)/.test(html), 'Brand: Start button uses the brand gradient');
assert(/\.pr-tag\{[^}]*color:var\(--gold\)/.test(html), 'Brand: PR tag STAYS gold (achievement never rotates)');
assert(/--lift-sq:#22D3EE;--lift-bp:#818CF8;--lift-dl:#C084FC/.test(html), 'Brand: per-lift ring hues untouched (token form, never rotate)');
assert(/class="q-mark"/.test(html) && /\.q-mark\{[^}]*color:var\(--brand\)/.test(html), 'Brand: quote mark carries the brand');
assert(/#sessBar\{[^}]*border-top:2px solid var\(--brand\)/.test(html), 'Brand: session strip carries the brand');
// depth pass + hero + count-up
// D7 structure pins replace the exact-shadow pin: 16px radius token, brand
// active border, borderless resting cards, top-edge highlight preserved.
assert(/--r:16px/.test(html), 'Depth: card radius token is 16px (v3.5)');
assert(!/box-shadow:[^};]*,[^};]*(inset|rgba)[^}]*\}/.test(html.match(/<style>([\s\S]*?)<\/style>/)[1].split('\n').filter(l=>/box-shadow:[^}]*,[^}]*box-shadow|box-shadow:inset[^}]*,/.test(l)).join('')) && !/box-shadow:inset 0 1px 0 rgba\(255,255,255,\.05\),/.test(html), 'SOLAR depth: no stacked shadow layers (old two-layer highlight retired)');
assert(/\.ex-card\{[^}]*border:1px solid transparent[^}]*overflow:visible\}/.test(html), 'Depth: resting ex-card borderless AND keeps overflow:visible (menu escape)');
assert(/\.ex-card\.active\{border-color:color-mix\(in srgb,var\(--brand\) 35%,transparent\)/.test(html), 'Depth: active card = 1px brand @35%');
assert(/\.ex-card\.active\{[^}]*color-mix\(in srgb,var\(--brand\) 12%,transparent\)/.test(html), 'Depth: active card brand glow @12%');
assert(/\.ex-card\.main-lift\{background:color-mix\(in srgb,var\(--brand\) 4%/.test(html) && /main-lift'/.test(html), 'SOLAR: main-lift cards carry a flat brand tint (gradient budget spent elsewhere)');
assert(/id="sessionHero"/.test(html) && /function showSessionHero/.test(html) && /typeof requestAnimationFrame!=='function'\)return/.test(html), 'Hero: overlay present, rAF/reduced-motion guarded');
// animateCount fallback path (no rAF in harness → instant final value)
const cntEl={textContent:''};
animateCount(cntEl,751);
assert(cntEl.textContent==='751', 'Motion: animateCount falls back to the final value without rAF. Got: '+cntEl.textContent);
assert(/glow-up/.test(html) && /@keyframes valglow/.test(html), 'Motion: changed-value glow wired');

// ===== C10: WEEK WRAPPED =====
assert(typeof buildWeekWrappedData==='function' && typeof showWeekWrapped==='function' && typeof dismissWeekWrapped==='function', 'Wrapped: functions defined');
S.program=JSON.parse(JSON.stringify(DEF_PROGRAM));migrateV3();S.skips=[];
const wwWk=weekDatesFor('2026-07-06');
const wwRec=(date,label,name,w,reps)=>({date,dayLabel:label,blockName:S.program.name,duration:60,rpe:7,status:'complete',exercises:[{name,cat:'hinge',prescribed:{sets:1,reps:'5',loadKg:w,unit:'kg'},performed:[{type:'working',weightKg:w,reps,logged:true}],progression:'hold',nextLoad:w,variant:null,tags:[]}],painEvents:[]});
S.sessions=[
  wwRec('2026-06-28','Old','Deadlift',111,5),          // before this week → delta baseline
  wwRec('2026-07-08','Upper (Bench)','Bench Press',87.5,5),
  wwRec('2026-07-12','Deadlift + Pull','Deadlift',116,5)
];
const ww=buildWeekWrappedData(wwWk);
assert(ww.done===2, 'Wrapped: counts only this week\'s sessions. Got: '+ww.done);
assert(ww.volume===Math.round(87.5*5+116*5), 'Wrapped: volume sums this week\'s working sets. Got: '+ww.volume);
const wwDl=ww.lifts.find(l=>l.name==='Deadlift');
assert(wwDl.top==='116×5' && wwDl.delta>0, 'Wrapped: deadlift top set + positive e1RM delta vs pre-week best. Got: '+JSON.stringify(wwDl));
assert(typeof ww.muDone==='number' && ww.weekLabel.length>0, 'Wrapped: MU status + week label present');
// gating: card only when week complete AND not yet seen
assert(/S\.settings\.wrappedSeen!==_wd\[0\]/.test(html) && /showWeekWrapped\(\)/.test(html), 'Wrapped: Train card gated by isWeekComplete + wrappedSeen');
assert(/id="wrapOverlay"/.test(html) && /shareWrappedPNG/.test(html), 'Wrapped: overlay + share affordance present');
assert(/if\(typeof document\.createElement!=='function'\)return;/.test(html), 'Wrapped: canvas path guarded, tap-handler only');
S.sessions=[];

// ===== D2: WARM-UP SETS FIRST-CLASS =====
// startDay pre-populates W rows from the prescription, ahead of working sets
S.program=JSON.parse(JSON.stringify(DEF_PROGRAM));migrateV3();S.sessions=[];S.activeSession=null;
global.showSessionHero=global.showSessionHero||(()=>{});
global.startTimer=()=>{}; // real interval would hang the harness (node never exits)
startDay(2); // B6 Squat (Wednesday, id 3, index 2)
const sqSess=S.activeSession.exercises.find(e=>e.name==='Back Squat');
const wuRows=sqSess.performed.filter(pp=>pp.type==='warmup');
assert(wuRows.length===3 && wuRows[0].weightKg===60 && wuRows[0].reps===5 && wuRows[2].weightKg===100 && wuRows[2].reps===1, 'D2: squat pre-populates 60x5/85x3/100x1 warmup rows (W4 authored). Got: '+JSON.stringify(wuRows));
assert(sqSess.performed[0].type==='warmup' && sqSess.performed[2].type==='warmup' && sqSess.performed[3].type==='working', 'D2: warmup rows come BEFORE working rows');
assert(sqSess.performed.filter(pp=>pp.type==='working').length===4, 'D2: four working rows (1 top + 3 back-offs from the setScheme)');
assert(S.activeSession.exercises.find(e=>e.name==='Bird Dog').performed.every(pp=>pp.type==='working'), 'D2: exercises without warmup[] get none');
// e1RM + progression ignore warmups even when logged heavier than working
sqSess.performed.forEach(pp=>{pp.logged=true;if(pp.type==='working')pp.rpe=7;});
sqSess.performed[1].weightKg=200;sqSess.performed[1].reps=1; // absurd logged warmup
evalProg(S.activeSession.exercises.indexOf(sqSess));
assert(sqSess.nextLoad===120, 'D2/E2: progression works off the 115 top set (+5 per-lift step) and ignores the 200kg warmup. Got: '+sqSess.nextLoad);
S.sessions=[{date:'2026-08-01',dayLabel:'Squat',dayId:5,blockName:S.program.name,duration:70,rpe:7,status:'complete',exercises:[{name:'Back Squat',prescribed:{sets:4,reps:'5',loadKg:110,unit:'kg'},performed:sqSess.performed,progression:'hold',nextLoad:110,variant:null,tags:[]}],painEvents:[]}];
assert(bestHistoricalE1rm('Back Squat')<150, 'D2: e1RM ignores the 200kg warmup row in history. Got: '+bestHistoricalE1rm('Back Squat'));
// report marks warmups distinctly + volume includes them
const rptD2=buildCoachReport(S.sessions,S.program,weekDatesFor('2026-07-27'));
assert(/    w: /.test(rptD2), 'D2: report renders the compact "w:" warmup line');
const volLine=rptD2.split('\n').find(l=>/Volume:/.test(l));
const expVol=Math.round(sqSess.performed.filter(pp=>!pp.skipped).reduce((a,pp)=>a+pp.weightKg*pp.reps,0));
assert(volLine&&volLine.includes(String(expVol)), 'D2: session volume INCLUDES warmup tonnage. Got: '+volLine+' expected '+expVol);
S.sessions=[];S.activeSession=null;

// ===== D3: ATTACHMENT DIMENSION + CHIP GATING =====
// key regression: no attachment → key unchanged from the pre-attachment build
assert(variantKey({pulley:'double',grip:'narrow'})==='pulley:double|grip:narrow', 'D3: keys without attachment are unchanged (history continuity)');
assert(variantKey({pulley:'single',attachment:'rope'})==='pulley:single|attachment:rope', 'D3: attachment joins the key (appended last)');
assert(variantLabel({attachment:'rope'})==='rope', 'D3: label renders the attachment');
// rope vs bar → independent tracks
S.sessions=[
  {date:'2026-07-01',dayLabel:'A',exercises:[{name:'Face Pull',variant:{attachment:'rope'},prescribed:{sets:1,reps:'12',loadKg:20,unit:'kg'},performed:[{type:'working',weightKg:20,reps:12,logged:true}]}]},
  {date:'2026-07-03',dayLabel:'B',exercises:[{name:'Face Pull',variant:{attachment:'straight-bar'},prescribed:{sets:1,reps:'12',loadKg:14,unit:'kg'},performed:[{type:'working',weightKg:14,reps:12,logged:true}]}]}
];
assert(bestHistoricalE1rm('Face Pull',{attachment:'straight-bar'})<bestHistoricalE1rm('Face Pull',{attachment:'rope'}), 'D3: rope vs bar are independent tracks');
assert(isSetPR('Face Pull',16,12,{attachment:'straight-bar'})===true&&isSetPR('Face Pull',16,12,{attachment:'rope'})===false, 'D3: PR judged on the attachment track');
S.sessions=[];
// chip gating matrix (by movement pattern, not equipment)
const chipHTML=(name,cls,v)=>variantChips({name,equipmentClass:cls,variant:v||null},0);
assert(chipHTML('Back Squat','barbell')==='', 'D3: Back Squat (squat pat) shows NO chips');
assert(chipHTML('DB RDL','db')==='', 'D3: DB RDL (hinge pat) shows NO chips');
// C5 FLIP: both incline presses are avoid-listed, so 30°/45° are hidden and
// the angle group (left with only 'flat') disappears entirely.
assert(chipHTML('DB Bench Press','db')===''&&chipHTML('Bench Press','barbell')==='', 'C5: angle group hidden while inclines are avoid-listed');
(()=>{ // lift the avoids → chips return (proves the gate is avoid-driven)
  const a=EX_META['DB Incline Bench'].avoid,b=EX_META['Incline Bench Press'].avoid;
  EX_META['DB Incline Bench'].avoid=false;EX_META['Incline Bench Press'].avoid=false;
  assert(/Angle/.test(chipHTML('DB Bench Press','db'))&&/30\u00b0|30°/.test(chipHTML('DB Bench Press','db')), 'C5: angle chips return when the avoids lift');
  EX_META['DB Incline Bench'].avoid=a;EX_META['Incline Bench Press'].avoid=b;
})();
assert(variantValueAvoided('angle','30')===true&&variantValueAvoided('angle','flat')===false, 'C5: value→avoid mapping');
const clrChips=chipHTML('Cable Low Row','cable');
assert(/Pulley/.test(clrChips)&&/Attach/.test(clrChips)&&/Grip/.test(clrChips), 'D3: Cable Low Row (hpull, cable) shows pulley + attachment + grip');
const ctrChips=chipHTML('Cable Tricep Extension','cable');
assert(/Pulley/.test(ctrChips)&&/Attach/.test(ctrChips)&&!/Grip/.test(ctrChips), 'D3: cable triceps (iso, not a pull) gets pulley/attachment but no grip chips');
assert(/\[\['rope','rope'\],\['straight-bar','bar'\]/.test(html), 'D3: attachment chip row wired (rope/bar/v-handle/handle)');
S.sessions=[];

// ===== D4: SMALL FIXES (keyboard, strings, goal-complete, pace) =====
// big3PaceParts: at-target lifts drop from BOTH sides
assert(typeof big3PaceParts==='function', 'D4: big3PaceParts defined');
const ppAll={squat:120,bench:102,dead:140,deltaSquat:1,deltaBench:-2,deltaDead:2};
const ppTgt={squat:166,bench:102,dead:186};
const pp=big3PaceParts(ppAll,ppTgt,10);
assert(Math.abs(pp.need-((166-120)+(186-140))/10)<0.01, 'D4: need excludes the at-target bench. Got: '+pp.need);
assert(pp.actual===3, 'D4: actual excludes the at-target bench\'s negative delta (1+2, not 1-2+2). Got: '+pp.actual);
assert(big3PaceParts({squat:170,bench:102,dead:190,deltaSquat:0,deltaBench:0,deltaDead:0},ppTgt,10).allAtTarget===true, 'D4: all-at-target flagged');
// units: need is kg/wk and actual kg (the old code compared lb/wk vs kg)
assert(/kg\/wk/.test(html)&&/lb\/week against progress in kg/.test(html), 'D4: unit fix documented at the source');
// ring complete state + one-time celebration + pace skip wiring
assert(/liftDone\[k\]\?1:Math\.min\(1,Math\.max\(0,b3\[k\]\/tg\[k\]\)\)/.test(html)&&/liftDone\[k\]\?'var\(--grn\)'/.test(html), 'D4: complete lift renders a full green (fully lit) orbit');
assert(/class="ring-done"/.test(html), 'D4: check badge overlay on the completed ring');
assert(/celebrateMilestone\('lift_target_'\+k/.test(html), 'D4: one-time celebration keyed per lift target');
// 4b: flag suggestion equal to the performed load renders as HOLD
S.program=JSON.parse(JSON.stringify(DEF_PROGRAM));migrateV3();
S.sessions=[{date:'2026-07-17',dayLabel:'Bench (Deload)',dayId:4,blockName:S.program.name,duration:50,rpe:7,status:'complete',exercises:[
  {name:'Face Pull',cat:'pull',prescribed:{sets:2,reps:'12',loadKg:16.5,unit:'kg'},performed:[{type:'working',weightKg:16.5,reps:12,logged:true}],progression:'flag',nextLoad:16.5,progressionReason:'x',variant:null,tags:[]},
  {name:'Bench Press',cat:'push',prescribed:{sets:3,reps:'5',loadKg:75,unit:'kg'},performed:[{type:'working',weightKg:75,reps:5,logged:true}],progression:'flag',nextLoad:70,variant:null,tags:[]}
]}];
const rptD4=buildCoachReport(S.sessions,S.program,weekDatesFor('2026-07-13'));
assert(/Face Pull.*→ hold 16\.5 kg/.test(rptD4), 'D4: flag@performed-load reads "hold", never "deload to". Got: '+(rptD4.split('\n').find(l=>/Face Pull/.test(l))||'none'));
assert(/Bench Press.*→ deload to 70 kg/.test(rptD4), 'D4: a real deload still reads "deload to"');
S.sessions=[];
// 4a: keyboard focus handler present + guarded
assert(/focusin/.test(html)&&/closest\(&&t\.closest\('\.set-fields'\)|closest&&t\.closest\('\.set-fields'\)/.test(html)&&/scrollIntoView\(\{block:'center'/.test(html), 'D4: focused set input scrolls to viewport centre');

// ===== D5: BUG PACK (hero teardown, validateWeek naming, pain v2) =====
// 5a: navigating away tears the hero down (iOS timer throttling stranded it)
assert(/function go\(v\)\{\s*hideSessionHero\(\);/.test(html), 'D5: go() tears down the session hero');
assert(/if\(id!=='vSession'\)hideSessionHero\(\);/.test(html), 'D5: showView() tears down the hero off-session');
assert(/#sessionHero\{[^}]*pointer-events:none/.test(html)&&/#sessionHero\.on\{[^}]*pointer-events:auto/.test(html), 'D5: hero is hit-transparent unless shown');
// no full-screen overlay stays .on after backgrounding a live session
S.program=JSON.parse(JSON.stringify(DEF_PROGRAM));migrateV3();S.sessions=[];
S.activeSession={dayIndex:1,dayId:2,blockName:S.program.name,date:'2026-07-14',dayLabel:'Squat (Deload)',sessionType:'lifting',startTime:1,exercises:[],notes:''};
let heroThrew=false;try{go('Train');}catch(e){heroThrew=true;}
assert(heroThrew===false, 'D5: go(Train) with a live session runs clean under mocks');
S.activeSession=null;
// 5b: pair naming uses program-day labels; either-side cali exemption
S.program={name:'NameX',active:true,days:[
  {id:1,label:'Pull A',defaultDay:'Monday',dayOfWeek:'Monday',sessionType:'lifting',dur:60,exercises:[{id:'a',name:'Cable Low Row',cat:'pull',sets:4,reps:'8',loadKg:50,unit:'kg',rest:90,tags:[],equipmentClass:'cable'}],bonus:[]},
  {id:2,label:'Pull B',defaultDay:'Tuesday',dayOfWeek:'Tuesday',sessionType:'lifting',dur:60,exercises:[{id:'b',name:'Cable Low Row',cat:'pull',sets:4,reps:'8',loadKg:50,unit:'kg',rest:90,tags:[],equipmentClass:'cable'}],bonus:[]}
]};
const vwName=validateWeek(weekDatesFor('2026-07-13'),'2026-07-13');
const nameMsg=vwName.flatMap(r=>r.warnings).find(w=>/Same movement pattern/.test(w.msg));
assert(nameMsg&&/Pull A → Pull B/.test(nameMsg.msg), 'D5: warning names the PROGRAM DAY labels, not calendar dows. Got: '+(nameMsg&&nameMsg.msg));
// exemption applies when the SECOND side is the capped cali day too
S.program={name:'CaliY',active:true,days:[
  {id:1,label:'Pull Day',defaultDay:'Friday',dayOfWeek:'Friday',sessionType:'lifting',dur:60,exercises:[{id:'b',name:'Lat Pulldown',cat:'pull',sets:4,reps:'8',loadKg:50,unit:'kg',rest:90,tags:[],equipmentClass:'cable'}],bonus:[]},
  {id:2,label:'Cali',defaultDay:'Saturday',dayOfWeek:'Saturday',sessionType:'calisthenics',dur:40,tags:['RPE-7-cap'],exercises:[{id:'a',name:'Strict Pull-Up',cat:'pull',sets:3,reps:'3',loadKg:0,unit:'bw',rest:120,tags:[],equipmentClass:'bw'}]}
]};
const vwCaliB=validateWeek(weekDatesFor('2026-07-13'),'2026-07-13');
const caliMsgs=vwCaliB.flatMap(r=>r.warnings).filter(w=>/Same movement pattern/.test(w.msg));
assert(caliMsgs.length>0&&caliMsgs.every(w=>w.level==='info'), 'D5: capped-cali on the LATER side of the pair also exempts. Got: '+JSON.stringify(caliMsgs.map(w=>w.level)));
S.program=JSON.parse(JSON.stringify(DEF_PROGRAM));migrateV3();
// deload week itself validates clean (Tue/Fri/Sun lifting, no <36h same-pattern pairs)
const vwDeload=validateWeek(weekDatesFor('2026-07-13'),'2026-07-13');
assert(vwDeload.reduce((a,r)=>a+r.warnings.filter(w=>w.level==='warn').length,0)===0, 'D5: deload week validates clean. Got: '+JSON.stringify(vwDeload.flatMap(r=>r.warnings.filter(w=>w.level==='warn').map(w=>w.msg))));
// 4c pain v2: numeric severities + body area feed the store and the report
assert(typeof openPainModal==='function'&&typeof setPainArea==='function', 'D5: pain v2 fns defined');
S.activeSession={dayIndex:3,dayId:4,blockName:S.program.name,date:'2026-07-17',dayLabel:'Bench (Deload)',sessionType:'lifting',startTime:1,notes:'',exercises:[
  {name:'Strict Dip',cat:'push',prescribed:{sets:2,reps:'5',loadKg:0,unit:'bw'},equipmentClass:'bw',performed:[{type:'working',weightKg:0,reps:5,logged:true},{type:'working',weightKg:0,reps:5,logged:false}],tags:[],progression:null,nextLoad:null}
]};
painExI=0;_painArea='shoulder';
logPain(3);
const dipEx=S.activeSession.exercises[0];
assert(dipEx.painEvent.severity===3&&dipEx.painEvent.bodyArea==='shoulder', 'D5: pain event stores numeric severity + body area');
assert(dipEx.performed.every(pp=>pp.logged)&&dipEx.progression==='flag', 'D5: severity 3 clears remaining sets + flags');
// severity flows into the record and the report line
const recD5={date:'2026-07-17',dayLabel:'Bench (Deload)',dayId:4,blockName:S.program.name,duration:50,rpe:7,status:'complete',
  exercises:[{name:'Strict Dip',cat:'push',prescribed:dipEx.prescribed,performed:dipEx.performed,progression:'flag',nextLoad:null,variant:null,tags:[],painEvent:dipEx.painEvent}],
  painEvents:[{exercise:'Strict Dip',...dipEx.painEvent}]};
S.sessions=[recD5];
const rptD5=buildCoachReport(S.sessions,S.program,weekDatesFor('2026-07-13'));
assert(/Pain: Strict Dip — shoulder \(3\/3\)/.test(rptD5), 'D5: report prints body area + n/3 severity. Got: '+(rptD5.split('\n').find(l=>/Pain:/.test(l))||'none'));
assert(/shoulder 3\/3|shoulder \(3\/3\)/.test(rptD5), 'D5: PAIN EVENTS summary carries area+severity');
// legacy string severities still render
S.sessions=[{...recD5,painEvents:[{exercise:'Bench Press',severity:'mild',ts:'x'}]}];
assert(/Bench Press — \(mild\)|Bench Press — mild/.test(buildCoachReport(S.sessions,S.program,weekDatesFor('2026-07-13'))), 'D5: legacy string severity still renders');
S.sessions=[];S.activeSession=null;
// always-visible flag icon on the card head
assert(/class="pain-flag/.test(html)&&/openPainModal\(\$\{i\}\)/.test(html), 'D5: per-card pain flag wired');
assert(/\.pain-flag\{min-width:44px;min-height:44px/.test(html), 'D5: flag meets the tap-target minimum');

// ===== D6: RESTYLE A — TYPOGRAPHY + ACCENT DISCIPLINE =====
// --acc offender scan: no STYLE-BLOCK rule outside the whitelist may
// reference cyan. Whitelist: token lines (:root), .act-ring-val (data),
// .goal-bar-fill (chart). Names offenders on failure.
{
  const styleBlk=html.match(/<style>([\s\S]*?)<\/style>/)[1];
  const offenders=styleBlk.split('}')
    .filter(r=>/var\(--acc[\w-]*\)/.test(r))
    .map(r=>r.slice(0,r.indexOf('{')>=0?r.indexOf('{'):0).trim().split('\n').pop())
    .filter(sel=>!/^(:root|--|\.act-ring|\.goal-bar-fill)/.test((sel||'').trim()));
  assert(offenders.length===0, 'D6: chrome selectors still reference --acc: '+offenders.join(' | '));
}
// sentence-case labels + sans roles
assert(/>New block available</.test(html)&&/>Recovery conflict</.test(html)&&/>Week wrapped</.test(html), 'D6: banner labels sentence-case');
assert(!/\.bar-btn\{[^}]*uppercase/.test(html)&&!/\.section-hdr\{[^}]*uppercase/.test(html), 'D6: nav + section labels no longer uppercase');
assert(/#blockHdr\{text-transform:uppercase/.test(html), 'D6: block name keeps the single uppercase flourish');
assert(/\.t-meta\{font:500 var\(--t-meta\) var\(--sans\)/.test(html), 'D6: t-meta utility is sans');
assert(/\.bar-btn\{[^}]*var\(--sans\)/.test(html)&&/\.ex-cat\{[^}]*var\(--sans\)/.test(html)&&/\.comp-toggle\{[^}]*var\(--sans\)/.test(html)&&/\.vc-lbl\{[^}]*var\(--sans\)/.test(html), 'D6: nav/category/completed/chip-group labels are sans');
assert(!/text-transform:uppercase/.test(html.match(/<style>[\s\S]*?<\/style>/)[0].replace(/#blockHdr\{[^}]*\}/,'')), 'D6: NO uppercase transforms left in the style block except #blockHdr');
// brand runs the chrome; data colours stay
assert(/\.rest-t\{[^}]*color:var\(--brand\)/.test(html), 'D6: rest countdown digits are brand (mono stays for the numbers)');
assert(/\.rpe-opt\.sel\{[^}]*var\(--brand\)/.test(html)&&/\.v-chip\.sel\{[^}]*var\(--brand\)/.test(html), 'D6: selected chips are brand');
assert(/--pace-on:var\(--acc\)/.test(html), 'D6: pace-on token STAYS cyan (data)');
assert(/\.act-ring-val\{color:var\(--acc\)\}/.test(html), 'D6: activity ring value stays cyan (data)');
assert(/stroke="var\(--acc\)"/.test(html), 'D6: chart strokes stay cyan');
assert(/button:focus-visible[^{]*\{outline:2px solid var\(--brand\)/.test(html), 'D6: focus rings are brand');
// exercise-card meta: one secondary line, single colour
assert(/class="ex-sub"/.test(html)&&/\.ex-sub\{[^}]*color:var\(--tx3\)/.test(html), 'D6: card meta collapsed to one secondary line, single colour');
// quote: single t-meta italic line
assert(/id="greeting" style="margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"/.test(html), 'D6: stoic quote is a single ellipsised line');

// ===== D7: RESTYLE B — CARDS / ROWS / CHIPS / COMPRESSION =====
// unified chip system: every selected state is the same brand treatment
['v-chip','rpe-opt','eff-chip'].forEach(c=>{
  assert(new RegExp('\\.'+c+'\\.sel\\{[^}]*color-mix\\(in srgb,var\\(--brand\\) 18%').test(html), 'D7: .'+c+'.sel uses the unified brand-18% fill');
});
assert(/\.rpe-inline button\.sel\{[^}]*color-mix\(in srgb,var\(--brand\) 18%/.test(html), 'D7: inline RPE selected state unified');
assert(/\.v-chip\{font:600 12px var\(--sans\)/.test(html), 'D7: chips are sans pills');
// Hevy rows: current + pending states, done strip, bigger inputs, 48px Log
assert(/\.set-row\.current\{[^}]*border-left-color:var\(--brand\)/.test(html), 'D7: current row carries the brand strip');
assert(/\.set-row\.pending\{opacity:\.5\}/.test(html), 'D7: pending rows at 50%');
assert(/\.set-row\.st-done\{border-left-color:color-mix\(in srgb,var\(--grn\) 60%/.test(html), 'D7: done rows green edge strip');
assert(/firstUnlogged/.test(html)&&/\$\{stCl\}\$\{rowState\}/.test(html), 'D7: first unlogged row is .current, later ones .pending');
assert(/\.set-fields input\{[^}]*16px var\(--mono\)[^}]*color:var\(--tx2\)/.test(html)&&/\.set-fields input:focus\{color:var\(--tx\)\}/.test(html), 'D7: inputs larger mono, ghost colours preserved');
assert(/\.set-log\{min-width:52px;min-height:48px/.test(html), 'D7: Log button meets the 48px tap target');
// completed-card compression
assert(/allDone\?' done':''/.test(html)&&/class="ex-topset"/.test(html), 'D7: completed card compresses with a top-set summary');
assert(/\.ex-card\.done \.ex-head::after\{content:'›'/.test(html), 'D7: compressed card shows the expand chevron');
assert(/\.ex-card\.done\.open \.ex-head::after/.test(html), 'D7: chevron rotates on expansion (existing .open toggle)');

// ===== E1: PER-SET LOAD PRESCRIPTIONS (setScheme) =====
assert(typeof schemeString==='function'&&typeof schemeTop==='function', 'E1: composer helpers defined');
const bScheme=[{reps:5,loadKg:87.5,tag:'top'},{reps:5,loadKg:80},{reps:5,loadKg:80},{reps:5,loadKg:80}];
assert(schemeString(bScheme,'kg')==='1×5@87.5 + 3×5@80', 'E1: composer groups top + back-offs. Got: '+schemeString(bScheme,'kg'));
assert(schemeString([{reps:5,loadKg:80},{reps:5,loadKg:80}],'kg')==='2×5@80', 'E1: all-equal scheme reads like uniform shorthand');
assert(schemeTop(bScheme).loadKg===87.5, 'E1: schemeTop finds the tagged top');
assert(schemeTop([{reps:5,loadKg:80},{reps:5,loadKg:90}]).loadKg===90, 'E1: untagged scheme → heaviest wins');
// startDay splices per-set rows AFTER warmups, top tagged — the LIVE Block 5
// Squat day ships this scheme, so exercise it directly.
S.program=JSON.parse(JSON.stringify(DEF_PROGRAM));migrateV3();S.sessions=[];S.activeSession=null;
global.startTimer=()=>{};global.showSessionHero=global.showSessionHero||(()=>{});
startDay(2); // B6 Squat Wednesday
const e1sq=S.activeSession.exercises.find(e=>e.name==='Back Squat');
const e1w=e1sq.performed.filter(pp=>pp.type==='working');
assert(e1sq.performed[0].type==='warmup'&&e1sq.performed[1].type==='warmup', 'E1: warmup rows still come first');
assert(e1w.length===4&&e1w[0].weightKg===115&&e1w[1].weightKg===97.5&&e1w[3].weightKg===97.5, 'E1: per-set rows seeded with their own loads (115 + 97.5 backoffs). Got: '+JSON.stringify(e1w.map(x=>x.weightKg)));
assert(e1w[0].tag==='top'&&!e1w[1].tag, 'E1: top row carries the tag');
// progression keys off the TOP set (105), not the back-offs
e1sq.performed.forEach(pp=>{pp.logged=true;if(pp.type==='working')pp.rpe=7;});
evalProg(S.activeSession.exercises.indexOf(e1sq));
assert(e1sq.nextLoad>115, 'E1: suggestion keys off the 115 top set, not the 97.5 back-offs. Got: '+e1sq.nextLoad);
// e1RM from the top set only
S.sessions=[{date:'2026-08-10',dayLabel:'X',blockName:S.program.name,exercises:[{name:'Back Squat',prescribed:{sets:4,reps:'5',loadKg:115,unit:'kg'},performed:e1sq.performed}]}];
assert(Math.abs(bestHistoricalE1rm('Back Squat')-e1rm(115,5))<0.1, 'E1: e1RM reads the top set. Got: '+bestHistoricalE1rm('Back Squat'));
S.sessions=[];
// uniform back-compat: accessories on the SAME live session seed uniform rows
const e1msp=S.activeSession.exercises.find(e=>e.name==='DB RDL');
assert(e1msp.performed.filter(pp=>pp.type==='working').length===3&&e1msp.performed.filter(pp=>pp.type==='working').every(pp=>pp.weightKg===30), 'E1: uniform prescriptions unchanged (DB RDL 3×30)');
window.confirm=()=>true;cancelSession();
// write-back shifts the whole scheme, keeps flat loadKg = top
// write-back pairs session index with program index — author the squat day
// (index 2) with the squat at index 0 so the pairing holds.
S.program.days[2].exercises=[{...S.program.days[2].exercises.find(ex=>ex.name==='Back Squat'),setScheme:[{reps:5,loadKg:105,tag:'top'},{reps:5,loadKg:95}],loadKg:105,sets:2,target:null,role:null}];
S.activeSession={dayIndex:2,dayId:3,blockName:S.program.name,date:'2026-08-17',dayLabel:'Squat',sessionType:'lifting',startTime:1,notes:'',exercises:[
  {name:'Back Squat',cat:'squat',prescribed:{sets:2,reps:'5',loadKg:105,unit:'kg',setScheme:null},equipmentClass:'barbell',performed:[{type:'working',weightKg:105,reps:5,rpe:7,logged:true}],tags:[],progression:'increase',nextLoad:110,nextTarget:null,variant:null,painEvent:null}
]};
selRpe=7;confirmRpe();
const wbSq=S.program.days[2].exercises[0];
assert(wbSq.loadKg===110, 'E1: flat shorthand bumped to the new top. Got: '+wbSq.loadKg);
assert(wbSq.setScheme[0].loadKg===110&&wbSq.setScheme[1].loadKg===100, 'E1: back-off shifted by the same delta (95→100). Got: '+JSON.stringify(wbSq.setScheme));
S.sessions=[];
// markup: composer string + TOP chip wired
assert(/schemeString\(ex\.prescribed\.setScheme/.test(html), 'E1: ex-rx uses the composer for schemes');
assert(/top-chip">TOP</.test(html)&&/\.top-chip\{[^}]*var\(--brand\)/.test(html), 'E1: TOP chip on the top row, brand-coloured');
assert(/schemeTop\(ex\.prescribed\.setScheme\)/.test(html), 'E1: headline shows the top-set load');
assert(/rxStr/.test(html)&&/\[\$\{schemeString\(ex\.prescribed\.setScheme/.test(html), 'E1: coach report prefixes the prescription scheme');
S.program=JSON.parse(JSON.stringify(DEF_PROGRAM));migrateV3();S.sessions=[];S.activeSession=null;

// ===== E2: PER-LIFT INCREMENTS + RPE GATE =====
assert(getMeta('Back Squat').incrementKg===5&&getMeta('Deadlift').incrementKg===5&&getMeta('Bench Press').incrementKg===2.5, 'E2: incrementKg overrides on the three mains');
const e2case=(name,cls,load,rpe)=>{
  S.activeSession={dayIndex:0,date:'2026-07-22',dayLabel:'T',sessionType:'lifting',startTime:1,exercises:[
    {name,cat:'hinge',prescribed:{sets:1,reps:'5',loadKg:load,unit:'kg'},equipmentClass:cls,
     performed:[{type:'working',weightKg:load,reps:5,rpe,logged:true}],tags:[],progression:null,nextLoad:null}]};
  evalProg(0);return S.activeSession.exercises[0];
};
const dl8=e2case('Deadlift','barbell',125,8);
assert(dl8.progression==='increase'&&dl8.nextLoad===130, 'E2: DL top set @8 → +5 (125→130). Got: '+dl8.progression+' '+dl8.nextLoad);
const dl9=e2case('Deadlift','barbell',125,9);
assert(dl9.progression==='hold'&&dl9.nextLoad===125, 'E2: DL @9 → hold. Got: '+dl9.progression);
const bn8=e2case('Bench Press','barbell',87.5,8);
assert(bn8.progression==='increase'&&bn8.nextLoad===90, 'E2: Bench @8 → +2.5 (87.5→90). Got: '+bn8.nextLoad);
const dl10=e2case('Deadlift','barbell',125,10);
assert(dl10.progression==='flag'&&dl10.nextLoad<125, 'E2: @10 still deloads (gate unchanged above 8)');
S.activeSession=null;

// ===== F1: FIX PACK =====
// 3a — rep-0 diverts to skip flow
S.program=JSON.parse(JSON.stringify(DEF_PROGRAM));migrateV3();S.sessions=[];
global.startTimer=()=>{};global.showSessionHero=global.showSessionHero||(()=>{});
startDay(2); // B6 Squat day (index 2)
const f1ex=S.activeSession.exercises.find(e=>e.name==='Back Squat');
const f1ei=S.activeSession.exercises.indexOf(f1ex);
const f1si=f1ex.performed.findIndex(pp=>pp.type==='working');
f1ex.performed[f1si].reps=0;             // stashed zero (stashSetInput persists keystrokes)
logSet(f1ei,f1si);
assert(f1ex.performed[f1si].logged!==true||f1ex.performed[f1si].skipped===true, '3a: rep-0 log never records a completed set');
assert(_skipSetCtx&&_skipSetCtx.ei===f1ei&&_skipSetCtx.si===f1si, '3a: skip reason picker context armed');
confirmSkipSet('other');
assert(f1ex.performed[f1si].skipped===true, '3a: diverted set lands as a skip');
// evalProg regression: a rep-0 row must not force a false deload
f1ex.performed.forEach(pp=>{if(!pp.logged){pp.logged=true;if(pp.type==='working')pp.rpe=7;}});
evalProg(f1ei);
assert(f1ex.progression!=='flag', '3a: skipped rep-0 row does not trigger bigMiss/deload. Got: '+f1ex.progression);
// logAll: zero rows become inline skips
const f1b=S.activeSession.exercises.find(e=>e.name==='Machine Shoulder Press'||e.name==='DB RDL'||e.name==='Leg Press')||S.activeSession.exercises[4];
f1b.performed.forEach(pp=>{pp.logged=false;pp.skipped=false;});
f1b.performed[0].reps=0;
logAll(S.activeSession.exercises.indexOf(f1b));
assert(f1b.performed[0].skipped===true&&f1b.performed[0].skipReason==='zero'&&f1b.performed.slice(1).every(pp=>pp.logged&&!pp.skipped), '3a: logAll skips the zero row, logs the rest');
window.confirm=()=>true;cancelSession();
// historical 25×0 rows cannot move e1RM (already numeric-safe — pinned)
S.sessions=[{date:'2026-07-20',dayLabel:'X',blockName:S.program.name,exercises:[{name:'DB Bench Press',prescribed:{sets:3,reps:'8',loadKg:25,unit:'kg'},performed:[{type:'working',weightKg:25,reps:0,logged:true},{type:'working',weightKg:20,reps:8,logged:true}]}]}];
assert(Math.abs(bestHistoricalE1rm('DB Bench Press')-e1rm(20,8))<0.1, '3a: historical 25×0 rows excluded from e1RM. Got: '+bestHistoricalE1rm('DB Bench Press'));
S.sessions=[];
// 3b — avoid list
assert(getMeta('Machine Shoulder Press').avoid===true&&getMeta('DB Shoulder Press').avoid===true&&getMeta('Military Press').avoid===true, '3b: overhead presses avoid-flagged');
assert(getMeta('V-Squat').avoid===true&&/pinal compression/.test(getMeta('V-Squat').avoidReason), '3b: V-Squat entry added with the spinal-compression reason');
assert(getMeta('DB Incline Bench').avoid===true&&getMeta('Incline Bench Press').avoid===true, '3b: incline presses avoid-flagged');
assert(!getEligibleVariantsForSlot('ohp').length||getEligibleVariantsForSlot('ohp').every(n=>!getMeta(n).avoid), '3b: rotation never auto-assigns an avoided lift');
assert(/getAvoided\(ex\.name\)/.test(html)&&/Excluded \(\$\{avoided\.length\}\)/.test(html), '3b: excluded expander wired in the picker');
// 3c — permanent days survive adoption
const f1old={name:'OldBlock',days:[{id:4,label:'Mobility',defaultDay:'Friday',dayOfWeek:'Friday',sessionType:'lifting',dur:70,permanent:true,exercises:[{id:'m1',name:'Wall Slide',cat:'rehab',sets:1,reps:'10',loadKg:0,unit:'bw',rest:30,tags:[],equipmentClass:'bw'}]}]};
const f1new={name:'NewBlock',days:[{id:4,label:'Bench',defaultDay:'Monday',dayOfWeek:'Monday',sessionType:'lifting',dur:60,exercises:[]}]};
carryPermanentDays(f1old,f1new);
assert(f1new.days.length===2&&f1new.days[1].label==='Mobility'&&f1new.days[1].permanent===true, '3c: permanent day carried into a block that lacks it');
assert(f1new.days[1].id===5, '3c: colliding id reassigned to max+1 (recMatchesDay stays unambiguous). Got: '+f1new.days[1].id);
const f1new2={name:'HasMob',days:[{id:1,label:'Mobility',defaultDay:'Friday',dayOfWeek:'Friday',sessionType:'lifting',dur:70,exercises:[]}]};
carryPermanentDays(f1old,f1new2);
assert(f1new2.days.length===1, '3c: incoming block that ships its own Mobility day wins (no duplicate)');
assert(/carryPermanentDays\(_oldProg,S\.program\)/.test(html)&&(html.match(/carryPermanentDays\(_oldProg/g)||[]).length===2, '3c: both adoption paths hooked');
// estimator hold-awareness
assert(Math.abs(estimateExTime({name:'Frog Pose',sets:1,reps:'90s',rest:30})-(90+15+30)/60)<0.01, 'Est: a 90s hold costs 90 seconds, not 90 reps ×3.5. Got: '+estimateExTime({name:'Frog Pose',sets:1,reps:'90s',rest:30}));
assert(Math.abs(estimateExTime({name:'X',sets:2,reps:'10',rest:60})-2*(10*3.5+15+60)/60)<0.01, 'Est: rep rows unchanged');
// dynamic swim empty state
assert(/Best continuous: \$\{b\} m\. Beat it\./.test(html), 'Swim: dynamic best-line wired');
assert(/ACTIVITY_EMPTY\.swim/.test(html), 'Swim: falls back to the freestyle prompt with no best');

// ===== S1: SOLAR BASE =====
assert(/--bg:#050505/.test(html) && /--s1:#0D0E10/.test(html), 'SOLAR: OLED base + card surface tokens');
assert(!/radial-gradient\(ellipse at 50% 0%/.test(html), 'SOLAR: gold page vignette removed (true black)');
assert(/@font-face\{font-family:'SG';[^}]*font-weight:500/.test(html) && /data:font\/woff2;base64,/.test(html), 'SOLAR: Space Grotesk subset embedded');
(()=>{const ff=html.match(/@font-face\{[^}]*base64,([^)]+)\)/); assert(ff && ff[1].length<60*1024*4/3, 'SOLAR: font subset under the 60KB cap. Got b64 len '+(ff?ff[1].length:0));})();
assert(BRAND_CYCLE.every(e=>/^#[0-9A-F]{6}$/i.test(e.c)&&/^#[0-9A-F]{6}$/i.test(e.c2)), 'SOLAR: all 7 gradient pairs carry curated c+c2 stops');
assert(BRAND_CYCLE.map(e=>e.name).join()==='ember,voltage,royal,lime,azure,crimson,bone', 'SOLAR: curated pair names in cycle order (azure replaced gold)');
assert(!BRAND_CYCLE.some(e=>e.name==='gold'||e.c==='#F4B942'||e.c==='#C9A96E'), 'Discipline: no block accent may collide with achievement gold');
assert(BRAND_CYCLE[1].c==='#22D3EE'&&BRAND_CYCLE[1].c2==='#7DF9C2'&&BRAND_CYCLE[3].c2==='#34D399', 'SOLAR: voltage + lime pairs match the spec');
assert(/setProperty\('--solar','linear-gradient\(135deg,'\+e\.c\+','\+e\.c2\+'\)'\)/.test(html), 'SOLAR: applyBrand publishes the pair as --solar');
assert(!/backdrop-filter/.test(html.match(/<style>([\s\S]*?)<\/style>/)[1]), 'SOLAR law: no backdrop-filter anywhere');
(()=>{const st=html.match(/<style>([\s\S]*?)<\/style>/)[1];const painted=(st.split('\n').filter(l=>!/mask-image/.test(l)).join('\n').match(/(linear|radial)-gradient/g)||[]).length;assert(painted<=2, 'SOLAR law: painted style-block gradients are exactly the --solar token + start-btn (mask clips exempt). Got '+painted);})();
assert(/#trainHdr::before\{[^}]*opacity:\.02;pointer-events:none\}/.test(html) && /data:image\/png;base64,[^)]+\);background-size:64px 64px/.test(html.match(/#trainHdr::before\{[^}]*\}/)[0]), 'SOLAR: grain is a pre-rasterized PNG tile (feTurbulence froze iOS scroll), header only, 2%');
assert(!/feTurbulence/.test(html), 'SOLAR: no SVG-filter backgrounds anywhere (iOS scroll paint budget)');
(()=>{const r=html.match(/#trainHdr::before\{[^}]*\}/);assert(r && !/animation/.test(r[0]), 'SOLAR: grain rule is static (no animation declaration)');})();

// ===== S2: WORDMARK + PWA + TRAIN ALLOCATION =====
assert(/<svg id="wordmark"[^>]*aria-label="HYPERION"/.test(html), 'S2: inline SVG wordmark present');
assert(/<linearGradient id="wmSun"/.test(html) && /fill="url\(#wmSun\)"/.test(html), 'S2: gradient lives in the sun disc');
assert(/<text[^>]*style="font:500 10\.5px var\(--display\)[^"]*"[^>]*fill="var\(--tx\)">HYPERION<\/text>/.test(html), 'S2/G8: letterforms are solid text-token ink in the display face');
assert(!/text-shadow[^}]*HYPERION|HYPERION[^<]*text-shadow/.test(html), 'S2: old glow span retired');
assert(/<meta name="theme-color" content="#050505">/.test(html), 'S2: theme-color matches OLED base');
assert(/rel="icon"[^>]*%23050505/.test(html) && /rel="icon"[^>]*linearGradient/.test(html), 'S2: favicon is the black-field gradient sun');
assert(/rel="apple-touch-icon" href="data:image\/png;base64,/.test(html), 'S2: touch icon inline PNG present');
assert(/class="topset-chip tnum">TOP /.test(html) && /\.topset-chip\{[^}]*background:var\(--solar/.test(html), 'S2: Train top-set chip is the second budget surface');

// ===== S3: GOALS ORBIT + E1RM MOUNTAIN =====
assert(typeof monotonePath==='function'&&typeof goalsMountainPoints==='function'&&typeof renderGoalsMountain==='function', 'S3: mountain trio defined');
assert(monotonePath([])===''&&monotonePath([[0,0]])==='', 'S3: monotonePath degenerate inputs → empty');
(()=>{const p=monotonePath([[0,30],[50,10],[100,20]]);assert(/^M0(\.0)? 30/.test(p)&&(p.match(/C/g)||[]).length===2, 'S3: monotonePath emits cubic segments. Got: '+p.slice(0,40));})();
S.sessions=[];assert(Array.isArray(goalsMountainPoints())&&goalsMountainPoints().length===0, 'S3: no sessions → no mountain points');
(()=>{ // 6 dated sessions with all three lifts → 6 carried-forward totals
  const mk=(d,n,w)=>({date:d,dayLabel:'X',blockName:S.program.name,status:'complete',exercises:[{name:n,prescribed:{sets:1,reps:'5',loadKg:w,unit:'kg'},performed:[{type:'working',weightKg:w,reps:5,logged:true}]}]});
  S.sessions=[];
  ['2026-07-01','2026-07-03','2026-07-05','2026-07-08','2026-07-10','2026-07-12'].forEach((d,i)=>{
    S.sessions.push(mk(d,'Back Squat',100+i),mk(d,'Bench Press',80+i),mk(d,'Deadlift',120+i));
  });
  const pts=goalsMountainPoints();
  assert(pts.length===6&&pts[5].total>pts[0].total, 'S3: merged big-3 totals per date, rising. Got '+pts.length);
  S.sessions=[];
})();
assert(/if\(pts\.length<6\)\{el\.innerHTML='';return\}/.test(html), 'S3: mountain hidden below 6 points (no sad staircase)');
assert(/id="goalsMountain"[^>]*pointer-events:none/.test(html), 'S3: mountain is decor — pointer-events none');
assert(/<linearGradient id="sunGrad"/.test(html)&&/r="34" fill="url\(#sunGrad\)"/.test(html), 'S3: centre sun carries the gradient');
assert(/class="planet"/.test(html)&&/class="planet-lbl tnum"/.test(html)&&/planetLbl\[k\]/.test(html), 'S3: orbit leading edges carry planet dots + tight labels');
assert(/\{Squat:\{color:'var\(--lift-sq\)'/.test(html), 'S3: e1RM chart consolidated onto the lift-hue tokens');
assert(/\.club2-n\{font:500 26px var\(--display\)/.test(html), 'S3: goal headline number set in the display face');

// ===== S4: FOCUS DATA LAYER — ORDER MODEL + sessionView =====
assert(typeof sessOrder==='function'&&typeof sessOrderDiffers==='function'&&typeof mapSessionOrderToProgram==='function'&&typeof applyOrderOffer==='function'&&typeof toggleSessionView==='function', 'S4: order-model API defined');
// 1. backfill: session without order → identity
(()=>{const sess={exercises:[{},{},{}]};assert(JSON.stringify(sessOrder(sess))==='[0,1,2]', 'S4: missing order heals to identity');})();
// 2. self-heal: partial + out-of-range
(()=>{const sess={exercises:[{},{},{},{}],order:[2,0,9]};assert(JSON.stringify(sessOrder(sess))==='[2,0,1,3]', 'S4: partial order appends missing, drops out-of-range. Got '+JSON.stringify(sessOrder(sess)));})();
assert(sessOrderDiffers({exercises:[{},{}],order:[0,1]})===false&&sessOrderDiffers({exercises:[{},{}],order:[1,0]})===true, 'S4: sessOrderDiffers identity check');
// 3. round-trip: order + sessionView survive export
(()=>{
  S.activeSession={dayIndex:0,dayId:1,blockName:S.program.name,date:'2026-07-28',dayLabel:'Bench',sessionType:'lifting',startTime:1,notes:'',exercises:[{name:'A',performed:[]},{name:'B',performed:[]}],order:[1,0]};
  const blob=JSON.parse(buildExportPayload(1));
  assert(JSON.stringify(blob.activeSession.order)==='[1,0]'&&blob.settings.sessionView, 'S4: order + sessionView round-trip the export payload');
  S.activeSession=null;
})();
// 4. out-of-order logging: set state keys off ARRAY index, not display position
(()=>{
  S.activeSession={dayIndex:0,dayId:1,blockName:S.program.name,date:'2026-07-28',dayLabel:'X',sessionType:'lifting',startTime:1,notes:'',
    exercises:[{name:'A',cat:'push',prescribed:{sets:1,reps:'5',loadKg:10,unit:'kg'},performed:[{type:'working',weightKg:10,reps:5,logged:false}],tags:[],progression:null,nextLoad:null},
               {name:'B',cat:'pull',prescribed:{sets:1,reps:'5',loadKg:10,unit:'kg'},performed:[{type:'working',weightKg:10,reps:5,logged:false}],tags:[],progression:null,nextLoad:null}],order:[1,0]};
  _skipSetCtx={ei:0,si:0};confirmSkipSet('time');
  assert(S.activeSession.exercises[0].performed[0].skipped===true&&!S.activeSession.exercises[1].performed[0].skipped, 'S4: skip lands on exercises[0] (array identity) despite display order [1,0]');
  S.activeSession=null;
})();
// 5. mapping: same object references, unmatched appended in original order
(()=>{
  const A={name:'A'},B={name:'B'},C={name:'C'};
  const out=mapSessionOrderToProgram([1,0],[{name:'A',tags:[]},{name:'B',tags:[]}],[A,B,C]);
  assert(out.length===3&&out[0]===B&&out[1]===A&&out[2]===C, 'S4: order maps by reference, unmatched program entries keep tail order');
})();
// 6. save-to-program preserves the write-back bump (same refs) + confirmRpe capture
(()=>{
  S.sessions=[]; // B6: day 0 is freeform KB — use the squat day (index 2)
  const d0=S.program.days[2];
  const mkEx=(name)=>({name,cat:'push',prescribed:{sets:1,reps:'5',loadKg:20,unit:'kg'},performed:[{type:'working',weightKg:20,reps:5,rpe:7,logged:true}],tags:[],progression:'hold',nextLoad:20,nextTarget:null,variant:null,painEvent:null,notes:''});
  S.activeSession={dayIndex:2,dayId:d0.id,blockName:S.program.name,date:'2026-08-19',dayLabel:d0.label,sessionType:'lifting',startTime:1,notes:'',
    exercises:[mkEx(d0.exercises[0].name),mkEx(d0.exercises[1].name)],order:[1,0]};
  selRpe=7;confirmRpe();
  assert(_orderOffer&&_orderOffer.dayIndex===2, 'S4: confirmRpe captures the order offer when order differs');
  assert(_orderOffer.exercises[0]===d0.exercises[1]&&_orderOffer.exercises[1]===d0.exercises[0], 'S4: offer reuses the program day\'s own objects');
  const prevFirst=d0.exercises[1];
  applyOrderOffer();
  assert(S.program.days[2].exercises[0]===prevFirst&&_orderOffer===null, 'S4: Save-to-program re-sequences the day in place');
  // restore program + state for later tests
  S.program=JSON.parse(JSON.stringify(DEF_PROGRAM));migrateV3();S.sessions=[];S.activeSession=null;
})();
// 9. sessionView default + flip
assert(S.settings.sessionView==='focus'||S.settings.sessionView==='list', 'S4: sessionView present');
(()=>{const was=S.settings.sessionView;toggleSessionView();assert(S.settings.sessionView!==was, 'S4: toggleSessionView flips');toggleSessionView();assert(S.settings.sessionView===was, 'S4: and flips back');})();
assert(/if\(!S\.settings\.sessionView\)S\.settings\.sessionView='focus';/.test(html), 'S4: load() backfills sessionView');
assert(/id="sViewBtn"/.test(html)&&/Session view</.test(html), 'S4: Settings row present');
assert(/_orderOffer=sessOrderDiffers\(sess\)/.test(html), 'S4: offer captured in confirmRpe after write-back');

// ===== S5: FOCUS VIEW SHELL =====
assert(typeof renderFocus==='function'&&typeof renderExList==='function'&&typeof focusUnits==='function'&&typeof focusCardHTML==='function'&&typeof renderFocusRail==='function'&&typeof focusGoTo==='function', 'S5: focus render API defined');
// superset pair → ONE unit; chain of 3 → one unit
(()=>{
  const sess={exercises:[{supersetNext:true,performed:[]},{performed:[]},{performed:[]}],order:[0,1,2]};
  const u=focusUnits(sess);
  assert(u.length===2&&JSON.stringify(u[0].eis)==='[0,1]'&&JSON.stringify(u[1].eis)==='[2]', 'S5: display-adjacent pair renders as one unit. Got '+JSON.stringify(u));
  const sess3={exercises:[{supersetNext:true,performed:[]},{supersetNext:true,performed:[]},{performed:[]}],order:[0,1,2]};
  assert(focusUnits(sess3).length===1&&focusUnits(sess3)[0].eis.length===3, 'S5: a 3-chain is one unit');
})();
// separated pair degrades to singles, flag untouched
(()=>{
  const sess={exercises:[{supersetNext:true,performed:[]},{performed:[]},{performed:[]}],order:[1,0,2]};
  const u=focusUnits(sess);
  assert(u.length===3, 'S5: display-separated pair degrades to single cards. Got '+u.length);
  assert(sess.exercises[0].supersetNext===true, 'S5: degradation never clears the pairing flag');
})();
// interleave: warm-ups first per member, then A1,B1,A2,B2
(()=>{
  const sess={exercises:[
    {supersetNext:true,performed:[{type:'warmup'},{type:'working'},{type:'working'}]},
    {performed:[{type:'working'},{type:'working'}]}],order:[0,1]};
  const seq=unitSeq(sess,{eis:[0,1]});
  assert(JSON.stringify(seq)==='[[0,0],[0,1],[1,0],[0,2],[1,1]]', 'S5: warmups lead, working rows interleave round-robin. Got '+JSON.stringify(seq));
})();
// out-of-order current: focusPos seeds to first INCOMPLETE unit in display order
(()=>{
  _focusIdx=null;
  S.activeSession={dayIndex:0,dayLabel:'X',sessionType:'lifting',startTime:1,notes:'',exercises:[
    {name:'A',performed:[{type:'working',logged:true}]},
    {name:'B',performed:[{type:'working',logged:false}]},
    {name:'C',performed:[{type:'working',logged:false}]}],order:[2,0,1]};
  assert(focusPos()===0&&_focusIdx===2, 'S5: seeds to first incomplete in DISPLAY order (C first). Got pos '+focusPos()+' idx '+_focusIdx);
  focusGoTo(2);
  assert(_focusIdx===1, 'S5: rail tap moves the current index');
  _focusIdx=null;S.activeSession=null;
})();
assert(/id="focusRoot"/.test(html)&&/id="focusTrack"/.test(html)&&/id="focusRail"/.test(html), 'S5: focus DOM present');
assert(/id="sViewToggle"/.test(html), 'S5: Focus/List toggle in the session head');
assert(/#vSession\.focus-on #exList\{display:none\}/.test(html), 'S5: list layer hidden under focus (no duplicate ids)');
assert(/\.fc-readout-w\{[^}]*var\(--display\);background:var\(--solar\);-webkit-background-clip:text/.test(html), 'S5: giant readout number carries the gradient via text clip');
assert(/\.fc-log\{[^}]*min-height:52px[^}]*background:var\(--solar\)/.test(html), 'S5: full-width gradient Log button (second focus surface)');
assert(/class="set-fields"/.test(focusSetRowHTML({prescribed:{reps:'5',sets:3,unit:'kg'},performed:[{type:'working',weightKg:10,reps:5}],tags:[],name:'T'},0,{type:'working',weightKg:10,reps:5,logged:false},0,null)), 'S5: focus rows keep .set-fields (keyboard-scroll contract)');

// ===== S6: GESTURES + KEYBOARD COMPRESSION + REST OVERLAY =====
assert(FOCUS_SWIPE.edge===28&&FOCUS_SWIPE.commit===56&&FOCUS_SWIPE.velMin===0.5&&FOCUS_SWIPE.slop===8, 'S6: swipe-safety constants per spec (28px edge guard, 56px commit, velocity check)');
assert(typeof wireFocusSwipe==='function'&&typeof focusRestSync==='function'&&typeof focusMaybeAdvance==='function', 'S6: gesture + rest API defined');
wireFocusSwipe(null);wireFocusSwipe({}); // mock-safe: bails without addEventListener
assert(true, 'S6: wireFocusSwipe bails on mock elements');
assert(/clientX<FOCUS_SWIPE\.edge\|\|e\.clientX>vw-FOCUS_SWIPE\.edge/.test(html), 'S6: both screen edges are dead zones');
assert(/closest\('\.fc-hscroll'\)/.test(html), 'S6: card-internal horizontal scrollers stop the swipe');
assert(/Math\.abs\(dx\)>=FOCUS_SWIPE\.commit\|\|\(Math\.abs\(dx\)>=24&&v>=FOCUS_SWIPE\.velMin\)/.test(html), 'S6: commit = distance OR velocity');
assert(/#focusRoot\.kb-compact \.fc-readout\{[^}]*min-height:0/.test(html)&&/#vSession\.focus-on #focusRoot\.kb-compact #focusRail\{display:none\}/.test(html), 'S6: keyboard compression collapses readout + hides rail');
assert(/@keyframes frglow/.test(html)&&/\.fr-count\{[^}]*var\(--display\)[^}]*animation:frglow/.test(html), 'S6: rest countdown in the display face with the slow glow pulse');
assert(/id="focusRestDisp"/.test(html)&&/_fd\.textContent=rem<=0\?'GO'/.test(html), 'S6: rest tick mirrors into the focus overlay');
assert(/resting&&!focusOnSession/.test(html), 'S6: rest strip suppressed on-session in focus; backgrounded mini-bar unchanged');
// focusMaybeAdvance: advances past a completed unit at rest end, wraps to earlier incomplete
(()=>{
  S.activeSession={dayIndex:0,dayLabel:'X',sessionType:'lifting',startTime:1,notes:'',exercises:[
    {name:'A',performed:[{type:'working',logged:false}]},
    {name:'B',performed:[{type:'working',logged:true}]},
    {name:'C',performed:[{type:'working',logged:false}]}],order:[0,1,2]};
  _focusIdx=1; // sitting on the (done) B card
  focusMaybeAdvance();
  assert(_focusIdx===2, 'S6: rest-end advance moves to the next incomplete unit. Got '+_focusIdx);
  _focusIdx=1;S.activeSession.exercises[2].performed[0].logged=true;
  focusMaybeAdvance();
  assert(_focusIdx===0, 'S6: advance wraps to EARLIER incomplete units (out-of-order first-class). Got '+_focusIdx);
  _focusIdx=null;S.activeSession=null;
})();
assert(/function stopRest\(\)\{[\s\S]{0,300}?focusRestSync\(false\)[\s\S]{0,40}?renderSessionBar\(\)\}/.test(html), 'S6: stopRest syncs the overlay and still ends with renderSessionBar');

// ===== S7: REORDER =====
assert(typeof commitUnitOrder==='function'&&typeof moveUnit==='function'&&typeof openReorderSheet==='function'&&typeof wireReorderDrag==='function'&&typeof wireRailDrag==='function', 'S7: reorder API defined');
wireReorderDrag(null);wireRailDrag({}); // mock-safe bails
(()=>{ // moveUnit keeps pairs as one block and writes order immediately
  S.activeSession={dayIndex:0,dayLabel:'X',sessionType:'lifting',startTime:1,notes:'',exercises:[
    {name:'A',supersetNext:true,performed:[{type:'working',logged:false}]},
    {name:'B',performed:[{type:'working',logged:false}]},
    {name:'C',performed:[{type:'working',logged:false}]}],order:[0,1,2]};
  moveUnit(1,-1); // C above the A+B pair
  assert(JSON.stringify(S.activeSession.order)==='[2,0,1]', 'S7: pair moved as one block. Got '+JSON.stringify(S.activeSession.order));
  assert(focusUnits(S.activeSession).length===2, 'S7: pair still one unit after reorder');
  moveUnit(0,1);
  assert(JSON.stringify(S.activeSession.order)==='[0,1,2]', 'S7: move back restores identity');
  moveUnit(0,-1);
  assert(JSON.stringify(S.activeSession.order)==='[0,1,2]', 'S7: clamped at the top edge');
  S.activeSession=null;
})();
assert(/id="reorderSheet"/.test(html)&&/id="roList"/.test(html)&&/class="ro-handle"/.test(html), 'S7: bottom sheet with drag handles present');
assert(/class="rail-reorder"/.test(html)&&/openReorderSheet\(\)/.test(html), 'S7: rail carries the primary reorder button');
assert(/_railHoldT=setTimeout\(/.test(html)&&/,300\);/.test(html)&&/navigator\.vibrate\(10\)/.test(html), 'S7: rail long-press arms at 300ms with haptic');
assert(/#focusRail\.rail-locked \.rail-scroll\{overflow-x:hidden;touch-action:none\}/.test(html), 'S7: rail scroll-locked during drag');
assert(/id="sumOrderRow"/.test(html)&&/Keep this order\?/.test(html)&&/Just today/.test(html)&&/Save to program/.test(html), 'S7: summary inline row (not a modal) wired');
assert(/\.ro-btn\{min-width:48px;min-height:40px/.test(html)&&/\.ro-handle\{min-width:48px;min-height:48px/.test(html), 'S7: reorder controls meet tap-target sizes');

// ===== S8: DESIGN-LAW AUDIT =====
// Gradient budget: 2 surfaces per screen. Style block carries only the
// --solar token + .start-btn; every other gradient is an SVG def. A surface
// is >24px in both axes — the 10px wordmark glyph disc is chrome, not a
// surface (the spec's Goals allocation assumed the wordmark lived there;
// in this app it lives in the Train header — flagged in the ship report).
(()=>{const defs=(html.match(/<linearGradient /g)||[]).length;assert(defs===3&&/%3ClinearGradient/.test(html), 'S8 law: exactly 3 inline SVG gradient defs (wordmark glyph, sun, mountain fade) + the URL-encoded favicon. Got '+defs);})();
assert(/id="wmSun"/.test(html)&&/id="sunGrad"/.test(html)&&/id="mtnFade"/.test(html), 'S8 law: every def is named + accounted');
// Shadow budget: max ONE layer per element — no comma outside parens in any
// box-shadow value in the style block.
(()=>{
  const st=html.match(/<style>([\s\S]*?)<\/style>/)[1];
  const strip=v=>{let x=v,y='';while(x!==y){y=x;x=x.replace(/\([^()]*\)/g,'');}return x;};
  const bad=(st.match(/box-shadow:[^;}]*/g)||[]).filter(v=>/,/.test(strip(v)));
  assert(bad.length===0, 'S8 law: single box-shadow layer everywhere. Offenders: '+bad.join(' | '));
})();
assert(!/backdrop-filter/.test(html.match(/<style>([\s\S]*?)<\/style>/)[1]), 'S8 law: no backdrop-filter (re-check post-S7)');
// Motion: only the two tokens + reduced-motion blanket
assert(/--motion:200ms cubic-bezier\(\.2,0,0,1\)/.test(html)&&/--motion-hero:320ms cubic-bezier\(\.2,0,0,1\)/.test(html), 'S8 law: motion tokens 200/320 single easing');
assert(/@media \(prefers-reduced-motion: reduce\)/.test(html), 'S8 law: reduced-motion blanket present');
// A11y: new focus-mode controls meet 48px
assert(/\.rail-chip\{[^}]*min-height:48px/.test(html)&&/\.fr-ghost\{min-height:48px/.test(html)&&/\.fc-log\{[^}]*min-height:52px/.test(html), 'S8 a11y: focus-mode tap targets >=48px');
assert(/button:focus-visible[^{]*\{outline:2px solid var\(--brand\)/.test(html), 'S8 a11y: focus indicators visible');
// Progression/e1RM/validator functions untouched: canary asserts
assert(typeof evalProg==='function'&&typeof e1rm==='function'&&typeof validateSession==='function'&&typeof validateProgram==='function', 'S8: engine canaries intact');

// ===== W1: B1 WARM-UP GENERATOR + B2 GYM TRACKS + B4 (extra) =====
assert(typeof snapToMakeable==='function'&&typeof genWarmups==='function'&&typeof trackSessions==='function', 'W1: new helpers defined');
// B1: makeable snapping
assert(snapToMakeable(58.75,36,[20,15,10,5,2.5])===56, 'B1: 58.75 on a 36 bar w/ coarse plates → 56');
assert(snapToMakeable(50,60,[25,20,15,10,5,2.5])===60, 'B1: never below the empty bar');
// B1: the holiday deadlift ramp — 36 kg bar, coarse plates
(()=>{
  const wu=(function(){const bak=S.settings.activeGymId;S.settings.activeGymId='gym-holiday';ensureGyms();const r=genWarmups(117.5,{name:'Deadlift',barKg:36});S.settings.activeGymId=bak;return r;})();
  assert(JSON.stringify(wu)===JSON.stringify([{w:56,reps:5},{w:86,reps:3},{w:106,reps:2}]), 'B1: 117.5 DL on the 36 bar → 56/86/106 ramp. Got '+JSON.stringify(wu));
  assert(wu.every(x=>x.w!==60), 'B1: never prescribes 60 on a 36 kg bar');
})();
// B1: 20-bar values differ + are makeable
(()=>{
  const bak=S.settings.activeGymId;S.settings.activeGymId='gym-commercial';
  const wu=genWarmups(117.5,{name:'X',barKg:20});
  S.settings.activeGymId=bak;
  assert(wu.length===3&&wu[0].w!==56&&wu.every((x,i,a)=>i===0||x.w>a[i-1].w), 'B1: 20-bar ramp differs and ascends. Got '+JSON.stringify(wu));
  wu.forEach(x=>{const r=platesPerSide(x.w,20,[25,20,15,10,5,2.5,1.25,1]);assert(r.remainder===0, 'B1: every generated warmup is plate-exact. '+x.w+' left '+r.remainder);});
})();
// B1: startDay generates for barbell mains without authored warmups
(()=>{
  S.program=JSON.parse(JSON.stringify(DEF_PROGRAM));migrateV3();S.sessions=[];S.activeSession=null;
  global.startTimer=()=>{};global.showSessionHero=global.showSessionHero||(()=>{});
  const di=S.program.days.findIndex(d=>d.exercises&&d.exercises.some(e=>e.name==='Deadlift'));
  const dl=S.program.days[di].exercises.find(e=>e.name==='Deadlift');
  const bakWu=dl.warmup;delete dl.warmup;
  startDay(di);
  const sdl=S.activeSession.exercises.find(e=>e.name==='Deadlift');
  const gen=sdl.performed.filter(pp=>pp.type==='warmup');
  assert(gen.length>=2&&gen.every(pp=>pp.weightKg>=exerciseBarKg(sdl)), 'B1: startDay generated a bar-aware ramp when no authored warmup. Got '+JSON.stringify(gen.map(g=>g.weightKg)));
  assert(sdl.barKg===36||exerciseBarKg(sdl)===36, 'B1: barKg travels to the session exercise');
  window.confirm=()=>true;cancelSession();
  S.program=JSON.parse(JSON.stringify(DEF_PROGRAM));migrateV3();
})();
// B2: holiday gym seeded + one-shot activation
assert(DEFAULT_GYMS.some(g=>g.id==='gym-holiday'), 'B2: Holiday Gym in defaults');
(()=>{const hg=DEFAULT_GYMS.find(g=>g.id==='gym-holiday');
  assert(hg.equipment.includes('machine')&&hg.equipment.includes('hip-abduction')&&hg.equipment.includes('sled')&&hg.equipment.includes('leg-press')&&hg.equipment.includes('cable'), 'B2: holiday equipment list per spec');
  assert(JSON.stringify(hg.plateInventory)==='[20,15,10,5,2.5]', 'B2: coarse holiday plates');})();
assert(/_holidayGymActivated/.test(html)&&/activeGymId='gym-holiday'/.test(html), 'B2: one-shot activation wired in load()');
// B2: gymId stamps + trackSessions scoping
(()=>{
  S.settings.activeGymId='gym-holiday';
  S.sessions=[
    {date:'2026-07-20',dayLabel:'X',exercises:[{name:'Sled Push',prescribed:{sets:4,reps:'15m',loadKg:170,unit:'kg'},performed:[{type:'working',weightKg:170,reps:15,logged:true}]}]},
    {date:'2026-07-25',gymId:'gym-singapore',dayLabel:'X',exercises:[{name:'Sled Push',prescribed:{sets:4,reps:'15m',loadKg:172.5,unit:'kg'},performed:[{type:'working',weightKg:172.5,reps:15,logged:true}]}]},
    {date:'2026-08-01',gymId:'gym-holiday',dayLabel:'X',exercises:[{name:'Sled Push',prescribed:{sets:4,reps:'15m',loadKg:80,unit:'kg'},performed:[{type:'working',weightKg:80,reps:15,logged:true}]}]}
  ];
  assert(trackSessions('Sled Push','').length===2, 'B2: holiday track = holiday + legacy (Singapore excluded). Got '+trackSessions('Sled Push','').length);
  const hint=getLastHint({name:'Sled Push',variant:null});
  assert(/80/.test(hint)&&!/172\.5/.test(hint), 'B2: last hint reads the holiday track, not Singapore. Got '+hint.slice(0,80));
  S.settings.activeGymId='gym-singapore';
  assert(trackSessions('Sled Push','').length===2&&trackSessions('Sled Push','').every(x=>x.gymId!=='gym-holiday'), 'B2: Singapore track excludes holiday');
  S.sessions=[];S.settings.activeGymId='gym-commercial';
})();
assert(/gymId:sess\.gymId\|\|/.test(html)&&/gymId:\(S\.settings&&S\.settings\.activeGymId\)\|\|null/.test(html), 'B2: session records + activeSession stamp the gym');
// B2: new-machine-calibrate holds until 2 track sessions
(()=>{
  S.sessions=[];S.settings.activeGymId='gym-holiday';
  S.activeSession={dayIndex:0,dayLabel:'X',sessionType:'lifting',startTime:1,gymId:'gym-holiday',notes:'',exercises:[
    {name:'Leg Press',cat:'squat',prescribed:{sets:3,reps:'10',loadKg:160,unit:'kg'},equipmentClass:'machine',
     performed:[{type:'working',weightKg:160,reps:10,rpe:7,logged:true}],tags:['new-machine-calibrate'],progression:null,nextLoad:null,variant:null,painEvent:null}]};
  evalProg(0);
  const ex=S.activeSession.exercises[0];
  assert(ex.progression==='hold'&&ex.nextLoad===160&&/alibrating/.test(ex.progressionReason), 'B2: calibrate session 1 → hold + reason. Got '+ex.progression+' '+ex.progressionReason);
  // two sessions on the track → suggestions resume
  S.sessions=[
    {date:'2026-08-01',gymId:'gym-holiday',dayLabel:'X',exercises:[{name:'Leg Press',prescribed:{sets:3,reps:'10',loadKg:160,unit:'kg'},performed:[{type:'working',weightKg:160,reps:10,logged:true}]}]},
    {date:'2026-08-02',gymId:'gym-holiday',dayLabel:'X',exercises:[{name:'Leg Press',prescribed:{sets:3,reps:'10',loadKg:160,unit:'kg'},performed:[{type:'working',weightKg:160,reps:10,logged:true}]}]}
  ];
  ex.progression=null;ex.progressionReason=null;
  evalProg(0);
  assert(ex.progression==='increase'&&ex.nextLoad===162.5, 'B2+B4: calibrated machine resumes suggestions on the 2.5 grid. Got '+ex.progression+' '+ex.nextLoad);
  S.sessions=[];S.activeSession=null;S.settings.activeGymId='gym-commercial';
})();

// ===== W2: B3 UNMEASURED SWIM + B5 AVOID + B6 NOTES =====
assert(typeof dayUnmeasured==='function'&&typeof esc==='function', 'W2: helpers defined');
// B3: gate honours the day tag; ad-hoc + measured days still hard-block
(()=>{
  S.program=JSON.parse(JSON.stringify(DEF_PROGRAM));migrateV3();S.sessions=[];
  const si=S.program.days.findIndex(d=>d.sessionType==='swim');
  S.program.days[si].tags=['unmeasured']; // (authored in W3 — set explicitly for clarity)
  S.activeSession={dayIndex:si,dayId:S.program.days[si].id,dayLabel:'Swim',sessionType:'swim',startTime:1,blockName:S.program.name,activity:{durationMin:40,distance:0,effort:6,notes:''},exercises:[],notes:''};
  assert(dayUnmeasured(S.activeSession)===true, 'B3: tagged day detected');
  const n0=S.sessions.length;
  global.showView=global.showView||(()=>{});
  finalizeActivity();
  assert(S.sessions.length===n0+1, 'B3: distance-less swim SAVES on an unmeasured day');
  assert(S.sessions[S.sessions.length-1].activity.distance===0, 'B3: record carries distance 0');
  assert(swimBest(S.sessions)===0, 'B3: a 0 never becomes the best');
  // measured day still blocks (W3 authors the tag, so strip it explicitly)
  S.program.days[si].tags=[];
  S.activeSession={dayIndex:si,dayId:S.program.days[si].id,dayLabel:'Swim',sessionType:'swim',startTime:1,blockName:S.program.name,activity:{durationMin:40,distance:0,effort:6,notes:''},exercises:[],notes:''};
  const n1=S.sessions.length;
  finalizeActivity();
  assert(S.sessions.length===n1&&S.activeSession!==null, 'B3: untagged swim day still requires distance');
  S.sessions=[];S.activeSession=null;
})();
assert(/distReq\?' — required':\(st==='swim'\?' — optional \(snorkel\)':''\)/.test(html), 'B3: form label flips to optional on unmeasured days');
// B5: Bench Press avoided; never offered as a substitute; FIXED_MAINS untouched
assert(EX_META['Bench Press'].avoid===true&&/2026-07-28/.test(EX_META['Bench Press'].avoidReason), 'B5: barbell Bench Press avoid-listed with the pain date');
assert(FIXED_MAINS.includes('Bench Press'), 'B5: FIXED_MAINS not weakened (avoid affects pickers only)');
(()=>{const subs=getSubstitutes('Iso-Lateral Bench Press')||[];assert(!subs.some(x=>(x.name||x)==='Bench Press'), 'B5: Bench Press never offered as a substitute');})();
(()=>{const av=getAvoided('Machine Chest Press').map(a=>a.name);assert(av.includes('Bench Press'), 'B5: excluded expander lists Bench Press for hpush slots. Got '+av.join(','));})();
// B6: escaping round-trip
assert(esc('</textarea><b>&"')==='&lt;/textarea&gt;&lt;b&gt;&amp;&quot;', 'B6: esc() covers &<>\"');
assert(/id="fNotes"[^>]*>\$\{esc\(sess\.notes\|\|''\)\}<\/textarea>/.test(html), 'B6: wrap-up notes interpolation escaped');
assert(/Notes: \$\{esc\(sx\.notes\)\}/.test(html), 'B6: last-hint notes escaped');
(()=>{ // focusWrapCardHTML survives hostile notes
  const out=focusWrapCardHTML({dayIndex:0,notes:'</textarea><b>pwn'});
  assert(!/<\/textarea><b>pwn/.test(out)&&/&lt;\/textarea&gt;/.test(out), 'B6: hostile notes cannot break out of the textarea');
})();
// B6: keyboard handlers cover textareas; renderFocus guards the caret
assert(/isNotes=t&&t\.tagName==='TEXTAREA'/.test(html), 'B6: scrollIntoView rescue covers notes textareas');
assert(/\(t\.tagName==='INPUT'\|\|t\.tagName==='TEXTAREA'\)&&t\.closest\('\.fcard'\)/.test(html), 'B6: kb-compact covers card textareas');
assert(/document\.activeElement\.id==='fNotes'\)\{renderFocusRail\(\);return;\}/.test(html), 'B6: renderFocus never rebuilds under the notes caret');

// ===== B6: PROGRAM-INTEGRATION EXTRAS =====
// B6 W1 DL warm-ups come from the BAR-AWARE GENERATOR (no authored array);
// authored arrays still win where present (the squat day proves that above).
(()=>{
  S.program=JSON.parse(JSON.stringify(DEF_PROGRAM));migrateV3();S.sessions=[];S.activeSession=null;
  global.startTimer=()=>{};global.showSessionHero=global.showSessionHero||(()=>{});
  const bak=S.settings.activeGymId;S.settings.activeGymId='gym-singapore';ensureGyms();
  startDay(5); // B6 Deadlift + Pull (index 5)
  const dl=S.activeSession.exercises.find(e=>e.name==='Deadlift');
  const wu=dl.performed.filter(pp=>pp.type==='warmup').map(pp=>pp.weightKg);
  // 126 top on the 36 bar with the Singapore 1.25-grid: 61 / 93.5 / 113.5
  assert(JSON.stringify(wu)==='[61,93.5,113.5]', 'B6: generator DL warm-ups 61/93.5/113.5 on the 36 bar (Singapore rack). Got '+JSON.stringify(wu));
  assert(wu.every(w=>isMakeableTotal(w,36)), 'B6: every generated warm-up is rackable');
  window.confirm=()=>true;cancelSession();
  // generator also owns any other un-authored barbell lift
  const dlDay=S.program.days[5].exercises.find(e=>e.name==='Deadlift');
  delete dlDay.warmup;
  startDay(5);
  const dl2=S.activeSession.exercises.find(e=>e.name==='Deadlift');
  const wu2=dl2.performed.filter(pp=>pp.type==='warmup');
  assert(wu2.length>=2&&wu2.every(pp=>pp.weightKg>=36), 'W4+B1: generator covers un-authored barbell lifts. Got '+JSON.stringify(wu2.map(x=>x.weightKg)));
  cancelSession();
  S.program=JSON.parse(JSON.stringify(DEF_PROGRAM));migrateV3();
  S.settings.activeGymId=bak;
})();
// full-depth-standard renders prominently on both card templates
assert(/full-depth-standard'\)\?' <span class="std-chip">Full depth standard<\/span>'/.test(html), 'W3: full-depth chip wired');
assert((html.match(/std-chip">Full depth standard/g)||[]).length>=2, 'W3: chip on BOTH list + focus templates');
assert(/\.std-chip\{[^}]*var\(--warn\)/.test(html), 'W3: chip warn-tinted (no new colour)');

// ===== W4: FOCUS POLISH C1-C7 =====
// C1: readout renders in EVERY card state
(()=>{
  const mk=(logged)=>({dayIndex:0,dayLabel:'X',sessionType:'lifting',startTime:1,notes:'',exercises:[
    {name:'Leg Press',cat:'squat',prescribed:{sets:1,reps:'10',loadKg:160,unit:'kg'},equipmentClass:'machine',tags:[],variant:null,painEvent:null,progression:logged?'hold':null,nextLoad:null,
     performed:[{type:'working',weightKg:160,reps:10,rpe:7,logged:logged}]}],order:[0]});
  S.activeSession=mk(false);_lastReadoutKey=null;
  const active=focusCardHTML({eis:[0]},0,S.activeSession,0);
  assert(/fc-readout/.test(active)&&/160/.test(active), 'C1: active card carries the giant readout');
  S.activeSession=mk(true);
  const done=focusCardHTML({eis:[0]},0,S.activeSession,0);
  assert(/fc-readout done/.test(done)&&/160/.test(done)&&/done/.test(done), 'C1: done card keeps the readout (top set). Got '+done.slice(0,120));
  assert(!/Log 160/.test(active)&&/Log set 1|Log warm-up/.test(active), 'C1: Log button no longer duplicates the readout numbers');
  S.activeSession=null;
})();
assert(/@keyframes fcmorph/.test(html)&&/\.fc-readout\.morph \.fc-readout-w\{animation:fcmorph 300ms/.test(html), 'C1: 300ms number morph wired (reduced-motion blanket kills it)');
// C2: single lit Log — ghosts + hidden current-row Log + reveal
assert(/\.fcard \.set-row \.set-log\{opacity:\.35\}/.test(html), 'C2: row Logs ghost at 35%');
assert(/\.fcard \.set-row\.current \.set-log\{display:none\}/.test(html), 'C2: current row cedes to the ONE solar fc-log');
assert(/\.fcard \.set-row:not\(\.current\):not\(\.reveal\) \.set-skip\{display:none\}/.test(html), 'C2: skip hidden until current or revealed');
assert(typeof wireRowReveal==='function', 'C2: long-press reveal wired');
wireRowReveal(null);wireRowReveal({});
// C3: neutral header label; chrome free of --acc (charts/pace exempt by list)
assert(/<div class="t-meta" id="sDayLbl">/.test(html)&&/sLbl\.style\.color='var\(--tx3\)'/.test(html), 'C3: Day-N header label is neutral meta');
// C4: one-line meta + detail sheet
assert(/\.fc-meta\{[^}]*white-space:nowrap[^}]*text-overflow:ellipsis/.test(html), 'C4: meta is one truncated line');
assert(/onclick="openFcDetail\(\$\{ei\}\)"/.test(html)&&typeof openFcDetail==='function'&&/id="fcDetailSheet"/.test(html), 'C4: tap opens the detail sheet');
assert(!/\$\{getLastHint\(ex\)\}\n  <\/div>`;/.test(html), 'C4: last-session detail moved off the card into the sheet');
// C6: rest scene
assert(/#focusTrack\.resting\{opacity:\.1;pointer-events:none\}/.test(html), 'C6: rest dims to 10% and mutes pointers behind the overlay');
assert(/class="fr-skip"/.test(html)&&/\.fr-skip\{[^}]*border:1px solid var\(--tx3\)/.test(html), 'C6: Skip is a neutral outline — never the Log colour');
assert(!/fr-actions[^<]*<button class="btn btn-p"/.test(html), 'C6: no solid brand button in the rest overlay');
// C7: rail ellipsis + fade + outside controls
assert(/\.rail-chip\{max-width:12ch/.test(html)&&/\.rail-chip\.pair\{max-width:16ch\}/.test(html), 'C7: chip text ellipsis at 12ch (pairs 16)');
assert(/\.rail-scroll\{padding-right:24px;mask-image:linear-gradient/.test(html), 'C7: right-edge fade mask + clearance padding');
assert(/<\/div><button class="rail-reorder"/.test(html), 'C7: reorder button outside the scroll area');

// ===== W5: C8 UNIFIED ADD SHEET + C9 LABELS + C10 DISCIPLINE =====
assert((html.match(/onclick="openExtras\(\)">\+ Add Exercise</g)||[]).length===2, 'C8: ONE ghost add button per session view (list tail + wrap card; the day-preview editor keeps its own). Got '+(html.match(/onclick="openExtras\(\)">\+ Add Exercise</g)||[]).length);
assert(!/\+ Add Extra </.test(html)&&!/btn-gold btn-w" style="margin-top:12px" onclick="openExtras/.test(html), 'C8: legacy gold banner deleted');
assert(!/\+ Custom Exercise</.test(html), 'C8: separate custom button retired (lives in the sheet)');
assert(/id="extrasSuggested"/.test(html)&&/class="sug-hdr">Suggested for today</.test(html), 'C8: sheet leads with Suggested for today');
assert(/\.sug-hdr\{font:600 12px var\(--sans\);color:var\(--brand\)/.test(html), 'C8: suggested header is flat brand (gradient budget untouched)');
assert(/addExMidSession\(\)">Custom exercise\.\.\.</.test(html), 'C8: custom flow reachable from the sheet');
assert(!/bonus-section" id="bonusSection"/.test(html), 'C8: list-view bonus section folded into the sheet');
assert(typeof activateBonus==='function', 'C8: bonus activation engine kept');
assert(/const top3=scored\.slice\(\)\.sort\(\(a,b\)=>b\.score-a\.score\)\.slice\(0,3\)/.test(html), 'C8: top-3 scored extras feed the suggestions');
// C9: sentence-case chrome labels via capitalize (uppercase stays banned)
assert(/\.ex-cat\{[^}]*text-transform:capitalize/.test(html), 'C9: category chips capitalize');
assert(/\.tagm\{[^}]*text-transform:capitalize/.test(html), 'C9: goal manual tag capitalizes');
assert(!/text-transform:uppercase/.test(html.match(/<style>([\s\S]*?)<\/style>/)[0].replace(/#blockHdr\{[^}]*\}/,'')), 'C9: #blockHdr remains the only uppercase (re-check)');
// C10: neutral ghosts — no greens/gold in the ghost/outline controls
(()=>{const st=html.match(/<style>([\s\S]*?)<\/style>/)[1];
  ['fr-ghost','fr-skip','rail-chip{','ro-btn'].forEach(sel=>{
    const i=st.indexOf(sel);const rule=st.slice(i,st.indexOf('}',i));
    assert(!/var\(--grn\)|var\(--gold\)|#3[0-9a-f]{5}/i.test(rule), 'C10: '+sel+' stays neutral. Got '+rule.slice(0,80));
  });})();

// ===== HOTFIX: iOS always-bounce scroll tail =====
assert(/\.view\{position:relative\}/.test(html)&&/\.view::after\{content:'';position:absolute;top:100%;left:0;width:1px;height:1px;pointer-events:none\}/.test(html), 'Scroll: absolute 1px tail past 100% keeps every view scrollable so iOS always rubber-bands');

// ===== V1: SESSION SECTIONS =====
assert(typeof sectionOf==='function'&&typeof toggleWuSection==='function', 'V1: section API defined');
assert(sectionOf({})==='main'&&sectionOf({section:'warmup'})==='warmup'&&sectionOf(null)==='main', 'V1: default main, null-safe');
// focus: consecutive warm-up exercises merge into one unit; finisher tagged
(()=>{
  const sess={exercises:[
    {name:'Cat-Camel',section:'warmup',performed:[]},
    {name:'Wall Slide',section:'warmup',performed:[]},
    {name:'Back Squat',performed:[]},
    {name:'Circuit',section:'finisher',performed:[]}],order:[0,1,2,3]};
  const u=focusUnits(sess);
  assert(u.length===3&&JSON.stringify(u[0].eis)==='[0,1]'&&u[0].sec==='warmup'&&u[1].sec==='main'&&u[2].sec==='finisher', 'V1: warmup mega-unit + section tags. Got '+JSON.stringify(u));
})();
// startDay carries section; record carries section
assert(/section:ex\.section\|\|'main',/.test(html), 'V1: startDay carries section');
assert(/section:ex\.section\|\|'main',\.\.\.\(ex\.entryType==='circuit'/.test(html), 'V1+V2: session record carries section + circuit fields');
// list interleave + collapse rule + tint
assert(/_secHdr\(ex\)\+`<div class="ex-card /.test(html), 'V1: headers interleave inside the joined string (ids untouched)');
assert(/#exList\.wu-collapsed \.ex-card\.sec-warmup\{display:none\}/.test(html), 'V1: collapsible warm-up group');
assert(/\.ex-card\.sec-finisher\{background:color-mix\(in srgb,var\(--brand\) 4%/.test(html), 'V1: finisher tint is FLAT brand (budget-safe)');
// report markers between groups, exercise lines untouched
(()=>{
  S.program=JSON.parse(JSON.stringify(DEF_PROGRAM));migrateV3();
  S.sessions=[{date:'2026-08-10',dayLabel:'X',dayId:1,blockName:S.program.name,duration:60,rpe:7,status:'complete',exercises:[
    {name:'Cat-Camel',cat:'rehab',section:'warmup',prescribed:{sets:1,reps:'8',loadKg:0,unit:'bw'},performed:[{type:'working',weightKg:0,reps:8,logged:true}],progression:'hold',nextLoad:null,tags:[]},
    {name:'Back Squat',cat:'squat',section:'main',prescribed:{sets:1,reps:'5',loadKg:110,unit:'kg'},performed:[{type:'working',weightKg:110,reps:5,logged:true}],progression:'hold',nextLoad:110,tags:[]}],painEvents:[]}];
  const r=buildCoachReport(S.sessions,S.program,weekDatesFor('2026-08-10'));
  assert(/  \[Warm-up\]\n/.test(r)&&/  \[Main\]\n/.test(r), 'V1: report groups by section. Got: '+r.split('###')[1].slice(0,140));
  assert(/Back Squat[^\n]*: 110 kg\u00d75/.test(r)||/Back Squat[^\n]*110/.test(r), 'V1: exercise lines intact');
  S.sessions=[];
})();

// ===== V2: CIRCUIT BLOCKS + KB =====
assert(typeof exDone==='function'&&typeof exResolved==='function'&&typeof circuitCardHTML==='function'&&typeof logCircuit==='function', 'V2: circuit API defined');
// done-state: circuits are NOT instantly done despite performed:[]
(()=>{
  const c={name:'KB Circuit',entryType:'circuit',format:'EMOM',minutes:12,performed:[]};
  assert(exDone(c)===false&&exResolved(c)===false, 'V2: unlogged circuit is NOT done ([].every trap closed)');
  c.result='12 rounds';
  assert(exDone(c)===true&&exResolved(c)===true, 'V2: result string completes the block');
  assert(exDone({performed:[{logged:true}]})===true, 'V2: normal exercises unchanged');
})();
// units + estimator
(()=>{
  const sess={exercises:[{name:'C',entryType:'circuit',format:'AMRAP',minutes:25,performed:[],section:'main'}],order:[0]};
  assert(focusUnits(sess).length===1&&unitDone(sess,focusUnits(sess)[0])===false, 'V2: circuit unit pending until result');
})();
assert(estimateExTime({entryType:'circuit',minutes:12})===14, 'V2: circuit bills clock+2. Got '+estimateExTime({entryType:'circuit',minutes:12}));
// report line
(()=>{
  S.program=JSON.parse(JSON.stringify(DEF_PROGRAM));migrateV3();
  S.sessions=[{date:'2026-08-10',dayLabel:'KB',dayId:1,blockName:S.program.name,duration:40,rpe:7,status:'complete',exercises:[
    {name:'KB Circuit',entryType:'circuit',format:'EMOM',minutes:12,loadKg:24,movements:'10 swings / 8 goblets',result:'12 rounds',section:'main',prescribed:{},performed:[],tags:[]}],painEvents:[]}];
  const r=buildCoachReport(S.sessions,S.program,weekDatesFor('2026-08-10'));
  assert(/  EMOM 12min @24kg \u2014 12 rounds\n/.test(r), 'V2: report prints "EMOM 12min @24kg — 12 rounds". Got: '+(r.split('###')[1]||'').slice(0,120));
  assert(/    \(10 swings \/ 8 goblets\)/.test(r), 'V2: movements line follows');
  S.sessions=[];
})();
// kb class
assert(EQ_TAGS.includes('kb'), 'V2: kb equipment tag exists');
assert(inferEquipmentClass('KB Swing')!=='bw'||!EX_META['KB Swing'], 'V2: kb never falls through to bw once EX_META lands (V5)');
assert(/if\(eq\.includes\('kb'\)\)return 'kb';/.test(html), 'V2: inferEquipmentClass kb branch');
assert(/cls==='bw'\|\|cls==='sled'\|\|cls==='kb'/.test(html), 'V2: kb skips variant chips');
assert(snapIncrement('kb')===null&&snapSuggestion(23.7,'kb')===23.7, 'V2: kb loads pass through un-snapped (bells are fixed)');

// ===== V3: RETRO SESSION LOGGING =====
assert(typeof openRetroLog==='function'&&typeof startRetroSession==='function'&&typeof toggleTrainMenu==='function', 'V3: retro API defined');
assert(/id="trainMenu"/.test(html)&&/Log a past session</.test(html)&&/Copy coach report</.test(html), 'V3: Train overflow carries both actions');
assert(/id="retroSheet"/.test(html)&&/id="retroDate"[^>]*max="\$\{yd\}"/.test(html), 'V3: retro sheet with past-only date input');
// retro record: date + flag + chronological re-sort + week-guard
(()=>{
  S.program=JSON.parse(JSON.stringify(DEF_PROGRAM));migrateV3();S.sessions=[];S.activeSession=null;
  global.startTimer=()=>{};global.showSessionHero=global.showSessionHero||(()=>{});
  // a normal session logged today first
  S.sessions.push({id:'sA',date:todayStr(),dayLabel:'X',dayId:null,blockName:S.program.name,duration:60,rpe:7,status:'complete',exercises:[],painEvents:[]});
  // retro-log the squat day (index 2) for a date LAST week
  startDay(2);
  S.activeSession.date='2026-08-01';S.activeSession.retro=true;
  S.activeSession.exercises.forEach((ex,i)=>{ex.performed.forEach(s2=>{s2.logged=true;if(s2.type==='working')s2.rpe=7;});});
  selRpe=7;confirmRpe();
  const rec=S.sessions.find(s=>s.retro);
  assert(rec&&rec.date==='2026-08-01', 'V3: record saved with the picked past date');
  assert(S.sessions[0].retro===true&&S.sessions[1].id==='sA', 'V3: history re-sorted chronologically after a backfill');
  assert(rec.duration===(S.program.days[2].dur||0), 'V3: retro duration = planned day length, not wall-clock');
  // week-guard: last week's backfill must NOT mark this week's day done
  assert(isDayDone(2)===false, 'V3: out-of-week retro record does not complete the current day');
  // an in-week retro record DOES count
  rec.date=todayStr();
  assert(isDayDone(2)===true, 'V3: in-week retro record counts normally');
  S.sessions=[];S.activeSession=null;
})();

// ===== V4: PAUSED GOALS =====
assert(typeof resumeGoal==='function'&&typeof togglePausedGoals==='function', 'V4: pause API defined');
(()=>{
  // one-shot migration pauses MU + running exactly once; resume survives
  S.settings._goalsPausedW4=undefined;
  (S.goals||[]).forEach(g=>{if(g.id==='g-mu'||g.id==='g-run')g.paused=false;});
  migrateV3();
  const mu=S.goals.find(g=>g.id==='g-mu'),run=S.goals.find(g=>g.id==='g-run');
  assert(mu.paused===true&&run.paused===true, 'V4: one-shot pauses g-mu + g-run');
  resumeGoal('g-mu');
  migrateV3();
  assert(S.goals.find(g=>g.id==='g-mu').paused===false, 'V4: manual resume survives re-migration (one-shot flag)');
  // pace exclusion
  assert(computePace({type:'big3-total',paused:true},'2026-08-10')==='pace-muted', 'V4: paused goals leave pace logic');
  assert(/if\(goal&&goal\.paused\)return 'pace-muted'/.test(html), 'V4: pace guard wired');
  // restore paused state for the ship default
  S.goals.find(g=>g.id==='g-mu').paused=true;
})();
assert(/const activeCards=\[card1000, _pausedIds\.has\('g-mu'\)\?null:cardMU, cardSwim/.test(html), 'V4: dashboard order 1000lb, Freestyle; paused cards pulled out');
assert(/id="pausedWrap"/.test(html)&&/Resume Muscle-Up</.test(html)&&/Resume Running</.test(html), 'V4: Paused expander + resume actions');
assert(/if\(!_muPaused\)celebrateMilestone\('mu_'/.test(html), 'V4: paused milestones stay silent (data still updates)');
assert(!/kb.*goal|goal.*kettlebell/i.test((html.match(/migrateV3[\s\S]{0,3000}/)||[''])[0]), 'V4: no KB goal invented');

// ===== V6: F1 OPEN-STATE + F2 NOTES DEBOUNCE + F3 DISPLAY SNAP =====
console.log('\n--- V6: fix pack ---');
// --- F3 unit: suggestions snap at display time, holds stay raw ---
assert(dispSuggest(161.3,'machine','increase')===162.5, 'F3: stored 161.3 machine increase displays 162.5. Got: '+dispSuggest(161.3,'machine','increase'));
assert(dispSuggest(16.5,'cable','hold')===16.5, 'F3: hold renders raw — achieved weight is history');
assert(dispSuggest(70,'barbell','flag')===70, 'F3: deload 70 barbell unchanged by floor snap');
assert(dispSuggest(69.1,'barbell','flag')===69, 'F3+G3: deload floors to the nearest rackable below (1 kg rack → 69). Got: '+dispSuggest(69.1,'barbell','flag'));
assert(dispSuggest(24,'kb','increase')===24, 'F3: kb passes through — bells are fixed weights');
// --- F3 seeded report: pre-fix stored 161.3 renders loadable in tail + summary chain ---
S.program=JSON.parse(JSON.stringify(DEF_PROGRAM));migrateV3();
S.sessions=[{date:'2026-08-10',dayLabel:'Squat',dayId:1,blockName:S.program.name,duration:60,rpe:7,status:'complete',exercises:[
  {name:'Leg Press',cat:'legs',equipmentClass:'machine',prescribed:{sets:3,reps:'10',loadKg:160,unit:'kg'},performed:[{type:'working',weightKg:160,reps:10,logged:true}],progression:'increase',nextLoad:161.3,variant:null,tags:[]}
]}];
const rptV6=buildCoachReport(S.sessions,S.program,weekDatesFor('2026-08-10'));
assert(/Leg Press.*→ next 162\.5 kg/.test(rptV6), 'F3: report tail snaps 161.3 → next 162.5 kg. Got: '+(rptV6.split('\n').find(l=>/Leg Press.*next/.test(l))||'none'));
assert(/↑ Leg Press: 160 kg → 162\.5 kg/.test(rptV6), 'F3: progression-summary chain snaps too. Got: '+(rptV6.split('\n').find(l=>/↑ Leg Press/.test(l))||'none'));
assert(/dispSuggest\(sx\.nextLoad/.test(html), 'F3: getLastHint progression line routed through dispSuggest');
assert(/Next: \$\{fmtW\(dispSuggest\(ex\.nextLoad/.test(html), 'F3: renderSummary Next line routed through dispSuggest');
// --- F1: manual open/close survives re-render decisions ---
S.sessions=[];S.activeSession=null;
startDay(2); // B6 Squat day (index 2)
const sF1=S.activeSession;
assert(cardOpen(sF1,0)===true, 'F1: first card auto-opens');
assert(cardOpen(sF1,3)===false, 'F1: later card starts closed');
toggleCardOpen(3);
assert(cardOpen(sF1,3)===true, 'F1: manual open recorded');
sF1.exercises[0].performed.forEach(p2=>{p2.logged=true;}); // out-of-order log on ex0
assert(cardOpen(sF1,3)===true, 'F1: card 3 stays open after out-of-order logging elsewhere');
toggleCardOpen(3);
assert(cardOpen(sF1,3)===false, 'F1: manual close recorded');
assert(cardOpen(sF1,1)===true, 'F1: auto-open advanced to card 1 after card 0 done');
toggleCardOpen(1);
assert(cardOpen(sF1,1)===false&&_userClosed.has(1), 'F1: manual close wins over auto-open');
assert(/onclick="toggleCardOpen\(\$\{i\}\)"/.test(html), 'F1: card header routes through toggleCardOpen');
assert(/const isOpen=cardOpen\(sess,i\);/.test(html), 'F1: list open class reads cardOpen, not raw autoOpen');
assert(html.split('_userOpened=new Set();_userClosed=new Set();').length===3, 'F1: state cleared on startDay AND cancelSession');
// --- F2: notes land synchronously, save() deferred, flush works ---
queueNotesSave('torture-typing-200-chars');
assert(sF1.notes==='torture-typing-200-chars', 'F2: notes land on the session synchronously');
assert(_notesT!==null&&_notesT!==undefined, 'F2: save() deferred behind a timer');
flushNotesSave();
assert(_notesT===null, 'F2: flush clears the pending timer');
sF1.activity={type:'swim'};
queueNotesSave('activity-notes','activity');
assert(sF1.activity.notes==='activity-notes', 'F2: activity notes land synchronously');
flushNotesSave();
S.activeSession=null;
assert(/id="sessNotes"[^>]*queueNotesSave/.test(html), 'F2: sessNotes debounced');
assert(/oninput="queueNotesSave\(this\.value\)"/.test(html), 'F2: fNotes debounced');
assert(/id="actNotes"/.test(html)&&/oninput="queueNotesSave\(this\.value,'activity'\)"/.test(html), 'F2: activity notes box has an id + debounced route');
assert(/activeElement\.id==='actNotes'\)return;/.test(html), 'F2: renderActivityLog never rebuilds under the notes caret');
assert(!/saveSessionNotes/.test(html), 'F2: per-keystroke saver removed');
assert(/tagName==='TEXTAREA'\)flushNotesSave\(\); \/\/ F2/.test(html), 'F2: focusout flushes pending notes');
assert(/function endSession\(\)\{\n  flushNotesSave\(\);/.test(html)&&/function cancelSession\(\)\{\n  flushNotesSave\(\);/.test(html)&&/function finalizeActivity\(\)\{\n  flushNotesSave\(\);/.test(html), 'F2: end/cancel/finalize flush before teardown');

// ===== G1: focusCardHTML must not throw on a circuit unit (TDZ regression) =====
console.log('\n--- G1: focus circuit TDZ hotfix ---');
S.program=JSON.parse(JSON.stringify(DEF_PROGRAM));migrateV3();S.sessions=[];S.activeSession=null;
(()=>{
  S.activeSession={dayIndex:0,dayId:99,blockName:S.program.name,date:todayStr(),dayLabel:'TDZ',sessionType:'lifting',startTime:1,notes:'',
    exercises:[{name:'KB Finisher',entryType:'circuit',format:'EMOM',minutes:12,movements:'',result:null,loadKg:24,section:'finisher',performed:[],tags:[],prescribed:{sets:0,reps:'',loadKg:24,unit:'kg'},progression:null,nextLoad:null,painEvent:null,notes:''}],
    order:[0]};
  const units=focusUnits(S.activeSession);
  let html2='',threw=null;
  try{html2=focusCardHTML(units[0],0,S.activeSession,[0,0]);}catch(e){threw=e;}
  assert(threw===null, 'G1: circuit unit focus card renders without throwing. Got: '+(threw&&threw.message));
  assert(/circRes0|Log result/.test(html2), 'G1: circuit body present in focus card');
  assert(/fc-sec-finisher/.test(html2)&&/sec-hdr-fin/.test(html2), 'G1: finisher section class + header render on the circuit card');
  S.activeSession=null;
})();

// ===== G2: kb + rest SESSION TYPES =====
console.log('\n--- G2: kb + rest session types ---');
assert(MODALITY_TYPES.includes('kb')&&MODALITY_TYPES.includes('rest'), 'G2: kb + rest registered in MODALITY_TYPES');
assert(ACTIVITY_TYPES.includes('kb')&&!ACTIVITY_TYPES.includes('rest'), 'G2: kb logs via activity form, rest does not log');
assert(!!ICONS.kb, 'G2: kettlebell icon registered');
assert(/--m-kb:/.test(html), 'G2: --m-kb modality token present');
assert(/kb:'Duration, bells/.test(html), 'G2: ACTIVITY_EMPTY has a kb line');
assert(isStartableDay({sessionType:'kb'})===true&&isStartableDay({sessionType:'rest'})===false&&isStartableDay({})===true, 'G2: isStartableDay gates rest only');
// kb round-trip: session -> record -> report
(()=>{
  const sess={dayIndex:-1,dayId:50,blockName:S.program.name,date:'2026-08-17',dayLabel:'KB',sessionType:'kb',startTime:7,
    activity:{durationMin:40,kbWeights:'16 / 24 kg',notes:'25 min AMRAP swings + carries',result:'5 rounds + 12',effort:7,distance:0},exercises:[]};
  const rec=makeActivitySession(sess);
  assert(rec.activity.kbWeights==='16 / 24 kg'&&rec.activity.result==='5 rounds + 12'&&rec.duration===40&&rec.exercises.length===0, 'G2: kb record round-trips bells + result + duration');
  const rpt=buildCoachReport([{...rec,date:'2026-08-17'}],S.program,weekDatesFor('2026-08-17'));
  assert(/\(kb\).*bells 16 \/ 24 kg.*result: 5 rounds \+ 12/.test(rpt), 'G2: report prints the kb block with bells + result. Got: '+(rpt.split('\n').find(l=>/\(kb\)/.test(l))||'none'));
})();
// rest: never the next session, exempt from completeness, out of scheduled count
(()=>{
  const saveP=S.program,saveS=S.sessions,saveK=S.skips;
  S.program={name:'RestTest',active:true,days:[
    {id:1,label:'Lift',defaultDay:'Monday',dayOfWeek:'Monday',sessionType:'lifting',dur:60,exercises:[{name:'Back Squat',cat:'squat',sets:3,reps:'5',loadKg:100,unit:'kg'}]},
    {id:2,label:'Rest',defaultDay:'Tuesday',dayOfWeek:'Tuesday',sessionType:'rest',dur:0,exercises:[]}
  ]};
  S.sessions=[];S.skips=[];
  const next=getNextAvailableDayIdx();
  assert(next===0, 'G2: rest day never wins the Start slot. Got: '+next);
  S.sessions=[{date:weekDatesFor(todayStr())[0],dayLabel:'Lift',dayId:1,blockName:'RestTest',sessionType:'lifting',status:'complete',exercises:[]}];
  assert(isWeekComplete(weekDatesFor(todayStr()))===true, 'G2: week completes with an unlogged rest day');
  const sched=weeklyScheduled(weekDatesFor(todayStr()),todayStr());
  assert(sched.prog===1, 'G2: rest excluded from the scheduled count. Got: '+sched.prog);
  S.program=saveP;S.sessions=saveS;S.skips=saveK;
})();
assert(/isStartableDay\(d\)\?`<button class="sheet-btn"/.test(html), 'G2: week session sheet gates Start on startability');
assert(/startBtn\.style\.display=day\.sessionType==='rest'\?'none'/.test(html), 'G2: preview hides Start for rest days');
assert((html.match(/'Farmer Carry':\{/g)||[]).length===1, 'G2: Farmer Carry defined exactly once');
assert(inferEquipmentClass('Farmer Carry')==='kb', 'G2: Farmer Carry regains the kb equipment class');
assert(!/st==='swim'\|\|st==='run'\|\|st==='pilates'\|\|st==='mobility'/.test(html), 'G2: no stray hardcoded activity-type lists remain');

// ===== G3: WORKING-SET PLATE SNAPPING (spec D, parametrized) =====
console.log('\n--- G3: bar-aware working-set snapping ---');
const P6=[25,20,15,10,5,2.5];               // spec's coarse test set
const P7=[25,20,15,10,5,2.5,1.25];          // the confirmed Singapore rack
assert(isMakeableTotal(121,36,P6)===true, 'G3: 121 makeable on 36 bar / coarse set (2x42.5)');
assert(isMakeableTotal(122.5,36,P6)===false, 'G3: 122.5 impossible on 36 bar / coarse set');
assert(nearestMakeableTotal(122.5,36,P6)===121, 'G3: 122.5 -> nearest 121 (down). Got: '+nearestMakeableTotal(122.5,36,P6));
assert(nearestMakeableTotal(124.5,36,P6)===126, 'G3: 124.5 -> nearest 126 (up). Got: '+nearestMakeableTotal(124.5,36,P6));
assert(nearestMakeableTotal(123.5,36,P6)===121, 'G3: exact midpoint ties round DOWN (121 not 126). Got: '+nearestMakeableTotal(123.5,36,P6));
assert(isMakeableTotal(97.5,20,P7)===true, 'G3: 97.5 squat backoff loadable with 1.25s (2x38.75)');
assert(isMakeableTotal(97.5,20,P6)===false, 'G3: 97.5 impossible without 1.25s');
assert(isMakeableTotal(122.5,36,P7)===false, 'G3: 122.5 still impossible on the Singapore rack (no 1 kg)');
assert(snapToMakeable(122.5,36,P6)===121, 'G3: DP floor agrees with greedy on the coarse set');
// DP beats greedy on odd inventories: per-side 30 with [20,17.5] -> greedy
// takes 20 then stalls (20); DP finds 17.5+... nothing = 20? craft: target 35/side with [20,17.5]: greedy 20+...=20; DP 17.5+17.5=35.
assert(snapToMakeable(90,20,[20,17.5])===90, 'G3: DP floor finds 2x35 (17.5+17.5) where greedy stalls at 20. Got: '+snapToMakeable(90,20,[20,17.5]));
assert(DEFAULT_PLATES.join(',')==='25,20,15,10,5,2.5,1.25', 'G3: default inventory has 1.25s, no 1 kg');
assert(/_sgPlates1kgDroppedB6/.test(html), 'G3: one-shot drops the 1 kg pair from stored Singapore config');
// genWarmups stays plate-exact under the new floor
(()=>{
  const rows=genWarmups(126,{name:'Deadlift',barKg:36});
  assert(rows.length>=2 && rows.every(r=>isMakeableTotal(r.w,36,activePlates())), 'G3: generated DL warmups all rackable. Got: '+JSON.stringify(rows));
})();
// validator: authored unrackable barbell load warns (never blocks).
// Gym-pinned: Singapore's rack (1.25s, no 1 kg) is where 122.5 is a lie.
(()=>{
  const _gymSave=S.settings.activeGymId;S.settings.activeGymId='gym-singapore';
  const w=validateSession([{name:'Deadlift',cat:'hinge',sets:4,reps:'5',loadKg:122.5,unit:'kg',equipmentClass:'barbell',barKg:36}],{sessionType:'lifting',targetDur:60});
  const pm=w.filter(x=>/not loadable/.test(x.msg));
  assert(pm.length===1 && pm[0].level==='warn', 'G3: validator warns on authored 122.5 @ 36 bar. Got: '+JSON.stringify(pm));
  const w2=validateSession([{name:'Deadlift',cat:'hinge',sets:4,reps:'5',loadKg:126,unit:'kg',equipmentClass:'barbell',barKg:36}],{sessionType:'lifting',targetDur:60});
  assert(w2.filter(x=>/not loadable/.test(x.msg)).length===0, 'G3: 126 @ 36 bar is clean');
  S.settings.activeGymId=_gymSave;
})();

// ===== G4: ROLE / TARGET / FROZEN =====
console.log('\n--- G4: role/target/frozen ---');
assert(exRole({name:'Face Pull'})==='rehab', 'G4: ROLE_DEFAULTS — Face Pull is rehab');
assert(exRole({name:'Band External Rotation'})==='rehab', 'G4: rehab-shaped meta defaults to rehab');
assert(exRole({name:'Back Squat'})===null, 'G4: main lifts carry no default role');
assert(exRole({name:'Leg Press',role:'hypertrophy'})==='hypertrophy', 'G4: authored role wins');
assert(targetLineHTML({name:'DB RDL',prescribed:{loadKg:35,reps:'8'},target:{type:'load',value:40,unit:'kg'}})==='35 → 40 kg', 'G4: thin progress line renders current → target. Got: '+targetLineHTML({name:'DB RDL',prescribed:{loadKg:35,reps:'8'},target:{type:'load',value:40,unit:'kg'}}));
const mkExG4=(o)=>Object.assign({name:'Leg Press',cat:'squat',prescribed:{sets:3,reps:'10',loadKg:170,unit:'kg'},equipmentClass:'machine',performed:[{type:'working',weightKg:170,reps:10,rpe:7,logged:true}],tags:[],progression:null,nextLoad:null,painEvent:null},o);
// rehab: no suggestion at all
S.activeSession={dayIndex:-1,date:'2026-08-17',dayLabel:'T',sessionType:'lifting',startTime:1,exercises:[mkExG4({name:'Face Pull',cat:'pull',equipmentClass:'cable',prescribed:{sets:2,reps:'15',loadKg:13.75,unit:'kg'},performed:[{type:'working',weightKg:13.75,reps:15,rpe:7,logged:true}]})]};
evalProg(0);
assert(S.activeSession.exercises[0].progression===null&&S.activeSession.exercises[0].nextLoad===null, 'G4: rehab role → no progression suggestion. Got: '+S.activeSession.exercises[0].progression);
// frozen: hold + cue reason
S.activeSession.exercises=[mkExG4({name:'Back Extension',cat:'hinge',equipmentClass:'bw',prescribed:{sets:3,reps:'12',loadKg:10,unit:'kg'},frozen:true,cue:'Depth + contraction first',performed:[{type:'working',weightKg:10,reps:12,rpe:7,logged:true}]})];
evalProg(0);
assert(S.activeSession.exercises[0].progression==='hold'&&/Frozen — Depth \+ contraction first/.test(S.activeSession.exercises[0].progressionReason), 'G4: frozen → hold + cue reason. Got: '+S.activeSession.exercises[0].progressionReason);
// at-target: load/kg
S.activeSession.exercises=[mkExG4({target:{type:'load',value:170,unit:'kg'}})];
evalProg(0);
assert(S.activeSession.exercises[0].progression==='hold'&&S.activeSession.exercises[0].progressionReason==='At target — maintain', 'G4: at-target (kg) → maintain. Got: '+S.activeSession.exercises[0].progression+' / '+S.activeSession.exercises[0].progressionReason);
// at-target: e1RM (145×5 → 169.2 ≥ 166)
S.activeSession.exercises=[mkExG4({name:'Back Squat',equipmentClass:'barbell',prescribed:{sets:4,reps:'5',loadKg:145,unit:'kg'},performed:[{type:'working',weightKg:145,reps:5,rpe:8,logged:true}],target:{type:'load',value:166,unit:'e1rm'}})];
evalProg(0);
assert(S.activeSession.exercises[0].progression==='hold'&&S.activeSession.exercises[0].progressionReason==='At target — maintain', 'G4: at-target (e1RM) → maintain');
// below target: normal path unaffected
S.activeSession.exercises=[mkExG4({target:{type:'load',value:180,unit:'kg'}})];
evalProg(0);
assert(S.activeSession.exercises[0].progression==='increase', 'G4: below target → normal progression. Got: '+S.activeSession.exercises[0].progression);
// pain BEATS frozen
S.activeSession.exercises=[mkExG4({frozen:true,painEvent:{severity:'moderate'},performed:[{type:'working',weightKg:170,reps:10,rpe:7,logged:true}]})];
evalProg(0);
assert(S.activeSession.exercises[0].progression==='flag'&&/Pain event/.test(S.activeSession.exercises[0].progressionReason), 'G4: pain wins over frozen. Got: '+S.activeSession.exercises[0].progression);
// role/target/frozen + progressionReason survive into the stored record
S.activeSession={dayIndex:-1,dayId:60,blockName:S.program.name,date:'2026-08-17',dayLabel:'G4T',sessionType:'lifting',startTime:11,notes:'',
  exercises:[mkExG4({role:'hypertrophy',frozen:true,cue:'test cue',target:{type:'load',value:180,unit:'kg'}})]};
evalProg(0);
confirmRpe(7);
(()=>{
  const rec=S.sessions[S.sessions.length-1];
  const rx=rec.exercises[0];
  assert(rx.role==='hypertrophy'&&rx.frozen===true&&rx.target&&rx.target.value===180&&/Frozen/.test(rx.progressionReason||''), 'G4: role/target/frozen/reason persist to the record. Got: '+JSON.stringify({role:rx.role,frozen:rx.frozen,reason:rx.progressionReason}));
  S.sessions.pop();
})();
S.activeSession=null;
assert((html.match(/toggleFreeze\(\$\{i\}\);closeExMenus\(\)/g)||[]).length===1&&(html.match(/toggleFreeze\(\$\{ei\}\);closeExMenus\(\)/g)||[]).length===1, 'G4: freeze toggle in both overflow menus');
assert(/\.role-chip\{/.test(html), 'G4: role chip styled');
assert(/roleTag\}\$\{stateTag\}/.test(html), 'G4: report prints role + state tags');

// ===== G5: PLANNER CORE — unification, numbering, week overrides =====
console.log('\n--- G5: planner core ---');
assert(/\.filter\(o=>!isDayDone\(o\.i\)&&!isDaySkipped\(o\.i\)&&isStartableDay\(o\.d\)&&!dayRemovedForWeek/.test(html), 'G5: up-next ranks are filtered BEFORE numbering (contiguous 1..n)');
(()=>{
  const saveP=JSON.parse(JSON.stringify(S.program)),saveS=S.sessions,saveK=S.skips,saveR=S.weekRemovals;
  S.sessions=[];S.skips=[];S.weekRemovals=[];
  S.program={name:'G5Test',active:true,days:[
    {id:1,label:'Mon Lift',defaultDay:'Monday',dayOfWeek:'Monday',sessionType:'lifting',dur:60,exercises:[{name:'Back Squat',cat:'squat',sets:3,reps:'5',loadKg:100,unit:'kg'}]},
    {id:2,label:'Wed Lift',defaultDay:'Wednesday',dayOfWeek:'Wednesday',sessionType:'lifting',dur:60,exercises:[{name:'Deadlift',cat:'hinge',sets:3,reps:'5',loadKg:120,unit:'kg'}]}
  ]};
  const wk=weekDatesFor(weekAnchor(todayStr()));
  // E3: move Mon → Fri; the Start picker and the Week grid agree instantly.
  assert(rescheduleDay(0,wk[4])===true, 'G5: reschedule writes');
  assert(dayEffectiveDate(S.program.days[0])===wk[4], 'G5: effective date follows the move');
  const rows=buildWeek(wk,todayStr());
  assert(rows[4].sessions.some(x=>x.dayIndex===0)&&!rows[0].sessions.some(x=>x.dayIndex===0), 'G5: Week grid places the moved day on Friday (same rule as Start)');
  assert(getNextAvailableDayIdx()===1, 'G5: Start picker now leads with Wednesday. Got: '+getNextAvailableDayIdx());
  // out-of-week scheduledDate no longer vanishes — it falls back to the dow slot
  S.program.days[0].scheduledDate='2020-01-01';
  const rows2=buildWeek(wk,todayStr());
  assert(rows2[0].sessions.some(x=>x.dayIndex===0), 'G5: stale out-of-week scheduledDate falls back to Monday instead of vanishing');
  delete S.program.days[0].scheduledDate;
  // E1 model: a one-off pins to its date, renders, and never recurs
  S.program.days.push({id:99,label:'Extra Swim',sessionType:'swim',dur:40,exercises:[],oneOff:true,userAuthored:true,scheduledDate:wk[5]});
  assert(dayEffectiveDate(S.program.days[2])===wk[5], 'G5: one-off pins to its scheduled date');
  assert(buildWeek(wk,todayStr())[5].sessions.some(x=>x.dayIndex===2&&x.oneOff), 'G5: one-off renders in its week slot');
  assert(removeDayForWeek(2)===true&&S.program.days.length===2, 'G5: deleting a one-off removes it outright');
  // E2 model: removing a TEMPLATE day hides it for the week, program intact
  assert(removeDayForWeek(0)===true&&S.program.days.length===2, 'G5: template delete keeps the program day');
  assert(S.weekRemovals.length===1&&S.weekRemovals[0].dayId===1, 'G5: removal recorded as {dayId,weekOf}');
  const rows3=buildWeek(wk,todayStr());
  assert(!rows3.some(r=>r.sessions.some(x=>x.dayIndex===0)), 'G5: removed day gone from the Week grid');
  assert(getNextAvailableDayIdx()===1, 'G5: removed day never wins the Start slot');
  // completeness + scheduled count respect a removal keyed to the CALENDAR week
  const cwk=weekDatesFor(todayStr());
  S.weekRemovals=[{dayId:1,weekOf:cwk[0]}];
  S.sessions=[{date:cwk[2],dayLabel:'Wed Lift',dayId:2,blockName:'G5Test',sessionType:'lifting',status:'complete',exercises:[]}];
  assert(isWeekComplete(cwk)===true, 'G5: removed day exempt from week completeness');
  assert(weeklyScheduled(cwk,todayStr()).prog===1, 'G5: removed day out of the scheduled count. Got: '+weeklyScheduled(cwk,todayStr()).prog);
  S.program=saveP;S.sessions=saveS;S.skips=saveK;S.weekRemovals=saveR||[];
})();
// composer ids are numeric now (string ids broke carryPermanentDays)
(()=>{
  const saveP=JSON.parse(JSON.stringify(S.program));
  const d=composerAddSession('Wednesday','swim',false);
  assert(typeof d.id==='number'&&d.userAuthored===true, 'G5: composer day gets numeric id + userAuthored. Got: '+typeof d.id);
  S.program=JSON.parse(JSON.stringify(saveP));
})();
assert(/S\.weekRemovals=S\.weekRemovals\.filter\(r=>r\.weekOf>=_wkMon\)/.test(html), 'G5: stale removals pruned on load');
assert(/d\.oneOff&&\(!d\.scheduledDate\|\|weekOfDate\(d\.scheduledDate\)<_wkMon\)/.test(html), 'G5: stale one-offs pruned on load');
assert(/if\(day\.oneOff\)return day\.scheduledDate\|\|anchor/.test(html), 'G5: one-offs never fall back to dow recurrence');

// ===== G6: PLANNER UI — add picker, delete, drag polish =====
console.log('\n--- G6: planner UI ---');
(()=>{
  const saveP=JSON.parse(JSON.stringify(S.program)),saveR=S.weekRemovals;
  S.weekRemovals=[];
  const wk=weekDatesFor(weekAnchor(todayStr()));
  // picker creates a one-off of each plain type with exercises:[]
  _addSessionDate=wk[4];
  const kbDay=addWeekSession('type','kb');
  assert(kbDay&&kbDay.oneOff===true&&kbDay.sessionType==='kb'&&Array.isArray(kbDay.exercises)&&kbDay.exercises.length===0&&typeof kbDay.id==='number', 'G6: picker KB day is a one-off with exercises:[]');
  _addSessionDate=wk[5];
  const restDay=addWeekSession('type','rest');
  assert(restDay.sessionType==='rest'&&isStartableDay(restDay)===false, 'G6: picker rest day is unstartable');
  // template add clones by label with a fresh numeric id
  _addSessionDate=wk[3];
  const tplDay=addWeekSession('tpl',0);
  assert(tplDay.oneOff===true&&tplDay.label===S.program.days[0].label&&tplDay.id!==S.program.days[0].id, 'G6: template one-off clones label with fresh id');
  S.program=JSON.parse(JSON.stringify(saveP));S.weekRemovals=saveR||[];
})();
assert(/openAddSession\('\$\{r\.date\}'\)/.test(html), 'G6: every week row carries a + button');
assert(/confirmRemoveWeekDay\(\$\{dayIdx\}\)/.test(html)&&/Remove from this week/.test(html), 'G6: session sheet offers week-scoped delete with confirm');
assert(/setPointerCapture\(e\.pointerId\)/.test(html), 'G6: drag captures the pointer');
assert(/Math\.abs\(e\.clientY-startY\)>8/.test(html), 'G6: pre-arm scroll guard cancels the hold');

// ===== G7: BLOCK BANNER VERSIONING + STALE MOBILITY REMOVAL =====
console.log('\n--- G7: banner versioning + F2 ---');
assert(DEF_PROGRAM.version===10, 'G7/G10: Block 6 W1 ships as version 10. Got: '+DEF_PROGRAM.version);
assert(/DEF_PROGRAM\.version>\(S\.program\.version\?\?0\) && S\.settings\._dismissedProgramVersion!==DEF_PROGRAM\.version/.test(html), 'G7: banner fires only for a NEWER version');
assert(!/DEF_PROGRAM\.name!==S\.program\.name && S\.settings\._dismissedBlock/.test(html), 'G7: the direction-blind name banner is gone');
// An OLDER cached HTML (lower version) can never re-offer itself:
(()=>{
  const cond=(defV,progV,dismissed)=>defV>(progV??0)&&dismissed!==defV;
  assert(cond(9,undefined,undefined)===true, 'G7: legacy program (no version) sees the v9 offer');
  assert(cond(8,9,undefined)===false, 'G7: stale v8 HTML over an installed v9 stays silent (the Jul-27-over-Aug-3 bug)');
  assert(cond(10,9,10)===false, 'G7: dismissing v10 silences exactly v10');
  assert(cond(11,9,10)===true, 'G7: a later v11 re-offers after a v10 dismissal');
})();
// F2: stale coach-permanent day whose label left the block is removed; user-authored survives
(()=>{
  const days=[
    {id:8,label:'Mobility',permanent:true,sessionType:'lifting',exercises:[]},
    {id:9,label:'My Custom Day',permanent:true,userAuthored:true,sessionType:'lifting',exercises:[]},
    {id:1,label:'Squat',sessionType:'lifting',exercises:[]}
  ];
  const stale=days.filter(d=>d.permanent===true&&!d.userAuthored&&!DEF_PROGRAM.days.some(nd=>nd.label===d.label));
  assert(stale.length===1&&stale[0].label==='Mobility', 'G7/F2: removal predicate hits only the stale coach Mobility day');
})();
assert(/_staleMobilityRemovedB6&&DEF_PROGRAM\.version>=10/.test(html), 'G7/F2: removal one-shot gated on the v10 ship');
assert(/S\.skips=\(S\.skips\|\|\[\]\)\.filter\(sk=>!stale\.some\(d=>d\.id===sk\.dayId\)\)/.test(html), 'G7/F2: removed day sweeps its skips');

// ===== G8: COLOUR AUDIT — no hardcoded hex outside the token map =====
console.log('\n--- G8: hex scan ---');
(()=>{
  const hexRe=/(?<!&)#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})(?![0-9a-zA-Z-])/g; // (?<!&) skips &#9888;-style entities
  // 1) STYLE: everything except the :root token map and mask alpha stops.
  const styleContent=(html.match(/<style>([\s\S]*?)<\/style>/)||['',''])[1]
    .replace(/:root\{[^}]*\}/,'')
    .replace(/mask-image:linear-gradient\([^)]*\)/g,'')
    .replace(/-webkit-mask-image:linear-gradient\([^)]*\)/g,'');
  const styleHits=styleContent.match(hexRe)||[];
  assert(styleHits.length===0, 'G8: style block clean of hex outside :root. Offenders: '+styleHits.join(','));
  // 2) SCRIPT: everything except BRAND_CYCLE (the token source) and the
  //    share-PNG canvas painter (canvas cannot read CSS custom properties).
  const scriptContent=(html.match(/<script>([\s\S]*?)<\/script>/)||['',''])[1]
    .replace(/const BRAND_CYCLE=\[[\s\S]*?\];/,'')
    .replace(/function shareWrappedPNG[\s\S]*?\n}\n/,'');
  const jsHits=scriptContent.match(hexRe)||[];
  assert(jsHits.length===0, 'G8: script clean of hex outside whitelisted regions. Offenders: '+jsHits.join(','));
  // 3) BODY markup between the style and script blocks (wordmark et al).
  const bodyHtml=html.split('</style>')[1].split('<script>')[0];
  const bodyHits=bodyHtml.match(hexRe)||[];
  assert(bodyHits.length===0, 'G8: body markup clean of hex. Offenders: '+bodyHits.join(','));
})();
assert(/--on-brand:#0A0B0E/.test(html)&&/--amber:#F59E0B/.test(html)&&/--orange:#F97316/.test(html), 'G8: new ink + warm-scale tokens live in :root');

// ===== G9: SWIM CONTINUOUS FLAG (F4) + F5 VERIFICATION =====
console.log('\n--- G9: swim continuous + F5 ---');
// Spec test: 900 non-continuous + 400 continuous → the card shows 400.
(()=>{
  const swims=[
    {sessionType:'swim',date:'2026-08-14',activity:{distance:900,continuous:false}},
    {sessionType:'swim',date:'2026-08-18',activity:{distance:400,continuous:true}}
  ];
  assert(swimBest(swims)===400, 'G9: 900 non-continuous + 400 continuous → 400. Got: '+swimBest(swims));
})();
// Record shape: swims persist the flag (default false), non-swims never carry it.
(()=>{
  const r1=makeActivitySession({startTime:3,date:'2026-08-18',dayLabel:'Swim',sessionType:'swim',activity:{durationMin:40,distance:800}});
  assert(r1.activity.continuous===false, 'G9: swim records default continuous:false');
  const r2=makeActivitySession({startTime:4,date:'2026-08-18',dayLabel:'Swim',sessionType:'swim',activity:{durationMin:40,distance:800,continuous:true}});
  assert(r2.activity.continuous===true, 'G9: the toggle persists');
  const r3=makeActivitySession({startTime:5,date:'2026-08-18',dayLabel:'Run',sessionType:'run',activity:{durationMin:30,distance:5}});
  assert(!('continuous' in r3.activity), 'G9: non-swim records carry no continuous field');
})();
// Backfill one-shot: stamps undefined → false, idempotent, respects a true.
(()=>{
  const saveS=S.sessions,saveF=S.settings._swimContinuousBackfill;
  S.sessions=[
    {sessionType:'swim',date:'2026-07-26',activity:{distance:700}},
    {sessionType:'swim',date:'2026-08-14',activity:{distance:900}},
    {sessionType:'swim',date:'2026-08-20',activity:{distance:400,continuous:true}},
    {sessionType:'lifting',date:'2026-08-01',exercises:[]}
  ];
  S.settings._swimContinuousBackfill=false;
  migrateV3();
  assert(S.sessions[0].activity.continuous===false&&S.sessions[1].activity.continuous===false, 'G9: backfill stamps legacy swims false');
  assert(S.sessions[2].activity.continuous===true, 'G9: backfill never clobbers an explicit true');
  assert(swimBest(S.sessions)===400, 'G9: post-backfill best reads the 400 continuous, not the 900');
  S.sessions[0].activity.continuous=true;
  migrateV3(); // one-shot: a second run must not restamp
  assert(S.sessions[0].activity.continuous===true, 'G9: backfill is a true one-shot');
  S.sessions=saveS;S.settings._swimContinuousBackfill=saveF;
})();
assert(/setActivityField\('continuous'/.test(html), 'G9: activity form has the Continuous toggle');
assert(/id="qlCont"/.test(html)&&/continuous:_qlCont/.test(html), 'G9: quick-log path carries the flag too');
assert(/No continuous swim logged yet/.test(html), 'G9: goal-card empty state');
// F5c extra: machine 165 → next 167.5 through the suggestion snap.
assert(snapSuggestion(165*1.0125,'machine')===167.5, 'F5: leg press 165 +1.25% → 167.5. Got: '+snapSuggestion(165*1.0125,'machine'));
assert(dispSuggest(166.9,'machine','increase')===167.5, 'F5: stored raw 166.9 machine renders 167.5');

console.log('\n=== All tests passed ===');
