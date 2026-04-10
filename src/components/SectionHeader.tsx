interface SectionHeaderProps {
  label: string;
  title: string;
  subtitle?: string;
  dark?: boolean;
}

const SectionHeader = ({ label, title, subtitle, dark = false }: SectionHeaderProps) => (
  <div className="mb-12">
    <p className="font-display text-[11px] tracking-[0.25em] uppercase text-gold mb-5">{label}</p>
    <h2
      className={`font-serif text-[clamp(36px,5vw,64px)] font-normal leading-[1.2] tracking-tight ${
        dark ? "text-cream" : "text-foreground"
      }`}
      dangerouslySetInnerHTML={{ __html: title }}
    />
    {subtitle && (
      <p className={`font-display italic text-[clamp(20px,3vw,32px)] mt-3 ${dark ? "text-gold" : "text-muted-foreground"}`}>
        {subtitle}
      </p>
    )}
  </div>
);

export default SectionHeader;
