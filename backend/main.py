from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import os
from dotenv import load_dotenv

# .env dosyasını yükle (GEMINI_API_KEY buradan gelecek)
load_dotenv()

# Agent fonksiyonları
from agents.chat_agent import chat_with_context
from agents.stock_agent import get_stock_advice

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


# ─────────────────────────────────────────────
# ENDPOINT 1: /ai/chat
# Frontend'deki UzmanAI sayfası buraya bağlanır.
# company_id ile Firestore'dan bağlam çekip
# Gemini'ye sorar, cevabı döner.
# ─────────────────────────────────────────────
@app.post("/ai/chat")
async def ai_chat(body: ChatRequest):
    try:
        result = await chat_with_context(body.company_id, body.messages)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# ENDPOINT 2: /ai/stock-advice
# Stok analizi — Gemini, Firestore'dan stok
# verilerini çekip sipariş önerileri üretir.
# ─────────────────────────────────────────────
@app.post("/ai/stock-advice")
async def stock_advice(body: CompanyRequest):
    try:
        result = await get_stock_advice(body.company_id, mode="advice")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# ENDPOINT 3: /ai/daily-summary
# Günlük özet — stok + bekleyen siparişlerin
# kısa Türkçe özeti. Admin dashboard için.
# ─────────────────────────────────────────────
@app.post("/ai/daily-summary")
async def daily_summary(body: CompanyRequest):
    try:
        result = await get_stock_advice(body.company_id, mode="summary")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# Sağlık kontrolü — sunucu çalışıyor mu diye
# basitçe http://localhost:8000/health'e bakabilirsin
# ─────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "message": "DigiCoBig AI backend çalışıyor"}