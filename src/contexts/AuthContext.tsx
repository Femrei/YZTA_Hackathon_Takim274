/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { SMEType } from './SMEContext';

export type UserRole = 'admin' | 'employee' | 'customer' | 'superadmin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  industryType: SMEType;
  companyName: string;
  companyId?: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  industryType?: SMEType;
  companyId?: string;     // çalışan için şirket kodu
  companyName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User>;  // User döndürür → Login.tsx yönlendirir
  register: (data: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ── Demo kullanıcı e-postalarından industryType tahmini ──────────────────────
function guessIndustryFromEmail(email: string): SMEType {
  if (email.includes('tarim') || email.includes('agr')) return 'agriculture';
  if (email.includes('tek') || email.includes('tech')) return 'technology';
  if (email.includes('sanat') || email.includes('hand')) return 'handcraft';
  return 'general';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              name: data.name || '',
              email: data.email || firebaseUser.email || '',
              role: data.role || 'customer',
              industryType: data.industryType || guessIndustryFromEmail(data.email || ''),
              companyName: data.companyName || '',
              companyId: data.companyId || '',
            });
          } else {
            // Firestore'da kaydı yoksa (demo hesap vs.) kullanıcıyı null yap
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth state error:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  const login = async (email: string, pass: string): Promise<User> => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const userDoc = await getDoc(doc(db, 'users', cred.user.uid));

    if (!userDoc.exists()) {
      await signOut(auth);
      throw new Error('Kullanıcı kaydı bulunamadı. Lütfen önce kayıt olun.');
    }

    const data = userDoc.data();
    const loggedUser: User = {
      id: cred.user.uid,
      name: data.name || '',
      email: data.email || email,
      role: data.role || 'customer',
      industryType: data.industryType || guessIndustryFromEmail(email),
      companyName: data.companyName || '',
      companyId: data.companyId || '',
    };
    setUser(loggedUser);
    return loggedUser;  // Login.tsx bu değeri alıp role'e göre yönlendirir
  };

// ── REGISTER ──────────────────────────────────────────────────────────────
const register = async (formData: RegisterData): Promise<User> => {
  const { email, password, name, role, industryType, companyName } = formData;
  let assignedCompanyId = formData.companyId?.trim() || '';
  let resolvedCompanyName = companyName?.trim() || '';
  let resolvedIndustryType: SMEType = industryType || 'general';

  // ── Yönetici: admin_invitations'da email kontrolü ──────────────────────
  if (role === 'admin') {
    const q = query(collection(db, 'admin_invitations'), where('email', '==', email.toLowerCase()));
    const snap = await getDocs(q);
    if (snap.empty) {
      throw new Error('Bu e-posta adresi yönetici olarak yetkilendirilmemiştir.');
    }
    const inviteData = snap.docs[0].data();
    assignedCompanyId = inviteData.authorizedCompanyId || assignedCompanyId;
  }

  // ── Çalışan: girilen şirket kodu geçerli mi kontrol et ──────────────────
  if (role === 'employee') {
    if (!assignedCompanyId) {
      throw new Error('Lütfen şirket kodunu girin.');
    }
    // O companyId'ye sahip bir admin var mı bak
    const adminQ = query(
      collection(db, 'users'),
      where('companyId', '==', assignedCompanyId),
      where('role', '==', 'admin')
    );
    const adminSnap = await getDocs(adminQ);
    if (adminSnap.empty) {
      throw new Error('Geçersiz şirket kodu. Yöneticinizden doğru kodu alın.');
    }
    const adminData = adminSnap.docs[0].data();
    resolvedCompanyName = adminData.companyName || resolvedCompanyName;
    resolvedIndustryType = adminData.industryType || resolvedIndustryType;
  }

  // ── Firebase Auth'a kayıt ──────────────────────────────────────────────
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;

  const userData = {
    name,
    email: email.toLowerCase(),
    role,
    industryType: resolvedIndustryType,
    companyId: assignedCompanyId,
    companyName: resolvedCompanyName,
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'users', uid), userData);

  // Kayıt sonrası oturumu kapat → kullanıcı login sayfasına dönüp giriş yapacak
  await signOut(auth);
  setUser(null);

  // Login.tsx bu değeri alıp "Kayıt başarılı, giriş yapın" mesajı gösterecek
  const newUser: User = { id: uid, ...userData };
  return newUser;
};

  // ── LOGOUT ────────────────────────────────────────────────────────────────
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}