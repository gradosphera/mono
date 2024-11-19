import type { BranchDomainInterface } from '../interfaces/branch-domain.interface';
import type { BankAccountDomainInterface } from '~/domain/common/interfaces/bank-account-domain.interface';
import type { SovietContract } from 'cooptypes';
import type { OrganizationDomainInterface } from '~/domain/common/interfaces/organization-domain.interface';

export class BranchDomainEntity implements BranchDomainInterface {
  public readonly braname: string;
  public readonly trustee: string;
  public readonly trusted: string[];

  public readonly type: 'coop' | 'ooo' | 'oao' | 'zao' | 'pao' | 'ao';
  public readonly short_name: string;
  public readonly full_name: string;
  public readonly represented_by: {
    first_name: string;
    last_name: string;
    middle_name: string;
    position: string;
    based_on: string;
  };
  public readonly country: string;
  public readonly city: string;
  public readonly full_address: string;
  public readonly fact_address: string;
  public readonly phone: string;
  public readonly email: string;
  public readonly details: {
    inn: string;
    ogrn: string;
    kpp: string;
  };
  public bank_account: BankAccountDomainInterface;

  constructor(blockchainData: SovietContract.Tables.Branches.IBranch, databaseData: OrganizationDomainInterface) {
    if (blockchainData.braname != databaseData.username)
      throw new Error(`Неверные данные для агрегата: username и braname кооперативного участка должны совпадать`);

    this.braname = blockchainData.braname;
    this.trustee = blockchainData.trustee;
    this.trusted = blockchainData.trusted;

    this.type = databaseData.type;
    this.short_name = databaseData.short_name;
    this.full_name = databaseData.full_name;
    this.represented_by = databaseData.represented_by;
    this.country = databaseData.country;
    this.city = databaseData.city;
    this.full_address = databaseData.full_address;
    this.fact_address = databaseData.fact_address;
    this.phone = databaseData.phone;
    this.email = databaseData.email;
    this.details = databaseData.details;
    this.bank_account = databaseData.bank_account;
  }
}
