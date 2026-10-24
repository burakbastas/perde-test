// =====================================================
// ARAYÜZ: ekranlar, sekmeler, Meşk Yolu, Öğren, Tekrar, Koleksiyon, Profil,
// ilk açılış, ayarlar, yedekleme, açıklama sayfaları
// =====================================================
'use strict';

// ---------- Bülbül maskot (özgün çizim) ----------
function bulbulSVG(mod) {
  const goz = mod === 'mutlu'
    ? '<path d="M37 23 q3.5 -4 7 0" stroke="#1d2440" stroke-width="2.4" fill="none" stroke-linecap="round"/>'
    : mod === 'uzgun'
      ? '<circle cx="40.5" cy="24.5" r="2.6" fill="#1d2440"/><path d="M36 19.5 l8 2.2" stroke="#1d2440" stroke-width="2" stroke-linecap="round"/>'
      : '<circle cx="40.5" cy="23.5" r="3" fill="#1d2440"/><circle cx="41.6" cy="22.4" r="1" fill="#fff"/>';
  const gaga = (mod === 'mutlu' || mod === 'anlat')
    ? '<path d="M49.5 23 l10 -4 l-9 7 z" fill="#f2a91f"/><path d="M49.5 26 l9 3.5 l-10 0 z" fill="#d6860c"/>'
    : '<path d="M49.5 23.5 l10 1.5 l-10 4 z" fill="#f2a91f"/>';
  const nota = (mod === 'mutlu' || mod === 'anlat') ? '<text x="54" y="12" font-size="13" fill="#e0533d" font-weight="700">♪</text>' : '';
  const yas = mod === 'uzgun' ? '<path d="M43 29 q-1.5 3 0 4 q1.5 -1 0 -4z" fill="#5fb6e8"/>' : '';
  return '<svg viewBox="0 0 64 64" class="bulbul" aria-hidden="true">' +
    '<path d="M12 41 q-9 5 -8 15 q7 -5 14 -9z" fill="#2348a8"/>' +
    '<path d="M14 44 q-6 6 -3 12 q4 -5 9 -8z" fill="#159a9c"/>' +
    '<ellipse cx="30" cy="39" rx="19" ry="15" fill="#159a9c"/>' +
    '<ellipse cx="34" cy="44" rx="11.5" ry="8.5" fill="#f6e3b4"/>' +
    '<circle cx="40" cy="25" r="11" fill="#159a9c"/>' +
    '<path d="M17 35 q11 -8 20 3 q-9 9 -20 3z" fill="#2348a8"/>' +
    '<path d="M26 37.5 l1.6 -3 l1.6 3 l3 1.6 l-3 1.6 l-1.6 3 l-1.6 -3 l-3 -1.6z" fill="#f2c14e"/>' +
    '<path d="M28 53 l-2 7 M34 53 l1 7" stroke="#d6860c" stroke-width="2.2" stroke-linecap="round"/>' +
    goz + gaga + nota + yas + '</svg>';
}

// ---------- Çini karo (8 köşeli yıldız) ----------
function yildizNoktalar(cx, cy, R) {
  const r = R * 0.7654, L = [];
  for (let k = 0; k < 16; k++) {
    const a = (k * 22.5 - 90) * Math.PI / 180, rr = k % 2 === 0 ? R : r;
    L.push((cx + rr * Math.cos(a)).toFixed(1) + ',' + (cy + rr * Math.sin(a)).toFixed(1));
  }
  return L.join(' ');
}
const KARO_DIS = yildizNoktalar(32, 32, 31), KARO_IC = yildizNoktalar(32, 32, 12);
function karoSVG(durum) {
  return '<svg viewBox="0 0 64 64" class="karo ' + durum + '" aria-hidden="true">' +
    '<polygon points="' + KARO_DIS + '" class="karoDis"/>' +
    '<circle cx="32" cy="32" r="19" class="karoIc"/>' +
    (durum === 'bitti' || durum === 'altin' ? '<polygon points="' + KARO_IC + '" class="karoMotif"/>' : '') +
    '</svg>';
}

// ---------- Ekranlar ----------
function ekranAc(id) {
  document.querySelectorAll('.ekran').forEach(function (e) { e.classList.toggle('acik', e.id === id); });
  tamponYenile();
}
let SEKME = 'yol';
let YOL_FILTRE = null;
function anaEkranaDon() {
  TUR = null;
  ekranAc('ekranAna');
  sekmeAc(SEKME, true);
}

// ---------- Üst bilgi ----------
function ustYaz() {
  $('ustYildiz').textContent = '⭐ ' + cuzdan();
  $('ustSeri').textContent = '🔥 ' + seriGun();
}

// ---------- Sekmeler ----------
function sekmeAc(ad, kaydirma) {
  SEKME = ad;
  document.querySelectorAll('#altMenu button').forEach(function (b) { b.classList.toggle('aktif', b.dataset.sekme === ad); });
  const g = bosalt($('sekme'));
  g.scrollTop = 0;
  ustYaz();
  if (ad === 'yol') yolCiz(g, kaydirma !== false);
  else if (ad === 'ogren') ogrenCiz(g);
  else if (ad === 'tekrar') tekrarCiz(g);
  else if (ad === 'koleksiyon') koleksiyonCiz(g);
  else if (ad === 'profil') profilCiz(g);
  tamponYenile();
}

// =====================================================
// MEŞK YOLU
// =====================================================
function yolCiz(g, kaydir) {
  // Üst şerit: ünvan + görünüm seçici (seçici yapışkan)
  g.appendChild(unvanSeridi());
  const sec = h('div', { class: 'segment' },
    h('button', { class: !YOL_FILTRE ? 'aktif' : '', type: 'button', onclick: function () { YOL_FILTRE = null; sekmeAc('yol'); } }, '🧭 Meşk Yolu'),
    h('button', { class: YOL_FILTRE === 'dallar' ? 'aktif' : (YOL_FILTRE ? 'aktif' : ''), type: 'button', onclick: function () { YOL_FILTRE = 'dallar'; sekmeAc('yol'); } }, '🌿 Dallar'));
  const yapiskan = h('div', { class: 'yapiskan' }, sec);
  g.appendChild(yapiskan);
  if (kurBandiGerekli()) g.appendChild(kurBandi());

  if (YOL_FILTRE === 'dallar') { dallarCiz(g); return; }

  let uniteler;
  if (YOL_FILTRE && DALLAR[YOL_FILTRE]) {
    const d = DALLAR[YOL_FILTRE];
    yapiskan.appendChild(h('div', { class: 'filtreBaslik', style: { '--dal': d.renk } },
      h('button', { class: 'cip', type: 'button', onclick: function () { YOL_FILTRE = 'dallar'; sekmeAc('yol'); } }, '← Dallar'),
      h('b', null, d.ikon + ' ' + d.ad)));
    uniteler = d.uniteler;
  } else {
    uniteler = meskSirasi();
    g.appendChild(h('p', { class: 'yolAciklama' }, 'Önerilen sırayla ilerle; istediğin dala “Dallar”dan da geçebilirsin. Bir dalın içinde ilerlemek için o dalın ünite finallerini 👑 geçmen gerekir.'));
  }
  let hedef = null;
  uniteler.forEach(function (u) {
    const blok = uniteBlok(u);
    g.appendChild(blok);
    if (!hedef && !uniteBitti(u) && u.seviyeler.some(acikMi)) hedef = blok;
  });
  g.appendChild(h('div', { class: 'yolSon' }, h('span', { html: bulbulSVG('mutlu') }), h('p', null, 'Yolun sonu… şimdilik! Yeni üniteler yolda.')));
  if (kaydir && hedef) requestAnimationFrame(function () { g.scrollTop = Math.max(0, hedef.offsetTop - g.offsetTop - 64); });
}

