Web Sitemiz: Şiir Severlerin Dijital Buluşma Noktası
Şiir tutkunlarına özel olarak geliştirilen platformumuz, şiirleri keşfetme, onaylı şekilde paylaşma ve toplulukla etkileşim kurma olanağı sunan, kullanıcı dostu bir dijital alan sunmaktadır.

Vizyonumuz ve Platform Yapısı
Amacımız, şiirin ilham veren gücünü dijital ortama taşıyarak, kullanıcıların geniş bir şiir koleksiyonuna ulaşmasını, kendi eserlerini yöneticinin onayıyla paylaşmasını ve toplulukla yorumlar aracılığıyla bağ kurmasını sağlamaktır. Kişiye özel profiller ve gelişmiş yönetici paneli ile hem okuyucuya hem yazara zengin bir deneyim sunuyoruz.

Temel Özellikler:

Şiir Keşfi: Geniş arşivde kolay arama ve filtreleme ile şiirlere ulaşım.
Yorumlama: Okunan şiirler hakkında görüş paylaşımı ve etkileşim.
Kullanıcı Profili: Kişisel şiir paylaşımları ve yorum geçmişinin yönetimi.
Şiir Paylaşımı: Kendi yazdığınız şiirleri toplulukla paylaşma.
İletişim Formu: Site yönetimi ile doğrudan ve hızlı iletişim.
Yönetici Paneli: Gelişmiş kontrol paneli ile içerik ve kullanıcı yönetimi:
Kullanıcı Yönetimi: Üye listeleme, düzenleme, silme ve rol atama işlemleri.
Şiir Yönetimi: Platformdaki şiirleri inceleme, düzenleme ve kaldırma.
Yorum Yönetimi: Yorumları denetleme ve moderasyon.
Site İstatistikleri: Kullanıcı, şiir sayısı gibi temel verilerin takibi ve ayar kontrolü.
Kullanılan Teknolojiler
Hızlı, güvenli ve sürdürülebilir bir deneyim için modern web teknolojileri kullanılmıştır:

Ön Yüz (Frontend)
Kullanıcının doğrudan etkileşimde bulunduğu arayüz şu teknolojilerle geliştirildi:

HTML5: Semantik yapılarla düzenli ve erişilebilir içerik sunumu.
CSS3: Duyarlı (responsive) tasarım ve görsel optimizasyon.
JavaScript: Dinamik işlemler (şiir ekleme, yorum gönderme, sekme geçişleri vb.).
Arka Yüz (Backend)
Uygulamanın veri işleme ve sunucu tarafı, Node.js ve Express.js altyapısı üzerinde kuruludur. MongoDB ile veriler saklanmakta, RESTful API'ler aracılığıyla ön yüzle iletişim sağlanmaktadır.

Proje Dosya Yapısı:

frontend/
├── assets/
│   └── images/          # Resimler ve diğer medya dosyaları
├── css/
│   └── styles.css       # Ana stil dosyası
├── js/
│   └── script.js        # Ana JavaScript dosyası (DOM manipülasyonu, olay dinleyicileri)
├── index.html           # Ana HTML dosyası
└── README.md            # Proje hakkında genel bilgi
backend/
├── config/
│   └── db.js            # Veritabanı bağlantı yapılandırması
├── middleware/
│   ├── adminMiddleware.js    # Yalnızca yöneticiye özgü erişim kontrolü için middleware
│   └── authMiddleware.js     # İsteklerin kimliğini doğrulamak için middleware (örn. JWT doğrulama)
├── models/
│   ├── Poem.js               # Şiir verileri için Mongoose/Sequelize modeli
│   └── User.js               # Kullanıcı verileri için Mongoose/Sequelize modeli
├── routes/
│   ├── adminRoutes.js        # Yönetici eylemleri için API rotaları (örn. kullanıcı yönetimi, yorum silme)
│   ├── authRoutes.js         # Kullanıcı kimlik doğrulaması için API rotaları (kayıt, giriş, profil yönetimi)
│   ├── commentRoutes.js      # Yorumla ilgili işlemler için API rotaları (yorum ekleme, düzenleme, silme)
│   └── poemRoutes.js         # Şiirle ilgili işlemler için API rotaları (şiirler için CRUD, beğenme)
├── .env                      # Ortam değişkenleri (örn. veritabanı URI, JWT sırrı)
├── app.js                    # Node.js uygulamasının ana giriş noktası (Express'i ayarlar, DB'ye bağlanır, rotaları ve middleware'i kullanır)
└── package.json              # Proje bağımlılıkları ve betikler
Veritabanı
MongoDB kullanılarak kullanıcı, şiir ve yorum verileri güvenli biçimde saklanmaktadır. Mongoose şemaları ile veri tutarlılığı ve validasyonu sağlanır.

İş Akışı
Kullanıcı isteği → İlgili rota (`routes/`) → Middleware doğrulaması → Model üzerinden veritabanı işlemi → JSON yanıt.

Bu modüler, güvenli ve ölçeklenebilir yapı sayesinde kullanıcılarımıza şiirle dolu, etkileşimli ve keyifli bir deneyim sunuyoruz. Platformumuz; kullanıcı geri bildirimleri, yeni özellikler ve güncellemelerle sürekli olarak gelişmeye devam etmektedir.