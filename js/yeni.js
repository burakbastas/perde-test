// =====================================================
// 2.10 – 2.12: YENİ SORU TİPLERİ VE YENİ SEVİYELER
// Eksiğini tamamla, adım adım kur, hatayı bul, doğru mu yanlış mı, sınıflandır, eşleştir,
// farkı bul, hesapla. Seviyeler mevcut ünitelere eklenir (motor.js yüklenmeden önce):
//  · bonus: true  → köprü seviyesi, her zaman isteğe bağlı
//  · yeni: true   → yeni oyuncu için zincirde; üniteyi önceden bitirmiş oyuncu için isteğe bağlı
// Seviye kimlikleri kalıcıdır; değiştirilmez.
// =====================================================
'use strict';

function ykPL() { return PERDELER.filter(Boolean); }
function ykKaristirAl(a, n) { return karistir(a).slice(0, n); }
function ykSecim(o) {
  // o: { oge, soru (metin), alt, dogru: metin, yanlislar: [metin], aciklama, ipucu, kucuk }
  const L = [o.dogru].concat(o.yanlislar.filter(function (x) { return x !== o.dogru; }));
  return {
    oge: o.oge || null, tip: 'secim',
    soru: { metin: o.soru, kucuk: o.kucuk !== false },
    alt: o.alt || null,
    siklar: benzersiz(L).map(function (x, i) { return { key: 'y' + i + ':' + x, metin: x }; }),
    dogru: 'y0:' + o.dogru, dogruMetin: o.dogru,
    aciklama: o.aciklama || '', ipucu: o.ipucu || null, liste: o.liste
  };
}
// Doğru mu, yanlış mı? (şansı %50: finallerde kullanılmaz)
function ykDY(oge, iddia, dogruMu, aciklama) {
  return {
    oge: oge || null, tip: 'secim', soru: { metin: iddia, kucuk: true }, alt: 'Doğru mu, yanlış mı?',
    siklar: [{ key: 'D', metin: '✔ Doğru' }, { key: 'Y', metin: '✘ Yanlış' }],
    dogru: dogruMu ? 'D' : 'Y', dogruMetin: dogruMu ? 'Doğru' : 'Yanlış', aciklama: aciklama || ''
  };
}
function ykUretici(f) {
  return function (n) {
    const L = []; let onceki = '';
    for (let i = 0; i < n; i++) {
      let q = null;
      for (let d = 0; d < 10; d++) { q = f(i); const imza = JSON.stringify(q.soru) + (q.sinif ? JSON.stringify(q.sinif.ogeler.map(function (o) { return o.key; })) : ''); if (imza !== onceki) { onceki = imza; break; } }
      L.push(q);
    }
    return L;
  };
}
function ykKarma(ureticiler) {
  return function (n) {
    const L = [];
    for (let i = 0; i < n; i++) L.push(ureticiler[i % ureticiler.length](1)[0]);
    return karistir(L);
  };
}

// ---------- Eksiğini tamamla / adım adım: porteye yazma sorusunun bir kısmı hazır gelir ----------
// mod: 'yarim' (yarısı hazır), 'tek' (yalnız bir nota boş), 'alt' / 'ust' (dizinin alt ya da üst yarısı boş)
function ykEksik(q, mod) {
  if (!q || q.tip !== 'yer') return q;
  const y = q.yer, bek = y.beklenen;
  const serbest = [];
  y.slotlar.forEach(function (sl, i) { if (!sl.sabit) serbest.push(i); });
  if (serbest.length < 2) return q;
  let bos;
  if (mod === 'tek') bos = [rastgele(serbest)];
  else if (mod === 'alt') bos = serbest.slice(0, Math.ceil(serbest.length / 2));
  else if (mod === 'ust') bos = serbest.slice(Math.floor(serbest.length / 2));
  else bos = ykKaristirAl(serbest, Math.max(1, Math.floor(serbest.length / 2)));
  const yeniSlot = y.slotlar.map(function (sl, i) {
    if (sl.sabit || bos.indexOf(i) >= 0) return sl;
    return { sabit: bek[i] };
  });
  const kabul = (y.kabul || [bek]).filter(function (k) {
    return k.every(function (n, i) { return bos.indexOf(i) >= 0 || yeniSlot[i].sabit === undefined || notaEsit(n, bek[i]) || (y.slotlar[i].sabit && notaEsit(n, y.slotlar[i].sabit)); });
  });
  const yq = Object.assign({}, q, { yer: Object.assign({}, y, { slotlar: yeniSlot, kabul: kabul.length ? kabul : [bek] }) });
  const isaretli = bos.every(function (i) { return y.slotlar[i].konum; });
  if (isaretli && bos.length === 1 && serbest.length === 2) yq.alt = (q.yerSatiri ? q.yerSatiri + '. ' : '') + 'Bir yazım verildi: öbür notanın işaretini koy';
  else if (isaretli) yq.alt = 'Bazı işaretler verildi: eksik işaretleri koy';
  else yq.alt = (mod === 'tek' ? 'Tek eksik nota: ' : 'Eksik notaları tamamla: ') + (q.alt || '');
  return yq;
}
function ykEksikUretici(s, mod) {
  return function (n) { return s.uret(n).map(function (q) { return ykEksik(q, mod); }); };
}

