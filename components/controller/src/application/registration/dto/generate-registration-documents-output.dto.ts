import { ObjectType, Field } from '@nestjs/graphql';
import { GeneratedRegistrationDocumentDTO } from './generated-registration-document.dto';
import { AccountType } from '~/application/account/enum/account-type.enum';
import type { IGenerateRegistrationDocumentsOutput } from '~/domain/registration/interfaces/registration-documents.interface';

@ObjectType('GenerateRegistrationDocumentsOutput')
export class GenerateRegistrationDocumentsOutputDTO {
  @Field(() => [GeneratedRegistrationDocumentDTO], { description: 'Массив сгенерированных документов' })
  documents!: GeneratedRegistrationDocumentDTO[];

  @Field(() => AccountType, { description: 'Тип аккаунта' })
  account_type!: AccountType;

  @Field({ description: 'Имя пользователя' })
  username!: string;

  constructor(data?: IGenerateRegistrationDocumentsOutput) {
    if (data) {
      this.documents = data.documents.map((doc) => new GeneratedRegistrationDocumentDTO(doc));
      this.account_type = data.account_type as AccountType;
      this.username = data.username;
    }
  }
}
