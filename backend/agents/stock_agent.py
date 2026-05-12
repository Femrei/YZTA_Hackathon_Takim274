"""
stock_agent.py — Gemini Function Calling ile stok analiz ajanı
Yeni google-genai SDK kullanıyor
"""

import os
import json
from google import genai
from google.genai import types
from firebase_config import db

GEMINI_MODEL = "gemini-1.5-flash"

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
    if mode == "summary":
        user_prompt = (
            f"Sirket ID: {company_id}\n"
            "Araclari kullanarak stok ve siparis verilerini cek, "
            "sonra 3-4 cumlelik Turkce gunluk ozet yaz. "
            "Kritik urunleri ve bekleyen siparis sayisini mutlaka belirt."
        )
    else:
        user_prompt = (
            f"Sirket ID: {company_id}\n"
            "Araclari kullanarak stok seviyelerini ve bekleyen siparisleri cek. "
            "Hangi urunler icin acil siparis verilmeli? "
            "Fazla stok olan urunler var mi? "
            "Turkce, madde madde pratik oneriler yaz."
        )

    system_instruction = (
        "Sen bir KOBİ stok yonetimi uzmanisın. "
        "Once araclari kullanarak guncel veriyi cek, sonra analiz et. "
        "Cevaplarini Turkce ve pratik tut."
    )

    contents = [types.Content(role="user", parts=[types.Part(text=user_prompt)])]

    max_iterations = 5
    iteration = 0

    while iteration < max_iterations:
        iteration += 1

        import time
        max_retries = 1
        response = None
        
        for attempt in range(max_retries + 1):
            try:
                client = get_client()
                response = client.models.generate_content(
                    model=GEMINI_MODEL,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        tools=[stock_tools],
                        temperature=0.5,
                    )
                )
                break  # Basarili olursa donguden cik
            except Exception as e:
                is_429 = "429" in str(e)
                if is_429 and attempt < max_retries:
                    print(f"--- 429 ALINDI, 2 SANIYE BEKLENIYOR (Deneme {attempt+1}/{max_retries}) ---")
                    time.sleep(2)
                    continue
                
                if is_429:
                    return {"advice": "Jüri yoğunluğu nedeniyle Gemini kotası anlık doldu, lütfen 10 saniye sonra tekrar sorun.", "mode": mode}
                    
                return {"advice": f"Gemini hatasi: {str(e)[:200]}", "mode": mode}
                
        if not response:
             return {"advice": "Jüri yoğunluğu nedeniyle Gemini kotası anlık doldu, lütfen 10 saniye sonra tekrar sorun.", "mode": mode}

        # Gemini'nin cevabını ekle
        contents.append(types.Content(role="model", parts=response.candidates[0].content.parts))

        # Tool call var mı kontrol et
        tool_calls = [
            part for part in response.candidates[0].content.parts
            if part.function_call is not None
        ]

        if not tool_calls:
            # Son metin cevabını al
            final_text = ""
            for part in response.candidates[0].content.parts:
                if hasattr(part, "text") and part.text:
                    final_text += part.text
            if final_text.strip():
                return {"advice": final_text.strip(), "mode": mode}
            return {"advice": "Analiz tamamlandi fakat cevap alinamadi.", "mode": mode}

        # Araçları çalıştır ve sonuçları gönder
        tool_result_parts = []
        for part in tool_calls:
            fc = part.function_call
            result_json = run_tool(fc.name, dict(fc.args))
            tool_result_parts.append(
                types.Part(
                    function_response=types.FunctionResponse(
                        name=fc.name,
                        response={"result": result_json}
                    )
                )
            )

        contents.append(types.Content(role="user", parts=tool_result_parts))

    return {"advice": "Analiz zaman asimina ugradi. Lutfen tekrar deneyin.", "mode": mode}
