// =====================================================
// ÖĞREN EKLERİ (2.10+): perde adlarının kökeni, perde ezberleme araçları, koma dairesi,
// makam karşılaştırma, genel kültür (formlar), kaynaklar ve lisanslar
// =====================================================
'use strict';

// ---------- Perde adlarının kökeni ----------
const KOKEN_KARTLARI = [
  { baslik: '“gâh” = yer', metin: '<p>Farsça <b>gâh</b> “yer” demektir. Önündeki sayı, perdenin Rast’tan sayınca kaçıncı yerde olduğunu söyler:</p>' +
    '<p><b>Dü</b>gâh (dü = 2) · <b>Se</b>gâh (se = 3) · <b>Çar</b>gâh (çâr = 4)</p><p>Rast’ı 1. yer sayarsan Dügâh 2., Segâh 3., Çargâh 4. perdedir.</p>' },
  { baslik: 'Rast ve Neva', metin: '<p><b>Rast</b> Farsçada “doğru, düz” demektir; perde sisteminin başlangıç perdesidir.</p><p><b>Neva</b> Farsçada “ses, nağme” anlamına gelir.</p>' },
  { baslik: 'Yer adı taşıyan perdeler', metin: '<p>Bazı perdeler bölge adı taşır: <b>Hicaz</b>, <b>Irak</b>, <b>Acem</b> (İran), <b>Isfahan</b>. <b>Hüseyni</b> de bir kişi adından gelir.</p>' +
    '<p>Bu adları bir haritaya yerleştirmek ezberlemeyi kolaylaştırır: Hicaz Arabistan’da, Irak ve Acem doğuda.</p>' },
  { baslik: 'Nim, Dik, Kaba, Tiz', metin: '<p><b>Nim</b> Farsça “yarım”: Nim Hicaz, Hicaz’dan biraz pesttir.</p><p><b>Dik</b>: aynı adlı perdenin biraz tizi (Dik Hicaz).</p>' +
    '<p><b>Kaba</b>: bir oktav pest (Kaba Çargâh). <b>Tiz</b>: bir oktav tiz (Tiz Çargâh).</p>' },
  { baslik: 'Bûselik, Gerdâniye, Muhayyer', metin: '<p><b>Bûselik</b> adının, rivayete göre Ebû Selik adlı bir mûsikişinastan geldiği söylenir.</p>' +
    '<p><b>Muhayyer</b> Arapça kökenli bir kelimedir; “seçilmiş, seçime bırakılmış” anlamına gelir.</p>' +
    '<p class="soluk">Kökenler hafızaya yardım içindir; bazıları rivayettir, kesin tarih değildir.</p>' }
];