function uniteBlok(u) {
  const d = DALLAR[u.dal];
  const il = uniteIlerleme(u);
  const blok = h('section', { class: 'uniteBlok', style: { '--dal': d.renk }, 'data-unite': u.id });
  const eylem = h('div', { class: 'uniteEylem' });
  if (u.ders) eylem.appendChild(h('button', { class: 'cip', type: 'button', onclick: function () { uniteDersiAc(u); } }, (DURUM.ders[u.id] ? '✓ ' : '📖 ') + 'Ders'));
  const ilkAcik = acikMi(u.seviyeler[0]);
  if (!uniteBitti(u) && ilkAcik) eylem.appendChild(h('button', { class: 'cip', type: 'button', onclick: function () { atlamaSor(u); } }, '⏩ Biliyorum'));
  if (uniteBitti(u)) eylem.appendChild(DURUM.altin[u.id]
    ? h('span', { class: 'cip altin' }, '🏆 Altın')
    : h('button', { class: 'cip', type: 'button', onclick: function () { altinSor(u); } }, '🏆 Altınla'));
  blok.appendChild(h('div', { class: 'uniteBas' + (uniteBitti(u) ? ' bitti' : '') + (DURUM.altin[u.id] ? ' altin' : '') },
    h('div', { class: 'uniteUst' }, h('span', null, d.ikon + ' ' + d.ad + ' · Ünite ' + u.no), h('span', null, il.bitti + '/' + il.toplam)),
    h('h3', null, u.ad),
    h('p', null, u.kisa),
    h('div', { class: 'cubuk' }, h('div', { style: { width: (il.bitti / il.toplam * 100) + '%' } })),
    eylem));

  // Düğümler
  const dugumler = [];
  if (u.ders) dugumler.push({ tur: 'ders' });
  u.seviyeler.forEach(function (s) { dugumler.push({ tur: 'seviye', s: s }); });
  dugumler.push({ tur: 'sandik' });
  const ARA = 96, GEN = 260, ORTA = 130, GENLIK = 62;
  const H = dugumler.length * ARA + 8;
  const alan = h('div', { class: 'dugumAlan', style: { height: H + 'px' } });
  const pts = dugumler.map(function (x, i) { return { x: ORTA + GENLIK * Math.sin(i * 0.95 + u.no), y: 44 + i * ARA }; });
  let yol = 'M ' + pts[0].x + ' ' + pts[0].y;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], ym = (a.y + b.y) / 2;
    yol += ' C ' + a.x + ' ' + ym + ', ' + b.x + ' ' + ym + ', ' + b.x + ' ' + b.y;
  }
  alan.innerHTML = '<svg class="yolCizgi" viewBox="0 0 ' + GEN + ' ' + H + '" width="' + GEN + '" height="' + H + '"><path d="' + yol + '"/></svg>';
  let simdiKondu = false;
  dugumler.forEach(function (x, i) {
    const p = pts[i];
    let durum, etiket, tik, boyut = 62, yildiz = null;
    if (x.tur === 'ders') {
      durum = DURUM.ders[u.id] ? 'bitti' : 'acik'; etiket = '📖';
      tik = function () { uniteDersiAc(u); };
    } else if (x.tur === 'sandik') {
      const ac = uniteBitti(u);
      durum = DURUM.sandik[u.id] ? 'bitti' : ac ? 'acik' : 'kilit'; etiket = ac ? '🎁' : '🔒';
      tik = function () { if (!ac) { toast('Sandık, ünite finali 👑 geçilince açılır'); return; } sandikSor(u); };
    } else {
      const s = x.s, ac = acikMi(s), bit = bittiMi(s);
      durum = bit ? (DURUM.altin[u.id] ? 'altin' : 'bitti') : ac ? 'acik' : 'kilit';
      etiket = !ac ? '🔒' : s.tip === 'boss' ? '👑' : s.tip === 'yer' ? '✍️' : String(u.seviyeler.filter(function (z) { return z.tip === 'seviye'; }).indexOf(s) + 1);
      if (s.tip === 'boss') boyut = 72;
      if (bit) yildiz = yildizOf(s.id);
      tik = function () { if (!acikMi(s)) { kilitMesaji(s); return; } seviyeGiris(s); };
      if (ac && !bit && !simdiKondu) { simdiKondu = true; durum += ' simdi'; }
    }
    const b = h('button', {
      class: 'dugum ' + durum + (x.s && x.s.tip === 'boss' ? ' boss' : ''), type: 'button',
      style: { left: (p.x - boyut / 2) + 'px', top: (p.y - boyut / 2) + 'px', width: boyut + 'px', height: boyut + 'px' },
      'aria-label': x.tur === 'ders' ? 'Ders' : x.tur === 'sandik' ? 'Tekrar sandığı' : x.s.ad,
      html: karoSVG(durum.split(' ')[0]) + '<span class="dugumEtiket">' + etiket + '</span>'
    });
    b.onclick = tik;
    alan.appendChild(b);
    if (yildiz !== null) {
      alan.appendChild(h('div', { class: 'dugumYildiz', style: { left: (p.x - 40) + 'px', top: (p.y + boyut / 2 - 2) + 'px' } },
        h('span', { class: 'dolu' }, '★'.repeat(yildiz)), h('span', { class: 'bos' }, '★'.repeat(3 - yildiz))));
    }
    if (durum.indexOf('simdi') >= 0) {
      alan.appendChild(h('div', { class: 'buradasin', style: { left: (p.x > ORTA ? p.x - boyut / 2 - 98 : p.x + boyut / 2 + 8) + 'px', top: (p.y - 14) + 'px' } }, 'BURADASIN'));
    }
  });
  blok.appendChild(alan);
  return blok;
}

