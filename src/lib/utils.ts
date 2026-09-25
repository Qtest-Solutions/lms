export function cn(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}

export function errMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

const NAME_PATTERN = /^[A-Za-z][A-Za-z\s.'-]*$/;

export function isValidName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length > 0 && NAME_PATTERN.test(trimmed);
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}