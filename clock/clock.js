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

  /* ---------- 1日の 時間帯（なかまの 絵を 切りかえる） ----------
     端末の ローカル時刻を 分単位で 判定する。各区間は 終わりの 分の 59秒までを ふくむ
       6:00〜 9:00 朝寝起き ／ 9:01〜17:00 日中 ／ 17:01〜19:00 お風呂
      19:01〜21:00 眠い    ／ 21:01〜 5:59 布団で 寝ている（日付を またぐ） */
  const TimeSlot = {
    of(h, m){
      const t = h * 60 + m;
      if(t >= 360 && t <= 540) return "morning";
      if(t >= 541 && t <= 1020) return "day";
      if(t >= 1021 && t <= 1140) return "bath";
      if(t >= 1141 && t <= 1260) return "sleepy";
      return "night";
    },
    now(d){ d = d || new Date(); return TimeSlot.of(d.getHours(), d.getMinutes()); }
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

  /* ---------- ドラムロール（上下に スワイプして えらぶ） ---------- */
  // values：えらべる かず。まわりつづける ように 同じ ならびを くりかえして ならべる
  function Wheel(el, opt){
    this.el = el; this.values = opt.values; this.fmt = opt.format || (v => String(v));
    this.onChange = opt.onChange || function(){}; this.itemH = opt.itemH || 46;
    const n = this.values.length; this.reps = Math.max(5, Math.ceil(60 / n)); if(this.reps % 2 === 0) this.reps++;
    let html = "";
    for(let r = 0; r < this.reps; r++) this.values.forEach((v, i) => { html += `<div class="wh-item" data-i="${r * n + i}">${this.fmt(v)}</div>`; });
    el.classList.add("wh"); el.style.setProperty("--wh", this.itemH + "px");
    el.innerHTML = `<div class="wh-scroll" tabindex="0">${`<div class="wh-pad"></div>`}${html}<div class="wh-pad"></div></div><div class="wh-band" aria-hidden="true"></div>`;
    this.sc = el.querySelector(".wh-scroll"); this.items = [...el.querySelectorAll(".wh-item")];
    this.idx = -1;
    this.setValue(opt.value != null ? opt.value : this.values[0], false);
    let t = null;
    this.sc.addEventListener("scroll", () => { this.mark(); clearTimeout(t); t = setTimeout(() => this.settle(), 110); }, { passive: true });
    this.items.forEach(it => it.addEventListener("click", () => this.scrollToIndex(+it.dataset.i, true)));
    this.sc.addEventListener("keydown", e => {
      if(e.key === "ArrowUp"){ e.preventDefault(); this.scrollToIndex(this.idx - 1, true); }
      if(e.key === "ArrowDown"){ e.preventDefault(); this.scrollToIndex(this.idx + 1, true); }
    });
  }
  Wheel.prototype.centerIndex = function(){ return Math.round(this.sc.scrollTop / this.itemH); };
  Wheel.prototype.mark = function(){
    if(!this.el.isConnected) return;   // つぎの もんだいに かわった あとの ふるい ドラムは なにも しない
    const c = this.centerIndex();
    if(c === this.idx) return;
    this.items.forEach((it, i) => it.classList.toggle("on", i === c));
    this.idx = c;
    this.value = this.values[((c % this.values.length) + this.values.length) % this.values.length];
    this.onChange(this.value);
  };
  Wheel.prototype.scrollToIndex = function(i, smooth){
    i = Math.max(0, Math.min(this.items.length - 1, i));
    this.sc.scrollTo({ top: i * this.itemH, behavior: smooth ? "smooth" : "auto" });
    if(!smooth) this.mark();
  };
  // はしに ちかづいたら まんなかの おなじ かずへ こっそり もどす（ずっと まわせる）
  Wheel.prototype.settle = function(){
    if(!this.el.isConnected) return;
    const n = this.values.length, c = this.centerIndex(), mid = Math.floor(this.reps / 2) * n + (c % n);
    if(Math.abs(c - mid) >= n * 2) this.scrollToIndex(mid, false);
    else if(Math.abs(this.sc.scrollTop - c * this.itemH) > 1) this.scrollToIndex(c, true);
  };
  Wheel.prototype.setValue = function(v, smooth){
    const n = this.values.length, k = Math.max(0, this.values.indexOf(v));
    this.scrollToIndex(Math.floor(this.reps / 2) * n + k, smooth);
  };

  root.ClockMath = ClockMath; root.TimeSlot = TimeSlot; root.clockSVG = clockSVG; root.Clock = Clock; root.Wheel = Wheel;
  if(typeof module !== "undefined" && module.exports) module.exports = { ClockMath, TimeSlot };
})(typeof window !== "undefined" ? window : globalThis);
