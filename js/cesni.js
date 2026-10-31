// =====================================================
// DÖRTLÜ-BEŞLİ (çeşniler)
// =====================================================
'use strict';

// [id, ad, tür, yeri (karar perdesi), notalar, beklenen formül (denetim için)]
const CESNI_HAM = [
  ['d-cargah',  'Çargâh Dörtlüsü',  'Dörtlü', 'Çargâh', 'Do5 Re5 Mi5 Fa5',               'TTB'],
  ['d-buselik', 'Bûselik Dörtlüsü', 'Dörtlü', 'Dügâh',  'La4 Si4 Do5 Re5',               'TBT'],
  ['d-kurdi',   'Kürdi Dörtlüsü',   'Dörtlü', 'Dügâh',  'La4 Si4-km Do5 Re5',            'BTT'],
  ['d-rast',    'Rast Dörtlüsü',    'Dörtlü', 'Rast',   'Sol4 La4 Si4-k Do5',            'TKS'],
  ['d-ussak',   'Uşşak Dörtlüsü',   'Dörtlü', 'Dügâh',  'La4 Si4-k Do5 Re5',             'KST'],
  ['d-hicaz',   'Hicaz Dörtlüsü',   'Dörtlü', 'Dügâh',  'La4 Si4-bk Do5+bk Re5',         'SAS'],
  ['b-cargah',  'Çargâh Beşlisi',   'Beşli',  'Çargâh', 'Do5 Re5 Mi5 Fa5 Sol5',          'TTBT'],
  ['b-buselik', 'Bûselik Beşlisi',  'Beşli',  'Dügâh',  'La4 Si4 Do5 Re5 Mi5',           'TBTT'],
  ['b-kurdi',   'Kürdi Beşlisi',    'Beşli',  'Dügâh',  'La4 Si4-km Do5 Re5 Mi5',        'BTTT'],
  ['b-rast',    'Rast Beşlisi',     'Beşli',  'Rast',   'Sol4 La4 Si4-k Do5 Re5',        'TKST'],
  ['b-huseyni', 'Hüseyni Beşlisi',  'Beşli',  'Dügâh',  'La4 Si4-k Do5 Re5 Mi5',         'KSTT'],
  ['b-hicaz',   'Hicaz Beşlisi',    'Beşli',  'Dügâh',  'La4 Si4-bk Do5+bk Re5 Mi5',     'SAST'],
  ['d-segah',   'Segâh Dörtlüsü',   'Dörtlü', 'Segâh',  'Si4-k Do5 Re5 Mi5-k',           'STK'],
  ['d-mustear', 'Müstear Dörtlüsü', 'Dörtlü', 'Segâh',  'Si4-k Do5+bk Re5 Mi5-k',        'TSK'],
  ['d-saba',    'Saba Dörtlüsü',    'Dörtlü', 'Dügâh',  'La4 Si4-k Do5 Re5-bk',          'KSS'],
  ['b-segah',   'Segâh Beşlisi',    'Beşli',  'Segâh',  'Si4-k Do5 Re5 Mi5-k Fa5+bk',    'STKT'],
  ['b-mustear', 'Müstear Beşlisi',  'Beşli',  'Segâh',  'Si4-k Do5+bk Re5 Mi5-k Fa5+bk', 'TSKT'],
  ['b-huzzam',  'Hüzzam Beşlisi',   'Beşli',  'Segâh',  'Si4-k Do5 Re5 Mi5-bk Fa5+bk',   'STSA'],
  ['b-nikriz',  'Nikriz Beşlisi',   'Beşli',  'Rast',   'Sol4 La4 Si4-bk Do5+bk Re5',    'TSAS'],
  ['b-ferahnak','Ferahnâk Beşlisi', 'Beşli',  'Irak',   'Fa4+bk Sol4 La4 Si4 Do5+bk',    'STTK']
];
const ARALIK_HARF = { 1: 'F', 4: 'B', 5: 'S', 8: 'K', 9: 'T', 12: 'A', 13: 'A' };
const HARF_ARALIK_AD = { T: 'tanini (9)', K: 'büyük mücenneb (8)', S: 'küçük mücenneb (5)', B: 'bakiye (4)', A: 'artık ikili (12–13)', F: 'koma (1)' };
const CESNI_KARARLAR = ['Rast', 'Dügâh', 'Segâh', 'Çargâh', 'Irak', 'Neva', 'Hüseyni', 'Bûselik'];

