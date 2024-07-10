import type { IParserAction } from '../../Types'
import { AnyAnyActionParser } from '../Actions'

export class ActionParserFactory {
  static create(accountName: string, actionName: string): IParserAction | null {
    switch (`${accountName}::${actionName}`) {
      case '*::*': // Кастомная обработка содержимого перед сохранением если и когда потребуется
        return null

      default:
        return new AnyAnyActionParser() // Сохраняем действие как пришло из блокчейна
    }
  }
}
