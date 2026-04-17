import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
	ExternalLinkIcon,
	Info,
	LayersPlus,
	Pencil,
	Pyramid,
	RulerDimensionLine,
	TriangleAlert,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { pendingSpecimensListPendingSpecimens } from "@/api/endpoints/pending-specimens/pending-specimens";
import { useSpecimensReadSpecimen } from "@/api/endpoints/specimens/specimens";
import type {
	PendingSpecimenPublicChangedData,
	SpecimenPublic,
} from "@/api/model";
import type { SpecimenStatus } from "@/components/Specimens/SpecimenStatusFilter";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
import { renderValue } from "@/lib/utils";
import { Textarea } from "../ui/textarea";
import {
	allSectionFields,
	fieldUnits,
	getSpecimenFieldLabel,
	isSpecimenFieldChanged,
	renderFailureModeValue,
	SpecimenDiffFieldRow,
	type SpecimenField,
	sectionFields,
} from "./specimenDiff";

export type ActiveAction = {
	pendingId: string;
	type: "approve" | "reject";
} | null;

const rejectSecondaryClassName =
	"border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/70";

interface PendingCardActionsProps {
	status: SpecimenStatus;
	canReview: boolean;
	canReject: boolean;
	canDeletePending: boolean;
	isBusy: boolean;
	comment: string;
	commentByAuthor?: string | null;
	commentByReviewer?: string | null;
	activeAction: ActiveAction;
	pendingID: string;
	setActiveAction: React.Dispatch<React.SetStateAction<ActiveAction>>;
	setComment: React.Dispatch<React.SetStateAction<string>>;
	onStartReviewAction: (actionType: "approve" | "reject") => Promise<void>;
	onRequestDelete: () => void;
	onApprove: (id: string) => Promise<void>;
	onReject: (id: string) => Promise<void>;
}

function PendingCardActions({
	status,
	canReview,
	canReject,
	canDeletePending,
	isBusy,
	comment,
	commentByAuthor,
	commentByReviewer,
	activeAction,
	pendingID,
	setActiveAction,
	setComment,
	onStartReviewAction,
	onRequestDelete,
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

	if (!canReview && canDeletePending) {
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
					variant="destructive"
					className="w-full min-w-28"
					disabled={isBusy}
					onClick={onRequestDelete}
				>
					Delete
				</Button>
			</>
		);
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
						className={
							activeAction.type === "reject"
								? `flex-1 ${rejectSecondaryClassName}`
								: "flex-1"
						}
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
				onClick={() => void onStartReviewAction("approve")}
			>
				Approve
			</Button>
			{canReject ? (
				<Button
					variant="secondary"
					type="button"
					className={`w-full ${rejectSecondaryClassName}`}
					disabled={isBusy}
					onClick={() => void onStartReviewAction("reject")}
				>
					Reject
				</Button>
			) : canDeletePending ? (
				<Button
					type="button"
					variant="destructive"
					className="w-full min-w-28"
					disabled={isBusy}
					onClick={onRequestDelete}
				>
					Delete
				</Button>
			) : null}
		</>
	);
}

interface SpecimenPendingCardProps {
	specimen: Partial<SpecimenPublic>;
	changedData: PendingSpecimenPublicChangedData;
	specimenId: string | null;
	pendingID: string;
	createdAt: string;
	requestedBy: string;
	isBusy: boolean;
	comment: string;
	commentByAuthor?: string | null;
	commentByReviewer?: string | null;
	activeAction: ActiveAction;
	setActiveAction: React.Dispatch<React.SetStateAction<ActiveAction>>;
	setComment: React.Dispatch<React.SetStateAction<string>>;
	onApprove: (id: string) => Promise<void>;
	onReject: (id: string) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
	isNew: boolean;
	status: SpecimenStatus;
	canReview: boolean;
	canReject: boolean;
	canDeletePending: boolean;
}

