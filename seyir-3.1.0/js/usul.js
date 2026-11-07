// =====================================================
// USUL DALI + BATI TARTIM ÜNİTELERİ + BENDİR (usul çalar)
// Usul tablosu: Burak'ın gönderdiği usul tablosu (Mus2 yazımı).
// Süreler onaltılık cinsinden; sap yönü eli gösterir: yukarı = sağ el, aşağı = sol el.
// Vuruşlar: D = düm, T = tek (te), K = ke (kâ)
// =====================================================
'use strict';

const USUL_HAM = [
  // id, ad, zaman, varsayılan ölçü paydası, vuruşlar [ses, süre(16'lık), sap, hece], mertebeler, küçük usullerin birleşimi (Mus2)
  ['nimsofyan',  'Nim Sofyan',   2, 4,  [['D', 4, 'u', 'düm'], ['T', 4, 'd', 'tek']], [2, 4, 8], null],
  ['semai',      'Semai',        3, 4,  [['D', 4, 'u', 'düm'], ['T', 4, 'd', 'tek'], ['T', 4, 'd', 'tek']], [2, 4, 8], null],
  ['sofyan',     'Sofyan',       4, 4,  [['D', 8, 'u', 'düüm'], ['T', 4, 'u', 'te'], ['K', 4, 'd', 'ke']], [2, 4, 8], ['nimsofyan', 'nimsofyan']],
  ['turkaksagi', 'Türk Aksağı',  5, 8,  [['D', 4, 'u', 'düüm'], ['T', 4, 'd', 'teek'], ['T', 2, 'd', 'tek']], [4, 8], ['nimsofyan', 'semai']],
  ['yuruksemai', 'Yürük Semai',  6, 8,  [['D', 2, 'u', 'düm'], ['T', 2, 'd', 'tek'], ['T', 2, 'd', 'tek'], ['D', 2, 'u', 'düm'], ['T', 4, 'd', 'teek']], [2, 4, 8], ['semai', 'semai']],
  ['devrihindi', 'Devr-i Hindî', 7, 8,  [['D', 2, 'u', 'düm'], ['T', 2, 'd', 'tek'], ['T', 2, 'd', 'tek'], ['D', 4, 'u', 'düüm'], ['T', 4, 'd', 'teek']], [4, 8], ['semai', 'sofyan']],
  ['devrituran', 'Devr-i Turan', 7, 8,  [['D', 4, 'u', 'düüm'], ['T', 4, 'd', 'teek'], ['T', 6, 'd', 'teeek']], [8, 16], ['sofyan', 'semai']],
  ['duyek',      'Düyek',        8, 8,  [['D', 2, 'u', 'düm'], ['T', 4, 'd', 'teek'], ['T', 2, 'd', 'tek'], ['D', 4, 'u', 'düüm'], ['T', 4, 'd', 'teek']], [4, 8], ['sofyan', 'sofyan']],
  ['musemmen',   'Müsemmen',     8, 8,  [['D', 6, 'u', 'düüüm'], ['T', 4, 'd', 'teek'], ['T', 6, 'd', 'teeek']], [8], ['semai', 'turkaksagi']],
  ['aksak',      'Aksak',        9, 8,  [['D', 4, 'u', 'düüm'], ['T', 2, 'u', 'te'], ['K', 2, 'd', 'ke'], ['D', 4, 'u', 'düüm'], ['T', 4, 'd', 'teek'], ['T', 2, 'd', 'tek']], [4, 8], ['sofyan', 'turkaksagi']],
  ['evfer',      'Evfer',        9, 8,  [['D', 4, 'u', 'düüm'], ['T', 2, 'u', 'te'], ['K', 2, 'd', 'ke'], ['D', 4, 'u', 'düüm'], ['T', 2, 'd', 'tek'], ['T', 4, 'd', 'teek']], [4, 8], ['sofyan', 'turkaksagi']],
  ['oynak',      'Oynak',        9, 8,  [['D', 2, 'u', 'düm'], ['T', 2, 'd', 'tek'], ['T', 2, 'd', 'tek'], ['D', 4, 'u', 'düüm'], ['T', 4, 'd', 'teek'], ['T', 4, 'd', 'teek']], [4, 8], ['semai', 'yuruksemai']],
  ['raksaksagi', 'Raks Aksağı',  9, 8,  [['D', 4, 'u', 'düüm'], ['T', 6, 'd', 'teeek'], ['D', 4, 'u', 'düüm'], ['T', 4, 'd', 'teek']], [8], ['turkaksagi', 'sofyan']],
  ['curcuna',    'Curcuna',      10, 16, [['D', 2, 'u', 'düüm'], ['T', 1, 'u', 'te'], ['K', 2, 'd', 'kaa'], ['D', 2, 'u', 'düüm'], ['T', 2, 'd', 'teek'], ['T', 1, 'd', 'tek']], [16], null],
  ['aksaksemai', 'Aksak Semai',  10, 8,  [['D', 4, 'u', 'düüm'], ['T', 2, 'u', 'te'], ['K', 4, 'd', 'kaa'], ['D', 4, 'u', 'düüm'], ['T', 4, 'd', 'teek'], ['T', 2, 'd', 'tek']], [4, 8, 16], ['turkaksagi', 'turkaksagi']],
  // Mus2'nin usul listesindeki 5 usul daha
  ['mureknimsofyan', 'Mürekkeb Nim Sofyan', 6, 8, [['D', 2, 'u', 'düm'], ['T', 2, 'd', 'tek'], ['T', 2, 'd', 'tek'], ['D', 2, 'u', 'düm'], ['T', 2, 'd', 'tek'], ['T', 2, 'd', 'tek']], [8], ['semai', 'semai']],
  ['mureksemai', 'Mürekkeb Semai', 9, 8, [['D', 6, 'u', 'düüüm'], ['T', 6, 'd', 'teeek'], ['T', 6, 'd', 'teeek']], [8], ['semai', 'semai', 'semai']],
  ['kapalicurcuna', 'Kapalı Curcuna', 10, 16, [['D', 5, 'u', 'düüüüm'], ['T', 2, 'u', 'te'], ['K', 3, 'd', 'kââ']], [16], ['turkaksagi', 'turkaksagi']],
  ['lenkfahte', 'Lenk Fâhte', 10, 4, [['D', 8, 'u', 'düüm'], ['T', 12, 'd', 'teeek'], ['D', 4, 'u', 'düm'], ['T', 8, 'd', 'teek'], ['T', 4, 'u', 'te'], ['K', 4, 'd', 'ke']], [4, 8], ['yuruksemai', 'sofyan']],
  ['cengiharbi', 'Çeng-i Harbî', 10, 8, [['D', 4, 'u', 'düüm'], ['D', 4, 'u', 'düüm'], ['D', 2, 'u', 'düm'], ['T', 2, 'd', 'tek'], ['T', 2, 'd', 'tek'], ['D', 2, 'u', 'düm'], ['T', 2, 'd', 'tek'], ['T', 2, 'd', 'tek']], [4, 8], ['nimsofyan', 'nimsofyan', 'semai', 'semai']]
];
const USUL_TEMPO = { 2: 46, 4: 76, 8: 150, 16: 220 };   // varsayılan: zaman/dakika
const USULLER = USUL_HAM.map(function (r) {
  const o = { id: r[0], ad: r[1], zaman: r[2], payda: r[3], olcu: r[2] + '/' + r[3], mertebeler: r[5], birlesim: r[6],
    olaylar: r[4].map(function (v) { return { s: v[0], u: v[1], sap: v[2], hece: v[3] }; }) };
  o.birim = 16 / o.payda;   // bir zaman kaç onaltılık
  const top = o.olaylar.reduce(function (t, e) { return t + e.u; }, 0);
  if (top !== o.zaman * o.birim) console.warn('Usul süresi tutmuyor: ' + o.ad);
  if (o.mertebeler.indexOf(o.payda) < 0) console.warn('Varsayılan mertebe listede yok: ' + o.ad);
  o.tempo = USUL_TEMPO[o.payda];
  o.ana = o;
  return o;
});
const USUL = {};
USULLER.forEach(function (u) { USUL[u.id] = u; });
function usuller(L) { return L.map(function (i) { return USUL[i]; }); }
// Usulü başka bir mertebede yaz: kalıp aynı, nota birimi değişir (9/8 → 9/4: bütün süreler iki katı)
function usulMertebe(u, payda) {
  u = u.ana || u;
  if (!payda || payda === u.payda) return u;
  const k = u.payda / payda;
  return Object.assign({}, u, { payda: payda, olcu: u.zaman + '/' + payda, birim: 16 / payda, tempo: USUL_TEMPO[payda],
    olaylar: u.olaylar.map(function (e) { return Object.assign({}, e, { u: e.u * k }); }) });
}
// Kalıbın belli bir mertebedeki imzası (Curcuna = Aksak Semai'nin 10/16'sı gibi aynı görünen kalıpları ayırmak için)
function kalipImza(u, payda) {
  u = u.ana || u;
  return u.olaylar.map(function (e) { return e.s + (e.u * u.payda / payda); }).join(',');
}
function ayniGorunur(a, b, payda) { return kalipImza(a, payda) === kalipImza(b, payda); }
function birlesimMetni(u) { return u.birlesim ? u.birlesim.map(function (i) { return USUL[i].ad; }).join(' + ') : ''; }
const U_TEMEL = ['nimsofyan', 'semai', 'sofyan', 'turkaksagi'];
const U_AKSAK = ['devrihindi', 'devrituran', 'aksak', 'evfer', 'oynak', 'raksaksagi'];
const U_UZUN = ['yuruksemai', 'duyek', 'musemmen', 'curcuna', 'aksaksemai'];
const U_TUM = U_TEMEL.concat(U_AKSAK, U_UZUN);   // ilk beş ünitenin 15 usulü
const U_EK = ['mureknimsofyan', 'mureksemai', 'kapalicurcuna', 'lenkfahte', 'cengiharbi'];
const U_HEPSI = U_TUM.concat(U_EK);
const VURUS_AD = { D: 'Düm', T: 'Tek', K: 'Ke' };
function usulBirimAd(u) { return { 2: 'ikilik (𝅗𝅥)', 4: 'dörtlük (♩)', 8: 'sekizlik (♪)', 16: 'onaltılık' }[u.payda]; }
function usulOnaltilikSn(u, tempo) { return 60 / (tempo || u.tempo) / u.birim; }

