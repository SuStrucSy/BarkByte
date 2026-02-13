import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

type SpecimenHeaderProps = {
  id: string;
};

export function SpecimenHeader({ id }: SpecimenHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-semibold">{id}</h1>
      </div>
      <Button variant="outline" asChild>
        <Link to="/specimens">Back to specimens</Link>
      </Button>
    </div>
  );
}
