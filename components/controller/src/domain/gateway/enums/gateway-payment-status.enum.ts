/**
 * Статус платежа в системе Gateway
 */
export enum GatewayPaymentStatusEnum {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}
