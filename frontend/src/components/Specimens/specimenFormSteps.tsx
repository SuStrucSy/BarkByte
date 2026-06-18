import type { ReactNode } from "react";
import type { Control, FieldPath } from "react-hook-form";
import { DoiFields } from "@/components/Doi/DoiFields";
import { SpecimenDetailsFields } from "@/components/Specimens/SpecimenDetailsFields";
import { SpecimenExperimentalFields } from "@/components/Specimens/SpecimenExperimentalFields";
import { SpecimenStructuralFields } from "@/components/Specimens/SpecimenStructuralFields";
import type { AddNewSpecimenFormValues } from "@/lib/schemas";

type SpecimenFormStepRenderParams = {
	control: Control<AddNewSpecimenFormValues>;
	hasExistingDoi: boolean;
};

export type SpecimenFormStep = {
	id: string;
	title: string;
	description: string;
	fields: readonly FieldPath<AddNewSpecimenFormValues>[];
	render: (params: SpecimenFormStepRenderParams) => ReactNode;
};

export const specimenFormSteps = [
	{
		id: "doi",
		title: "DOI Details",
		description:
			"Link this specimen to a published paper. You can search for an existing DOI or enter a new one manually.",
		fields: ["authors", "link", "pub_year", "ref_title"],
		render: ({ control, hasExistingDoi }) => (
			<DoiFields control={control} readOnly={hasExistingDoi} />
		),
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
		],
		render: ({ control }) => <SpecimenDetailsFields control={control} />,
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
		],
		render: ({ control }) => <SpecimenStructuralFields control={control} />,
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
			"e_date",
			"e_qualitative_failure_measure",
			"e_qfm_description",
		],
		render: ({ control }) => <SpecimenExperimentalFields control={control} />,
	},
] as const satisfies readonly SpecimenFormStep[];

export const createSpecimenSteps = specimenFormSteps;

export const editSpecimenSteps = specimenFormSteps.filter(
	(step) => step.id !== "doi",
);

export type SpecimenFormStepMode = "create" | "edit";

export function getSpecimenFormSteps(mode: SpecimenFormStepMode) {
	return mode === "create" ? createSpecimenSteps : editSpecimenSteps;
}
