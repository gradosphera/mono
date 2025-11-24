/**
 * Проверяет, является ли схема настроек расширения пустой.
 * Схема считается пустой, если:
 * - У схемы нет свойств
 * - Все свойства имеют visible: false в description
 */
export function isExtensionSchemaEmpty(schema: any): boolean {
  if (!schema?.properties) {
    return true;
  }

  const properties = Object.values(schema.properties) as any[];

  // Проверяем, есть ли хотя бы одно видимое свойство
  const hasVisibleProperties = properties.some((property: any) => {
    return property?.description?.visible !== false;
  });

  return !hasVisibleProperties;
}
