/**
 * Генерирует уникальный sha256 хеш (hex string) для идентификаторов (например, payment_hash)
 * Использует Web Crypto API
 */
export async function generateUniqueHash(): Promise<string> {
  const timestamp = Date.now();
  const randomValue = Math.random().toString();
  const data = `${timestamp}-${randomValue}`;

  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
}
