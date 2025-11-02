"use client"
import {Button }from '@/components/ui/button'
import React,{useEffect, useState} from 'react'
import { Camera, Video } from 'lucide-react'
import { supabase } from '@/services/supabaseClient'
import { useUser } from '@/app/provider'
import { Inter } from 'next/font/google'
import { toast } from 'sonner'
import InterviewCard from '../dashboard/_components/InterviewCard'
function AllInterview() {
const[interviewList,setInterviewList]=useState([])
    const{user}=useUser();
    useEffect(()=>{user && GetInterviewList()},[user])
    const GetInterviewList=async()=>{

    let { data: Interviews, error } = await supabase
    .from('Interviews')
    .select('created_at,jobPosition,duration,interview_id,interview-feedback(userEmail)')
    .eq('userEmail',user?.email)
    .order('id', { ascending: false });
    console.log(Interviews);
    setInterviewList(Interviews);


    }

  return (
    <div className='my-5'><h2 className='font-bold text-2xl'>All Previously Created Interviews</h2>
    {interviewList?.length==0&&<div className='p-5 flex flex-col gap-3 items-center bg-white mt-5'>
       <Video className='h-10 w-10 text-primary'/>
       <h2>You don't have any interview Created!</h2> 
       <Button>+ Create New Interview</Button>
       </div>}
       {interviewList &&
       <div className='grid grid-cols-2 mt-5 lg:grid-cols-3 xl:grid-cols-3 gap-5'>
        {interviewList.map((interview,index)=>(
          <InterviewCard interview={interview} key={index} />
        ))}
        </div>}
    </div>
)
}

export default AllInterview