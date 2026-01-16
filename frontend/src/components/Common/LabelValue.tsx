import * as React from "react"

type LabelValueProps = {
  label: string
  value: React.ReactNode
}

export function LabelValue({ label, value }: LabelValueProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="font-medium">{value}</span>
    </div>
  )
}