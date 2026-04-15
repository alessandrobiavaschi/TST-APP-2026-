import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// 1) envPrefix espone VITE_* e FIREBASE_* su import.meta.env nel client.
// 2) loadEnv + process.env → __TST_FIREBASE_BUILD__ iniettato nel bundle (Netlify / CI).

function normEnv(v) {
  if (v == null) return ''
  const s = String(v).trim()
  if (!s || /^undefined$/i.test(s) || /^null$/i.test(s)) return ''
  return s
}

function pickEnv(fileEnv, ...keys) {
  for (const key of keys) {
    const raw = fileEnv[key] ?? process.env[key]
    const v = normEnv(raw)
    if (v) return v
  }
  return ''
}

export default defineConfig(({ mode }) => {
  const root = process.cwd()
  const fileEnv = loadEnv(mode, root, '')

  const firebaseBuild = {
    apiKey: pickEnv(
      fileEnv,
      'VITE_FIREBASE_API_KEY',
      'FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'REACT_APP_FIREBASE_API_KEY',
    ),
    authDomain: pickEnv(
      fileEnv,
      'VITE_FIREBASE_AUTH_DOMAIN',
      'FIREBASE_AUTH_DOMAIN',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'REACT_APP_FIREBASE_AUTH_DOMAIN',
    ),
    projectId: pickEnv(
      fileEnv,
      'VITE_FIREBASE_PROJECT_ID',
      'FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'REACT_APP_FIREBASE_PROJECT_ID',
    ),
    storageBucket: pickEnv(
      fileEnv,
      'VITE_FIREBASE_STORAGE_BUCKET',
      'FIREBASE_STORAGE_BUCKET',
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
      'REACT_APP_FIREBASE_STORAGE_BUCKET',
    ),
    messagingSenderId: pickEnv(
      fileEnv,
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      'FIREBASE_MESSAGING_SENDER_ID',
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
    ),
    appId: pickEnv(
      fileEnv,
      'VITE_FIREBASE_APP_ID',
      'FIREBASE_APP_ID',
      'NEXT_PUBLIC_FIREBASE_APP_ID',
      'REACT_APP_FIREBASE_APP_ID',
    ),
  }

  return {
    plugins: [react()],
    envPrefix: ['VITE_', 'FIREBASE_'],
    define: {
      __TST_FIREBASE_BUILD__: JSON.stringify(firebaseBuild),
    },
  }
})
