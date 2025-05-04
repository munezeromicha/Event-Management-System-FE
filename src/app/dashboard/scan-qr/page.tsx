'use client';

import { useState, useCallback } from 'react';
import axios from 'axios';
import QRScanner from '@/components/scan/QRScanner';
import { Toaster } from 'react-hot-toast';
import { toast } from 'react-hot-toast';

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

  // Process the QR code directly in the page component to have more control
  const processQRCode = useCallback(async (decodedText: string) => {
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
      
    } catch (error: any) {
      console.error('API error:', error);
      toast.error(error.response?.data?.message || 'Failed to process QR code');
      
      setIsScanning(true);
    } finally {
      setIsProcessing(false);
    }
  }, []);

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
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-700">Event Attendance Scanner</h1>
        
        {isScanning ? (
          <QRScanner 
            onScanSuccess={handleScanSuccess}
            onScanFailure={handleScanError}
          />
        ) : (
          scanResult && (
            <div className="mt-8 max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
              <div className={`mb-4 p-3 rounded-md ${scanResult.alreadyExists ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
                <p className={`font-medium ${scanResult.alreadyExists ? 'text-yellow-700' : 'text-green-700'}`}>
                  {scanResult.alreadyExists ? 'Already Checked In' : 'Successfully Checked In'}
                </p>
              </div>
              
              <h2 className="text-xl font-semibold mb-4">Attendance Information</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {scanResult.attendance.name}</p>
                <p><span className="font-medium">Time:</span> {new Date(scanResult.attendance.checkInTime).toLocaleString()}</p>
                
                {/* Only show fields if they have values */}
                {scanResult.attendance.phoneNumber && (
                  <p><span className="font-medium">Phone:</span> {scanResult.attendance.phoneNumber}</p>
                )}
                
                {scanResult.attendance.email && (
                  <p><span className="font-medium">Email:</span> {scanResult.attendance.email}</p>
                )}
                
                {scanResult.attendance.organization && (
                  <p><span className="font-medium">Organization:</span> {scanResult.attendance.organization}</p>
                )}
                
                {scanResult.attendance.bankAccountNumber && (
                  <p><span className="font-medium">Bank Account:</span> {scanResult.attendance.bankAccountNumber}</p>
                )}
              </div>
              
              <button
                onClick={handleScanAgain}
                className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Scan Another Code
              </button>
            </div>
          )
        )}
        <Toaster position="top-center" />
      </div>
    </div>
  );
}