/**
 * gemini.ts — Akıllı Gemini İstemcisi (Direct REST v1)
 *
 * SDK (@google/generative-ai) v1beta yerine doğrudan v1 REST endpoint.
 * Fallback zinciri: gemini-1.5-flash → gemini-1.5-pro → gemini-1.5-flash-8b → gemini-2.0-flash
 */

// ─── Tip Tanımları ─────────────────────────────────────────────────────────

export type GeminiErrorType =
  | 'missing_api_key'   // .env'de VITE_GEMINI_API_KEY yok veya placeholder
  | 'invalid_api_key'   // 403 — anahtar yanlış
  | 'model_not_found'   // 404 — model bu API versiyonunda yok
  | 'quota_exceeded'    // 429 — rate limit
  | 'network_error'     // fetch başarısız (internet/CORS)
  | 'unknown';

export interface GeminiTestResult {
  success:       boolean;
  model?:        string;
  reply?:        string;
  errorType?:    GeminiErrorType;
  errorMessage?: string;
  triedModels:   string[];
  apiKeyLoaded:  boolean;    // ← API key gerçekten yüklenmiş mi?
  apiKeyPrefix?: string;     // ← Anahtarın ilk 8 karakteri (debug için)
}

// ─── Fallback Zinciri ──────────────────────────────────────────────────────

// ─── Öncelik: gemini-1.5-flash (stabil), sonra diğerleri ──────────────────
const MODEL_FALLBACK_CHAIN = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-1.5-flash-8b',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
] as const;

// v1 endpoint — v1beta'dan daha kararlı
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1/models';

const TEST_PROMPT =
  'Bağlantı testi: Bu mesajı okuyorsan sadece "Sistem Hazır" ve hangi modeli kullandığını yaz.';

// ─── Hata Tipi Çözümleyici (400 dahil) ────────────────────────────────────

function classifyError(status: number, body: string): GeminiErrorType {
  const b = body.toLowerCase();
  // 400: "API key expired" veya "API_KEY_INVALID"
  if (status === 400 && (b.includes('expired') || b.includes('api key') || b.includes('api_key')))
    return 'invalid_api_key';
  if (status === 403 || b.includes('api_key_invalid') || b.includes('permission'))
    return 'invalid_api_key';
  if (status === 404 || b.includes('not found') || b.includes('not supported'))
    return 'model_not_found';
  if (status === 429 || b.includes('quota') || b.includes('rate limit'))
    return 'quota_exceeded';
  return 'unknown';
}

// ─── Tek Model Deneme (Direct REST, minimal payload) ──────────────────────

async function tryModel(modelName: string, apiKey: string, prompt: string): Promise<string> {
  const url = `${GEMINI_BASE}/${modelName}:generateContent?key=${apiKey}`;

  // En sade payload — sadece contents + parts (generationConfig YOK)
  const payload = {
    contents: [
      { parts: [{ text: prompt }] }   // role opsiyonel, kaldırıldı
    ],
  };

  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });

  const bodyText = await res.text();

  if (!res.ok) {
    // Tam hata JSON'ını konsola bas — Google'ın gerçek şikayetini görmek için
    try {
      const errJson = JSON.parse(bodyText);
      console.error(`  📋 [${modelName}] Tam hata objesi:`, JSON.stringify(errJson, null, 2));
    } catch {
      console.error(`  📋 [${modelName}] Ham hata:`, bodyText.slice(0, 400));
    }

    const errType = classifyError(res.status, bodyText);
    const err     = new Error(`HTTP ${res.status}: ${bodyText.slice(0, 300)}`);
    (err as any).geminiErrorType = errType;
    throw err;
  }

  const data = JSON.parse(bodyText);
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '(boş yanıt)';
}

// ─── Ana Test Fonksiyonu ───────────────────────────────────────────────────

