import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: 'default' | 'safe' | 'caution' | 'critical' | 'accent';
  suffix?: string;
}

const TONE_CLASSES: Record<NonNullable<KpiCardProps['tone']>, string> = {
  default: 'text-text',
  safe: 'text-emerald-400',
  caution: 'text-yellow-400',
  critical: 'text-red-400',
  accent: 'text-accent',
};

export function KpiCard({ label, value, icon: Icon, tone = 'default', suffix }: KpiCardProps) {
  return (
    <div className="rounded-lg border border-border bg-panel p-3.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-text-faint">{label}</span>
        <Icon className="h-3.5 w-3.5 text-text-faint" strokeWidth={2} />
      </div>
      <div className={`mt-1.5 text-2xl font-bold tabular-nums ${TONE_CLASSES[tone]}`}>
        {value}
        {suffix && <span className="ml-0.5 text-sm font-medium text-text-faint">{suffix}</span>}
      </div>
    </div>
  );
}
