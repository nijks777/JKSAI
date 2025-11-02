"use client"
import React, { use, useContext } from 'react'
import InterviewHeader from '../_components/InterviewHeader'
import Image from 'next/image'
import { Clock, Loader2Icon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Video } from 'lucide-react'
import { useParams } from 'next/navigation'
import { supabase } from '@/services/supabaseClient'
import { useEffect } from 'react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Inter } from 'next/font/google'      
import { InterviewDataContext } from '@/context/InterviewDataContext'
import { useUser } from '@/app/provider'
import { useRouter } from 'next/navigation'

function Interview() {
  const {interview_id} = useParams();
  console.log(interview_id)
  const [interviewData, setInterviewData] = useState();
  const [userName, setUserName] = useState();
  const[userEmail, setUserEmail] = useState();
  const [loading, setLoading] = useState(false);
  const{interviewInfo,setInterviewInfo}=useContext(InterviewDataContext);
  const router=useRouter();
  useEffect(()=>{
    interview_id && GetInterviewDetails();

  },[interview_id])
  const GetInterviewDetails=async()=>{
    setLoading(true);
    try{
    let { data: Interviews, error } = await supabase
  .from('Interviews')
  .select("jobPosition,jobDescription,duration,type")
  .eq('interview_id', interview_id)
  setInterviewData(Interviews[0]);
  setLoading(false);
  if(Interviews?.length==0){
    toast('Invalid Interview Link')
    return;
  }}
  catch(e){
    setLoading(false);
    toast('Invalid Interview Link')
  }
  
  }
  const onJoinInterview=async()=>{
    setLoading(true);
    let { data: Interviews, error } = await supabase
    .from('Interviews')
    .select("*")
    .eq('interview_id', interview_id);
    console.log(Interviews[0]);
    setInterviewInfo({
      userName:userName,
      userEmail:userEmail,
      interviewData:Interviews[0],
    });
    router.push('/interview/'+interview_id+'/start')
    setLoading(false);
}
  return (
    <div className='px-10 md:px-28 lg:px-48 xl:px-64 mt-16'>
      <div className='flex flex-col justify-center items-center rounded-lg bg-white p-7 lg:px-33 xl:px-52 pb-15'>
        <Image src={'/Logo.png'} alt='logo' width={200} height={100} className='w-[140px]'/>
        <h2 className='mt-3 font-bold text-1xl'>AI Interview Taker</h2>
        <Image src={'/Int.jpg'} alt='interview' width={500} height={500} className='w-{280px} my-6'/>
        <h2 className='font-bold text-xl '>{interviewData?.jobPosition}</h2>
        <h2 className='flex gap-2 items-center text-gray-500 mt-3'><Clock className='h-4 w-4'/>{interviewData?.duration}</h2>


        <div className='w-fyll p-4 mt-3 rounded-lg bg-white'>
          <h2>Enter your Full Name </h2>
          <Input placeholder='Enter Your Name' onChange={(event)=>setUserName(event.target.value)}
           className='w-[300px] mt-3'/>
          <h2>  Enter your Email </h2>
          <Input placeholder='Enter Your Email' onChange={(event)=>setUserEmail(event.target.value)}
           className='w-[300px] mt-3'/>
        </div>
        <div className='p-3 bg-amber-50 rounded-lg border border-amber-200 mt-5'>
          <h2 className='font-bold'> Before You Begin</h2>
          <ul className=''>
            <li className='text-sm text-primary'>-Test your Internet Connection</li>
            <li className='text-sm text-primary'>-Keep your Microphone and Camera On.</li>
            <li className='text-sm text-primary'>-Please answer the Question When Asked</li>
          </ul>
        </div>
        <Button className={'mt-5 w-full font-bold'}
        disabled={loading||!userName}
        onClick={()=>onJoinInterview()}><Video/>{loading&&<Loader2Icon/>}Join Interview</Button>
      </div>
      
    </div>
  )
}

export default Interview