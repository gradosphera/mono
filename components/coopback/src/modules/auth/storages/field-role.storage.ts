// field-role-metadata.storage.ts
export const FieldRoleMetadataStorage = new Map<string, string>();

export function RegisterFieldRole(target: any, propertyKey: string, role: string) {
  const fieldName = `${target.constructor.name}.${propertyKey}`;
  FieldRoleMetadataStorage.set(fieldName, role);
}
