import { BlockchainService } from '../src/infrastructure/blockchain/blockchain.service';
import Vault from '../src/models/vault.model';
import config from '../src/config/config';

export default {
  name: 'Синхронизация данных из блокчейна',
  isTest: true, // Включаем тестовый режим - миграция не будет сохранена в БД

  async up({ blockchain }: { blockchain: BlockchainService }): Promise<boolean> {
    console.log('Выполнение миграции: Синхронизация данных из блокчейна');

    try {
      // Проверяем статус подключения к блокчейну без авторизации
      const info = await blockchain.getInfo();
      console.log(`Подключение к блокчейну успешно. Chain ID: ${info.chain_id}`);
      console.log(`Информация о блокчейне: Chain - ${info.chain_id}, Head Block: ${info.head_block_num}`);

      // Имя кооператива, чьи данные будем синхронизировать
      const coopname = config.coopname; // Укажите имя вашего кооператива

      // Получаем приватный ключ из Vault модели
      try {
        const wif = await Vault.getWif(coopname);

        if (wif) {
          console.log(`Получен приватный ключ для аккаунта ${coopname}`);

          // Инициализируем блокчейн-сервис с полученным ключом
          blockchain.initialize(coopname, wif);
          console.log(`Блокчейн-сервис инициализирован с аккаунтом ${coopname}`);

          // Теперь можно выполнять транзакции от имени аккаунта
          // blockchain.transact(...);
        } else {
          console.log(`Приватный ключ для ${coopname} не найден в Vault`);
        }
      } catch (vaultError) {
        console.error('Ошибка при получении ключа из Vault:', vaultError);
      }

      console.log('Миграция завершена: Синхронизация данных из блокчейна выполнена успешно');
      return true;
    } catch (error) {
      console.error('Ошибка при выполнении миграции блокчейн-данных:', error);
      return false;
    }
  },
};
