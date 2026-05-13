import base64
from google import genai
from google.genai import types
import os
from datetime import datetime
from firebase_config import db

def get_key():
    return os.getenv("GEMINI_API_KEY")

async def analyze_invoice(company_id: str, base64_image: str):

    if "," in base64_image:
        _, base64_data = base64_image.split(",", 1)
    else:
        base64_data = base64_image

    image_bytes = base64.b64decode(base64_data)

    client = genai.Client(api_key=get_key())

    prompt = """
    Sen bir muhasebe uzmanısın.

    Bu görsel bir fatura veya belge olabilir.

    Şu bilgileri çıkar:
    - Şirket adı
    - Tarih
    - Toplam tutar
    - KDV oranı
    - Ürün/hizmet açıklaması

    JSON formatında döndür:
    {
      "company": "",
      "date": "",
      "total": "",
      "tax": "",
      "description": ""
    }
    """

    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
            prompt
        ]
    )

    text = response.text

    doc = db.collection("invoice_analyses").document()
    doc.set({
        "companyId": company_id,
        "rawResult": text,
        "createdAt": datetime.now(),
        "status": "pending_accounting"
    })

    return {
        "status": "success",
        "analysis": text
    }
