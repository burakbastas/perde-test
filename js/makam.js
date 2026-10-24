// =====================================================
// MAKAM (10 basit makam) + GÖÇÜRME motoru
// Kaynak: TDV İslâm Ansiklopedisi maddeleri, MEB müzik okulları programı
// =====================================================
'use strict';

const MAKAM_HAM = [
  { id: 'cargah',   ad: 'Çargâh',          alt: ['b-cargah', 'Çargâh'], ust: ['d-cargah', 'Gerdâniye'], karar: 'Çargâh', guclu: 'Gerdâniye', yeden: 'Bûselik',     donanim: [] },
  { id: 'rast',     ad: 'Rast',            alt: ['b-rast', 'Rast'],     ust: ['d-rast', 'Neva'],        karar: 'Rast',   guclu: 'Neva',      yeden: 'Irak',        donanim: ['Si4-k', 'Fa5+bk'],
    not: 'İnerken Neva’daki Rast dörtlüsünün yerini Bûselik dörtlüsü alır (Evç yerine Acem).' },
  { id: 'ussak',    ad: 'Uşşak',           alt: ['d-ussak', 'Dügâh'],   ust: ['b-buselik', 'Neva'],     karar: 'Dügâh',  guclu: 'Neva',      yeden: 'Rast',        donanim: ['Si4-k'] },
  { id: 'kurdi',    ad: 'Kürdi',           alt: ['d-kurdi', 'Dügâh'],   ust: ['b-buselik', 'Neva'],     karar: 'Dügâh',  guclu: 'Neva',      yeden: 'Rast',        donanim: ['Si4-km'] },
  { id: 'huseyni',  ad: 'Hüseyni',         alt: ['b-huseyni', 'Dügâh'], ust: ['d-ussak', 'Hüseyni'],    karar: 'Dügâh',  guclu: 'Hüseyni',   yeden: 'Rast',        donanim: ['Si4-k', 'Fa5+bk'],
    not: 'İnişlerde Evç yerine Acem kullanılınca Uşşak dörtlüsünün yerini Kürdi dörtlüsü alır.' },
  { id: 'buselik',  ad: 'Bûselik',         alt: ['b-buselik', 'Dügâh'], ust: ['d-hicaz', 'Hüseyni'],    karar: 'Dügâh',  guclu: 'Hüseyni',   yeden: 'Nim Zirgüle', donanim: [],
    ust2: ['d-kurdi', 'Hüseyni'], donanimYazilmaz: true,
    not: 'İkinci dizi: Bûselik beşlisi + Hüseyni’de Kürdi dörtlüsü. Donanıma işaret yazılmaz; değişiklikler nota üzerinde gösterilir.' },
  { id: 'hicaz',    ad: 'Hicaz',           alt: ['d-hicaz', 'Dügâh'],   ust: ['b-rast', 'Neva'],        karar: 'Dügâh',  guclu: 'Neva',      yeden: 'Rast',        donanim: ['Si4-bk', 'Fa5+bk', 'Do5+bk'] },
  { id: 'humayun',  ad: 'Hümayun',         alt: ['d-hicaz', 'Dügâh'],   ust: ['b-buselik', 'Neva'],     karar: 'Dügâh',  guclu: 'Neva',      yeden: 'Rast',        donanim: ['Si4-bk', 'Do5+bk'] },
  { id: 'uzzal',    ad: 'Uzzal',           alt: ['b-hicaz', 'Dügâh'],   ust: ['d-ussak', 'Hüseyni'],    karar: 'Dügâh',  guclu: 'Hüseyni',   yeden: 'Rast',        donanim: ['Si4-bk', 'Fa5+bk', 'Do5+bk'] },
  { id: 'zirguleli',ad: 'Zirgüleli Hicaz', alt: ['b-hicaz', 'Dügâh'],   ust: ['d-hicaz', 'Hüseyni'],    karar: 'Dügâh',  guclu: 'Hüseyni',   yeden: 'Nim Zirgüle', donanim: ['Si4-bk', 'Fa5+k', 'Do5+bk', 'Sol5+bk'] }
];
const MAKAM_PERDE_SECENEK = ['Rast', 'Dügâh', 'Segâh', 'Bûselik', 'Çargâh', 'Neva', 'Hüseyni', 'Gerdâniye', 'Irak', 'Nim Zirgüle', 'Acem', 'Evç'];