export async function testGeminiConnection(): Promise<GeminiTestResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

  // ── 1. API Key kontrolü ──
  console.group('[Gemini] 🔍 Bağlantı testi başlatılıyor…');
  console.log('API Key yüklü mü:', !!apiKey);
  console.log('API Key içeriği (ilk 8 karakter):', apiKey?.slice(0, 8) ?? 'YOK');
  console.log('Placeholder mı?:', apiKey === 'BURAYA_AI_STUDIO_ANAHTARINI_YAPISTIR');

  const apiKeyLoaded = !!apiKey && apiKey !== 'BURAYA_AI_STUDIO_ANAHTARINI_YAPISTIR';

  if (!apiKeyLoaded) {
    const msg = !apiKey
      ? 'VITE_GEMINI_API_KEY .env dosyasında tanımlı değil!'
      : 'VITE_GEMINI_API_KEY hâlâ placeholder — gerçek anahtarı yapıştır ve npm run dev\'i yeniden başlat.';
    console.error('[Gemini] ❌', msg);
    console.groupEnd();
    return {
      success: false, errorType: 'missing_api_key',
      errorMessage: msg, triedModels: [],
      apiKeyLoaded: false, apiKeyPrefix: apiKey?.slice(0, 8),
    };
  }

  console.log('Endpoint:', `${GEMINI_BASE}/<model>:generateContent (v1)`);
  console.log('Fallback zinciri:', MODEL_FALLBACK_CHAIN.join(' → '));

  // ── 2. Fallback zincirini dene ──
  const triedModels: string[] = [];
  let lastErrorType: GeminiErrorType = 'unknown';
  let lastErrorMessage = '';

  for (const modelName of MODEL_FALLBACK_CHAIN) {
    triedModels.push(modelName);
    console.log(`  ⏳ Deneniyor: ${modelName}`);

    try {
      const reply = await tryModel(modelName, apiKey!, TEST_PROMPT);

      console.log(`  ✅ ${modelName} çalıştı! Yanıt:`, reply);
      console.groupEnd();

      return {
        success: true, model: modelName, reply,
        triedModels, apiKeyLoaded: true, apiKeyPrefix: apiKey!.slice(0, 8),
      };

    } catch (err: any) {
      const errType: GeminiErrorType = err.geminiErrorType ?? 'unknown';
      const errMsg  = err.message ?? String(err);

      console.warn(`  ⚠️ ${modelName} → [${errType}] ${errMsg.slice(0, 120)}`);

      lastErrorType    = errType;
      lastErrorMessage = errMsg;

      // Anahtar geçersizse / süresi dolduysa diğer modelleri denemek anlamsız
      if (errType === 'invalid_api_key') {
        console.error('  🛑 API anahtarı geçersiz/süresi dolmuş (400/403) — zincir durduruluyor.');
        console.error('  👉 aistudio.google.com/app/apikey adresinden yeni anahtar al.');
        break;
      }
    }
  }

  console.error('[Gemini] ❌ Tüm modeller başarısız.');
  console.groupEnd();

  return {
    success: false, errorType: lastErrorType,
    errorMessage: lastErrorMessage, triedModels,
    apiKeyLoaded: true, apiKeyPrefix: apiKey!.slice(0, 8),
  };
}

// ─── Genel Sohbet Fonksiyonu ───────────────────────────────────────────────

export async function generateWithFallback(
  prompt: string,
  preferredModel = 'gemini-2.0-flash',
): Promise<{ text: string; model: string }> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
  if (!apiKey || apiKey === 'BURAYA_AI_STUDIO_ANAHTARINI_YAPISTIR') {
    throw new Error('VITE_GEMINI_API_KEY tanımlı değil veya placeholder.');
  }

  const chain = [preferredModel, ...MODEL_FALLBACK_CHAIN.filter(m => m !== preferredModel)];

  for (const modelName of chain) {
    try {
      const text = await tryModel(modelName, apiKey, prompt);
      return { text, model: modelName };
    } catch (err: any) {
      if (err.geminiErrorType === 'invalid_api_key') throw err;
      console.warn(`[Gemini] ${modelName} başarısız, fallback…`);
    }
  }

  throw new Error('Tüm Gemini modelleri başarısız oldu.');
}
