import mongoose, { Schema } from 'mongoose';
import { paginate, toJSON } from './plugins';
import { SystemStatusInterface } from '../types';

export interface IMono {
  coopname: string;
  status: SystemStatusInterface;
  install_code?: string;
  install_code_expires_at?: Date;
  init_by_server?: boolean;
}

const Status = {
  Install: 'install',
  Initialized: 'initialized',
  Active: 'active',
  Maintenance: 'maintenance',
};

const MonoSchema = new Schema<IMono>({
  coopname: { type: String, required: true },
  status: { type: String, required: true, enum: Object.values(Status) },
  install_code: { type: String },
  install_code_expires_at: { type: Date },
  init_by_server: { type: Boolean, default: false },
});

MonoSchema.plugin(toJSON);
MonoSchema.plugin(paginate);

const MonoModel = mongoose.model<IMono>('Mono', MonoSchema);

export default MonoModel;