// ---- Göçürme motoru ----
// Aralıkları (koma) verilen bir yapıyı, verilen ilk notadan başlayarak yazar.
// Her ses bir sonraki harfe yazılır; koma farkı AEU işaretiyle gösterilir.
function gocurNota(araliklar, ilk) {
  const L = [ilk];
  let k = komaOf(ilk);
  for (let i = 0; i < araliklar.length; i++) {
    const on = L[L.length - 1];
    const h_ = (on.h + 1) % 7, o = on.o + (on.h === 6 ? 1 : 0);
    k += araliklar[i];
    const a = farktanAeu(k - (o * 53 + KOMA_TABAN[h_]));
    if (a === undefined) return null;
    L.push({ h: h_, o: o, a: a });
  }
  return L;
}
// Bir perdeden başlayarak göçür: iki yazımdan geçerli olanı ve en az işaretli olanı seç
function gocurPerde(araliklar, perde, smin, smax) {
  smin = smin || 27; smax = smax || 43;
  let en = null, enPuan = 1e9;
  perde.parcalar.forEach(function (ilk) {
    const L = gocurNota(araliklar, ilk);
    if (!L) return;
    if (!L.every(function (n) { return KOMADAN_PERDE[komaOf(n)] && adim(n) >= smin && adim(n) <= smax; })) return;
    // perdenin bilinen yazımları tercih edilir (Segâh = Si koma bemol, Nim Hicaz = Do bakiye diyez…)
    const bilinmeyen = L.filter(function (n) { return !KOMADAN_PERDE[komaOf(n)].parcalar.some(function (x) { return x.h === n.h && (x.a || null) === (n.a || null); }); }).length;
    const puan = L.filter(function (n) { return n.a; }).length + 10 * bilinmeyen;
    if (puan < enPuan) { en = L; enPuan = puan; }
  });
  return en;
}

const MAKAMLAR = MAKAM_HAM.map(function (m) {
  const alt = CESNI[m.alt[0]], ust = CESNI[m.ust[0]];
  const dizi = gocurPerde(alt.araliklar.concat(ust.araliklar), PERDE[m.karar], 20, 50);
  const o = Object.assign({}, m, {
    oge: 'm:' + m.id,
    altC: alt, ustC: ust,
    altAd: alt.ad + ' (' + m.alt[1] + ')', ustAd: ust.ad + ' (' + m.ust[1] + ')',
    dizi: dizi, gucluIdx: alt.notalar.length - 1,
    donanimNota: m.donanim.map(function (x) { return notaOku(x); })
  });
  if (!dizi) console.warn('Makam dizisi yazılamadı: ' + m.ad);
  // denetim: güçlü perde dizideki birleşme sesi mi?
  if (dizi && KOMADAN_PERDE[komaOf(dizi[o.gucluIdx])] !== PERDE[m.guclu] && KOMADAN_PERDE[komaOf(dizi[o.gucluIdx])].ad !== m.ust[1]) console.warn(m.ad + ': güçlü uyuşmuyor');
  if (dizi && KOMADAN_PERDE[komaOf(dizi[o.gucluIdx])].ad !== m.ust[1]) console.warn(m.ad + ': üst parça yeri uyuşmuyor');
  // denetim: donanım dizideki işaretlerle tutarlı mı?
  if (dizi && !m.donanimYazilmaz) {
    const d1 = benzersiz(dizi.filter(function (n) { return n.a; }).map(function (n) { return n.h + n.a; })).sort().join();
    const d2 = benzersiz(o.donanimNota.map(function (n) { return n.h + n.a; })).sort().join();
    if (d1 !== d2) console.warn(m.ad + ': donanım dizi ile tutarsız ' + d1 + ' / ' + d2);
  }
  return o;
});
const MAKAM = {};
MAKAMLAR.forEach(function (m) { MAKAM[m.id] = m; });
function makamlar(idler) { return idler.map(function (i) { return MAKAM[i]; }); }

function donanimAnahtar(m) { return m.donanimNota.map(function (n) { return n.h + n.a; }).sort().join() || '-'; }
function diziAnahtar(m) { return m.dizi.map(function (n) { return komaOf(n); }).join(); }

function makamDiziPorte(m) {
  const et = m.dizi.map(function () { return ''; });
  et[0] = 'karar'; et[m.gucluIdx] = 'güçlü';
  return { notalar: m.dizi.map(function (n, i) { return i === m.gucluIdx ? Object.assign({ renk: 'var(--vurgu)' }, n) : n; }), aralik: 34, enAz: 330, etiketler: et };
}
function makamAciklama(m) {
  return '<b>' + m.ad + '</b> = ' + m.altAd + ' + ' + m.ustAd + '<br>Karar: ' + m.karar + ' · Güçlü: ' + m.guclu + ' · Yeden: ' + m.yeden +
    '<br><span class="soluk">Donanım: ' + (m.donanimYazilmaz ? 'yazılmaz' : (m.donanimNota.length ? m.donanimNota.map(function (n) { return HARF_AD[n.h] + ' ' + isaretAdi(n.a); }).join(', ') : 'yok')) + '</span>';
}
function makamCeldirici(m, havuz, sayi, ayirt) {
  return karistir(havuz.filter(function (x) { return x !== m && (!ayirt || ayirt(x) !== ayirt(m)); })).slice(0, sayi);
}
function parcaKey(c, yer) { return c + '@' + yer; }
function parcaMetin(key) { const p = key.split('@'); return CESNI[p[0]].ad + ' · ' + p[1]; }

