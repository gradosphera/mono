import type { IndividualDomainInterface } from '~/domain/common/interfaces/individual-domain.interface';
import type { PassportDataDomainInterface } from '~/domain/common/interfaces/passport-data-domain.interface';

export class IndividualDomainEntity implements IndividualDomainInterface {
  public readonly username: string;
  public readonly first_name: string;
  public readonly last_name: string;
  public readonly middle_name: string;
  public readonly birthdate: string;
  public readonly full_address: string;
  public readonly phone: string;
  public readonly email: string;
  public passport?: PassportDataDomainInterface;

  constructor(data: IndividualDomainInterface) {
    this.username = data.username;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.middle_name = data.middle_name;
    this.birthdate = data.birthdate;
    this.full_address = data.full_address;
    this.phone = data.phone;
    this.email = data.email;
    this.passport = data.passport;
  }

  updatePassport(passport: PassportDataDomainInterface): void {
    this.passport = { ...this.passport, ...passport };
  }

  validatePassport(): boolean {
    if (!this.passport) {
      throw new Error('Passport data is missing');
    }
    const { series, number, issued_by, issued_at, code } = this.passport;
    if (!series || !number || !issued_by || !issued_at || !code) {
      throw new Error('Invalid passport details');
    }
    return true;
  }

  getFullName(): string {
    const { first_name, last_name, middle_name } = this;
    return `${last_name} ${first_name} ${middle_name}`;
  }
}
