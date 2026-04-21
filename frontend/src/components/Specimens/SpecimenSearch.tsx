import { useState, useMemo, useCallback, useEffect } from "react";
import { matchSorter, rankings } from "match-sorter";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import type { SpecimenPublic } from "@/api/model";
import { Button } from "../ui/button";
import { Search } from "lucide-react";

interface SpecimenSearchProps {
  specimens: SpecimenPublic[] | undefined;
  onSelect?: (specimen: SpecimenPublic) => void;
}

// --- Sub-components ---

interface HighlightedTextProps {
  text: string;
  query: string;
}

function HighlightedText({ text, query }: HighlightedTextProps) {
  if (!query || !text) return <span>{text}</span>;

  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const idx = lower.indexOf(q);

  if (idx === -1) return <span>{text}</span>;

  return (
    <span>
      {text.slice(0, idx)}
      <span className="text-primary font-semibold">
        {text.slice(idx, idx + q.length)}
      </span>
      {text.slice(idx + q.length)}
    </span>
  );
}

// --- Main component ---

export default function SpecimenSearch({
  specimens = [],
  onSelect,
}: SpecimenSearchProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");

  // Open with ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const specimenList = useMemo<SpecimenPublic[]>(
    () => Object.values(specimens),
    [specimens],
  );

  const results = useMemo<SpecimenPublic[]>(() => {
    if (!query.trim()) return [];
    return matchSorter(specimenList, query, {
      keys: ["specimen_reference_id"],
    });
  }, [query, specimenList]);

  const handleSelect = useCallback(
    (specimen: SpecimenPublic) => {
      onSelect?.(specimen);
      setOpen(false);
      setQuery("");
    },
    [onSelect],
  );

  const handleOpenChange = useCallback((value: boolean) => {
    setOpen(value);
    if (!value) setQuery("");
  }, []);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-muted-foreground max-w-xs"
      >
        <Search className="h-4 w-4" />
        <span>Search specimens...</span>
        <kbd className="ml-2 pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <CommandInput
          placeholder="Search by specimen reference ID..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No specimens found.</CommandEmpty>

          {results.length > 0 && (
            <CommandGroup heading={`${results.length} specimen(s)`}>
              {results.map((specimen) => (
                <CommandItem
                  key={specimen.id}
                  value={specimen.specimen_reference_id}
                  onSelect={() => handleSelect(specimen)}
                  className="flex flex-col items-start gap-1 py-2"
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="font-medium text-sm">
                      <HighlightedText
                        text={specimen.specimen_reference_id ?? "(no ID)"}
                        query={query}
                      />
                    </span>
                    <div className="flex gap-1">
                      {specimen.assembly_type && (
                        <Badge variant="secondary" className="text-xs">
                          {specimen.assembly_type}
                        </Badge>
                      )}
                      {specimen.e_test_loading_type && (
                        <Badge variant="outline" className="text-xs">
                          {specimen.e_test_loading_type}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {specimen.wood_type && <span>{specimen.wood_type}</span>}
                    {specimen.joinery_type?.label && (
                      <span>· {specimen.joinery_type.label}</span>
                    )}
                    {specimen.replicate_tests != null && (
                      <span>· {specimen.replicate_tests} replicate(s)</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
