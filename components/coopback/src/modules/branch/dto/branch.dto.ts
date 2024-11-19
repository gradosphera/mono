import { ObjectType, Field } from '@nestjs/graphql';
import { RepresentedByGraphQLDTO } from '~/modules/common/dto/represented-by.dto';
import { DetailsGraphQLDTO } from '~/modules/common/dto/details.dto';
import { BankAccountGraphQLDTO } from '~/modules/common/dto/bank-account.dto';
import type { BranchDomainInterface } from '~/domain/branch/interfaces/branch-domain.interface';
import type { BankAccountDomainInterface } from '~/domain/common/interfaces/bank-account-domain.interface';
import type { BranchDomainEntity } from '~/domain/branch/entities/branch-domain.entity';

@ObjectType('Branch')
export class BranchGraphQLDTO implements BranchDomainInterface {
  @Field(() => String, { description: 'Уникальное имя кооперативного участка' })
  public readonly braname: string;

  @Field(() => String, { description: 'Аккаунт уполномоченного' })
  public readonly trustee: string;

  @Field(() => [String], { description: 'Доверенные аккаунты' })
  public readonly trusted: string[];

  @Field(() => String, { description: 'Тип организации' })
  public readonly type: 'coop' | 'ooo' | 'oao' | 'zao' | 'pao' | 'ao';

  @Field(() => String, { description: 'Краткое название организации' })
  public readonly short_name: string;

  @Field(() => String, { description: 'Полное название организации' })
  public readonly full_name: string;

  @Field(() => RepresentedByGraphQLDTO, { description: 'Представитель организации' })
  public readonly represented_by: RepresentedByGraphQLDTO;

  @Field(() => String, { description: 'Страна' })
  public readonly country: string;

  @Field(() => String, { description: 'Город' })
  public readonly city: string;

  @Field(() => String, { description: 'Полный адрес' })
  public readonly full_address: string;

  @Field(() => String, { description: 'Фактический адрес' })
  public readonly fact_address: string;

  @Field(() => String, { description: 'Телефон' })
  public readonly phone: string;

  @Field(() => String, { description: 'Email' })
  public readonly email: string;

  @Field(() => DetailsGraphQLDTO, { description: 'Детали организации' })
  public readonly details: DetailsGraphQLDTO;

  @Field(() => BankAccountGraphQLDTO, { description: 'Банковский счет' })
  public readonly bank_account: BankAccountDomainInterface;

  constructor(entity: BranchDomainEntity) {
    this.braname = entity.braname;
    this.trustee = entity.trustee;
    this.trusted = entity.trusted;
    this.type = entity.type;
    this.short_name = entity.short_name;
    this.full_name = entity.full_name;
    this.represented_by = new RepresentedByGraphQLDTO(entity.represented_by);
    this.country = entity.country;
    this.city = entity.city;
    this.full_address = entity.full_address;
    this.fact_address = entity.fact_address;
    this.phone = entity.phone;
    this.email = entity.email;
    this.details = new DetailsGraphQLDTO(entity.details);
    this.bank_account = new BankAccountGraphQLDTO(entity.bank_account);
  }
}
