import {
  IIndividualCertificate,
  IEntrepreneurCertificate,
  IOrganizationCertificate
} from '../types/certificate'

/**
 * Определяет тип сертификата и возвращает строку с именем пользователя
 */
export function getNameFromCertificate(
  certificate: IIndividualCertificate | IEntrepreneurCertificate | IOrganizationCertificate | null | undefined
): string {
  if (!certificate) return ''

  // Определение типа сертификата
  if (isOrganizationCertificate(certificate)) {
    // Для организаций возвращаем короткое имя
    return certificate.short_name
  } else if (isIndividualCertificate(certificate) || isEntrepreneurCertificate(certificate)) {
    // Для физ. лиц и ИП возвращаем ФИО
    return formatFullName(certificate)
  }

  return ''
}

/**
 * Определяет тип сертификата и возвращает сокращенное имя (Фамилия И.О.)
 */
export function getShortNameFromCertificate(
  certificate: IIndividualCertificate | IEntrepreneurCertificate | IOrganizationCertificate | null | undefined
): string {
  if (!certificate) return ''

  // Определение типа сертификата
  if (isOrganizationCertificate(certificate)) {
    // Для организаций возвращаем короткое имя
    return certificate.short_name
  } else if (isIndividualCertificate(certificate) || isEntrepreneurCertificate(certificate)) {
    // Для физ. лиц и ИП возвращаем сокращенное ФИО
    return formatShortName(certificate)
  }

  return ''
}

/**
 * Проверяет, является ли сертификат сертификатом физического лица
 */
function isIndividualCertificate(
  certificate: any
): certificate is IIndividualCertificate {
  return certificate.first_name !== undefined &&
         certificate.last_name !== undefined &&
         !('inn' in certificate) &&
         !('ogrn' in certificate)
}

/**
 * Проверяет, является ли сертификат сертификатом ИП
 */
function isEntrepreneurCertificate(
  certificate: any
): certificate is IEntrepreneurCertificate {
  return certificate.first_name !== undefined &&
         certificate.last_name !== undefined &&
         'inn' in certificate &&
         !('ogrn' in certificate)
}

/**
 * Проверяет, является ли сертификат сертификатом организации
 */
function isOrganizationCertificate(
  certificate: any
): certificate is IOrganizationCertificate {
  return 'short_name' in certificate && 'inn' in certificate && 'ogrn' in certificate
}

/**
 * Форматирует ФИО из объекта с полями first_name, last_name и middle_name
 */
function formatFullName(
  data: { first_name: string; last_name: string; middle_name?: string | null }
): string {
  const { last_name, first_name, middle_name } = data

  if (middle_name) {
    return `${last_name} ${first_name} ${middle_name}`
  }

  return `${last_name} ${first_name}`
}

/**
 * Форматирует сокращенное ФИО из объекта с полями first_name, last_name и middle_name
 * Возвращает "Фамилия И.О."
 */
function formatShortName(
  data: { first_name: string; last_name: string; middle_name?: string | null }
): string {
  const { last_name, first_name, middle_name } = data

  const firstInitial = first_name.charAt(0).toUpperCase()
  const middleInitial = middle_name ? middle_name.charAt(0).toUpperCase() + '.' : ''

  return `${last_name} ${firstInitial}.${middleInitial}`
}
