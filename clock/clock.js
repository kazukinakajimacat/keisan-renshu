/*
  とけい（アナログ時計）の 共通パーツ
  ------------------------------------------------------------
  ・ClockMath … 時刻の計算（0〜719分に変換してから計算する）
  ・clockSVG  … 時計の絵（表示だけ）
  ・Clock     … 針を動かせる時計（ドラッグ＋ボタン）
  ブラウザでは window.ClockMath / window.clockSVG / window.Clock、
  node（テスト）では require("./clock.js") で ClockMath を使う
*/
(function(root){
  "use strict";

  /* ---------- 時刻の計算 ---------- */
  const ClockMath = {
    // 12時間表記の 時刻 → 0〜719分（12時は0として扱う）
    toTotal(h, m){ return ((h % 12) * 60 + m + 720) % 720; },
    // 0〜719分 → 時刻（0時相当は 12時と表示する）
    fromTotal(t){ t = ((t % 720) + 720) % 720; const h = Math.floor(t / 60); return { h: h === 0 ? 12 : h, m: t % 60 }; },
    add(h, m, delta){ return ClockMath.fromTotal(ClockMath.toTotal(h, m) + delta); },
    // 短針：時だけでなく 分に合わせて 進む
    hourAngle(h, m){ return (h % 12) * 30 + m * 0.5; },
    minuteAngle(m){ return m * 6; },
    same(a, b){ return ClockMath.toTotal(a.h, a.m) === ClockMath.toTotal(b.h, b.m); },
    // ひょうじ：「3じ」「3じ30ぷん」（ぷん／ふん の よみわけ）
    fmt(h, m){ return m === 0 ? `${h}じ` : `${h}じ${m}${ClockMath.funLabel(m)}`; },
    funLabel(m){ const d = m % 10; return (m === 0 || [1,3,4,6,8].includes(d) || d === 0) ? "ぷん" : "ふん"; }
  };

  /* ---------- 時計の絵 ---------- */
  // 数字は 1〜12 を すべて表示。短針は太く短い・長針は細く長い・中心に丸
  function clockSVG(h, m, opt){
    opt = opt || {};
    const size = opt.size || 240, cls = opt.cls || "";
    const ha = ClockMath.hourAngle(h, m), ma = ClockMath.minuteAngle(m);
    let ticks = "", nums = "";
    for(let i = 0; i < 60; i++){
      const big = i % 5 === 0, a = i * 6 * Math.PI / 180, r1 = big ? 84 : 88, r2 = 93;
      ticks += `<line x1="${(100 + r1 * Math.sin(a)).toFixed(2)}" y1="${(100 - r1 * Math.cos(a)).toFixed(2)}" x2="${(100 + r2 * Math.sin(a)).toFixed(2)}" y2="${(100 - r2 * Math.cos(a)).toFixed(2)}" class="ck-tick${big ? " big" : ""}"/>`;
    }
    for(let n = 1; n <= 12; n++){
      const a = n * 30 * Math.PI / 180, r = 70;
      nums += `<text x="${(100 + r * Math.sin(a)).toFixed(2)}" y="${(100 - r * Math.cos(a)).toFixed(2)}" class="ck-num">${n}</text>`;
    }
    return `<svg class="ck ${cls}" viewBox="0 0 200 200" width="${size}" height="${size}" role="img" aria-label="${ClockMath.fmt(h, m)}">
      <circle cx="100" cy="100" r="96" class="ck-face"/>${ticks}${nums}
      <g class="ck-hand-h" transform="rotate(${ha} 100 100)"><line x1="100" y1="112" x2="100" y2="52" /></g>
      <g class="ck-hand-m" transform="rotate(${ma} 100 100)"><line x1="100" y1="116" x2="100" y2="22" /></g>
      <circle cx="100" cy="100" r="7" class="ck-pin"/></svg>`;
  }

  /* ---------- 針を動かせる時計 ---------- */
  // step：長針が とまる きざみ（分）。onChange({h,m}) で 変わるたびに しらせる
  function Clock(el, opt){
    opt = opt || {};
    this.el = el; this.step = opt.step || 10; this.size = opt.size || 260;
    this.h = opt.h || 12; this.m = opt.m || 0; this.onChange = opt.onChange || function(){};
    this.render();
    const svgPoint = ev => {
      const r = this.el.querySelector("svg").getBoundingClientRect();
      return { x: (ev.clientX - r.left) / r.width * 200 - 100, y: (ev.clientY - r.top) / r.height * 200 - 100 };
    };
    const angleOf = p => (Math.atan2(p.x, -p.y) * 180 / Math.PI + 360) % 360;
    const diff = (a, b) => { const d = Math.abs(a - b) % 360; return Math.min(d, 360 - d); };
    let drag = null;
    el.addEventListener("pointerdown", ev => {
      const p = svgPoint(ev), dist = Math.hypot(p.x, p.y);
      if(dist > 100) return;
      const a = angleOf(p);
      // ちかい 針を つかむ（近さが おなじなら 中心から の きょりで えらぶ）
      const dh = diff(a, ClockMath.hourAngle(this.h, this.m)), dm = diff(a, ClockMath.minuteAngle(this.m));
      drag = (dh + (dist > 60 ? 25 : 0)) < (dm + (dist < 55 ? 25 : 0)) ? "h" : "m";
      el.setPointerCapture(ev.pointerId); ev.preventDefault();
      this.dragTo(drag, a);
    });
    el.addEventListener("pointermove", ev => { if(drag) this.dragTo(drag, angleOf(svgPoint(ev))); });
    const end = () => { drag = null; };
    el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end);
  }
  Clock.prototype.dragTo = function(which, a){
    if(which === "m"){
      let m = Math.round(a / 6 / this.step) * this.step % 60;
      // 12を こえたら 時も すすむ／もどる（ほんものの 時計と おなじ）
      if(this.m >= 45 && m <= 15 && m !== this.m) this.h = this.h % 12 + 1;
      else if(this.m <= 15 && m >= 45 && m !== this.m) this.h = (this.h + 10) % 12 + 1;
      this.set(this.h, m);
    }else{
      // 短針は 分の ぶんだけ 先に すすんで いるので、その ぶんを ひいてから 時を きめる
      let h = Math.round(((a - this.m * 0.5) + 360) % 360 / 30) % 12; if(h === 0) h = 12;
      this.set(h, this.m);
    }
  };
  Clock.prototype.set = function(h, m){
    if(h === this.h && m === this.m && this.el.firstChild) return;
    this.h = h; this.m = m; this.render(); this.onChange({ h, m });
  };
  Clock.prototype.addHour = function(d){ const t = ClockMath.add(this.h, this.m, d * 60); this.set(t.h, t.m); };
  Clock.prototype.addMinute = function(d){ const t = ClockMath.add(this.h, this.m, d * this.step); this.set(t.h, t.m); };
  Clock.prototype.render = function(){ this.el.innerHTML = clockSVG(this.h, this.m, { size: this.size, cls: "ck-live" }); };

  root.ClockMath = ClockMath; root.clockSVG = clockSVG; root.Clock = Clock;
  if(typeof module !== "undefined" && module.exports) module.exports = { ClockMath };
})(typeof window !== "undefined" ? window : globalThis);
