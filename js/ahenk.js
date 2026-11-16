// =====================================================
// AHENK DALI
// Yalnızca adlar ve karşılıkları öğretilir (göçürme hesabı yok).
// Adlandırma, Mus2'nin ahenk tablosundaki eski ve yeni adlarla aynıdır:
// her ahenk Bolâhenk Nısfiye'ye ("yerinden") göre ne kadar pest olduğuyla anılır.
// Rast perdesinin duyulduğu ses: Bolâhenk'te Re; aralık kadar pestleşir.
// =====================================================
'use strict';

const AHENK_HAM = [
  // id, eski adı, yeni adı (Mus2), aralık adı, halk arasında, Rast'ın duyulduğu ses, tür
  ['bolahenk',  'Bolâhenk Nısfiye',              'Yerinden',                   'Birli',        null,         'Re',  'nisfiye'],
  ['sipurde',   'Sipürde (Mehtâbiye) Nısfiyesi', 'Büyük ikili pestten',         'Büyük ikili',  '1 sesten',   'Do',  'nisfiye'],
  ['mustahsen', 'Müstahsen Nısfiyesi',           'Küçük üçlü pestten',          'Küçük üçlü',   null,         'Si',  'nisfiye'],
  ['kiz',       'Kız Nısfiyesi',                 'Dörtlü pestten',              'Dörtlü',       '4 sesten',   'La',  'nisfiye'],
  ['mansur',    'Mansur Nısfiyesi',              'Beşli pestten',               'Beşli',        '5 sesten',   'Sol', 'nisfiye'],
  ['sah',       'Şah Nısfiyesi',                 'Büyük altılı pestten',        'Büyük altılı', null,         'Fa',  'nisfiye'],
  ['davud',     'Davud Nısfiyesi',               'Küçük yedili pestten',        'Küçük yedili', null,         'Mi',  'nisfiye'],
  ['bolahenkNey', 'Bolâhenk Neyi',               'Sekizli pestten',             'Sekizli',      null,         'Re',  'ney'],
  ['kizNey',    'Kız Neyi',                      'Onbirli pestten',             'Onbirli',      '4 sesten',   'La',  'ney'],
  ['mansurNey', 'Mansur Neyi',                   'Onikili pestten',             'Onikili',      '5 sesten',   'Sol', 'ney']
];
const AHENKLER = AHENK_HAM.map(function (r, i) {
  return { id: r[0], ad: r[1], yeni: r[2], aralik: r[3], halk: r[4], rast: r[5], tur: r[6], sira: i,
    yeniTam: r[2] + (r[4] ? ' (' + r[4] + ')' : '') };
});
const AHENK = {};
AHENKLER.forEach(function (a) { AHENK[a.id] = a; });
const AH_NISFIYE = AHENKLER.filter(function (a) { return a.tur === 'nisfiye'; });
const AH_NEY = AHENKLER.filter(function (a) { return a.tur === 'ney'; });
const AH_KISA = { bolahenk: 'Bolâhenk', sipurde: 'Sipürde', mustahsen: 'Müstahsen', kiz: 'Kız', mansur: 'Mansur', sah: 'Şah', davud: 'Davud' };

