import { Badge } from "@/components/ui/badge";

/**
 * Uses the golden angle (≈137.5°) to spread hues across the colour wheel.
 * Because 137.508° is irrational relative to 360°, consecutive hash values
 * land as far apart as possible before wrapping — no fixed palette size needed,
 * so adding new failure modes to the database requires no code changes.
 */
const GOLDEN_ANGLE = 137.508;

export function getFailureModeHue(label: string): number {
  let hash = 0;
  for (let i = 0; i < label.length; i += 1) {
    hash = (hash * 31 + label.charCodeAt(i)) >>> 0;
  }
  return (hash * GOLDEN_ANGLE) % 360;
}

type FailureModeBadgeProps = React.ComponentProps<typeof Badge> & {
  label: string;
};

export function FailureModeBadge({
  label,
  className,
  children,
  style,
  ...props
}: FailureModeBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={["badge-failure-mode", className].filter(Boolean).join(" ")}
      style={
        {
          "--badge-hue": getFailureModeHue(label),
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {children ?? label}
    </Badge>
  );
}
