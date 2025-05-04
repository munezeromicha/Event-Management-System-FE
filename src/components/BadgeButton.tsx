'use client'

import { useState } from 'react'
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

interface BadgeButtonProps {
  registrationId: string
  status: string
}

export default function BadgeButton({ registrationId, status }: BadgeButtonProps) {
  const [loading, setLoading] = useState(false)

  // Button should be disabled or not shown if status is not approved
  if (status.toLowerCase() !== 'approved') {
    return null
  }

  const generateAndDownloadBadge = async () => {
    try {
      setLoading(true)
      
      // Get auth token
      const authToken = Cookies.get('authToken')
      
      if (!authToken) {
        toast.error('Authentication token not found')
        return
      }
      
      // First generate the badge with a fetch request that includes auth headers
      const generateResponse = await fetch(`http://localhost:3000/api/badges/registrations/${registrationId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      if (!generateResponse.ok) {
        const errorData = await generateResponse.json()
        toast.error(errorData.message || 'Failed to generate badge')
        return
      }
      
      // After successful generation, download the badge using fetch with proper file handling
      const downloadResponse = await fetch(`http://localhost:3000/api/badges/registrations/${registrationId}?download=true`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      if (!downloadResponse.ok) {
        toast.error('Failed to download badge')
        return
      }
      
      // Get filename from Content-Disposition header if available
      const contentDisposition = downloadResponse.headers.get('Content-Disposition')
      let filename = 'badge.pdf'
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '')
        }
      }
      
      // Get the blob from the response
      const blob = await downloadResponse.blob()
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob)
      
      // Create a temporary link element to trigger the download
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      
      // Append to the document, click and remove
      document.body.appendChild(link)
      link.click()
      
      // Clean up resources
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
      
      toast.success('Badge downloaded successfully')
    } catch (error) {
      console.error('Badge download error:', error)
      toast.error('Failed to download badge')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={generateAndDownloadBadge}
      disabled={loading}
      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </>
      ) : (
        <>
          <DocumentArrowDownIcon className="h-4 w-4 mr-1.5" />
          Download Badge
        </>
      )}
    </button>
  )
}