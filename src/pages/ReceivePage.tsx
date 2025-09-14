import React, { useState } from 'react';
import { QRScanner } from '../components/QRScanner';
import { Payment } from '../utils/payments';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';


export const ReceivePage: React.FC = () => {
  const wallet = useWallet();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [visualLog, setVisualLog] = useState<any[]>([]);
  
  const handleScan = async (result: string) => {
    console.log('QR Scan result:', result);
    setIsProcessing(true);
    
    try {
      setVisualLog(prev => [...prev, `Scanned: ${result.substring(0, 10)}...`]);
      
      const pay = Payment.fromBase64(result);
      setVisualLog(prev => [...prev, 'Payment parsed successfully', pay]);
      
      const { accepted } = await wallet.internalizeAction({
        tx: pay.tx,
        outputs: pay.outputs,
        description: 'Internalize Payment from Pay-QuickR',
        labels: ['Pay-QuickR', 'inbound']
      });

      if (accepted) {
        setVisualLog(prev => [...prev, 'Payment accepted!']);
        setTimeout(() => {
          navigate('/select');
        }, 2000);
      } else {
        setVisualLog(prev => [...prev, 'Payment rejected by wallet']);
      }
      
    } catch (error) {
      console.error('Failed to parse payment:', error);
      setVisualLog(prev => [...prev, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, error]);
    } finally {
      // Keep processing state to show results
    }
  };

  if (isProcessing) return <div style={{
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
      Back to Scanner
    </button>
  </div>;

  return (
    <QRScanner
      onScan={handleScan}
      onClose={() => navigate('/select')}
    />
  );
};
