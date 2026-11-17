/** Petit cochon à lunettes. Ses pattes s'animent quand un parent a la classe `pig-walking` (voir globals.css). */
export function WalkingPig({ width = 76 }: { width?: number }) {
  return (
    <svg viewBox="0 0 100 68" width={width} height={(width * 68) / 100} aria-hidden className="block overflow-visible">
      <g className="pig-bob">
        <g className="pig-leg pig-leg-b" style={{ transformOrigin: "29px 44px" }}>
          <rect x="24" y="42" width="10" height="20" rx="5" fill="#e48e87" stroke="#1a1a1a" strokeWidth="3" />
        </g>
        <g className="pig-leg pig-leg-a" style={{ transformOrigin: "61px 44px" }}>
          <rect x="56" y="42" width="10" height="20" rx="5" fill="#e48e87" stroke="#1a1a1a" strokeWidth="3" />
        </g>
        <path d="M14 30c-8-2-9-12-2-13 5-1 7 5 3 6" fill="none" stroke="#1a1a1a" strokeWidth="3.2" strokeLinecap="round" className="pig-tail" />
        <ellipse cx="46" cy="36" rx="30" ry="20" fill="#f6aaa0" stroke="#1a1a1a" strokeWidth="3.4" />
        <g className="pig-leg pig-leg-a" style={{ transformOrigin: "35px 46px" }}>
          <rect x="30" y="44" width="10" height="19" rx="5" fill="#f6aaa0" stroke="#1a1a1a" strokeWidth="3" />
        </g>
        <g className="pig-leg pig-leg-b" style={{ transformOrigin: "67px 46px" }}>
          <rect x="62" y="44" width="10" height="19" rx="5" fill="#f6aaa0" stroke="#1a1a1a" strokeWidth="3" />
        </g>
        <path d="M66 20 70 4c3-1 9 5 11 15z" fill="#e8847c" stroke="#1a1a1a" strokeWidth="3" strokeLinejoin="round" />
        <circle cx="76" cy="32" r="16" fill="#f6aaa0" stroke="#1a1a1a" strokeWidth="3.4" />
        <rect x="85" y="30" width="14" height="12" rx="6" fill="#f08c85" stroke="#1a1a1a" strokeWidth="3" />
        <circle cx="90" cy="36" r="1.5" fill="#1a1a1a" />
        <circle cx="95" cy="36" r="1.5" fill="#1a1a1a" />
        <path d="M60 25q-6-1-9 2" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
        <rect x="70" y="24" width="17" height="9" rx="3.5" fill="#1a1a1a" />
        <path d="M73 27l4-1" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M80 41q4 3 8 1" fill="none" stroke="#1a1a1a" strokeWidth="2.4" strokeLinecap="round" />
      </g>
    </svg>
  );
}
