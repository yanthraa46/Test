import type { HTMLAttributes, ReactNode } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'muted';
  children: ReactNode;
}

const toneClasses: Record<NonNullable<BadgeProps['tone']>, string> = {
  default: 'bg-primary/15 text-primary',
  success: 'bg-emerald-500/15 text-emerald-500',
  warning: 'bg-amber-500/15 text-amber-500',
  danger: 'bg-rose-500/15 text-rose-500',
  muted: 'bg-secondary text-secondary-foreground',
};

export function Badge({ tone = 'default', className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
        toneClasses[tone],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </span>
  );
}
