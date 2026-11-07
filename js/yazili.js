// =====================================================
// YAZILI SINAVA HAZIRLIK (3.2)
// Sınavı yazılı olan ortak dersler için (ders verisinde yazili: true).
// Uygulama yazılı cevabı okuyup puanlayamaz. Bu yüzden öğrenci cevabını kafasında,
// kâğıtta ya da kutuda kurar; örnek cevabı açar; ana noktalardan hangilerini
// söylediğini kendisi işaretler (öz değerlendirme). Zayıf kalan sorular öne alınır.
// Ünite verisi: { no, ad, ozet:[[başlık, html]], acik:[[soru, cevapHtml, [ana noktalar], vurgu?]], kavram:[[terim, tanım]] }
// Ders verisi ek alanlar: yazili, kaynak (html), siniflar:[{soru, kutular:[[key, ad]], ogeler:[[metin, key]], not?}], siralar:[{soru, ogeler:[...doğru sırayla], not?}]
// Kayıt: DURUM.ortak[dersId].s[soruId] = { o: 0..1 son öz puan, n: kaç kez, t: gün }
//        DURUM.ortak[dersId].u[no].en = ünitedeki açık soruların ortalama hazırlığı (%)
// =====================================================
'use strict';

const YAZILI_PROVA = 6;    // karışık provada soru sayısı
const YAZILI_UNITE = 8;    // ünite çalışmasında en çok soru

function yaziliKayit(d) { const k = ortakKayit(d); k.s = k.s || {}; return k.s; }
function yaziliPuan(d, id) { const x = yaziliKayit(d)[id]; return x ? x.o : null; }
function yaziliAcikId(u, i) { return u.no + 'a' + i; }
function yaziliKavramId(u, i) { return u.no + 'k' + i; }

// Ünite hazırlığı: açık soruların son öz puanlarının ortalaması (hiç denenmemiş = 0)
function yaziliUniteYuzde(d, u) {
  if (!u.acik || !u.acik.length) return 0;
  let t = 0;
  u.acik.forEach(function (_, i) { t += yaziliPuan(d, yaziliAcikId(u, i)) || 0; });
  return Math.round(100 * t / u.acik.length);
}
function yaziliUniteGuncelle(d, no) {
  const u = d.uniteler.find(function (x) { return x.no === no; });
  if (!u) return;
  ortakUnite(d, no).en = yaziliUniteYuzde(d, u);
}
function yaziliGenelYuzde(d) {
  let t = 0, n = 0;
  d.uniteler.forEach(function (u) { (u.acik || []).forEach(function (_, i) { t += yaziliPuan(d, yaziliAcikId(u, i)) || 0; n++; }); });
  return n ? Math.round(100 * t / n) : 0;
}
function yaziliKavramBilinen(d) {
  let b = 0, n = 0;
  d.uniteler.forEach(function (u) { (u.kavram || []).forEach(function (_, i) { n++; if ((yaziliPuan(d, yaziliKavramId(u, i)) || 0) >= 0.75) b++; }); });
  return { b: b, n: n };
}
function yaziliSayilar(d) {
  let a = 0, v = 0, k = 0;
  d.uniteler.forEach(function (u) { (u.acik || []).forEach(function (x) { a++; if (x[3]) v++; }); k += (u.kavram || []).length; });
  return { acik: a, vurgu: v, kavram: k };
}

