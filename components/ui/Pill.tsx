interface PillProps {
  children: React.ReactNode;
  className?: string;
}

export default function Pill({ children, className = '' }: PillProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-body font-medium text-text-muted ${className}`}
    >
      {children}
    </span>
  );
}
