// Статусы проекта синхронизированные с блокчейн контрактом
export enum ProjectStatus {
  PENDING = 'pending', // Проект создан
  ACTIVE = 'active', // Проект активен для коммитов
  VOTING = 'voting', // Проект на голосовании
  COMPLETED = 'completed', // Проект завершен
  CLOSED = 'closed', // Проект закрыт
}
