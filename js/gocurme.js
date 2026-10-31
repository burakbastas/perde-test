// =====================================================
// GÖÇÜRME DALI
// İlk üç ünitede perde adı sorulmaz: öğrenci perde adlarını ezberlememiş olsa da
// göçürmeye başlayabilsin. Arızalı seslerin perde adları cevaptan sonra dipnot olarak verilir.
// Perde adları son ünitede, zorluk arttıkça devreye girer.
// (Tekrar sekmesindeki göçürme antrenmanı da aynı motoru kullanır: makam.js)
// =====================================================
'use strict';

function gocurmeSeviyeUretici(asama, tipler, perdesiz) {
  return function (n) {
    const L = [];
    for (let i = 0; i < n; i++) L.push(gocurmeSorusu(asama, tipler[i % tipler.length], perdesiz));
    return karistir(L);
  };
}

function gUnite(id, no, ad, kisa, seviyeler) { return { id: id, dal: 'gocurme', no: no, ad: ad, kisa: kisa, ogeler: [], seviyeler: seviyeler }; }
const GOCURME_UNITELER = [
  gUnite('gc1', 1, 'Dörtlüleri göçür', 'Aralıklarla hesap: perde adı bilmeden', [
    { id: 'gc1-1', tip: 'seviye', ad: 'Doğru yazım hangisi?', soruSay: 6, uret: gocurmeSeviyeUretici('dortlu', ['porte'], true) },
    { id: 'gc1-yer', tip: 'yer', ad: 'Dörtlüyü porteye kur', soruSay: 5, uret: gocurmeSeviyeUretici('dortlu', ['kur'], true) },
    { id: 'gc1-boss', tip: 'boss', ad: 'Dörtlü göçürme finali', soruSay: 8, uret: gocurmeSeviyeUretici('dortlu', ['porte', 'kur'], true) }
  ]),
  gUnite('gc2', 2, 'Beşlileri göçür', 'Bir adım daha: beşliler', [
    { id: 'gc2-1', tip: 'seviye', ad: 'Doğru yazım hangisi?', soruSay: 6, uret: gocurmeSeviyeUretici('besli', ['porte'], true) },
    { id: 'gc2-yer', tip: 'yer', ad: 'Beşliyi porteye kur', soruSay: 5, uret: gocurmeSeviyeUretici('besli', ['kur'], true) },
    { id: 'gc2-boss', tip: 'boss', ad: 'Beşli göçürme finali', soruSay: 8, uret: gocurmeSeviyeUretici('besli', ['porte', 'kur'], true) }
  ]),
  gUnite('gc3', 3, 'Makam dizilerini göçür', 'Bütün diziyi başka sesten kur', [
    { id: 'gc3-1', tip: 'seviye', ad: 'Doğru dizi hangisi?', soruSay: 6, uret: gocurmeSeviyeUretici('makam', ['porte'], true) },
    { id: 'gc3-yer', tip: 'yer', ad: 'Diziyi porteye kur', soruSay: 4, uret: gocurmeSeviyeUretici('makam', ['kur'], true) },
    { id: 'gc3-boss', tip: 'boss', ad: 'Dizi göçürme finali', soruSay: 8, uret: gocurmeSeviyeUretici('makam', ['porte', 'kur'], true) }
  ]),
  gUnite('gc4', 4, 'Perde adlarıyla göçürme', 'Göçürülen seslerin perde adlarını bul', [
    { id: 'gc4-1', tip: 'seviye', ad: 'Dörtlü ve beşlide hangi perde?', soruSay: 8, uret: gocurmeSeviyeUretici(['dortlu', 'besli'], ['perde']) },
    { id: 'gc4-2', tip: 'seviye', ad: 'Makam dizisinde hangi perde?', soruSay: 8, uret: gocurmeSeviyeUretici('makam', ['perde']) },
    { id: 'gc4-boss', tip: 'boss', ad: 'Göçürme büyük finali', soruSay: 10, uret: gocurmeSeviyeUretici(['dortlu', 'besli', 'makam'], ['perde', 'porte', 'kur', 'perde']) }
  ])
];

