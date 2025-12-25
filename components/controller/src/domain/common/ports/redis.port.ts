export interface RedisPort {
  publish(channel: string, message: any): Promise<void>;
  subscribe(channel: string, handler: (message: any) => void): void;
}

export const REDIS_PORT = Symbol('RedisPort');
