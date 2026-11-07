// =====================================================
// 3.1: KULAK EĞİTİMİ
// Ses motoru (gitar örnekleri, 53 komalı perdeler), sesli soru tipleri, Meşk Yolu'na eklenen
// 👂 seviyeleri ve Araçlar → Kulak eğitimi. yeni.js'ten sonra, motor.js'ten önce yüklenir.
//  · Ahenk: Kız (Rast perdesi La sesinden, 220 Hz). Çok pest kalan ezgiler Sipürde ya da Bolâhenk'te çalar.
//  · Dinleme hakkı sınırsız; Sonsuz Meşk'te Usta katında 3, Pîr katında 2.
//  · 1 komalık ayrımlar yolda yalnız "İnce ayrım" seviyesinde; Sonsuz Meşk'in Usta ve Pîr katlarında da gelir.
//  · Seyir parçaları: SymbTr (CC BY-NC-SA 4.0), js/kulak-seyir.js
//  · Gitar örnekleri: University of Iowa Electronic Music Studios, Musical Instrument Samples (gitar);
//    tonejs-instruments "guitar-acoustic" düzenlemesi (N. Brosowsky, CC BY 3.0). Seyir için kısaltıldı ve ses düzeyi eşitlendi.
//  · 3.1.1: 1–5. Dörtlü-Beşli ünitelerindeki sorulara isteğe bağlı dinleme; her üniteye "Dinleyerek tanış" seviyesi.
// =====================================================
'use strict';

// ---------- SES MOTORU ----------
const KULAK = { tampon: {}, yuk: null, calan: [], zamanlayici: [], kimlik: 0, bitis: null };
// gitar2 örneklerinin ölçülen akort sapması (sent); dosya adı: ses/gitar/g<MIDI>.mp3
const KULAK_SAPMA = { 48: -4.0, 49: -2.8, 50: -1.8, 51: -3.8, 52: -3.2, 53: -2.5, 54: -2.8, 55: -7.0, 56: -6.0, 57: 1.8, 58: 0.5, 59: 0.8, 60: 1.8,
  61: 1.0, 62: -1.5, 63: 6.8, 64: 5.0, 65: 4.2, 66: 3.5, 67: 0.8, 68: 5.0, 69: 2.8, 70: 4.8, 71: 3.8, 72: 2.2, 73: 1.2, 74: 1.5 };
const KULAK_KIZ_RAST = 220;          // Kız ahengi: Rast perdesi La sesinden duyulur
const KULAK_SOL4 = 243;              // nota.js: Sol4 (Rast) koması
const KULAK_AHENK = [{ id: 'kiz', ad: 'Kız', kaydir: 0 }, { id: 'sipurde', ad: 'Sipürde', kaydir: 13 }, { id: 'bolahenk', ad: 'Bolâhenk', kaydir: 22 }];
const KULAK_PEST = 175, KULAK_TIZ = 600;   // Hz: bunun altı "çok pest" sayılır; üst ahenkte bu sınırı aşmamalı

function kulakHz(k, kaydir) { return KULAK_KIZ_RAST * Math.pow(2, (k - KULAK_SOL4 + (kaydir || 0)) / 53); }
function kulakAhenk(komalar) {
  const L = komalar.filter(function (k) { return k > 0; });
  if (!L.length) return KULAK_AHENK[0];
  const en = Math.min.apply(null, L), ust = Math.max.apply(null, L);
  if (kulakHz(en, 0) >= KULAK_PEST) return KULAK_AHENK[0];
  for (let i = 1; i < KULAK_AHENK.length; i++) {
    const a = KULAK_AHENK[i];
    if (kulakHz(en, a.kaydir) >= KULAK_PEST && kulakHz(ust, a.kaydir) <= KULAK_TIZ) return a;
  }
  return KULAK_AHENK[0];
}
function kulakHazirla() {
  const c = sesBaglam();
  if (!c) return Promise.resolve(false);
  if (KULAK.yuk) return KULAK.yuk;
  const isler = Object.keys(KULAK_SAPMA).map(function (m) {
    return fetch('ses/gitar/g' + m + '.mp3').then(function (r) { if (!r.ok) throw new Error('yok'); return r.arrayBuffer(); })
      .then(function (ab) { return new Promise(function (ok, red) { c.decodeAudioData(ab, ok, red); }); })
      .then(function (b) { KULAK.tampon[m] = b; return true; })
      .catch(function () { return false; });
  });
  KULAK.yuk = Promise.all(isler).then(function () { return Object.keys(KULAK.tampon).length > 0; });
  return KULAK.yuk;
}
function kulakNota(hz, t, d, kazanc) {
  const c = SES.ctx;
  if (!c) return;
  const hedef = 69 + 12 * Math.log2(hz / 440);
  let en = null, enF = 99;
  for (const m in KULAK.tampon) {
    const f = Math.abs(+m + KULAK_SAPMA[m] / 100 - hedef);
    if (f < enF) { enF = f; en = m; }
  }
  const v = kazanc == null ? 0.9 : kazanc;
  const g = c.createGain();
  g.connect(SES.ana);
  let src;
  if (en !== null) {
    src = c.createBufferSource();
    src.buffer = KULAK.tampon[en];
    src.playbackRate.value = Math.pow(2, (hedef - (+en + KULAK_SAPMA[en] / 100)) / 12);
    g.gain.setValueAtTime(v, t);
  } else {
    // yedek: örnekler yüklenemezse yumuşak, sönen bir ton
    src = c.createOscillator();
    src.type = 'triangle';
    src.frequency.value = hz;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v * 0.45, t + 0.01);
    g.gain.setTargetAtTime(0, t + 0.02, 0.4);
  }
  g.gain.setTargetAtTime(0, t + d, 0.04);
  src.connect(g);
  try { src.start(t); src.stop(t + d + 0.3); } catch (e) {}
  KULAK.calan.push(src);
  src.onended = function () {
    const i = KULAK.calan.indexOf(src);
    if (i >= 0) KULAK.calan.splice(i, 1);
    try { g.disconnect(); } catch (e) {}
  };
  SES.sonSes = Math.max(SES.sonSes || 0, t + d + 0.3);
}
// olaylar: [{k: koma, t: başlangıç (sn), d: süre (sn)}]; o: { kaydir, bitince, nota(i) }
function kulakCal(olaylar, o) {
  o = o || {};
  kulakDur();
  const c = sesBaglam();
  if (!c) { if (o.bitince) o.bitince(); return 0; }
  const kimlik = KULAK.kimlik;
  KULAK.bitis = o.bitince || null;
  const son = olaylar.reduce(function (m, e) { return Math.max(m, e.t + e.d); }, 0);
  const basla = function () {
    if (kimlik !== KULAK.kimlik) return;
    const t0 = c.currentTime + 0.08;
    olaylar.forEach(function (e, i) {
      if (e.k > 0) kulakNota(kulakHz(e.k, o.kaydir), t0 + e.t, e.d, e.v);
      if (o.nota) KULAK.zamanlayici.push(setTimeout(function () { if (kimlik === KULAK.kimlik) o.nota(i); }, (e.t + 0.08) * 1000));
    });
    KULAK.zamanlayici.push(setTimeout(function () {
      if (kimlik !== KULAK.kimlik) return;
      const f = KULAK.bitis; KULAK.bitis = null;
      if (f) f();
    }, (son + 0.25) * 1000));
    sesUyku();
  };
  if (Object.keys(KULAK.tampon).length) basla();
  else kulakHazirla().then(basla);
  return son;
}
function kulakDur() {
  KULAK.kimlik++;
  KULAK.zamanlayici.forEach(clearTimeout);
  KULAK.zamanlayici = [];
  KULAK.calan.slice().forEach(function (s) { try { s.stop(); } catch (e) {} });
  KULAK.calan = [];
  const f = KULAK.bitis; KULAK.bitis = null;
  if (f) f();
}

// ---------- EZGİ KURUCULAR ----------
const KULAK_ADIM = 0.46;
function kulakDiziOlay(komalar, yon, adim) {
  adim = adim || KULAK_ADIM;
  let L;
  if (yon === 'i') L = komalar.slice().reverse();
  else if (yon === 'c') L = komalar.slice();
  else L = komalar.concat(komalar.slice(0, -1).reverse());     // çıkış-iniş
  return L.map(function (k, i) { return { k: k, t: i * adim, d: i === L.length - 1 ? 1.1 : adim + 0.04 }; });
}
function kulakSeyirOlay(paket, hiz) {
  hiz = hiz || 1;
  const L = [];
  let t = 0;
  for (let i = 0; i < paket.length; i += 2) {
    const k = paket[i], d = paket[i + 1] / 100 / hiz;
    if (k > 0) L.push({ k: k, t: t, d: d + 0.04 });
    t += d;
  }
  if (L.length) L[L.length - 1].d = Math.max(L[L.length - 1].d, 1.2);
  return L;
}
function kulakSon(olaylar) { return olaylar.reduce(function (m, e) { return Math.max(m, e.t + e.d); }, 0); }
function kulakArdArda(listeler, ara) {
  const L = [];
  let t = 0;
  listeler.forEach(function (p) {
    p.forEach(function (e) { L.push({ k: e.k, t: t + e.t, d: e.d }); });
    t += kulakSon(p) + (ara == null ? 0.8 : ara);
  });
  return L;
}
// Sorunun dinleme bilgisi: parcalar [{etiket, olaylar}], o: { karar (koma) }
function kulakDinle(parcalar, o) {
  o = o || {};
  const tum = [];
  parcalar.forEach(function (p) { p.olaylar.forEach(function (e) { tum.push(e.k); }); });
  if (o.karar) tum.push(o.karar);
  const a = kulakAhenk(tum);
  return { kulak: true, parcalar: parcalar, karar: o.karar || null, kaydir: a.kaydir, ahenk: a.ad, ara: o.ara == null ? 0.9 : o.ara };
}

