import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { type Control, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import type { AddNewSpecimenFormValues } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { changedControlClassName } from "./changedFieldStyles";

type SpecimenDateFieldProps = {
	control: Control<AddNewSpecimenFormValues>;
	name: "e_date";
	label: string;
	placeholder: string;
	triggerClassName?: string;
	isChanged?: boolean;
};

export function SpecimenDateField({
	control,
	name,
	label,
	placeholder,
	triggerClassName = "w-full",
	isChanged = false,
}: SpecimenDateFieldProps) {
	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState }) => (
				<Field data-invalid={fieldState.invalid}>
					<FieldLabel htmlFor={name}>{label}</FieldLabel>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								id={name}
								type="button"
								variant="outline"
								aria-invalid={fieldState.invalid}
								className={cn(
									triggerClassName,
									isChanged && changedControlClassName,
								)}
							>
								{field.value
									? format(parseISO(field.value), "PPP")
									: placeholder}
								<CalendarIcon className="h-4 w-4 text-muted-foreground" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0" align="start">
							<Calendar
								mode="single"
								selected={
									field.value ? parseISO(field.value as string) : undefined
								}
								onSelect={(date) =>
									field.onChange(date ? format(date, "yyyy-MM-dd") : "")
								}
							/>
						</PopoverContent>
					</Popover>
					{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
				</Field>
			)}
		/>
	);
}
