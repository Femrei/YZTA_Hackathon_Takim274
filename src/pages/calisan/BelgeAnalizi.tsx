import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Upload, Cpu, Sparkles, Eye, Camera,
  Download, Send, CheckCircle2, RefreshCw,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

/* ─── Tipler ──────────────────────────────────────────────────── */
type TabKey = 'belge' | 'goruntu';
interface AnalysisState {
  loading: boolean;
  result: string | null;
  sent: boolean;
}
const EMPTY: AnalysisState = { loading: false, result: null, sent: false };

/* ─── Yardımcılar ─────────────────────────────────────────────── */
function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

async function resizeImage(file: File, maxPx = 800): Promise<string> {
  const base64 = await fileToBase64(file);
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => {
      let { width: w, height: h } = img;
      if (w > h ? w > maxPx : h > maxPx) {
        if (w > h) { h = (h * maxPx) / w; w = maxPx; }
        else       { w = (w * maxPx) / h; h = maxPx; }
      }
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d')?.drawImage(img, 0, 0, w, h);
      res(c.toDataURL('image/jpeg', 0.8));
    };
    img.src = base64;
  });
}

function downloadText(text: string, filename: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/* ─── Sonuç Kutusu ────────────────────────────────────────────── */
function ResultBox({ isDark, state, filename, onSend, onClear, showSend = true }: {
  isDark: boolean;
  state: AnalysisState;
  filename: string;
  onSend: () => void;
  onClear: () => void;
  showSend?: boolean;
}) {
  if (!state.result) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mt-4 p-4 rounded-2xl border text-sm ${
        isDark
          ? 'bg-emerald-900/20 border-emerald-800/40 text-emerald-100'
          : 'bg-emerald-50 border-emerald-200 text-emerald-900'
      }`}
    >
      <div className="flex items-start gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <ReactMarkdown
            components={{
              strong: ({ ...p }) => <strong className={`font-bold ${isDark ? 'text-white' : 'text-emerald-950'}`} {...p} />,
              h3:     ({ ...p }) => <h3 className={`text-base font-bold mt-3 mb-1 ${isDark ? 'text-white' : 'text-emerald-950'}`} {...p} />,
              p:      ({ ...p }) => <p className="mb-2 last:mb-0 leading-relaxed" {...p} />,
              ul:     ({ ...p }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...p} />,
              li:     ({ ...p }) => <li {...p} />,
            }}
          >
            {state.result}
          </ReactMarkdown>
        </div>
      </div>

      <div className={`flex flex-wrap gap-2 pt-2 border-t ${isDark ? 'border-emerald-800/40' : 'border-emerald-200'}`}>
        <button
          onClick={() => downloadText(state.result!, filename)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            isDark
              ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          Analizi İndir
        </button>
        {showSend && (
            <motion.button
            
            onClick={onSend}
            disabled={state.sent}
            whileTap={{ scale: 0.96 }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                state.sent
                ? 'bg-emerald-500 text-white cursor-default'
                : isDark
                    ? 'bg-blue-800/50 text-blue-300 hover:bg-blue-800/80'
                    : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
            }`}
            >
            {state.sent
                ? <><CheckCircle2 className="w-3.5 h-3.5" /> Gönderildi</>
                : <><Send className="w-3.5 h-3.5" /> Muhasebeciye Gönder</>
            }
            </motion.button>)}

            <button
            onClick={onClear}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ml-auto ${
                isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'
            }`}
            >
            <RefreshCw className="w-3.5 h-3.5" />
            Temizle
            </button>
        </div>
        </motion.div>
    );
}

/* ─── Belge Paneli ────────────────────────────────────────────── */
function BelgePanel({ isDark, user }: { isDark: boolean; user: any }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [state, setState] = useState<AnalysisState>(EMPTY);
  const [question, setQuestion] = useState("");

  const handleFile = async (f: File) => {
    const b64 = await fileToBase64(f);
    setFile(b64);
    setState(EMPTY);
  };

  const analyze = async () => {
    if (!file) return;
    setState({ loading: true, result: null, sent: false });
    try {
      const res = await fetch('http://localhost:8000/ai/invoice-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: user?.companyId,
          image_base64: file,
          question: question.trim() ? question.trim() : null,
        }),
      });
      const data = await res.json();
      setState({ loading: false, result: data.analysis || 'Sonuç alınamadı.', sent: false });
    } catch (err: any) {
      setState({ loading: false, result: 'Hata: ' + err.message, sent: false });
    }
  };

  const clear = () => { setFile(null); setState(EMPTY); setQuestion(""); };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
          <FileText className="w-4 h-4 text-slate-500" />
        </div>
        <div>
          <h2 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>Belge / Fatura Analizi</h2>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Fatura, irsaliye veya makbuz yükleyin</p>
        </div>
      </div>

      <div
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        className={`rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
          drag
            ? isDark ? 'border-emerald-500 bg-emerald-900/20' : 'border-emerald-400 bg-emerald-50'
            : isDark ? 'border-slate-600 bg-slate-700/20' : 'border-slate-200 bg-slate-50'
        }`}
      >
        {!file ? (
          <>
            <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <Upload className="w-6 h-6 text-slate-400" />
            </div>
            <p className={`text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Belge yükleyin veya sürükleyin
            </p>
            <p className={`text-xs mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>PNG, JPG, WEBP desteklenir</p>
            <button
              onClick={() => fileRef.current?.click()}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium mx-auto transition-all ${
                isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4" /> Dosya Seç
            </button>
            <input
              ref={fileRef} type="file" accept="image/*" hidden
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </>
        ) : (
          <div className="space-y-3">
            <img src={file} className="max-h-64 mx-auto rounded-xl object-contain" alt="Belge" />
            {state.loading ? (
              <div className="flex items-center justify-center gap-2 py-3">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                  <Cpu className="w-5 h-5 text-emerald-500" />
                </motion.div>
                <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Belge analiz ediliyor...
                </span>
              </div>
            ) : !state.result && (
              <div className="space-y-4">
                <div className="px-4">
                  <input
                    type="text"
                    placeholder="Belgeyle ilgili özel bir sorunuz var mı? (İsteğe bağlı)"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    className={`w-full max-w-md mx-auto px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500 focus:border-emerald-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-emerald-500'}`}
                    onKeyDown={e => { if (e.key === 'Enter') analyze(); }}
                  />
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={analyze}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> AI ile Analiz Et
                </button>
                <button
                  onClick={clear}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Farklı Dosya Seç
                </button>
              </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ResultBox
        isDark={isDark} state={state} filename="belge-analizi.txt"
        onSend={() => setState(s => ({ ...s, sent: true }))}
        onClear={clear}
      />

      <div className={`mt-3 flex items-start gap-2 p-3 rounded-xl ${isDark ? 'bg-blue-900/20 border border-blue-800/30' : 'bg-blue-50 border border-blue-100'}`}>
        <Sparkles className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          <span className="font-semibold">İpucu:</span> Fatura, irsaliye ve makbuzları yükleyin; AI kalemleri, tutarları ve KDV bilgilerini otomatik çıkarır.
        </p>
      </div>
    </Card>
  );
}

