// =====================================================
// PERDE: veri, paketler (SymbTr kullanım sıklığına göre), soru üreticileri
// Yazım: Nota + işaret (+ diyez, - bemol) + tür (k koma, bk bakiye, km küçük mücenneb, bm büyük mücenneb)
// İki yazım "/" ile ayrılır, ikisi birlikte çizilir.
// =====================================================
'use strict';

const VERI = [
  ['Kaba Çargâh',     'Do'],
  ['Kaba Nim Hicaz',  'Do+bk / Re-km'],
  ['Kaba Hicaz',      'Do+km / Re-bk'],
  ['Kaba Dik Hicaz',  'Do+bm / Re-k'],
  ['Yegâh',           'Re'],
  ['Kaba Nim Hisar',  'Re+bk / Mi-km'],
  ['Kaba Hisar',      'Re+km / Mi-bk'],
  ['Kaba Dik Hisar',  'Re+bm / Mi-k'],
  ['Hüseyni Aşiran',  'Mi'],
  ['Acem Aşiran',     'Fa'],
  ['Dik Acem Aşiran', 'Fa+k / Sol-bm'],
  ['Irak',            'Fa+bk / Sol-km'],
  ['Geveşt',          'Fa+km / Sol-bk'],
  ['Dik Geveşt',      'Fa+bm / Sol-k'],
  ['Rast',            'Sol'],
  ['Nim Zirgüle',     'Sol+bk / La-km'],
  ['Zirgüle',         'Sol+km / La-bk'],
  ['Dik Zirgüle',     'Sol+bm / La-k'],
  ['Dügâh',           'La'],
  ['Kürdi',           'La+bk / Si-km'],
  ['Dik Kürdi',       'La+km / Si-bk'],
  ['Segâh',           'La+bm / Si-k'],
  ['Bûselik',         'Si'],
  ['Dik Bûselik',     'Do-k'],
  ['Çargâh',          'Do'],
  ['Nim Hicaz',       'Do+bk / Re-km'],
  ['Hicaz',           'Do+km / Re-bk'],
  ['Dik Hicaz',       'Do+bm / Re-k'],
  ['Neva',            'Re'],
  ['Nim Hisar',       'Re+bk / Mi-km'],
  ['Hisar',           'Re+km / Mi-bk'],
  ['Dik Hisar',       'Re+bm / Mi-k'],
  ['Hüseyni',         'Mi'],
  ['Acem',            'Fa'],
  ['Dik Acem',        'Fa+k / Sol-bm'],
  ['Evç',             'Fa+bk / Sol-km'],
  ['Mahur',           'Fa+km / Sol-bk'],
  ['Dik Mahur',       'Fa+bm / Sol-k'],
  ['Gerdâniye',       'Sol'],
  ['Nim Şehnaz',      'Sol+bk / La-km'],
  ['Şehnaz',          'Sol+km / La-bk'],
  ['Dik Şehnaz',      'Sol+bm / La-k'],
  ['Muhayyer',        'La'],
  ['Sünbüle',         'La+bk / Si-km'],
  ['Dik Sünbüle',     'La+km / Si-bk'],
  ['Tiz Segâh',       'La+bm / Si-k'],
  ['Tiz Bûselik',     'Si'],
  ['Tiz Çargâh',      'Do']
];

const PERDELER = [];
const PERDE = {};          // ad -> perde
const KOMADAN_PERDE = {};  // mutlak koma -> perde
(function () {
  let oktav = 4, oncekiIlk = -1, oncekiKoma = null;
  VERI.forEach(function (satir, i) {
    const parcalar = satir[1].split('/').map(function (x) { return notaOku(x, 0); });
    const ilk = parcalar[0].h;
    if (i > 0 && ilk < oncekiIlk) oktav++;
    oncekiIlk = ilk;
    parcalar.forEach(function (p) { p.o = oktav + (p.h < ilk ? 1 : 0); });
    const koma = komaOf(parcalar[0]);
    if (parcalar.length === 2 && komaOf(parcalar[1]) !== koma) console.warn(satir[0] + ': iki yazım tutmuyor');
    if (oncekiKoma !== null && koma <= oncekiKoma) console.warn(satir[0] + ': sıra bozuk');
    oncekiKoma = koma;
    const p = { id: 'p' + i, oge: 'p:p' + i, ad: satir[0], parcalar: parcalar, koma: koma, tam: parcalar.length === 1 && !parcalar[0].a };
    PERDELER.push(p);
    PERDE[p.ad] = p;
    KOMADAN_PERDE[koma] = p;
  });
})();

