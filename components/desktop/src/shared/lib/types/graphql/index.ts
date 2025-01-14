export interface GraphQLErrorLocation {
  line: number;
  column: number;
}

export interface GraphQLErrorDetail {
  message: string;
  locations?: GraphQLErrorLocation[];
  path?: string[];
  extensions?: {
    code?: number;  // Изменяем на number, так как в примере code — это число
    stacktrace?: string[];
  };
}
