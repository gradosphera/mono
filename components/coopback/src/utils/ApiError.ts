export default class ApiError extends Error {
  statusCode: number | undefined;
  isOperational: boolean;
  subcode: any;
  constructor(statusCode?: number, message?: string, isOperational = true, stack = '', subcode?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.subcode = subcode
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
