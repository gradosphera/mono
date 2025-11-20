import { InputType, Field } from '@nestjs/graphql';
import { IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ConvertToAxonStatementSignedDocumentInputDTO } from '~/application/document/documents-dto/convert-to-axon-statement-document.dto';

@InputType('ProcessConvertToAxonStatementInput')
export class ProcessConvertToAxonStatementInputDTO {
  @Field(() => ConvertToAxonStatementSignedDocumentInputDTO, {
    description: 'Подписанный документ заявления на конвертацию',
  })
  @ValidateNested()
  @Type(() => ConvertToAxonStatementSignedDocumentInputDTO)
  signedDocument!: ConvertToAxonStatementSignedDocumentInputDTO;

  @Field(() => String, {
    description: 'Сумма к конвертации',
  })
  @IsString()
  convertAmount!: string;

  @Field(() => String, {
    description: 'Имя пользователя',
  })
  @IsString()
  username!: string;
}