// ---------- Ünvan rozeti, şeridi ve merdiveni ----------
function rozetSVG(renk, kapali) {
  return '<svg viewBox="0 0 64 64" class="rozet' + (kapali ? ' kapali' : '') + '" aria-hidden="true">' +
    '<polygon points="' + KARO_DIS + '" fill="' + (kapali ? 'var(--kilit)' : renk) + '" stroke="' + (kapali ? 'var(--kilitKenar)' : 'rgba(0,0,0,.25)') + '" stroke-width="2"/>' +
    '<circle cx="32" cy="32" r="17" fill="rgba(255,255,255,' + (kapali ? '.3' : '.22') + ')" stroke="rgba(255,255,255,.7)" stroke-width="2"/>' +
    (kapali ? '' : '<polygon points="' + KARO_IC + '" fill="#fff" opacity=".9"/>') + '</svg>';
}
function unvanSeridi() {
  const u = unvan(), s = sonrakiUnvan(), n = bitenUniteSayisi(TR_DALLAR);
  const oran = s ? (n - u.min) / (s.min - u.min) : 1;
  return h('button', { class: 'unvanSerit', type: 'button', onclick: unvanMerdiveni, 'aria-label': 'Ünvanlar' },
    h('span', { class: 'unvanRozet', html: rozetSVG(u.renk) }),
    h('span', { class: 'unvanMetin' },
      h('span', { class: 'unvanUst' }, h('b', null, u.ad), h('small', null, u.anlam)),
      h('span', { class: 'cubuk' }, h('span', { style: { width: Math.round(oran * 100) + '%', background: u.renk } })),
      h('small', { class: 'unvanAlt' }, s ? s.yonelme + ' ' + (s.min - n) + ' ünite kaldı' : 'En yüksek ünvandasın!')),
    h('span', { class: 'modulOk' }, '›'));
}
function unvanMerdiveni() {
  const n = bitenUniteSayisi(TR_DALLAR), su = unvan();
  const L = h('div', { class: 'merdiven' });
  UNVANLAR.slice().reverse().forEach(function (x) {
    const kazanildi = n >= x.min, simdi = x === su;
    L.appendChild(h('div', { class: 'basamak' + (simdi ? ' simdi' : '') + (kazanildi ? '' : ' kapali') },
      h('span', { class: 'unvanRozet', html: rozetSVG(x.renk, !kazanildi) }),
      h('span', { class: 'basamakMetin' }, h('b', null, x.ad), h('small', null, x.anlam)),
      h('span', { class: 'basamakSart' }, simdi ? 'şu an' : kazanildi ? '✓' : x.min + ' ünite')));
  });
  modalAc(h('div', null,
    h('h2', null, 'Meşk basamakları'),
    h('p', { class: 'kucukNot ortala' }, 'Ünvanlar, bitirdiğin Türk müziği ünitelerine göre verilir (Koma, Perde, Göçürme, Dörtlü-Beşli, Makam). Bir ünite, finali 👑 geçilince biter. Şu ana kadar: ' + n + ' / ' + TR_DALLAR.reduce(function (t, d) { return t + DALLAR[d].uniteler.length; }, 0) + ' ünite.'),
    L,
    h('p', { class: 'kucukNot ortala' }, 'Mübtedî, mutavassıt ve müntehî; meşk geleneğinde yeni başlayan, orta ve ileri seviyedeki talebeye verilen adlardır.'),
    dugme('Kapat', modalKapat, 'gri')), { genis: true });
}

function kilitMesaji(s) {
  const L = DAL_SEVIYELERI[s.dal];
  const onceki = L[L.indexOf(s) - 1];
  if (onceki && onceki.tip === 'boss' && onceki.unite !== s.unite) toast('🔒 Önce “' + onceki.unite.ad + '” ünitesinin finalini 👑 geç', 3200);
  else toast('🔒 Önce önceki seviyeyi geç');
}

function dallarCiz(g) {
  g.appendChild(h('p', { class: 'yolAciklama' }, 'Her dal kendi sırasıyla ilerler. Bir dala dokun, sadece o dalın ünitelerini gör.'));
  const kap = h('div', { class: 'dalKartlar' });
  DAL_SIRA.forEach(function (k) {
    const d = DALLAR[k];
    let biten = 0, yil = 0, top = 0;
    d.uniteler.forEach(function (u) { if (uniteBitti(u)) biten++; u.seviyeler.forEach(function (s) { yil += yildizOf(s.id); top += 3; }); });
    const sira = siradakiSeviye(k);
    kap.appendChild(h('button', { class: 'dalKart', type: 'button', style: { '--dal': d.renk }, onclick: function () { YOL_FILTRE = k; sekmeAc('yol'); } },
      h('div', { class: 'dalIkon' }, d.ikon),
      h('div', { class: 'dalMetin' },
        h('b', null, d.ad),
        h('span', null, biten + ' / ' + d.uniteler.length + ' ünite · ⭐ ' + yil + '/' + top),
        h('small', null, sira ? 'Sıradaki: ' + sira.unite.ad : '🏆 Tamamlandı')),
      h('div', { class: 'cubuk' }, h('div', { style: { width: (biten / d.uniteler.length * 100) + '%' } }))));
  });
  g.appendChild(kap);
  if (!DURUM.ayar.bati) g.appendChild(h('p', { class: 'kucukNot ortala' }, '🎹 Batı Teorisi Meşk Yolu’nda gösterilmiyor. Profil → Ayarlar’dan açabilirsin.'));
}

// ---------- Seviye girişi ----------
const TIP_ACIKLAMA = {
  seviye: 'Tanıma soruları: gör, seç.',
  yer: '✍️ Üretim: cevabı kendin kuracaksın (porteye yaz, işaret seç ya da sırayla diz).',
  boss: '👑 Ünite finali: geçince bu dalda bir sonraki ünite açılır.'
};
function seviyeGiris(s) {
  const u = s.unite, d = DALLAR[s.dal];
  const ilkMi = u.seviyeler[0] === s;
  const dersUyari = u.ders && !DURUM.ders[u.id] && ilkMi;
  modalAc(h('div', { class: 'giris', style: { '--dal': d.renk } },
    h('div', { class: 'girisUst' }, d.ikon + ' ' + d.ad + ' · Ünite ' + u.no + ' · ' + u.ad),
    h('h2', null, (s.tip === 'boss' ? '👑 ' : s.tip === 'yer' ? '✍️ ' : '') + s.ad),
    h('p', null, s.soruSay + ' soru · 3 kalp'),
    h('p', { class: 'soluk' }, TIP_ACIKLAMA[s.tip]),
    yildizOf(s.id) ? h('p', null, 'Rekorun: ' + '★'.repeat(yildizOf(s.id)) + '☆'.repeat(3 - yildizOf(s.id))) : null,
    h('p', { class: 'kucukNot' }, '⭐ Cüzdanın: ' + cuzdan() + ' · Joker kullanırsan bu seviyeden en fazla 2 ⭐ alırsın.'),
    dersUyari ? h('div', { class: 'uyariKutu' }, '📖 Bu ünitenin dersini henüz görmedin. Önce dersi görmek ister misin?',
      dugme('Önce dersi gör', function () { modalKapat(); uniteDersiAc(u); }, 'ikincil')) : null,
    dugme('Başla', function () { modalKapat(); seviyeBaslat(s); }),
    dugme('Geri', modalKapat, 'gri')));
}
function atlamaSor(u) {
  modalAc(h('div', null,
    h('h2', null, '⏩ Bu üniteyi biliyor musun?'),
    h('p', null, '“' + u.ad + '” ünitesinden 12 zor soru gelecek. En fazla 2 hata yapabilirsin.'),
    h('p', { class: 'soluk' }, 'Geçersen ünitenin bütün seviyeleri 1 ⭐ ile tamamlanmış sayılır; dilediğinde dönüp yıldızlarını artırabilirsin.'),
    dugme('Sınava başla', function () { modalKapat(); atlamaBaslat(u); }),
    dugme('Vazgeç', modalKapat, 'gri')));
}
function altinSor(u) {
  modalAc(h('div', null,
    h('h2', null, '🏆 Üniteyi altınla'),
    h('p', null, '10 soru, her biri için süre var. Kalp yok; en fazla 2 hata ile bitirirsen ünitenin karoları altına döner ve ⭐ +5 kazanırsın.'),
    h('p', { class: 'soluk' }, 'Mümkün olduğunca üretim soruları (porteye yazma, dizme) gelir.'),
    dugme('Başla', function () { modalKapat(); altinBaslat(u); }),
    dugme('Vazgeç', modalKapat, 'gri')));
}
function sandikSor(u) {
  modalAc(h('div', null,
    h('h2', null, '🎁 Tekrar sandığı'),
    h('p', null, 'Ünitenin her yerinden karışık 8 soru. Kalp yok.'),
    h('p', { class: 'soluk' }, DURUM.sandik[u.id] ? 'Ödülünü almıştın; yine de pratik için açabilirsin.' : 'İlk açılışta ⭐ +2.'),
    dugme('Aç', function () { modalKapat(); sandikBaslat(u); }),
    dugme('Vazgeç', modalKapat, 'gri')));
}

