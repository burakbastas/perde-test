// =====================================================
// PERDE MERDİVENLERİ (Öğren kartları)
// İki komşu tam perde arasındaki ara perdeleri, porte üzerinde bir notadan ötekine
// çapraz giden koma çizgisiyle gösterir. Aynı aralığın bir oktav tizi ya da pesti
// kesik çizgiyle birlikte çizilir. Altındaki listede her ara perdenin adı ve iki yazımı.
// =====================================================
'use strict';

// Kaba Çargâh'tan Çargâh'a bir oktav; her kartta bir oktav tizdeki eşi de çizilir,
// böylece Kaba Çargâh'tan Tiz Çargâh'a 48 perdenin hepsi görülür.
const MERDIVEN_SIRA = ['Kaba Çargâh', 'Yegâh', 'Hüseyni Aşiran', 'Acem Aşiran', 'Rast', 'Dügâh', 'Bûselik', 'Çargâh'];
const MERDIVEN_NOT = {
  'Kaba Çargâh': 'Kurala uyan aile: <b>Nim</b> +4 · <b>yalın ad</b> +5 · <b>Dik</b> +8. Pest oktavda adların başına <b>Kaba</b> gelir; bir oktav tizde Kaba düşer: Nim Hicaz, Hicaz, Dik Hicaz.',
  'Yegâh': 'Kurala uyan aile: <b>Kaba Nim Hisar</b> +4 · <b>Kaba Hisar</b> +5 · <b>Kaba Dik Hisar</b> +8. Bir oktav tizde Neva’dan sonra Nim Hisar, Hisar, Dik Hisar olur.',
  'Hüseyni Aşiran': 'Hüseyni Aşiran ile Acem Aşiran arası yalnız <b>4 koma</b> (bakiye). Arada hiç ara perde yoktur; bir oktav tizde Hüseyni ile Acem arası da böyledir.',
  'Acem Aşiran': '<b>İstisna bölgesi:</b> <b>Dik Acem Aşiran</b> +1 · <b>Irak</b> +4 · <b>Geveşt</b> +5 · <b>Dik Geveşt</b> +8. Bir oktav tizde Irak’ın adı <b>Evç</b>, Geveşt’in adı <b>Mahur</b> olur.',
  'Rast': 'Kurala uyan aile: <b>Nim</b> +4 · <b>yalın ad</b> +5 · <b>Dik</b> +8. Bir oktav tizde aynı merdiven Şehnaz adıyla tekrar eder.',
  'Dügâh': '<b>İstisna:</b> burada yalın ad +4’tedir: <b>Kürdi</b> +4, <b>Dik Kürdi</b> +5. +8’deki perdenin adı da <b>Segâh</b>’tır. Tiz oktavda Kürdi’nin adı <b>Sünbüle</b> olur.',
  'Bûselik': 'Bûselik ile Çargâh arası yalnız <b>4 koma</b> (bakiye). Tek ara perde <b>Dik Bûselik</b>: Çargâh’tan 1 koma pest. Tiz oktavda bu perdenin adı kullanılmaz.'
};

function merdivenOktav(alt, ust) {
  // Önce tiz, yoksa pest oktavdaki eşini bul
  for (const yon of [1, -1]) {
    const a = KOMADAN_PERDE[alt.koma + 53 * yon], b = KOMADAN_PERDE[ust.koma + 53 * yon];
    if (a && b) return { alt: a, ust: b, yon: yon };
  }
  return null;
}
function merdivenAra(alt, ust) {
  return PERDELER.filter(function (p) { return p.koma > alt.koma && p.koma < ust.koma; });
}
// "Sol [işaret] = La [işaret]" yazımı, işaretler nota yazı tipiyle
function merdivenYazim(p) {
  const kap = h('span', { class: 'mdYazim' });
  p.parcalar.forEach(function (n, i) {
    if (i) kap.appendChild(h('span', { class: 'mdEsit' }, ' = '));
    kap.appendChild(document.createTextNode(HARF_AD[n.h]));
    if (n.a) kap.appendChild(h('span', { class: 'mdGlif bravura' }, glifStr(ARIZA_GLIF[n.a])));
  });
  return kap;
}

