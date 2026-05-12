/**
 * ai.ts — Dinamik Model Keşfi + Çoklu Provider AI Servisi
 *
 * Akış:
 *  1. /v1beta/models endpoint'inden kullanılabilir Gemini modellerini çek
 *  2. "generateContent" destekleyenleri filtrele & öncelik sırasına koy
 *  3. Sırayla dene; v1beta/v1 endpoint'ini modele göre otomatik seç
 *  4. Gemini başarısız → Groq fallback (llama-3.3-70b → mixtral)
 */

// ─── Tip Tanımları ─────────────────────────────────────────────────────────

export type AIProvider = 'gemini' | 'groq' | 'none';

export type AIErrorType =
  | 'missing_api_key'
  | 'invalid_api_key'        // 400/401/403
  | 'quota_exceeded'         // 429
  | 'model_not_found'        // 404
  | 'network_error'
  | 'all_providers_failed'
  | 'unknown';

export interface GeminiModelInfo {
  name:              string;   // "models/gemini-1.5-flash"
  displayName:       string;
  supportedMethods:  string[];
  version:           string;   // "1.5", "2.0" vb.
  endpoint:          'v1' | 'v1beta';
}

export interface AITestResult {
  success:         boolean;
  provider?:       AIProvider;
  model?:          string;
  reply?:          string;
  errorType?:      AIErrorType;
  errorMessage?:   string;
  // Key durumu
  geminiKeyLoaded: boolean;
  groqKeyLoaded:   boolean;
  geminiKeyPrefix?: string;
  groqKeyPrefix?:   string;
  // Keşfedilen modeller
  discoveredModels?: GeminiModelInfo[];
  // Deneme geçmişi
  attempts: { provider: AIProvider; model: string; error?: string; errorType?: AIErrorType }[];
}

// ─── Sabitler ──────────────────────────────────────────────────────────────

/** Listeyi çekerken v1beta kullanıyoruz (tüm modeller burada görünüyor) */
const GEMINI_LIST_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/** Öncelik sırası — listeden bunları önce dene */
const PREFERRED_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro',
];

/** Dinamik liste başarısız olursa kullanılacak statik yedek */
const FALLBACK_STATIC_MODELS = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'];

const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'mixtral-8x7b-32768',
  'llama3-8b-8192',
] as const;

const GROQ_BASE = 'https://api.groq.com/openai/v1/chat/completions';
const TEST_PROMPT = 'Bağlantı testi: Sadece "Sistem Hazır" yaz ve hangi modeli kullandığını belirt.';

// ─── Hata Sınıflandırıcı ───────────────────────────────────────────────────

function classifyStatus(status: number, body: string): AIErrorType {
  const b = body.toLowerCase();
  if (status === 429 || b.includes('quota') || b.includes('rate limit') || b.includes('rate_limit'))
    return 'quota_exceeded';
  if (
    (status === 400 && (b.includes('expired') || b.includes('api_key') || b.includes('api key'))) ||
    status === 401 || status === 403 || b.includes('api_key_invalid') || b.includes('unauthorized')
  ) return 'invalid_api_key';
  if (status === 404 || b.includes('not found') || b.includes('not supported'))
    return 'model_not_found';
  if (status === 0 || b.includes('failed to fetch') || b.includes('networkerror'))
    return 'network_error';
  return 'unknown';
}

// ─── Endpoint Seçici ───────────────────────────────────────────────────────

/**
 * Versiyon numarasına göre doğru endpoint seçer:
 *  - gemini-1.x-* → v1  (stabil, GA)
 *  - gemini-2.x-* → v1beta (önizleme, v1'de bulunamayabilir)
 *  - gemini-3.x-* → v1beta (önizleme)
 *
 * Kural: Eğer model adı "2." veya "3." içeriyorsa v1beta kullan.
 */
