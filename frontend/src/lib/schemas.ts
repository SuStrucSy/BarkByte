import { z } from "zod/v4";
import { ASSEMBLY_TYPES } from "./constants";

// 👀 define the schema

export const loginSchema = z.object({
	username: z
		.email()
		.max(255, { message: "username is too long max 255 characters" }),
	password: z
		.string()
		.min(8, { message: "password should be at least 8 characters long" })
		.max(64, { message: "Password is too long max 64 characters" }),
});

export const accessTokenSchema = z.object({
	access_token: z.string(),
	token_type: z.string().optional(),
});

export const signupSchema = z
	.object({
		email: z
			.email()
			.max(255, { message: "email is too long max 255 characters" }),
		password: z
			.string()
			.min(8, { message: "password should be at least 8 characters long" })
			.max(64, { message: "Password is too long max 64 characters" }),
		confirm_password: z
			.string()
			.min(8, { message: "password should be at least 8 characters long" })
			.max(64, { message: "Password is too long max 64 characters" }),
		full_name: z.union([z.string(), z.null()]).optional(),
	})
	.superRefine(({ confirm_password, password }, ctx) => {
		if (confirm_password !== password) {
			ctx.addIssue({
				code: "custom",
				message: "The passwords did not match",
				path: ["confirm_password"],
			});
		}
	});

export const resetPasswordSchema = z
	.object({
		new_password: z
			.string()
			.min(8, { message: "password should be at least 8 characters long" })
			.max(64, { message: "Password is too long max 64 characters" }),
		confirm_password: z
			.string()
			.min(8, { message: "password should be at least 8 characters long" })
			.max(64, { message: "Password is too long max 64 characters" }),
	})
	.superRefine(({ confirm_password, new_password }, ctx) => {
		if (confirm_password !== new_password) {
			ctx.addIssue({
				code: "custom",
				message: "The passwords did not match",
				path: ["confirm_password"],
			});
		}
	});

export const recoverPasswordSchema = z.object({
	email: z
		.email()
		.max(255, { message: "email is too long max 255 characters" }),
});

export const addUserSchema = z
	.object({
		email: z
			.email()
			.max(255, { message: "email is too long max 255 characters" }),
		password: z
			.string()
			.min(8, { message: "password should be at least 8 characters long" })
			.max(64, { message: "Password is too long max 64 characters" }),
		confirm_password: z
			.string()
			.min(8, { message: "password should be at least 8 characters long" })
			.max(64, { message: "Password is too long max 64 characters" }),
		full_name: z.union([z.string(), z.null()]).optional(),
		is_active: z.boolean().optional().default(false),
		is_superuser: z.boolean().optional().default(false),
	})
	.superRefine(({ confirm_password, password }, ctx) => {
		if (confirm_password !== password) {
			ctx.addIssue({
				code: "custom",
				message: "The passwords did not match",
				path: ["confirm_password"],
			});
		}
	});

export const updatePasswordSchema = z
	.object({
		current_password: z
			.string()
			.min(8, { message: "password should be at least 8 characters long" })
			.max(64, { message: "Password is too long max 64 characters" }),
		new_password: z
			.string()
			.min(8, { message: "password should be at least 8 characters long" })
			.max(64, { message: "Password is too long max 64 characters" }),
		confirm_password: z
			.string()
			.min(8, { message: "password should be at least 8 characters long" })
			.max(64, { message: "Password is too long max 64 characters" }),
	})
	.superRefine(({ confirm_password, new_password }, ctx) => {
		if (confirm_password !== new_password) {
			ctx.addIssue({
				code: "custom",
				message: "The passwords did not match",
				path: ["confirm_password"],
			});
		}
	});

const positiveRequired = z.number().positive("Must be positive");

export const AddNewSpecimenSchema = z.object({
	// ── Step 1: DOI ────────────────────────────────────────────────────────────
	// doi_id is set when picking an existing DOI; omitted when creating a new one.
	doi_id: z.uuid().optional(),
	authors: z.string().trim().nonempty("Authors are required"),
	link: z.url({
		protocol: /^https?$/,
		hostname: z.regexes.domain,
		error: "Link must be a valid URL",
	}),
	// Plain z.number() — use valueAsNumber on the <Input type="number"> element.
	pub_year: z
		.number({ error: "Publication year is required" })
		.int("Must be an integer")
		.min(1900, "Must be a year after 1900")
		.max(new Date().getFullYear(), "Cannot be in the future"),
	ref_title: z.string().trim().nonempty("Title is required"),

	// ── Step 2: Specimen Details ───────────────────────────────────────────────
	specimen_reference_id: z
		.string()
		.trim()
		.nonempty("Specimen reference ID is required"),

	// These use z.enum() without .optional() so Zod rejects undefined and
	// surfaces a validation error when the user tries to advance without selecting.
	// The defaultValues in useForm uses `undefined as any` only for these two
	// fields — a targeted escape hatch that doesn't weaken the rest of the schema.
	assembly_type: z.enum(ASSEMBLY_TYPES, { error: "Assembly type is required" }),
	practice: z.enum(["Conventional", "Research and Development"] as const, {
		error: "Practice is required",
	}),

	joinery_type_id: z.uuid("Joinery type is required"),
	sub_joinery_type_id: z.uuid("Sub joinery type is required"),
	fastener_type_ids: z.array(z.uuid()),
	loading_direction_ids: z.array(z.uuid()),
	// Plain z.number() — use valueAsNumber on the input.
	fastener_numbers: z
		.number({ error: "Fastener count is required" })
		.int("Must be a whole number"),
	connector: z.boolean(),
	dowel: z.boolean(),
	replicate_tests: z
		.number({ error: "Replicate count is required" })
		.int("Must be a whole number")
		.min(1, "Must have at least one replicate"),
	connection_description: z.string().trim(),
	note: z.string().trim().optional().nullable(),

	// ── Step 3: Structural & Experimental Data ─────────────────────────────────
	element_dimension: z.string().trim(),
	moisture_percentage: z.string().trim(),
	wood_type: z.string().trim().optional().nullable(),
	wood_mechanical_properties: z.string().trim().optional().nullable(),
	fastener_mechanical_properties: z.string().trim().optional().nullable(),
	connector_mechanical_properties: z.string().trim().optional().nullable(),

	// All experimental measurements are optional/nullable — not every test
	// reports every value. Use valueAsNumber on inputs.
	e_stiffness: positiveRequired,
	e_yield_force: positiveRequired,
	e_yield_displacement: positiveRequired,
	e_max_force: positiveRequired,
	e_max_displacement: positiveRequired,
	e_ultimate_force: positiveRequired,
	e_ultimate_displacement: positiveRequired,
	e_ductility: positiveRequired,

	// Test metadata
	e_test_loading_type: z.enum([
		"Cyclic",
		"Monotonic",
		"Monotonic and Cyclic",
	] as const),
	e_yield_point_method: z.enum(["CEN 1/6", "EEEP"] as const),
	e_date: z.string().trim().optional().nullable(),
	e_qfm_description: z.string().trim().optional().nullable(),
	e_qualitative_failure_measure: z.array(z.uuid()),
});

export type AddNewSpecimenFormValues = z.infer<typeof AddNewSpecimenSchema>;
