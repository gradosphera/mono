import type { Database } from '../../Database'
import { publishFork } from '../../RedisNotifier'
import type { EosioShipReaderResolved } from '../../Types'
import { ForkParserFactory } from '../Factory'

export async function ForksParser(db: Database, reader: EosioShipReaderResolved) {
  const { forks$ } = reader

  forks$.subscribe(async (block_num: number) => {
    console.log(`\nFORK detected at block: ${block_num}`)

    const parser = ForkParserFactory.create()
    if (parser) {
      await parser.process(db, block_num)
      await publishFork('fork', block_num)
    }
  })

  console.log('Подписка на форки активирована')
}
