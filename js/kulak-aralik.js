// =====================================================
// 3.3: KULAK EĞİTİMİ → ARALIK (iki ses aralıkları)
// Beş aralık: Bakiye 4, Küçük mücenneb 5, Büyük mücenneb 8, Tanini 9, Artık ikili 12 koma.
// Temel kural: aynı soruda birbirinden 1 koma farklı iki aralık bulunmaz (B–S, K–T); bu ayrım yalnız
// son iki kademede açılır. Kurala uyan üçlüler: B–T–A, B–K–A, S–T–A, S–K–A.
// Yeni aralık önce tek rakiple tanıştırılır, sonra üçlüye girer. İlk dört kademede aralık çıkıcı; ilk altı
// kademede alt ses sabit (Dügâh), 7. kademeden sonra her soruda başka perde. Her kademe 10 soru; 8/10 ile sonraki açılır. Otomatik antrenman: 9/10 üst, ≤6/10 alt.
// kulak.js'ten sonra yüklenir.
// =====================================================
'use strict';

const ARALIKLAR = [
  { id: 'B', ad: 'Bakiye', k: 4 },
  { id: 'S', ad: 'Küçük mücenneb', k: 5 },
  { id: 'K', ad: 'Büyük mücenneb', k: 8 },
  { id: 'T', ad: 'Tanini', k: 9 },
  { id: 'A', ad: 'Artık ikili', k: 12 }
];
const ARALIK = {};
ARALIKLAR.forEach(function (a) { ARALIK[a.id] = a; });
const AR_UCLU = [['B', 'T', 'A'], ['B', 'K', 'A'], ['S', 'T', 'A'], ['S', 'K', 'A']];
const AR_SABIT = 'Dügâh';   // sabit alt ses: beş aralığın üst sesi de birer perde (Kürdi, Dik Kürdi, Segâh, Bûselik, Dik Bûselik)

const AR_KADEMELER = [
  { no: 1, ad: 'Bakiye ve artık ikili', kume: [['B', 'A']], yon: 'c', alt: 'sabit', yeni: ['B', 'A'], not: 'En kolay karşıtlık: 8 koma fark.' },
  { no: 2, ad: 'Tanini katıldı', kume: [['B', 'T', 'A']], yon: 'c', alt: 'sabit', yeni: ['T'] },
  { no: 3, ad: 'Küçük mücenneb', kume: [['S', 'A']], yon: 'c', alt: 'sabit', yeni: ['S'], not: 'Yeni aralık önce tek rakiple.' },
  { no: 4, ad: 'Büyük mücenneb', kume: [['S', 'K', 'A']], yon: 'c', alt: 'sabit', yeni: ['K'] },
  { no: 5, ad: 'Karışık üçlüler', kume: AR_UCLU, yon: 'c', alt: 'sabit', not: 'Beş aralığın hepsi dolaşır; 1 koma karşıtlığı yok.' },
  { no: 6, ad: 'İnici aralıklar', kume: AR_UCLU, yon: 'i', alt: 'sabit', not: 'Önce üst ses, sonra alt ses.' },
  { no: 7, ad: 'Yön ve perde karışık', kume: AR_UCLU, yon: 'k', alt: 'degisken', not: 'Alt ses her soruda başka perde.' },
  { no: 8, ad: '1 koma: hangisi geniş?', tip: 'genis', ciftler: [['B', 'S'], ['K', 'T']], alt: 'degisken', not: 'Adlandırma yok: aynı alt sesten iki aralık.' },
  { no: 9, ad: 'Final: beş aralık', kume: [['B', 'S', 'K', 'T', 'A']], yon: 'k', alt: 'degisken', not: 'Beşi birden, 1 koma farklar dahil.' }
];

function arKayit() {
  const k = kaKayit();
  k.aralik = k.aralik || { en: {}, zor: 1 };
  k.aralik.en = k.aralik.en || {};
  return k.aralik;
}
function arAcik(no) { return no <= 1 || (arKayit().en[no - 1] || 0) >= 8; }
function arEnUst() { let n = 1; while (n < AR_KADEMELER.length && arAcik(n + 1)) n++; return n; }
function arMetin(a) { return a.ad + ' · ' + a.k; }

