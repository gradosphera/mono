import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType('RepresentedBy')
export class RepresentedByGraphQLDTO {
  @Field(() => String, { description: 'Имя' })
  first_name: string;

  @Field(() => String, { description: 'Фамилия' })
  last_name: string;

  @Field(() => String, { description: 'Отчество' })
  middle_name: string;

  @Field(() => String, { description: 'Должность' })
  position: string;

  @Field(() => String, { description: 'На основании чего действует' })
  based_on: string;

  constructor(data: { first_name: string; last_name: string; middle_name: string; position: string; based_on: string }) {
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.middle_name = data.middle_name;
    this.position = data.position;
    this.based_on = data.based_on;
  }
}