// =====================================================
// KOMA: tabloyu ezberletir (ad · koma · harf · diyez · bemol). Hesap sorusu yok.
// =====================================================
const KM5 = function () { return KM_VERI.slice(0, 5); };
function kmSatirMetni(v, alan, deger) {
  const d = { ad: v.ad, koma: kmKoma(v) + ' koma', harf: 'harf ' + v.kod };
  if (alan) d[alan] = deger;
  return d.ad + ' · ' + d.koma + ' · ' + d.harf;
}
// Hatayı bul: dört satırdan biri yanlış
function kmHataSorusu() {
  const L = ykKaristirAl(KM5(), 4), bozuk = rastgele(L);
  const alan = rastgele(['koma', 'harf']);
  const baska = rastgele(KM5().filter(function (v) { return v !== bozuk; }));
  const yanlisDeger = alan === 'koma' ? kmKoma(baska) + ' koma' : 'harf ' + baska.kod;
  const satirlar = L.map(function (v) { return v === bozuk ? kmSatirMetni(v, alan, yanlisDeger) : kmSatirMetni(v); });
  const q = ykSecim({ oge: bozuk.oge, soru: 'Hangi satırda hata var?', dogru: satirlar[L.indexOf(bozuk)], yanlislar: satirlar.filter(function (x, i) { return L[i] !== bozuk; }),
    aciklama: 'Doğrusu: <b>' + bozuk.ad + '</b> = ' + kmKoma(bozuk) + ' koma, simge harfi <b>' + bozuk.kod + '</b>.', liste: true });
  q.kmKart = { yuz: alan === 'koma' ? 'koma' : 'harf', tur: null };
  return q;
}
// Eşleştir: işaret ↔ ad, ad ↔ koma, işaret ↔ harf
function kmEsleSorusu() {
  const tur = rastgele(['isaretAd', 'adKoma', 'isaretHarf']);
  const L = ykKaristirAl(KM5(), 4);
  let ogeler, kutular, baslik;
  if (tur === 'adKoma') {
    baslik = 'Her aralığı koma sayısıyla eşleştir';
    ogeler = L.map(function (v) { return { key: v.ad, metin: v.ad, dogru: kmKoma(v) }; });
    kutular = L.map(function (v) { return { key: kmKoma(v), metin: kmKoma(v) }; });
  } else {
    const yon = rastgele(['+', '-']);
    baslik = tur === 'isaretAd' ? 'Her işareti aralığıyla eşleştir' : 'Her işareti simge harfiyle eşleştir';
    ogeler = L.map(function (v) { return { key: v.ad + yon, glif: glifStr(kmIsaretKod(v, yon)), dogru: tur === 'isaretAd' ? v.ad : v.kod }; });
    kutular = L.map(function (v) { return tur === 'isaretAd' ? { key: v.ad, metin: v.ad.replace(' Mücenneb', ' Müc.') } : { key: v.kod, metin: v.kod }; });
  }
  return { oge: L[0].oge, tip: 'sinif', soru: { metin: baslik, kucuk: true }, sinif: { kutular: karistir(kutular), ogeler: ogeler },
    dogruMetin: L.map(function (v) { return v.ad + ' ' + kmKoma(v) + ' (' + v.kod + ')'; }).join(' · '),
    aciklama: KM5().map(function (v) { return '<b>' + v.ad + '</b> ' + kmKoma(v) + ' koma · ' + v.kod; }).join('<br>') };
}
function kmDYSorusu() {
  const v = rastgele(KM5()), dogru = Math.random() < 0.5;
  const alan = rastgele(['koma', 'harf']);
  const b = rastgele(KM5().filter(function (x) { return x !== v; }));
  const deger = alan === 'koma' ? (dogru ? kmKoma(v) : kmKoma(b)) + ' komadır' : 'simge harfi ' + (dogru ? v.kod : b.kod);
  const q = ykDY(v.oge, v.ad + ' ' + deger + '.', dogru, '<b>' + v.ad + '</b> = ' + kmKoma(v) + ' koma, simge harfi <b>' + v.kod + '</b>.');
  q.kmKart = { yuz: alan === 'koma' ? 'koma' : 'harf', tur: null };
  return q;
}
// Tablonun boş hücresi: satırın biri "?"
function kmEksikHucre() {
  const v = rastgele(KM5()), alan = rastgele(['koma', 'harf', 'ad']);
  const satir = kmSatirMetni(v, alan, '?').replace('? koma', '? koma').replace('harf ?', 'harf ?');
  const tum = alan === 'koma' ? KM5().map(function (x) { return kmKoma(x) + ' koma'; }) : alan === 'harf' ? KM5().map(function (x) { return x.kod; }) : KM5().map(function (x) { return x.ad; });
  const dogru = alan === 'koma' ? kmKoma(v) + ' koma' : alan === 'harf' ? v.kod : v.ad;
  const q = ykSecim({ oge: v.oge, soru: satir, alt: 'Boş hücreye ne gelir?', dogru: dogru, yanlislar: ykKaristirAl(tum.filter(function (x) { return x !== dogru; }), 3),
    aciklama: '<b>' + v.ad + '</b> = ' + kmKoma(v) + ' koma, simge harfi <b>' + v.kod + '</b>.' });
  q.kmKart = { yuz: alan === 'harf' ? 'harf' : alan, tur: alan === 'koma' ? null : alan === 'harf' ? null : 'ad' };
  return q;
}

// =====================================================
// PERDE
// =====================================================
const PERDE_KARISAN = [['Nim Hicaz', 'Hicaz'], ['Hicaz', 'Dik Hicaz'], ['Kürdi', 'Dik Kürdi'], ['Segâh', 'Bûselik'], ['Dik Kürdi', 'Segâh'],
  ['Nim Hisar', 'Hisar'], ['Hisar', 'Dik Hisar'], ['Evç', 'Mahur'], ['Irak', 'Geveşt'], ['Nim Zirgüle', 'Zirgüle'], ['Acem', 'Evç'], ['Sünbüle', 'Tiz Segâh']]
  .filter(function (c) { return PERDE[c[0]] && PERDE[c[1]]; });
