'use client'

import { FC, useSyncExternalStore } from 'react'
import { Modal } from '../ui/modal'
import { Button } from '../ui/button'

interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}

const AlertModal: FC<AlertModalProps> = ({ isOpen, onClose, onConfirm, loading }) => {
  const isMounted = useSyncExternalStore(
    () => () => {}, // subscribe (no-op)
    () => true, // getSnapshot (client)
    () => false // getServerSnapshot (server)
  )

  if (!isMounted) return null

  return (
    <Modal
      title="Are you sure ?"
      description="This is action cannot be undone."
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="pt-6 space-x-2 flex items-center justify-end w-full">
        <Button disabled={loading} variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={loading} variant="destructive" onClick={onConfirm}>
          Continue
        </Button>
      </div>
    </Modal>
  )
}

export default AlertModal
