/**
 * Оборот Стола заказов за период — общий расчёт для «Экономики» кооператива и
 * «Экономики участка».
 *
 * Две стороны оборота живут в разных сущностях, и это не техническая деталь, а
 * существо дела:
 *   - приход — приёмка имущества на склад участка (позиции склада несут цену
 *     прибытия и дату приёмки);
 *   - выдача — исполненный заказ (только у него есть факт выдачи, дата
 *     получения заказчиком и наценка кооператива).
 * Поэтому период считается по дате приёмки для прихода и по дате получения
 * для выдачи — у склада своей даты выдачи нет вовсе.
 *
 * Суммы считаются единственной формулой платформы `marketplaceLineCost`:
 * цена задана за единицу отпуска, и «количество × цена» при отпуске упаковкой
 * завышало бы сумму ровно в размер упаковки.
 */
import { marketplaceLineCost } from './line-cost';

/** Позиция склада, нужная обороту. Структурный тип — вью SDK подходит как есть. */
export interface TurnoverInventoryItem {
  braname: string;
  offer_id?: string | null;
  product_name_snapshot: string;
  quantity_per_label: number;
  package_size?: number | null;
  arrival_price?: string | null;
  unit_of_measure?: string | null;
  delivery_point_name?: string | null;
  delivery_point_address?: string | null;
  received_at?: unknown;
  created_at?: unknown;
}

/** Заказ, нужный обороту. */
export interface TurnoverOrder {
  status: string;
  delivery_braname: string;
  offer_id?: string | null;
  product_name?: string | null;
  quantity: number;
  package_size?: number | null;
  unit_of_measure?: string | null;
  delivery_point_name?: string | null;
  delivery_point_address?: string | null;
  total_cost?: string | null;
  membership_fee?: string | null;
  received_at?: unknown;
  issuance_fact?: { actual_quantity: number; fact_cost: string } | null;
}

export interface TurnoverRow {
  key: string;
  title: string;
  branchName: string;
  branchAddress: string | null;
  /** Единица измерения позиции — как она пришла с бэкенда. */
  unitOfMeasure: string | null;
  packageSize: number | null;
  acceptedUnits: number;
  acceptedAmount: number;
  issuedUnits: number;
  issuedAmount: number;
  /** Наценка кооператива с выданного — доход участка выдачи. */
  feeAmount: number;
}

export interface TurnoverTotals {
  acceptedAmount: number;
  issuedAmount: number;
  feeAmount: number;
}

/** Статус исполненного заказа: имущество получено заказчиком. */
const ORDER_RECEIVED = 'RECEIVED';

function timeOf(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const t = new Date(String(value)).getTime();
  return Number.isFinite(t) ? t : null;
}

function toNumber(value: string | number | null | undefined): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const parsed = Number.parseFloat(String(value ?? ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function emptyRow(key: string): TurnoverRow {
  return {
    key,
    title: '',
    branchName: '',
    branchAddress: null,
    unitOfMeasure: null,
    packageSize: null,
    acceptedUnits: 0,
    acceptedAmount: 0,
    issuedUnits: 0,
    issuedAmount: 0,
    feeAmount: 0,
  };
}

/**
 * Свод оборота по парам «позиция × пункт выдачи».
 *
 * `sinceMs` — начало периода в миллисекундах; `null` — за всё время.
 */
export function buildTurnover(
  inventory: TurnoverInventoryItem[],
  orders: TurnoverOrder[],
  sinceMs: number | null,
): { rows: TurnoverRow[]; totals: TurnoverTotals } {
  const map = new Map<string, TurnoverRow>();

  for (const item of inventory) {
    const at = timeOf(item.received_at) ?? timeOf(item.created_at);
    if (sinceMs !== null && (at === null || at < sinceMs)) continue;

    const key = `${item.braname}::${item.offer_id ?? item.product_name_snapshot}`;
    const row = map.get(key) ?? emptyRow(key);
    row.title ||= item.product_name_snapshot;
    row.branchName ||= item.delivery_point_name?.trim() || item.braname;
    row.branchAddress ??= item.delivery_point_address ?? null;
    row.unitOfMeasure ??= item.unit_of_measure ?? null;
    row.packageSize ??= item.package_size ?? null;
    row.acceptedUnits += item.quantity_per_label;
    row.acceptedAmount += marketplaceLineCost(
      item.quantity_per_label,
      item.arrival_price,
      item.package_size,
    );
    map.set(key, row);
  }

  for (const order of orders) {
    if (order.status !== ORDER_RECEIVED) continue;
    const at = timeOf(order.received_at);
    if (sinceMs !== null && (at === null || at < sinceMs)) continue;

    const key = `${order.delivery_braname}::${order.offer_id ?? order.product_name ?? ''}`;
    const row = map.get(key) ?? emptyRow(key);
    row.title ||= order.product_name ?? 'Товар по предложению';
    row.branchName ||= order.delivery_point_name?.trim() || order.delivery_braname;
    row.branchAddress ??= order.delivery_point_address ?? null;
    row.unitOfMeasure ??= order.unit_of_measure ?? null;
    row.packageSize ??= order.package_size ?? null;
    // Факт выдачи важнее заказанного: при недопоставке выдано меньше, и
    // оборотом прошло именно выданное.
    row.issuedUnits += order.issuance_fact?.actual_quantity ?? order.quantity;
    row.issuedAmount += order.issuance_fact
      ? toNumber(order.issuance_fact.fact_cost)
      : toNumber(order.total_cost);
    row.feeAmount += toNumber(order.membership_fee);
    map.set(key, row);
  }

  const rows = [...map.values()].sort(
    (a, b) => b.issuedAmount + b.acceptedAmount - (a.issuedAmount + a.acceptedAmount),
  );

  const totals = rows.reduce<TurnoverTotals>(
    (sum, r) => ({
      acceptedAmount: sum.acceptedAmount + r.acceptedAmount,
      issuedAmount: sum.issuedAmount + r.issuedAmount,
      feeAmount: sum.feeAmount + r.feeAmount,
    }),
    { acceptedAmount: 0, issuedAmount: 0, feeAmount: 0 },
  );

  return { rows, totals };
}

/** Периоды, за которые смотрят оборот. `0` — за всё время. */
export const TURNOVER_PERIODS = [
  { label: 'За 7 дней', value: 7 },
  { label: 'За 30 дней', value: 30 },
  { label: 'За 90 дней', value: 90 },
  { label: 'За всё время', value: 0 },
];

/** Начало периода в миллисекундах; `null` — за всё время. */
export function turnoverSince(periodDays: number): number | null {
  return periodDays > 0 ? Date.now() - periodDays * 86_400_000 : null;
}