function perdeler(adlar) { return adlar.map(function (a) { if (!PERDE[a]) throw new Error('Perde yok: ' + a); return PERDE[a]; }); }
function perdeOge(id) { return PERDELER.find(function (p) { return p.oge === id || p.id === id; }); }

// ---- Paketler (SymbTr derleminde eserlerde geçme oranına göre) ----
const P_ANA = ['Rast', 'Dügâh', 'Bûselik', 'Çargâh', 'Neva', 'Hüseyni', 'Acem', 'Gerdâniye', 'Muhayyer'];
const P_TAM_DIGER = ['Kaba Çargâh', 'Yegâh', 'Hüseyni Aşiran', 'Acem Aşiran', 'Tiz Bûselik', 'Tiz Çargâh'];
const P2_A = ['Nim Hicaz', 'Hicaz', 'Nim Hisar', 'Hisar', 'Dik Hisar', 'Nim Zirgüle', 'Zirgüle'];
const P2_B = ['Kürdi', 'Dik Kürdi', 'Segâh', 'Sünbüle', 'Nim Şehnaz', 'Şehnaz'];
const P2_C = ['Evç', 'Irak', 'Geveşt'];
const PAKET = [
  P_ANA.concat(P_TAM_DIGER),
  P2_A.concat(P2_B, P2_C),
  ['Tiz Segâh', 'Mahur', 'Dik Acem', 'Dik Sünbüle'],
  ['Kaba Nim Hicaz', 'Kaba Nim Hisar', 'Kaba Hisar', 'Dik Acem Aşiran', 'Dik Şehnaz'],
  ['Dik Bûselik', 'Dik Hicaz', 'Dik Zirgüle', 'Kaba Dik Hisar', 'Kaba Hicaz', 'Kaba Dik Hicaz', 'Dik Mahur', 'Dik Geveşt']
];
const PAKET_TOPLAM = PAKET.reduce(function (a, b) { return a + b.length; }, 0);
if (PAKET_TOPLAM !== PERDELER.length) console.warn('Paketler tüm perdeleri kapsamıyor: ' + PAKET_TOPLAM);
function paketeKadar(i) { let a = []; for (let k = 0; k <= i; k++) a = a.concat(PAKET[k]); return a; }

// ---- Açıklamalar ----
function perdeYazimMetni(p) { return p.parcalar.map(notaMetni).join(' = '); }

function komaAdi(d) {
  return { 1: 'koma', 3: '3 koma', 4: 'bakiye', 5: 'küçük mücenneb', 8: 'büyük mücenneb' }[d] || (d + ' koma');
}
// "Neva + bakiye (4 koma) · Hüseyni − küçük mücenneb (5 koma)"
function perdeKural(p) {
  if (p.tam) return HARF_AD[p.parcalar[0].h] + ' notasına denk gelen tam ses.';
  let alt = null, ust = null;
  PERDELER.forEach(function (x) {
    if (!x.tam) return;
    if (x.koma < p.koma && (!alt || x.koma > alt.koma)) alt = x;
    if (x.koma > p.koma && (!ust || x.koma < ust.koma)) ust = x;
  });
  const parca = [];
  if (alt) parca.push(alt.ad + ' + ' + komaAdi(p.koma - alt.koma) + ' (' + (p.koma - alt.koma) + ' koma)');
  if (ust) parca.push(ust.ad + ' − ' + komaAdi(ust.koma - p.koma) + ' (' + (ust.koma - p.koma) + ' koma)');
  return parca.join(' · ');
}

