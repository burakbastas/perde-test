// =====================================================
// MOTOR: dallar/üniteler kaydı, kilit mantığı, Leitner tekrar, tur (oyun) motoru,
// soru ekranı, jokerler, ders görüntüleyici, eski kayıt taşıma
// =====================================================
'use strict';

const DALLAR = {
  koma:  { ad: 'Koma',          ikon: '🎼', renk: 'var(--turkuaz)', uniteler: KOMA_UNITELER },
  perde: { ad: 'Perde',         ikon: '🎶', renk: 'var(--kobalt)',  uniteler: PERDE_UNITELER },
  gocurme: { ad: 'Göçürme',     ikon: '🔁', renk: 'var(--kiremit)', uniteler: GOCURME_UNITELER },
  cesni: { ad: 'Dörtlü-Beşli',  ikon: '🎻', renk: 'var(--mercan)',  uniteler: CESNI_UNITELER },
  makam: { ad: 'Makam',         ikon: '🏵️', renk: 'var(--zumrut)',  uniteler: MAKAM_UNITELER },
  ahenk: { ad: 'Ahenk',         ikon: '🌬️', renk: 'var(--erguvan)', uniteler: AHENK_UNITELER },
  usul:  { ad: 'Usul',          ikon: '🥁', renk: 'var(--safran)',  uniteler: USUL_UNITELER },
  bati:  { ad: 'Batı Teorisi',  ikon: '🎹', renk: 'var(--mor)',     uniteler: BATI_UNITELER }
};
// Pedagojik sıra: Koma → Perde → Usul → Dörtlü-Beşli → Göçürme → Makam → Ahenk → Batı
const DAL_SIRA = ['koma', 'perde', 'usul', 'cesni', 'gocurme', 'makam', 'ahenk', 'bati'];
const TR_DALLAR = ['koma', 'perde', 'usul', 'cesni', 'gocurme', 'makam', 'ahenk'];

// Batı Teorisi'nin pedagojik sırası: tartımlar aralıkların arasına; tonlar en sona (TSM'de görülmeyebilir)
const BATI_SIRA = ['b11', 'b1', 'b12', 'b2', 'b3', 'b13', 'b4', 'b14', 'b15', 'b16', 'b17', 'b18', 'b19', 'b20', 'sn-dikte', 'b5', 'b6', 'b7', 'b8', 'b9', 'b10'];
(function () {
  const L = BATI_SIRA.map(function (id) { return BATI_UNITELER.find(function (u) { return u.id === id; }); }).filter(Boolean);
  BATI_UNITELER.forEach(function (u) { if (L.indexOf(u) < 0) L.push(u); });
  BATI_UNITELER.length = 0;
  L.forEach(function (u, i) { u.no = i + 1; BATI_UNITELER.push(u); });
})();

// ---------- Sonsuz Meşk: her Türk müziği dalının sonunda ucu açık bir ünite ----------
// O dalın geçilmiş seviyelerinden karışık sorular; doğru bildikçe zor seviyeler ağırlaşır.
TR_DALLAR.forEach(function (d) {
  const L = DALLAR[d].uniteler;
  L.push({ id: 'sn-' + d, dal: d, no: L.length + 1, ad: 'Sonsuz Meşk', kisa: 'Bitmeyen karışık sorular · rekorunu geç', sonsuz: true, ogeler: [],
    seviyeler: [{ id: 'sn-' + d, tip: 'sonsuz', ad: 'Sonsuz Meşk', soruSay: 0, uret: function () { return []; } }] });
});
function gercekUniteler(d) { return DALLAR[d].uniteler.filter(function (u) { return !u.sonsuz; }); }

const UNITE = {}, SEVIYE = {}, DAL_SEVIYELERI = {};
DAL_SIRA.forEach(function (d) {
  DAL_SEVIYELERI[d] = [];
  DALLAR[d].uniteler.forEach(function (u) {
    UNITE[u.id] = u;
    u.seviyeler.forEach(function (s) {
      if (SEVIYE[s.id]) console.warn('Aynı seviye kimliği: ' + s.id);
      s.unite = u; s.dal = d;
      SEVIYE[s.id] = s;
      DAL_SEVIYELERI[d].push(s);
    });
    u.boss = u.seviyeler.filter(function (s) { return s.tip === 'boss'; }).pop() || null;
  });
});

// Önerilen sıra (Meşk Yolu): dallar karışık, pedagojik sırayla. Batı üniteleri (b…) yalnızca
// Ayarlar'da Batı açıksa görünür; Batı'nın ton konuları en sonda.
const MESK_SIRA = ['km1', 'b11', 'p1', 'b1', 'km2', 'u1', 'p2', 'km3', 'b12', 'db1', 'u2', 'b2', 'db2', 'p3', 'b3', 'db3', 'b13',
  'gc1', 'b4', 'db4', 'b14', 'gc2', 'b15', 'b16', 'b17', 'u3', 'mk1', 'p4', 'mk2', 'a1', 'mk3', 'gc3', 'u4', 'b18', 'db5', 'mk4', 'p5', 'gc4',
  'u5', 'b19', 'p6', 'a2', 'db6', 'gc5', 'u6', 'b20', 'mk5', 'p7', 'u7', 'mk6', 'b5', 'b6', 'b7', 'b8', 'b9', 'b10'];
const MESK_TR = MESK_SIRA.filter(function (id) { return id[0] !== 'b'; });
function meskSirasi() {
  return MESK_SIRA.filter(function (id) { return DURUM.ayar.bati || id[0] !== 'b'; }).map(function (id) { return UNITE[id]; }).filter(Boolean);
}

// ---------- Durum sorguları ----------
function yildizOf(id) { return DURUM.yildiz[id] || 0; }
function bittiMi(s) { return yildizOf(s.id) > 0; }
// Zincir: kilit sırasına giren seviyeler. Köprü (bonus) seviyeleri her zaman isteğe bağlıdır;
// sonradan eklenen (yeni) seviyeler, oyuncu o üniteyi daha önce bitirdiyse isteğe bağlı sayılır.
// 3.1: Ayarlar'da sesli sorular kapalıysa 👂 seviyeleri de isteğe bağlıdır
function istegeBagliMi(s) { return !!s.bonus || (!!s.yeni && uniteBitti(s.unite)) || (!!s.kulak && DURUM.ayar.kulak === false); }
function acikMi(s) {
  if (bittiMi(s)) return true;   // daha önce geçilmiş seviye (sıra değişse de) açık kalır
  const L = DAL_SEVIYELERI[s.dal];
  let i = L.indexOf(s) - 1;
  while (i >= 0 && istegeBagliMi(L[i])) i--;
  return i < 0 || bittiMi(L[i]);
}
function uniteBitti(u) { return !!u.boss && bittiMi(u.boss); }
function uniteBaslamadi(u) { return !u.seviyeler.some(bittiMi); }
function uniteIlerleme(u) {
  const L = u.seviyeler.filter(function (s) { return !istegeBagliMi(s); });
  return { bitti: L.filter(bittiMi).length, toplam: L.length || 1 };
}
function toplamYildiz() {
  let t = 0;
  for (const k in DURUM.yildiz) if (SEVIYE[k]) t += DURUM.yildiz[k] || 0;
  return t + (DURUM.bonus || 0);
}
function cuzdan() { return Math.max(0, toplamYildiz() - (DURUM.harcanan || 0)); }
function bitenUniteSayisi(dallar) {
  let n = 0;
  (dallar || DAL_SIRA).forEach(function (d) { DALLAR[d].uniteler.forEach(function (u) { if (uniteBitti(u)) n++; }); });
  return n;
}
function siradakiSeviye(dal) {
  const L = DAL_SEVIYELERI[dal];
  for (let i = 0; i < L.length; i++) if (!bittiMi(L[i]) && !istegeBagliMi(L[i])) return L[i];
  return null;
}

// ---------- Ünvanlar ----------
// Meşk geleneğindeki mübtedî – mutavassıt – müntehî basamaklarına dayanır.
// Eşikler, toplam Türk müziği ünitesinin ORANIDIR: yeni ünite eklendikçe merdiven kendiliğinden
// ayarlanır (35 ünitede 2, 5, 9, 13, 17, 20, 35). Ulaşılan en yüksek ünvan kayıtta tutulur ve düşmez.
const UNVANLAR = [
  { oran: 0,      ad: 'Mübtedî',       yonelme: 'Mübtedî’ye',       anlam: 'Meşke yeni başlayan',                 renk: '#b0703c' },
  { oran: 2 / 35,  ad: 'Heveskâr',      yonelme: 'Heveskâr’a',       anlam: 'Mûsikiye gönül vermiş',               renk: '#138f92' },
  { oran: 5 / 35,  ad: 'Mutavassıt',    yonelme: 'Mutavassıt’a',     anlam: 'Orta seviyeye ulaşmış',               renk: '#2348a8' },
  { oran: 9 / 35,  ad: 'Mûsikişinas',   yonelme: 'Mûsikişinas’a',    anlam: 'Mûsikiden anlayan',                   renk: '#d84a33' },
  { oran: 13 / 35, ad: 'Müntehî',       yonelme: 'Müntehî’ye',       anlam: 'İleri seviyeye ulaşmış',              renk: '#15834f' },
  { oran: 17 / 35, ad: 'Muallim',       yonelme: 'Muallim’e',        anlam: 'Meşk verebilecek bilgide',            renk: '#7647b3' },
  { oran: 20 / 35, ad: 'Üstad-ı Kâmil', yonelme: 'Üstad-ı Kâmil’e',  anlam: 'Temel Türk müziği ünitelerini bitiren', renk: '#d9a520' },
  { oran: 1,      ad: 'Hâce',          yonelme: 'Hâce’ye',          anlam: 'Bütün Türk müziği ünitelerini bitiren meşk hocası', renk: '#8a1c4a' }
];
function toplamTrUnite() { return TR_DALLAR.reduce(function (t, d) { return t + gercekUniteler(d).length; }, 0); }
function unvanEsik(x) { return Math.ceil(x.oran * toplamTrUnite() - 1e-9); }
function unvanSiraHesap(n) { let i = 0; UNVANLAR.forEach(function (x, j) { if (n >= unvanEsik(x)) i = j; }); return i; }
// Gösterilen ünvan: hesaplanan ile ulaşılmış en yüksek olanın büyüğü
function unvanSira() {
  const i = unvanSiraHesap(bitenUniteSayisi(TR_DALLAR));
  if (i > (DURUM.unvanEn || 0)) DURUM.unvanEn = i;
  return Math.max(i, DURUM.unvanEn || 0);
}
function unvan() { return UNVANLAR[unvanSira()]; }
function sonrakiUnvan() { return UNVANLAR[unvanSira() + 1] || null; }
// Şerit ve profil için: ilerleme oranı ve alt yazı
function unvanDurum() {
  const i = unvanSira(), u = UNVANLAR[i], s = UNVANLAR[i + 1] || null;
  const n = bitenUniteSayisi(TR_DALLAR), T = toplamTrUnite();
  let oran, metin;
  if (s) {
    const a = unvanEsik(u), b = unvanEsik(s);
    oran = Math.max(0, Math.min(1, (n - a) / Math.max(1, b - a)));
    metin = s.yonelme + ' ' + Math.max(1, b - n) + ' ünite kaldı';
  } else if (n < T) {
    oran = n / T; metin = 'Yeni üniteler geldi: ' + n + ' / ' + T;
  } else { oran = 1; metin = null; }
  return { i: i, u: u, s: s, n: n, T: T, oran: oran, metin: metin };
}

