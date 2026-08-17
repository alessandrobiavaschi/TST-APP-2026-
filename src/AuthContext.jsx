import { createContext, useContext } from 'react'

export const AuthContext = createContext({
  user: null,
  authReady: false,
  logout: async () => {},
  isLocalDeveloper: false,
  localDeveloperAccessAvailable: false,
  enterLocalDeveloperMode: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}