function pdAyirtSorusu() {
  const c = rastgele(PERDE_KARISAN), p = PERDE[rastgele(c)], o = c[0] === p.ad ? PERDE[c[1]] : PERDE[c[0]];
  const komsu = ykPL().filter(function (x) { return x !== p && x !== o && Math.abs(x.koma - p.koma) <= 9; });
  const cel = [o].concat(ykKaristirAl(komsu, 2));
  if (Math.random() < 0.5) {
    return { oge: p.oge, tip: 'secim', soru: { porte: perdePorte(p) }, alt: 'Ayırt et: bu hangi perde?',
      siklar: [p].concat(cel).map(function (x) { return { key: x.id, metin: x.ad }; }), dogru: p.id, dogruMetin: p.ad,
      aciklama: '<b>' + p.ad + '</b> = ' + kacis(perdeYazimMetni(p)) + '<br><b>' + o.ad + '</b> = ' + kacis(perdeYazimMetni(o)) + '<br><span class="soluk">' + kacis(perdeKural(p)) + '</span>' };
  }
  return { oge: p.oge, tip: 'secim', soru: { metin: p.ad }, alt: 'Ayırt et: hangi yazım?',
    siklar: [p].concat(cel).map(function (x) { return { key: x.id, porte: perdePorte(x) }; }), dogru: p.id, dogruMetin: perdeYazimMetni(p),
    aciklama: '<b>' + p.ad + '</b> = ' + kacis(perdeYazimMetni(p)) + '<br><b>' + o.ad + '</b> = ' + kacis(perdeYazimMetni(o)) };
}
// Hatayı bul: dört perde-yazım satırından biri yanlış
function pdHataSorusu() {
  const ara = ykPL().filter(function (p) { return !p.tam && p.koma >= PERDE['Rast'].koma && p.koma <= PERDE['Rast'].koma + 53; });
  const L = ykKaristirAl(ara, 4), bozuk = rastgele(L);
  const komsu = rastgele(ara.filter(function (x) { return x !== bozuk && Math.abs(x.koma - bozuk.koma) <= 5; }).concat([ykPL().find(function (x) { return x.koma === bozuk.koma + 1 || x.koma === bozuk.koma - 1; })]).filter(Boolean)) || rastgele(ara);
  const satir = function (p, yaz) { return p.ad + ' = ' + perdeYazimMetni(yaz || p); };
  const metin = L.map(function (p) { return p === bozuk ? satir(p, komsu) : satir(p); });
  return ykSecim({ oge: bozuk.oge, soru: 'Hangi satırdaki yazım yanlış?', dogru: metin[L.indexOf(bozuk)], yanlislar: metin.filter(function (x, i) { return L[i] !== bozuk; }), liste: true,
    aciklama: 'Doğrusu: <b>' + bozuk.ad + '</b> = ' + kacis(perdeYazimMetni(bozuk)) + '. Yazılan, <b>' + komsu.ad + '</b> perdesinin yazımı.' });
}
// Sınıflandır: alt tam perdeden kaç koma tiz?
function pdSinifSorusu() {
  const ara = ykPL().filter(function (p) { return !p.tam && p.koma > PERDE['Kaba Çargâh'].koma; });
  const tamAlt = function (p) { let a = null; ykPL().forEach(function (x) { if (x.tam && x.koma < p.koma && (!a || x.koma > a.koma)) a = x; }); return a; };
  const fark = function (p) { const a = tamAlt(p); return a ? p.koma - a.koma : 0; };
  const gruplar = {};
  ara.forEach(function (p) { const f = fark(p); (gruplar[f] = gruplar[f] || []).push(p); });
  const anahtar = Object.keys(gruplar).filter(function (k) { return ['1', '4', '5', '8'].indexOf(k) >= 0; });
  const L = [];
  ykKaristirAl(anahtar, 4).forEach(function (k) { L.push(rastgele(gruplar[k])); });
  while (L.length < 4) { const p = rastgele(ara); if (L.indexOf(p) < 0 && anahtar.indexOf(String(fark(p))) >= 0) L.push(p); }
  return { oge: L[0].oge, tip: 'sinif', soru: { metin: 'Alttaki tam perdeden kaç koma tiz?', kucuk: true },
    sinif: { kutular: ['1', '4', '5', '8'].map(function (k) { return { key: k, metin: '+' + k }; }), ogeler: karistir(L).map(function (p) { return { key: p.id, metin: p.ad, dogru: String(fark(p)) }; }) },
    dogruMetin: L.map(function (p) { return p.ad + ' +' + fark(p); }).join(' · '),
    aciklama: L.map(function (p) { return '<b>' + p.ad + '</b>: ' + kacis(perdeKural(p)); }).join('<br>') };
}
function pdDYSorusu() {
  const ara = ykPL().filter(function (p) { return !p.tam && p.koma > PERDE['Kaba Çargâh'].koma; });
  const p = rastgele(ara), dogru = Math.random() < 0.5;
  const b = rastgele(ara.filter(function (x) { return x !== p && Math.abs(x.koma - p.koma) <= 4; })) || rastgele(ara);
  return ykDY(p.oge, p.ad + ' = ' + perdeYazimMetni(dogru ? p : b), dogru, '<b>' + p.ad + '</b> = ' + kacis(perdeYazimMetni(p)));
}

