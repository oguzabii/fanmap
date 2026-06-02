type Props = {
  nationName: string;
  primaryColor: string;
  secondaryColor: string;
};

export function SponsorSlot({ nationName, primaryColor, secondaryColor }: Props) {
  return (
    <div className="relative overflow-hidden rounded-3xl ring-soft glass p-5 sm:p-6">
      <div
        className="absolute -inset-1 opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(60% 80% at 0% 0%, ${primaryColor}, transparent 60%)`
        }}
      />
      <div className="relative flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="chip">Sponsor placeholder</div>
          <div className="mt-3 h-display text-xl font-bold">Sponsor this nation page.</div>
          <p className="text-sm text-white/55 max-w-md mt-1">
            Get your brand in front of the most engaged {nationName} supporters during the 2026
            fan race. One sponsor per nation per month.
          </p>
        </div>
        <a
          href="mailto:partners@fanmap.example"
          className="btn-primary"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            color: "#0A0C14"
          }}
        >
          Become the sponsor →
        </a>
      </div>
    </div>
  );
}
