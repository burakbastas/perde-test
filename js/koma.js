// =====================================================
// KOMA: aralıklar, simge harfleri, değiştirme işaretleri
// =====================================================
'use strict';

const KM_VERI = [
  { ad: 'Koma',           kod: 'F',         koma: [1],      isaret: 'k'  },
  { ad: 'Bakiye',         kod: 'B',         koma: [4],      isaret: 'bk' },
  { ad: 'Küçük Mücenneb', kod: 'S',         koma: [5],      isaret: 'km' },
  { ad: 'Büyük Mücenneb', kod: 'K',         koma: [8],      isaret: 'bm' },
  { ad: 'Tanini',         kod: 'T',         koma: [9],      cift: true   },
  { ad: 'Artık İkili',    kod: 'A12 - A13', koma: [12, 13]               }
];
KM_VERI.forEach(function (v, i) { v.oge = 'k:' + i; v.i = i; });
function kmKoma(v) { return v.koma.join(' - '); }

function kmIsaretKod(v, y) {
  if (v.isaret) return ARIZA_GLIF[y + v.isaret];
  if (v.cift) return y === '+' ? ARIZA_GLIF.x : ARIZA_GLIF.bb;   // çift diyez / çift bemol
  return null;
}
function kmSemboller(havuz) {
  const L = [];
  havuz.forEach(function (v) {
    ['+', '-'].forEach(function (y) {
      const kod = kmIsaretKod(v, y);
      if (!kod) return;
      L.push({
        v: v, key: v.ad + y,
        ad: v.ad + (y === '+' ? ' Diyez' : ' Bemol'),
        glif: glifStr(kod), koma: kmKoma(v), kod: v.kod, yon: y,
        agir: v.isaret === 'bk' || v.isaret === 'km'
      });
    });
  });
  return L;
}
function kmAciklama(v, sembol) {
  let s = '<b>' + v.ad + '</b> = ' + kmKoma(v) + ' koma · simge harfi <b>' + v.kod + '</b>';
  if (sembol) s = '<span class="bravura satirici">' + sembol.glif + '</span> ' + sembol.ad + ': sesi ' + kmKoma(v) + ' koma ' + (sembol.yon === '+' ? 'tizleştirir' : 'pestleştirir') + '.<br>' + s;
  return s;
}

// Şıkları dörde tamamla (önce havuzdan, sonra tüm veriden)
function dortle(dogruKey, havuzListesi, tumListe, anahtar) {
  const L = benzersiz(havuzListesi.concat(tumListe), anahtar).filter(function (x) { return anahtar(x) !== dogruKey; });
  const once = L.filter(function (x) { return havuzListesi.indexOf(x) >= 0; });
  const sonra = L.filter(function (x) { return havuzListesi.indexOf(x) < 0; });
  return karistir(once).concat(karistir(sonra)).slice(0, 3);
}

