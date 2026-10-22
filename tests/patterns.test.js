// いろいろ もんだい：あたらしい 10パターンの テスト（実行：node tests/patterns.test.js）
// 1パターン 5000もん つくって、はんいがい の かず・せいかいが 2つ いじょう・おなじ せんたくし が ない ことを たしかめる
const assert = require("node:assert/strict");
const { Patterns: P } = require("../drill/patterns.js");

const N = 5000;
const in10 = v => Number.isInteger(v) && v >= 1 && v <= 10;
const val = e => e.op === "+" ? e.a + e.b : e.a - e.b;
const okExpr = (e, label) => {
  assert.ok(in10(e.a) && in10(e.b), `${label}: かずが 1〜10 では ない ${JSON.stringify(e)}`);
  assert.ok(["+", "-"].includes(e.op), label);
  assert.equal(e.v, val(e), `${label}: v が ちがう`);
  assert.ok(in10(e.v), `${label}: こたえが 1〜10 では ない ${JSON.stringify(e)}`);
};
const swapped = (x, y) => x.op === y.op && ((x.a === y.a && x.b === y.b) || (x.op === "+" && x.a === y.b && x.b === y.a));
// せんたくし：ひょうじも あたいも かぶらない
const distinct = (choices, label) => {
  const texts = choices.map(P.text), vals = choices.map(e => e.v);
  assert.equal(new Set(texts).size, choices.length, `${label}: おなじ ひょうじ ${texts}`);
  assert.equal(new Set(vals).size, choices.length, `${label}: おなじ あたい ${texts}`);
};
// ひらがな と すうじ だけ（かんじ・カタカナ は つかわない。「ー」は なまえ に つかう）
const hira = (s, label) => assert.ok(/^[ぁ-ゖー0-9 　、。？！]+$/.test(s), `${label}: ひらがな と すうじ いがい が ある「${s}」`);
const count = {};
const tally = (k, v) => { (count[k] = count[k] || {})[v] = (count[k][v] || 0) + 1; };
const near = (k, v, want, tol = 0.04) => { const got = (count[k][v] || 0) / N; assert.ok(Math.abs(got - want) < tol, `${k}/${v} の わりあい ${got.toFixed(3)}（めやす ${want}）`); };
const firstPos = {};   // せいかいの いち が かたよって いない（シャッフル されて いる）
const pos = (k, i, n) => { firstPos[k] = firstPos[k] || Array(n).fill(0); firstPos[k][i]++; };

assert.equal(P.EXPRS.length, 90);
P.EXPRS.forEach(e => okExpr(e, "EXPRS"));
for(let v = 1; v <= 10; v++) assert.equal(P.EXPRS.filter(e => e.v === v).length, 9, `こたえ ${v} の しき`);

