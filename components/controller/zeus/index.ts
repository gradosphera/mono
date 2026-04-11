/* eslint-disable */

import { AllTypesProps, ReturnTypes, Ops } from './const';


export const HOST="Specify host"


export const HEADERS = {}
import { createClient, type Sink } from 'graphql-ws'; // keep

export const apiSubscription = (options: chainOptions) => {
  const client = createClient({
    url: String(options[0]),
    connectionParams: Object.fromEntries(new Headers(options[1]?.headers).entries()),
  });

  const ws = new Proxy(
    {
      close: () => client.dispose(),
    } as WebSocket,
    {
      get(target, key) {
        if (key === 'close') return target.close;
        throw new Error(`Unimplemented property '${String(key)}', only 'close()' is available.`);
      },
    },
  );

  return (query: string) => {
    let onMessage: ((event: any) => void) | undefined;
    let onError: Sink['error'] | undefined;
    let onClose: Sink['complete'] | undefined;

    client.subscribe(
      { query },
      {
        next({ data }) {
          onMessage && onMessage(data);
        },
        error(error) {
          onError && onError(error);
        },
        complete() {
          onClose && onClose();
        },
      },
    );

    return {
      ws,
      on(listener: typeof onMessage) {
        onMessage = listener;
      },
      error(listener: typeof onError) {
        onError = listener;
      },
      open(listener: (socket: unknown) => void) {
        client.on('opened', listener);
      },
      off(listener: typeof onClose) {
        onClose = listener;
      },
    };
  };
};
export const apiSubscriptionSSE = (options: chainOptions) => (query: string, variables?: Record<string, unknown>) => {
  const url = options[0];
  const fetchOptions = options[1] || {};

  let abortController: AbortController | null = null;
  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  let onCallback: ((args: unknown) => void) | null = null;
  let errorCallback: ((args: unknown) => void) | null = null;
  let openCallback: (() => void) | null = null;
  let offCallback: ((args: unknown) => void) | null = null;
  let isClosing = false; // Flag to track intentional close

  const startStream = async () => {
    try {
      abortController = new AbortController();

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'text/event-stream',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          ...fetchOptions.headers,
        },
        body: JSON.stringify({ query, variables }),
        signal: abortController.signal,
        ...fetchOptions,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (openCallback) {
        openCallback();
      }

      reader = response.body?.getReader() || null;
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          if (offCallback) {
            offCallback({ data: null, code: 1000, reason: 'Stream completed' });
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = line.slice(6);
              const parsed = JSON.parse(data);

              if (parsed.errors) {
                if (errorCallback) {
                  errorCallback({ data: parsed.data, errors: parsed.errors });
                }
              } else if (onCallback && parsed.data) {
                onCallback(parsed.data);
              }
            } catch {
              if (errorCallback) {
                errorCallback({ errors: ['Failed to parse SSE data'] });
              }
            }
          }
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      // Don't report errors if we're intentionally closing (AbortError) or during cleanup
      if (error.name !== 'AbortError' && !isClosing && errorCallback) {
        errorCallback({ errors: [error.message || 'Unknown error'] });
      }
    }
  };

  return {
    on: (e: (args: unknown) => void) => {
      onCallback = e;
    },
    off: (e: (args: unknown) => void) => {
      offCallback = e;
    },
    error: (e: (args: unknown) => void) => {
      errorCallback = e;
    },
    open: (e?: () => void) => {
      if (e) {
        openCallback = e;
      }
      startStream();
    },
    close: () => {
      isClosing = true; // Mark as intentionally closing to suppress error callbacks
      if (abortController) {
        abortController.abort();
      }
      if (reader) {
        // Wrap in try-catch to suppress AbortError during cleanup
        reader.cancel().catch(() => {
          // Ignore cancel errors - stream may already be closed
        });
      }
    },
  };
};
const handleFetchResponse = (response: Response): Promise<GraphQLResponse> => {
  if (!response.ok) {
    return new Promise((_, reject) => {
      response
        .text()
        .then((text) => {
          try {
            reject(JSON.parse(text));
          } catch (err) {
            reject(text);
          }
        })
        .catch(reject);
    });
  }
  return response.json() as Promise<GraphQLResponse>;
};

export const apiFetch =
  (options: fetchOptions) =>
  (query: string, variables: Record<string, unknown> = {}) => {
    const fetchOptions = options[1] || {};
    if (fetchOptions.method && fetchOptions.method === 'GET') {
      return fetch(`${options[0]}?query=${encodeURIComponent(query)}`, fetchOptions)
        .then(handleFetchResponse)
        .then((response: GraphQLResponse) => {
          if (response.errors) {
            throw new GraphQLError(response);
          }
          return response.data;
        });
    }
    return fetch(`${options[0]}`, {
      body: JSON.stringify({ query, variables }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      ...fetchOptions,
    })
      .then(handleFetchResponse)
      .then((response: GraphQLResponse) => {
        if (response.errors) {
          throw new GraphQLError(response);
        }
        return response.data;
      });
  };

export const InternalsBuildQuery = ({
  ops,
  props,
  returns,
  options,
  scalars,
}: {
  props: AllTypesPropsType;
  returns: ReturnTypesType;
  ops: Operations;
  options?: OperationOptions;
  scalars?: ScalarDefinition;
}) => {
  const ibb = (
    k: string,
    o: InputValueType | VType,
    p = '',
    root = true,
    vars: Array<{ name: string; graphQLType: string }> = [],
  ): string => {
    const keyForPath = purifyGraphQLKey(k);
    const newPath = [p, keyForPath].join(SEPARATOR);
    if (!o) {
      return '';
    }
    if (typeof o === 'boolean' || typeof o === 'number') {
      return k;
    }
    if (typeof o === 'string') {
      return `${k} ${o}`;
    }
    if (Array.isArray(o)) {
      const args = InternalArgsBuilt({
        props,
        returns,
        ops,
        scalars,
        vars,
      })(o[0], newPath);
      return `${ibb(args ? `${k}(${args})` : k, o[1], p, false, vars)}`;
    }
    if (k === '__alias') {
      return Object.entries(o)
        .map(([alias, objectUnderAlias]) => {
          if (typeof objectUnderAlias !== 'object' || Array.isArray(objectUnderAlias)) {
            throw new Error(
              'Invalid alias it should be __alias:{ YOUR_ALIAS_NAME: { OPERATION_NAME: { ...selectors }}}',
            );
          }
          const operationName = Object.keys(objectUnderAlias)[0];
          const operation = objectUnderAlias[operationName];
          return ibb(`${alias}:${operationName}`, operation, p, false, vars);
        })
        .join('\n');
    }
    const hasOperationName = root && options?.operationName ? ' ' + options.operationName : '';
    const keyForDirectives = o.__directives ?? '';
    const query = `{${Object.entries(o)
      .filter(([k]) => k !== '__directives')
      .map((e) => ibb(...e, [p, `field<>${keyForPath}`].join(SEPARATOR), false, vars))
      .join('\n')}}`;
    if (!root) {
      return `${k} ${keyForDirectives}${hasOperationName} ${query}`;
    }
    const varsString = vars.map((v) => `${v.name}: ${v.graphQLType}`).join(', ');
    return `${k} ${keyForDirectives}${hasOperationName}${varsString ? `(${varsString})` : ''} ${query}`;
  };
  return ibb;
};

type UnionOverrideKeys<T, U> = Omit<T, keyof U> & U;

export const Thunder =
  <SCLR extends ScalarDefinition>(fn: FetchFunction, thunderGraphQLOptions?: ThunderGraphQLOptions<SCLR>) =>
  <O extends keyof typeof Ops, OVERRIDESCLR extends SCLR, R extends keyof ValueTypes = GenericOperation<O>>(
    operation: O,
    graphqlOptions?: ThunderGraphQLOptions<OVERRIDESCLR>,
  ) =>
  <Z extends ValueTypes[R]>(
    o: Z & {
      [P in keyof Z]: P extends keyof ValueTypes[R] ? Z[P] : never;
    },
    ops?: OperationOptions & { variables?: Record<string, unknown> },
  ) => {
    const options = {
      ...thunderGraphQLOptions,
      ...graphqlOptions,
    };
    return fn(
      Zeus(operation, o, {
        operationOptions: ops,
        scalars: options?.scalars,
      }),
      ops?.variables,
    ).then((data) => {
      if (options?.scalars) {
        return decodeScalarsInResponse({
          response: data,
          initialOp: operation,
          initialZeusQuery: o as VType,
          returns: ReturnTypes,
          scalars: options.scalars,
          ops: Ops,
        });
      }
      return data;
    }) as Promise<InputType<GraphQLTypes[R], Z, UnionOverrideKeys<SCLR, OVERRIDESCLR>>>;
  };

export const Chain = (...options: chainOptions) => Thunder(apiFetch(options));

export const SubscriptionThunder =
  <SCLR extends ScalarDefinition>(fn: SubscriptionFunction, thunderGraphQLOptions?: ThunderGraphQLOptions<SCLR>) =>
  <O extends keyof typeof Ops, OVERRIDESCLR extends SCLR, R extends keyof ValueTypes = GenericOperation<O>>(
    operation: O,
    graphqlOptions?: ThunderGraphQLOptions<OVERRIDESCLR>,
  ) =>
  <Z extends ValueTypes[R]>(
    o: Z & {
      [P in keyof Z]: P extends keyof ValueTypes[R] ? Z[P] : never;
    },
    ops?: OperationOptions & { variables?: Record<string, unknown> },
  ) => {
    const options = {
      ...thunderGraphQLOptions,
      ...graphqlOptions,
    };
    type CombinedSCLR = UnionOverrideKeys<SCLR, OVERRIDESCLR>;
    const returnedFunction = fn(
      Zeus(operation, o, {
        operationOptions: ops,
        scalars: options?.scalars,
      }),
    ) as SubscriptionToGraphQL<Z, GraphQLTypes[R], CombinedSCLR>;
    if (returnedFunction?.on && options?.scalars) {
      const wrapped = returnedFunction.on;
      returnedFunction.on = (fnToCall: (args: InputType<GraphQLTypes[R], Z, CombinedSCLR>) => void) =>
        wrapped((data: InputType<GraphQLTypes[R], Z, CombinedSCLR>) => {
          if (options?.scalars) {
            return fnToCall(
              decodeScalarsInResponse({
                response: data,
                initialOp: operation,
                initialZeusQuery: o as VType,
                returns: ReturnTypes,
                scalars: options.scalars,
                ops: Ops,
              }),
            );
          }
          return fnToCall(data);
        });
    }
    return returnedFunction;
  };

export const Subscription = (...options: chainOptions) => SubscriptionThunder(apiSubscription(options));
export type SubscriptionToGraphQLSSE<Z, T, SCLR extends ScalarDefinition> = {
  on: (fn: (args: InputType<T, Z, SCLR>) => void) => void;
  off: (fn: (e: { data?: InputType<T, Z, SCLR>; code?: number; reason?: string; message?: string }) => void) => void;
  error: (fn: (e: { data?: InputType<T, Z, SCLR>; errors?: string[] }) => void) => void;
  open: (fn?: () => void) => void;
  close: () => void;
};

export const SubscriptionThunderSSE =
  <SCLR extends ScalarDefinition>(fn: SubscriptionFunction, thunderGraphQLOptions?: ThunderGraphQLOptions<SCLR>) =>
  <O extends keyof typeof Ops, OVERRIDESCLR extends SCLR, R extends keyof ValueTypes = GenericOperation<O>>(
    operation: O,
    graphqlOptions?: ThunderGraphQLOptions<OVERRIDESCLR>,
  ) =>
  <Z extends ValueTypes[R]>(
    o: Z & {
      [P in keyof Z]: P extends keyof ValueTypes[R] ? Z[P] : never;
    },
    ops?: OperationOptions & { variables?: Record<string, unknown> },
  ) => {
    const options = {
      ...thunderGraphQLOptions,
      ...graphqlOptions,
    };
    type CombinedSCLR = UnionOverrideKeys<SCLR, OVERRIDESCLR>;
    const returnedFunction = fn(
      Zeus(operation, o, {
        operationOptions: ops,
        scalars: options?.scalars,
      }),
      ops?.variables,
    ) as SubscriptionToGraphQLSSE<Z, GraphQLTypes[R], CombinedSCLR>;
    if (returnedFunction?.on && options?.scalars) {
      const wrapped = returnedFunction.on;
      returnedFunction.on = (fnToCall: (args: InputType<GraphQLTypes[R], Z, CombinedSCLR>) => void) =>
        wrapped((data: InputType<GraphQLTypes[R], Z, CombinedSCLR>) => {
          if (options?.scalars) {
            return fnToCall(
              decodeScalarsInResponse({
                response: data,
                initialOp: operation,
                initialZeusQuery: o as VType,
                returns: ReturnTypes,
                scalars: options.scalars,
                ops: Ops,
              }),
            );
          }
          return fnToCall(data);
        });
    }
    return returnedFunction;
  };
export const SubscriptionSSE = (...options: chainOptions) => SubscriptionThunderSSE(apiSubscriptionSSE(options));
export const Zeus = <
  Z extends ValueTypes[R],
  O extends keyof typeof Ops,
  R extends keyof ValueTypes = GenericOperation<O>,
>(
  operation: O,
  o: Z,
  ops?: {
    operationOptions?: OperationOptions;
    scalars?: ScalarDefinition;
  },
) =>
  InternalsBuildQuery({
    props: AllTypesProps,
    returns: ReturnTypes,
    ops: Ops,
    options: ops?.operationOptions,
    scalars: ops?.scalars,
  })(operation, o as VType);

export const ZeusSelect = <T>() => ((t: unknown) => t) as SelectionFunction<T>;

export const Selector = <T extends keyof ValueTypes>(key: T) => key && ZeusSelect<ValueTypes[T]>();

export const TypeFromSelector = <T extends keyof ValueTypes>(key: T) => key && ZeusSelect<ValueTypes[T]>();
export const Gql = Chain(HOST, {
  headers: {
    'Content-Type': 'application/json',
    ...HEADERS,
  },
});

export const ZeusScalars = ZeusSelect<ScalarCoders>();

type BaseSymbol = number | string | undefined | boolean | null;

type ScalarsSelector<T, V> = {
  [X in Required<{
    [P in keyof T]: P extends keyof V
      ? V[P] extends Array<any> | undefined
        ? never
        : T[P] extends BaseSymbol | Array<BaseSymbol>
        ? P
        : never
      : never;
  }>[keyof T]]: true;
};

export const fields = <T extends keyof ModelTypes>(k: T) => {
  const t = ReturnTypes[k];
  const fnType = k in AllTypesProps ? AllTypesProps[k as keyof typeof AllTypesProps] : undefined;
  const hasFnTypes = typeof fnType === 'object' ? fnType : undefined;
  const o = Object.fromEntries(
    Object.entries(t)
      .filter(([k, value]) => {
        const isFunctionType = hasFnTypes && k in hasFnTypes && !!hasFnTypes[k as keyof typeof hasFnTypes];
        if (isFunctionType) return false;
        const isReturnType = ReturnTypes[value as string];
        if (!isReturnType) return true;
        if (typeof isReturnType !== 'string') return false;
        if (isReturnType.startsWith('scalar.')) {
          return true;
        }
        return false;
      })
      .map(([key]) => [key, true as const]),
  );
  return o as ScalarsSelector<ModelTypes[T], T extends keyof ValueTypes ? ValueTypes[T] : never>;
};

export const decodeScalarsInResponse = <O extends Operations>({
  response,
  scalars,
  returns,
  ops,
  initialZeusQuery,
  initialOp,
}: {
  ops: O;
  response: any;
  returns: ReturnTypesType;
  scalars?: Record<string, ScalarResolver | undefined>;
  initialOp: keyof O;
  initialZeusQuery: InputValueType | VType;
}) => {
  if (!scalars) {
    return response;
  }
  const builder = PrepareScalarPaths({
    ops,
    returns,
  });

  const scalarPaths = builder(initialOp as string, ops[initialOp], initialZeusQuery);
  if (scalarPaths) {
    const r = traverseResponse({ scalarPaths, resolvers: scalars })(initialOp as string, response, [ops[initialOp]]);
    return r;
  }
  return response;
};

export const traverseResponse = ({
  resolvers,
  scalarPaths,
}: {
  scalarPaths: { [x: string]: `scalar.${string}` };
  resolvers: {
    [x: string]: ScalarResolver | undefined;
  };
}) => {
  const ibb = (k: string, o: InputValueType | VType, p: string[] = []): unknown => {
    if (Array.isArray(o)) {
      return o.map((eachO) => ibb(k, eachO, p));
    }
    if (o == null) {
      return o;
    }
    const scalarPathString = p.join(SEPARATOR);
    const currentScalarString = scalarPaths[scalarPathString];
    if (currentScalarString) {
      const currentDecoder = resolvers[currentScalarString.split('.')[1]]?.decode;
      if (currentDecoder) {
        return currentDecoder(o);
      }
    }
    if (typeof o === 'boolean' || typeof o === 'number' || typeof o === 'string' || !o) {
      return o;
    }
    const entries = Object.entries(o).map(([k, v]) => [k, ibb(k, v, [...p, purifyGraphQLKey(k)])] as const);
    const objectFromEntries = entries.reduce<Record<string, unknown>>((a, [k, v]) => {
      a[k] = v;
      return a;
    }, {});
    return objectFromEntries;
  };
  return ibb;
};

export type AllTypesPropsType = {
  [x: string]:
    | undefined
    | `scalar.${string}`
    | 'enum'
    | {
        [x: string]:
          | undefined
          | string
          | {
              [x: string]: string | undefined;
            };
      };
};

export type ReturnTypesType = {
  [x: string]:
    | {
        [x: string]: string | undefined;
      }
    | `scalar.${string}`
    | undefined;
};
export type InputValueType = {
  [x: string]: undefined | boolean | string | number | [any, undefined | boolean | InputValueType] | InputValueType;
};
export type VType =
  | undefined
  | boolean
  | string
  | number
  | [any, undefined | boolean | InputValueType]
  | InputValueType;

export type PlainType = boolean | number | string | null | undefined;
export type ZeusArgsType =
  | PlainType
  | {
      [x: string]: ZeusArgsType;
    }
  | Array<ZeusArgsType>;

export type Operations = Record<string, string>;

export type VariableDefinition = {
  [x: string]: unknown;
};

export const SEPARATOR = '|';

export type fetchOptions = Parameters<typeof fetch>;
type websocketOptions = typeof WebSocket extends new (...args: infer R) => WebSocket ? R : never;
export type chainOptions = [fetchOptions[0], fetchOptions[1] & { websocket?: websocketOptions }] | [fetchOptions[0]];
export type FetchFunction = (query: string, variables?: Record<string, unknown>) => Promise<any>;
export type SubscriptionFunction = (query: string, variables?: Record<string, unknown>) => any;
type NotUndefined<T> = T extends undefined ? never : T;
export type ResolverType<F> = NotUndefined<F extends [infer ARGS, any] ? ARGS : undefined>;

export type OperationOptions = {
  operationName?: string;
};

export type ScalarCoder = Record<string, (s: unknown) => string>;

export interface GraphQLResponse {
  data?: Record<string, any>;
  errors?: Array<{
    message: string;
  }>;
}
export class GraphQLError extends Error {
  constructor(public response: GraphQLResponse) {
    super(response.errors?.[0]?.message || 'GraphQL Response Error');
    console.error(response);
  }
  toString() {
    return 'GraphQL Response Error';
  }
}
export type GenericOperation<O> = O extends keyof typeof Ops ? (typeof Ops)[O] : never;
export type ThunderGraphQLOptions<SCLR extends ScalarDefinition> = {
  scalars?: SCLR | ScalarCoders;
};

const ExtractScalar = (mappedParts: string[], returns: ReturnTypesType): `scalar.${string}` | undefined => {
  if (mappedParts.length === 0) {
    return;
  }
  const oKey = mappedParts[0];
  const returnP1 = returns[oKey];
  if (typeof returnP1 === 'object') {
    const returnP2 = returnP1[mappedParts[1]];
    if (returnP2) {
      return ExtractScalar([returnP2, ...mappedParts.slice(2)], returns);
    }
    return undefined;
  }
  return returnP1 as `scalar.${string}` | undefined;
};

export const PrepareScalarPaths = ({ ops, returns }: { returns: ReturnTypesType; ops: Operations }) => {
  const ibb = (
    k: string,
    originalKey: string,
    o: InputValueType | VType,
    p: string[] = [],
    pOriginals: string[] = [],
    root = true,
  ): { [x: string]: `scalar.${string}` } | undefined => {
    if (!o) {
      return;
    }
    if (typeof o === 'boolean' || typeof o === 'number' || typeof o === 'string') {
      const extractionArray = [...pOriginals, originalKey];
      const isScalar = ExtractScalar(extractionArray, returns);
      if (isScalar?.startsWith('scalar')) {
        const partOfTree = {
          [[...p, k].join(SEPARATOR)]: isScalar,
        };
        return partOfTree;
      }
      return {};
    }
    if (Array.isArray(o)) {
      return ibb(k, k, o[1], p, pOriginals, false);
    }
    if (k === '__alias') {
      return Object.entries(o)
        .map(([alias, objectUnderAlias]) => {
          if (typeof objectUnderAlias !== 'object' || Array.isArray(objectUnderAlias)) {
            throw new Error(
              'Invalid alias it should be __alias:{ YOUR_ALIAS_NAME: { OPERATION_NAME: { ...selectors }}}',
            );
          }
          const operationName = Object.keys(objectUnderAlias)[0];
          const operation = objectUnderAlias[operationName];
          return ibb(alias, operationName, operation, p, pOriginals, false);
        })
        .reduce((a, b) => ({
          ...a,
          ...b,
        }));
    }
    const keyName = root ? ops[k] : k;
    return Object.entries(o)
      .filter(([k]) => k !== '__directives')
      .map(([k, v]) => {
        // Inline fragments shouldn't be added to the path as they aren't a field
        const isInlineFragment = originalKey.match(/^...\s*on/) != null;
        return ibb(
          k,
          k,
          v,
          isInlineFragment ? p : [...p, purifyGraphQLKey(keyName || k)],
          isInlineFragment ? pOriginals : [...pOriginals, purifyGraphQLKey(originalKey)],
          false,
        );
      })
      .reduce((a, b) => ({
        ...a,
        ...b,
      }));
  };
  return ibb;
};

export const purifyGraphQLKey = (k: string) => k.replace(/\([^)]*\)/g, '').replace(/^[^:]*\:/g, '');

const mapPart = (p: string) => {
  const [isArg, isField] = p.split('<>');
  if (isField) {
    return {
      v: isField,
      __type: 'field',
    } as const;
  }
  return {
    v: isArg,
    __type: 'arg',
  } as const;
};

type Part = ReturnType<typeof mapPart>;

export const ResolveFromPath = (props: AllTypesPropsType, returns: ReturnTypesType, ops: Operations) => {
  const ResolvePropsType = (mappedParts: Part[]) => {
    const oKey = ops[mappedParts[0].v];
    const propsP1 = oKey ? props[oKey] : props[mappedParts[0].v];
    if (propsP1 === 'enum' && mappedParts.length === 1) {
      return 'enum';
    }
    if (typeof propsP1 === 'string' && propsP1.startsWith('scalar.') && mappedParts.length === 1) {
      return propsP1;
    }
    if (typeof propsP1 === 'object') {
      if (mappedParts.length < 2) {
        return 'not';
      }
      const propsP2 = propsP1[mappedParts[1].v];
      if (typeof propsP2 === 'string') {
        return rpp(
          `${propsP2}${SEPARATOR}${mappedParts
            .slice(2)
            .map((mp) => mp.v)
            .join(SEPARATOR)}`,
        );
      }
      if (typeof propsP2 === 'object') {
        if (mappedParts.length < 3) {
          return 'not';
        }
        const propsP3 = propsP2[mappedParts[2].v];
        if (propsP3 && mappedParts[2].__type === 'arg') {
          return rpp(
            `${propsP3}${SEPARATOR}${mappedParts
              .slice(3)
              .map((mp) => mp.v)
              .join(SEPARATOR)}`,
          );
        }
      }
    }
  };
  const ResolveReturnType = (mappedParts: Part[]) => {
    if (mappedParts.length === 0) {
      return 'not';
    }
    const oKey = ops[mappedParts[0].v];
    const returnP1 = oKey ? returns[oKey] : returns[mappedParts[0].v];
    if (typeof returnP1 === 'object') {
      if (mappedParts.length < 2) return 'not';
      const returnP2 = returnP1[mappedParts[1].v];
      if (returnP2) {
        return rpp(
          `${returnP2}${SEPARATOR}${mappedParts
            .slice(2)
            .map((mp) => mp.v)
            .join(SEPARATOR)}`,
        );
      }
    }
  };
  const rpp = (path: string): 'enum' | 'not' | `scalar.${string}` => {
    const parts = path.split(SEPARATOR).filter((l) => l.length > 0);
    const mappedParts = parts.map(mapPart);
    const propsP1 = ResolvePropsType(mappedParts);
    if (propsP1) {
      return propsP1;
    }
    const returnP1 = ResolveReturnType(mappedParts);
    if (returnP1) {
      return returnP1;
    }
    return 'not';
  };
  return rpp;
};

export const InternalArgsBuilt = ({
  props,
  ops,
  returns,
  scalars,
  vars,
}: {
  props: AllTypesPropsType;
  returns: ReturnTypesType;
  ops: Operations;
  scalars?: ScalarDefinition;
  vars: Array<{ name: string; graphQLType: string }>;
}) => {
  const arb = (a: ZeusArgsType, p = '', root = true): string => {
    if (typeof a === 'string') {
      if (a.startsWith(START_VAR_NAME)) {
        const [varName, graphQLType] = a.replace(START_VAR_NAME, '$').split(GRAPHQL_TYPE_SEPARATOR);
        const v = vars.find((v) => v.name === varName);
        if (!v) {
          vars.push({
            name: varName,
            graphQLType,
          });
        } else {
          if (v.graphQLType !== graphQLType) {
            throw new Error(
              `Invalid variable exists with two different GraphQL Types, "${v.graphQLType}" and ${graphQLType}`,
            );
          }
        }
        return varName;
      }
    }
    const checkType = ResolveFromPath(props, returns, ops)(p);
    if (checkType.startsWith('scalar.')) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, ...splittedScalar] = checkType.split('.');
      const scalarKey = splittedScalar.join('.');
      return (scalars?.[scalarKey]?.encode?.(a) as string) || JSON.stringify(a);
    }
    if (Array.isArray(a)) {
      return `[${a.map((arr) => arb(arr, p, false)).join(', ')}]`;
    }
    if (typeof a === 'string') {
      if (checkType === 'enum') {
        return a;
      }
      return `${JSON.stringify(a)}`;
    }
    if (typeof a === 'object') {
      if (a === null) {
        return `null`;
      }
      const returnedObjectString = Object.entries(a)
        .filter(([, v]) => typeof v !== 'undefined')
        .map(([k, v]) => `${k}: ${arb(v, [p, k].join(SEPARATOR), false)}`)
        .join(',\n');
      if (!root) {
        return `{${returnedObjectString}}`;
      }
      return returnedObjectString;
    }
    return `${a}`;
  };
  return arb;
};

export const resolverFor = <X, T extends keyof ResolverInputTypes, Z extends keyof ResolverInputTypes[T]>(
  _type: T,
  _field: Z,
  fn: (
    args: Required<ResolverInputTypes[T]>[Z] extends [infer Input, any] ? Input : any,
    source: any,
  ) => Z extends keyof ModelTypes[T] ? ModelTypes[T][Z] | Promise<ModelTypes[T][Z]> | X : never,
) => fn as (args?: any, source?: any) => ReturnType<typeof fn>;

export type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;
export type ZeusState<T extends (...args: any[]) => Promise<any>> = NonNullable<UnwrapPromise<ReturnType<T>>>;
export type ZeusHook<
  T extends (...args: any[]) => Record<string, (...args: any[]) => Promise<any>>,
  N extends keyof ReturnType<T>,
> = ZeusState<ReturnType<T>[N]>;

export type WithTypeNameValue<T> = T & {
  __typename?: boolean;
  __directives?: string;
};
export type AliasType<T> = WithTypeNameValue<T> & {
  __alias?: Record<string, WithTypeNameValue<T>>;
};
type DeepAnify<T> = {
  [P in keyof T]?: any;
};
type IsPayLoad<T> = T extends [any, infer PayLoad] ? PayLoad : T;
export type ScalarDefinition = Record<string, ScalarResolver>;

type IsScalar<S, SCLR extends ScalarDefinition> = S extends 'scalar' & { name: infer T }
  ? T extends keyof SCLR
    ? SCLR[T]['decode'] extends (s: unknown) => unknown
      ? ReturnType<SCLR[T]['decode']>
      : unknown
    : unknown
  : S extends Array<infer R>
  ? Array<IsScalar<R, SCLR>>
  : S;

type IsArray<T, U, SCLR extends ScalarDefinition> = T extends Array<infer R>
  ? InputType<R, U, SCLR>[]
  : InputType<T, U, SCLR>;
type FlattenArray<T> = T extends Array<infer R> ? R : T;
type BaseZeusResolver = boolean | 1 | string | Variable<any, string>;

type IsInterfaced<SRC extends DeepAnify<DST>, DST, SCLR extends ScalarDefinition> = FlattenArray<SRC> extends
  | ZEUS_INTERFACES
  | ZEUS_UNIONS
  ? {
      [P in keyof SRC]: SRC[P] extends '__union' & infer R
        ? P extends keyof DST
          ? IsArray<R, '__typename' extends keyof DST ? DST[P] & { __typename: true } : DST[P], SCLR>
          : IsArray<R, '__typename' extends keyof DST ? { __typename: true } : Record<string, never>, SCLR>
        : never;
    }[keyof SRC] & {
      [P in keyof Omit<
        Pick<
          SRC,
          {
            [P in keyof DST]: SRC[P] extends '__union' & infer _R ? never : P;
          }[keyof DST]
        >,
        '__typename'
      >]: IsPayLoad<DST[P]> extends BaseZeusResolver ? IsScalar<SRC[P], SCLR> : IsArray<SRC[P], DST[P], SCLR>;
    }
  : {
      [P in keyof Pick<SRC, keyof DST>]: IsPayLoad<DST[P]> extends BaseZeusResolver
        ? IsScalar<SRC[P], SCLR>
        : IsArray<SRC[P], DST[P], SCLR>;
    };

export type MapType<SRC, DST, SCLR extends ScalarDefinition> = SRC extends DeepAnify<DST>
  ? IsInterfaced<SRC, DST, SCLR>
  : never;
// eslint-disable-next-line @typescript-eslint/ban-types
export type InputType<SRC, DST, SCLR extends ScalarDefinition = {}> = IsPayLoad<DST> extends { __alias: infer R }
  ? {
      [P in keyof R]: MapType<SRC, R[P], SCLR>[keyof MapType<SRC, R[P], SCLR>];
    } & MapType<SRC, Omit<IsPayLoad<DST>, '__alias'>, SCLR>
  : MapType<SRC, IsPayLoad<DST>, SCLR>;
export type SubscriptionToGraphQL<Z, T, SCLR extends ScalarDefinition> = {
  ws: WebSocket;
  on: (fn: (args: InputType<T, Z, SCLR>) => void) => void;
  off: (fn: (e: { data?: InputType<T, Z, SCLR>; code?: number; reason?: string; message?: string }) => void) => void;
  error: (fn: (e: { data?: InputType<T, Z, SCLR>; errors?: string[] }) => void) => void;
  open: () => void;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type FromSelector<SELECTOR, NAME extends keyof GraphQLTypes, SCLR extends ScalarDefinition = {}> = InputType<
  GraphQLTypes[NAME],
  SELECTOR,
  SCLR
>;

export type ScalarResolver = {
  encode?: (s: unknown) => string;
  decode?: (s: unknown) => unknown;
};

export type SelectionFunction<V> = <Z extends V>(
  t: Z & {
    [P in keyof Z]: P extends keyof V ? Z[P] : never;
  },
) => Z;

type BuiltInVariableTypes = {
  ['String']: string;
  ['Int']: number;
  ['Float']: number;
  ['Boolean']: boolean;
};
type AllVariableTypes = keyof BuiltInVariableTypes | keyof ZEUS_VARIABLES;
type VariableRequired<T extends string> = `${T}!` | T | `[${T}]` | `[${T}]!` | `[${T}!]` | `[${T}!]!`;
type VR<T extends string> = VariableRequired<VariableRequired<T>>;

export type GraphQLVariableType = VR<AllVariableTypes>;

type ExtractVariableTypeString<T extends string> = T extends VR<infer R1>
  ? R1 extends VR<infer R2>
    ? R2 extends VR<infer R3>
      ? R3 extends VR<infer R4>
        ? R4 extends VR<infer R5>
          ? R5
          : R4
        : R3
      : R2
    : R1
  : T;

type DecomposeType<T, Type> = T extends `[${infer R}]`
  ? Array<DecomposeType<R, Type>> | undefined
  : T extends `${infer R}!`
  ? NonNullable<DecomposeType<R, Type>>
  : Type | undefined;

type ExtractTypeFromGraphQLType<T extends string> = T extends keyof ZEUS_VARIABLES
  ? ZEUS_VARIABLES[T]
  : T extends keyof BuiltInVariableTypes
  ? BuiltInVariableTypes[T]
  : any;

export type GetVariableType<T extends string> = DecomposeType<
  T,
  ExtractTypeFromGraphQLType<ExtractVariableTypeString<T>>
>;

type UndefinedKeys<T> = {
  [K in keyof T]-?: T[K] extends NonNullable<T[K]> ? never : K;
}[keyof T];

type WithNullableKeys<T> = Pick<T, UndefinedKeys<T>>;
type WithNonNullableKeys<T> = Omit<T, UndefinedKeys<T>>;

type OptionalKeys<T> = {
  [P in keyof T]?: T[P];
};

export type WithOptionalNullables<T> = OptionalKeys<WithNullableKeys<T>> & WithNonNullableKeys<T>;

export type ComposableSelector<T extends keyof ValueTypes> = ReturnType<SelectionFunction<ValueTypes[T]>>;

export type Variable<T extends GraphQLVariableType, Name extends string> = {
  ' __zeus_name': Name;
  ' __zeus_type': T;
};

export type ExtractVariablesDeep<Query> = Query extends Variable<infer VType, infer VName>
  ? { [key in VName]: GetVariableType<VType> }
  : Query extends string | number | boolean | Array<string | number | boolean>
  ? // eslint-disable-next-line @typescript-eslint/ban-types
    {}
  : UnionToIntersection<{ [K in keyof Query]: WithOptionalNullables<ExtractVariablesDeep<Query[K]>> }[keyof Query]>;

export type ExtractVariables<Query> = Query extends Variable<infer VType, infer VName>
  ? { [key in VName]: GetVariableType<VType> }
  : Query extends [infer Inputs, infer Outputs]
  ? ExtractVariablesDeep<Inputs> & ExtractVariables<Outputs>
  : Query extends string | number | boolean | Array<string | number | boolean>
  ? // eslint-disable-next-line @typescript-eslint/ban-types
    {}
  : UnionToIntersection<{ [K in keyof Query]: WithOptionalNullables<ExtractVariables<Query[K]>> }[keyof Query]>;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export const START_VAR_NAME = `$ZEUS_VAR`;
export const GRAPHQL_TYPE_SEPARATOR = `__$GRAPHQL__`;

export const $ = <Type extends GraphQLVariableType, Name extends string>(name: Name, graphqlType: Type) => {
  return (START_VAR_NAME + name + GRAPHQL_TYPE_SEPARATOR + graphqlType) as unknown as Variable<Type, Name>;
};
type ZEUS_INTERFACES = never
export type ScalarCoders = {
	DateTime?: ScalarResolver;
	JSON?: ScalarResolver;
	ID?: ScalarResolver;
}
type ZEUS_UNIONS = GraphQLTypes["PaymentMethodData"] | GraphQLTypes["PrivateAccountSearchData"] | GraphQLTypes["UserCertificateUnion"]

export type ValueTypes = {
    ["Account"]: AliasType<{
	/** объект аккаунта в блокчейне содержит системную информацию, такую как публичные ключи доступа, доступные вычислительные ресурсы, информация об установленном смарт-контракте, и т.д. и т.п. Это системный уровень обслуживания, где у каждого пайщика есть аккаунт, но не каждый аккаунт может быть пайщиком в каком-либо кооперативе. Все смарт-контракты устанавливаются и исполняются на этом уровне. */
	blockchain_account?:ValueTypes["BlockchainAccount"],
	/** объект пайщика кооператива в таблице блокчейне, который определяет членство пайщика в конкретном кооперативе. Поскольку MONO обслуживает только один кооператив, то в participant_account обычно содержится информация, которая описывает членство пайщика в этом кооперативе. Этот объект обезличен, публичен, и хранится в блокчейне. */
	participant_account?:ValueTypes["ParticipantAccount"],
	/** объект приватных данных пайщика кооператива. */
	private_account?:ValueTypes["PrivateAccount"],
	/** объект аккаунта в системе учёта провайдера, т.е. MONO. Здесь хранится приватная информация о пайщике кооператива, которая содержит его приватные данные. Эти данные не публикуются в блокчейне и не выходят за пределы базы данных провайдера. Они используются для заполнения шаблонов документов при нажатии соответствующих кнопок на платформе.  */
	provider_account?:ValueTypes["MonoAccount"],
	/** объект пользователя кооперативной экономики содержит в блокчейне информацию о типе аккаунта пайщика, а также, обезличенные публичные данные (хэши) для верификации пайщиков между кооперативами. Этот уровень предназначен для хранения информации пайщика, которая необходима всем кооперативам, но не относится к какому-либо из них конкретно. */
	user_account?:ValueTypes["UserAccount"],
	/** Имя аккаунта кооператива */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on Account']?: Omit<ValueTypes["Account"], "...on Account">
}>;
	["AccountRamDelta"]: AliasType<{
	account?:boolean | `@${string}`,
	delta?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on AccountRamDelta']?: Omit<ValueTypes["AccountRamDelta"], "...on AccountRamDelta">
}>;
	["AccountResourceInfo"]: AliasType<{
	/** Доступные ресурсы */
	available?:boolean | `@${string}`,
	/** Текущее использование ресурсов */
	current_used?:boolean | `@${string}`,
	/** Время последнего обновления использования ресурсов */
	last_usage_update_time?:boolean | `@${string}`,
	/** Максимальное количество ресурсов */
	max?:boolean | `@${string}`,
	/** Использовано ресурсов */
	used?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on AccountResourceInfo']?: Omit<ValueTypes["AccountResourceInfo"], "...on AccountResourceInfo">
}>;
	/** Тип аккаунта пользователя в системе */
["AccountType"]:AccountType;
	["AccountsPaginationResult"]: AliasType<{
	/** Текущая страница */
	currentPage?:boolean | `@${string}`,
	/** Элементы текущей страницы */
	items?:ValueTypes["Account"],
	/** Общее количество элементов */
	totalCount?:boolean | `@${string}`,
	/** Общее количество страниц */
	totalPages?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on AccountsPaginationResult']?: Omit<ValueTypes["AccountsPaginationResult"], "...on AccountsPaginationResult">
}>;
	/** Комплексный объект акта, содержащий полную информацию о сгенерированном и опубликованном документе с его агрегатом */
["ActDetailAggregate"]: AliasType<{
	action?:ValueTypes["ExtendedBlockchainAction"],
	documentAggregate?:ValueTypes["DocumentAggregate"],
		__typename?: boolean | `@${string}`,
	['...on ActDetailAggregate']?: Omit<ValueTypes["ActDetailAggregate"], "...on ActDetailAggregate">
}>;
	["ActionAuthorization"]: AliasType<{
	actor?:boolean | `@${string}`,
	permission?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on ActionAuthorization']?: Omit<ValueTypes["ActionAuthorization"], "...on ActionAuthorization">
}>;
	["ActionReceipt"]: AliasType<{
	abi_sequence?:boolean | `@${string}`,
	act_digest?:boolean | `@${string}`,
	auth_sequence?:ValueTypes["AuthSequence"],
	code_sequence?:boolean | `@${string}`,
	global_sequence?:boolean | `@${string}`,
	receiver?:boolean | `@${string}`,
	recv_sequence?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on ActionReceipt']?: Omit<ValueTypes["ActionReceipt"], "...on ActionReceipt">
}>;
	["AddPaymentMethodInput"]: {
	/** Данные для банковского перевода */
	bank_transfer_data?: ValueTypes["BankAccountInput"] | undefined | null | Variable<any, string>,
	/** Флаг основного метода платежа, который отображается в документах */
	is_default: boolean | Variable<any, string>,
	/** Данные для оплаты через СБП */
	sbp_data?: ValueTypes["SbpDataInput"] | undefined | null | Variable<any, string>,
	/** Имя аккаунта пользователя */
	username: string | Variable<any, string>
};
	["AddTrustedAccountInput"]: {
	/** Имя аккаунта кооперативного участка */
	braname: string | Variable<any, string>,
	/** Имя аккаунта кооператива */
	coopname: string | Variable<any, string>,
	/** Имя аккаунта доверонного лица, который уполномачивается председателем кооперативного участка на совершение действий */
	trusted: string | Variable<any, string>
};
	/** Пункт повестки собрания */
["AgendaMeetPoint"]: AliasType<{
	/** Контекст или дополнительная информация по пункту повестки */
	context?:boolean | `@${string}`,
	/** Предлагаемое решение по пункту повестки */
	decision?:boolean | `@${string}`,
	/** Заголовок пункта повестки */
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on AgendaMeetPoint']?: Omit<ValueTypes["AgendaMeetPoint"], "...on AgendaMeetPoint">
}>;
	/** Соглашение пользователя с кооперативом */
["Agreement"]: AliasType<{
	/** Дата создания записи */
	_created_at?:boolean | `@${string}`,
	/** Внутренний ID базы данных */
	_id?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	_updated_at?:boolean | `@${string}`,
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?:boolean | `@${string}`,
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** Документ соглашения */
	document?:ValueTypes["DocumentAggregate"],
	/** ID черновика */
	draft_id?:boolean | `@${string}`,
	/** ID соглашения в блокчейне */
	id?:boolean | `@${string}`,
	/** Флаг присутствия записи в блокчейне */
	present?:boolean | `@${string}`,
	/** ID программы */
	program_id?:boolean | `@${string}`,
	/** Статус соглашения */
	status?:boolean | `@${string}`,
	/** Тип соглашения */
	type?:boolean | `@${string}`,
	/** Дата последнего обновления в блокчейне */
	updated_at?:boolean | `@${string}`,
	/** Имя пользователя, создавшего соглашение */
	username?:boolean | `@${string}`,
	/** Версия соглашения */
	version?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on Agreement']?: Omit<ValueTypes["Agreement"], "...on Agreement">
}>;
	["AgreementInput"]: {
	protocol_day_month_year: string | Variable<any, string>,
	protocol_number: string | Variable<any, string>
};
	/** Статус соглашения в системе кооператива */
["AgreementStatus"]:AgreementStatus;
	["AgreementVar"]: AliasType<{
	protocol_day_month_year?:boolean | `@${string}`,
	protocol_number?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on AgreementVar']?: Omit<ValueTypes["AgreementVar"], "...on AgreementVar">
}>;
	["AgreementVarInput"]: {
	protocol_day_month_year: string | Variable<any, string>,
	protocol_number: string | Variable<any, string>
};
	/** Одобрение документа председателем совета */
["Approval"]: AliasType<{
	/** Дата создания записи */
	_created_at?:boolean | `@${string}`,
	/** Внутренний ID базы данных */
	_id?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	_updated_at?:boolean | `@${string}`,
	/** Хеш одобрения для идентификации */
	approval_hash?:boolean | `@${string}`,
	/** Одобренный документ (заполняется при подтверждении одобрения) */
	approved_document?:ValueTypes["DocumentAggregate"],
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?:boolean | `@${string}`,
	/** Действие обратного вызова при одобрении */
	callback_action_approve?:boolean | `@${string}`,
	/** Действие обратного вызова при отклонении */
	callback_action_decline?:boolean | `@${string}`,
	/** Контракт обратного вызова для обработки результата */
	callback_contract?:boolean | `@${string}`,
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** Дата создания одобрения */
	created_at?:boolean | `@${string}`,
	/** Документ, требующий одобрения */
	document?:ValueTypes["DocumentAggregate"],
	/** ID одобрения в блокчейне */
	id?:boolean | `@${string}`,
	/** Метаданные одобрения в формате JSON */
	meta?:boolean | `@${string}`,
	/** Флаг присутствия записи в блокчейне */
	present?:boolean | `@${string}`,
	/** Статус одобрения */
	status?:boolean | `@${string}`,
	/** Имя пользователя, запросившего одобрение */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on Approval']?: Omit<ValueTypes["Approval"], "...on Approval">
}>;
	/** Статус одобрения в системе CHAIRMAN */
["ApprovalStatus"]:ApprovalStatus;
	["AuthSequence"]: AliasType<{
	account?:boolean | `@${string}`,
	sequence?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on AuthSequence']?: Omit<ValueTypes["AuthSequence"], "...on AuthSequence">
}>;
	["Authority"]: AliasType<{
	/** Уровни разрешений */
	accounts?:ValueTypes["PermissionLevelWeight"],
	/** Ключи */
	keys?:ValueTypes["KeyWeight"],
	/** Порог */
	threshold?:boolean | `@${string}`,
	/** Вес ожидания */
	waits?:ValueTypes["WaitWeight"],
		__typename?: boolean | `@${string}`,
	['...on Authority']?: Omit<ValueTypes["Authority"], "...on Authority">
}>;
	["BankAccount"]: AliasType<{
	/** Номер банковского счета */
	account_number?:boolean | `@${string}`,
	/** Название банка */
	bank_name?:boolean | `@${string}`,
	/** Номер карты */
	card_number?:boolean | `@${string}`,
	/** Валюта счета */
	currency?:boolean | `@${string}`,
	/** Детали счета */
	details?:ValueTypes["BankAccountDetails"],
		__typename?: boolean | `@${string}`,
	['...on BankAccount']?: Omit<ValueTypes["BankAccount"], "...on BankAccount">
}>;
	["BankAccountDetails"]: AliasType<{
	/** БИК банка */
	bik?:boolean | `@${string}`,
	/** Корреспондентский счет */
	corr?:boolean | `@${string}`,
	/** КПП банка */
	kpp?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on BankAccountDetails']?: Omit<ValueTypes["BankAccountDetails"], "...on BankAccountDetails">
}>;
	["BankAccountDetailsInput"]: {
	/** БИК банка */
	bik: string | Variable<any, string>,
	/** Корреспондентский счет */
	corr: string | Variable<any, string>,
	/** КПП банка */
	kpp: string | Variable<any, string>
};
	["BankAccountInput"]: {
	/** Номер банковского счета */
	account_number: string | Variable<any, string>,
	/** Название банка */
	bank_name: string | Variable<any, string>,
	/** Номер карты */
	card_number?: string | undefined | null | Variable<any, string>,
	/** Валюта счета */
	currency: string | Variable<any, string>,
	/** Детали счета */
	details: ValueTypes["BankAccountDetailsInput"] | Variable<any, string>
};
	["BankPaymentMethod"]: AliasType<{
	/** Дата создания */
	created_at?:boolean | `@${string}`,
	/** Данные метода оплаты */
	data?:ValueTypes["BankAccount"],
	/** Флаг основного метода платежа, который отображается в документах */
	is_default?:boolean | `@${string}`,
	/** Идентификатор метода оплаты */
	method_id?:boolean | `@${string}`,
	/** Тип метода оплаты */
	method_type?:boolean | `@${string}`,
	/** Дата обновления */
	updated_at?:boolean | `@${string}`,
	/** Имя пользователя, к которому привязан метод оплаты */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on BankPaymentMethod']?: Omit<ValueTypes["BankPaymentMethod"], "...on BankPaymentMethod">
}>;
	/** Базовый проект в системе CAPITAL */
["BaseCapitalProject"]: AliasType<{
	/** Дата создания записи */
	_created_at?:boolean | `@${string}`,
	/** Внутренний ID базы данных */
	_id?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	_updated_at?:boolean | `@${string}`,
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?:boolean | `@${string}`,
	/** Статус из блокчейна */
	blockchain_status?:boolean | `@${string}`,
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** Счетчики участников проекта */
	counts?:ValueTypes["CapitalProjectCountsData"],
	/** Дата создания */
	created_at?:boolean | `@${string}`,
	/** Данные CRPS для распределения наград проекта */
	crps?:ValueTypes["CapitalProjectCrpsData"],
	/** Данные/шаблон проекта */
	data?:boolean | `@${string}`,
	/** Описание проекта */
	description?:boolean | `@${string}`,
	/** Фактические показатели проекта */
	fact?:ValueTypes["CapitalProjectFactPool"],
	/** ID в блокчейне */
	id?:boolean | `@${string}`,
	/** Приглашение к проекту */
	invite?:boolean | `@${string}`,
	/** Открыт ли проект */
	is_opened?:boolean | `@${string}`,
	/** Запланирован ли проект */
	is_planed?:boolean | `@${string}`,
	/** Счетчик задач проекта */
	issue_counter?:boolean | `@${string}`,
	/** Мастер проекта */
	master?:boolean | `@${string}`,
	/** Мета-информация проекта */
	meta?:boolean | `@${string}`,
	/** Хеш родительского проекта */
	parent_hash?:boolean | `@${string}`,
	/** Название родительского проекта */
	parent_title?:boolean | `@${string}`,
	/** Права доступа текущего пользователя к проекту */
	permissions?:ValueTypes["CapitalProjectPermissions"],
	/** Плановые показатели проекта */
	plan?:ValueTypes["CapitalProjectPlanPool"],
	/** Префикс проекта */
	prefix?:boolean | `@${string}`,
	/** Флаг присутствия записи в блокчейне */
	present?:boolean | `@${string}`,
	/** Хеш проекта */
	project_hash?:boolean | `@${string}`,
	/** Статус проекта */
	status?:boolean | `@${string}`,
	/** Название проекта */
	title?:boolean | `@${string}`,
	/** Данные голосования по методу Водянова */
	voting?:ValueTypes["CapitalProjectVotingData"],
		__typename?: boolean | `@${string}`,
	['...on BaseCapitalProject']?: Omit<ValueTypes["BaseCapitalProject"], "...on BaseCapitalProject">
}>;
	["BlockchainAccount"]: AliasType<{
	/** Имя аккаунта */
	account_name?:boolean | `@${string}`,
	/** Баланс */
	core_liquid_balance?:boolean | `@${string}`,
	/** Ограничения CPU */
	cpu_limit?:ValueTypes["AccountResourceInfo"],
	/** Вес CPU */
	cpu_weight?:boolean | `@${string}`,
	/** Дата создания */
	created?:boolean | `@${string}`,
	/** Номер последнего блока */
	head_block_num?:boolean | `@${string}`,
	/** Время последнего блока */
	head_block_time?:boolean | `@${string}`,
	/** Время последнего обновления кода */
	last_code_update?:boolean | `@${string}`,
	/** Ограничения сети */
	net_limit?:ValueTypes["AccountResourceInfo"],
	/** Вес сети */
	net_weight?:boolean | `@${string}`,
	/** Разрешения */
	permissions?:ValueTypes["Permission"],
	/** Флаг привилегий */
	privileged?:boolean | `@${string}`,
	/** Квота RAM */
	ram_quota?:boolean | `@${string}`,
	/** Использование RAM */
	ram_usage?:boolean | `@${string}`,
	/** Запрос на возврат */
	refund_request?:ValueTypes["RefundRequest"],
	/** Информация о REX */
	rex_info?:boolean | `@${string}`,
	/** Делегированные ресурсы */
	self_delegated_bandwidth?:ValueTypes["ResourceDelegationDTO"],
	/** Общий обзор ресурсов */
	total_resources?:ValueTypes["ResourceOverview"],
	/** Информация о голосовании */
	voter_info?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on BlockchainAccount']?: Omit<ValueTypes["BlockchainAccount"], "...on BlockchainAccount">
}>;
	/** Объект действия в блокчейне */
["BlockchainAction"]: AliasType<{
	account?:boolean | `@${string}`,
	account_ram_deltas?:ValueTypes["AccountRamDelta"],
	action_ordinal?:boolean | `@${string}`,
	authorization?:ValueTypes["ActionAuthorization"],
	block_id?:boolean | `@${string}`,
	block_num?:boolean | `@${string}`,
	chain_id?:boolean | `@${string}`,
	console?:boolean | `@${string}`,
	context_free?:boolean | `@${string}`,
	creator_action_ordinal?:boolean | `@${string}`,
	/** Данные действия в формате JSON */
	data?:boolean | `@${string}`,
	elapsed?:boolean | `@${string}`,
	global_sequence?:boolean | `@${string}`,
	name?:boolean | `@${string}`,
	receipt?:ValueTypes["ActionReceipt"],
	receiver?:boolean | `@${string}`,
	transaction_id?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on BlockchainAction']?: Omit<ValueTypes["BlockchainAction"], "...on BlockchainAction">
}>;
	/** Запись в таблице блокчейна о процессе принятия решения советом кооператива */
["BlockchainDecision"]: AliasType<{
	approved?:boolean | `@${string}`,
	authorization?:ValueTypes["SignedBlockchainDocument"],
	authorized?:boolean | `@${string}`,
	authorized_by?:boolean | `@${string}`,
	batch_id?:boolean | `@${string}`,
	callback_contract?:boolean | `@${string}`,
	confirm_callback?:boolean | `@${string}`,
	coopname?:boolean | `@${string}`,
	created_at?:boolean | `@${string}`,
	decline_callback?:boolean | `@${string}`,
	expired_at?:boolean | `@${string}`,
	hash?:boolean | `@${string}`,
	id?:boolean | `@${string}`,
	meta?:boolean | `@${string}`,
	statement?:ValueTypes["SignedBlockchainDocument"],
	type?:boolean | `@${string}`,
	username?:boolean | `@${string}`,
	/** Сертификат пользователя, создавшего решение */
	username_certificate?:ValueTypes["UserCertificateUnion"],
	validated?:boolean | `@${string}`,
	votes_against?:boolean | `@${string}`,
	/** Сертификаты пользователей, голосовавших "против" */
	votes_against_certificates?:ValueTypes["UserCertificateUnion"],
	votes_for?:boolean | `@${string}`,
	/** Сертификаты пользователей, голосовавших "за" */
	votes_for_certificates?:ValueTypes["UserCertificateUnion"],
		__typename?: boolean | `@${string}`,
	['...on BlockchainDecision']?: Omit<ValueTypes["BlockchainDecision"], "...on BlockchainDecision">
}>;
	/** Информация о состоянии блокчейна */
["BlockchainInfoDTO"]: AliasType<{
	/** Лимит CPU для блока */
	block_cpu_limit?:boolean | `@${string}`,
	/** Лимит сети для блока */
	block_net_limit?:boolean | `@${string}`,
	/** Идентификатор цепочки (chain ID) */
	chain_id?:boolean | `@${string}`,
	/** Идентификатор головного блока в форк базе данных */
	fork_db_head_block_id?:boolean | `@${string}`,
	/** Номер головного блока в форк базе данных */
	fork_db_head_block_num?:boolean | `@${string}`,
	/** Идентификатор головного блока */
	head_block_id?:boolean | `@${string}`,
	/** Номер головного блока */
	head_block_num?:boolean | `@${string}`,
	/** Прозводитель головного блока */
	head_block_producer?:boolean | `@${string}`,
	/** Время головного блока */
	head_block_time?:boolean | `@${string}`,
	/** Идентификатор последнего необратимого блока */
	last_irreversible_block_id?:boolean | `@${string}`,
	/** Номер последнего необратимого блока */
	last_irreversible_block_num?:boolean | `@${string}`,
	/** Время последнего необратимого блока */
	last_irreversible_block_time?:boolean | `@${string}`,
	/** Версия сервера */
	server_version?:boolean | `@${string}`,
	/** Строковое представление версии сервера */
	server_version_string?:boolean | `@${string}`,
	/** Виртуальный лимит CPU для блока */
	virtual_block_cpu_limit?:boolean | `@${string}`,
	/** Виртуальный лимит сети для блока */
	virtual_block_net_limit?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on BlockchainInfoDTO']?: Omit<ValueTypes["BlockchainInfoDTO"], "...on BlockchainInfoDTO">
}>;
	["BoardMember"]: AliasType<{
	/** Имя */
	first_name?:boolean | `@${string}`,
	/** Флаг председателя совета */
	is_chairman?:boolean | `@${string}`,
	/** Фамилия */
	last_name?:boolean | `@${string}`,
	/** Отчество */
	middle_name?:boolean | `@${string}`,
	/** Имя пользователя (username) */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on BoardMember']?: Omit<ValueTypes["BoardMember"], "...on BoardMember">
}>;
	["Branch"]: AliasType<{
	/** Банковский счёт */
	bank_account?:ValueTypes["BankPaymentMethod"],
	/** Уникальное имя кооперативного участка */
	braname?:boolean | `@${string}`,
	/** Город */
	city?:boolean | `@${string}`,
	/** Имя аккаунта кооператива */
	coopname?:boolean | `@${string}`,
	/** Страна */
	country?:boolean | `@${string}`,
	/** Детали организации */
	details?:ValueTypes["OrganizationDetails"],
	/** Email */
	email?:boolean | `@${string}`,
	/** Фактический адрес */
	fact_address?:boolean | `@${string}`,
	/** Полный адрес */
	full_address?:boolean | `@${string}`,
	/** Полное название организации */
	full_name?:boolean | `@${string}`,
	/** Телефон */
	phone?:boolean | `@${string}`,
	/** Представитель организации */
	represented_by?:ValueTypes["RepresentedBy"],
	/** Краткое название организации */
	short_name?:boolean | `@${string}`,
	/** Доверенные аккаунты

Требуемые роли: chairman, member.  */
	trusted?:ValueTypes["Individual"],
	/** Председатель кооперативного участка

Требуемые роли: chairman, member.  */
	trustee?:ValueTypes["Individual"],
	/** Тип организации */
	type?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on Branch']?: Omit<ValueTypes["Branch"], "...on Branch">
}>;
	["CallTranscription"]: AliasType<{
	createdAt?:boolean | `@${string}`,
	endedAt?:boolean | `@${string}`,
	id?:boolean | `@${string}`,
	matrixRoomId?:boolean | `@${string}`,
	/** Пользовательская заметка о содержании звонка */
	memo?:boolean | `@${string}`,
	/** Отображаемые имена участников (Synapse displayname); в БД хранятся канонические Matrix user id */
	participants?:boolean | `@${string}`,
	roomId?:boolean | `@${string}`,
	roomName?:boolean | `@${string}`,
	startedAt?:boolean | `@${string}`,
	status?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on CallTranscription']?: Omit<ValueTypes["CallTranscription"], "...on CallTranscription">
}>;
	["Candidate"]: AliasType<{
	braname?:boolean | `@${string}`,
	coopname?:boolean | `@${string}`,
	created_at?:boolean | `@${string}`,
	program_key?:boolean | `@${string}`,
	public_key?:boolean | `@${string}`,
	referer?:boolean | `@${string}`,
	referer_display_name?:boolean | `@${string}`,
	registered_at?:boolean | `@${string}`,
	status?:boolean | `@${string}`,
	type?:boolean | `@${string}`,
	username?:boolean | `@${string}`,
	username_display_name?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on Candidate']?: Omit<ValueTypes["Candidate"], "...on Candidate">
}>;
	["CandidateStatus"]:CandidateStatus;
	["CapitalCandidate"]: AliasType<{
	about?:boolean | `@${string}`,
	braname?:boolean | `@${string}`,
	capital_status?:boolean | `@${string}`,
	contributed_as_author?:boolean | `@${string}`,
	contributed_as_contributor?:boolean | `@${string}`,
	contributed_as_coordinator?:boolean | `@${string}`,
	contributed_as_creator?:boolean | `@${string}`,
	contributed_as_investor?:boolean | `@${string}`,
	contributed_as_propertor?:boolean | `@${string}`,
	contributor_hash?:boolean | `@${string}`,
	coopname?:boolean | `@${string}`,
	created_at?:boolean | `@${string}`,
	hours_per_day?:boolean | `@${string}`,
	level?:boolean | `@${string}`,
	memo?:boolean | `@${string}`,
	program_key?:boolean | `@${string}`,
	public_key?:boolean | `@${string}`,
	rate_per_hour?:boolean | `@${string}`,
	referer?:boolean | `@${string}`,
	referer_display_name?:boolean | `@${string}`,
	registered_at?:boolean | `@${string}`,
	status?:boolean | `@${string}`,
	type?:boolean | `@${string}`,
	username?:boolean | `@${string}`,
	username_display_name?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on CapitalCandidate']?: Omit<ValueTypes["CapitalCandidate"], "...on CapitalCandidate">
}>;
	/** Коммит в системе CAPITAL */
["CapitalCommit"]: AliasType<{
	/** Дата создания записи */
	_created_at?:boolean | `@${string}`,
	/** Внутренний ID базы данных */
	_id?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	_updated_at?:boolean | `@${string}`,
	/** Данные amounts коммита */
	amounts?:ValueTypes["CapitalCommitAmounts"],
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?:boolean | `@${string}`,
	/** Статус из блокчейна */
	blockchain_status?:boolean | `@${string}`,
	/** Хеш коммита */
	commit_hash?:boolean | `@${string}`,
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** Дата создания */
	created_at?:boolean | `@${string}`,
	/** Обогащенные данные коммита (diff-патч, исходная ссылка и т.д.) */
	data?:boolean | `@${string}`,
	/** Описание коммита */
	description?:boolean | `@${string}`,
	/** Отображаемое имя пользователя */
	display_name?:boolean | `@${string}`,
	/** ID в блокчейне */
	id?:boolean | `@${string}`,
	/** Метаданные коммита */
	meta?:boolean | `@${string}`,
	/** Флаг присутствия записи в блокчейне */
	present?:boolean | `@${string}`,
	/** Проект, к которому относится коммит */
	project?:ValueTypes["BaseCapitalProject"],
	/** Хеш проекта */
	project_hash?:boolean | `@${string}`,
	/** Статус коммита */
	status?:boolean | `@${string}`,
	/** Имя пользователя */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on CapitalCommit']?: Omit<ValueTypes["CapitalCommit"], "...on CapitalCommit">
}>;
	/** Данные amounts коммита */
["CapitalCommitAmounts"]: AliasType<{
	/** Базовый пул авторов */
	authors_base_pool?:boolean | `@${string}`,
	/** Бонусный пул авторов */
	authors_bonus_pool?:boolean | `@${string}`,
	/** Бонусный пул участников */
	contributors_bonus_pool?:boolean | `@${string}`,
	/** Базовый пул создателей */
	creators_base_pool?:boolean | `@${string}`,
	/** Бонусный пул создателей */
	creators_bonus_pool?:boolean | `@${string}`,
	/** Часы создателей */
	creators_hours?:boolean | `@${string}`,
	/** Стоимость часа работы */
	hour_cost?:boolean | `@${string}`,
	/** Общий объем вклада */
	total_contribution?:boolean | `@${string}`,
	/** Общий генерационный пул */
	total_generation_pool?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on CapitalCommitAmounts']?: Omit<ValueTypes["CapitalCommitAmounts"], "...on CapitalCommitAmounts">
}>;
	/** Конфигурация CAPITAL контракта кооператива */
["CapitalConfigObject"]: AliasType<{
	/** Процент голосования авторов */
	authors_voting_percent?:boolean | `@${string}`,
	/** Процент бонуса координатора */
	coordinator_bonus_percent?:boolean | `@${string}`,
	/** Срок действия приглашения координатора в днях */
	coordinator_invite_validity_days?:boolean | `@${string}`,
	/** Процент голосования создателей */
	creators_voting_percent?:boolean | `@${string}`,
	/** Скорость убывания энергии в день */
	energy_decay_rate_per_day?:boolean | `@${string}`,
	/** Коэффициент получения энергии */
	energy_gain_coefficient?:boolean | `@${string}`,
	/** Процент расходов */
	expense_pool_percent?:boolean | `@${string}`,
	/** Базовая глубина уровня */
	level_depth_base?:boolean | `@${string}`,
	/** Коэффициент роста уровня */
	level_growth_coefficient?:boolean | `@${string}`,
	/** Период голосования в днях */
	voting_period_in_days?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on CapitalConfigObject']?: Omit<ValueTypes["CapitalConfigObject"], "...on CapitalConfigObject">
}>;
	/** Участник кооператива в системе CAPITAL */
["CapitalContributor"]: AliasType<{
	/** Дата создания записи */
	_created_at?:boolean | `@${string}`,
	/** Внутренний ID базы данных */
	_id?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	_updated_at?:boolean | `@${string}`,
	/** О себе */
	about?:boolean | `@${string}`,
	/** Приложения к контракту */
	appendixes?:boolean | `@${string}`,
	/** Хеш соглашения Благорост */
	blagorost_agreement_hash?:boolean | `@${string}`,
	/** Хеш оферты Благорост */
	blagorost_offer_hash?:boolean | `@${string}`,
	/** Программный кошелек в программе Blagorost */
	blagorost_wallet?:ValueTypes["ProgramWallet"],
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?:boolean | `@${string}`,
	/** Статус из блокчейна */
	blockchain_status?:boolean | `@${string}`,
	/** Контракт участника */
	contract?:ValueTypes["DocumentAggregate"],
	/** Вклад как автор */
	contributed_as_author?:boolean | `@${string}`,
	/** Вклад как участник */
	contributed_as_contributor?:boolean | `@${string}`,
	/** Вклад как координатор */
	contributed_as_coordinator?:boolean | `@${string}`,
	/** Вклад как исполнитель */
	contributed_as_creator?:boolean | `@${string}`,
	/** Вклад как инвестор */
	contributed_as_investor?:boolean | `@${string}`,
	/** Вклад как собственник имущества */
	contributed_as_propertor?:boolean | `@${string}`,
	/** Хеш участника */
	contributor_hash?:boolean | `@${string}`,
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** Дата создания */
	created_at?:boolean | `@${string}`,
	/** Сумма долга */
	debt_amount?:boolean | `@${string}`,
	/** Отображаемое имя */
	display_name?:boolean | `@${string}`,
	/** Параметры документов участника из UData (номера и даты) */
	document_parameters?:ValueTypes["ContributorDocumentParameters"],
	/** Энергия участника */
	energy?:boolean | `@${string}`,
	/** Хеш договора УХД */
	generation_contract_hash?:boolean | `@${string}`,
	/** Программный кошелек в программе Generation */
	generation_wallet?:ValueTypes["ProgramWallet"],
	/** Хеш оферты Генератор */
	generator_offer_hash?:boolean | `@${string}`,
	/** Часов в день */
	hours_per_day?:boolean | `@${string}`,
	/** ID в блокчейне */
	id?:boolean | `@${string}`,
	/** Соглашение Благорост предоставлено при импорте (внешний документ) */
	is_external_blagorost_agreement?:boolean | `@${string}`,
	/** Является ли внешним контрактом */
	is_external_contract?:boolean | `@${string}`,
	/** Последнее обновление энергии */
	last_energy_update?:boolean | `@${string}`,
	/** Уровень участника */
	level?:boolean | `@${string}`,
	/** Программный кошелек в программе Main */
	main_wallet?:ValueTypes["ProgramWallet"],
	/** Мемо/комментарий */
	memo?:boolean | `@${string}`,
	/** Флаг присутствия записи в блокчейне */
	present?:boolean | `@${string}`,
	/** Ключ выбранной программы регистрации (generation, capitalization) */
	program_key?:boolean | `@${string}`,
	/** Ставка за час работы */
	rate_per_hour?:boolean | `@${string}`,
	/** Статус участника */
	status?:boolean | `@${string}`,
	/** Хеш соглашения о хранении имущества */
	storage_agreement_hash?:boolean | `@${string}`,
	/** Имя пользователя */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on CapitalContributor']?: Omit<ValueTypes["CapitalContributor"], "...on CapitalContributor">
}>;
	/** Цикл разработки в системе CAPITAL */
["CapitalCycle"]: AliasType<{
	/** Дата создания записи */
	_created_at?:boolean | `@${string}`,
	/** Внутренний ID базы данных */
	_id?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	_updated_at?:boolean | `@${string}`,
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?:boolean | `@${string}`,
	/** Дата окончания */
	end_date?:boolean | `@${string}`,
	/** Название цикла */
	name?:boolean | `@${string}`,
	/** Флаг присутствия записи в блокчейне */
	present?:boolean | `@${string}`,
	/** Дата начала */
	start_date?:boolean | `@${string}`,
	/** Статус цикла */
	status?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on CapitalCycle']?: Omit<ValueTypes["CapitalCycle"], "...on CapitalCycle">
}>;
	/** Долг в системе CAPITAL */
["CapitalDebt"]: AliasType<{
	/** Дата создания записи */
	_created_at?:boolean | `@${string}`,
	/** Внутренний ID базы данных */
	_id?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	_updated_at?:boolean | `@${string}`,
	/** Сумма долга */
	amount?:boolean | `@${string}`,
	/** Одобренное заявление */
	approved_statement?:ValueTypes["DocumentAggregate"],
	/** Протокол решения совета */
	authorization?:ValueTypes["DocumentAggregate"],
	/** Номер блока последнего обновления */
	block_num?:boolean | `@${string}`,
	/** Статус из блокчейна */
	blockchain_status?:boolean | `@${string}`,
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** Хеш долга */
	debt_hash?:boolean | `@${string}`,
	/** ID в блокчейне */
	id?:boolean | `@${string}`,
	/** Мемо/комментарий */
	memo?:boolean | `@${string}`,
	/** Существует ли запись в блокчейне */
	present?:boolean | `@${string}`,
	/** Хеш проекта */
	project_hash?:boolean | `@${string}`,
	/** Дата погашения */
	repaid_at?:boolean | `@${string}`,
	/** Заявление на получение ссуды */
	statement?:ValueTypes["DocumentAggregate"],
	/** Статус долга */
	status?:boolean | `@${string}`,
	/** Имя пользователя */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on CapitalDebt']?: Omit<ValueTypes["CapitalDebt"], "...on CapitalDebt">
}>;
	/** Расход в системе CAPITAL */
["CapitalExpense"]: AliasType<{
	/** Дата создания записи */
	_created_at?:boolean | `@${string}`,
	/** Внутренний ID базы данных */
	_id?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	_updated_at?:boolean | `@${string}`,
	/** Сумма расхода */
	amount?:boolean | `@${string}`,
	/** Одобренная записка */
	approved_statement?:ValueTypes["DocumentAggregate"],
	/** Авторизация расхода */
	authorization?:ValueTypes["DocumentAggregate"],
	/** Номер блока последнего обновления */
	block_num?:boolean | `@${string}`,
	/** Статус из блокчейна */
	blockchain_status?:boolean | `@${string}`,
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** Описание расхода */
	description?:boolean | `@${string}`,
	/** Хеш расхода */
	expense_hash?:boolean | `@${string}`,
	/** Служебная записка о расходе */
	expense_statement?:ValueTypes["DocumentAggregate"],
	/** ID фонда */
	fund_id?:boolean | `@${string}`,
	/** ID в блокчейне */
	id?:boolean | `@${string}`,
	/** Существует ли запись в блокчейне */
	present?:boolean | `@${string}`,
	/** Хеш проекта */
	project_hash?:boolean | `@${string}`,
	/** Дата расхода */
	spended_at?:boolean | `@${string}`,
	/** Статус расхода */
	status?:boolean | `@${string}`,
	/** Имя пользователя */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on CapitalExpense']?: Omit<ValueTypes["CapitalExpense"], "...on CapitalExpense">
}>;
	/** Инвестиция в системе CAPITAL */
["CapitalInvest"]: AliasType<{
	/** Дата создания записи */
	_created_at?:boolean | `@${string}`,
	/** Внутренний ID базы данных */
	_id?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	_updated_at?:boolean | `@${string}`,
	/** Сумма инвестиции */
	amount?:boolean | `@${string}`,
	/** Номер блока последнего обновления */
	block_num?:boolean | `@${string}`,
	/** Статус из блокчейна */
	blockchain_status?:boolean | `@${string}`,
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** Координатор */
	coordinator?:boolean | `@${string}`,
	/** Сумма координатора */
	coordinator_amount?:boolean | `@${string}`,
	/** ID в блокчейне */
	id?:boolean | `@${string}`,
	/** Хеш инвестиции */
	invest_hash?:boolean | `@${string}`,
	/** Дата инвестирования */
	invested_at?:boolean | `@${string}`,
	/** Существует ли запись в блокчейне */
	present?:boolean | `@${string}`,
	/** Хеш проекта */
	project_hash?:boolean | `@${string}`,
	/** Заявление */
	statement?:boolean | `@${string}`,
	/** Статус инвестиции */
	status?:boolean | `@${string}`,
	/** Имя пользователя */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on CapitalInvest']?: Omit<ValueTypes["CapitalInvest"], "...on CapitalInvest">
}>;
	/** Задача в системе CAPITAL */
["CapitalIssue"]: AliasType<{
	/** Дата создания записи */
	_created_at?:boolean | `@${string}`,
	/** Внутренний ID базы данных */
	_id?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	_updated_at?:boolean | `@${string}`,
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?:boolean | `@${string}`,
	/** Имя пользователя, создавшего задачу */
	created_by?:boolean | `@${string}`,
	/** Массив имен пользователей создателей (contributors) */
	creators?:boolean | `@${string}`,
	/** ID цикла */
	cycle_id?:boolean | `@${string}`,
	/** Описание задачи */
	description?:boolean | `@${string}`,
	/** Оценка в часах (допускаются дроби, например 1.5) */
	estimate?:boolean | `@${string}`,
	/** Уникальный ID задачи в формате PREFIX-N (например, ABC-1) */
	id?:boolean | `@${string}`,
	/** Хеш задачи */
	issue_hash?:boolean | `@${string}`,
	/** Метаданные задачи */
	metadata?:boolean | `@${string}`,
	/** Права доступа текущего пользователя к задаче */
	permissions?:ValueTypes["CapitalIssuePermissions"],
	/** Флаг присутствия записи в блокчейне */
	present?:boolean | `@${string}`,
	/** Приоритет задачи */
	priority?:boolean | `@${string}`,
	/** Хеш проекта */
	project_hash?:boolean | `@${string}`,
	/** Порядок сортировки */
	sort_order?:boolean | `@${string}`,
	/** Статус задачи */
	status?:boolean | `@${string}`,
	/** Имя пользователя ответственного (contributor) */
	submaster?:boolean | `@${string}`,
	/** Название задачи */
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on CapitalIssue']?: Omit<ValueTypes["CapitalIssue"], "...on CapitalIssue">
}>;
	/** Права доступа пользователя к задаче */
["CapitalIssuePermissions"]: AliasType<{
	/** Список допустимых статусов для перехода */
	allowed_status_transitions?:boolean | `@${string}`,
	/** Может ли назначать исполнителей задачи */
	can_assign_creator?:boolean | `@${string}`,
	/** Может ли изменять статусы задачи */
	can_change_status?:boolean | `@${string}`,
	/** Может ли выполнять требования к задаче */
	can_complete_requirement?:boolean | `@${string}`,
	/** Может ли создавать требования к задаче */
	can_create_requirement?:boolean | `@${string}`,
	/** Может ли удалить задачу */
	can_delete_issue?:boolean | `@${string}`,
	/** Может ли удалять требования к задаче */
	can_delete_requirement?:boolean | `@${string}`,
	/** Может ли редактировать задачу (название, описание, приоритет и т.д.) */
	can_edit_issue?:boolean | `@${string}`,
	/** Может ли устанавливать статус DONE (выполнена) */
	can_set_done?:boolean | `@${string}`,
	/** Может ли устанавливать оценку (estimate) задачи */
	can_set_estimate?:boolean | `@${string}`,
	/** Может ли устанавливать статус ON_REVIEW (на проверке) */
	can_set_on_review?:boolean | `@${string}`,
	/** Может ли устанавливать приоритет задачи */
	can_set_priority?:boolean | `@${string}`,
	/** Имеет ли подтвержденное приложение для проекта */
	has_clearance?:boolean | `@${string}`,
	/** Является ли пользователь гостем (неавторизованным) */
	is_guest?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on CapitalIssuePermissions']?: Omit<ValueTypes["CapitalIssuePermissions"], "...on CapitalIssuePermissions">
}>;
	/** Запись лога событий в системе капитала */
["CapitalLog"]: AliasType<{
	/** Внутренний идентификатор */
	_id?:boolean | `@${string}`,
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** Дата создания записи */
	created_at?:boolean | `@${string}`,
	/** ID сущности */
	entity_id?:boolean | `@${string}`,
	/** Тип сущности к которой относится событие */
	entity_type?:boolean | `@${string}`,
	/** Тип события */
	event_type?:boolean | `@${string}`,
	/** Инициатор действия (username) */
	initiator?:boolean | `@${string}`,
	/** Текстовое описание события */
	message?:boolean | `@${string}`,
	/** Вспомогательные данные */
	metadata?:boolean | `@${string}`,
	/** Хеш проекта или компонента */
	project_hash?:boolean | `@${string}`,
	/** Идентификатор-ссылка (invest_hash, commit_hash, result_hash и т.д.) */
	reference_id?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on CapitalLog']?: Omit<ValueTypes["CapitalLog"], "...on CapitalLog">
}>;
	/** Фильтр для поиска логов событий */
["CapitalLogFilterInput"]: {
	/** Название кооператива */
	coopname?: string | undefined | null | Variable<any, string>,
	/** Период с */
	date_from?: ValueTypes["DateTime"] | undefined | null | Variable<any, string>,
	/** Период по */
	date_to?: ValueTypes["DateTime"] | undefined | null | Variable<any, string>,
	/** Типы событий для фильтрации */
	event_types?: Array<ValueTypes["LogEventType"]> | undefined | null | Variable<any, string>,
	/** Инициатор действия (username) */
	initiator?: string | undefined | null | Variable<any, string>,
	/** Хеш задачи */
	issue_hash?: string | undefined | null | Variable<any, string>,
	/** Хеш проекта или компонента */
	project_hash?: string | undefined | null | Variable<any, string>,
	/** Включать логи дочерних компонентов при фильтрации по project_hash */
	show_components_logs?: boolean | undefined | null | Variable<any, string>,
	/** Показывать логи по задачам */
	show_issue_logs?: boolean | undefined | null | Variable<any, string>
};
	/** Программная инвестиция в системе CAPITAL */
["CapitalProgramInvest"]: AliasType<{
	/** Дата создания записи */
	_created_at?:boolean | `@${string}`,
	/** Внутренний ID базы данных */
	_id?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	_updated_at?:boolean | `@${string}`,
	/** Сумма инвестиции */
	amount?:boolean | `@${string}`,
	/** Номер блока последнего обновления */
	block_num?:boolean | `@${string}`,
	/** Статус из блокчейна */
	blockchain_status?:boolean | `@${string}`,
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** ID в блокчейне */
	id?:boolean | `@${string}`,
	/** Хеш инвестиции */
	invest_hash?:boolean | `@${string}`,
	/** Дата инвестирования */
	invested_at?:boolean | `@${string}`,
	/** Существует ли запись в блокчейне */
	present?:boolean | `@${string}`,
	/** Заявление об инвестиции */
	statement?:ValueTypes["DocumentAggregate"],
	/** Статус программной инвестиции */
	status?:boolean | `@${string}`,
	/** Имя пользователя */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on CapitalProgramInvest']?: Omit<ValueTypes["CapitalProgramInvest"], "...on CapitalProgramInvest">
}>;
	/** Проект в системе CAPITAL с компонентами */
["CapitalProject"]: AliasType<{
	/** Дата создания записи */
	_created_at?:boolean | `@${string}`,
	/** Внутренний ID базы данных */
	_id?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	_updated_at?:boolean | `@${string}`,
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?:boolean | `@${string}`,
	/** Статус из блокчейна */
	blockchain_status?:boolean | `@${string}`,
	/** Массив проектов-компонентов */
	components?:ValueTypes["CapitalProjectComponent"],
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** Счетчики участников проекта */
	counts?:ValueTypes["CapitalProjectCountsData"],
	/** Дата создания */
	created_at?:boolean | `@${string}`,
	/** Данные CRPS для распределения наград проекта */
	crps?:ValueTypes["CapitalProjectCrpsData"],
	/** Данные/шаблон проекта */
	data?:boolean | `@${string}`,
	/** Описание проекта */
	description?:boolean | `@${string}`,
	/** Фактические показатели проекта */
	fact?:ValueTypes["CapitalProjectFactPool"],
	/** ID в блокчейне */
	id?:boolean | `@${string}`,
	/** Приглашение к проекту */
	invite?:boolean | `@${string}`,
	/** Открыт ли проект */
	is_opened?:boolean | `@${string}`,
	/** Запланирован ли проект */
	is_planed?:boolean | `@${string}`,
	/** Счетчик задач проекта */
	issue_counter?:boolean | `@${string}`,
	/** Мастер проекта */
	master?:boolean | `@${string}`,
	/** Мета-информация проекта */
	meta?:boolean | `@${string}`,
	/** Хеш родительского проекта */
	parent_hash?:boolean | `@${string}`,
	/** Название родительского проекта */
	parent_title?:boolean | `@${string}`,
	/** Права доступа текущего пользователя к проекту */
	permissions?:ValueTypes["CapitalProjectPermissions"],
	/** Плановые показатели проекта */
	plan?:ValueTypes["CapitalProjectPlanPool"],
	/** Префикс проекта */
	prefix?:boolean | `@${string}`,
	/** Флаг присутствия записи в блокчейне */
	present?:boolean | `@${string}`,
	/** Хеш проекта */
	project_hash?:boolean | `@${string}`,
	/** Статус проекта */
	status?:boolean | `@${string}`,
	/** Название проекта */
	title?:boolean | `@${string}`,
	/** Данные голосования по методу Водянова */
	voting?:ValueTypes["CapitalProjectVotingData"],
		__typename?: boolean | `@${string}`,
	['...on CapitalProject']?: Omit<ValueTypes["CapitalProject"], "...on CapitalProject">
}>;
	/** Проект-компонент в системе CAPITAL */
["CapitalProjectComponent"]: AliasType<{
	/** Дата создания записи */
	_created_at?:boolean | `@${string}`,
	/** Внутренний ID базы данных */
	_id?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	_updated_at?:boolean | `@${string}`,
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?:boolean | `@${string}`,
	/** Статус из блокчейна */
	blockchain_status?:boolean | `@${string}`,
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** Счетчики участников проекта */
	counts?:ValueTypes["CapitalProjectCountsData"],
	/** Дата создания */
	created_at?:boolean | `@${string}`,
	/** Данные CRPS для распределения наград проекта */
	crps?:ValueTypes["CapitalProjectCrpsData"],
	/** Данные/шаблон проекта */
	data?:boolean | `@${string}`,
	/** Описание проекта */
	description?:boolean | `@${string}`,
	/** Фактические показатели проекта */
	fact?:ValueTypes["CapitalProjectFactPool"],
	/** ID в блокчейне */
	id?:boolean | `@${string}`,
	/** Приглашение к проекту */
	invite?:boolean | `@${string}`,
	/** Открыт ли проект */
	is_opened?:boolean | `@${string}`,
	/** Запланирован ли проект */
	is_planed?:boolean | `@${string}`,
	/** Счетчик задач проекта */
	issue_counter?:boolean | `@${string}`,
	/** Мастер проекта */
	master?:boolean | `@${string}`,
	/** Мета-информация проекта */
	meta?:boolean | `@${string}`,
	/** Хеш родительского проекта */
	parent_hash?:boolean | `@${string}`,
	/** Название родительского проекта */
	parent_title?:boolean | `@${string}`,
	/** Права доступа текущего пользователя к проекту */
	permissions?:ValueTypes["CapitalProjectPermissions"],
	/** Плановые показатели проекта */
	plan?:ValueTypes["CapitalProjectPlanPool"],
	/** Префикс проекта */
	prefix?:boolean | `@${string}`,
	/** Флаг присутствия записи в блокчейне */
	present?:boolean | `@${string}`,
	/** Хеш проекта */
	project_hash?:boolean | `@${string}`,
	/** Статус проекта */
	status?:boolean | `@${string}`,
	/** Название проекта */
	title?:boolean | `@${string}`,
	/** Данные голосования по методу Водянова */
	voting?:ValueTypes["CapitalProjectVotingData"],
		__typename?: boolean | `@${string}`,
	['...on CapitalProjectComponent']?: Omit<ValueTypes["CapitalProjectComponent"], "...on CapitalProjectComponent">
}>;
	/** Счетчики участников проекта */
["CapitalProjectCountsData"]: AliasType<{
	/** Общее количество авторов */
	total_authors?:boolean | `@${string}`,
	/** Общее количество коммитов */
	total_commits?:boolean | `@${string}`,
	/** Общее количество участников */
	total_contributors?:boolean | `@${string}`,
	/** Общее количество координаторов */
	total_coordinators?:boolean | `@${string}`,
	/** Общее количество создателей */
	total_creators?:boolean | `@${string}`,
	/** Общее количество инвесторов */
	total_investors?:boolean | `@${string}`,
	/** Общее количество проперторов */
	total_propertors?:boolean | `@${string}`,
	/** Общее количество уникальных участников */
	total_unique_participants?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on CapitalProjectCountsData']?: Omit<ValueTypes["CapitalProjectCountsData"], "...on CapitalProjectCountsData">
}>;
	/** Данные CRPS для распределения наград проекта */
["CapitalProjectCrpsData"]: AliasType<{
	/** Накопительный коэффициент вознаграждения за базовый вклад авторов */
	author_base_cumulative_reward_per_share?:boolean | `@${string}`,
	/** Накопительный коэффициент вознаграждения за бонусный вклад авторов */
	author_bonus_cumulative_reward_per_share?:boolean | `@${string}`,
	/** Накопительный коэффициент вознаграждения участников */
	contributor_cumulative_reward_per_share?:boolean | `@${string}`,
	/** Общее количество долей участников капитала */
	total_capital_contributors_shares?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on CapitalProjectCrpsData']?: Omit<ValueTypes["CapitalProjectCrpsData"], "...on CapitalProjectCrpsData">
}>;
	/** Фактические показатели проекта */
["CapitalProjectFactPool"]: AliasType<{
	/** Накопленный пул расходов */
	accumulated_expense_pool?:boolean | `@${string}`,
	/** Базовый пул авторов */
	authors_base_pool?:boolean | `@${string}`,
	/** Бонусный пул авторов */
	authors_bonus_pool?:boolean | `@${string}`,
	/** Бонусный пул участников */
	contributors_bonus_pool?:boolean | `@${string}`,
	/** Базовый пул координаторов */
	coordinators_base_pool?:boolean | `@${string}`,
	/** Инвестиционный пул координаторов */
	coordinators_investment_pool?:boolean | `@${string}`,
	/** Базовый пул создателей */
	creators_base_pool?:boolean | `@${string}`,
	/** Бонусный пул создателей */
	creators_bonus_pool?:boolean | `@${string}`,
	/** Часы создателей */
	creators_hours?:boolean | `@${string}`,
	/** Стоимость часа работы */
	hour_cost?:boolean | `@${string}`,
	/** Инвестиционный пул */
	invest_pool?:boolean | `@${string}`,
	/** Программный инвестиционный пул */
	program_invest_pool?:boolean | `@${string}`,
	/** Имущественный базовый пул */
	property_base_pool?:boolean | `@${string}`,
	/** Процент возврата базового пула */
	return_base_percent?:boolean | `@${string}`,
	/** Целевой пул расходов */
	target_expense_pool?:boolean | `@${string}`,
	/** Общая сумма */
	total?:boolean | `@${string}`,
	/** Общий объем взноса старших участников */
	total_contribution?:boolean | `@${string}`,
	/** Общий генерационный пул */
	total_generation_pool?:boolean | `@${string}`,
	/** Общий объем полученных инвестиций */
	total_received_investments?:boolean | `@${string}`,
	/** Общий объем возвращенных инвестиций */
	total_returned_investments?:boolean | `@${string}`,
	/** Общий объем использованных инвестиций */
	total_used_investments?:boolean | `@${string}`,
	/** Общий объем взноса старших участников */
	total_with_investments?:boolean | `@${string}`,
	/** Процент использования инвестиций */
	use_invest_percent?:boolean | `@${string}`,
	/** Использованный пул расходов */
	used_expense_pool?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on CapitalProjectFactPool']?: Omit<ValueTypes["CapitalProjectFactPool"], "...on CapitalProjectFactPool">
}>;
	/** Права доступа пользователя к проекту */
["CapitalProjectPermissions"]: AliasType<{
	/** Может ли изменять статус проекта */
	can_change_project_status?:boolean | `@${string}`,
	/** Может ли выполнять требования к проекту */
	can_complete_requirement?:boolean | `@${string}`,
	/** Может ли создавать требования к проекту */
	can_create_requirement?:boolean | `@${string}`,
	/** Может ли удалить проект */
	can_delete_project?:boolean | `@${string}`,
	/** Может ли удалять требования к проекту */
	can_delete_requirement?:boolean | `@${string}`,
	/** Может ли редактировать проект (название, описание, мета и т.д.) */
	can_edit_project?:boolean | `@${string}`,
	/** Может ли управлять авторами проекта */
	can_manage_authors?:boolean | `@${string}`,
	/** Может ли управлять задачами в проекте */
	can_manage_issues?:boolean | `@${string}`,
	/** Может ли устанавливать мастера проекта */
	can_set_master?:boolean | `@${string}`,
	/** Может ли устанавливать план проекта */
	can_set_plan?:boolean | `@${string}`,
	/** Имеет ли подтвержденное приложение для проекта */
	has_clearance?:boolean | `@${string}`,
	/** Является ли пользователь гостем (неавторизованным) */
	is_guest?:boolean | `@${string}`,
	/** Есть ли запрос на получение допуска в рассмотрении */
	pending_clearance?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on CapitalProjectPermissions']?: Omit<ValueTypes["CapitalProjectPermissions"], "...on CapitalProjectPermissions">
}>;
	/** Плановые показатели проекта */
["CapitalProjectPlanPool"]: AliasType<{
	/** Базовый пул авторов */
	authors_base_pool?:boolean | `@${string}`,
	/** Бонусный пул авторов */
	authors_bonus_pool?:boolean | `@${string}`,
	/** Бонусный пул участников */
	contributors_bonus_pool?:boolean | `@${string}`,
	/** Базовый пул координаторов */
	coordinators_base_pool?:boolean | `@${string}`,
	/** Инвестиционный пул координаторов */
	coordinators_investment_pool?:boolean | `@${string}`,
	/** Базовый пул создателей */
	creators_base_pool?:boolean | `@${string}`,
	/** Бонусный пул создателей */
	creators_bonus_pool?:boolean | `@${string}`,
	/** Плановые часы создателей */
	creators_hours?:boolean | `@${string}`,
	/** Плановая стоимость часа работы */
	hour_cost?:boolean | `@${string}`,
	/** Инвестиционный пул */
	invest_pool?:boolean | `@${string}`,
	/** Программный инвестиционный пул */
	program_invest_pool?:boolean | `@${string}`,
	/** Процент возврата базового пула */
	return_base_percent?:boolean | `@${string}`,
	/** Целевой пул расходов */
	target_expense_pool?:boolean | `@${string}`,
	/** Общая сумма */
	total?:boolean | `@${string}`,
	/** Общий генерационный пул */
	total_generation_pool?:boolean | `@${string}`,
	/** Общий объем полученных инвестиций */
	total_received_investments?:boolean | `@${string}`,
	/** Общая сумма */
	total_with_investments?:boolean | `@${string}`,
	/** Процент использования инвестиций */
	use_invest_percent?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on CapitalProjectPlanPool']?: Omit<ValueTypes["CapitalProjectPlanPool"], "...on CapitalProjectPlanPool">
}>;
	/** Статистика времени участника по проекту */
["CapitalProjectTimeStats"]: AliasType<{
	/** Доступное время для коммита (по завершённым задачам) */
	available_hours?:boolean | `@${string}`,
	/** Хеш участника */
	contributor_hash?:boolean | `@${string}`,
	/** Время в ожидании (по незавершённым задачам) */
	pending_hours?:boolean | `@${string}`,
	/** Хеш проекта */
	project_hash?:boolean | `@${string}`,
	/** Название проекта */
	project_name?:boolean | `@${string}`,
	/** Сумма закоммиченного времени (часы) */
	total_committed_hours?:boolean | `@${string}`,
	/** Сумма незакоммиченного времени (часы) */
	total_uncommitted_hours?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on CapitalProjectTimeStats']?: Omit<ValueTypes["CapitalProjectTimeStats"], "...on CapitalProjectTimeStats">
}>;
	/** Суммы голосования проекта */
["CapitalProjectVotingAmounts"]: AliasType<{
	/** Активная сумма голосования */
	active_voting_amount?:boolean | `@${string}`,
	/** Бонусы авторов при голосовании */
	authors_bonuses_on_voting?:boolean | `@${string}`,
	/** Равная сумма на автора */
	authors_equal_per_author?:boolean | `@${string}`,
	/** Равномерное распределение среди авторов */
	authors_equal_spread?:boolean | `@${string}`,
	/** Бонусы создателей при голосовании */
	creators_bonuses_on_voting?:boolean | `@${string}`,
	/** Прямое распределение среди создателей */
	creators_direct_spread?:boolean | `@${string}`,
	/** Равная сумма голосования */
	equal_voting_amount?:boolean | `@${string}`,
	/** Общий пул голосования */
	total_voting_pool?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on CapitalProjectVotingAmounts']?: Omit<ValueTypes["CapitalProjectVotingAmounts"], "...on CapitalProjectVotingAmounts">
}>;
	/** Данные голосования по методу Водянова */
["CapitalProjectVotingData"]: AliasType<{
	/** Суммы голосования */
	amounts?:ValueTypes["CapitalProjectVotingAmounts"],
	/** Процент голосования авторов */
	authors_voting_percent?:boolean | `@${string}`,
	/** Процент голосования создателей */
	creators_voting_percent?:boolean | `@${string}`,
	/** Общее количество участников голосования */
	total_voters?:boolean | `@${string}`,
	/** Количество полученных голосов */
	votes_received?:boolean | `@${string}`,
	/** Дата окончания голосования */
	voting_deadline?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on CapitalProjectVotingData']?: Omit<ValueTypes["CapitalProjectVotingData"], "...on CapitalProjectVotingData">
}>;
	/** Результат в системе CAPITAL */
["CapitalResult"]: AliasType<{
	/** Дата создания записи */
	_created_at?:boolean | `@${string}`,
	/** Внутренний ID базы данных */
	_id?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	_updated_at?:boolean | `@${string}`,
	/** Акт приёма-передачи результата */
	act?:ValueTypes["DocumentAggregate"],
	/** Авторизация результата */
	authorization?:ValueTypes["DocumentAggregate"],
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?:boolean | `@${string}`,
	/** Статус из блокчейна */
	blockchain_status?:boolean | `@${string}`,
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** Дата создания */
	created_at?:boolean | `@${string}`,
	/** Структурированные данные результата для отображения */
	data?:boolean | `@${string}`,
	/** Сумма долга */
	debt_amount?:boolean | `@${string}`,
	/** ID в блокчейне */
	id?:boolean | `@${string}`,
	/** Флаг присутствия записи в блокчейне */
	present?:boolean | `@${string}`,
	/** Хеш проекта */
	project_hash?:boolean | `@${string}`,
	/** Хеш результата */
	result_hash?:boolean | `@${string}`,
	/** Заявление на внесение результата интеллектуальной деятельности */
	statement?:ValueTypes["DocumentAggregate"],
	/** Статус результата */
	status?:boolean | `@${string}`,
	/** Общая сумма */
	total_amount?:boolean | `@${string}`,
	/** Имя пользователя */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on CapitalResult']?: Omit<ValueTypes["CapitalResult"], "...on CapitalResult">
}>;
	/** Сегмент участника в проекте CAPITAL */
["CapitalSegment"]: AliasType<{
	/** Дата создания записи */
	_created_at?:boolean | `@${string}`,
	/** Внутренний ID базы данных */
	_id?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	_updated_at?:boolean | `@${string}`,
	/** Базовый вклад автора */
	author_base?:boolean | `@${string}`,
	/** Бонусный вклад автора */
	author_bonus?:boolean | `@${string}`,
	/** Доступная сумма для конвертации в программу */
	available_for_program?:boolean | `@${string}`,
	/** Доступная сумма для конвертации в кошелек */
	available_for_wallet?:boolean | `@${string}`,
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?:boolean | `@${string}`,
	/** Доли участников капитала */
	capital_contributor_shares?:boolean | `@${string}`,
	/** Бонусный вклад участника */
	contributor_bonus?:boolean | `@${string}`,
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** Базовый вклад координатора */
	coordinator_base?:boolean | `@${string}`,
	/** Инвестиции координатора */
	coordinator_investments?:boolean | `@${string}`,
	/** Базовый вклад создателя */
	creator_base?:boolean | `@${string}`,
	/** Бонусный вклад создателя */
	creator_bonus?:boolean | `@${string}`,
	/** Сумма долга */
	debt_amount?:boolean | `@${string}`,
	/** Сумма погашенного долга */
	debt_settled?:boolean | `@${string}`,
	/** Прямой бонус создателя */
	direct_creator_bonus?:boolean | `@${string}`,
	/** Отображаемое имя пользователя */
	display_name?:boolean | `@${string}`,
	/** Равный бонус автора */
	equal_author_bonus?:boolean | `@${string}`,
	/** Наличие права голоса */
	has_vote?:boolean | `@${string}`,
	/** ID в блокчейне */
	id?:boolean | `@${string}`,
	/** Интеллектуальная стоимость сегмента */
	intellectual_cost?:boolean | `@${string}`,
	/** Сумма инвестиций инвестора */
	investor_amount?:boolean | `@${string}`,
	/** Базовый вклад инвестора */
	investor_base?:boolean | `@${string}`,
	/** Роль автора */
	is_author?:boolean | `@${string}`,
	/** Завершена ли конвертация сегмента */
	is_completed?:boolean | `@${string}`,
	/** Роль участника */
	is_contributor?:boolean | `@${string}`,
	/** Роль координатора */
	is_coordinator?:boolean | `@${string}`,
	/** Роль создателя */
	is_creator?:boolean | `@${string}`,
	/** Роль инвестора */
	is_investor?:boolean | `@${string}`,
	/** Роль собственника */
	is_propertor?:boolean | `@${string}`,
	/** Флаг завершения расчета голосования */
	is_votes_calculated?:boolean | `@${string}`,
	/** Последняя награда за базовый вклад автора на долю в проекте */
	last_author_base_reward_per_share?:boolean | `@${string}`,
	/** Последняя награда за бонусный вклад автора на долю в проекте */
	last_author_bonus_reward_per_share?:boolean | `@${string}`,
	/** Последняя награда участника на акцию */
	last_contributor_reward_per_share?:boolean | `@${string}`,
	/** Последняя известная сумма инвестиций координаторов */
	last_known_coordinators_investment_pool?:boolean | `@${string}`,
	/** Последняя известная сумма базового пула создателей */
	last_known_creators_base_pool?:boolean | `@${string}`,
	/** Последняя известная сумма инвестиций в проекте */
	last_known_invest_pool?:boolean | `@${string}`,
	/** Флаг присутствия записи в блокчейне */
	present?:boolean | `@${string}`,
	/** Хеш проекта */
	project_hash?:boolean | `@${string}`,
	/** Базовый имущественный вклад */
	property_base?:boolean | `@${string}`,
	/** Предварительная сумма */
	provisional_amount?:boolean | `@${string}`,
	/** Доля участника в результате интеллектуальной деятельности */
	share_percent?:boolean | `@${string}`,
	/** Статус сегмента */
	status?:boolean | `@${string}`,
	/** Общая базовая стоимость сегмента */
	total_segment_base_cost?:boolean | `@${string}`,
	/** Общая бонусная стоимость сегмента */
	total_segment_bonus_cost?:boolean | `@${string}`,
	/** Общая стоимость сегмента */
	total_segment_cost?:boolean | `@${string}`,
	/** Имя пользователя */
	username?:boolean | `@${string}`,
	/** Вклад участника словами участника */
	value?:boolean | `@${string}`,
	/** Бонус голосования */
	voting_bonus?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on CapitalSegment']?: Omit<ValueTypes["CapitalSegment"], "...on CapitalSegment">
}>;
	/** История (критерий выполнения) в системе CAPITAL */
["CapitalStory"]: AliasType<{
	/** Дата создания записи */
	_created_at?:boolean | `@${string}`,
	/** Внутренний ID базы данных */
	_id?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	_updated_at?:boolean | `@${string}`,
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?:boolean | `@${string}`,
	/** Формат содержимого (markdown-текст или BPMN 2.0 XML в description) */
	content_format?:boolean | `@${string}`,
	/** Имя аккаунта кооператива */
	coopname?:boolean | `@${string}`,
	/** Имя пользователя, создавшего историю */
	created_by?:boolean | `@${string}`,
	/** Описание истории */
	description?:boolean | `@${string}`,
	/** Хеш задачи (если история привязана к задаче) */
	issue_hash?:boolean | `@${string}`,
	/** Флаг присутствия записи в блокчейне */
	present?:boolean | `@${string}`,
	/** Хеш проекта (если история привязана к проекту) */
	project_hash?:boolean | `@${string}`,
	/** Порядок сортировки */
	sort_order?:boolean | `@${string}`,
	/** Статус истории */
	status?:boolean | `@${string}`,
	/** Хеш истории */
	story_hash?:boolean | `@${string}`,
	/** Название истории */
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on CapitalStory']?: Omit<ValueTypes["CapitalStory"], "...on CapitalStory">
}>;
	/** Формат содержимого требования (истории) в CAPITAL: MARKDOWN, BPMN (XML), DRAWIO (draw.io / diagrams.net XML) или MERMAID (текст диаграммы) */
["CapitalStoryContentFormat"]:CapitalStoryContentFormat;
	/** Агрегированная статистика времени по задачам с информацией о задачах и участниках */
["CapitalTimeEntriesByIssues"]: AliasType<{
	/** Доступное время для коммита (по завершённым задачам) */
	available_hours?:boolean | `@${string}`,
	/** Количество закоммиченных часов */
	committed_hours?:boolean | `@${string}`,
	/** Хеш участника */
	contributor_hash?:boolean | `@${string}`,
	/** Имя участника */
	contributor_name?:boolean | `@${string}`,
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** Хеш задачи */
	issue_hash?:boolean | `@${string}`,
	/** Название задачи */
	issue_title?:boolean | `@${string}`,
	/** Время в ожидании (по незавершённым задачам) */
	pending_hours?:boolean | `@${string}`,
	/** Хеш проекта */
	project_hash?:boolean | `@${string}`,
	/** Название проекта */
	project_name?:boolean | `@${string}`,
	/** Общее количество часов по задаче */
	total_hours?:boolean | `@${string}`,
	/** Количество незакоммиченных часов */
	uncommitted_hours?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on CapitalTimeEntriesByIssues']?: Omit<ValueTypes["CapitalTimeEntriesByIssues"], "...on CapitalTimeEntriesByIssues">
}>;
	/** Запись времени участника */
["CapitalTimeEntry"]: AliasType<{
	/** Дата создания записи */
	_created_at?:boolean | `@${string}`,
	/** Уникальный идентификатор записи */
	_id?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	_updated_at?:boolean | `@${string}`,
	/** Хеш коммита */
	commit_hash?:boolean | `@${string}`,
	/** Хеш участника */
	contributor_hash?:boolean | `@${string}`,
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** Дата записи времени (YYYY-MM-DD) */
	date?:boolean | `@${string}`,
	/** Тип начисления времени: hourly (почасовое) или estimate (по завершению задачи) */
	entry_type?:boolean | `@${string}`,
	/** Снимок estimate на момент начисления времени (для отслеживания изменений) */
	estimate_snapshot?:boolean | `@${string}`,
	/** Количество часов */
	hours?:boolean | `@${string}`,
	/** Флаг, указывающий, закоммичена ли запись */
	is_committed?:boolean | `@${string}`,
	/** Хеш задачи */
	issue_hash?:boolean | `@${string}`,
	/** Хеш проекта */
	project_hash?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on CapitalTimeEntry']?: Omit<ValueTypes["CapitalTimeEntry"], "...on CapitalTimeEntry">
}>;
	/** Голос в системе CAPITAL */
["CapitalVote"]: AliasType<{
	/** Дата создания записи */
	_created_at?:boolean | `@${string}`,
	/** Внутренний ID базы данных */
	_id?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	_updated_at?:boolean | `@${string}`,
	/** Сумма голоса */
	amount?:boolean | `@${string}`,
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?:boolean | `@${string}`,
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** ID в блокчейне */
	id?:boolean | `@${string}`,
	/** Флаг присутствия записи в блокчейне */
	present?:boolean | `@${string}`,
	/** Хеш проекта */
	project_hash?:boolean | `@${string}`,
	/** Получатель */
	recipient?:boolean | `@${string}`,
	/** Отображаемое имя получателя голоса */
	recipient_display_name?:boolean | `@${string}`,
	/** Дата голосования */
	voted_at?:boolean | `@${string}`,
	/** Голосующий */
	voter?:boolean | `@${string}`,
	/** Отображаемое имя голосующего */
	voter_display_name?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on CapitalVote']?: Omit<ValueTypes["CapitalVote"], "...on CapitalVote">
}>;
	["ChartOfAccountsItem"]: AliasType<{
	/** Доступные средства */
	available?:boolean | `@${string}`,
	/** Заблокированные средства */
	blocked?:boolean | `@${string}`,
	/** Идентификатор счета для отображения (может быть дробным, например "86.6") */
	displayId?:boolean | `@${string}`,
	/** Идентификатор счета */
	id?:boolean | `@${string}`,
	/** Название счета */
	name?:boolean | `@${string}`,
	/** Списанные средства */
	writeoff?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on ChartOfAccountsItem']?: Omit<ValueTypes["ChartOfAccountsItem"], "...on ChartOfAccountsItem">
}>;
	/** Статус коммита в системе CAPITAL */
["CommitStatus"]:CommitStatus;
	["ContactsDTO"]: AliasType<{
	chairman?:ValueTypes["PublicChairman"],
	details?:ValueTypes["OrganizationDetails"],
	email?:boolean | `@${string}`,
	full_address?:boolean | `@${string}`,
	full_name?:boolean | `@${string}`,
	phone?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on ContactsDTO']?: Omit<ValueTypes["ContactsDTO"], "...on ContactsDTO">
}>;
	/** Параметры документов участника из UData */
["ContributorDocumentParameters"]: AliasType<{
	/** Дата создания соглашения благороста */
	blagorost_agreement_created_at?:boolean | `@${string}`,
	/** Номер соглашения программы благороста */
	blagorost_agreement_number?:boolean | `@${string}`,
	/** Дата создания договора УХД участника */
	blagorost_contributor_contract_created_at?:boolean | `@${string}`,
	/** Номер договора УХД участника */
	blagorost_contributor_contract_number?:boolean | `@${string}`,
	/** Дата создания дополнительного соглашения по хранению имущества */
	blagorost_storage_agreement_created_at?:boolean | `@${string}`,
	/** Номер дополнительного соглашения по хранению имущества */
	blagorost_storage_agreement_number?:boolean | `@${string}`,
	/** Дата создания соглашения генератора */
	generator_agreement_created_at?:boolean | `@${string}`,
	/** Номер соглашения программы генератор */
	generator_agreement_number?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on ContributorDocumentParameters']?: Omit<ValueTypes["ContributorDocumentParameters"], "...on ContributorDocumentParameters">
}>;
	/** Статус участника в системе CAPITAL */
["ContributorStatus"]:ContributorStatus;
	["CooperativeOperatorAccount"]: AliasType<{
	/** Количество активных участников */
	active_participants_count?:boolean | `@${string}`,
	/** Объявление кооператива */
	announce?:boolean | `@${string}`,
	/** Тип кооператива */
	coop_type?:boolean | `@${string}`,
	/** Дата создания */
	created_at?:boolean | `@${string}`,
	/** Описание кооператива */
	description?:boolean | `@${string}`,
	/** Документ кооператива */
	document?:ValueTypes["SignedBlockchainDocument"],
	/** Начальный взнос */
	initial?:boolean | `@${string}`,
	/** Разветвленный ли кооператив */
	is_branched?:boolean | `@${string}`,
	/** Является ли это кооперативом */
	is_cooperative?:boolean | `@${string}`,
	/** Включен ли кооператив */
	is_enrolled?:boolean | `@${string}`,
	/** Метаинформация */
	meta?:boolean | `@${string}`,
	/** Минимальный взнос */
	minimum?:boolean | `@${string}`,
	/** Начальный взнос организации */
	org_initial?:boolean | `@${string}`,
	/** Минимальный взнос организации */
	org_minimum?:boolean | `@${string}`,
	/** Регистрационный взнос организации */
	org_registration?:boolean | `@${string}`,
	/** Родительское имя аккаунта кооператива */
	parent_username?:boolean | `@${string}`,
	/** Реферал кооператива */
	referer?:boolean | `@${string}`,
	/** Дата регистрации */
	registered_at?:boolean | `@${string}`,
	/** Регистрационный взнос */
	registration?:boolean | `@${string}`,
	/** Регистратор кооператива */
	registrator?:boolean | `@${string}`,
	/** Статус кооператива */
	status?:boolean | `@${string}`,
	/** Список хранилищ */
	storages?:boolean | `@${string}`,
	/** Тип учетной записи */
	type?:boolean | `@${string}`,
	/** Имя аккаунта кооператива */
	username?:boolean | `@${string}`,
	/** Дата регистрации */
	verifications?:ValueTypes["Verification"],
		__typename?: boolean | `@${string}`,
	['...on CooperativeOperatorAccount']?: Omit<ValueTypes["CooperativeOperatorAccount"], "...on CooperativeOperatorAccount">
}>;
	/** Страна регистрации пользователя */
["Country"]:Country;
	["CreateBranchInput"]: {
	/** Документ, на основании которого действует Уполномоченный (решение совета №СС-.. от ..) */
	based_on: string | Variable<any, string>,
	/** Имя аккаунта кооперативного участка */
	braname: string | Variable<any, string>,
	/** Имя аккаунта кооператива */
	coopname: string | Variable<any, string>,
	/** Электронная почта */
	email: string | Variable<any, string>,
	/** Фактический адрес */
	fact_address: string | Variable<any, string>,
	/** Полное имя организации кооперативного участка */
	full_name: string | Variable<any, string>,
	/** Телефон */
	phone: string | Variable<any, string>,
	/** Краткое имя организации кооперативного участка */
	short_name: string | Variable<any, string>,
	/** Имя аккаунта уполномоченного (председателя) кооперативного участка */
	trustee: string | Variable<any, string>
};
	["CreateEntrepreneurDataInput"]: {
	/** Банковский счет */
	bank_account: ValueTypes["BankAccountInput"] | Variable<any, string>,
	/** Дата рождения */
	birthdate: string | Variable<any, string>,
	/** Город */
	city: string | Variable<any, string>,
	/** Страна */
	country: ValueTypes["Country"] | Variable<any, string>,
	/** Детали индивидуального предпринимателя */
	details: ValueTypes["EntrepreneurDetailsInput"] | Variable<any, string>,
	/** Имя */
	first_name: string | Variable<any, string>,
	/** Полный адрес */
	full_address: string | Variable<any, string>,
	/** Фамилия */
	last_name: string | Variable<any, string>,
	/** Отчество */
	middle_name: string | Variable<any, string>,
	/** Телефон */
	phone: string | Variable<any, string>
};
	["CreateIndividualDataInput"]: {
	/** Дата рождения */
	birthdate: string | Variable<any, string>,
	/** Имя */
	first_name: string | Variable<any, string>,
	/** Полный адрес */
	full_address: string | Variable<any, string>,
	/** Фамилия */
	last_name: string | Variable<any, string>,
	/** Отчество */
	middle_name: string | Variable<any, string>,
	/** Данные паспорта */
	passport?: ValueTypes["PassportInput"] | undefined | null | Variable<any, string>,
	/** Телефон */
	phone: string | Variable<any, string>
};
	["CreateInitOrganizationDataInput"]: {
	/** Банковский счет организации */
	bank_account: ValueTypes["BankAccountInput"] | Variable<any, string>,
	/** Город */
	city: string | Variable<any, string>,
	/** Страна */
	country: string | Variable<any, string>,
	/** Детали организации */
	details: ValueTypes["OrganizationDetailsInput"] | Variable<any, string>,
	/** Email организации */
	email: string | Variable<any, string>,
	/** Фактический адрес */
	fact_address: string | Variable<any, string>,
	/** Полный адрес */
	full_address: string | Variable<any, string>,
	/** Полное наименование организации */
	full_name: string | Variable<any, string>,
	/** Телефон */
	phone: string | Variable<any, string>,
	/** Представитель организации */
	represented_by: ValueTypes["RepresentedByInput"] | Variable<any, string>,
	/** Краткое наименование организации */
	short_name: string | Variable<any, string>,
	/** Тип организации */
	type: ValueTypes["OrganizationType"] | Variable<any, string>
};
	["CreateOrganizationDataInput"]: {
	/** Банковский счет организации */
	bank_account: ValueTypes["BankAccountInput"] | Variable<any, string>,
	/** Город */
	city: string | Variable<any, string>,
	/** Страна */
	country: string | Variable<any, string>,
	/** Детали организации */
	details: ValueTypes["OrganizationDetailsInput"] | Variable<any, string>,
	/** Фактический адрес */
	fact_address: string | Variable<any, string>,
	/** Полный адрес */
	full_address: string | Variable<any, string>,
	/** Полное наименование организации */
	full_name: string | Variable<any, string>,
	/** Телефон */
	phone: string | Variable<any, string>,
	/** Представитель организации */
	represented_by: ValueTypes["RepresentedByInput"] | Variable<any, string>,
	/** Краткое наименование организации */
	short_name: string | Variable<any, string>,
	/** Тип организации */
	type: ValueTypes["OrganizationType"] | Variable<any, string>
};
	["CreateSovietIndividualDataInput"]: {
	/** Дата рождения */
	birthdate: string | Variable<any, string>,
	/** Email адрес */
	email: string | Variable<any, string>,
	/** Имя */
	first_name: string | Variable<any, string>,
	/** Полный адрес */
	full_address: string | Variable<any, string>,
	/** Фамилия */
	last_name: string | Variable<any, string>,
	/** Отчество */
	middle_name: string | Variable<any, string>,
	/** Данные паспорта */
	passport?: ValueTypes["PassportInput"] | undefined | null | Variable<any, string>,
	/** Телефон */
	phone: string | Variable<any, string>
};
	["CreateSubscriptionInput"]: {
	/** Данные подписки */
	subscription: ValueTypes["WebPushSubscriptionDataInput"] | Variable<any, string>,
	/** User Agent браузера */
	userAgent?: string | undefined | null | Variable<any, string>,
	/** Username пользователя */
	username: string | Variable<any, string>
};
	["CreateSubscriptionResponse"]: AliasType<{
	/** Сообщение о результате операции */
	message?:boolean | `@${string}`,
	/** Данные созданной подписки */
	subscription?:ValueTypes["WebPushSubscriptionDto"],
	/** Успешно ли создана подписка */
	success?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on CreateSubscriptionResponse']?: Omit<ValueTypes["CreateSubscriptionResponse"], "...on CreateSubscriptionResponse">
}>;
	["CurrentTableState"]: AliasType<{
	/** Номер блока, в котором была последняя запись */
	block_num?:boolean | `@${string}`,
	/** Код контракта */
	code?:boolean | `@${string}`,
	/** Дата создания последней записи */
	created_at?:boolean | `@${string}`,
	/** Первичный ключ */
	primary_key?:boolean | `@${string}`,
	/** Область действия */
	scope?:boolean | `@${string}`,
	/** Имя таблицы */
	table?:boolean | `@${string}`,
	/** Данные записи в формате JSON */
	value?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on CurrentTableState']?: Omit<ValueTypes["CurrentTableState"], "...on CurrentTableState">
}>;
	/** Статус цикла в системе CAPITAL */
["CycleStatus"]:CycleStatus;
	/** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
["DateTime"]:unknown;
	["DeactivateSubscriptionInput"]: {
	/** ID подписки для деактивации */
	subscriptionId: string | Variable<any, string>
};
	/** Статус долга в системе CAPITAL */
["DebtStatus"]:DebtStatus;
	/** Комплексный объект решения совета, включающий в себя информацию о голосовавших членах совета, расширенное действие, которое привело к появлению решения, и агрегат документа самого решения. */
["DecisionDetailAggregate"]: AliasType<{
	action?:ValueTypes["ExtendedBlockchainAction"],
	documentAggregate?:ValueTypes["DocumentAggregate"],
	votes_against?:ValueTypes["ExtendedBlockchainAction"],
	votes_for?:ValueTypes["ExtendedBlockchainAction"],
		__typename?: boolean | `@${string}`,
	['...on DecisionDetailAggregate']?: Omit<ValueTypes["DecisionDetailAggregate"], "...on DecisionDetailAggregate">
}>;
	["DeleteBranchInput"]: {
	/** Имя аккаунта кооперативного участка */
	braname: string | Variable<any, string>,
	/** Имя аккаунта кооператива */
	coopname: string | Variable<any, string>
};
	["DeletePaymentMethodInput"]: {
	/** Идентификатор метода оплаты */
	method_id: string | Variable<any, string>,
	/** Имя пользователя, чей метод оплаты нужно удалить */
	username: string | Variable<any, string>
};
	["DeleteTrustedAccountInput"]: {
	/** Имя аккаунта кооперативного участка */
	braname: string | Variable<any, string>,
	/** Имя аккаунта кооператива */
	coopname: string | Variable<any, string>,
	/** Имя аккаунта доверонного лица, у которого отзывается право подписи за председателя кооперативного участка */
	trusted: string | Variable<any, string>
};
	["Delta"]: AliasType<{
	/** ID блока */
	block_id?:boolean | `@${string}`,
	/** Номер блока */
	block_num?:boolean | `@${string}`,
	/** ID блокчейна */
	chain_id?:boolean | `@${string}`,
	/** Код контракта */
	code?:boolean | `@${string}`,
	/** Дата создания */
	created_at?:boolean | `@${string}`,
	/** Уникальный идентификатор */
	id?:boolean | `@${string}`,
	/** Флаг присутствия записи */
	present?:boolean | `@${string}`,
	/** Первичный ключ */
	primary_key?:boolean | `@${string}`,
	/** Область действия */
	scope?:boolean | `@${string}`,
	/** Имя таблицы */
	table?:boolean | `@${string}`,
	/** Данные записи в формате JSON */
	value?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on Delta']?: Omit<ValueTypes["Delta"], "...on Delta">
}>;
	["Desktop"]: AliasType<{
	/** Домашняя страница для авторизованных пользователей */
	authorizedHome?:boolean | `@${string}`,
	/** Имя аккаунта кооператива */
	coopname?:boolean | `@${string}`,
	/** Имя шаблона рабочих столов */
	layout?:boolean | `@${string}`,
	/** Домашняя страница для неавторизованных пользователей */
	nonAuthorizedHome?:boolean | `@${string}`,
	/** Состав приложений рабочего стола */
	workspaces?:ValueTypes["DesktopWorkspace"],
		__typename?: boolean | `@${string}`,
	['...on Desktop']?: Omit<ValueTypes["Desktop"], "...on Desktop">
}>;
	["DesktopConfig"]: AliasType<{
	/** Маршрут по умолчанию */
	defaultRoute?:boolean | `@${string}`,
	/** Иконка для меню */
	icon?:boolean | `@${string}`,
	/** Уникальное имя workspace */
	name?:boolean | `@${string}`,
	/** Отображаемое название workspace */
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on DesktopConfig']?: Omit<ValueTypes["DesktopConfig"], "...on DesktopConfig">
}>;
	["DesktopWorkspace"]: AliasType<{
	/** Маршрут по умолчанию для этого workspace */
	defaultRoute?:boolean | `@${string}`,
	/** Имя расширения, которому принадлежит этот workspace */
	extension_name?:boolean | `@${string}`,
	/** Иконка для меню */
	icon?:boolean | `@${string}`,
	/** Уникальное имя workspace */
	name?:boolean | `@${string}`,
	/** Отображаемое название workspace */
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on DesktopWorkspace']?: Omit<ValueTypes["DesktopWorkspace"], "...on DesktopWorkspace">
}>;
	["DocumentAggregate"]: AliasType<{
	document?:ValueTypes["SignedDigitalDocument"],
	hash?:boolean | `@${string}`,
	rawDocument?:ValueTypes["GeneratedDocument"],
		__typename?: boolean | `@${string}`,
	['...on DocumentAggregate']?: Omit<ValueTypes["DocumentAggregate"], "...on DocumentAggregate">
}>;
	/** Комплексный объект папки цифрового документа с агрегатами, который включает в себя заявление, решение, акты и связанные документы */
["DocumentPackageAggregate"]: AliasType<{
	/** Массив объект(ов) актов с агрегатами, относящихся к заявлению */
	acts?:ValueTypes["ActDetailAggregate"],
	/** Объект цифрового документа решения с агрегатом */
	decision?:ValueTypes["DecisionDetailAggregate"],
	/** Массив связанных документов с агрегатами, извлечённых из мета-данных */
	links?:ValueTypes["DocumentAggregate"],
	/** Объект цифрового документа заявления с агрегатом */
	statement?:ValueTypes["StatementDetailAggregate"],
		__typename?: boolean | `@${string}`,
	['...on DocumentPackageAggregate']?: Omit<ValueTypes["DocumentPackageAggregate"], "...on DocumentPackageAggregate">
}>;
	["EditBranchInput"]: {
	/** Документ, на основании которого действует Уполномоченный (решение совета №СС-.. от ..) */
	based_on: string | Variable<any, string>,
	/** Имя аккаунта кооперативного участка */
	braname: string | Variable<any, string>,
	/** Имя аккаунта кооператива */
	coopname: string | Variable<any, string>,
	/** Электронная почта */
	email: string | Variable<any, string>,
	/** Фактический адрес */
	fact_address: string | Variable<any, string>,
	/** Полное имя организации кооперативного участка */
	full_name: string | Variable<any, string>,
	/** Телефон */
	phone: string | Variable<any, string>,
	/** Краткое имя организации кооперативного участка */
	short_name: string | Variable<any, string>,
	/** Имя аккаунта уполномоченного (председателя) кооперативного участка */
	trustee: string | Variable<any, string>
};
	["Entrepreneur"]: AliasType<{
	/** Дата рождения */
	birthdate?:boolean | `@${string}`,
	/** Город */
	city?:boolean | `@${string}`,
	/** Страна */
	country?:boolean | `@${string}`,
	/** Детали ИП (ИНН, ОГРН) */
	details?:ValueTypes["EntrepreneurDetails"],
	/** Email */
	email?:boolean | `@${string}`,
	/** Имя */
	first_name?:boolean | `@${string}`,
	/** Юридический адрес */
	full_address?:boolean | `@${string}`,
	/** Фамилия */
	last_name?:boolean | `@${string}`,
	/** Отчество */
	middle_name?:boolean | `@${string}`,
	/** Телефон */
	phone?:boolean | `@${string}`,
	/** Имя аккаунта */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on Entrepreneur']?: Omit<ValueTypes["Entrepreneur"], "...on Entrepreneur">
}>;
	["EntrepreneurCertificate"]: AliasType<{
	/** Имя */
	first_name?:boolean | `@${string}`,
	/** ИНН */
	inn?:boolean | `@${string}`,
	/** Фамилия */
	last_name?:boolean | `@${string}`,
	/** Отчество */
	middle_name?:boolean | `@${string}`,
	/** Тип аккаунта */
	type?:boolean | `@${string}`,
	/** Имя аккаунта */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on EntrepreneurCertificate']?: Omit<ValueTypes["EntrepreneurCertificate"], "...on EntrepreneurCertificate">
}>;
	["EntrepreneurDetails"]: AliasType<{
	/** ИНН */
	inn?:boolean | `@${string}`,
	/** ОГРН */
	ogrn?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on EntrepreneurDetails']?: Omit<ValueTypes["EntrepreneurDetails"], "...on EntrepreneurDetails">
}>;
	["EntrepreneurDetailsInput"]: {
	/** ИНН */
	inn: string | Variable<any, string>,
	/** ОГРН */
	ogrn: string | Variable<any, string>
};
	/** Статус расхода в системе CAPITAL */
["ExpenseStatus"]:ExpenseStatus;
	/** Расширенное действие блокчейна с сертификатом пользователя, совершившего его. */
["ExtendedBlockchainAction"]: AliasType<{
	account?:boolean | `@${string}`,
	account_ram_deltas?:ValueTypes["AccountRamDelta"],
	action_ordinal?:boolean | `@${string}`,
	/** Сертификат пользователя (сокращенная информация) */
	actor_certificate?:ValueTypes["UserCertificateUnion"],
	authorization?:ValueTypes["ActionAuthorization"],
	block_id?:boolean | `@${string}`,
	block_num?:boolean | `@${string}`,
	chain_id?:boolean | `@${string}`,
	console?:boolean | `@${string}`,
	context_free?:boolean | `@${string}`,
	creator_action_ordinal?:boolean | `@${string}`,
	/** Данные действия в формате JSON */
	data?:boolean | `@${string}`,
	elapsed?:boolean | `@${string}`,
	global_sequence?:boolean | `@${string}`,
	name?:boolean | `@${string}`,
	receipt?:ValueTypes["ActionReceipt"],
	receiver?:boolean | `@${string}`,
	transaction_id?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on ExtendedBlockchainAction']?: Omit<ValueTypes["ExtendedBlockchainAction"], "...on ExtendedBlockchainAction">
}>;
	/** Расширенный статус собрания на основе дат и состояния */
["ExtendedMeetStatus"]:ExtendedMeetStatus;
	["Extension"]: AliasType<{
	/** Настройки конфигурации для расширения */
	config?:boolean | `@${string}`,
	/** Дата создания расширения */
	created_at?:boolean | `@${string}`,
	/** Описание расширения */
	description?:boolean | `@${string}`,
	/** Массив рабочих столов, которые предоставляет расширение */
	desktops?:ValueTypes["DesktopConfig"],
	/** Показывает, включено ли расширение */
	enabled?:boolean | `@${string}`,
	/** Внешняя ссылка на iframe-интерфейс расширения */
	external_url?:boolean | `@${string}`,
	/** Изображение для расширения */
	image?:boolean | `@${string}`,
	/** Поле инструкция для установки (INSTALL) */
	instructions?:boolean | `@${string}`,
	/** Показывает, доступно ли расширение */
	is_available?:boolean | `@${string}`,
	/** Показывает, встроенное ли это расширение */
	is_builtin?:boolean | `@${string}`,
	/** Показывает, установлено ли расширение */
	is_installed?:boolean | `@${string}`,
	/** Показывает, внутреннее ли это расширение */
	is_internal?:boolean | `@${string}`,
	/** Уникальное имя расширения */
	name?:boolean | `@${string}`,
	/** Поле подробного текстового описания (README) */
	readme?:boolean | `@${string}`,
	/** Схема настроек конфигурации для расширения */
	schema?:boolean | `@${string}`,
	/** Массив тегов для расширения */
	tags?:boolean | `@${string}`,
	/** Заголовок расширения */
	title?:boolean | `@${string}`,
	/** Дата последнего обновления расширения */
	updated_at?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on Extension']?: Omit<ValueTypes["Extension"], "...on Extension">
}>;
	["ExtensionInput"]: {
	/** Объект конфигурации расширения */
	config: ValueTypes["JSON"] | Variable<any, string>,
	/** Дата установки расширения */
	created_at?: ValueTypes["DateTime"] | undefined | null | Variable<any, string>,
	/** Флаг того, включено ли расширение сейчас */
	enabled: boolean | Variable<any, string>,
	/** Уникальное имя расширения (является идентификатором) */
	name: string | Variable<any, string>,
	/** Дата обновления расширения */
	updated_at?: ValueTypes["DateTime"] | undefined | null | Variable<any, string>
};
	["ExtensionLog"]: AliasType<{
	/** Дата создания записи */
	created_at?:boolean | `@${string}`,
	/** Данные лога в формате JSON */
	data?:boolean | `@${string}`,
	/** Локальный ID записи лога в рамках расширения */
	extension_local_id?:boolean | `@${string}`,
	/** Глобальный ID записи лога */
	id?:boolean | `@${string}`,
	/** Имя расширения */
	name?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	updated_at?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on ExtensionLog']?: Omit<ValueTypes["ExtensionLog"], "...on ExtensionLog">
}>;
	["ExtensionLogsPaginationResult"]: AliasType<{
	/** Текущая страница */
	currentPage?:boolean | `@${string}`,
	/** Элементы текущей страницы */
	items?:ValueTypes["ExtensionLog"],
	/** Общее количество элементов */
	totalCount?:boolean | `@${string}`,
	/** Общее количество страниц */
	totalPages?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on ExtensionLogsPaginationResult']?: Omit<ValueTypes["ExtensionLogsPaginationResult"], "...on ExtensionLogsPaginationResult">
}>;
	["GatewayPayment"]: AliasType<{
	/** Данные из блокчейна */
	blockchain_data?:boolean | `@${string}`,
	/** Можно ли изменить статус */
	can_change_status?:boolean | `@${string}`,
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** Дата создания */
	created_at?:boolean | `@${string}`,
	/** Направление платежа */
	direction?:boolean | `@${string}`,
	/** Человекочитаемое направление платежа */
	direction_label?:boolean | `@${string}`,
	/** Дата истечения */
	expired_at?:boolean | `@${string}`,
	/** Форматированная сумма */
	formatted_amount?:boolean | `@${string}`,
	/** Хеш платежа */
	hash?:boolean | `@${string}`,
	/** Уникальный идентификатор платежа */
	id?:boolean | `@${string}`,
	/** Хеш входящего платежа (устарело) */
	income_hash?:boolean | `@${string}`,
	/** Завершен ли платеж окончательно */
	is_final?:boolean | `@${string}`,
	/** Дополнительная информация */
	memo?:boolean | `@${string}`,
	/** Сообщение */
	message?:boolean | `@${string}`,
	/** Хеш исходящего платежа (устарело) */
	outcome_hash?:boolean | `@${string}`,
	/** Детали платежа */
	payment_details?:ValueTypes["PaymentDetails"],
	/** ID платежного метода */
	payment_method_id?:boolean | `@${string}`,
	/** Провайдер платежа */
	provider?:boolean | `@${string}`,
	/** Количество/сумма */
	quantity?:boolean | `@${string}`,
	/** Подписанный документ заявления */
	statement?:boolean | `@${string}`,
	/** Статус платежа */
	status?:boolean | `@${string}`,
	/** Человекочитаемый статус */
	status_label?:boolean | `@${string}`,
	/** Символ валюты */
	symbol?:boolean | `@${string}`,
	/** Тип платежа */
	type?:boolean | `@${string}`,
	/** Человекочитаемый тип платежа */
	type_label?:boolean | `@${string}`,
	/** Дата обновления */
	updated_at?:boolean | `@${string}`,
	/** Имя пользователя */
	username?:boolean | `@${string}`,
	/** Сертификат пользователя, создавшего платеж */
	username_certificate?:ValueTypes["UserCertificateUnion"],
		__typename?: boolean | `@${string}`,
	['...on GatewayPayment']?: Omit<ValueTypes["GatewayPayment"], "...on GatewayPayment">
}>;
	["GenerateDocumentOptionsInput"]: {
	/** Язык документа */
	lang?: string | undefined | null | Variable<any, string>,
	/** Пропустить сохранение */
	skip_save?: boolean | undefined | null | Variable<any, string>
};
	["GeneratedDocument"]: AliasType<{
	/** Бинарное содержимое документа (base64) */
	binary?:boolean | `@${string}`,
	/** Полное название документа */
	full_title?:boolean | `@${string}`,
	/** Хэш документа */
	hash?:boolean | `@${string}`,
	/** HTML содержимое документа */
	html?:boolean | `@${string}`,
	/** Метаданные документа */
	meta?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on GeneratedDocument']?: Omit<ValueTypes["GeneratedDocument"], "...on GeneratedDocument">
}>;
	["GeneratedRegistrationDocument"]: AliasType<{
	/** Тип соглашения для блокчейна */
	agreement_type?:boolean | `@${string}`,
	/** Текст для галочки на фронтенде */
	checkbox_text?:boolean | `@${string}`,
	/** Сгенерированный документ */
	document?:ValueTypes["GeneratedDocument"],
	/** Идентификатор соглашения (wallet_agreement, signature_agreement и т.д.) */
	id?:boolean | `@${string}`,
	/** Нужно ли отправлять в блокчейн как agreement */
	is_blockchain_agreement?:boolean | `@${string}`,
	/** Текст ссылки для открытия диалога чтения */
	link_text?:boolean | `@${string}`,
	/** Нужно ли линковать в заявление */
	link_to_statement?:boolean | `@${string}`,
	/** Порядок отображения */
	order?:boolean | `@${string}`,
	/** Название документа */
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on GeneratedRegistrationDocument']?: Omit<ValueTypes["GeneratedRegistrationDocument"], "...on GeneratedRegistrationDocument">
}>;
	["GetAccountInput"]: {
	/** Имя аккаунта пользователя */
	username: string | Variable<any, string>
};
	["GetAccountsInput"]: {
	role?: string | undefined | null | Variable<any, string>
};
	["GetBranchesInput"]: {
	/** Фильтр по имени аккаунта кооперативного участка */
	braname?: string | undefined | null | Variable<any, string>,
	/** Имя аккаунта кооператива */
	coopname: string | Variable<any, string>
};
	/** Входные данные для получения логов событий по задаче */
["GetCapitalIssueLogsInput"]: {
	/** Хеш задачи */
	issue_hash: string | Variable<any, string>
};
	/** Входные данные для получения логов событий с фильтрацией и пагинацией */
["GetCapitalLogsInput"]: {
	/** Фильтры для поиска логов */
	filter?: ValueTypes["CapitalLogFilterInput"] | undefined | null | Variable<any, string>,
	/** Параметры пагинации */
	pagination?: ValueTypes["PaginationInput"] | undefined | null | Variable<any, string>
};
	["GetExtensionLogsInput"]: {
	/** Фильтр по дате создания (от) */
	createdFrom?: ValueTypes["DateTime"] | undefined | null | Variable<any, string>,
	/** Фильтр по дате создания (до) */
	createdTo?: ValueTypes["DateTime"] | undefined | null | Variable<any, string>,
	/** Фильтр по имени расширения */
	name?: string | undefined | null | Variable<any, string>
};
	["GetExtensionsInput"]: {
	/** Фильтр включенных расширений */
	enabled?: boolean | undefined | null | Variable<any, string>,
	/** Фильтр активности */
	is_available?: boolean | undefined | null | Variable<any, string>,
	/** Фильтр рабочих столов */
	is_desktop?: boolean | undefined | null | Variable<any, string>,
	/** Фильтр установленных расширений */
	is_installed?: boolean | undefined | null | Variable<any, string>,
	/** Фильтр по имени */
	name?: string | undefined | null | Variable<any, string>
};
	["GetInstallationStatusInput"]: {
	/** Код установки */
	install_code: string | Variable<any, string>
};
	["GetPaymentMethodsInput"]: {
	/** Количество элементов на странице */
	limit: number | Variable<any, string>,
	/** Номер страницы */
	page: number | Variable<any, string>,
	/** Ключ сортировки (например, "name") */
	sortBy?: string | undefined | null | Variable<any, string>,
	/** Направление сортировки ("ASC" или "DESC") */
	sortOrder: string | Variable<any, string>,
	/** Имя пользователя для фильтрации методов оплаты */
	username?: string | undefined | null | Variable<any, string>
};
	["GetUserSubscriptionsInput"]: {
	/** Username пользователя */
	username: string | Variable<any, string>
};
	["Individual"]: AliasType<{
	/** Дата рождения */
	birthdate?:boolean | `@${string}`,
	/** Email */
	email?:boolean | `@${string}`,
	/** Имя */
	first_name?:boolean | `@${string}`,
	/** Полный адрес */
	full_address?:boolean | `@${string}`,
	/** Фамилия */
	last_name?:boolean | `@${string}`,
	/** Отчество */
	middle_name?:boolean | `@${string}`,
	/** Данные паспорта */
	passport?:ValueTypes["Passport"],
	/** Телефон */
	phone?:boolean | `@${string}`,
	/** Имя аккаунта */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on Individual']?: Omit<ValueTypes["Individual"], "...on Individual">
}>;
	["IndividualCertificate"]: AliasType<{
	/** Имя */
	first_name?:boolean | `@${string}`,
	/** Фамилия */
	last_name?:boolean | `@${string}`,
	/** Отчество */
	middle_name?:boolean | `@${string}`,
	/** Тип аккаунта */
	type?:boolean | `@${string}`,
	/** Имя аккаунта */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on IndividualCertificate']?: Omit<ValueTypes["IndividualCertificate"], "...on IndividualCertificate">
}>;
	["Init"]: {
	/** Объект организации кооператива, которая обслуживает данный экземпляр программного обеспечения MONO */
	organization_data: ValueTypes["CreateInitOrganizationDataInput"] | Variable<any, string>
};
	["Install"]: {
	soviet: Array<ValueTypes["SovietMemberInput"]> | Variable<any, string>,
	vars: ValueTypes["SetVarsInput"] | Variable<any, string>
};
	["InstallationStatus"]: AliasType<{
	/** Есть ли приватный аккаунт */
	has_private_account?:boolean | `@${string}`,
	/** Инициализация выполнена через сервер */
	init_by_server?:boolean | `@${string}`,
	/** Данные организации с банковскими реквизитами */
	organization_data?:ValueTypes["OrganizationWithBankAccount"],
		__typename?: boolean | `@${string}`,
	['...on InstallationStatus']?: Omit<ValueTypes["InstallationStatus"], "...on InstallationStatus">
}>;
	/** Статусы инвестиции в системе CAPITAL */
["InvestStatus"]:InvestStatus;
	/** Приоритет задачи в системе CAPITAL */
["IssuePriority"]:IssuePriority;
	/** Статус задачи в системе CAPITAL */
["IssueStatus"]:IssueStatus;
	/** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
["JSON"]:unknown;
	["KeyWeight"]: AliasType<{
	/** Ключ */
	key?:boolean | `@${string}`,
	/** Вес */
	weight?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on KeyWeight']?: Omit<ValueTypes["KeyWeight"], "...on KeyWeight">
}>;
	["LedgerOperation"]: AliasType<{
	/** ID счета */
	account_id?:boolean | `@${string}`,
	/** Тип операции */
	action?:boolean | `@${string}`,
	/** Комментарий к операции */
	comment?:boolean | `@${string}`,
	/** Имя кооператива */
	coopname?:boolean | `@${string}`,
	/** Дата и время создания операции */
	created_at?:boolean | `@${string}`,
	/** Номер глобальной последовательности блокчейна */
	global_sequence?:boolean | `@${string}`,
	/** Хеш пакета документов операции */
	hash?:boolean | `@${string}`,
	/** Сумма операции */
	quantity?:boolean | `@${string}`,
	/** Имя пользователя, совершившего операцию */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on LedgerOperation']?: Omit<ValueTypes["LedgerOperation"], "...on LedgerOperation">
}>;
	/** Типы сущностей в логах */
["LogEntityType"]:LogEntityType;
	/** Типы событий в системе логирования */
["LogEventType"]:LogEventType;
	/** Данные о собрании кооператива */
["Meet"]: AliasType<{
	/** Документ с решением совета о проведении собрания */
	authorization?:ValueTypes["DocumentAggregate"],
	/** Дата закрытия собрания */
	close_at?:boolean | `@${string}`,
	/** Имя аккаунта кооператива */
	coopname?:boolean | `@${string}`,
	/** Дата создания собрания */
	created_at?:boolean | `@${string}`,
	/** Текущий процент кворума */
	current_quorum_percent?:boolean | `@${string}`,
	/** Цикл собрания */
	cycle?:boolean | `@${string}`,
	/** Документ с решением секретаря */
	decision1?:ValueTypes["DocumentAggregate"],
	/** Документ с решением председателя */
	decision2?:ValueTypes["DocumentAggregate"],
	/** Хеш собрания */
	hash?:boolean | `@${string}`,
	/** Уникальный идентификатор собрания */
	id?:boolean | `@${string}`,
	/** Инициатор собрания */
	initiator?:boolean | `@${string}`,
	/** Сертификат инициатора собрания */
	initiator_certificate?:ValueTypes["UserCertificateUnion"],
	/** Уровень собрания */
	level?:boolean | `@${string}`,
	/** Список пользователей, которые подписали уведомление */
	notified_users?:boolean | `@${string}`,
	/** Дата открытия собрания */
	open_at?:boolean | `@${string}`,
	/** Председатель собрания */
	presider?:boolean | `@${string}`,
	/** Сертификат председателя собрания */
	presider_certificate?:ValueTypes["UserCertificateUnion"],
	/** Документ с повесткой собрания */
	proposal?:ValueTypes["DocumentAggregate"],
	/** Флаг достижения кворума */
	quorum_passed?:boolean | `@${string}`,
	/** Процент необходимого кворума */
	quorum_percent?:boolean | `@${string}`,
	/** Секретарь собрания */
	secretary?:boolean | `@${string}`,
	/** Сертификат секретаря собрания */
	secretary_certificate?:ValueTypes["UserCertificateUnion"],
	/** Количество подписанных бюллетеней */
	signed_ballots?:boolean | `@${string}`,
	/** Статус собрания */
	status?:boolean | `@${string}`,
	/** Тип собрания */
	type?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on Meet']?: Omit<ValueTypes["Meet"], "...on Meet">
}>;
	/** Предварительные данные собрания перед обработкой */
["MeetPreProcessing"]: AliasType<{
	/** Повестка собрания */
	agenda?:ValueTypes["AgendaMeetPoint"],
	/** Дата закрытия собрания */
	close_at?:boolean | `@${string}`,
	/** Имя аккаунта кооператива */
	coopname?:boolean | `@${string}`,
	/** Дополнительная информация о формате собрания */
	details?:boolean | `@${string}`,
	/** Хеш собрания */
	hash?:boolean | `@${string}`,
	/** Инициатор собрания */
	initiator?:boolean | `@${string}`,
	/** Сертификат инициатора собрания */
	initiator_certificate?:ValueTypes["UserCertificateUnion"],
	/** Дата открытия собрания */
	open_at?:boolean | `@${string}`,
	/** Председатель собрания */
	presider?:boolean | `@${string}`,
	/** Сертификат председателя собрания */
	presider_certificate?:ValueTypes["UserCertificateUnion"],
	/** Документ с предложением повестки собрания */
	proposal?:ValueTypes["DocumentAggregate"],
	/** Секретарь собрания */
	secretary?:boolean | `@${string}`,
	/** Сертификат секретаря собрания */
	secretary_certificate?:ValueTypes["UserCertificateUnion"],
		__typename?: boolean | `@${string}`,
	['...on MeetPreProcessing']?: Omit<ValueTypes["MeetPreProcessing"], "...on MeetPreProcessing">
}>;
	/** Данные о собрании после обработки */
["MeetProcessed"]: AliasType<{
	/** Имя кооператива */
	coopname?:boolean | `@${string}`,
	/** Документ решения из блокчейна */
	decision?:ValueTypes["SignedDigitalDocument"],
	/** Агрегат документа решения */
	decisionAggregate?:ValueTypes["DocumentAggregate"],
	/** Хеш собрания */
	hash?:boolean | `@${string}`,
	/** Председатель собрания */
	presider?:boolean | `@${string}`,
	/** Сертификат председателя собрания */
	presider_certificate?:ValueTypes["UserCertificateUnion"],
	/** Пройден ли кворум */
	quorum_passed?:boolean | `@${string}`,
	/** Процент кворума */
	quorum_percent?:boolean | `@${string}`,
	/** Результаты голосования по вопросам */
	results?:ValueTypes["MeetQuestionResult"],
	/** Секретарь собрания */
	secretary?:boolean | `@${string}`,
	/** Сертификат секретаря собрания */
	secretary_certificate?:ValueTypes["UserCertificateUnion"],
	/** Количество подписанных бюллетеней */
	signed_ballots?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on MeetProcessed']?: Omit<ValueTypes["MeetProcessed"], "...on MeetProcessed">
}>;
	/** Данные о собрании в процессе обработки */
["MeetProcessing"]: AliasType<{
	/** Расширенный статус собрания на основе дат и состояния */
	extendedStatus?:boolean | `@${string}`,
	/** Хеш собрания */
	hash?:boolean | `@${string}`,
	/** Флаг указывающий, голосовал ли текущий пользователь */
	isVoted?:boolean | `@${string}`,
	/** Основная информация о собрании */
	meet?:ValueTypes["Meet"],
	/** Список вопросов повестки собрания */
	questions?:ValueTypes["Question"],
		__typename?: boolean | `@${string}`,
	['...on MeetProcessing']?: Omit<ValueTypes["MeetProcessing"], "...on MeetProcessing">
}>;
	/** Результат голосования по вопросу */
["MeetQuestionResult"]: AliasType<{
	/** Принят ли вопрос */
	accepted?:boolean | `@${string}`,
	/** Контекст вопроса */
	context?:boolean | `@${string}`,
	/** Принятое решение */
	decision?:boolean | `@${string}`,
	/** Порядковый номер вопроса */
	number?:boolean | `@${string}`,
	/** Идентификатор вопроса */
	question_id?:boolean | `@${string}`,
	/** Заголовок вопроса */
	title?:boolean | `@${string}`,
	/** Количество воздержавшихся */
	votes_abstained?:boolean | `@${string}`,
	/** Количество голосов против */
	votes_against?:boolean | `@${string}`,
	/** Количество голосов за */
	votes_for?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on MeetQuestionResult']?: Omit<ValueTypes["MeetQuestionResult"], "...on MeetQuestionResult">
}>;
	["MonoAccount"]: AliasType<{
	/** Электронная почта пользователя */
	email?:boolean | `@${string}`,
	/** Есть ли у пользователя аккаунт */
	has_account?:boolean | `@${string}`,
	/** ID начального заказа */
	initial_order?:boolean | `@${string}`,
	/** Подтверждена ли электронная почта */
	is_email_verified?:boolean | `@${string}`,
	/** Зарегистрирован ли пользователь */
	is_registered?:boolean | `@${string}`,
	/** Сообщение */
	message?:boolean | `@${string}`,
	/** Публичный ключ пользователя */
	public_key?:boolean | `@${string}`,
	/** Реферер пользователя */
	referer?:boolean | `@${string}`,
	/** Роль пользователя */
	role?:boolean | `@${string}`,
	/** Статус пользователя */
	status?:boolean | `@${string}`,
	/** Хэш подписчика для уведомлений */
	subscriber_hash?:boolean | `@${string}`,
	/** Идентификатор подписчика для уведомлений */
	subscriber_id?:boolean | `@${string}`,
	/** Тип пользователя */
	type?:boolean | `@${string}`,
	/** Имя пользователя */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on MonoAccount']?: Omit<ValueTypes["MonoAccount"], "...on MonoAccount">
}>;
	["Mutation"]: AliasType<{
addPaymentMethod?: [{	data: ValueTypes["AddPaymentMethodInput"] | Variable<any, string>},ValueTypes["PaymentMethod"]],
addTrustedAccount?: [{	data: ValueTypes["AddTrustedAccountInput"] | Variable<any, string>},ValueTypes["Branch"]],
createBranch?: [{	data: ValueTypes["CreateBranchInput"] | Variable<any, string>},ValueTypes["Branch"]],
createWebPushSubscription?: [{	data: ValueTypes["CreateSubscriptionInput"] | Variable<any, string>},ValueTypes["CreateSubscriptionResponse"]],
deactivateWebPushSubscriptionById?: [{	data: ValueTypes["DeactivateSubscriptionInput"] | Variable<any, string>},boolean | `@${string}`],
deleteBranch?: [{	data: ValueTypes["DeleteBranchInput"] | Variable<any, string>},boolean | `@${string}`],
deletePaymentMethod?: [{	data: ValueTypes["DeletePaymentMethodInput"] | Variable<any, string>},boolean | `@${string}`],
deleteTrustedAccount?: [{	data: ValueTypes["DeleteTrustedAccountInput"] | Variable<any, string>},ValueTypes["Branch"]],
editBranch?: [{	data: ValueTypes["EditBranchInput"] | Variable<any, string>},ValueTypes["Branch"]],
generateSelectBranchDocument?: [{	data: ValueTypes["SelectBranchGenerateDocumentInput"] | Variable<any, string>,	options?: ValueTypes["GenerateDocumentOptionsInput"] | undefined | null | Variable<any, string>},ValueTypes["GeneratedDocument"]],
initSystem?: [{	data: ValueTypes["Init"] | Variable<any, string>},ValueTypes["SystemInfo"]],
installExtension?: [{	data: ValueTypes["ExtensionInput"] | Variable<any, string>},ValueTypes["Extension"]],
installSystem?: [{	data: ValueTypes["Install"] | Variable<any, string>},ValueTypes["SystemInfo"]],
registerAccount?: [{	data: ValueTypes["RegisterAccountInput"] | Variable<any, string>},ValueTypes["RegisteredAccount"]],
selectBranch?: [{	data: ValueTypes["SelectBranchInput"] | Variable<any, string>},boolean | `@${string}`],
setWif?: [{	data: ValueTypes["SetWifInput"] | Variable<any, string>},boolean | `@${string}`],
startInstall?: [{	data: ValueTypes["StartInstallInput"] | Variable<any, string>},ValueTypes["StartInstallResult"]],
uninstallExtension?: [{	data: ValueTypes["UninstallExtensionInput"] | Variable<any, string>},boolean | `@${string}`],
updateAccount?: [{	data: ValueTypes["UpdateAccountInput"] | Variable<any, string>},ValueTypes["Account"]],
updateBankAccount?: [{	data: ValueTypes["UpdateBankAccountInput"] | Variable<any, string>},ValueTypes["PaymentMethod"]],
updateExtension?: [{	data: ValueTypes["ExtensionInput"] | Variable<any, string>},ValueTypes["Extension"]],
updateSettings?: [{	data: ValueTypes["UpdateSettingsInput"] | Variable<any, string>},ValueTypes["Settings"]],
updateSystem?: [{	data: ValueTypes["Update"] | Variable<any, string>},ValueTypes["SystemInfo"]],
		__typename?: boolean | `@${string}`,
	['...on Mutation']?: Omit<ValueTypes["Mutation"], "...on Mutation">
}>;
	["OneCoopDocumentOutput"]: AliasType<{
	/** Тип действия документа */
	action?:boolean | `@${string}`,
	/** Номер блока, в котором документ был зафиксирован */
	block_num?:boolean | `@${string}`,
	/** Специфичные данные для конкретного типа действия */
	data?:boolean | `@${string}`,
	/** SHA-256 хеш основного документа */
	hash?:boolean | `@${string}`,
	/** SHA-256 хеш пакета документов */
	package?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on OneCoopDocumentOutput']?: Omit<ValueTypes["OneCoopDocumentOutput"], "...on OneCoopDocumentOutput">
}>;
	["Organization"]: AliasType<{
	/** Город */
	city?:boolean | `@${string}`,
	/** Страна */
	country?:boolean | `@${string}`,
	/** Детали организации */
	details?:ValueTypes["OrganizationDetails"],
	/** Email */
	email?:boolean | `@${string}`,
	/** Фактический адрес */
	fact_address?:boolean | `@${string}`,
	/** Юридический адрес */
	full_address?:boolean | `@${string}`,
	/** Полное название */
	full_name?:boolean | `@${string}`,
	/** Телефон */
	phone?:boolean | `@${string}`,
	/** Представитель организации */
	represented_by?:ValueTypes["RepresentedBy"],
	/** Краткое название */
	short_name?:boolean | `@${string}`,
	/** Тип организации */
	type?:boolean | `@${string}`,
	/** Имя аккаунта организации */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on Organization']?: Omit<ValueTypes["Organization"], "...on Organization">
}>;
	["OrganizationCertificate"]: AliasType<{
	/** ИНН */
	inn?:boolean | `@${string}`,
	/** ОГРН */
	ogrn?:boolean | `@${string}`,
	/** Данные представителя */
	represented_by?:ValueTypes["RepresentedByCertificate"],
	/** Короткое название организации */
	short_name?:boolean | `@${string}`,
	/** Тип аккаунта */
	type?:boolean | `@${string}`,
	/** Имя аккаунта */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on OrganizationCertificate']?: Omit<ValueTypes["OrganizationCertificate"], "...on OrganizationCertificate">
}>;
	["OrganizationDetails"]: AliasType<{
	/** ИНН */
	inn?:boolean | `@${string}`,
	/** КПП */
	kpp?:boolean | `@${string}`,
	/** ОГРН */
	ogrn?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on OrganizationDetails']?: Omit<ValueTypes["OrganizationDetails"], "...on OrganizationDetails">
}>;
	["OrganizationDetailsInput"]: {
	inn: string | Variable<any, string>,
	kpp: string | Variable<any, string>,
	ogrn: string | Variable<any, string>
};
	/** Тип юридического лица */
["OrganizationType"]:OrganizationType;
	["OrganizationWithBankAccount"]: AliasType<{
	/** Банковские реквизиты */
	bank_account?:ValueTypes["BankAccount"],
	/** Город */
	city?:boolean | `@${string}`,
	/** Страна */
	country?:boolean | `@${string}`,
	/** Детали организации */
	details?:ValueTypes["OrganizationDetails"],
	/** Email */
	email?:boolean | `@${string}`,
	/** Фактический адрес */
	fact_address?:boolean | `@${string}`,
	/** Юридический адрес */
	full_address?:boolean | `@${string}`,
	/** Полное название */
	full_name?:boolean | `@${string}`,
	/** Телефон */
	phone?:boolean | `@${string}`,
	/** Представитель организации */
	represented_by?:ValueTypes["RepresentedBy"],
	/** Краткое название */
	short_name?:boolean | `@${string}`,
	/** Тип организации */
	type?:boolean | `@${string}`,
	/** Имя аккаунта организации */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on OrganizationWithBankAccount']?: Omit<ValueTypes["OrganizationWithBankAccount"], "...on OrganizationWithBankAccount">
}>;
	["PaginatedCapitalLogsPaginationResult"]: AliasType<{
	/** Текущая страница */
	currentPage?:boolean | `@${string}`,
	/** Элементы текущей страницы */
	items?:ValueTypes["CapitalLog"],
	/** Общее количество элементов */
	totalCount?:boolean | `@${string}`,
	/** Общее количество страниц */
	totalPages?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on PaginatedCapitalLogsPaginationResult']?: Omit<ValueTypes["PaginatedCapitalLogsPaginationResult"], "...on PaginatedCapitalLogsPaginationResult">
}>;
	["PaginationInput"]: {
	/** Количество элементов на странице */
	limit: number | Variable<any, string>,
	/** Номер страницы */
	page: number | Variable<any, string>,
	/** Ключ сортировки (например, "name") */
	sortBy?: string | undefined | null | Variable<any, string>,
	/** Направление сортировки ("ASC" или "DESC") */
	sortOrder: string | Variable<any, string>
};
	["ParticipantAccount"]: AliasType<{
	/** Имя кооперативного участка */
	braname?:boolean | `@${string}`,
	/** Время создания записи о члене */
	created_at?:boolean | `@${string}`,
	/** LEGACY Флаг, имеет ли член право голоса */
	has_vote?:boolean | `@${string}`,
	/** Сумма вступительного взноса */
	initial_amount?:boolean | `@${string}`,
	/** LEGACY Флаг, внесен ли регистрационный взнос */
	is_initial?:boolean | `@${string}`,
	/** LEGACY Флаг, внесен ли минимальный паевый взнос */
	is_minimum?:boolean | `@${string}`,
	/** Время последнего минимального платежа */
	last_min_pay?:boolean | `@${string}`,
	/** Время последнего обновления информации о члене */
	last_update?:boolean | `@${string}`,
	/** Сумма минимального паевого взноса */
	minimum_amount?:boolean | `@${string}`,
	/** Статус члена кооператива (accepted | blocked) */
	status?:boolean | `@${string}`,
	/** Тип участника (individual | entrepreneur | organization) */
	type?:boolean | `@${string}`,
	/** Уникальное имя члена кооператива */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on ParticipantAccount']?: Omit<ValueTypes["ParticipantAccount"], "...on ParticipantAccount">
}>;
	["Passport"]: AliasType<{
	/** Код подразделения */
	code?:boolean | `@${string}`,
	/** Дата выдачи */
	issued_at?:boolean | `@${string}`,
	/** Кем выдан */
	issued_by?:boolean | `@${string}`,
	/** Номер паспорта */
	number?:boolean | `@${string}`,
	/** Серия паспорта */
	series?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on Passport']?: Omit<ValueTypes["Passport"], "...on Passport">
}>;
	["PassportInput"]: {
	code: string | Variable<any, string>,
	issued_at: string | Variable<any, string>,
	issued_by: string | Variable<any, string>,
	number: number | Variable<any, string>,
	series: number | Variable<any, string>
};
	["PaymentDetails"]: AliasType<{
	/** Сумма платежа с учетом комиссии */
	amount_plus_fee?:boolean | `@${string}`,
	/** Сумма платежа без учета комиссии */
	amount_without_fee?:boolean | `@${string}`,
	/** Данные платежа (QR-код, токен, реквизиты и т.д.) */
	data?:boolean | `@${string}`,
	/** Фактический процент комиссии */
	fact_fee_percent?:boolean | `@${string}`,
	/** Размер комиссии в абсолютных значениях */
	fee_amount?:boolean | `@${string}`,
	/** Процент комиссии */
	fee_percent?:boolean | `@${string}`,
	/** Допустимый процент отклонения */
	tolerance_percent?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on PaymentDetails']?: Omit<ValueTypes["PaymentDetails"], "...on PaymentDetails">
}>;
	/** Направление платежа */
["PaymentDirection"]:PaymentDirection;
	["PaymentMethod"]: AliasType<{
	/** Дата создания */
	created_at?:boolean | `@${string}`,
	/** Данные метода оплаты */
	data?:ValueTypes["PaymentMethodData"],
	/** Флаг основного метода платежа, который отображается в документах */
	is_default?:boolean | `@${string}`,
	/** Идентификатор метода оплаты */
	method_id?:boolean | `@${string}`,
	/** Тип метода оплаты (например, sbp, bank_transfer) */
	method_type?:boolean | `@${string}`,
	/** Дата обновления */
	updated_at?:boolean | `@${string}`,
	/** Имя пользователя, к которому привязан метод оплаты */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on PaymentMethod']?: Omit<ValueTypes["PaymentMethod"], "...on PaymentMethod">
}>;
	["PaymentMethodData"]: AliasType<{		["...on BankAccount"]?: ValueTypes["BankAccount"],
		["...on SbpAccount"]?: ValueTypes["SbpAccount"]
		__typename?: boolean | `@${string}`
}>;
	["PaymentMethodPaginationResult"]: AliasType<{
	/** Текущая страница */
	currentPage?:boolean | `@${string}`,
	/** Элементы текущей страницы */
	items?:ValueTypes["PaymentMethod"],
	/** Общее количество элементов */
	totalCount?:boolean | `@${string}`,
	/** Общее количество страниц */
	totalPages?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on PaymentMethodPaginationResult']?: Omit<ValueTypes["PaymentMethodPaginationResult"], "...on PaymentMethodPaginationResult">
}>;
	/** Статус платежа */
["PaymentStatus"]:PaymentStatus;
	/** Тип платежа по назначению */
["PaymentType"]:PaymentType;
	["Permission"]: AliasType<{
	/** Родительское разрешение */
	parent?:boolean | `@${string}`,
	/** Имя разрешения */
	perm_name?:boolean | `@${string}`,
	/** Требуемые разрешения */
	required_auth?:ValueTypes["Authority"],
		__typename?: boolean | `@${string}`,
	['...on Permission']?: Omit<ValueTypes["Permission"], "...on Permission">
}>;
	["PermissionLevel"]: AliasType<{
	/** Актор */
	actor?:boolean | `@${string}`,
	/** Разрешение */
	permission?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on PermissionLevel']?: Omit<ValueTypes["PermissionLevel"], "...on PermissionLevel">
}>;
	["PermissionLevelWeight"]: AliasType<{
	/** Уровень разрешения */
	permission?:ValueTypes["PermissionLevel"],
	/** Вес */
	weight?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on PermissionLevelWeight']?: Omit<ValueTypes["PermissionLevelWeight"], "...on PermissionLevelWeight">
}>;
	["PrivateAccount"]: AliasType<{
	entrepreneur_data?:ValueTypes["Entrepreneur"],
	individual_data?:ValueTypes["Individual"],
	organization_data?:ValueTypes["Organization"],
	/** Тип аккаунта */
	type?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on PrivateAccount']?: Omit<ValueTypes["PrivateAccount"], "...on PrivateAccount">
}>;
	["PrivateAccountSearchData"]: AliasType<{		["...on Entrepreneur"]?: ValueTypes["Entrepreneur"],
		["...on Individual"]?: ValueTypes["Individual"],
		["...on Organization"]?: ValueTypes["Organization"]
		__typename?: boolean | `@${string}`
}>;
	["PrivateAccountSearchResult"]: AliasType<{
	/** Данные найденного аккаунта */
	data?:ValueTypes["PrivateAccountSearchData"],
	/** Поля, в которых найдены совпадения */
	highlightedFields?:boolean | `@${string}`,
	/** Оценка релевантности результата */
	score?:boolean | `@${string}`,
	/** Тип аккаунта */
	type?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on PrivateAccountSearchResult']?: Omit<ValueTypes["PrivateAccountSearchResult"], "...on PrivateAccountSearchResult">
}>;
	["ProcessEdge"]: AliasType<{
	id?:boolean | `@${string}`,
	source?:boolean | `@${string}`,
	target?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on ProcessEdge']?: Omit<ValueTypes["ProcessEdge"], "...on ProcessEdge">
}>;
	["ProcessStepPosition"]: AliasType<{
	x?:boolean | `@${string}`,
	y?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on ProcessStepPosition']?: Omit<ValueTypes["ProcessStepPosition"], "...on ProcessStepPosition">
}>;
	["ProcessStepPositionInput"]: {
	x: number | Variable<any, string>,
	y: number | Variable<any, string>
};
	["ProcessStepState"]: AliasType<{
	completed_at?:boolean | `@${string}`,
	issue_hash?:boolean | `@${string}`,
	status?:boolean | `@${string}`,
	step_id?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on ProcessStepState']?: Omit<ValueTypes["ProcessStepState"], "...on ProcessStepState">
}>;
	["ProcessStepStatus"]:ProcessStepStatus;
	["ProcessStepTemplate"]: AliasType<{
	description?:boolean | `@${string}`,
	estimate?:boolean | `@${string}`,
	id?:boolean | `@${string}`,
	is_start?:boolean | `@${string}`,
	position?:ValueTypes["ProcessStepPosition"],
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on ProcessStepTemplate']?: Omit<ValueTypes["ProcessStepTemplate"], "...on ProcessStepTemplate">
}>;
	/** Статус программной инвестиции в системе CAPITAL */
["ProgramInvestStatus"]:ProgramInvestStatus;
	/** Тип целевой потребительской программы */
["ProgramType"]:ProgramType;
	["ProgramWallet"]: AliasType<{
	/** Идентификатор соглашения */
	agreement_id?:boolean | `@${string}`,
	/** Доступный баланс (формат: "100.0000 RUB") */
	available?:boolean | `@${string}`,
	/** Номер блока последнего обновления */
	blockNum?:boolean | `@${string}`,
	/** Заблокированный баланс (формат: "100.0000 RUB") */
	blocked?:boolean | `@${string}`,
	/** Имя кооператива */
	coopname?:boolean | `@${string}`,
	/** Уникальный идентификатор кошелька в блокчейне */
	id?:boolean | `@${string}`,
	/** Паевой взнос (формат: "100.0000 RUB") */
	membership_contribution?:boolean | `@${string}`,
	/** Идентификатор программы */
	program_id?:boolean | `@${string}`,
	/** Тип программы */
	program_type?:boolean | `@${string}`,
	/** Имя пользователя */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on ProgramWallet']?: Omit<ValueTypes["ProgramWallet"], "...on ProgramWallet">
}>;
	/** Статусы проекта в системе CAPITAL */
["ProjectStatus"]:ProjectStatus;
	["PublicChairman"]: AliasType<{
	first_name?:boolean | `@${string}`,
	last_name?:boolean | `@${string}`,
	middle_name?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on PublicChairman']?: Omit<ValueTypes["PublicChairman"], "...on PublicChairman">
}>;
	["Query"]: AliasType<{
getAccount?: [{	data: ValueTypes["GetAccountInput"] | Variable<any, string>},ValueTypes["Account"]],
getAccounts?: [{	data?: ValueTypes["GetAccountsInput"] | undefined | null | Variable<any, string>,	options?: ValueTypes["PaginationInput"] | undefined | null | Variable<any, string>},ValueTypes["AccountsPaginationResult"]],
getBranches?: [{	data: ValueTypes["GetBranchesInput"] | Variable<any, string>},ValueTypes["Branch"]],
getCapitalIssueLogs?: [{	data: ValueTypes["GetCapitalIssueLogsInput"] | Variable<any, string>,	options?: ValueTypes["PaginationInput"] | undefined | null | Variable<any, string>},ValueTypes["PaginatedCapitalLogsPaginationResult"]],
getCapitalProjectLogs?: [{	data: ValueTypes["GetCapitalLogsInput"] | Variable<any, string>},ValueTypes["PaginatedCapitalLogsPaginationResult"]],
	/** Получить состав приложений рабочего стола */
	getDesktop?:ValueTypes["Desktop"],
getExtensionLogs?: [{	data?: ValueTypes["GetExtensionLogsInput"] | undefined | null | Variable<any, string>,	options?: ValueTypes["PaginationInput"] | undefined | null | Variable<any, string>},ValueTypes["ExtensionLogsPaginationResult"]],
getExtensions?: [{	data?: ValueTypes["GetExtensionsInput"] | undefined | null | Variable<any, string>},ValueTypes["Extension"]],
getInstallationStatus?: [{	data: ValueTypes["GetInstallationStatusInput"] | Variable<any, string>},ValueTypes["InstallationStatus"]],
getPaymentMethods?: [{	data?: ValueTypes["GetPaymentMethodsInput"] | undefined | null | Variable<any, string>},ValueTypes["PaymentMethodPaginationResult"]],
getRegistrationConfig?: [{	account_type: ValueTypes["AccountType"] | Variable<any, string>,	coopname: string | Variable<any, string>},ValueTypes["RegistrationConfig"]],
	/** Получить сводную публичную информацию о системе */
	getSystemInfo?:ValueTypes["SystemInfo"],
getUserWebPushSubscriptions?: [{	data: ValueTypes["GetUserSubscriptionsInput"] | Variable<any, string>},ValueTypes["WebPushSubscriptionDto"]],
	/** Получить статистику веб-пуш подписок (только для председателя)

Требуемые роли: chairman.  */
	getWebPushSubscriptionStats?:ValueTypes["SubscriptionStatsDto"],
searchPrivateAccounts?: [{	data: ValueTypes["SearchPrivateAccountsInput"] | Variable<any, string>},ValueTypes["PrivateAccountSearchResult"]],
		__typename?: boolean | `@${string}`,
	['...on Query']?: Omit<ValueTypes["Query"], "...on Query">
}>;
	/** Вопрос повестки собрания с результатами голосования */
["Question"]: AliasType<{
	/** Контекст или дополнительная информация по вопросу */
	context?:boolean | `@${string}`,
	/** Имя аккаунта кооператива */
	coopname?:boolean | `@${string}`,
	/** Количество голосов "Воздержался" */
	counter_votes_abstained?:boolean | `@${string}`,
	/** Количество голосов "Против" */
	counter_votes_against?:boolean | `@${string}`,
	/** Количество голосов "За" */
	counter_votes_for?:boolean | `@${string}`,
	/** Предлагаемое решение по вопросу */
	decision?:boolean | `@${string}`,
	/** Уникальный идентификатор вопроса */
	id?:boolean | `@${string}`,
	/** Идентификатор собрания, к которому относится вопрос */
	meet_id?:boolean | `@${string}`,
	/** Порядковый номер вопроса в повестке */
	number?:boolean | `@${string}`,
	/** Заголовок вопроса */
	title?:boolean | `@${string}`,
	/** Список участников, проголосовавших "Воздержался" */
	voters_abstained?:boolean | `@${string}`,
	/** Список участников, проголосовавших "Против" */
	voters_against?:boolean | `@${string}`,
	/** Список участников, проголосовавших "За" */
	voters_for?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on Question']?: Omit<ValueTypes["Question"], "...on Question">
}>;
	["RefundRequest"]: AliasType<{
	/** Сумма CPU */
	cpu_amount?:boolean | `@${string}`,
	/** Сумма сети */
	net_amount?:boolean | `@${string}`,
	/** Владелец */
	owner?:boolean | `@${string}`,
	/** Время запроса */
	request_time?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on RefundRequest']?: Omit<ValueTypes["RefundRequest"], "...on RefundRequest">
}>;
	["RegisterAccountInput"]: {
	/** Электронная почта */
	email: string | Variable<any, string>,
	/** Данные индивидуального предпринимателя */
	entrepreneur_data?: ValueTypes["CreateEntrepreneurDataInput"] | undefined | null | Variable<any, string>,
	/** Данные физического лица */
	individual_data?: ValueTypes["CreateIndividualDataInput"] | undefined | null | Variable<any, string>,
	/** Данные организации */
	organization_data?: ValueTypes["CreateOrganizationDataInput"] | undefined | null | Variable<any, string>,
	/** Публичный ключ */
	public_key: string | Variable<any, string>,
	/** Имя аккаунта реферера */
	referer?: string | undefined | null | Variable<any, string>,
	/** Тип аккаунта */
	type: ValueTypes["AccountType"] | Variable<any, string>,
	/** Имя пользователя */
	username: string | Variable<any, string>
};
	["RegisteredAccount"]: AliasType<{
	/** Информация об зарегистрированном аккаунте */
	account?:ValueTypes["Account"],
	/** Токены доступа и обновления */
	tokens?:ValueTypes["Tokens"],
		__typename?: boolean | `@${string}`,
	['...on RegisteredAccount']?: Omit<ValueTypes["RegisteredAccount"], "...on RegisteredAccount">
}>;
	["RegistrationConfig"]: AliasType<{
	/** Доступные программы */
	programs?:ValueTypes["RegistrationProgram"],
	/** Нужен ли выбор программы */
	requires_selection?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on RegistrationConfig']?: Omit<ValueTypes["RegistrationConfig"], "...on RegistrationConfig">
}>;
	["RegistrationProgram"]: AliasType<{
	/** Для каких типов аккаунтов доступна программа */
	applicable_account_types?:boolean | `@${string}`,
	/** Описание программы */
	description?:boolean | `@${string}`,
	/** URL изображения (опционально) */
	image_url?:boolean | `@${string}`,
	/** Уникальный ключ программы */
	key?:boolean | `@${string}`,
	/** Порядок отображения */
	order?:boolean | `@${string}`,
	/** Минимальные требования для участия */
	requirements?:boolean | `@${string}`,
	/** Название программы для отображения */
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on RegistrationProgram']?: Omit<ValueTypes["RegistrationProgram"], "...on RegistrationProgram">
}>;
	["RepresentedBy"]: AliasType<{
	/** На основании чего действует */
	based_on?:boolean | `@${string}`,
	/** Имя */
	first_name?:boolean | `@${string}`,
	/** Фамилия */
	last_name?:boolean | `@${string}`,
	/** Отчество */
	middle_name?:boolean | `@${string}`,
	/** Должность */
	position?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on RepresentedBy']?: Omit<ValueTypes["RepresentedBy"], "...on RepresentedBy">
}>;
	["RepresentedByCertificate"]: AliasType<{
	/** Имя */
	first_name?:boolean | `@${string}`,
	/** Фамилия */
	last_name?:boolean | `@${string}`,
	/** Отчество */
	middle_name?:boolean | `@${string}`,
	/** Должность */
	position?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on RepresentedByCertificate']?: Omit<ValueTypes["RepresentedByCertificate"], "...on RepresentedByCertificate">
}>;
	["RepresentedByInput"]: {
	based_on: string | Variable<any, string>,
	first_name: string | Variable<any, string>,
	last_name: string | Variable<any, string>,
	middle_name: string | Variable<any, string>,
	position: string | Variable<any, string>
};
	["ResourceDelegationDTO"]: AliasType<{
	/** Вес CPU */
	cpu_weight?:boolean | `@${string}`,
	/** Отправитель */
	from?:boolean | `@${string}`,
	/** Вес сети */
	net_weight?:boolean | `@${string}`,
	/** Получатель */
	to?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on ResourceDelegationDTO']?: Omit<ValueTypes["ResourceDelegationDTO"], "...on ResourceDelegationDTO">
}>;
	["ResourceOverview"]: AliasType<{
	/** Вес CPU */
	cpu_weight?:boolean | `@${string}`,
	/** Вес сети */
	net_weight?:boolean | `@${string}`,
	/** Владелец */
	owner?:boolean | `@${string}`,
	/** Используемая RAM */
	ram_bytes?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on ResourceOverview']?: Omit<ValueTypes["ResourceOverview"], "...on ResourceOverview">
}>;
	/** Статус результата в системе CAPITAL */
["ResultStatus"]:ResultStatus;
	["SbpAccount"]: AliasType<{
	/** Мобильный телефон получателя */
	phone?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on SbpAccount']?: Omit<ValueTypes["SbpAccount"], "...on SbpAccount">
}>;
	["SbpDataInput"]: {
	/** Мобильный телефон получателя */
	phone: string | Variable<any, string>
};
	["SearchPrivateAccountsInput"]: {
	/** Поисковый запрос для поиска приватных аккаунтов */
	query: string | Variable<any, string>
};
	/** Статус сегмента участника в проекте CAPITAL */
["SegmentStatus"]:SegmentStatus;
	["SelectBranchGenerateDocumentInput"]: {
	/** Номер блока, на котором был создан документ */
	block_num?: number | undefined | null | Variable<any, string>,
	/** Идентификатор имени аккаунта кооперативного участка */
	braname: string | Variable<any, string>,
	/** Название кооператива, связанное с документом */
	coopname: string | Variable<any, string>,
	/** Дата и время создания документа */
	created_at?: string | undefined | null | Variable<any, string>,
	/** Имя генератора, использованного для создания документа */
	generator?: string | undefined | null | Variable<any, string>,
	/** Язык документа */
	lang?: string | undefined | null | Variable<any, string>,
	/** Ссылки, связанные с документом */
	links?: Array<string> | undefined | null | Variable<any, string>,
	/** Часовой пояс, в котором был создан документ */
	timezone?: string | undefined | null | Variable<any, string>,
	/** Название документа */
	title?: string | undefined | null | Variable<any, string>,
	/** Имя пользователя, создавшего документ */
	username: string | Variable<any, string>,
	/** Версия генератора, использованного для создания документа */
	version?: string | undefined | null | Variable<any, string>
};
	["SelectBranchInput"]: {
	/** Имя аккаунта кооперативного участка */
	braname: string | Variable<any, string>,
	/** Имя аккаунта кооператива */
	coopname: string | Variable<any, string>,
	/** Подписанный электронный документ (generateSelectBranchDocument) */
	document: ValueTypes["SelectBranchSignedDocumentInput"] | Variable<any, string>,
	/** Имя аккаунта пользователя */
	username: string | Variable<any, string>
};
	["SelectBranchSignedDocumentInput"]: {
	/** Хэш содержимого документа */
	doc_hash: string | Variable<any, string>,
	/** Общий хэш (doc_hash + meta_hash) */
	hash: string | Variable<any, string>,
	/** Метаинформация для документа выбора кооперативного участка */
	meta: ValueTypes["SelectBranchSignedMetaDocumentInput"] | Variable<any, string>,
	/** Хэш мета-данных */
	meta_hash: string | Variable<any, string>,
	/** Вектор подписей */
	signatures: Array<ValueTypes["SignatureInfoInput"]> | Variable<any, string>,
	/** Версия стандарта документа */
	version: string | Variable<any, string>
};
	["SelectBranchSignedMetaDocumentInput"]: {
	/** Номер блока, на котором был создан документ */
	block_num: number | Variable<any, string>,
	/** Идентификатор имени аккаунта кооперативного участка */
	braname: string | Variable<any, string>,
	/** Название кооператива, связанное с документом */
	coopname: string | Variable<any, string>,
	/** Дата и время создания документа */
	created_at: string | Variable<any, string>,
	/** Имя генератора, использованного для создания документа */
	generator: string | Variable<any, string>,
	/** Язык документа */
	lang: string | Variable<any, string>,
	/** Ссылки, связанные с документом */
	links: Array<string> | Variable<any, string>,
	/** ID документа в реестре */
	registry_id: number | Variable<any, string>,
	/** Часовой пояс, в котором был создан документ */
	timezone: string | Variable<any, string>,
	/** Название документа */
	title: string | Variable<any, string>,
	/** Имя пользователя, создавшего документ */
	username: string | Variable<any, string>,
	/** Версия генератора, использованного для создания документа */
	version: string | Variable<any, string>
};
	["SetVarsInput"]: {
	confidential_email: string | Variable<any, string>,
	confidential_link: string | Variable<any, string>,
	contact_email: string | Variable<any, string>,
	coopenomics_agreement?: ValueTypes["AgreementVarInput"] | undefined | null | Variable<any, string>,
	coopname: string | Variable<any, string>,
	full_abbr: string | Variable<any, string>,
	full_abbr_dative: string | Variable<any, string>,
	full_abbr_genitive: string | Variable<any, string>,
	name: string | Variable<any, string>,
	participant_application?: ValueTypes["AgreementVarInput"] | undefined | null | Variable<any, string>,
	passport_request?: string | undefined | null | Variable<any, string>,
	privacy_agreement?: ValueTypes["AgreementVarInput"] | undefined | null | Variable<any, string>,
	short_abbr: string | Variable<any, string>,
	signature_agreement?: ValueTypes["AgreementVarInput"] | undefined | null | Variable<any, string>,
	statute_link: string | Variable<any, string>,
	user_agreement?: ValueTypes["AgreementVarInput"] | undefined | null | Variable<any, string>,
	wallet_agreement?: ValueTypes["AgreementVarInput"] | undefined | null | Variable<any, string>,
	website: string | Variable<any, string>
};
	["SetWifInput"]: {
	/** Тип разрешения ключа */
	permission: string | Variable<any, string>,
	/** Имя пользователя, чей ключ */
	username: string | Variable<any, string>,
	/** Приватный ключ */
	wif: string | Variable<any, string>
};
	["Settings"]: AliasType<{
	/** Маршрут по умолчанию для авторизованных пользователей */
	authorized_default_route?:boolean | `@${string}`,
	/** Рабочий стол по умолчанию для авторизованных пользователей */
	authorized_default_workspace?:boolean | `@${string}`,
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** Дата создания */
	created_at?:boolean | `@${string}`,
	/** Маршрут по умолчанию для неавторизованных пользователей */
	non_authorized_default_route?:boolean | `@${string}`,
	/** Рабочий стол по умолчанию для неавторизованных пользователей */
	non_authorized_default_workspace?:boolean | `@${string}`,
	/** Имя провайдера платежей по умолчанию */
	provider_name?:boolean | `@${string}`,
	/** Дата последнего обновления */
	updated_at?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on Settings']?: Omit<ValueTypes["Settings"], "...on Settings">
}>;
	["SignatureInfo"]: AliasType<{
	id?:boolean | `@${string}`,
	is_valid?:boolean | `@${string}`,
	meta?:boolean | `@${string}`,
	public_key?:boolean | `@${string}`,
	signature?:boolean | `@${string}`,
	signed_at?:boolean | `@${string}`,
	signed_hash?:boolean | `@${string}`,
	signer?:boolean | `@${string}`,
	/** Сертификат подписанта (сокращенная информация) */
	signer_certificate?:ValueTypes["UserCertificateUnion"],
		__typename?: boolean | `@${string}`,
	['...on SignatureInfo']?: Omit<ValueTypes["SignatureInfo"], "...on SignatureInfo">
}>;
	["SignatureInfoInput"]: {
	/** Идентификатор номера подписи */
	id: number | Variable<any, string>,
	/** Мета-данные подписи */
	meta: string | Variable<any, string>,
	/** Публичный ключ */
	public_key: string | Variable<any, string>,
	/** Подпись хэша */
	signature: string | Variable<any, string>,
	/** Время подписания */
	signed_at: string | Variable<any, string>,
	/** Подписанный хэш */
	signed_hash: string | Variable<any, string>,
	/** Аккаунт подписавшего */
	signer: string | Variable<any, string>
};
	["SignedBlockchainDocument"]: AliasType<{
	/** Хэш содержимого документа */
	doc_hash?:boolean | `@${string}`,
	/** Общий хэш (doc_hash + meta_hash) */
	hash?:boolean | `@${string}`,
	/** Метаинформация документа (в формате JSON-строки) */
	meta?:boolean | `@${string}`,
	/** Хэш мета-данных */
	meta_hash?:boolean | `@${string}`,
	/** Вектор подписей */
	signatures?:ValueTypes["SignatureInfo"],
	/** Версия стандарта документа */
	version?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on SignedBlockchainDocument']?: Omit<ValueTypes["SignedBlockchainDocument"], "...on SignedBlockchainDocument">
}>;
	["SignedDigitalDocument"]: AliasType<{
	doc_hash?:boolean | `@${string}`,
	hash?:boolean | `@${string}`,
	meta?:boolean | `@${string}`,
	meta_hash?:boolean | `@${string}`,
	signatures?:ValueTypes["SignatureInfo"],
	version?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on SignedDigitalDocument']?: Omit<ValueTypes["SignedDigitalDocument"], "...on SignedDigitalDocument">
}>;
	["SovietMemberInput"]: {
	individual_data: ValueTypes["CreateSovietIndividualDataInput"] | Variable<any, string>,
	role: string | Variable<any, string>
};
	["StartInstallInput"]: {
	/** Приватный ключ кооператива */
	wif: string | Variable<any, string>
};
	["StartInstallResult"]: AliasType<{
	/** Имя кооператива */
	coopname?:boolean | `@${string}`,
	/** Код установки для дальнейших операций */
	install_code?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on StartInstallResult']?: Omit<ValueTypes["StartInstallResult"], "...on StartInstallResult">
}>;
	/** Комплексный объект цифрового документа заявления (или другого ведущего документа для цепочки принятия решений совета) с агрегатом документа */
["StatementDetailAggregate"]: AliasType<{
	action?:ValueTypes["ExtendedBlockchainAction"],
	documentAggregate?:ValueTypes["DocumentAggregate"],
		__typename?: boolean | `@${string}`,
	['...on StatementDetailAggregate']?: Omit<ValueTypes["StatementDetailAggregate"], "...on StatementDetailAggregate">
}>;
	/** Статус истории в системе CAPITAL */
["StoryStatus"]:StoryStatus;
	["SubscriptionStatsDto"]: AliasType<{
	/** Количество активных подписок */
	active?:boolean | `@${string}`,
	/** Количество неактивных подписок */
	inactive?:boolean | `@${string}`,
	/** Общее количество подписок */
	total?:boolean | `@${string}`,
	/** Количество уникальных пользователей */
	uniqueUsers?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on SubscriptionStatsDto']?: Omit<ValueTypes["SubscriptionStatsDto"], "...on SubscriptionStatsDto">
}>;
	["Symbols"]: AliasType<{
	/** Точность символа управления */
	root_govern_precision?:boolean | `@${string}`,
	/** Символ управления блокчейном */
	root_govern_symbol?:boolean | `@${string}`,
	/** Точность корневого символа */
	root_precision?:boolean | `@${string}`,
	/** Корневой символ блокчейна */
	root_symbol?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on Symbols']?: Omit<ValueTypes["Symbols"], "...on Symbols">
}>;
	["SystemFeatures"]: AliasType<{
	/** Доступен ли полнотекстовый поиск по документам */
	search?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on SystemFeatures']?: Omit<ValueTypes["SystemFeatures"], "...on SystemFeatures">
}>;
	["SystemInfo"]: AliasType<{
	/** Объект системного аккаунта кооператива в блокчейне */
	blockchain_account?:ValueTypes["BlockchainAccount"],
	/** Набор данных с информацией о состоянии блокчейна */
	blockchain_info?:ValueTypes["BlockchainInfoDTO"],
	/** Члены совета кооператива */
	board_members?:ValueTypes["BoardMember"],
	/** Контакты кооператива */
	contacts?:ValueTypes["ContactsDTO"],
	/** Объект аккаунта кооператива у оператора */
	cooperator_account?:ValueTypes["CooperativeOperatorAccount"],
	/** Имя аккаунта кооператива */
	coopname?:boolean | `@${string}`,
	/** Доступные функции платформы */
	features?:ValueTypes["SystemFeatures"],
	/** Доступен ли функционал провайдера для подписок и запуска ПО */
	is_providered?:boolean | `@${string}`,
	/** Требуется ли членство в союзе кооперативов для подключения к кооперативной экономике */
	is_unioned?:boolean | `@${string}`,
	/** Настройки системы */
	settings?:ValueTypes["Settings"],
	/** Символы и их точности блокчейна */
	symbols?:ValueTypes["Symbols"],
	/** Статус контроллера кооператива */
	system_status?:boolean | `@${string}`,
	/** Ссылка на анкету для получения членства в союзе кооперативов */
	union_link?:boolean | `@${string}`,
	/** Переменные кооператива */
	vars?:ValueTypes["Vars"],
		__typename?: boolean | `@${string}`,
	['...on SystemInfo']?: Omit<ValueTypes["SystemInfo"], "...on SystemInfo">
}>;
	/** Состояние контроллера кооператива */
["SystemStatus"]:SystemStatus;
	["Token"]: AliasType<{
	/** Дата истечения токена доступа */
	expires?:boolean | `@${string}`,
	/** Токен доступа */
	token?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on Token']?: Omit<ValueTypes["Token"], "...on Token">
}>;
	["Tokens"]: AliasType<{
	/** Токен доступа */
	access?:ValueTypes["Token"],
	/** Токен обновления */
	refresh?:ValueTypes["Token"],
		__typename?: boolean | `@${string}`,
	['...on Tokens']?: Omit<ValueTypes["Tokens"], "...on Tokens">
}>;
	["TranscriptionSegment"]: AliasType<{
	createdAt?:boolean | `@${string}`,
	endOffset?:boolean | `@${string}`,
	id?:boolean | `@${string}`,
	/** Канонический Matrix user id (@localpart:server) */
	speakerIdentity?:boolean | `@${string}`,
	/** Отображаемое имя из Synapse (displayname) */
	speakerName?:boolean | `@${string}`,
	startOffset?:boolean | `@${string}`,
	text?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on TranscriptionSegment']?: Omit<ValueTypes["TranscriptionSegment"], "...on TranscriptionSegment">
}>;
	/** Статус транскрипции звонка */
["TranscriptionStatus"]:TranscriptionStatus;
	["UninstallExtensionInput"]: {
	/** Фильтр по имени */
	name: string | Variable<any, string>
};
	["Update"]: {
	/** Собственные данные кооператива, обслуживающего экземпляр платформы */
	organization_data?: ValueTypes["UpdateOrganizationDataInput"] | undefined | null | Variable<any, string>,
	/** Переменные кооператива, используемые для заполнения шаблонов документов */
	vars?: ValueTypes["VarsInput"] | undefined | null | Variable<any, string>
};
	["UpdateAccountInput"]: {
	/** Данные индивидуального предпринимателя */
	entrepreneur_data?: ValueTypes["UpdateEntrepreneurDataInput"] | undefined | null | Variable<any, string>,
	/** Данные физического лица */
	individual_data?: ValueTypes["UpdateIndividualDataInput"] | undefined | null | Variable<any, string>,
	/** Данные организации */
	organization_data?: ValueTypes["UpdateOrganizationDataInput"] | undefined | null | Variable<any, string>,
	/** Публичный ключ */
	public_key?: string | undefined | null | Variable<any, string>,
	/** Имя аккаунта реферера */
	referer?: string | undefined | null | Variable<any, string>,
	/** Имя пользователя */
	username: string | Variable<any, string>
};
	["UpdateBankAccountInput"]: {
	/** Данные банковского счёта */
	data: ValueTypes["BankAccountInput"] | Variable<any, string>,
	/** Флаг основного метода платежа, который отображается в документах */
	is_default: boolean | Variable<any, string>,
	/** Идентификатор платежного метода */
	method_id: string | Variable<any, string>,
	/** Имя аккаунта пользователя */
	username: string | Variable<any, string>
};
	["UpdateEntrepreneurDataInput"]: {
	/** Дата рождения */
	birthdate: string | Variable<any, string>,
	/** Город */
	city: string | Variable<any, string>,
	/** Страна */
	country: ValueTypes["Country"] | Variable<any, string>,
	/** Детали индивидуального предпринимателя */
	details: ValueTypes["EntrepreneurDetailsInput"] | Variable<any, string>,
	/** Электронная почта */
	email: string | Variable<any, string>,
	/** Имя */
	first_name: string | Variable<any, string>,
	/** Полный адрес */
	full_address: string | Variable<any, string>,
	/** Фамилия */
	last_name: string | Variable<any, string>,
	/** Отчество */
	middle_name: string | Variable<any, string>,
	/** Телефон */
	phone: string | Variable<any, string>,
	/** Имя пользователя */
	username: string | Variable<any, string>
};
	["UpdateIndividualDataInput"]: {
	/** Дата рождения */
	birthdate: string | Variable<any, string>,
	/** Электронная почта */
	email: string | Variable<any, string>,
	/** Имя */
	first_name: string | Variable<any, string>,
	/** Полный адрес */
	full_address: string | Variable<any, string>,
	/** Фамилия */
	last_name: string | Variable<any, string>,
	/** Отчество */
	middle_name: string | Variable<any, string>,
	/** Данные паспорта */
	passport?: ValueTypes["PassportInput"] | undefined | null | Variable<any, string>,
	/** Телефон */
	phone: string | Variable<any, string>,
	/** Имя пользователя */
	username: string | Variable<any, string>
};
	["UpdateOrganizationDataInput"]: {
	/** Город */
	city: string | Variable<any, string>,
	/** Страна */
	country: string | Variable<any, string>,
	/** Детали организации */
	details: ValueTypes["OrganizationDetailsInput"] | Variable<any, string>,
	/** Электронная почта */
	email: string | Variable<any, string>,
	/** Фактический адрес */
	fact_address: string | Variable<any, string>,
	/** Полный адрес */
	full_address: string | Variable<any, string>,
	/** Полное наименование организации */
	full_name: string | Variable<any, string>,
	/** Телефон */
	phone: string | Variable<any, string>,
	/** Представитель организации */
	represented_by: ValueTypes["RepresentedByInput"] | Variable<any, string>,
	/** Краткое наименование организации */
	short_name: string | Variable<any, string>,
	/** Тип организации */
	type: string | Variable<any, string>,
	/** Имя пользователя */
	username: string | Variable<any, string>
};
	["UpdateSettingsInput"]: {
	/** Маршрут по умолчанию для авторизованных пользователей */
	authorized_default_route?: string | undefined | null | Variable<any, string>,
	/** Рабочий стол по умолчанию для авторизованных пользователей */
	authorized_default_workspace?: string | undefined | null | Variable<any, string>,
	/** Маршрут по умолчанию для неавторизованных пользователей */
	non_authorized_default_route?: string | undefined | null | Variable<any, string>,
	/** Рабочий стол по умолчанию для неавторизованных пользователей */
	non_authorized_default_workspace?: string | undefined | null | Variable<any, string>,
	/** Имя провайдера платежей по умолчанию */
	provider_name?: string | undefined | null | Variable<any, string>
};
	["UserAccount"]: AliasType<{
	/** Метаинформация */
	meta?:boolean | `@${string}`,
	/** Реферал */
	referer?:boolean | `@${string}`,
	/** Дата регистрации */
	registered_at?:boolean | `@${string}`,
	/** Регистратор */
	registrator?:boolean | `@${string}`,
	/** Статус аккаунта */
	status?:boolean | `@${string}`,
	/** Список хранилищ */
	storages?:boolean | `@${string}`,
	/** Тип учетной записи */
	type?:boolean | `@${string}`,
	/** Имя аккаунта */
	username?:boolean | `@${string}`,
	/** Дата регистрации */
	verifications?:ValueTypes["Verification"],
		__typename?: boolean | `@${string}`,
	['...on UserAccount']?: Omit<ValueTypes["UserAccount"], "...on UserAccount">
}>;
	/** Объединение сертификатов пользователей (сокращенная информация) */
["UserCertificateUnion"]: AliasType<{		["...on EntrepreneurCertificate"]?: ValueTypes["EntrepreneurCertificate"],
		["...on IndividualCertificate"]?: ValueTypes["IndividualCertificate"],
		["...on OrganizationCertificate"]?: ValueTypes["OrganizationCertificate"]
		__typename?: boolean | `@${string}`
}>;
	/** Статус пользователя */
["UserStatus"]:UserStatus;
	["Vars"]: AliasType<{
	confidential_email?:boolean | `@${string}`,
	confidential_link?:boolean | `@${string}`,
	contact_email?:boolean | `@${string}`,
	coopenomics_agreement?:ValueTypes["AgreementVar"],
	coopname?:boolean | `@${string}`,
	full_abbr?:boolean | `@${string}`,
	full_abbr_dative?:boolean | `@${string}`,
	full_abbr_genitive?:boolean | `@${string}`,
	name?:boolean | `@${string}`,
	participant_application?:ValueTypes["AgreementVar"],
	passport_request?:boolean | `@${string}`,
	privacy_agreement?:ValueTypes["AgreementVar"],
	short_abbr?:boolean | `@${string}`,
	signature_agreement?:ValueTypes["AgreementVar"],
	statute_link?:boolean | `@${string}`,
	user_agreement?:ValueTypes["AgreementVar"],
	wallet_agreement?:ValueTypes["AgreementVar"],
	website?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on Vars']?: Omit<ValueTypes["Vars"], "...on Vars">
}>;
	["VarsInput"]: {
	confidential_email: string | Variable<any, string>,
	confidential_link: string | Variable<any, string>,
	contact_email: string | Variable<any, string>,
	coopenomics_agreement?: ValueTypes["AgreementInput"] | undefined | null | Variable<any, string>,
	coopname: string | Variable<any, string>,
	full_abbr: string | Variable<any, string>,
	full_abbr_dative: string | Variable<any, string>,
	full_abbr_genitive: string | Variable<any, string>,
	name: string | Variable<any, string>,
	participant_application: ValueTypes["AgreementInput"] | Variable<any, string>,
	passport_request: string | Variable<any, string>,
	privacy_agreement: ValueTypes["AgreementInput"] | Variable<any, string>,
	short_abbr: string | Variable<any, string>,
	signature_agreement: ValueTypes["AgreementInput"] | Variable<any, string>,
	statute_link: string | Variable<any, string>,
	user_agreement: ValueTypes["AgreementInput"] | Variable<any, string>,
	wallet_agreement: ValueTypes["AgreementInput"] | Variable<any, string>,
	website: string | Variable<any, string>
};
	["Verification"]: AliasType<{
	/** Дата создания верификации */
	created_at?:boolean | `@${string}`,
	/** Флаг верификации */
	is_verified?:boolean | `@${string}`,
	/** Дата последнего обновления верификации */
	last_update?:boolean | `@${string}`,
	/** Заметка верификации */
	notice?:boolean | `@${string}`,
	/** Процедура верификации */
	procedure?:boolean | `@${string}`,
	/** Имя верификатора */
	verificator?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on Verification']?: Omit<ValueTypes["Verification"], "...on Verification">
}>;
	["WaitWeight"]: AliasType<{
	/** Время ожидания в секундах */
	wait_sec?:boolean | `@${string}`,
	/** Вес */
	weight?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on WaitWeight']?: Omit<ValueTypes["WaitWeight"], "...on WaitWeight">
}>;
	["WebPushSubscriptionDataInput"]: {
	/** Endpoint для отправки уведомлений */
	endpoint: string | Variable<any, string>,
	/** Ключи для шифрования */
	keys: ValueTypes["WebPushSubscriptionKeysInput"] | Variable<any, string>
};
	["WebPushSubscriptionDto"]: AliasType<{
	/** Auth ключ для аутентификации */
	authKey?:boolean | `@${string}`,
	/** Дата создания подписки */
	createdAt?:boolean | `@${string}`,
	/** Endpoint для отправки уведомлений */
	endpoint?:boolean | `@${string}`,
	/** Уникальный идентификатор подписки */
	id?:boolean | `@${string}`,
	/** Активна ли подписка */
	isActive?:boolean | `@${string}`,
	/** P256DH ключ для шифрования */
	p256dhKey?:boolean | `@${string}`,
	/** Дата последнего обновления */
	updatedAt?:boolean | `@${string}`,
	/** User Agent браузера */
	userAgent?:boolean | `@${string}`,
	/** Username пользователя */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`,
	['...on WebPushSubscriptionDto']?: Omit<ValueTypes["WebPushSubscriptionDto"], "...on WebPushSubscriptionDto">
}>;
	["WebPushSubscriptionKeysInput"]: {
	/** Auth ключ для аутентификации */
	auth: string | Variable<any, string>,
	/** P256DH ключ для шифрования */
	p256dh: string | Variable<any, string>
};
	["ID"]:unknown
  }

export type ResolverInputTypes = {
    ["Account"]: AliasType<{
	/** объект аккаунта в блокчейне содержит системную информацию, такую как публичные ключи доступа, доступные вычислительные ресурсы, информация об установленном смарт-контракте, и т.д. и т.п. Это системный уровень обслуживания, где у каждого пайщика есть аккаунт, но не каждый аккаунт может быть пайщиком в каком-либо кооперативе. Все смарт-контракты устанавливаются и исполняются на этом уровне. */
	blockchain_account?:ResolverInputTypes["BlockchainAccount"],
	/** объект пайщика кооператива в таблице блокчейне, который определяет членство пайщика в конкретном кооперативе. Поскольку MONO обслуживает только один кооператив, то в participant_account обычно содержится информация, которая описывает членство пайщика в этом кооперативе. Этот объект обезличен, публичен, и хранится в блокчейне. */
	participant_account?:ResolverInputTypes["ParticipantAccount"],
	/** объект приватных данных пайщика кооператива. */
	private_account?:ResolverInputTypes["PrivateAccount"],
	/** объект аккаунта в системе учёта провайдера, т.е. MONO. Здесь хранится приватная информация о пайщике кооператива, которая содержит его приватные данные. Эти данные не публикуются в блокчейне и не выходят за пределы базы данных провайдера. Они используются для заполнения шаблонов документов при нажатии соответствующих кнопок на платформе.  */
	provider_account?:ResolverInputTypes["MonoAccount"],
	/** объект пользователя кооперативной экономики содержит в блокчейне информацию о типе аккаунта пайщика, а также, обезличенные публичные данные (хэши) для верификации пайщиков между кооперативами. Этот уровень предназначен для хранения информации пайщика, которая необходима всем кооперативам, но не относится к какому-либо из них конкретно. */
	user_account?:ResolverInputTypes["UserAccount"],
	/** Имя аккаунта кооператива */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["AccountRamDelta"]: AliasType<{
	account?:boolean | `@${string}`,
	delta?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["AccountResourceInfo"]: AliasType<{
	/** Доступные ресурсы */
	available?:boolean | `@${string}`,
	/** Текущее использование ресурсов */
	current_used?:boolean | `@${string}`,
	/** Время последнего обновления использования ресурсов */
	last_usage_update_time?:boolean | `@${string}`,
	/** Максимальное количество ресурсов */
	max?:boolean | `@${string}`,
	/** Использовано ресурсов */
	used?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Тип аккаунта пользователя в системе */
["AccountType"]:AccountType;
	["AccountsPaginationResult"]: AliasType<{
	/** Текущая страница */
	currentPage?:boolean | `@${string}`,
	/** Элементы текущей страницы */
	items?:ResolverInputTypes["Account"],
	/** Общее количество элементов */
	totalCount?:boolean | `@${string}`,
	/** Общее количество страниц */
	totalPages?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Комплексный объект акта, содержащий полную информацию о сгенерированном и опубликованном документе с его агрегатом */
["ActDetailAggregate"]: AliasType<{
	action?:ResolverInputTypes["ExtendedBlockchainAction"],
	documentAggregate?:ResolverInputTypes["DocumentAggregate"],
		__typename?: boolean | `@${string}`
}>;
	["ActionAuthorization"]: AliasType<{
	actor?:boolean | `@${string}`,
	permission?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["ActionReceipt"]: AliasType<{
	abi_sequence?:boolean | `@${string}`,
	act_digest?:boolean | `@${string}`,
	auth_sequence?:ResolverInputTypes["AuthSequence"],
	code_sequence?:boolean | `@${string}`,
	global_sequence?:boolean | `@${string}`,
	receiver?:boolean | `@${string}`,
	recv_sequence?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["AddPaymentMethodInput"]: {
	/** Данные для банковского перевода */
	bank_transfer_data?: ResolverInputTypes["BankAccountInput"] | undefined | null,
	/** Флаг основного метода платежа, который отображается в документах */
	is_default: boolean,
	/** Данные для оплаты через СБП */
	sbp_data?: ResolverInputTypes["SbpDataInput"] | undefined | null,
	/** Имя аккаунта пользователя */
	username: string
};
	["AddTrustedAccountInput"]: {
	/** Имя аккаунта кооперативного участка */
	braname: string,
	/** Имя аккаунта кооператива */
	coopname: string,
	/** Имя аккаунта доверонного лица, который уполномачивается председателем кооперативного участка на совершение действий */
	trusted: string
};
	/** Пункт повестки собрания */
["AgendaMeetPoint"]: AliasType<{
	/** Контекст или дополнительная информация по пункту повестки */
	context?:boolean | `@${string}`,
	/** Предлагаемое решение по пункту повестки */
	decision?:boolean | `@${string}`,
	/** Заголовок пункта повестки */
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Соглашение пользователя с кооперативом */
["Agreement"]: AliasType<{
	/** Дата создания записи */
	_created_at?:boolean | `@${string}`,
	/** Внутренний ID базы данных */
	_id?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	_updated_at?:boolean | `@${string}`,
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?:boolean | `@${string}`,
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** Документ соглашения */
	document?:ResolverInputTypes["DocumentAggregate"],
	/** ID черновика */
	draft_id?:boolean | `@${string}`,
	/** ID соглашения в блокчейне */
	id?:boolean | `@${string}`,
	/** Флаг присутствия записи в блокчейне */
	present?:boolean | `@${string}`,
	/** ID программы */
	program_id?:boolean | `@${string}`,
	/** Статус соглашения */
	status?:boolean | `@${string}`,
	/** Тип соглашения */
	type?:boolean | `@${string}`,
	/** Дата последнего обновления в блокчейне */
	updated_at?:boolean | `@${string}`,
	/** Имя пользователя, создавшего соглашение */
	username?:boolean | `@${string}`,
	/** Версия соглашения */
	version?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["AgreementInput"]: {
	protocol_day_month_year: string,
	protocol_number: string
};
	/** Статус соглашения в системе кооператива */
["AgreementStatus"]:AgreementStatus;
	["AgreementVar"]: AliasType<{
	protocol_day_month_year?:boolean | `@${string}`,
	protocol_number?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["AgreementVarInput"]: {
	protocol_day_month_year: string,
	protocol_number: string
};
	/** Одобрение документа председателем совета */
["Approval"]: AliasType<{
	/** Дата создания записи */
	_created_at?:boolean | `@${string}`,
	/** Внутренний ID базы данных */
	_id?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	_updated_at?:boolean | `@${string}`,
	/** Хеш одобрения для идентификации */
	approval_hash?:boolean | `@${string}`,
	/** Одобренный документ (заполняется при подтверждении одобрения) */
	approved_document?:ResolverInputTypes["DocumentAggregate"],
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?:boolean | `@${string}`,
	/** Действие обратного вызова при одобрении */
	callback_action_approve?:boolean | `@${string}`,
	/** Действие обратного вызова при отклонении */
	callback_action_decline?:boolean | `@${string}`,
	/** Контракт обратного вызова для обработки результата */
	callback_contract?:boolean | `@${string}`,
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** Дата создания одобрения */
	created_at?:boolean | `@${string}`,
	/** Документ, требующий одобрения */
	document?:ResolverInputTypes["DocumentAggregate"],
	/** ID одобрения в блокчейне */
	id?:boolean | `@${string}`,
	/** Метаданные одобрения в формате JSON */
	meta?:boolean | `@${string}`,
	/** Флаг присутствия записи в блокчейне */
	present?:boolean | `@${string}`,
	/** Статус одобрения */
	status?:boolean | `@${string}`,
	/** Имя пользователя, запросившего одобрение */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Статус одобрения в системе CHAIRMAN */
["ApprovalStatus"]:ApprovalStatus;
	["AuthSequence"]: AliasType<{
	account?:boolean | `@${string}`,
	sequence?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Authority"]: AliasType<{
	/** Уровни разрешений */
	accounts?:ResolverInputTypes["PermissionLevelWeight"],
	/** Ключи */
	keys?:ResolverInputTypes["KeyWeight"],
	/** Порог */
	threshold?:boolean | `@${string}`,
	/** Вес ожидания */
	waits?:ResolverInputTypes["WaitWeight"],
		__typename?: boolean | `@${string}`
}>;
	["BankAccount"]: AliasType<{
	/** Номер банковского счета */
	account_number?:boolean | `@${string}`,
	/** Название банка */
	bank_name?:boolean | `@${string}`,
	/** Номер карты */
	card_number?:boolean | `@${string}`,
	/** Валюта счета */
	currency?:boolean | `@${string}`,
	/** Детали счета */
	details?:ResolverInputTypes["BankAccountDetails"],
		__typename?: boolean | `@${string}`
}>;
	["BankAccountDetails"]: AliasType<{
	/** БИК банка */
	bik?:boolean | `@${string}`,
	/** Корреспондентский счет */
	corr?:boolean | `@${string}`,
	/** КПП банка */
	kpp?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["BankAccountDetailsInput"]: {
	/** БИК банка */
	bik: string,
	/** Корреспондентский счет */
	corr: string,
	/** КПП банка */
	kpp: string
};
	["BankAccountInput"]: {
	/** Номер банковского счета */
	account_number: string,
	/** Название банка */
	bank_name: string,
	/** Номер карты */
	card_number?: string | undefined | null,
	/** Валюта счета */
	currency: string,
	/** Детали счета */
	details: ResolverInputTypes["BankAccountDetailsInput"]
};
	["BankPaymentMethod"]: AliasType<{
	/** Дата создания */
	created_at?:boolean | `@${string}`,
	/** Данные метода оплаты */
	data?:ResolverInputTypes["BankAccount"],
	/** Флаг основного метода платежа, который отображается в документах */
	is_default?:boolean | `@${string}`,
	/** Идентификатор метода оплаты */
	method_id?:boolean | `@${string}`,
	/** Тип метода оплаты */
	method_type?:boolean | `@${string}`,
	/** Дата обновления */
	updated_at?:boolean | `@${string}`,
	/** Имя пользователя, к которому привязан метод оплаты */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Базовый проект в системе CAPITAL */
["BaseCapitalProject"]: AliasType<{
	/** Дата создания записи */
	_created_at?:boolean | `@${string}`,
	/** Внутренний ID базы данных */
	_id?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	_updated_at?:boolean | `@${string}`,
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?:boolean | `@${string}`,
	/** Статус из блокчейна */
	blockchain_status?:boolean | `@${string}`,
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** Счетчики участников проекта */
	counts?:ResolverInputTypes["CapitalProjectCountsData"],
	/** Дата создания */
	created_at?:boolean | `@${string}`,
	/** Данные CRPS для распределения наград проекта */
	crps?:ResolverInputTypes["CapitalProjectCrpsData"],
	/** Данные/шаблон проекта */
	data?:boolean | `@${string}`,
	/** Описание проекта */
	description?:boolean | `@${string}`,
	/** Фактические показатели проекта */
	fact?:ResolverInputTypes["CapitalProjectFactPool"],
	/** ID в блокчейне */
	id?:boolean | `@${string}`,
	/** Приглашение к проекту */
	invite?:boolean | `@${string}`,
	/** Открыт ли проект */
	is_opened?:boolean | `@${string}`,
	/** Запланирован ли проект */
	is_planed?:boolean | `@${string}`,
	/** Счетчик задач проекта */
	issue_counter?:boolean | `@${string}`,
	/** Мастер проекта */
	master?:boolean | `@${string}`,
	/** Мета-информация проекта */
	meta?:boolean | `@${string}`,
	/** Хеш родительского проекта */
	parent_hash?:boolean | `@${string}`,
	/** Название родительского проекта */
	parent_title?:boolean | `@${string}`,
	/** Права доступа текущего пользователя к проекту */
	permissions?:ResolverInputTypes["CapitalProjectPermissions"],
	/** Плановые показатели проекта */
	plan?:ResolverInputTypes["CapitalProjectPlanPool"],
	/** Префикс проекта */
	prefix?:boolean | `@${string}`,
	/** Флаг присутствия записи в блокчейне */
	present?:boolean | `@${string}`,
	/** Хеш проекта */
	project_hash?:boolean | `@${string}`,
	/** Статус проекта */
	status?:boolean | `@${string}`,
	/** Название проекта */
	title?:boolean | `@${string}`,
	/** Данные голосования по методу Водянова */
	voting?:ResolverInputTypes["CapitalProjectVotingData"],
		__typename?: boolean | `@${string}`
}>;
	["BlockchainAccount"]: AliasType<{
	/** Имя аккаунта */
	account_name?:boolean | `@${string}`,
	/** Баланс */
	core_liquid_balance?:boolean | `@${string}`,
	/** Ограничения CPU */
	cpu_limit?:ResolverInputTypes["AccountResourceInfo"],
	/** Вес CPU */
	cpu_weight?:boolean | `@${string}`,
	/** Дата создания */
	created?:boolean | `@${string}`,
	/** Номер последнего блока */
	head_block_num?:boolean | `@${string}`,
	/** Время последнего блока */
	head_block_time?:boolean | `@${string}`,
	/** Время последнего обновления кода */
	last_code_update?:boolean | `@${string}`,
	/** Ограничения сети */
	net_limit?:ResolverInputTypes["AccountResourceInfo"],
	/** Вес сети */
	net_weight?:boolean | `@${string}`,
	/** Разрешения */
	permissions?:ResolverInputTypes["Permission"],
	/** Флаг привилегий */
	privileged?:boolean | `@${string}`,
	/** Квота RAM */
	ram_quota?:boolean | `@${string}`,
	/** Использование RAM */
	ram_usage?:boolean | `@${string}`,
	/** Запрос на возврат */
	refund_request?:ResolverInputTypes["RefundRequest"],
	/** Информация о REX */
	rex_info?:boolean | `@${string}`,
	/** Делегированные ресурсы */
	self_delegated_bandwidth?:ResolverInputTypes["ResourceDelegationDTO"],
	/** Общий обзор ресурсов */
	total_resources?:ResolverInputTypes["ResourceOverview"],
	/** Информация о голосовании */
	voter_info?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Объект действия в блокчейне */
["BlockchainAction"]: AliasType<{
	account?:boolean | `@${string}`,
	account_ram_deltas?:ResolverInputTypes["AccountRamDelta"],
	action_ordinal?:boolean | `@${string}`,
	authorization?:ResolverInputTypes["ActionAuthorization"],
	block_id?:boolean | `@${string}`,
	block_num?:boolean | `@${string}`,
	chain_id?:boolean | `@${string}`,
	console?:boolean | `@${string}`,
	context_free?:boolean | `@${string}`,
	creator_action_ordinal?:boolean | `@${string}`,
	/** Данные действия в формате JSON */
	data?:boolean | `@${string}`,
	elapsed?:boolean | `@${string}`,
	global_sequence?:boolean | `@${string}`,
	name?:boolean | `@${string}`,
	receipt?:ResolverInputTypes["ActionReceipt"],
	receiver?:boolean | `@${string}`,
	transaction_id?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Запись в таблице блокчейна о процессе принятия решения советом кооператива */
["BlockchainDecision"]: AliasType<{
	approved?:boolean | `@${string}`,
	authorization?:ResolverInputTypes["SignedBlockchainDocument"],
	authorized?:boolean | `@${string}`,
	authorized_by?:boolean | `@${string}`,
	batch_id?:boolean | `@${string}`,
	callback_contract?:boolean | `@${string}`,
	confirm_callback?:boolean | `@${string}`,
	coopname?:boolean | `@${string}`,
	created_at?:boolean | `@${string}`,
	decline_callback?:boolean | `@${string}`,
	expired_at?:boolean | `@${string}`,
	hash?:boolean | `@${string}`,
	id?:boolean | `@${string}`,
	meta?:boolean | `@${string}`,
	statement?:ResolverInputTypes["SignedBlockchainDocument"],
	type?:boolean | `@${string}`,
	username?:boolean | `@${string}`,
	/** Сертификат пользователя, создавшего решение */
	username_certificate?:ResolverInputTypes["UserCertificateUnion"],
	validated?:boolean | `@${string}`,
	votes_against?:boolean | `@${string}`,
	/** Сертификаты пользователей, голосовавших "против" */
	votes_against_certificates?:ResolverInputTypes["UserCertificateUnion"],
	votes_for?:boolean | `@${string}`,
	/** Сертификаты пользователей, голосовавших "за" */
	votes_for_certificates?:ResolverInputTypes["UserCertificateUnion"],
		__typename?: boolean | `@${string}`
}>;
	/** Информация о состоянии блокчейна */
["BlockchainInfoDTO"]: AliasType<{
	/** Лимит CPU для блока */
	block_cpu_limit?:boolean | `@${string}`,
	/** Лимит сети для блока */
	block_net_limit?:boolean | `@${string}`,
	/** Идентификатор цепочки (chain ID) */
	chain_id?:boolean | `@${string}`,
	/** Идентификатор головного блока в форк базе данных */
	fork_db_head_block_id?:boolean | `@${string}`,
	/** Номер головного блока в форк базе данных */
	fork_db_head_block_num?:boolean | `@${string}`,
	/** Идентификатор головного блока */
	head_block_id?:boolean | `@${string}`,
	/** Номер головного блока */
	head_block_num?:boolean | `@${string}`,
	/** Прозводитель головного блока */
	head_block_producer?:boolean | `@${string}`,
	/** Время головного блока */
	head_block_time?:boolean | `@${string}`,
	/** Идентификатор последнего необратимого блока */
	last_irreversible_block_id?:boolean | `@${string}`,
	/** Номер последнего необратимого блока */
	last_irreversible_block_num?:boolean | `@${string}`,
	/** Время последнего необратимого блока */
	last_irreversible_block_time?:boolean | `@${string}`,
	/** Версия сервера */
	server_version?:boolean | `@${string}`,
	/** Строковое представление версии сервера */
	server_version_string?:boolean | `@${string}`,
	/** Виртуальный лимит CPU для блока */
	virtual_block_cpu_limit?:boolean | `@${string}`,
	/** Виртуальный лимит сети для блока */
	virtual_block_net_limit?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["BoardMember"]: AliasType<{
	/** Имя */
	first_name?:boolean | `@${string}`,
	/** Флаг председателя совета */
	is_chairman?:boolean | `@${string}`,
	/** Фамилия */
	last_name?:boolean | `@${string}`,
	/** Отчество */
	middle_name?:boolean | `@${string}`,
	/** Имя пользователя (username) */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Branch"]: AliasType<{
	/** Банковский счёт */
	bank_account?:ResolverInputTypes["BankPaymentMethod"],
	/** Уникальное имя кооперативного участка */
	braname?:boolean | `@${string}`,
	/** Город */
	city?:boolean | `@${string}`,
	/** Имя аккаунта кооператива */
	coopname?:boolean | `@${string}`,
	/** Страна */
	country?:boolean | `@${string}`,
	/** Детали организации */
	details?:ResolverInputTypes["OrganizationDetails"],
	/** Email */
	email?:boolean | `@${string}`,
	/** Фактический адрес */
	fact_address?:boolean | `@${string}`,
	/** Полный адрес */
	full_address?:boolean | `@${string}`,
	/** Полное название организации */
	full_name?:boolean | `@${string}`,
	/** Телефон */
	phone?:boolean | `@${string}`,
	/** Представитель организации */
	represented_by?:ResolverInputTypes["RepresentedBy"],
	/** Краткое название организации */
	short_name?:boolean | `@${string}`,
	/** Доверенные аккаунты

Требуемые роли: chairman, member.  */
	trusted?:ResolverInputTypes["Individual"],
	/** Председатель кооперативного участка

Требуемые роли: chairman, member.  */
	trustee?:ResolverInputTypes["Individual"],
	/** Тип организации */
	type?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["CallTranscription"]: AliasType<{
	createdAt?:boolean | `@${string}`,
	endedAt?:boolean | `@${string}`,
	id?:boolean | `@${string}`,
	matrixRoomId?:boolean | `@${string}`,
	/** Пользовательская заметка о содержании звонка */
	memo?:boolean | `@${string}`,
	/** Отображаемые имена участников (Synapse displayname); в БД хранятся канонические Matrix user id */
	participants?:boolean | `@${string}`,
	roomId?:boolean | `@${string}`,
	roomName?:boolean | `@${string}`,
	startedAt?:boolean | `@${string}`,
	status?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Candidate"]: AliasType<{
	braname?:boolean | `@${string}`,
	coopname?:boolean | `@${string}`,
	created_at?:boolean | `@${string}`,
	program_key?:boolean | `@${string}`,
	public_key?:boolean | `@${string}`,
	referer?:boolean | `@${string}`,
	referer_display_name?:boolean | `@${string}`,
	registered_at?:boolean | `@${string}`,
	status?:boolean | `@${string}`,
	type?:boolean | `@${string}`,
	username?:boolean | `@${string}`,
	username_display_name?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["CandidateStatus"]:CandidateStatus;
	["CapitalCandidate"]: AliasType<{
	about?:boolean | `@${string}`,
	braname?:boolean | `@${string}`,
	capital_status?:boolean | `@${string}`,
	contributed_as_author?:boolean | `@${string}`,
	contributed_as_contributor?:boolean | `@${string}`,
	contributed_as_coordinator?:boolean | `@${string}`,
	contributed_as_creator?:boolean | `@${string}`,
	contributed_as_investor?:boolean | `@${string}`,
	contributed_as_propertor?:boolean | `@${string}`,
	contributor_hash?:boolean | `@${string}`,
	coopname?:boolean | `@${string}`,
	created_at?:boolean | `@${string}`,
	hours_per_day?:boolean | `@${string}`,
	level?:boolean | `@${string}`,
	memo?:boolean | `@${string}`,
	program_key?:boolean | `@${string}`,
	public_key?:boolean | `@${string}`,
	rate_per_hour?:boolean | `@${string}`,
	referer?:boolean | `@${string}`,
	referer_display_name?:boolean | `@${string}`,
	registered_at?:boolean | `@${string}`,
	status?:boolean | `@${string}`,
	type?:boolean | `@${string}`,
	username?:boolean | `@${string}`,
	username_display_name?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Коммит в системе CAPITAL */
["CapitalCommit"]: AliasType<{
	/** Дата создания записи */
	_created_at?:boolean | `@${string}`,
	/** Внутренний ID базы данных */
	_id?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	_updated_at?:boolean | `@${string}`,
	/** Данные amounts коммита */
	amounts?:ResolverInputTypes["CapitalCommitAmounts"],
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?:boolean | `@${string}`,
	/** Статус из блокчейна */
	blockchain_status?:boolean | `@${string}`,
	/** Хеш коммита */
	commit_hash?:boolean | `@${string}`,
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** Дата создания */
	created_at?:boolean | `@${string}`,
	/** Обогащенные данные коммита (diff-патч, исходная ссылка и т.д.) */
	data?:boolean | `@${string}`,
	/** Описание коммита */
	description?:boolean | `@${string}`,
	/** Отображаемое имя пользователя */
	display_name?:boolean | `@${string}`,
	/** ID в блокчейне */
	id?:boolean | `@${string}`,
	/** Метаданные коммита */
	meta?:boolean | `@${string}`,
	/** Флаг присутствия записи в блокчейне */
	present?:boolean | `@${string}`,
	/** Проект, к которому относится коммит */
	project?:ResolverInputTypes["BaseCapitalProject"],
	/** Хеш проекта */
	project_hash?:boolean | `@${string}`,
	/** Статус коммита */
	status?:boolean | `@${string}`,
	/** Имя пользователя */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Данные amounts коммита */
["CapitalCommitAmounts"]: AliasType<{
	/** Базовый пул авторов */
	authors_base_pool?:boolean | `@${string}`,
	/** Бонусный пул авторов */
	authors_bonus_pool?:boolean | `@${string}`,
	/** Бонусный пул участников */
	contributors_bonus_pool?:boolean | `@${string}`,
	/** Базовый пул создателей */
	creators_base_pool?:boolean | `@${string}`,
	/** Бонусный пул создателей */
	creators_bonus_pool?:boolean | `@${string}`,
	/** Часы создателей */
	creators_hours?:boolean | `@${string}`,
	/** Стоимость часа работы */
	hour_cost?:boolean | `@${string}`,
	/** Общий объем вклада */
	total_contribution?:boolean | `@${string}`,
	/** Общий генерационный пул */
	total_generation_pool?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Конфигурация CAPITAL контракта кооператива */
["CapitalConfigObject"]: AliasType<{
	/** Процент голосования авторов */
	authors_voting_percent?:boolean | `@${string}`,
	/** Процент бонуса координатора */
	coordinator_bonus_percent?:boolean | `@${string}`,
	/** Срок действия приглашения координатора в днях */
	coordinator_invite_validity_days?:boolean | `@${string}`,
	/** Процент голосования создателей */
	creators_voting_percent?:boolean | `@${string}`,
	/** Скорость убывания энергии в день */
	energy_decay_rate_per_day?:boolean | `@${string}`,
	/** Коэффициент получения энергии */
	energy_gain_coefficient?:boolean | `@${string}`,
	/** Процент расходов */
	expense_pool_percent?:boolean | `@${string}`,
	/** Базовая глубина уровня */
	level_depth_base?:boolean | `@${string}`,
	/** Коэффициент роста уровня */
	level_growth_coefficient?:boolean | `@${string}`,
	/** Период голосования в днях */
	voting_period_in_days?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Участник кооператива в системе CAPITAL */
["CapitalContributor"]: AliasType<{
	/** Дата создания записи */
	_created_at?:boolean | `@${string}`,
	/** Внутренний ID базы данных */
	_id?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	_updated_at?:boolean | `@${string}`,
	/** О себе */
	about?:boolean | `@${string}`,
	/** Приложения к контракту */
	appendixes?:boolean | `@${string}`,
	/** Хеш соглашения Благорост */
	blagorost_agreement_hash?:boolean | `@${string}`,
	/** Хеш оферты Благорост */
	blagorost_offer_hash?:boolean | `@${string}`,
	/** Программный кошелек в программе Blagorost */
	blagorost_wallet?:ResolverInputTypes["ProgramWallet"],
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?:boolean | `@${string}`,
	/** Статус из блокчейна */
	blockchain_status?:boolean | `@${string}`,
	/** Контракт участника */
	contract?:ResolverInputTypes["DocumentAggregate"],
	/** Вклад как автор */
	contributed_as_author?:boolean | `@${string}`,
	/** Вклад как участник */
	contributed_as_contributor?:boolean | `@${string}`,
	/** Вклад как координатор */
	contributed_as_coordinator?:boolean | `@${string}`,
	/** Вклад как исполнитель */
	contributed_as_creator?:boolean | `@${string}`,
	/** Вклад как инвестор */
	contributed_as_investor?:boolean | `@${string}`,
	/** Вклад как собственник имущества */
	contributed_as_propertor?:boolean | `@${string}`,
	/** Хеш участника */
	contributor_hash?:boolean | `@${string}`,
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** Дата создания */
	created_at?:boolean | `@${string}`,
	/** Сумма долга */
	debt_amount?:boolean | `@${string}`,
	/** Отображаемое имя */
	display_name?:boolean | `@${string}`,
	/** Параметры документов участника из UData (номера и даты) */
	document_parameters?:ResolverInputTypes["ContributorDocumentParameters"],
	/** Энергия участника */
	energy?:boolean | `@${string}`,
	/** Хеш договора УХД */
	generation_contract_hash?:boolean | `@${string}`,
	/** Программный кошелек в программе Generation */
	generation_wallet?:ResolverInputTypes["ProgramWallet"],
	/** Хеш оферты Генератор */
	generator_offer_hash?:boolean | `@${string}`,
	/** Часов в день */
	hours_per_day?:boolean | `@${string}`,
	/** ID в блокчейне */
	id?:boolean | `@${string}`,
	/** Соглашение Благорост предоставлено при импорте (внешний документ) */
	is_external_blagorost_agreement?:boolean | `@${string}`,
	/** Является ли внешним контрактом */
	is_external_contract?:boolean | `@${string}`,
	/** Последнее обновление энергии */
	last_energy_update?:boolean | `@${string}`,
	/** Уровень участника */
	level?:boolean | `@${string}`,
	/** Программный кошелек в программе Main */
	main_wallet?:ResolverInputTypes["ProgramWallet"],
	/** Мемо/комментарий */
	memo?:boolean | `@${string}`,
	/** Флаг присутствия записи в блокчейне */
	present?:boolean | `@${string}`,
	/** Ключ выбранной программы регистрации (generation, capitalization) */
	program_key?:boolean | `@${string}`,
	/** Ставка за час работы */
	rate_per_hour?:boolean | `@${string}`,
	/** Статус участника */
	status?:boolean | `@${string}`,
	/** Хеш соглашения о хранении имущества */
	storage_agreement_hash?:boolean | `@${string}`,
	/** Имя пользователя */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Цикл разработки в системе CAPITAL */
["CapitalCycle"]: AliasType<{
	/** Дата создания записи */
	_created_at?:boolean | `@${string}`,
	/** Внутренний ID базы данных */
	_id?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	_updated_at?:boolean | `@${string}`,
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?:boolean | `@${string}`,
	/** Дата окончания */
	end_date?:boolean | `@${string}`,
	/** Название цикла */
	name?:boolean | `@${string}`,
	/** Флаг присутствия записи в блокчейне */
	present?:boolean | `@${string}`,
	/** Дата начала */
	start_date?:boolean | `@${string}`,
	/** Статус цикла */
	status?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Долг в системе CAPITAL */
["CapitalDebt"]: AliasType<{
	/** Дата создания записи */
	_created_at?:boolean | `@${string}`,
	/** Внутренний ID базы данных */
	_id?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	_updated_at?:boolean | `@${string}`,
	/** Сумма долга */
	amount?:boolean | `@${string}`,
	/** Одобренное заявление */
	approved_statement?:ResolverInputTypes["DocumentAggregate"],
	/** Протокол решения совета */
	authorization?:ResolverInputTypes["DocumentAggregate"],
	/** Номер блока последнего обновления */
	block_num?:boolean | `@${string}`,
	/** Статус из блокчейна */
	blockchain_status?:boolean | `@${string}`,
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** Хеш долга */
	debt_hash?:boolean | `@${string}`,
	/** ID в блокчейне */
	id?:boolean | `@${string}`,
	/** Мемо/комментарий */
	memo?:boolean | `@${string}`,
	/** Существует ли запись в блокчейне */
	present?:boolean | `@${string}`,
	/** Хеш проекта */
	project_hash?:boolean | `@${string}`,
	/** Дата погашения */
	repaid_at?:boolean | `@${string}`,
	/** Заявление на получение ссуды */
	statement?:ResolverInputTypes["DocumentAggregate"],
	/** Статус долга */
	status?:boolean | `@${string}`,
	/** Имя пользователя */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Расход в системе CAPITAL */
["CapitalExpense"]: AliasType<{
	/** Дата создания записи */
	_created_at?:boolean | `@${string}`,
	/** Внутренний ID базы данных */
	_id?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	_updated_at?:boolean | `@${string}`,
	/** Сумма расхода */
	amount?:boolean | `@${string}`,
	/** Одобренная записка */
	approved_statement?:ResolverInputTypes["DocumentAggregate"],
	/** Авторизация расхода */
	authorization?:ResolverInputTypes["DocumentAggregate"],
	/** Номер блока последнего обновления */
	block_num?:boolean | `@${string}`,
	/** Статус из блокчейна */
	blockchain_status?:boolean | `@${string}`,
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** Описание расхода */
	description?:boolean | `@${string}`,
	/** Хеш расхода */
	expense_hash?:boolean | `@${string}`,
	/** Служебная записка о расходе */
	expense_statement?:ResolverInputTypes["DocumentAggregate"],
	/** ID фонда */
	fund_id?:boolean | `@${string}`,
	/** ID в блокчейне */
	id?:boolean | `@${string}`,
	/** Существует ли запись в блокчейне */
	present?:boolean | `@${string}`,
	/** Хеш проекта */
	project_hash?:boolean | `@${string}`,
	/** Дата расхода */
	spended_at?:boolean | `@${string}`,
	/** Статус расхода */
	status?:boolean | `@${string}`,
	/** Имя пользователя */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Инвестиция в системе CAPITAL */
["CapitalInvest"]: AliasType<{
	/** Дата создания записи */
	_created_at?:boolean | `@${string}`,
	/** Внутренний ID базы данных */
	_id?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	_updated_at?:boolean | `@${string}`,
	/** Сумма инвестиции */
	amount?:boolean | `@${string}`,
	/** Номер блока последнего обновления */
	block_num?:boolean | `@${string}`,
	/** Статус из блокчейна */
	blockchain_status?:boolean | `@${string}`,
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** Координатор */
	coordinator?:boolean | `@${string}`,
	/** Сумма координатора */
	coordinator_amount?:boolean | `@${string}`,
	/** ID в блокчейне */
	id?:boolean | `@${string}`,
	/** Хеш инвестиции */
	invest_hash?:boolean | `@${string}`,
	/** Дата инвестирования */
	invested_at?:boolean | `@${string}`,
	/** Существует ли запись в блокчейне */
	present?:boolean | `@${string}`,
	/** Хеш проекта */
	project_hash?:boolean | `@${string}`,
	/** Заявление */
	statement?:boolean | `@${string}`,
	/** Статус инвестиции */
	status?:boolean | `@${string}`,
	/** Имя пользователя */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Задача в системе CAPITAL */
["CapitalIssue"]: AliasType<{
	/** Дата создания записи */
	_created_at?:boolean | `@${string}`,
	/** Внутренний ID базы данных */
	_id?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	_updated_at?:boolean | `@${string}`,
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?:boolean | `@${string}`,
	/** Имя пользователя, создавшего задачу */
	created_by?:boolean | `@${string}`,
	/** Массив имен пользователей создателей (contributors) */
	creators?:boolean | `@${string}`,
	/** ID цикла */
	cycle_id?:boolean | `@${string}`,
	/** Описание задачи */
	description?:boolean | `@${string}`,
	/** Оценка в часах (допускаются дроби, например 1.5) */
	estimate?:boolean | `@${string}`,
	/** Уникальный ID задачи в формате PREFIX-N (например, ABC-1) */
	id?:boolean | `@${string}`,
	/** Хеш задачи */
	issue_hash?:boolean | `@${string}`,
	/** Метаданные задачи */
	metadata?:boolean | `@${string}`,
	/** Права доступа текущего пользователя к задаче */
	permissions?:ResolverInputTypes["CapitalIssuePermissions"],
	/** Флаг присутствия записи в блокчейне */
	present?:boolean | `@${string}`,
	/** Приоритет задачи */
	priority?:boolean | `@${string}`,
	/** Хеш проекта */
	project_hash?:boolean | `@${string}`,
	/** Порядок сортировки */
	sort_order?:boolean | `@${string}`,
	/** Статус задачи */
	status?:boolean | `@${string}`,
	/** Имя пользователя ответственного (contributor) */
	submaster?:boolean | `@${string}`,
	/** Название задачи */
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Права доступа пользователя к задаче */
["CapitalIssuePermissions"]: AliasType<{
	/** Список допустимых статусов для перехода */
	allowed_status_transitions?:boolean | `@${string}`,
	/** Может ли назначать исполнителей задачи */
	can_assign_creator?:boolean | `@${string}`,
	/** Может ли изменять статусы задачи */
	can_change_status?:boolean | `@${string}`,
	/** Может ли выполнять требования к задаче */
	can_complete_requirement?:boolean | `@${string}`,
	/** Может ли создавать требования к задаче */
	can_create_requirement?:boolean | `@${string}`,
	/** Может ли удалить задачу */
	can_delete_issue?:boolean | `@${string}`,
	/** Может ли удалять требования к задаче */
	can_delete_requirement?:boolean | `@${string}`,
	/** Может ли редактировать задачу (название, описание, приоритет и т.д.) */
	can_edit_issue?:boolean | `@${string}`,
	/** Может ли устанавливать статус DONE (выполнена) */
	can_set_done?:boolean | `@${string}`,
	/** Может ли устанавливать оценку (estimate) задачи */
	can_set_estimate?:boolean | `@${string}`,
	/** Может ли устанавливать статус ON_REVIEW (на проверке) */
	can_set_on_review?:boolean | `@${string}`,
	/** Может ли устанавливать приоритет задачи */
	can_set_priority?:boolean | `@${string}`,
	/** Имеет ли подтвержденное приложение для проекта */
	has_clearance?:boolean | `@${string}`,
	/** Является ли пользователь гостем (неавторизованным) */
	is_guest?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Запись лога событий в системе капитала */
["CapitalLog"]: AliasType<{
	/** Внутренний идентификатор */
	_id?:boolean | `@${string}`,
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** Дата создания записи */
	created_at?:boolean | `@${string}`,
	/** ID сущности */
	entity_id?:boolean | `@${string}`,
	/** Тип сущности к которой относится событие */
	entity_type?:boolean | `@${string}`,
	/** Тип события */
	event_type?:boolean | `@${string}`,
	/** Инициатор действия (username) */
	initiator?:boolean | `@${string}`,
	/** Текстовое описание события */
	message?:boolean | `@${string}`,
	/** Вспомогательные данные */
	metadata?:boolean | `@${string}`,
	/** Хеш проекта или компонента */
	project_hash?:boolean | `@${string}`,
	/** Идентификатор-ссылка (invest_hash, commit_hash, result_hash и т.д.) */
	reference_id?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Фильтр для поиска логов событий */
["CapitalLogFilterInput"]: {
	/** Название кооператива */
	coopname?: string | undefined | null,
	/** Период с */
	date_from?: ResolverInputTypes["DateTime"] | undefined | null,
	/** Период по */
	date_to?: ResolverInputTypes["DateTime"] | undefined | null,
	/** Типы событий для фильтрации */
	event_types?: Array<ResolverInputTypes["LogEventType"]> | undefined | null,
	/** Инициатор действия (username) */
	initiator?: string | undefined | null,
	/** Хеш задачи */
	issue_hash?: string | undefined | null,
	/** Хеш проекта или компонента */
	project_hash?: string | undefined | null,
	/** Включать логи дочерних компонентов при фильтрации по project_hash */
	show_components_logs?: boolean | undefined | null,
	/** Показывать логи по задачам */
	show_issue_logs?: boolean | undefined | null
};
	/** Программная инвестиция в системе CAPITAL */
["CapitalProgramInvest"]: AliasType<{
	/** Дата создания записи */
	_created_at?:boolean | `@${string}`,
	/** Внутренний ID базы данных */
	_id?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	_updated_at?:boolean | `@${string}`,
	/** Сумма инвестиции */
	amount?:boolean | `@${string}`,
	/** Номер блока последнего обновления */
	block_num?:boolean | `@${string}`,
	/** Статус из блокчейна */
	blockchain_status?:boolean | `@${string}`,
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** ID в блокчейне */
	id?:boolean | `@${string}`,
	/** Хеш инвестиции */
	invest_hash?:boolean | `@${string}`,
	/** Дата инвестирования */
	invested_at?:boolean | `@${string}`,
	/** Существует ли запись в блокчейне */
	present?:boolean | `@${string}`,
	/** Заявление об инвестиции */
	statement?:ResolverInputTypes["DocumentAggregate"],
	/** Статус программной инвестиции */
	status?:boolean | `@${string}`,
	/** Имя пользователя */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Проект в системе CAPITAL с компонентами */
["CapitalProject"]: AliasType<{
	/** Дата создания записи */
	_created_at?:boolean | `@${string}`,
	/** Внутренний ID базы данных */
	_id?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	_updated_at?:boolean | `@${string}`,
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?:boolean | `@${string}`,
	/** Статус из блокчейна */
	blockchain_status?:boolean | `@${string}`,
	/** Массив проектов-компонентов */
	components?:ResolverInputTypes["CapitalProjectComponent"],
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** Счетчики участников проекта */
	counts?:ResolverInputTypes["CapitalProjectCountsData"],
	/** Дата создания */
	created_at?:boolean | `@${string}`,
	/** Данные CRPS для распределения наград проекта */
	crps?:ResolverInputTypes["CapitalProjectCrpsData"],
	/** Данные/шаблон проекта */
	data?:boolean | `@${string}`,
	/** Описание проекта */
	description?:boolean | `@${string}`,
	/** Фактические показатели проекта */
	fact?:ResolverInputTypes["CapitalProjectFactPool"],
	/** ID в блокчейне */
	id?:boolean | `@${string}`,
	/** Приглашение к проекту */
	invite?:boolean | `@${string}`,
	/** Открыт ли проект */
	is_opened?:boolean | `@${string}`,
	/** Запланирован ли проект */
	is_planed?:boolean | `@${string}`,
	/** Счетчик задач проекта */
	issue_counter?:boolean | `@${string}`,
	/** Мастер проекта */
	master?:boolean | `@${string}`,
	/** Мета-информация проекта */
	meta?:boolean | `@${string}`,
	/** Хеш родительского проекта */
	parent_hash?:boolean | `@${string}`,
	/** Название родительского проекта */
	parent_title?:boolean | `@${string}`,
	/** Права доступа текущего пользователя к проекту */
	permissions?:ResolverInputTypes["CapitalProjectPermissions"],
	/** Плановые показатели проекта */
	plan?:ResolverInputTypes["CapitalProjectPlanPool"],
	/** Префикс проекта */
	prefix?:boolean | `@${string}`,
	/** Флаг присутствия записи в блокчейне */
	present?:boolean | `@${string}`,
	/** Хеш проекта */
	project_hash?:boolean | `@${string}`,
	/** Статус проекта */
	status?:boolean | `@${string}`,
	/** Название проекта */
	title?:boolean | `@${string}`,
	/** Данные голосования по методу Водянова */
	voting?:ResolverInputTypes["CapitalProjectVotingData"],
		__typename?: boolean | `@${string}`
}>;
	/** Проект-компонент в системе CAPITAL */
["CapitalProjectComponent"]: AliasType<{
	/** Дата создания записи */
	_created_at?:boolean | `@${string}`,
	/** Внутренний ID базы данных */
	_id?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	_updated_at?:boolean | `@${string}`,
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?:boolean | `@${string}`,
	/** Статус из блокчейна */
	blockchain_status?:boolean | `@${string}`,
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** Счетчики участников проекта */
	counts?:ResolverInputTypes["CapitalProjectCountsData"],
	/** Дата создания */
	created_at?:boolean | `@${string}`,
	/** Данные CRPS для распределения наград проекта */
	crps?:ResolverInputTypes["CapitalProjectCrpsData"],
	/** Данные/шаблон проекта */
	data?:boolean | `@${string}`,
	/** Описание проекта */
	description?:boolean | `@${string}`,
	/** Фактические показатели проекта */
	fact?:ResolverInputTypes["CapitalProjectFactPool"],
	/** ID в блокчейне */
	id?:boolean | `@${string}`,
	/** Приглашение к проекту */
	invite?:boolean | `@${string}`,
	/** Открыт ли проект */
	is_opened?:boolean | `@${string}`,
	/** Запланирован ли проект */
	is_planed?:boolean | `@${string}`,
	/** Счетчик задач проекта */
	issue_counter?:boolean | `@${string}`,
	/** Мастер проекта */
	master?:boolean | `@${string}`,
	/** Мета-информация проекта */
	meta?:boolean | `@${string}`,
	/** Хеш родительского проекта */
	parent_hash?:boolean | `@${string}`,
	/** Название родительского проекта */
	parent_title?:boolean | `@${string}`,
	/** Права доступа текущего пользователя к проекту */
	permissions?:ResolverInputTypes["CapitalProjectPermissions"],
	/** Плановые показатели проекта */
	plan?:ResolverInputTypes["CapitalProjectPlanPool"],
	/** Префикс проекта */
	prefix?:boolean | `@${string}`,
	/** Флаг присутствия записи в блокчейне */
	present?:boolean | `@${string}`,
	/** Хеш проекта */
	project_hash?:boolean | `@${string}`,
	/** Статус проекта */
	status?:boolean | `@${string}`,
	/** Название проекта */
	title?:boolean | `@${string}`,
	/** Данные голосования по методу Водянова */
	voting?:ResolverInputTypes["CapitalProjectVotingData"],
		__typename?: boolean | `@${string}`
}>;
	/** Счетчики участников проекта */
["CapitalProjectCountsData"]: AliasType<{
	/** Общее количество авторов */
	total_authors?:boolean | `@${string}`,
	/** Общее количество коммитов */
	total_commits?:boolean | `@${string}`,
	/** Общее количество участников */
	total_contributors?:boolean | `@${string}`,
	/** Общее количество координаторов */
	total_coordinators?:boolean | `@${string}`,
	/** Общее количество создателей */
	total_creators?:boolean | `@${string}`,
	/** Общее количество инвесторов */
	total_investors?:boolean | `@${string}`,
	/** Общее количество проперторов */
	total_propertors?:boolean | `@${string}`,
	/** Общее количество уникальных участников */
	total_unique_participants?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Данные CRPS для распределения наград проекта */
["CapitalProjectCrpsData"]: AliasType<{
	/** Накопительный коэффициент вознаграждения за базовый вклад авторов */
	author_base_cumulative_reward_per_share?:boolean | `@${string}`,
	/** Накопительный коэффициент вознаграждения за бонусный вклад авторов */
	author_bonus_cumulative_reward_per_share?:boolean | `@${string}`,
	/** Накопительный коэффициент вознаграждения участников */
	contributor_cumulative_reward_per_share?:boolean | `@${string}`,
	/** Общее количество долей участников капитала */
	total_capital_contributors_shares?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Фактические показатели проекта */
["CapitalProjectFactPool"]: AliasType<{
	/** Накопленный пул расходов */
	accumulated_expense_pool?:boolean | `@${string}`,
	/** Базовый пул авторов */
	authors_base_pool?:boolean | `@${string}`,
	/** Бонусный пул авторов */
	authors_bonus_pool?:boolean | `@${string}`,
	/** Бонусный пул участников */
	contributors_bonus_pool?:boolean | `@${string}`,
	/** Базовый пул координаторов */
	coordinators_base_pool?:boolean | `@${string}`,
	/** Инвестиционный пул координаторов */
	coordinators_investment_pool?:boolean | `@${string}`,
	/** Базовый пул создателей */
	creators_base_pool?:boolean | `@${string}`,
	/** Бонусный пул создателей */
	creators_bonus_pool?:boolean | `@${string}`,
	/** Часы создателей */
	creators_hours?:boolean | `@${string}`,
	/** Стоимость часа работы */
	hour_cost?:boolean | `@${string}`,
	/** Инвестиционный пул */
	invest_pool?:boolean | `@${string}`,
	/** Программный инвестиционный пул */
	program_invest_pool?:boolean | `@${string}`,
	/** Имущественный базовый пул */
	property_base_pool?:boolean | `@${string}`,
	/** Процент возврата базового пула */
	return_base_percent?:boolean | `@${string}`,
	/** Целевой пул расходов */
	target_expense_pool?:boolean | `@${string}`,
	/** Общая сумма */
	total?:boolean | `@${string}`,
	/** Общий объем взноса старших участников */
	total_contribution?:boolean | `@${string}`,
	/** Общий генерационный пул */
	total_generation_pool?:boolean | `@${string}`,
	/** Общий объем полученных инвестиций */
	total_received_investments?:boolean | `@${string}`,
	/** Общий объем возвращенных инвестиций */
	total_returned_investments?:boolean | `@${string}`,
	/** Общий объем использованных инвестиций */
	total_used_investments?:boolean | `@${string}`,
	/** Общий объем взноса старших участников */
	total_with_investments?:boolean | `@${string}`,
	/** Процент использования инвестиций */
	use_invest_percent?:boolean | `@${string}`,
	/** Использованный пул расходов */
	used_expense_pool?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Права доступа пользователя к проекту */
["CapitalProjectPermissions"]: AliasType<{
	/** Может ли изменять статус проекта */
	can_change_project_status?:boolean | `@${string}`,
	/** Может ли выполнять требования к проекту */
	can_complete_requirement?:boolean | `@${string}`,
	/** Может ли создавать требования к проекту */
	can_create_requirement?:boolean | `@${string}`,
	/** Может ли удалить проект */
	can_delete_project?:boolean | `@${string}`,
	/** Может ли удалять требования к проекту */
	can_delete_requirement?:boolean | `@${string}`,
	/** Может ли редактировать проект (название, описание, мета и т.д.) */
	can_edit_project?:boolean | `@${string}`,
	/** Может ли управлять авторами проекта */
	can_manage_authors?:boolean | `@${string}`,
	/** Может ли управлять задачами в проекте */
	can_manage_issues?:boolean | `@${string}`,
	/** Может ли устанавливать мастера проекта */
	can_set_master?:boolean | `@${string}`,
	/** Может ли устанавливать план проекта */
	can_set_plan?:boolean | `@${string}`,
	/** Имеет ли подтвержденное приложение для проекта */
	has_clearance?:boolean | `@${string}`,
	/** Является ли пользователь гостем (неавторизованным) */
	is_guest?:boolean | `@${string}`,
	/** Есть ли запрос на получение допуска в рассмотрении */
	pending_clearance?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Плановые показатели проекта */
["CapitalProjectPlanPool"]: AliasType<{
	/** Базовый пул авторов */
	authors_base_pool?:boolean | `@${string}`,
	/** Бонусный пул авторов */
	authors_bonus_pool?:boolean | `@${string}`,
	/** Бонусный пул участников */
	contributors_bonus_pool?:boolean | `@${string}`,
	/** Базовый пул координаторов */
	coordinators_base_pool?:boolean | `@${string}`,
	/** Инвестиционный пул координаторов */
	coordinators_investment_pool?:boolean | `@${string}`,
	/** Базовый пул создателей */
	creators_base_pool?:boolean | `@${string}`,
	/** Бонусный пул создателей */
	creators_bonus_pool?:boolean | `@${string}`,
	/** Плановые часы создателей */
	creators_hours?:boolean | `@${string}`,
	/** Плановая стоимость часа работы */
	hour_cost?:boolean | `@${string}`,
	/** Инвестиционный пул */
	invest_pool?:boolean | `@${string}`,
	/** Программный инвестиционный пул */
	program_invest_pool?:boolean | `@${string}`,
	/** Процент возврата базового пула */
	return_base_percent?:boolean | `@${string}`,
	/** Целевой пул расходов */
	target_expense_pool?:boolean | `@${string}`,
	/** Общая сумма */
	total?:boolean | `@${string}`,
	/** Общий генерационный пул */
	total_generation_pool?:boolean | `@${string}`,
	/** Общий объем полученных инвестиций */
	total_received_investments?:boolean | `@${string}`,
	/** Общая сумма */
	total_with_investments?:boolean | `@${string}`,
	/** Процент использования инвестиций */
	use_invest_percent?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Статистика времени участника по проекту */
["CapitalProjectTimeStats"]: AliasType<{
	/** Доступное время для коммита (по завершённым задачам) */
	available_hours?:boolean | `@${string}`,
	/** Хеш участника */
	contributor_hash?:boolean | `@${string}`,
	/** Время в ожидании (по незавершённым задачам) */
	pending_hours?:boolean | `@${string}`,
	/** Хеш проекта */
	project_hash?:boolean | `@${string}`,
	/** Название проекта */
	project_name?:boolean | `@${string}`,
	/** Сумма закоммиченного времени (часы) */
	total_committed_hours?:boolean | `@${string}`,
	/** Сумма незакоммиченного времени (часы) */
	total_uncommitted_hours?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Суммы голосования проекта */
["CapitalProjectVotingAmounts"]: AliasType<{
	/** Активная сумма голосования */
	active_voting_amount?:boolean | `@${string}`,
	/** Бонусы авторов при голосовании */
	authors_bonuses_on_voting?:boolean | `@${string}`,
	/** Равная сумма на автора */
	authors_equal_per_author?:boolean | `@${string}`,
	/** Равномерное распределение среди авторов */
	authors_equal_spread?:boolean | `@${string}`,
	/** Бонусы создателей при голосовании */
	creators_bonuses_on_voting?:boolean | `@${string}`,
	/** Прямое распределение среди создателей */
	creators_direct_spread?:boolean | `@${string}`,
	/** Равная сумма голосования */
	equal_voting_amount?:boolean | `@${string}`,
	/** Общий пул голосования */
	total_voting_pool?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Данные голосования по методу Водянова */
["CapitalProjectVotingData"]: AliasType<{
	/** Суммы голосования */
	amounts?:ResolverInputTypes["CapitalProjectVotingAmounts"],
	/** Процент голосования авторов */
	authors_voting_percent?:boolean | `@${string}`,
	/** Процент голосования создателей */
	creators_voting_percent?:boolean | `@${string}`,
	/** Общее количество участников голосования */
	total_voters?:boolean | `@${string}`,
	/** Количество полученных голосов */
	votes_received?:boolean | `@${string}`,
	/** Дата окончания голосования */
	voting_deadline?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Результат в системе CAPITAL */
["CapitalResult"]: AliasType<{
	/** Дата создания записи */
	_created_at?:boolean | `@${string}`,
	/** Внутренний ID базы данных */
	_id?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	_updated_at?:boolean | `@${string}`,
	/** Акт приёма-передачи результата */
	act?:ResolverInputTypes["DocumentAggregate"],
	/** Авторизация результата */
	authorization?:ResolverInputTypes["DocumentAggregate"],
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?:boolean | `@${string}`,
	/** Статус из блокчейна */
	blockchain_status?:boolean | `@${string}`,
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** Дата создания */
	created_at?:boolean | `@${string}`,
	/** Структурированные данные результата для отображения */
	data?:boolean | `@${string}`,
	/** Сумма долга */
	debt_amount?:boolean | `@${string}`,
	/** ID в блокчейне */
	id?:boolean | `@${string}`,
	/** Флаг присутствия записи в блокчейне */
	present?:boolean | `@${string}`,
	/** Хеш проекта */
	project_hash?:boolean | `@${string}`,
	/** Хеш результата */
	result_hash?:boolean | `@${string}`,
	/** Заявление на внесение результата интеллектуальной деятельности */
	statement?:ResolverInputTypes["DocumentAggregate"],
	/** Статус результата */
	status?:boolean | `@${string}`,
	/** Общая сумма */
	total_amount?:boolean | `@${string}`,
	/** Имя пользователя */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Сегмент участника в проекте CAPITAL */
["CapitalSegment"]: AliasType<{
	/** Дата создания записи */
	_created_at?:boolean | `@${string}`,
	/** Внутренний ID базы данных */
	_id?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	_updated_at?:boolean | `@${string}`,
	/** Базовый вклад автора */
	author_base?:boolean | `@${string}`,
	/** Бонусный вклад автора */
	author_bonus?:boolean | `@${string}`,
	/** Доступная сумма для конвертации в программу */
	available_for_program?:boolean | `@${string}`,
	/** Доступная сумма для конвертации в кошелек */
	available_for_wallet?:boolean | `@${string}`,
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?:boolean | `@${string}`,
	/** Доли участников капитала */
	capital_contributor_shares?:boolean | `@${string}`,
	/** Бонусный вклад участника */
	contributor_bonus?:boolean | `@${string}`,
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** Базовый вклад координатора */
	coordinator_base?:boolean | `@${string}`,
	/** Инвестиции координатора */
	coordinator_investments?:boolean | `@${string}`,
	/** Базовый вклад создателя */
	creator_base?:boolean | `@${string}`,
	/** Бонусный вклад создателя */
	creator_bonus?:boolean | `@${string}`,
	/** Сумма долга */
	debt_amount?:boolean | `@${string}`,
	/** Сумма погашенного долга */
	debt_settled?:boolean | `@${string}`,
	/** Прямой бонус создателя */
	direct_creator_bonus?:boolean | `@${string}`,
	/** Отображаемое имя пользователя */
	display_name?:boolean | `@${string}`,
	/** Равный бонус автора */
	equal_author_bonus?:boolean | `@${string}`,
	/** Наличие права голоса */
	has_vote?:boolean | `@${string}`,
	/** ID в блокчейне */
	id?:boolean | `@${string}`,
	/** Интеллектуальная стоимость сегмента */
	intellectual_cost?:boolean | `@${string}`,
	/** Сумма инвестиций инвестора */
	investor_amount?:boolean | `@${string}`,
	/** Базовый вклад инвестора */
	investor_base?:boolean | `@${string}`,
	/** Роль автора */
	is_author?:boolean | `@${string}`,
	/** Завершена ли конвертация сегмента */
	is_completed?:boolean | `@${string}`,
	/** Роль участника */
	is_contributor?:boolean | `@${string}`,
	/** Роль координатора */
	is_coordinator?:boolean | `@${string}`,
	/** Роль создателя */
	is_creator?:boolean | `@${string}`,
	/** Роль инвестора */
	is_investor?:boolean | `@${string}`,
	/** Роль собственника */
	is_propertor?:boolean | `@${string}`,
	/** Флаг завершения расчета голосования */
	is_votes_calculated?:boolean | `@${string}`,
	/** Последняя награда за базовый вклад автора на долю в проекте */
	last_author_base_reward_per_share?:boolean | `@${string}`,
	/** Последняя награда за бонусный вклад автора на долю в проекте */
	last_author_bonus_reward_per_share?:boolean | `@${string}`,
	/** Последняя награда участника на акцию */
	last_contributor_reward_per_share?:boolean | `@${string}`,
	/** Последняя известная сумма инвестиций координаторов */
	last_known_coordinators_investment_pool?:boolean | `@${string}`,
	/** Последняя известная сумма базового пула создателей */
	last_known_creators_base_pool?:boolean | `@${string}`,
	/** Последняя известная сумма инвестиций в проекте */
	last_known_invest_pool?:boolean | `@${string}`,
	/** Флаг присутствия записи в блокчейне */
	present?:boolean | `@${string}`,
	/** Хеш проекта */
	project_hash?:boolean | `@${string}`,
	/** Базовый имущественный вклад */
	property_base?:boolean | `@${string}`,
	/** Предварительная сумма */
	provisional_amount?:boolean | `@${string}`,
	/** Доля участника в результате интеллектуальной деятельности */
	share_percent?:boolean | `@${string}`,
	/** Статус сегмента */
	status?:boolean | `@${string}`,
	/** Общая базовая стоимость сегмента */
	total_segment_base_cost?:boolean | `@${string}`,
	/** Общая бонусная стоимость сегмента */
	total_segment_bonus_cost?:boolean | `@${string}`,
	/** Общая стоимость сегмента */
	total_segment_cost?:boolean | `@${string}`,
	/** Имя пользователя */
	username?:boolean | `@${string}`,
	/** Вклад участника словами участника */
	value?:boolean | `@${string}`,
	/** Бонус голосования */
	voting_bonus?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** История (критерий выполнения) в системе CAPITAL */
["CapitalStory"]: AliasType<{
	/** Дата создания записи */
	_created_at?:boolean | `@${string}`,
	/** Внутренний ID базы данных */
	_id?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	_updated_at?:boolean | `@${string}`,
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?:boolean | `@${string}`,
	/** Формат содержимого (markdown-текст или BPMN 2.0 XML в description) */
	content_format?:boolean | `@${string}`,
	/** Имя аккаунта кооператива */
	coopname?:boolean | `@${string}`,
	/** Имя пользователя, создавшего историю */
	created_by?:boolean | `@${string}`,
	/** Описание истории */
	description?:boolean | `@${string}`,
	/** Хеш задачи (если история привязана к задаче) */
	issue_hash?:boolean | `@${string}`,
	/** Флаг присутствия записи в блокчейне */
	present?:boolean | `@${string}`,
	/** Хеш проекта (если история привязана к проекту) */
	project_hash?:boolean | `@${string}`,
	/** Порядок сортировки */
	sort_order?:boolean | `@${string}`,
	/** Статус истории */
	status?:boolean | `@${string}`,
	/** Хеш истории */
	story_hash?:boolean | `@${string}`,
	/** Название истории */
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Формат содержимого требования (истории) в CAPITAL: MARKDOWN, BPMN (XML), DRAWIO (draw.io / diagrams.net XML) или MERMAID (текст диаграммы) */
["CapitalStoryContentFormat"]:CapitalStoryContentFormat;
	/** Агрегированная статистика времени по задачам с информацией о задачах и участниках */
["CapitalTimeEntriesByIssues"]: AliasType<{
	/** Доступное время для коммита (по завершённым задачам) */
	available_hours?:boolean | `@${string}`,
	/** Количество закоммиченных часов */
	committed_hours?:boolean | `@${string}`,
	/** Хеш участника */
	contributor_hash?:boolean | `@${string}`,
	/** Имя участника */
	contributor_name?:boolean | `@${string}`,
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** Хеш задачи */
	issue_hash?:boolean | `@${string}`,
	/** Название задачи */
	issue_title?:boolean | `@${string}`,
	/** Время в ожидании (по незавершённым задачам) */
	pending_hours?:boolean | `@${string}`,
	/** Хеш проекта */
	project_hash?:boolean | `@${string}`,
	/** Название проекта */
	project_name?:boolean | `@${string}`,
	/** Общее количество часов по задаче */
	total_hours?:boolean | `@${string}`,
	/** Количество незакоммиченных часов */
	uncommitted_hours?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Запись времени участника */
["CapitalTimeEntry"]: AliasType<{
	/** Дата создания записи */
	_created_at?:boolean | `@${string}`,
	/** Уникальный идентификатор записи */
	_id?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	_updated_at?:boolean | `@${string}`,
	/** Хеш коммита */
	commit_hash?:boolean | `@${string}`,
	/** Хеш участника */
	contributor_hash?:boolean | `@${string}`,
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** Дата записи времени (YYYY-MM-DD) */
	date?:boolean | `@${string}`,
	/** Тип начисления времени: hourly (почасовое) или estimate (по завершению задачи) */
	entry_type?:boolean | `@${string}`,
	/** Снимок estimate на момент начисления времени (для отслеживания изменений) */
	estimate_snapshot?:boolean | `@${string}`,
	/** Количество часов */
	hours?:boolean | `@${string}`,
	/** Флаг, указывающий, закоммичена ли запись */
	is_committed?:boolean | `@${string}`,
	/** Хеш задачи */
	issue_hash?:boolean | `@${string}`,
	/** Хеш проекта */
	project_hash?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Голос в системе CAPITAL */
["CapitalVote"]: AliasType<{
	/** Дата создания записи */
	_created_at?:boolean | `@${string}`,
	/** Внутренний ID базы данных */
	_id?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	_updated_at?:boolean | `@${string}`,
	/** Сумма голоса */
	amount?:boolean | `@${string}`,
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?:boolean | `@${string}`,
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** ID в блокчейне */
	id?:boolean | `@${string}`,
	/** Флаг присутствия записи в блокчейне */
	present?:boolean | `@${string}`,
	/** Хеш проекта */
	project_hash?:boolean | `@${string}`,
	/** Получатель */
	recipient?:boolean | `@${string}`,
	/** Отображаемое имя получателя голоса */
	recipient_display_name?:boolean | `@${string}`,
	/** Дата голосования */
	voted_at?:boolean | `@${string}`,
	/** Голосующий */
	voter?:boolean | `@${string}`,
	/** Отображаемое имя голосующего */
	voter_display_name?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["ChartOfAccountsItem"]: AliasType<{
	/** Доступные средства */
	available?:boolean | `@${string}`,
	/** Заблокированные средства */
	blocked?:boolean | `@${string}`,
	/** Идентификатор счета для отображения (может быть дробным, например "86.6") */
	displayId?:boolean | `@${string}`,
	/** Идентификатор счета */
	id?:boolean | `@${string}`,
	/** Название счета */
	name?:boolean | `@${string}`,
	/** Списанные средства */
	writeoff?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Статус коммита в системе CAPITAL */
["CommitStatus"]:CommitStatus;
	["ContactsDTO"]: AliasType<{
	chairman?:ResolverInputTypes["PublicChairman"],
	details?:ResolverInputTypes["OrganizationDetails"],
	email?:boolean | `@${string}`,
	full_address?:boolean | `@${string}`,
	full_name?:boolean | `@${string}`,
	phone?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Параметры документов участника из UData */
["ContributorDocumentParameters"]: AliasType<{
	/** Дата создания соглашения благороста */
	blagorost_agreement_created_at?:boolean | `@${string}`,
	/** Номер соглашения программы благороста */
	blagorost_agreement_number?:boolean | `@${string}`,
	/** Дата создания договора УХД участника */
	blagorost_contributor_contract_created_at?:boolean | `@${string}`,
	/** Номер договора УХД участника */
	blagorost_contributor_contract_number?:boolean | `@${string}`,
	/** Дата создания дополнительного соглашения по хранению имущества */
	blagorost_storage_agreement_created_at?:boolean | `@${string}`,
	/** Номер дополнительного соглашения по хранению имущества */
	blagorost_storage_agreement_number?:boolean | `@${string}`,
	/** Дата создания соглашения генератора */
	generator_agreement_created_at?:boolean | `@${string}`,
	/** Номер соглашения программы генератор */
	generator_agreement_number?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Статус участника в системе CAPITAL */
["ContributorStatus"]:ContributorStatus;
	["CooperativeOperatorAccount"]: AliasType<{
	/** Количество активных участников */
	active_participants_count?:boolean | `@${string}`,
	/** Объявление кооператива */
	announce?:boolean | `@${string}`,
	/** Тип кооператива */
	coop_type?:boolean | `@${string}`,
	/** Дата создания */
	created_at?:boolean | `@${string}`,
	/** Описание кооператива */
	description?:boolean | `@${string}`,
	/** Документ кооператива */
	document?:ResolverInputTypes["SignedBlockchainDocument"],
	/** Начальный взнос */
	initial?:boolean | `@${string}`,
	/** Разветвленный ли кооператив */
	is_branched?:boolean | `@${string}`,
	/** Является ли это кооперативом */
	is_cooperative?:boolean | `@${string}`,
	/** Включен ли кооператив */
	is_enrolled?:boolean | `@${string}`,
	/** Метаинформация */
	meta?:boolean | `@${string}`,
	/** Минимальный взнос */
	minimum?:boolean | `@${string}`,
	/** Начальный взнос организации */
	org_initial?:boolean | `@${string}`,
	/** Минимальный взнос организации */
	org_minimum?:boolean | `@${string}`,
	/** Регистрационный взнос организации */
	org_registration?:boolean | `@${string}`,
	/** Родительское имя аккаунта кооператива */
	parent_username?:boolean | `@${string}`,
	/** Реферал кооператива */
	referer?:boolean | `@${string}`,
	/** Дата регистрации */
	registered_at?:boolean | `@${string}`,
	/** Регистрационный взнос */
	registration?:boolean | `@${string}`,
	/** Регистратор кооператива */
	registrator?:boolean | `@${string}`,
	/** Статус кооператива */
	status?:boolean | `@${string}`,
	/** Список хранилищ */
	storages?:boolean | `@${string}`,
	/** Тип учетной записи */
	type?:boolean | `@${string}`,
	/** Имя аккаунта кооператива */
	username?:boolean | `@${string}`,
	/** Дата регистрации */
	verifications?:ResolverInputTypes["Verification"],
		__typename?: boolean | `@${string}`
}>;
	/** Страна регистрации пользователя */
["Country"]:Country;
	["CreateBranchInput"]: {
	/** Документ, на основании которого действует Уполномоченный (решение совета №СС-.. от ..) */
	based_on: string,
	/** Имя аккаунта кооперативного участка */
	braname: string,
	/** Имя аккаунта кооператива */
	coopname: string,
	/** Электронная почта */
	email: string,
	/** Фактический адрес */
	fact_address: string,
	/** Полное имя организации кооперативного участка */
	full_name: string,
	/** Телефон */
	phone: string,
	/** Краткое имя организации кооперативного участка */
	short_name: string,
	/** Имя аккаунта уполномоченного (председателя) кооперативного участка */
	trustee: string
};
	["CreateEntrepreneurDataInput"]: {
	/** Банковский счет */
	bank_account: ResolverInputTypes["BankAccountInput"],
	/** Дата рождения */
	birthdate: string,
	/** Город */
	city: string,
	/** Страна */
	country: ResolverInputTypes["Country"],
	/** Детали индивидуального предпринимателя */
	details: ResolverInputTypes["EntrepreneurDetailsInput"],
	/** Имя */
	first_name: string,
	/** Полный адрес */
	full_address: string,
	/** Фамилия */
	last_name: string,
	/** Отчество */
	middle_name: string,
	/** Телефон */
	phone: string
};
	["CreateIndividualDataInput"]: {
	/** Дата рождения */
	birthdate: string,
	/** Имя */
	first_name: string,
	/** Полный адрес */
	full_address: string,
	/** Фамилия */
	last_name: string,
	/** Отчество */
	middle_name: string,
	/** Данные паспорта */
	passport?: ResolverInputTypes["PassportInput"] | undefined | null,
	/** Телефон */
	phone: string
};
	["CreateInitOrganizationDataInput"]: {
	/** Банковский счет организации */
	bank_account: ResolverInputTypes["BankAccountInput"],
	/** Город */
	city: string,
	/** Страна */
	country: string,
	/** Детали организации */
	details: ResolverInputTypes["OrganizationDetailsInput"],
	/** Email организации */
	email: string,
	/** Фактический адрес */
	fact_address: string,
	/** Полный адрес */
	full_address: string,
	/** Полное наименование организации */
	full_name: string,
	/** Телефон */
	phone: string,
	/** Представитель организации */
	represented_by: ResolverInputTypes["RepresentedByInput"],
	/** Краткое наименование организации */
	short_name: string,
	/** Тип организации */
	type: ResolverInputTypes["OrganizationType"]
};
	["CreateOrganizationDataInput"]: {
	/** Банковский счет организации */
	bank_account: ResolverInputTypes["BankAccountInput"],
	/** Город */
	city: string,
	/** Страна */
	country: string,
	/** Детали организации */
	details: ResolverInputTypes["OrganizationDetailsInput"],
	/** Фактический адрес */
	fact_address: string,
	/** Полный адрес */
	full_address: string,
	/** Полное наименование организации */
	full_name: string,
	/** Телефон */
	phone: string,
	/** Представитель организации */
	represented_by: ResolverInputTypes["RepresentedByInput"],
	/** Краткое наименование организации */
	short_name: string,
	/** Тип организации */
	type: ResolverInputTypes["OrganizationType"]
};
	["CreateSovietIndividualDataInput"]: {
	/** Дата рождения */
	birthdate: string,
	/** Email адрес */
	email: string,
	/** Имя */
	first_name: string,
	/** Полный адрес */
	full_address: string,
	/** Фамилия */
	last_name: string,
	/** Отчество */
	middle_name: string,
	/** Данные паспорта */
	passport?: ResolverInputTypes["PassportInput"] | undefined | null,
	/** Телефон */
	phone: string
};
	["CreateSubscriptionInput"]: {
	/** Данные подписки */
	subscription: ResolverInputTypes["WebPushSubscriptionDataInput"],
	/** User Agent браузера */
	userAgent?: string | undefined | null,
	/** Username пользователя */
	username: string
};
	["CreateSubscriptionResponse"]: AliasType<{
	/** Сообщение о результате операции */
	message?:boolean | `@${string}`,
	/** Данные созданной подписки */
	subscription?:ResolverInputTypes["WebPushSubscriptionDto"],
	/** Успешно ли создана подписка */
	success?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["CurrentTableState"]: AliasType<{
	/** Номер блока, в котором была последняя запись */
	block_num?:boolean | `@${string}`,
	/** Код контракта */
	code?:boolean | `@${string}`,
	/** Дата создания последней записи */
	created_at?:boolean | `@${string}`,
	/** Первичный ключ */
	primary_key?:boolean | `@${string}`,
	/** Область действия */
	scope?:boolean | `@${string}`,
	/** Имя таблицы */
	table?:boolean | `@${string}`,
	/** Данные записи в формате JSON */
	value?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Статус цикла в системе CAPITAL */
["CycleStatus"]:CycleStatus;
	/** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
["DateTime"]:unknown;
	["DeactivateSubscriptionInput"]: {
	/** ID подписки для деактивации */
	subscriptionId: string
};
	/** Статус долга в системе CAPITAL */
["DebtStatus"]:DebtStatus;
	/** Комплексный объект решения совета, включающий в себя информацию о голосовавших членах совета, расширенное действие, которое привело к появлению решения, и агрегат документа самого решения. */
["DecisionDetailAggregate"]: AliasType<{
	action?:ResolverInputTypes["ExtendedBlockchainAction"],
	documentAggregate?:ResolverInputTypes["DocumentAggregate"],
	votes_against?:ResolverInputTypes["ExtendedBlockchainAction"],
	votes_for?:ResolverInputTypes["ExtendedBlockchainAction"],
		__typename?: boolean | `@${string}`
}>;
	["DeleteBranchInput"]: {
	/** Имя аккаунта кооперативного участка */
	braname: string,
	/** Имя аккаунта кооператива */
	coopname: string
};
	["DeletePaymentMethodInput"]: {
	/** Идентификатор метода оплаты */
	method_id: string,
	/** Имя пользователя, чей метод оплаты нужно удалить */
	username: string
};
	["DeleteTrustedAccountInput"]: {
	/** Имя аккаунта кооперативного участка */
	braname: string,
	/** Имя аккаунта кооператива */
	coopname: string,
	/** Имя аккаунта доверонного лица, у которого отзывается право подписи за председателя кооперативного участка */
	trusted: string
};
	["Delta"]: AliasType<{
	/** ID блока */
	block_id?:boolean | `@${string}`,
	/** Номер блока */
	block_num?:boolean | `@${string}`,
	/** ID блокчейна */
	chain_id?:boolean | `@${string}`,
	/** Код контракта */
	code?:boolean | `@${string}`,
	/** Дата создания */
	created_at?:boolean | `@${string}`,
	/** Уникальный идентификатор */
	id?:boolean | `@${string}`,
	/** Флаг присутствия записи */
	present?:boolean | `@${string}`,
	/** Первичный ключ */
	primary_key?:boolean | `@${string}`,
	/** Область действия */
	scope?:boolean | `@${string}`,
	/** Имя таблицы */
	table?:boolean | `@${string}`,
	/** Данные записи в формате JSON */
	value?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Desktop"]: AliasType<{
	/** Домашняя страница для авторизованных пользователей */
	authorizedHome?:boolean | `@${string}`,
	/** Имя аккаунта кооператива */
	coopname?:boolean | `@${string}`,
	/** Имя шаблона рабочих столов */
	layout?:boolean | `@${string}`,
	/** Домашняя страница для неавторизованных пользователей */
	nonAuthorizedHome?:boolean | `@${string}`,
	/** Состав приложений рабочего стола */
	workspaces?:ResolverInputTypes["DesktopWorkspace"],
		__typename?: boolean | `@${string}`
}>;
	["DesktopConfig"]: AliasType<{
	/** Маршрут по умолчанию */
	defaultRoute?:boolean | `@${string}`,
	/** Иконка для меню */
	icon?:boolean | `@${string}`,
	/** Уникальное имя workspace */
	name?:boolean | `@${string}`,
	/** Отображаемое название workspace */
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["DesktopWorkspace"]: AliasType<{
	/** Маршрут по умолчанию для этого workspace */
	defaultRoute?:boolean | `@${string}`,
	/** Имя расширения, которому принадлежит этот workspace */
	extension_name?:boolean | `@${string}`,
	/** Иконка для меню */
	icon?:boolean | `@${string}`,
	/** Уникальное имя workspace */
	name?:boolean | `@${string}`,
	/** Отображаемое название workspace */
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["DocumentAggregate"]: AliasType<{
	document?:ResolverInputTypes["SignedDigitalDocument"],
	hash?:boolean | `@${string}`,
	rawDocument?:ResolverInputTypes["GeneratedDocument"],
		__typename?: boolean | `@${string}`
}>;
	/** Комплексный объект папки цифрового документа с агрегатами, который включает в себя заявление, решение, акты и связанные документы */
["DocumentPackageAggregate"]: AliasType<{
	/** Массив объект(ов) актов с агрегатами, относящихся к заявлению */
	acts?:ResolverInputTypes["ActDetailAggregate"],
	/** Объект цифрового документа решения с агрегатом */
	decision?:ResolverInputTypes["DecisionDetailAggregate"],
	/** Массив связанных документов с агрегатами, извлечённых из мета-данных */
	links?:ResolverInputTypes["DocumentAggregate"],
	/** Объект цифрового документа заявления с агрегатом */
	statement?:ResolverInputTypes["StatementDetailAggregate"],
		__typename?: boolean | `@${string}`
}>;
	["EditBranchInput"]: {
	/** Документ, на основании которого действует Уполномоченный (решение совета №СС-.. от ..) */
	based_on: string,
	/** Имя аккаунта кооперативного участка */
	braname: string,
	/** Имя аккаунта кооператива */
	coopname: string,
	/** Электронная почта */
	email: string,
	/** Фактический адрес */
	fact_address: string,
	/** Полное имя организации кооперативного участка */
	full_name: string,
	/** Телефон */
	phone: string,
	/** Краткое имя организации кооперативного участка */
	short_name: string,
	/** Имя аккаунта уполномоченного (председателя) кооперативного участка */
	trustee: string
};
	["Entrepreneur"]: AliasType<{
	/** Дата рождения */
	birthdate?:boolean | `@${string}`,
	/** Город */
	city?:boolean | `@${string}`,
	/** Страна */
	country?:boolean | `@${string}`,
	/** Детали ИП (ИНН, ОГРН) */
	details?:ResolverInputTypes["EntrepreneurDetails"],
	/** Email */
	email?:boolean | `@${string}`,
	/** Имя */
	first_name?:boolean | `@${string}`,
	/** Юридический адрес */
	full_address?:boolean | `@${string}`,
	/** Фамилия */
	last_name?:boolean | `@${string}`,
	/** Отчество */
	middle_name?:boolean | `@${string}`,
	/** Телефон */
	phone?:boolean | `@${string}`,
	/** Имя аккаунта */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["EntrepreneurCertificate"]: AliasType<{
	/** Имя */
	first_name?:boolean | `@${string}`,
	/** ИНН */
	inn?:boolean | `@${string}`,
	/** Фамилия */
	last_name?:boolean | `@${string}`,
	/** Отчество */
	middle_name?:boolean | `@${string}`,
	/** Тип аккаунта */
	type?:boolean | `@${string}`,
	/** Имя аккаунта */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["EntrepreneurDetails"]: AliasType<{
	/** ИНН */
	inn?:boolean | `@${string}`,
	/** ОГРН */
	ogrn?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["EntrepreneurDetailsInput"]: {
	/** ИНН */
	inn: string,
	/** ОГРН */
	ogrn: string
};
	/** Статус расхода в системе CAPITAL */
["ExpenseStatus"]:ExpenseStatus;
	/** Расширенное действие блокчейна с сертификатом пользователя, совершившего его. */
["ExtendedBlockchainAction"]: AliasType<{
	account?:boolean | `@${string}`,
	account_ram_deltas?:ResolverInputTypes["AccountRamDelta"],
	action_ordinal?:boolean | `@${string}`,
	/** Сертификат пользователя (сокращенная информация) */
	actor_certificate?:ResolverInputTypes["UserCertificateUnion"],
	authorization?:ResolverInputTypes["ActionAuthorization"],
	block_id?:boolean | `@${string}`,
	block_num?:boolean | `@${string}`,
	chain_id?:boolean | `@${string}`,
	console?:boolean | `@${string}`,
	context_free?:boolean | `@${string}`,
	creator_action_ordinal?:boolean | `@${string}`,
	/** Данные действия в формате JSON */
	data?:boolean | `@${string}`,
	elapsed?:boolean | `@${string}`,
	global_sequence?:boolean | `@${string}`,
	name?:boolean | `@${string}`,
	receipt?:ResolverInputTypes["ActionReceipt"],
	receiver?:boolean | `@${string}`,
	transaction_id?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Расширенный статус собрания на основе дат и состояния */
["ExtendedMeetStatus"]:ExtendedMeetStatus;
	["Extension"]: AliasType<{
	/** Настройки конфигурации для расширения */
	config?:boolean | `@${string}`,
	/** Дата создания расширения */
	created_at?:boolean | `@${string}`,
	/** Описание расширения */
	description?:boolean | `@${string}`,
	/** Массив рабочих столов, которые предоставляет расширение */
	desktops?:ResolverInputTypes["DesktopConfig"],
	/** Показывает, включено ли расширение */
	enabled?:boolean | `@${string}`,
	/** Внешняя ссылка на iframe-интерфейс расширения */
	external_url?:boolean | `@${string}`,
	/** Изображение для расширения */
	image?:boolean | `@${string}`,
	/** Поле инструкция для установки (INSTALL) */
	instructions?:boolean | `@${string}`,
	/** Показывает, доступно ли расширение */
	is_available?:boolean | `@${string}`,
	/** Показывает, встроенное ли это расширение */
	is_builtin?:boolean | `@${string}`,
	/** Показывает, установлено ли расширение */
	is_installed?:boolean | `@${string}`,
	/** Показывает, внутреннее ли это расширение */
	is_internal?:boolean | `@${string}`,
	/** Уникальное имя расширения */
	name?:boolean | `@${string}`,
	/** Поле подробного текстового описания (README) */
	readme?:boolean | `@${string}`,
	/** Схема настроек конфигурации для расширения */
	schema?:boolean | `@${string}`,
	/** Массив тегов для расширения */
	tags?:boolean | `@${string}`,
	/** Заголовок расширения */
	title?:boolean | `@${string}`,
	/** Дата последнего обновления расширения */
	updated_at?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["ExtensionInput"]: {
	/** Объект конфигурации расширения */
	config: ResolverInputTypes["JSON"],
	/** Дата установки расширения */
	created_at?: ResolverInputTypes["DateTime"] | undefined | null,
	/** Флаг того, включено ли расширение сейчас */
	enabled: boolean,
	/** Уникальное имя расширения (является идентификатором) */
	name: string,
	/** Дата обновления расширения */
	updated_at?: ResolverInputTypes["DateTime"] | undefined | null
};
	["ExtensionLog"]: AliasType<{
	/** Дата создания записи */
	created_at?:boolean | `@${string}`,
	/** Данные лога в формате JSON */
	data?:boolean | `@${string}`,
	/** Локальный ID записи лога в рамках расширения */
	extension_local_id?:boolean | `@${string}`,
	/** Глобальный ID записи лога */
	id?:boolean | `@${string}`,
	/** Имя расширения */
	name?:boolean | `@${string}`,
	/** Дата последнего обновления записи */
	updated_at?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["ExtensionLogsPaginationResult"]: AliasType<{
	/** Текущая страница */
	currentPage?:boolean | `@${string}`,
	/** Элементы текущей страницы */
	items?:ResolverInputTypes["ExtensionLog"],
	/** Общее количество элементов */
	totalCount?:boolean | `@${string}`,
	/** Общее количество страниц */
	totalPages?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["GatewayPayment"]: AliasType<{
	/** Данные из блокчейна */
	blockchain_data?:boolean | `@${string}`,
	/** Можно ли изменить статус */
	can_change_status?:boolean | `@${string}`,
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** Дата создания */
	created_at?:boolean | `@${string}`,
	/** Направление платежа */
	direction?:boolean | `@${string}`,
	/** Человекочитаемое направление платежа */
	direction_label?:boolean | `@${string}`,
	/** Дата истечения */
	expired_at?:boolean | `@${string}`,
	/** Форматированная сумма */
	formatted_amount?:boolean | `@${string}`,
	/** Хеш платежа */
	hash?:boolean | `@${string}`,
	/** Уникальный идентификатор платежа */
	id?:boolean | `@${string}`,
	/** Хеш входящего платежа (устарело) */
	income_hash?:boolean | `@${string}`,
	/** Завершен ли платеж окончательно */
	is_final?:boolean | `@${string}`,
	/** Дополнительная информация */
	memo?:boolean | `@${string}`,
	/** Сообщение */
	message?:boolean | `@${string}`,
	/** Хеш исходящего платежа (устарело) */
	outcome_hash?:boolean | `@${string}`,
	/** Детали платежа */
	payment_details?:ResolverInputTypes["PaymentDetails"],
	/** ID платежного метода */
	payment_method_id?:boolean | `@${string}`,
	/** Провайдер платежа */
	provider?:boolean | `@${string}`,
	/** Количество/сумма */
	quantity?:boolean | `@${string}`,
	/** Подписанный документ заявления */
	statement?:boolean | `@${string}`,
	/** Статус платежа */
	status?:boolean | `@${string}`,
	/** Человекочитаемый статус */
	status_label?:boolean | `@${string}`,
	/** Символ валюты */
	symbol?:boolean | `@${string}`,
	/** Тип платежа */
	type?:boolean | `@${string}`,
	/** Человекочитаемый тип платежа */
	type_label?:boolean | `@${string}`,
	/** Дата обновления */
	updated_at?:boolean | `@${string}`,
	/** Имя пользователя */
	username?:boolean | `@${string}`,
	/** Сертификат пользователя, создавшего платеж */
	username_certificate?:ResolverInputTypes["UserCertificateUnion"],
		__typename?: boolean | `@${string}`
}>;
	["GenerateDocumentOptionsInput"]: {
	/** Язык документа */
	lang?: string | undefined | null,
	/** Пропустить сохранение */
	skip_save?: boolean | undefined | null
};
	["GeneratedDocument"]: AliasType<{
	/** Бинарное содержимое документа (base64) */
	binary?:boolean | `@${string}`,
	/** Полное название документа */
	full_title?:boolean | `@${string}`,
	/** Хэш документа */
	hash?:boolean | `@${string}`,
	/** HTML содержимое документа */
	html?:boolean | `@${string}`,
	/** Метаданные документа */
	meta?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["GeneratedRegistrationDocument"]: AliasType<{
	/** Тип соглашения для блокчейна */
	agreement_type?:boolean | `@${string}`,
	/** Текст для галочки на фронтенде */
	checkbox_text?:boolean | `@${string}`,
	/** Сгенерированный документ */
	document?:ResolverInputTypes["GeneratedDocument"],
	/** Идентификатор соглашения (wallet_agreement, signature_agreement и т.д.) */
	id?:boolean | `@${string}`,
	/** Нужно ли отправлять в блокчейн как agreement */
	is_blockchain_agreement?:boolean | `@${string}`,
	/** Текст ссылки для открытия диалога чтения */
	link_text?:boolean | `@${string}`,
	/** Нужно ли линковать в заявление */
	link_to_statement?:boolean | `@${string}`,
	/** Порядок отображения */
	order?:boolean | `@${string}`,
	/** Название документа */
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["GetAccountInput"]: {
	/** Имя аккаунта пользователя */
	username: string
};
	["GetAccountsInput"]: {
	role?: string | undefined | null
};
	["GetBranchesInput"]: {
	/** Фильтр по имени аккаунта кооперативного участка */
	braname?: string | undefined | null,
	/** Имя аккаунта кооператива */
	coopname: string
};
	/** Входные данные для получения логов событий по задаче */
["GetCapitalIssueLogsInput"]: {
	/** Хеш задачи */
	issue_hash: string
};
	/** Входные данные для получения логов событий с фильтрацией и пагинацией */
["GetCapitalLogsInput"]: {
	/** Фильтры для поиска логов */
	filter?: ResolverInputTypes["CapitalLogFilterInput"] | undefined | null,
	/** Параметры пагинации */
	pagination?: ResolverInputTypes["PaginationInput"] | undefined | null
};
	["GetExtensionLogsInput"]: {
	/** Фильтр по дате создания (от) */
	createdFrom?: ResolverInputTypes["DateTime"] | undefined | null,
	/** Фильтр по дате создания (до) */
	createdTo?: ResolverInputTypes["DateTime"] | undefined | null,
	/** Фильтр по имени расширения */
	name?: string | undefined | null
};
	["GetExtensionsInput"]: {
	/** Фильтр включенных расширений */
	enabled?: boolean | undefined | null,
	/** Фильтр активности */
	is_available?: boolean | undefined | null,
	/** Фильтр рабочих столов */
	is_desktop?: boolean | undefined | null,
	/** Фильтр установленных расширений */
	is_installed?: boolean | undefined | null,
	/** Фильтр по имени */
	name?: string | undefined | null
};
	["GetInstallationStatusInput"]: {
	/** Код установки */
	install_code: string
};
	["GetPaymentMethodsInput"]: {
	/** Количество элементов на странице */
	limit: number,
	/** Номер страницы */
	page: number,
	/** Ключ сортировки (например, "name") */
	sortBy?: string | undefined | null,
	/** Направление сортировки ("ASC" или "DESC") */
	sortOrder: string,
	/** Имя пользователя для фильтрации методов оплаты */
	username?: string | undefined | null
};
	["GetUserSubscriptionsInput"]: {
	/** Username пользователя */
	username: string
};
	["Individual"]: AliasType<{
	/** Дата рождения */
	birthdate?:boolean | `@${string}`,
	/** Email */
	email?:boolean | `@${string}`,
	/** Имя */
	first_name?:boolean | `@${string}`,
	/** Полный адрес */
	full_address?:boolean | `@${string}`,
	/** Фамилия */
	last_name?:boolean | `@${string}`,
	/** Отчество */
	middle_name?:boolean | `@${string}`,
	/** Данные паспорта */
	passport?:ResolverInputTypes["Passport"],
	/** Телефон */
	phone?:boolean | `@${string}`,
	/** Имя аккаунта */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["IndividualCertificate"]: AliasType<{
	/** Имя */
	first_name?:boolean | `@${string}`,
	/** Фамилия */
	last_name?:boolean | `@${string}`,
	/** Отчество */
	middle_name?:boolean | `@${string}`,
	/** Тип аккаунта */
	type?:boolean | `@${string}`,
	/** Имя аккаунта */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Init"]: {
	/** Объект организации кооператива, которая обслуживает данный экземпляр программного обеспечения MONO */
	organization_data: ResolverInputTypes["CreateInitOrganizationDataInput"]
};
	["Install"]: {
	soviet: Array<ResolverInputTypes["SovietMemberInput"]>,
	vars: ResolverInputTypes["SetVarsInput"]
};
	["InstallationStatus"]: AliasType<{
	/** Есть ли приватный аккаунт */
	has_private_account?:boolean | `@${string}`,
	/** Инициализация выполнена через сервер */
	init_by_server?:boolean | `@${string}`,
	/** Данные организации с банковскими реквизитами */
	organization_data?:ResolverInputTypes["OrganizationWithBankAccount"],
		__typename?: boolean | `@${string}`
}>;
	/** Статусы инвестиции в системе CAPITAL */
["InvestStatus"]:InvestStatus;
	/** Приоритет задачи в системе CAPITAL */
["IssuePriority"]:IssuePriority;
	/** Статус задачи в системе CAPITAL */
["IssueStatus"]:IssueStatus;
	/** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
["JSON"]:unknown;
	["KeyWeight"]: AliasType<{
	/** Ключ */
	key?:boolean | `@${string}`,
	/** Вес */
	weight?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["LedgerOperation"]: AliasType<{
	/** ID счета */
	account_id?:boolean | `@${string}`,
	/** Тип операции */
	action?:boolean | `@${string}`,
	/** Комментарий к операции */
	comment?:boolean | `@${string}`,
	/** Имя кооператива */
	coopname?:boolean | `@${string}`,
	/** Дата и время создания операции */
	created_at?:boolean | `@${string}`,
	/** Номер глобальной последовательности блокчейна */
	global_sequence?:boolean | `@${string}`,
	/** Хеш пакета документов операции */
	hash?:boolean | `@${string}`,
	/** Сумма операции */
	quantity?:boolean | `@${string}`,
	/** Имя пользователя, совершившего операцию */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Типы сущностей в логах */
["LogEntityType"]:LogEntityType;
	/** Типы событий в системе логирования */
["LogEventType"]:LogEventType;
	/** Данные о собрании кооператива */
["Meet"]: AliasType<{
	/** Документ с решением совета о проведении собрания */
	authorization?:ResolverInputTypes["DocumentAggregate"],
	/** Дата закрытия собрания */
	close_at?:boolean | `@${string}`,
	/** Имя аккаунта кооператива */
	coopname?:boolean | `@${string}`,
	/** Дата создания собрания */
	created_at?:boolean | `@${string}`,
	/** Текущий процент кворума */
	current_quorum_percent?:boolean | `@${string}`,
	/** Цикл собрания */
	cycle?:boolean | `@${string}`,
	/** Документ с решением секретаря */
	decision1?:ResolverInputTypes["DocumentAggregate"],
	/** Документ с решением председателя */
	decision2?:ResolverInputTypes["DocumentAggregate"],
	/** Хеш собрания */
	hash?:boolean | `@${string}`,
	/** Уникальный идентификатор собрания */
	id?:boolean | `@${string}`,
	/** Инициатор собрания */
	initiator?:boolean | `@${string}`,
	/** Сертификат инициатора собрания */
	initiator_certificate?:ResolverInputTypes["UserCertificateUnion"],
	/** Уровень собрания */
	level?:boolean | `@${string}`,
	/** Список пользователей, которые подписали уведомление */
	notified_users?:boolean | `@${string}`,
	/** Дата открытия собрания */
	open_at?:boolean | `@${string}`,
	/** Председатель собрания */
	presider?:boolean | `@${string}`,
	/** Сертификат председателя собрания */
	presider_certificate?:ResolverInputTypes["UserCertificateUnion"],
	/** Документ с повесткой собрания */
	proposal?:ResolverInputTypes["DocumentAggregate"],
	/** Флаг достижения кворума */
	quorum_passed?:boolean | `@${string}`,
	/** Процент необходимого кворума */
	quorum_percent?:boolean | `@${string}`,
	/** Секретарь собрания */
	secretary?:boolean | `@${string}`,
	/** Сертификат секретаря собрания */
	secretary_certificate?:ResolverInputTypes["UserCertificateUnion"],
	/** Количество подписанных бюллетеней */
	signed_ballots?:boolean | `@${string}`,
	/** Статус собрания */
	status?:boolean | `@${string}`,
	/** Тип собрания */
	type?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Предварительные данные собрания перед обработкой */
["MeetPreProcessing"]: AliasType<{
	/** Повестка собрания */
	agenda?:ResolverInputTypes["AgendaMeetPoint"],
	/** Дата закрытия собрания */
	close_at?:boolean | `@${string}`,
	/** Имя аккаунта кооператива */
	coopname?:boolean | `@${string}`,
	/** Дополнительная информация о формате собрания */
	details?:boolean | `@${string}`,
	/** Хеш собрания */
	hash?:boolean | `@${string}`,
	/** Инициатор собрания */
	initiator?:boolean | `@${string}`,
	/** Сертификат инициатора собрания */
	initiator_certificate?:ResolverInputTypes["UserCertificateUnion"],
	/** Дата открытия собрания */
	open_at?:boolean | `@${string}`,
	/** Председатель собрания */
	presider?:boolean | `@${string}`,
	/** Сертификат председателя собрания */
	presider_certificate?:ResolverInputTypes["UserCertificateUnion"],
	/** Документ с предложением повестки собрания */
	proposal?:ResolverInputTypes["DocumentAggregate"],
	/** Секретарь собрания */
	secretary?:boolean | `@${string}`,
	/** Сертификат секретаря собрания */
	secretary_certificate?:ResolverInputTypes["UserCertificateUnion"],
		__typename?: boolean | `@${string}`
}>;
	/** Данные о собрании после обработки */
["MeetProcessed"]: AliasType<{
	/** Имя кооператива */
	coopname?:boolean | `@${string}`,
	/** Документ решения из блокчейна */
	decision?:ResolverInputTypes["SignedDigitalDocument"],
	/** Агрегат документа решения */
	decisionAggregate?:ResolverInputTypes["DocumentAggregate"],
	/** Хеш собрания */
	hash?:boolean | `@${string}`,
	/** Председатель собрания */
	presider?:boolean | `@${string}`,
	/** Сертификат председателя собрания */
	presider_certificate?:ResolverInputTypes["UserCertificateUnion"],
	/** Пройден ли кворум */
	quorum_passed?:boolean | `@${string}`,
	/** Процент кворума */
	quorum_percent?:boolean | `@${string}`,
	/** Результаты голосования по вопросам */
	results?:ResolverInputTypes["MeetQuestionResult"],
	/** Секретарь собрания */
	secretary?:boolean | `@${string}`,
	/** Сертификат секретаря собрания */
	secretary_certificate?:ResolverInputTypes["UserCertificateUnion"],
	/** Количество подписанных бюллетеней */
	signed_ballots?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Данные о собрании в процессе обработки */
["MeetProcessing"]: AliasType<{
	/** Расширенный статус собрания на основе дат и состояния */
	extendedStatus?:boolean | `@${string}`,
	/** Хеш собрания */
	hash?:boolean | `@${string}`,
	/** Флаг указывающий, голосовал ли текущий пользователь */
	isVoted?:boolean | `@${string}`,
	/** Основная информация о собрании */
	meet?:ResolverInputTypes["Meet"],
	/** Список вопросов повестки собрания */
	questions?:ResolverInputTypes["Question"],
		__typename?: boolean | `@${string}`
}>;
	/** Результат голосования по вопросу */
["MeetQuestionResult"]: AliasType<{
	/** Принят ли вопрос */
	accepted?:boolean | `@${string}`,
	/** Контекст вопроса */
	context?:boolean | `@${string}`,
	/** Принятое решение */
	decision?:boolean | `@${string}`,
	/** Порядковый номер вопроса */
	number?:boolean | `@${string}`,
	/** Идентификатор вопроса */
	question_id?:boolean | `@${string}`,
	/** Заголовок вопроса */
	title?:boolean | `@${string}`,
	/** Количество воздержавшихся */
	votes_abstained?:boolean | `@${string}`,
	/** Количество голосов против */
	votes_against?:boolean | `@${string}`,
	/** Количество голосов за */
	votes_for?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["MonoAccount"]: AliasType<{
	/** Электронная почта пользователя */
	email?:boolean | `@${string}`,
	/** Есть ли у пользователя аккаунт */
	has_account?:boolean | `@${string}`,
	/** ID начального заказа */
	initial_order?:boolean | `@${string}`,
	/** Подтверждена ли электронная почта */
	is_email_verified?:boolean | `@${string}`,
	/** Зарегистрирован ли пользователь */
	is_registered?:boolean | `@${string}`,
	/** Сообщение */
	message?:boolean | `@${string}`,
	/** Публичный ключ пользователя */
	public_key?:boolean | `@${string}`,
	/** Реферер пользователя */
	referer?:boolean | `@${string}`,
	/** Роль пользователя */
	role?:boolean | `@${string}`,
	/** Статус пользователя */
	status?:boolean | `@${string}`,
	/** Хэш подписчика для уведомлений */
	subscriber_hash?:boolean | `@${string}`,
	/** Идентификатор подписчика для уведомлений */
	subscriber_id?:boolean | `@${string}`,
	/** Тип пользователя */
	type?:boolean | `@${string}`,
	/** Имя пользователя */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Mutation"]: AliasType<{
addPaymentMethod?: [{	data: ResolverInputTypes["AddPaymentMethodInput"]},ResolverInputTypes["PaymentMethod"]],
addTrustedAccount?: [{	data: ResolverInputTypes["AddTrustedAccountInput"]},ResolverInputTypes["Branch"]],
createBranch?: [{	data: ResolverInputTypes["CreateBranchInput"]},ResolverInputTypes["Branch"]],
createWebPushSubscription?: [{	data: ResolverInputTypes["CreateSubscriptionInput"]},ResolverInputTypes["CreateSubscriptionResponse"]],
deactivateWebPushSubscriptionById?: [{	data: ResolverInputTypes["DeactivateSubscriptionInput"]},boolean | `@${string}`],
deleteBranch?: [{	data: ResolverInputTypes["DeleteBranchInput"]},boolean | `@${string}`],
deletePaymentMethod?: [{	data: ResolverInputTypes["DeletePaymentMethodInput"]},boolean | `@${string}`],
deleteTrustedAccount?: [{	data: ResolverInputTypes["DeleteTrustedAccountInput"]},ResolverInputTypes["Branch"]],
editBranch?: [{	data: ResolverInputTypes["EditBranchInput"]},ResolverInputTypes["Branch"]],
generateSelectBranchDocument?: [{	data: ResolverInputTypes["SelectBranchGenerateDocumentInput"],	options?: ResolverInputTypes["GenerateDocumentOptionsInput"] | undefined | null},ResolverInputTypes["GeneratedDocument"]],
initSystem?: [{	data: ResolverInputTypes["Init"]},ResolverInputTypes["SystemInfo"]],
installExtension?: [{	data: ResolverInputTypes["ExtensionInput"]},ResolverInputTypes["Extension"]],
installSystem?: [{	data: ResolverInputTypes["Install"]},ResolverInputTypes["SystemInfo"]],
registerAccount?: [{	data: ResolverInputTypes["RegisterAccountInput"]},ResolverInputTypes["RegisteredAccount"]],
selectBranch?: [{	data: ResolverInputTypes["SelectBranchInput"]},boolean | `@${string}`],
setWif?: [{	data: ResolverInputTypes["SetWifInput"]},boolean | `@${string}`],
startInstall?: [{	data: ResolverInputTypes["StartInstallInput"]},ResolverInputTypes["StartInstallResult"]],
uninstallExtension?: [{	data: ResolverInputTypes["UninstallExtensionInput"]},boolean | `@${string}`],
updateAccount?: [{	data: ResolverInputTypes["UpdateAccountInput"]},ResolverInputTypes["Account"]],
updateBankAccount?: [{	data: ResolverInputTypes["UpdateBankAccountInput"]},ResolverInputTypes["PaymentMethod"]],
updateExtension?: [{	data: ResolverInputTypes["ExtensionInput"]},ResolverInputTypes["Extension"]],
updateSettings?: [{	data: ResolverInputTypes["UpdateSettingsInput"]},ResolverInputTypes["Settings"]],
updateSystem?: [{	data: ResolverInputTypes["Update"]},ResolverInputTypes["SystemInfo"]],
		__typename?: boolean | `@${string}`
}>;
	["OneCoopDocumentOutput"]: AliasType<{
	/** Тип действия документа */
	action?:boolean | `@${string}`,
	/** Номер блока, в котором документ был зафиксирован */
	block_num?:boolean | `@${string}`,
	/** Специфичные данные для конкретного типа действия */
	data?:boolean | `@${string}`,
	/** SHA-256 хеш основного документа */
	hash?:boolean | `@${string}`,
	/** SHA-256 хеш пакета документов */
	package?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Organization"]: AliasType<{
	/** Город */
	city?:boolean | `@${string}`,
	/** Страна */
	country?:boolean | `@${string}`,
	/** Детали организации */
	details?:ResolverInputTypes["OrganizationDetails"],
	/** Email */
	email?:boolean | `@${string}`,
	/** Фактический адрес */
	fact_address?:boolean | `@${string}`,
	/** Юридический адрес */
	full_address?:boolean | `@${string}`,
	/** Полное название */
	full_name?:boolean | `@${string}`,
	/** Телефон */
	phone?:boolean | `@${string}`,
	/** Представитель организации */
	represented_by?:ResolverInputTypes["RepresentedBy"],
	/** Краткое название */
	short_name?:boolean | `@${string}`,
	/** Тип организации */
	type?:boolean | `@${string}`,
	/** Имя аккаунта организации */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["OrganizationCertificate"]: AliasType<{
	/** ИНН */
	inn?:boolean | `@${string}`,
	/** ОГРН */
	ogrn?:boolean | `@${string}`,
	/** Данные представителя */
	represented_by?:ResolverInputTypes["RepresentedByCertificate"],
	/** Короткое название организации */
	short_name?:boolean | `@${string}`,
	/** Тип аккаунта */
	type?:boolean | `@${string}`,
	/** Имя аккаунта */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["OrganizationDetails"]: AliasType<{
	/** ИНН */
	inn?:boolean | `@${string}`,
	/** КПП */
	kpp?:boolean | `@${string}`,
	/** ОГРН */
	ogrn?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["OrganizationDetailsInput"]: {
	inn: string,
	kpp: string,
	ogrn: string
};
	/** Тип юридического лица */
["OrganizationType"]:OrganizationType;
	["OrganizationWithBankAccount"]: AliasType<{
	/** Банковские реквизиты */
	bank_account?:ResolverInputTypes["BankAccount"],
	/** Город */
	city?:boolean | `@${string}`,
	/** Страна */
	country?:boolean | `@${string}`,
	/** Детали организации */
	details?:ResolverInputTypes["OrganizationDetails"],
	/** Email */
	email?:boolean | `@${string}`,
	/** Фактический адрес */
	fact_address?:boolean | `@${string}`,
	/** Юридический адрес */
	full_address?:boolean | `@${string}`,
	/** Полное название */
	full_name?:boolean | `@${string}`,
	/** Телефон */
	phone?:boolean | `@${string}`,
	/** Представитель организации */
	represented_by?:ResolverInputTypes["RepresentedBy"],
	/** Краткое название */
	short_name?:boolean | `@${string}`,
	/** Тип организации */
	type?:boolean | `@${string}`,
	/** Имя аккаунта организации */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["PaginatedCapitalLogsPaginationResult"]: AliasType<{
	/** Текущая страница */
	currentPage?:boolean | `@${string}`,
	/** Элементы текущей страницы */
	items?:ResolverInputTypes["CapitalLog"],
	/** Общее количество элементов */
	totalCount?:boolean | `@${string}`,
	/** Общее количество страниц */
	totalPages?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["PaginationInput"]: {
	/** Количество элементов на странице */
	limit: number,
	/** Номер страницы */
	page: number,
	/** Ключ сортировки (например, "name") */
	sortBy?: string | undefined | null,
	/** Направление сортировки ("ASC" или "DESC") */
	sortOrder: string
};
	["ParticipantAccount"]: AliasType<{
	/** Имя кооперативного участка */
	braname?:boolean | `@${string}`,
	/** Время создания записи о члене */
	created_at?:boolean | `@${string}`,
	/** LEGACY Флаг, имеет ли член право голоса */
	has_vote?:boolean | `@${string}`,
	/** Сумма вступительного взноса */
	initial_amount?:boolean | `@${string}`,
	/** LEGACY Флаг, внесен ли регистрационный взнос */
	is_initial?:boolean | `@${string}`,
	/** LEGACY Флаг, внесен ли минимальный паевый взнос */
	is_minimum?:boolean | `@${string}`,
	/** Время последнего минимального платежа */
	last_min_pay?:boolean | `@${string}`,
	/** Время последнего обновления информации о члене */
	last_update?:boolean | `@${string}`,
	/** Сумма минимального паевого взноса */
	minimum_amount?:boolean | `@${string}`,
	/** Статус члена кооператива (accepted | blocked) */
	status?:boolean | `@${string}`,
	/** Тип участника (individual | entrepreneur | organization) */
	type?:boolean | `@${string}`,
	/** Уникальное имя члена кооператива */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Passport"]: AliasType<{
	/** Код подразделения */
	code?:boolean | `@${string}`,
	/** Дата выдачи */
	issued_at?:boolean | `@${string}`,
	/** Кем выдан */
	issued_by?:boolean | `@${string}`,
	/** Номер паспорта */
	number?:boolean | `@${string}`,
	/** Серия паспорта */
	series?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["PassportInput"]: {
	code: string,
	issued_at: string,
	issued_by: string,
	number: number,
	series: number
};
	["PaymentDetails"]: AliasType<{
	/** Сумма платежа с учетом комиссии */
	amount_plus_fee?:boolean | `@${string}`,
	/** Сумма платежа без учета комиссии */
	amount_without_fee?:boolean | `@${string}`,
	/** Данные платежа (QR-код, токен, реквизиты и т.д.) */
	data?:boolean | `@${string}`,
	/** Фактический процент комиссии */
	fact_fee_percent?:boolean | `@${string}`,
	/** Размер комиссии в абсолютных значениях */
	fee_amount?:boolean | `@${string}`,
	/** Процент комиссии */
	fee_percent?:boolean | `@${string}`,
	/** Допустимый процент отклонения */
	tolerance_percent?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Направление платежа */
["PaymentDirection"]:PaymentDirection;
	["PaymentMethod"]: AliasType<{
	/** Дата создания */
	created_at?:boolean | `@${string}`,
	/** Данные метода оплаты */
	data?:ResolverInputTypes["PaymentMethodData"],
	/** Флаг основного метода платежа, который отображается в документах */
	is_default?:boolean | `@${string}`,
	/** Идентификатор метода оплаты */
	method_id?:boolean | `@${string}`,
	/** Тип метода оплаты (например, sbp, bank_transfer) */
	method_type?:boolean | `@${string}`,
	/** Дата обновления */
	updated_at?:boolean | `@${string}`,
	/** Имя пользователя, к которому привязан метод оплаты */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["PaymentMethodData"]: AliasType<{
	BankAccount?:ResolverInputTypes["BankAccount"],
	SbpAccount?:ResolverInputTypes["SbpAccount"],
		__typename?: boolean | `@${string}`
}>;
	["PaymentMethodPaginationResult"]: AliasType<{
	/** Текущая страница */
	currentPage?:boolean | `@${string}`,
	/** Элементы текущей страницы */
	items?:ResolverInputTypes["PaymentMethod"],
	/** Общее количество элементов */
	totalCount?:boolean | `@${string}`,
	/** Общее количество страниц */
	totalPages?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Статус платежа */
["PaymentStatus"]:PaymentStatus;
	/** Тип платежа по назначению */
["PaymentType"]:PaymentType;
	["Permission"]: AliasType<{
	/** Родительское разрешение */
	parent?:boolean | `@${string}`,
	/** Имя разрешения */
	perm_name?:boolean | `@${string}`,
	/** Требуемые разрешения */
	required_auth?:ResolverInputTypes["Authority"],
		__typename?: boolean | `@${string}`
}>;
	["PermissionLevel"]: AliasType<{
	/** Актор */
	actor?:boolean | `@${string}`,
	/** Разрешение */
	permission?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["PermissionLevelWeight"]: AliasType<{
	/** Уровень разрешения */
	permission?:ResolverInputTypes["PermissionLevel"],
	/** Вес */
	weight?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["PrivateAccount"]: AliasType<{
	entrepreneur_data?:ResolverInputTypes["Entrepreneur"],
	individual_data?:ResolverInputTypes["Individual"],
	organization_data?:ResolverInputTypes["Organization"],
	/** Тип аккаунта */
	type?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["PrivateAccountSearchData"]: AliasType<{
	Entrepreneur?:ResolverInputTypes["Entrepreneur"],
	Individual?:ResolverInputTypes["Individual"],
	Organization?:ResolverInputTypes["Organization"],
		__typename?: boolean | `@${string}`
}>;
	["PrivateAccountSearchResult"]: AliasType<{
	/** Данные найденного аккаунта */
	data?:ResolverInputTypes["PrivateAccountSearchData"],
	/** Поля, в которых найдены совпадения */
	highlightedFields?:boolean | `@${string}`,
	/** Оценка релевантности результата */
	score?:boolean | `@${string}`,
	/** Тип аккаунта */
	type?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["ProcessEdge"]: AliasType<{
	id?:boolean | `@${string}`,
	source?:boolean | `@${string}`,
	target?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["ProcessStepPosition"]: AliasType<{
	x?:boolean | `@${string}`,
	y?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["ProcessStepPositionInput"]: {
	x: number,
	y: number
};
	["ProcessStepState"]: AliasType<{
	completed_at?:boolean | `@${string}`,
	issue_hash?:boolean | `@${string}`,
	status?:boolean | `@${string}`,
	step_id?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["ProcessStepStatus"]:ProcessStepStatus;
	["ProcessStepTemplate"]: AliasType<{
	description?:boolean | `@${string}`,
	estimate?:boolean | `@${string}`,
	id?:boolean | `@${string}`,
	is_start?:boolean | `@${string}`,
	position?:ResolverInputTypes["ProcessStepPosition"],
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Статус программной инвестиции в системе CAPITAL */
["ProgramInvestStatus"]:ProgramInvestStatus;
	/** Тип целевой потребительской программы */
["ProgramType"]:ProgramType;
	["ProgramWallet"]: AliasType<{
	/** Идентификатор соглашения */
	agreement_id?:boolean | `@${string}`,
	/** Доступный баланс (формат: "100.0000 RUB") */
	available?:boolean | `@${string}`,
	/** Номер блока последнего обновления */
	blockNum?:boolean | `@${string}`,
	/** Заблокированный баланс (формат: "100.0000 RUB") */
	blocked?:boolean | `@${string}`,
	/** Имя кооператива */
	coopname?:boolean | `@${string}`,
	/** Уникальный идентификатор кошелька в блокчейне */
	id?:boolean | `@${string}`,
	/** Паевой взнос (формат: "100.0000 RUB") */
	membership_contribution?:boolean | `@${string}`,
	/** Идентификатор программы */
	program_id?:boolean | `@${string}`,
	/** Тип программы */
	program_type?:boolean | `@${string}`,
	/** Имя пользователя */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Статусы проекта в системе CAPITAL */
["ProjectStatus"]:ProjectStatus;
	["PublicChairman"]: AliasType<{
	first_name?:boolean | `@${string}`,
	last_name?:boolean | `@${string}`,
	middle_name?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Query"]: AliasType<{
getAccount?: [{	data: ResolverInputTypes["GetAccountInput"]},ResolverInputTypes["Account"]],
getAccounts?: [{	data?: ResolverInputTypes["GetAccountsInput"] | undefined | null,	options?: ResolverInputTypes["PaginationInput"] | undefined | null},ResolverInputTypes["AccountsPaginationResult"]],
getBranches?: [{	data: ResolverInputTypes["GetBranchesInput"]},ResolverInputTypes["Branch"]],
getCapitalIssueLogs?: [{	data: ResolverInputTypes["GetCapitalIssueLogsInput"],	options?: ResolverInputTypes["PaginationInput"] | undefined | null},ResolverInputTypes["PaginatedCapitalLogsPaginationResult"]],
getCapitalProjectLogs?: [{	data: ResolverInputTypes["GetCapitalLogsInput"]},ResolverInputTypes["PaginatedCapitalLogsPaginationResult"]],
	/** Получить состав приложений рабочего стола */
	getDesktop?:ResolverInputTypes["Desktop"],
getExtensionLogs?: [{	data?: ResolverInputTypes["GetExtensionLogsInput"] | undefined | null,	options?: ResolverInputTypes["PaginationInput"] | undefined | null},ResolverInputTypes["ExtensionLogsPaginationResult"]],
getExtensions?: [{	data?: ResolverInputTypes["GetExtensionsInput"] | undefined | null},ResolverInputTypes["Extension"]],
getInstallationStatus?: [{	data: ResolverInputTypes["GetInstallationStatusInput"]},ResolverInputTypes["InstallationStatus"]],
getPaymentMethods?: [{	data?: ResolverInputTypes["GetPaymentMethodsInput"] | undefined | null},ResolverInputTypes["PaymentMethodPaginationResult"]],
getRegistrationConfig?: [{	account_type: ResolverInputTypes["AccountType"],	coopname: string},ResolverInputTypes["RegistrationConfig"]],
	/** Получить сводную публичную информацию о системе */
	getSystemInfo?:ResolverInputTypes["SystemInfo"],
getUserWebPushSubscriptions?: [{	data: ResolverInputTypes["GetUserSubscriptionsInput"]},ResolverInputTypes["WebPushSubscriptionDto"]],
	/** Получить статистику веб-пуш подписок (только для председателя)

Требуемые роли: chairman.  */
	getWebPushSubscriptionStats?:ResolverInputTypes["SubscriptionStatsDto"],
searchPrivateAccounts?: [{	data: ResolverInputTypes["SearchPrivateAccountsInput"]},ResolverInputTypes["PrivateAccountSearchResult"]],
		__typename?: boolean | `@${string}`
}>;
	/** Вопрос повестки собрания с результатами голосования */
["Question"]: AliasType<{
	/** Контекст или дополнительная информация по вопросу */
	context?:boolean | `@${string}`,
	/** Имя аккаунта кооператива */
	coopname?:boolean | `@${string}`,
	/** Количество голосов "Воздержался" */
	counter_votes_abstained?:boolean | `@${string}`,
	/** Количество голосов "Против" */
	counter_votes_against?:boolean | `@${string}`,
	/** Количество голосов "За" */
	counter_votes_for?:boolean | `@${string}`,
	/** Предлагаемое решение по вопросу */
	decision?:boolean | `@${string}`,
	/** Уникальный идентификатор вопроса */
	id?:boolean | `@${string}`,
	/** Идентификатор собрания, к которому относится вопрос */
	meet_id?:boolean | `@${string}`,
	/** Порядковый номер вопроса в повестке */
	number?:boolean | `@${string}`,
	/** Заголовок вопроса */
	title?:boolean | `@${string}`,
	/** Список участников, проголосовавших "Воздержался" */
	voters_abstained?:boolean | `@${string}`,
	/** Список участников, проголосовавших "Против" */
	voters_against?:boolean | `@${string}`,
	/** Список участников, проголосовавших "За" */
	voters_for?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["RefundRequest"]: AliasType<{
	/** Сумма CPU */
	cpu_amount?:boolean | `@${string}`,
	/** Сумма сети */
	net_amount?:boolean | `@${string}`,
	/** Владелец */
	owner?:boolean | `@${string}`,
	/** Время запроса */
	request_time?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["RegisterAccountInput"]: {
	/** Электронная почта */
	email: string,
	/** Данные индивидуального предпринимателя */
	entrepreneur_data?: ResolverInputTypes["CreateEntrepreneurDataInput"] | undefined | null,
	/** Данные физического лица */
	individual_data?: ResolverInputTypes["CreateIndividualDataInput"] | undefined | null,
	/** Данные организации */
	organization_data?: ResolverInputTypes["CreateOrganizationDataInput"] | undefined | null,
	/** Публичный ключ */
	public_key: string,
	/** Имя аккаунта реферера */
	referer?: string | undefined | null,
	/** Тип аккаунта */
	type: ResolverInputTypes["AccountType"],
	/** Имя пользователя */
	username: string
};
	["RegisteredAccount"]: AliasType<{
	/** Информация об зарегистрированном аккаунте */
	account?:ResolverInputTypes["Account"],
	/** Токены доступа и обновления */
	tokens?:ResolverInputTypes["Tokens"],
		__typename?: boolean | `@${string}`
}>;
	["RegistrationConfig"]: AliasType<{
	/** Доступные программы */
	programs?:ResolverInputTypes["RegistrationProgram"],
	/** Нужен ли выбор программы */
	requires_selection?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["RegistrationProgram"]: AliasType<{
	/** Для каких типов аккаунтов доступна программа */
	applicable_account_types?:boolean | `@${string}`,
	/** Описание программы */
	description?:boolean | `@${string}`,
	/** URL изображения (опционально) */
	image_url?:boolean | `@${string}`,
	/** Уникальный ключ программы */
	key?:boolean | `@${string}`,
	/** Порядок отображения */
	order?:boolean | `@${string}`,
	/** Минимальные требования для участия */
	requirements?:boolean | `@${string}`,
	/** Название программы для отображения */
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["RepresentedBy"]: AliasType<{
	/** На основании чего действует */
	based_on?:boolean | `@${string}`,
	/** Имя */
	first_name?:boolean | `@${string}`,
	/** Фамилия */
	last_name?:boolean | `@${string}`,
	/** Отчество */
	middle_name?:boolean | `@${string}`,
	/** Должность */
	position?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["RepresentedByCertificate"]: AliasType<{
	/** Имя */
	first_name?:boolean | `@${string}`,
	/** Фамилия */
	last_name?:boolean | `@${string}`,
	/** Отчество */
	middle_name?:boolean | `@${string}`,
	/** Должность */
	position?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["RepresentedByInput"]: {
	based_on: string,
	first_name: string,
	last_name: string,
	middle_name: string,
	position: string
};
	["ResourceDelegationDTO"]: AliasType<{
	/** Вес CPU */
	cpu_weight?:boolean | `@${string}`,
	/** Отправитель */
	from?:boolean | `@${string}`,
	/** Вес сети */
	net_weight?:boolean | `@${string}`,
	/** Получатель */
	to?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["ResourceOverview"]: AliasType<{
	/** Вес CPU */
	cpu_weight?:boolean | `@${string}`,
	/** Вес сети */
	net_weight?:boolean | `@${string}`,
	/** Владелец */
	owner?:boolean | `@${string}`,
	/** Используемая RAM */
	ram_bytes?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Статус результата в системе CAPITAL */
["ResultStatus"]:ResultStatus;
	["SbpAccount"]: AliasType<{
	/** Мобильный телефон получателя */
	phone?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["SbpDataInput"]: {
	/** Мобильный телефон получателя */
	phone: string
};
	["SearchPrivateAccountsInput"]: {
	/** Поисковый запрос для поиска приватных аккаунтов */
	query: string
};
	/** Статус сегмента участника в проекте CAPITAL */
["SegmentStatus"]:SegmentStatus;
	["SelectBranchGenerateDocumentInput"]: {
	/** Номер блока, на котором был создан документ */
	block_num?: number | undefined | null,
	/** Идентификатор имени аккаунта кооперативного участка */
	braname: string,
	/** Название кооператива, связанное с документом */
	coopname: string,
	/** Дата и время создания документа */
	created_at?: string | undefined | null,
	/** Имя генератора, использованного для создания документа */
	generator?: string | undefined | null,
	/** Язык документа */
	lang?: string | undefined | null,
	/** Ссылки, связанные с документом */
	links?: Array<string> | undefined | null,
	/** Часовой пояс, в котором был создан документ */
	timezone?: string | undefined | null,
	/** Название документа */
	title?: string | undefined | null,
	/** Имя пользователя, создавшего документ */
	username: string,
	/** Версия генератора, использованного для создания документа */
	version?: string | undefined | null
};
	["SelectBranchInput"]: {
	/** Имя аккаунта кооперативного участка */
	braname: string,
	/** Имя аккаунта кооператива */
	coopname: string,
	/** Подписанный электронный документ (generateSelectBranchDocument) */
	document: ResolverInputTypes["SelectBranchSignedDocumentInput"],
	/** Имя аккаунта пользователя */
	username: string
};
	["SelectBranchSignedDocumentInput"]: {
	/** Хэш содержимого документа */
	doc_hash: string,
	/** Общий хэш (doc_hash + meta_hash) */
	hash: string,
	/** Метаинформация для документа выбора кооперативного участка */
	meta: ResolverInputTypes["SelectBranchSignedMetaDocumentInput"],
	/** Хэш мета-данных */
	meta_hash: string,
	/** Вектор подписей */
	signatures: Array<ResolverInputTypes["SignatureInfoInput"]>,
	/** Версия стандарта документа */
	version: string
};
	["SelectBranchSignedMetaDocumentInput"]: {
	/** Номер блока, на котором был создан документ */
	block_num: number,
	/** Идентификатор имени аккаунта кооперативного участка */
	braname: string,
	/** Название кооператива, связанное с документом */
	coopname: string,
	/** Дата и время создания документа */
	created_at: string,
	/** Имя генератора, использованного для создания документа */
	generator: string,
	/** Язык документа */
	lang: string,
	/** Ссылки, связанные с документом */
	links: Array<string>,
	/** ID документа в реестре */
	registry_id: number,
	/** Часовой пояс, в котором был создан документ */
	timezone: string,
	/** Название документа */
	title: string,
	/** Имя пользователя, создавшего документ */
	username: string,
	/** Версия генератора, использованного для создания документа */
	version: string
};
	["SetVarsInput"]: {
	confidential_email: string,
	confidential_link: string,
	contact_email: string,
	coopenomics_agreement?: ResolverInputTypes["AgreementVarInput"] | undefined | null,
	coopname: string,
	full_abbr: string,
	full_abbr_dative: string,
	full_abbr_genitive: string,
	name: string,
	participant_application?: ResolverInputTypes["AgreementVarInput"] | undefined | null,
	passport_request?: string | undefined | null,
	privacy_agreement?: ResolverInputTypes["AgreementVarInput"] | undefined | null,
	short_abbr: string,
	signature_agreement?: ResolverInputTypes["AgreementVarInput"] | undefined | null,
	statute_link: string,
	user_agreement?: ResolverInputTypes["AgreementVarInput"] | undefined | null,
	wallet_agreement?: ResolverInputTypes["AgreementVarInput"] | undefined | null,
	website: string
};
	["SetWifInput"]: {
	/** Тип разрешения ключа */
	permission: string,
	/** Имя пользователя, чей ключ */
	username: string,
	/** Приватный ключ */
	wif: string
};
	["Settings"]: AliasType<{
	/** Маршрут по умолчанию для авторизованных пользователей */
	authorized_default_route?:boolean | `@${string}`,
	/** Рабочий стол по умолчанию для авторизованных пользователей */
	authorized_default_workspace?:boolean | `@${string}`,
	/** Название кооператива */
	coopname?:boolean | `@${string}`,
	/** Дата создания */
	created_at?:boolean | `@${string}`,
	/** Маршрут по умолчанию для неавторизованных пользователей */
	non_authorized_default_route?:boolean | `@${string}`,
	/** Рабочий стол по умолчанию для неавторизованных пользователей */
	non_authorized_default_workspace?:boolean | `@${string}`,
	/** Имя провайдера платежей по умолчанию */
	provider_name?:boolean | `@${string}`,
	/** Дата последнего обновления */
	updated_at?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["SignatureInfo"]: AliasType<{
	id?:boolean | `@${string}`,
	is_valid?:boolean | `@${string}`,
	meta?:boolean | `@${string}`,
	public_key?:boolean | `@${string}`,
	signature?:boolean | `@${string}`,
	signed_at?:boolean | `@${string}`,
	signed_hash?:boolean | `@${string}`,
	signer?:boolean | `@${string}`,
	/** Сертификат подписанта (сокращенная информация) */
	signer_certificate?:ResolverInputTypes["UserCertificateUnion"],
		__typename?: boolean | `@${string}`
}>;
	["SignatureInfoInput"]: {
	/** Идентификатор номера подписи */
	id: number,
	/** Мета-данные подписи */
	meta: string,
	/** Публичный ключ */
	public_key: string,
	/** Подпись хэша */
	signature: string,
	/** Время подписания */
	signed_at: string,
	/** Подписанный хэш */
	signed_hash: string,
	/** Аккаунт подписавшего */
	signer: string
};
	["SignedBlockchainDocument"]: AliasType<{
	/** Хэш содержимого документа */
	doc_hash?:boolean | `@${string}`,
	/** Общий хэш (doc_hash + meta_hash) */
	hash?:boolean | `@${string}`,
	/** Метаинформация документа (в формате JSON-строки) */
	meta?:boolean | `@${string}`,
	/** Хэш мета-данных */
	meta_hash?:boolean | `@${string}`,
	/** Вектор подписей */
	signatures?:ResolverInputTypes["SignatureInfo"],
	/** Версия стандарта документа */
	version?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["SignedDigitalDocument"]: AliasType<{
	doc_hash?:boolean | `@${string}`,
	hash?:boolean | `@${string}`,
	meta?:boolean | `@${string}`,
	meta_hash?:boolean | `@${string}`,
	signatures?:ResolverInputTypes["SignatureInfo"],
	version?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["SovietMemberInput"]: {
	individual_data: ResolverInputTypes["CreateSovietIndividualDataInput"],
	role: string
};
	["StartInstallInput"]: {
	/** Приватный ключ кооператива */
	wif: string
};
	["StartInstallResult"]: AliasType<{
	/** Имя кооператива */
	coopname?:boolean | `@${string}`,
	/** Код установки для дальнейших операций */
	install_code?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Комплексный объект цифрового документа заявления (или другого ведущего документа для цепочки принятия решений совета) с агрегатом документа */
["StatementDetailAggregate"]: AliasType<{
	action?:ResolverInputTypes["ExtendedBlockchainAction"],
	documentAggregate?:ResolverInputTypes["DocumentAggregate"],
		__typename?: boolean | `@${string}`
}>;
	/** Статус истории в системе CAPITAL */
["StoryStatus"]:StoryStatus;
	["SubscriptionStatsDto"]: AliasType<{
	/** Количество активных подписок */
	active?:boolean | `@${string}`,
	/** Количество неактивных подписок */
	inactive?:boolean | `@${string}`,
	/** Общее количество подписок */
	total?:boolean | `@${string}`,
	/** Количество уникальных пользователей */
	uniqueUsers?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Symbols"]: AliasType<{
	/** Точность символа управления */
	root_govern_precision?:boolean | `@${string}`,
	/** Символ управления блокчейном */
	root_govern_symbol?:boolean | `@${string}`,
	/** Точность корневого символа */
	root_precision?:boolean | `@${string}`,
	/** Корневой символ блокчейна */
	root_symbol?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["SystemFeatures"]: AliasType<{
	/** Доступен ли полнотекстовый поиск по документам */
	search?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["SystemInfo"]: AliasType<{
	/** Объект системного аккаунта кооператива в блокчейне */
	blockchain_account?:ResolverInputTypes["BlockchainAccount"],
	/** Набор данных с информацией о состоянии блокчейна */
	blockchain_info?:ResolverInputTypes["BlockchainInfoDTO"],
	/** Члены совета кооператива */
	board_members?:ResolverInputTypes["BoardMember"],
	/** Контакты кооператива */
	contacts?:ResolverInputTypes["ContactsDTO"],
	/** Объект аккаунта кооператива у оператора */
	cooperator_account?:ResolverInputTypes["CooperativeOperatorAccount"],
	/** Имя аккаунта кооператива */
	coopname?:boolean | `@${string}`,
	/** Доступные функции платформы */
	features?:ResolverInputTypes["SystemFeatures"],
	/** Доступен ли функционал провайдера для подписок и запуска ПО */
	is_providered?:boolean | `@${string}`,
	/** Требуется ли членство в союзе кооперативов для подключения к кооперативной экономике */
	is_unioned?:boolean | `@${string}`,
	/** Настройки системы */
	settings?:ResolverInputTypes["Settings"],
	/** Символы и их точности блокчейна */
	symbols?:ResolverInputTypes["Symbols"],
	/** Статус контроллера кооператива */
	system_status?:boolean | `@${string}`,
	/** Ссылка на анкету для получения членства в союзе кооперативов */
	union_link?:boolean | `@${string}`,
	/** Переменные кооператива */
	vars?:ResolverInputTypes["Vars"],
		__typename?: boolean | `@${string}`
}>;
	/** Состояние контроллера кооператива */
["SystemStatus"]:SystemStatus;
	["Token"]: AliasType<{
	/** Дата истечения токена доступа */
	expires?:boolean | `@${string}`,
	/** Токен доступа */
	token?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Tokens"]: AliasType<{
	/** Токен доступа */
	access?:ResolverInputTypes["Token"],
	/** Токен обновления */
	refresh?:ResolverInputTypes["Token"],
		__typename?: boolean | `@${string}`
}>;
	["TranscriptionSegment"]: AliasType<{
	createdAt?:boolean | `@${string}`,
	endOffset?:boolean | `@${string}`,
	id?:boolean | `@${string}`,
	/** Канонический Matrix user id (@localpart:server) */
	speakerIdentity?:boolean | `@${string}`,
	/** Отображаемое имя из Synapse (displayname) */
	speakerName?:boolean | `@${string}`,
	startOffset?:boolean | `@${string}`,
	text?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Статус транскрипции звонка */
["TranscriptionStatus"]:TranscriptionStatus;
	["UninstallExtensionInput"]: {
	/** Фильтр по имени */
	name: string
};
	["Update"]: {
	/** Собственные данные кооператива, обслуживающего экземпляр платформы */
	organization_data?: ResolverInputTypes["UpdateOrganizationDataInput"] | undefined | null,
	/** Переменные кооператива, используемые для заполнения шаблонов документов */
	vars?: ResolverInputTypes["VarsInput"] | undefined | null
};
	["UpdateAccountInput"]: {
	/** Данные индивидуального предпринимателя */
	entrepreneur_data?: ResolverInputTypes["UpdateEntrepreneurDataInput"] | undefined | null,
	/** Данные физического лица */
	individual_data?: ResolverInputTypes["UpdateIndividualDataInput"] | undefined | null,
	/** Данные организации */
	organization_data?: ResolverInputTypes["UpdateOrganizationDataInput"] | undefined | null,
	/** Публичный ключ */
	public_key?: string | undefined | null,
	/** Имя аккаунта реферера */
	referer?: string | undefined | null,
	/** Имя пользователя */
	username: string
};
	["UpdateBankAccountInput"]: {
	/** Данные банковского счёта */
	data: ResolverInputTypes["BankAccountInput"],
	/** Флаг основного метода платежа, который отображается в документах */
	is_default: boolean,
	/** Идентификатор платежного метода */
	method_id: string,
	/** Имя аккаунта пользователя */
	username: string
};
	["UpdateEntrepreneurDataInput"]: {
	/** Дата рождения */
	birthdate: string,
	/** Город */
	city: string,
	/** Страна */
	country: ResolverInputTypes["Country"],
	/** Детали индивидуального предпринимателя */
	details: ResolverInputTypes["EntrepreneurDetailsInput"],
	/** Электронная почта */
	email: string,
	/** Имя */
	first_name: string,
	/** Полный адрес */
	full_address: string,
	/** Фамилия */
	last_name: string,
	/** Отчество */
	middle_name: string,
	/** Телефон */
	phone: string,
	/** Имя пользователя */
	username: string
};
	["UpdateIndividualDataInput"]: {
	/** Дата рождения */
	birthdate: string,
	/** Электронная почта */
	email: string,
	/** Имя */
	first_name: string,
	/** Полный адрес */
	full_address: string,
	/** Фамилия */
	last_name: string,
	/** Отчество */
	middle_name: string,
	/** Данные паспорта */
	passport?: ResolverInputTypes["PassportInput"] | undefined | null,
	/** Телефон */
	phone: string,
	/** Имя пользователя */
	username: string
};
	["UpdateOrganizationDataInput"]: {
	/** Город */
	city: string,
	/** Страна */
	country: string,
	/** Детали организации */
	details: ResolverInputTypes["OrganizationDetailsInput"],
	/** Электронная почта */
	email: string,
	/** Фактический адрес */
	fact_address: string,
	/** Полный адрес */
	full_address: string,
	/** Полное наименование организации */
	full_name: string,
	/** Телефон */
	phone: string,
	/** Представитель организации */
	represented_by: ResolverInputTypes["RepresentedByInput"],
	/** Краткое наименование организации */
	short_name: string,
	/** Тип организации */
	type: string,
	/** Имя пользователя */
	username: string
};
	["UpdateSettingsInput"]: {
	/** Маршрут по умолчанию для авторизованных пользователей */
	authorized_default_route?: string | undefined | null,
	/** Рабочий стол по умолчанию для авторизованных пользователей */
	authorized_default_workspace?: string | undefined | null,
	/** Маршрут по умолчанию для неавторизованных пользователей */
	non_authorized_default_route?: string | undefined | null,
	/** Рабочий стол по умолчанию для неавторизованных пользователей */
	non_authorized_default_workspace?: string | undefined | null,
	/** Имя провайдера платежей по умолчанию */
	provider_name?: string | undefined | null
};
	["UserAccount"]: AliasType<{
	/** Метаинформация */
	meta?:boolean | `@${string}`,
	/** Реферал */
	referer?:boolean | `@${string}`,
	/** Дата регистрации */
	registered_at?:boolean | `@${string}`,
	/** Регистратор */
	registrator?:boolean | `@${string}`,
	/** Статус аккаунта */
	status?:boolean | `@${string}`,
	/** Список хранилищ */
	storages?:boolean | `@${string}`,
	/** Тип учетной записи */
	type?:boolean | `@${string}`,
	/** Имя аккаунта */
	username?:boolean | `@${string}`,
	/** Дата регистрации */
	verifications?:ResolverInputTypes["Verification"],
		__typename?: boolean | `@${string}`
}>;
	/** Объединение сертификатов пользователей (сокращенная информация) */
["UserCertificateUnion"]: AliasType<{
	EntrepreneurCertificate?:ResolverInputTypes["EntrepreneurCertificate"],
	IndividualCertificate?:ResolverInputTypes["IndividualCertificate"],
	OrganizationCertificate?:ResolverInputTypes["OrganizationCertificate"],
		__typename?: boolean | `@${string}`
}>;
	/** Статус пользователя */
["UserStatus"]:UserStatus;
	["Vars"]: AliasType<{
	confidential_email?:boolean | `@${string}`,
	confidential_link?:boolean | `@${string}`,
	contact_email?:boolean | `@${string}`,
	coopenomics_agreement?:ResolverInputTypes["AgreementVar"],
	coopname?:boolean | `@${string}`,
	full_abbr?:boolean | `@${string}`,
	full_abbr_dative?:boolean | `@${string}`,
	full_abbr_genitive?:boolean | `@${string}`,
	name?:boolean | `@${string}`,
	participant_application?:ResolverInputTypes["AgreementVar"],
	passport_request?:boolean | `@${string}`,
	privacy_agreement?:ResolverInputTypes["AgreementVar"],
	short_abbr?:boolean | `@${string}`,
	signature_agreement?:ResolverInputTypes["AgreementVar"],
	statute_link?:boolean | `@${string}`,
	user_agreement?:ResolverInputTypes["AgreementVar"],
	wallet_agreement?:ResolverInputTypes["AgreementVar"],
	website?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["VarsInput"]: {
	confidential_email: string,
	confidential_link: string,
	contact_email: string,
	coopenomics_agreement?: ResolverInputTypes["AgreementInput"] | undefined | null,
	coopname: string,
	full_abbr: string,
	full_abbr_dative: string,
	full_abbr_genitive: string,
	name: string,
	participant_application: ResolverInputTypes["AgreementInput"],
	passport_request: string,
	privacy_agreement: ResolverInputTypes["AgreementInput"],
	short_abbr: string,
	signature_agreement: ResolverInputTypes["AgreementInput"],
	statute_link: string,
	user_agreement: ResolverInputTypes["AgreementInput"],
	wallet_agreement: ResolverInputTypes["AgreementInput"],
	website: string
};
	["Verification"]: AliasType<{
	/** Дата создания верификации */
	created_at?:boolean | `@${string}`,
	/** Флаг верификации */
	is_verified?:boolean | `@${string}`,
	/** Дата последнего обновления верификации */
	last_update?:boolean | `@${string}`,
	/** Заметка верификации */
	notice?:boolean | `@${string}`,
	/** Процедура верификации */
	procedure?:boolean | `@${string}`,
	/** Имя верификатора */
	verificator?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["WaitWeight"]: AliasType<{
	/** Время ожидания в секундах */
	wait_sec?:boolean | `@${string}`,
	/** Вес */
	weight?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["WebPushSubscriptionDataInput"]: {
	/** Endpoint для отправки уведомлений */
	endpoint: string,
	/** Ключи для шифрования */
	keys: ResolverInputTypes["WebPushSubscriptionKeysInput"]
};
	["WebPushSubscriptionDto"]: AliasType<{
	/** Auth ключ для аутентификации */
	authKey?:boolean | `@${string}`,
	/** Дата создания подписки */
	createdAt?:boolean | `@${string}`,
	/** Endpoint для отправки уведомлений */
	endpoint?:boolean | `@${string}`,
	/** Уникальный идентификатор подписки */
	id?:boolean | `@${string}`,
	/** Активна ли подписка */
	isActive?:boolean | `@${string}`,
	/** P256DH ключ для шифрования */
	p256dhKey?:boolean | `@${string}`,
	/** Дата последнего обновления */
	updatedAt?:boolean | `@${string}`,
	/** User Agent браузера */
	userAgent?:boolean | `@${string}`,
	/** Username пользователя */
	username?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["WebPushSubscriptionKeysInput"]: {
	/** Auth ключ для аутентификации */
	auth: string,
	/** P256DH ключ для шифрования */
	p256dh: string
};
	["schema"]: AliasType<{
	query?:ResolverInputTypes["Query"],
	mutation?:ResolverInputTypes["Mutation"],
		__typename?: boolean | `@${string}`
}>;
	["ID"]:unknown
  }

export type ModelTypes = {
    ["Account"]: {
		/** объект аккаунта в блокчейне содержит системную информацию, такую как публичные ключи доступа, доступные вычислительные ресурсы, информация об установленном смарт-контракте, и т.д. и т.п. Это системный уровень обслуживания, где у каждого пайщика есть аккаунт, но не каждый аккаунт может быть пайщиком в каком-либо кооперативе. Все смарт-контракты устанавливаются и исполняются на этом уровне. */
	blockchain_account?: ModelTypes["BlockchainAccount"] | undefined | null,
	/** объект пайщика кооператива в таблице блокчейне, который определяет членство пайщика в конкретном кооперативе. Поскольку MONO обслуживает только один кооператив, то в participant_account обычно содержится информация, которая описывает членство пайщика в этом кооперативе. Этот объект обезличен, публичен, и хранится в блокчейне. */
	participant_account?: ModelTypes["ParticipantAccount"] | undefined | null,
	/** объект приватных данных пайщика кооператива. */
	private_account?: ModelTypes["PrivateAccount"] | undefined | null,
	/** объект аккаунта в системе учёта провайдера, т.е. MONO. Здесь хранится приватная информация о пайщике кооператива, которая содержит его приватные данные. Эти данные не публикуются в блокчейне и не выходят за пределы базы данных провайдера. Они используются для заполнения шаблонов документов при нажатии соответствующих кнопок на платформе.  */
	provider_account?: ModelTypes["MonoAccount"] | undefined | null,
	/** объект пользователя кооперативной экономики содержит в блокчейне информацию о типе аккаунта пайщика, а также, обезличенные публичные данные (хэши) для верификации пайщиков между кооперативами. Этот уровень предназначен для хранения информации пайщика, которая необходима всем кооперативам, но не относится к какому-либо из них конкретно. */
	user_account?: ModelTypes["UserAccount"] | undefined | null,
	/** Имя аккаунта кооператива */
	username: string
};
	["AccountRamDelta"]: {
		account: string,
	delta: number
};
	["AccountResourceInfo"]: {
		/** Доступные ресурсы */
	available: string,
	/** Текущее использование ресурсов */
	current_used?: string | undefined | null,
	/** Время последнего обновления использования ресурсов */
	last_usage_update_time?: string | undefined | null,
	/** Максимальное количество ресурсов */
	max: string,
	/** Использовано ресурсов */
	used: string
};
	["AccountType"]:AccountType;
	["AccountsPaginationResult"]: {
		/** Текущая страница */
	currentPage: number,
	/** Элементы текущей страницы */
	items: Array<ModelTypes["Account"]>,
	/** Общее количество элементов */
	totalCount: number,
	/** Общее количество страниц */
	totalPages: number
};
	/** Комплексный объект акта, содержащий полную информацию о сгенерированном и опубликованном документе с его агрегатом */
["ActDetailAggregate"]: {
		action?: ModelTypes["ExtendedBlockchainAction"] | undefined | null,
	documentAggregate?: ModelTypes["DocumentAggregate"] | undefined | null
};
	["ActionAuthorization"]: {
		actor: string,
	permission: string
};
	["ActionReceipt"]: {
		abi_sequence: number,
	act_digest: string,
	auth_sequence: Array<ModelTypes["AuthSequence"]>,
	code_sequence: number,
	global_sequence: string,
	receiver: string,
	recv_sequence: string
};
	["AddPaymentMethodInput"]: {
	/** Данные для банковского перевода */
	bank_transfer_data?: ModelTypes["BankAccountInput"] | undefined | null,
	/** Флаг основного метода платежа, который отображается в документах */
	is_default: boolean,
	/** Данные для оплаты через СБП */
	sbp_data?: ModelTypes["SbpDataInput"] | undefined | null,
	/** Имя аккаунта пользователя */
	username: string
};
	["AddTrustedAccountInput"]: {
	/** Имя аккаунта кооперативного участка */
	braname: string,
	/** Имя аккаунта кооператива */
	coopname: string,
	/** Имя аккаунта доверонного лица, который уполномачивается председателем кооперативного участка на совершение действий */
	trusted: string
};
	/** Пункт повестки собрания */
["AgendaMeetPoint"]: {
		/** Контекст или дополнительная информация по пункту повестки */
	context: string,
	/** Предлагаемое решение по пункту повестки */
	decision: string,
	/** Заголовок пункта повестки */
	title: string
};
	/** Соглашение пользователя с кооперативом */
["Agreement"]: {
		/** Дата создания записи */
	_created_at: ModelTypes["DateTime"],
	/** Внутренний ID базы данных */
	_id: string,
	/** Дата последнего обновления записи */
	_updated_at: ModelTypes["DateTime"],
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?: number | undefined | null,
	/** Название кооператива */
	coopname?: string | undefined | null,
	/** Документ соглашения */
	document?: ModelTypes["DocumentAggregate"] | undefined | null,
	/** ID черновика */
	draft_id?: number | undefined | null,
	/** ID соглашения в блокчейне */
	id?: number | undefined | null,
	/** Флаг присутствия записи в блокчейне */
	present: boolean,
	/** ID программы */
	program_id?: number | undefined | null,
	/** Статус соглашения */
	status: ModelTypes["AgreementStatus"],
	/** Тип соглашения */
	type?: string | undefined | null,
	/** Дата последнего обновления в блокчейне */
	updated_at?: ModelTypes["DateTime"] | undefined | null,
	/** Имя пользователя, создавшего соглашение */
	username?: string | undefined | null,
	/** Версия соглашения */
	version?: number | undefined | null
};
	["AgreementInput"]: {
	protocol_day_month_year: string,
	protocol_number: string
};
	["AgreementStatus"]:AgreementStatus;
	["AgreementVar"]: {
		protocol_day_month_year: string,
	protocol_number: string
};
	["AgreementVarInput"]: {
	protocol_day_month_year: string,
	protocol_number: string
};
	/** Одобрение документа председателем совета */
["Approval"]: {
		/** Дата создания записи */
	_created_at: ModelTypes["DateTime"],
	/** Внутренний ID базы данных */
	_id: string,
	/** Дата последнего обновления записи */
	_updated_at: ModelTypes["DateTime"],
	/** Хеш одобрения для идентификации */
	approval_hash: string,
	/** Одобренный документ (заполняется при подтверждении одобрения) */
	approved_document?: ModelTypes["DocumentAggregate"] | undefined | null,
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?: number | undefined | null,
	/** Действие обратного вызова при одобрении */
	callback_action_approve: string,
	/** Действие обратного вызова при отклонении */
	callback_action_decline: string,
	/** Контракт обратного вызова для обработки результата */
	callback_contract: string,
	/** Название кооператива */
	coopname: string,
	/** Дата создания одобрения */
	created_at: ModelTypes["DateTime"],
	/** Документ, требующий одобрения */
	document?: ModelTypes["DocumentAggregate"] | undefined | null,
	/** ID одобрения в блокчейне */
	id?: number | undefined | null,
	/** Метаданные одобрения в формате JSON */
	meta: string,
	/** Флаг присутствия записи в блокчейне */
	present: boolean,
	/** Статус одобрения */
	status: ModelTypes["ApprovalStatus"],
	/** Имя пользователя, запросившего одобрение */
	username: string
};
	["ApprovalStatus"]:ApprovalStatus;
	["AuthSequence"]: {
		account: string,
	sequence: string
};
	["Authority"]: {
		/** Уровни разрешений */
	accounts: Array<ModelTypes["PermissionLevelWeight"]>,
	/** Ключи */
	keys: Array<ModelTypes["KeyWeight"]>,
	/** Порог */
	threshold: number,
	/** Вес ожидания */
	waits: Array<ModelTypes["WaitWeight"]>
};
	["BankAccount"]: {
		/** Номер банковского счета */
	account_number: string,
	/** Название банка */
	bank_name: string,
	/** Номер карты */
	card_number?: string | undefined | null,
	/** Валюта счета */
	currency: string,
	/** Детали счета */
	details: ModelTypes["BankAccountDetails"]
};
	["BankAccountDetails"]: {
		/** БИК банка */
	bik: string,
	/** Корреспондентский счет */
	corr: string,
	/** КПП банка */
	kpp: string
};
	["BankAccountDetailsInput"]: {
	/** БИК банка */
	bik: string,
	/** Корреспондентский счет */
	corr: string,
	/** КПП банка */
	kpp: string
};
	["BankAccountInput"]: {
	/** Номер банковского счета */
	account_number: string,
	/** Название банка */
	bank_name: string,
	/** Номер карты */
	card_number?: string | undefined | null,
	/** Валюта счета */
	currency: string,
	/** Детали счета */
	details: ModelTypes["BankAccountDetailsInput"]
};
	["BankPaymentMethod"]: {
		/** Дата создания */
	created_at: ModelTypes["DateTime"],
	/** Данные метода оплаты */
	data: ModelTypes["BankAccount"],
	/** Флаг основного метода платежа, который отображается в документах */
	is_default: boolean,
	/** Идентификатор метода оплаты */
	method_id: string,
	/** Тип метода оплаты */
	method_type: string,
	/** Дата обновления */
	updated_at: ModelTypes["DateTime"],
	/** Имя пользователя, к которому привязан метод оплаты */
	username: string
};
	/** Базовый проект в системе CAPITAL */
["BaseCapitalProject"]: {
		/** Дата создания записи */
	_created_at: ModelTypes["DateTime"],
	/** Внутренний ID базы данных */
	_id: string,
	/** Дата последнего обновления записи */
	_updated_at: ModelTypes["DateTime"],
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?: number | undefined | null,
	/** Статус из блокчейна */
	blockchain_status: string,
	/** Название кооператива */
	coopname: string,
	/** Счетчики участников проекта */
	counts: ModelTypes["CapitalProjectCountsData"],
	/** Дата создания */
	created_at: string,
	/** Данные CRPS для распределения наград проекта */
	crps: ModelTypes["CapitalProjectCrpsData"],
	/** Данные/шаблон проекта */
	data: string,
	/** Описание проекта */
	description: string,
	/** Фактические показатели проекта */
	fact: ModelTypes["CapitalProjectFactPool"],
	/** ID в блокчейне */
	id: number,
	/** Приглашение к проекту */
	invite: string,
	/** Открыт ли проект */
	is_opened: boolean,
	/** Запланирован ли проект */
	is_planed: boolean,
	/** Счетчик задач проекта */
	issue_counter: number,
	/** Мастер проекта */
	master: string,
	/** Мета-информация проекта */
	meta: string,
	/** Хеш родительского проекта */
	parent_hash: string,
	/** Название родительского проекта */
	parent_title?: string | undefined | null,
	/** Права доступа текущего пользователя к проекту */
	permissions: ModelTypes["CapitalProjectPermissions"],
	/** Плановые показатели проекта */
	plan: ModelTypes["CapitalProjectPlanPool"],
	/** Префикс проекта */
	prefix: string,
	/** Флаг присутствия записи в блокчейне */
	present: boolean,
	/** Хеш проекта */
	project_hash: string,
	/** Статус проекта */
	status: ModelTypes["ProjectStatus"],
	/** Название проекта */
	title: string,
	/** Данные голосования по методу Водянова */
	voting: ModelTypes["CapitalProjectVotingData"]
};
	["BlockchainAccount"]: {
		/** Имя аккаунта */
	account_name: string,
	/** Баланс */
	core_liquid_balance?: string | undefined | null,
	/** Ограничения CPU */
	cpu_limit: ModelTypes["AccountResourceInfo"],
	/** Вес CPU */
	cpu_weight: string,
	/** Дата создания */
	created: string,
	/** Номер последнего блока */
	head_block_num: number,
	/** Время последнего блока */
	head_block_time: string,
	/** Время последнего обновления кода */
	last_code_update: string,
	/** Ограничения сети */
	net_limit: ModelTypes["AccountResourceInfo"],
	/** Вес сети */
	net_weight: string,
	/** Разрешения */
	permissions: Array<ModelTypes["Permission"]>,
	/** Флаг привилегий */
	privileged: boolean,
	/** Квота RAM */
	ram_quota: number,
	/** Использование RAM */
	ram_usage: number,
	/** Запрос на возврат */
	refund_request?: ModelTypes["RefundRequest"] | undefined | null,
	/** Информация о REX */
	rex_info?: string | undefined | null,
	/** Делегированные ресурсы */
	self_delegated_bandwidth?: ModelTypes["ResourceDelegationDTO"] | undefined | null,
	/** Общий обзор ресурсов */
	total_resources?: ModelTypes["ResourceOverview"] | undefined | null,
	/** Информация о голосовании */
	voter_info?: string | undefined | null
};
	/** Объект действия в блокчейне */
["BlockchainAction"]: {
		account: string,
	account_ram_deltas: Array<ModelTypes["AccountRamDelta"]>,
	action_ordinal: number,
	authorization: Array<ModelTypes["ActionAuthorization"]>,
	block_id: string,
	block_num: number,
	chain_id: string,
	console: string,
	context_free: boolean,
	creator_action_ordinal: number,
	/** Данные действия в формате JSON */
	data: ModelTypes["JSON"],
	elapsed: number,
	global_sequence: string,
	name: string,
	receipt: ModelTypes["ActionReceipt"],
	receiver: string,
	transaction_id: string
};
	/** Запись в таблице блокчейна о процессе принятия решения советом кооператива */
["BlockchainDecision"]: {
		approved: boolean,
	authorization: ModelTypes["SignedBlockchainDocument"],
	authorized: boolean,
	authorized_by: string,
	batch_id: number,
	callback_contract?: string | undefined | null,
	confirm_callback?: string | undefined | null,
	coopname: string,
	created_at: string,
	decline_callback?: string | undefined | null,
	expired_at: string,
	hash?: string | undefined | null,
	id: number,
	meta: string,
	statement: ModelTypes["SignedBlockchainDocument"],
	type: string,
	username: string,
	/** Сертификат пользователя, создавшего решение */
	username_certificate?: ModelTypes["UserCertificateUnion"] | undefined | null,
	validated: boolean,
	votes_against: Array<string>,
	/** Сертификаты пользователей, голосовавших "против" */
	votes_against_certificates: Array<ModelTypes["UserCertificateUnion"]>,
	votes_for: Array<string>,
	/** Сертификаты пользователей, голосовавших "за" */
	votes_for_certificates: Array<ModelTypes["UserCertificateUnion"]>
};
	/** Информация о состоянии блокчейна */
["BlockchainInfoDTO"]: {
		/** Лимит CPU для блока */
	block_cpu_limit: number,
	/** Лимит сети для блока */
	block_net_limit: number,
	/** Идентификатор цепочки (chain ID) */
	chain_id: string,
	/** Идентификатор головного блока в форк базе данных */
	fork_db_head_block_id?: string | undefined | null,
	/** Номер головного блока в форк базе данных */
	fork_db_head_block_num?: number | undefined | null,
	/** Идентификатор головного блока */
	head_block_id: string,
	/** Номер головного блока */
	head_block_num: number,
	/** Прозводитель головного блока */
	head_block_producer: string,
	/** Время головного блока */
	head_block_time: string,
	/** Идентификатор последнего необратимого блока */
	last_irreversible_block_id: string,
	/** Номер последнего необратимого блока */
	last_irreversible_block_num: number,
	/** Время последнего необратимого блока */
	last_irreversible_block_time?: string | undefined | null,
	/** Версия сервера */
	server_version: string,
	/** Строковое представление версии сервера */
	server_version_string?: string | undefined | null,
	/** Виртуальный лимит CPU для блока */
	virtual_block_cpu_limit: number,
	/** Виртуальный лимит сети для блока */
	virtual_block_net_limit: number
};
	["BoardMember"]: {
		/** Имя */
	first_name: string,
	/** Флаг председателя совета */
	is_chairman: boolean,
	/** Фамилия */
	last_name: string,
	/** Отчество */
	middle_name?: string | undefined | null,
	/** Имя пользователя (username) */
	username: string
};
	["Branch"]: {
		/** Банковский счёт */
	bank_account: ModelTypes["BankPaymentMethod"],
	/** Уникальное имя кооперативного участка */
	braname: string,
	/** Город */
	city: string,
	/** Имя аккаунта кооператива */
	coopname: string,
	/** Страна */
	country: string,
	/** Детали организации */
	details: ModelTypes["OrganizationDetails"],
	/** Email */
	email: string,
	/** Фактический адрес */
	fact_address: string,
	/** Полный адрес */
	full_address: string,
	/** Полное название организации */
	full_name: string,
	/** Телефон */
	phone: string,
	/** Представитель организации */
	represented_by: ModelTypes["RepresentedBy"],
	/** Краткое название организации */
	short_name: string,
	/** Доверенные аккаунты

Требуемые роли: chairman, member.  */
	trusted: Array<ModelTypes["Individual"]>,
	/** Председатель кооперативного участка

Требуемые роли: chairman, member.  */
	trustee: ModelTypes["Individual"],
	/** Тип организации */
	type: string
};
	["CallTranscription"]: {
		createdAt: ModelTypes["DateTime"],
	endedAt?: ModelTypes["DateTime"] | undefined | null,
	id: string,
	matrixRoomId: string,
	/** Пользовательская заметка о содержании звонка */
	memo: string,
	/** Отображаемые имена участников (Synapse displayname); в БД хранятся канонические Matrix user id */
	participants: Array<string>,
	roomId: string,
	roomName: string,
	startedAt: ModelTypes["DateTime"],
	status: ModelTypes["TranscriptionStatus"],
	updatedAt: ModelTypes["DateTime"]
};
	["Candidate"]: {
		braname?: string | undefined | null,
	coopname: string,
	created_at: ModelTypes["DateTime"],
	program_key?: string | undefined | null,
	public_key: string,
	referer?: string | undefined | null,
	referer_display_name?: string | undefined | null,
	registered_at?: ModelTypes["DateTime"] | undefined | null,
	status: ModelTypes["CandidateStatus"],
	type: string,
	username: string,
	username_display_name?: string | undefined | null
};
	["CandidateStatus"]:CandidateStatus;
	["CapitalCandidate"]: {
		about?: string | undefined | null,
	braname?: string | undefined | null,
	capital_status?: ModelTypes["ContributorStatus"] | undefined | null,
	contributed_as_author?: string | undefined | null,
	contributed_as_contributor?: string | undefined | null,
	contributed_as_coordinator?: string | undefined | null,
	contributed_as_creator?: string | undefined | null,
	contributed_as_investor?: string | undefined | null,
	contributed_as_propertor?: string | undefined | null,
	contributor_hash?: string | undefined | null,
	coopname: string,
	created_at: ModelTypes["DateTime"],
	hours_per_day?: number | undefined | null,
	level?: number | undefined | null,
	memo?: string | undefined | null,
	program_key?: string | undefined | null,
	public_key: string,
	rate_per_hour?: string | undefined | null,
	referer?: string | undefined | null,
	referer_display_name?: string | undefined | null,
	registered_at?: ModelTypes["DateTime"] | undefined | null,
	status: ModelTypes["CandidateStatus"],
	type: string,
	username: string,
	username_display_name?: string | undefined | null
};
	/** Коммит в системе CAPITAL */
["CapitalCommit"]: {
		/** Дата создания записи */
	_created_at: ModelTypes["DateTime"],
	/** Внутренний ID базы данных */
	_id: string,
	/** Дата последнего обновления записи */
	_updated_at: ModelTypes["DateTime"],
	/** Данные amounts коммита */
	amounts?: ModelTypes["CapitalCommitAmounts"] | undefined | null,
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?: number | undefined | null,
	/** Статус из блокчейна */
	blockchain_status?: string | undefined | null,
	/** Хеш коммита */
	commit_hash: string,
	/** Название кооператива */
	coopname?: string | undefined | null,
	/** Дата создания */
	created_at?: string | undefined | null,
	/** Обогащенные данные коммита (diff-патч, исходная ссылка и т.д.) */
	data?: ModelTypes["JSON"] | undefined | null,
	/** Описание коммита */
	description: string,
	/** Отображаемое имя пользователя */
	display_name?: string | undefined | null,
	/** ID в блокчейне */
	id?: number | undefined | null,
	/** Метаданные коммита */
	meta: string,
	/** Флаг присутствия записи в блокчейне */
	present: boolean,
	/** Проект, к которому относится коммит */
	project?: ModelTypes["BaseCapitalProject"] | undefined | null,
	/** Хеш проекта */
	project_hash?: string | undefined | null,
	/** Статус коммита */
	status: ModelTypes["CommitStatus"],
	/** Имя пользователя */
	username?: string | undefined | null
};
	/** Данные amounts коммита */
["CapitalCommitAmounts"]: {
		/** Базовый пул авторов */
	authors_base_pool?: string | undefined | null,
	/** Бонусный пул авторов */
	authors_bonus_pool?: string | undefined | null,
	/** Бонусный пул участников */
	contributors_bonus_pool?: string | undefined | null,
	/** Базовый пул создателей */
	creators_base_pool?: string | undefined | null,
	/** Бонусный пул создателей */
	creators_bonus_pool?: string | undefined | null,
	/** Часы создателей */
	creators_hours?: string | undefined | null,
	/** Стоимость часа работы */
	hour_cost?: string | undefined | null,
	/** Общий объем вклада */
	total_contribution?: string | undefined | null,
	/** Общий генерационный пул */
	total_generation_pool?: string | undefined | null
};
	/** Конфигурация CAPITAL контракта кооператива */
["CapitalConfigObject"]: {
		/** Процент голосования авторов */
	authors_voting_percent: number,
	/** Процент бонуса координатора */
	coordinator_bonus_percent: number,
	/** Срок действия приглашения координатора в днях */
	coordinator_invite_validity_days: number,
	/** Процент голосования создателей */
	creators_voting_percent: number,
	/** Скорость убывания энергии в день */
	energy_decay_rate_per_day: number,
	/** Коэффициент получения энергии */
	energy_gain_coefficient: number,
	/** Процент расходов */
	expense_pool_percent: number,
	/** Базовая глубина уровня */
	level_depth_base: number,
	/** Коэффициент роста уровня */
	level_growth_coefficient: number,
	/** Период голосования в днях */
	voting_period_in_days: number
};
	/** Участник кооператива в системе CAPITAL */
["CapitalContributor"]: {
		/** Дата создания записи */
	_created_at: ModelTypes["DateTime"],
	/** Внутренний ID базы данных */
	_id: string,
	/** Дата последнего обновления записи */
	_updated_at: ModelTypes["DateTime"],
	/** О себе */
	about?: string | undefined | null,
	/** Приложения к контракту */
	appendixes?: Array<string> | undefined | null,
	/** Хеш соглашения Благорост */
	blagorost_agreement_hash?: string | undefined | null,
	/** Хеш оферты Благорост */
	blagorost_offer_hash?: string | undefined | null,
	/** Программный кошелек в программе Blagorost */
	blagorost_wallet?: ModelTypes["ProgramWallet"] | undefined | null,
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?: number | undefined | null,
	/** Статус из блокчейна */
	blockchain_status?: string | undefined | null,
	/** Контракт участника */
	contract?: ModelTypes["DocumentAggregate"] | undefined | null,
	/** Вклад как автор */
	contributed_as_author?: string | undefined | null,
	/** Вклад как участник */
	contributed_as_contributor?: string | undefined | null,
	/** Вклад как координатор */
	contributed_as_coordinator?: string | undefined | null,
	/** Вклад как исполнитель */
	contributed_as_creator?: string | undefined | null,
	/** Вклад как инвестор */
	contributed_as_investor?: string | undefined | null,
	/** Вклад как собственник имущества */
	contributed_as_propertor?: string | undefined | null,
	/** Хеш участника */
	contributor_hash: string,
	/** Название кооператива */
	coopname: string,
	/** Дата создания */
	created_at?: string | undefined | null,
	/** Сумма долга */
	debt_amount?: string | undefined | null,
	/** Отображаемое имя */
	display_name?: string | undefined | null,
	/** Параметры документов участника из UData (номера и даты) */
	document_parameters?: ModelTypes["ContributorDocumentParameters"] | undefined | null,
	/** Энергия участника */
	energy?: number | undefined | null,
	/** Хеш договора УХД */
	generation_contract_hash?: string | undefined | null,
	/** Программный кошелек в программе Generation */
	generation_wallet?: ModelTypes["ProgramWallet"] | undefined | null,
	/** Хеш оферты Генератор */
	generator_offer_hash?: string | undefined | null,
	/** Часов в день */
	hours_per_day?: number | undefined | null,
	/** ID в блокчейне */
	id?: number | undefined | null,
	/** Соглашение Благорост предоставлено при импорте (внешний документ) */
	is_external_blagorost_agreement?: boolean | undefined | null,
	/** Является ли внешним контрактом */
	is_external_contract?: boolean | undefined | null,
	/** Последнее обновление энергии */
	last_energy_update?: string | undefined | null,
	/** Уровень участника */
	level?: number | undefined | null,
	/** Программный кошелек в программе Main */
	main_wallet?: ModelTypes["ProgramWallet"] | undefined | null,
	/** Мемо/комментарий */
	memo?: string | undefined | null,
	/** Флаг присутствия записи в блокчейне */
	present: boolean,
	/** Ключ выбранной программы регистрации (generation, capitalization) */
	program_key?: string | undefined | null,
	/** Ставка за час работы */
	rate_per_hour?: string | undefined | null,
	/** Статус участника */
	status: ModelTypes["ContributorStatus"],
	/** Хеш соглашения о хранении имущества */
	storage_agreement_hash?: string | undefined | null,
	/** Имя пользователя */
	username: string
};
	/** Цикл разработки в системе CAPITAL */
["CapitalCycle"]: {
		/** Дата создания записи */
	_created_at: ModelTypes["DateTime"],
	/** Внутренний ID базы данных */
	_id: string,
	/** Дата последнего обновления записи */
	_updated_at: ModelTypes["DateTime"],
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?: number | undefined | null,
	/** Дата окончания */
	end_date: ModelTypes["DateTime"],
	/** Название цикла */
	name: string,
	/** Флаг присутствия записи в блокчейне */
	present: boolean,
	/** Дата начала */
	start_date: ModelTypes["DateTime"],
	/** Статус цикла */
	status: ModelTypes["CycleStatus"]
};
	/** Долг в системе CAPITAL */
["CapitalDebt"]: {
		/** Дата создания записи */
	_created_at: ModelTypes["DateTime"],
	/** Внутренний ID базы данных */
	_id: string,
	/** Дата последнего обновления записи */
	_updated_at: ModelTypes["DateTime"],
	/** Сумма долга */
	amount?: number | undefined | null,
	/** Одобренное заявление */
	approved_statement?: ModelTypes["DocumentAggregate"] | undefined | null,
	/** Протокол решения совета */
	authorization?: ModelTypes["DocumentAggregate"] | undefined | null,
	/** Номер блока последнего обновления */
	block_num?: number | undefined | null,
	/** Статус из блокчейна */
	blockchain_status?: string | undefined | null,
	/** Название кооператива */
	coopname?: string | undefined | null,
	/** Хеш долга */
	debt_hash: string,
	/** ID в блокчейне */
	id?: number | undefined | null,
	/** Мемо/комментарий */
	memo?: string | undefined | null,
	/** Существует ли запись в блокчейне */
	present: boolean,
	/** Хеш проекта */
	project_hash?: string | undefined | null,
	/** Дата погашения */
	repaid_at?: string | undefined | null,
	/** Заявление на получение ссуды */
	statement?: ModelTypes["DocumentAggregate"] | undefined | null,
	/** Статус долга */
	status: ModelTypes["DebtStatus"],
	/** Имя пользователя */
	username?: string | undefined | null
};
	/** Расход в системе CAPITAL */
["CapitalExpense"]: {
		/** Дата создания записи */
	_created_at: ModelTypes["DateTime"],
	/** Внутренний ID базы данных */
	_id: string,
	/** Дата последнего обновления записи */
	_updated_at: ModelTypes["DateTime"],
	/** Сумма расхода */
	amount?: string | undefined | null,
	/** Одобренная записка */
	approved_statement?: ModelTypes["DocumentAggregate"] | undefined | null,
	/** Авторизация расхода */
	authorization?: ModelTypes["DocumentAggregate"] | undefined | null,
	/** Номер блока последнего обновления */
	block_num?: number | undefined | null,
	/** Статус из блокчейна */
	blockchain_status?: string | undefined | null,
	/** Название кооператива */
	coopname?: string | undefined | null,
	/** Описание расхода */
	description?: string | undefined | null,
	/** Хеш расхода */
	expense_hash: string,
	/** Служебная записка о расходе */
	expense_statement?: ModelTypes["DocumentAggregate"] | undefined | null,
	/** ID фонда */
	fund_id?: number | undefined | null,
	/** ID в блокчейне */
	id?: number | undefined | null,
	/** Существует ли запись в блокчейне */
	present: boolean,
	/** Хеш проекта */
	project_hash?: string | undefined | null,
	/** Дата расхода */
	spended_at?: string | undefined | null,
	/** Статус расхода */
	status: ModelTypes["ExpenseStatus"],
	/** Имя пользователя */
	username?: string | undefined | null
};
	/** Инвестиция в системе CAPITAL */
["CapitalInvest"]: {
		/** Дата создания записи */
	_created_at: ModelTypes["DateTime"],
	/** Внутренний ID базы данных */
	_id: string,
	/** Дата последнего обновления записи */
	_updated_at: ModelTypes["DateTime"],
	/** Сумма инвестиции */
	amount?: number | undefined | null,
	/** Номер блока последнего обновления */
	block_num?: number | undefined | null,
	/** Статус из блокчейна */
	blockchain_status?: string | undefined | null,
	/** Название кооператива */
	coopname?: string | undefined | null,
	/** Координатор */
	coordinator?: string | undefined | null,
	/** Сумма координатора */
	coordinator_amount?: number | undefined | null,
	/** ID в блокчейне */
	id?: number | undefined | null,
	/** Хеш инвестиции */
	invest_hash: string,
	/** Дата инвестирования */
	invested_at?: string | undefined | null,
	/** Существует ли запись в блокчейне */
	present: boolean,
	/** Хеш проекта */
	project_hash?: string | undefined | null,
	/** Заявление */
	statement?: string | undefined | null,
	/** Статус инвестиции */
	status: ModelTypes["InvestStatus"],
	/** Имя пользователя */
	username?: string | undefined | null
};
	/** Задача в системе CAPITAL */
["CapitalIssue"]: {
		/** Дата создания записи */
	_created_at: ModelTypes["DateTime"],
	/** Внутренний ID базы данных */
	_id: string,
	/** Дата последнего обновления записи */
	_updated_at: ModelTypes["DateTime"],
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?: number | undefined | null,
	/** Имя пользователя, создавшего задачу */
	created_by: string,
	/** Массив имен пользователей создателей (contributors) */
	creators: Array<string>,
	/** ID цикла */
	cycle_id?: string | undefined | null,
	/** Описание задачи */
	description?: string | undefined | null,
	/** Оценка в часах (допускаются дроби, например 1.5) */
	estimate: number,
	/** Уникальный ID задачи в формате PREFIX-N (например, ABC-1) */
	id: string,
	/** Хеш задачи */
	issue_hash: string,
	/** Метаданные задачи */
	metadata: ModelTypes["JSON"],
	/** Права доступа текущего пользователя к задаче */
	permissions: ModelTypes["CapitalIssuePermissions"],
	/** Флаг присутствия записи в блокчейне */
	present: boolean,
	/** Приоритет задачи */
	priority: ModelTypes["IssuePriority"],
	/** Хеш проекта */
	project_hash: string,
	/** Порядок сортировки */
	sort_order: number,
	/** Статус задачи */
	status: ModelTypes["IssueStatus"],
	/** Имя пользователя ответственного (contributor) */
	submaster?: string | undefined | null,
	/** Название задачи */
	title: string
};
	/** Права доступа пользователя к задаче */
["CapitalIssuePermissions"]: {
		/** Список допустимых статусов для перехода */
	allowed_status_transitions: Array<ModelTypes["IssueStatus"]>,
	/** Может ли назначать исполнителей задачи */
	can_assign_creator: boolean,
	/** Может ли изменять статусы задачи */
	can_change_status: boolean,
	/** Может ли выполнять требования к задаче */
	can_complete_requirement: boolean,
	/** Может ли создавать требования к задаче */
	can_create_requirement: boolean,
	/** Может ли удалить задачу */
	can_delete_issue: boolean,
	/** Может ли удалять требования к задаче */
	can_delete_requirement: boolean,
	/** Может ли редактировать задачу (название, описание, приоритет и т.д.) */
	can_edit_issue: boolean,
	/** Может ли устанавливать статус DONE (выполнена) */
	can_set_done: boolean,
	/** Может ли устанавливать оценку (estimate) задачи */
	can_set_estimate: boolean,
	/** Может ли устанавливать статус ON_REVIEW (на проверке) */
	can_set_on_review: boolean,
	/** Может ли устанавливать приоритет задачи */
	can_set_priority: boolean,
	/** Имеет ли подтвержденное приложение для проекта */
	has_clearance: boolean,
	/** Является ли пользователь гостем (неавторизованным) */
	is_guest: boolean
};
	/** Запись лога событий в системе капитала */
["CapitalLog"]: {
		/** Внутренний идентификатор */
	_id: string,
	/** Название кооператива */
	coopname: string,
	/** Дата создания записи */
	created_at: ModelTypes["DateTime"],
	/** ID сущности */
	entity_id?: string | undefined | null,
	/** Тип сущности к которой относится событие */
	entity_type: ModelTypes["LogEntityType"],
	/** Тип события */
	event_type: ModelTypes["LogEventType"],
	/** Инициатор действия (username) */
	initiator: string,
	/** Текстовое описание события */
	message: string,
	/** Вспомогательные данные */
	metadata?: ModelTypes["JSON"] | undefined | null,
	/** Хеш проекта или компонента */
	project_hash?: string | undefined | null,
	/** Идентификатор-ссылка (invest_hash, commit_hash, result_hash и т.д.) */
	reference_id?: string | undefined | null
};
	/** Фильтр для поиска логов событий */
["CapitalLogFilterInput"]: {
	/** Название кооператива */
	coopname?: string | undefined | null,
	/** Период с */
	date_from?: ModelTypes["DateTime"] | undefined | null,
	/** Период по */
	date_to?: ModelTypes["DateTime"] | undefined | null,
	/** Типы событий для фильтрации */
	event_types?: Array<ModelTypes["LogEventType"]> | undefined | null,
	/** Инициатор действия (username) */
	initiator?: string | undefined | null,
	/** Хеш задачи */
	issue_hash?: string | undefined | null,
	/** Хеш проекта или компонента */
	project_hash?: string | undefined | null,
	/** Включать логи дочерних компонентов при фильтрации по project_hash */
	show_components_logs?: boolean | undefined | null,
	/** Показывать логи по задачам */
	show_issue_logs?: boolean | undefined | null
};
	/** Программная инвестиция в системе CAPITAL */
["CapitalProgramInvest"]: {
		/** Дата создания записи */
	_created_at: ModelTypes["DateTime"],
	/** Внутренний ID базы данных */
	_id: string,
	/** Дата последнего обновления записи */
	_updated_at: ModelTypes["DateTime"],
	/** Сумма инвестиции */
	amount?: number | undefined | null,
	/** Номер блока последнего обновления */
	block_num?: number | undefined | null,
	/** Статус из блокчейна */
	blockchain_status?: string | undefined | null,
	/** Название кооператива */
	coopname?: string | undefined | null,
	/** ID в блокчейне */
	id?: number | undefined | null,
	/** Хеш инвестиции */
	invest_hash: string,
	/** Дата инвестирования */
	invested_at?: string | undefined | null,
	/** Существует ли запись в блокчейне */
	present: boolean,
	/** Заявление об инвестиции */
	statement?: ModelTypes["DocumentAggregate"] | undefined | null,
	/** Статус программной инвестиции */
	status: ModelTypes["ProgramInvestStatus"],
	/** Имя пользователя */
	username?: string | undefined | null
};
	/** Проект в системе CAPITAL с компонентами */
["CapitalProject"]: {
		/** Дата создания записи */
	_created_at: ModelTypes["DateTime"],
	/** Внутренний ID базы данных */
	_id: string,
	/** Дата последнего обновления записи */
	_updated_at: ModelTypes["DateTime"],
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?: number | undefined | null,
	/** Статус из блокчейна */
	blockchain_status: string,
	/** Массив проектов-компонентов */
	components: Array<ModelTypes["CapitalProjectComponent"]>,
	/** Название кооператива */
	coopname: string,
	/** Счетчики участников проекта */
	counts: ModelTypes["CapitalProjectCountsData"],
	/** Дата создания */
	created_at: string,
	/** Данные CRPS для распределения наград проекта */
	crps: ModelTypes["CapitalProjectCrpsData"],
	/** Данные/шаблон проекта */
	data: string,
	/** Описание проекта */
	description: string,
	/** Фактические показатели проекта */
	fact: ModelTypes["CapitalProjectFactPool"],
	/** ID в блокчейне */
	id: number,
	/** Приглашение к проекту */
	invite: string,
	/** Открыт ли проект */
	is_opened: boolean,
	/** Запланирован ли проект */
	is_planed: boolean,
	/** Счетчик задач проекта */
	issue_counter: number,
	/** Мастер проекта */
	master: string,
	/** Мета-информация проекта */
	meta: string,
	/** Хеш родительского проекта */
	parent_hash: string,
	/** Название родительского проекта */
	parent_title?: string | undefined | null,
	/** Права доступа текущего пользователя к проекту */
	permissions: ModelTypes["CapitalProjectPermissions"],
	/** Плановые показатели проекта */
	plan: ModelTypes["CapitalProjectPlanPool"],
	/** Префикс проекта */
	prefix: string,
	/** Флаг присутствия записи в блокчейне */
	present: boolean,
	/** Хеш проекта */
	project_hash: string,
	/** Статус проекта */
	status: ModelTypes["ProjectStatus"],
	/** Название проекта */
	title: string,
	/** Данные голосования по методу Водянова */
	voting: ModelTypes["CapitalProjectVotingData"]
};
	/** Проект-компонент в системе CAPITAL */
["CapitalProjectComponent"]: {
		/** Дата создания записи */
	_created_at: ModelTypes["DateTime"],
	/** Внутренний ID базы данных */
	_id: string,
	/** Дата последнего обновления записи */
	_updated_at: ModelTypes["DateTime"],
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?: number | undefined | null,
	/** Статус из блокчейна */
	blockchain_status: string,
	/** Название кооператива */
	coopname: string,
	/** Счетчики участников проекта */
	counts: ModelTypes["CapitalProjectCountsData"],
	/** Дата создания */
	created_at: string,
	/** Данные CRPS для распределения наград проекта */
	crps: ModelTypes["CapitalProjectCrpsData"],
	/** Данные/шаблон проекта */
	data: string,
	/** Описание проекта */
	description: string,
	/** Фактические показатели проекта */
	fact: ModelTypes["CapitalProjectFactPool"],
	/** ID в блокчейне */
	id: number,
	/** Приглашение к проекту */
	invite: string,
	/** Открыт ли проект */
	is_opened: boolean,
	/** Запланирован ли проект */
	is_planed: boolean,
	/** Счетчик задач проекта */
	issue_counter: number,
	/** Мастер проекта */
	master: string,
	/** Мета-информация проекта */
	meta: string,
	/** Хеш родительского проекта */
	parent_hash: string,
	/** Название родительского проекта */
	parent_title?: string | undefined | null,
	/** Права доступа текущего пользователя к проекту */
	permissions: ModelTypes["CapitalProjectPermissions"],
	/** Плановые показатели проекта */
	plan: ModelTypes["CapitalProjectPlanPool"],
	/** Префикс проекта */
	prefix: string,
	/** Флаг присутствия записи в блокчейне */
	present: boolean,
	/** Хеш проекта */
	project_hash: string,
	/** Статус проекта */
	status: ModelTypes["ProjectStatus"],
	/** Название проекта */
	title: string,
	/** Данные голосования по методу Водянова */
	voting: ModelTypes["CapitalProjectVotingData"]
};
	/** Счетчики участников проекта */
["CapitalProjectCountsData"]: {
		/** Общее количество авторов */
	total_authors: number,
	/** Общее количество коммитов */
	total_commits: number,
	/** Общее количество участников */
	total_contributors: number,
	/** Общее количество координаторов */
	total_coordinators: number,
	/** Общее количество создателей */
	total_creators: number,
	/** Общее количество инвесторов */
	total_investors: number,
	/** Общее количество проперторов */
	total_propertors: number,
	/** Общее количество уникальных участников */
	total_unique_participants: number
};
	/** Данные CRPS для распределения наград проекта */
["CapitalProjectCrpsData"]: {
		/** Накопительный коэффициент вознаграждения за базовый вклад авторов */
	author_base_cumulative_reward_per_share: number,
	/** Накопительный коэффициент вознаграждения за бонусный вклад авторов */
	author_bonus_cumulative_reward_per_share: number,
	/** Накопительный коэффициент вознаграждения участников */
	contributor_cumulative_reward_per_share: number,
	/** Общее количество долей участников капитала */
	total_capital_contributors_shares: string
};
	/** Фактические показатели проекта */
["CapitalProjectFactPool"]: {
		/** Накопленный пул расходов */
	accumulated_expense_pool: string,
	/** Базовый пул авторов */
	authors_base_pool: string,
	/** Бонусный пул авторов */
	authors_bonus_pool: string,
	/** Бонусный пул участников */
	contributors_bonus_pool: string,
	/** Базовый пул координаторов */
	coordinators_base_pool: string,
	/** Инвестиционный пул координаторов */
	coordinators_investment_pool: string,
	/** Базовый пул создателей */
	creators_base_pool: string,
	/** Бонусный пул создателей */
	creators_bonus_pool: string,
	/** Часы создателей */
	creators_hours: number,
	/** Стоимость часа работы */
	hour_cost: string,
	/** Инвестиционный пул */
	invest_pool: string,
	/** Программный инвестиционный пул */
	program_invest_pool: string,
	/** Имущественный базовый пул */
	property_base_pool: string,
	/** Процент возврата базового пула */
	return_base_percent: number,
	/** Целевой пул расходов */
	target_expense_pool: string,
	/** Общая сумма */
	total: string,
	/** Общий объем взноса старших участников */
	total_contribution: string,
	/** Общий генерационный пул */
	total_generation_pool: string,
	/** Общий объем полученных инвестиций */
	total_received_investments: string,
	/** Общий объем возвращенных инвестиций */
	total_returned_investments: string,
	/** Общий объем использованных инвестиций */
	total_used_investments: string,
	/** Общий объем взноса старших участников */
	total_with_investments: string,
	/** Процент использования инвестиций */
	use_invest_percent: number,
	/** Использованный пул расходов */
	used_expense_pool: string
};
	/** Права доступа пользователя к проекту */
["CapitalProjectPermissions"]: {
		/** Может ли изменять статус проекта */
	can_change_project_status: boolean,
	/** Может ли выполнять требования к проекту */
	can_complete_requirement: boolean,
	/** Может ли создавать требования к проекту */
	can_create_requirement: boolean,
	/** Может ли удалить проект */
	can_delete_project: boolean,
	/** Может ли удалять требования к проекту */
	can_delete_requirement: boolean,
	/** Может ли редактировать проект (название, описание, мета и т.д.) */
	can_edit_project: boolean,
	/** Может ли управлять авторами проекта */
	can_manage_authors: boolean,
	/** Может ли управлять задачами в проекте */
	can_manage_issues: boolean,
	/** Может ли устанавливать мастера проекта */
	can_set_master: boolean,
	/** Может ли устанавливать план проекта */
	can_set_plan: boolean,
	/** Имеет ли подтвержденное приложение для проекта */
	has_clearance: boolean,
	/** Является ли пользователь гостем (неавторизованным) */
	is_guest: boolean,
	/** Есть ли запрос на получение допуска в рассмотрении */
	pending_clearance: boolean
};
	/** Плановые показатели проекта */
["CapitalProjectPlanPool"]: {
		/** Базовый пул авторов */
	authors_base_pool: string,
	/** Бонусный пул авторов */
	authors_bonus_pool: string,
	/** Бонусный пул участников */
	contributors_bonus_pool: string,
	/** Базовый пул координаторов */
	coordinators_base_pool: string,
	/** Инвестиционный пул координаторов */
	coordinators_investment_pool: string,
	/** Базовый пул создателей */
	creators_base_pool: string,
	/** Бонусный пул создателей */
	creators_bonus_pool: string,
	/** Плановые часы создателей */
	creators_hours: number,
	/** Плановая стоимость часа работы */
	hour_cost: string,
	/** Инвестиционный пул */
	invest_pool: string,
	/** Программный инвестиционный пул */
	program_invest_pool: string,
	/** Процент возврата базового пула */
	return_base_percent: number,
	/** Целевой пул расходов */
	target_expense_pool: string,
	/** Общая сумма */
	total: string,
	/** Общий генерационный пул */
	total_generation_pool: string,
	/** Общий объем полученных инвестиций */
	total_received_investments: string,
	/** Общая сумма */
	total_with_investments: string,
	/** Процент использования инвестиций */
	use_invest_percent: number
};
	/** Статистика времени участника по проекту */
["CapitalProjectTimeStats"]: {
		/** Доступное время для коммита (по завершённым задачам) */
	available_hours: number,
	/** Хеш участника */
	contributor_hash: string,
	/** Время в ожидании (по незавершённым задачам) */
	pending_hours: number,
	/** Хеш проекта */
	project_hash: string,
	/** Название проекта */
	project_name: string,
	/** Сумма закоммиченного времени (часы) */
	total_committed_hours: number,
	/** Сумма незакоммиченного времени (часы) */
	total_uncommitted_hours: number
};
	/** Суммы голосования проекта */
["CapitalProjectVotingAmounts"]: {
		/** Активная сумма голосования */
	active_voting_amount: string,
	/** Бонусы авторов при голосовании */
	authors_bonuses_on_voting: string,
	/** Равная сумма на автора */
	authors_equal_per_author: string,
	/** Равномерное распределение среди авторов */
	authors_equal_spread: string,
	/** Бонусы создателей при голосовании */
	creators_bonuses_on_voting: string,
	/** Прямое распределение среди создателей */
	creators_direct_spread: string,
	/** Равная сумма голосования */
	equal_voting_amount: string,
	/** Общий пул голосования */
	total_voting_pool: string
};
	/** Данные голосования по методу Водянова */
["CapitalProjectVotingData"]: {
		/** Суммы голосования */
	amounts: ModelTypes["CapitalProjectVotingAmounts"],
	/** Процент голосования авторов */
	authors_voting_percent: number,
	/** Процент голосования создателей */
	creators_voting_percent: number,
	/** Общее количество участников голосования */
	total_voters: number,
	/** Количество полученных голосов */
	votes_received: number,
	/** Дата окончания голосования */
	voting_deadline: string
};
	/** Результат в системе CAPITAL */
["CapitalResult"]: {
		/** Дата создания записи */
	_created_at: ModelTypes["DateTime"],
	/** Внутренний ID базы данных */
	_id: string,
	/** Дата последнего обновления записи */
	_updated_at: ModelTypes["DateTime"],
	/** Акт приёма-передачи результата */
	act?: ModelTypes["DocumentAggregate"] | undefined | null,
	/** Авторизация результата */
	authorization?: ModelTypes["DocumentAggregate"] | undefined | null,
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?: number | undefined | null,
	/** Статус из блокчейна */
	blockchain_status?: string | undefined | null,
	/** Название кооператива */
	coopname?: string | undefined | null,
	/** Дата создания */
	created_at?: string | undefined | null,
	/** Структурированные данные результата для отображения */
	data?: string | undefined | null,
	/** Сумма долга */
	debt_amount?: string | undefined | null,
	/** ID в блокчейне */
	id?: number | undefined | null,
	/** Флаг присутствия записи в блокчейне */
	present: boolean,
	/** Хеш проекта */
	project_hash?: string | undefined | null,
	/** Хеш результата */
	result_hash: string,
	/** Заявление на внесение результата интеллектуальной деятельности */
	statement?: ModelTypes["DocumentAggregate"] | undefined | null,
	/** Статус результата */
	status: ModelTypes["ResultStatus"],
	/** Общая сумма */
	total_amount?: string | undefined | null,
	/** Имя пользователя */
	username?: string | undefined | null
};
	/** Сегмент участника в проекте CAPITAL */
["CapitalSegment"]: {
		/** Дата создания записи */
	_created_at: ModelTypes["DateTime"],
	/** Внутренний ID базы данных */
	_id: string,
	/** Дата последнего обновления записи */
	_updated_at: ModelTypes["DateTime"],
	/** Базовый вклад автора */
	author_base: string,
	/** Бонусный вклад автора */
	author_bonus: string,
	/** Доступная сумма для конвертации в программу */
	available_for_program: string,
	/** Доступная сумма для конвертации в кошелек */
	available_for_wallet: string,
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?: number | undefined | null,
	/** Доли участников капитала */
	capital_contributor_shares: string,
	/** Бонусный вклад участника */
	contributor_bonus: string,
	/** Название кооператива */
	coopname: string,
	/** Базовый вклад координатора */
	coordinator_base: string,
	/** Инвестиции координатора */
	coordinator_investments: string,
	/** Базовый вклад создателя */
	creator_base: string,
	/** Бонусный вклад создателя */
	creator_bonus: string,
	/** Сумма долга */
	debt_amount: string,
	/** Сумма погашенного долга */
	debt_settled: string,
	/** Прямой бонус создателя */
	direct_creator_bonus: string,
	/** Отображаемое имя пользователя */
	display_name: string,
	/** Равный бонус автора */
	equal_author_bonus: string,
	/** Наличие права голоса */
	has_vote: boolean,
	/** ID в блокчейне */
	id?: number | undefined | null,
	/** Интеллектуальная стоимость сегмента */
	intellectual_cost: string,
	/** Сумма инвестиций инвестора */
	investor_amount: string,
	/** Базовый вклад инвестора */
	investor_base: string,
	/** Роль автора */
	is_author: boolean,
	/** Завершена ли конвертация сегмента */
	is_completed: boolean,
	/** Роль участника */
	is_contributor: boolean,
	/** Роль координатора */
	is_coordinator: boolean,
	/** Роль создателя */
	is_creator: boolean,
	/** Роль инвестора */
	is_investor: boolean,
	/** Роль собственника */
	is_propertor: boolean,
	/** Флаг завершения расчета голосования */
	is_votes_calculated: boolean,
	/** Последняя награда за базовый вклад автора на долю в проекте */
	last_author_base_reward_per_share: number,
	/** Последняя награда за бонусный вклад автора на долю в проекте */
	last_author_bonus_reward_per_share: number,
	/** Последняя награда участника на акцию */
	last_contributor_reward_per_share: number,
	/** Последняя известная сумма инвестиций координаторов */
	last_known_coordinators_investment_pool: string,
	/** Последняя известная сумма базового пула создателей */
	last_known_creators_base_pool: string,
	/** Последняя известная сумма инвестиций в проекте */
	last_known_invest_pool: string,
	/** Флаг присутствия записи в блокчейне */
	present: boolean,
	/** Хеш проекта */
	project_hash: string,
	/** Базовый имущественный вклад */
	property_base: string,
	/** Предварительная сумма */
	provisional_amount: string,
	/** Доля участника в результате интеллектуальной деятельности */
	share_percent: number,
	/** Статус сегмента */
	status: ModelTypes["SegmentStatus"],
	/** Общая базовая стоимость сегмента */
	total_segment_base_cost: string,
	/** Общая бонусная стоимость сегмента */
	total_segment_bonus_cost: string,
	/** Общая стоимость сегмента */
	total_segment_cost: string,
	/** Имя пользователя */
	username: string,
	/** Вклад участника словами участника */
	value?: string | undefined | null,
	/** Бонус голосования */
	voting_bonus: string
};
	/** История (критерий выполнения) в системе CAPITAL */
["CapitalStory"]: {
		/** Дата создания записи */
	_created_at: ModelTypes["DateTime"],
	/** Внутренний ID базы данных */
	_id: string,
	/** Дата последнего обновления записи */
	_updated_at: ModelTypes["DateTime"],
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?: number | undefined | null,
	/** Формат содержимого (markdown-текст или BPMN 2.0 XML в description) */
	content_format: ModelTypes["CapitalStoryContentFormat"],
	/** Имя аккаунта кооператива */
	coopname: string,
	/** Имя пользователя, создавшего историю */
	created_by: string,
	/** Описание истории */
	description?: string | undefined | null,
	/** Хеш задачи (если история привязана к задаче) */
	issue_hash?: string | undefined | null,
	/** Флаг присутствия записи в блокчейне */
	present: boolean,
	/** Хеш проекта (если история привязана к проекту) */
	project_hash?: string | undefined | null,
	/** Порядок сортировки */
	sort_order: number,
	/** Статус истории */
	status: ModelTypes["StoryStatus"],
	/** Хеш истории */
	story_hash: string,
	/** Название истории */
	title: string
};
	["CapitalStoryContentFormat"]:CapitalStoryContentFormat;
	/** Агрегированная статистика времени по задачам с информацией о задачах и участниках */
["CapitalTimeEntriesByIssues"]: {
		/** Доступное время для коммита (по завершённым задачам) */
	available_hours: number,
	/** Количество закоммиченных часов */
	committed_hours: number,
	/** Хеш участника */
	contributor_hash: string,
	/** Имя участника */
	contributor_name: string,
	/** Название кооператива */
	coopname: string,
	/** Хеш задачи */
	issue_hash: string,
	/** Название задачи */
	issue_title: string,
	/** Время в ожидании (по незавершённым задачам) */
	pending_hours: number,
	/** Хеш проекта */
	project_hash: string,
	/** Название проекта */
	project_name: string,
	/** Общее количество часов по задаче */
	total_hours: number,
	/** Количество незакоммиченных часов */
	uncommitted_hours: number
};
	/** Запись времени участника */
["CapitalTimeEntry"]: {
		/** Дата создания записи */
	_created_at: string,
	/** Уникальный идентификатор записи */
	_id: string,
	/** Дата последнего обновления записи */
	_updated_at: string,
	/** Хеш коммита */
	commit_hash?: string | undefined | null,
	/** Хеш участника */
	contributor_hash: string,
	/** Название кооператива */
	coopname: string,
	/** Дата записи времени (YYYY-MM-DD) */
	date: string,
	/** Тип начисления времени: hourly (почасовое) или estimate (по завершению задачи) */
	entry_type?: string | undefined | null,
	/** Снимок estimate на момент начисления времени (для отслеживания изменений) */
	estimate_snapshot?: number | undefined | null,
	/** Количество часов */
	hours: number,
	/** Флаг, указывающий, закоммичена ли запись */
	is_committed: boolean,
	/** Хеш задачи */
	issue_hash: string,
	/** Хеш проекта */
	project_hash: string
};
	/** Голос в системе CAPITAL */
["CapitalVote"]: {
		/** Дата создания записи */
	_created_at: ModelTypes["DateTime"],
	/** Внутренний ID базы данных */
	_id: string,
	/** Дата последнего обновления записи */
	_updated_at: ModelTypes["DateTime"],
	/** Сумма голоса */
	amount?: string | undefined | null,
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?: number | undefined | null,
	/** Название кооператива */
	coopname?: string | undefined | null,
	/** ID в блокчейне */
	id?: number | undefined | null,
	/** Флаг присутствия записи в блокчейне */
	present: boolean,
	/** Хеш проекта */
	project_hash?: string | undefined | null,
	/** Получатель */
	recipient?: string | undefined | null,
	/** Отображаемое имя получателя голоса */
	recipient_display_name?: string | undefined | null,
	/** Дата голосования */
	voted_at?: string | undefined | null,
	/** Голосующий */
	voter?: string | undefined | null,
	/** Отображаемое имя голосующего */
	voter_display_name?: string | undefined | null
};
	["ChartOfAccountsItem"]: {
		/** Доступные средства */
	available: string,
	/** Заблокированные средства */
	blocked: string,
	/** Идентификатор счета для отображения (может быть дробным, например "86.6") */
	displayId: string,
	/** Идентификатор счета */
	id: number,
	/** Название счета */
	name: string,
	/** Списанные средства */
	writeoff: string
};
	["CommitStatus"]:CommitStatus;
	["ContactsDTO"]: {
		chairman: ModelTypes["PublicChairman"],
	details: ModelTypes["OrganizationDetails"],
	email: string,
	full_address: string,
	full_name: string,
	phone: string
};
	/** Параметры документов участника из UData */
["ContributorDocumentParameters"]: {
		/** Дата создания соглашения благороста */
	blagorost_agreement_created_at?: string | undefined | null,
	/** Номер соглашения программы благороста */
	blagorost_agreement_number?: string | undefined | null,
	/** Дата создания договора УХД участника */
	blagorost_contributor_contract_created_at?: string | undefined | null,
	/** Номер договора УХД участника */
	blagorost_contributor_contract_number?: string | undefined | null,
	/** Дата создания дополнительного соглашения по хранению имущества */
	blagorost_storage_agreement_created_at?: string | undefined | null,
	/** Номер дополнительного соглашения по хранению имущества */
	blagorost_storage_agreement_number?: string | undefined | null,
	/** Дата создания соглашения генератора */
	generator_agreement_created_at?: string | undefined | null,
	/** Номер соглашения программы генератор */
	generator_agreement_number?: string | undefined | null
};
	["ContributorStatus"]:ContributorStatus;
	["CooperativeOperatorAccount"]: {
		/** Количество активных участников */
	active_participants_count: number,
	/** Объявление кооператива */
	announce: string,
	/** Тип кооператива */
	coop_type: string,
	/** Дата создания */
	created_at: string,
	/** Описание кооператива */
	description: string,
	/** Документ кооператива */
	document: ModelTypes["SignedBlockchainDocument"],
	/** Начальный взнос */
	initial: string,
	/** Разветвленный ли кооператив */
	is_branched: boolean,
	/** Является ли это кооперативом */
	is_cooperative: boolean,
	/** Включен ли кооператив */
	is_enrolled: boolean,
	/** Метаинформация */
	meta: string,
	/** Минимальный взнос */
	minimum: string,
	/** Начальный взнос организации */
	org_initial: string,
	/** Минимальный взнос организации */
	org_minimum: string,
	/** Регистрационный взнос организации */
	org_registration: string,
	/** Родительское имя аккаунта кооператива */
	parent_username: string,
	/** Реферал кооператива */
	referer: string,
	/** Дата регистрации */
	registered_at: string,
	/** Регистрационный взнос */
	registration: string,
	/** Регистратор кооператива */
	registrator: string,
	/** Статус кооператива */
	status: string,
	/** Список хранилищ */
	storages: Array<string>,
	/** Тип учетной записи */
	type: string,
	/** Имя аккаунта кооператива */
	username: string,
	/** Дата регистрации */
	verifications: Array<ModelTypes["Verification"]>
};
	["Country"]:Country;
	["CreateBranchInput"]: {
	/** Документ, на основании которого действует Уполномоченный (решение совета №СС-.. от ..) */
	based_on: string,
	/** Имя аккаунта кооперативного участка */
	braname: string,
	/** Имя аккаунта кооператива */
	coopname: string,
	/** Электронная почта */
	email: string,
	/** Фактический адрес */
	fact_address: string,
	/** Полное имя организации кооперативного участка */
	full_name: string,
	/** Телефон */
	phone: string,
	/** Краткое имя организации кооперативного участка */
	short_name: string,
	/** Имя аккаунта уполномоченного (председателя) кооперативного участка */
	trustee: string
};
	["CreateEntrepreneurDataInput"]: {
	/** Банковский счет */
	bank_account: ModelTypes["BankAccountInput"],
	/** Дата рождения */
	birthdate: string,
	/** Город */
	city: string,
	/** Страна */
	country: ModelTypes["Country"],
	/** Детали индивидуального предпринимателя */
	details: ModelTypes["EntrepreneurDetailsInput"],
	/** Имя */
	first_name: string,
	/** Полный адрес */
	full_address: string,
	/** Фамилия */
	last_name: string,
	/** Отчество */
	middle_name: string,
	/** Телефон */
	phone: string
};
	["CreateIndividualDataInput"]: {
	/** Дата рождения */
	birthdate: string,
	/** Имя */
	first_name: string,
	/** Полный адрес */
	full_address: string,
	/** Фамилия */
	last_name: string,
	/** Отчество */
	middle_name: string,
	/** Данные паспорта */
	passport?: ModelTypes["PassportInput"] | undefined | null,
	/** Телефон */
	phone: string
};
	["CreateInitOrganizationDataInput"]: {
	/** Банковский счет организации */
	bank_account: ModelTypes["BankAccountInput"],
	/** Город */
	city: string,
	/** Страна */
	country: string,
	/** Детали организации */
	details: ModelTypes["OrganizationDetailsInput"],
	/** Email организации */
	email: string,
	/** Фактический адрес */
	fact_address: string,
	/** Полный адрес */
	full_address: string,
	/** Полное наименование организации */
	full_name: string,
	/** Телефон */
	phone: string,
	/** Представитель организации */
	represented_by: ModelTypes["RepresentedByInput"],
	/** Краткое наименование организации */
	short_name: string,
	/** Тип организации */
	type: ModelTypes["OrganizationType"]
};
	["CreateOrganizationDataInput"]: {
	/** Банковский счет организации */
	bank_account: ModelTypes["BankAccountInput"],
	/** Город */
	city: string,
	/** Страна */
	country: string,
	/** Детали организации */
	details: ModelTypes["OrganizationDetailsInput"],
	/** Фактический адрес */
	fact_address: string,
	/** Полный адрес */
	full_address: string,
	/** Полное наименование организации */
	full_name: string,
	/** Телефон */
	phone: string,
	/** Представитель организации */
	represented_by: ModelTypes["RepresentedByInput"],
	/** Краткое наименование организации */
	short_name: string,
	/** Тип организации */
	type: ModelTypes["OrganizationType"]
};
	["CreateSovietIndividualDataInput"]: {
	/** Дата рождения */
	birthdate: string,
	/** Email адрес */
	email: string,
	/** Имя */
	first_name: string,
	/** Полный адрес */
	full_address: string,
	/** Фамилия */
	last_name: string,
	/** Отчество */
	middle_name: string,
	/** Данные паспорта */
	passport?: ModelTypes["PassportInput"] | undefined | null,
	/** Телефон */
	phone: string
};
	["CreateSubscriptionInput"]: {
	/** Данные подписки */
	subscription: ModelTypes["WebPushSubscriptionDataInput"],
	/** User Agent браузера */
	userAgent?: string | undefined | null,
	/** Username пользователя */
	username: string
};
	["CreateSubscriptionResponse"]: {
		/** Сообщение о результате операции */
	message: string,
	/** Данные созданной подписки */
	subscription: ModelTypes["WebPushSubscriptionDto"],
	/** Успешно ли создана подписка */
	success: boolean
};
	["CurrentTableState"]: {
		/** Номер блока, в котором была последняя запись */
	block_num: number,
	/** Код контракта */
	code: string,
	/** Дата создания последней записи */
	created_at: ModelTypes["DateTime"],
	/** Первичный ключ */
	primary_key: string,
	/** Область действия */
	scope: string,
	/** Имя таблицы */
	table: string,
	/** Данные записи в формате JSON */
	value?: ModelTypes["JSON"] | undefined | null
};
	["CycleStatus"]:CycleStatus;
	/** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
["DateTime"]:any;
	["DeactivateSubscriptionInput"]: {
	/** ID подписки для деактивации */
	subscriptionId: string
};
	["DebtStatus"]:DebtStatus;
	/** Комплексный объект решения совета, включающий в себя информацию о голосовавших членах совета, расширенное действие, которое привело к появлению решения, и агрегат документа самого решения. */
["DecisionDetailAggregate"]: {
		action: ModelTypes["ExtendedBlockchainAction"],
	documentAggregate: ModelTypes["DocumentAggregate"],
	votes_against: Array<ModelTypes["ExtendedBlockchainAction"]>,
	votes_for: Array<ModelTypes["ExtendedBlockchainAction"]>
};
	["DeleteBranchInput"]: {
	/** Имя аккаунта кооперативного участка */
	braname: string,
	/** Имя аккаунта кооператива */
	coopname: string
};
	["DeletePaymentMethodInput"]: {
	/** Идентификатор метода оплаты */
	method_id: string,
	/** Имя пользователя, чей метод оплаты нужно удалить */
	username: string
};
	["DeleteTrustedAccountInput"]: {
	/** Имя аккаунта кооперативного участка */
	braname: string,
	/** Имя аккаунта кооператива */
	coopname: string,
	/** Имя аккаунта доверонного лица, у которого отзывается право подписи за председателя кооперативного участка */
	trusted: string
};
	["Delta"]: {
		/** ID блока */
	block_id: string,
	/** Номер блока */
	block_num: number,
	/** ID блокчейна */
	chain_id: string,
	/** Код контракта */
	code: string,
	/** Дата создания */
	created_at: ModelTypes["DateTime"],
	/** Уникальный идентификатор */
	id: string,
	/** Флаг присутствия записи */
	present: boolean,
	/** Первичный ключ */
	primary_key: string,
	/** Область действия */
	scope: string,
	/** Имя таблицы */
	table: string,
	/** Данные записи в формате JSON */
	value?: ModelTypes["JSON"] | undefined | null
};
	["Desktop"]: {
		/** Домашняя страница для авторизованных пользователей */
	authorizedHome: string,
	/** Имя аккаунта кооператива */
	coopname: string,
	/** Имя шаблона рабочих столов */
	layout: string,
	/** Домашняя страница для неавторизованных пользователей */
	nonAuthorizedHome: string,
	/** Состав приложений рабочего стола */
	workspaces: Array<ModelTypes["DesktopWorkspace"]>
};
	["DesktopConfig"]: {
		/** Маршрут по умолчанию */
	defaultRoute?: string | undefined | null,
	/** Иконка для меню */
	icon?: string | undefined | null,
	/** Уникальное имя workspace */
	name: string,
	/** Отображаемое название workspace */
	title: string
};
	["DesktopWorkspace"]: {
		/** Маршрут по умолчанию для этого workspace */
	defaultRoute?: string | undefined | null,
	/** Имя расширения, которому принадлежит этот workspace */
	extension_name: string,
	/** Иконка для меню */
	icon?: string | undefined | null,
	/** Уникальное имя workspace */
	name: string,
	/** Отображаемое название workspace */
	title: string
};
	["DocumentAggregate"]: {
		document: ModelTypes["SignedDigitalDocument"],
	hash: string,
	rawDocument?: ModelTypes["GeneratedDocument"] | undefined | null
};
	/** Комплексный объект папки цифрового документа с агрегатами, который включает в себя заявление, решение, акты и связанные документы */
["DocumentPackageAggregate"]: {
		/** Массив объект(ов) актов с агрегатами, относящихся к заявлению */
	acts: Array<ModelTypes["ActDetailAggregate"]>,
	/** Объект цифрового документа решения с агрегатом */
	decision?: ModelTypes["DecisionDetailAggregate"] | undefined | null,
	/** Массив связанных документов с агрегатами, извлечённых из мета-данных */
	links: Array<ModelTypes["DocumentAggregate"]>,
	/** Объект цифрового документа заявления с агрегатом */
	statement?: ModelTypes["StatementDetailAggregate"] | undefined | null
};
	["EditBranchInput"]: {
	/** Документ, на основании которого действует Уполномоченный (решение совета №СС-.. от ..) */
	based_on: string,
	/** Имя аккаунта кооперативного участка */
	braname: string,
	/** Имя аккаунта кооператива */
	coopname: string,
	/** Электронная почта */
	email: string,
	/** Фактический адрес */
	fact_address: string,
	/** Полное имя организации кооперативного участка */
	full_name: string,
	/** Телефон */
	phone: string,
	/** Краткое имя организации кооперативного участка */
	short_name: string,
	/** Имя аккаунта уполномоченного (председателя) кооперативного участка */
	trustee: string
};
	["Entrepreneur"]: {
		/** Дата рождения */
	birthdate: string,
	/** Город */
	city: string,
	/** Страна */
	country: string,
	/** Детали ИП (ИНН, ОГРН) */
	details: ModelTypes["EntrepreneurDetails"],
	/** Email */
	email: string,
	/** Имя */
	first_name: string,
	/** Юридический адрес */
	full_address: string,
	/** Фамилия */
	last_name: string,
	/** Отчество */
	middle_name: string,
	/** Телефон */
	phone: string,
	/** Имя аккаунта */
	username: string
};
	["EntrepreneurCertificate"]: {
		/** Имя */
	first_name: string,
	/** ИНН */
	inn: string,
	/** Фамилия */
	last_name: string,
	/** Отчество */
	middle_name?: string | undefined | null,
	/** Тип аккаунта */
	type: ModelTypes["AccountType"],
	/** Имя аккаунта */
	username: string
};
	["EntrepreneurDetails"]: {
		/** ИНН */
	inn: string,
	/** ОГРН */
	ogrn: string
};
	["EntrepreneurDetailsInput"]: {
	/** ИНН */
	inn: string,
	/** ОГРН */
	ogrn: string
};
	["ExpenseStatus"]:ExpenseStatus;
	/** Расширенное действие блокчейна с сертификатом пользователя, совершившего его. */
["ExtendedBlockchainAction"]: {
		account: string,
	account_ram_deltas: Array<ModelTypes["AccountRamDelta"]>,
	action_ordinal: number,
	/** Сертификат пользователя (сокращенная информация) */
	actor_certificate?: ModelTypes["UserCertificateUnion"] | undefined | null,
	authorization: Array<ModelTypes["ActionAuthorization"]>,
	block_id: string,
	block_num: number,
	chain_id: string,
	console: string,
	context_free: boolean,
	creator_action_ordinal: number,
	/** Данные действия в формате JSON */
	data: ModelTypes["JSON"],
	elapsed: number,
	global_sequence: string,
	name: string,
	receipt: ModelTypes["ActionReceipt"],
	receiver: string,
	transaction_id: string
};
	["ExtendedMeetStatus"]:ExtendedMeetStatus;
	["Extension"]: {
		/** Настройки конфигурации для расширения */
	config?: ModelTypes["JSON"] | undefined | null,
	/** Дата создания расширения */
	created_at: ModelTypes["DateTime"],
	/** Описание расширения */
	description?: string | undefined | null,
	/** Массив рабочих столов, которые предоставляет расширение */
	desktops?: Array<ModelTypes["DesktopConfig"]> | undefined | null,
	/** Показывает, включено ли расширение */
	enabled: boolean,
	/** Внешняя ссылка на iframe-интерфейс расширения */
	external_url?: string | undefined | null,
	/** Изображение для расширения */
	image?: string | undefined | null,
	/** Поле инструкция для установки (INSTALL) */
	instructions: string,
	/** Показывает, доступно ли расширение */
	is_available: boolean,
	/** Показывает, встроенное ли это расширение */
	is_builtin: boolean,
	/** Показывает, установлено ли расширение */
	is_installed: boolean,
	/** Показывает, внутреннее ли это расширение */
	is_internal: boolean,
	/** Уникальное имя расширения */
	name: string,
	/** Поле подробного текстового описания (README) */
	readme: string,
	/** Схема настроек конфигурации для расширения */
	schema?: ModelTypes["JSON"] | undefined | null,
	/** Массив тегов для расширения */
	tags: Array<string>,
	/** Заголовок расширения */
	title?: string | undefined | null,
	/** Дата последнего обновления расширения */
	updated_at: ModelTypes["DateTime"]
};
	["ExtensionInput"]: {
	/** Объект конфигурации расширения */
	config: ModelTypes["JSON"],
	/** Дата установки расширения */
	created_at?: ModelTypes["DateTime"] | undefined | null,
	/** Флаг того, включено ли расширение сейчас */
	enabled: boolean,
	/** Уникальное имя расширения (является идентификатором) */
	name: string,
	/** Дата обновления расширения */
	updated_at?: ModelTypes["DateTime"] | undefined | null
};
	["ExtensionLog"]: {
		/** Дата создания записи */
	created_at: ModelTypes["DateTime"],
	/** Данные лога в формате JSON */
	data?: string | undefined | null,
	/** Локальный ID записи лога в рамках расширения */
	extension_local_id: number,
	/** Глобальный ID записи лога */
	id: number,
	/** Имя расширения */
	name: string,
	/** Дата последнего обновления записи */
	updated_at: ModelTypes["DateTime"]
};
	["ExtensionLogsPaginationResult"]: {
		/** Текущая страница */
	currentPage: number,
	/** Элементы текущей страницы */
	items: Array<ModelTypes["ExtensionLog"]>,
	/** Общее количество элементов */
	totalCount: number,
	/** Общее количество страниц */
	totalPages: number
};
	["GatewayPayment"]: {
		/** Данные из блокчейна */
	blockchain_data?: ModelTypes["JSON"] | undefined | null,
	/** Можно ли изменить статус */
	can_change_status: boolean,
	/** Название кооператива */
	coopname: string,
	/** Дата создания */
	created_at: ModelTypes["DateTime"],
	/** Направление платежа */
	direction: ModelTypes["PaymentDirection"],
	/** Человекочитаемое направление платежа */
	direction_label: string,
	/** Дата истечения */
	expired_at?: ModelTypes["DateTime"] | undefined | null,
	/** Форматированная сумма */
	formatted_amount: string,
	/** Хеш платежа */
	hash?: string | undefined | null,
	/** Уникальный идентификатор платежа */
	id?: ModelTypes["ID"] | undefined | null,
	/** Хеш входящего платежа (устарело) */
	income_hash?: string | undefined | null,
	/** Завершен ли платеж окончательно */
	is_final: boolean,
	/** Дополнительная информация */
	memo?: string | undefined | null,
	/** Сообщение */
	message?: string | undefined | null,
	/** Хеш исходящего платежа (устарело) */
	outcome_hash?: string | undefined | null,
	/** Детали платежа */
	payment_details?: ModelTypes["PaymentDetails"] | undefined | null,
	/** ID платежного метода */
	payment_method_id?: string | undefined | null,
	/** Провайдер платежа */
	provider?: string | undefined | null,
	/** Количество/сумма */
	quantity: number,
	/** Подписанный документ заявления */
	statement?: ModelTypes["JSON"] | undefined | null,
	/** Статус платежа */
	status: ModelTypes["PaymentStatus"],
	/** Человекочитаемый статус */
	status_label: string,
	/** Символ валюты */
	symbol: string,
	/** Тип платежа */
	type: ModelTypes["PaymentType"],
	/** Человекочитаемый тип платежа */
	type_label: string,
	/** Дата обновления */
	updated_at?: ModelTypes["DateTime"] | undefined | null,
	/** Имя пользователя */
	username: string,
	/** Сертификат пользователя, создавшего платеж */
	username_certificate?: ModelTypes["UserCertificateUnion"] | undefined | null
};
	["GenerateDocumentOptionsInput"]: {
	/** Язык документа */
	lang?: string | undefined | null,
	/** Пропустить сохранение */
	skip_save?: boolean | undefined | null
};
	["GeneratedDocument"]: {
		/** Бинарное содержимое документа (base64) */
	binary: string,
	/** Полное название документа */
	full_title: string,
	/** Хэш документа */
	hash: string,
	/** HTML содержимое документа */
	html: string,
	/** Метаданные документа */
	meta: ModelTypes["JSON"]
};
	["GeneratedRegistrationDocument"]: {
		/** Тип соглашения для блокчейна */
	agreement_type: string,
	/** Текст для галочки на фронтенде */
	checkbox_text: string,
	/** Сгенерированный документ */
	document: ModelTypes["GeneratedDocument"],
	/** Идентификатор соглашения (wallet_agreement, signature_agreement и т.д.) */
	id: string,
	/** Нужно ли отправлять в блокчейн как agreement */
	is_blockchain_agreement: boolean,
	/** Текст ссылки для открытия диалога чтения */
	link_text: string,
	/** Нужно ли линковать в заявление */
	link_to_statement: boolean,
	/** Порядок отображения */
	order: number,
	/** Название документа */
	title: string
};
	["GetAccountInput"]: {
	/** Имя аккаунта пользователя */
	username: string
};
	["GetAccountsInput"]: {
	role?: string | undefined | null
};
	["GetBranchesInput"]: {
	/** Фильтр по имени аккаунта кооперативного участка */
	braname?: string | undefined | null,
	/** Имя аккаунта кооператива */
	coopname: string
};
	/** Входные данные для получения логов событий по задаче */
["GetCapitalIssueLogsInput"]: {
	/** Хеш задачи */
	issue_hash: string
};
	/** Входные данные для получения логов событий с фильтрацией и пагинацией */
["GetCapitalLogsInput"]: {
	/** Фильтры для поиска логов */
	filter?: ModelTypes["CapitalLogFilterInput"] | undefined | null,
	/** Параметры пагинации */
	pagination?: ModelTypes["PaginationInput"] | undefined | null
};
	["GetExtensionLogsInput"]: {
	/** Фильтр по дате создания (от) */
	createdFrom?: ModelTypes["DateTime"] | undefined | null,
	/** Фильтр по дате создания (до) */
	createdTo?: ModelTypes["DateTime"] | undefined | null,
	/** Фильтр по имени расширения */
	name?: string | undefined | null
};
	["GetExtensionsInput"]: {
	/** Фильтр включенных расширений */
	enabled?: boolean | undefined | null,
	/** Фильтр активности */
	is_available?: boolean | undefined | null,
	/** Фильтр рабочих столов */
	is_desktop?: boolean | undefined | null,
	/** Фильтр установленных расширений */
	is_installed?: boolean | undefined | null,
	/** Фильтр по имени */
	name?: string | undefined | null
};
	["GetInstallationStatusInput"]: {
	/** Код установки */
	install_code: string
};
	["GetPaymentMethodsInput"]: {
	/** Количество элементов на странице */
	limit: number,
	/** Номер страницы */
	page: number,
	/** Ключ сортировки (например, "name") */
	sortBy?: string | undefined | null,
	/** Направление сортировки ("ASC" или "DESC") */
	sortOrder: string,
	/** Имя пользователя для фильтрации методов оплаты */
	username?: string | undefined | null
};
	["GetUserSubscriptionsInput"]: {
	/** Username пользователя */
	username: string
};
	["Individual"]: {
		/** Дата рождения */
	birthdate: string,
	/** Email */
	email: string,
	/** Имя */
	first_name: string,
	/** Полный адрес */
	full_address: string,
	/** Фамилия */
	last_name: string,
	/** Отчество */
	middle_name: string,
	/** Данные паспорта */
	passport?: ModelTypes["Passport"] | undefined | null,
	/** Телефон */
	phone: string,
	/** Имя аккаунта */
	username: string
};
	["IndividualCertificate"]: {
		/** Имя */
	first_name: string,
	/** Фамилия */
	last_name: string,
	/** Отчество */
	middle_name?: string | undefined | null,
	/** Тип аккаунта */
	type: ModelTypes["AccountType"],
	/** Имя аккаунта */
	username: string
};
	["Init"]: {
	/** Объект организации кооператива, которая обслуживает данный экземпляр программного обеспечения MONO */
	organization_data: ModelTypes["CreateInitOrganizationDataInput"]
};
	["Install"]: {
	soviet: Array<ModelTypes["SovietMemberInput"]>,
	vars: ModelTypes["SetVarsInput"]
};
	["InstallationStatus"]: {
		/** Есть ли приватный аккаунт */
	has_private_account: boolean,
	/** Инициализация выполнена через сервер */
	init_by_server?: boolean | undefined | null,
	/** Данные организации с банковскими реквизитами */
	organization_data?: ModelTypes["OrganizationWithBankAccount"] | undefined | null
};
	["InvestStatus"]:InvestStatus;
	["IssuePriority"]:IssuePriority;
	["IssueStatus"]:IssueStatus;
	/** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
["JSON"]:any;
	["KeyWeight"]: {
		/** Ключ */
	key: string,
	/** Вес */
	weight: number
};
	["LedgerOperation"]: {
		/** ID счета */
	account_id: number,
	/** Тип операции */
	action: string,
	/** Комментарий к операции */
	comment?: string | undefined | null,
	/** Имя кооператива */
	coopname: string,
	/** Дата и время создания операции */
	created_at: ModelTypes["DateTime"],
	/** Номер глобальной последовательности блокчейна */
	global_sequence: number,
	/** Хеш пакета документов операции */
	hash?: string | undefined | null,
	/** Сумма операции */
	quantity: string,
	/** Имя пользователя, совершившего операцию */
	username?: string | undefined | null
};
	["LogEntityType"]:LogEntityType;
	["LogEventType"]:LogEventType;
	/** Данные о собрании кооператива */
["Meet"]: {
		/** Документ с решением совета о проведении собрания */
	authorization?: ModelTypes["DocumentAggregate"] | undefined | null,
	/** Дата закрытия собрания */
	close_at: ModelTypes["DateTime"],
	/** Имя аккаунта кооператива */
	coopname: string,
	/** Дата создания собрания */
	created_at: ModelTypes["DateTime"],
	/** Текущий процент кворума */
	current_quorum_percent: number,
	/** Цикл собрания */
	cycle: number,
	/** Документ с решением секретаря */
	decision1?: ModelTypes["DocumentAggregate"] | undefined | null,
	/** Документ с решением председателя */
	decision2?: ModelTypes["DocumentAggregate"] | undefined | null,
	/** Хеш собрания */
	hash: string,
	/** Уникальный идентификатор собрания */
	id: number,
	/** Инициатор собрания */
	initiator: string,
	/** Сертификат инициатора собрания */
	initiator_certificate?: ModelTypes["UserCertificateUnion"] | undefined | null,
	/** Уровень собрания */
	level: string,
	/** Список пользователей, которые подписали уведомление */
	notified_users: Array<string>,
	/** Дата открытия собрания */
	open_at: ModelTypes["DateTime"],
	/** Председатель собрания */
	presider: string,
	/** Сертификат председателя собрания */
	presider_certificate?: ModelTypes["UserCertificateUnion"] | undefined | null,
	/** Документ с повесткой собрания */
	proposal?: ModelTypes["DocumentAggregate"] | undefined | null,
	/** Флаг достижения кворума */
	quorum_passed: boolean,
	/** Процент необходимого кворума */
	quorum_percent: number,
	/** Секретарь собрания */
	secretary: string,
	/** Сертификат секретаря собрания */
	secretary_certificate?: ModelTypes["UserCertificateUnion"] | undefined | null,
	/** Количество подписанных бюллетеней */
	signed_ballots: number,
	/** Статус собрания */
	status: string,
	/** Тип собрания */
	type: string
};
	/** Предварительные данные собрания перед обработкой */
["MeetPreProcessing"]: {
		/** Повестка собрания */
	agenda: Array<ModelTypes["AgendaMeetPoint"]>,
	/** Дата закрытия собрания */
	close_at: ModelTypes["DateTime"],
	/** Имя аккаунта кооператива */
	coopname: string,
	/** Дополнительная информация о формате собрания */
	details?: string | undefined | null,
	/** Хеш собрания */
	hash: string,
	/** Инициатор собрания */
	initiator: string,
	/** Сертификат инициатора собрания */
	initiator_certificate?: ModelTypes["UserCertificateUnion"] | undefined | null,
	/** Дата открытия собрания */
	open_at: ModelTypes["DateTime"],
	/** Председатель собрания */
	presider: string,
	/** Сертификат председателя собрания */
	presider_certificate?: ModelTypes["UserCertificateUnion"] | undefined | null,
	/** Документ с предложением повестки собрания */
	proposal?: ModelTypes["DocumentAggregate"] | undefined | null,
	/** Секретарь собрания */
	secretary: string,
	/** Сертификат секретаря собрания */
	secretary_certificate?: ModelTypes["UserCertificateUnion"] | undefined | null
};
	/** Данные о собрании после обработки */
["MeetProcessed"]: {
		/** Имя кооператива */
	coopname: string,
	/** Документ решения из блокчейна */
	decision: ModelTypes["SignedDigitalDocument"],
	/** Агрегат документа решения */
	decisionAggregate?: ModelTypes["DocumentAggregate"] | undefined | null,
	/** Хеш собрания */
	hash: string,
	/** Председатель собрания */
	presider: string,
	/** Сертификат председателя собрания */
	presider_certificate?: ModelTypes["UserCertificateUnion"] | undefined | null,
	/** Пройден ли кворум */
	quorum_passed: boolean,
	/** Процент кворума */
	quorum_percent: number,
	/** Результаты голосования по вопросам */
	results: Array<ModelTypes["MeetQuestionResult"]>,
	/** Секретарь собрания */
	secretary: string,
	/** Сертификат секретаря собрания */
	secretary_certificate?: ModelTypes["UserCertificateUnion"] | undefined | null,
	/** Количество подписанных бюллетеней */
	signed_ballots: number
};
	/** Данные о собрании в процессе обработки */
["MeetProcessing"]: {
		/** Расширенный статус собрания на основе дат и состояния */
	extendedStatus: ModelTypes["ExtendedMeetStatus"],
	/** Хеш собрания */
	hash: string,
	/** Флаг указывающий, голосовал ли текущий пользователь */
	isVoted: boolean,
	/** Основная информация о собрании */
	meet: ModelTypes["Meet"],
	/** Список вопросов повестки собрания */
	questions: Array<ModelTypes["Question"]>
};
	/** Результат голосования по вопросу */
["MeetQuestionResult"]: {
		/** Принят ли вопрос */
	accepted: boolean,
	/** Контекст вопроса */
	context: string,
	/** Принятое решение */
	decision: string,
	/** Порядковый номер вопроса */
	number: number,
	/** Идентификатор вопроса */
	question_id: number,
	/** Заголовок вопроса */
	title: string,
	/** Количество воздержавшихся */
	votes_abstained: number,
	/** Количество голосов против */
	votes_against: number,
	/** Количество голосов за */
	votes_for: number
};
	["MonoAccount"]: {
		/** Электронная почта пользователя */
	email: string,
	/** Есть ли у пользователя аккаунт */
	has_account: boolean,
	/** ID начального заказа */
	initial_order?: string | undefined | null,
	/** Подтверждена ли электронная почта */
	is_email_verified: boolean,
	/** Зарегистрирован ли пользователь */
	is_registered: boolean,
	/** Сообщение */
	message?: string | undefined | null,
	/** Публичный ключ пользователя */
	public_key: string,
	/** Реферер пользователя */
	referer: string,
	/** Роль пользователя */
	role: string,
	/** Статус пользователя */
	status: ModelTypes["UserStatus"],
	/** Хэш подписчика для уведомлений */
	subscriber_hash: string,
	/** Идентификатор подписчика для уведомлений */
	subscriber_id: string,
	/** Тип пользователя */
	type: string,
	/** Имя пользователя */
	username: string
};
	["Mutation"]: {
		/** Добавить метод оплаты (банковский счёт или СБП) */
	addPaymentMethod: ModelTypes["PaymentMethod"],
	/** Добавить доверенное лицо кооперативного участка

Требуемые роли: chairman.  */
	addTrustedAccount: ModelTypes["Branch"],
	/** Создать кооперативный участок

Требуемые роли: chairman.  */
	createBranch: ModelTypes["Branch"],
	/** Создать веб-пуш подписку для пользователя

Требуемые роли: chairman, member.  */
	createWebPushSubscription: ModelTypes["CreateSubscriptionResponse"],
	/** Деактивировать веб-пуш подписку по ID

Требуемые роли: chairman, member.  */
	deactivateWebPushSubscriptionById: boolean,
	/** Удалить кооперативный участок

Требуемые роли: chairman.  */
	deleteBranch: boolean,
	/** Удалить метод оплаты */
	deletePaymentMethod: boolean,
	/** Удалить доверенное лицо кооперативного участка

Требуемые роли: chairman.  */
	deleteTrustedAccount: ModelTypes["Branch"],
	/** Изменить кооперативный участок

Требуемые роли: chairman.  */
	editBranch: ModelTypes["Branch"],
	/** Сгенерировать документ, подтверждающий выбор кооперативного участка

Требуемые роли: chairman, member, user.  */
	generateSelectBranchDocument: ModelTypes["GeneratedDocument"],
	/** Произвести инициализацию программного обеспечения перед установкой совета методом install */
	initSystem: ModelTypes["SystemInfo"],
	/** Установить расширение

Требуемые роли: chairman.  */
	installExtension: ModelTypes["Extension"],
	/** Произвести установку членов совета перед началом работы */
	installSystem: ModelTypes["SystemInfo"],
	/** Зарегистрировать аккаунт пользователя в системе */
	registerAccount: ModelTypes["RegisteredAccount"],
	/** Выбрать кооперативный участок

Требуемые роли: chairman, member, user.  */
	selectBranch: boolean,
	/** Сохранить приватный ключ в зашифрованном серверном хранилище */
	setWif: boolean,
	/** Начать процесс установки кооператива, установить ключ и получить код установки */
	startInstall: ModelTypes["StartInstallResult"],
	/** Удалить расширение

Требуемые роли: chairman.  */
	uninstallExtension: boolean,
	/** Обновить аккаунт в системе провайдера. Обновление аккаунта пользователя производится по username. Мутация позволяет изменить приватные данные пользователя, а также, адрес электронной почты в MONO. Использовать мутацию может только председатель совета.

Требуемые роли: chairman.  */
	updateAccount: ModelTypes["Account"],
	/** Обновить банковский счёт */
	updateBankAccount: ModelTypes["PaymentMethod"],
	/** Обновить расширение

Требуемые роли: chairman.  */
	updateExtension: ModelTypes["Extension"],
	/** Обновить настройки системы (рабочие столы и маршруты по умолчанию)

Требуемые роли: chairman.  */
	updateSettings: ModelTypes["Settings"],
	/** Обновить параметры системы

Требуемые роли: chairman.  */
	updateSystem: ModelTypes["SystemInfo"]
};
	["OneCoopDocumentOutput"]: {
		/** Тип действия документа */
	action: string,
	/** Номер блока, в котором документ был зафиксирован */
	block_num: number,
	/** Специфичные данные для конкретного типа действия */
	data: ModelTypes["JSON"],
	/** SHA-256 хеш основного документа */
	hash: string,
	/** SHA-256 хеш пакета документов */
	package: string
};
	["Organization"]: {
		/** Город */
	city: string,
	/** Страна */
	country: string,
	/** Детали организации */
	details: ModelTypes["OrganizationDetails"],
	/** Email */
	email: string,
	/** Фактический адрес */
	fact_address: string,
	/** Юридический адрес */
	full_address: string,
	/** Полное название */
	full_name: string,
	/** Телефон */
	phone: string,
	/** Представитель организации */
	represented_by: ModelTypes["RepresentedBy"],
	/** Краткое название */
	short_name: string,
	/** Тип организации */
	type: string,
	/** Имя аккаунта организации */
	username: string
};
	["OrganizationCertificate"]: {
		/** ИНН */
	inn: string,
	/** ОГРН */
	ogrn: string,
	/** Данные представителя */
	represented_by: ModelTypes["RepresentedByCertificate"],
	/** Короткое название организации */
	short_name: string,
	/** Тип аккаунта */
	type: ModelTypes["AccountType"],
	/** Имя аккаунта */
	username: string
};
	["OrganizationDetails"]: {
		/** ИНН */
	inn: string,
	/** КПП */
	kpp: string,
	/** ОГРН */
	ogrn: string
};
	["OrganizationDetailsInput"]: {
	inn: string,
	kpp: string,
	ogrn: string
};
	["OrganizationType"]:OrganizationType;
	["OrganizationWithBankAccount"]: {
		/** Банковские реквизиты */
	bank_account?: ModelTypes["BankAccount"] | undefined | null,
	/** Город */
	city: string,
	/** Страна */
	country: string,
	/** Детали организации */
	details: ModelTypes["OrganizationDetails"],
	/** Email */
	email: string,
	/** Фактический адрес */
	fact_address: string,
	/** Юридический адрес */
	full_address: string,
	/** Полное название */
	full_name: string,
	/** Телефон */
	phone: string,
	/** Представитель организации */
	represented_by: ModelTypes["RepresentedBy"],
	/** Краткое название */
	short_name: string,
	/** Тип организации */
	type: string,
	/** Имя аккаунта организации */
	username: string
};
	["PaginatedCapitalLogsPaginationResult"]: {
		/** Текущая страница */
	currentPage: number,
	/** Элементы текущей страницы */
	items: Array<ModelTypes["CapitalLog"]>,
	/** Общее количество элементов */
	totalCount: number,
	/** Общее количество страниц */
	totalPages: number
};
	["PaginationInput"]: {
	/** Количество элементов на странице */
	limit: number,
	/** Номер страницы */
	page: number,
	/** Ключ сортировки (например, "name") */
	sortBy?: string | undefined | null,
	/** Направление сортировки ("ASC" или "DESC") */
	sortOrder: string
};
	["ParticipantAccount"]: {
		/** Имя кооперативного участка */
	braname?: string | undefined | null,
	/** Время создания записи о члене */
	created_at: ModelTypes["DateTime"],
	/** LEGACY Флаг, имеет ли член право голоса */
	has_vote: boolean,
	/** Сумма вступительного взноса */
	initial_amount?: string | undefined | null,
	/** LEGACY Флаг, внесен ли регистрационный взнос */
	is_initial: boolean,
	/** LEGACY Флаг, внесен ли минимальный паевый взнос */
	is_minimum: boolean,
	/** Время последнего минимального платежа */
	last_min_pay: ModelTypes["DateTime"],
	/** Время последнего обновления информации о члене */
	last_update: ModelTypes["DateTime"],
	/** Сумма минимального паевого взноса */
	minimum_amount?: string | undefined | null,
	/** Статус члена кооператива (accepted | blocked) */
	status: string,
	/** Тип участника (individual | entrepreneur | organization) */
	type?: string | undefined | null,
	/** Уникальное имя члена кооператива */
	username: string
};
	["Passport"]: {
		/** Код подразделения */
	code: string,
	/** Дата выдачи */
	issued_at: string,
	/** Кем выдан */
	issued_by: string,
	/** Номер паспорта */
	number: number,
	/** Серия паспорта */
	series: number
};
	["PassportInput"]: {
	code: string,
	issued_at: string,
	issued_by: string,
	number: number,
	series: number
};
	["PaymentDetails"]: {
		/** Сумма платежа с учетом комиссии */
	amount_plus_fee: string,
	/** Сумма платежа без учета комиссии */
	amount_without_fee: string,
	/** Данные платежа (QR-код, токен, реквизиты и т.д.) */
	data: ModelTypes["JSON"],
	/** Фактический процент комиссии */
	fact_fee_percent: number,
	/** Размер комиссии в абсолютных значениях */
	fee_amount: string,
	/** Процент комиссии */
	fee_percent: number,
	/** Допустимый процент отклонения */
	tolerance_percent: number
};
	["PaymentDirection"]:PaymentDirection;
	["PaymentMethod"]: {
		/** Дата создания */
	created_at: ModelTypes["DateTime"],
	/** Данные метода оплаты */
	data: ModelTypes["PaymentMethodData"],
	/** Флаг основного метода платежа, который отображается в документах */
	is_default: boolean,
	/** Идентификатор метода оплаты */
	method_id: string,
	/** Тип метода оплаты (например, sbp, bank_transfer) */
	method_type: string,
	/** Дата обновления */
	updated_at: ModelTypes["DateTime"],
	/** Имя пользователя, к которому привязан метод оплаты */
	username: string
};
	["PaymentMethodData"]:ModelTypes["BankAccount"] | ModelTypes["SbpAccount"];
	["PaymentMethodPaginationResult"]: {
		/** Текущая страница */
	currentPage: number,
	/** Элементы текущей страницы */
	items: Array<ModelTypes["PaymentMethod"]>,
	/** Общее количество элементов */
	totalCount: number,
	/** Общее количество страниц */
	totalPages: number
};
	["PaymentStatus"]:PaymentStatus;
	["PaymentType"]:PaymentType;
	["Permission"]: {
		/** Родительское разрешение */
	parent: string,
	/** Имя разрешения */
	perm_name: string,
	/** Требуемые разрешения */
	required_auth: ModelTypes["Authority"]
};
	["PermissionLevel"]: {
		/** Актор */
	actor: string,
	/** Разрешение */
	permission: string
};
	["PermissionLevelWeight"]: {
		/** Уровень разрешения */
	permission: ModelTypes["PermissionLevel"],
	/** Вес */
	weight: number
};
	["PrivateAccount"]: {
		entrepreneur_data?: ModelTypes["Entrepreneur"] | undefined | null,
	individual_data?: ModelTypes["Individual"] | undefined | null,
	organization_data?: ModelTypes["Organization"] | undefined | null,
	/** Тип аккаунта */
	type: ModelTypes["AccountType"]
};
	["PrivateAccountSearchData"]:ModelTypes["Entrepreneur"] | ModelTypes["Individual"] | ModelTypes["Organization"];
	["PrivateAccountSearchResult"]: {
		/** Данные найденного аккаунта */
	data: ModelTypes["PrivateAccountSearchData"],
	/** Поля, в которых найдены совпадения */
	highlightedFields?: Array<string> | undefined | null,
	/** Оценка релевантности результата */
	score?: number | undefined | null,
	/** Тип аккаунта */
	type: string
};
	["ProcessEdge"]: {
		id: string,
	source: string,
	target: string
};
	["ProcessStepPosition"]: {
		x: number,
	y: number
};
	["ProcessStepPositionInput"]: {
	x: number,
	y: number
};
	["ProcessStepState"]: {
		completed_at?: ModelTypes["DateTime"] | undefined | null,
	issue_hash?: string | undefined | null,
	status: ModelTypes["ProcessStepStatus"],
	step_id: string
};
	["ProcessStepStatus"]:ProcessStepStatus;
	["ProcessStepTemplate"]: {
		description?: string | undefined | null,
	estimate?: number | undefined | null,
	id: string,
	is_start?: boolean | undefined | null,
	position: ModelTypes["ProcessStepPosition"],
	title: string
};
	["ProgramInvestStatus"]:ProgramInvestStatus;
	["ProgramType"]:ProgramType;
	["ProgramWallet"]: {
		/** Идентификатор соглашения */
	agreement_id: ModelTypes["ID"],
	/** Доступный баланс (формат: "100.0000 RUB") */
	available: string,
	/** Номер блока последнего обновления */
	blockNum?: number | undefined | null,
	/** Заблокированный баланс (формат: "100.0000 RUB") */
	blocked: string,
	/** Имя кооператива */
	coopname: string,
	/** Уникальный идентификатор кошелька в блокчейне */
	id: ModelTypes["ID"],
	/** Паевой взнос (формат: "100.0000 RUB") */
	membership_contribution: string,
	/** Идентификатор программы */
	program_id: ModelTypes["ID"],
	/** Тип программы */
	program_type?: ModelTypes["ProgramType"] | undefined | null,
	/** Имя пользователя */
	username: string
};
	["ProjectStatus"]:ProjectStatus;
	["PublicChairman"]: {
		first_name: string,
	last_name: string,
	middle_name: string
};
	["Query"]: {
		/** Получить сводную информацию о аккаунте

Требуемые роли: chairman, member.  */
	getAccount: ModelTypes["Account"],
	/** Получить сводную информацию о аккаунтах системы

Требуемые роли: chairman, member.  */
	getAccounts: ModelTypes["AccountsPaginationResult"],
	/** Получить список кооперативных участков */
	getBranches: Array<ModelTypes["Branch"]>,
	/** Получить логи событий по задаче */
	getCapitalIssueLogs: ModelTypes["PaginatedCapitalLogsPaginationResult"],
	/** Получить логи событий по проекту с фильтрацией и пагинацией */
	getCapitalProjectLogs: ModelTypes["PaginatedCapitalLogsPaginationResult"],
	/** Получить состав приложений рабочего стола */
	getDesktop: ModelTypes["Desktop"],
	/** Получить логи расширений с фильтрацией и пагинацией

Требуемые роли: chairman, member.  */
	getExtensionLogs: ModelTypes["ExtensionLogsPaginationResult"],
	/** Получить список расширений

Требуемые роли: chairman.  */
	getExtensions: Array<ModelTypes["Extension"]>,
	/** Получить статус установки кооператива с приватными данными */
	getInstallationStatus: ModelTypes["InstallationStatus"],
	/** Получить список методов оплаты

Требуемые роли: chairman. Исключение: доступ разрешен, если `data.username` совпадает с `username` текущего пользователя. */
	getPaymentMethods: ModelTypes["PaymentMethodPaginationResult"],
	/** Получить конфигурацию программ регистрации для кооператива */
	getRegistrationConfig: ModelTypes["RegistrationConfig"],
	/** Получить сводную публичную информацию о системе */
	getSystemInfo: ModelTypes["SystemInfo"],
	/** Получить веб-пуш подписки пользователя

Требуемые роли: chairman, member.  */
	getUserWebPushSubscriptions: Array<ModelTypes["WebPushSubscriptionDto"]>,
	/** Получить статистику веб-пуш подписок (только для председателя)

Требуемые роли: chairman.  */
	getWebPushSubscriptionStats: ModelTypes["SubscriptionStatsDto"],
	/** Поиск приватных данных аккаунтов по запросу. Поиск осуществляется по полям ФИО, ИНН, ОГРН, наименованию организации и другим приватным данным.

Требуемые роли: chairman, member.  */
	searchPrivateAccounts: Array<ModelTypes["PrivateAccountSearchResult"]>
};
	/** Вопрос повестки собрания с результатами голосования */
["Question"]: {
		/** Контекст или дополнительная информация по вопросу */
	context: string,
	/** Имя аккаунта кооператива */
	coopname: string,
	/** Количество голосов "Воздержался" */
	counter_votes_abstained: number,
	/** Количество голосов "Против" */
	counter_votes_against: number,
	/** Количество голосов "За" */
	counter_votes_for: number,
	/** Предлагаемое решение по вопросу */
	decision: string,
	/** Уникальный идентификатор вопроса */
	id: number,
	/** Идентификатор собрания, к которому относится вопрос */
	meet_id: number,
	/** Порядковый номер вопроса в повестке */
	number: number,
	/** Заголовок вопроса */
	title: string,
	/** Список участников, проголосовавших "Воздержался" */
	voters_abstained: Array<string>,
	/** Список участников, проголосовавших "Против" */
	voters_against: Array<string>,
	/** Список участников, проголосовавших "За" */
	voters_for: Array<string>
};
	["RefundRequest"]: {
		/** Сумма CPU */
	cpu_amount: string,
	/** Сумма сети */
	net_amount: string,
	/** Владелец */
	owner: string,
	/** Время запроса */
	request_time: string
};
	["RegisterAccountInput"]: {
	/** Электронная почта */
	email: string,
	/** Данные индивидуального предпринимателя */
	entrepreneur_data?: ModelTypes["CreateEntrepreneurDataInput"] | undefined | null,
	/** Данные физического лица */
	individual_data?: ModelTypes["CreateIndividualDataInput"] | undefined | null,
	/** Данные организации */
	organization_data?: ModelTypes["CreateOrganizationDataInput"] | undefined | null,
	/** Публичный ключ */
	public_key: string,
	/** Имя аккаунта реферера */
	referer?: string | undefined | null,
	/** Тип аккаунта */
	type: ModelTypes["AccountType"],
	/** Имя пользователя */
	username: string
};
	["RegisteredAccount"]: {
		/** Информация об зарегистрированном аккаунте */
	account: ModelTypes["Account"],
	/** Токены доступа и обновления */
	tokens: ModelTypes["Tokens"]
};
	["RegistrationConfig"]: {
		/** Доступные программы */
	programs: Array<ModelTypes["RegistrationProgram"]>,
	/** Нужен ли выбор программы */
	requires_selection: boolean
};
	["RegistrationProgram"]: {
		/** Для каких типов аккаунтов доступна программа */
	applicable_account_types: Array<ModelTypes["AccountType"]>,
	/** Описание программы */
	description: string,
	/** URL изображения (опционально) */
	image_url?: string | undefined | null,
	/** Уникальный ключ программы */
	key: string,
	/** Порядок отображения */
	order: number,
	/** Минимальные требования для участия */
	requirements?: string | undefined | null,
	/** Название программы для отображения */
	title: string
};
	["RepresentedBy"]: {
		/** На основании чего действует */
	based_on: string,
	/** Имя */
	first_name: string,
	/** Фамилия */
	last_name: string,
	/** Отчество */
	middle_name: string,
	/** Должность */
	position: string
};
	["RepresentedByCertificate"]: {
		/** Имя */
	first_name: string,
	/** Фамилия */
	last_name: string,
	/** Отчество */
	middle_name: string,
	/** Должность */
	position: string
};
	["RepresentedByInput"]: {
	based_on: string,
	first_name: string,
	last_name: string,
	middle_name: string,
	position: string
};
	["ResourceDelegationDTO"]: {
		/** Вес CPU */
	cpu_weight: string,
	/** Отправитель */
	from: string,
	/** Вес сети */
	net_weight: string,
	/** Получатель */
	to: string
};
	["ResourceOverview"]: {
		/** Вес CPU */
	cpu_weight: string,
	/** Вес сети */
	net_weight: string,
	/** Владелец */
	owner: string,
	/** Используемая RAM */
	ram_bytes: number
};
	["ResultStatus"]:ResultStatus;
	["SbpAccount"]: {
		/** Мобильный телефон получателя */
	phone: string
};
	["SbpDataInput"]: {
	/** Мобильный телефон получателя */
	phone: string
};
	["SearchPrivateAccountsInput"]: {
	/** Поисковый запрос для поиска приватных аккаунтов */
	query: string
};
	["SegmentStatus"]:SegmentStatus;
	["SelectBranchGenerateDocumentInput"]: {
	/** Номер блока, на котором был создан документ */
	block_num?: number | undefined | null,
	/** Идентификатор имени аккаунта кооперативного участка */
	braname: string,
	/** Название кооператива, связанное с документом */
	coopname: string,
	/** Дата и время создания документа */
	created_at?: string | undefined | null,
	/** Имя генератора, использованного для создания документа */
	generator?: string | undefined | null,
	/** Язык документа */
	lang?: string | undefined | null,
	/** Ссылки, связанные с документом */
	links?: Array<string> | undefined | null,
	/** Часовой пояс, в котором был создан документ */
	timezone?: string | undefined | null,
	/** Название документа */
	title?: string | undefined | null,
	/** Имя пользователя, создавшего документ */
	username: string,
	/** Версия генератора, использованного для создания документа */
	version?: string | undefined | null
};
	["SelectBranchInput"]: {
	/** Имя аккаунта кооперативного участка */
	braname: string,
	/** Имя аккаунта кооператива */
	coopname: string,
	/** Подписанный электронный документ (generateSelectBranchDocument) */
	document: ModelTypes["SelectBranchSignedDocumentInput"],
	/** Имя аккаунта пользователя */
	username: string
};
	["SelectBranchSignedDocumentInput"]: {
	/** Хэш содержимого документа */
	doc_hash: string,
	/** Общий хэш (doc_hash + meta_hash) */
	hash: string,
	/** Метаинформация для документа выбора кооперативного участка */
	meta: ModelTypes["SelectBranchSignedMetaDocumentInput"],
	/** Хэш мета-данных */
	meta_hash: string,
	/** Вектор подписей */
	signatures: Array<ModelTypes["SignatureInfoInput"]>,
	/** Версия стандарта документа */
	version: string
};
	["SelectBranchSignedMetaDocumentInput"]: {
	/** Номер блока, на котором был создан документ */
	block_num: number,
	/** Идентификатор имени аккаунта кооперативного участка */
	braname: string,
	/** Название кооператива, связанное с документом */
	coopname: string,
	/** Дата и время создания документа */
	created_at: string,
	/** Имя генератора, использованного для создания документа */
	generator: string,
	/** Язык документа */
	lang: string,
	/** Ссылки, связанные с документом */
	links: Array<string>,
	/** ID документа в реестре */
	registry_id: number,
	/** Часовой пояс, в котором был создан документ */
	timezone: string,
	/** Название документа */
	title: string,
	/** Имя пользователя, создавшего документ */
	username: string,
	/** Версия генератора, использованного для создания документа */
	version: string
};
	["SetVarsInput"]: {
	confidential_email: string,
	confidential_link: string,
	contact_email: string,
	coopenomics_agreement?: ModelTypes["AgreementVarInput"] | undefined | null,
	coopname: string,
	full_abbr: string,
	full_abbr_dative: string,
	full_abbr_genitive: string,
	name: string,
	participant_application?: ModelTypes["AgreementVarInput"] | undefined | null,
	passport_request?: string | undefined | null,
	privacy_agreement?: ModelTypes["AgreementVarInput"] | undefined | null,
	short_abbr: string,
	signature_agreement?: ModelTypes["AgreementVarInput"] | undefined | null,
	statute_link: string,
	user_agreement?: ModelTypes["AgreementVarInput"] | undefined | null,
	wallet_agreement?: ModelTypes["AgreementVarInput"] | undefined | null,
	website: string
};
	["SetWifInput"]: {
	/** Тип разрешения ключа */
	permission: string,
	/** Имя пользователя, чей ключ */
	username: string,
	/** Приватный ключ */
	wif: string
};
	["Settings"]: {
		/** Маршрут по умолчанию для авторизованных пользователей */
	authorized_default_route: string,
	/** Рабочий стол по умолчанию для авторизованных пользователей */
	authorized_default_workspace: string,
	/** Название кооператива */
	coopname: string,
	/** Дата создания */
	created_at: ModelTypes["DateTime"],
	/** Маршрут по умолчанию для неавторизованных пользователей */
	non_authorized_default_route: string,
	/** Рабочий стол по умолчанию для неавторизованных пользователей */
	non_authorized_default_workspace: string,
	/** Имя провайдера платежей по умолчанию */
	provider_name: string,
	/** Дата последнего обновления */
	updated_at: ModelTypes["DateTime"]
};
	["SignatureInfo"]: {
		id: number,
	is_valid?: boolean | undefined | null,
	meta: ModelTypes["JSON"],
	public_key: string,
	signature: string,
	signed_at: string,
	signed_hash: string,
	signer: string,
	/** Сертификат подписанта (сокращенная информация) */
	signer_certificate?: ModelTypes["UserCertificateUnion"] | undefined | null
};
	["SignatureInfoInput"]: {
	/** Идентификатор номера подписи */
	id: number,
	/** Мета-данные подписи */
	meta: string,
	/** Публичный ключ */
	public_key: string,
	/** Подпись хэша */
	signature: string,
	/** Время подписания */
	signed_at: string,
	/** Подписанный хэш */
	signed_hash: string,
	/** Аккаунт подписавшего */
	signer: string
};
	["SignedBlockchainDocument"]: {
		/** Хэш содержимого документа */
	doc_hash: string,
	/** Общий хэш (doc_hash + meta_hash) */
	hash: string,
	/** Метаинформация документа (в формате JSON-строки) */
	meta: string,
	/** Хэш мета-данных */
	meta_hash: string,
	/** Вектор подписей */
	signatures: Array<ModelTypes["SignatureInfo"]>,
	/** Версия стандарта документа */
	version: string
};
	["SignedDigitalDocument"]: {
		doc_hash: string,
	hash: string,
	meta: ModelTypes["JSON"],
	meta_hash: string,
	signatures: Array<ModelTypes["SignatureInfo"]>,
	version: string
};
	["SovietMemberInput"]: {
	individual_data: ModelTypes["CreateSovietIndividualDataInput"],
	role: string
};
	["StartInstallInput"]: {
	/** Приватный ключ кооператива */
	wif: string
};
	["StartInstallResult"]: {
		/** Имя кооператива */
	coopname: string,
	/** Код установки для дальнейших операций */
	install_code: string
};
	/** Комплексный объект цифрового документа заявления (или другого ведущего документа для цепочки принятия решений совета) с агрегатом документа */
["StatementDetailAggregate"]: {
		action: ModelTypes["ExtendedBlockchainAction"],
	documentAggregate: ModelTypes["DocumentAggregate"]
};
	["StoryStatus"]:StoryStatus;
	["SubscriptionStatsDto"]: {
		/** Количество активных подписок */
	active: number,
	/** Количество неактивных подписок */
	inactive: number,
	/** Общее количество подписок */
	total: number,
	/** Количество уникальных пользователей */
	uniqueUsers: number
};
	["Symbols"]: {
		/** Точность символа управления */
	root_govern_precision: number,
	/** Символ управления блокчейном */
	root_govern_symbol: string,
	/** Точность корневого символа */
	root_precision: number,
	/** Корневой символ блокчейна */
	root_symbol: string
};
	["SystemFeatures"]: {
		/** Доступен ли полнотекстовый поиск по документам */
	search: boolean
};
	["SystemInfo"]: {
		/** Объект системного аккаунта кооператива в блокчейне */
	blockchain_account: ModelTypes["BlockchainAccount"],
	/** Набор данных с информацией о состоянии блокчейна */
	blockchain_info: ModelTypes["BlockchainInfoDTO"],
	/** Члены совета кооператива */
	board_members?: Array<ModelTypes["BoardMember"]> | undefined | null,
	/** Контакты кооператива */
	contacts?: ModelTypes["ContactsDTO"] | undefined | null,
	/** Объект аккаунта кооператива у оператора */
	cooperator_account: ModelTypes["CooperativeOperatorAccount"],
	/** Имя аккаунта кооператива */
	coopname: string,
	/** Доступные функции платформы */
	features: ModelTypes["SystemFeatures"],
	/** Доступен ли функционал провайдера для подписок и запуска ПО */
	is_providered: boolean,
	/** Требуется ли членство в союзе кооперативов для подключения к кооперативной экономике */
	is_unioned: boolean,
	/** Настройки системы */
	settings: ModelTypes["Settings"],
	/** Символы и их точности блокчейна */
	symbols: ModelTypes["Symbols"],
	/** Статус контроллера кооператива */
	system_status: ModelTypes["SystemStatus"],
	/** Ссылка на анкету для получения членства в союзе кооперативов */
	union_link: string,
	/** Переменные кооператива */
	vars?: ModelTypes["Vars"] | undefined | null
};
	["SystemStatus"]:SystemStatus;
	["Token"]: {
		/** Дата истечения токена доступа */
	expires: ModelTypes["DateTime"],
	/** Токен доступа */
	token: string
};
	["Tokens"]: {
		/** Токен доступа */
	access: ModelTypes["Token"],
	/** Токен обновления */
	refresh: ModelTypes["Token"]
};
	["TranscriptionSegment"]: {
		createdAt: ModelTypes["DateTime"],
	endOffset: number,
	id: string,
	/** Канонический Matrix user id (@localpart:server) */
	speakerIdentity: string,
	/** Отображаемое имя из Synapse (displayname) */
	speakerName: string,
	startOffset: number,
	text: string
};
	["TranscriptionStatus"]:TranscriptionStatus;
	["UninstallExtensionInput"]: {
	/** Фильтр по имени */
	name: string
};
	["Update"]: {
	/** Собственные данные кооператива, обслуживающего экземпляр платформы */
	organization_data?: ModelTypes["UpdateOrganizationDataInput"] | undefined | null,
	/** Переменные кооператива, используемые для заполнения шаблонов документов */
	vars?: ModelTypes["VarsInput"] | undefined | null
};
	["UpdateAccountInput"]: {
	/** Данные индивидуального предпринимателя */
	entrepreneur_data?: ModelTypes["UpdateEntrepreneurDataInput"] | undefined | null,
	/** Данные физического лица */
	individual_data?: ModelTypes["UpdateIndividualDataInput"] | undefined | null,
	/** Данные организации */
	organization_data?: ModelTypes["UpdateOrganizationDataInput"] | undefined | null,
	/** Публичный ключ */
	public_key?: string | undefined | null,
	/** Имя аккаунта реферера */
	referer?: string | undefined | null,
	/** Имя пользователя */
	username: string
};
	["UpdateBankAccountInput"]: {
	/** Данные банковского счёта */
	data: ModelTypes["BankAccountInput"],
	/** Флаг основного метода платежа, который отображается в документах */
	is_default: boolean,
	/** Идентификатор платежного метода */
	method_id: string,
	/** Имя аккаунта пользователя */
	username: string
};
	["UpdateEntrepreneurDataInput"]: {
	/** Дата рождения */
	birthdate: string,
	/** Город */
	city: string,
	/** Страна */
	country: ModelTypes["Country"],
	/** Детали индивидуального предпринимателя */
	details: ModelTypes["EntrepreneurDetailsInput"],
	/** Электронная почта */
	email: string,
	/** Имя */
	first_name: string,
	/** Полный адрес */
	full_address: string,
	/** Фамилия */
	last_name: string,
	/** Отчество */
	middle_name: string,
	/** Телефон */
	phone: string,
	/** Имя пользователя */
	username: string
};
	["UpdateIndividualDataInput"]: {
	/** Дата рождения */
	birthdate: string,
	/** Электронная почта */
	email: string,
	/** Имя */
	first_name: string,
	/** Полный адрес */
	full_address: string,
	/** Фамилия */
	last_name: string,
	/** Отчество */
	middle_name: string,
	/** Данные паспорта */
	passport?: ModelTypes["PassportInput"] | undefined | null,
	/** Телефон */
	phone: string,
	/** Имя пользователя */
	username: string
};
	["UpdateOrganizationDataInput"]: {
	/** Город */
	city: string,
	/** Страна */
	country: string,
	/** Детали организации */
	details: ModelTypes["OrganizationDetailsInput"],
	/** Электронная почта */
	email: string,
	/** Фактический адрес */
	fact_address: string,
	/** Полный адрес */
	full_address: string,
	/** Полное наименование организации */
	full_name: string,
	/** Телефон */
	phone: string,
	/** Представитель организации */
	represented_by: ModelTypes["RepresentedByInput"],
	/** Краткое наименование организации */
	short_name: string,
	/** Тип организации */
	type: string,
	/** Имя пользователя */
	username: string
};
	["UpdateSettingsInput"]: {
	/** Маршрут по умолчанию для авторизованных пользователей */
	authorized_default_route?: string | undefined | null,
	/** Рабочий стол по умолчанию для авторизованных пользователей */
	authorized_default_workspace?: string | undefined | null,
	/** Маршрут по умолчанию для неавторизованных пользователей */
	non_authorized_default_route?: string | undefined | null,
	/** Рабочий стол по умолчанию для неавторизованных пользователей */
	non_authorized_default_workspace?: string | undefined | null,
	/** Имя провайдера платежей по умолчанию */
	provider_name?: string | undefined | null
};
	["UserAccount"]: {
		/** Метаинформация */
	meta: string,
	/** Реферал */
	referer: string,
	/** Дата регистрации */
	registered_at: string,
	/** Регистратор */
	registrator: string,
	/** Статус аккаунта */
	status: string,
	/** Список хранилищ */
	storages: Array<string>,
	/** Тип учетной записи */
	type: string,
	/** Имя аккаунта */
	username: string,
	/** Дата регистрации */
	verifications: Array<ModelTypes["Verification"]>
};
	/** Объединение сертификатов пользователей (сокращенная информация) */
["UserCertificateUnion"]:ModelTypes["EntrepreneurCertificate"] | ModelTypes["IndividualCertificate"] | ModelTypes["OrganizationCertificate"];
	["UserStatus"]:UserStatus;
	["Vars"]: {
		confidential_email: string,
	confidential_link: string,
	contact_email: string,
	coopenomics_agreement?: ModelTypes["AgreementVar"] | undefined | null,
	coopname: string,
	full_abbr: string,
	full_abbr_dative: string,
	full_abbr_genitive: string,
	name: string,
	participant_application?: ModelTypes["AgreementVar"] | undefined | null,
	passport_request: string,
	privacy_agreement?: ModelTypes["AgreementVar"] | undefined | null,
	short_abbr: string,
	signature_agreement?: ModelTypes["AgreementVar"] | undefined | null,
	statute_link?: string | undefined | null,
	user_agreement?: ModelTypes["AgreementVar"] | undefined | null,
	wallet_agreement?: ModelTypes["AgreementVar"] | undefined | null,
	website: string
};
	["VarsInput"]: {
	confidential_email: string,
	confidential_link: string,
	contact_email: string,
	coopenomics_agreement?: ModelTypes["AgreementInput"] | undefined | null,
	coopname: string,
	full_abbr: string,
	full_abbr_dative: string,
	full_abbr_genitive: string,
	name: string,
	participant_application: ModelTypes["AgreementInput"],
	passport_request: string,
	privacy_agreement: ModelTypes["AgreementInput"],
	short_abbr: string,
	signature_agreement: ModelTypes["AgreementInput"],
	statute_link: string,
	user_agreement: ModelTypes["AgreementInput"],
	wallet_agreement: ModelTypes["AgreementInput"],
	website: string
};
	["Verification"]: {
		/** Дата создания верификации */
	created_at: string,
	/** Флаг верификации */
	is_verified: boolean,
	/** Дата последнего обновления верификации */
	last_update: string,
	/** Заметка верификации */
	notice: string,
	/** Процедура верификации */
	procedure: string,
	/** Имя верификатора */
	verificator: string
};
	["WaitWeight"]: {
		/** Время ожидания в секундах */
	wait_sec: number,
	/** Вес */
	weight: number
};
	["WebPushSubscriptionDataInput"]: {
	/** Endpoint для отправки уведомлений */
	endpoint: string,
	/** Ключи для шифрования */
	keys: ModelTypes["WebPushSubscriptionKeysInput"]
};
	["WebPushSubscriptionDto"]: {
		/** Auth ключ для аутентификации */
	authKey: string,
	/** Дата создания подписки */
	createdAt: ModelTypes["DateTime"],
	/** Endpoint для отправки уведомлений */
	endpoint: string,
	/** Уникальный идентификатор подписки */
	id: string,
	/** Активна ли подписка */
	isActive: boolean,
	/** P256DH ключ для шифрования */
	p256dhKey: string,
	/** Дата последнего обновления */
	updatedAt: ModelTypes["DateTime"],
	/** User Agent браузера */
	userAgent?: string | undefined | null,
	/** Username пользователя */
	username: string
};
	["WebPushSubscriptionKeysInput"]: {
	/** Auth ключ для аутентификации */
	auth: string,
	/** P256DH ключ для шифрования */
	p256dh: string
};
	["schema"]: {
	query?: ModelTypes["Query"] | undefined | null,
	mutation?: ModelTypes["Mutation"] | undefined | null
};
	["ID"]:any
    }

export type GraphQLTypes = {
    // ------------------------------------------------------;
	// THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY);
	// ------------------------------------------------------;
	["Account"]: {
	__typename: "Account",
	/** объект аккаунта в блокчейне содержит системную информацию, такую как публичные ключи доступа, доступные вычислительные ресурсы, информация об установленном смарт-контракте, и т.д. и т.п. Это системный уровень обслуживания, где у каждого пайщика есть аккаунт, но не каждый аккаунт может быть пайщиком в каком-либо кооперативе. Все смарт-контракты устанавливаются и исполняются на этом уровне. */
	blockchain_account?: GraphQLTypes["BlockchainAccount"] | undefined | null,
	/** объект пайщика кооператива в таблице блокчейне, который определяет членство пайщика в конкретном кооперативе. Поскольку MONO обслуживает только один кооператив, то в participant_account обычно содержится информация, которая описывает членство пайщика в этом кооперативе. Этот объект обезличен, публичен, и хранится в блокчейне. */
	participant_account?: GraphQLTypes["ParticipantAccount"] | undefined | null,
	/** объект приватных данных пайщика кооператива. */
	private_account?: GraphQLTypes["PrivateAccount"] | undefined | null,
	/** объект аккаунта в системе учёта провайдера, т.е. MONO. Здесь хранится приватная информация о пайщике кооператива, которая содержит его приватные данные. Эти данные не публикуются в блокчейне и не выходят за пределы базы данных провайдера. Они используются для заполнения шаблонов документов при нажатии соответствующих кнопок на платформе.  */
	provider_account?: GraphQLTypes["MonoAccount"] | undefined | null,
	/** объект пользователя кооперативной экономики содержит в блокчейне информацию о типе аккаунта пайщика, а также, обезличенные публичные данные (хэши) для верификации пайщиков между кооперативами. Этот уровень предназначен для хранения информации пайщика, которая необходима всем кооперативам, но не относится к какому-либо из них конкретно. */
	user_account?: GraphQLTypes["UserAccount"] | undefined | null,
	/** Имя аккаунта кооператива */
	username: string,
	['...on Account']: Omit<GraphQLTypes["Account"], "...on Account">
};
	["AccountRamDelta"]: {
	__typename: "AccountRamDelta",
	account: string,
	delta: number,
	['...on AccountRamDelta']: Omit<GraphQLTypes["AccountRamDelta"], "...on AccountRamDelta">
};
	["AccountResourceInfo"]: {
	__typename: "AccountResourceInfo",
	/** Доступные ресурсы */
	available: string,
	/** Текущее использование ресурсов */
	current_used?: string | undefined | null,
	/** Время последнего обновления использования ресурсов */
	last_usage_update_time?: string | undefined | null,
	/** Максимальное количество ресурсов */
	max: string,
	/** Использовано ресурсов */
	used: string,
	['...on AccountResourceInfo']: Omit<GraphQLTypes["AccountResourceInfo"], "...on AccountResourceInfo">
};
	/** Тип аккаунта пользователя в системе */
["AccountType"]: AccountType;
	["AccountsPaginationResult"]: {
	__typename: "AccountsPaginationResult",
	/** Текущая страница */
	currentPage: number,
	/** Элементы текущей страницы */
	items: Array<GraphQLTypes["Account"]>,
	/** Общее количество элементов */
	totalCount: number,
	/** Общее количество страниц */
	totalPages: number,
	['...on AccountsPaginationResult']: Omit<GraphQLTypes["AccountsPaginationResult"], "...on AccountsPaginationResult">
};
	/** Комплексный объект акта, содержащий полную информацию о сгенерированном и опубликованном документе с его агрегатом */
["ActDetailAggregate"]: {
	__typename: "ActDetailAggregate",
	action?: GraphQLTypes["ExtendedBlockchainAction"] | undefined | null,
	documentAggregate?: GraphQLTypes["DocumentAggregate"] | undefined | null,
	['...on ActDetailAggregate']: Omit<GraphQLTypes["ActDetailAggregate"], "...on ActDetailAggregate">
};
	["ActionAuthorization"]: {
	__typename: "ActionAuthorization",
	actor: string,
	permission: string,
	['...on ActionAuthorization']: Omit<GraphQLTypes["ActionAuthorization"], "...on ActionAuthorization">
};
	["ActionReceipt"]: {
	__typename: "ActionReceipt",
	abi_sequence: number,
	act_digest: string,
	auth_sequence: Array<GraphQLTypes["AuthSequence"]>,
	code_sequence: number,
	global_sequence: string,
	receiver: string,
	recv_sequence: string,
	['...on ActionReceipt']: Omit<GraphQLTypes["ActionReceipt"], "...on ActionReceipt">
};
	["AddPaymentMethodInput"]: {
		/** Данные для банковского перевода */
	bank_transfer_data?: GraphQLTypes["BankAccountInput"] | undefined | null,
	/** Флаг основного метода платежа, который отображается в документах */
	is_default: boolean,
	/** Данные для оплаты через СБП */
	sbp_data?: GraphQLTypes["SbpDataInput"] | undefined | null,
	/** Имя аккаунта пользователя */
	username: string
};
	["AddTrustedAccountInput"]: {
		/** Имя аккаунта кооперативного участка */
	braname: string,
	/** Имя аккаунта кооператива */
	coopname: string,
	/** Имя аккаунта доверонного лица, который уполномачивается председателем кооперативного участка на совершение действий */
	trusted: string
};
	/** Пункт повестки собрания */
["AgendaMeetPoint"]: {
	__typename: "AgendaMeetPoint",
	/** Контекст или дополнительная информация по пункту повестки */
	context: string,
	/** Предлагаемое решение по пункту повестки */
	decision: string,
	/** Заголовок пункта повестки */
	title: string,
	['...on AgendaMeetPoint']: Omit<GraphQLTypes["AgendaMeetPoint"], "...on AgendaMeetPoint">
};
	/** Соглашение пользователя с кооперативом */
["Agreement"]: {
	__typename: "Agreement",
	/** Дата создания записи */
	_created_at: GraphQLTypes["DateTime"],
	/** Внутренний ID базы данных */
	_id: string,
	/** Дата последнего обновления записи */
	_updated_at: GraphQLTypes["DateTime"],
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?: number | undefined | null,
	/** Название кооператива */
	coopname?: string | undefined | null,
	/** Документ соглашения */
	document?: GraphQLTypes["DocumentAggregate"] | undefined | null,
	/** ID черновика */
	draft_id?: number | undefined | null,
	/** ID соглашения в блокчейне */
	id?: number | undefined | null,
	/** Флаг присутствия записи в блокчейне */
	present: boolean,
	/** ID программы */
	program_id?: number | undefined | null,
	/** Статус соглашения */
	status: GraphQLTypes["AgreementStatus"],
	/** Тип соглашения */
	type?: string | undefined | null,
	/** Дата последнего обновления в блокчейне */
	updated_at?: GraphQLTypes["DateTime"] | undefined | null,
	/** Имя пользователя, создавшего соглашение */
	username?: string | undefined | null,
	/** Версия соглашения */
	version?: number | undefined | null,
	['...on Agreement']: Omit<GraphQLTypes["Agreement"], "...on Agreement">
};
	["AgreementInput"]: {
		protocol_day_month_year: string,
	protocol_number: string
};
	/** Статус соглашения в системе кооператива */
["AgreementStatus"]: AgreementStatus;
	["AgreementVar"]: {
	__typename: "AgreementVar",
	protocol_day_month_year: string,
	protocol_number: string,
	['...on AgreementVar']: Omit<GraphQLTypes["AgreementVar"], "...on AgreementVar">
};
	["AgreementVarInput"]: {
		protocol_day_month_year: string,
	protocol_number: string
};
	/** Одобрение документа председателем совета */
["Approval"]: {
	__typename: "Approval",
	/** Дата создания записи */
	_created_at: GraphQLTypes["DateTime"],
	/** Внутренний ID базы данных */
	_id: string,
	/** Дата последнего обновления записи */
	_updated_at: GraphQLTypes["DateTime"],
	/** Хеш одобрения для идентификации */
	approval_hash: string,
	/** Одобренный документ (заполняется при подтверждении одобрения) */
	approved_document?: GraphQLTypes["DocumentAggregate"] | undefined | null,
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?: number | undefined | null,
	/** Действие обратного вызова при одобрении */
	callback_action_approve: string,
	/** Действие обратного вызова при отклонении */
	callback_action_decline: string,
	/** Контракт обратного вызова для обработки результата */
	callback_contract: string,
	/** Название кооператива */
	coopname: string,
	/** Дата создания одобрения */
	created_at: GraphQLTypes["DateTime"],
	/** Документ, требующий одобрения */
	document?: GraphQLTypes["DocumentAggregate"] | undefined | null,
	/** ID одобрения в блокчейне */
	id?: number | undefined | null,
	/** Метаданные одобрения в формате JSON */
	meta: string,
	/** Флаг присутствия записи в блокчейне */
	present: boolean,
	/** Статус одобрения */
	status: GraphQLTypes["ApprovalStatus"],
	/** Имя пользователя, запросившего одобрение */
	username: string,
	['...on Approval']: Omit<GraphQLTypes["Approval"], "...on Approval">
};
	/** Статус одобрения в системе CHAIRMAN */
["ApprovalStatus"]: ApprovalStatus;
	["AuthSequence"]: {
	__typename: "AuthSequence",
	account: string,
	sequence: string,
	['...on AuthSequence']: Omit<GraphQLTypes["AuthSequence"], "...on AuthSequence">
};
	["Authority"]: {
	__typename: "Authority",
	/** Уровни разрешений */
	accounts: Array<GraphQLTypes["PermissionLevelWeight"]>,
	/** Ключи */
	keys: Array<GraphQLTypes["KeyWeight"]>,
	/** Порог */
	threshold: number,
	/** Вес ожидания */
	waits: Array<GraphQLTypes["WaitWeight"]>,
	['...on Authority']: Omit<GraphQLTypes["Authority"], "...on Authority">
};
	["BankAccount"]: {
	__typename: "BankAccount",
	/** Номер банковского счета */
	account_number: string,
	/** Название банка */
	bank_name: string,
	/** Номер карты */
	card_number?: string | undefined | null,
	/** Валюта счета */
	currency: string,
	/** Детали счета */
	details: GraphQLTypes["BankAccountDetails"],
	['...on BankAccount']: Omit<GraphQLTypes["BankAccount"], "...on BankAccount">
};
	["BankAccountDetails"]: {
	__typename: "BankAccountDetails",
	/** БИК банка */
	bik: string,
	/** Корреспондентский счет */
	corr: string,
	/** КПП банка */
	kpp: string,
	['...on BankAccountDetails']: Omit<GraphQLTypes["BankAccountDetails"], "...on BankAccountDetails">
};
	["BankAccountDetailsInput"]: {
		/** БИК банка */
	bik: string,
	/** Корреспондентский счет */
	corr: string,
	/** КПП банка */
	kpp: string
};
	["BankAccountInput"]: {
		/** Номер банковского счета */
	account_number: string,
	/** Название банка */
	bank_name: string,
	/** Номер карты */
	card_number?: string | undefined | null,
	/** Валюта счета */
	currency: string,
	/** Детали счета */
	details: GraphQLTypes["BankAccountDetailsInput"]
};
	["BankPaymentMethod"]: {
	__typename: "BankPaymentMethod",
	/** Дата создания */
	created_at: GraphQLTypes["DateTime"],
	/** Данные метода оплаты */
	data: GraphQLTypes["BankAccount"],
	/** Флаг основного метода платежа, который отображается в документах */
	is_default: boolean,
	/** Идентификатор метода оплаты */
	method_id: string,
	/** Тип метода оплаты */
	method_type: string,
	/** Дата обновления */
	updated_at: GraphQLTypes["DateTime"],
	/** Имя пользователя, к которому привязан метод оплаты */
	username: string,
	['...on BankPaymentMethod']: Omit<GraphQLTypes["BankPaymentMethod"], "...on BankPaymentMethod">
};
	/** Базовый проект в системе CAPITAL */
["BaseCapitalProject"]: {
	__typename: "BaseCapitalProject",
	/** Дата создания записи */
	_created_at: GraphQLTypes["DateTime"],
	/** Внутренний ID базы данных */
	_id: string,
	/** Дата последнего обновления записи */
	_updated_at: GraphQLTypes["DateTime"],
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?: number | undefined | null,
	/** Статус из блокчейна */
	blockchain_status: string,
	/** Название кооператива */
	coopname: string,
	/** Счетчики участников проекта */
	counts: GraphQLTypes["CapitalProjectCountsData"],
	/** Дата создания */
	created_at: string,
	/** Данные CRPS для распределения наград проекта */
	crps: GraphQLTypes["CapitalProjectCrpsData"],
	/** Данные/шаблон проекта */
	data: string,
	/** Описание проекта */
	description: string,
	/** Фактические показатели проекта */
	fact: GraphQLTypes["CapitalProjectFactPool"],
	/** ID в блокчейне */
	id: number,
	/** Приглашение к проекту */
	invite: string,
	/** Открыт ли проект */
	is_opened: boolean,
	/** Запланирован ли проект */
	is_planed: boolean,
	/** Счетчик задач проекта */
	issue_counter: number,
	/** Мастер проекта */
	master: string,
	/** Мета-информация проекта */
	meta: string,
	/** Хеш родительского проекта */
	parent_hash: string,
	/** Название родительского проекта */
	parent_title?: string | undefined | null,
	/** Права доступа текущего пользователя к проекту */
	permissions: GraphQLTypes["CapitalProjectPermissions"],
	/** Плановые показатели проекта */
	plan: GraphQLTypes["CapitalProjectPlanPool"],
	/** Префикс проекта */
	prefix: string,
	/** Флаг присутствия записи в блокчейне */
	present: boolean,
	/** Хеш проекта */
	project_hash: string,
	/** Статус проекта */
	status: GraphQLTypes["ProjectStatus"],
	/** Название проекта */
	title: string,
	/** Данные голосования по методу Водянова */
	voting: GraphQLTypes["CapitalProjectVotingData"],
	['...on BaseCapitalProject']: Omit<GraphQLTypes["BaseCapitalProject"], "...on BaseCapitalProject">
};
	["BlockchainAccount"]: {
	__typename: "BlockchainAccount",
	/** Имя аккаунта */
	account_name: string,
	/** Баланс */
	core_liquid_balance?: string | undefined | null,
	/** Ограничения CPU */
	cpu_limit: GraphQLTypes["AccountResourceInfo"],
	/** Вес CPU */
	cpu_weight: string,
	/** Дата создания */
	created: string,
	/** Номер последнего блока */
	head_block_num: number,
	/** Время последнего блока */
	head_block_time: string,
	/** Время последнего обновления кода */
	last_code_update: string,
	/** Ограничения сети */
	net_limit: GraphQLTypes["AccountResourceInfo"],
	/** Вес сети */
	net_weight: string,
	/** Разрешения */
	permissions: Array<GraphQLTypes["Permission"]>,
	/** Флаг привилегий */
	privileged: boolean,
	/** Квота RAM */
	ram_quota: number,
	/** Использование RAM */
	ram_usage: number,
	/** Запрос на возврат */
	refund_request?: GraphQLTypes["RefundRequest"] | undefined | null,
	/** Информация о REX */
	rex_info?: string | undefined | null,
	/** Делегированные ресурсы */
	self_delegated_bandwidth?: GraphQLTypes["ResourceDelegationDTO"] | undefined | null,
	/** Общий обзор ресурсов */
	total_resources?: GraphQLTypes["ResourceOverview"] | undefined | null,
	/** Информация о голосовании */
	voter_info?: string | undefined | null,
	['...on BlockchainAccount']: Omit<GraphQLTypes["BlockchainAccount"], "...on BlockchainAccount">
};
	/** Объект действия в блокчейне */
["BlockchainAction"]: {
	__typename: "BlockchainAction",
	account: string,
	account_ram_deltas: Array<GraphQLTypes["AccountRamDelta"]>,
	action_ordinal: number,
	authorization: Array<GraphQLTypes["ActionAuthorization"]>,
	block_id: string,
	block_num: number,
	chain_id: string,
	console: string,
	context_free: boolean,
	creator_action_ordinal: number,
	/** Данные действия в формате JSON */
	data: GraphQLTypes["JSON"],
	elapsed: number,
	global_sequence: string,
	name: string,
	receipt: GraphQLTypes["ActionReceipt"],
	receiver: string,
	transaction_id: string,
	['...on BlockchainAction']: Omit<GraphQLTypes["BlockchainAction"], "...on BlockchainAction">
};
	/** Запись в таблице блокчейна о процессе принятия решения советом кооператива */
["BlockchainDecision"]: {
	__typename: "BlockchainDecision",
	approved: boolean,
	authorization: GraphQLTypes["SignedBlockchainDocument"],
	authorized: boolean,
	authorized_by: string,
	batch_id: number,
	callback_contract?: string | undefined | null,
	confirm_callback?: string | undefined | null,
	coopname: string,
	created_at: string,
	decline_callback?: string | undefined | null,
	expired_at: string,
	hash?: string | undefined | null,
	id: number,
	meta: string,
	statement: GraphQLTypes["SignedBlockchainDocument"],
	type: string,
	username: string,
	/** Сертификат пользователя, создавшего решение */
	username_certificate?: GraphQLTypes["UserCertificateUnion"] | undefined | null,
	validated: boolean,
	votes_against: Array<string>,
	/** Сертификаты пользователей, голосовавших "против" */
	votes_against_certificates: Array<GraphQLTypes["UserCertificateUnion"]>,
	votes_for: Array<string>,
	/** Сертификаты пользователей, голосовавших "за" */
	votes_for_certificates: Array<GraphQLTypes["UserCertificateUnion"]>,
	['...on BlockchainDecision']: Omit<GraphQLTypes["BlockchainDecision"], "...on BlockchainDecision">
};
	/** Информация о состоянии блокчейна */
["BlockchainInfoDTO"]: {
	__typename: "BlockchainInfoDTO",
	/** Лимит CPU для блока */
	block_cpu_limit: number,
	/** Лимит сети для блока */
	block_net_limit: number,
	/** Идентификатор цепочки (chain ID) */
	chain_id: string,
	/** Идентификатор головного блока в форк базе данных */
	fork_db_head_block_id?: string | undefined | null,
	/** Номер головного блока в форк базе данных */
	fork_db_head_block_num?: number | undefined | null,
	/** Идентификатор головного блока */
	head_block_id: string,
	/** Номер головного блока */
	head_block_num: number,
	/** Прозводитель головного блока */
	head_block_producer: string,
	/** Время головного блока */
	head_block_time: string,
	/** Идентификатор последнего необратимого блока */
	last_irreversible_block_id: string,
	/** Номер последнего необратимого блока */
	last_irreversible_block_num: number,
	/** Время последнего необратимого блока */
	last_irreversible_block_time?: string | undefined | null,
	/** Версия сервера */
	server_version: string,
	/** Строковое представление версии сервера */
	server_version_string?: string | undefined | null,
	/** Виртуальный лимит CPU для блока */
	virtual_block_cpu_limit: number,
	/** Виртуальный лимит сети для блока */
	virtual_block_net_limit: number,
	['...on BlockchainInfoDTO']: Omit<GraphQLTypes["BlockchainInfoDTO"], "...on BlockchainInfoDTO">
};
	["BoardMember"]: {
	__typename: "BoardMember",
	/** Имя */
	first_name: string,
	/** Флаг председателя совета */
	is_chairman: boolean,
	/** Фамилия */
	last_name: string,
	/** Отчество */
	middle_name?: string | undefined | null,
	/** Имя пользователя (username) */
	username: string,
	['...on BoardMember']: Omit<GraphQLTypes["BoardMember"], "...on BoardMember">
};
	["Branch"]: {
	__typename: "Branch",
	/** Банковский счёт */
	bank_account: GraphQLTypes["BankPaymentMethod"],
	/** Уникальное имя кооперативного участка */
	braname: string,
	/** Город */
	city: string,
	/** Имя аккаунта кооператива */
	coopname: string,
	/** Страна */
	country: string,
	/** Детали организации */
	details: GraphQLTypes["OrganizationDetails"],
	/** Email */
	email: string,
	/** Фактический адрес */
	fact_address: string,
	/** Полный адрес */
	full_address: string,
	/** Полное название организации */
	full_name: string,
	/** Телефон */
	phone: string,
	/** Представитель организации */
	represented_by: GraphQLTypes["RepresentedBy"],
	/** Краткое название организации */
	short_name: string,
	/** Доверенные аккаунты

Требуемые роли: chairman, member.  */
	trusted: Array<GraphQLTypes["Individual"]>,
	/** Председатель кооперативного участка

Требуемые роли: chairman, member.  */
	trustee: GraphQLTypes["Individual"],
	/** Тип организации */
	type: string,
	['...on Branch']: Omit<GraphQLTypes["Branch"], "...on Branch">
};
	["CallTranscription"]: {
	__typename: "CallTranscription",
	createdAt: GraphQLTypes["DateTime"],
	endedAt?: GraphQLTypes["DateTime"] | undefined | null,
	id: string,
	matrixRoomId: string,
	/** Пользовательская заметка о содержании звонка */
	memo: string,
	/** Отображаемые имена участников (Synapse displayname); в БД хранятся канонические Matrix user id */
	participants: Array<string>,
	roomId: string,
	roomName: string,
	startedAt: GraphQLTypes["DateTime"],
	status: GraphQLTypes["TranscriptionStatus"],
	updatedAt: GraphQLTypes["DateTime"],
	['...on CallTranscription']: Omit<GraphQLTypes["CallTranscription"], "...on CallTranscription">
};
	["Candidate"]: {
	__typename: "Candidate",
	braname?: string | undefined | null,
	coopname: string,
	created_at: GraphQLTypes["DateTime"],
	program_key?: string | undefined | null,
	public_key: string,
	referer?: string | undefined | null,
	referer_display_name?: string | undefined | null,
	registered_at?: GraphQLTypes["DateTime"] | undefined | null,
	status: GraphQLTypes["CandidateStatus"],
	type: string,
	username: string,
	username_display_name?: string | undefined | null,
	['...on Candidate']: Omit<GraphQLTypes["Candidate"], "...on Candidate">
};
	["CandidateStatus"]: CandidateStatus;
	["CapitalCandidate"]: {
	__typename: "CapitalCandidate",
	about?: string | undefined | null,
	braname?: string | undefined | null,
	capital_status?: GraphQLTypes["ContributorStatus"] | undefined | null,
	contributed_as_author?: string | undefined | null,
	contributed_as_contributor?: string | undefined | null,
	contributed_as_coordinator?: string | undefined | null,
	contributed_as_creator?: string | undefined | null,
	contributed_as_investor?: string | undefined | null,
	contributed_as_propertor?: string | undefined | null,
	contributor_hash?: string | undefined | null,
	coopname: string,
	created_at: GraphQLTypes["DateTime"],
	hours_per_day?: number | undefined | null,
	level?: number | undefined | null,
	memo?: string | undefined | null,
	program_key?: string | undefined | null,
	public_key: string,
	rate_per_hour?: string | undefined | null,
	referer?: string | undefined | null,
	referer_display_name?: string | undefined | null,
	registered_at?: GraphQLTypes["DateTime"] | undefined | null,
	status: GraphQLTypes["CandidateStatus"],
	type: string,
	username: string,
	username_display_name?: string | undefined | null,
	['...on CapitalCandidate']: Omit<GraphQLTypes["CapitalCandidate"], "...on CapitalCandidate">
};
	/** Коммит в системе CAPITAL */
["CapitalCommit"]: {
	__typename: "CapitalCommit",
	/** Дата создания записи */
	_created_at: GraphQLTypes["DateTime"],
	/** Внутренний ID базы данных */
	_id: string,
	/** Дата последнего обновления записи */
	_updated_at: GraphQLTypes["DateTime"],
	/** Данные amounts коммита */
	amounts?: GraphQLTypes["CapitalCommitAmounts"] | undefined | null,
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?: number | undefined | null,
	/** Статус из блокчейна */
	blockchain_status?: string | undefined | null,
	/** Хеш коммита */
	commit_hash: string,
	/** Название кооператива */
	coopname?: string | undefined | null,
	/** Дата создания */
	created_at?: string | undefined | null,
	/** Обогащенные данные коммита (diff-патч, исходная ссылка и т.д.) */
	data?: GraphQLTypes["JSON"] | undefined | null,
	/** Описание коммита */
	description: string,
	/** Отображаемое имя пользователя */
	display_name?: string | undefined | null,
	/** ID в блокчейне */
	id?: number | undefined | null,
	/** Метаданные коммита */
	meta: string,
	/** Флаг присутствия записи в блокчейне */
	present: boolean,
	/** Проект, к которому относится коммит */
	project?: GraphQLTypes["BaseCapitalProject"] | undefined | null,
	/** Хеш проекта */
	project_hash?: string | undefined | null,
	/** Статус коммита */
	status: GraphQLTypes["CommitStatus"],
	/** Имя пользователя */
	username?: string | undefined | null,
	['...on CapitalCommit']: Omit<GraphQLTypes["CapitalCommit"], "...on CapitalCommit">
};
	/** Данные amounts коммита */
["CapitalCommitAmounts"]: {
	__typename: "CapitalCommitAmounts",
	/** Базовый пул авторов */
	authors_base_pool?: string | undefined | null,
	/** Бонусный пул авторов */
	authors_bonus_pool?: string | undefined | null,
	/** Бонусный пул участников */
	contributors_bonus_pool?: string | undefined | null,
	/** Базовый пул создателей */
	creators_base_pool?: string | undefined | null,
	/** Бонусный пул создателей */
	creators_bonus_pool?: string | undefined | null,
	/** Часы создателей */
	creators_hours?: string | undefined | null,
	/** Стоимость часа работы */
	hour_cost?: string | undefined | null,
	/** Общий объем вклада */
	total_contribution?: string | undefined | null,
	/** Общий генерационный пул */
	total_generation_pool?: string | undefined | null,
	['...on CapitalCommitAmounts']: Omit<GraphQLTypes["CapitalCommitAmounts"], "...on CapitalCommitAmounts">
};
	/** Конфигурация CAPITAL контракта кооператива */
["CapitalConfigObject"]: {
	__typename: "CapitalConfigObject",
	/** Процент голосования авторов */
	authors_voting_percent: number,
	/** Процент бонуса координатора */
	coordinator_bonus_percent: number,
	/** Срок действия приглашения координатора в днях */
	coordinator_invite_validity_days: number,
	/** Процент голосования создателей */
	creators_voting_percent: number,
	/** Скорость убывания энергии в день */
	energy_decay_rate_per_day: number,
	/** Коэффициент получения энергии */
	energy_gain_coefficient: number,
	/** Процент расходов */
	expense_pool_percent: number,
	/** Базовая глубина уровня */
	level_depth_base: number,
	/** Коэффициент роста уровня */
	level_growth_coefficient: number,
	/** Период голосования в днях */
	voting_period_in_days: number,
	['...on CapitalConfigObject']: Omit<GraphQLTypes["CapitalConfigObject"], "...on CapitalConfigObject">
};
	/** Участник кооператива в системе CAPITAL */
["CapitalContributor"]: {
	__typename: "CapitalContributor",
	/** Дата создания записи */
	_created_at: GraphQLTypes["DateTime"],
	/** Внутренний ID базы данных */
	_id: string,
	/** Дата последнего обновления записи */
	_updated_at: GraphQLTypes["DateTime"],
	/** О себе */
	about?: string | undefined | null,
	/** Приложения к контракту */
	appendixes?: Array<string> | undefined | null,
	/** Хеш соглашения Благорост */
	blagorost_agreement_hash?: string | undefined | null,
	/** Хеш оферты Благорост */
	blagorost_offer_hash?: string | undefined | null,
	/** Программный кошелек в программе Blagorost */
	blagorost_wallet?: GraphQLTypes["ProgramWallet"] | undefined | null,
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?: number | undefined | null,
	/** Статус из блокчейна */
	blockchain_status?: string | undefined | null,
	/** Контракт участника */
	contract?: GraphQLTypes["DocumentAggregate"] | undefined | null,
	/** Вклад как автор */
	contributed_as_author?: string | undefined | null,
	/** Вклад как участник */
	contributed_as_contributor?: string | undefined | null,
	/** Вклад как координатор */
	contributed_as_coordinator?: string | undefined | null,
	/** Вклад как исполнитель */
	contributed_as_creator?: string | undefined | null,
	/** Вклад как инвестор */
	contributed_as_investor?: string | undefined | null,
	/** Вклад как собственник имущества */
	contributed_as_propertor?: string | undefined | null,
	/** Хеш участника */
	contributor_hash: string,
	/** Название кооператива */
	coopname: string,
	/** Дата создания */
	created_at?: string | undefined | null,
	/** Сумма долга */
	debt_amount?: string | undefined | null,
	/** Отображаемое имя */
	display_name?: string | undefined | null,
	/** Параметры документов участника из UData (номера и даты) */
	document_parameters?: GraphQLTypes["ContributorDocumentParameters"] | undefined | null,
	/** Энергия участника */
	energy?: number | undefined | null,
	/** Хеш договора УХД */
	generation_contract_hash?: string | undefined | null,
	/** Программный кошелек в программе Generation */
	generation_wallet?: GraphQLTypes["ProgramWallet"] | undefined | null,
	/** Хеш оферты Генератор */
	generator_offer_hash?: string | undefined | null,
	/** Часов в день */
	hours_per_day?: number | undefined | null,
	/** ID в блокчейне */
	id?: number | undefined | null,
	/** Соглашение Благорост предоставлено при импорте (внешний документ) */
	is_external_blagorost_agreement?: boolean | undefined | null,
	/** Является ли внешним контрактом */
	is_external_contract?: boolean | undefined | null,
	/** Последнее обновление энергии */
	last_energy_update?: string | undefined | null,
	/** Уровень участника */
	level?: number | undefined | null,
	/** Программный кошелек в программе Main */
	main_wallet?: GraphQLTypes["ProgramWallet"] | undefined | null,
	/** Мемо/комментарий */
	memo?: string | undefined | null,
	/** Флаг присутствия записи в блокчейне */
	present: boolean,
	/** Ключ выбранной программы регистрации (generation, capitalization) */
	program_key?: string | undefined | null,
	/** Ставка за час работы */
	rate_per_hour?: string | undefined | null,
	/** Статус участника */
	status: GraphQLTypes["ContributorStatus"],
	/** Хеш соглашения о хранении имущества */
	storage_agreement_hash?: string | undefined | null,
	/** Имя пользователя */
	username: string,
	['...on CapitalContributor']: Omit<GraphQLTypes["CapitalContributor"], "...on CapitalContributor">
};
	/** Цикл разработки в системе CAPITAL */
["CapitalCycle"]: {
	__typename: "CapitalCycle",
	/** Дата создания записи */
	_created_at: GraphQLTypes["DateTime"],
	/** Внутренний ID базы данных */
	_id: string,
	/** Дата последнего обновления записи */
	_updated_at: GraphQLTypes["DateTime"],
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?: number | undefined | null,
	/** Дата окончания */
	end_date: GraphQLTypes["DateTime"],
	/** Название цикла */
	name: string,
	/** Флаг присутствия записи в блокчейне */
	present: boolean,
	/** Дата начала */
	start_date: GraphQLTypes["DateTime"],
	/** Статус цикла */
	status: GraphQLTypes["CycleStatus"],
	['...on CapitalCycle']: Omit<GraphQLTypes["CapitalCycle"], "...on CapitalCycle">
};
	/** Долг в системе CAPITAL */
["CapitalDebt"]: {
	__typename: "CapitalDebt",
	/** Дата создания записи */
	_created_at: GraphQLTypes["DateTime"],
	/** Внутренний ID базы данных */
	_id: string,
	/** Дата последнего обновления записи */
	_updated_at: GraphQLTypes["DateTime"],
	/** Сумма долга */
	amount?: number | undefined | null,
	/** Одобренное заявление */
	approved_statement?: GraphQLTypes["DocumentAggregate"] | undefined | null,
	/** Протокол решения совета */
	authorization?: GraphQLTypes["DocumentAggregate"] | undefined | null,
	/** Номер блока последнего обновления */
	block_num?: number | undefined | null,
	/** Статус из блокчейна */
	blockchain_status?: string | undefined | null,
	/** Название кооператива */
	coopname?: string | undefined | null,
	/** Хеш долга */
	debt_hash: string,
	/** ID в блокчейне */
	id?: number | undefined | null,
	/** Мемо/комментарий */
	memo?: string | undefined | null,
	/** Существует ли запись в блокчейне */
	present: boolean,
	/** Хеш проекта */
	project_hash?: string | undefined | null,
	/** Дата погашения */
	repaid_at?: string | undefined | null,
	/** Заявление на получение ссуды */
	statement?: GraphQLTypes["DocumentAggregate"] | undefined | null,
	/** Статус долга */
	status: GraphQLTypes["DebtStatus"],
	/** Имя пользователя */
	username?: string | undefined | null,
	['...on CapitalDebt']: Omit<GraphQLTypes["CapitalDebt"], "...on CapitalDebt">
};
	/** Расход в системе CAPITAL */
["CapitalExpense"]: {
	__typename: "CapitalExpense",
	/** Дата создания записи */
	_created_at: GraphQLTypes["DateTime"],
	/** Внутренний ID базы данных */
	_id: string,
	/** Дата последнего обновления записи */
	_updated_at: GraphQLTypes["DateTime"],
	/** Сумма расхода */
	amount?: string | undefined | null,
	/** Одобренная записка */
	approved_statement?: GraphQLTypes["DocumentAggregate"] | undefined | null,
	/** Авторизация расхода */
	authorization?: GraphQLTypes["DocumentAggregate"] | undefined | null,
	/** Номер блока последнего обновления */
	block_num?: number | undefined | null,
	/** Статус из блокчейна */
	blockchain_status?: string | undefined | null,
	/** Название кооператива */
	coopname?: string | undefined | null,
	/** Описание расхода */
	description?: string | undefined | null,
	/** Хеш расхода */
	expense_hash: string,
	/** Служебная записка о расходе */
	expense_statement?: GraphQLTypes["DocumentAggregate"] | undefined | null,
	/** ID фонда */
	fund_id?: number | undefined | null,
	/** ID в блокчейне */
	id?: number | undefined | null,
	/** Существует ли запись в блокчейне */
	present: boolean,
	/** Хеш проекта */
	project_hash?: string | undefined | null,
	/** Дата расхода */
	spended_at?: string | undefined | null,
	/** Статус расхода */
	status: GraphQLTypes["ExpenseStatus"],
	/** Имя пользователя */
	username?: string | undefined | null,
	['...on CapitalExpense']: Omit<GraphQLTypes["CapitalExpense"], "...on CapitalExpense">
};
	/** Инвестиция в системе CAPITAL */
["CapitalInvest"]: {
	__typename: "CapitalInvest",
	/** Дата создания записи */
	_created_at: GraphQLTypes["DateTime"],
	/** Внутренний ID базы данных */
	_id: string,
	/** Дата последнего обновления записи */
	_updated_at: GraphQLTypes["DateTime"],
	/** Сумма инвестиции */
	amount?: number | undefined | null,
	/** Номер блока последнего обновления */
	block_num?: number | undefined | null,
	/** Статус из блокчейна */
	blockchain_status?: string | undefined | null,
	/** Название кооператива */
	coopname?: string | undefined | null,
	/** Координатор */
	coordinator?: string | undefined | null,
	/** Сумма координатора */
	coordinator_amount?: number | undefined | null,
	/** ID в блокчейне */
	id?: number | undefined | null,
	/** Хеш инвестиции */
	invest_hash: string,
	/** Дата инвестирования */
	invested_at?: string | undefined | null,
	/** Существует ли запись в блокчейне */
	present: boolean,
	/** Хеш проекта */
	project_hash?: string | undefined | null,
	/** Заявление */
	statement?: string | undefined | null,
	/** Статус инвестиции */
	status: GraphQLTypes["InvestStatus"],
	/** Имя пользователя */
	username?: string | undefined | null,
	['...on CapitalInvest']: Omit<GraphQLTypes["CapitalInvest"], "...on CapitalInvest">
};
	/** Задача в системе CAPITAL */
["CapitalIssue"]: {
	__typename: "CapitalIssue",
	/** Дата создания записи */
	_created_at: GraphQLTypes["DateTime"],
	/** Внутренний ID базы данных */
	_id: string,
	/** Дата последнего обновления записи */
	_updated_at: GraphQLTypes["DateTime"],
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?: number | undefined | null,
	/** Имя пользователя, создавшего задачу */
	created_by: string,
	/** Массив имен пользователей создателей (contributors) */
	creators: Array<string>,
	/** ID цикла */
	cycle_id?: string | undefined | null,
	/** Описание задачи */
	description?: string | undefined | null,
	/** Оценка в часах (допускаются дроби, например 1.5) */
	estimate: number,
	/** Уникальный ID задачи в формате PREFIX-N (например, ABC-1) */
	id: string,
	/** Хеш задачи */
	issue_hash: string,
	/** Метаданные задачи */
	metadata: GraphQLTypes["JSON"],
	/** Права доступа текущего пользователя к задаче */
	permissions: GraphQLTypes["CapitalIssuePermissions"],
	/** Флаг присутствия записи в блокчейне */
	present: boolean,
	/** Приоритет задачи */
	priority: GraphQLTypes["IssuePriority"],
	/** Хеш проекта */
	project_hash: string,
	/** Порядок сортировки */
	sort_order: number,
	/** Статус задачи */
	status: GraphQLTypes["IssueStatus"],
	/** Имя пользователя ответственного (contributor) */
	submaster?: string | undefined | null,
	/** Название задачи */
	title: string,
	['...on CapitalIssue']: Omit<GraphQLTypes["CapitalIssue"], "...on CapitalIssue">
};
	/** Права доступа пользователя к задаче */
["CapitalIssuePermissions"]: {
	__typename: "CapitalIssuePermissions",
	/** Список допустимых статусов для перехода */
	allowed_status_transitions: Array<GraphQLTypes["IssueStatus"]>,
	/** Может ли назначать исполнителей задачи */
	can_assign_creator: boolean,
	/** Может ли изменять статусы задачи */
	can_change_status: boolean,
	/** Может ли выполнять требования к задаче */
	can_complete_requirement: boolean,
	/** Может ли создавать требования к задаче */
	can_create_requirement: boolean,
	/** Может ли удалить задачу */
	can_delete_issue: boolean,
	/** Может ли удалять требования к задаче */
	can_delete_requirement: boolean,
	/** Может ли редактировать задачу (название, описание, приоритет и т.д.) */
	can_edit_issue: boolean,
	/** Может ли устанавливать статус DONE (выполнена) */
	can_set_done: boolean,
	/** Может ли устанавливать оценку (estimate) задачи */
	can_set_estimate: boolean,
	/** Может ли устанавливать статус ON_REVIEW (на проверке) */
	can_set_on_review: boolean,
	/** Может ли устанавливать приоритет задачи */
	can_set_priority: boolean,
	/** Имеет ли подтвержденное приложение для проекта */
	has_clearance: boolean,
	/** Является ли пользователь гостем (неавторизованным) */
	is_guest: boolean,
	['...on CapitalIssuePermissions']: Omit<GraphQLTypes["CapitalIssuePermissions"], "...on CapitalIssuePermissions">
};
	/** Запись лога событий в системе капитала */
["CapitalLog"]: {
	__typename: "CapitalLog",
	/** Внутренний идентификатор */
	_id: string,
	/** Название кооператива */
	coopname: string,
	/** Дата создания записи */
	created_at: GraphQLTypes["DateTime"],
	/** ID сущности */
	entity_id?: string | undefined | null,
	/** Тип сущности к которой относится событие */
	entity_type: GraphQLTypes["LogEntityType"],
	/** Тип события */
	event_type: GraphQLTypes["LogEventType"],
	/** Инициатор действия (username) */
	initiator: string,
	/** Текстовое описание события */
	message: string,
	/** Вспомогательные данные */
	metadata?: GraphQLTypes["JSON"] | undefined | null,
	/** Хеш проекта или компонента */
	project_hash?: string | undefined | null,
	/** Идентификатор-ссылка (invest_hash, commit_hash, result_hash и т.д.) */
	reference_id?: string | undefined | null,
	['...on CapitalLog']: Omit<GraphQLTypes["CapitalLog"], "...on CapitalLog">
};
	/** Фильтр для поиска логов событий */
["CapitalLogFilterInput"]: {
		/** Название кооператива */
	coopname?: string | undefined | null,
	/** Период с */
	date_from?: GraphQLTypes["DateTime"] | undefined | null,
	/** Период по */
	date_to?: GraphQLTypes["DateTime"] | undefined | null,
	/** Типы событий для фильтрации */
	event_types?: Array<GraphQLTypes["LogEventType"]> | undefined | null,
	/** Инициатор действия (username) */
	initiator?: string | undefined | null,
	/** Хеш задачи */
	issue_hash?: string | undefined | null,
	/** Хеш проекта или компонента */
	project_hash?: string | undefined | null,
	/** Включать логи дочерних компонентов при фильтрации по project_hash */
	show_components_logs?: boolean | undefined | null,
	/** Показывать логи по задачам */
	show_issue_logs?: boolean | undefined | null
};
	/** Программная инвестиция в системе CAPITAL */
["CapitalProgramInvest"]: {
	__typename: "CapitalProgramInvest",
	/** Дата создания записи */
	_created_at: GraphQLTypes["DateTime"],
	/** Внутренний ID базы данных */
	_id: string,
	/** Дата последнего обновления записи */
	_updated_at: GraphQLTypes["DateTime"],
	/** Сумма инвестиции */
	amount?: number | undefined | null,
	/** Номер блока последнего обновления */
	block_num?: number | undefined | null,
	/** Статус из блокчейна */
	blockchain_status?: string | undefined | null,
	/** Название кооператива */
	coopname?: string | undefined | null,
	/** ID в блокчейне */
	id?: number | undefined | null,
	/** Хеш инвестиции */
	invest_hash: string,
	/** Дата инвестирования */
	invested_at?: string | undefined | null,
	/** Существует ли запись в блокчейне */
	present: boolean,
	/** Заявление об инвестиции */
	statement?: GraphQLTypes["DocumentAggregate"] | undefined | null,
	/** Статус программной инвестиции */
	status: GraphQLTypes["ProgramInvestStatus"],
	/** Имя пользователя */
	username?: string | undefined | null,
	['...on CapitalProgramInvest']: Omit<GraphQLTypes["CapitalProgramInvest"], "...on CapitalProgramInvest">
};
	/** Проект в системе CAPITAL с компонентами */
["CapitalProject"]: {
	__typename: "CapitalProject",
	/** Дата создания записи */
	_created_at: GraphQLTypes["DateTime"],
	/** Внутренний ID базы данных */
	_id: string,
	/** Дата последнего обновления записи */
	_updated_at: GraphQLTypes["DateTime"],
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?: number | undefined | null,
	/** Статус из блокчейна */
	blockchain_status: string,
	/** Массив проектов-компонентов */
	components: Array<GraphQLTypes["CapitalProjectComponent"]>,
	/** Название кооператива */
	coopname: string,
	/** Счетчики участников проекта */
	counts: GraphQLTypes["CapitalProjectCountsData"],
	/** Дата создания */
	created_at: string,
	/** Данные CRPS для распределения наград проекта */
	crps: GraphQLTypes["CapitalProjectCrpsData"],
	/** Данные/шаблон проекта */
	data: string,
	/** Описание проекта */
	description: string,
	/** Фактические показатели проекта */
	fact: GraphQLTypes["CapitalProjectFactPool"],
	/** ID в блокчейне */
	id: number,
	/** Приглашение к проекту */
	invite: string,
	/** Открыт ли проект */
	is_opened: boolean,
	/** Запланирован ли проект */
	is_planed: boolean,
	/** Счетчик задач проекта */
	issue_counter: number,
	/** Мастер проекта */
	master: string,
	/** Мета-информация проекта */
	meta: string,
	/** Хеш родительского проекта */
	parent_hash: string,
	/** Название родительского проекта */
	parent_title?: string | undefined | null,
	/** Права доступа текущего пользователя к проекту */
	permissions: GraphQLTypes["CapitalProjectPermissions"],
	/** Плановые показатели проекта */
	plan: GraphQLTypes["CapitalProjectPlanPool"],
	/** Префикс проекта */
	prefix: string,
	/** Флаг присутствия записи в блокчейне */
	present: boolean,
	/** Хеш проекта */
	project_hash: string,
	/** Статус проекта */
	status: GraphQLTypes["ProjectStatus"],
	/** Название проекта */
	title: string,
	/** Данные голосования по методу Водянова */
	voting: GraphQLTypes["CapitalProjectVotingData"],
	['...on CapitalProject']: Omit<GraphQLTypes["CapitalProject"], "...on CapitalProject">
};
	/** Проект-компонент в системе CAPITAL */
["CapitalProjectComponent"]: {
	__typename: "CapitalProjectComponent",
	/** Дата создания записи */
	_created_at: GraphQLTypes["DateTime"],
	/** Внутренний ID базы данных */
	_id: string,
	/** Дата последнего обновления записи */
	_updated_at: GraphQLTypes["DateTime"],
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?: number | undefined | null,
	/** Статус из блокчейна */
	blockchain_status: string,
	/** Название кооператива */
	coopname: string,
	/** Счетчики участников проекта */
	counts: GraphQLTypes["CapitalProjectCountsData"],
	/** Дата создания */
	created_at: string,
	/** Данные CRPS для распределения наград проекта */
	crps: GraphQLTypes["CapitalProjectCrpsData"],
	/** Данные/шаблон проекта */
	data: string,
	/** Описание проекта */
	description: string,
	/** Фактические показатели проекта */
	fact: GraphQLTypes["CapitalProjectFactPool"],
	/** ID в блокчейне */
	id: number,
	/** Приглашение к проекту */
	invite: string,
	/** Открыт ли проект */
	is_opened: boolean,
	/** Запланирован ли проект */
	is_planed: boolean,
	/** Счетчик задач проекта */
	issue_counter: number,
	/** Мастер проекта */
	master: string,
	/** Мета-информация проекта */
	meta: string,
	/** Хеш родительского проекта */
	parent_hash: string,
	/** Название родительского проекта */
	parent_title?: string | undefined | null,
	/** Права доступа текущего пользователя к проекту */
	permissions: GraphQLTypes["CapitalProjectPermissions"],
	/** Плановые показатели проекта */
	plan: GraphQLTypes["CapitalProjectPlanPool"],
	/** Префикс проекта */
	prefix: string,
	/** Флаг присутствия записи в блокчейне */
	present: boolean,
	/** Хеш проекта */
	project_hash: string,
	/** Статус проекта */
	status: GraphQLTypes["ProjectStatus"],
	/** Название проекта */
	title: string,
	/** Данные голосования по методу Водянова */
	voting: GraphQLTypes["CapitalProjectVotingData"],
	['...on CapitalProjectComponent']: Omit<GraphQLTypes["CapitalProjectComponent"], "...on CapitalProjectComponent">
};
	/** Счетчики участников проекта */
["CapitalProjectCountsData"]: {
	__typename: "CapitalProjectCountsData",
	/** Общее количество авторов */
	total_authors: number,
	/** Общее количество коммитов */
	total_commits: number,
	/** Общее количество участников */
	total_contributors: number,
	/** Общее количество координаторов */
	total_coordinators: number,
	/** Общее количество создателей */
	total_creators: number,
	/** Общее количество инвесторов */
	total_investors: number,
	/** Общее количество проперторов */
	total_propertors: number,
	/** Общее количество уникальных участников */
	total_unique_participants: number,
	['...on CapitalProjectCountsData']: Omit<GraphQLTypes["CapitalProjectCountsData"], "...on CapitalProjectCountsData">
};
	/** Данные CRPS для распределения наград проекта */
["CapitalProjectCrpsData"]: {
	__typename: "CapitalProjectCrpsData",
	/** Накопительный коэффициент вознаграждения за базовый вклад авторов */
	author_base_cumulative_reward_per_share: number,
	/** Накопительный коэффициент вознаграждения за бонусный вклад авторов */
	author_bonus_cumulative_reward_per_share: number,
	/** Накопительный коэффициент вознаграждения участников */
	contributor_cumulative_reward_per_share: number,
	/** Общее количество долей участников капитала */
	total_capital_contributors_shares: string,
	['...on CapitalProjectCrpsData']: Omit<GraphQLTypes["CapitalProjectCrpsData"], "...on CapitalProjectCrpsData">
};
	/** Фактические показатели проекта */
["CapitalProjectFactPool"]: {
	__typename: "CapitalProjectFactPool",
	/** Накопленный пул расходов */
	accumulated_expense_pool: string,
	/** Базовый пул авторов */
	authors_base_pool: string,
	/** Бонусный пул авторов */
	authors_bonus_pool: string,
	/** Бонусный пул участников */
	contributors_bonus_pool: string,
	/** Базовый пул координаторов */
	coordinators_base_pool: string,
	/** Инвестиционный пул координаторов */
	coordinators_investment_pool: string,
	/** Базовый пул создателей */
	creators_base_pool: string,
	/** Бонусный пул создателей */
	creators_bonus_pool: string,
	/** Часы создателей */
	creators_hours: number,
	/** Стоимость часа работы */
	hour_cost: string,
	/** Инвестиционный пул */
	invest_pool: string,
	/** Программный инвестиционный пул */
	program_invest_pool: string,
	/** Имущественный базовый пул */
	property_base_pool: string,
	/** Процент возврата базового пула */
	return_base_percent: number,
	/** Целевой пул расходов */
	target_expense_pool: string,
	/** Общая сумма */
	total: string,
	/** Общий объем взноса старших участников */
	total_contribution: string,
	/** Общий генерационный пул */
	total_generation_pool: string,
	/** Общий объем полученных инвестиций */
	total_received_investments: string,
	/** Общий объем возвращенных инвестиций */
	total_returned_investments: string,
	/** Общий объем использованных инвестиций */
	total_used_investments: string,
	/** Общий объем взноса старших участников */
	total_with_investments: string,
	/** Процент использования инвестиций */
	use_invest_percent: number,
	/** Использованный пул расходов */
	used_expense_pool: string,
	['...on CapitalProjectFactPool']: Omit<GraphQLTypes["CapitalProjectFactPool"], "...on CapitalProjectFactPool">
};
	/** Права доступа пользователя к проекту */
["CapitalProjectPermissions"]: {
	__typename: "CapitalProjectPermissions",
	/** Может ли изменять статус проекта */
	can_change_project_status: boolean,
	/** Может ли выполнять требования к проекту */
	can_complete_requirement: boolean,
	/** Может ли создавать требования к проекту */
	can_create_requirement: boolean,
	/** Может ли удалить проект */
	can_delete_project: boolean,
	/** Может ли удалять требования к проекту */
	can_delete_requirement: boolean,
	/** Может ли редактировать проект (название, описание, мета и т.д.) */
	can_edit_project: boolean,
	/** Может ли управлять авторами проекта */
	can_manage_authors: boolean,
	/** Может ли управлять задачами в проекте */
	can_manage_issues: boolean,
	/** Может ли устанавливать мастера проекта */
	can_set_master: boolean,
	/** Может ли устанавливать план проекта */
	can_set_plan: boolean,
	/** Имеет ли подтвержденное приложение для проекта */
	has_clearance: boolean,
	/** Является ли пользователь гостем (неавторизованным) */
	is_guest: boolean,
	/** Есть ли запрос на получение допуска в рассмотрении */
	pending_clearance: boolean,
	['...on CapitalProjectPermissions']: Omit<GraphQLTypes["CapitalProjectPermissions"], "...on CapitalProjectPermissions">
};
	/** Плановые показатели проекта */
["CapitalProjectPlanPool"]: {
	__typename: "CapitalProjectPlanPool",
	/** Базовый пул авторов */
	authors_base_pool: string,
	/** Бонусный пул авторов */
	authors_bonus_pool: string,
	/** Бонусный пул участников */
	contributors_bonus_pool: string,
	/** Базовый пул координаторов */
	coordinators_base_pool: string,
	/** Инвестиционный пул координаторов */
	coordinators_investment_pool: string,
	/** Базовый пул создателей */
	creators_base_pool: string,
	/** Бонусный пул создателей */
	creators_bonus_pool: string,
	/** Плановые часы создателей */
	creators_hours: number,
	/** Плановая стоимость часа работы */
	hour_cost: string,
	/** Инвестиционный пул */
	invest_pool: string,
	/** Программный инвестиционный пул */
	program_invest_pool: string,
	/** Процент возврата базового пула */
	return_base_percent: number,
	/** Целевой пул расходов */
	target_expense_pool: string,
	/** Общая сумма */
	total: string,
	/** Общий генерационный пул */
	total_generation_pool: string,
	/** Общий объем полученных инвестиций */
	total_received_investments: string,
	/** Общая сумма */
	total_with_investments: string,
	/** Процент использования инвестиций */
	use_invest_percent: number,
	['...on CapitalProjectPlanPool']: Omit<GraphQLTypes["CapitalProjectPlanPool"], "...on CapitalProjectPlanPool">
};
	/** Статистика времени участника по проекту */
["CapitalProjectTimeStats"]: {
	__typename: "CapitalProjectTimeStats",
	/** Доступное время для коммита (по завершённым задачам) */
	available_hours: number,
	/** Хеш участника */
	contributor_hash: string,
	/** Время в ожидании (по незавершённым задачам) */
	pending_hours: number,
	/** Хеш проекта */
	project_hash: string,
	/** Название проекта */
	project_name: string,
	/** Сумма закоммиченного времени (часы) */
	total_committed_hours: number,
	/** Сумма незакоммиченного времени (часы) */
	total_uncommitted_hours: number,
	['...on CapitalProjectTimeStats']: Omit<GraphQLTypes["CapitalProjectTimeStats"], "...on CapitalProjectTimeStats">
};
	/** Суммы голосования проекта */
["CapitalProjectVotingAmounts"]: {
	__typename: "CapitalProjectVotingAmounts",
	/** Активная сумма голосования */
	active_voting_amount: string,
	/** Бонусы авторов при голосовании */
	authors_bonuses_on_voting: string,
	/** Равная сумма на автора */
	authors_equal_per_author: string,
	/** Равномерное распределение среди авторов */
	authors_equal_spread: string,
	/** Бонусы создателей при голосовании */
	creators_bonuses_on_voting: string,
	/** Прямое распределение среди создателей */
	creators_direct_spread: string,
	/** Равная сумма голосования */
	equal_voting_amount: string,
	/** Общий пул голосования */
	total_voting_pool: string,
	['...on CapitalProjectVotingAmounts']: Omit<GraphQLTypes["CapitalProjectVotingAmounts"], "...on CapitalProjectVotingAmounts">
};
	/** Данные голосования по методу Водянова */
["CapitalProjectVotingData"]: {
	__typename: "CapitalProjectVotingData",
	/** Суммы голосования */
	amounts: GraphQLTypes["CapitalProjectVotingAmounts"],
	/** Процент голосования авторов */
	authors_voting_percent: number,
	/** Процент голосования создателей */
	creators_voting_percent: number,
	/** Общее количество участников голосования */
	total_voters: number,
	/** Количество полученных голосов */
	votes_received: number,
	/** Дата окончания голосования */
	voting_deadline: string,
	['...on CapitalProjectVotingData']: Omit<GraphQLTypes["CapitalProjectVotingData"], "...on CapitalProjectVotingData">
};
	/** Результат в системе CAPITAL */
["CapitalResult"]: {
	__typename: "CapitalResult",
	/** Дата создания записи */
	_created_at: GraphQLTypes["DateTime"],
	/** Внутренний ID базы данных */
	_id: string,
	/** Дата последнего обновления записи */
	_updated_at: GraphQLTypes["DateTime"],
	/** Акт приёма-передачи результата */
	act?: GraphQLTypes["DocumentAggregate"] | undefined | null,
	/** Авторизация результата */
	authorization?: GraphQLTypes["DocumentAggregate"] | undefined | null,
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?: number | undefined | null,
	/** Статус из блокчейна */
	blockchain_status?: string | undefined | null,
	/** Название кооператива */
	coopname?: string | undefined | null,
	/** Дата создания */
	created_at?: string | undefined | null,
	/** Структурированные данные результата для отображения */
	data?: string | undefined | null,
	/** Сумма долга */
	debt_amount?: string | undefined | null,
	/** ID в блокчейне */
	id?: number | undefined | null,
	/** Флаг присутствия записи в блокчейне */
	present: boolean,
	/** Хеш проекта */
	project_hash?: string | undefined | null,
	/** Хеш результата */
	result_hash: string,
	/** Заявление на внесение результата интеллектуальной деятельности */
	statement?: GraphQLTypes["DocumentAggregate"] | undefined | null,
	/** Статус результата */
	status: GraphQLTypes["ResultStatus"],
	/** Общая сумма */
	total_amount?: string | undefined | null,
	/** Имя пользователя */
	username?: string | undefined | null,
	['...on CapitalResult']: Omit<GraphQLTypes["CapitalResult"], "...on CapitalResult">
};
	/** Сегмент участника в проекте CAPITAL */
["CapitalSegment"]: {
	__typename: "CapitalSegment",
	/** Дата создания записи */
	_created_at: GraphQLTypes["DateTime"],
	/** Внутренний ID базы данных */
	_id: string,
	/** Дата последнего обновления записи */
	_updated_at: GraphQLTypes["DateTime"],
	/** Базовый вклад автора */
	author_base: string,
	/** Бонусный вклад автора */
	author_bonus: string,
	/** Доступная сумма для конвертации в программу */
	available_for_program: string,
	/** Доступная сумма для конвертации в кошелек */
	available_for_wallet: string,
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?: number | undefined | null,
	/** Доли участников капитала */
	capital_contributor_shares: string,
	/** Бонусный вклад участника */
	contributor_bonus: string,
	/** Название кооператива */
	coopname: string,
	/** Базовый вклад координатора */
	coordinator_base: string,
	/** Инвестиции координатора */
	coordinator_investments: string,
	/** Базовый вклад создателя */
	creator_base: string,
	/** Бонусный вклад создателя */
	creator_bonus: string,
	/** Сумма долга */
	debt_amount: string,
	/** Сумма погашенного долга */
	debt_settled: string,
	/** Прямой бонус создателя */
	direct_creator_bonus: string,
	/** Отображаемое имя пользователя */
	display_name: string,
	/** Равный бонус автора */
	equal_author_bonus: string,
	/** Наличие права голоса */
	has_vote: boolean,
	/** ID в блокчейне */
	id?: number | undefined | null,
	/** Интеллектуальная стоимость сегмента */
	intellectual_cost: string,
	/** Сумма инвестиций инвестора */
	investor_amount: string,
	/** Базовый вклад инвестора */
	investor_base: string,
	/** Роль автора */
	is_author: boolean,
	/** Завершена ли конвертация сегмента */
	is_completed: boolean,
	/** Роль участника */
	is_contributor: boolean,
	/** Роль координатора */
	is_coordinator: boolean,
	/** Роль создателя */
	is_creator: boolean,
	/** Роль инвестора */
	is_investor: boolean,
	/** Роль собственника */
	is_propertor: boolean,
	/** Флаг завершения расчета голосования */
	is_votes_calculated: boolean,
	/** Последняя награда за базовый вклад автора на долю в проекте */
	last_author_base_reward_per_share: number,
	/** Последняя награда за бонусный вклад автора на долю в проекте */
	last_author_bonus_reward_per_share: number,
	/** Последняя награда участника на акцию */
	last_contributor_reward_per_share: number,
	/** Последняя известная сумма инвестиций координаторов */
	last_known_coordinators_investment_pool: string,
	/** Последняя известная сумма базового пула создателей */
	last_known_creators_base_pool: string,
	/** Последняя известная сумма инвестиций в проекте */
	last_known_invest_pool: string,
	/** Флаг присутствия записи в блокчейне */
	present: boolean,
	/** Хеш проекта */
	project_hash: string,
	/** Базовый имущественный вклад */
	property_base: string,
	/** Предварительная сумма */
	provisional_amount: string,
	/** Доля участника в результате интеллектуальной деятельности */
	share_percent: number,
	/** Статус сегмента */
	status: GraphQLTypes["SegmentStatus"],
	/** Общая базовая стоимость сегмента */
	total_segment_base_cost: string,
	/** Общая бонусная стоимость сегмента */
	total_segment_bonus_cost: string,
	/** Общая стоимость сегмента */
	total_segment_cost: string,
	/** Имя пользователя */
	username: string,
	/** Вклад участника словами участника */
	value?: string | undefined | null,
	/** Бонус голосования */
	voting_bonus: string,
	['...on CapitalSegment']: Omit<GraphQLTypes["CapitalSegment"], "...on CapitalSegment">
};
	/** История (критерий выполнения) в системе CAPITAL */
["CapitalStory"]: {
	__typename: "CapitalStory",
	/** Дата создания записи */
	_created_at: GraphQLTypes["DateTime"],
	/** Внутренний ID базы данных */
	_id: string,
	/** Дата последнего обновления записи */
	_updated_at: GraphQLTypes["DateTime"],
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?: number | undefined | null,
	/** Формат содержимого (markdown-текст или BPMN 2.0 XML в description) */
	content_format: GraphQLTypes["CapitalStoryContentFormat"],
	/** Имя аккаунта кооператива */
	coopname: string,
	/** Имя пользователя, создавшего историю */
	created_by: string,
	/** Описание истории */
	description?: string | undefined | null,
	/** Хеш задачи (если история привязана к задаче) */
	issue_hash?: string | undefined | null,
	/** Флаг присутствия записи в блокчейне */
	present: boolean,
	/** Хеш проекта (если история привязана к проекту) */
	project_hash?: string | undefined | null,
	/** Порядок сортировки */
	sort_order: number,
	/** Статус истории */
	status: GraphQLTypes["StoryStatus"],
	/** Хеш истории */
	story_hash: string,
	/** Название истории */
	title: string,
	['...on CapitalStory']: Omit<GraphQLTypes["CapitalStory"], "...on CapitalStory">
};
	/** Формат содержимого требования (истории) в CAPITAL: MARKDOWN, BPMN (XML), DRAWIO (draw.io / diagrams.net XML) или MERMAID (текст диаграммы) */
["CapitalStoryContentFormat"]: CapitalStoryContentFormat;
	/** Агрегированная статистика времени по задачам с информацией о задачах и участниках */
["CapitalTimeEntriesByIssues"]: {
	__typename: "CapitalTimeEntriesByIssues",
	/** Доступное время для коммита (по завершённым задачам) */
	available_hours: number,
	/** Количество закоммиченных часов */
	committed_hours: number,
	/** Хеш участника */
	contributor_hash: string,
	/** Имя участника */
	contributor_name: string,
	/** Название кооператива */
	coopname: string,
	/** Хеш задачи */
	issue_hash: string,
	/** Название задачи */
	issue_title: string,
	/** Время в ожидании (по незавершённым задачам) */
	pending_hours: number,
	/** Хеш проекта */
	project_hash: string,
	/** Название проекта */
	project_name: string,
	/** Общее количество часов по задаче */
	total_hours: number,
	/** Количество незакоммиченных часов */
	uncommitted_hours: number,
	['...on CapitalTimeEntriesByIssues']: Omit<GraphQLTypes["CapitalTimeEntriesByIssues"], "...on CapitalTimeEntriesByIssues">
};
	/** Запись времени участника */
["CapitalTimeEntry"]: {
	__typename: "CapitalTimeEntry",
	/** Дата создания записи */
	_created_at: string,
	/** Уникальный идентификатор записи */
	_id: string,
	/** Дата последнего обновления записи */
	_updated_at: string,
	/** Хеш коммита */
	commit_hash?: string | undefined | null,
	/** Хеш участника */
	contributor_hash: string,
	/** Название кооператива */
	coopname: string,
	/** Дата записи времени (YYYY-MM-DD) */
	date: string,
	/** Тип начисления времени: hourly (почасовое) или estimate (по завершению задачи) */
	entry_type?: string | undefined | null,
	/** Снимок estimate на момент начисления времени (для отслеживания изменений) */
	estimate_snapshot?: number | undefined | null,
	/** Количество часов */
	hours: number,
	/** Флаг, указывающий, закоммичена ли запись */
	is_committed: boolean,
	/** Хеш задачи */
	issue_hash: string,
	/** Хеш проекта */
	project_hash: string,
	['...on CapitalTimeEntry']: Omit<GraphQLTypes["CapitalTimeEntry"], "...on CapitalTimeEntry">
};
	/** Голос в системе CAPITAL */
["CapitalVote"]: {
	__typename: "CapitalVote",
	/** Дата создания записи */
	_created_at: GraphQLTypes["DateTime"],
	/** Внутренний ID базы данных */
	_id: string,
	/** Дата последнего обновления записи */
	_updated_at: GraphQLTypes["DateTime"],
	/** Сумма голоса */
	amount?: string | undefined | null,
	/** Номер блока крайней синхронизации с блокчейном */
	block_num?: number | undefined | null,
	/** Название кооператива */
	coopname?: string | undefined | null,
	/** ID в блокчейне */
	id?: number | undefined | null,
	/** Флаг присутствия записи в блокчейне */
	present: boolean,
	/** Хеш проекта */
	project_hash?: string | undefined | null,
	/** Получатель */
	recipient?: string | undefined | null,
	/** Отображаемое имя получателя голоса */
	recipient_display_name?: string | undefined | null,
	/** Дата голосования */
	voted_at?: string | undefined | null,
	/** Голосующий */
	voter?: string | undefined | null,
	/** Отображаемое имя голосующего */
	voter_display_name?: string | undefined | null,
	['...on CapitalVote']: Omit<GraphQLTypes["CapitalVote"], "...on CapitalVote">
};
	["ChartOfAccountsItem"]: {
	__typename: "ChartOfAccountsItem",
	/** Доступные средства */
	available: string,
	/** Заблокированные средства */
	blocked: string,
	/** Идентификатор счета для отображения (может быть дробным, например "86.6") */
	displayId: string,
	/** Идентификатор счета */
	id: number,
	/** Название счета */
	name: string,
	/** Списанные средства */
	writeoff: string,
	['...on ChartOfAccountsItem']: Omit<GraphQLTypes["ChartOfAccountsItem"], "...on ChartOfAccountsItem">
};
	/** Статус коммита в системе CAPITAL */
["CommitStatus"]: CommitStatus;
	["ContactsDTO"]: {
	__typename: "ContactsDTO",
	chairman: GraphQLTypes["PublicChairman"],
	details: GraphQLTypes["OrganizationDetails"],
	email: string,
	full_address: string,
	full_name: string,
	phone: string,
	['...on ContactsDTO']: Omit<GraphQLTypes["ContactsDTO"], "...on ContactsDTO">
};
	/** Параметры документов участника из UData */
["ContributorDocumentParameters"]: {
	__typename: "ContributorDocumentParameters",
	/** Дата создания соглашения благороста */
	blagorost_agreement_created_at?: string | undefined | null,
	/** Номер соглашения программы благороста */
	blagorost_agreement_number?: string | undefined | null,
	/** Дата создания договора УХД участника */
	blagorost_contributor_contract_created_at?: string | undefined | null,
	/** Номер договора УХД участника */
	blagorost_contributor_contract_number?: string | undefined | null,
	/** Дата создания дополнительного соглашения по хранению имущества */
	blagorost_storage_agreement_created_at?: string | undefined | null,
	/** Номер дополнительного соглашения по хранению имущества */
	blagorost_storage_agreement_number?: string | undefined | null,
	/** Дата создания соглашения генератора */
	generator_agreement_created_at?: string | undefined | null,
	/** Номер соглашения программы генератор */
	generator_agreement_number?: string | undefined | null,
	['...on ContributorDocumentParameters']: Omit<GraphQLTypes["ContributorDocumentParameters"], "...on ContributorDocumentParameters">
};
	/** Статус участника в системе CAPITAL */
["ContributorStatus"]: ContributorStatus;
	["CooperativeOperatorAccount"]: {
	__typename: "CooperativeOperatorAccount",
	/** Количество активных участников */
	active_participants_count: number,
	/** Объявление кооператива */
	announce: string,
	/** Тип кооператива */
	coop_type: string,
	/** Дата создания */
	created_at: string,
	/** Описание кооператива */
	description: string,
	/** Документ кооператива */
	document: GraphQLTypes["SignedBlockchainDocument"],
	/** Начальный взнос */
	initial: string,
	/** Разветвленный ли кооператив */
	is_branched: boolean,
	/** Является ли это кооперативом */
	is_cooperative: boolean,
	/** Включен ли кооператив */
	is_enrolled: boolean,
	/** Метаинформация */
	meta: string,
	/** Минимальный взнос */
	minimum: string,
	/** Начальный взнос организации */
	org_initial: string,
	/** Минимальный взнос организации */
	org_minimum: string,
	/** Регистрационный взнос организации */
	org_registration: string,
	/** Родительское имя аккаунта кооператива */
	parent_username: string,
	/** Реферал кооператива */
	referer: string,
	/** Дата регистрации */
	registered_at: string,
	/** Регистрационный взнос */
	registration: string,
	/** Регистратор кооператива */
	registrator: string,
	/** Статус кооператива */
	status: string,
	/** Список хранилищ */
	storages: Array<string>,
	/** Тип учетной записи */
	type: string,
	/** Имя аккаунта кооператива */
	username: string,
	/** Дата регистрации */
	verifications: Array<GraphQLTypes["Verification"]>,
	['...on CooperativeOperatorAccount']: Omit<GraphQLTypes["CooperativeOperatorAccount"], "...on CooperativeOperatorAccount">
};
	/** Страна регистрации пользователя */
["Country"]: Country;
	["CreateBranchInput"]: {
		/** Документ, на основании которого действует Уполномоченный (решение совета №СС-.. от ..) */
	based_on: string,
	/** Имя аккаунта кооперативного участка */
	braname: string,
	/** Имя аккаунта кооператива */
	coopname: string,
	/** Электронная почта */
	email: string,
	/** Фактический адрес */
	fact_address: string,
	/** Полное имя организации кооперативного участка */
	full_name: string,
	/** Телефон */
	phone: string,
	/** Краткое имя организации кооперативного участка */
	short_name: string,
	/** Имя аккаунта уполномоченного (председателя) кооперативного участка */
	trustee: string
};
	["CreateEntrepreneurDataInput"]: {
		/** Банковский счет */
	bank_account: GraphQLTypes["BankAccountInput"],
	/** Дата рождения */
	birthdate: string,
	/** Город */
	city: string,
	/** Страна */
	country: GraphQLTypes["Country"],
	/** Детали индивидуального предпринимателя */
	details: GraphQLTypes["EntrepreneurDetailsInput"],
	/** Имя */
	first_name: string,
	/** Полный адрес */
	full_address: string,
	/** Фамилия */
	last_name: string,
	/** Отчество */
	middle_name: string,
	/** Телефон */
	phone: string
};
	["CreateIndividualDataInput"]: {
		/** Дата рождения */
	birthdate: string,
	/** Имя */
	first_name: string,
	/** Полный адрес */
	full_address: string,
	/** Фамилия */
	last_name: string,
	/** Отчество */
	middle_name: string,
	/** Данные паспорта */
	passport?: GraphQLTypes["PassportInput"] | undefined | null,
	/** Телефон */
	phone: string
};
	["CreateInitOrganizationDataInput"]: {
		/** Банковский счет организации */
	bank_account: GraphQLTypes["BankAccountInput"],
	/** Город */
	city: string,
	/** Страна */
	country: string,
	/** Детали организации */
	details: GraphQLTypes["OrganizationDetailsInput"],
	/** Email организации */
	email: string,
	/** Фактический адрес */
	fact_address: string,
	/** Полный адрес */
	full_address: string,
	/** Полное наименование организации */
	full_name: string,
	/** Телефон */
	phone: string,
	/** Представитель организации */
	represented_by: GraphQLTypes["RepresentedByInput"],
	/** Краткое наименование организации */
	short_name: string,
	/** Тип организации */
	type: GraphQLTypes["OrganizationType"]
};
	["CreateOrganizationDataInput"]: {
		/** Банковский счет организации */
	bank_account: GraphQLTypes["BankAccountInput"],
	/** Город */
	city: string,
	/** Страна */
	country: string,
	/** Детали организации */
	details: GraphQLTypes["OrganizationDetailsInput"],
	/** Фактический адрес */
	fact_address: string,
	/** Полный адрес */
	full_address: string,
	/** Полное наименование организации */
	full_name: string,
	/** Телефон */
	phone: string,
	/** Представитель организации */
	represented_by: GraphQLTypes["RepresentedByInput"],
	/** Краткое наименование организации */
	short_name: string,
	/** Тип организации */
	type: GraphQLTypes["OrganizationType"]
};
	["CreateSovietIndividualDataInput"]: {
		/** Дата рождения */
	birthdate: string,
	/** Email адрес */
	email: string,
	/** Имя */
	first_name: string,
	/** Полный адрес */
	full_address: string,
	/** Фамилия */
	last_name: string,
	/** Отчество */
	middle_name: string,
	/** Данные паспорта */
	passport?: GraphQLTypes["PassportInput"] | undefined | null,
	/** Телефон */
	phone: string
};
	["CreateSubscriptionInput"]: {
		/** Данные подписки */
	subscription: GraphQLTypes["WebPushSubscriptionDataInput"],
	/** User Agent браузера */
	userAgent?: string | undefined | null,
	/** Username пользователя */
	username: string
};
	["CreateSubscriptionResponse"]: {
	__typename: "CreateSubscriptionResponse",
	/** Сообщение о результате операции */
	message: string,
	/** Данные созданной подписки */
	subscription: GraphQLTypes["WebPushSubscriptionDto"],
	/** Успешно ли создана подписка */
	success: boolean,
	['...on CreateSubscriptionResponse']: Omit<GraphQLTypes["CreateSubscriptionResponse"], "...on CreateSubscriptionResponse">
};
	["CurrentTableState"]: {
	__typename: "CurrentTableState",
	/** Номер блока, в котором была последняя запись */
	block_num: number,
	/** Код контракта */
	code: string,
	/** Дата создания последней записи */
	created_at: GraphQLTypes["DateTime"],
	/** Первичный ключ */
	primary_key: string,
	/** Область действия */
	scope: string,
	/** Имя таблицы */
	table: string,
	/** Данные записи в формате JSON */
	value?: GraphQLTypes["JSON"] | undefined | null,
	['...on CurrentTableState']: Omit<GraphQLTypes["CurrentTableState"], "...on CurrentTableState">
};
	/** Статус цикла в системе CAPITAL */
["CycleStatus"]: CycleStatus;
	/** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
["DateTime"]: "scalar" & { name: "DateTime" };
	["DeactivateSubscriptionInput"]: {
		/** ID подписки для деактивации */
	subscriptionId: string
};
	/** Статус долга в системе CAPITAL */
["DebtStatus"]: DebtStatus;
	/** Комплексный объект решения совета, включающий в себя информацию о голосовавших членах совета, расширенное действие, которое привело к появлению решения, и агрегат документа самого решения. */
["DecisionDetailAggregate"]: {
	__typename: "DecisionDetailAggregate",
	action: GraphQLTypes["ExtendedBlockchainAction"],
	documentAggregate: GraphQLTypes["DocumentAggregate"],
	votes_against: Array<GraphQLTypes["ExtendedBlockchainAction"]>,
	votes_for: Array<GraphQLTypes["ExtendedBlockchainAction"]>,
	['...on DecisionDetailAggregate']: Omit<GraphQLTypes["DecisionDetailAggregate"], "...on DecisionDetailAggregate">
};
	["DeleteBranchInput"]: {
		/** Имя аккаунта кооперативного участка */
	braname: string,
	/** Имя аккаунта кооператива */
	coopname: string
};
	["DeletePaymentMethodInput"]: {
		/** Идентификатор метода оплаты */
	method_id: string,
	/** Имя пользователя, чей метод оплаты нужно удалить */
	username: string
};
	["DeleteTrustedAccountInput"]: {
		/** Имя аккаунта кооперативного участка */
	braname: string,
	/** Имя аккаунта кооператива */
	coopname: string,
	/** Имя аккаунта доверонного лица, у которого отзывается право подписи за председателя кооперативного участка */
	trusted: string
};
	["Delta"]: {
	__typename: "Delta",
	/** ID блока */
	block_id: string,
	/** Номер блока */
	block_num: number,
	/** ID блокчейна */
	chain_id: string,
	/** Код контракта */
	code: string,
	/** Дата создания */
	created_at: GraphQLTypes["DateTime"],
	/** Уникальный идентификатор */
	id: string,
	/** Флаг присутствия записи */
	present: boolean,
	/** Первичный ключ */
	primary_key: string,
	/** Область действия */
	scope: string,
	/** Имя таблицы */
	table: string,
	/** Данные записи в формате JSON */
	value?: GraphQLTypes["JSON"] | undefined | null,
	['...on Delta']: Omit<GraphQLTypes["Delta"], "...on Delta">
};
	["Desktop"]: {
	__typename: "Desktop",
	/** Домашняя страница для авторизованных пользователей */
	authorizedHome: string,
	/** Имя аккаунта кооператива */
	coopname: string,
	/** Имя шаблона рабочих столов */
	layout: string,
	/** Домашняя страница для неавторизованных пользователей */
	nonAuthorizedHome: string,
	/** Состав приложений рабочего стола */
	workspaces: Array<GraphQLTypes["DesktopWorkspace"]>,
	['...on Desktop']: Omit<GraphQLTypes["Desktop"], "...on Desktop">
};
	["DesktopConfig"]: {
	__typename: "DesktopConfig",
	/** Маршрут по умолчанию */
	defaultRoute?: string | undefined | null,
	/** Иконка для меню */
	icon?: string | undefined | null,
	/** Уникальное имя workspace */
	name: string,
	/** Отображаемое название workspace */
	title: string,
	['...on DesktopConfig']: Omit<GraphQLTypes["DesktopConfig"], "...on DesktopConfig">
};
	["DesktopWorkspace"]: {
	__typename: "DesktopWorkspace",
	/** Маршрут по умолчанию для этого workspace */
	defaultRoute?: string | undefined | null,
	/** Имя расширения, которому принадлежит этот workspace */
	extension_name: string,
	/** Иконка для меню */
	icon?: string | undefined | null,
	/** Уникальное имя workspace */
	name: string,
	/** Отображаемое название workspace */
	title: string,
	['...on DesktopWorkspace']: Omit<GraphQLTypes["DesktopWorkspace"], "...on DesktopWorkspace">
};
	["DocumentAggregate"]: {
	__typename: "DocumentAggregate",
	document: GraphQLTypes["SignedDigitalDocument"],
	hash: string,
	rawDocument?: GraphQLTypes["GeneratedDocument"] | undefined | null,
	['...on DocumentAggregate']: Omit<GraphQLTypes["DocumentAggregate"], "...on DocumentAggregate">
};
	/** Комплексный объект папки цифрового документа с агрегатами, который включает в себя заявление, решение, акты и связанные документы */
["DocumentPackageAggregate"]: {
	__typename: "DocumentPackageAggregate",
	/** Массив объект(ов) актов с агрегатами, относящихся к заявлению */
	acts: Array<GraphQLTypes["ActDetailAggregate"]>,
	/** Объект цифрового документа решения с агрегатом */
	decision?: GraphQLTypes["DecisionDetailAggregate"] | undefined | null,
	/** Массив связанных документов с агрегатами, извлечённых из мета-данных */
	links: Array<GraphQLTypes["DocumentAggregate"]>,
	/** Объект цифрового документа заявления с агрегатом */
	statement?: GraphQLTypes["StatementDetailAggregate"] | undefined | null,
	['...on DocumentPackageAggregate']: Omit<GraphQLTypes["DocumentPackageAggregate"], "...on DocumentPackageAggregate">
};
	["EditBranchInput"]: {
		/** Документ, на основании которого действует Уполномоченный (решение совета №СС-.. от ..) */
	based_on: string,
	/** Имя аккаунта кооперативного участка */
	braname: string,
	/** Имя аккаунта кооператива */
	coopname: string,
	/** Электронная почта */
	email: string,
	/** Фактический адрес */
	fact_address: string,
	/** Полное имя организации кооперативного участка */
	full_name: string,
	/** Телефон */
	phone: string,
	/** Краткое имя организации кооперативного участка */
	short_name: string,
	/** Имя аккаунта уполномоченного (председателя) кооперативного участка */
	trustee: string
};
	["Entrepreneur"]: {
	__typename: "Entrepreneur",
	/** Дата рождения */
	birthdate: string,
	/** Город */
	city: string,
	/** Страна */
	country: string,
	/** Детали ИП (ИНН, ОГРН) */
	details: GraphQLTypes["EntrepreneurDetails"],
	/** Email */
	email: string,
	/** Имя */
	first_name: string,
	/** Юридический адрес */
	full_address: string,
	/** Фамилия */
	last_name: string,
	/** Отчество */
	middle_name: string,
	/** Телефон */
	phone: string,
	/** Имя аккаунта */
	username: string,
	['...on Entrepreneur']: Omit<GraphQLTypes["Entrepreneur"], "...on Entrepreneur">
};
	["EntrepreneurCertificate"]: {
	__typename: "EntrepreneurCertificate",
	/** Имя */
	first_name: string,
	/** ИНН */
	inn: string,
	/** Фамилия */
	last_name: string,
	/** Отчество */
	middle_name?: string | undefined | null,
	/** Тип аккаунта */
	type: GraphQLTypes["AccountType"],
	/** Имя аккаунта */
	username: string,
	['...on EntrepreneurCertificate']: Omit<GraphQLTypes["EntrepreneurCertificate"], "...on EntrepreneurCertificate">
};
	["EntrepreneurDetails"]: {
	__typename: "EntrepreneurDetails",
	/** ИНН */
	inn: string,
	/** ОГРН */
	ogrn: string,
	['...on EntrepreneurDetails']: Omit<GraphQLTypes["EntrepreneurDetails"], "...on EntrepreneurDetails">
};
	["EntrepreneurDetailsInput"]: {
		/** ИНН */
	inn: string,
	/** ОГРН */
	ogrn: string
};
	/** Статус расхода в системе CAPITAL */
["ExpenseStatus"]: ExpenseStatus;
	/** Расширенное действие блокчейна с сертификатом пользователя, совершившего его. */
["ExtendedBlockchainAction"]: {
	__typename: "ExtendedBlockchainAction",
	account: string,
	account_ram_deltas: Array<GraphQLTypes["AccountRamDelta"]>,
	action_ordinal: number,
	/** Сертификат пользователя (сокращенная информация) */
	actor_certificate?: GraphQLTypes["UserCertificateUnion"] | undefined | null,
	authorization: Array<GraphQLTypes["ActionAuthorization"]>,
	block_id: string,
	block_num: number,
	chain_id: string,
	console: string,
	context_free: boolean,
	creator_action_ordinal: number,
	/** Данные действия в формате JSON */
	data: GraphQLTypes["JSON"],
	elapsed: number,
	global_sequence: string,
	name: string,
	receipt: GraphQLTypes["ActionReceipt"],
	receiver: string,
	transaction_id: string,
	['...on ExtendedBlockchainAction']: Omit<GraphQLTypes["ExtendedBlockchainAction"], "...on ExtendedBlockchainAction">
};
	/** Расширенный статус собрания на основе дат и состояния */
["ExtendedMeetStatus"]: ExtendedMeetStatus;
	["Extension"]: {
	__typename: "Extension",
	/** Настройки конфигурации для расширения */
	config?: GraphQLTypes["JSON"] | undefined | null,
	/** Дата создания расширения */
	created_at: GraphQLTypes["DateTime"],
	/** Описание расширения */
	description?: string | undefined | null,
	/** Массив рабочих столов, которые предоставляет расширение */
	desktops?: Array<GraphQLTypes["DesktopConfig"]> | undefined | null,
	/** Показывает, включено ли расширение */
	enabled: boolean,
	/** Внешняя ссылка на iframe-интерфейс расширения */
	external_url?: string | undefined | null,
	/** Изображение для расширения */
	image?: string | undefined | null,
	/** Поле инструкция для установки (INSTALL) */
	instructions: string,
	/** Показывает, доступно ли расширение */
	is_available: boolean,
	/** Показывает, встроенное ли это расширение */
	is_builtin: boolean,
	/** Показывает, установлено ли расширение */
	is_installed: boolean,
	/** Показывает, внутреннее ли это расширение */
	is_internal: boolean,
	/** Уникальное имя расширения */
	name: string,
	/** Поле подробного текстового описания (README) */
	readme: string,
	/** Схема настроек конфигурации для расширения */
	schema?: GraphQLTypes["JSON"] | undefined | null,
	/** Массив тегов для расширения */
	tags: Array<string>,
	/** Заголовок расширения */
	title?: string | undefined | null,
	/** Дата последнего обновления расширения */
	updated_at: GraphQLTypes["DateTime"],
	['...on Extension']: Omit<GraphQLTypes["Extension"], "...on Extension">
};
	["ExtensionInput"]: {
		/** Объект конфигурации расширения */
	config: GraphQLTypes["JSON"],
	/** Дата установки расширения */
	created_at?: GraphQLTypes["DateTime"] | undefined | null,
	/** Флаг того, включено ли расширение сейчас */
	enabled: boolean,
	/** Уникальное имя расширения (является идентификатором) */
	name: string,
	/** Дата обновления расширения */
	updated_at?: GraphQLTypes["DateTime"] | undefined | null
};
	["ExtensionLog"]: {
	__typename: "ExtensionLog",
	/** Дата создания записи */
	created_at: GraphQLTypes["DateTime"],
	/** Данные лога в формате JSON */
	data?: string | undefined | null,
	/** Локальный ID записи лога в рамках расширения */
	extension_local_id: number,
	/** Глобальный ID записи лога */
	id: number,
	/** Имя расширения */
	name: string,
	/** Дата последнего обновления записи */
	updated_at: GraphQLTypes["DateTime"],
	['...on ExtensionLog']: Omit<GraphQLTypes["ExtensionLog"], "...on ExtensionLog">
};
	["ExtensionLogsPaginationResult"]: {
	__typename: "ExtensionLogsPaginationResult",
	/** Текущая страница */
	currentPage: number,
	/** Элементы текущей страницы */
	items: Array<GraphQLTypes["ExtensionLog"]>,
	/** Общее количество элементов */
	totalCount: number,
	/** Общее количество страниц */
	totalPages: number,
	['...on ExtensionLogsPaginationResult']: Omit<GraphQLTypes["ExtensionLogsPaginationResult"], "...on ExtensionLogsPaginationResult">
};
	["GatewayPayment"]: {
	__typename: "GatewayPayment",
	/** Данные из блокчейна */
	blockchain_data?: GraphQLTypes["JSON"] | undefined | null,
	/** Можно ли изменить статус */
	can_change_status: boolean,
	/** Название кооператива */
	coopname: string,
	/** Дата создания */
	created_at: GraphQLTypes["DateTime"],
	/** Направление платежа */
	direction: GraphQLTypes["PaymentDirection"],
	/** Человекочитаемое направление платежа */
	direction_label: string,
	/** Дата истечения */
	expired_at?: GraphQLTypes["DateTime"] | undefined | null,
	/** Форматированная сумма */
	formatted_amount: string,
	/** Хеш платежа */
	hash?: string | undefined | null,
	/** Уникальный идентификатор платежа */
	id?: GraphQLTypes["ID"] | undefined | null,
	/** Хеш входящего платежа (устарело) */
	income_hash?: string | undefined | null,
	/** Завершен ли платеж окончательно */
	is_final: boolean,
	/** Дополнительная информация */
	memo?: string | undefined | null,
	/** Сообщение */
	message?: string | undefined | null,
	/** Хеш исходящего платежа (устарело) */
	outcome_hash?: string | undefined | null,
	/** Детали платежа */
	payment_details?: GraphQLTypes["PaymentDetails"] | undefined | null,
	/** ID платежного метода */
	payment_method_id?: string | undefined | null,
	/** Провайдер платежа */
	provider?: string | undefined | null,
	/** Количество/сумма */
	quantity: number,
	/** Подписанный документ заявления */
	statement?: GraphQLTypes["JSON"] | undefined | null,
	/** Статус платежа */
	status: GraphQLTypes["PaymentStatus"],
	/** Человекочитаемый статус */
	status_label: string,
	/** Символ валюты */
	symbol: string,
	/** Тип платежа */
	type: GraphQLTypes["PaymentType"],
	/** Человекочитаемый тип платежа */
	type_label: string,
	/** Дата обновления */
	updated_at?: GraphQLTypes["DateTime"] | undefined | null,
	/** Имя пользователя */
	username: string,
	/** Сертификат пользователя, создавшего платеж */
	username_certificate?: GraphQLTypes["UserCertificateUnion"] | undefined | null,
	['...on GatewayPayment']: Omit<GraphQLTypes["GatewayPayment"], "...on GatewayPayment">
};
	["GenerateDocumentOptionsInput"]: {
		/** Язык документа */
	lang?: string | undefined | null,
	/** Пропустить сохранение */
	skip_save?: boolean | undefined | null
};
	["GeneratedDocument"]: {
	__typename: "GeneratedDocument",
	/** Бинарное содержимое документа (base64) */
	binary: string,
	/** Полное название документа */
	full_title: string,
	/** Хэш документа */
	hash: string,
	/** HTML содержимое документа */
	html: string,
	/** Метаданные документа */
	meta: GraphQLTypes["JSON"],
	['...on GeneratedDocument']: Omit<GraphQLTypes["GeneratedDocument"], "...on GeneratedDocument">
};
	["GeneratedRegistrationDocument"]: {
	__typename: "GeneratedRegistrationDocument",
	/** Тип соглашения для блокчейна */
	agreement_type: string,
	/** Текст для галочки на фронтенде */
	checkbox_text: string,
	/** Сгенерированный документ */
	document: GraphQLTypes["GeneratedDocument"],
	/** Идентификатор соглашения (wallet_agreement, signature_agreement и т.д.) */
	id: string,
	/** Нужно ли отправлять в блокчейн как agreement */
	is_blockchain_agreement: boolean,
	/** Текст ссылки для открытия диалога чтения */
	link_text: string,
	/** Нужно ли линковать в заявление */
	link_to_statement: boolean,
	/** Порядок отображения */
	order: number,
	/** Название документа */
	title: string,
	['...on GeneratedRegistrationDocument']: Omit<GraphQLTypes["GeneratedRegistrationDocument"], "...on GeneratedRegistrationDocument">
};
	["GetAccountInput"]: {
		/** Имя аккаунта пользователя */
	username: string
};
	["GetAccountsInput"]: {
		role?: string | undefined | null
};
	["GetBranchesInput"]: {
		/** Фильтр по имени аккаунта кооперативного участка */
	braname?: string | undefined | null,
	/** Имя аккаунта кооператива */
	coopname: string
};
	/** Входные данные для получения логов событий по задаче */
["GetCapitalIssueLogsInput"]: {
		/** Хеш задачи */
	issue_hash: string
};
	/** Входные данные для получения логов событий с фильтрацией и пагинацией */
["GetCapitalLogsInput"]: {
		/** Фильтры для поиска логов */
	filter?: GraphQLTypes["CapitalLogFilterInput"] | undefined | null,
	/** Параметры пагинации */
	pagination?: GraphQLTypes["PaginationInput"] | undefined | null
};
	["GetExtensionLogsInput"]: {
		/** Фильтр по дате создания (от) */
	createdFrom?: GraphQLTypes["DateTime"] | undefined | null,
	/** Фильтр по дате создания (до) */
	createdTo?: GraphQLTypes["DateTime"] | undefined | null,
	/** Фильтр по имени расширения */
	name?: string | undefined | null
};
	["GetExtensionsInput"]: {
		/** Фильтр включенных расширений */
	enabled?: boolean | undefined | null,
	/** Фильтр активности */
	is_available?: boolean | undefined | null,
	/** Фильтр рабочих столов */
	is_desktop?: boolean | undefined | null,
	/** Фильтр установленных расширений */
	is_installed?: boolean | undefined | null,
	/** Фильтр по имени */
	name?: string | undefined | null
};
	["GetInstallationStatusInput"]: {
		/** Код установки */
	install_code: string
};
	["GetPaymentMethodsInput"]: {
		/** Количество элементов на странице */
	limit: number,
	/** Номер страницы */
	page: number,
	/** Ключ сортировки (например, "name") */
	sortBy?: string | undefined | null,
	/** Направление сортировки ("ASC" или "DESC") */
	sortOrder: string,
	/** Имя пользователя для фильтрации методов оплаты */
	username?: string | undefined | null
};
	["GetUserSubscriptionsInput"]: {
		/** Username пользователя */
	username: string
};
	["Individual"]: {
	__typename: "Individual",
	/** Дата рождения */
	birthdate: string,
	/** Email */
	email: string,
	/** Имя */
	first_name: string,
	/** Полный адрес */
	full_address: string,
	/** Фамилия */
	last_name: string,
	/** Отчество */
	middle_name: string,
	/** Данные паспорта */
	passport?: GraphQLTypes["Passport"] | undefined | null,
	/** Телефон */
	phone: string,
	/** Имя аккаунта */
	username: string,
	['...on Individual']: Omit<GraphQLTypes["Individual"], "...on Individual">
};
	["IndividualCertificate"]: {
	__typename: "IndividualCertificate",
	/** Имя */
	first_name: string,
	/** Фамилия */
	last_name: string,
	/** Отчество */
	middle_name?: string | undefined | null,
	/** Тип аккаунта */
	type: GraphQLTypes["AccountType"],
	/** Имя аккаунта */
	username: string,
	['...on IndividualCertificate']: Omit<GraphQLTypes["IndividualCertificate"], "...on IndividualCertificate">
};
	["Init"]: {
		/** Объект организации кооператива, которая обслуживает данный экземпляр программного обеспечения MONO */
	organization_data: GraphQLTypes["CreateInitOrganizationDataInput"]
};
	["Install"]: {
		soviet: Array<GraphQLTypes["SovietMemberInput"]>,
	vars: GraphQLTypes["SetVarsInput"]
};
	["InstallationStatus"]: {
	__typename: "InstallationStatus",
	/** Есть ли приватный аккаунт */
	has_private_account: boolean,
	/** Инициализация выполнена через сервер */
	init_by_server?: boolean | undefined | null,
	/** Данные организации с банковскими реквизитами */
	organization_data?: GraphQLTypes["OrganizationWithBankAccount"] | undefined | null,
	['...on InstallationStatus']: Omit<GraphQLTypes["InstallationStatus"], "...on InstallationStatus">
};
	/** Статусы инвестиции в системе CAPITAL */
["InvestStatus"]: InvestStatus;
	/** Приоритет задачи в системе CAPITAL */
["IssuePriority"]: IssuePriority;
	/** Статус задачи в системе CAPITAL */
["IssueStatus"]: IssueStatus;
	/** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
["JSON"]: "scalar" & { name: "JSON" };
	["KeyWeight"]: {
	__typename: "KeyWeight",
	/** Ключ */
	key: string,
	/** Вес */
	weight: number,
	['...on KeyWeight']: Omit<GraphQLTypes["KeyWeight"], "...on KeyWeight">
};
	["LedgerOperation"]: {
	__typename: "LedgerOperation",
	/** ID счета */
	account_id: number,
	/** Тип операции */
	action: string,
	/** Комментарий к операции */
	comment?: string | undefined | null,
	/** Имя кооператива */
	coopname: string,
	/** Дата и время создания операции */
	created_at: GraphQLTypes["DateTime"],
	/** Номер глобальной последовательности блокчейна */
	global_sequence: number,
	/** Хеш пакета документов операции */
	hash?: string | undefined | null,
	/** Сумма операции */
	quantity: string,
	/** Имя пользователя, совершившего операцию */
	username?: string | undefined | null,
	['...on LedgerOperation']: Omit<GraphQLTypes["LedgerOperation"], "...on LedgerOperation">
};
	/** Типы сущностей в логах */
["LogEntityType"]: LogEntityType;
	/** Типы событий в системе логирования */
["LogEventType"]: LogEventType;
	/** Данные о собрании кооператива */
["Meet"]: {
	__typename: "Meet",
	/** Документ с решением совета о проведении собрания */
	authorization?: GraphQLTypes["DocumentAggregate"] | undefined | null,
	/** Дата закрытия собрания */
	close_at: GraphQLTypes["DateTime"],
	/** Имя аккаунта кооператива */
	coopname: string,
	/** Дата создания собрания */
	created_at: GraphQLTypes["DateTime"],
	/** Текущий процент кворума */
	current_quorum_percent: number,
	/** Цикл собрания */
	cycle: number,
	/** Документ с решением секретаря */
	decision1?: GraphQLTypes["DocumentAggregate"] | undefined | null,
	/** Документ с решением председателя */
	decision2?: GraphQLTypes["DocumentAggregate"] | undefined | null,
	/** Хеш собрания */
	hash: string,
	/** Уникальный идентификатор собрания */
	id: number,
	/** Инициатор собрания */
	initiator: string,
	/** Сертификат инициатора собрания */
	initiator_certificate?: GraphQLTypes["UserCertificateUnion"] | undefined | null,
	/** Уровень собрания */
	level: string,
	/** Список пользователей, которые подписали уведомление */
	notified_users: Array<string>,
	/** Дата открытия собрания */
	open_at: GraphQLTypes["DateTime"],
	/** Председатель собрания */
	presider: string,
	/** Сертификат председателя собрания */
	presider_certificate?: GraphQLTypes["UserCertificateUnion"] | undefined | null,
	/** Документ с повесткой собрания */
	proposal?: GraphQLTypes["DocumentAggregate"] | undefined | null,
	/** Флаг достижения кворума */
	quorum_passed: boolean,
	/** Процент необходимого кворума */
	quorum_percent: number,
	/** Секретарь собрания */
	secretary: string,
	/** Сертификат секретаря собрания */
	secretary_certificate?: GraphQLTypes["UserCertificateUnion"] | undefined | null,
	/** Количество подписанных бюллетеней */
	signed_ballots: number,
	/** Статус собрания */
	status: string,
	/** Тип собрания */
	type: string,
	['...on Meet']: Omit<GraphQLTypes["Meet"], "...on Meet">
};
	/** Предварительные данные собрания перед обработкой */
["MeetPreProcessing"]: {
	__typename: "MeetPreProcessing",
	/** Повестка собрания */
	agenda: Array<GraphQLTypes["AgendaMeetPoint"]>,
	/** Дата закрытия собрания */
	close_at: GraphQLTypes["DateTime"],
	/** Имя аккаунта кооператива */
	coopname: string,
	/** Дополнительная информация о формате собрания */
	details?: string | undefined | null,
	/** Хеш собрания */
	hash: string,
	/** Инициатор собрания */
	initiator: string,
	/** Сертификат инициатора собрания */
	initiator_certificate?: GraphQLTypes["UserCertificateUnion"] | undefined | null,
	/** Дата открытия собрания */
	open_at: GraphQLTypes["DateTime"],
	/** Председатель собрания */
	presider: string,
	/** Сертификат председателя собрания */
	presider_certificate?: GraphQLTypes["UserCertificateUnion"] | undefined | null,
	/** Документ с предложением повестки собрания */
	proposal?: GraphQLTypes["DocumentAggregate"] | undefined | null,
	/** Секретарь собрания */
	secretary: string,
	/** Сертификат секретаря собрания */
	secretary_certificate?: GraphQLTypes["UserCertificateUnion"] | undefined | null,
	['...on MeetPreProcessing']: Omit<GraphQLTypes["MeetPreProcessing"], "...on MeetPreProcessing">
};
	/** Данные о собрании после обработки */
["MeetProcessed"]: {
	__typename: "MeetProcessed",
	/** Имя кооператива */
	coopname: string,
	/** Документ решения из блокчейна */
	decision: GraphQLTypes["SignedDigitalDocument"],
	/** Агрегат документа решения */
	decisionAggregate?: GraphQLTypes["DocumentAggregate"] | undefined | null,
	/** Хеш собрания */
	hash: string,
	/** Председатель собрания */
	presider: string,
	/** Сертификат председателя собрания */
	presider_certificate?: GraphQLTypes["UserCertificateUnion"] | undefined | null,
	/** Пройден ли кворум */
	quorum_passed: boolean,
	/** Процент кворума */
	quorum_percent: number,
	/** Результаты голосования по вопросам */
	results: Array<GraphQLTypes["MeetQuestionResult"]>,
	/** Секретарь собрания */
	secretary: string,
	/** Сертификат секретаря собрания */
	secretary_certificate?: GraphQLTypes["UserCertificateUnion"] | undefined | null,
	/** Количество подписанных бюллетеней */
	signed_ballots: number,
	['...on MeetProcessed']: Omit<GraphQLTypes["MeetProcessed"], "...on MeetProcessed">
};
	/** Данные о собрании в процессе обработки */
["MeetProcessing"]: {
	__typename: "MeetProcessing",
	/** Расширенный статус собрания на основе дат и состояния */
	extendedStatus: GraphQLTypes["ExtendedMeetStatus"],
	/** Хеш собрания */
	hash: string,
	/** Флаг указывающий, голосовал ли текущий пользователь */
	isVoted: boolean,
	/** Основная информация о собрании */
	meet: GraphQLTypes["Meet"],
	/** Список вопросов повестки собрания */
	questions: Array<GraphQLTypes["Question"]>,
	['...on MeetProcessing']: Omit<GraphQLTypes["MeetProcessing"], "...on MeetProcessing">
};
	/** Результат голосования по вопросу */
["MeetQuestionResult"]: {
	__typename: "MeetQuestionResult",
	/** Принят ли вопрос */
	accepted: boolean,
	/** Контекст вопроса */
	context: string,
	/** Принятое решение */
	decision: string,
	/** Порядковый номер вопроса */
	number: number,
	/** Идентификатор вопроса */
	question_id: number,
	/** Заголовок вопроса */
	title: string,
	/** Количество воздержавшихся */
	votes_abstained: number,
	/** Количество голосов против */
	votes_against: number,
	/** Количество голосов за */
	votes_for: number,
	['...on MeetQuestionResult']: Omit<GraphQLTypes["MeetQuestionResult"], "...on MeetQuestionResult">
};
	["MonoAccount"]: {
	__typename: "MonoAccount",
	/** Электронная почта пользователя */
	email: string,
	/** Есть ли у пользователя аккаунт */
	has_account: boolean,
	/** ID начального заказа */
	initial_order?: string | undefined | null,
	/** Подтверждена ли электронная почта */
	is_email_verified: boolean,
	/** Зарегистрирован ли пользователь */
	is_registered: boolean,
	/** Сообщение */
	message?: string | undefined | null,
	/** Публичный ключ пользователя */
	public_key: string,
	/** Реферер пользователя */
	referer: string,
	/** Роль пользователя */
	role: string,
	/** Статус пользователя */
	status: GraphQLTypes["UserStatus"],
	/** Хэш подписчика для уведомлений */
	subscriber_hash: string,
	/** Идентификатор подписчика для уведомлений */
	subscriber_id: string,
	/** Тип пользователя */
	type: string,
	/** Имя пользователя */
	username: string,
	['...on MonoAccount']: Omit<GraphQLTypes["MonoAccount"], "...on MonoAccount">
};
	["Mutation"]: {
	__typename: "Mutation",
	/** Добавить метод оплаты (банковский счёт или СБП) */
	addPaymentMethod: GraphQLTypes["PaymentMethod"],
	/** Добавить доверенное лицо кооперативного участка

Требуемые роли: chairman.  */
	addTrustedAccount: GraphQLTypes["Branch"],
	/** Создать кооперативный участок

Требуемые роли: chairman.  */
	createBranch: GraphQLTypes["Branch"],
	/** Создать веб-пуш подписку для пользователя

Требуемые роли: chairman, member.  */
	createWebPushSubscription: GraphQLTypes["CreateSubscriptionResponse"],
	/** Деактивировать веб-пуш подписку по ID

Требуемые роли: chairman, member.  */
	deactivateWebPushSubscriptionById: boolean,
	/** Удалить кооперативный участок

Требуемые роли: chairman.  */
	deleteBranch: boolean,
	/** Удалить метод оплаты */
	deletePaymentMethod: boolean,
	/** Удалить доверенное лицо кооперативного участка

Требуемые роли: chairman.  */
	deleteTrustedAccount: GraphQLTypes["Branch"],
	/** Изменить кооперативный участок

Требуемые роли: chairman.  */
	editBranch: GraphQLTypes["Branch"],
	/** Сгенерировать документ, подтверждающий выбор кооперативного участка

Требуемые роли: chairman, member, user.  */
	generateSelectBranchDocument: GraphQLTypes["GeneratedDocument"],
	/** Произвести инициализацию программного обеспечения перед установкой совета методом install */
	initSystem: GraphQLTypes["SystemInfo"],
	/** Установить расширение

Требуемые роли: chairman.  */
	installExtension: GraphQLTypes["Extension"],
	/** Произвести установку членов совета перед началом работы */
	installSystem: GraphQLTypes["SystemInfo"],
	/** Зарегистрировать аккаунт пользователя в системе */
	registerAccount: GraphQLTypes["RegisteredAccount"],
	/** Выбрать кооперативный участок

Требуемые роли: chairman, member, user.  */
	selectBranch: boolean,
	/** Сохранить приватный ключ в зашифрованном серверном хранилище */
	setWif: boolean,
	/** Начать процесс установки кооператива, установить ключ и получить код установки */
	startInstall: GraphQLTypes["StartInstallResult"],
	/** Удалить расширение

Требуемые роли: chairman.  */
	uninstallExtension: boolean,
	/** Обновить аккаунт в системе провайдера. Обновление аккаунта пользователя производится по username. Мутация позволяет изменить приватные данные пользователя, а также, адрес электронной почты в MONO. Использовать мутацию может только председатель совета.

Требуемые роли: chairman.  */
	updateAccount: GraphQLTypes["Account"],
	/** Обновить банковский счёт */
	updateBankAccount: GraphQLTypes["PaymentMethod"],
	/** Обновить расширение

Требуемые роли: chairman.  */
	updateExtension: GraphQLTypes["Extension"],
	/** Обновить настройки системы (рабочие столы и маршруты по умолчанию)

Требуемые роли: chairman.  */
	updateSettings: GraphQLTypes["Settings"],
	/** Обновить параметры системы

Требуемые роли: chairman.  */
	updateSystem: GraphQLTypes["SystemInfo"],
	['...on Mutation']: Omit<GraphQLTypes["Mutation"], "...on Mutation">
};
	["OneCoopDocumentOutput"]: {
	__typename: "OneCoopDocumentOutput",
	/** Тип действия документа */
	action: string,
	/** Номер блока, в котором документ был зафиксирован */
	block_num: number,
	/** Специфичные данные для конкретного типа действия */
	data: GraphQLTypes["JSON"],
	/** SHA-256 хеш основного документа */
	hash: string,
	/** SHA-256 хеш пакета документов */
	package: string,
	['...on OneCoopDocumentOutput']: Omit<GraphQLTypes["OneCoopDocumentOutput"], "...on OneCoopDocumentOutput">
};
	["Organization"]: {
	__typename: "Organization",
	/** Город */
	city: string,
	/** Страна */
	country: string,
	/** Детали организации */
	details: GraphQLTypes["OrganizationDetails"],
	/** Email */
	email: string,
	/** Фактический адрес */
	fact_address: string,
	/** Юридический адрес */
	full_address: string,
	/** Полное название */
	full_name: string,
	/** Телефон */
	phone: string,
	/** Представитель организации */
	represented_by: GraphQLTypes["RepresentedBy"],
	/** Краткое название */
	short_name: string,
	/** Тип организации */
	type: string,
	/** Имя аккаунта организации */
	username: string,
	['...on Organization']: Omit<GraphQLTypes["Organization"], "...on Organization">
};
	["OrganizationCertificate"]: {
	__typename: "OrganizationCertificate",
	/** ИНН */
	inn: string,
	/** ОГРН */
	ogrn: string,
	/** Данные представителя */
	represented_by: GraphQLTypes["RepresentedByCertificate"],
	/** Короткое название организации */
	short_name: string,
	/** Тип аккаунта */
	type: GraphQLTypes["AccountType"],
	/** Имя аккаунта */
	username: string,
	['...on OrganizationCertificate']: Omit<GraphQLTypes["OrganizationCertificate"], "...on OrganizationCertificate">
};
	["OrganizationDetails"]: {
	__typename: "OrganizationDetails",
	/** ИНН */
	inn: string,
	/** КПП */
	kpp: string,
	/** ОГРН */
	ogrn: string,
	['...on OrganizationDetails']: Omit<GraphQLTypes["OrganizationDetails"], "...on OrganizationDetails">
};
	["OrganizationDetailsInput"]: {
		inn: string,
	kpp: string,
	ogrn: string
};
	/** Тип юридического лица */
["OrganizationType"]: OrganizationType;
	["OrganizationWithBankAccount"]: {
	__typename: "OrganizationWithBankAccount",
	/** Банковские реквизиты */
	bank_account?: GraphQLTypes["BankAccount"] | undefined | null,
	/** Город */
	city: string,
	/** Страна */
	country: string,
	/** Детали организации */
	details: GraphQLTypes["OrganizationDetails"],
	/** Email */
	email: string,
	/** Фактический адрес */
	fact_address: string,
	/** Юридический адрес */
	full_address: string,
	/** Полное название */
	full_name: string,
	/** Телефон */
	phone: string,
	/** Представитель организации */
	represented_by: GraphQLTypes["RepresentedBy"],
	/** Краткое название */
	short_name: string,
	/** Тип организации */
	type: string,
	/** Имя аккаунта организации */
	username: string,
	['...on OrganizationWithBankAccount']: Omit<GraphQLTypes["OrganizationWithBankAccount"], "...on OrganizationWithBankAccount">
};
	["PaginatedCapitalLogsPaginationResult"]: {
	__typename: "PaginatedCapitalLogsPaginationResult",
	/** Текущая страница */
	currentPage: number,
	/** Элементы текущей страницы */
	items: Array<GraphQLTypes["CapitalLog"]>,
	/** Общее количество элементов */
	totalCount: number,
	/** Общее количество страниц */
	totalPages: number,
	['...on PaginatedCapitalLogsPaginationResult']: Omit<GraphQLTypes["PaginatedCapitalLogsPaginationResult"], "...on PaginatedCapitalLogsPaginationResult">
};
	["PaginationInput"]: {
		/** Количество элементов на странице */
	limit: number,
	/** Номер страницы */
	page: number,
	/** Ключ сортировки (например, "name") */
	sortBy?: string | undefined | null,
	/** Направление сортировки ("ASC" или "DESC") */
	sortOrder: string
};
	["ParticipantAccount"]: {
	__typename: "ParticipantAccount",
	/** Имя кооперативного участка */
	braname?: string | undefined | null,
	/** Время создания записи о члене */
	created_at: GraphQLTypes["DateTime"],
	/** LEGACY Флаг, имеет ли член право голоса */
	has_vote: boolean,
	/** Сумма вступительного взноса */
	initial_amount?: string | undefined | null,
	/** LEGACY Флаг, внесен ли регистрационный взнос */
	is_initial: boolean,
	/** LEGACY Флаг, внесен ли минимальный паевый взнос */
	is_minimum: boolean,
	/** Время последнего минимального платежа */
	last_min_pay: GraphQLTypes["DateTime"],
	/** Время последнего обновления информации о члене */
	last_update: GraphQLTypes["DateTime"],
	/** Сумма минимального паевого взноса */
	minimum_amount?: string | undefined | null,
	/** Статус члена кооператива (accepted | blocked) */
	status: string,
	/** Тип участника (individual | entrepreneur | organization) */
	type?: string | undefined | null,
	/** Уникальное имя члена кооператива */
	username: string,
	['...on ParticipantAccount']: Omit<GraphQLTypes["ParticipantAccount"], "...on ParticipantAccount">
};
	["Passport"]: {
	__typename: "Passport",
	/** Код подразделения */
	code: string,
	/** Дата выдачи */
	issued_at: string,
	/** Кем выдан */
	issued_by: string,
	/** Номер паспорта */
	number: number,
	/** Серия паспорта */
	series: number,
	['...on Passport']: Omit<GraphQLTypes["Passport"], "...on Passport">
};
	["PassportInput"]: {
		code: string,
	issued_at: string,
	issued_by: string,
	number: number,
	series: number
};
	["PaymentDetails"]: {
	__typename: "PaymentDetails",
	/** Сумма платежа с учетом комиссии */
	amount_plus_fee: string,
	/** Сумма платежа без учета комиссии */
	amount_without_fee: string,
	/** Данные платежа (QR-код, токен, реквизиты и т.д.) */
	data: GraphQLTypes["JSON"],
	/** Фактический процент комиссии */
	fact_fee_percent: number,
	/** Размер комиссии в абсолютных значениях */
	fee_amount: string,
	/** Процент комиссии */
	fee_percent: number,
	/** Допустимый процент отклонения */
	tolerance_percent: number,
	['...on PaymentDetails']: Omit<GraphQLTypes["PaymentDetails"], "...on PaymentDetails">
};
	/** Направление платежа */
["PaymentDirection"]: PaymentDirection;
	["PaymentMethod"]: {
	__typename: "PaymentMethod",
	/** Дата создания */
	created_at: GraphQLTypes["DateTime"],
	/** Данные метода оплаты */
	data: GraphQLTypes["PaymentMethodData"],
	/** Флаг основного метода платежа, который отображается в документах */
	is_default: boolean,
	/** Идентификатор метода оплаты */
	method_id: string,
	/** Тип метода оплаты (например, sbp, bank_transfer) */
	method_type: string,
	/** Дата обновления */
	updated_at: GraphQLTypes["DateTime"],
	/** Имя пользователя, к которому привязан метод оплаты */
	username: string,
	['...on PaymentMethod']: Omit<GraphQLTypes["PaymentMethod"], "...on PaymentMethod">
};
	["PaymentMethodData"]:{
        	__typename:"BankAccount" | "SbpAccount"
        	['...on BankAccount']: '__union' & GraphQLTypes["BankAccount"];
	['...on SbpAccount']: '__union' & GraphQLTypes["SbpAccount"];
};
	["PaymentMethodPaginationResult"]: {
	__typename: "PaymentMethodPaginationResult",
	/** Текущая страница */
	currentPage: number,
	/** Элементы текущей страницы */
	items: Array<GraphQLTypes["PaymentMethod"]>,
	/** Общее количество элементов */
	totalCount: number,
	/** Общее количество страниц */
	totalPages: number,
	['...on PaymentMethodPaginationResult']: Omit<GraphQLTypes["PaymentMethodPaginationResult"], "...on PaymentMethodPaginationResult">
};
	/** Статус платежа */
["PaymentStatus"]: PaymentStatus;
	/** Тип платежа по назначению */
["PaymentType"]: PaymentType;
	["Permission"]: {
	__typename: "Permission",
	/** Родительское разрешение */
	parent: string,
	/** Имя разрешения */
	perm_name: string,
	/** Требуемые разрешения */
	required_auth: GraphQLTypes["Authority"],
	['...on Permission']: Omit<GraphQLTypes["Permission"], "...on Permission">
};
	["PermissionLevel"]: {
	__typename: "PermissionLevel",
	/** Актор */
	actor: string,
	/** Разрешение */
	permission: string,
	['...on PermissionLevel']: Omit<GraphQLTypes["PermissionLevel"], "...on PermissionLevel">
};
	["PermissionLevelWeight"]: {
	__typename: "PermissionLevelWeight",
	/** Уровень разрешения */
	permission: GraphQLTypes["PermissionLevel"],
	/** Вес */
	weight: number,
	['...on PermissionLevelWeight']: Omit<GraphQLTypes["PermissionLevelWeight"], "...on PermissionLevelWeight">
};
	["PrivateAccount"]: {
	__typename: "PrivateAccount",
	entrepreneur_data?: GraphQLTypes["Entrepreneur"] | undefined | null,
	individual_data?: GraphQLTypes["Individual"] | undefined | null,
	organization_data?: GraphQLTypes["Organization"] | undefined | null,
	/** Тип аккаунта */
	type: GraphQLTypes["AccountType"],
	['...on PrivateAccount']: Omit<GraphQLTypes["PrivateAccount"], "...on PrivateAccount">
};
	["PrivateAccountSearchData"]:{
        	__typename:"Entrepreneur" | "Individual" | "Organization"
        	['...on Entrepreneur']: '__union' & GraphQLTypes["Entrepreneur"];
	['...on Individual']: '__union' & GraphQLTypes["Individual"];
	['...on Organization']: '__union' & GraphQLTypes["Organization"];
};
	["PrivateAccountSearchResult"]: {
	__typename: "PrivateAccountSearchResult",
	/** Данные найденного аккаунта */
	data: GraphQLTypes["PrivateAccountSearchData"],
	/** Поля, в которых найдены совпадения */
	highlightedFields?: Array<string> | undefined | null,
	/** Оценка релевантности результата */
	score?: number | undefined | null,
	/** Тип аккаунта */
	type: string,
	['...on PrivateAccountSearchResult']: Omit<GraphQLTypes["PrivateAccountSearchResult"], "...on PrivateAccountSearchResult">
};
	["ProcessEdge"]: {
	__typename: "ProcessEdge",
	id: string,
	source: string,
	target: string,
	['...on ProcessEdge']: Omit<GraphQLTypes["ProcessEdge"], "...on ProcessEdge">
};
	["ProcessStepPosition"]: {
	__typename: "ProcessStepPosition",
	x: number,
	y: number,
	['...on ProcessStepPosition']: Omit<GraphQLTypes["ProcessStepPosition"], "...on ProcessStepPosition">
};
	["ProcessStepPositionInput"]: {
		x: number,
	y: number
};
	["ProcessStepState"]: {
	__typename: "ProcessStepState",
	completed_at?: GraphQLTypes["DateTime"] | undefined | null,
	issue_hash?: string | undefined | null,
	status: GraphQLTypes["ProcessStepStatus"],
	step_id: string,
	['...on ProcessStepState']: Omit<GraphQLTypes["ProcessStepState"], "...on ProcessStepState">
};
	["ProcessStepStatus"]: ProcessStepStatus;
	["ProcessStepTemplate"]: {
	__typename: "ProcessStepTemplate",
	description?: string | undefined | null,
	estimate?: number | undefined | null,
	id: string,
	is_start?: boolean | undefined | null,
	position: GraphQLTypes["ProcessStepPosition"],
	title: string,
	['...on ProcessStepTemplate']: Omit<GraphQLTypes["ProcessStepTemplate"], "...on ProcessStepTemplate">
};
	/** Статус программной инвестиции в системе CAPITAL */
["ProgramInvestStatus"]: ProgramInvestStatus;
	/** Тип целевой потребительской программы */
["ProgramType"]: ProgramType;
	["ProgramWallet"]: {
	__typename: "ProgramWallet",
	/** Идентификатор соглашения */
	agreement_id: GraphQLTypes["ID"],
	/** Доступный баланс (формат: "100.0000 RUB") */
	available: string,
	/** Номер блока последнего обновления */
	blockNum?: number | undefined | null,
	/** Заблокированный баланс (формат: "100.0000 RUB") */
	blocked: string,
	/** Имя кооператива */
	coopname: string,
	/** Уникальный идентификатор кошелька в блокчейне */
	id: GraphQLTypes["ID"],
	/** Паевой взнос (формат: "100.0000 RUB") */
	membership_contribution: string,
	/** Идентификатор программы */
	program_id: GraphQLTypes["ID"],
	/** Тип программы */
	program_type?: GraphQLTypes["ProgramType"] | undefined | null,
	/** Имя пользователя */
	username: string,
	['...on ProgramWallet']: Omit<GraphQLTypes["ProgramWallet"], "...on ProgramWallet">
};
	/** Статусы проекта в системе CAPITAL */
["ProjectStatus"]: ProjectStatus;
	["PublicChairman"]: {
	__typename: "PublicChairman",
	first_name: string,
	last_name: string,
	middle_name: string,
	['...on PublicChairman']: Omit<GraphQLTypes["PublicChairman"], "...on PublicChairman">
};
	["Query"]: {
	__typename: "Query",
	/** Получить сводную информацию о аккаунте

Требуемые роли: chairman, member.  */
	getAccount: GraphQLTypes["Account"],
	/** Получить сводную информацию о аккаунтах системы

Требуемые роли: chairman, member.  */
	getAccounts: GraphQLTypes["AccountsPaginationResult"],
	/** Получить список кооперативных участков */
	getBranches: Array<GraphQLTypes["Branch"]>,
	/** Получить логи событий по задаче */
	getCapitalIssueLogs: GraphQLTypes["PaginatedCapitalLogsPaginationResult"],
	/** Получить логи событий по проекту с фильтрацией и пагинацией */
	getCapitalProjectLogs: GraphQLTypes["PaginatedCapitalLogsPaginationResult"],
	/** Получить состав приложений рабочего стола */
	getDesktop: GraphQLTypes["Desktop"],
	/** Получить логи расширений с фильтрацией и пагинацией

Требуемые роли: chairman, member.  */
	getExtensionLogs: GraphQLTypes["ExtensionLogsPaginationResult"],
	/** Получить список расширений

Требуемые роли: chairman.  */
	getExtensions: Array<GraphQLTypes["Extension"]>,
	/** Получить статус установки кооператива с приватными данными */
	getInstallationStatus: GraphQLTypes["InstallationStatus"],
	/** Получить список методов оплаты

Требуемые роли: chairman. Исключение: доступ разрешен, если `data.username` совпадает с `username` текущего пользователя. */
	getPaymentMethods: GraphQLTypes["PaymentMethodPaginationResult"],
	/** Получить конфигурацию программ регистрации для кооператива */
	getRegistrationConfig: GraphQLTypes["RegistrationConfig"],
	/** Получить сводную публичную информацию о системе */
	getSystemInfo: GraphQLTypes["SystemInfo"],
	/** Получить веб-пуш подписки пользователя

Требуемые роли: chairman, member.  */
	getUserWebPushSubscriptions: Array<GraphQLTypes["WebPushSubscriptionDto"]>,
	/** Получить статистику веб-пуш подписок (только для председателя)

Требуемые роли: chairman.  */
	getWebPushSubscriptionStats: GraphQLTypes["SubscriptionStatsDto"],
	/** Поиск приватных данных аккаунтов по запросу. Поиск осуществляется по полям ФИО, ИНН, ОГРН, наименованию организации и другим приватным данным.

Требуемые роли: chairman, member.  */
	searchPrivateAccounts: Array<GraphQLTypes["PrivateAccountSearchResult"]>,
	['...on Query']: Omit<GraphQLTypes["Query"], "...on Query">
};
	/** Вопрос повестки собрания с результатами голосования */
["Question"]: {
	__typename: "Question",
	/** Контекст или дополнительная информация по вопросу */
	context: string,
	/** Имя аккаунта кооператива */
	coopname: string,
	/** Количество голосов "Воздержался" */
	counter_votes_abstained: number,
	/** Количество голосов "Против" */
	counter_votes_against: number,
	/** Количество голосов "За" */
	counter_votes_for: number,
	/** Предлагаемое решение по вопросу */
	decision: string,
	/** Уникальный идентификатор вопроса */
	id: number,
	/** Идентификатор собрания, к которому относится вопрос */
	meet_id: number,
	/** Порядковый номер вопроса в повестке */
	number: number,
	/** Заголовок вопроса */
	title: string,
	/** Список участников, проголосовавших "Воздержался" */
	voters_abstained: Array<string>,
	/** Список участников, проголосовавших "Против" */
	voters_against: Array<string>,
	/** Список участников, проголосовавших "За" */
	voters_for: Array<string>,
	['...on Question']: Omit<GraphQLTypes["Question"], "...on Question">
};
	["RefundRequest"]: {
	__typename: "RefundRequest",
	/** Сумма CPU */
	cpu_amount: string,
	/** Сумма сети */
	net_amount: string,
	/** Владелец */
	owner: string,
	/** Время запроса */
	request_time: string,
	['...on RefundRequest']: Omit<GraphQLTypes["RefundRequest"], "...on RefundRequest">
};
	["RegisterAccountInput"]: {
		/** Электронная почта */
	email: string,
	/** Данные индивидуального предпринимателя */
	entrepreneur_data?: GraphQLTypes["CreateEntrepreneurDataInput"] | undefined | null,
	/** Данные физического лица */
	individual_data?: GraphQLTypes["CreateIndividualDataInput"] | undefined | null,
	/** Данные организации */
	organization_data?: GraphQLTypes["CreateOrganizationDataInput"] | undefined | null,
	/** Публичный ключ */
	public_key: string,
	/** Имя аккаунта реферера */
	referer?: string | undefined | null,
	/** Тип аккаунта */
	type: GraphQLTypes["AccountType"],
	/** Имя пользователя */
	username: string
};
	["RegisteredAccount"]: {
	__typename: "RegisteredAccount",
	/** Информация об зарегистрированном аккаунте */
	account: GraphQLTypes["Account"],
	/** Токены доступа и обновления */
	tokens: GraphQLTypes["Tokens"],
	['...on RegisteredAccount']: Omit<GraphQLTypes["RegisteredAccount"], "...on RegisteredAccount">
};
	["RegistrationConfig"]: {
	__typename: "RegistrationConfig",
	/** Доступные программы */
	programs: Array<GraphQLTypes["RegistrationProgram"]>,
	/** Нужен ли выбор программы */
	requires_selection: boolean,
	['...on RegistrationConfig']: Omit<GraphQLTypes["RegistrationConfig"], "...on RegistrationConfig">
};
	["RegistrationProgram"]: {
	__typename: "RegistrationProgram",
	/** Для каких типов аккаунтов доступна программа */
	applicable_account_types: Array<GraphQLTypes["AccountType"]>,
	/** Описание программы */
	description: string,
	/** URL изображения (опционально) */
	image_url?: string | undefined | null,
	/** Уникальный ключ программы */
	key: string,
	/** Порядок отображения */
	order: number,
	/** Минимальные требования для участия */
	requirements?: string | undefined | null,
	/** Название программы для отображения */
	title: string,
	['...on RegistrationProgram']: Omit<GraphQLTypes["RegistrationProgram"], "...on RegistrationProgram">
};
	["RepresentedBy"]: {
	__typename: "RepresentedBy",
	/** На основании чего действует */
	based_on: string,
	/** Имя */
	first_name: string,
	/** Фамилия */
	last_name: string,
	/** Отчество */
	middle_name: string,
	/** Должность */
	position: string,
	['...on RepresentedBy']: Omit<GraphQLTypes["RepresentedBy"], "...on RepresentedBy">
};
	["RepresentedByCertificate"]: {
	__typename: "RepresentedByCertificate",
	/** Имя */
	first_name: string,
	/** Фамилия */
	last_name: string,
	/** Отчество */
	middle_name: string,
	/** Должность */
	position: string,
	['...on RepresentedByCertificate']: Omit<GraphQLTypes["RepresentedByCertificate"], "...on RepresentedByCertificate">
};
	["RepresentedByInput"]: {
		based_on: string,
	first_name: string,
	last_name: string,
	middle_name: string,
	position: string
};
	["ResourceDelegationDTO"]: {
	__typename: "ResourceDelegationDTO",
	/** Вес CPU */
	cpu_weight: string,
	/** Отправитель */
	from: string,
	/** Вес сети */
	net_weight: string,
	/** Получатель */
	to: string,
	['...on ResourceDelegationDTO']: Omit<GraphQLTypes["ResourceDelegationDTO"], "...on ResourceDelegationDTO">
};
	["ResourceOverview"]: {
	__typename: "ResourceOverview",
	/** Вес CPU */
	cpu_weight: string,
	/** Вес сети */
	net_weight: string,
	/** Владелец */
	owner: string,
	/** Используемая RAM */
	ram_bytes: number,
	['...on ResourceOverview']: Omit<GraphQLTypes["ResourceOverview"], "...on ResourceOverview">
};
	/** Статус результата в системе CAPITAL */
["ResultStatus"]: ResultStatus;
	["SbpAccount"]: {
	__typename: "SbpAccount",
	/** Мобильный телефон получателя */
	phone: string,
	['...on SbpAccount']: Omit<GraphQLTypes["SbpAccount"], "...on SbpAccount">
};
	["SbpDataInput"]: {
		/** Мобильный телефон получателя */
	phone: string
};
	["SearchPrivateAccountsInput"]: {
		/** Поисковый запрос для поиска приватных аккаунтов */
	query: string
};
	/** Статус сегмента участника в проекте CAPITAL */
["SegmentStatus"]: SegmentStatus;
	["SelectBranchGenerateDocumentInput"]: {
		/** Номер блока, на котором был создан документ */
	block_num?: number | undefined | null,
	/** Идентификатор имени аккаунта кооперативного участка */
	braname: string,
	/** Название кооператива, связанное с документом */
	coopname: string,
	/** Дата и время создания документа */
	created_at?: string | undefined | null,
	/** Имя генератора, использованного для создания документа */
	generator?: string | undefined | null,
	/** Язык документа */
	lang?: string | undefined | null,
	/** Ссылки, связанные с документом */
	links?: Array<string> | undefined | null,
	/** Часовой пояс, в котором был создан документ */
	timezone?: string | undefined | null,
	/** Название документа */
	title?: string | undefined | null,
	/** Имя пользователя, создавшего документ */
	username: string,
	/** Версия генератора, использованного для создания документа */
	version?: string | undefined | null
};
	["SelectBranchInput"]: {
		/** Имя аккаунта кооперативного участка */
	braname: string,
	/** Имя аккаунта кооператива */
	coopname: string,
	/** Подписанный электронный документ (generateSelectBranchDocument) */
	document: GraphQLTypes["SelectBranchSignedDocumentInput"],
	/** Имя аккаунта пользователя */
	username: string
};
	["SelectBranchSignedDocumentInput"]: {
		/** Хэш содержимого документа */
	doc_hash: string,
	/** Общий хэш (doc_hash + meta_hash) */
	hash: string,
	/** Метаинформация для документа выбора кооперативного участка */
	meta: GraphQLTypes["SelectBranchSignedMetaDocumentInput"],
	/** Хэш мета-данных */
	meta_hash: string,
	/** Вектор подписей */
	signatures: Array<GraphQLTypes["SignatureInfoInput"]>,
	/** Версия стандарта документа */
	version: string
};
	["SelectBranchSignedMetaDocumentInput"]: {
		/** Номер блока, на котором был создан документ */
	block_num: number,
	/** Идентификатор имени аккаунта кооперативного участка */
	braname: string,
	/** Название кооператива, связанное с документом */
	coopname: string,
	/** Дата и время создания документа */
	created_at: string,
	/** Имя генератора, использованного для создания документа */
	generator: string,
	/** Язык документа */
	lang: string,
	/** Ссылки, связанные с документом */
	links: Array<string>,
	/** ID документа в реестре */
	registry_id: number,
	/** Часовой пояс, в котором был создан документ */
	timezone: string,
	/** Название документа */
	title: string,
	/** Имя пользователя, создавшего документ */
	username: string,
	/** Версия генератора, использованного для создания документа */
	version: string
};
	["SetVarsInput"]: {
		confidential_email: string,
	confidential_link: string,
	contact_email: string,
	coopenomics_agreement?: GraphQLTypes["AgreementVarInput"] | undefined | null,
	coopname: string,
	full_abbr: string,
	full_abbr_dative: string,
	full_abbr_genitive: string,
	name: string,
	participant_application?: GraphQLTypes["AgreementVarInput"] | undefined | null,
	passport_request?: string | undefined | null,
	privacy_agreement?: GraphQLTypes["AgreementVarInput"] | undefined | null,
	short_abbr: string,
	signature_agreement?: GraphQLTypes["AgreementVarInput"] | undefined | null,
	statute_link: string,
	user_agreement?: GraphQLTypes["AgreementVarInput"] | undefined | null,
	wallet_agreement?: GraphQLTypes["AgreementVarInput"] | undefined | null,
	website: string
};
	["SetWifInput"]: {
		/** Тип разрешения ключа */
	permission: string,
	/** Имя пользователя, чей ключ */
	username: string,
	/** Приватный ключ */
	wif: string
};
	["Settings"]: {
	__typename: "Settings",
	/** Маршрут по умолчанию для авторизованных пользователей */
	authorized_default_route: string,
	/** Рабочий стол по умолчанию для авторизованных пользователей */
	authorized_default_workspace: string,
	/** Название кооператива */
	coopname: string,
	/** Дата создания */
	created_at: GraphQLTypes["DateTime"],
	/** Маршрут по умолчанию для неавторизованных пользователей */
	non_authorized_default_route: string,
	/** Рабочий стол по умолчанию для неавторизованных пользователей */
	non_authorized_default_workspace: string,
	/** Имя провайдера платежей по умолчанию */
	provider_name: string,
	/** Дата последнего обновления */
	updated_at: GraphQLTypes["DateTime"],
	['...on Settings']: Omit<GraphQLTypes["Settings"], "...on Settings">
};
	["SignatureInfo"]: {
	__typename: "SignatureInfo",
	id: number,
	is_valid?: boolean | undefined | null,
	meta: GraphQLTypes["JSON"],
	public_key: string,
	signature: string,
	signed_at: string,
	signed_hash: string,
	signer: string,
	/** Сертификат подписанта (сокращенная информация) */
	signer_certificate?: GraphQLTypes["UserCertificateUnion"] | undefined | null,
	['...on SignatureInfo']: Omit<GraphQLTypes["SignatureInfo"], "...on SignatureInfo">
};
	["SignatureInfoInput"]: {
		/** Идентификатор номера подписи */
	id: number,
	/** Мета-данные подписи */
	meta: string,
	/** Публичный ключ */
	public_key: string,
	/** Подпись хэша */
	signature: string,
	/** Время подписания */
	signed_at: string,
	/** Подписанный хэш */
	signed_hash: string,
	/** Аккаунт подписавшего */
	signer: string
};
	["SignedBlockchainDocument"]: {
	__typename: "SignedBlockchainDocument",
	/** Хэш содержимого документа */
	doc_hash: string,
	/** Общий хэш (doc_hash + meta_hash) */
	hash: string,
	/** Метаинформация документа (в формате JSON-строки) */
	meta: string,
	/** Хэш мета-данных */
	meta_hash: string,
	/** Вектор подписей */
	signatures: Array<GraphQLTypes["SignatureInfo"]>,
	/** Версия стандарта документа */
	version: string,
	['...on SignedBlockchainDocument']: Omit<GraphQLTypes["SignedBlockchainDocument"], "...on SignedBlockchainDocument">
};
	["SignedDigitalDocument"]: {
	__typename: "SignedDigitalDocument",
	doc_hash: string,
	hash: string,
	meta: GraphQLTypes["JSON"],
	meta_hash: string,
	signatures: Array<GraphQLTypes["SignatureInfo"]>,
	version: string,
	['...on SignedDigitalDocument']: Omit<GraphQLTypes["SignedDigitalDocument"], "...on SignedDigitalDocument">
};
	["SovietMemberInput"]: {
		individual_data: GraphQLTypes["CreateSovietIndividualDataInput"],
	role: string
};
	["StartInstallInput"]: {
		/** Приватный ключ кооператива */
	wif: string
};
	["StartInstallResult"]: {
	__typename: "StartInstallResult",
	/** Имя кооператива */
	coopname: string,
	/** Код установки для дальнейших операций */
	install_code: string,
	['...on StartInstallResult']: Omit<GraphQLTypes["StartInstallResult"], "...on StartInstallResult">
};
	/** Комплексный объект цифрового документа заявления (или другого ведущего документа для цепочки принятия решений совета) с агрегатом документа */
["StatementDetailAggregate"]: {
	__typename: "StatementDetailAggregate",
	action: GraphQLTypes["ExtendedBlockchainAction"],
	documentAggregate: GraphQLTypes["DocumentAggregate"],
	['...on StatementDetailAggregate']: Omit<GraphQLTypes["StatementDetailAggregate"], "...on StatementDetailAggregate">
};
	/** Статус истории в системе CAPITAL */
["StoryStatus"]: StoryStatus;
	["SubscriptionStatsDto"]: {
	__typename: "SubscriptionStatsDto",
	/** Количество активных подписок */
	active: number,
	/** Количество неактивных подписок */
	inactive: number,
	/** Общее количество подписок */
	total: number,
	/** Количество уникальных пользователей */
	uniqueUsers: number,
	['...on SubscriptionStatsDto']: Omit<GraphQLTypes["SubscriptionStatsDto"], "...on SubscriptionStatsDto">
};
	["Symbols"]: {
	__typename: "Symbols",
	/** Точность символа управления */
	root_govern_precision: number,
	/** Символ управления блокчейном */
	root_govern_symbol: string,
	/** Точность корневого символа */
	root_precision: number,
	/** Корневой символ блокчейна */
	root_symbol: string,
	['...on Symbols']: Omit<GraphQLTypes["Symbols"], "...on Symbols">
};
	["SystemFeatures"]: {
	__typename: "SystemFeatures",
	/** Доступен ли полнотекстовый поиск по документам */
	search: boolean,
	['...on SystemFeatures']: Omit<GraphQLTypes["SystemFeatures"], "...on SystemFeatures">
};
	["SystemInfo"]: {
	__typename: "SystemInfo",
	/** Объект системного аккаунта кооператива в блокчейне */
	blockchain_account: GraphQLTypes["BlockchainAccount"],
	/** Набор данных с информацией о состоянии блокчейна */
	blockchain_info: GraphQLTypes["BlockchainInfoDTO"],
	/** Члены совета кооператива */
	board_members?: Array<GraphQLTypes["BoardMember"]> | undefined | null,
	/** Контакты кооператива */
	contacts?: GraphQLTypes["ContactsDTO"] | undefined | null,
	/** Объект аккаунта кооператива у оператора */
	cooperator_account: GraphQLTypes["CooperativeOperatorAccount"],
	/** Имя аккаунта кооператива */
	coopname: string,
	/** Доступные функции платформы */
	features: GraphQLTypes["SystemFeatures"],
	/** Доступен ли функционал провайдера для подписок и запуска ПО */
	is_providered: boolean,
	/** Требуется ли членство в союзе кооперативов для подключения к кооперативной экономике */
	is_unioned: boolean,
	/** Настройки системы */
	settings: GraphQLTypes["Settings"],
	/** Символы и их точности блокчейна */
	symbols: GraphQLTypes["Symbols"],
	/** Статус контроллера кооператива */
	system_status: GraphQLTypes["SystemStatus"],
	/** Ссылка на анкету для получения членства в союзе кооперативов */
	union_link: string,
	/** Переменные кооператива */
	vars?: GraphQLTypes["Vars"] | undefined | null,
	['...on SystemInfo']: Omit<GraphQLTypes["SystemInfo"], "...on SystemInfo">
};
	/** Состояние контроллера кооператива */
["SystemStatus"]: SystemStatus;
	["Token"]: {
	__typename: "Token",
	/** Дата истечения токена доступа */
	expires: GraphQLTypes["DateTime"],
	/** Токен доступа */
	token: string,
	['...on Token']: Omit<GraphQLTypes["Token"], "...on Token">
};
	["Tokens"]: {
	__typename: "Tokens",
	/** Токен доступа */
	access: GraphQLTypes["Token"],
	/** Токен обновления */
	refresh: GraphQLTypes["Token"],
	['...on Tokens']: Omit<GraphQLTypes["Tokens"], "...on Tokens">
};
	["TranscriptionSegment"]: {
	__typename: "TranscriptionSegment",
	createdAt: GraphQLTypes["DateTime"],
	endOffset: number,
	id: string,
	/** Канонический Matrix user id (@localpart:server) */
	speakerIdentity: string,
	/** Отображаемое имя из Synapse (displayname) */
	speakerName: string,
	startOffset: number,
	text: string,
	['...on TranscriptionSegment']: Omit<GraphQLTypes["TranscriptionSegment"], "...on TranscriptionSegment">
};
	/** Статус транскрипции звонка */
["TranscriptionStatus"]: TranscriptionStatus;
	["UninstallExtensionInput"]: {
		/** Фильтр по имени */
	name: string
};
	["Update"]: {
		/** Собственные данные кооператива, обслуживающего экземпляр платформы */
	organization_data?: GraphQLTypes["UpdateOrganizationDataInput"] | undefined | null,
	/** Переменные кооператива, используемые для заполнения шаблонов документов */
	vars?: GraphQLTypes["VarsInput"] | undefined | null
};
	["UpdateAccountInput"]: {
		/** Данные индивидуального предпринимателя */
	entrepreneur_data?: GraphQLTypes["UpdateEntrepreneurDataInput"] | undefined | null,
	/** Данные физического лица */
	individual_data?: GraphQLTypes["UpdateIndividualDataInput"] | undefined | null,
	/** Данные организации */
	organization_data?: GraphQLTypes["UpdateOrganizationDataInput"] | undefined | null,
	/** Публичный ключ */
	public_key?: string | undefined | null,
	/** Имя аккаунта реферера */
	referer?: string | undefined | null,
	/** Имя пользователя */
	username: string
};
	["UpdateBankAccountInput"]: {
		/** Данные банковского счёта */
	data: GraphQLTypes["BankAccountInput"],
	/** Флаг основного метода платежа, который отображается в документах */
	is_default: boolean,
	/** Идентификатор платежного метода */
	method_id: string,
	/** Имя аккаунта пользователя */
	username: string
};
	["UpdateEntrepreneurDataInput"]: {
		/** Дата рождения */
	birthdate: string,
	/** Город */
	city: string,
	/** Страна */
	country: GraphQLTypes["Country"],
	/** Детали индивидуального предпринимателя */
	details: GraphQLTypes["EntrepreneurDetailsInput"],
	/** Электронная почта */
	email: string,
	/** Имя */
	first_name: string,
	/** Полный адрес */
	full_address: string,
	/** Фамилия */
	last_name: string,
	/** Отчество */
	middle_name: string,
	/** Телефон */
	phone: string,
	/** Имя пользователя */
	username: string
};
	["UpdateIndividualDataInput"]: {
		/** Дата рождения */
	birthdate: string,
	/** Электронная почта */
	email: string,
	/** Имя */
	first_name: string,
	/** Полный адрес */
	full_address: string,
	/** Фамилия */
	last_name: string,
	/** Отчество */
	middle_name: string,
	/** Данные паспорта */
	passport?: GraphQLTypes["PassportInput"] | undefined | null,
	/** Телефон */
	phone: string,
	/** Имя пользователя */
	username: string
};
	["UpdateOrganizationDataInput"]: {
		/** Город */
	city: string,
	/** Страна */
	country: string,
	/** Детали организации */
	details: GraphQLTypes["OrganizationDetailsInput"],
	/** Электронная почта */
	email: string,
	/** Фактический адрес */
	fact_address: string,
	/** Полный адрес */
	full_address: string,
	/** Полное наименование организации */
	full_name: string,
	/** Телефон */
	phone: string,
	/** Представитель организации */
	represented_by: GraphQLTypes["RepresentedByInput"],
	/** Краткое наименование организации */
	short_name: string,
	/** Тип организации */
	type: string,
	/** Имя пользователя */
	username: string
};
	["UpdateSettingsInput"]: {
		/** Маршрут по умолчанию для авторизованных пользователей */
	authorized_default_route?: string | undefined | null,
	/** Рабочий стол по умолчанию для авторизованных пользователей */
	authorized_default_workspace?: string | undefined | null,
	/** Маршрут по умолчанию для неавторизованных пользователей */
	non_authorized_default_route?: string | undefined | null,
	/** Рабочий стол по умолчанию для неавторизованных пользователей */
	non_authorized_default_workspace?: string | undefined | null,
	/** Имя провайдера платежей по умолчанию */
	provider_name?: string | undefined | null
};
	["UserAccount"]: {
	__typename: "UserAccount",
	/** Метаинформация */
	meta: string,
	/** Реферал */
	referer: string,
	/** Дата регистрации */
	registered_at: string,
	/** Регистратор */
	registrator: string,
	/** Статус аккаунта */
	status: string,
	/** Список хранилищ */
	storages: Array<string>,
	/** Тип учетной записи */
	type: string,
	/** Имя аккаунта */
	username: string,
	/** Дата регистрации */
	verifications: Array<GraphQLTypes["Verification"]>,
	['...on UserAccount']: Omit<GraphQLTypes["UserAccount"], "...on UserAccount">
};
	/** Объединение сертификатов пользователей (сокращенная информация) */
["UserCertificateUnion"]:{
        	__typename:"EntrepreneurCertificate" | "IndividualCertificate" | "OrganizationCertificate"
        	['...on EntrepreneurCertificate']: '__union' & GraphQLTypes["EntrepreneurCertificate"];
	['...on IndividualCertificate']: '__union' & GraphQLTypes["IndividualCertificate"];
	['...on OrganizationCertificate']: '__union' & GraphQLTypes["OrganizationCertificate"];
};
	/** Статус пользователя */
["UserStatus"]: UserStatus;
	["Vars"]: {
	__typename: "Vars",
	confidential_email: string,
	confidential_link: string,
	contact_email: string,
	coopenomics_agreement?: GraphQLTypes["AgreementVar"] | undefined | null,
	coopname: string,
	full_abbr: string,
	full_abbr_dative: string,
	full_abbr_genitive: string,
	name: string,
	participant_application?: GraphQLTypes["AgreementVar"] | undefined | null,
	passport_request: string,
	privacy_agreement?: GraphQLTypes["AgreementVar"] | undefined | null,
	short_abbr: string,
	signature_agreement?: GraphQLTypes["AgreementVar"] | undefined | null,
	statute_link?: string | undefined | null,
	user_agreement?: GraphQLTypes["AgreementVar"] | undefined | null,
	wallet_agreement?: GraphQLTypes["AgreementVar"] | undefined | null,
	website: string,
	['...on Vars']: Omit<GraphQLTypes["Vars"], "...on Vars">
};
	["VarsInput"]: {
		confidential_email: string,
	confidential_link: string,
	contact_email: string,
	coopenomics_agreement?: GraphQLTypes["AgreementInput"] | undefined | null,
	coopname: string,
	full_abbr: string,
	full_abbr_dative: string,
	full_abbr_genitive: string,
	name: string,
	participant_application: GraphQLTypes["AgreementInput"],
	passport_request: string,
	privacy_agreement: GraphQLTypes["AgreementInput"],
	short_abbr: string,
	signature_agreement: GraphQLTypes["AgreementInput"],
	statute_link: string,
	user_agreement: GraphQLTypes["AgreementInput"],
	wallet_agreement: GraphQLTypes["AgreementInput"],
	website: string
};
	["Verification"]: {
	__typename: "Verification",
	/** Дата создания верификации */
	created_at: string,
	/** Флаг верификации */
	is_verified: boolean,
	/** Дата последнего обновления верификации */
	last_update: string,
	/** Заметка верификации */
	notice: string,
	/** Процедура верификации */
	procedure: string,
	/** Имя верификатора */
	verificator: string,
	['...on Verification']: Omit<GraphQLTypes["Verification"], "...on Verification">
};
	["WaitWeight"]: {
	__typename: "WaitWeight",
	/** Время ожидания в секундах */
	wait_sec: number,
	/** Вес */
	weight: number,
	['...on WaitWeight']: Omit<GraphQLTypes["WaitWeight"], "...on WaitWeight">
};
	["WebPushSubscriptionDataInput"]: {
		/** Endpoint для отправки уведомлений */
	endpoint: string,
	/** Ключи для шифрования */
	keys: GraphQLTypes["WebPushSubscriptionKeysInput"]
};
	["WebPushSubscriptionDto"]: {
	__typename: "WebPushSubscriptionDto",
	/** Auth ключ для аутентификации */
	authKey: string,
	/** Дата создания подписки */
	createdAt: GraphQLTypes["DateTime"],
	/** Endpoint для отправки уведомлений */
	endpoint: string,
	/** Уникальный идентификатор подписки */
	id: string,
	/** Активна ли подписка */
	isActive: boolean,
	/** P256DH ключ для шифрования */
	p256dhKey: string,
	/** Дата последнего обновления */
	updatedAt: GraphQLTypes["DateTime"],
	/** User Agent браузера */
	userAgent?: string | undefined | null,
	/** Username пользователя */
	username: string,
	['...on WebPushSubscriptionDto']: Omit<GraphQLTypes["WebPushSubscriptionDto"], "...on WebPushSubscriptionDto">
};
	["WebPushSubscriptionKeysInput"]: {
		/** Auth ключ для аутентификации */
	auth: string,
	/** P256DH ключ для шифрования */
	p256dh: string
};
	["ID"]: "scalar" & { name: "ID" }
    }
/** Тип аккаунта пользователя в системе */
export enum AccountType {
	entrepreneur = "entrepreneur",
	individual = "individual",
	organization = "organization"
}
/** Статус соглашения в системе кооператива */
export enum AgreementStatus {
	CONFIRMED = "CONFIRMED",
	DECLINED = "DECLINED",
	REGISTERED = "REGISTERED"
}
/** Статус одобрения в системе CHAIRMAN */
export enum ApprovalStatus {
	APPROVED = "APPROVED",
	DECLINED = "DECLINED",
	PENDING = "PENDING"
}
export enum CandidateStatus {
	FAILED = "FAILED",
	PENDING = "PENDING",
	REGISTERED = "REGISTERED"
}
/** Формат содержимого требования (истории) в CAPITAL: MARKDOWN, BPMN (XML), DRAWIO (draw.io / diagrams.net XML) или MERMAID (текст диаграммы) */
export enum CapitalStoryContentFormat {
	BPMN = "BPMN",
	DRAWIO = "DRAWIO",
	MARKDOWN = "MARKDOWN",
	MERMAID = "MERMAID"
}
/** Статус коммита в системе CAPITAL */
export enum CommitStatus {
	APPROVED = "APPROVED",
	CREATED = "CREATED",
	DECLINED = "DECLINED",
	UNDEFINED = "UNDEFINED"
}
/** Статус участника в системе CAPITAL */
export enum ContributorStatus {
	ACTIVE = "ACTIVE",
	APPROVED = "APPROVED",
	IMPORT = "IMPORT",
	INACTIVE = "INACTIVE",
	PENDING = "PENDING",
	UNDEFINED = "UNDEFINED"
}
/** Страна регистрации пользователя */
export enum Country {
	Russia = "Russia"
}
/** Статус цикла в системе CAPITAL */
export enum CycleStatus {
	ACTIVE = "ACTIVE",
	COMPLETED = "COMPLETED",
	FUTURE = "FUTURE"
}
/** Статус долга в системе CAPITAL */
export enum DebtStatus {
	ACTIVE = "ACTIVE",
	APPROVED = "APPROVED",
	CANCELLED = "CANCELLED",
	PENDING = "PENDING",
	SETTLED = "SETTLED",
	UNDEFINED = "UNDEFINED"
}
/** Статус расхода в системе CAPITAL */
export enum ExpenseStatus {
	APPROVED = "APPROVED",
	CANCELLED = "CANCELLED",
	DECLINED = "DECLINED",
	PAID = "PAID",
	PENDING = "PENDING",
	UNDEFINED = "UNDEFINED"
}
/** Расширенный статус собрания на основе дат и состояния */
export enum ExtendedMeetStatus {
	AUTHORIZED = "AUTHORIZED",
	CLOSED = "CLOSED",
	CREATED = "CREATED",
	EXPIRED_NO_QUORUM = "EXPIRED_NO_QUORUM",
	NONE = "NONE",
	ONRESTART = "ONRESTART",
	PRECLOSED = "PRECLOSED",
	VOTING_COMPLETED = "VOTING_COMPLETED",
	VOTING_IN_PROGRESS = "VOTING_IN_PROGRESS",
	WAITING_FOR_OPENING = "WAITING_FOR_OPENING"
}
/** Статусы инвестиции в системе CAPITAL */
export enum InvestStatus {
	ACTIVE = "ACTIVE",
	APPROVED = "APPROVED",
	CANCELLED = "CANCELLED",
	PENDING = "PENDING",
	RETURNED = "RETURNED",
	UNDEFINED = "UNDEFINED"
}
/** Приоритет задачи в системе CAPITAL */
export enum IssuePriority {
	HIGH = "HIGH",
	LOW = "LOW",
	MEDIUM = "MEDIUM",
	URGENT = "URGENT"
}
/** Статус задачи в системе CAPITAL */
export enum IssueStatus {
	BACKLOG = "BACKLOG",
	CANCELED = "CANCELED",
	DONE = "DONE",
	IN_PROGRESS = "IN_PROGRESS",
	ON_REVIEW = "ON_REVIEW",
	TODO = "TODO"
}
/** Типы сущностей в логах */
export enum LogEntityType {
	CONTRIBUTOR = "CONTRIBUTOR",
	CYCLE = "CYCLE",
	ISSUE = "ISSUE",
	PROGRAM = "PROGRAM",
	PROJECT = "PROJECT",
	STORY = "STORY"
}
/** Типы событий в системе логирования */
export enum LogEventType {
	AUTHOR_ADDED = "AUTHOR_ADDED",
	COMMIT_RECEIVED = "COMMIT_RECEIVED",
	COMPONENT_CREATED = "COMPONENT_CREATED",
	COMPONENT_MASTER_ASSIGNED = "COMPONENT_MASTER_ASSIGNED",
	CONTRIBUTOR_EDITED = "CONTRIBUTOR_EDITED",
	CONTRIBUTOR_IMPORTED = "CONTRIBUTOR_IMPORTED",
	CONTRIBUTOR_JOINED = "CONTRIBUTOR_JOINED",
	CONTRIBUTOR_REGISTERED = "CONTRIBUTOR_REGISTERED",
	CYCLE_CREATED = "CYCLE_CREATED",
	DEBT_CREATED = "DEBT_CREATED",
	EXPENSES_EXPANDED = "EXPENSES_EXPANDED",
	EXPENSE_CREATED = "EXPENSE_CREATED",
	FUNDS_ALLOCATED = "FUNDS_ALLOCATED",
	FUNDS_DEALLOCATED = "FUNDS_DEALLOCATED",
	INVESTMENT_RECEIVED = "INVESTMENT_RECEIVED",
	ISSUE_CREATED = "ISSUE_CREATED",
	ISSUE_DELETED = "ISSUE_DELETED",
	ISSUE_UPDATED = "ISSUE_UPDATED",
	PROGRAM_FUNDED = "PROGRAM_FUNDED",
	PROGRAM_INVESTMENT_RECEIVED = "PROGRAM_INVESTMENT_RECEIVED",
	PROGRAM_PROPERTY_RECEIVED = "PROGRAM_PROPERTY_RECEIVED",
	PROGRAM_REFRESHED = "PROGRAM_REFRESHED",
	PROGRAM_WITHDRAWAL = "PROGRAM_WITHDRAWAL",
	PROJECT_CLOSED = "PROJECT_CLOSED",
	PROJECT_CREATED = "PROJECT_CREATED",
	PROJECT_DELETED = "PROJECT_DELETED",
	PROJECT_EDITED = "PROJECT_EDITED",
	PROJECT_FUNDED = "PROJECT_FUNDED",
	PROJECT_MASTER_ASSIGNED = "PROJECT_MASTER_ASSIGNED",
	PROJECT_OPENED = "PROJECT_OPENED",
	PROJECT_PLAN_SET = "PROJECT_PLAN_SET",
	PROJECT_PROPERTY_RECEIVED = "PROJECT_PROPERTY_RECEIVED",
	PROJECT_REFRESHED = "PROJECT_REFRESHED",
	PROJECT_STARTED = "PROJECT_STARTED",
	PROJECT_STOPPED = "PROJECT_STOPPED",
	PROJECT_WITHDRAWAL = "PROJECT_WITHDRAWAL",
	RESULT_CONTRIBUTION_RECEIVED = "RESULT_CONTRIBUTION_RECEIVED",
	RESULT_PUSHED = "RESULT_PUSHED",
	SEGMENT_CONVERTED = "SEGMENT_CONVERTED",
	SEGMENT_REFRESHED = "SEGMENT_REFRESHED",
	STORY_CREATED = "STORY_CREATED",
	STORY_DELETED = "STORY_DELETED",
	STORY_UPDATED = "STORY_UPDATED",
	VOTES_CALCULATED = "VOTES_CALCULATED",
	VOTE_SUBMITTED = "VOTE_SUBMITTED",
	VOTING_COMPLETED = "VOTING_COMPLETED",
	VOTING_STARTED = "VOTING_STARTED"
}
/** Тип юридического лица */
export enum OrganizationType {
	AO = "AO",
	COOP = "COOP",
	OAO = "OAO",
	OOO = "OOO",
	PAO = "PAO",
	PRODCOOP = "PRODCOOP",
	ZAO = "ZAO"
}
/** Направление платежа */
export enum PaymentDirection {
	INCOMING = "INCOMING",
	OUTGOING = "OUTGOING"
}
/** Статус платежа */
export enum PaymentStatus {
	CANCELLED = "CANCELLED",
	COMPLETED = "COMPLETED",
	EXPIRED = "EXPIRED",
	FAILED = "FAILED",
	PAID = "PAID",
	PENDING = "PENDING",
	PROCESSING = "PROCESSING",
	REFUNDED = "REFUNDED"
}
/** Тип платежа по назначению */
export enum PaymentType {
	DEPOSIT = "DEPOSIT",
	REGISTRATION = "REGISTRATION",
	WITHDRAWAL = "WITHDRAWAL"
}
export enum ProcessStepStatus {
	ACTIVE = "ACTIVE",
	CANCELLED = "CANCELLED",
	COMPLETED = "COMPLETED",
	PENDING = "PENDING"
}
/** Статус программной инвестиции в системе CAPITAL */
export enum ProgramInvestStatus {
	CREATED = "CREATED",
	UNDEFINED = "UNDEFINED"
}
/** Тип целевой потребительской программы */
export enum ProgramType {
	BLAGOROST = "BLAGOROST",
	GENERATOR = "GENERATOR",
	MAIN = "MAIN",
	MARKETPLACE = "MARKETPLACE"
}
/** Статусы проекта в системе CAPITAL */
export enum ProjectStatus {
	ACTIVE = "ACTIVE",
	CANCELLED = "CANCELLED",
	FINALIZED = "FINALIZED",
	PENDING = "PENDING",
	RESULT = "RESULT",
	UNDEFINED = "UNDEFINED",
	VOTING = "VOTING"
}
/** Статус результата в системе CAPITAL */
export enum ResultStatus {
	ACT1 = "ACT1",
	ACT2 = "ACT2",
	APPROVED = "APPROVED",
	AUTHORIZED = "AUTHORIZED",
	CREATED = "CREATED",
	DECLINED = "DECLINED",
	PENDING = "PENDING",
	UNDEFINED = "UNDEFINED"
}
/** Статус сегмента участника в проекте CAPITAL */
export enum SegmentStatus {
	ACT1 = "ACT1",
	APPROVED = "APPROVED",
	AUTHORIZED = "AUTHORIZED",
	CONTRIBUTED = "CONTRIBUTED",
	FINALIZED = "FINALIZED",
	GENERATION = "GENERATION",
	READY = "READY",
	SKIPPED = "SKIPPED",
	STATEMENT = "STATEMENT",
	UNDEFINED = "UNDEFINED"
}
/** Статус истории в системе CAPITAL */
export enum StoryStatus {
	CANCELLED = "CANCELLED",
	COMPLETED = "COMPLETED",
	PENDING = "PENDING"
}
/** Состояние контроллера кооператива */
export enum SystemStatus {
	active = "active",
	initialized = "initialized",
	install = "install",
	maintenance = "maintenance"
}
/** Статус транскрипции звонка */
export enum TranscriptionStatus {
	ACTIVE = "ACTIVE",
	COMPLETED = "COMPLETED",
	FAILED = "FAILED"
}
/** Статус пользователя */
export enum UserStatus {
	Active = "Active",
	Blocked = "Blocked",
	Created = "Created",
	Failed = "Failed",
	Joined = "Joined",
	Payed = "Payed",
	Refunded = "Refunded",
	Registered = "Registered"
}

type ZEUS_VARIABLES = {
	["AccountType"]: ValueTypes["AccountType"];
	["AddPaymentMethodInput"]: ValueTypes["AddPaymentMethodInput"];
	["AddTrustedAccountInput"]: ValueTypes["AddTrustedAccountInput"];
	["AgreementInput"]: ValueTypes["AgreementInput"];
	["AgreementStatus"]: ValueTypes["AgreementStatus"];
	["AgreementVarInput"]: ValueTypes["AgreementVarInput"];
	["ApprovalStatus"]: ValueTypes["ApprovalStatus"];
	["BankAccountDetailsInput"]: ValueTypes["BankAccountDetailsInput"];
	["BankAccountInput"]: ValueTypes["BankAccountInput"];
	["CandidateStatus"]: ValueTypes["CandidateStatus"];
	["CapitalLogFilterInput"]: ValueTypes["CapitalLogFilterInput"];
	["CapitalStoryContentFormat"]: ValueTypes["CapitalStoryContentFormat"];
	["CommitStatus"]: ValueTypes["CommitStatus"];
	["ContributorStatus"]: ValueTypes["ContributorStatus"];
	["Country"]: ValueTypes["Country"];
	["CreateBranchInput"]: ValueTypes["CreateBranchInput"];
	["CreateEntrepreneurDataInput"]: ValueTypes["CreateEntrepreneurDataInput"];
	["CreateIndividualDataInput"]: ValueTypes["CreateIndividualDataInput"];
	["CreateInitOrganizationDataInput"]: ValueTypes["CreateInitOrganizationDataInput"];
	["CreateOrganizationDataInput"]: ValueTypes["CreateOrganizationDataInput"];
	["CreateSovietIndividualDataInput"]: ValueTypes["CreateSovietIndividualDataInput"];
	["CreateSubscriptionInput"]: ValueTypes["CreateSubscriptionInput"];
	["CycleStatus"]: ValueTypes["CycleStatus"];
	["DateTime"]: ValueTypes["DateTime"];
	["DeactivateSubscriptionInput"]: ValueTypes["DeactivateSubscriptionInput"];
	["DebtStatus"]: ValueTypes["DebtStatus"];
	["DeleteBranchInput"]: ValueTypes["DeleteBranchInput"];
	["DeletePaymentMethodInput"]: ValueTypes["DeletePaymentMethodInput"];
	["DeleteTrustedAccountInput"]: ValueTypes["DeleteTrustedAccountInput"];
	["EditBranchInput"]: ValueTypes["EditBranchInput"];
	["EntrepreneurDetailsInput"]: ValueTypes["EntrepreneurDetailsInput"];
	["ExpenseStatus"]: ValueTypes["ExpenseStatus"];
	["ExtendedMeetStatus"]: ValueTypes["ExtendedMeetStatus"];
	["ExtensionInput"]: ValueTypes["ExtensionInput"];
	["GenerateDocumentOptionsInput"]: ValueTypes["GenerateDocumentOptionsInput"];
	["GetAccountInput"]: ValueTypes["GetAccountInput"];
	["GetAccountsInput"]: ValueTypes["GetAccountsInput"];
	["GetBranchesInput"]: ValueTypes["GetBranchesInput"];
	["GetCapitalIssueLogsInput"]: ValueTypes["GetCapitalIssueLogsInput"];
	["GetCapitalLogsInput"]: ValueTypes["GetCapitalLogsInput"];
	["GetExtensionLogsInput"]: ValueTypes["GetExtensionLogsInput"];
	["GetExtensionsInput"]: ValueTypes["GetExtensionsInput"];
	["GetInstallationStatusInput"]: ValueTypes["GetInstallationStatusInput"];
	["GetPaymentMethodsInput"]: ValueTypes["GetPaymentMethodsInput"];
	["GetUserSubscriptionsInput"]: ValueTypes["GetUserSubscriptionsInput"];
	["Init"]: ValueTypes["Init"];
	["Install"]: ValueTypes["Install"];
	["InvestStatus"]: ValueTypes["InvestStatus"];
	["IssuePriority"]: ValueTypes["IssuePriority"];
	["IssueStatus"]: ValueTypes["IssueStatus"];
	["JSON"]: ValueTypes["JSON"];
	["LogEntityType"]: ValueTypes["LogEntityType"];
	["LogEventType"]: ValueTypes["LogEventType"];
	["OrganizationDetailsInput"]: ValueTypes["OrganizationDetailsInput"];
	["OrganizationType"]: ValueTypes["OrganizationType"];
	["PaginationInput"]: ValueTypes["PaginationInput"];
	["PassportInput"]: ValueTypes["PassportInput"];
	["PaymentDirection"]: ValueTypes["PaymentDirection"];
	["PaymentStatus"]: ValueTypes["PaymentStatus"];
	["PaymentType"]: ValueTypes["PaymentType"];
	["ProcessStepPositionInput"]: ValueTypes["ProcessStepPositionInput"];
	["ProcessStepStatus"]: ValueTypes["ProcessStepStatus"];
	["ProgramInvestStatus"]: ValueTypes["ProgramInvestStatus"];
	["ProgramType"]: ValueTypes["ProgramType"];
	["ProjectStatus"]: ValueTypes["ProjectStatus"];
	["RegisterAccountInput"]: ValueTypes["RegisterAccountInput"];
	["RepresentedByInput"]: ValueTypes["RepresentedByInput"];
	["ResultStatus"]: ValueTypes["ResultStatus"];
	["SbpDataInput"]: ValueTypes["SbpDataInput"];
	["SearchPrivateAccountsInput"]: ValueTypes["SearchPrivateAccountsInput"];
	["SegmentStatus"]: ValueTypes["SegmentStatus"];
	["SelectBranchGenerateDocumentInput"]: ValueTypes["SelectBranchGenerateDocumentInput"];
	["SelectBranchInput"]: ValueTypes["SelectBranchInput"];
	["SelectBranchSignedDocumentInput"]: ValueTypes["SelectBranchSignedDocumentInput"];
	["SelectBranchSignedMetaDocumentInput"]: ValueTypes["SelectBranchSignedMetaDocumentInput"];
	["SetVarsInput"]: ValueTypes["SetVarsInput"];
	["SetWifInput"]: ValueTypes["SetWifInput"];
	["SignatureInfoInput"]: ValueTypes["SignatureInfoInput"];
	["SovietMemberInput"]: ValueTypes["SovietMemberInput"];
	["StartInstallInput"]: ValueTypes["StartInstallInput"];
	["StoryStatus"]: ValueTypes["StoryStatus"];
	["SystemStatus"]: ValueTypes["SystemStatus"];
	["TranscriptionStatus"]: ValueTypes["TranscriptionStatus"];
	["UninstallExtensionInput"]: ValueTypes["UninstallExtensionInput"];
	["Update"]: ValueTypes["Update"];
	["UpdateAccountInput"]: ValueTypes["UpdateAccountInput"];
	["UpdateBankAccountInput"]: ValueTypes["UpdateBankAccountInput"];
	["UpdateEntrepreneurDataInput"]: ValueTypes["UpdateEntrepreneurDataInput"];
	["UpdateIndividualDataInput"]: ValueTypes["UpdateIndividualDataInput"];
	["UpdateOrganizationDataInput"]: ValueTypes["UpdateOrganizationDataInput"];
	["UpdateSettingsInput"]: ValueTypes["UpdateSettingsInput"];
	["UserStatus"]: ValueTypes["UserStatus"];
	["VarsInput"]: ValueTypes["VarsInput"];
	["WebPushSubscriptionDataInput"]: ValueTypes["WebPushSubscriptionDataInput"];
	["WebPushSubscriptionKeysInput"]: ValueTypes["WebPushSubscriptionKeysInput"];
	["ID"]: ValueTypes["ID"];
}