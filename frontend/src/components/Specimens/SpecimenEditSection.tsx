import type { ReactNode } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";

type SpecimenEditSectionProps = {
	children: ReactNode;
	description?: string;
	title: string;
};

export function SpecimenEditSection({
	children,
	description,
	title,
}: SpecimenEditSectionProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				{description ? <CardDescription>{description}</CardDescription> : null}
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
	);
}
