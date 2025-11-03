import type { Document } from 'mongoose';

export const tokenTypes = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  RESET_KEY: 'resetPassword',
  VERIFY_EMAIL: 'verifyEmail',
  INVITE: 'invite',
} as const;

export type TokenType = (typeof tokenTypes)[keyof typeof tokenTypes];

export interface IToken extends Document {
  token: string;
  user: string;
  type: TokenType;
  expires: Date;
  blacklisted: boolean;
}
