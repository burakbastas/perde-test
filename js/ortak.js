// =====================================================
// ORTAK DERSLER (Türk Dili 1, Atatürk İlkeleri ve İnkılap Tarihi 1, İngilizce 1)
// OMÜ 1. sınıf ortak dersleri için sınav hazırlığı. Meşk Yolu’ndan, ünvanlardan ve
// Sonsuz Meşk’ten ayrıdır; Öğren sekmesinin altında görünür, Ayarlar’dan gizlenebilir.
// İlerleme DURUM.ortak[dersId] = { u: { no: { oz: 1, en: 0..100 } }, vize: %, final: %, kron: % }
// =====================================================
'use strict';

const ORTAK_DERSLER = [];
const ORTAK = {};
function ORTAK_DERS(d) {
  d.uniteler.forEach(function (u) { u.ders = d; });
  ORTAK_DERSLER.push(d);
  ORTAK[d.id] = d;
}
const ORTAK_VIZE = 7;          // varsayım: vize 1–7. üniteleri kapsar
const ORTAK_SURE = 45;         // denemelerde soru başına saniye
let ORTAK_ACIK = null;         // Öğren’de açık olan ders

function ortakGorunur() { return !(DURUM.ayar && DURUM.ayar.ortakGizli); }
function ortakKayit(d) {
  DURUM.ortak = DURUM.ortak || {};
  const k = DURUM.ortak[d.id] = DURUM.ortak[d.id] || {};
  k.u = k.u || {};
  return k;
}
function ortakUnite(d, no) { const k = ortakKayit(d); return k.u[no] = k.u[no] || {}; }
function ortakBitenSay(d) {
  const k = ortakKayit(d);
  return d.uniteler.filter(function (u) { return (k.u[u.no] || {}).en >= 70; }).length;
}

// ---------- Soru üretimi ----------
function ortakSecimSorusu(u, s) {
  const siklar = [{ key: 'd', metin: s[1] }].concat(s[2].map(function (y, i) { return { key: 'y' + i, metin: y }; }));
  return {
    tip: 'secim', liste: true, soru: { metin: s[0], kucuk: s[0].length > 34 }, siklar: siklar, dogru: 'd', dogruMetin: s[1],
    aciklama: '<span class="soluk">' + u.ders.kisa + ' · Ünite ' + u.no + ': ' + kacis(u.ad) + '</span>'
  };
}
function ortakOlaylar(d, uniteler) {
  const L = [], gor = {};
  (uniteler || d.uniteler).forEach(function (u) {
    (u.olaylar || []).forEach(function (o) {
      if (gor[o[0]]) return;
      gor[o[0]] = 1;
      L.push({ key: o[0], tarih: o[1], olay: o[2], no: u.no });
    });
  });
  return L.sort(function (a, b) { return a.key < b.key ? -1 : a.key > b.key ? 1 : 0; });
}
// Aynı yılın ayını/gününü bilmeyi gerektirmesin diye mümkünse farklı yıllardan seç
function ortakKronolojiSorusu(olaylar, adet) {
  adet = adet || 4;
  const yillar = {};
  karistir(olaylar).forEach(function (o) { const y = o.key.slice(0, 4); if (!yillar[y]) yillar[y] = o; });
  let secim = Object.keys(yillar).map(function (y) { return yillar[y]; });
  if (secim.length < adet) secim = karistir(olaylar);
  secim = karistir(secim).slice(0, adet).sort(function (a, b) { return a.key < b.key ? -1 : 1; });
  if (secim.length < 3) return null;
  return {
    tip: 'dizi', soru: { metin: 'Olayları eskiden yeniye sırala', kucuk: true },
    dizi: { havuz: karistir(secim.map(function (o) { return { key: o.key, metin: o.olay }; })), uzunluk: secim.length, beklenen: secim.map(function (o) { return o.key; }), genis: true },
    dogruMetin: 'doğru sıra aşağıda',
    aciklama: secim.map(function (o) { return '<b>' + kacis(o.tarih) + '</b> ' + kacis(o.olay); }).join('<br>')
  };
}
function ortakSorular(d, uniteler, adet, kronAdet) {
  let havuz = [];
  uniteler.forEach(function (u) { u.sorular.forEach(function (s) { havuz.push([u, s]); }); });
  havuz = karistir(havuz);
  // Ünitelere dengeli dağıt: önce her üniteden sırayla al
  const kova = {};
  havuz.forEach(function (x) { (kova[x[0].no] = kova[x[0].no] || []).push(x); });
  const secilen = [];
  let tur = 0;
  while (secilen.length < adet && tur < 99) {
    let eklendi = false;
    uniteler.forEach(function (u) { const k = kova[u.no]; if (k && k[tur] && secilen.length < adet) { secilen.push(k[tur]); eklendi = true; } });
    if (!eklendi) break;
    tur++;
  }
  const L = karistir(secilen).map(function (x) { return ortakSecimSorusu(x[0], x[1]); });
  const ol = ortakOlaylar(d, uniteler);
  for (let i = 0; i < (kronAdet || 0) && ol.length >= 4; i++) {
    const q = ortakKronolojiSorusu(ol, 4);
    if (q) L.splice(Math.floor(Math.random() * (L.length + 1)), 0, q);
  }
  return L;
}

