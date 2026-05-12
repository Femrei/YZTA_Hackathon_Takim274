import os
import time
import base64
from google import genai
from google.genai import types
from firebase_config import db
from datetime import datetime

def get_gemini_api_key():
    key = os.getenv("VITE_GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY")
    return key

async def analyze_vision_image(company_id: str, base64_image: str) -> dict:
    try:
        # base64 data format: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
        if "," in base64_image:
            mime_type, base64_data = base64_image.split(",", 1)
            mime_type = mime_type.split(":")[1].split(";")[0]
        else:
            mime_type = "image/jpeg"
            base64_data = base64_image

        image_bytes = base64.b64decode(base64_data)

        api_key = get_gemini_api_key()
        client = genai.Client(api_key=api_key)
        model_name = "gemini-flash-lite-latest"

        prompt = (
            "Sen bir bitki patolojisi uzmanısın. "
            "Bu fotoğraftaki bitki hastalığını tanı, nedenini açıkla ve tedavi önerilerini sırala. "
            "Eğer hastalık yoksa raf ömrü tahmini ve olgunluk analizi yap."
        )

        max_retries = 3
        last_err_str = ""
        response_text = ""

        print(f">>> Görüntü Analizi (Vision) başlatıldı: {model_name}")

        for attempt in range(max_retries):
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=[
                        types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                        prompt
                    ]
                )
                response_text = response.text
                if response_text:
                    break
            except Exception as e:
                err_str = str(e)
                last_err_str = err_str
                print(f"--- Vision HATA ({model_name}) Deneme {attempt+1}/{max_retries}: {err_str[:100]}")
                if "503" in err_str:
                    time.sleep(2)
                    continue
                else:
                    break

        if not response_text:
            return {"status": "error", "message": f"Yapay zeka görseli analiz edemedi. (Son hata: {last_err_str[:100]})"}

        # Veritabanına kaydet
        doc_ref = db.collection("vision_analyses").document()
        doc_ref.set({
            "companyId": company_id,
            "analysisResult": response_text,
            "createdAt": datetime.now(),
            "status": "active"
        })

        return {
            "status": "success",
            "analysis": response_text
        }

    except Exception as e:
        print(f"Vision Agent Hatası: {e}")
        return {"status": "error", "message": str(e)}