// =====================================================
// RİTİM NOTASI (tek çizgi). Usul: bayraklı, sap yönü el. Tartım: kirişli, saplar yukarı.
// spec: { olaylar:[{u, sap, hece, renk}], olcu, vurgu, gizli, kiris, grup (kiriş grubu, onaltılık), heceYok, olcek }
// =====================================================
function ritimSVG(spec) {
  const L = spec.olaylar, olcek = spec.olcek || 13, Y = 62;
  const svg = svgEl('svg', { class: 'ritim', preserveAspectRatio: 'xMidYMid meet', role: 'img' });
  let x = spec.olcu ? 46 : 20;
  const xs = [], parcaX = [];
  // tek notayla yazılamayan süreler bağlı notalara bölünür (5 = 2 + 3, 10 = 8 + 2 …)
  const TEK = [16, 12, 8, 6, 4, 3, 2, 1];
  const bol = function (u) { if (TEK.indexOf(u) >= 0) return [u]; if (u === 5) return [2, 3]; const p = []; let k = u; TEK.forEach(function (t) { while (k >= t) { p.push(t); k -= t; } }); return p; };
  const aralik = function (u) { return spec.kiris ? Math.max(spec.heceYok ? 24 : 30, u * olcek) : Math.max(38, 24 + 11 * Math.log2(u)); };
  L.forEach(function (e) {
    const p = spec.kiris ? [e.u] : bol(e.u);
    const px = [];
    p.forEach(function (u) { px.push({ x: x + 8, u: u }); x += aralik(u); });
    parcaX.push(px); xs.push(px[0].x);
  });
  const W = Math.max(spec.enAz || 0, x + 14);
  svg.setAttribute('viewBox', '0 0 ' + W + ' 112');
  svg.appendChild(svgEl('line', { x1: 0, x2: W, y1: Y, y2: Y, stroke: 'currentColor', 'stroke-width': 1.2, opacity: .7 }));
  svg.appendChild(svgEl('line', { x1: W - 3, x2: W - 3, y1: Y - 14, y2: Y + 14, stroke: 'currentColor', 'stroke-width': 2 }));
  if (spec.olcu) {
    const p = spec.olcu.split('/');
    [[p[0], Y - 4], [p[1], Y + 14]].forEach(function (z) {
      const t = svgEl('text', { x: 20, y: z[1], 'font-size': 17, 'font-weight': 900, 'text-anchor': 'middle', fill: 'currentColor', 'font-family': 'Nunito, sans-serif' });
      t.textContent = z[0]; svg.appendChild(t);
    });
  }
  // kiriş grupları (tartım)
  const kirisli = {};
  if (spec.kiris) {
    let poz = 0, grup = [];
    const g = spec.grup || 4;
    const kapat = function () { if (grup.length > 1) grup.forEach(function (i) { kirisli[i] = grup; }); grup = []; };
    L.forEach(function (e, i) {
      if (poz % g === 0) kapat();
      if (e.u < 4) grup.push(i); else kapat();
      poz += e.u;
    });
    kapat();
  }
  L.forEach(function (e, i) {
    const nx = xs[i], gr = svgEl('g', { class: 'ritimNota', 'data-i': i });
    const renk = e.renk || (spec.vurgu === i ? 'var(--vurgu)' : null);
    if (renk) gr.setAttribute('style', 'color:' + renk);
    if (spec.gizli === i) {
      gr.appendChild(svgEl('circle', { cx: nx, cy: Y, r: 11, fill: 'none', stroke: 'var(--vurgu)', 'stroke-width': 2, 'stroke-dasharray': '3 3' }));
      const t = svgEl('text', { x: nx, y: Y + 5, 'font-size': 15, 'font-weight': 900, 'text-anchor': 'middle', fill: 'var(--vurgu)' });
      t.textContent = '?'; gr.appendChild(t);
      svg.appendChild(gr);
      return;
    }
    const yukari = spec.kiris || e.sap !== 'd';
    parcaX[i].forEach(function (pp, k) {
      const px = pp.x, u = pp.u, bos = u >= 8;
      gr.appendChild(svgEl('ellipse', { cx: px, cy: Y, rx: 6.6, ry: 4.9, transform: 'rotate(-20 ' + px + ' ' + Y + ')', fill: bos ? 'none' : 'currentColor', stroke: 'currentColor', 'stroke-width': bos ? 1.8 : 1 }));
      if (u === 3 || u === 6 || u === 12) gr.appendChild(svgEl('circle', { cx: px + 11, cy: Y - 2, r: 1.9, fill: 'currentColor' }));
      const sx = yukari ? px + 6 : px - 6, uc = yukari ? Y - 32 : Y + 32;
      if (u < 16) gr.appendChild(svgEl('line', { x1: sx, x2: sx, y1: Y + (yukari ? -1 : 1), y2: uc, stroke: 'currentColor', 'stroke-width': 1.6 }));
      const bayrak = u <= 1 ? 2 : u <= 3 ? 1 : 0;
      if (bayrak && !kirisli[i]) {
        for (let b = 0; b < bayrak; b++) {
          const yy = uc + (yukari ? b * 7 : -b * 7);
          gr.appendChild(svgEl('path', { d: yukari ? 'M' + sx + ' ' + yy + ' q 9 7 6 17' : 'M' + sx + ' ' + yy + ' q 9 -7 6 -17', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }));
        }
      }
      if (k > 0) {   // bağ
        const x0 = parcaX[i][k - 1].x + 5, x1 = px - 5, yb = yukari ? Y + 8 : Y - 8;
        gr.appendChild(svgEl('path', { d: 'M' + x0 + ' ' + yb + ' Q ' + ((x0 + x1) / 2) + ' ' + (yb + (yukari ? 8 : -8)) + ' ' + x1 + ' ' + yb, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 }));
      }
    });
    if (!spec.heceYok && e.hece) {
      const t = svgEl('text', { x: nx, y: 14, 'font-size': 11.5, 'font-weight': 800, 'text-anchor': 'middle', fill: 'currentColor', 'font-family': 'Nunito, sans-serif' });
      t.textContent = e.hece; gr.appendChild(t);
    }
    svg.appendChild(gr);
  });
  // kirişler
  const cizildi = {};
  Object.keys(kirisli).forEach(function (k) {
    const g = kirisli[k], anah = g.join(',');
    if (cizildi[anah]) return;
    cizildi[anah] = 1;
    const y = Y - 32, x1 = xs[g[0]] + 6, x2 = xs[g[g.length - 1]] + 6;
    svg.appendChild(svgEl('rect', { x: x1 - 0.8, y: y, width: x2 - x1 + 1.6, height: 4.5, fill: 'currentColor' }));
    // ikinci kiriş (onaltılıklar)
    g.forEach(function (i, j) {
      if (L[i].u !== 1) return;
      const sol = j > 0 ? g[j - 1] : null, sag = j < g.length - 1 ? g[j + 1] : null;
      const xi = xs[i] + 6;
      if (sag !== null && L[sag].u === 1) svg.appendChild(svgEl('rect', { x: xi - 0.8, y: y + 7, width: xs[sag] - xs[i] + 1.6, height: 4.5, fill: 'currentColor' }));
      else if (!(sol !== null && L[sol].u === 1)) {
        const yon = sag !== null ? 1 : -1;
        svg.appendChild(svgEl('rect', { x: yon > 0 ? xi - 0.8 : xi - 9, y: y + 7, width: 9.8, height: 4.5, fill: 'currentColor' }));
      }
    });
  });
  return svg;
}
function usulSVG(u, ek) { return ritimSVG(Object.assign({ olaylar: u.olaylar, olcu: u.olcu }, ek || {})); }

// =====================================================
// TARTIM KALIPLARI (Batı Teorisi): bir vuruş = dörtlük (İstanbul: 6/8'de noktalı dörtlük)
// =====================================================
const TARTIM_HAM = [
  ['van', 'Van', [4], 'bir dörtlük'],
  ['izmir', 'İzmir', [2, 2], 'iki sekizlik'],
  ['gelibolu', 'Gelibolu', [1, 1, 1, 1], 'dört onaltılık'],
  ['ankara', 'Ankara', [2, 1, 1], 'bir sekizlik, iki onaltılık'],
  ['karaman', 'Karaman', [1, 1, 2], 'iki onaltılık, bir sekizlik'],
  ['terazi', 'Terazi', [1, 2, 1], 'onaltılık, sekizlik, onaltılık (senkop)'],
  ['bursa', 'Bursa', [3, 1], 'noktalı sekizlik, onaltılık'],
  ['sahur', 'Sahur', [1, 3], 'onaltılık, noktalı sekizlik'],
  ['istanbul', 'İstanbul', [2, 2, 2], 'üç sekizlik (6/8’de bir vuruş)']
];
const TARTIMLAR = TARTIM_HAM.map(function (r) {
  const heceler = { van: ['Van'], izmir: ['İz', 'mir'], gelibolu: ['Ge', 'li', 'bo', 'lu'], ankara: ['An', 'ka', 'ra'], karaman: ['Ka', 'ra', 'man'],
    terazi: ['Te', 'ra', 'zi'], bursa: ['Bur', 'sa'], sahur: ['Sa', 'hur'], istanbul: ['İs', 'tan', 'bul'] }[r[0]];
  return { id: r[0], ad: r[1], u: r[2], tarif: r[3], grup: r[0] === 'istanbul' ? 6 : 4,
    olaylar: r[2].map(function (u, i) { return { s: 'ton', u: u, hece: heceler[i] }; }) };
});
const TARTIM = {};
TARTIMLAR.forEach(function (t) { TARTIM[t.id] = t; });
const T_TEMEL = ['van', 'izmir', 'gelibolu', 'ankara', 'karaman'];
const T_NOKTALI = ['terazi', 'bursa', 'sahur', 'istanbul'];
const T_IKIDORT = T_TEMEL.concat(['terazi', 'bursa', 'sahur']);   // 2/4 ölçüye girenler
const TARTIM_TEMPO = 60;   // dörtlük / dakika
function tartimSVG(L, ek) {
  let olaylar = [];
  L.forEach(function (t) { olaylar = olaylar.concat(t.olaylar); });
  return ritimSVG(Object.assign({ olaylar: olaylar, kiris: true, grup: L[0].grup, olcek: 12 }, ek || {}));
}

// =====================================================
// SORULAR
// =====================================================
function svgSik(key, f, genis) { return { key: key, svg: f, genis: genis !== false }; }
// Mertebeden bağımsız aynı kalıp mı? (Curcuna ile Aksak Semai gibi): şıklarda birlikte çıkmasınlar
function ayniKalip(a, b) { return kalipImza(a, 16) === kalipImza(b, 16); }
function usulSiklar(u, havuz, ayni) {
  let dis = havuz.filter(function (x) { return x !== u && !ayniKalip(x, u); });
  if (ayni) { const a = dis.filter(function (x) { return x.zaman === u.zaman; }); if (a.length) dis = a.concat(karistir(dis.filter(function (x) { return x.zaman !== u.zaman; }))); }
  else dis = karistir(dis);
  if (ayni) dis = karistir(dis.slice(0, 3)).concat(dis.slice(3));
  return [u].concat(dis.slice(0, 3));
}
// Kendi adı olan mertebeler (Adana Musiki Derneği usul sayfaları)
const MERTEBE_ADLARI = [
  { u: 'duyek', p: 4, ad: 'Ağır Düyek' }, { u: 'aksak', p: 4, ad: 'Ağır Aksak' }, { u: 'aksaksemai', p: 4, ad: 'Ağır Aksak Semai' }
];
function heceMetni(u) { return u.olaylar.map(function (e) { return e.hece; }).join(' '); }
function usulAciklama(u) {
  return '<b>' + u.ad + '</b> · ' + u.zaman + ' zamanlı (' + u.olcu + ') · ' + u.olaylar.map(function (e) { return e.hece; }).join(' ');
}
const USUL_BILGI = [
  { s: '“Düüm” yazılışındaki uzatma neyi gösterir?', d: 'Vuruşun daha uzun sürdüğünü', y: ['Daha güçlü vurulduğunu', 'Sol elle vurulduğunu', 'Tekrar edildiğini'] },
  { s: 'Usulün ölçü birimindeki her vuruş zamanına ne denir?', d: 'Zaman', y: ['Devir', 'Hane', 'Mertebe'] },
  { s: 'Bir usulün baştan sona bir kez vurulmasına ne denir?', d: 'Devir', y: ['Zaman', 'Ölçü birimi', 'Mertebe'] },
  { s: 'Türk aksağı (5 zaman) hangi iki usulün birleşimidir?', d: 'Nim Sofyan + Semai', y: ['Semai + Semai', 'Sofyan + Nim Sofyan', 'Sofyan + Semai'] },
  { s: 'Yürük semai (6 zaman) neyden oluşur?', d: 'İki semai', y: ['İki sofyan', 'Bir semai ve bir sofyan', 'Bir Türk aksağı'] }
];
function bilgiSoru(B) {
  const b = rastgele(B);
  return { oge: null, tip: 'secim', soru: { metin: b.s, kucuk: true }, alt: 'Doğru cevap hangisi?',
    siklar: [b.d].concat(b.y).map(function (x) { return { key: x, metin: x }; }), dogru: b.d, dogruMetin: b.d, aciklama: '<b>' + kacis(b.s) + '</b> → ' + kacis(b.d) };
}

