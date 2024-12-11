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
    ops?: OperationOptions & { variables?: ExtractVariables<Z> },
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

type ScalarsSelector<T> = {
  [X in Required<{
    [P in keyof T]: T[P] extends number | string | undefined | boolean ? P : never;
  }>[keyof T]]: true;
};

export const fields = <T extends keyof ModelTypes>(k: T) => {
  const t = ReturnTypes[k];
  const o = Object.fromEntries(
    Object.entries(t)
      .filter(([, value]) => {
        const isReturnType = ReturnTypes[value as string];
        if (!isReturnType || (typeof isReturnType === 'string' && isReturnType.startsWith('scalar.'))) {
          return true;
        }
      })
      .map(([key]) => [key, true as const]),
  );
  return o as ScalarsSelector<ModelTypes[T]>;
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
export type SubscriptionFunction = (query: string) => any;
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
    super('');
    console.error(response);
  }
  toString() {
    return 'GraphQL Response Error';
  }
}
export type GenericOperation<O> = O extends keyof typeof Ops ? typeof Ops[O] : never;
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
  type: T,
  field: Z,
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
            [P in keyof DST]: SRC[P] extends '__union' & infer R ? never : P;
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
  ['ID']: unknown;
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
}
type ZEUS_UNIONS = GraphQLTypes["PaymentMethodData"]