// ---------- Turlar ----------
function ortakTur(d, baslik, sorular, sure, kaydetF) {
  turBaslat({
    tip: 'ortak', sorular: sorular, kalp: 0, joker: false, kayit: false, sure: sure || 0, etiket: d.ikon + ' ' + baslik, yanlislar: [],
    bitince: function (r) {
      const yuzde = Math.round(100 * r.dogru / Math.max(1, r.toplam));
      const eski = kaydetF ? kaydetF(yuzde) : null;
      kaydet();
      const yanlis = (TUR && TUR.yanlislar) || [];
      const not = yuzde >= 85 ? 'Harika, bu konu hazır 🎉' : yuzde >= 70 ? 'İyi gidiyor. Yanlışlarına bir göz at.' : yuzde >= 50 ? 'Fena değil; özeti bir kez daha okuyup tekrar dene.' : 'Önce özeti oku, sonra yeniden dene.';
      const liste = yanlis.length ? h('div', { class: 'ortakYanlis' },
        h('h3', null, 'Yanlışların'),
        yanlis.map(function (v) {
          return h('div', { class: 'oyRow' }, h('p', null, v.soru.metin), v.tip === 'dizi' ? null : h('b', null, '✓ ' + v.dogruMetin),
            v.tip === 'dizi' ? h('div', { class: 'soluk', html: v.aciklama }) : null);
        })) : null;
      modalAc(h('div', { class: 'sonuc' },
        h('div', { class: 'sonucMaskot', html: bulbulSVG(yuzde >= 70 ? 'mutlu' : 'anlat') }),
        h('h2', null, baslik),
        h('div', { class: 'ortakSkor' }, h('b', null, '%' + yuzde), h('span', null, r.dogru + ' / ' + r.toplam + ' doğru')),
        eski != null && yuzde > eski ? h('p', { class: 'kucukNot ortala' }, 'Yeni rekor! (önceki %' + eski + ')') : null,
        h('p', null, not),
        liste,
        dugme('Tekrar dene', function () { modalKapat(); const L = yenile(); L.yenile = sorular.yenile; ortakTur(d, baslik, L, sure, kaydetF); }),
        dugme(d.kisa + '’e dön', function () { modalKapat(); turdanCik(false); }, 'gri')), { kapatilamaz: true, genis: !!liste });
      function yenile() { return sorular.yenile ? sorular.yenile() : karistir(sorular); }
    }
  });
}
function ortakUniteTesti(u) {
  const d = u.ders;
  const uret = function () { return ortakSorular(d, [u], 10, (u.olaylar || []).length >= 4 ? 1 : 0); };
  const L = uret(); L.yenile = uret;
  ortakTur(d, 'Ünite ' + u.no + ' testi', L, 0, function (y) {
    const k = ortakUnite(d, u.no), eski = k.en;
    k.en = Math.max(k.en || 0, y);
    return eski;
  });
}
function ortakDeneme(d, tur) {
  const vize = tur === 'vize';
  const uniteler = d.uniteler.filter(function (u) { return !vize || u.no <= ORTAK_VIZE; });
  const uret = function () { return ortakSorular(d, uniteler, vize ? 20 : 30, d.id === 'ati' ? 2 : 0); };
  const L = uret(); L.yenile = uret;
  ortakTur(d, (vize ? 'Vize' : 'Final') + ' denemesi', L, ORTAK_SURE, function (y) {
    const k = ortakKayit(d), eski = k[tur];
    k[tur] = Math.max(k[tur] || 0, y);
    return eski;
  });
}
function ortakKronoloji(d) {
  const ol = ortakOlaylar(d);
  const uret = function () { const L = []; for (let i = 0; i < 8; i++) { const q = ortakKronolojiSorusu(ol, i < 4 ? 4 : 5); if (q) L.push(q); } return L; };
  const L = uret(); L.yenile = uret;
  ortakTur(d, 'Kronoloji', L, 0, function (y) { const k = ortakKayit(d), eski = k.kron; k.kron = Math.max(k.kron || 0, y); return eski; });
}
function ortakOzet(u, sonra) {
  const d = u.ders;
  dersGoster(d.ikon + ' Ünite ' + u.no + ': ' + u.ad, u.ozet.map(function (x) { return { baslik: x[0], metin: x[1] }; }), function () {
    ortakUnite(d, u.no).oz = 1; kaydet();
    ekranAc('ekranAna'); sekmeAc('ogren');
    if (sonra !== false) modalAc(h('div', { class: 'sonuc' },
      h('div', { class: 'sonucMaskot', html: bulbulSVG('mutlu') }),
      h('h2', null, 'Özet bitti'),
      h('p', null, 'Şimdi 10 soruluk kısa bir testle pekiştir.'),
      dugme('✏️ Teste başla', function () { modalKapat(); ortakUniteTesti(u); }),
      dugme('Sonra', modalKapat, 'gri')));
  }, 'Bitir', true);
}

