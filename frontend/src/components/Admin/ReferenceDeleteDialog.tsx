import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";

type ReferenceDeleteDialogProps = {
	title: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	description: string;
	isDeleteDisabled: boolean;
	onConfirm: () => Promise<void>;
};

export function ReferenceDeleteDialog({
	title,
	open,
	onOpenChange,
	description,
	isDeleteDisabled,
	onConfirm,
}: ReferenceDeleteDialogProps) {
	const form = useForm();
	const formId = `${title}-delete-form`;
	const handleSubmit = form.handleSubmit(onConfirm);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<Form {...form}>
				<form id={formId} onSubmit={handleSubmit}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Are you sure?</DialogTitle>
							<DialogDescription>{description}</DialogDescription>
						</DialogHeader>
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
								variant="destructive"
								disabled={form.formState.isSubmitting || isDeleteDisabled}
							>
								Delete
							</Button>
						</DialogFooter>
					</DialogContent>
				</form>
			</Form>
		</Dialog>
	);
}
