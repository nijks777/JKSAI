import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
import moment from 'moment/moment'
import React from 'react'
import { toast } from 'sonner'
import { Send } from 'lucide-react'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

function InterviewCard({interview,viewDetail=false}) {
    const copyLink = () => {
        const url = process.env.NEXT_PUBLIC_HOST_URL + "/" + interview?.interview_id;
        navigator.clipboard.writeText(url);
        toast('Link Copied to Clipboard');
    }
    const onSend=()=>{
        window.location.href="mailto:jalaj.ka.sharma@gmail.com?subject=Interview Link&body=Hi, Please find the interview link below: "+process.env.NEXT_PUBLIC_HOST_URL + "/" + interview?.interview_id;

    }
    
  return (
    <div className='p-5 bg-white rounded-lg border'>
        <div className='flex items-center justify-between'>
            <div className='h-[40px] w-[40px] bg-primary rounded-full'></div>
            <h2 className='text-sm'>
                {moment(interview?.created_at).format('DD MMM YYYY')}
            </h2>
        </div>
        <h2 className='mt-3 font-bold text-lg'>
            {interview?.jobPosition}
        </h2>
        <h2 className='mt-2 flex justify-between'>
            {interview?.duration}  
            <span className='text-green-700'>{interview['interview-feedback']?.length} Candidates</span>
        </h2>
        {!viewDetail? <div className='grid grid-cols-2 gap-2 w-full mt-5'>
            <Button 
                variant='outline' 
                size="sm" 
                className='flex items-center justify-center cursor-pointer'
            
                onClick={copyLink}
            >
                <Copy className="h-3 w-3 mr-1" /> <span className="text-xs">Copy</span>
            </Button>
            <Button size="sm" className='flex items-center justify-center cursor-pointer' onClick={onSend}>
                <Send className="h-3 w-3 mr-1" /> <span className="text-xs">Send</span>
            </Button>
        </div>:
        <Link href={'/scheduled-interview/'+interview?.interview_id+"/details"}>
        <Button className="mt-5 w-full" variant="outline">View Detail<ArrowRight/></Button>
        </Link>}
    </div>
  )
}

export default InterviewCard