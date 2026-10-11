/*
  いろいろ もんだい：しきを かんがえる 10パターン（もんだいの なかみ だけ を つくる）
  ------------------------------------------------------------
  ・しきに でる かず も こたえ も、ぜんぶ 1〜10（0は つかわない）
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

  // 1〜10 だけで できる しき ぜんぶ（たしざん 45こ・ひきざん 45こ）。こたえ 1〜10 の どれも 9こ ずつ ある
  const EXPRS = [];
  for(let a = 1; a <= 10; a++) for(let b = 1; b <= 10; b++){
    if(a + b <= 10) EXPRS.push({ a, op: "+", b, v: a + b });
    if(a - b >= 1) EXPRS.push({ a, op: "-", b, v: a - b });
  }
  const ADDS = EXPRS.filter(e => e.op === "+"), SUBS = EXPRS.filter(e => e.op === "-");
  const text = e => `${e.a} ${opText(e.op)} ${e.b}`;
  const byValue = v => EXPRS.filter(e => e.v === v);
  // おなじ しき（かずを いれかえた だけ の たしざん も おなじ と みる）
  const sameExpr = (x, y) => x.op === y.op && ((x.a === y.a && x.b === y.b) || (x.op === "+" && x.a === y.b && x.b === y.a));
  const randomExpr = () => pick(Math.random() < 0.5 ? ADDS : SUBS);
  // こたえを ±1〜2 ずらした まちがい（1〜10 の なか）
  const offBy = v => pick([-2, -1, 1, 2].map(d => v + d).filter(x => x >= 1 && x <= 10));
  const inRange = (v, d) => d.map(x => v + x).filter(x => x >= 1 && x <= 10);

  const NAMES = ["みー", "ころ"];
  const ITEMS = ["どんぐり", "あめ", "いちご", "みかん", "おにぎり", "くり"];
  const EDIBLE = ["あめ", "いちご", "みかん", "おにぎり", "くり"];
  // おかいもの の しなもの（ひらがなで かける もの。え が あれば そえる）
  const GOODS = [["あめ", "🍬"], ["がむ", ""], ["らむね", ""], ["ちょこ", "🍫"], ["せんべい", "🍘"], ["くっきー", "🍪"], ["ぐみ", ""], ["ぷりん", "🍮"], ["どーなつ", "🍩"], ["あいす", "🍦"]];

  const Patterns = {
    EXPRS, text, opText,

    // 1. ひきざんの あなあき：a − ? = c ／ ? − b = c
    submiss(){
      const e = pick(SUBS), right = Math.random() < 0.5;   // right：ひく かず を きく
      return { key: `submiss:${e.a}-${e.b}:${right ? "R" : "L"}`, a: e.a, b: e.b, c: e.v, form: right ? "R" : "L", ans: right ? e.b : e.a };
    },

    // 2. おなじ こたえは どれ？：もとの しきと おなじ こたえの しきを 3つ から えらぶ
    same(){
      const base = pick(EXPRS);
      const right = pick(byValue(base.v).filter(e => !sameExpr(e, base)));
      const wrong = shuffle(inRange(base.v, [-3, -2, -1, 1, 2, 3])).slice(0, 2).map(v => pick(byValue(v)));
      return { key: `same:${text(base)}>${text(right)}`, base, v: base.v, right, choices: shuffle([right, ...wrong]) };
    },

    // 3. こたえが □に なるのは？：こたえが n に なる しきを 3つ から えらぶ（まちがいは n から ±1〜2）
    target(){
      const n = rnd(2, 10), right = pick(byValue(n));
      const wrong = shuffle(inRange(n, [-2, -1, 1, 2])).slice(0, 2).map(v => pick(byValue(v)));
      return { key: `target:${n}:${text(right)}`, n, right, choices: shuffle([right, ...wrong]) };
    },

    // 4. しきの おおきさくらべ：2つの しきの こたえは かならず ちがう。lv が あがると ちかい こたえに なる
    exprcmp(lv){
      const maxDiff = [9, 6, 3, 2][lv || 0];
      for(;;){
        const x = pick(EXPRS), y = pick(EXPRS), d = Math.abs(x.v - y.v);
        if(d === 0 || d > maxDiff) continue;
        const big = Math.random() < 0.5, right = (x.v > y.v) === big ? x : y;
        return { key: `cmp:${text(x)}/${text(y)}:${big ? "b" : "s"}`, pair: [x, y], big, right };
      }
    },

    // 5. ＋かな？ −かな？：a □ b = c
    sign(){
      const plus = Math.random() < 0.5, e = pick(plus ? ADDS : SUBS);
      return { key: `sign:${e.a}?${e.b}=${e.v}`, a: e.a, b: e.b, c: e.v, ans: e.op };
    },

    // 6. あってる？ まちがい？：こたえまで かいた しき が ただしいか
    truefalse(){
      const e = randomExpr(), ok = Math.random() < 0.5, shown = ok ? e.v : offBy(e.v);
      return { key: `tf:${text(e)}=${shown}`, e, shown, ok };
    },

    // 7. しきを えらぼう：おはなしに あう しき（a + b ／ a − b）を えらぶ。a > b、a + b は 10 まで
    pickexpr(){
      const scene = pick(["add", "left", "diff"]);
      const b = rnd(1, 4), a = rnd(b + 1, 10 - b);
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
      const x = rnd(1, 9), y = rnd(1, 10 - x), z = x + y;
      const answers = op === "+" ? [[x, y, z], [y, x, z]] : [[z, x, y], [z, y, x]];
      return { key: `make:${op}:${[x, y].sort((p, q) => p - q).join(",")}`, op, cards: shuffle([x, y, z]),
        answers: x === y ? [answers[0]] : answers,
        check: arr => arr.length === 3 && (op === "+" ? arr[0] + arr[1] === arr[2] : arr[0] - arr[1] === arr[2]) };
    },

    // 9. おかいもの：もっている おかね（5〜10えん。はんぶんは 10えん）と ねだん から おつり
    kaimono(){
      const money = Math.random() < 0.5 ? 10 : rnd(5, 9), price = rnd(1, money - 1);
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
