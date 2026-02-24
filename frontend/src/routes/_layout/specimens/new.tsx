import { useDoiGetDois } from "@/api/endpoints/doi/doi.gen";
import { createFileRoute } from "@tanstack/react-router";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import type { DOIPublic, HTTPValidationError } from "@/api/model";
import { SpecimenDetailsFields } from "@/components/Specimens/SpecimenDetailsFields";
import { DoiFields } from "@/components/Doi/DoiFields";
import { useState, useEffect, useRef } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";

import {
  AddNewSpecimenSchema,
  type AddNewSpecimenFormValues,
} from "@/lib/schemas";
import { SpecimenStructuralFields } from "@/components/Specimens/SpecimenStructuralFields";
import { SpecimenExperimentalFields } from "@/components/Specimens/SpecimenExperimentalFields";
import { useSpecimensCreateSpecimen } from "@/api/endpoints/specimens/specimens.gen";
import { handleError } from "@/utils";

export const Route = createFileRoute("/_layout/specimens/new")({
  component: NewSpecimen,
});

const steps = [
  {
    id: "doi",
    title: "DOI Details",
    description:
      "Link this specimen to a published paper. You can search for an existing DOI or enter a new one manually.",
    fields: ["authors", "link", "pub_year", "ref_title"] as const,
  },
  {
    id: "specimen-info",
    title: "Specimen Details",
    description:
      "Describe the physical specimen and its connection properties.",
    fields: [
      "specimen_reference_id",
      "assembly_type",
      "joinery_type_id",
      "sub_joinery_type_id",
      "fastener_type_ids",
      "loading_direction_ids",
      "practice",
      "fastener_numbers",
      "connector",
      "dowel",
      "replicate_tests",
      "connection_description",
      "note",
    ] as const,
  },
  {
    id: "specimen-structural-data",
    title: "Structural Data",
    description: "Enter material properties.",
    fields: [
      "element_dimension",
      "moisture_percentage",
      "wood_type",
      "wood_mechanical_properties",
      "fastener_mechanical_properties",
      "connector_mechanical_properties",
    ] as const,
  },
  {
    id: "specimen-experimental-data",
    title: "Experimental Data",
    description: "Enter experimental results.",
    fields: [
      "e_stiffness",
      "e_yield_force",
      "e_yield_displacement",
      "e_max_force",
      "e_max_displacement",
      "e_ultimate_force",
      "e_ultimate_displacement",
      "e_ductility",
      "e_test_loading_type",
      "e_yield_point_method",
      "e_measurement_unit",
      "e_date",
      "e_qualitative_failure_measure",
      "e_qfm_description",
    ] as const,
  },
] as const;

