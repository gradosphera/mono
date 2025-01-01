export function toDotNotation(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, key) => {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(acc, toDotNotation(value, newKey));
    } else {
      acc[newKey] = value;
    }

    return acc;
  }, {});
}
