interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={['animate-pulse rounded-lg bg-secondary', className].join(' ')} aria-hidden="true" />;
}