// ---------- Soru nesneleri ----------
function yaziliAcikSorusu(d, u, i) {
  const a = u.acik[i];
  return {
    tip: 'acik', soru: { metin: a[0], kucuk: true },
    alt: (a[3] ? '📌 Hocanın vurguladığı · ' : '') + 'Ünite ' + u.no + ': ' + u.ad,
    acik: { id: yaziliAcikId(u, i), cevap: a[1], noktalar: a[2] },
    ders: d, unite: u.no, dogruMetin: '', aciklama: '', otoYok: true
  };
}
function yaziliKavramSorusu(d, u, i) {
  const k = u.kavram[i];
  return {
    tip: 'acik', soru: { metin: k[0], kucuk: k[0].length > 26 },
    alt: '🃏 Kavram · Ünite ' + u.no,
    acik: { id: yaziliKavramId(u, i), cevap: k[1], kavram: true },
    ders: d, unite: u.no, dogruMetin: '', aciklama: '', otoYok: true
  };
}
// Önce hiç denenmemişler, sonra puanı düşük olanlar; biraz rastgelelik, aynı puanda sıra hep aynı olmasın
function yaziliSec(d, liste, adet, siraKoru) {
  const L = liste.map(function (x, i) {
    const p = yaziliPuan(d, x.acik.id);
    return { x: x, i: i, p: p, k: (p == null ? -1 : p) + Math.random() * 0.35 };
  });
  L.sort(function (a, b) {
    if (siraKoru && a.p == null && b.p == null) return a.i - b.i;   // ilk geçişte konu sırasıyla
    return a.k - b.k;
  });
  return L.slice(0, adet).map(function (o) { return o.x; });
}

