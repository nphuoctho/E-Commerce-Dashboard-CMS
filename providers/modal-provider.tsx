'use client'

import { StoreModal } from '@/components/modals/store-modal'
import { useSyncExternalStore } from 'react'

const ModalProvider = () => {
  const isMounted = useSyncExternalStore(
    () => () => {}, // subscribe (no-op)
    () => true, // getSnapshot (client)
    () => false // getServerSnapshot (server)
  )

  if (!isMounted) return null

  return (
    <>
      <StoreModal />
    </>
  )
}

export { ModalProvider }
