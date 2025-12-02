export function toDotNotation(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, key) => {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    // Если ключ начинается с $, это MongoDB оператор - не преобразовываем
    if (key.startsWith('$')) {
      acc[newKey] = value;
      return acc;
    }

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Проверяем, содержит ли объект MongoDB операторы
      const hasMongoOperators = Object.keys(value).some((k) => k.startsWith('$'));

      if (hasMongoOperators) {
        // Если содержит операторы, сохраняем как есть с новым ключом
        acc[newKey] = value;
      } else {
        // Иначе рекурсивно преобразуем
        Object.assign(acc, toDotNotation(value, newKey));
      }
    } else {
      acc[newKey] = value;
    }

    return acc;
  }, {});
}
