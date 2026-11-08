// =====================================================
// 3.3: BATI TEORİSİ → EZGİ DİKTESİ
// Dikte dört aşamalı bir süreçtir: duyma (dikkat), kısa süreli ezgi belleği, anlama (adlandırma), yazma.
// Bu yüzden tam diktenin önüne alt beceri soruları konur: yön, hangi porte, hata bul, eksiğini tamamla,
// tartım diktesi. Her soruda ilk ses (Do) verilir; ezgi başta iki kez çalar, sonra sınırsız dinlenir.
// Ses kümesi önce büyür (Do–Re → Do–Sol); tartım ses kümesi oturduktan sonra girer (ikisi aynı anda zorlaşmaz).
// Tam diktede nota başına kısmi puan: hepsi doğruysa tam, %60 ve üstü yarım kalp, altı tam kalp.
// Notalar: s = porte adımı (Do4 = 28 … Do5 = 35), d = sekizlik sayısı (1 sekizlik, 2 dörtlük, 3 noktalı dörtlük, 4 ikilik)
// kulak.js ve kulak-aralik.js'ten sonra, motor.js'ten önce yüklenir.
// =====================================================
'use strict';

const DK_DO = 28;
const DK_SURE = { 1: 'sekizlik', 2: 'dörtlük', 3: 'noktalı dörtlük', 4: 'ikilik' };
const DK_OLCU = { '2/4': 4, '4/4': 8 };

function dkHz(s) {
  const o = Math.floor(s / 7), h = ((s % 7) + 7) % 7;
  const midi = 12 * (o + 1) + YARIM_TABAN[h];
  return 440 * Math.pow(2, (midi - 69) / 12);
}
function dkAd(s) { return HARF_AD[((s % 7) + 7) % 7] + (s >= 35 ? '’' : ''); }
function dkOnsetler(L) { const o = []; let t = 0; L.forEach(function (n) { o.push(t); t += n.d; }); return o; }
function dkToplam(L) { return L.reduce(function (t, n) { return t + n.d; }, 0); }
function dkKopya(M) { return { olcu: M.olcu, notalar: M.notalar.map(function (n) { return { s: n.s, d: n.d }; }) }; }