// ---------- SORU İÇİ DÜĞMELER ----------
// Dinleme hakkı: sınırsız; Sonsuz Meşk'te Usta 3, Pîr 2 (ilk otomatik çalış da sayılır)
function kulakLimit() {
  if (!TUR || !TUR.sonsuz || !TUR.q || !TUR.q.veri) return Infinity;
  const kat = TUR.q.veri.kat;
  return kat === 'Pîr' ? 2 : kat === 'Usta' ? 3 : Infinity;
}
function kulakDugmeler(d, otomatik) {
  const kap = h('div', { class: 'kulakDugmeler' });
  const limit = kulakLimit();
  let kalan = limit;
  const sayac = h('small', { class: 'kulakSayac' });
  const sayilan = [], hepsi = [];
  const yaz = function () {
    if (limit !== Infinity) sayac.textContent = kalan > 0 ? '🔁 Kalan dinleme: ' + kalan : '🔇 Dinleme hakkın bitti';
    sayilan.forEach(function (b) { b.disabled = kalan <= 0; });
  };
  const cal = function (btn, olaylar, sayilir) {
    if (sayilir && kalan <= 0) return;
    if (sayilir) { kalan--; yaz(); }
    hepsi.forEach(function (b) { b.classList.remove('caliyor'); });
    btn.classList.add('caliyor');
    kulakCal(olaylar, { kaydir: d.kaydir, bitince: function () { btn.classList.remove('caliyor'); } });
  };
  const coklu = d.parcalar.length > 1;
  const butun = coklu ? kulakArdArda(d.parcalar.map(function (p) { return p.olaylar; }), d.ara) : d.parcalar[0].olaylar;
  const ana = h('button', { class: 'dugme ince dinleDugme', type: 'button' }, coklu ? '🔊 Hepsini dinle' : '🔊 Dinle');
  ana.onclick = function (e) { e.stopPropagation(); cal(ana, butun, true); };
  sayilan.push(ana); hepsi.push(ana);
  const satir = h('div', { class: 'kulakSatir' }, ana);
  if (d.karar) {
    const kb = h('button', { class: 'dugme ince kararDugme', type: 'button', title: 'Karar sesini bir kez çalar' }, '🎯 Karar');
    kb.onclick = function (e) { e.stopPropagation(); cal(kb, [{ k: d.karar, t: 0, d: 1.2 }], false); };
    hepsi.push(kb);
    satir.appendChild(kb);
  }
  kap.appendChild(satir);
  if (coklu) {
    const s2 = h('div', { class: 'kulakSatir' });
    d.parcalar.forEach(function (p, i) {
      const b = h('button', { class: 'cip kulakParca', type: 'button' }, '▶ ' + (p.etiket || (i + 1) + '.'));
      b.onclick = function (e) { e.stopPropagation(); cal(b, p.olaylar, true); };
      sayilan.push(b); hepsi.push(b);
      s2.appendChild(b);
    });
    kap.appendChild(s2);
  }
  kap.appendChild(h('div', { class: 'kulakBilgi' }, sayac, h('small', null, d.ahenk + ' ahengi')));
  yaz();
  if (otomatik) setTimeout(function () { if (document.body.contains(ana) && !(TUR && TUR.q && TUR.q.cevaplandi)) cal(ana, butun, true); }, 350);
  return kap;
}
// 3.1.1: görsel sorularda isteğe bağlı dinleme (otomatik çalmaz). d: { cesniler: [kimlik] }; iki çeşni aynı perdeden çalar
function kulakSecenekDugmesi(d) {
  const L = (d.cesniler || []).map(function (id) { return CESNI[id]; }).filter(Boolean);
  if (!L.length) return null;
  const bas = komaOf(L[0].notalar[0]);
  const parcalar = L.map(function (c, i) { return { etiket: L.length > 1 ? c.ad : null, olaylar: kulakDiziOlay(kCesniKomalar(c, bas), 'ci') }; });
  const kap = kulakDugmeler(kulakDinle(parcalar, {}), false);
  kap.classList.add('secimli');
  return kap;
}
// Cevaptan sonra: doğruyu ve seçileni dinleme, çalınanın portesi
function kulakGeri(o) {
  return function (q, dogru) {
    const kap = h('div', { class: 'kulakGeri' });
    if (o.porte) kap.appendChild(h('div', { class: 'geriPorte' }, porteSVG(o.porte)));
    const satir = h('div', { class: 'kulakSatir' });
    const dugmeYap = function (etiket, olaylar) {
      const b = h('button', { class: 'cip kulakParca', type: 'button' }, '🔊 ' + etiket);
      b.onclick = function (e) {
        e.stopPropagation(); otoIptal();
        satir.querySelectorAll('.caliyor').forEach(function (x) { x.classList.remove('caliyor'); });
        b.classList.add('caliyor');
        kulakCal(olaylar, { kaydir: o.kaydir, bitince: function () { b.classList.remove('caliyor'); } });
      };
      satir.appendChild(b);
    };
    if (o.dogru) dugmeYap(o.dogru.etiket, o.dogru.olaylar);
    const s = !dogru && o.secenek && q && q.secilen != null ? o.secenek[q.secilen] : null;
    if (s) dugmeYap(s.etiket + ' (seçtiğin)', s.olaylar);
    (o.ekler || []).forEach(function (x) { dugmeYap(x.etiket, x.olaylar); });
    if (satir.childNodes.length) kap.appendChild(satir);
    return kap;
  };
}

// ---------- VERİ YARDIMCILARI ----------
function kKum(c) { const L = [0]; c.araliklar.forEach(function (a) { L.push(L[L.length - 1] + a); }); return L; }
function kUzak(a, b) {
  if (a.notalar.length !== b.notalar.length) return 99;
  const x = kKum(a), y = kKum(b);
  let t = 0;
  for (let i = 1; i < x.length; i++) t += Math.abs(x[i] - y[i]);
  return t;
}
function kPerdeAdi(k) { const p = KOMADAN_PERDE[k]; return p ? p.ad : null; }
function kCesniKomalar(c, bas) { const b = bas == null ? komaOf(c.notalar[0]) : bas; return kKum(c).map(function (x) { return b + x; }); }
// Soru eki ünlü uyumuna göre: Dörtlüsü mü, Beşlisi mi, Uşşak mı
function kSoruEki(ad) {
  const u = (String(ad).toLocaleLowerCase('tr').match(/[aıoueiöüâîû]/g) || ['a']).pop();
  return { a: 'mı', ı: 'mı', â: 'mı', o: 'mu', u: 'mu', û: 'mu', e: 'mi', i: 'mi', î: 'mi', ö: 'mü', ü: 'mü' }[u] || 'mı';
}
function kTur(c) { return c.tur === 'Beşli' ? 'beşli' : 'dörtlü'; }
function kYon(o) { return o.yon === 'k' ? rastgele(['ci', 'c', 'i']) : (o.yon || 'ci'); }
function kYonMetni(y) { return y === 'c' ? 'Yalnız çıkış' : y === 'i' ? 'Yalnız iniş' : 'Çıkış ve iniş'; }
const K_ALT = 221, K_UST = 327;   // göçürmede ses aralığı: Yegâh … Tiz Neva
let K_YERLER = null;
// Çeşninin makam dizilerinde geçtiği perdeler (ve kendi yeri)
function kCesniYerleri(c) {
  if (!K_YERLER) {
    K_YERLER = {};
    const ekle = function (id, ad) { (K_YERLER[id] = K_YERLER[id] || []).push(ad); };
    MAKAMLAR.forEach(function (m) {
      ekle(m.alt[0], m.karar); ekle(m.ust[0], m.ust[1]);
      if (m.ust2) ekle(m.ust2[0], m.ust2[1]);
    });
    CESNILER.forEach(function (x) { ekle(x.id, x.yer); });
    for (const id in K_YERLER) K_YERLER[id] = benzersiz(K_YERLER[id]).filter(function (ad) { return PERDE[ad]; });
  }
  return K_YERLER[c.id] || [c.yer];
}
// Başlangıç perdesi. mod: 'yok' | 'makam' | 'rastgele'; yazilir: porteye yazılabilmeli
function kBaslangic(c, mod, yazilir, haric) {
  const tepe = kKum(c)[c.araliklar.length];
  let L;
  if (mod === 'makam') L = kCesniYerleri(c);
  else if (mod === 'rastgele') L = PERDELER.filter(function (p) { return p && p.koma >= K_ALT && p.koma + tepe <= K_UST; }).map(function (p) { return p.ad; });
  else L = [c.yer];
  if (yazilir) L = L.filter(function (ad) { return ad === c.yer || !!gocurPerde(c.araliklar, PERDE[ad]); });
  if (haric) { const L2 = L.filter(function (ad) { return ad !== haric; }); if (L2.length) L = L2; }
  if (!L.length) L = [c.yer];
  return PERDE[rastgele(L)];
}
function kNotalar(c, P) { return P.ad === c.yer ? c.notalar : gocurPerde(c.araliklar, P); }
function kPorte(notalar, c, P) { return { notalar: notalar, aralik: 36, enAz: 240, etiketler: [P.ad].concat(c.formul.split('')) }; }
function kCeldir(c, havuz, n, minUzak) {
  const ayni = karistir(havuz.filter(function (x) { return x !== c && x.notalar.length === c.notalar.length && kUzak(c, x) >= minUzak; }));
  const diger = karistir(havuz.filter(function (x) { return x !== c && x.notalar.length !== c.notalar.length; }));
  return ayni.concat(diger).slice(0, Math.max(0, n));
}
function kCeldirEsnek(c, havuz, n, minUzak) {
  let L = kCeldir(c, kAyniBoy(c, havuz), n, minUzak);
  if (L.length < n && minUzak > 4) L = L.concat(kCeldir(c, kAyniBoy(c, havuz).filter(function (x) { return L.indexOf(x) < 0; }), n - L.length, 4));
  return L;
}
function kEnUzak(c, havuz) {
  const L = kAyniBoy(c, havuz).filter(function (x) { return x !== c && kUzak(c, x) > 0; });
  if (!L.length) return null;
  const en = Math.max.apply(null, L.map(function (x) { return kUzak(c, x); }));
  return rastgele(L.filter(function (x) { return kUzak(c, x) >= en - 1; }));
}
function kAyniBoy(c, havuz) { return havuz.filter(function (x) { return x.notalar.length === c.notalar.length; }); }
function kSikNo(i) { return (i + 1) + '. çalım'; }
function kParcaSecenek(L, olayF) {
  const m = {};
  L.forEach(function (x, i) { m['p' + i] = { etiket: x.ad, olaylar: olayF(x) }; });
  return m;
}

