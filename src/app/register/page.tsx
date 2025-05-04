'use client'

import  EventRegistration  from '@/app/register/[eventId]/page'

export default function RegisterPage() {
  const handleRegister = (data: any) => {
    console.log('Register data:', data);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8 bg-card p-8 rounded-lg shadow-lg">
        <EventRegistration onSubmit={handleRegister} />
      </div>
    </div>
  );
} 