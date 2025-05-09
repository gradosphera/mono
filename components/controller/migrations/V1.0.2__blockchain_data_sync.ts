import { BlockchainService } from '../src/infrastructure/blockchain/blockchain.service';
import Vault from '../src/models/vault.model';
import config from '../src/config/config';
import type { SovietContract } from 'cooptypes';

export default {
  name: 'Синхронизация данных из блокчейна',
  isTest: false, // Включаем тестовый режим - миграция не будет сохранена в БД

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

          const oldRows = await blockchain.getAllRows<SovietContract.Tables.AgreementsLegacy.IAgreementLegacy>(
            'soviet',
            coopname,
            'agreements'
          );

          console.log('Получено legacy соглашений:', oldRows.length);

          // Получаем все строки из таблицы agreements2
          const newRows = await blockchain.getAllRows<SovietContract.Tables.Agreements.IAgreement>(
            'soviet',
            coopname,
            'agreements2'
          );

          console.log('Получено новых соглашений:', newRows.length);

          // Находим соглашения, которые ещё не были перенесены
          const newAgreementIds = new Set(newRows.map((row) => row.id));
          const notMigratedAgreements = oldRows.filter((row) => !newAgreementIds.has(row.id));

          console.log('Соглашения, которые НЕ были перенесены:', notMigratedAgreements.length);
          console.log('Детали непереносимых соглашений:');
          notMigratedAgreements.forEach((agreement) => {
            console.log(
              `ID: ${agreement.id}, Пользователь: ${agreement.username}, Тип: ${agreement.type}, Статус: ${agreement.status}`
            );
          });

          // Подготовка массива транзакций для миграции
          if (notMigratedAgreements.length > 0) {
            console.log('Подготовлен массив транзакций для миграции');
            console.log('COOPNAME: ', coopname);

            // Последовательная миграция соглашений
            for (let i = 0; i < notMigratedAgreements.length; i++) {
              const agreement = notMigratedAgreements[i];
              console.log(`Миграция соглашения ${i + 1}/${notMigratedAgreements.length}, ID: ${agreement.id}`);

              try {
                await blockchain.transact({
                  account: 'soviet',
                  name: 'migrateagree',
                  authorization: [{ actor: coopname, permission: 'active' }],
                  data: {
                    coopname,
                    agreement_id: agreement.id,
                  },
                });
                console.log(`✅ Соглашение ID: ${agreement.id} успешно перенесено`);
              } catch (error) {
                console.error(`❌ Ошибка при переносе соглашения ID: ${agreement.id}:`, error);
              }
            }

            console.log('Миграция соглашений завершена');
          }

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