// ---------- DÖRTLÜ-BEŞLİ SORULARI ----------
function kqTani(c, o) {
  const P = kBaslangic(c, o.gocur), yon = kYon(o), kom = kCesniKomalar(c, P.koma);
  const dis = kCeldir(c, o.havuz, (o.sik || 4) - 1, o.minUzak || 4);
  const ol = kulakDiziOlay(kom, yon, o.adim);
  const karisik = dis.some(function (x) { return x.tur !== c.tur; });
  const notalar = kNotalar(c, P);
  const q = {
    oge: null, kulak: true, tip: 'secim',
    soru: { metin: '👂 Hangi ' + (karisik ? 'dörtlü ya da beşli' : kTur(c)) + '?', kucuk: true },
    alt: kYonMetni(yon) + (P.ad !== c.yer ? ' · göçürülmüş' : ''),
    dinle: kulakDinle([{ olaylar: ol }], { karar: P.koma }),
    siklar: [c].concat(dis).map(function (x) { return { key: x.id, metin: x.ad }; }),
    dogru: c.id, dogruMetin: c.ad,
    aciklama: cesniAciklama(c) + (P.ad !== c.yer ? '<br>Burada <b>' + P.ad + '</b> perdesinden göçürülmüş olarak çalındı.' : '')
  };
  q.geriEk = kulakGeri({ porte: notalar ? kPorte(notalar, c, P) : null, kaydir: q.dinle.kaydir, dogru: { etiket: c.ad, olaylar: ol },
    secenek: dis.reduce(function (m, x) { m[x.id] = { etiket: x.ad, olaylar: kulakDiziOlay(kCesniKomalar(x, P.koma), yon, o.adim) }; return m; }, {}) });
  return q;
}
function kqIste(c, o) {
  const dis = kCeldir(c, kAyniBoy(c, o.havuz), Math.min(2, (o.parca || 3) - 1), o.minUzak || 4);
  if (!dis.length) return kqTani(c, o);
  const P = kBaslangic(c, o.gocur), yon = kYon(o);
  const L = karistir([c].concat(dis));
  const olay = function (x) { return kulakDiziOlay(kCesniKomalar(x, P.koma), yon, o.adim); };
  const parcalar = L.map(function (x, i) { return { etiket: (i + 1) + '.', olaylar: olay(x) }; });
  const i0 = L.indexOf(c);
  const q = {
    oge: null, kulak: true, tip: 'secim',
    soru: { metin: '👂 Hangisi ' + c.ad + '?', kucuk: true },
    alt: L.length + ' ' + kTur(c) + ' aynı perdeden sırayla çalıyor',
    dinle: kulakDinle(parcalar, { karar: P.koma }),
    siklar: L.map(function (x, i) { return { key: 'p' + i, metin: kSikNo(i) }; }), sirali: true,
    dogru: 'p' + i0, dogruMetin: kSikNo(i0),
    aciklama: L.map(function (x, i) { return (i + 1) + '. <b>' + x.ad + '</b> (' + formulGoster(x.formul) + ')'; }).join('<br>')
  };
  q.geriEk = kulakGeri({ kaydir: q.dinle.kaydir, dogru: { etiket: c.ad, olaylar: olay(c) }, secenek: kParcaSecenek(L, olay) });
  return q;
}
function kqAyni(c, o) {
  const ayni = Math.random() < 0.5;
  const b = ayni ? c : (kCeldir(c, kAyniBoy(c, o.havuz), 1, o.minUzak || 4)[0] || c);
  const gocur = o.gocur && o.gocur !== 'yok';
  const P1 = kBaslangic(c, o.gocur), yon = kYon(o);
  const P2 = gocur ? kBaslangic(b, o.gocur, false, P1.ad) : P1;
  const ol1 = kulakDiziOlay(kCesniKomalar(c, P1.koma), yon, o.adim), ol2 = kulakDiziOlay(kCesniKomalar(b, P2.koma), yon, o.adim);
  const esit = b === c;
  const q = {
    oge: null, kulak: true, tip: 'secim',
    soru: { metin: '👂 Aynı ' + kTur(c) + ' mü?', kucuk: true },
    alt: gocur ? 'İkincisi başka bir perdeden başlıyor; yüksekliğe değil aralıklara kulak ver' : 'İkisi aynı perdeden başlıyor',
    dinle: kulakDinle([{ etiket: '1.', olaylar: ol1 }, { etiket: '2.', olaylar: ol2 }], {}),
    siklar: [{ key: 'A', metin: '🟰 Aynı' }, { key: 'F', metin: '≠ Farklı' }], sirali: true,
    dogru: esit ? 'A' : 'F', dogruMetin: esit ? 'Aynı: ikisi de ' + c.ad : 'Farklı: ' + c.ad + ', sonra ' + b.ad,
    aciklama: '1. <b>' + c.ad + '</b> (' + formulGoster(c.formul) + ')' + (gocur ? ', ' + P1.ad + ' perdesinden' : '') +
      '<br>2. <b>' + b.ad + '</b> (' + formulGoster(b.formul) + ')' + (gocur ? ', ' + P2.ad + ' perdesinden' : '')
  };
  return q;
}
function kqFarkli(c, o) {
  const b = kCeldir(c, kAyniBoy(c, o.havuz), 1, o.minUzak || 4)[0];
  if (!b) return kqTani(c, o);
  const gocur = o.gocur && o.gocur !== 'yok', yon = kYon(o);
  const P0 = kBaslangic(c, o.gocur);
  const sira = karistir([c, c, b]);
  const kullanilan = [];
  const parcalar = sira.map(function (x, i) {
    let P = P0;
    if (gocur) { P = kBaslangic(x, o.gocur, false, kullanilan[kullanilan.length - 1]); kullanilan.push(P.ad); }
    return { etiket: (i + 1) + '.', olaylar: kulakDiziOlay(kCesniKomalar(x, P.koma), yon, o.adim), x: x };
  });
  const i0 = sira.indexOf(b);
  const q = {
    oge: null, kulak: true, tip: 'secim',
    soru: { metin: '👂 Hangisi farklı?', kucuk: true },
    alt: 'Üç ' + kTur(c) + ' çalıyor; ikisi aynı' + (gocur ? ' (başlangıç perdeleri farklı olabilir)' : ''),
    dinle: kulakDinle(parcalar.map(function (p) { return { etiket: p.etiket, olaylar: p.olaylar }; }), {}),
    siklar: sira.map(function (x, i) { return { key: 'p' + i, metin: kSikNo(i) }; }), sirali: true,
    dogru: 'p' + i0, dogruMetin: kSikNo(i0) + ': ' + b.ad,
    aciklama: 'İkisi <b>' + c.ad + '</b> (' + formulGoster(c.formul) + '), farklı olan <b>' + b.ad + '</b> (' + formulGoster(b.formul) + ').'
  };
  q.geriEk = kulakGeri({ kaydir: q.dinle.kaydir, dogru: { etiket: b.ad + ' (farklı olan)', olaylar: parcalar[i0].olaylar } });
  return q;
}
// Tek derecesi farklı çiftler: [a, b, derece]
function kTekFark(havuz, minUzak) {
  const L = [];
  havuz.forEach(function (a) {
    havuz.forEach(function (b) {
      if (a === b || a.notalar.length !== b.notalar.length) return;
      const x = kKum(a), y = kKum(b), f = [];
      for (let i = 1; i < x.length; i++) if (x[i] !== y[i]) f.push(i);
      if (f.length === 1 && Math.abs(x[f[0]] - y[f[0]]) >= minUzak) L.push([a, b, f[0]]);
    });
  });
  return L;
}
function kqHangiSes(c, o) {
  const tum = kTekFark(o.havuz, o.minUzak || 4);
  let C = tum.filter(function (p) { return p[0] === c || p[1] === c; });
  if (!C.length) C = tum;
  if (!C.length) return kqTani(c, o);
  const p = rastgele(C), a = p[0], b = p[1], j = p[2];
  const P = kBaslangic(a, o.gocur);
  const ka = kCesniKomalar(a, P.koma), kb = kCesniKomalar(b, P.koma);
  const ol1 = kulakDiziOlay(ka, 'c', o.adim), ol2 = kulakDiziOlay(kb, 'c', o.adim);
  const n = ka.length, fark = kb[j] - ka[j];
  const adA = kPerdeAdi(ka[j]), adB = kPerdeAdi(kb[j]);
  const siklar = [];
  for (let i = 2; i <= n; i++) siklar.push({ key: 's' + i, metin: i + '. ses' });
  return {
    oge: null, kulak: true, tip: 'secim',
    soru: { metin: '👂 İkincide kaçıncı ses değişti?', kucuk: true },
    alt: 'Aynı perdeden iki ' + kTur(a) + ' çıkıcı çalıyor; yalnız bir sesleri farklı',
    dinle: kulakDinle([{ etiket: '1.', olaylar: ol1 }, { etiket: '2.', olaylar: ol2 }], { karar: P.koma }),
    siklar: siklar, sirali: true, dogru: 's' + (j + 1), dogruMetin: (j + 1) + '. ses',
    aciklama: '1. <b>' + a.ad + '</b> (' + formulGoster(a.formul) + '), 2. <b>' + b.ad + '</b> (' + formulGoster(b.formul) + ').<br>' +
      (j + 1) + '. ses ' + (adA && adB ? '<b>' + adA + '</b> yerine <b>' + adB + '</b>: ' : '') + Math.abs(fark) + ' koma ' + (fark > 0 ? 'tizleşti' : 'pestleşti') + '.'
  };
}
function kqHata(c, o) {
  const kom = kCesniKomalar(c), n = kom.length, aday = [];
  for (let j = 1; j < n; j++) {
    const ust = j + 1 < n ? kom[j + 1] : kom[j] + 10;
    for (let d = -9; d <= 9; d++) {
      if (Math.abs(d) < 4) continue;
      const k2 = kom[j] + d;
      if (k2 > kom[j - 1] && k2 < ust && KOMADAN_PERDE[k2]) aday.push([j, k2]);
    }
  }
  if (!aday.length) return kqTani(c, o);
  const s = rastgele(aday), j = s[0], k2 = s[1];
  const calinan = kom.slice(); calinan[j] = k2;
  const olY = kulakDiziOlay(kom, 'c', o.adim), olC = kulakDiziOlay(calinan, 'c', o.adim);
  const siklar = [];
  for (let i = 2; i <= n; i++) siklar.push({ key: 'n' + i, metin: i + '. nota' });
  const q = {
    oge: null, kulak: true, tip: 'secim',
    soru: { porte: cesniPorte(c), metin: c.ad, kucuk: true },
    alt: '👂 Çalınan, yazılandan bir notada farklı. Hangisi?',
    dinle: kulakDinle([{ olaylar: olC }], { karar: kom[0] }),
    siklar: siklar, sirali: true, dogru: 'n' + (j + 1), dogruMetin: (j + 1) + '. nota',
    aciklama: (j + 1) + '. nota yazıda <b>' + kPerdeAdi(kom[j]) + '</b>, çalınan <b>' + kPerdeAdi(k2) + '</b> (' + Math.abs(k2 - kom[j]) + ' koma ' + (k2 > kom[j] ? 'tiz' : 'pest') + ').'
  };
  q.geriEk = kulakGeri({ kaydir: q.dinle.kaydir, dogru: { etiket: 'Yazılan', olaylar: olY }, ekler: [{ etiket: 'Çalınan', olaylar: olC }] });
  return q;
}
function kqEksik(c, o) {
  const P = kBaslangic(c, o.gocur === 'rastgele' || o.gocur === 'makam' ? 'makam' : 'yok', true);
  const kom = kCesniKomalar(c, P.koma), n = kom.length;
  if (kom.some(function (k) { return !kPerdeAdi(k); })) return kqTani(c, o);
  const j = 1 + Math.floor(Math.random() * (n - 2));
  const dogruAd = kPerdeAdi(kom[j]);
  const min = o.minUzak === 1 ? 1 : 4;
  let adaylar = PERDELER.filter(function (p) { return p && p.koma > kom[j - 1] && p.koma < kom[j + 1] && Math.abs(p.koma - kom[j]) >= min; }).map(function (p) { return p.ad; });
  if (adaylar.length < 2) adaylar = PERDELER.filter(function (p) { return p && Math.abs(p.koma - kom[j]) >= min && Math.abs(p.koma - kom[j]) <= 13; }).map(function (p) { return p.ad; });
  const dis = karistir(adaylar).slice(0, Math.max(2, (o.sik || 4) - 1));
  const ol = kulakDiziOlay(kom, kYon(o), o.adim);
  const q = {
    oge: null, kulak: true, tip: 'secim',
    soru: { metin: kom.map(function (k, i) { return i === j ? '❓' : kPerdeAdi(k); }).join(' · '), kucuk: true },
    alt: '👂 Duyduğun dizideki eksik perde hangisi?',
    dinle: kulakDinle([{ olaylar: ol }], { karar: kom[0] }),
    siklar: [dogruAd].concat(dis).map(function (x) { return { key: x, metin: x }; }),
    dogru: dogruAd, dogruMetin: dogruAd,
    aciklama: 'Çalınan: <b>' + c.ad + '</b> (' + formulGoster(c.formul) + '), ' + P.ad + ' perdesinden.<br>' + kom.map(kPerdeAdi).join(' – ')
  };
  const notalar = kNotalar(c, P);
  q.geriEk = kulakGeri({ porte: notalar ? kPorte(notalar, c, P) : null, kaydir: q.dinle.kaydir, dogru: { etiket: c.ad, olaylar: ol } });
  return q;
}
function kqFormul(c, o) {
  const P = kBaslangic(c, o.gocur), kom = kCesniKomalar(c, P.koma);
  const ol = kulakDiziOlay(kom, 'c', o.adim);
  const harfler = ['T', 'K', 'S', 'B', 'A'];
  return {
    oge: null, kulak: true, tip: 'dizi',
    soru: { metin: '👂 Duyduğun aralıkları diz', kucuk: true },
    alt: 'İlk ses: ' + P.ad + ' · aralık taşlarını sırayla koy',
    dinle: kulakDinle([{ olaylar: ol }], { karar: P.koma }),
    dizi: { havuz: harfler.map(function (x) { return { key: x, metin: x }; }), uzunluk: c.formul.length, beklenen: c.formul.split(''), tekrarli: true },
    dogruMetin: formulGoster(c.formul) + ' (' + c.ad + ')',
    aciklama: cesniAciklama(c)
  };
}
function kqDikte(c, o) {
  let P = kBaslangic(c, o.gocur, true), notalar = kNotalar(c, P);
  if (!notalar) { P = PERDE[c.yer]; notalar = c.notalar; }
  const ol = kulakDiziOlay(kCesniKomalar(c, P.koma), 'c', o.adim);
  return {
    oge: null, kulak: true, tip: 'yer',
    soru: { metin: '👂 Duyduğunu porteye yaz', kucuk: true },
    alt: 'İlk ses verildi (' + P.ad + '). Kalan sesleri dinleyerek kur.',
    dinle: kulakDinle([{ olaylar: ol }], { karar: P.koma }),
    yer: { slotlar: notalar.map(function (n, i) { return i === 0 ? { sabit: n } : {}; }), palet: 'aeu', beklenen: notalar },
    ipucu: 'Aralıklar: ' + formulGoster(c.formul),
    dogruMetin: notalar.map(notaMetni).join(', ') + ' (' + c.ad + ')',
    aciklama: cesniAciklama(c) + (P.ad !== c.yer ? '<br>' + P.ad + ' perdesine göçürülmüş.' : '')
  };
}
function kqHangiPerde(c, o) {
  const P = kBaslangic(c, 'rastgele', true);
  const kom = kCesniKomalar(c, P.koma);
  const adaylar = PERDELER.filter(function (p) {
    return p && p !== P && Math.abs(p.koma - P.koma) >= 5 && p.koma >= K_ALT && p.koma + (kom[kom.length - 1] - kom[0]) <= K_UST && (p.ad === c.yer || gocurPerde(c.araliklar, p));
  }).map(function (p) { return p.ad; });
  const dis = karistir(adaylar).slice(0, Math.max(2, (o.sik || 4) - 1));
  const rast = PERDE['Rast'].koma;
  return {
    oge: null, kulak: true, tip: 'secim',
    soru: { metin: '👂 ' + c.ad + ' hangi perdeden başlıyor?', kucuk: true },
    alt: 'Önce Rast perdesi çalar, sonra ' + c.ad + ' (çıkıcı)',
    dinle: kulakDinle([{ etiket: 'Rast', olaylar: [{ k: rast, t: 0, d: 1.0 }] }, { etiket: c.ad, olaylar: kulakDiziOlay(kom, 'c', o.adim) }], { ara: 0.6 }),
    siklar: [P.ad].concat(dis).map(function (x) { return { key: x, metin: x }; }),
    dogru: P.ad, dogruMetin: P.ad,
    aciklama: cesniAciklama(c) + '<br>Rast ile ' + P.ad + ' arası ' + Math.abs(P.koma - rast) + ' koma.'
  };
}
// ---- 3.1.1: Basit dinleme soruları ("Dinleyerek tanış") ----
function kqDinlePorte(c, o) {
  const dis = kCeldirEsnek(c, o.havuz, Math.min(2, (o.sik || 3) - 1), o.minUzak || 6);
  if (!dis.length) return kqDinleEslesme(c, o);
  const ol = kulakDiziOlay(kCesniKomalar(c), 'ci', o.adim);
  const q = {
    oge: null, kulak: true, tip: 'secim',
    soru: { metin: '👂 Duyduğun hangisi?', kucuk: true }, alt: 'Dinle, sonra portesini seç',
    dinle: kulakDinle([{ olaylar: ol }], { karar: komaOf(c.notalar[0]) }),
    siklar: [c].concat(dis).map(function (x) { return { key: x.id, porte: cesniPorte(x), genis: true }; }),
    dogru: c.id, dogruMetin: c.ad, aciklama: cesniAciklama(c)
  };
  q.geriEk = kulakGeri({ kaydir: q.dinle.kaydir, dogru: { etiket: c.ad, olaylar: ol },
    secenek: dis.reduce(function (m, x) { m[x.id] = { etiket: x.ad, olaylar: kulakDiziOlay(kCesniKomalar(x), 'ci', o.adim) }; return m; }, {}) });
  return q;
}
function kqDinleAd(c, o) {
  const b = kEnUzak(c, o.havuz);
  if (!b) return kqDinleEslesme(c, o);
  const ol = kulakDiziOlay(kCesniKomalar(c), 'ci', o.adim);
  const q = {
    oge: null, kulak: true, tip: 'secim',
    soru: { metin: '👂 ' + c.ad + ' ' + kSoruEki(c.ad) + ', ' + b.ad + ' ' + kSoruEki(b.ad) + '?', kucuk: true }, alt: 'Dinle ve adını seç',
    dinle: kulakDinle([{ olaylar: ol }], { karar: komaOf(c.notalar[0]) }),
    siklar: [c, b].map(function (x) { return { key: x.id, metin: x.ad }; }), dogru: c.id, dogruMetin: c.ad,
    aciklama: '<b>' + c.ad + '</b>: ' + formulGoster(c.formul) + ' · <b>' + b.ad + '</b>: ' + formulGoster(b.formul)
  };
  q.geriEk = kulakGeri({ porte: kPorte(c.notalar, c, PERDE[c.yer]), kaydir: q.dinle.kaydir, dogru: { etiket: c.ad, olaylar: ol },
    secenek: (function () { const m = {}; m[b.id] = { etiket: b.ad, olaylar: kulakDiziOlay(kCesniKomalar(b), 'ci', o.adim) }; return m; })() });
  return q;
}
function kqDinleEslesme(c, o) {
  const b = Math.random() < 0.5 ? (kCeldirEsnek(c, o.havuz, 1, o.minUzak || 6)[0] || null) : null;
  const cal = b || c, ol = kulakDiziOlay(kCesniKomalar(cal, komaOf(c.notalar[0])), 'ci', o.adim);
  const q = {
    oge: null, kulak: true, tip: 'secim',
    soru: { porte: cesniPorte(c), metin: c.ad, kucuk: true }, alt: '👂 Duyduğun, yazılan bu dizi mi?',
    dinle: kulakDinle([{ olaylar: ol }], { karar: komaOf(c.notalar[0]) }),
    siklar: [{ key: 'E', metin: '✔ Evet, bu' }, { key: 'H', metin: '✘ Hayır, başka' }], sirali: true,
    dogru: b ? 'H' : 'E', dogruMetin: b ? 'Hayır: çalınan ' + b.ad : 'Evet: ' + c.ad,
    aciklama: 'Yazılan <b>' + c.ad + '</b> (' + formulGoster(c.formul) + ')' + (b ? ', çalınan <b>' + b.ad + '</b> (' + formulGoster(b.formul) + ').' : '; çalınan da buydu.')
  };
  q.geriEk = kulakGeri({ kaydir: q.dinle.kaydir, dogru: { etiket: 'Çalınan', olaylar: ol }, ekler: b ? [{ etiket: c.ad + ' (yazılan)', olaylar: kulakDiziOlay(kCesniKomalar(c), 'ci', o.adim) }] : [] });
  return q;
}
function kqDinleYon(c, o) {
  const yon = rastgele(['c', 'i']), ol = kulakDiziOlay(kCesniKomalar(c), yon, o.adim);
  return {
    oge: null, kulak: true, tip: 'secim',
    soru: { metin: '👂 Çıkıcı mı, inici mi?', kucuk: true }, alt: 'Sesler pestten tize mi gidiyor, tizden peste mi?',
    dinle: kulakDinle([{ olaylar: ol }], {}),
    siklar: [{ key: 'c', metin: '↗ Çıkıcı (pestten tize)' }, { key: 'i', metin: '↘ İnici (tizden peste)' }], sirali: true,
    dogru: yon, dogruMetin: yon === 'c' ? 'Çıkıcı' : 'İnici',
    aciklama: 'Çalınan: <b>' + c.ad + '</b>, ' + (yon === 'c' ? 'pestten tize (çıkıcı)' : 'tizden peste (inici)') + '. Bu iki sözcük makamların seyrinde de kullanılır.'
  };
}
function kqDinleBoy(c, o) {
  const ol = kulakDiziOlay(kCesniKomalar(c), 'c', o.adim), besli = c.notalar.length === 5;
  return {
    oge: null, kulak: true, tip: 'secim',
    soru: { metin: '👂 Dörtlü mü, beşli mi?', kucuk: true }, alt: 'Kaç ses duydun? Dörtlüde 4, beşlide 5 ses var',
    dinle: kulakDinle([{ olaylar: ol }], { karar: komaOf(c.notalar[0]) }),
    siklar: [{ key: 'd', metin: 'Dörtlü (4 ses)' }, { key: 'b', metin: 'Beşli (5 ses)' }], sirali: true,
    dogru: besli ? 'b' : 'd', dogruMetin: besli ? 'Beşli' : 'Dörtlü',
    aciklama: 'Çalınan: <b>' + c.ad + '</b> (' + formulGoster(c.formul) + ').'
  };
}
// ---- İnce ayrım (1 koma) ----
const K_INCE_PERDE = [['Segâh', 'Bûselik', 'Dügâh'], ['Kürdi', 'Dik Kürdi', 'Dügâh'], ['Nim Hicaz', 'Hicaz', 'Çargâh'],
  ['Nim Hisar', 'Hisar', 'Neva'], ['Evç', 'Mahur', 'Hüseyni'], ['Nim Zirgüle', 'Zirgüle', 'Rast']];
