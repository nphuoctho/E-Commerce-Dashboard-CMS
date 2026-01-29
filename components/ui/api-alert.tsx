'use client'

import { Copy, Server } from 'lucide-react'
import { FC } from 'react'
import toast from 'react-hot-toast'

import { Alert, AlertDescription, AlertTitle } from './alert'
import { Badge } from './badge'
import { Button } from './button'

interface ApiAlertProps {
  title: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  description: string
  variant: 'public' | 'admin'
}

const textMap: Record<ApiAlertProps['variant'], string> = {
  public: 'Public',
  admin: 'Admin',
}

const variantMap: Record<ApiAlertProps['variant'], 'secondary' | 'destructive'> = {
  public: 'secondary',
  admin: 'destructive',
}

const ApiAlert: FC<ApiAlertProps> = ({ title, description, variant }) => {
  const onCopy = () => {
    navigator.clipboard.writeText(description)
    toast.success('API Route copied to the clipboard.')
  }

  return (
    <Alert>
      <Server className='size-4' />
      <AlertTitle className='flex items-center gap-x-2'>
        {title}
        <Badge variant={variantMap[variant]}>{textMap[variant]}</Badge>
      </AlertTitle>
      <AlertDescription className='mt-4 flex items-center justify-between'>
        <code className='relative rounded bg-muted px-[0.3rem] py-[0.2rem] text-primary font-mono text-sm font-semibold'>
          {description}
        </code>
        <Button variant='outline' size='icon' onClick={onCopy}>
          <Copy className='size-4' />
        </Button>
      </AlertDescription>
    </Alert>
  )
}

export default ApiAlert