function ahenkAciklama(a) {
  return '<b>' + a.ad + '</b> = ' + a.yeniTam + '<br>Rast perdesi <b>' + a.rast + '</b> sesinden duyulur' + (a.tur === 'ney' ? ' (nısfiyeye göre bir oktav pest)' : '') + '.';
}
function ahenkSiklari(dogru, havuz, alan) {
  const dis = karistir(havuz.filter(function (x) { return x !== dogru && x[alan] !== dogru[alan]; })).slice(0, 3);
  return [dogru].concat(dis).map(function (x) { return { key: x.id, metin: x[alan] }; });
}
const AH_BILGI = [
  { s: 'Ahenkler adını neyden alır?', d: 'Ney çeşitlerinden', y: ['Makamlardan', 'Usullerden', 'Bestecilerden'] },
  { s: 'İki ahengin arasındaki ahenge ne denir?', d: 'Mâbeyin', y: ['Nısfiye', 'Şed', 'Geçki'] },
  { s: 'Nısfiye ile aynı adlı ney arasındaki fark nedir?', d: 'Bir oktav', y: ['Bir dörtlü', 'Bir beşli', 'Bir tanini'] },
  { s: 'Hangisi nısfiyeden daha pesttir?', d: 'Aynı adlı ney', y: ['Aynı adlı nısfiye', 'İkisi de aynı ses', 'Bolâhenk nısfiye'] },
  { s: 'Yeni adlandırmada Bolâhenk Nısfiye ahengine ne denir?', d: 'Yerinden', y: ['Dörtlü pestten', 'Beşli pestten', 'Sekizli pestten'] },
  { s: 'Notada Sol yazılan perdenin adı nedir?', d: 'Rast', y: ['Dügâh', 'Neva', 'Çargâh'] },
  { s: 'Ahenk neyi değiştirir?', d: 'Seslerin duyulduğu yüksekliği', y: ['Notanın yazılışını', 'Makamın dizisini', 'Usulü'] }
];