// ---------- Kayıt taşıma ----------
// Her taşıma bir kez çalışır (DURUM.tv). Çalışmadan önce kaydın kopyası ayrı anahtara yazılır.
// Kural: seviye kimlikleri değişmez; birleşen seviyelerde yıldızlar yeniye geçer, fark cüzdana bonus.
const TASIMALAR = [
  // 1 (2.9): bugünkü ünvan kalıcı olarak kayda yazılır; sonraki ünite eklemeleri kimseyi düşürmez
  // (35 ünitelik eski eşiklerle hesaplanır; böylece 2.8'den doğrudan yeni sürüme geçen de düşmez)
  function () {
    const ESKI = [0, 2, 5, 9, 13, 17, 20, 35], n = bitenUniteSayisi(TR_DALLAR);
    let i = 0; ESKI.forEach(function (e, j) { if (n >= e) i = j; });
    DURUM.unvanEn = Math.max(DURUM.unvanEn || 0, i, unvanSiraHesap(n));
  },
  // 2 (2.10): Sonsuz Meşk rekorları artık puanla; eski (doğru sayısı) rekorlar ayrıca saklanır
  function () {
    const r = DURUM.rekor || {}; DURUM.rekorEski = DURUM.rekorEski || {};
    TR_DALLAR.concat(['karisik']).forEach(function (d) { if (r[d]) { DURUM.rekorEski[d] = r[d]; delete r[d]; } });
    DURUM.rekor = r;
  },
  // 3 (2.11): Koma'nın ilk dört seviyesi ikiye indi; yıldızlar yeni seviyeye, fark cüzdana
  function () { yildizBirlestir(['km1', 'km2'], 'km1'); yildizBirlestir(['km3', 'km4'], 'km3'); }
];
function kayitTasi() {
  const v = DURUM.tv || 0;
  if (v >= TASIMALAR.length) return;
  tasimaYedegi();
  for (let i = v; i < TASIMALAR.length; i++) {
    try { TASIMALAR[i](); } catch (e) { console.warn('Taşıma ' + (i + 1) + ' hata verdi', e); }
  }
  DURUM.tv = TASIMALAR.length;
  kaydet();
}
// Birleşen seviyeler için yardımcı (ileriki sürümler): eski seviyelerin en yüksek yıldızı yeniye geçer
function yildizBirlestir(eskiIdler, yeniId) {
  const L = eskiIdler.map(function (id) { return DURUM.yildiz[id] || 0; });
  const en = Math.max.apply(null, [DURUM.yildiz[yeniId] || 0].concat(L));
  const toplam = L.reduce(function (t, x) { return t + x; }, 0);
  DURUM.yildiz[yeniId] = en;
  DURUM.bonus = (DURUM.bonus || 0) + Math.max(0, toplam - en);
  eskiIdler.forEach(function (id) { if (id !== yeniId) delete DURUM.yildiz[id]; });
}

// ---------- Seri ----------
let SERI_MESAJ = null;
function seriGun() { const s = DURUM.seri; return (s.son === bugun() || s.son === gunEkle(-1)) ? s.sayi : 0; }
function seriGuncelle() {
  const s = DURUM.seri, b = bugun();
  if (s.son === b) return;
  s.sayi = (s.son === gunEkle(-1)) ? s.sayi + 1 : 1;
  s.son = b;
  let m = '🔥 ' + s.sayi + '. gün serisi!';
  if (s.sayi % 7 === 0) { DURUM.bonus++; m += ' +1 ⭐'; }
  kaydet();
  SERI_MESAJ = m;   // soruyu kapatmasın diye tur bitince gösterilir
}

// ---------- Leitner tekrar ----------
const LEITNER_GUN = [0, 1, 2, 4, 8, 16];
function ogeCevap(id, dogru) {
  if (!id) return;
  const r = DURUM.tekrar[id] || { k: 0, t: bugun(), d: 0, y: 0 };
  if (dogru) { r.d++; r.k = Math.min(5, r.k + 1); r.t = gunEkle(LEITNER_GUN[r.k]); }
  else { r.y++; r.k = 0; r.t = bugun(); }
  DURUM.tekrar[id] = r;
}
function ogeGecerli(id) {
  const p = id.split(':')[0];
  if (p === 'p') return !!perdeOge(id);
  if (p === 'k') return KM_VERI.some(function (v) { return v.oge === id; });
  if (p === 'd') return CESNILER.some(function (c) { return c.oge === id; });
  if (p === 'm') return !!makamBul(id);
  if (p === 'b') return true;
  if (p === 'u') return !!USUL[id.slice(2)];
  if (p === 'g') return !!(MAKAM[id.slice(2)] || CESNI[id.slice(2)]);
  return false;
}
function vadesiGelenler() {
  const b = bugun();
  return Object.keys(DURUM.tekrar).filter(function (id) { return ogeGecerli(id) && DURUM.tekrar[id].t <= b; })
    .sort(function (a, c) { return DURUM.tekrar[a].k - DURUM.tekrar[c].k || (DURUM.tekrar[a].t < DURUM.tekrar[c].t ? -1 : 1); });
}
function zayiflar() {
  return Object.keys(DURUM.tekrar).filter(function (id) { const r = DURUM.tekrar[id]; return ogeGecerli(id) && r.y > 0 && r.k <= 1; })
    .sort(function (a, c) { return (DURUM.tekrar[c].y - DURUM.tekrar[c].d) - (DURUM.tekrar[a].y - DURUM.tekrar[a].d); });
}
function ogeAdi(id) {
  const p = id.split(':');
  if (p[0] === 'p') return perdeOge(id).ad;
  if (p[0] === 'k') return KM_VERI.find(function (v) { return v.oge === id; }).ad;
  if (p[0] === 'd') return CESNILER.find(function (c) { return c.oge === id; }).ad;
  if (p[0] === 'm') return makamBul(id).ad;
  if (p[0] === 'b') return p[1] === 'a' ? kodAd(p[2]) : tonAd(+p[2], 'majör') + ' / ' + tonAd(+p[2], 'minör');
  if (p[0] === 'u') return USUL[p[1]].ad;
  if (p[0] === 'g') return (MAKAM[p[1]] ? MAKAM[p[1]].ad + ' dizisi' : CESNI[p[1]].ad) + ' göçürme';
  return id;
}
function ogeDali(id) { return { p: 'perde', k: 'koma', d: 'cesni', m: 'makam', b: 'bati', u: 'usul', g: 'gocurme' }[id.split(':')[0]]; }
function ogeSorusu(id) {
  const p = id.split(':')[0];
  if (p === 'p') return perdeOgeSorusu(id);
  if (p === 'k') return komaOgeSorusu(id);
  if (p === 'd') return cesniOgeSorusu(id);
  if (p === 'm') return makamOgeSorusu(id);
  if (p === 'u') return usulOgeSorusu(id.slice(2));
  if (p === 'g') return gocurmeOgeSorusu(id);
  return batiOgeSorusu(id);
}

// =====================================================
// TUR MOTORU
// =====================================================
let TUR = null;
const JOKERLER = [
  { id: 'yarim', ikon: '✂️', ad: '%50', maliyet: 2 },
  { id: 'ipucu', ikon: '💡', ad: 'İpucu', maliyet: 1 },
  { id: 'atla', ikon: '⏭️', ad: 'Atla', maliyet: 2 },
  { id: 'kalp', ikon: '❤️', ad: '+Kalp', maliyet: 3 }
];
const JOKER_LIMIT = 3;

// o: { tip, baslik, sorular, kalp (0: kalpsiz), joker, sure (sn/soru, 0: yok), kayit (Leitner'a yaz), ipucuAcik, bitince(sonuc) }
function turBaslat(o) {
  if (!o.sorular || !o.sorular.length) { toast('Bu turda soru yok'); return; }
  if (o.tip !== 'deneme' && o.tip !== 'rehber' && o.tip !== 'ortak') seriGuncelle();
  TUR = Object.assign({ k: 0, hata: 0, dogru: 0, atlanan: 0, ceza: 0, jokerSay: 0, jokerKullandi: false, yeniKart: [], q: null, zaman: null }, o);
  TUR.kalpVar = (o.kalp || 0) > 0;
  TUR.kalpMax = o.kalp || 0;
  TUR.kalpKalan = o.kalp || 0;
  // 3.1: sesli soru varsa gitar seslerini dokunuşun içinde yüklemeye başla (telefonlarda ses izni)
  if (typeof kulakHazirla === 'function' && DURUM.ayar.kulak !== false && (o.sonsuz || o.sorular.some(function (v) { return v && v.dinle && v.dinle.kulak; }))) kulakHazirla();
  ekranAc('ekranOyun');
  soruGoster();
}

function kalpYaz() {
  const k = $('oyKalp');
  if (TUR.kalpVar) {
    const kalan = Math.max(0, TUR.kalpKalan), tam = Math.floor(kalan), yarim = kalan - tam >= 0.5 ? 1 : 0;
    k.textContent = '❤️'.repeat(tam) + (yarim ? '💔' : '') + '🤍'.repeat(Math.max(0, TUR.kalpMax - tam - yarim)) + (TUR.sonsuz ? (TUR.sonsuz === 'dikte' ? '  ♾️ ' + TUR.dogru : '  ' + sonsuzKat(TUR.dogru).ad + ' · ' + (TUR.puan || 0)) : '');
  }
  else k.textContent = TUR.etiket || '';
}

function jokerYaz() {
  const kap = $('oyJoker');
  if (!TUR || !TUR.joker) { kap.hidden = true; return; }
  kap.hidden = false;
  bosalt(kap);
  kap.appendChild(h('div', { class: 'cuzdan' }, '⭐ ' + cuzdan(), h('small', null, (JOKER_LIMIT - TUR.jokerSay) + ' hak')));
  JOKERLER.forEach(function (j) {
    const q = TUR.q;
    let kapali = !q || q.cevaplandi || TUR.jokerSay >= JOKER_LIMIT || cuzdan() < j.maliyet || (q.jk && q.jk[j.id]);
    if (j.id === 'kalp') kapali = kapali || !TUR.kalpVar || TUR.kalpKalan >= TUR.kalpMax;
    if (j.id === 'yarim') kapali = kapali || q.veri.tip !== 'secim' || q.butonlar.length < 3;
    if (j.id === 'ipucu') kapali = kapali || !q.veri.ipucu || TUR.ipucuAcik;
    kap.appendChild(h('button', { class: 'jk', type: 'button', disabled: kapali, onclick: function () { jokerKullan(j); } },
      j.ikon + ' ' + j.ad, h('small', null, '⭐ ' + j.maliyet)));
  });
}

