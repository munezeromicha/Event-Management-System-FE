"use client"
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Profile from '../../../public/images/Profile_avatar.png';
import {
  CalendarIcon,
  QrCodeIcon,
  ChartBarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Easy Event Registration',
    description: 'Streamlined registration process with customizable forms and instant confirmation.',
    icon: CalendarIcon,
  },
  {
    name: 'QR Code Check-in',
    description: 'Efficient attendance tracking using QR codes for seamless event check-in.',
    icon: QrCodeIcon,
  },
  {
    name: 'Real-time Analytics',
    description: 'Comprehensive analytics and reporting for better event management.',
    icon: ChartBarIcon,
  },
  {
    name: 'Attendee Management',
    description: 'Organize and manage attendee information with ease.',
    icon: UserGroupIcon,
  },
  {
    name: 'Secure Platform',
    description: 'Advanced security measures to protect sensitive information.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Real-time Updates',
    description: 'Instant notifications and updates for both organizers and attendees.',
    icon: ClockIcon,
  },
];

const team = [
  {
    name: 'MUNEZERO NTAGANIRA Michel',
    role: 'Full Stack Developer',
    image: Profile, 
    email: 'munezerontaganiramichel@gmail.com',
    linkedin: 'https://www.linkedin.com/in/munezero-ntaganira-michel-062187265/',
    github: 'https://github.com/munezeromicha',
  },
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}

      <div className="absolute top-0 left-0 p-6">
        <Link 
          href="/" 
          className="text-3xl font-bold text-gray-900 hover:text-gray-700 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <span className="px-3 py-1">RNIT Events</span>
          
        </Link>
      </div>

      <div className="relative isolate overflow-hidden bg-gradient-to-b from-blue-100/20">
        <div className="mx-auto max-w-7xl px-6 pt-10 pb-24 sm:pb-32 lg:flex lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
            <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Transforming Event Management
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Our event management system revolutionizes how organizations plan, manage, and execute events. 
              From seamless registration to real-time analytics, we provide all the tools you need for 
              successful event management.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Link
                href="/"
                className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Get started
              </Link>
              {/* <Link
                href="/contact"
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                Contact us <span aria-hidden="true">→</span>
              </Link> */}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Everything you need</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Comprehensive Event Management
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Our platform provides all the essential tools and features needed to create, manage, and 
            analyze successful events of any scale.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <feature.icon className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Meet Our Team
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Our dedicated team of professionals works tirelessly to provide you with the best event 
              management experience.
            </p>
          </div>
          <ul
            role="list"
            className="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3"
          >
            {team.map((person) => (
              <li key={person.name}>
                <div className="flex flex-col gap-y-4 items-center">
                  <Image
                    className="rounded-full object-cover"
                    src={person.image}
                    alt={person.name}
                    width={96}
                    height={96}
                  />
                  <div className="text-center">
                    <h3 className="text-lg font-semibold leading-7 tracking-tight text-gray-900">
                      {person.name}
                    </h3>
                    <p className="text-sm leading-6 text-blue-600 cursor-pointer">{person.role}</p>
                    <p className="text-sm leading-6 text-blue-600 cursor-pointer">{person.github}</p>
                    <p className="text-sm leading-6 text-blue-600 cursor-pointer">{person.email}</p>
                    <p className="text-sm leading-6 text-blue-600 cursor-pointer">{person.linkedin}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Mission Section */}
      <div className="relative isolate overflow-hidden bg-white px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-4xl">
          <figure className="mt-10">
            <blockquote className="text-center text-xl font-semibold leading-8 text-gray-900 sm:text-2xl sm:leading-9">
              <p>
              &quot;Our mission is to simplify event management and create memorable experiences. We believe 
                in the power of technology to bring people together and make events more accessible, 
                efficient, and enjoyable for everyone involved.&quot;
              </p>
            </blockquote>
            <figcaption className="mt-10">
              <div className="mt-4 flex items-center justify-center space-x-3 text-base">
                <div className="font-semibold text-gray-900">Rwanda National Institute of Technology</div>
                <svg viewBox="0 0 2 2" width={3} height={3} aria-hidden="true" className="fill-gray-900">
                  <circle cx={1} cy={1} r={1} />
                </svg>
                <div className="text-gray-600">Event Management System</div>
              </div>
            </figcaption>
          </figure>
        </div>
      </div>
    </div>
  );
} 