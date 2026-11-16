// =====================================================
// BATI TEORİSİ: aralıklar (2'li–7'li), tonlar, donanım, minör türleri, beşliler çemberi
// Sadece sol anahtarı. Çift artık / çift eksik üretilmez.
// =====================================================
'use strict';

const SAYI_AD = { 2: 'İkili', 3: 'Üçlü', 4: 'Dörtlü', 5: 'Beşli', 6: 'Altılı', 7: 'Yedili' };
const NIT_AD = { E: 'Eksik', K: 'Küçük', B: 'Büyük', T: 'Tam', A: 'Artık' };
const TABAN_YARIM = { 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 11 };
function tamGrubu(n) { return n === 4 || n === 5; }
function nitelikler(n) { return tamGrubu(n) ? ['E', 'T', 'A'] : ['E', 'K', 'B', 'A']; }
function nitFark(n, q) { return tamGrubu(n) ? { E: -1, T: 0, A: 1 }[q] : { E: -2, K: -1, B: 0, A: 1 }[q]; }
const TUM_KODLAR = [];
[2, 3, 4, 5, 6, 7].forEach(function (n) { nitelikler(n).forEach(function (q) { TUM_KODLAR.push(q + n); }); });
function kodAd(k) { return NIT_AD[k[0]] + ' ' + SAYI_AD[+k.slice(1)]; }
function kodYarim(k) { const n = +k.slice(1); return TABAN_YARIM[n] + nitFark(n, k[0]); }
const ARIZA_YARIM = { 'bb': -2, 'b': -1, null: 0, '#': 1, 'x': 2 };
function yarimdanAriza(d) { return { '-2': 'bb', '-1': 'b', '0': null, '1': '#', '2': 'x' }[String(d)]; }

function batiNotaYaz(h_, o, yarim) {
  const d = yarim - (o * 12 + YARIM_TABAN[h_]);
  return { h: h_, o: o, a: yarimdanAriza(d), d: d };
}
// alt notadan yukarı aralık kur; tek işaretle yazılamıyorsa null
function aralikKur(alt, kod) {
  const n = +kod.slice(1);
  const h_ = (alt.h + n - 1) % 7, o = alt.o + Math.floor((alt.h + n - 1) / 7);
  const u = batiNotaYaz(h_, o, yarimOf(alt) + kodYarim(kod));
  if (Math.abs(u.d) > 1) return null;
  return { h: u.h, o: u.o, a: u.a };
}
function aralikBul(alt, ust) {
  const n = adim(ust) - adim(alt) + 1;
  if (n < 2 || n > 7) return null;
  const fark = yarimOf(ust) - yarimOf(alt) - TABAN_YARIM[n];
  const q = nitelikler(n).find(function (x) { return nitFark(n, x) === fark; });
  return q ? q + n : null;
}
function cevrimKod(k) {
  const n = +k.slice(1);
  return { E: 'A', A: 'E', K: 'B', B: 'K', T: 'T' }[k[0]] + (9 - n);
}

// ---- Aralık sorusu üretimi ----
// o: { kodlar:[...], ariza: 0..1 (alt notada işaret olasılığı) }
function rastgeleAralik(kodlar, arizaOlasilik) {
  for (let d = 0; d < 200; d++) {
    const kod = rastgele(kodlar);
    const alt = { h: Math.floor(Math.random() * 7), o: 4, a: null };
    if (Math.random() < arizaOlasilik) alt.a = rastgele(['#', 'b']);
    if (adim(alt) < 28 || adim(alt) > 35) continue;
    const ust = aralikKur(alt, kod);
    if (!ust || adim(ust) > 42) continue;
    return { alt: alt, ust: ust, kod: kod };
  }
  return { alt: { h: 0, o: 4, a: null }, ust: { h: 2, o: 4, a: null }, kod: 'B3' };
}
function aralikAciklama(x) {
  const n = +x.kod.slice(1);
  const harfler = [];
  for (let i = 0; i < n; i++) harfler.push(HARF_AD[(x.alt.h + i) % 7]);
  return '<b>' + batiAd(x.alt, true) + ' – ' + batiAd(x.ust, true) + '</b>: ' + harfler.join('-') + ' = ' + n + ' harf → ' + SAYI_AD[n].toLowerCase() +
    '. Aralarında ' + kodYarim(x.kod) + ' yarım ses → <b>' + kodAd(x.kod) + '</b>.';
}
function aralikPorte(x) { return { notalar: [x.alt, x.ust], aralik: 52 }; }
function aralikCeldirici(kod, izinli) {
  const n = +kod.slice(1);
  const L = [];
  nitelikler(n).forEach(function (q) { if (q + n !== kod) L.push(q + n); });                 // aynı sayı
  const yarim = kodYarim(kod);
  TUM_KODLAR.forEach(function (k) { if (k !== kod && kodYarim(k) === yarim) L.push(k); });     // aynı ses, başka yazım
  [n - 1, n + 1].forEach(function (m) { if (SAYI_AD[m]) nitelikler(m).forEach(function (q) { if (q === kod[0]) L.push(q + m); }); });
  let s = benzersiz(L);
  if (izinli) { const s2 = s.filter(function (k) { return izinli.indexOf(k) >= 0; }); if (s2.length >= 3) s = s2; }
  return karistir(s).slice(0, 3);
}

function batiAralikSoru(tip, kodlar, ariza) {
  const x = rastgeleAralik(kodlar, ariza);
  const q = { oge: 'b:a:' + x.kod, tip: 'secim', aciklama: aralikAciklama(x), ipucu: 'Önce harfleri say, sonra yarım sesleri' };
  if (tip === 'sayi') {
    const n = +x.kod.slice(1);
    q.soru = { porte: aralikPorte(x) }; q.alt = 'Kaçlı aralık?';
    const sec = karistir([2, 3, 4, 5, 6, 7].filter(function (m) { return m !== n; }).sort(function (a, b) { return Math.abs(a - n) - Math.abs(b - n); }).slice(0, 4)).slice(0, 3);
    q.siklar = [n].concat(sec).map(function (m) { return { key: String(m), metin: SAYI_AD[m] }; });
    q.dogru = String(n); q.dogruMetin = SAYI_AD[n];
    q.oge = null;
    q.aciklama = '<b>' + batiAd(x.alt, true) + ' – ' + batiAd(x.ust, true) + '</b>: alt ve üst nota dahil ' + n + ' harf → ' + SAYI_AD[n].toLowerCase() + '. İşaretler sayıyı değiştirmez.';
    q.ipucu = 'Alttaki ve üstteki notayı da sayarak harfleri say';
  } else if (tip === 'ad') {
    q.soru = { porte: aralikPorte(x) }; q.alt = 'Bu aralığın adı nedir?';
    q.siklar = [x.kod].concat(aralikCeldirici(x.kod, kodlar)).map(function (k) { return { key: k, metin: kodAd(k) }; });
    q.dogru = x.kod; q.dogruMetin = kodAd(x.kod);
  } else if (tip === 'kur') {
    q.tip = 'yer';
    q.soru = { metin: batiAd(x.alt) + ayrilmaEki(batiAd(x.alt)) + ' yukarı ' + kodAd(x.kod) }; q.alt = 'Üst notayı porteye yaz';
    q.yer = { slotlar: [{ sabit: x.alt }, {}], palet: 'bati', beklenen: [x.alt, x.ust], smax: 42 };
    q.dogruMetin = batiAd(x.ust);
    q.ipucu = SAYI_AD[+x.kod.slice(1)] + ': ' + x.kod.slice(1) + ' harf yukarı · ' + kodYarim(x.kod) + ' yarım ses';
  } else if (tip === 'sayiKur') {
    const n = +x.kod.slice(1);
    q.tip = 'yer'; q.oge = null;
    q.soru = { metin: batiAd(x.alt) + ayrilmaEki(batiAd(x.alt)) + ' yukarı bir ' + SAYI_AD[n].toLowerCase() }; q.alt = 'Üst notayı porteye yerleştir (işaret gerekmez)';
    q.yer = { slotlar: [{ sabit: x.alt }, {}], palet: null, beklenen: [x.alt, { h: x.ust.h, o: x.ust.o, a: null }], sadeceAdim: true, smax: 42 };
    q.dogruMetin = HARF_AD[x.ust.h] + x.ust.o;
    q.aciklama = n + ' harf: alt nota dahil saymaya başla.';
  } else if (tip === 'cevrim') {
    const c = cevrimKod(x.kod);
    q.soru = { metin: kodAd(x.kod) }; q.alt = 'Çevrimi nedir?';
    q.siklar = [c].concat(aralikCeldirici(c)).map(function (k) { return { key: k, metin: kodAd(k) }; });
    q.dogru = c; q.dogruMetin = kodAd(c);
    q.aciklama = kodAd(x.kod) + ' çevrilince <b>' + kodAd(c) + '</b> olur: ' + x.kod.slice(1) + ' + ' + c.slice(1) + ' = 9; ' + NIT_AD[x.kod[0]].toLowerCase() + ' ↔ ' + NIT_AD[c[0]].toLowerCase() + '.';
    q.ipucu = 'Sayıların toplamı 9 olur';
  } else if (tip === 'cevrimSec' || tip === 'cevrimKur') {
    // 3.5: çevrim portede. Alt nota bir oktav yukarı taşınır: [üst nota, alt nota + oktav]
    const c = cevrimKod(x.kod), tasinan = { h: x.alt.h, o: x.alt.o + 1, a: x.alt.a || null }, ustN = { h: x.ust.h, o: x.ust.o, a: x.ust.a || null };
    q.soru = { porte: Object.assign({ kirp: true }, aralikPorte(x)) };
    q.aciklama = aralikAciklama(x) + '<br>Alt nota bir oktav yukarı taşınır. Çevrimi: <b>' + kodAd(c) + '</b>.';
    q.ipucu = 'Üstteki nota yerinde kalır; alttaki nota bir oktav yukarı çıkar';
    if (tip === 'cevrimKur') {
      q.tip = 'yer'; q.alt = 'Çevrimini yaz: üst nota yerinde, alt notayı bir oktav yukarı taşı';
      q.yer = { slotlar: [{ sabit: ustN }, {}], palet: 'bati', beklenen: [ustN, tasinan], smax: 44 };
      q.dogruMetin = kodAd(c);
    } else {
      const dis = aralikCeldirici(c).map(function (k) { return aralikKur(ustN, k); }).filter(function (n) { return n && !notaEsit(n, tasinan) && adim(n) <= 44; }).slice(0, 3);
      if (dis.length < 2) return batiAralikSoru('cevrimPorte', kodlar, ariza);
      q.alt = 'Bu aralığın çevrimi hangisi?';
      q.siklar = [tasinan].concat(dis).map(function (n, i) { return { key: i ? 'y' + i : 'd', porte: { notalar: [ustN, { h: n.h, o: n.o, a: n.a || null }], aralik: 52 } }; });
      q.dogru = 'd'; q.dogruMetin = kodAd(c);
    }
  } else if (tip === 'cevrimPorte') {
    const c = cevrimKod(x.kod);
    q.soru = { porte: aralikPorte(x) }; q.alt = 'Bu aralığın çevrimi nedir?';
    q.siklar = [c].concat(aralikCeldirici(c)).map(function (k) { return { key: k, metin: kodAd(k) }; });
    q.dogru = c; q.dogruMetin = kodAd(c);
    q.aciklama = aralikAciklama(x) + '<br>Çevrimi: <b>' + kodAd(c) + '</b>.';
    q.ipucu = 'Önce aralığı bul, sonra çevir: sayıların toplamı 9';
  }
  return q;
}
function batiAralikUretici(tipler, kodlar, ariza) {
  return function (n) {
    const L = [];
    for (let i = 0; i < n; i++) L.push(batiAralikSoru(tipler[i % tipler.length], kodlar, ariza));
    return karistir(L);
  };
}

