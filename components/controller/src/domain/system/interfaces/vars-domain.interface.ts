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
  statute_link: string;
  wallet_agreement?: AgreementNumberDomainInterface | null;
  privacy_agreement?: AgreementNumberDomainInterface | null;
  signature_agreement?: AgreementNumberDomainInterface | null;
  user_agreement?: AgreementNumberDomainInterface | null;
  participant_application?: AgreementNumberDomainInterface | null;
  coopenomics_agreement?: AgreementNumberDomainInterface | null;
  [x: string]: unknown; //TODO better delete it after delete in generator
}
