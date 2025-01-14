import type { Database } from '../../Database'
import type { IParserAction } from '../../Types'

export class AnyAnyActionParser implements IParserAction {
  async process(db: Database, action: any) {
    db.saveActionToDB(action)
  }
}
