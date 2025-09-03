import type { IParserFork } from '../../Types'
import { AnyForkParser } from '../Forks'

export class ForkParserFactory {
  static create(): IParserFork {
    // Пока что всегда возвращаем базовый парсер для форков
    // В будущем здесь можно добавить логику для разных типов форков
    return new AnyForkParser()
  }
}
