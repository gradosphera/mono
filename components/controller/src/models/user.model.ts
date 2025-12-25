import { Schema, model, Model } from 'mongoose';
import validator from 'validator/index';
import { toJSON, paginate } from './plugins/index';
import { roles } from '../config/roles';
import { userStatus, type IUser } from '../types/user.types';

const { isEmail } = validator;

interface IUserModel extends Model<IUser> {
  isEmailTaken(email: string, excludeUsername?: string): Promise<boolean>;
  paginate(filter, options): any;
}

const userSchema = new Schema<IUser, IUserModel>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(userStatus),
      default: userStatus['1_Created'],
    },
    message: {
      type: String,
      required: false,
    },
    is_registered: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      required: true,
      enum: ['individual', 'entrepreneur', 'organization'],
    },
    public_key: {
      type: String,
      default: '',
    },
    referer: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      required: false,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    role: {
      type: String,
      enum: roles,
      default: 'user',
    },
    is_email_verified: {
      type: Boolean,
      default: false,
    },
    has_account: {
      type: Boolean,
      default: false,
    },
    initial_order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
    subscriber_id: {
      type: String,
      default: '',
      unique: true,
      sparse: true, // Позволяет множественные пустые значения, но уникальные непустые
    },
    subscriber_hash: {
      type: String,
      default: '',
    },
  },
  {
    minimize: false,
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

userSchema.statics.isEmailTaken = async function (email: string, excludeUsername?: string) {
  const user = await this.findOne({ email, username: { $ne: excludeUsername } });

  return !!user;
};

const User = model<IUser, IUserModel>('User', userSchema);

export default User;
