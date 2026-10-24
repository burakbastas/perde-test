// =====================================================
// ÖĞREN: sıfırdan başlayanlar için modüller + sözlük
// =====================================================
'use strict';

const SOZLUK = [
  { k: 'porte', ad: 'Porte', t: 'Notaların yazıldığı beş paralel çizgi. Notalar çizgilerin üstüne ya da aralarına yazılır.' },
  { k: 'oktav', ad: 'Oktav', t: 'Bir sesin aynı adlı tiz ya da pest karşılığına kadar olan uzaklık (ör. Rast – Gerdâniye). Türk müziğinde 53 komadır.' },
  { k: 'pest', ad: 'Pest', t: 'Kalın, aşağıdaki ses. Bemol sesi pestleştirir.' },
  { k: 'tiz', ad: 'Tiz', t: 'İnce, yukarıdaki ses. Diyez sesi tizleştirir. Perde adlarında “Tiz” öneki bir oktav yukarısı demektir.' },
  { k: 'aralık', ad: 'Aralık', t: 'İki ses arasındaki uzaklık. Türk müziğinde koma ile ölçülür.' },
  { k: 'koma', ad: 'Koma', t: 'Türk müziğinde aralık ölçüsü. Bir tanini 9 koma, bir oktav 53 komadır. Simge harfi F.' },
  { k: 'bakiye', ad: 'Bakiye', t: '4 komalık aralık. Simge harfi B. Mi–Fa ve Si–Do arası bakiyedir.' },
  { k: 'küçük mücenneb', ad: 'Küçük mücenneb', t: '5 komalık aralık. Simge harfi S.' },
  { k: 'büyük mücenneb', ad: 'Büyük mücenneb', t: '8 komalık aralık. Simge harfi K.' },
  { k: 'tanini', ad: 'Tanini', t: '9 komalık aralık, yani tam ses. Simge harfi T.' },
  { k: 'artık ikili', ad: 'Artık ikili', t: '12 ya da 13 komalık aralık. Simge harfi A. Hicaz çeşnisinin karakteristik aralığı.' },
  { k: 'diyez', ad: 'Diyez', t: 'Sesi tizleştiren değiştirme işareti. AEU sisteminde koma, bakiye, küçük ve büyük mücenneb diyezleri vardır.' },
  { k: 'bemol', ad: 'Bemol', t: 'Sesi pestleştiren değiştirme işareti. AEU sisteminde dört çeşit bemol vardır.' },
  { k: 'perde', ad: 'Perde', t: 'Türk müziğinde bir sesin adı (Rast, Dügâh, Segâh…). Bir oktavda 24 perde vardır.' },
  { k: 'dörtlü', ad: 'Dörtlü', t: 'Art arda dört sesten (üç aralıktan) oluşan dizi parçası: Çargâh, Bûselik, Kürdi, Rast, Uşşak, Hicaz…' },
  { k: 'beşli', ad: 'Beşli', t: 'Art arda beş sesten (dört aralıktan) oluşan dizi parçası. Temel beşliler, dörtlüye bir tanini eklenerek bulunur.' },
  { k: 'çeşni', ad: 'Çeşni', t: 'Bir dörtlü ya da beşlinin melodik rengi; makamların yapı taşı.' },
  { k: 'makam', ad: 'Makam', t: 'Bir dizi, karar, güçlü, yeden ve seyir kurallarıyla belirlenen ezgi düzeni.' },
  { k: 'karar', ad: 'Karar', t: 'Makamın durduğu, bittiği perde (durak).' },
  { k: 'güçlü', ad: 'Güçlü', t: 'Makam dizisinde iki parçanın birleştiği, kararın ardından en önemli perde.' },
  { k: 'yeden', ad: 'Yeden', t: 'Kararın hemen altındaki, karara çeken ses.' },
  { k: 'donanım', ad: 'Donanım', t: 'Dizide sürekli kullanılan değiştirme işaretlerinin anahtarın yanına yazılması.' },
  { k: 'seyir', ad: 'Seyir', t: 'Ezginin makam içinde izlediği yol: çıkıcı, inici ya da inici-çıkıcı.' },
  { k: 'göçürme', ad: 'Göçürme', t: 'Bir dörtlüyü, beşliyi ya da makam dizisini aralıklarını bozmadan başka bir perdeye taşımak.' },
  { k: 'şed', ad: 'Şed', t: 'Başka bir perdeye göçürülmüş makam.' },
  { k: 'arel-ezgi-uzdilek', ad: 'Arel-Ezgi-Uzdilek (AEU)', t: 'Türk müziği eğitiminde kullanılan, 24 perdelik ses sistemi ve işaretler.' }
];
const SOZLUK_IDX = {};
SOZLUK.forEach(function (x) { SOZLUK_IDX[x.k] = x; });

