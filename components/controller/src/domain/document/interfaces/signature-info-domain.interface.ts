// Новые интерфейсы для обновленной версии документов
export interface ISignatureInfoDomainInterface {
  id: number;
  signed_hash: string;
  signer: string; // eosio::name в виде строки
  public_key: string;
  signature: string;
  signed_at: string; // time_point_sec в виде строки
  meta: string;
}