// ---- Tonlar ----
const DIYEZ_SIRA = [{ h: 3, o: 5 }, { h: 0, o: 5 }, { h: 4, o: 5 }, { h: 1, o: 5 }, { h: 5, o: 4 }, { h: 2, o: 5 }, { h: 6, o: 4 }];
const BEMOL_SIRA = [{ h: 6, o: 4 }, { h: 2, o: 5 }, { h: 5, o: 4 }, { h: 1, o: 5 }, { h: 4, o: 4 }, { h: 0, o: 5 }, { h: 3, o: 4 }];
const MAJOR_TONIK = { '0': [0, null], '1': [4, null], '2': [1, null], '3': [5, null], '4': [2, null], '5': [6, null], '6': [3, '#'], '7': [0, '#'],
  '-1': [3, null], '-2': [6, 'b'], '-3': [2, 'b'], '-4': [5, 'b'], '-5': [1, 'b'], '-6': [4, 'b'], '-7': [0, 'b'] };
const MINOR_TONIK = { '0': [5, null], '1': [2, null], '2': [6, null], '3': [3, '#'], '4': [0, '#'], '5': [4, '#'], '6': [1, '#'], '7': [5, '#'],
  '-1': [1, null], '-2': [4, null], '-3': [0, null], '-4': [3, null], '-5': [6, 'b'], '-6': [2, 'b'], '-7': [5, 'b'] };
function donanimNotalari(s) {
  if (s > 0) return DIYEZ_SIRA.slice(0, s).map(function (n) { return { h: n.h, o: n.o, a: '#' }; });
  if (s < 0) return BEMOL_SIRA.slice(0, -s).map(function (n) { return { h: n.h, o: n.o, a: 'b' }; });
  return [];
}
function tonikNota(s, tur) { const t = (tur === 'minör' ? MINOR_TONIK : MAJOR_TONIK)[String(s)]; return { h: t[0], o: 4, a: t[1] }; }
function tonAd(s, tur) { return batiAd(tonikNota(s, tur)) + ' ' + tur; }
function arizaMetni(s) { return s === 0 ? 'arızasız' : Math.abs(s) + (s > 0 ? ' diyez' : ' bemol'); }
function donanimSirasiMetni(s) { return donanimNotalari(s).map(function (n) { return batiAd(n, true); }).join(' '); }
function tonOge(s) { return 'b:t:' + s; }
function tonAciklama(s) {
  return '<b>' + tonAd(s, 'majör') + '</b> ve ilgili minörü <b>' + tonAd(s, 'minör') + '</b>: ' + arizaMetni(s) +
    (s ? ' (' + donanimSirasiMetni(s) + ')' : '') + '.';
}
function yakinTonlar(s, aralik, sayi) {
  const L = [];
  for (let k = -7; k <= 7; k++) if (k !== s && aralik.indexOf(k) >= 0) L.push(k);
  L.sort(function (a, b) { return Math.abs(a - s) - Math.abs(b - s) + (Math.random() - 0.5); });
  return L.slice(0, sayi);
}
function araliktan(a, b) { const L = []; for (let k = a; k <= b; k++) L.push(k); return L; }

function tonSoru(tip, kumeler) {
  if (TON_GORSEL_TIPLER.indexOf(tip) >= 0) return tonGorselSoru(tip, kumeler);   // 3.4: görsel sorular (dosyanın sonunda)
  const s = rastgele(kumeler);
  const q = { oge: tonOge(s), tip: 'secim', aciklama: tonAciklama(s), ipucu: s > 0 ? 'Son diyezin yarım ses üstü majör tondur' : s < 0 ? 'Sondan bir önceki bemol majör tonun adıdır (tek bemolde: Fa)' : 'Arızasız' };
  const dpo = function (k) { return { notalar: [], donanim: donanimNotalari(k), enAz: 170, kirp: true }; };
  const tum = araliktan(-7, 7);
  if (tip === 'donanimMajor' || tip === 'donanimMinor') {
    const tur = tip === 'donanimMajor' ? 'majör' : 'minör';
    q.soru = { porte: dpo(s) }; q.alt = 'Bu donanım hangi ' + tur + ' ton?';
    const dis = yakinTonlar(s, tum, 3);
    q.siklar = [s].concat(dis).map(function (k) { return { key: String(k), metin: tonAd(k, tur) }; });
    q.dogru = String(s); q.dogruMetin = tonAd(s, tur);
    if (tur === 'minör') q.ipucu = 'Önce majör tonu bul, sonra küçük üçlü aşağı in';
  } else if (tip === 'tonDonanim' || tip === 'tonDonanimMajor' || tip === 'tonDonanimMinor') {
    // 3.4: Majör ton ünitelerinde (minör henüz anlatılmadan) yalnız majör sorulur
    const tur = tip === 'tonDonanimMajor' ? 'majör' : tip === 'tonDonanimMinor' ? 'minör' : Math.random() < 0.7 ? 'majör' : 'minör';
    q.soru = { metin: tonAd(s, tur) }; q.alt = 'Donanımı hangisi?';
    const dis = yakinTonlar(s, tum, 3);
    q.siklar = [s].concat(dis).map(function (k) { return { key: String(k), porte: dpo(k) }; });
    q.dogru = String(s); q.dogruMetin = arizaMetni(s);
    if (tur === 'minör') q.ipucu = 'İlgili majörü bul: küçük üçlü (3 yarım ses) yukarı çık. Ya da aynı adlı majörün donanımına 3 bemol ekle (3 diyez çıkar).';
  } else if (tip === 'donanimDiz') {
    if (s === 0) return tonSoru(tip, kumeler.filter(function (k) { return k !== 0; }).length ? kumeler.filter(function (k) { return k !== 0; }) : [1]);
    q.tip = 'dizi';
    q.soru = { metin: tonAd(s, 'majör') }; q.alt = 'Donanımdaki işaretleri sırasıyla seç, bitince Kontrol et’e bas';
    const dogru = donanimNotalari(s).map(function (n) { return batiAd(n, true); });
    // Havuzda 7 diyez ve 7 bemolün hepsi; kutu sayısı gösterilmez (kaç işaret ve hangi tür, sorunun parçası)
    const hepsi = DIYEZ_SIRA.map(function (n) { return batiAd({ h: n.h, a: '#' }, true); })
      .concat(BEMOL_SIRA.map(function (n) { return batiAd({ h: n.h, a: 'b' }, true); }));
    q.dizi = { havuz: karistir(hepsi).map(function (x) { return { key: x, metin: x }; }), uzunluk: dogru.length, beklenen: dogru, tekrarli: false, acik: true, enCok: 7 };
    q.dogruMetin = dogru.length + ' ' + (s > 0 ? 'diyez' : 'bemol') + ': ' + dogru.join(' ');
    q.ipucu = 'Önce kaç işaret olduğunu bul. Diyez sırası: Fa Do Sol Re La Mi Si; bemol sırası bunun tersi.';
  } else if (tip === 'ilgili') {
    if (Math.random() < 0.5) {
      q.soru = { metin: tonAd(s, 'majör') }; q.alt = 'İlgili minörü hangisi?';
      const dis = yakinTonlar(s, tum, 2);
      const ayniAd = s - 3 >= -7 ? [s - 3] : [];
      const sec = benzersiz([s].concat(ayniAd, dis)).slice(0, 4);
      q.siklar = sec.map(function (k) { return { key: String(k), metin: tonAd(k, 'minör') }; });
      q.dogru = String(s); q.dogruMetin = tonAd(s, 'minör');
    } else {
      q.soru = { metin: tonAd(s, 'minör') }; q.alt = 'İlgili majörü hangisi?';
      const dis = yakinTonlar(s, tum, 2);
      const ayniAd = s + 3 <= 7 ? [s + 3] : [];
      const sec = benzersiz([s].concat(ayniAd, dis)).slice(0, 4);
      q.siklar = sec.map(function (k) { return { key: String(k), metin: tonAd(k, 'majör') }; });
      q.dogru = String(s); q.dogruMetin = tonAd(s, 'majör');
    }
    q.ipucu = 'İlgili tonlar aynı donanımı paylaşır; minör, majörün küçük üçlü altındadır';
  } else if (tip === 'ayniAd') {
    // majör tondan aynı adlı minöre: 3 arıza bemol yönünde
    const uygun = kumeler.filter(function (k) { return k - 3 >= -7; });
    const sm = uygun.length ? rastgele(uygun) : 3;
    const hedef = sm - 3;
    q.oge = tonOge(sm);
    q.soru = { metin: tonAd(sm, 'majör') }; q.alt = 'Aynı adlı minörünün (' + batiAd(tonikNota(sm, 'majör')) + ' minör) donanımı?';
    const dis = benzersiz([sm, hedef + 1, hedef - 1, hedef + 2, -hedef].filter(function (k) { return k !== hedef && k >= -7 && k <= 7; })).slice(0, 3);
    q.siklar = [hedef].concat(dis).map(function (k) { return { key: String(k), metin: arizaMetni(k) }; });
    q.dogru = String(hedef); q.dogruMetin = arizaMetni(hedef);
    q.aciklama = tonAd(sm, 'majör') + ': ' + arizaMetni(sm) + '. Aynı adlı minör (' + tonAd(hedef, 'minör') + ') 3 arıza bemol yönündedir: <b>' + arizaMetni(hedef) + '</b>.';
    q.ipucu = 'Aynı adlı minör: 3 diyez eksik ya da 3 bemol fazla';
  } else if (tip === 'cift') {
    q.soru = { porte: dpo(s) }; q.alt = 'Bu donanım hangi iki tonun?';
    const dis = yakinTonlar(s, tum, 2);
    const sec = [{ k: s, m: s }].concat(dis.map(function (k) { return { k: k, m: k }; }));
    sec.push({ k: s, m: s - 3 >= -7 ? s - 3 : s + 1 });     // tuzak: aynı adlı karışıklığı
    q.siklar = benzersiz(sec, function (x) { return x.k + '/' + x.m; }).slice(0, 4).map(function (x) {
      return { key: x.k + '/' + x.m, metin: tonAd(x.k, 'majör') + ' / ' + tonAd(x.m, 'minör') };
    });
    q.dogru = s + '/' + s; q.dogruMetin = tonAd(s, 'majör') + ' / ' + tonAd(s, 'minör');
  } else if (tip === 'dominant' || tip === 'altdominant') {
    const yon = tip === 'dominant' ? 1 : -1;
    const uygun = kumeler.filter(function (k) { return k + yon >= -7 && k + yon <= 7; });
    const k0 = rastgele(uygun);
    const hedef = k0 + yon;
    q.oge = tonOge(k0);
    q.soru = { metin: tonAd(k0, 'majör') }; q.alt = (tip === 'dominant' ? 'Dominant' : 'Alt dominant') + ' tonu hangisi?';
    const dis = benzersiz([k0 - yon, hedef + yon, k0 + 3 * yon, k0].filter(function (k) { return k !== hedef && k >= -7 && k <= 7; })).slice(0, 3);
    q.siklar = [hedef].concat(dis).map(function (k) { return { key: String(k), metin: tonAd(k, 'majör') }; });
    q.dogru = String(hedef); q.dogruMetin = tonAd(hedef, 'majör');
    q.aciklama = 'Beşliler çemberinde ' + (tip === 'dominant' ? 'saat yönünde (tam beşli yukarı, bir diyez fazla / bir bemol eksik)' : 'saat yönünün tersine (tam beşli aşağı, bir bemol fazla / bir diyez eksik)') +
      ' komşu: <b>' + tonAd(hedef, 'majör') + '</b>.';
    q.ipucu = tip === 'dominant' ? 'Tam beşli yukarı' : 'Tam beşli aşağı (tam dörtlü yukarı)';
  }
  return q;
}
function tonUretici(tipler, kumeler) {
  return function (n) { const L = []; for (let i = 0; i < n; i++) L.push(tonSoru(tipler[i % tipler.length], kumeler)); return karistir(L); };
}

