import { useSyncExternalStore } from 'react'

const useOrigin = () => {
  const isMounted = useSyncExternalStore(
    () => () => {}, // subcribe (no-op)
    () => true, // getSnapshot (client)
    () => false // getServerSnapshot (server)
  )

  const origin =
    typeof window !== 'undefined' && window.location.origin ? window.location.origin : ''

  if (!isMounted) return null

  return origin
}

export { useOrigin }
