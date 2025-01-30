import { InputType, Field } from '@nestjs/graphql';
import { AssetContributionStatementSignedDocumentInputDTO } from './asset-contribution-statement.dto';
import { IsNumberString, IsString } from 'class-validator';

@InputType('AcceptChildOrderInput')
export class AcceptChildOrderInputDTO {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  @IsString()
  coopname!: string;

  @Field(() => String, { description: 'Имя аккаунта пользователя' })
  @IsString()
  username!: string;

  @Field(() => String, { description: 'Идентификатор заявки' })
  @IsNumberString()
  exchange_id!: string;

  @Field(() => AssetContributionStatementSignedDocumentInputDTO, {
    description: 'Подписанный документ заявления на имущественный паевый взнос',
  })
  document!: AssetContributionStatementSignedDocumentInputDTO;
}
