import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Calendar, Ticket, ChevronRight,
  Building2, CheckCircle, Clock, AlertCircle, Cpu,
  BarChart3, LogOut, Search, Send, X, Palette,
  Wand2, MessageSquare,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { SMEConfig, SMEType, smeThemes } from '../contexts/SMEContext';
import { useTickets } from '../contexts/TicketContext';
import { Ticket as TicketType, generateAIPalette, updateSMETheme } from '../services/api';

const smeList: SMEConfig[] = [
  { id: 'sme-001', name: 'Ege Kooperatifi', type: 'agriculture', joinDate: '15 Ocak 2025', ownerName: 'Ayşe Kaya', region: 'İzmir', ticketCount: 3 },
  { id: 'sme-002', name: 'Anadolu Tekstil San.', type: 'handcraft', joinDate: '3 Şubat 2025', ownerName: 'Kadir Şahin', region: 'Bursa', ticketCount: 1 },
  { id: 'sme-003', name: 'TechStart İzmir A.Ş.', type: 'technology', joinDate: '22 Şubat 2025', ownerName: 'Berk Yılmaz', region: 'İzmir', ticketCount: 5 },
  { id: 'sme-004', name: 'Kapadokya El Sanatları', type: 'handcraft', joinDate: '10 Mart 2025', ownerName: 'Elif Güneş', region: 'Nevşehir', ticketCount: 0 },
  { id: 'sme-005', name: 'Batı Anadolu Zeytin Koop.', type: 'agriculture', joinDate: '28 Mart 2025', ownerName: 'Mehmet Arslan', region: 'Aydın', ticketCount: 2 },
  { id: 'sme-006', name: 'DigiRetail Yazılım', type: 'technology', joinDate: '14 Nisan 2025', ownerName: 'Selin Çelik', region: 'İstanbul', ticketCount: 7 },
  { id: 'sme-007', name: 'Anadolu Bal Kooperatifi', type: 'agriculture', joinDate: '2 Mayıs 2025', ownerName: 'Hasan Demir', region: 'Erzurum', ticketCount: 0 },
];

const typeLabels: Record<SMEType, string> = {
  agriculture: 'Tarım',
  technology: 'Teknoloji',
  handcraft: 'El Sanatları',
  general: 'Genel',
};

const ticketStatusColors = {
  open: 'bg-red-100 text-red-700',
  'in-progress': 'bg-amber-100 text-amber-700',
  resolved: 'bg-emerald-100 text-emerald-700',
};
const ticketStatusLabels = { open: 'Açık', 'in-progress': 'İşlemde', resolved: 'Çözüldü' };
const priorityColors = { high: 'bg-red-100 text-red-700', medium: 'bg-amber-100 text-amber-700', low: 'bg-slate-100 text-slate-600' };
const priorityLabels = { high: 'Yüksek', medium: 'Orta', low: 'Düşük' };

interface ReplyModalProps {
  ticket: TicketType;
  isDark: boolean;
  onClose: () => void;
  onReply: (ticketId: string, reply: string) => Promise<void>;
}

function ReplyModal({ ticket, isDark, onClose, onReply }: ReplyModalProps) {
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!reply.trim()) return;
    setSending(true);
    await onReply(ticket.id, reply.trim());
    setSending(false);
    setSent(true);
    setTimeout(onClose, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}
      >
        <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            <span className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>Talebi Yanıtla</span>
          </div>
          <button onClick={onClose} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{ticket.id}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[ticket.priority]}`}>
                {priorityLabels[ticket.priority]}
              </span>
            </div>
            <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>{ticket.subject}</p>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{ticket.message}</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{ticket.smeName} · {ticket.date}</p>
          </div>

          {sent ? (
            <div className="flex flex-col items-center py-6 gap-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Yanıt gönderildi</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Talep çözüldü olarak işaretlendi.</p>
            </div>
          ) : (
            <>
              <textarea
                value={reply}
                onChange={e => setReply(e.target.value)}
                placeholder="Yanıtınızı buraya yazın..."
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/30 resize-none transition-all ${
                  isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                }`}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  İptal
                </button>
                <button
                  onClick={handleSend}
                  disabled={sending || !reply.trim()}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  {sending ? 'Gönderiliyor...' : 'Yanıt Gönder'}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