const CESNILER = CESNI_HAM.map(function (r) {
  const notalar = r[4].split(' ').map(function (t) { return notaOku(t); });
  const araliklar = [];
  let formul = '';
  for (let i = 1; i < notalar.length; i++) {
    const d = komaOf(notalar[i]) - komaOf(notalar[i - 1]);
    araliklar.push(d);
    formul += ARALIK_HARF[d] || '?';
  }
  if (formul !== r[5]) console.warn('Çeşni uyuşmazlık: ' + r[1] + ' ' + formul + ' ≠ ' + r[5]);
  return { id: r[0], oge: 'd:' + r[0], ad: r[1], tur: r[2], yer: r[3], notalar: notalar, formul: formul, araliklar: araliklar };
});
const CESNI = {};
CESNILER.forEach(function (c) { CESNI[c.id] = c; });
function cesniler(idler) { return idler.map(function (i) { if (!CESNI[i]) throw new Error('Çeşni yok: ' + i); return CESNI[i]; }); }
function formulGoster(f) { return f.split('').join(' '); }

function cesniAciklama(c) {
  return '<b>' + c.ad + '</b> · ' + formulGoster(c.formul) + ' · yeri: ' + c.yer + '<br><span class="soluk">' +
    c.formul.split('').map(function (x) { return x + ' = ' + HARF_ARALIK_AD[x]; }).join(', ') + '</span>';
}
function cesniPorte(c) { return { notalar: c.notalar, aralik: 36, enAz: 240 }; }

// aynı uzunluktakiler önce, sonra diğerleri
function cesniCeldirici(c, havuz, sayi) {
  const d = karistir(havuz.filter(function (x) { return x !== c; }));
  d.sort(function (a, b) { return (a.tur === c.tur ? 0 : 1) - (b.tur === c.tur ? 0 : 1); });
  return d.slice(0, sayi);
}
// formül çeldiricileri: havuzdaki diğer formüller + harflerin yer değiştirmiş halleri
function formulCeldirici(c, havuz) {
  const L = [];
  havuz.forEach(function (x) { if (x.formul.length === c.formul.length && x.formul !== c.formul) L.push(x.formul); });
  const harf = c.formul.split('');
  for (let d = 0; d < 30 && L.length < 6; d++) {
    const p = karistir(harf).join('');
    if (p !== c.formul && L.indexOf(p) < 0) L.push(p);
  }
  // tek harf değişimi (ör. S yerine B)
  const komsu = { S: 'B', B: 'S', K: 'T', T: 'K', A: 'T' };
  for (let i = 0; i < harf.length && L.length < 8; i++) {
    const y = harf.slice(); y[i] = komsu[y[i]] || y[i];
    const s = y.join('');
    if (s !== c.formul && L.indexOf(s) < 0) L.push(s);
  }
  return karistir(benzersiz(L)).slice(0, 3);
}