function makamSoru(tip, m, havuz) {
  const q = { oge: m.oge, tip: 'secim', aciklama: makamAciklama(m), ipucu: 'Karar: ' + m.karar + ', güçlü: ' + m.guclu };
  const adSik = function (L) { return L.map(function (x) { return { key: x.id, metin: x.ad }; }); };
  if (tip === 'parcaAd') {
    q.soru = { metin: m.altAd + ' + ' + m.ustAd, kucuk: true }; q.alt = 'Bu birleşim hangi makamın dizisi?';
    q.siklar = adSik([m].concat(makamCeldirici(m, havuz, 3)));
    q.dogru = m.id; q.dogruMetin = m.ad;
  } else if (tip === 'karar' || tip === 'guclu' || tip === 'yeden') {
    const ad = { karar: 'karar', guclu: 'güçlü', yeden: 'yeden' }[tip];
    q.soru = { metin: m.ad }; q.alt = 'Bu makamın ' + ad + ' perdesi hangisi?';
    const dogru = m[tip];
    const dis = karistir(MAKAM_PERDE_SECENEK.filter(function (x) { return x !== dogru; })).slice(0, 3);
    q.siklar = [dogru].concat(dis).map(function (x) { return { key: x, metin: x }; });
    q.dogru = dogru; q.dogruMetin = dogru;
    q.ipucu = tip === 'guclu' ? 'Güçlü, alt ve üst parçanın birleştiği perdedir: ' + m.ustAd : tip === 'karar' ? 'Alt parçanın yeri' : 'Kararın hemen altındaki ses';
  } else if (tip === 'donanimMakam') {
    q.soru = { porte: { notalar: [], donanim: m.donanimNota, enAz: 160 } }; q.alt = 'Bu donanım hangi makamın?';
    q.siklar = adSik([m].concat(makamCeldirici(m, havuz.filter(function (x) { return !x.donanimYazilmaz; }), 3, donanimAnahtar)));
    q.dogru = m.id; q.dogruMetin = m.ad;
  } else if (tip === 'makamDonanim') {
    q.soru = { metin: m.ad }; q.alt = 'Donanımı hangisi?';
    const dis = benzersiz(makamCeldirici(m, MAKAMLAR.filter(function (x) { return !x.donanimYazilmaz; }), 9, donanimAnahtar), donanimAnahtar).slice(0, 3);
    q.siklar = [m].concat(dis).map(function (x) { return { key: x.id, porte: { notalar: [], donanim: x.donanimNota, enAz: 140 } }; });
    q.dogru = m.id; q.dogruMetin = m.donanimNota.length ? m.donanimNota.map(function (n) { return HARF_AD[n.h] + ' ' + isaretAdi(n.a); }).join(', ') : 'Donanımsız';
  } else if (tip === 'diziMakam') {
    q.soru = { porte: makamDiziPorte(m) }; q.alt = 'Bu dizi hangi makamın?';
    q.siklar = adSik([m].concat(makamCeldirici(m, havuz, 3, diziAnahtar)));
    q.dogru = m.id; q.dogruMetin = m.ad;
  } else if (tip === 'benKimim') {
    q.tip = 'secim';
    q.soru = { metin: 'Ben kimim?' }; q.alt = 'İpuçlarına bak; ne kadar az ipucuyla bilirsen o kadar iyi!';
    q.ipuclari = [
      'Kararım ' + m.karar + ' perdesi.',
      'Güçlüm ' + m.guclu + ' perdesi.',
      'Alt parçam: ' + m.altAd + '.',
      'Üst parçam: ' + m.ustAd + '.'
    ];
    q.siklar = adSik([m].concat(makamCeldirici(m, havuz, 3)));
    q.dogru = m.id; q.dogruMetin = m.ad;
    q.ipucu = null;
  } else if (tip === 'makamKur') {
    q.tip = 'dizi';
    q.soru = { metin: m.ad }; q.alt = 'Makamın dizisini kur: önce alt parça, sonra üst parça';
    const dogru = [parcaKey(m.alt[0], m.alt[1]), parcaKey(m.ust[0], m.ust[1])];
    const kabul = [dogru];
    if (m.ust2) kabul.push([dogru[0], parcaKey(m.ust2[0], m.ust2[1])]);
    let parcalar = [];
    MAKAMLAR.forEach(function (x) {
      parcalar.push(parcaKey(x.alt[0], x.alt[1]));
      parcalar.push(parcaKey(x.ust[0], x.ust[1]));
    });
    parcalar = karistir(benzersiz(parcalar).filter(function (k) { return dogru.indexOf(k) < 0 && !(m.ust2 && k === parcaKey(m.ust2[0], m.ust2[1])); })).slice(0, 4);
    if (m.ust2) parcalar[0] = parcaKey(m.ust2[0], m.ust2[1]);   // Bûselik’in ikinci dizisi de seçilebilir ve doğru sayılır
    q.dizi = { havuz: karistir(dogru.concat(parcalar)).map(function (k) { return { key: k, metin: parcaMetin(k) }; }), uzunluk: 2, beklenen: dogru, kabul: kabul, tekrarli: false, genis: true };
    q.dogruMetin = m.altAd + ' + ' + m.ustAd;
  }
  return q;
}

