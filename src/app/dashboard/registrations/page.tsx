"use client";

import React, { useState, useEffect } from 'react';
import { 
  CheckIcon, 
  XMarkIcon, 
  ArrowDownTrayIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  FunnelIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import BadgeButton from '@/components/BadgeButton';

interface RawRegistration {
  id?: string;
  registrationId?: string;
  eventId: string;
  eventTitle: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  nationalId: string;
  organization: string;
  status: 'pending' | 'approved' | 'rejected';
  registrationDate: string;
}

interface Registration {
  id: string;
  registrationId: string;
  eventId: string;
  eventTitle: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  nationalId: string;
  organization: string;
  status: 'pending' | 'approved' | 'rejected';
  registrationDate: string;
}

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<Registration['status'] | 'all'>('pending');
  const [badgeLoading, setBadgeLoading] = useState<Record<string, boolean>>({});
  const [bulkActionLoading, setBulkActionLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const getAuthHeaders = () => {
    const token = Cookies.get('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchRegistrations = async () => {
    // Prevent multiple rapid requests
    const now = Date.now();
    if (now - lastFetchTime < 2000) { // 2 second cooldown
      return;
    }
    setLastFetchTime(now);

    setRefreshing(true);
    try {
      const response = await fetch('http://localhost:3000/api/registrations', {
        headers: getAuthHeaders()
      });

      if (response.status === 429) {
        // Handle rate limiting
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
        
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            fetchRegistrations();
          }, waitTime);
          return;
        } else {
          toast.error('Too many requests. Please try again later.');
          return;
        }
      }

      if (!response.ok) throw new Error('Failed to fetch registrations');
      
      const data = await response.json();
      
      const formattedData = data.map((reg: RawRegistration) => ({
        ...reg,
        id: reg.id || reg.registrationId,
        registrationId: reg.registrationId || reg.id
      }));
      
      setRegistrations(formattedData);
      setRetryCount(0); // Reset retry count on success
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load registrations. Please try again later.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const handleStatusChange = async (registrationId: string, action: 'approve' | 'reject') => {
    try {
      const endpoint = action === 'approve' 
        ? `http://localhost:3000/api/registrations/${registrationId}/approve`
        : `http://localhost:3000/api/registrations/${registrationId}/reject`;

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error(`Failed to ${action} registration`);
      
      toast.success(`Registration ${action}d successfully`);
      await fetchRegistrations();
    } catch (error) {
      toast.error(`Failed to ${action} registration. Please try again.`);
    }
  };

  const handleBulkStatusChange = async (action: 'approve' | 'reject') => {
    setBulkActionLoading(true);
    
    // Get only pending registrations for bulk action
    const pendingRegistrations = registrations.filter(reg => reg.status === 'pending');
    
    if (pendingRegistrations.length === 0) {
      toast.error('No pending registrations to process');
      setBulkActionLoading(false);
      return;
    }

    try {
      // Confirm the bulk action
      if (!window.confirm(`Are you sure you want to ${action} all ${pendingRegistrations.length} pending registrations?`)) {
        setBulkActionLoading(false);
        return;
      }

      // Process all pending registrations
      let successCount = 0;
      let failureCount = 0;

      for (const registration of pendingRegistrations) {
        const endpoint = action === 'approve' 
          ? `http://localhost:3000/api/registrations/${registration.registrationId}/approve`
          : `http://localhost:3000/api/registrations/${registration.registrationId}/reject`;

        try {
          const response = await fetch(endpoint, {
            method: 'PATCH',
            headers: getAuthHeaders()
          });

          if (response.ok) {
            successCount++;
          } else {
            failureCount++;
          }
        } catch (error) {
          failureCount++;
        }
      }

      // Update UI with results
      if (successCount > 0) {
        toast.success(`Successfully ${action}d ${successCount} registrations`);
      }
      
      if (failureCount > 0) {
        toast.error(`Failed to ${action} ${failureCount} registrations`);
      }

      // Refresh the registration list
      await fetchRegistrations();
    } catch {
      toast.error(`Failed to process bulk ${action}. Please try again.`);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleGenerateBadge = async (registrationId: string) => {
    // Set loading state for this specific badge
    setBadgeLoading(prev => ({ ...prev, [registrationId]: true }));
    
    try {
      // First, request badge generation
      const generateResponse = await fetch(`http://localhost:3000/api/badges/registrations/${registrationId}`, {
        headers: getAuthHeaders()
      });

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        throw new Error(errorData.message || 'Failed to generate badge');
      }

      const badgeData = await generateResponse.json();

      // Then, download the badge with the download=true parameter
      const downloadResponse = await fetch(`http://localhost:3000/api/badges/registrations/${registrationId}?download=true`, {
        headers: getAuthHeaders()
      });

      if (!downloadResponse.ok) {
        throw new Error('Failed to download badge');
      }
      
      // Create and download the PDF file
      const blob = await downloadResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `badge-${registrationId}.pdf`;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      window.URL.revokeObjectURL(url);

      toast.success('Badge downloaded successfully');
    } catch (error: any) {
      console.error('Badge generation error:', error);
      toast.error(error.message || 'Failed to download badge. Please try again.');
    } finally {
      setBadgeLoading(prev => ({ ...prev, [registrationId]: false }));
    }
  };

  const handleExportApprovedAttendees = async () => {
    try {
      const approvedRegistrations = registrations.filter(reg => reg.status === 'approved');
      
      // Create CSV content
      const headers = ['Full Name', 'Email', 'Phone Number', 'National ID', 'Organization', 'Event Title', 'Registration Date'];
      const rows = approvedRegistrations.map(reg => [
        reg.fullName,
        reg.email,
        reg.phoneNumber,
        reg.nationalId,
        reg.organization,
        reg.eventTitle,
        format(new Date(reg.registrationDate), 'MMM d, yyyy h:mm a')
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `approved-attendees-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Approved attendees exported successfully');
    } catch (error) {
      toast.error('Failed to export approved attendees. Please try again.');
    }
  };

  const filteredRegistrations = registrations.filter(reg => 
    filter === 'all' ? true : reg.status === filter
  );

  const pendingCount = registrations.filter(reg => reg.status === 'pending').length;
  const approvedCount = registrations.filter(reg => reg.status === 'approved').length;
  const rejectedCount = registrations.filter(reg => reg.status === 'rejected').length;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="sm:flex sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Event Registrations</h1>
              <p className="mt-2 text-sm text-gray-700">
                Review and manage event registration requests
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={fetchRegistrations}
                disabled={refreshing}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
              >
                {refreshing ? (
                  <>
                    <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin text-gray-500" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <ArrowPathIcon className="h-5 w-5 mr-2 text-gray-500" />
                    Refresh
                  </>
                )}
              </button>

              <button
                onClick={handleExportApprovedAttendees}
                disabled={approvedCount === 0}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  approvedCount === 0 ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                }`}
              >
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Export Approved ({approvedCount})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="text-blue-800 text-sm font-medium">All</p>
                <p className="text-blue-900 text-xl font-bold">{registrations.length}</p>
              </div>
              <button
                onClick={() => setFilter('all')}
                className={`text-blue-700 hover:bg-blue-100 p-2 rounded-full ${filter === 'all' ? 'bg-blue-100' : ''}`}
                title="Filter all registrations"
              >
                <FunnelIcon className="h-5 w-5 cursor-pointer" />
              </button>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="text-yellow-800 text-sm font-medium">Pending</p>
                <p className="text-yellow-900 text-xl font-bold">{pendingCount}</p>
              </div>
              <button
                onClick={() => setFilter('pending')}
                className={`text-yellow-700 hover:bg-yellow-100 p-2 rounded-full ${filter === 'pending' ? 'bg-yellow-100' : ''}`}
                title="Filter pending registrations"
              >
                <FunnelIcon className="h-5 w-5 cursor-pointer" />
              </button>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="text-green-800 text-sm font-medium">Approved</p>
                <p className="text-green-900 text-xl font-bold">{approvedCount}</p>
              </div>
              <button
                onClick={() => setFilter('approved')}
                className={`text-green-700 hover:bg-green-100 p-2 rounded-full ${filter === 'approved' ? 'bg-green-100' : ''}`}
                title="Filter approved registrations"
              >
                <FunnelIcon className="h-5 w-5 cursor-pointer" />
              </button>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="text-red-800 text-sm font-medium">Rejected</p>
                <p className="text-red-900 text-xl font-bold">{rejectedCount}</p>
              </div>
              <button
                onClick={() => setFilter('rejected')}
                className={`text-red-700 hover:bg-red-100 p-2 rounded-full ${filter === 'rejected' ? 'bg-red-100' : ''}`}
                title="Filter rejected registrations"
              >
                <FunnelIcon className="h-5 w-5 cursor-pointer" />
              </button>
            </div>
          </div>

          {pendingCount > 0 && (
            <div className="flex justify-end space-x-4 mb-4">
              <button
                onClick={() => handleBulkStatusChange('approve')}
                disabled={bulkActionLoading || pendingCount === 0}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  bulkActionLoading || pendingCount === 0 
                    ? 'bg-green-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                }`}
              >
                {bulkActionLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Approve All ({pendingCount})
                  </>
                )}
              </button>
              
              <button
                onClick={() => handleBulkStatusChange('reject')}
                disabled={bulkActionLoading || pendingCount === 0}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  bulkActionLoading || pendingCount === 0 
                    ? 'bg-red-400 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                }`}
              >
                {bulkActionLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <XCircleIcon className="h-5 w-5 mr-2" />
                    Reject All ({pendingCount})
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4 bg-white shadow rounded-lg p-6">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded" />
            ))}
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {filteredRegistrations.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                  <FunnelIcon className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No registrations found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No registrations match the current filter.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setFilter('all')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View all registrations
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Attendee</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Event</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Registration Date</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredRegistrations.map((registration) => (
                      <tr 
                        key={registration.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 pl-4 pr-3 text-sm">
                          <div className="font-medium text-gray-900">{registration.fullName}</div>
                          <div className="text-gray-500 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {registration.email}
                          </div>
                          <div className="text-gray-500 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {registration.phoneNumber}
                          </div>
                          <div className="text-gray-500 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                            </svg>
                            ID: {registration.nationalId}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          <div className="font-medium">{registration.eventTitle}</div>
                          <div className="text-gray-400 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                            Event ID: {registration.eventId}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            {registration.organization || 'Not specified'}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {format(new Date(registration.registrationDate), 'MMM d, yyyy')}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {format(new Date(registration.registrationDate), 'h:mm a')}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold leading-5 ${
                            registration.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            registration.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {registration.status === 'pending' && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                            {registration.status === 'approved' && (
                              <CheckIcon className="h-4 w-4 mr-1" />
                            )}
                            {registration.status === 'rejected' && (
                              <XMarkIcon className="h-4 w-4 mr-1" />
                            )}
                            {registration.status}
                          </span>
                        </td>
                        <td className="py-4 pl-3 pr-4 text-sm font-medium sm:pr-6">
                          {registration.status === 'pending' ? (
                            <div className="flex items-center space-x-4">
                              <button
                                onClick={() => handleStatusChange(registration.registrationId, 'approve')}
                                className="text-green-600 hover:text-green-900 cursor-pointer flex items-center"
                                title="Approve registration"
                              >
                                <CheckIcon className="h-5 w-5 mr-1" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleStatusChange(registration.registrationId, 'reject')}
                                className="text-red-600 hover:text-red-900 cursor-pointer flex items-center"
                                title="Reject registration"
                              >
                                <XMarkIcon className="h-5 w-5 mr-1" />
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : registration.status === 'approved' ? (
                            <div className="flex items-center">
                              {badgeLoading[registration.registrationId] ? (
                                <button
                                  disabled
                                  className="text-blue-400 cursor-not-allowed flex items-center"
                                >
                                  <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Generating...
                                </button>
                              ) : (
                                <BadgeButton
                                  registrationId={registration.registrationId}
                                  status={registration.status}
                                />
                              )}
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}