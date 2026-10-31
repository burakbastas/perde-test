// =====================================================
// MAKAM (10 basit makam) + GÖÇÜRME motoru
// Kaynak: TDV İslâm Ansiklopedisi maddeleri, MEB müzik okulları programı
// =====================================================
'use strict';

const MAKAM_HAM = [
  { id: 'cargah',   ad: 'Çargâh',          alt: ['b-cargah', 'Çargâh'], ust: ['d-cargah', 'Gerdâniye'], karar: 'Çargâh', guclu: 'Gerdâniye', yeden: 'Bûselik',     donanim: [] },
  { id: 'rast',     ad: 'Rast',            alt: ['b-rast', 'Rast'],     ust: ['d-rast', 'Neva'],        karar: 'Rast',   guclu: 'Neva',      yeden: 'Irak',        donanim: ['Si4-k', 'Fa5+bk'],
    not: 'İnerken Neva’daki Rast dörtlüsünün yerini Bûselik dörtlüsü alır (Evç yerine Acem).' },
  { id: 'ussak',    ad: 'Uşşak',           alt: ['d-ussak', 'Dügâh'],   ust: ['b-buselik', 'Neva'],     karar: 'Dügâh',  guclu: 'Neva',      yeden: 'Rast',        donanim: ['Si4-k'] },
  { id: 'kurdi',    ad: 'Kürdi',           alt: ['d-kurdi', 'Dügâh'],   ust: ['b-buselik', 'Neva'],     karar: 'Dügâh',  guclu: 'Neva',      yeden: 'Rast',        donanim: ['Si4-km'] },
  { id: 'huseyni',  ad: 'Hüseyni',         alt: ['b-huseyni', 'Dügâh'], ust: ['d-ussak', 'Hüseyni'],    karar: 'Dügâh',  guclu: 'Hüseyni',   yeden: 'Rast',        donanim: ['Si4-k', 'Fa5+bk'],
    not: 'İnişlerde Evç yerine Acem kullanılınca Uşşak dörtlüsünün yerini Kürdi dörtlüsü alır.' },
  { id: 'buselik',  ad: 'Bûselik',         alt: ['b-buselik', 'Dügâh'], ust: ['d-hicaz', 'Hüseyni'],    karar: 'Dügâh',  guclu: 'Hüseyni',   yeden: 'Nim Zirgüle', donanim: [],
    ust2: ['d-kurdi', 'Hüseyni'], donanimYazilmaz: true,
    not: 'İkinci dizi: Bûselik beşlisi + Hüseyni’de Kürdi dörtlüsü. Donanıma işaret yazılmaz; değişiklikler nota üzerinde gösterilir.' },
  { id: 'hicaz',    ad: 'Hicaz',           alt: ['d-hicaz', 'Dügâh'],   ust: ['b-rast', 'Neva'],        karar: 'Dügâh',  guclu: 'Neva',      yeden: 'Rast',        donanim: ['Si4-bk', 'Fa5+bk', 'Do5+bk'] },
  { id: 'humayun',  ad: 'Hümayun',         alt: ['d-hicaz', 'Dügâh'],   ust: ['b-buselik', 'Neva'],     karar: 'Dügâh',  guclu: 'Neva',      yeden: 'Rast',        donanim: ['Si4-bk', 'Do5+bk'] },
  { id: 'uzzal',    ad: 'Uzzal',           alt: ['b-hicaz', 'Dügâh'],   ust: ['d-ussak', 'Hüseyni'],    karar: 'Dügâh',  guclu: 'Hüseyni',   yeden: 'Rast',        donanim: ['Si4-bk', 'Fa5+bk', 'Do5+bk'] },
  { id: 'zirguleli',ad: 'Zirgüleli Hicaz', alt: ['b-hicaz', 'Dügâh'],   ust: ['d-hicaz', 'Hüseyni'],    karar: 'Dügâh',  guclu: 'Hüseyni',   yeden: 'Nim Zirgüle', donanim: ['Si4-bk', 'Fa5+k', 'Do5+bk', 'Sol5+bk'] },
  // 2.5: Neva'da Hicaz çeşnisi olan iki makam (Sûzinâk dizisinin Dügâh'taki parçası Karcığar'dır)
  { id: 'karcigar', ad: 'Karcığar',        alt: ['d-ussak', 'Dügâh'],   ust: ['b-hicaz', 'Neva'],       karar: 'Dügâh',  guclu: 'Neva',      yeden: 'Rast',        donanim: ['Si4-k', 'Mi5-bk', 'Fa5+bk'],
    not: 'Tiz bölgede Muhayyer’de Uşşak dörtlüsü (Tiz Segâh), inerken Kürdi dörtlüsü (Sünbüle) kullanılır. Seyri inici-çıkıcıdır.' },
  { id: 'suzinak',  ad: 'Sûzinâk',         alt: ['b-rast', 'Rast'],     ust: ['d-hicaz', 'Neva'],       karar: 'Rast',   guclu: 'Neva',      yeden: 'Irak',        donanim: ['Si4-k', 'Mi5-bk', 'Fa5+bk'],
    not: 'Rast beşlisinin üstüne Neva’da Hicaz dörtlüsü. Dizinin Dügâh’tan başlayan kısmı Karcığar’ı verir.' },
  // 3.0: yedi makam (TDV İslâm Ansiklopedisi maddeleri). kes: alt çeşninin son kaç aralığı üst çeşniyle örtüşür.
  { id: 'acemasiran', ad: 'Acemaşiran',  alt: ['b-cargah', 'Acem Aşiran'], ust: ['d-cargah', 'Çargâh'], karar: 'Acem Aşiran', guclu: 'Çargâh', yeden: 'Hüseyni Aşiran', donanim: ['Si4-km'], seyir: 'inici',
    not: 'Acem makamı icra edildikten sonra Çargâh dörtlüsüyle Acem Aşiran’da karar verilir. TDV, Acem ve Dügâh’ı da güçlü olarak sayar. Meyan geçkisi çoğunlukla Saba’ya yapılır.' },
  { id: 'muhayyer', ad: 'Muhayyer',      alt: ['b-huseyni', 'Dügâh'], ust: ['d-ussak', 'Hüseyni'],  karar: 'Dügâh',  guclu: 'Muhayyer', yeden: 'Rast', donanim: ['Si4-k', 'Fa5+bk'], seyir: 'inici', gucluFarkli: true,
    not: 'Hüseyni makamının inici şekli; dizisi Hüseyni ile aynıdır. Tiz durak Muhayyer çevresinden başlanır, Muhayyer’de yarım karar yapılır (ikinci güçlü Hüseyni).' },
  { id: 'muhayyerkurdi', ad: 'Muhayyerkürdi', alt: ['d-kurdi', 'Dügâh'], ust: ['b-buselik', 'Neva'], karar: 'Dügâh', guclu: 'Muhayyer', yeden: 'Rast', donanim: ['Si4-k', 'Fa5+bk'], seyir: 'inici', gucluFarkli: true, donanimFarkli: true,
    not: 'Önce Muhayyer makamı bütün gerekleriyle icra edilir, sonra Kürdi’ye geçilip Dügâh’ta Kürdi ile karar verilir. Gösterilen dizi kararın (Kürdi) dizisidir; donanım Muhayyer’inki gibi yazılır.' },
  { id: 'acemkurdi', ad: 'Acemkürdi',    alt: ['d-kurdi', 'Dügâh'], ust: ['b-buselik', 'Neva'], karar: 'Dügâh', guclu: 'Acem', yeden: 'Rast', donanim: ['Si4-km'], seyir: 'inici', gucluFarkli: true,
    not: 'Güçlüleri Acem ve Çargâh’tır. İnici seyirle Acem bölgesinden inilir; Kürdi nağmeleriyle, çoğu zaman Nim Hisar da kullanılarak Dügâh’ta karar verilir.' },
  { id: 'saba', ad: 'Saba',              alt: ['d-saba', 'Dügâh'], ust: ['d-hicaz', 'Çargâh'], kes: 1, karar: 'Dügâh', guclu: 'Çargâh', yeden: 'Rast', donanim: ['Si4-k', 'Re5-bk'], seyir: 'çıkıcı', donanimFarkli: true,
    not: 'Dügâh’taki Saba dörtlüsü (K S S, eksik dörtlü) Çargâh’taki Hicaz çeşnisiyle iç içedir. Çargâh’ta yarım karar yapılır. Genişletilmemiş bir makamdır; donanıma yalnız Si koma ve Re bakiye bemolü yazılır.' },
  { id: 'segah', ad: 'Segâh',            alt: ['b-segah', 'Segâh'], ust: ['d-ussak', 'Neva'], kes: 2, karar: 'Segâh', guclu: 'Neva', yeden: 'Kürdi', donanim: ['Si4-k', 'Mi5-k', 'Fa5+bk'], seyir: 'çıkıcı', donanimFarkli: true,
    not: 'Segâh’ta Segâh çeşnisi, Neva’da Uşşak; Neva’da yarım karar yapılır. Evç’te Hicaz dörtlüsü nadirdir, yerine çoğu zaman Acem gelir. Sonunda Segâh’ta genellikle yedenli tam karar verilir.' },
  { id: 'huzzam', ad: 'Hüzzam',          alt: ['b-huzzam', 'Segâh'], ust: ['d-hicaz', 'Neva'], kes: 2, karar: 'Segâh', guclu: 'Neva', yeden: 'Kürdi', donanim: ['Si4-k', 'Mi5-bk', 'Fa5+bk'], seyir: 'inici-çıkıcı',
    not: 'Segâh’taki Hüzzam beşlisi Neva’daki Hicaz dörtlüsüyle iç içedir. Durak ya da güçlü civarından başlanır, Neva’da Hicaz ile yarım karar yapılır, Segâh’ta yedenli tam karar verilir. Pest tarafa genişler.' }
];
// 2.12: seyir türleri (TDV ve MEB programı)
const MAKAM_SEYIR = { cargah: 'çıkıcı', rast: 'çıkıcı', ussak: 'çıkıcı', kurdi: 'çıkıcı', huseyni: 'inici-çıkıcı', buselik: 'çıkıcı', hicaz: 'inici-çıkıcı',
  humayun: 'inici-çıkıcı', uzzal: 'inici-çıkıcı', zirguleli: 'inici-çıkıcı', karcigar: 'inici-çıkıcı', suzinak: 'inici-çıkıcı' };
