import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';

export const ConnectPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const wallet = useWallet();

  const handleConnect = async () => {
    try {
      setError(null);
      const { authenticated } = await wallet.isAuthenticated();
      if (authenticated) {
        navigate('/select');
      } else {
        setError('Failed to connect to wallet');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      padding: '40px'
    }}>
      <h1 style={{ marginBottom: '40px' }}>Pay-QuickR</h1>

      {error && (
        <div style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          <p>{error}</p>
        </div>
      )}

      <button
        onClick={handleConnect}
        style={{
          backgroundColor: '#1976d2',
          color: 'white',
          border: 'none',
          padding: '16px 32px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '18px',
          fontWeight: 'bold',
          minWidth: '200px'
        }}
      >
        Connect Wallet
      </button>
    </div>
  );
};
