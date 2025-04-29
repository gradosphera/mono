export function constructImageSrc(name: string): string {
  if (name.startsWith('https://')) {
    return name;
  } else {
    return process.env.STORAGE_URL + name;
  }
}
