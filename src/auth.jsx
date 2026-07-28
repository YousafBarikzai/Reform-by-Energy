import { createContext, useContext, useEffect, useState } from 'react'
import { api } from './api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = () => api.get('/me')
    .then((d) => setMember(d.member))
    .catch(() => setMember(null))

  useEffect(() => { refresh().finally(() => setLoading(false)) }, [])

  const value = {
    member, loading,
    setMember,
    refresh,
    logout: async () => { await api.post('/auth/logout'); setMember(null) },
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
