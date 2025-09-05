// Статусы коммита синхронизированные с блокчейн контрактом
export enum CommitStatus {
  PENDING = 'pending', // Коммит создан, ожидает подтверждения
  APPROVED = 'approved', // Коммит одобрен
  DECLINED = 'declined', // Коммит отклонен
}