MAKAM_HAM.forEach(function (m) { if (!m.seyir) m.seyir = MAKAM_SEYIR[m.id]; });
const MK_YENI7 = ['acemasiran', 'muhayyer', 'muhayyerkurdi', 'acemkurdi', 'saba', 'segah', 'huzzam'];
const MK_ILK10 = ['cargah', 'rast', 'ussak', 'kurdi', 'huseyni', 'buselik', 'hicaz', 'humayun', 'uzzal', 'zirguleli'];
const MK_TUM12 = MK_ILK10.concat(['karcigar', 'suzinak']);
const MAKAM_PERDE_SECENEK = ['Rast', 'Dügâh', 'Segâh', 'Bûselik', 'Çargâh', 'Neva', 'Hüseyni', 'Gerdâniye', 'Irak', 'Nim Zirgüle', 'Acem', 'Evç', 'Yegâh', 'Geveşt', 'Acem Aşiran', 'Muhayyer', 'Kürdi', 'Hüseyni Aşiran'];

// ---- Göçürme motoru ----
// Aralıkları (koma) verilen bir yapıyı, verilen ilk notadan başlayarak yazar.
// Her ses bir sonraki harfe yazılır; koma farkı AEU işaretiyle gösterilir.
function gocurNota(araliklar, ilk) {
  const L = [ilk];
  let k = komaOf(ilk);
  for (let i = 0; i < araliklar.length; i++) {
    const on = L[L.length - 1];
    const h_ = (on.h + 1) % 7, o = on.o + (on.h === 6 ? 1 : 0);
    k += araliklar[i];
    const a = farktanAeu(k - (o * 53 + KOMA_TABAN[h_]));
    if (a === undefined) return null;
    L.push({ h: h_, o: o, a: a });
  }
  return L;
}
// Bir perdeden başlayarak göçür: iki yazımdan geçerli olanı ve en az işaretli olanı seç
function gocurPerde(araliklar, perde, smin, smax) {
  smin = smin || 27; smax = smax || 43;
  let en = null, enPuan = 1e9;
  perde.parcalar.forEach(function (ilk) {
    const L = gocurNota(araliklar, ilk);
    if (!L) return;
    if (!L.every(function (n) { return KOMADAN_PERDE[komaOf(n)] && adim(n) >= smin && adim(n) <= smax; })) return;
    // perdenin bilinen yazımları tercih edilir (Segâh = Si koma bemol, Nim Hicaz = Do bakiye diyez…)
    const bilinmeyen = L.filter(function (n) { return !KOMADAN_PERDE[komaOf(n)].parcalar.some(function (x) { return x.h === n.h && (x.a || null) === (n.a || null); }); }).length;
    const puan = L.filter(function (n) { return n.a; }).length + 10 * bilinmeyen;
    if (puan < enPuan) { en = L; enPuan = puan; }
  });
  return en;
}

const MAKAMLAR = MAKAM_HAM.map(function (m) {
  const alt = CESNI[m.alt[0]], ust = CESNI[m.ust[0]], kes = m.kes || 0;
  const dizi = gocurPerde(alt.araliklar.slice(0, alt.araliklar.length - kes).concat(ust.araliklar), PERDE[m.karar], 20, 50);
  const o = Object.assign({}, m, {
    oge: 'm:' + m.id,
    altC: alt, ustC: ust,
    altAd: alt.ad + ' (' + m.alt[1] + ')', ustAd: ust.ad + ' (' + m.ust[1] + ')',
    dizi: dizi, gucluIdx: alt.notalar.length - 1 - kes,
    donanimNota: m.donanim.map(function (x) { return notaOku(x); })
  });
  if (!dizi) console.warn('Makam dizisi yazılamadı: ' + m.ad);
  // denetim: güçlü perde dizideki birleşme sesi mi?
  if (dizi && !m.gucluFarkli && KOMADAN_PERDE[komaOf(dizi[o.gucluIdx])] !== PERDE[m.guclu] && KOMADAN_PERDE[komaOf(dizi[o.gucluIdx])].ad !== m.ust[1]) console.warn(m.ad + ': güçlü uyuşmuyor');
  if (dizi && KOMADAN_PERDE[komaOf(dizi[o.gucluIdx])].ad !== m.ust[1]) console.warn(m.ad + ': üst parça yeri uyuşmuyor');
  // denetim: donanım dizideki işaretlerle tutarlı mı?
  if (dizi && !m.donanimYazilmaz && !m.donanimFarkli) {
    const d1 = benzersiz(dizi.filter(function (n) { return n.a; }).map(function (n) { return n.h + n.a; })).sort().join();
    const d2 = benzersiz(o.donanimNota.map(function (n) { return n.h + n.a; })).sort().join();
    if (d1 !== d2) console.warn(m.ad + ': donanım dizi ile tutarsız ' + d1 + ' / ' + d2);
  }
  return o;
});
const MAKAM = {};
MAKAMLAR.forEach(function (m) { MAKAM[m.id] = m; });
function makamlar(idler) { return idler.map(function (i) { return MAKAM[i]; }); }

