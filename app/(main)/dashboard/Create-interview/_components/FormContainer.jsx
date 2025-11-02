import { Input } from '@/components/ui/input'
import React, { useEffect, useState } from 'react'
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { InterviewType } from '@/services/Constants'
import { ArrowRight, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import axios from 'axios'
  
function FormContainer({onHandleInputChange,GoToNext,jobPosition}) {
    const[interviewType,setInterviewType]=useState([]);
    const[jobDescription,setJobDescription]=useState();
    const[loading,setLoading]=useState(false);
    useEffect(()=>{
        if(interviewType)
            {
        onHandleInputChange('type',interviewType)
    }
},[interviewType])

    const AddInterviewType=(type)=>{
        const data=interviewType.includes(type);
        if(!data)
        {
            setInterviewType(prev=>[...prev,type])
        }else{
            const result=interviewType.filter((item)=>item!==type);
            setInterviewType(result)
        }
    }

    const generateJobDescription=async()=>{
      setLoading(true)
      try {
        const prompt=`job position is ${jobPosition} . give me job description in 100 words`
        const data={
          prompt:prompt
        }
        const result=await axios.post('/api/ai-model',data);

        console.log("Job Description API Response:", result.data);

        // Extract the text from the response
        let description = '';

        // Check if result.data is a string
        if (typeof result.data === 'string') {
          description = result.data;
        }
        // Check if result.data is an object with a content property
        else if (result.data && result.data.content) {
          description = result.data.content;
        }
        // Check if result.data is an object with a description property
        else if (result.data && result.data.description) {
          description = result.data.description;
        }
        // If it's an object, try to extract text from it
        else if (typeof result.data === 'object') {
          // Try to stringify and extract meaningful text
          try {
            const parsed = JSON.stringify(result.data);
            description = parsed;
          } catch (e) {
            description = 'Failed to parse job description';
          }
        }

        console.log("Extracted description:", description);

        setJobDescription(description);
        onHandleInputChange('jobDescription', description);
      } catch (error) {
        console.error("Error generating job description:", error);
        setJobDescription("Failed to generate job description. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  return (
    <div className='p-5 bg-white rounded-xl'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
      <div className='col-span-2'>
        <h2 className='text-sm font-medium'>Job Position</h2>
        <Input placeholder="ENTER JOB POSITION" className='w-full mt-2'
        onChange={(event)=>onHandleInputChange('jobPosition',event.target.value)}/>
      </div>
      <div className='flex items-end'>
        <Button className='w-full' onClick={generateJobDescription} disabled={!jobPosition}>
          {loading?<><Loader className='animate-spin'/> Generating...</>:'Generate Job Description'}
          </Button>
      </div>
      </div>
      <div className='mt-5'>
        <h2 className='text-sm'>Job Description</h2>
        <Textarea placeholder='Enter details job description'
        value={jobDescription}
        className='h-[150px] mt-2'
        onChange={(event)=>{
          setJobDescription(event.target.value);
          onHandleInputChange('jobDescription',event.target.value);
        }}/>
      </div>
      <div className='mt-5'>
        <h2 className='text-sm font-medium'>Interview Duration</h2>
        <Select onValueChange={(value)=>onHandleInputChange('duration',value)}>
          <SelectTrigger className="w-full mt-2">
            <SelectValue placeholder="Select Duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5 Min">5 Min</SelectItem>
            <SelectItem value="15 Min">15 Min</SelectItem>
            <SelectItem value="30 Min">30 Min</SelectItem>
            <SelectItem value="45 Min">45 Min</SelectItem>
            <SelectItem value="60 Min">60 Min</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className='mt-5'>
        <h2 className='text-sm font-medium'>Interview Type</h2>
        <div className='flex gap-3 flex-wrap mt-2'>
          {InterviewType.map((type, index) => (
            <div key={index} className={`flex items-center cursor-pointer gap-2 p-1 px-2 bg-white border border-gray-300 
            rounded-2xl hover:bg-secondary 
            ${interviewType.includes(type.title) && ' bg-orange-100 text-primary'}`}
            onClick={()=>AddInterviewType(type.title)}>
              <type.icon className='h-4 w-4'/>
              <span>{type.title}</span>
            </div>
          ))}
        </div>
      </div>
      <div className='mt-7 flex justify-end' onClick={()=>GoToNext()}>
        <Button>Generate Questions <ArrowRight/></Button>
      </div>
    </div>
  )
}

export default FormContainer