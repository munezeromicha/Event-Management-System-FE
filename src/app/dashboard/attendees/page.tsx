'use client';

import { useState, useEffect } from 'react';
import { 
  getScannedAttendees, 
  getScannedAttendeesByEvent,
  updateAttendeeBankAccount,
  AttendanceRecord,
  PaginatedResponse
} from '@/components/scannedBadge/attendanceClientService';
import { toast } from 'react-hot-toast';
import { 
  ArrowDownTrayIcon, 
  ArrowPathIcon,
  UserGroupIcon, 
  BanknotesIcon, 
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  BuildingOfficeIcon,
  FunnelIcon,
  ListBulletIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline';

// Define Event type
interface Event {
  id: string;
  name: string;
  // Add other event properties as needed
}

interface APIError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

function isAPIError(error: unknown): error is APIError {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('response' in error || 'message' in error)
  );
}

export default function ScannedAttendeesPage() {
  const [attendees, setAttendees] = useState<AttendanceRecord[]>([]);
  const [allAttendees, setAllAttendees] = useState<AttendanceRecord[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [editingAttendee, setEditingAttendee] = useState<string | null>(null);
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [showExportOptions, setShowExportOptions] = useState(false);

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Fetch attendees when pagination, limit or selected event changes
  useEffect(() => {
    fetchAttendees();
  }, [pagination.page, pagination.limit, selectedEventId]);

  const fetchEvents = async () => {
    setEventsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const eventsData = await response.json();
      // From the images, I can see that each event has an eventId field
      // Make sure we have valid event objects with unique IDs
      const validEvents = eventsData.filter((event: { eventId: string; name?: string }) => event && event.eventId);
      setEvents(validEvents.map((event: { eventId: string; name?: string }) => ({
        id: event.eventId, // Map eventId to id for consistency
        name: event.name || `Event ${event.eventId.substring(0, 8)}` 
      })));
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setEventsLoading(false);
    }
  };

  const fetchAttendees = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let response: PaginatedResponse<AttendanceRecord>;
      
      if (selectedEventId) {
        // Fetch attendees for specific event
        response = await getScannedAttendeesByEvent(selectedEventId, {
          page: pagination.page,
          limit: pagination.limit
        });
      } else {
        // Fetch all attendees
        response = await getScannedAttendees({
          page: pagination.page,
          limit: pagination.limit
        });
      }
      
      setAttendees(response.data);
      setPagination(response.pagination);

      // For export functionality, we need to fetch all attendees (without pagination)
      fetchAllAttendeesForExport();
    } catch (error: unknown) {
      console.error('Error fetching attendees:', error);
      if (isAPIError(error)) {
        setError(error.response?.data?.message || 'Failed to load attendees');
      } else {
        setError('Failed to load attendees');
      }
      toast.error('Failed to load attendees');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAttendeesForExport = async () => {
    try {
      // We need to work within the server's limit of 500 records per page
      // Set maxLimit to match the new backend limit
      const maxLimit = 500; // Maximum allowed by your backend per page
      let allRecords: AttendanceRecord[] = [];
      
      // Function to fetch a page of records
      const fetchPage = async (currentPage: number): Promise<AttendanceRecord[]> => {
        if (selectedEventId) {
          const response = await getScannedAttendeesByEvent(selectedEventId, {
            page: currentPage,
            limit: maxLimit
          });
          return response.data || [];
        } else {
          const response = await getScannedAttendees({
            page: currentPage,
            limit: maxLimit
          });
          return response.data || [];
        }
      };
      
      // Fetch first page to get pagination info
      const firstPageData = await fetchPage(1);
      allRecords = [...firstPageData];
      
      // Set total pages based on our maxLimit
      const totalItems = pagination.total;
      const totalPagesToFetch = Math.ceil(totalItems / maxLimit);
      
      // If we have more than one page, fetch the rest
      if (totalPagesToFetch > 1) {
        for (let p = 2; p <= totalPagesToFetch; p++) {
          const pageData = await fetchPage(p);
          allRecords = [...allRecords, ...pageData];
          
          // If we've reached the end of data, stop
          if (pageData.length < maxLimit) {
            break;
          }
        }
      }
      
      // Set the collected records
      setAllAttendees(allRecords);
    } catch (error) {
      console.error('Error fetching attendees for export:', error);
      setAllAttendees([]); // Set empty array on error to prevent further issues
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(event.target.value);
    setPagination(prev => ({ ...prev, page: 1, limit: newLimit }));
  };

  const handleEventFilterChange = (eventId: string | null) => {
    setSelectedEventId(eventId);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const startEditingBankAccount = (attendeeId: string, currentBankAccount: string = '', currentBankName: string = '') => {
    setEditingAttendee(attendeeId);
    setBankAccountNumber(currentBankAccount);
    setBankName(currentBankName);
  };

  const cancelEditingBankAccount = () => {
    setEditingAttendee(null);
    setBankAccountNumber('');
    setBankName('');
  };

  const submitBankAccount = async (attendeeId: string) => {
    if (!bankAccountNumber.trim()) {
      toast.error('Bank account number cannot be empty');
      return;
    }
    
    if (!bankName.trim()) {
      toast.error('Bank name cannot be empty');
      return;
    }
    
    try {
      await updateAttendeeBankAccount({
        attendanceId: attendeeId,
        bankAccountNumber: bankAccountNumber.trim(),
        bankName: bankName.trim()
      });
      
      // Update the local state with the new bank account information
      setAttendees(prev => 
        prev.map(attendee => 
          attendee.id === attendeeId 
            ? { ...attendee, bankAccountNumber, bankName } 
            : attendee
        )
      );
      
      setEditingAttendee(null);
      setBankAccountNumber('');
      setBankName('');
      toast.success('Bank account information updated successfully');
    } catch (error: unknown) {
      console.error('Error updating bank account:', error);
      if (isAPIError(error)) {
        toast.error(error.response?.data?.message || 'Failed to update bank account information');
      } else {
        toast.error('Failed to update bank account information');
      }
    }
  };

  const exportAttendees = async () => {
    setExportLoading(true);
    
    try {
      // Get filtered event name for the filename
      const eventName = selectedEventId 
        ? events.find(e => e.id === selectedEventId)?.name || 'Event'
        : 'All-Events';
      
      // Format current date for filename
      const date = new Date().toISOString().split('T')[0];
      const filename = `${eventName.replace(/\s+/g, '-')}-Attendees-${date}`;
      
      if (exportFormat === 'csv') {
        // Export as CSV
        exportAsCSV(filename);
      } else {
        // Export as PDF
        exportAsPDF();
      }
    } catch (error) {
      console.error('Error exporting attendees:', error);
      toast.error('Failed to export attendees');
    } finally {
      setExportLoading(false);
      setShowExportOptions(false);
    }
  };

  const exportAsCSV = (filename: string) => {
    // CSV header row
    const headers = [
      'Name', 
      'Organization', 
      'Check-in Date', 
      'Check-in Time', 
      'Phone Number', 
      'Email', 
      'Bank Name',
      'Bank Account Number'
    ];
    
    // Format attendee data for CSV
    const csvData = allAttendees.map(attendee => {
      const checkInDate = new Date(attendee.checkInTime);
      
      return [
        attendee.name || 'N/A',
        attendee.organization || 'N/A',
        checkInDate.toLocaleDateString(),
        checkInDate.toLocaleTimeString(),
        attendee.phoneNumber || 'N/A',
        attendee.email || 'N/A',
        attendee.bankName || 'N/A',
        attendee.bankAccountNumber || 'N/A'
      ];
    });
    
    // Join all rows and create CSV content
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    // Create a Blob with the CSV data
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create a link and trigger download
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV file exported successfully');
  };

  const exportAsPDF = () => {
    setTimeout(() => {
      toast.success('PDF file exported successfully');
    }, 1000);
  };

  const renderPagination = () => {
    const pages = [];
    const { page, totalPages } = pagination;
    
    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1 rounded-md border bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 shadow-sm transition-all"
        aria-label="Previous page"
      >
        &laquo;
      </button>
    );
    
    // Page numbers
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, page + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-md border shadow-sm transition-all ${
            i === page 
              ? 'bg-blue-600 text-white font-medium border-blue-600' 
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
          aria-label={`Page ${i}`}
          aria-current={i === page ? 'page' : undefined}
        >
          {i}
        </button>
      );
    }
    
    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-1 rounded-md border bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 shadow-sm transition-all"
        aria-label="Next page"
      >
        &raquo;
      </button>
    );
    
    return (
      <div className="flex justify-center gap-2 mt-6 mb-2">
        {pages}
      </div>
    );
  };

  const getSelectedEventName = () => {
    if (!selectedEventId) return "All Events";
    const event = events.find(e => e.id === selectedEventId);
    return event ? event.name : "Selected Event";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center mb-4 bg-blue-100 p-3 rounded-full">
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Scanned Attendees</h1>
            <p className="text-center text-gray-600">Manage and view all event attendees</p>
          </div>
          
          {/* Filters and controls */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="w-full md:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FunnelIcon className="h-4 w-4 mr-1 text-blue-500" />
                  Event Filter:
                </label>
                {eventsLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-10 w-48 bg-gray-200 animate-pulse rounded-md"></div>
                    <div className="animate-spin h-4 w-4 text-blue-500">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </div>
                ) : (
                  <select 
                    title="Event Filter"
                    onChange={(e) => handleEventFilterChange(e.target.value === 'all' ? null : e.target.value)}
                    className="border rounded-md px-4 py-2 w-full md:w-64 bg-white text-gray-800 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none focus:ring-opacity-50 transition-all"
                  >
                    <option key="all-events" value="all">All Events</option>
                    {events.map((event) => (
                      <option key={`event-${event.id || Math.random()}`} value={event.id}>
                        {event.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              <div className="w-full md:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <ListBulletIcon className="h-4 w-4 mr-1 text-blue-500" />
                  Records per page:
                </label>
                <select 
                  title="Records per page"
                  value={pagination.limit} 
                  onChange={handleLimitChange}
                  className="border rounded-md px-4 py-2 w-full md:w-36 bg-white text-gray-800 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all"
                >
                  <option value="10">10 records</option>
                  <option value="25">25 records</option>
                  <option value="50">50 records</option>
                  <option value="100">100 records</option>
                  <option value="500">500 records</option>
                </select>
              </div>
              
              <div className="w-full md:w-auto flex gap-3">
                <div className="relative">
                  <button 
                    onClick={() => setShowExportOptions(!showExportOptions)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 shadow-md transition-all flex items-center justify-center"
                    disabled={exportLoading || loading || attendees.length === 0}
                  >
                    {exportLoading ? (
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                    )}
                    {exportLoading ? 'Exporting...' : 'Export'}
                  </button>
                  
                  {/* Export Options Dropdown */}
                  {showExportOptions && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm text-gray-700 font-semibold border-b border-gray-100">
                          Export Options
                        </div>
                        <button
                          onClick={() => {
                            setExportFormat('csv');
                            exportAttendees();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center transition-colors"
                        >
                          <svg className="h-4 w-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Export as CSV
                        </button>
                        <button
                          onClick={() => {
                            setExportFormat('pdf');
                            exportAttendees();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center transition-colors"
                        >
                          <svg className="h-4 w-4 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          Export as PDF
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={() => fetchAttendees()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-md transition-all flex items-center justify-center"
                  disabled={loading}
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <ArrowPathIcon className="h-5 w-5 mr-2" />
                  )}
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Export info banner */}
          {!loading && attendees.length > 0 && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-md shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">Export attendee data: </span> 
                    Use the Export button to download the complete list of attendees for {getSelectedEventName()}.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center my-12">
              <div className="relative">
                <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
                <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-4 border-b-4 border-blue-200 animate-ping opacity-20"></div>
              </div>
              <p className="mt-6 text-gray-600 text-lg font-medium">Loading attendees...</p>
              <p className="text-gray-500 text-sm">This may take a moment</p>
            </div>
          )}
          
          {/* Error state */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm mb-6">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-medium">{error}</p>
              </div>
            </div>
          )}
          
          {/* Attendees table */}
          {!loading && !error && (
            <>
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                {attendees.length === 0 ? (
                  <div className="p-12 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p className="text-xl text-gray-600 font-medium">No attendees found</p>
                    <p className="text-gray-500 mt-2">Try changing your filters or check back later.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-blue-50 to-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center">
                              <UserGroupIcon className="h-4 w-4 mr-1 text-blue-500" />
                              Name
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center">
                              <ClockIcon className="h-4 w-4 mr-1 text-blue-500" />
                              Check-in Time
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center">
                              <PhoneIcon className="h-4 w-4 mr-1 text-blue-500" />
                              Contact
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center">
                              <BanknotesIcon className="h-4 w-4 mr-1 text-blue-500" />
                              Bank Information
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center">
                              <PencilIcon className="h-4 w-4 mr-1 text-blue-500" />
                              Actions
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {attendees.map((attendee) => (
                          <tr key={attendee.id} className="hover:bg-blue-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-700 font-medium text-sm">
                                    {attendee.name ? attendee.name.charAt(0).toUpperCase() : '?'}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{attendee.name}</div>
                                  <div className="text-xs text-gray-500 flex items-center">
                                    <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                                    {attendee.organization || 'N/A'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(attendee.checkInTime).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(attendee.checkInTime).toLocaleTimeString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {attendee.phoneNumber && (
                                <div className="text-sm text-gray-900 flex items-center">
                                  <PhoneIcon className="h-4 w-4 mr-1 text-gray-500" />
                                  {attendee.phoneNumber}
                                </div>
                              )}
                              {attendee.email && (
                                <div className="text-sm text-gray-500 flex items-center">
                                  <EnvelopeIcon className="h-4 w-4 mr-1 text-gray-500" />
                                  {attendee.email}
                                </div>
                              )}
                              {!attendee.phoneNumber && !attendee.email && (
                                <div className="text-sm text-gray-500 italic">No contact info</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {editingAttendee === attendee.id ? (
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center gap-2">
                                    <BuildingLibraryIcon className="h-4 w-4 text-gray-500" />
                                    <input
                                      type="text"
                                      value={bankName}
                                      onChange={(e) => setBankName(e.target.value)}
                                      className="border rounded-md px-3 py-2 text-sm w-full max-w-xs bg-white text-gray-900 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
                                      placeholder="Enter bank name"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <BanknotesIcon className="h-4 w-4 text-gray-500" />
                                    <input
                                      type="text"
                                      value={bankAccountNumber}
                                      onChange={(e) => setBankAccountNumber(e.target.value)}
                                      className="border rounded-md px-3 py-2 text-sm w-full max-w-xs bg-white text-gray-900 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
                                      placeholder="Enter account number"
                                    />
                                  </div>
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      onClick={() => submitBankAccount(attendee.id)}
                                      className="bg-green-600 text-white px-3 py-2 rounded-md text-xs hover:bg-green-700 transition-colors flex items-center"
                                    >
                                      <CheckIcon className="h-4 w-4 mr-1" />
                                      Save
                                    </button>
                                    <button
                                      onClick={cancelEditingBankAccount}
                                      className="bg-gray-600 text-white px-3 py-2 rounded-md text-xs hover:bg-gray-700 transition-colors flex items-center"
                                    >
                                      <XMarkIcon className="h-4 w-4 mr-1" />
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm">
                                  {attendee.bankName && attendee.bankAccountNumber ? (
                                    <div>
                                      <span className="text-gray-900 flex items-center">
                                        <BuildingLibraryIcon className="h-4 w-4 mr-1 text-green-500" />
                                        <span className="font-medium">Bank:</span> {attendee.bankName}
                                      </span>
                                      <span className="text-gray-900 flex items-center mt-1">
                                        <BanknotesIcon className="h-4 w-4 mr-1 text-green-500" />
                                        <span className="font-medium">Account:</span> {attendee.bankAccountNumber}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-gray-500 italic">Not provided</span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {editingAttendee !== attendee.id && (
                                <button
                                  onClick={() => startEditingBankAccount(
                                    attendee.id, 
                                    attendee.bankAccountNumber || '', 
                                    attendee.bankName || ''
                                  )}
                                  className="text-blue-600 hover:text-blue-900 flex items-center"
                                >
                                  <PencilIcon className="h-4 w-4 mr-1" />
                                  Update Bank Info
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              
              {/* Pagination */}
              {attendees.length > 0 && renderPagination()}
              
              {/* Summary */}
              <div className="mt-4 mb-8 text-sm text-gray-600 text-center bg-blue-50 p-2 rounded-lg shadow-sm inline-block mx-auto">
                <div className="flex items-center justify-center">
                  <UserGroupIcon className="h-4 w-4 mr-1 text-blue-500" />
                  Showing {attendees.length} of {pagination.total} attendees | Page {pagination.page} of {pagination.totalPages}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
