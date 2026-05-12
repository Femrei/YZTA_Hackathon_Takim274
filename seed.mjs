// seed.mjs — 3 şirket için Firestore'a test verisi yükler
// Kullanım: node seed.mjs

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(readFileSync("./serviceAccountKey.json", "utf8"));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// KULLANICILAR

const MUSTERI_IDS = [
  "q3Ip9eeMMYej40BiFFuHOXTiga42",
  "OtTHe9wcjCM20kKtyNPxTKqT8zI3",
  "sG3IZP2ru8OAoRq9rrYSWHtxDnG3",
  "HlgIbSeMz9eGMiKGcgOkAQTFU453",
  "1fX4eLGMmkSBNPGKWI1v9ucfLXr2",
  "aYtxrWiUeBXq5vrtePscSKyz9tk2",
  "OV4OTs7IzAXs69YfdObSu8U6fC93",
  "36qg9JTqHtY0P1A7WAfGxLqkoM82",
  "D6gLAsIjbbOlIWJGI7cpTI4Cijl1",
  "BVTAWQnzauWaFfpYtMiw029hbuU2",
];

const TARIM = {
  companyId: "DIGI2026",
  companyName: "Ege Kooperatif",
  industryType: "agriculture",
  adminUid: "eu9HbmTMM5hjWAtG8cpOrKqmybI2",
  employees: ["JDzyRVRFUEUBtXdMj8KCfcblN983", "qlrZOFzfNiSoYpcp5Bdemr3Ljf62"],
};

const TECH = {
  companyId: "TECH2026",
  companyName: "TechTech",
  industryType: "technology",
  adminUid: "8pMEnvBZ6xQeU7UZ99SZT2DElIv1",
  employees: ["2osUjd2kaVfwWhXfhAT3mp3UG2h1", "CXyG9bRYetWUGSfsAKk58muzvjB2"],
};

const SANAT = {
  companyId: "SANAT2026",
  companyName: "Sevgi El Sanatları",
  industryType: "handcraft",
  adminUid: "qGZqW44ZKRdpFCbmp36EK2NuvmY2",
  employees: ["rWPPPpLh21VHT2GAqZ5ATBprScK2", "1sBfoxm6e4MblG0qhhdApLkph3J2"],
};

// YARDIMCI FONKSİYONLAR

function minsAgo(mins) {
  return Timestamp.fromDate(new Date(Date.now() - mins * 60 * 1000));
}

// PRODUCTS

