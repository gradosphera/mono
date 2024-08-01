import { getModelForClass, prop, plugin } from '@typegoose/typegoose';
import { paginate, toJSON } from './plugins';

enum Status {
  Install = 'install',
  Active = 'active',
  Maintenance = 'maintenance',
}

class Mono {
  @prop({ required: true })
  public coopname!: string;

  @prop({ required: true, enum: Status })
  public status!: Status;
}

const MonoModel = getModelForClass(Mono);

plugin(MonoModel, toJSON);
plugin(MonoModel, paginate);

export default MonoModel;