function terimle(html) { return html; }   // geri uyumluluk
// Bir elemanın metin düğümlerinde terimlerin ilk geçişini dokunulabilir yapar
function terimBagla(el) {
  if (!el) return el;
  const gorulen = {};
  const terimler = SOZLUK.map(function (x) { return x.k; }).sort(function (a, b) { return b.length - a.length; });
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
  const dugumler = [];
  while (walker.nextNode()) dugumler.push(walker.currentNode);
  const harf = /[a-zçğıöşüâîûA-ZÇĞİÖŞÜÂÎÛ]/;
  dugumler.forEach(function (d) {
    if (d.parentNode && d.parentNode.closest && d.parentNode.closest('.terim, button, svg')) return;
    let dugum = d;
    for (let tur = 0; tur < 12 && dugum && dugum.nodeValue; tur++) {
      const metin = dugum.nodeValue, kucuk = metin.toLocaleLowerCase('tr');
      let en = -1, enT = null;
      terimler.forEach(function (t) {
        if (gorulen[t]) return;
        let ara = 0, poz;
        while ((poz = kucuk.indexOf(t, ara)) >= 0) {
          if (poz === 0 || !harf.test(metin[poz - 1])) { if (en < 0 || poz < en) { en = poz; enT = t; } break; }
          ara = poz + 1;
        }
      });
      if (en < 0) break;
      let son = en + enT.length;
      while (son < metin.length && (harf.test(metin[son]) || metin[son] === '’' || metin[son] === "'")) son++;
      const sag = dugum.splitText(en);
      const kalan = sag.splitText(son - en);
      const span = h('span', { class: 'terim', 'data-t': enT }, sag.nodeValue);
      sag.parentNode.replaceChild(span, sag);
      gorulen[enT] = true;
      dugum = kalan;
    }
  });
  return el;
}
document.addEventListener('click', function (e) {
  const t = e.target.closest && e.target.closest('.terim');
  if (!t) return;
  const x = SOZLUK_IDX[t.getAttribute('data-t')];
  if (!x) return;
  e.stopPropagation();
  terimBalonu(t, x);
});
function terimBalonu(hedef, x) {
  const eski = document.querySelector('.terimBalon');
  if (eski) eski.remove();
  const b = h('div', { class: 'terimBalon', role: 'dialog' }, h('b', null, x.ad), h('p', null, x.t), h('small', null, 'Kapatmak için dokun'));
  document.body.appendChild(b);
  const r = hedef.getBoundingClientRect();
  const w = Math.min(300, window.innerWidth - 24);
  b.style.width = w + 'px';
  b.style.left = Math.max(12, Math.min(window.innerWidth - w - 12, r.left + r.width / 2 - w / 2)) + 'px';
  const ust = r.bottom + 8 + b.offsetHeight > window.innerHeight ? r.top - b.offsetHeight - 8 : r.bottom + 8;
  b.style.top = Math.max(8, ust) + 'px';
  const kapat = function () { b.remove(); document.removeEventListener('pointerdown', kapat, true); };
  setTimeout(function () { document.addEventListener('pointerdown', kapat, true); }, 0);
}

