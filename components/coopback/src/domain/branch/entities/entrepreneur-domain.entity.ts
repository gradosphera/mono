import type { EntrepreneurDomainInterface } from '~/domain/common/interfaces/entrepreneur-domain.interface';
import type { BankAccountDomainInterface } from '~/domain/common/interfaces/bank-account-domain.interface';
import type { EntrepreneurDetailsDomainInterface } from '~/domain/common/interfaces/entrepreneur-details-domain.interface';

export class EntrepreneurDomainEntity implements EntrepreneurDomainInterface {
  public readonly username: string;
  public readonly first_name: string;
  public readonly last_name: string;
  public readonly middle_name: string;
  public readonly birthdate: string;
  public readonly phone: string;
  public readonly email: string;
  public readonly country: string;
  public readonly city: string;
  public readonly full_address: string;
  public readonly details: EntrepreneurDetailsDomainInterface;
  public bank_account: BankAccountDomainInterface;

  constructor(data: EntrepreneurDomainInterface) {
    this.username = data.username;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.middle_name = data.middle_name;
    this.birthdate = data.birthdate;
    this.phone = data.phone;
    this.email = data.email;
    this.country = data.country;
    this.city = data.city;
    this.full_address = data.full_address;
    this.details = data.details;
    this.bank_account = data.bank_account;
  }

  updateBankAccount(bankAccount: BankAccountDomainInterface): void {
    this.bank_account = { ...this.bank_account, ...bankAccount };
  }

  validateDetails(): boolean {
    if (!this.details.inn || !this.details.ogrn) {
      throw new Error('Invalid entrepreneur details');
    }
    return true;
  }

  getFullName(): string {
    const { first_name, last_name, middle_name } = this;
    return `${last_name} ${first_name} ${middle_name}`;
  }
}
