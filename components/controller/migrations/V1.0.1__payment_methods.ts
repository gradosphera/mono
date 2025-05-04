import mongoose from 'mongoose';

export default {
  name: 'Преобразование числовых method_id в строковые',

  async up() {
    console.log('Выполнение миграции: Преобразование числовых method_id в строковые');

    const paymentMethodsCollection = mongoose.connection.collection('paymentMethods');

    // Находим все записи с числовым method_id
    const paymentMethods = await paymentMethodsCollection.find({ method_id: { $type: 'int' } }).toArray();

    for (const paymentMethod of paymentMethods) {
      await paymentMethodsCollection.updateOne(
        { _id: paymentMethod._id },
        { $set: { method_id: String(paymentMethod.method_id) } }
      );
    }

    console.log(`Миграция завершена: Обновлено платежных методов: ${paymentMethods.length}`);

    return true;
  },
};