// ---- Etkileşimli: porteye dokun, notanın adını gör ----
function kesfetPorte() {
  const kap = h('div');
  const ad = h('div', { class: 'kesfetAd' }, 'Porteye dokun');
  let y = null;
  y = yerlestirici({
    slotlar: [{}], palet: null, smin: 28, smax: 42,
    degisince: function () {
      const n = y && y.deger()[0];
      if (!n) return;
      const p = PERDELER.find(function (x) { return x.tam && notaEsit(x.parcalar[0], n); });
      ad.innerHTML = '<b>' + HARF_AD[n.h] + n.o + '</b>' + (p ? ' · perde adı: <b>' + p.ad + '</b>' : '');
    }
  });
  kap.appendChild(y.el);
  kap.appendChild(ad);
  return kap;
}
function aeuIsaretTablosu() {
  const t = h('div', { class: 'isaretTablo' });
  ['k', 'bk', 'km', 'bm'].forEach(function (tur) {
    t.appendChild(h('div', { class: 'isaretSatir' },
      h('span', { class: 'bravura' }, glifStr(ARIZA_GLIF['+' + tur])),
      h('span', { class: 'bravura' }, glifStr(ARIZA_GLIF['-' + tur])),
      h('span', null, TUR_AD[tur] + ' · ' + AEU_KOMA[tur] + ' koma')));
  });
  return t;
}

