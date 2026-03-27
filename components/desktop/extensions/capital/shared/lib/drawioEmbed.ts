/** Публичный embed diagrams.net; без переменных окружения. */
const DRAWIO_EMBED_BASE = 'https://embed.diagrams.net';

export function getDrawioEmbedOrigin(): string {
  return DRAWIO_EMBED_BASE;
}

/** Origin для проверки postMessage. */
export function getDrawioPostMessageOrigin(): string {
  return new URL(DRAWIO_EMBED_BASE).origin;
}

export function buildDrawioEmbedIframeSrc(embedBase: string, readonly: boolean): string {
  const base = embedBase.replace(/\/+$/, '');
  const url = new URL(`${base}/`);
  url.searchParams.set('embed', '1');
  url.searchParams.set('proto', 'json');
  url.searchParams.set('spin', '1');
  url.searchParams.set('ui', 'min');
  url.searchParams.set('noExitBtn', '1');
  url.searchParams.set('noSaveBtn', '1');
  url.searchParams.set('saveAndExit', '0');
  if (readonly) {
    url.searchParams.set('chrome', '0');
  } else {
    url.searchParams.set('libraries', '0');
  }
  return url.toString();
}
