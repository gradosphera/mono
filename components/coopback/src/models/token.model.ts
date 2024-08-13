import mongoose, { Document } from 'mongoose';
import { toJSON } from './plugins/index';
import { tokenTypes } from '../config/tokens';

const { Schema, model } = mongoose;

interface IToken extends Document {
  token: string;
  user: string;
  type: string;
  expires: Date;
  blacklisted: boolean;
}

const tokenSchema = new Schema<IToken>(
  {
    token: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [tokenTypes.REFRESH, tokenTypes.RESET_PASSWORD, tokenTypes.VERIFY_EMAIL, tokenTypes.INVITE],
      required: true,
    },
    expires: {
      type: Date,
      required: true,
    },
    blacklisted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// add plugin that converts mongoose to json
tokenSchema.plugin(toJSON);

/**
 * @typedef Token
 */
const Token = model<IToken>('Token', tokenSchema);

export default Token;
