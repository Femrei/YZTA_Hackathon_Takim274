import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { SMEProvider } from './contexts/SMEContext';
import { IndustryProvider } from './contexts/IndustryContext';
import { TicketProvider } from './contexts/TicketContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Sayfalar
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { StokYonetimi } from './pages/admin/StokYonetimi';
import { Lojistik } from './pages/admin/Lojistik';
import { Siparisler } from './pages/admin/Siparisler';
import { Musteriler } from './pages/admin/Musteriler';
import { Raporlar } from './pages/admin/Raporlar';
import { AyarlarAdmin } from './pages/admin/AyarlarAdmin';
import { TeknikDestek } from './pages/admin/TeknikDestek';
import { CalisanDashboard } from './pages/calisan/CalisanDashboard';
import { StokGuncelle } from './pages/calisan/StokGuncelle';
import { Bildirimler } from './pages/calisan/Bildirimler';
import { AyarlarCalisan } from './pages/calisan/AyarlarCalisan';
import { Siparislerim } from './pages/musteri/Siparislerim';
import { Katalog } from './pages/musteri/Katalog';
import { AyarlarMusteri } from './pages/musteri/AyarlarMusteri';
import { UzmanAI } from './pages/UzmanAI';
import { SuperAdmin } from './pages/SuperAdmin';

function AppContent() {
  const { loading, user } = useAuth(); // AuthContext'ten geliyor

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: 'white' }}>
        <h2 style={{ fontFamily: 'sans-serif' }}>DigiCoBig Hazırlanıyor...</h2>
      </div>
    );
  }

  return (
    <SMEProvider lockedType={user?.industryType}>
      <IndustryProvider>
        <TicketProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/super-admin" element={<SuperAdmin />} />

              {/* Admin */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/stok" element={<ProtectedRoute allowedRoles={['admin']}><StokYonetimi /></ProtectedRoute>} />
              <Route path="/admin/lojistik" element={<ProtectedRoute allowedRoles={['admin']}><Lojistik /></ProtectedRoute>} />
              <Route path="/admin/siparisler" element={<ProtectedRoute allowedRoles={['admin']}><Siparisler /></ProtectedRoute>} />
              <Route path="/admin/musteriler" element={<ProtectedRoute allowedRoles={['admin']}><Musteriler /></ProtectedRoute>} />
              <Route path="/admin/raporlar" element={<ProtectedRoute allowedRoles={['admin']}><Raporlar /></ProtectedRoute>} />
              <Route path="/admin/uzman-ai" element={<ProtectedRoute allowedRoles={['admin']}><UzmanAI /></ProtectedRoute>} />
              <Route path="/admin/ayarlar" element={<ProtectedRoute allowedRoles={['admin']}><AyarlarAdmin /></ProtectedRoute>} />
              <Route path="/admin/teknik-destek" element={<ProtectedRoute allowedRoles={['admin']}><TeknikDestek /></ProtectedRoute>} />

              {/* Çalışan */}
              <Route path="/calisan" element={<ProtectedRoute allowedRoles={['employee']}><CalisanDashboard /></ProtectedRoute>} />
              <Route path="/calisan/stok" element={<ProtectedRoute allowedRoles={['employee']}><StokGuncelle /></ProtectedRoute>} />
              <Route path="/calisan/bildirimler" element={<ProtectedRoute allowedRoles={['employee']}><Bildirimler /></ProtectedRoute>} />
              <Route path="/calisan/uzman-ai" element={<ProtectedRoute allowedRoles={['employee']}><UzmanAI /></ProtectedRoute>} />
              <Route path="/calisan/ayarlar" element={<ProtectedRoute allowedRoles={['employee']}><AyarlarCalisan /></ProtectedRoute>} />

              {/* Müşteri */}
              <Route path="/musteri" element={<ProtectedRoute allowedRoles={['customer']}><Siparislerim /></ProtectedRoute>} />
              <Route path="/musteri/katalog" element={<ProtectedRoute allowedRoles={['customer']}><Katalog /></ProtectedRoute>} />
              <Route path="/musteri/ayarlar" element={<ProtectedRoute allowedRoles={['customer']}><AyarlarMusteri /></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </TicketProvider>
      </IndustryProvider>
    </SMEProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}