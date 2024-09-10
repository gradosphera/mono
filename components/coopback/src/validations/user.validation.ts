import * as Joi from 'joi';
import { password } from './custom.validation';
import { IBankAccount } from './payment.validation';

export const IIndividualData = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  middle_name: Joi.string().allow('').required(),
  birthdate: Joi.string().required(),
  full_address: Joi.string().required(),
  phone: Joi.string().required(),
  email: Joi.string().email().required(),
});

const RepresentedBySchema = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  middle_name: Joi.string().allow('').required(),
  position: Joi.string().required(),
  based_on: Joi.string().required(),
});

const RussiaDetailsSchema = Joi.object({
  inn: Joi.string().required(),
  ogrn: Joi.string().required(),
});

export const IOrganizationData = Joi.object({
  type: Joi.string().valid('coop', 'ooo', 'oao', 'zao', 'pao', 'ao').required(),
  is_cooperative: Joi.boolean().required().default(false),
  short_name: Joi.string().required(),
  full_name: Joi.string().required(),
  represented_by: RepresentedBySchema.required(),
  country: Joi.string().valid('Russia', 'Other').required(),
  city: Joi.string().required(),
  full_address: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  details: RussiaDetailsSchema.required(),

  bank_account: IBankAccount.required(),
});

export const IEntrepreneurData = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  middle_name: Joi.string().allow('').required(),
  birthdate: Joi.string().required(),
  phone: Joi.string().required(),
  email: Joi.string().email().required(),
  country: Joi.string().valid('Russia', 'Other').required(),
  city: Joi.string().required(),
  full_address: Joi.string().required(),
  details: RussiaDetailsSchema.required(),
  bank_account: IBankAccount.required(),
});

export const ICreateUser = Joi.object({
  email: Joi.string().required().email(),
  role: Joi.string().required().valid('user'),
  public_key: Joi.string().optional(),
  username: Joi.string().required().length(12),
  referer: Joi.string().length(12).allow('').optional(),
  type: Joi.string().required().valid('individual', 'entrepreneur', 'organization'),
  individual_data: IIndividualData.optional(),
  organization_data: IOrganizationData.optional(),
  entrepreneur_data: IEntrepreneurData.optional(),
});

export const IAddUser = Joi.object({
  email: Joi.string().required().email(),
  referer: Joi.string().length(12).allow('').optional(),
  type: Joi.string().required().valid('individual', 'entrepreneur', 'organization'),
  individual_data: IIndividualData.optional(),
  organization_data: IOrganizationData.optional(),
  entrepreneur_data: IEntrepreneurData.optional(),

  spread_initial: Joi.boolean().required(),

  created_at: Joi.string().required(),
  initial: Joi.string().required(),
  minimum: Joi.string().required(),
});

export const RAddUser = Joi.object({
  body: IAddUser.required(),
});

// API

export const RCreateUser = Joi.object({
  body: ICreateUser.required(),
});

export const RGetUsers = Joi.object({
  query: Joi.object().keys({
    username: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
});

export const RGetUser = Joi.object({
  params: Joi.object().keys({
    username: Joi.string(),
  }),
});

export const RUpdateUser = Joi.object({
  params: Joi.object().keys({
    username: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
    })
    .min(1),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     IIndividualData:
 *       type: object
 *       properties:
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         middle_name:
 *           type: string
 *         birthdate:
 *           type: string
 *         full_address:
 *           type: string
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *       required:
 *         - first_name
 *         - last_name
 *         - middle_name
 *         - birthdate
 *         - full_address
 *         - phone
 *         - email
 *
 *     RepresentedBySchema:
 *       type: object
 *       properties:
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         middle_name:
 *           type: string
 *         position:
 *           type: string
 *         based_on:
 *           type: string
 *       required:
 *         - first_name
 *         - last_name
 *         - middle_name
 *         - position
 *         - based_on
 *
 *     RussiaDetailsSchema:
 *       type: object
 *       properties:
 *         inn:
 *           type: string
 *         ogrn:
 *           type: string
 *       required:
 *         - inn
 *         - ogrn
 *
 *     RussianBankDetailsSchema:
 *       type: object
 *       properties:
 *         bik:
 *           type: string
 *         inn:
 *           type: string
 *         corr:
 *           type: string
 *         kpp:
 *           type: string
 *       required:
 *         - bik
 *         - inn
 *         - corr
 *         - kpp
 *
 *     IBankAccount:
 *       type: object
 *       properties:
 *         currency:
 *           type: string
 *           enum: [RUB, Other]
 *         card_number:
 *           type: string
 *         bank_name:
 *           type: string
 *         account_number:
 *           type: string
 *         details:
 *           $ref: '#/components/schemas/RussianBankDetailsSchema'
 *       required:
 *         - currency
 *         - card_number
 *         - bank_name
 *         - account_number
 *         - details
 *
 *     IOrganizationData:
 *       type: object
 *       properties:
 *         is_cooperative:
 *           type: boolean
 *           default: false
 *         short_name:
 *           type: string
 *         full_name:
 *           type: string
 *         represented_by:
 *           $ref: '#/components/schemas/RepresentedBySchema'
 *         country:
 *           type: string
 *           enum: [Russia, Other]
 *         city:
 *           type: string
 *         full_address:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *         details:
 *           $ref: '#/components/schemas/RussiaDetailsSchema'
 *         bank_account:
 *           $ref: '#/components/schemas/IBankAccount'
 *       required:
 *         - is_cooperative
 *         - short_name
 *         - full_name
 *         - represented_by
 *         - country
 *         - city
 *         - full_address
 *         - email
 *         - phone
 *         - details
 *         - bank_account
 *
 *     IEntrepreneurData:
 *       type: object
 *       properties:
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         middle_name:
 *           type: string
 *         birthdate:
 *           type: string
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         country:
 *           type: string
 *           enum: [Russia, Other]
 *         city:
 *           type: string
 *         full_address:
 *           type: string
 *         details:
 *           $ref: '#/components/schemas/RussiaDetailsSchema'
 *         bank_account:
 *           $ref: '#/components/schemas/IBankAccount'
 *       required:
 *         - first_name
 *         - last_name
 *         - middle_name
 *         - birthdate
 *         - phone
 *         - email
 *         - country
 *         - city
 *         - full_address
 *         - details
 *         - bank_account
 *
 *     ICreateUser:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *         role:
 *           type: string
 *           enum: [user, admin]
 *         public_key:
 *           type: string
 *         username:
 *           type: string
 *         referer:
 *           type: string
 *           minLength: 12
 *           maxLength: 12
 *         type:
 *           type: string
 *           enum: [individual, entrepreneur, organization]
 *         individual_data:
 *           $ref: '#/components/schemas/IIndividualData'
 *         organization_data:
 *           $ref: '#/components/schemas/IOrganizationData'
 *         entrepreneur_data:
 *           $ref: '#/components/schemas/IEntrepreneurData'
 *       required:
 *         - email
 *         - password
 *         - role
 *         - public_key
 *         - username
 *         - type
 *
 *     IDocument:
 *       type: object
 *       properties:
 *         hash:
 *           type: string
 *         signature:
 *           type: string
 *         public_key:
 *           type: string
 *         meta:
 *           type: object
 *       required:
 *         - hash
 *         - signature
 *         - public_key
 *         - meta
 *
 *     IJoinCooperative:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *         document:
 *           $ref: '#/components/schemas/IDocument'
 *       required:
 *         - username
 *         - document
 */
