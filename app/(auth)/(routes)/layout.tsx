import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import React from 'react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex items-center justify-center h-full'>
      <div className='flex flex-col gap-6 items-center'>
        {children}

        <Alert className='max-w-md'>
          <AlertTitle>You can use demo account</AlertTitle>
          <AlertDescription>
            Username: store-demo <br /> Password: password-demo@123
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