function donanimAnahtar(m) { return m.donanimNota.map(function (n) { return n.h + n.a; }).sort().join() || '-'; }
function diziAnahtar(m) { return m.dizi.map(function (n) { return komaOf(n); }).join(); }

function makamDiziPorte(m) {
  const et = m.dizi.map(function () { return ''; });
  et[0] = 'karar'; et[m.gucluIdx] = 'güçlü';
  return { notalar: m.dizi.map(function (n, i) { return i === m.gucluIdx ? Object.assign({ renk: 'var(--vurgu)' }, n) : n; }), aralik: 34, enAz: 330, etiketler: et };
}
function makamAciklama(m) {
  return '<b>' + m.ad + '</b> = ' + m.altAd + ' + ' + m.ustAd + '<br>Karar: ' + m.karar + ' · Güçlü: ' + m.guclu + ' · Yeden: ' + m.yeden +
    '<br><span class="soluk">Donanım: ' + (m.donanimYazilmaz ? 'yazılmaz' : (m.donanimNota.length ? m.donanimNota.map(function (n) { return HARF_AD[n.h] + ' ' + isaretAdi(n.a); }).join(', ') : 'yok')) + '</span>';
}
function makamCeldirici(m, havuz, sayi, ayirt) {
  return karistir(havuz.filter(function (x) { return x !== m && (!ayirt || ayirt(x) !== ayirt(m)); })).slice(0, sayi);
}
function parcaKey(c, yer) { return c + '@' + yer; }
function parcaMetin(key) { const p = key.split('@'); return CESNI[p[0]].ad + ' · ' + p[1]; }

function makamSoru(tip, m, havuz) {
  const q = { oge: m.oge, tip: 'secim', aciklama: makamAciklama(m), ipucu: 'Karar: ' + m.karar + ', güçlü: ' + m.guclu };
  const adSik = function (L) { return L.map(function (x) { return { key: x.id, metin: x.ad }; }); };
  if (tip === 'parcaAd') {
    q.soru = { metin: m.altAd + ' + ' + m.ustAd, kucuk: true }; q.alt = 'Bu birleşim hangi makamın dizisi?';
    q.siklar = adSik([m].concat(makamCeldirici(m, havuz, 3)));
    q.dogru = m.id; q.dogruMetin = m.ad;
  } else if (tip === 'karar' || tip === 'guclu' || tip === 'yeden') {
    const ad = { karar: 'karar', guclu: 'güçlü', yeden: 'yeden' }[tip];
    q.soru = { metin: m.ad }; q.alt = 'Bu makamın ' + ad + ' perdesi hangisi?';
    const dogru = m[tip];
    const dis = karistir(MAKAM_PERDE_SECENEK.filter(function (x) { return x !== dogru; })).slice(0, 3);
    q.siklar = [dogru].concat(dis).map(function (x) { return { key: x, metin: x }; });
    q.dogru = dogru; q.dogruMetin = dogru;
    q.ipucu = tip === 'guclu' ? (m.gucluFarkli ? 'Bu makamın güçlüsü iki parçanın birleştiği ses değil; seyrine göre belirlenir.' : 'Güçlü, alt ve üst parçanın birleştiği perdedir: ' + m.ustAd) : tip === 'karar' ? 'Alt parçanın yeri' : 'Kararın hemen altındaki ses';
  } else if (tip === 'donanimMakam') {
    q.soru = { porte: { notalar: [], donanim: m.donanimNota, enAz: 160 } }; q.alt = 'Bu donanım hangi makamın?';
    q.siklar = adSik([m].concat(makamCeldirici(m, havuz.filter(function (x) { return !x.donanimYazilmaz; }), 3, donanimAnahtar)));
    q.dogru = m.id; q.dogruMetin = m.ad;
  } else if (tip === 'makamDonanim') {
    q.soru = { metin: m.ad }; q.alt = 'Donanımı hangisi?';
    const dis = benzersiz(makamCeldirici(m, MAKAMLAR.filter(function (x) { return !x.donanimYazilmaz; }), 9, donanimAnahtar), donanimAnahtar).slice(0, 3);
    q.siklar = [m].concat(dis).map(function (x) { return { key: x.id, porte: { notalar: [], donanim: x.donanimNota, enAz: 140 } }; });
    q.dogru = m.id; q.dogruMetin = m.donanimNota.length ? m.donanimNota.map(function (n) { return HARF_AD[n.h] + ' ' + isaretAdi(n.a); }).join(', ') : 'Donanımsız';
  } else if (tip === 'diziMakam') {
    q.soru = { porte: makamDiziPorte(m) }; q.alt = 'Bu dizi hangi makamın?';
    q.siklar = adSik([m].concat(makamCeldirici(m, havuz, 3, diziAnahtar)));
    q.dogru = m.id; q.dogruMetin = m.ad;
  } else if (tip === 'benKimim') {
    q.tip = 'secim';
    q.soru = { metin: 'Ben kimim?' }; q.alt = 'İpuçlarına bak; ne kadar az ipucuyla bilirsen o kadar iyi!';
    q.ipuclari = [
      'Kararım ' + m.karar + ' perdesi.',
      'Güçlüm ' + m.guclu + ' perdesi.',
      'Alt parçam: ' + m.altAd + '.',
      'Üst parçam: ' + m.ustAd + '.'
    ];
    q.siklar = adSik([m].concat(makamCeldirici(m, havuz, 3)));
    q.dogru = m.id; q.dogruMetin = m.ad;
    q.ipucu = null;
  } else if (tip === 'kimlik3') {
    q.soru = { metin: 'Karar: ' + m.karar + ' · Güçlü: ' + m.guclu, kucuk: true };
    if (!m.donanimYazilmaz) q.soru.porte = { notalar: [], donanim: m.donanimNota, enAz: 170 };
    q.alt = m.donanimYazilmaz ? 'Donanıma işaret yazılmıyor. Hangi makam?' : 'Donanımı bu. Hangi makam?';
    const imza = function (x) { return x.karar + '|' + x.guclu + '|' + (x.donanimYazilmaz ? 'y' : donanimAnahtar(x)); };
    q.siklar = adSik([m].concat(makamCeldirici(m, havuz, 3, imza)));
    q.dogru = m.id; q.dogruMetin = m.ad; q.ipucu = null;
  } else if (tip === 'diziDogru') {
    const yanlislar = [];
    for (let d = 0; d < 30 && yanlislar.length < 3; d++) {
      const y = yanlisYazim(m.dizi), k = diziImza(y);
      if (k !== diziImza(m.dizi) && yanlislar.indexOf(k) < 0) yanlislar.push(k);
    }
    const porte = function (L) { return { notalar: L, aralik: 33, enAz: 320 }; };
    q.soru = { metin: m.ad }; q.alt = 'Doğru dizi hangisi?';
    q.siklar = [{ key: 'd', porte: porte(m.dizi), genis: true }].concat(yanlislar.map(function (k, i) { return { key: 'y' + i, porte: porte(JSON.parse(k)), genis: true }; }));
    q.dogru = 'd'; q.dogruMetin = m.dizi.map(perdeAdiNota).join(' – ');
    q.ipucu = m.altAd + ' + ' + m.ustAd;
  } else if (tip === 'diziYaz') {
    q.tip = 'yer';
    q.soru = { metin: m.ad, kucuk: true }; q.alt = 'İlk ses verildi. Makamın dizisini porteye yaz';
    q.yer = { slotlar: m.dizi.map(function (n, i) { return i === 0 ? { sabit: n } : {}; }), palet: 'aeu', beklenen: m.dizi, harfSirali: true, smin: 24, smax: 45 };
    q.dogruMetin = m.dizi.map(perdeAdiNota).join(' – ');
    q.ipucu = m.altAd + ' + ' + m.ustAd;
    q.formul = formulMetni(m.dizi.slice(1).map(function (n, i) { return komaOf(n) - komaOf(m.dizi[i]); }));
  } else if (tip === 'makamKur') {
    q.tip = 'dizi';
    q.soru = { metin: m.ad }; q.alt = 'Makamın dizisini kur: önce alt parça, sonra üst parça';
    const dogru = [parcaKey(m.alt[0], m.alt[1]), parcaKey(m.ust[0], m.ust[1])];
    const kabul = [dogru];
    if (m.ust2) kabul.push([dogru[0], parcaKey(m.ust2[0], m.ust2[1])]);
    let parcalar = [];
    MAKAMLAR.forEach(function (x) {
      parcalar.push(parcaKey(x.alt[0], x.alt[1]));
      parcalar.push(parcaKey(x.ust[0], x.ust[1]));
    });
    parcalar = karistir(benzersiz(parcalar).filter(function (k) { return dogru.indexOf(k) < 0 && !(m.ust2 && k === parcaKey(m.ust2[0], m.ust2[1])); })).slice(0, 4);
    if (m.ust2) parcalar[0] = parcaKey(m.ust2[0], m.ust2[1]);   // Bûselik’in ikinci dizisi de seçilebilir ve doğru sayılır
    q.dizi = { havuz: karistir(dogru.concat(parcalar)).map(function (k) { return { key: k, metin: parcaMetin(k) }; }), uzunluk: 2, beklenen: dogru, kabul: kabul, tekrarli: false, genis: true };
    q.dogruMetin = m.altAd + ' + ' + m.ustAd;
  }
  return q;
}