// ---------- ÇİZİM ----------
// M: { olcu: '2/4' | '4/4' | null, notalar: [{s, d}] }
// o: { renk: {i: renk}, bos: {i: true}, aktif: i | -1 (hayalet sütun), hayalet: true, enAz, ses: {i: true} (yalnız tartım: ses yüksekliği önemsiz) }
function dkYerlesim(M, o) {
  o = o || {};
  const olcuUz = M.olcu ? DK_OLCU[M.olcu] : 0;
  let x = M.olcu ? 82 : 64;
  const kol = [], cizgi = [];
  let t = 0;
  M.notalar.forEach(function (n, i) {
    const w = 26 + 8 * n.d;
    kol.push({ i: i, x: x + 12, w: w, t: t });
    x += w; t += n.d;
    if (olcuUz && t % olcuUz === 0 && i < M.notalar.length - 1) { cizgi.push(x + 2); x += 12; }
  });
  let hayalet = null;
  if (o.hayalet) {
    if (olcuUz && t > 0 && t % olcuUz === 0 && M.notalar.length) { cizgi.push(x + 2); x += 12; }
    hayalet = { x: x + 14 };
    x += 40;
  }
  return { kol: kol, cizgi: cizgi, hayalet: hayalet, son: x + 10 };
}
function dkCiz(M, o) {
  o = o || {};
  const Y = dkYerlesim(M, o);
  const W = Math.max(o.enAz || 200, Y.son);
  const svg = svgEl('svg', { class: 'porte dikte' + (o.etkilesim ? ' etkilesim' : ''), viewBox: o.etkilesim ? '0 0 ' + W + ' 150' : '0 22 ' + W + ' 106', preserveAspectRatio: 'xMidYMid meet', role: 'img' });
  if (o.aktif != null && o.etkilesim) {
    const ax = o.aktif === -1 && Y.hayalet ? Y.hayalet.x : Y.kol[o.aktif] ? Y.kol[o.aktif].x : null;
    if (ax != null) svg.appendChild(svgEl('rect', { x: ax - 20, y: 8, width: 40, height: 134, rx: 10, class: 'yerAktif' }));
  }
  for (let i = 0; i < 5; i++) svgCizgi(svg, 0, W, 50 + i * 10);
  svgGlif(svg, GLIF_SOL, 22, 80);
  if (M.olcu) {
    const p = M.olcu.split('/');
    [[p[0], 69], [p[1], 89]].forEach(function (z) {
      const t = svgEl('text', { x: 54, y: z[1], 'font-size': 21, 'font-weight': 900, 'text-anchor': 'middle', fill: 'currentColor', 'font-family': 'Nunito, sans-serif' });
      t.textContent = z[0]; svg.appendChild(t);
    });
  }
  Y.cizgi.forEach(function (cx) { svg.appendChild(svgEl('line', { x1: cx, x2: cx, y1: 50, y2: 90, stroke: 'currentColor', 'stroke-width': 1.3 })); });
  // kirişler: aynı vuruşta başlayan iki sekizlik
  const kirisli = {};
  for (let i = 0; i + 1 < M.notalar.length; i++) {
    const a = M.notalar[i], b = M.notalar[i + 1];
    if (a.d === 1 && b.d === 1 && Y.kol[i].t % 2 === 0 && !(o.bos && (o.bos[i] || o.bos[i + 1]))) { kirisli[i] = i + 1; kirisli[i + 1] = i; i++; }
  }
  const yukari = function (s) { return s < 34; };
  M.notalar.forEach(function (n, i) {
    const k = Y.kol[i], nx = k.x;
    const renk = o.renk && o.renk[i] ? o.renk[i] : null;
    const g = svgEl('g', { class: 'dkNota' });
    if (renk) g.setAttribute('style', 'color:' + renk);
    const bosNota = o.bos && o.bos[i] && n.s == null;
    if (bosNota) {   // sesi bilinmeyen nota: süresi görünür, sesi soru işareti
      g.setAttribute('style', 'color:var(--soluk)'); g.setAttribute('opacity', '.6');
      const t = svgEl('text', { x: nx, y: 38, 'font-size': 16, 'font-weight': 900, 'text-anchor': 'middle', fill: 'var(--vurgu)' });
      t.textContent = '?'; svg.appendChild(t);
    }
    const ns = bosNota ? 32 : n.s;
    const y = notaY(ns);
    ekCizgiler(g, nx, y, null);
    const bos = n.d >= 4;
    g.appendChild(svgEl('ellipse', { cx: nx, cy: y, rx: 6.6, ry: 4.9, transform: 'rotate(-20 ' + nx + ' ' + y + ')', fill: bos ? 'none' : 'currentColor', stroke: 'currentColor', 'stroke-width': bos ? 1.8 : 1, 'stroke-dasharray': bosNota ? '3 2' : 'none' }));
    if (n.d === 3) g.appendChild(svgEl('circle', { cx: nx + 11, cy: y - (ns % 2 === 0 ? 5 : 0), r: 2, fill: 'currentColor' }));
    const es = kirisli[i];
    let up = yukari(ns);
    if (es != null) up = (n.s + M.notalar[es].s) / 2 < 34;
    const sx = up ? nx + 6 : nx - 6;
    let uc = up ? y - 33 : y + 33;
    if (es != null) {
      const ys = [y, notaY(M.notalar[es].s)];
      uc = up ? Math.min.apply(null, ys) - 33 : Math.max.apply(null, ys) + 33;
    }
    g.appendChild(svgEl('line', { x1: sx, x2: sx, y1: y + (up ? -1 : 1), y2: uc, stroke: 'currentColor', 'stroke-width': 1.6 }));
    if (n.d === 1 && es == null) {
      g.appendChild(svgEl('path', { d: up ? 'M' + sx + ' ' + uc + ' q 9 7 6 17' : 'M' + sx + ' ' + uc + ' q 9 -7 6 -17', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }));
    }
    if (es != null && es > i) {
      const n2 = M.notalar[es], k2 = Y.kol[es];
      const sx2 = up ? k2.x + 6 : k2.x - 6;
      g.appendChild(svgEl('rect', { x: sx - 0.8, y: up ? uc : uc - 4.5, width: sx2 - sx + 1.6, height: 4.5, fill: 'currentColor' }));
      void n2;
    }
    svg.appendChild(g);
  });
  if (Y.hayalet && o.etkilesim) {
    const hx = Y.hayalet.x;
    const t = svgEl('text', { x: hx, y: 75, 'font-size': 22, 'font-weight': 900, 'text-anchor': 'middle', class: 'yerIpucu' });
    t.textContent = '+'; svg.appendChild(t);
  }
  // son çizgi (ölçü tamamsa çift çizgi)
  const tam = M.olcu ? dkToplam(M.notalar) % DK_OLCU[M.olcu] === 0 && M.notalar.length && !o.hayalet : !o.hayalet;
  if (tam) {
    svg.appendChild(svgEl('line', { x1: W - 7, x2: W - 7, y1: 50, y2: 90, stroke: 'currentColor', 'stroke-width': 1.2 }));
    svg.appendChild(svgEl('line', { x1: W - 3, x2: W - 3, y1: 50, y2: 90, stroke: 'currentColor', 'stroke-width': 3 }));
  }
  return svg;
}
// Süre düğmesi simgesi
function dkSureSimge(d) {
  const svg = svgEl('svg', { viewBox: '0 0 30 40', class: 'dkSimge', 'aria-hidden': 'true' });
  const y = 30, x = 12;
  svg.appendChild(svgEl('ellipse', { cx: x, cy: y, rx: 6.2, ry: 4.6, transform: 'rotate(-20 ' + x + ' ' + y + ')', fill: d >= 4 ? 'none' : 'currentColor', stroke: 'currentColor', 'stroke-width': d >= 4 ? 1.8 : 1 }));
  svg.appendChild(svgEl('line', { x1: x + 6, x2: x + 6, y1: y - 1, y2: 4, stroke: 'currentColor', 'stroke-width': 1.6 }));
  if (d === 1) svg.appendChild(svgEl('path', { d: 'M' + (x + 6) + ' 4 q 9 7 6 17', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }));
  if (d === 3) svg.appendChild(svgEl('circle', { cx: x + 13, cy: y - 2, r: 2, fill: 'currentColor' }));
  return svg;
}

