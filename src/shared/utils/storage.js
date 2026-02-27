export function readStorage(key, schema = null) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (schema && typeof schema.validate === 'function') {
      const ok = schema.validate(parsed)
      if (!ok) {
        console.warn('Storage schema validate failed for', key)
        return null
      }
    }
    return parsed
  } catch (err) {
    console.warn('readStorage error for', key, err)
    localStorage.removeItem(key)
    return null
  }
}

export function writeStorage(key, value, version = 1) {
  try {
    const payload = { ...value, _v: version }
    localStorage.setItem(key, JSON.stringify(payload))
    return true
  } catch (err) {
    console.warn('writeStorage error', err)
    return false
  }
}