function cesniSoru(tip, c, havuz, sikSay) {
  sikSay = sikSay || 4;
  const q = { oge: c.oge, tip: 'secim', aciklama: cesniAciklama(c), ipucu: 'Aralıklar: ' + formulGoster(c.formul) };
  if (tip === 'portAd') {
    q.soru = { porte: cesniPorte(c) }; q.alt = 'Bu porte hangi dörtlü ya da beşli?';
    q.siklar = [c].concat(cesniCeldirici(c, havuz, sikSay - 1)).map(function (x) { return { key: x.id, metin: x.ad }; });
    q.dogru = c.id; q.dogruMetin = c.ad;
  } else if (tip === 'adPort') {
    q.soru = { metin: c.ad }; q.alt = 'Doğru porte hangisi?';
    q.siklar = [c].concat(cesniCeldirici(c, havuz, sikSay - 1)).map(function (x) { return { key: x.id, porte: cesniPorte(x), genis: true }; });
    q.dogru = c.id; q.dogruMetin = c.ad;
    q.ipucu = 'Yeri ' + c.yer + ', aralıklar ' + formulGoster(c.formul);
  } else if (tip === 'formulAd') {
    q.soru = { metin: formulGoster(c.formul) }; q.alt = 'Bu aralık dizilişi hangi dörtlü ya da beşliye ait?';
    const dis = cesniCeldirici(c, havuz.filter(function (x) { return x.formul !== c.formul; }), sikSay - 1);
    q.siklar = [c].concat(dis).map(function (x) { return { key: x.id, metin: x.ad }; });
    q.dogru = c.id; q.dogruMetin = c.ad;
    q.ipucu = c.formul.split('').map(function (x) { return HARF_ARALIK_AD[x]; }).join(' + ');
  } else if (tip === 'adFormul') {
    q.soru = { metin: c.ad }; q.alt = 'Aralık dizilişi nedir?';
    q.siklar = [c.formul].concat(formulCeldirici(c, havuz)).map(function (x) { return { key: x, metin: formulGoster(x) }; });
    q.dogru = c.formul; q.dogruMetin = formulGoster(c.formul);
    q.ipucu = 'Yeri ' + c.yer;
  } else if (tip === 'adKarar') {
    q.soru = { metin: c.ad }; q.alt = 'Karar sesi (yeri) hangi perde?';
    const dis = karistir(CESNI_KARARLAR.filter(function (x) { return x !== c.yer; })).slice(0, sikSay - 1);
    q.siklar = [c.yer].concat(dis).map(function (x) { return { key: x, metin: x }; });
    q.dogru = c.yer; q.dogruMetin = c.yer;
  } else if (tip === 'harfDiz') {
    q.tip = 'dizi';
    q.soru = { metin: c.ad }; q.alt = 'Aralıkları sırayla diz';
    const harfler = ['T', 'K', 'S', 'B'];
    if (c.formul.indexOf('A') >= 0 || havuz.some(function (x) { return x.formul.indexOf('A') >= 0; })) harfler.push('A');
    q.dizi = { havuz: harfler.map(function (x) { return { key: x, metin: x }; }), uzunluk: c.formul.length, beklenen: c.formul.split(''), tekrarli: true };
    q.dogruMetin = formulGoster(c.formul);
  } else if (tip === 'porteKur') {
    q.tip = 'yer';
    q.soru = { metin: c.ad }; q.alt = 'İlk ses verildi. Kalan sesleri porteye kur (her ses bir sonraki harfe yazılır)';
    q.yer = {
      slotlar: c.notalar.map(function (n, i) { return i === 0 ? { sabit: n } : {}; }),
      palet: 'aeu', beklenen: c.notalar
    };
    q.ipucu = 'Aralıklar: ' + formulGoster(c.formul) + ' (' + c.formul.split('').map(function (x) { return HARF_ARALIK_AD[x]; }).join(', ') + ')';
    q.dogruMetin = c.notalar.map(notaMetni).join(', ');
    q.aciklama = cesniAciklama(c) + gocurmeAdimlari(c.notalar);
  }
  return q;
}

// o: { havuz:[id], yeni:[id], yeniOran, tipler:[], sikSay }
function cesniUretici(o) {
  return function (n, sikSay) {
    const havuz = cesniler(o.havuz);
    const yeni = o.yeni ? cesniler(o.yeni) : [];
    const L = [];
    let onceki = null;
    for (let j = 0; j < n; j++) {
      let c = null;
      for (let d = 0; d < 10; d++) {
        c = rastgele(yeni.length && Math.random() < (o.yeniOran || 0.6) ? yeni : havuz);
        if (c !== onceki) break;
      }
      onceki = c;
      L.push(cesniSoru(o.tipler[j % o.tipler.length], c, havuz, Math.min(sikSay || 4, havuz.length + (o.tipler[j % o.tipler.length] === 'adFormul' || o.tipler[j % o.tipler.length] === 'adKarar' ? 4 : 0))));
    }
    return karistir(L);
  };
}

