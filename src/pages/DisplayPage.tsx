import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRDisplay } from '../components/QRDisplay';
import { useWallet } from '../hooks/useWallet';

export const DisplayPage: React.FC = () => {
  const navigate = useNavigate();
  const [publicKeyHex, setPublicKeyHex] = useState<string | null>(null);
  const wallet = useWallet();

  useEffect(() => {
    const loadPublicKey = async () => {
      try {
        const isAuth = await wallet.isAuthenticated();
        if (isAuth) {
          const { publicKey } = await wallet.getPublicKey({ identityKey: true });
          setPublicKeyHex(publicKey);
        }
      } catch (error) {
        console.error('Failed to load public key:', error);
      }
    };

    loadPublicKey();
  }, []);

  if (!publicKeyHex) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '40px'
      }}>
        <p>No wallet connected. Please connect your wallet first.</p>
        <button
          onClick={() => navigate('/')}
          style={{
            backgroundColor: '#1565c0',
            color: 'white',
            border: 'none',
            padding: '16px 32px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            marginTop: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease'
          }}
        >
          Go to Connect
        </button>
      </div>
    );
  }

  return (
    <QRDisplay
      data={publicKeyHex}
      title="Receive"
      description="Sharing Identity Key"
      onClose={() => navigate('/select')}
    />
  );
};
