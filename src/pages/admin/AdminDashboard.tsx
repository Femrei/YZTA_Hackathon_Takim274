import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Package, Truck, DollarSign,
  Clock, CheckCircle, AlertTriangle, Sparkles, Mail,
  RefreshCw, ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useSME } from '../../contexts/SMEContext';
import { useIndustry } from '../../contexts/IndustryContext';
import { aiActions } from '../../data/mockData';

function StatCard({ title, value, delta, icon: Icon, trend, color }: {
  title: string; value: string; delta: string; icon: React.ElementType; trend: 'up' | 'down'; color: string;
}) {
  const { isDark } = useTheme();
  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
          trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
        }`}>
          {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {delta}
        </span>
      </div>
      <div className={`text-2xl font-bold mb-0.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>{value}</div>
      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{title}</div>
    </Card>
  );
}

export function AdminDashboard() {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const { theme } = useSME();
  const { data } = useIndustry();
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState(aiActions);
  const [approvedIds, setApprovedIds] = useState<number[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  const handleApprove = (id: number) => {
    setApprovedIds(prev => [...prev, id]);
    setTimeout(() => {
      setActions(prev => prev.filter(a => a.id !== id));
      setApprovedIds(prev => prev.filter(i => i !== id));
    }, 1800);
  };

  const shipmentStatusLabel: Record<string, string> = {
    active: t('active'),
    delayed: t('delayed'),
    delivered: t('delivered'),
  };

  const criticalCount = data.stockItems.filter(i => i.status === 'critical').length;
  const normalCount = data.stockItems.filter(i => i.status === 'normal').length;
  const excessCount = data.stockItems.filter(i => i.status === 'excess').length;

  return (
    <DashboardLayout title={t('dashboard')}>
      <div className="space-y-6">
        {/* Stats Row */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`h-28 rounded-2xl animate-pulse ${isDark ? 'bg-slate-800' : 'bg-white'}`} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <StatCard title={t('totalRevenue')} value={data.stats.totalRevenue} delta={data.stats.revenueDelta} icon={DollarSign} trend="up" color={theme.primary} />
            <StatCard title={t('weeklyOrders')} value={data.stats.weeklyOrders} delta={data.stats.ordersDelta} icon={Package} trend="up" color="bg-emerald-600" />
            <StatCard title={t('activeShipments')} value={data.stats.activeShipments} delta="-2" icon={Truck} trend="down" color="bg-blue-600" />
            <StatCard title={t('onTimeRate')} value={data.stats.onTimeRate} delta="+1.3%" icon={Clock} trend="up" color="bg-amber-600" />
          </motion.div>
        )}

        {/* AI Insights */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{t('aiInsights')}</h2>
          </div>
          {loading ? <SkeletonLoader rows={3} /> : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.aiInsights.map(insight => {
                const trendColors = {
                  positive: { card: 'from-emerald-500/10 to-teal-500/10 border-emerald-200', icon: 'text-emerald-600 bg-emerald-100' },
                  neutral: { card: 'from-blue-500/10 to-slate-500/10 border-blue-200', icon: 'text-blue-600 bg-blue-100' },
                  negative: { card: 'from-red-500/10 to-orange-500/10 border-red-200', icon: 'text-red-600 bg-red-100' },
                };
                const colors = trendColors[insight.trend];
                return (
                  <div key={insight.titleKey} className={`rounded-2xl border bg-gradient-to-br p-5 ${colors.card} ${isDark ? 'border-slate-600' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.icon}`}>
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <div className={`text-sm font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>{insight.title}</div>
                        <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{insight.insight}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span className="text-xs text-amber-600 font-medium">AI Öngörüsü</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            {/* Stok quick view */}
            <Card>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-slate-500" />
                  <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Stok Durumu</h2>
                </div>
                <Link
                  to="/admin/stok"
                  className={`flex items-center gap-1 text-xs font-medium transition-colors ${theme.primaryText} hover:opacity-80`}
                >
                  Stok Yönetimi
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              {loading ? <SkeletonLoader rows={2} /> : (
                <div className="grid grid-cols-3 gap-3">
                  <div className={`rounded-xl p-3 ${isDark ? 'bg-red-900/20 border border-red-800/30' : 'bg-red-50 border border-red-100'}`}>
                    <div className="text-xl font-bold text-red-600">{criticalCount}</div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Kritik Stok</div>
                  </div>
                  <div className={`rounded-xl p-3 ${isDark ? 'bg-emerald-900/20 border border-emerald-800/30' : 'bg-emerald-50 border border-emerald-100'}`}>
                    <div className="text-xl font-bold text-emerald-600">{normalCount}</div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Normal Stok</div>
                  </div>
                  <div className={`rounded-xl p-3 ${isDark ? 'bg-amber-900/20 border border-amber-800/30' : 'bg-amber-50 border border-amber-100'}`}>
                    <div className="text-xl font-bold text-amber-600">{excessCount}</div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Fazla Stok</div>
                  </div>
                </div>
              )}
            </Card>

            {/* Logistics Tracker */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-slate-500" />
                  <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{t('logisticsTracker')}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Link to="/admin/lojistik" className={`flex items-center gap-1 text-xs font-medium ${theme.primaryText} hover:opacity-80`}>
                    Tümünü Gör <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-xl transition-all ${isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}>
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
              </div>
              {loading ? <SkeletonLoader rows={4} /> : (
                <div className="space-y-3">
                  {data.shipments.slice(0, 3).map((shipment, idx) => (
                    <motion.div
                      key={shipment.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${
                        shipment.status === 'delayed'
                          ? isDark ? 'border-red-700/40 bg-red-900/10' : 'border-red-100 bg-red-50/50'
                          : isDark ? 'border-slate-700 bg-slate-700/20' : 'border-slate-100 bg-slate-50'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-xs font-semibold font-mono ${isDark ? 'text-white' : 'text-slate-800'}`}>{shipment.id}</span>
                          <Badge status={shipment.status} label={shipmentStatusLabel[shipment.status]} />
                        </div>
                        <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {shipment.product} → {shipment.destination}
                        </div>
                        {shipment.aiReason && (
                          <div className="flex items-start gap-1 mt-1">
                            <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-red-500">{shipment.aiReason}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0 w-20">
                        <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${shipment.progress}%` }}
                            transition={{ duration: 1, delay: idx * 0.1 }}
                            className={`h-full rounded-full ${shipment.status === 'delivered' ? 'bg-emerald-500' : shipment.status === 'delayed' ? 'bg-red-500' : 'bg-blue-500'}`}
                          />
                        </div>
                        <div className={`text-xs text-right mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{shipment.progress}%</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* AI Action Center */}
          <div className="space-y-4">
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{t('aiActionCenter')}</h2>
              </div>
              {loading ? <SkeletonLoader rows={3} /> : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {actions.map((action) => (
                      <motion.div
                        key={action.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0, overflow: 'hidden' }}
                        transition={{ duration: 0.3 }}
                        className={`p-4 rounded-xl border ${
                          action.priority === 'high'
                            ? isDark ? 'border-amber-700/50 bg-amber-900/20' : 'border-amber-200 bg-amber-50'
                            : isDark ? 'border-slate-700 bg-slate-700/30' : 'border-slate-100 bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <Mail className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                          <div className="min-w-0">
                            <div className={`text-xs font-semibold mb-0.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>{action.title}</div>
                            <div className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{action.description}</div>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleApprove(action.id)}
                          disabled={approvedIds.includes(action.id)}
                          className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
                            approvedIds.includes(action.id) ? 'bg-emerald-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'
                          }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {approvedIds.includes(action.id) ? t('approved') : t('approveAndSend')}
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {actions.length === 0 && (
                    <div className={`text-center py-6 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Tüm aksiyonlar tamamlandı
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