// ---- Minör türleri ----
const MINOR_DESEN = {
  dogal: [0, 2, 3, 5, 7, 8, 10, 12],
  armonik: [0, 2, 3, 5, 7, 8, 11, 12],
  melodik: [0, 2, 3, 5, 7, 9, 11, 12]
};
const MINOR_TUR_AD = { dogal: 'Doğal minör', armonik: 'Armonik minör', melodik: 'Melodik minör (çıkıcı)' };
function minorDizi(s, tur) {
  const t = tonikNota(s, 'minör');
  const y0 = yarimOf(t);
  return MINOR_DESEN[tur].map(function (d, i) {
    const h_ = (t.h + i) % 7, o = t.o + Math.floor((t.h + i) / 7);
    const n = batiNotaYaz(h_, o, y0 + d);
    return { h: n.h, o: n.o, a: n.a };
  });
}
function minorSoru(tip, kumeler) {
  const s = rastgele(kumeler);
  const tur = rastgele(['dogal', 'armonik', 'melodik']);
  const ton = tonAd(s, 'minör');
  const q = { oge: tonOge(s), tip: 'secim' };
  const dogalD = minorDizi(s, 'dogal');
  const degisen = function (t) {
    const d = minorDizi(s, t);
    return d.map(function (n, i) { return (n.a || null) !== (dogalD[i].a || null) ? i : -1; }).filter(function (i) { return i >= 0; })
      .map(function (i) { const n = d[i]; return n.a ? batiAd(n, true) : HARF_AD[n.h] + '♮'; });
  };
  if (tip === 'degisenDokun' || tip === 'turKur') {
    // 3.5: yükseltilen seslere portede dokun / diziyi işaretleriyle kur
    const t = Math.random() < 0.5 ? 'armonik' : 'melodik', hedefDizi = minorDizi(s, t);
    const a1 = degisen('armonik').join(' ve '), a2 = degisen('melodik').join(' ve ');
    q.aciklama = '<b>' + ton + '</b>: armonikte 7. derece (' + a1 + '), melodikte (çıkarken) 6. ve 7. dereceler (' + a2 + ') yarım ses yükselir.';
    q.ipucu = t === 'armonik' ? 'Sadece 7. derece' : '6. ve 7. dereceler';
    const yazilir = hedefDizi.every(function (n) { return !n.a || n.a === '#' || n.a === 'b'; });
    if (tip === 'turKur' && yazilir) {
      q.tip = 'yer';
      q.soru = { metin: ton + ' · ' + MINOR_TUR_AD[t], kucuk: true }; q.alt = 'Her notanın işaretini seç (işaret almıyorsa ∅)';
      q.yer = { slotlar: hedefDizi.map(function (n, i) { return i === 0 ? { sabit: n } : { konum: { h: n.h, o: n.o } }; }), palet: 'bati', beklenen: hedefDizi };
      q.dogruMetin = hedefDizi.map(function (n) { return batiAd(n, true); }).join(' ');
    } else {
      q.soru = { metin: ton }; q.alt = 'Doğal minör dizi yazılı. ' + (t === 'armonik' ? 'Armonik' : 'Melodik') + ' minörde (çıkarken) yükselen seslere dokun';
      q.dogruMetin = degisen(t).join(' ve ');
      porteDokunSoru(q, { notalar: dogalD.map(function (n) { return { h: n.h, o: n.o, a: n.a || null }; }), aralik: 34, enAz: 330, hedef: t === 'armonik' ? [6] : [5, 6], coklu: true });
    }
  } else if (tip === 'tur') {
    q.soru = { porte: { notalar: minorDizi(s, tur), aralik: 33, enAz: 320 } }; q.alt = ton + ': hangi minör türü?';
    q.siklar = ['dogal', 'armonik', 'melodik'].map(function (t) { return { key: t, metin: MINOR_TUR_AD[t] }; });
    q.dogru = tur; q.dogruMetin = MINOR_TUR_AD[tur];
    q.aciklama = '<b>' + ton + '</b> · doğal minörde değişiklik yok; armonikte 7. derece yükselir (' + degisen('armonik').join(', ') + '); melodikte (çıkarken) 6. ve 7. dereceler yükselir (' + degisen('melodik').join(', ') + ').';
    q.ipucu = 'Doğal minör, ilgili majörün donanımıyla aynı sesleri kullanır. 7. derece yükseltilmiş mi?';
  } else {
    const t = Math.random() < 0.55 ? 'armonik' : 'melodik';
    q.soru = { metin: ton }; q.alt = (t === 'armonik' ? 'Armonik minörde' : 'Melodik minörde (çıkarken)') + ' yükseltilen ses(ler)?';
    const dogru = degisen(t).join(' ve ');
    const a1 = degisen('armonik').join(' ve '), a2 = degisen('melodik').join(' ve ');
    const yanlislar = [t === 'armonik' ? a2 : a1];
    // diğer derecelerden yanlış seçenekler
    [1, 2, 3, 4].forEach(function (i) {
      const n = dogalD[i];
      const y = batiNotaYaz(n.h, n.o, yarimOf(n) + 1);
      if (Math.abs(y.d) <= 1) yanlislar.push(y.a ? batiAd(y, true) : HARF_AD[y.h] + '♮');
    });
    const dis = karistir(benzersiz(yanlislar).filter(function (x) { return x !== dogru; })).slice(0, 3);
    q.siklar = [dogru].concat(dis).map(function (x) { return { key: x, metin: x }; });
    q.dogru = dogru; q.dogruMetin = dogru;
    q.aciklama = '<b>' + ton + '</b>: armonikte 7. derece (' + a1 + '), melodikte (çıkarken) 6. ve 7. dereceler (' + a2 + ') yarım ses yükselir.';
    q.ipucu = t === 'armonik' ? 'Sadece 7. derece' : '6. ve 7. dereceler';
  }
  return q;
}
function minorUretici(tipler, kumeler) {
  return function (n) { const L = []; for (let i = 0; i < n; i++) L.push(minorSoru(tipler[i % tipler.length], kumeler)); return karistir(L); };
}