// ---- Koma cetveli: perdeyi iki tam ses arasında gösterir ----
function cetvelSVG(p) {
  let alt = p.tam ? p : null, ust = null;
  PERDELER.forEach(function (x) {
    if (!x.tam) return;
    if (!p.tam && x.koma < p.koma && (!alt || x.koma > alt.koma)) alt = x;
    if (x.koma > p.koma && (!ust || x.koma < ust.koma)) ust = x;
  });
  if (!alt) alt = PERDELER[0];
  if (!ust) { ust = alt; alt = PERDELER.filter(function (x) { return x.tam && x.koma < p.koma; }).pop() || alt; }
  const n = ust.koma - alt.koma;
  const W = 300, x0 = 22, x1 = W - 22;
  const gorunen = PERDELER.filter(function (x) { return x.koma >= alt.koma && x.koma <= ust.koma; });
  // etiketler çakışmasın: soldan sağa, sığmayanı alt satıra al
  const satirSon = [-1e9, -1e9, -1e9];
  const yer = gorunen.map(function (x) {
    const xx = x0 + (x1 - x0) * (x.koma - alt.koma) / n;
    const w = x.ad.length * (x === p ? 6.6 : 5.6) + 6;
    let satir = 0;
    while (satir < 2 && xx - w / 2 < satirSon[satir]) satir++;
    satirSon[satir] = xx + w / 2;
    return { x: x, xx: xx, satir: satir };
  });
  const satirSay = Math.max.apply(null, yer.map(function (y) { return y.satir; })) + 1;
  const H = 40 + satirSay * 13;
  const svg = svgEl('svg', { class: 'cetvel', viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'xMidYMid meet' });
  svg.appendChild(svgEl('line', { x1: x0, x2: x1, y1: 26, y2: 26, stroke: 'currentColor', 'stroke-width': 2 }));
  for (let i = 0; i <= n; i++) {
    const x = x0 + (x1 - x0) * i / n;
    svg.appendChild(svgEl('line', { x1: x, x2: x, y1: 20, y2: 32, stroke: 'currentColor', 'stroke-width': 1, opacity: .5 }));
  }
  yer.forEach(function (y) {
    const vurgu = y.x === p;
    svg.appendChild(svgEl('circle', { cx: y.xx, cy: 26, r: vurgu ? 7 : 5, class: vurgu ? 'cetvelVurgu' : 'cetvelNokta' }));
    if (y.satir > 0) svg.appendChild(svgEl('line', { x1: y.xx, x2: y.xx, y1: 33, y2: 36 + y.satir * 13, stroke: 'currentColor', opacity: .3 }));
    const t = svgEl('text', { x: y.xx, y: 47 + y.satir * 13, 'font-size': vurgu ? 12 : 10, 'text-anchor': 'middle', fill: 'currentColor', 'font-weight': vurgu ? 800 : 600 });
    t.textContent = y.x.ad;
    svg.appendChild(t);
    const k = svgEl('text', { x: y.xx, y: 13, 'font-size': 9, 'text-anchor': 'middle', fill: 'currentColor', opacity: .7 });
    k.textContent = '+' + (y.x.koma - alt.koma);
    svg.appendChild(k);
  });
  return svg;
}

// ---- Çeldirici seçimi: zorluk arttıkça komaca yakın perdeler ----
function imzaOf(p) { const a = p.parcalar[0]; return a.h + (a.a || ''); }
function celdiriciSec(dogru, havuz, zor, sayi) {
  sayi = sayi || 3;
  const adaylar = havuz.filter(function (p) { return p.id !== dogru.id; })
    .sort(function (a, b) { return Math.abs(a.koma - dogru.koma) - Math.abs(b.koma - dogru.koma); });
  const secilen = [];
  if (zor >= 0.5 && Math.random() < 0.5) {
    const ayni = adaylar.filter(function (p) { return imzaOf(p) === imzaOf(dogru); });   // aynı yazım, başka oktav
    if (ayni.length) secilen.push(rastgele(ayni));
  }
  const w = Math.max(sayi + 1, Math.round(adaylar.length * Math.pow(1 - zor, 2)));
  karistir(adaylar.slice(0, w)).forEach(function (p) { if (secilen.length < sayi && secilen.indexOf(p) < 0) secilen.push(p); });
  adaylar.forEach(function (p) { if (secilen.length < sayi && secilen.indexOf(p) < 0) secilen.push(p); });
  return secilen;
}

