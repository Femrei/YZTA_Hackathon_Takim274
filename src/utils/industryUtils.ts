import type { SMEType } from '../contexts/SMEContext';

// ── Firestore'dan gelen her türlü industryType değerini geçerli SMEType'a çevir ──
// Kullanıcı Türkçe etiket, büyük harf veya yanlış yazım kaydetmişse sistemi çökertmez
const INDUSTRY_TYPE_MAP: Record<string, SMEType> = {
  // Geçerli kod değerleri (passthrough)
  agriculture: 'agriculture',
  technology:  'technology',
  handcraft:   'handcraft',
  general:     'general',
  // Türkçe etiketler (SMEContext label değerleri)
  'tarım & kooperatif': 'agriculture',
  'tarim & kooperatif': 'agriculture',
  'tarım':              'agriculture',
  'tarim':              'agriculture',
  'teknoloji':          'technology',
  'el sanatları':       'handcraft',
  'el sanatlari':       'handcraft',
  'genel işletme':      'general',
  'genel':              'general',
  // Yaygın kısaltmalar
  'agri':  'agriculture',
  'agr':   'agriculture',
  'tech':  'technology',
  'craft': 'handcraft',
};

/**
 * Firestore'dan okunan ham industryType değerini geçerli SMEType'a normalize eder.
 * Bilinmeyen değerler 'agriculture' fallback'i ile döner, uygulama asla çökmez.
 */
export function normalizeIndustryType(raw: string | undefined | null): SMEType {
  if (!raw) return 'agriculture';
  const key = raw.trim().toLowerCase();
  return INDUSTRY_TYPE_MAP[key] ?? 'agriculture';
}
