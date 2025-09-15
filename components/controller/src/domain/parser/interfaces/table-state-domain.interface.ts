export interface TableStateDomainInterface {
  code: string;
  scope: string;
  table: string;
  primary_key: string;
  value: any;
  block_num: number;
  created_at: Date;
}
