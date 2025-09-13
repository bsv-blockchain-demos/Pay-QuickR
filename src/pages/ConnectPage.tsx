import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';

export const ConnectPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const wallet = useWallet();

  const handleConnect = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      const { authenticated } = await wallet.isAuthenticated();
      if (authenticated) {
        navigate('/select');
      } else {
        setError('Failed to connect to wallet');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsProcessing(false);
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
          color: '#d32f2f',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          maxWidth: '400px',
          textAlign: 'center',
          border: '1px solid #ffcdd2'
        }}>
          <p style={{ margin: 0, fontWeight: '500' }}>{error}</p>
        </div>
      )}

      <button
        onClick={handleConnect}
        disabled={isProcessing}
        style={{
          backgroundColor: isProcessing ? '#9e9e9e' : '#1565c0',
          color: 'white',
          border: 'none',
          padding: '16px 32px',
          borderRadius: '8px',
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          fontSize: '18px',
          fontWeight: 'bold',
          minWidth: '200px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease'
        }}
      >
        {isProcessing ? 'Connecting...' : 'Connect Wallet'}
      </button>
    </div>
  );
};
