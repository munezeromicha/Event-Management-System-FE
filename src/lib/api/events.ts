import axios from 'axios';
import { Event, CreateEventInput, UpdateEventInput } from '@/types/event';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const eventsApi = {
  getAll: async (): Promise<Event[]> => {
    const response = await axios.get(`${API_URL}/events`);
    return response.data;
  },

  getById: async (id: string): Promise<Event> => {
    const response = await axios.get(`${API_URL}/events/${id}`);
    return response.data;
  },

  create: async (data: CreateEventInput): Promise<Event> => {
    const response = await axios.post(`${API_URL}/events`, data);
    return response.data;
  },

  update: async (id: string, data: UpdateEventInput): Promise<Event> => {
    const response = await axios.patch(`${API_URL}/events/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/events/${id}`);
  },

  getRegistrations: async (id: string) => {
    const response = await axios.get(`${API_URL}/events/${id}/registrations`);
    return response.data;
  },

  generateRegistrationLink: async (id: string): Promise<string> => {
    const response = await axios.post(`${API_URL}/events/${id}/registration-link`);
    return response.data.link;
  }
}; 