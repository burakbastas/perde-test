// =====================================================
// NOTA: glifler, nota yazımı, porte çizimi, porteye yerleştirme bileşeni
// Nota biçimi: { h: 0..6 (Do..Si), o: oktav, a: değiştirme işareti kodu | null }
//  AEU işaret kodları: '+k' '-k' '+bk' '-bk' '+km' '-km' '+bm' '-bm'
//  Batı işaret kodları: '#' 'b' 'n' 'x' 'bb'
// =====================================================
'use strict';

const SVGNS = 'http://www.w3.org/2000/svg';
const HARF_AD = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'];
const HARF_IDX = { do: 0, re: 1, mi: 2, fa: 3, sol: 4, la: 5, si: 6 };
const KOMA_TABAN = [0, 9, 18, 22, 31, 40, 49];   // Do=0 ... Si=49, oktav 53 koma
const YARIM_TABAN = [0, 2, 4, 5, 7, 9, 11];      // Batı yarım ses
const GLIF_SOL = 0xE050, GLIF_BAS = 0xE0A4;

const ARIZA_GLIF = {
  '+k': 0xE444, '-k': 0xE443, '+bk': 0xE445, '-bk': 0xE442,
  '+km': 0xE446, '-km': 0xE441, '+bm': 0xE447, '-bm': 0xE440,
  '#': 0xE262, 'b': 0xE260, 'n': 0xE261, 'x': 0xE263, 'bb': 0xE264
};
const AEU_KOMA = { k: 1, bk: 4, km: 5, bm: 8 };
const TUR_AD = { k: 'koma', bk: 'bakiye', km: 'küçük mücenneb', bm: 'büyük mücenneb' };
const AEU_KODLAR = ['+k', '+bk', '+km', '+bm', '-k', '-bk', '-km', '-bm'];

function glifStr(kod) { return String.fromCodePoint(kod); }

// ---- AEU ----
function aeuFark(a) {
  if (!a) return 0;
  const m = /^([+-])(k|bk|km|bm)$/.exec(a);
  if (!m) return 0;
  return (m[1] === '+' ? 1 : -1) * AEU_KOMA[m[2]];
}
function farktanAeu(d) {
  if (d === 0) return null;
  const tur = { 1: 'k', 4: 'bk', 5: 'km', 8: 'bm' }[Math.abs(d)];
  return tur ? (d > 0 ? '+' : '-') + tur : undefined;   // undefined: yazılamaz
}
function adim(n) { return n.o * 7 + n.h; }
function adimdanNota(s, a) { return { h: ((s % 7) + 7) % 7, o: Math.floor(s / 7), a: a || null }; }
function komaOf(n) { return n.o * 53 + KOMA_TABAN[n.h] + aeuFark(n.a); }

// 'Si4-k', 'Do5+bk', 'Sol4'  (oktav yoksa varsayılan kullanılır)
function notaOku(metin, varsayilanOktav) {
  const m = /^(Do|Re|Mi|Fa|Sol|La|Si)(\d)?(?:([+-])(k|bk|km|bm))?$/.exec(String(metin).trim());
  if (!m) throw new Error('Okunamayan nota: ' + metin);
  return { h: HARF_IDX[m[1].toLowerCase()], o: m[2] ? +m[2] : varsayilanOktav, a: m[3] ? m[3] + m[4] : null };
}
function notaEsit(x, y) { return x && y && x.h === y.h && x.o === y.o && (x.a || null) === (y.a || null); }

// "La4 bakiye bemol"
function notaMetni(n) {
  let s = HARF_AD[n.h] + n.o;
  if (n.a && n.a.length > 1 && (n.a[0] === '+' || n.a[0] === '-')) {
    s += ' ' + TUR_AD[n.a.slice(1)] + ' ' + (n.a[0] === '+' ? 'diyez' : 'bemol');
  }
  return s;
}
// İşaret adı (kısa): "bakiye diyezi"
function isaretAdi(a) {
  if (!a) return 'işaretsiz';
  if (a === '#') return 'diyez'; if (a === 'b') return 'bemol'; if (a === 'n') return 'natürel';
  return TUR_AD[a.slice(1)] + ' ' + (a[0] === '+' ? 'diyezi' : 'bemolü');
}