function cesniKarti(c) {
  return {
    baslik: c.ad,
    cizim: function () { return h('div', { class: 'kartPorte' }, porteSVG({ notalar: c.notalar, aralik: 36, enAz: 240, etiketler: [''].concat(c.formul.split('')).map(function (x, i) { return i === 0 ? c.yer : x; }) })); },
    metin: '<p>Aralıklar: <b>' + formulGoster(c.formul) + '</b></p><p>' +
      c.formul.split('').map(function (x) { return x + ' = ' + HARF_ARALIK_AD[x]; }).join('<br>') + '</p><p>Yeri (karar sesi): <b>' + c.yer + '</b></p>'
  };
}

const D_TB = ['d-cargah', 'd-buselik', 'd-kurdi'];
const D_KS = ['d-rast', 'd-ussak'];
const D_TEMEL = D_TB.concat(D_KS, ['d-hicaz']);
const B_TEMEL = ['b-cargah', 'b-buselik', 'b-kurdi', 'b-rast', 'b-huseyni', 'b-hicaz'];
const C_ILERI = ['d-segah', 'd-mustear', 'd-saba', 'b-segah', 'b-mustear', 'b-huzzam', 'b-nikriz', 'b-ferahnak'];
const C_TANI = ['portAd', 'adPort'];
const C_FORM = ['formulAd', 'adFormul', 'adKarar'];
const C_URET = ['harfDiz', 'porteKur'];
const C_HEPSI = C_TANI.concat(C_FORM);

function dbUnite(id, no, ad, kisa, ogeler, havuz, ekSeviye) {
  const sev = [
    { id: id + '-1', tip: 'seviye', ad: 'Porte ve ad', soruSay: 7, uret: cesniUretici({ havuz: havuz, yeni: ogeler, yeniOran: 0.7, tipler: C_TANI }) },
    { id: id + '-2', tip: 'seviye', ad: 'Aralık dizilişi ve yeri', soruSay: 7, uret: cesniUretici({ havuz: havuz, yeni: ogeler, yeniOran: 0.7, tipler: C_FORM }) }
  ].concat(ekSeviye || []).concat([
    { id: id + '-yer', tip: 'yer', ad: 'Kendin kur', soruSay: 6, uret: cesniUretici({ havuz: havuz, yeni: ogeler, yeniOran: 0.75, tipler: C_URET }) },
    { id: id + '-boss', tip: 'boss', ad: 'Ünite finali', soruSay: 10, uret: cesniUretici({ havuz: havuz, yeni: ogeler, yeniOran: 0.6, tipler: C_HEPSI.concat(C_URET) }) }
  ]);
  return { id: id, dal: 'cesni', no: no, ad: ad, kisa: kisa, ogeler: ogeler.map(function (i) { return 'd:' + i; }), seviyeler: sev };
}

const CESNI_UNITELER = [
  dbUnite('db1', 1, 'Tanini ve bakiyeli dörtlüler', 'Çargâh, Bûselik ve Kürdi dörtlüleri', D_TB, D_TB),
  dbUnite('db2', 2, 'Rast ve Uşşak dörtlüleri', 'Büyük ve küçük mücenneb aralıkları', D_KS, D_TB.concat(D_KS)),
  dbUnite('db3', 3, 'Hicaz dörtlüsü', 'Artık ikili aralığı', ['d-hicaz'], D_TEMEL),
  dbUnite('db4', 4, 'Temel beşliler', 'Beşli = dörtlü + tanini', B_TEMEL, B_TEMEL.concat(D_TEMEL), [
    { id: 'db4-3', tip: 'seviye', ad: 'Dörtlü mü, beşli mi karışık', soruSay: 8, uret: cesniUretici({ havuz: B_TEMEL.concat(D_TEMEL), yeni: B_TEMEL, yeniOran: 0.6, tipler: C_HEPSI }) }
  ]),
  dbUnite('db5', 5, 'İleri çeşniler', 'Segâh, Müstear, Saba, Hüzzam, Nikriz, Ferahnâk', C_ILERI, C_ILERI.concat(B_TEMEL, D_TEMEL))
];
// db4-3 adı daha açık olsun
CESNI_UNITELER[3].seviyeler[2].ad = 'Dörtlüler ve beşliler karışık';

