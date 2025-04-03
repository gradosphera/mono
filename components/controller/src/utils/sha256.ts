import crypto from 'crypto';

export const sha256 = (data: string | number): string => {
  return crypto.createHash('sha256').update(String(data)).digest('hex');
};
