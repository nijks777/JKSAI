"use client"
import { useState } from 'react'

function AlertConfirmation({ children, stopInterview }) {
  const [showModal, setShowModal] = useState(false)

  const handleConfirm = () => {
    stopInterview()
    setShowModal(false)
  }

  return (
    <>
      {/* Trigger for the modal */}
      <div onClick={() => setShowModal(true)}>
        {children}
      </div>

      {/* Modal overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-bold mb-4">End Interview?</h2>
            
            <p className="mb-6">
              Are you sure you want to end this interview? This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              
              <button 
                onClick={handleConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                End Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AlertConfirmation