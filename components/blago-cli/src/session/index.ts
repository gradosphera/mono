// Сессия: login (email+WIF), токены в .blago/session.<env>.json, refresh при 401.

import type { ReadStream } from 'node:tty'
import * as fs from 'node:fs/promises'
import * as readline from 'node:readline'

import { Client, Mutations, Queries } from '@coopenomics/sdk'

import { toGraphqlApiUrl } from '../config/api-url.js'
import { type BlagoConfigFile, type BlagoRemoteProfile, getActiveProfile } from '../config/index.js'
import { sessionPath } from '../config/paths.js'

export interface BlagoSessionFile {
  readonly accessToken: string
  readonly refreshToken: string
  readonly username: string
}

export async function promptLine(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  try {
    return await new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer.trim())
      })
    })
  }
  finally {
    rl.close()
  }
}

export async function promptSecret(question: string): Promise<string> {
  const stdin = process.stdin as ReadStream
  const stdout = process.stdout
  if (!stdin.isTTY) {
    throw new Error('Скрытый ввод ключа возможен только в интерактивном TTY')
  }
  stdout.write(question)

  let onData: ((chunk: string | Buffer) => void) | undefined

  try {
    stdin.setRawMode(true)
    stdin.resume()
    stdin.setEncoding('utf8')

    return await new Promise((resolve, reject) => {
      let result = ''
      onData = (chunk: string | Buffer): void => {
        const s = typeof chunk === 'string' ? chunk : chunk.toString('utf8')
        for (const ch of s) {
          const code = ch.charCodeAt(0)
          if (code === 3) {
            stdout.write('\n')
            reject(new Error('прервано'))
            return
          }
          if (code === 13 || code === 10) {
            stdout.write('\n')
            resolve(result)
            return
          }
          if (code === 127 || code === 8) {
            result = result.slice(0, -1)
          }
          else {
            result += ch
          }
        }
      }
      stdin.on('data', onData)
    })
  }
  finally {
    try {
      stdin.setRawMode(false)
    }
    catch {
      /* Windows или stdin уже не TTY */
    }
    if (onData) {
      stdin.off('data', onData)
    }
    stdin.pause()
  }
}

export async function saveSession(root: string, envName: string, data: BlagoSessionFile): Promise<void> {
  const p = sessionPath(root, envName)
  await fs.writeFile(p, `${JSON.stringify(data, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
  try {
    await fs.chmod(p, 0o600)
  }
  catch {
    /* Windows и др. */
  }
}

export async function loadSession(root: string, envName: string): Promise<BlagoSessionFile | null> {
  try {
    const raw = await fs.readFile(sessionPath(root, envName), 'utf8')
    const parsed = JSON.parse(raw) as BlagoSessionFile
    if (!parsed.accessToken || !parsed.refreshToken || !parsed.username) {
      return null
    }
    return parsed
  }
  catch {
    return null
  }
}

export function createClient(profile: BlagoRemoteProfile): Client {
  return Client.create({
    api_url: toGraphqlApiUrl(profile.api_url),
    chain_url: profile.chain_url,
    chain_id: profile.chain_id,
  })
}

export async function loginInteractive(
  client: Client,
  root: string,
  envName: string,
): Promise<BlagoSessionFile> {
  const email = await promptLine('Email (логин в кооперативе): ')
  if (!email) {
    throw new Error('Email не может быть пустым')
  }
  const wif = await promptSecret('Приватный ключ (WIF), ввод скрыт: ')
  if (!wif) {
    throw new Error('Ключ не может быть пустым')
  }
  const loginResult = await client.login(email, wif)
  const access = loginResult.tokens.access.token
  const refresh = loginResult.tokens.refresh.token
  const username = loginResult.account.username
  const session: BlagoSessionFile = { accessToken: access, refreshToken: refresh, username }
  await saveSession(root, envName, session)
  return session
}

export async function applySession(client: Client, session: BlagoSessionFile): Promise<void> {
  client.setToken(session.accessToken)
}

export async function refreshSession(client: Client, session: BlagoSessionFile): Promise<BlagoSessionFile> {
  const { [Mutations.Auth.Refresh.name]: result } = await client.Mutation(Mutations.Auth.Refresh.mutation, {
    variables: {
      data: {
        access_token: session.accessToken,
        refresh_token: session.refreshToken,
      },
    },
  })
  const next: BlagoSessionFile = {
    accessToken: result.tokens.access.token,
    refreshToken: result.tokens.refresh.token,
    username: result.account.username,
  }
  return next
}

export interface AuthenticatedContext {
  readonly root: string
  readonly config: BlagoConfigFile
  readonly client: Client
  readonly session: BlagoSessionFile
}

// Токен из файла → проверка запросом; при сбое — refresh или интерактивный login.
export async function ensureAuthenticatedContext(
  root: string,
  cfg: BlagoConfigFile,
  options?: { allowInteractiveLogin?: boolean },
): Promise<AuthenticatedContext> {
  const profile = getActiveProfile(cfg)
  const client = createClient(profile)
  let session = await loadSession(root, cfg.activeEnv)
  if (!session) {
    if (!options?.allowInteractiveLogin) {
      throw new Error('Нет сохранённой сессии. Выполните: blago login')
    }
    session = await loginInteractive(client, root, cfg.activeEnv)
  }
  await applySession(client, session)
  try {
    await client.Query(Queries.Desktop.GetDesktop.query, { variables: {} })
  }
  catch {
    try {
      session = await refreshSession(client, session)
      await applySession(client, session)
      await saveSession(root, cfg.activeEnv, session)
    }
    catch {
      if (!options?.allowInteractiveLogin) {
        throw new Error('Сессия устарела. Выполните: blago login')
      }
      session = await loginInteractive(client, root, cfg.activeEnv)
      await applySession(client, session)
    }
  }
  return { root, config: cfg, client, session }
}
