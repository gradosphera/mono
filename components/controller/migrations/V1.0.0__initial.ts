import mongoose from 'mongoose';

export default {
  name: 'Добавление поля fact_address для организаций',

  async up() {
    console.log('Выполнение миграции: Добавление поля fact_address для организаций');

    // Получение коллекции организаций
    const organizationsCollection = mongoose.connection.collection('organizations');

    // Находим все записи, где поле fact_address отсутствует
    const organizations = await organizationsCollection.find({ fact_address: { $exists: false } }).toArray();

    for (const organization of organizations) {
      await organizationsCollection.updateOne(
        { _id: organization._id },
        { $set: { fact_address: organization.full_address } }
      );
    }

    console.log(`Миграция завершена: Обновлено организаций: ${organizations.length}`);

    return true;
  },
};