// Alt ses adayları: ses alanı içindeki bütün perdeler. Cevaptan bağımsız seçilir (alt sesin adı cevabı ele vermesin);
// üst ses perdeye denk gelmezse geri bildirimde porte gösterilmez, ses yine 53 komayla doğru çalar.
function arAltAdaylar() {
  return PERDELER.filter(function (p) { return p.koma >= 234 && p.koma + 12 <= 300; });
}
function arAltSec(ids, mod) {
  if (mod === 'sabit') return PERDE[AR_SABIT];
  const L = arAltAdaylar(ids);
  return L.length ? rastgele(L) : PERDE[AR_SABIT];
}
function arOlay(alt, a, yon) {
  const ust = alt + a.k;
  const L = yon === 'i' ? [ust, alt] : [alt, ust];
  return [{ k: L[0], t: 0, d: 0.9 }, { k: L[1], t: 0.95, d: 1.35 }];
}
function arPorte(altP, a, yon) {
  const ustP = KOMADAN_PERDE[altP.koma + a.k];
  if (!ustP) return null;
  const n1 = altP.parcalar[0], n2 = ustP.parcalar[0];
  const L = yon === 'i' ? [n2, n1] : [n1, n2];
  const ad = yon === 'i' ? [ustP.ad, altP.ad] : [altP.ad, ustP.ad];
  return { notalar: L, aralik: 70, enAz: 220, etiketler: ad };
}

// ---- Soru: hangi aralık? ----
function arSoru(id, ids, o) {
  const a = ARALIK[id];
  const yon = o.yon === 'k' ? rastgele(['c', 'i']) : o.yon;
  const P = arAltSec(ids, o.alt);
  const ol = arOlay(P.koma, a, yon);
  const sirali = ids.slice().sort(function (x, y) { return ARALIK[x].k - ARALIK[y].k; });
  const ustP = KOMADAN_PERDE[P.koma + a.k];
  const q = {
    oge: null, kulak: true, tip: 'secim',
    soru: { metin: '👂 Hangi aralık?', kucuk: true },
    alt: (yon === 'i' ? '↘ İnici' : '↗ Çıkıcı') + ' · alt ses ' + P.ad,
    dinle: kulakDinle([{ olaylar: ol }], { karar: P.koma }),
    siklar: sirali.map(function (x) { return { key: x, metin: arMetin(ARALIK[x]) }; }), sirali: true,
    dogru: id, dogruMetin: arMetin(a),
    aciklama: '<b>' + P.ad + (ustP ? ' – ' + ustP.ad : '') + '</b>: ' + a.ad + ' (' + a.k + ' koma).'
  };
  q.geriEk = kulakGeri({ porte: arPorte(P, a, yon), kaydir: q.dinle.kaydir, dogru: { etiket: a.ad, olaylar: ol },
    secenek: ids.reduce(function (m, x) { m[x] = { etiket: ARALIK[x].ad, olaylar: arOlay(P.koma, ARALIK[x], yon) }; return m; }, {}) });
  return q;
}
// ---- Soru: 1 koma, hangisi geniş? (adlandırmadan) ----
function arGenisSoru(cift) {
  const L = karistir(cift.slice());
  const a1 = ARALIK[L[0]], a2 = ARALIK[L[1]];
  const P = arAltSec(cift, 'degisken');
  const ol1 = arOlay(P.koma, a1, 'c'), ol2 = arOlay(P.koma, a2, 'c');
  const dogru = a1.k > a2.k ? 'g1' : 'g2';
  const q = {
    oge: null, kulak: true, tip: 'secim',
    soru: { metin: '👂 Hangisi daha geniş?', kucuk: true },
    alt: 'Aynı alt sesten (' + P.ad + ') iki çıkıcı aralık; farkları 1 koma',
    dinle: kulakDinle([{ etiket: '1.', olaylar: ol1 }, { etiket: '2.', olaylar: ol2 }], { karar: P.koma }),
    siklar: [{ key: 'g1', metin: '1. aralık daha geniş' }, { key: 'g2', metin: '2. aralık daha geniş' }], sirali: true,
    dogru: dogru, dogruMetin: (dogru === 'g1' ? '1.' : '2.') + ' aralık',
    aciklama: '1.: <b>' + a1.ad + '</b> (' + a1.k + ' koma), 2.: <b>' + a2.ad + '</b> (' + a2.k + ' koma).'
  };
  q.geriEk = kulakGeri({ kaydir: q.dinle.kaydir, ekler: [{ etiket: '1. ' + a1.ad, olaylar: ol1 }, { etiket: '2. ' + a2.ad, olaylar: ol2 }] });
  return q;
}
// 10 soruluk tur: doğru cevaplar kümede dengeli dağılır, aynı cevap üst üste ikiden fazla gelmez
function arSorular(kd, n) {
  n = n || 10;
  const L = [];
  if (kd.tip === 'genis') {
    for (let i = 0; i < n; i++) L.push(arGenisSoru(kd.ciftler[i % kd.ciftler.length]));
    return karistir(L);
  }
  const plan = [];
  for (let i = 0; i < n; i++) {
    const ids = kd.kume[Math.floor(Math.random() * kd.kume.length)];
    plan.push(ids);
  }
  // her kümenin içinde cevapları sırayla dağıt (yeni aralık biraz daha sık)
  const sayac = {};
  let onceki = null, ard = 0;
  plan.forEach(function (ids) {
    const anahtar = ids.join('');
    sayac[anahtar] = (sayac[anahtar] || 0) + 1;
    let aday = ids.slice();
    if (kd.yeni && Math.random() < 0.35) { const y = aday.filter(function (x) { return kd.yeni.indexOf(x) >= 0; }); if (y.length) aday = y; }
    let id = rastgele(aday);
    for (let d = 0; d < 6 && id === onceki && ard >= 2; d++) id = rastgele(ids);
    ard = id === onceki ? ard + 1 : 1; onceki = id;
    L.push(arSoru(id, ids, kd));
  });
  // her aralık en az bir kez doğru cevap olsun
  const tum = benzersiz([].concat.apply([], kd.kume));
  tum.forEach(function (id) {
    if (!L.some(function (q) { return q.dogru === id; })) {
      const i = Math.floor(Math.random() * L.length);
      const ids = kd.kume.find(function (k) { return k.indexOf(id) >= 0; });
      L[i] = arSoru(id, ids, kd);
    }
  });
  return L;
}

