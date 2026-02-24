import { Controller, type Control } from "react-hook-form";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "../ui/input";
import type { AddNewSpecimenFormValues } from "@/lib/schemas";

interface DoiFieldsProps {
  // `any` for TContext suppresses the resolver generic mismatch that occurs
  // when TypeScript re-infers Control's third generic at each call site.
  control: Control<AddNewSpecimenFormValues, any>;
  /** When true, all inputs are disabled (user selected an existing DOI). */
  readOnly?: boolean;
}

export function DoiFields({ control, readOnly = false }: DoiFieldsProps) {
  return (
    <FieldGroup>
      <Controller
        name="link"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="link">DOI Link</FieldLabel>
            <Input
              {...field}
              id="link"
              aria-invalid={fieldState.invalid}
              autoComplete="off"
              type="url"
              disabled={readOnly}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="ref_title"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="ref_title">Reference Title</FieldLabel>
            <Input
              {...field}
              id="ref_title"
              aria-invalid={fieldState.invalid}
              autoComplete="off"
              disabled={readOnly}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="authors"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="authors">Authors</FieldLabel>
            <Input
              {...field}
              id="authors"
              aria-invalid={fieldState.invalid}
              autoComplete="off"
              disabled={readOnly}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="pub_year"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="pub_year">Publication Year</FieldLabel>
            <Input
              id="pub_year"
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.valueAsNumber)}
              aria-invalid={fieldState.invalid}
              autoComplete="off"
              type="number"
              disabled={readOnly}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </FieldGroup>
  );
}
