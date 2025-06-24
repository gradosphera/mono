export function matchMock({ code, table, value, actionName }: { code?: string, table?: string, value?: Record<string, any>, actionName?: string }, url: string, params?: URLSearchParams) {
  if (!url.includes('/get-tables') && !url.includes('/get-actions')) {
    return false
  }
  if (!params) {
    return false
  }
  const filter = params.get('filter')
  if (!filter) {
    return false
  }
  try {
    const obj = JSON.parse(filter)
    // Для get-actions: code -> account, actionName -> name
    if (url.includes('/get-actions')) {
      if (code && obj.account !== code) {
        return false
      }
      if (actionName && obj.name !== actionName) {
        return false
      }
    }
    else {
      if (code && obj.code !== code) {
        return false
      }
      if (table && obj.table !== table) {
        return false
      }
    }
    if (value) {
      for (const key in value) {
        if (obj[key] !== value[key]) {
          return false
        }
      }
    }
    return true
  }
  catch {
    return false
  }
}
