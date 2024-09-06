import { PublicKey, Signature } from '@wharfkit/antelope';
import type { IJoinCooperative } from '../types';
import ApiError from '../utils/ApiError';
import { getUserByUsername } from './user.service';
import http from 'http-status';
import TempDocument, { tempdocType } from '../models/tempDocument.model';
import mongoose from 'mongoose';
import { userStatus } from '../models/user.model';

/**
 * Join a Cooperative
 *
 */
export const joinCooperative = async (data: IJoinCooperative): Promise<void> => {
  const user = await getUserByUsername(data.username);

  if (!user) {
    throw new ApiError(http.NOT_FOUND, 'Пользователь не найден');
  }

  const hash = data.statement.hash;
  const public_key = PublicKey.from(data.statement.public_key);
  const signature = Signature.from(data.statement.signature);

  const verified: boolean = signature.verifyDigest(hash, public_key);

  if (!verified) {
    throw new ApiError(http.INTERNAL_SERVER_ERROR, 'Invalid signature');
  }

  if (user.public_key !== data.statement.public_key) throw new ApiError(http.BAD_REQUEST, 'Public keys are mismatched');

  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    await TempDocument.findOneAndUpdate(
      { username: user.username, type: tempdocType.JoinStatement },
      { $set: { document: data.statement } },
      { upsert: true, new: true, session }
    );

    user.status = userStatus['2_Joined'];
    await user.save({ session });
  });

  session.endSession();
};