function merdivenSVG(alt, ust, es, kompakt) {
  const D = 14;                         // porte aralığı
  const SAP = kompakt ? 2.5 : 3.4;      // sap boyu (porte aralığı cinsinden)
  const W = 300, xA = 86, xB = W - 26;
  const anaAdim = [adim(alt.parcalar[0]), adim(ust.parcalar[0])];
  const esAdim = es ? [adim(es.alt.parcalar[0]), adim(es.ust.parcalar[0])] : [];
  const tum = anaAdim.concat(esAdim, [30, 38]);
  const sMin = Math.min.apply(null, tum), sMax = Math.max.apply(null, tum);
  const ustBosluk = SAP * D + 8, altBosluk = SAP * D + 8;
  const H = (sMax - sMin) * D / 2 + ustBosluk + altBosluk;
  const Y = function (s) { return ustBosluk + (sMax - s) * D / 2; };
  const svg = svgEl('svg', { class: 'merdiven', viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'xMidYMid meet', role: 'img' });

  for (let s = 30; s <= 38; s += 2) svg.appendChild(svgEl('line', { x1: 0, x2: W, y1: Y(s), y2: Y(s), class: 'mdPorte' }));
  const anahtar = svgEl('text', { x: 24, y: Y(32), 'font-size': 4 * D, 'text-anchor': 'middle', class: 'mdNota bravura' });
  anahtar.textContent = glifStr(GLIF_SOL);
  svg.appendChild(anahtar);

  // es oktav yukarıdaysa ana notaların sapı aşağı, eşinki yukarı (birbirine çarpmasınlar)
  const esYukarida = es && es.yon > 0;
  function nota(p, x, sapYukari) {
    const s = adim(p.parcalar[0]), y = Y(s);
    for (let e = 28; e >= s; e -= 2) svg.appendChild(svgEl('line', { x1: x - 13, x2: x + 13, y1: Y(e), y2: Y(e), class: 'mdPorte' }));
    for (let e = 40; e <= s; e += 2) svg.appendChild(svgEl('line', { x1: x - 13, x2: x + 13, y1: Y(e), y2: Y(e), class: 'mdPorte' }));
    const bas = svgEl('text', { x: x, y: y, 'font-size': 4 * D, 'text-anchor': 'middle', class: 'mdNota bravura' });
    bas.textContent = glifStr(GLIF_BAS);
    svg.appendChild(bas);
    const sx = sapYukari ? x + 0.56 * D : x - 0.56 * D;
    svg.appendChild(svgEl('line', { x1: sx, x2: sx, y1: y + (sapYukari ? -1 : 1), y2: y + (sapYukari ? -SAP : SAP) * D, class: 'mdSap' }));
  }
  function cizgi(a, b, sinif, rakamYukari) {
    const ya = Y(adim(a.parcalar[0])), yb = Y(adim(b.parcalar[0])), n = b.koma - a.koma;
    svg.appendChild(svgEl('line', { x1: xA, y1: ya, x2: xB, y2: yb, class: 'mdCizgi ' + sinif }));
    for (let k = 1; k < n; k++) {
      const x = xA + (xB - xA) * k / n, y = ya + (yb - ya) * k / n;
      const p = KOMADAN_PERDE[a.koma + k];
      svg.appendChild(svgEl('line', { x1: x, x2: x, y1: y - 4, y2: y + 4, class: 'mdTik ' + sinif }));
      if (p) svg.appendChild(svgEl('circle', { cx: x, cy: y, r: 4, class: 'mdNokta ' + sinif }));
      const t = svgEl('text', { x: x, y: rakamYukari ? y - 8 : y + 16, 'text-anchor': 'middle', class: 'mdRakam ' + sinif + (p ? ' ad' : '') });
      t.textContent = k;
      svg.appendChild(t);
    }
  }
  if (es) {
    cizgi(es.alt, es.ust, 'es', esYukarida);
    nota(es.alt, xA, esYukarida); nota(es.ust, xB, esYukarida);
  }
  cizgi(alt, ust, 'ana', es ? !esYukarida : true);
  nota(alt, xA, !esYukarida); nota(ust, xB, !esYukarida);
  return svg;
}

function merdivenListe(alt, ust, es) {
  const liste = h('div', { class: 'mdListe' });
  const esAdi = es ? (es.yon > 0 ? 'bir oktav tizde' : 'bir oktav pestte') : null;
  if (es) liste.appendChild(h('div', { class: 'mdBaslik' }, h('span', null, 'koma'), h('span', null, 'perde'), h('span', { class: 'es' }, esAdi)));
  const satirlar = [alt].concat(merdivenAra(alt, ust), [ust]);
  satirlar.forEach(function (p) {
    const k = p.koma - alt.koma, tam = p === alt || p === ust;
    const esP = es ? KOMADAN_PERDE[p.koma + 53 * es.yon] : null;
    liste.appendChild(h('div', { class: 'mdSatir' + (tam ? ' tam' : '') },
      h('span', { class: 'mdKoma' }, tam ? (k === 0 ? '0' : String(k)) : '+' + k),
      h('span', { class: 'mdAd' }, h('b', null, p.ad), merdivenYazim(p)),
      es ? h('span', { class: 'mdEs' }, esP ? esP.ad : '–') : null));
  });
  return liste;
}

function merdivenKarti(altAd) {
  const i = MERDIVEN_SIRA.indexOf(altAd);
  const alt = PERDE[altAd], ust = PERDE[MERDIVEN_SIRA[i + 1]];
  const es = merdivenOktav(alt, ust);
  const n = ust.koma - alt.koma;
  return {
    baslik: alt.ad + ' → ' + ust.ad + ' · ' + n + ' koma',
    cizim: function () {
      return h('div', null, h('div', { class: 'mdKutu' }, merdivenSVG(alt, ust, es)), merdivenListe(alt, ust, es));
    },
    metin: '<p>' + MERDIVEN_NOT[altAd] + '</p>'
  };
}

function merdivenKartlari() {
  return [{
    baslik: 'Perde merdiveni nasıl okunur?',
    cizim: function () {
      const alt = PERDE['Rast'], ust = PERDE['Dügâh'];
      return h('div', { class: 'mdKutu' }, merdivenSVG(alt, ust, null));
    },
    metin: '<p>İki tam perde arasındaki <b>koma çizgisi</b>, bir notadan ötekine çapraz çıkar. Her çentik <b>1 koma</b>; içi dolu noktalar adı olan <b>ara perdeler</b>.</p>' +
      '<p>Tam perdelerin çoğu arasında <b>9 koma</b> (tanini) vardır; Bûselik–Çargâh ve Hüseyni–Acem arasında ise yalnız <b>4 koma</b> (bakiye).</p>' +
      '<p>Kesik çizgi aynı merdivenin <b>bir oktav tizini ya da pestini</b> gösterir: komalar aynı, adlar değişir.</p>'
  }].concat(MERDIVEN_SIRA.slice(0, -1).map(merdivenKarti));
}
