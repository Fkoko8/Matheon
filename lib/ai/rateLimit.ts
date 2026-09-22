const requests = new Map<string, { count: number; reset: number }>()
export function allowAiRequest(key: string, limit = 20, windowMs = 60_000) { const now = Date.now(); const current = requests.get(key); if (!current || current.reset <= now) { requests.set(key, { count: 1, reset: now + windowMs }); return true } if (current.count >= limit) return false; current.count += 1; return true }
