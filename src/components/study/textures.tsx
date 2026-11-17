/**
 * Ambient neobrutalism backdrop: warm cream page, a faint dot grid and
 * scattered geometric sticker shapes (stars, diamonds, circles, squiggle)
 * floating around the edges — like the reference poster.
 */
export function Textures() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* cream base + dot grid */}
      <div className="absolute inset-0 bg-dots" />

      {/* scattered shapes — desktop only, kept to the edges */}
      <div className="neo-shape left-[3%] top-[12%] hidden lg:block">
        <Star className="h-7 w-7 text-nb-yellow" />
      </div>
      <div className="neo-shape right-[5%] top-[9%] hidden lg:block">
        <Sparkle className="h-6 w-6 text-nb-red" />
      </div>
      <div className="neo-shape left-[6%] top-[58%] hidden lg:block">
        <Diamond className="h-5 w-5 text-nb-teal" />
      </div>
      <div className="neo-shape right-[7%] top-[52%] hidden lg:block">
        <Circle className="h-6 w-6 text-nb-purple" />
      </div>
      <div className="neo-shape left-[10%] bottom-[10%] hidden lg:block">
        <Star className="h-5 w-5 text-nb-pink" />
      </div>
      <div className="neo-shape right-[11%] bottom-[14%] hidden lg:block">
        <Diamond className="h-6 w-6 text-nb-orange" />
      </div>
      <div className="neo-shape left-[45%] top-[6%] hidden xl:block">
        <Circle className="h-4 w-4 text-nb-teal" />
      </div>
      <div className="neo-shape right-[38%] bottom-[7%] hidden xl:block">
        <Sparkle className="h-5 w-5 text-nb-yellow" />
      </div>

      {/* tiny shapes visible on tablet, hidden on phones to stay clean */}
      <div className="neo-shape right-[3%] top-[30%] hidden md:block lg:hidden">
        <Star className="h-5 w-5 text-nb-purple" />
      </div>
      <div className="neo-shape left-[2%] top-[40%] hidden md:block lg:hidden">
        <Diamond className="h-5 w-5 text-nb-red" />
      </div>
    </div>
  );
}

/* ---------------- inline shape SVGs ---------------- */

function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 1.8l2.7 6.6 7.1.5-5.4 4.6 1.7 6.9-6.1-3.7-6.1 3.7 1.7-6.9L2.2 8.9l7.1-.5L12 1.8z" />
    </svg>
  );
}

function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2z" />
      <path d="M19 15l.9 2.6L22.5 18.5l-2.6.9L19 22l-.9-2.6-2.6-.9 2.6-.9L19 15z" />
    </svg>
  );
}

function Diamond({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <rect x="6" y="6" width="12" height="12" rx="2.5" transform="rotate(45 12 12)" />
    </svg>
  );
}

function Circle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}