// ---------- Zaman çizelgesi ----------
function ortakZamanCizelgesi(d) {
  let kapsam = 'hepsi';
  const govde = h('div', { class: 'zamanCizelge' });
  const sec = h('div', { class: 'segment' });
  function ciz() {
    bosalt(sec);
    [['hepsi', 'Hepsi'], ['vize', 'Vize (1–' + ORTAK_VIZE + ')'], ['final', 'Final (' + (ORTAK_VIZE + 1) + '–14)']].forEach(function (x) {
      sec.appendChild(h('button', { type: 'button', class: kapsam === x[0] ? 'aktif' : '', onclick: function () { kapsam = x[0]; ciz(); } }, x[1]));
    });
    bosalt(govde);
    let yil = null;
    ortakOlaylar(d).filter(function (o) { return kapsam === 'hepsi' || (kapsam === 'vize' ? o.no <= ORTAK_VIZE : o.no > ORTAK_VIZE); }).forEach(function (o) {
      const y = o.key.slice(0, 4);
      if (y !== yil) { yil = y; govde.appendChild(h('div', { class: 'zcYil' }, y)); }
      govde.appendChild(h('div', { class: 'zcSatir' }, h('span', { class: 'zcTarih' }, o.tarih.replace(/\s*\d{4}$/, '') || y), h('span', { class: 'zcOlay' }, o.olay), h('span', { class: 'zcNo' }, 'Ü' + o.no)));
    });
  }
  ciz();
  modalAc(h('div', null, h('h2', null, '🕰️ Zaman çizelgesi'), sec, govde,
    dugme('⏳ Kronoloji testi', function () { modalKapat(); ortakKronoloji(d); }),
    dugme('Kapat', modalKapat, 'gri')), { genis: true });
}

