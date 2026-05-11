import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('DigiCoBig_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('DigiCoBig_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Sync stock to external marketplaces (Trendyol, Hepsiburada, N11)
export async function marketplaceSync(params: { marketplace: string; items: number[] }) {
  return new Promise<{ success: boolean; synced: number; marketplace: string }>((resolve) => {
    setTimeout(() => resolve({ success: true, synced: params.items.length, marketplace: params.marketplace }), 1800);
  });
}

// Fetch SME-specific configuration for white-label customization
export async function fetchSMEConfig(smeId: string) {
  return new Promise<{ id: string; name: string; type: string; themeColor: string; features: string[]; aiPersona: string }>((resolve) => {
    setTimeout(() => resolve({ id: smeId, name: 'Ege Kooperatifi', type: 'agriculture', themeColor: '#16a34a', features: ['stock', 'logistics', 'marketplace-sync', 'ai-expert', 'vision-ai'], aiPersona: 'agriculture' }), 600);
  });
}

// ── Ticket Service ──────────────────────────────────────────────────────────

export interface Ticket {
  id: string;
  smeId: string;
  smeName: string;
  subject: string;
  category: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'resolved';
  date: string;
  reply?: string;
  repliedAt?: string;
}

export async function submitTicket(ticket: Omit<Ticket, 'id' | 'status' | 'date'>) {
  return new Promise<Ticket>((resolve) => {
    setTimeout(() => resolve({
      ...ticket,
      id: `TK-${Date.now().toString().slice(-5)}`,
      status: 'open',
      date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }),
    }), 400);
  });
}

export async function replyTicket(ticketId: string, reply: string) {
  return new Promise<{ ticketId: string; reply: string; status: 'resolved' }>((resolve) => {
    setTimeout(() => resolve({ ticketId, reply, status: 'resolved' }), 500);
  });
}

export async function updateTicketStatus(ticketId: string, status: Ticket['status']) {
  return new Promise<{ ticketId: string; status: Ticket['status'] }>((resolve) => {
    setTimeout(() => resolve({ ticketId, status }), 300);
  });
}

// ── SME Theme Service ───────────────────────────────────────────────────────

export interface SMEThemeUpdate {
  smeId: string;
  primaryColor: string;
  secondaryColor: string;
  businessStory?: string;
}

export async function updateSMETheme(update: SMEThemeUpdate) {
  return new Promise<SMEThemeUpdate & { updatedAt: string }>((resolve) => {
    setTimeout(() => resolve({ ...update, updatedAt: new Date().toISOString() }), 600);
  });
}

export async function generateAIPalette(businessStory: string) {
  const palettes: Record<string, { primary: string; secondary: string; label: string }> = {
    agri: { primary: '#16a34a', secondary: '#84cc16', label: 'Doğal Yeşil Palette' },
    tech: { primary: '#2563eb', secondary: '#06b6d4', label: 'Teknoloji Mavisi Palette' },
    craft: { primary: '#b45309', secondary: '#f59e0b', label: 'Zanaatkar Kehribar Palette' },
    ocean: { primary: '#0284c7', secondary: '#0891b2', label: 'Okyanus Mavisi Palette' },
    earth: { primary: '#78350f', secondary: '#d97706', label: 'Toprak Tonu Palette' },
  };
  const story = businessStory.toLowerCase();
  const key = story.includes('tarım') || story.includes('organik') || story.includes('hasat') ? 'agri'
    : story.includes('teknoloji') || story.includes('yazılım') || story.includes('dijital') ? 'tech'
    : story.includes('el sanat') || story.includes('zanaat') || story.includes('kilim') ? 'craft'
    : story.includes('deniz') || story.includes('ihracat') || story.includes('global') ? 'ocean'
    : 'earth';
  return new Promise<{ primary: string; secondary: string; label: string }>((resolve) => {
    setTimeout(() => resolve(palettes[key]), 1400);
  });
}

export default api;
