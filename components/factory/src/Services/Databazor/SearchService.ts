import type { Filter } from 'mongodb'
import type { ExternalEntrepreneurData, ExternalIndividualData, ExternalOrganizationData } from '../../Models'
import { Entrepreneur, Individual, Organization } from '../../Models'
import type { MongoDBConnector } from './MongoDBConnector'

export interface ISearchResult {
  type: 'individual' | 'entrepreneur' | 'organization'
  data: ExternalIndividualData | ExternalEntrepreneurData | ExternalOrganizationData
  score?: number // для будущего ранжирования
  highlightedFields?: string[] // поля, в которых найдено совпадение
}

export class SearchService {
  private storage: MongoDBConnector

  constructor(storage: MongoDBConnector) {
    this.storage = storage
  }

  async search(query: string): Promise<ISearchResult[]> {
    if (!query || query.trim().length === 0) {
      return []
    }

    const results: ISearchResult[] = []
    const trimmedQuery = query.trim()

    // Создаем регулярное выражение для поиска без учета регистра
    const regex = new RegExp(trimmedQuery, 'i')

    // Разбиваем запрос на слова для поиска по полному ФИО
    const queryWords = trimmedQuery.split(/\s+/).filter(word => word.length > 0)

    try {
      // Поиск в коллекции individuals
      const individualResults = await this.searchIndividuals(regex, queryWords)
      results.push(...individualResults)

      // Поиск в коллекции entrepreneurs
      const entrepreneurResults = await this.searchEntrepreneurs(regex, queryWords)
      results.push(...entrepreneurResults)

      // Поиск в коллекции organizations
      const organizationResults = await this.searchOrganizations(regex)
      results.push(...organizationResults)

      // Ограничиваем общее количество результатов до 10
      return results.slice(0, 10)
    }
    catch (error) {
      console.error('Error during search:', error)
      return []
    }
  }

  private async searchIndividuals(regex: RegExp, queryWords: string[]): Promise<ISearchResult[]> {
    const individualModel = new Individual(this.storage)
    const results: ISearchResult[] = []

    // Создаем два отдельных запроса для лучшей типизации
    let filter: any

    if (queryWords.length > 1) {
      // Комбинированный фильтр для поиска по отдельным полям И по полному ФИО
      filter = {
        deleted: false,
        $or: [
          // Поиск по отдельным полям
          { first_name: { $regex: regex } },
          { last_name: { $regex: regex } },
          { middle_name: { $regex: regex } },
          // Поиск по полному ФИО (все слова должны быть найдены)
          {
            $and: queryWords.map(word => ({
              $or: [
                { first_name: { $regex: new RegExp(word, 'i') } },
                { last_name: { $regex: new RegExp(word, 'i') } },
                { middle_name: { $regex: new RegExp(word, 'i') } },
              ],
            })),
          },
        ],
      }
    }
    else {
      // Простой фильтр для одного слова
      filter = {
        deleted: false,
        $or: [
          { first_name: { $regex: regex } },
          { last_name: { $regex: regex } },
          { middle_name: { $regex: regex } },
        ],
      }
    }

    const individuals = await individualModel.getMany(filter)

    for (const individual of individuals.results) {
      const highlightedFields = []

      // Проверяем отдельные поля
      if (regex.test(individual.first_name))
        highlightedFields.push('first_name')
      if (regex.test(individual.last_name))
        highlightedFields.push('last_name')
      if (regex.test(individual.middle_name))
        highlightedFields.push('middle_name')

      // Проверяем полное ФИО
      const fullName = `${individual.last_name} ${individual.first_name} ${individual.middle_name}`.trim()
      if (this.matchesFullName(fullName, queryWords)) {
        highlightedFields.push('full_name')
      }

      results.push({
        type: 'individual',
        data: individual,
        highlightedFields,
      })
    }

    return results
  }

  private async searchEntrepreneurs(regex: RegExp, queryWords: string[]): Promise<ISearchResult[]> {
    const entrepreneurModel = new Entrepreneur(this.storage)
    const results: ISearchResult[] = []

    // Создаем фильтр с правильной типизацией
    let filter: any

    if (queryWords.length > 1) {
      // Комбинированный фильтр
      filter = {
        deleted: false,
        $or: [
          // Поиск по отдельным полям
          { first_name: { $regex: regex } },
          { last_name: { $regex: regex } },
          { middle_name: { $regex: regex } },
          { 'details.inn': { $regex: regex } },
          { 'details.ogrn': { $regex: regex } },
          // Поиск по полному ФИО
          {
            $and: queryWords.map(word => ({
              $or: [
                { first_name: { $regex: new RegExp(word, 'i') } },
                { last_name: { $regex: new RegExp(word, 'i') } },
                { middle_name: { $regex: new RegExp(word, 'i') } },
              ],
            })),
          },
        ],
      }
    }
    else {
      // Простой фильтр
      filter = {
        deleted: false,
        $or: [
          { first_name: { $regex: regex } },
          { last_name: { $regex: regex } },
          { middle_name: { $regex: regex } },
          { 'details.inn': { $regex: regex } },
          { 'details.ogrn': { $regex: regex } },
        ],
      }
    }

    const entrepreneurs = await entrepreneurModel.getMany(filter)

    for (const entrepreneur of entrepreneurs.results) {
      const highlightedFields = []

      // Проверяем отдельные поля
      if (regex.test(entrepreneur.first_name))
        highlightedFields.push('first_name')
      if (regex.test(entrepreneur.last_name))
        highlightedFields.push('last_name')
      if (regex.test(entrepreneur.middle_name))
        highlightedFields.push('middle_name')
      if (entrepreneur.details?.inn && regex.test(entrepreneur.details.inn))
        highlightedFields.push('details.inn')
      if (entrepreneur.details?.ogrn && regex.test(entrepreneur.details.ogrn))
        highlightedFields.push('details.ogrn')

      // Проверяем полное ФИО
      const fullName = `${entrepreneur.last_name} ${entrepreneur.first_name} ${entrepreneur.middle_name}`.trim()
      if (this.matchesFullName(fullName, queryWords)) {
        highlightedFields.push('full_name')
      }

      results.push({
        type: 'entrepreneur',
        data: entrepreneur,
        highlightedFields,
      })
    }

    return results
  }

  private async searchOrganizations(regex: RegExp): Promise<ISearchResult[]> {
    const organizationModel = new Organization(this.storage)
    const results: ISearchResult[] = []

    const organizations = await organizationModel.getMany({
      deleted: false,
      $or: [
        { short_name: { $regex: regex } },
        { 'details.inn': { $regex: regex } },
        { 'details.ogrn': { $regex: regex } },
      ],
    })

    for (const organization of organizations.results) {
      const highlightedFields = []

      if (regex.test(organization.short_name))
        highlightedFields.push('short_name')
      if (organization.details?.inn && regex.test(organization.details.inn))
        highlightedFields.push('details.inn')
      if (organization.details?.ogrn && regex.test(organization.details.ogrn))
        highlightedFields.push('details.ogrn')

      results.push({
        type: 'organization',
        data: organization as ExternalOrganizationData,
        highlightedFields,
      })
    }

    return results
  }

  private matchesFullName(fullName: string, queryWords: string[]): boolean {
    // Проверяем, содержит ли полное ФИО все слова из запроса
    const fullNameLower = fullName.toLowerCase()
    return queryWords.every(word => fullNameLower.includes(word.toLowerCase()))
  }
}
