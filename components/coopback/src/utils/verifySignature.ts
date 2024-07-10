import eosjsecc from 'eosjs-ecc';
import { DocumentInterface } from '../types';
const { verify, sha256 } = eosjsecc;

async function verifySignature(doc: DocumentInterface, hash) {
  let isValidSignature = false;
  let isValidHash = hash === doc.hash;
  let reason = "";

  try {
    isValidSignature = await verify(doc.signature, doc.hash, doc.public_key);
  } catch (e) {
    reason = "wrong signature";
  }

  if (!isValidHash) {
    reason = "hash is not equal doc hash";
  }

  return {
    is_valid_signature: isValidSignature,
    is_valid_hash: isValidHash,
    reason: reason,
    is_valid: isValidSignature && isValidHash
  };
}
