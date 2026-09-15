export function YanaTrustMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 240"
      className={className}
      aria-hidden="true"
      role="img"
    >
      <defs>
        <clipPath id="yana-left-half">
          <rect x="0" y="0" width="100" height="240" />
        </clipPath>
        <clipPath id="yana-right-half">
          <rect x="100" y="0" width="100" height="240" />
        </clipPath>
      </defs>

      <path
        d="M100,232 C100,232 18,138 18,90 A82,82 0 1,1 182,90 C182,138 100,232 100,232 Z"
        fill="#11633B"
        clipPath="url(#yana-left-half)"
      />
      <path
        d="M100,232 C100,232 18,138 18,90 A82,82 0 1,1 182,90 C182,138 100,232 100,232 Z"
        fill="#FFB703"
        clipPath="url(#yana-right-half)"
      />

      <path
        d="M62,92 L90,118 L140,60"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
