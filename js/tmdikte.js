// =====================================================
// 3.5: TÜRK MÜZİĞİ DİKTESİ (ayrı dal)
// Sıra: dörtlü diktesi (iki ses → üç → tam dörtlü) → usul diktesi → beşli → dizi → makamda kısa ezgi
//       → usullü ezgi → aksak usuller → şed makamlar.
// İlkeler: çeşninin / makamın adı ve donanımı baştan verilir (1 komalık farklar kulaktan yazdırılmaz; öğrenci
// perdenin portedeki yerini duyup yazar). İlk ses verilir, 🎯 Karar düğmesi her an çalar. Çeşniler baştan karışık sorulur.
// Sesler kuramsal (Arel-Ezgi-Uzdilek) perdelerle üretilir; yazım da bu sisteme göredir.
// dikte.js motorunu kullanır (M.sis, M.grup). dikte.js'ten sonra, motor.js'ten önce yüklenir.
// =====================================================
'use strict';

// Donanımda işaretlerin alışılmış yeri (sol anahtarı)
const TD_DON_OKTAV = { '-': [5, 5, 5, 4, 4, 4, 4], '+': [5, 5, 5, 5, 5, 4, 4] };   // harf: Do Re Mi Fa Sol La Si
function tdDonanim(notalar) {
  const L = [], gor = {};
  notalar.forEach(function (n) {
    if (!n.a || gor[n.h]) return;
    gor[n.h] = true;
    L.push({ h: n.h, o: TD_DON_OKTAV[n.a[0]][n.h], a: n.a });
  });
  // bemoller Si Mi La Re Sol Do Fa, diyezler Fa Do Sol Re La Mi Si sırasıyla
  const sB = [6, 2, 5, 1, 4, 0, 3], sD = [3, 0, 4, 1, 5, 2, 6];
  return L.sort(function (x, y) {
    const bx = x.a[0] === '-', by = y.a[0] === '-';
    if (bx !== by) return bx ? -1 : 1;
    return (bx ? sB : sD).indexOf(x.h) - (by ? sB : sD).indexOf(y.h);
  });
}
// Nota dizisinden dikte bağlamı. Aynı harf iki farklı işaretle geçiyorsa (yazılamaz) null döner.
function tdBaglam(notalar, ad, o) {
  o = o || {};
  const a = {};
  for (let i = 0; i < notalar.length; i++) {
    const n = notalar[i], isaret = n.a || null;
    if (a[n.h] !== undefined && a[n.h] !== isaret) return null;
    a[n.h] = isaret;
  }
  const adimlar = notalar.map(function (n) { return n.o * 7 + n.h; });
  if (Math.max.apply(null, adimlar) > 41 || Math.min.apply(null, adimlar) < 27) return null;
  const sis = { don: tdDonanim(notalar), a: a, kararK: komaOf(notalar[0]), ad: ad };
  return { sis: sis, kume: adimlar, karar: adimlar[0], guclu: o.gucluIdx != null ? adimlar[o.gucluIdx] : adimlar[adimlar.length - 1], ad: ad };
}
const TD_CACHE = {};
function tdCesniBaglam(id) {
  if (TD_CACHE[id] === undefined) { const c = CESNI[id]; TD_CACHE[id] = c ? tdBaglam(c.notalar, c.ad) : null; }
  return TD_CACHE[id];
}
function tdMakamBaglam(m) {
  const k = 'm:' + m.id;
  if (TD_CACHE[k] === undefined) TD_CACHE[k] = m && m.dizi ? tdBaglam(m.dizi, m.ad + (m.sed ? '' : ' makamı'), { gucluIdx: m.gucluIdx }) : null;
  return TD_CACHE[k];
}
const TD_DORTLU = D_TEMEL;                                    // Çargâh, Bûselik, Kürdi, Rast, Uşşak, Hicaz
const TD_BESLI = B_TEMEL;
function tdMakamlar(ids) { return ids.map(function (i) { return MAKAM[i]; }).filter(function (m) { return m && tdMakamBaglam(m); }); }
const TD_MAKAM_1 = ['rast', 'ussak', 'kurdi', 'buselik', 'hicaz'];
const TD_MAKAM_2 = TD_MAKAM_1.concat(['huseyni', 'humayun', 'uzzal', 'karcigar', 'suzinak', 'zirguleli']);

