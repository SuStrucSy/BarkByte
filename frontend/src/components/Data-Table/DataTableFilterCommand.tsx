import { Input } from "@/components/ui/input";
import {
  type FailureModeFilterMode,
  parseStructuredFilterQuery,
  serializeStructuredFilterQuery,
  slugifyFilterValue,
  type StructuredFilterClause,
} from "@/components/Data-Table/specimenTableFilters";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface DataTableFilterCommandProps {
  value: string;
  onValueChange: (value: string) => void;
  onCommitValueChange: (value: string) => void;
  searchField: string;
  onSearchFieldChange: (value: string) => void;
  fieldOptions?: Record<string, string[]>;
}

export function DataTableFilterCommand({
  value,
  onValueChange,
  onCommitValueChange,
  searchField,
  onSearchFieldChange,
  fieldOptions,
}: DataTableFilterCommandProps) {
  const FAILURE_MODE_FILTER_MODES: FailureModeFilterMode[] = [
    "any",
    "all",
    "exact",
  ];
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const getExternalDisplayValue = () => value;

  useEffect(() => {
    if (open) return;
    setInputValue(getExternalDisplayValue());
  }, [searchField, value, open]);

  useEffect(() => {
    if (!open) return;
    setInputValue(getExternalDisplayValue());
    setHighlightedIndex(0);
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
        setInputValue(getExternalDisplayValue());
        setOpen(false);
      }
    };

    const onMouseDown = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setInputValue(getExternalDisplayValue());
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onMouseDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [searchField, value]);

  const parseAndEmit = (rawValue: string) => {
    onSearchFieldChange("all");
    onValueChange(rawValue);
  };

  const commitValue = (rawValue: string) => {
    onSearchFieldChange("all");
    onCommitValueChange(rawValue);
  };

  const suggestionContext = useMemo(() => {
    const rawSegments = inputValue.split(";");
    const currentSegment = rawSegments[rawSegments.length - 1]?.trim() ?? "";
    const completedSegments = rawSegments.slice(0, -1).join(";");
    const completedClauses = parseStructuredFilterQuery(completedSegments);

    if (!currentSegment.includes(":")) {
      const dotIndex = currentSegment.indexOf(".");
      if (dotIndex !== -1) {
        return {
          mode: "operator" as const,
          field: currentSegment.slice(0, dotIndex).trim().toLowerCase(),
          query: currentSegment.slice(dotIndex + 1).trim().toLowerCase(),
          completedClauses,
        };
      }

      return {
        mode: "field" as const,
        query: currentSegment.toLowerCase(),
        completedClauses,
      };
    }

    const firstColon = currentSegment.indexOf(":");
    const fieldWithMode = currentSegment
      .slice(0, firstColon)
      .trim()
      .toLowerCase();
    const [field, rawMode] = fieldWithMode.split(".");
    const rawValuePart = currentSegment.slice(firstColon + 1);
    const rawValueSegments = rawValuePart.split(",");
    const currentValueQuery =
      rawValueSegments[rawValueSegments.length - 1]?.trim().toLowerCase() ?? "";
    const committedValues = rawValueSegments
      .slice(0, -1)
      .map((value: string) => slugifyFilterValue(value))
      .filter(Boolean);

    return {
      mode: "value" as const,
      field,
      clauseMode:
        field === "failure_modes" &&
        (rawMode === "any" || rawMode === "all" || rawMode === "exact")
          ? rawMode
          : undefined,
      query: currentValueQuery,
      committedValues,
      completedClauses,
    };
  }, [inputValue]);

  const suggestions = useMemo(() => {
    if (suggestionContext.mode === "operator") {
      if (suggestionContext.field !== "failure_modes") {
        return [];
      }

      return FAILURE_MODE_FILTER_MODES.map((mode) => ({
        key: `failure_modes.${mode}`,
        label: `failure_modes.${mode}`,
        field: "failure_modes",
        clauseMode: mode,
        value: "",
        displayValue: mode,
        mode: "operator" as const,
      })).filter((suggestion) =>
        suggestionContext.query === "" ||
        suggestion.label.includes(suggestionContext.query),
      );
    }

    if (suggestionContext.mode === "value") {
      const options = fieldOptions?.[suggestionContext.field] ?? [];
      return options
        .map((option) => {
          const slug = slugifyFilterValue(option);
          const fieldLabel =
            suggestionContext.field === "failure_modes" &&
            suggestionContext.clauseMode
              ? `${suggestionContext.field}.${suggestionContext.clauseMode}`
              : suggestionContext.field;
          return {
            key: `${suggestionContext.field}:${slug}`,
            label: `${fieldLabel}:${[
              ...suggestionContext.committedValues,
              slug,
            ].join(",")}`,
            field: suggestionContext.field,
            clauseMode: suggestionContext.clauseMode,
            value: slug,
            displayValue: option,
            mode: "value" as const,
          };
        })
        .filter(
          (suggestion) =>
            !suggestionContext.committedValues.includes(suggestion.value) &&
            (suggestionContext.query === "" ||
              suggestion.value.includes(
                suggestionContext.query.replace(/\s+/g, "_"),
              ) ||
              suggestion.displayValue
                .toLowerCase()
                .includes(suggestionContext.query)),
        )
        .slice(0, 20)
        .sort((left, right) => left.label.localeCompare(right.label));
    }

    return Object.entries(fieldOptions ?? {})
      .flatMap(([field, options]) =>
        field === "failure_modes"
          ? FAILURE_MODE_FILTER_MODES.map((mode) => ({
              key: `${field}.${mode}`,
              label: `${field}.${mode}:`,
              field,
              clauseMode: mode,
              value: "",
              displayValue: `${field} ${mode}`,
              mode: "field" as const,
            }))
          : options.map((option) => {
              const slug = slugifyFilterValue(option);
              return {
                key: `${field}:${slug}`,
                label: `${field}:${slug}`,
                field,
                value: slug,
                displayValue: option,
                mode: "field" as const,
              };
            }),
      )
      .filter(
        (suggestion) =>
          suggestionContext.query === "" ||
          suggestion.value.includes(
            suggestionContext.query.replace(/\s+/g, "_"),
          ) ||
          suggestion.displayValue
            .toLowerCase()
            .includes(suggestionContext.query) ||
          suggestion.label.includes(suggestionContext.query),
      )
      .slice(0, 20)
      .sort((left, right) => left.label.localeCompare(right.label));
  }, [fieldOptions, suggestionContext]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [suggestions]);

  const applySuggestion = (suggestion: {
    field: string;
    clauseMode?: FailureModeFilterMode;
    value: string;
    mode: "field" | "operator" | "value";
  }) => {
    if (suggestion.mode === "field" && suggestion.field === "failure_modes") {
      const next = `${suggestion.field}.${suggestion.clauseMode}:`;
      setInputValue(next);
      onSearchFieldChange("all");
      onValueChange(next);
      inputRef.current?.focus();
      return;
    }

    if (suggestion.mode === "operator") {
      const next = `${suggestion.field}.${suggestion.clauseMode}:`;
      setInputValue(next);
      onSearchFieldChange("all");
      onValueChange(next);
      inputRef.current?.focus();
      return;
    }

    const nextClauses = suggestionContext.completedClauses
      .filter((clause) => clause.field !== suggestion.field)
      .map((clause) => ({ ...clause }));
    const existingClause = suggestionContext.completedClauses.find(
      (clause) => clause.field === suggestion.field,
    );

    const mergedValues = Array.from(
      new Set([
        ...(existingClause?.values ?? []),
        ...(suggestionContext.mode === "value"
          ? suggestionContext.field === suggestion.field
            ? suggestionContext.committedValues
            : []
          : []),
        suggestion.value,
      ]),
    );

    nextClauses.push({
      field: suggestion.field,
      mode: suggestion.clauseMode ?? existingClause?.mode,
      values: mergedValues,
    } satisfies StructuredFilterClause);

    const next = `${serializeStructuredFilterQuery(nextClauses)};`;
    setInputValue(next);
    onSearchFieldChange("all");
    onValueChange(next);
    onCommitValueChange(next);
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
          onKeyDown={(event) => {
            if (!suggestions.length) return;

            if (event.key === "ArrowDown") {
              event.preventDefault();
              setHighlightedIndex((prev) =>
                prev === suggestions.length - 1 ? 0 : prev + 1,
              );
            }

            if (event.key === "ArrowUp") {
              event.preventDefault();
              setHighlightedIndex((prev) =>
                prev === 0 ? suggestions.length - 1 : prev - 1,
              );
            }

            if (event.key === "Enter") {
              event.preventDefault();
              if (suggestions[highlightedIndex]) {
                applySuggestion(suggestions[highlightedIndex]);
                return;
              }
              commitValue(inputValue);
            }
          }}
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
          onClick={() => {
            commitValue(inputValue);
            setOpen(false);
          }}
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
                className={`flex w-full items-center rounded px-2 py-1.5 text-left text-sm hover:bg-muted ${
                  suggestions[highlightedIndex]?.key === suggestion.key
                    ? "bg-muted"
                    : ""
                }`}
              >
                {suggestion.label}
              </button>
            ))}
            </div>
          ) : (
            <p className="px-2 py-1 text-sm text-muted-foreground">
              Use `field:value` or `failure_modes.all:value` to filter.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
