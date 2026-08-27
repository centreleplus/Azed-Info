import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  count: number | string;
  badgeText: string;
  icon: LucideIcon;
  variant: 'emerald' | 'amber' | 'slate' | 'indigo';
}

const VARIANT_STYLES = {
  emerald: {
    bg: 'bg-emerald-50/60 border-emerald-200/80',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/20',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    count: 'text-emerald-950',
  },
  amber: {
    bg: 'bg-amber-50/60 border-amber-200/80',
    iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-500/20',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    count: 'text-amber-950',
  },
  indigo: {
    bg: 'bg-indigo-50/60 border-indigo-200/80',
    iconBg: 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-indigo-500/20',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    count: 'text-indigo-950',
  },
  slate: {
    bg: 'bg-slate-50/60 border-slate-200/80',
    iconBg: 'bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-slate-500/20',
    badge: 'bg-slate-200 text-slate-800 border-slate-300',
    count: 'text-slate-950',
  },
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  count,
  badgeText,
  icon: Icon,
  variant,
}) => {
  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.emerald;

  return (
    <div className={`p-5 rounded-2xl border ${styles.bg} backdrop-blur-sm shadow-xs transition-all hover:shadow-md flex items-center justify-between text-start`}>
      <div className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">{title}</span>
        <div className="flex items-center gap-3">
          <span className={`text-3xl font-extrabold ${styles.count}`}>{count}</span>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${styles.badge}`}>
            {badgeText}
          </span>
        </div>
      </div>

      {/* Conteneur d'icône professionnel avec ombre douce */}
      <div className={`p-3.5 rounded-2xl shadow-lg ${styles.iconBg} flex items-center justify-center shrink-0`}>
        <Icon className="w-6 h-6 stroke-[1.8]"/>
      </div>
    </div>
  );
};

export default MetricCard;
