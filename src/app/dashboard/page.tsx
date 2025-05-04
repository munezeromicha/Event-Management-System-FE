'use client'

import {
  UsersIcon,
  CalendarIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

interface Event {
  eventId: string
  name: string
  dateTime: string
  registrations: number
  location: string
}

interface Registration {
  registrationId: string
  fullName: string
  eventName: string
  status: 'approved' | 'pending' | 'rejected'
  eventId: string
  registrationDate?: string
  attendeeId?: string | null
}

interface RawRegistration {
  registrationId?: string;
  registrationid?: string;
  fullName?: string;
  fullname?: string;
  eventName?: string;
  status?: string;
  eventId?: string;
  eventid?: string;
  registrationDate?: string;
  registrationdate?: string;
}

export default function Dashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    totalAttendees: 0
  })
  const [recentEvents, setRecentEvents] = useState<Event[]>([])
  const [recentRegistrations, setRecentRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const authToken = Cookies.get('authToken')
    if (!authToken) {
      router.push('/login')
      return
    }
    fetchDashboardData(authToken)
  }, [router])

  const fetchDashboardData = async (authToken: string) => {
    try {
      // Fetch events
      const eventsResponse = await fetch('http://localhost:3000/api/events', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      if (!eventsResponse.ok) {
        if (eventsResponse.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch events')
      }
      const events = await eventsResponse.json()

      // Fetch registrations
      const registrationsResponse = await fetch('http://localhost:3000/api/registrations', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      if (!registrationsResponse.ok) {
        if (registrationsResponse.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch registrations')
      }
      const registrations = await registrationsResponse.json()
      
      // Process registrations to ensure proper field mapping
      const processedRegistrations = registrations.map((reg: RawRegistration) => ({
        registrationId: reg.registrationId || reg.registrationid || '',
        fullName: reg.fullName || reg.fullname || '',
        eventName: reg.eventName || '',
        status: reg.status === 'approved' ? 'approved' : reg.status === 'rejected' ? 'rejected' : 'pending',
        eventId: reg.eventId || reg.eventid || '',
        registrationDate: reg.registrationDate || reg.registrationdate || null
      }))

      // Calculate stats
      const totalEvents = events.length
      const totalRegistrations = processedRegistrations.length
      const totalAttendees = processedRegistrations.filter((reg: Registration) => 
        reg.status?.toLowerCase() === 'approved'
      ).length

      // Update stats
      setStats({
        totalEvents,
        totalRegistrations,
        totalAttendees
      })

      // Get recent events (last 3)
      const sortedEvents = [...events]
        .sort((a: Event, b: Event) => {
          try {
            return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
          } catch {
            return 0
          }
        })
        .slice(0, 3)
      setRecentEvents(sortedEvents)

      // Get recent registrations (last 3) - using registrationDate for sorting
      const sortedRegistrations = [...processedRegistrations]
        .sort((a: Registration, b: Registration) => {
          // First try to sort by registrationDate if available
          if (a.registrationDate && b.registrationDate) {
            return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime()
          }
          // Fallback to string comparison of IDs to ensure stable sort
          return String(b.registrationId || '').localeCompare(String(a.registrationId || ''))
        })
        .slice(0, 3)
      setRecentRegistrations(sortedRegistrations)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const displayStats = [
    { id: 'total-events', name: 'Total Events', value: stats.totalEvents.toString(), icon: CalendarIcon },
    { id: 'total-registrations', name: 'Total Registrations', value: stats.totalRegistrations.toString(), icon: ClipboardDocumentCheckIcon },
    { id: 'total-attendees', name: 'Total Attendees', value: stats.totalAttendees.toString(), icon: UsersIcon },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* <div className="flex justify-end p-4">
        <ThemeToggle />
      </div> */}
      <div className="container mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Welcome back! Here&apos;s an overview of your events and registrations.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {displayStats.map((item) => (
            <div
              key={item.id}
              className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6"
            >
              <dt>
                <div className="absolute rounded-md bg-blue-500 p-3">
                  <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
              </dd>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Recent Events */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Events</h3>
              <div className="mt-4">
                <ul role="list" className="divide-y divide-gray-200">
                  {recentEvents.length > 0 ? (
                    recentEvents.map((event) => (
                      <li key={`event-${event.eventId || Math.random().toString(36).substring(7)}`} className="py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{event.name || 'Unnamed Event'}</p>
                            <p className="text-sm text-gray-500">
                              {event.dateTime ? new Date(event.dateTime).toLocaleDateString() : 'Date not specified'}
                            </p>
                          </div>
                          <div className="text-sm text-gray-500">
                            {event.location || 'Location not specified'}
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="py-4 text-center text-gray-500">No recent events found</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Recent Registrations */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Registrations</h3>
              <div className="mt-4">
                <ul role="list" className="divide-y divide-gray-200">
                  {recentRegistrations.length > 0 ? (
                    recentRegistrations.map((registration, index) => (
                      <li 
                        key={`registration-${registration.registrationId || `fallback-${index}`}`}
                        className="py-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{registration.fullName || 'Unknown'}</p>
                            <p className="text-sm text-gray-500">{registration.eventId || 'Unknown Event'}</p>
                          </div>
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              registration.status?.toLowerCase() === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : registration.status?.toLowerCase() === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {registration.status ? registration.status.charAt(0).toUpperCase() + registration.status.slice(1).toLowerCase() : 'Unknown'}
                          </span>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="py-4 text-center text-gray-500">No recent registrations found</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}