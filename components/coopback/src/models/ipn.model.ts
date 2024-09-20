import mongoose, { Schema, Document, model } from 'mongoose';
import { toJSON, paginate } from './plugins/index';

export interface IIpn {
  provider: string;
  data: object;
}

const ipnSchema = new Schema<IIpn>(
  {
    provider: {
      type: String,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
ipnSchema.plugin(toJSON);
ipnSchema.plugin(paginate);

/**
 * @typedef Ipn
 */
const IPN = model<IIpn>('Ipn', ipnSchema);

export default IPN;
