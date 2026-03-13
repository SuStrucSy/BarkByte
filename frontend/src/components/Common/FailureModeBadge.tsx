import { Badge } from "@/components/ui/badge";

const failureModeBadgeClasses = [
  "border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100",
  "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
  "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100",
  "border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100",
  "border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-100",
  "border-cyan-200 bg-cyan-50 text-cyan-800 hover:bg-cyan-100",
];

export function getFailureModeBadgeClass(label: string) {
  let hash = 0;
  for (let i = 0; i < label.length; i += 1) {
    hash = (hash * 31 + label.charCodeAt(i)) >>> 0;
  }
  return failureModeBadgeClasses[hash % failureModeBadgeClasses.length];
}

type FailureModeBadgeProps = React.ComponentProps<typeof Badge> & {
  label: string;
};

export function FailureModeBadge({
  label,
  className,
  children,
  ...props
}: FailureModeBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={[getFailureModeBadgeClass(label), className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children ?? label}
    </Badge>
  );
}