// Türkçe ayrılma eki: Do'dan, Re'den, Fa diyez'den, Si bemol'den
function ayrilmaEki(kelime) {
  const k = String(kelime).toLocaleLowerCase('tr');
  const unluler = k.match(/[aeıioöuüâîû]/g);
  const son = unluler ? unluler[unluler.length - 1] : 'e';
  // bemol ve Sol ince l ile biter: bemolü, Sol’den
  const kalin = 'aıouâû'.indexOf(son) >= 0 && !/(bemol|sol)$/.test(k);
  const sert = 'çfhkpsşt'.indexOf(k[k.length - 1]) >= 0;
  return '’' + (sert ? 't' : 'd') + (kalin ? 'an' : 'en');
}

// ---- Batı ----
function yarimOf(n) {
  const d = { '#': 1, 'b': -1, 'x': 2, 'bb': -2, 'n': 0 }[n.a] || 0;
  return n.o * 12 + YARIM_TABAN[n.h] + d;
}
function batiAd(n, kisa) {
  const ek = { '#': kisa ? '♯' : ' diyez', 'b': kisa ? '♭' : ' bemol', 'x': kisa ? '𝄪' : ' çift diyez', 'bb': kisa ? '𝄫' : ' çift bemol' }[n.a] || '';
  return HARF_AD[n.h] + ek;
}

// =====================================================
// PORTE ÇİZİMİ
// spec: { notalar:[nota|{...nota, renk}], donanim:[nota], ayrac:[i...], enAz: genişlik, aralik: 40 }
// =====================================================
const ALT_CIZGI_Y = 90;            // Mi4 (alt çizgi)
function notaY(s) { return ALT_CIZGI_Y - (s - 30) * 5; }

function svgEl(ad, oz) {
  const e = document.createElementNS(SVGNS, ad);
  for (const k in oz) e.setAttribute(k, oz[k]);
  return e;
}
function svgCizgi(svg, x1, x2, y, renk, kalin) {
  const l = svgEl('line', { x1: x1, x2: x2, y1: y, y2: y, stroke: 'currentColor', 'stroke-width': kalin || 1 });
  if (renk) l.setAttribute('style', 'stroke:' + renk);
  svg.appendChild(l);
}
function svgGlif(svg, kod, x, y, renk, boyut) {
  const t = svgEl('text', {
    x: x, y: y, 'font-family': 'SeyirNota, Bravura', 'font-size': boyut || 40, 'text-anchor': 'middle',
    fill: 'currentColor'
  });
  if (renk) t.setAttribute('style', 'fill:' + renk);
  t.textContent = glifStr(kod);
  svg.appendChild(t);
  return t;
}
function ekCizgiler(svg, nx, y, renk) {
  for (let yl = 40; yl >= y - 0.1; yl -= 10) svgCizgi(svg, nx - 10, nx + 10, yl, renk);
  for (let yl = 100; yl <= y + 0.1; yl += 10) svgCizgi(svg, nx - 10, nx + 10, yl, renk);
}
function donanimCiz(svg, donanim, x0) {
  let x = x0;
  (donanim || []).forEach(function (n) {
    svgGlif(svg, ARIZA_GLIF[n.a], x, notaY(adim(n)));
    x += 12;
  });
  return x;
}
function notaCiz(svg, n, nx, renk) {
  const y = notaY(adim(n));
  ekCizgiler(svg, nx, y, renk);
  if (n.a) svgGlif(svg, ARIZA_GLIF[n.a], nx - 17, y, renk);
  svgGlif(svg, GLIF_BAS, nx, y, renk);
}

