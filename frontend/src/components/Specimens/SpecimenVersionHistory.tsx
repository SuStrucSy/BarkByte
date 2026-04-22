import { format, parseISO } from "date-fns";
import { useMemo } from "react";
import { useFailuremodeGetModes } from "@/api/endpoints/failuremode/failuremode";
import { useFastenertypeGetFastenerTypes } from "@/api/endpoints/fastenertype/fastenertype";
import { useJoinerytypeGetJtypes } from "@/api/endpoints/joinerytype/joinerytype";
import { useLoadingdirectionGetLoadingDirections } from "@/api/endpoints/loadingdirection/loadingdirection";
import { usePendingSpecimensListApprovedSpecimenTrail } from "@/api/endpoints/pending-specimens/pending-specimens";
import { useSubjoinerytypeGetSjtypes } from "@/api/endpoints/subjoinerytype/subjoinerytype";
import type { SpecimenPublic } from "@/api/model";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	buildPendingSpecimenDisplayData,
	fieldUnits,
	getChangedSpecimenFields,
	getSpecimenFieldLabel,
	renderFailureModeValue,
	SpecimenDiffFieldRow,
} from "./specimenDiff";

type SpecimenVersionHistoryProps = {
	specimenId: string;
};

export function SpecimenVersionHistory({
	specimenId,
}: SpecimenVersionHistoryProps) {
	const { data, isLoading, isError, error } =
		usePendingSpecimensListApprovedSpecimenTrail(specimenId);
	const { data: joineryData } = useJoinerytypeGetJtypes();
	const { data: fastenerData } = useFastenertypeGetFastenerTypes();
	const { data: loadingDirectionData } =
		useLoadingdirectionGetLoadingDirections();
	const { data: subjoineryData } = useSubjoinerytypeGetSjtypes();
	const { data: qfmData } = useFailuremodeGetModes(
		{ dowel: true, connector: true },
		{ query: { queryKey: ["specimenVersionHistory", "QFMTypes"] } },
	);

	const historyEntries = useMemo(() => {
		const trail = [...(data?.pending_specimens ?? [])].sort((left, right) => {
			const leftAt = new Date(left.reviewed_at ?? left.created_at).getTime();
			const rightAt = new Date(right.reviewed_at ?? right.created_at).getTime();
			return leftAt - rightAt;
		});

		let priorSnapshot: Partial<SpecimenPublic> = {};

		const entries = trail.map((pending) => {
			const changedData = pending.changed_data;
			const changedFields = getChangedSpecimenFields(changedData);
			const nextSnapshot = {
				...priorSnapshot,
				...buildPendingSpecimenDisplayData(changedData, {
					joineryTypes: joineryData?.data,
					fastenerTypes: fastenerData?.data,
					loadingDirections: loadingDirectionData?.data,
					subjoineryTypes: subjoineryData?.data,
					failureModes: qfmData?.data,
				}),
			};

			const entry = {
				id: pending.id,
				dateLabel: format(
					parseISO(pending.reviewed_at ?? pending.created_at),
					"PPP p",
				),
				rows: changedFields.map((field) => ({
					field,
					oldValue: priorSnapshot[field],
					newValue: nextSnapshot[field],
					isChanged: priorSnapshot[field] !== undefined,
				})),
			};

			priorSnapshot = nextSnapshot;
			return entry;
		});

		return entries.reverse();
	}, [
		data?.pending_specimens,
		fastenerData?.data,
		joineryData?.data,
		loadingDirectionData?.data,
		qfmData?.data,
		subjoineryData?.data,
	]);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-2xl">Revision History</CardTitle>
				<CardDescription>
					Approved changes applied to this record.
				</CardDescription>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="text-sm text-muted-foreground">
						Loading version history...
					</div>
				) : isError ? (
					<div className="text-sm text-destructive">
						Failed to load version history: {error?.message ?? "Unknown error"}
					</div>
				) : historyEntries.length === 0 ? (
					<div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
						No approved version history is available for this specimen.
					</div>
				) : (
					<ScrollArea className="max-h-[min(42rem,70vh)] rounded-md border">
						<Accordion type="multiple" className="px-4">
							{historyEntries.map((entry) => (
								<AccordionItem key={entry.id} value={entry.id}>
									<AccordionTrigger>{entry.dateLabel}</AccordionTrigger>
									<AccordionContent>
										<div className="grid gap-3">
											{entry.rows.length ? (
												entry.rows.map((row) => (
													<SpecimenDiffFieldRow
														key={`${entry.id}-${row.field}`}
														label={getSpecimenFieldLabel(row.field)}
														oldValue={row.oldValue}
														newValue={row.newValue}
														isChanged={row.isChanged}
														unit={fieldUnits[row.field]}
														renderOldValue={
															row.field === "e_qualitative_failure_measure"
																? () =>
																		renderFailureModeValue(
																			row.oldValue as SpecimenPublic["e_qualitative_failure_measure"],
																		)
																: undefined
														}
														renderNewValue={
															row.field === "e_qualitative_failure_measure"
																? () =>
																		renderFailureModeValue(
																			row.newValue as SpecimenPublic["e_qualitative_failure_measure"],
																		)
																: undefined
														}
													/>
												))
											) : (
												<div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
													No changed attributes were recorded for this approval.
												</div>
											)}
										</div>
									</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>
					</ScrollArea>
				)}
			</CardContent>
		</Card>
	);
}
