// =====================================================
// TARTIM 2: dikte ve deşifre odaklı ritim üniteleri (Batı Teorisi dalı)
// Süreler "tık" biriminde: dörtlük = 12 (onaltılık 3, sekizlik 6, üçleme sekizliği 4)
// Kalıp (tartım) = bir ya da birkaç vuruşluk ritim parçası. Ritim = ölçülere dizilmiş kalıplar.
// =====================================================
'use strict';

const TK = 12;   // dörtlükteki tık
// [id, ad (yoksa null), tarif, süreler ('s' sus, '~' sonrakine bağlı, 'u' üçleme), tür, hece]
const KALIP_HAM = [
  // bir vuruş (dörtlük)
  ['van', 'Van', 'bir dörtlük', [12], 'b', ['Van']],
  ['izmir', 'İzmir', 'iki sekizlik', [6, 6], 'b', ['İz', 'mir']],
  ['gelibolu', 'Gelibolu', 'dört onaltılık', [3, 3, 3, 3], 'b', ['Ge', 'li', 'bo', 'lu']],
  ['ankara', 'Ankara', 'sekizlik, iki onaltılık', [6, 3, 3], 'b', ['An', 'ka', 'ra']],
  ['karaman', 'Karaman', 'iki onaltılık, sekizlik', [3, 3, 6], 'b', ['Ka', 'ra', 'man']],
  ['terazi', 'Terazi', 'onaltılık, sekizlik, onaltılık', [3, 6, 3], 'b', ['Te', 'ra', 'zi']],
  ['bursa', 'Bursa', 'noktalı sekizlik, onaltılık', [9, 3], 'b', ['Bur', 'sa']],
  ['sahur', 'Sahur', 'onaltılık, noktalı sekizlik', [3, 9], 'b', ['Sa', 'hur']],
  ['dsus', null, 'dörtlük sus', ['12s'], 'b'],
  ['arka', null, 'sekizlik sus, sekizlik', ['6s', 6], 'b'],
  ['onsus', null, 'sekizlik, sekizlik sus', [6, '6s'], 'b'],
  ['osus', null, 'onaltılık sus, üç onaltılık', ['3s', 3, 3, 3], 'b'],
  ['ucleme', null, 'sekizlik üçleme', ['4u', '4u', '4u'], 'b'],
  ['ucsus', null, 'üçleme: sekizlik, sus, sekizlik', ['4u', '4us', '4u'], 'b'],
  // iki ve daha çok vuruş
  ['ikilik', null, 'ikilik', [24], 'b'],
  ['ndortluk', null, 'noktalı dörtlük, sekizlik', [18, 6], 'b'],
  ['senkop', null, 'sekizlik, dörtlük, sekizlik (senkop)', [6, 12, 6], 'b'],
  ['bagli', null, 'sekizlik, bağlı iki sekizlik, sekizlik', [6, '6~', 6, 6], 'b'],
  ['bagdort', null, 'dörtlük, bağlı sekizlik, sekizlik', ['12~', 6, 6], 'b'],
  ['dortlukuc', null, 'dörtlük üçleme (iki vuruşa üç ses)', ['8u', '8u', '8u'], 'b'],
  ['nikilik', null, 'noktalı ikilik', [36], 'b'],
  ['birlik', null, 'birlik', [48], 'b'],
  ['isus', null, 'ikilik sus', ['24s'], 'b'],
  // bileşik ölçü (6/8): bir vuruş = noktalı dörtlük
  ['istanbul', 'İstanbul', 'üç sekizlik', [6, 6, 6], 'c', ['İs', 'tan', 'bul']],
  ['nd', null, 'noktalı dörtlük', [18], 'c'],
  ['ds', null, 'dörtlük, sekizlik', [12, 6], 'c'],
  ['sd', null, 'sekizlik, dörtlük', [6, 12], 'c'],
  ['alti', null, 'altı onaltılık', [3, 3, 3, 3, 3, 3], 'c'],
  ['sicilyana', null, 'noktalı sekizlik, onaltılık, sekizlik', [9, 3, 6], 'c'],
  ['csus', null, 'sekizlik sus, iki sekizlik', ['6s', 6, 6], 'c'],
  ['cikili', null, 'iki sekizlik, iki onaltılık', [6, 6, 3, 3], 'c']
];
const KALIPLAR = KALIP_HAM.map(function (r) {
  const n = r[3].map(function (x) {
    const st = String(x);
    return { d: parseInt(st, 10), sus: st.indexOf('s') >= 0, bag: st.indexOf('~') >= 0, uc: st.indexOf('u') >= 0 };
  });
  return { id: r[0], ad: r[1], tarif: r[2], n: n, uz: n.reduce(function (t, x) { return t + x.d; }, 0), tur: r[4], hece: r[5] || null };
});
const KALIP = {};
KALIPLAR.forEach(function (k) { KALIP[k.id] = k; });
function kalipAdi(k) { return k.ad || k.tarif.charAt(0).toLocaleUpperCase('tr') + k.tarif.slice(1); }

// Ölçüler: vuruş grupları (tık). Aksak ölçülerde 2'lik grup = 12, 3'lük grup = 18
const OLCULER = {
  '2/4': { g: [12, 12], sayim: { vurus: 2, u: 12 } },
  '3/4': { g: [12, 12, 12], sayim: { vurus: 3, u: 12 } },
  '4/4': { g: [12, 12, 12, 12], sayim: { vurus: 4, u: 12 } },
  '6/8': { g: [18, 18], sayim: { vurus: 2, u: 18 } },
  '5/8': { g: [12, 18], sayim: { vurus: 5, u: 6 }, aksak: true },
  '7/8': { g: [12, 12, 18], sayim: { vurus: 7, u: 6 }, aksak: true },
  '9/8': { g: [12, 12, 12, 18], sayim: { vurus: 9, u: 6 }, aksak: true }
};
const TIK_SN = 1 / 12;   // dörtlük = 60, noktalı dörtlük = 40, sekizlik = 120

