"""
chat_agent.py — Gemini + Firestore RAG sohbet ajanı
Güncellenmiş: Model Listeleme ve Dinamik Fallback (gemini-1.5-flash -> gemini-pro)
"""

import os
from datetime import datetime
from google import genai
from google.cloud.firestore_v1.base_query import FieldFilter
from firebase_config import db
import traceback

def get_gemini_api_key():
    key = os.getenv("VITE_GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not key:
        print("WARNING: GEMINI_API_KEY is not set in the environment variables.")
    return key

async def chat_with_context(company_id: str, messages: list) -> dict:
    try:
        company_doc = db.collection("companies").document(company_id).get()
        company = company_doc.to_dict() if company_doc.exists else {}
    except Exception:
        company = {}

    company_name  = company.get("name", "Bilinmeyen Şirket")
    industry_type = company.get("industryType", "general")

    try:
        critical_stream = (
            db.collection("products")
            .where(filter=FieldFilter("companyId", "==", company_id))
            .where(filter=FieldFilter("status", "==", "critical"))
            .stream()
        )
        critical_items = []
        for p in critical_stream:
            d = p.to_dict()
            critical_items.append(
                f"{d.get('name','?')} (Mevcut: {d.get('currentStock','?')} {d.get('unit','')}, Min: {d.get('minStockLevel','?')}, Fiyat: {d.get('price','Bilinmiyor')} TL)"
            )
    except Exception:
        critical_items = []

    try:
        pending_stream = (
            db.collection("orders")
            .where(filter=FieldFilter("companyId", "==", company_id))
            .where(filter=FieldFilter("status", "==", "pending"))
            .stream()
        )
        pending_orders   = list(pending_stream)
        pending_count    = len(pending_orders)
        recent_customers = [o.to_dict().get("customerName", "?") for o in pending_orders[:3]]
    except Exception:
        pending_count    = 0
        recent_customers = []

    try:
        all_products_stream = (
            db.collection("products")
            .where(filter=FieldFilter("companyId", "==", company_id))
            .stream()
        )
        all_products   = [p.to_dict() for p in all_products_stream]
        total_products = len(all_products)
        excess_count   = sum(1 for p in all_products if p.get("status") == "excess")
        normal_count   = sum(1 for p in all_products if p.get("status") == "normal")
        
        all_products_lines = "\n".join(
            f"  - {p.get('name','?')} | Stok: {p.get('currentStock','?')} | Fiyat: {p.get('price','Bilinmiyor')} TL"
            for p in all_products
        )
    except Exception:
        total_products = excess_count = normal_count = 0
        all_products_lines = "  - Ürün verisi okunamadı"

    try:
        vision_stream = (
            db.collection("vision_analyses")
            .where(filter=FieldFilter("companyId", "==", company_id))
            .stream()
        )
        # Sadece en güncel analizi alalım
        vision_analyses = sorted([v.to_dict() for v in vision_stream], key=lambda x: x.get("createdAt", ""), reverse=True)
        latest_vision_analysis = vision_analyses[0].get("analysisResult", "") if vision_analyses else ""
    except Exception as e:
        print(f"Vision DB Error: {e}")
        latest_vision_analysis = ""

    current_time = datetime.now().strftime("%d.%m.%Y %H:%M:%S")

    critical_lines = "\n".join(f"  - {item}" for item in critical_items) if critical_items else "  - Kritik urun yok"
    customers_line = f"Son bekleyen: {', '.join(recent_customers)}" if recent_customers else ""

    system_prompt = f"""SU ANKI TARIH VE SAAT: {current_time}

Sen DigiCoBig platformunun AI is danismanisın.
Gorev: Asagidaki GERCEK Firestore verileriyle sirket yoneticisine pratik, kisa ve Turkce tavsiyeler ver.

SIRKET: {company_name} | Sektor: {industry_type}

STOK DURUMU:
Toplam urun: {total_products} | Kritik: {len(critical_items)} | Normal: {normal_count} | Fazla: {excess_count}
Kritik urunler:
{critical_lines}

TUM URUNLER VE FIYATLARI (Katalog):
{all_products_lines}

SIPARIS DURUMU:
Bekleyen siparis: {pending_count} adet
{customers_line}

EN SON YAPILAN GORSEL YAPAY ZEKA ANALIZI:
{latest_vision_analysis if latest_vision_analysis else "Henuz gorsel analizi yapilmamis."}

KURALLAR:
- Kisa ve pratik cevap ver (3-5 cumle)
- Gercek verilerden somut ornek goster
- Turkce yaz
- Ben bir AI'yim deme, sadece danisMAN gibi davran
- Eger son gorsel analizi hakkinda soru gelirse ustteki "EN SON YAPILAN GORSEL YAPAY ZEKA ANALIZI" bolumundeki veriyi kullan.
"""

    conversation_text = system_prompt + "\n\nSOHBET GECMISI:\n"
    for msg in messages:
        role = "Asistan" if msg["role"] == "assistant" else "Kullanıcı"
        conversation_text += f"{role}: {msg['content']}\n"
    conversation_text += "Asistan:"

    try:
        api_key = get_gemini_api_key()
        
        # v1 zorlaması kaldırıldı, SDK varsayılanı olan v1beta'ya izin veriyoruz.
        client = genai.Client(api_key=api_key)
        
        print("\n" + "="*50)
        print("--- GEMINI MODEL LISTESI (CLIENT TARAFINDAN GORULEN) ---")
        try:
            available_models = [m.name for m in client.models.list()]
            print("Mevcut Modeller:")
            for m in available_models:
                print(f" - {m}")
        except Exception as list_err:
            print(f"Modeller listelenemedi: {list_err}")
        print("="*50 + "\n")

        # Yeni API anahtarinizin ücretsiz kotasina uyan TEK model bu:
        model_name = "gemini-2.0-flash"
        
        print(f">>> İstek atılan model ismi: {model_name} (Endpoint: v1beta)")
        
        max_retries = 3
        last_err_str = ""
        
        import time
        for attempt in range(max_retries):
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=conversation_text
                )
                
                if not response.text:
                    return {"reply": f"Model ({model_name}) cevap verdi ama metin boş veya filtrelendi."}

                print(f"+++ BASARILI! {model_name} modeli ile cevap alindi. +++\n")
                return {"reply": response.text}
                
            except Exception as e:
                err_str = str(e)
                last_err_str = err_str
                print(f"--- HATA ({model_name}) Deneme {attempt+1}/{max_retries}: {err_str[:100]}")
                
                if "503" in err_str:
                    print("Google sunuculari yogun (503). 2 saniye bekleniyor ve tekrar denenecek...")
                    time.sleep(2)
                    continue
                else:
                    # Eger 503 disinda baska bir hataysa (orn 429, 404), direk kir ve raporla
                    break
        
        return {"reply": f"Sistem Yogundur. Google Sunuculari anlik yanit veremedi. Lutfen 10-15 saniye sonra tekrar sorunuz. (Son Hata: {last_err_str[:150]})"}
        
    except Exception as e:
        print("\n" + "="*50)
        print("--- BEKLENMEYEN BASLATMA HATASI ---")
        print(f"Hata detayi: {str(e)}")
        traceback.print_exc()
        print("="*50 + "\n")
        return {"reply": f"Beklenmeyen bir baslatma hatasi olustu: {str(e)[:150]}"}