// ─── Submit button that ignores phantom clicks on mount ──────────────────────
//
// When the Next button on step 3 is clicked, React re-renders synchronously and
// swaps Next out for Submit. The browser's mouseup event then fires on the newly
// mounted Submit button at the same screen position, which the browser treats as
// a full click — triggering form submission immediately.
//
// The fix: track whether this button just mounted. If a click arrives within the
// same event-loop tick as mounting (i.e. before any useEffect has run), it's a
// phantom click from the step transition and we ignore it.
function SubmitButton({ disabled }: { disabled: boolean }) {
  const justMounted = useRef(true);

  useEffect(() => {
    // After the first paint, real clicks are welcome
    justMounted.current = false;
  }, []);

  return (
    <Button
      type="submit"
      disabled={disabled}
      onClick={(e) => {
        if (justMounted.current) {
          e.preventDefault();
        }
      }}
    >
      {disabled ? (
        <>
          <Spinner className="h-4 w-4" />
          Submitting…
        </>
      ) : (
        "Submit for Review"
      )}
    </Button>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

function NewSpecimen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDoi, setSelectedDoi] = useState<DOIPublic | null>(null);

  const form = useForm<AddNewSpecimenFormValues>({
    resolver: zodResolver(AddNewSpecimenSchema),
    defaultValues: {
      authors: "",
      link: "",
      pub_year: new Date().getFullYear(),
      ref_title: "",
      specimen_reference_id: "",
      assembly_type: undefined as any,
      joinery_type_id: "",
      sub_joinery_type_id: "",
      fastener_type_ids: [],
      loading_direction_ids: [],
      practice: undefined as any,
      fastener_numbers: 1,
      connector: false,
      dowel: false,
      replicate_tests: 1,
      connection_description: "",
      note: "",
      element_dimension: "",
      moisture_percentage: "",
      wood_type: "",
      wood_mechanical_properties: "",
      fastener_mechanical_properties: "",
      connector_mechanical_properties: "",
      e_stiffness: null,
      e_yield_force: null,
      e_yield_displacement: null,
      e_max_force: null,
      e_max_displacement: null,
      e_ultimate_force: null,
      e_ultimate_displacement: null,
      e_ductility: null,
      e_test_loading_type: null,
      e_yield_point_method: null,
      e_measurement_unit: "",
      e_date: "",
      e_qfm_description: "",
      e_qualitative_failure_measure: [],
    } as AddNewSpecimenFormValues,
    mode: "onChange",
  });

  const { data: doisData, isLoading: isDoisLoading } = useDoiGetDois();

  const currentStepConfig = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleDoiSelect = (doi: DOIPublic | null) => {
    setSelectedDoi(doi);
    if (doi) {
      form.setValue("link", doi.link, { shouldValidate: true });
      form.setValue("ref_title", doi.ref_title, { shouldValidate: true });
      form.setValue("authors", doi.authors, { shouldValidate: true });
      form.setValue("pub_year", doi.pub_year, { shouldValidate: true });
      if (doi.id) {
        form.setValue("doi_id", doi.id, { shouldValidate: true });
      }
    } else {
      form.setValue("doi_id", undefined);
      form.setValue("link", "");
      form.setValue("ref_title", "");
      form.setValue("authors", "");
      form.setValue("pub_year", new Date().getFullYear());
    }
  };

  const handleNextButton = async () => {
    const fields = [...currentStepConfig.fields] as Array<
      keyof AddNewSpecimenFormValues
    >;
    const isValid = await form.trigger(fields);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBackButton = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const mutation = useSpecimensCreateSpecimen({
    mutation: {
      onSuccess: () => {
        toast.success("Specimen submitted for review!", {
          description:
            "Your specimen has been submitted and is pending approval.",
          position: "bottom-right",
        });
        form.reset();
        setCurrentStep(0);
        setSelectedDoi(null);
      },
      onError: (err: void | HTTPValidationError) => {
        handleError(err);
      },
      onSettled: () => {
        //
      },
    },
  });

  async function onSubmit(values: AddNewSpecimenFormValues) {
    console.log({ values });
    try {
      mutation.mutateAsync({ data: values });
    } catch (err) {
      toast.error("Submission failed", {
        description: err instanceof Error ? err.message : "Unknown error",
        position: "bottom-right",
      });
    }
  }

  const renderCurrentStepContent = () => {
    switch (currentStep) {
      case 0:
        return <DoiFields control={form.control} readOnly={!!selectedDoi} />;
      case 1:
        return <SpecimenDetailsFields control={form.control} />;
      case 2:
        return <SpecimenStructuralFields control={form.control} />;
      case 3:
        return <SpecimenExperimentalFields control={form.control} />;
      default:
        return null;
    }
  };

  const dois: DOIPublic[] = doisData?.data || [];

  return (
    <div className="w-6xl space-y-4 self-center">
      {/* ── Existing DOI quick-fill ─────────────────────────────────────── */}
      {currentStep === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4" />
              Use an existing DOI
            </CardTitle>
            <CardDescription>
              Search the database to auto-fill the paper details below, or skip
              this and enter them manually.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Combobox
              items={dois}
              itemToStringValue={(doi: DOIPublic) => doi.id ?? doi.link}
              itemToStringLabel={(doi: DOIPublic) => doi.ref_title}
              onValueChange={(doi: DOIPublic | null) => handleDoiSelect(doi)}
              disabled={isDoisLoading}
            >
              <ComboboxInput
                placeholder={
                  isDoisLoading ? "Loading DOIs…" : "Search by title or link…"
                }
                showClear
              />
              <ComboboxContent>
                <ComboboxEmpty>No matching DOIs found.</ComboboxEmpty>
                <ComboboxList>
                  {(doi) => (
                    <ComboboxItem key={doi.id} value={doi}>
                      <Item size="sm" className="p-0">
                        <ItemContent>
                          <ItemTitle className="line-clamp-1">
                            {doi.ref_title}
                          </ItemTitle>
                          <ItemDescription className="line-clamp-1">
                            {doi.link}
                          </ItemDescription>
                        </ItemContent>
                      </Item>
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>

            {selectedDoi && (
              <p className="text-xs text-muted-foreground mt-2">
                Fields below have been pre-filled from the selected DOI.{" "}
                <button
                  type="button"
                  className="underline text-primary"
                  onClick={() => handleDoiSelect(null)}
                >
                  Clear selection
                </button>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Step indicator ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center gap-2 flex-1">
            <div
              className={[
                "flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold shrink-0 transition-colors",
                i < currentStep
                  ? "bg-primary text-primary-foreground"
                  : i === currentStep
                    ? "bg-primary/20 text-primary ring-2 ring-primary"
                    : "bg-muted text-muted-foreground",
              ].join(" ")}
            >
              {i < currentStep ? "✓" : i + 1}
            </div>
            <span
              className={[
                "text-xs truncate",
                i === currentStep
                  ? "text-foreground font-medium"
                  : "text-muted-foreground",
              ].join(" ")}
            >
              {step.title}
            </span>
            {i < steps.length - 1 && (
              <div className="flex-1 h-px bg-border mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* ── Main form card ──────────────────────────────────────────────── */}
      <Card>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              (e.target as HTMLElement).tagName !== "TEXTAREA"
            ) {
              e.preventDefault();
            }
          }}
        >
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle>{currentStepConfig.title}</CardTitle>
                <CardDescription className="mt-1">
                  {currentStepConfig.description}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="shrink-0">
                {currentStep + 1} / {steps.length}
              </Badge>
            </div>
            <Progress value={progress} className="h-1.5" />
          </CardHeader>

          <CardContent>{renderCurrentStepContent()}</CardContent>

          <CardFooter>
            <div className="flex justify-between w-full">
              {currentStep > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBackButton}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              ) : (
                <span />
              )}

              {!isLastStep ? (
                <Button type="button" onClick={handleNextButton}>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <SubmitButton disabled={form.formState.isSubmitting} />
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