function makamUretici(o) {
  return function (n) {
    const havuz = makamlar(o.havuz);
    const yeni = o.yeni ? makamlar(o.yeni) : [];
    const L = [];
    let onceki = null;
    for (let j = 0; j < n; j++) {
      let m = null;
      for (let d = 0; d < 10; d++) {
        m = rastgele(yeni.length && Math.random() < (o.yeniOran || 0.65) ? yeni : havuz);
        if (m !== onceki) break;
      }
      onceki = m;
      let tip = o.tipler[j % o.tipler.length];
      if (tip === 'donanimMakam' && m.donanimYazilmaz) tip = 'makamDonanim';
      if (tip === 'makamDonanim' && m.donanimYazilmaz) tip = 'parcaAd';
      L.push(makamSoru(tip, m, havuz));
    }
    return karistir(L);
  };
}

const MK_KIMLIK = ['parcaAd', 'karar', 'guclu', 'yeden'];
const MK_TANI = ['benKimim', 'diziMakam'];
const MK_DON = ['donanimMakam', 'makamDonanim'];

function mkUnite(id, no, ad, kisa, ogeler, havuz) {
  return {
    id: id, dal: 'makam', no: no, ad: ad, kisa: kisa,
    ogeler: ogeler.map(function (i) { return 'm:' + i; }),
    seviyeler: [
      { id: id + '-1', tip: 'seviye', ad: 'Parçalar ve kimlik kartı', soruSay: 8, uret: makamUretici({ havuz: havuz, yeni: ogeler, tipler: MK_KIMLIK }) },
      { id: id + '-2', tip: 'seviye', ad: 'Ben kimim? ve dizi', soruSay: 8, uret: makamUretici({ havuz: havuz, yeni: ogeler, tipler: MK_TANI }) },
      { id: id + '-3', tip: 'seviye', ad: 'Donanım', soruSay: 8, uret: makamUretici({ havuz: havuz, yeni: ogeler, tipler: MK_DON }) },
      { id: id + '-yer', tip: 'yer', ad: 'Makamı kur', soruSay: 6, uret: makamUretici({ havuz: havuz, yeni: ogeler, yeniOran: 0.75, tipler: ['makamKur'] }) },
      { id: id + '-boss', tip: 'boss', ad: 'Ünite finali', soruSay: 10, uret: makamUretici({ havuz: havuz, yeni: ogeler, tipler: MK_KIMLIK.concat(MK_TANI, MK_DON, ['makamKur']) }) }
    ]
  };
}

const MAKAM_UNITELER = [
  mkUnite('mk1', 1, 'İlk makamlar', 'Çargâh, Rast, Uşşak, Kürdi', ['cargah', 'rast', 'ussak', 'kurdi'], ['cargah', 'rast', 'ussak', 'kurdi']),
  mkUnite('mk2', 2, 'Hüseyni ve Bûselik', 'Güçlüsü Hüseyni olan iki makam', ['huseyni', 'buselik'], ['cargah', 'rast', 'ussak', 'kurdi', 'huseyni', 'buselik']),
  mkUnite('mk3', 3, 'Hicaz ailesi', 'Hicaz, Hümayun, Uzzal, Zirgüleli Hicaz', ['hicaz', 'humayun', 'uzzal', 'zirguleli'], MAKAMLAR.map(function (m) { return m.id; }))
];