// ---------- ÇALMA ----------
// o: { dortluk (sn), sayim (ölçü sayımı tıkları), s (tartımda tek ses) }
function dkOlaylar(M, o) {
  o = o || {};
  const q = o.dortluk || 0.7, sek = q / 2;
  const L = [];
  let t = 0;
  if (o.sayim && M.olcu) {
    const v = DK_OLCU[M.olcu] / 2;
    for (let i = 0; i < v; i++) L.push({ tik: true, t: i * q, d: 0.06, v: i === 0 ? 1.3 : 1 });
    t = v * q;
  }
  M.notalar.forEach(function (n, i) {
    const d = n.d * sek;
    L.push({ hz: dkHz(o.s != null ? o.s : n.s), t: t, d: i === M.notalar.length - 1 ? Math.max(d, 1.0) : d * 0.92 });
    t += d;
  });
  return L;
}
function dkDinle(M, o) {
  const ol = dkOlaylar(M, o);
  return kulakDinle([{ olaylar: ol }], { bati: true, kararOlay: [{ hz: dkHz(DK_DO), t: 0, d: 1.2 }], kararAd: 'Do', oto: kulakArdArda([ol, ol], 1.1), ara: 1.1 });
}
function dkGeri(M, o, yazilanF) {
  return function (q) {
    const kap = h('div', { class: 'kulakGeri' });
    const satir = h('div', { class: 'kulakSatir' });
    const dugmeYap = function (etiket, olaylar) {
      const b = h('button', { class: 'cip kulakParca', type: 'button' }, '🔊 ' + etiket);
      b.onclick = function (e) {
        e.stopPropagation(); otoIptal();
        satir.querySelectorAll('.caliyor').forEach(function (x) { x.classList.remove('caliyor'); });
        b.classList.add('caliyor');
        kulakCal(olaylar, { bitince: function () { b.classList.remove('caliyor'); } });
      };
      satir.appendChild(b);
    };
    dugmeYap('Çalınan', dkOlaylar(M, o));
    const Y = yazilanF ? yazilanF(q) : null;
    if (Y) dugmeYap('Senin yazdığın', dkOlaylar(Y, o));
    kap.appendChild(satir);
    return kap;
  };
}

// ---------- ÜRETİM ----------
// Ses yürüyüşü. P: { kume: [s…], adim (yalnız adım), ucluSay (tam olarak bu kadar üçlü sıçrama), enCokUclu, akor (Do-Mi-Sol-Do' sıçramaları), doBit (olasılık) }
function dkSesler(say, P) {
  const enAlt = Math.min.apply(null, P.kume), enUst = Math.max.apply(null, P.kume);
  const akor = [28, 30, 32, 35];
  for (let deneme = 0; deneme < 200; deneme++) {
    const L = [DK_DO];
    let uclu = 0, ayniArd = 0, ok = true;
    for (let i = 1; i < say; i++) {
      const p = L[i - 1];
      const ad = [];
      P.kume.forEach(function (v) {
        const f = Math.abs(v - p);
        if (f === 0) { if (ayniArd < 1 && Math.random() < 0.35) ad.push(v); return; }
        if (f === 1) { ad.push(v, v); return; }
        if (f === 2 && !P.adim) ad.push(v);
        if (P.akor && akor.indexOf(p) >= 0 && akor.indexOf(v) >= 0 && f > 2) ad.push(v);
      });
      if (!ad.length) { ok = false; break; }
      let v = rastgele(ad);
      if (i === say - 1 && P.doBit && Math.random() < P.doBit) {
        const f = Math.abs(DK_DO - p);
        if (f <= 2 || (P.akor && akor.indexOf(p) >= 0)) v = DK_DO;
      }
      if (Math.abs(v - p) === 2) uclu++;
      ayniArd = v === p ? ayniArd + 1 : 0;
      L.push(v);
    }
    if (!ok) continue;
    if (P.ucluSay != null && uclu !== P.ucluSay) continue;
    if (P.enCokUclu != null && uclu > P.enCokUclu) continue;
    if (L.every(function (v) { return v === DK_DO; })) continue;
    if (L.some(function (v) { return v < enAlt || v > enUst; })) continue;
    if (P.hepsi && !P.kume.every(function (v) { return L.indexOf(v) >= 0; }) && say >= P.kume.length) continue;
    return L;
  }
  return null;
}
// Tartım: ölçüleri vuruş desenleriyle doldur. desenler: q [2], h [4], ee [1,1], dqe [3,1]
const DK_DESEN = { q: [2], h: [4], ee: [1, 1], dqe: [3, 1] };
function dkRitim(R) {
  const olcuUz = DK_OLCU[R.olcu];
  for (let deneme = 0; deneme < 300; deneme++) {
    const L = [];
    for (let o = 0; o < R.olcuSay; o++) {
      let pos = 0;
      while (pos < olcuUz) {
        const ad = R.desen.filter(function (d) {
          const uz = DK_DESEN[d].reduce(function (a, b) { return a + b; }, 0);
          if (pos + uz > olcuUz) return false;
          if (uz === 4 && pos % 4 !== 0) return false;   // iki vuruşluk desen 1. ya da 3. vuruşta
          return true;
        });
        const d = rastgele(ad);
        DK_DESEN[d].forEach(function (x) { L.push(x); });
        pos += DK_DESEN[d].reduce(function (a, b) { return a + b; }, 0);
      }
    }
    if (R.notaSay && (L.length < R.notaSay[0] || L.length > R.notaSay[1])) continue;
    if (R.gerekli && !R.gerekli.some(function (d) { return L.indexOf(d) >= 0; })) continue;
    if (L[L.length - 1] === 1) continue;   // ezgi sekizlikle bitmesin
    return L;
  }
  return null;
}
// Seviye ayarı L: { kume, say:[a,b] | ritim: {olculer, olcuSay, desen, notaSay, gerekli}, ses: P, dortluk }
function dkEzgi(L) {
  for (let d = 0; d < 50; d++) {
    if (L.ritim) {
      const R = Object.assign({}, L.ritim, { olcu: rastgele(L.ritim.olculer) });
      const olcuSay = R.olcuSayi ? R.olcuSayi[R.olcu] : R.olcuSay;
      R.olcuSay = olcuSay;
      const sure = dkRitim(R);
      if (!sure) continue;
      const ses = dkSesler(sure.length, L.ses);
      if (!ses) continue;
      return { olcu: R.olcu, notalar: sure.map(function (x, i) { return { s: ses[i], d: x }; }) };
    }
    const say = L.say[0] + Math.floor(Math.random() * (L.say[1] - L.say[0] + 1));
    const ses = dkSesler(say, L.ses);
    if (ses) return { olcu: null, notalar: ses.map(function (s) { return { s: s, d: 2 }; }) };
  }
  throw new Error('dikte: ezgi üretilemedi');
}
function dkMetin(M) { return M.notalar.map(function (n) { return dkAd(n.s) + (M.olcu ? ' (' + DK_SURE[n.d] + ')' : ''); }).join(', '); }
function dkKisa(M) { return M.notalar.map(function (n) { return dkAd(n.s); }).join(' – '); }
// Bir notanın sesini (ilk nota hariç) küme içinde komşu bir sesle değiştir
function dkDegistir(M, L, yasak) {
  const kume = L.ses.kume;
  for (let d = 0; d < 40; d++) {
    const i = 1 + Math.floor(Math.random() * (M.notalar.length - 1));
    const s = M.notalar[i].s;
    const ad = kume.filter(function (v) { return v !== s && Math.abs(v - s) <= 2; });
    if (!ad.length) continue;
    const V = dkKopya(M);
    V.notalar[i].s = rastgele(ad);
    const im = V.notalar.map(function (n) { return n.s; }).join(',');
    if (yasak && yasak.indexOf(im) >= 0) continue;
    return { M: V, i: i, imza: im };
  }
  return null;
}
function dkImza(M) { return M.notalar.map(function (n) { return n.s; }).join(','); }

