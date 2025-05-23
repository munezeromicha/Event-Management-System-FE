"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  QrCodeIcon,
  // CheckCircleIcon,
  // ExclamationCircleIcon,
  VideoCameraIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import QRScanner from "@/components/scan/QRScanner";

// interface ScanResult {
//   id: string;
//   fullName: string;
//   email: string;
//   scannedAt: string;
//   success: boolean;
//   message: string;
// }

export default function ScanPage() {
  // const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("1");
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Auto-stop camera on tab change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isCameraActive) {
        setIsCameraActive(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isCameraActive]);

  const processScannedCode = async (code: string) => {
    if (!code) {
      toast.error("QR code data is required");
      return;
    }

    try {
      const token = Cookies.get("staffAuthToken");
      if (!token) {
        toast.error("Authentication token not found");
        return;
      }

      toast.loading("Processing badge...", { id: "scan" });

      // Parse the QR code data if it's JSON
      let qrData;
      try {
        qrData = JSON.parse(code);
      } catch {
        // If not JSON, use the raw code
        qrData = { badgeCode: code };
      }

      const response = await fetch("http://localhost:3000/api/attendance/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          qrCode: code, // Send the raw QR code data
          eventId: selectedEvent,
          ...qrData // Include any parsed data
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to process badge");
      }

      // Format the result
      // const result: ScanResult = {
      //   id: data.id || Math.random().toString(36).substring(2, 9),
      //   fullName: data.fullName || data.name || "Unknown",
      //   email: data.email || "unknown@example.com",
      //   scannedAt: new Date().toISOString(),
      //   success: true,
      //   message: data.message || "Badge scanned successfully",
      // };

      // Add to scan results
      // setScanResults((prev) => [result, ...prev]);
      toast.success("Badge scanned successfully!", { id: "scan" });

      // Play success sound
      try {
        const audio = new Audio("/success.mp3");
        await audio.play();
      } catch (error) {
        console.warn("Could not play success sound:", error);
      }

    } catch (error: unknown) {
      console.error("Error processing scanned code:", error);
      
      // Add failed scan to results
      // const failedResult: ScanResult = {
      //   id: Math.random().toString(36).substring(2, 9),
      //   fullName: "Failed Scan",
      //   email: "",
      //   scannedAt: new Date().toISOString(),
      //   success: false,
      //   message: error instanceof Error ? error.message : "Failed to process badge",
      // };
      
      // setScanResults((prev) => [failedResult, ...prev]);
      toast.error(error instanceof Error ? error.message : "Failed to process badge", { id: "scan" });

      // Play error sound
      try {
        const audio = new Audio("/error.mp3");
        await audio.play();
      } catch (error) {
        console.warn("Could not play error sound:", error);
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Badge Scanner</h1>
          <p className="mt-1 text-gray-500">
            Scan attendee badges to record event participation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow rounded-xl overflow-hidden"
        >
          <div className="bg-[#000060] text-white px-6 py-4">
            <div className="flex items-center">
              <QrCodeIcon className="h-5 w-5 mr-2" />
              <h2 className="text-lg font-semibold">Badge Scanner</h2>
            </div>
          </div>

          <div className="p-6">
            {/* Event selector */}
            <div className="mb-6">
              <label htmlFor="event" className="block text-sm font-medium text-gray-700 mb-2">
                Select Event
              </label>
              <select
                id="event"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#000060] focus:border-[#000060] sm:text-sm rounded-md"
              >
                <option value="1">RNIT Annual Investment Conference</option>
                <option value="2">Financial Literacy Workshop</option>
              </select>
            </div>

            {/* Camera control button */}
            <div className="flex justify-center mb-4">
              {!isCameraActive ? (
                <button
                  onClick={() => setIsCameraActive(true)}
                  className="inline-flex items-center px-5 py-2 border border-transparent text-base font-semibold rounded-md shadow-sm text-white bg-[#000060] hover:bg-[#00004c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#000060] transition"
                >
                  <VideoCameraIcon className="h-5 w-5 mr-2" />
                  Start Camera
                </button>
              ) : (
                <button
                  onClick={() => setIsCameraActive(false)}
                  className="inline-flex items-center px-5 py-2 border border-transparent text-base font-semibold rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
                >
                  <XCircleIcon className="h-5 w-5 mr-2" />
                  Stop Camera
                </button>
              )}
            </div>

            {/* Scanner or placeholder */}
            <div className="mb-6">
              {isCameraActive ? (
                <QRScanner
                  onScanSuccess={processScannedCode}
                  onScanFailure={(error) => {
                    console.error('Scan error:', error);
                    toast.error(error);
                  }}
                />
              ) : (
                <div className="w-full aspect-square max-w-md mx-auto bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300" style={{ minHeight: 250 }}>
                  <VideoCameraIcon className="h-12 w-12 mb-2" />
                  <span className="text-lg font-medium">Camera is off</span>
                  <span className="text-sm">Click &quot;Start Camera&quot; to begin scanning</span>
                </div>
              )}
            </div>

          </div>
        </motion.div>

        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white shadow rounded-xl overflow-hidden"
        >
          <div className="bg-[#000060] text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                <h2 className="text-lg font-semibold">Scan Results</h2>
              </div>
              {scanResults.length > 0 && (
                <button
                  onClick={() => setScanResults([])}
                  className="text-xs bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="p-4 max-h-[600px] overflow-y-auto">
            {scanResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <QrCodeIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p>No badges scanned yet</p>
                <p className="text-sm">Scan a badge to see results here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {scanResults.map((result) => (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={result.id}
                    className={`p-4 rounded-lg border ${
                      result.success
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex items-start">
                      <div
                        className={`p-2 rounded-full ${
                          result.success ? "bg-green-200" : "bg-red-200"
                        } mr-3`}
                      >
                        {result.success ? (
                          <CheckCircleIcon
                            className="h-5 w-5 text-green-600"
                            aria-hidden="true"
                          />
                        ) : (
                          <ExclamationCircleIcon
                            className="h-5 w-5 text-red-600"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {result.fullName}
                        </p>
                        {result.email && (
                          <p className="text-sm text-gray-500 truncate">
                            {result.email}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(result.scannedAt).toLocaleTimeString()}
                        </p>
                        <p
                          className={`text-sm mt-1 ${
                            result.success
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {result.message}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div> */}
      </div>
    </div>
  );
}