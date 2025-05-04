export type Event = {
  eventId: string;
  name: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  registrationDeadline: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  createdAt: string;
  updatedAt: string;
};

export type CreateEventInput = Omit<Event, 'eventId' | 'createdAt' | 'updatedAt'>;

export type UpdateEventInput = Partial<CreateEventInput>; 