// ---------- SORU TİPLERİ ----------
function dqYon(L) {
  const kume = L.ses.kume;
  const tur = rastgele(['c', 'i', 'a']);
  let a, b;
  for (let d = 0; d < 30; d++) {
    a = rastgele(kume);
    const ad = kume.filter(function (v) { return tur === 'c' ? v > a : tur === 'i' ? v < a : v === a; });
    if (ad.length) { b = rastgele(ad); break; }
  }
  if (b == null) throw new Error('yon');
  const M = { olcu: null, notalar: [{ s: a, d: 2 }, { s: b, d: 2 }] };
  const o = { dortluk: L.dortluk };
  return {
    oge: null, kulak: true, tip: 'secim',
    soru: { metin: '👂 İkinci ses nereye gitti?', kucuk: true }, alt: 'İki ses çalıyor',
    dinle: dkDinle(M, o),
    siklar: [{ key: 'c', metin: '↗ Çıktı (daha tiz)' }, { key: 'i', metin: '↘ İndi (daha pest)' }, { key: 'a', metin: '→ Aynı kaldı' }], sirali: true,
    dogru: tur, dogruMetin: tur === 'c' ? 'Çıktı' : tur === 'i' ? 'İndi' : 'Aynı kaldı',
    aciklama: 'Çalınan: <b>' + dkAd(a) + ' → ' + dkAd(b) + '</b>.',
    geriEk: dkGeri(M, o)
  };
}
function dqPorte(L) {
  const M = dkEzgi(L);
  const n = L.porteSik || 3;
  const imz = [dkImza(M)], sec = [{ key: 'd', M: M }];
  for (let d = 0; d < 30 && sec.length < n; d++) {
    const v = dkDegistir(M, L, imz);
    if (v) { imz.push(v.imza); sec.push({ key: 'y' + sec.length, M: v.M }); }
  }
  if (sec.length < 2) throw new Error('porte: şık az');
  const o = { dortluk: L.dortluk, sayim: !!M.olcu };
  return {
    oge: null, kulak: true, tip: 'secim',
    soru: { metin: '👂 Duyduğun ezgi hangisi?', kucuk: true }, alt: 'İlk ses Do',
    dinle: dkDinle(M, o),
    siklar: sec.map(function (x) { return svgSik(x.key, function () { return dkCiz(x.M, { enAz: 160 }); }); }),
    dogru: 'd', dogruMetin: dkKisa(M),
    aciklama: 'Çalınan: <b>' + dkKisa(M) + '</b>.',
    geriEk: dkGeri(M, o)
  };
}
function dqHata(L) {
  const M = dkEzgi(L);
  const v = dkDegistir(M, L, [dkImza(M)]);
  if (!v) throw new Error('hata');
  const o = { dortluk: L.dortluk, sayim: !!M.olcu };
  const siklar = [];
  for (let i = 2; i <= M.notalar.length; i++) siklar.push({ key: 'n' + i, metin: i + '. nota' });
  return {
    oge: null, kulak: true, tip: 'secim',
    soru: { svg: function () { return dkCiz(M, { enAz: 200 }); } },
    alt: '👂 Çalınan, yazılandan bir notada farklı. Hangisi?',
    dinle: dkDinle(v.M, o),
    siklar: siklar, sirali: true, dogru: 'n' + (v.i + 1), dogruMetin: (v.i + 1) + '. nota',
    aciklama: (v.i + 1) + '. nota yazıda <b>' + dkAd(M.notalar[v.i].s) + '</b>, çalınan <b>' + dkAd(v.M.notalar[v.i].s) + '</b>.',
    geriEk: function (q) {
      const kap = dkGeri(v.M, o)(q);
      const b = h('button', { class: 'cip kulakParca', type: 'button' }, '🔊 Yazılan');
      b.onclick = function (e) { e.stopPropagation(); otoIptal(); kulakCal(dkOlaylar(M, o)); };
      kap.querySelector('.kulakSatir').appendChild(b);
      return kap;
    }
  };
}
function dqEksik(L, kac) {
  const M = dkEzgi(L);
  const n = M.notalar.length;
  const adaylar = [];
  for (let i = 1; i < n; i++) adaylar.push(i);
  const bos = karistir(adaylar).slice(0, Math.min(kac || 1, n - 1));
  const o = { dortluk: L.dortluk, sayim: !!M.olcu };
  return {
    oge: null, kulak: true, tip: 'melodi',
    soru: { metin: '👂 Eksik ' + (bos.length > 1 ? bos.length + ' notayı' : 'notayı') + ' yaz', kucuk: true },
    alt: 'Soru işaretli yere dokun, sesi yukarı-aşağı sürükleyerek bul',
    dinle: dkDinle(M, o),
    melodi: { mod: 'eksik', M: M, bos: bos, sMin: L.sMin || 26, sMax: L.sMax || 37 },
    dogruMetin: dkKisa(M), aciklama: 'Ezgi: <b>' + dkKisa(M) + '</b>.',
    geriEk: dkGeri(M, o, function (q) { return q.dikteDeger ? { olcu: M.olcu, notalar: q.dikteDeger } : null; })
  };
}
function dqTartim(L) {
  const M = dkEzgi(L);
  const o = { dortluk: L.dortluk, sayim: true, s: 32 };
  return {
    oge: null, kulak: true, tip: 'melodi',
    soru: { metin: '👂 Tartımı yaz · ' + M.olcu + ' · ' + (dkToplam(M.notalar) / DK_OLCU[M.olcu]) + ' ölçü', kucuk: true },
    alt: 'Ezgi tek seste çalıyor; yalnız süreleri yaz (önce bir ölçü sayım)',
    dinle: dkDinle({ olcu: M.olcu, notalar: M.notalar }, o),
    melodi: { mod: 'tartim', M: { olcu: M.olcu, notalar: M.notalar.map(function (n) { return { s: 32, d: n.d }; }) }, sureler: L.sureler },
    dogruMetin: M.notalar.map(function (n) { return DK_SURE[n.d]; }).join(', '),
    aciklama: 'Tartım: <b>' + M.notalar.map(function (n) { return DK_SURE[n.d]; }).join(', ') + '</b>.',
    geriEk: dkGeri({ olcu: M.olcu, notalar: M.notalar }, o, function (q) { return q.dikteDeger ? { olcu: M.olcu, notalar: q.dikteDeger } : null; })
  };
}
function dqTam(L) {
  const M = dkEzgi(L);
  const o = { dortluk: L.dortluk, sayim: !!M.olcu };
  const ritimli = !!M.olcu;
  return {
    oge: null, kulak: true, tip: 'melodi',
    soru: { metin: '👂 Duyduğun ezgiyi yaz' + (ritimli ? ' · ' + M.olcu + ' · ' + (dkToplam(M.notalar) / DK_OLCU[M.olcu]) + ' ölçü' : ' · ' + M.notalar.length + ' nota'), kucuk: true },
    alt: ritimli ? 'İlk ses Do. Süreyi seç, porteye dokunarak notayı ekle, sürükleyerek yerini düzelt' : 'İlk ses Do verildi. Porteye dokunarak notaları ekle, sürükleyerek düzelt',
    dinle: dkDinle(M, o),
    melodi: { mod: 'tam', M: M, sureler: ritimli ? L.sureler : null, sMin: L.sMin || 26, sMax: L.sMax || 37 },
    dogruMetin: dkKisa(M), aciklama: 'Ezgi: <b>' + dkMetin(M) + '</b>.',
    geriEk: dkGeri(M, o, function (q) { return q.dikteDeger ? { olcu: M.olcu, notalar: q.dikteDeger } : null; })
  };
}
const DK_TIPLER = { yon: dqYon, porte: dqPorte, hata: dqHata, eksik1: function (L) { return dqEksik(L, 1); }, eksik3: function (L) { return dqEksik(L, 3); }, tartim: dqTartim, tam: dqTam };
function dkUretici(L, tipler) {
  return function (n) {
    const S = [];
    for (let i = 0; i < n; i++) {
      const LL = Array.isArray(L) ? rastgele(L) : L;
      const tip = tipler[i % tipler.length];
      let q = null;
      for (let d = 0; d < 8 && !q; d++) { try { q = DK_TIPLER[tip](LL); } catch (e) { if (d === 7) console.warn('Dikte sorusu üretilemedi: ' + tip, e); } }
      if (q) S.push(q);
    }
    return karistir(S);
  };
}

