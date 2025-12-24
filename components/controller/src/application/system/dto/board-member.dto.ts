import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('BoardMember')
export class BoardMemberDTO {
  @Field(() => String, { description: 'Имя пользователя (username)' })
  username!: string;

  @Field(() => String, { description: 'Имя' })
  first_name!: string;

  @Field(() => String, { description: 'Фамилия' })
  last_name!: string;

  @Field(() => String, { description: 'Отчество', nullable: true })
  middle_name?: string;

  @Field(() => Boolean, { description: 'Флаг председателя совета' })
  is_chairman!: boolean;

  constructor(data?: Partial<BoardMemberDTO>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
