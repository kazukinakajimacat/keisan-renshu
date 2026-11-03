/* ---------- かんじ（1ねんせい の 80じ を かく れんしゅう） ----------
   1もじ ずつ「なぞる → みて かく → みないで かく」の 3かい かく。1かい かくごとに 1もん と かぞえる
   （きょうの もくひょう・シール・なかま・あそぶ じかん は けいさん と おなじ ものを つかう）。
   ひとふで ずつ、かきじゅん・むき・かたち を みる。ちがったら その ふでだけ やりなおし（2かい ちがうと ヒント）。
   ならった かんじ は「おうちの方へ」で えらぶ（この たんまつ に のこる。きろくを けしても のこる）。
   かきじゅん の データ は kanji/strokes.js（KanjiVG・CC BY-SA 3.0） */
(function(){
  // れい の ことば：[ ] の ところを かんじで かく（もんだい の ぶんは ひらがな だけ）
  const EX = {
    "一":"[いち]がつ", "二":"[に]がつ", "三":"[さん]がつ", "四":"[し]がつ", "五":"[ご]がつ", "六":"[ろく]がつ",
    "七":"[しち]がつ", "八":"[はち]がつ", "九":"[く]がつ", "十":"[じゅう]がつ", "百":"[ひゃく]えん", "千":"[せん]えん", "円":"じゅう[えん]",
    "日":"[にち]ようび", "月":"まるい [つき]", "火":"[ひ]が もえる", "水":"[みず]を のむ", "木":"おおきな [き]", "金":"[きん]いろ", "土":"[つち]あそび",
    "山":"たかい [やま]", "川":"[かわ]で あそぶ", "田":"[た]んぼ", "石":"ちいさな [いし]", "林":"[はやし]の なか", "森":"[もり]の どうぶつ",
    "空":"あおい [そら]", "天":"[てん]き", "雨":"[あめ]が ふる", "気":"げん[き]", "夕":"[ゆう]がた", "花":"[はな]が さく",
    "草":"[くさ]を とる", "竹":"[たけ]とんぼ", "虫":"[むし]とり", "貝":"[かい]を ひろう", "犬":"[いぬ]の さんぽ",
    "人":"やさしい [ひと]", "子":"おとこの [こ]", "女":"[おんな]のこ", "男":"[おとこ]のこ", "王":"[おう]さま", "手":"[て]を あらう",
    "足":"[あし]が はやい", "目":"おおきな [め]", "耳":"うさぎの [みみ]", "口":"おおきな [くち]", "力":"[ちから]もち", "名":"[な]まえ",
    "白":"[しろ]い くも", "赤":"[あか]い りんご", "青":"[あお]い うみ", "大":"[おお]きい", "小":"[ちい]さい", "中":"はこの [なか]",
    "上":"やまの [うえ]", "下":"つくえの [した]", "左":"[ひだり]て", "右":"[みぎ]て", "正":"[ただ]しい", "早":"[はや]おき",
    "学":"しょう[がく]せい", "校":"がっ[こう]", "字":"[じ]を かく", "文":"[ぶん]を よむ", "本":"[ほん]を よむ", "先":"[せん]せい",
    "生":"いちねん[せい]", "年":"いち[ねん]せい", "町":"[まち]の こうえん", "村":"ちいさな [むら]", "車":"あかい [くるま]", "玉":"[たま]いれ",
    "糸":"あかい [いと]", "音":"おおきな [おと]", "見":"えを [み]る", "出":"そとに [で]る", "入":"おふろに [はい]る", "立":"まっすぐ [た]つ",
    "休":"[やす]みの ひ"
  };
  // おうちの方へ で えらぶ ときの まとまり
  const GROUPS = [
    ["かず", "一二三四五六七八九十百千円"],
    ["ようび・しぜん", "日月火水木金土山川田石林森空天雨気夕花草竹虫貝犬"],
    ["ひと・からだ", "人子女男王手足目耳口力名"],
    ["いろ・ようす・むき", "白赤青大小中上下左右正早"],
    ["がっこう・くらし", "学校字文本先生年町村車玉糸音"],
    ["うごき", "見出入立休"]
  ];
  const ALL = GROUPS.map(g=>g[1]).join("");
  const ON_KEY = "sansu-drill-kanji-v1";
  const ROUND = 5;                 // 1かいで れんしゅう する もじ の かず
  const STAGES = [
    {key:"trace", label:"なぞる",      tag:"うすい じを なぞろう"},
    {key:"copy",  label:"みて かく",   tag:"おてほんを みて かこう"},
    {key:"memo",  label:"みないで かく", tag:"あかい ところを かんじで かこう"}
  ];
  const N = 32;                    // くらべる ときの てん の かず
  const INK_W = 6;                 // かいた せん の ふとさ（109 の ます で）

  /* ---------- かんじ ノート：みないで かいた じ を そのまま のこす ----------
     1じ ごと に はじめて の 1まい（ずっと のこす）と あたらしい 30まい。ふで は てん を へらして もじれつ に する
     （ざひょう 1つ を 1もじ、91だんかい。ふで の くぎり は くうはく） */
  const NOTE_KEY = "sansu-drill-kanjinote-v1", NOTE_MAX = 30;
  const ALPH = (()=>{ let s = ""; for(let c=0x23;c<=0x7E;c++) if(c!==0x5C) s += String.fromCharCode(c); return s; })();
  const QN = ALPH.length - 1;
  function rdp(p, eps){
    if(p.length < 3) return p;
    const [a, b] = [p[0], p[p.length-1]], L = Math.hypot(b[0]-a[0], b[1]-a[1]) || 1e-9;
    let far = 0, at = 0;
    for(let i=1;i<p.length-1;i++){ const d = Math.abs((b[0]-a[0])*(a[1]-p[i][1]) - (a[0]-p[i][0])*(b[1]-a[1])) / L; if(d > far){ far = d; at = i; } }
    return far > eps ? rdp(p.slice(0, at+1), eps).slice(0, -1).concat(rdp(p.slice(at), eps)) : [a, b];
  }
  const qz = v => ALPH[Math.round(Math.max(0, Math.min(109, v)) / 109 * QN)];
  const enc = inks => inks.map(u=>rdp(u, 0.8).map(([x,y])=>qz(x)+qz(y)).join("")).join(" ");
  const dec = s => s.split(" ").map(st=>{ const o = []; for(let i=0;i+1<st.length;i+=2) o.push([ALPH.indexOf(st[i])/QN*109, ALPH.indexOf(st[i+1])/QN*109]); return o; });
  const noteSVG = s => `<svg viewBox="0 0 109 109" aria-hidden="true"><path class="kn-g" d="M54.5 5V104M5 54.5H104"/>${dec(s).map(p=>
    p.length===1 ? `<circle cx="${p[0][0].toFixed(1)}" cy="${p[0][1].toFixed(1)}" r="3"/>` : `<polyline points="${p.map(q=>q[0].toFixed(1)+","+q[1].toFixed(1)).join(" ")}"/>`).join("")}</svg>`;

  const parseEx = k => { const m = (EX[k]||"").match(/^(.*)\[(.+)\](.*)$/); return m ? {pre:m[1], yomi:m[2], post:m[3]} : {pre:"", yomi:"", post:""}; };

  /* ---------- かたち を くらべる ---------- */
  let probe = null;
  function refOf(d){
    if(!probe){
      const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      s.setAttribute("width","0"); s.setAttribute("height","0"); s.setAttribute("aria-hidden","true");
      s.style.cssText = "position:absolute;left:-9999px;top:0";
      probe = document.createElementNS("http://www.w3.org/2000/svg", "path"); s.appendChild(probe); document.body.appendChild(s);
    }
    probe.setAttribute("d", d);
    const L = probe.getTotalLength(), pts = [];
    for(let i=0;i<N;i++){ const p = probe.getPointAtLength(L*i/(N-1)); pts.push([p.x, p.y]); }
    return {d, pts, len:L, path:new Path2D(d)};
  }
  const cache = {};
  const refsOf = k => cache[k] || (cache[k] = (window.KANJI_STROKES[k]||[]).map(refOf));
  const dist = (a,b) => Math.hypot(a[0]-b[0], a[1]-b[1]);
  function plen(p){ let s=0; for(let i=1;i<p.length;i++) s += dist(p[i-1],p[i]); return s; }
  function resample(p, n){
    if(p.length < 2) return Array.from({length:n}, ()=>[p[0][0], p[0][1]]);
    const L = plen(p), step = L/(n-1), out = [[p[0][0], p[0][1]]];
    let acc = 0, i = 1, prev = p[0];
    while(out.length < n-1 && i < p.length){
      const d = dist(prev, p[i]);
      if(d > 0 && acc + d >= step){
        const t = (step - acc)/d, q = [prev[0] + t*(p[i][0]-prev[0]), prev[1] + t*(p[i][1]-prev[1])];
        out.push(q); prev = q; acc = 0;
      }else{ acc += d; prev = p[i]; i++; }
    }
    while(out.length < n) out.push([p[p.length-1][0], p[p.length-1][1]]);
    return out;
  }
  // u：かいた せん（109 の ます）。off：これまで の ずれ。tol：ゆるさ
  function score(u, r, off, tol){
    const U = resample(u, N).map(q=>[q[0]-off[0], q[1]-off[1]]), R = r.pts;
    const short = r.len < 18;   // てん（丶）など みじかい ふで
    let avg = 0; for(let i=0;i<N;i++) avg += dist(U[i], R[i]); avg /= N;
    const ds = dist(U[0], R[0]), de = dist(U[N-1], R[N-1]);
    // むき：かきはじめ → かきおわり の むきが はんたい なら だめ（ごく みじかい てん は みない）
    const vr = [R[N-1][0]-R[0][0], R[N-1][1]-R[0][1]], vu = [U[N-1][0]-U[0][0], U[N-1][1]-U[0][1]];
    const lvr = Math.hypot(vr[0], vr[1]), lvu = Math.hypot(vu[0], vu[1]);
    const dirOk = lvr < 8 || (lvu >= 3 && (vr[0]*vu[0] + vr[1]*vu[1]) / (lvr*lvu) > 0.3);
    if(short){
      // てん（丶）など：まんなか が ちかければ よい
      const cu = U[Math.floor(N/2)], cr = R[Math.floor(N/2)];
      return {ok: dirOk && dist(cu, cr) < tol*1.3 && plen(U) < r.len*3 + 20, avg};
    }
    const lr = plen(U) / r.len;
    return {ok: dirOk && avg < tol && ds < tol*1.5 && de < tol*1.5 && lr > 0.45 && lr < 1.9, avg};
  }

  // i ばんめ の ふで として よいか："ok"／"order"（あとの ふで を さきに かいた）／"shape"（かたち・むき・ばしょ が ちがう）
  function decide(u, refs, i, off, tol){
    const s = score(u, refs[i], off, tol);
    const later = refs.map((x,j)=>j>i ? score(u, x, off, tol) : null);
    // ならんだ ふで（森・車 など）：あとの ふで の ほうが ずっと ちかい ときは、かきじゅん ちがい と みる
    if(s.ok) return later.some(o=>o && o.ok && o.avg < s.avg*0.6) ? "order" : "ok";
    return later.some(o=>o && o.ok) ? "order" : "shape";
  }

  /* ---------- かんぺき・いいね・おしい ----------
     かきあがった じ の かたち だけ で きめる（やりなおし の かずは みない）。
     ばしょ と おおきさ の ちがい は そろえて から（かいた じ を おてほん に かさねて）、てん ごと の ずれ の へいきん を みる */
  const GRADES = {
    kanpeki:{label:"かんぺきだね！", short:"かんぺき", max:3.5},
    iine:   {label:"いいね！",       short:"いいね",   max:6.5},
    oshii:  {label:"おしい！",       short:"おしい",   max:Infinity}
  };
  function tidy(inks, refs){
    const U = [], R = [];
    inks.forEach((u,i)=>{ resample(u, N).forEach(p=>U.push(p)); refs[i].pts.forEach(p=>R.push(p)); });
    const mean = P => P.reduce((a,p)=>[a[0]+p[0]/P.length, a[1]+p[1]/P.length], [0,0]);
    const mu = mean(U), mr = mean(R);
    let num = 0, den = 0;
    U.forEach((p,i)=>{ const a = [p[0]-mu[0], p[1]-mu[1]], b = [R[i][0]-mr[0], R[i][1]-mr[1]]; num += a[0]*b[0] + a[1]*b[1]; den += a[0]*a[0] + a[1]*a[1]; });
    const s = Math.max(0.7, Math.min(1.4, den ? num/den : 1));
    let d = 0; U.forEach((p,i)=>{ d += Math.hypot(s*(p[0]-mu[0]) + mr[0] - R[i][0], s*(p[1]-mu[1]) + mr[1] - R[i][1]); });
    return d / Math.max(1, U.length);
  }
  const gradeOf = d => Object.keys(GRADES).find(g=>d <= GRADES[g].max);

  window.KanjiCourse = function(api){
    const $ = id => document.getElementById(id);
    let on = []; try{ on = (JSON.parse(localStorage.getItem(ON_KEY) || "[]") || []).filter(k=>ALL.includes(k)); }catch(e){ on = []; }
    const saveOn = () => { try{ localStorage.setItem(ON_KEY, JSON.stringify(on)); }catch(e){} };

    let round = [], ri = 0, st = 0, cur = null, timer = null, anim = null, active = false;
    let w = null;   // いま かいて いる 1かい ぶん {k, refs, si, miss, wrong, off, done:[], hint, t0, log:[]}
    let ink = null; // ゆびで かいて いる とちゅう の せん

    const top = $("kanjiTop"), main = $("kanjiMain");
    top.innerHTML = `<div class="top"><div class="round-label"><b class="num" id="kjNo">1</b> / <span id="kjTot">${ROUND}</span> もじ</div>
        <div class="kj-steps" id="kjSteps" aria-hidden="true">${STAGES.map((s,i)=>`<i data-i="${i}">${s.label}</i>`).join("")}</div></div>
      <div class="track" id="kjTrack" aria-hidden="true"></div>`;
    main.innerHTML = `<div class="card kj-card" id="kjCard">
        <div class="tags"><span class="ptag" id="kjTag"></span></div>
        <button type="button" class="kj-nbtn" id="kjNoteBtn" aria-label="かんじ ノート">ノート</button>
        <div class="kj-ex" id="kjEx"></div>
        <div class="kj-row">
          <div class="kj-model" id="kjModel" aria-hidden="true"><canvas id="kjModelC"></canvas><span>おてほん</span></div>
          <div class="kj-pad"><canvas id="kjC" aria-label="かんじを かく ところ"></canvas></div>
        </div>
        <div class="kj-fb" id="kjFb" aria-live="polite"></div>
      </div>
      <div class="kj-empty card" id="kjEmpty" hidden>
        <div class="kj-empty-t">まだ かんじが えらばれて いないよ</div>
        <p>おうちの ひとに「おうちの方へ」で ならった かんじを えらんで もらってね</p>
      </div>
      <div class="gresult" id="kjResult" hidden>
        <div class="kid">
          <img class="sum-cheer" id="kjCheer" alt="" draggable="false">
          <h2 id="kjRTitle"></h2>
          <div class="kj-rlist" id="kjRList"></div>
        </div>
        <div class="parent"><h3>おうちの方へ</h3><ul class="findings" id="kjRFind"></ul></div>
        <button type="button" class="kj-nbtn2" id="kjNoteBtn2">かんじ ノートを みる</button>
        <button class="next" id="kjAgain">もういちど</button>
      </div>`;
    // ノート は ずかん からも ひらく ので、かんじ の がめん の そと に おく
    const noteEl = document.createElement("div");
    noteEl.className = "kn"; noteEl.id = "kjNote"; noteEl.hidden = true;
    noteEl.innerHTML = `<div class="kn-card" role="dialog" aria-modal="true" aria-labelledby="knTitle">
        <div class="kn-head"><h2 id="knTitle">かんじ ノート</h2><button type="button" class="kn-x" id="knClose">とじる</button></div>
        <div class="kn-body" id="knBody"></div>
      </div>`;
    document.body.appendChild(noteEl);
    const cv = $("kjC"), cx = cv.getContext("2d"), mv = $("kjModelC"), mx = mv.getContext("2d");
    const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || "#000";

    /* ---------- えらぶ ---------- */
    const kjStat = k => { const s = api.stats(); const t = s.kj || (s.kj = {}); return t[k] || (t[k] = {n:0, miss:0, memo:0, last:0}); };
    function pickRound(){
      const pool = ALL.split("").filter(k=>on.includes(k));
      const now = Date.now(), out = [];
      const wt = k => { const s = (api.stats().kj || {})[k] || {n:0, miss:0, memo:0, last:0}; return (s.n===0 ? 4 : 1) + 4*(s.miss/Math.max(1,s.n)) + Math.min(3, (now - s.last)/864e5*0.3) + (s.memo<2 ? 1 : 0); };
      const left = [...pool];
      while(out.length < Math.min(ROUND, pool.length)){
        const ws = left.map(wt), sum = ws.reduce((a,b)=>a+b,0);
        let r = Math.random()*sum, i = 0; while(i < ws.length-1 && (r -= ws[i]) > 0) i++;
        out.push(left.splice(i,1)[0]);
      }
      return out;
    }

    /* ---------- かく ところ ---------- */
    let size = 260;
    function fit(){
      const pad = cv.parentElement, room = Math.max(160, Math.min(320, pad.clientWidth || 260));
      // スマホ（みえる たかさ 660px くらい）で スクロール しない ように、たかさ からも きめる
      const vh = window.innerHeight || 660;
      size = Math.floor(Math.max(170, Math.min(room, vh - 360)));
      const dpr = window.devicePixelRatio || 1;
      [[cv, size], [mv, Math.round(size*0.42)]].forEach(([c, s])=>{ c.style.width = c.style.height = s+"px"; c.width = c.height = Math.round(s*dpr); });
      draw(); drawModel();
    }
    function grid(c, s){
      const dpr = window.devicePixelRatio || 1;
      c.setTransform(dpr,0,0,dpr,0,0); c.clearRect(0,0,s,s);
      c.strokeStyle = css("--line"); c.lineWidth = 1; c.setLineDash([5,5]);
      c.beginPath(); c.moveTo(s/2,4); c.lineTo(s/2,s-4); c.moveTo(4,s/2); c.lineTo(s-4,s/2); c.stroke(); c.setLineDash([]);
    }
    const unit = (c, s, off=[0,0]) => { const dpr = window.devicePixelRatio || 1, k = s/109*dpr; c.setTransform(k,0,0,k,off[0]*k,off[1]*k); };
    function strokePath(c, p, color, wd){ c.strokeStyle = color; c.lineWidth = wd; c.lineCap = "round"; c.lineJoin = "round"; c.stroke(p); }
    function draw(){
      if(!w) return;
      grid(cx, size);
      const guide = STAGES[st].key === "trace";
      unit(cx, size);
      if(guide){ cx.globalAlpha = 0.28; w.refs.forEach(r=>strokePath(cx, r.path, css("--muted"), INK_W+2)); cx.globalAlpha = 1; }
      if(w.hint !== null && !anim){ unit(cx, size, w.off); cx.globalAlpha = 0.35; strokePath(cx, w.refs[w.hint].path, css("--blue"), INK_W+2); cx.globalAlpha = 1; }
      // できた ふで：なぞる とき は おてほん の かたち、みて かく・みないで かく は かいた せん を そのまま のこす
      if(guide){ unit(cx, size, w.off); w.done.forEach(i=>strokePath(cx, w.refs[i].path, css("--ink"), INK_W)); }
      else w.inks.forEach(u=>line(u, css("--ink")));
      // なぞる とき：つぎの ふで の かきはじめ に あかい てん
      if(guide && w.si < w.refs.length){
        unit(cx, size); const p = w.refs[w.si].pts[0];
        cx.fillStyle = css("--red"); cx.beginPath(); cx.arc(p[0], p[1], 3.2, 0, Math.PI*2); cx.fill();
      }
      if(ink && ink.length) line(ink, css("--blue"));
    }
    function line(u, color){
      unit(cx, size); cx.strokeStyle = color; cx.lineWidth = INK_W; cx.lineCap = "round"; cx.lineJoin = "round";
      cx.beginPath(); cx.moveTo(u[0][0], u[0][1]); u.forEach(q=>cx.lineTo(q[0], q[1]));
      if(u.length===1) cx.lineTo(u[0][0]+0.01, u[0][1]);
      cx.stroke();
    }
    function drawModel(){
      if(!w) return;
      const s = Math.round(size*0.42); grid(mx, s); unit(mx, s);
      w.refs.forEach(r=>strokePath(mx, r.path, css("--ink"), INK_W));
    }
    // ヒント：その ふでを ゆっくり かいて みせる
    function playHint(i){
      cancelAnimationFrame(anim); anim = null;
      const r = w.refs[i], t0 = performance.now(), dur = 700 + r.len*8;
      const tick = t => {
        const f = Math.min(1, (t - t0)/dur);
        anim = f < 1 ? requestAnimationFrame(tick) : null;
        draw();
        unit(cx, size, w.off);
        cx.setLineDash([r.len*f, r.len+10]);
        strokePath(cx, r.path, css("--blue"), INK_W+1);
        cx.setLineDash([]);
        const p = r.pts[0]; cx.fillStyle = css("--red"); cx.beginPath(); cx.arc(p[0], p[1], 3.2, 0, Math.PI*2); cx.fill();
        if(!anim) draw();
      };
      anim = requestAnimationFrame(tick);
    }

    const toUnit = e => { const b = cv.getBoundingClientRect(); return [(e.clientX - b.left)/b.width*109, (e.clientY - b.top)/b.height*109]; };
    let pid = null;
    cv.addEventListener("pointerdown", e=>{
      if(!w || w.fin || pid !== null) return;
      e.preventDefault(); pid = e.pointerId; try{ cv.setPointerCapture(pid); }catch(_){}
      if(anim){ cancelAnimationFrame(anim); anim = null; }
      ink = [toUnit(e)]; draw();
    });
    cv.addEventListener("pointermove", e=>{
      if(e.pointerId !== pid || !ink) return;
      const ce = e.getCoalescedEvents ? e.getCoalescedEvents() : [], evs = ce.length ? ce : [e];
      evs.forEach(ev=>{ const q = toUnit(ev), l = ink[ink.length-1]; if(dist(q,l) > 0.6) ink.push(q); });
      draw();
    });
    const up = e=>{
      if(e.pointerId !== pid) return;
      pid = null; const u = ink; ink = null;
      if(u) judge(u); else draw();
    };
    cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);

    function fb(text, cls){ $("kjFb").innerHTML = text ? `<span class="${cls||""} pop">${text}</span>` : ""; }
    function judge(u){
      const tol = st===0 ? 15 : 19, i = w.si, r = w.refs[i];
      const off = st===0 ? [0,0] : w.off;
      const kind = decide(u, w.refs, i, off, tol);
      if(kind === "ok"){
        // みて かく・みないで かく：かいた ばしょ の ずれ を おぼえて、つぎ から その ぶん ずらして くらべる
        if(st > 0){
          const U = resample(u, N); let dx = 0, dy = 0;
          U.forEach((q,j)=>{ dx += q[0]-r.pts[j][0]; dy += q[1]-r.pts[j][1]; });
          const cl = v => Math.max(-14, Math.min(14, v));
          w.off = [cl(w.off[0]*0.5 + dx/N*0.5), cl(w.off[1]*0.5 + dy/N*0.5)];
        }
        w.done.push(i); w.inks.push(u); w.si++; w.wrong = 0; w.hint = null;
        fb("");
        if(w.si >= w.refs.length){ finishWrite(); return; }
        draw();
        return;
      }
      w.miss++; w.wrong++; w.log.push({i, kind});
      if(w.wrong >= 2){ w.hint = i; fb(`${i+1}かくめ は こう かくよ。みて から かいてね`, "ng"); playHint(i); }
      else { fb(kind==="order" ? `かきじゅんが ちがうよ。${i+1}かくめ を かこう` : "もういちど かいて みよう", "ng"); draw(); }
      api.say(pick(["cat","dog"]), kind==="order" ? "かく じゅんばんに きを つけてね" : "ゆっくりで だいじょうぶ");
    }
    const pick = a => a[Math.floor(Math.random()*a.length)];

    /* ---------- すすめかた ---------- */
    function steps(){
      $("kjSteps").querySelectorAll("i").forEach((el,i)=>{ el.className = i<st ? "done" : i===st ? "now" : ""; });
      $("kjNo").textContent = Math.min(ri+1, round.length); $("kjTot").textContent = round.length;
      const t = $("kjTrack"); t.innerHTML = "";
      round.forEach((_,i)=>{ const d = document.createElement("i"); d.className = i<ri ? (cur.res[i].every(x=>x.ok) ? "ok" : "ng") : i===ri ? "now" : ""; t.appendChild(d); });
    }
    function exHTML(k){
      const e = parseEx(k), y = st===2 ? `<b class="kj-y">${e.yomi}</b>` : `<b class="kj-y kj-k">${k}</b><small class="kj-rb">${e.yomi}</small>`;
      return `${e.pre ? `<span>${e.pre}</span>` : ""}<span class="kj-tgt">${y}</span>${e.post ? `<span>${e.post}</span>` : ""}`;
    }
    const LINES = {
      trace:{cat:"あかい てん から なぞって みるにゃ", dog:"うすい じを なぞろう わん！"},
      copy:{cat:"おてほんを よく みて かくにゃ", dog:"こんどは おてほんを みて かこう わん"},
      memo:{cat:"おてほんは かくれたにゃ。かけるかにゃ？", dog:"みないで かけるかな？ わん"}
    };
    function startWrite(){
      if(api.tlGate()) return;
      const k = round[ri];
      w = {k, refs:refsOf(k), si:0, miss:0, wrong:0, off:[0,0], done:[], inks:[], hint:null, t0:performance.now(), log:[], fin:false};
      $("kjCard").hidden = false; $("kjResult").hidden = true; $("kjEmpty").hidden = true;
      $("kjTag").textContent = STAGES[st].tag;
      $("kjEx").innerHTML = exHTML(k);
      $("kjModel").hidden = st !== 1;
      fb(""); steps(); fit();
      api.setPets(null, null);
      const who = pick(["cat","dog"]);
      api.say(who, api.mcOn() ? (api.mcLine("questionStart") || LINES[STAGES[st].key][who]) : LINES[STAGES[st].key][who]);
    }
    function finishWrite(){
      w.fin = true; draw();
      // かんぺき・いいね は せいかい、おしい は まちがい と して かぞえる
      const g = gradeOf(tidy(w.inks, w.refs)), ok = g !== "oshii", ms = performance.now() - w.t0;
      cur.res[ri].push({st, g, ok, miss:w.miss, log:w.log, ms});
      const s = kjStat(w.k); s.n++; if(!ok) s.miss++; if(st===2 && g==="kanpeki") s.memo++; s.last = Date.now();
      if(st===2) noteAdd(w.k, w.inks, w.miss, g);
      api.onAnswered(ok); api.stickerStep();
      const who = pick(["cat","dog"]);
      fb(GRADES[g].label, "g-" + g);
      if(g==="kanpeki"){ api.setPets("happy","happy"); api.say(who, api.mcOn() ? (api.mcLine("correct") || "かんぺき！") : (who==="cat" ? "おてほん みたいだにゃ！" : "かんぺき だわん！")); }
      else if(g==="iine"){ api.setPets(who==="cat"?"happy":null, who==="dog"?"happy":null); api.say(who, api.mcOn() ? (api.mcLine("correct") || "いいね！") : (who==="cat" ? "じょうずに かけたにゃ" : "いい かんじ だわん！")); }
      else { api.setPets(null, null); api.say(who, api.mcOn() ? (api.mcLine("incorrect") || "おしい！") : (who==="cat" ? "おしいにゃ。おてほんを よく みてね" : "おしい！ つぎは もっと じょうずに かけるよ わん")); }
      clearTimeout(timer); timer = setTimeout(after, 1100);
    }
    function after(){
      if(!active) return;
      if(st < STAGES.length-1){ st++; }
      else { st = 0; ri++; }
      if(ri >= round.length){ finish(); return; }
      startWrite();
      if(api.pendingSticker()) api.showStickerBanner();
    }
    function finish(){
      w = null;
      $("kjCard").hidden = true; fb("");
      $("kjCheer").src = api.pickCheer();
      const res = cur.res, n = res.reduce((a,r)=>a+r.length, 0), ok = res.reduce((a,r)=>a+r.filter(x=>x.ok).length, 0);
      $("kjRTitle").textContent = `${round.length}もじ かけたね！`;
      // みないで かいた ときの けっか を だす
      $("kjRList").innerHTML = round.map((k,i)=>{ const m = res[i][2]; return `<span class="kj-ri ${m ? "g-"+m.g : ""}"><b>${k}</b><small>${m ? GRADES[m.g].short : ""}</small></span>`; }).join("");
      const f = [], cnt = g => res.flat().filter(x=>x.g===g).length;
      f.push(`練習した字：${round.join("・")}（1字ずつ なぞる→見て書く→見ないで書く）。${n}回書いて、かんぺき ${cnt("kanpeki")}回・いいね ${cnt("iine")}回・おしい ${cnt("oshii")}回（できあがった字の形を手本と比べて判定）。`);
      const memo = round.filter((k,i)=>res[i][2] && res[i][2].g==="kanpeki");
      if(memo.length) f.push(`見ないで「かんぺき」に書けた字：${memo.join("・")}。`);
      const osh = []; round.forEach((k,i)=>res[i].forEach(x=>{ if(x.g==="oshii") osh.push(`${k}（${STAGES[x.st].label}）`); }));
      if(osh.length) f.push(`「おしい」だった字：${osh.join("、")}。形のバランス（画の長さ・位置）を手本と見比べるのがおすすめです。`);
      const det = [];
      round.forEach((k,i)=>res[i].forEach(x=>x.log.forEach(l=>det.push(`${k}（${STAGES[x.st].label}・${l.i+1}画目・${l.kind==="order" ? "書き順" : "形"}）`))));
      if(det.length) f.push(`やり直した画：${det.slice(0,12).join("、")}${det.length>12 ? " ほか" : ""}。`);
      const ord = round.filter((k,i)=>res[i].some(x=>x.log.some(l=>l.kind==="order")));
      if(ord.length) f.push(`書き順のまちがいがあった字：${ord.join("・")}。おうちでも空書き（指で空中に書く）で確かめるのがおすすめです。`);
      $("kjRFind").innerHTML = f.map(x=>`<li>${x}</li>`).join("");
      $("kjResult").hidden = false;
      api.setPets("happy","happy"); api.say("cat", api.mcOn() ? (api.mcLine("finish") || "おつかれさま！") : "かんじ おつかれさまにゃ！");
      const avg = res.flat().reduce((a,x)=>a+x.ms,0) / Math.max(1,n);
      api.pushHistory({lv:"かんじ", ok, total:n, kanji:true, chars:round.join(""), avg:(avg/1000).toFixed(1)+"秒", findings:f});
      api.logSession({k:"kanji", n, ok, ms:Math.round(avg)});
      steps(); $("kjNo").textContent = round.length;
      $("kjTrack").querySelectorAll("i").forEach((d,i)=>{ d.className = res[i].every(x=>x.ok) ? "ok" : "ng"; });
      if(api.pendingSticker()) setTimeout(api.showStickerBanner, 600);
      $("kjResult").scrollIntoView({behavior:"smooth", block:"start"});
    }
    function start(){
      active = true; clearTimeout(timer);
      round = pickRound(); ri = 0; st = 0; cur = {res: round.map(()=>[])};
      if(!round.length){
        w = null; $("kjCard").hidden = true; $("kjResult").hidden = true; $("kjEmpty").hidden = false;
        $("kjTrack").innerHTML = ""; $("kjNo").textContent = 0;
        $("kjSteps").querySelectorAll("i").forEach(el=>el.className = "");
        api.setPets(null,null); api.say("dog", "おうちの ひとに かんじを えらんで もらおう わん");
        return;
      }
      startWrite();
    }
    function stop(){ active = false; clearTimeout(timer); cancelAnimationFrame(anim); anim = null; ink = null; pid = null; $("kjNote").hidden = true; }
    $("kjAgain").addEventListener("click", ()=>{ start(); window.scrollTo({top:0}); });

    /* ---------- かんじ ノート ---------- */
    let notes = {}; try{ notes = JSON.parse(localStorage.getItem(NOTE_KEY) || "{}") || {}; }catch(e){ notes = {}; }
    function noteSave(){
      try{ localStorage.setItem(NOTE_KEY, JSON.stringify(notes)); return; }catch(e){}
      // いっぱい の とき：はじめて の 1まい は のこして、ふるい ほう から へらす
      Object.keys(notes).forEach(k=>{ const a = notes[k]; if(a.length > 11) notes[k] = [a[0], ...a.slice(-10)]; });
      try{ localStorage.setItem(NOTE_KEY, JSON.stringify(notes)); }catch(e){}
    }
    function noteAdd(k, inks, miss, g){
      if(!inks.length) return;
      const a = notes[k] || (notes[k] = []), d = new Date();
      a.push({d:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`, t:Date.now(), m:miss, g, s:enc(inks)});
      if(a.length > NOTE_MAX + 1) a.splice(1, a.length - NOTE_MAX - 1);
      noteSave();
    }
    const md = d => { const [y, m, dd] = d.split("-").map(Number); return (y !== new Date().getFullYear() ? `${y}/` : "") + `${m}/${dd}`; };
    const fig = (e, cap) => `<figure class="kn-f">${noteSVG(e.s)}<figcaption>${cap ? `<b>${cap}</b>` : ""}<span class="num">${md(e.d)}</span></figcaption></figure>`;
    const noteHas = () => ALL.split("").filter(k=>notes[k] && notes[k].length);
    const tilesHTML = ks => `<div class="kn-tiles">${ks.map(k=>{ const a = notes[k]; return `<button type="button" class="kn-t" data-k="${k}">${noteSVG(a[a.length-1].s)}<b>${k}</b><small>${a.length}まい</small></button>`; }).join("")}</div>`;
    let noteSel = null;
    // ずかん の「かんじ ノート」：じ を おすと ノート の その じ を ひらく。
    // かんじ を つかって いない（えらんだ じ も ノート も ない）ときは らん ごと かくす
    function renderZukan(sec, box, countEl){
      const has = noteHas();
      sec.hidden = !has.length && !on.length;
      countEl.textContent = has.length ? `${has.length}じ` : "";
      box.innerHTML = has.length ? tilesHTML(has) : `<div class="empty">「かんじ」の「みないで かく」で かいた じが ここに のこるよ</div>`;
      box.querySelectorAll("[data-k]").forEach(b=>b.addEventListener("click", ()=>noteOpen(b.dataset.k)));
    }
    function noteRender(){
      const body = $("knBody"), has = noteHas();
      if(noteSel && notes[noteSel]){
        const a = notes[noteSel], first = a[0], last = a[a.length-1];
        // つぎへ：ノートに ある つぎの じ（さいごの じ の つぎは さいしょ に もどる）。1じ だけ の ときは ださない
        const nx = has.length > 1 ? has[(has.indexOf(noteSel) + 1) % has.length] : null;
        body.innerHTML = `<div class="kn-nav"><button type="button" class="kn-back" id="knBack">← もどる</button>
          ${nx ? `<button type="button" class="kn-back" id="knNext">つぎへ →</button>` : ""}</div>
          <h3 class="kn-k">${noteSel}</h3>
          ${a.length > 1 ? `<div class="kn-cmp">${fig(first, "はじめて")}<span class="kn-arr" aria-hidden="true">→</span>${fig(last, "いま")}</div>`
            : `<div class="kn-cmp">${fig(first, "はじめて")}</div><p class="kn-sub">また みないで かくと、くらべられるよ</p>`}
          <h4 class="kn-h">ぜんぶ（${a.length}まい）</h4>
          <div class="kn-list">${a.map(e=>fig(e)).join("")}</div>`;
        $("knBack").addEventListener("click", ()=>{ noteSel = null; noteRender(); });
        if(nx) $("knNext").addEventListener("click", ()=>{ noteSel = nx; noteRender(); body.scrollTop = 0; });
      }else{
        noteSel = null;
        body.innerHTML = has.length
          ? `<p class="kn-sub">みないで かいた じが のこるよ。じを おすと、はじめて と いま を くらべられるよ</p>
            ${tilesHTML(has)}`
          : `<p class="kn-sub">まだ ないよ。「みないで かく」で かいた じが ここに のこるよ</p>`;
        body.querySelectorAll("[data-k]").forEach(b=>b.addEventListener("click", ()=>{ noteSel = b.dataset.k; noteRender(); body.scrollTop = 0; }));
      }
    }
    function noteOpen(k){
      noteSel = k || null; noteRender();
      $("kjNote").hidden = false; $("knBody").scrollTop = 0; $("knClose").focus();
    }
    $("knClose").addEventListener("click", ()=>{ $("kjNote").hidden = true; });
    $("kjNote").addEventListener("click", e=>{ if(e.target.id === "kjNote") $("kjNote").hidden = true; });
    $("kjNoteBtn").addEventListener("click", ()=>noteOpen());
    $("kjNoteBtn2").addEventListener("click", ()=>noteOpen());
    function wipeNotes(){ notes = {}; try{ localStorage.removeItem(NOTE_KEY); }catch(e){} }
    window.addEventListener("resize", ()=>{ if(active && w) fit(); });

    /* ---------- おうちの方へ：ならった かんじ ---------- */
    function renderParent(box){
      if(!box) return;
      box.innerHTML = `<h4>習った字を選ぶ</h4>
        <p>「かんじ」で出す字を選んでください（1年生の80字）。選んだ字から、まだ書いていない字・「おしい」が多い字を多めに出します。1字につき「なぞる→見て書く→見ないで書く」の3回書き、1回を1問として「きょうの もくひょう」やシールに数えます。</p>
        <p>書き順・向きが違う画や、形が大きく違う画は、その画だけ書き直しになります。書き上がった字は、位置と大きさをそろえて手本と形を比べ、「かんぺき」「いいね」「おしい」を出します（書き直しの回数は判定に入れません）。「かんぺき」「いいね」を正解として数えます。</p>
        <p>「見ないで書く」で書いた字は、書いたままの形で「かんじ ノート」（「ずかん」と、かんじ の画面の「ノート」）に残り、はじめての1まいと いまを並べて見られます（1字につき、はじめての1まいと新しい${NOTE_MAX}まい）。</p>
        <p class="kj-on-n">いま選んでいる字：<b class="num">${on.length}</b> / 80</p>
        ${GROUPS.map(([g, ks])=>`<div class="kj-grp"><span>${g}</span><div class="kj-ks">${ks.split("").map(k=>{ const s = (api.stats().kj||{})[k];
          return `<button type="button" data-kj="${k}" aria-pressed="${on.includes(k)}" title="${s && s.n ? `${s.n}回書いた` : "まだ書いていない"}">${k}</button>`; }).join("")}</div></div>`).join("")}
        <div class="kj-all"><button type="button" id="kjAllOn">ぜんぶ選ぶ</button><button type="button" id="kjAllOff">ぜんぶ外す</button></div>
        <p class="kj-credit">書き順のデータ：<a href="https://kanjivg.tagaini.net" target="_blank" rel="noopener">KanjiVG</a>（Ulrich Apel、<a href="https://creativecommons.org/licenses/by-sa/3.0/deed.ja" target="_blank" rel="noopener">CC BY-SA 3.0</a>）</p>`;
      const re = () => renderParent(box);
      box.querySelectorAll("[data-kj]").forEach(b=>b.addEventListener("click", ()=>{
        const k = b.dataset.kj; on = on.includes(k) ? on.filter(x=>x!==k) : [...on, k]; saveOn(); re();
      }));
      $("kjAllOn").addEventListener("click", ()=>{ on = ALL.split(""); saveOn(); re(); });
      $("kjAllOff").addEventListener("click", ()=>{ on = []; saveOn(); re(); });
    }

    return {start, stop, renderParent, renderZukan, wipeNotes, _test:{score, decide, refsOf, ALL, enc, dec, tidy, gradeOf}};
  };
})();
