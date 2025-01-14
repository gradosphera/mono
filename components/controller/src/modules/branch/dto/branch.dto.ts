import { ObjectType, Field } from '@nestjs/graphql';
import { RepresentedByDTO } from '~/modules/common/dto/represented-by.dto';
import type { BranchDomainInterface } from '~/domain/branch/interfaces/branch-domain.interface';
import type { BranchDomainEntity } from '~/domain/branch/entities/branch-domain.entity';
import { OrganizationDetailsDTO } from '~/modules/common/dto/organization-details.dto';
import { IndividualDTO } from '~/modules/common/dto/individual.dto';
import { IsArray, IsJSON, IsString } from 'class-validator';
import { BankPaymentMethodDTO } from '~/modules/payment-method/dto/bank-payment-method.dto';
import { AuthRoles } from '~/modules/auth/decorators/auth.decorator';
import { UseGuards } from '@nestjs/common';
import { GqlJwtAuthGuard } from '~/modules/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/modules/auth/guards/roles.guard';

@ObjectType('Branch')
export class BranchDTO implements BranchDomainInterface {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  @IsString()
  public readonly coopname: string;

  @Field(() => String, { description: 'Уникальное имя кооперативного участка' })
  @IsString()
  public readonly braname: string;

  @Field(() => IndividualDTO, { description: 'Председатель кооперативного участка' })
  @AuthRoles(['chairman', 'member'])
  @IsString()
  public readonly trustee: IndividualDTO;

  @Field(() => [IndividualDTO], { description: 'Доверенные аккаунты' })
  @AuthRoles(['chairman', 'member'])
  @IsArray()
  public readonly trusted: IndividualDTO[];

  @Field(() => String, { description: 'Тип организации' })
  @IsString()
  public readonly type: 'coop' | 'ooo' | 'oao' | 'zao' | 'pao' | 'ao';

  @Field(() => String, { description: 'Краткое название организации' })
  @IsString()
  public readonly short_name: string;

  @Field(() => String, { description: 'Полное название организации' })
  @IsString()
  public readonly full_name: string;

  @Field(() => RepresentedByDTO, { description: 'Представитель организации' })
  @IsJSON()
  public readonly represented_by: RepresentedByDTO;

  @Field(() => String, { description: 'Страна' })
  @IsString()
  public readonly country: string;

  @Field(() => String, { description: 'Город' })
  @IsString()
  public readonly city: string;

  @Field(() => String, { description: 'Полный адрес' })
  @IsString()
  public readonly full_address: string;

  @Field(() => String, { description: 'Фактический адрес' })
  @IsString()
  public readonly fact_address: string;

  @Field(() => String, { description: 'Телефон' })
  @IsString()
  public readonly phone: string;

  @Field(() => String, { description: 'Email' })
  @IsString()
  public readonly email: string;

  @Field(() => BankPaymentMethodDTO, { description: 'Банковский счёт' })
  @IsJSON()
  public readonly bank_account: BankPaymentMethodDTO;

  @Field(() => OrganizationDetailsDTO, { description: 'Детали организации' })
  @IsJSON()
  public readonly details: OrganizationDetailsDTO;

  constructor(entity: BranchDomainEntity) {
    this.coopname = entity.coopname;
    this.braname = entity.braname;
    this.trustee = new IndividualDTO(entity.trustee);
    this.trusted = entity.trusted.map((trustedEntity) => new IndividualDTO(trustedEntity));
    this.type = entity.type;
    this.short_name = entity.short_name;
    this.full_name = entity.full_name;
    this.represented_by = new RepresentedByDTO(entity.represented_by);
    this.country = entity.country;
    this.city = entity.city;
    this.full_address = entity.full_address;
    this.fact_address = entity.fact_address;
    this.phone = entity.phone;
    this.email = entity.email;
    this.details = new OrganizationDetailsDTO(entity.details);
    this.bank_account = new BankPaymentMethodDTO(entity.bank_account);
  }
}
