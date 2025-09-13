import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRDisplay } from '../components/QRDisplay';
import { useWallet } from '../hooks/useWallet';

export const ReceivePage: React.FC = () => {
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
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            padding: '16px 32px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            marginTop: '20px'
          }}
        >
          Go to Connect
        </button>
      </div>
    );
  }

  return (
    <QRDisplay
      publicKey={publicKeyHex}
      onClose={() => navigate('/select')}
    />
  );
};
