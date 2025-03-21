/* eslint-disable node/prefer-global/process */
import path from 'node:path'
import fs from 'node:fs'
import { Command } from 'commander'
import { config } from 'dotenv'
import { execCommand } from './docker/exec'
import { stopContainerByName } from './docker/stop'
import { runContainer } from './docker/run'
import { boot } from './init/booter'
import { sleep } from './utils'
import { checkHealth } from './docker/health'
import { clearDB, clearDirectory, deleteFile } from './docker/purge'
import { deployCommand } from './docker/deploy'

config()

const basePath = path.resolve(process.cwd(), './blockchain-data')
const keosdPath = path.resolve(process.cwd(), './wallet-data/keosd.sock')

if (!fs.existsSync(basePath)) {
  fs.mkdirSync(basePath, { recursive: true })
}

if (!fs.existsSync(keosdPath)) {
  fs.mkdirSync(keosdPath, { recursive: true })
}

const program = new Command()

program.version('0.1.0')

// Команда для запуска команды в контейнере
program
  .command('cleos <cmd...>')
  .description('Execute a cleos command in a Node container')
  .allowUnknownOption()
  .action(async (cmd: string[]) => {
    try {
      console.log(cmd)
      await execCommand(['cleos', ...cmd])
    }
    catch (error) {
      console.error('Command execution failed:', error)
    }
  })

// Команда для запуска команды в контейнере
program
  .command('deploy <contract_name>')
  .description('Execute a deploy command in a Node container')
  .option('-t, --target <target>', 'Specify the target')
  .option('-n, --network <network>', 'Specify the network', 'local')
  .allowUnknownOption()
  .action(async (cmd: string, options: any) => {
    try {
      const { target, network } = options
      await deleteFile(keosdPath)

      await deployCommand(cmd, target, network)
    }
    catch (error) {
      console.error('Command execution failed:', error)
    }
  })

// Команда для получения списка контейнеров
program
  .command('stop')
  .description('Stop blockchain node as is')
  .action(async () => {
    try {
      await stopContainerByName('node')

      console.log('Container is stopped')
    }
    catch (error) {
      console.error('Failed to list containers:', error)
    }
  })

// Команда для запуска команды в контейнере
program
  .command('unlock')
  .description('Unlock a cleos wallet with a .env password')
  .allowUnknownOption()
  .action(async () => {
    try {
      await execCommand([
        'cleos',
        'wallet',
        'unlock',
        '--password',
        process.env.PASSWORD!,
      ])
    }
    catch (error) {
      console.error('Command execution failed:', error)
    }
  })

// Команда для получения списка контейнеров
program
  .command('start')
  .description('Start blockchain node as is')
  .action(async () => {
    try {
      await deleteFile(keosdPath)
      await runContainer()
      console.log('Container is started')
    }
    catch (error) {
      console.error('Failed to list containers:', error)
    }
  })

// Команда для получения списка контейнеров
program
  .command('boot')
  .description('Purge blockchain data and boot a Protocol')
  .action(async () => {
    try {
      await stopContainerByName('node')
      await clearDirectory(basePath)
      await clearDB()
      await runContainer()

      await sleep(5000)
      await checkHealth()
      await boot()
      console.log(`
        
Boot is
 .d8888b.   .d88888b.  888b     d888 8888888b.  888      8888888888 88888888888 8888888888
d88P  Y88b d88P" "Y88b 8888b   d8888 888   Y88b 888      888            888     888
888    888 888     888 88888b.d88888 888    888 888      888            888     888
888        888     888 888Y88888P888 888   d88P 888      8888888        888     8888888
888        888     888 888 Y888P 888 8888888P"  888      888            888     888
888    888 888     888 888  Y8P  888 888        888      888            888     888
Y88b  d88P Y88b. .d88P 888   "   888 888        888      888            888     888
 "Y8888P"   "Y88888P"  888       888 888        88888888 8888888888     888     8888888888
 
 `)
      process.exit(0)
    }
    catch (error) {
      console.error('Failed to boot:', error)
      process.exit(1)
    }
  })

// Команда для получения списка контейнеров
program
  .command('clear')
  .description('Purge blockchain data and boot a Protocol')
  .action(async () => {
    try {
      await stopContainerByName('node')
      await deleteFile(keosdPath)
      await clearDirectory(basePath)
      await sleep(5000)
      await clearDB()
      await runContainer()
      console.log('Блокчейн очищен и перезапущен. Запустите загрузку: pnpm run boot')
      process.exit(0)
    }
    catch (error) {
      console.error('Failed to boot:', error)
      process.exit(1)
    }
  })

// Команда для получения списка контейнеров
program
  .command('only-boot')
  .description('Boot a Protocol')
  .action(async () => {
    try {
      await boot()
    }
    catch (error) {
      console.error('Failed to boot:', error)
    }
  })

program.parse(process.argv) // Пуск парсинга аргументов

async function gracefulShutdown() {
  // console.log('Stopping container...')
  // await stopContainerByName('node')
  process.exit(0)
}

process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)
