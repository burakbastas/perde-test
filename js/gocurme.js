// =====================================================
// GÖÇÜRME DALI: aralık adımları → dörtlü → beşli → makam dizisi
// (Tekrar sekmesindeki göçürme antrenmanı da aynı motoru kullanır: makam.js)
// =====================================================
'use strict';

const ADIM_HARF = { T: 9, K: 8, S: 5, B: 4 };
const ADIM_AD = { T: 'tanini', K: 'büyük mücenneb', S: 'küçük mücenneb', B: 'bakiye' };
const ADIM_BASLANGIC_TAM = ['Yegâh', 'Hüseyni Aşiran', 'Acem Aşiran', 'Rast', 'Dügâh', 'Bûselik', 'Çargâh', 'Neva', 'Hüseyni', 'Acem', 'Gerdâniye'];
const ADIM_BASLANGIC_ISARETLI = ['Irak', 'Geveşt', 'Nim Zirgüle', 'Zirgüle', 'Kürdi', 'Dik Kürdi', 'Segâh', 'Nim Hicaz', 'Hicaz', 'Nim Hisar', 'Hisar', 'Dik Hisar', 'Evç', 'Mahur', 'Dik Acem'];

// Bir perdeden tek aralık yukarı: geçerli ve yaygın perdelere düşen bir adım bul
function adimBul(baslangiclar, harfler) {
  for (let d = 0; d < 200; d++) {
    const p = PERDE[rastgele(baslangiclar)], harf = rastgele(harfler);
    const L = gocurPerde([ADIM_HARF[harf]], p);
    if (!L) continue;
    const hedef = KOMADAN_PERDE[komaOf(L[1])];
    if (!GOCURME_YAYGIN[hedef.ad]) continue;
    return { bas: p, hedef: hedef, harf: harf, notalar: L };
  }
  return null;
}

function adimSorusu(tip, baslangiclar, harfler) {
  const x = adimBul(baslangiclar, harfler);
  if (!x) return adimSorusu(tip, ADIM_BASLANGIC_TAM, ['T']);
  const aciklama = '<b>' + x.bas.ad + '</b>' + ayrilmaEki(x.bas.ad) + ' ' + x.harf + ' (' + ADIM_AD[x.harf] + ') yukarı → <b>' + x.hedef.ad + '</b>' + gocurmeAdimlari(x.notalar);
  const q = { oge: null, tip: 'secim', aciklama: aciklama, ipucu: 'Önce harfler arası doğal aralığı bul: Mi–Fa ve Si–Do bakiye (4), diğerleri tanini (9).' };
  if (tip === 'adimPerde') {
    q.soru = { metin: x.bas.ad + ' + ' + x.harf, kucuk: false };
    q.alt = x.bas.ad + ' perdesinden ' + ADIM_AD[x.harf] + ' (' + ADIM_HARF[x.harf] + ' koma) yukarı hangi perde?';
    const komsu = PERDELER.filter(function (p) { return p !== x.hedef && GOCURME_YAYGIN[p.ad] && Math.abs(p.koma - x.hedef.koma) <= 9; });
    q.siklar = [x.hedef].concat(karistir(komsu).slice(0, 3)).map(function (p) { return { key: p.id, metin: p.ad }; });
    q.dogru = x.hedef.id; q.dogruMetin = x.hedef.ad;
  } else if (tip === 'adimAralik') {
    q.soru = { metin: x.bas.ad + ' → ' + x.hedef.ad };
    q.alt = 'Bu iki perde arasındaki aralık hangisi?';
    q.siklar = ['T', 'K', 'S', 'B'].map(function (h_) { return { key: h_, metin: h_ + ' · ' + ADIM_AD[h_] }; });
    q.dogru = x.harf; q.dogruMetin = x.harf + ' · ' + ADIM_AD[x.harf] + ' (' + ADIM_HARF[x.harf] + ')';
  } else {
    q.tip = 'yer';
    q.soru = { metin: x.bas.ad + ' + ' + x.harf };
    q.alt = ADIM_AD[x.harf] + ' (' + ADIM_HARF[x.harf] + ') yukarıdaki sesi bir sonraki harfe yaz, işaretini seç';
    q.yer = { slotlar: [{ sabit: x.notalar[0] }, {}], palet: 'aeu', beklenen: x.notalar };
    q.dogruMetin = notaKisa(x.notalar[1]) + ' = ' + x.hedef.ad;
  }
  return q;
}

