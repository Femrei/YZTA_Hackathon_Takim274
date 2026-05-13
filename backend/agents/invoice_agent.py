import base64
from google import genai
from google.genai import types
import os
from datetime import datetime
from firebase_config import db

def get_key():
    return os.getenv("GEMINI_API_KEY")

async def analyze_invoice(company_id: str, base64_image: str, question: str = None):

    if "," in base64_image:
        _, base64_data = base64_image.split(",", 1)
    else:
        base64_data = base64_image

    image_bytes = base64.b64decode(base64_data)

    client = genai.Client(api_key=get_key())

    if question and question.strip():
        prompt = f"""
        Sen bir muhasebe ve belge analiz uzmanısın.
        Kullanıcının yüklediği bu görselle (fatura, fiş, belge vs.) ilgili sorusu şudur:
        "{question}"
        
        Lütfen belgeyi dikkatlice inceleyerek kullanıcının sorusuna doğrudan, açık ve profesyonel bir Türkçe ile yanıt ver.
        Cevabını Markdown formatında, okunaklı bir şekilde hazırla.
        """
    else:
        prompt = """
        Sen bir muhasebe uzmanısın.
        Bu görsel bir fatura, fiş veya herhangi bir belge olabilir.
        Lütfen belgeden şu bilgileri çıkarıp temiz bir Markdown formatında sun:
        - **Şirket/Kurum Adı:**
        - **Tarih:**
        - **Toplam Tutar:**
        - **KDV veya Vergi Oranı:**
        - **Ürün/Hizmet Açıklaması:**
        
        Varsa eksik olan veya okunamayan kısımları da belirt. Eğer bu bir fatura değilse, belgenin ne olduğunu ve içeriğinin özetini Markdown olarak hazırla.
        """

    response = client.models.generate_content(
        model="gemini-flash-lite-latest",
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