function jokerKullan(j) {
  const q = TUR && TUR.q;
  if (!q || q.cevaplandi || TUR.jokerSay >= JOKER_LIMIT || cuzdan() < j.maliyet) return;
  DURUM.harcanan = (DURUM.harcanan || 0) + j.maliyet;
  TUR.jokerSay++; TUR.jokerKullandi = true;
  q.jk = q.jk || {}; q.jk[j.id] = true;
  if (j.id === 'yarim') {
    q.joker = true;
    karistir(q.butonlar.filter(function (x) { return !x.dogru && !x.b.disabled; })).slice(0, 2).forEach(function (x) { x.b.disabled = true; x.b.classList.add('elendi'); });
  } else if (j.id === 'ipucu') {
    q.joker = true;
    ipucuGoster(q.veri.ipucu);
  } else if (j.id === 'kalp') {
    TUR.kalpKalan = Math.min(TUR.kalpMax, TUR.kalpKalan + 1); kalpYaz();
  } else if (j.id === 'atla') {
    ogeCevap(q.veri.oge, false);
    TUR.atlanan++;
    kaydet();
    toast('⏭️ Soru atlandı · tekrar listene eklendi');
    sonrakiSoru();
    return;
  }
  kaydet();
  jokerYaz();
  ustBilgiYaz();
}

function ipucuGoster(m) {
  const k = $('oyIpucu');
  if (!m) return;
  k.innerHTML = '💡 ' + kacis(m);
  k.hidden = false;
}

function soruGoster() {
  clearInterval(TUR.zaman);
  if (typeof ritimDur === 'function') ritimDur();
  if (typeof kulakDur === 'function') kulakDur();
  const veri = TUR.sorular[TUR.k];
  const q = TUR.q = { veri: veri, butonlar: [], cevaplandi: false, ipucuNo: 1 };
  $('oyDolgu').style.width = (TUR.sonsuz ? (TUR.dogru % 10) * 10 : TUR.k / TUR.sorular.length * 100) + '%';
  kalpYaz();
  $('oyGeri').classList.remove('acik', 'dogru', 'yanlis');
  const g = bosalt($('oyGovde'));
  g.scrollTop = 0;

  // Soru gövdesi
  const s = veri.soru || {};
  const kutu = h('div', { class: 'soruKutu' + (s.porte ? ' porteli' : '') + (s.glif ? ' glifli' : '') });
  if (s.metin) kutu.appendChild(h('div', { class: 'soruMetin' + (s.kucuk ? ' kucuk' : '') }, s.metin));
  if (s.glif) kutu.appendChild(h('div', { class: 'soruGlif bravura' }, s.glif));
  if (s.porte) kutu.appendChild(porteSVG(s.porte));
  if (s.svg) kutu.appendChild(h('div', { class: 'ritimKutu' }, s.svg()));
  if (veri.dinle) kutu.appendChild(dinleDugmesi(veri.dinle, true));
  else if (veri.dinleSecenek && typeof kulakSecenekDugmesi === 'function' && !TUR.sonsuz && DURUM.ayar.kulak !== false) kutu.appendChild(kulakSecenekDugmesi(veri.dinleSecenek));   // 3.1.1
  g.appendChild(kutu);
  if (veri.alt) g.appendChild(h('div', { class: 'soruAlt' }, veri.alt));

  // Ben kimim ipuçları
  if (veri.ipuclari) {
    const liste = h('ol', { class: 'ipucuListe' });
    const ekleIpucu = function () { liste.appendChild(h('li', null, veri.ipuclari[q.ipucuNo - 1])); };
    ekleIpucu();
    const btn = h('button', { class: 'dugme ince', type: 'button' }, '');
    const yaz = function () {
      const kalan = veri.ipuclari.length - q.ipucuNo;
      btn.textContent = kalan > 0 ? '🔍 Bir ipucu daha (' + kalan + ' kaldı)' : 'Başka ipucu yok';
      btn.disabled = kalan <= 0 || q.cevaplandi;
    };
    btn.onclick = function () {
      if (q.ipucuNo >= veri.ipuclari.length || q.cevaplandi) return;
      q.ipucuNo++;
      if (q.ipucuNo > 2) TUR.ceza += 0.5;
      ekleIpucu(); yaz();
    };
    yaz();
    q.ipucuBtn = btn;
    g.appendChild(liste);
    g.appendChild(btn);
  }

  // Formülü göster: göçürme ve dizi yazma sorularında formül başlıkta verilmez; isteyen yarım kalp (kalpsiz turda yarım hata) karşılığı açar
  if (veri.formul) {
    const fb = h('button', { class: 'dugme ince formulDugme', type: 'button' }, '🔑 Formülü göster' + (TUR.kalpVar ? ' (½ ❤️)' : ' (½ hata)'));
    fb.disabled = TUR.kalpVar && TUR.kalpKalan <= 0.5;
    fb.onclick = function () {
      if (q.cevaplandi || q.formulAcik) return;
      if (TUR.kalpVar) { if (TUR.kalpKalan <= 0.5) return; TUR.kalpKalan -= 0.5; }
      TUR.hata += 0.5; q.formulAcik = true;
      kalpYaz();
      fb.replaceWith(h('div', { class: 'formulAcik' }, 'Formül: ', h('b', null, veri.formul)));
    };
    g.appendChild(fb);
  }
  const ip = h('div', { id: 'oyIpucu', class: 'ipucu', hidden: true });
  g.appendChild(ip);
  if (TUR.ipucuAcik && veri.ipucu) ipucuGoster(veri.ipucu);

  const alan = h('div', { class: 'cevapAlani' });
  g.appendChild(alan);
  const kontrol = $('oyKontrol');
  kontrol.hidden = true;
  kontrol.disabled = false;   // 3.2.1: önceki sorudan (sınıflandır/diz) kilitli kalmasın

  if (veri.tip === 'secim') {
    secimCiz(alan, veri, q);
    if (TUR.k === 0) alan.appendChild(h('p', { class: 'tusIpucu', html: 'Klavye: <kbd>1</kbd>–<kbd>' + Math.min(9, q.butonlar.length) + '</kbd> seç · <kbd>Enter</kbd> devam · <kbd>Esc</kbd> çık' }));
  }
  else if (veri.tip === 'yer') yerCiz(alan, veri, q, kontrol);
  else if (veri.tip === 'dizi') diziCiz(alan, veri, q, kontrol);
  else if (veri.tip === 'vur') vurCiz(alan, veri, q);
  else if (veri.tip === 'sinif') sinifCiz(alan, veri, q, kontrol);
  else if (veri.tip === 'acik') acikCiz(alan, veri, q, kontrol);   // 3.2: yazılıya hazırlık (yazili.js)

  jokerYaz();
  ustBilgiYaz();

  const sk = TUR.sonsuz && TUR.sonsuz !== 'dikte' ? sonsuzKat(TUR.dogru) : null;
  if (sk && sk.sure && veri.tip !== 'vur' && !veri.dinle) {
    // Usta ve Pîr katlarında cezasız süre: dolunca kalp gitmez, yalnız bu soru puana sayılmaz
    const sn = veri.tip === 'secim' ? sk.sure : sk.sure + 15, bas = Date.now(), cubuk = $('oySure');
    cubuk.hidden = false;
    TUR.zaman = setInterval(function () {
      const kalan = sn - (Date.now() - bas) / 1000;
      cubuk.style.width = Math.max(0, kalan / sn * 100) + '%';
      if (kalan <= 0) { clearInterval(TUR.zaman); q.sureDoldu = true; }
    }, 100);
  } else if (TUR.sure && veri.tip !== 'vur' && !veri.dinle) {
    const sn = (veri.tip === 'secim' ? TUR.sure : TUR.sure + 10);
    const bas = Date.now();
    const cubuk = $('oySure');
    cubuk.hidden = false;
    TUR.zaman = setInterval(function () {
      const kalan = sn - (Date.now() - bas) / 1000;
      cubuk.style.width = Math.max(0, kalan / sn * 100) + '%';
      if (kalan <= 0) { clearInterval(TUR.zaman); if (!q.cevaplandi) cevapla(false, '⏰ Süre doldu'); }
    }, 100);
  } else $('oySure').hidden = true;
}

function secimCiz(alan, veri, q) {
  const siklar = veri.sirali ? veri.siklar.slice() : karistir(veri.siklar);   // 3.1: "1. çalım, 2. çalım" gibi şıklar sırasını korur
  const porteli = siklar.some(function (x) { return x.porte || x.svg; });
  const genis = siklar.some(function (x) { return x.genis; });
  const glifli = siklar.some(function (x) { return x.glif; });
  const kisa = !veri.liste && !porteli && !glifli && siklar.every(function (x) { return String(x.metin).length <= 14; }) && siklar.length >= 4;
  const kap = h('div', { class: 'siklar ' + (porteli ? (genis ? 'genisPortler' : 'portler') : glifli ? 'glifler' : kisa ? 'kisaAdlar' : 'adlar') });
  const dogrular = [].concat(veri.dogru);
  siklar.forEach(function (x) {
    const b = h('button', { class: 'sik', type: 'button' });
    if (x.porte) b.appendChild(porteSVG(x.porte));
    else if (x.svg) b.appendChild(x.svg());
    else if (x.glif) b.appendChild(h('span', { class: 'bravura' }, x.glif));
    else b.textContent = x.metin;
    const kayit = { b: b, x: x, dogru: dogrular.indexOf(x.key) >= 0 };
    b.onclick = function () {
      if (q.cevaplandi) return;
      q.secilen = x.key;
      q.butonlar.forEach(function (y) { y.b.disabled = true; });
      if (kayit.dogru) b.classList.add('dogru');
      else {
        b.classList.add('yanlis');
        q.butonlar.forEach(function (y) { if (y.dogru) y.b.classList.add('dogru'); });
      }
      cevapla(kayit.dogru);
    };
    q.butonlar.push(kayit);
    kap.appendChild(b);
  });
  alan.appendChild(kap);
}

