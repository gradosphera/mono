import { ObjectType, Field } from '@nestjs/graphql';
import type { IndividualDomainInterface } from '../../../domain/common/interfaces/individual-domain.interface';
import { PassportDTO } from './passport.dto';

@ObjectType('Individual')
export class IndividualDTO implements IndividualDomainInterface {
  @Field(() => String, { description: 'Имя аккаунта' })
  username: string;

  @Field(() => String, { description: 'Имя' })
  first_name: string;

  @Field(() => String, { description: 'Фамилия' })
  last_name: string;

  @Field(() => String, { description: 'Отчество' })
  middle_name: string;

  @Field(() => String, { description: 'Дата рождения' })
  birthdate: string;

  @Field(() => String, { description: 'Полный адрес' })
  full_address: string;

  @Field(() => String, { description: 'Телефон' })
  phone: string;

  @Field(() => String, { description: 'Email' })
  email: string;

  @Field(() => PassportDTO, { nullable: true, description: 'Данные паспорта' })
  passport?: PassportDTO;

  constructor(data: IndividualDomainInterface) {
    this.username = data.username;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.middle_name = data.middle_name;
    this.birthdate = data.birthdate;
    this.full_address = data.full_address;
    this.phone = data.phone;
    this.email = data.email;
    this.passport = data.passport ? new PassportDTO(data.passport) : undefined;
  }
}
