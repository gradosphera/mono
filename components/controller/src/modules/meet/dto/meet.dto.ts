import { Field, ObjectType } from '@nestjs/graphql';
import { ValidateNested } from 'class-validator';
import type { MeetRowProcessingDomainInterface } from '~/domain/meet/interfaces/meet-row-processing-domain.interface';
import { DocumentAggregateDTO } from '~/modules/document/dto/document-aggregate.dto';

@ObjectType('Meet', { description: 'Данные о собрании кооператива' })
export class MeetDTO implements MeetRowProcessingDomainInterface {
  @Field(() => Number, { description: 'Уникальный идентификатор собрания' })
  id!: number;

  @Field(() => String, { description: 'Хеш собрания' })
  hash!: string;

  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  coopname!: string;

  @Field(() => String, { description: 'Тип собрания' })
  type!: string;

  @Field(() => String, { description: 'Инициатор собрания' })
  initiator!: string;

  @Field(() => String, { description: 'Председатель собрания' })
  presider!: string;

  @Field(() => String, { description: 'Секретарь собрания' })
  secretary!: string;

  @Field(() => String, { description: 'Статус собрания' })
  status!: string;

  @Field(() => Date, { description: 'Дата создания собрания' })
  created_at!: Date;

  @Field(() => Date, { description: 'Дата открытия собрания' })
  open_at!: Date;

  @Field(() => Date, { description: 'Дата закрытия собрания' })
  close_at!: Date;

  @Field(() => Number, { description: 'Процент необходимого кворума' })
  quorum_percent!: number;

  @Field(() => Number, { description: 'Количество подписанных бюллетеней' })
  signed_ballots!: number;

  @Field(() => Number, { description: 'Текущий процент кворума' })
  current_quorum_percent!: number;

  @Field(() => Number, { description: 'Цикл собрания' })
  cycle!: number;

  @Field(() => Boolean, { description: 'Флаг достижения кворума' })
  quorum_passed!: boolean;

  @Field(() => DocumentAggregateDTO, { description: 'Документ с повесткой собрания' })
  @ValidateNested()
  proposal!: DocumentAggregateDTO;

  @Field(() => DocumentAggregateDTO, {
    description: 'Документ с решением совета о проведении собрания',
    nullable: true,
  })
  @ValidateNested()
  authorization?: DocumentAggregateDTO;

  constructor(data: MeetDTO) {
    Object.assign(this, data);
  }
}
