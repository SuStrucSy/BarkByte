import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpenText,
  ExternalLinkIcon,
  Info,
  LayersPlus,
  Pencil,
  Pyramid,
  RulerDimensionLine,
} from "lucide-react";
import { useState } from "react";

import { useSpecimensReadSpecimen } from "@/api/endpoints/specimens/specimens.gen";
import { type SpecimenStatus } from "@/components/Specimens/SpecimenStatusFilter";
import type {
  PendingSpecimenPublicChangedData,
  SpecimenPublic,
} from "@/api/model";
import { humanizeLabel, renderValue } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Textarea } from "../ui/textarea";

export type ActiveAction = {
  pendingId: string;
  type: "approve" | "reject";
} | null;

const rejectSecondaryClassName =
  "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/70";

interface PendingCardActionsProps {
  status: SpecimenStatus;
  isBusy: boolean;
  comment: string;
  commentByAuthor?: string | null;
  commentByReviewer?: string | null;
  activeAction: ActiveAction;
  pendingID: string;
  setActiveAction: React.Dispatch<React.SetStateAction<ActiveAction>>;
  setComment: React.Dispatch<React.SetStateAction<string>>;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}

function PendingCardActions({
  status,
  isBusy,
  comment,
  commentByAuthor,
  commentByReviewer,
  activeAction,
  pendingID,
  setActiveAction,
  setComment,
  onApprove,
  onReject,
}: PendingCardActionsProps) {
  if (status !== "pending") {
    if (commentByAuthor?.trim().length || commentByReviewer?.trim().length) {
      return (
        <>
          {commentByAuthor?.trim().length ? (
            <>
              <span>Comment by Author</span>
              <Textarea
                value={commentByAuthor}
                readOnly
                disabled
                rows={3}
                className="w-full text-sm"
              />
            </>
          ) : null}
          {commentByReviewer?.trim().length ? (
            <>
              <span>Comment by Reviewer</span>
              <Textarea
                value={commentByReviewer}
                readOnly
                disabled
                rows={2}
                className="w-full text-sm"
              />
            </>
          ) : null}
        </>
      );
    }
    return null;
  }

  if (activeAction?.pendingId === pendingID) {
    return (
      <>
        {commentByAuthor?.trim().length ? (
          <>
            <span>Comment by Author</span>
            <Textarea
              value={commentByAuthor}
              readOnly
              disabled
              rows={3}
              className="w-full text-sm"
            />
          </>
        ) : null}
        <Textarea
          placeholder={`Optional comment for ${activeAction.type === "approve" ? "approval" : "rejection"}…`}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          className="w-full text-sm"
        />
        <div className="flex gap-2 w-full">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={isBusy}
            onClick={() => {
              setActiveAction(null);
              setComment("");
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={activeAction.type === "reject" ? "secondary" : "default"}
            className={activeAction.type === "reject" ? `flex-1 ${rejectSecondaryClassName}` : "flex-1"}
            disabled={isBusy}
            onClick={() =>
              activeAction.type === "approve"
                ? onApprove(pendingID)
                : onReject(pendingID)
            }
          >
            {isBusy ? (
              <>
                <Spinner className="h-4 w-4" />
                Confirming…
              </>
            ) : (
              `Confirm ${activeAction.type === "approve" ? "Approval" : "Rejection"}`
            )}
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      {commentByAuthor?.trim().length ? (
        <>
          <span>Comment by Author</span>
          <Textarea
            value={commentByAuthor}
            readOnly
            disabled
            rows={3}
            className="w-full text-sm"
          />
        </>
      ) : null}
      <Button
        type="button"
        className="w-full"
        disabled={isBusy}
        onClick={() => {
          setComment("");
          setActiveAction({ pendingId: pendingID, type: "approve" });
        }}
      >
        Approve
      </Button>
      <Button
        variant="secondary"
        type="button"
        className={`w-full ${rejectSecondaryClassName}`}
        disabled={isBusy}
        onClick={() => {
          setComment("");
          setActiveAction({ pendingId: pendingID, type: "reject" });
        }}
      >
        Reject
      </Button>
    </>
  );
}

interface SpecimenPendingCardProps {
  specimen: Partial<SpecimenPublic>;
  changedData: PendingSpecimenPublicChangedData;
  specimenId: string | null;
  pendingID: string;
  createdAt: string;
  isBusy: boolean;
  comment: string;
  commentByAuthor?: string | null;
  commentByReviewer?: string | null;
  activeAction: ActiveAction;
  setActiveAction: React.Dispatch<React.SetStateAction<ActiveAction>>;
  setComment: React.Dispatch<React.SetStateAction<string>>;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  isNew: boolean;
  status: SpecimenStatus;
}

type SpecimenField = keyof SpecimenPublic;

const manualLabels: Partial<Record<SpecimenField, string>> = {
  e_qfm_description: "QFM Description",
  e_qualitative_failure_measure: "QFM",
  note: "Specimen Note",
};

const sectionFields: Record<string, SpecimenField[]> = {
  "Meta Data": [
    "assembly_type",
    "joinery_type",
    "sub_joinery_type",
    "fastener_types",
    "loading_directions",
    "practice",
    "fastener_numbers",
    "connector",
    "dowel",
    "replicate_tests",
    "connection_description",
    "note",
  ],
  "Structural Data": [
    "element_dimension",
    "moisture_percentage",
    "wood_type",
    "wood_mechanical_properties",
    "fastener_mechanical_properties",
    "connector_mechanical_properties",
  ],
  "Experimental Data": [
    "e_date",
    "e_test_loading_type",
    "e_yield_point_method",
    "e_qualitative_failure_measure",
    "e_qfm_description",
    "e_max_force",
    "e_max_displacement",
    "e_stiffness",
    "e_ultimate_force",
    "e_ultimate_displacement",
    "e_yield_force",
    "e_yield_displacement",
    "e_ductility",
  ],
};

const allSectionFields = Object.values(sectionFields).flat();

const changeKeyMap: Partial<Record<SpecimenField, string[]>> = {
  joinery_type: ["joinery_type_id"],
  sub_joinery_type: ["sub_joinery_type_id"],
  fastener_types: ["fastener_type_ids"],
  loading_directions: ["loading_direction_ids"],
  e_qualitative_failure_measure: ["e_qualitative_failure_measure"],
};

function getLabel(property: SpecimenField) {
  return manualLabels[property] ?? humanizeLabel(property);
}

function formatFieldValue(value: unknown, unit?: string) {
  const text = renderValue(value);
  return (
    <span className="font-medium">
      {text}
      {unit ? (
        <span className="ml-1 text-sm font-light text-muted-foreground">
          {unit}
        </span>
      ) : null}
    </span>
  );
}

function PendingFieldRow({
  label,
  oldValue,
  newValue,
  isChanged,
  unit,
  renderNewValue,
}: {
  label: string;
  oldValue: unknown;
  newValue: unknown;
  isChanged: boolean;
  unit?: string;
  renderNewValue?: () => React.ReactNode;
}) {
  return (
    <div className="grid gap-1 rounded-md px-3 py-2">
      <span className="text-[10px] tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      {isChanged ? (
        <div className="grid min-w-0 gap-1">
          <div className="text-sm text-red-600 line-through decoration-red-400">
            {formatFieldValue(oldValue, unit)}
          </div>
          <div className="text-sm text-green-700 dark:text-green-400">
            {renderNewValue ? renderNewValue() : formatFieldValue(newValue, unit)}
          </div>
        </div>
      ) : (
        <div className="min-w-0 text-sm">
          {renderNewValue ? renderNewValue() : formatFieldValue(newValue, unit)}
        </div>
      )}
    </div>
  );
}

export function SpecimenPendingCard({
  specimen,
  changedData,
  specimenId,
  pendingID,
  createdAt,
  isBusy,
  comment,
  commentByAuthor,
  commentByReviewer,
  activeAction,
  setComment,
  setActiveAction,
  onApprove,
  onReject,
  isNew,
  status,
}: SpecimenPendingCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { data: originalSpecimen } = useSpecimensReadSpecimen(specimenId ?? "", {
    query: {
      enabled: !isNew && !!specimenId,
    },
  });

  const fieldUnits: Partial<Record<SpecimenField, string>> = {
    e_max_force: "kN",
    e_max_displacement: "mm",
    e_stiffness: "kN/mm",
    e_ultimate_force: "kN",
    e_ultimate_displacement: "mm",
    e_yield_force: "kN",
    e_yield_displacement: "mm",
  };

  const isFieldChanged = (field: SpecimenField) => {
    const changeKeys = changeKeyMap[field] ?? [field];
    return changeKeys.some((key) => changedData[key] !== undefined);
  };

  const getDisplayValue = (field: SpecimenField) => {
    if (isNew || isFieldChanged(field)) {
      return specimen[field];
    }
    return originalSpecimen?.[field];
  };

  const renderFieldGrid = (
    fields: SpecimenField[],
    columnsClassName: string,
    leadingRow?: React.ReactNode,
  ) => {
    if (!fields.length && !leadingRow) {
      return (
        <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          No changed attributes in this section.
        </div>
      );
    }

    return (
      <div className={columnsClassName}>
        {leadingRow}
        {fields.map((field) => (
          <PendingFieldRow
            key={field}
            label={getLabel(field)}
            oldValue={originalSpecimen?.[field]}
            newValue={getDisplayValue(field)}
            isChanged={!isNew && isFieldChanged(field)}
            unit={fieldUnits[field]}
          />
        ))}
      </div>
    );
  };

  const renderSection = (section: keyof typeof sectionFields) => {
    const fields = sectionFields[section];
    return renderFieldGrid(
      fields,
      "grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3",
    );
  };

  const renderChangedOnly = () => {
    const fields = allSectionFields.filter((field) => isFieldChanged(field));

    if (!fields.length && !specimenId) {
      return (
        <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          No changed attributes.
        </div>
      );
    }

    return renderFieldGrid(
      fields,
      "grid grid-cols-1 gap-3",
      specimenId
        ? (
            <PendingFieldRow
              label="Reference Title"
              oldValue={null}
              newValue={specimen.specimen_reference_id ?? originalSpecimen?.specimen_reference_id}
              isChanged={false}
              renderNewValue={() => (
                <a
                  href={`/specimens/${specimenId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline underline-offset-4"
                >
                  {specimen.specimen_reference_id ?? originalSpecimen?.specimen_reference_id ?? specimenId}
                </a>
              )}
            />
          )
        : undefined,
    );
  };

  const renderFullDetailsTabs = () => (
    <Tabs defaultValue="Meta Data" className="grid h-full min-h-0 gap-4">
      <TabsList className="h-auto flex-wrap justify-start">
        <TabsTrigger value="Meta Data">
          <Info /> Meta Data
        </TabsTrigger>
        <TabsTrigger value="Structural Data">
          <Pyramid /> Structural Data
        </TabsTrigger>
        <TabsTrigger value="Experimental Data">
          <RulerDimensionLine />
          Experimental Data
        </TabsTrigger>
        <TabsTrigger value="Reference Details">
          <BookOpenText />
          Reference Details
        </TabsTrigger>
      </TabsList>
      <div className="h-[clamp(18rem,42dvh,30rem)] min-h-0">
        <TabsContent value="Meta Data" className="h-full min-h-0">
          <ScrollArea className="h-full pr-4">
            <div className="px-4 pb-6 sm:px-6 lg:px-8 lg:pb-8">
              <div className="grid gap-3">{renderSection("Meta Data")}</div>
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="Structural Data" className="h-full min-h-0">
          <ScrollArea className="h-full pr-4">
            <div className="px-4 pb-6 sm:px-6 lg:px-8 lg:pb-8">
              <div className="grid gap-3">{renderSection("Structural Data")}</div>
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="Experimental Data" className="h-full min-h-0">
          <ScrollArea className="h-full pr-4">
            <div className="px-4 pb-6 sm:px-6 lg:px-8 lg:pb-8">
              <div className="grid gap-3">{renderSection("Experimental Data")}</div>
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="Reference Details" className="h-full min-h-0">
          <ScrollArea className="h-full pr-4">
            <div className="px-4 pb-6 sm:px-6 lg:px-8 lg:pb-8">
              <div className="grid gap-3">{renderReferenceDetails()}</div>
            </div>
          </ScrollArea>
        </TabsContent>
      </div>
    </Tabs>
  );

  const renderReferenceDetails = () => {
    const doi = specimen.doi ?? originalSpecimen?.doi;

    if (!doi) {
      return (
        <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          Reference details are unavailable for this pending specimen.
        </div>
      );
    }

    return (
      <div className="grid gap-3">
        <PendingFieldRow
          label="DOI Link"
          oldValue={originalSpecimen?.doi?.link}
          newValue={doi.link}
          isChanged={false}
          renderNewValue={() => (
            <Item variant="outline" asChild>
              <a href={doi.link} target="_blank" rel="noopener noreferrer">
                <ItemContent>
                  <ItemTitle>{doi.ref_title}</ItemTitle>
                  <ItemDescription>
                    {doi.authors} • {doi.pub_year}
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <ExternalLinkIcon className="size-4" />
                </ItemActions>
              </a>
            </Item>
          )}
        />
      </div>
    );
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div className="min-w-0 space-y-1">
            <CardTitle>
              {specimen.specimen_reference_id ?? "Pending specimen"}
            </CardTitle>
            <CardDescription>
              Review this specimen submission and compare pending changes.
            </CardDescription>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Button variant="link" className="h-auto px-0 text-base font-semibold">
                {createdAt}
              </Button>
              {status === "pending" &&
                (isNew ? (
                  <Badge className="shrink-0 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                    <LayersPlus data-icon="inline-start" />
                    New
                  </Badge>
                ) : (
                  <Badge className="shrink-0 bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                    <Pencil data-icon="inline-start" />
                    Update
                  </Badge>
                ))}
            </div>
          </div>
          <div className="justify-self-start sm:justify-self-end">
            <div className="flex flex-col items-start gap-2 sm:items-end">
              {status === "pending" ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    type="button"
                    size="sm"
                    className={`w-auto min-w-28 ${rejectSecondaryClassName}`}
                    disabled={isBusy}
                    onClick={() => {
                      setComment("");
                      setActiveAction({ pendingId: pendingID, type: "reject" });
                      setDetailsOpen(true);
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="w-auto min-w-28"
                    disabled={isBusy}
                    onClick={() => {
                      setComment("");
                      setActiveAction({ pendingId: pendingID, type: "approve" });
                      setDetailsOpen(true);
                    }}
                  >
                    Approve
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-base">Changed Attributes</CardTitle>
                <CardDescription>
                  A compact review of the submitted changes.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDetailsOpen(true)}
              >
                More Details
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-72 pr-3">
              <div className="grid gap-3">{renderChangedOnly()}</div>
            </ScrollArea>
          </CardContent>
        </Card>
        {status === "rejected" && commentByReviewer?.trim().length ? (
          <div className="px-1 text-sm">
            <span className="font-medium">Comment by Reviewer:</span>{" "}
            <span className="text-muted-foreground italic">"{commentByReviewer}"</span>
          </div>
        ) : null}
      </CardContent>
      <Drawer
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        direction="bottom"
      >
        <DrawerContent
          className="w-screen max-w-none min-h-[24rem] max-h-[85dvh]"
        >
          <DrawerHeader className="border-b pb-4">
            <DrawerTitle>
              {specimen.specimen_reference_id ?? "Pending specimen"}
            </DrawerTitle>
            <DrawerDescription>
              Review complete specimen information, reference details, and approval actions.
            </DrawerDescription>
          </DrawerHeader>
          <div className="grid min-h-0 gap-4 overflow-y-auto p-3 sm:p-4 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)] lg:gap-6 lg:overflow-hidden">
            <div className="min-h-[18rem] overflow-hidden lg:min-h-0">
              {renderFullDetailsTabs()}
            </div>
            <div className="min-h-0 lg:min-h-0">
              <ScrollArea className="max-h-[40dvh] lg:max-h-[60dvh]">
                <div className="grid gap-4 pr-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <CardTitle className="text-base">
                            Pending Submission
                          </CardTitle>
                          <CardDescription>
                            Submission metadata and reviewer actions.
                          </CardDescription>
                        </div>
                        {specimenId ? (
                          <Button variant="outline" size="sm" asChild>
                            <Link
                              to="/specimens/$specimenId"
                              params={{ specimenId }}
                            >
                              Specimen Record
                            </Link>
                          </Button>
                        ) : null}
                      </div>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button variant="link" className="px-0">
                          {createdAt}
                        </Button>
                        {status === "pending" &&
                          (isNew ? (
                            <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                              <LayersPlus data-icon="inline-start" />
                              New
                            </Badge>
                          ) : (
                            <Badge className="bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                              <Pencil data-icon="inline-start" />
                              Update
                            </Badge>
                          ))}
                      </div>
                      <PendingCardActions
                        status={status}
                        isBusy={isBusy}
                        comment={comment}
                        commentByAuthor={commentByAuthor}
                        commentByReviewer={commentByReviewer}
                        activeAction={activeAction}
                        pendingID={pendingID}
                        setActiveAction={setActiveAction}
                        setComment={setComment}
                        onApprove={onApprove}
                        onReject={onReject}
                      />
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </Card>
  );
}