// ---------- Öğren sekmesi: ortak dersler bölümü ve ders sayfası ----------
function ortakBolumCiz(g) {
  if (!ortakGorunur() || !ORTAK_DERSLER.length) return;
  g.appendChild(h('div', { class: 'oBolum ortakBaslik' }, h('span', null, 'Ortak dersler'), h('small', null, 'Konservatuvar 1. sınıf ortak dersleri: özet, test ve sınav denemesi')));
  const kap = h('div', { class: 'oOrtak' });
  ORTAK_DERSLER.forEach(function (d) {
    const n = ortakBitenSay(d), top = d.uniteler.length;
    kap.appendChild(h('button', { class: 'oDers', type: 'button', style: '--r:' + d.renk, onclick: function () { ORTAK_ACIK = d.id; sekmeAc('ogren'); } },
      h('span', { class: 'ik' }, d.ikon),
      h('span', { class: 'm' }, h('b', null, d.ad), h('span', { class: 'c' }, h('span', { style: 'width:' + Math.round(100 * n / top) + '%' }))),
      h('small', null, n + '/' + top + ' ›')));
  });
  g.appendChild(kap);
}
function ortakDersCiz(g, d) {
  const k = ortakKayit(d);
  g.appendChild(h('div', { class: 'ortakBas', style: '--r:' + d.renk },
    h('button', { class: 'geriOk', type: 'button', 'aria-label': 'Öğren’e dön', onclick: function () { ORTAK_ACIK = null; sekmeAc('ogren'); } }, '‹'),
    h('span', { class: 'ik' }, d.ikon),
    h('div', null, h('h2', null, d.ad), h('p', null, d.kisa + ' · ' + ortakBitenSay(d) + '/' + d.uniteler.length + ' ünite tamam'))));
  const skor = function (x) { return x != null ? 'En iyi %' + x : 'Henüz yok'; };
  const izgara = h('div', { class: 'oIzgara' },
    h('button', { class: 'oKutu', type: 'button', style: '--r:var(--kobalt)', onclick: function () { ortakDeneme(d, 'vize'); } },
      h('span', { class: 'ik' }, '📝'), h('b', null, 'Vize denemesi'), h('small', null, '20 soru · 1–' + ORTAK_VIZE + '. üniteler · ' + ORTAK_SURE + ' sn/soru'), h('small', { class: 'skor' }, skor(k.vize))),
    h('button', { class: 'oKutu', type: 'button', style: '--r:var(--mercan)', onclick: function () { ortakDeneme(d, 'final'); } },
      h('span', { class: 'ik' }, '🏁'), h('b', null, 'Final denemesi'), h('small', null, '30 soru · bütün üniteler · ' + ORTAK_SURE + ' sn/soru'), h('small', { class: 'skor' }, skor(k.final))));
  if (ortakOlaylar(d).length >= 8) {
    izgara.appendChild(h('button', { class: 'oKutu', type: 'button', style: '--r:var(--turkuaz)', onclick: function () { ortakZamanCizelgesi(d); } },
      h('span', { class: 'ik' }, '🕰️'), h('b', null, 'Zaman çizelgesi'), h('small', null, ortakOlaylar(d).length + ' tarih, yıl yıl')));
    izgara.appendChild(h('button', { class: 'oKutu', type: 'button', style: '--r:var(--mor)', onclick: function () { ortakKronoloji(d); } },
      h('span', { class: 'ik' }, '⏳'), h('b', null, 'Kronoloji'), h('small', null, 'Olayları sıraya diz'), h('small', { class: 'skor' }, skor(k.kron))));
  }
  g.appendChild(izgara);
  g.appendChild(h('p', { class: 'kucukNot' }, 'Vize kapsamını 1–' + ORTAK_VIZE + '. üniteler olarak varsaydık. Sınav biçimi farklıysa haber ver.'));
  g.appendChild(h('div', { class: 'oBolum' }, 'Üniteler'));
  const liste = h('div', { class: 'oOrtak' });
  d.uniteler.forEach(function (u) {
    const x = k.u[u.no] || {};
    const durum = x.en >= 70 ? 'b' : x.oz || x.en ? 's' : '';
    liste.appendChild(h('button', { class: 'oUnite ' + durum, type: 'button', style: '--r:' + d.renk, onclick: function () { ortakUniteMenu(u); } },
      h('i', null, x.en >= 70 ? '✓' : String(u.no)),
      h('span', { class: 'm' }, h('b', null, u.ad), h('small', null, u.ozet.length + ' kart · ' + u.sorular.length + ' soru' + (u.no === ORTAK_VIZE ? ' · vize sonu' : ''))),
      h('small', { class: 'yuzde' }, x.en != null ? '%' + x.en : '›')));
  });
  g.appendChild(liste);
}
function ortakUniteMenu(u) {
  const x = ortakUnite(u.ders, u.no);
  modalAc(h('div', null,
    h('p', { class: 'kucukNot' }, u.ders.ikon + ' ' + u.ders.kisa + ' · Ünite ' + u.no),
    h('h2', null, u.ad),
    h('p', null, (x.oz ? '✓ Özeti okudun. ' : '') + (x.en != null ? 'Test rekorun: %' + x.en : 'Henüz test çözmedin.')),
    dugme('📖 Özet (' + u.ozet.length + ' kart)', function () { modalKapat(); ortakOzet(u); }),
    dugme('✏️ Test (10 soru)', function () { modalKapat(); ortakUniteTesti(u); }),
    dugme('Kapat', modalKapat, 'gri')));
}
