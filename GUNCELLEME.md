# Seyir 3.0 – yükleme notu

Yeni dosyalar: `js/yeni.js` (yeni soru tipleri ve seviyeler), `js/ogren2.js` (Öğren ekleri), `js/hatakart.js` (2.9). Paketi açıp **bütün dosya ve klasörleri** GitHub'a yükle.

Kayıt taşımaları (her biri bir kez çalışır, öncesinde kayıt `perdeMacerasiV2_yedek` anahtarına kopyalanır):
1. Ünvan kalıcı olarak kayda yazılır (eski 35 ünitelik eşiklerle).
2. Sonsuz Meşk rekorları puan sistemine geçer; eski rekorlar `rekorEski` alanında saklanır.
3. Koma km2 → km1, km4 → km3 birleşir; yüksek yıldız kalır, fark cüzdana bonus.

# Seyir 2.9 – yükleme notu

Yeni dosya: `js/hatakart.js` (yanlışta öğretici kart). Paketi açıp **bütün dosya ve klasörleri** GitHub'a yükle; `js/hatakart.js` dosyasının da yüklendiğinden emin ol.

Değişenler: kısmi puan (düzeltme hakkı, yarım kalp), seviye uzunluğuna göre 3–5 kalp, yanlışta perde merdiveni / aralık kartı, yanlış öğenin seviyede bir kez daha sorulması, başarısızlıkta yönlendirme ve ücretsiz ipuçlu deneme, oransal ve kalıcı ünvanlar, kayıt taşıma çerçevesi (taşımadan önce kayıt `perdeMacerasiV2_yedek` anahtarına kopyalanır), Sengin Semai 6/8.

**Önce test:** `seyir-2.9.0-test.zip` paketini perde-test deposuna yükle. Test sürümü kendi kayıt anahtarını (`perdeTestV2`) ve önbellek önekini (`perdetest-`) kullanır; ilk açılışta asıl kaydının bir kopyasını alır, asıl kayda hiç yazmaz.

# Seyir 2.8.1 – yükleme notu

Yeni dosya: `js/merdiven.js` (Öğren → Perde merdivenleri). Paketi açıp **bütün dosya ve klasörleri** GitHub'a yükle; `js/merdiven.js` dosyasının da yüklendiğinden emin ol.

Değişenler: Sofyan varsayılan mertebesi 4/4, Yürük Semai 6/8 oldu.

# Seyir 2.8 – yükleme notu

Yeni dosyalar: `js/ortak.js` ve **`js/ortak/` klasörü** (`ati.js`, `td.js`, `ing.js`). Paketi açıp **bütün dosya ve klasörleri** GitHub'a yükle; `js/ortak` klasörünün de yüklendiğinden emin ol.

Ortak dersler bölümü herkeste Öğren sekmesinin altında görünür. Gizlemek için: Profil → Ayarlar → Ortak dersler. `?ortak` bağlantısı gizlenmiş bölümü yeniden açar ve doğrudan Öğren’e götürür.

# Seyir 2.7 – yükleme notu

Yeni dosya: `js/tartim.js` (yeni tartım üniteleri). Paketi açıp **bütün dosya ve klasörleri** GitHub'a yükle.

# Seyir 2.6 – yükleme notu

Yeni dosya yok. Paketi açıp **bütün dosya ve klasörleri** GitHub'a yükle ("Add file → Upload files"); eskilerinin üzerine yazılır.

# Seyir 2.5 – yükleme notu

## Bu sürümde yeni dosyalar
- `js/ses.js` (ses motoru), `js/usul.js` (Usul dalı, tartım üniteleri, Bendir), `js/ahenk.js` (Ahenk dalı)
- `ses/` klasörü: dum1-2, tek1-2, ke1-2 (bendir vuruşları, toplam ~33 KB; kaynak README’de)

Paketi açıp **bütün dosya ve klasörleri** GitHub'a yükle ("Add file → Upload files"). `arkaplan/` klasörü değişmedi; istersen yeniden yüklemeyebilirsin.

# Seyir 2.1 (eski adıyla Perde Macerası) – yükleme notu

## GitHub Pages'e yükleme
1. Depodaki eski dosyalardan **index.html, sw.js, manifest.webmanifest** dosyalarının yerine bu paketteki sürümleri koy.
2. **css/**, **js/** ve **fonts/** klasörlerini ve **README.md** dosyasını yükle.
3. Artık gerekmeyen dosyaları silebilirsin:
   - `fonts/Bravura.woff` (424 KB; yerine 8 KB'lık `fonts/seyir-nota.woff` geldi)
   - `fonts/glyphnames.json`
   - `glif.html`, `ikon-yap.html` (geliştirme araçları; yayında olmalarına gerek yok)
4. `icon-192.png` ve `icon-512.png` yeni bülbüllü ikonlarla değişti; `qr.png` (paylaşım ekranı) ve `og-kapak.png` (WhatsApp/Instagram bağlantı önizlemesi) yeni dosyalar.

Öğrencilerin eski ilerlemesi ilk açılışta otomatik taşınır; eski kayıt silinmez.

## Dosya yapısı
- `js/cekirdek.js`: kayıt, yedekleme, modal, geri tuşu
- `js/nota.js`: porte çizimi ve porteye yerleştirme bileşeni
- `js/perde.js`, `koma.js`, `cesni.js`, `makam.js`, `bati.js`: her dalın verisi, soruları ve dersleri
- `js/ogren.js`: Öğren modülleri ve sözlük
- `js/motor.js`: soru motoru, Leitner tekrar, dersler, eski kayıt taşıma
- `js/arayuz.js`: sekmeler, Meşk Yolu, ünvanlar, profil, ayarlar
- `js/rehber.js`: bülbülün ilk giriş rehberi
- `css/stil.css`: tema (açık/koyu)

## Yeni sürüm çıkarırken
Bütün dosya adreslerinde bir sürüm etiketi var (`?v=2.6.0`). Böylece tarayıcı güncellemede eski ve yeni dosyaları karıştırmaz. Yeni sürümde şu dosyalarda **2.6.0** yazan her yeri yeni numarayla değiştir (Bul ve Değiştir ile):
`index.html`, `sw.js`, `css/stil.css`, `manifest.webmanifest`, `js/cekirdek.js`.

## Ad değişikliği hakkında
Kayıt anahtarı (`perdeMacerasiV2`) ve adres değişmediği için öğrencilerin ilerlemesi korunur. Ana ekrana eklenmiş uygulamada ad ve ikon Android’de birkaç gün içinde kendiliğinden güncellenir; iPhone’da eski ad ve ikon kalır ama oyun çalışır. iPhone kullanıcıları uygulamayı silip yeniden eklemesin; eklemek isteyen önce Profil → Yedekle’den kodunu almalı.