// =====================================================
// USUL
// =====================================================
function usHece(u) { return u.olaylar.map(function (e) { return e.hece; }).join(' '); }
function usSinifSorusu() {
  const gruplar = {};
  USULLER.forEach(function (u) { (gruplar[u.zaman] = gruplar[u.zaman] || []).push(u); });
  const zamanlar = ykKaristirAl(Object.keys(gruplar), 4);
  const L = zamanlar.map(function (z) { return rastgele(gruplar[z]); });
  return { oge: null, tip: 'sinif', soru: { metin: 'Her usul kaç zamanlı?', kucuk: true },
    sinif: { kutular: zamanlar.slice().sort(function (a, b) { return a - b; }).map(function (z) { return { key: z, metin: z + ' zaman' }; }), ogeler: L.map(function (u) { return { key: u.id, metin: u.ad, dogru: String(u.zaman) }; }) },
    dogruMetin: L.map(function (u) { return u.ad + ' ' + u.zaman; }).join(' · '),
    aciklama: L.map(function (u) { return '<b>' + u.ad + '</b> ' + u.zaman + ' zaman (' + u.olcu + ')'; }).join('<br>') };
}
function usHataSorusu() {
  const L = ykKaristirAl(USULLER.filter(function (u) { return u.olaylar.length >= 3; }), 4), bozuk = rastgele(L);
  const hece = bozuk.olaylar.map(function (e) { return e.hece; });
  const i = Math.floor(Math.random() * hece.length);
  const degis = { 'düm': 'tek', 'düüm': 'teek', 'tek': 'düm', 'teek': 'düüm', 'ke': 'te', 'te': 'ke', 'tekkâ': 'düm', 'tâ': 'ka' };
  hece[i] = degis[hece[i]] || (hece[i] === 'düm' ? 'tek' : 'düm');
  const metin = L.map(function (u) { return u.ad + ': ' + (u === bozuk ? hece.join(' ') : usHece(u)); });
  if (metin[L.indexOf(bozuk)] === bozuk.ad + ': ' + usHece(bozuk)) return usSinifSorusu();
  return ykSecim({ soru: 'Hangi usulün hecelerinde hata var?', dogru: metin[L.indexOf(bozuk)], yanlislar: metin.filter(function (x, j) { return L[j] !== bozuk; }), liste: true,
    aciklama: 'Doğrusu: <b>' + bozuk.ad + '</b>: ' + usHece(bozuk) });
}
function usDYSorusu() {
  const u = rastgele(USULLER), dogru = Math.random() < 0.5;
  const z = dogru ? u.zaman : rastgele(USULLER.filter(function (x) { return x.zaman !== u.zaman; })).zaman;
  return ykDY(null, u.ad + ' ' + z + ' zamanlıdır.', dogru, '<b>' + u.ad + '</b> ' + u.zaman + ' zaman (' + u.olcu + ').');
}

// =====================================================
// DÖRTLÜ-BEŞLİ
// =====================================================
function dbFarkSorusu() {
  const ciftler = [];
  CESNILER.forEach(function (a) { CESNILER.forEach(function (b) {
    if (a.id < b.id && a.araliklar.length === b.araliklar.length) {
      const f = a.araliklar.map(function (x, i) { return x !== b.araliklar[i]; });
      if (f.filter(Boolean).length === 1 || (f.filter(Boolean).length === 2 && f[0] && f[1])) ciftler.push([a, b, f]);
    }
  }); });
  const c = rastgele(ciftler), a = c[0], b = c[1], f = c[2];
  const dogruIdx = f.map(function (x, i) { return x ? i + 1 : 0; }).filter(Boolean);
  const dogru = dogruIdx.map(function (i) { return i + '.'; }).join(' ve ') + ' aralıkta';
  const sec = [];
  for (let i = 1; i <= a.araliklar.length; i++) sec.push(i + '. aralıkta');
  if (dogruIdx.length === 2) sec.push('1. ve 3. aralıkta', '2. ve 3. aralıkta');
  const q = ykSecim({ oge: a.oge, soru: a.ad + ' ile ' + b.ad, alt: 'Farkı bul: hangi aralıkta ayrılırlar?', dogru: dogru, yanlislar: ykKaristirAl(sec.filter(function (x) { return x !== dogru; }), 3),
    aciklama: '<b>' + a.ad + '</b>: ' + a.formul + '<br><b>' + b.ad + '</b>: ' + b.formul });
  q.dinleSecenek = { cesniler: [a.id, b.id] };   // 3.1.1: ikisi aynı perdeden, isteğe bağlı
  return q;
}
function dbHataSorusu() {
  const L = ykKaristirAl(CESNILER, 4), bozuk = rastgele(L);
  const harfler = 'TKSBA';
  let yanlis = bozuk.formul;
  for (let d = 0; d < 10 && yanlis === bozuk.formul; d++) {
    const i = Math.floor(Math.random() * yanlis.length);
    yanlis = yanlis.slice(0, i) + rastgele(harfler.split('').filter(function (x) { return x !== bozuk.formul[i]; })) + yanlis.slice(i + 1);
  }
  const metin = L.map(function (c) { return c.ad + ': ' + (c === bozuk ? yanlis : c.formul).split('').join(' '); });
  return ykSecim({ oge: bozuk.oge, soru: 'Hangi formül yanlış?', dogru: metin[L.indexOf(bozuk)], yanlislar: metin.filter(function (x, i) { return L[i] !== bozuk; }), liste: true,
    aciklama: 'Doğrusu: <b>' + bozuk.ad + '</b> = ' + bozuk.formul.split('').join(' ') });
}
// Ters çeşni avcısı: bu çeşni hangi makamların dizisinde var?
function dbTersSorusu() {
  const kullanan = {};
  MAKAMLAR.forEach(function (m) { [m.alt[0], m.ust[0]].forEach(function (c) { (kullanan[c] = kullanan[c] || []).push(m); }); });
  const cid = rastgele(Object.keys(kullanan).filter(function (c) { return kullanan[c].length >= 1 && kullanan[c].length < MAKAMLAR.length - 2; }));
  const c = CESNI[cid], var_ = kullanan[cid];
  const L = ykKaristirAl(var_, Math.min(2, var_.length)).concat(ykKaristirAl(MAKAMLAR.filter(function (m) { return var_.indexOf(m) < 0; }), 4 - Math.min(2, var_.length)));
  return { oge: c.oge, tip: 'sinif', soru: { metin: c.ad, kucuk: true }, alt: 'Bu çeşni hangi makamların dizisinde var?',
    sinif: { kutular: [{ key: 'v', metin: 'Var' }, { key: 'y', metin: 'Yok' }], ogeler: karistir(L).map(function (m) { return { key: m.id, metin: m.ad, dogru: var_.indexOf(m) >= 0 ? 'v' : 'y' }; }) },
    dogruMetin: var_.map(function (m) { return m.ad; }).join(', '),
    aciklama: '<b>' + c.ad + '</b> şu makamlarda: ' + var_.map(function (m) { return m.ad + ' (' + (m.alt[0] === cid ? 'alt, ' + m.alt[1] : 'üst, ' + m.ust[1]) + ')'; }).join(', ') };
}
function dbSinifSorusu() {
  const yerler = {};
  CESNILER.forEach(function (c) { (yerler[c.yer] = yerler[c.yer] || []).push(c); });
  const k = ykKaristirAl(Object.keys(yerler), Math.min(3, Object.keys(yerler).length));
  const L = [];
  k.forEach(function (y) { L.push(rastgele(yerler[y])); });
  while (L.length < 4) { const y = rastgele(k), c = rastgele(yerler[y]); if (L.indexOf(c) < 0) L.push(c); else if (yerler[y].length === 1) L.push(c); }
  const tek = benzersiz(L, function (c) { return c.id; });
  return { oge: tek[0].oge, tip: 'sinif', soru: { metin: 'Her çeşni hangi perdede kurulur?', kucuk: true },
    sinif: { kutular: k.map(function (y) { return { key: y, metin: y }; }), ogeler: karistir(tek).map(function (c) { return { key: c.id, metin: c.ad, dogru: c.yer }; }) },
    dogruMetin: tek.map(function (c) { return c.ad + ' → ' + (c.yer); }).join(' · '),
    aciklama: tek.map(function (c) { return '<b>' + c.ad + '</b>: ' + (c.yer); }).join('<br>') };
}

