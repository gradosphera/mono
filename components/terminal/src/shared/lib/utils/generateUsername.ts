export const generateUsername = (): string => {
  let result = '';

  const possible = 'abcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < 12; i++)
    result += possible.charAt(Math.floor(Math.random() * possible.length));

  return result;
};
