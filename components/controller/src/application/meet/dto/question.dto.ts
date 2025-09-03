import { Field, ObjectType } from '@nestjs/graphql';
import { IsArray } from 'class-validator';
import type { QuestionRowProcessingDomainInterface } from '~/domain/meet/interfaces/question-row-processing-domain.interface';

@ObjectType('Question', { description: 'Вопрос повестки собрания с результатами голосования' })
export class QuestionDTO implements QuestionRowProcessingDomainInterface {
  @Field(() => Number, { description: 'Уникальный идентификатор вопроса' })
  id!: number;

  @Field(() => Number, { description: 'Порядковый номер вопроса в повестке' })
  number!: number;

  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  coopname!: string;

  @Field(() => Number, { description: 'Идентификатор собрания, к которому относится вопрос' })
  meet_id!: number;

  @Field(() => String, { description: 'Заголовок вопроса' })
  title!: string;

  @Field(() => String, { description: 'Контекст или дополнительная информация по вопросу' })
  context!: string;

  @Field(() => String, { description: 'Предлагаемое решение по вопросу' })
  decision!: string;

  @Field(() => Number, { description: 'Количество голосов "За"' })
  counter_votes_for!: number;

  @Field(() => Number, { description: 'Количество голосов "Против"' })
  counter_votes_against!: number;

  @Field(() => Number, { description: 'Количество голосов "Воздержался"' })
  counter_votes_abstained!: number;

  @Field(() => [String], { description: 'Список участников, проголосовавших "За"' })
  @IsArray()
  voters_for!: string[];

  @Field(() => [String], { description: 'Список участников, проголосовавших "Против"' })
  @IsArray()
  voters_against!: string[];

  @Field(() => [String], { description: 'Список участников, проголосовавших "Воздержался"' })
  @IsArray()
  voters_abstained!: string[];

  constructor(data: QuestionRowProcessingDomainInterface) {
    Object.assign(this, data);
  }
}
