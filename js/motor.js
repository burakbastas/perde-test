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
  bati:  { ad: 'Batı Teorisi',  ikon: '🎹', renk: 'var(--mor)',     uniteler: BATI_UNITELER }
};
const DAL_SIRA = ['koma', 'perde', 'gocurme', 'cesni', 'makam', 'bati'];
const TR_DALLAR = ['koma', 'perde', 'gocurme', 'cesni', 'makam'];

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
    u.boss = u.seviyeler.filter(function (s) { return s.tip === 'boss'; }).pop();
  });
});

// Önerilen sıra (Meşk Yolu). Batı Teorisi isteğe bağlı olarak araya karışır.
const MESK_TR = ['km1', 'p1', 'km2', 'p2', 'g1', 'km3', 'g2', 'db1', 'db2', 'p3', 'db3', 'g3', 'db4', 'g4', 'mk1', 'p4', 'mk2', 'db5', 'mk3', 'g5', 'p5'];
const MESK_BATI_SONRA = { p1: 'b1', km2: 'b2', p2: 'b3', km3: 'b4', db1: 'b5', db2: 'b6', p3: 'b7', db3: 'b8', db4: 'b9', mk1: 'b10' };
function meskSirasi() {
  const L = [];
  MESK_TR.forEach(function (id) {
    L.push(id);
    if (DURUM.ayar.bati && MESK_BATI_SONRA[id]) L.push(MESK_BATI_SONRA[id]);
  });
  return L.map(function (id) { return UNITE[id]; });
}

// ---------- Durum sorguları ----------
function yildizOf(id) { return DURUM.yildiz[id] || 0; }
function bittiMi(s) { return yildizOf(s.id) > 0; }
function acikMi(s) {
  const L = DAL_SEVIYELERI[s.dal];
  const i = L.indexOf(s);
  return i <= 0 || bittiMi(L[i - 1]);
}
function uniteBitti(u) { return bittiMi(u.boss); }
function uniteBaslamadi(u) { return !u.seviyeler.some(bittiMi); }
function uniteIlerleme(u) {
  const b = u.seviyeler.filter(bittiMi).length;
  return { bitti: b, toplam: u.seviyeler.length };
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
  for (let i = 0; i < L.length; i++) if (!bittiMi(L[i])) return L[i];
  return null;
}

// ---------- Ünvanlar ----------
// Meşk geleneğindeki mübtedî – mutavassıt – müntehî basamaklarına dayanır
const UNVANLAR = [
  { min: 0,  ad: 'Mübtedî',       yonelme: 'Mübtedî’ye',       anlam: 'Meşke yeni başlayan',                 renk: '#b0703c' },
  { min: 2,  ad: 'Heveskâr',      yonelme: 'Heveskâr’a',       anlam: 'Mûsikiye gönül vermiş',               renk: '#138f92' },
  { min: 5,  ad: 'Mutavassıt',    yonelme: 'Mutavassıt’a',     anlam: 'Orta seviyeye ulaşmış',               renk: '#2348a8' },
  { min: 9,  ad: 'Mûsikişinas',   yonelme: 'Mûsikişinas’a',    anlam: 'Mûsikiden anlayan',                   renk: '#d84a33' },
  { min: 13, ad: 'Müntehî',       yonelme: 'Müntehî’ye',       anlam: 'İleri seviyeye ulaşmış',              renk: '#15834f' },
  { min: 17, ad: 'Muallim',       yonelme: 'Muallim’e',        anlam: 'Meşk verebilecek bilgide',            renk: '#7647b3' },
  { min: 21, ad: 'Üstad-ı Kâmil', yonelme: 'Üstad-ı Kâmil’e',  anlam: 'Bütün Türk müziği ünitelerini bitiren', renk: '#d9a520' }
];
function unvanOf(n) { let u = UNVANLAR[0]; UNVANLAR.forEach(function (x) { if (n >= x.min) u = x; }); return u; }
function unvan() { return unvanOf(bitenUniteSayisi(TR_DALLAR)); }
function sonrakiUnvan() { const n = bitenUniteSayisi(TR_DALLAR); return UNVANLAR.find(function (x) { return x.min > n; }) || null; }

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
  if (p === 'm') return MAKAMLAR.some(function (m) { return m.oge === id; });
  if (p === 'b') return true;
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
  if (p[0] === 'm') return MAKAMLAR.find(function (m) { return m.oge === id; }).ad;
  if (p[0] === 'b') return p[1] === 'a' ? kodAd(p[2]) : tonAd(+p[2], 'majör') + ' / ' + tonAd(+p[2], 'minör');
  return id;
}
function ogeDali(id) { return { p: 'perde', k: 'koma', d: 'cesni', m: 'makam', b: 'bati' }[id.split(':')[0]]; }
function ogeSorusu(id) {
  const p = id.split(':')[0];
  if (p === 'p') return perdeOgeSorusu(id);
  if (p === 'k') return komaOgeSorusu(id);
  if (p === 'd') return cesniOgeSorusu(id);
  if (p === 'm') return makamOgeSorusu(id);
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
  if (o.tip !== 'deneme' && o.tip !== 'rehber') seriGuncelle();
  TUR = Object.assign({ k: 0, hata: 0, dogru: 0, atlanan: 0, ceza: 0, jokerSay: 0, jokerKullandi: false, yeniKart: [], q: null, zaman: null }, o);
  TUR.kalpVar = (o.kalp || 0) > 0;
  TUR.kalpMax = o.kalp || 0;
  TUR.kalpKalan = o.kalp || 0;
  ekranAc('ekranOyun');
  soruGoster();
}