function perdePorte(p) { return { notalar: p.parcalar, aralik: 48 }; }
function perdeAciklama(p) {
  return '<b>' + p.ad + '</b>: ' + kacis(perdeYazimMetni(p)) + '<br><span class="soluk">' + kacis(perdeKural(p)) + '</span>';
}

// ---- Soru üreticileri ----
function soruPorteAd(p, havuz, zor, sikSay) {
  const cel = celdiriciSec(p, havuz, zor, (sikSay || 4) - 1);
  return {
    oge: p.oge, tip: 'secim',
    soru: { porte: perdePorte(p) }, alt: 'Bu hangi perde?',
    siklar: [p].concat(cel).map(function (x) { return { key: x.id, metin: x.ad }; }),
    dogru: p.id, dogruMetin: p.ad,
    ipucu: perdeKural(p),
    aciklama: perdeAciklama(p)
  };
}
function soruAdPorte(p, havuz, zor, sikSay) {
  const cel = celdiriciSec(p, havuz, zor, (sikSay || 4) - 1);
  return {
    oge: p.oge, tip: 'secim',
    soru: { metin: p.ad }, alt: 'Doğru yazım hangisi?',
    siklar: [p].concat(cel).map(function (x) { return { key: x.id, porte: perdePorte(x) }; }),
    dogru: p.id, dogruMetin: perdeYazimMetni(p),
    ipucu: perdeKural(p),
    aciklama: perdeAciklama(p)
  };
}
// mod: 'tam' | 'diyez' | 'bemol' | 'iki' | 'herhangi'
function soruPerdeYaz(p, mod) {
  const diyezli = p.parcalar.find(function (x) { return x.a && x.a[0] === '+'; });
  const bemollu = p.parcalar.find(function (x) { return x.a && x.a[0] === '-'; });
  if (mod === 'iki' && p.parcalar.length < 2) mod = 'herhangi';
  if (mod === 'diyez' && !diyezli) mod = bemollu ? 'bemol' : 'herhangi';
  if (mod === 'bemol' && !bemollu) mod = diyezli ? 'diyez' : 'herhangi';
  const q = {
    oge: p.oge, tip: 'yer', soru: { metin: p.ad },
    ipucu: perdeKural(p), aciklama: perdeAciklama(p),
    dogruMetin: perdeYazimMetni(p)
  };
  const palet = mod === 'tam' ? null : 'aeu';
  if (mod === 'iki') {
    q.alt = 'İki yazımını da kur: önce diyezli, sonra bemollü';
    q.yer = { slotlar: [{}, {}], palet: palet, beklenen: [diyezli, bemollu], etiketler: ['diyezli', 'bemollü'] };
  } else {
    let hedef = mod === 'diyez' ? diyezli : mod === 'bemol' ? bemollu : null;
    q.alt = mod === 'tam' ? 'Porteye yerleştir' : mod === 'diyez' ? 'Diyezli yazımını porteye kur' : mod === 'bemol' ? 'Bemollü yazımını porteye kur' : 'Porteye yaz (iki yazımdan biri yeterli)';
    q.yer = { slotlar: [{}], palet: palet, beklenen: [hedef || p.parcalar[0]] };
    if (!hedef) q.yer.kabul = p.parcalar.map(function (x) { return [x]; });
  }
  return q;
}