// =====================================================
// ÖĞREN
// =====================================================
function ogrenCiz(g) {
  g.appendChild(h('div', { class: 'sayfaBas' },
    h('span', { class: 'sayfaMaskot', html: bulbulSVG('anlat') }),
    h('div', null, h('h2', null, '📚 Öğren'), h('p', null, 'Hiç nota bilmesen de buradan başlayabilirsin. Her modül birkaç dakika sürer.'))));
  const liste = h('div', { class: 'modulListe' });
  OGREN_MODULLERI.forEach(function (m, i) {
    const bitti = !!DURUM.ogren[m.id];
    liste.appendChild(h('button', { class: 'modul' + (bitti ? ' bitti' : ''), type: 'button', onclick: function () { modulAc(m); } },
      h('span', { class: 'modulNo' }, bitti ? '✓' : String(i + 1)),
      h('span', { class: 'modulAd' }, m.ikon + ' ' + m.ad),
      h('span', { class: 'modulOk' }, '›')));
  });
  g.appendChild(liste);
  g.appendChild(h('button', { class: 'modul sozluk', type: 'button', onclick: sozlukAc },
    h('span', { class: 'modulNo' }, '📖'), h('span', { class: 'modulAd' }, 'Sözlük'), h('span', { class: 'modulOk' }, '›')));
  g.appendChild(h('p', { class: 'kucukNot ortala' }, 'İpucu: derslerde ve açıklamalarda altı noktalı terimlere dokunursan sözlük açılır.'));
}
function modulAc(m) {
  dersGoster(m.ikon + ' ' + m.ad, m.kartlar, function () {
    DURUM.ogren[m.id] = true; kaydet();
    const u = m.baglanti && UNITE[m.baglanti];
    ekranAc('ekranAna'); sekmeAc('ogren');
    modalAc(h('div', { class: 'sonuc' },
      h('div', { class: 'sonucMaskot', html: bulbulSVG('mutlu') }),
      h('h2', null, 'Modül tamam!'),
      u ? h('p', null, 'Bunu oyunda denemek için: ' + DALLAR[u.dal].ikon + ' ' + u.ad) : null,
      u ? dugme('Üniteye git', function () { modalKapat(); YOL_FILTRE = null; sekmeAc('yol', false); uniteyeKaydir(u); }) : null,
      dugme('Öğren’e dön', modalKapat, 'gri')));
  }, 'Bitir');
}
function uniteyeKaydir(u) {
  const el = document.querySelector('[data-unite="' + u.id + '"]');
  if (el) $('sekme').scrollTop = Math.max(0, el.offsetTop - $('sekme').offsetTop - 64);
}
function sozlukAc() {
  const liste = h('div', { class: 'sozlukListe' });
  SOZLUK.slice().sort(function (a, b) { return a.ad.localeCompare(b.ad, 'tr'); }).forEach(function (x) {
    liste.appendChild(h('div', { class: 'sozlukSatir' }, h('b', null, x.ad), h('p', null, x.t)));
  });
  modalAc(h('div', null, h('h2', null, '📖 Sözlük'), liste, dugme('Kapat', modalKapat, 'gri')), { genis: true });
}

// =====================================================
// TEKRAR
// =====================================================
function tekrarCiz(g) {
  const vade = vadesiGelenler(), zay = zayiflar();
  g.appendChild(h('div', { class: 'sayfaBas' },
    h('span', { class: 'sayfaMaskot', html: bulbulSVG(vade.length ? 'anlat' : 'mutlu') }),
    h('div', null, h('h2', null, '🎯 Tekrar'), h('p', null, 'Bütün oyunlardan, unutmaya başladığın şeyler karışık olarak burada.'))));
  const n = Math.min(10, vade.length < 4 ? benzersiz(vade.concat(zay)).length : vade.length);
  g.appendChild(h('div', { class: 'tekrarKart' },
    h('div', { class: 'tekrarSayi' }, String(vade.length)),
    h('div', null, h('b', null, 'Bugün tekrar zamanı gelen'), h('p', null, vade.length ? 'Kısa bir turla hafızanı tazele.' : zay.length ? 'Vadesi gelen yok; zayıf öğelerden çalışabilirsin.' : 'Şu an tekrar edilecek bir şey yok 🎉')),
    dugme(n ? 'Tekrarı başlat (' + n + ' soru)' : 'Tekrar yok', tekrarBaslat, n ? '' : 'gri')));
  if (n === 0) g.lastChild.querySelector('button').disabled = true;

  if (zay.length) {
    g.appendChild(h('h3', { class: 'bolumBaslik' }, 'Zayıf öğeler'));
    const L = h('div', { class: 'zayifListe' });
    zay.slice(0, 15).forEach(function (id) {
      const r = DURUM.tekrar[id], d = DALLAR[ogeDali(id)];
      L.appendChild(h('div', { class: 'zsatir', style: { '--dal': d.renk } },
        h('span', null, d.ikon + ' ' + ogeAdi(id)),
        h('span', { class: 'zNokta' }, '●'.repeat(Math.min(5, Math.max(1, r.y - r.d))))));
    });
    if (zay.length > 15) L.appendChild(h('p', { class: 'kucukNot' }, '… ve ' + (zay.length - 15) + ' öğe daha'));
    g.appendChild(L);
  }

  g.appendChild(h('h3', { class: 'bolumBaslik' }, '🔁 Göçürme antrenmanı'));
  g.appendChild(h('p', { class: 'kucukNot' }, 'Önce dörtlüler, sonra beşliler, sonra makam dizileri. Kalp yok, rahatça çalış.'));
  const ant = h('div', { class: 'antrenmanlar' });
  ant.appendChild(h('button', { class: 'antKart', type: 'button', onclick: function () { dersGoster('🔁 Göçürme', gocurmeDersi(), function () { ekranAc('ekranAna'); sekmeAc('tekrar'); }); } }, '📖', h('span', null, 'Göçürme nedir?')));
  GOCURME_ASAMALAR.forEach(function (a) {
    ant.appendChild(h('button', { class: 'antKart', type: 'button', onclick: function () { antrenmanBaslat(a); } }, a.ikon, h('span', null, a.ad)));
  });
  g.appendChild(ant);
  g.appendChild(h('details', { class: 'nasil' }, h('summary', null, 'Tekrar nasıl çalışır?'),
    h('p', null, 'Her öğe (perde, aralık, çeşni, makam…) 6 kutudan birindedir. Doğru bildikçe üst kutuya çıkar ve daha seyrek sorulur (1, 2, 4, 8, 16 gün). Yanlış yaptığında ilk kutuya döner ve ertesi gün yeniden gelir.')));
}

