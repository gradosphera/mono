import { Field, InputType } from '@nestjs/graphql';
import { IsString, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { AssetContributionActSignedDocumentInputDTO } from './asset-contribution-act.dto';
@InputType('SupplyOnRequestInput')
export class SupplyOnRequestInputDTO {
  @Field({ description: 'Имя аккаунта кооператива' })
  @IsString()
  coopname!: string;

  @Field(() => String, { description: 'Имя аккаунта пользователя' })
  @IsString()
  username!: string;

  @Field(() => Number, { description: 'Идентификатор обмена' })
  @IsNumber()
  exchange_id!: number;

  @Field(() => AssetContributionActSignedDocumentInputDTO, {
    description: 'Подписанный Поставщиком акт приёма-передачи имущества в кооператив',
  })
  @ValidateNested()
  @Type(() => AssetContributionActSignedDocumentInputDTO)
  document!: AssetContributionActSignedDocumentInputDTO;
}
