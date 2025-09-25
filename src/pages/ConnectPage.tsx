import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';

export const ConnectPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<React.ReactNode | string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const wallet = useWallet();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      setError(<p>No BRC-100 wallet detected, please download and use <a href="https://mobile.bsvb.tech/">BSV Browser</a>.</p>);
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
      minHeight: '100vh',
      padding: '40px 20px',
      maxWidth: '800px',
      margin: '0 auto',
      backgroundColor: '#121212',
      color: '#ffffff'
    }}>
      <h1 style={{ 
        marginBottom: '20px',
        fontSize: '2.5rem',
        color: '#42a5f5',
        textAlign: 'center'
      }}>Pay-QuickR</h1>
      
      <p style={{
        fontSize: '1.1rem',
        color: '#b0b0b0',
        textAlign: 'center',
        marginBottom: '40px',
        maxWidth: '600px'
      }}>
        Fast and secure BSV payments using QR codes.<br />Connect your wallet to get started.
      </p>

      {error && (
        <div style={{
          backgroundColor: '#d32f2f',
          color: '#ffffff',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          maxWidth: '400px',
          textAlign: 'center',
          border: '1px solid #d32f2f'
        }}>
          <p style={{ margin: 0, fontWeight: '500' }}>{error}</p>
        </div>
      )}

      <button
        onClick={handleConnect}
        disabled={isProcessing}
        style={{
          backgroundColor: isProcessing ? '#555555' : '#42a5f5',
          color: isProcessing ? '#b0b0b0' : '#000000',
          border: 'none',
          padding: '16px 32px',
          borderRadius: '8px',
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          fontSize: '18px',
          fontWeight: 'bold',
          minWidth: '200px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          transition: 'all 0.2s ease',
          marginBottom: '60px'
        }}
      >
        {isProcessing ? 'Connecting...' : 'Connect Wallet'}
      </button>

      {/* How to Use Section - Moved below Connect Wallet button */}
      <div style={{
        maxWidth: '700px',
        borderRadius: '12px',
      }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: '30px',
          color: '#ffffff',
          fontSize: '1.8rem'
        }}>How It Works</h2>


        <div style={{
          textAlign: 'center',
          padding: '20px',
          backgroundColor: '#333333',
          borderRadius: '8px',
          border: '1px solid #555555',
          margin: '20px 0'
        }}>
          <p style={{
            margin: 0,
            color: '#ffaaee',
            fontSize: '0.95rem',
            fontWeight: '500'
          }}>
            <strong>Tip:</strong> Both parties need to navigate to Pay QuickR using BSV Browser to complete a transaction.
          </p>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '30px',
          marginBottom: '20px'
        }}>
          {/* Receiver Section */}
          <div style={{
            backgroundColor: '#2d2d2d',
            padding: '25px',
            borderRadius: '10px',
            border: '2px solid rgb(37, 175, 44)'
          }}>
            <h3 style={{
              color: 'rgb(37, 175, 44)',
              marginBottom: '20px',
              fontSize: '1.4rem',
              textAlign: 'center'
            }}>
              Receiver
            </h3>
            <ol style={{
              margin: 0,
              paddingLeft: '20px',
              color: 'rgb(37, 175, 44)'
            }}>
              <li style={{
                marginBottom: '12px',
                fontSize: '1rem',
                lineHeight: '1.4'
              }}>
                <strong>Share Identity Key</strong><br/>
                <span style={{ fontSize: '0.9rem', color: '#b0b0b0' }}>
                  Generate and display your Identity Key QR code.
                </span>
              </li>
              <li style={{
                marginBottom: '12px',
                fontSize: '1rem',
                lineHeight: '1.4'
              }}>
                <strong>Scan Transaction</strong><br/>
                <span style={{ fontSize: '0.9rem', color: '#b0b0b0' }}>
                  Scan the payment transaction animated QR code from sender.
                </span>
              </li>
            </ol>
          </div>

          {/* Sender Section */}
          <div style={{
            backgroundColor: '#2d2d2d',
            padding: '25px',
            borderRadius: '10px',
            border: '2px solid #42a5f5'
          }}>
            <h3 style={{
              color: '#42a5f5',
              marginBottom: '20px',
              fontSize: '1.4rem',
              textAlign: 'center',
              width: '100%'
            }}>
              Sender
            </h3>
            <ol style={{
              margin: 0,
              paddingLeft: '20px',
              color: '#42a5f5'
            }}>
              <li style={{
                marginBottom: '12px',
                fontSize: '1rem',
                lineHeight: '1.4'
              }}>
                <strong>Scan Identity Key</strong><br/>
                <span style={{ fontSize: '0.9rem', color: '#b0b0b0' }}>
                  Scan receiver's Identity Key QR code.
                </span>
              </li>
              <li style={{
                marginBottom: '12px',
                fontSize: '1rem',
                lineHeight: '1.4'
              }}>
                <strong>Set the amount to send</strong><br/>
                <span style={{ fontSize: '0.9rem', color: '#b0b0b0' }}>
                  Type the amount of BSV Satoshis to send.
                </span>
              </li>
              <li style={{
                marginBottom: '12px',
                fontSize: '1rem',
                lineHeight: '1.4'
              }}>
                <strong>Share Transaction</strong><br/>
                <span style={{ fontSize: '0.9rem', color: '#b0b0b0' }}>
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
