'use client'

import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

interface Event {
  eventId: string;
  name: string;
  eventType: string;
  date: string;
  time: string;
  dateTime: string;
  location: string;
  description: string;
  maxCapacity: number;
  financialSupportOption: boolean;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    eventType: '',
    date: '',
    time: '',
    location: '',
    description: '',
    maxCapacity: '',
    financialSupportOption: false,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const getAuthHeaders = () => {
    const token = Cookies.get('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/events', {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load events. Please try again later.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      eventType: '',
      date: '',
      time: '',
      location: '',
      description: '',
      maxCapacity: '',
      financialSupportOption: false,
    });
    setEditingEvent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingEvent ? 'Updating event...' : 'Creating event...');

    try {
      const url = editingEvent 
        ? `http://localhost:3000/api/events/${editingEvent.eventId}`
        : 'http://localhost:3000/api/events';
      
      const response = await fetch(url, {
        method: editingEvent ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...formData,
          maxCapacity: parseInt(formData.maxCapacity),
        }),
      });

      if (!response.ok) throw new Error('Operation failed');

      toast.success(editingEvent ? 'Event updated successfully!' : 'Event created successfully!', {
        id: loadingToast
      });

      await fetchEvents();
      setIsModalOpen(false);
      resetForm();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed. Please try again.';
      toast.error(errorMessage, {
        id: loadingToast
      });
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    const loadingToast = toast.loading('Deleting event...');

    try {
      const response = await fetch(`http://localhost:3000/api/events/${eventId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to delete event');

      toast.success('Event deleted successfully!', {
        id: loadingToast
      });

      await fetchEvents();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete event. Please try again.';
      toast.error(errorMessage, {
        id: loadingToast
      });
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      eventType: event.eventType,
      date: event.date || '',
      time: event.time || '',
      location: event.location,
      description: event.description,
      maxCapacity: event.maxCapacity.toString(),
      financialSupportOption: event.financialSupportOption,
    });
    setIsModalOpen(true);
  };

  const formatDate = (dateTime: string) => {
    if (!dateTime) return 'N/A';
    try {
      const date = new Date(dateTime);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error: unknown) {
      console.error('Date formatting error:', error);
      return dateTime;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Events Management</h1>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Create Event
          </button>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-800 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-lg shadow-lg">
            <div className="w-full">
              <table className="w-full table-fixed border-collapse">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/5">Name</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/12">Type</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/6">Date & Time</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/6">Location</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-white uppercase tracking-wider w-1/12">Capacity</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-white uppercase tracking-wider w-1/12">Support</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-white uppercase tracking-wider w-1/12">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-gray-700">
                  {events.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                        No events found. Create your first event!
                      </td>
                    </tr>
                  ) : (
                    events.map((event) => (
                      <tr key={event.eventId} className="hover:bg-gray-800/50">
                        <td className="px-3 py-4">
                          <div className="text-sm font-medium text-gray-900 truncate">{event.name}</div>
                          <div className="text-sm text-gray-500 truncate">{event.description}</div>
                        </td>
                        <td className="px-3 py-4">
                          <div className="text-sm text-gray-900 truncate">{event.eventType}</div>
                        </td>
                        <td className="px-3 py-4">
                          <div className="text-sm text-gray-900">{formatDate(event.dateTime)}</div>
                        </td>
                        <td className="px-3 py-4">
                          <div className="text-sm text-gray-900 truncate">{event.location}</div>
                        </td>
                        <td className="px-3 py-4 text-center">
                          <div className="text-sm text-gray-900">{event.maxCapacity}</div>
                        </td>
                        <td className="px-3 py-4 text-center">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            event.financialSupportOption
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {event.financialSupportOption ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleEdit(event)}
                              className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                              title="Edit event"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(event.eventId)}
                              className="text-red-400 hover:text-red-300 transition-colors duration-200"
                              title="Delete event"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={editingEvent ? 'Edit Event' : 'Create Event'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Event Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter event name"
              className="text-gray-600"
            />
            <Input
              label="Event Type"
              name="eventType"
              value={formData.eventType}
              onChange={handleInputChange}
              required
              placeholder="Enter event type"
              className="text-gray-600"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                label="Date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="text-gray-600"
              />
              <Input
                type="time"
                label="Time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                required
                className="text-gray-600"
              />
            </div>
            <Input
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              placeholder="Enter event location"
              className="text-gray-600"
            />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-white border border-gray-700 rounded-md text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter event description"
              />
            </div>
            <Input
              type="number"
              label="Maximum Capacity"
              name="maxCapacity"
              value={formData.maxCapacity}
              onChange={handleInputChange}
              required
              min="1"
              placeholder="Enter maximum capacity"
              className="text-gray-600"
            />
            <div className="flex items-center">
              <input
                title="Financial Support Available"
                type="checkbox"
                name="financialSupportOption"
                checked={formData.financialSupportOption}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 rounded bg-gray-300"
              />
              <label className="ml-2 block text-sm text-gray-600">
                Financial Support Available
              </label>
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {editingEvent ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}