function yerCiz(alan, veri, q, kontrol) {
  const y = veri.yer;
  let bil = null;
  bil = yerlestirici({
    slotlar: y.slotlar, palet: y.palet, smin: y.smin, smax: y.smax, etiketler: y.etiketler,
    degisince: function () { kontrol.disabled = !bil || !bil.tamamMi(); }
  });
  q.yer = bil;
  alan.appendChild(bil.el);
  kontrol.hidden = false;
  kontrol.disabled = !bil.tamamMi();
  kontrol.textContent = 'Kontrol et';
  kontrol.onclick = function () {
    if (q.cevaplandi || !bil.tamamMi()) return;
    const deger = bil.deger();
    const ayni = function (a, b) { return y.sadeceAdim ? adim(a) === adim(b) : notaEsit(a, b); };
    const esit = function (a, b) { return a.length === b.length && a.every(function (n, i) { return ayni(n, b[i]); }); };
    const kabul = y.kabul || [y.beklenen];
    const dogru = kabul.some(function (k) { return esit(deger, k); });
    // Kısmi puan: elle doldurulan nota sayısı 2+ ise ve yanlışlar yarıdan fazla değilse 1 düzeltme hakkı
    const serbest = y.slotlar.map(function (sl) { return !sl.sabit; });
    const yanlisSay = function (k) { return deger.filter(function (n, i) { return serbest[i] && !ayni(n, k[i]); }).length; };
    const enYakin = kabul.slice().sort(function (a, b) { return yanlisSay(a) - yanlisSay(b); })[0];
    const serbestSay = serbest.filter(Boolean).length, ys = yanlisSay(enYakin);
    if (!dogru && !q.duzeltme && kismiAcik() && serbestSay >= 2 && ys * 2 <= serbestSay) {
      q.duzeltme = true; q.kismiHedef = enYakin;
      bil.isaretle(deger.map(function (n, i) { return serbest[i] && !ayni(n, enYakin[i]); }));
      duzeltmeNotu(ys);
      kontrol.textContent = 'Düzelt ve kontrol et';
      return;
    }
    const goster = kabul.find(function (k) { return esit(deger, k); }) || (q.duzeltme ? q.kismiHedef : y.beklenen);
    bil.kilitle(y.sadeceAdim ? deger.map(function (n, i) { return adim(n) === adim(goster[i]) ? n : goster[i]; }) : goster);
    kontrol.hidden = true;
    const es = dogru || y.sadeceAdim ? null : esSesNotu(deger, y);
    cevapla(dogru ? (q.duzeltme ? 'yarim' : true) : false, es ? es.baslik : null, dogru ? null : porteSVG({ notalar: y.beklenen, aralik: 40, etiketler: y.etiketler }), es ? es.metin : null);
  };
}
// Kısmi puan kalpli turlarda (seviye, final, Sonsuz Meşk) geçerli; Ustalık gibi kalpsiz turlarda değil
function kismiAcik() { return TUR && TUR.kalpVar; }
function duzeltmeNotu(ys) {
  const k = $('oyIpucu');
  k.innerHTML = '✏️ <b>' + ys + '</b> ' + 'yanlış var: kırmızıları düzelt. Bir hakkın var; düzeltirsen yarım kalp gider.';
  k.hidden = false;
  k.classList.add('duzeltNot');
}
// Yazılan sesler doğru ama bazıları aynı sesin öteki yazımıysa (ör. Re k.müc. diyezi = Mi bakiye bemolü): açıkla
function esSesNotu(deger, y) {
  const b = y.beklenen;
  if (!b || deger.length !== b.length) return null;
  const farkli = [];
  for (let i = 0; i < b.length; i++) {
    if (komaOf(deger[i]) !== komaOf(b[i])) return null;      // en az bir ses gerçekten yanlış
    if (!notaEsit(deger[i], b[i])) farkli.push(i);
  }
  if (!farkli.length) return null;
  const L = farkli.map(function (i) {
    const p = KOMADAN_PERDE[komaOf(b[i])];
    return 'Yazdığın <b>' + notaKisa(deger[i]) + '</b> ile <b>' + notaKisa(b[i]) + '</b> aynı ses' + (p ? ' (' + p.ad + ')' : '') + '.';
  });
  let neden;
  if (y.harfSirali) {
    const i = farkli[0];
    const onceki = HARF_AD[b[i - 1] ? b[i - 1].h : b[i].h];
    neden = 'Ama göçürmede her ses <b>bir sonraki harfe</b> yazılır: ' + onceki + ayrilmaEki(onceki) + ' sonra ' + HARF_AD[b[i].h] + ' gelir. Böylece dizinin aralıkları harflerden de okunur.';
  } else {
    neden = 'Bu soruda istenen yazım: <b>' + farkli.map(function (i) { return notaKisa(b[i]); }).join(', ') + '</b>.';
  }
  return { baslik: '🎵 Ses doğru, yazım farklı', metin: '<p>' + L.join(' ') + ' ' + neden + '</p>' };
}

function diziCiz(alan, veri, q, kontrol) {
  const d = veri.dizi;
  const secilen = [];
  const slotlar = h('div', { class: 'diziSlotlar' + (d.genis ? ' genis' : '') });
  const havuz = h('div', { class: 'diziHavuz' + (d.genis ? ' genis' : '') });
  alan.appendChild(slotlar);
  alan.appendChild(havuz);
  // Açık uçlu dizide (d.acik) kutu sayısı gösterilmez: kaç taş seçileceği de sorunun parçası
  const enCok = d.acik ? (d.enCok || d.havuz.length) : d.uzunluk;
  const dolu = function () { return secilen.filter(Boolean).length; };
  const tamamMi = function () { return d.acik ? secilen.length >= 1 : dolu() === d.uzunluk; };
  const sonuc = [];   // kontrol sonrası kutu renkleri
  const icerik = function (x) { return x.svg ? x.svg() : x.metin; };
  function ciz() {
    bosalt(slotlar);
    let kutu = d.acik ? secilen.length + (q.cevaplandi || secilen.length >= enCok ? 0 : 1) : d.uzunluk;
    if (d.acik && q.cevaplandi) kutu = Math.max(secilen.length, d.beklenen.length);   // eksik kalanları da göster
    for (let i = 0; i < kutu; i++) {
      if (d.acik && q.cevaplandi && i >= secilen.length) {
        const eks = d.havuz.find(function (y) { return y.key === d.beklenen[i]; });
        slotlar.appendChild(h('button', { class: 'diziSlot yanlis eksikSlot', type: 'button', title: 'Eksik' }, eks ? icerik(eks) : '?'));
        continue;
      }
      const x = secilen[i];
      const s = h('button', { class: 'diziSlot' + (x ? ' dolu' : '') + (d.svgli ? ' svgli' : '') + (d.acik && !x ? ' acikSlot' : '') + (sonuc[i] ? ' ' + sonuc[i] : ''), type: 'button' }, x ? icerik(x) : (d.acik ? '…' : String(i + 1)));
      s.onclick = function () {
        if (q.cevaplandi || !x) return;
        if (q.duzeltme) { if (sonuc[i] === 'dogru') return; secilen[i] = null; sonuc[i] = ''; }
        else secilen.splice(i, 1);
        ciz();
      };
      slotlar.appendChild(s);
    }
    bosalt(havuz);
    d.havuz.forEach(function (x) {
      const kullanildi = !d.tekrarli && secilen.indexOf(x) >= 0;
      const b = h('button', { class: 'diziTas' + (d.svgli ? ' svgli' : ''), type: 'button', disabled: kullanildi || q.cevaplandi || dolu() >= enCok }, icerik(x));
      b.onclick = function () {
        if (dolu() >= enCok) return;
        const bos = secilen.indexOf(null);
        if (bos >= 0) { secilen[bos] = x; sonuc[bos] = ''; } else secilen.push(x);
        ciz();
      };
      havuz.appendChild(b);
    });
    kontrol.disabled = !tamamMi();
  }
  ciz();
  kontrol.hidden = false;
  kontrol.textContent = 'Kontrol et';
  kontrol.onclick = function () {
    if (q.cevaplandi || !tamamMi()) return;
    const keys = secilen.map(function (x) { return x.key; });
    const kabul = d.kabul || [d.beklenen];
    const dogru = d.dogruMu ? d.dogruMu(keys) : kabul.some(function (k) { return k.join('|') === keys.join('|'); });
    // Kısmi puan: sabit uzunluklu dizide (2+ taş) yanlışlar yarıdan fazla değilse 1 düzeltme hakkı
    if (!dogru && !q.duzeltme && kismiAcik() && !d.acik && !d.dogruMu && d.uzunluk >= 2) {
      const hedef = kabul.slice().sort(function (a, b) {
        const ya = keys.filter(function (k, i) { return a[i] !== k; }).length, yb = keys.filter(function (k, i) { return b[i] !== k; }).length;
        return ya - yb;
      })[0];
      const yanlis = keys.map(function (k, i) { return hedef[i] !== k; });
      const ys = yanlis.filter(Boolean).length;
      if (ys * 2 <= d.uzunluk) {
        q.duzeltme = true;
        yanlis.forEach(function (y, i) { if (y) { secilen[i] = null; sonuc[i] = 'yanlis'; } else sonuc[i] = 'dogru'; });
        duzeltmeNotu(ys);
        kontrol.textContent = 'Düzelt ve kontrol et';
        ciz();
        return;
      }
    }
    keys.forEach(function (key, i) { sonuc[i] = dogru || kabul.some(function (k) { return k[i] === key; }) ? 'dogru' : 'yanlis'; });
    kontrol.hidden = true;
    q.cevaplandi = true;
    ciz();
    cevapla(dogru ? (q.duzeltme ? 'yarim' : true) : false, null, !dogru && veri.dogruGorsel ? veri.dogruGorsel() : null);
  };
}

// Sınıflandır / eşleştir: her satırdaki öğe bir kutuya atanır. veri.sinif = { kutular: [{key, metin}], ogeler: [{key, metin|glif, dogru}] }
function sinifCiz(alan, veri, q, kontrol) {
  const c = veri.sinif, secim = {}, sonuc = {};
  const kap = h('div', { class: 'sinifListe' });
  alan.appendChild(kap);
  function ciz() {
    bosalt(kap);
    c.ogeler.forEach(function (o) {
      const satir = h('div', { class: 'sinifSatir' + (sonuc[o.key] ? ' ' + sonuc[o.key] : '') },
        h('div', { class: 'sinifOge' + (o.glif ? ' bravura' : '') }, o.glif || o.metin));
      const dug = h('div', { class: 'sinifKutular' + (c.kutular.length > 2 ? ' cok' : '') });
      c.kutular.forEach(function (k) {
        const b = h('button', { class: 'sinifKutu' + (secim[o.key] === k.key ? ' secili' : ''), type: 'button', disabled: q.cevaplandi || sonuc[o.key] === 'dogru' }, k.metin);
        b.onclick = function () { secim[o.key] = k.key; if (sonuc[o.key] === 'yanlis') sonuc[o.key] = ''; ciz(); };
        dug.appendChild(b);
      });
      satir.appendChild(dug);
      kap.appendChild(satir);
    });
    kontrol.disabled = !c.ogeler.every(function (o) { return secim[o.key]; });
  }
  ciz();
  kontrol.hidden = false;
  kontrol.textContent = 'Kontrol et';
  kontrol.onclick = function () {
    if (q.cevaplandi) return;
    const yanlis = c.ogeler.filter(function (o) { return secim[o.key] !== o.dogru; });
    if (yanlis.length && !q.duzeltme && kismiAcik() && c.ogeler.length >= 2 && yanlis.length * 2 <= c.ogeler.length) {
      q.duzeltme = true;
      c.ogeler.forEach(function (o) { sonuc[o.key] = secim[o.key] === o.dogru ? 'dogru' : 'yanlis'; });
      duzeltmeNotu(yanlis.length);
      kontrol.textContent = 'Düzelt ve kontrol et';
      ciz();
      return;
    }
    c.ogeler.forEach(function (o) { sonuc[o.key] = secim[o.key] === o.dogru ? 'dogru' : 'yanlis'; });
    q.cevaplandi = true;
    kontrol.hidden = true;
    ciz();
    if (yanlis.length) {
      kap.querySelectorAll('.sinifSatir.yanlis').forEach(function (el, i) {
        const o = yanlis[i], k = c.kutular.find(function (x) { return x.key === o.dogru; });
        el.appendChild(h('div', { class: 'sinifDogru' }, '→ ' + (k ? k.metin : '')));
      });
    }
    cevapla(yanlis.length ? false : (q.duzeltme ? 'yarim' : true));
  };
}

