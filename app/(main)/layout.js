import React from 'react'
import DashboardProvider from './provider'

function DashboardLayout({children}) {
  return (
    <DashboardProvider>
      <div className='px-6 py-8 max-w-7xl mx-auto'>
        {children}
      </div>
    </DashboardProvider>
  )
}

export default DashboardLayout