function kmSoru0(tip, havuz, agir) {
  if (tip === 'simgeAd' || tip === 'adSimge' || tip === 'simgeKoma' || tip === 'simgeKod') {
    const pool = kmSemboller(havuz);
    const adaylar = [];
    pool.forEach(function (x) { const kat = x.agir ? (agir || 1) : 1; for (let n = 0; n < kat; n++) adaylar.push(x); });
    const o = rastgele(adaylar);
    const q = { oge: o.v.oge, tip: 'secim', aciklama: kmAciklama(o.v, o), ipucu: 'Simge harfi: ' + o.kod };
    if (tip === 'simgeAd') {
      q.soru = { glif: o.glif }; q.alt = 'Bu işaret hangi aralığı gösterir?';
      const dis = dortle(o.v.ad, havuz.map(function (v) { return v.ad; }), KM_VERI.slice(0, 5).map(function (v) { return v.ad; }), function (x) { return x; });
      q.siklar = [o.v.ad].concat(dis).map(function (x) { return { key: x, metin: x }; });
      q.dogru = o.v.ad; q.dogruMetin = o.v.ad;
      q.ipucu = 'Bu işaret ' + o.koma + ' komalık bir değişiklik gösterir.';
    } else if (tip === 'adSimge') {
      q.soru = { metin: o.ad }; q.alt = 'Hangi işaret?';
      const dis = karistir(pool.filter(function (x) { return x.key !== o.key; }));
      // aynı aralığın ters yönlüsü ya da yakın aralık çeldirici olsun
      dis.sort(function (a, b) { return (a.v === o.v || a.yon === o.yon ? 0 : 1) - (b.v === o.v || b.yon === o.yon ? 0 : 1); });
      q.siklar = [o].concat(dis.slice(0, 3)).map(function (x) { return { key: x.key, glif: x.glif }; });
      q.dogru = o.key; q.dogruMetin = o.ad;
      q.ipucu = o.koma + ' koma, ' + (o.yon === '+' ? 'tize doğru (diyez)' : 'peste doğru (bemol)');
    } else {
      const alan = tip === 'simgeKoma' ? 'koma' : 'kod';
      const son = alan === 'koma' ? ' koma' : '';
      const tum = benzersiz(kmSemboller(KM_VERI.slice(0, 5)).map(function (x) { return x[alan]; }));
      const dis = karistir(tum.filter(function (x) { return x !== o[alan]; })).slice(0, 3);
      q.soru = { glif: o.glif };
      q.alt = alan === 'koma' ? 'Bu işaret kaç komadır?' : 'Bu işaretin simge harfi nedir?';
      q.siklar = [o[alan]].concat(dis).map(function (x) { return { key: x, metin: x + son }; });
      q.dogru = o[alan]; q.dogruMetin = o[alan] + son;
      q.ipucu = 'Bu ' + o.v.ad.toLowerCase() + ' işareti.';
    }
    return q;
  }
  const o = rastgele(havuz);
  const q = { oge: o.oge, tip: 'secim', aciklama: kmAciklama(o) };
  const adlar = function (v) { return v.ad; };
  if (tip === 'adKoma') {
    q.soru = { metin: o.ad }; q.alt = 'Kaç komadır?';
    const dis = dortle(kmKoma(o), havuz.map(kmKoma), KM_VERI.map(kmKoma), function (x) { return x; });
    q.siklar = [kmKoma(o)].concat(dis).map(function (x) { return { key: x, metin: x + ' koma' }; });
    q.dogru = kmKoma(o); q.dogruMetin = kmKoma(o) + ' koma';
    q.ipucu = 'Simge harfi ' + o.kod;
  } else if (tip === 'komaAd') {
    q.soru = { metin: kmKoma(o) + ' koma' }; q.alt = 'Hangi aralıktır?';
    const dis = dortle(o.ad, havuz.map(adlar), KM_VERI.map(adlar), function (x) { return x; });
    q.siklar = [o.ad].concat(dis).map(function (x) { return { key: x, metin: x }; });
    q.dogru = o.ad; q.dogruMetin = o.ad;
    q.ipucu = 'Simge harfi ' + o.kod;
  } else if (tip === 'adKod') {
    q.soru = { metin: o.ad }; q.alt = 'Simgesi (harfi) nedir?';
    const dis = dortle(o.kod, havuz.map(function (v) { return v.kod; }), KM_VERI.map(function (v) { return v.kod; }), function (x) { return x; });
    q.siklar = [o.kod].concat(dis).map(function (x) { return { key: x, metin: x }; });
    q.dogru = o.kod; q.dogruMetin = o.kod;
    q.ipucu = kmKoma(o) + ' koma';
  } else {
    q.soru = { metin: o.kod }; q.alt = 'Bu simge hangi aralığı gösterir?';
    const dis = dortle(o.ad, havuz.map(adlar), KM_VERI.map(adlar), function (x) { return x; });
    q.siklar = [o.ad].concat(dis).map(function (x) { return { key: x, metin: x }; });
    q.dogru = o.ad; q.dogruMetin = o.ad;
    q.ipucu = kmKoma(o) + ' koma';
  }
  return q;
}

