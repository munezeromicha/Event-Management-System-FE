"use client"

import { useState, useEffect } from "react";
import EventCard from "./EventCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { X } from "lucide-react";

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

const UpcomingEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [idType, setIdType] = useState<'nationalId' | 'passport'>('nationalId');
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    fullName: '',
    phoneNumber: '',
    nationalId: '',
    passport: '',
    email: '',
    organization: ''
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch events. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    // Validate ID fields
    if (idType === 'nationalId' && !registrationData.nationalId) {
      toast({
        title: "Error",
        description: "Please enter your National ID",
        variant: "destructive"
      });
      return;
    }

    if (idType === 'passport' && !registrationData.passport) {
      toast({
        title: "Error",
        description: "Please enter your Passport number",
        variant: "destructive"
      });
      return;
    }

    try {
      const registrationPayload = {
        ...registrationData,
        nationalId: idType === 'nationalId' ? registrationData.nationalId : undefined,
        passport: idType === 'passport' ? registrationData.passport : undefined,
      };

      const response = await fetch(`http://localhost:3000/api/registrations/${selectedEvent.eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Registration Failed",
          description: data.message || "Failed to register for the event",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: data.message || "You have successfully registered for the event!",
      });

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error registering:', error);
      toast({
        title: "Error",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setRegistrationData({
      fullName: '',
      phoneNumber: '',
      nationalId: '',
      passport: '',
      email: '',
      organization: ''
    });
    setIdType('nationalId');
    setSelectedEvent(null);
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#232560]"></div>
      </div>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
          <p className="text-lg text-gray-700">
            Join us at our upcoming events to learn more about investment opportunities and financial literacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <EventCard
              key={event.eventId}
              {...event}
              onRegister={() => {
                setSelectedEvent(event);
                setShowModal(true);
              }}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
              onClick={() => setShowModal(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="absolute top-0 left-0 w-full h-2 bg-[#232560]" />

                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close registration modal"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="p-6">
                  <div className="text-center mb-6">
                    <Badge className="inline-block mb-2 bg-[#232560]">
                      {selectedEvent?.eventType}
                    </Badge>
                    <h2 className="text-2xl font-bold text-[#232560] mb-2">
                      {selectedEvent?.name}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Please fill in your details to register for this event
                    </p>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-gray-700">Full Name</Label>
                      <Input
                        id="fullName"
                        value={registrationData.fullName}
                        onChange={(e) => setRegistrationData({ ...registrationData, fullName: e.target.value })}
                        required
                        className="border-gray-200 focus:border-[#232560] focus:ring-[#232560] text-[#75797F]"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-gray-700">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        value={registrationData.phoneNumber}
                        onChange={(e) => setRegistrationData({ ...registrationData, phoneNumber: e.target.value })}
                        required
                        className="border-gray-200 focus:border-[#232560] focus:ring-[#232560] text-[#75797F]"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700">Identification Type</Label>
                      <RadioGroup 
                        value={idType} 
                        onValueChange={(value: 'nationalId' | 'passport') => setIdType(value)}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="nationalId" id="nationalId" className="text-[#232560]" />
                          <Label htmlFor="nationalId" className="text-gray-700">National ID</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="passport" id="passport" className="text-[#232560]" />
                          <Label htmlFor="passport" className="text-gray-700">Passport</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {idType === 'nationalId' && (
                      <div className="space-y-2">
                        <Label htmlFor="nationalId" className="text-gray-700">National ID Number</Label>
                        <Input
                          id="nationalId"
                          value={registrationData.nationalId}
                          onChange={(e) => setRegistrationData({ ...registrationData, nationalId: e.target.value })}
                          required
                          className="border-gray-200 focus:border-[#232560] focus:ring-[#232560] text-[#75797F]"
                          placeholder="Enter your National ID number"
                        />
                      </div>
                    )}

                    {idType === 'passport' && (
                      <div className="space-y-2">
                        <Label htmlFor="passport" className="text-gray-700">Passport Number</Label>
                        <Input
                          id="passport"
                          value={registrationData.passport}
                          onChange={(e) => setRegistrationData({ ...registrationData, passport: e.target.value })}
                          required
                          className="border-gray-200 focus:border-[#232560] focus:ring-[#232560] text-[#75797F]"
                          placeholder="Enter your passport number"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={registrationData.email}
                        onChange={(e) => setRegistrationData({ ...registrationData, email: e.target.value })}
                        required
                        className="border-gray-200 focus:border-[#232560] focus:ring-[#232560] text-[#75797F]"
                        placeholder="Enter your email address"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organization" className="text-gray-700">Organization</Label>
                      <Input
                        id="organization"
                        value={registrationData.organization}
                        onChange={(e) => setRegistrationData({ ...registrationData, organization: e.target.value })}
                        required
                        className="border-gray-200 focus:border-[#232560] focus:ring-[#232560] text-[#75797F]"
                        placeholder="Enter your organization"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowModal(false)}
                        className="flex-1 border-gray-200 hover:bg-gray-50 bg-[#75797F] hover:text-[#75797F] cursor-pointer"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-[#094AB9] hover:bg-[#232560] text-white cursor-pointer"
                      >
                        Register
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
};

export default UpcomingEvents;