// ---- Beşliler çemberi çizimi ----
function cemberSVG() {
  const svg = svgEl('svg', { class: 'cember', viewBox: '0 0 300 300', preserveAspectRatio: 'xMidYMid meet' });
  svg.appendChild(svgEl('circle', { cx: 150, cy: 150, r: 128, fill: 'none', stroke: 'currentColor', opacity: .25, 'stroke-width': 2 }));
  svg.appendChild(svgEl('circle', { cx: 150, cy: 150, r: 84, fill: 'none', stroke: 'currentColor', opacity: .15, 'stroke-width': 2 }));
  const sira = [0, 1, 2, 3, 4, 5, 6, -5, -4, -3, -2, -1];
  sira.forEach(function (s, i) {
    const aci = (i * 30 - 90) * Math.PI / 180;
    const x = 150 + 128 * Math.cos(aci), y = 150 + 128 * Math.sin(aci);
    svg.appendChild(svgEl('circle', { cx: x, cy: y, r: 19, class: s === 0 ? 'cetvelVurgu' : 'cemberNokta' }));
    const t = svgEl('text', { x: x, y: y + 4, 'font-size': 11, 'text-anchor': 'middle', fill: 'currentColor', 'font-weight': 800 });
    t.textContent = s === 6 ? 'Fa♯/Sol♭' : batiAd(tonikNota(s, 'majör'), true);
    if (s === 6) t.setAttribute('font-size', 8);
    svg.appendChild(t);
    const x2 = 150 + 84 * Math.cos(aci), y2 = 150 + 84 * Math.sin(aci);
    const t2 = svgEl('text', { x: x2, y: y2 + 4, 'font-size': 10, 'text-anchor': 'middle', fill: 'currentColor', opacity: .8 });
    t2.textContent = (s === 6 ? 'Re♯' : batiAd(tonikNota(s, 'minör'), true)).toLowerCase();
    svg.appendChild(t2);
    const t3 = svgEl('text', { x: 150 + 104 * Math.cos(aci), y: 150 + 104 * Math.sin(aci) + 3, 'font-size': 8, 'text-anchor': 'middle', fill: 'currentColor', opacity: .55 });
    t3.textContent = s === 0 ? '' : s === 6 ? '6♯/6♭' : Math.abs(s) + (s > 0 ? '♯' : '♭');
    svg.appendChild(t3);
  });
  const m = svgEl('text', { x: 150, y: 154, 'font-size': 11, 'text-anchor': 'middle', fill: 'currentColor', opacity: .7 });
  m.textContent = 'dış: majör · iç: minör';
  svg.appendChild(m);
  return svg;
}

// ---- Üniteler ----
const K_TAM_DOGAL = ['T4', 'A4', 'T5', 'E5'];
const K_KB = ['K2', 'B2', 'K3', 'B3', 'K6', 'B6', 'K7', 'B7'];
const K_TAM = ['E4', 'T4', 'A4', 'E5', 'T5', 'A5'];
const POZ = araliktan(0, 7), NEG = araliktan(-7, 0);

function bUnite(id, no, ad, kisa, seviyeler) {
  return { id: id, dal: 'bati', no: no, ad: ad, kisa: kisa, ogeler: [], seviyeler: seviyeler };
}
const BATI_UNITELER = [
  bUnite('b1', 1, 'Aralık sayısı', 'İkiliden yediliye harf sayma', [
    { id: 'b1-1', tip: 'seviye', ad: 'Harfleri say', soruSay: 8, uret: batiAralikUretici(['sayi'], TUM_KODLAR.filter(function (k) { return k[0] !== 'E' && k[0] !== 'A'; }), 0) },
    { id: 'b1-2', tip: 'seviye', ad: 'İşaretler sayıyı değiştirmez', soruSay: 8, uret: batiAralikUretici(['sayi'], TUM_KODLAR, 0.5) },
    { id: 'b1-yer', tip: 'yer', ad: 'Aralığı porteye yerleştir', soruSay: 8, uret: batiAralikUretici(['sayiKur'], TUM_KODLAR, 0.2) },
    { id: 'b1-boss', tip: 'boss', ad: 'Aralık sayısı finali', soruSay: 10, uret: batiAralikUretici(['sayi', 'sayi', 'sayiKur'], TUM_KODLAR, 0.4) }
  ]),
  bUnite('b2', 2, 'Tam aralıklar', 'Tam dörtlü ve tam beşli', [
    { id: 'b2-1', tip: 'seviye', ad: 'Doğal notalarda dörtlü ve beşli', soruSay: 8, uret: batiAralikUretici(['ad'], K_TAM_DOGAL, 0) },
    { id: 'b2-2', tip: 'seviye', ad: 'İşaretli notalardan', soruSay: 8, uret: batiAralikUretici(['ad'], K_TAM, 0.5) },
    { id: 'b2-yer', tip: 'yer', ad: 'Tam dörtlü ve beşli kur', soruSay: 8, uret: batiAralikUretici(['kur'], ['T4', 'T5'], 0.3) },
    { id: 'b2-boss', tip: 'boss', ad: 'Tam aralıklar finali', soruSay: 10, uret: batiAralikUretici(['ad', 'ad', 'kur'], K_TAM, 0.4) }
  ]),
  bUnite('b3', 3, 'Büyük ve küçük aralıklar', 'İkili, üçlü, altılı, yedili', [
    { id: 'b3-1', tip: 'seviye', ad: 'İkili ve üçlüler', soruSay: 8, uret: batiAralikUretici(['ad'], ['K2', 'B2', 'K3', 'B3'], 0) },
    { id: 'b3-2', tip: 'seviye', ad: 'Altılı ve yedililer', soruSay: 8, uret: batiAralikUretici(['ad'], ['K6', 'B6', 'K7', 'B7'], 0) },
    { id: 'b3-3', tip: 'seviye', ad: 'İşaretli notalardan', soruSay: 10, uret: batiAralikUretici(['ad'], K_KB, 0.5) },
    { id: 'b3-yer', tip: 'yer', ad: 'Büyük ve küçük aralık kur', soruSay: 8, uret: batiAralikUretici(['kur'], K_KB, 0.3) },
    { id: 'b3-boss', tip: 'boss', ad: 'Büyük-küçük finali', soruSay: 12, uret: batiAralikUretici(['ad', 'ad', 'kur'], K_KB.concat(['T4', 'T5']), 0.4) }
  ]),
  bUnite('b4', 4, 'Artık ve eksik aralıklar', 'Aynı ses, farklı ad', [
    { id: 'b4-1', tip: 'seviye', ad: 'Artık ve eksikleri tanı', soruSay: 10, uret: batiAralikUretici(['ad'], TUM_KODLAR, 0.5) },
    { id: 'b4-2', tip: 'seviye', ad: 'Hepsi karışık', soruSay: 10, uret: batiAralikUretici(['ad'], TUM_KODLAR, 0.7) },
    { id: 'b4-yer', tip: 'yer', ad: 'Her türlü aralığı kur', soruSay: 8, uret: batiAralikUretici(['kur'], TUM_KODLAR, 0.4) },
    { id: 'b4-boss', tip: 'boss', ad: 'Aralık finali', soruSay: 12, uret: batiAralikUretici(['ad', 'ad', 'kur'], TUM_KODLAR, 0.6) }
  ]),
  bUnite('b5', 5, 'Aralık çevrimi', 'Büyük ↔ küçük, artık ↔ eksik', [
    { id: 'b5-1', tip: 'seviye', ad: 'Adından çevrim', soruSay: 8, uret: batiAralikUretici(['cevrim', 'cevrimSec'], TUM_KODLAR, 0) },
    { id: 'b5-2', tip: 'seviye', ad: 'Porteden çevrim', soruSay: 8, uret: batiAralikUretici(['cevrimPorte', 'cevrimSec', 'cevrimKur'], TUM_KODLAR, 0.4) },
    { id: 'b5-boss', tip: 'boss', ad: 'Çevrim finali', soruSay: 10, uret: batiAralikUretici(['cevrim', 'cevrimSec', 'cevrimPorte', 'cevrimKur'], TUM_KODLAR, 0.5) }
  ]),
  bUnite('b6', 6, 'Majör tonlar: diyezliler', 'Sol majörden Do diyez majöre', [
    { id: 'b6-1', tip: 'seviye', ad: '3 diyeze kadar', soruSay: 8, uret: tonUretici(['donanimMajor', 'klavyeMajor', 'tonDonanimMajor', 'diziTon'], araliktan(0, 3)) },
    { id: 'b6-2', tip: 'seviye', ad: '7 diyeze kadar', soruSay: 10, uret: tonUretici(['donanimMajor', 'klavyeMajor', 'tonDonanimMajor', 'donanimDogru', 'diziTon'], POZ) },
    { id: 'b6-yer', tip: 'yer', ad: 'Donanımı porteye yaz', soruSay: 8, uret: tonUretici(['donanimYaz', 'donanimYaz', 'diziKur', 'donanimYaz'], araliktan(1, 7)) },
    { id: 'b6-boss', tip: 'boss', ad: 'Diyezli tonlar finali', soruSay: 12, uret: tonUretici(['donanimMajor', 'donanimYaz', 'klavyeMajor', 'tonDonanimMajor', 'donanimDogru', 'diziTon'], POZ) }
  ]),
  bUnite('b7', 7, 'Majör tonlar: bemollüler', 'Fa majörden Do bemol majöre', [
    { id: 'b7-1', tip: 'seviye', ad: '3 bemole kadar', soruSay: 8, uret: tonUretici(['donanimMajor', 'klavyeMajor', 'tonDonanimMajor', 'diziTon'], araliktan(-3, 0)) },
    { id: 'b7-2', tip: 'seviye', ad: '7 bemole kadar', soruSay: 10, uret: tonUretici(['donanimMajor', 'klavyeMajor', 'tonDonanimMajor', 'donanimDogru', 'diziTon'], NEG) },
    { id: 'b7-yer', tip: 'yer', ad: 'Donanımı porteye yaz', soruSay: 8, uret: tonUretici(['donanimYaz', 'donanimYaz', 'diziKur', 'donanimYaz'], araliktan(-7, -1)) },
    { id: 'b7-boss', tip: 'boss', ad: 'Bütün majör tonlar', soruSay: 12, uret: tonUretici(['donanimMajor', 'donanimYaz', 'klavyeMajor', 'tonDonanimMajor', 'donanimDogru', 'diziTon'], araliktan(-7, 7)) }
  ]),
  bUnite('b8', 8, 'Minör tonlar', 'İlgili ve aynı adlı tonlar', [
    { id: 'b8-1', tip: 'seviye', ad: 'Donanımdan minör ton', soruSay: 8, uret: tonUretici(['donanimMinor', 'klavyeMinor', 'tonDonanimMinor', 'klavyeMinor'], araliktan(-4, 4)) },
    { id: 'b8-2', tip: 'seviye', ad: 'İlgili tonlar', soruSay: 10, uret: tonUretici(['ilgiliKlavye', 'ilgiliPorte', 'cift', 'ilgiliKlavye', 'ilgili'], araliktan(-7, 7)) },
    { id: 'b8-3', tip: 'seviye', ad: 'Aynı adlı tonlar', soruSay: 8, uret: tonUretici(['ayniAdPorte', 'diziTonMinor', 'ayniAdPorte', 'donanimMinor'], araliktan(-4, 7)) },
    { id: 'b8-boss', tip: 'boss', ad: 'Minör tonlar finali', soruSay: 12, uret: tonUretici(['ilgiliKlavye', 'ayniAdPorte', 'donanimMinor', 'ilgiliPorte', 'klavyeMinor', 'cift', 'tonDonanim', 'diziTonMinor'], araliktan(-7, 7)) }
  ]),
  bUnite('b9', 9, 'Minör türleri', 'Doğal, armonik, melodik', [
    { id: 'b9-1', tip: 'seviye', ad: 'Diziden türü bul', soruSay: 8, uret: minorUretici(['tur', 'degisenDokun', 'tur', 'turKur'], araliktan(-3, 3)) },
    { id: 'b9-2', tip: 'seviye', ad: 'Yükseltilen sesler', soruSay: 8, uret: minorUretici(['degisenDokun', 'degisen', 'turKur', 'degisenDokun'], araliktan(-5, 4)) },
    { id: 'b9-boss', tip: 'boss', ad: 'Minör türleri finali', soruSay: 10, uret: minorUretici(['tur', 'degisenDokun', 'turKur', 'degisen', 'degisenDokun'], araliktan(-7, 4)) }
  ]),
  bUnite('b10', 10, 'Beşliler çemberi ve büyük final', 'Dominant, alt dominant, her şey', [
    { id: 'b10-1', tip: 'seviye', ad: 'Dominant ve alt dominant', soruSay: 10, uret: tonUretici(['cemberDominant', 'dominant', 'cemberAlt', 'altdominant', 'cemberDominant', 'cemberAlt'], araliktan(-7, 7)) },
    { id: 'b10-boss', tip: 'boss', ad: 'Batı Teorisi büyük finali', soruSay: 14, uret: function (n) {
        const parca = [
          batiAralikUretici(['ad', 'kur', 'cevrim'], TUM_KODLAR, 0.5)(Math.ceil(n * 0.45)),
          tonUretici(['donanimMajor', 'donanimMinor', 'ilgili', 'ayniAd', 'dominant'], araliktan(-7, 7))(Math.ceil(n * 0.4)),
          minorUretici(['tur', 'degisen'], araliktan(-7, 4))(Math.ceil(n * 0.15))
        ];
        return karistir([].concat.apply([], parca)).slice(0, n);
      } }
  ])
];

