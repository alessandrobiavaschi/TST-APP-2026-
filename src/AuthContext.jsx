import { createContext, useContext } from 'react'

export const AuthContext = createContext({ user: null, authReady: false, logout: async () => {} })

export function useAuth() {
  return useContext(AuthContext)
}
