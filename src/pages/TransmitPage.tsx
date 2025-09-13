import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';

interface TransmitPageProps {
  payment?: any;
}

export const TransmitPage: React.FC<TransmitPageProps> = ({ payment }) => {
  const navigate = useNavigate();
  const [transactionBase64, setTransactionBase64] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize with payment data if available
  useEffect(() => {
    if (payment?.response?.rawTx) {
      setTransactionBase64(payment.response.rawTx);
    }
  }, [payment]);

  const generateQRCode = async (data: string) => {
    try {
      setLoading(true);
      setError(null);
      const qrDataUrl = await QRCode.toDataURL(data, {
        width: 400,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(qrDataUrl);
    } catch (err) {
      setError('Failed to generate QR code');
      console.error('QR code generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (transactionBase64.trim()) {
      generateQRCode(transactionBase64);
    } else {
      setQrCodeDataUrl('');
    }
  }, [transactionBase64]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(transactionBase64);
      alert('Transaction copied to clipboard!');
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
        <h2 style={{ margin: 0 }}>Transmit Transaction</h2>
        <button
          onClick={() => navigate('/select')}
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

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}>
        <div style={{
          marginBottom: '30px',
          textAlign: 'center',
          maxWidth: '600px'
        }}>
          <h3>Enter Base64 Transaction</h3>
          <p style={{ color: '#666' }}>Paste your base64 encoded transaction below to generate a QR code</p>
        </div>

        <textarea
          value={transactionBase64}
          onChange={(e) => setTransactionBase64(e.target.value)}
          placeholder="Paste base64 transaction here..."
          style={{
            width: '100%',
            maxWidth: '600px',
            height: '120px',
            padding: '15px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: 'monospace',
            resize: 'vertical',
            marginBottom: '20px'
          }}
        />

        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            maxWidth: '600px',
            textAlign: 'center'
          }}>
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <p>Generating QR code...</p>
          </div>
        )}

        {qrCodeDataUrl && !loading && (
          <div style={{
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            <div style={{
              padding: '20px',
              backgroundColor: '#f9f9f9',
              borderRadius: '12px',
              display: 'inline-block'
            }}>
              <img
                src={qrCodeDataUrl}
                alt="Transaction QR Code"
                style={{
                  maxWidth: '100%',
                  maxHeight: '400px',
                  border: '1px solid #ddd',
                  borderRadius: '8px'
                }}
              />
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <button
                onClick={copyToClipboard}
                style={{
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Copy Transaction
              </button>
            </div>
          </div>
        )}

        {!transactionBase64.trim() && (
          <div style={{
            textAlign: 'center',
            color: '#666',
            fontSize: '16px'
          }}>
            <p>Enter a base64 transaction above to generate QR code</p>
          </div>
        )}
      </div>
    </div>
  );
};