// =====================================================
// MAKAM
// =====================================================
function mkTemel() { return MAKAMLAR.filter(function (m) { return m.dizi; }); }
function mkFarkSorusu() {
  const L = mkTemel(), ciftler = [];
  L.forEach(function (a) { L.forEach(function (b) {
    if (a.id < b.id && (a.alt[0] === b.alt[0] && a.alt[1] === b.alt[1]) !== (a.ust[0] === b.ust[0] && a.ust[1] === b.ust[1])) ciftler.push([a, b]);
  }); });
  const c = rastgele(ciftler), a = c[0], b = c[1];
  const altAyni = a.alt[0] === b.alt[0] && a.alt[1] === b.alt[1];
  const dogru = altAyni ? 'Üst çeşnide' : 'Alt çeşnide';
  return ykSecim({ oge: a.oge, soru: a.ad + ' ile ' + b.ad, alt: 'Farkı bul: dizileri nerede ayrılır?', dogru: dogru, yanlislar: ['Alt çeşnide', 'Üst çeşnide', 'Hiç ayrılmaz', 'İkisinde de'],
    aciklama: '<b>' + a.ad + '</b>: ' + a.altAd + ' + ' + a.ustAd + '<br><b>' + b.ad + '</b>: ' + b.altAd + ' + ' + b.ustAd });
}
// Makamı kur: alt çeşni, yeri, üst çeşni, yeri (4 taş)
function mkKurSorusu() {
  const m = rastgele(mkTemel());
  const dogru = [CESNI[m.alt[0]].ad, m.alt[1], CESNI[m.ust[0]].ad, m.ust[1]];
  const cel = ykKaristirAl(benzersiz(mkTemel().map(function (x) { return CESNI[x.alt[0]].ad; }).concat(mkTemel().map(function (x) { return CESNI[x.ust[0]].ad; }))).filter(function (x) { return dogru.indexOf(x) < 0; }), 2)
    .concat(ykKaristirAl(['Rast', 'Dügâh', 'Neva', 'Hüseyni', 'Çargâh', 'Gerdâniye', 'Segâh', 'Acem'].filter(function (x) { return dogru.indexOf(x) < 0; }), 2));
  const havuz = benzersiz(dogru.concat(cel)).map(function (x) { return { key: x, metin: x }; });
  return { oge: m.oge, tip: 'dizi', soru: { metin: m.ad }, alt: 'Makamı kur: alt çeşni, yeri, üst çeşni, yeri',
    dizi: { havuz: karistir(havuz), uzunluk: 4, beklenen: dogru },
    dogruMetin: dogru[0] + ' (' + dogru[1] + ') + ' + dogru[2] + ' (' + dogru[3] + ')',
    aciklama: '<b>' + m.ad + '</b>: ' + m.altAd + ' + ' + m.ustAd + '. Karar ' + m.karar + ', güçlü ' + m.guclu + '.' };
}
function mkSinifSorusu() {
  const gruplar = {};
  mkTemel().forEach(function (m) { (gruplar[m.guclu] = gruplar[m.guclu] || []).push(m); });
  const k = Object.keys(gruplar);
  const L = [];
  ykKaristirAl(k, Math.min(3, k.length)).forEach(function (g) { L.push(rastgele(gruplar[g])); });
  while (L.length < 4) { const m = rastgele(mkTemel()); if (L.indexOf(m) < 0) L.push(m); }
  const kut = benzersiz(L.map(function (m) { return m.guclu; }));
  return { oge: L[0].oge, tip: 'sinif', soru: { metin: 'Her makamın güçlüsü hangi perde?', kucuk: true },
    sinif: { kutular: kut.map(function (g) { return { key: g, metin: g }; }), ogeler: karistir(L).map(function (m) { return { key: m.id, metin: m.ad, dogru: m.guclu }; }) },
    dogruMetin: L.map(function (m) { return m.ad + ' → ' + m.guclu; }).join(' · '),
    aciklama: L.map(function (m) { return '<b>' + m.ad + '</b>: güçlü ' + m.guclu; }).join('<br>') };
}
function mkDYSorusu() {
  const m = rastgele(mkTemel()), alan = rastgele(['guclu', 'karar', 'yeden']), dogru = Math.random() < 0.5;
  const ad = { guclu: 'güçlüsü', karar: 'kararı', yeden: 'yedeni' }[alan];
  const yanlis = rastgele(benzersiz(mkTemel().map(function (x) { return x[alan]; })).filter(function (x) { return x !== m[alan]; }));
  return ykDY(m.oge, m.ad + ' makamının ' + ad + ' ' + (dogru ? m[alan] : yanlis) + '.', dogru, '<b>' + m.ad + '</b>: karar ' + m.karar + ', güçlü ' + m.guclu + ', yeden ' + m.yeden + '.');
}

