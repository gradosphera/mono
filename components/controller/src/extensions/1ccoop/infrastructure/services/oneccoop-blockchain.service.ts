import { Injectable } from '@nestjs/common';
import { getTables } from '~/utils/getFetch';
import { RegistratorContract } from 'cooptypes';

/**
 * Интерфейс данных кооператива, необходимых для 1CCoop
 */
export interface CooperativeContributionsData {
  /**
   * Вступительный взнос для физических лиц и ИП
   */
  initial: string;

  /**
   * Минимальный паевой взнос для физических лиц и ИП
   */
  minimum: string;

  /**
   * Вступительный взнос для юридических лиц
   */
  org_initial: string;

  /**
   * Минимальный паевой взнос для юридических лиц
   */
  org_minimum: string;
}

/**
 * Сервис для работы с данными блокчейна в расширении 1CCoop
 * Извлекает необходимые данные из дельт блокчейна
 */
@Injectable()
export class OneCoopBlockchainService {
  /**
   * Получает данные о взносах кооператива на указанный блок
   * @param coopname Имя кооператива
   * @param blockNum Номер блока для исторического запроса
   * @returns Данные о взносах кооператива
   */
  async getCooperativeData(coopname: string, blockNum?: number): Promise<CooperativeContributionsData> {
    const blockFilter = blockNum ? { block_num: { $lte: blockNum } } : {};

    const response = await getTables(`${process.env.SIMPLE_EXPLORER_API}/get-tables`, {
      filter: JSON.stringify({
        code: RegistratorContract.contractName.production,
        scope: RegistratorContract.contractName.production,
        table: RegistratorContract.Tables.Cooperatives.tableName,
        'value.username': coopname,
        ...blockFilter,
      }),
      limit: '1',
    });

    const coopData = response?.results?.[0]?.value as RegistratorContract.Tables.Cooperatives.ICooperative | undefined;

    if (!coopData) {
      throw new Error(`Данные кооператива ${coopname} не найдены в блокчейне`);
    }

    return {
      initial: coopData.initial,
      minimum: coopData.minimum,
      org_initial: coopData.org_initial,
      org_minimum: coopData.org_minimum,
    };
  }
}