// ---------- Günün 5 perdesi (her gün aynı 5 perde; tarihten üretilir) ----------
function gununPerdeleri() {
  const L = PERDELER.filter(function (p) { return p && !p.tam; });
  let t = 0; const g = bugun(); for (let i = 0; i < g.length; i++) t = (t * 31 + g.charCodeAt(i)) % 100003;
  const secilen = [];
  for (let i = 0; secilen.length < 5 && i < 50; i++) { const p = L[(t + i * 7) % L.length]; if (secilen.indexOf(p) < 0) secilen.push(p); }
  return secilen;
}
function gununPerdeleriBaslat() {
  const L = gununPerdeleri();
  const kartlar = L.map(function (p) {
    return { baslik: p.ad, cizim: function () { return hkPerdeKarti(p, null) || h('div'); },
      metin: '<p><b>' + p.ad + '</b> = ' + kacis(perdeYazimMetni(p)) + '</p><p class="soluk">' + kacis(perdeKural(p)) + '</p>' + (cagrisimOku(p.ad) ? '<p>💭 ' + kacis(cagrisimOku(p.ad)) + '</p>' : '') };
  });
  dersGoster('🗓️ Günün 5 perdesi', kartlar, function () {
    const sorular = karistir(L).map(function (p) { return perdeOgeSorusu(p.oge); });
    turBaslat({ tip: 'deneme', sorular: sorular, kalp: 0, joker: false, kayit: true, etiket: '🗓️ Hız turu', sure: 10,
      bitince: function (r) {
        DURUM.gunun = DURUM.gunun || {}; DURUM.gunun[bugun()] = r.dogru; kaydet();
        modalAc(h('div', { class: 'sonuc' }, h('div', { class: 'sonucMaskot', html: bulbulSVG('mutlu') }), h('h2', null, '🗓️ Günün perdeleri'),
          h('p', null, r.dogru + ' / ' + r.toplam + ' doğru'), h('p', { class: 'kucukNot' }, 'Yarın yeni 5 perde.'),
          dugme('Tamam', function () { modalKapat(); turdanCik(false); }, 'gri')), { kapatilamaz: true });
      } });
  }, 'Hız turuna geç →', true);
}
// Eşleştirme: perde adı ↔ yazım (süresiz)
function perdeEslestirBaslat() {
  const sor = function () {
    const L = karistir(PERDELER.filter(function (p) { return p && !p.tam; })).slice(0, 4);
    return { oge: L[0].oge, tip: 'sinif', soru: { metin: 'Her perdeyi yazımıyla eşleştir', kucuk: true },
      sinif: { kutular: karistir(L).map(function (p) { return { key: p.id, metin: p.parcalar.map(notaKisa).join(' = ') }; }), ogeler: L.map(function (p) { return { key: p.id, metin: p.ad, dogru: p.id }; }) },
      dogruMetin: L.map(function (p) { return p.ad; }).join(', '), aciklama: L.map(function (p) { return '<b>' + p.ad + '</b> = ' + kacis(perdeYazimMetni(p)); }).join('<br>') };
  };
  turBaslat({ tip: 'deneme', sorular: [sor(), sor(), sor(), sor(), sor()], kalp: 0, joker: false, kayit: false, etiket: '🧩 Eşleştir',
    bitince: function (r) {
      modalAc(h('div', { class: 'sonuc' }, h('h2', null, '🧩 Eşleştirme'), h('p', null, r.dogru + ' / ' + r.toplam + ' tur hatasız'),
        dugme('Bir daha', function () { modalKapat(); perdeEslestirBaslat(); }), dugme('Tamam', function () { modalKapat(); turdanCik(false); }, 'gri')), { kapatilamaz: true });
    } });
}
// Kendi çağrışımın: her perdeye oyuncunun kendi notu (yalnız bu cihazda)
function cagrisimOku(ad) { return (DURUM.cagrisim || {})[ad] || ''; }
function cagrisimSayfasi() {
  DURUM.cagrisim = DURUM.cagrisim || {};
  const liste = h('div', { class: 'cgListe' });
  PERDELER.filter(function (p) { return p && !p.tam; }).forEach(function (p) {
    const g = h('input', { type: 'text', class: 'cgGiris', value: cagrisimOku(p.ad), placeholder: 'kendi çağrışımın…', maxlength: 80, 'aria-label': p.ad + ' çağrışımı' });
    g.addEventListener('change', function () { const v = g.value.trim(); if (v) DURUM.cagrisim[p.ad] = v; else delete DURUM.cagrisim[p.ad]; kaydet(); });
    liste.appendChild(h('label', { class: 'cgSatir' }, h('b', null, p.ad), h('small', null, p.parcalar.map(notaKisa).join(' = ')), g));
  });
  modalAc(h('div', null, h('h2', null, '💭 Kendi çağrışımın'),
    h('p', { class: 'kucukNot' }, 'Her perde için aklında kalacak bir şey yaz: bir şarkı, bir kelime, bir benzetme. Notların yalnız bu cihazda saklanır; Günün 5 perdesi kartlarında görünür.'),
    liste, dugme('Kapat', modalKapat, 'gri')), { genis: true });
}
const EZBER_KARTLARI = [
  { baslik: 'Perde ezberleme araçları', cizim: function () {
      return h('div', { class: 'ezberAraclar' },
        dugme('🗓️ Günün 5 perdesi', function () { dersKapatVe(gununPerdeleriBaslat); }),
        dugme('🧩 Eşleştir: ad ↔ yazım', function () { dersKapatVe(perdeEslestirBaslat); }, 'ikincil'),
        dugme('💭 Kendi çağrışımın', cagrisimSayfasi, 'ikincil'));
    },
    metin: '<p><b>Günün 5 perdesi</b>: her gün aynı beş perde; önce kartları, sonra kısa bir hız turu.</p><p><b>Eşleştir</b>: dört perdeyi yazımlarıyla eşleştir.</p><p><b>Kendi çağrışımın</b>: her perdeye kendi notunu yaz.</p>' }
];
function dersKapatVe(f) { try { DERS = null; } catch (e) {} f(); }

