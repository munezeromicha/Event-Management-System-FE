import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface PaginationParams {
  page?: number;
  limit?: number;
}

interface UpdateBankAccountParams {
  attendanceId: string;
  bankAccountNumber: string;
  bankName: string;
}

export interface AttendanceRecord {
  id: string;
  name: string;
  checkInTime: string;
  bankAccountNumber?: string;
  bankName?: string;
  phoneNumber?: string;
  email?: string;
  organization?: string;
  eventId?: string;
  registrationId?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Scans QR code and records attendance
 */
export const scanAttendanceQR = async (qrCode: string) => {
  try {
    const response = await axios.post(`${API_URL}/api/attendance/scan`, {
      qrCode
    }, {
      timeout: 10000 // 10 second timeout
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Scan QR code error:', error);
    throw error;
  }
};

/**
 * Gets all attendees with scanned badges (across all events)
 */
export const getScannedAttendees = async ({ page = 1, limit = 10 }: PaginationParams = {}) => {
  try {
    const response = await axios.get<PaginatedResponse<AttendanceRecord>>(
      `${API_URL}/api/attendance/scanned`, {
        params: { page, limit },
        headers: {
          Authorization: `Bearer ${getAuthToken()}`
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Get scanned attendees error:', error);
    throw error;
  }
};

/**
 * Gets all attendees with scanned badges for a specific event
 */
export const getScannedAttendeesByEvent = async (eventId: string, { page = 1, limit = 10 }: PaginationParams = {}) => {
  try {
    const response = await axios.get<PaginatedResponse<AttendanceRecord>>(
      `${API_URL}/api/attendance/scanned/events/${eventId}`, {
        params: { page, limit },
        headers: {
          Authorization: `Bearer ${getAuthToken()}`
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Get scanned attendees by event error:', error);
    throw error;
  }
};

/**
 * Updates bank account information for an attendee
 */
export const updateAttendeeBankAccount = async ({ attendanceId, bankAccountNumber, bankName }: UpdateBankAccountParams) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/attendance/${attendanceId}/bank-account`, 
      { bankAccountNumber, bankName },
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Update bank account error:', error);
    throw error;
  }
};

/**
 * Helper function to get auth token from cookies
 */
const getAuthToken = () => {
  // In a browser environment
  if (typeof document !== 'undefined') {
    // Parse cookies
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    return cookies['authToken'];
  }
  
  // In a server environment or if cookie not found
  return '';
};