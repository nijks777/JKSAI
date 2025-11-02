"use client"
import React from 'react'
import CreateOptions from './_components/CreateOptions'
import LatestInterviewsList from './_components/LatestInterviewsList'

function Dashboard() {
  return (
    <div className="dashboard-container">
      <h2 className='mb-5 font-bold text-2xl'>Dashboard</h2>
      <CreateOptions/>
      <LatestInterviewsList/>
    </div>
  )
}

export default Dashboard