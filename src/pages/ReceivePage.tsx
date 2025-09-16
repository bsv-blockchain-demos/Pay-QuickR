import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Transaction } from '@bsv/sdk';
import { QRDisplay } from '../components/QRDisplay';
import { QRScanner } from '../components/QRScanner';
import { Payment } from '../utils/payments';
import { useWallet } from '../hooks/useWallet';

export const ReceivePage: React.FC = () => {
  const navigate = useNavigate();
  const [publicKeyHex, setPublicKeyHex] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [visualLog, setVisualLog] = useState<any[]>([]);
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

  const handleScan = async (result: string) => {
    console.log('QR Scan result:', result);
    setIsProcessing(true);
    
    try {
      setVisualLog(prev => [...prev, `Scanned: ${result.substring(0, 10)}...`]);
      
      const pay = Payment.fromBase64(result);
      setVisualLog(prev => [...prev, 'Payment parsed successfully']);

      const transaction = Transaction.fromBEEF(pay.tx)
      const valid = await transaction.verify()

      if (!valid) {
        setVisualLog(prev => [...prev, 'Transaction failed SPV']);
        return;
      }
      
      const response = await wallet.internalizeAction({
        tx: pay.tx,
        outputs: pay.outputs,
        description: 'Internalize Payment from Pay-QuickR',
        labels: ['Pay-QuickR', 'inbound']
      });

      setVisualLog(prev => [...prev, 'Response from wallet:', response]);

      if (response.accepted) {
        setVisualLog(prev => [...prev, 'Payment accepted!']);
      } else {
        setVisualLog(prev => [...prev, 'Payment rejected by wallet']);
      }
      
    } catch (error) {
      console.error('Failed to parse payment:', error);
      setVisualLog(prev => [...prev, JSON.stringify(error)]);
    }
  };

  // Show processing screen when scanning transaction
  if (isProcessing) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '40px'
      }}>
        <h2 style={{ marginBottom: '40px'}}>Processing Payment...</h2>
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '20px',
          borderRadius: '8px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '400px',
          overflow: 'auto'
        }}>
          {visualLog.map((log, index) => (
            <div key={index} style={{
              marginBottom: '10px',
              padding: '8px',
              backgroundColor: typeof log === 'string' && log.startsWith('Error:') ? '#ffebee' : '#e8f5e8',
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: typeof log === 'object' ? 'monospace' : 'inherit',
              color: 'black'
            }}>
              {typeof log === 'object' ? JSON.stringify(log, null, 2) : log}
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            setIsProcessing(false);
            setVisualLog([]);
            setShowScanner(false);
            navigate('/select');
          }}
          style={{
            marginTop: '20px',
            backgroundColor: '#1565c0',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          Done
        </button>
      </div>
    );
  }

  // Show transaction scanner
  if (showScanner) {
    return (
      <QRScanner
        onScan={handleScan}
        scanWhat="Transaction"
        onClose={() => setShowScanner(false)}
      />
    );
  }

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

  const ScanTransaction = () => (
  <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
    <button
      onClick={() => setShowScanner(true)}
      style={{
        marginTop: '30px',
        backgroundColor: '#2e7d32',
        color: 'white',
        border: 'none',
        padding: '16px 32px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '18px',
        fontWeight: 'bold',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease'
      }}
    >
      Scan Transaction
    </button>
 </div>
 )

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
        <h2 style={{ margin: 0 }}>Receive Payment</h2>
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
        <QRDisplay
          data={publicKeyHex}
          title="Share Your Identity Key"
          description="Let others scan this QR code to send you payments"
          onClose={() => navigate('/select')}
          additionalButton={<ScanTransaction />}
        />
      </div>
    </div>
  );
};
