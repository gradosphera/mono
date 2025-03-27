import type { MakeAllFieldsRequired } from "../../utils/MakeAllFieldsRequired";
import { Selector, type ModelTypes, type ValueTypes } from "../../zeus/index";

const rawExtensionSelector = {
  name: true,
  available: true,
  enabled: true,
  updated_at: true,
  created_at: true,
  config: true,
  schema: true,
  title: true,
  description: true,
  image: true,
  tags: true,
  readme: true,
  instructions: true,
  installed: true,
};

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['Extension']> = rawExtensionSelector;
export type extensionModel = ModelTypes['Extension']

export const extensionSelector = Selector('Extension')(rawExtensionSelector);
export { rawExtensionSelector };
