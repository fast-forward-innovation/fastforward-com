export function DefaultAvatar({
  className,
  ariaLabel,
}: {
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 160"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel ?? "Person at a computer"}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="14" y1="142" x2="186" y2="142" />

      <circle cx="60" cy="48" r="16" />

      <path d="M 53 64 C 44 80, 44 100, 56 116 L 56 132" />
      <path d="M 68 64 C 76 76, 78 90, 75 102" />

      <path d="M 70 82 C 90 92, 108 108, 122 128" />

      <rect x="118" y="72" width="62" height="48" rx="3" />
      <line x1="126" y1="84" x2="152" y2="84" />
      <line x1="126" y1="94" x2="170" y2="94" />
      <line x1="126" y1="104" x2="146" y2="104" />

      <line x1="149" y1="120" x2="149" y2="134" />
      <line x1="136" y1="134" x2="162" y2="134" />

      <line x1="38" y1="100" x2="38" y2="142" />
      <line x1="38" y1="100" x2="56" y2="100" />
    </svg>
  );
}