// ---- Tur ----
function arTur(no, oto) {
  const kd = AR_KADEMELER[no - 1];
  const sorular = arSorular(kd, 10);
  modalKapat();
  turBaslat({
    tip: 'antrenman', sorular: sorular, kalp: 0, joker: false, kayit: false, etiket: '👂 Aralık ' + no, ipucuAcik: false,
    bitince: function (r) {
      const K = arKayit();
      const eskiUst = arEnUst();
      K.en[no] = Math.max(K.en[no] || 0, r.dogru);
      let not = '';
      if (oto) {
        let y = no;
        if (r.dogru >= 9) y = Math.min(arEnUst(), no + 1); else if (r.dogru <= 6) y = Math.max(1, no - 1);
        K.zor = y;
        not = y > no ? '⬆️ Otomatik antrenman bir üst kademeye geçti: ' + y + '.' : y < no ? '⬇️ Bir alt kademede devam: ' + y + '.' : 'Kademe ' + no + '’te devam.';
      }
      kaydet();
      const yeniAcildi = arEnUst() > eskiUst;
      const sonraki = no < AR_KADEMELER.length && arAcik(no + 1) ? no + 1 : null;
      modalAc(h('div', { class: 'sonuc' },
        h('div', { class: 'sonucMaskot', html: bulbulSVG(r.dogru >= 8 ? 'mutlu' : 'anlat') }),
        h('h2', null, '👂 ' + kd.ad),
        h('p', null, r.dogru + ' / ' + r.toplam + ' doğru'),
        yeniAcildi ? h('p', null, '🔓 Kademe ' + (no + 1) + ' açıldı: ' + AR_KADEMELER[no].ad) : (r.dogru < 8 ? h('p', { class: 'kucukNot' }, 'Sonraki kademe için 10 sorudan 8’i gerekiyor.') : null),
        not ? h('p', { class: 'kucukNot' }, not) : null,
        oto ? dugme('Bir tur daha', function () { modalKapat(); arTur(arKayit().zor, true); })
          : sonraki && r.dogru >= 8 ? dugme('Kademe ' + sonraki + ' →', function () { modalKapat(); arTur(sonraki); }) : dugme('Tekrar', function () { modalKapat(); arTur(no); }),
        !oto && sonraki && r.dogru >= 8 ? dugme('Tekrar', function () { modalKapat(); arTur(no); }, 'ikincil') : null,
        dugme('Kulak eğitimine dön', function () { modalKapat(); turdanCik(false); kulakAraci(); }, 'ikincil'),
        dugme('Kapat', function () { modalKapat(); turdanCik(false); }, 'gri')), { kapatilamaz: true });
    }
  });
}

