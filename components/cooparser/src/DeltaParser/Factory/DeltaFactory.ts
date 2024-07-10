import type { IParserDelta } from '../../Types'
import { DeltaParser } from '../Deltas/any.any.any'

export class DeltaParserFactory {
  static create(code: string, scope: string, table: string): IParserDelta | null {
    // Здесь могут быть различные условия для создания парсеров, аналогично ActionParserFactory
    switch (`${code}::${scope}::${table}`) {
      // Пример кастомной обработки для определенной комбинации code, scope, table
      // case 'mycode::myscope::mytable':
      //   return new CustomDeltaParser()

      default:
        return new DeltaParser() // Сохраняем дельты как пришли из блокчейна
    }
  }
}
