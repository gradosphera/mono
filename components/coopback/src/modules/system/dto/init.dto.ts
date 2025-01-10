import { Field, InputType } from '@nestjs/graphql';
import { ValidateNested } from 'class-validator';
import { VarsInputDTO } from './vars-input.dto';
import { CreateOrganizationDataInputDTO } from '~/modules/account/dto/create-organization-data-input.dto';

@InputType('Init')
export class InitDTO {
  @Field(() => CreateOrganizationDataInputDTO, {
    description: 'Объект организации кооператива, которая обслуживает данный экземпляр программного обеспечения MONO',
  })
  @ValidateNested()
  organization_data!: CreateOrganizationDataInputDTO;

  @Field(() => VarsInputDTO, { description: 'Переменные кооператива, используемые для заполнения шаблонов документов' })
  @ValidateNested()
  vars!: VarsInputDTO;
}
