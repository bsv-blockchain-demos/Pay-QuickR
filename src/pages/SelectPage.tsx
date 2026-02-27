import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import type { AppView } from '../App';

interface SelectPageProps {
  navigate: (v: AppView) => void;
}

export const SelectPage: React.FC<SelectPageProps> = ({ navigate }) => {
  const wallet = useWallet();
  const [isLoadingReceive, setIsLoadingReceive] = useState(false);

  const handleSend = () => {
    navigate({ name: 'send-prompt' });
  };

  const handleReceive = async () => {
    setIsLoadingReceive(true);
    try {
      const { publicKey } = await wallet.getPublicKey({ identityKey: true });
      navigate({ name: 'receive-show-id', publicKey });
    } catch (err) {
      console.error('Failed to get public key:', err);
    } finally {
      setIsLoadingReceive(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Pay-QuickR</h2>
        <button
          className="btn btn-ghost"
          style={{ minHeight: 40, padding: '8px 16px', fontSize: 14 }}
          onClick={() => navigate({ name: 'connect' })}
        >
          Disconnect
        </button>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          gap: 16,
          maxWidth: 500,
          margin: '0 auto',
          width: '100%',
        }}
      >
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: '0 0 8px' }}>
          What would you like to do?
        </p>

        <button
          className="btn btn-red"
          onClick={handleSend}
          style={{ width: '100%', fontSize: 18 }}
        >
          ↑ Send
        </button>

        <button
          className="btn btn-green"
          onClick={handleReceive}
          disabled={isLoadingReceive}
          style={{ width: '100%', fontSize: 18 }}
        >
          {isLoadingReceive ? 'Loading...' : '↓ Receive'}
        </button>
      </div>
    </div>
  );
};
