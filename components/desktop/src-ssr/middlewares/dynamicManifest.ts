import { ssrMiddleware } from 'quasar/wrappers';

// Динамический web app manifest: имя берётся из process.env коопа в РАНТАЙМЕ.
// Образ desktop generic, кооп задаётся env контейнера → статический manifest
// (этап сборки) коопа не знает и всегда отдаёт дефолтное имя.
//
// ВАЖНО: serveStatic('/') в src-ssr server'е регистрируется ДО user-middleware,
// поэтому путь /manifest.json перехватила бы статика Workbox (файл существует) и
// сюда бы не дошло. Поэтому отдаём по /manifest.webmanifest — статики там нет,
// запрос проваливается до этого middleware. <link rel="manifest"> в HTML
// переписывается на этот путь в generateConfig.ts.

// Сайт кооператива (vars.website) подключается к PWA через scope_extensions:
// переходы из установленного приложения на сайт остаются в окне PWA, а не
// выкидывают в браузер. Источник — публичный getSystemInfo бэкенда (председатель
// меняет сайт в ЛК без редеплоя), кэш с TTL чтобы не дёргать бэкенд на каждый
// запрос манифеста. Работает в Chrome/Edge 138+ на десктопе при условии, что
// сайт отдаёт /.well-known/web-app-origin-association с записью
// {"https://<домен-лк>/": {"scope": "/"}}; на мобильных платформах браузеры
// scope_extensions пока не поддерживают.
let cachedWebsiteOrigin: string | null = null;
let cachedAt = 0;
const WEBSITE_TTL_MS = 5 * 60 * 1000;

async function getWebsiteOrigin(): Promise<string | null> {
  if (Date.now() - cachedAt < WEBSITE_TTL_MS) return cachedWebsiteOrigin;
  cachedAt = Date.now(); // и при ошибке не чаще TTL
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/v1/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ getSystemInfo { vars { website } } }' }),
    });
    const json = await response.json();
    const website: string | undefined = json?.data?.getSystemInfo?.vars?.website;
    cachedWebsiteOrigin = website
      ? new URL(website.startsWith('http') ? website : `https://${website}`).origin
      : null;
  } catch {
    cachedWebsiteOrigin = null;
  }
  return cachedWebsiteOrigin;
}

export default ssrMiddleware(({ app }) => {
  app.get('/manifest.webmanifest', async (req, res) => {
    const name = process.env.COOP_SHORT_NAME || 'Цифровой Кооператив';
    const description =
      process.env.SITE_DESCRIPTION ||
      'кооперативная экономика для сообществ и бизнеса';

    const manifest: Record<string, unknown> = {
      // Явный id фиксирует identity приложения = "https://<домен>/" — этим же
      // ключом сайт кооператива ссылается на ЛК в web-app-origin-association.
      id: '/',
      name,
      short_name: name,
      description,
      start_url: '/',
      scope: '/',
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#ffffff',
      theme_color: '#ffffff',
      categories: ['business', 'finance', 'productivity'],
      lang: 'ru',
      dir: 'ltr',
      icons: [
        { src: '/logo.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        { src: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
        { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-256x256.png', sizes: '256x256', type: 'image/png' },
        { src: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
        { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
    };

    const websiteOrigin = await getWebsiteOrigin();
    const ownHost = req.get('host');
    if (websiteOrigin && ownHost && new URL(websiteOrigin).host !== ownHost) {
      manifest.scope_extensions = [{ type: 'origin', origin: websiteOrigin }];
    }

    res.set({
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
    res.send(JSON.stringify(manifest));
  });
});
