// =====================================================
// BAŞLAT
// =====================================================
'use strict';

(function () {
  const durum = durumYukle();
  temaUygula();
  kaliciDepolamaIste();
  geriTusuKur();
  document.querySelector('.logoMaskot').innerHTML = bulbulSVG('normal');

  document.querySelectorAll('#altMenu button').forEach(function (b) {
    b.addEventListener('click', function () { if (b.dataset.sekme === 'yol' && SEKME === 'yol') YOL_FILTRE = null; sekmeAc(b.dataset.sekme); });
  });
  $('oyCik').addEventListener('click', function () { turdanCik(TUR && TUR.tip !== 'rehber' && TUR.tip !== 'deneme'); });
  $('dersCik').addEventListener('click', function () { DERS = null; anaEkranaDon(); });
  $('dersIleri').addEventListener('click', dersIleri);
  $('dersGeri').addEventListener('click', dersGeri);
  $('hataKapat').addEventListener('click', function () { $('hata').hidden = true; });
  $('modal').addEventListener('click', function (e) {
    if (e.target === $('modal') && $('modal').dataset.kapatilabilir) modalKapat();
  });
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (mq.addEventListener) mq.addEventListener('change', temaUygula);
  }

  // Bravura yüklenmeden porte çizilirse işaretler görünmez: önce yazı tiplerini bekle (en çok 2,5 sn)
  const fontlar = document.fonts && document.fonts.load
    ? Promise.all([document.fonts.load('40px SeyirNota'), document.fonts.load('16px Nunito'), document.fonts.load('700 16px "Baloo 2"')])
    : Promise.resolve();
  Promise.race([fontlar, new Promise(function (r) { setTimeout(r, 2500); })]).catch(function () {}).then(function () {
    document.body.classList.remove('yukleniyor');
    // Nota yazı tipi yüklenemediyse (eski önbellek vb.) kullanıcıya söyle
    try { if (document.fonts && !document.fonts.check('40px SeyirNota')) toast('Nota işaretleri yüklenemediyse sayfayı yenile', 4000); } catch (e) {}
    sekmeAc('yol');
    if (durum === 'yeni' || !DURUM.ayar.kurulum) ilkAcilis();
    else if (DURUM.tasima && !DURUM.tasima.gosterildi) tasimaBildir();
    else if (!DURUM.ayar.rehber) rehberBaslat();
  });

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }
})();
