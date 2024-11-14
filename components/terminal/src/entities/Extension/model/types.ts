import type { DeserializedDescriptionOfExtension } from '@coopenomics/coopjs';
import type { IExtension as IExtensionInternal } from '@coopenomics/coopjs/queries/getExtensions'
export type { IGetExtensionsInput } from '@coopenomics/coopjs/queries/getExtensions'

export type ISchemaType = 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array' | 'null';

export type ISchemaProperty = {
  type?: ISchemaType;
  description?: DeserializedDescriptionOfExtension
  default?: any;
  required?: string[];
  properties?: ISchemaProperty;
  items?: ISchemaProperty; // для массивов
  enum?: any[]; // если поле использует перечисления
  additionalProperties?: boolean;
};

export type IExtensionConfigSchema = {
  properties: ISchemaProperty;
  required?: string[];
  additionalProperties?: boolean;
  type: ISchemaType;
}


export type IExtension = Omit<IExtensionInternal, 'schema'> & {
  schema?: IExtensionConfigSchema;
};