// ---- Seyir (2.12) ----
const SEYIR_TURLERI = ['çıkıcı', 'inici', 'inici-çıkıcı'];
function seyirAdimlari(m) {
  const bas = m.seyir === 'çıkıcı' ? 'Karar (' + m.karar + ') civarından başla' : m.seyir === 'inici' ? 'Tiz bölgeden başla' : 'Güçlü (' + m.guclu + ') civarından başla';
  return [bas, 'Güçlüde (' + m.guclu + ') yarım karar', 'Orta bölgede asma kararlarla gezin', 'Kararda (' + m.karar + ') tam karar'];
}
function mkSeyirTuruSorusu(havuz) {
  const m = rastgele(havuz);
  return ykSecim({ oge: m.oge, soru: m.ad, alt: 'Seyri nasıldır?', dogru: m.seyir, yanlislar: SEYIR_TURLERI, kucuk: false,
    aciklama: '<b>' + m.ad + '</b>: ' + m.seyir + ' seyir. ' + (m.not ? '<span class="soluk">' + kacis(m.not) + '</span>' : '') });
}
function mkSeyirSiralaSorusu(havuz) {
  const m = rastgele(havuz), adim = seyirAdimlari(m);
  const L = adim.map(function (x, i) { return { key: 's' + i, metin: x }; });
  return { oge: m.oge, tip: 'dizi', soru: { metin: m.ad + ' · ' + m.seyir, kucuk: true }, alt: 'Seyri sırala',
    dizi: { havuz: karistir(L), uzunluk: 4, beklenen: ['s0', 's1', 's2', 's3'], genis: true },
    dogruMetin: adim.join(' → '), aciklama: adim.map(function (x, i) { return (i + 1) + '. ' + x; }).join('<br>') };
}
function mkKimlikYeniSorusu(havuz) {
  const m = rastgele(havuz);
  const imza = function (x) { return x.karar + '|' + x.guclu + '|' + x.seyir; };
  const dis = karistir(MAKAMLAR.filter(function (x) { return x.dizi && imza(x) !== imza(m); })).slice(0, 3);
  return { oge: m.oge, tip: 'secim', soru: { metin: 'Karar ' + m.karar + ' · güçlü ' + m.guclu + ' · ' + m.seyir + ' seyir', kucuk: true }, alt: 'Hangi makam?',
    siklar: [m].concat(dis).map(function (x) { return { key: x.id, metin: x.ad }; }), dogru: m.id, dogruMetin: m.ad,
    aciklama: '<b>' + m.ad + '</b>: ' + m.altAd + ' + ' + m.ustAd + '. Karar ' + m.karar + ', güçlü ' + m.guclu + ', yeden ' + m.yeden + '.' };
}
function mkYeniDersi() {
  return [{ baslik: 'Aynı dizi, farklı makam', metin: '<p>Bu ünitedeki makamların bazılarının dizisi tanıdık: <b>Muhayyer</b> Hüseyni ile, <b>Muhayyerkürdi</b> ve <b>Acemkürdi</b> Kürdi ile aynı diziyi kullanır.</p><p>Onları ayıran <b>seyir</b> (inici mi, çıkıcı mı) ve <b>güçlü</b>dür. Bu yüzden bu ünitede seyir soruları var.</p>' }]
    .concat(makamlar(MK_YENI7).filter(function (m) { return m.dizi; }).map(function (m) {
      return { baslik: m.ad, cizim: function () { return h('div', { class: 'kartPorte' }, porteSVG(makamDiziPorte(m))); },
        metin: '<p>' + m.altAd + ' + ' + m.ustAd + '</p><p>Karar <b>' + m.karar + '</b> · güçlü <b>' + m.guclu + '</b> · yeden ' + m.yeden + ' · seyir <b>' + m.seyir + '</b></p>' + (m.not ? '<p class="soluk">' + kacis(m.not) + '</p>' : '') };
    }));
}

