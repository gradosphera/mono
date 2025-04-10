import { PowerupPluginModule, Schema as PowerupSchema } from './powerup/powerup-extension.module';
import fs from 'node:fs/promises';
import { YookassaPluginModule, Schema as YookassaSchema } from './yookassa/yookassa-extension.module';
import { SberpollPluginModule, Schema as SberpollSchema } from './sberpoll/sberpoll-extension.module';
import { QrPayPluginModule, Schema as QRPaySchema } from './qrpay/qrpay-extension.module';
import path from 'path';

export interface IRegistryExtension {
  builtin: boolean;
  available: boolean;
  internal: boolean;
  external_url?: string;
  title: string;
  description: string;
  image: string;
  class: any;
  schema: any;
  tags?: string[];
  readme: Promise<string>;
  instructions: Promise<string>;
}

interface INamedExtension {
  [key: string]: IRegistryExtension;
}

// Функция для чтения README.md или возврата пустой строки, если файл не найден
function getReadmeContent(dirPath: string): Promise<string> {
  return fs.readFile(path.join(__dirname, dirPath, 'README.md'), 'utf-8').catch(() => '');
}
// Функция для чтения INSTALL.md или возврата пустой строки, если файл не найден
function getInstructionsContent(dirPath: string): Promise<string> {
  return fs.readFile(path.join(__dirname, dirPath, 'INSTALL.md'), 'utf-8').catch(() => '');
}

export const AppRegistry: INamedExtension = {
  powerup: {
    builtin: false,
    internal: true,
    available: true,
    title: 'QUOTTER',
    description: 'Расширение для автоматической аренды квот вычислительных ресурсов.',
    image: 'https://i.ibb.co/7np8Bpm/DALL-E-Futuristic-Robot-Art-Nouveau.webp',
    class: PowerupPluginModule,
    schema: PowerupSchema,
    tags: ['утилиты'],
    readme: getReadmeContent('./powerup'),
    instructions: getInstructionsContent('./powerup'),
  },
  yookassa: {
    builtin: false,
    internal: true,
    available: false,
    title: 'YOOKASSA',
    description: 'Расширение для приёма платежей с помощью ЮКасса. Для использования необходимо установить API-ключ.',
    image: 'https://i.ibb.co/Hq6CJFj/Yookassa-Image.png',
    class: YookassaPluginModule,
    schema: YookassaSchema,
    tags: ['платежи'],
    readme: getReadmeContent('./yookassa'),
    instructions: getInstructionsContent('./yookassa'),
  },
  sberpoll: {
    builtin: false,
    internal: true,
    available: false,
    title: 'SBERKASSA',
    description: 'Расширение для автоматического приёма паевых взносов в Сбербанке.',
    image: 'https://i.ibb.co/5rQTPLN/sber.png',
    class: SberpollPluginModule,
    schema: SberpollSchema,
    tags: ['платежи'],
    readme: getReadmeContent('./sberpoll'),
    instructions: getInstructionsContent('./sberpoll'),
  },
  qrpay: {
    builtin: false,
    internal: true,
    available: true,
    title: 'QR-CODE',
    description: 'Расширение для выставления QR-счёта на оплату из любого банковского приложения.',
    image: 'https://i.ibb.co/Y7pByhp/QR-Code-3.png',
    class: QrPayPluginModule,
    schema: QRPaySchema,
    tags: ['платежи'],
    readme: getReadmeContent('./qrpay'),
    instructions: getInstructionsContent('./qrpay'),
  },
};