// =====================================================
// KOLEKSİYON
// =====================================================
let KOL_KAT = 'perde';
const KOL_KATLAR = {
  perde: { ad: 'Perdeler', ogeler: function () { return PAKET.reduce(function (a, p) { return a.concat(p); }, []).map(function (ad) { return PERDE[ad].oge; }); } },
  koma: { ad: 'Aralıklar', ogeler: function () { return KM_VERI.map(function (v) { return v.oge; }); } },
  cesni: { ad: 'Çeşniler', ogeler: function () { return CESNILER.map(function (c) { return c.oge; }); } },
  makam: { ad: 'Makamlar', ogeler: function () { return MAKAMLAR.map(function (m) { return m.oge; }); } }
};
function kartDurumu(id) {
  if (!DURUM.kart[id]) return 'kapali';
  const r = DURUM.tekrar[id];
  return r && r.k >= 3 ? 'altin' : 'acik';
}
function koleksiyonCiz(g) {
  g.appendChild(h('div', { class: 'sayfaBas' },
    h('span', { class: 'sayfaMaskot', html: bulbulSVG('normal') }),
    h('div', null, h('h2', null, '🃏 Koleksiyon'), h('p', null, 'Dersini gördüğün kartlar açılır; üst üste doğru bildikçe altına döner.'))));
  const cipler = h('div', { class: 'cipler' });
  Object.keys(KOL_KATLAR).forEach(function (k) {
    cipler.appendChild(h('button', { class: 'cip' + (k === KOL_KAT ? ' aktif' : ''), type: 'button', onclick: function () { KOL_KAT = k; sekmeAc('koleksiyon'); } }, KOL_KATLAR[k].ad));
  });
  g.appendChild(cipler);
  const ogeler = KOL_KATLAR[KOL_KAT].ogeler();
  const acik = ogeler.filter(function (id) { return DURUM.kart[id]; }).length;
  const altin = ogeler.filter(function (id) { return kartDurumu(id) === 'altin'; }).length;
  g.appendChild(h('p', { class: 'kucukNot' }, acik + ' / ' + ogeler.length + ' kart açık · ' + altin + ' altın'));
  const grid = h('div', { class: 'kartGrid' });
  ogeler.forEach(function (id) {
    const dur = kartDurumu(id);
    grid.appendChild(h('button', { class: 'kolKart ' + dur, type: 'button', onclick: function () { if (dur === 'kapali') { toast('Bu kart, ilgili ünitenin dersini görünce açılır'); return; } kartDetay(id); } },
      dur === 'kapali' ? '?' : ogeAdi(id)));
  });
  g.appendChild(grid);
}
function kartDetay(id) {
  const p = id.split(':')[0];
  let kart;
  if (p === 'p') kart = perdeKarti(perdeOge(id));
  else if (p === 'k') {
    const v = KM_VERI.find(function (x) { return x.oge === id; });
    kart = v.isaret || v.cift ? isaretKarti(v) : { baslik: v.ad, metin: '<p><b>' + v.ad + '</b> = ' + kmKoma(v) + ' koma, simge harfi <b>' + v.kod + '</b>.</p>' };
  } else if (p === 'd') kart = cesniKarti(CESNILER.find(function (c) { return c.oge === id; }));
  else kart = makamKarti(MAKAMLAR.find(function (m) { return m.oge === id; }));
  const r = DURUM.tekrar[id];
  modalAc(h('div', { class: 'kartDetay' },
    h('h2', null, (kartDurumu(id) === 'altin' ? '🌟 ' : '') + kart.baslik),
    kart.cizim ? h('div', { class: 'dersCizim' }, kart.cizim()) : null,
    terimBagla(h('div', { class: 'dersMetin', html: kart.metin })),
    r ? h('p', { class: 'kucukNot' }, 'Tekrar kutusu: ' + (r.k + 1) + ' / 6 · ' + r.d + ' doğru, ' + r.y + ' yanlış') : null,
    dugme('Kapat', modalKapat, 'gri')), { genis: true });
}

// =====================================================
// PROFİL
// =====================================================
function profilCiz(g) {
  const u = unvan(), s = sonrakiUnvan();
  let altin = 0; for (const k in DURUM.altin) if (DURUM.altin[k]) altin++;
  const kart = Object.keys(DURUM.kart).length;
  g.appendChild(h('div', { class: 'icazet' },
    h('div', { class: 'icazetMaskot', html: bulbulSVG('mutlu') }),
    h('div', { class: 'icazetUst' }, 'MEŞK İCAZETNAMESİ'),
    h('button', { class: 'icazetUnvan', type: 'button', onclick: unvanMerdiveni }, h('span', { class: 'unvanRozet', html: rozetSVG(u.renk) }), u.ad),
    h('div', { class: 'icazetAlt' }, u.anlam + ' · ' + (s ? s.yonelme + ' ' + (s.min - bitenUniteSayisi(TR_DALLAR)) + ' ünite kaldı' : 'En yüksek ünvana ulaştın!')),
    h('div', { class: 'istatistik' },
      istat('⭐', toplamYildiz(), 'toplam yıldız'), istat('👛', cuzdan(), 'cüzdan'),
      istat('🏁', bitenUniteSayisi(), 'biten ünite'), istat('🏆', altin, 'altın ünite'),
      istat('🔥', seriGun(), 'gün serisi'), istat('🃏', kart, 'kart'))));
  g.appendChild(iletisimKarti());
  const liste = h('div', { class: 'profilListe' });
  [
    ['❓', 'Nasıl oynanır', nasilOynanir],
    ['ℹ️', 'Hakkında', hakkinda],
    ['🆕', 'Yenilikler', yenilikler],
    ['💾', 'Yedekle / geri yükle', yedekSayfasi],
    ['⚙️', 'Ayarlar', ayarlar],
    ['📤', 'Arkadaşına öner', paylas],
    ['🐦', 'Bülbülün rehberini yeniden göster', function () { sekmeAc('yol', false); rehberBaslat(); }]
  ].forEach(function (x) {
    liste.appendChild(h('button', { class: 'modul', type: 'button', onclick: x[2] }, h('span', { class: 'modulNo' }, x[0]), h('span', { class: 'modulAd' }, x[1]), h('span', { class: 'modulOk' }, '›')));
  });
  if (!KURULU) liste.appendChild(h('button', { class: 'modul', type: 'button', onclick: kurulumYardim }, h('span', { class: 'modulNo' }, '📲'), h('span', { class: 'modulAd' }, 'Ana ekrana ekle'), h('span', { class: 'modulOk' }, '›')));
  g.appendChild(liste);
  g.appendChild(h('p', { class: 'imza' }, 'Geliştiren: ', h('b', null, 'Burak Baştaş'), ' · OMÜ Türk Sanat Müziği', h('br'), 'Sürüm ' + SURUM));
}
// ---------- Geliştiriciyle iletişim (WhatsApp) ----------
function whatsappBaglanti() {
  const metin = 'Merhaba, Seyir uygulaması hakkında yazıyorum (sürüm ' + SURUM + '): ';
  return 'https://wa.me/' + WHATSAPP_NO + '?text=' + encodeURIComponent(metin);
}
function iletisimKarti() {
  return h('a', { class: 'iletisim', href: whatsappBaglanti(), target: '_blank', rel: 'noopener' },
    h('span', { class: 'iletisimIkon' }, '💬'),
    h('span', { class: 'iletisimMetin' }, h('b', null, 'Bana WhatsApp’tan yaz'), h('small', null, 'Soru, öneri ya da hata bildirimi için doğrudan ulaş')),
    h('span', { class: 'iletisimOk' }, '›'));
}
function istat(ikon, sayi, ad) { return h('div', { class: 'istat' }, h('span', null, ikon + ' ' + sayi), h('small', null, ad)); }

