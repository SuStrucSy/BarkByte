import { ChevronRightIcon, ExternalLinkIcon } from "lucide-react";
import type { Doi } from "@/api/model/doi";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetTitle,
} from "@/components/ui/sheet";
import { renderValue } from "@/lib/utils";
import type { SpecimenPublic } from "@/api/model";

type DOISheetProps = {
  doi: Doi;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  relatedSpecimens?: SpecimenPublic[];
};

function showRelatedSpecimens(relatedSpecimens: SpecimenPublic[]) {
  if (!relatedSpecimens || relatedSpecimens.length == 0) {
    return null;
  }
  return (
    <div className="flex flex-1 min-h-0 flex-col gap-2">
      <h3 className="text-xl font-semibold tracking-tight text-foreground">
        Publication Specimens
      </h3>
      <ScrollArea className="flex-1 min-h-0">
        <div className="grid gap-2">
          {relatedSpecimens.map((specimen) => (
            <Item key={specimen.id} variant="outline" asChild>
              <a
                href={`/specimens/${specimen.id}`}
                target="_blank"
                rel="noreferrer"
              >
                <ItemContent>
                  <ItemTitle>
                    {specimen.specimen_reference_id ?? specimen.id}
                  </ItemTitle>
                  <ItemDescription>
                    {renderValue(
                      specimen.joinery_type?.label ?? specimen.joinery_type,
                    )}
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <ChevronRightIcon className="size-4" />
                </ItemActions>
              </a>
            </Item>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export function DOISheet({
  doi,
  open = false,
  onOpenChange,
  relatedSpecimens = [],
}: DOISheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full flex-col px-6 py-6">
        <SheetTitle className="text-xl font-semibold tracking-tight text-foreground">
          DOI Details
        </SheetTitle>
        <div className="flex flex-1 min-h-0 flex-col gap-4">
          <dl className="grid gap-3 ">
            <div className="grid gap-1">
              <dt className="text-xs font-medium text-muted-foreground">
                Title
              </dt>
              <dd className="text-sm">{doi.ref_title}</dd>
            </div>

            <div className="grid gap-1">
              <dt className="text-xs font-medium text-muted-foreground">
                Author(s)
              </dt>
              <dd className="text-sm">{doi.authors}</dd>
            </div>

            <div className="grid gap-1">
              <dt className="text-xs font-medium text-muted-foreground">
                Publication year
              </dt>
              <dd className="text-sm">{doi.pub_year}</dd>
            </div>
          </dl>
          <Item variant="outline" asChild>
            <a href={doi.link} target="_blank" rel="noopener noreferrer">
              <ItemContent>
                <ItemTitle>Publication Record</ItemTitle>
                <ItemDescription>
                  View the full DOI record and publication details.
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <ExternalLinkIcon className="ml-1 inline-block h-4 w-4" />
              </ItemActions>
            </a>
          </Item>
          {showRelatedSpecimens(relatedSpecimens)}
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
