"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/Input";
import { Calendar, MapPin, Users, Clock, Info } from "lucide-react";
import NavBar from "../LandingPage/NavBar";
import Footer from "../LandingPage/Footer";

interface Event {
  eventId: string;
  name: string;
  eventType: string;
  dateTime: string;
  location: string;
  description: string;
  maxCapacity: number;
  financialSupportOption: boolean;
}

interface RegistrationData {
  fullName: string;
  phoneNumber: string;
  nationalId?: string;
  passport?: string;
  email: string;
  organization: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    fullName: "",
    phoneNumber: "",
    nationalId: "",
    passport: "",
    email: "",
    organization: "",
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/events");
      if (!response.ok) {
        toast.error("Failed to fetch events. Please try again later.");
        return;
      }

      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    const loadingToast = toast.loading("Processing your registration...");

    try {
      const response = await fetch(
        `http://localhost:3000/api/registrations/${selectedEvent.eventId}/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(registrationData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Registration failed");
      }

      toast.success(
        result.message || "Successfully registered for the event!",
        {
          id: loadingToast,
        }
      );

      setShowModal(false);
      setSelectedEvent(null);
      setRegistrationData({
        fullName: "",
        phoneNumber: "",
        nationalId: "",
        passport: "",
        email: "",
        organization: "",
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to register. Please try again.",
        {
          id: loadingToast,
        }
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg font-semibold text-[#232560] flex items-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#094AB9]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading events...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <NavBar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#232560] to-[#094AB9] text-white py-16">
        <div className="container mx-auto px-4 text-center mt-28">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover Upcoming Events
          </h1>
          <p className="text-lg max-w-2xl mx-auto opacity-90">
            Register for the latest tech conferences, workshops, and networking
            opportunities
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-[#232560] mb-8 inline-block border-b-4 border-[#094AB9] pb-2">
          Upcoming Events
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div
              key={event.eventId}
              className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden transition-transform hover:translate-y-[-4px]"
            >
              <div className="bg-[#232560] h-4"></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-[#232560] line-clamp-2">
                    {event.name}
                  </h3>
                  <span className="bg-[#094AB9] text-white text-xs px-2 py-1 rounded-full">
                    {event.eventType}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-2 text-[#094AB9]" />
                    <span>{formatDate(event.dateTime)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-2 text-[#094AB9]" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="w-5 h-5 mr-2 text-[#094AB9]" />
                    <span>Capacity: {event.maxCapacity}</span>
                  </div>
                </div>

                <p className="text-gray-600 mb-6 line-clamp-3">
                  {event.description}
                </p>

                {event.financialSupportOption && (
                  <div className="mb-6 bg-green-50 p-2 rounded-md border border-green-200 flex items-center text-green-700">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    Financial Support Available
                  </div>
                )}

                <button
                  onClick={() => {
                    setSelectedEvent(event);
                    setShowModal(true);
                  }}
                  className="w-full bg-[#094AB9] text-white py-3 px-4 rounded-md hover:bg-[#0a3a8a] transition-colors shadow-md flex items-center justify-center"
                >
                  <span className="mr-2">Register Now</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Registration Modal */}
      {showModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-0 rounded-xl shadow-2xl max-w-md w-full relative overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#232560] to-[#094AB9] p-6 text-white">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
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

              <h2 className="text-2xl font-bold">Register for Event</h2>
              <p className="mt-1 opacity-90">{selectedEvent.name}</p>
              <div className="flex items-center mt-2">
                <Clock className="w-4 h-4 mr-2" />
                <span className="text-sm opacity-90">
                  {formatDate(selectedEvent.dateTime)}
                </span>
              </div>
            </div>

            {/* Form Section */}
            <div className="p-6">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <Input
                    value={registrationData.fullName}
                    onChange={(e) =>
                      setRegistrationData({
                        ...registrationData,
                        fullName: e.target.value,
                      })
                    }
                    required
                    placeholder="Enter your full name"
                    className="bg-white text-gray-800 border-gray-300 focus:border-[#094AB9] focus:ring-[#094AB9]/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <Input
                    value={registrationData.phoneNumber}
                    onChange={(e) =>
                      setRegistrationData({
                        ...registrationData,
                        phoneNumber: e.target.value,
                      })
                    }
                    required
                    placeholder="Enter your phone number"
                    className="bg-white text-gray-800 border-gray-300 focus:border-[#094AB9] focus:ring-[#094AB9]/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Identification (required)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">National ID</label>
                      <Input
                        value={registrationData.nationalId}
                        onChange={(e) =>
                          setRegistrationData({
                            ...registrationData,
                            nationalId: e.target.value,
                            passport: "", // Clear passport when national ID is entered
                          })
                        }
                        placeholder="National ID"
                        className="bg-white text-gray-800 border-gray-300 focus:border-[#094AB9] focus:ring-[#094AB9]/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Passport</label>
                      <Input
                        value={registrationData.passport}
                        onChange={(e) =>
                          setRegistrationData({
                            ...registrationData,
                            passport: e.target.value,
                            nationalId: "", // Clear national ID when passport is entered
                          })
                        }
                        placeholder="Passport number"
                        className="bg-white text-gray-800 border-gray-300 focus:border-[#094AB9] focus:ring-[#094AB9]/20"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Please provide either National ID or Passport number
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <Input
                    type="email"
                    value={registrationData.email}
                    onChange={(e) =>
                      setRegistrationData({
                        ...registrationData,
                        email: e.target.value,
                      })
                    }
                    required
                    placeholder="Enter your email"
                    className="bg-white text-gray-800 border-gray-300 focus:border-[#094AB9] focus:ring-[#094AB9]/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Organization</label>
                  <Input
                    value={registrationData.organization}
                    onChange={(e) =>
                      setRegistrationData({
                        ...registrationData,
                        organization: e.target.value,
                      })
                    }
                    required
                    placeholder="Enter your organization"
                    className="bg-white text-gray-800 border-gray-300 focus:border-[#094AB9] focus:ring-[#094AB9]/20"
                  />
                </div>

                {selectedEvent.financialSupportOption && (
                  <div className="bg-green-50 p-3 rounded-md border border-green-200 flex items-start text-green-700 text-sm">
                    <Info className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Financial Support Available</p>
                      <p className="mt-1">
                        This event offers financial support options. Our team
                        will contact you with details after registration.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 border border-gray-300 py-2.5 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#094AB9] text-white py-2.5 px-4 rounded-lg hover:bg-[#0a3a8a] transition-colors shadow-md font-medium"
                  >
                    Register
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
