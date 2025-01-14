import type { AgreementNumberDomainInterface } from '~/domain/agreement/interfaces/agreement-number.interface';

export interface VarsDomainInterface {
  coopname: string;
  full_abbr: string;
  full_abbr_genitive: string;
  full_abbr_dative: string;
  short_abbr: string;
  website: string;
  name: string;
  confidential_link: string;
  confidential_email: string;
  contact_email: string;
  passport_request: 'yes' | 'no';
  wallet_agreement: AgreementNumberDomainInterface;
  privacy_agreement: AgreementNumberDomainInterface;
  signature_agreement: AgreementNumberDomainInterface;
  user_agreement: AgreementNumberDomainInterface;
  participant_application: AgreementNumberDomainInterface;
  coopenomics_agreement?: AgreementNumberDomainInterface | null;
  [x: string]: unknown; //TODO better delete it after delete in generator
}