function usulSoru(tip, u, havuz) {
  const q = usulSoru0(tip, u, havuz);
  // 3.0.4: usul sorusu Tekrar'a girsin (öğe kimliği u:<id>); genel bilgi soruları hariç
  if (q && !q.oge && tip !== 'bilgi' && u && u.id) q.oge = 'u:' + u.id;
  return q;
}
function usulSoru0(tip, u, havuz) {
  const q = { oge: null, tip: 'secim', aciklama: usulAciklama(u), ipucu: u.zaman + ' zamanlı' };
  const ayniZaman = /Ayni$/.test(tip);
  tip = tip.replace(/Ayni$/, '');
  if (tip === 'bilgi') return bilgiSoru(USUL_BILGI);
  if (tip === 'notaAd') {
    q.soru = { svg: function () { return usulSVG(u, { heceYok: ayniZaman ? false : false }); } }; q.alt = 'Bu hangi usul?';
    q.siklar = usulSiklar(u, havuz, ayniZaman).map(function (x) { return { key: x.id, metin: x.ad }; });
    q.dogru = u.id; q.dogruMetin = u.ad;
  } else if (tip === 'adNota') {
    q.soru = { metin: u.ad }; q.alt = 'Doğru vuruş kalıbı hangisi?';
    q.siklar = usulSiklar(u, havuz, ayniZaman).map(function (x) { return svgSik(x.id, function () { return usulSVG(x, { olcu: null }); }); });
    q.dogru = u.id; q.dogruMetin = u.olaylar.map(function (e) { return e.hece; }).join(' ');
  } else if (tip === 'zaman') {
    q.soru = { metin: u.ad }; q.alt = 'Kaç zamanlı bir usul?';
    const dis = karistir([2, 3, 4, 5, 6, 7, 8, 9, 10].filter(function (x) { return x !== u.zaman; })).slice(0, 3);
    q.siklar = [u.zaman].concat(dis).map(function (x) { return { key: 'z' + x, metin: x + ' zamanlı' }; });
    q.dogru = 'z' + u.zaman; q.dogruMetin = u.zaman + ' zamanlı (' + u.olcu + ')'; q.ipucu = null;
  } else if (tip === 'notaZaman') {
    q.soru = { svg: function () { return usulSVG(u, { olcu: null, heceYok: true }); } };
    q.alt = 'Bir zaman = bir ' + usulBirimAd(u) + '. Bu usul kaç zamanlı?';
    const dis = karistir([u.zaman - 2, u.zaman - 1, u.zaman + 1, u.zaman + 2].filter(function (x) { return x >= 2; })).slice(0, 3);
    q.siklar = [u.zaman].concat(dis).map(function (x) { return { key: 'z' + x, metin: String(x) }; });
    q.dogru = 'z' + u.zaman; q.dogruMetin = u.zaman + ' zaman (' + u.olcu + ')';
    q.ipucu = 'Sürelerin toplamını ' + usulBirimAd(u) + ' cinsinden say: ' + u.olaylar.map(function (e) { return e.u / u.birim; }).join(' + ');
  } else if (tip === 'eksik') {
    const i = Math.floor(Math.random() * u.olaylar.length), e = u.olaylar[i];
    q.soru = { metin: u.ad, kucuk: true, svg: function () { return usulSVG(u, { gizli: i }); } };
    q.alt = 'Soru işaretli vuruş hangisi?';
    q.siklar = ['D', 'T', 'K'].map(function (s) { return { key: s, metin: VURUS_AD[s] }; });
    q.dogru = e.s; q.dogruMetin = VURUS_AD[e.s] + ' (' + e.hece + ')';
    q.ipucu = 'Sap ' + (e.sap === 'u' ? 'yukarı: sağ el' : 'aşağı: sol el') + '.';
  } else if (tip === 'dinleAd') {
    q.soru = {}; q.alt = 'Duyduğun hangi usul?';
    q.dinle = { olaylar: u.olaylar, onaltilikSn: usulOnaltilikSn(u), devir: u.zaman <= 4 ? 3 : 2 };
    q.siklar = usulSiklar(u, havuz, ayniZaman).map(function (x) { return { key: x.id, metin: x.ad }; });
    q.dogru = u.id; q.dogruMetin = u.ad; q.ipucu = u.zaman + ' zamanlı. Dümlerin yerine dikkat et.';
    q.aciklama = usulAciklama(u);
  } else if (tip === 'gorDinleAd') {
    // notayı gör, sesini dinle, adını bul
    q.soru = { svg: function () { return usulSVG(u); } }; q.alt = 'Bu hangi usul?';
    q.dinle = { olaylar: u.olaylar, onaltilikSn: usulOnaltilikSn(u), devir: 2, otomatik: true };
    q.siklar = usulSiklar(u, havuz, ayniZaman).map(function (x) { return { key: x.id, metin: x.ad }; });
    q.dogru = u.id; q.dogruMetin = u.ad;
  } else if (tip === 'hece') {
    const hm = heceMetni(u);
    const dis = benzersiz(karistir(havuz.concat(USULLER).filter(function (x) { return heceMetni(x) !== hm; }))
      .sort(function (a, b) { return (a.zaman === u.zaman ? 0 : 1) - (b.zaman === u.zaman ? 0 : 1); }).map(heceMetni)).slice(0, 3);
    q.soru = { metin: u.ad }; q.alt = 'Vuruş heceleri hangisi?';
    q.siklar = [hm].concat(karistir(dis)).map(function (x) { return { key: x, metin: x }; });
    q.dogru = hm; q.dogruMetin = hm;
  } else if (tip === 'heceNota') {
    const hm = heceMetni(u);
    q.soru = { metin: hm, kucuk: true }; q.alt = 'Bu hecelerin notası hangisi?';
    q.siklar = usulSiklar(u, havuz.filter(function (x) { return heceMetni(x) !== hm; }), true).map(function (x) { return svgSik(x.id, function () { return usulSVG(x, { olcu: null, heceYok: true }); }); });
    q.dogru = u.id; q.dogruMetin = u.ad + ': ' + hm;
  } else if (tip === 'heceDizi') {
    const L = u.olaylar.map(function (e) { return e.hece; });
    const ek = karistir(['düm', 'tek', 'te', 'ke', 'teek', 'düüm', 'kaa'].filter(function (x) { return L.indexOf(x) < 0; })).slice(0, 2);
    q.tip = 'dizi';
    q.soru = { metin: u.ad + ' · ' + u.olcu, kucuk: true, svg: function () { return usulSVG(u, { heceYok: true }); } };
    q.alt = 'Heceleri sırayla diz';
    q.dizi = { havuz: karistir(benzersiz(L).concat(ek)).map(function (x) { return { key: x, metin: x }; }), uzunluk: L.length, beklenen: L, tekrarli: true };
    q.dogruMetin = L.join(' '); q.ipucu = 'Uzun notalar uzatılarak söylenir: düüm, teek.';
  } else if (tip === 'el') {
    const i = Math.floor(Math.random() * u.olaylar.length), e = u.olaylar[i];
    q.soru = { metin: u.ad, kucuk: true, svg: function () { return usulSVG(u, { vurgu: i }); } };
    q.alt = 'Kırmızı vuruş hangi elle vurulur?';
    q.siklar = [{ key: 'u', metin: 'Sağ el' }, { key: 'd', metin: 'Sol el' }];
    q.dogru = e.sap; q.dogruMetin = (e.sap === 'u' ? 'Sağ el' : 'Sol el') + ' (' + e.hece + ')';
    q.aciklama = 'Sapı <b>yukarı</b> olan vuruş <b>sağ el</b>, sapı <b>aşağı</b> olan <b>sol el</b> ile vurulur. ' + usulAciklama(u);
    q.ipucu = 'Notanın sapına bak.';
  } else if (tip === 'mertebeEs') {
    // bir mertebede gör ve dinle; öbür mertebedeki yazımını bul
    const ms = u.mertebeler.slice();
    const p1 = ms.indexOf(u.payda) >= 0 ? u.payda : ms[0];
    const p2 = rastgele(ms.filter(function (x) { return x !== p1; }));
    const m1 = usulMertebe(u, p1), m2 = usulMertebe(u, p2);
    const adaylar = [];
    [2, 4, 8, 16].forEach(function (x) { if (x !== p2 && u.olaylar.every(function (e) { return (e.u * u.payda / x) % 1 === 0; })) adaylar.push({ key: 'm' + x, u: usulMertebe(u, x), olcu: true }); });
    havuz.concat(USULLER).filter(function (x) { return x !== u && x.zaman === u.zaman && !ayniGorunur(x, u, p2); }).forEach(function (x) {
      if (x.olaylar.every(function (e) { return (e.u * x.payda / p2) % 1 === 0; }) && !adaylar.some(function (a) { return a.key === x.id; })) adaylar.push({ key: x.id, u: usulMertebe(x, p2) });
    });
    const imza = function (m) { return m.payda + '|' + m.olaylar.map(function (e) { return e.s + e.u + e.sap; }).join(','); };
    const gor = {}; gor[imza(m2)] = 1;
    const dis = karistir(adaylar).filter(function (a) { const k = imza(a.u); if (gor[k]) return false; gor[k] = 1; return true; }).slice(0, 3);
    q.soru = { svg: function () { return usulSVG(m1); } };
    q.dinle = { olaylar: m1.olaylar, onaltilikSn: usulOnaltilikSn(m1), devir: 1 };
    q.alt = u.ad + ' ' + m1.olcu + ' yazılmış. ' + m2.olcu + ' mertebesindeki yazımı hangisi?';
    q.siklar = [{ key: 'd', svg: function () { return usulSVG(m2, { olcu: null }); } }].concat(dis.map(function (x) { return svgSik(x.key, function () { return usulSVG(x.u, { olcu: null }); }); }));
    q.dogru = 'd'; q.dogruMetin = m2.olcu + ': ' + m2.olaylar.map(function (e) { return e.hece; }).join(' ');
    q.aciklama = '<b>' + u.ad + '</b>: mertebe değişince vuruşlar ve heceler aynı kalır, yalnızca nota birimi değişir. ' + m1.olcu + ' → ' + m2.olcu + ': her nota ' + (p2 > p1 ? (p2 / p1) + ' kat kısalır' : (p1 / p2) + ' kat uzar') + '.';
    q.ipucu = 'Düm ve teklerin sırası aynı kalmalı; toplam ' + u.zaman + ' tane ' + usulBirimAd(m2) + '.';
  } else if (tip === 'mertebeBul') {
    // ölçü rakamı yok: nota değerlerinden mertebeyi bul
    const p = rastgele(u.mertebeler), m = usulMertebe(u, p);
    q.soru = { metin: u.ad, kucuk: true, svg: function () { return usulSVG(m, { olcu: null }); } };
    q.alt = 'Bu yazım hangi mertebede?';
    q.siklar = [2, 4, 8, 16].map(function (x) { return { key: 'm' + x, metin: u.zaman + '/' + x }; });
    q.dogru = 'm' + p; q.dogruMetin = m.olcu;
    q.aciklama = '<b>' + u.ad + '</b> ' + m.olcu + ': bir zaman = bir ' + usulBirimAd(m) + '; toplam ' + u.zaman + ' zaman.';
    q.ipucu = 'Notaların sürelerini topla; ' + u.zaman + ' eşit parçaya böl.';
  } else if (tip === 'birim') {
    const p = rastgele(u.mertebeler), m = usulMertebe(u, p);
    q.soru = { metin: u.ad + ' · ' + m.olcu, kucuk: true }; q.alt = 'Bu mertebede bir zaman hangi nota?';
    const AD = { 2: 'İkilik', 4: 'Dörtlük', 8: 'Sekizlik', 16: 'Onaltılık' };
    q.siklar = [2, 4, 8, 16].map(function (x) { return { key: 'b' + x, metin: AD[x] }; });
    q.dogru = 'b' + p; q.dogruMetin = AD[p];
    q.aciklama = 'Ölçü rakamının paydası birimi verir: ' + m.olcu + ' → bir zaman = bir ' + usulBirimAd(m) + '.'; q.ipucu = 'Paydaya bak.';
  } else if (tip === 'mertebeAdi') {
    const L = MERTEBE_ADLARI.filter(function (x) { return x.u === u.id; });
    const x = rastgele(L.length ? L : MERTEBE_ADLARI);
    const uu = USUL[x.u], olcu = uu.zaman + '/' + x.p;
    if (Math.random() < 0.5) {
      q.soru = { metin: uu.ad + ' · ' + olcu, kucuk: true }; q.alt = 'Bu mertebenin adı ne?';
      const dis = karistir(MERTEBE_ADLARI.filter(function (y) { return y.ad !== x.ad; }).map(function (y) { return y.ad; }).concat(['Yürük Semai', 'Sengin Semai'])).slice(0, 3);
      q.siklar = [x.ad].concat(dis).map(function (y) { return { key: y, metin: y }; }); q.dogru = x.ad;
    } else {
      q.soru = { metin: x.ad }; q.alt = 'Hangi usulün hangi mertebesi?';
      const ad = function (y) { return USUL[y.u].ad + ' ' + USUL[y.u].zaman + '/' + y.p; };
      const dis = benzersiz(karistir(MERTEBE_ADLARI.filter(function (y) { return y !== x; }).map(ad).concat([uu.ad + ' ' + uu.zaman + '/' + (x.p === 4 ? 8 : 4)]))).filter(function (y) { return y !== ad(x); }).slice(0, 3);
      q.siklar = [ad(x)].concat(dis).map(function (y) { return { key: y, metin: y }; }); q.dogru = ad(x);
    }
    q.dogruMetin = x.ad + ' = ' + uu.ad + ' ' + olcu;
    q.aciklama = 'Bazı mertebelerin kendi adı vardır: ' + MERTEBE_ADLARI.map(function (y) { return '<b>' + y.ad + '</b> (' + USUL[y.u].ad + ' ' + USUL[y.u].zaman + '/' + y.p + ')'; }).join(', ') + '.';
    q.ipucu = '“Ağır” adı genellikle dörtlüklü (yavaş) mertebeye verilir.';
  } else if (tip === 'vur') {
    return usulVurSorusu(u);
  } else if (tip === 'mertebeAd') {
    // varsayılandan farklı bir mertebede yazılmış usulü tanı
    const diger = u.mertebeler.filter(function (m) { return m !== u.payda; });
    const m = usulMertebe(u, diger.length ? rastgele(diger) : u.payda);
    q.soru = { svg: function () { return usulSVG(m); } }; q.alt = m.olcu + ' mertebesinde yazılmış. Bu hangi usul?';
    q.siklar = usulSiklar(u, havuz.filter(function (x) { return x === u || !ayniGorunur(x, u, m.payda); }), true).map(function (x) { return { key: x.id, metin: x.ad }; });
    q.dogru = u.id; q.dogruMetin = u.ad + ' (' + m.olcu + ')';
    q.aciklama = '<b>' + u.ad + '</b> · mertebeleri: ' + u.mertebeler.map(function (p) { return u.zaman + '/' + p; }).join(', ') + '. Mertebe değişince kalıp aynı kalır, yalnızca nota birimi değişir.';
    q.ipucu = 'Notaların birbirine oranına bak: düm ve teklerin sırası aynı kalır.';
  } else if (tip === 'mertebeNota') {
    const p = rastgele(u.mertebeler.length > 1 ? u.mertebeler.filter(function (x) { return x !== u.payda; }) : u.mertebeler);
    const m = usulMertebe(u, p);
    // çeldiriciler: aynı usulün başka mertebeleri + aynı zamanlı başka usullerin bu mertebesi
    const adaylar = [];
    [2, 4, 8, 16].forEach(function (x) { if (x !== p && u.olaylar.every(function (e) { return (e.u * u.payda / x) % 1 === 0; })) adaylar.push({ key: 'm' + x, u: usulMertebe(u, x) }); });
    havuz.filter(function (x) { return x !== u && x.zaman === u.zaman && !ayniGorunur(x, u, p); }).forEach(function (x) {
      if (x.olaylar.every(function (e) { return (e.u * x.payda / p) % 1 === 0; })) adaylar.push({ key: x.id, u: usulMertebe(x, p) });
    });
    const dis = karistir(adaylar).slice(0, 3);
    q.soru = { metin: u.ad + ' · ' + m.olcu, kucuk: true }; q.alt = 'Bu mertebedeki doğru yazım hangisi?';
    q.siklar = [{ key: 'd', svg: function () { return usulSVG(m, { olcu: null }); } }].concat(dis.map(function (x) { return svgSik(x.key, function () { return usulSVG(x.u, { olcu: null }); }); }));
    q.dogru = 'd'; q.dogruMetin = m.olcu + ': ' + m.olaylar.map(function (e) { return e.hece; }).join(' ');
    q.aciklama = '<b>' + u.ad + '</b> ' + m.olcu + ' mertebesinde: bir zaman = bir ' + usulBirimAd(m) + '. Mertebeleri: ' + u.mertebeler.map(function (x) { return u.zaman + '/' + x; }).join(', ') + '.';
    q.ipucu = 'Toplam ' + u.zaman + ' tane ' + usulBirimAd(m) + ' olmalı.';
  } else if (tip === 'birlesim') {
    const dogru = birlesimMetni(u);
    const dis = benzersiz(karistir(USULLER.filter(function (x) { return x.birlesim && birlesimMetni(x) !== dogru; })).map(birlesimMetni)).slice(0, 3);
    q.soru = { metin: u.ad }; q.alt = 'Hangi küçük usullerin birleşimi?';
    q.siklar = [dogru].concat(dis).map(function (x) { return { key: x, metin: x }; });
    q.dogru = dogru; q.dogruMetin = dogru;
    q.aciklama = '<b>' + u.ad + '</b> (' + u.zaman + ') = ' + u.birlesim.map(function (i) { return USUL[i].ad + ' (' + USUL[i].zaman + ')'; }).join(' + ');
    q.ipucu = 'Zamanları topla: ' + u.zaman + ' etmeli.';
  } else if (tip === 'birlesimAd') {
    const b = birlesimMetni(u);
    q.soru = { metin: b, kucuk: true }; q.alt = 'Bu birleşim hangi usul?';
    const dis = karistir(USULLER.filter(function (x) { return x !== u && birlesimMetni(x) !== b; })).sort(function (a, c) { return (a.zaman === u.zaman ? 0 : 1) - (c.zaman === u.zaman ? 0 : 1); }).slice(0, 3);
    q.siklar = [u].concat(dis).map(function (x) { return { key: x.id, metin: x.ad }; });
    q.dogru = u.id; q.dogruMetin = u.ad;
    q.aciklama = '<b>' + b + '</b> = <b>' + u.ad + '</b> (' + u.zaman + ' zaman)';
  }
  return q;
}
// Birleşimi başka bir usulle aynı olanlar "birleşimden ada" sorusunda kullanılmaz (Aksak / Evfer gibi)
function birlesimTek(u) { return u.birlesim && USULLER.filter(function (x) { return birlesimMetni(x) === birlesimMetni(u); }).length === 1; }
function usulVurSorusu(u) {
  const devir = 1;
  const sn = usulOnaltilikSn(u) * 1.25;   // vurarken biraz daha yavaş
  return {
    oge: null, tip: 'vur', soru: { metin: u.ad, kucuk: true }, alt: 'Usulü kendi başına vur: sapı yukarı sağ el, aşağı sol el',
    vur: { gorsel: function (ek) { return usulSVG(u, ek); }, olaylar: u.olaylar, onaltilikSn: sn, devir: devir,
      sayim: { vurus: u.zaman, u: u.birim }, tik: u.birim, ikiTus: true, dinle: { olaylar: u.olaylar, onaltilikSn: usulOnaltilikSn(u), devir: 1 } },
    dogruMetin: u.olaylar.map(function (e) { return e.hece; }).join(' '), aciklama: usulAciklama(u), ipucu: 'Önce dinle, sonra hecelerle içinden söyleyerek vur.'
  };
}
function usulUretici(havuzIds, tipler, yeniIds, yeniOran) {
  return function (n) {
    const havuz = usuller(havuzIds), yeni = yeniIds ? usuller(yeniIds) : [];
    const L = [];
    let onceki = null;
    for (let i = 0; i < n; i++) {
      let u;
      for (let d = 0; d < 10; d++) { u = rastgele(yeni.length && Math.random() < (yeniOran || 0.7) ? yeni : havuz); if (u !== onceki) break; }
      onceki = u;
      let tip = tipler[i % tipler.length];
      if ((tip === 'birlesim' || tip === 'birlesimAd') && !u.birlesim) tip = 'mertebeAd';
      if (tip === 'birlesimAd' && !birlesimTek(u)) tip = 'birlesim';
      if ((tip === 'mertebeAd' || tip === 'mertebeNota' || tip === 'mertebeEs' || tip === 'mertebeBul') && u.mertebeler.length < 2) tip = u.birlesim ? 'birlesim' : 'hece';
      if (tip === 'heceDizi' && u.olaylar.length > 8) tip = 'hece';
      if (tip === 'dinleVurus') tip = 'gorDinleAd';
      L.push(usulSoru(tip, u, havuz));
    }
    return karistir(L);
  };
}