// ---------- PORTEYE YAZMA BİLEŞENİ (motor.js: tip 'melodi') ----------
// cfg: { mod: 'tam' | 'eksik' | 'tartim', M (beklenen), bos, sureler, sMin, sMax, degisince }
function melodiYazici(cfg) {
  const M = cfg.M, olcu = M.olcu, olcuUz = olcu ? DK_OLCU[olcu] : 0;
  const hedef = dkToplam(M.notalar);
  const sureli = !!cfg.sureler;
  let N;   // [{s, d, kS, kD, bos}]
  if (cfg.mod === 'eksik') N = M.notalar.map(function (n, i) { const b = cfg.bos.indexOf(i) >= 0; return { s: b ? null : n.s, d: n.d, kS: !b, kD: true, bos: b }; });
  else if (cfg.mod === 'tartim') N = [];
  else N = [{ s: DK_DO, d: sureli ? 2 : 2, kS: true, kD: !sureli }];
  let aktif = cfg.mod === 'eksik' ? N.findIndex(function (n) { return n.bos; }) : -1;
  let secSure = 2, kilitli = false, renk = null;
  const kap = h('div', { class: 'yerlestir dkYazici' });
  const svgKap = h('div', { class: 'dkPorteKap' });
  const bilgi = h('div', { class: 'yerBilgi' });
  kap.appendChild(svgKap);
  kap.appendChild(bilgi);
  const toplam = function () { return dkToplam(N); };
  const hayaletVar = function () { return cfg.mod !== 'eksik' && toplam() < hedef; };
  const gecerli = function (L) {
    let t = 0;
    for (let i = 0; i < L.length; i++) {
      if (olcuUz && (t % olcuUz) + L[i].d > olcuUz) return false;
      t += L[i].d;
    }
    return t <= hedef;
  };
  const sigar = function (d) { const t = toplam(); if (t + d > hedef) return false; return !olcuUz || (t % olcuUz) + d <= olcuUz; };
  let svg = null;
  function ciz() {
    bosalt(svgKap);
    const bosMap = {};
    N.forEach(function (n, i) { if (n.bos && n.s == null) bosMap[i] = true; });
    const R = {};
    if (renk) Object.assign(R, renk);
    else N.forEach(function (n, i) { if (n.bos && n.s != null) R[i] = 'var(--secim)'; else if (!n.kS && cfg.mod === 'tam') R[i] = 'var(--secim)'; });
    svg = dkCiz({ olcu: olcu, notalar: N.map(function (n) { return { s: n.s, d: n.d }; }) }, { etkilesim: !kilitli, aktif: kilitli ? null : aktif, hayalet: !kilitli && hayaletVar(), bos: bosMap, renk: R, enAz: 240 });
    svgKap.appendChild(svg);
    baglaSvg();
    bilgiYaz();
    paletGuncelle();
    if (cfg.degisince) cfg.degisince();
  }
  function bilgiYaz() {
    if (kilitli) { bilgi.textContent = ''; return; }
    const kalan = hedef - toplam();
    let m = '';
    if (cfg.mod === 'tartim') m = kalan > 0 ? 'Süre düğmelerine sırayla dokun · kalan ' + kalanMetni(kalan) : 'Tamam; kontrol et';
    else if (cfg.mod === 'eksik') { const n = N[aktif]; m = n ? (aktif + 1) + '. nota: ' + (n.s == null ? 'porteye dokun' : dkAd(n.s) + ' (sürükleyerek düzelt)') : ''; }
    else {
      const n = aktif >= 0 ? N[aktif] : null;
      if (n) m = (aktif + 1) + '. nota: ' + dkAd(n.s) + (sureli ? ' · ' + DK_SURE[n.d] : '') + (n.kS ? ' (ilk ses verildi' + (sureli ? '; süresini seçebilirsin)' : ')') : ' · sürükleyerek düzelt');
      else m = kalan > 0 ? (sureli ? 'Süreyi seç, + sütununa dokun' : '+ sütununa dokunarak sonraki notayı ekle') + ' · kalan ' + kalanMetni(kalan) : 'Tamam; kontrol et';
    }
    bilgi.textContent = m;
  }
  function kalanMetni(k) { return olcu ? (k % 2 === 0 ? (k / 2) + ' vuruş' : (k / 2).toLocaleString('tr') + ' vuruş') : (k / 2) + ' nota'; }
  function noktadan(e) {
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const m = svg.getScreenCTM(); if (!m) return null;
    return pt.matrixTransform(m.inverse());
  }
  let basili = false, ekleme = false;
  function sesAyarla(p) {
    const n = N[aktif];
    if (!n || n.kS) return;
    let s = Math.round((ALT_CIZGI_Y - p.y) / 5) + 30;
    s = Math.max(cfg.sMin || 26, Math.min(cfg.sMax || 37, s));
    n.s = s;
  }
  function isle(e, ilk) {
    if (kilitli || cfg.mod === 'tartim') return;
    const p = noktadan(e);
    if (!p) return;
    if (ilk) {
      const Y = dkYerlesim({ olcu: olcu, notalar: N }, { hayalet: hayaletVar() });
      let en = null, ed = 1e9;
      Y.kol.forEach(function (k) { const dd = Math.abs(p.x - k.x); if (dd < ed) { ed = dd; en = k.i; } });
      if (Y.hayalet) { const dd = Math.abs(p.x - Y.hayalet.x); if (dd < ed) { ed = dd; en = -1; } }
      if (en === null) return;
      if (en === -1) {
        const d = sureli ? secSure : 2;
        if (!sigar(d)) { toast(olcuUz ? 'Bu süre ölçüye sığmıyor: daha kısa bir süre seç' : 'Nota sayısı tamam'); return; }
        N.push({ s: DK_DO, d: d });
        aktif = N.length - 1; ekleme = true;
      } else {
        aktif = en;
        if (cfg.mod === 'eksik' && !N[aktif].bos) { ciz(); return; }
      }
    }
    sesAyarla(p);
    ciz();
  }
  function baglaSvg() {
    if (kilitli || cfg.mod === 'tartim') return;
    svg.addEventListener('pointerdown', function (e) { basili = true; try { svg.setPointerCapture(e.pointerId); } catch (x) {} isle(e, true); e.preventDefault(); });
    svg.addEventListener('pointermove', function (e) { if (basili) isle(e, false); });
    const birak = function () { basili = false; if (ekleme) { ekleme = false; aktif = hayaletVar() ? -1 : N.length - 1; ciz(); } };
    svg.addEventListener('pointerup', birak);
    svg.addEventListener('pointercancel', birak);
  }
  // Süre paleti ve silme
  const paletDugmeler = [];
  let palet = null;
  if (sureli || cfg.mod === 'tartim') {
    palet = h('div', { class: 'palet dkPalet' });
    const satir = h('div', { class: 'paletSatir' });
    (cfg.sureler || [2, 4]).forEach(function (d) {
      const b = h('button', { class: 'paletDugme dkSure', type: 'button', 'aria-label': DK_SURE[d] }, dkSureSimge(d), h('small', null, DK_SURE[d].replace('noktalı ', 'n. ')));
      b.onclick = function () {
        if (kilitli) return;
        if (cfg.mod === 'tartim') {
          if (!sigar(d)) { toast('Bu süre ölçüye sığmıyor'); return; }
          N.push({ s: 32, d: d, kS: true });
          ciz(); return;
        }
        const n = aktif >= 0 ? N[aktif] : null;
        if (n && !n.kD) {
          const eski = n.d; n.d = d;
          if (!gecerli(N)) { n.d = eski; toast('Bu süre ölçüye sığmıyor'); return; }
          if (hayaletVar()) aktif = -1;   // süre değişti; sıradaki düğme yeni notanın süresini seçer
        } else secSure = d;
        if (n && n.kD) aktif = -1;
        ciz();
      };
      paletDugmeler.push({ b: b, d: d });
      satir.appendChild(b);
    });
    palet.appendChild(satir);
  }
  const sil = cfg.mod !== 'eksik' ? h('button', { class: 'dugme ince dkSil', type: 'button' }, '⌫ Sil') : null;
  if (sil) sil.onclick = function () {
    if (kilitli) return;
    let i = aktif >= 0 && !N[aktif].kS ? aktif : -1;
    if (cfg.mod === 'tartim') i = N.length - 1;
    if (i < 0) { for (let j = N.length - 1; j >= 0; j--) if (!N[j].kS || cfg.mod === 'tartim') { i = j; break; } }
    if (i < 0) return;
    const yeni = N.slice(0, i).concat(N.slice(i + 1));
    if (!gecerli(yeni)) {   // ortadan silince ölçü kayıyorsa sondan sil
      N.splice(N.length - 1, 1);
    } else N.splice(i, 1);
    aktif = -1;
    ciz();
  };
  if (palet || sil) kap.appendChild(h('div', { class: 'dkAraclar' }, palet, sil));
  function paletGuncelle() {
    const n = aktif >= 0 ? N[aktif] : null;
    const gos = n && !n.kD ? n.d : secSure;
    paletDugmeler.forEach(function (x) {
      x.b.classList.toggle('secili', cfg.mod !== 'tartim' && x.d === gos);
      x.b.disabled = kilitli;
    });
    if (sil) sil.disabled = kilitli || !N.some(function (m) { return !m.kS || cfg.mod === 'tartim'; });
  }
  ciz();
  return {
    el: kap,
    tamamMi: function () { return cfg.mod === 'eksik' ? N.every(function (n) { return n.s != null; }) : toplam() === hedef; },
    deger: function () { return N.map(function (n) { return { s: n.s, d: n.d }; }); },
    kilitle: function (r) { kilitli = true; renk = r || null; aktif = null; ciz(); if (palet) palet.classList.add('kilitli'); }
  };
}
// Değerlendirme: aynı başlangıç anındaki nota aynı ses (tartımda önemsiz) ve aynı süreyse doğru
function dkDegerlendir(beklenen, yazilan, mod, sayilan) {
  const ob = dkOnsetler(beklenen), oy = dkOnsetler(yazilan);
  const yMap = {};
  yazilan.forEach(function (n, i) { yMap[oy[i]] = i; });
  let dogru = 0, top = 0;
  const renk = {};
  beklenen.forEach(function (e, i) {
    if (sayilan && !sayilan(i)) return;
    top++;
    const j = yMap[ob[i]];
    const u = j != null ? yazilan[j] : null;
    if (u && u.d === e.d && (mod === 'tartim' || u.s === e.s)) dogru++;
  });
  const bMap = {};
  beklenen.forEach(function (e, i) { bMap[ob[i]] = e; });
  yazilan.forEach(function (u, j) {
    const e = bMap[oy[j]];
    const ok = e && e.d === u.d && (mod === 'tartim' || u.s === e.s);
    renk[j] = ok ? 'var(--dogru)' : 'var(--yanlis)';
  });
  return { dogru: dogru, toplam: top, renk: renk };
}
function melodiCiz(alan, veri, q, kontrol) {
  const y = veri.melodi;
  let bil = null;
  bil = melodiYazici(Object.assign({}, y, { degisince: function () { kontrol.disabled = !bil || !bil.tamamMi(); } }));
  alan.appendChild(bil.el);
  kontrol.hidden = false;
  kontrol.disabled = !bil.tamamMi();
  kontrol.textContent = 'Kontrol et';
  kontrol.onclick = function () {
    if (q.cevaplandi || !bil.tamamMi()) return;
    const deger = bil.deger();
    q.dikteDeger = deger;
    const sureli = y.mod === 'tartim' || !!y.sureler;
    const sayilan = y.mod === 'eksik' ? function (i) { return y.bos.indexOf(i) >= 0; } : y.mod === 'tam' && !sureli ? function (i) { return i > 0; } : null;
    const D = dkDegerlendir(y.M.notalar, deger, y.mod, sayilan);
    if (y.mod === 'eksik') Object.keys(D.renk).forEach(function (j) { if (y.bos.indexOf(+j) < 0) delete D.renk[j]; });
    else if (y.mod === 'tam' && !sureli) delete D.renk[0];
    bil.kilitle(D.renk);
    kontrol.hidden = true;
    const oran = D.toplam ? D.dogru / D.toplam : 1;
    const sonuc = oran >= 0.999 ? true : (D.toplam >= 3 && oran >= 0.6 ? 'yarim' : false);
    const ad = y.mod === 'tartim' ? 'süre' : 'nota';
    const mesaj = sonuc === true ? null : sonuc === 'yarim' ? '≈ ' + D.dogru + '/' + D.toplam + ' ' + ad + ' doğru · yarım kalp' : D.toplam > 1 ? D.dogru + '/' + D.toplam + ' ' + ad + ' doğru' : null;
    cevapla(sonuc, mesaj, sonuc === true ? null : dkCiz(y.M, { enAz: 200 }));
  };
}

