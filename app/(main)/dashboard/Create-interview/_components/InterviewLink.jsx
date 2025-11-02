import React from 'react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Calendar, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react';
import { Mail } from 'lucide-react';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
function InterviewLink({interview_id,formData}) {
    const GetInterviewUrl=()=>{
        const url=process.env.NEXT_PUBLIC_HOST_URL+'/'+interview_id;
        return url;
    }
    const onCopyLink=async()=>{
        await navigator.clipboard.writeText(GetInterviewUrl())
        toast('Link Copied!')
    }
  return (
    <div className='flex flex-col items-center justify-center h-full'>
        <Image src={'/check.jpg'} alt='check' width={80} height={50} className='mx-auto'/>
    <h2 className='font-bold text-lg mt-4'>your AI Interview is Ready!</h2>
    <p className='mt-3'>Now You Can Share This Link With Your Candidate</p>
    <div className="w-full p-7 mt-6 rounded-lg bg-white">
        <div className="flex justify-between items-center">
            <h2 className='font-bold'>
                Interview Link
            </h2>
            <h2 className='p-1 px-2 text-primary bg-blue-50 rounded-2xl'>Valid for 30 Days</h2>

        </div>
        <div className='mt-3 flex gap-3 items-center'>
                <Input defaultValue={GetInterviewUrl()} disabled={true}></Input>
                <Button onClick={()=>onCopyLink()}>
                    <Copy/>
                    Copy Link
                </Button>
            </div>
            <hr className='my-5'/>
            <div className='flex gap-5'>
                <h2 className='text-sm text-gray-500 flex gap-2 items-center'><Clock className='h-4 w-4'/>{formData?.duration}</h2>
                <h2 className='text-sm text-gray-500 flex gap-2 items-center'><Calendar className='h-4 w-4'/>{formData?.duration}</h2>
                <h2 className='text-sm text-gray-500 flex gap-2 items-center'><Calendar className='h-4 w-4'/>{formData?.type}</h2>
                    
            </div>
    </div>
    
    <div className='mt-7 bg-white p-5 rounded-lg w-full'>
        <h2>Share Via</h2>
        <div className='flex gap-5 mt-3 justify-around'>
        <Button variant={'outline'}><Mail/> Email</Button>
        <Button variant={'outline'}><Mail/> Whatsapp</Button>
        <Button variant={'outline'}><Mail/> Message</Button>
        </div>
    </div>
    <div className='flex w-full justify-between items-center mt-5'>
        <Link href={'/dashboard'} >
        <Button variant={'outline'}><ArrowLeft/>Back to Dashboard</Button>
        </Link>
        <Link href={'/create-interview'} >
    <Button><Plus/> Create New Interview</Button>
    </Link>
    </div>
    </div>
  )
}

export default InterviewLink