export function SpecimenPendingCard({
	specimen,
	changedData,
	specimenId,
	pendingID,
	createdAt,
	requestedBy,
	isBusy,
	comment,
	commentByAuthor,
	commentByReviewer,
	activeAction,
	setComment,
	setActiveAction,
	onApprove,
	onReject,
	onDelete,
	isNew,
	status,
	canReview,
	canReject,
	canDeletePending,
}: SpecimenPendingCardProps) {
	const [detailsOpen, setDetailsOpen] = useState(false);
	const [dialogAction, setDialogAction] = useState<"approve" | "reject" | null>(
		null,
	);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [staleReviewWarning, setStaleReviewWarning] = useState<string | null>(
		null,
	);
	const queryClient = useQueryClient();
	const { data: originalSpecimen } = useSpecimensReadSpecimen(
		specimenId ?? "",
		{
			query: {
				enabled: !isNew && !!specimenId,
			},
		},
	);

	const isFieldChanged = (field: SpecimenField) => {
		return isSpecimenFieldChanged(field, changedData);
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
					<SpecimenDiffFieldRow
						key={field}
						label={getSpecimenFieldLabel(field)}
						oldValue={originalSpecimen?.[field]}
						newValue={getDisplayValue(field)}
						isChanged={!isNew && isFieldChanged(field)}
						unit={fieldUnits[field]}
						renderOldValue={
							field === "e_qualitative_failure_measure"
								? () =>
										renderFailureModeValue(
											originalSpecimen?.e_qualitative_failure_measure,
										)
								: undefined
						}
						renderNewValue={
							field === "e_qualitative_failure_measure"
								? () =>
										renderFailureModeValue(
											specimen.e_qualitative_failure_measure,
										)
								: undefined
						}
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

		if (!fields.length) {
			return (
				<div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
					No changed attributes.
				</div>
			);
		}

		return renderFieldGrid(fields, "grid grid-cols-1 gap-3");
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
							<div className="grid gap-3">
								{renderSection("Structural Data")}
							</div>
						</div>
					</ScrollArea>
				</TabsContent>
				<TabsContent value="Experimental Data" className="h-full min-h-0">
					<ScrollArea className="h-full pr-4">
						<div className="px-4 pb-6 sm:px-6 lg:px-8 lg:pb-8">
							<div className="grid gap-3">
								{renderSection("Experimental Data")}
							</div>
						</div>
					</ScrollArea>
				</TabsContent>
			</div>
		</Tabs>
	);

	const renderDetails = () => {
		const doi = specimen.doi ?? originalSpecimen?.doi;

		if (!doi && !specimenId) {
			return (
				<div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
					Details are unavailable for this pending specimen.
				</div>
			);
		}

		return (
			<div className="grid gap-3">
				{specimenId ? (
					<Item variant="outline" asChild>
						<Link
							to="/specimens/$specimenId"
							params={{ specimenId }}
							target="_blank"
						>
							<ItemContent>
								<ItemTitle>Specimen Record</ItemTitle>
								<ItemDescription>
									{[
										specimen.specimen_reference_id ??
											originalSpecimen?.specimen_reference_id ??
											specimenId,
										renderValue(
											specimen.assembly_type ?? originalSpecimen?.assembly_type,
										),
										renderValue(
											specimen.joinery_type?.label ??
												originalSpecimen?.joinery_type?.label,
										),
									].join(" • ")}
								</ItemDescription>
							</ItemContent>
							<ItemActions>
								<ExternalLinkIcon className="size-4" />
							</ItemActions>
						</Link>
					</Item>
				) : null}
				{doi ? (
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
				) : null}
			</div>
		);
	};

	const dialogTitle =
		dialogAction === "approve"
			? "Approve pending specimen?"
			: "Reject pending specimen?";

	const dialogPlaceholder =
		dialogAction === "approve"
			? "Optional comment for approval..."
			: "Optional comment for rejection...";

	const cardTitleFallback =
		status === "approved"
			? "Approved specimen"
			: status === "rejected"
				? "Rejected specimen"
				: "Pending specimen";

	const cardDescription =
		status === "approved"
			? "Review this approved specimen submission and compare the applied changes."
			: status === "rejected"
				? "Review this rejected specimen submission and compare the proposed changes."
				: "Review this specimen submission and compare pending changes.";

	const submissionPanelTitle =
		status === "approved"
			? "Approved Submission"
			: status === "rejected"
				? "Rejected Submission"
				: "Pending Submission";

	const submissionPanelDescription =
		status === "approved"
			? "Approval metadata and reviewer actions."
			: status === "rejected"
				? "Rejection metadata and reviewer actions."
				: "Submission metadata and reviewer actions.";

	const resetReviewUi = () => {
		setDialogAction(null);
		setDeleteDialogOpen(false);
		setActiveAction(null);
		setComment("");
		setStaleReviewWarning(null);
	};

	const checkForLatestPendingChanges = async (
		actionType: "approve" | "reject",
		onCurrentSnapshot: () => void,
	) => {
		const latestList = await pendingSpecimensListPendingSpecimens({ status });
		const latestPending = latestList.pending_specimens.find(
			(pending) => pending.id === pendingID,
		);

		if (!latestPending || latestPending.status !== "pending") {
			queryClient.setQueryData(["pendingSpecimens", status], latestList);
			resetReviewUi();
			toast.error("This submission changed", {
				description:
					"It is no longer pending. The page has been refreshed to the latest state.",
				position: "bottom-right",
			});
			return;
		}

		const hasChangedSinceLoad =
			JSON.stringify(latestPending.changed_data ?? {}) !==
				JSON.stringify(changedData ?? {}) ||
			(latestPending.comment_by_author ?? "") !== (commentByAuthor ?? "");

		if (hasChangedSinceLoad) {
			queryClient.setQueryData(["pendingSpecimens", status], latestList);
			setComment("");
			setDialogAction(null);
			setActiveAction({ pendingId: pendingID, type: actionType });
			setStaleReviewWarning(
				"This submission changed since you loaded the page. Review the latest changes before continuing.",
			);
			setDetailsOpen(true);
			return;
		}

		setStaleReviewWarning(null);
		onCurrentSnapshot();
	};

	const startDrawerReviewAction = async (actionType: "approve" | "reject") => {
		await checkForLatestPendingChanges(actionType, () => {
			setComment("");
			setActiveAction({ pendingId: pendingID, type: actionType });
		});
	};

	const requestDelete = () => {
		setDeleteDialogOpen(true);
	};

	return (
		<Card className="w-full max-w-3xl">
			<CardHeader>
				<div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
					<div className="min-w-0 space-y-1">
						<CardTitle>
							{specimen.specimen_reference_id ?? cardTitleFallback}
						</CardTitle>
						<CardDescription>{cardDescription}</CardDescription>
						<div className="flex flex-wrap items-center gap-2 pt-2">
							<Button
								variant="link"
								className="h-auto px-0 text-base font-semibold"
							>
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
						<div className="text-sm text-muted-foreground">
							Requested by{" "}
							<span className="font-medium text-foreground">{requestedBy}</span>
						</div>
					</div>
					<div className="justify-self-start sm:justify-self-end">
						<div className="flex flex-col items-start gap-2 sm:items-end">
							{status === "pending" && canReview ? (
								<div className="flex items-center gap-2">
									{canReject ? (
										<Button
											variant="secondary"
											type="button"
											size="sm"
											className={`w-auto min-w-28 ${rejectSecondaryClassName}`}
											disabled={isBusy}
											onClick={() =>
												void checkForLatestPendingChanges("reject", () => {
													setComment("");
													setDialogAction("reject");
												})
											}
										>
											Reject
										</Button>
									) : canDeletePending ? (
										<Button
											type="button"
											variant="destructive"
											size="sm"
											className="w-auto min-w-28"
											disabled={isBusy}
											onClick={requestDelete}
										>
											Delete
										</Button>
									) : null}
									<Button
										type="button"
										size="sm"
										className="w-auto min-w-28"
										disabled={isBusy}
										onClick={() =>
											void checkForLatestPendingChanges("approve", () => {
												setComment("");
												setDialogAction("approve");
											})
										}
									>
										Approve
									</Button>
								</div>
							) : status === "pending" && canDeletePending ? (
								<Button
									type="button"
									variant="destructive"
									size="sm"
									className="w-auto min-w-28"
									disabled={isBusy}
									onClick={requestDelete}
								>
									Delete
								</Button>
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
						<span className="text-muted-foreground italic">
							"{commentByReviewer}"
						</span>
					</div>
				) : null}
			</CardContent>
			<Drawer
				open={detailsOpen}
				onOpenChange={(open) => {
					setDetailsOpen(open);
					if (!open) {
						resetReviewUi();
					}
				}}
				direction="bottom"
			>
				<DrawerContent className="w-screen max-w-none min-h-[24rem] max-h-[85dvh]">
					<DrawerHeader className="border-b pb-4">
						<DrawerTitle>
							{specimen.specimen_reference_id ?? cardTitleFallback}
						</DrawerTitle>
						<DrawerDescription>
							Review complete specimen information, reference details, and
							approval actions.
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
														{submissionPanelTitle}
													</CardTitle>
													<CardDescription>
														{submissionPanelDescription}
													</CardDescription>
												</div>
											</div>
										</CardHeader>
										<CardContent className="grid gap-3">
											{staleReviewWarning ? (
												<div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
													<TriangleAlert className="mt-0.5 size-4 shrink-0" />
													<span>{staleReviewWarning}</span>
												</div>
											) : null}
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
											<div className="text-sm text-muted-foreground">
												Requested by{" "}
												<span className="font-medium text-foreground">
													{requestedBy}
												</span>
											</div>
											<PendingCardActions
												status={status}
												canReview={canReview}
												canReject={canReject}
												canDeletePending={canDeletePending}
												isBusy={isBusy}
												comment={comment}
												commentByAuthor={commentByAuthor}
												commentByReviewer={commentByReviewer}
												activeAction={activeAction}
												pendingID={pendingID}
												setActiveAction={setActiveAction}
												setComment={setComment}
												onStartReviewAction={startDrawerReviewAction}
												onRequestDelete={requestDelete}
												onApprove={onApprove}
												onReject={onReject}
											/>
										</CardContent>
									</Card>
									{renderDetails()}
								</div>
							</ScrollArea>
						</div>
					</div>
				</DrawerContent>
			</Drawer>
			<AlertDialog
				open={dialogAction !== null}
				onOpenChange={(open) => {
					if (!open) {
						setDialogAction(null);
						setComment("");
					}
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{submissionPanelTitle}</AlertDialogTitle>
						<AlertDialogDescription>
							{submissionPanelDescription}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="grid gap-4">
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
						{commentByAuthor?.trim().length ? (
							<div className="grid gap-2">
								<span>Comment by Author</span>
								<Textarea
									value={commentByAuthor}
									readOnly
									disabled
									rows={3}
									className="w-full text-sm"
								/>
							</div>
						) : null}
						<div className="grid gap-2">
							<span>{dialogTitle}</span>
							<Textarea
								placeholder={dialogPlaceholder}
								value={comment}
								onChange={(e) => setComment(e.target.value)}
								rows={2}
								className="w-full text-sm"
							/>
						</div>
					</div>
					<AlertDialogFooter>
						<AlertDialogCancel
							onClick={() => {
								setDialogAction(null);
								setComment("");
							}}
						>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								if (dialogAction === "approve") {
									void onApprove(pendingID);
								} else if (dialogAction === "reject") {
									void onReject(pendingID);
								}
								setDialogAction(null);
							}}
						>
							{dialogAction === "approve"
								? "Confirm Approval"
								: "Confirm Rejection"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			<AlertDialog
				open={deleteDialogOpen}
				onOpenChange={(open) => {
					setDeleteDialogOpen(open);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete pending specimen?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently remove this pending specimen submission.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								void onDelete(pendingID);
								setDeleteDialogOpen(false);
							}}
						>
							Confirm Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Card>
	);
}
