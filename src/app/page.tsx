'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Input } from '@/components/ui/Input'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Users, Info, DollarSign, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import logo from '../../public/images/RNIT_Logo.png'

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
  const [idType, setIdType] = useState<'nationalId' | 'passport'>('nationalId')
  const [hoverCard, setHoverCard] = useState<string | null>(null)

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

    // Validate that one form of ID is entered
    if (idType === 'nationalId' && !registrationData.nationalId) {
      toast.error('Please enter your National ID');
      return;
    }
    
    if (idType === 'passport' && !registrationData.passport) {
      toast.error('Please enter your Passport number');
      return;
    }

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
      setIdType('nationalId')
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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    }),
    hover: {
      y: -10,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        duration: 0.3
      }
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.2
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
          <p className="text-white mt-4 text-lg">Loading events...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Header with Logo */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <Link 
          href="/" 
          className="flex items-center space-x-3"
        >
          <motion.div
            initial={{ opacity: 0, rotate: -10 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 0.5 }}
          >
          <div className="bg-white bg-opacity-20 p-2 rounded-lg group-hover:bg-opacity-30 transition-all duration-300">
            <Image src={logo} alt="RNIT Logo" className="w-16 h-16" />
          </div>
          </motion.div>
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl font-bold text-white"
          >
            RNIT <span className="text-blue-400">Events</span>
          </motion.span>
        </Link>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center space-x-4"
        >
          <Link 
            href="/login" 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center"
          >
            Login
          </Link>
        </motion.div>
      </header>

      {/* Introduction Section */}
      <section className="container mx-auto px-4 py-12 border-b border-gray-700">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:w-1/2"
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Welcome to <span className="text-blue-400">RNIT</span> Events</h1>
            <p className="text-gray-300 text-lg mb-6">
              Rwanda National Investment Trust Ltd (RNIT) is the first collective investment scheme manager in Rwanda, 
              providing investment opportunities and financial literacy through high-quality events and workshops.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/about" 
                className="bg-transparent border-2 border-blue-500 text-blue-400 px-8 py-3 rounded-lg hover:bg-blue-500 hover:text-white transition-colors duration-300 inline-flex items-center"
              >
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </motion.div>
          
          {/* <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:w-1/2 flex justify-center"
          >
            <Image 
              src={logo} 
              alt="RNIT Logo" 
              className="max-h-64 w-64"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='180' viewBox='0 0 240 180'%3E%3Cellipse cx='120' cy='90' rx='110' ry='80' fill='%23252e6c' stroke='%234299e1' stroke-width='6'/%3E%3Ctext x='120' y='90' font-family='Arial' font-size='42' fill='white' text-anchor='middle' alignment-baseline='middle'%3ERNIT Ltd%3C/text%3E%3Ctext x='120' y='120' font-family='Arial' font-size='16' fill='%2399c7ff' text-anchor='middle' alignment-baseline='middle'%3ERwanda National Investment Trust%3C/text%3E%3C/svg%3E";
              }}
            />
          </motion.div> */}
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-white mb-2"
        >
          Upcoming Events
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-300 mb-8"
        >
          Discover and register for our exclusive events
        </motion.p>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {events.map((event, index) => (
            <motion.div
              key={event.eventId}
              custom={index}
              variants={cardVariants}
              whileHover="hover"
              onMouseEnter={() => setHoverCard(event.eventId)}
              onMouseLeave={() => setHoverCard(null)}
              className={`bg-gray-800/70 backdrop-blur-md rounded-xl overflow-hidden border ${hoverCard === event.eventId ? 'border-blue-500' : 'border-gray-700'} shadow-lg transition-all duration-300`}
            >
              <div className="p-6">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-white mb-2">{event.name}</h2>
                  <span className="inline-block bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                    {event.eventType}
                  </span>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center text-gray-300">
                    <Calendar className="h-5 w-5 mr-3 text-blue-400 flex-shrink-0" />
                    <span>{formatDate(event.dateTime)}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-300">
                    <MapPin className="h-5 w-5 mr-3 text-blue-400 flex-shrink-0" />
                    <span>{event.location}</span>
                  </div>
                  
                  <div className="flex items-start text-gray-300">
                    <Info className="h-5 w-5 mr-3 text-blue-400 flex-shrink-0 mt-1" />
                    <p className="line-clamp-3">{event.description}</p>
                  </div>
                  
                  <div className="flex items-center text-gray-300">
                    <Users className="h-5 w-5 mr-3 text-blue-400 flex-shrink-0" />
                    <span>Capacity: {event.maxCapacity}</span>
                  </div>
                  
                  {event.financialSupportOption && (
                    <div className="flex items-center text-green-400">
                      <DollarSign className="h-5 w-5 mr-3 flex-shrink-0" />
                      <span>Financial Support Available</span>
                    </div>
                  )}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedEvent(event)
                    setShowModal(true)
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors duration-300 font-medium flex items-center justify-center"
                >
                  <span>Register Now</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Registration Modal */}
      <AnimatePresence>
        {showModal && selectedEvent && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-gray-800/90 backdrop-blur-md p-8 rounded-xl shadow-2xl max-w-md w-full relative border border-gray-700"
            >
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
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="useNationalId"
                          name="idType"
                          className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 focus:ring-blue-500"
                          checked={idType === 'nationalId'}
                          onChange={() => {
                            setIdType('nationalId');
                            setRegistrationData({
                              ...registrationData,
                              passport: ''
                            });
                          }}
                        />
                        <label htmlFor="useNationalId" className="ml-2 text-sm font-medium text-gray-300">
                          National ID
                        </label>
                      </div>
                      
                      {idType === 'nationalId' && (
                        <Input
                          value={registrationData.nationalId}
                          onChange={(e) => setRegistrationData({ 
                            ...registrationData, 
                            nationalId: e.target.value
                          })}
                          placeholder="Enter your national ID"
                          className="bg-gray-800/50 text-white placeholder-gray-400 border-gray-700 focus:border-blue-500"
                        />
                      )}
                      
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="usePassport"
                          name="idType"
                          className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 focus:ring-blue-500"
                          checked={idType === 'passport'}
                          onChange={() => {
                            setIdType('passport');
                            setRegistrationData({
                              ...registrationData,
                              nationalId: ''
                            });
                          }}
                        />
                        <label htmlFor="usePassport" className="ml-2 text-sm font-medium text-gray-300">
                          Passport
                        </label>
                      </div>
                      
                      {idType === 'passport' && (
                        <Input
                          value={registrationData.passport}
                          onChange={(e) => setRegistrationData({ 
                            ...registrationData, 
                            passport: e.target.value
                          })}
                          placeholder="Enter your passport number"
                          className="bg-gray-800/50 text-white placeholder-gray-400 border-gray-700 focus:border-blue-500"
                        />
                      )}
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
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Register
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowModal(false)}
                      className="flex-1 bg-gray-700 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}