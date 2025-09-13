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
          size: 400,
          errorCorrectionLevel: 'M',
          margin: 2
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
      alert('Public key copied to clipboard!');
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
      backgroundColor: 'white',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#1976d2',
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
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
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
              <h3>Share this QR code to receive BSV</h3>
              <p style={{ color: '#666' }}>Others can scan this to get your public key</p>
            </div>

            {qrCodeDataUrl && (
              <div style={{
                padding: '20px',
                backgroundColor: '#f9f9f9',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <img
                  src={qrCodeDataUrl}
                  alt="Public Key QR Code"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '400px',
                    border: '1px solid #ddd',
                    borderRadius: '8px'
                  }}
                />
              </div>
            )}

            <div style={{
              marginTop: '30px',
              textAlign: 'center',
              maxWidth: '600px'
            }}>
              <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Public Key:</p>
              <div style={{
                fontFamily: 'monospace',
                backgroundColor: '#f5f5f5',
                padding: '15px',
                borderRadius: '8px',
                wordBreak: 'break-all',
                fontSize: '14px',
                border: '1px solid #ddd'
              }}>
                {publicKey}
              </div>

              <button
                onClick={copyToClipboard}
                style={{
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  marginTop: '15px'
                }}
              >
                Copy Public Key
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};