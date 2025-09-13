import React, { useEffect, useState } from 'react';
import { generatePublicKeyQR } from '../utils/qrCodeUtils';

interface QRDisplayProps {
  publicKey: string;
  onClose: () => void;
}

export const QRDisplay: React.FC<QRDisplayProps> = ({ publicKey, onClose }) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const generateQR = async () => {
      try {
        setLoading(true);
        const qrDataUrl = await generatePublicKeyQR(publicKey, {
          size: 600,
          errorCorrectionLevel: 'M',
          margin: 1
        });
        setQrCodeDataUrl(qrDataUrl);
      } catch (error) {
        console.error('Failed to generate QR code:', error);
      } finally {
        setLoading(false);
      }
    };

    generateQR();
  }, [publicKey]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(publicKey);
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
      flexDirection: 'column'
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
        <h2 style={{ margin: 0 }}>Receive Payment</h2>
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
        justifyContent: 'center',
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
              <h3>Sharing Identity Key</h3>
              <p style={{ color: '#aaa' }}>Others using this appcan scan this to get your identity public key</p>
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
                {publicKey}
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
      </div>
    </div>
  );
};