function diziImza(L) { return JSON.stringify(L.map(function (n) { return { h: n.h, o: n.o, a: n.a || null }; })); }
function makamUretici(o) {
  return function (n) {
    const havuz = makamlar(o.havuz);
    const yeni = o.yeni ? makamlar(o.yeni) : [];
    const L = [];
    let onceki = null;
    for (let j = 0; j < n; j++) {
      let m = null;
      for (let d = 0; d < 10; d++) {
        m = rastgele(yeni.length && Math.random() < (o.yeniOran || 0.65) ? yeni : havuz);
        if (m !== onceki) break;
      }
      onceki = m;
      let tip = o.tipler[j % o.tipler.length];
      if (tip === 'donanimMakam' && m.donanimYazilmaz) tip = 'makamDonanim';
      if (tip === 'makamDonanim' && m.donanimYazilmaz) tip = 'parcaAd';
      L.push(makamSoru(tip, m, havuz));
    }
    return karistir(L);
  };
}

const MK_KIMLIK = ['parcaAd', 'karar', 'guclu', 'yeden'];
const MK_TANI = ['benKimim', 'diziMakam'];
const MK_DON = ['donanimMakam', 'makamDonanim'];

function mkUnite(id, no, ad, kisa, ogeler, havuz) {
  return {
    id: id, dal: 'makam', no: no, ad: ad, kisa: kisa,
    ogeler: ogeler.map(function (i) { return 'm:' + i; }),
    seviyeler: [
      { id: id + '-1', tip: 'seviye', ad: 'Parçalar ve kimlik kartı', soruSay: 8, uret: makamUretici({ havuz: havuz, yeni: ogeler, tipler: MK_KIMLIK }) },
      { id: id + '-2', tip: 'seviye', ad: 'Ben kimim? ve dizi', soruSay: 8, uret: makamUretici({ havuz: havuz, yeni: ogeler, tipler: MK_TANI }) },
      { id: id + '-3', tip: 'seviye', ad: 'Donanım', soruSay: 8, uret: makamUretici({ havuz: havuz, yeni: ogeler, tipler: MK_DON }) },
      { id: id + '-yer', tip: 'yer', ad: 'Makamı kur', soruSay: 6, uret: makamUretici({ havuz: havuz, yeni: ogeler, yeniOran: 0.75, tipler: ['makamKur'] }) },
      { id: id + '-boss', tip: 'boss', ad: 'Ünite finali', soruSay: 10, uret: makamUretici({ havuz: havuz, yeni: ogeler, tipler: MK_KIMLIK.concat(MK_TANI, MK_DON, ['makamKur']) }) }
    ]
  };
}

const MAKAM_UNITELER = [
  mkUnite('mk1', 1, 'İlk makamlar', 'Çargâh, Rast, Uşşak, Kürdi', ['cargah', 'rast', 'ussak', 'kurdi'], ['cargah', 'rast', 'ussak', 'kurdi']),
  mkUnite('mk2', 2, 'Hüseyni ve Bûselik', 'Güçlüsü Hüseyni olan iki makam', ['huseyni', 'buselik'], ['cargah', 'rast', 'ussak', 'kurdi', 'huseyni', 'buselik']),
  mkUnite('mk3', 3, 'Hicaz ailesi', 'Hicaz, Hümayun, Uzzal, Zirgüleli Hicaz', ['hicaz', 'humayun', 'uzzal', 'zirguleli'], MK_ILK10),
  mkUnite('mk4', 4, 'Karcığar ve Sûzinâk', 'Neva’da Hicaz çeşnisi olan iki makam', ['karcigar', 'suzinak'], MK_TUM12),
  {
    id: 'mk5', dal: 'makam', no: 5, ad: 'Makam ustalığı', kisa: 'İpucusuz tanıma, doğru dizi, diziyi porteye yazma', ogeler: [],
    seviyeler: [
      { id: 'mk5-1', tip: 'seviye', ad: 'Üç bilgiden makamı bul', soruSay: 8, uret: makamUretici({ havuz: MK_TUM12, tipler: ['kimlik3'] }) },
      { id: 'mk5-2', tip: 'seviye', ad: 'Doğru dizi hangisi?', soruSay: 8, uret: makamUretici({ havuz: MK_TUM12, tipler: ['diziDogru'] }) },
      { id: 'mk5-yer', tip: 'yer', ad: 'Diziyi porteye yaz', soruSay: 5, uret: makamUretici({ havuz: MK_TUM12, tipler: ['diziYaz'] }) },
      { id: 'mk5-boss', tip: 'boss', ad: 'Makam ustalığı finali', soruSay: 10, uret: makamUretici({ havuz: MK_TUM12, tipler: ['kimlik3', 'diziDogru', 'benKimim', 'diziYaz', 'donanimMakam'] }) }
    ]
  }
];

function makamKarti(m) {
  return {
    baslik: m.ad,
    cizim: function () {
      return h('div', null,
        h('div', { class: 'kartPorte' }, porteSVG(makamDiziPorte(m))),
        m.donanimNota.length ? h('div', { class: 'kartPorte kucuk' }, porteSVG({ notalar: [], donanim: m.donanimNota, enAz: 150 })) : null);
    },
    metin: '<p><b>' + kacis(m.altAd) + '</b> + <b>' + kacis(m.ustAd) + '</b></p>' +
      '<p>Karar: <b>' + m.karar + '</b> · Güçlü: <b>' + m.guclu + '</b> · Yeden: <b>' + m.yeden + '</b></p>' +
      '<p>Donanım: ' + (m.donanimYazilmaz ? 'işaret yazılmaz' : m.donanimNota.length ? m.donanimNota.map(function (n) { return HARF_AD[n.h] + ' ' + isaretAdi(n.a); }).join(', ') : 'yok') + '</p>' +
      (m.not ? '<p class="soluk">' + kacis(m.not) + '</p>' : '')
  };
}

