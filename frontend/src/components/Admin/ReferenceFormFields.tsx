import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

type ReferenceFormFieldProps<TFormValues extends FieldValues> = {
	form: UseFormReturn<TFormValues>;
};

type ReferenceBooleanFieldProps<TFormValues extends FieldValues> =
	ReferenceFormFieldProps<TFormValues> & {
		name: Path<TFormValues>;
		label: string;
		description?: string;
	};

type ReferenceSelectFieldProps<TFormValues extends FieldValues> =
	ReferenceFormFieldProps<TFormValues> & {
		name: Path<TFormValues>;
		label: string;
		placeholder: string;
		options: Array<{
			label: string;
			value: string;
		}>;
	};

export function ReferenceLabelField<TFormValues extends FieldValues>({
	form,
}: ReferenceFormFieldProps<TFormValues>) {
	return (
		<FormField
			control={form.control}
			name={"label" as Path<TFormValues>}
			rules={{ required: "Label is required" }}
			render={({ field }) => (
				<FormItem>
					<FormLabel>Label</FormLabel>
					<FormControl>
						<Input {...field} value={field.value ?? ""} />
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}

export function ReferenceBooleanField<TFormValues extends FieldValues>({
	form,
	name,
	label,
	description,
}: ReferenceBooleanFieldProps<TFormValues>) {
	return (
		<FormField
			control={form.control}
			name={name}
			render={({ field }) => (
				<FormItem className="flex flex-row items-center gap-3 rounded-md border p-3">
					<FormControl>
						<Checkbox
							checked={field.value ?? false}
							onCheckedChange={(checked) => field.onChange(Boolean(checked))}
						/>
					</FormControl>
					<div className="space-y-1">
						<FormLabel className="text-sm font-medium">{label}</FormLabel>
						{description ? (
							<p className="text-sm text-muted-foreground">{description}</p>
						) : null}
					</div>
				</FormItem>
			)}
		/>
	);
}

export function ReferenceSelectField<TFormValues extends FieldValues>({
	form,
	name,
	label,
	placeholder,
	options,
}: ReferenceSelectFieldProps<TFormValues>) {
	return (
		<FormField
			control={form.control}
			name={name}
			rules={{ required: `${label} is required` }}
			render={({ field }) => (
				<FormItem>
					<FormLabel>{label}</FormLabel>
					<Select value={field.value} onValueChange={field.onChange}>
						<FormControl>
							<SelectTrigger className="w-full">
								<SelectValue placeholder={placeholder} />
							</SelectTrigger>
						</FormControl>
						<SelectContent>
							{options.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
