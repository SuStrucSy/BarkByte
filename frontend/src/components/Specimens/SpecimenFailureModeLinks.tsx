import type { FailureMode } from "@/api/model";
import {
  serializeStructuredFilterQuery,
  slugifyFilterValue,
} from "@/components/Data-Table/specimenTableFilters";
import { FailureModeBadge } from "@/components/Common/FailureModeBadge";

type SpecimenFailureModeLinksProps = {
  failureModes: FailureMode[];
};

export function SpecimenFailureModeLinks({
  failureModes,
}: SpecimenFailureModeLinksProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] tracking-wide text-muted-foreground">
        QFM
      </span>
      <div className="flex flex-wrap gap-2">
        {failureModes.map((failureMode) => {
          const label = failureMode.label ?? "";
          const query = serializeStructuredFilterQuery([
            {
              field: "failure_modes",
              mode: "any",
              values: [slugifyFilterValue(label)],
            },
          ]);

          return (
            <FailureModeBadge
              key={label}
              label={label}
              asChild
            >
              <a
                href={`/specimens?q=${encodeURIComponent(query)}`}
                target="_blank"
                rel="noreferrer"
              >
                {label}
              </a>
            </FailureModeBadge>
          );
        })}
      </div>
    </div>
  );
}
