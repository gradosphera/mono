import {
  AccountTypes,
  type IAccount,
} from 'src/entities/Account/types'

/**
 * Функция для получения отформатированного имени участника
 * @param account - объект аккаунта пользователя
 * @returns форматированное имя/наименование
 */
export const getName = (account: IAccount) => {
  const d = account.private_account
  if (!d) return ''
  switch (d.type) {
    case AccountTypes.individual:
      return `${d.individual_data?.last_name} ${d.individual_data?.first_name} ${d.individual_data?.middle_name}`
    case AccountTypes.entrepreneur:
      return `ИП ${d.entrepreneur_data?.last_name} ${d.entrepreneur_data?.first_name} ${d.entrepreneur_data?.middle_name}`
    case AccountTypes.organization:
      return d.organization_data?.short_name
    default:
      return ''
  }
}
