import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

@InputType('AgendaMeet', { description: 'Данные собрания для повестки' })
export class AgendaMeetDTO {
  @Field(() => String, { description: 'Тип собрания (очередное или внеочередное)' })
  @IsEnum(['regular', 'extra'])
  @IsNotEmpty()
  type!: 'regular' | 'extra';

  @Field(() => String, { description: 'Дата и время начала собрания' })
  @IsString()
  @IsNotEmpty()
  open_at_datetime!: string;

  @Field(() => String, { description: 'Дата и время окончания собрания' })
  @IsString()
  @IsNotEmpty()
  close_at_datetime!: string;
}
