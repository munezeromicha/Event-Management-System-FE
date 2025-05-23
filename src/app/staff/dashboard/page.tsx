"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  QrCodeIcon,
  UsersIcon,
  ClockIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import axios from "axios";

interface StaffInfo {
  id: string;
  name: string;
  role: string;
}

interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  scannedCount: number;
  totalAttendees: number;
}

interface ApiEvent {
  id?: string;
  _id?: string;
  name?: string;
  title?: string;
  date?: string;
  eventDate?: string;
  location?: string;
  venue?: string;
  scannedCount?: number;
  attendanceCount?: number;
  totalAttendees?: number;
  registeredCount?: number;
}

const API_URL = 'http://localhost:3000';

export default function StaffDashboard() {
  const [staffInfo, setStaffInfo] = useState<StaffInfo | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);

  useEffect(() => {
    // Get staff info from cookies
    const staffInfoCookie = Cookies.get("staffInfo");
    if (staffInfoCookie) {
      try {
        setStaffInfo(JSON.parse(staffInfoCookie));
      } catch (error) {
        console.error("Error parsing staff info", error);
      }
    }

    // Fetch events from the API
    fetchEvents();
  }, []);
  
  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get("staffAuthToken");
      
      if (!token) {
        toast.error("Authentication token not found");
        return;
      }

      const response = await axios.get(`${API_URL}/api/events`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status !== 200) {
        throw new Error("Failed to fetch events");
      }

      const data = response.data;
      
      // Transform API data to match our Event interface
      const transformedEvents: Event[] = data.map((event: ApiEvent, index: number) => ({
        id: event.id || event._id || `generated-event-${index}-${Date.now()}`, // Ensure ID is never empty
        name: event.name || event.title || "Unknown Event",
        date: event.date || event.eventDate || new Date().toISOString(),
        location: event.location || event.venue || "Unknown",
        scannedCount: event.scannedCount || event.attendanceCount || 0,
        totalAttendees: event.totalAttendees || event.registeredCount || 100,
      }));

      if (transformedEvents.length === 0) {

      } else {
        setEvents(transformedEvents);
        setActiveEvent(transformedEvents[0]); 
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#000060]"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Welcome header with logout button */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome{staffInfo?.name ? `, ${staffInfo.name}` : ""}
          </h1>
          <p className="mt-1 text-gray-500">
            Manage event attendees and badge scanning from your staff dashboard
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
      >
        <motion.div variants={itemVariants}>
          <Link
            href="/staff/scan"
            className="block h-full bg-white shadow rounded-xl p-6 border-l-4 border-[#000060] hover:shadow-md transition-shadow"
          >
            <div className="flex items-start">
              <div className="bg-[#E1FAFA] rounded-lg p-3">
                <QrCodeIcon className="h-8 w-8 text-[#000060]" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Scan Badges
                </h3>
                <p className="mt-1 text-gray-500">
                  Scan attendee badges to record event participation
                </p>
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Link
            href="/staff/attendees"
            className="block h-full bg-white shadow rounded-xl p-6 border-l-4 border-[#000060] hover:shadow-md transition-shadow"
          >
            <div className="flex items-start">
              <div className="bg-[#E1FAFA] rounded-lg p-3">
                <UsersIcon className="h-8 w-8 text-[#000060]" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  View Attendees
                </h3>
                <p className="mt-1 text-gray-500">
                  See a list of all scanned attendees at your events
                </p>
              </div>
            </div>
          </Link>
        </motion.div>
      </motion.div>

      {/* Active event */}
      {activeEvent && (
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <div className="bg-white shadow rounded-xl overflow-hidden">
            <div className="bg-[#000060] text-white px-6 py-4">
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                <h2 className="text-lg font-semibold">Current Active Event</h2>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900">
                {activeEvent.name}
              </h3>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">
                    {formatDate(activeEvent.date)}
                  </span>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">In Progress</span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/staff/scan?eventId=${activeEvent.id}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#000060] hover:bg-[#00004c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#000060]"
                >
                  <QrCodeIcon className="h-5 w-5 mr-2" />
                  Scan Badges
                </Link>
                <Link
                  href={`/staff/attendees?eventId=${activeEvent.id}`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#000060]"
                >
                  <UsersIcon className="h-5 w-5 mr-2" />
                  View Attendees
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Events list */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white shadow rounded-xl overflow-hidden"
      >
        <div className="bg-[#000060] text-white px-6 py-4">
          <h2 className="text-lg font-semibold">Recent Events</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Event Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Location
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map((event, index) => {
                // Create a guaranteed unique key for each row
                const rowKey = event.id ? 
                  `event-${event.id}-${index}` : 
                  `event-no-id-${index}-${Math.random().toString(36).substring(2, 9)}`;
                
                return (
                  <motion.tr key={rowKey} variants={itemVariants}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {event.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(event.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.location}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
} 