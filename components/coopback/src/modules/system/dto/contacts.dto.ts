import { Field, ObjectType } from '@nestjs/graphql';
import { OrganizationDetailsDTO } from '~/modules/common/dto/organization-details.dto';
import { PublicChairmanDTO } from './public-chairman.dto';

@ObjectType('ContactsDTO')
export class ContactsDTO {
  @Field(() => String)
  full_name!: string;

  @Field(() => String)
  full_address!: string;

  @Field(() => OrganizationDetailsDTO)
  details!: OrganizationDetailsDTO;

  @Field(() => String)
  phone!: string;

  @Field(() => String)
  email!: string;

  @Field(() => PublicChairmanDTO)
  chairman!: PublicChairmanDTO;
}
