import type { Database } from '../../Database'
import { publishEvent } from '../../RedisNotifier'
import type { EosioShipReaderResolved, IDelta } from '../../Types'
import { subsribedTables } from '../../config'
import { DeltaParserFactory } from '../Factory'

export async function DeltasParser(db: Database, reader: EosioShipReaderResolved) {
  const { rows$ } = reader

  rows$.subscribe(async (delta: IDelta) => {
    console.log(`\nDELTA - code: ${delta.code}, scope: ${delta.scope}, table: ${delta.table}, primary_key: ${delta.primary_key}, data: ${JSON.stringify(delta.value)}`)
    const source = subsribedTables.find(el => el.code === delta.code && el.table === delta.table)

    const parser = DeltaParserFactory.create(delta.code, delta.scope, delta.table)
    if (parser) {
      await parser.process(db, delta)

      if (source?.notify)
        await publishEvent('delta', delta)
    }
  })

  console.log('Подписка на дельты активирована')
}
