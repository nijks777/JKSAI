"use client"
import React, { useEffect, useState } from 'react'
import { useContext } from 'react'
import { InterviewDataContext } from '@/context/InterviewDataContext'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/services/supabaseClient'
import { useRouter } from 'next/navigation'

function CompletedPage() {
  const { interviewInfo } = useContext(InterviewDataContext)
  const [feedbackData, setFeedbackData] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // If no interview info exists in context, redirect to home
    if (!interviewInfo || !interviewInfo.userEmail) {
      router.replace('/')
      return
    }

    // Fetch feedback data from Supabase
    const fetchFeedback = async () => {
      try {
        const { data, error } = await supabase
          .from('interview-feedback')
          .select('*')
          .eq('userEmail', interviewInfo.userEmail)
          .order('created_at', { ascending: false })
          .limit(1)

        if (error) {
          console.error('Error fetching feedback:', error)
        } else if (data && data.length > 0) {
          // Parse the feedback JSON string
          try {
            const parsedFeedback = JSON.parse(data[0].feedback)
            setFeedbackData(parsedFeedback)
          } catch (e) {
            console.error('Error parsing feedback JSON:', e)
            setFeedbackData(data[0])
          }
        }
      } catch (err) {
        console.error('Error in fetchFeedback:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFeedback()
  }, [interviewInfo, router])

  return (
    <div className="p-8 md:p-16 lg:p-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center text-center mb-12">
          <div className="bg-green-100 p-5 rounded-full mb-4">
            <CheckCircle size={60} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Interview Completed!</h1>
          <p className="text-gray-600 text-lg">
            Thank you for completing your interview for{' '}
            <span className="font-semibold">
              {interviewInfo?.interviewData?.jobPosition || 'the position'}
            </span>
          </p>
        </div>

        {loading ? (
          <div className="text-center p-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading your feedback...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 border-b pb-4">Your Interview Feedback</h2>
            
            {feedbackData ? (
              <div className="space-y-6">
                {/* Display feedback here based on your feedback structure */}
                {/* This is a placeholder - adjust according to your actual data structure */}
                {feedbackData.summary && (
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Summary</h3>
                    <p className="text-gray-700">{feedbackData.summary}</p>
                  </div>
                )}
                
                {feedbackData.strengths && (
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Strengths</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {feedbackData.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {feedbackData.improvements && (
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Areas for Improvement</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {feedbackData.improvements.map((improvement, index) => (
                        <li key={index}>{improvement}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Add more sections as needed based on your feedback structure */}
              </div>
            ) : (
              <p className="text-center text-gray-600 py-8">
                No feedback data available. There might have been an issue processing your interview.
              </p>
            )}
          </div>
        )}

        <div className="flex justify-center">
          <Link href="/">
            <div className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
              Return to Home
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CompletedPage