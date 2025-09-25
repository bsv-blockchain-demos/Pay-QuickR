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

export const QRDisplay: React.FC<QRDisplayProps> = ({ data, additionalButton }) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [chunkedData, setChunkedData] = useState<ChunkedData | null>(null);
  const [currentChunkIndex, setCurrentChunkIndex] = useState<number>(0);
  const [isGeneratingQR, setIsGeneratingQR] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<boolean>(false);

  useEffect(() => {
    const startQRAnimation = async (chunks: ChunkedData) => {
      let chunkIndex = 1; // Start from second chunk since first is already displayed
      
      const animateNextChunk = async () => {
        if (!animationRef.current) return;
        
        try {
          setIsGeneratingQR(true);
          const currentChunk = chunks.chunks[chunkIndex];
          
          // Generate QR for current chunk
          const qrDataUrl = await generatePublicKeyQR(currentChunk.data, {
            size: 600,
            errorCorrectionLevel: 'M',
            margin: 1
          });
          
          // Only update if animation is still active
          if (animationRef.current) {
            setQrCodeDataUrl(qrDataUrl);
            setCurrentChunkIndex(chunkIndex);
          }
          
          // Move to next chunk
          chunkIndex = (chunkIndex + 1) % chunks.chunks.length;
          
        } catch (error) {
          console.error('Failed to generate QR code for chunk:', error);
        } finally {
          setIsGeneratingQR(false);
        }
        
        // Schedule next animation frame if still active
        if (animationRef.current) {
          intervalRef.current = setTimeout(animateNextChunk, 200); // Slightly slower for better visibility
        }
      };
      
      // Start the animation loop
      intervalRef.current = setTimeout(animateNextChunk, 200);
    };

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
          animationRef.current = true;
          startQRAnimation(chunks);
        }
      } catch (error) {
        console.error('Failed to generate QR code:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeQR();
    
    // Cleanup animation on unmount or data change
    return () => {
      animationRef.current = false;
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
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
      overflow: 'none'
    }}>
      {/* QR Code Display */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: '80px 20px'
      }}>

        {loading ? (
          <div style={{ textAlign: 'center' }}>
            <p>Generating QR code...</p>
          </div>
        ) : (
          <>
            <div style={{
              marginBottom: '30px',
              textAlign: 'center',
              width: '100%'
            }}>
              {chunkedData?.isChunked && (
                <div style={{
                  marginTop: '15px',
                  padding: '10px',
                  backgroundColor: '#1976d2',
                  borderRadius: '8px',
                  border: '1px solid #1976d2',
                  display: 'flex',
                  flexDirection: 'row',
                  gap: '10px',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{
                    fontSize: '14px', 
                    fontWeight: 'bold',
                    color: '#e3f2fd',
                    flex: 1
                  }}>
                    Animated QR Code
                  </div>
                  <div style={{ 
                    fontSize: '12px',
                    color: '#e3f2fd',
                    flex: 1
                  }}>
                    Chunk {currentChunkIndex + 1} of {chunkedData.chunks.length}
                    {isGeneratingQR && <span style={{ marginLeft: '8px', color: '#1976d2' }}>⟳</span>}
                  </div>
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

            {/* <div style={{
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
            </div> */}
          </>
        )}
        {additionalButton}
      </div>
    </div>
  );
};