CESNI_UNITELER[0].ders = function () {
  return [
    { baslik: 'Dörtlü ve beşli', metin:
      '<p><b>Dörtlü</b>: art arda 4 ses, aralarında 3 aralık. <b>Beşli</b>: 5 ses, 4 aralık.</p>' +
      '<p>Makam dizileri bir dörtlü ile bir beşlinin birleşmesinden oluşur. Bu yüzden önce bu küçük yapı taşlarını öğreniyoruz.</p>' },
    { baslik: 'Aralık harfleri', metin:
      '<p>Aralıklar harflerle yazılır:</p><p><b>T</b> tanini (9 koma)<br><b>K</b> büyük mücenneb (8)<br><b>S</b> küçük mücenneb (5)<br><b>B</b> bakiye (4)<br><b>A</b> artık ikili (12–13)</p>' +
      '<p>Bu ünitedeki üç dörtlü sadece <b>T</b> ve <b>B</b> içerir; Batı müziğine en yakın olanlar bunlar.</p>' }
  ].concat(cesniler(D_TB).map(cesniKarti));
};
CESNI_UNITELER[1].ders = function () {
  return [{ baslik: 'K ve S aralıkları', metin:
    '<p>Rast ve Uşşak dörtlülerinde <b>Segâh</b> perdesi (Si koma bemol) var. Bu yüzden aralıklar <b>K</b> (8) ve <b>S</b> (5) olur.</p>' +
    '<p>Rast: <b>T K S</b> · Uşşak: <b>K S T</b>. Aynı harfler, farklı sıra!</p>' }]
    .concat(cesniler(D_KS).map(cesniKarti));
};
CESNI_UNITELER[2].ders = function () {
  return [{ baslik: 'Artık ikili', metin:
    '<p>Hicaz dörtlüsü <b>S A S</b>: küçük mücenneb + artık ikili + küçük mücenneb.</p>' +
    '<p>Ortadaki <b>artık ikili</b> (12 koma) Hicaz’a karakteristik rengini verir. Dizide <b>Dik Kürdi</b> (Si bakiye bemol) ve <b>Nim Hicaz</b> (Do bakiye diyez) perdeleri kullanılır.</p>' }]
    .concat(cesniler(['d-hicaz']).map(cesniKarti));
};
CESNI_UNITELER[3].ders = function () {
  return [{ baslik: 'Beşli = dörtlü + T', metin:
    '<p>Temel beşlilerin hepsi, aynı adlı dörtlünün sonuna bir <b>tanini</b> eklenerek bulunur:</p>' +
    '<p>Çargâh <b>TTB</b> → <b>TTBT</b><br>Bûselik <b>TBT</b> → <b>TBTT</b><br>Kürdi <b>BTT</b> → <b>BTTT</b><br>Rast <b>TKS</b> → <b>TKST</b><br>Hicaz <b>SAS</b> → <b>SAST</b></p>' },
    { baslik: 'Hüseyni istisnası', metin:
    '<p>Uşşak dörtlüsüne (<b>KST</b>) tanini eklenince adı değişir: <b>Hüseyni beşlisi</b> (<b>KSTT</b>).</p><p>“Uşşak beşlisi” diye bir yapı yoktur.</p>' }]
    .concat(cesniler(B_TEMEL).map(cesniKarti));
};
CESNI_UNITELER[4].ders = function () {
  return [{ baslik: 'İleri çeşniler', metin:
    '<p>Temel dörtlü ve beşlilerin dışında makamlarda sık görülen yapılar: <b>Segâh, Müstear, Hüzzam</b> (Segâh perdesinde), <b>Nikriz</b> (Rast’ta), <b>Ferahnâk</b> (Irak’ta), <b>Saba</b> (Dügâh’ta).</p>' +
    '<p><b>Saba dörtlüsü</b> (K S S) diğerlerinden kısadır: 18 koma. Bu yüzden “eksik dörtlü” olarak anılır.</p>' }]
    .concat(cesniler(C_ILERI).map(cesniKarti));
};

