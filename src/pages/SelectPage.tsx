import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SelectPageProps {
  scannedPublicKey?: string;
}

export const SelectPage: React.FC<SelectPageProps> = ({ scannedPublicKey }) => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      padding: '40px'
    }}>
      <h2 style={{ marginBottom: '40px' }}>Choose Action</h2>

      <div style={{
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => navigate('/send')}
          style={{
            backgroundColor: '#ff5722',
            color: 'white',
            border: 'none',
            padding: '20px 40px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
            minWidth: '150px',
            minHeight: '80px'
          }}
        >
          Send
          <div style={{ fontSize: '14px', marginTop: '5px', opacity: 0.9 }}>
            Scan QR Code
          </div>
        </button>

        <button
          onClick={() => navigate('/receive')}
          style={{
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            padding: '20px 40px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
            minWidth: '150px',
            minHeight: '80px'
          }}
        >
          Receive
          <div style={{ fontSize: '14px', marginTop: '5px', opacity: 0.9 }}>
            Show QR Code
          </div>
        </button>
      </div>

      {scannedPublicKey && (
        <div style={{
          marginTop: '40px',
          padding: '20px',
          backgroundColor: '#e8f5e8',
          borderRadius: '8px',
          maxWidth: '600px'
        }}>
          <p><strong>Last scanned:</strong></p>
          <p style={{
            fontFamily: 'monospace',
            fontSize: '14px',
            wordBreak: 'break-all',
            margin: '10px 0'
          }}>
            {scannedPublicKey}
          </p>
        </div>
      )}
    </div>
  );
};