MAKAM_UNITELER[0].ders = function () {
  return [
    { baslik: 'Makam nedir?', metin:
      '<p>Bir makamın <b>dizisi</b>, bir dörtlü ile bir beşlinin (ya da bir beşli ile bir dörtlünün) birleşmesinden oluşur.</p>' +
      '<p><b>Karar</b>: makamın bittiği, durduğu perde. <b>Güçlü</b>: iki parçanın birleştiği, makamın en önemli ikinci perdesi. <b>Yeden</b>: kararın hemen altındaki, karara çeken ses.</p>' +
      '<p><b>Donanım</b>: dizideki değişmez işaretlerin anahtarın yanına yazılması.</p>' }
  ].concat(makamlar(['cargah', 'rast', 'ussak', 'kurdi']).map(makamKarti));
};
MAKAM_UNITELER[1].ders = function () {
  return [{ baslik: 'Güçlüsü Hüseyni', metin: '<p>Bu iki makamın alt parçası bir <b>beşli</b>, bu yüzden güçlü perdesi Neva değil <b>Hüseyni</b>.</p>' }]
    .concat(makamlar(['huseyni', 'buselik']).map(makamKarti));
};
MAKAM_UNITELER[2].ders = function () {
  return [{ baslik: 'Hicaz ailesi', metin:
    '<p>Dört makamın da kararı <b>Dügâh</b> ve hepsinde Hicaz çeşnisi var. Farkları parçalarda:</p>' +
    '<p><b>Hicaz</b>: Hicaz dörtlüsü + Rast beşlisi<br><b>Hümayun</b>: Hicaz dörtlüsü + Bûselik beşlisi<br><b>Uzzal</b>: Hicaz beşlisi + Uşşak dörtlüsü<br><b>Zirgüleli Hicaz</b>: Hicaz beşlisi + Hicaz dörtlüsü</p>' +
    '<p>Hicaz ile Uzzal’ın sesleri aynıdır; ayıran şey güçlüleri: Neva ve Hüseyni.</p>' }]
    .concat(makamlar(['hicaz', 'humayun', 'uzzal', 'zirguleli']).map(makamKarti));
};

MAKAM_UNITELER[3].ders = function () {
  return [{ baslik: 'Neva’da Hicaz', metin:
    '<p>Bu iki makamın ortak noktası: <b>Neva</b> perdesinde bir <b>Hicaz</b> çeşnisi. Donanımları da aynı: Si koma bemolü, Mi bakiye bemolü, Fa bakiye diyezi.</p>' +
    '<p><b>Karcığar</b>: Dügâh’ta Uşşak dörtlüsü + Neva’da Hicaz beşlisi. Karar Dügâh.<br><b>Sûzinâk</b>: Rast’ta Rast beşlisi + Neva’da Hicaz dörtlüsü. Karar Rast.</p>' +
    '<p>Sûzinâk dizisini Dügâh’tan okursan Karcığar’ı bulursun: ayıran şey <b>karar perdesi</b>.</p>' }]
    .concat(makamlar(['karcigar', 'suzinak']).map(makamKarti));
};
MAKAM_UNITELER[4].ders = function () {
  return [
    { baslik: 'Ustalık', metin:
      '<p>Bu ünitede ipucu yok. Bir makamı üç bilgiden tanıyacaksın: <b>karar</b>, <b>güçlü</b> ve <b>donanım</b>.</p>' +
      '<p>Sonra makamın dizisini kendin yazacaksın: ilk ses verilir, gerisini alt ve üst parçanın aralıklarıyla porteye kurarsın.</p>' },
    { baslik: 'Diziyi yazmanın yolu', cizim: function () { return h('div', { class: 'kartPorte' }, porteSVG(makamDiziPorte(MAKAM.karcigar))); }, metin:
      '<p>1️⃣ Alt parçanın aralıklarını karardan başlayarak yaz.<br>2️⃣ Güçlüden itibaren üst parçanın aralıklarını ekle.<br>3️⃣ Her ses bir sonraki harfe yazılır; işareti göçürmedeki gibi doğal aralıkla karşılaştırarak bul.</p>' }
  ];
};

// =====================================================
// GÖÇÜRÜLMÜŞ (ŞED) MAKAMLAR
// Kaynak: TDV İslâm Ansiklopedisi (Mâhur, Hicazkâr, Kürdîlihicazkâr, Nihâvend, Sultânîyegâh maddeleri)
// Dizi, kaynak makamın aralıklarından göçürme motoruyla hesaplanır; donanım dizideki işaretlerdir.
// =====================================================
const SED_HAM = [
  { id: 'mahur', ad: 'Mahur', kaynak: 'cargah', perde: 'Rast', guclu: 'Gerdâniye', yeden: 'Geveşt',
    not: 'Batı müziğindeki Sol majöre denk gelir. Seyri inicidir.' },
  { id: 'hicazkar', ad: 'Hicazkâr', kaynak: 'zirguleli', perde: 'Rast', guclu: 'Gerdâniye', yeden: 'Irak',
    not: 'Seyri inicidir; ikinci güçlüsü Neva’dır.' },
  { id: 'kurdilihicazkar', ad: 'Kürdîlihicazkâr', kaynak: 'kurdi', perde: 'Rast', guclu: 'Gerdâniye', yeden: 'Acem Aşiran',
    not: 'Hacı Ârif Bey’in terkibi. Seyri inicidir; tam karar Rast’ta Kürdi çeşnisiyle verilir.' },
  { id: 'nihavend', ad: 'Nihâvend', kaynak: 'buselik', ust: 'd-kurdi', perde: 'Rast', guclu: 'Neva', yeden: 'Irak',
    not: 'Neva’daki dörtlü Kürdi ya da Hicaz olabilir; burada Kürdi’li hali gösteriliyor. Yarım karar Neva’da Kürdi çeşnisiyle yapılır.' },
  { id: 'sultaniyegah', ad: 'Sultânîyegâh', kaynak: 'buselik', perde: 'Yegâh', guclu: 'Neva', yeden: 'Kaba Nim Hicaz',
    not: 'Dügâh’taki dörtlü Hicaz ya da Kürdi olabilir; burada Hicaz’lı hali gösteriliyor. İkinci güçlüsü Dügâh’tır.' }
];
const SEDLER = SED_HAM.map(function (s) {
  const k = MAKAM[s.kaynak], alt = k.altC, ust = s.ust ? CESNI[s.ust] : k.ustC;
  const dizi = gocurPerde(alt.araliklar.concat(ust.araliklar), PERDE[s.perde], 20, 50);
  if (!dizi) { console.warn('Şed dizisi yazılamadı: ' + s.ad); return null; }
  const birlesme = alt.notalar.length - 1;
  const ustYer = KOMADAN_PERDE[komaOf(dizi[birlesme])].ad;
  let gi = dizi.findIndex(function (n) { return KOMADAN_PERDE[komaOf(n)].ad === s.guclu; });
  if (gi < 0) gi = birlesme;
  const isaretli = [];
  dizi.forEach(function (n) { if (n.a && !isaretli.some(function (x) { return x.h === n.h && x.a === n.a; })) isaretli.push({ h: n.h, o: n.o, a: n.a }); });
  return Object.assign({}, s, {
    sed: true, oge: 'm:' + s.id, karar: s.perde, kaynakAd: k.ad,
    altC: alt, ustC: ust, alt: [alt.id, s.perde], ust: [ust.id, ustYer],
    altAd: alt.ad + ' (' + s.perde + ')', ustAd: ust.ad + ' (' + ustYer + ')',
    dizi: dizi, gucluIdx: gi, donanim: [], donanimNota: isaretli,
    not: k.ad + ' makamı dizisinin ' + s.perde + ' perdesine göçürülmüşü. ' + s.not
  });
}).filter(Boolean);
SEDLER.forEach(function (m) { MAKAM[m.id] = m; });
function makamBul(oge) { return MAKAMLAR.find(function (x) { return x.oge === oge; }) || SEDLER.find(function (x) { return x.oge === oge; }); }
const SED_PERDE_SECENEK = ['Rast', 'Yegâh', 'Dügâh', 'Çargâh', 'Neva', 'Segâh', 'Acem Aşiran', 'Hüseyni Aşiran', 'Irak'];