// ---- Dersler ----
BATI_UNITELER[0].ders = function () {
  return [
    { baslik: 'Aralık nedir?', metin: '<p>İki nota arasındaki uzaklığa <b>aralık</b> denir. Aralığın bir <b>sayısı</b> (ikili, üçlü…) bir de <b>niteliği</b> (büyük, küçük, tam, artık, eksik) vardır.</p>' },
    { baslik: 'Sayı: harfleri say', cizim: function () { return h('div', { class: 'kartPorte' }, porteSVG({ notalar: [{ h: 0, o: 4 }, { h: 4, o: 4 }], aralik: 60 })); },
      metin: '<p>Alt ve üst nota <b>dahil</b> harfleri say: Do-Re-Mi-Fa-Sol = 5 harf → <b>beşli</b>.</p><p>İşaretler sayıyı değiştirmez: Do–Sol♯ de, Do♯–Sol de beşlidir.</p>' }
  ];
};
BATI_UNITELER[1].ders = function () {
  return [
    { baslik: 'Tam aralıklar', metin: '<p>Dörtlü ve beşliler <b>tam</b>, <b>artık</b> ya da <b>eksik</b> olur.</p><p><b>Tam dörtlü</b> = 5 yarım ses (Do–Fa)<br><b>Tam beşli</b> = 7 yarım ses (Do–Sol)</p>' },
    { baslik: 'Doğal notalarda tek istisna', cizim: function () { return h('div', { class: 'kartPorte' }, porteSVG({ notalar: [{ h: 3, o: 4 }, { h: 6, o: 4 }, { h: 6, o: 4 }, { h: 3, o: 5 }], aralik: 44, ayrac: [1] })); },
      metin: '<p>İşaretsiz notalarda bütün dörtlüler ve beşliler tamdır; tek istisna <b>Fa–Si</b> ve <b>Si–Fa</b>:</p><p>Fa–Si = 6 yarım ses → <b>artık dörtlü</b><br>Si–Fa = 6 yarım ses → <b>eksik beşli</b></p>' }
  ];
};
BATI_UNITELER[2].ders = function () {
  return [
    { baslik: 'Büyük ve küçük', metin: '<p>İkili, üçlü, altılı ve yediliyi <b>büyük</b> ya da <b>küçük</b> olarak adlandırırız:</p>' +
      '<p>Küçük ikili 1 · Büyük ikili 2<br>Küçük üçlü 3 · Büyük üçlü 4<br>Küçük altılı 8 · Büyük altılı 9<br>Küçük yedili 10 · Büyük yedili 11<br><span class="soluk">(yarım ses sayıları)</span></p>' },
    { baslik: 'Majör dizi ile kıyasla', metin: '<p>Pratik yol: alt notayı bir majör dizinin başı say. Üst nota o dizide varsa aralık <b>büyük</b> (ya da tam); yarım ses daha darsa <b>küçük</b>.</p>' }
  ];
};
BATI_UNITELER[3].ders = function () {
  return [
    { baslik: 'Artık ve eksik', metin: '<p>Bir aralık büyük ya da tamdan yarım ses <b>genişse artık</b> olur.</p><p>Küçükten yarım ses daha <b>darsa eksik</b>; tam aralıklarda ise tamdan yarım ses darsa eksik.</p><p>Bu oyunda çift artık ve çift eksik yok.</p>' },
    { baslik: 'Aynı ses, farklı ad', cizim: function () { return h('div', { class: 'kartPorte' }, porteSVG({ notalar: [{ h: 0, o: 4 }, { h: 3, o: 4, a: '#' }, { h: 0, o: 4 }, { h: 4, o: 4, a: 'b' }], aralik: 44, ayrac: [1] })); },
      metin: '<p>Do–Fa♯ ve Do–Sol♭ aynı sesi verir (6 yarım ses), ama adları farklıdır: Fa dördüncü harf → <b>artık dörtlü</b>; Sol beşinci harf → <b>eksik beşli</b>.</p><p>Aralığın adını her zaman önce <b>harf sayısı</b> belirler.</p>' }
  ];
};
BATI_UNITELER[4].ders = function () {
  return [{ baslik: 'Çevrim', metin: '<p>Alt notayı bir oktav yukarı taşıyınca aralık <b>çevrilir</b>.</p><p>Sayılar toplamı <b>9</b> eder: üçlü ↔ altılı, ikili ↔ yedili, dörtlü ↔ beşli.</p><p>Nitelik: büyük ↔ küçük, artık ↔ eksik, tam ↔ tam.</p>' }];
};
BATI_UNITELER[5].ders = function () {
  return [
    { baslik: 'Diyezlerin sırası', cizim: function () { return h('div', { class: 'kartPorte' }, porteSVG({ notalar: [], donanim: donanimNotalari(7), enAz: 190 })); },
      metin: '<p>Diyezler donanıma hep aynı sırayla yazılır: <b>Fa Do Sol Re La Mi Si</b>.</p><p>Majör tonu bulmak için: <b>son diyezin yarım ses üstü</b>. Örnek: Fa♯ Do♯ Sol♯ → son diyez Sol♯ → <b>La majör</b>.</p>' },
    { baslik: 'Klavyede gör', cizim: function () { return klavye({ sabit: true, verilen: [{ y: 8, etiket: 'Sol♯' }, { y: 9, etiket: 'La', sinif: 'dogru' }] }).el; },
      metin: '<p>Son diyez <b>Sol♯</b> (sarı). Hemen sağındaki tuş, yani yarım ses üstü <b>La</b> (yeşil): ton <b>La majör</b>.</p><p>Yarım ses, klavyede arada başka tuş kalmayan en yakın tuştur.</p>' }
  ];
};
BATI_UNITELER[6].ders = function () {
  return [
    { baslik: 'Bemollerin sırası', cizim: function () { return h('div', { class: 'kartPorte' }, porteSVG({ notalar: [], donanim: donanimNotalari(-7), enAz: 190 })); },
      metin: '<p>Bemoller ters sırayla yazılır: <b>Si Mi La Re Sol Do Fa</b>.</p><p>Majör tonu bulmak için: <b>sondan bir önceki bemol</b>. Örnek: Si♭ Mi♭ La♭ → <b>Mi♭ majör</b>. Tek bemol: <b>Fa majör</b>.</p>' }
  ];
};
BATI_UNITELER[7].ders = function () {
  return [
    { baslik: 'İlgili minör', metin: '<p>Her majör tonun aynı donanımı paylaşan bir <b>ilgili minörü</b> vardır; tonik, majörün <b>küçük üçlü altında</b>dır.</p><p>Do majör ↔ La minör · Sol majör ↔ Mi minör · Fa majör ↔ Re minör</p>' },
    { baslik: 'Klavyede küçük üçlü', cizim: function () { return klavye({ sabit: true, verilen: [{ y: 12, etiket: 'Do' }, { y: 9, etiket: 'La', sinif: 'dogru' }] }).el; },
      metin: '<p><b>Do</b>’dan (sarı) sola doğru 3 yarım ses say, siyah tuşlar dahil: Si, Si♭, <b>La</b> (yeşil). Do majörün ilgili minörü <b>La minör</b>.</p><p>Minörden majöre dönerken aynı yolu sağa doğru gidersin.</p>' },
    { baslik: 'Aynı adlı minör', metin: '<p>Aynı toniği paylaşan minör: Do majör → <b>Do minör</b>.</p><p>Donanımı <b>3 arıza bemol yönündedir</b>: Do majör arızasız → Do minör 3 bemol; Re majör 2 diyez → Re minör 1 bemol.</p>' }
  ];
};
BATI_UNITELER[8].ders = function () {
  return [
    { baslik: 'Üç tür minör', cizim: function () {
        return h('div', null,
          h('div', { class: 'kartPorte' }, porteSVG({ notalar: minorDizi(0, 'dogal'), aralik: 33, enAz: 320 })),
          h('div', { class: 'kartPorte' }, porteSVG({ notalar: minorDizi(0, 'armonik'), aralik: 33, enAz: 320 })),
          h('div', { class: 'kartPorte' }, porteSVG({ notalar: minorDizi(0, 'melodik'), aralik: 33, enAz: 320 })));
      }, metin: '<p><b>Doğal</b>: donanımdaki sesler (La Si Do Re Mi Fa Sol).<br><b>Armonik</b>: 7. derece yarım ses yükselir (Sol♯).<br><b>Melodik</b>: çıkarken 6. ve 7. dereceler yükselir (Fa♯, Sol♯); inerken doğal minör.</p>' }
  ];
};
BATI_UNITELER[9].ders = function () {
  return [
    { baslik: 'Beşliler çemberi', cizim: cemberSVG, metin: '<p>Saat yönünde her adım bir <b>tam beşli yukarı</b>: bir diyez eklenir (ya da bir bemol azalır). Bir tonun sağındaki komşusu <b>dominant</b>, solundaki <b>alt dominant</b> tonudur.</p>' }
  ];
};