function makamKarti(m) {
  return {
    baslik: m.ad,
    cizim: function () {
      return h('div', null,
        h('div', { class: 'kartPorte' }, porteSVG(makamDiziPorte(m))),
        m.donanimNota.length ? h('div', { class: 'kartPorte kucuk' }, porteSVG({ notalar: [], donanim: m.donanimNota, enAz: 150 })) : null);
    },
    metin: '<p><b>' + kacis(m.altAd) + '</b> + <b>' + kacis(m.ustAd) + '</b></p>' +
      '<p>Karar: <b>' + m.karar + '</b> · Güçlü: <b>' + m.guclu + '</b> · Yeden: <b>' + m.yeden + '</b></p>' +
      '<p>Donanım: ' + (m.donanimYazilmaz ? 'işaret yazılmaz' : m.donanimNota.length ? m.donanimNota.map(function (n) { return HARF_AD[n.h] + ' ' + isaretAdi(n.a); }).join(', ') : 'yok') + '</p>' +
      (m.not ? '<p class="soluk">' + kacis(m.not) + '</p>' : '')
  };
}

MAKAM_UNITELER[0].ders = function () {
  return [
    { baslik: 'Makam nedir?', metin:
      '<p>Bir makamın <b>dizisi</b>, bir dörtlü ile bir beşlinin (ya da bir beşli ile bir dörtlünün) birleşmesinden oluşur.</p>' +
      '<p><b>Karar</b>: makamın bittiği, durduğu perde. <b>Güçlü</b>: iki parçanın birleştiği, makamın en önemli ikinci perdesi. <b>Yeden</b>: kararın hemen altındaki, karara çeken ses.</p>' +
      '<p><b>Donanım</b>: dizideki değişmez işaretlerin anahtarın yanına yazılması.</p>' }
  ].concat(makamlar(['cargah', 'rast', 'ussak', 'kurdi']).map(makamKarti));
};
MAKAM_UNITELER[1].ders = function () {
  return [{ baslik: 'Güçlüsü Hüseyni', metin: '<p>Bu iki makamın alt parçası bir <b>beşli</b>, bu yüzden güçlü perdesi Neva değil <b>Hüseyni</b>.</p>' }]
    .concat(makamlar(['huseyni', 'buselik']).map(makamKarti));
};
MAKAM_UNITELER[2].ders = function () {
  return [{ baslik: 'Hicaz ailesi', metin:
    '<p>Dört makamın da kararı <b>Dügâh</b> ve hepsinde Hicaz çeşnisi var. Farkları parçalarda:</p>' +
    '<p><b>Hicaz</b>: Hicaz dörtlüsü + Rast beşlisi<br><b>Hümayun</b>: Hicaz dörtlüsü + Bûselik beşlisi<br><b>Uzzal</b>: Hicaz beşlisi + Uşşak dörtlüsü<br><b>Zirgüleli Hicaz</b>: Hicaz beşlisi + Hicaz dörtlüsü</p>' +
    '<p>Hicaz ile Uzzal’ın sesleri aynıdır; ayıran şey güçlüleri: Neva ve Hüseyni.</p>' }]
    .concat(makamlar(['hicaz', 'humayun', 'uzzal', 'zirguleli']).map(makamKarti));
};

function makamOgeSorusu(id) {
  const m = MAKAMLAR.find(function (x) { return x.oge === id; });
  let tip = rastgele(MK_KIMLIK.concat(MK_TANI, MK_DON, ['makamKur']));
  if ((tip === 'donanimMakam' || tip === 'makamDonanim') && m.donanimYazilmaz) tip = 'parcaAd';
  return makamSoru(tip, m, MAKAMLAR);
}

// =====================================================
// GÖÇÜRME ANTRENMANI
// =====================================================
const GOCURME_BASLANGIC = ['Yegâh', 'Hüseyni Aşiran', 'Acem Aşiran', 'Irak', 'Rast', 'Dügâh', 'Kürdi', 'Segâh', 'Bûselik', 'Çargâh',
  'Nim Hicaz', 'Neva', 'Hüseyni', 'Acem', 'Evç', 'Gerdâniye', 'Zirgüle', 'Nim Zirgüle', 'Dik Kürdi', 'Hisar'];
const SIRA_AD = ['1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.'];