function porteSVG(spec) {
  spec = spec || {};
  const notalar = spec.notalar || [];
  const aralik = spec.aralik || 40;
  const svg = svgEl('svg', { class: 'porte', preserveAspectRatio: 'xMidYMid meet', role: 'img' });
  const x = 46 + (spec.donanim ? spec.donanim.length : 0) * 12;
  const basla = Math.max(spec.donanim && spec.donanim.length ? x + 26 : 74, 74);
  const son = basla + Math.max(0, notalar.length - 1) * aralik + 26;
  let W = Math.max(spec.enAz || 200, son);
  let kay = 0;
  if (!spec.donanim || !spec.donanim.length) kay = Math.max(0, (W - son) / 2);
  svg.setAttribute('viewBox', '0 0 ' + W + ' 140');
  for (let i = 0; i < 5; i++) svgCizgi(svg, 0, W, 50 + i * 10);
  svgGlif(svg, GLIF_SOL, 22, 80);
  if (spec.donanim) donanimCiz(svg, spec.donanim, 46);
  notalar.forEach(function (n, i) {
    const nx = basla + kay + i * aralik;
    notaCiz(svg, n, nx, n.renk);
    if (spec.ayrac && spec.ayrac.indexOf(i) >= 0) {
      svg.appendChild(svgEl('line', { x1: nx + aralik / 2, x2: nx + aralik / 2, y1: 50, y2: 90, stroke: 'currentColor', 'stroke-width': 1, 'stroke-dasharray': '3 3', opacity: .6 }));
    }
  });
  if (spec.etiketler) {
    spec.etiketler.forEach(function (et, i) {
      if (!et) return;
      const t = svgEl('text', { x: basla + kay + i * aralik, y: 132, 'font-size': 11, 'text-anchor': 'middle', fill: 'currentColor', 'font-family': 'Nunito, sans-serif', 'font-weight': 700 });
      t.textContent = et;
      svg.appendChild(t);
    });
  }
  return svg;
}

