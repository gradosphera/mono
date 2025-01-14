import { InputType, ObjectType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import type { RepresentedByDomainInterface } from '~/domain/common/interfaces/represented-by.interface';

@ObjectType()
@InputType()
class RepresentedByBase {
  @Field(() => String, { description: 'Имя' })
  @IsNotEmpty({ message: 'Имя не должно быть пустым' })
  @IsString({ message: 'Имя должно быть строкой' })
  first_name: string;

  @Field(() => String, { description: 'Фамилия' })
  @IsOptional() // Допускаем отсутствие или пустую строку
  @IsString({ message: 'Фамилия должна быть строкой' })
  last_name: string;

  @Field(() => String, { description: 'Отчество' })
  @IsNotEmpty({ message: 'Отчество не должно быть пустым' })
  @IsString({ message: 'Отчество должно быть строкой' })
  middle_name: string;

  @Field(() => String, { description: 'Должность' })
  @IsNotEmpty({ message: 'Должность не должна быть пустой' })
  @IsString({ message: 'Должность должна быть строкой' })
  position: string;

  @Field(() => String, { description: 'На основании чего действует' })
  @IsNotEmpty({ message: 'Поле "На основании чего действует" не должно быть пустым' })
  @IsString({ message: 'Поле "На основании чего действует" должно быть строкой' })
  based_on: string;

  constructor(data?: RepresentedByDomainInterface) {
    this.first_name = data?.first_name ?? '';
    this.last_name = data?.last_name ?? '';
    this.middle_name = data?.middle_name ?? '';
    this.position = data?.position ?? '';
    this.based_on = data?.based_on ?? '';
  }
}

@ObjectType('RepresentedBy')
export class RepresentedByDTO extends RepresentedByBase {}

@InputType('RepresentedByInput')
export class RepresentedByGraphQLInput extends RepresentedByBase {}