function dogalAralikSorusu() {
  const i = Math.floor(Math.random() * 7);
  const a = HARF_AD[i], b = HARF_AD[(i + 1) % 7];
  const dogru = (i === 2 || i === 6) ? 'B' : 'T';
  return {
    oge: null, tip: 'secim',
    soru: { metin: a + ' – ' + b }, alt: 'İşaretsiz bu iki komşu harf arasındaki doğal aralık?',
    siklar: ['T', 'B', 'K', 'S'].map(function (h_) { return { key: h_, metin: h_ + ' · ' + ADIM_AD[h_] + ' (' + ADIM_HARF[h_] + ')' }; }),
    dogru: dogru, dogruMetin: dogru + ' · ' + ADIM_AD[dogru],
    ipucu: 'Sadece iki çift bakiyedir: Mi–Fa ve Si–Do.',
    aciklama: '<b>' + a + '–' + b + '</b> doğal olarak <b>' + ADIM_AD[dogru] + '</b> (' + ADIM_HARF[dogru] + ' koma). Komşu harfler arası hep tanini (9); yalnızca <b>Mi–Fa</b> ve <b>Si–Do</b> bakiye (4).'
  };
}

function adimUretici(tipler, baslangiclar, harfler, dogalOran) {
  return function (n) {
    const L = [];
    for (let i = 0; i < n; i++) {
      if (dogalOran && Math.random() < dogalOran) { L.push(dogalAralikSorusu()); continue; }
      L.push(adimSorusu(tipler[i % tipler.length], baslangiclar, harfler));
    }
    return karistir(L);
  };
}
function gocurmeSeviyeUretici(asama, tipler) {
  return function (n) {
    const L = [];
    for (let i = 0; i < n; i++) L.push(gocurmeSorusu(asama, tipler[i % tipler.length]));
    return karistir(L);
  };
}

const TUM_HARF = ['T', 'K', 'S', 'B'];
const ADIM_TUM = ADIM_BASLANGIC_TAM.concat(ADIM_BASLANGIC_ISARETLI);