function sedSoru(tip, m) {
  if (tip === 'kaynak' || tip === 'perde') {
    const q = { oge: m.oge, tip: 'secim', aciklama: makamAciklama(m) + '<br>' + kacis(m.not), ipucu: 'Karar: ' + m.karar };
    if (tip === 'kaynak') {
      q.soru = { metin: m.ad }; q.alt = 'Hangi makamın göçürülmüşüdür (şeddi)?';
      const dis = karistir(MK_ILK10.filter(function (x) { return x !== m.kaynak; })).slice(0, 3);
      q.siklar = [m.kaynak].concat(dis).map(function (x) { return { key: x, metin: MAKAM[x].ad }; });
      q.dogru = m.kaynak; q.dogruMetin = m.kaynakAd;
      q.ipucu = 'Dizisi: ' + m.altAd + ' + ' + m.ustAd;
    } else {
      q.soru = { metin: m.ad, kucuk: true }; q.alt = m.kaynakAd + ' makamı dizisinin hangi perdeye göçürülmüşüdür?';
      const dis = karistir(SED_PERDE_SECENEK.filter(function (x) { return x !== m.perde && x !== MAKAM[m.kaynak].karar; })).slice(0, 3);
      q.siklar = [m.perde].concat(dis).map(function (x) { return { key: x, metin: x }; });
      q.dogru = m.perde; q.dogruMetin = m.perde;
      q.ipucu = 'Göçürülen makamın kararı, şeddin kararıdır.';
    }
    return q;
  }
  const havuz = tip === 'makamDonanim' ? SEDLER.concat(MAKAMLAR) : SEDLER;
  const q = makamSoru(tip, m, havuz);
  q.aciklama = makamAciklama(m) + '<br><span class="soluk">' + kacis(m.not) + '</span>';
  return q;
}
function sedUretici(tipler) {
  return function (n) {
    const L = [];
    let onceki = null;
    for (let i = 0; i < n; i++) {
      let m;
      for (let d = 0; d < 10; d++) { m = rastgele(SEDLER); if (m !== onceki) break; }
      onceki = m;
      L.push(sedSoru(tipler[i % tipler.length], m));
    }
    return karistir(L);
  };
}

function makamOgeSorusu(id) {
  const sed = SEDLER.find(function (x) { return x.oge === id; });
  if (sed) return sedSoru(rastgele(['kaynak', 'perde', 'karar', 'guclu', 'donanimMakam', 'diziDogru']), sed);
  const m = MAKAMLAR.find(function (x) { return x.oge === id; });
  let tip = rastgele(MK_KIMLIK.concat(MK_TANI, MK_DON, ['makamKur']));
  if ((tip === 'donanimMakam' || tip === 'makamDonanim') && m.donanimYazilmaz) tip = 'parcaAd';
  return makamSoru(tip, m, MAKAMLAR);
}

// =====================================================
// GÖÇÜRME ANTRENMANI
// =====================================================
const GOCURME_BASLANGIC = ['Yegâh', 'Hüseyni Aşiran', 'Acem Aşiran', 'Irak', 'Rast', 'Dügâh', 'Kürdi', 'Segâh', 'Bûselik', 'Çargâh',
  'Nim Hicaz', 'Neva', 'Hüseyni', 'Acem', 'Evç', 'Gerdâniye', 'Zirgüle', 'Nim Zirgüle', 'Dik Kürdi', 'Hisar'];
const SIRA_AD = ['1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.'];

// Bir yapının (aralıklar, ad, orijinal yer) geçerli bir göçürmesini bul
// Göçürme sonuçları sık kullanılan perdelerde (1–3. paket) kalsın
const GOCURME_YAYGIN = {};
PAKET.slice(0, 3).forEach(function (pk) { pk.forEach(function (ad) { GOCURME_YAYGIN[ad] = true; }); });
// Perde adı sorulmayan ilk ünitelerde başlangıç sesi işaretsiz olsun (kolaydan zora)
const GOCURME_BASLANGIC_TAM = ['Yegâh', 'Hüseyni Aşiran', 'Acem Aşiran', 'Rast', 'Dügâh', 'Bûselik', 'Çargâh', 'Neva', 'Hüseyni', 'Acem', 'Gerdâniye'];
function gocurmeBul(araliklar, orijinalYer, baslangiclar) {
  const adaylar = karistir(perdeler(baslangiclar || GOCURME_BASLANGIC).filter(function (p) { return p.ad !== orijinalYer; }));
  for (let i = 0; i < adaylar.length; i++) {
    const L = gocurPerde(araliklar, adaylar[i]);
    if (L && L.every(function (n) { return GOCURME_YAYGIN[KOMADAN_PERDE[komaOf(n)].ad]; })) return { perde: adaylar[i], notalar: L };
  }
  return null;
}
// bir notanın işaretini komşu bir işaretle değiştir (yanlış şık için)
function yanlisYazim(notalar) {
  const L = notalar.map(function (n) { return Object.assign({}, n); });
  const i = 1 + Math.floor(Math.random() * (L.length - 1));
  const sec = [null, '+k', '-k', '+bk', '-bk', '+km', '-km', '+bm', '-bm'].filter(function (a) { return a !== L[i].a; });
  // yakın işaretleri tercih et
  const yakin = sec.filter(function (a) { return Math.abs(aeuFark(a) - aeuFark(L[i].a)) <= 5; });
  L[i].a = rastgele(yakin.length ? yakin : sec);
  return L;
}

