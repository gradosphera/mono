export const rawDocumentMetaSelector = {
  block_num: true,
  coopname: true,
  created_at: true,
  generator: true,
  lang: true,
  links: true,
  registry_id: true,
  timezone: true,
  title: true,
  username: true,
  version: true,
};

export const rawDocumentSelector = {
  binary: true,
  full_title: true,
  hash: true,
  html: true,
  meta: rawDocumentMetaSelector, // Общая часть meta
};
