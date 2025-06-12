// Преобразует ссылки вида @https://... или https://... или http://... в интерактивные <a>
export function parseLinks(text = ''): string {
  if (!text) return ''
  return text.replace(/@?(https?:\/\/[^\s]+)/g, (match, url) => {
    const cleanUrl = url.startsWith('http') ? url : url.slice(1)
    return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer">${cleanUrl}</a>`
  })
}
