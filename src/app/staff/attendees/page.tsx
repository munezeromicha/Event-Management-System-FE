'use client';

import { useState, useEffect } from 'react';
import { getScannedAttendees, getScannedAttendeesByEvent, AttendanceRecord } from '@/components/scannedBadge/attendanceClientService';
import { toast } from 'react-hot-toast';
import { 
  ArrowPathIcon,
  UserGroupIcon, 
  BanknotesIcon, 
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  BuildingOfficeIcon,
  FunnelIcon,
  ListBulletIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import logo from "../../../../public/images/RNIT_Logo.png";

interface AutoTableOptions {
  head: string[][];
  body: string[][];
  startY: number;
  theme?: string;
  styles?: {
    fontSize?: number;
    cellPadding?: number;
    overflow?: string;
  };
  headStyles?: {
    fillColor?: number[];
    textColor?: number;
    halign?: string;
  };
  columnStyles?: {
    [key: number]: {
      cellWidth?: number;
    };
  };
}

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF;
    internal: {
      events: PubSub;
      scaleFactor: number;
      pageSize: {
        width: number;
        getWidth: () => number;
        height: number;
        getHeight: () => number;
      };
      pages: number[];
      getEncryptor: (objectId: number) => (data: string) => string;
      getNumberOfPages: () => number;
      getCurrentPageInfo: () => { pageNumber: number };
    };
  }
}

// Define Event type
interface Event {
  id: string;
  name: string;
}

