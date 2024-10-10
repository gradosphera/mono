import { Api, JsonRpc } from "eosjs";
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';
import * as dotenv from 'dotenv';

dotenv.config();

const privateKey = process.env.EOSIO_PRIVATE_KEY || '';
export const rpc = new JsonRpc(process.env.EOSIO_ENDPOINT || '', { fetch });
const signatureProvider = new JsSignatureProvider([privateKey]);

export const api = new Api({ rpc, signatureProvider });