function gocurmeSorusu(asama, tip, perdesiz) {
  if (Array.isArray(asama)) asama = rastgele(asama);
  let yapi, ad, yer, gucluIdx = null, oge = null;
  const sabit = GOCURME_SABIT; GOCURME_SABIT = null;
  if (asama === 'makam') {
    const m = sabit && MAKAM[sabit.slice(2)] ? MAKAM[sabit.slice(2)] : rastgele(MAKAMLAR.filter(function (x) { return x.dizi && MK_TUM12.indexOf(x.id) >= 0; }));
    yapi = m.dizi.slice(1).map(function (n, i) { return komaOf(n) - komaOf(m.dizi[i]); }); ad = m.ad + ' makamı dizisi'; yer = m.karar; gucluIdx = m.gucluIdx; oge = 'g:' + m.id;
  } else {
    const c = sabit && CESNI[sabit.slice(2)] ? CESNI[sabit.slice(2)] : rastgele(cesniler(asama === 'dortlu' ? D_TEMEL : B_TEMEL));
    yapi = c.araliklar; ad = c.ad; yer = c.yer; oge = 'g:' + c.id;
  }
  const g = gocurmeBul(yapi, yer, perdesiz ? GOCURME_BASLANGIC_TAM : null);
  if (!g) return gocurmeSorusu(asama, tip, perdesiz);
  const hedef = g.perde.ad;
  // Perde adı sorulmayan kipte yalnızca "doğru yazım" ve "porteye kur" soruları
  const r = tip === 'perde' ? 0.1 : tip === 'porte' ? 0.5 : tip === 'kur' ? 0.9 : (perdesiz ? 0.4 + Math.random() * 0.6 : Math.random());
  const formul = formulMetni(yapi);
  const aciklama = perdesiz
    ? '<b>' + ad + '</b> (' + formul + '): ' + g.notalar.map(notaKisa).join(' – ') + gocurmeAdimlari(g.notalar, true) + arizaDipnotu(g.notalar)
    : '<b>' + ad + '</b> ' + hedef + ' perdesinde: ' +
      g.notalar.map(function (n) { return KOMADAN_PERDE[komaOf(n)].ad; }).join(' – ') +
      gocurmeAdimlari(g.notalar);
  const baslik = perdesiz ? ad : ad + ' → ' + hedef;
  if (r < 0.4) {
    // n. ses hangi perde
    let i = gucluIdx && Math.random() < 0.5 ? gucluIdx : 1 + Math.floor(Math.random() * (g.notalar.length - 1));
    const dogru = KOMADAN_PERDE[komaOf(g.notalar[i])];
    const komsu = PERDELER.filter(function (p) { return p !== dogru && Math.abs(p.koma - dogru.koma) <= 9; });
    const dis = karistir(komsu).slice(0, 3);
    return {
      oge: oge, tip: 'secim',
      soru: { metin: ad + ' → ' + hedef, kucuk: true },
      alt: (i === gucluIdx ? 'Güçlü perdesi (' + SIRA_AD[i] + ' ses)' : SIRA_AD[i] + ' ses') + ' hangi perde olur?',
      siklar: [dogru].concat(dis).map(function (p) { return { key: p.id, metin: p.ad }; }),
      dogru: dogru.id, dogruMetin: dogru.ad, aciklama: aciklama,
      ipucu: 'Aralık dizilişi aynı kalır, sadece başlangıç perdesi değişir.'
    };
  }
  if (r < 0.75) {
    const yanlislar = [];
    for (let d = 0; d < 20 && yanlislar.length < 3; d++) {
      const y = yanlisYazim(g.notalar);
      const k = JSON.stringify(y);
      if (k !== JSON.stringify(g.notalar) && yanlislar.every(function (x) { return x.k !== k; })) yanlislar.push({ k: k, n: y });
    }
    const genis = g.notalar.length > 5;
    return {
      oge: oge, tip: 'secim',
      soru: { metin: baslik, kucuk: true }, alt: perdesiz ? 'Aynı sesten başlayan dört yazım var. Doğru göçürülmüş olan hangisi?' : 'Doğru yazım hangisi?',
      siklar: [{ key: 'd', porte: { notalar: g.notalar, aralik: genis ? 33 : 38, enAz: genis ? 320 : 250 }, genis: true }]
        .concat(yanlislar.map(function (y, i) { return { key: 'y' + i, porte: { notalar: y.n, aralik: genis ? 33 : 38, enAz: genis ? 320 : 250 }, genis: true }; })),
      dogru: 'd', dogruMetin: g.notalar.map(perdesiz ? notaKisa : perdeAdiNota).join(' – '), aciklama: aciklama, formul: perdesiz ? formul : null,
      ipucu: perdesiz ? 'Her adımda doğal aralığı bul (Mi–Fa ve Si–Do bakiye, diğerleri tanini), gereken aralıkla farkını işarete çevir.' : 'Her sesin perdesini bul, sonra o harfe göre işaretini seç.'
    };
  }
  return {
    oge: oge, tip: 'yer',
    soru: { metin: baslik, kucuk: true }, alt: perdesiz ? 'İlk ses verildi. Aynı aralıklarla kalan sesleri porteye kur' : 'İlk ses verildi. Göçürülmüş diziyi porteye kur',
    yer: { slotlar: g.notalar.map(function (n, i) { return i === 0 ? { sabit: n } : {}; }), palet: 'aeu', beklenen: g.notalar, harfSirali: true },
    dogruMetin: g.notalar.map(function (n) { return perdesiz ? notaKisa(n) : KOMADAN_PERDE[komaOf(n)].ad; }).join(' – '),
    aciklama: aciklama, ipucu: 'Her ses bir sonraki harfe yazılır.', formul: formul
  };
}
let GOCURME_SABIT = null;   // Tekrar: belirli bir yapının göçürme sorusu
function gocurmeOgeSorusu(id) {
  const kim = id.slice(2);
  GOCURME_SABIT = id;
  const asama = MAKAM[kim] ? 'makam' : (CESNI[kim] && CESNI[kim].tur === 'Beşli' ? 'besli' : 'dortlu');
  return gocurmeSorusu(asama, rastgele(['porte', 'kur']), true);
}
function gocurmeUretici(asama, perdesiz) {
  return function (n) { const L = []; for (let i = 0; i < n; i++) L.push(gocurmeSorusu(asama, undefined, perdesiz)); return L; };
}
const GOCURME_ASAMALAR = [
  { id: 'dortlu', ad: 'Dörtlüleri göçür', ikon: '4️⃣', uret: gocurmeUretici('dortlu', true) },
  { id: 'besli', ad: 'Beşlileri göçür', ikon: '5️⃣', uret: gocurmeUretici('besli', true) },
  { id: 'makam', ad: 'Makam dizilerini göçür', ikon: '🏵️', uret: gocurmeUretici('makam', true) },
  { id: 'adlar', ad: 'Perde adlarıyla göçür', ikon: '🏷️', uret: gocurmeUretici(['dortlu', 'besli', 'makam'], false) }
];
// ---- Göçürmenin hesabı (adım adım) ----
// Her harfin oktav içindeki doğal yeri (koma): Do 0, Re 9, Mi 18, Fa 22, Sol 31, La 40, Si 49
function perdeAdiNota(n) { const p = KOMADAN_PERDE[komaOf(n)]; return p ? p.ad : notaMetni(n); }
function notaKisa(n) { return HARF_AD[n.h] + (n.a ? ' ' + isaretAdi(n.a).replace(/ (diyezi|bemolü)$/, function (m) { return m === ' diyezi' ? ' diyez' : ' bemol'; }) : ''); }
// Göçürme: her adımda iki harf arasındaki doğal aralığı (tanini 9 ya da bakiye 4)
// gereken aralıkla karşılaştır; önceki ses işaretliyse onu da hesaba kat. Fark yeni sesin işaretidir.
const ARALIK_ADI = { 1: 'koma', 4: 'bakiye', 5: 'küçük mücenneb', 8: 'büyük mücenneb', 9: 'tanini', 12: 'artık ikili', 13: 'artık ikili' };
const YONELME_EKI = ['’ya', '’ye', '’ye', '’ya', '’e', '’ya', '’ye'];   // Do’ya, Re’ye, Mi’ye, Fa’ya, Sol’e, La’ya, Si’ye
function dogalAralik(n) { return n.h === 2 || n.h === 6 ? 4 : 9; }   // Mi–Fa ve Si–Do bakiye, diğerleri tanini
function gocurmeAdimlari(notalar, perdesiz) {
  const L = [];
  const ilk = notalar[0];
  L.push(perdesiz ? '<li>Başlangıç: <b>' + notaKisa(ilk) + '</b></li>' : '<li>Başlangıç: <b>' + perdeAdiNota(ilk) + '</b> (' + notaKisa(ilk) + ')</li>');
  for (let i = 1; i < notalar.length; i++) {
    const on = notalar[i - 1], n = notalar[i];
    const gereken = komaOf(n) - komaOf(on);
    const dogal = dogalAralik(on), e = aeuFark(on.a), mevcut = dogal - e, fark = gereken - mevcut;
    let s = '<li>' + HARF_AD[on.h] + ' → ' + HARF_AD[n.h] + ': doğal aralık ' + ARALIK_ADI[dogal] + ' (' + dogal + ')';
    if (e) s += ', ama ' + HARF_AD[on.h] + ' ' + Math.abs(e) + ' koma ' + (e > 0 ? 'yükseltilmiş' : 'alçaltılmış') + ' → arada ' + dogal + (e > 0 ? ' − ' : ' + ') + Math.abs(e) + ' = ' + mevcut;
    s += '. Gereken <b>' + (ARALIK_HARF[gereken] || '?') + '</b> (' + ARALIK_ADI[gereken] + ', ' + gereken + '). ';
    const sonuc = fark === 0 ? HARF_AD[n.h] + ' işaretsiz' : HARF_AD[n.h] + YONELME_EKI[n.h] + ' ' + isaretAdi(n.a);
    s += gereken + ' − ' + mevcut + ' = ' + (fark > 0 ? '+' : '') + fark + ' → ' + (perdesiz ? '<b>' + sonuc + '</b></li>' : sonuc + ' → <b>' + perdeAdiNota(n) + '</b></li>');
    L.push(s);
  }
  return '<div class="hesapBaslik">🧮 Hesap</div><ol class="hesap">' + L.join('') + '</ol>';
}
// Perde adı sorulmayan göçürmelerde: arızalı (işaretli) seslerin perde adları dipnot olarak
function arizaDipnotu(notalar) {
  const gor = {};
  const L = [];
  notalar.forEach(function (n) {
    if (!n.a) return;
    const p = KOMADAN_PERDE[komaOf(n)];
    if (!p || gor[p.ad]) return;
    gor[p.ad] = 1;
    L.push(HARF_AD[n.h] + ' ' + isaretAdi(n.a) + ' = <b>' + p.ad + '</b>');
  });
  if (!L.length) return '';
  return '<div class="dipnot">📝 <b>Dipnot · perde adları:</b> ' + L.join(' · ') + '</div>';
}
function formulMetni(araliklar) { return araliklar.map(function (k) { return ARALIK_HARF[k] || '?'; }).join(' '); }
const HARF_ARALIK_TABLOSU = '<div class="harfAralik">' + [['Do', 'Re', 9], ['Re', 'Mi', 9], ['Mi', 'Fa', 4], ['Fa', 'Sol', 9], ['Sol', 'La', 9], ['La', 'Si', 9], ['Si', 'Do', 4]].map(function (x) {
  return '<span class="' + (x[2] === 4 ? 'bakiyeli' : '') + '"><b>' + x[0] + '–' + x[1] + '</b>' + (x[2] === 4 ? 'B · 4' : 'T · 9') + '</span>';
}).join('') + '</div>';

