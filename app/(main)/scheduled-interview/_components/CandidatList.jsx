"use client"
import moment from 'moment'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'

function CandidatList({candidateList}) {
  // State for managing report dialog
  const [showReport, setShowReport] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [importMode, setImportMode] = useState(false)
  const [importData, setImportData] = useState('')

  // Handle view report click
  const handleViewReport = (candidate) => {
    setSelectedCandidate(candidate)
    setShowReport(true)
  }

  // Handle close report modal
  const handleCloseReport = () => {
    setShowReport(false)
  }

  // Toggle import mode
  const toggleImportMode = () => {
    setImportMode(!importMode)
  }

  // Handle import data change
  const handleImportDataChange = (e) => {
    setImportData(e.target.value)
  }

  // Handle import submit
  const handleImportSubmit = () => {
    // In a real implementation, this would save to your database
    // For now, just close the import dialog
    setImportMode(false)
    setImportData('')
    alert('Report imported successfully! (This is a demo alert - in production, this would add to your database)')
  }

  // Parse feedback data
  const getFeedbackData = (candidate) => {
    if (!candidate || !candidate.feedback) return null
    
    try {
      return typeof candidate.feedback === 'string' 
        ? JSON.parse(candidate.feedback) 
        : candidate.feedback
    } catch (error) {
      console.error('Error parsing feedback:', error)
      return null
    }
  }

  // Get normalized recommendation from feedback
  const getRecommendation = (feedback) => {
    if (!feedback) return null
    // Check for both uppercase and lowercase versions
    return feedback?.feedback?.recommendation || 
           feedback?.feedback?.Recommendation || null
  }

  // Handle sending email
  const handleSendEmail = (candidate) => {
    if (!candidate || !candidate.userEmail) {
      alert('No email address available for this candidate')
      return
    }
    
    // Create email with subject and body
    const subject = 'Next Interview Round Selection'
    const body = `Dear ${candidate.userName},\n\nCongratulations! You have been selected for the next round of interviews.\n\nPlease let us know your availability for the upcoming week.\n\nBest regards,\nRecruitment Team`
    
    // Create mailto link
    window.location.href = `mailto:${candidate.userEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  // Get feedback data for selected candidate
  const selectedFeedback = getFeedbackData(selectedCandidate)

  return (
    <div className=''>
      <div className='flex justify-between items-center my-5'>
        <h2 className='font-bold'>
          Candidates ({candidateList?.length || 0})
        </h2>
        <Button variant="outline" className="text-primary" onClick={toggleImportMode}>
          Import Report
        </Button>
      </div>

      {/* Import Report Modal */}
      {importMode && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg w-full max-w-md'>
            <h3 className='text-lg font-bold mb-4'>Import Candidate Report</h3>
            <p className='mb-4 text-sm text-gray-600'>
              Paste JSON data with candidate feedback.
            </p>
            <textarea 
              className='w-full h-40 p-2 border border-gray-300 rounded mb-4'
              placeholder='{"feedback":{"rating":{...}}}'
              value={importData}
              onChange={handleImportDataChange}
            />
            <div className='flex justify-end gap-2'>
              <Button variant="outline" onClick={toggleImportMode}>
                Cancel
              </Button>
              <Button 
                onClick={handleImportSubmit}
                disabled={!importData}
              >
                Import
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate List */}
      {candidateList && candidateList.map((candidate,index)=>{
        // Parse feedback to get recommendation
        const feedback = getFeedbackData(candidate);
        const recommendation = getRecommendation(feedback);
        
        return (
          <div key={index} className='p-5 flex gap-3 items-center justify-between bg-white rounded-lg mb-3'>
            <div className='flex items-center gap-5'>
              <h2 className='bg-primary p-3 px-4.5 font-bold text-white rounded-full'>
                {candidate?.userName?.[0] || '?'}
              </h2>
              <div>
                <h2>
                  {candidate?.userName || 'Unknown Candidate'}
                </h2>
                <div className='flex items-center gap-2'>
                  <h2 className='text-sm text-gray-500'>
                    Completed On: {moment(candidate?.created_at).format('MMM DD, YYYY')}
                  </h2>
                  {recommendation !== null && (
                    <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                      recommendation === 'Yes' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {recommendation === 'Yes' ? 'Recommended' : 'Not Recommended'}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="text-primary" 
              onClick={() => handleViewReport(candidate)}
            >
              View Report
            </Button>
          </div>
        );
      })}

      {/* Report Modal */}
      {showReport && selectedCandidate && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className='text-xl font-bold'>
                  Candidate Report: {selectedCandidate?.userName}
                </h3>
                <p className='text-sm text-gray-500'>
                  Completed On: {moment(selectedCandidate?.created_at).format('MMM DD, YYYY')}
                </p>
              </div>
              
              {selectedFeedback && getRecommendation(selectedFeedback) === 'Yes' && (
                <Button 
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-2" 
                  onClick={() => handleSendEmail(selectedCandidate)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Interview Email
                </Button>
              )}
            </div>
            
            {selectedFeedback ? (
              <div className='space-y-6'>
                {/* Skills Ratings */}
                <div className='space-y-4 bg-gray-50 p-4 rounded-lg'>
                  <h4 className='font-semibold text-lg'>Skills Assessment</h4>
                  
                  {/* Technical Skills */}
                  <div className='space-y-1'>
                    <div className='flex justify-between items-center'>
                      <span>Technical Skills</span>
                      <span className='font-medium'>
                        {selectedFeedback?.feedback?.rating?.technicalSkills || 
                         selectedFeedback?.feedback?.rating?.techicalSkills || 0}/10
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2.5'>
                      <div 
                        className='bg-blue-600 h-2.5 rounded-full' 
                        style={{width: `${(selectedFeedback?.feedback?.rating?.technicalSkills || 
                                       selectedFeedback?.feedback?.rating?.techicalSkills || 0) * 10}%`}}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Communication */}
                  <div className='space-y-1'>
                    <div className='flex justify-between items-center'>
                      <span>Communication</span>
                      <span className='font-medium'>
                        {selectedFeedback?.feedback?.rating?.communication || 0}/10
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2.5'>
                      <div 
                        className='bg-blue-600 h-2.5 rounded-full' 
                        style={{width: `${(selectedFeedback?.feedback?.rating?.communication || 0) * 10}%`}}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Problem Solving */}
                  <div className='space-y-1'>
                    <div className='flex justify-between items-center'>
                      <span>Problem Solving</span>
                      <span className='font-medium'>
                        {selectedFeedback?.feedback?.rating?.problemSolving || 0}/10
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2.5'>
                      <div 
                        className='bg-blue-600 h-2.5 rounded-full' 
                        style={{width: `${(selectedFeedback?.feedback?.rating?.problemSolving || 0) * 10}%`}}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Experience */}
                  <div className='space-y-1'>
                    <div className='flex justify-between items-center'>
                      <span>Experience</span>
                      <span className='font-medium'>
                        {selectedFeedback?.feedback?.rating?.experience || 
                         selectedFeedback?.feedback?.rating?.experince || 0}/10
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2.5'>
                      <div 
                        className='bg-blue-600 h-2.5 rounded-full' 
                        style={{width: `${(selectedFeedback?.feedback?.rating?.experience || 
                                         selectedFeedback?.feedback?.rating?.experince || 0) * 10}%`}}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Total Score (if present) */}
                  {(selectedFeedback?.feedback?.rating?.total !== undefined) && (
                    <div className='space-y-1 mt-4 pt-4 border-t border-gray-200'>
                      <div className='flex justify-between items-center'>
                        <span className='font-semibold'>Total Score</span>
                        <span className='font-medium text-lg'>
                          {selectedFeedback?.feedback?.rating?.total || 0}/10
                        </span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-3'>
                        <div 
                          className='bg-purple-600 h-3 rounded-full' 
                          style={{width: `${(selectedFeedback?.feedback?.rating?.total || 0) * 10}%`}}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Summary */}
                <div className='border border-gray-200 rounded-lg p-4'>
                  <h4 className='font-semibold mb-2'>Summary</h4>
                  <p className="whitespace-pre-line">
                    {selectedFeedback?.feedback?.summary || 
                     selectedFeedback?.feedback?.summery || 
                     'No summary provided'}
                  </p>
                </div>
                
                {/* Recommendation */}
                <div className={`border rounded-lg p-4 ${
                  getRecommendation(selectedFeedback) === 'Yes' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-red-500 bg-red-50'
                }`}>
                  <h4 className='font-semibold mb-2'>Recommendation</h4>
                  <div className='flex items-center gap-2 mb-2'>
                    <span 
                      className={`font-bold ${
                        getRecommendation(selectedFeedback) === 'Yes' 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}
                    >
                      {getRecommendation(selectedFeedback) || 'No recommendation'}
                    </span>
                  </div>
                  <p>
                    {selectedFeedback?.feedback?.recommendationMsg || 
                     selectedFeedback?.feedback?.RecommendationMsg || ''}
                  </p>
                </div>
              </div>
            ) : (
              <div className='py-6 text-center'>
                <p>No feedback data available for this candidate.</p>
              </div>
            )}
            
            <div className='flex justify-end mt-6'>
              <Button onClick={handleCloseReport}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CandidatList