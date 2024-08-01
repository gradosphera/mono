import mongoose, { Schema } from 'mongoose';
import { paginate, toJSON } from './plugins';

const Status = {
  Install: 'install',
  Active: 'active',
  Maintenance: 'maintenance',
};

const MonoSchema = new Schema({
  coopname: { type: String, required: true },
  status: { type: String, required: true, enum: Object.values(Status) },
});

MonoSchema.plugin(toJSON);
MonoSchema.plugin(paginate);

const MonoModel = mongoose.model('Mono', MonoSchema);

export default MonoModel;
