import { ObjectType, Field } from '@nestjs/graphql';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AccountType } from '../enum/account-type.enum';
import { IndividualDTO } from '~/application/common/dto/individual.dto';
import { OrganizationDTO } from '~/application/common/dto/organization.dto';
import { EntrepreneurDTO } from '~/application/common/dto/entrepreneur.dto';
import type { PrivateAccountDomainInterface } from '~/domain/account/interfaces/private-account-domain.interface';

@ObjectType('PrivateAccount')
export class PrivateAccountDTO {
  @Field(() => AccountType, { description: 'Тип аккаунта' })
  public readonly type: AccountType;

  @Field(() => IndividualDTO, { nullable: true })
  @ValidateNested()
  @Type(() => IndividualDTO)
  @IsOptional()
  public readonly individual_data?: IndividualDTO;

  @Field(() => OrganizationDTO, { nullable: true })
  @ValidateNested()
  @Type(() => OrganizationDTO)
  @IsOptional()
  public readonly organization_data?: OrganizationDTO;

  @Field(() => EntrepreneurDTO, { nullable: true })
  @ValidateNested()
  @Type(() => EntrepreneurDTO)
  @IsOptional()
  public readonly entrepreneur_data?: EntrepreneurDTO;

  constructor(entity: PrivateAccountDomainInterface) {
    this.type = entity.type;
    this.individual_data = entity.individual_data ? new IndividualDTO(entity.individual_data) : undefined;
    this.organization_data = entity.organization_data ? new OrganizationDTO(entity.organization_data) : undefined;
    this.entrepreneur_data = entity.entrepreneur_data ? new EntrepreneurDTO(entity.entrepreneur_data) : undefined;
  }
}
