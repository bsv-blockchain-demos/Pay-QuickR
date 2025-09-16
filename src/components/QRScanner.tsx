import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { openPreferredBackCamera } from '../utils/camera';
import { parseQRChunk, ChunkCollector } from '../utils/qrChunking';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
  scanWhat: 'Identity Key' | 'Transaction';
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose, scanWhat }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const chunkCollectorRef = useRef<ChunkCollector>(new ChunkCollector());
  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [chunkProgress, setChunkProgress] = useState<{ collected: number; total: number; id: string } | null>(null);

  useEffect(() => {
    let isMounted = true;
    let mediaStream: MediaStream | null = null;
    
    const initScanner = async () => {
      if (!videoRef.current || !isMounted) return;

      try {
        // Try to get the preferred back camera stream
        mediaStream = await openPreferredBackCamera();
        if (!isMounted) {
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }

        // Set the stream to the video element
        videoRef.current.srcObject = mediaStream;
        
        setHasCamera(true);

        const scanner = new QrScanner(
          videoRef.current,
          (result) => {
            if (!isMounted) return;
            
            const qrData = result.data;
            
            // Check if this is a chunked QR code
            const chunk = parseQRChunk(qrData);
            
            if (chunk) {
              // This is a chunked QR code
              const completeData = chunkCollectorRef.current.addChunk(chunk);
              
              // Update progress
              const progress = chunkCollectorRef.current.getProgress(chunk.id);
              if (progress) {
                setChunkProgress({
                  collected: progress.collected,
                  total: progress.total,
                  id: chunk.id
                });
              }
              
              if (completeData) {
                // All chunks collected, return complete data
                onScan(completeData);
                scanner.stop();
              }
              // Continue scanning for more chunks
            } else {
              // Regular QR code, return immediately
              onScan(qrData);
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
        if (mediaStream) {
          mediaStream.getTracks().forEach(track => track.stop());
        }
      }
    };

    // Add a small delay to ensure the video element is properly mounted
    const timeoutId = setTimeout(initScanner, 100);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
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
        <div>
          <h2 style={{ color: 'white', margin: 0 }}>Scan {scanWhat}</h2>
          {chunkProgress && (
            <div style={{
              marginTop: '8px',
              padding: '8px 12px',
              backgroundColor: 'rgba(33, 150, 243, 0.2)',
              borderRadius: '4px',
              border: '1px solid #2196f3'
            }}>
              <p style={{ 
                color: 'white', 
                margin: 0, 
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                Collecting chunks: {chunkProgress.collected}/{chunkProgress.total}
              </p>
            </div>
          )}
        </div>
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
      </div>
    </div>
  );
};