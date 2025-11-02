import React from 'react'

function QuestionListContainer({questionList}) {
  return (
    <div>
                            <h2 className='text-xl font-bold mb-4 text-gray-800'>Interview Questions</h2>
                    <div className='space-y-4'>
                        {questionList.map((item, index) => (
                            <div 
                                key={index}
                                className='p-5 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200'
                            >
                                <div className='flex items-start'>
                                    <div className='flex-shrink-0 bg-blue-100 text-blue-800 font-bold rounded-full h-8 w-8 flex items-center justify-center mr-3'>
                                        {index + 1}
                                    </div>
                                    <div className='flex-1'>
                                        <h3 className='text-lg font-semibold text-gray-800 mb-2'>{item.question}</h3>
                                        {item.type && (
                                            <div className='inline-block px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-700'>
                                                {item.type}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
    </div>
  )
}

export default QuestionListContainer