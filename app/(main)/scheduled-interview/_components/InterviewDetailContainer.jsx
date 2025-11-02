import React from 'react'
import { Calendar, Clock, MessageCircleQuestionIcon } from 'lucide-react'
import moment from 'moment'

function InterviewDetailContainer({interviewDetail}) {
  // Safely parse the interview type
  const getInterviewType = () => {
    try {
      if (interviewDetail?.type) {
        const parsedType = JSON.parse(interviewDetail.type);
        return Array.isArray(parsedType) && parsedType.length > 0 ? parsedType[0] : 'N/A';
      }
      return 'N/A';
    } catch (error) {
      console.error('Error parsing interview type:', error);
      return 'N/A';
    }
  };

  return (
    <div className='p-5 bg-white rounded-lg mt-5'>
        <h2>
          {interviewDetail?.jobPosition || 'No Position Specified'}
        </h2>
        <div className='mt-4 flex items-center justify-between lg:pr-52'>
            <div>
                <h2 className='text-sm text-gray-500'>Duration</h2>
                <h2 className='flex text-sm font-bold items-center gap-2'>
                    <Clock className='h-4 w-4'/> {interviewDetail?.duration || 'N/A'}
                </h2>
            </div>
            <div>
                <h2 className='text-sm text-gray-500'>Created On</h2>
                <h2 className='flex text-sm font-bold items-center gap-2'>
                    <Calendar className='h-4 w-4'/> {interviewDetail?.created_at 
                      ? moment(interviewDetail.created_at).format('MMM DD, YYYY')
                      : 'N/A'}
                </h2>
            </div>
            <div>
                <h2 className='text-sm text-gray-500'>Type</h2>
                <h2 className='flex text-sm font-bold items-center gap-2'>
                    <Clock className='h-4 w-4'/> {getInterviewType()}
                </h2>
            </div>
        </div>
        <div className='mt-5'>
            <h2 className='font-bold'>Job Desscription</h2>
            <p className='text-sm leading-6'>{interviewDetail?.jobDescription}</p>
        </div>
        <div className='mt-5'>
            <h2 className='font-bold'>Interview Questions</h2>
            <div className='grid grid-cols-2 gap-3 mt-3'>
    {interviewDetail?.questionList.map((item, index) => (
        <h2 className='text-sm flex' key={index}>
            <MessageCircleQuestionIcon className='h-4 w-4 text-primary'/>{index+1}.{item?.question}
        </h2>
    ))}
</div>
        </div>
    </div>
  )
}

export default InterviewDetailContainer