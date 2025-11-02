import React from 'react'
import { AppHeader } from './_components/AppHeader'

function DashboardProvider({children}) {
  return (
    <div className='min-h-screen bg-secondary'>
        <AppHeader />
        <div className='w-full'>
            {children}
        </div>
    </div>
  )
}

export default DashboardProvider