const K_INCE_CESNI = [['d-ussak', 'd-buselik'], ['d-rast', 'd-cargah'], ['b-huseyni', 'b-buselik'], ['b-rast', 'b-cargah']];
function kqTekPerde(o) {
  const p = rastgele(K_INCE_PERDE), hedef = rastgele([p[0], p[1]]), sira = karistir([p[0], p[1]]), kr = PERDE[p[2]].koma;
  const olay = function (ad) { return [{ k: kr, t: 0, d: 0.8 }, { k: PERDE[ad].koma, t: 0.8, d: 1.3 }]; };
  const i0 = sira.indexOf(hedef);
  const pest = PERDE[p[0]].koma < PERDE[p[1]].koma ? p[0] : p[1];
  const q = {
    oge: null, kulak: true, tip: 'secim',
    soru: { metin: '👂 Hangisi ' + hedef + '?', kucuk: true },
    alt: 'İki kez: önce karar (' + p[2] + '), sonra ' + p[0] + ' ya da ' + p[1] + '. Aralarında 1 koma var.',
    dinle: kulakDinle(sira.map(function (ad, i) { return { etiket: (i + 1) + '.', olaylar: olay(ad) }; }), { ara: 0.7 }),
    siklar: sira.map(function (ad, i) { return { key: 'p' + i, metin: kSikNo(i) }; }), sirali: true,
    dogru: 'p' + i0, dogruMetin: kSikNo(i0),
    aciklama: '<b>' + p[0] + '</b> ile <b>' + p[1] + '</b> arasında 1 koma (yaklaşık 23 sent) var; <b>' + pest + '</b> daha pest. Sıra: ' + sira.join(', ') + '.'
  };
  q.geriEk = kulakGeri({ kaydir: q.dinle.kaydir, ekler: sira.map(function (ad) { return { etiket: ad, olaylar: olay(ad) }; }) });
  return q;
}
function kqInceCift(o) {
  const p = rastgele(K_INCE_CESNI), A = CESNI[p[0]], B = CESNI[p[1]];
  const hedef = rastgele([A, B]), sira = karistir([A, B]), bas = PERDE[A.yer].koma;
  const olay = function (x) { return kulakDiziOlay(kCesniKomalar(x, bas), 'ci', o.adim); };
  const i0 = sira.indexOf(hedef);
  const x = kKum(A), y = kKum(B);
  let j = 1; for (let i = 1; i < x.length; i++) if (x[i] !== y[i]) j = i;
  const q = {
    oge: null, kulak: true, tip: 'secim',
    soru: { metin: '👂 Hangisi ' + hedef.ad + '?', kucuk: true },
    alt: A.ad + ' ile ' + B.ad + ' aynı perdeden çalıyor; yalnız ' + (j + 1) + '. sesleri 1 koma farklı',
    dinle: kulakDinle(sira.map(function (c, i) { return { etiket: (i + 1) + '.', olaylar: olay(c) }; }), { karar: bas }),
    siklar: sira.map(function (c, i) { return { key: 'p' + i, metin: kSikNo(i) }; }), sirali: true,
    dogru: 'p' + i0, dogruMetin: kSikNo(i0),
    aciklama: '<b>' + A.ad + '</b> (' + formulGoster(A.formul) + ') ile <b>' + B.ad + '</b> (' + formulGoster(B.formul) + '): ' + (j + 1) + '. ses ' + kPerdeAdi(bas + x[j]) + ' / ' + kPerdeAdi(bas + y[j]) + '.'
  };
  q.geriEk = kulakGeri({ kaydir: q.dinle.kaydir, ekler: sira.map(function (c) { return { etiket: c.ad, olaylar: olay(c) }; }) });
  return q;
}
function kqInceTek(o) {
  const p = rastgele(K_INCE_CESNI), A = CESNI[p[0]], B = CESNI[p[1]], c = rastgele([A, B]), bas = PERDE[A.yer].koma;
  const ol = kulakDiziOlay(kCesniKomalar(c, bas), kYon(o), o.adim);
  return {
    oge: null, kulak: true, tip: 'secim',
    soru: { metin: '👂 ' + A.ad + ' ' + kSoruEki(A.ad) + ', ' + B.ad + ' ' + kSoruEki(B.ad) + '?', kucuk: true },
    alt: 'Tek çalım; fark 1 koma',
    dinle: kulakDinle([{ olaylar: ol }], { karar: bas }),
    siklar: [A, B].map(function (x) { return { key: x.id, metin: x.ad }; }), dogru: c.id, dogruMetin: c.ad,
    aciklama: '<b>' + A.ad + '</b>: ' + formulGoster(A.formul) + ' · <b>' + B.ad + '</b>: ' + formulGoster(B.formul)
  };
}

