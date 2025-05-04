'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Input } from '@/components/ui/Input'
import Link from 'next/link'

interface Event {
  eventId: string
  name: string
  eventType: string
  dateTime: string
  location: string
  description: string
  maxCapacity: number
  financialSupportOption: boolean
}

interface RegistrationData {
  fullName: string
  phoneNumber: string
  nationalId?: string
  passport?: string
  email: string
  organization: string
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    fullName: '',
    phoneNumber: '',
    nationalId: '',
    passport: '',
    email: '',
    organization: ''
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/events')
      if (!response.ok) {
        toast.error('Failed to fetch events. Please try again later.')
        return
      }
      
      const data = await response.json()
      setEvents(data)
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEvent) return

    const loadingToast = toast.loading('Processing your registration...')

    try {
      const response = await fetch(
        `http://localhost:3000/api/registrations/${selectedEvent.eventId}/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registrationData)
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed')
      }
      
      toast.success(result.message || 'Successfully registered for the event!', {
        id: loadingToast
      })
      
      setShowModal(false)
      setSelectedEvent(null)
      setRegistrationData({
        fullName: '',
        phoneNumber: '',
        nationalId: '',
        passport: '',
        email: '',
        organization: ''
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to register. Please try again.', {
        id: loadingToast
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white">Loading events...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
      <div className="absolute top-0 left-21 pb-12 mt-8">
        <Link 
          href="/" 
          className="text-3xl font-bold text-gray-900 hover:text-gray-700 transition-colors flex items-center gap-2"
        >
          <span className="text-white px-3 py-1">RNIT <span>Events</span></span>
          
        </Link>
      </div>
        <h1 className="text-3xl font-bold text-white mb-8 mt-12">Upcoming Events</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.eventId}
              className="bg-card p-6 rounded-lg shadow-lg"
            >
              <h2 className="text-xl font-bold text-white mb-2">{event.name}</h2>
              <p className="text-gray-400 mb-2">{event.eventType}</p>
              <p className="text-gray-300 mb-4">{formatDate(event.dateTime)}</p>
              <p className="text-gray-300 mb-4">{event.location}</p>
              <p className="text-gray-400 mb-4">{event.description}</p>
              <p className="text-gray-300 mb-4">Capacity: {event.maxCapacity}</p>
              {event.financialSupportOption && (
                <p className="text-green-400 mb-4">Financial Support Available</p>
              )}
              <button
                onClick={() => {
                  setSelectedEvent(event)
                  setShowModal(true)
                }}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Register
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Registration Modal */}
      {showModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card/95 backdrop-blur-md p-8 rounded-xl shadow-2xl max-w-md w-full relative border border-gray-700">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white">
                  Register for {selectedEvent.name}
                </h2>
                <p className="text-gray-400 mt-2">{selectedEvent.eventType}</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <Input
                  label="Full Name"
                  value={registrationData.fullName}
                  onChange={(e) => setRegistrationData({ ...registrationData, fullName: e.target.value })}
                  required
                  placeholder="Enter your full name"
                  className="bg-gray-800/50 text-white placeholder-gray-400 border-gray-700 focus:border-blue-500"
                />
                <Input
                  label="Phone Number"
                  value={registrationData.phoneNumber}
                  onChange={(e) => setRegistrationData({ ...registrationData, phoneNumber: e.target.value })}
                  required
                  placeholder="Enter your phone number"
                  className="bg-gray-800/50 text-white placeholder-gray-400 border-gray-700 focus:border-blue-500"
                />
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Identification (required)</label>
                  <div className="flex gap-4">
                    <Input
                      label="National ID"
                      value={registrationData.nationalId}
                      onChange={(e) => setRegistrationData({ 
                        ...registrationData, 
                        nationalId: e.target.value,
                        passport: '' // Clear passport when national ID is entered
                      })}
                      placeholder="Enter your national ID"
                      className="bg-gray-800/50 text-white placeholder-gray-400 border-gray-700 focus:border-blue-500"
                    />
                    <div className="flex items-center text-gray-400">OR</div>
                    <Input
                      label="Passport"
                      value={registrationData.passport}
                      onChange={(e) => setRegistrationData({ 
                        ...registrationData, 
                        passport: e.target.value,
                        nationalId: '' // Clear national ID when passport is entered
                      })}
                      placeholder="Enter your passport number"
                      className="bg-gray-800/50 text-white placeholder-gray-400 border-gray-700 focus:border-blue-500"
                    />
                  </div>
                </div>
                <Input
                  label="Email"
                  type="email"
                  value={registrationData.email}
                  onChange={(e) => setRegistrationData({ ...registrationData, email: e.target.value })}
                  required
                  placeholder="Enter your email"
                  className="bg-gray-800/50 text-white placeholder-gray-400 border-gray-700 focus:border-blue-500"
                />
                <Input
                  label="Organization"
                  value={registrationData.organization}
                  onChange={(e) => setRegistrationData({ ...registrationData, organization: e.target.value })}
                  required
                  placeholder="Enter your organization"
                  className="bg-gray-800/50 text-white placeholder-gray-400 border-gray-700 focus:border-blue-500"
                />
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Register
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 