// ---- Araçlar → Kulak eğitimi → Aralık sekmesi ----
function kaAralikCiz(g, A) {
  const P = PERDE[AR_SABIT];
  const yon = A.arYon || 'c';
  const kart = h('div', { class: 'kaKart' },
    h('div', { class: 'kaBaslik' }, h('b', null, 'İki ses aralıkları'), h('span', null, 'alt ses ' + P.ad)),
    h('div', { class: 'segment arYon' },
      h('button', { type: 'button', class: yon === 'c' ? 'aktif' : '', onclick: function () { A.arYon = 'c'; kulakAraci(); } }, '↗ Çıkıcı'),
      h('button', { type: 'button', class: yon === 'i' ? 'aktif' : '', onclick: function () { A.arYon = 'i'; kulakAraci(); } }, '↘ İnici')),
    h('div', { class: 'kulakSatir arDinle' }, ARALIKLAR.map(function (a) {
      return kaDugme('▶ ' + arMetin(a), function () { return arOlay(P.koma, a, yon); });
    })),
    h('div', { class: 'kulakSatir' },
      kaDugme('▶ Bakiye ↔ K. mücenneb', function () { return kulakArdArda([arOlay(P.koma, ARALIK.B, yon), arOlay(P.koma, ARALIK.S, yon)], 0.8); }),
      kaDugme('▶ B. mücenneb ↔ Tanini', function () { return kulakArdArda([arOlay(P.koma, ARALIK.K, yon), arOlay(P.koma, ARALIK.T, yon)], 0.8); })),
    h('p', { class: 'kucukNot kaAhenk' }, 'Önce iki uçtaki farkı duy (bakiye 4, artık ikili 12 koma); 1 komalık farklar en sonda.'));
  g.appendChild(kart);
  const K = arKayit(), ust = arEnUst();
  const liste = h('div', { class: 'arKademeler' });
  AR_KADEMELER.forEach(function (kd) {
    const acik = arAcik(kd.no), en = K.en[kd.no];
    const b = h('button', { type: 'button', class: 'arKademe' + (acik ? '' : ' kilitli') + (en >= 8 ? ' bitti' : ''), disabled: !acik, onclick: function () { if (acik) arTur(kd.no); } },
      h('i', null, en >= 8 ? '✓' : acik ? String(kd.no) : '🔒'),
      h('span', null, h('b', null, kd.ad), h('small', null, kd.tip === 'genis' ? 'B–S, K–T · hangisi geniş?' : kd.kume.length > 1 ? (kd.kume === AR_UCLU ? 'güvenli üçlüler' : '') + (kd.yon === 'i' ? ' · inici' : kd.yon === 'k' ? ' · karışık yön' : ' · çıkıcı') : kd.kume[0].map(function (x) { return ARALIK[x].ad; }).join(' – ') + (kd.yon === 'k' ? ' · karışık' : ''))),
      h('small', { class: 'arEn' }, en != null ? en + '/10' : ''));
    liste.appendChild(b);
  });
  const anten = h('div', { class: 'kaAntrenman' }, h('h3', null, '🎯 Kademeler'),
    h('p', { class: 'kucukNot' }, 'Her kademe 10 soru; 8 doğru ile sonraki açılır. İlk dört kademede aralık çıkıcı; ilk altı kademede alt ses sabit (' + P.ad + ').'),
    liste,
    dugme('▶ Otomatik antrenman (kademe ' + Math.min(ust, K.zor || 1) + ')', function () { arTur(Math.min(arEnUst(), arKayit().zor || 1), true); }),
    h('p', { class: 'kucukNot' }, 'Otomatik antrenmanda 9/10 ile açık kademeler içinde bir üste çıkarsın, 6 ya da daha azında bir alta inersin.'));
  g.appendChild(anten);
}
