import moment from 'moment';
import config from '../../src/config/config';
import { tokenTypes } from '../../src/config/tokens';
import * as tokenService from '../../src/services/token.service';
import { userOne, userTwo, admin } from './user.fixture';

export const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
export const userOneAccessToken = tokenService.generateToken(userOne._id, accessTokenExpires, tokenTypes.ACCESS);
export const userTwoAccessToken = tokenService.generateToken(userTwo._id, accessTokenExpires, tokenTypes.ACCESS);

export const adminAccessToken = tokenService.generateToken(admin._id, accessTokenExpires, tokenTypes.ACCESS);
