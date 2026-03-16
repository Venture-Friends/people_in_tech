interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="text-center pt-12 mb-9">
      <h1 className="font-display text-[42px] font-bold tracking-[-0.03em] text-foreground">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-base text-white/[0.35]">{subtitle}</p>
      )}
    </div>
  );
}
