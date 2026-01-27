import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import type { SpecimenPublic } from "@/api/model";
import {
  EXPERIMENTAL_KEYS,
  getExperimentalLabel,
  getExperimentalUnit,
} from "@/lib/constants";
import { Button } from "../ui/button";
import { Link } from "@tanstack/react-router";

interface SpecimenSheetProps {
  specimen: SpecimenPublic | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SpecimenSheet({
  specimen,
  open,
  onOpenChange,
}: SpecimenSheetProps) {
  if (!specimen) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {specimen.specimen_reference_id}
            <Badge variant="outline" className="text-xs">
              {specimen.joinery_type?.label}
            </Badge>
          </SheetTitle>
          <SheetClose />
        </SheetHeader>

        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              Experimental Results
            </h3>
            {EXPERIMENTAL_KEYS.map((key) => {
              const value = specimen[key as keyof SpecimenPublic];
              if (value == null) return null;

              return (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {getExperimentalLabel(key)}
                  </span>
                  <span className="font-mono font-semibold">
                    {(value as number).toFixed(2)}
                    <span className="ml-1 text-muted-foreground text-xs font-normal">
                      {getExperimentalUnit(key)}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>

          {specimen.note && (
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-2">
                Notes
              </h3>
              <p className="text-sm leading-relaxed">{specimen.note}</p>
            </div>
          )}
        </div>
        <SheetFooter>
          <Button asChild>
            <Link href={`/specimens/${specimen.id}`}>More Details</Link>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
