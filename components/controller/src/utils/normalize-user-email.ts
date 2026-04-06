/**
 * Единый формат email в БД и при сравнении: trim + lowercase (доменная часть почты нечувствительна к регистру).
 */
export function normalizeUserEmail(email: string): string {
  return email.trim().toLowerCase();
}
