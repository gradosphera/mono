import type { MakeAllFieldsRequired } from "./MakeAllFieldsRequired";

export function validateSelector<Raw, Expected>(
  rawSelector: Raw
): Raw & MakeAllFieldsRequired<Expected> {
  // Никакой логики здесь не требуется, функция используется только для типов
  return rawSelector as Raw & MakeAllFieldsRequired<Expected>;
}
