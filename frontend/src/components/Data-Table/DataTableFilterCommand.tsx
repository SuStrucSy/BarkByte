import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface DataTableFilterCommandProps {
  value: string;
  onValueChange: (value: string) => void;
  searchField: string;
  onSearchFieldChange: (value: string) => void;
  fieldOptions?: Record<string, string[]>;
}

export function DataTableFilterCommand({
  value,
  onValueChange,
  searchField,
  onSearchFieldChange,
  fieldOptions,
}: DataTableFilterCommandProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");

  const getExternalDisplayValue = () =>
    searchField === "all" || value.trim().length === 0
      ? value
      : `${searchField}:${value}`;

  useEffect(() => {
    if (open) return;
    setInputValue(getExternalDisplayValue());
  }, [searchField, value, open]);

  useEffect(() => {
    if (!open) return;
    setInputValue(getExternalDisplayValue());
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && key === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
      if (key === "escape") {
        setOpen(false);
      }
    };

    const onMouseDown = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onMouseDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, []);

  const parseAndEmit = (rawValue: string) => {
    // Allow multi-token command strings like:
    // assembly:Wall-Floor, sub_joinery:AB:Elastomeric Angle Bracket
    if (rawValue.includes(",")) {
      onSearchFieldChange("all");
      onValueChange(rawValue);
      return;
    }

    const colonIndex = rawValue.indexOf(":");
    if (colonIndex === -1) {
      onSearchFieldChange("all");
      onValueChange(rawValue);
      return;
    }

    const rawField = rawValue.slice(0, colonIndex).trim().toLowerCase();
    const rawTerm = rawValue.slice(colonIndex + 1);
    const allowedFields = new Set(Object.keys(fieldOptions ?? {}));
    if (allowedFields.has(rawField)) {
      onSearchFieldChange(rawField);
      onValueChange(rawTerm);
      return;
    }

    onSearchFieldChange("all");
    onValueChange(rawValue);
  };

  const suggestions = useMemo(() => {
    const lastCommaIndex = inputValue.lastIndexOf(",");
    const prefix =
      lastCommaIndex === -1 ? "" : `${inputValue.slice(0, lastCommaIndex + 1)} `;
    const segment =
      lastCommaIndex === -1
        ? inputValue.trimStart()
        : inputValue.slice(lastCommaIndex + 1).trimStart();

    const colonIndex = segment.indexOf(":");
    if (colonIndex === -1) {
      const q = segment.trim().toLowerCase();
      const fields = Object.keys(fieldOptions ?? {});
      return fields
        .filter((field) => field.includes(q))
        .map((field) => ({
          key: `field:${field}`,
          label: `${field}:`,
          kind: "field" as const,
          value: field,
          prefix,
        }));
    }

    const rawField = segment.slice(0, colonIndex).trim().toLowerCase();
    const rawTerm = segment.slice(colonIndex + 1).trim().toLowerCase();
    if (!fieldOptions?.[rawField]) {
      return [];
    }
    return (fieldOptions[rawField] ?? [])
      .filter((option) => option.toLowerCase().includes(rawTerm))
      .slice(0, 20)
      .map((option) => ({
        key: `value:${rawField}:${option}`,
        label: option,
        kind: "value" as const,
        value: option,
        field: rawField,
        prefix,
      }));
  }, [inputValue, fieldOptions]);

  const applySuggestion = (
    suggestion:
      | { kind: "field"; value: string; prefix?: string }
      | { kind: "value"; value: string; field: string; prefix?: string },
  ) => {
    const prefix = suggestion.prefix ?? "";
    if (suggestion.kind === "field") {
      const next = `${prefix}${suggestion.value}:`;
      setInputValue(next);
      onSearchFieldChange("all");
      onValueChange(next);
      inputRef.current?.focus();
      return;
    }

    const next = `${prefix}${suggestion.field}:${suggestion.value}`;
    setInputValue(next);
    onSearchFieldChange("all");
    onValueChange(next);
    inputRef.current?.focus();
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex w-full items-center rounded-lg border border-input bg-background px-3 text-muted-foreground ring-offset-background hover:bg-accent/50 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <span className="h-11 w-full max-w-sm truncate py-3 text-left text-sm md:max-w-xl lg:max-w-4xl xl:max-w-5xl">
          {value.trim() ? (
            <span className="text-foreground">
              {getExternalDisplayValue()}
            </span>
          ) : (
            <span>Search data table...</span>
          )}
        </span>
        <span className="ml-auto rounded border px-2 py-0.5 text-xs text-muted-foreground">
          ⌘K
        </span>
      </button>
    );
  }

  return (
    <div ref={rootRef} className="relative w-full">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 shadow-sm">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground opacity-50" />
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(event) => {
            const next = event.target.value;
            setInputValue(next);
            parseAndEmit(next);
          }}
          placeholder="Search data table..."
          className="h-11 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
        />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex h-8 w-8 items-center justify-center rounded text-muted-foreground hover:bg-muted"
          aria-label="Close search"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-lg border border-border bg-background shadow-md">
        <div className="max-h-[280px] overflow-auto p-2">
          {suggestions.length ? (
            <div className="space-y-1">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.key}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => applySuggestion(suggestion)}
                className="flex w-full items-center rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
              >
                {suggestion.label}
              </button>
            ))}
            </div>
          ) : (
            <p className="px-2 py-1 text-sm text-muted-foreground">
              Use `field:value` to filter.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
