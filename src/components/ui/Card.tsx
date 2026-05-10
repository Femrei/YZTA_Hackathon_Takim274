import { ReactNode } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className = '', padding = true }: CardProps) {
  const { isDark } = useTheme();

  return (
    <div
      className={`rounded-2xl border shadow-sm ${padding ? 'p-5' : ''} ${
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
      } ${className}`}
    >
      {children}
    </div>
  );
}
