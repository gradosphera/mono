import type { Database } from '../../Database'
import type { IParserFork } from '../../Types'

export class AnyForkParser implements IParserFork {
  async process(db: Database, block_num: number) {
    // Пока просто логируем информацию о форке
    console.log(`FORK detected at block: ${block_num}`)
    // В будущем здесь можно добавить сохранение информации о форке в базу данных
    // db.saveForkToDB({ block_num, timestamp: new Date() })
  }
}