function gUnite(id, no, ad, kisa, seviyeler) { return { id: id, dal: 'gocurme', no: no, ad: ad, kisa: kisa, ogeler: [], seviyeler: seviyeler }; }
const GOCURME_UNITELER = [
  gUnite('g1', 1, 'Aralık adımları', 'Bir perdeden T, K, S, B ile bir adım', [
    { id: 'g1-1', tip: 'seviye', ad: 'Harfler arası doğal aralıklar', soruSay: 7, uret: adimUretici(['adimPerde'], ADIM_BASLANGIC_TAM, ['T', 'B'], 0.7) },
    { id: 'g1-2', tip: 'seviye', ad: 'Bir adım yukarı: hangi perde?', soruSay: 8, uret: adimUretici(['adimPerde'], ADIM_BASLANGIC_TAM, TUM_HARF) },
    { id: 'g1-3', tip: 'seviye', ad: 'İki perde arası hangi aralık?', soruSay: 8, uret: adimUretici(['adimAralik'], ADIM_BASLANGIC_TAM, TUM_HARF) },
    { id: 'g1-yer', tip: 'yer', ad: 'Bir adımı porteye yaz', soruSay: 6, uret: adimUretici(['adimYaz'], ADIM_BASLANGIC_TAM, TUM_HARF) },
    { id: 'g1-boss', tip: 'boss', ad: 'Aralık adımları finali', soruSay: 10, uret: adimUretici(['adimPerde', 'adimAralik', 'adimYaz'], ADIM_BASLANGIC_TAM, TUM_HARF, 0.15) }
  ]),
  gUnite('g2', 2, 'İşaretli seslerden adım', 'Önceki ses işaretliyse aralık nasıl değişir?', [
    { id: 'g2-1', tip: 'seviye', ad: 'İşaretli perdeden bir adım', soruSay: 8, uret: adimUretici(['adimPerde'], ADIM_BASLANGIC_ISARETLI, TUM_HARF) },
    { id: 'g2-2', tip: 'seviye', ad: 'Aralığı bul', soruSay: 8, uret: adimUretici(['adimAralik'], ADIM_BASLANGIC_ISARETLI, TUM_HARF) },
    { id: 'g2-yer', tip: 'yer', ad: 'İşaretli adımı porteye yaz', soruSay: 6, uret: adimUretici(['adimYaz'], ADIM_BASLANGIC_ISARETLI, TUM_HARF) },
    { id: 'g2-boss', tip: 'boss', ad: 'Adımlar finali', soruSay: 10, uret: adimUretici(['adimPerde', 'adimAralik', 'adimYaz'], ADIM_TUM, TUM_HARF) }
  ]),
  gUnite('g3', 3, 'Dörtlüleri göçür', 'Temel dörtlüleri başka perdelere taşı', [
    { id: 'g3-1', tip: 'seviye', ad: 'Göçürülünce hangi perde?', soruSay: 8, uret: gocurmeSeviyeUretici('dortlu', ['perde']) },
    { id: 'g3-2', tip: 'seviye', ad: 'Doğru yazım hangisi?', soruSay: 7, uret: gocurmeSeviyeUretici('dortlu', ['porte']) },
    { id: 'g3-yer', tip: 'yer', ad: 'Göçürülmüş dörtlüyü kur', soruSay: 6, uret: gocurmeSeviyeUretici('dortlu', ['kur']) },
    { id: 'g3-boss', tip: 'boss', ad: 'Dörtlü göçürme finali', soruSay: 10, uret: gocurmeSeviyeUretici('dortlu', ['perde', 'porte', 'kur']) }
  ]),
  gUnite('g4', 4, 'Beşlileri göçür', 'Temel beşlileri başka perdelere taşı', [
    { id: 'g4-1', tip: 'seviye', ad: 'Göçürülünce hangi perde?', soruSay: 8, uret: gocurmeSeviyeUretici('besli', ['perde']) },
    { id: 'g4-2', tip: 'seviye', ad: 'Doğru yazım hangisi?', soruSay: 7, uret: gocurmeSeviyeUretici('besli', ['porte']) },
    { id: 'g4-yer', tip: 'yer', ad: 'Göçürülmüş beşliyi kur', soruSay: 6, uret: gocurmeSeviyeUretici('besli', ['kur']) },
    { id: 'g4-boss', tip: 'boss', ad: 'Beşli göçürme finali', soruSay: 10, uret: gocurmeSeviyeUretici('besli', ['perde', 'porte', 'kur']) }
  ]),
  gUnite('g5', 5, 'Makam dizilerini göçür', 'Bütün diziyi başka perdeye taşı', [
    { id: 'g5-1', tip: 'seviye', ad: 'Güçlü ve diğer sesler', soruSay: 8, uret: gocurmeSeviyeUretici('makam', ['perde']) },
    { id: 'g5-2', tip: 'seviye', ad: 'Doğru dizi hangisi?', soruSay: 7, uret: gocurmeSeviyeUretici('makam', ['porte']) },
    { id: 'g5-yer', tip: 'yer', ad: 'Göçürülmüş diziyi kur', soruSay: 5, uret: gocurmeSeviyeUretici('makam', ['kur']) },
    { id: 'g5-boss', tip: 'boss', ad: 'Göçürme büyük finali', soruSay: 10, uret: gocurmeSeviyeUretici('makam', ['perde', 'porte', 'kur']) }
  ])
];

// ---- Dersler ----
function adimOrnekKarti(baslik, bas, harf, metin) {
  const L = gocurPerde([ADIM_HARF[harf]], PERDE[bas]);
  const hedef = KOMADAN_PERDE[komaOf(L[1])];
  return {
    baslik: baslik,
    cizim: function () { return h('div', { class: 'kartPorte' }, porteSVG({ notalar: L, aralik: 60, etiketler: [bas, hedef.ad] })); },
    metin: gocurmeAdimlari(L) + (metin || '')
  };
}
function ornekGocurme(baslik, yapiAd, araliklar, yer, etiket) {
  const L = gocurPerde(araliklar, PERDE[yer]);
  if (!L) return null;
  const et = L.map(function (n, i) { return i === 0 ? yer : ''; });
  return {
    baslik: baslik,
    cizim: function () { return h('div', { class: 'kartPorte' }, porteSVG({ notalar: L, aralik: L.length > 5 ? 33 : 38, enAz: L.length > 5 ? 320 : 250, etiketler: et })); },
    metin: '<p><b>' + yapiAd + '</b> ' + yer + ' perdesinde: <b>' + L.map(perdeAdiNota).join(' – ') + '</b></p>' + gocurmeAdimlari(L) + (etiket || '')
  };
}
const G_DERS = gocurmeDersi();   // [nedir, koma değerleri, harfler arası, Rast yerinde, Dügâh'ta, kural]

