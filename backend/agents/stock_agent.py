"""
stock_agent.py — Gemini Function Calling ile stok analiz ajanı
Yeni google-genai SDK kullanıyor
"""

import os
import json
from google import genai
from google.genai import types
from firebase_config import db

GEMINI_MODEL = "gemini-flash-lite-latest"

def get_client():
    key = os.getenv("VITE_GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY")
    return genai.Client(api_key=key)




# ── ARAÇ FONKSİYONLARI ──────────────────────────────────────────────────────

def get_stock_levels(company_id: str) -> list:
    try:
        docs = db.collection("products").where("companyId", "==", company_id).stream()
        result = []
        for d in docs:
            data = d.to_dict()
            result.append({
                "name":         data.get("name", "?"),
                "currentStock": data.get("currentStock", 0),
                "minStock":     data.get("minStockLevel", 30),
                "unit":         data.get("unit", "adet"),
                "status":       data.get("status", "normal"),
                "category":     data.get("category", ""),
            })
        return result
    except Exception as e:
        return [{"error": str(e)}]


def get_pending_orders(company_id: str) -> list:
    try:
        docs = (
            db.collection("orders")
            .where("companyId", "==", company_id)
            .where("status", "in", ["pending", "processing"])
            .stream()
        )
        result = []
        for d in docs:
            data = d.to_dict()
            result.append({
                "customerName": data.get("customerName", "?"),
                "totalAmount":  data.get("totalAmount", 0),
                "status":       data.get("status", "pending"),
                "items":        data.get("items", []),
            })
        return result
    except Exception as e:
        return [{"error": str(e)}]


# ── ARAÇ TANIMLARI (yeni SDK formatı) ───────────────────────────────────────

stock_tool_declarations = [
    types.FunctionDeclaration(
        name="get_stock_levels",
        description="Sirketin tum urun stok seviyelerini, kritik urunleri ve fazla stok bilgisini getirir.",
        parameters=types.Schema(
            type=types.Type.OBJECT,
            properties={
                "company_id": types.Schema(type=types.Type.STRING, description="Firestore sirket belgesi ID'si")
            },
            required=["company_id"]
        )
    ),
    types.FunctionDeclaration(
        name="get_pending_orders",
        description="Sirketin bekleyen ve islenen siparislerini getirir.",
        parameters=types.Schema(
            type=types.Type.OBJECT,
            properties={
                "company_id": types.Schema(type=types.Type.STRING, description="Sirket ID'si")
            },
            required=["company_id"]
        )
    ),
]

stock_tools = types.Tool(function_declarations=stock_tool_declarations)


def run_tool(tool_name: str, tool_args: dict) -> str:
    if tool_name == "get_stock_levels":
        result = get_stock_levels(tool_args.get("company_id", ""))
    elif tool_name == "get_pending_orders":
        result = get_pending_orders(tool_args.get("company_id", ""))
    else:
        result = {"error": f"Bilinmeyen arac: {tool_name}"}
    return json.dumps(result, ensure_ascii=False)


# ── ANA AGENT FONKSİYONU ─────────────────────────────────────────────────────

async def get_stock_advice(company_id: str, mode: str = "advice") -> dict:
    stock_data = get_stock_levels(company_id)
    orders_data = get_pending_orders(company_id)
    
    data_context = f"STOK VERİLERİ:\n{json.dumps(stock_data, ensure_ascii=False)}\n\nBEKLEYEN SİPARİŞLER:\n{json.dumps(orders_data, ensure_ascii=False)}"

    if mode == "summary":
        user_prompt = (
            f"Sirket ID: {company_id}\n"
            f"{data_context}\n\n"
            "Yonetici paneli icin tam olarak 3 adet 'Stratejik Ongoru' uret.\n"
            "Her bir ongoru su formatta olmali: 'BASLIK | ICERIK | TREND'\n"
            "Trend degeri sadece 'positive', 'neutral' veya 'negative' olabilir.\n"
            "Ornek:\n"
            "Hasat Tahmini | Bu yil verim %18 daha yuksek, paketleme kapasitesini artirin. | positive\n"
            "Lutfen sadece bu formatta 3 satir dondur, baska aciklama ekleme."
        )
    else:
        user_prompt = (
            f"Sirket ID: {company_id}\n"
            f"{data_context}\n\n"
            "Yukaridaki verilere dayanarak, hangi urunler icin acil siparis verilmeli? "
            "Fazla stok olan urunler var mi? "
            "Turkce, madde madde pratik oneriler yaz."
        )

    system_instruction = (
        "Sen bir KOBİ stok yonetimi uzmanisın. "
        "Sana verilen guncel verileri analiz et. "
        "Cevaplarini Turkce ve pratik tut."
    )

    import time
    max_retries = 1
    
    for attempt in range(max_retries + 1):
        try:
            client = get_client()
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=[user_prompt],
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.4,
                )
            )
            return {"advice": response.text.strip() if response.text else "Sonuç alınamadı.", "mode": mode}
        except Exception as e:
            is_429 = "429" in str(e)
            if is_429 and attempt < max_retries:
                time.sleep(2)
                continue
            if is_429:
                return {"advice": "Jüri yoğunluğu nedeniyle Gemini kotası anlık doldu, lütfen 10 saniye sonra tekrar sorun.", "mode": mode}
            return {"advice": f"Gemini hatasi: {str(e)[:200]}", "mode": mode}

    return {"advice": "Analiz tamamlanamadi.", "mode": mode}
