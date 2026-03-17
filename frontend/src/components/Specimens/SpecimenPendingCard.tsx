import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
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
import { Textarea } from "../ui/textarea";

export type ActiveAction = {
  pendingId: string;
  type: "approve" | "reject";
} | null;

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
            className={[
              "flex-1",
              activeAction.type === "reject"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "",
            ].join(" ")}
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
        variant="destructive"
        type="button"
        className="w-full"
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
    <div className="grid gap-1 rounded-md border border-border/60 p-3">
      <span className="text-[10px] tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      {isChanged ? (
        <div className="grid gap-1">
          <div className="text-sm text-red-600 line-through decoration-red-400">
            {formatFieldValue(oldValue, unit)}
          </div>
          <div className="text-sm text-green-700 dark:text-green-400">
            {renderNewValue ? renderNewValue() : formatFieldValue(newValue, unit)}
          </div>
        </div>
      ) : (
        <div className="text-sm">
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
  const [showAllAttributes, setShowAllAttributes] = useState(false);
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

  const renderSection = (section: keyof typeof sectionFields) => {
    const fields = sectionFields[section].filter(
      (field) => showAllAttributes || isFieldChanged(field),
    );

    if (!fields.length) {
      return (
        <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          No changed attributes in this section.
        </div>
      );
    }

    return (
      <div className="grid gap-3 md:grid-cols-2">
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

  const renderChangedOnly = () => {
    const fields = allSectionFields.filter((field) => isFieldChanged(field));

    if (!fields.length) {
      return (
        <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          No changed attributes.
        </div>
      );
    }

    return (
      <div className="grid gap-3 md:grid-cols-2">
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
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>
              {specimen.specimen_reference_id ?? "Pending specimen"}
            </CardTitle>
            <CardDescription>
              Review this specimen submission and compare pending changes.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="link">{createdAt}</Button>
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
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-base">Specimen Information</CardTitle>
                <CardDescription>
                  The specimen data below is separated from review comments and actions.
                </CardDescription>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium">
                <Switch
                  checked={showAllAttributes}
                  onCheckedChange={setShowAllAttributes}
                  aria-label="Show all attributes"
                />
                See All Attributes
              </label>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[28rem] pr-3">
              {showAllAttributes ? (
                <Tabs defaultValue="Meta Data">
                  <TabsList>
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
                  <TabsContent value="Meta Data">
                    <div className="grid gap-3">{renderSection("Meta Data")}</div>
                  </TabsContent>
                  <TabsContent value="Structural Data">
                    <div className="grid gap-3">{renderSection("Structural Data")}</div>
                  </TabsContent>
                  <TabsContent value="Experimental Data">
                    <div className="grid gap-3">{renderSection("Experimental Data")}</div>
                  </TabsContent>
                  <TabsContent value="Reference Details">
                    <div className="grid gap-3">{renderReferenceDetails()}</div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="grid gap-3">{renderChangedOnly()}</div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="grid gap-2">
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
        </div>
      </CardContent>
    </Card>
  );
}
