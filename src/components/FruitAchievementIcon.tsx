import type { FruitKind } from "@/lib/achievements";

type FruitAchievementIconProps = {
  fruit: FruitKind;
  size?: number;
  unlocked?: boolean;
  className?: string;
};

/** Small 2D fruit badge for profile achievements. */
export function FruitAchievementIcon({
  fruit,
  size = 32,
  unlocked = true,
  className = "",
}: FruitAchievementIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      role="img"
      aria-hidden
      className={`${unlocked ? "" : "opacity-35 grayscale"} ${className}`}
    >
      {fruit === "raspberry" && <Raspberry />}
      {fruit === "orange" && <Orange />}
      {fruit === "strawberry" && <Strawberry />}
      {fruit === "grape" && <Grape />}
      {fruit === "starfruit" && <Starfruit />}
    </svg>
  );
}

function Raspberry() {
  return (
    <>
      <circle cx="16" cy="18" r="10" fill="#e91e8c" stroke="#1a1a1a" strokeWidth="1.5" />
      {[
        [12, 10],
        [16, 8],
        [20, 10],
        [14, 12],
        [18, 12],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.2" fill="#ff9ec8" />
      ))}
      <path
        d="M11 9 Q16 4 21 9"
        fill="none"
        stroke="#22c55e"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <ellipse cx="13" cy="16" rx="1.5" ry="2.5" fill="#1a1a1a" />
      <ellipse cx="19" cy="16" rx="1.5" ry="2.5" fill="#1a1a1a" />
    </>
  );
}

function Orange() {
  return (
    <>
      <circle cx="16" cy="17" r="11" fill="#f97316" stroke="#1a1a1a" strokeWidth="1.5" />
      <circle cx="12" cy="13" r="2" fill="#fdba74" opacity="0.6" />
      <path d="M16 6 Q18 3 20 6" fill="none" stroke="#22c55e" strokeWidth="2" />
      <ellipse cx="13" cy="16" rx="1.5" ry="2.5" fill="#1a1a1a" />
      <ellipse cx="19" cy="16" rx="1.5" ry="2.5" fill="#1a1a1a" />
      <path d="M14 20 Q16 22 18 20" fill="none" stroke="#1a1a1a" strokeWidth="1.2" />
    </>
  );
}

function Strawberry() {
  return (
    <>
      <path
        d="M8 18 Q16 28 24 18 Q16 10 8 18 Z"
        fill="#ef4444"
        stroke="#1a1a1a"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {[
        [12, 16],
        [16, 18],
        [20, 16],
        [14, 20],
        [18, 21],
        [16, 14],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="0.8" fill="#fde047" />
      ))}
      <path
        d="M10 12 L12 8 L16 10 L20 8 L22 12"
        fill="#22c55e"
        stroke="#1a1a1a"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <ellipse cx="14" cy="17" rx="1.2" ry="2" fill="#1a1a1a" />
      <ellipse cx="18" cy="17" rx="1.2" ry="2" fill="#1a1a1a" />
    </>
  );
}

function Grape() {
  return (
    <>
      {[
        [16, 22],
        [12, 18],
        [20, 18],
        [10, 14],
        [16, 14],
        [22, 14],
        [14, 10],
        [18, 10],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill="#a855f7" stroke="#1a1a1a" strokeWidth="1" />
      ))}
      <path d="M16 8 Q18 5 20 8" fill="none" stroke="#22c55e" strokeWidth="2" />
      <ellipse cx="14" cy="20" rx="1" ry="1.8" fill="#1a1a1a" />
      <ellipse cx="18" cy="20" rx="1" ry="1.8" fill="#1a1a1a" />
    </>
  );
}

function Starfruit() {
  return (
    <>
      <path
        d="M16 6 L18.5 13 L26 13 L20 17.5 L22.5 25 L16 20.5 L9.5 25 L12 17.5 L6 13 L13.5 13 Z"
        fill="#facc15"
        stroke="#1a1a1a"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <ellipse cx="14" cy="16" rx="1.2" ry="2" fill="#1a1a1a" />
      <ellipse cx="18" cy="16" rx="1.2" ry="2" fill="#1a1a1a" />
      <path d="M14 19 Q16 21 18 19" fill="none" stroke="#1a1a1a" strokeWidth="1" />
    </>
  );
}