// Bir yapının (aralıklar, ad, orijinal yer) geçerli bir göçürmesini bul
// Göçürme sonuçları sık kullanılan perdelerde (1–3. paket) kalsın
const GOCURME_YAYGIN = {};
PAKET.slice(0, 3).forEach(function (pk) { pk.forEach(function (ad) { GOCURME_YAYGIN[ad] = true; }); });
function gocurmeBul(araliklar, orijinalYer) {
  const adaylar = karistir(perdeler(GOCURME_BASLANGIC).filter(function (p) { return p.ad !== orijinalYer; }));
  for (let i = 0; i < adaylar.length; i++) {
    const L = gocurPerde(araliklar, adaylar[i]);
    if (L && L.every(function (n) { return GOCURME_YAYGIN[KOMADAN_PERDE[komaOf(n)].ad]; })) return { perde: adaylar[i], notalar: L };
  }
  return null;
}
// bir notanın işaretini komşu bir işaretle değiştir (yanlış şık için)
function yanlisYazim(notalar) {
  const L = notalar.map(function (n) { return Object.assign({}, n); });
  const i = 1 + Math.floor(Math.random() * (L.length - 1));
  const sec = [null, '+k', '-k', '+bk', '-bk', '+km', '-km', '+bm', '-bm'].filter(function (a) { return a !== L[i].a; });
  // yakın işaretleri tercih et
  const yakin = sec.filter(function (a) { return Math.abs(aeuFark(a) - aeuFark(L[i].a)) <= 5; });
  L[i].a = rastgele(yakin.length ? yakin : sec);
  return L;
}

