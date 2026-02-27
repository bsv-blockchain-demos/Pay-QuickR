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

export const QRDisplay: React.FC<QRDisplayProps> = ({
  data,
  title,
  description,
  onClose,
  additionalButton,
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [chunkedData, setChunkedData] = useState<ChunkedData | null>(null);
  const [currentChunkIndex, setCurrentChunkIndex] = useState<number>(0);
  const [isGeneratingQR, setIsGeneratingQR] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<boolean>(false);

  useEffect(() => {
    const startQRAnimation = async (chunks: ChunkedData) => {
      let chunkIndex = 1; // start from second chunk; first is already displayed

      const animateNextChunk = async () => {
        if (!animationRef.current) return;

        try {
          setIsGeneratingQR(true);
          const currentChunk = chunks.chunks[chunkIndex];

          const qrDataUrl = await generatePublicKeyQR(currentChunk.data, {
            size: 600,
            errorCorrectionLevel: 'M',
            margin: 1,
          });

          if (animationRef.current) {
            setQrCodeDataUrl(qrDataUrl);
            setCurrentChunkIndex(chunkIndex);
          }

          chunkIndex = (chunkIndex + 1) % chunks.chunks.length;
        } catch (error) {
          console.error('Failed to generate QR code for chunk:', error);
        } finally {
          setIsGeneratingQR(false);
        }

        if (animationRef.current) {
          intervalRef.current = setTimeout(animateNextChunk, 200);
        }
      };

      intervalRef.current = setTimeout(animateNextChunk, 200);
    };

    const initializeQR = async () => {
      try {
        setLoading(true);

        const chunks = chunkData(data);
        setChunkedData(chunks);
        setCurrentChunkIndex(0);

        const initialData = chunks.isChunked ? chunks.chunks[0].data : data;
        const qrDataUrl = await generatePublicKeyQR(initialData, {
          size: 600,
          errorCorrectionLevel: 'M',
          margin: 1,
        });
        setQrCodeDataUrl(qrDataUrl);

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

    return () => {
      animationRef.current = false;
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [data]);

  return (
    <div className="qr-screen">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 style={{ margin: 0, fontSize: '1.15rem' }}>{title}</h2>
          {description && (
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {description}
            </p>
          )}
        </div>
        <button
          className="btn btn-ghost"
          style={{ minHeight: 40, padding: '8px 16px', fontSize: 14 }}
          onClick={onClose}
        >
          Close
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '28px 20px',
        }}
      >
        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Generating QR code...</p>
        ) : (
          <>
            {chunkedData?.isChunked && (
              <div
                style={{
                  marginBottom: 16,
                  padding: '10px 16px',
                  background: 'rgba(79,142,247,0.12)',
                  border: '1px solid rgba(79,142,247,0.25)',
                  borderRadius: 10,
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  width: '100%',
                  maxWidth: 480,
                }}
              >
                <span
                  style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-blue)', flex: 1 }}
                >
                  Animated QR
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Chunk {currentChunkIndex + 1} of {chunkedData.chunks.length}
                  {isGeneratingQR && ' ⟳'}
                </span>
              </div>
            )}

            {qrCodeDataUrl && (
              <div
                style={{
                  padding: 16,
                  background: '#fff',
                  borderRadius: 16,
                  maxWidth: 480,
                  width: '100%',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                }}
              >
                <img
                  src={qrCodeDataUrl}
                  alt="QR Code"
                  style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 8 }}
                />
              </div>
            )}
          </>
        )}

        {additionalButton}
      </div>
    </div>
  );
};
