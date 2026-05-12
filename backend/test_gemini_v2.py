#!/usr/bin/env python3
"""
Gemini quota ve key testi - detayli hata mesajlari
"""
import os, sys
from dotenv import load_dotenv
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"Key (ilk 20 karakter): {api_key[:20] if api_key else 'YOK'}...")

try:
    from google import genai
except ImportError:
    print("HATA: pip install google-genai --upgrade")
    sys.exit(1)

client = genai.Client(api_key=api_key)

try:
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents="Hi"
    )
    print(f"BASARILI: {response.text.strip()}")
except Exception as e:
    err = str(e)
    print(f"\nTAM HATA MESAJI:\n{err}\n")
    if "429" in err:
        if "quota" in err.lower():
            print("=> Gunluk/dakikalik limit doldu. 1 dakika bekle veya farkli Google hesabi kullan.")
        if "RATE_LIMIT" in err:
            print("=> Saniyede cok fazla istek. 60 saniye bekle.")
    elif "400" in err:
        print("=> Key gecersiz.")
    elif "403" in err:
        print("=> Bu key icin API aktif degil.")