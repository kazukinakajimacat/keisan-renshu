/*
  いろいろ もんだい：しきを かんがえる 10パターン（もんだいの なかみ だけ を つくる）
  ------------------------------------------------------------
  ・しきに でる かず も こたえ も、ぜんぶ 1〜10（0は つかわない）
  ・Patterns.use(30) の あいだ は 30まで：1けた±1けた（くりあがり・くりさがり あり）と 2けた±1けた。
    かずも こたえも 1〜30、ひく かず・たす かず は 1けた（2けた どうし は ださない）。use(10) で もとに もどる
  ・Patterns.use(30, けた) の あいだ は、30まで の なかを けた で わけた しき だけ（けた は "11"・"12"・"22"。digCls を みる）
  ・せんたくしは ならびを シャッフルし、おなじ ひょうじ・おなじ あたい に ならない
  ・せいかいは かならず 1つ（「しきを つくろう」だけ は 2とおり まで ある）
  がめん（HTML）は index.html で くみたてる。ここは かずと ことば だけ。
  ブラウザでは window.Patterns、node（テスト）では require("./patterns.js")
*/
(function(root){
  "use strict";

  const rnd = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { const x = [...a]; for(let i = x.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };
  const opText = o => o === "+" ? "+" : "−";

  // つかう しき の あつまり（use で きりかえる）
  //   10：1〜10 だけで できる しき ぜんぶ（たしざん 45こ・ひきざん 45こ）。こたえ 1〜10 の どれも 9こ ずつ ある
  //   30：1けた±1けた と 2けた±1けた（たしざん 225こ・ひきざん 225こ）
  //   30:11・30:12・30:22：けた で わけた しき（1けた＋1けた・1けた＋2けた・2けた＋2けた）
  // けた の しゅるい：たしざん は a と b、ひきざん は「ひく かず b」と「こたえ」で きめる（13 − 7 は 6 + 7 の なかま で "11"）。
  // ひく かず が 2けた の ひきざん は "22"。たしざん の 1けた ＋ 2けた（3 + 15）は いままで どおり ださない（null）
  function digCls(e){
    const v = e.v !== undefined ? e.v : e.ans, x = e.op === "+" ? e.a : v, y = e.b;
    if(y >= 10) return e.op === "-" || x >= 10 ? "22" : null;
    return x <= 9 ? "11" : "12";
  }
  function makePool(max, cls){
    const all = [];
    if(cls){
      for(let a = 1; a < max; a++) for(let b = 1; a + b <= max; b++){ const e = { a, op: "+", b, v: a + b }; if(digCls(e) === cls) all.push(e); }
      for(let a = 2; a <= max; a++) for(let b = 1; b < a; b++){ const e = { a, op: "-", b, v: a - b }; if(digCls(e) === cls) all.push(e); }
    }else if(max === 10){
      for(let a = 1; a <= 10; a++) for(let b = 1; b <= 10; b++){
        if(a + b <= 10) all.push({ a, op: "+", b, v: a + b });
        if(a - b >= 1) all.push({ a, op: "-", b, v: a - b });
      }
    }else{
      for(let a = 1; a < max; a++) for(let b = 1; b <= 9 && a + b <= max; b++) all.push({ a, op: "+", b, v: a + b });
      for(let a = 2; a <= max; a++) for(let b = 1; b <= 9 && b < a; b++) all.push({ a, op: "-", b, v: a - b });
    }
    return { max, cls: cls || null, EXPRS: all, ADDS: all.filter(e => e.op === "+"), SUBS: all.filter(e => e.op === "-") };
  }
  const POOLS = { 10: makePool(10), 30: makePool(30), "30:11": makePool(30, "11"), "30:12": makePool(30, "12"), "30:22": makePool(30, "22") };
  let P = POOLS[10];
  const EXPRS = POOLS[10].EXPRS;
  const text = e => `${e.a} ${opText(e.op)} ${e.b}`;
  const byValue = v => P.EXPRS.filter(e => e.v === v);
  // おなじ しき（かずを いれかえた だけ の たしざん も おなじ と みる）
  const sameExpr = (x, y) => x.op === y.op && ((x.a === y.a && x.b === y.b) || (x.op === "+" && x.a === y.b && x.b === y.a));
  const randomExpr = () => pick(Math.random() < 0.5 ? P.ADDS : P.SUBS);
  // こたえを ±1〜2 ずらした まちがい（1〜max の なか）
  const offBy = v => pick([-2, -1, 1, 2].map(d => v + d).filter(x => x >= 1 && x <= P.max));
  const inRange = (v, d) => d.map(x => v + x).filter(x => x >= 1 && x <= P.max);

  const NAMES = ["みー", "ころ"];
  const ITEMS = ["どんぐり", "あめ", "いちご", "みかん", "おにぎり", "くり"];
  const EDIBLE = ["あめ", "いちご", "みかん", "おにぎり", "くり"];
  // おかいもの の しなもの（ひらがなで かける もの。え が あれば そえる）
  const GOODS = [["あめ", "🍬"], ["がむ", ""], ["らむね", ""], ["ちょこ", "🍫"], ["せんべい", "🍘"], ["くっきー", "🍪"], ["ぐみ", ""], ["ぷりん", "🍮"], ["どーなつ", "🍩"], ["あいす", "🍦"]];

  const Patterns = {
    EXPRS, POOLS, text, opText, digCls,
    // 10まで／30まで（と けた）を きりかえる（index.html が もんだいを つくる まえに よぶ）
    use(max, cls){ P = max === 30 && POOLS[`30:${cls}`] || POOLS[max === 30 ? 30 : 10]; return P.max; },
    get cls(){ return P.cls; },
    get max(){ return P.max; },

    // 1. ひきざんの あなあき：a − ? = c ／ ? − b = c
    submiss(){
      const e = pick(P.SUBS), right = Math.random() < 0.5;   // right：ひく かず を きく
      return { key: `submiss:${e.a}-${e.b}:${right ? "R" : "L"}`, a: e.a, b: e.b, c: e.v, form: right ? "R" : "L", ans: right ? e.b : e.a };
    },

    // 2. おなじ こたえは どれ？：もとの しきと おなじ こたえの しきを 3つ から えらぶ
    //    けた で わけた ときは、その なかに ない こたえ も ある ので、つくれる まで えらびなおす（10まで・30まで は いちどで きまる）
    same(){
      for(;;){
        const base = pick(P.EXPRS);
        const rights = byValue(base.v).filter(e => !sameExpr(e, base));
        const wv = shuffle(inRange(base.v, [-3, -2, -1, 1, 2, 3])).filter(v => byValue(v).length);
        if(!rights.length || wv.length < 2) continue;
        const right = pick(rights), wrong = wv.slice(0, 2).map(v => pick(byValue(v)));
        return { key: `same:${text(base)}>${text(right)}`, base, v: base.v, right, choices: shuffle([right, ...wrong]) };
      }
    },

    // 3. こたえが □に なるのは？：こたえが n に なる しきを 3つ から えらぶ（まちがいは n から ±1〜2）
    target(){
      for(;;){
        const n = rnd(2, P.max), rights = byValue(n);
        const wv = shuffle(inRange(n, [-2, -1, 1, 2])).filter(v => byValue(v).length);
        if(!rights.length || wv.length < 2) continue;
        const right = pick(rights), wrong = wv.slice(0, 2).map(v => pick(byValue(v)));
        return { key: `target:${n}:${text(right)}`, n, right, choices: shuffle([right, ...wrong]) };
      }
    },

    // 4. しきの おおきさくらべ：2つの しきの こたえは かならず ちがう。lv が あがると ちかい こたえに なる
    exprcmp(lv){
      const maxDiff = (P.max === 30 ? [20, 10, 4, 2] : [9, 6, 3, 2])[lv || 0];
      for(;;){
        const x = pick(P.EXPRS), y = pick(P.EXPRS), d = Math.abs(x.v - y.v);
        if(d === 0 || d > maxDiff) continue;
        const big = Math.random() < 0.5, right = (x.v > y.v) === big ? x : y;
        return { key: `cmp:${text(x)}/${text(y)}:${big ? "b" : "s"}`, pair: [x, y], big, right };
      }
    },

    // 5. ＋かな？ −かな？：a □ b = c
    sign(){
      const plus = Math.random() < 0.5, e = pick(plus ? P.ADDS : P.SUBS);
      return { key: `sign:${e.a}?${e.b}=${e.v}`, a: e.a, b: e.b, c: e.v, ans: e.op };
    },

    // 6. あってる？ まちがい？：こたえまで かいた しき が ただしいか
    truefalse(){
      const e = randomExpr(), ok = Math.random() < 0.5, shown = ok ? e.v : offBy(e.v);
      return { key: `tf:${text(e)}=${shown}`, e, shown, ok };
    },

    // 7. しきを えらぼう：おはなしに あう しき（a + b ／ a − b）を えらぶ。a > b、a + b は 10 まで（30まで は b が 1けた、a は 10〜）
    pickexpr(){
      const scene = pick(["add", "left", "diff"]);
      // けた で わけた とき は、ばめん に あう しき（たしざん は a > b）を その なか から えらぶ
      const ce = P.cls ? pick(scene === "add" ? P.ADDS.filter(e => e.a > e.b) : P.SUBS) : null;
      const b = ce ? ce.b : P.max === 30 ? rnd(1, 9) : rnd(1, 4);
      const a = ce ? ce.a : P.max === 30 ? rnd(Math.max(b + 1, 10), P.max - b) : rnd(b + 1, 10 - b);
      const P1 = pick(NAMES), P2 = NAMES.find(n => n !== P1), it = pick(ITEMS);
      let story, ask;
      if(scene === "add"){
        story = Math.random() < 0.5
          ? `${P1}は ${it}を ${a}こ もっています。${P2}から ${b}こ もらいました。`
          : `かごに ${it}が ${a}こ はいっています。${P1}が ${b}こ いれました。`;
        ask = "ぜんぶで なんこ？";
      }else if(scene === "left"){
        story = EDIBLE.includes(it) && Math.random() < 0.5
          ? `${P1}は ${it}を ${a}こ もっています。${b}こ たべました。`
          : `${P1}は ${it}を ${a}こ もっています。${P2}に ${b}こ あげました。`;
        ask = "のこりは なんこ？";
      }else{
        story = `${P1}は ${it}を ${a}こ、${P2}は ${b}こ もっています。`;
        ask = `${P1}は ${P2}より なんこ おおい？`;
      }
      const op = scene === "add" ? "+" : "-";
      const plusE = { a, op: "+", b, v: a + b }, minusE = { a, op: "-", b, v: a - b };
      return { key: `pick:${scene}:${a},${b}`, scene, a, b, story, ask, op, right: op === "+" ? plusE : minusE, choices: shuffle([plusE, minusE]) };
    },

    // 8. しきを つくろう：3つの かずを □ + □ = □ ／ □ − □ = □ に ならべる
    //    たしざんは 2 + 3 = 5 も 3 + 2 = 5 も、ひきざんは 5 − 2 = 3 も 5 − 3 = 2 も せいかい
    make(){
      const op = Math.random() < 0.5 ? "+" : "-";
      // 30まで：y は 1けた、x は 1〜（30 − y）。さいしょに みせる こたえ は「1けた を たす・ひく」かたち
      // けた で わけた とき：その なかの しき から（ひきざん z − y = x の y は ひく かず）
      const ce = P.cls ? pick(op === "+" ? P.ADDS : P.SUBS) : null;
      const y30 = rnd(1, 9);
      const x = ce ? (op === "+" ? ce.a : ce.v) : P.max === 30 ? rnd(1, P.max - y30) : rnd(1, 9);
      const y = ce ? ce.b : P.max === 30 ? y30 : rnd(1, 10 - x), z = x + y;
      const answers = op === "+" ? [[x, y, z], [y, x, z]] : P.max === 30 ? [[z, y, x], [z, x, y]] : [[z, x, y], [z, y, x]];
      return { key: `make:${op}:${[x, y].sort((p, q) => p - q).join(",")}`, op, cards: shuffle([x, y, z]),
        answers: x === y ? [answers[0]] : answers,
        check: arr => arr.length === 3 && (op === "+" ? arr[0] + arr[1] === arr[2] : arr[0] - arr[1] === arr[2]) };
    },

    // 9. おかいもの：もっている おかね（5〜10えん。はんぶんは 10えん）と ねだん から おつり
    kaimono(){
      // 30まで：もっている おかね は 10〜30えん（はんぶんは 10・20・30えん）、ねだん は 1〜9えん
      // けた で わけた とき：その なかの ひきざん（もっている おかね − ねだん）。はんぶんは ちょうど の おかね（10・20・30えん）が あれば それ
      if(P.cls){
        const even = P.SUBS.filter(e => e.a % 10 === 0), e = pick(even.length && Math.random() < 0.5 ? even : P.SUBS);
        const [name, emoji] = pick(GOODS);
        return { key: `kaimono:${e.a}-${e.b}`, money: e.a, price: e.b, ans: e.v, name, emoji };
      }
      const money = P.max === 30 ? (Math.random() < 0.5 ? pick([10, 20, 30]) : rnd(11, 29)) : Math.random() < 0.5 ? 10 : rnd(5, 9);
      const price = P.max === 30 ? rnd(1, 9) : rnd(1, money - 1);
      const [name, emoji] = pick(GOODS);
      return { key: `kaimono:${money}-${price}`, money, price, ans: money - price, name, emoji };
    },

    // 10. まちがいを なおそう：こたえが まちがって いる しき を みせて、ただしい こたえを えらぶ
    fix(){
      const e = randomExpr(), wrong = offBy(e.v);
      return { key: `fix:${text(e)}=${wrong}`, e, wrong, ans: e.v };
    }
  };

  root.Patterns = Patterns;
  if(typeof module !== "undefined" && module.exports) module.exports = { Patterns };
})(typeof window !== "undefined" ? window : globalThis);