function gocurmeDersi() {
  const rast = CESNI['d-rast'];
  const ornek = gocurPerde(rast.araliklar, PERDE['Dügâh']);
  return [
    { baslik: 'Göçürme nedir?', metin:
      '<p><b>Göçürme</b>, bir dörtlüyü, beşliyi ya da makam dizisini başka bir perdeye taşımaktır. <b>Aralıklar aynı kalır</b>, perdeler değişir.</p>' +
      '<p>Bunun için iki şeyi bilmek yeter: aralıkların kaç koma olduğu ve yan yana iki harf arasındaki doğal aralık.</p>' },
    { baslik: 'Aralıkların koma değerleri', cizim: komaCetveliSVG, metin:
      '<p><b>T</b> tanini = <b>9</b> koma<br><b>K</b> büyük mücenneb = <b>8</b> koma<br><b>S</b> küçük mücenneb = <b>5</b> koma<br><b>B</b> bakiye = <b>4</b> koma<br><b>A</b> artık ikili = <b>12–13</b> koma</p>' +
      '<p>Örnek: Rast dörtlüsü <b>T K S</b>: tanini (9), büyük mücenneb (8), küçük mücenneb (5).</p>' },
    { baslik: 'Harfler arası doğal aralıklar', metin:
      '<p>İşaretsiz iki komşu harf arasındaki aralık hep aynıdır:</p>' + HARF_ARALIK_TABLOSU +
      '<p>Çoğu komşu harf arası <b>tanini</b> (T, 9 koma). Yalnızca <b>Mi–Fa</b> ve <b>Si–Do</b> arası <b>bakiye</b>dir (B, 4 koma); tanini değil.</p>' },
    { baslik: 'Önce yerinde: Rast’ta Rast dörtlüsü', cizim: function () {
        return h('div', { class: 'kartPorte' }, porteSVG({ notalar: rast.notalar, aralik: 38, enAz: 240, etiketler: ['Rast', 'T', 'K', 'S'] }));
      }, metin: gocurmeAdimlari(rast.notalar) +
      '<p>La–Si doğal olarak tanini (9), ama dörtlü burada K (8) istiyor: 8 − 9 = −1 → Si’ye <b>koma bemolü</b>. Si koma bemol = <b>Segâh</b>.</p>' },
    { baslik: 'Dügâh’a göçür: adım adım', cizim: function () {
        return h('div', { class: 'kartPorte' }, porteSVG({ notalar: ornek, aralik: 38, enAz: 240, etiketler: ['Dügâh', 'T', 'K', 'S'] }));
      }, metin: gocurmeAdimlari(ornek) +
      '<p>Aralıklar aynı kalmalı: <b>T K S</b>. Ama Dügâh’tan başlayınca harfler arası doğal aralıklar değişiyor: Si–Do bir bakiye (4). K (8) olması için Do’ya <b>bakiye diyezi</b> gerekiyor (8 − 4 = +4) → <b>Nim Hicaz</b>. Sonra Do zaten 4 koma yükseldiği için Do–Re arası 9 − 4 = 5 kalıyor; bu da istenen S (5), Re işaretsiz kalıyor. Sonuç: <b>' +
      ornek.map(perdeAdiNota).join(' – ') + '</b>.</p>' },
    { baslik: 'Kural', metin:
      '<p>Her adımda:</p><p>1️⃣ Bir sonraki <b>harfi</b> yaz.<br>2️⃣ İki harf arasındaki <b>doğal aralığı</b> bul: tanini (9), Mi–Fa ve Si–Do’da bakiye (4). Önceki ses işaretliyse onu da hesaba kat: diyezliyse aralık o kadar daralır, bemollüyse genişler.<br>3️⃣ <b>Gereken aralıkla</b> karşılaştır: aradaki fark yeni sesin işaretidir.</p>' +
      '<p><b>+1</b> koma diyezi · <b>+4</b> bakiye diyezi · <b>+5</b> küçük mücenneb diyezi · <b>+8</b> büyük mücenneb diyezi<br>Eksi değerler aynı adlı bemoller.</p>' +
      '<p>Fark bu sayılardan biri değilse (ör. +3), yapı o perdeden bu yazımla kurulamaz; başlangıç perdesinin öteki yazımını dene.</p>' }
  ];
}