// ---- Tartım soruları ----
function tartimSoru(tip, t, havuz) {
  const q = { oge: null, tip: 'secim', aciklama: '<b>' + t.ad + '</b>: ' + t.tarif, ipucu: t.olaylar.length + ' ses' };
  const sik = function () { return [t].concat(karistir(havuz.filter(function (x) { return x !== t; })).slice(0, 3)); };
  if (tip === 'notaAd') {
    q.soru = { svg: function () { return tartimSVG([t], { heceYok: true, enAz: 120 }); } }; q.alt = 'Bu tartımın adı ne?';
    q.siklar = sik().map(function (x) { return { key: x.id, metin: x.ad }; }); q.dogru = t.id; q.dogruMetin = t.ad;
  } else if (tip === 'adNota') {
    q.soru = { metin: t.ad }; q.alt = 'Doğru tartım hangisi?';
    q.siklar = sik().map(function (x) { return svgSik(x.id, function () { return tartimSVG([x], { heceYok: true, enAz: 110 }); }, false); });
    q.dogru = t.id; q.dogruMetin = t.tarif;
  } else if (tip === 'dinleAd') {
    q.soru = {}; q.alt = 'Her vuruşta aynı tartım çalıyor. Hangisi?';
    q.dinle = { olaylar: t.olaylar, onaltilikSn: 60 / TARTIM_TEMPO / 4, devir: 3, sayim: { vurus: 2, u: t.grup }, tik: t.grup };
    q.siklar = sik().map(function (x) { return { key: x.id, metin: x.ad }; }); q.dogru = t.id; q.dogruMetin = t.ad;
  } else if (tip === 'olcu') {
    const say = rastgele([2, 3, 4]);
    const L = []; for (let i = 0; i < say; i++) L.push(TARTIM[rastgele(T_IKIDORT)]);
    q.soru = { svg: function () { return tartimSVG(L, { enAz: 160 }); } }; q.alt = 'Bu ölçü hangi ölçü sayısına uyar?';
    q.siklar = ['2/4', '3/4', '4/4', '6/8'].map(function (x) { return { key: x, metin: x }; });
    q.dogru = say + '/4'; q.dogruMetin = say + '/4';
    q.aciklama = 'Her tartım bir dörtlük sürer: ' + L.map(function (x) { return x.ad; }).join(' + ') + ' = ' + say + ' dörtlük → <b>' + say + '/4</b>';
    q.ipucu = 'Tartımları say: her biri bir dörtlük.';
  }
  return q;
}
function tartimVurSorusu(havuzIds) {
  const L = [TARTIM[rastgele(havuzIds)], TARTIM[rastgele(havuzIds)]];
  let olaylar = []; L.forEach(function (t) { olaylar = olaylar.concat(t.olaylar); });
  return {
    oge: null, tip: 'vur', soru: { metin: L.map(function (t) { return t.ad; }).join(' + '), kucuk: true }, alt: 'Tartımı kendi başına vur (2/4, bir ölçü)',
    vur: { gorsel: function (ek) { return tartimSVG(L, ek); }, olaylar: olaylar, onaltilikSn: 60 / TARTIM_TEMPO / 4, devir: 1,
      sayim: { vurus: 2, u: 4 }, tik: 4, ikiTus: false, dinle: { olaylar: olaylar.map(function (e) { return Object.assign({}, e); }), onaltilikSn: 60 / TARTIM_TEMPO / 4, devir: 1, sayim: { vurus: 2, u: 4 }, tik: 4 } },
    dogruMetin: L.map(function (t) { return t.ad; }).join(' + '), aciklama: L.map(function (t) { return '<b>' + t.ad + '</b>: ' + t.tarif; }).join('<br>'),
    ipucu: 'Heceleri içinden söyle: ' + L.map(function (t) { return t.olaylar.map(function (e) { return e.hece; }).join('-'); }).join(' · ')
  };
}
function tartimDikteSorusu(havuzIds) {
  const L = []; for (let i = 0; i < 4; i++) L.push(TARTIM[rastgele(havuzIds)]);
  let olaylar = []; L.forEach(function (t) { olaylar = olaylar.concat(t.olaylar); });
  const tasHavuz = benzersiz(L.concat(karistir(usullerOlmayan(havuzIds)).slice(0, 2)), function (t) { return t.id; });
  return {
    oge: null, tip: 'dizi', soru: { metin: 'Tartım diktesi', kucuk: true }, alt: '2/4, iki ölçü: dört vuruşu sırayla diz',
    dinle: { olaylar: olaylar, onaltilikSn: 60 / TARTIM_TEMPO / 4, devir: 2, sayim: { vurus: 2, u: 4 }, tik: 4 },
    dizi: { havuz: karistir(tasHavuz).map(function (t) { return { key: t.id, metin: t.ad }; }), uzunluk: 4, beklenen: L.map(function (t) { return t.id; }), tekrarli: true },
    dogruMetin: L.map(function (t) { return t.ad; }).join(' · '),
    aciklama: L.map(function (t) { return t.ad; }).join(' · '), ipucu: 'Her vuruşu ayrı dinle; tekrar dinleyebilirsin.'
  };
}
function usullerOlmayan(ids) { return ids.map(function (i) { return TARTIM[i]; }); }
function tartimUretici(havuzIds, tipler) {
  return function (n) {
    const havuz = havuzIds.map(function (i) { return TARTIM[i]; });
    const L = [];
    let onceki = null;
    for (let i = 0; i < n; i++) {
      const tip = tipler[i % tipler.length];
      if (tip === 'vur') { L.push(tartimVurSorusu(havuzIds.filter(function (x) { return x !== 'istanbul'; }))); continue; }
      if (tip === 'dikte') { L.push(tartimDikteSorusu(havuzIds.filter(function (x) { return x !== 'istanbul'; }))); continue; }
      let t;
      for (let d = 0; d < 10; d++) { t = rastgele(havuz); if (t !== onceki) break; }
      onceki = t;
      L.push(tartimSoru(tip, t, havuz));
    }
    return karistir(L);
  };
}