// ---- Ritim üretimi ----
// cfg: { havuz:[id], yeni:[id], olculer:['2/4'], olcuSay }
function kalipAday(cfg, kalan, grupBas, olcu, grup) {
  const O = OLCULER[olcu];
  return cfg.havuz.map(function (id) { return KALIP[id]; }).filter(function (k) {
    if (O.aksak || olcu === '6/8') return k.uz === grup && (grup === 18 ? k.tur === 'c' : k.tur === 'b');
    if (k.tur !== 'b') return false;
    if (k.uz > kalan) return false;
    if (k.uz > 12 && k.uz < 36 && grupBas % 24 !== 0 && olcu === '4/4' && k.id !== 'senkop') return false;   // 4/4'te iki vuruşluklar 1. ya da 3. vuruşta
    if (k.uz >= 36 && grupBas !== 0) return false;
    return true;
  });
}
function olcuUret(cfg, olcu) {
  const O = OLCULER[olcu], top = O.g.reduce(function (a, b) { return a + b; }, 0);
  const L = [];
  let poz = 0, gi = 0;
  while (poz < top) {
    const grup = O.g[gi] || 12;
    let ad = kalipAday(cfg, top - poz, poz, olcu, grup);
    if (!ad.length) ad = [KALIP[grup === 18 ? 'nd' : 'van']];
    const yeni = ad.filter(function (k) { return cfg.yeni && cfg.yeni.indexOf(k.id) >= 0; });
    const k = yeni.length && Math.random() < 0.5 ? rastgele(yeni) : rastgele(ad);
    L.push(k.id);
    poz += k.uz;
    if (O.aksak || olcu === '6/8') gi++;
    else { let t = 0; gi = 0; while (t < poz) { t += O.g[gi] || 12; gi++; } }
  }
  return L;
}
function ritimUret(cfg) {
  const olcu = rastgele(cfg.olculer || ['2/4']);
  const R = { olcu: olcu, olcular: [] };
  for (let i = 0; i < (cfg.olcuSay || 1); i++) R.olcular.push(olcuUret(cfg, olcu));
  // en az bir "yeni" kalıp olsun
  if (cfg.yeni && cfg.yeni.length && !R.olcular.some(function (o) { return o.some(function (id) { return cfg.yeni.indexOf(id) >= 0; }); })) {
    for (let d = 0; d < 6; d++) { const o = olcuUret(cfg, olcu); if (o.some(function (id) { return cfg.yeni.indexOf(id) >= 0; })) { R.olcular[Math.floor(Math.random() * R.olcular.length)] = o; break; } }
  }
  return R;
}
// Kalıp konumları: [{o: ölçü, k: sıra, id}]
function ritimKalipları(R) {
  const L = [];
  R.olcular.forEach(function (o, oi) { o.forEach(function (id, ki) { L.push({ o: oi, k: ki, id: id }); }); });
  return L;
}
// Çalma olayları: susa s:null; bağlı notalar birleşir. Her nota simgesinin olay numarası (ev) da döner.
function ritimOlaylar(R) {
  const olay = [], ev = [];
  let bagliOnceki = false;
  R.olcular.forEach(function (o) {
    o.forEach(function (id) {
      KALIP[id].n.forEach(function (t) {
        if (t.sus) { olay.push({ s: null, u: t.d }); ev.push(olay.length - 1); bagliOnceki = false; return; }
        if (bagliOnceki && olay.length) { olay[olay.length - 1].u += t.d; ev.push(olay.length - 1); }
        else { olay.push({ s: 'ton', u: t.d }); ev.push(olay.length - 1); }
        bagliOnceki = t.bag;
      });
    });
  });
  return { olaylar: olay, ev: ev };
}
// Sesin imzası (aynı duyulan farklı yazımları eşit saymak için)
function ritimImza(R) { return ritimOlaylar(R).olaylar.map(function (e) { return (e.s ? 'n' : 'r') + e.u; }).join(',').replace(/r(\d+),r(\d+)/g, function (m, a, b) { return 'r' + (+a + +b); }); }
function kalipImzasi(id, olcu) { return ritimImza({ olcu: olcu || '2/4', olcular: [[id]] }); }
function ritimKopya(R) { return { olcu: R.olcu, olcular: R.olcular.map(function (o) { return o.slice(); }) }; }

