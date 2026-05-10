import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Footer } from './Footer';
import { useTheme } from '../../contexts/ThemeContext';

interface Props {
  children: ReactNode;
  title: string;
}

export function DashboardLayout({ children, title }: Props) {
  const { isDark } = useTheme();

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar title={title} />
        <main className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="p-6"
          >
            {children}
          </motion.div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
