# CV ve Portfolyo Web Sitesi - Kullanım Kılavuzu

Bu proje, kişisel CV ve portfolyonuzu sergilemeniz için hazırlanmış, kurulum gerektirmeyen modern bir web sitesidir.

## 📂 Proje Yapısı

```
portfolio-site/
├── index.html      # Ana sayfa ve tüm içerik
├── style.css       # Tasarım ve renk kodları
├── script.js       # Etkileşimler (Menü, Animasyonlar)
└── assets/
    └── images/     # Görseller (Profil fotosu vb.)
```

## ✏️ Siteyi Nasıl Güncellersiniz?

Site içeriğini güncellemek için herhangi bir kod editörü (VS Code, Notepad++, TextEdit vb.) kullanabilirsiniz.

### 1. Metinleri Değiştirme
`index.html` dosyasını açın ve değiştirmek istediğiniz metni bulun.
Örneğin, "Hakkımda" yazısını değiştirmek için:
```html
<!-- Mevcut -->
<p>Visionary technology executive...</p>

<!-- Yeni -->
<p>Yeni hakkımda yazısı buraya gelecek...</p>
```

### 2. Yeni Proje Ekleme
`index.html` içinde `<!-- Projects Section -->` kısmını bulun. Bir `project-card` bloğunu kopyalayıp yapıştırarak yeni proje ekleyebilirsiniz.

### 3. Görsel Değiştirme
Yeni görselinizi `assets/images/` klasörüne atın.
`index.html` içinde ilgili `<img>` etiketinin `src` kısmını güncelleyin:
```html
<img src="assets/images/yeni-foto.jpg" alt="Açıklama">
```

### 4. Renkleri Değiştirme
`style.css` dosyasının en üstündeki `:root` bölümünden sitenin ana renklerini değiştirebilirsiniz:
```css
:root {
    --accent-color: #00f2ea; /* Ana vurgu rengi */
    --bg-color: #0a0a0a;     /* Arka plan rengi */
}
```

## 🚀 Siteyi Yayına Alma (Upload)

Bu site "Statik Web Sitesi" olduğu için yayınlaması çok kolay ve genellikle ücretsizdir. İşte en popüler 3 yöntem:

### Yöntem 1: Netlify Drop (En Kolay - Ücretsiz)
1.  [app.netlify.com/drop](https://app.netlify.com/drop) adresine gidin.
2.  `portfolio-site` klasörünü sürükleyip sayfaya bırakın.
3.  Siteniz saniyeler içinde yayına girecektir. Size rastgele bir link (örn: `mehmet-portfolio.netlify.app`) verecektir.
4.  İsterseniz alan adınızı (domain) buraya yönlendirebilirsiniz.

### Yöntem 2: GitHub Pages (Profesyonel - Ücretsiz)
1.  GitHub'da yeni bir "Repository" oluşturun (örn: `portfolio`).
2.  Bu klasördeki dosyaları oraya yükleyin (Push).
3.  Repository ayarlarından (Settings > Pages) "Source" olarak "main" branch'ini seçin.
4.  Siteniz `kullaniciadi.github.io/portfolio` adresinde yayınlanacaktır.

### Yöntem 3: Klasik Hosting (FTP / cPanel)
Eğer halihazırda bir hosting hesabınız ve alan adınız (örn: `atilakyuz.com`) varsa:
1.  Hosting panelinize (cPanel, Plesk vb.) veya bir FTP programına (FileZilla) girin.
2.  `public_html` veya `www` klasörünü açın.
3.  `portfolio-site` klasörünün **içindeki** tüm dosyaları (index.html, style.css, assets vb.) buraya yükleyin.
