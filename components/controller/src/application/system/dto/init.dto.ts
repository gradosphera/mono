import { Field, InputType } from '@nestjs/graphql';
import { ValidateNested } from 'class-validator';
import { CreateOrganizationDataInputDTO } from '~/application/account/dto/create-organization-data-input.dto';

@InputType('Init')
export class InitDTO {
  @Field(() => CreateOrganizationDataInputDTO, {
    description: 'Объект организации кооператива, которая обслуживает данный экземпляр программного обеспечения MONO',
  })
  @ValidateNested()
  organization_data!: CreateOrganizationDataInputDTO;
}