// Yanlış cevaptan sonra gösterilen aralık kartı için: sorunun hangi yüzü sorduğu ve şıkların türü
const KM_KART_YUZ = {
  simgeAd: ['ad', 'ad'], adSimge: [null, 'sembol'], simgeKoma: ['koma', 'koma'], simgeKod: ['harf', 'kod'],
  adKoma: ['koma', 'koma'], komaAd: ['ad', 'ad'], adKod: ['harf', 'kod'], kodAd: ['ad', 'ad']
};
function kmSoru(tip, havuz, agir) {
  const q = kmSoru0(tip, havuz, agir);
  const y = KM_KART_YUZ[tip];
  if (y) q.kmKart = { yuz: y[0] || (String(q.dogru).slice(-1) === '+' ? 'diyez' : 'bemol'), tur: y[1] };
  return q;
}
// Şık anahtarından aralığı bul (yanlış seçilen aralığın kartı için)
function kmSecilenBul(key, tur) {
  if (key === undefined || key === null) return null;
  if (tur === 'ad') return KM_VERI.find(function (v) { return v.ad === key; }) || null;
  if (tur === 'koma') return KM_VERI.find(function (v) { return kmKoma(v) === key; }) || null;
  if (tur === 'kod') return KM_VERI.find(function (v) { return v.kod === key; }) || null;
  if (tur === 'sembol') {
    const yon = String(key).slice(-1), ad = String(key).slice(0, -1);
    const v = KM_VERI.find(function (x) { return x.ad === ad; });
    return v ? { v: v, yon: yon } : null;
  }
  return null;
}

// Perde adından işaret: nota yeri hazır, öğrenci işaretini seçer. İki yazımlı perdede ikisi birden
// (diyezli ve bemollü yazım). Böylece hem işaret hem perde adı ve iki yazımı öğrenilir.
// Sıklık sırası: en çok kullanılan ara perdeler önce.
const KM_PERDE_SIK = P2_A.concat(P2_B, P2_C);
const KM_PERDE_HEPSI = KM_PERDE_SIK.concat(PAKET[2], PAKET[3], PAKET[4]);
function kmPerdeIsaretSorusu(adlar, havuz) {
  const tur = havuz ? havuz.map(function (v) { return v.isaret; }) : null;
  const adaylar = perdeler(adlar).filter(function (p) {
    if (p.tam) return false;
    return !tur || p.parcalar.every(function (n) { return n.a && tur.indexOf(n.a.slice(1)) >= 0; });
  });
  const p = rastgele(adaylar.length ? adaylar : perdeler(adlar).filter(function (x) { return !x.tam; }));
  const iki = p.parcalar.length === 2;
  const v = KM_VERI.find(function (k) { return k.isaret === p.parcalar[0].a.slice(1); });
  // Perdenin yeri: alttaki tam perdeden kaç koma tiz (soru perde adını değil aralığın işaretini ölçer)
  let altTam = null;
  PERDELER.forEach(function (x) { if (x && x.tam && x.koma < p.koma && (!altTam || x.koma > altTam.koma)) altTam = x; });
  const yerSatiri = altTam ? p.ad + ': ' + altTam.ad + ayrilmaEki(altTam.ad) + ' ' + (p.koma - altTam.koma) + ' koma tiz' : '';
  return {
    oge: v ? v.oge : null, tip: 'yer', kartPerde: p.ad, yerSatiri: yerSatiri,
    soru: { metin: p.ad },
    alt: (yerSatiri ? yerSatiri + '. ' : '') + (iki ? 'İki yazımın da işaretini koy' : 'Notaya işaretini koy'),
    yer: { slotlar: p.parcalar.map(function (n) { return { konum: n }; }), palet: 'aeuKarisik', beklenen: p.parcalar, etiketler: iki ? ['diyezli', 'bemollü'] : null },
    dogruMetin: perdeYazimMetni(p),
    ipucu: perdeKural(p),
    aciklama: '<b>' + p.ad + '</b> = ' + kacis(perdeYazimMetni(p)) + '<br><span class="soluk">' + kacis(perdeKural(p)) + '</span>'
  };
}
function kmPerdeUretici(adlar, h_) {
  return function (n) {
    const havuz = h_ ? h_.map(function (x) { return KM_VERI[x]; }) : null;
    const L = []; let onceki = '';
    for (let j = 0; j < n; j++) {
      let q = null;
      for (let d = 0; d < 8; d++) { q = kmPerdeIsaretSorusu(adlar, havuz); if (q.soru.metin !== onceki) break; }
      onceki = q.soru.metin; L.push(q);
    }
    return L;
  };
}
// Karışık üretici: tipli sorular + perde adından işaret soruları
function kmKarmaUretici(h_, tipler, agir, adlar, oran) {
  const a = kmUretici(h_, tipler, agir), b = kmPerdeUretici(adlar, h_);
  return function (n) { const k = Math.round(n * oran); return karistir(a(n - k).concat(b(k))); };
}

