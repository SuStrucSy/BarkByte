import joineryTypesReference from "@/assets/joineryTypes.webp";
import { ZoomableImageViewer } from "@/components/Common/ZoomableImageViewer";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function JoineryTypesReferenceCard() {
	return (
		<Card className="py-0">
			<CardHeader className="p-6">
				<CardTitle>Joinery Types Reference</CardTitle>
				<CardDescription>
					Quick visual guide to the timber joinery and connection details used
					throughout the specimen dataset.
				</CardDescription>
			</CardHeader>
			<CardContent className="p-6 pt-0">
				<ZoomableImageViewer
					imageSrc={joineryTypesReference}
					alt="Reference sheet showing timber joinery and connection types"
				/>
			</CardContent>
		</Card>
	);
}
