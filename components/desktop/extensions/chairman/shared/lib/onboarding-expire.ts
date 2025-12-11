export const formatExpireCountdown = (expireAt?: Date | string | null): string => {
  if (!expireAt) return '';

  const date = expireAt instanceof Date ? expireAt : new Date(expireAt);
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = date.getTime() - Date.now();
  if (diffMs <= 0) return 'срок истёк';

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);

  return `${days}д ${hours}ч ${minutes}м`;
};
