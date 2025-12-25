import mongoose, { Schema, model, type Model } from 'mongoose';
import { toJSON, paginate } from './plugins/index';
import AutoIncrementFactory from 'mongoose-sequence';
import { type IOrder, orderStatus } from '../types/order.types';
import crypto from 'crypto';

const AutoIncrement = AutoIncrementFactory(mongoose);

export function generateOrderSecret(length = 16): string {
  return crypto.randomBytes(length).toString('hex'); // Генерирует случайный секрет в виде hex-строки
}

interface IOrderModel extends Model<IOrder> {
  isEmailTaken(email: string, excludeUsername?: mongoose.Types.ObjectId): Promise<boolean>;
  paginate(filter, options): any;
}

const orderSchema = new Schema<IOrder, IOrderModel>(
  {
    // _id: {
    //   type: String,
    //   default: () => uuidv4(), // Использование UUID для _id
    // },
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
      default: () => generateOrderSecret(48), // Генерация секрета по умолчанию
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