// Tekrar (Leitner)
function batiOgeSorusu(id) {
  const p = id.split(':');
  if (p[1] === 'a') {
    const kod = p[2];
    const tip = rastgele(['ad', 'ad', 'kur', 'cevrim']);
    return batiAralikSoru(tip, [kod], 0.4);
  }
  const s = +p[2];
  return tonSoru(rastgele(['donanimMajor', 'donanimMinor', 'tonDonanim', 'ilgili', 'klavyeMajor', 'ilgiliPorte', 'diziTon']), [s]);   // 3.4: görsel sorular da
}

// =====================================================
// 3.4.0 · GÖRSEL TON SORULARI (Majör tonlar: diyezliler / bemollüler, Minör tonlar)
// Yazılı şıklar yerine: klavyeye dokunma, donanımı porteye yazma, porteli şıklar, diziyi kurma.
// Etkileşimli olanlar motorun 'ozel' soru tipini kullanır: q.ozel = { karar, ciz(alan, veri, q, kontrol) }
// =====================================================
const MAJOR_DESEN = [0, 2, 4, 5, 7, 9, 11, 12];
function majorDizi(s) {
  const t = tonikNota(s, 'majör');
  const y0 = yarimOf(t);
  return MAJOR_DESEN.map(function (d, i) {
    const h_ = (t.h + i) % 7, o = t.o + Math.floor((t.h + i) / 7);
    const n = batiNotaYaz(h_, o, y0 + d);
    return { h: n.h, o: n.o, a: n.a };
  });
}
function tonPc(n) { return ((yarimOf(n) % 12) + 12) % 12; }

// ---- Klavye ----
// cfg: { bas, son: yarım ses (0 = Do4), verilen: [{ y, etiket, sinif }], sabit: true (yalnız çizim), degisince }
function klavye(cfg) {
  cfg = cfg || {};
  const bas = cfg.bas == null ? 0 : cfg.bas, son = cfg.son == null ? 16 : cfg.son;
  const BEYAZ_PC = [0, 2, 4, 5, 7, 9, 11];
  const beyazMi = function (y) { return BEYAZ_PC.indexOf(((y % 12) + 12) % 12) >= 0; };
  const beyazlar = [], siyahlar = [];
  for (let y = bas; y <= son; y++) (beyazMi(y) ? beyazlar : siyahlar).push(y);
  const BW = 30, BH = 92, SW = 19, SH = 58, UST = 30;
  const W = beyazlar.length * BW + 4, H = UST + BH + 3;
  const xB = {};
  beyazlar.forEach(function (y, i) { xB[y] = 2 + i * BW; });
  const xS = function (y) { return xB[y - 1] + BW - SW / 2; };
  const orta = function (y) { return beyazMi(y) ? xB[y] + BW / 2 : xS(y) + SW / 2; };
  const verilen = {};
  (cfg.verilen || []).forEach(function (v) { verilen[v.y] = v; });
  let secili = null, kilitli = !!cfg.sabit;
  let isaret = {}, etiket = {};

  const kap = h('div', { class: 'klavyeKap' + (cfg.sabit ? ' sabit' : '') });
  const svg = svgEl('svg', { class: 'klavye', viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'xMidYMid meet', role: 'img', 'aria-label': 'Piyano klavyesi' });
  kap.appendChild(svg);
  const bilgi = cfg.sabit ? null : h('div', { class: 'yerBilgi' });
  if (bilgi) kap.appendChild(bilgi);

  function sinif(y) {
    return 'tus ' + (beyazMi(y) ? 'beyaz' : 'siyah') + (isaret[y] ? ' ' + isaret[y] : verilen[y] ? ' ' + (verilen[y].sinif || 'verilen') : secili === y ? ' secili' : '');
  }
  function yaz(y, metin) {
    const t = svgEl('text', { x: Math.max(20, Math.min(W - 20, orta(y))), y: beyazMi(y) ? 26 : 12, 'text-anchor': 'middle', class: 'tusEtiket' });
    t.textContent = metin;
    svg.appendChild(t);
  }
  function ciz() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    beyazlar.forEach(function (y) {
      svg.appendChild(svgEl('rect', { x: xB[y], y: UST, width: BW, height: BH, rx: 4, class: sinif(y) }));
      if (((y % 12) + 12) % 12 === 0) {
        const t = svgEl('text', { x: xB[y] + BW / 2, y: UST + BH - 8, 'text-anchor': 'middle', class: 'tusDo' });
        t.textContent = 'Do';
        svg.appendChild(t);
      }
    });
    siyahlar.forEach(function (y) { svg.appendChild(svgEl('rect', { x: xS(y), y: UST, width: SW, height: SH, rx: 3, class: sinif(y) })); });
    for (const y in verilen) if (verilen[y].etiket) yaz(+y, verilen[y].etiket);
    for (const y in etiket) if (!verilen[y]) yaz(+y, etiket[y]);
    if (bilgi) bilgi.textContent = kilitli ? '' : secili === null ? 'Klavyede bir tuşa dokun' : 'Tuş seçildi · başka tuşa dokunarak değiştirebilirsin';
    if (cfg.degisince) cfg.degisince();
  }
  function tustan(e) {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const m = svg.getScreenCTM();
    if (!m) return null;
    const p = pt.matrixTransform(m.inverse());
    if (p.y < UST - 4 || p.y > UST + BH + 3) return null;
    if (p.y <= UST + SH) {
      for (let i = 0; i < siyahlar.length; i++) { const x = xS(siyahlar[i]); if (p.x >= x - 2 && p.x <= x + SW + 2) return siyahlar[i]; }
    }
    const i = Math.floor((p.x - 2) / BW);
    return i >= 0 && i < beyazlar.length ? beyazlar[i] : null;
  }
  if (!cfg.sabit) {
    svg.addEventListener('pointerdown', function (e) {
      if (kilitli) return;
      const y = tustan(e);
      if (y === null || verilen[y]) return;
      secili = y;
      ciz();
      e.preventDefault();
    });
  }
  ciz();
  return {
    el: kap,
    deger: function () { return secili; },
    sec: function (y) { if (!kilitli && !verilen[y]) { secili = y; ciz(); } },   // denetim ve klavye erişimi için
    tuslar: function () { return beyazlar.concat(siyahlar); },
    kilitle: function (isaretler, etiketler) { kilitli = true; isaret = isaretler || {}; etiket = etiketler || {}; ciz(); }
  };
}

// Klavyeye dokunma sorusu. veri.klavye: { verilen, hedefPc, hedefY, hedefEtiket }
function klavyeSoruCiz(alan, veri, q, kontrol) {
  const k = veri.klavye;
  let kl = null;
  kl = klavye({ bas: k.bas, son: k.son, verilen: k.verilen, degisince: function () { kontrol.disabled = !kl || kl.deger() === null; } });
  q.klavye = kl;
  alan.appendChild(kl.el);
  kontrol.hidden = false;
  kontrol.disabled = true;
  kontrol.textContent = 'Kontrol et';
  kontrol.onclick = function () {
    if (q.cevaplandi || kl.deger() === null) return;
    const y = kl.deger();
    const dogru = k.tam ? y === k.hedefY : ((y % 12) + 12) % 12 === k.hedefPc;   // tam: oktav da tutmalı (ahenk)
    const isaretler = {}, etiketler = {};
    if (dogru) { isaretler[y] = 'dogru'; etiketler[y] = k.hedefEtiket; }
    else { isaretler[y] = 'yanlis'; isaretler[k.hedefY] = 'dogru'; etiketler[k.hedefY] = k.hedefEtiket; }
    kl.kilitle(isaretler, etiketler);
    kontrol.hidden = true;
    cevapla(dogru);
  };
}

