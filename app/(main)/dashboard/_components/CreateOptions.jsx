import React from 'react'
import {Phone, Video} from 'lucide-react'
import Link from 'next/link'

function CreateOptions() {
  return (
    <div className='grid grid-cols-2 gap-5'>
        <Link  href={'/dashboard/Create-interview'}className='bg-white border border-gray-200 rounded-lg p-5 flex flex-col gap-2 cursor-pointer'>
            <Video className='p-3 text-primary bg-blue-200 rounded-lg h-12 w-12'/>
        <h2 className='font-bold'>Create New Interview</h2>
        <h2 className='text-gray-500'>Create a new interview with AI</h2>
        </Link>
        {/* <div className='bg-white border border-gray-200 rounded-lg p-5'>
            <Phone className='p-3 text-primary bg-blue-200 rounded-lg h-12 w-12'/>
        <h2 className='font-bold'>Create Phone Screening</h2>
        <h2 className='text-gray-500'>Schedule a Call with Candidate</h2>
        </div> */}
    </div>
  )
}

export default CreateOptions