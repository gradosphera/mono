import mongoose from 'mongoose';
import { generateSubscriberHash } from '../src/utils/novu.utils';
import type { MigrationLogger } from '../src/migrator/migration-logger';

export default {
  name: 'Обновление subscriber_hash для всех пользователей',
  validUntil: new Date(), // Текущая дата, миграция больше не будет применяться
  async up({ logger }: { logger: MigrationLogger }) {
    logger.info('Выполнение миграции: Обновление subscriber_hash для всех пользователей');

    try {
      const usersCollection = mongoose.connection.collection('users');

      // Получаем всех пользователей, у которых есть subscriber_id
      const users = await usersCollection.find({ subscriber_id: { $exists: true, $ne: null } }).toArray();
      logger.info(`Найдено пользователей с subscriber_id: ${users.length}`);

      let updatedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      for (const user of users) {
        try {
          // Проверяем, что subscriber_id существует
          if (!user.subscriber_id) {
            logger.warn(`Пропускаем пользователя ${user.username} - нет subscriber_id`);
            skippedCount++;
            continue;
          }

          // Генерируем новый subscriber_hash
          const newSubscriberHash = generateSubscriberHash(user.subscriber_id);

          // Обновляем пользователя в базе данных
          await usersCollection.updateOne(
            { _id: user._id },
            {
              $set: {
                subscriber_hash: newSubscriberHash,
              },
            }
          );

          updatedCount++;
          logger.info(`Обновлен subscriber_hash для пользователя: ${user.username}`);
        } catch (error: any) {
          logger.error(`Ошибка обновления пользователя ${user.username}: ${error.message}`);
          errorCount++;
        }
      }

      logger.info('Миграция завершена!');
      logger.info(`Обновлено пользователей: ${updatedCount}`);
      logger.info(`Пропущено пользователей: ${skippedCount}`);
      logger.info(`Ошибок: ${errorCount}`);

      // Сохраняем логи в базу данных
      await logger.saveLogs();
    } catch (error: any) {
      logger.error('Ошибка выполнения миграции: ' + error.message);

      // Сохраняем логи даже в случае ошибки
      await logger.saveLogs();

      throw error;
    }

    return true;
  },
};