// ---------- MAKAM SORULARI ----------
function kMakamKomalar(m, bas) { const k0 = komaOf(m.dizi[0]); const b = bas == null ? k0 : bas; return m.dizi.map(function (n) { return komaOf(n) - k0 + b; }); }
function kMakamImza(m) { const k0 = komaOf(m.dizi[0]); return m.dizi.map(function (n) { return komaOf(n) - k0; }).join(','); }
function kMakamCeldir(m, havuz, n) {
  const im = kMakamImza(m);
  return karistir(havuz.filter(function (x) { return x !== m && x.dizi && kMakamImza(x) !== im; })).slice(0, Math.max(0, n));
}
function kMakamBas(m, o) {
  if (o.gocur !== 'rastgele') return komaOf(m.dizi[0]);
  const k0 = komaOf(m.dizi[0]), gen = komaOf(m.dizi[m.dizi.length - 1]) - k0;
  const L = PERDELER.filter(function (p) { return p && p.koma >= K_ALT && p.koma + gen <= K_UST && p.koma !== k0; });
  return L.length ? rastgele(L).koma : k0;
}
function kqMakamDizi(m, o) {
  const bas = kMakamBas(m, o), yon = kYon(o), kom = kMakamKomalar(m, bas), yerinde = bas === komaOf(m.dizi[0]);
  const ol = kulakDiziOlay(kom, yon, o.adim || 0.4);
  const dis = kMakamCeldir(m, o.havuz, (o.sik || 4) - 1);
  const q = {
    oge: null, kulak: true, tip: 'secim',
    soru: { metin: '👂 Hangi makamın dizisi?', kucuk: true },
    alt: kYonMetni(yon) + (yerinde ? '' : ' · dizi başka bir perdeden çalıyor'),
    dinle: kulakDinle([{ olaylar: ol }], { karar: bas }),
    siklar: [m].concat(dis).map(function (x) { return { key: x.id, metin: x.ad }; }), dogru: m.id, dogruMetin: m.ad,
    aciklama: makamAciklama(m) + (yerinde ? '' : '<br>Burada ' + (kPerdeAdi(bas) || 'başka bir') + ' perdesinden göçürülmüş olarak çalındı.')
  };
  q.geriEk = kulakGeri({ porte: yerinde ? makamDiziPorte(m) : null, kaydir: q.dinle.kaydir, dogru: { etiket: m.ad, olaylar: ol },
    secenek: dis.reduce(function (s, x) { s[x.id] = { etiket: x.ad, olaylar: kulakDiziOlay(kMakamKomalar(x, bas), yon, o.adim || 0.4) }; return s; }, {}) });
  return q;
}
function kqParca(m, o) {
  const alt = Math.random() < 0.5, c = alt ? m.altC : m.ustC;
  const kom = kMakamKomalar(m), ol = kulakDiziOlay(kom, 'c', o.adim || 0.4);
  const havuz = cesniler(D_TEMEL.concat(B_TEMEL, C_ILERI));
  const dis = kCeldir(c, kAyniBoy(c, havuz), (o.sik || 4) - 1, o.minUzak || 4);
  const q = {
    oge: null, kulak: true, tip: 'secim',
    soru: { metin: '👂 Bu dizinin ' + (alt ? 'alt (karardaki)' : 'üst') + ' çeşnisi hangisi?', kucuk: true },
    alt: 'Karar: ' + m.karar + ' · dizi çıkıcı çalıyor',
    dinle: kulakDinle([{ olaylar: ol }], { karar: kom[0] }),
    siklar: [c].concat(dis).map(function (x) { return { key: x.id, metin: x.ad }; }), dogru: c.id, dogruMetin: c.ad,
    aciklama: makamAciklama(m)
  };
  q.geriEk = kulakGeri({ porte: makamDiziPorte(m), kaydir: q.dinle.kaydir, dogru: { etiket: m.ad + ' dizisi', olaylar: ol },
    ekler: [{ etiket: c.ad, olaylar: kulakDiziOlay(kCesniKomalar(c, alt ? kom[0] : kom[m.gucluIdx]), 'c', o.adim) }] });
  return q;
}
function kqBirlesme(m, o) {
  const kom = kMakamKomalar(m), ol = kulakDiziOlay(kom, 'c', o.adim || 0.4);
  const dogruAd = m.ust[1];
  const adlar = benzersiz(kom.slice(1, kom.length - 1).map(kPerdeAdi).filter(Boolean));
  if (adlar.indexOf(dogruAd) < 0) return kqMakamDizi(m, o);
  const dis = karistir(adlar.filter(function (x) { return x !== dogruAd; })).slice(0, Math.max(2, (o.sik || 4) - 1));
  const q = {
    oge: null, kulak: true, tip: 'secim',
    soru: { metin: '👂 İki çeşni hangi perdede birleşiyor?', kucuk: true },
    alt: m.ad + ' dizisi · karar ' + m.karar,
    dinle: kulakDinle([{ olaylar: ol }], { karar: kom[0] }),
    siklar: [dogruAd].concat(dis).map(function (x) { return { key: x, metin: x }; }), dogru: dogruAd, dogruMetin: dogruAd,
    aciklama: makamAciklama(m)
  };
  q.geriEk = kulakGeri({ porte: makamDiziPorte(m), kaydir: q.dinle.kaydir, dogru: { etiket: m.ad + ' dizisi', olaylar: ol } });
  return q;
}
// Aynı kararlı, tek perdesi farklı makam çiftleri
function kTekPerdeMakam(havuz, minUzak) {
  const L = [];
  havuz.forEach(function (a) {
    havuz.forEach(function (b) {
      if (a.id >= b.id || !a.dizi || !b.dizi || a.karar !== b.karar || a.dizi.length !== b.dizi.length) return;
      const x = kMakamKomalar(a), y = kMakamKomalar(b), f = [];
      for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) f.push(i);
      if (f.length === 1 && Math.abs(x[f[0]] - y[f[0]]) >= minUzak) L.push([a, b, f[0]]);
    });
  });
  return L;
}
function kqTekPerdeMakam(m, o) {
  const tum = kTekPerdeMakam(o.havuz, o.minUzak || 4);
  let C = tum.filter(function (p) { return p[0] === m || p[1] === m; });
  if (!C.length) C = tum;
  if (!C.length) return kqMakamDizi(m, o);
  const p = rastgele(C), A = p[0], B = p[1], j = p[2], hedef = rastgele([A, B]), sira = karistir([A, B]);
  const olay = function (x) { return kulakDiziOlay(kMakamKomalar(x), 'ci', o.adim || 0.38); };
  const i0 = sira.indexOf(hedef);
  const q = {
    oge: null, kulak: true, tip: 'secim',
    soru: { metin: '👂 Hangisi ' + hedef.ad + '?', kucuk: true },
    alt: A.ad + ' ile ' + B.ad + ' dizileri aynı perdeden çalıyor; tek perdeleri farklı',
    dinle: kulakDinle(sira.map(function (x, i) { return { etiket: (i + 1) + '.', olaylar: olay(x) }; }), { karar: komaOf(A.dizi[0]) }),
    siklar: sira.map(function (x, i) { return { key: 'p' + i, metin: kSikNo(i) }; }), sirali: true, dogru: 'p' + i0, dogruMetin: kSikNo(i0),
    aciklama: '<b>' + A.ad + '</b> ile <b>' + B.ad + '</b> dizileri yalnız ' + (j + 1) + '. seste ayrılır: ' + kPerdeAdi(kMakamKomalar(A)[j]) + ' / ' + kPerdeAdi(kMakamKomalar(B)[j]) + '.'
  };
  q.geriEk = kulakGeri({ kaydir: q.dinle.kaydir, ekler: sira.map(function (x) { return { etiket: x.ad, olaylar: olay(x) }; }) });
  return q;
}
const K_USUL_AD = { sofyan: 'Sofyan', duyek: 'Düyek', semai: 'Semai', senginsemai: 'Sengin Semai', turkaksagi: 'Türk Aksağı', devrihindi: 'Devr-i Hindî', musemmen: 'Müsemmen', devrikebir: 'Devr-i Kebîr' };
function kSeyirKaynak(p) {
  const x = p.kaynak.split('--'), form = x[1] === 'seyir' ? 'seyir örneği' : x[1], usul = K_USUL_AD[x[2]] || x[2];
  return p.kim + ', ' + usul + ' usulünde ' + form;
}
function kqSeyir(m, o) {
  const L = (typeof SEYIR_PARCALARI !== 'undefined' && SEYIR_PARCALARI[m.id]) || [];
  if (!L.length) return kqMakamDizi(m, o);
  const p = rastgele(L), son = o.minUzak === 1 ? Math.random() < 0.6 : true;
  const ol = kulakSeyirOlay(son ? p.son : p.bas);
  const dis = kMakamCeldir(m, o.havuz, (o.sik || 4) - 1);
  const q = {
    oge: null, kulak: true, tip: 'secim',
    soru: { metin: '👂 Bu ezgi hangi makamda?', kucuk: true },
    alt: 'Bir seyir örneğinin ' + (son ? 'son' : 'ilk') + ' cümlesi' + (son ? ' (kararda biter)' : ''),
    dinle: kulakDinle([{ olaylar: ol }], { karar: komaOf(m.dizi[0]) }),
    siklar: [m].concat(dis).map(function (x) { return { key: x.id, metin: x.ad }; }), dogru: m.id, dogruMetin: m.ad,
    aciklama: makamAciklama(m) + '<br><span class="kucukNot">Ezgi: SymbTr, ' + kSeyirKaynak(p) + ', ' + (son ? 'son' : 'ilk') + ' cümle · CC BY-NC-SA 4.0</span>'
  };
  q.geriEk = kulakGeri({ porte: makamDiziPorte(m), kaydir: q.dinle.kaydir, dogru: { etiket: m.ad + ' dizisi', olaylar: kulakDiziOlay(kMakamKomalar(m), 'ci', 0.38) },
    secenek: dis.reduce(function (s, x) { s[x.id] = { etiket: x.ad + ' dizisi', olaylar: kulakDiziOlay(kMakamKomalar(x), 'ci', 0.38) }; return s; }, {}) });
  return q;
}