export type ValueTypes = {
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
	["AddTrustedAccountInput"]: {
	/** Имя аккаунта кооперативного участка */
	braname: string | Variable<any, string>,
	/** Имя аккаунта кооператива */
	coopname: string | Variable<any, string>,
	/** Имя аккаунта доверонного лица, который уполномачивается председателем кооперативного участка на совершение действий */
	trusted: string | Variable<any, string>
};
	["Authority"]: AliasType<{
	/** Уровни разрешений */
	accounts?:ValueTypes["PermissionLevelWeight"],
	/** Ключи */
	keys?:ValueTypes["KeyWeight"],
	/** Порог */
	threshold?:boolean | `@${string}`,
	/** Вес ожидания */
	waits?:ValueTypes["WaitWeight"],
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
	details?:ValueTypes["BankAccountDetails"],
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
		__typename?: boolean | `@${string}`
}>;
	["BlockchainDocument"]: AliasType<{
	/** Хеш документа */
	hash?:boolean | `@${string}`,
	/** Метаинформация документа */
	meta?:boolean | `@${string}`,
	/** Публичный ключ документа */
	public_key?:boolean | `@${string}`,
	/** Подпись документа */
	signature?:boolean | `@${string}`,
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
	/** Доверенные аккаунты */
	trusted?:ValueTypes["Individual"],
	/** Председатель кооперативного участка */
	trustee?:ValueTypes["Individual"],
	/** Тип организации */
	type?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["CooperativeOperatorAccount"]: AliasType<{
	/** Объявление кооператива */
	announce?:boolean | `@${string}`,
	/** Тип кооператива */
	coop_type?:boolean | `@${string}`,
	/** Дата создания */
	created_at?:boolean | `@${string}`,
	/** Описание кооператива */
	description?:boolean | `@${string}`,
	/** Документ кооператива */
	document?:ValueTypes["BlockchainDocument"],
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
		__typename?: boolean | `@${string}`
}>;
	["CreateBankAccountInput"]: {
	/** Данные для банковского перевода */
	data: ValueTypes["BankAccountInput"] | Variable<any, string>,
	/** Флаг основного метода платежа, который отображается в документах */
	is_default: boolean | Variable<any, string>,
	/** Имя аккаунта пользователя */
	username: string | Variable<any, string>
};
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
	/** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
["DateTime"]:unknown;
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
	["Extension"]: AliasType<{
	/** Показывает, доступно ли расширение */
	available?:boolean | `@${string}`,
	/** Настройки конфигурации для расширения */
	config?:boolean | `@${string}`,
	/** Дата создания расширения */
	created_at?:boolean | `@${string}`,
	/** Описание расширения */
	description?:boolean | `@${string}`,
	/** Показывает, включено ли расширение */
	enabled?:boolean | `@${string}`,
	/** Изображение для расширения */
	image?:boolean | `@${string}`,
	/** Показывает, установлено ли расширение */
	installed?:boolean | `@${string}`,
	/** Поле инструкция для установки */
	instructions?:boolean | `@${string}`,
	/** Уникальное имя расширения */
	name?:boolean | `@${string}`,
	/** Поле подробного текстового описания */
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
	/** Configuration settings for the extension */
	config: ValueTypes["JSON"] | Variable<any, string>,
	/** Timestamp of when the extension was created */
	created_at?: ValueTypes["DateTime"] | undefined | null | Variable<any, string>,
	/** Indicates whether the extension is enabled */
	enabled: boolean | Variable<any, string>,
	/** Unique name of the extension */
	name: string | Variable<any, string>,
	/** Timestamp of the last update to the extension */
	updated_at?: ValueTypes["DateTime"] | undefined | null | Variable<any, string>
};
	["GetBranchesInput"]: {
	/** Фильтр по имени аккаунта кооперативного участка */
	braname?: string | undefined | null | Variable<any, string>,
	/** Имя аккаунта кооператива */
	coopname: string | Variable<any, string>
};
	["GetExtensionsInput"]: {
	/** Фильтр включенных расширений */
	enabled?: boolean | undefined | null | Variable<any, string>,
	/** Фильтр установленных расширений */
	installed?: boolean | undefined | null | Variable<any, string>,
	/** Фильтр по имени */
	name?: string | undefined | null | Variable<any, string>
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
		__typename?: boolean | `@${string}`
}>;
	/** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
["JSON"]:unknown;
	["KeyWeight"]: AliasType<{
	/** Ключ */
	key?:boolean | `@${string}`,
	/** Вес */
	weight?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Mutation"]: AliasType<{
addTrustedAccount?: [{	data: ValueTypes["AddTrustedAccountInput"] | Variable<any, string>},ValueTypes["Branch"]],
createBankAccount?: [{	data: ValueTypes["CreateBankAccountInput"] | Variable<any, string>},ValueTypes["PaymentMethod"]],
createBranch?: [{	data: ValueTypes["CreateBranchInput"] | Variable<any, string>},ValueTypes["Branch"]],
deleteBranch?: [{	data: ValueTypes["DeleteBranchInput"] | Variable<any, string>},boolean | `@${string}`],
deletePaymentMethod?: [{	data: ValueTypes["DeletePaymentMethodInput"] | Variable<any, string>},boolean | `@${string}`],
deleteTrustedAccount?: [{	data: ValueTypes["DeleteTrustedAccountInput"] | Variable<any, string>},ValueTypes["Branch"]],
editBranch?: [{	data: ValueTypes["EditBranchInput"] | Variable<any, string>},ValueTypes["Branch"]],
installExtension?: [{	data: ValueTypes["ExtensionInput"] | Variable<any, string>},ValueTypes["Extension"]],
uninstallExtension?: [{	data: ValueTypes["UninstallExtensionInput"] | Variable<any, string>},boolean | `@${string}`],
updateBankAccount?: [{	data: ValueTypes["UpdateBankAccountInput"] | Variable<any, string>},ValueTypes["PaymentMethod"]],
updateExtension?: [{	data: ValueTypes["ExtensionInput"] | Variable<any, string>},ValueTypes["Extension"]],
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
	["PaginationResult"]: AliasType<{
	/** Текущая страница */
	currentPage?:boolean | `@${string}`,
	/** Элементы текущей страницы */
	items?:ValueTypes["PaymentMethod"],
	/** Общее количество элементов */
	totalCount?:boolean | `@${string}`,
	/** Общее количество страниц */
	totalPages?:boolean | `@${string}`,
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
		__typename?: boolean | `@${string}`
}>;
	["PaymentMethodData"]: AliasType<{		["...on BankAccount"]?: ValueTypes["BankAccount"],
		["...on SbpAccount"]?: ValueTypes["SbpAccount"]
		__typename?: boolean | `@${string}`
}>;
	["Permission"]: AliasType<{
	/** Родительское разрешение */
	parent?:boolean | `@${string}`,
	/** Имя разрешения */
	perm_name?:boolean | `@${string}`,
	/** Требуемые разрешения */
	required_auth?:ValueTypes["Authority"],
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
	permission?:ValueTypes["PermissionLevel"],
	/** Вес */
	weight?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Query"]: AliasType<{
getBranches?: [{	data: ValueTypes["GetBranchesInput"] | Variable<any, string>},ValueTypes["Branch"]],
getExtensions?: [{	data?: ValueTypes["GetExtensionsInput"] | undefined | null | Variable<any, string>},ValueTypes["Extension"]],
getPaymentMethods?: [{	data?: ValueTypes["GetPaymentMethodsInput"] | undefined | null | Variable<any, string>},ValueTypes["PaginationResult"]],
	/** Получить сводную публичную информацию о системе */
	getSystemInfo?:ValueTypes["SystemInfo"],
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
	["SbpAccount"]: AliasType<{
	/** Мобильный телефон получателя */
	phone?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["SystemAccount"]: AliasType<{
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
		__typename?: boolean | `@${string}`
}>;
	["SystemInfo"]: AliasType<{
	/** Набор данных с информацией о состоянии блокчейна */
	blockchain_info?:ValueTypes["BlockchainInfoDTO"],
	/** Объект аккаунта кооператива у оператора */
	cooperator_account?:ValueTypes["CooperativeOperatorAccount"],
	/** Имя аккаунта кооператива */
	coopname?:boolean | `@${string}`,
	/** Объект системного аккаунта кооператива в блокчейне */
	system_account?:ValueTypes["SystemAccount"],
	/** Статус контроллера кооператива */
	system_status?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Состояние контроллера кооператива */
["SystemStatus"]:SystemStatus;
	["UninstallExtensionInput"]: {
	/** Фильтр по имени */
	name: string | Variable<any, string>
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
}>
  }

export type ResolverInputTypes = {
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
	["AddTrustedAccountInput"]: {
	/** Имя аккаунта кооперативного участка */
	braname: string,
	/** Имя аккаунта кооператива */
	coopname: string,
	/** Имя аккаунта доверонного лица, который уполномачивается председателем кооперативного участка на совершение действий */
	trusted: string
};
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
	["BlockchainDocument"]: AliasType<{
	/** Хеш документа */
	hash?:boolean | `@${string}`,
	/** Метаинформация документа */
	meta?:boolean | `@${string}`,
	/** Публичный ключ документа */
	public_key?:boolean | `@${string}`,
	/** Подпись документа */
	signature?:boolean | `@${string}`,
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
	/** Доверенные аккаунты */
	trusted?:ResolverInputTypes["Individual"],
	/** Председатель кооперативного участка */
	trustee?:ResolverInputTypes["Individual"],
	/** Тип организации */
	type?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["CooperativeOperatorAccount"]: AliasType<{
	/** Объявление кооператива */
	announce?:boolean | `@${string}`,
	/** Тип кооператива */
	coop_type?:boolean | `@${string}`,
	/** Дата создания */
	created_at?:boolean | `@${string}`,
	/** Описание кооператива */
	description?:boolean | `@${string}`,
	/** Документ кооператива */
	document?:ResolverInputTypes["BlockchainDocument"],
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
	["CreateBankAccountInput"]: {
	/** Данные для банковского перевода */
	data: ResolverInputTypes["BankAccountInput"],
	/** Флаг основного метода платежа, который отображается в документах */
	is_default: boolean,
	/** Имя аккаунта пользователя */
	username: string
};
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
	/** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
["DateTime"]:unknown;
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
	["Extension"]: AliasType<{
	/** Показывает, доступно ли расширение */
	available?:boolean | `@${string}`,
	/** Настройки конфигурации для расширения */
	config?:boolean | `@${string}`,
	/** Дата создания расширения */
	created_at?:boolean | `@${string}`,
	/** Описание расширения */
	description?:boolean | `@${string}`,
	/** Показывает, включено ли расширение */
	enabled?:boolean | `@${string}`,
	/** Изображение для расширения */
	image?:boolean | `@${string}`,
	/** Показывает, установлено ли расширение */
	installed?:boolean | `@${string}`,
	/** Поле инструкция для установки */
	instructions?:boolean | `@${string}`,
	/** Уникальное имя расширения */
	name?:boolean | `@${string}`,
	/** Поле подробного текстового описания */
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
	/** Configuration settings for the extension */
	config: ResolverInputTypes["JSON"],
	/** Timestamp of when the extension was created */
	created_at?: ResolverInputTypes["DateTime"] | undefined | null,
	/** Indicates whether the extension is enabled */
	enabled: boolean,
	/** Unique name of the extension */
	name: string,
	/** Timestamp of the last update to the extension */
	updated_at?: ResolverInputTypes["DateTime"] | undefined | null
};
	["GetBranchesInput"]: {
	/** Фильтр по имени аккаунта кооперативного участка */
	braname?: string | undefined | null,
	/** Имя аккаунта кооператива */
	coopname: string
};
	["GetExtensionsInput"]: {
	/** Фильтр включенных расширений */
	enabled?: boolean | undefined | null,
	/** Фильтр установленных расширений */
	installed?: boolean | undefined | null,
	/** Фильтр по имени */
	name?: string | undefined | null
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
	/** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
["JSON"]:unknown;
	["KeyWeight"]: AliasType<{
	/** Ключ */
	key?:boolean | `@${string}`,
	/** Вес */
	weight?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Mutation"]: AliasType<{
addTrustedAccount?: [{	data: ResolverInputTypes["AddTrustedAccountInput"]},ResolverInputTypes["Branch"]],
createBankAccount?: [{	data: ResolverInputTypes["CreateBankAccountInput"]},ResolverInputTypes["PaymentMethod"]],
createBranch?: [{	data: ResolverInputTypes["CreateBranchInput"]},ResolverInputTypes["Branch"]],
deleteBranch?: [{	data: ResolverInputTypes["DeleteBranchInput"]},boolean | `@${string}`],
deletePaymentMethod?: [{	data: ResolverInputTypes["DeletePaymentMethodInput"]},boolean | `@${string}`],
deleteTrustedAccount?: [{	data: ResolverInputTypes["DeleteTrustedAccountInput"]},ResolverInputTypes["Branch"]],
editBranch?: [{	data: ResolverInputTypes["EditBranchInput"]},ResolverInputTypes["Branch"]],
installExtension?: [{	data: ResolverInputTypes["ExtensionInput"]},ResolverInputTypes["Extension"]],
uninstallExtension?: [{	data: ResolverInputTypes["UninstallExtensionInput"]},boolean | `@${string}`],
updateBankAccount?: [{	data: ResolverInputTypes["UpdateBankAccountInput"]},ResolverInputTypes["PaymentMethod"]],
updateExtension?: [{	data: ResolverInputTypes["ExtensionInput"]},ResolverInputTypes["Extension"]],
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
	["PaginationResult"]: AliasType<{
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
	["Query"]: AliasType<{
getBranches?: [{	data: ResolverInputTypes["GetBranchesInput"]},ResolverInputTypes["Branch"]],
getExtensions?: [{	data?: ResolverInputTypes["GetExtensionsInput"] | undefined | null},ResolverInputTypes["Extension"]],
getPaymentMethods?: [{	data?: ResolverInputTypes["GetPaymentMethodsInput"] | undefined | null},ResolverInputTypes["PaginationResult"]],
	/** Получить сводную публичную информацию о системе */
	getSystemInfo?:ResolverInputTypes["SystemInfo"],
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
	["SbpAccount"]: AliasType<{
	/** Мобильный телефон получателя */
	phone?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["SystemAccount"]: AliasType<{
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
	["SystemInfo"]: AliasType<{
	/** Набор данных с информацией о состоянии блокчейна */
	blockchain_info?:ResolverInputTypes["BlockchainInfoDTO"],
	/** Объект аккаунта кооператива у оператора */
	cooperator_account?:ResolverInputTypes["CooperativeOperatorAccount"],
	/** Имя аккаунта кооператива */
	coopname?:boolean | `@${string}`,
	/** Объект системного аккаунта кооператива в блокчейне */
	system_account?:ResolverInputTypes["SystemAccount"],
	/** Статус контроллера кооператива */
	system_status?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Состояние контроллера кооператива */
["SystemStatus"]:SystemStatus;
	["UninstallExtensionInput"]: {
	/** Фильтр по имени */
	name: string
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
	["schema"]: AliasType<{
	query?:ResolverInputTypes["Query"],
	mutation?:ResolverInputTypes["Mutation"],
		__typename?: boolean | `@${string}`
}>
  }

export type ModelTypes = {
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
	["AddTrustedAccountInput"]: {
	/** Имя аккаунта кооперативного участка */
	braname: string,
	/** Имя аккаунта кооператива */
	coopname: string,
	/** Имя аккаунта доверонного лица, который уполномачивается председателем кооперативного участка на совершение действий */
	trusted: string
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
	["BlockchainDocument"]: {
		/** Хеш документа */
	hash: string,
	/** Метаинформация документа */
	meta: string,
	/** Публичный ключ документа */
	public_key: string,
	/** Подпись документа */
	signature: string
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
	/** Доверенные аккаунты */
	trusted: Array<ModelTypes["Individual"]>,
	/** Председатель кооперативного участка */
	trustee: ModelTypes["Individual"],
	/** Тип организации */
	type: string
};
	["CooperativeOperatorAccount"]: {
		/** Объявление кооператива */
	announce: string,
	/** Тип кооператива */
	coop_type: string,
	/** Дата создания */
	created_at: string,
	/** Описание кооператива */
	description: string,
	/** Документ кооператива */
	document: ModelTypes["BlockchainDocument"],
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
	["CreateBankAccountInput"]: {
	/** Данные для банковского перевода */
	data: ModelTypes["BankAccountInput"],
	/** Флаг основного метода платежа, который отображается в документах */
	is_default: boolean,
	/** Имя аккаунта пользователя */
	username: string
};
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
	/** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
["DateTime"]:any;
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
	["Extension"]: {
		/** Показывает, доступно ли расширение */
	available: boolean,
	/** Настройки конфигурации для расширения */
	config?: ModelTypes["JSON"] | undefined | null,
	/** Дата создания расширения */
	created_at: ModelTypes["DateTime"],
	/** Описание расширения */
	description?: string | undefined | null,
	/** Показывает, включено ли расширение */
	enabled: boolean,
	/** Изображение для расширения */
	image?: string | undefined | null,
	/** Показывает, установлено ли расширение */
	installed: boolean,
	/** Поле инструкция для установки */
	instructions: string,
	/** Уникальное имя расширения */
	name: string,
	/** Поле подробного текстового описания */
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
	/** Configuration settings for the extension */
	config: ModelTypes["JSON"],
	/** Timestamp of when the extension was created */
	created_at?: ModelTypes["DateTime"] | undefined | null,
	/** Indicates whether the extension is enabled */
	enabled: boolean,
	/** Unique name of the extension */
	name: string,
	/** Timestamp of the last update to the extension */
	updated_at?: ModelTypes["DateTime"] | undefined | null
};
	["GetBranchesInput"]: {
	/** Фильтр по имени аккаунта кооперативного участка */
	braname?: string | undefined | null,
	/** Имя аккаунта кооператива */
	coopname: string
};
	["GetExtensionsInput"]: {
	/** Фильтр включенных расширений */
	enabled?: boolean | undefined | null,
	/** Фильтр установленных расширений */
	installed?: boolean | undefined | null,
	/** Фильтр по имени */
	name?: string | undefined | null
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
	/** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
["JSON"]:any;
	["KeyWeight"]: {
		/** Ключ */
	key: string,
	/** Вес */
	weight: number
};
	["Mutation"]: {
		/** Добавить доверенное лицо кооперативного участка */
	addTrustedAccount: ModelTypes["Branch"],
	/** Добавить метод оплаты */
	createBankAccount: ModelTypes["PaymentMethod"],
	/** Создать кооперативный участок */
	createBranch: ModelTypes["Branch"],
	/** Удалить кооперативный участок */
	deleteBranch: boolean,
	/** Удалить метод оплаты */
	deletePaymentMethod: boolean,
	/** Удалить доверенное лицо кооперативного участка */
	deleteTrustedAccount: ModelTypes["Branch"],
	/** Изменить кооперативный участок */
	editBranch: ModelTypes["Branch"],
	/** Установить расширение */
	installExtension: ModelTypes["Extension"],
	/** Удалить расширение */
	uninstallExtension: boolean,
	/** Обновить банковский счёт */
	updateBankAccount: ModelTypes["PaymentMethod"],
	/** Обновить расширение */
	updateExtension: ModelTypes["Extension"]
};
	["OrganizationDetails"]: {
		/** ИНН */
	inn: string,
	/** КПП */
	kpp: string,
	/** ОГРН */
	ogrn: string
};
	["PaginationResult"]: {
		/** Текущая страница */
	currentPage: number,
	/** Элементы текущей страницы */
	items: Array<ModelTypes["PaymentMethod"]>,
	/** Общее количество элементов */
	totalCount: number,
	/** Общее количество страниц */
	totalPages: number
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
	["Query"]: {
		/** Получить список кооперативных участков */
	getBranches: Array<ModelTypes["Branch"]>,
	/** Получить список расширений */
	getExtensions: Array<ModelTypes["Extension"]>,
	/** Получить список методов оплаты */
	getPaymentMethods: ModelTypes["PaginationResult"],
	/** Получить сводную публичную информацию о системе */
	getSystemInfo: ModelTypes["SystemInfo"]
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
	["SbpAccount"]: {
		/** Мобильный телефон получателя */
	phone: string
};
	["SystemAccount"]: {
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
	["SystemInfo"]: {
		/** Набор данных с информацией о состоянии блокчейна */
	blockchain_info: ModelTypes["BlockchainInfoDTO"],
	/** Объект аккаунта кооператива у оператора */
	cooperator_account: ModelTypes["CooperativeOperatorAccount"],
	/** Имя аккаунта кооператива */
	coopname: string,
	/** Объект системного аккаунта кооператива в блокчейне */
	system_account: ModelTypes["SystemAccount"],
	/** Статус контроллера кооператива */
	system_status: ModelTypes["SystemStatus"]
};
	["SystemStatus"]:SystemStatus;
	["UninstallExtensionInput"]: {
	/** Фильтр по имени */
	name: string
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
	["schema"]: {
	query?: ModelTypes["Query"] | undefined | null,
	mutation?: ModelTypes["Mutation"] | undefined | null
}
    }

export type GraphQLTypes = {
    // ------------------------------------------------------;
	// THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY);
	// ------------------------------------------------------;
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
	used: string
};
	["AddTrustedAccountInput"]: {
		/** Имя аккаунта кооперативного участка */
	braname: string,
	/** Имя аккаунта кооператива */
	coopname: string,
	/** Имя аккаунта доверонного лица, который уполномачивается председателем кооперативного участка на совершение действий */
	trusted: string
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
	waits: Array<GraphQLTypes["WaitWeight"]>
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
	details: GraphQLTypes["BankAccountDetails"]
};
	["BankAccountDetails"]: {
	__typename: "BankAccountDetails",
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
	username: string
};
	["BlockchainDocument"]: {
	__typename: "BlockchainDocument",
	/** Хеш документа */
	hash: string,
	/** Метаинформация документа */
	meta: string,
	/** Публичный ключ документа */
	public_key: string,
	/** Подпись документа */
	signature: string
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
	virtual_block_net_limit: number
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
	/** Доверенные аккаунты */
	trusted: Array<GraphQLTypes["Individual"]>,
	/** Председатель кооперативного участка */
	trustee: GraphQLTypes["Individual"],
	/** Тип организации */
	type: string
};
	["CooperativeOperatorAccount"]: {
	__typename: "CooperativeOperatorAccount",
	/** Объявление кооператива */
	announce: string,
	/** Тип кооператива */
	coop_type: string,
	/** Дата создания */
	created_at: string,
	/** Описание кооператива */
	description: string,
	/** Документ кооператива */
	document: GraphQLTypes["BlockchainDocument"],
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
	verifications: Array<GraphQLTypes["Verification"]>
};
	["CreateBankAccountInput"]: {
		/** Данные для банковского перевода */
	data: GraphQLTypes["BankAccountInput"],
	/** Флаг основного метода платежа, который отображается в документах */
	is_default: boolean,
	/** Имя аккаунта пользователя */
	username: string
};
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
	/** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
["DateTime"]: "scalar" & { name: "DateTime" };
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
	["Extension"]: {
	__typename: "Extension",
	/** Показывает, доступно ли расширение */
	available: boolean,
	/** Настройки конфигурации для расширения */
	config?: GraphQLTypes["JSON"] | undefined | null,
	/** Дата создания расширения */
	created_at: GraphQLTypes["DateTime"],
	/** Описание расширения */
	description?: string | undefined | null,
	/** Показывает, включено ли расширение */
	enabled: boolean,
	/** Изображение для расширения */
	image?: string | undefined | null,
	/** Показывает, установлено ли расширение */
	installed: boolean,
	/** Поле инструкция для установки */
	instructions: string,
	/** Уникальное имя расширения */
	name: string,
	/** Поле подробного текстового описания */
	readme: string,
	/** Схема настроек конфигурации для расширения */
	schema?: GraphQLTypes["JSON"] | undefined | null,
	/** Массив тегов для расширения */
	tags: Array<string>,
	/** Заголовок расширения */
	title?: string | undefined | null,
	/** Дата последнего обновления расширения */
	updated_at: GraphQLTypes["DateTime"]
};
	["ExtensionInput"]: {
		/** Configuration settings for the extension */
	config: GraphQLTypes["JSON"],
	/** Timestamp of when the extension was created */
	created_at?: GraphQLTypes["DateTime"] | undefined | null,
	/** Indicates whether the extension is enabled */
	enabled: boolean,
	/** Unique name of the extension */
	name: string,
	/** Timestamp of the last update to the extension */
	updated_at?: GraphQLTypes["DateTime"] | undefined | null
};
	["GetBranchesInput"]: {
		/** Фильтр по имени аккаунта кооперативного участка */
	braname?: string | undefined | null,
	/** Имя аккаунта кооператива */
	coopname: string
};
	["GetExtensionsInput"]: {
		/** Фильтр включенных расширений */
	enabled?: boolean | undefined | null,
	/** Фильтр установленных расширений */
	installed?: boolean | undefined | null,
	/** Фильтр по имени */
	name?: string | undefined | null
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
	username: string
};
	/** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
["JSON"]: "scalar" & { name: "JSON" };
	["KeyWeight"]: {
	__typename: "KeyWeight",
	/** Ключ */
	key: string,
	/** Вес */
	weight: number
};
	["Mutation"]: {
	__typename: "Mutation",
	/** Добавить доверенное лицо кооперативного участка */
	addTrustedAccount: GraphQLTypes["Branch"],
	/** Добавить метод оплаты */
	createBankAccount: GraphQLTypes["PaymentMethod"],
	/** Создать кооперативный участок */
	createBranch: GraphQLTypes["Branch"],
	/** Удалить кооперативный участок */
	deleteBranch: boolean,
	/** Удалить метод оплаты */
	deletePaymentMethod: boolean,
	/** Удалить доверенное лицо кооперативного участка */
	deleteTrustedAccount: GraphQLTypes["Branch"],
	/** Изменить кооперативный участок */
	editBranch: GraphQLTypes["Branch"],
	/** Установить расширение */
	installExtension: GraphQLTypes["Extension"],
	/** Удалить расширение */
	uninstallExtension: boolean,
	/** Обновить банковский счёт */
	updateBankAccount: GraphQLTypes["PaymentMethod"],
	/** Обновить расширение */
	updateExtension: GraphQLTypes["Extension"]
};
	["OrganizationDetails"]: {
	__typename: "OrganizationDetails",
	/** ИНН */
	inn: string,
	/** КПП */
	kpp: string,
	/** ОГРН */
	ogrn: string
};
	["PaginationResult"]: {
	__typename: "PaginationResult",
	/** Текущая страница */
	currentPage: number,
	/** Элементы текущей страницы */
	items: Array<GraphQLTypes["PaymentMethod"]>,
	/** Общее количество элементов */
	totalCount: number,
	/** Общее количество страниц */
	totalPages: number
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
	series: number
};
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
	username: string
};
	["PaymentMethodData"]:{
        	__typename:"BankAccount" | "SbpAccount"
        	['...on BankAccount']: '__union' & GraphQLTypes["BankAccount"];
	['...on SbpAccount']: '__union' & GraphQLTypes["SbpAccount"];
};
	["Permission"]: {
	__typename: "Permission",
	/** Родительское разрешение */
	parent: string,
	/** Имя разрешения */
	perm_name: string,
	/** Требуемые разрешения */
	required_auth: GraphQLTypes["Authority"]
};
	["PermissionLevel"]: {
	__typename: "PermissionLevel",
	/** Актор */
	actor: string,
	/** Разрешение */
	permission: string
};
	["PermissionLevelWeight"]: {
	__typename: "PermissionLevelWeight",
	/** Уровень разрешения */
	permission: GraphQLTypes["PermissionLevel"],
	/** Вес */
	weight: number
};
	["Query"]: {
	__typename: "Query",
	/** Получить список кооперативных участков */
	getBranches: Array<GraphQLTypes["Branch"]>,
	/** Получить список расширений */
	getExtensions: Array<GraphQLTypes["Extension"]>,
	/** Получить список методов оплаты */
	getPaymentMethods: GraphQLTypes["PaginationResult"],
	/** Получить сводную публичную информацию о системе */
	getSystemInfo: GraphQLTypes["SystemInfo"]
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
	request_time: string
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
	to: string
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
	ram_bytes: number
};
	["SbpAccount"]: {
	__typename: "SbpAccount",
	/** Мобильный телефон получателя */
	phone: string
};
	["SystemAccount"]: {
	__typename: "SystemAccount",
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
	voter_info?: string | undefined | null
};
	["SystemInfo"]: {
	__typename: "SystemInfo",
	/** Набор данных с информацией о состоянии блокчейна */
	blockchain_info: GraphQLTypes["BlockchainInfoDTO"],
	/** Объект аккаунта кооператива у оператора */
	cooperator_account: GraphQLTypes["CooperativeOperatorAccount"],
	/** Имя аккаунта кооператива */
	coopname: string,
	/** Объект системного аккаунта кооператива в блокчейне */
	system_account: GraphQLTypes["SystemAccount"],
	/** Статус контроллера кооператива */
	system_status: GraphQLTypes["SystemStatus"]
};
	/** Состояние контроллера кооператива */
["SystemStatus"]: SystemStatus;
	["UninstallExtensionInput"]: {
		/** Фильтр по имени */
	name: string
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
	verificator: string
};
	["WaitWeight"]: {
	__typename: "WaitWeight",
	/** Время ожидания в секундах */
	wait_sec: number,
	/** Вес */
	weight: number
}
    }
/** Состояние контроллера кооператива */
export enum SystemStatus {
	active = "active",
	install = "install",
	maintenance = "maintenance"
}

type ZEUS_VARIABLES = {
	["AddTrustedAccountInput"]: ValueTypes["AddTrustedAccountInput"];
	["BankAccountDetailsInput"]: ValueTypes["BankAccountDetailsInput"];
	["BankAccountInput"]: ValueTypes["BankAccountInput"];
	["CreateBankAccountInput"]: ValueTypes["CreateBankAccountInput"];
	["CreateBranchInput"]: ValueTypes["CreateBranchInput"];
	["DateTime"]: ValueTypes["DateTime"];
	["DeleteBranchInput"]: ValueTypes["DeleteBranchInput"];
	["DeletePaymentMethodInput"]: ValueTypes["DeletePaymentMethodInput"];
	["DeleteTrustedAccountInput"]: ValueTypes["DeleteTrustedAccountInput"];
	["EditBranchInput"]: ValueTypes["EditBranchInput"];
	["ExtensionInput"]: ValueTypes["ExtensionInput"];
	["GetBranchesInput"]: ValueTypes["GetBranchesInput"];
	["GetExtensionsInput"]: ValueTypes["GetExtensionsInput"];
	["GetPaymentMethodsInput"]: ValueTypes["GetPaymentMethodsInput"];
	["JSON"]: ValueTypes["JSON"];
	["SystemStatus"]: ValueTypes["SystemStatus"];
	["UninstallExtensionInput"]: ValueTypes["UninstallExtensionInput"];
	["UpdateBankAccountInput"]: ValueTypes["UpdateBankAccountInput"];
}