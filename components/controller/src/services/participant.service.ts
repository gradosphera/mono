import { PublicKey, Signature } from '@wharfkit/antelope';
import ApiError from '../utils/ApiError';
import { getUserByUsername } from './user.service';
import http from 'http-status';
import TempDocument, { tempdocType } from '../models/tempDocument.model';
import { userStatus, type IUser } from '../types/user.types';
import type { RegisterParticipantDomainInterface } from '~/domain/participant/interfaces/register-participant-domain.interface';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

const verifyDocumentSignature = (user: IUser, document: ISignedDocumentDomainInterface): void => {
  const { hash, signatures } = document;
  const public_key = signatures[0].public_key;
  const signature = signatures[0].signature;

  const publicKeyObj = PublicKey.from(public_key);
  const signatureObj = Signature.from(signature);

  const verified: boolean = signatureObj.verifyDigest(hash, publicKeyObj);
  if (!verified) {
    throw new ApiError(http.INTERNAL_SERVER_ERROR, 'Invalid signature');
  }

  if (user.public_key !== public_key) throw new ApiError(http.BAD_REQUEST, 'Public keys are mismatched');
};

/**
 * Join a Cooperative
 *
 */
export const joinCooperative = async (data: RegisterParticipantDomainInterface): Promise<void> => {
  const user = await getUserByUsername(data.username);

  if (!user) {
    throw new ApiError(http.NOT_FOUND, 'Пользователь не найден');
  }

  if (user.status !== userStatus['1_Created'] && user.status !== userStatus['2_Joined']) {
    throw new ApiError(http.NOT_FOUND, 'Пользователь уже вступил в кооператив');
  }
  //TODO -> statement1 -> statement and fix verify
  verifyDocumentSignature(user, data.statement);
  verifyDocumentSignature(user, data.wallet_agreement);
  verifyDocumentSignature(user, data.user_agreement);
  verifyDocumentSignature(user, data.privacy_agreement);
  verifyDocumentSignature(user, data.signature_agreement);

  await TempDocument.findOneAndUpdate(
    { username: user.username, type: tempdocType.JoinStatement },
    { $set: { document: data.statement } },
    { upsert: true, new: true }
  );

  await TempDocument.findOneAndUpdate(
    { username: user.username, type: tempdocType.WalletAgreement },
    { $set: { document: data.wallet_agreement } },
    { upsert: true, new: true }
  );

  await TempDocument.findOneAndUpdate(
    { username: user.username, type: tempdocType.PrivacyAgreement },
    { $set: { document: data.privacy_agreement } },
    { upsert: true, new: true }
  );

  await TempDocument.findOneAndUpdate(
    { username: user.username, type: tempdocType.SignatureAgreement },
    { $set: { document: data.signature_agreement } },
    { upsert: true, new: true }
  );

  await TempDocument.findOneAndUpdate(
    { username: user.username, type: tempdocType.UserAgreement },
    { $set: { document: data.user_agreement } },
    { upsert: true, new: true }
  );

  user.status = userStatus['2_Joined'];
  await user.save();
};
