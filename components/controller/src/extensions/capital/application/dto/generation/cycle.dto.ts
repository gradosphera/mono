import { ObjectType, Field } from '@nestjs/graphql';
import { CycleStatus } from '../../../domain/enums/cycle-status.enum';

/**
 * GraphQL Output DTO для сущности Cycle
 */
@ObjectType('CapitalCycle', {
  description: 'Цикл разработки в системе CAPITAL',
})
export class CycleOutputDTO {
  @Field(() => String, {
    description: 'Внутренний ID базы данных',
  })
  _id!: string;

  @Field(() => String, {
    description: 'Название цикла',
  })
  name!: string;

  @Field(() => Date, {
    description: 'Дата начала',
  })
  start_date!: Date;

  @Field(() => Date, {
    description: 'Дата окончания',
  })
  end_date!: Date;

  @Field(() => CycleStatus, {
    description: 'Статус цикла',
  })
  status!: CycleStatus;
}
