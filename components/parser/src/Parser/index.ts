import { ActionsParser } from '../ActionParser'
import { BlockParser } from '../BlockParser/Parser/BlockParser'
import { db } from '../Database'
import { DeltasParser } from '../DeltaParser'
import { loadReader } from '../Reader'

export class Parser {
  async start() {
    const reader = await loadReader(db)
    try {
      BlockParser(db, reader)
      ActionsParser(db, reader)
      DeltasParser(db, reader)
    }
    catch (e) {
      console.error('Ошибка: ', e)
      this.start()
    }
  }
}
