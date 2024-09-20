import axios from 'axios';
import { Cooperative } from 'cooptypes';

export const getActions = async <T>(path: string, params?: any): Promise<Cooperative.Blockchain.IGetActions> => {
  const response = await axios.get(path, {
    params,
  });

  return response.data;
};

export const getTables = async <T>(path: string, params?: any): Promise<Cooperative.Blockchain.IGetTables> => {
  const response = await axios.get(path, {
    params,
  });

  return response.data;
};
