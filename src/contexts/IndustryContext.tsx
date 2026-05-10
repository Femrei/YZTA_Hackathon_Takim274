import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { SMEType } from './SMEContext';

export interface StockItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  aiRecommendedOrder: number;
  status: 'critical' | 'normal' | 'excess';
  price: number;
  unit: string;
}

export interface EmployeeTask {
  id: number;
  orderId: string;
  action: string;
  product: string;
  priority: 'high' | 'medium' | 'low';
  aiNote: string;
  deadline: string;
  status: 'pending' | 'in-progress' | 'done';
}

export interface EmployeeNotification {
  id: number;
  message: string;
  time: string;
  type: 'success' | 'warning' | 'info';
  read: boolean;
}

export interface Shipment {
  id: string;
  destination: string;
  product: string;
  status: 'active' | 'delayed' | 'delivered';
  eta: string;
  delay: string | null;
  aiReason: string | null;
  carrier: string;
  progress: number;
}

export interface AIInsight {
  titleKey: string;
  title: string;
  insight: string;
  trend: 'positive' | 'neutral' | 'negative';
}

export interface IndustryData {
  stockItems: StockItem[];
  employeeTasks: EmployeeTask[];
  employeeNotifications: EmployeeNotification[];
  shipments: Shipment[];
  aiInsights: AIInsight[];
  stats: {
    totalRevenue: string;
    revenueDelta: string;
    weeklyOrders: string;
    ordersDelta: string;
    activeShipments: string;
    onTimeRate: string;
  };
}

const agricultureData: IndustryData = {
  stockItems: [
    { id: 1, name: 'Ege Sızma Zeytinyağı', sku: 'ZY-001', category: 'Gıda', currentStock: 12, aiRecommendedOrder: 80, status: 'critical', price: 189.90, unit: 'adet' },
    { id: 2, name: 'Organik Domates Salçası', sku: 'DS-042', category: 'Gıda', currentStock: 245, aiRecommendedOrder: 0, status: 'excess', price: 34.50, unit: 'adet' },
    { id: 3, name: 'Organik Doğal Bal', sku: 'OB-055', category: 'Gıda', currentStock: 89, aiRecommendedOrder: 30, status: 'normal', price: 120.00, unit: 'kg' },
    { id: 4, name: 'Organik Gübre (NPK 20-20-20)', sku: 'GU-011', category: 'Tarım Girdisi', currentStock: 5, aiRecommendedOrder: 50, status: 'critical', price: 210.00, unit: 'torba' },
    { id: 5, name: 'Türk Bademli Lokum', sku: 'TL-077', category: 'Gıda', currentStock: 134, aiRecommendedOrder: 0, status: 'normal', price: 45.00, unit: 'kutu' },
    { id: 6, name: 'Damla Sulama Borusu', sku: 'SB-201', category: 'Sulama', currentStock: 3, aiRecommendedOrder: 20, status: 'critical', price: 85.00, unit: 'rulo' },
  ],
  employeeTasks: [
    { id: 1, orderId: '#402', action: 'Paketle', product: 'Sızma Zeytinyağı x5', priority: 'high', aiNote: 'VIP müşteri siparişi — öncelikli', deadline: '13:00', status: 'pending' },
    { id: 2, orderId: '#398', action: 'Hazırla', product: 'Organik Bal x2', priority: 'high', aiNote: 'Bugün kargoya verilmesi gerekiyor', deadline: '14:30', status: 'in-progress' },
    { id: 3, orderId: '#405', action: 'Kontrol Et', product: 'Domates Salçası x10', priority: 'medium', aiNote: 'Son kullanma tarihi kontrolü yapılmalı', deadline: '15:00', status: 'pending' },
    { id: 4, orderId: '#391', action: 'Paketle', product: 'Türk Lokumu x10', priority: 'low', aiNote: 'Standart sipariş', deadline: '17:00', status: 'pending' },
    { id: 5, orderId: '#407', action: 'Hazırla', product: 'Organik Gübre x5', priority: 'medium', aiNote: 'Nemli ortamda saklanmamalı', deadline: '16:00', status: 'pending' },
  ],
  employeeNotifications: [
    { id: 1, message: 'Sipariş #402 için stok ayrıldı — paketleme başlayabilir', time: '09:15', type: 'success', read: false },
    { id: 2, message: 'Zeytinyağı stoku kritik seviyeye düştü! AI sipariş taslağı hazırladı', time: '08:45', type: 'warning', read: false },
    { id: 3, message: 'SHK-4820 sevkiyatı yola çıktı', time: '08:20', type: 'info', read: true },
    { id: 4, message: 'Yeni sipariş: #407 — Organik Gübre — Görev kuyruğuna eklendi', time: '07:55', type: 'info', read: true },
  ],
  shipments: [
    { id: 'SHK-4821', destination: 'İzmir, Türkiye', product: 'Ege Sızma Zeytinyağı (x50)', status: 'delayed', eta: '14 Mayıs 2026', delay: '2 saat', aiReason: 'Hava durumu kaynaklı 2 saat rötar (Ege Bölgesi fırtınası)', carrier: 'Aras Kargo', progress: 65 },
    { id: 'SHK-4820', destination: 'Ankara, Türkiye', product: 'Organik Domates Salçası (x100)', status: 'active', eta: '12 Mayıs 2026', delay: null, aiReason: null, carrier: 'Yurtiçi Kargo', progress: 80 },
    { id: 'SHK-4819', destination: 'İstanbul, Türkiye', product: 'Organik Bal (x30)', status: 'active', eta: '11 Mayıs 2026', delay: null, aiReason: null, carrier: 'MNG Kargo', progress: 92 },
    { id: 'SHK-4818', destination: 'Bursa, Türkiye', product: 'Türk Lokumu (x25)', status: 'delivered', eta: '10 Mayıs 2026', delay: null, aiReason: null, carrier: 'PTT Kargo', progress: 100 },
    { id: 'SHK-4817', destination: 'Antalya, Türkiye', product: 'Organik Gübre (x20)', status: 'delayed', eta: '13 Mayıs 2026', delay: '1 gün', aiReason: 'Tedarikçi gecikmesi nedeniyle 1 gün rötar bekleniyor', carrier: 'Sürat Kargo', progress: 30 },
  ],
  aiInsights: [
    { titleKey: 'harvest', title: 'Hasat Tahmini', insight: 'Bölgesel hava verilerine göre zeytin hasadı bu yıl %18 daha verimli. Haziran başı için paketleme kapasitesi artırılması öneriliyor.', trend: 'positive' },
    { titleKey: 'logistics', title: 'Lojistik Performansı', insight: '2 aktif sevkiyat gecikmede. Fırtına kaynakl rötar — alternatif rota aktif edildi.', trend: 'neutral' },
    { titleKey: 'revenue', title: 'Gelir Tahmini', insight: 'Bu ay tahmini gelir ₺284.500 — organik ürün talebi %22 artışla geçen aya kıyasla yüksek seyrediyor.', trend: 'positive' },
  ],
  stats: { totalRevenue: '₺284.500', revenueDelta: '+12.4%', weeklyOrders: '147', ordersDelta: '+8.2%', activeShipments: '23', onTimeRate: '%94.7' },
};

