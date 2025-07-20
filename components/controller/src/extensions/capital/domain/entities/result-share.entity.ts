export enum ShareType {
  CREATOR = 'creator',
  AUTHOR = 'author',
  INVESTOR = 'investor',
  COORDINATOR = 'coordinator',
}

export interface ResultShareDomainEntity {
  id: string;
  projectId: string;
  contributorId: string;

  // Тип доли
  type: ShareType;

  // Базовые расчеты
  timeSpent: number; // время, затраченное создателем (часы)
  hourRate: number; // ставка за час
  baseCost: number; // время * ставка

  // Премии
  creatorBonus: number; // премия создателя (100% от baseCost)
  authorBonus: number; // премия автора (61.8% от общей стоимости времени создателей)

  // Компенсации
  loanReceived: number; // сумма полученной ссуды

  // Итоговая доля
  finalShare: number; // итоговая доля в результате
  sharePercent: number; // процент от общего результата проекта

  // Статус
  isCalculated: boolean;
  isDistributed: boolean;

  // Расчетные поля (заглушки для математического ядра)
  calculationDetails?: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
  distributedAt?: Date;
}
