import { createUnionType } from '@nestjs/graphql';
import {
  EntrepreneurCertificateDTO,
  IndividualCertificateDTO,
  OrganizationCertificateDTO,
} from '~/modules/common/dto/user-certificate.dto';

export const UserCertificateUnion = createUnionType({
  name: 'UserCertificateUnion',
  description: 'Объединение сертификатов пользователей (сокращенная информация)',
  types: () => [IndividualCertificateDTO, EntrepreneurCertificateDTO, OrganizationCertificateDTO] as const,
  resolveType(value) {
    // Определяем тип объекта по уникальным свойствам
    if (IndividualCertificateDTO.isTypeOf(value)) {
      return IndividualCertificateDTO;
    } else if (OrganizationCertificateDTO.isTypeOf(value)) {
      return OrganizationCertificateDTO;
    } else {
      return EntrepreneurCertificateDTO;
    }
  },
});
