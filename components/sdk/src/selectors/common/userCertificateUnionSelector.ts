import type { ModelTypes } from '../../zeus/index'

export const rawUserCertificateUnionSelector = {
  '...on IndividualCertificate': {
    type: true,
    username: true,
    first_name: true,
    last_name: true,
    middle_name: true,
  },
  '...on EntrepreneurCertificate': {
    type: true,
    username: true,
    first_name: true,
    last_name: true,
    inn: true,
    middle_name: true,
  },
  '...on OrganizationCertificate': {
    type: true,
    username: true,
    short_name: true,
    inn: true,
    ogrn: true,
    represented_by: {
      first_name: true,
      last_name: true,
      middle_name: true,
      position: true,
    },
  },
}