GOCURME_UNITELER[0].ders = function () {
  return [
    { baslik: 'Önce tek adım', metin: '<p>Göçürmenin temeli tek bir adımdır: bir perdeden belli bir aralık kadar yukarı çıkmak.</p><p>Bu ünitede bir perdeden <b>T, K, S</b> ya da <b>B</b> kadar çıkınca hangi perdeye vardığını ve o sesin nasıl yazıldığını öğreneceksin.</p>' },
    G_DERS[1], G_DERS[2],
    adimOrnekKarti('Örnek: Dügâh + K', 'Dügâh', 'K', '<p>La–Si doğal olarak tanini (9). K (8) için bir koma eksik: Si’ye koma bemolü → <b>Segâh</b>.</p>'),
    adimOrnekKarti('Örnek: Bûselik + K', 'Bûselik', 'K', '<p>Si–Do doğal olarak bakiye (4). K (8) için 4 koma daha gerek: Do’ya bakiye diyezi → <b>Nim Hicaz</b>.</p>')
  ];
};
GOCURME_UNITELER[1].ders = function () {
  return [
    { baslik: 'Başlangıç işaretliyse', metin: '<p>Başladığın ses işaretliyse, harfler arası doğal aralık değişir:</p><p><b>Diyezli</b> sesten sonraki harfe mesafe o kadar <b>daralır</b>.<br><b>Bemollü</b> sesten sonraki harfe mesafe o kadar <b>genişler</b>.</p>' },
    adimOrnekKarti('Örnek: Nim Hicaz + S', 'Nim Hicaz', 'S', '<p>Do–Re doğal olarak 9, ama Do 4 koma yükseltilmiş: arada 5 kalıyor. S (5) istendiği için Re işaretsiz → <b>Neva</b>.</p>'),
    adimOrnekKarti('Örnek: Segâh + T', 'Segâh', 'T', '<p>Si–Do doğal olarak 4, ama Si 1 koma alçaltılmış: arada 5 var. T (9) için 4 koma daha gerek: Do’ya bakiye diyezi → <b>Nim Hicaz</b>.</p>'),
    G_DERS[5]
  ];
};
GOCURME_UNITELER[2].ders = function () {
  return [G_DERS[0], G_DERS[3], G_DERS[4], G_DERS[5]];
};
GOCURME_UNITELER[3].ders = function () {
  const k = ornekGocurme('Örnek: Bûselik beşlisi Rast’ta', 'Bûselik beşlisi (T B T T)', CESNI['b-buselik'].araliklar, 'Rast');
  return [{ baslik: 'Beşliyi göçürmek', metin: '<p>Beşlide bir adım fazlası var, kural aynı: her seste sonraki harfi yaz, doğal aralığı bul, gereken aralıkla karşılaştır.</p>' }]
    .concat(k ? [k] : []).concat([G_DERS[5]]);
};
GOCURME_UNITELER[4].ders = function () {
  const m = MAKAM.ussak;
  const k = ornekGocurme('Örnek: Uşşak dizisi Neva’da', 'Uşşak makamı dizisi', m.altC.araliklar.concat(m.ustC.araliklar), 'Neva');
  return [{ baslik: 'Makam dizisini göçürmek', metin: '<p>Makam dizisi bir dörtlü ile bir beşlinin birleşimi olduğu için göçürme yine aynı kuralla yapılır; sadece adım sayısı 7’ye çıkar.</p><p>Güçlü perdesi de diziyle birlikte taşınır: alt parçanın son sesi.</p>' }]
    .concat(k ? [k] : []).concat([G_DERS[5]]);
};
