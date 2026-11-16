/** Ambient background layers: ember glows, dot grid and film grain. */
export function Textures() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* top ember glow */}
      <div className="absolute -top-40 -left-32 h-[480px] w-[480px] rounded-full bg-glow-amber" />
      <div className="absolute top-1/3 -right-40 h-[520px] w-[520px] rounded-full bg-glow-deep" />
      {/* bottom subtle glow */}
      <div className="absolute -bottom-48 left-1/4 h-[420px] w-[420px] rounded-full bg-glow-amber opacity-70" />
      {/* dotted grid, faded towards center */}
      <div className="absolute inset-0 bg-dot-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      {/* film grain */}
      <div className="absolute inset-0 bg-noise opacity-[0.05] mix-blend-soft-light" />
      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,oklch(0.08_0.01_70/0.55)_100%)]" />
    </div>
  );
}
