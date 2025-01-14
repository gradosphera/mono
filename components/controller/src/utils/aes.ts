import * as crypto from 'crypto'; // Импорт crypto из Node.js
import config from '../config/config';
const ALGORITHM = 'aes-256-cbc'; // Алгоритм шифрования
const SERVER_SECRET = config.server_secret; // Получаем секретный ключ из переменной окружения
const IV_LENGTH = 16; // Длина вектора инициализации для AES

// Преобразуем ключ в 32 байта с использованием SHA-256
const getKey = (secret: string) => crypto.createHash('sha256').update(secret).digest();

// Функция для шифрования
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH); // Генерация случайного вектора инициализации
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(SERVER_SECRET), iv); // Используем ключ 32 байта
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted; // Сохраняем вектор инициализации вместе с зашифрованным текстом
}

// Функция для расшифровки
export function decrypt(text: string): string {
  const [ivHex, encrypted] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex'); // Преобразование вектора инициализации из строки обратно в Buffer
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(SERVER_SECRET), iv); // Используем тот же ключ 32 байта
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
