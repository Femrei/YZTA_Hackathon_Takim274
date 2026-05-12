/**
 * src/services/firestore.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * DigiCo Firestore Servis Katmanı
 *
 * İçerik:
 *  1. Tip tanımları (FirestoreProduct, FirestoreOrder, FirestoreNotification)
 *  2. Realtime hooks (useProducts, useOrders, useNotifications)
 *  3. Seed fonksiyonu (seedCompanyData) — mockData'yı Firestore'a yükler
 *  4. CRUD yardımcıları (updateStockItem, addOrder, markNotificationRead)
 *
 * Kullanım:
 *   const { products, loading } = useProducts(user.companyId);
 *   await seedCompanyData(user.companyId, user.industryType);
 */

import {
  collection, doc, setDoc, updateDoc, getDocs,
  onSnapshot, query, where, orderBy, serverTimestamp,
  writeBatch, Timestamp,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from './firebase';
import { normalizeIndustryType } from '../utils/industryUtils';

// ─────────────────────────────────────────────────────────────────────────────
// 1. TİP TANIMLARI
// ─────────────────────────────────────────────────────────────────────────────

export interface FirestoreProduct {
  id: string;               // Firestore doc ID
  companyId: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  aiRecommendedOrder: number;
  status: 'critical' | 'normal' | 'excess';
  price: number;
  unit: string;
  updatedAt: Timestamp | null;
}

export interface FirestoreOrder {
  id: string;
  companyId: string;
  customer: string;
  product: string;
  total: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  createdAt: Timestamp | null;
}

export interface FirestoreNotification {
  id: string;
  companyId: string;
  message: string;
  time: string;
  type: 'success' | 'warning' | 'info';
  read: boolean;
  createdAt: Timestamp | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. REALTİME HOOKS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Şirketin stok ürünlerini Firestore'dan realtime olarak dinler.
 * companyId yoksa boş dizi döner (güvenli fallback).
 */
export function useProducts(companyId: string | undefined) {
  const [products, setProducts] = useState<FirestoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'products'),
      where('companyId', '==', companyId),
      orderBy('name')
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreProduct));
        setProducts(items);
        setLoading(false);
      },
      (err) => {
        console.error('[useProducts] Firestore error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [companyId]);

  return { products, loading, error };
}

/**
 * Şirketin siparişlerini Firestore'dan realtime olarak dinler.
 */
export function useOrders(companyId: string | undefined) {
  const [orders, setOrders] = useState<FirestoreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'orders'),
      where('companyId', '==', companyId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreOrder));
        setOrders(items);
        setLoading(false);
      },
      (err) => {
        console.error('[useOrders] Firestore error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [companyId]);

  return { orders, loading, error };
}

/**
 * Kullanıcıya ait bildirimleri Firestore'dan realtime olarak dinler.
 */
export function useNotifications(companyId: string | undefined) {
  const [notifications, setNotifications] = useState<FirestoreNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('companyId', '==', companyId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreNotification));
      setNotifications(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [companyId]);

  return { notifications, loading };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. SEED FONKSİYONU
// ─────────────────────────────────────────────────────────────────────────────

const SEED_PRODUCTS: Record<string, Omit<FirestoreProduct, 'id' | 'companyId' | 'updatedAt'>[]> = {
  agriculture: [
    { name: 'Ege Sızma Zeytinyağı',      sku: 'ZY-001', category: 'Gıda',          currentStock: 12,  aiRecommendedOrder: 80, status: 'critical', price: 189.90, unit: 'adet' },
    { name: 'Organik Domates Salçası',    sku: 'DS-042', category: 'Gıda',          currentStock: 245, aiRecommendedOrder: 0,  status: 'excess',   price: 34.50,  unit: 'adet' },
    { name: 'Organik Doğal Bal',          sku: 'OB-055', category: 'Gıda',          currentStock: 89,  aiRecommendedOrder: 30, status: 'normal',   price: 120.00, unit: 'kg'   },
    { name: 'Organik Gübre (NPK 20-20)', sku: 'GU-011', category: 'Tarım Girdisi', currentStock: 5,   aiRecommendedOrder: 50, status: 'critical', price: 210.00, unit: 'torba'},
    { name: 'Türk Bademli Lokum',         sku: 'TL-077', category: 'Gıda',          currentStock: 134, aiRecommendedOrder: 0,  status: 'normal',   price: 45.00,  unit: 'kutu' },
    { name: 'Damla Sulama Borusu',        sku: 'SB-201', category: 'Sulama',         currentStock: 3,   aiRecommendedOrder: 20, status: 'critical', price: 85.00,  unit: 'rulo' },
  ],
  technology: [
    { name: 'Akıllı Sensör (IoT)',  sku: 'SNS-101',  category: 'Elektronik', currentStock: 8,   aiRecommendedOrder: 50, status: 'critical', price: 450.00,   unit: 'adet' },
    { name: 'İşlemci Birimi (ARM)', sku: 'CPU-ARM7',  category: 'Donanım',   currentStock: 42,  aiRecommendedOrder: 20, status: 'normal',   price: 1200.00,  unit: 'adet' },
    { name: 'SaaS Lisansı - Yıllık',sku: 'LIC-SAS1', category: 'Yazılım',   currentStock: 5,   aiRecommendedOrder: 10, status: 'critical', price: 12000.00, unit: 'adet' },
    { name: 'Ağ Anahtarı (48 Port)',sku: 'NET-SW48',  category: 'Ağ',        currentStock: 150, aiRecommendedOrder: 0,  status: 'excess',   price: 3800.00,  unit: 'adet' },
    { name: 'API Entegrasyon Paketi',sku: 'API-ENT2', category: 'Yazılım',   currentStock: 3,   aiRecommendedOrder: 8,  status: 'critical', price: 8200.00,  unit: 'adet' },
  ],
  handcraft: [
    { name: 'Ebru Sanatı Tablo (50x70)', sku: 'EB-050', category: 'Tablo & Sanat', currentStock: 4,   aiRecommendedOrder: 12, status: 'critical', price: 1850.00, unit: 'adet' },
    { name: 'Seramik Vazo (El Yapımı)',  sku: 'SV-033', category: 'Seramik',       currentStock: 38,  aiRecommendedOrder: 0,  status: 'normal',   price: 640.00,  unit: 'adet' },
    { name: 'Kapadokya Çömlek Seti',    sku: 'KC-033', category: 'Seramik',       currentStock: 56,  aiRecommendedOrder: 20, status: 'normal',   price: 890.00,  unit: 'set'  },
    { name: 'Anatolian Kilim (2x3m)',   sku: 'KL-009', category: 'Tekstil',       currentStock: 3,   aiRecommendedOrder: 10, status: 'critical', price: 7800.00, unit: 'adet' },
    { name: 'Ahşap El Oyması Sehpa',    sku: 'AH-118', category: 'Mobilya',       currentStock: 120, aiRecommendedOrder: 0,  status: 'excess',   price: 2450.00, unit: 'adet' },
  ],
  general: [
    { name: 'Genel Ürün A', sku: 'GEN-001', category: 'Genel', currentStock: 50, aiRecommendedOrder: 20, status: 'normal', price: 100.00, unit: 'adet' },
    { name: 'Genel Ürün B', sku: 'GEN-002', category: 'Genel', currentStock: 5,  aiRecommendedOrder: 30, status: 'critical', price: 250.00, unit: 'adet' },
  ],
};

const SEED_ORDERS: Omit<FirestoreOrder, 'id' | 'companyId' | 'createdAt'>[] = [
  { customer: 'Fatma Yıldız',  product: 'Ege Sızma Zeytinyağı x5',  total: 949.50,  status: 'delivered',  date: '8 Mayıs 2026' },
  { customer: 'Ali Çelik',     product: 'Organik Domates Salçası x10', total: 345.00, status: 'shipped',   date: '8 Mayıs 2026' },
  { customer: 'Zeynep Kara',   product: 'Organik Doğal Bal x3',     total: 360.00,  status: 'processing', date: '7 Mayıs 2026' },
  { customer: 'Murat Yılmaz', product: 'Anatolian Kilim 2x3m',     total: 7800.00, status: 'cancelled',  date: '7 Mayıs 2026' },
];

const SEED_NOTIFICATIONS: Omit<FirestoreNotification, 'id' | 'companyId' | 'createdAt'>[] = [
  { message: 'Stok kritik seviyeye düştü! AI sipariş taslağı hazırladı', time: '08:45', type: 'warning', read: false },
  { message: 'Yeni sipariş alındı — paketleme başlayabilir',              time: '09:15', type: 'success', read: false },
  { message: 'Sevkiyat SHK-4820 yola çıktı',                             time: '08:20', type: 'info',    read: true  },
];

/**
 * Bir şirketin (companyId) tüm demo verisini Firestore'a yükler.
 * Mevcut veriler varsa günceller (setDoc ile merge).
 *
 * @param companyId  Kullanıcının Firestore'daki companyId'si (örn: "EGEKOO2847")
 * @param industryType Firestore'dan gelen ham sektör değeri (normalizeIndustryType ile işlenir)
 * @returns { seeded: number } toplam yazılan döküman sayısı
 */
export async function seedCompanyData(
  companyId: string,
  industryType: string
): Promise<{ seeded: number }> {
  const normalizedType = normalizeIndustryType(industryType);
  const products = SEED_PRODUCTS[normalizedType] ?? SEED_PRODUCTS['agriculture'];
  const batch = writeBatch(db);
  let count = 0;

  // Ürünler
  for (const product of products) {
    const ref = doc(collection(db, 'products'));
    batch.set(ref, {
      ...product,
      companyId,
      updatedAt: serverTimestamp(),
    });
    count++;
  }

  // Siparişler
  for (const order of SEED_ORDERS) {
    const ref = doc(collection(db, 'orders'));
    batch.set(ref, {
      ...order,
      companyId,
      createdAt: serverTimestamp(),
    });
    count++;
  }

  // Bildirimler
  for (const notif of SEED_NOTIFICATIONS) {
    const ref = doc(collection(db, 'notifications'));
    batch.set(ref, {
      ...notif,
      companyId,
      createdAt: serverTimestamp(),
    });
    count++;
  }

  await batch.commit();
  console.log(`[seedCompanyData] ${count} döküman Firestore'a yazıldı (companyId: ${companyId})`);
  return { seeded: count };
}

/**
 * Veri zaten yüklenmiş mi kontrol eder.
 * Admin panelinde "Tekrar seed et" butonunu etkinleştirmek için kullanılır.
 */
export async function hasSeededData(companyId: string): Promise<boolean> {
  const q = query(collection(db, 'products'), where('companyId', '==', companyId));
  const snap = await getDocs(q);
  return !snap.empty;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. CRUD YARDIMCILARı
// ─────────────────────────────────────────────────────────────────────────────

/** Stok miktarını günceller */
export async function updateStockItem(
  productId: string,
  currentStock: number
): Promise<void> {
  const ref = doc(db, 'products', productId);
  const newStatus: FirestoreProduct['status'] =
    currentStock <= 10 ? 'critical' : currentStock >= 100 ? 'excess' : 'normal';
  await updateDoc(ref, {
    currentStock,
    status: newStatus,
    updatedAt: serverTimestamp(),
  });
}

/** Sipariş durumunu günceller */
export async function updateOrderStatus(
  orderId: string,
  status: FirestoreOrder['status']
): Promise<void> {
  await updateDoc(doc(db, 'orders', orderId), { status });
}

/** Bildirimi okundu olarak işaretler */
export async function markNotificationRead(notificationId: string): Promise<void> {
  await updateDoc(doc(db, 'notifications', notificationId), { read: true });
}

/** Yeni sipariş ekler */
export async function addOrder(
  companyId: string,
  order: Omit<FirestoreOrder, 'id' | 'companyId' | 'createdAt'>
): Promise<string> {
  const ref = doc(collection(db, 'orders'));
  await setDoc(ref, { ...order, companyId, createdAt: serverTimestamp() });
  return ref.id;
}