// =====================================================
// AHENK: bir perdenin duyulduğu ses
// =====================================================
const AH_HARF = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'], AH_PC = [0, 2, 4, 5, 7, 9, 11];
const AH_TAM = [['Rast', 4], ['Dügâh', 5], ['Bûselik', 6], ['Çargâh', 0], ['Neva', 1], ['Hüseyni', 2], ['Acem', 3], ['Gerdâniye', 4]];
function ahDuyulan(a, harf) {
  const r = AH_HARF.indexOf(a.rast), kay = (r - 4 + 7) % 7;           // Rast (Sol) → a.rast
  const pcKay = ((AH_PC[r] - AH_PC[4]) % 12 + 12) % 12;
  const yeniH = (harf + kay) % 7;
  let fark = ((AH_PC[harf] + pcKay - AH_PC[yeniH]) % 12 + 12) % 12;
  if (fark > 6) fark -= 12;
  return AH_HARF[yeniH] + (fark === 1 ? ' diyez' : fark === -1 ? ' bemol' : fark === 2 ? ' çift diyez' : fark === -2 ? ' çift bemol' : '');
}
function ahHesapSorusu() {
  const a = rastgele(AH_NISFIYE.concat(AH_NEY)), t = rastgele(AH_TAM.slice(1));
  const dogru = ahDuyulan(a, t[1]);
  const yanlis = benzersiz(AH_HARF.map(function (x, i) { return ahDuyulan(a, i); }).concat(AH_HARF)).filter(function (x) { return x !== dogru; });
  return ykSecim({ soru: a.ad + ': ' + t[0] + ' hangi sesten duyulur?', alt: 'Hesapla: Rast bu ahenkte ' + a.rast + ' sesinden duyulur', dogru: dogru, yanlislar: ykKaristirAl(yanlis, 3),
    aciklama: '<b>' + a.ad + '</b> ahenginde Rast ' + a.rast + ' sesinden duyulur. ' + t[0] + ', Rast’tan ' + ((t[1] - 4 + 7) % 7 + 1) + '. ses olduğu için aynı aralıkla kayar: <b>' + dogru + '</b>.' });
}

// =====================================================
// SEVİYELERİ ÜNİTELERE EKLE
// =====================================================
function ykSeviye(id, ad, uret, o) { return Object.assign({ id: id, tip: 'seviye', ad: ad, soruSay: 8, uret: uret }, o || {}); }
// Ünitenin finalinden (ya da verilen seviyeden) önce ekler
function ykEkle(birimler, uniteId, seviyeler, onceId) {
  const u = birimler.find(function (x) { return x.id === uniteId; });
  if (!u) { console.warn('Ünite yok: ' + uniteId); return; }
  let i = onceId ? u.seviyeler.findIndex(function (s) { return s.id === onceId; }) : u.seviyeler.findIndex(function (s) { return s.tip === 'boss'; });
  if (i < 0) i = u.seviyeler.length;
  u.seviyeler.splice.apply(u.seviyeler, [i, 0].concat(seviyeler));
}
function ykBul(birimler, id) { let s = null; birimler.forEach(function (u) { u.seviyeler.forEach(function (x) { if (x.id === id) s = x; }); }); return s; }
// Köprü: zor porteye yazma seviyesinin önüne, bir kısmı hazır gelen isteğe bağlı seviye
function ykKopru(birimler, hedefId, mod, ad) {
  const s = ykBul(birimler, hedefId);
  if (!s) return;
  const u = birimler.find(function (x) { return x.seviyeler.indexOf(s) >= 0; });
  ykEkle(birimler, u.id, [{ id: hedefId + '-kopru', tip: 'yer', bonus: true, ad: ad || 'Köprü: eksiğini tamamla', soruSay: Math.max(4, s.soruSay - 2), uret: ykEksikUretici(s, mod || 'yarim') }], hedefId);
}

