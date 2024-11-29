import type { DeserializedDescriptionOfExtension, ModelTypes } from '@coopenomics/coopjs';

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


export type IExtension = Omit<ModelTypes['Extension'], 'schema'> & {
  schema?: IExtensionConfigSchema;
};
