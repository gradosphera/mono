import { GraphQLClient, RequestOptions } from 'graphql-request';
import { GraphQLError, print } from 'graphql'
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any; }
};

export type Extension = {
  __typename?: 'Extension';
  /** Configuration settings for the extension */
  config?: Maybe<Scalars['JSON']['output']>;
  /** Timestamp of when the extension was created */
  created_at: Scalars['DateTime']['output'];
  /** Indicates whether the extension is enabled */
  enabled: Scalars['Boolean']['output'];
  /** Unique name of the extension */
  name: Scalars['String']['output'];
  /** Timestamp of the last update to the extension */
  updated_at: Scalars['DateTime']['output'];
};

export type ExtensionInput = {
  /** Configuration settings for the extension */
  config?: InputMaybe<Scalars['JSON']['input']>;
  /** Timestamp of when the extension was created */
  created_at?: InputMaybe<Scalars['DateTime']['input']>;
  /** Indicates whether the extension is enabled */
  enabled: Scalars['Boolean']['input'];
  /** Unique name of the extension */
  name: Scalars['String']['input'];
  /** Timestamp of the last update to the extension */
  updated_at?: InputMaybe<Scalars['DateTime']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Install the extension */
  installExtension: Extension;
};


export type MutationInstallExtensionArgs = {
  appData: ExtensionInput;
};

export type Query = {
  __typename?: 'Query';
  /** Get list of extensions */
  getExtensions: Array<Extension>;
  helloWorld: Scalars['String']['output'];
};

export type GetExtensionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetExtensionsQuery = { __typename?: 'Query', getExtensions: Array<{ __typename?: 'Extension', name: string, config?: any | null, enabled: boolean, created_at: any, updated_at: any }> };

export type InstallExtensionMutationVariables = Exact<{
  appData: ExtensionInput;
}>;


export type InstallExtensionMutation = { __typename?: 'Mutation', installExtension: { __typename?: 'Extension', name: string, enabled: boolean, created_at: any, updated_at: any } };


export const GetExtensionsDocument = gql`
    query GetExtensions {
  getExtensions {
    name
    config
    enabled
    created_at
    updated_at
  }
}
    `;
export const InstallExtensionDocument = gql`
    mutation InstallExtension($appData: ExtensionInput!) {
  installExtension(appData: $appData) {
    name
    enabled
    created_at
    updated_at
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();
const GetExtensionsDocumentString = print(GetExtensionsDocument);
const InstallExtensionDocumentString = print(InstallExtensionDocument);
export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    GetExtensions(variables?: GetExtensionsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: GetExtensionsQuery; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<GetExtensionsQuery>(GetExtensionsDocumentString, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetExtensions', 'query', variables);
    },
    InstallExtension(variables: InstallExtensionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: InstallExtensionMutation; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<InstallExtensionMutation>(InstallExtensionDocumentString, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'InstallExtension', 'mutation', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;