import { createContext, useContext, useState, ReactNode } from 'react';
import { Ticket, submitTicket, replyTicket } from '../services/api';

const seedTickets: Ticket[] = [
  { id: 'TK-001', smeId: 'sme-003', smeName: 'TechStart İzmir A.Ş.', subject: 'API entegrasyonu hata veriyor', category: 'Teknik', message: 'Pazaryeri senkronizasyon API\'si 500 hatası döndürüyor. Lütfen kontrol edin.', priority: 'high', status: 'open', date: '10 May 2026' },
  { id: 'TK-002', smeId: 'sme-006', smeName: 'DigiRetail Yazılım', subject: 'Pazaryeri senkronizasyonu çalışmıyor', category: 'Entegrasyon', message: 'Trendyol entegrasyonu 3 gündür pasif, ürünler güncellenemiyor.', priority: 'high', status: 'in-progress', date: '9 May 2026', reply: 'Konuya bakıyoruz, servis tarafında bakım yapılıyor.' },
  { id: 'TK-003', smeId: 'sme-001', smeName: 'Ege Kooperatifi', subject: 'Rapor dışa aktarma hatası', category: 'Raporlama', message: 'Excel formatında rapor indirmeye çalışıyorum ama "Export failed" hatası alıyorum.', priority: 'medium', status: 'open', date: '9 May 2026' },
  { id: 'TK-004', smeId: 'sme-006', smeName: 'DigiRetail Yazılım', subject: 'Kullanıcı izinleri güncellenemiyor', category: 'Hesap', message: 'Çalışan hesabına stok yönetimi yetkisi ekleyemiyorum, hata mesajı geliyor.', priority: 'medium', status: 'resolved', date: '8 May 2026', reply: 'Yetki sistemi güncellendi. Şimdi deneyebilirsiniz.' },
  { id: 'TK-005', smeId: 'sme-005', smeName: 'Batı Anadolu Zeytin Koop.', subject: 'Stok güncelleme yavaş', category: 'Performans', message: 'Stok güncelleme sayfası 15-20 saniye yükleniyor, çok yavaş.', priority: 'low', status: 'open', date: '8 May 2026' },
];

interface SMEThemeState {
  [smeId: string]: { primaryColor: string; secondaryColor: string };
}

interface TicketContextType {
  tickets: Ticket[];
  smeThemes: SMEThemeState;
  addTicket: (data: Omit<Ticket, 'id' | 'status' | 'date'>) => Promise<Ticket>;
  replyToTicket: (ticketId: string, reply: string) => Promise<void>;
  updateSMEThemeState: (smeId: string, primaryColor: string, secondaryColor: string) => void;
  getTicketsBySme: (smeId: string) => Ticket[];
}

const TicketContext = createContext<TicketContextType | null>(null);

export function TicketProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>(seedTickets);
  const [smeThemes, setSmeThemes] = useState<SMEThemeState>({});

  const addTicket = async (data: Omit<Ticket, 'id' | 'status' | 'date'>) => {
    const ticket = await submitTicket(data);
    setTickets(prev => [ticket, ...prev]);
    return ticket;
  };

  const replyToTicket = async (ticketId: string, reply: string) => {
    await replyTicket(ticketId, reply);
    const now = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
    setTickets(prev => prev.map(t =>
      t.id === ticketId ? { ...t, status: 'resolved', reply, repliedAt: now } : t
    ));
  };

  const updateSMEThemeState = (smeId: string, primaryColor: string, secondaryColor: string) => {
    setSmeThemes(prev => ({ ...prev, [smeId]: { primaryColor, secondaryColor } }));
  };

  const getTicketsBySme = (smeId: string) => tickets.filter(t => t.smeId === smeId);

  return (
    <TicketContext.Provider value={{ tickets, smeThemes, addTicket, replyToTicket, updateSMEThemeState, getTicketsBySme }}>
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets() {
  const ctx = useContext(TicketContext);
  if (!ctx) throw new Error('useTickets must be used within TicketProvider');
  return ctx;
}