function ustBilgiYaz() { if (typeof ustYaz === 'function') ustYaz(); }

const OVGU = ['Harika!', 'Aferin!', 'Çok iyi!', 'Tam isabet!', 'Maşallah!', 'Bravo!', 'Süper!'];
function cevapla(dogru, ozelMesaj, dogruGorsel, ekAciklama) {
  const q = TUR.q;
  if (q.cevaplandi && q.sonucVerildi) return;
  q.cevaplandi = true; q.sonucVerildi = true;
  clearInterval(TUR.zaman);
  $('oyKontrol').hidden = true;
  if (q.ipucuBtn) q.ipucuBtn.disabled = true;
  const veri = q.veri;
  const yarim = dogru === 'yarim';
  if (yarim) {
    // Düzeltilerek doğru: yarım kalp gider, doğru sayılır, tekrar listesine yazılmaz
    TUR.dogru++; TUR.hata += 0.5; TUR.yarim = (TUR.yarim || 0) + 1;
    if (TUR.kalpVar) TUR.kalpKalan -= 0.5;
    sonsuzDogru(q, true);
  } else if (dogru) {
    TUR.dogru++;
    sonsuzDogru(q, false);
    if (TUR.kayit && veri.oge && !q.joker) {
      ogeCevap(veri.oge, true);
      if (!DURUM.kart[veri.oge] && 'pkdm'.indexOf(veri.oge[0]) >= 0) { DURUM.kart[veri.oge] = 1; TUR.yeniKart.push(ogeAdi(veri.oge)); }
    }
  } else {
    TUR.hata++;
    if (TUR.kalpVar) TUR.kalpKalan--;
    if (TUR.yanlislar) TUR.yanlislar.push(veri);
    if (TUR.kayit && veri.oge) ogeCevap(veri.oge, false);
    tekrarSorusuEkle(veri, q);
  }
  if (TUR.tip !== 'deneme') kaydet();
  kalpYaz();
  jokerYaz();

  const sh = $('oyGeri');
  sh.classList.add('acik', dogru ? 'dogru' : 'yanlis');
  const ic = bosalt($('oyGeriIc'));
  ic.appendChild(h('div', { class: 'geriBaslik' },
    h('span', { class: 'geriMaskot', html: bulbulSVG(dogru ? 'mutlu' : 'uzgun') }),
    h('span', null, ozelMesaj || (yarim ? 'Düzelttin! · yarım kalp' : dogru ? rastgele(OVGU) : 'Doğrusu: ' + (veri.dogruMetin || '')))));
  const kartVar = !dogru && yanlisKarti(ic, veri, q);
  if (ekAciklama) ic.appendChild(h('div', { class: 'geriAciklama esSes', html: ekAciklama }));
  if (dogruGorsel && !kartVar) ic.appendChild(h('div', { class: 'geriPorte' }, dogruGorsel));   // kart aynı bilgiyi gösteriyor
  if (veri.geriEk) { try { const ek = veri.geriEk(q, dogru); if (ek) ic.appendChild(ek); } catch (e) { console.warn(e); } }   // 3.1: sesli sorularda dinle düğmeleri
  if (veri.aciklama) {
    const batiMi = (TUR.seviye && TUR.seviye.dal === 'bati') || (veri.oge && veri.oge.indexOf('b:') === 0);
    const ac = h('div', { class: 'geriAciklama', html: veri.aciklama });
    ic.appendChild(batiMi || TUR.tip === 'ortak' ? ac : terimBagla(ac));
  }
  panelSigdir(sh, ic);
  const devam = $('oyDevam');
  devam.textContent = 'Devam';
  devam.onclick = devamEt;
  q.cevapZamani = Date.now();
  sh.scrollTop = 0;
  setTimeout(function () { try { devam.focus({ preventScroll: true }); } catch (e) {} }, 50);

  // Doğru cevapta otomatik geçiş (Ayarlar'dan kapatılabilir).
  // Şık sorusu: kısa. Porteye yazma, dizme ve hesaplı açıklamalar: açıklamanın uzunluğuna göre birkaç saniye.
  if (dogru && !yarim && DURUM.ayar.otoGec !== false && !veri.otoYok) {
    const acik = veri.aciklama || '';
    const hesapSatir = (acik.match(/<li/g) || []).length;
    const uzun = veri.tip !== 'secim' || acik.indexOf('class="hesap') >= 0;
    otoBaslat(uzun ? Math.min(9000, 3500 + hesapSatir * 700) : 1200);
  }
}

// Seviyede yanlış yapılan öğe, birkaç soru sonra bir kez daha sorulur (turda en çok 2 kez)
function tekrarSorusuEkle(veri, q) {
  if (!TUR || (TUR.tip !== 'seviye' && TUR.tip !== 'yer') || !veri.oge || veri.tekrarSoru) return;
  if ((TUR.tekrarEklenen || 0) >= 2 || (TUR.kalpVar && TUR.kalpKalan <= 0)) return;
  let yeni = null;
  try { yeni = ogeSorusu(veri.oge); } catch (e) { return; }
  if (!yeni) return;
  yeni.tekrarSoru = true;
  TUR.sorular.splice(Math.min(TUR.sorular.length, TUR.k + 3), 0, yeni);
  TUR.tekrarEklenen = (TUR.tekrarEklenen || 0) + 1;
  q.tekrarEklendi = true;
}

// Panel ekrana sığmıyorsa uzun parçaları katla: önce adım adım hesap listeleri, sonra soluk ek açıklamalar
function panelSigdir(sh, ic) {
  const tasiyor = function () { return sh.scrollHeight > sh.clientHeight + 2; };
  if (!tasiyor()) return;
  ic.querySelectorAll('ol.hesap').forEach(function (ol) {
    if (!tasiyor()) return;
    const d = h('details', { class: 'hesapKatla' }, h('summary', null, 'Adım adım hesap (' + ol.children.length + ' adım)'));
    ol.parentNode.insertBefore(d, ol); d.appendChild(ol);
  });
  if (!tasiyor()) return;
  const gp = ic.querySelector('.geriPorte');
  if (gp) { const d = h('details', { class: 'hesapKatla' }, h('summary', null, 'Doğru yazımı göster')); gp.parentNode.insertBefore(d, gp); d.appendChild(gp); }
}

// ---------- Otomatik geçiş ----------
let OTO_ZAMAN = null;
function otoBaslat(ms) {
  otoIptal();
  const d = $('oyDevam');
  d.style.setProperty('--sure', ms + 'ms');
  void d.offsetWidth;            // animasyonu baştan başlat
  d.classList.add('dolan');
  OTO_ZAMAN = setTimeout(function () {
    OTO_ZAMAN = null;
    if (!TUR || modalAcikMi()) { otoIptal(); return; }   // çıkış penceresi açıksa bekle
    devamEt();
  }, ms);
}
function otoIptal() {
  if (OTO_ZAMAN) { clearTimeout(OTO_ZAMAN); OTO_ZAMAN = null; }
  const d = $('oyDevam');
  if (d) d.classList.remove('dolan');
}
// Tek kapı: düğme, Enter, ekrana dokunma ve zamanlayıcı buradan geçer; iki kez geçmez
function devamEt() {
  if (!TUR || !$('oyGeri').classList.contains('acik')) return;
  otoIptal();
  sonrakiSoru();
}
// Bildirim açıkken ekranın herhangi bir yerine dokunmak = Devam
function ekranaDokunKur() {
  const ekran = $('ekranOyun');
  // Terim balonu açıkken yapılan dokunuş yalnızca balonu kapatsın, soruyu geçirmesin.
  // (window yakalama aşaması, balonu kapatan document dinleyicisinden önce çalışır.)
  let balonKapatiyor = false;
  window.addEventListener('pointerdown', function () { balonKapatiyor = !!document.querySelector('.terimBalon'); }, true);
  ekran.addEventListener('click', function (e) {
    const geri = $('oyGeri');
    if (!TUR || !TUR.q || !geri.classList.contains('acik')) return;
    const t = e.target;
    if (t.closest('.terim')) { otoIptal(); return; }              // terim okunuyor: bekle
    if (balonKapatiyor) { balonKapatiyor = false; return; }
    if (Date.now() - (TUR.q.cevapZamani || 0) < 400) return;     // cevabı veren dokunuş sayılmasın
    if (t.closest('a, .terimBalon, .oyUst, #oyJoker, #oyDevam, #oyKontrol, .kulakDugmeler, .kulakGeri')) return;
    devamEt();
  });
  // Açıklamayı kaydıran öğrenci okuyordur: otomatik geçişi durdur
  $('oyGeri').addEventListener('scroll', function () { if (OTO_ZAMAN && Date.now() - (TUR && TUR.q ? TUR.q.cevapZamani : 0) > 300) otoIptal(); }, { passive: true });
}

function sonrakiSoru() {
  if (!TUR) return;
  otoIptal();
  $('oyGeri').classList.remove('acik');
  if (TUR.kalpVar && TUR.kalpKalan <= 0) return turBitir(false);
  if (TUR.sonsuz && TUR.k + 1 >= TUR.sorular.length) TUR.sorular = TUR.sorular.concat(sonsuzSorulari(TUR.sonsuz, TUR.dogru, 5));
  if (TUR.k + 1 >= TUR.sorular.length) return turBitir(true);
  TUR.k++;
  soruGoster();
}

