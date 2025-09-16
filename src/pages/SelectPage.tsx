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
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '20px',
        maxWidth: '600px',
        width: '100%'
      }}>
        <button
          onClick={() => navigate('/scan')}
          style={{
            backgroundColor: '#d32f2f',
            color: 'white',
            border: 'none',
            padding: '20px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            minHeight: '80px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease'
          }}
        >
          Send
        </button>

        <button
          onClick={() => navigate('/display')}
          style={{
            backgroundColor: '#2e7d32',
            color: 'white',
            border: 'none',
            padding: '20px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            minHeight: '80px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease'
          }}
        >
          Receive
        </button>

        <button
          onClick={() => navigate('/transmit')}
          style={{
            backgroundColor: '#2e7d32',
            color: 'white',
            border: 'none',
            padding: '20px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            minHeight: '80px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease'
          }}
        >
          Transfer
        </button>



        <button
          onClick={() => navigate('/receive')}
          style={{
            backgroundColor: '#2e7d32',
            color: 'white',
            border: 'none',
            padding: '20px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            minHeight: '80px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease'
          }}
        >
          Scan P2P
        </button>
      </div>
    </div>
  );
};
