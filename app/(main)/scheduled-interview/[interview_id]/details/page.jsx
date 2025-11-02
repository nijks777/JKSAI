"use client"
import React, { useEffect } from 'react'
import { useParams } from 'next/navigation';
import { useUser } from '@/app/provider';
import { supabase } from '@/services/supabaseClient';
import InterviewDetailContainer from '../../_components/InterviewDetailContainer';
import { useState } from 'react';
import CandidatList from '../../_components/CandidatList';

function InterviewDetail() {
    const { interview_id } = useParams();
    const {user} = useUser();
    const[InterviewDetail,setInterviewDetail]=useState();

    useEffect(()=>{
        user && GetInterviewDetails();
    },[user])

    const GetInterviewDetails=async()=>{
                const result=await supabase.from('Interviews')
                .select(`created_at,jobPosition,jobDescription,type,questionList,duration,interview_id,
                    interview-feedback(userEmail,userName,feedback,created_at)`)
                .eq('userEmail',user?.email)
                .eq('interview_id', interview_id)
                .order('id', { ascending: false });
                setInterviewDetail(result?.data[0])
                console.log(result);
    }
  return (
    <div className='mt-5'>
        <h2 className='font-bold text-2xl'>
         Interview Details
        </h2>
        <InterviewDetailContainer interviewDetail={InterviewDetail}/>
        <CandidatList candidateList={InterviewDetail?.['interview-feedback']}/>
    </div>
  )
}

export default InterviewDetail