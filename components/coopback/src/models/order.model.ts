import mongoose, { Schema, Document, model, type Model } from 'mongoose';
import { toJSON, paginate } from './plugins/index';
import AutoIncrementFactory from 'mongoose-sequence';
import { generateOrderSecret } from '../services/order.service';
import { type IOrder, orderStatus } from '../types/order.types';

const AutoIncrement = AutoIncrementFactory(mongoose);

interface IOrderModel extends Model<IOrder> {
  isEmailTaken(email: string, excludeUsername?: mongoose.Types.ObjectId): Promise<boolean>;
  paginate(filter, options): any;
}

const orderSchema = new Schema<IOrder, IOrderModel>(
  {
    order_num: {
      type: Number,
      required: false,
      unique: true,
    },
    creator: {
      type: String,
      required: true,
    },
    secret: {
      type: String,
      required: true,
      private: true,
      default: () => generateOrderSecret(16), // Генерация секрета по умолчанию
    },
    status: {
      type: String,
      enum: Object.values(orderStatus),
      default: orderStatus.pending,
    },
    message: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      enum: ['registration', 'deposit'],
      required: true,
    },
    provider: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    quantity: {
      type: String,
      required: true,
    },
    symbol: {
      type: String,
      required: true,
    },
    details: {
      type: {
        data: { type: Schema.Types.Mixed, required: true },
        amount_plus_fee: { type: String, required: true },
        amount_without_fee: { type: String, required: true },
        fee_amount: { type: String, required: true },
        fee_percent: { type: Number, required: true },
        fact_fee_percent: { type: Number, required: true },
        tolerance_percent: { type: Number, required: true },
      },
      required: false, // Поле может быть не обязательным
    },
    expired_at: {
      type: Date,
      default: () => {
        const now = new Date();
        now.setDate(now.getDate() + 1); // Увеличиваем на одни сутки
        return now;
      },
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Связь с пользователем
  },
  {
    timestamps: true,
  }
);

// Хук после find для автоматического добавления private_data
orderSchema.post('find', async function (docs) {
  for (const doc of docs) {
    // Наполняем пользователя с помощью populate
    await doc.populate('user');
    // Если пользователь найден, вызываем асинхронный метод getPrivateData
    if (doc.user) {
      doc.user.private_data = await doc.user.getPrivateData();
    }

    // Проверяем поле expired_at и обновляем статус
    if (doc.status != orderStatus.expired && doc.expired_at && new Date() > doc.expired_at) {
      doc.status = orderStatus.expired;
      await doc.save(); // Сохраняем изменения в документе
    }
  }
});

// add plugin that converts mongoose to json
orderSchema.plugin(toJSON);
orderSchema.plugin(paginate);
// Добавляем автоинкремент для поля order_num
orderSchema.plugin(AutoIncrement, { inc_field: 'order_num' });

/**
 * @typedef Order
 */
const Order = model<IOrder, IOrderModel>('Order', orderSchema);

export default Order;