// ---- 3.5: görsel ve sesli ahenk soruları ----
// Bolâhenk'e göre kaç yarım ses / kaç koma pest
const AH_YARIM = { bolahenk: 0, sipurde: 2, mustahsen: 3, kiz: 5, mansur: 7, sah: 9, davud: 10, bolahenkNey: 12, kizNey: 17, mansurNey: 19 };
const AH_KOMA = { bolahenk: 0, sipurde: 9, mustahsen: 13, kiz: 22, mansur: 31, sah: 40, davud: 44 };
// Klavyede (Do4 = 0) Rast'ın duyulduğu tuş: Bolâhenk'te Re4; yazılan Rast = Sol4 (7)
function ahenkTus(a) { return 2 - AH_YARIM[a.id]; }
function ahenkKlavyeSVG(a) {
  return klavye({ bas: -8, son: 7, sabit: true, verilen: [{ y: 7, etiket: 'yazılan' }, { y: ahenkTus(a), etiket: 'duyulan', sinif: 'dogru' }] }).el;
}
// Ney boyları (şematik): boy, sesin pestliğiyle uzar. Tizden peste sıralı; vurgu: işaretlenecek ahenk
function neyBoylariSVG(L, vurguId) {
  const S = L.slice().sort(function (x, y) { return x.sira - y.sira; });
  const enUzun = Math.pow(2, AH_YARIM[S[S.length - 1].id] / 12), birim = 250 / enUzun, sat = S.length > 10 ? 10 : 13;
  const svg = svgEl('svg', { class: 'neyBoy', viewBox: '0 0 300 ' + (S.length * sat + 20), preserveAspectRatio: 'xMidYMid meet', role: 'img', 'aria-label': 'Ney boyları' });
  S.forEach(function (x, i) {
    const w = birim * Math.pow(2, AH_YARIM[x.id] / 12), y = 4 + i * sat;
    svg.appendChild(svgEl('rect', { x: 20, y: y, width: w, height: sat - 5, rx: (sat - 5) / 2, class: 'neyCubuk' + (x.id === vurguId ? ' vurgu' : '') }));
    svg.appendChild(svgEl('rect', { x: 16, y: y - 1.5, width: 9, height: sat - 2, rx: 3, class: 'neyBaspare' + (x.id === vurguId ? ' vurgu' : '') }));
  });
  gYazi(svg, 150, S.length * sat + 15, 'kısa ney tiz · uzun ney pest', { 'font-size': 9, opacity: .65, 'font-weight': 600 });
  return svg;
}
function ahenkGorselSoru(tip, a, havuz, q) {
  const nisfiye = function (x) { return x.tur === 'ney' ? AH_NISFIYE.find(function (y) { return y.rast === x.rast; }) : x; };
  if (tip === 'klavyeAd') {
    a = nisfiye(a); q.aciklama = ahenkAciklama(a);
    q.soru = { svg: function () { return ahenkKlavyeSVG(a); } }; q.alt = 'Sarı tuş yazılan Rast (Sol), yeşil tuş duyulduğu ses. Hangi nısfiye ahengi?';
    q.siklar = ahenkSiklari(a, AH_NISFIYE, 'ad'); q.dogru = a.id; q.dogruMetin = a.ad;
    q.ipucu = 'Bolâhenk’te Rast, Re’den duyulur. Re’den yeşil tuşa kadar say.';
  } else if (tip === 'adKlavye') {
    a = nisfiye(a); q.aciklama = ahenkAciklama(a);
    const y = ahenkTus(a);
    q.tip = 'ozel';
    q.soru = { metin: a.ad, kucuk: a.ad.length > 18 }; q.alt = 'Yazılan Rast sarı tuş. Bu ahenkte hangi tuştan duyulur? Dokun';
    q.klavye = { bas: -8, son: 7, tam: true, verilen: [{ y: 7, etiket: 'yazılan' }], hedefPc: ((y % 12) + 12) % 12, hedefY: y, hedefEtiket: a.rast };
    q.ozel = { karar: 1, ciz: klavyeSoruCiz };
    q.dogruMetin = a.rast;
    q.ipucu = 'Bolâhenk’te Rast = Re. Oradan ' + a.aralik.toLowerCase() + ' pest.';
  } else if (tip === 'boyAd' || tip === 'adBoy') {
    const kume = havuz.length >= 4 ? havuz : AHENKLER;
    if (tip === 'boyAd') {
      q.soru = { svg: function () { return neyBoylariSVG(kume, a.id); } }; q.alt = 'Neyler tizden peste dizili. İşaretli olan hangi ahenk?';
      q.siklar = ahenkSiklari(a, kume, 'ad'); q.dogru = a.id; q.dogruMetin = a.ad;
    } else {
      q.soru = { metin: a.ad, kucuk: a.ad.length > 18 }; q.alt = 'Neyler tizden peste dizili. Bu ahengin neyi hangisi?';
      const dis = karistir(kume.filter(function (x) { return x !== a; })).slice(0, 3);
      q.siklar = [a].concat(dis).map(function (x) { return { key: x.id, svg: function () { return neyBoylariSVG(kume, x.id); } }; });
      q.dogru = a.id; q.dogruMetin = (a.sira + 1) + '. sırada (tizden peste)';
    }
    q.ipucu = 'Tizden peste: Bolâhenk, Sipürde, Müstahsen, Kız, Mansur, Şah, Davud; neyler bunlardan bir oktav pest.';
  } else if (tip === 'dinle') {
    // Aynı ezgi önce Bolâhenk'te, sonra sorulan ahenkte çalınır (yalnız nısfiyeler)
    a = nisfiye(a);
    if (a.id === 'bolahenk') a = rastgele(AH_NISFIYE.filter(function (x) { return x.id !== 'bolahenk'; }));
    const ezgi = [243, 252, 260, 265, 274].map(function (k) { return k + 22; });   // Rast beşlisi, Bolâhenk yüksekliğinde
    const A = kulakDiziOlay(ezgi, 'ci', 0.36), B = kulakDiziOlay(ezgi.map(function (k) { return k - AH_KOMA[a.id]; }), 'ci', 0.36);
    const dis = karistir(AH_NISFIYE.filter(function (x) { return x.id !== 'bolahenk' && x !== a && Math.abs(AH_YARIM[x.id] - AH_YARIM[a.id]) >= 2; })).slice(0, 2);
    q.aciklama = ahenkAciklama(a);
    q.kulak = true;
    q.soru = { metin: '👂 Aynı ezgi, iki ahenk', kucuk: true }; q.alt = 'Önce Bolâhenk’te (yerinden) çalar, sonra başka bir ahenkte. İkincisi hangisi?';
    q.dinle = kulakDinle([{ etiket: 'Bolâhenk', olaylar: A }, { etiket: 'İkinci', olaylar: B }], {});
    q.dinle.ahenk = null;
    q.siklar = [a].concat(dis).map(function (x) { return { key: x.id, metin: x.ad }; }); q.dogru = a.id; q.dogruMetin = a.ad;
    q.ipucu = 'İkinci çalışın ilk sesi, birincinin ilk sesinden ne kadar pest?';
    q.geriEk = kulakGeri({ kaydir: q.dinle.kaydir, dogru: { etiket: a.ad, olaylar: kulakArdArda([A, B], 0.7) } });
  }
  return q;
}
function ahenkSoru(tip, a, havuz) {
  const q = { oge: null, tip: 'secim', aciklama: ahenkAciklama(a), ipucu: 'Bolâhenk’ten ' + a.aralik.toLowerCase() + ' pest.' };
  if (['klavyeAd', 'adKlavye', 'boyAd', 'adBoy', 'dinle'].indexOf(tip) >= 0) return ahenkGorselSoru(tip, a, havuz, q);
  if (tip === 'adYeni') {
    q.soru = { metin: a.ad, kucuk: a.ad.length > 18 }; q.alt = 'Yeni adı (Bolâhenk’e göre) hangisi?';
    q.siklar = ahenkSiklari(a, havuz, 'yeniTam'); q.dogru = a.id; q.dogruMetin = a.yeniTam;
  } else if (tip === 'yeniAd') {
    q.soru = { metin: a.yeniTam, kucuk: true }; q.alt = 'Bu hangi ahenk?';
    q.siklar = ahenkSiklari(a, havuz, 'ad'); q.dogru = a.id; q.dogruMetin = a.ad;
    q.ipucu = 'Rast perdesi ' + a.rast + ' sesinden duyulur.';
  } else if (tip === 'adRast') {
    q.soru = { metin: a.ad, kucuk: a.ad.length > 18 }; q.alt = 'Bu ahenkte Rast perdesi hangi sesten duyulur?';
    const sesler = ['Re', 'Do', 'Si', 'La', 'Sol', 'Fa', 'Mi'];
    const dis = karistir(sesler.filter(function (x) { return x !== a.rast; })).slice(0, 3);
    q.siklar = [a.rast].concat(dis).map(function (x) { return { key: x, metin: x }; }); q.dogru = a.rast; q.dogruMetin = a.rast;
    q.ipucu = 'Bolâhenk’te Rast = Re. ' + a.aralik + ' pest.';
  } else if (tip === 'rastAd') {
    if (a.tur === 'ney') { a = AH_NISFIYE.find(function (x) { return x.rast === a.rast; }); q.aciklama = ahenkAciklama(a); }
    q.soru = { metin: 'Rast → ' + a.rast, kucuk: true }; q.alt = 'Rast perdesi ' + a.rast + ' sesinden duyuluyor. Hangi nısfiye ahengi?';
    q.siklar = ahenkSiklari(a, AH_NISFIYE, 'ad'); q.dogru = a.id; q.dogruMetin = a.ad;
  } else if (tip === 'halk') {
    const h_ = rastgele(AHENKLER.filter(function (x) { return x.halk && x.tur === a.tur; }));
    q.soru = { metin: '“' + h_.halk + '”' }; q.alt = 'Halk arasında böyle anılan ' + (h_.tur === 'ney' ? 'ney' : 'nısfiye') + ' ahengi hangisi?';
    q.siklar = ahenkSiklari(h_, havuz.filter(function (x) { return x.tur === h_.tur; }).length >= 4 ? havuz.filter(function (x) { return x.tur === h_.tur; }) : AHENKLER, 'ad');
    q.dogru = h_.id; q.dogruMetin = h_.ad; q.aciklama = ahenkAciklama(h_);
    q.ipucu = '“' + h_.halk + '” = ' + h_.yeni.toLowerCase();
  } else if (tip === 'sirala') {
    const L = karistir(AH_NISFIYE).slice(0, 4).sort(function (x, y) { return x.sira - y.sira; });
    q.tip = 'dizi';
    q.soru = { metin: 'Tizden peste diz', kucuk: true }; q.alt = 'En tiz ahenk önce';
    q.dizi = { havuz: karistir(L).map(function (x) { return { key: x.id, metin: AH_KISA[x.id] }; }), uzunluk: 4, beklenen: L.map(function (x) { return x.id; }), tekrarli: false };
    q.dogruMetin = L.map(function (x) { return AH_KISA[x.id]; }).join(' → ');
    q.aciklama = 'Tizden peste: <b>Bolâhenk, Sipürde, Müstahsen, Kız, Mansur, Şah, Davud</b>. Rast perdesi sırayla Re, Do, Si, La, Sol, Fa, Mi sesinden duyulur.';
    q.ipucu = 'Rast’ın sesini düşün: Re en tiz, Mi en pest.';
  } else if (tip === 'bilgi') {
    const b = rastgele(AH_BILGI);
    q.soru = { metin: b.s, kucuk: true }; q.alt = 'Doğru cevap hangisi?';
    q.siklar = [b.d].concat(b.y).map(function (x) { return { key: x, metin: x }; }); q.dogru = b.d; q.dogruMetin = b.d;
    q.aciklama = '<b>' + kacis(b.s) + '</b> → ' + kacis(b.d); q.ipucu = null;
  }
  return q;
}
function ahenkUretici(havuzL, tipler) {
  return function (n) {
    const L = [];
    let onceki = null;
    for (let i = 0; i < n; i++) {
      let a;
      for (let d = 0; d < 10; d++) { a = rastgele(havuzL); if (a !== onceki) break; }
      onceki = a;
      L.push(ahenkSoru(tipler[i % tipler.length], a, havuzL));
    }
    return karistir(L);
  };
}

