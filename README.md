# 🚀 DigiCoBig  
### AI-Powered Smart SME & Cooperative Management Ecosystem

> Google Yapay Zeka ve Teknoloji Akademisi (YZTA) 5. Dönem Hackathon kapsamında **Takım 274** tarafından geliştirilmiştir.

DigiCoBig; küçük ve orta ölçekli işletmeler (KOBİ), kooperatifler ve yerel üreticiler için geliştirilmiş **yapay zeka destekli akıllı işletme yönetim platformudur**.

Platform; operasyon, stok, görev, lojistik, çalışan yönetimi ve analitik süreçlerini tek merkezde toplayarak verimsiz iş akışlarını **otonom ve veri odaklı dijital yönetime** dönüştürür.

---

# 🎯 Problem

Günümüzde birçok KOBİ ve kooperatif:

- Manuel sistemler kullanıyor (Excel, WhatsApp, kağıt)
- Operasyon süreçlerini anlık yönetemiyor
- Stok kayıpları yaşıyor
- Veriye dayalı karar veremiyor
- Krizleri ancak oluştuktan sonra fark ediyor
- Ölçeklenebilir dijital altyapıya sahip değil

### Sonuç

- Zaman kaybı  
- İnsan kaynaklı hata  
- Operasyonel verimsizlik  
- Finansal kayıplar  

---

# 💡 Çözüm

DigiCoBig, tüm operasyonel süreçleri AI tabanlı merkezi platformda toplar.

### Sağladıkları

✅ Gerçek zamanlı veri analizi  
✅ Proaktif uyarı sistemi  
✅ Yapay zeka destekli karar mekanizması  
✅ Çok kullanıcı rollü SaaS mimarisi  
✅ Ölçeklenebilir kurumsal yapı  

---

# 🧩 Sistem Modülleri

---

## 👔 Yönetici Paneli

- Kurumsal e-posta doğrulama sistemi
- Şirket ID bazlı kayıt
- Çalışan görev atama
- Öncelikli görev sistemi
- Geliştirici destek talepleri
- İş ilanı oluşturma
- Şirket bazlı analiz
- Telegram rapor entegrasyonu
- Gerçek zamanlı dashboard
- AI operasyon asistanları
- AI tema önerileri
- Bildirim merkezi

---

## 👷 Çalışan Paneli

- Atanan görevleri görüntüleme
- Görev tamamlama sistemi
- AI belge analizi
- AI fatura okuma
- Muhasebe export
- Görsel kalite kontrol
- Hasar tespiti
- Anlık bildirim

---

## 🧑‍💻 Geliştirici Paneli

- Şirket listeleme
- Destek yönetimi
- Şirket sorun analizi
- AI öneri sistemi
- Tema kişiselleştirme
- Sistem optimizasyon araçları

---

## 🛒 Müşteri Paneli

- Ürün katalogları
- Sipariş takibi
- İş ilanlarına başvuru
- Şirket profili görüntüleme

---

## 🚚 Lojistik Modülü

- Teslimat takibi
- AI tahmini teslim süresi
- Stok tükenme tahmini
- Risk analizi
- Operasyon özetleri

---

## 🤖 AI Katmanı

- Uzman AI ajanlar
- RAG mimarisi
- Multimodal görüntü işleme
- Belge anlama
- Stok tahminleme
- Operasyon analizi
- Akıllı bildirim
- Veri bazlı öneriler

---

# 🏗️ Sistem Mimarisi

```text
Frontend (React + TS)
        ↓
FastAPI Backend
        ↓
AI Agent Layer
        ↓
Firebase Firestore
        ↓
Gemini AI + RAG
        ↓
Telegram Integration
```

---

# 🛠️ Teknolojiler

## Backend

- Python 3.12
- FastAPI
- Pydantic
- AsyncIO
- REST API

## Frontend

- React
- TypeScript
- Vite
- TailwindCSS

## Database

- Firebase Firestore
- Firebase Auth

## AI

- Gemini Flash Lite
- RAG
- Vision AI
- Agentic AI

## Integration

- Telegram Bot API
- Real-time Events

---

# 🤖 AI Özellikleri

- 📊 Gerçek zamanlı veri analizi
- 📦 Akıllı stok tahmini
- 🚨 Proaktif uyarılar
- 🧾 Fatura anlayan AI
- 📷 Görsel kalite kontrol
- 📩 Günlük raporlama
- 🧠 Operasyonel öneri sistemi

---

# 🎨 Tasarım

- Soft blue enterprise theme
- Responsive UI
- Dashboard-centric
- Card-based modern layout
- Premium SaaS interface

---

# 📸 Ekran Görüntüleri

## Dashboard

<img width="1600" height="787" alt="Dashboard" src="https://github.com/user-attachments/assets/239eeba4-ac88-4f74-ae80-28970760eb82" />

## Analytics

<img width="1600" height="787" alt="analitik" src="https://github.com/user-attachments/assets/737d29a2-2875-4b52-ad42-135708f7e25b" />

## AI Chat

<img width="1600" height="782" alt="ai-chat" src="https://github.com/user-attachments/assets/685763ab-525a-49d9-815b-7683f03be81f" />

## Mobile

<img width="766" height="1599" alt="mobil" src="https://github.com/user-attachments/assets/1bc09138-166a-4462-abcf-e5878a8663ce" />


---

# ⚙️ Kurulum

## Repository

[YZTA_Hackathon_Takim274 Repository](https://github.com/Femrei/YZTA_Hackathon_Takim274?utm_source=chatgpt.com)

```bash
git clone https://github.com/Femrei/YZTA_Hackathon_Takim274.git
cd YZTA_Hackathon_Takim274
```

---

## Backend

```bash
cd backend

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload
```

---

## Frontend

```bash
npm install
npm run dev
```

---

# 🔐 Environment Variables

`.env`

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=

VITE_API_URL=http://localhost:8000

GEMINI_API_KEY=
TELEGRAM_BOT_TOKEN=
```

---

# 🔮 Roadmap

- Fully autonomous AI business agent
- Revenue optimization engine
- Supplier matching AI
- Mobile application
- IoT inventory tracking
- Multi-language expansion
- Predictive sales engine

---

# 👥 Team

## Takım 274

Google Yapay Zeka ve Teknoloji Akademisi Hackathon

- AI Development
- Backend Development
- Frontend Development
- System Design
- AI Agent Architecture

---

# 📄 License

Bu proje hackathon kapsamında geliştirilmiştir.

Ticari kullanım için izin gerektirir.

---

# 🚀 Vizyon

DigiCoBig:

### sadece bir yönetim paneli değildir.

Bir işletmenin:

- verisini anlayan  
- karar üreten  
- süreci yöneten  
- aksiyon alan  
- ölçeklenen  

**AI destekli dijital işletim sistemidir.**

---

# 🌍 Gelecek

DigiCoBig, Türkiye’de KOBİ’leri yapay zeka ile dijitalleştirerek geleceğin otonom iş yönetim altyapısını oluşturmayı hedefler.

---

⭐ Takım 274 tarafından geliştirildi.
