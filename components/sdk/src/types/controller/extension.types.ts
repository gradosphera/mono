// Тип данных плагина, используемый в поле description при сериализации схемы ZOD
export interface DeserializedDescriptionOfExtension {
  /**
   * Название или метка, которая будет отображаться как подпись к полю ввода.
   * Обязательное поле.
   */
  label: string;

  /**
   * Примечание или дополнительная информация, связанная с полем.
   * Отображается как подсказка или вспомогательный текст рядом с полем.
   * Необязательное поле.
   */
  note?: string;

  /**
   * Управляет видимостью поля. Если установлено в `false`, поле будет скрыто.
   * По умолчанию `true` (поле видимо).
   * Необязательное поле.
   */
  visible?: boolean;

  /**
   * Набор правил валидации, определенных как строковые выражения, например `['val > 0']`.
   * Эти выражения интерпретируются как логические проверки, применяемые к значению поля.
   * Необязательное поле.
   */
  rules?: string[];

  /**
   * Маска для ввода, которая ограничивает допустимые символы и формат поля ввода.
   * Используется для ограничения ввода, например, к числам или специфическим форматам.
   * Необязательное поле.
   */
  mask?: string;

  /**
   * Определяет, будет ли маска заполняться автоматически, когда значение не полностью введено.
   * Обычно используется с `mask`, чтобы показать пользователю заполненный шаблон.
   * Необязательное поле.
   */
  fillMask?: boolean;

  /**
   * Минимальная длина строки для текстовых полей.
   * Проверяется валидацией, чтобы гарантировать, что ввод соответствует минимальной длине.
   * Необязательное поле.
   */
  minLength?: number;

  /**
   * Максимальная длина строки для текстовых полей.
   * Проверяется валидацией, чтобы гарантировать, что ввод не превышает максимальную длину.
   * Необязательное поле.
   */
  maxLength?: number;

  /**
   * Максимальное количество строк для многострочных текстовых полей.
   * Если указано, поле ввода будет отображаться как многострочное (`textarea`).
   * Необязательное поле.
   */
  maxRows?: number;

  /**
   * Добавляет текст после значения поля в интерфейсе (например, символ валюты).
   * Необязательное поле.
   */
  append?: string;

  /**
   * Добавляет текст перед значением поля в интерфейсе (например, символ валюты).
   * Необязательное поле.
   */
  prepend?: string;
}
