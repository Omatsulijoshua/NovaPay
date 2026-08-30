
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'emerald' | 'blue' | 'purple' | 'amber';
}

const colorMap = {
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconBg: 'bg-emerald-600',
    text: 'text-emerald-700',
    value: 'text-emerald-900',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-600',
    text: 'text-blue-700',
    value: 'text-blue-900',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    iconBg: 'bg-purple-600',
    text: 'text-purple-700',
    value: 'text-purple-900',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconBg: 'bg-amber-500',
    text: 'text-amber-700',
    value: 'text-amber-900',
  },
};

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'emerald' }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={`${c.bg} border ${c.border} rounded-2xl p-6 flex items-start space-x-4`}>
      <div className={`${c.iconBg} p-3 rounded-xl flex-shrink-0`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${c.text}`}>{title}</p>
        <p className={`text-2xl font-bold mt-1 ${c.value} truncate`}>{value}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
