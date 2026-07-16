import type { FormEventHandler, ReactNode } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";

type ReferenceCreateDialogProps<TFormValues extends FieldValues> = {
	title: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	form: UseFormReturn<TFormValues>;
	onSubmit: FormEventHandler<HTMLFormElement>;
	renderFormFields: (form: UseFormReturn<TFormValues>) => ReactNode;
};

export function ReferenceCreateDialog<TFormValues extends FieldValues>({
	title,
	open,
	onOpenChange,
	form,
	onSubmit,
	renderFormFields,
}: ReferenceCreateDialogProps<TFormValues>) {
	const formId = `${title}-create-form`;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<Form {...form}>
				<form id={formId} onSubmit={onSubmit}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add {title.toLowerCase()}</DialogTitle>
						</DialogHeader>
						<div className="grid gap-4 py-2">{renderFormFields(form)}</div>
						<DialogFooter>
							<DialogClose asChild>
								<Button
									type="button"
									variant="outline"
									disabled={form.formState.isSubmitting}
								>
									Cancel
								</Button>
							</DialogClose>
							<Button
								type="submit"
								form={formId}
								disabled={form.formState.isSubmitting}
							>
								Save
							</Button>
						</DialogFooter>
					</DialogContent>
				</form>
			</Form>
		</Dialog>
	);
}
