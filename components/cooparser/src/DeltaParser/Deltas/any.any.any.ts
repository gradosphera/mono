import type { Database } from '../../Database'
import type { IDelta, IParserDelta } from '../../Types'

export class DeltaParser implements IParserDelta {
  async process(db: Database, delta: IDelta) {
    // Обработка действия draft и сохранение в базу данных
    db.saveDeltaToDB(delta) // add the actual implementation of `saveActionToDB`
  }
}