const technologyData: IndustryData = {
  stockItems: [
    { id: 1, name: 'Akıllı Sensör (IoT)', sku: 'SNS-101', category: 'Elektronik', currentStock: 8, aiRecommendedOrder: 50, status: 'critical', price: 450.00, unit: 'adet' },
    { id: 2, name: 'İşlemci Birimi (ARM)', sku: 'CPU-ARM7', category: 'Donanım', currentStock: 42, aiRecommendedOrder: 20, status: 'normal', price: 1200.00, unit: 'adet' },
    { id: 3, name: 'SaaS Lisansı - Yıllık', sku: 'LIC-SAS1', category: 'Yazılım', currentStock: 5, aiRecommendedOrder: 10, status: 'critical', price: 12000.00, unit: 'adet' },
    { id: 4, name: 'Ağ Anahtarı (48 Port)', sku: 'NET-SW48', category: 'Ağ', currentStock: 150, aiRecommendedOrder: 0, status: 'excess', price: 3800.00, unit: 'adet' },
    { id: 5, name: 'Bulut Depolama Birimi', sku: 'CLD-STR5', category: 'Bulut', currentStock: 25, aiRecommendedOrder: 15, status: 'normal', price: 2200.00, unit: 'birim' },
    { id: 6, name: 'API Entegrasyon Paketi', sku: 'API-ENT2', category: 'Yazılım', currentStock: 3, aiRecommendedOrder: 8, status: 'critical', price: 8200.00, unit: 'adet' },
  ],
  employeeTasks: [
    { id: 1, orderId: '#A-912', action: 'Konfigüre Et', product: 'Akıllı Sensör x10', priority: 'high', aiNote: 'Müşteri kurulum için bu gün hazır olmalı', deadline: '13:00', status: 'pending' },
    { id: 2, orderId: '#A-908', action: 'Test Et', product: 'API Entegrasyon Paketi', priority: 'high', aiNote: 'QA öncesi entegrasyon testleri tamamlanmalı', deadline: '14:30', status: 'in-progress' },
    { id: 3, orderId: '#A-915', action: 'Gönder', product: 'SaaS Lisansı x5', priority: 'medium', aiNote: 'Lisans anahtarları e-posta ile iletilecek', deadline: '15:00', status: 'pending' },
    { id: 4, orderId: '#A-901', action: 'Güncelle', product: 'İşlemci Birimi Firmware', priority: 'low', aiNote: 'Standart bakım güncellemesi', deadline: '17:00', status: 'pending' },
    { id: 5, orderId: '#A-917', action: 'Hazırla', product: 'Ağ Anahtarı x2', priority: 'medium', aiNote: 'Rack montaj için özel paket gerekiyor', deadline: '16:00', status: 'pending' },
  ],
  employeeNotifications: [
    { id: 1, message: 'Sipariş #A-912 onaylandı — sensör konfigürasyonu başlayabilir', time: '09:15', type: 'success', read: false },
    { id: 2, message: 'Akıllı Sensör stoku kritik! AI sipariş taslağı hazırlandı', time: '08:45', type: 'warning', read: false },
    { id: 3, message: 'API entegrasyon testi başarıyla tamamlandı', time: '08:20', type: 'info', read: true },
    { id: 4, message: 'Yeni müşteri: TechCorp A.Ş. — onboarding süreci başladı', time: '07:55', type: 'info', read: true },
  ],
  shipments: [
    { id: 'SHK-T821', destination: 'İstanbul, Türkiye', product: 'Akıllı Sensör (x20)', status: 'delayed', eta: '14 Mayıs 2026', delay: '3 saat', aiReason: 'Gümrük işlemleri kaynaklı gecikme', carrier: 'DHL', progress: 55 },
    { id: 'SHK-T820', destination: 'Ankara, Türkiye', product: 'API Entegrasyon Paketi', status: 'active', eta: '12 Mayıs 2026', delay: null, aiReason: null, carrier: 'FedEx', progress: 85 },
    { id: 'SHK-T819', destination: 'İzmir, Türkiye', product: 'SaaS Lisansı x10 (Dijital)', status: 'delivered', eta: '10 Mayıs 2026', delay: null, aiReason: null, carrier: 'Dijital Teslimat', progress: 100 },
    { id: 'SHK-T818', destination: 'Bursa, Türkiye', product: 'Ağ Anahtarı x5', status: 'active', eta: '13 Mayıs 2026', delay: null, aiReason: null, carrier: 'UPS', progress: 72 },
  ],
  aiInsights: [
    { titleKey: 'shortage', title: 'Bileşen Kıtlığı Uyarısı', insight: 'Global ARM işlemci tedariğinde %15 daralma bekleniyor. Q3 öncesi stok artırımı kritik önem taşıyor.', trend: 'negative' },
    { titleKey: 'saas', title: 'SaaS Büyüme Fırsatı', insight: 'Mevcut müşterilerin %34\'ü upsell adayı olarak belirlendi. AI önerilen outreach kampanyası hazır.', trend: 'positive' },
    { titleKey: 'revenue', title: 'MRR Tahmini', insight: 'Bu ay MRR ₺486.000 olarak tahmin ediliyor — geçen aya göre %9.2 büyüme bekleniyor.', trend: 'positive' },
  ],
  stats: { totalRevenue: '₺486.000', revenueDelta: '+9.2%', weeklyOrders: '89', ordersDelta: '+5.1%', activeShipments: '14', onTimeRate: '%97.3' },
};

