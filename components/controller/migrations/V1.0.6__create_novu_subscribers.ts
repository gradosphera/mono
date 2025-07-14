import mongoose from 'mongoose';
import { Novu } from '@novu/api';
import config from '../src/config/config';
import { generateSubscriberId, generateSubscriberHash } from '../src/utils/novu.utils';

export default {
  name: 'Создание подписчиков NOVU из существующих пользователей',

  async up() {
    console.log('Выполнение миграции: Создание подписчиков NOVU из существующих пользователей');

    // Инициализируем Novu SDK
    const novu = new Novu({
      secretKey: config.novu.api_key,
      serverURL: config.novu.backend_url,
    });

    try {
      const usersCollection = mongoose.connection.collection('users');
      const individualsCollection = mongoose.connection.collection('individuals');
      const organizationsCollection = mongoose.connection.collection('organizations');
      const entrepreneursCollection = mongoose.connection.collection('entrepreneurs');

      // Получаем всех пользователей
      const users = await usersCollection.find({}).toArray();
      console.log(`Найдено пользователей: ${users.length}`);

      let createdCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      for (const user of users) {
        try {
          // Генерируем subscriber_id если его нет
          let subscriberId = user.subscriber_id;
          if (!subscriberId) {
            subscriberId = await generateSubscriberId(config.coopname);
          } else return;

          // Генерируем subscriber_hash
          const subscriberHash = generateSubscriberHash(subscriberId);

          // Ищем приватные данные пользователя
          let email = user.email || '';
          let firstName = '';
          let lastName = '';

          if (user.type === 'individual') {
            const individual = await individualsCollection.findOne({ username: user.username });
            if (individual) {
              firstName = individual.first_name || '';
              lastName = individual.last_name || '';
              email = individual.email || email;
            }
          } else if (user.type === 'organization') {
            const organization = await organizationsCollection.findOne({ username: user.username });
            if (organization) {
              email = organization.email || email;
              // Для организации используем данные представителя
              if (organization.represented_by) {
                firstName = organization.represented_by.first_name || '';
                lastName = organization.represented_by.last_name || '';
              }
            }
          } else if (user.type === 'entrepreneur') {
            const entrepreneur = await entrepreneursCollection.findOne({ username: user.username });
            if (entrepreneur) {
              firstName = entrepreneur.first_name || '';
              lastName = entrepreneur.last_name || '';
              email = entrepreneur.email || email;
            }
          }

          // Проверяем минимальные требования
          if (!email) {
            console.warn(`Пропускаем пользователя ${user.username} - нет email`);
            skippedCount++;
            continue;
          }

          // Создаем подписчика в NOVU
          const subscriberData = {
            subscriberId,
            email,
            firstName,
            lastName,
            locale: 'ru_RU',
          };

          try {
            await novu.subscribers.create(subscriberData);
            createdCount++;
            console.log(`Создан подписчик для пользователя: ${user.username}`);
          } catch (createError: any) {
            // Если подписчик уже существует, пытаемся обновить
            if (
              createError.message?.includes('already exists') ||
              createError.message?.includes('Subscriber already exists')
            ) {
              try {
                await novu.subscribers.patch(subscriberData, subscriberId);
                createdCount++;
                console.log(`Обновлен подписчик для пользователя: ${user.username}`);
              } catch (updateError: any) {
                console.error(`Ошибка обновления подписчика для ${user.username}: ${updateError.message}`);
                errorCount++;
              }
            } else {
              console.error(`Ошибка создания подписчика для ${user.username}: ${createError.message}`);
              errorCount++;
            }
          }

          // Обновляем пользователя в базе данных
          await usersCollection.updateOne(
            { _id: user._id },
            {
              $set: {
                subscriber_id: subscriberId,
                subscriber_hash: subscriberHash,
              },
            }
          );
        } catch (error: any) {
          console.error(`Ошибка обработки пользователя ${user.username}: ${error.message}`);
          errorCount++;
        }
      }

      console.log('Миграция завершена!');
      console.log(`Создано/обновлено подписчиков: ${createdCount}`);
      console.log(`Пропущено пользователей: ${skippedCount}`);
      console.log(`Ошибок: ${errorCount}`);
    } catch (error: any) {
      console.error('Ошибка выполнения миграции:', error.message);
      throw error;
    }

    return true;
  },
};
