// utils/assertSingleHash.ts
export function assertSingleHash(...hashes: Array<string | undefined>): string {
  const filtered = hashes.filter((h): h is string => !!h);
  if (filtered.length === 0) {
    throw new Error('Hash для объекта meet не найден');
  }

  const unique = new Set(filtered);
  if (unique.size > 1) {
    throw new Error('Hash объектов должен быть одинаковым во всех стадиях');
  }

  return filtered[0];
}