function ahenkTablosu(L) {
  return '<table class="ahenkTablo"><tr><th>Ahenk</th><th>Bolâhenk’e göre</th><th>Rast</th></tr>' +
    L.map(function (a) { return '<tr><td>' + a.ad + '</td><td>' + a.yeniTam + '</td><td><b>' + a.rast + '</b></td></tr>'; }).join('') + '</table>';
}

const AHENK_UNITELER = [
  { id: 'a1', dal: 'ahenk', no: 1, ad: 'Nısfiye ahenkleri', kisa: 'Bolâhenk, Sipürde, Müstahsen, Kız, Mansur, Şah, Davud', ogeler: [],
    seviyeler: [
      { id: 'a1-1', tip: 'seviye', ad: 'Eski ad, yeni ad', soruSay: 8, uret: ahenkUretici(AH_NISFIYE, ['adYeni', 'klavyeAd', 'yeniAd', 'boyAd']) },
      { id: 'a1-2', tip: 'seviye', ad: 'Rast hangi sesten?', soruSay: 8, uret: ahenkUretici(AH_NISFIYE, ['adKlavye', 'rastAd', 'klavyeAd', 'adRast']) },
      { id: 'a1-yer', tip: 'yer', ad: 'Tizden peste diz', soruSay: 5, uret: ahenkUretici(AH_NISFIYE, ['sirala', 'adKlavye', 'adBoy', 'sirala', 'adKlavye']) },
      { id: 'a1-kulak', tip: 'seviye', ad: '👂 Aynı ezgi, iki ahenk', soruSay: 6, yeni: true, kulak: true, uret: ahenkUretici(AH_NISFIYE.filter(function (a) { return a.id !== 'bolahenk'; }), ['dinle']) },
      { id: 'a1-boss', tip: 'boss', ad: 'Nısfiyeler finali', soruSay: 10, uret: ahenkUretici(AH_NISFIYE, ['adYeni', 'klavyeAd', 'adKlavye', 'boyAd', 'halk', 'sirala', 'rastAd', 'adBoy', 'yeniAd', 'adRast']) }
    ] },
  { id: 'a2', dal: 'ahenk', no: 2, ad: 'Neyler ve ahenk bilgisi', kisa: 'Bolâhenk, Kız ve Mansur neyleri; mâbeyin', ogeler: [],
    seviyeler: [
      { id: 'a2-1', tip: 'seviye', ad: 'Ney ahenkleri', soruSay: 8, uret: ahenkUretici(AH_NEY.concat(AH_NISFIYE), ['adYeni', 'boyAd', 'yeniAd', 'adBoy', 'halk', 'boyAd', 'adYeni', 'adBoy']) },
      { id: 'a2-2', tip: 'seviye', ad: 'Ahenk bilgisi', soruSay: 7, uret: ahenkUretici(AHENKLER, ['bilgi']) },
      { id: 'a2-boss', tip: 'boss', ad: 'Ahenk büyük finali', soruSay: 12, uret: ahenkUretici(AHENKLER, ['adYeni', 'boyAd', 'klavyeAd', 'bilgi', 'adKlavye', 'halk', 'adBoy', 'yeniAd', 'rastAd', 'adRast', 'boyAd', 'bilgi']) }
    ] }
];
AHENK_UNITELER[0].ders = function () {
  return [
    { baslik: 'Ahenk nedir?', metin:
      '<p>Türk müziği notası hep aynı yazılır: <b>Rast</b> perdesi notada <b>Sol</b>’dür. Ama eser hangi yükseklikte çalınıp söylenecekse ona <b>ahenk</b> denir.</p>' +
      '<p>Ahenkler adlarını <b>ney çeşitlerinden</b> alır. Kız neyiyle çalınan bir eser “Kız ahengindedir”.</p>' },
    { baslik: 'Bolâhenk: yerinden', metin:
      '<p>Ölçü olarak <b>Bolâhenk Nısfiye</b> alınır. Yeni adlandırmada bunun adı <b>yerinden</b>dir. Bu ahenkte Rast perdesi <b>Re</b> sesinden duyulur.</p>' +
      '<p>Öteki ahenkler Bolâhenk’e göre <b>ne kadar pest</b> olduklarıyla anılır: Kız nısfiyesi “dörtlü pestten”, Mansur nısfiyesi “beşli pestten”.</p>' },
    { baslik: 'Yedi nısfiye ahengi', metin: ahenkTablosu(AH_NISFIYE) +
      '<p class="soluk">Halk arasında Kız’a “4 sesten”, Mansur’a “5 sesten”, Sipürde’ye “1 sesten” de denir.</p>' },
    { baslik: 'Kolay hatırlama', metin:
      '<p>Tizden peste Rast’ın sesleri bir dizi gibi iner: <b>Re, Do, Si, La, Sol, Fa, Mi</b>.</p>' +
      '<p>Sıra: <b>Bolâhenk, Sipürde, Müstahsen, Kız, Mansur, Şah, Davud</b>.</p>' +
      '<p>Böylece “bu eser bir dörtlü pest çalınıyor” demek yerine “<b>Kız ahenginde</b>” diyebilirsin.</p>' }
  ];
};
AHENK_UNITELER[1].ders = function () {
  return [
    { baslik: 'Nısfiye ve ney', metin:
      '<p><b>Nısfiye</b> yarım boylu ney demektir. Aynı adlı <b>ney</b>, nısfiyeden <b>bir oktav pest</b>tir.</p>' + ahenkTablosu(AH_NEY) },
    { baslik: 'Mâbeyin', metin:
      '<p>İki ahengin arasında kalan ahenklere <b>mâbeyin</b> (ara) denir: “Mansur Mâbeyni”, “Kız Mâbeyni” gibi. Yeni adlandırmada bunlar <b>küçük</b> ve <b>artık</b> aralıklarla anılır (ör. Mansur Mâbeyni = küçük altılı pestten).</p>' +
      '<p>Bu dalda en çok kullanılan ahenkleri öğrendin; mâbeyinleri tablo olarak bilmen yeter.</p>' }
  ];
};