function kmUretici(h_, tipler, agir) {
  return function (n) {
    const havuz = h_.map(function (x) { return KM_VERI[x]; });
    const L = [];
    let onceki = '';
    for (let j = 0; j < n; j++) {
      let q = null;
      for (let d = 0; d < 8; d++) {
        q = kmSoru(tipler[j % tipler.length], havuz, agir || 1);
        const imza = JSON.stringify(q.soru);
        if (imza !== onceki) { onceki = imza; break; }
      }
      L.push(q);
    }
    return karistir(L);
  };
}
const KM_TUM = ['adKoma', 'komaAd', 'adKod', 'kodAd'];
const KM_SEMBOL = ['simgeAd', 'adSimge', 'simgeKoma', 'simgeKod'];

function komaCetveliSVG() {
  const W = 300, x0 = 20, x1 = 280;
  const svg = svgEl('svg', { class: 'cetvel', viewBox: '0 0 ' + W + ' 70', preserveAspectRatio: 'xMidYMid meet' });
  svg.appendChild(svgEl('line', { x1: x0, x2: x1, y1: 30, y2: 30, stroke: 'currentColor', 'stroke-width': 2 }));
  for (let i = 0; i <= 9; i++) {
    const x = x0 + (x1 - x0) * i / 9;
    svg.appendChild(svgEl('line', { x1: x, x2: x, y1: 24, y2: 36, stroke: 'currentColor', opacity: .5 }));
    const t = svgEl('text', { x: x, y: 16, 'font-size': 10, 'text-anchor': 'middle', fill: 'currentColor', opacity: .7 });
    t.textContent = i; svg.appendChild(t);
  }
  [[1, 'F'], [4, 'B'], [5, 'S'], [8, 'K'], [9, 'T']].forEach(function (k) {
    const x = x0 + (x1 - x0) * k[0] / 9;
    svg.appendChild(svgEl('circle', { cx: x, cy: 30, r: 6, class: 'cetvelVurgu' }));
    const t = svgEl('text', { x: x, y: 56, 'font-size': 13, 'text-anchor': 'middle', fill: 'currentColor', 'font-weight': 800 });
    t.textContent = k[1]; svg.appendChild(t);
  });
  return svg;
}

function isaretKarti(v) {
  return {
    baslik: v.ad,
    cizim: function () {
      return h('div', { class: 'glifCift' },
        h('div', null, h('span', { class: 'bravura buyukGlif' }, glifStr(kmIsaretKod(v, '+'))), h('small', null, 'diyez')),
        h('div', null, h('span', { class: 'bravura buyukGlif' }, glifStr(kmIsaretKod(v, '-'))), h('small', null, 'bemol')));
    },
    metin: '<p><b>' + v.ad + '</b> = ' + kmKoma(v) + ' koma, simge harfi <b>' + v.kod + '</b>.</p>' +
      '<p>Diyezi sesi ' + kmKoma(v) + ' koma <b>tizleştirir</b>, bemolü ' + kmKoma(v) + ' koma <b>pestleştirir</b>.</p>'
  };
}