// ---- Seviye üreticisi ----
// o: { havuz:[ad], yeni:[ad], yeniOran, yon:'portead'|'adporte'|'karisik', yerOran, yerMod, cel:[ad], zor }
function perdeUretici(o) {
  return function (n, sikSay) {
    const havuz = perdeler(o.havuz);
    const yeni = o.yeni ? perdeler(o.yeni) : [];
    const cel = perdeler(o.cel || o.havuz);
    const secilen = [];
    for (let i = 0; i < n; i++) {
      let p = null;
      for (let d = 0; d < 40; d++) {
        const kaynak = yeni.length && Math.random() < (o.yeniOran || 0.6) ? yeni : havuz;
        const a = rastgele(kaynak);
        if (a === secilen[secilen.length - 1] && havuz.length > 1) continue;   // art arda aynı olmasın
        if (secilen.indexOf(a) >= 0 && d < 25) continue;                        // önce kullanılmamışları dene
        p = a; break;
      }
      secilen.push(p || rastgele(havuz));
    }
    return secilen.map(function (p) {
      if (o.yerOran && Math.random() < o.yerOran) {
        return soruPerdeYaz(p, o.yerMod === 'karisik' ? rastgele(['diyez', 'bemol', 'iki']) : (o.yerMod || 'herhangi'));
      }
      const yon = o.yon === 'karisik' ? rastgele(['portead', 'adporte']) : o.yon;
      return yon === 'portead' ? soruPorteAd(p, cel, o.zor, sikSay) : soruAdPorte(p, cel, o.zor, sikSay);
    });
  };
}

// ---- Tanışma kartları (ders) ----
function perdeKarti(p) {
  return {
    baslik: p.ad,
    cizim: function () {
      return h('div', null,
        h('div', { class: 'kartPorte' }, porteSVG({ notalar: p.parcalar, aralik: 48, etiketler: p.parcalar.length === 2 ? ['diyezli', 'bemollü'] : null })),
        h('div', { class: 'kartCetvel' }, cetvelSVG(p)));
    },
    metin: '<p><b>' + kacis(perdeYazimMetni(p)) + '</b></p><p>' + kacis(perdeKural(p)) + '</p>'
  };
}

