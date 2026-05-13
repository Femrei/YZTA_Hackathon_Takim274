# DigiCo: Yapay Zeka Destekli Akıllı KOBİ ve Kooperatif Yönetim Platformu

> Google Yapay Zeka ve Teknoloji Akademisi (YZTA) 5. Dönem Hackathon'u kapsamında Takım 274 tarafından tasarlanmış ve geliştirilmiştir.

DigiCo, operasyonel verimliliği artırmak ve insan kaynaklı hataları minimize etmek amacıyla geliştirilmiş, gerçek zamanlı verilerle çalışan otonom bir yapay zeka asistanıdır. Platform, özellikle dijitalleşme sürecinde geride kalmış işletmelerin karmaşık veri yönetimini yapay zeka aracılığıyla basitleştirmeyi hedefler.

---

## 1. Proje Bağlamı ve Çözülen Problem

Günümüz rekabetçi pazarında işletmelerin ayakta kalabilmesi için operasyonel hız ve veri doğruluğu kritik öneme sahiptir. Projemiz geliştirilirken sahada karşılaşılan temel darboğazlar analiz edilmiş ve aşağıdaki hedef kitle belirlenmiştir:

**Hedef Kitle:**
*   Küçük ve Orta Büyüklükteki İşletmeler (KOBİ'ler)
*   Tarım ve Üretim Kooperatifleri
*   Yerel Üreticiler ve Tedarik Zinciri Yöneticileri

**Sahadaki Temel Problemler:**
1.  **Dağınık ve Manuel Yönetim:** KOBİ'ler ve tarım kooperatifleri, günlük operasyonlarını (stok takibi, sipariş yönetimi, müşteri iletişimini) hala kağıt formlar, basit Excel tabloları veya WhatsApp mesajları üzerinden yürütmektedir.
2.  **Kritik Zaman İsrafı:** Manuel süreçler, işletme sahiplerinin günde saatlerini verimsiz veri girişi ve kontrolü ile harcamasına neden olmaktadır.
3.  **Anlık Takip Eksikliği:** Stok tükenmeleri, kargo gecikmeleri veya tedarik zincirindeki aksamalar ancak kriz oluştuktan sonra fark edilmektedir. Bu durum müşteri memnuniyetsizliğine ve doğrudan ciro kaybına yol açmaktadır.
4.  **Veriye Dayalı Karar Alamama:** Toplanan verilerin analiz edilememesi, geleceğe yönelik stratejik stok planlamasının yapılmasını imkansız kılmaktadır.

---

## 2. Çözümümüz ve Öne Çıkan Özellikler

Bu problemleri kökünden çözmek için, işletmenin tüm veritabanına entegre çalışan ve olaylara anında tepki verebilen bir **Gerçek Zamanlı Yapay Zeka Ajanı (AI Agent)** mimarisi kurguladık.

| Temel Özellik | Mimari Yaklaşım ve Detaylar |
| :--- | :--- |
| **RAG (Retrieval-Augmented Generation) Mimarisi** | Sistemimiz ezberlenmiş bilgilerle konuşan basit bir sohbet botu değildir. Kullanıcı bir soru sorduğunda (Örn: "Bugün kargoya verilmesi gereken siparişlerim hangileri?"), ajan arka planda doğrudan Firestore veritabanına bağlanır. İlgili sipariş ve stok tablolarını okur, veriyi analiz eder ve sadece kesin, veriye dayalı gerçek yanıtlar üretir. Halüsinasyon riski sıfıra indirilmiştir. |
| **Multimodal Görüntü İşleme (Vision AI)** | Tarım kooperatifleri ve üreticiler için sektöre özel görsel analiz modülü geliştirilmiştir. Kullanıcı, yapraklarında leke olan bir bitkinin veya kalite kontrolü yapılacak bir ürünün fotoğrafını sisteme yüklediğinde; yapay zeka görseli analiz eder, olası hastalık veya kalite sorunlarını teşhis eder ve işletmenin mevcut stok durumuna bakarak hangi ilacın/aksiyonun alınması gerektiğini raporlar. |
| **Otonom Uyarı ve Otomasyon Sistemi** | Yapay zeka ajanımız yalnızca soru sorulduğunda değil, arka planda da sürekli aktiftir. Kritik seviyenin altına düşen stokları tespit ettiğinde, yaklaşan teslimat gecikmelerini öngördüğünde veya operasyonel bir anomali yakaladığında yönetici panelinde proaktif uyarılar oluşturur. Yöneticinin tek tıkla aksiyon almasını sağlar (Örn: "Tedarikçiye otomatik sipariş e-postası taslağı oluştur"). |
| **Akıllı Belge ve Fatura Analizi** | İşletmeye gelen fatura, fiş veya irsaliyelerin manuel girilmesine gerek kalmaz. Görüntü işleme teknolojisi sayesinde yüklenen belgelerden tarih, KDV, toplam tutar ve satıcı bilgileri anında ayıklanır. Ayrıca kullanıcılar doğrudan yükledikleri belge ile ilgili yapay zekaya sorular yöneltebilir ("Bu faturada en pahalı kalem hangisi?" gibi). |
| **Telegram ile Entegre Raporlama** | Yöneticiler bilgisayar başında olmasa bile, yapay zeka sabahları "Günün Kargo Özeti"ni, akşamları ise "Günün Satış ve Stok Raporu"nu otomatik olarak yöneticinin Telegram hesabına mesaj olarak iletir. |

---

## 3. Teknik Mimari ve Teknoloji Yığını (Tech Stack)

Uygulamamız, hackathon jürisinin teknik gereksinimlerine tam uyumlu olarak, yüksek erişilebilirlik ve düşük gecikme süresi (low-latency) prensiplerine göre tasarlanmıştır.

### Backend (Sunucu ve Agent Mantığı)
*   **Python 3.12+ & FastAPI:** Jürinin zorunlu kıldığı backend teknolojisi olarak kullanılmıştır. Asenkron (async/await) yapısı sayesinde aynı anda yüzlerce veritabanı sorgusu ve yapay zeka çağrısı bloklanmadan işlenebilmektedir.
*   **Pydantic:** Gelen API isteklerinin (Request) ve dönen yanıtların (Response) katı veri tipleriyle doğrulanması sağlanmış, güvenlik artırılmıştır.
*   **Modüler Agent Yapısı:** Sohbet (`chat_agent.py`), Stok ve Öngörü (`stock_agent.py`) ve Görsel Analiz (`vision_agent.py`) işlemleri birbirine karışmayacak şekilde ayrıştırılmış, sürdürülebilir bir mimari kurulmuştur.

### Frontend (Kullanıcı Arayüzü)
*   **React & TypeScript:** Güçlü tip kontrolü sayesinde hatasız ve genişletilebilir bir arayüz geliştirilmiştir.
*   **Vite:** Geliştirme sürecini hızlandıran ve production paketini (build) optimize eden modern derleyici kullanılmıştır.
*   **Tailwind CSS:** Sistemdeki tüm arayüz bileşenleri (Dashboard, kartlar, modal pencereleri) Tailwind kullanılarak sıfırdan tasarlanmış, tamamen mobil uyumlu (responsive) ve modern bir görsel hiyerarşi oluşturulmuştur.

### Veritabanı ve Sunucusuz Altyapı
*   **Firebase / Firestore (NoSQL):** İşletmelerin sipariş, stok ve çalışan verilerinin tutulduğu ana veritabanı. Geleneksel SQL veritabanlarından farklı olarak "Real-time Listener" (onSnapshot) özellikleri kullanılarak, stokta bir ürün azaldığında sayfanın yenilenmesine gerek kalmadan yönetici ekranının anında güncellenmesi sağlanmıştır.

### Yapay Zeka Modeli Seçi̇mi̇
*   **Sadece `gemini-flash-lite-latest`:** Proje genelindeki metin üretimi, mantıksal çıkarım (RAG veri enjeksiyonu) ve görüntü analizi (Multimodal Vision) işlemlerinin **tamamında** bu tek model kullanılmıştır.
    *   **Neden Tercih Edildi?** Hackathon ortamında yüksek istek (Request per minute) gönderebilmek ve arayüzde kullanıcılara anında yanıt dönebilmek (low latency) için "Flash Lite" versiyonunun hız ve kota avantajından yararlanılmıştır.

---

## 4. Kurulum ve Çalıştırma Adımları (Installation)

Projeyi bilgisayarınızda yerel ortamda çalıştırmak için aşağıdaki adımları sırasıyla uygulayınız.

### 4.1. Depoyu Klonlama ve Gereksinimler
Projeyi yerel bilgisayarınıza indirin ve klasörün içine girin:
```bash
git clone https://github.com/Femrei/YZTA_Hackathon_Takim274.git
cd YZTA_Hackathon_Takim274
```

### 4.2. Çevre Değişkenlerinin (.env) Ayarlanması
Projenin kök dizininde yeni bir `.env` dosyası oluşturun ve içerisine aşağıdaki API anahtarlarını kendi bilgilerinizle ekleyin. (Güvenlik nedeniyle bu dosya repoda bulunmamaktadır).

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_API_URL=http://localhost:8000
GEMINI_API_KEY=your_gemini_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_telegram_chat_id_here
```

### 4.3. Backend (FastAPI) Sunucusunu Başlatma
1. Yeni bir terminal açın ve backend dizinine geçiş yapın:
   ```bash
   cd backend
   ```
2. İzole bir Python sanal ortamı (virtual environment) oluşturun ve aktif edin:
   *   **Windows için:**
       ```bash
       python -m venv venv
       venv\Scripts\activate
       ```
   *   **macOS / Linux için:**
       ```bash
       python3 -m venv venv
       source venv/bin/activate
       ```
3. Gerekli kütüphaneleri yükleyin ve sunucuyu ayağa kaldırın:
   ```bash
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```
   *Sunucu başarıyla başlatıldığında `http://localhost:8000` adresinde dinlemeye başlayacaktır.*

### 4.4. Frontend (React) Sunucusunu Başlatma
1. Projenin ana (kök) dizininde ayrı bir terminal penceresi açın.
2. Node paketlerini yükleyin:
   ```bash
   npm install
   ```
3. Geliştirici sunucusunu başlatın:
   ```bash
   npm run dev
   ```
   *Uygulama arayüzü `http://localhost:5173` adresinde açılacaktır. Tarayıcınızdan bu adrese giderek platformu kullanmaya başlayabilirsiniz.*
