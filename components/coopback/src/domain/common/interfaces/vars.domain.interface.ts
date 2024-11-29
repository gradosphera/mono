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
  wallet_agreement: {
    protocol_number: string;
    protocol_day_month_year: string;
  };
  signature_agreement: {
    protocol_number: string;
    protocol_day_month_year: string;
  };
  privacy_agreement: {
    protocol_number: string;
    protocol_day_month_year: string;
  };
  user_agreement: {
    protocol_number: string;
    protocol_day_month_year: string;
  };
  participant_application: {
    protocol_number: string;
    protocol_day_month_year: string;
  };
  coopenomics_agreement?: {
    protocol_number: string;
    protocol_day_month_year: string;
  };
}
