import mongoose, { Schema, Document, model, type Model } from 'mongoose';
import { toJSON, paginate } from './plugins/index';
import AutoIncrementFactory from 'mongoose-sequence';
import { generateOrderSecret } from '../services/order.service';

const AutoIncrement = AutoIncrementFactory(mongoose);

export interface IOrder {
  id?: string;
  order_id?: number;
  secret: string;
  creator: string;
  status: 'pending' | 'paid' | 'completed' | 'failed' | 'expired';
  type: string;
  provider: string;
  message?: string;
  username: string;
  quantity: string;
  expired_at?: Date;
}

interface IOrderModel extends Model<IOrder> {
  isEmailTaken(email: string, excludeUsername?: mongoose.Types.ObjectId): Promise<boolean>;
  paginate(filter, options): any;
}

const orderSchema = new Schema<IOrder, IOrderModel>(
  {
    order_id: {
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
      enum: ['pending', 'paid', 'completed', 'failed', 'expired'],
      default: 'pending',
    },
    message: {
      type: String,
      required: false,
    },
    type: {
      type: String,
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
    expired_at: {
      type: Date,
      default: () => {
        const now = new Date();
        now.setDate(now.getDate() + 1); // Увеличиваем на одни сутки
        return now;
      },
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
orderSchema.plugin(toJSON);
orderSchema.plugin(paginate);
// Добавляем автоинкремент для поля order_id
orderSchema.plugin(AutoIncrement, { inc_field: 'order_id' });

/**
 * @typedef Order
 */
const Order = model<IOrder, IOrderModel>('Order', orderSchema);

export default Order;