(function () {
  // ---- Koma ----
  ykEkle(KOMA_UNITELER, 'km1', [ykSeviye('km-dy', 'Doğru mu, yanlış mı?', ykUretici(kmDYSorusu), { yeni: true, soruSay: 8 })]);
  ykEkle(KOMA_UNITELER, 'km3', [
    ykSeviye('km-esle', 'Eşleştir: işaret, ad, koma, harf', ykUretici(kmEsleSorusu), { yeni: true, soruSay: 5 }),
    ykSeviye('km-tablo', 'Koma tablosu: boş hücre ve hata', ykKarma([ykUretici(kmEksikHucre), ykUretici(kmHataSorusu)]), { yeni: true, soruSay: 10 })
  ]);
  ykKopru(KOMA_UNITELER, 'km-yer', 'tek', 'Köprü: tek yazımın işareti');
  ykKopru(KOMA_UNITELER, 'km-yer2', 'tek', 'Köprü: tek yazımın işareti');

  // ---- Perde ----
  const p2 = PERDE_UNITELER.find(function (u) { return u.id === 'p2'; });
  if (p2 && p2.ders) { const eski = p2.ders; p2.ders = function () { return eski().concat(merdivenKartlari().slice(0, 2)); }; }
  ykEkle(PERDE_UNITELER, 'p2', [
    ykSeviye('p2-ayirt', 'Ayırt et: karıştırılan çiftler', ykUretici(pdAyirtSorusu), { yeni: true, soruSay: 10 }),
    ykSeviye('p2-sinif', 'Sınıflandır: tam perdeden kaç koma?', ykUretici(pdSinifSorusu), { yeni: true, soruSay: 5 })
  ], 'p2-yer');
  ykEkle(PERDE_UNITELER, 'p5', [ykSeviye('p5-hata', 'Hatayı bul: yanlış yazım', ykKarma([ykUretici(pdHataSorusu), ykUretici(pdDYSorusu)]), { yeni: true, soruSay: 10 })]);
  const p7yer = ykBul(PERDE_UNITELER, 'p7-yer');
  if (p7yer) ykEkle(PERDE_UNITELER, 'p7', [{ id: 'p7-oteki', tip: 'yer', yeni: true, ad: 'Biri verilmiş, ötekini kur', soruSay: 6, uret: ykEksikUretici(p7yer, 'tek') }], 'p7-yer');

  // ---- Usul ----
  ykEkle(USUL_UNITELER, 'u4', [ykSeviye('u4-sinif', 'Sınıflandır: kaç zamanlı?', ykKarma([ykUretici(usSinifSorusu), ykUretici(usDYSorusu)]), { yeni: true, soruSay: 6 })]);
  ykEkle(USUL_UNITELER, 'u7', [ykSeviye('u7-hata', 'Hatayı bul: yanlış hece', ykUretici(usHataSorusu), { yeni: true, soruSay: 8 })]);

  // ---- Dörtlü-Beşli ----
  ykEkle(CESNI_UNITELER, 'db2', [ykSeviye('db2-sinif', 'Sınıflandır: hangi perdede kurulur?', ykUretici(dbSinifSorusu), { yeni: true, soruSay: 5 })]);
  ykEkle(CESNI_UNITELER, 'db4', [ykSeviye('db4-fark', 'Farkı bul ve hatayı bul', ykKarma([ykUretici(dbFarkSorusu), ykUretici(dbHataSorusu)]), { yeni: true, soruSay: 8 })]);
  ykKopru(CESNI_UNITELER, 'db1-yer', 'tek', 'Köprü: adım adım kur');
  ykKopru(CESNI_UNITELER, 'db4-yer', 'yarim');

  // ---- Göçürme: çözümlüden tam kurmaya ----
  ['gc1', 'gc2'].forEach(function (u) {
    const s = ykBul(GOCURME_UNITELER, u + '-yer');
    if (s) ykEkle(GOCURME_UNITELER, u, [
      { id: u + '-adim', tip: 'yer', yeni: true, ad: 'Adım adım: tek eksik nota', soruSay: 5, uret: ykEksikUretici(s, 'tek') },
      { id: u + '-eksik', tip: 'yer', yeni: true, ad: 'Eksiğini tamamla', soruSay: 5, uret: ykEksikUretici(s, 'yarim') }
    ], u + '-yer');
  });
  const g3 = ykBul(GOCURME_UNITELER, 'gc3-yer');
  if (g3) ykEkle(GOCURME_UNITELER, 'gc3', [
    { id: 'gc3-alt', tip: 'yer', yeni: true, ad: 'Önce alt çeşni', soruSay: 4, uret: ykEksikUretici(g3, 'alt') },
    { id: 'gc3-ust', tip: 'yer', yeni: true, ad: 'Sonra üst çeşni', soruSay: 4, uret: ykEksikUretici(g3, 'ust') }
  ], 'gc3-yer');

  // ---- Makam ----
  const mkBirimler = MAKAM_UNITELER;
  ykEkle(mkBirimler, 'mk2', [ykSeviye('mk2-dy', 'Doğru mu, yanlış mı?', ykUretici(mkDYSorusu), { yeni: true, soruSay: 8 })]);
  ykEkle(mkBirimler, 'mk3', [ykSeviye('mk3-sinif', 'Sınıflandır: güçlüler', ykUretici(mkSinifSorusu), { yeni: true, soruSay: 5 })]);
  ykEkle(mkBirimler, 'mk4', [
    ykSeviye('mk4-fark', 'Farkı bul: iki makam', ykUretici(mkFarkSorusu), { yeni: true, soruSay: 8 }),
    { id: 'mk4-kur', tip: 'yer', yeni: true, ad: 'Makamı kur: dört taş', soruSay: 6, uret: ykUretici(mkKurSorusu) }
  ]);
  ykKopru(mkBirimler, 'mk5-yer', 'alt', 'Köprü: dizinin yarısı hazır');
  const MK12 = makamlar(MK_TUM12);
  ykEkle(mkBirimler, 'mk5', [ykSeviye('mk5-seyir', 'Seyir: türü ve sırası', ykKarma([function () { return [mkSeyirTuruSorusu(MK12)]; }, function () { return [mkSeyirSiralaSorusu(MK12)]; }]), { yeni: true, soruSay: 8 })]);
  // 3.0: yedi yeni makam
  const Y7 = makamlar(MK_YENI7).filter(function (m) { return m.dizi; });
  const tum19 = MK_TUM12.concat(MK_YENI7);
  const mk6 = {
    id: 'mk6', dal: 'makam', no: 6, ad: 'Yeni makamlar', kisa: 'Acemaşiran, Muhayyer, Muhayyerkürdi, Acemkürdi, Saba, Segâh, Hüzzam', ogeler: MK_YENI7.map(function (i) { return 'm:' + i; }),
    seviyeler: [
      { id: 'mk6-1', tip: 'seviye', ad: 'Yapı, karar ve güçlü', soruSay: 8, uret: makamUretici({ havuz: MK_YENI7, tipler: ['parcaAd', 'karar', 'guclu'] }) },
      ykSeviye('mk6-2', 'Seyir türü ve kimlik', ykKarma([function () { return [mkSeyirTuruSorusu(Y7)]; }, function () { return [mkKimlikYeniSorusu(Y7)]; }]), { soruSay: 8 }),
      ykSeviye('mk6-3', 'Seyri sırala', ykUretici(function () { return mkSeyirSiralaSorusu(Y7); }), { soruSay: 5 }),
      { id: 'mk6-yer', tip: 'yer', ad: 'Diziyi porteye yaz', soruSay: 5, uret: makamUretici({ havuz: MK_YENI7, tipler: ['diziYaz'] }) },
      { id: 'mk6-boss', tip: 'boss', ad: 'Yeni makamlar finali', soruSay: 10, uret: ykKarma([makamUretici({ havuz: MK_YENI7, tipler: ['karar', 'guclu', 'parcaAd', 'diziYaz'] }), function () { return [mkKimlikYeniSorusu(Y7)]; }, function () { return [mkSeyirSiralaSorusu(Y7)]; }]) }
    ]
  };
  mk6.ders = mkYeniDersi;
  MAKAM_UNITELER.push(mk6);

  // ---- Ahenk ----
  ykEkle(AHENK_UNITELER, 'a2', [ykSeviye('a2-hesap', 'Hesapla: perde hangi sesten duyulur?', ykUretici(ahHesapSorusu), { yeni: true, soruSay: 8 })]);
})();
