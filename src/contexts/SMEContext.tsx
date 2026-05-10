import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type SMEType = 'agriculture' | 'technology' | 'handcraft' | 'general';

export interface SMEConfig {
  id: string;
  name: string;
  type: SMEType;
  joinDate: string;
  ownerName: string;
  region: string;
  ticketCount: number;
}

export interface SMETheme {
  primary: string;
  primaryBg: string;
  primaryText: string;
  primaryBorder: string;
  primaryLight: string;
  accent: string;
  accentHex: string;
  label: string;
  icon: string;
}

export const smeThemes: Record<SMEType, SMETheme> = {
  agriculture: {
    primary: 'bg-green-600',
    primaryBg: 'bg-green-50',
    primaryText: 'text-green-700',
    primaryBorder: 'border-green-200',
    primaryLight: 'bg-green-100',
    accent: 'emerald',
    accentHex: '#16a34a',
    label: 'Tarım & Kooperatif',
    icon: '🌾',
  },
  technology: {
    primary: 'bg-blue-600',
    primaryBg: 'bg-blue-50',
    primaryText: 'text-blue-700',
    primaryBorder: 'border-blue-200',
    primaryLight: 'bg-blue-100',
    accent: 'blue',
    accentHex: '#2563eb',
    label: 'Teknoloji',
    icon: '💻',
  },
  handcraft: {
    primary: 'bg-amber-700',
    primaryBg: 'bg-amber-50',
    primaryText: 'text-amber-800',
    primaryBorder: 'border-amber-200',
    primaryLight: 'bg-amber-100',
    accent: 'amber',
    accentHex: '#b45309',
    label: 'El Sanatları',
    icon: '🪵',
  },
  general: {
    primary: 'bg-slate-700',
    primaryBg: 'bg-slate-50',
    primaryText: 'text-slate-700',
    primaryBorder: 'border-slate-200',
    primaryLight: 'bg-slate-100',
    accent: 'slate',
    accentHex: '#334155',
    label: 'Genel İşletme',
    icon: '🏢',
  },
};

export const aiExpertPersonas: Record<SMEType, { title: string; greeting: string; responses: string[] }> = {
  agriculture: {
    title: 'Tarım Uzmanı AI',
    greeting: 'Merhaba! Ben tarım ve kooperatif konularında uzman AI asistanınızım. Gübre, bitki hastalıkları, hasat planlaması veya kooperatif yönetimi hakkında sorularınızı yanıtlarım.',
    responses: [
      'Zeytinyağı üretiminde bu dönem yaprak dölü zararlısına dikkat edin. Biyolojik mücadele için faydalı böcek salımı öneririm.',
      'Gübre planlamanız için toprak analizi yaptırdınız mı? NPK dengesi verimde %30\'a kadar fark yaratabilir.',
      'Bu hafta sulama sıklığını artırmanızı öneririm — 3 günde bir yerine her 2 günde bir.',
      'Kooperatifinizin bu çeyrek performansına göre ürün çeşitlendirmesi ortak başına geliri optimize eder.',
      'Organik sertifika süreci için toprak analizi ve üretim kayıtlarınızı hazır bulundurmanız gerekiyor.',
      'Zeytin hasadında erken hasat yüksek polifenol içeriği sağlar, geç hasat daha yüksek yağ verimi verir.',
      'Hastalık belirtisi olan bitkileri hemen izole edin, komşu parsellere yayılmayı önleyin.',
    ],
  },
  technology: {
    title: 'Teknoloji Uzmanı AI',
    greeting: 'Merhaba! Teknoloji şirketinizin büyümesi için stratejik AI danışmanınızım. Ürün-pazar uyumu, büyüme stratejisi veya teknik mimari hakkında sorularınızı yanıtlarım.',
    responses: [
      'SaaS müşteri edinme maliyetinizi düşürmek için organik SEO + ürün odaklı büyüme (PLG) stratejisi güçlü bir kombinasyon.',
      'Churn oranınızı düşürmek için onboarding sürecinizi ilk 7 günde optimize edin — en kritik dönem bu.',
      'MRR büyümesi için mevcut müşteri tabanınıza upsell/cross-sell oldukça düşük CAC ile gelir artırır.',
      'API-first mimari yaklaşımı entegrasyon ekosistemi oluşturmak için doğru tercih.',
      'Teknik borç yönetimi için sprint başına %20 refactoring kapasitesi ayırmanızı öneririm.',
    ],
  },
  handcraft: {
    title: 'El Sanatları Uzmanı AI',
    greeting: 'Hoşgeldiniz! El sanatları ve geleneksel üretim işletmeniz için uzman AI danışmanınızım. Pazarlama, fiyatlandırma veya ihracat konularında yardımcı olabilirim.',
    responses: [
      'El yapımı ürünleriniz için hikaye anlatımı pazarlaması çok güçlü. Ustanın arka planı ve üretim süreci içerik üretebiliriz.',
      'Etsy ve Not On The High Street gibi platformlar el sanatları için yüksek dönüşüm sağlıyor.',
      'Premium fiyatlandırma için "sertifikalı geleneksel üretim" etiketi ile AB pazarında fark yaratabilirsiniz.',
      'Turistik sezonlarda atölye ziyaretleri + satış kombine modeli hem gelir hem marka bilinirliği artırır.',
      'UNESCO somut olmayan kültürel miras listesindeki geleneksel teknikleri kullanan ürünleriniz ihracat teşvikinden yararlanabilir.',
    ],
  },
  general: {
    title: 'İş Büyüme Uzmanı AI',
    greeting: 'Merhaba! İşletmenizin büyümesi için stratejik danışmanınızım. Satış, operasyonlar, finansman veya dijital dönüşüm konularında yardımcı olabilirim.',
    responses: [
      'Nakit akışı yönetimi KOBİ\'lerin en kritik zorluğu. 13 haftalık nakit akışı tahmini yapıyor musunuz?',
      'Müşteri başı geliri artırmak için mevcut müşterilere değer katan ek hizmetler paketleyebilirsiniz.',
      'Dijital dönüşümde önce süreç otomasyonu, sonra veri analitiği, ardından yapay zeka katmanı önerilen yol haritası.',
      'B2B satışta referans programı ve sektör etkinlikleri en düşük maliyetli müşteri edinme kanalları arasında.',
    ],
  },
};

