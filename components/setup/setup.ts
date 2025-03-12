import inquirer, { Answers } from 'inquirer';
import { promises as fs } from 'fs';
import { exec } from 'child_process';
import util from 'util';
import ora from 'ora';

const execPromise = util.promisify(exec);

console.clear();
console.log(`
888b     d888  .d88888b.  888b    888  .d88888b.
8888b   d8888 d88P" "Y88b 8888b   888 d88P" "Y88b
88888b.d88888 888     888 88888b  888 888     888
888Y88888P888 888     888 888Y88b 888 888     888
888 Y888P 888 888     888 888 Y88b888 888     888
888  Y8P  888 888     888 888  Y88888 888     888
888   "   888 Y88b. .d88P 888   Y8888 Y88b. .d88P
888       888  "Y88888P"  888    Y888  "Y88888P"`);

interface MenuAnswers extends Answers {
  choice: 'dev' | 'use';
  env?: 'frontend-testnet' | 'local-full';
}

async function mainMenu(): Promise<void> {
  const { choice } = await inquirer.prompt<MenuAnswers>([
    {
      type: 'list',
      name: 'choice',
      message: 'Выберите режим установки MONO:',
      choices: [
        { name: 'Для разработки', value: 'dev' },
        { name: 'Для использования', value: 'use' }
      ]
    }
  ]);

  if (choice === 'use') {
    console.log('🚀 Быстрая установка для использования пока не реализована. Выход...');
    process.exit(0);
  }

  await developmentMenu();
}

async function developmentMenu(): Promise<void> {
  const { env } = await inquirer.prompt<MenuAnswers>([
    {
      type: 'list',
      name: 'env',
      message: 'Выберите среду разработки:',
      choices: [
        { name: 'Только фронтенд на тестнете', value: 'frontend-testnet' },
        { name: 'Локальный фронтенд и бэкенд', value: 'local-full' }
      ]
    }
  ]);

  if (env === 'frontend-testnet') {
    console.log('📡 Настраиваем фронтенд на тестнете...');
    await setupFrontendTestnet();
  } else if (env === 'local-full') {
    console.log('🖥️ Настраиваем локальный фронтенд и бэкенд...');
    await setupLocalFull();
  }
}

async function setupFrontendTestnet(): Promise<void> {
  await copyFile('../desktop/.env-example', '../desktop/.env');
  await copyFile('../desktop/Env-testnet.ts', '../desktop/src/shared/config/Env.ts');

  console.log('\n🚀 Начинаем сборку компонентов...');
  await runCommandWithSpinner('cd ../cooptypes && pnpm run build', 'Сборка библиотеки типов');
  await runCommandWithSpinner('cd ../factory && pnpm run build', 'Сборка фабрики документов');
  await runCommandWithSpinner('cd ../sdk && pnpm run build', 'Сборка SDK');
  
  console.log('\n✅ Фронтенд готов к запуску.');
  console.log('🔹 Для запуска выполните:');
  console.log('   💻 `pnpm run dev:desktop`');
}

async function setupLocalFull(): Promise<void> {
  await copyFile('../desktop/.env-example', '../desktop/.env');
  await copyFile('../desktop/Env-example.ts', '../desktop/src/shared/config/Env.ts');

  await copyFile('../controller/.env-example', '../controller/.env');
  await copyFile('../boot/.env-example', '../boot/.env');
  await copyFile('../factory/.env-example', '../factory/.env');
  await copyFile('../notificator/.env-example', '../notificator/.env');
  await copyFile('../parser/.env-example', '../parser/.env');

  console.log('\n🚀 Подготавливаем инфраструктуру...');
  await runCommandWithSpinner('docker compose up -d', 'Запуск инфраструктуры');

  console.log('\n🚀 Начинаем сборку компонентов...');
  await runCommandWithSpinner('cd ../cooptypes && pnpm run build', 'Сборка библиотеки типов');
  await runCommandWithSpinner('cd ../factory && pnpm run build', 'Сборка фабрики документов');
  await runCommandWithSpinner('cd ../sdk && pnpm run build', 'Сборка SDK');
  await runCommandWithSpinner('cd ../contracts && pnpm run build:all', 'Сборка смарт-контрактов');

  console.log('\n✅ Подготовка завершена.');
  console.log('🔹 Для локального запуска системы последовательно выполните в соседних окнах терминала:');
  console.log('   💻 `pnpm boot` (Запуск блокчейна и контрактов)');
  console.log('   💻 `pnpm run dev:backend` (Запуск бэкенда)');
  console.log('   💻 `pnpm run dev:desktop` (Запуск фронтенда)');
}

async function copyFile(source: string, destination: string): Promise<void> {
  try {
    await fs.copyFile(source, destination);
    console.log(`📂 ${source} → ${destination}`);
  } catch (error) {
    console.error(`❌ Ошибка копирования ${source}:`, error);
  }
}

async function runCommandWithSpinner(command: string, message: string): Promise<void> {
  const spinner = ora(`${message}...`).start();
  try {
    await execPromise(command);
    spinner.succeed(`${message} ✅`);
  } catch (error) {
    spinner.fail(`${message} ❌`);
    console.error(`❌ Ошибка выполнения команды "${command}":`, error);
  }
}

// Запуск меню
mainMenu();
