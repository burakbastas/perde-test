// =====================================================
// YANLIŞTA ÖĞRETİCİ KART
// Perde sorusunda yanlış cevaptan sonra ilgili perde merdiveni (doğru yeşil, seçilen kırmızı);
// Koma sorusunda aralık kartı (ad · koma · harf · diyez · bemol, sorulan yüz vurgulu).
// Aynı öğede ikinci hatada tek satır; finallerde kartlar seviye sonunda toplu gösterilir.
// =====================================================
'use strict';

// Perdenin içinde durduğu iki tam perde
function hkAralik(p) {
  let alt = null, ust = null;
  PERDELER.forEach(function (x) {
    if (!x.tam) return;
    if (x.koma <= p.koma && (!alt || x.koma > alt.koma)) alt = x;
  });
  if (!alt) return null;
  PERDELER.forEach(function (x) {
    if (x.tam && x.koma > alt.koma && (!ust || x.koma < ust.koma)) ust = x;
  });
  return ust ? { alt: alt, ust: ust } : null;
}

function hkPerdeSatir(sinif, p, alt, etiket) {
  const k = p.koma - alt.koma;
  return h('div', { class: 'hkSatir ' + sinif },
    h('span', { class: 'hkK' }, k ? '+' + k : '0'),
    h('span', { class: 'mdAd' }, h('b', null, p.ad), merdivenYazim(p)),
    h('span', { class: 'hkR' }, etiket));
}

function hkPerdeKarti(P, S) {
  const r = hkAralik(P);
  if (!r) return null;
  if (S === P) S = null;
  const icerde = function (x) { return x && x.koma > r.alt.koma && x.koma < r.ust.koma; };
  const svg = merdivenSVG(r.alt, r.ust, null, true);
  // adı olan ara perdelerin noktaları sırayla çizildi: doğruyu ve seçileni boya
  const adli = [];
  for (let k = 1; k < r.ust.koma - r.alt.koma; k++) if (KOMADAN_PERDE[r.alt.koma + k]) adli.push(r.alt.koma + k);
  svg.querySelectorAll('circle.mdNokta').forEach(function (c, i) {
    const koma = adli[i];
    if (icerde(P) && koma === P.koma) { c.setAttribute('class', 'hkDogru'); c.setAttribute('r', 6.5); }
    else if (icerde(S) && koma === S.koma) { c.setAttribute('class', 'hkYanlis'); c.setAttribute('r', 6.5); }
  });
  const S_ayni = S && hkAralik(S) && hkAralik(S).alt === r.alt;
  return h('div', { class: 'hkKart' },
    h('div', { class: 'hkBas' }, h('span', null, r.alt.ad + ' → ' + r.ust.ad + ' merdiveni')),
    h('div', { class: 'mdKutu' }, svg),
    hkPerdeSatir('d', P, r.alt, 'doğru'),
    S ? (S_ayni ? hkPerdeSatir('y', S, r.alt, 'senin seçimin')
      : h('div', { class: 'hkSatir y' }, h('span', { class: 'hkK' }, '✕'), h('span', { class: 'mdAd' }, h('b', null, S.ad), merdivenYazim(S)), h('span', { class: 'hkR' }, 'senin seçimin'))) : null);
}

function hkAralikIzgara(v, vurgu, yanlis) {
  const d = kmIsaretKod(v, '+'), b = kmIsaretKod(v, '-');
  const L = [['ad', 'Ad', h('b', null, v.ad)], ['koma', 'Koma', h('b', null, kmKoma(v))], ['harf', 'Harf', h('b', null, v.kod)],
    ['diyez', 'Diyez', d ? h('span', { class: 'hkGlif bravura' }, glifStr(d)) : h('b', null, '–')],
    ['bemol', 'Bemol', b ? h('span', { class: 'hkGlif bravura' }, glifStr(b)) : h('b', null, '–')]];
  return h('div', { class: 'hkIzgara' + (yanlis ? ' yan' : '') },
    L.map(function (x) { return h('div', { class: x[0] === vurgu ? 'vur' : '' }, h('small', null, x[1]), x[2]); }));
}