// 2.5 · Göçürülmüş (şed) makamlar: kuralı öğrenmiş olan öğrenci, göçürmenin müzikteki karşılığını tanır
GOCURME_UNITELER.push(gUnite('gc5', 5, 'Göçürülmüş (şed) makamlar', 'Mahur, Hicazkâr, Kürdîlihicazkâr, Nihâvend, Sultânîyegâh', [
  { id: 'gc5-1', tip: 'seviye', ad: 'Hangi makamın göçürülmüşü?', soruSay: 8, uret: sedUretici(['kaynak', 'perde']) },
  { id: 'gc5-2', tip: 'seviye', ad: 'Karar, güçlü ve yeden', soruSay: 8, uret: sedUretici(['karar', 'guclu', 'yeden']) },
  { id: 'gc5-3', tip: 'seviye', ad: 'Donanım', soruSay: 8, uret: sedUretici(['donanimMakam', 'makamDonanim']) },
  { id: 'gc5-4', tip: 'seviye', ad: 'Doğru dizi hangisi?', soruSay: 6, uret: sedUretici(['diziDogru']) },
  { id: 'gc5-boss', tip: 'boss', ad: 'Şed makamlar finali', soruSay: 10, uret: sedUretici(['kaynak', 'perde', 'guclu', 'donanimMakam', 'diziDogru', 'benKimim', 'yeden']) }
]));
GOCURME_UNITELER[4].ogeler = SEDLER.map(function (m) { return m.oge; });

// ---- Dersler (perde adı kullanmadan) ----
// Porte üzerinde örnek: alttaki etiketler yalnızca harf adları
function gocurmeOrnegi(baslik, yapiAd, araliklar, baslangicPerde, onMetin) {
  const L = gocurPerde(araliklar, PERDE[baslangicPerde]);
  if (!L) return null;
  return {
    baslik: baslik,
    cizim: function () {
      return h('div', { class: 'kartPorte' }, porteSVG({ notalar: L, aralik: L.length > 5 ? 33 : (L.length > 2 ? 38 : 60), enAz: L.length > 5 ? 320 : 250,
        etiketler: L.map(function (n) { return HARF_AD[n.h]; }) }));
    },
    metin: (onMetin || '') + (yapiAd ? '<p><b>' + yapiAd + '</b> (' + formulMetni(araliklar) + '), ' + HARF_AD[L[0].h] + ayrilmaEki(HARF_AD[L[0].h]) + ' başlayınca: <b>' + L.map(notaKisa).join(' – ') + '</b></p>' : '') +
      gocurmeAdimlari(L, true) + arizaDipnotu(L)
  };
}
function gocurmeTemelDersi() {
  const G = gocurmeDersi();   // [nedir, koma değerleri, harfler arası, Rast yerinde, Dügâh'ta, kural]
  return [
    { baslik: 'Göçürme nedir?', metin:
      '<p><b>Göçürme</b>, bir dörtlüyü, beşliyi ya da makam dizisini <b>başka bir sesten</b> başlatmaktır. <b>Aralıklar aynı kalır</b>; notalar ve işaretleri değişir.</p>' +
      '<p>Bunun için perde adlarını bilmen gerekmez. İki şey yeter: aralıkların kaç koma olduğu ve yan yana iki harf arasındaki doğal aralık.</p>' },
    G[1], G[2],
    gocurmeOrnegi('Tek adım: La’dan K', null, [8], 'Dügâh',
      '<p>La’dan büyük mücenneb (K, 8 koma) yukarı çık. Bir sonraki harf Si. La–Si doğal olarak tanini (9); 8 için bir koma fazla: Si’ye <b>koma bemolü</b>.</p>'),
    gocurmeOrnegi('Önceki ses işaretliyse', null, [5], 'Nim Hicaz',
      '<p>Başladığın ses işaretliyse doğal aralık değişir: <b>diyezli</b> sesten sonraki harfe mesafe o kadar <b>daralır</b>, <b>bemollü</b> sesten sonra <b>genişler</b>.</p>' +
      '<p>Örnek: Do bakiye diyezinden küçük mücenneb (S, 5) yukarı. Do–Re doğal 9, ama Do 4 koma yükselmiş: arada 5 kalıyor. Re işaretsiz.</p>'),
    gocurmeOrnegi('Örnek: Rast dörtlüsü La’dan', 'Rast dörtlüsü', CESNI['d-rast'].araliklar, 'Dügâh',
      '<p>Rast dörtlüsünü La’dan başlat. Her adımda aynı hesap:</p>'),
    G[5]
  ].filter(Boolean);
}