function turBitir(basari) {
  clearInterval(TUR.zaman);
  $('oyDolgu').style.width = '100%';
  const t = TUR;
  const sonuc = { basari: basari, hata: t.hata, dogru: t.dogru, toplam: t.sorular.length - t.atlanan, joker: t.jokerKullandi, ceza: t.ceza, yeniKart: t.yeniKart, tur: t, yarim: t.yarim || 0, hataTam: t.hata - 0.5 * (t.yarim || 0) };
  sonuc.yildiz = !basari ? 0 : Math.max(1, 3 - Math.floor(t.hata + t.ceza));
  if (sonuc.basari && (t.jokerKullandi || t.ipuculuTur)) sonuc.yildiz = Math.min(2, sonuc.yildiz);
  if (t.tip !== 'deneme') kaydet();
  if (t.bitince) t.bitince(sonuc);
  if (SERI_MESAJ) { const m = SERI_MESAJ; SERI_MESAJ = null; setTimeout(function () { toast(m, 2600); }, 400); }
}

function turdanCik(sor) {
  if (!TUR) { anaEkranaDon(); return; }
  if (!sor) { clearInterval(TUR.zaman); otoIptal(); if (typeof ritimDur === 'function') ritimDur(); if (typeof kulakDur === 'function') kulakDur(); TUR = null; modalKapat(); anaEkranaDon(); return; }
  modalAc(h('div', null,
    h('h2', null, 'Çıkmak istiyor musun?'),
    h('p', null, 'Bu turdaki ilerleme kaybolur.' + (TUR && TUR.jokerKullandi ? ' Harcadığın yıldızlar iade edilmez.' : '')),
    dugme('Devam et', modalKapat, 'gri'),
    dugme('Çık', function () { turdanCik(false); }, 'kirmizi')));
}

// =====================================================
// SEVİYE / ÖZEL TUR BAŞLATICILAR
// =====================================================
let SON_UNITE = null;   // quiz bitince Dallar'da vurgulanacak ünite
function yolaDonMetni() { return YOL_FILTRE === null ? 'Meşk Yolu’na dön' : 'Dallar’a dön'; }
// Bir sorunun karar sayısı: şık sorusu 1, porteye yazma ve dizmede doldurulan her kutu 1
function kararSayisi(v) {
  if (!v) return 0;
  if (v.tip === 'yer') return v.yer.slotlar.filter(function (sl) { return !sl.sabit; }).length || 1;
  if (v.tip === 'sinif') return v.sinif.ogeler.length;
  if (v.tip === 'dizi') return v.dizi.acik ? (v.dizi.beklenen || []).length || 1 : v.dizi.uzunluk || 1;
  return 1;
}
// Kalp sayısı seviyedeki toplam karara göre: 20'ye kadar 3, 40'a kadar 4, üstü 5
function kalpSayisi(sorular) {
  const k = sorular.reduce(function (t, v) { return t + kararSayisi(v); }, 0);
  return k <= 20 ? 3 : k <= 40 ? 4 : 5;
}
function kalpTahmini(s) {
  if (s._kalp) return s._kalp;
  try { s._kalp = kalpSayisi(s.uret(s.soruSay)); } catch (e) { s._kalp = 3; }
  return s._kalp;
}
function seviyeBaslat(s, ek) {
  SON_UNITE = s.unite.id;
  if (s.tip === 'sonsuz') { sonsuzBaslat(s.unite.sonsuzDal || s.dal); return; }
  const q = s.uret(s.soruSay);
  turBaslat(Object.assign({
    tip: s.tip, seviye: s, sorular: q, kalp: kalpTahmini(s), joker: true, kayit: true, sure: s.sure || 0,
    bitince: function (r) { seviyeSonucu(s, r); }
  }, ek || {}));
}

function seviyeSonucu(s, r) {
  const oncekiUnvan = unvan().ad;
  const eski = yildizOf(s.id);
  const uniteOnce = uniteBitti(s.unite);
  if (r.basari) { DURUM.yildiz[s.id] = Math.max(eski, r.yildiz); if (DURUM.kalis) delete DURUM.kalis[s.id]; }
  kaydet();
  const yeniUnvan = unvan().ad;
  const L = DAL_SEVIYELERI[s.dal];
  const sonraki = L[L.indexOf(s) + 1];
  const icerik = [];
  if (!r.basari) {
    // Başarısızlıkta yönlendirme: bir önceki seviye ya da ders; aynı seviyede 2. kalışta ücretsiz ipuçlu deneme
    DURUM.kalis = DURUM.kalis || {};
    const kalis = DURUM.kalis[s.id] = (DURUM.kalis[s.id] || 0) + 1;
    kaydet();
    const onceki = L[L.indexOf(s) - 1];
    const ayniUnite = onceki && onceki.unite === s.unite;
    icerik.push(h('div', { class: 'sonucMaskot', html: bulbulSVG('uzgun') }),
      h('h2', null, '💔 Kalpler bitti'),
      h('p', null, r.dogru + ' doğru cevap verdin. Yanlış yaptıkların 🎯 Tekrar listene eklendi.'),
      hataKartlariBolumu(r.tur),
      kartSatiri(r),
      kalis >= 2 ? h('p', { class: 'kucukNot' }, 'Bu seviyeyi ' + kalis + '. kez denedin. İpuçları açık bir deneme ücretsiz (en fazla 2 ⭐).') : null,
      kalis >= 2 ? dugme('💡 İpuçlu dene (ücretsiz)', function () { modalKapat(); seviyeBaslat(s, { ipucuAcik: true, ipuculuTur: true }); }) : null,
      dugme('Tekrar dene', function () { modalKapat(); seviyeBaslat(s); }, kalis >= 2 ? 'gri' : ''),
      ayniUnite ? dugme('↩︎ Önce “' + onceki.ad + '” seviyesini tekrar et', function () { modalKapat(); seviyeBaslat(onceki); }, 'gri')
        : s.unite.ders ? dugme('📖 Dersi yeniden gör', function () { modalKapat(); turdanCik(false); uniteDersiAc(s.unite); }, 'gri') : null,
      dugme(yolaDonMetni(), function () { modalKapat(); turdanCik(false); }, 'gri'));
  } else {
    const fark = yildizOf(s.id) - eski;
    icerik.push(h('div', { class: 'sonucMaskot', html: bulbulSVG('mutlu') }),
      h('h2', null, s.tip === 'boss' ? '👑 Ünite tamamlandı!' : '🎉 Seviye tamam!'),
      yildizDizi(r.yildiz),
      r.joker ? h('p', { class: 'kucukNot' }, 'Joker kullandın: en fazla 2 ⭐') : r.tur.ipuculuTur ? h('p', { class: 'kucukNot' }, 'İpuçlu denemede en fazla 2 ⭐') : null,
      h('p', null, r.dogru + ' doğru · ' + r.hataTam + ' hata' + (r.yarim ? ' · ' + r.yarim + ' düzeltme' : '')),
      hataKartlariBolumu(r.tur),
      h('p', null, fark > 0 ? '⭐ +' + fark : 'Yıldız rekorunu geçmedin'),
      yeniUnvan !== oncekiUnvan ? h('div', { class: 'yeniUnvan' }, h('span', { class: 'unvanRozet buyuk', html: rozetSVG(unvan().renk) }),
        h('div', null, 'Yeni ünvan: ' + yeniUnvan + '!', h('small', null, unvan().anlam))) : null,
      !uniteOnce && uniteBitti(s.unite) ? h('p', null, '🏆 Bu üniteyi altınlamak için ünitenin üstündeki “Altınla” düğmesini dene.') : null,
      kartSatiri(r),
      sonraki && acikMi(sonraki) ? dugme('Sonraki: ' + sonraki.ad, function () { modalKapat(); seviyeGiris(sonraki); }) : null,
      dugme('Tekrar oyna', function () { modalKapat(); seviyeBaslat(s); }, 'gri'),
      dugme(yolaDonMetni(), function () { modalKapat(); turdanCik(false); }, 'gri'));
  }
  modalAc(h('div', { class: 'sonuc' }, icerik), { kapatilamaz: true });
}

function yildizDizi(n) {
  return h('div', { class: 'buyukYildiz' }, h('span', { class: 'dolu' }, '★'.repeat(n)), h('span', { class: 'bos' }, '★'.repeat(3 - n)));
}
function kartSatiri(r) {
  return r.yeniKart && r.yeniKart.length ? h('p', { class: 'kucukNot' }, '🃏 ' + r.yeniKart.length + ' yeni kart: ' + r.yeniKart.slice(0, 6).join(', ') + (r.yeniKart.length > 6 ? '…' : '')) : null;
}

// Ünitenin seviyelerinden karışık sorular
function uniteKarisik(u, n, sadeceUretim) {
  const L = [];
  const sev = u.seviyeler;
  let deneme = 0;
  while (L.length < n && deneme < 60) {
    deneme++;
    const s = rastgele(sev);
    const q = s.uret(1)[0];
    if (sadeceUretim && q.tip === 'secim' && deneme < 45) continue;
    L.push(q);
  }
  return karistir(L);
}

function sandikBaslat(u) {
  turBaslat({
    tip: 'sandik', sorular: uniteKarisik(u, 8), kalp: 0, joker: false, kayit: true, etiket: '🎁 Sandık',
    bitince: function (r) {
      let odul = '';
      if (!DURUM.sandik[u.id]) { DURUM.sandik[u.id] = true; DURUM.bonus += 2; odul = '⭐ +2 (ilk açılış)'; }
      kaydet();
      modalAc(h('div', { class: 'sonuc' },
        h('div', { class: 'sonucMaskot', html: bulbulSVG('mutlu') }),
        h('h2', null, '🎁 Tekrar sandığı'),
        h('p', null, r.dogru + ' / ' + r.toplam + ' doğru'),
        odul ? h('p', null, odul) : h('p', { class: 'kucukNot' }, 'Sandığın ödülünü daha önce almıştın; bu tur pratikti.'),
        kartSatiri(r),
        dugme(yolaDonMetni(), function () { modalKapat(); turdanCik(false); }, 'gri')), { kapatilamaz: true });
    }
  });
}

function atlamaBaslat(u) {
  turBaslat({
    tip: 'atlama', sorular: u.boss.uret(12), kalp: 3, joker: false, kayit: true,
    bitince: function (r) {
      if (r.basari) {
        u.seviyeler.forEach(function (s) { if (!yildizOf(s.id)) DURUM.yildiz[s.id] = 1; });
        DURUM.ders[u.id] = true;
        (u.ogeler || []).forEach(function (id) { DURUM.kart[id] = DURUM.kart[id] || 1; });
        kaydet();
      }
      modalAc(h('div', { class: 'sonuc' },
        h('div', { class: 'sonucMaskot', html: bulbulSVG(r.basari ? 'mutlu' : 'uzgun') }),
        h('h2', null, r.basari ? '⏩ Ünite geçildi!' : 'Bu sefer olmadı'),
        h('p', null, r.basari ? 'Ünitenin bütün seviyeleri 1 ⭐ ile tamamlandı. İstersen dönüp yıldızlarını artırabilirsin.' : r.dogru + ' doğru verdin. Üniteyi baştan oynayarak ilerleyebilirsin.'),
        dugme(yolaDonMetni(), function () { modalKapat(); turdanCik(false); }, 'gri')), { kapatilamaz: true });
    }
  });
}