const KOMA_UNITELER = [
  {
    id: 'km1', dal: 'koma', no: 1, ad: 'Koma ve aralıklar',
    kisa: 'Koma, bakiye, mücennebler, tanini, artık ikili',
    ogeler: KM_VERI.map(function (v) { return v.oge; }),
    seviyeler: [
      // 2.11: ilk dört seviye ikiye indirildi (km2 → km1, km4 → km3; yıldızlar taşındı)
      { id: 'km1', tip: 'seviye', ad: 'Koma, Bakiye, Tanini: değer ve harf', soruSay: 8, uret: kmUretici([0, 1, 4], KM_TUM) },
      { id: 'km3', tip: 'seviye', ad: 'Mücennebler eklendi: değer ve harf', soruSay: 8, uret: kmUretici([0, 1, 2, 3, 4], KM_TUM) },
      { id: 'km5', tip: 'boss', ad: 'Artık İkili eklendi: karışık', soruSay: 8, uret: kmUretici([0, 1, 2, 3, 4, 5], KM_TUM) }
    ]
  },
  {
    id: 'km2', dal: 'koma', no: 2, ad: 'Değiştirme işaretleri',
    kisa: 'AEU’nun 8 işareti: diyezler ve bemoller',
    ogeler: KM_VERI.slice(0, 5).map(function (v) { return v.oge; }),
    seviyeler: [
      { id: 'km6', tip: 'seviye', ad: 'Diyez ve bemol: Koma, Bakiye', soruSay: 8, uret: kmUretici([0, 1], ['simgeAd', 'adSimge', 'simgeKoma'], 2) },
      { id: 'km7', tip: 'seviye', ad: 'Diyez ve bemol: dört aralık', soruSay: 10, uret: kmUretici([0, 1, 2, 3], ['simgeAd', 'simgeKoma', 'adSimge', 'simgeKod'], 3) },
      { id: 'km8', tip: 'seviye', ad: 'Diyez ve bemol: Tanini dahil', soruSay: 10, uret: kmUretici([0, 1, 2, 3, 4], ['simgeAd', 'simgeKoma', 'adSimge', 'simgeKod'], 3) },
      { id: 'km-yer', tip: 'yer', ad: 'Perde adından işareti koy', soruSay: 8, uret: kmPerdeUretici(KM_PERDE_SIK, [0, 1, 2, 3]) },
      { id: 'km9', tip: 'boss', ad: 'Büyük final: her şey karışık', soruSay: 12, uret: kmKarmaUretici([0, 1, 2, 3, 4, 5], KM_TUM.concat(KM_SEMBOL), 1, KM_PERDE_SIK, 0.33) }
    ]
  },
  {
    id: 'km3', dal: 'koma', no: 3, ad: 'Sembol ustalığı',
    kisa: 'Simgeden koma ve harfe, bakiye–küçük mücenneb ayrımı',
    ogeler: KM_VERI.slice(0, 5).map(function (v) { return v.oge; }),
    seviyeler: [
      { id: 'km10', tip: 'seviye', ad: 'Simge → koma değeri', soruSay: 10, uret: kmUretici([0, 1, 2, 3, 4], ['simgeKoma', 'simgeAd'], 3) },
      { id: 'km11', tip: 'seviye', ad: 'Simge → harf (F, B, S, K, T)', soruSay: 10, uret: kmUretici([0, 1, 2, 3, 4], ['simgeKod', 'simgeKoma'], 3) },
      { id: 'km12', tip: 'seviye', ad: 'Bakiye ve küçük mücenneb odağı', soruSay: 12, uret: kmUretici([0, 1, 2, 3, 4], ['simgeAd', 'simgeKoma', 'simgeKod', 'adSimge'], 6) },
      { id: 'km-yer2', tip: 'yer', ad: 'Perde adından işaret: bütün perdeler', soruSay: 10, uret: kmPerdeUretici(KM_PERDE_HEPSI) },
      { id: 'km13', tip: 'boss', ad: 'Sembol finali: k, bk, km, bm, T', soruSay: 14, uret: kmKarmaUretici([0, 1, 2, 3, 4], ['simgeAd', 'simgeKoma', 'simgeKod', 'adSimge'], 4, KM_PERDE_HEPSI, 0.4) }
    ]
  }
];

