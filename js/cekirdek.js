// =====================================================
// ÇEKİRDEK: yardımcılar, kayıt, eski kayıt taşıma, modal, toast, geri tuşu
// =====================================================
'use strict';

const SURUM = '2.2.0';
const WHATSAPP_NO = '905307302798';
const UYGULAMA_ADRESI = 'https://burakbastas.github.io/perde-oyunu/';
const ANAHTAR = 'perdeMacerasiV2';

// ---------- DOM ----------
const $ = function (id) { return document.getElementById(id); };

// h('div', {class:'x', onclick: fn, html:'..'}, child1, 'metin', ...)
function h(etiket, ozellik) {
  const e = document.createElement(etiket);
  if (ozellik) {
    for (const k in ozellik) {
      const v = ozellik[k];
      if (v === undefined || v === null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'text') e.textContent = v;
      else if (k === 'style' && typeof v === 'object') {
        for (const sk in v) { if (sk.slice(0, 2) === '--') e.style.setProperty(sk, v[sk]); else e.style[sk] = v[sk]; }
      }
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
  }
  for (let i = 2; i < arguments.length; i++) ekle(e, arguments[i]);
  return e;
}
function ekle(e, c) {
  if (c === null || c === undefined || c === false) return;
  if (Array.isArray(c)) { c.forEach(function (x) { ekle(e, x); }); return; }
  e.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
}
function bosalt(e) { while (e.firstChild) e.removeChild(e.firstChild); return e; }
function kacis(s) {
  return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
}

// ---------- Rastgelelik ----------
function karistir(a) {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = b[i]; b[i] = b[j]; b[j] = t;
  }
  return b;
}
function rastgele(a) { return a[Math.floor(Math.random() * a.length)]; }
function benzersiz(a, anahtar) {
  const gor = {}, s = [];
  a.forEach(function (x) { const k = anahtar ? anahtar(x) : x; if (!gor[k]) { gor[k] = 1; s.push(x); } });
  return s;
}

// ---------- Tarih ----------
function gunAnahtar(d) {
  return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
}
function bugun() { return gunAnahtar(new Date()); }
function gunEkle(n) { const d = new Date(); d.setDate(d.getDate() + n); return gunAnahtar(d); }

// ---------- Kayıt ----------
function varsayilanDurum() {
  return {
    v: 2,
    yildiz: {},      // seviyeId -> 0..3
    altin: {},       // uniteId -> true (ustalık)
    ders: {},        // uniteId -> true (ders görüldü)
    sandik: {},      // uniteId -> true (sandık ödülü alındı)
    tekrar: {},      // ogeId -> {k, t, d, y}  (Leitner)
    kart: {},        // ogeId -> 1 (koleksiyon kartı açık)
    ogren: {},       // modulId -> true
    bonus: 0, harcanan: 0,
    seri: { son: '', sayi: 0 },
    ayar: { tema: 'oto', bati: false, kurulum: false },
    tasima: null     // eski kayıttan taşındıysa özet
  };
}

let DURUM = varsayilanDurum();
let KAYIT_UYARI = false;

function kaydet() {
  try { localStorage.setItem(ANAHTAR, JSON.stringify(DURUM)); }
  catch (e) {
    if (!KAYIT_UYARI) { KAYIT_UYARI = true; toast('⚠️ İlerleme kaydedilemedi. Tarayıcı depolaması kapalı olabilir.', 4000); }
  }
}

function okuJSON(anahtar) {
  try { return JSON.parse(localStorage.getItem(anahtar)); } catch (e) { return null; }
}

function durumYukle() {
  const k = okuJSON(ANAHTAR);
  if (k && k.v === 2) {
    DURUM = Object.assign(varsayilanDurum(), k);
    DURUM.ayar = Object.assign(varsayilanDurum().ayar, k.ayar || {});
    return 'v2';
  }
  const eski = okuJSON('perdeMacerasiV1'), km = okuJSON('komaMacerasiV1'), db = okuJSON('dortluBesliV1');
  if ((eski && Array.isArray(eski.yildiz)) || (km && Array.isArray(km.yildiz)) || (db && Array.isArray(db.yildiz))) {
    DURUM = varsayilanDurum();
    eskiKayitTasi(eski || {}, km || {}, db || {});   // motor.js içinde (seviye kimlikleri orada)
    DURUM.ayar.kurulum = true;
    kaydet();
    return 'tasindi';
  }
  return 'yeni';
}

