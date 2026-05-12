/**
 * GeminiTestButton.tsx — Dinamik Model Listeli AI Test UI
 * 3 sekme: Test Sonucu | 💬 Soru Sor | Modeller
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  testAIConnection,
  listGeminiModels,
  generateText,
  type AITestResult,
  type AIProvider,
  type GeminiModelInfo,
} from '../services/ai';

// ─── Sabitler ──────────────────────────────────────────────────────────────

const ERROR_HINTS: Record<string, string> = {
  missing_api_key:      '.env dosyanda anahtar placeholder. Ctrl+C → npm run dev ile yeniden başlat.',
  invalid_api_key:      'Anahtar geçersiz (400/401/403). aistudio.google.com/app/apikey adresinden yeni anahtar al.',
  quota_exceeded:       'Kota doldu (429). Birkaç dakika bekle ya da Groq fallback devreye girecek.',
  model_not_found:      'Model bulunamadı (404). API keşfi çalışmıyor olabilir.',
  all_providers_failed: 'Gemini ve Groq\'un ikisi de başarısız. F12 → Console sekmesini incele.',
  network_error:        'Sunucuya ulaşılamıyor. İnternet / VPN bağlantını kontrol et.',
  unknown:              'Bilinmeyen hata. F12 → Console sekmesinde tam detayı gör.',
};

const PROVIDER_LABEL: Record<AIProvider, string> = {
  gemini: '⚡ Gemini', groq: '🦙 Groq', none: '❌ Yok',
};
const PROVIDER_COLOR: Record<AIProvider, string> = {
  gemini: '#059669', groq: '#7c3aed', none: '#dc2626',
};

type PanelTab = 'result' | 'chat' | 'models';
type State    = 'idle' | 'loading' | 'success' | 'error';

interface ChatMsg { role: 'user' | 'ai'; text: string; model?: string; provider?: AIProvider }

// ─── Bileşen ───────────────────────────────────────────────────────────────

export function GeminiTestButton() {
  const [state,    setState]    = useState<State>('idle');
  const [result,   setResult]   = useState<AITestResult | null>(null);
  const [open,     setOpen]     = useState(false);
  const [tab,      setTab]      = useState<PanelTab>('result');
  const [models,   setModels]   = useState<GeminiModelInfo[]>([]);
  const [fetching, setFetching] = useState(false);

  // Serbest soru chat
  const [chatMsgs,    setChatMsgs]    = useState<ChatMsg[]>([]);
  const [chatInput,   setChatInput]   = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Ana bağlantı testi
  const handleTest = async () => {
    setState('loading');
    setResult(null);
    setOpen(true);
    setTab('result');
    const res = await testAIConnection();
    setResult(res);
    if (res.discoveredModels?.length) setModels(res.discoveredModels);
    setState(res.success ? 'success' : 'error');
  };

  // Model listesi çek
  const handleFetchModels = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
    if (!apiKey || apiKey === 'BURAYA_AI_STUDIO_ANAHTARINI_YAPISTIR') return;
    setFetching(true);
    setOpen(true);
    setTab('models');
    const list = await listGeminiModels(apiKey);
    setModels(list);
    setFetching(false);
  };

  // Serbest soru gönder
  const handleChatSend = async () => {
    const q = chatInput.trim();
    if (!q || chatLoading) return;
    setChatInput('');
    setChatLoading(true);
    setChatMsgs(prev => [...prev, { role: 'user', text: q }]);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    try {
      const { text, provider, model } = await generateText(q);
      setChatMsgs(prev => [...prev, { role: 'ai', text, provider, model }]);
    } catch (err: any) {
      setChatMsgs(prev => [...prev, {
        role: 'ai',
        text: `❌ Hata: ${err.message?.slice(0, 150) ?? 'Bilinmeyen hata'}`,
      }]);
    } finally {
      setChatLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => { setState('idle'); setResult(null); }, 300);
  };

  const btnCfg = {
    idle:    { bg: 'linear-gradient(135deg,#1e293b,#334155)', label: '🤖 AI Bağlantısını Test Et' },
    loading: { bg: 'linear-gradient(135deg,#78350f,#d97706)', label: '⏳ Test ediliyor…'          },
    success: { bg: 'linear-gradient(135deg,#065f46,#059669)', label: '✅ API Aktif'               },
    error:   { bg: 'linear-gradient(135deg,#7f1d1d,#dc2626)', label: '❌ Tekrar Dene'             },
  }[state];

  const cardBg   = '#0f172a';
  const cardBord = state === 'success' ? '#166534' : state === 'error' ? '#7f1d1d'
                 : state === 'loading' ? '#92400e' : '#334155';

  const TABS: { key: PanelTab; label: string }[] = [
    { key: 'result', label: '📊 Test'                       },
    { key: 'chat',   label: `💬 Soru Sor`                   },
    { key: 'models', label: `🔎 Modeller (${models.length})` },
  ];

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8,
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* ── Panel ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.94 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: 8,  scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              width: 370, background: cardBg,
              border: `1px solid ${cardBord}`,
              borderRadius: 16, overflow: 'hidden',
              color: '#fff', boxShadow: '0 8px 40px rgba(0,0,0,0.65)',
            }}
          >
            {/* ── Sekmeler ── */}
            <div style={{ display:'flex', borderBottom:`1px solid ${cardBord}`, background:'rgba(0,0,0,0.3)' }}>
              {TABS.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)} style={{
                  flex:1, padding:'9px 0', fontSize:11, fontWeight:600,
                  background:'none', border:'none', cursor:'pointer',
                  color: tab === t.key ? '#fff' : '#64748b',
                  borderBottom: tab === t.key ? '2px solid #f59e0b' : '2px solid transparent',
                  transition:'color 0.15s',
                }}>
                  {t.label}
                </button>
              ))}
              <button onClick={handleClose} style={{
                background:'none', border:'none', color:'#64748b',
                cursor:'pointer', padding:'0 12px', fontSize:16,
              }}>✕</button>
            </div>

            {/* ══ SEKME: Test Sonucu ══════════════════════════════════════ */}
            {tab === 'result' && (
              <div style={{ padding:'14px 16px' }}>
                {result && (
                  <div style={{ display:'flex', gap:6, marginBottom:10, flexWrap:'wrap' }}>
                    <KeyBadge label="Gemini" loaded={result.geminiKeyLoaded} prefix={result.geminiKeyPrefix} />
                    <KeyBadge label="Groq"   loaded={result.groqKeyLoaded}   prefix={result.groqKeyPrefix}   />
                  </div>
                )}

                {state === 'loading' && (
                  <div style={{ fontSize:11, color:'#94a3b8', lineHeight:1.8 }}>
                    <div>① /v1beta/models → model listesi çekiliyor…</div>
                    <div>② En iyi Gemini modeli deneniyor</div>
                    <div>③ Başarısız → Groq fallback</div>
                    <motion.div animate={{ opacity:[0.4,1,0.4] }} transition={{ duration:1.4, repeat:Infinity }}
                      style={{ marginTop:6, color:'#f59e0b', fontWeight:600 }}>
                      ● İstekler gönderiliyor…
                    </motion.div>
                  </div>
                )}

                {state === 'success' && result && (
                  <>
                    <div style={{
                      display:'inline-flex', alignItems:'center', gap:6,
                      background: PROVIDER_COLOR[result.provider ?? 'none'] + '33',
                      border:`1px solid ${PROVIDER_COLOR[result.provider ?? 'none']}55`,
                      borderRadius:8, padding:'4px 10px', fontSize:12, fontWeight:600, marginBottom:8,
                    }}>
                      {PROVIDER_LABEL[result.provider ?? 'none']} · {result.model}
                      {result.provider === 'gemini' && (
                        <span style={{ fontSize:9, opacity:0.7, marginLeft:4 }}>
                          [{result.discoveredModels?.find(m => m.name === result.model)?.endpoint ?? 'v1beta'}]
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontSize:12, color:'#d1fae5', background:'#052e16',
                      borderRadius:8, padding:'10px 12px', lineHeight:1.7, marginBottom:8,
                    }}>
                      {result.reply}
                    </div>
                    <div style={{ fontSize:10, color:'#6ee7b7' }}>
                      ✅ Bağlantı doğrulandı — gerçek Gemini yanıtı
                    </div>
                    <button onClick={() => { setTab('chat'); setOpen(true); }} style={{
                      marginTop:8, background:'linear-gradient(135deg,#4c1d95,#7c3aed)',
                      border:'none', borderRadius:8, padding:'6px 12px',
                      color:'#fff', fontSize:11, fontWeight:700, cursor:'pointer',
                    }}>
                      💬 Şimdi bir şey sor →
                    </button>
                  </>
                )}

                {state === 'error' && result && (
                  <>
                    <div style={{
                      fontSize:12, color:'#fca5a5', background:'#450a0a',
                      borderRadius:8, padding:'8px 10px', lineHeight:1.6, marginBottom:8,
                    }}>
                      <strong>💡 Ne yapmalısın?</strong><br />
                      {ERROR_HINTS[result.errorType ?? 'unknown']}
                    </div>
                    {result.attempts.length > 0 && (
                      <div style={{ fontSize:10, color:'#94a3b8', lineHeight:1.9 }}>
                        <strong style={{ color:'#e2e8f0', fontSize:11 }}>📋 Deneme Geçmişi:</strong>
                        {result.attempts.map((a, i) => (
                          <div key={i} style={{ paddingLeft:8 }}>
                            <span style={{ color: PROVIDER_COLOR[a.provider] }}>{PROVIDER_LABEL[a.provider]}</span>
                            {' '}/{' '}{a.model.split('-').slice(0,3).join('-')}
                            {a.errorType && (
                              <span style={{
                                color: a.errorType === 'quota_exceeded' ? '#fb923c'
                                     : a.errorType === 'model_not_found' ? '#a78bfa' : '#f87171',
                                marginLeft:4,
                              }}>
                                → {a.errorType === 'quota_exceeded'  ? '⏱️ Kota'
                                 : a.errorType === 'model_not_found' ? '🚫 Bulunamadı'
                                 : a.errorType === 'invalid_api_key' ? '🔑 Geçersiz Key'
                                 : `❌ ${a.error}`}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {state === 'idle' && (
                  <p style={{ fontSize:11, color:'#64748b', margin:0 }}>
                    "AI Bağlantısını Test Et" butonuna bas — model listesi çekilecek ve ilk çalışan modelle bağlantı doğrulanacak.
                  </p>
                )}
              </div>
            )}

            {/* ══ SEKME: Serbest Soru ══════════════════════════════════════ */}
            {tab === 'chat' && (
              <div style={{ display:'flex', flexDirection:'column', height:320 }}>
                {/* Mesaj alanı */}
                <div style={{ flex:1, overflowY:'auto', padding:'12px 14px', display:'flex', flexDirection:'column', gap:8 }}>
                  {chatMsgs.length === 0 && (
                    <div style={{ fontSize:11, color:'#64748b', textAlign:'center', marginTop:40 }}>
                      Gemini'ye istediğin soruyu sor 👇
                    </div>
                  )}
                  {chatMsgs.map((m, i) => (
                    <div key={i} style={{ display:'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth:'85%', fontSize:12, lineHeight:1.6,
                        padding:'8px 12px', borderRadius:12,
                        background: m.role === 'user' ? '#1e40af' : '#052e16',
                        color: m.role === 'user' ? '#bfdbfe' : '#d1fae5',
                      }}>
                        {m.text}
                        {m.role === 'ai' && m.model && (
                          <div style={{ fontSize:9, marginTop:4, opacity:0.6 }}>
                            {PROVIDER_LABEL[m.provider ?? 'gemini']} · {m.model}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div style={{ display:'flex', justifyContent:'flex-start' }}>
                      <motion.div animate={{ opacity:[0.4,1,0.4] }} transition={{ duration:1.2, repeat:Infinity }}
                        style={{ fontSize:11, color:'#f59e0b', padding:'8px 12px',
                          background:'rgba(245,158,11,0.1)', borderRadius:10 }}>
                        ⚡ Gemini düşünüyor…
                      </motion.div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div style={{
                  borderTop:'1px solid #1e293b', padding:'10px 12px',
                  display:'flex', gap:8, background:'rgba(0,0,0,0.2)',
                }}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSend(); } }}
                    placeholder="Herhangi bir soru sor…"
                    disabled={chatLoading}
                    style={{
                      flex:1, background:'#1e293b', border:'1px solid #334155',
                      borderRadius:8, padding:'7px 10px', color:'#e2e8f0',
                      fontSize:12, outline:'none',
                    }}
                  />
                  <button
                    onClick={handleChatSend}
                    disabled={!chatInput.trim() || chatLoading}
                    style={{
                      background: chatLoading ? '#374151' : 'linear-gradient(135deg,#065f46,#059669)',
                      border:'none', borderRadius:8, padding:'7px 14px',
                      color:'#fff', fontSize:12, fontWeight:700,
                      cursor: chatLoading ? 'wait' : 'pointer',
                    }}
                  >
                    {chatLoading ? '⏳' : '➤'}
                  </button>
                </div>
              </div>
            )}

            {/* ══ SEKME: Modeller ══════════════════════════════════════════ */}
            {tab === 'models' && (
              <div style={{ padding:'12px 14px' }}>
                {fetching && (
                  <motion.div animate={{ opacity:[0.5,1,0.5] }} transition={{ duration:1.2, repeat:Infinity }}
                    style={{ fontSize:12, color:'#f59e0b', marginBottom:8 }}>
                    ⏳ /v1beta/models sorgulanıyor…
                  </motion.div>
                )}
                {!fetching && models.length === 0 && (
                  <div style={{ fontSize:11, color:'#64748b' }}>
                    Henüz model listesi çekilmedi.{' '}
                    <button onClick={handleFetchModels} style={{
                      background:'none', border:'none', color:'#f59e0b',
                      cursor:'pointer', fontSize:11, textDecoration:'underline',
                    }}>Şimdi çek</button>
                  </div>
                )}
                {models.length > 0 && (
                  <div style={{ maxHeight:280, overflowY:'auto' }}>
                    <div style={{ fontSize:10, color:'#94a3b8', marginBottom:8 }}>
                      {models.length} model — key: {(import.meta.env.VITE_GEMINI_API_KEY as string)?.slice(0,8)}…
                    </div>
                    {models.map((m, i) => (
                      <div key={m.name} style={{
                        display:'flex', alignItems:'center', gap:8,
                        padding:'5px 6px', borderRadius:6, marginBottom:2,
                        background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
                      }}>
                        <span style={{
                          fontSize:9, padding:'1px 5px', borderRadius:4, fontWeight:700,
                          background: m.endpoint === 'v1' ? '#064e3b' : '#4c1d95',
                          color:      m.endpoint === 'v1' ? '#6ee7b7' : '#c4b5fd',
                        }}>{m.endpoint}</span>
                        <span style={{ fontSize:11, color:'#e2e8f0', flex:1 }}>{m.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Yardımcı Butonlar ─────────────────────────────────────────────── */}
      <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
        onClick={handleFetchModels}
        style={{
          background:'rgba(30,41,59,0.9)', color:'#94a3b8',
          border:'1px solid #334155', borderRadius:10, padding:'6px 12px',
          fontSize:11, fontWeight:600, cursor:'pointer',
          boxShadow:'0 2px 10px rgba(0,0,0,0.3)',
        }}>
        🔎 Modelleri Listele
      </motion.button>

      {/* ── Ana Buton ──────────────────────────────────────────────────────── */}
      <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
        onClick={state === 'loading' ? undefined : handleTest}
        style={{
          background: btnCfg.bg, color:'#fff',
          border:'1px solid rgba(255,255,255,0.12)',
          borderRadius:12, padding:'10px 18px',
          fontSize:13, fontWeight:700,
          cursor: state === 'loading' ? 'wait' : 'pointer',
          boxShadow:'0 4px 20px rgba(0,0,0,0.4)',
          display:'flex', alignItems:'center', gap:8,
        }}>
        {state === 'loading' ? (
          <>
            <motion.span animate={{ rotate:360 }}
              transition={{ duration:1, repeat:Infinity, ease:'linear' }}
              style={{ display:'inline-block' }}>⚙️</motion.span>
            Test ediliyor…
          </>
        ) : btnCfg.label}
      </motion.button>
    </div>
  );
}

// ─── KeyBadge ──────────────────────────────────────────────────────────────

function KeyBadge({ label, loaded, prefix }: { label: string; loaded: boolean; prefix?: string }) {
  return (
    <div style={{
      fontSize:10, padding:'3px 8px', borderRadius:6,
      background: loaded ? 'rgba(5,150,105,0.15)' : 'rgba(220,38,38,0.15)',
      border:`1px solid ${loaded ? '#059669' : '#dc2626'}44`,
      color: loaded ? '#86efac' : '#fca5a5',
    }}>
      {loaded ? '🔑' : '❌'} {label}{loaded && prefix ? ` (${prefix}…)` : ''}
    </div>
  );
}
