import { createUnionType } from '@nestjs/graphql';
import { EntrepreneurCertificateDTO } from '~/modules/common/dto/entrepreneur-certificate.dto';
import { IndividualCertificateDTO } from '~/modules/common/dto/individual-certificate.dto';
import { OrganizationCertificateDTO } from '~/modules/common/dto/organization-certificate.dto';

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