// ---- Üniteler ----
const PERDE_UNITELER = [
  {
    id: 'p1', dal: 'perde', no: 1, ad: 'Tam seslerin perde adları',
    kisa: 'Batı’daki Do, Re, Mi… seslerine denk gelen 15 perde',
    ogeler: PAKET[0],
    seviyeler: [
      { id: 'p1-1', tip: 'seviye', ad: 'Ana perdeler: porteden ada', soruSay: 8,
        uret: perdeUretici({ havuz: P_ANA, yon: 'portead', zor: 0.1 }) },
      { id: 'p1-2', tip: 'seviye', ad: 'Ana perdeler: addan porteye', soruSay: 8,
        uret: perdeUretici({ havuz: P_ANA, yon: 'adporte', zor: 0.2 }) },
      { id: 'p1-3', tip: 'seviye', ad: 'Kaba, Tiz ve Aşiran perdeler', soruSay: 10,
        uret: perdeUretici({ havuz: PAKET[0], yeni: P_TAM_DIGER, yeniOran: 0.6, yon: 'karisik', zor: 0.35 }) },
      { id: 'p1-yer', tip: 'yer', ad: 'Porteye yaz', soruSay: 8,
        uret: perdeUretici({ havuz: PAKET[0], yerOran: 1, yerMod: 'tam' }) },
      { id: 'p1-boss', tip: 'boss', ad: 'Tam sesler finali', soruSay: 12,
        uret: perdeUretici({ havuz: PAKET[0], yon: 'karisik', yerOran: 0.25, yerMod: 'tam', zor: 0.5 }) }
    ]
  },
  {
    id: 'p2', dal: 'perde', no: 2, ad: 'En çok kullanılan ara perdeler',
    kisa: 'Segâh, Kürdi, Nim Hicaz, Evç ve 12 perde daha',
    ogeler: PAKET[1],
    seviyeler: [
      { id: 'p2-1', tip: 'seviye', ad: 'Hicaz, Hisar ve Zirgüle aileleri', soruSay: 8,
        uret: perdeUretici({ havuz: PAKET[0].concat(P2_A), yeni: P2_A, yeniOran: 0.75, yon: 'portead', zor: 0.3 }) },
      { id: 'p2-2', tip: 'seviye', ad: 'Kürdi, Segâh ve tiz kardeşleri', soruSay: 8,
        uret: perdeUretici({ havuz: paketeKadar(0).concat(P2_A, P2_B), yeni: P2_B, yeniOran: 0.75, yon: 'adporte', zor: 0.35 }) },
      { id: 'p2-3', tip: 'seviye', ad: 'Evç, Irak ve Geveşt', soruSay: 10,
        uret: perdeUretici({ havuz: paketeKadar(1), yeni: P2_C, yeniOran: 0.6, yon: 'karisik', zor: 0.4 }) },
      { id: 'p2-4', tip: 'seviye', ad: 'Ara perdeler karışık', soruSay: 10,
        uret: perdeUretici({ havuz: paketeKadar(1), yeni: PAKET[1], yeniOran: 0.8, yon: 'karisik', zor: 0.5 }) },
      { id: 'p2-yer', tip: 'yer', ad: 'Porteye kur: nota ve işaret', soruSay: 8,
        uret: perdeUretici({ havuz: PAKET[1], yerOran: 1, yerMod: 'karisik' }) },
      { id: 'p2-boss', tip: 'boss', ad: 'Ara perdeler finali', soruSay: 12,
        uret: perdeUretici({ havuz: paketeKadar(1), yeni: PAKET[1], yeniOran: 0.8, yon: 'karisik', yerOran: 0.25, yerMod: 'karisik', zor: 0.6 }) }
    ]
  },
  {
    id: 'p3', dal: 'perde', no: 3, ad: 'Sık kullanılan diğer perdeler',
    kisa: 'Tiz Segâh, Mahur, Dik Acem, Dik Sünbüle',
    ogeler: PAKET[2],
    seviyeler: [
      { id: 'p3-1', tip: 'seviye', ad: 'Porteden ada', soruSay: 8,
        uret: perdeUretici({ havuz: paketeKadar(2), yeni: PAKET[2], yeniOran: 0.7, yon: 'portead', zor: 0.5 }) },
      { id: 'p3-2', tip: 'seviye', ad: 'Addan porteye', soruSay: 8,
        uret: perdeUretici({ havuz: paketeKadar(2), yeni: PAKET[2], yeniOran: 0.7, yon: 'adporte', zor: 0.55 }) },
      { id: 'p3-yer', tip: 'yer', ad: 'Porteye kur', soruSay: 8,
        uret: perdeUretici({ havuz: PAKET[2].concat(PAKET[1]), yeni: PAKET[2], yeniOran: 0.6, yerOran: 1, yerMod: 'karisik' }) },
      { id: 'p3-boss', tip: 'boss', ad: 'Paket 3 finali', soruSay: 12,
        uret: perdeUretici({ havuz: paketeKadar(2), yeni: PAKET[2], yeniOran: 0.6, yon: 'karisik', yerOran: 0.25, yerMod: 'karisik', zor: 0.65 }) }
    ]
  },
  {
    id: 'p4', dal: 'perde', no: 4, ad: 'Ara sıklıkta kullanılan perdeler',
    kisa: 'Kaba Nim Hicaz, Kaba Nim Hisar, Kaba Hisar, Dik Acem Aşiran, Dik Şehnaz',
    ogeler: PAKET[3],
    seviyeler: [
      { id: 'p4-1', tip: 'seviye', ad: 'Porteden ada', soruSay: 8,
        uret: perdeUretici({ havuz: paketeKadar(3), yeni: PAKET[3], yeniOran: 0.7, yon: 'portead', zor: 0.6 }) },
      { id: 'p4-2', tip: 'seviye', ad: 'Addan porteye', soruSay: 8,
        uret: perdeUretici({ havuz: paketeKadar(3), yeni: PAKET[3], yeniOran: 0.7, yon: 'adporte', zor: 0.65 }) },
      { id: 'p4-yer', tip: 'yer', ad: 'Porteye kur', soruSay: 8,
        uret: perdeUretici({ havuz: PAKET[3].concat(PAKET[2]), yeni: PAKET[3], yeniOran: 0.7, yerOran: 1, yerMod: 'karisik' }) },
      { id: 'p4-boss', tip: 'boss', ad: 'Paket 4 finali', soruSay: 12,
        uret: perdeUretici({ havuz: paketeKadar(3), yeni: PAKET[3], yeniOran: 0.6, yon: 'karisik', yerOran: 0.25, yerMod: 'karisik', zor: 0.7 }) }
    ]
  },
  {
    id: 'p5', dal: 'perde', no: 5, ad: 'Nadir perdeler',
    kisa: 'Kuramı tamamlayan 8 perde',
    ogeler: PAKET[4],
    seviyeler: [
      { id: 'p5-1', tip: 'seviye', ad: 'Porteden ada', soruSay: 8,
        uret: perdeUretici({ havuz: paketeKadar(4), yeni: PAKET[4], yeniOran: 0.7, yon: 'portead', zor: 0.7 }) },
      { id: 'p5-2', tip: 'seviye', ad: 'Addan porteye', soruSay: 8,
        uret: perdeUretici({ havuz: paketeKadar(4), yeni: PAKET[4], yeniOran: 0.7, yon: 'adporte', zor: 0.75 }) },
      { id: 'p5-yer', tip: 'yer', ad: 'Porteye kur', soruSay: 8,
        uret: perdeUretici({ havuz: PAKET[4], yerOran: 1, yerMod: 'karisik' }) },
      { id: 'p5-boss', tip: 'boss', ad: 'Bütün perdeler: büyük final', soruSay: 14,
        uret: perdeUretici({ havuz: PERDELER.map(function (p) { return p.ad; }), yeni: PAKET[4], yeniOran: 0.35, yon: 'karisik', yerOran: 0.25, yerMod: 'karisik', zor: 0.8 }) }
    ]
  }
];

