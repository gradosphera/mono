import { Field, Int, ObjectType } from '@nestjs/graphql';
import { MeetQuestionResultDomainInterface } from '~/domain/meet/interfaces/meet-decision-domain.interface';

@ObjectType('MeetQuestionResult', { description: 'Результат голосования по вопросу' })
export class MeetQuestionResultDTO implements MeetQuestionResultDomainInterface {
  @Field(() => Int, { description: 'Идентификатор вопроса' })
  question_id!: number;

  @Field(() => Int, { description: 'Порядковый номер вопроса' })
  number!: number;

  @Field(() => String, { description: 'Заголовок вопроса' })
  title!: string;

  @Field(() => String, { description: 'Принятое решение' })
  decision!: string;

  @Field(() => String, { description: 'Контекст вопроса' })
  context!: string;

  @Field(() => Int, { description: 'Количество голосов за' })
  votes_for!: number;

  @Field(() => Int, { description: 'Количество голосов против' })
  votes_against!: number;

  @Field(() => Int, { description: 'Количество воздержавшихся' })
  votes_abstained!: number;

  @Field(() => Boolean, { description: 'Принят ли вопрос' })
  accepted!: boolean;

  constructor(data: MeetQuestionResultDomainInterface) {
    Object.assign(this, data);
  }
}