export default function ScannedAttendeesPage() {
  const [attendees, setAttendees] = useState<AttendanceRecord[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Fetch attendees on component mount or when filters change
  useEffect(() => {
    fetchAttendees();
  }, [selectedEventId, pagination.page, pagination.limit]);

  const fetchEvents = async () => {
    setEventsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const eventsData = await response.json();
      const validEvents = eventsData.filter((event: { eventId: string; name?: string }) => 
        event && event.eventId
      );
      
      setEvents(validEvents.map((event: { eventId: string; name?: string }) => ({
        id: event.eventId,
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
    try {
      if (selectedEventId) {
        const response = await getScannedAttendeesByEvent(selectedEventId, {
          page: pagination.page,
          limit: pagination.limit
        });
        setAttendees(response.data || []);
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.total || 0,
          totalPages: response.pagination?.totalPages || 1
        }));
      } else {
        const response = await getScannedAttendees({
          page: pagination.page,
          limit: pagination.limit
        });
        setAttendees(response.data || []);
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.total || 0,
          totalPages: response.pagination?.totalPages || 1
        }));
      }
    } catch (error) {
      console.error('Error fetching attendees:', error);
      toast.error('Failed to load attendees. Please make sure you are logged in.');
    } finally {
      setLoading(false);
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

  const handleExportScannedAttendees = async () => {
    try {
      if (attendees.length === 0) {
        toast.error("No attendees to export");
        return;
      }

      // Create new jsPDF instance - use landscape for better table formatting
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Set document properties
      const eventTitle = selectedEventId 
        ? events.find(e => e.id === selectedEventId)?.name || "Event"
        : "All Events";
      const currentDate = format(new Date(), "MMMM d, yyyy");

      // Convert the imported logo to a base64 string
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Set canvas dimensions to match the image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the image on the canvas
        ctx?.drawImage(img, 0, 0);

        // Get the base64 data URL
        const logoDataUrl = canvas.toDataURL("image/png");

        // Add logo to PDF (adjust positioning and size as needed)
        doc.addImage(logoDataUrl, "PNG", 14, 15, 30, 30);

        // Continue with the rest of the PDF generation
        finalizePdf(logoDataUrl);
      };

      // Set the src to trigger the onload event
      img.src = logo.src;

      function finalizePdf(logoDataUrl: string) {
        // Add border around the entire page
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

        // Add title and introduction - position to the right of the logo
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.text(`${eventTitle} - Scanned Attendees`, 50, 25);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text(`Generated on: ${currentDate}`, 50, 35);

        // Add introduction text
        doc.setFontSize(12);
        const introText =
          "This document contains the list of all scanned attendees for the event. Contact the event organizer with any questions.";

        // Split long text to multiple lines
        const splitIntro = doc.splitTextToSize(introText, 250);
        doc.text(splitIntro, 14, 50);

        // Define table columns with explicit widths
        const columns = [
          { header: "Full Name", width: 45 },
          { header: "Check-in Time", width: 45 },
          { header: "Contact", width: 60 },
          { header: "Organization", width: 50 },
          { header: "Bank Details", width: 60 },
        ];

        // Prepare table data
        const tableData = attendees.map((attendee) => [
          attendee.name,
          format(new Date(attendee.checkInTime), "MMM d, yyyy h:mm a"),
          `${attendee.phoneNumber || 'N/A'}\n${attendee.email || 'N/A'}`,
          attendee.organization || "N/A",
          attendee.bankName && attendee.bankAccountNumber 
            ? `${attendee.bankName}\n${attendee.bankAccountNumber}`
            : "Not provided",
        ]);

        // Table positioning
        const startY = 65;
        const startX = 14;
        const rowHeight = 12;
        let currentY = startY;

        // Calculate total width
        const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);

        // Draw table headers
        doc.setFillColor(20, 36, 104); // RNIT dark blue
        doc.setTextColor(255, 255, 255); // White text
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);

        // Draw header background
        doc.rect(startX, currentY, totalWidth, rowHeight, "F");

        // Draw header text
        let currentX = startX;
        columns.forEach((column) => {
          doc.text(column.header, currentX + 4, currentY + rowHeight / 2, {
            baseline: "middle",
          });
          currentX += column.width;
        });

        // Draw header separator lines
        currentX = startX;
        for (let i = 0; i < columns.length - 1; i++) {
          currentX += columns[i].width;
          doc.setDrawColor(255);
          doc.line(currentX, currentY, currentX, currentY + rowHeight);
        }

        // Move to data rows
        currentY += rowHeight;

        // Draw data rows
        doc.setTextColor(0);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        let pageHasContent = true;

        for (let i = 0; i < tableData.length; i++) {
          // Check if we need a new page
          if (currentY + rowHeight > pageHeight - 20) {
            // Add page number to the current page
            addPageNumber();

            // Add a new page
            doc.addPage();
            pageHasContent = true;

            // Reset Y position
            currentY = 20;

            // Add header and logo to the new page
            if (logoDataUrl) {
              doc.addImage(logoDataUrl, "PNG", 14, 15, 20, 20);
            }

            doc.setFont("helvetica", "bold");
            doc.setFontSize(16);
            doc.setTextColor(0);
            doc.text(`${eventTitle} - Scanned Attendees (continued)`, 40, 25);

            // Redraw table headers
            currentY = 40;

            // Draw header background
            doc.setFillColor(20, 36, 104);
            doc.setTextColor(255, 255, 255);
            doc.rect(startX, currentY, totalWidth, rowHeight, "F");

            // Draw header text
            currentX = startX;
            columns.forEach((column) => {
              doc.text(column.header, currentX + 4, currentY + rowHeight / 2, {
                baseline: "middle",
              });
              currentX += column.width;
            });

            // Draw header separator lines
            currentX = startX;
            for (let j = 0; j < columns.length - 1; j++) {
              currentX += columns[j].width;
              doc.setDrawColor(255);
              doc.line(currentX, currentY, currentX, currentY + rowHeight);
            }

            // Move to data rows
            currentY += rowHeight;
          }

          // Set row background color (alternating)
          if (i % 2 === 0) {
            doc.setFillColor(240, 240, 245); // Light blue-gray
          } else {
            doc.setFillColor(255, 255, 255); // White
          }

          // Draw row background
          doc.rect(startX, currentY, totalWidth, rowHeight, "F");

          // Draw cells with data
          currentX = startX;
          for (let j = 0; j < tableData[i].length; j++) {
            // Make sure text fits in cell
            const text = tableData[i][j].toString();
            const textWidth =
              (doc.getStringUnitWidth(text) * doc.getFontSize()) /
              doc.internal.scaleFactor;

            if (textWidth > columns[j].width - 8) {
              // Text is too long, truncate with ellipsis
              let truncated = text;
              while (
                (doc.getStringUnitWidth(truncated + "...") *
                  doc.getFontSize()) /
                  doc.internal.scaleFactor >
                  columns[j].width - 8 &&
                truncated.length > 0
              ) {
                truncated = truncated.slice(0, -1);
              }
              truncated += "...";
              doc.text(truncated, currentX + 4, currentY + rowHeight / 2, {
                baseline: "middle",
              });
            } else {
              // Text fits, draw normally
              doc.text(text, currentX + 4, currentY + rowHeight / 2, {
                baseline: "middle",
              });
            }

            currentX += columns[j].width;
          }

          // Draw cell borders
          doc.setDrawColor(200);

          // Draw horizontal line at the bottom of the row
          doc.line(
            startX,
            currentY + rowHeight,
            startX + totalWidth,
            currentY + rowHeight
          );

          // Draw vertical lines for columns
          currentX = startX;
          doc.line(currentX, currentY, currentX, currentY + rowHeight); // Left edge

          for (let j = 0; j < columns.length; j++) {
            currentX += columns[j].width;
            doc.line(currentX, currentY, currentX, currentY + rowHeight);
          }

          // Move to next row
          currentY += rowHeight;
        }

        // Add page number to the last page
        if (pageHasContent) {
          addPageNumber();
        }

        // Helper function to add page numbers
        function addPageNumber() {
          const pageCount = doc.internal.getNumberOfPages();
          const currentPage = doc.internal.getCurrentPageInfo().pageNumber;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(100);
          doc.text(
            `Page ${currentPage} of ${pageCount}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: "center" }
          );
        }

        // Save the PDF
        const sanitizedTitle = eventTitle
          .replace(/\s+/g, "-")
          .replace(/[^a-zA-Z0-9-]/g, "");
        doc.save(`${sanitizedTitle}-scanned-attendees.pdf`);

        toast.success("Scanned attendees exported successfully");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export scanned attendees");
    }
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
              ? 'bg-[#000060] text-white font-medium border-[#000060]' 
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
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Scanned Attendees</h1>
        <p className="text-gray-500">View and manage scanned attendees for events</p>
      </div>
      
      {/* Filters and controls */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <FunnelIcon className="h-4 w-4 mr-1 text-[#000060]" />
              Event Filter:
            </label>
            {eventsLoading ? (
              <div className="flex items-center space-x-2">
                <div className="h-10 w-48 bg-gray-200 animate-pulse rounded-md"></div>
                <div className="animate-spin h-4 w-4 text-[#000060]">
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
                value={selectedEventId || 'all'}
                className="border rounded-md px-4 py-2 w-full md:w-64 bg-white text-gray-800 shadow-sm focus:border-[#000060] focus:ring focus:ring-[#000060] focus:ring-opacity-50 outline-none transition-all"
              >
                <option key="all-events" value="all">All Events</option>
                {events.map((event) => (
                  <option key={`event-${event.id}`} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <ListBulletIcon className="h-4 w-4 mr-1 text-[#000060]" />
              Records per page:
            </label>
            <select 
              title="Records per page"
              value={pagination.limit} 
              onChange={handleLimitChange}
              className="border rounded-md px-4 py-2 w-full md:w-48 bg-white text-gray-800 shadow-sm focus:border-[#000060] focus:ring focus:ring-[#000060] focus:ring-opacity-50 transition-all"
            >
              <option value="10">10 records</option>
              <option value="25">25 records</option>
              <option value="50">50 records</option>
              <option value="100">100 records</option>
            </select>
          </div>
          
          <div className="w-full md:w-auto mt-4 md:mt-0 flex space-x-3">
            <button 
              onClick={fetchAttendees}
              className="w-full md:w-auto cursor-pointer bg-[#000060] text-white px-4 py-2 rounded-md hover:bg-[#00004c] focus:outline-none focus:ring-2 focus:ring-[#000060] focus:ring-opacity-50 shadow-md transition-all flex items-center justify-center"
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

            <button
              onClick={handleExportScannedAttendees}
              disabled={attendees.length === 0}
              className={`inline-flex cursor-pointer items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                attendees.length === 0
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              }`}
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Export Attendees ({attendees.length})
            </button>
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#E1FAFA] rounded-lg px-4 py-3">
          <h3 className="text-sm font-medium text-gray-500">Total Attendees</h3>
          <p className="text-2xl font-bold text-[#000060]">{pagination.total}</p>
        </div>
        
        <div className="bg-[#E1FAFA] rounded-lg px-4 py-3">
          <h3 className="text-sm font-medium text-gray-500">Current Page</h3>
          <p className="text-2xl font-bold text-[#000060]">{pagination.page} of {pagination.totalPages}</p>
        </div>
        
        <div className="bg-[#E1FAFA] rounded-lg px-4 py-3">
          <h3 className="text-sm font-medium text-gray-500">Active Filter</h3>
          <p className="text-xl font-bold text-[#000060] truncate">{getSelectedEventName()}</p>
        </div>
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center my-12">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-[#000060] animate-spin"></div>
            <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-4 border-b-4 border-blue-200 animate-ping opacity-20"></div>
          </div>
          <p className="mt-6 text-gray-600 text-lg font-medium">Loading attendees...</p>
          <p className="text-gray-500 text-sm">This may take a moment</p>
        </div>
      )}
      
      {/* Attendees table */}
      {!loading && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          {attendees.length === 0 ? (
            <div className="p-12 text-center">
              <UserGroupIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-xl text-gray-600 font-medium">No attendees found</p>
              <p className="text-gray-500 mt-2">Try changing your filters or check back later.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-[#E1FAFA] to-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <UserGroupIcon className="h-4 w-4 mr-1 text-[#000060]" />
                        Name
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1 text-[#000060]" />
                        Check-in Time
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <PhoneIcon className="h-4 w-4 mr-1 text-[#000060]" />
                        Contact
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <BanknotesIcon className="h-4 w-4 mr-1 text-[#000060]" />
                        Bank Details
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendees.map((attendee) => (
                    <tr key={attendee.id} className="hover:bg-[#E1FAFA]/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-[#E1FAFA] rounded-full flex items-center justify-center">
                            <span className="text-[#000060] font-medium text-sm">
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
                        <div className="text-sm">
                          {attendee.bankName && attendee.bankAccountNumber ? (
                            <div>
                              <div className="text-gray-900">
                                <span className="font-medium">Bank:</span> {attendee.bankName}
                              </div>
                              <div className="text-gray-900">
                                <span className="font-medium">Account:</span> {attendee.bankAccountNumber}
                              </div>
                            </div>
                          ) : (
                            <div className="flex">
                              <span className="text-gray-500 italic">Not provided</span>
                              {/* <button className="ml-2 text-[#000060] hover:text-[#00004c] text-sm">
                                <PencilIcon className="h-4 w-4 inline" />
                                <span className="ml-1">Add</span>
                              </button> */}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* Pagination */}
      {!loading && attendees.length > 0 && renderPagination()}
      
      {/* Summary */}
      {!loading && attendees.length > 0 && (
        <div className="mt-4 mb-8 text-sm text-gray-600 text-center bg-[#E1FAFA] p-2 rounded-lg shadow-sm inline-block mx-auto">
          <div className="flex items-center justify-center">
            <UserGroupIcon className="h-4 w-4 mr-1 text-[#000060]" />
            Showing {attendees.length} of {pagination.total} attendees | Page {pagination.page} of {pagination.totalPages}
          </div>
        </div>
      )}
    </div>
  );
}