GOCURME_UNITELER[0].ders = gocurmeTemelDersi;
GOCURME_UNITELER[1].ders = function () {
  const k = gocurmeOrnegi('Örnek: Bûselik beşlisi Sol’den', 'Bûselik beşlisi', CESNI['b-buselik'].araliklar, 'Rast');
  return [{ baslik: 'Beşliyi göçürmek', metin: '<p>Beşlide bir adım fazlası var, kural aynı: her seste sonraki harfi yaz, doğal aralığı bul, gereken aralıkla karşılaştır.</p><p>Cevaptan sonra arızalı seslerin perde adlarını <b>dipnotta</b> göreceksin; ezberlemek zorunda değilsin.</p>' }]
    .concat(k ? [k] : []).concat([gocurmeDersi()[5]]);
};
GOCURME_UNITELER[2].ders = function () {
  const m = MAKAM.ussak;
  const k = gocurmeOrnegi('Örnek: Uşşak dizisi Re’den', 'Uşşak makamı dizisi', m.altC.araliklar.concat(m.ustC.araliklar), 'Neva');
  return [{ baslik: 'Makam dizisini göçürmek', metin: '<p>Makam dizisi bir dörtlü ile bir beşlinin birleşimi olduğu için göçürme yine aynı kuralla yapılır; sadece adım sayısı 7’ye çıkar.</p>' }]
    .concat(k ? [k] : []).concat([gocurmeDersi()[5]]);
};
GOCURME_UNITELER[3].ders = function () {
  const G = gocurmeDersi();
  return [
    { baslik: 'Şimdi perde adlarıyla', metin:
      '<p>Hesap aynı. Bu ünitede bir adım daha atıyoruz: göçürdüğün seslerin <b>hangi perde</b> olduğunu da bulacaksın.</p>' +
      '<p>İpucu: önceki ünitelerin dipnotlarında gördüğün arızalı sesler burada işine yarayacak. Perde adlarına takılırsan <b>Perde</b> dalına dön.</p>' },
    G[3], G[4]
  ];
};

GOCURME_UNITELER[4].ders = function () {
  return [
    { baslik: 'Şed nedir?', metin:
      '<p>Bir makamın dizisi başka bir perdeye göçürülünce ortaya yeni bir makam çıkabilir. Böyle makamlara <b>şed</b> (göçürülmüş makam) denir.</p>' +
      '<p>Aralıklar kaynak makamla aynıdır; ama <b>karar perdesi</b>, güçlüsü ve çoğu zaman seyri değiştiği için ayrı bir makam sayılır.</p>' +
      '<p>Bu ünitede beş şed makamı tanıyacaksın. Hepsi bildiğin makamlardan türüyor.</p>' },
    { baslik: 'Hangisi neyin şeddi?', metin:
      '<p><b>Mahur</b> = Çargâh → Rast<br><b>Hicazkâr</b> = Zirgüleli Hicaz → Rast<br><b>Kürdîlihicazkâr</b> = Kürdi → Rast<br><b>Nihâvend</b> = Bûselik → Rast<br><b>Sultânîyegâh</b> = Bûselik → Yegâh</p>' +
      '<p>Dördü <b>Rast</b>’ta karar verir; Sultânîyegâh ise <b>Yegâh</b>’ta.</p>' }
  ].concat(SEDLER.map(makamKarti));
};

// ---- Eski göçürme ilerlemesini yeni üniteye taşı (2.2 → 2.3) ----
// Eski: g1–g2 tek adım (kaldırıldı), g3 dörtlü, g4 beşli, g5 makam dizisi
function gocurmeTasi() {
  if (!DURUM || DURUM.gocV2) return;
  const y = DURUM.yildiz || {};
  const eskiVar = Object.keys(y).some(function (k) { return /^g[1-5]-/.test(k); }) ||
    ['g1', 'g2', 'g3', 'g4', 'g5'].some(function (u) { return (DURUM.ders && DURUM.ders[u]) || (DURUM.altin && DURUM.altin[u]) || (DURUM.sandik && DURUM.sandik[u]); });
  if (eskiVar) {
    const yildizEsle = { 'g3-2': 'gc1-1', 'g3-yer': 'gc1-yer', 'g3-boss': 'gc1-boss',
      'g4-2': 'gc2-1', 'g4-yer': 'gc2-yer', 'g4-boss': 'gc2-boss',
      'g5-2': 'gc3-1', 'g5-yer': 'gc3-yer', 'g5-boss': 'gc3-boss', 'g5-1': 'gc4-2' };
    Object.keys(yildizEsle).forEach(function (eski) { if (y[eski]) y[yildizEsle[eski]] = Math.max(y[yildizEsle[eski]] || 0, y[eski]); });
    if (y['g3-1'] && y['g4-1']) y['gc4-1'] = Math.max(y['gc4-1'] || 0, Math.min(y['g3-1'], y['g4-1']));
    const uniteEsle = { g3: 'gc1', g4: 'gc2', g5: 'gc3' };
    ['ders', 'altin', 'sandik'].forEach(function (alan) {
      const o = DURUM[alan]; if (!o) return;
      Object.keys(uniteEsle).forEach(function (u) { if (o[u]) o[uniteEsle[u]] = o[u]; });
      ['g1', 'g2', 'g3', 'g4', 'g5'].forEach(function (u) { delete o[u]; });
    });
    Object.keys(y).forEach(function (k) { if (/^g[1-5]-/.test(k)) delete y[k]; });
  }
  DURUM.gocV2 = true;
  kaydet();
}
