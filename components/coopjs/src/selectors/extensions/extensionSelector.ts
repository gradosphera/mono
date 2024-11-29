import type { MakeAllFieldsRequired } from "../../utils/MakeAllFieldsRequired";
import { Selector, type ValueTypes } from "../../zeus";

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

// Проверяем валидность
const validateExtensionSelector = (selector: typeof rawExtensionSelector): MakeAllFieldsRequired<ValueTypes['Extension']> => selector;
validateExtensionSelector(rawExtensionSelector);

export const extensionSelector = Selector('Extension')(rawExtensionSelector);
export { rawExtensionSelector };
