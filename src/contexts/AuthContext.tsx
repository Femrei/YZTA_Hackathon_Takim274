import { createContext, useContext, useState, ReactNode } from 'react';
import { SMEType } from './SMEContext';

export type UserRole = 'admin' | 'employee' | 'customer' | 'superadmin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  industryType: SMEType;
  companyName: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const demoUsers: Record<string, User> = {
  // Admin variants
  admin_agriculture: {
    id: 'adm-agr-1',
    name: 'Ayşe Kaya',
    email: 'ayse.kaya@egekooperatif.com',
    role: 'admin',
    industryType: 'agriculture',
    companyName: 'Ege Kooperatifi',
  },
  admin_technology: {
    id: 'adm-tec-1',
    name: 'Berk Yılmaz',
    email: 'berk.yilmaz@techstart.com',
    role: 'admin',
    industryType: 'technology',
    companyName: 'TechStart İzmir A.Ş.',
  },
  admin_handcraft: {
    id: 'adm-hnd-1',
    name: 'Elif Güneş',
    email: 'elif.gunes@kapadokya.com',
    role: 'admin',
    industryType: 'handcraft',
    companyName: 'Kapadokya El Sanatları',
  },
  // Employee variants
  employee_agriculture: {
    id: 'emp-agr-1',
    name: 'Mehmet Demir',
    email: 'mehmet.demir@egekooperatif.com',
    role: 'employee',
    industryType: 'agriculture',
    companyName: 'Ege Kooperatifi',
  },
  employee_technology: {
    id: 'emp-tec-1',
    name: 'Selin Çelik',
    email: 'selin.celik@techstart.com',
    role: 'employee',
    industryType: 'technology',
    companyName: 'TechStart İzmir A.Ş.',
  },
  employee_handcraft: {
    id: 'emp-hnd-1',
    name: 'Kadir Şahin',
    email: 'kadir.sahin@kapadokya.com',
    role: 'employee',
    industryType: 'handcraft',
    companyName: 'Kapadokya El Sanatları',
  },
  // Customer
  customer_general: {
    id: 'cus-gen-1',
    name: 'Fatma Yıldız',
    email: 'fatma.yildiz@gmail.com',
    role: 'customer',
    industryType: 'general',
    companyName: '',
  },
  // SuperAdmin
  superadmin: {
    id: 'dev-001',
    name: 'Platform Geliştirici',
    email: 'dev@digico.io',
    role: 'superadmin',
    industryType: 'general',
    companyName: 'DigiCo Platform',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (u: User) => setUser(u);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
