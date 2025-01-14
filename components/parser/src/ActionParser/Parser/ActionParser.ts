import type { Database } from '../../Database'
import { publishEvent } from '../../RedisNotifier'
import type { EosioShipReaderResolved, IAction } from '../../Types'
import { subsribedActions } from '../../config'
import { ActionParserFactory } from '../Factory/ActionFactory'

export async function ActionsParser(db: Database, reader: EosioShipReaderResolved) {
  const { actions$ } = reader

  actions$.subscribe(async (action: IAction) => {
    console.log(`\nACTION - account: ${action.account}, name: ${action.name}, authorization: ${JSON.stringify(action.authorization)}, data: ${JSON.stringify(action.data)}`)

    const parser = ActionParserFactory.create(action.account, action.name)
    const source = subsribedActions.find(el => el.action === action.name && el.code === action.account)

    if (parser) {
      await parser.process(db, action)

      if (source?.notify)
        await publishEvent('action', action)
    }
  })

  console.log('Подписка на действия активирована')
}