const OGREN_MODULLERI = [
  { id: 'nota', ikon: '🎼', ad: 'Porte ve notalar', baglanti: 'p1', kartlar: [
    { baslik: 'Porte', cizim: function () { return h('div', { class: 'kartPorte' }, porteSVG({ notalar: [] })); },
      metin: '<p>Müzik, <b>porte</b> denen beş çizginin üzerine yazılır. Notalar çizgilerin <b>üstüne</b> ya da çizgilerin <b>arasına</b> konur.</p><p>Aşağıdan yukarı çıktıkça ses <b>tizleşir</b> (incelir), aşağı indikçe <b>pestleşir</b> (kalınlaşır).</p>' },
    { baslik: 'Sol anahtarı', metin: '<p>Porte başındaki işaret <b>sol anahtarı</b>dır. Kıvrımı <b>ikinci çizgiyi</b> sarar: o çizgideki nota <b>Sol</b>’dür.</p><p>Türk müziğinde Sol, <b>Rast</b> perdesidir.</p>',
      deneme: { soru: 'Sol anahtarı hangi çizgideki notayı Sol yapar?', siklar: ['2. çizgi', '1. çizgi', '3. çizgi'], dogru: '2. çizgi', aciklama: 'Anahtarın kıvrımı alttan ikinci çizgiyi sarar.' } },
    { baslik: 'Yedi nota', cizim: function () { return h('div', { class: 'kartPorte' }, porteSVG({ notalar: [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) { return { h: i % 7, o: 4 + Math.floor(i / 7) }; }), aralik: 30, etiketler: ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si', 'Do'] })); },
      metin: '<p>Yedi nota adı vardır: <b>Do Re Mi Fa Sol La Si</b>. Sonra yine Do gelir, bir üst katta.</p><p>Porte üzerinde her adım bir çizgiden aralığa ya da aralıktan çizgiye geçer.</p>' },
    { baslik: 'Dokun ve keşfet', cizim: kesfetPorte, metin: '<p>Porteye dokun, parmağını kaydır: notanın adı ve varsa Türk müziğindeki perde adı yazılır.</p>' }
  ] },
  { id: 'oktav', ikon: '↕️', ad: 'Oktav, pest ve tiz', baglanti: 'p1', kartlar: [
    { baslik: 'Oktav', cizim: function () { return h('div', { class: 'kartPorte' }, porteSVG({ notalar: [{ h: 4, o: 4 }, { h: 4, o: 5 }], aralik: 60, etiketler: ['Rast', 'Gerdâniye'] })); },
      metin: '<p>Aynı adlı iki notanın arasındaki uzaklık <b>oktav</b>dır. Batı’da ikisi de Sol; Türk müziğinde pestteki <b>Rast</b>, tizdeki <b>Gerdâniye</b> adını alır.</p>' },
    { baslik: 'Ek çizgiler', cizim: function () { return h('div', { class: 'kartPorte' }, porteSVG({ notalar: [{ h: 0, o: 4 }, { h: 1, o: 4 }, { h: 5, o: 5 }, { h: 0, o: 6 }], aralik: 44, etiketler: ['Do4', 'Re4', 'La5', 'Do6'] })); },
      metin: '<p>Porteye sığmayan notalar için kısa <b>ek çizgiler</b> çizilir. Alttaki Do, bir ek çizgi üzerindedir.</p>' },
    { baslik: 'Kaba ve Tiz', metin: '<p>Perde adlarında <b>Kaba</b> bir oktav pest, <b>Tiz</b> bir oktav tiz demektir: Çargâh → <b>Kaba Çargâh</b> ve <b>Tiz Çargâh</b>.</p>',
      deneme: { soru: 'Tiz Bûselik, Bûselik’e göre nerede?', siklar: ['Bir oktav tizde', 'Bir oktav pestte', 'Aynı yerde'], dogru: 'Bir oktav tizde', aciklama: 'Tiz öneki bir oktav yukarısı demektir.' } }
  ] },
  { id: 'aralik', ikon: '📏', ad: 'Aralık, tanini ve koma', baglanti: 'km1', kartlar: [
    { baslik: 'Aralık', metin: '<p>İki ses arasındaki uzaklığa <b>aralık</b> denir. Batı müziğinde aralıklar <b>tam ses</b> ve <b>yarım ses</b> ile ölçülür.</p><p>Türk müziği daha ince bölümler kullanır, çünkü Batı’da olmayan sesler vardır.</p>' },
    { baslik: 'Tanini = 9 koma', cizim: komaCetveliSVG, metin: '<p>Türk müziğinde tam sese <b>tanini</b> denir ve <b>9 komaya</b> bölünür. Bir oktav <b>53 koma</b> eder.</p><p>Bu 9 komalık yolun 1, 4, 5 ve 8. adımlarında ara perdeler bulunur.</p>',
      deneme: { soru: 'Bir tanini kaç komadır?', siklar: ['9', '4', '12'], dogru: '9', aciklama: 'Tanini = 9 koma, simgesi T.' } },
    { baslik: 'Aralıkların adları', metin: '<p><b>Koma</b> 1 · <b>Bakiye</b> 4 · <b>Küçük mücenneb</b> 5 · <b>Büyük mücenneb</b> 8 · <b>Tanini</b> 9 · <b>Artık ikili</b> 12–13</p><p>Simge harfleri: F, B, S, K, T, A.</p>' }
  ] },
  { id: 'isaret', ikon: '♯', ad: 'Diyez ve bemol', baglanti: 'km2', kartlar: [
    { baslik: 'Değiştirme işaretleri', metin: '<p>Bir notanın önüne konan işaret onun sesini değiştirir: <b>diyez</b> tizleştirir, <b>bemol</b> pestleştirir.</p><p>Batı’da sadece yarım ses değiştiren işaretler vardır. Türk müziğinde ne kadar değiştiğini gösteren <b>dört çeşit</b> diyez ve bemol bulunur.</p>' },
    { baslik: 'AEU’nun 8 işareti', cizim: aeuIsaretTablosu, metin: '<p>Soldaki diyez, sağdaki bemol. Her satır bir aralık: koma, bakiye, küçük mücenneb, büyük mücenneb.</p>',
      deneme: { soru: 'Bakiye diyezi sesi kaç koma tizleştirir?', siklar: ['4', '1', '5', '8'], dogru: '4', aciklama: 'Bakiye 4 komadır.' } }
  ] },
  { id: 'perde', ikon: '🎶', ad: 'Perdeler ve isimleri', baglanti: 'p2', kartlar: [
    { baslik: '24 perde', metin: '<p>Türk müziğinde bir oktavda <b>24 perde</b> vardır. Tam seslerin adları (Rast, Dügâh, Bûselik…) ile aralarındaki ara perdelerin adları (Segâh, Hicaz, Evç…) ayrı ayrı öğrenilir.</p>' },
    { baslik: 'İsim kuralı', metin: '<p>Çoğu ara perde şu kurala uyar:</p><p><b>Nim</b> + bakiye (4) · <b>yalın ad</b> + küçük mücenneb (5) · <b>Dik</b> + büyük mücenneb (8)</p><p>Örnek: Çargâh → Nim Hicaz → Hicaz → Dik Hicaz → Neva.</p>' },
    { baslik: 'Bir perde, iki yazım', cizim: function () { return h('div', { class: 'kartPorte' }, porteSVG({ notalar: PERDE['Segâh'].parcalar, aralik: 48, etiketler: ['diyezli', 'bemollü'] })); },
      metin: '<p>Ara perdeler hem diyezle hem bemolle yazılabilir. <b>Segâh</b> = La büyük mücenneb diyez = Si koma bemol. Oyunda ikisini birlikte göreceksin.</p>' }
  ] },
  { id: 'cesni', ikon: '🎻', ad: 'Dörtlü, beşli, çeşni', baglanti: 'db1', kartlar: [
    { baslik: 'Küçük yapı taşları', cizim: function () { return h('div', { class: 'kartPorte' }, porteSVG({ notalar: CESNI['d-rast'].notalar, aralik: 40, enAz: 240, etiketler: ['Rast', 'T', 'K', 'S'] })); },
      metin: '<p>Art arda dört sese <b>dörtlü</b>, beş sese <b>beşli</b> denir. Seslerin arasındaki aralıklar harflerle yazılır: Rast dörtlüsü <b>T K S</b>.</p><p>Bu küçük yapılar makamların yapı taşıdır; melodik renklerine <b>çeşni</b> denir.</p>' }
  ] },
  { id: 'makam', ikon: '🏵️', ad: 'Makam nedir?', baglanti: 'mk1', kartlar: [
    { baslik: 'Dizi', cizim: function () { return h('div', { class: 'kartPorte' }, porteSVG(makamDiziPorte(MAKAM.rast))); },
      metin: '<p>Bir makamın <b>dizisi</b>, bir beşli ile bir dörtlünün (ya da tersinin) birleşmesidir. Rast makamı = Rast beşlisi + Neva’da Rast dörtlüsü.</p>' },
    { baslik: 'Karar, güçlü, yeden', metin: '<p><b>Karar</b>: makamın durduğu perde. <b>Güçlü</b>: iki parçanın birleştiği perde. <b>Yeden</b>: kararın hemen altındaki ses.</p><p><b>Donanım</b>: sürekli kullanılan işaretlerin anahtarın yanına yazılması. <b>Seyir</b>: ezginin makam içindeki yolu.</p>',
      deneme: { soru: 'Rast makamının güçlüsü hangi perde?', siklar: ['Neva', 'Dügâh', 'Gerdâniye'], dogru: 'Neva', aciklama: 'Rast beşlisi Neva’da biter, Rast dörtlüsü orada başlar.' } }
  ] },
  { id: 'gocurme', ikon: '🔁', ad: 'Göçürme', baglanti: null, kartlar: null }   // kartları göçürme dersinden alır
];
OGREN_MODULLERI[7].kartlar = gocurmeDersi();
