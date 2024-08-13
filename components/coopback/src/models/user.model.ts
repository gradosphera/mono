import mongoose, { Schema, model, Model } from 'mongoose';
import validator from 'validator/index';
import bcryptjs from 'bcryptjs';
import { toJSON, paginate } from './plugins/index';
import { roles } from '../config/roles';
import { generator } from '../services/document.service';
import { Cooperative } from 'cooptypes';

const { isEmail } = validator;
const { compare, hash } = bcryptjs;

export interface IUser {
  username: string;
  status: 'created' | 'joined' | 'payed' | 'registered' | 'active' | 'failed' | 'blocked';
  message: string;
  is_registered: boolean;
  has_account: boolean;
  type: 'individual' | 'entrepreneur' | 'organization';
  public_key: string;
  referer: string;
  email: string;
  role: string;
  is_email_verified: boolean;
  statement: {
    hash: string;
    meta: object;
    public_key: string;
    signature: string;
  };
  private_data:
    | Cooperative.Users.IIndividualData
    | Cooperative.Users.IEntrepreneurData
    | Cooperative.Users.IOrganizationData
    | null;
  getPrivateData(): Promise<
    Cooperative.Users.IIndividualData | Cooperative.Users.IEntrepreneurData | Cooperative.Users.IOrganizationData | null
  >;
}

interface IUserModel extends Model<IUser> {
  isEmailTaken(email: string, excludeUsername?: mongoose.Types.ObjectId): Promise<boolean>;
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
      enum: ['created', 'joined', 'payed', 'registered', 'active', 'failed', 'blocked'],
      default: 'created',
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
      enum: ['individual', 'entrepreneur', 'organization', 'service'],
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
      required: true,
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
    statement: {
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

userSchema.statics.isEmailTaken = async function (email) {
  const user = await this.findOne({ email }); //, username: { $ne: excludeUsername }

  return !!user;
};

userSchema.methods.getPrivateData = async function (): Promise<
  Cooperative.Users.IIndividualData | Cooperative.Users.IEntrepreneurData | Cooperative.Users.IOrganizationData | null
> {
  const result = (await generator.get(this.type, { username: this.username })) as
    | Cooperative.Users.IIndividualData
    | Cooperative.Users.IEntrepreneurData
    | Cooperative.Users.IOrganizationData
    | null;

  return result;
};

const User = model<IUser, IUserModel>('User', userSchema);

export default User;

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *         status:
 *           type: string
 *           enum: ['created', 'joined', 'payed', 'registered', 'active', 'blocked']
 *         is_registered:
 *           type: boolean
 *         type:
 *           type: string
 *           enum: ['individual', 'entrepreneur', 'organization']
 *         public_key:
 *           type: string
 *         referer:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           type: string
 *         is_email_verified:
 *           type: boolean
 *         private_data:
 *           oneOf:
 *             - $ref: '#/components/schemas/IEntrepreneurData'
 *             - $ref: '#/components/schemas/IIndividualData'
 *             - $ref: '#/components/schemas/IOrganizationData'
 *           nullable: true
 */