interface ThemeConfiguratorProps {
  isDark: boolean;
  smeThemeState: Record<string, { primaryColor: string; secondaryColor: string }>;
  onSaveTheme: (smeId: string, primary: string, secondary: string) => void;
}

function ThemeConfigurator({ isDark, smeThemeState, onSaveTheme }: ThemeConfiguratorProps) {
  const [selectedSmeId, setSelectedSmeId] = useState(smeList[0].id);
  const [primary, setPrimary] = useState('#16a34a');
  const [secondary, setSecondary] = useState('#84cc16');
  const [story, setStory] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiLabel, setAiLabel] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const selectedSme = smeList.find(s => s.id === selectedSmeId)!;

  const handleSelectSme = (smeId: string) => {
    setSelectedSmeId(smeId);
    const savedTheme = smeThemeState[smeId];
    if (savedTheme) {
      setPrimary(savedTheme.primaryColor);
      setSecondary(savedTheme.secondaryColor);
    } else {
      const t = smeThemes[smeList.find(s => s.id === smeId)!.type];
      setPrimary(t?.accentHex ?? '#16a34a');
      setSecondary('#84cc16');
    }
    setSaved(false);
    setAiLabel('');
  };

  const handleAIPalette = async () => {
    if (!story.trim()) return;
    setAiLoading(true);
    const palette = await generateAIPalette(story);
    setPrimary(palette.primary);
    setSecondary(palette.secondary);
    setAiLabel(palette.label);
    setAiLoading(false);
  };

  const handleSave = async () => {
    setSaveLoading(true);
    await updateSMETheme({ smeId: selectedSmeId, primaryColor: primary, secondaryColor: secondary });
    onSaveTheme(selectedSmeId, primary, secondary);
    setSaveLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid lg:grid-cols-5 gap-6">
        {/* SME Picker */}
        <div className="lg:col-span-2 space-y-2">
          <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>KOBİ Seç</h4>
          {smeList.map(sme => {
            const hasCustom = !!smeThemeState[sme.id];
            const t = smeThemes[sme.type];
            return (
              <button
                key={sme.id}
                onClick={() => handleSelectSme(sme.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
                  selectedSmeId === sme.id
                    ? isDark ? 'bg-slate-700 border-slate-500' : 'bg-slate-100 border-slate-300'
                    : isDark ? 'border-slate-700 hover:bg-slate-700/50' : 'border-slate-100 hover:bg-slate-50'
                }`}
              >
                <span className="text-base">{t?.icon ?? '🏢'}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{sme.name}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{typeLabels[sme.type]}</p>
                </div>
                {hasCustom && (
                  <div className="flex gap-1 flex-shrink-0">
                    <div className="w-3 h-3 rounded-full border border-white/30" style={{ background: smeThemeState[sme.id].primaryColor }} />
                    <div className="w-3 h-3 rounded-full border border-white/30" style={{ background: smeThemeState[sme.id].secondaryColor }} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Color Pickers + AI */}
        <div className="lg:col-span-3 space-y-5">
          <div>
            <h4 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Tema Renkleri — {selectedSme.name}
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Birincil Renk', value: primary, onChange: setPrimary },
                { label: 'İkincil Renk', value: secondary, onChange: setSecondary },
              ].map(({ label, value, onChange }) => (
                <div key={label}>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{label}</label>
                  <div className={`flex items-center gap-3 p-3 rounded-xl border ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="relative">
                      <div className="w-10 h-10 rounded-lg border-2 border-white shadow-md" style={{ background: value }} />
                      <input
                        type="color"
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>
                    <div>
                      <p className={`text-sm font-mono font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{value.toUpperCase()}</p>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Renk seçmek için tıkla</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
            <p className={`text-xs font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Önizleme</p>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm" style={{ background: primary }}>
                Birincil Buton
              </button>
              <button className="px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm" style={{ background: secondary }}>
                İkincil Buton
              </button>
              <div className="w-5 h-5 rounded-full border-2 border-white shadow" style={{ background: primary }} />
              <div className="w-5 h-5 rounded-full border-2 border-white shadow" style={{ background: secondary }} />
            </div>
          </div>

          {/* AI Palette */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Wand2 className="w-4 h-4 text-amber-500" />
              <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>AI Palet Önerisi</p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={story}
                onChange={e => setStory(e.target.value)}
                placeholder="İşletme hikayesi (örn: organik tarım, teknoloji girişimi...)"
                className={`flex-1 px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-amber-500/30 ${
                  isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                }`}
              />
              <button
                onClick={handleAIPalette}
                disabled={aiLoading || !story.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white text-sm font-semibold transition-all"
              >
                {aiLoading ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Wand2 className="w-3.5 h-3.5" />
                )}
                Öner
              </button>
            </div>
            {aiLabel && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-xs text-amber-600 font-medium"
              >
                Uygulanan: {aiLabel}
              </motion.p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saveLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-sm font-semibold transition-all"
            >
              {saveLoading ? (
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : saved ? (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Palette className="w-3.5 h-3.5" />
              )}
              {saved ? 'Kaydedildi!' : saveLoading ? 'Kaydediliyor...' : 'Temayı Kaydet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SuperAdmin() {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { tickets, replyToTicket, smeThemes: smeThemeState, updateSMEThemeState } = useTickets();
  const [activeTab, setActiveTab] = useState<'sme' | 'tickets' | 'theme'>('sme');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [replyTarget, setReplyTarget] = useState<TicketType | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  const filteredSMEs = smeList.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.region.toLowerCase().includes(search.toLowerCase()) ||
    s.ownerName.toLowerCase().includes(search.toLowerCase())
  );

  const openTickets = tickets.filter(t => t.status !== 'resolved').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
  const inProgress = tickets.filter(t => t.status === 'in-progress').length;

  const filteredTickets = tickets.filter(t =>
    !search || t.smeName.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <AnimatePresence>
        {replyTarget && (
          <ReplyModal
            ticket={replyTarget}
            isDark={isDark}
            onClose={() => setReplyTarget(null)}
            onReply={async (id, reply) => {
              await replyToTicket(id, reply);
              setReplyTarget(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Top Nav */}
      <header className={`border-b px-6 py-4 flex items-center justify-between ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className={`font-bold text-base tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>DigiCoBig</div>
            <div className="text-xs text-slate-400">Super Admin Paneli</div>
          </div>
          <div className="ml-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-100 text-red-700">
            <Shield className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Platform Yöneticisi</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${isDark ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-slate-600'}`}>
            {isDark ? '☀' : '◑'}
          </button>
          <button
            onClick={() => navigate('/login')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <LogOut className="w-4 h-4" />
            Çıkış
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Building2, label: 'Kayıtlı KOBİ', value: smeList.length, color: 'bg-slate-700' },
            { icon: Ticket, label: 'Açık Destek', value: openTickets, color: 'bg-red-600' },
            { icon: Clock, label: 'İşlemde', value: inProgress, color: 'bg-amber-600' },
            { icon: CheckCircle, label: 'Çözüldü (Bu Ay)', value: resolvedTickets, color: 'bg-emerald-600' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border p-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{s.value}</div>
                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{s.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <div className={`flex border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
            {[
              { key: 'sme' as const, label: 'Kayıtlı KOBİler', icon: Building2 },
              { key: 'tickets' as const, label: 'Destek Talepleri', icon: Ticket, badge: openTickets },
              { key: 'theme' as const, label: 'Tema Yönetimi', icon: Palette },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all ${
                    activeTab === tab.key
                      ? isDark ? 'border-white text-white' : 'border-slate-800 text-slate-800'
                      : isDark ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.badge != null && tab.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white leading-none">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
            {activeTab !== 'theme' && (
              <div className="flex-1 flex items-center justify-end px-4">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-50 border-slate-200'}`}>
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Ara..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="bg-transparent outline-none w-36 text-sm placeholder-slate-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SME List */}
          {activeTab === 'sme' && (
            <div>
              {loading ? (
                <div className="p-6"><div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className={`h-14 rounded-xl animate-pulse ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`} />)}</div></div>
              ) : (
                <>
                  <div className={`grid grid-cols-7 px-6 py-2 text-xs font-semibold uppercase tracking-wider border-b ${isDark ? 'text-slate-500 border-slate-700' : 'text-slate-400 border-slate-100'}`}>
                    <div className="col-span-2">İşletme</div>
                    <div>Sektör</div>
                    <div>Yetkili</div>
                    <div>Bölge</div>
                    <div>Katılım</div>
                    <div>Talepler</div>
                  </div>
                  <div className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-50'}`}>
                    {filteredSMEs.map((sme, idx) => {
                      const t = smeThemes[sme.type];
                      return (
                        <motion.div
                          key={sme.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.04 }}
                          className={`grid grid-cols-7 items-center px-6 py-3.5 transition-colors ${isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'}`}
                        >
                          <div className="col-span-2 flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${t.primaryLight}`}>
                              {t.icon}
                            </div>
                            <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{sme.name}</span>
                          </div>
                          <div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.primaryLight} ${t.primaryText}`}>
                              {typeLabels[sme.type]}
                            </span>
                          </div>
                          <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{sme.ownerName}</div>
                          <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{sme.region}</div>
                          <div className={`flex items-center gap-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            <Calendar className="w-3 h-3" />{sme.joinDate}
                          </div>
                          <div>
                            {sme.ticketCount > 0 ? (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                {sme.ticketCount} bilet
                              </span>
                            ) : (
                              <span className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>—</span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tickets */}
          {activeTab === 'tickets' && (
            <div>
              {loading ? (
                <div className="p-6"><div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className={`h-16 rounded-xl animate-pulse ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`} />)}</div></div>
              ) : (
                <div className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-50'}`}>
                  {filteredTickets.map((ticket, idx) => (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.04 }}
                      className={`flex items-center gap-4 px-6 py-4 transition-colors ${isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'}`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${ticket.status === 'resolved' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                        {ticket.status === 'resolved'
                          ? <CheckCircle className="w-4 h-4 text-emerald-600" />
                          : <AlertCircle className="w-4 h-4 text-red-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-xs font-mono font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{ticket.id}</span>
                          <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{ticket.subject}</span>
                        </div>
                        <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {ticket.smeName} · {ticket.date}
                        </span>
                        {ticket.reply && (
                          <p className={`text-xs mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                            Yanıt verildi: {ticket.reply.slice(0, 60)}{ticket.reply.length > 60 ? '...' : ''}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[ticket.priority]}`}>
                          {priorityLabels[ticket.priority]}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ticketStatusColors[ticket.status]}`}>
                          {ticketStatusLabels[ticket.status]}
                        </span>
                        {ticket.status !== 'resolved' && (
                          <button
                            onClick={() => setReplyTarget(ticket)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all"
                          >
                            <Send className="w-3 h-3" />
                            Yanıtla
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Theme Configurator */}
          {activeTab === 'theme' && (
            <ThemeConfigurator
              isDark={isDark}
              smeThemeState={smeThemeState}
              onSaveTheme={updateSMEThemeState}
            />
          )}
        </div>

        {/* System Health */}
        <div className={`rounded-2xl border p-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-slate-500" />
            <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Platform Sistem Durumu</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'API Gateway', status: 'Çevrimiçi', ok: true },
              { label: 'AI Engine', status: 'Aktif', ok: true },
              { label: 'Veritabanı', status: 'Sağlıklı', ok: true },
              { label: 'Pazaryeri Bağlantısı', status: 'Senkronize', ok: true },
            ].map(s => (
              <div key={s.label} className={`flex items-center gap-2 px-3 py-2 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${s.ok ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                <div>
                  <div className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{s.label}</div>
                  <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{s.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className={`text-center text-xs ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>
          DigiCoBig Super Admin · /super-admin · Sadece platform geliştiricileri için
        </p>
      </div>
    </div>
  );
}