function hkKomaKarti(v, yuz, S) {
  if (S && S.v === v && !S.yon) S = null;
  const sv = S ? S.v : null;
  // seçilen sembolse onun yönü vurgulanır; değilse sorulan yüz
  const yYuz = S && S.yon ? (S.yon === '+' ? 'diyez' : 'bemol') : yuz;
  return h('div', { class: 'hkKart' },
    h('div', { class: 'hkBas' }, h('span', null, 'Aralık kartı')),
    h('div', { class: 'hkEtiket d' }, v.ad),
    hkAralikIzgara(v, yuz),
    sv ? h('div', { class: 'hkEtiket y' }, 'Senin seçimin: ' + sv.ad) : null,
    sv ? hkAralikIzgara(sv, yYuz, true) : null);
}

// Soru ve seçilen şıktan kartı üret (yoksa null)
function hataKartiUret(veri, secilen) {
  try {
    const oge = veri.oge || '';
    if (veri.kartPerde || oge.indexOf('p:') === 0) {
      const P = veri.kartPerde ? PERDE[veri.kartPerde] : perdeOge(oge);
      if (!P) return null;
      const S = secilen ? perdeOge(secilen) : null;
      return { anahtar: 'p:' + P.ad, kart: function () { return hkPerdeKarti(P, S); },
        satir: function () { const r = hkAralik(P); return '🪜 <b>' + P.ad + '</b>' + (r && !P.tam ? ' = ' + r.alt.ad + ' +' + (P.koma - r.alt.koma) : '') + (S && S !== P ? ' · sen <b class="hkK y">' + S.ad + '</b> dedin' : ''); } };
    }
    if (oge.indexOf('k:') === 0) {
      const v = KM_VERI.find(function (x) { return x.oge === oge; });
      if (!v) return null;
      const yuz = veri.kmKart ? veri.kmKart.yuz : 'ad';
      let S = null;
      if (veri.kmKart && secilen !== undefined) {
        const b = kmSecilenBul(secilen, veri.kmKart.tur);
        S = b ? (b.v ? b : { v: b }) : null;
      }
      return { anahtar: oge, kart: function () { return hkKomaKarti(v, yuz, S); },
        satir: function () { return '📏 <b>' + v.ad + '</b> = ' + kmKoma(v) + ' koma · harf ' + v.kod + (S && (S.v !== v || S.yon) ? ' · sen <b class="hkK y">' + S.v.ad + '</b> dedin' : ''); } };
    }
  } catch (e) { console.warn(e); }
  return null;
}

// Geri bildirim paneline kartı ekler; finallerde sona saklar
function yanlisKarti(ic, veri, q) {
  if (!TUR || TUR.tip === 'deneme' || TUR.tip === 'ortak') return;
  const k = hataKartiUret(veri, q.secilen);
  if (!k) return;
  if (TUR.tip === 'boss') { (TUR.hataKartlari = TUR.hataKartlari || []).push(k); return; }
  TUR.kartSay = TUR.kartSay || {};
  const n = TUR.kartSay[k.anahtar] = (TUR.kartSay[k.anahtar] || 0) + 1;
  if (n === 1) {
    const kart = k.kart();
    if (!kart) return false;
    ic.appendChild(kart);
    if (q.tekrarEklendi) ic.appendChild(h('div', { class: 'hkNot' }, 'Bu soru birazdan bir kez daha gelecek.'));
    return true;
  } else {
    const kap = h('div', { class: 'hkKucuk' });
    kap.appendChild(h('span', { html: k.satir() }));
    kap.appendChild(h('button', { class: 'hkAc', type: 'button', onclick: function () { const el = k.kart(); if (el) kap.replaceWith(el); otoIptal(); } }, 'Kart'));
    ic.appendChild(kap);
  }
}

// Final sonunda: hataların kartları açılır bir bölümde
function hataKartlariBolumu(t) {
  const L = t && t.hataKartlari;
  if (!L || !L.length) return null;
  const tek = benzersiz(L, function (k) { return k.anahtar; });
  const d = h('details', { class: 'hkToplu' }, h('summary', null, '🔍 Hatalarını gözden geçir (' + tek.length + ')'));
  let n = 0;
  tek.forEach(function (k) { const el = k.kart(); if (el) { d.appendChild(el); n++; } });
  if (!n) return null;
  return d;
}
