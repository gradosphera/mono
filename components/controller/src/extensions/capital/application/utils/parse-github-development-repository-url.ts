const GITHUB_HOST = 'github.com';

/**
 * Нормализованный ключ репозитория для курсора синхронизации (кооп + URL + ветка).
 * Поддерживается только github.com (PRD: реализация API может опираться на GitHub).
 */
export function normalizeDevelopmentRepositoryUrl(input: string): string | null {
  const parsed = parseGitHubDevelopmentRepository(input);
  if (!parsed) {
    return null;
  }
  return `https://${GITHUB_HOST}/${parsed.owner}/${parsed.repo}`;
}

/**
 * Разбор URL или короткой формы owner/repo в owner/repo для GitHub REST API.
 */
export function parseGitHubDevelopmentRepository(input: string): { owner: string; repo: string } | null {
  const raw = input.trim();
  if (!raw) {
    return null;
  }

  const shortForm = /^([\w.-]+)\/([\w.-]+)$/i.exec(raw.replace(/\.git$/i, ''));
  if (shortForm) {
    return { owner: shortForm[1], repo: shortForm[2] };
  }

  try {
    const withScheme = raw.includes('://') ? raw : `https://${raw}`;
    const u = new URL(withScheme);
    const host = u.hostname.toLowerCase();
    if (host !== GITHUB_HOST && host !== `www.${GITHUB_HOST}`) {
      return null;
    }
    const parts = u.pathname
      .replace(/^\/+|\/+$/g, '')
      .split('/')
      .filter((p) => p.length > 0);
    if (parts.length < 2) {
      return null;
    }
    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/i, '');
    if (!/^[\w.-]+$/i.test(owner) || !/^[\w.-]+$/i.test(repo)) {
      return null;
    }
    return { owner, repo };
  } catch {
    return null;
  }
}
