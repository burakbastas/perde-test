# Seyir 3.3.1 – yükleme notu

Kapsamlı test sonrası düzeltmeler. Yeni dosya yok. Değişenler: `index.html`, `sw.js`, `manifest.webmanifest`, `css/stil.css`, `js/cekirdek.js`, `js/motor.js`, `js/nota.js`, `js/dikte.js`, `js/arayuz.js`, `js/ortak/ati.js`, `js/ortak/td.js`, `js/ortak/anlama.js`, `GUNCELLEME.md`. Kayıt taşıması yok.

- Koyu tema: altın zeminli kutularda (ipucu, uyarı, kurulum bandı, unvan merdiveni, altın kart, harf-aralık tablosu) yazı rengi sabit koyu kahverengiydi, okunmuyordu (kontrast ~1,9). Yeni değişkenler: `--altinYazi`, `--altinYazi2`, `--altinAcik2`. Koyu temada seçili çip ve iletişim düğmesi de koyulaştırıldı.
- Geri bildirim paneli: 360×640 telefonda Perde ünitelerindeki hata kartlı panel 18–57 px taşıyor, Devam ekran dışında kalıyordu. `panelSigdir` artık sığmazsa sıkışık düzene geçiyor, gerekirse merdiveni katlıyor; Devam panelin altına yapışık.
- Porte şıkları: üstteki/alttaki boş pay kırpılıyor (`porteKirp`, nota.js). Tablet/PC’de kısa porteler iki sütun, uzun diziler tek sütun ve ekran yüksekliğine göre. Masaüstünde göçürme/dizi sorularında 260–560 px kaydırma gidiyor.
- Yatay tablet ve 768 px yüksek dizüstü (1024×768, 1366×768): porteye yazma sorularında işaret paletinin ikinci sırası Kontrol düğmesinin altında kalıyordu; kısa geniş ekranlarda porte 170 px, palet düğmeleri küçültüldü.
- Ortak dersler: doğru şıkkı çeldiricilerden 2–3 kat uzun olan 18 soru (ATİ 7, TDİ 4, TMK 4, THM 3) yeniden yazıldı.
- Performans: porteye yazma ve dikte sürüklemesinde satır değişmedikçe yeniden çizim yok. CSS yazı tipi adresleri `?v=3.0.5` kalmıştı; ön yükleme ve service worker `?v=` sürümüyle uyuşmadığı için yazı tipleri iki kez iniyordu.

**Önce test:** `seyir-3.3.1-test.zip` paketini perde-test deposuna yükle.

# Seyir 3.3.0 – yükleme notu

Yeni dosyalar: `js/kulak-aralik.js` (Kulak eğitimi → Aralık sekmesi), `js/dikte.js` (Batı Teorisi → Ezgi diktesi). Değişenler: `index.html`, `sw.js`, `manifest.webmanifest`, `css/stil.css`, `js/cekirdek.js`, `js/kulak.js` (Hz ile çalma, sayım tıkı, iki kez otomatik çalma), `js/motor.js` (yeni soru tipi `melodi`, Batı ve Meşk Yolu sırasına `b21`), `js/arayuz.js`, `GUNCELLEME.md`. Paketi açıp bütün dosyaları yükle.

- Aralık sekmesi: 9 kademe, her biri 10 soru; 8/10 sonraki kademeyi açar. İlk 7 kademede aynı soruda 1 koma farklı iki aralık (bakiye–küçük mücenneb, büyük mücenneb–tanini) yok. Otomatik antrenman: 9/10 üst, ≤6/10 alt kademe. Kayıt: `DURUM.kulak.aralik`.
- Ezgi diktesi (`b21`): Batı dalında “Uzun değerler ve suslar”dan sonra; 7 seviye + final. Tam diktede nota başına kısmi puan (hepsi doğru: tam; %60 ve üstü: yarım kalp).

**Önce test:** `seyir-3.3.0-test.zip` paketini perde-test deposuna yükle.

# Seyir 3.2.2 – yükleme notu

Yeni dosya: `js/ortak/anlama.js` (ünite “Anladım mı?” testleri). 3.2.1’i yüklediysen değişenler: `js/ortak/anlama.js` (yeni), `js/yazili.js`, `js/ortak.js`, `js/arayuz.js`, `index.html`, `sw.js`, `manifest.webmanifest`, `js/cekirdek.js`, `GUNCELLEME.md`.

