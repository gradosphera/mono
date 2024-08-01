import mongoose, { Schema, Document, model } from 'mongoose';
import { toJSON, paginate } from './plugins/index';

interface IOrder extends Document {
  creator: string;
  type: string;
  data: {
    username: string;
    provider: string;
    quantity: string;
  };
  order_id?: number;
  payed?: boolean;
  delivered?: boolean;
  error?: object;
  expired_at?: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    creator: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    data: {
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
    },
    order_id: {
      type: Number,
      required: false,
    },
    payed: {
      type: Boolean,
      required: false,
      default: false,
    },
    delivered: {
      type: Boolean,
      required: false,
      default: false,
    },
    error: {
      type: Object,
      required: false,
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

/**
 * @typedef Order
 */
const Order = model<IOrder>('Order', orderSchema);

export default Order;