function kalpYaz() {
  const k = $('oyKalp');
  if (TUR.kalpVar) k.textContent = '❤️'.repeat(Math.max(0, TUR.kalpKalan)) + '🤍'.repeat(Math.max(0, TUR.kalpMax - TUR.kalpKalan));
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
    TUR.kalpKalan++; kalpYaz();
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
  const veri = TUR.sorular[TUR.k];
  const q = TUR.q = { veri: veri, butonlar: [], cevaplandi: false, ipucuNo: 1 };
  $('oyDolgu').style.width = (TUR.k / TUR.sorular.length * 100) + '%';
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

  const ip = h('div', { id: 'oyIpucu', class: 'ipucu', hidden: true });
  g.appendChild(ip);
  if (TUR.ipucuAcik && veri.ipucu) ipucuGoster(veri.ipucu);

  const alan = h('div', { class: 'cevapAlani' });
  g.appendChild(alan);
  const kontrol = $('oyKontrol');
  kontrol.hidden = true;

  if (veri.tip === 'secim') secimCiz(alan, veri, q);
  else if (veri.tip === 'yer') yerCiz(alan, veri, q, kontrol);
  else if (veri.tip === 'dizi') diziCiz(alan, veri, q, kontrol);

  jokerYaz();
  ustBilgiYaz();

  if (TUR.sure) {
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
  const siklar = karistir(veri.siklar);
  const porteli = siklar.some(function (x) { return x.porte; });
  const genis = siklar.some(function (x) { return x.genis; });
  const glifli = siklar.some(function (x) { return x.glif; });
  const kisa = !porteli && !glifli && siklar.every(function (x) { return String(x.metin).length <= 14; }) && siklar.length >= 4;
  const kap = h('div', { class: 'siklar ' + (porteli ? (genis ? 'genisPortler' : 'portler') : glifli ? 'glifler' : kisa ? 'kisaAdlar' : 'adlar') });
  const dogrular = [].concat(veri.dogru);
  siklar.forEach(function (x) {
    const b = h('button', { class: 'sik', type: 'button' });
    if (x.porte) b.appendChild(porteSVG(x.porte));
    else if (x.glif) b.appendChild(h('span', { class: 'bravura' }, x.glif));
    else b.textContent = x.metin;
    const kayit = { b: b, x: x, dogru: dogrular.indexOf(x.key) >= 0 };
    b.onclick = function () {
      if (q.cevaplandi) return;
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
    const esit = function (a, b) {
      if (y.sadeceAdim) return a.length === b.length && a.every(function (n, i) { return adim(n) === adim(b[i]); });
      return a.length === b.length && a.every(function (n, i) { return notaEsit(n, b[i]); });
    };
    const kabul = y.kabul || [y.beklenen];
    const dogru = kabul.some(function (k) { return esit(deger, k); });
    const goster = kabul.find(function (k) { return esit(deger, k); }) || y.beklenen;
    bil.kilitle(y.sadeceAdim ? deger.map(function (n, i) { return adim(n) === adim(goster[i]) ? n : goster[i]; }) : goster);
    kontrol.hidden = true;
    cevapla(dogru, null, dogru ? null : porteSVG({ notalar: y.beklenen, aralik: 40, etiketler: y.etiketler }));
  };
}

function diziCiz(alan, veri, q, kontrol) {
  const d = veri.dizi;
  const secilen = [];
  const slotlar = h('div', { class: 'diziSlotlar' + (d.genis ? ' genis' : '') });
  const havuz = h('div', { class: 'diziHavuz' + (d.genis ? ' genis' : '') });
  alan.appendChild(slotlar);
  alan.appendChild(havuz);
  function ciz() {
    bosalt(slotlar);
    for (let i = 0; i < d.uzunluk; i++) {
      const x = secilen[i];
      const s = h('button', { class: 'diziSlot' + (x ? ' dolu' : ''), type: 'button' }, x ? x.metin : String(i + 1));
      s.onclick = function () { if (q.cevaplandi || !x) return; secilen.splice(i, 1); ciz(); };
      slotlar.appendChild(s);
    }
    bosalt(havuz);
    d.havuz.forEach(function (x) {
      const kullanildi = !d.tekrarli && secilen.indexOf(x) >= 0;
      const b = h('button', { class: 'diziTas', type: 'button', disabled: kullanildi || q.cevaplandi || secilen.length >= d.uzunluk }, x.metin);
      b.onclick = function () { if (secilen.length < d.uzunluk) { secilen.push(x); ciz(); } };
      havuz.appendChild(b);
    });
    kontrol.disabled = secilen.length !== d.uzunluk;
  }
  ciz();
  kontrol.hidden = false;
  kontrol.textContent = 'Kontrol et';
  kontrol.onclick = function () {
    if (q.cevaplandi || secilen.length !== d.uzunluk) return;
    const keys = secilen.map(function (x) { return x.key; });
    const kabul = d.kabul || [d.beklenen];
    const dogru = kabul.some(function (k) { return k.join('|') === keys.join('|'); });
    Array.prototype.forEach.call(slotlar.children, function (s, i) {
      s.classList.add(kabul.some(function (k) { return k[i] === keys[i]; }) ? 'dogru' : 'yanlis');
    });
    kontrol.hidden = true;
    q.cevaplandi = true;
    ciz();
    cevapla(dogru);
  };
}

function ustBilgiYaz() { if (typeof ustYaz === 'function') ustYaz(); }

const OVGU = ['Harika!', 'Aferin!', 'Çok iyi!', 'Tam isabet!', 'Maşallah!', 'Bravo!', 'Süper!'];
function cevapla(dogru, ozelMesaj, dogruGorsel) {
  const q = TUR.q;
  if (q.cevaplandi && q.sonucVerildi) return;
  q.cevaplandi = true; q.sonucVerildi = true;
  clearInterval(TUR.zaman);
  $('oyKontrol').hidden = true;
  if (q.ipucuBtn) q.ipucuBtn.disabled = true;
  const veri = q.veri;
  if (dogru) {
    TUR.dogru++;
    if (TUR.kayit && veri.oge && !q.joker) {
      ogeCevap(veri.oge, true);
      if (!DURUM.kart[veri.oge] && ogeDali(veri.oge) !== 'bati') { DURUM.kart[veri.oge] = 1; TUR.yeniKart.push(ogeAdi(veri.oge)); }
    }
  } else {
    TUR.hata++;
    if (TUR.kalpVar) TUR.kalpKalan--;
    if (TUR.kayit && veri.oge) ogeCevap(veri.oge, false);
  }
  if (TUR.tip !== 'deneme') kaydet();
  kalpYaz();
  jokerYaz();

  const sh = $('oyGeri');
  sh.classList.add('acik', dogru ? 'dogru' : 'yanlis');
  const ic = bosalt($('oyGeriIc'));
  ic.appendChild(h('div', { class: 'geriBaslik' },
    h('span', { class: 'geriMaskot', html: bulbulSVG(dogru ? 'mutlu' : 'uzgun') }),
    h('span', null, ozelMesaj || (dogru ? rastgele(OVGU) : 'Doğrusu: ' + (veri.dogruMetin || '')))));
  if (dogruGorsel) ic.appendChild(h('div', { class: 'geriPorte' }, dogruGorsel));
  if (veri.aciklama) {
    const batiMi = (TUR.seviye && TUR.seviye.dal === 'bati') || (veri.oge && veri.oge.indexOf('b:') === 0);
    const ac = h('div', { class: 'geriAciklama', html: veri.aciklama });
    ic.appendChild(batiMi ? ac : terimBagla(ac));
  }
  const devam = $('oyDevam');
  devam.textContent = 'Devam';
  devam.onclick = sonrakiSoru;
  setTimeout(function () { try { devam.focus({ preventScroll: true }); } catch (e) {} }, 50);
}

function sonrakiSoru() {
  if (!TUR) return;
  $('oyGeri').classList.remove('acik');
  if (TUR.kalpVar && TUR.kalpKalan <= 0) return turBitir(false);
  if (TUR.k + 1 >= TUR.sorular.length) return turBitir(true);
  TUR.k++;
  soruGoster();
}

function turBitir(basari) {
  clearInterval(TUR.zaman);
  $('oyDolgu').style.width = '100%';
  const t = TUR;
  const sonuc = { basari: basari, hata: t.hata, dogru: t.dogru, toplam: t.sorular.length - t.atlanan, joker: t.jokerKullandi, ceza: t.ceza, yeniKart: t.yeniKart };
  sonuc.yildiz = !basari ? 0 : Math.max(1, 3 - Math.floor(t.hata + t.ceza));
  if (sonuc.basari && t.jokerKullandi) sonuc.yildiz = Math.min(2, sonuc.yildiz);
  if (t.tip !== 'deneme') kaydet();
  if (t.bitince) t.bitince(sonuc);
  if (SERI_MESAJ) { const m = SERI_MESAJ; SERI_MESAJ = null; setTimeout(function () { toast(m, 2600); }, 400); }
}

function turdanCik(sor) {
  if (!TUR) { anaEkranaDon(); return; }
  if (!sor) { clearInterval(TUR.zaman); TUR = null; modalKapat(); anaEkranaDon(); return; }
  modalAc(h('div', null,
    h('h2', null, 'Çıkmak istiyor musun?'),
    h('p', null, 'Bu turdaki ilerleme kaybolur.' + (TUR && TUR.jokerKullandi ? ' Harcadığın yıldızlar iade edilmez.' : '')),
    dugme('Devam et', modalKapat, 'gri'),
    dugme('Çık', function () { turdanCik(false); }, 'kirmizi')));
}

// =====================================================
// SEVİYE / ÖZEL TUR BAŞLATICILAR
// =====================================================
function seviyeBaslat(s) {
  const q = s.uret(s.soruSay);
  turBaslat({
    tip: s.tip, seviye: s, sorular: q, kalp: 3, joker: true, kayit: true,
    bitince: function (r) { seviyeSonucu(s, r); }
  });
}

function seviyeSonucu(s, r) {
  const oncekiUnvan = unvan().ad;
  const eski = yildizOf(s.id);
  const uniteOnce = uniteBitti(s.unite);
  if (r.basari) DURUM.yildiz[s.id] = Math.max(eski, r.yildiz);
  kaydet();
  const yeniUnvan = unvan().ad;
  const L = DAL_SEVIYELERI[s.dal];
  const sonraki = L[L.indexOf(s) + 1];
  const icerik = [];
  if (!r.basari) {
    icerik.push(h('div', { class: 'sonucMaskot', html: bulbulSVG('uzgun') }),
      h('h2', null, '💔 Kalpler bitti'),
      h('p', null, r.dogru + ' doğru cevap verdin. Yanlış yaptıkların 🎯 Tekrar listene eklendi.'),
      kartSatiri(r),
      dugme('Tekrar dene', function () { modalKapat(); seviyeBaslat(s); }),
      dugme('Yola dön', function () { modalKapat(); turdanCik(false); }, 'gri'));
  } else {
    const fark = yildizOf(s.id) - eski;
    icerik.push(h('div', { class: 'sonucMaskot', html: bulbulSVG('mutlu') }),
      h('h2', null, s.tip === 'boss' ? '👑 Ünite tamamlandı!' : '🎉 Seviye tamam!'),
      yildizDizi(r.yildiz),
      r.joker ? h('p', { class: 'kucukNot' }, 'Joker kullandın: en fazla 2 ⭐') : null,
      h('p', null, r.dogru + ' doğru · ' + r.hata + ' hata'),
      h('p', null, fark > 0 ? '⭐ +' + fark : 'Yıldız rekorunu geçmedin'),
      yeniUnvan !== oncekiUnvan ? h('div', { class: 'yeniUnvan' }, h('span', { class: 'unvanRozet buyuk', html: rozetSVG(unvan().renk) }),
        h('div', null, 'Yeni ünvan: ' + yeniUnvan + '!', h('small', null, unvan().anlam))) : null,
      !uniteOnce && uniteBitti(s.unite) ? h('p', null, '🏆 Bu üniteyi altınlamak için Meşk Yolu’nda “Altınla” düğmesini dene.') : null,
      kartSatiri(r),
      sonraki && acikMi(sonraki) ? dugme('Sonraki: ' + sonraki.ad, function () { modalKapat(); seviyeGiris(sonraki); }) : null,
      dugme('Tekrar oyna', function () { modalKapat(); seviyeBaslat(s); }, 'gri'),
      dugme('Yola dön', function () { modalKapat(); turdanCik(false); }, 'gri'));
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
        dugme('Yola dön', function () { modalKapat(); turdanCik(false); }, 'gri')), { kapatilamaz: true });
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
        dugme('Yola dön', function () { modalKapat(); turdanCik(false); }, 'gri')), { kapatilamaz: true });
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
        dugme('Yola dön', function () { modalKapat(); turdanCik(false); }, 'gri')), { kapatilamaz: true });
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

// Dersten sonra rehberli deneme: 2, 3, 4, 4 şık; ipucu açık; ceza yok
function rehberBaslat(u, bitince) {
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
        dugme('Yola dön', function () { modalKapat(); turdanCik(false); if (bitince) bitince(); }, 'gri')), { kapatilamaz: true });
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
    rehberBaslat(u);
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
    ozet.push('🎶 Perde: ilk iki seviyen aktarıldı.');
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
