import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRScanner } from '../components/QRScanner';
import { PublicKey, P2PKH } from '@bsv/sdk';
import { brc29ProtocolID } from '@bsv/wallet-toolbox-client';
import { wallet } from '../hooks/useWallet';
import { RandomBase64 } from '../utils/cryptoUtils';

interface ScanPageProps {
  onScan: (result: string) => void;
  setPayment: (payment: any) => void;
  scannedPublicKey?: string;
}

export const ScanPage: React.FC<ScanPageProps> = ({ onScan, setPayment, scannedPublicKey }) => {
  const navigate = useNavigate();
  const [counterparty, setCounterparty] = useState<string>(scannedPublicKey || '');
  const [satoshis, setSatoshis] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [showScanner, setShowScanner] = useState<boolean>(!scannedPublicKey);

  const handleScan = (result: string) => {
    setCounterparty(result);
    onScan(result);
    setShowScanner(false);
  };

  const createPaymentTransaction = async () => {
    if (!counterparty || !satoshis) {
      setError('Please scan a public key and enter payment amount');
      return;
    }

    const satoshiAmount = parseInt(satoshis);
    if (satoshiAmount < 1 || satoshiAmount > 2100000000000000) {
      setError('Amount must be between 1 and 2,100,000,000,000,000 satoshis');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const { publicKey: senderIdentityKey } = await wallet.getPublicKey({
        identityKey: true
      });

      const paymentData = {
        senderIdentityKey,
        derivationPrefix: RandomBase64(8),
        derivationSuffix: RandomBase64(8)
      };

      const keyID = `${paymentData.derivationPrefix} ${paymentData.derivationSuffix}`;
      const { publicKey: paymentPublicKey } = await wallet.getPublicKey({
        protocolID: brc29ProtocolID,
        keyID,
        counterparty
      });

      const script = new P2PKH().lock(PublicKey.fromString(paymentPublicKey).toAddress());

      const response = await wallet.createAction({
        description: 'Pay ' + counterparty,
        outputs: [{
          satoshis: satoshiAmount,
          lockingScript: script.toHex(),
          outputDescription: `Payment to ${counterparty} of ${satoshiAmount} satoshis`,
          customInstructions: JSON.stringify(paymentData)
        }],
        options: {
          randomizeOutputs: false
        }
      });

      const payment = { paymentData, response, timestamp: Date.now(), counterparty, satoshis: satoshiAmount };
      
      // Save to localStorage
      const existingPayments = JSON.parse(localStorage.getItem('outboundPayments') || '[]');
      existingPayments.push(payment);
      localStorage.setItem('outboundPayments', JSON.stringify(existingPayments));
      
      setPayment(payment);
      navigate('/transmit');
    } catch (err) {
      console.error('Payment creation failed:', err);
      setError('Failed to create payment transaction: ' + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (counterparty && !showScanner) {
    return (
      <div style={{
        padding: '20px',
        maxWidth: '500px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <button
          onClick={() => navigate('/select')}
          style={{
            alignSelf: 'flex-start',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer'
          }}
        >
          ←
        </button>

        <h2>Create Payment</h2>

        <div style={{
          padding: '15px',
          backgroundColor: '#e8f4f8',
          border: '1px solid #b3d9e6',
          borderRadius: '8px',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <strong style={{ color: '#1565c0' }}>Counterparty:</strong>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '12px',
                wordBreak: 'break-all',
                marginTop: '5px',
                marginRight: '10px',
                color: '#333333',
                backgroundColor: '#ffffff',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}>
                {counterparty}
              </div>
            </div>
            <button
              onClick={() => {
                setShowScanner(true);
              }}
              style={{
                padding: '8px 12px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold',
                whiteSpace: 'nowrap'
              }}
            >
              Scan New Key
            </button>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            Payment Amount (satoshis):
          </label>
          <input
            type="number"
            min="1"
            max="2100000000000000"
            value={satoshis}
            onChange={(e) => setSatoshis(e.target.value)}
            placeholder="Enter amount in satoshis"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '8px',
              boxSizing: 'border-box'
            }}
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            Range: 1 to 2,100,000,000,000,000 satoshis
          </div>
        </div>

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#ffebee',
            color: '#d32f2f',
            borderRadius: '8px',
            fontSize: '14px',
            border: '1px solid #ffcdd2',
            fontWeight: '500'
          }}>
            {error}
          </div>
        )}

        <button
          onClick={createPaymentTransaction}
          disabled={isProcessing || !satoshis}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: isProcessing ? '#9e9e9e' : '#2e7d32',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease'
          }}
        >
          {isProcessing ? 'Creating Payment...' : 'Create Payment'}
        </button>
      </div>
    );
  }

  return (
    <QRScanner
      onScan={handleScan}
      onClose={() => navigate('/select')}
    />
  );
};