// =====================================================
// ÜNİTELER
// =====================================================
function uUnite(id, no, ad, kisa, seviyeler) { return { id: id, dal: 'usul', no: no, ad: ad, kisa: kisa, ogeler: [], seviyeler: seviyeler }; }
const MERTEBELI = function (L) { return L.filter(function (i) { return USUL[i].mertebeler.length > 1; }); };
const USUL_UNITELER = [
  uUnite('u1', 1, 'İlk usuller: Nim Sofyan ve Semai', 'İki ve üç zamanlı basit usuller; vuruş heceleri, eller ve zaman', [
    { id: 'u1-1', tip: 'seviye', ad: 'Gör, dinle, tanı', soruSay: 8, uret: usulUretici(['nimsofyan', 'semai'], ['gorDinleAd', 'hece', 'el', 'bilgi']) },
    { id: 'u1-2', tip: 'seviye', ad: 'Zaman ve heceler', soruSay: 6, uret: usulUretici(['nimsofyan', 'semai'], ['notaZaman', 'heceDizi', 'zaman']) },
    { id: 'u1-yer', tip: 'yer', ad: 'İlk vuruşların: Nim Sofyan ve Semai', soruSay: 4, uret: usulUretici(['nimsofyan', 'semai'], ['vur']) },
    { id: 'u1-boss', tip: 'boss', ad: 'İlk usuller finali', soruSay: 8, uret: usulUretici(['nimsofyan', 'semai'], ['gorDinleAd', 'heceDizi', 'el', 'eksik', 'notaZaman', 'mertebeEs', 'bilgi']) }
  ]),
  uUnite('u2', 2, 'Temel usuller', 'Nim Sofyan, Semai, Sofyan, Türk Aksağı', [
    { id: 'u2-1', tip: 'seviye', ad: 'Kalıptan ada, addan kalıba', soruSay: 8, uret: usulUretici(U_TEMEL, ['gorDinleAd', 'adNota', 'notaAd']) },
    { id: 'u2-2', tip: 'seviye', ad: 'Heceler, eller ve eksik vuruş', soruSay: 8, uret: usulUretici(U_TEMEL, ['hece', 'heceNota', 'el', 'eksik', 'heceDizi']) },
    { id: 'u2-m', tip: 'seviye', ad: 'Mertebeler', soruSay: 8, uret: usulUretici(MERTEBELI(U_TEMEL), ['mertebeEs', 'birim', 'mertebeBul', 'mertebeAd']) },
    { id: 'u2-3', tip: 'seviye', ad: '🔊 Dinle, usulü bul', soruSay: 6, uret: usulUretici(U_TEMEL, ['dinleAd']) },
    { id: 'u2-yer', tip: 'yer', ad: 'Usulü vur', soruSay: 4, uret: usulUretici(U_TEMEL, ['vur']) },
    { id: 'u2-boss', tip: 'boss', ad: 'Temel usuller finali', soruSay: 10, uret: usulUretici(U_TEMEL, ['notaAd', 'adNota', 'hece', 'eksik', 'mertebeEs', 'dinleAd', 'el', 'zaman']) }
  ]),
  uUnite('u3', 3, 'Aksak usuller', 'Devr-i Hindî, Devr-i Turan, Aksak, Evfer, Oynak, Raks Aksağı', [
    { id: 'u3-1', tip: 'seviye', ad: 'Kalıptan ada, addan kalıba', soruSay: 8, uret: usulUretici(U_TEMEL.concat(U_AKSAK), ['gorDinleAd', 'notaAd', 'adNota'], U_AKSAK) },
    { id: 'u3-2', tip: 'seviye', ad: 'Heceler, zaman ve eksik vuruş', soruSay: 8, uret: usulUretici(U_TEMEL.concat(U_AKSAK), ['hece', 'zaman', 'heceNota', 'eksik', 'heceDizi', 'el'], U_AKSAK) },
    { id: 'u3-m', tip: 'seviye', ad: 'Mertebeler', soruSay: 8, uret: usulUretici(MERTEBELI(U_AKSAK), ['mertebeEs', 'mertebeBul', 'birim', 'mertebeAd', 'mertebeAdi'], ['aksak']) },
    { id: 'u3-3', tip: 'seviye', ad: '🔊 Dinle, usulü bul', soruSay: 6, uret: usulUretici(U_TEMEL.concat(U_AKSAK), ['dinleAd'], U_AKSAK) },
    { id: 'u3-yer', tip: 'yer', ad: 'Usulü vur', soruSay: 4, uret: usulUretici(U_AKSAK, ['vur']) },
    { id: 'u3-boss', tip: 'boss', ad: 'Aksak usuller finali', soruSay: 10, uret: usulUretici(U_TEMEL.concat(U_AKSAK), ['notaAd', 'adNota', 'hece', 'eksik', 'mertebeEs', 'dinleAd', 'zaman'], U_AKSAK) }
  ]),
  uUnite('u4', 4, 'Altı, sekiz ve on zamanlılar', 'Yürük Semai, Düyek, Müsemmen, Curcuna, Aksak Semai', [
    { id: 'u4-1', tip: 'seviye', ad: 'Kalıptan ada, addan kalıba', soruSay: 8, uret: usulUretici(U_TUM, ['gorDinleAd', 'notaAd', 'adNota'], U_UZUN) },
    { id: 'u4-2', tip: 'seviye', ad: 'Heceler, zaman ve eksik vuruş', soruSay: 8, uret: usulUretici(U_TUM, ['hece', 'zaman', 'heceNota', 'eksik', 'notaZaman', 'el'], U_UZUN) },
    { id: 'u4-m', tip: 'seviye', ad: 'Mertebeler ve adları', soruSay: 8, uret: usulUretici(MERTEBELI(U_UZUN), ['mertebeEs', 'mertebeBul', 'mertebeAdi', 'mertebeAd', 'birim'], ['yuruksemai', 'duyek', 'aksaksemai']) },
    { id: 'u4-3', tip: 'seviye', ad: '🔊 Dinle, usulü bul', soruSay: 6, uret: usulUretici(U_TUM, ['dinleAd'], U_UZUN) },
    { id: 'u4-yer', tip: 'yer', ad: 'Usulü vur', soruSay: 4, uret: usulUretici(U_UZUN, ['vur']) },
    { id: 'u4-boss', tip: 'boss', ad: 'Usuller finali', soruSay: 10, uret: usulUretici(U_TUM, ['notaAd', 'adNota', 'hece', 'eksik', 'mertebeEs', 'dinleAd', 'zaman', 'bilgi'], U_UZUN) }
  ]),
  uUnite('u5', 5, 'Usul kulağı', 'Aynı zamanlı usulleri ayırt et', [
    { id: 'u5-1', tip: 'seviye', ad: 'Aynı zamanlılar: kalıp', soruSay: 8, uret: usulUretici(U_TUM, ['notaAdAyni', 'adNotaAyni', 'heceAyni']) },
    { id: 'u5-2', tip: 'seviye', ad: '🔊 Aynı zamanlılar: dinle', soruSay: 8, uret: usulUretici(U_TUM, ['dinleAdAyni']) },
    { id: 'u5-yer', tip: 'yer', ad: 'Her usulü vur', soruSay: 5, uret: usulUretici(U_TUM, ['vur']) },
    { id: 'u5-boss', tip: 'boss', ad: 'Usul büyük finali', soruSay: 12, uret: usulUretici(U_TUM, ['dinleAdAyni', 'notaAdAyni', 'eksik', 'adNotaAyni', 'vur', 'mertebeEs', 'hece']) }
  ])
];
USUL_UNITELER.push(
  uUnite('u6', 6, 'Mertebe ve birleşim', 'Aynı usul, farklı nota birimi; büyük usuller küçüklerden', [
    { id: 'u6-1', tip: 'seviye', ad: 'Küçük usullerin birleşimi', soruSay: 8, uret: usulUretici(U_TUM.filter(function (i) { return USUL[i].birlesim; }), ['birlesim', 'birlesimAd']) },
    { id: 'u6-2', tip: 'seviye', ad: 'Başka mertebede tanı', soruSay: 8, uret: usulUretici(MERTEBELI(U_TUM), ['mertebeAd', 'mertebeEs', 'mertebeBul', 'mertebeAdi']) },
    { id: 'u6-3', tip: 'seviye', ad: 'Mertebedeki doğru yazım', soruSay: 6, uret: usulUretici(MERTEBELI(U_TUM), ['mertebeNota', 'mertebeEs']) },
    { id: 'u6-boss', tip: 'boss', ad: 'Mertebe ve birleşim finali', soruSay: 10, uret: usulUretici(U_TUM, ['birlesim', 'mertebeAd', 'birlesimAd', 'mertebeNota', 'mertebeEs']) }
  ]),
  uUnite('u7', 7, 'Beş usul daha', 'Mürekkeb Nim Sofyan, Mürekkeb Semai, Kapalı Curcuna, Lenk Fâhte, Çeng-i Harbî', [
    { id: 'u7-1', tip: 'seviye', ad: 'Kalıptan ada, addan kalıba', soruSay: 8, uret: usulUretici(U_HEPSI, ['gorDinleAd', 'notaAd', 'adNota'], U_EK, 0.75) },
    { id: 'u7-2', tip: 'seviye', ad: 'Heceler, zaman, birleşim', soruSay: 8, uret: usulUretici(U_HEPSI, ['hece', 'zaman', 'birlesim', 'eksik', 'heceNota'], U_EK, 0.75) },
    { id: 'u7-3', tip: 'seviye', ad: '🔊 Dinle, usulü bul', soruSay: 6, uret: usulUretici(U_HEPSI, ['dinleAdAyni'], U_EK, 0.7) },
    { id: 'u7-yer', tip: 'yer', ad: 'Usulü vur', soruSay: 4, uret: usulUretici(U_EK, ['vur']) },
    { id: 'u7-boss', tip: 'boss', ad: 'Bütün usuller: büyük final', soruSay: 12, uret: usulUretici(U_HEPSI, ['notaAdAyni', 'dinleAdAyni', 'birlesim', 'mertebeAd', 'eksik', 'adNotaAyni', 'hece', 'mertebeEs'], U_EK, 0.4) }
  ])
);
USUL_UNITELER[5].ders = function () {
  const ak = USUL.aksak;
  return [
    { baslik: 'Mertebe nedir?', cizim: function () { return h('div', null, h('div', { class: 'ritimKutu' }, usulSVG(ak)), h('div', { class: 'ritimKutu' }, usulSVG(usulMertebe(ak, 4)))); }, metin:
      '<p>Bir usulün hangi nota birimiyle yazıldığına <b>mertebe</b> denir. Aksak 9/8 mertebesinde sekizliklerle, 9/4 mertebesinde dörtlüklerle yazılır.</p>' +
      '<p>Mertebe değişince <b>kalıp aynı kalır</b>: düm ve teklerin sırası ve birbirine oranı değişmez; yalnızca notalar iki kat uzun ya da kısa yazılır.</p>' },
    { baslik: 'Büyük usuller küçüklerden', metin:
      '<p>Büyük usuller, küçük usullerin birleşimiyle kurulur:</p>' +
      '<p>' + USULLER.filter(function (u) { return u.birlesim && U_TUM.indexOf(u.id) >= 0; }).map(function (u) { return '<b>' + u.ad + '</b> (' + u.zaman + ') = ' + birlesimMetni(u); }).join('<br>') + '</p>' +
      '<p class="soluk">Aksak ile Evfer’in parçaları aynıdır; ayıran şey ikinci parçadaki tek ve teek’in sırası.</p>' },
    { baslik: 'Aynı kalıp, farklı mertebe', cizim: function () { return h('div', null, h('div', { class: 'ritimKutu' }, usulSVG(USUL.curcuna)), h('div', { class: 'ritimKutu' }, usulSVG(usulMertebe(USUL.aksaksemai, 16)))); }, metin:
      '<p>Tablodaki <b>Curcuna</b> (10/16) ile <b>Aksak Semai</b>’nin 10/16 mertebesi kâğıtta aynı kalıptır. Aksak Semai genellikle 10/8 yazılır ve daha ağır icra edilir.</p>' }
  ];
};
USUL_UNITELER[6].ders = function () {
  return [{ baslik: 'Beş usul daha', metin: '<p>10 zamana kadar olan ve şimdiye kadar görmediğin beş usul. <b>Kapalı Curcuna</b> ile bildiğin Curcuna’nın kalıpları farklıdır: dikkat!</p>' }]
    .concat(usuller(U_EK).map(usulKarti));
};
function usulKarti(u) {
  return { baslik: u.ad + ' · ' + u.olcu, cizim: function () {
    return h('div', null, h('div', { class: 'ritimKutu' }, usulSVG(u)), dugme('🔊 Dinle', function () { ritimCal({ olaylar: u.olaylar, onaltilikSn: function () { return usulOnaltilikSn(u); }, devir: 2 }); }, 'ince'));
  }, metin: '<p><b>' + u.zaman + ' zamanlı</b> (' + u.olcu + ') · ' + u.olaylar.map(function (e) { return e.hece; }).join(' ') + '</p>' +
    '<p class="soluk">Mertebeleri: ' + u.mertebeler.map(function (x) { return u.zaman + '/' + x; }).join(', ') + (u.birlesim ? ' · ' + birlesimMetni(u) : '') + '</p>' };
}
USUL_UNITELER[0].ders = function () {
  return [
    { baslik: 'Usul nedir?', metin:
      '<p><b>Usul</b>, Türk müziğinde eserin ritmini düzenleyen, kuvvetli ve zayıf vuruşların belli bir sırayla tekrarlandığı kalıptır. Kudüm, bendir ya da dizlere vurularak çalınır.</p>' +
      '<p>Usulün her vuruş birimine <b>zaman</b> denir: Semai 3 zamanlı, Aksak 9 zamanlıdır. Usulün baştan sona bir kez vurulmasına <b>devir</b> denir.</p>' },
    { baslik: 'Düm, tek, te, ke', metin:
      '<p>Usulün vuruşları hecelerle söylenir: <b>düm</b> kuvvetli vuruş, <b>tek</b> hafif vuruş; <b>te-ke</b> iki hafif vuruş, <b>kâ</b> da hafif bir vuruştur. Usulü önce hecelerini söyleyerek öğren.</p>' +
      '<p>Hangi elle vurulacağını notanın <b>sapı</b> gösterir: sap <b>yukarı</b> ise <b>sağ el</b>, <b>aşağı</b> ise <b>sol el</b>. Örneğin Sofyan’da düm sağ, te sağ, ke sol elle vurulur.</p>' },
    { baslik: 'Usul nasıl yazılır?', cizim: function () { return h('div', { class: 'ritimKutu' }, usulSVG(USUL.semai)); }, metin:
      '<p>Usul tek çizgili porteye yazılır. <b>Sapı yukarı</b> olan nota <b>sağ el</b>, <b>sapı aşağı</b> olan nota <b>sol el</b>le vurulur.</p>' +
      '<p>Hecedeki uzatma süreyi gösterir: <b>düm</b> kısa, <b>düüm</b> iki kat, <b>düüüm</b> üç kat.</p>' },
    { baslik: 'İlk iki usul', cizim: function () { return h('div', null, h('div', { class: 'ritimKutu' }, usulSVG(USUL.nimsofyan)), h('div', { class: 'ritimKutu' }, usulSVG(USUL.semai))); }, metin:
      '<p><b>Nim Sofyan</b> (2/4): düm tek<br><b>Semai</b> (3/4): düm tek tek</p>' +
      '<p>✍️ seviyelerinde usulü ekrana vuracaksın: sapı yukarı olan notalar için sağ yarıya (<b>sağ el</b>), aşağı olanlar için sol yarıya (<b>sol el</b>). Önce birkaç tık hızı verir; sonra <b>kendi başına</b> vurursun, uygulama sana eşlik etmez. Vuruşların arasındaki oranlar doğruysa geçersin; biraz yavaş vurman sorun değil.</p>' },
    { baslik: 'Mertebe', cizim: function () { return h('div', null, h('div', { class: 'ritimKutu' }, usulSVG(usulMertebe(USUL.semai, 4))), h('div', { class: 'ritimKutu' }, usulSVG(usulMertebe(USUL.semai, 8)))); }, metin:
      '<p>Aynı usul farklı nota birimleriyle yazılabilir: Semai <b>3/4</b> ya da <b>3/8</b>. Buna <b>mertebe</b> denir. Vuruşlar ve heceler aynı kalır, yalnızca nota birimi değişir.</p>' }
  ];
};
USUL_UNITELER[1].ders = function () {
  return [{ baslik: 'Temel usuller', metin: '<p>Küçük usuller, büyük usullerin yapı taşıdır. Örneğin <b>Türk Aksağı</b> (5) bir <b>Nim Sofyan</b> (2) ile bir <b>Semai</b>’nin (3) birleşimidir.</p>' }]
    .concat(usuller(U_TEMEL).map(usulKarti));
};
USUL_UNITELER[2].ders = function () {
  return [{ baslik: 'Aksak usuller', metin: '<p>Zamanları eşit gruplanmayan (2+2+2+3 gibi) usullere aksak usul denir. Aynı zaman sayısındaki usuller, <b>dümlerin yeriyle</b> ayrılır.</p><p>Aksak, Evfer, Oynak ve Raks Aksağı’nın dördü de 9 zamanlıdır: farklarına dikkat et.</p>' }]
    .concat(usuller(U_AKSAK).map(usulKarti));
};
USUL_UNITELER[3].ders = function () {
  return [{ baslik: 'Uzun küçük usuller', metin: '<p><b>Yürük Semai</b> (6) iki semaiden oluşur. <b>Düyek</b> ve <b>Müsemmen</b> 8, <b>Curcuna</b> ve <b>Aksak Semai</b> 10 zamanlıdır.</p><p>Curcuna onaltılık, Aksak Semai sekizlik birimle yazılır: kalıpları benzer, hızları farklıdır.</p>' },
    { baslik: 'Adı olan mertebeler', metin: '<p>Bazı mertebelerin kendi adı vardır. Genellikle dörtlüklü, ağır mertebeye <b>Ağır</b> denir:</p><p><b>Yürük Semai</b> 6/8 (<b>Sengin Semai</b> de 6/8 yazılır; daha ağır icra edilir)<br><b>Ağır Düyek</b> 8/4<br><b>Ağır Aksak</b> 9/4<br><b>Ağır Aksak Semai</b> 10/4</p>' }]
    .concat(usuller(U_UZUN).map(usulKarti));
};
USUL_UNITELER[4].ders = function () {
  return [{ baslik: 'Usul kulağı', metin: '<p>Bu ünitede şıklar hep <b>aynı zaman sayısında</b> olacak: 9 zamanlılar kendi aralarında, 8’ler ve 10’lar kendi aralarında. Kalıbı ve dinlediğini dümlerin yerinden tanı.</p><p>İpucu: 🥁 <b>Bendir</b> aracıyla (Öğren sekmesinde) her usulü istediğin hızda dinleyebilirsin.</p>' }];
};