// ---- Çizim ----
// opts: { olcu: true/false, gizli: kalıp sırası, vurgu: olay no, renk: {olayNo: renk}, numara: ölçü numaraları, olcek }
function ritimCiz(R, opts) {
  opts = opts || {};
  const Y = 62, olcek = opts.olcek || 2.35;
  const svg = svgEl('svg', { class: 'ritim tartim2', preserveAspectRatio: 'xMidYMid meet', role: 'img' });
  const ro = ritimOlaylar(R);
  let x = opts.olcu === false ? 14 : 40;
  const notalar = [];   // {x, t, kalip, gi, ev, d}
  let simge = 0;
  const kalipKutular = [];
  const olcuX = [];
  R.olcular.forEach(function (o, oi) {
    olcuX.push(x);
    o.forEach(function (id, ki) {
      const k = KALIP[id], bx = x;
      k.n.forEach(function (t, ti) {
        const w = Math.max(t.uc ? 20 : 19, t.d * olcek * (t.uc ? 1.15 : 1)) + (t.d === 9 || t.d === 18 || t.d === 36 ? 5 : 0);
        notalar.push({ x: x + 7, t: t, kalip: kalipKutular.length, ti: ti, ev: ro.ev[simge], k: k });
        simge++;
        x += w;
      });
      kalipKutular.push({ x0: bx, x1: x, o: oi, k: ki, id: id });
    });
    x += 6;
    if (oi < R.olcular.length - 1) { svg.appendChild(svgEl('line', { x1: x, x2: x, y1: Y - 14, y2: Y + 14, stroke: 'currentColor', 'stroke-width': 1.4 })); x += 10; }
  });
  const W = Math.max(opts.enAz || 0, x + 8);
  svg.setAttribute('viewBox', '0 0 ' + W + ' 100');
  svg.appendChild(svgEl('line', { x1: 0, x2: W, y1: Y, y2: Y, stroke: 'currentColor', 'stroke-width': 1.2, opacity: .7 }));
  svg.appendChild(svgEl('line', { x1: W - 3, x2: W - 3, y1: Y - 14, y2: Y + 14, stroke: 'currentColor', 'stroke-width': 2.4 }));
  if (opts.olcu !== false) {
    const p = R.olcu.split('/');
    [[p[0], Y - 3], [p[1], Y + 15]].forEach(function (z) {
      const t = svgEl('text', { x: 18, y: z[1], 'font-size': 17, 'font-weight': 900, 'text-anchor': 'middle', fill: 'currentColor', 'font-family': 'Nunito, sans-serif' });
      t.textContent = z[0]; svg.appendChild(t);
    });
  }
  if (opts.numara) olcuX.forEach(function (ox, i) {
    const t = svgEl('text', { x: ox + 2, y: 16, 'font-size': 11, 'font-weight': 800, fill: 'currentColor', opacity: .6, 'font-family': 'Nunito, sans-serif' });
    t.textContent = (i + 1) + '.'; svg.appendChild(t);
  });
  // gizli kalıp
  const gizli = opts.gizli;
  // kiriş grupları: kalıp içinde ardışık kirişlenebilir notalar (sekizlik ve kısası, sus değil)
  const kirisGrup = [];
  let grup = [];
  const kapat = function () { if (grup.length > 1) kirisGrup.push(grup); grup = []; };
  notalar.forEach(function (n, i) {
    const onceki = notalar[i - 1];
    if (onceki && onceki.kalip !== n.kalip) kapat();
    // kalıp içinde vuruş sınırında da kes (iki vuruşluk kalıplar: bağlı sekizlikler)
    if (onceki && onceki.kalip === n.kalip && n.k.tur === 'b' && !n.t.uc) {
      let t0 = 0; for (let j = 0; j < n.ti; j++) t0 += n.k.n[j].d;
      if (t0 % 12 === 0 && n.k.uz > 12) kapat();
    }
    const kir = !n.t.sus && (n.t.uc ? n.t.d < 8 : n.t.d < 12);
    if (kir && n.kalip !== gizli) grup.push(i); else kapat();
  });
  kapat();
  const kirisli = {};
  kirisGrup.forEach(function (g) { g.forEach(function (i) { kirisli[i] = g; }); });
  // simgeler
  kalipKutular.forEach(function (kk, ki) {
    if (ki !== gizli) return;
    const gr = svgEl('g', { class: 'gizliKalip' });
    gr.appendChild(svgEl('rect', { x: kk.x0 + 1, y: Y - 26, width: kk.x1 - kk.x0 - 4, height: 40, rx: 8, fill: 'none', stroke: 'var(--vurgu)', 'stroke-width': 2, 'stroke-dasharray': '4 3' }));
    const t = svgEl('text', { x: (kk.x0 + kk.x1) / 2 - 1, y: Y + 1, 'font-size': 18, 'font-weight': 900, 'text-anchor': 'middle', fill: 'var(--vurgu)' });
    t.textContent = '?'; gr.appendChild(t); svg.appendChild(gr);
  });
  notalar.forEach(function (n, i) {
    if (n.kalip === gizli) return;
    const gr = svgEl('g', { class: 'ritimNota', 'data-i': n.ev });
    const renk = (opts.renk && opts.renk[n.ev]) || (opts.vurgu === n.ev ? 'var(--vurgu)' : null);
    if (renk) gr.setAttribute('style', 'color:' + renk);
    const px = n.x, t = n.t;
    if (t.sus) { susCiz(gr, px, Y, t.d); svg.appendChild(gr); return; }
    const d = t.uc ? (t.d === 8 ? 12 : 6) : t.d;
    const bos = d >= 24;
    gr.appendChild(svgEl('ellipse', { cx: px, cy: Y, rx: 6.4, ry: 4.7, transform: 'rotate(-20 ' + px + ' ' + Y + ')', fill: bos ? 'none' : 'currentColor', stroke: 'currentColor', 'stroke-width': bos ? 1.8 : 1 }));
    if (!t.uc && (d === 9 || d === 18 || d === 36)) gr.appendChild(svgEl('circle', { cx: px + 10.5, cy: Y - 2, r: 1.9, fill: 'currentColor' }));
    const sx = px + 6, uc = Y - 32;
    if (d < 48) gr.appendChild(svgEl('line', { x1: sx, x2: sx, y1: Y - 1, y2: uc, stroke: 'currentColor', 'stroke-width': 1.6 }));
    const bayrak = d <= 3 ? 2 : d <= 9 ? 1 : 0;
    if (bayrak && !kirisli[i]) for (let b = 0; b < bayrak; b++) {
      const yy = uc + b * 7;
      gr.appendChild(svgEl('path', { d: 'M' + sx + ' ' + yy + ' q 9 7 6 17', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }));
    }
    if (t.bag && notalar[i + 1]) {   // bağ
      const x0 = px + 4, x1 = notalar[i + 1].x - 4, yb = Y + 8;
      gr.appendChild(svgEl('path', { d: 'M' + x0 + ' ' + yb + ' Q ' + ((x0 + x1) / 2) + ' ' + (yb + 9) + ' ' + x1 + ' ' + yb, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6 }));
    }
    svg.appendChild(gr);
  });
  // kirişler
  kirisGrup.forEach(function (g) {
    const y = Y - 32, x1 = notalar[g[0]].x + 6, x2 = notalar[g[g.length - 1]].x + 6;
    const gr = svgEl('g', { class: 'ritimNota', 'data-i': notalar[g[0]].ev });
    const renk = opts.renk && opts.renk[notalar[g[0]].ev];
    if (renk) gr.setAttribute('style', 'color:' + renk);
    gr.appendChild(svgEl('rect', { x: x1 - 0.8, y: y, width: x2 - x1 + 1.6, height: 4.5, fill: 'currentColor' }));
    g.forEach(function (i, j) {
      const d = notalar[i].t.d;
      if (d !== 3) return;
      const sol = j > 0 ? g[j - 1] : null, sag = j < g.length - 1 ? g[j + 1] : null;
      const xi = notalar[i].x + 6;
      if (sag !== null && notalar[sag].t.d === 3) gr.appendChild(svgEl('rect', { x: xi - 0.8, y: y + 7, width: notalar[sag].x - notalar[i].x + 1.6, height: 4.5, fill: 'currentColor' }));
      else if (!(sol !== null && notalar[sol].t.d === 3)) {
        const yon = sag !== null ? 1 : -1;
        gr.appendChild(svgEl('rect', { x: yon > 0 ? xi - 0.8 : xi - 9, y: y + 7, width: 9.8, height: 4.5, fill: 'currentColor' }));
      }
    });
    svg.appendChild(gr);
  });
  // üçleme işaretleri
  kalipKutular.forEach(function (kk, ki) {
    if (ki === gizli) return;
    const k = KALIP[kk.id];
    if (!k.n.some(function (t) { return t.uc; })) return;
    const ilk = notalar.find(function (n) { return n.kalip === ki; }), son = notalar.filter(function (n) { return n.kalip === ki; }).pop();
    const y = Y - 44, xa = ilk.x, xb = son.x + 8;
    const gr = svgEl('g', null);
    if (k.uz > 12) gr.appendChild(svgEl('path', { d: 'M' + xa + ' ' + (y + 5) + ' V ' + y + ' H ' + xb + ' V ' + (y + 5), fill: 'none', stroke: 'currentColor', 'stroke-width': 1.2 }));
    const t = svgEl('text', { x: (xa + xb) / 2, y: y + 4, 'font-size': 12, 'font-weight': 900, 'font-style': 'italic', 'text-anchor': 'middle', fill: 'currentColor', 'font-family': 'Nunito, sans-serif', 'paint-order': 'stroke', stroke: 'var(--kart, #fff)', 'stroke-width': 4 });
    t.textContent = '3'; gr.appendChild(t);
    svg.appendChild(gr);
  });
  return svg;
}
function susCiz(gr, x, Y, d) {
  const c = 'currentColor';
  if (d >= 48) { gr.appendChild(svgEl('rect', { x: x - 6, y: Y - 9, width: 12, height: 5, fill: c })); gr.appendChild(svgEl('line', { x1: x - 9, x2: x + 9, y1: Y - 9, y2: Y - 9, stroke: c, 'stroke-width': 1.2 })); return; }
  if (d >= 24) { gr.appendChild(svgEl('rect', { x: x - 6, y: Y - 5, width: 12, height: 5, fill: c })); gr.appendChild(svgEl('line', { x1: x - 9, x2: x + 9, y1: Y, y2: Y, stroke: c, 'stroke-width': 1.2 })); return; }
  if (d >= 12) { gr.appendChild(svgEl('path', { d: 'M' + (x - 2) + ' ' + (Y - 17) + ' l 6 7 l -5 6 l 6 7 q -7 -3 -6 5', fill: 'none', stroke: c, 'stroke-width': 2.4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' })); return; }
  // sekizlik (1 kanca) ve onaltılık (2 kanca) sus
  const kanca = d <= 3 ? 2 : 1;
  gr.appendChild(svgEl('line', { x1: x + 4, x2: x - 2, y1: Y - 10, y2: Y + 8 + (kanca - 1) * 6, stroke: c, 'stroke-width': 1.7 }));
  for (let k = 0; k < kanca; k++) {
    const yy = Y - 10 + k * 7, xx = x + 4 - k * 2.3;
    gr.appendChild(svgEl('circle', { cx: xx - 6, cy: yy - 1, r: 2.4, fill: c }));
    gr.appendChild(svgEl('path', { d: 'M' + (xx - 6) + ' ' + (yy + 1) + ' Q ' + (xx - 2) + ' ' + (yy + 2) + ' ' + xx + ' ' + yy, fill: 'none', stroke: c, 'stroke-width': 1.5 }));
  }
}
function kalipCiz(id, opts) { return ritimCiz({ olcu: KALIP[id].tur === 'c' ? '6/8' : '2/4', olcular: [[id]] }, Object.assign({ olcu: false, enAz: 70 }, opts || {})); }

// ---- Çalma ayarı ----
function ritimDinle(R, hiz) {
  const ro = ritimOlaylar(R);
  return { olaylar: ro.olaylar, onaltilikSn: TIK_SN / (hiz || 1), devir: 1, sayim: OLCULER[R.olcu].sayim, tik: null };
}

// =====================================================
// SORULAR
// =====================================================
// Bir kalıbı aynı uzunlukta başka bir kalıpla değiştir (sesi farklı olsun)
function kalipDegistir(R, cfg, yasak) {
  const yer = karistir(ritimKalipları(R));
  for (let d = 0; d < yer.length; d++) {
    const p = yer[d], k = KALIP[p.id];
    const ad = cfg.havuz.concat(cfg.ek || []).map(function (id) { return KALIP[id]; }).filter(function (x) { return x.uz === k.uz && x.tur === k.tur && kalipImzasi(x.id) !== kalipImzasi(k.id); });
    for (let e = 0; e < 6 && ad.length; e++) {
      const yeni = rastgele(ad);
      const V = ritimKopya(R); V.olcular[p.o][p.k] = yeni.id;
      const im = ritimImza(V);
      if (!yasak || yasak.indexOf(im) < 0) return { R: V, o: p.o, k: p.k, imza: im };
    }
  }
  return null;
}
const T2_EK = ['van', 'izmir', 'gelibolu', 'ankara', 'karaman', 'nd', 'ds', 'sd', 'istanbul'];   // değişiklik için yedek kalıplar
function t2Hiz(cfg) { return cfg.hiz || 1; }

function t2DinleNota(cfg) {
  const R = ritimUret(cfg);
  const imzalar = [ritimImza(R)];
  const secenek = [{ key: 'd', R: R }];
  const c2 = Object.assign({}, cfg, { ek: T2_EK });
  for (let d = 0; d < 20 && secenek.length < 4; d++) {
    const v = kalipDegistir(R, c2, imzalar);
    if (v) { imzalar.push(v.imza); secenek.push({ key: 'y' + secenek.length, R: v.R }); }
  }
  if (secenek.length < 3) throw new Error('nota: şık az');
  return {
    oge: null, tip: 'secim', soru: {}, alt: 'Duyduğun ritim hangisi?',
    dinle: ritimDinle(R, t2Hiz(cfg)),
    siklar: secenek.map(function (x) { return svgSik(x.key, function () { return ritimCiz(x.R, { olcek: 1.9 }); }); }),
    dogru: 'd', dogruMetin: ritimMetni(R),
    aciklama: ritimMetni(R), ipucu: 'Vuruşları say; her vuruşta kaç ses duyduğuna bak.'
  };
}
function ritimMetni(R) {
  return R.olcular.map(function (o, i) { return (R.olcular.length > 1 ? (i + 1) + '. ölçü: ' : '') + o.map(function (id) { return kalipAdi(KALIP[id]); }).join(' · '); }).join('<br>');
}
// Dikte: kalıp kartlarını sırayla diz. Doğruluk sese göre (aynı duyulan yazım da doğru)
function t2Dikte(cfg) {
  const R = ritimUret(cfg);
  const P = ritimKalipları(R);
  const kullanilan = benzersiz(P.map(function (p) { return p.id; }));
  const uz = benzersiz(kullanilan.map(function (id) { return KALIP[id].uz + KALIP[id].tur; }));
  const dis = karistir(cfg.havuz.filter(function (id) { return kullanilan.indexOf(id) < 0 && uz.indexOf(KALIP[id].uz + KALIP[id].tur) >= 0; })).slice(0, Math.max(2, 6 - kullanilan.length));
  const kartlar = karistir(kullanilan.concat(dis));
  const hedef = ritimImza(R);
  return {
    oge: null, tip: 'dizi', soru: { metin: R.olcu + ' · ' + R.olcular.length + ' ölçü', kucuk: true }, alt: 'Dinle, kalıpları sırayla diz',
    dinle: Object.assign(ritimDinle(R, t2Hiz(cfg)), { devir: 1 }),
    dizi: { havuz: kartlar.map(function (id) { return { key: id, svg: function () { return kalipCiz(id); } }; }), uzunluk: P.length, beklenen: P.map(function (p) { return p.id; }), tekrarli: true, svgli: true,
      dogruMu: function (keys) {
        // kartlar sırayla ölçülere yerleşir
        let i = 0; const V = { olcu: R.olcu, olcular: R.olcular.map(function (o) { return o.map(function () { return keys[i++]; }); }) };
        return ritimImza(V) === hedef;
      } },
    dogruMetin: ritimMetni(R), dogruGorsel: function () { return ritimCiz(R, { numara: R.olcular.length > 1 }); },
    aciklama: ritimMetni(R), ipucu: 'Her vuruşu ayrı dinle; kaç ses var, hangisi uzun?'
  };
}
// Hatayı bul: yazılan ile çalınan bir ölçüde farklı
function t2HataBul(cfg) {
  const R = ritimUret(Object.assign({}, cfg, { olcuSay: Math.max(2, cfg.olcuSay || 2) }));
  const v = kalipDegistir(R, Object.assign({}, cfg, { ek: T2_EK }), [ritimImza(R)]);
  const n = R.olcular.length;
  return {
    oge: null, tip: 'secim', soru: { svg: function () { return ritimCiz(R, { numara: true, olcek: 2 }); } },
    alt: 'Yazılan ritimle çalınan bir ölçüde farklı. Hangi ölçü?',
    dinle: ritimDinle(v.R, t2Hiz(cfg)),
    siklar: R.olcular.map(function (o, i) { return { key: 'o' + i, metin: (i + 1) + '. ölçü' }; }),
    dogru: 'o' + v.o, dogruMetin: (v.o + 1) + '. ölçü',
    aciklama: '<b>Çalınan ritim:</b><div class="ritimKutu">' + ritimCiz(v.R, { numara: true, olcek: 2 }).outerHTML + '</div>',
    ipucu: 'Notayı takip ederek dinle; ' + n + ' ölçüden birinde bir vuruş farklı.'
  };
}
// Eksik vuruş: bir kalıp gizli; çalınanı dinle, doğru kalıbı seç
function t2Eksik(cfg) {
  const R = ritimUret(Object.assign({}, cfg, { olcuSay: Math.max(1, cfg.olcuSay || 1) }));
  const P = ritimKalipları(R);
  const secenekler = function (id) {
    const k = KALIP[id];
    const adaylar = benzersiz(cfg.havuz.concat(T2_EK)).filter(function (x) { return x !== id && KALIP[x].uz === k.uz && KALIP[x].tur === k.tur; });
    const imz = [kalipImzasi(id)], dis = [];
    karistir(adaylar).forEach(function (x) { const im = kalipImzasi(x); if (dis.length < 3 && imz.indexOf(im) < 0) { imz.push(im); dis.push(x); } });
    return dis;
  };
  const uygun = P.map(function (p, i) { return i; }).filter(function (i) { return secenekler(P[i].id).length >= 2; });
  if (!uygun.length) throw new Error('eksik: uygun kalıp yok');
  const gi = rastgele(uygun), id = P[gi].id, k = KALIP[id];
  const dis = secenekler(id);
  return {
    oge: null, tip: 'secim', soru: { svg: function () { return ritimCiz(R, { gizli: gi, numara: R.olcular.length > 1 }); } },
    alt: 'Dinle: soru işaretli yerde hangi kalıp var?',
    dinle: ritimDinle(R, t2Hiz(cfg)),
    siklar: [id].concat(dis).map(function (x) { return svgSik(x, function () { return kalipCiz(x); }, false); }),
    dogru: id, dogruMetin: kalipAdi(k), aciklama: '<b>' + kalipAdi(k) + '</b>', ipucu: 'Soru işaretine gelince kaç ses duyduğunu say.'
  };
}
// Oku ve vur (deşifre)
function t2OkuVur(cfg) {
  const R = ritimUret(cfg);
  const ro = ritimOlaylar(R);
  const O = OLCULER[R.olcu];
  const sn = TIK_SN / t2Hiz(cfg);
  return {
    oge: null, tip: 'vur', soru: { metin: R.olcu + ' · ' + R.olcular.length + ' ölçü', kucuk: true }, alt: cfg.dinlemesiz ? 'Notayı oku ve vur (dinlemeden)' : 'Notayı oku ve kendi başına vur',
    vur: { gorsel: function (ek) { return ritimCiz(R, Object.assign({ numara: R.olcular.length > 1 }, ek && ek.renk ? { renk: ek.renk } : {})); }, olaylar: ro.olaylar, onaltilikSn: sn, devir: 1,
      sayim: O.sayim, tik: null, ikiTus: false, dinle: cfg.dinlemesiz ? null : { olaylar: ro.olaylar, onaltilikSn: sn, devir: 1, sayim: O.sayim } },
    dogruMetin: ritimMetni(R), aciklama: ritimMetni(R),
    ipucu: 'Önce vuruşları say, sonra her vuruşun içini söyleyerek vur.'
  };
}
// Ad soruları (yalnızca adı olan kalıplar; ilk ünitelerde)
function t2Ad(cfg) {
  const adli = cfg.havuz.filter(function (id) { return KALIP[id].ad; });
  const id = rastgele(adli), k = KALIP[id];
  const dis = karistir(adli.filter(function (x) { return x !== id; })).slice(0, 3);
  if (Math.random() < 0.5) {
    return { oge: null, tip: 'secim', soru: { svg: function () { return kalipCiz(id, { enAz: 120 }); } }, alt: 'Bu tartımın adı ne?',
      siklar: [id].concat(dis).map(function (x) { return { key: x, metin: KALIP[x].ad }; }), dogru: id, dogruMetin: k.ad, aciklama: '<b>' + k.ad + '</b>: ' + k.tarif, ipucu: k.n.length + ' ses' };
  }
  return { oge: null, tip: 'secim', soru: { metin: k.ad }, alt: 'Hangi tartım?',
    siklar: [id].concat(dis).map(function (x) { return svgSik(x, function () { return kalipCiz(x); }, false); }), dogru: id, dogruMetin: k.tarif, aciklama: '<b>' + k.ad + '</b>: ' + k.tarif, ipucu: (k.hece || []).join('-') };
}
// Tek vuruşu dinle, notasını seç (ilk ünite)
function t2VurusDinle(cfg) {
  const id = rastgele(cfg.havuz.filter(function (x) { return (KALIP[x].uz === 12 || KALIP[x].uz === 18) && !KALIP[x].n.every(function (t) { return t.sus; }); }));
  const k = KALIP[id], olcu = k.tur === 'c' ? '6/8' : '2/4';
  const R = { olcu: olcu, olcular: [[id, id]] };
  const imz = [kalipImzasi(id)], dis = [];
  karistir(cfg.havuz.concat(T2_EK).filter(function (x) { return x !== id && KALIP[x].uz === k.uz && KALIP[x].tur === k.tur; })).forEach(function (x) { const im = kalipImzasi(x); if (dis.length < 3 && imz.indexOf(im) < 0) { imz.push(im); dis.push(x); } });
  if (dis.length < 2) throw new Error('vurus: şık az');
  return { oge: null, tip: 'secim', soru: {}, alt: 'Her vuruşta aynı kalıp çalıyor. Notası hangisi?',
    dinle: Object.assign(ritimDinle(R, t2Hiz(cfg)), { devir: 2 }),
    siklar: [id].concat(dis).map(function (x) { return svgSik(x, function () { return kalipCiz(x); }, false); }),
    dogru: id, dogruMetin: kalipAdi(k), aciklama: '<b>' + kalipAdi(k) + '</b>: ' + k.tarif, ipucu: 'Bir vuruşta kaç ses var?' };
}

const T2_TIPLER = { ad: t2Ad, vurus: t2VurusDinle, nota: t2DinleNota, dikte: t2Dikte, hata: t2HataBul, eksik: t2Eksik, vur: t2OkuVur };
function t2Uretici(cfg, tipler) {
  return function (n) {
    const L = [];
    for (let i = 0; i < n; i++) {
      const tip = tipler[i % tipler.length];
      let q = null;
      for (let d = 0; d < 8 && !q; d++) { try { q = T2_TIPLER[tip](cfg); } catch (e) { if (d === 7) console.warn(e); } }
      if (q) L.push(q);
    }
    return karistir(L);
  };
}

// =====================================================
// ÜNİTELER
// =====================================================
const T2_TEMEL = ['van', 'izmir', 'gelibolu', 'ankara', 'karaman'];
const T2_NOKTALI = T2_TEMEL.concat(['terazi', 'bursa', 'sahur']);
const T2_SUS = T2_NOKTALI.concat(['dsus', 'arka', 'onsus', 'osus', 'ikilik', 'nikilik', 'birlik', 'isus']);
const T2_BAG = T2_SUS.concat(['ndortluk', 'senkop', 'bagli', 'bagdort']);
const T2_UC = T2_BAG.concat(['ucleme', 'ucsus', 'dortlukuc']);
const T2_BILESIK = ['istanbul', 'nd', 'ds', 'sd', 'alti', 'sicilyana', 'csus', 'cikili'];
const T2_AKSAK = ['van', 'izmir', 'gelibolu', 'ankara', 'karaman', 'bursa', 'istanbul', 'nd', 'ds', 'sd'];
function c(havuz, yeni, olculer, olcuSay, ek) { return Object.assign({ havuz: havuz, yeni: yeni, olculer: olculer, olcuSay: olcuSay }, ek || {}); }

const TARTIM_UNITELER = [
  bUnite('b11', 1, 'Temel tartımlar', 'Van, İzmir, Gelibolu, Ankara, Karaman: duy, yaz, vur', [
    { id: 'b11-1', tip: 'seviye', ad: 'Tartımlar ve adları', soruSay: 8, uret: t2Uretici(c(T2_TEMEL, null, ['2/4'], 1), ['ad', 'vurus']) },
    { id: 'b11-2', tip: 'seviye', ad: '🔊 Dinle, notayı seç', soruSay: 8, uret: t2Uretici(c(T2_TEMEL, null, ['2/4'], 1), ['vurus', 'nota']) },
    { id: 'b11-3', tip: 'seviye', ad: '🔊 İlk dikte: bir ölçü', soruSay: 6, uret: t2Uretici(c(T2_TEMEL, null, ['2/4'], 1), ['dikte', 'nota']) },
    { id: 'b11-yer', tip: 'yer', ad: 'Oku ve vur', soruSay: 4, uret: t2Uretici(c(T2_TEMEL, null, ['2/4'], 1), ['vur']) },
    { id: 'b11-boss', tip: 'boss', ad: 'Temel tartımlar finali', soruSay: 10, uret: t2Uretici(c(T2_TEMEL, null, ['2/4'], 2), ['dikte', 'nota', 'ad', 'eksik', 'vur']) }
  ]),
  bUnite('b12', 2, 'Noktalı ve senkoplu', 'Bursa, Sahur, Terazi; iki ölçü dikte', [
    { id: 'b12-1', tip: 'seviye', ad: 'Yeni tartımlar', soruSay: 8, uret: t2Uretici(c(T2_NOKTALI, ['terazi', 'bursa', 'sahur'], ['2/4'], 1), ['vurus', 'ad', 'nota']) },
    { id: 'b12-2', tip: 'seviye', ad: '🔊 Dikte: iki ölçü', soruSay: 6, uret: t2Uretici(c(T2_NOKTALI, ['terazi', 'bursa', 'sahur'], ['2/4'], 2), ['dikte', 'nota']) },
    { id: 'b12-3', tip: 'seviye', ad: '🔎 Hatayı bul', soruSay: 6, uret: t2Uretici(c(T2_NOKTALI, ['terazi', 'bursa', 'sahur'], ['2/4'], 2), ['hata', 'eksik']) },
    { id: 'b12-yer', tip: 'yer', ad: 'Oku ve vur', soruSay: 4, uret: t2Uretici(c(T2_NOKTALI, ['bursa', 'sahur', 'terazi'], ['2/4'], 1), ['vur']) },
    { id: 'b12-boss', tip: 'boss', ad: 'Noktalı ve senkoplu finali', soruSay: 10, uret: t2Uretici(c(T2_NOKTALI, ['terazi', 'bursa', 'sahur'], ['2/4'], 2), ['dikte', 'hata', 'nota', 'eksik', 'vur']) }
  ]),
  bUnite('b13', 3, 'Uzun değerler ve suslar', 'İkilik, noktalı ikilik, birlik; dörtlük, sekizlik ve onaltılık suslar; 2/4, 3/4, 4/4', [
    { id: 'b13-1', tip: 'seviye', ad: '🔊 Dinle, notayı seç', soruSay: 8, uret: t2Uretici(c(T2_SUS, ['dsus', 'arka', 'onsus', 'osus', 'ikilik', 'nikilik', 'birlik'], ['2/4', '3/4', '4/4'], 1), ['vurus', 'nota']) },
    { id: 'b13-2', tip: 'seviye', ad: '🔊 Dikte', soruSay: 6, uret: t2Uretici(c(T2_SUS, ['dsus', 'arka', 'onsus', 'osus', 'ikilik'], ['2/4', '3/4', '4/4'], 2), ['dikte', 'eksik']) },
    { id: 'b13-yer', tip: 'yer', ad: 'Oku ve vur', soruSay: 4, uret: t2Uretici(c(T2_SUS, ['dsus', 'arka', 'onsus', 'ikilik'], ['2/4', '3/4'], 2), ['vur']) },
    { id: 'b13-boss', tip: 'boss', ad: 'Suslar finali', soruSay: 10, uret: t2Uretici(c(T2_SUS, ['dsus', 'arka', 'onsus', 'osus', 'ikilik', 'nikilik', 'birlik'], ['2/4', '3/4', '4/4'], 2), ['dikte', 'hata', 'nota', 'eksik', 'vur']) }
  ]),
  bUnite('b14', 4, 'Bağ ve vuruş aşan senkop', 'Noktalı dörtlük, bağlı notalar, sekizlik-dörtlük-sekizlik', [
    { id: 'b14-1', tip: 'seviye', ad: '🔊 Dinle, notayı seç', soruSay: 8, uret: t2Uretici(c(T2_BAG, ['ndortluk', 'senkop', 'bagli', 'bagdort'], ['2/4', '4/4'], 1), ['nota']) },
    { id: 'b14-2', tip: 'seviye', ad: '🔊 Dikte', soruSay: 6, uret: t2Uretici(c(T2_BAG, ['ndortluk', 'senkop', 'bagli', 'bagdort'], ['2/4', '3/4', '4/4'], 2), ['dikte', 'eksik']) },
    { id: 'b14-yer', tip: 'yer', ad: 'Oku ve vur', soruSay: 4, uret: t2Uretici(c(T2_BAG, ['ndortluk', 'senkop', 'bagli', 'bagdort'], ['2/4', '4/4'], 1), ['vur']) },
    { id: 'b14-boss', tip: 'boss', ad: 'Bağ ve senkop finali', soruSay: 10, uret: t2Uretici(c(T2_BAG, ['ndortluk', 'senkop', 'bagli', 'bagdort'], ['2/4', '3/4', '4/4'], 2), ['dikte', 'hata', 'nota', 'eksik', 'vur']) }
  ]),
  bUnite('b15', 5, 'Üçleme', 'Bir vuruşa üç ses: sekizlik üçleme; iki vuruşa üç ses: dörtlük üçleme', [
    { id: 'b15-1', tip: 'seviye', ad: '🔊 İkili mi, üçlü mü?', soruSay: 8, uret: t2Uretici(c(['izmir', 'ucleme', 'gelibolu', 'ankara', 'karaman', 'ucsus', 'van'], ['ucleme', 'ucsus'], ['2/4'], 1), ['vurus', 'nota']) },
    { id: 'b15-2', tip: 'seviye', ad: '🔊 Dikte', soruSay: 6, uret: t2Uretici(c(T2_UC, ['ucleme', 'ucsus', 'dortlukuc'], ['2/4', '3/4', '4/4'], 2), ['dikte', 'eksik']) },
    { id: 'b15-yer', tip: 'yer', ad: 'Oku ve vur', soruSay: 4, uret: t2Uretici(c(T2_NOKTALI.concat(['ucleme']), ['ucleme'], ['2/4'], 2), ['vur']) },
    { id: 'b15-boss', tip: 'boss', ad: 'Üçleme finali', soruSay: 10, uret: t2Uretici(c(T2_UC, ['ucleme', 'ucsus', 'dortlukuc'], ['2/4', '3/4', '4/4'], 2), ['dikte', 'hata', 'nota', 'eksik', 'vur']) }
  ]),
  bUnite('b16', 6, '6/8 bileşik ölçü', 'Bir vuruş = noktalı dörtlük; İstanbul ve öbür bileşik kalıplar', [
    { id: 'b16-1', tip: 'seviye', ad: '🔊 Dinle, notayı seç', soruSay: 8, uret: t2Uretici(c(T2_BILESIK, ['ds', 'sd', 'nd', 'sicilyana'], ['6/8'], 1), ['vurus', 'nota']) },
    { id: 'b16-2', tip: 'seviye', ad: '🔊 Dikte', soruSay: 6, uret: t2Uretici(c(T2_BILESIK, null, ['6/8'], 2), ['dikte', 'eksik']) },
    { id: 'b16-yer', tip: 'yer', ad: 'Oku ve vur', soruSay: 4, uret: t2Uretici(c(T2_BILESIK, null, ['6/8'], 2), ['vur']) },
    { id: 'b16-boss', tip: 'boss', ad: '6/8 finali', soruSay: 10, uret: t2Uretici(c(T2_BILESIK, null, ['6/8'], 2), ['dikte', 'hata', 'nota', 'eksik', 'vur']) }
  ]),
  bUnite('b17', 7, 'Aksak ölçüler', '5/8 (2+3), 7/8 (2+2+3), 9/8 (2+2+2+3): usullere hazırlık', [
    { id: 'b17-1', tip: 'seviye', ad: '🔊 Dinle, notayı seç', soruSay: 8, uret: t2Uretici(c(T2_AKSAK, null, ['5/8', '7/8', '9/8'], 1), ['nota']) },
    { id: 'b17-2', tip: 'seviye', ad: '🔊 Dikte', soruSay: 6, uret: t2Uretici(c(T2_AKSAK, null, ['5/8', '7/8', '9/8'], 1), ['dikte', 'eksik']) },
    { id: 'b17-yer', tip: 'yer', ad: 'Oku ve vur', soruSay: 4, uret: t2Uretici(c(T2_AKSAK, null, ['5/8', '7/8', '9/8'], 1), ['vur']) },
    { id: 'b17-boss', tip: 'boss', ad: 'Aksak ölçüler finali', soruSay: 10, uret: t2Uretici(c(T2_AKSAK, null, ['5/8', '7/8', '9/8'], 2), ['dikte', 'hata', 'nota', 'eksik', 'vur']) }
  ]),
  bUnite('b18', 8, 'Uzun dikte I', 'Basit ölçülerde dört ölçülük dikte, her şey karışık', [
    { id: 'b18-1', tip: 'seviye', ad: '🔊 Üç ölçü dikte', soruSay: 6, uret: t2Uretici(c(T2_UC, null, ['2/4', '3/4'], 3), ['dikte', 'nota']) },
    { id: 'b18-2', tip: 'seviye', ad: '🔊 Dört ölçü dikte', soruSay: 5, uret: t2Uretici(c(T2_UC, null, ['2/4', '3/4', '4/4'], 4), ['dikte', 'hata']) },
    { id: 'b18-boss', tip: 'boss', ad: 'Uzun dikte finali', soruSay: 8, uret: t2Uretici(c(T2_UC, null, ['2/4', '3/4', '4/4'], 4), ['dikte', 'hata', 'eksik', 'dikte']) }
  ]),
  bUnite('b19', 9, 'Uzun dikte II', '6/8 ve aksak ölçülerde uzun dikte', [
    { id: 'b19-1', tip: 'seviye', ad: '🔊 6/8: dört ölçü', soruSay: 5, uret: t2Uretici(c(T2_BILESIK, null, ['6/8'], 4), ['dikte', 'hata']) },
    { id: 'b19-2', tip: 'seviye', ad: '🔊 Aksak: iki-üç ölçü', soruSay: 5, uret: t2Uretici(c(T2_AKSAK, null, ['5/8', '7/8', '9/8'], 3), ['dikte', 'hata']) },
    { id: 'b19-boss', tip: 'boss', ad: 'Uzun dikte II finali', soruSay: 8, uret: t2Uretici(c(T2_BILESIK.concat(T2_AKSAK), null, ['6/8', '7/8', '9/8'], 3), ['dikte', 'hata', 'eksik']) }
  ]),
  bUnite('b20', 10, 'Deşifre ustalığı', 'Görüp vurma: dinlemeden, daha hızlı, daha uzun', [
    { id: 'b20-1', tip: 'yer', ad: 'Dinlemeden oku ve vur', soruSay: 5, uret: t2Uretici(c(T2_BAG, null, ['2/4', '3/4'], 2, { dinlemesiz: true }), ['vur']) },
    { id: 'b20-2', tip: 'yer', ad: 'Üçleme, 6/8 ve aksak', soruSay: 5, uret: function (n) { return karistir(t2Uretici(c(T2_UC, ['ucleme'], ['2/4'], 2, { dinlemesiz: true }), ['vur'])(Math.ceil(n / 2)).concat(t2Uretici(c(T2_BILESIK.concat(T2_AKSAK), null, ['6/8', '7/8'], 2, { dinlemesiz: true }), ['vur'])(Math.floor(n / 2)))); } },
    { id: 'b20-boss', tip: 'boss', ad: 'Deşifre finali: daha hızlı', soruSay: 8, uret: t2Uretici(c(T2_UC, null, ['2/4', '3/4', '4/4'], 3, { dinlemesiz: true, hiz: 1.2 }), ['vur', 'hata']) }
  ])
];
// Sonsuz dikte: seri arttıkça uzayan ve zorlaşan dikte
TARTIM_UNITELER.push({ id: 'sn-dikte', dal: 'bati', no: 11, ad: 'Sonsuz dikte', kisa: 'Bitmeyen, doğru bildikçe uzayan dikte', sonsuz: true, sonsuzDal: 'dikte', ogeler: [],
  seviyeler: [{ id: 'sn-dikte', tip: 'sonsuz', ad: 'Sonsuz dikte', soruSay: 0, uret: function () { return []; } }] });
function sonsuzDikteSorulari(seri, n) {
  const L = [];
  for (let i = 0; i < n; i++) {
    const s = seri + i;
    const kume = s < 4 ? T2_NOKTALI : s < 8 ? T2_SUS : s < 14 ? T2_BAG : T2_UC;
    const olc = s < 6 ? ['2/4'] : s < 12 ? ['2/4', '3/4'] : rastgele([['2/4', '3/4', '4/4'], ['6/8'], ['7/8', '9/8']]);
    const havuz = olc[0] === '6/8' ? T2_BILESIK : olc[0] === '7/8' ? T2_AKSAK : kume;
    const olcuSay = Math.min(4, 1 + Math.floor(s / 5));
    const tip = rastgele(s < 3 ? ['dikte', 'nota'] : ['dikte', 'dikte', 'hata', 'eksik']);
    try { L.push(T2_TIPLER[tip](c(havuz, null, olc, tip === 'hata' ? Math.max(2, olcuSay) : olcuSay, { hiz: 1 + Math.min(0.3, s / 60) }))); } catch (e) { console.warn(e); }
  }
  return L;
}

// ---- Dersler ----
function kalipKartlari(ids) {
  return ids.map(function (id) {
    const k = KALIP[id];
    return { baslik: kalipAdi(k), cizim: function () {
      const R = { olcu: k.tur === 'c' ? '6/8' : '2/4', olcular: [[id]] };
      return h('div', null, h('div', { class: 'ritimKutu' }, kalipCiz(id, { enAz: 140 })),
        dugme('🔊 Dinle', function () { ritimCal(Object.assign(ritimDinle({ olcu: R.olcu, olcular: k.uz <= 12 || k.uz === 18 ? [[id, id]] : [[id]] }), { onaltilikSn: function () { return TIK_SN; }, devir: 2 })); }, 'ince'));
    }, metin: '<p><b>' + kalipAdi(k) + '</b>' + (k.ad ? ': ' + k.tarif : '') + (k.hece ? ' · <i>' + k.hece.join('-') + '</i>' : '') + '</p>' };
  });
}
const T2_DERS = {
  b11: [{ baslik: 'Tartım nedir?', metin: '<p>Bir vuruşun (dörtlük) içindeki ritim kalıbına <b>tartım</b> denir. Akılda kalsın diye kalıba uyan kelimelerle anılır: <b>Van</b> tek ses, <b>İz-mir</b> iki eşit ses, <b>Ge-li-bo-lu</b> dört eşit ses.</p><p>Amaç adları ezberlemek değil: <b>duyduğunu yazabilmek</b> ve <b>gördüğünü vurabilmek</b>. Bu yüzden sorular çoğunlukla dinleyip notayı seçmek, dikte ve okuyup vurmak.</p>' }].concat(kalipKartlari(T2_TEMEL)),
  b12: [{ baslik: 'Noktalı ve senkoplu', metin: '<p><b>Bur-sa</b>: uzun-kısa. <b>Sa-hur</b>: kısa-uzun. <b>Te-ra-zi</b>: ortadaki ses uzun, vurgu kayar (senkop).</p><p><b>🔎 Hatayı bul</b>: yazılı ritmi takip ederek dinle; bir ölçüde çalınan farklıdır.</p>' }].concat(kalipKartlari(['bursa', 'sahur', 'terazi'])),
  b13: [{ baslik: 'Uzun değerler ve suslar', metin: '<p><b>İkilik</b> iki, <b>noktalı ikilik</b> üç, <b>birlik</b> dört vuruş sürer. <b>Sus</b> işaretleri sessizliğin süresini gösterir; sessiz vuruşları da içinden saymaya devam et.</p><p>Bu üniteden sonra 3/4 ve 4/4 ölçüler de gelir.</p>' }].concat(kalipKartlari(['ikilik', 'nikilik', 'birlik', 'dsus', 'arka', 'onsus', 'osus'])),
  b14: [{ baslik: 'Bağ ve senkop', metin: '<p><b>Bağ</b> iki notayı tek ses yapar: ikinci nota vurulmaz, süresi birinciye eklenir. Noktalı dörtlük + sekizlik, bağla da yazılabilir.</p><p><b>Senkop</b>: uzun ses vuruşun arasından başlar (sekizlik, dörtlük, sekizlik). Aynı ses bağlı sekizliklerle de yazılır; dikte de ikisi de doğru sayılır.</p>' }].concat(kalipKartlari(['ndortluk', 'bagdort', 'senkop', 'bagli'])),
  b15: [{ baslik: 'Üçleme', metin: '<p>Vuruş normalde ikiye (sekizlik) ya da dörde (onaltılık) bölünür. <b>Üçleme</b>, bir vuruşu <b>üç eşit</b> parçaya böler; notanın üstüne <b>3</b> yazılır.</p><p><b>Dörtlük üçleme</b>: iki vuruşa üç eşit ses.</p>' }].concat(kalipKartlari(['izmir', 'ucleme', 'ucsus', 'dortlukuc'])),
  b16: [{ baslik: '6/8 bileşik ölçü', metin: '<p>6/8’de iki vuruş vardır; her vuruş bir <b>noktalı dörtlük</b> (üç sekizlik) sürer. Vuruş üçe bölünür: <b>İs-tan-bul</b>.</p>' }].concat(kalipKartlari(T2_BILESIK)),
  b17: [{ baslik: 'Aksak ölçüler', metin: '<p>Aksak ölçülerde vuruşlar eşit değildir: sekizlikler <b>2’li ve 3’lü</b> gruplanır. 5/8 = 2+3, 7/8 = 2+2+3, 9/8 = 2+2+2+3.</p><p>Bu gruplamalar Türk müziği usullerinin temelidir: 9/8 Aksak, 7/8 Devr-i Hindî, 5/8 Türk Aksağı.</p>' }],
  b18: [{ baslik: 'Uzun dikte', metin: '<p>Dikte uzayınca hepsini bir anda tutmaya çalışma: önce <b>ölçü sayısını</b> ve <b>vuruşları</b> say, sonra her ölçüyü ayrı ayrı dinle. 🔊 ile istediğin kadar tekrar dinleyebilirsin.</p>' }],
  b19: [{ baslik: 'Bileşik ve aksak dikte', metin: '<p>6/8’de her vuruşu “İs-tan-bul” diye üçe böl. Aksak ölçülerde önce gruplamayı (2+2+3 gibi) bul, sonra her grubun içini dinle.</p>' }],
  b20: [{ baslik: 'Deşifre', metin: '<p>Bu ünitede ritmi <b>dinlemeden</b> okuyup vuracaksın; solfejdeki gibi. Önce ölçüyü ve vuruşları say, sonra tık sayımından sonra kendi hızında vur. Final biraz daha hızlı.</p>' }]
};
TARTIM_UNITELER.forEach(function (u) { if (T2_DERS[u.id]) u.ders = function () { return T2_DERS[u.id]; }; });
BATI_UNITELER.push.apply(BATI_UNITELER, TARTIM_UNITELER);
