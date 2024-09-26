import { PublicKey, Signature } from '@wharfkit/antelope';
import type { IDocument, IJoinCooperative } from '../types';
import ApiError from '../utils/ApiError';
import { getUserByUsername } from './user.service';
import http from 'http-status';
import TempDocument, { tempdocType } from '../models/tempDocument.model';
import mongoose from 'mongoose';
import { userStatus, type IUser } from '../models/user.model';

const verifyDocumentSignature = (user: IUser, document: IDocument): void => {
  const { hash, public_key, signature } = document;
  const publicKeyObj = PublicKey.from(public_key);
  const signatureObj = Signature.from(signature);

  const verified: boolean = signatureObj.verifyDigest(hash, publicKeyObj);
  if (!verified) {
    throw new ApiError(http.INTERNAL_SERVER_ERROR, 'Invalid signature');
  }

  if (user.public_key !== document.public_key) throw new ApiError(http.BAD_REQUEST, 'Public keys are mismatched');
};

/**
 * Join a Cooperative
 *
 */
export const joinCooperative = async (data: IJoinCooperative): Promise<void> => {
  const user = await getUserByUsername(data.username);

  if (!user) {
    throw new ApiError(http.NOT_FOUND, 'Пользователь не найден');
  }

  if (user.status !== userStatus['1_Created'] && user.status !== userStatus['2_Joined']) {
    throw new ApiError(http.NOT_FOUND, 'Пользователь уже вступил в кооператив');
  }

  verifyDocumentSignature(user, data.statement);
  verifyDocumentSignature(user, data.wallet_agreement);
  verifyDocumentSignature(user, data.user_agreement);
  verifyDocumentSignature(user, data.privacy_agreement);
  verifyDocumentSignature(user, data.signature_agreement);

  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    await TempDocument.findOneAndUpdate(
      { username: user.username, type: tempdocType.JoinStatement },
      { $set: { document: data.statement } },
      { upsert: true, new: true, session }
    );

    await TempDocument.findOneAndUpdate(
      { username: user.username, type: tempdocType.WalletAgreement },
      { $set: { document: data.wallet_agreement } },
      { upsert: true, new: true, session }
    );

    await TempDocument.findOneAndUpdate(
      { username: user.username, type: tempdocType.PrivacyAgreement },
      { $set: { document: data.privacy_agreement } },
      { upsert: true, new: true, session }
    );

    await TempDocument.findOneAndUpdate(
      { username: user.username, type: tempdocType.SignatureAgreement },
      { $set: { document: data.signature_agreement } },
      { upsert: true, new: true, session }
    );

    await TempDocument.findOneAndUpdate(
      { username: user.username, type: tempdocType.UserAgreement },
      { $set: { document: data.user_agreement } },
      { upsert: true, new: true, session }
    );

    user.status = userStatus['2_Joined'];
    await user.save({ session });
  });

  session.endSession();
};
