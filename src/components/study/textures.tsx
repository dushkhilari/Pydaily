/**
 * Ambient desk background: a warm paper desk with soft daylight,
 * fine grain and a gentle vignette so the open notebook page sits
 * on it like a real object.
 */
export function Textures() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* warm paper desk */}
      <div className="absolute inset-0 bg-desk" />
      {/* grain over the desk */}
      <div className="absolute inset-0 bg-noise opacity-[0.05] mix-blend-multiply" />
    </div>
  );
}