function sayfa(baslik, ic) {
  modalAc(h('div', { class: 'sayfaModal' }, h('h2', null, baslik), ic, dugme('Kapat', modalKapat, 'gri')), { genis: true });
}
function nasilOynanir() {
  sayfa('❓ Nasıl oynanır', h('div', { class: 'metinSayfa', html:
    '<p>🧭 <b>Meşk Yolu</b>: Koma, Perde, Göçürme, Dörtlü-Beşli ve Makam dallarının üniteleri önerilen sırayla dizilir. <b>Dallar</b> görünümünden istediğin dala geçebilirsin; dallar birbirini kilitlemez.</p>' +
    '<p>📖 <b>Ders</b>: her ünite kısa bir dersle ve ipuçlu bir ısınma turuyla başlar. Dersi atlayabilirsin ama önerilmez.</p>' +
    '<p>🔢 <b>Seviyeler</b>: tanıma soruları. ✍️ <b>Yerleştirme</b>: cevabı porteye kendin yazarsın ya da harfleri, parçaları sırayla dizersin. 👑 <b>Final</b>: geçince o dalda sonraki ünite açılır. 🎁 <b>Sandık</b>: ünitenin karışık tekrarı.</p>' +
    '<p>❤️ Her seviyede 3 kalp var. 0 hata 3 ⭐, 1 hata 2 ⭐, daha fazlası 1 ⭐.</p>' +
    '<p>🃏 <b>Jokerler</b>: yıldızlarınla %50, ipucu, atla ve +kalp alabilirsin. Joker kullanınca o seviyeden en fazla 2 ⭐ alırsın.</p>' +
    '<p>⏩ <b>Biliyorum</b>: bir üniteyi zaten biliyorsan kısa bir sınavla geçebilirsin. 🏆 <b>Altınla</b>: bitirdiğin bir üniteyi süreli bir ustalık turuyla altına çevir.</p>' +
    '<p>🎯 <b>Tekrar</b>: yanlış yaptıkların ve unutmaya başladıkların, bütün oyunlardan karışık olarak, aralıklı tekrar yöntemiyle karşına çıkar. Göçürme antrenmanı da orada.</p>' +
    '<p>🎖️ <b>Ünvanlar</b> biten Türk müziği ünitelerine göre verilir: Mübtedî, Heveskâr, Mutavassıt, Mûsikişinas, Müntehî, Muallim, Üstad-ı Kâmil. Yol’un üstündeki şeride dokunursan bütün basamakları görürsün.</p>' +
    '<p>🎹 <b>Batı Teorisi</b> ayrı bir dal: aralıklar, tonlar, donanım ve minör türleri. Dallar’dan oynayabilir, istersen Ayarlar’dan Meşk Yolu’na ekleyebilirsin.</p>' }));
}
function hakkinda() {
  sayfa('ℹ️ Hakkında', h('div', { class: 'metinSayfa', html:
    '<p><b>Seyir</b>, Türk müziği öğrencilerinin Arel-Ezgi-Uzdilek sistemindeki komaları, perdeleri, dörtlü-beşlileri ve makamları oyun oynayarak öğrenmesi için hazırlandı. Hiç nota bilmeyenler 📚 Öğren bölümünden başlayabilir; birikimi olanlar ⏩ Biliyorum sınavlarıyla kendi seviyelerine geçebilir.</p>' +
    '<p>Perdelerin öğretim sırası, 2.200 eserlik <b>SymbTr</b> derleminde perdelerin eserlerde ne sıklıkla geçtiğine göre belirlendi. Dörtlü, beşli ve makam bilgileri <b>TDV İslâm Ansiklopedisi</b> maddeleri ve <b>MEB müzik okulları</b> öğretim programıyla karşılaştırılarak hazırlandı.</p>' +
    '<p style="text-align:center;margin-top:14px"><b>Geliştiren: Burak Baştaş</b><br>Ondokuz Mayıs Üniversitesi<br>Türk Sanat Müziği Bölümü</p>' +
    '<p style="text-align:center"><a class="iletisimBag" href="' + whatsappBaglanti() + '" target="_blank" rel="noopener">💬 WhatsApp’tan ulaş</a></p>' +
    '<p class="kucukNot">İlerlemen yalnızca bu cihazda saklanır. Cihaz değiştirmeden önce Profil → Yedekle’yi kullan. Ziyaretler kişisel veri toplanmadan, anonim olarak sayılır.</p>' +
    '<p class="kucukNot">Sürüm ' + SURUM + '</p>' }));
}
function yenilikler() {
  sayfa('🆕 Yenilikler', h('div', { class: 'metinSayfa', html:
    '<h3>Sürüm 2.2</h3><ul>' +
    '<li>🔁 Yeni <b>Göçürme</b> dalı: aralık adımlarından başlayıp dörtlü, beşli ve makam dizisi göçürmeye 5 ünite. Antrenman Tekrar sekmesinde de duruyor.</li></ul>' +
    '<h3>Sürüm 2.1</h3><ul>' +
    '<li>🐦 Uygulamanın yeni adı: <b>Seyir</b>. Yeni bülbüllü ikon.</li>' +
    '<li>🎖️ Meşk geleneğine dayanan yeni ünvanlar ve ünvan basamakları.</li>' +
    '<li>💬 Profil ve Ayarlar’dan geliştiriciye doğrudan WhatsApp ile ulaşma.</li>' +
    '<li>🔁 Göçürmenin hesabı adım adım: hangi aralık kaç koma, işaret nasıl bulunur.</li>' +
    '<li>🧭 Bülbülün rehberi; Meşk Yolu / Dallar seçicisi kaydırınca üstte kalıyor.</li>' +
    '<li>📤 “Arkadaşına öner” ekranında QR kod.</li></ul>' +
    '<p class="uyariKutu">📱 iPhone’da ana ekrana eklediysen eski ad ve ikon görünmeye devam edebilir; oyun aynen çalışır. Uygulamayı silip yeniden ekleme: ilerlemen silinebilir. Mutlaka yapacaksan önce Profil → Yedekle’den kodunu al.</p>' +
    '<h3>Sürüm 2.0</h3><ul>' +
    '<li>🧭 Yeni <b>Meşk Yolu</b>: dallar önerilen sırayla, birbirini kilitlemeden.</li>' +
    '<li>📚 <b>Öğren</b> bölümü ve 📖 sözlük: sıfırdan başlayanlar için.</li>' +
    '<li>📖 Her ünitede ders ve ısınma turu.</li>' +
    '<li>✍️ Porteye yazma, işaret seçme ve sıralama soruları.</li>' +
    '<li>🎶 Perdeler, eserlerde kullanılma sıklığına göre 5 pakete ayrıldı.</li>' +
    '<li>🎻 Temel dörtlüler eklendi; beşliler “dörtlü + tanini” ile öğretiliyor.</li>' +
    '<li>🏵️ Yeni <b>Makam</b> dalı: 10 makam, “Ben kimim?”, makam kurma, donanım.</li>' +
    '<li>🔁 <b>Göçürme antrenmanı</b>: dörtlü, beşli ve makam dizileri.</li>' +
    '<li>🎹 Yeni <b>Batı Teorisi</b> dalı: aralıklar, tonlar, minör türleri, beşliler çemberi.</li>' +
    '<li>🎯 Bütün oyunları kapsayan aralıklı <b>Tekrar</b> sistemi.</li>' +
    '<li>⏩ Biliyorum sınavları, 🏆 ünite altınlama, 🎁 tekrar sandıkları.</li>' +
    '<li>💾 İlerleme yedekleme ve geri yükleme; karanlık tema.</li>' +
    '<li>⚡ Daha hızlı açılış (yazı tipleri 424 KB’tan ~94 KB’a indi), çevrimdışı çalışma iyileştirildi, Android geri tuşu desteklendi.</li>' +
    '<li>📅 Günlük görev kaldırıldı.</li></ul>' }));
}