// Donanımı porteye yazma sorusu. veri.donanim: { beklenen: [nota] }
// Harfler ve sıra doğruysa doğru sayılır; oktav alışılmış yerde değilse doğru yazım ayrıca gösterilir.
function donanimYazCiz(alan, veri, q, kontrol) {
  const B = veri.donanim.beklenen;
  const W = 250, X0 = 58, DX = 18, SMIN = 29, SMAX = 40, EN_COK = 7;
  let tur = null, kilitli = false, duzenlenen = -1, basili = false;
  const isaretler = [];   // { s: porte adımı, renk }

  const kap = h('div', { class: 'yerlestir donanimYaz' });
  const svg = svgEl('svg', { class: 'porte etkilesim', viewBox: '0 10 ' + W + ' 118', preserveAspectRatio: 'xMidYMid meet' });
  const bilgi = h('div', { class: 'yerBilgi' });
  kap.appendChild(svg);
  kap.appendChild(bilgi);

  const turDugmeler = {};
  function turDugme(kod, etiket) {
    const b = h('button', { class: 'paletDugme', type: 'button', 'aria-label': etiket },
      h('span', { class: 'bravura' }, glifStr(ARIZA_GLIF[kod])), h('small', null, etiket));
    b.onclick = function () { if (kilitli) return; tur = kod; ciz(); };
    turDugmeler[kod] = b;
    return b;
  }
  const geriAl = h('button', { class: 'paletDugme', type: 'button', 'aria-label': 'Son işareti geri al' }, h('span', { class: 'yok' }, '⌫'), h('small', null, 'geri al'));
  geriAl.onclick = function () { if (kilitli || !isaretler.length) return; isaretler.pop(); ciz(); };
  const palet = h('div', { class: 'palet bati' }, h('div', { class: 'paletSatir' }, turDugme('#', 'diyez'), turDugme('b', 'bemol'), geriAl));
  kap.appendChild(palet);

  function ciz() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    if (!kilitli && tur && isaretler.length < EN_COK) svg.appendChild(svgEl('rect', { x: X0 + isaretler.length * DX - DX / 2, y: 14, width: DX, height: 110, rx: 8, class: 'yerAktif' }));
    for (let i = 0; i < 5; i++) svgCizgi(svg, 0, W, 50 + i * 10);
    svgGlif(svg, GLIF_SOL, 22, 80);
    isaretler.forEach(function (m, i) { svgGlif(svg, ARIZA_GLIF[tur], X0 + i * DX, notaY(m.s), m.renk || 'var(--secim)'); });
    for (const k in turDugmeler) turDugmeler[k].classList.toggle('secili', tur === k);
    geriAl.disabled = kilitli || !isaretler.length;
    if (kilitli) bilgi.textContent = '';
    else if (!tur) bilgi.textContent = 'Önce işareti seç: diyez mi, bemol mü?';
    else if (!isaretler.length) bilgi.textContent = 'Porteye dokun: ilk işaretin yeri';
    else {
      const m = isaretler[duzenlenen >= 0 && duzenlenen < isaretler.length ? duzenlenen : isaretler.length - 1];
      bilgi.textContent = isaretler.length + ' işaret · ' + HARF_AD[((m.s % 7) + 7) % 7] + (tur === '#' ? ' diyez' : ' bemol') + ' · kaydırarak düzelt';
    }
    kontrol.disabled = kilitli || !isaretler.length;
  }
  function noktadan(e) {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const m = svg.getScreenCTM();
    return m ? pt.matrixTransform(m.inverse()) : null;
  }
  function isle(e, ilk) {
    if (kilitli) return;
    const p = noktadan(e);
    if (!p) return;
    if (ilk) {
      if (!tur) { toast('Önce işareti seç: diyez mi, bemol mü?'); duzenlenen = -1; return; }
      const sutun = Math.round((p.x - X0) / DX);
      if (sutun >= 0 && sutun < isaretler.length) duzenlenen = sutun;
      else if (isaretler.length < EN_COK) { isaretler.push({ s: 34 }); duzenlenen = isaretler.length - 1; }
      else { duzenlenen = -1; return; }
    }
    if (duzenlenen < 0) return;
    const s = Math.max(SMIN, Math.min(SMAX, Math.round((ALT_CIZGI_Y - p.y) / 5) + 30));
    const m = isaretler[duzenlenen];
    if (!ilk && m.s === s) return;
    m.s = s; delete m.renk;
    ciz();
  }
  svg.addEventListener('pointerdown', function (e) { basili = true; try { svg.setPointerCapture(e.pointerId); } catch (x) {} isle(e, true); e.preventDefault(); });
  svg.addEventListener('pointermove', function (e) { if (basili) isle(e, false); });
  svg.addEventListener('pointerup', function () { basili = false; });
  svg.addEventListener('pointercancel', function () { basili = false; });

  // denetim ve erişim için: işaretleri doğrudan kurar
  q.donanimYaz = { kur: function (kod, adimlar) { tur = kod; isaretler.length = 0; adimlar.forEach(function (s) { isaretler.push({ s: s }); }); ciz(); } };

  alan.appendChild(kap);
  kontrol.hidden = false;
  kontrol.textContent = 'Kontrol et';
  ciz();
  kontrol.onclick = function () {
    if (q.cevaplandi || !isaretler.length) return;
    const turDogru = B[0].a === tur;
    const harfDogru = function (i) { return turDogru && i < B.length && i < isaretler.length && ((isaretler[i].s % 7) + 7) % 7 === B[i].h; };
    const n = Math.max(B.length, isaretler.length);
    let ys = 0;
    for (let i = 0; i < n; i++) if (!harfDogru(i)) ys++;
    const dogru = ys === 0;
    const boya = function () { isaretler.forEach(function (m, i) { m.renk = harfDogru(i) ? 'var(--dogru)' : 'var(--yanlis)'; }); };
    // Kısmi puan: işaret türü doğruysa ve yanlışlar yarıdan fazla değilse bir düzeltme hakkı
    if (!dogru && !q.duzeltme && kismiAcik() && B.length >= 2 && turDogru && ys * 2 <= B.length) {
      q.duzeltme = true;
      boya();
      const kirmizi = isaretler.filter(function (m, i) { return !harfDogru(i); }).length, eksik = Math.max(0, B.length - isaretler.length);
      const not = $('oyIpucu');
      not.innerHTML = '✏️ ' + [kirmizi ? '<b>' + kirmizi + '</b> işaret yanlış (kırmızı)' : '', eksik ? '<b>' + eksik + '</b> işaret eksik' : ''].filter(Boolean).join(', ') +
        '. Bir hakkın var; düzeltirsen yarım kalp gider.';
      not.hidden = false;
      not.classList.add('duzeltNot');
      kontrol.textContent = 'Düzelt ve kontrol et';
      duzenlenen = -1;
      ciz();
      try { kap.scrollIntoView({ block: 'nearest' }); } catch (e) {}   // not üstte yer açınca palet görünür kalsın
      return;
    }
    kilitli = true;
    boya();
    palet.classList.add('kilitli');
    ciz();
    kontrol.hidden = true;
    const standart = dogru && isaretler.every(function (m, i) { return m.s === adim(B[i]); });
    const gorsel = !dogru || !standart ? porteSVG({ notalar: [], donanim: B, enAz: 170 }) : null;
    if (dogru && !standart) veri.otoYok = true;   // doğru yazımı görmeye vakit kalsın
    cevapla(dogru ? (q.duzeltme ? 'yarim' : true) : false, null, gorsel,
      dogru && !standart ? '<p>Sesler ve sıra doğru. Alışılmış yazımda işaretler porteye şu yerlere konur:</p>' : null);
  };
}

