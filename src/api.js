import { useCallback, useEffect, useRef, useState } from 'react'

async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    credentials: 'same-origin',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  let data = null
  try { data = await res.json() } catch { /* non-JSON */ }
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export const api = {
  get: (path) => request(path),
  post: (path, body = {}) => request(path, { method: 'POST', body }),
  patch: (path, body = {}) => request(path, { method: 'PATCH', body }),
  del: (path) => request(path, { method: 'DELETE' }),
}

// Fetch hook with loading / error / refetch
export function useApi(path, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const alive = useRef(true)
  useEffect(() => () => { alive.current = false }, [])
  const load = useCallback((soft = false) => {
    if (!soft) setState((s) => ({ ...s, loading: true, error: null }))
    return api.get(path)
      .then((data) => { if (alive.current) setState({ data, loading: false, error: null }) })
      .catch((error) => { if (alive.current) setState((s) => ({ ...s, loading: false, error })) })
  }, [path]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [load, ...deps]) // eslint-disable-line react-hooks/exhaustive-deps
  return { ...state, refetch: () => load(true) }
}