// Seviye ayarı A: { kaynak: () => bağlam, ilk: n (kümenin ilk n sesi), bas: 'karar' | 'guclu', … dikte.js seviye alanları }
function tdAyar(A) {
  const B = A.kaynak();
  if (!B) throw new Error('bağlam yok');
  const kume = A.ilk ? B.kume.slice(0, A.ilk) : B.kume;
  const bas = A.bas === 'guclu' && kume.indexOf(B.guclu) >= 0 ? B.guclu : B.karar;
  const enAlt = Math.min.apply(null, kume), enUst = Math.max.apply(null, kume);
  const ses = Object.assign({}, A.ses, { kume: kume, bas: bas, karar: B.karar,
    akorSet: [B.karar, B.karar + 2, B.karar + 4, B.karar + 7].filter(function (s) { return kume.indexOf(s) >= 0; }) });
  return Object.assign({}, A, { ses: ses, sis: B.sis, sMin: Math.max(26, enAlt - 2), sMax: Math.min(42, enUst + 2), baglam: B });
}
function tdUretici(A, tipler) {
  return function (n) {
    const S = [];
    let onceki = null;
    for (let i = 0; i < n; i++) {
      const tip = tipler[i % tipler.length];
      const AA = Array.isArray(A) ? rastgele(A) : A;
      let q = null;
      for (let d = 0; d < 12 && !q; d++) {
        try {
          const L = tdAyar(AA);
          if (d < 6 && L.baglam === onceki) continue;   // art arda aynı çeşni / makam gelmesin
          q = (TD_TIPLER[tip] || DK_TIPLER[tip])(L);
          if (q) onceki = L.baglam;
        } catch (e) { if (d === 11) console.warn('TM dikte sorusu üretilemedi: ' + tip, e); }
      }
      if (q) S.push(q);
    }
    return karistir(S);
  };
}
const tdSec = function (ids) { return function () { return tdCesniBaglam(rastgele(ids)); }; };
const tdMakamSec = function (ids) { return function () { const L = tdMakamlar(ids); return L.length ? tdMakamBaglam(rastgele(L)) : null; }; };
const tdSedSec = function () { const L = SEDLER.filter(function (m) { return tdMakamBaglam(m); }); return L.length ? tdMakamBaglam(rastgele(L)) : null; };

