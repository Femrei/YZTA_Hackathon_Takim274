#!/usr/bin/env python3
"""
test_gemini.py — Yeni google-genai SDK ile Gemini test
"""
import os, sys
from dotenv import load_dotenv
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("HATA: GEMINI_API_KEY bulunamadi! .env dosyasini kontrol et.")
    sys.exit(1)

try:
    from google import genai
    from google.genai import types
except ImportError:
    print("HATA: google-genai paketi yüklü değil!")
    print("Şunu çalıştır: pip install google-genai --upgrade")
    sys.exit(1)

client = genai.Client(api_key=api_key)

print("Gemini API baglantisi test ediliyor (yeni SDK)...\n")

try:
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents="Merhaba, sadece 'Calisiyorum!' de."
    )
    print(f"BASARILI! Model cevabi: {response.text.strip()}")
    print("\nKullanilacak model: gemini-2.0-flash")
    print("Backend'i baslat: uvicorn main:app --reload")
except Exception as e:
    err = str(e)
    if "429" in err:
        print("QUOTA HATASI (429): Bu API key limitini doldurmus.")
        print("Cozum: https://aistudio.google.com/apikey adresinden YENI bir key al.")
        print("Yeni key'i backend/.env dosyasina GEMINI_API_KEY=... olarak yaz.")
    elif "400" in err or "API_KEY" in err.upper():
        print("API KEY HATASI: Key gecersiz veya yanlis.")
        print("https://aistudio.google.com/apikey adresinden key'ini kontrol et.")
    else:
        print(f"HATA: {err}")