function resolveEndpoint(modelName: string): string {
  const isPreview = /gemini-(2|3)\.\d/.test(modelName) ||
                    modelName.includes('2.0') ||
                    modelName.includes('2.5') ||
                    modelName.includes('3.');
  const version = isPreview ? 'v1beta' : 'v1';
  console.log(`  📡 ${modelName} → endpoint: ${version}`);
  return `https://generativelanguage.googleapis.com/${version}/models`;
}

// ─── Dinamik Model Listesi Çek ─────────────────────────────────────────────

/**
 * Google'ın /v1beta/models endpoint'inden API anahtarıyla
 * "generateContent" destekleyen modelleri çeker ve öncelik sırasına koyar.
 */
export async function listGeminiModels(apiKey: string): Promise<GeminiModelInfo[]> {
  console.group('[Gemini] 🔎 Kullanılabilir modeller çekiliyor…');

  try {
    const res = await fetch(`${GEMINI_LIST_URL}?key=${apiKey}&pageSize=100`);
    const raw = await res.text();

    if (!res.ok) {
      console.error('  ❌ Model listesi alınamadı:', res.status, raw.slice(0, 300));
      console.groupEnd();
      return [];
    }

    const data = JSON.parse(raw);
    const allModels: any[] = data.models ?? [];

    // generateContent destekleyenleri filtrele
    const supported = allModels
      .filter(m =>
        Array.isArray(m.supportedGenerationMethods) &&
        m.supportedGenerationMethods.includes('generateContent') &&
        m.name?.includes('gemini') &&
        !m.name?.includes('embedding') &&
        !m.name?.includes('aqa')
      )
      .map((m): GeminiModelInfo => {
        const shortName = m.name.replace('models/', '');
        const isPreview = /gemini-(2|3)\./.test(shortName) || shortName.includes('2.0') || shortName.includes('2.5');
        return {
          name:             shortName,
          displayName:      m.displayName ?? shortName,
          supportedMethods: m.supportedGenerationMethods ?? [],
          version:          m.version ?? '',
          endpoint:         isPreview ? 'v1beta' : 'v1',
        };
      });

    // Öncelik sırasına göre sırala
    const sorted = [
      ...PREFERRED_MODELS
        .map(p => supported.find(m => m.name === p))
        .filter(Boolean) as GeminiModelInfo[],
      ...supported.filter(m => !PREFERRED_MODELS.includes(m.name)),
    ];

    console.log(`  ✅ ${sorted.length} model bulundu (${allModels.length} toplam):`);
    sorted.forEach(m =>
      console.log(`    ${m.endpoint === 'v1beta' ? '🧪' : '✅'} ${m.name} [${m.endpoint}]`)
    );
    console.groupEnd();
    return sorted;

  } catch (err) {
    console.error('  ❌ Model listesi fetch hatası:', err);
    console.groupEnd();
    return [];
  }
}

// ─── Gemini: Tek Model Denemesi ────────────────────────────────────────────

