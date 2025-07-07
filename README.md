📚 nodejs-poem-webpage: Şiir Severlerin Dijital Buluşma Noktası
Bu proje, şiir tutkunlarına özel olarak geliştirilmiş, tam yığın (full-stack) ve kullanıcı dostu bir web platformudur. Kullanıcıların şiirleri keşfetmesini, onaylı şekilde kendi eserlerini paylaşmasını ve toplulukla etkileşim kurmasını sağlayan dinamik bir dijital alan sunar.

✨ Vizyon ve Platform Yapısı
Amacımız, şiirin ilham veren gücünü dijital ortama taşıyarak, geniş bir şiir koleksiyonuna erişimi kolaylaştırmak, kullanıcıların kendi eserlerini yönetici onayıyla paylaşmalarına olanak tanımak ve yorumlar aracılığıyla topluluk bağlarını güçlendirmektir. Kişiye özel profiller ve gelişmiş bir yönetici paneli ile hem okuyuculara hem de yazarlara zengin bir deneyim sunuyoruz.

🚀 Temel Özellikler
Şiir Keşfi: Geniş arşivde kolay arama ve filtreleme seçenekleriyle şiirlere hızlı erişim.

Yorumlama: Okunan şiirler hakkında görüş paylaşımı ve diğer kullanıcılarla etkileşim.

Kullanıcı Profili: Kişisel şiir paylaşımlarını ve yorum geçmişini kolayca yönetme.

Şiir Paylaşımı: Kullanıcıların kendi yazdıkları şiirleri toplulukla paylaşabilmesi (yönetici onayı gereklidir).

İletişim Formu: Site yönetimi ile doğrudan ve hızlı iletişim kanalı.

Kapsamlı Yönetici Paneli: İçerik ve kullanıcılar üzerinde tam kontrol:

Kullanıcı Yönetimi: Üye listeleme, düzenleme, silme ve rol atama işlemleri.

Şiir Yönetimi: Platformdaki şiirleri inceleme, düzenleme ve kaldırma.

Yorum Yönetimi: Yapılan yorumları denetleme ve moderasyon.

Site İstatistikleri: Kullanıcı ve şiir sayısı gibi temel verilerin takibi ve ayar kontrolü.

🛠️ Kullanılan Teknolojiler
Hızlı, güvenli ve sürdürülebilir bir deneyim için modern web teknolojileri kullanılmıştır:

Ön Yüz (Frontend)
Kullanıcının doğrudan etkileşimde bulunduğu arayüz şu teknolojilerle geliştirildi:

HTML5: Semantik yapılarla düzenli ve erişilebilir içerik sunumu.

CSS3: Duyarlı (responsive) tasarım ve görsel optimizasyon.

JavaScript: Dinamik işlemler (şiir ekleme, yorum gönderme, sekme geçişleri vb.) için etkileşimli özellikler.

Arka Yüz (Backend)
Uygulamanın veri işleme ve sunucu tarafı, güçlü bir altyapı üzerinde kuruludur:

Node.js & Express.js: Sunucu tarafı uygulama geliştirme için hızlı ve esnek bir ortam.

MongoDB: Kullanıcı, şiir ve yorum verilerinin güvenli biçimde saklanması için NoSQL veritabanı.

RESTful API'ler: Ön yüz ile arka yüz arasında sorunsuz ve güvenli veri iletişimi.

Veritabanı
MongoDB kullanılarak kullanıcı, şiir ve yorum verileri güvenli biçimde saklanmaktadır. Mongoose şemaları ile veri tutarlılığı ve validasyonu sağlanır.

📂 Proje Dosya Yapısı
Projenin modüler ve anlaşılır yapısı aşağıdaki gibidir:

nodejs-poem-webpage/
├── frontend/
│   ├── assets/
│   │   └── images/          # Resimler ve diğer medya dosyaları
│   ├── css/
│   │   └── styles.css       # Ana stil dosyası
│   ├── js/
│   │   └── script.js        # Ana JavaScript dosyası (DOM manipülasyonu, olay dinleyicileri)
│   ├── index.html           # Ana HTML dosyası
│   └── README.md            # Frontend hakkında genel bilgi
└── backend/
    ├── config/
    │   └── db.js            # Veritabanı bağlantı yapılandırması
    ├── middleware/
    │   ├── adminMiddleware.js    # Yöneticiye özgü erişim kontrolü
    │   └── authMiddleware.js     # İstek kimlik doğrulama (örn. JWT doğrulama)
    ├── models/
    │   ├── Poem.js               # Şiir verileri için Mongoose modeli
    │   └── User.js               # Kullanıcı verileri için Mongoose modeli
    ├── routes/
    │   ├── adminRoutes.js        # Yönetici eylemleri için API rotaları
    │   ├── authRoutes.js         # Kullanıcı kimlik doğrulama rotaları
    │   ├── commentRoutes.js      # Yorum işlemleri için API rotaları
    │   └── poemRoutes.js         # Şiir işlemleri için API rotaları
    ├── .env                      # Ortam değişkenleri (veritabanı URI, JWT sırrı vb.)
    ├── app.js                    # Node.js uygulamasının ana giriş noktası
    └── package.json              # Proje bağımlılıkları ve betikler
⚙️ İş Akışı
Platformun işleyişi, modüler ve verimli bir yapı üzerine kuruludur:

Kullanıcı isteği → İlgili rota (routes/) → Middleware doğrulaması → Model üzerinden veritabanı işlemi → JSON yanıt.

Bu modüler, güvenli ve ölçeklenebilir yapı sayesinde kullanıcılarımıza şiirle dolu, etkileşimli ve keyifli bir deneyim sunuyoruz. Platformumuz; kullanıcı geri bildirimleri, yeni özellikler ve güncellemelerle sürekli olarak gelişmeye devam edecektir.
