import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

export function Footer() {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <footer className={`px-6 py-3 border-t flex items-center justify-between text-xs ${
      isDark ? 'bg-slate-900 border-slate-700 text-slate-500' : 'bg-white border-slate-100 text-slate-400'
    }`}>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {t('systemOnline')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          {t('backendConnected')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          {t('aiEngineActive')}
        </span>
      </div>
      <span>© 2026 DigiCoBig · v1.0.0</span>
    </footer>
  );
}