// ---- Batı Teorisi: tartım üniteleri ----
function tartimKarti(t) {
  return { baslik: t.ad, cizim: function () {
    return h('div', null, h('div', { class: 'ritimKutu' }, tartimSVG([t], { enAz: 140 })),
      dugme('🔊 Dinle', function () { ritimCal({ olaylar: t.olaylar, onaltilikSn: function () { return 60 / TARTIM_TEMPO / 4; }, devir: 4, sayim: { vurus: 2, u: t.grup }, tik: t.grup }); }, 'ince'));
  }, metin: '<p><b>' + t.ad + '</b>: ' + t.tarif + '</p>' };
}

// =====================================================
// SORU EKRANI: DİNLE DÜĞMESİ ve VUR (ekrana vurma) SORUSU
// =====================================================
function dinleDugmesi(d, otomatik) {
  if (d && d.kulak && typeof kulakDugmeler === 'function') return kulakDugmeler(d, otomatik);   // 3.1: perde ve ezgi dinleme
  const b = h('button', { class: 'dugme ince dinleDugme', type: 'button' }, otomatik ? '🔊 Tekrar dinle' : '🔊 Dinle');
  const cal = function () {
    b.classList.add('caliyor');
    ritimCal({ olaylar: d.olaylar, onaltilikSn: function () { return d.onaltilikSn; }, devir: d.devir || 1, sayim: d.sayim, tik: d.tik,
      bitince: function () { b.classList.remove('caliyor'); } });
  };
  b.onclick = cal;
  if (otomatik) setTimeout(function () { if (document.body.contains(b)) cal(); }, 250);
  return b;
}

