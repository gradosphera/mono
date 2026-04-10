/**
 * Допуск при сравнении дробных часов (estimate, time entries), чтобы избежать
 * ложных расхождений из‑за float.
 */
export const HOURS_FLOAT_EPSILON = 1e-6;

export function isNegligibleHours(hours: number): boolean {
  return Math.abs(hours) < HOURS_FLOAT_EPSILON;
}

export function hoursAlmostEqual(a: number, b: number): boolean {
  return Math.abs(a - b) < HOURS_FLOAT_EPSILON;
}
