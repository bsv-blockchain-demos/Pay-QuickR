import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import type { AppView } from '../App';

interface ConnectPageProps {
  navigate: (v: AppView) => void;
}

export const ConnectPage: React.FC<ConnectPageProps> = ({ navigate }) => {
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const wallet = useWallet();

  const handleConnect = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      const { authenticated } = await wallet.isAuthenticated();
      if (authenticated) {
        navigate({ name: 'home' });
      } else {
        setError('Failed to connect to wallet');
      }
    } catch {
      setError(
        <p style={{ margin: 0 }}>
          No BRC-100 wallet detected, please download and use{' '}
          <a href="https://mobile.bsvb.tech/">BSV Browser</a>.
        </p>
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="page"
      style={{ alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: 40 }}
    >
      {/* Hero card */}
      <div
        className="glass-card"
        style={{ maxWidth: 520, width: '100%', padding: '48px 40px', textAlign: 'center' }}
      >
        <h1 style={{ fontSize: '2.4rem', color: 'var(--accent-blue)', margin: '0 0 12px' }}>
          Pay-QuickR
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', margin: '0 0 36px' }}>
          Fast and secure BSV payments using QR codes.
          <br />
          Connect your wallet to get started.
        </p>

        {error && (
          <div
            style={{
              background: 'rgba(248,113,113,0.12)',
              border: '1px solid rgba(248,113,113,0.3)',
              borderRadius: 12,
              padding: '14px 18px',
              marginBottom: 24,
              fontSize: '0.9rem',
              color: 'var(--accent-red)',
            }}
          >
            {error}
          </div>
        )}

        <button
          className="btn btn-primary"
          onClick={handleConnect}
          disabled={isProcessing}
          style={{ width: '100%', marginBottom: 28 }}
        >
          {isProcessing ? 'Connecting...' : 'Connect Wallet'}
        </button>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
          Use at your own risk. Alpha proof-of-concept software provided as-is, with no warranties.{' '}
          <a href="/LICENSE.txt">License</a>
        </p>
      </div>

      {/* How It Works */}
      <div style={{ maxWidth: 700, width: '100%' }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 24px', color: 'var(--text-primary)' }}>
          How It Works
        </h2>

        <div
          className="glass-card"
          style={{
            padding: '14px 20px',
            marginBottom: 20,
            textAlign: 'center',
            color: '#f9a8d4',
            fontSize: '0.88rem',
          }}
        >
          <strong>Tip:</strong> Both parties need to navigate to Pay-QuickR using BSV Browser to
          complete a transaction.
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20,
          }}
        >
          <div
            className="glass-card"
            style={{ padding: '28px 24px', border: '1px solid rgba(16,185,129,0.3)' }}
          >
            <h3 style={{ color: 'var(--accent-green)', textAlign: 'center', margin: '0 0 20px' }}>
              Receiver
            </h3>
            <ol style={{ margin: 0, paddingLeft: 20, color: 'var(--accent-green)' }}>
              <li style={{ marginBottom: 12 }}>
                <strong>Share Identity Key</strong>
                <br />
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Generate and display your Identity Key QR code.
                </span>
              </li>
              <li>
                <strong>Scan Transaction</strong>
                <br />
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Scan the payment transaction animated QR code from sender.
                </span>
              </li>
            </ol>
          </div>

          <div
            className="glass-card"
            style={{ padding: '28px 24px', border: '1px solid rgba(79,142,247,0.3)' }}
          >
            <h3 style={{ color: 'var(--accent-blue)', textAlign: 'center', margin: '0 0 20px' }}>
              Sender
            </h3>
            <ol style={{ margin: 0, paddingLeft: 20, color: 'var(--accent-blue)' }}>
              <li style={{ marginBottom: 12 }}>
                <strong>Scan Identity Key</strong>
                <br />
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Scan receiver's Identity Key QR code.
                </span>
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Set Amount</strong>
                <br />
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Type the amount of BSV Satoshis to send.
                </span>
              </li>
              <li>
                <strong>Share Transaction</strong>
                <br />
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Display payment transaction as animated QR code.
                </span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