// ---------- Usul ----------
// Dikte usulleri: ölçü, sekizlik grupları, ad
const TD_USUL = {
  nimsofyan: { ad: 'Nim Sofyan', olcu: '2/4' }, semai: { ad: 'Semai', olcu: '3/4' }, sofyan: { ad: 'Sofyan', olcu: '4/4' },
  turkaksagi: { ad: 'Türk Aksağı', olcu: '5/8', grup: [2, 3] },
  devrihindi: { ad: 'Devr-i Hindî', olcu: '7/8', grup: [3, 2, 2] },
  devrituran: { ad: 'Devr-i Turan', olcu: '7/8', grup: [2, 2, 3] },
  aksak: { ad: 'Aksak', olcu: '9/8', grup: [2, 2, 2, 3] }
};
function tdUsulAd(M) {
  const k = Object.keys(TD_USUL).find(function (id) { const u = TD_USUL[id]; return u.olcu === M.olcu && JSON.stringify(u.grup || null) === JSON.stringify(M.grup || null); });
  return k ? TD_USUL[k].ad : '';
}
// Usullü seviye ayarı: usuller [kimlik], olcuSay, desen (basit usuller), sade (aksakta daha az bölünme)
function tdUsullu(usuller, o) {
  return function () {
    const uid = rastgele(usuller), u = TD_USUL[uid];
    return Object.assign({ olcuSabit: u.olcu, grupSabit: u.grup || null, usulAd: tdUsulAd,
      ritim: { olculer: [u.olcu], gruplar: u.grup ? (function () { const g = {}; g[u.olcu] = [u.grup]; return g; })() : null, olcuSay: (o.olcuSayU && o.olcuSayU[uid]) || o.olcuSay || 2, desen: o.desen || ['q', 'h'], notaSay: o.notaSay, sade: o.sade } }, o.ek || {});
  };
}
// A.usullu verilmişse her soruda usul seçilir
function tdAyarUsullu(A) {
  const U = A.usullu();
  return Object.assign({}, A, U);
}
// Duyduğun ezgi hangi usulde? (tek seste çalar; sayım tıkı yok)
function tdqUsulBul(L) {
  const M = dkEzgi(L);
  const o = { dortluk: L.dortluk, s: 32, kararsiz: true, vurgu: true };
  const iki = { olcu: M.olcu, grup: M.grup, notalar: M.notalar };
  const dogru = tdUsulAd(M);
  const adaylar = benzersiz((L.usulHavuz || Object.keys(TD_USUL)).map(function (id) { return TD_USUL[id].ad; }).filter(function (x) { return x !== dogru; }));
  return {
    oge: null, kulak: true, tip: 'secim',
    soru: { metin: '👂 Hangi usul?', kucuk: true }, alt: 'Ezgi tek seste, iki ölçü çalıyor. Vurguları say',
    dinle: dkDinle(iki, o),
    siklar: [dogru].concat(karistir(adaylar).slice(0, 3)).map(function (x) { return { key: x, metin: x }; }),
    dogru: dogru, dogruMetin: dogru + ' (' + M.olcu + ')',
    aciklama: '<b>' + dogru + '</b>: ' + M.olcu + (M.grup ? ' = ' + M.grup.join(' + ') : '') + '.',
    ipucu: 'Bir ölçüde kaç sekizlik var, uzun grup başta mı sonda mı?',
    geriEk: function (q) { return h('div', { class: 'kulakGeri' }, h('div', { class: 'kartPorte' }, dkCiz({ olcu: M.olcu, grup: M.grup, notalar: M.notalar.map(function (n) { return { s: 32, d: n.d }; }) }, { enAz: 220 }))); }
  };
}
// Bir ölçüde kaç birim (sekizlik) var?
function tdqBirim(L) {
  const M = dkEzgi(L);
  const o = { dortluk: L.dortluk, s: 32, kararsiz: true, vurgu: true };
  const n = DK_OLCU[M.olcu];
  if (!M.grup) throw new Error('aksak değil');
  const dis = [5, 7, 9, 6, 8].filter(function (x) { return x !== n; }).slice(0, 3);
  return {
    oge: null, kulak: true, tip: 'secim',
    soru: { metin: '👂 Bir ölçüde kaç sekizlik var?', kucuk: true }, alt: 'Ezgi tek seste, iki ölçü çalıyor. En kısa süre bir sekizlik',
    dinle: dkDinle({ olcu: M.olcu, grup: M.grup, notalar: M.notalar }, o),
    siklar: [n].concat(dis).sort(function (a, b) { return a - b; }).map(function (x) { return { key: 'n' + x, metin: String(x) }; }), sirali: true,
    dogru: 'n' + n, dogruMetin: n + ' (' + tdUsulAd(M) + ', ' + M.olcu + ')',
    aciklama: '<b>' + tdUsulAd(M) + '</b>: ' + M.olcu + ' = ' + M.grup.join(' + ') + '.',
    ipucu: 'İkişerli ve üçerli grupları ayrı ayrı say',
    geriEk: function (q) { return h('div', { class: 'kulakGeri' }, h('div', { class: 'kartPorte' }, dkCiz({ olcu: M.olcu, grup: M.grup, notalar: M.notalar.map(function (x) { return { s: 32, d: x.d }; }) }, { enAz: 220 }))); }
  };
}
// Usulü çalarak dinlet (bendir sesiyle), adını ya da zaman sayısını sor (Usul dalının verisiyle)
function tdqUsulDinle(tur) {
  return function () {
    const havuz = ['nimsofyan', 'semai', 'sofyan', 'turkaksagi', 'yuruksemai', 'devrihindi', 'devrituran', 'duyek', 'aksak'].map(function (i) { return USUL[i]; }).filter(Boolean);
    const u = rastgele(havuz);
    const q = { oge: null, kulak: true, tip: 'secim', soru: {}, aciklama: usulAciklama(u),
      dinle: { olaylar: u.olaylar, onaltilikSn: usulOnaltilikSn(u), devir: u.zaman <= 4 ? 3 : 2 } };
    if (tur === 'zaman') {
      q.alt = '👂 Duyduğun usul kaç zamanlı?';
      const dis = karistir([2, 3, 4, 5, 6, 7, 8, 9].filter(function (x) { return x !== u.zaman; }).sort(function (a, b) { return Math.abs(a - u.zaman) - Math.abs(b - u.zaman); }).slice(0, 4)).slice(0, 3);
      q.siklar = [u.zaman].concat(dis).sort(function (a, b) { return a - b; }).map(function (x) { return { key: 'z' + x, metin: x + ' zamanlı' }; }); q.sirali = true;
      q.dogru = 'z' + u.zaman; q.dogruMetin = u.zaman + ' zamanlı (' + u.ad + ')';
      q.ipucu = 'Düm ile başlayan döngüyü bul, içindeki zamanları say';
    } else {
      q.alt = '👂 Duyduğun hangi usul?';
      q.siklar = usulSiklar(u, havuz, false).map(function (x) { return { key: x.id, metin: x.ad }; });
      q.dogru = u.id; q.dogruMetin = u.ad; q.ipucu = u.zaman + ' zamanlı. Dümlerin yerine dikkat et.';
    }
    return q;
  };
}
const TD_TIPLER = {
  usulBul: function (L) { return tdqUsulBul(L); },
  birim: function (L) { return tdqBirim(L); },
  usulDinle: tdqUsulDinle('ad'),
  usulZaman: tdqUsulDinle('zaman'),
  tartimKalip: function () { return tartimDikteSorusu(T_IKIDORT); }
};
// Usullü üretici: her soruda usul seçilir; perdeli sorularda bağlam (makam) da seçilir
function tdUsulUretici(A, tipler) {
  return function (n) {
    const S = [];
    for (let i = 0; i < n; i++) {
      const tip = tipler[i % tipler.length];
      let q = null;
      for (let d = 0; d < 12 && !q; d++) {
        try {
          let L = tdAyarUsullu(Array.isArray(A) ? rastgele(A) : A);
          if (L.kaynak) L = tdAyar(L);
          else L = Object.assign({}, L, { perdesiz: true, ses: { kume: [31, 32, 33], bas: 32 } });   // perdesiz sorularda sesler önemsiz
          q = (TD_TIPLER[tip] || DK_TIPLER[tip])(L);
        } catch (e) { if (d === 11) console.warn('TM usul diktesi üretilemedi: ' + tip, e); }
      }
      if (q) S.push(q);
    }
    return karistir(S);
  };
}