// ---------- ÜRETİCİ ----------
const K_TIPLER = {
  tani: { tur: 'c', f: kqTani }, iste: { tur: 'c', f: kqIste }, ayni: { tur: 'c', f: kqAyni }, farkli: { tur: 'c', f: kqFarkli },
  hangiSes: { tur: 'c', f: kqHangiSes }, hata: { tur: 'c', f: kqHata }, eksik: { tur: 'c', f: kqEksik }, formul: { tur: 'c', f: kqFormul },
  dikte: { tur: 'c', f: kqDikte }, hangiPerde: { tur: 'c', f: kqHangiPerde },
  dinlePorte: { tur: 'c', f: kqDinlePorte }, dinleAd: { tur: 'c', f: kqDinleAd }, dinleEslesme: { tur: 'c', f: kqDinleEslesme },
  dinleYon: { tur: 'c', f: kqDinleYon }, dinleBoy: { tur: 'c', f: kqDinleBoy },
  tekPerde: { tur: 'x', f: kqTekPerde }, inceCift: { tur: 'x', f: kqInceCift }, inceTek: { tur: 'x', f: kqInceTek },
  makamDizi: { tur: 'm', f: kqMakamDizi }, parca: { tur: 'm', f: kqParca }, birlesme: { tur: 'm', f: kqBirlesme },
  tekPerdeMakam: { tur: 'm', f: kqTekPerdeMakam }, seyir: { tur: 'm', f: kqSeyir }
};
// o: { havuz: [çeşni ya da makam kimliği], yeni: [kimlik], sik, minUzak, gocur, yon, adim, zorTipler }
// Sonsuz Meşk zor katlarda (şık 5+) 1 komalık çeldiriciler, karışık yön ve göçürme açılır.
function kUretici(tipler, o) {
  return function (n, sikSay) {
    const zor = (sikSay || 0) >= 5;
    const oo = Object.assign({}, o);
    if (zor) {
      oo.sik = Math.max(o.sik || 4, sikSay); oo.minUzak = 1; oo.yon = 'k';
      if (o.gocurZor) oo.gocur = o.gocurZor;
    }
    const makamMi = tipler.some(function (t) { return K_TIPLER[t].tur === 'm'; });
    const havuzId = o.havuz || [];
    const makamHavuz = makamMi ? makamlar(o.makamHavuz || havuzId).filter(function (m) { return m && m.dizi; }) : [];
    const cesniHavuz = makamMi ? [] : cesniler(havuzId);
    const yeni = o.yeni ? (makamMi ? makamlar(o.yeni) : cesniler(o.yeni)) : [];
    const T = zor && o.zorTipler ? tipler.concat(o.zorTipler) : tipler;
    const L = [];
    let onceki = null;
    for (let i = 0; i < n; i++) {
      const tip = T[i % T.length], K = K_TIPLER[tip];
      const havuz = K.tur === 'm' ? makamHavuz : cesniHavuz;
      oo.havuz = havuz;
      let x = null;
      if (K.tur !== 'x') {
        for (let d = 0; d < 10; d++) { x = rastgele(yeni.length && Math.random() < (o.yeniOran || 0.6) ? yeni : havuz); if (x !== onceki) break; }
        onceki = x;
      }
      let q = null;
      try { q = K.tur === 'x' ? K.f(oo) : K.f(x, oo); } catch (e) { console.warn('Kulak sorusu üretilemedi: ' + tip, e); }
      if (!q && K.tur === 'c' && x) { try { q = kqTani(x, oo); } catch (e) {} }
      if (q) L.push(q);
    }
    return karistir(L);
  };
}

// ---------- MEŞK YOLU'NA SEVİYELER ----------
// Her ünitenin sonuna (finalden önce) eklenir. yeni: ünite önceden bitmişse isteğe bağlı; kulak: Ayarlar'da sesli sorular kapalıysa isteğe bağlı.
const MK_ILK4 = ['cargah', 'rast', 'ussak', 'kurdi'];
const MK_ILK6 = MK_ILK4.concat(['huseyni', 'buselik']);
(function () {
  const S = function (id, ad, uret, n) { return { id: id, tip: 'seviye', ad: ad, soruSay: n || 8, uret: uret, yeni: true, kulak: true }; };
  const ince = ['inceCift', 'tekPerde'];
  // 3.1.1: Dinleyerek tanış (basit): "Porte ve ad" seviyesinden hemen sonra, çok farklı çeşnilerle
  const basit = ['dinlePorte', 'dinleEslesme', 'dinleAd'];
  ykEkle(CESNI_UNITELER, 'db1', [S('db1-dinle', '👂 Dinleyerek tanış', kUretici(['dinlePorte', 'dinleYon', 'dinleEslesme', 'dinleAd', 'dinlePorte', 'dinleEslesme'], { havuz: D_TB, sik: 3, minUzak: 6 }), 6)], 'db1-2');
  ykEkle(CESNI_UNITELER, 'db2', [S('db2-dinle', '👂 Dinleyerek tanış', kUretici(basit, { havuz: D_TB.concat(D_KS), yeni: D_KS, yeniOran: 0.75, sik: 3, minUzak: 6 }), 6)], 'db2-2');
  ykEkle(CESNI_UNITELER, 'db3', [S('db3-dinle', '👂 Dinleyerek tanış', kUretici(basit, { havuz: D_TEMEL, yeni: ['d-hicaz'], yeniOran: 0.6, sik: 3, minUzak: 6 }), 6)], 'db3-2');
  ykEkle(CESNI_UNITELER, 'db4', [S('db4-dinle', '👂 Dinleyerek tanış', kUretici(['dinleBoy', 'dinlePorte', 'dinleEslesme', 'dinleAd'], { havuz: B_TEMEL.concat(D_TEMEL), yeni: B_TEMEL, yeniOran: 0.75, sik: 3, minUzak: 6 }), 6)], 'db4-2');
  ykEkle(CESNI_UNITELER, 'db5', [S('db5-dinle', '👂 Dinleyerek tanış', kUretici(basit, { havuz: C_ILERI, sik: 3, minUzak: 6 }), 6)], 'db5-2');
  // Dörtlü-Beşli: zıt çiftlerden benzerlere; 1 komalık çiftler yalnız İnce ayrım seviyesinde
  ykEkle(CESNI_UNITELER, 'db1', [S('db1-kulak', '👂 Kulaktan: üç dörtlü', kUretici(['tani', 'tani', 'ayni', 'iste'], { havuz: D_TB, sik: 3, minUzak: 4, gocur: 'yok', yon: 'ci', zorTipler: ['farkli'] }))]);
  ykEkle(CESNI_UNITELER, 'db2', [S('db2-kulak', '👂 Kulaktan: Rast ve Uşşak', kUretici(['tani', 'iste', 'hangiSes', 'tani'], { havuz: D_TB.concat(D_KS), yeni: D_KS, sik: 4, minUzak: 4, gocur: 'yok', yon: 'ci', zorTipler: ['inceTek'] }))]);
  ykEkle(CESNI_UNITELER, 'db3', [S('db3-kulak', '👂 Kulaktan: altı dörtlü', kUretici(['tani', 'farkli', 'hangiSes', 'eksik'], { havuz: D_TEMEL, yeni: ['d-hicaz'], sik: 4, minUzak: 4, gocur: 'yok', yon: 'ci', gocurZor: 'makam' }))]);
  ykEkle(CESNI_UNITELER, 'db4', [
    S('db4-kulak', '👂 Kulaktan: beşliler', kUretici(['tani', 'iste', 'farkli', 'eksik'], { havuz: B_TEMEL, sik: 4, minUzak: 4, gocur: 'yok', yon: 'k', gocurZor: 'makam' })),
    S('db4-yaz', '👂 Duyduğunu yaz', kUretici(['formul', 'dikte', 'hata'], { havuz: D_TEMEL.concat(B_TEMEL), sik: 4, minUzak: 4, gocur: 'yok', yon: 'c' }), 6)
  ]);
  ykEkle(CESNI_UNITELER, 'db5', [S('db5-kulak', '👂 Kulaktan: ileri çeşniler', kUretici(['tani', 'farkli', 'hangiSes', 'tani'], { havuz: C_ILERI, sik: 4, minUzak: 4, gocur: 'yok', yon: 'ci', gocurZor: 'makam' }))]);
  ykEkle(CESNI_UNITELER, 'db6', [
    S('db6-kulak', '👂 Kulaktan: dizide çeşni', kUretici(['parca', 'birlesme'], { havuz: MK_ILK10, sik: 4, minUzak: 4 })),
    S('db6-ince', '👂 İnce ayrım: 1 koma', kUretici(ince, { havuz: [], sik: 2, minUzak: 1, zorTipler: ['inceTek'] }))
  ]);
  // Göçürme: önce makamdaki yerleri, sonra rastgele perde, sonra perdeyi bulma ve yazma
  ykEkle(GOCURME_UNITELER, 'gc1', [S('gc1-kulak', '👂 Kulaktan: göçürülmüş dörtlüler', kUretici(['tani', 'ayni', 'tani', 'farkli'], { havuz: D_TEMEL, sik: 4, minUzak: 4, gocur: 'makam', yon: 'ci', gocurZor: 'rastgele' }))]);
  ykEkle(GOCURME_UNITELER, 'gc2', [S('gc2-kulak', '👂 Kulaktan: göçürülmüş beşliler', kUretici(['tani', 'farkli', 'ayni'], { havuz: B_TEMEL, sik: 4, minUzak: 4, gocur: 'rastgele', yon: 'ci' }))]);
  ykEkle(GOCURME_UNITELER, 'gc3', [S('gc3-kulak', '👂 Kulaktan: göçürülmüş makam dizileri', kUretici(['makamDizi'], { havuz: MK_ILK10, sik: 4, gocur: 'rastgele', yon: 'ci' }), 6)]);
  ykEkle(GOCURME_UNITELER, 'gc4', [S('gc4-kulak', '👂 Hangi perdede? Duy ve yaz', kUretici(['hangiPerde', 'dikte'], { havuz: D_TEMEL.concat(B_TEMEL), sik: 4, minUzak: 4, gocur: 'rastgele' }), 6)]);
  // Makam: dizi → tek perde farkı → parçalar → birleşme → seyir (SymbTr)
  ykEkle(MAKAM_UNITELER, 'mk1', [S('mk1-kulak', '👂 Kulaktan: makam dizisi', kUretici(['makamDizi'], { havuz: MK_ILK4, sik: 4, gocur: 'yok', yon: 'ci', gocurZor: 'rastgele' }))]);
  ykEkle(MAKAM_UNITELER, 'mk2', [S('mk2-kulak', '👂 Kulaktan: tek perde, başka makam', kUretici(['makamDizi', 'tekPerdeMakam'], { havuz: MK_ILK6, yeni: ['huseyni', 'buselik'], sik: 4, minUzak: 4, gocur: 'yok', yon: 'ci' }))]);
  ykEkle(MAKAM_UNITELER, 'mk3', [S('mk3-kulak', '👂 Kulaktan: Hicaz ailesi', kUretici(['makamDizi', 'parca', 'makamDizi', 'tekPerdeMakam'], { havuz: MK_ILK10, yeni: ['hicaz', 'humayun', 'uzzal', 'zirguleli'], sik: 4, minUzak: 4, gocur: 'yok', yon: 'ci' }))]);
  ykEkle(MAKAM_UNITELER, 'mk4', [S('mk4-kulak', '👂 Kulaktan: Karcığar ve Sûzinâk', kUretici(['makamDizi', 'birlesme'], { havuz: MK_TUM12, yeni: ['karcigar', 'suzinak'], sik: 4, minUzak: 4, gocur: 'yok', yon: 'ci', gocurZor: 'rastgele' }))]);
  ykEkle(MAKAM_UNITELER, 'mk5', [S('mk5-kulak', '👂 Seyirden makamı tanı', kUretici(['seyir'], { havuz: MK_TUM12, sik: 4 }))]);
  ykEkle(MAKAM_UNITELER, 'mk6', [S('mk6-kulak', '👂 Seyirden: yeni makamlar', kUretici(['seyir', 'seyir', 'makamDizi'], { havuz: MK_YENI7, sik: 4, gocur: 'yok', yon: 'ci' }))]);
})();

