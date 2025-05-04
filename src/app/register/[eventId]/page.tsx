'use client'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import toast from 'react-hot-toast'
import Link from 'next/link'

type RegistrationFormData = {
  fullName: string
  email: string
  phoneNumber: string
  nationalId?: string
  passport?: string
  organization: string
  role: 'investor' | 'journalist' | 'other'
  otherRole?: string
}

interface PageProps {
  params: {
    eventId: string
  }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function EventRegistration({ params }: PageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegistrationFormData>()
  
  const nationalId = watch('nationalId')
  const passport = watch('passport')

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/events/${params.eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed')
      }

      toast.success(result.message || 'Registration submitted successfully!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit registration')
      console.error('Registration error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
      <div className="absolute top-0 left-0 p-6">
        <Link 
          href="/" 
          className="text-3xl font-bold text-gray-900 hover:text-gray-700 transition-colors flex items-center gap-2"
        >
          <span className="text-white px-3 py-1">RNIT <span>Events</span></span>
          
        </Link>
      </div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Event Registration</h2>
          <p className="mt-2 text-gray-600">Please fill out the form below to register for the event</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full Name (required)
            </label>
            <input
              type="text"
              id="fullName"
              {...register('fullName', { required: 'Full name is required' })}
              placeholder="Enter your full name"
              className="mt-1 block w-full rounded-md border-gray-800 shadow-sm outline-none focus:border-blue-500 focus:ring-blue-500 pr-10 text-gray-900 p-2"
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address (optional)
            </label>
            <input
              type="email"
              id="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              placeholder="Enter your email address"
              className="mt-1 block w-full rounded-md border-gray-800 shadow-sm outline-none focus:border-blue-500 focus:ring-blue-500 pr-10 text-gray-900 p-2"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
              Phone Number (required)
            </label>
            <input
              type="tel"
              id="phoneNumber"
              {...register('phoneNumber', { required: 'Phone number is required' })}
              placeholder="Enter your phone number"
              className="mt-1 block w-full rounded-md border-gray-800 shadow-sm outline-none focus:border-blue-500 focus:ring-blue-500 pr-10 text-gray-900 p-2"
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="nationalId" className="block text-sm font-medium text-gray-700">
              National ID (optional)
            </label>
            <input
              type="text"
              id="nationalId"
              {...register('nationalId', {
                validate: (value) => {
                  if (!value && !passport) {
                    return 'Either National ID or Passport is required'
                  }
                  return true
                }
              })}
              placeholder="Enter your national ID"
              className="mt-1 block w-full rounded-md border-gray-800 shadow-sm outline-none focus:border-blue-500 focus:ring-blue-500 pr-10 text-gray-900 p-2"
            />
            {errors.nationalId && (
              <p className="mt-1 text-sm text-red-600">{errors.nationalId.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="passport" className="block text-sm font-medium text-gray-700">
              Passport (optional)
            </label>
            <input
              type="text"
              id="passport"
              {...register('passport', {
                validate: (value) => {
                  if (!value && !nationalId) {
                    return 'Either National ID or Passport is required'
                  }
                  return true
                }
              })}
              placeholder="Enter your passport number"
              className="mt-1 block w-full rounded-md border-gray-800 shadow-sm outline-none focus:border-blue-500 focus:ring-blue-500 pr-10 text-gray-900 p-2"
            />
            {errors.passport && (
              <p className="mt-1 text-sm text-red-600">{errors.passport.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
              Organization (optional)
            </label>
            <input
              type="text"
              id="organization"
              {...register('organization', { required: 'Organization is required' })}
              placeholder="Enter your organization"
              className="mt-1 block w-full rounded-md border-gray-800 shadow-sm outline-none focus:border-blue-500 focus:ring-blue-500 pr-10 text-gray-900 p-2"
            />
            {errors.organization && (
              <p className="mt-1 text-sm text-red-600">{errors.organization.message}</p>
            )}
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-blue-600 cursor-pointer
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 