// ---------- ÜNİTELER ----------
function tdUnite(id, no, ad, kisa, seviyeler) {
  seviyeler.forEach(function (s) { s.kulak = true; });
  return { id: id, dal: 'tmd', no: no, ad: ad, kisa: kisa, ogeler: [], seviyeler: seviyeler };
}
const TD_UNITELER = [
  tdUnite('dk1', 1, 'Dörtlü diktesi: ilk sesler', 'Karar ve komşuları: iki ses, sonra üç ses', [
    { id: 'dk1-1', tip: 'seviye', ad: '👂 İki ses: karar ve üstündeki', soruSay: 8, uret: tdUretici({ kaynak: tdSec(TD_DORTLU), ilk: 2, say: [2, 3], ses: {}, dortluk: 0.75, porteSik: 2 }, ['yon', 'porte', 'tam', 'eksik1', 'yon', 'tam']) },
    { id: 'dk1-2', tip: 'seviye', ad: '👂 Üç ses: adım adım', soruSay: 8, uret: tdUretici({ kaynak: tdSec(TD_DORTLU), ilk: 3, say: [3, 4], ses: { adim: true }, dortluk: 0.75 }, ['yon', 'porte', 'hata', 'eksik1', 'tam']) },
    { id: 'dk1-3', tip: 'seviye', ad: '👂 Üç ses: bir sıçrama', soruSay: 8, uret: tdUretici({ kaynak: tdSec(TD_DORTLU), ilk: 3, say: [4, 4], ses: { ucluSay: 1 }, dortluk: 0.72 }, ['porte', 'hata', 'eksik1', 'tam']) },
    { id: 'dk1-boss', tip: 'boss', ad: 'İlk sesler finali', soruSay: 8, uret: tdUretici({ kaynak: tdSec(TD_DORTLU), ilk: 3, say: [4, 5], ses: { enCokUclu: 1, doBit: 0.6 }, dortluk: 0.72 }, ['tam', 'hata', 'eksik1', 'tam']) }
  ]),
  tdUnite('dk2', 2, 'Dörtlü diktesi: tam dörtlü', 'Altı dörtlü karışık: dört sesle kısa ezgiler', [
    { id: 'dk2-1', tip: 'seviye', ad: '👂 Dört ses: adım adım', soruSay: 8, uret: tdUretici({ kaynak: tdSec(TD_DORTLU), say: [4, 5], ses: { adim: true }, dortluk: 0.72 }, ['porte', 'hata', 'eksik1', 'tam']) },
    { id: 'dk2-2', tip: 'seviye', ad: '👂 Dört ses: sıçramalı', soruSay: 8, uret: tdUretici({ kaynak: tdSec(TD_DORTLU), say: [4, 5], ses: { enCokUclu: 1, doBit: 0.6 }, dortluk: 0.7 }, ['hata', 'eksik3', 'tam', 'porte', 'tam']) },
    { id: 'dk2-3', tip: 'seviye', ad: '👂 Kararda biten ezgi', soruSay: 8, uret: tdUretici({ kaynak: tdSec(TD_DORTLU), say: [5, 6], ses: { enCokUclu: 2, doBit: 0.9, hepsi: true }, dortluk: 0.7 }, ['eksik3', 'tam', 'hata', 'tam']) },
    { id: 'dk2-boss', tip: 'boss', ad: 'Dörtlü diktesi finali', soruSay: 8, uret: tdUretici({ kaynak: tdSec(TD_DORTLU), say: [5, 6], ses: { enCokUclu: 2, doBit: 0.7 }, dortluk: 0.7 }, ['tam', 'tam', 'eksik3', 'hata']) }
  ]),
  tdUnite('dk3', 3, 'Usul diktesi', 'Perdesiz: usulü tanı, vuruşları ve süreleri yaz', [
    { id: 'dk3-1', tip: 'seviye', ad: '👂 Usulü dinle: adı ve zamanı', soruSay: 8, uret: tdUsulUretici({ usullu: tdUsullu(['nimsofyan'], {}) }, ['usulDinle', 'usulZaman']) },
    { id: 'dk3-2', tip: 'seviye', ad: '👂 Tartım kalıpları (2/4)', soruSay: 6, uret: tdUsulUretici({ usullu: tdUsullu(['nimsofyan'], {}) }, ['tartimKalip']) },
    { id: 'dk3-3', tip: 'seviye', ad: '👂 Süreleri yaz: Nim Sofyan ve Sofyan', soruSay: 8, uret: tdUsulUretici({ usullu: tdUsullu(['nimsofyan', 'sofyan'], { olcuSay: 2, desen: ['q', 'h'], notaSay: [3, 7], ek: { sureler: [2, 4] } }), dortluk: 0.66 }, ['tartim']) },
    { id: 'dk3-4', tip: 'seviye', ad: '👂 Süreleri yaz: Semai ve sekizlikler', soruSay: 8, uret: tdUsulUretici({ usullu: tdUsullu(['semai', 'nimsofyan', 'sofyan'], { olcuSay: 2, desen: ['q', 'h', 'ee', 'dqe'], notaSay: [4, 9], ek: { sureler: [1, 2, 3, 4] } }), dortluk: 0.66 }, ['tartim']) },
    { id: 'dk3-boss', tip: 'boss', ad: 'Usul diktesi finali', soruSay: 8, uret: tdUsulUretici({ usullu: tdUsullu(['semai', 'nimsofyan', 'sofyan'], { olcuSay: 2, desen: ['q', 'h', 'ee', 'dqe'], notaSay: [4, 9], ek: { sureler: [1, 2, 3, 4] } }), dortluk: 0.64 }, ['tartim', 'usulDinle', 'tartim', 'usulZaman']) }
  ]),
  tdUnite('dk4', 4, 'Beşli diktesi', 'Altı beşli karışık: beş sesle ezgiler', [
    { id: 'dk4-1', tip: 'seviye', ad: '👂 Beş ses: adım adım', soruSay: 8, uret: tdUretici({ kaynak: tdSec(TD_BESLI), say: [4, 5], ses: { adim: true }, dortluk: 0.72 }, ['porte', 'hata', 'eksik1', 'tam']) },
    { id: 'dk4-2', tip: 'seviye', ad: '👂 Beş ses: sıçramalı', soruSay: 8, uret: tdUretici({ kaynak: tdSec(TD_BESLI), say: [5, 6], ses: { enCokUclu: 2, doBit: 0.6 }, dortluk: 0.7 }, ['hata', 'eksik3', 'tam', 'porte', 'tam']) },
    { id: 'dk4-3', tip: 'seviye', ad: '👂 Karar, üçüncü ses, güçlü', soruSay: 8, uret: tdUretici({ kaynak: tdSec(TD_BESLI), say: [5, 6], ses: { akor: true, enCokUclu: 2, doBit: 0.8 }, dortluk: 0.7 }, ['eksik3', 'tam', 'hata', 'tam']) },
    { id: 'dk4-boss', tip: 'boss', ad: 'Beşli diktesi finali', soruSay: 8, uret: tdUretici([{ kaynak: tdSec(TD_BESLI), say: [5, 6], ses: { akor: true, enCokUclu: 2, doBit: 0.7 }, dortluk: 0.7 }, { kaynak: tdSec(TD_DORTLU), say: [5, 6], ses: { enCokUclu: 2, doBit: 0.7 }, dortluk: 0.7 }], ['tam', 'tam', 'eksik3', 'hata']) }
  ]),
  tdUnite('dk5', 5, 'Dizi diktesi: dörtlü + beşli', 'İki çeşni art arda: makam dizisinde ezgi', [
    { id: 'dk5-1', tip: 'seviye', ad: '👂 Karardan başla: adım adım', soruSay: 8, uret: tdUretici({ kaynak: tdMakamSec(TD_MAKAM_1), say: [5, 6], ses: { adim: true }, dortluk: 0.7 }, ['porte', 'hata', 'eksik1', 'tam']) },
    { id: 'dk5-2', tip: 'seviye', ad: '👂 Güçlüden başla', soruSay: 8, uret: tdUretici({ kaynak: tdMakamSec(TD_MAKAM_1), bas: 'guclu', say: [5, 6], ses: { adim: true }, dortluk: 0.7 }, ['porte', 'hata', 'eksik3', 'tam']) },
    { id: 'dk5-3', tip: 'seviye', ad: '👂 Bütün dizi: sıçramalı', soruSay: 8, uret: tdUretici([{ kaynak: tdMakamSec(TD_MAKAM_1), say: [5, 6], ses: { enCokUclu: 1, doBit: 0.5 }, dortluk: 0.7 }, { kaynak: tdMakamSec(TD_MAKAM_1), bas: 'guclu', say: [5, 6], ses: { enCokUclu: 1 }, dortluk: 0.7 }], ['hata', 'eksik3', 'tam', 'tam']) },
    { id: 'dk5-boss', tip: 'boss', ad: 'Dizi diktesi finali', soruSay: 8, uret: tdUretici([{ kaynak: tdMakamSec(TD_MAKAM_1), say: [6, 6], ses: { enCokUclu: 2, doBit: 0.6 }, dortluk: 0.7 }, { kaynak: tdMakamSec(TD_MAKAM_1), bas: 'guclu', say: [6, 6], ses: { enCokUclu: 2 }, dortluk: 0.7 }], ['tam', 'tam', 'eksik3', 'hata']) }
  ]),
  tdUnite('dk6', 6, 'Makamda kısa ezgi', 'On bir makam: güçlüde duran, kararda biten ezgiler', [
    { id: 'dk6-1', tip: 'seviye', ad: '👂 Beş temel makam', soruSay: 8, uret: tdUretici({ kaynak: tdMakamSec(TD_MAKAM_1), say: [6, 7], ses: { akor: true, enCokUclu: 2, doBit: 0.8 }, dortluk: 0.68 }, ['porte', 'hata', 'eksik3', 'tam']) },
    { id: 'dk6-2', tip: 'seviye', ad: '👂 Hüseyni, Hümayun ve ötekiler', soruSay: 8, uret: tdUretici({ kaynak: tdMakamSec(TD_MAKAM_2), say: [6, 7], ses: { akor: true, enCokUclu: 2, doBit: 0.8 }, dortluk: 0.68 }, ['hata', 'eksik3', 'tam', 'tam']) },
    { id: 'dk6-boss', tip: 'boss', ad: 'Makam ezgisi finali', soruSay: 8, uret: tdUretici([{ kaynak: tdMakamSec(TD_MAKAM_2), say: [6, 8], ses: { akor: true, enCokUclu: 2, doBit: 0.8 }, dortluk: 0.66 }, { kaynak: tdMakamSec(TD_MAKAM_2), bas: 'guclu', say: [6, 8], ses: { akor: true, enCokUclu: 2, doBit: 0.8 }, dortluk: 0.66 }], ['tam', 'tam', 'eksik3', 'hata']) }
  ]),
  tdUnite('dk7', 7, 'Usullü ezgi', 'Nim Sofyan, Semai ve Sofyan’da: önce süreler, sonra perdeler', [
    { id: 'dk7-1', tip: 'seviye', ad: '👂 İkilik ve dörtlük', soruSay: 8, uret: tdUsulUretici({ kaynak: tdMakamSec(TD_MAKAM_1), ilk: 5, usullu: tdUsullu(['nimsofyan', 'sofyan'], { olcuSay: 2, desen: ['q', 'h'], notaSay: [3, 7], ek: { sureler: [2, 4] } }), ses: { enCokUclu: 1, doBit: 0.7 }, dortluk: 0.66 }, ['tartim', 'porte', 'tam', 'eksik3', 'tam']) },
    { id: 'dk7-2', tip: 'seviye', ad: '👂 Sekizlik ve noktalı dörtlük', soruSay: 8, uret: tdUsulUretici({ kaynak: tdMakamSec(TD_MAKAM_1), ilk: 5, usullu: tdUsullu(['nimsofyan', 'sofyan', 'semai'], { olcuSay: 2, desen: ['q', 'h', 'ee', 'dqe'], notaSay: [4, 8], ek: { sureler: [1, 2, 3, 4] } }), ses: { enCokUclu: 1, doBit: 0.7 }, dortluk: 0.66 }, ['tartim', 'hata', 'eksik3', 'tam']) },
    { id: 'dk7-3', tip: 'seviye', ad: '👂 Bütün dizi: iki ölçü', soruSay: 6, uret: tdUsulUretici({ kaynak: tdMakamSec(TD_MAKAM_2), usullu: tdUsullu(['nimsofyan', 'sofyan', 'semai'], { olcuSay: 2, desen: ['q', 'h', 'ee', 'dqe', 'q'], notaSay: [5, 9], ek: { sureler: [1, 2, 3, 4] } }), ses: { akor: true, enCokUclu: 2, doBit: 0.7 }, dortluk: 0.66 }, ['porte', 'eksik3', 'tam', 'tam']) },
    { id: 'dk7-boss', tip: 'boss', ad: 'Usullü ezgi finali', soruSay: 8, uret: tdUsulUretici({ kaynak: tdMakamSec(TD_MAKAM_2), usullu: tdUsullu(['nimsofyan', 'sofyan', 'semai'], { olcuSay: 2, desen: ['q', 'h', 'ee', 'dqe', 'q'], notaSay: [5, 9], ek: { sureler: [1, 2, 3, 4] } }), ses: { akor: true, enCokUclu: 2, doBit: 0.7 }, dortluk: 0.64 }, ['tam', 'tam', 'eksik3', 'hata']) }
  ]),
  tdUnite('dk8', 8, 'Aksak usullerde ezgi', 'Türk Aksağı, Devr-i Hindî, Devr-i Turan, Aksak', [
    { id: 'dk8-1', tip: 'seviye', ad: '👂 Birimleri say, usulü bul', soruSay: 8, uret: tdUsulUretici({ usullu: tdUsullu(['turkaksagi', 'devrihindi', 'devrituran', 'aksak'], { olcuSay: 2, sade: true }), dortluk: 0.62 }, ['birim', 'usulBul']) },
    { id: 'dk8-2', tip: 'seviye', ad: '👂 Aksak süreleri yaz', soruSay: 8, uret: tdUsulUretici({ usullu: tdUsullu(['turkaksagi', 'devrihindi', 'devrituran', 'aksak'], { olcuSay: 1, sade: true, ek: { sureler: [1, 2, 3] } }), dortluk: 0.62 }, ['tartim', 'usulBul', 'tartim']) },
    { id: 'dk8-3', tip: 'seviye', ad: '👂 Türk Aksağı ve yedi zamanlılar', soruSay: 8, uret: tdUsulUretici({ kaynak: tdMakamSec(TD_MAKAM_1), ilk: 5, usullu: tdUsullu(['turkaksagi', 'devrihindi', 'devrituran'], { olcuSay: 2, sade: true, ek: { sureler: [1, 2, 3] } }), ses: { enCokUclu: 1, doBit: 0.7 }, dortluk: 0.62 }, ['porte', 'eksik3', 'tam', 'hata', 'tam']) },
    { id: 'dk8-boss', tip: 'boss', ad: 'Aksak usuller finali', soruSay: 8, uret: tdUsulUretici({ kaynak: tdMakamSec(TD_MAKAM_2), usullu: tdUsullu(['turkaksagi', 'devrihindi', 'devrituran', 'aksak'], { olcuSay: 2, olcuSayU: { aksak: 1 }, ek: { sureler: [1, 2, 3] } }), ses: { enCokUclu: 2, doBit: 0.7 }, dortluk: 0.62 }, ['tam', 'eksik3', 'tam', 'hata']) }
  ]),
  tdUnite('dk9', 9, 'Şed makamlarda dikte', 'Mahur, Hicazkâr, Kürdîlihicazkâr, Nihâvend, Sultânîyegâh', [
    { id: 'dk9-1', tip: 'seviye', ad: '👂 Göçürülmüş dizide ezgi', soruSay: 8, uret: tdUretici({ kaynak: tdSedSec, say: [5, 6], ses: { enCokUclu: 1, doBit: 0.6 }, dortluk: 0.7 }, ['porte', 'hata', 'eksik3', 'tam']) },
    { id: 'dk9-2', tip: 'seviye', ad: '👂 Usullü: iki ölçü', soruSay: 8, uret: tdUsulUretici({ kaynak: tdSedSec, usullu: tdUsullu(['nimsofyan', 'sofyan', 'semai'], { olcuSay: 2, desen: ['q', 'h', 'ee', 'dqe'], notaSay: [4, 8], ek: { sureler: [1, 2, 3, 4] } }), ses: { akor: true, enCokUclu: 2, doBit: 0.7 }, dortluk: 0.66 }, ['tartim', 'eksik3', 'tam', 'tam']) },
    { id: 'dk9-boss', tip: 'boss', ad: 'Şed makamlar dikte finali', soruSay: 8, uret: tdUsulUretici([{ kaynak: tdSedSec, usullu: tdUsullu(['nimsofyan', 'sofyan', 'semai'], { olcuSay: 2, desen: ['q', 'h', 'ee', 'dqe'], notaSay: [4, 8], ek: { sureler: [1, 2, 3, 4] } }), ses: { akor: true, enCokUclu: 2, doBit: 0.7 }, dortluk: 0.64 },
      { kaynak: tdSedSec, usullu: tdUsullu(['turkaksagi', 'devrihindi'], { olcuSay: 2, sade: true, ek: { sureler: [1, 2, 3] } }), ses: { enCokUclu: 1, doBit: 0.7 }, dortluk: 0.62 }], ['tam', 'tam', 'eksik3', 'hata']) }
  ])
];

