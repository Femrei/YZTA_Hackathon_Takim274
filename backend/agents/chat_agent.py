"""
chat_agent.py — Gemini + Firestore RAG sohbet ajanı
Yeni google-genai SDK kullanıyor (google.generativeai deprecated)
"""

import os
from google import genai
from google.genai import types
from firebase_config import db

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
GEMINI_MODEL = "gemini-2.0-flash"


async def chat_with_context(company_id: str, messages: list) -> dict:
    # 1. Firestore'dan şirket bilgilerini çek
    try:
        company_doc = db.collection("companies").document(company_id).get()
        company = company_doc.to_dict() if company_doc.exists else {}
    except Exception:
        company = {}

    company_name  = company.get("name", "Bilinmeyen Şirket")
    industry_type = company.get("industryType", "general")

    # 2. Kritik stok ürünlerini çek
    try:
        critical_stream = (
            db.collection("products")
            .where("companyId", "==", company_id)
            .where("status", "==", "critical")
            .stream()
        )
        critical_items = []
        for p in critical_stream:
            d = p.to_dict()
            critical_items.append(
                f"{d.get('name','?')} (Mevcut: {d.get('currentStock','?')} {d.get('unit','')}, Min: {d.get('minStockLevel','?')})"
            )
    except Exception:
        critical_items = []

    # 3. Bekleyen siparişleri say
    try:
        pending_stream   = db.collection("orders").where("companyId", "==", company_id).where("status", "==", "pending").stream()
        pending_orders   = list(pending_stream)
        pending_count    = len(pending_orders)
        recent_customers = [o.to_dict().get("customerName", "?") for o in pending_orders[:3]]
    except Exception:
        pending_count    = 0
        recent_customers = []

    # 4. Tüm ürün sayılarını çek
    try:
        all_products   = [p.to_dict() for p in db.collection("products").where("companyId", "==", company_id).stream()]
        total_products = len(all_products)
        excess_count   = sum(1 for p in all_products if p.get("status") == "excess")
        normal_count   = sum(1 for p in all_products if p.get("status") == "normal")
    except Exception:
        total_products = excess_count = normal_count = 0

    # 5. Sistem promptu (RAG)
    critical_lines = "\n".join(f"  - {item}" for item in critical_items) if critical_items else "  - Kritik urun yok"
    customers_line = f"Son bekleyen: {', '.join(recent_customers)}" if recent_customers else ""

    system_prompt = f"""Sen DigiCoBig platformunun AI is danismanisın.
Gorev: Asagidaki GERCEK Firestore verileriyle sirket yoneticisine pratik, kisa ve Turkce tavsiyeler ver.

SIRKET: {company_name} | Sektor: {industry_type}

STOK DURUMU:
Toplam urun: {total_products} | Kritik: {len(critical_items)} | Normal: {normal_count} | Fazla: {excess_count}
Kritik urunler:
{critical_lines}

SIPARIS DURUMU:
Bekleyen siparis: {pending_count} adet
{customers_line}

KURALLAR:
- Kisa ve pratik cevap ver (3-5 cumle)
- Gercek verilerden somut ornek goster
- Turkce yaz
- Ben bir AI'yim deme, sadece danisман gibi davran
"""

    # 6. Mesaj geçmişini Gemini formatına çevir
    history_contents = []
    for msg in messages[:-1]:
        role = "model" if msg["role"] == "assistant" else "user"
        history_contents.append(types.Content(role=role, parts=[types.Part(text=msg["content"])]))

    last_message = messages[-1]["content"] if messages else "Merhaba"

    # 7. Gemini'ye sor (yeni SDK)
    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=history_contents + [types.Content(role="user", parts=[types.Part(text=last_message)])],
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=0.7,
            )
        )
        return {"reply": response.text}
    except Exception as e:
        return {"reply": f"Uzgunum, bir sorun olustu. Lutfen tekrar deneyin. (Hata: {str(e)[:150]})"}