function altinBaslat(u) {
  turBaslat({
    tip: 'altin', sorular: uniteKarisik(u, 10, true), kalp: 0, joker: false, kayit: true, sure: 20, etiket: '🏆 Ustalık',
    bitince: function (r) {
      const gecti = r.hata <= 2;
      let not = '';
      if (gecti && !DURUM.altin[u.id]) { DURUM.altin[u.id] = true; DURUM.bonus += 5; not = '⭐ +5'; }
      kaydet();
      modalAc(h('div', { class: 'sonuc' },
        h('div', { class: 'sonucMaskot', html: bulbulSVG(gecti ? 'mutlu' : 'uzgun') }),
        h('h2', null, gecti ? '🏆 Ünite altınlandı!' : 'Altın için en fazla 2 hata'),
        h('p', null, r.dogru + ' doğru · ' + r.hata + ' hata'),
        not ? h('p', null, not) : null,
        dugme(yolaDonMetni(), function () { modalKapat(); turdanCik(false); }, 'gri')), { kapatilamaz: true });
    }
  });
}

function tekrarBaslat() {
  let L = vadesiGelenler();
  if (L.length < 4) L = benzersiz(L.concat(zayiflar()));
  if (!L.length) { toast('Şu an tekrar edilecek öğe yok 🎉'); return; }
  L = L.slice(0, 10);
  const sorular = karistir(L).map(ogeSorusu);
  turBaslat({
    tip: 'tekrar', sorular: sorular, kalp: 0, joker: false, kayit: true, etiket: '🎯 Tekrar',
    bitince: function (r) {
      modalAc(h('div', { class: 'sonuc' },
        h('div', { class: 'sonucMaskot', html: bulbulSVG('mutlu') }),
        h('h2', null, '🎯 Tekrar bitti'),
        h('p', null, r.dogru + ' / ' + r.toplam + ' doğru'),
        h('p', { class: 'kucukNot' }, 'Doğru bildiklerin daha uzun aralıklarla, yanlışların yarın yeniden karşına çıkacak.'),
        dugme('Tamam', function () { modalKapat(); turdanCik(false); }, 'gri')), { kapatilamaz: true });
    }
  });
}

function antrenmanBaslat(a) {
  turBaslat({
    tip: 'antrenman', sorular: a.uret(10), kalp: 0, joker: false, kayit: true, etiket: '🔁 Göçürme', ipucuAcik: false,
    bitince: function (r) {
      modalAc(h('div', { class: 'sonuc' },
        h('div', { class: 'sonucMaskot', html: bulbulSVG('mutlu') }),
        h('h2', null, '🔁 ' + a.ad),
        h('p', null, r.dogru + ' / ' + r.toplam + ' doğru'),
        dugme('Bir tur daha', function () { modalKapat(); antrenmanBaslat(a); }),
        dugme('Tamam', function () { modalKapat(); turdanCik(false); }, 'gri')), { kapatilamaz: true });
    }
  });
}

// =====================================================
// SONSUZ MEŞK
// =====================================================
// Meydan okuma modu: soru, seviyenin listedeki yerine göre değil zorluk puanına göre seçilir.
// Katlar: Kalfa (0–9 doğru) · Usta (10–24) · Pîr (25+). Rekor puanla tutulur.
const SONSUZ_KATLAR = [
  { ad: 'Kalfa', min: 0,  esik: 0.30, puan: 1, sik: 4 },
  { ad: 'Usta',  min: 10, esik: 0.55, puan: 2, sik: 5, sure: 25 },
  { ad: 'Pîr',   min: 25, esik: 0.75, puan: 3, sik: 6, sure: 20 }
];
function sonsuzKat(seri) { let k = SONSUZ_KATLAR[0]; SONSUZ_KATLAR.forEach(function (x) { if (seri >= x.min) k = x; }); return k; }
// Seviyenin zorluk puanı: karar sayısı, şık sayısı, üretim (yer/dizi), final, süre ve ünitenin dal içindeki sırası
function seviyeZorluk(s) {
  if (s._zor !== undefined) return s._zor;
  let z = 0;
  try {
    const L = s.uret(Math.min(4, s.soruSay || 4));
    const ort = function (f) { return L.reduce(function (t, v) { return t + f(v); }, 0) / Math.max(1, L.length); };
    z += ort(kararSayisi) * 0.8;
    z += ort(function (v) { return v.tip === 'secim' ? Math.max(0, (v.siklar || []).length - 3) * 0.4 : 1.5; });
  } catch (e) { z = 1; }
  if (s.tip === 'boss') z += 1.2;
  if (s.sure) z += 1;
  const uL = gercekUniteler(s.dal);
  z += Math.max(0, uL.indexOf(s.unite)) / Math.max(1, uL.length) * 2.5;
  if (s.unite.seviyeler[0] === s) z -= 1.5;          // ünitenin ilk tanıma seviyesi
  return (s._zor = z);
}
function sonsuzHavuz(dal) {
  const dallar = dal === 'karisik' ? TR_DALLAR : [dal];
  let L = [];
  const sesli = function (s) { return !(s.kulak && DURUM.ayar.kulak === false); };   // 3.1
  dallar.forEach(function (d) { L = L.concat(DAL_SEVIYELERI[d].filter(function (s) { return s.tip !== 'sonsuz' && bittiMi(s) && sesli(s); })); });
  if (!L.length) dallar.forEach(function (d) { L = L.concat(DAL_SEVIYELERI[d].filter(function (s) { return s.tip !== 'sonsuz' && sesli(s); })); });
  return L.sort(function (a, b) { return seviyeZorluk(a) - seviyeZorluk(b); });
}
function sonsuzAcik(dal) {
  if (dal === 'dikte') return acikMi(SEVIYE['sn-dikte']);
  if (dal === 'karisik') return TR_DALLAR.some(function (d) { return DAL_SEVIYELERI[d].some(function (s) { return s.tip !== 'sonsuz' && bittiMi(s); }); });
  return acikMi(SEVIYE['sn-' + dal]);
}
// Sorunun sert biçimi: şık sayısı kata göre artar (üretici destekliyorsa), soru meydan okuma etiketi alır
function sonsuzSert(q, kat) {
  if (!q) return q;
  q.kat = kat.ad;
  return q;
}
function sonsuzSorulari(dal, seri, n) {
  if (dal === 'dikte') return sonsuzDikteSorulari(seri, n);
  const L = sonsuzHavuz(dal), kat = sonsuzKat(seri);
  const bas = Math.min(L.length - 1, Math.floor(L.length * kat.esik));
  const P = L.slice(bas);
  const zayif = zayiflar().filter(function (id) { return dal === 'karisik' || ogeDali(id) === dal; });
  const sorular = [];
  for (let i = 0; i < n; i++) {
    if (zayif.length && Math.random() < 0.2) { try { sorular.push(sonsuzSert(ogeSorusu(rastgele(zayif)), kat)); continue; } catch (e) {} }
    const s = rastgele(P);
    try {
      let q = s.uret(1, kat.sik)[0];
      if (q && q.tip === 'secim' && q.siklar && q.siklar.length < kat.sik && kat.sik > 4) {
        const q2 = s.uret(1, kat.sik)[0]; if (q2 && q2.siklar && q2.siklar.length > q.siklar.length) q = q2;
      }
      sorular.push(sonsuzSert(q, kat));
    } catch (e) { console.warn(e); }
  }
  return sorular.filter(Boolean);
}
function sonsuzBaslat(dal) {
  if (!sonsuzAcik(dal)) { toast(dal === 'karisik' ? 'Önce birkaç seviye bitir' : '🔒 Önce bu dalın bütün ünitelerini bitir', 2600); return; }
  DURUM.rekor = DURUM.rekor || {};
  const dikte = dal === 'dikte';
  turBaslat({
    tip: 'sonsuz', sonsuz: dal, sorular: sonsuzSorulari(dal, 0, 5), kalp: 3, joker: false, kayit: true, puan: 0,
    bitince: function (r) {
      const skor = dikte ? r.dogru : (r.tur.puan || 0);
      const eski = DURUM.rekor[dal] || 0, yeni = skor > eski;
      if (yeni) DURUM.rekor[dal] = skor;
      let odul = 0;
      if (yeni && skor >= 10) { odul = Math.floor(skor / 10) - Math.floor(eski / 10); if (odul > 0) DURUM.bonus += odul; }
      kaydet();
      const kat = sonsuzKat(r.dogru), eskiSurum = (DURUM.rekorEski || {})[dal];
      const ad = dal === 'karisik' ? 'Her şey karışık' : dikte ? '🎹 Sonsuz dikte' : DALLAR[dal].ikon + ' ' + DALLAR[dal].ad;
      modalAc(h('div', { class: 'sonuc' },
        h('div', { class: 'sonucMaskot', html: bulbulSVG(yeni ? 'mutlu' : 'normal') }),
        h('h2', null, '♾️ Sonsuz Meşk · ' + ad),
        h('div', { class: 'rekorSayi' }, String(skor)),
        dikte ? null : h('p', null, r.dogru + ' doğru · ulaştığın kat: ', h('b', null, kat.ad)),
        h('p', null, yeni ? (eski ? '🏅 Yeni rekor! Eski rekorun: ' + eski : '🏅 İlk rekorun!') : 'Rekorun: ' + eski),
        odul > 0 ? h('p', null, '⭐ +' + odul) : h('p', { class: 'kucukNot' }, dikte ? 'Rekorunu her 10 doğruda geçince ⭐ +1.' : 'Puan: Kalfa katında doğru başına 1, Usta’da 2, Pîr’de 3. Rekorunu her 10 puanda geçince ⭐ +1.'),
        eskiSurum ? h('p', { class: 'kucukNot' }, 'Eski sistemdeki rekorun (doğru sayısı): ' + eskiSurum) : null,
        h('p', { class: 'kucukNot' }, 'Yanlış yaptıkların Tekrar listene eklendi.'),
        dugme('Bir daha', function () { modalKapat(); sonsuzBaslat(dal); }),
        dugme(yolaDonMetni(), function () { modalKapat(); turdanCik(false); }, 'gri')), { kapatilamaz: true });
    }
  });
}
// Sonsuz Meşk'te doğru cevap: kata göre puan; süre dolduysa puan yok; her 15 doğruda +1 kalp
function sonsuzDogru(q, yarim) {
  if (!TUR || !TUR.sonsuz || TUR.sonsuz === 'dikte') return;
  const kat = sonsuzKat(TUR.dogru - 1);
  if (!q.sureDoldu) TUR.puan = (TUR.puan || 0) + (yarim ? kat.puan / 2 : kat.puan);
  if (TUR.dogru % 15 === 0 && TUR.kalpKalan < TUR.kalpMax) { TUR.kalpKalan = Math.min(TUR.kalpMax, TUR.kalpKalan + 1); toast('❤️ +1 kalp'); }
  const yeniKat = sonsuzKat(TUR.dogru);
  if (yeniKat !== kat) setTimeout(function () { toast('⬆️ ' + yeniKat.ad + ' katına çıktın!', 2200); }, 300);
}