function yedekSayfasi() {
  const kod = yedekKodu();
  const alan = h('textarea', { class: 'yedekAlan', rows: 4, readonly: true }, kod);
  const giris = h('textarea', { class: 'yedekAlan', rows: 3, placeholder: 'Yedek kodunu buraya yapıştır' });
  const dosya = h('input', { type: 'file', accept: '.txt,.json,text/plain,application/json', hidden: true });
  dosya.onchange = function () {
    const f = dosya.files && dosya.files[0];
    if (!f) return;
    f.text().then(function (t) { giris.value = t; });
  };
  sayfa('💾 Yedekle / geri yükle', h('div', null,
    h('p', null, 'İlerlemen sadece bu cihazda duruyor. Bu kodu sakla; başka bir cihazda ya da tarayıcı verisi silinince geri yükleyebilirsin.'),
    alan,
    dugme('📋 Kodu kopyala', function () {
      (navigator.clipboard ? navigator.clipboard.writeText(kod) : Promise.reject()).then(function () { toast('Kopyalandı'); })
        .catch(function () { alan.select(); toast('Kodu seçip kopyala'); });
    }, 'ikincil'),
    dugme('⬇️ Dosya olarak indir', function () {
      const a = h('a', { href: URL.createObjectURL(new Blob([kod], { type: 'text/plain' })), download: 'seyir-yedek-' + bugun() + '.txt' });
      document.body.appendChild(a); a.click(); a.remove();
    }, 'ikincil'),
    h('h3', null, 'Geri yükle'),
    giris, dosya,
    dugme('📂 Dosyadan seç', function () { dosya.click(); }, 'ikincil'),
    dugme('Geri yükle', function () {
      if (!giris.value.trim()) { toast('Önce bir yedek kodu yapıştır'); return; }
      confirmModal('Mevcut ilerlemenin yerine bu yedek yüklenecek. Emin misin?', function () {
        if (yedekYukle(giris.value)) { modalKapat(); temaUygula(); sekmeAc('yol'); toast('✅ Yedek yüklendi', 2500); }
        else toast('⚠️ Bu kod geçerli bir yedek değil', 3000);
      });
    })));
}
function confirmModal(metin, evet) {
  modalAc(h('div', null, h('h2', null, 'Emin misin?'), h('p', null, metin),
    dugme('Vazgeç', modalKapat, 'gri'),
    dugme('Evet', function () { modalKapat(); evet(); }, 'kirmizi')));
}

function ayarlar() {
  const tema = h('div', { class: 'segment' });
  [['oto', 'Otomatik'], ['acik', 'Açık'], ['koyu', 'Koyu']].forEach(function (t) {
    tema.appendChild(h('button', { type: 'button', class: DURUM.ayar.tema === t[0] ? 'aktif' : '', onclick: function () { DURUM.ayar.tema = t[0]; kaydet(); temaUygula(); ayarlar(); } }, t[1]));
  });
  const bati = h('label', { class: 'anahtar' },
    h('input', { type: 'checkbox', checked: !!DURUM.ayar.bati, onchange: function (e) { DURUM.ayar.bati = e.target.checked; kaydet(); } }),
    h('span', null, '🎹 Batı Teorisi ünitelerini Meşk Yolu’nda göster'));
  modalAc(h('div', null,
    h('h2', null, '⚙️ Ayarlar'),
    iletisimKarti(),
    h('h3', null, 'Tema'), tema,
    h('h3', null, 'Meşk Yolu'), bati,
    h('h3', null, 'İlerleme'),
    h('p', { class: 'kucukNot' }, 'Sıfırlarsan bütün oyunlardaki yıldızlar, kartlar, tekrar listesi ve seri silinir. Önce yedek almanı öneririz.'),
    dugme('İlerlemeyi sıfırla', function () {
      confirmModal('Bütün ilerleme silinecek. Bu işlem geri alınamaz.', function () { tumKaydiSil(); temaUygula(); sekmeAc('yol'); toast('İlerleme sıfırlandı'); });
    }, 'kirmizi'),
    dugme('Kapat', modalKapat, 'gri')), { kapaninca: function () { sekmeAc(SEKME, false); } });
}
function temaUygula() {
  const t = DURUM.ayar.tema;
  if (t === 'acik' || t === 'koyu') document.documentElement.setAttribute('data-tema', t);
  else document.documentElement.removeAttribute('data-tema');
  try { localStorage.setItem('perdeTema', t); } catch (e) {}
  const koyu = t === 'koyu' || (t === 'oto' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const m = document.querySelector('meta[name="theme-color"]');
  if (m) m.setAttribute('content', koyu ? '#0b1430' : '#123a6b');
}
function paylas() {
  const veri = { title: 'Seyir', text: 'Türk müziği perdelerini, komaları ve makamları oyunla öğren!', url: UYGULAMA_ADRESI };
  modalAc(h('div', null,
    h('h2', null, '📤 Arkadaşına öner'),
    h('p', null, 'Arkadaşın telefonunun kamerasıyla bu kodu okutsun:'),
    h('img', { src: 'qr.png', alt: 'Seyir QR kodu', class: 'qrResim', width: 220, height: 220 }),
    h('p', { class: 'kucukNot ortala' }, UYGULAMA_ADRESI),
    navigator.share ? dugme('Bağlantıyı paylaş', function () { navigator.share(veri).catch(function () {}); }) : null,
    dugme('Bağlantıyı kopyala', function () {
      (navigator.clipboard ? navigator.clipboard.writeText(UYGULAMA_ADRESI) : Promise.reject()).then(function () { toast('Bağlantı kopyalandı'); })
        .catch(function () { toast(UYGULAMA_ADRESI, 4000); });
    }, 'ikincil'),
    dugme('Kapat', modalKapat, 'gri')));
}

// ---------- Ana ekrana ekle ----------
let KUR_OLAY = null;
const KURULU = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
const IOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const MOBIL = IOS || /android/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && window.matchMedia('(pointer: coarse)').matches);
window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); KUR_OLAY = e; });
window.addEventListener('appinstalled', function () { toast('🎉 Uygulama ana ekrana eklendi!', 3000); });
function kurBandiGerekli() {
  if (KURULU || !MOBIL) return false;
  try { if (localStorage.getItem('perdeKurBandi') === bugun()) return false; } catch (e) {}
  return true;
}
function kurBandi() {
  const b = h('div', { class: 'kurBandi' },
    h('span', null, '📲 Ana ekrana ekle: tek dokunuşla açılır, ilerlemen daha güvende kalır.'),
    h('button', { class: 'cip', type: 'button', onclick: kurulumYardim }, 'Nasıl?'),
    h('button', { class: 'kapatX', type: 'button', 'aria-label': 'Kapat', onclick: function () { try { localStorage.setItem('perdeKurBandi', bugun()); } catch (e) {} b.remove(); } }, '✕'));
  return b;
}
function kurulumYardim() {
  if (KUR_OLAY) { KUR_OLAY.prompt(); KUR_OLAY.userChoice.then(function () { KUR_OLAY = null; }); return; }
  const adimlar = IOS
    ? ['<b>Safari</b> ile açtığından emin ol.', 'Alttaki <b>Paylaş</b> düğmesine dokun (kareden yukarı ok çıkan simge).', '<b>Ana Ekrana Ekle</b> seçeneğini bul ve dokun.', 'Sağ üstteki <b>Ekle</b> düğmesine bas.']
    : ['Tarayıcının sağ üstündeki <b>⋮</b> menüsünü aç.', '<b>Uygulamayı yükle</b> veya <b>Ana ekrana ekle</b> seçeneğine dokun.', 'Çıkan pencerede onayla.'];
  modalAc(h('div', null,
    h('h2', null, '📲 Ana ekrana ekle'),
    h('p', null, 'Oyun uygulama gibi tek dokunuşla açılır. iPhone’da ana ekrana eklemek, tarayıcının ilerlemeni silmesini de önler.'),
    adimlar.map(function (a, i) { return h('div', { class: 'adim', html: (i + 1) + '. ' + a }); }),
    dugme('Tamam', modalKapat)));
}

