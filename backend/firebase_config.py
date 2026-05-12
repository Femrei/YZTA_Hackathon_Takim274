import firebase_admin
from firebase_admin import credentials, firestore
import os

# Çift initialize'ı önle — sunucu yeniden yüklendiğinde crash verir
if not firebase_admin._apps:
    # Önce serviceAccountKey.json'ın var olduğu yere bak
    key_path = os.path.join(os.path.dirname(__file__), "serviceAccountKey.json")
    cred = credentials.Certificate(key_path)
    firebase_admin.initialize_app(cred)

# db → tüm diğer dosyalarda bu değişkeni import edeceğiz
db = firestore.client()
