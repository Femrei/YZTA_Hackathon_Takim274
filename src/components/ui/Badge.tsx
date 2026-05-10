interface BadgeProps {
  status: 'critical' | 'normal' | 'excess' | 'active' | 'delayed' | 'delivered' | 'high' | 'medium' | 'low';
  label: string;
}

const variants: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 border border-red-200',
  normal: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  excess: 'bg-amber-100 text-amber-700 border border-amber-200',
  active: 'bg-blue-100 text-blue-700 border border-blue-200',
  delayed: 'bg-red-100 text-red-700 border border-red-200',
  delivered: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  high: 'bg-red-100 text-red-700 border border-red-200',
  medium: 'bg-amber-100 text-amber-700 border border-amber-200',
  low: 'bg-slate-100 text-slate-600 border border-slate-200',
};

export function Badge({ status, label }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[status] ?? variants.normal}`}>
      {label}
    </span>
  );
}
