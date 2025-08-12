import axios from 'axios'
import { describe, expect, it } from 'vitest'
import { Registry } from '@coopenomics/factory'
import { RegistratorContract, Cooperative as TCooperative } from 'cooptypes'
import type { Account, Contract, Keys } from '../types'
import config, { GOVERN_SYMBOL, SYMBOL } from '../configs'
import Blockchain from '../blockchain'
import { sendPostToCoopbackWithSecret, sleep } from '../utils'
import { fakeDocument } from '../tests/shared/fakeDocument'


export class CooperativeClass {
  public blockchain: Blockchain

  constructor(blockchain: Blockchain) {
    this.blockchain = blockchain
  }

  async addUser(username: string, keys?: Keys, referer?: string) {
    const account = await this.blockchain.generateKeypair(
      username,
      keys,
      'Аккаунт участника',
    )
    console.log('Регистрируем аккаунт')

    const data: RegistratorContract.Actions.AddUser.IAddUser = {
      coopname: config.provider,
      referer: referer || '',
      username: account.username,
      type: 'individual',
      created_at: '2025-02-05T09:34:27',
      initial: '100.0000 RUB',
      minimum: '100.0000 RUB',
      spread_initial: false,
      meta: '',
    }

    await this.blockchain.api.transact({
      actions: [
        {
          account: RegistratorContract.contractName.production,
          name: RegistratorContract.Actions.AddUser.actionName,
          authorization: [{ actor: config.provider, permission: 'active' }],
          data,
        },
      ],
    }, {
      blocksBehind: 3,
      expireSeconds: 30,
    })

    console.log('Регистрируем аккаунт как пользователя')

    const changeKey: RegistratorContract.Actions.ChangeKey.IChangeKey = {
      coopname: config.provider,
      changer: config.provider,
      username: account.username,
      public_key: account.publicKey,
    }

    await this.blockchain.api.transact({
      actions: [
        {
          account: RegistratorContract.contractName.production,
          name: RegistratorContract.Actions.ChangeKey.actionName,
          authorization: [{ actor: config.provider, permission: 'active' }],
          data: changeKey,
        },
      ],
    }, {
      blocksBehind: 3,
      expireSeconds: 30,
    })

    console.log('Отправляем подписанное положение о ЦПП Кошелька оператору')

    await this.blockchain.sendAgreement({
      coopname: config.provider,
      administrator: config.provider,
      username: username!,
      agreement_type: 'wallet',
      document: fakeDocument,
    })

    console.log('создаём кошелёк')

    // console.log(`Арендуем ресурсы кооперативу`)

    // await this.blockchain.powerup({
    //   payer: 'eosio',
    //   receiver: username,
    //   days: config.powerup.days,
    //   payment: `100.0000 ${config.token.symbol}`,
    //   transfer: true,
    // })
  }
}

export async function addUser(username: string, referer?: string) {
  // инициализируем инстанс с ключами
  const blockchain = new Blockchain(config.network, config.private_keys)
  const cooperative = new CooperativeClass(blockchain)

  await cooperative.addUser(username, {
    // eslint-disable-next-line node/prefer-global/process
    privateKey: process.env.EOSIO_PRV_KEY!,
    // eslint-disable-next-line node/prefer-global/process
    publicKey: process.env.EOSIO_PUB_KEY!,
  }, referer)
}
