import type { SpecimenPublic } from "@/api/model"
import { renderValue, humanizeLabel } from "@/lib/utils"
import type { Label } from "plotly.js"
import * as React from "react"
import { CheckIcon, XIcon } from "lucide-react"
import {  } from "@/lib/utils"

type LabelValueProps = {
  property: keyof SpecimenPublic
  data: SpecimenPublic
}

const manual_labels: Partial<Record<keyof SpecimenPublic, string>> = {
  e_qfm_description: "QFM Description"
}

function renderYesNoValue(value: string) {
  if (value === "Yes") {
    return <CheckIcon className="size-4 text-green-600" />
  }

  if (value === "No") {
    return <XIcon className="size-4 text-red-600" />
  }

  return value
}

function getLabel(property: keyof SpecimenPublic): string {
  return manual_labels[property] || humanizeLabel(property);
}

// export function LabelValue({ label, value }: LabelValueProps) {
export function LabelValue({property, data}: LabelValueProps) {
  
  const label = getLabel(property);
  const value = renderYesNoValue(renderValue(data[property]));

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] tracking-wide text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