// ---- Dersler ----
PERDE_UNITELER[0].ders = function () {
  return [
    { baslik: 'Perde ne demek?', metin:
      '<p>Türk müziğinde bir sesin adına <b>perde</b> denir. Batı müziğindeki Do, Re, Mi gibi; ama perdelerin kendi adları vardır.</p>' +
      '<p>Bu pakette sadece <b>işaretsiz</b> notalara, yani Batı’daki tam seslere denk gelen perdeleri öğreneceksin.</p>' },
    { baslik: 'Rast’tan Muhayyer’e', cizim: function () {
        return h('div', { class: 'kartPorte' }, porteSVG({ notalar: perdeler(P_ANA).map(function (p) { return p.parcalar[0]; }), aralik: 30, etiketler: P_ANA.map(function (a) { return a.length > 7 ? a.slice(0, 6) + '.' : a; }) }));
      }, metin: '<p>Dizinin merkezi <b>Rast</b> (Sol) perdesidir. Rast’tan başlayarak: <b>Rast, Dügâh, Bûselik, Çargâh, Neva, Hüseyni, Acem, Gerdâniye, Muhayyer</b>.</p>' +
      '<p>Gerdâniye, Rast’ın bir oktav tizidir; Muhayyer de Dügâh’ın.</p>' },
    { baslik: 'Kaba, Tiz ve Aşiran', metin:
      '<p><b>Kaba</b> bir oktav pest, <b>Tiz</b> bir oktav tiz demektir: <b>Kaba Çargâh</b> (Do4), <b>Tiz Bûselik</b> (Si5), <b>Tiz Çargâh</b> (Do6).</p>' +
      '<p>Neva’nın pest oktavının özel bir adı vardır: <b>Yegâh</b> (Re4).</p>' +
      '<p><b>Aşiran</b> da pest oktav için kullanılır: <b>Hüseyni Aşiran</b> (Mi4) ve <b>Acem Aşiran</b> (Fa4).</p>' }
  ].concat(perdeler(PAKET[0]).map(perdeKarti));
};
PERDE_UNITELER[1].ders = function () {
  return [
    { baslik: 'İsimlerin mantığı', metin:
      '<p>Ara perdelerin çoğu bir kurala uyar. İki tam ses arasında (9 koma):</p>' +
      '<p><b>Nim</b> = + bakiye (4 koma)<br><b>yalın ad</b> = + küçük mücenneb (5 koma)<br><b>Dik</b> = + büyük mücenneb (8 koma)</p>' +
      '<p>Örnek: Çargâh → <b>Nim Hicaz</b> (+4), <b>Hicaz</b> (+5), <b>Dik Hicaz</b> (+8) → Neva.</p>' +
      '<p>Aynı kural <b>Hisar</b> (Neva’dan sonra), <b>Zirgüle</b> (Rast’tan sonra) ve <b>Şehnaz</b> (Gerdâniye’den sonra) için de geçerli.</p>' },
    { baslik: 'İstisnalar', metin:
      '<p>Dügâh ile Bûselik arasında: <b>Kürdi</b> (+4), <b>Dik Kürdi</b> (+5), <b>Segâh</b> (+8). Tiz oktavda Kürdi’nin adı <b>Sünbüle</b> olur.</p>' +
      '<p>Acem’den sonra: <b>Evç</b> (Acem + bakiye = Gerdâniye − küçük mücenneb). Evç’in pest oktavı <b>Irak</b>, Mahur’un pest oktavı <b>Geveşt</b> adını alır.</p>' },
    { baslik: 'Neden iki yazım?', metin:
      '<p>Bir ara perde hem diyezle hem bemolle yazılabilir. Örneğin Segâh: <b>La + büyük mücenneb diyezi</b> = <b>Si − koma bemolü</b>.</p>' +
      '<p>Göçürmede bazen diyezli, bazen bemollü yazım gerekir. İkisini birlikte tanımak bu yüzden önemli.</p>' }
  ].concat(perdeler(PAKET[1]).map(perdeKarti));
};
PERDE_UNITELER[2].ders = function () {
  return [{ baslik: 'Paket 3', metin:
    '<p><b>Tiz Segâh</b> Segâh’ın, <b>Dik Sünbüle</b> Dik Kürdi’nin tiz oktavıdır. <b>Mahur</b> Acem + küçük mücenneb, <b>Dik Acem</b> ise Acem + 1 komadır.</p>' }]
    .concat(perdeler(PAKET[2]).map(perdeKarti));
};
PERDE_UNITELER[3].ders = function () {
  return [{ baslik: 'Paket 4', metin:
    '<p>Bu perdelerin hepsi daha önce öğrendiklerinin başka oktavı: <b>Kaba</b> önekli olanlar bir oktav pest; <b>Dik Acem Aşiran</b> Dik Acem’in, <b>Dik Şehnaz</b> Dik Zirgüle’nin oktavı.</p>' }]
    .concat(perdeler(PAKET[3]).map(perdeKarti));
};
PERDE_UNITELER[4].ders = function () {
  return [{ baslik: 'Nadir perdeler', metin:
    '<p>Bu perdeler eserlerde çok az geçer ama 24 perdelik sistemi tamamlarlar. <b>Dik Bûselik</b> Çargâh’tan 1 koma pesttir; diğerleri bildiğin <b>Dik</b> kuralına uyar.</p>' }]
    .concat(perdeler(PAKET[4]).map(perdeKarti));
};

// Tekrar (Leitner) için tek öğe sorusu
function perdeOgeSorusu(id) {
  const p = perdeOge(id);
  const r = Math.random();
  if (r < 0.4) return soruPorteAd(p, PERDELER, 0.6);
  if (r < 0.8) return soruAdPorte(p, PERDELER, 0.6);
  return soruPerdeYaz(p, p.tam ? 'tam' : rastgele(['diyez', 'bemol']));
}
