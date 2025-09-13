import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    
    const initScanner = async () => {
      if (!videoRef.current || !isMounted) return;

      try {
        const hasCamera = await QrScanner.hasCamera();
        if (!isMounted) return;
        
        setHasCamera(hasCamera);

        if (!hasCamera) return;

        const scanner = new QrScanner(
          videoRef.current,
          (result) => {
            if (isMounted) {
              onScan(result.data);
              scanner.stop();
            }
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
            maxScansPerSecond: 5,
          }
        );

        scannerRef.current = scanner;
        
        if (!isMounted) {
          scanner.destroy();
          return;
        }
        
        await scanner.start();
        
        if (isMounted) {
          setIsScanning(true);
        }
      } catch (error) {
        console.error('Error initializing scanner:', error);
        if (isMounted) {
          setHasCamera(false);
        }
      }
    };

    // Add a small delay to ensure the video element is properly mounted
    const timeoutId = setTimeout(initScanner, 100);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
        scannerRef.current = null;
      }
    };
  }, [onScan]);

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
    }
    onClose();
  };

  if (!hasCamera) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h2>No Camera Found</h2>
          <p>Camera access is required to scan QR codes.</p>
          <button
            onClick={handleClose}
            style={{
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'black',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ color: 'white', margin: 0 }}>Scan QR Code</h2>
        <button
          onClick={handleClose}
          style={{
            backgroundColor: 'transparent',
            border: '2px solid white',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Close
        </button>
      </div>

      {/* Scanner */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />

        {/* Scanning overlay */}
        {isScanning && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p>Point your camera at a QR code</p>
          </div>
        )}
      </div>
    </div>
  );
};