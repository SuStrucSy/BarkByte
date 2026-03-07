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
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Info,
  LayersPlus,
  Pencil,
  Pyramid,
  RulerDimensionLine,
} from "lucide-react";

import { LabelValue } from "@/components/Common/LabelValue";
import { type SpecimenStatus } from "@/components/Specimens/SpecimenStatusFilter";
import type {
  PendingSpecimenPublicCommentByReviewer,
  SpecimenPublic,
} from "@/api/model";
import { Textarea } from "../ui/textarea";

export type ActiveAction = {
  pendingId: string;
  type: "approve" | "reject";
} | null;

interface PendingCardActionsProps {
  status: SpecimenStatus;
  isBusy: boolean;
  comment: string;
  commentByReviewer: PendingSpecimenPublicCommentByReviewer | undefined;
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
  commentByReviewer,
  activeAction,
  pendingID,
  setActiveAction,
  setComment,
  onApprove,
  onReject,
}: PendingCardActionsProps) {
  if (status !== "pending") {
    if (commentByReviewer?.trim().length) {
      return (
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
      );
    }
    return null;
  }

  if (activeAction?.pendingId === pendingID) {
    return (
      <>
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
  specimen: SpecimenPublic;
  pendingID: string;
  createdAt: string;
  isBusy: boolean;
  comment: string;
  commentByReviewer: PendingSpecimenPublicCommentByReviewer | undefined;
  activeAction: ActiveAction;
  setActiveAction: React.Dispatch<React.SetStateAction<ActiveAction>>;
  setComment: React.Dispatch<React.SetStateAction<string>>;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  isNew: boolean;
  status: SpecimenStatus;
}

export function SpecimenPendingCard({
  specimen,
  pendingID,
  createdAt,
  isBusy,
  comment,
  commentByReviewer,
  activeAction,
  setComment,
  setActiveAction,
  onApprove,
  onReject,
  isNew,
  status,
}: SpecimenPendingCardProps) {
  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>{specimen.specimen_reference_id}</CardTitle>
        <CardDescription>Review this specimen submitted by</CardDescription>
        <CardAction>
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
        </CardAction>
      </CardHeader>
      <CardContent>
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
          </TabsList>
          <TabsContent value="Meta Data">
            <div className="grid gap-3">
              <h3 className="font-thin uppercase">Specimen Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <LabelValue property="assembly_type" data={specimen} />
                  <LabelValue property="joinery_type" data={specimen} />
                  <LabelValue property="sub_joinery_type" data={specimen} />
                  <LabelValue property="fastener_types" data={specimen} />
                  <LabelValue property="loading_directions" data={specimen} />
                  <LabelValue property="practice" data={specimen} />
                </div>
                <div className="grid gap-2">
                  <LabelValue property="fastener_numbers" data={specimen} />
                  <LabelValue property="connector" data={specimen} />
                  <LabelValue property="dowel" data={specimen} />
                  <LabelValue property="replicate_tests" data={specimen} />
                  <LabelValue
                    property="connection_description"
                    data={specimen}
                  />
                  <LabelValue property="note" data={specimen} />
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="Structural Data">
            <div className="grid gap-3">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2 content-baseline">
                  <h4 className="font-thin uppercase">Geometric Properties</h4>
                  <LabelValue property="element_dimension" data={specimen} />
                </div>
                <div className="grid gap-2">
                  <h4 className="font-thin uppercase">Material Properties</h4>
                  <LabelValue property="wood_type" data={specimen} />
                  <LabelValue
                    property="wood_mechanical_properties"
                    data={specimen}
                  />
                  <LabelValue
                    property="fastener_mechanical_properties"
                    data={specimen}
                  />
                  <LabelValue
                    property="connector_mechanical_properties"
                    data={specimen}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="Experimental Data">
            <div className="grid gap-3">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2 content-baseline">
                  <h4 className="font-thin uppercase">Experimental Results</h4>
                  <LabelValue property="e_date" data={specimen} />
                  <LabelValue property="e_test_loading_type" data={specimen} />
                  <LabelValue property="e_yield_point_method" data={specimen} />
                  <LabelValue property="note" data={specimen} />
                </div>
                <div className="grid gap-2 content-baseline">
                  <h4 className="font-thin uppercase">
                    Qualitative Failure Measures
                  </h4>
                  <LabelValue
                    property="e_qualitative_failure_measure"
                    data={specimen}
                  />
                  <LabelValue property="e_qfm_description" data={specimen} />
                </div>
                <div className="grid gap-2 col-span-full">
                  <h4 className="font-thin uppercase">
                    Quantitative Mechanical Measures
                  </h4>
                  <div className="grid grid-cols-2">
                    <div>
                      <LabelValue
                        property="e_max_force"
                        data={specimen}
                        unit="kN"
                      />
                      <LabelValue
                        property="e_max_displacement"
                        data={specimen}
                        unit="mm"
                      />
                      <LabelValue
                        property="e_stiffness"
                        data={specimen}
                        unit="kN/mm"
                      />
                      <LabelValue
                        property="e_ultimate_force"
                        data={specimen}
                        unit="kN"
                      />
                    </div>
                    <div>
                      <LabelValue
                        property="e_ultimate_displacement"
                        data={specimen}
                        unit="mm"
                      />
                      <LabelValue
                        property="e_yield_force"
                        data={specimen}
                        unit="kN"
                      />
                      <LabelValue
                        property="e_yield_displacement"
                        data={specimen}
                        unit="mm"
                      />
                      <LabelValue property="e_ductility" data={specimen} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <PendingCardActions
          status={status}
          isBusy={isBusy}
          comment={comment}
          commentByReviewer={commentByReviewer}
          activeAction={activeAction}
          pendingID={pendingID}
          setActiveAction={setActiveAction}
          setComment={setComment}
          onApprove={onApprove}
          onReject={onReject}
        />
      </CardFooter>
    </Card>
  );
}