const TON_GORSEL_TIPLER = ['cemberDominant', 'cemberAlt', 'klavyeMajor', 'klavyeMinor', 'ilgiliKlavye', 'ilgiliPorte', 'ayniAdPorte', 'diziTon', 'diziTonMinor', 'donanimDogru', 'donanimYaz', 'diziKur'];
function tonGorselSoru(tip, kumeler) {
  const tum = araliktan(-7, 7);
  const dpo = function (k) { return { notalar: [], donanim: donanimNotalari(k), enAz: 170, kirp: true }; };
  const sifirsiz = function () { const L = kumeler.filter(function (k) { return k !== 0; }); return L.length ? L : [1]; };
  let s = rastgele(kumeler);
  const q = { oge: tonOge(s), tip: 'secim', aciklama: tonAciklama(s) };

  if (tip === 'klavyeMajor' || tip === 'klavyeMinor') {
    const tur = tip === 'klavyeMajor' ? 'majör' : 'minör', t = tonikNota(s, tur), p = tonPc(t);
    q.tip = 'ozel';
    q.soru = { porte: dpo(s) }; q.alt = 'Bu donanımın ' + tur + ' tonunun karar sesine klavyede dokun';
    q.klavye = { verilen: [], hedefPc: p, hedefY: p, hedefEtiket: batiAd(t, true) };
    q.ozel = { karar: 1, ciz: klavyeSoruCiz };
    q.dogruMetin = tonAd(s, tur);
    q.ipucu = tur === 'minör' ? 'Önce majör tonu bul, sonra 3 yarım ses (küçük üçlü) aşağı in'
      : s > 0 ? 'Son diyezin yarım ses üstü majör tondur' : s < 0 ? 'Sondan bir önceki bemol majör tonun adıdır (tek bemolde: Fa)' : 'Arızasız';

  } else if (tip === 'ilgiliKlavye') {
    const yon = Math.random() < 0.5;   // true: majörden minöre (3 yarım ses aşağı)
    const kaynak = tonikNota(s, yon ? 'majör' : 'minör'), hedef = tonikNota(s, yon ? 'minör' : 'majör');
    let y = tonPc(kaynak);
    if (yon && y < 3) y += 12;
    const hy = y + (yon ? -3 : 3);
    q.tip = 'ozel';
    q.soru = { metin: tonAd(s, yon ? 'majör' : 'minör') }; q.alt = (yon ? 'İlgili minörünün' : 'İlgili majörünün') + ' karar sesine klavyede dokun';
    q.klavye = { verilen: [{ y: y, etiket: batiAd(kaynak, true) }], hedefPc: ((hy % 12) + 12) % 12, hedefY: hy, hedefEtiket: batiAd(hedef, true) };
    q.ozel = { karar: 1, ciz: klavyeSoruCiz };
    q.dogruMetin = tonAd(s, yon ? 'minör' : 'majör');
    q.ipucu = 'Küçük üçlü = 3 yarım ses: siyah tuşları da sayarak ' + (yon ? 'aşağı in' : 'yukarı çık');

  } else if (tip === 'ilgiliPorte') {
    const yon = Math.random() < 0.5;   // true: majör kararı verilir, minör kararı sorulur (üçlü aşağı)
    const kaynak = tonikNota(s, yon ? 'majör' : 'minör');
    const o = yon ? (kaynak.h <= 2 ? 5 : 4) : (kaynak.h <= 1 ? 5 : 4);   // şıklar ek çizgilere fazla taşmasın
    const a0 = adim({ h: kaynak.h, o: o }), D = donanimNotalari(s);
    const hedef = a0 + (yon ? -2 : 2);
    const dis = yon ? [a0 - 1, a0 - 3, a0 + 2] : [a0 + 1, a0 + 3, a0 - 2];
    q.soru = { porte: { donanim: D, notalar: [adimdanNota(a0)], enAz: 190, kirp: true } };
    q.alt = 'Portedeki ses ' + (yon ? 'majör' : 'minör') + ' tonun kararı. İlgili ' + (yon ? 'minörün' : 'majörün') + ' kararı hangisi?';
    q.siklar = [hedef].concat(dis).map(function (a) { return { key: String(a), porte: { donanim: D, notalar: [adimdanNota(a)], enAz: 150 } }; });
    q.dogru = String(hedef); q.dogruMetin = tonAd(s, yon ? 'minör' : 'majör');
    q.ipucu = 'İlgili minör, majörün küçük üçlü altındadır: portede bir çizgiden alttaki çizgiye, bir aralıktan alttaki aralığa';

  } else if (tip === 'ayniAdPorte') {
    const uygun = kumeler.filter(function (k) { return k - 3 >= -7; });
    const sm = uygun.length ? rastgele(uygun) : 3;
    const hedef = sm - 3;
    q.oge = tonOge(sm);
    q.soru = { porte: dpo(sm) }; q.alt = tonAd(sm, 'majör') + ' donanımı bu. Aynı adlı minörün (' + batiAd(tonikNota(sm, 'majör')) + ' minör) donanımı hangisi?';
    const dis = benzersiz([sm, hedef + 1, hedef - 1, hedef + 2, -hedef].filter(function (k) { return k !== hedef && k >= -7 && k <= 7; })).slice(0, 3);
    q.siklar = [hedef].concat(dis).map(function (k) { return { key: String(k), porte: dpo(k) }; });
    q.dogru = String(hedef); q.dogruMetin = arizaMetni(hedef);
    q.aciklama = tonAd(sm, 'majör') + ': ' + arizaMetni(sm) + '. Aynı adlı minör (' + tonAd(hedef, 'minör') + ') 3 arıza bemol yönündedir: <b>' + arizaMetni(hedef) + '</b>.';
    q.ipucu = 'Aynı adlı minör: 3 diyez eksik ya da 3 bemol fazla';

  } else if (tip === 'diziTon' || tip === 'diziTonMinor') {
    const minor = tip === 'diziTonMinor';
    q.soru = { porte: { notalar: minor ? minorDizi(s, 'dogal') : majorDizi(s), aralik: 33, enAz: 320, kirp: true } };
    q.alt = 'Bu ' + (minor ? 'doğal minör' : 'majör') + ' dizinin donanımı hangisi?';
    q.siklar = [s].concat(yakinTonlar(s, tum, 3)).map(function (k) { return { key: String(k), porte: dpo(k) }; });
    q.dogru = String(s); q.dogruMetin = tonAd(s, minor ? 'minör' : 'majör') + ': ' + arizaMetni(s);
    q.ipucu = 'Dizide hangi notalar işaretli? İlk ve son nota aynı ses, iki kez sayma';

  } else if (tip === 'donanimDogru') {
    const uygun = kumeler.filter(function (k) { return Math.abs(k) >= 2; });
    if (!uygun.length) return tonSoru('tonDonanimMajor', kumeler);
    s = rastgele(uygun);
    const D = donanimNotalari(s), n = D.length, yon = s > 0 ? 1 : -1;
    const takas = D.slice(); takas[n - 1] = D[n - 2]; takas[n - 2] = D[n - 1];           // son iki işaretin sırası ters
    const i = Math.floor(Math.random() * n);
    const kayik = D.slice(); kayik[i] = adimdanNota(adim(D[i]) + (Math.random() < 0.5 ? 1 : -1), D[i].a);   // bir işaret yanlış çizgide
    const komsu = donanimNotalari(Math.abs(s) === 7 ? s - yon : s + yon);                 // doğru yazılmış ama başka ton
    q.oge = tonOge(s); q.aciklama = tonAciklama(s) + ' İşaretlerin sırası ve portedeki yerleri hiç değişmez.';
    q.soru = { metin: tonAd(s, 'majör') }; q.alt = 'Donanım hangisinde doğru yazılmış?';
    q.siklar = [['d', D], ['t', takas], ['k', kayik], ['n', komsu]].map(function (x) { return { key: x[0], porte: { notalar: [], donanim: x[1], enAz: 170 } }; });
    q.dogru = 'd'; q.dogruMetin = arizaMetni(s) + ': ' + donanimSirasiMetni(s);
    q.ipucu = s > 0 ? 'Diyez sırası: Fa Do Sol Re La Mi Si' : 'Bemol sırası: Si Mi La Re Sol Do Fa';

  } else if (tip === 'donanimYaz') {
    s = rastgele(sifirsiz());
    q.oge = tonOge(s); q.aciklama = tonAciklama(s);
    q.tip = 'ozel';
    q.soru = { metin: tonAd(s, 'majör') }; q.alt = 'Donanımını porteye yaz';
    q.donanim = { beklenen: donanimNotalari(s) };
    q.ozel = { karar: Math.abs(s), ciz: donanimYazCiz };
    q.dogruMetin = arizaMetni(s) + ': ' + donanimSirasiMetni(s);
    q.ipucu = 'Önce kaç işaret olduğunu bul. Diyez sırası: Fa Do Sol Re La Mi Si; bemol sırası bunun tersi.';

  } else if (tip === 'cemberDominant' || tip === 'cemberAlt') {
    const yon = tip === 'cemberDominant' ? 1 : -1;
    const uygun = kumeler.filter(function (k) { return k >= -5 && k <= 6 && k + yon >= -5 && k + yon <= 6; });
    const k0 = rastgele(uygun.length ? uygun : [0]), hedef = k0 + yon;
    q.oge = tonOge(k0);
    q.tip = 'ozel';
    q.soru = { metin: tonAd(k0, 'majör') }; q.alt = 'Beşliler çemberinde ' + (yon > 0 ? 'dominant' : 'alt dominant') + ' tonuna dokun';
    q.cember = { verilen: k0, hedef: hedef };
    q.ozel = { karar: 1, ciz: cemberDokunCiz };
    q.dogruMetin = tonAd(hedef, 'majör');
    q.aciklama = 'Beşliler çemberinde ' + (yon > 0 ? 'saat yönünde (tam beşli yukarı, bir diyez fazla / bir bemol eksik)' : 'saat yönünün tersine (tam beşli aşağı, bir bemol fazla / bir diyez eksik)') + ' komşu: <b>' + tonAd(hedef, 'majör') + '</b>.';
    q.ipucu = yon > 0 ? 'Dominant: saat yönünde bir adım' : 'Alt dominant: saat yönünün tersine bir adım';

  } else if (tip === 'diziKur') {
    s = rastgele(sifirsiz());
    const D = majorDizi(s);
    q.oge = tonOge(s); q.aciklama = tonAciklama(s);
    q.tip = 'yer';
    q.soru = { metin: tonAd(s, 'majör') + ' dizisi' }; q.alt = 'Her notanın işaretini seç (işaret almıyorsa ∅)';
    q.yer = { slotlar: D.map(function (n, i) { return i === 0 ? { sabit: n } : { konum: { h: n.h, o: n.o } }; }), palet: 'bati', beklenen: D };
    q.dogruMetin = D.map(function (n) { return batiAd(n, true); }).join(' ');
    q.ipucu = 'Donanımdaki işaretler dizide hangi notalara denk geliyor? ' + (s > 0 ? 'Diyez sırası: Fa Do Sol Re La Mi Si' : 'Bemol sırası: Si Mi La Re Sol Do Fa');
  }
  return q;
}

// 3.5: beşliler çemberinde bir tona dokunma. veri.cember: { verilen: s, hedef: s }
function cemberDokunCiz(alan, veri, q, kontrol) {
  const C = veri.cember, sira = [0, 1, 2, 3, 4, 5, 6, -5, -4, -3, -2, -1];
  let secili = null, kilitli = false, sonuc = {};
  const kap = h('div', { class: 'klavyeKap cemberKap' });
  const svg = svgEl('svg', { class: 'cember etkilesim', viewBox: '0 0 300 300', preserveAspectRatio: 'xMidYMid meet', role: 'img', 'aria-label': 'Beşliler çemberi' });
  const bilgi = h('div', { class: 'yerBilgi' });
  kap.appendChild(svg); kap.appendChild(bilgi);
  const yer = function (i) { const a = (i * 30 - 90) * Math.PI / 180; return [150 + 118 * Math.cos(a), 150 + 118 * Math.sin(a)]; };
  function ciz() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.appendChild(svgEl('circle', { cx: 150, cy: 150, r: 118, fill: 'none', stroke: 'currentColor', opacity: .25, 'stroke-width': 2 }));
    sira.forEach(function (s, i) {
      const p = yer(i);
      const durum = sonuc[s] || (s === C.verilen ? 'verilen' : s === secili ? 'secili' : '');
      svg.appendChild(svgEl('circle', { cx: p[0], cy: p[1], r: 25, class: 'cemberDugum ' + durum }));
      const t = svgEl('text', { x: p[0], y: p[1] + 4, 'font-size': s === 6 ? 9 : 12, 'text-anchor': 'middle', class: 'cemberYazi ' + durum });
      t.textContent = s === 6 ? 'Fa♯/Sol♭' : batiAd(tonikNota(s, 'majör'), true);
      svg.appendChild(t);
    });
    const m = svgEl('text', { x: 150, y: 146, 'font-size': 11, 'text-anchor': 'middle', fill: 'currentColor', opacity: .7 });
    m.textContent = 'saat yönü ↻';
    svg.appendChild(m);
    const m2 = svgEl('text', { x: 150, y: 162, 'font-size': 10, 'text-anchor': 'middle', fill: 'currentColor', opacity: .55 });
    m2.textContent = 'beşli yukarı';
    svg.appendChild(m2);
    bilgi.textContent = kilitli ? '' : secili === null ? 'Çemberde bir tona dokun' : 'Ton seçildi · başkasına dokunarak değiştirebilirsin';
    kontrol.disabled = kilitli || secili === null;
  }
  function sec(s) { if (kilitli || s === C.verilen || sira.indexOf(s) < 0) return; secili = s; ciz(); }
  svg.addEventListener('pointerdown', function (e) {
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const mm = svg.getScreenCTM(); if (!mm) return;
    const p = pt.matrixTransform(mm.inverse());
    let en = -1, ed = 1e9;
    sira.forEach(function (s, i) { const y = yer(i), d = Math.hypot(p.x - y[0], p.y - y[1]); if (d < ed) { ed = d; en = s; } });
    if (ed <= 34) sec(en);
    e.preventDefault();
  });
  q.cember = { sec: sec, deger: function () { return secili; } };
  alan.appendChild(kap);
  kontrol.hidden = false; kontrol.textContent = 'Kontrol et';
  ciz();
  kontrol.onclick = function () {
    if (q.cevaplandi || secili === null) return;
    const dogru = secili === C.hedef;
    sonuc = {}; sonuc[C.hedef] = 'dogru'; if (!dogru) sonuc[secili] = 'yanlis';
    kilitli = true; ciz();
    kontrol.hidden = true;
    cevapla(dogru);
  };
}
