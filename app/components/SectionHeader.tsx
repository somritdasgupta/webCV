import { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  icon: ReactNode;
  subtitle?: string;
}

export default function SectionHeader({
  title,
  icon,
  subtitle,
}: SectionHeaderProps) {
  return (
    <div className="text-left">
      <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-p)] mb-4">
        {title}
        {icon}
      </h2>
      {subtitle && (
        <p className="text-lg text-[var(--text-p)]/70">{subtitle}</p>
      )}
    </div>
  );
}
