import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import type { SelectBranchInputDomainInterface } from '~/domain/branch/interfaces/select-branch-domain-input.interface';
import { SelectBranchSignedDigitalDocumentInputDTO } from './select-branch-document-input.dto';

@InputType('SelectBranchInput')
export class SelectBranchInputDTO implements SelectBranchInputDomainInterface {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  @IsNotEmpty({ message: 'Имя аккаунта кооператива не должно быть пустым' })
  @IsString({ message: 'Имя аккаунта кооператива должно быть строкой' })
  coopname!: string;

  @Field(() => String, { description: 'Имя аккаунта кооперативного участка' })
  @IsNotEmpty({ message: 'Имя аккаунта кооперативного участка не должно быть пустым' })
  @IsString({ message: 'Имя аккаунта кооперативного участка должно быть строкой' })
  braname!: string;

  @Field(() => String, { description: 'Имя аккаунта пользователя' })
  @IsNotEmpty({ message: 'Имя аккаунта пользователя не должно быть пустым' })
  username!: string;

  @Field(() => SelectBranchSignedDigitalDocumentInputDTO, {
    description: 'Подписанный электронный документ (registry_id == 101)',
  })
  @ValidateNested()
  document!: SelectBranchSignedDigitalDocumentInputDTO;
}