interface SMEContextType {
  smeType: SMEType;
  setSmeType: (type: SMEType) => void;
  theme: SMETheme;
  smeConfig: SMEConfig;
}

const SMEContext = createContext<SMEContextType | null>(null);

const smeConfigs: Record<SMEType, Omit<SMEConfig, 'type'>> = {
  agriculture: { id: 'sme-001', name: 'Ege Kooperatifi', joinDate: '15 Ocak 2025', ownerName: 'Ayşe Kaya', region: 'İzmir', ticketCount: 3 },
  technology: { id: 'sme-003', name: 'TechStart İzmir A.Ş.', joinDate: '22 Şubat 2025', ownerName: 'Berk Yılmaz', region: 'İzmir', ticketCount: 5 },
  handcraft: { id: 'sme-004', name: 'Kapadokya El Sanatları', joinDate: '10 Mart 2025', ownerName: 'Elif Güneş', region: 'Nevşehir', ticketCount: 0 },
  general: { id: 'sme-007', name: 'DigiCo Demo İşletmesi', joinDate: '1 Mayıs 2025', ownerName: 'Platform Kullanıcısı', region: 'İstanbul', ticketCount: 0 },
};

export function SMEProvider({ children, lockedType }: { children: ReactNode; lockedType?: SMEType }) {
  const [smeType, setSmeTypeState] = useState<SMEType>(lockedType ?? 'agriculture');

  useEffect(() => {
    if (lockedType) setSmeTypeState(lockedType);
  }, [lockedType]);

  const setSmeType = (type: SMEType) => {
    if (!lockedType) setSmeTypeState(type);
  };

  const theme = smeThemes[smeType];
  const smeConfig = { ...smeConfigs[smeType], type: smeType };

  return (
    <SMEContext.Provider value={{ smeType, setSmeType, theme, smeConfig }}>
      {children}
    </SMEContext.Provider>
  );
}

export function useSME() {
  const ctx = useContext(SMEContext);
  if (!ctx) throw new Error('useSME must be used within SMEProvider');
  return ctx;
}