// Dersten sonra rehberli deneme: 2, 3, 4, 4 şık; ipucu açık; ceza yok
function isinmaBaslat(u, bitince) {
  const ilk = u.seviyeler[0];
  const L = [];
  for (let i = 0; i < 4; i++) {
    const q = ilk.uret(1, [2, 3, 4, 4][i])[0];
    if (q.tip === 'secim' && q.siklar.length > [2, 3, 4, 4][i]) {
      const dogrular = [].concat(q.dogru);
      const d = q.siklar.filter(function (x) { return dogrular.indexOf(x.key) >= 0; });
      const y = q.siklar.filter(function (x) { return dogrular.indexOf(x.key) < 0; }).slice(0, [2, 3, 4, 4][i] - d.length);
      q.siklar = d.concat(y);
    }
    L.push(q);
  }
  turBaslat({
    tip: 'rehber', sorular: L, kalp: 0, joker: false, kayit: false, ipucuAcik: true, etiket: '🧭 Isınma',
    bitince: function () {
      modalAc(h('div', { class: 'sonuc' },
        h('div', { class: 'sonucMaskot', html: bulbulSVG('mutlu') }),
        h('h2', null, 'Hazırsın!'),
        h('p', null, 'Ders bitti. Şimdi ünitenin ilk seviyesini oynayabilirsin.'),
        dugme('İlk seviyeye başla', function () { modalKapat(); seviyeBaslat(ilk); }),
        dugme(yolaDonMetni(), function () { modalKapat(); turdanCik(false); if (bitince) bitince(); }, 'gri')), { kapatilamaz: true });
    }
  });
}

// =====================================================
// DERS GÖRÜNTÜLEYİCİ (üniteler ve Öğren modülleri ortak)
// =====================================================
let DERS = null;
function dersGoster(baslik, kartlar, bitince, sonDugme, terimsiz) {
  DERS = { kartlar: kartlar, i: 0, bitince: bitince, baslik: baslik, sonDugme: sonDugme || 'Bitir', terimsiz: !!terimsiz };
  ekranAc('ekranDers');
  $('dersBaslik').textContent = baslik;
  dersKartCiz();
}
function dersKartCiz() {
  const d = DERS, k = d.kartlar[d.i];
  const nk = bosalt($('dersNokta'));
  d.kartlar.forEach(function (_, i) { nk.appendChild(h('span', { class: i === d.i ? 'aktif' : i < d.i ? 'gecti' : '' })); });
  const g = bosalt($('dersGovde'));
  g.scrollTop = 0;
  const kart = h('article', { class: 'dersKart' });
  if (k.baslik) kart.appendChild(h('h2', null, k.baslik));
  if (k.cizim) { try { kart.appendChild(h('div', { class: 'dersCizim' }, k.cizim())); } catch (e) { console.warn(e); } }
  if (k.metin) kart.appendChild(DERS.terimsiz ? h('div', { class: 'dersMetin', html: k.metin }) : terimBagla(h('div', { class: 'dersMetin', html: k.metin })));
  if (k.deneme) kart.appendChild(miniDeneme(k.deneme));
  g.appendChild(kart);
  if (d.i === 0) g.appendChild(h('div', { class: 'dersMaskot', html: bulbulSVG('anlat') }));
  $('dersGeri').disabled = d.i === 0;
  $('dersIleri').textContent = d.i === d.kartlar.length - 1 ? d.sonDugme : 'İleri →';
}
function dersIleri() {
  if (!DERS) return;
  if (DERS.i < DERS.kartlar.length - 1) { DERS.i++; dersKartCiz(); return; }
  const f = DERS.bitince; DERS = null;
  if (f) f(); else anaEkranaDon();
}
function dersGeri() { if (DERS && DERS.i > 0) { DERS.i--; dersKartCiz(); } }

// Ders kartı içinde puansız tek soru
function miniDeneme(q) {
  const kap = h('div', { class: 'miniDeneme' }, h('div', { class: 'soruAlt' }, q.soru));
  const sonuc = h('div', { class: 'miniSonuc' });
  const sik = h('div', { class: 'siklar adlar' });
  karistir(q.siklar).forEach(function (x) {
    const b = h('button', { class: 'sik', type: 'button' }, x);
    b.onclick = function () {
      Array.prototype.forEach.call(sik.children, function (c) { c.disabled = true; if (c.textContent === q.dogru) c.classList.add('dogru'); });
      if (x !== q.dogru) b.classList.add('yanlis');
      sonuc.innerHTML = (x === q.dogru ? '✅ ' : '❌ ') + terimle(q.aciklama || '');
    };
    sik.appendChild(b);
  });
  kap.appendChild(sik);
  kap.appendChild(sonuc);
  return kap;
}

function uniteDersiAc(u) {
  if (!u.ders) { toast('Bu ünitenin dersi yok'); return; }
  const kartlar = u.ders();
  dersGoster(DALLAR[u.dal].ad + ' · Ünite ' + u.no, kartlar, function () {
    DURUM.ders[u.id] = true;
    (u.ogeler || []).forEach(function (id) { if (ogeDali(id) !== 'bati') DURUM.kart[id] = DURUM.kart[id] || 1; });
    kaydet();
    isinmaBaslat(u);
  }, 'Isınma turuna geç →', u.dal === 'bati');
}

// =====================================================
// ESKİ KAYIT TAŞIMA (v1 → v2)
// Kişinin ilerlemesine göre yerleştirir; yerleştirildiği ünitenin
// yerleştirme ve final (boss) seviyelerini geçmeden o dalda ilerleyemez.
// =====================================================
function eskiKayitTasi(eski, km, db) {
  const ozet = [];
  const ey = Array.isArray(eski.yildiz) ? eski.yildiz : [];
  const st = function (i) { return ey[i] || 0; };
  const BOSS = [1, 3, 8, 14, 20, 25];
  const gecti = function (b) { return st(BOSS[b]) > 0; };
  const ort = function (a, b) {
    let t = 0, c = 0;
    for (let i = a; i <= b; i++) if (st(i) > 0) { t += st(i); c++; }
    return c ? Math.max(1, Math.round(t / c)) : 1;
  };
  function tamamla(u, y) { u.seviyeler.forEach(function (s) { DURUM.yildiz[s.id] = Math.max(DURUM.yildiz[s.id] || 0, y); }); DURUM.ders[u.id] = true; }
  function yerlestir(u, y) { u.seviyeler.forEach(function (s) { if (s.tip === 'seviye') DURUM.yildiz[s.id] = Math.max(DURUM.yildiz[s.id] || 0, y); }); DURUM.ders[u.id] = true; }

  // Perde
  let tam = 0, yer = -1;
  if (gecti(4) || gecti(5)) { tam = 4; yer = 4; }
  else if (gecti(2) || gecti(3)) { tam = 1; yer = 1; }
  else if (gecti(1)) { tam = 0; yer = 0; }
  const y = ort(0, 25);
  for (let i = 0; i < tam; i++) tamamla(PERDE_UNITELER[i], y);
  if (yer >= 0) {
    yerlestir(PERDE_UNITELER[yer], y);
    ozet.push('🎶 Perde: ' + PERDE_UNITELER[yer].no + '. pakete yerleştirildin. Devam etmek için bu paketin ✍️ porteye kurma ve 👑 final seviyelerini geç.');
  } else if (gecti(0)) {
    DURUM.yildiz['p1-1'] = Math.max(1, st(0)); DURUM.yildiz['p1-2'] = Math.max(1, st(1));
    DURUM.ders.p1 = true;
    // Eski 3. seviye (diğer tam notalar) yeni p1-3'e denk gelir
    if (st(2) > 0) {
      DURUM.yildiz['p1-3'] = st(2);
      ozet.push('🎶 Perde: ilk üç seviyen aktarıldı.');
    } else ozet.push('🎶 Perde: ilk iki seviyen aktarıldı.');
  } else if (st(0) > 0) {
    DURUM.yildiz['p1-1'] = st(0);
    ozet.push('🎶 Perde: ilk seviyen aktarıldı.');
  }

  // Koma: seviyeler birebir aynı
  const ky = Array.isArray(km.yildiz) ? km.yildiz : [];
  let kmSay = 0;
  ky.forEach(function (v, i) { if (v > 0 && SEVIYE['km' + (i + 1)]) { DURUM.yildiz['km' + (i + 1)] = v; kmSay++; } });
  if (kmSay) ozet.push('🎼 Koma: ' + kmSay + ' seviyenin yıldızları aynen aktarıldı. 2. üniteye yeni bir “porteye yaz” seviyesi eklendi.');
  KOMA_UNITELER.forEach(function (u) { if (u.seviyeler.some(function (s) { return yildizOf(s.id) > 0; })) DURUM.ders[u.id] = true; });

  // Dörtlü-Beşli
  const dy = Array.isArray(db.yildiz) ? db.yildiz : [];
  if (dy[8] > 0) {
    for (let i = 0; i < 4; i++) tamamla(CESNI_UNITELER[i], 1);
    yerlestir(CESNI_UNITELER[4], 1);
    ozet.push('🎻 Dörtlü-Beşli: İleri çeşniler ünitesine yerleştirildin; final seviyesini geçmen gerekiyor.');
  } else if (dy[4] > 0) {
    for (let i = 0; i < 3; i++) tamamla(CESNI_UNITELER[i], 1);
    yerlestir(CESNI_UNITELER[3], 1);
    ozet.push('🎻 Dörtlü-Beşli: Temel beşliler ünitesine yerleştirildin; final seviyesini geçmen gerekiyor.');
  } else if (dy.some(function (v) { return v > 0; })) {
    ozet.push('🎻 Dörtlü-Beşli: bu dal yeni temel dörtlülerle baştan kuruldu; ilk üniteden başlıyorsun.');
  }

  // Cüzdan, seri, zayıflar, kartlar
  DURUM.bonus = eski.bonus || 0;
  DURUM.harcanan = Math.min(eski.harcanan || 0, toplamYildiz());
  if (eski.seri && eski.seri.son) DURUM.seri = { son: eski.seri.son, sayi: eski.seri.sayi || 0 };
  if (eski.zayif) Object.keys(eski.zayif).forEach(function (pid) {
    if (perdeOge('p:' + pid)) DURUM.tekrar['p:' + pid] = { k: 0, t: bugun(), d: 0, y: eski.zayif[pid] || 1 };
  });
  if (eski.kart) Object.keys(eski.kart).forEach(function (pid) { if (perdeOge('p:' + pid)) DURUM.kart['p:' + pid] = 1; });
  if (!ozet.length) ozet.push('İlerlemen yeni sisteme aktarıldı.');
  DURUM.tasima = { tarih: bugun(), ozet: ozet, gosterildi: false };
}