// ---------- SEVİYELER (Batı Teorisi: Ezgi diktesi) ----------
const DK_SEV = {
  1: { say: [2, 3], ses: { kume: [28, 29] }, dortluk: 0.75, porteSik: 2 },
  2: { say: [3, 4], ses: { kume: [28, 29, 30], adim: true }, dortluk: 0.75 },
  3: { say: [4, 4], ses: { kume: [28, 29, 30, 31], ucluSay: 1 }, dortluk: 0.72 },
  4: { say: [4, 5], ses: { kume: [28, 29, 30, 31, 32], enCokUclu: 1, doBit: 0.7 }, dortluk: 0.7 },
  5: { ritim: { olculer: ['2/4', '4/4'], olcuSayi: { '2/4': 2, '4/4': 1 }, desen: ['q', 'h'], gerekli: [4], notaSay: [3, 4] }, ses: { kume: [28, 29, 30, 31, 32], enCokUclu: 1, doBit: 0.6 }, sureler: [2, 4], dortluk: 0.66 },
  6: { ritim: { olculer: ['2/4', '4/4'], olcuSayi: { '2/4': 2, '4/4': 1 }, desen: ['q', 'h', 'ee', 'dqe'], gerekli: [1, 3], notaSay: [4, 6] }, ses: { kume: [28, 29, 30, 31, 32], enCokUclu: 1, doBit: 0.6 }, sureler: [1, 2, 3, 4], dortluk: 0.66 },
  7: { ritim: { olculer: ['2/4', '4/4'], olcuSayi: { '2/4': 2, '4/4': 2 }, desen: ['q', 'h', 'ee', 'dqe', 'q'], notaSay: [6, 8] }, ses: { kume: [28, 29, 30, 31, 32, 33, 34, 35], akor: true, enCokUclu: 2, doBit: 0.5 }, sureler: [1, 2, 3, 4], dortluk: 0.64 }
};
const DIKTE_UNITE = bUnite('b21', 0, 'Ezgi diktesi', 'Do’dan başlayan ezgiyi duy ve porteye yaz: sesler, sonra tartım', [
  { id: 'b21-1', tip: 'seviye', kulak: true, ad: '👂 Do–Re: iki ses', soruSay: 8, uret: dkUretici(DK_SEV[1], ['yon', 'porte', 'tam', 'eksik1', 'yon', 'tam']) },
  { id: 'b21-2', tip: 'seviye', kulak: true, ad: '👂 Do–Re–Mi: adım adım', soruSay: 8, uret: dkUretici(DK_SEV[2], ['yon', 'porte', 'hata', 'eksik1', 'tam']) },
  { id: 'b21-3', tip: 'seviye', kulak: true, ad: '👂 Do–Fa: bir üçlü sıçrama', soruSay: 8, uret: dkUretici(DK_SEV[3], ['porte', 'hata', 'eksik1', 'tam']) },
  { id: 'b21-4', tip: 'seviye', kulak: true, ad: '👂 Do–Sol: beş ses', soruSay: 8, uret: dkUretici(DK_SEV[4], ['hata', 'eksik3', 'tam', 'porte', 'tam']) },
  { id: 'b21-5', tip: 'seviye', kulak: true, ad: '👂 Tartım: ikilik ve dörtlük', soruSay: 8, uret: dkUretici(DK_SEV[5], ['tartim', 'porte', 'tam', 'tartim', 'tam']) },
  { id: 'b21-6', tip: 'seviye', kulak: true, ad: '👂 Sekizlik ve noktalı dörtlük', soruSay: 8, uret: dkUretici(DK_SEV[6], ['tartim', 'hata', 'eksik3', 'tam']) },
  { id: 'b21-7', tip: 'seviye', kulak: true, ad: '👂 Bütün dizi: iki ölçü', soruSay: 6, uret: dkUretici(DK_SEV[7], ['porte', 'eksik3', 'tam', 'tam']) },
  { id: 'b21-boss', tip: 'boss', kulak: true, ad: 'Ezgi diktesi finali', soruSay: 8, uret: dkUretici([DK_SEV[5], DK_SEV[6], DK_SEV[7], DK_SEV[7]], ['tam', 'tam', 'eksik3', 'hata']) }
]);
DIKTE_UNITE.ders = function () {
  const ornek = { olcu: '2/4', notalar: [{ s: 28, d: 2 }, { s: 29, d: 2 }, { s: 30, d: 1 }, { s: 31, d: 1 }, { s: 28, d: 2 }] };
  return [
    { baslik: 'Dikte dört adımdır', metin: '<p>Ezgi diktesi tek bir beceri değil: <b>duymak</b> (dikkat), <b>aklında tutmak</b> (kısa süreli ezgi belleği), <b>anlamak</b> (sesleri adlandırmak) ve <b>yazmak</b>.</p><p>Bu ünitede tam diktenin önüne bu adımları ayrı ayrı çalıştıran sorular gelir: yön, hangi porte, hatayı bul, eksiği tamamla, tartım diktesi.</p>' },
    { baslik: 'Do’yu aklında tut', metin: '<p>Her soruda <b>ilk ses Do</b> verilir; 🎯 <b>Do</b> düğmesiyle istediğin an duyabilirsin. Ezgi önce <b>iki kez</b> çalar, sonra istediğin kadar dinlersin.</p><p>Dinlerken durağı (Do) ve güçlü sesi (Sol) kafanda tut; sıçramalarda aralığı düşün (Do–Mi üçlü, Do–Sol beşli). Ezgiler çoğu zaman Do’da biter.</p>' },
    { baslik: 'Porteye yazmak', cizim: function () {
        return h('div', null, h('div', { class: 'kartPorte' }, dkCiz(ornek, { enAz: 240 })),
          dugme('🔊 Dinle', function () { kulakCal(dkOlaylar(ornek, { dortluk: 0.66, sayim: true })); }, 'ince'));
      },
      metin: '<p><b>+</b> sütununa dokun: nota eklenir. Yukarı-aşağı <b>sürükleyerek</b> yerini düzelt. Tartımlı seviyelerde önce <b>süreyi</b> seç (ikilik, dörtlük, sekizlik, noktalı dörtlük); bir notaya dokunup süre düğmesine basarak süresini değiştirebilirsin. ⌫ ile silersin.</p><p>Uzun diktede her doğru nota sayılır: hepsi doğruysa tam puan, çoğu doğruysa yarım kalp gider.</p>' }
  ];
};
BATI_UNITELER.push(DIKTE_UNITE);