function gocurmeSorusu(asama, tip) {
  let yapi, ad, yer, gucluIdx = null, oge = null;
  if (asama === 'makam') {
    const m = rastgele(MAKAMLAR);
    yapi = m.altC.araliklar.concat(m.ustC.araliklar); ad = m.ad + ' makamı dizisi'; yer = m.karar; gucluIdx = m.gucluIdx;
  } else {
    const c = rastgele(cesniler(asama === 'dortlu' ? D_TEMEL : B_TEMEL));
    yapi = c.araliklar; ad = c.ad; yer = c.yer; oge = c.oge;
  }
  const g = gocurmeBul(yapi, yer);
  if (!g) return gocurmeSorusu(asama, tip);
  const hedef = g.perde.ad;
  const r = tip === 'perde' ? 0.1 : tip === 'porte' ? 0.5 : tip === 'kur' ? 0.9 : Math.random();
  const aciklama = '<b>' + ad + '</b> ' + hedef + ' perdesinde: ' +
    g.notalar.map(function (n) { return KOMADAN_PERDE[komaOf(n)].ad; }).join(' – ') +
    gocurmeAdimlari(g.notalar);
  if (r < 0.4) {
    // n. ses hangi perde
    let i = gucluIdx && Math.random() < 0.5 ? gucluIdx : 1 + Math.floor(Math.random() * (g.notalar.length - 1));
    const dogru = KOMADAN_PERDE[komaOf(g.notalar[i])];
    const komsu = PERDELER.filter(function (p) { return p !== dogru && Math.abs(p.koma - dogru.koma) <= 9; });
    const dis = karistir(komsu).slice(0, 3);
    return {
      oge: oge, tip: 'secim',
      soru: { metin: ad + ' → ' + hedef, kucuk: true },
      alt: (i === gucluIdx ? 'Güçlü perdesi (' + SIRA_AD[i] + ' ses)' : SIRA_AD[i] + ' ses') + ' hangi perde olur?',
      siklar: [dogru].concat(dis).map(function (p) { return { key: p.id, metin: p.ad }; }),
      dogru: dogru.id, dogruMetin: dogru.ad, aciklama: aciklama,
      ipucu: 'Aralık dizilişi aynı kalır, sadece başlangıç perdesi değişir.'
    };
  }
  if (r < 0.75) {
    const yanlislar = [];
    for (let d = 0; d < 20 && yanlislar.length < 3; d++) {
      const y = yanlisYazim(g.notalar);
      const k = JSON.stringify(y);
      if (k !== JSON.stringify(g.notalar) && yanlislar.every(function (x) { return x.k !== k; })) yanlislar.push({ k: k, n: y });
    }
    const genis = g.notalar.length > 5;
    return {
      oge: oge, tip: 'secim',
      soru: { metin: ad + ' → ' + hedef, kucuk: true }, alt: 'Doğru yazım hangisi?',
      siklar: [{ key: 'd', porte: { notalar: g.notalar, aralik: genis ? 33 : 38, enAz: genis ? 320 : 250 }, genis: true }]
        .concat(yanlislar.map(function (y, i) { return { key: 'y' + i, porte: { notalar: y.n, aralik: genis ? 33 : 38, enAz: genis ? 320 : 250 }, genis: true }; })),
      dogru: 'd', dogruMetin: g.notalar.map(perdeAdiNota).join(' – '), aciklama: aciklama,
      ipucu: 'Her sesin perdesini bul, sonra o harfe göre işaretini seç.'
    };
  }
  return {
    oge: oge, tip: 'yer',
    soru: { metin: ad + ' → ' + hedef, kucuk: true }, alt: 'İlk ses verildi. Göçürülmüş diziyi porteye kur',
    yer: { slotlar: g.notalar.map(function (n, i) { return i === 0 ? { sabit: n } : {}; }), palet: 'aeu', beklenen: g.notalar },
    dogruMetin: g.notalar.map(function (n) { return KOMADAN_PERDE[komaOf(n)].ad; }).join(' – '),
    aciklama: aciklama, ipucu: 'Her ses bir sonraki harfe yazılır.'
  };
}
function gocurmeUretici(asama) {
  return function (n) { const L = []; for (let i = 0; i < n; i++) L.push(gocurmeSorusu(asama)); return L; };
}
const GOCURME_ASAMALAR = [
  { id: 'dortlu', ad: 'Dörtlüleri göçür', ikon: '4️⃣', uret: gocurmeUretici('dortlu') },
  { id: 'besli', ad: 'Beşlileri göçür', ikon: '5️⃣', uret: gocurmeUretici('besli') },
  { id: 'makam', ad: 'Makam dizilerini göçür', ikon: '🏵️', uret: gocurmeUretici('makam') }
];
// ---- Göçürmenin hesabı (adım adım) ----
// Her harfin oktav içindeki doğal yeri (koma): Do 0, Re 9, Mi 18, Fa 22, Sol 31, La 40, Si 49
function perdeAdiNota(n) { const p = KOMADAN_PERDE[komaOf(n)]; return p ? p.ad : notaMetni(n); }
function notaKisa(n) { return HARF_AD[n.h] + (n.a ? ' ' + isaretAdi(n.a).replace(/ (diyezi|bemolü)$/, function (m) { return m === ' diyezi' ? ' diyez' : ' bemol'; }) : ''); }
// Göçürme: her adımda iki harf arasındaki doğal aralığı (tanini 9 ya da bakiye 4)
// gereken aralıkla karşılaştır; önceki ses işaretliyse onu da hesaba kat. Fark yeni sesin işaretidir.
const ARALIK_ADI = { 1: 'koma', 4: 'bakiye', 5: 'küçük mücenneb', 8: 'büyük mücenneb', 9: 'tanini', 12: 'artık ikili', 13: 'artık ikili' };
const YONELME_EKI = ['’ya', '’ye', '’ye', '’ya', '’e', '’ya', '’ye'];   // Do’ya, Re’ye, Mi’ye, Fa’ya, Sol’e, La’ya, Si’ye
function dogalAralik(n) { return n.h === 2 || n.h === 6 ? 4 : 9; }   // Mi–Fa ve Si–Do bakiye, diğerleri tanini
function gocurmeAdimlari(notalar) {
  const L = [];
  const ilk = notalar[0];
  L.push('<li>Başlangıç: <b>' + perdeAdiNota(ilk) + '</b> (' + notaKisa(ilk) + ')</li>');
  for (let i = 1; i < notalar.length; i++) {
    const on = notalar[i - 1], n = notalar[i];
    const gereken = komaOf(n) - komaOf(on);
    const dogal = dogalAralik(on), e = aeuFark(on.a), mevcut = dogal - e, fark = gereken - mevcut;
    let s = '<li>' + HARF_AD[on.h] + ' → ' + HARF_AD[n.h] + ': doğal aralık ' + ARALIK_ADI[dogal] + ' (' + dogal + ')';
    if (e) s += ', ama ' + HARF_AD[on.h] + ' ' + Math.abs(e) + ' koma ' + (e > 0 ? 'yükseltilmiş' : 'alçaltılmış') + ' → arada ' + dogal + (e > 0 ? ' − ' : ' + ') + Math.abs(e) + ' = ' + mevcut;
    s += '. Gereken <b>' + (ARALIK_HARF[gereken] || '?') + '</b> (' + ARALIK_ADI[gereken] + ', ' + gereken + '). ';
    s += gereken + ' − ' + mevcut + ' = ' + (fark > 0 ? '+' : '') + fark + ' → ' + (fark === 0 ? HARF_AD[n.h] + ' işaretsiz' : HARF_AD[n.h] + YONELME_EKI[n.h] + ' ' + isaretAdi(n.a)) + ' → <b>' + perdeAdiNota(n) + '</b></li>';
    L.push(s);
  }
  return '<div class="hesapBaslik">🧮 Hesap</div><ol class="hesap">' + L.join('') + '</ol>';
}
const HARF_ARALIK_TABLOSU = '<div class="harfAralik">' + [['Do', 'Re', 9], ['Re', 'Mi', 9], ['Mi', 'Fa', 4], ['Fa', 'Sol', 9], ['Sol', 'La', 9], ['La', 'Si', 9], ['Si', 'Do', 4]].map(function (x) {
  return '<span class="' + (x[2] === 4 ? 'bakiyeli' : '') + '"><b>' + x[0] + '–' + x[1] + '</b>' + (x[2] === 4 ? 'B · 4' : 'T · 9') + '</span>';
}).join('') + '</div>';

