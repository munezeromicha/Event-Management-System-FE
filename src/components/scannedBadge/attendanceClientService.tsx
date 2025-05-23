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
 * Helper function to get auth token from cookies
 */
const getAuthToken = (): string => {
  // In a browser environment
  if (typeof document !== 'undefined') {
    try {
      // Parse cookies
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string>);
      
      // Check for staffAuthToken first, then fall back to authToken
      const token = cookies['staffAuthToken'] || cookies['authToken'];
      
      if (!token) {
        console.warn('Authentication token not found in cookies');
      }
      
      return token || '';
    } catch (error) {
      console.error('Error retrieving auth token:', error);
      return '';
    }
  }
  
  // In a server environment
  return '';
};

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
  } catch (error: unknown) {
    console.error('Scan QR code error:', error);
    throw error;
  }
};

/**
 * Gets all attendees with scanned badges (across all events)
 */
export const getScannedAttendees = async ({ page = 1, limit = 10 }: PaginationParams = {}) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    const response = await axios.get<PaginatedResponse<AttendanceRecord>>(
      `${API_URL}/api/attendance/scanned`, {
        params: { page, limit },
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error: unknown) {
    console.error('Get scanned attendees error:', error);
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      throw new Error('Session expired or unauthorized. Please log in again.');
    }
    throw error;
  }
};

/**
 * Gets all attendees with scanned badges for a specific event
 */
export const getScannedAttendeesByEvent = async (eventId: string, { page = 1, limit = 10 }: PaginationParams = {}) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    const response = await axios.get<PaginatedResponse<AttendanceRecord>>(
      `${API_URL}/api/attendance/scanned/events/${eventId}`, {
        params: { page, limit },
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error: unknown) {
    console.error('Get scanned attendees by event error:', error);
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      throw new Error('Session expired or unauthorized. Please log in again.');
    }
    throw error;
  }
};

/**
 * Updates bank account information for an attendee
 */
export const updateAttendeeBankAccount = async ({ attendanceId, bankAccountNumber, bankName }: UpdateBankAccountParams) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    const response = await axios.put(
      `${API_URL}/api/attendance/${attendanceId}/bank-account`, 
      { bankAccountNumber, bankName },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error: unknown) {
    console.error('Update bank account error:', error);
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      throw new Error('Session expired or unauthorized. Please log in again.');
    }
    throw error;
  }
};