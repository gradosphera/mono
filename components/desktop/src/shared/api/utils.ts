import { env } from 'src/shared/config';

export function constructImageSrc(name: string): string {
  if (name.startsWith('https://')) {
    return name;
  } else {
    return env.STORAGE_URL + name;
  }
}