function gocurmeDersi() {
  const rast = CESNI['d-rast'];
  const ornek = gocurPerde(rast.araliklar, PERDE['Dügâh']);
  return [
    { baslik: 'Göçürme nedir?', metin:
      '<p><b>Göçürme</b>, bir dörtlüyü, beşliyi ya da makam dizisini başka bir perdeye taşımaktır. <b>Aralıklar aynı kalır</b>, perdeler değişir.</p>' +
      '<p>Bunun için iki şeyi bilmek yeter: aralıkların kaç koma olduğu ve yan yana iki harf arasındaki doğal aralık.</p>' },
    { baslik: 'Aralıkların koma değerleri', cizim: komaCetveliSVG, metin:
      '<p><b>T</b> tanini = <b>9</b> koma<br><b>K</b> büyük mücenneb = <b>8</b> koma<br><b>S</b> küçük mücenneb = <b>5</b> koma<br><b>B</b> bakiye = <b>4</b> koma<br><b>A</b> artık ikili = <b>12–13</b> koma</p>' +
      '<p>Örnek: Rast dörtlüsü <b>T K S</b>: tanini (9), büyük mücenneb (8), küçük mücenneb (5).</p>' },
    { baslik: 'Harfler arası doğal aralıklar', metin:
      '<p>İşaretsiz iki komşu harf arasındaki aralık hep aynıdır:</p>' + HARF_ARALIK_TABLOSU +
      '<p>Çoğu komşu harf arası <b>tanini</b> (T, 9 koma). Yalnızca <b>Mi–Fa</b> ve <b>Si–Do</b> arası <b>bakiye</b>dir (B, 4 koma); tanini değil.</p>' },
    { baslik: 'Önce yerinde: Rast’ta Rast dörtlüsü', cizim: function () {
        return h('div', { class: 'kartPorte' }, porteSVG({ notalar: rast.notalar, aralik: 38, enAz: 240, etiketler: ['Rast', 'T', 'K', 'S'] }));
      }, metin: gocurmeAdimlari(rast.notalar) +
      '<p>La–Si doğal olarak tanini (9), ama dörtlü burada K (8) istiyor: 8 − 9 = −1 → Si’ye <b>koma bemolü</b>. Si koma bemol = <b>Segâh</b>.</p>' },
    { baslik: 'Dügâh’a göçür: adım adım', cizim: function () {
        return h('div', { class: 'kartPorte' }, porteSVG({ notalar: ornek, aralik: 38, enAz: 240, etiketler: ['Dügâh', 'T', 'K', 'S'] }));
      }, metin: gocurmeAdimlari(ornek) +
      '<p>Aralıklar aynı kalmalı: <b>T K S</b>. Ama Dügâh’tan başlayınca harfler arası doğal aralıklar değişiyor: Si–Do bir bakiye (4). K (8) olması için Do’ya <b>bakiye diyezi</b> gerekiyor (8 − 4 = +4) → <b>Nim Hicaz</b>. Sonra Do zaten 4 koma yükseldiği için Do–Re arası 9 − 4 = 5 kalıyor; bu da istenen S (5), Re işaretsiz kalıyor. Sonuç: <b>' +
      ornek.map(perdeAdiNota).join(' – ') + '</b>.</p>' },
    { baslik: 'Kural', metin:
      '<p>Her adımda:</p><p>1️⃣ Bir sonraki <b>harfi</b> yaz.<br>2️⃣ İki harf arasındaki <b>doğal aralığı</b> bul: tanini (9), Mi–Fa ve Si–Do’da bakiye (4). Önceki ses işaretliyse onu da hesaba kat: diyezliyse aralık o kadar daralır, bemollüyse genişler.<br>3️⃣ <b>Gereken aralıkla</b> karşılaştır: aradaki fark yeni sesin işaretidir.</p>' +
      '<p><b>+1</b> koma diyezi · <b>+4</b> bakiye diyezi · <b>+5</b> küçük mücenneb diyezi · <b>+8</b> büyük mücenneb diyezi<br>Eksi değerler aynı adlı bemoller.</p>' +
      '<p>Fark bu sayılardan biri değilse (ör. +3), yapı o perdeden bu yazımla kurulamaz; başlangıç perdesinin öteki yazımını dene.</p>' }
  ];
}
