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
  const [, setIsScanning] = useState<boolean>(false);
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
      <div className="scanner-overlay" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div
          className="glass-card"
          style={{ padding: '40px', textAlign: 'center', maxWidth: 400, margin: 20 }}
        >
          <h2 style={{ color: 'var(--text-primary)', marginTop: 0 }}>No Camera Found</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Camera access is required to scan QR codes.
          </p>
          <button className="btn btn-primary" onClick={handleClose} style={{ marginTop: 8 }}>
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="scanner-overlay">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Scan {scanWhat}</h2>
          {chunkProgress && (
            <div
              style={{
                marginTop: 8,
                padding: '6px 12px',
                background: 'rgba(79,142,247,0.2)',
                border: '1px solid rgba(79,142,247,0.4)',
                borderRadius: 8,
              }}
            >
              <p style={{ color: 'var(--text-primary)', margin: 0, fontSize: 12, fontWeight: 700 }}>
                Collecting chunks: {chunkProgress.collected}/{chunkProgress.total}
              </p>
            </div>
          )}
        </div>
        <button
          className="btn btn-ghost"
          style={{ minHeight: 40, padding: '8px 16px', fontSize: 14 }}
          onClick={handleClose}
        >
          Close
        </button>
      </div>

      {/* Scanner */}
      <div style={{ flex: 1, position: 'relative' }}>
        <video
          ref={videoRef}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    </div>
  );
};