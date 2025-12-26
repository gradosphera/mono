export interface IIpn {
  id?: string;
  provider: string;
  data: object;
  created_at?: Date;
  updated_at?: Date;
}

export interface IpnRepository {
  findOne(criteria: Partial<IIpn>): Promise<IIpn | null>;
  create(data: Omit<IIpn, 'id' | 'created_at' | 'updated_at'>): Promise<IIpn>;
}

export const IPN_REPOSITORY = Symbol('IpnRepository');
