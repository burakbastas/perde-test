// =====================================================
// 3.5: GÖRSEL SORU BİLEŞENLERİ (motorun 'ozel' soru tipiyle çalışır)
// porteDokun: portedeki notalardan birine (ya da birkaçına) dokunma
// Koma cetveli ve ney boyları çizimleri kendi dallarının dosyalarında, buradaki yardımcılarla kurulur.
// nota.js'ten sonra yüklenir; cevapla, kismiAcik gibi motor işlevleri çalışma anında bulunur.
// =====================================================
'use strict';

// veri.dokun: { notalar:[nota|{...nota, renk}], donanim:[nota], aralik, etiketler:[], hedef:[i…], coklu: true|false, ayrac:[i…] }
function porteDokunCiz(alan, veri, q, kontrol) {
  const D = veri.dokun, N = D.notalar, aralik = D.aralik || 36;
  const x0 = Math.max(74, 46 + (D.donanim ? D.donanim.length * 12 + 26 : 0));
  const W = Math.max(D.enAz || 220, x0 + (N.length - 1) * aralik + 28);
  const kay = D.donanim && D.donanim.length ? 0 : Math.max(0, (W - (x0 + (N.length - 1) * aralik + 28)) / 2);
  const sx = function (i) { return x0 + kay + i * aralik; };
  const secili = {};
  let kilitli = false, sonuc = null;
  const kap = h('div', { class: 'yerlestir porteDokun' });
  const svg = svgEl('svg', { class: 'porte etkilesim', viewBox: '0 0 ' + W + ' 150', preserveAspectRatio: 'xMidYMid meet' });
  const bilgi = h('div', { class: 'yerBilgi' });
  kap.appendChild(svg); kap.appendChild(bilgi);
  const secimSay = function () { return Object.keys(secili).length; };
  function ciz() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    N.forEach(function (n, i) {
      if (secili[i] && !kilitli) svg.appendChild(svgEl('rect', { x: sx(i) - aralik / 2 + 2, y: 6, width: aralik - 4, height: 138, rx: 9, class: 'yerAktif' }));
    });
    for (let i = 0; i < 5; i++) svgCizgi(svg, 0, W, 50 + i * 10);
    svgGlif(svg, GLIF_SOL, 22, 80);
    if (D.donanim) donanimCiz(svg, D.donanim, 46);
    N.forEach(function (n, i) {
      const renk = sonuc ? sonuc[i] : secili[i] ? 'var(--secim)' : n.renk || null;
      notaCiz(svg, n, sx(i), renk);
      if (D.ayrac && D.ayrac.indexOf(i) >= 0) svg.appendChild(svgEl('line', { x1: sx(i) + aralik / 2, x2: sx(i) + aralik / 2, y1: 50, y2: 90, stroke: 'currentColor', 'stroke-width': 1, 'stroke-dasharray': '3 3', opacity: .6 }));
      if (D.etiketler && D.etiketler[i]) {
        const t = svgEl('text', { x: sx(i), y: 146, 'font-size': 11, 'text-anchor': 'middle', fill: 'currentColor', 'font-weight': 700 });
        t.textContent = D.etiketler[i];
        svg.appendChild(t);
      }
    });
    bilgi.textContent = kilitli ? '' : D.coklu ? (secimSay() ? secimSay() + ' nota seçili · seçimi kaldırmak için yeniden dokun' : 'Notalara dokunarak seç') : (secimSay() ? 'Nota seçildi · başkasına dokunarak değiştirebilirsin' : 'Bir notaya dokun');
    kontrol.disabled = kilitli || !secimSay();
  }
  function sec(i) {
    if (kilitli || i < 0 || i >= N.length || (D.sabit && D.sabit.indexOf(i) >= 0)) return;
    if (D.coklu) { if (secili[i]) delete secili[i]; else secili[i] = true; }
    else { for (const k in secili) delete secili[k]; secili[i] = true; }
    ciz();
  }
  svg.addEventListener('pointerdown', function (e) {
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const m = svg.getScreenCTM(); if (!m) return;
    const p = pt.matrixTransform(m.inverse());
    sec(Math.round((p.x - x0 - kay) / aralik));
    e.preventDefault();
  });
  q.dokun = { sec: sec, secili: function () { return Object.keys(secili).map(Number); }, x: sx };
  alan.appendChild(kap);
  kontrol.hidden = false; kontrol.textContent = 'Kontrol et';
  ciz();
  kontrol.onclick = function () {
    if (q.cevaplandi || !secimSay()) return;
    const S = Object.keys(secili).map(Number).sort(function (a, b) { return a - b; }), H = D.hedef.slice().sort(function (a, b) { return a - b; });
    const dogru = S.join() === H.join();
    sonuc = N.map(function (n, i) { return H.indexOf(i) >= 0 ? 'var(--dogru)' : secili[i] ? 'var(--yanlis)' : (n.renk || null); });
    kilitli = true;
    ciz();
    kontrol.hidden = true;
    cevapla(dogru);
  };
}
function porteDokunSoru(q, dokun) { q.tip = 'ozel'; q.dokun = dokun; q.ozel = { karar: dokun.coklu ? dokun.hedef.length : 1, ciz: porteDokunCiz }; return q; }

// Basit SVG yardımcıları (cetvel, çubuk çizimleri için)
function gYazi(svg, x, y, metin, oz) {
  const t = svgEl('text', Object.assign({ x: x, y: y, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: 'currentColor', 'font-family': 'Nunito, sans-serif' }, oz || {}));
  t.textContent = metin;
  svg.appendChild(t);
  return t;
}