/* ─── Görüntü Paneli ──────────────────────────────────────────── */
function GoruntePanel({ isDark, user }: { isDark: boolean; user: any }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [state, setState] = useState<AnalysisState>(EMPTY);

  const handleFile = async (f: File) => {
    if (!f.type.startsWith('image/')) return;
    const b64 = await resizeImage(f);
    setPreview(b64);
    setState(EMPTY);
  };

  const analyze = async () => {
    if (!preview) return;
    setState({ loading: true, result: null, sent: false });
    try {
      const res = await fetch('http://localhost:8000/ai/vision-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: user?.companyId || 'company_1',
          image_base64: preview,
        }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setState({ loading: false, result: 'AI Analizi:\n\n' + data.analysis, sent: false });
      } else {
        setState({ loading: false, result: 'Analiz hatası: ' + (data.detail || data.message || 'Bilinmeyen hata'), sent: false });
      }
    } catch (err: any) {
      setState({ loading: false, result: 'Sunucuya bağlanırken hata: ' + err.message, sent: false });
    }
  };

  const clear = () => { setPreview(null); setState(EMPTY); };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
          <Eye className="w-4 h-4 text-slate-500" />
        </div>
        <div className="flex items-center gap-2">
          <h2 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>Görüntü İşleme Analizi</h2>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isDark ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-100 text-amber-700'}`}>
            Beta
          </span>
        </div>
      </div>

      <div
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        className={`rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
          drag
            ? isDark ? 'border-emerald-500 bg-emerald-900/20' : 'border-emerald-400 bg-emerald-50'
            : isDark ? 'border-slate-600 bg-slate-700/20' : 'border-slate-200 bg-slate-50'
        }`}
      >
        {!preview ? (
          <>
            <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <Upload className="w-6 h-6 text-slate-400" />
            </div>
            <p className={`text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Görsel yükleyin veya sürükleyin
            </p>
            <p className={`text-xs mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>PNG, JPG, WEBP desteklenir</p>
            <button
              onClick={() => fileRef.current?.click()}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium mx-auto transition-all ${
                isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Camera className="w-4 h-4" /> Görsel Seç
            </button>
            <input
              ref={fileRef} type="file" accept="image/*" hidden
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </>
        ) : (
          <div className="space-y-3">
            <div className={`rounded-xl p-2 ${isDark ? 'bg-slate-900/50' : 'bg-slate-100/50'}`}>
              <img src={preview} alt="Görsel" className="w-full max-h-64 object-contain rounded-lg mx-auto" />
            </div>
            {state.loading ? (
              <div className="flex items-center justify-center gap-2 py-3">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                  <Cpu className="w-5 h-5 text-amber-500" />
                </motion.div>
                <span className="text-sm text-amber-600 font-medium">AI görseli analiz ediyor...</span>
              </div>
            ) : !state.result && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={analyze}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Yapay Zeka ile Analiz Et
                </button>
                <button
                  onClick={clear}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Farklı Görsel Seç
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <ResultBox
        isDark={isDark} state={state} filename="goruntu-analizi.txt"
        onSend={() => setState(s => ({ ...s, sent: true }))}
        onClear={clear}
        showSend={false}
      />

      <div className={`mt-3 flex items-start gap-2 p-3 rounded-xl ${isDark ? 'bg-amber-900/20 border border-amber-800/30' : 'bg-amber-50 border border-amber-100'}`}>
        <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          <span className="font-semibold">Aktif Özellik:</span> Multimodal AI ile bitki hastalık teşhisi ve raf ömrü tahmini. Analizler Uzman AI sohbetine otomatik aktarılır.
        </p>
      </div>
    </Card>
  );
}

/* ─── Ana Sayfa ───────────────────────────────────────────────── */
export function BelgeAnalizi() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [tab, setTab] = useState<TabKey>('belge');

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: 'belge',   label: 'Belge Analizi',         icon: FileText },
    { key: 'goruntu', label: 'Görüntü İşleme (Beta)', icon: Eye },
  ];

  return (
    <DashboardLayout title="Belge & Görüntü Analizi">
      <div className="p-6 max-w-3xl mx-auto space-y-6">

        {/* Tab Bar */}
        <div className={`flex gap-1 p-1 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === key
                  ? isDark ? 'bg-slate-700 text-white shadow' : 'bg-white text-slate-800 shadow'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {tab === 'belge'
              ? <BelgePanel isDark={isDark} user={user} />
              : <GoruntePanel isDark={isDark} user={user} />
            }
          </motion.div>
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}