// ---------- Açık uçlu soru çizimi (motor.js: tip 'acik') ----------
function acikCiz(alan, veri, q, kontrol) {
  const A = veri.acik;
  const kap = h('div', { class: 'acikKap' });
  let yazi = null;
  if (A.noktalar) {
    kap.appendChild(h('p', { class: 'acikIpucu' }, 'Cevabını kur, sonra örnekle karşılaştır. Beklenen: ' + A.noktalar.length + ' ana nokta.'));
    yazi = h('textarea', { class: 'acikYazi', rows: 4, 'aria-label': 'Cevabın (isteğe bağlı)', placeholder: 'İstersen buraya yaz: puanlanmaz, kaydedilmez. Kâğıda yazmak ya da sesli anlatmak da olur.' });
    kap.appendChild(yazi);
  } else {
    kap.appendChild(h('p', { class: 'acikIpucu' }, 'Önce kendin tanımla (bir iki cümle), sonra aç.'));
  }
  alan.appendChild(kap);
  kontrol.hidden = false;
  kontrol.textContent = A.noktalar ? 'Örnek cevabı göster' : 'Tanımı göster';
  kontrol.onclick = function () {
    if (q.acildi || q.cevaplandi) return;
    q.acildi = true;
    if (yazi) { if (yazi.value.trim()) yazi.readOnly = true; else yazi.remove(); }
    const cevap = h('div', { class: 'acikCevap' }, h('div', { class: 'acikEtiket' }, A.noktalar ? 'Örnek cevap' : 'Tanım'), h('div', { class: 'dersMetin', html: A.cevap }));
    kap.appendChild(cevap);
    if (A.noktalar) {
      const isaret = A.noktalar.map(function () { return false; });
      const sayYaz = function () { kontrol.textContent = 'Değerlendir · ' + isaret.filter(Boolean).length + '/' + A.noktalar.length; };
      const liste = h('div', { class: 'acikNoktalar' }, h('div', { class: 'acikEtiket' }, 'Senin cevabında hangileri vardı?'));
      A.noktalar.forEach(function (n, i) {
        const b = h('button', { type: 'button', class: 'acikNokta', 'aria-pressed': 'false' }, h('i', null), h('span', null, n));
        b.onclick = function () {
          if (q.cevaplandi) return;
          isaret[i] = !isaret[i];
          b.classList.toggle('secili', isaret[i]);
          b.setAttribute('aria-pressed', String(isaret[i]));
          sayYaz();
        };
        liste.appendChild(b);
      });
      kap.appendChild(liste);
      sayYaz();
      kontrol.onclick = function () {
        if (q.cevaplandi) return;
        const n = isaret.filter(Boolean).length;
        acikSonuc(veri, q, n / A.noktalar.length, n, A.noktalar.filter(function (_, i) { return !isaret[i]; }));
      };
    } else {
      kontrol.hidden = true;
      const sec = h('div', { class: 'acikOz' },
        dugme('✗ Bilmedim', function () { acikSonuc(veri, q, 0); }, 'gri'),
        dugme('≈ Kısmen', function () { acikSonuc(veri, q, 0.5); }, 'ikincil'),
        dugme('✓ Bildim', function () { acikSonuc(veri, q, 1); }));
      kap.appendChild(sec);
    }
    setTimeout(function () { try { cevap.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {} }, 40);
  };
}

function acikSonuc(veri, q, oran, n, eksik) {
  if (q.cevaplandi) return;
  const A = veri.acik, d = veri.ders;
  if (d && A.id) {
    const s = yaziliKayit(d), x = s[A.id] = s[A.id] || { n: 0 };
    x.o = Math.round(oran * 100) / 100; x.n++; x.t = bugun();
    if (!A.kavram) yaziliUniteGuncelle(d, veri.unite);
  }
  (TUR.acikSonuclar = TUR.acikSonuclar || []).push({ veri: veri, oran: oran });
  q.acikOz = true;
  const tam = A.noktalar ? A.noktalar.length : 0;
  const sonuc = oran >= 0.75 ? true : oran >= 0.4 ? 'yarim' : false;
  let mesaj;
  if (A.kavram) mesaj = oran >= 1 ? '✓ Biliyordun' : oran > 0 ? '≈ Kısmen: tanımı bir kez daha oku' : '↻ Bu kavram yine gelecek';
  else mesaj = sonuc === true ? '✓ Güçlü cevap · ' + n + '/' + tam : sonuc === 'yarim' ? '≈ Kısmen · ' + n + '/' + tam + ' ana nokta' : '↻ ' + n + '/' + tam + ' · bu soru yine gelecek';
  veri.aciklama = eksik && eksik.length && sonuc !== true ? '<b>Eksik kalan:</b> ' + eksik.map(kacis).join(' · ') : '';
  cevapla(sonuc, mesaj);
}

// ---------- Turlar ----------
function yaziliTur(d, baslik, uret, kaydetF) {
  const sorular = uret();
  if (!sorular.length) { toast('Bu bölümde soru yok'); return; }
  turBaslat({
    tip: 'ortak', sorular: sorular, kalp: 0, joker: false, kayit: false, sure: 0, etiket: d.ikon + ' ' + baslik,
    bitince: function (r) {
      const S = (r.tur && r.tur.acikSonuclar) || [];
      const ort = S.length ? Math.round(100 * S.reduce(function (t, x) { return t + x.oran; }, 0) / S.length) : 0;
      if (kaydetF) kaydetF(ort);
      kaydet();
      const kavramMi = S.length && S[0].veri.acik.kavram;
      const zayif = S.filter(function (x) { return x.oran < 0.75; });
      const not = ort >= 85 ? 'Çok iyi: bu sorular yazılıda seni zorlamaz.' : ort >= 60 ? 'İyi gidiyor. Eksik kalan noktalara bir daha bak.' : 'Konu anlatımını bir kez daha oku; zayıf sorular bir sonraki turda önce gelecek.';
      const liste = zayif.length ? h('div', { class: 'ortakYanlis' },
        h('h3', null, kavramMi ? 'Bir daha bak' : 'Bir daha bak (örnek cevaplar)'),
        zayif.map(function (x) {
          return h('details', { class: 'yzBanka' }, h('summary', null, x.veri.soru.metin), h('div', { class: 'dersMetin', html: x.veri.acik.cevap }));
        })) : null;
      modalAc(h('div', { class: 'sonuc' },
        h('div', { class: 'sonucMaskot', html: bulbulSVG(ort >= 60 ? 'mutlu' : 'anlat') }),
        h('h2', null, baslik),
        h('div', { class: 'ortakSkor' }, h('b', null, '%' + ort), h('span', null, kavramMi ? 'kavram bilgisi (öz değerlendirme)' : 'öz değerlendirme · ' + S.length + ' soru')),
        h('p', null, not),
        liste,
        dugme('Tekrar çalış', function () { modalKapat(); yaziliTur(d, baslik, uret, kaydetF); }),
        dugme(d.kisa + '’e dön', function () { modalKapat(); turdanCik(false); }, 'gri')), { kapatilamaz: true, genis: !!liste });
    }
  });
}
function yaziliUniteCalis(u) {
  const d = u.ders;
  yaziliTur(d, 'Ünite ' + u.no + ' · yazılı', function () {
    return yaziliSec(d, u.acik.map(function (_, i) { return yaziliAcikSorusu(d, u, i); }), YAZILI_UNITE, true);
  });
}
function yaziliUniteKavram(u) {
  const d = u.ders;
  yaziliTur(d, 'Ünite ' + u.no + ' · kavramlar', function () {
    return yaziliSec(d, u.kavram.map(function (_, i) { return yaziliKavramSorusu(d, u, i); }), 30);
  });
}
function yaziliProva(d, yalnizVurgu) {
  yaziliTur(d, yalnizVurgu ? 'Hocanın vurguladıkları' : 'Yazılı provası', function () {
    const L = [];
    d.uniteler.forEach(function (u) { (u.acik || []).forEach(function (a, i) { if (!yalnizVurgu || a[3]) L.push(yaziliAcikSorusu(d, u, i)); }); });
    return yaziliSec(d, L, yalnizVurgu ? 8 : YAZILI_PROVA);
  }, function (y) { const k = ortakKayit(d); if (!yalnizVurgu) k.prova = Math.max(k.prova || 0, y); });
}
function yaziliKavramlar(d) {
  yaziliTur(d, 'Kavram kartları', function () {
    const L = [];
    d.uniteler.forEach(function (u) { (u.kavram || []).forEach(function (_, i) { L.push(yaziliKavramSorusu(d, u, i)); }); });
    return yaziliSec(d, L, 12);
  });
}

// Sırala ve sınıflandır: nesnel sorular (mevcut 'sinif' ve 'dizi' tipleri)
function yaziliSinifSorusu(s) {
  const ogeler = karistir(s.ogeler).slice(0, s.adet || 6);
  const ad = {}; s.kutular.forEach(function (k) { ad[k[0]] = k[1]; });
  return {
    tip: 'sinif', soru: { metin: s.soru, kucuk: true },
    sinif: { kutular: s.kutular.map(function (k) { return { key: k[0], metin: k[1] }; }), ogeler: ogeler.map(function (o, i) { return { key: 'o' + i, metin: o[0], dogru: o[1] }; }) },
    dogruMetin: ogeler.map(function (o) { return o[0] + ' → ' + ad[o[1]]; }).join(' · '),
    aciklama: s.not || ''
  };
}
function yaziliSiraSorusu(s) {
  const og = s.ogeler.map(function (m, i) { return { key: 's' + i, metin: m }; });
  return {
    tip: 'dizi', soru: { metin: s.soru, kucuk: true },
    dizi: { havuz: karistir(og.slice()), uzunluk: og.length, beklenen: og.map(function (o) { return o.key; }), genis: true },
    dogruMetin: 'doğru sıra aşağıda',
    aciklama: '<ol class="kronListe">' + s.ogeler.map(function (m) { return '<li>' + kacis(m) + '</li>'; }).join('') + '</ol>' + (s.not ? '<p class="soluk">' + s.not + '</p>' : '')
  };
}
function yaziliEslestir(d) {
  const uret = function () {
    const L = (d.siniflar || []).map(yaziliSinifSorusu).concat((d.siralar || []).map(yaziliSiraSorusu));
    return karistir(L).slice(0, 8);
  };
  const L = uret(); L.yenile = uret;
  ortakTur(d, 'Sırala ve sınıflandır', L, 0, function (y) { const k = ortakKayit(d), eski = k.es; k.es = Math.max(k.es || 0, y); return eski; });
}

// ---------- 3.2.2: Ünite “Anladım mı?” testi (genel çıkarım soruları, js/ortak/anlama.js) ----------
function yaziliAnlamaTesti(u) {
  const d = u.ders;
  const uret = function () {
    return karistir(u.test.slice()).map(function (s) {
      const q = ortakSecimSorusu(u, s);
      if (s[3]) q.aciklama = s[3];
      return q;
    });
  };
  const L = uret(); L.yenile = uret;
  ortakTur(d, 'Ünite ' + u.no + ' · Anladım mı?', L, 0, function (y) {
    const k = ortakUnite(d, u.no), eski = k.ts;
    k.ts = Math.max(k.ts || 0, y);
    return eski;
  });
}

// ---------- Soru bankası: bütün sorular ve örnek cevaplar ----------
function yaziliBanka(d) {
  let filtre = 'hepsi';
  const sec = h('div', { class: 'segment' });
  const govde = h('div', { class: 'yzGovde' });
  function ciz() {
    bosalt(sec);
    [['hepsi', 'Hepsi'], ['vurgu', '📌 Vurgulu'], ['zayif', 'Zayıflarım']].forEach(function (x) {
      sec.appendChild(h('button', { type: 'button', class: filtre === x[0] ? 'aktif' : '', onclick: function () { filtre = x[0]; ciz(); } }, x[1]));
    });
    bosalt(govde);
    let bos = true;
    d.uniteler.forEach(function (u) {
      const sat = [];
      (u.acik || []).forEach(function (a, i) {
        const p = yaziliPuan(d, yaziliAcikId(u, i));
        if (filtre === 'vurgu' && !a[3]) return;
        if (filtre === 'zayif' && !(p == null || p < 0.75)) return;
        const isaret = p == null ? '' : p >= 0.75 ? ' ✓' : ' ·';
        sat.push(h('details', { class: 'yzBanka' },
          h('summary', null, (a[3] ? '📌 ' : '') + a[0] + isaret),
          h('div', { class: 'dersMetin', html: a[1] }),
          h('p', { class: 'kucukNot' }, 'Ana noktalar: ' + a[2].join(' · '))));
      });
      if (!sat.length) return;
      bos = false;
      govde.appendChild(h('div', { class: 'zcYil' }, 'Ünite ' + u.no + ': ' + u.ad));
      sat.forEach(function (x) { govde.appendChild(x); });
    });
    if (bos) govde.appendChild(h('p', { class: 'kucukNot' }, filtre === 'zayif' ? 'Zayıf sorun kalmadı 🎉' : 'Soru yok.'));
  }
  ciz();
  modalAc(h('div', null, h('h2', null, '📋 Soru bankası'),
    h('p', { class: 'kucukNot' }, 'Önce soruyu oku ve cevabını kafanda kur; sonra açıp karşılaştır.'),
    sec, govde,
    dugme('Kapat', modalKapat, 'gri')), { genis: true });
}

function yaziliTaktik(d) {
  modalAc(h('div', null,
    h('h2', null, '💡 Yazılıda iyi cevap'),
    h('div', { class: 'dersMetin yzTaktik', html: d.taktik || YAZILI_TAKTIK }),
    dugme('Anladım', modalKapat)), { genis: true });
}
const YAZILI_TAKTIK =
  '<p>Uygulama yazdığını okuyamaz; ama yazılı sınavda puanı neyin getirdiğini bilirsen kendini doğru değerlendirirsin. İyi bir cevap çoğunlukla dört adımdır:</p>' +
  '<ol><li><b>Tanımla.</b> Kavramı bir cümleyle söyle (“Uzun hava, belli bir usule bağlı olmayan…”).</li>' +
  '<li><b>Açıkla.</b> Nasıl ve neden: işleyişi, nedeni, sonucu.</li>' +
  '<li><b>Örnekle.</b> Bir isim, eser, yer ya da tarih ver. Kanıt, puanı yükseltir.</li>' +
  '<li><b>Bağla.</b> Gerekiyorsa karşılaştır ya da başka bir konuya bağla (“tekkeden farklı olarak camide…”).</li></ol>' +
  '<p><b>Çalışma yolu:</b> Konu anlatımını oku → ünitenin açık sorularını çöz → kavram kartlarıyla terimleri pekiştir → sınavdan önce <b>📌 vurgulananlar</b> ve <b>yazılı provası</b>.</p>' +
  '<p><b>Kendini puanlarken dürüst ol:</b> Ana noktayı sadece “hatırlıyorum” diye değil, cevabında <i>söylediysen</i> işaretle. Zayıf işaretlediğin sorular sonraki turlarda önce gelir.</p>';

// ---------- Ders sayfası ve ünite menüsü ----------
function yaziliDersCiz(g, d) {
  const k = ortakKayit(d), say = yaziliSayilar(d), kv = yaziliKavramBilinen(d);
  g.appendChild(h('div', { class: 'ortakBas', style: '--r:' + d.renk },
    h('button', { class: 'geriOk', type: 'button', 'aria-label': 'Öğren’e dön', onclick: function () { ORTAK_ACIK = null; sekmeAc('ogren'); } }, '‹'),
    h('span', { class: 'ik' }, d.ikon),
    h('div', null, h('h2', null, d.ad), h('p', null, d.kisa + ' · yazılı sınav · ' + ortakBitenSay(d) + '/' + d.uniteler.length + ' ünite anlaşıldı'))));
  const kutu = function (renk, ik, ad, alt, skor, f) {
    return h('button', { class: 'oKutu', type: 'button', style: '--r:' + renk, onclick: f }, h('span', { class: 'ik' }, ik), h('b', null, ad), h('small', null, alt), skor ? h('small', { class: 'skor' }, skor) : null);
  };
  const es = (d.siniflar || []).length + (d.siralar || []).length;
  const izgara = h('div', { class: 'oIzgara' },
    say.kavram ? kutu('var(--turkuaz)', '🃏', 'Kavram kartları', say.kavram + ' kavram · önce sen tanımla', kv.b + '/' + kv.n + ' biliniyor', function () { yaziliKavramlar(d); }) : null,
    kutu('var(--zumrut)', '📋', 'Soru bankası', say.acik + ' soru ve örnek cevap', null, function () { yaziliBanka(d); }));
  g.appendChild(izgara);
  if (d.kaynak) g.appendChild(h('p', { class: 'kucukNot', html: d.kaynak }));
  g.appendChild(h('div', { class: 'oBolum' }, 'Üniteler'));
  const liste = h('div', { class: 'oOrtak' });
  d.uniteler.forEach(function (u) {
    const x = k.u[u.no] || {};
    const durum = x.ts >= 70 ? 'b' : x.oz || x.ts != null ? 's' : '';
    liste.appendChild(h('button', { class: 'oUnite ' + durum, type: 'button', style: '--r:' + d.renk, onclick: function () { ortakUniteMenu(u); } },
      h('i', null, x.ts >= 70 ? '✓' : String(u.no)),
      h('span', { class: 'm' }, h('b', null, u.ad), h('small', null, u.ozet.length + ' kart · ' + (u.test || []).length + ' test sorusu')),
      h('small', { class: 'yuzde' }, x.ts != null ? '%' + x.ts : '›')));
  });
  g.appendChild(liste);
}
function yaziliUniteMenu(u) {
  const d = u.ders, x = ortakUnite(d, u.no);
  let cevaplanan = 0;
  (u.acik || []).forEach(function (_, i) { if (yaziliPuan(d, yaziliAcikId(u, i)) != null) cevaplanan++; });
  modalAc(h('div', null,
    h('p', { class: 'kucukNot' }, d.ikon + ' ' + d.kisa + ' · Ünite ' + u.no),
    h('h2', null, u.ad),
    h('p', null, (x.oz ? '✓ Konu anlatımını okudun. ' : '') + (x.ts != null ? 'Test rekorun: %' + x.ts : 'Henüz test çözmedin.')),
    dugme('📖 Konu anlatımı (' + u.ozet.length + ' kart)', function () { modalKapat(); ortakOzet(u); }),
    u.test && u.test.length ? dugme('✏️ Anladım mı? (' + u.test.length + ' soru)', function () { modalKapat(); yaziliAnlamaTesti(u); }) : null,
    u.acik && u.acik.length ? dugme('✍️ Yazılıya çalış (' + Math.min(YAZILI_UNITE, u.acik.length) + ' açık soru)', function () { modalKapat(); yaziliUniteCalis(u); }, 'ikincil') : null,
    u.kavram && u.kavram.length ? dugme('🃏 Kavramlar (' + u.kavram.length + ')', function () { modalKapat(); yaziliUniteKavram(u); }, 'ikincil') : null,
    dugme('Kapat', modalKapat, 'gri')));
}
