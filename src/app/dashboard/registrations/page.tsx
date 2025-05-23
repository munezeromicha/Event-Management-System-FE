"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CheckIcon,
  XMarkIcon,
  XCircleIcon,
  FunnelIcon,
  ArrowPathIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  UserPlusIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import "jspdf-autotable";
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
    };
  }
}

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
  status: "pending" | "approved" | "rejected";
  registrationDate: string;
  passport: string;
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
  status: "pending" | "approved" | "rejected";
  registrationDate: string;
  passport: string;
}

interface Event {
  eventId: string;
  name: string;
  eventType: string;
  dateTime: string;
  location: string;
  description: string;
  maxCapacity: number;
  financialSupportOption: boolean;
}

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<Registration["status"] | "all">(
    "pending"
  );
  const [badgeLoading, setBadgeLoading] = useState<Record<string, boolean>>({});
  const [bulkActionLoading, setBulkActionLoading] = useState<boolean>(false);
  const [bulkBadgeLoading, setBulkBadgeLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [selectedRegistrations, setSelectedRegistrations] = useState<
    Set<string>
  >(new Set());

  // New state for manual registration
  const [showManualRegistration, setShowManualRegistration] = useState(false);
  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [manualRegistrationForm, setManualRegistrationForm] = useState({
    eventId: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    nationalId: "",
    passport: "",
    organization: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idType, setIdType] = useState<"nationalId" | "passport">("nationalId");

  const fetchRegistrations = useCallback(async () => {
    // Prevent multiple rapid requests
    const now = Date.now();
    if (now - lastFetchTime < 2000) {
      // 2 second cooldown
      return;
    }
    setLastFetchTime(now);

    setRefreshing(true);
    try {
      const response = await fetch("http://localhost:3000/api/registrations", {
        headers: getAuthHeaders(),
      });

      if (response.status === 429) {
        // Handle rate limiting
        const retryAfter = response.headers.get("Retry-After");
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 5000;

        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
            fetchRegistrations();
          }, waitTime);
          return;
        } else {
          toast.error("Too many requests. Please try again later.");
          return;
        }
      }

      if (!response.ok) throw new Error("Failed to fetch registrations");

      const data = await response.json();

      const formattedData = data.map((reg: RawRegistration) => ({
        ...reg,
        id: reg.id || reg.registrationId,
        registrationId: reg.registrationId || reg.id,
      }));

      setRegistrations(formattedData);
      setRetryCount(0); // Reset retry count on success
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load registrations. Please try again later.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [lastFetchTime, retryCount]);

  // Fetch available events for manual registration
  const fetchEvents = useCallback(async () => {
    setIsLoadingEvents(true);
    try {
      const response = await fetch("http://localhost:3000/api/events", {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to fetch events");

      const data = await response.json();
      setAvailableEvents(data);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load events. Please try again later.";
      toast.error(errorMessage);
    } finally {
      setIsLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistrations();
    // Fetch events when component mounts
    fetchEvents();
  }, [fetchRegistrations, fetchEvents]);

  // Handler for manual registration form input changes
  const handleManualRegistrationInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    console.log("Form input change:", { name, value });
    setManualRegistrationForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handler for ID type selection
  const handleIdTypeChange = (type: "nationalId" | "passport") => {
    setIdType(type);
    // Clear the value of the previous ID type
    setManualRegistrationForm((prev) => ({
      ...prev,
      nationalId: type === "nationalId" ? prev.nationalId : "",
      passport: type === "passport" ? prev.passport : "",
    }));
  };

  // Handler for manual registration submission
  const handleManualRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Selected event ID:", manualRegistrationForm.eventId);
      console.log("Available events:", availableEvents);

      if (!manualRegistrationForm.eventId) {
        toast.error("Please select an event");
        setIsSubmitting(false);
        return;
      }

      // Get the selected event information
      const selectedEvent = availableEvents.find(
        (event) => event.eventId === manualRegistrationForm.eventId
      );

      console.log("Selected event:", selectedEvent);

      if (!selectedEvent) {
        toast.error("Please select a valid event");
        setIsSubmitting(false);
        return;
      }

      // Prepare the registration data
      const registrationData = {
        eventId: selectedEvent.eventId,
        fullName: manualRegistrationForm.fullName,
        email: manualRegistrationForm.email,
        phoneNumber: manualRegistrationForm.phoneNumber,
        nationalId:
          idType === "nationalId" ? manualRegistrationForm.nationalId : "",
        passport: idType === "passport" ? manualRegistrationForm.passport : "",
        organization: manualRegistrationForm.organization,
      };

      console.log("Submitting registration data:", registrationData);

      // Submit the registration
      const response = await fetch(
        `http://localhost:3000/api/registrations/${selectedEvent.eventId}/register`,
        {
          method: "POST",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(registrationData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to register attendee");
      }

      // Show success message
      toast.success("Attendee registered successfully");

      // Clear the form
      setManualRegistrationForm({
        eventId: "",
        fullName: "",
        email: "",
        phoneNumber: "",
        nationalId: "",
        passport: "",
        organization: "",
      });

      // Close the form and refresh registrations
      setShowManualRegistration(false);
      await fetchRegistrations();
    } catch (error: unknown) {
      console.error("Registration error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to register attendee. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAuthHeaders = () => {
    const token = Cookies.get("authToken");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const handleStatusChange = async (
    registrationId: string,
    action: "approve" | "reject"
  ) => {
    try {
      const endpoint =
        action === "approve"
          ? `http://localhost:3000/api/registrations/${registrationId}/approve`
          : `http://localhost:3000/api/registrations/${registrationId}/reject`;

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error(`Failed to ${action} registration`);

      toast.success(`Registration ${action}d successfully`);
      await fetchRegistrations();
    } catch {
      toast.error(`Failed to ${action} registration. Please try again.`);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = filteredRegistrations.map((reg) => reg.registrationId);
      setSelectedRegistrations(new Set(allIds));
    } else {
      setSelectedRegistrations(new Set());
    }
  };

  const handleSelectRegistration = (
    registrationId: string,
    checked: boolean
  ) => {
    const newSelected = new Set(selectedRegistrations);
    if (checked) {
      newSelected.add(registrationId);
    } else {
      newSelected.delete(registrationId);
    }
    setSelectedRegistrations(newSelected);
  };

  const handleBulkStatusChange = async (action: "approve" | "reject") => {
    setBulkActionLoading(true);

    // Get selected registrations that are pending
    const selectedPendingRegistrations = registrations.filter(
      (reg) =>
        selectedRegistrations.has(reg.registrationId) &&
        reg.status === "pending"
    );

    if (selectedPendingRegistrations.length === 0) {
      toast.error("No pending registrations selected");
      setBulkActionLoading(false);
      return;
    }

    try {
      // Confirm the bulk action
      if (
        !window.confirm(
          `Are you sure you want to ${action} ${selectedPendingRegistrations.length} selected registrations?`
        )
      ) {
        setBulkActionLoading(false);
        return;
      }

      // Process all selected pending registrations
      let successCount = 0;
      let failureCount = 0;

      for (const registration of selectedPendingRegistrations) {
        const endpoint =
          action === "approve"
            ? `http://localhost:3000/api/registrations/${registration.registrationId}/approve`
            : `http://localhost:3000/api/registrations/${registration.registrationId}/reject`;

        try {
          const response = await fetch(endpoint, {
            method: "PATCH",
            headers: getAuthHeaders(),
          });

          if (response.ok) {
            successCount++;
          } else {
            failureCount++;
          }
        } catch {
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

      // Clear selection and refresh the registration list
      setSelectedRegistrations(new Set());
      await fetchRegistrations();
    } catch {
      toast.error(`Failed to process bulk ${action}. Please try again.`);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleGenerateBadge = async (registrationId: string) => {
    // Set loading state for this specific badge
    setBadgeLoading((prev) => ({ ...prev, [registrationId]: true }));

    try {
      // First, request badge generation
      const generateResponse = await fetch(
        `http://localhost:3000/api/badges/registrations/${registrationId}`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        throw new Error(errorData.message || "Failed to generate badge");
      }

      // Then, download the badge with the download=true parameter
      const downloadResponse = await fetch(
        `http://localhost:3000/api/badges/registrations/${registrationId}?download=true`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!downloadResponse.ok) {
        throw new Error("Failed to download badge");
      }

      // Create and download the PDF file
      const blob = await downloadResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `badge-${registrationId}.pdf`;

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL
      window.URL.revokeObjectURL(url);

      toast.success("Badge downloaded successfully");
    } catch (error: unknown) {
      console.error("Badge generation error:", error);
      // toast.error('Failed to generate badge. Please try again.');
    } finally {
      setBadgeLoading((prev) => ({ ...prev, [registrationId]: false }));
    }
  };

  const handleBulkBadgeDownload = async () => {
    setBulkBadgeLoading(true);

    // Get selected approved registrations
    const selectedApprovedRegistrations = registrations.filter(
      (reg) =>
        selectedRegistrations.has(reg.registrationId) &&
        reg.status === "approved"
    );

    if (selectedApprovedRegistrations.length === 0) {
      toast.error("No approved registrations selected");
      setBulkBadgeLoading(false);
      return;
    }

    try {
      // Process all selected approved registrations
      let successCount = 0;
      let failureCount = 0;

      for (const registration of selectedApprovedRegistrations) {
        try {
          // First, request badge generation
          const generateResponse = await fetch(
            `http://localhost:3000/api/badges/registrations/${registration.registrationId}`,
            {
              headers: getAuthHeaders(),
            }
          );

          if (!generateResponse.ok) {
            const errorData = await generateResponse.json();
            throw new Error(errorData.message || "Failed to generate badge");
          }

          // Then, download the badge
          const downloadResponse = await fetch(
            `http://localhost:3000/api/badges/registrations/${registration.registrationId}?download=true`,
            {
              headers: getAuthHeaders(),
            }
          );

          if (!downloadResponse.ok) {
            throw new Error("Failed to download badge");
          }

          // Create and download the PDF file
          const blob = await downloadResponse.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `badge-${registration.registrationId}.pdf`;

          // Append to body, click, and remove
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Clean up the URL
          window.URL.revokeObjectURL(url);

          successCount++;
        } catch (error) {
          console.error(
            `Failed to download badge for ${registration.fullName}:`,
            error
          );
          failureCount++;
        }
      }

      // Update UI with results
      if (successCount > 0) {
        toast.success(`Successfully downloaded ${successCount} badges`);
      }

      if (failureCount > 0) {
        toast.error(`Failed to download ${failureCount} badges`);
      }

      // Clear selection after download
      setSelectedRegistrations(new Set());
    } catch (error) {
      console.error("Bulk badge download error:", error);
      toast.error("Failed to download badges. Please try again.");
    } finally {
      setBulkBadgeLoading(false);
    }
  };

  // Create a function to generate and export PDF with logo and introduction
  // Create a function to generate and export PDF with the imported logo and introduction

  // Create a function to generate and export PDF with the imported logo and introduction

  // Create a function to generate and export PDF with clear table headers and proper cell spacing
  const handleExportApprovedAttendees = async () => {
    try {
      // Filter only approved attendees
      const approvedAttendees = registrations.filter(
        (reg) => reg.status === "approved"
      );

      if (approvedAttendees.length === 0) {
        toast.error("No approved attendees to export");
        return;
      }

      // Create new jsPDF instance - use landscape for better table formatting
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Set document properties
      const eventTitle = approvedAttendees[0]?.eventTitle || "Event";
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

      function finalizePdf(logoDataUrl) {
        // Add border around the entire page
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

        // Add title and introduction - position to the right of the logo
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.text(`${eventTitle} - Approved Attendees`, 50, 25);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text(`Generated on: ${currentDate}`, 50, 35);

        // Add introduction text
        doc.setFontSize(12);
        const introText =
          "This document contains the list of all approved attendees for the event. Contact the event organizer with any questions.";

        // Split long text to multiple lines
        const splitIntro = doc.splitTextToSize(introText, 250);
        doc.text(splitIntro, 14, 50);

        // ======= CUSTOM DRAWING TABLE APPROACH =======
        // This should ensure headers and data are properly aligned

        // Define table columns with explicit widths to prevent overlap
        const columns = [
          { header: "Full Name", width: 45 },
          { header: "Email", width: 60 },
          { header: "Phone", width: 35 },
          { header: "ID / Passport ", width: 40 },
          { header: "Organization", width: 40 },
          { header: "Registration Date", width: 45 },
        ];

        // Prepare table data
        const tableData = approvedAttendees.map((attendee) => [
          attendee.fullName,
          attendee.email,
          attendee.phoneNumber,
          attendee.nationalId || attendee.passport || "N/A",
          attendee.organization || "N/A",
          format(new Date(attendee.registrationDate), "MMM d, yyyy"),
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
            doc.text(`${eventTitle} - Approved Attendees (continued)`, 40, 25);

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
        doc.save(`${sanitizedTitle}-approved-attendees.pdf`);

        toast.success("Approved attendees exported successfully");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export approved attendees");
    }
  };

  const filteredRegistrations = registrations.filter((reg) =>
    filter === "all" ? true : reg.status === filter
  );

  const pendingCount = registrations.filter(
    (reg) => reg.status === "pending"
  ).length;
  const approvedCount = registrations.filter(
    (reg) => reg.status === "approved"
  ).length;
  const rejectedCount = registrations.filter(
    (reg) => reg.status === "rejected"
  ).length;

  const renderActions = (registration: Registration) => (
    <div className="flex items-center space-x-2">
      {registration.status === "pending" && (
        <>
          <button
            onClick={() =>
              handleStatusChange(registration.registrationId, "approve")
            }
            className="text-green-600 hover:text-green-800"
            title="Approve"
          >
            <CheckIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() =>
              handleStatusChange(registration.registrationId, "reject")
            }
            className="text-red-600 cursor-pointer hover:text-red-800"
            title="Reject"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </>
      )}
      {registration.status === "approved" && (
        <button
          onClick={() => handleGenerateBadge(registration.registrationId)}
          className="text-blue-600 hover:text-blue-800"
          title="Generate Badge"
          disabled={badgeLoading[registration.registrationId]}
        >
          {badgeLoading[registration.registrationId] ? (
            <div className="animate-spin h-5 w-5">
              <ArrowPathIcon className="h-5 w-5" />
            </div>
          ) : (
            <PrinterIcon className="h-5 w-5 text-[#000060] cursor-pointer" />
          )}
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="sm:flex sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Event Registrations
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                Review and manage event registration requests
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() =>
                  setShowManualRegistration(!showManualRegistration)
                }
                className="inline-flex cursor-pointer items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#000060] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
              >
                <UserPlusIcon className="h-5 w-5 mr-2" />
                {showManualRegistration
                  ? "Hide Registration Form"
                  : "Manual Registration"}
              </button>

              <button
                onClick={fetchRegistrations}
                disabled={refreshing}
                className="inline-flex cursor-pointer items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
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
                className={`inline-flex items-center cursor-pointer px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  approvedCount === 0
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                }`}
              >
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Export Approved ({approvedCount})
              </button>
            </div>
          </div>

          {/* Manual Registration Form Modal */}
          {showManualRegistration && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              {/* Enhanced blur background */}
              <div className="fixed inset-0 backdrop-blur-md bg-gray-500/75 transition-opacity" />

              {/* Modal content */}
              <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <div className="relative transform overflow-hidden rounded-lg bg-white/95 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-blue-900">
                      <UserPlusIcon className="h-5 w-5 inline mr-2" />
                      Manual Registration Form
                    </h2>
                    <button
                      type="button"
                      onClick={() => setShowManualRegistration(false)}
                      className="text-gray-400 hover:text-gray-500 cursor-pointer"
                      title="Close form"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <form onSubmit={handleManualRegistrationSubmit}>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      {/* Event Selection */}
                      <div className="sm:col-span-3">
                        <label
                          htmlFor="eventId"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Event <span className="text-red-500">*</span>
                        </label>
                        <div className="mt-1">
                          <select
                            id="eventId"
                            name="eventId"
                            required
                            value={manualRegistrationForm.eventId}
                            onChange={handleManualRegistrationInputChange}
                            className="shadow-sm outline-none focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-white text-gray-900 p-2"
                          >
                            {isLoadingEvents ? (
                              <option key="loading" value="" disabled>
                                Loading events...
                              </option>
                            ) : availableEvents.length === 0 ? (
                              <option key="no-events" value="" disabled>
                                No events available
                              </option>
                            ) : (
                              <>
                                <option key="default" value="">
                                  Select an event
                                </option>
                                {availableEvents.map((event) => (
                                  <option
                                    key={event.eventId}
                                    value={event.eventId}
                                  >
                                    {event.name}
                                  </option>
                                ))}
                              </>
                            )}
                          </select>
                        </div>
                      </div>

                      {/* Full Name */}
                      <div className="sm:col-span-3">
                        <label
                          htmlFor="fullName"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            required
                            value={manualRegistrationForm.fullName}
                            onChange={handleManualRegistrationInputChange}
                            className="shadow-sm outline-none focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 p-2"
                            placeholder="Enter full name"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="sm:col-span-3">
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Email <span className="text-red-500">*</span>
                        </label>
                        <div className="mt-1">
                          <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            value={manualRegistrationForm.email}
                            onChange={handleManualRegistrationInputChange}
                            className="shadow-sm outline-none focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 p-2"
                            placeholder="Enter email address"
                          />
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div className="sm:col-span-3">
                        <label
                          htmlFor="phoneNumber"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="mt-1">
                          <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            required
                            value={manualRegistrationForm.phoneNumber}
                            onChange={handleManualRegistrationInputChange}
                            className="shadow-sm p-2 outline-none focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400"
                            placeholder="Enter phone number"
                          />
                        </div>
                      </div>

                      {/* ID Type Selection */}
                      <div className="sm:col-span-6">
                        <label className="block text-sm font-medium text-gray-700">
                          ID Type <span className="text-red-500">*</span>
                        </label>
                        <div className="mt-1 flex space-x-4">
                          <div className="flex items-center">
                            <input
                              id="id-national"
                              name="idType"
                              type="radio"
                              checked={idType === "nationalId"}
                              onChange={() => handleIdTypeChange("nationalId")}
                              className="p-2 outline-none focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                            />
                            <label
                              htmlFor="id-national"
                              className="ml-2 block text-sm text-gray-700"
                            >
                              National ID
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              id="id-passport"
                              name="idType"
                              type="radio"
                              checked={idType === "passport"}
                              onChange={() => handleIdTypeChange("passport")}
                              className="p-2 outline-none focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                            />
                            <label
                              htmlFor="id-passport"
                              className="ml-2 block text-sm text-gray-700"
                            >
                              Passport
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* National ID or Passport */}
                      {idType === "nationalId" ? (
                        <div className="sm:col-span-3">
                          <label
                            htmlFor="nationalId"
                            className="block text-sm font-medium text-gray-700"
                          >
                            National ID <span className="text-red-500">*</span>
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              id="nationalId"
                              name="nationalId"
                              required
                              value={manualRegistrationForm.nationalId}
                              onChange={handleManualRegistrationInputChange}
                              className="p-2 outline-none shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400"
                              placeholder="Enter national ID"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="sm:col-span-3">
                          <label
                            htmlFor="passport"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Passport Number{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              id="passport"
                              name="passport"
                              required
                              value={manualRegistrationForm.passport}
                              onChange={handleManualRegistrationInputChange}
                              className="p-2 outline-none shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400"
                              placeholder="Enter passport number"
                            />
                          </div>
                        </div>
                      )}

                      {/* Organization */}
                      <div className="sm:col-span-3">
                        <label
                          htmlFor="organization"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Organization
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            id="organization"
                            name="organization"
                            value={manualRegistrationForm.organization}
                            onChange={handleManualRegistrationInputChange}
                            className="p-2 outline-none shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400"
                            placeholder="Enter organization name"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowManualRegistration(false)}
                        className="bg-white cursor-pointer py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex cursor-pointer justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {isSubmitting ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4 mr-2 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Registering...
                          </>
                        ) : (
                          <>
                            <PlusCircleIcon className="h-5 w-5 mr-2" />
                            Register Attendee
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="text-blue-800 text-sm font-medium">All</p>
                <p className="text-blue-900 text-xl font-bold">
                  {registrations.length}
                </p>
              </div>
              <button
                onClick={() => setFilter("all")}
                className={`text-blue-700 hover:bg-blue-100 p-2 rounded-full ${
                  filter === "all" ? "bg-blue-100" : ""
                }`}
                title="Filter all registrations"
              >
                <FunnelIcon className="h-5 w-5 cursor-pointer" />
              </button>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="text-yellow-800 text-sm font-medium">Pending</p>
                <p className="text-yellow-900 text-xl font-bold">
                  {pendingCount}
                </p>
              </div>
              <button
                onClick={() => setFilter("pending")}
                className={`text-yellow-700 hover:bg-yellow-100 p-2 rounded-full ${
                  filter === "pending" ? "bg-yellow-100" : ""
                }`}
                title="Filter pending registrations"
              >
                <FunnelIcon className="h-5 w-5 cursor-pointer" />
              </button>
            </div>

            <div className="bg-green-50 rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="text-green-800 text-sm font-medium">Approved</p>
                <p className="text-green-900 text-xl font-bold">
                  {approvedCount}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter("approved")}
                  className={`text-green-700 hover:bg-green-100 p-2 rounded-full ${
                    filter === "approved" ? "bg-green-100" : ""
                  }`}
                  title="Filter approved registrations"
                >
                  <FunnelIcon className="h-5 w-5 cursor-pointer" />
                </button>
                {approvedCount > 0 && (
                  <button
                    onClick={handleBulkBadgeDownload}
                    disabled={
                      bulkBadgeLoading || selectedRegistrations.size === 0
                    }
                    className={`text-green-700 hover:bg-green-100 p-2 rounded-full ${
                      bulkBadgeLoading || selectedRegistrations.size === 0
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    title="Download selected badges"
                  >
                    {bulkBadgeLoading ? (
                      <ArrowPathIcon className="h-5 w-5 animate-spin" />
                    ) : (
                      <PrinterIcon className="h-5 w-5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="text-red-800 text-sm font-medium">Rejected</p>
                <p className="text-red-900 text-xl font-bold">
                  {rejectedCount}
                </p>
              </div>
              <button
                onClick={() => setFilter("rejected")}
                className={`text-red-700 hover:bg-red-100 p-2 rounded-full ${
                  filter === "rejected" ? "bg-red-100" : ""
                }`}
                title="Filter rejected registrations"
              >
                <FunnelIcon className="h-5 w-5 cursor-pointer" />
              </button>
            </div>
          </div>

          {pendingCount > 0 && (
            <div className="flex justify-between items-center space-x-4 mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedRegistrations.size} selected
                </span>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleBulkStatusChange("approve")}
                  disabled={
                    bulkActionLoading || selectedRegistrations.size === 0
                  }
                  className={`inline-flex cursor-pointer items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                    bulkActionLoading || selectedRegistrations.size === 0
                      ? "bg-green-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  }`}
                >
                  {bulkActionLoading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 mr-2 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-5 w-5 mr-2" />
                      Approve Selected ({selectedRegistrations.size})
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleBulkStatusChange("reject")}
                  disabled={
                    bulkActionLoading || selectedRegistrations.size === 0
                  }
                  className={`inline-flex items-center cursor-pointer px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                    bulkActionLoading || selectedRegistrations.size === 0
                      ? "bg-red-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  }`}
                >
                  {bulkActionLoading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 mr-2 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="h-5 w-5 mr-2" />
                      Reject Selected ({selectedRegistrations.size})
                    </>
                  )}
                </button>
              </div>
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
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No registrations found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  No registrations match the current filter.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setFilter("all")}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#000060] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                      <th className="py-3.5 pl-4 pr-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={
                              selectedRegistrations.size ===
                              filteredRegistrations.length
                            }
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            aria-label="Select all registrations"
                            title="Select all registrations"
                          />
                        </div>
                      </th>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                        Attendee
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Event
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Role
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Registration Date
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredRegistrations.map((registration) => (
                      <tr
                        key={registration.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 pl-4 pr-3">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              checked={selectedRegistrations.has(
                                registration.registrationId
                              )}
                              onChange={(e) =>
                                handleSelectRegistration(
                                  registration.registrationId,
                                  e.target.checked
                                )
                              }
                              aria-label={`Select registration for ${registration.fullName}`}
                              title={`Select registration for ${registration.fullName}`}
                            />
                          </div>
                        </td>
                        <td className="py-4 pl-4 pr-3 text-sm">
                          <div className="font-medium text-gray-900">
                            {registration.fullName}
                          </div>
                          <div className="text-gray-500 flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            {registration.email}
                          </div>
                          <div className="text-gray-500 flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                            {registration.phoneNumber}
                          </div>
                          <div className="text-gray-500 flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                              />
                            </svg>
                            ID:{" "}
                            {registration.nationalId || registration.passport}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          <div className="font-medium">
                            {registration.eventTitle}
                          </div>
                          <div className="text-gray-400 flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                              />
                            </svg>
                            Event ID: {registration.eventId}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                            {registration.organization || "Not specified"}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            {format(
                              new Date(registration.registrationDate),
                              "MMM d, yyyy"
                            )}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {format(
                              new Date(registration.registrationDate),
                              "h:mm a"
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold leading-5 ${
                              registration.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : registration.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {registration.status === "pending" && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            )}
                            {registration.status === "approved" && (
                              <CheckIcon className="h-4 w-4 mr-1 cursor-pointer" />
                            )}
                            {registration.status === "rejected" && (
                              <XMarkIcon className="h-4 w-4 mr-1 cursor-pointer" />
                            )}
                            {registration.status}
                          </span>
                        </td>
                        <td className="py-4 pl-3 pr-4 text-sm font-medium sm:pr-6">
                          {renderActions(registration)}
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
