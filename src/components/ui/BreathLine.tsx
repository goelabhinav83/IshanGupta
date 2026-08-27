type BreathLineProps = {
  className?: string;
  strokeClassName?: string;
};

/**
 * Signature motif: a gentle respiratory waveform, evoking a spirometry /
 * breath trace. The dash pattern animates back and forth (see
 * .breath-line in globals.css) like an inhale/exhale, and is frozen to a
 * static line under prefers-reduced-motion.
 */
export default function BreathLine({ className = "", strokeClassName = "text-teal-500" }: BreathLineProps) {
  return (
    <svg
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
      className={`breath-line w-full ${className}`}
      aria-hidden="true"
    >
      <path
        d="M0,60 C60,60 90,20 150,20 C210,20 220,95 280,95 C340,95 350,40 410,40 C460,40 470,70 520,70 C580,70 600,10 660,10 C720,10 730,100 790,100 C850,100 860,45 920,45 C970,45 980,65 1030,65 C1080,65 1100,60 1200,60"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="12 8"
        className={strokeClassName}
        stroke="currentColor"
      />
    </svg>
  );
}
