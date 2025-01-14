import mongoose, { Schema } from 'mongoose';
import { paginate, toJSON } from './plugins';

export enum tempdocType {
  JoinStatement = 'joinStatement',
  WalletAgreement = 'walletAgreement',
  SignatureAgreement = 'signatureAgreement',
  PrivacyAgreement = 'privacyAgreement',
  UserAgreement = 'userAgreement',
}

export interface ITempDocument {
  username: string;
  type: tempdocType;
  document: {
    hash: string;
    meta: object;
    public_key: string;
    signature: string;
  };
}

const MonoSchema = new Schema<ITempDocument>({
  username: { type: String, required: true },
  type: { type: String, required: true, enum: ['joinStatement', 'walletAgreement'] },
  document: {
    public_key: {
      type: String,
      default: '',
    },
    signature: {
      type: String,
      default: '',
    },
    meta: {
      type: Object,
      default: {},
    },
    hash: {
      type: String,
      default: '',
    },
  },
});

MonoSchema.plugin(toJSON);
MonoSchema.plugin(paginate);

const TempDocument = mongoose.model<ITempDocument>('TempDocument', MonoSchema);

export default TempDocument;