const tarimProducts = [
  { companyId: TARIM.companyId, name: "Ege Sızma Zeytinyağı", sku: "ZY-001", category: "Gıda", currentStock: 12, minStockLevel: 30, aiRecommendedOrder: 80, status: "critical", price: 189.90, unit: "adet", inStock: true, rating: 4.8, reviews: 234, image: "https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking.jpg?auto=compress&cs=tinysrgb&w=400" },
  { companyId: TARIM.companyId, name: "Organik Domates Salçası", sku: "DS-042", category: "Gıda", currentStock: 245, minStockLevel: 50, aiRecommendedOrder: 0, status: "excess", price: 34.50, unit: "adet", inStock: true, rating: 4.6, reviews: 189, image: "https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { companyId: TARIM.companyId, name: "Organik Doğal Bal", sku: "OB-055", category: "Gıda", currentStock: 89, minStockLevel: 30, aiRecommendedOrder: 30, status: "normal", price: 120.00, unit: "kg", inStock: true, rating: 4.8, reviews: 198, image: "https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { companyId: TARIM.companyId, name: "Türk Bademli Lokum", sku: "TL-077", category: "Gıda", currentStock: 134, minStockLevel: 40, aiRecommendedOrder: 0, status: "normal", price: 45.00, unit: "kutu", inStock: true, rating: 4.5, reviews: 345, image: "https://images.pexels.com/photos/5419336/pexels-photo-5419336.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { companyId: TARIM.companyId, name: "Organik Gübre (NPK 20-20-20)", sku: "GU-011", category: "Tarım Girdisi", currentStock: 5, minStockLevel: 20, aiRecommendedOrder: 50, status: "critical", price: 210.00, unit: "torba", inStock: true, rating: 4.3, reviews: 56, image: "https://images.pexels.com/photos/4503273/pexels-photo-4503273.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { companyId: TARIM.companyId, name: "Damla Sulama Borusu", sku: "SB-201", category: "Sulama", currentStock: 3, minStockLevel: 15, aiRecommendedOrder: 20, status: "critical", price: 85.00, unit: "rulo", inStock: true, rating: 4.4, reviews: 78, image: "https://images.pexels.com/photos/1301856/pexels-photo-1301856.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { companyId: TARIM.companyId, name: "Doğal Üzüm Sirkesi", sku: "US-033", category: "Gıda", currentStock: 67, minStockLevel: 25, aiRecommendedOrder: 0, status: "normal", price: 55.00, unit: "şişe", inStock: true, rating: 4.7, reviews: 143, image: "https://images.pexels.com/photos/4033636/pexels-photo-4033636.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { companyId: TARIM.companyId, name: "Taze Sıkılmış Nar Suyu", sku: "NS-088", category: "Gıda", currentStock: 44, minStockLevel: 20, aiRecommendedOrder: 0, status: "normal", price: 75.00, unit: "litre", inStock: true, rating: 4.6, reviews: 112, image: "https://images.pexels.com/photos/8330802/pexels-photo-8330802.jpeg?auto=compress&cs=tinysrgb&w=400" },
];

const techProducts = [
  { companyId: TECH.companyId, name: "Akıllı Ofis Klavyesi", sku: "KL-101", category: "Çevre Birimleri", currentStock: 7, minStockLevel: 15, aiRecommendedOrder: 20, status: "critical", price: 899.00, unit: "adet", inStock: true, rating: 4.7, reviews: 312, image: "https://images.pexels.com/photos/1772123/pexels-photo-1772123.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { companyId: TECH.companyId, name: "Kablosuz Ergonomik Mouse", sku: "MS-205", category: "Çevre Birimleri", currentStock: 4, minStockLevel: 10, aiRecommendedOrder: 15, status: "critical", price: 549.00, unit: "adet", inStock: true, rating: 4.8, reviews: 456, image: "https://images.pexels.com/photos/2115257/pexels-photo-2115257.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { companyId: TECH.companyId, name: "USB-C Hub 7 Port", sku: "HB-033", category: "Aksesuar", currentStock: 23, minStockLevel: 10, aiRecommendedOrder: 0, status: "normal", price: 349.00, unit: "adet", inStock: true, rating: 4.5, reviews: 189, image: "https://images.pexels.com/photos/4219861/pexels-photo-4219861.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { companyId: TECH.companyId, name: "4K Webcam Pro", sku: "WC-077", category: "Kamera", currentStock: 0, minStockLevel: 5, aiRecommendedOrder: 10, status: "critical", price: 1299.00, unit: "adet", inStock: false, rating: 4.9, reviews: 234, image: "https://images.pexels.com/photos/4126743/pexels-photo-4126743.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { companyId: TECH.companyId, name: "Noise Cancelling Kulaklık", sku: "NC-144", category: "Ses", currentStock: 45, minStockLevel: 15, aiRecommendedOrder: 0, status: "excess", price: 2199.00, unit: "adet", inStock: true, rating: 4.8, reviews: 567, image: "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { companyId: TECH.companyId, name: "Mekanik Gaming Klavye", sku: "GK-088", category: "Gaming", currentStock: 18, minStockLevel: 10, aiRecommendedOrder: 0, status: "normal", price: 1599.00, unit: "adet", inStock: true, rating: 4.7, reviews: 289, image: "https://images.pexels.com/photos/1714205/pexels-photo-1714205.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { companyId: TECH.companyId, name: "Monitör Arm Standı", sku: "MA-201", category: "Aksesuar", currentStock: 12, minStockLevel: 8, aiRecommendedOrder: 0, status: "normal", price: 799.00, unit: "adet", inStock: true, rating: 4.6, reviews: 145, image: "https://images.pexels.com/photos/936722/pexels-photo-936722.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { companyId: TECH.companyId, name: "Hızlı Şarj Aleti 65W", sku: "CA-055", category: "Aksesuar", currentStock: 56, minStockLevel: 20, aiRecommendedOrder: 0, status: "excess", price: 299.00, unit: "adet", inStock: true, rating: 4.4, reviews: 412, image: "https://images.pexels.com/photos/4526407/pexels-photo-4526407.jpeg?auto=compress&cs=tinysrgb&w=400" },
];

const sanatProducts = [
  { companyId: SANAT.companyId, name: "Ahşap El Oyması Sehpa", sku: "AH-118", category: "Mobilya", currentStock: 8, minStockLevel: 10, aiRecommendedOrder: 15, status: "critical", price: 2450.00, unit: "adet", inStock: true, rating: 4.9, reviews: 67, image: "https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { companyId: SANAT.companyId, name: "Kapadokya Çömlek Seti", sku: "KC-033", category: "El Sanatları", currentStock: 56, minStockLevel: 20, aiRecommendedOrder: 0, status: "normal", price: 890.00, unit: "set", inStock: true, rating: 4.7, reviews: 112, image: "https://images.pexels.com/photos/2162938/pexels-photo-2162938.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { companyId: SANAT.companyId, name: "Anatolian Kilim (2x3m)", sku: "KL-009", category: "Tekstil", currentStock: 3, minStockLevel: 5, aiRecommendedOrder: 10, status: "critical", price: 7800.00, unit: "adet", inStock: false, rating: 5.0, reviews: 28, image: "https://images.pexels.com/photos/5695887/pexels-photo-5695887.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { companyId: SANAT.companyId, name: "Bakır El İşi Tabak Seti", sku: "BT-201", category: "El Sanatları", currentStock: 23, minStockLevel: 10, aiRecommendedOrder: 0, status: "normal", price: 560.00, unit: "set", inStock: true, rating: 4.7, reviews: 89, image: "https://images.pexels.com/photos/6270541/pexels-photo-6270541.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { companyId: SANAT.companyId, name: "El Yapımı Seramik Kupa", sku: "SK-044", category: "Mutfak", currentStock: 78, minStockLevel: 25, aiRecommendedOrder: 0, status: "excess", price: 185.00, unit: "adet", inStock: true, rating: 4.8, reviews: 203, image: "https://images.pexels.com/photos/1566301/pexels-photo-1566301.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { companyId: SANAT.companyId, name: "Geleneksel Ebru Tablosu", sku: "ET-067", category: "Tablo", currentStock: 14, minStockLevel: 8, aiRecommendedOrder: 0, status: "normal", price: 1250.00, unit: "adet", inStock: true, rating: 4.9, reviews: 45, image: "https://images.pexels.com/photos/1616403/pexels-photo-1616403.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { companyId: SANAT.companyId, name: "Makrome Duvar Süsü", sku: "MD-099", category: "Dekorasyon", currentStock: 2, minStockLevel: 8, aiRecommendedOrder: 12, status: "critical", price: 420.00, unit: "adet", inStock: true, rating: 4.6, reviews: 134, image: "https://images.pexels.com/photos/4992847/pexels-photo-4992847.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { companyId: SANAT.companyId, name: "Ahşap Oyma Çerçeve", sku: "OC-111", category: "Dekorasyon", currentStock: 31, minStockLevel: 12, aiRecommendedOrder: 0, status: "normal", price: 340.00, unit: "adet", inStock: true, rating: 4.5, reviews: 98, image: "https://images.pexels.com/photos/4466492/pexels-photo-4466492.jpeg?auto=compress&cs=tinysrgb&w=400" },
];

// ORDERS 

const tarimOrders = [
  { companyId: TARIM.companyId, customerId: MUSTERI_IDS[0], customerName: "Müşteri 1", items: [{ productId: "ZY-001", name: "Ege Sızma Zeytinyağı", qty: 2, price: 189.90 }], totalAmount: 379.80, status: "pending", createdAt: minsAgo(15) },
  { companyId: TARIM.companyId, customerId: MUSTERI_IDS[1], customerName: "Müşteri 2", items: [{ productId: "OB-055", name: "Organik Doğal Bal", qty: 1, price: 120.00 }, { productId: "TL-077", name: "Türk Bademli Lokum", qty: 3, price: 45.00 }], totalAmount: 255.00, status: "processing", createdAt: minsAgo(60) },
  { companyId: TARIM.companyId, customerId: MUSTERI_IDS[2], customerName: "Müşteri 3", items: [{ productId: "DS-042", name: "Organik Domates Salçası", qty: 5, price: 34.50 }], totalAmount: 172.50, status: "shipped", createdAt: minsAgo(180) },
  { companyId: TARIM.companyId, customerId: MUSTERI_IDS[3], customerName: "Müşteri 4", items: [{ productId: "US-033", name: "Doğal Üzüm Sirkesi", qty: 2, price: 55.00 }], totalAmount: 110.00, status: "delivered", createdAt: minsAgo(1440) },
  { companyId: TARIM.companyId, customerId: MUSTERI_IDS[4], customerName: "Müşteri 5", items: [{ productId: "NS-088", name: "Taze Sıkılmış Nar Suyu", qty: 3, price: 75.00 }], totalAmount: 225.00, status: "pending", createdAt: minsAgo(5) },
];

const techOrders = [
  { companyId: TECH.companyId, customerId: MUSTERI_IDS[5], customerName: "Müşteri 6", items: [{ productId: "KL-101", name: "Akıllı Ofis Klavyesi", qty: 1, price: 899.00 }], totalAmount: 899.00, status: "pending", createdAt: minsAgo(20) },
  { companyId: TECH.companyId, customerId: MUSTERI_IDS[6], customerName: "Müşteri 7", items: [{ productId: "MS-205", name: "Kablosuz Ergonomik Mouse", qty: 2, price: 549.00 }, { productId: "HB-033", name: "USB-C Hub 7 Port", qty: 1, price: 349.00 }], totalAmount: 1447.00, status: "processing", createdAt: minsAgo(90) },
  { companyId: TECH.companyId, customerId: MUSTERI_IDS[7], customerName: "Müşteri 8", items: [{ productId: "NC-144", name: "Noise Cancelling Kulaklık", qty: 1, price: 2199.00 }], totalAmount: 2199.00, status: "shipped", createdAt: minsAgo(240) },
  { companyId: TECH.companyId, customerId: MUSTERI_IDS[0], customerName: "Müşteri 1", items: [{ productId: "CA-055", name: "Hızlı Şarj Aleti 65W", qty: 2, price: 299.00 }], totalAmount: 598.00, status: "delivered", createdAt: minsAgo(1440) },
  { companyId: TECH.companyId, customerId: MUSTERI_IDS[1], customerName: "Müşteri 2", items: [{ productId: "GK-088", name: "Mekanik Gaming Klavye", qty: 1, price: 1599.00 }], totalAmount: 1599.00, status: "pending", createdAt: minsAgo(10) },
];

const sanatOrders = [
  { companyId: SANAT.companyId, customerId: MUSTERI_IDS[2], customerName: "Müşteri 3", items: [{ productId: "SK-044", name: "El Yapımı Seramik Kupa", qty: 3, price: 185.00 }], totalAmount: 555.00, status: "pending", createdAt: minsAgo(30) },
  { companyId: SANAT.companyId, customerId: MUSTERI_IDS[3], customerName: "Müşteri 4", items: [{ productId: "KC-033", name: "Kapadokya Çömlek Seti", qty: 1, price: 890.00 }], totalAmount: 890.00, status: "processing", createdAt: minsAgo(120) },
  { companyId: SANAT.companyId, customerId: MUSTERI_IDS[4], customerName: "Müşteri 5", items: [{ productId: "ET-067", name: "Geleneksel Ebru Tablosu", qty: 1, price: 1250.00 }, { productId: "OC-111", name: "Ahşap Oyma Çerçeve", qty: 2, price: 340.00 }], totalAmount: 1930.00, status: "shipped", createdAt: minsAgo(300) },
  { companyId: SANAT.companyId, customerId: MUSTERI_IDS[5], customerName: "Müşteri 6", items: [{ productId: "BT-201", name: "Bakır El İşi Tabak Seti", qty: 1, price: 560.00 }], totalAmount: 560.00, status: "delivered", createdAt: minsAgo(2880) },
  { companyId: SANAT.companyId, customerId: MUSTERI_IDS[6], customerName: "Müşteri 7", items: [{ productId: "MD-099", name: "Makrome Duvar Süsü", qty: 2, price: 420.00 }], totalAmount: 840.00, status: "pending", createdAt: minsAgo(8) },
];

// NOTIFICATIONS

const tarimNotifications = [
  { companyId: TARIM.companyId, userId: TARIM.employees[0], title: "Yeni sipariş geldi", message: "Müşteri 1 — 2x Ege Sızma Zeytinyağı sipariş verdi", type: "order", read: false, createdAt: minsAgo(15) },
  { companyId: TARIM.companyId, userId: TARIM.employees[0], title: "Yeni sipariş geldi", message: "Müşteri 5 — 3x Taze Sıkılmış Nar Suyu sipariş verdi", type: "order", read: false, createdAt: minsAgo(5) },
  { companyId: TARIM.companyId, userId: TARIM.adminUid, title: "Kritik stok uyarısı", message: "Zeytinyağı stoku kritik seviyede (12 adet). AI sipariş taslağı hazırladı.", type: "warning", read: false, createdAt: minsAgo(20) },
  { companyId: TARIM.companyId, userId: TARIM.adminUid, title: "Kritik stok uyarısı", message: "Organik Gübre stoku kritik seviyede (5 torba). Acil sipariş gerekiyor.", type: "warning", read: false, createdAt: minsAgo(45) },
  { companyId: TARIM.companyId, userId: TARIM.employees[1], title: "Sevkiyat güncellendi", message: "SHK-4821 sevkiyatı yola çıktı - Aras Kargo", type: "info", read: true, createdAt: minsAgo(120) },
];

const techNotifications = [
  { companyId: TECH.companyId, userId: TECH.employees[0], title: "Yeni sipariş geldi", message: "Müşteri 6 — 1x Akıllı Ofis Klavyesi sipariş verdi", type: "order", read: false, createdAt: minsAgo(20) },
  { companyId: TECH.companyId, userId: TECH.employees[0], title: "Yeni sipariş geldi", message: "Müşteri 2 — 1x Mekanik Gaming Klavye sipariş verdi", type: "order", read: false, createdAt: minsAgo(10) },
  { companyId: TECH.companyId, userId: TECH.adminUid, title: "Kritik stok uyarısı", message: "4K Webcam Pro stoku tükendi (0 adet). AI sipariş taslağı hazırladı.", type: "warning", read: false, createdAt: minsAgo(30) },
  { companyId: TECH.companyId, userId: TECH.adminUid, title: "Kritik stok uyarısı", message: "Kablosuz Mouse stoku kritik seviyede (4 adet).", type: "warning", read: true, createdAt: minsAgo(90) },
  { companyId: TECH.companyId, userId: TECH.employees[1], title: "Sevkiyat güncellendi", message: "Noise Cancelling Kulaklık siparişi kargoya verildi - Yurtiçi Kargo", type: "info", read: true, createdAt: minsAgo(240) },
];

const sanatNotifications = [
  { companyId: SANAT.companyId, userId: SANAT.employees[0], title: "Yeni sipariş geldi", message: "Müşteri 3 — 3x El Yapımı Seramik Kupa sipariş verdi", type: "order", read: false, createdAt: minsAgo(30) },
  { companyId: SANAT.companyId, userId: SANAT.employees[0], title: "Yeni sipariş geldi", message: "Müşteri 7 — 2x Makrome Duvar Süsü sipariş verdi", type: "order", read: false, createdAt: minsAgo(8) },
  { companyId: SANAT.companyId, userId: SANAT.adminUid, title: "Kritik stok uyarısı", message: "Makrome Duvar Süsü stoku kritik seviyede (2 adet). AI sipariş taslağı hazırladı.", type: "warning", read: false, createdAt: minsAgo(35) },
  { companyId: SANAT.companyId, userId: SANAT.adminUid, title: "Kritik stok uyarısı", message: "Anatolian Kilim stoku kritik seviyede (3 adet).", type: "warning", read: true, createdAt: minsAgo(180) },
  { companyId: SANAT.companyId, userId: SANAT.employees[1], title: "Görev atandı", message: "Kapadokya Çömlek Seti siparişi için paketleme görevi - deadline 15:00", type: "info", read: false, createdAt: minsAgo(60) },
];

// SEED FONKSİYONU 

async function seedCollection(collectionName, items, label) {
  console.log(`\n${label} yükleniyor...`);
  for (const item of items) {
    await db.collection(collectionName).add(item);
    console.log(`  ✓ ${item.name || item.title || item.message?.slice(0, 40)}`);
  }
}

async function seed() {
  console.log("🌱 Seed başlıyor — 3 şirket, tüm koleksiyonlar\n");

  await seedCollection("products", tarimProducts,      "📦 Tarım ürünleri");
  await seedCollection("products", techProducts,       "📦 Teknoloji ürünleri");
  await seedCollection("products", sanatProducts,      "📦 El sanatları ürünleri");

  await seedCollection("orders", tarimOrders,          "🛒 Tarım siparişleri");
  await seedCollection("orders", techOrders,           "🛒 Teknoloji siparişleri");
  await seedCollection("orders", sanatOrders,          "🛒 El sanatları siparişleri");

  await seedCollection("notifications", tarimNotifications,  "🔔 Tarım bildirimleri");
  await seedCollection("notifications", techNotifications,   "🔔 Teknoloji bildirimleri");
  await seedCollection("notifications", sanatNotifications,  "🔔 El sanatları bildirimleri");

  console.log("\n✅ Tüm veriler Firestore'a yüklendi!");
  console.log(`   📦 ${tarimProducts.length + techProducts.length + sanatProducts.length} ürün`);
  console.log(`   🛒 ${tarimOrders.length + techOrders.length + sanatOrders.length} sipariş`);
  console.log(`   🔔 ${tarimNotifications.length + techNotifications.length + sanatNotifications.length} bildirim`);
}

seed().catch(console.error);