TMK ve THM ders sayfasından Yazılı provası, Hocanın vurguladıkları, Sırala ve sınıflandır, Yazılıda iyi cevap kutuları kaldırıldı. Her üniteye 5–7 soruluk “Anladım mı?” testi eklendi; ünitenin tamam sayılması bu testte %70.

## 3.2.1

3.2.0’ı yüklediysen yalnız `js/motor.js`, `index.html`, `sw.js`, `manifest.webmanifest`, `js/cekirdek.js` ve `GUNCELLEME.md` değişti. Düzeltme: sırala-sınıflandır ya da dizme sorusundan sonra kavram kartında/açık soruda “Tanımı göster” düğmesi kilitli kalıyordu.

## 3.2.0

Yeni dosyalar: `js/yazili.js` (yazılı sınava hazırlık: açık uçlu soru, kavram kartı, soru bankası), `js/ortak/tmk.js` (Türk Müziği Kültürü), `js/ortak/thm.js` (Türk Halk Müziği Bilgisi). Değişenler: `index.html`, `sw.js`, `manifest.webmanifest`, `css/stil.css`, `js/cekirdek.js`, `js/motor.js`, `js/ortak.js`, `js/arayuz.js`, `GUNCELLEME.md`. Paketi açıp **bütün dosyaları** yükle; `js/yazili.js` ve `js/ortak/` içindeki iki yeni dosyanın da yüklendiğinden emin ol.

Kayıt taşıması yok. Yazılı provası öz değerlendirme sonuçları `DURUM.ortak.tmk.s` / `DURUM.ortak.thm.s` altında tutulur.

**Önce test:** `seyir-3.2.0-test.zip` paketini perde-test deposuna yükle.

# Seyir 3.1.1 – yükleme notu

3.1.0’ı henüz yüklemediysen yalnız bu paketi yükle. 3.1.0’ı yüklediysen yeni dosya yok; bütün dosyaları yeniden yükle (değişenler: kulak.js, cesni.js, yeni.js, motor.js, arayuz.js, ogren2.js, stil.css ve sürüm dosyaları).

3.1.1 ekleri: Dörtlü-Beşli’nin 1–5. ünitelerindeki porte, formül, yer, kurma ve farkı bul sorularına isteğe bağlı 🔊 Dinle düğmesi (Sonsuz Meşk’te yok); her üniteye “Porte ve ad”dan sonra basit “👂 Dinleyerek tanış” seviyesi (db1–db5-dinle). Kaynaklar’da gitar örneklerinin kaynağı: Iowa Üniversitesi MIS, tonejs-instruments düzenlemesi (CC BY 3.0).

## 3.1 (kulak eğitimi)

Yeni dosyalar: `js/kulak.js` (kulak eğitimi), `js/kulak-seyir.js` (SymbTr seyir parçaları) ve **`ses/gitar/` klasörü** (27 gitar örneği, `g48.mp3` … `g74.mp3`, toplam ~300 KB). Paketi açıp **bütün dosya ve klasörleri** GitHub'a yükle; `ses/gitar` klasörünün de yüklendiğinden emin ol.

Değişenler: Dörtlü-Beşli, Göçürme ve Makam ünitelerine 18 adet 👂 seviyesi (3.1.1 ile 23) (finalden önce; bitmiş ünitelerde isteğe bağlı), Öğren → Araçlar → Kulak eğitimi (Dinle, Karşılaştır, Göçür, Antrenman), Sonsuz Meşk'te sesli sorular (Usta katında 3, Pîr katında 2 dinleme hakkı), Ayarlar'da "Sesli sorular" anahtarı, Kaynaklar'da SymbTr. Kayıt taşıması yok.

Sesler Kız ahenginde (Rast = La, 220 Hz); en pest ezgiler Sipürde ya da Bolâhenk'te çalar.

**Önce test:** `seyir-3.1.1-test.zip` paketini perde-test deposuna yükle. Test sürümü kendi kayıt anahtarını (`perdeTestV2`) ve önbellek önekini (`perdetest-`) kullanır.

**Lisans notu:** `js/kulak-seyir.js` SymbTr'den türetildiği için CC BY-NC-SA 4.0 ile paylaşılır (dosyanın başında yazıyor). Depodaki LICENSE dosyasına bu dosya için bir istisna satırı eklemek iyi olur.

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