function vurCiz(alan, veri, q) {
  const v = veri.vur;
  const gorsel = h('div', { class: 'ritimKutu' }, v.gorsel({}));
  const durum = h('div', { class: 'vurDurum' }, '“Başla”ya basınca ' + (v.sayim ? v.sayim.vurus : 0) + ' tık hızı verir; sonra kendin vurursun.');
  const tuslar = h('div', { class: 'vurTuslar' + (v.ikiTus ? '' : ' tek') });
  const tusSol = v.ikiTus ? h('button', { class: 'vurTus sol', type: 'button' }, h('b', null, 'SOL EL'), h('small', null, 'sap aşağı · F')) : null;
  const tusSag = h('button', { class: 'vurTus sag', type: 'button' }, h('b', null, v.ikiTus ? 'SAĞ EL' : 'VUR'), h('small', null, v.ikiTus ? 'sap yukarı · J' : 'boşluk'));
  if (tusSol) tuslar.appendChild(tusSol);
  tuslar.appendChild(tusSag);
  const basla = dugme('▶ Başla', function () { baslat(); }, '');
  const dinle = v.dinle ? dinleDugmesi(v.dinle, false) : null;
  alan.appendChild(gorsel);
  alan.appendChild(h('div', { class: 'vurDugmeler' + (dinle ? '' : ' tekDugme') }, dinle, basla));
  alan.appendChild(durum);
  alan.appendChild(tuslar);
  const V = q.vur = { beklenen: [], vuruslar: [], aktif: false, bitis: 0 };
  function tus(pad) {
    if (!V.aktif) return;
    const z = SES.ctx.currentTime;
    if (z < V.sayimBitis - 0.25) return;            // sayım tıklarına vurulanları sayma
    V.vuruslar.push({ z: z, pad: pad });
    // sıradaki beklenen vuruşun sesini çal (iki elde)
    let ses = 'ton';
    if (v.ikiTus) { const b = V.beklenen[V.vuruslar.length - 1]; ses = b && b.pad === pad ? b.s : (pad === 'D' ? 'D' : 'T'); }
    vurusCal(ses, z, 0.8);
    const el = pad === 'D' ? tusSag : tusSol;
    if (el) { el.classList.add('basildi'); setTimeout(function () { el.classList.remove('basildi'); }, 90); }
    if (V.vuruslar.length === 1) durum.textContent = '🥁 Devam…';
    zamanlayiciKur();
  }
  V.tap = tus;
  tusSag.addEventListener('pointerdown', function (e) { e.preventDefault(); tus('D'); });
  if (tusSol) tusSol.addEventListener('pointerdown', function (e) { e.preventDefault(); tus('T'); });
  V.klavye = function (k) {
    if (!V.aktif) return false;
    if (v.ikiTus) { if (k === 'j' || k === 'J') { tus('D'); return true; } if (k === 'f' || k === 'F') { tus('T'); return true; } }
    else if (k === ' ' || k === 'j' || k === 'J' || k === 'f' || k === 'F') { tus('D'); return true; }
    return false;
  };
  // Değerlendirme zamanı: bütün vuruşlar gelince kısa bir bekleme; hiç gelmezse ya da yarım kalırsa süre dolunca
  function zamanlayiciKur() {
    clearTimeout(V.t);
    const n = V.vuruslar.length, N = V.beklenen.length;
    const toplam = V.beklenen.length ? V.beklenenSure : 0;     // 16'lık birimde
    let ms;
    if (!n) ms = (V.sayimBitis - SES.ctx.currentTime) * 1000 + 7000;
    else if (n >= N) ms = 700;
    else ms = Math.max(2500, toplam * V.sn * 2.6 * 1000 / Math.max(1, N) * 2 + 1200);   // takılıp kaldıysa
    V.t = setTimeout(degerlendir, ms);
  }
  function baslat() {
    if (q.cevaplandi) return;
    otoIptal();
    ritimDur();
    const c = sesBaglam();
    if (!c) { toast('Bu tarayıcı ses çalamıyor'); return; }
    sesHazirla();
    basla.disabled = true; if (dinle) dinle.disabled = true;
    V.vuruslar = []; V.beklenen = [];
    const sn = V.sn = v.onaltilikSn;
    let t = 0;
    for (let d = 0; d < v.devir; d++) v.olaylar.forEach(function (e, ei) { if (e.s === null) { t += e.u; return; } V.beklenen.push({ e: t, s: e.s, pad: !v.ikiTus || e.sap !== 'd' ? 'D' : 'T', i: ei }); t += e.u; });
    V.beklenenSure = t;
    // yalnızca sayım tıkları; sonra sessizlik: öğrenci kendi vurur
    const sayi = v.sayim ? v.sayim.vurus : 4, birim = v.sayim ? v.sayim.u : 4;
    const bas = c.currentTime + 0.15;
    for (let k = 0; k < sayi; k++) vurusCal(k === 0 ? 'tikV' : 'tik', bas + k * birim * sn, 1);
    V.sayimBitis = bas + sayi * birim * sn;
    durum.textContent = 'Dinle: ' + sayi + ' tık bu hızı veriyor… sonra kendin vur';
    setTimeout(function () { if (!q.cevaplandi && !V.vuruslar.length) durum.textContent = '🥁 Şimdi vur! (aynı hızda)'; }, Math.max(0, (V.sayimBitis - c.currentTime) * 1000 - 120));
    V.aktif = true;
    zamanlayiciKur();
  }
  // Senkron değil, aralık ölçümü: vuruşlara en uygun hız (doğrusal uydurma) bulunur;
  // her vuruş bu hıza göre beklenen yerine yakın mı ona bakılır. Gecikme ve başlama anı önemsizdir.
  function degerlendir() {
    clearTimeout(V.t);
    if (q.cevaplandi || !TUR || TUR.q !== q) { V.aktif = false; return; }
    V.aktif = false;
    const B = V.beklenen, N = B.length, T = V.vuruslar;
    const n = Math.min(T.length, N), fazla = Math.max(0, T.length - N);
    const sonuc = B.map(function () { return 'kacti'; });
    const not = [];
    let tempoMetin = '', dogru = false, yavas = false, hizli = false;
    const hedefTempo = Math.round(60 / (V.sn * (v.sayim ? v.sayim.u : 4)));
    if (n >= 2) {
      // T_i ≈ a + k·E_i
      const E = B.slice(0, n).map(function (b) { return b.e; }), X = T.slice(0, n).map(function (x) { return x.z - T[0].z; });
      const me = E.reduce(function (s, x) { return s + x; }, 0) / n, mx = X.reduce(function (s, x) { return s + x; }, 0) / n;
      let pay = 0, payda = 0;
      for (let i = 0; i < n; i++) { pay += (E[i] - me) * (X[i] - mx); payda += (E[i] - me) * (E[i] - me); }
      const k = payda > 0 ? pay / payda : V.sn, a0 = mx - k * me;
      const enKisa = Math.min.apply(null, v.olaylar.filter(function (e) { return e.s !== null; }).map(function (e) { return e.u; }));
      const tol = Math.max(0.06, Math.min(0.25, 0.38 * k * enKisa));
      for (let i = 0; i < n; i++) {
        const fark = X[i] - (a0 + k * E[i]);
        if (Math.abs(fark) > tol) { sonuc[i] = 'zaman'; not.push((B[i].i + 1) + '. vuruş ' + (fark < 0 ? 'erken' : 'geç')); }
        else if (T[i].pad !== B[i].pad) { sonuc[i] = 'el'; not.push((B[i].i + 1) + '. vuruş öbür elle'); }
        else sonuc[i] = 'dogru';
      }
      const tempo = Math.round(60 / (k * (v.sayim ? v.sayim.u : 4)));
      const oran = tempo / hedefTempo;
      tempoMetin = 'Tempon ' + tempo + ' (hedef ' + hedefTempo + ')';
      hizli = oran > 1.4; yavas = oran < 0.8;
    }
    const isabet = sonuc.filter(function (x) { return x === 'dogru'; }).length;
    dogru = isabet === N && fazla <= 1 && !hizli;
    // görsel: renkler
    const renk = v.olaylar.map(function (_, i) {
      let iyi = true;
      B.forEach(function (b, j) { if (b.i === i && sonuc[j] !== 'dogru') iyi = false; });
      return iyi ? 'var(--dogru)' : 'var(--yanlis)';
    });
    bosalt(gorsel).appendChild(v.gorsel({}));
    gorsel.querySelectorAll('.ritimNota').forEach(function (g) { const r = renk[+g.dataset.i]; if (r) g.setAttribute('style', 'color:' + r); });
    let mesaj;
    if (dogru) mesaj = '🥁 ' + N + ' / ' + N + ' vuruş yerinde!' + (yavas ? ' Ama hızın yavaştı.' : '');
    else if (T.length < N) mesaj = 'Vuruş eksik: ' + T.length + ' / ' + N;
    else if (hizli) mesaj = 'Aralıklar ' + (isabet === N ? 'doğru' : isabet + ' / ' + N) + ' ama çok hızlı vurdun';
    else mesaj = 'Yerinde: ' + isabet + ' / ' + N + (fazla ? ' · ' + fazla + ' fazla vuruş' : '');
    const ek = [];
    if (tempoMetin) ek.push(tempoMetin + (yavas ? ': yavaş vurdun, verilen hıza yaklaşmaya çalış.' : hizli ? ': çok hızlı.' : '.'));
    if (not.length && !dogru) ek.push(not.slice(0, 4).join(', ') + '.');
    if (!dogru && T.length < N) ek.push('Bütün notaları vur; ilk vuruşunla süre başlar, sonra aynı hızda devam et.');
    if (!dogru && T.length >= N) ek.push(v.dinle ? 'Önce 🔊 ile dinle, içinden söyleyerek vur.' : 'Önce ölçüyü ve vuruşları say, sonra her vuruşun içini söyleyerek vur.');
    q.cevaplandi = true;
    cevapla(dogru, mesaj, null, ek.length ? '<p>' + ek.join('<br>') + '</p>' : null);
  }
  q.vurDegerlendir = degerlendir;
}