for(let i = 0; i < N; i++){
  // 1. ひきざんの あなあき
  { const p = P.submiss();
    assert.ok(p.a >= 2 && p.a <= 10 && in10(p.b) && in10(p.c) && in10(p.ans), "submiss はんい");
    assert.equal(p.a - p.b, p.c);
    assert.equal(p.ans, p.form === "R" ? p.b : p.a);
    // こたえは 1つ だけ
    const sol = []; for(let x = 1; x <= 10; x++) if(p.form === "R" ? p.a - x === p.c : x - p.b === p.c) sol.push(x);
    assert.deepEqual(sol, [p.ans]);
    tally("submiss", p.form); }

  // 2. おなじ こたえは どれ？
  { const p = P.same();
    okExpr(p.base, "same"); assert.equal(p.choices.length, 3); p.choices.forEach(e => okExpr(e, "same"));
    distinct(p.choices, "same");
    assert.equal(p.choices.filter(e => e.v === p.base.v).length, 1, "same: せいかいは 1つ");
    assert.ok(p.choices.includes(p.right) && p.right.v === p.base.v);
    p.choices.forEach(e => assert.ok(!swapped(e, p.base), `same: もとの しき と おなじ ${P.text(e)}`));
    pos("same", p.choices.indexOf(p.right), 3); tally("sameOp", p.right.op); }

  // 3. こたえが □に なるのは？
  { const p = P.target();
    assert.ok(p.n >= 2 && p.n <= 10); assert.equal(p.choices.length, 3); p.choices.forEach(e => okExpr(e, "target"));
    distinct(p.choices, "target");
    assert.equal(p.choices.filter(e => e.v === p.n).length, 1, "target: せいかいは 1つ");
    assert.equal(p.right.v, p.n);
    p.choices.filter(e => e !== p.right).forEach(e => assert.ok([1, 2].includes(Math.abs(e.v - p.n)), "target: まちがいは ±1〜2"));
    pos("target", p.choices.indexOf(p.right), 3); tally("targetN", p.n); }

  // 4. しきの おおきさくらべ
  for(const lv of [0, 1, 2, 3]){ const p = P.exprcmp(lv);
    assert.equal(p.pair.length, 2); p.pair.forEach(e => okExpr(e, "exprcmp")); distinct(p.pair, "exprcmp");
    const [x, y] = p.pair, want = p.big ? (x.v > y.v ? x : y) : (x.v < y.v ? x : y);
    assert.equal(p.right, want);
    if(lv === 0){ pos("exprcmp", p.pair.indexOf(p.right), 2); tally("exprcmp", p.big ? "big" : "small"); } }

  // 5. ＋かな？ −かな？
  { const p = P.sign();
    assert.ok(in10(p.a) && in10(p.b) && in10(p.c));
    const fits = ["+", "-"].filter(o => (o === "+" ? p.a + p.b : p.a - p.b) === p.c);
    assert.deepEqual(fits, [p.ans], "sign: はいる きごう は 1つ");
    tally("sign", p.ans); }

  // 6. あってる？ まちがい？
  { const p = P.truefalse();
    okExpr(p.e, "truefalse"); assert.ok(in10(p.shown));
    assert.equal(p.ok, p.shown === p.e.v);
    if(!p.ok) assert.ok([1, 2].includes(Math.abs(p.shown - p.e.v)), "truefalse: ±1〜2");
    tally("tf", p.ok ? "ok" : "ng"); tally("tfOp", p.e.op); }

  // 7. しきを えらぼう
  { const p = P.pickexpr();
    assert.ok(p.a > p.b && p.b >= 1 && p.a + p.b <= 10, "pickexpr: a > b、a + b は 10 まで");
    assert.equal(p.choices.length, 2); p.choices.forEach(e => okExpr(e, "pickexpr")); distinct(p.choices, "pickexpr");
    p.choices.forEach(e => assert.ok(e.a === p.a && e.b === p.b, "pickexpr: かずの じゅんばん"));
    assert.equal(p.op, p.scene === "add" ? "+" : "-"); assert.equal(p.right.op, p.op);
    hira(p.story, "pickexpr"); hira(p.ask, "pickexpr");
    // おはなしに でて くる かずの じゅんばん ＝ しきの じゅんばん
    assert.deepEqual((p.story.match(/\d+/g) || []).map(Number), [p.a, p.b], `pickexpr: ${p.story}`);
    assert.ok(/みー|ころ/.test(p.story + p.ask), "pickexpr: みー と ころ");
    pos("pickexpr", p.choices.indexOf(p.right), 2); tally("pickScene", p.scene); }

  // 8. しきを つくろう
  { const p = P.make();
    assert.equal(p.cards.length, 3); p.cards.forEach(v => assert.ok(in10(v), "make はんい"));
    // 6とおりの ならべかた の うち、せいかいは answers に ある もの だけ
    const perms = [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]].map(ix => ix.map(i => p.cards[i]));
    const good = [...new Set(perms.filter(p.check).map(a => a.join(",")))].sort();
    assert.deepEqual(good, [...new Set(p.answers.map(a => a.join(",")))].sort(), `make: ${p.cards} ${p.op}`);
    assert.ok(good.length >= 1 && good.length <= 2, "make: かならず つくれる");
    p.answers.forEach(a => assert.ok(p.check(a)));
    assert.ok(!p.check([]) && !p.check(p.cards.slice(0, 2)));
    tally("make", p.op); }

  // 9. おかいもの
  { const p = P.kaimono();
    assert.ok(p.money >= 5 && p.money <= 10 && in10(p.price) && p.price < p.money && in10(p.ans), "kaimono はんい");
    assert.equal(p.ans, p.money - p.price);
    hira(p.name, "kaimono");
    tally("money", p.money); }

  // 10. まちがいを なおそう
  { const p = P.fix();
    okExpr(p.e, "fix"); assert.ok(in10(p.wrong) && in10(p.ans));
    assert.equal(p.ans, p.e.v); assert.notEqual(p.wrong, p.ans, "fix: かならず まちがって いる");
    assert.ok([1, 2].includes(Math.abs(p.wrong - p.ans)), "fix: ±1〜2");
    tally("fixOp", p.e.op); }
}

// はんはん で でる もの
near("submiss", "R", 0.5); near("sign", "+", 0.5); near("tf", "ok", 0.5); near("tfOp", "+", 0.5);
near("make", "+", 0.5); near("fixOp", "+", 0.5); near("exprcmp", "big", 0.5); near("money", 10, 0.5);
for(const s of ["add", "left", "diff"]) near("pickScene", s, 1 / 3);
assert.ok(count.sameOp["+"] > N * 0.3 && count.sameOp["-"] > N * 0.3, "same: たしざん と ひきざん が まざる");
for(let n = 2; n <= 10; n++) assert.ok(count.targetN[n] > 0, `target: ${n} も でる`);
assert.ok(!count.targetN[1]);
for(let m = 5; m <= 9; m++) assert.ok(count.money[m] > 0, `kaimono: ${m}えん も でる`);
// せいかいの いち は かたよらない
for(const [k, arr] of Object.entries(firstPos)) arr.forEach((c, i) => assert.ok(Math.abs(c / N - 1 / arr.length) < 0.04, `${k}: せいかいが ${i + 1}ばんめ に かたよる（${c}）`));

