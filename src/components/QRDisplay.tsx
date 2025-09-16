import React, { useEffect, useState, useRef } from 'react';
import { generatePublicKeyQR } from '../utils/qrCodeUtils';
import { chunkData, type ChunkedData } from '../utils/qrChunking';

interface QRDisplayProps {
  data: string;
  title: string;
  description: string;
  onClose: () => void;
  additionalButton?: React.ReactNode;
}

export const QRDisplay: React.FC<QRDisplayProps> = ({ data, title, description, onClose, additionalButton }) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [chunkedData, setChunkedData] = useState<ChunkedData | null>(null);
  const [currentChunkIndex, setCurrentChunkIndex] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const initializeQR = async () => {
      try {
        setLoading(true);
        
        // Check if data needs chunking
        const chunks = chunkData(data);
        setChunkedData(chunks);
        setCurrentChunkIndex(0);
        
        // Generate QR for first chunk or single data
        const initialData = chunks.isChunked ? chunks.chunks[0].data : data;
        const qrDataUrl = await generatePublicKeyQR(initialData, {
          size: 600,
          errorCorrectionLevel: 'M',
          margin: 1
        });
        setQrCodeDataUrl(qrDataUrl);
        
        // Set up animation for chunked data
        if (chunks.isChunked && chunks.chunks.length > 1) {
          intervalRef.current = setInterval(async () => {
            setCurrentChunkIndex(prevIndex => {
              const nextIndex = (prevIndex + 1) % chunks.chunks.length;
              
              // Generate QR for next chunk
              generatePublicKeyQR(chunks.chunks[nextIndex].data, {
                size: 600,
                errorCorrectionLevel: 'M',
                margin: 1
              }).then(qrDataUrl => {
                setQrCodeDataUrl(qrDataUrl);
              }).catch(error => {
                console.error('Failed to generate QR code for chunk:', error);
              });
              
              return nextIndex;
            });
          }, 200);
        }
      } catch (error) {
        console.error('Failed to generate QR code:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeQR();
    
    // Cleanup interval on unmount or data change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [data]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(data);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'auto'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#1565c0',
        color: 'white',
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <button
          onClick={onClose}
          style={{
            backgroundColor: 'transparent',
            border: '2px solid white',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'all 0.2s ease'
          }}
        >
          Close
        </button>
      </div>

      {/* QR Code Display */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '40px 20px'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center' }}>
            <p>Generating QR code...</p>
          </div>
        ) : (
          <>
            <div style={{
              marginBottom: '30px',
              textAlign: 'center'
            }}>
              <p>{description}</p>
              {chunkedData?.isChunked && (
                <div style={{
                  marginTop: '15px',
                  padding: '10px',
                  backgroundColor: '#e3f2fd',
                  borderRadius: '8px',
                  border: '1px solid #2196f3'
                }}>
                  <p style={{ 
                    margin: '0 0 5px 0', 
                    fontSize: '14px', 
                    fontWeight: 'bold',
                    color: '#1976d2'
                  }}>
                    Animated QR Code
                  </p>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '12px',
                    color: '#666'
                  }}>
                    Chunk {currentChunkIndex + 1} of {chunkedData.chunks.length}
                  </p>
                </div>
              )}
            </div>

            {qrCodeDataUrl && (
              <div style={{
                padding: '20px',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                textAlign: 'center',
                border: '1px solid #e0e0e0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <img
                  src={qrCodeDataUrl}
                  alt="Public Key QR Code"
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '8px'
                  }}
                />
              </div>
            )}

            <div style={{
              marginTop: '30px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '10px',
              maxWidth: '640px',
              width: '100%'
            }}>
              <div style={{
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontFamily: 'monospace',
                backgroundColor: '#ffffff',
                padding: '15px',
                borderRadius: '8px',
                fontSize: '14px',
                border: '1px solid #e0e0e0',
                color: '#333333'
              }}>
                {data}
              </div>

              <button
                onClick={copyToClipboard}
                style={{
                  backgroundColor: '#2e7d32',
                  color: 'white',
                  border: 'none',
                  padding: '15px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
              >
                Copy
              </button>
            </div>
          </>
        )}
        {additionalButton}
      </div>
    </div>
  );
};