// ---------- DERSLER ----------
(function () {
  const ornekCesni = function () { const B = tdCesniBaglam('d-hicaz'); return { olcu: null, sis: B.sis, notalar: [B.kume[0], B.kume[1], B.kume[2], B.kume[1], B.kume[0]].map(function (s) { return { s: s, d: 2 }; }) }; };
  const dinleKart = function (M, o) {
    return function () {
      const ol = dkOlaylar(M, o || { dortluk: 0.7 });
      const D = M.sis ? kulakDinle([{ olaylar: ol }], { karar: M.sis.kararK }) : null;
      return h('div', null, h('div', { class: 'kartPorte' }, dkCiz(M, { enAz: 240 })),
        dugme('🔊 Dinle', function () { kulakCal(ol, { kaydir: D ? D.kaydir : 0 }); }, 'ince'));
    };
  };
  const D = {
    dk1: function () {
      return [
        { baslik: 'Dikte: duy, aklında tut, anla, yaz', metin: '<p>Dikte dört adımlı bir iştir: sesi <b>duymak</b>, <b>aklında tutmak</b>, hangi perde olduğunu <b>anlamak</b> ve porteye <b>yazmak</b>.</p><p>Bu dalda tam diktenin önüne bu adımları ayrı ayrı çalıştıran sorular gelir: ses çıktı mı indi mi, duyduğun hangi porte, yazılanla çalınan nerede farklı, eksik notayı tamamla.</p>' },
        { baslik: 'Önce dörtlüler', cizim: dinleKart(ornekCesni()),
          metin: '<p>Makam, bir dörtlü ile bir beşlinin birleşimidir. Dörtlüyü duyup yazamayan, makam ezgisini de yazamaz; bu yüzden dikteye <b>dörtlülerle</b> başlıyoruz: önce karar ve üstündeki ses, sonra üç ses, sonra dörtlünün tamamı.</p><p>Her soruda dörtlünün <b>adı</b> ve <b>donanımı</b> verilir, ilk ses yazılıdır. Sen seslerin portedeki yerini duyup yazarsın.</p>' },
        { baslik: 'Kararı aklında tut', metin: '<p>🎯 <b>Karar</b> düğmesi karar perdesini istediğin an çalar. Ezgi başta <b>iki kez</b> çalar, sonra istediğin kadar dinlersin.</p><p>Dörtlüler baştan <b>karışık</b> sorulur: bir soruda Hicaz, sonrakinde Rast. Tek bir dörtlüye alışıp ötekine geçememek en sık yaşanan güçlüktür; karışık çalışmak bunu önler.</p><p class="kucukNot">Sesler Kız ahenginde çalar: yazıldığı yerden değil, daha pestten duyarsın. Perdeler kuramsal (Arel-Ezgi-Uzdilek) yerlerindedir; icrada bazı perdeler biraz farklı basılır.</p>' }
      ];
    },
    dk2: function () { return [{ baslik: 'Tam dörtlü', metin: '<p>Artık dörtlünün dört sesi de ezgide. Önce yalnız <b>adım adım</b> yürüyen, sonra bir sesi atlayıp <b>sıçrayan</b> ezgiler gelir.</p><p>Ezgi çoğu zaman <b>kararda</b> biter. Son sesi duyunca "evine döndü mü" diye kendine sor: bu, ötekileri bulmanı kolaylaştırır.</p>' }]; },
    dk3: function () {
      return [
        { baslik: 'Usul diktesi: perdesiz', metin: '<p>Burada perde yok, yalnız <b>süre</b> var. Ezgi tek seste çalar; sen sürelerini yazarsın.</p><p>İyi bir dikte önce tartımı, sonra perdeleri yazar. Bu yüzden usul diktesi, usullü ezgiden önce gelir.</p>' },
        { baslik: 'Önce say', metin: '<p>Her sorunun başında <b>bir ölçü sayım</b> duyarsın. Nim Sofyan iki, Semai üç, Sofyan dört vuruştur.</p><p>Süre düğmelerine sırayla dokun; yanlış girdiğini ⌫ ile silersin. Ölçüye sığmayan süreyi oyun kabul etmez.</p>' }
      ];
    },
    dk4: function () { return [{ baslik: 'Beşliler', metin: '<p>Beşli, dörtlünün üstüne bir ses daha ekler. Beşinci ses çoğu makamda <b>güçlü</b> perdedir; ezgi orada durup karara döner.</p><p>Üç dayanak noktasını dinle: <b>karar</b>, <b>üçüncü ses</b> ve <b>beşinci ses</b>. Ezgi bunların arasında sıçrayabilir.</p>' }]; },
    dk5: function () { return [{ baslik: 'İki çeşni art arda', metin: '<p>Dörtlü ile beşli birleşince <b>makam dizisi</b> olur. Ezgi artık sekiz sesin içinde dolaşır.</p><p>Bazı sorular <b>karardan</b>, bazıları <b>güçlüden</b> başlar; ilk ses her zaman yazılıdır. Makamın adı ve donanımı soruda verilir.</p>' }]; },
    dk6: function () { return [{ baslik: 'Makamda ezgi', metin: '<p>Ezgiler uzuyor: altı, yedi, sekiz ses. Çoğu güçlüde durup <b>kararda</b> biter.</p><p>Uzun ezgiyi bir kerede tutmaya çalışma: ilk dinlemede başını, ikincide sonunu yaz, ortasını üçüncü dinlemeye bırak.</p>' }]; },
    dk7: function () {
      const B = tdMakamBaglam(MAKAM.ussak);
      const M = { olcu: '2/4', sis: B.sis, notalar: [[B.kume[0], 2], [B.kume[1], 1], [B.kume[2], 1], [B.kume[1], 2], [B.kume[0], 2]].map(function (x) { return { s: x[0], d: x[1] }; }) };
      return [
        { baslik: 'Süre ve perde birlikte', cizim: dinleKart(M, { dortluk: 0.66, sayim: true }),
          metin: '<p>Önce <b>süreyi</b> seç (ikilik, dörtlük, sekizlik, noktalı dörtlük), sonra <b>+</b> sütununa dokunup notayı ekle; yukarı-aşağı sürükleyerek yerini düzelt.</p><p>Bir notaya dokunup süre düğmesine basarsan süresi değişir.</p>' },
        { baslik: 'Kısmi puan', metin: '<p>Her nota ayrı sayılır: hepsi doğruysa tam, en az <b>%60</b>’ı doğruysa <b>yarım kalp</b> gider.</p><p>Usuller: <b>Nim Sofyan</b> (2/4), <b>Semai</b> (3/4), <b>Sofyan</b> (4/4).</p>' }
      ];
    },
    dk8: function () { return [{ baslik: 'Aksak usulü duymak', metin: '<p>Aksak usullerde vuruşlar eşit değildir: ikişerli ve üçerli gruplar yan yana gelir.</p><p>Üç adımda bul: en kısa süreyi (sekizlik) say, <b>bir ölçüde kaç tane</b> olduğunu bul, <b>uzun grubun</b> başta mı sonda mı olduğuna bak.</p><p><b>Türk Aksağı</b> 5 = 2+3 · <b>Devr-i Hindî</b> 7 = 3+2+2 · <b>Devr-i Turan</b> 7 = 2+2+3 · <b>Aksak</b> 9 = 2+2+2+3</p>' }]; },
    dk9: function () { return [{ baslik: 'Aynı dizi, başka perde', metin: '<p>Şed makam, bir makam dizisinin başka bir perdeye <b>göçürülmüşüdür</b>. Kulağın tanıdığı ezgi aynıdır; yazıldığı yer ve donanım değişir.</p><p>Donanım soruda verilir. Kararı dinle, ezgiyi yeni yerinden yaz.</p>' }]; }
  };
  TD_UNITELER.forEach(function (u) { if (D[u.id]) u.ders = D[u.id]; });
})();