// ---------- 30まで（P.use(30)） ----------
// 1けた±1けた・2けた±1けた だけ：かず も こたえ も 1〜30、たす かず・ひく かず は 1〜9（2けた どうし は ださない）
const in30 = v => Number.isInteger(v) && v >= 1 && v <= 30;
const ok30 = (e, label) => {
  assert.ok(in30(e.a) && Number.isInteger(e.b) && e.b >= 1 && e.b <= 9, `${label}: 30まで の かたち では ない ${JSON.stringify(e)}`);
  assert.equal(e.v, val(e), `${label}: v が ちがう`);
  assert.ok(in30(e.v), `${label}: こたえが 1〜30 では ない ${JSON.stringify(e)}`);
};
assert.equal(P.use(30), 30);
assert.equal(P.POOLS[30].EXPRS.length, 450);
P.POOLS[30].EXPRS.forEach(e => ok30(e, "EXPRS30"));
let big30 = 0;
for(let i = 0; i < N; i++){
  { const p = P.submiss(); ok30({a:p.a, op:"-", b:p.b, v:p.c}, "submiss30"); assert.equal(p.ans, p.form === "R" ? p.b : p.a);
    const sol = []; for(let x = 1; x <= 30; x++) if(p.form === "R" ? p.a - x === p.c : x - p.b === p.c) sol.push(x);
    assert.deepEqual(sol, [p.ans]); if(p.a > 10) big30++; }
  { const p = P.same(); ok30(p.base, "same30"); p.choices.forEach(e => ok30(e, "same30")); distinct(p.choices, "same30");
    assert.equal(p.choices.filter(e => e.v === p.base.v).length, 1); p.choices.forEach(e => assert.ok(!swapped(e, p.base))); }
  { const p = P.target(); assert.ok(p.n >= 2 && p.n <= 30); p.choices.forEach(e => ok30(e, "target30")); distinct(p.choices, "target30");
    assert.equal(p.choices.filter(e => e.v === p.n).length, 1); }
  for(const lv of [0, 1, 2, 3]){ const p = P.exprcmp(lv); p.pair.forEach(e => ok30(e, "exprcmp30")); distinct(p.pair, "exprcmp30");
    const [x, y] = p.pair; assert.equal(p.right, p.big ? (x.v > y.v ? x : y) : (x.v < y.v ? x : y)); }
  { const p = P.sign(); ok30({a:p.a, op:p.ans, b:p.b, v:p.c}, "sign30");
    assert.deepEqual(["+", "-"].filter(o => (o === "+" ? p.a + p.b : p.a - p.b) === p.c), [p.ans]); }
  { const p = P.truefalse(); ok30(p.e, "tf30"); assert.ok(in30(p.shown)); assert.equal(p.ok, p.shown === p.e.v); }
  { const p = P.pickexpr(); p.choices.forEach(e => ok30(e, "pick30")); distinct(p.choices, "pick30");
    assert.ok(p.a > p.b && p.a >= 10, "pick30: a は 10 いじょう"); hira(p.story, "pick30"); hira(p.ask, "pick30");
    assert.deepEqual((p.story.match(/\d+/g) || []).map(Number), [p.a, p.b]); }
  { const p = P.make(); p.cards.forEach(v => assert.ok(in30(v), "make30 はんい"));
    const perms = [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]].map(ix => ix.map(i => p.cards[i]));
    const good = [...new Set(perms.filter(p.check).map(a => a.join(",")))].sort();
    assert.deepEqual(good, [...new Set(p.answers.map(a => a.join(",")))].sort(), `make30: ${p.cards} ${p.op}`);
    const [a0, b0, c0] = p.answers[0]; ok30({a:a0, op:p.op, b:b0, v:c0}, "make30 さいしょの こたえ"); }
  { const p = P.kaimono(); ok30({a:p.money, op:"-", b:p.price, v:p.ans}, "kaimono30"); assert.ok(p.money >= 10); hira(p.name, "kaimono30"); }
  { const p = P.fix(); ok30(p.e, "fix30"); assert.ok(in30(p.wrong)); assert.notEqual(p.wrong, p.ans); }
}
assert.ok(big30 > N * 0.5, "30まで：10を こえる かず が でる");
assert.equal(P.use(10), 10);
{ const p = P.target(); assert.ok(p.n <= 10, "use(10) で もとに もどる"); }

console.log(`pattern tests: all passed（10パターン × ${N}もん、10まで と 30まで）`);