// ---------- Koma dairesi ----------
// Bir oktavın 53 koması çember üzerinde; seçilen makamın dizisi işaretlenir, aralıklar çember üstünde okunur
function komaDairesiSVG(m) {
  const R0 = PERDE['Rast'].koma, W = 300, C = 150, R = 98;
  const svg = svgEl('svg', { class: 'komaDaire', viewBox: '0 0 ' + W + ' ' + W, role: 'img' });
  svg.appendChild(svgEl('circle', { cx: C, cy: C, r: R, class: 'kdCember' }));
  const aci = function (k) { return ((k - R0) / 53) * 2 * Math.PI - Math.PI / 2; };
  const nok = function (k, r) { const a = aci(k); return [C + r * Math.cos(a), C + r * Math.sin(a)]; };
  for (let k = 0; k < 53; k++) { const a = nok(R0 + k, R - 4), b = nok(R0 + k, R + 4); svg.appendChild(svgEl('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: 'kdTik' })); }
  // dizinin sesleri: çember üzerinde konum (53'e göre) ve kesintisiz koma (aralık yazmak için)
  const k0 = m && m.dizi ? komaOf(m.dizi[0]) : 0, taban = ((k0 - R0) % 53 + 53) % 53 + R0;
  const acik = m && m.dizi ? m.dizi.map(function (n) { return taban + komaOf(n) - k0; }) : [];
  const diziKoma = acik.map(function (k) { return ((k - R0) % 53 + 53) % 53 + R0; });
  if (acik.length) {
    const pts = acik.map(function (k) { return nok(k, R).join(','); }).join(' ');
    svg.appendChild(svgEl('polygon', { points: pts, class: 'kdCokgen' }));
  }
  PERDELER.forEach(function (p) {
    if (!p || p.koma < R0 || p.koma >= R0 + 53) return;
    const secili = diziKoma.indexOf(p.koma) >= 0;
    if (!p.tam && !secili) return;
    const q = nok(p.koma, R), t = nok(p.koma, R + 22);
    svg.appendChild(svgEl('circle', { cx: q[0], cy: q[1], r: secili ? 6 : 4, class: 'kdNokta' + (secili ? ' secili' : '') + (p.tam ? ' tam' : '') }));
    const yz = svgEl('text', { x: t[0], y: t[1] + 4, 'text-anchor': 'middle', class: 'kdAd' + (secili ? ' secili' : '') });
    yz.textContent = p.ad.replace('Gerdâniye', 'Gerd.');
    svg.appendChild(yz);
  });
  for (let i = 1; i < acik.length; i++) {
    const fark = acik[i] - acik[i - 1], orta = nok((acik[i] + acik[i - 1]) / 2, R - 20);
    const t = svgEl('text', { x: orta[0], y: orta[1] + 4, 'text-anchor': 'middle', class: 'kdAralik' });
    t.textContent = ARALIK_HARF[fark] || fark; svg.appendChild(t);
  }
  const o = svgEl('text', { x: C, y: C + 5, 'text-anchor': 'middle', class: 'kdOrta' });
  o.textContent = m ? m.ad : '53 koma'; svg.appendChild(o);
  return svg;
}
function komaDairesiKarti() {
  return { baslik: 'Koma dairesi', cizim: function () {
    const kap = h('div', { class: 'kdKap' });
    let secili = null;
    const ciz = function () {
      bosalt(kap);
      kap.appendChild(komaDairesiSVG(secili));
      const cip = h('div', { class: 'hbCipler' });
      [null].concat(MAKAMLAR.filter(function (m) { return m.dizi; })).forEach(function (m) {
        cip.appendChild(h('button', { type: 'button', class: 'cip' + (m === secili ? ' aktif' : ''), onclick: function () { secili = m; ciz(); } }, m ? m.ad : 'Boş'));
      });
      kap.appendChild(cip);
    };
    ciz();
    return kap;
  }, metin: '<p>Bir oktav 53 komadır; bu çember onu gösterir. Bir makam seç: dizisinin perdeleri işaretlenir, aralarına aralık harfleri (T, K, S, B, A) yazılır.</p><p>Aynı şekil çember üstünde döndürülünce makam <b>göçürülmüş</b> olur: aralıklar aynı kalır, perdeler değişir.</p>' };
}

// ---------- Makam karşılaştırma ----------
const KARSILASTIR = [['ussak', 'kurdi'], ['ussak', 'huseyni'], ['hicaz', 'humayun'], ['hicaz', 'uzzal'], ['uzzal', 'zirguleli'], ['rast', 'suzinak'], ['ussak', 'karcigar']];
function karsilastirKarti(c) {
  const a = MAKAM[c[0]], b = MAKAM[c[1]];
  if (!a || !b || !a.dizi || !b.dizi) return null;
  const fark = [];
  if (a.altAd !== b.altAd) fark.push('alt çeşnide (' + a.altAd + ' / ' + b.altAd + ')');
  if (a.ustAd !== b.ustAd) fark.push('üst çeşnide (' + a.ustAd + ' / ' + b.ustAd + ')');
  if (a.guclu !== b.guclu) fark.push('güçlüde (' + a.guclu + ' / ' + b.guclu + ')');
  return { baslik: a.ad + ' – ' + b.ad, cizim: function () {
      return h('div', null, h('div', { class: 'kartPorte' }, h('small', null, a.ad), porteSVG(makamDiziPorte(a))), h('div', { class: 'kartPorte' }, h('small', null, b.ad), porteSVG(makamDiziPorte(b))));
    },
    metin: '<p>Karar: ' + (a.karar === b.karar ? '<b>' + a.karar + '</b> (ikisinde de)' : a.ad + ' ' + a.karar + ', ' + b.ad + ' ' + b.karar) + '.</p>' +
      '<p>Ayrıldıkları yer: ' + (fark.length ? fark.join('; ') : 'dizi ve güçlü aynı') + '.</p>' +
      '<p>Seyir: ' + a.ad + ' ' + (a.seyir || '?') + ', ' + b.ad + ' ' + (b.seyir || '?') + '.</p>' };
}

// ---------- Genel kültür: Formlar ----------
const FORM_KARTLARI = [
  { baslik: 'Peşrev', metin: '<p>Saz eseri. Genellikle dört <b>hane</b> ve her haneden sonra tekrarlanan <b>teslim</b>den oluşur. Çoğunlukla büyük usullerle (Devr-i Kebîr, Muhammes, Fahte gibi) yazılır.</p><p>Fasıl, makamı tanıtan taksimden sonra peşrevle açılır.</p>',
    deneme: { soru: 'Peşrevde her haneden sonra tekrarlanan bölüme ne denir?', siklar: ['Teslim', 'Meyan', 'Zemin'], dogru: 'Teslim', aciklama: 'Peşrev ve saz semaisinde haneler arasında tekrarlanan bölüm teslimdir.' } },
  { baslik: 'Saz semaisi', metin: '<p>Peşrev gibi hane ve teslimlerden kurulan saz eseri. İlk üç hane ve teslim çoğunlukla <b>Aksak Semai</b> (10 zaman) ile yazılır; son hane sıklıkla farklı bir usulde, daha hareketlidir.</p><p>Faslı kapatan eserdir.</p>',
    deneme: { soru: 'Saz semaisinin ilk haneleri çoğunlukla hangi usulle yazılır?', siklar: ['Aksak Semai', 'Sofyan', 'Düyek'], dogru: 'Aksak Semai', aciklama: 'Saz semaisi adını Aksak Semai usulünden alır.' } },
  { baslik: 'Kâr', metin: '<p>Sözlü eserlerin en büyük ve en gösterişli formu. Uzun <b>terennüm</b> bölümleri (anlamsız hecelerle söylenen kısımlar) içerir; çoğunlukla büyük usullerle bestelenir.</p>' },
  { baslik: 'Beste ve semai', metin: '<p><b>Beste</b>: dört haneli, büyük usulle bestelenen sözlü eser; fasılda peşrevden sonra okunur.</p><p><b>Ağır semai</b> (Aksak Semai usulü) ve <b>yürük semai</b> (Yürük Semai usulü) de fasılın sözlü eserleridir.</p>' },
  { baslik: 'Şarkı', metin: '<p>Küçük usullerle bestelenen, en yaygın sözlü form. Sık görülen yapısı: <b>zemin</b> (ilk bölüm), <b>nakarat</b> (tekrarlanan bölüm), <b>meyan</b> (makamın farklı bölgesine geçilen bölüm).</p>',
    deneme: { soru: 'Şarkıda makamın başka bir bölgesine geçilen bölüme ne denir?', siklar: ['Meyan', 'Teslim', 'Terennüm'], dogru: 'Meyan', aciklama: 'Zemin, nakarat ve meyan şarkının bölümleridir; meyanda farklı bir bölgeye geçilir.' } },
  { baslik: 'Âyin', metin: '<p>Mevlevî âyini, dört <b>selam</b>dan oluşan büyük dinî formdur. Na’t ve ney taksiminden sonra peşrevle başlar; selamlardan sonra son peşrev ve son yürük semai ile biter.</p>' },
  { baslik: 'Fasıl sırası', metin: '<p>Klasik fasılda eserler aynı makamda, belli bir sırayla okunur:</p><p>Taksim → Peşrev → Kâr → Beste → Ağır semai → Şarkılar → Yürük semai → Saz semaisi</p>',
    deneme: { soru: 'Klasik fasıl hangi eserle kapanır?', siklar: ['Saz semaisi', 'Peşrev', 'Beste'], dogru: 'Saz semaisi', aciklama: 'Fasıl peşrevle açılır, saz semaisiyle kapanır.' } }
];

// ---------- Araçlar (Öğren → Araçlar) ----------
// Ders sırasına girmeyen, istendiğinde açılan araçlar; ilerleme sayacını etkilemez
function aracModal(baslik, govde, alt) {
  modalAc(h('div', { class: 'aracModal' }, h('h2', null, baslik), govde, alt || null, dugme('Kapat', modalKapat, 'gri')), { genis: true });
}
function perdeEzberAraci() {
  aracModal('🧠 Perde ezber', h('div', { class: 'ezberAraclar' },
    dugme('🗓️ Günün 5 perdesi', function () { modalKapat(); gununPerdeleriBaslat(); }),
    dugme('🧩 Eşleştir: ad ↔ yazım', function () { modalKapat(); perdeEslestirBaslat(); }, 'ikincil'),
    dugme('💭 Kendi çağrışımın', cagrisimSayfasi, 'ikincil'),
    dugme('🗺️ Perde adlarının kökeni', function () { modalKapat(); dersGoster('🗺️ Perde adlarının kökeni', KOKEN_KARTLARI, function () { ekranAc('ekranAna'); sekmeAc('ogren'); }, 'Bitir'); }, 'ikincil')),
    h('p', { class: 'kucukNot' }, 'Günün 5 perdesi her gün değişir: önce kartlar, sonra kısa bir hız turu. Çağrışımların yalnız bu cihazda saklanır.'));
}
function komaDairesiAraci() {
  const k = komaDairesiKarti();
  aracModal('⭕ Koma dairesi', k.cizim(), h('div', { class: 'kucukNot', html: k.metin }));
}
function perdeBulAraci() {
  const sonuc = h('div', { class: 'pbSonuc' });
  const goster = function (p) {
    bosalt(sonuc);
    sonuc.appendChild(h('div', { class: 'pbBaslik' }, h('b', null, p.ad), ' = ' + perdeYazimMetni(p)));
    const kart = p.tam ? null : hkPerdeKarti(p, null);
    if (kart) sonuc.appendChild(kart);
    sonuc.appendChild(h('p', { class: 'kucukNot' }, perdeKural(p)));
    if (cagrisimOku(p.ad)) sonuc.appendChild(h('p', { class: 'kucukNot' }, '💭 ' + cagrisimOku(p.ad)));
  };
  const izgara = h('div', { class: 'pbIzgara' });
  PERDELER.filter(Boolean).forEach(function (p) {
    izgara.appendChild(h('button', { type: 'button', class: 'cip' + (p.tam ? ' tam' : ''), onclick: function () { goster(p); sonuc.scrollIntoView({ block: 'nearest' }); } }, p.ad));
  });
  goster(PERDE['Segâh']);
  aracModal('🪜 Perde bul', h('div', null, sonuc, h('p', { class: 'kucukNot' }, 'Bir perdeye dokun:'), izgara));
}
function makamKarsilastirAraci() {
  const L = MAKAMLAR.filter(function (m) { return m.dizi; });
  const sec = function (varsayilan) {
    const s = h('select', { class: 'mkSec' });
    L.forEach(function (m) { const o = h('option', { value: m.id }, m.ad); if (m.id === varsayilan) o.selected = true; s.appendChild(o); });
    return s;
  };
  const a = sec('ussak'), b = sec('kurdi'), alan = h('div');
  const ciz = function () {
    const k = karsilastirKarti([a.value, b.value]);
    bosalt(alan);
    if (a.value === b.value) { alan.appendChild(h('p', { class: 'kucukNot' }, 'İki farklı makam seç.')); return; }
    alan.appendChild(k.cizim()); alan.appendChild(h('div', { class: 'metinSayfa', html: k.metin }));
  };
  a.onchange = ciz; b.onchange = ciz; ciz();
  aracModal('⚖️ Makam karşılaştır', h('div', null, h('div', { class: 'mkSecSatir' }, a, h('span', null, '↔'), b), alan));
}
function formlarAc() { dersGoster('📜 Formlar', FORM_KARTLARI, function () { ekranAc('ekranAna'); sekmeAc('ogren'); }, 'Bitir'); }

// ---------- Kaynaklar ve lisanslar ----------
function kaynaklarSayfasi() {
  sayfa('📚 Kaynaklar ve lisanslar', h('div', { class: 'metinSayfa', html:
    '<h3>Kuram</h3><ul>' +
    '<li>Arel-Ezgi-Uzdilek (AEU) sistemi: 53 koma, perde adları ve değiştirme işaretleri.</li>' +
    '<li>H. Sadettin Arel, <i>Türk Mûsikîsi Nazariyatı Dersleri</i>.</li>' +
    '<li>Suphi Ezgi, <i>Nazarî-Amelî Türk Mûsikîsi</i>.</li>' +
    '<li>İsmail Hakkı Özkan, <i>Türk Mûsikîsi Nazariyatı ve Usûlleri: Kudüm Velveleleri</i>.</li>' +
    '<li>TDV İslâm Ansiklopedisi makam ve usul maddeleri.</li>' +
    '<li>MEB müzik okulları Türk müziği nazariyatı programı.</li>' +
    '<li>Usul sayfaları: Adana Musiki Derneği.</li>' +
    '<li>Perde sıklıkları: SymbTr derlemi (CompMusic).</li></ul>' +
    '<h3>Yazı tipleri</h3><ul>' +
    '<li>Nota simgeleri: <b>Bravura</b> (Steinberg), SIL Open Font License.</li>' +
    '<li><b>Nunito</b> ve <b>Baloo 2</b>, SIL Open Font License.</li></ul>' +
    '<h3>Sesler</h3><ul>' +
    '<li>Bendir vuruşları: Freesound #140548 “aksaksemai_bendir” (barisbozkurt), çalan Eren Ergen; CompMusic projesi (Universitat Pompeu Fabra) kaydı.</li></ul>' +
    '<p class="kucukNot">Uygulamadaki bilgiler bu kaynaklara dayanır; bir hata görürsen Profil’deki geri bildirim bağlantısından yaz.</p>' }));
}

// Temel bilgilerin ders sırası (perde merdivenleri perdelerden hemen sonra)
(function () {
  const sira = ['nota', 'oktav', 'aralik', 'isaret', 'perde', 'merdiven', 'usul', 'cesni', 'gocurme', 'makam', 'ahenk', 'tartim'];
  OGREN_MODULLERI.sort(function (a, b) { const x = sira.indexOf(a.id), y = sira.indexOf(b.id); return (x < 0 ? 99 : x) - (y < 0 ? 99 : y); });
})();
