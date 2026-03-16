import { Link } from "@/i18n/navigation";

interface SectionHeaderProps {
  title: string;
  href?: string;
  linkText?: string;
}

export function SectionHeader({ title, href, linkText = "View all →" }: SectionHeaderProps) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <h2 className="font-display text-2xl font-semibold text-foreground tracking-tight">
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="text-[13px] font-medium text-primary/60 hover:text-primary transition-colors"
        >
          {linkText}
        </Link>
      )}
    </div>
  );
}