// =====================================================
// db6 · ÇEŞNİYİ DİZİDE BUL (makam dizilerinin içindeki dörtlü ve beşliler)
// Makamlar makam.js'de tanımlı; liste ilk kullanımda hesaplanır.
// =====================================================
let CESNI_BULUNTU = null;
function cesniBuluntulari() {
  if (CESNI_BULUNTU) return CESNI_BULUNTU;
  CESNI_BULUNTU = [];
  MAKAMLAR.forEach(function (m) {
    if (!m.dizi) return;
    const k = m.dizi.map(komaOf);
    CESNILER.forEach(function (c) {
      for (let i = 0; i + c.araliklar.length < k.length; i++) {
        let tut = true;
        for (let j = 0; j < c.araliklar.length; j++) if (k[i + j + 1] - k[i + j] !== c.araliklar[j]) { tut = false; break; }
        if (tut) CESNI_BULUNTU.push({ m: m, c: c, i: i });
      }
    });
  });
  return CESNI_BULUNTU;
}
function diziVurguPorte(m, bas, uzun) {
  return { notalar: m.dizi.map(function (n, i) { return i >= bas && i <= bas + uzun ? Object.assign({ renk: 'var(--vurgu)' }, n) : n; }), aralik: 34, enAz: 330 };
}
function cesniDiziSorusu(tip, turFiltre) {
  const tum = cesniBuluntulari().filter(function (b) { return !turFiltre || b.c.tur === turFiltre; });
  if (tip === 'yerBul') {
    // dizide yalnızca bir kez geçen çeşniler
    const tek = tum.filter(function (b) { return tum.filter(function (x) { return x.m === b.m && x.c === b.c; }).length === 1; });
    const b = rastgele(tek);
    const enSon = b.m.dizi.length - 1 - b.c.araliklar.length;
    const adaylar = karistir(Array.from({ length: enSon + 1 }, function (_, i) { return i; }).filter(function (i) { return i !== b.i; })).slice(0, 3);
    const sik = function (i) { return { key: 'i' + i, metin: (i + 1) + '. ses · ' + HARF_AD[b.m.dizi[i].h] }; };
    return {
      oge: b.c.oge, tip: 'secim',
      soru: { porte: { notalar: b.m.dizi, aralik: 34, enAz: 330, etiketler: b.m.dizi.map(function (_, i) { return String(i + 1); }) } },
      alt: b.m.ad + ' dizisinde ' + b.c.ad + ' kaçıncı sesten başlıyor?',
      siklar: [sik(b.i)].concat(adaylar.map(sik)), dogru: 'i' + b.i, dogruMetin: (b.i + 1) + '. ses (' + KOMADAN_PERDE[komaOf(b.m.dizi[b.i])].ad + ')',
      ipucu: b.c.ad + ': ' + formulGoster(b.c.formul) + '. Komşu sesler arasındaki aralıkları say.',
      aciklama: '<b>' + b.c.ad + '</b> (' + formulGoster(b.c.formul) + ') ' + b.m.ad + ' dizisinin ' + (b.i + 1) + '. sesinden, <b>' + KOMADAN_PERDE[komaOf(b.m.dizi[b.i])].ad + '</b> perdesinden başlar.'
    };
  }
  const anlamli = tum.filter(function (b) { return !(b.c === b.m.altC && b.i === 0) && !(b.c === b.m.ustC && b.i === b.m.altC.notalar.length - 1); });
  const b = rastgele(anlamli.length ? anlamli : tum);
  const ayniUzun = CESNILER.filter(function (x) { return x.tur === b.c.tur && x !== b.c; });
  const dis = karistir(ayniUzun).slice(0, 3);
  return {
    oge: b.c.oge, tip: 'secim',
    soru: { porte: diziVurguPorte(b.m, b.i, b.c.araliklar.length) },
    alt: b.m.ad + ' dizisi · Renkli ' + (b.c.araliklar.length + 1) + ' ses hangi ' + b.c.tur.toLowerCase() + '?',
    siklar: [b.c].concat(dis).map(function (x) { return { key: x.id, metin: x.ad }; }), dogru: b.c.id, dogruMetin: b.c.ad,
    ipucu: 'Renkli seslerin aralıklarını sırayla oku.',
    aciklama: cesniAciklama(b.c) + '<br>' + b.m.ad + ' dizisinde ' + KOMADAN_PERDE[komaOf(b.m.dizi[b.i])].ad + ' perdesinden başlar.'
  };
}
function cesniDiziUretici(tipler) {
  return function (n) {
    const L = [];
    for (let i = 0; i < n; i++) { const t = tipler[i % tipler.length]; L.push(cesniDiziSorusu(t[0], t[1])); }
    return karistir(L);
  };
}
CESNI_UNITELER.push({
  id: 'db6', dal: 'cesni', no: 6, ad: 'Çeşniyi dizide bul', kisa: 'Makam dizilerinin içindeki dörtlü ve beşliler', ogeler: [],
  seviyeler: [
    { id: 'db6-1', tip: 'seviye', ad: 'Renkli dörtlü hangisi?', soruSay: 8, uret: cesniDiziUretici([['vurgu', 'Dörtlü']]) },
    { id: 'db6-2', tip: 'seviye', ad: 'Renkli beşli hangisi?', soruSay: 8, uret: cesniDiziUretici([['vurgu', 'Beşli'], ['vurgu', 'Dörtlü']]) },
    { id: 'db6-3', tip: 'seviye', ad: 'Çeşni nerede başlıyor?', soruSay: 8, uret: cesniDiziUretici([['yerBul']]) },
    { id: 'db6-boss', tip: 'boss', ad: 'Çeşni avcısı finali', soruSay: 10, uret: cesniDiziUretici([['vurgu'], ['yerBul'], ['vurgu', 'Beşli']]) }
  ]
});
CESNI_UNITELER[5].ders = function () {
  const m = MAKAM.rast;
  return [
    { baslik: 'Dizinin içinde başka çeşniler', cizim: function () { return h('div', { class: 'kartPorte' }, porteSVG(diziVurguPorte(m, 1, 3))); }, metin:
      '<p>Bir makam dizisi yalnızca iki parçadan ibaret değildir. Dizinin <b>farklı seslerinden</b> başlayarak bakınca içinde başka dörtlü ve beşliler de görülür.</p>' +
      '<p>Örnek: Rast dizisinde <b>Dügâh</b>’tan başlayan dört ses (La, Si koma bemol, Do, Re) <b>K S T</b>: bir <b>Uşşak dörtlüsü</b>.</p>' },
    { baslik: 'Nasıl bulunur?', metin:
      '<p>1️⃣ Komşu sesler arasındaki aralıkları sırayla oku.<br>2️⃣ Harf dizisini (T, K, S, B, A) çeşnilerin formülleriyle karşılaştır.</p>' +
      '<p>Geçkiler ve çeşniler, makamların içindeki bu küçük yapılardan doğar.</p>' }
  ];
};

function cesniOgeSorusu(id) {
  const c = CESNILER.find(function (x) { return x.oge === id; });
  const havuz = CESNILER.slice(0, 12).concat(C_ILERI.indexOf(c.id) >= 0 ? cesniler(C_ILERI) : []);
  return cesniSoru(rastgele(C_HEPSI.concat(C_URET)), c, havuz.indexOf(c) >= 0 ? havuz : havuz.concat([c]), 4);
}
