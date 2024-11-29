import { ObjectType, Field, Int } from '@nestjs/graphql';
import type { PassportDataDomainInterface } from '../../../domain/common/interfaces/passport-data-domain.interface';

@ObjectType('Passport')
export class PassportDTO implements PassportDataDomainInterface {
  @Field(() => Int, { description: 'Серия паспорта' })
  series: number;

  @Field(() => Int, { description: 'Номер паспорта' })
  number: number;

  @Field(() => String, { description: 'Кем выдан' })
  issued_by: string;

  @Field(() => String, { description: 'Дата выдачи' })
  issued_at: string;

  @Field(() => String, { description: 'Код подразделения' })
  code: string;

  constructor(data: PassportDataDomainInterface) {
    this.series = data.series;
    this.number = data.number;
    this.issued_by = data.issued_by;
    this.issued_at = data.issued_at;
    this.code = data.code;
  }
}