// ---------- ARAÇLAR → KULAK EĞİTİMİ ----------
const K_ZORLUK = [null,
  { ad: 'Kolay', sik: 3, minUzak: 6, yon: 'ci' },
  { ad: 'Orta', sik: 4, minUzak: 4, yon: 'ci' },
  { ad: 'Zor', sik: 5, minUzak: 4, yon: 'k' },
  { ad: 'Usta', sik: 6, minUzak: 1, yon: 'k' }];
const KA_HAVUZ = {
  cesni: [['dortlu', 'Temel dörtlüler', D_TEMEL], ['besli', 'Temel beşliler', B_TEMEL], ['temel', 'Temel dörtlü ve beşliler', D_TEMEL.concat(B_TEMEL)], ['ileri', 'İleri çeşniler', C_ILERI], ['hepsi', 'Hepsi', D_TEMEL.concat(B_TEMEL, C_ILERI)]],
  makam: [['ilk10', 'İlk 10 makam', MK_ILK10], ['tum12', '12 makam', MK_TUM12], ['yeni7', 'Yeni 7 makam', MK_YENI7], ['hepsi', 'Bütün makamlar', MK_TUM12.concat(MK_YENI7)]],
  gocurme: [['dortlu', 'Temel dörtlüler', D_TEMEL], ['besli', 'Temel beşliler', B_TEMEL], ['temel', 'Temel dörtlü ve beşliler', D_TEMEL.concat(B_TEMEL)], ['makam', 'Makam dizileri', MK_ILK10]]
};
const KA_TUR = {
  cesni: [['karisik', 'Karışık', ['tani', 'iste', 'ayni', 'farkli', 'hangiSes', 'eksik']], ['basit', 'Basit: dinle ve seç', ['dinlePorte', 'dinleEslesme', 'dinleAd']], ['tani', 'Hangisi? (tanı)', ['tani']], ['iste', 'İsteneni bul', ['iste']], ['ayni', 'Aynı mı, farklı mı?', ['ayni']],
    ['farkli', 'Farklı olanı bul', ['farkli']], ['hangiSes', 'Hangi ses değişti?', ['hangiSes']], ['hata', 'Hatayı bul (porte)', ['hata']], ['eksik', 'Eksik perde', ['eksik']],
    ['formul', 'Aralıkları diz', ['formul']], ['dikte', 'Porteye yaz', ['dikte']], ['ince', 'İnce ayrım (1 koma)', ['inceCift', 'tekPerde', 'inceTek']]],
  makam: [['karisik', 'Karışık', ['makamDizi', 'seyir', 'parca', 'birlesme', 'tekPerdeMakam']], ['makamDizi', 'Diziden makam', ['makamDizi']], ['seyir', 'Seyirden makam', ['seyir']],
    ['parca', 'Dizinin çeşnileri', ['parca']], ['birlesme', 'Birleşme yeri', ['birlesme']], ['tekPerdeMakam', 'Tek perde farkı', ['tekPerdeMakam']]],
  gocurme: [['karisik', 'Karışık', ['tani', 'ayni', 'farkli', 'hangiPerde']], ['tani', 'Göçürülmüşü tanı', ['tani']], ['ayni', 'Aynı mı?', ['ayni']], ['farkli', 'Farklı olanı bul', ['farkli']],
    ['hangiPerde', 'Hangi perdeden?', ['hangiPerde']], ['dikte', 'Göçürülmüşü yaz', ['dikte']]]
};
let KA = null;   // araç durumu (oturum içinde)
function kaDurum() {
  if (!KA) KA = { sekme: 'cesni', cesni: 'd-ussak', karsi: 'd-buselik', makam: 'ussak', seyirNo: 0, gcCesni: 'd-hicaz', gcPerde: 'Neva', yavas: false,
    ayar: { cesni: { havuz: 'dortlu', tur: 'karisik', zor: 'oto' }, makam: { havuz: 'ilk10', tur: 'karisik', zor: 'oto' }, gocurme: { havuz: 'dortlu', tur: 'karisik', zor: 'oto', gocur: 'makam' } } };
  return KA;
}
function kaKayit() { DURUM.kulak = DURUM.kulak || { zor: {} }; DURUM.kulak.zor = DURUM.kulak.zor || {}; return DURUM.kulak; }
function kaSec(secenekler, deger, degisince, etiket) {
  const s = h('select', { class: 'mkSec', 'aria-label': etiket || '' });
  secenekler.forEach(function (x) { s.appendChild(h('option', { value: x[0], selected: x[0] === deger }, x[1])); });
  s.onchange = function () { degisince(s.value); };
  return s;
}
function kaDugme(metin, olayF, kaydirF) {
  const b = h('button', { class: 'cip kaCal', type: 'button' }, metin);
  b.onclick = function () {
    const ol = olayF();
    document.querySelectorAll('.kaCal.caliyor').forEach(function (x) { x.classList.remove('caliyor'); });
    b.classList.add('caliyor');
    const tum = []; ol.forEach(function (e) { tum.push(e.k); });
    const a = kaydirF ? kaydirF(tum) : kulakAhenk(tum);
    kulakCal(ol, { kaydir: a.kaydir, bitince: function () { b.classList.remove('caliyor'); } });
    const not = b.closest('.kaKart') && b.closest('.kaKart').querySelector('.kaAhenk');
    if (not) not.textContent = a.ad + ' ahenginde çalıyor';
  };
  return b;
}
function kulakAraci() {
  kulakHazirla();
  const A = kaDurum();
  const govde = h('div', { class: 'kulakArac' });
  const sekme = h('div', { class: 'segment' });
  [['cesni', 'Dörtlü-Beşli'], ['makam', 'Makam'], ['gocurme', 'Göçürme']].forEach(function (x) {
    sekme.appendChild(h('button', { type: 'button', class: A.sekme === x[0] ? 'aktif' : '', onclick: function () { kulakDur(); A.sekme = x[0]; kulakAraci(); } }, x[1]));
  });
  govde.appendChild(sekme);
  if (A.sekme === 'cesni') kaCesniCiz(govde, A);
  else if (A.sekme === 'makam') kaMakamCiz(govde, A);
  else kaGocurmeCiz(govde, A);
  govde.appendChild(kaAntrenmanCiz(A.sekme));
  govde.appendChild(h('p', { class: 'kucukNot' }, 'Sesler Kız ahenginde çalar: Rast perdesi La sesinden duyulur. Çok pest kalan ezgiler Sipürde ya da Bolâhenk’te çalınır. Perdeler 53 komalı AEU sistemine göredir. Seyir örnekleri: SymbTr derlemi (CC BY-NC-SA 4.0).'));
  aracModal('👂 Kulak eğitimi', govde);
  const kutu = $('kutu'); if (kutu) kutu.scrollTop = 0;
  MODAL_KAPANINCA = function () { kulakDur(); };
}
function kaHiz(A) { return A.yavas ? 0.66 : KULAK_ADIM; }
function kaCesniCiz(g, A) {
  const c = CESNI[A.cesni] || CESNI['d-ussak'];
  const grup = [['Temel dörtlüler', D_TEMEL], ['Temel beşliler', B_TEMEL], ['İleri çeşniler', C_ILERI]];
  const izgara = h('div', { class: 'kaIzgara' });
  grup.forEach(function (gr) {
    izgara.appendChild(h('div', { class: 'kaGrupAd' }, gr[0]));
    const s = h('div', { class: 'pbIzgara' });
    cesniler(gr[1]).forEach(function (x) { s.appendChild(h('button', { type: 'button', class: 'cip' + (x === c ? ' aktif' : ''), onclick: function () { kulakDur(); A.cesni = x.id; kulakAraci(); } }, x.ad)); });
    izgara.appendChild(s);
  });
  const kom = function (x) { return kCesniKomalar(x); };
  const karsi = CESNI[A.karsi] && A.karsi !== c.id ? CESNI[A.karsi] : kCeldir(c, cesniler(D_TEMEL.concat(B_TEMEL, C_ILERI)), 1, 1)[0];
  A.karsi = karsi.id;
  const kart = h('div', { class: 'kaKart' },
    h('div', { class: 'kaBaslik' }, h('b', null, c.ad), h('span', null, formulGoster(c.formul) + ' · yeri ' + c.yer)),
    h('div', { class: 'kartPorte' }, porteSVG(kPorte(c.notalar, c, PERDE[c.yer]))),
    h('div', { class: 'kulakSatir' },
      kaDugme('▶ Çıkış-iniş', function () { return kulakDiziOlay(kom(c), 'ci', kaHiz(A)); }),
      kaDugme('↗ Çıkış', function () { return kulakDiziOlay(kom(c), 'c', kaHiz(A)); }),
      kaDugme('↘ İniş', function () { return kulakDiziOlay(kom(c), 'i', kaHiz(A)); }),
      kaDugme('🎯 Karar', function () { return [{ k: kom(c)[0], t: 0, d: 1.2 }]; })),
    kaYavasAnahtar(A),
    h('div', { class: 'kaKarsi' },
      h('span', null, 'Karşılaştır:'),
      kaSec(D_TEMEL.concat(B_TEMEL, C_ILERI).filter(function (id) { return id !== c.id && CESNI[id].tur === c.tur; }).map(function (id) { return [id, CESNI[id].ad]; }), karsi.id, function (v) { A.karsi = v; }, 'Karşılaştırılacak çeşni'),
      kaDugme('▶ Önce ' + c.ad + ', sonra öteki', function () {
        const b = CESNI[A.karsi]; const bas = kom(c)[0];
        return kulakArdArda([kulakDiziOlay(kCesniKomalar(c, bas), 'ci', kaHiz(A)), kulakDiziOlay(kCesniKomalar(b, bas), 'ci', kaHiz(A))], 0.9);
      })),
    h('p', { class: 'kucukNot kaAhenk' }, 'Karşılaştırmada ikisi de ' + c.yer + ' perdesinden çalar; farkı aralıklar yapar.'));
  g.appendChild(kart);
  g.appendChild(izgara);
}
function kaYavasAnahtar(A) {
  return h('label', { class: 'anahtar kaYavas' },
    h('input', { type: 'checkbox', checked: !!A.yavas, onchange: function (e) { A.yavas = e.target.checked; } }),
    h('span', null, '🐢 Yavaş çal'));
}
function kaMakamCiz(g, A) {
  const L = MAKAMLAR.filter(function (m) { return m.dizi; });
  const m = MAKAM[A.makam] && MAKAM[A.makam].dizi ? MAKAM[A.makam] : MAKAM.ussak;
  const parcalar = (typeof SEYIR_PARCALARI !== 'undefined' && SEYIR_PARCALARI[m.id]) || [];
  const p = parcalar.length ? parcalar[A.seyirNo % parcalar.length] : null;
  const kom = kMakamKomalar(m);
  const kart = h('div', { class: 'kaKart' },
    h('div', { class: 'kaBaslik' }, h('b', null, m.ad), h('span', null, m.altAd + ' + ' + m.ustAd)),
    h('div', { class: 'kartPorte' }, porteSVG(makamDiziPorte(m))),
    h('div', { class: 'kulakSatir' },
      kaDugme('▶ Dizi', function () { return kulakDiziOlay(kom, 'ci', A.yavas ? 0.6 : 0.4); }),
      kaDugme('🎯 Karar', function () { return [{ k: kom[0], t: 0, d: 1.2 }]; }),
      p ? kaDugme('🎼 Seyir: son cümle', function () { return kulakSeyirOlay(p.son, A.yavas ? 0.75 : 1); }) : null,
      p ? kaDugme('🎼 Seyir: ilk cümle', function () { return kulakSeyirOlay(p.bas, A.yavas ? 0.75 : 1); }) : null),
    kaYavasAnahtar(A),
    p ? h('div', { class: 'kaKaynak' },
      h('span', { class: 'kucukNot' }, 'Örnek ' + (A.seyirNo % parcalar.length + 1) + '/' + parcalar.length + ': ' + kSeyirKaynak(p) + ' (SymbTr)'),
      parcalar.length > 1 ? h('button', { type: 'button', class: 'cip', onclick: function () { kulakDur(); A.seyirNo++; kulakAraci(); } }, 'Başka örnek') : null) : null,
    h('p', { class: 'kucukNot kaAhenk' }, 'Karar: ' + m.karar + ' · Güçlü: ' + m.guclu + (m.seyir ? ' · Seyir: ' + m.seyir : '')));
  g.appendChild(kart);
  const s = h('div', { class: 'pbIzgara' });
  L.forEach(function (x) { s.appendChild(h('button', { type: 'button', class: 'cip' + (x === m ? ' aktif' : ''), onclick: function () { kulakDur(); A.makam = x.id; A.seyirNo = 0; kulakAraci(); } }, x.ad)); });
  g.appendChild(s);
}
function kaGocurmeCiz(g, A) {
  const tumC = cesniler(D_TEMEL.concat(B_TEMEL, C_ILERI));
  const c = CESNI[A.gcCesni] || CESNI['d-hicaz'];
  const tepe = kKum(c)[c.araliklar.length];
  const perdeler = PERDELER.filter(function (p) { return p && p.koma >= K_ALT && p.koma + tepe <= K_UST; });
  let P = PERDE[A.gcPerde];
  if (!P || perdeler.indexOf(P) < 0) { P = PERDE[c.yer]; A.gcPerde = P.ad; }
  const notalar = kNotalar(c, P);
  const kart = h('div', { class: 'kaKart' },
    h('div', { class: 'mkSecSatir' },
      kaSec(tumC.map(function (x) { return [x.id, x.ad]; }), c.id, function (v) { A.gcCesni = v; kulakDur(); kulakAraci(); }, 'Çeşni'),
      kaSec(perdeler.map(function (p) { return [p.ad, p.ad + (p.ad === c.yer ? ' (yeri)' : (p.ad === c.yer || gocurPerde(c.araliklar, p) ? '' : ' ·'))]; }), P.ad, function (v) { A.gcPerde = v; kulakDur(); kulakAraci(); }, 'Başlangıç perdesi')),
    h('div', { class: 'kaBaslik' }, h('b', null, c.ad + ' · ' + P.ad + ' perdesinden'), h('span', null, formulGoster(c.formul))),
    notalar ? h('div', { class: 'kartPorte' }, porteSVG(kPorte(notalar, c, P))) : h('p', { class: 'kucukNot' }, 'Bu göçürme AEU’nun 24 perdesiyle yazılamıyor (listede · ile işaretli); ses yine de 53 komayla doğru çalar.'),
    h('div', { class: 'kulakSatir' },
      kaDugme('▶ ' + c.yer + ' (yeri)', function () { return kulakDiziOlay(kCesniKomalar(c), 'ci', kaHiz(A)); }),
      kaDugme('▶ ' + P.ad, function () { return kulakDiziOlay(kCesniKomalar(c, P.koma), 'ci', kaHiz(A)); }),
      kaDugme('▶ Önce yeri, sonra ' + P.ad, function () { return kulakArdArda([kulakDiziOlay(kCesniKomalar(c), 'ci', kaHiz(A)), kulakDiziOlay(kCesniKomalar(c, P.koma), 'ci', kaHiz(A))], 0.9); }),
      kaDugme('▶ Makamdaki yerleri', function () {
        return kulakArdArda(kCesniYerleri(c).slice(0, 4).map(function (ad) { return kulakDiziOlay(kCesniKomalar(c, PERDE[ad].koma), 'c', kaHiz(A)); }), 0.7);
      })),
    kaYavasAnahtar(A),
    h('p', { class: 'kucukNot kaAhenk' }, 'Makamlarda geçtiği yerler: ' + kCesniYerleri(c).join(', ') + '. Göçürülünce perdeler değişir, aralıklar aynı kalır.'));
  g.appendChild(kart);
}
function kaOtoZor(anahtar) { const k = kaKayit(); return Math.min(4, Math.max(1, k.zor[anahtar] || 1)); }
function kaAntrenmanCiz(sekme) {
  const A = kaDurum(), S = A.ayar[sekme];
  const kutu = h('div', { class: 'kaAntrenman' }, h('h3', null, '🎯 Antrenman'));
  const anahtar = sekme + ':' + S.havuz + ':' + S.tur;
  const satir = h('div', { class: 'kaAyarlar' },
    kaSec(KA_HAVUZ[sekme].map(function (x) { return [x[0], x[1]]; }), S.havuz, function (v) { S.havuz = v; kulakAraci(); }, 'Havuz'),
    kaSec(KA_TUR[sekme].map(function (x) { return [x[0], x[1]]; }), S.tur, function (v) { S.tur = v; kulakAraci(); }, 'Soru türü'),
    kaSec([['oto', 'Zorluk: otomatik (' + K_ZORLUK[kaOtoZor(anahtar)].ad + ')'], ['1', 'Kolay'], ['2', 'Orta'], ['3', 'Zor'], ['4', 'Usta (1 koma)']], S.zor, function (v) { S.zor = v; }, 'Zorluk'),
    sekme === 'gocurme' ? kaSec([['makam', 'Makamdaki yerleri'], ['rastgele', 'Rastgele perde']], S.gocur, function (v) { S.gocur = v; }, 'Göçürme') : null);
  kutu.appendChild(satir);
  kutu.appendChild(dugme('▶ 10 soruluk tur', function () { kulakAntrenman(sekme); }));
  kutu.appendChild(h('p', { class: 'kucukNot' }, 'Otomatik zorlukta 10 sorunun 9’unu bilirsen bir üst düzeye çıkarsın, 6 ya da daha azında bir alta inersin. Dinleme sınırsız.'));
  return kutu;
}
function kulakAntrenman(sekme) {
  const A = kaDurum(), S = A.ayar[sekme];
  const anahtar = sekme + ':' + S.havuz + ':' + S.tur;
  const z = S.zor === 'oto' ? kaOtoZor(anahtar) : +S.zor;
  const Z = K_ZORLUK[z];
  const havuz = KA_HAVUZ[sekme].find(function (x) { return x[0] === S.havuz; })[2];
  let tipler = KA_TUR[sekme].find(function (x) { return x[0] === S.tur; })[2];
  const makamMi = sekme === 'makam' || (sekme === 'gocurme' && S.havuz === 'makam');
  if (sekme === 'gocurme' && S.havuz === 'makam') tipler = ['makamDizi'];
  let gocur = 'yok';
  if (sekme === 'gocurme') gocur = S.gocur === 'rastgele' || z >= 4 ? 'rastgele' : 'makam';
  else if (sekme === 'cesni') gocur = z >= 4 ? 'makam' : 'yok';
  else gocur = z >= 4 ? 'rastgele' : 'yok';
  const o = { havuz: havuz, sik: Z.sik, minUzak: Z.minUzak, yon: Z.yon, gocur: gocur, adim: A.yavas ? 0.62 : null };
  if (makamMi) o.makamHavuz = havuz;
  // İnce ayrım dışındaki türlerde 1 komalık çiftler yalnız Usta düzeyinde
  const uret = kUretici(tipler, o);
  const sorular = uret(10);
  modalKapat();
  const ad = KA_TUR[sekme].find(function (x) { return x[0] === S.tur; })[1];
  turBaslat({
    tip: 'antrenman', sorular: sorular, kalp: 0, joker: false, kayit: false, etiket: '👂 Kulak', ipucuAcik: false,
    bitince: function (r) {
      let not = 'Zorluk: ' + Z.ad + '.';
      if (S.zor === 'oto') {
        const k = kaKayit();
        let y = z;
        if (r.dogru >= 9) y = Math.min(4, z + 1); else if (r.dogru <= 6) y = Math.max(1, z - 1);
        k.zor[anahtar] = y; kaydet();
        not = y > z ? '⬆️ Bir üst düzeye çıktın: ' + K_ZORLUK[y].ad + '.' : y < z ? '⬇️ Bir alt düzeyde devam: ' + K_ZORLUK[y].ad + '.' : 'Düzeyin: ' + Z.ad + '.';
      }
      modalAc(h('div', { class: 'sonuc' },
        h('div', { class: 'sonucMaskot', html: bulbulSVG('mutlu') }),
        h('h2', null, '👂 ' + ad),
        h('p', null, r.dogru + ' / ' + r.toplam + ' doğru'),
        h('p', { class: 'kucukNot' }, not),
        dugme('Bir tur daha', function () { modalKapat(); kulakAntrenman(sekme); }),
        dugme('Kulak eğitimine dön', function () { modalKapat(); turdanCik(false); kulakAraci(); }, 'ikincil'),
        dugme('Kapat', function () { modalKapat(); turdanCik(false); }, 'gri')), { kapatilamaz: true });
    }
  });
}
