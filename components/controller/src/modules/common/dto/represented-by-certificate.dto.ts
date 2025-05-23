import { ObjectType, Field } from '@nestjs/graphql';
import { type RepresentedByCertificateDomainInterface } from '../../../domain/user-certificate/interfaces/user-certificate-domain.interface';

/**
 * DTO для упрощенного представления представителя в сертификате
 */
@ObjectType('RepresentedByCertificate')
export class RepresentedByCertificateDTO {
  @Field(() => String, { description: 'Имя' })
  first_name: string;

  @Field(() => String, { description: 'Фамилия' })
  last_name: string;

  @Field(() => String, { description: 'Отчество' })
  middle_name: string;

  @Field(() => String, { description: 'Должность' })
  position: string;

  constructor(data: RepresentedByCertificateDomainInterface) {
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.middle_name = data.middle_name;
    this.position = data.position;
  }
}
