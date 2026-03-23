export type MakeAllFieldsRequired<T> = T extends (...args: any[]) => any
  ? T
  : T extends object
    ? {
      // Исключаем служебные поля Zeus и GraphQL-фрагменты из списка "обязательных"
      [P in keyof T as P extends '__typename' | '__directives' | '__alias' | `...on ${string}` ? P : never]?: T[P];
    } & {
      // Все остальные (бизнес-поля) делаем строго обязательными
      [P in keyof T as P extends '__typename' | '__directives' | '__alias' | `...on ${string}` ? never : P]-?: NonNullable<MakeAllFieldsRequired<T[P]>>;
    }
    : T
