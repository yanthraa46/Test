import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div className={['glass-panel', 'p-5 sm:p-6', className].join(' ')} {...props}>
      {children}
    </div>
  );
}
