export function cn(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}

export function errMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}