async function tryGemini(model: string, apiKey: string, prompt: string): Promise<string> {
  const base = resolveEndpoint(model);
  const url  = `${base}/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  const raw = await res.text();

  if (!res.ok) {
    const errType = classifyStatus(res.status, raw);
    // Hata sebebini net yazdır
    try {
      const errJson = JSON.parse(raw);
      const reason  = errJson?.error?.message ?? raw.slice(0, 200);
      console.error(
        `  📋 Gemini/${model} [HTTP ${res.status}] [${errType.toUpperCase()}]:`,
        reason
      );
    } catch {
      console.error(`  📋 Gemini/${model} [HTTP ${res.status}] [${errType.toUpperCase()}]:`, raw.slice(0, 300));
    }

    const err: any = new Error(`HTTP ${res.status} (${errType}): ${raw.slice(0, 200)}`);
    err.errType    = errType;
    err.httpStatus = res.status;
    throw err;
  }

  const data = JSON.parse(raw);
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '(boş yanıt)';
}

// ─── Groq: Tek Model Denemesi ──────────────────────────────────────────────

async function tryGroq(model: string, apiKey: string, prompt: string): Promise<string> {
  const res = await fetch(GROQ_BASE, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages:    [{ role: 'user', content: prompt }],
      max_tokens:  150,
      temperature: 0.3,
    }),
  });

  const raw = await res.text();

  if (!res.ok) {
    const errType = classifyStatus(res.status, raw);
    try {
      const errJson = JSON.parse(raw);
      console.error(
        `  📋 Groq/${model} [HTTP ${res.status}] [${errType.toUpperCase()}]:`,
        errJson?.error?.message ?? raw.slice(0, 200)
      );
    } catch {
      console.error(`  📋 Groq/${model} [HTTP ${res.status}]:`, raw.slice(0, 300));
    }
    const err: any = new Error(`HTTP ${res.status} (${errType}): ${raw.slice(0, 200)}`);
    err.errType    = errType;
    err.httpStatus = res.status;
    throw err;
  }

  const data = JSON.parse(raw);
  return data?.choices?.[0]?.message?.content ?? '(boş yanıt)';
}

// ─── Ana Test Fonksiyonu ───────────────────────────────────────────────────

export async function testAIConnection(): Promise<AITestResult> {
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  const groqKey   = import.meta.env.VITE_GROQ_API_KEY   as string | undefined;

  const PLACEHOLDER = 'BURAYA_AI_STUDIO_ANAHTARINI_YAPISTIR';
  const geminiKeyLoaded = !!geminiKey && geminiKey !== PLACEHOLDER;
  const groqKeyLoaded   = !!groqKey   && groqKey   !== 'BURAYA_GROQ_ANAHTARINI_YAPISTIR';

  console.group('[AI] 🔍 Çoklu provider bağlantı testi başlatılıyor');
  console.log('Gemini Key yüklü:', geminiKeyLoaded, '|', geminiKey?.slice(0, 8));
  console.log('Groq Key yüklü:  ', groqKeyLoaded,   '|', groqKey?.slice(0, 8));

  const attempts: AITestResult['attempts'] = [];
  let discoveredModels: GeminiModelInfo[] = [];

  // ── 1. Gemini ─────────────────────────────────────────────────────────────
  if (geminiKeyLoaded) {

    // 1a. Dinamik model keşfi
    discoveredModels = await listGeminiModels(geminiKey!);
    const modelChain = discoveredModels.length > 0
      ? discoveredModels.map(m => m.name)
      : FALLBACK_STATIC_MODELS;

    console.group('  [Gemini] Modeller deneniyor…');
    console.log('  Zincir:', modelChain.join(' → '));

    for (const model of modelChain) {
      console.log(`    ⏳ ${model}`);
      try {
        const reply = await tryGemini(model, geminiKey!, TEST_PROMPT);
        console.log(`    ✅ ${model} BAŞARILI`);
        console.groupEnd(); console.groupEnd();
        return {
          success: true, provider: 'gemini', model, reply,
          geminiKeyLoaded, groqKeyLoaded,
          geminiKeyPrefix: geminiKey!.slice(0, 8),
          groqKeyPrefix:   groqKey?.slice(0, 8),
          discoveredModels,
          attempts: [...attempts, { provider: 'gemini', model }],
        };
      } catch (err: any) {
        const errType: AIErrorType = err.errType ?? 'unknown';
        attempts.push({ provider: 'gemini', model, error: `HTTP ${err.httpStatus ?? '?'}`, errorType: errType });
        if (errType === 'invalid_api_key') {
          console.warn('    🛑 Anahtar geçersiz → Groq\'a geçiliyor.');
          break;
        }
        // quota/model_not_found → bir sonraki modele devam et
        console.warn(`    ⏭️  ${errType === 'quota_exceeded' ? 'Kota doldu' : 'Model bulunamadı'} → sonraki model`);
      }
    }
    console.groupEnd();
    console.warn('  [Gemini] ❌ Tüm modeller başarısız → Groq fallback');
  } else {
    console.warn('  [Gemini] ⏭️ Anahtar yok/placeholder.');
  }

  // ── 2. Groq ───────────────────────────────────────────────────────────────
  if (groqKeyLoaded) {
    console.group('  [Groq] Modeller deneniyor…');
    for (const model of GROQ_MODELS) {
      console.log(`    ⏳ ${model}`);
      try {
        const reply = await tryGroq(model, groqKey!, TEST_PROMPT);
        console.log(`    ✅ Groq/${model} BAŞARILI`);
        console.groupEnd(); console.groupEnd();
        return {
          success: true, provider: 'groq', model, reply,
          geminiKeyLoaded, groqKeyLoaded,
          geminiKeyPrefix: geminiKey?.slice(0, 8),
          groqKeyPrefix:   groqKey!.slice(0, 8),
          discoveredModels,
          attempts: [...attempts, { provider: 'groq', model }],
        };
      } catch (err: any) {
        const errType: AIErrorType = err.errType ?? 'unknown';
        attempts.push({ provider: 'groq', model, error: `HTTP ${err.httpStatus ?? '?'}`, errorType: errType });
        if (errType === 'invalid_api_key') {
          console.warn('    🛑 Groq anahtarı geçersiz.'); break;
        }
      }
    }
    console.groupEnd();
  } else {
    console.warn('  [Groq] ⏭️ Anahtar yok.');
  }

  console.error('[AI] ❌ Tüm providerlar başarısız.');
  console.groupEnd();

  return {
    success: false, provider: 'none',
    errorType: 'all_providers_failed',
    errorMessage: 'Gemini ve Groq providerlarının tamamı başarısız oldu.',
    geminiKeyLoaded, groqKeyLoaded,
    geminiKeyPrefix: geminiKey?.slice(0, 8),
    groqKeyPrefix:   groqKey?.slice(0, 8),
    discoveredModels,
    attempts,
  };
}

// ─── Genel Üretim Fonksiyonu ───────────────────────────────────────────────

export async function generateText(
  prompt: string,
  preferGeminiModel = 'gemini-1.5-flash',
): Promise<{ text: string; provider: AIProvider; model: string }> {
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
  const groqKey   = import.meta.env.VITE_GROQ_API_KEY   as string;

  if (geminiKey && geminiKey !== 'BURAYA_AI_STUDIO_ANAHTARINI_YAPISTIR') {
    // Dinamik liste çek veya statik yedek kullan
    const discovered = await listGeminiModels(geminiKey);
    const chain = discovered.length > 0
      ? [preferGeminiModel, ...discovered.map(m => m.name).filter(n => n !== preferGeminiModel)]
      : [preferGeminiModel, ...FALLBACK_STATIC_MODELS.filter(m => m !== preferGeminiModel)];

    for (const model of chain) {
      try {
        const text = await tryGemini(model, geminiKey, prompt);
        console.log(`[AI] ✅ Gemini/${model} yanıt verdi.`);
        return { text, provider: 'gemini', model };
      } catch (err: any) {
        if (err.errType === 'invalid_api_key') break;
      }
    }
    console.warn('[AI] Gemini başarısız → Groq\'a geçiliyor…');
  }

  if (groqKey && groqKey !== 'BURAYA_GROQ_ANAHTARINI_YAPISTIR') {
    for (const model of GROQ_MODELS) {
      try {
        const text = await tryGroq(model, groqKey, prompt);
        console.log(`[AI] ✅ Groq/${model} ile yanıt alındı.`);
        return { text, provider: 'groq', model };
      } catch (err: any) {
        if (err.errType === 'invalid_api_key') break;
      }
    }
  }

  throw new Error('Gemini ve Groq providerlarının tamamı başarısız oldu.');
}
