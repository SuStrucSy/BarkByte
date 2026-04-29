import { X } from "lucide-react";
import { Button } from "../ui/button";

interface DisclaimerProps {
	isVisible: boolean;
	setVisible: (value: boolean | ((prev: boolean) => boolean)) => void;
}

export function Disclaimer({ isVisible, setVisible }: DisclaimerProps) {
	if (!isVisible) return null;

	return (
		<div className="pointer-events-none fixed right-3 top-2 z-[70] w-[calc(100vw-1.5rem)] max-w-lg sm:right-4 sm:top-2">
			<div className="pointer-events-auto animate-in fade-in-0 slide-in-from-top-2 duration-300 rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-lg">
				<div className="flex items-start gap-3">
					<p className="flex-1 text-sm leading-7 text-amber-950">
						<span className="font-semibold">Disclaimer: </span>
						This database contains curated data from cited references for
						research and educational purposes. It is intended as a preliminary
						engineering resource and does not replace project-specific design,
						codes, or manufacturer documentation. Use is at your own discretion,
						provided "as is", and the authors are not liable for any outcomes.
						Users should verify information with original sources.
					</p>
					<Button
						type="button"
						onClick={() => setVisible(false)}
						variant="ghost"
						size="icon"
						className="size-7 shrink-0 text-amber-900 hover:bg-amber-100 hover:text-amber-950"
						aria-label="Close disclaimer"
					>
						<X className="size-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