// =====================================================
// İLK AÇILIŞ
// =====================================================
function ilkAcilis() {
  const adim1 = function () {
    modalAc(h('div', { class: 'karsilama' },
      h('div', { class: 'karsilamaMaskot', html: bulbulSVG('anlat') }),
      h('h2', null, 'Hoş geldin!'),
      h('p', null, 'Ben Bülbül. Türk müziğinin perdelerini, komalarını, dörtlü-beşlilerini ve makamlarını birlikte öğreneceğiz.'),
      h('p', { class: 'soluk' }, 'Önce seni biraz tanıyayım: nota bilgin ne durumda?'),
      dugme('🌱 Hiç bilmiyorum', function () { adim2('hic'); }, 'ikincil'),
      dugme('🎼 Batı notasını biliyorum', function () { adim2('bati'); }, 'ikincil'),
      dugme('🎓 Türk müziği öğrencisiyim', function () { adim2('tsm'); }, 'ikincil')), { kapatilamaz: true });
  };
  const adim2 = function (seviye) {
    modalAc(h('div', { class: 'karsilama' },
      h('div', { class: 'karsilamaMaskot', html: bulbulSVG('normal') }),
      h('h2', null, 'Batı Teorisi de çalışalım mı?'),
      h('p', null, 'Aralıklar (Tam Dörtlü, Eksik Beşli…), tonlar, donanım ve minör türleri için ayrı bir dal var. Meşk Yolu’na eklersem Türk müziği üniteleriyle sırayla karışık gelir.'),
      h('p', { class: 'soluk' }, 'Eklemesen de Dallar’dan her zaman oynayabilirsin.'),
      dugme('Evet, yola ekle', function () { bitir(seviye, true); }),
      dugme('Şimdilik hayır', function () { bitir(seviye, false); }, 'gri')), { kapatilamaz: true });
  };
  const bitir = function (seviye, bati) {
    DURUM.ayar.kurulum = true; DURUM.ayar.bati = bati; DURUM.ayar.baslangic = seviye;
    kaydet();
    modalKapat();
    sekmeAc('yol');
    rehberBaslat(function () {
      if (seviye === 'hic') {
        sekmeAc('ogren');
        toast('📚 “Porte ve notalar” modülüyle başla!', 2500);
      } else if (seviye === 'tsm') {
        modalAc(h('div', { class: 'karsilama' },
          h('div', { class: 'karsilamaMaskot', html: bulbulSVG('mutlu') }),
          h('h2', null, 'Bildiklerini atla'),
          h('p', null, 'Her ünitenin başındaki “⏩ Biliyorum” düğmesiyle kısa bir sınav çözüp o üniteyi geçebilirsin. Böylece doğrudan kendi seviyene ulaşırsın.'),
          dugme('Anladım', modalKapat)));
      }
    });
  };
  adim1();
}
function tasimaBildir() {
  const t = DURUM.tasima;
  modalAc(h('div', { class: 'karsilama' },
    h('div', { class: 'karsilamaMaskot', html: bulbulSVG('mutlu') }),
    h('h2', null, 'Perde Macerası artık Seyir!'),
    h('p', null, 'İlerlemen yeni sisteme taşındı:'),
    h('ul', { class: 'ozetListe' }, t.ozet.map(function (x) { return h('li', null, x); })),
    dugme('Yeniliklere bak', function () { t.gosterildi = true; kaydet(); yenilikler(); }, 'ikincil'),
    dugme('Hadi başlayalım', function () { t.gosterildi = true; kaydet(); modalKapat(); rehberBaslat(); })), { kapatilamaz: true });
}

// =====================================================
// GERİ TUŞU
// =====================================================
GERI_ISLEYICI = function () {
  if (typeof rehberAcikMi === 'function' && rehberAcikMi()) { rehberKapat(); return true; }
  const balon = document.querySelector('.terimBalon');
  if (balon) { balon.remove(); return true; }
  if (modalAcikMi()) {
    if ($('modal').dataset.kapatilabilir) modalKapat();
    return true;
  }
  if ($('ekranOyun').classList.contains('acik')) { turdanCik(true); return true; }
  if ($('ekranDers').classList.contains('acik')) { DERS = null; anaEkranaDon(); return true; }
  if (SEKME !== 'yol') { sekmeAc('yol'); return true; }
  if (YOL_FILTRE) { YOL_FILTRE = null; sekmeAc('yol'); return true; }
  return false;
};
