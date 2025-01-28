import type { OrganizationDomainInterface } from '~/domain/common/interfaces/organization-domain.interface';

export class OrganizationDomainEntity implements OrganizationDomainInterface {
  public readonly username: string;
  public readonly type: string;
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

  constructor(data: OrganizationDomainInterface) {
    this.username = data.username;
    this.type = data.type;
    this.short_name = data.short_name;
    this.full_name = data.full_name;
    this.represented_by = data.represented_by;
    this.country = data.country;
    this.city = data.city;
    this.full_address = data.full_address;
    this.fact_address = data.fact_address;
    this.phone = data.phone;
    this.email = data.email;
    this.details = data.details;
  }

  validateDetails(): boolean {
    if (!this.details.inn || !this.details.ogrn || !this.details.kpp) {
      throw new Error('Invalid organization details');
    }
    return true;
  }

  getRepresentative(): string {
    const { first_name, last_name, middle_name, position } = this.represented_by;
    return `${last_name} ${first_name} ${middle_name} (${position})`;
  }
}
