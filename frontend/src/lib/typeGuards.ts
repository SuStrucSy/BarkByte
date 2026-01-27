export function isNumericValue(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value) && isFinite(value);
}

export function hasNumericProperty<K extends string>(
  obj: unknown,
  key: K,
): obj is Record<K, number> {
  return (
    typeof obj === "object" &&
    obj !== null &&
    key in obj &&
    isNumericValue((obj as any)[key])
  );
}