// =====================================================
// PORTEYE YERLEŞTİRME BİLEŞENİ
// cfg: { slotlar:[{sabit:nota}|{}], palet:'aeu'|'bati'|null, smin, smax, etiketler:[] }
// =====================================================
function yerlestirici(cfg) {
  const slotSay = cfg.slotlar.length;
  const smin = cfg.smin || 27, smax = cfg.smax || 43;
  const aralik = 46;
  const basla = 78;
  const W = Math.max(220, basla + (slotSay - 1) * aralik + 30);
  const durum = cfg.slotlar.map(function (s) { return s.sabit ? { s: adim(s.sabit), a: s.sabit.a || null, sabit: true } : null; });
  let aktif = durum.findIndex(function (d) { return !d || !d.sabit; });
  if (aktif < 0) aktif = 0;
  let kilitli = false;

  const kap = h('div', { class: 'yerlestir' });
  const svg = svgEl('svg', { class: 'porte etkilesim', viewBox: '0 0 ' + W + ' 150', preserveAspectRatio: 'xMidYMid meet' });
  const bilgi = h('div', { class: 'yerBilgi' });
  kap.appendChild(svg);
  kap.appendChild(bilgi);

  function sx(i) { return basla + i * aralik; }

  function ciz() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    // aktif sütun vurgusu
    if (!kilitli && slotSay > 1) {
      svg.appendChild(svgEl('rect', { x: sx(aktif) - 21, y: 6, width: 42, height: 138, rx: 10, class: 'yerAktif' }));
    }
    for (let i = 0; i < 5; i++) svgCizgi(svg, 0, W, 50 + i * 10);
    svgGlif(svg, GLIF_SOL, 22, 80);
    durum.forEach(function (d, i) {
      const nx = sx(i);
      if (!d) {
        const t = svgEl('text', { x: nx, y: 30, 'font-size': 13, 'text-anchor': 'middle', class: 'yerIpucu' });
        t.textContent = '?';
        svg.appendChild(t);
        return;
      }
      const n = adimdanNota(d.s, d.a);
      notaCiz(svg, n, nx, d.sabit ? null : (d.renk || 'var(--secim)'));
    });
    if (cfg.etiketler) {
      cfg.etiketler.forEach(function (et, i) {
        if (!et) return;
        const t = svgEl('text', { x: sx(i), y: 146, 'font-size': 11, 'text-anchor': 'middle', fill: 'currentColor', 'font-weight': 700 });
        t.textContent = et;
        svg.appendChild(t);
      });
    }
    bilgiYaz();
    if (cfg.degisince) cfg.degisince();
  }

  function bilgiYaz() {
    const d = durum[aktif];
    if (kilitli) { bilgi.textContent = ''; return; }
    if (!d) bilgi.textContent = (slotSay > 1 ? (aktif + 1) + '. nota: ' : '') + 'Porteye dokunarak notayı yerleştir';
    else bilgi.textContent = (slotSay > 1 ? (aktif + 1) + '. nota: ' : '') + HARF_AD[d.s % 7] + Math.floor(d.s / 7) + (d.a ? ' · ' + isaretAdi(d.a) : '') + ' (sürükleyerek düzeltebilirsin)';
    paletGuncelle();
  }

  function noktadan(e) {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const m = svg.getScreenCTM();
    if (!m) return null;
    return pt.matrixTransform(m.inverse());
  }
  let basili = false;
  function isle(e, ilk) {
    if (kilitli) return;
    const p = noktadan(e);
    if (!p) return;
    if (ilk) {
      // en yakın sabit olmayan sütunu seç
      let en = -1, ed = 1e9;
      durum.forEach(function (d, i) {
        if (d && d.sabit) return;
        const dd = Math.abs(p.x - sx(i));
        if (dd < ed) { ed = dd; en = i; }
      });
      if (en < 0) return;
      aktif = en;
    }
    let s = Math.round((ALT_CIZGI_Y - p.y) / 5) + 30;
    s = Math.max(smin, Math.min(smax, s));
    const eski = durum[aktif];
    durum[aktif] = { s: s, a: eski ? eski.a : null };
    ciz();
  }
  svg.addEventListener('pointerdown', function (e) { basili = true; try { svg.setPointerCapture(e.pointerId); } catch (x) {} isle(e, true); e.preventDefault(); });
  svg.addEventListener('pointermove', function (e) { if (basili) isle(e, false); });
  svg.addEventListener('pointerup', function () { basili = false; });
  svg.addEventListener('pointercancel', function () { basili = false; });

  // Palet
  let paletEl = null;
  const paletDugmeler = [];
  function paletDugme(kod, etiket) {
    const b = h('button', { class: 'paletDugme', type: 'button' },
      kod ? h('span', { class: 'bravura' }, glifStr(ARIZA_GLIF[kod])) : h('span', { class: 'yok' }, '∅'),
      h('small', null, etiket));
    b.onclick = function () {
      if (kilitli) return;
      const d = durum[aktif];
      if (!d) { toast('Önce notayı porteye yerleştir'); return; }
      d.a = kod;
      ciz();
    };
    paletDugmeler.push({ b: b, kod: kod });
    return b;
  }
  if (cfg.palet === 'aeu') {
    paletEl = h('div', { class: 'palet aeu' },
      h('div', { class: 'paletSatir' }, paletDugme('+k', 'koma'), paletDugme('+bk', 'bakiye'), paletDugme('+km', 'k. müc.'), paletDugme('+bm', 'b. müc.')),
      h('div', { class: 'paletSatir' }, paletDugme('-k', 'koma'), paletDugme('-bk', 'bakiye'), paletDugme('-km', 'k. müc.'), paletDugme('-bm', 'b. müc.')),
      h('div', { class: 'paletSatir tek' }, paletDugme(null, 'işaretsiz')));
  } else if (cfg.palet === 'bati') {
    paletEl = h('div', { class: 'palet bati' },
      h('div', { class: 'paletSatir' }, paletDugme('#', 'diyez'), paletDugme('b', 'bemol'), paletDugme(null, 'işaretsiz')));
  }
  if (paletEl) kap.appendChild(paletEl);
  function paletGuncelle() {
    const d = durum[aktif];
    paletDugmeler.forEach(function (x) {
      x.b.classList.toggle('secili', !!d && (d.a || null) === x.kod);
    });
  }

  ciz();

  return {
    el: kap,
    tamamMi: function () { return durum.every(function (d) { return !!d; }); },
    deger: function () { return durum.map(function (d) { return d ? adimdanNota(d.s, d.a) : null; }); },
    kilitle: function (dogrular) {
      kilitli = true;
      if (dogrular) {
        durum.forEach(function (d, i) {
          if (!d || d.sabit) return;
          d.renk = notaEsit(adimdanNota(d.s, d.a), dogrular[i]) ? 'var(--dogru)' : 'var(--yanlis)';
        });
      }
      ciz();
      if (paletEl) paletEl.classList.add('kilitli');
    }
  };
}
