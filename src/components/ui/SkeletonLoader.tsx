import { useTheme } from '../../contexts/ThemeContext';

interface Props {
  rows?: number;
  className?: string;
}

export function SkeletonLoader({ rows = 3, className = '' }: Props) {
  const { isDark } = useTheme();

  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`h-10 rounded-xl animate-pulse ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}
          style={{ opacity: 1 - i * 0.15 }}
        />
      ))}
    </div>
  );
}
