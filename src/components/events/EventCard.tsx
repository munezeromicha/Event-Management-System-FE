import { CalendarIcon, ClockIcon, MapPinIcon, UsersIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import Image from 'next/image';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  registeredCount: number;
  imageUrl: string;
}

interface EventCardProps {
  event: Event;
  onClick?: () => void;
}

export function EventCard({ event, onClick }: EventCardProps) {
  const isFullyBooked = event.registeredCount >= event.capacity;
  
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="relative h-48">
        <Image
          src={event.imageUrl}
          alt={event.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {isFullyBooked && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Fully Booked
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <CalendarIcon className="h-5 w-5 mr-2" />
            <span>{format(new Date(event.date), 'MMMM d, yyyy')}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <ClockIcon className="h-5 w-5 mr-2" />
            <span>{event.time}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <MapPinIcon className="h-5 w-5 mr-2" />
            <span className="truncate">{event.location}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <UsersIcon className="h-5 w-5 mr-2" />
            <span>{event.registeredCount} / {event.capacity} registered</span>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                isFullyBooked ? 'bg-red-500' : 'bg-blue-600'
              }`}
              style={{
                width: `${Math.min((event.registeredCount / event.capacity) * 100, 100)}%`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 