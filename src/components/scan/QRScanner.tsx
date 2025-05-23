'use client';

import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { toast } from 'react-hot-toast';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, onScanFailure }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const lastScannedCode = useRef<string | null>(null);
  const processingRef = useRef<boolean>(false);

  useEffect(() => {

    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader",
      { 
        fps: 5, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
      },
      false
    );

    scannerRef.current = html5QrcodeScanner;

    const successHandler = async (decodedText: string) => {
      if (processingRef.current || lastScannedCode.current === decodedText) {
        return;
      }
      
      // Set processing flag and last scanned code
      processingRef.current = true;
      lastScannedCode.current = decodedText;
      console.log('QR code scanned:', decodedText);
      
      try {
        setIsLoading(true);
        setIsScanning(false);
        
        try {
          JSON.parse(decodedText);
        } catch (error) {
          console.error('Failed to parse QR code data:', error);
          toast.error('Invalid QR code format');
          onScanFailure?.('Invalid QR code format');
          resetProcessing();
          return;
        }
        
        // Notify parent component of successful scan
        // Let the parent component handle the API call and business logic
        onScanSuccess(decodedText);
        
        // Stop scanner after calling onScanSuccess
        if (scannerRef.current) {
          try {
            scannerRef.current.clear();
          } catch (err) {
            console.error('Error clearing scanner:', err);
          }
        }
        
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        console.error('Processing error:', error);
        toast.error(errorMessage);
        onScanFailure?.(errorMessage);
        resetProcessing();
      } finally {
        setIsLoading(false);
      }
    };

    // Reset processing state and restart scanner
    const resetProcessing = () => {
      setIsLoading(false);
      
      // Reset flags after a delay
      setTimeout(() => {
        processingRef.current = false;
        lastScannedCode.current = null;
        
        // Restart scanner
        setIsScanning(true);
        if (scannerRef.current) {
          try {
            scannerRef.current.render(successHandler, errorHandler);
          } catch (err) {
            console.error('Error restarting scanner:', err);
          }
        }
      }, 2000);
    };

    // Set up error handler
    const errorHandler = (errorMessage: string) => {
      // Ignore "not found" errors which are normal during scanning
      if (!errorMessage.includes('NotFoundException')) {
        console.error('QR scanner error:', errorMessage);
        onScanFailure?.(errorMessage);
      }
    };

    // Start scanning
    setIsScanning(true);
    html5QrcodeScanner.render(successHandler, errorHandler);

    // Cleanup
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (err) {
          console.error('Error clearing scanner:', err);
        }
      }
    };
  }, [onScanSuccess, onScanFailure]);

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-4 relative">
        <h2 className="text-xl font-semibold text-center mb-4">Scan QR Code</h2>
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg z-10">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
              <p>Processing...</p>
            </div>
          </div>
        )}

        {/* Scanner container */}
        <div id="qr-reader" className="w-full aspect-square rounded-lg overflow-hidden"></div>

        {/* Status */}
        <div className="mt-4 text-sm text-gray-600">
          <p className="text-center">
            {isLoading ? 'Processing scan...' : 
             isScanning ? 'Position the QR code within the frame to scan' : 
             'Scanning paused...'}
          </p>
        </div>

        {/* Tips */}
        <div className="mt-2 text-xs text-gray-400 text-center">
          <p>Make sure the QR code is well-lit and in focus</p>
          <p>Hold the camera steady for better scanning</p>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;