KOMA_UNITELER[0].ders = function () {
  return [
    { baslik: 'Koma nedir?', cizim: komaCetveliSVG, metin:
      '<p>Türk müziğinde iki tam ses arasındaki aralığa <b>tanini</b> denir ve <b>9 komaya</b> bölünür. Bir oktav 53 komadır.</p>' +
      '<p>Bu 9 komalık aralığın içindeki 1, 4, 5 ve 8. komalar, ara perdelerin yerleridir.</p>' },
    { baslik: 'Koma · F', metin: '<p><b>Koma</b> en küçük aralıktır: <b>1 koma</b>. Simge harfi <b>F</b> (fazla).</p>' },
    { baslik: 'Bakiye · B', metin: '<p><b>Bakiye</b> = <b>4 koma</b>. Simge harfi <b>B</b>.</p><p>Mi–Fa ve Si–Do arası bir bakiyedir.</p>' },
    { baslik: 'Küçük Mücenneb · S', metin: '<p><b>Küçük mücenneb</b> = <b>5 koma</b>. Simge harfi <b>S</b>.</p><p>Bakiye ile karıştırma: aradaki fark sadece 1 koma.</p>' },
    { baslik: 'Büyük Mücenneb · K', metin: '<p><b>Büyük mücenneb</b> = <b>8 koma</b>. Simge harfi <b>K</b>.</p><p>Bir taniniden 1 koma eksiktir.</p>' },
    { baslik: 'Tanini · T', metin: '<p><b>Tanini</b> = <b>9 koma</b>, yani tam ses. Simge harfi <b>T</b>.</p>' },
    { baslik: 'Artık İkili · A', metin: '<p><b>Artık ikili</b> 12 ya da 13 komadır (A12, A13). Hicaz çeşnisinin karakteristik aralığıdır.</p>' }
  ];
};
KOMA_UNITELER[1].ders = function () {
  return [
    { baslik: 'Diyez ve bemol', metin:
      '<p><b>Diyez</b> sesi tizleştirir (yukarı), <b>bemol</b> pestleştirir (aşağı).</p>' +
      '<p>Arel-Ezgi-Uzdilek sisteminde her aralığın kendi diyez ve bemol işareti vardır: toplam <b>8 işaret</b>.</p>' }
  ].concat(KM_VERI.slice(0, 5).map(isaretKarti)).concat([
    { baslik: 'Perde adından işaret', cizim: function () {
        const p = PERDE['Dik Hisar'];
        return h('div', null, h('div', { class: 'kartPorte' }, porteSVG({ notalar: p.parcalar, aralik: 48, etiketler: ['diyezli', 'bemollü'] })), h('div', { class: 'kartCetvel' }, cetvelSVG(p)));
      },
      metin: '<p>Bu ünitede sana bir <b>perde adı</b> verilecek; notası porteye hazır konmuş olacak. Sen yalnızca <b>işaretini</b> seçeceksin.</p>' +
        '<p>Çoğu ara perdenin <b>iki yazımı</b> var: biri diyezli, biri bemollü. İkisine de işaret koyacaksın. Örnek: <b>Dik Hisar</b> = Re büyük mücenneb diyezi = Mi koma bemolü.</p>' +
        '<p>İşaret düğmelerinde isim yok ve sıraları her soruda değişir: işareti şeklinden tanı.</p>' }
  ]);
};
KOMA_UNITELER[2].ders = function () {
  return [
    { baslik: 'Bakiye mi, küçük mücenneb mi?', cizim: function () {
        return h('div', { class: 'glifCift' },
          h('div', null, h('span', { class: 'bravura buyukGlif' }, glifStr(ARIZA_GLIF['+bk'])), h('small', null, 'bakiye diyezi · 4')),
          h('div', null, h('span', { class: 'bravura buyukGlif' }, glifStr(ARIZA_GLIF['+km'])), h('small', null, 'k. mücenneb diyezi · 5')));
      }, metin: '<p>En çok karışan iki işaret bunlar. Bu ünitede onlara ekstra ağırlık verilecek.</p>' +
      '<p>Bakiye diyezi bildiğimiz diyeze benzer: <b>iki dikey, iki eğik</b> çizgi. Küçük mücenneb diyezinde <b>tek dikey, üç eğik</b> çizgi vardır.</p>' }
  ];
};

function komaOgeSorusu(id) {
  const v = KM_VERI.find(function (x) { return x.oge === id; });
  const havuz = KM_VERI.slice(0, v.i === 5 ? 6 : 5);
  if (v.i < 5 && Math.random() < 0.5) {
    // bu aralığın işaret sorusu
    let q = null;
    for (let d = 0; d < 12; d++) { q = kmSoru(rastgele(KM_SEMBOL), havuz, 1); if (q.oge === id) return q; }
  }
  const tip = rastgele(KM_TUM);
  for (let d = 0; d < 20; d++) { const q = kmSoru(tip, [v].concat(havuz.filter(function (x) { return x !== v; })), 1); if (q.oge === id) return q; }
  return kmSoru('adKoma', [v], 1);
}
