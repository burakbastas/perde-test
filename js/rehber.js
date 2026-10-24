// =====================================================
// BÜLBÜLÜN REHBERİ: ilk girenlere ekranı tanıtan kısa tur
// =====================================================
'use strict';

const REHBER_ADIMLAR = [
  { hedef: null, baslik: 'Merhaba, ben Bülbül!', metin: 'Sana Seyir’i 30 saniyede gezdireyim. İstediğin an “Geç” diyebilirsin.' },
  { hedef: '.dugum.simdi', baslik: 'Buradan başla', metin: 'Zıplayan karo sıradaki seviyen. Her ünite 📖 dersle başlar, sonra seviyeler, ✍️ porteye yazma ve 👑 final gelir.' },
  { hedef: '.uniteEylem', baslik: 'Ders ve Biliyorum', metin: '📖 Ders: kısa anlatım ve ısınma turu. ⏩ Biliyorum: konuyu zaten biliyorsan kısa bir sınavla üniteyi geç.' },
  { hedef: '.segment', baslik: 'Meşk Yolu ve Dallar', metin: 'Meşk Yolu üniteleri önerilen sırayla gösterir. Dallar’dan Koma, Perde, Göçürme, Dörtlü-Beşli, Makam ya da Batı Teorisi’ne doğrudan geçebilirsin.' },
  { hedef: '.unvanSerit', baslik: 'Ünvanın', metin: 'Ünite bitirdikçe Mübtedî’den Üstad-ı Kâmil’e yükselirsin. Dokunursan bütün basamakları görürsün.' },
  { hedef: '#ustYildiz', baslik: 'Yıldızların', metin: 'Seviyelerden yıldız kazanırsın. Zorlandığında %50, ipucu, atla ve +kalp jokerlerine harcayabilirsin.' },
  { hedef: '[data-sekme="ogren"]', baslik: 'Öğren', metin: 'Hiç nota bilmiyorsan buradan başla: porte, koma, perde, makam… Bir de sözlük var.' },
  { hedef: '[data-sekme="tekrar"]', baslik: 'Tekrar', metin: 'Yanlış yaptıkların ve unutmaya başladıkların burada toplanır. Göçürme antrenmanı da burada.' },
  { hedef: '[data-sekme="profil"]', baslik: 'Profil', metin: 'Ünvanın, yedeklemen ve ayarların burada. Bu rehberi de oradan yeniden açabilirsin. Haydi, seyre başlayalım!' }
];

let REHBER = null;
function rehberAcikMi() { return !!REHBER; }

function rehberBaslat(bitince) {
  if (REHBER) rehberKapat(true);
  const kat = h('div', { id: 'rehber', role: 'dialog', 'aria-label': 'Rehber' });
  const isik = h('div', { class: 'rehberIsik' });
  const balon = h('div', { class: 'rehberBalon' });
  kat.appendChild(isik); kat.appendChild(balon);
  kat.addEventListener('click', function (e) { if (e.target === kat || e.target === isik) rehberIleri(); });
  document.body.appendChild(kat);
  REHBER = { i: 0, kat: kat, isik: isik, balon: balon, bitince: bitince };
  window.addEventListener('resize', rehberKonumla);
  rehberCiz();
}

function rehberHedef(adim) {
  if (!adim.hedef) return null;
  const L = Array.prototype.filter.call(document.querySelectorAll(adim.hedef), function (e) { return e.offsetParent !== null || e.id === 'ustYildiz'; });
  return L[0] || null;
}

function rehberCiz() {
  const R = REHBER, adim = REHBER_ADIMLAR[R.i];
  const el = rehberHedef(adim);
  if (adim.hedef && !el) { rehberIleri(); return; }   // hedef ekranda yoksa atla
  if (el && el.closest('#sekme')) {
    // hedefi görünür yap (yapışkan seçici için en üste kaydır)
    const sekme = $('sekme');
    if (adim.hedef === '.segment' || adim.hedef === '.unvanSerit') sekme.scrollTop = 0;
    else el.scrollIntoView({ block: 'center' });
  }
  bosalt(R.balon);
  const son = R.i === REHBER_ADIMLAR.length - 1;
  R.balon.appendChild(h('div', { class: 'rehberUst' },
    h('span', { class: 'rehberMaskot', html: bulbulSVG(R.i === 0 || son ? 'mutlu' : 'anlat') }),
    h('div', null, h('b', null, adim.baslik), h('small', null, (R.i + 1) + ' / ' + REHBER_ADIMLAR.length))));
  R.balon.appendChild(h('p', null, adim.metin));
  R.balon.appendChild(h('div', { class: 'rehberDugmeler' },
    son ? null : h('button', { class: 'dugme gri', type: 'button', onclick: function () { rehberKapat(); } }, 'Geç'),
    h('button', { class: 'dugme', type: 'button', onclick: rehberIleri }, son ? 'Başlayalım!' : 'İleri →')));
  requestAnimationFrame(rehberKonumla);
}

function rehberKonumla() {
  const R = REHBER;
  if (!R) return;
  const el = rehberHedef(REHBER_ADIMLAR[R.i]);
  const b = R.balon, W = window.innerWidth, H = window.innerHeight;
  const bw = Math.min(340, W - 24);
  b.style.width = bw + 'px';
  if (!el) {
    R.isik.style.cssText = 'left:50%;top:50%;width:0;height:0';
    b.style.left = (W - bw) / 2 + 'px';
    b.style.top = Math.max(16, (H - b.offsetHeight) / 2) + 'px';
    return;
  }
  const r = el.getBoundingClientRect(), pay = 6;
  R.isik.style.cssText = 'left:' + (r.left - pay) + 'px;top:' + (r.top - pay) + 'px;width:' + (r.width + 2 * pay) + 'px;height:' + (r.height + 2 * pay) + 'px';
  b.style.left = Math.max(12, Math.min(W - bw - 12, r.left + r.width / 2 - bw / 2)) + 'px';
  const alta = r.bottom + 14 + b.offsetHeight < H - 8;
  b.style.top = (alta ? r.bottom + 14 : Math.max(8, r.top - 14 - b.offsetHeight)) + 'px';
}

function rehberIleri() {
  if (!REHBER) return;
  if (REHBER.i >= REHBER_ADIMLAR.length - 1) { rehberKapat(); return; }
  REHBER.i++;
  rehberCiz();
}

function rehberKapat(sessiz) {
  const R = REHBER;
  if (!R) return;
  REHBER = null;
  window.removeEventListener('resize', rehberKonumla);
  R.kat.remove();
  DURUM.ayar.rehber = true;
  kaydet();
  $('sekme').scrollTop = 0;
  if (!sessiz && R.bitince) R.bitince();
}
