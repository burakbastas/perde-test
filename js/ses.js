// =====================================================
// SES MOTORU (Web Audio)
// Bendir vuruşları (düm, tek, ke) ses/ klasöründen yüklenir; dosya yoksa
// kodla üretilmiş yedek sesler çalar. Vuruşlar tarayıcının ses saatine göre
// önceden planlanır: telefon yavaşlasa da tempo kaymaz.
// =====================================================
'use strict';

const SES = { ctx: null, tampon: {}, yukleniyor: null, ana: null, seviye: 0.9, kilit: null };
// Bendir kaydı: Eren Ergen, CompMusic projesi (Freesound #140548, barisbozkurt) · her vuruşun iki çeşidi
const SES_DOSYA = { D: ['ses/dum1.mp3', 'ses/dum2.mp3'], T: ['ses/tek1.mp3', 'ses/tek2.mp3'], K: ['ses/ke1.mp3', 'ses/ke2.mp3'] };

function sesBaglam() {
  if (!SES.ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    // iPhone: sessiz düğmesi açıkken de çalsın (destekleyen sürümlerde)
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    SES.ctx = new AC();
    SES.ana = SES.ctx.createGain();
    SES.ana.gain.value = SES.seviye;
    SES.ana.connect(SES.ctx.destination);
  }
  if (SES.ctx.state !== 'running') {
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    try { SES.ctx.resume(); } catch (e) {}
  }
  oynatmaBilgisi();
  sesUyku();
  return SES.ctx;
}
// ---- Ses boştayken bağlamı uyut: iPhone kilit ekranındaki "Şimdi Çalıyor" kartı kalmasın ----
// Çalan ritim ya da süren bir vurma sorusu yoksa ve son sesin üstünden 2,5 sn geçtiyse kapatılır;
// bir sonraki seste sesBaglam() yeniden açar.
function vurmaSuruyor() { return typeof TUR !== 'undefined' && TUR && TUR.q && TUR.q.vur && TUR.q.vur.aktif; }
function sesUyku(hemen) {
  clearTimeout(SES.uykuT);
  SES.uykuT = setTimeout(function () {
    const c = SES.ctx;
    if (!c || c.state !== 'running') return;
    if (!hemen && (CALAN || vurmaSuruyor() || c.currentTime < (SES.sonSes || 0) + 1.5)) { sesUyku(); return; }
    if (hemen) ritimDur();
    try { c.suspend(); } catch (e) {}
    try { if (navigator.audioSession) navigator.audioSession.type = 'auto'; } catch (e) {}
    try { if (navigator.mediaSession) navigator.mediaSession.playbackState = 'none'; } catch (e) {}
  }, hemen ? 0 : 2500);
}
function oynatmaBilgisi() {
  try {
    if (!navigator.mediaSession || SES.medyaKuruldu) return;
    SES.medyaKuruldu = true;
    if (window.MediaMetadata) navigator.mediaSession.metadata = new MediaMetadata({ title: 'Seyir', artist: 'Bendir ve ritim', artwork: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png' }] });
    ['pause', 'stop'].forEach(function (a) { try { navigator.mediaSession.setActionHandler(a, function () { sesUyku(true); }); } catch (e) {} });
  } catch (e) {}
}
document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') sesUyku(true); });
function sesSeviye(v) { SES.seviye = v; if (SES.ana) SES.ana.gain.value = v; }

// ---- Yedek (sentetik) sesler ----
function sentetik(tur) {
  const c = SES.ctx, sr = c.sampleRate;
  const sure = { D: 0.7, T: 0.35, K: 0.3, tik: 0.06, tikV: 0.08, ton: 0.4 }[tur] || 0.3;
  const b = c.createBuffer(1, Math.floor(sr * sure), sr), x = b.getChannelData(0);
  let faz = 0;
  for (let i = 0; i < x.length; i++) {
    const t = i / sr;
    let v = 0;
    if (tur === 'D') {
      const f = 70 + 90 * Math.exp(-t * 30);
      faz += 2 * Math.PI * f / sr;
      v = Math.sin(faz) * Math.exp(-t * 6) + (Math.random() * 2 - 1) * 0.25 * Math.exp(-t * 60);
    } else if (tur === 'T' || tur === 'K') {
      faz += 2 * Math.PI * 1150 / sr;
      v = (Math.sin(faz) * 0.5 + (Math.random() * 2 - 1) * 0.7) * Math.exp(-t * 28) * (tur === 'K' ? 0.5 : 1);
    } else if (tur === 'tik' || tur === 'tikV') {
      faz += 2 * Math.PI * (tur === 'tikV' ? 1800 : 1300) / sr;
      v = Math.sin(faz) * Math.exp(-t * 70) * (tur === 'tikV' ? 0.5 : 0.35);
    } else if (tur === 'ton') {
      faz += 2 * Math.PI * 440 / sr;
      v = (Math.sin(faz) + 0.3 * Math.sin(2 * faz)) * Math.min(1, t * 200) * Math.exp(-t * 7) * 0.6;
    }
    x[i] = v;
  }
  return b;
}
function sesHazirla() {
  const c = sesBaglam();
  if (!c) return Promise.resolve(false);
  if (SES.yukleniyor) return SES.yukleniyor;
  ['tik', 'tikV', 'ton'].forEach(function (k) { SES.tampon[k] = sentetik(k); });
  ['D', 'T', 'K'].forEach(function (k) { SES.tampon[k] = sentetik(k); });   // dosya gelene kadar
  SES.cesit = {};
  const isler = [];
  Object.keys(SES_DOSYA).forEach(function (k) {
    SES_DOSYA[k].forEach(function (yol) {
      isler.push(fetch(yol).then(function (r) { if (!r.ok) throw new Error('yok'); return r.arrayBuffer(); })
        .then(function (ab) { return new Promise(function (ok, red) { c.decodeAudioData(ab, ok, red); }); })
        .then(function (buf) { (SES.cesit[k] = SES.cesit[k] || []).push(buf); SES.tampon[k] = buf; return true; })
        .catch(function () { return false; }));
    });
  });
  SES.yukleniyor = Promise.all(isler).then(function () { return true; });
  return SES.yukleniyor;
}
function vurusCal(s, zaman, kazanc) {
  const c = SES.ctx, L = SES.cesit && SES.cesit[s];
  const b = L && L.length ? L[Math.floor(Math.random() * L.length)] : SES.tampon[s];   // çeşitlilik: makine gibi duyulmasın
  if (!c || !b) return;
  const src = c.createBufferSource(), g = c.createGain();
  src.buffer = b;
  g.gain.value = kazanc == null ? 1 : kazanc;
  src.connect(g); g.connect(SES.ana);
  const bas = Math.max(zaman, c.currentTime);
  try { src.start(bas); } catch (e) {}
  SES.sonSes = Math.max(SES.sonSes || 0, bas + b.duration);
  sesUyku();
}
// Şu an duyulan anın ses saatindeki karşılığı (çıkış gecikmesi düşülmüş)
function duyulanZaman() {
  const c = SES.ctx;
  if (!c) return 0;
  try {
    if (c.getOutputTimestamp) {
      const ts = c.getOutputTimestamp();
      if (ts && ts.contextTime > 0 && ts.performanceTime > 0) return ts.contextTime + (performance.now() - ts.performanceTime) / 1000;
    }
  } catch (e) {}
  return c.currentTime - (c.outputLatency || c.baseLatency || 0);
}

// ---- Çalıcı ----
// o.olaylar: [{ s: 'D'|'T'|'K'|'ton'|null, u: süre (onaltılık) }]
// o.onaltilikSn: function → bir onaltılığın saniyesi (tempo canlı değişebilir)
// o.devir: kaç devir (Infinity: durdurulana kadar)
// o.sayim: { vurus: sayım tıklarının sayısı, u: tık aralığı (onaltılık) } (isteğe bağlı)
// o.sessiz(devir) → true ise o devir çalınmaz (görsel devam eder)
// o.devirBasi(devir), o.vurusta(i, devir, zaman), o.bitince()
// o.tik: her zaman biriminde hafif tık (u: onaltılık)
let CALAN = null;
function ritimCal(o) {
  ritimDur();
  const c = sesBaglam();
  if (!c) { toast('Bu tarayıcı ses çalamıyor'); return null; }
  sesHazirla();
  const bas0 = c.currentTime + 0.12;
  const r = { o: o, i: 0, devir: 0, zaman: bas0, baslangic: bas0, bitti: false, sayimKalan: o.sayim ? o.sayim.vurus : 0, zamanlar: [] };
  r.ilkVurus = null;
  function adim() {
    if (r.bitti) return;
    const ufuk = c.currentTime + 0.15;
    while (r.zaman < ufuk && !r.bitti) {
      const sn = o.onaltilikSn();
      if (r.sayimKalan > 0) {
        vurusCal(r.sayimKalan === o.sayim.vurus ? 'tikV' : 'tik', r.zaman, 1);
        r.sayimKalan--;
        r.zaman += o.sayim.u * sn;
        continue;
      }
      if (r.i === 0) {
        if (r.devir >= (o.devir || 1)) { r.bitti = true; const z = r.zaman; setTimeout(function () { if (r.durduruldu) return; if (CALAN === r) CALAN = null; if (o.bitince) o.bitince(); }, Math.max(0, (z - c.currentTime) * 1000 + 300)); break; }
        if (o.devirBasi) o.devirBasi(r.devir);
      }
      const e = o.olaylar[r.i];
      const sessiz = o.sessiz && o.sessiz(r.devir);
      if (r.ilkVurus === null) r.ilkVurus = r.zaman;
      if (e.s && !sessiz) vurusCal(e.s, r.zaman, e.g);
      r.zamanlar.push({ z: r.zaman, s: e.s, i: r.i, devir: r.devir });
      if (o.tik) {
        // olayın içine düşen tık zamanları
        const bas = r.konum || 0;
        for (let k = Math.ceil(bas / o.tik - 1e-9) * o.tik; k < bas + e.u - 1e-9; k += o.tik) vurusCal('tik', r.zaman + (k - bas) * sn, 0.45);
      }
      if (o.vurusta) {
        const i = r.i, d = r.devir, z = r.zaman;
        setTimeout(function () { if (!r.durduruldu) o.vurusta(i, d, z); }, Math.max(0, (z - c.currentTime) * 1000));
      }
      r.konum = (r.konum || 0) + e.u;
      r.zaman += e.u * sn;
      r.i++;
      if (r.i >= o.olaylar.length) { r.i = 0; r.devir++; r.konum = 0; }
    }
  }
  r.dur = function () { r.bitti = true; r.durduruldu = true; clearInterval(r.t); if (CALAN === r) CALAN = null; ekranUyanikBirak(); };
  r.t = setInterval(adim, 25);
  adim();
  CALAN = r;
  return r;
}
function ritimDur() { if (CALAN) { const r = CALAN; CALAN = null; r.dur(); } sesUyku(); }

// ---- Ekran kararmasın (bendir çalarken) ----
function ekranUyanik() {
  try { if (navigator.wakeLock && !SES.kilit) navigator.wakeLock.request('screen').then(function (k) { SES.kilit = k; k.addEventListener('release', function () { SES.kilit = null; }); }).catch(function () {}); } catch (e) {}
}
function ekranUyanikBirak() { try { if (SES.kilit) { SES.kilit.release(); SES.kilit = null; } } catch (e) {} }
document.addEventListener('visibilitychange', function () {
  if (document.visibilityState === 'visible' && CALAN && CALAN.o.uyanik) ekranUyanik();
});
