/** Corner screw heads for brass plates and plastic bezels. */
export function Screws({ inset = 8 }: { inset?: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <span className="screw" style={{ top: inset, left: inset }} />
      <span className="screw" style={{ top: inset, right: inset }} />
      <span className="screw" style={{ bottom: inset, left: inset }} />
      <span className="screw" style={{ bottom: inset, right: inset }} />
    </div>
  );
}

/**
 * Ambient desk background: white weave, soft paper-light vignette
 * and a fine grain layer. Everything sits on the desk like real objects.
 */
export function Textures() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* white desk weave */}
      <div className="absolute inset-0 bg-linen" />
      {/* grain over the weave */}
      <div className="absolute inset-0 bg-noise opacity-[0.05] mix-blend-multiply" />
      {/* soft daylight from the top */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_60%_at_50%_-10%,oklch(1_0_0/40%)_0%,transparent_60%)]" />
      {/* vignette to seat objects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,oklch(0.3_0.02_258/0.16)_100%)]" />
    </div>
  );
}
