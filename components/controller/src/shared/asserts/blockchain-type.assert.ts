type MissingKeys<TExpected, TActual> = Exclude<keyof TExpected, keyof TActual>;

export type AssertKeysMatch<TExpected, TActual> = MissingKeys<TExpected, TActual> extends never
  ? true
  : ['❌ Missing keys in actual:', MissingKeys<TExpected, TActual>] & false;

// eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
export function assertType<T extends true>() {}
