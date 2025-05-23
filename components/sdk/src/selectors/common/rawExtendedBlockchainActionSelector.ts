import { rawBlockchainActionSelector } from '.';
import { rawUserCertificateUnionSelector } from './userCertificateUnionSelector';

/**
 * Расширенные действия в блокчейне, общие для Act / Decision / Statement.
 */

export const rawExtendedBlockchainActionSelector = {
  ...rawBlockchainActionSelector,
  actor_certificate: rawUserCertificateUnionSelector,
};
