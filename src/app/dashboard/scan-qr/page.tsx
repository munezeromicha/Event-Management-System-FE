'use client';

import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import QRScanner from '@/components/scan/QRScanner';
import { Toaster } from 'react-hot-toast';
import { toast } from 'react-hot-toast';
import { QrCodeIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ScanResult {
  success: boolean;
  message: string;
  attendance: {
    id: string;
    name: string;
    checkInTime: string;
    bankAccountNumber?: string;
    phoneNumber?: string;
    email?: string;
    organization?: string;
  };
  alreadyExists?: boolean;
}

export default function ScanPage() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Handle page visibility to manage camera properly
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('Page hidden - camera will be managed by QRScanner component');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Process the QR code directly in the page component to have more control
  const processQRCode = useCallback(async (decodedText: string) => {
    if (isProcessing) return; // Prevent duplicate processing
    
    setIsProcessing(true);
    
    try {
      // Parse the QR data
      let qrData;
      try {
        qrData = JSON.parse(decodedText);
      } catch (error) {
        toast.error('Invalid QR code format');
        console.error('Failed to parse QR code:', error);
        setIsProcessing(false);
        return;
      }

      // Validate required fields from updated QR code format
      if (!qrData.registrationId || !qrData.eventId) {
        toast.error('Missing required information in QR code');
        console.error('Missing required fields in QR data:', qrData);
        setIsProcessing(false);
        return;
      }

      // Send to backend API
      const response = await axios.post('http://localhost:3000/api/attendance/scan', {
        qrCode: decodedText // Send raw QR data - our updated backend will parse it correctly
      });

      // Handle success
      const result = response.data;
      
      setIsScanning(false);
      setScanResult({
        success: true,
        message: result.message || 'Attendance recorded successfully',
        attendance: {
          id: result.attendance.id,
          name: result.attendance.name,
          checkInTime: result.attendance.checkInTime,
          bankAccountNumber: result.attendance.bankAccountNumber || '',
          phoneNumber: result.attendance.phoneNumber || '',
          email: result.attendance.email || '',
          organization: result.attendance.organization || ''
        },
        alreadyExists: result.alreadyExists || false
      });
      
      if (result.alreadyExists) {
        toast(`${result.attendance.name} already checked in`, {
          icon: '🔵',
          style: {
            backgroundColor: '#EFF6FF', 
            color: '#1E40AF' 
          }
        });
      } else {
        toast.success(`${result.attendance.name} checked in successfully!`);
      }
      
    } catch (error: unknown) {
      console.error('API error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process QR code';
      toast.error(errorMessage);
      
      setIsScanning(true);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);

  const handleScanSuccess = (decodedText: string) => {
    if (!isProcessing) {
      processQRCode(decodedText);
    }
  };

  const handleScanError = (error: string) => {
    console.error('Scan error:', error);
  };

  const handleScanAgain = () => {
    setScanResult(null);
    setIsScanning(true);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#000060] rounded-full mb-4">
            <QrCodeIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Attendance Scanner</h1>
          <p className="text-gray-600">Scan QR codes to record event attendance</p>
        </div>
        
        {isScanning ? (
          <div className="space-y-6">
            {/* Processing Indicator */}
            {isProcessing && (
              <div className="bg-[#000060] text-white p-4 rounded-lg shadow-lg">
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  <span className="font-medium">Processing scan...</span>
                </div>
              </div>
            )}
            
            {/* QR Scanner */}
            <QRScanner 
              onScanSuccess={handleScanSuccess}
              onScanFailure={handleScanError}
            />
            
            {/* Instructions */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">How to use the scanner:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-[#000060] rounded-full mt-2 flex-shrink-0"></div>
                  <span>Click "Start Camera" to begin scanning</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-[#000060] rounded-full mt-2 flex-shrink-0"></div>
                  <span>Position the QR code within the scanning frame</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-[#000060] rounded-full mt-2 flex-shrink-0"></div>
                  <span>Keep the camera steady and well-lit</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-[#000060] rounded-full mt-2 flex-shrink-0"></div>
                  <span>Click "Stop Camera" when finished</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          scanResult && (
            <div className="max-w-md mx-auto">
              {/* Result Card */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className={`p-4 ${scanResult.alreadyExists ? 'bg-yellow-50 border-b border-yellow-200' : 'bg-green-50 border-b border-green-200'}`}>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {scanResult.alreadyExists ? (
                      <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
                    ) : (
                      <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    )}
                    <h2 className={`text-lg font-semibold ${scanResult.alreadyExists ? 'text-yellow-800' : 'text-green-800'}`}>
                      {scanResult.alreadyExists ? 'Already Checked In' : 'Successfully Checked In'}
                    </h2>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Attendance Information</h3>
                  
                  <div className="space-y-3">
                    {/* Name */}
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <span className="font-medium text-gray-700 w-24 mb-1 sm:mb-0">Name:</span>
                      <span className="text-gray-900 font-semibold">{scanResult.attendance.name}</span>
                    </div>
                    
                    {/* Check-in Time */}
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <span className="font-medium text-gray-700 w-24 mb-1 sm:mb-0">Time:</span>
                      <span className="text-gray-900">{new Date(scanResult.attendance.checkInTime).toLocaleString()}</span>
                    </div>
                    
                    {/* Optional Fields */}
                    {scanResult.attendance.phoneNumber && (
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <span className="font-medium text-gray-700 w-24 mb-1 sm:mb-0">Phone:</span>
                        <span className="text-gray-900">{scanResult.attendance.phoneNumber}</span>
                      </div>
                    )}
                    
                    {scanResult.attendance.email && (
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <span className="font-medium text-gray-700 w-24 mb-1 sm:mb-0">Email:</span>
                        <span className="text-gray-900">{scanResult.attendance.email}</span>
                      </div>
                    )}
                    
                    {scanResult.attendance.organization && (
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <span className="font-medium text-gray-700 w-24 mb-1 sm:mb-0">Organization:</span>
                        <span className="text-gray-900">{scanResult.attendance.organization}</span>
                      </div>
                    )}
                    
                    {scanResult.attendance.bankAccountNumber && (
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <span className="font-medium text-gray-700 w-24 mb-1 sm:mb-0">Bank Account:</span>
                        <span className="text-gray-900">{scanResult.attendance.bankAccountNumber}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Scan Again Button */}
                  <button
                    onClick={handleScanAgain}
                    className="mt-6 w-full bg-[#000060] hover:bg-[#000080] text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#000060] focus:ring-opacity-50"
                  >
                    Scan Another Code
                  </button>
                </div>
              </div>
            </div>
          )
        )}
        
        {/* Toast Container */}
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#333',
              border: '1px solid #ddd',
              borderRadius: '8px',
            },
          }}
        />
      </div>
    </div>
  );
}