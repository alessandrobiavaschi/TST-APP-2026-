import { useEffect } from 'react'

export function useDocumentTitle(title) {
  useEffect(() => {
    if (!title) return
    const prevTitle = document.title
    document.title = `${title} · TST`
    return () => {
      document.title = prevTitle
    }
  }, [title])
}

export default useDocumentTitle
