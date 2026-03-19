import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { CircleHelp } from "lucide-react";
import type { ReactNode } from "react";

interface FieldHelpHoverProps {
  /** Short label shown above the SVG */
  title?: string;
  /** Optional explanatory text shown below the SVG */
  description?: string;
  /** The content to render inside the card */
  content: ReactNode;
  /** HoverCard open delay in ms (default: 200) */
  openDelay?: number;
}

/**
 * A small ❓ icon that, when hovered, opens a HoverCard containing an SVG/PNG
 * diagram and optional title / description text.
 *
 * Usage inside a FieldLabel:
 *
 *   <FieldLabel htmlFor="assembly_type">
 *     Assembly Type
 *     <FieldHelpHover
 *       title="Assembly Types"
 *       description="Single shear: two members. Double shear: three members."
 *       content={<AssemblyTypeSvg />}
 *     />
 *   </FieldLabel>
 */
export function FieldHelpHover({
  title,
  description,
  content,
  openDelay = 200,
}: FieldHelpHoverProps) {
  return (
    <HoverCard openDelay={openDelay}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          aria-label="Show help"
          // Prevent the click from bubbling into form controls / labels
          onClick={(e) => e.preventDefault()}
          className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm ml-1 align-middle"
        >
          <CircleHelp className="h-3.5 w-3.5" />
        </button>
      </HoverCardTrigger>

      <HoverCardContent
        side="right"
        align="start"
        className="w-auto p-3 space-y-2"
      >
        {title && (
          <p className="text-xs font-semibold text-foreground">{title}</p>
        )}

        {/* SVG container – constrains size while preserving aspect ratio */}
        <div className="flex items-center justify-center rounded-md bg-muted/40 p-2">
          {content}
        </div>

        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