// =====================================================
// BENDİR: usul çalar (öğrencinin eser ya da solfej çalışırken kullanacağı araç)
// =====================================================
function bendirSayfasi() {
  sesHazirla();
  const A = DURUM.bendir = Object.assign({ usul: 'aksak', tempo: {}, mertebe: {}, sayim: true, sessiz: false, hizlan: false, ses: 0.9 }, DURUM.bendir || {});
  A.mertebe = A.mertebe || {};
  let ana = USUL[A.usul] || USUL.aksak;
  let u = usulMertebe(ana, A.mertebe[ana.id]);
  const tAnahtar = function () { return ana.id + '/' + u.payda; };
  let tempo = A.tempo[tAnahtar()] || u.tempo, simdiki = tempo;
  const mertebeler = h('div', { class: 'mertebeCipler' });
  function mertebeCiz() {
    bosalt(mertebeler);
    if (ana.mertebeler.length < 2) { mertebeler.appendChild(h('small', { class: 'soluk' }, 'Mertebe: ' + ana.olcu)); return; }
    mertebeler.appendChild(h('small', { class: 'soluk' }, 'Mertebe'));
    ana.mertebeler.forEach(function (m) {
      mertebeler.appendChild(h('button', { class: 'cip' + (m === u.payda ? ' aktif' : ''), type: 'button', onclick: function () {
        const c = !!calan; dur();
        A.mertebe[ana.id] = m; u = usulMertebe(ana, m); tempo = A.tempo[tAnahtar()] || u.tempo; simdiki = tempo;
        kaydet(); mertebeCiz(); ciz(); if (c) cal();
      } }, ana.zaman + '/' + m));
    });
  }
  let calan = null;
  const sec = h('select', { class: 'bendirSec', 'aria-label': 'Usul' });
  [[U_TEMEL, 'Temel'], [U_AKSAK, 'Aksak'], [U_UZUN, '6, 8, 10 zamanlı'], [U_EK, 'Diğer']].forEach(function (g) {
    const og = h('optgroup', { label: g[1] });
    g[0].forEach(function (id) { const x = USUL[id]; og.appendChild(h('option', { value: id, selected: id === u.id }, x.ad + ' · ' + x.olcu)); });
    sec.appendChild(og);
  });
  const nota = h('div', { class: 'ritimKutu buyuk' });
  const tempoYaz = h('b', { class: 'tempoSayi' });
  const birim = h('small', null);
  const kaydir = h('input', { type: 'range', min: 30, max: 320, step: 1, 'aria-label': 'Tempo' });
  const devirYaz = h('div', { class: 'devirSayac' }, ' ');
  const oynat = h('button', { class: 'dugme bendirOynat', type: 'button' }, '▶ Çal');
  const vurgu = function (i) { nota.querySelectorAll('.ritimNota').forEach(function (g) { g.classList.toggle('calan', +g.dataset.i === i); }); };
  function ciz() {
    bosalt(nota).appendChild(usulSVG(u));
    tempoYaz.textContent = String(Math.round(simdiki));
    birim.textContent = ' ' + ({ 2: '𝅗𝅥', 4: '♩', 8: '♪', 16: '𝅘𝅥𝅯' }[u.payda]) + ' / dk';
    kaydir.value = tempo;
  }
  function tempoAyarla(t) {
    tempo = Math.max(30, Math.min(320, Math.round(t)));
    if (!calan || !A.hizlan) simdiki = tempo;
    A.tempo[tAnahtar()] = tempo; kaydet(); ciz();
  }
  function dur() { if (calan) { calan.dur(); calan = null; } oynat.textContent = '▶ Çal'; oynat.classList.remove('caliyor'); vurgu(-1); devirYaz.textContent = ' '; ekranUyanikBirak(); }
  function cal() {
    sesBaglam();
    const hedef = tempo, bas = A.hizlan ? Math.max(30, hedef - 24) : hedef;
    simdiki = bas; ciz();
    calan = ritimCal({
      olaylar: u.olaylar, devir: Infinity, uyanik: true,
      onaltilikSn: function () { return usulOnaltilikSn(u, simdiki); },
      sayim: A.sayim ? { vurus: u.zaman, u: u.birim } : null,
      sessiz: function (d) { return A.sessiz && d % 4 === 3; },
      devirBasi: function (d) {
        if (A.hizlan) { simdiki = Math.min(hedef, bas + 4 * Math.floor(d / 4)); }
        setTimeout(function () { tempoYaz.textContent = String(Math.round(simdiki)); devirYaz.textContent = (d + 1) + '. devir' + (A.sessiz && d % 4 === 3 ? ' · 🤫 içinden say' : ''); }, 0);
      },
      vurusta: function (i) { vurgu(i); }
    });
    if (!calan) return;
    ekranUyanik();
    oynat.textContent = '⏹ Durdur'; oynat.classList.add('caliyor');
  }
  oynat.onclick = function () { if (calan) dur(); else cal(); };
  sec.onchange = function () { const c = !!calan; dur(); ana = USUL[sec.value]; A.usul = ana.id; u = usulMertebe(ana, A.mertebe[ana.id]); tempo = A.tempo[tAnahtar()] || u.tempo; simdiki = tempo; kaydet(); mertebeCiz(); ciz(); if (c) cal(); };
  kaydir.oninput = function () { tempoAyarla(+kaydir.value); };
  const vuruslar = [];
  const tap = dugme('👆 Tap tempo', function () {
    const t = performance.now();
    vuruslar.push(t);
    while (vuruslar.length > 5) vuruslar.shift();
    if (vuruslar.length >= 3) {
      const ara = []; for (let i = 1; i < vuruslar.length; i++) ara.push(vuruslar[i] - vuruslar[i - 1]);
      const ort = ara.reduce(function (a, b) { return a + b; }, 0) / ara.length;
      if (ort > 150 && ort < 2500) tempoAyarla(60000 / ort);
    }
  }, 'ince gri');
  const secim = function (ad, alan, aciklama) {
    const k = h('input', { type: 'checkbox', checked: !!A[alan] });
    k.onchange = function () { A[alan] = k.checked; kaydet(); };
    return h('label', { class: 'bendirSecenek' }, k, h('span', null, h('b', null, ad), h('small', null, aciklama)));
  };
  const sesK = h('input', { type: 'range', min: 0, max: 1, step: 0.05, value: A.ses, 'aria-label': 'Ses' });
  sesK.oninput = function () { A.ses = +sesK.value; sesSeviye(A.ses); kaydet(); };
  sesSeviye(A.ses);
  mertebeCiz();
  ciz();
  modalAc(h('div', { class: 'bendir' },
    h('h2', null, '🥁 Bendir'),
    h('p', { class: 'kucukNot ortala' }, 'Eser ya da solfej çalışırken arkada usul vursun. Ekran açık kaldığı sürece çalar.'),
    sec, mertebeler, nota, devirYaz,
    h('div', { class: 'tempoSatir' },
      dugme('−', function () { tempoAyarla(tempo - 2); }, 'ince gri'),
      h('div', { class: 'tempoGoster' }, tempoYaz, birim),
      dugme('+', function () { tempoAyarla(tempo + 2); }, 'ince gri')),
    kaydir, tap, oynat,
    h('div', { class: 'bendirSecenekler' },
      secim('Başlamadan bir devir say', 'sayim', 'Tık sesleriyle hazırlanırsın'),
      secim('Sessiz devir', 'sessiz', 'Her 4 devirde bir bendir susar, sen içinden sayarsın'),
      secim('Yavaştan hızlan', 'hizlan', '24 aşağıdan başlar, her 4 devirde +4 artar')),
    h('label', { class: 'bendirSes' }, '🔈', sesK, '🔊'),
    dugme('Kapat', modalKapat, 'gri')), { genis: true, kapaninca: dur });
}

// Tekrar için usul öğe sorusu
function usulOgeSorusu(id) {
  const u = USUL[id];
  const havuz = USULLER.filter(function (x) { return U_HEPSI.indexOf(x.id) >= 0; });
  return usulSoru(rastgele(['notaAd', 'adNota', 'zaman', 'hece', 'eksik']), u, havuz);
}
