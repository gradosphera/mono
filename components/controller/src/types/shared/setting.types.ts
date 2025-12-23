export interface ISettings {
  provider: {
    name: string;
    client: string;
    secret: string;
  };
  app: {
    title: string;
    description: string;
  };
}
