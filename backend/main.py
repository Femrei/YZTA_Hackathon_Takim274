from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import os
from dotenv import load_dotenv
from agents.invoice_agent import analyze_invoice

# .env dosyasını yükle (GEMINI_API_KEY buradan gelecek)
env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(dotenv_path=env_path, override=True)

# Agent fonksiyonları
from agents.chat_agent import chat_with_context
from agents.stock_agent import get_stock_advice
from agents.vision_agent import analyze_vision_image

app = FastAPI(title="DigiCoBig AI Backend", version="1.0.0")

# ─────────────────────────────────────────────
# CORS — React (localhost:5173) bu sunucuya
# istek atabilsin diye gerekli.
# Production'da allow_origins'i kendi domain'inle
# değiştir, "*" bırakma.
# ─────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# Request body şemaları — FastAPI bunları
# otomatik doğrular ve Swagger'da gösterir
# ─────────────────────────────────────────────
class ChatRequest(BaseModel):
    company_id: str
    messages: List[Dict[str, Any]]  # [{"role": "user", "content": "..."}, ...]

class CompanyRequest(BaseModel):
    company_id: str

class VisionRequest(BaseModel):
    company_id: str
    image_base64: str

class InvoiceRequest(BaseModel):
    company_id: str
    image_base64: str



# ENDPOINT 1:
# Frontend'deki UzmanAI sayfası buraya bağlanır.
# company_id ile Firestore'dan bağlam çekip
# Gemini'ye sorar, cevabı döner.

@app.post("/ai/chat")
async def ai_chat(body: ChatRequest):
    try:
        result = await chat_with_context(body.company_id, body.messages)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ENDPOINT 2: 
# Stok analizi — Gemini, Firestore'dan stok verilerini çekip sipariş önerileri üretir.
@app.post("/ai/stock-advice")
async def stock_advice(body: CompanyRequest):
    try:
        result = await get_stock_advice(body.company_id, mode="advice")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ENDPOINT 3: Günlük özet — stok + bekleyen siparişler
@app.post("/ai/daily-summary")
async def daily_summary(body: CompanyRequest):
    try:
        result = await get_stock_advice(body.company_id, mode="summary")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# ENDPOINT 4: Görüntü işleme - Hastalık ve kalite analizi
@app.post("/ai/vision-analyze")
async def vision_analyze(body: VisionRequest):
    try:
        result = await analyze_vision_image(body.company_id, body.image_base64)
        if result["status"] == "error":
            raise HTTPException(status_code=500, detail=result["message"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ENDPOINT 5: Görüntü İşleme - Fatura Analizi    
@app.post("/ai/invoice-analyze")
async def invoice_analyze(body: InvoiceRequest):
    try:
        result = await analyze_invoice(body.company_id, body.image_base64)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))    



# Sağlık kontrolü — sunucu çalışıyor mu diye
# basitçe http://localhost:8000/health'e bakabilirsin

@app.get("/health")
async def health():
    return {"status": "ok", "message": "DigiCoBig AI backend çalışıyor"}