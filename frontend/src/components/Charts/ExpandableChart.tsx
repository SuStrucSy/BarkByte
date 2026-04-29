import { Maximize2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

export function ExpandableChart({
	title,
	children,
}: {
	title: string;
	children: () => React.ReactNode;
}) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button size="icon" variant="ghost" onClick={() => setOpen(true)}>
				<Maximize2 className="h-4 w-4" />
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="flex flex-col w-11/12 max-w-none!  h-screen  rounded-none p-6">
					<DialogHeader>
						<DialogTitle>{title}</DialogTitle>
					</DialogHeader>
					<div className="min-h-0 flex-1">{open && children()}</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