function tumKaydiSil() {
  ['perdeMacerasiV1', 'komaMacerasiV1', 'dortluBesliV1', ANAHTAR].forEach(function (a) {
    try { localStorage.removeItem(a); } catch (e) {}
  });
  DURUM = varsayilanDurum();
  DURUM.ayar.kurulum = true;
  kaydet();
}

// ---- Yedekle / geri yükle ----
function yedekKodu() {
  const json = JSON.stringify(DURUM);
  return 'PM2:' + btoa(unescape(encodeURIComponent(json)));
}
function yedekYukle(kod) {
  kod = String(kod || '').trim();
  let veri = null;
  try {
    if (kod.indexOf('PM2:') === 0) veri = JSON.parse(decodeURIComponent(escape(atob(kod.slice(4)))));
    else veri = JSON.parse(kod);
  } catch (e) { return false; }
  if (!veri || veri.v !== 2 || typeof veri.yildiz !== 'object') return false;
  DURUM = Object.assign(varsayilanDurum(), veri);
  DURUM.ayar = Object.assign(varsayilanDurum().ayar, veri.ayar || {});
  kaydet();
  return true;
}

// Kalıcı depolama iste (iOS/Android tarayıcının veriyi silmesini zorlaştırır)
function kaliciDepolamaIste() {
  try {
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () {});
  } catch (e) {}
}

// ---------- Toast ----------
function toast(m, ms) {
  const t = $('toast');
  t.textContent = m;
  t.classList.add('acik');
  clearTimeout(toast.z);
  toast.z = setTimeout(function () { t.classList.remove('acik'); }, ms || 2000);
}

// ---------- Modal ----------
let MODAL_KAPANINCA = null;
function modalAc(icerik, secenek) {
  secenek = secenek || {};
  const kutu = $('kutu');
  kutu.className = secenek.genis ? 'genis' : '';
  bosalt(kutu);
  if (typeof icerik === 'string') kutu.innerHTML = icerik; else ekle(kutu, icerik);
  $('modal').classList.add('acik');
  $('modal').dataset.kapatilabilir = secenek.kapatilamaz ? '' : '1';
  MODAL_KAPANINCA = secenek.kapaninca || null;
  kutu.scrollTop = 0;
}
function modalKapat() {
  if (!$('modal').classList.contains('acik')) return;
  $('modal').classList.remove('acik');
  const f = MODAL_KAPANINCA; MODAL_KAPANINCA = null;
  if (f) f();
}
function modalAcikMi() { return $('modal').classList.contains('acik'); }

// Kısa yollar: düğme üretimi
function dugme(metin, tik, sinif) {
  return h('button', { class: 'dugme ' + (sinif || ''), onclick: tik, type: 'button' }, metin);
}

// ---------- Hata şeridi ----------
function hataYaz(m) {
  const k = $('hata');
  if (!k) return;
  $('hataMetin').textContent = m;
  k.hidden = false;
}
window.addEventListener('error', function (e) {
  if (e && e.message) hataYaz('Bir hata oluştu: ' + e.message + (e.lineno ? ' (satır ' + e.lineno + ')' : ''));
});
window.addEventListener('unhandledrejection', function (e) {
  const r = e && e.reason;
  if (r && r.message) hataYaz('Bir hata oluştu: ' + r.message);
});

// ---------- Android geri tuşu ----------
// Tarihte her zaman bir "tampon" kayıt tutulur. Geri tuşu bu kaydı tüketince
// geriIsle() çağrılır; o da ne açıksa onu kapatır ve tamponu yeniler.
// Hiçbir şey açık değilse tampon yenilenmez, ikinci geri uygulamadan çıkar.
let GERI_ISLEYICI = null;   // arayüz tarafından atanır: function() -> true (bir şey kapattı) / false
function geriTusuKur() {
  try { history.replaceState({ kok: 1 }, ''); history.pushState({ tampon: 1 }, ''); } catch (e) {}
  window.addEventListener('popstate', function () {
    let islendi = false;
    try { islendi = GERI_ISLEYICI ? GERI_ISLEYICI() : false; } catch (e) {}
    if (islendi) { try { history.pushState({ tampon: 1 }, ''); } catch (e) {} }
    else toast('Çıkmak için tekrar geri bas');
  });
}
function tamponYenile() {
  try { if (!history.state || !history.state.tampon) history.pushState({ tampon: 1 }, ''); } catch (e) {}
}

// ---------- Ertele (resize vb.) ----------
function ertele(f, ms) {
  let z = null;
  return function () { clearTimeout(z); z = setTimeout(f, ms); };
}