const handcraftData: IndustryData = {
  stockItems: [
    { id: 1, name: 'Ebru Sanatı Tablo (50x70)', sku: 'EB-050', category: 'Tablo & Sanat', currentStock: 4, aiRecommendedOrder: 12, status: 'critical', price: 1850.00, unit: 'adet' },
    { id: 2, name: 'Seramik Vazo (El Yapımı)', sku: 'SV-033', category: 'Seramik', currentStock: 38, aiRecommendedOrder: 0, status: 'normal', price: 640.00, unit: 'adet' },
    { id: 3, name: 'Kapadokya Çömlek Seti', sku: 'KC-033', category: 'Seramik', currentStock: 56, aiRecommendedOrder: 20, status: 'normal', price: 890.00, unit: 'set' },
    { id: 4, name: 'Bakır El İşi Tabak Seti', sku: 'BT-201', category: 'Metal İşi', currentStock: 2, aiRecommendedOrder: 15, status: 'critical', price: 560.00, unit: 'set' },
    { id: 5, name: 'Anatolian Kilim (2x3m)', sku: 'KL-009', category: 'Tekstil', currentStock: 3, aiRecommendedOrder: 10, status: 'critical', price: 7800.00, unit: 'adet' },
    { id: 6, name: 'Ahşap El Oyması Sehpa', sku: 'AH-118', category: 'Mobilya', currentStock: 120, aiRecommendedOrder: 0, status: 'excess', price: 2450.00, unit: 'adet' },
  ],
  employeeTasks: [
    { id: 1, orderId: '#H-312', action: 'Paketle', product: 'Ebru Sanatı Tablo x1', priority: 'high', aiNote: 'Kırılgan — özel koruyucu ambalaj gerekli', deadline: '13:00', status: 'pending' },
    { id: 2, orderId: '#H-308', action: 'Hazırla', product: 'Kapadokya Çömlek Seti x2', priority: 'high', aiNote: 'Bugün kargoya verilmesi gerekiyor', deadline: '14:30', status: 'in-progress' },
    { id: 3, orderId: '#H-315', action: 'Kontrol Et', product: 'Bakır Tabak Seti x1', priority: 'medium', aiNote: 'Hasar kontrolü — yüzey çiziği şikayeti gelebilir', deadline: '15:00', status: 'pending' },
    { id: 4, orderId: '#H-301', action: 'Paketle', product: 'Seramik Vazo x3', priority: 'low', aiNote: 'Standart sipariş — köpük dolgulu kutu kullan', deadline: '17:00', status: 'pending' },
    { id: 5, orderId: '#H-317', action: 'Hazırla', product: 'Anatolian Kilim x1', priority: 'medium', aiNote: 'Özel rulo ambalaj ve sertifika belgesi eklenecek', deadline: '16:00', status: 'pending' },
  ],
  employeeNotifications: [
    { id: 1, message: 'Sipariş #H-312 için stok ayrıldı — özel ambalaj başlayabilir', time: '09:15', type: 'success', read: false },
    { id: 2, message: 'Ebru tablo stoku kritik! Usta haber verildi, yeni üretim başlayacak', time: '08:45', type: 'warning', read: false },
    { id: 3, message: 'SHK-H820 kilim sevkiyatı yola çıktı', time: '08:20', type: 'info', read: true },
    { id: 4, message: 'Etsy sipariş #H-317 — Anatolian Kilim — Görev kuyruğuna eklendi', time: '07:55', type: 'info', read: true },
  ],
  shipments: [
    { id: 'SHK-H821', destination: 'Almanya', product: 'Anatolian Kilim (x2)', status: 'delayed', eta: '20 Mayıs 2026', delay: '2 gün', aiReason: 'Uluslararası gümrük belgesi eksik — tamamlanıyor', carrier: 'DHL Express', progress: 45 },
    { id: 'SHK-H820', destination: 'İstanbul, Türkiye', product: 'Kapadokya Çömlek Seti (x5)', status: 'active', eta: '12 Mayıs 2026', delay: null, aiReason: null, carrier: 'Yurtiçi Kargo', progress: 78 },
    { id: 'SHK-H819', destination: 'ABD, New York', product: 'Ebru Sanatı Tablo (x1)', status: 'active', eta: '18 Mayıs 2026', delay: null, aiReason: null, carrier: 'FedEx International', progress: 60 },
    { id: 'SHK-H818', destination: 'Ankara, Türkiye', product: 'Bakır Tabak Seti (x3)', status: 'delivered', eta: '9 Mayıs 2026', delay: null, aiReason: null, carrier: 'Aras Kargo', progress: 100 },
  ],
  aiInsights: [
    { titleKey: 'trend', title: 'Zanaatkar Trendi', insight: 'El yapımı seramik ürünlere Avrupa pazarında %31 talep artışı tespit edildi. İhracat başvurusu için belgeler hazırlanabilir.', trend: 'positive' },
    { titleKey: 'logistics', title: 'Kargo Performansı', insight: '1 uluslararası sevkiyat gümrük kaynaklı gecikmede. UNESCO belgesi yenilemesi 15 günde tamamlanabilir.', trend: 'neutral' },
    { titleKey: 'revenue', title: 'Gelir Tahmini', insight: 'Bu ay tahmini gelir ₺198.000 — turizm sezonu öncesi kooperatif ürünlerine talep artacak.', trend: 'positive' },
  ],
  stats: { totalRevenue: '₺198.000', revenueDelta: '+7.8%', weeklyOrders: '63', ordersDelta: '+11.4%', activeShipments: '8', onTimeRate: '%91.2' },
};

const industryDataMap: Record<SMEType, IndustryData> = {
  agriculture: agricultureData,
  technology: technologyData,
  handcraft: handcraftData,
  general: agricultureData, // fallback
};

interface IndustryContextType {
  data: IndustryData;
  industryType: SMEType;
}

const IndustryContext = createContext<IndustryContextType | null>(null);

export function IndustryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const industryType: SMEType = user?.industryType ?? 'agriculture';
  const data = industryDataMap[industryType];

  return (
    <IndustryContext.Provider value={{ data, industryType }}>
      {children}
    </IndustryContext.Provider>
  );
}

export function useIndustry() {
  const ctx = useContext(IndustryContext);
  if (!ctx) throw new Error('useIndustry must be used within IndustryProvider');
  return ctx;
}
