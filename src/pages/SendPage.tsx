import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRScanner } from '../components/QRScanner';
import { QRDisplay } from '../components/QRDisplay';
import { PublicKey, P2PKH } from '@bsv/sdk';
import { brc29ProtocolID } from '@bsv/wallet-toolbox-client';
import { wallet } from '../hooks/useWallet';
import { RandomBase64 } from '../utils/cryptoUtils';
import { Payment } from '../utils/payments';

export const SendPage: React.FC = () => {
  const navigate = useNavigate();
  const [counterparty, setCounterparty] = useState<string>('');
  const [satoshis, setSatoshis] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [showScanner, setShowScanner] = useState<boolean>(true);
  const [payment, setPaymentData] = useState<any>(null);
  const [qrData, setQrData] = useState<string>('');
  const [outboundPayments, setOutboundPayments] = useState<any[]>([]);

  // Load outbound payments from localStorage on component mount
  useEffect(() => {
    const loadOutboundPayments = () => {
      const stored = localStorage.getItem('outboundPayments');
      if (stored) {
        const payments = JSON.parse(stored);
        if (payments.length > 0) {
          setOutboundPayments(payments);
          // Load the first payment and show it in transmit mode
          const firstPayment = payments[0];
          setPaymentData(firstPayment);
          
          // Create Payment object for QR display
          const pay = new Payment({
            tx: firstPayment.response.tx,
            outputs: [{
              outputIndex: 0,
              protocol: "wallet payment",
              paymentRemittance: {
                senderIdentityKey: firstPayment.paymentData.senderIdentityKey,
                derivationPrefix: firstPayment.paymentData.derivationPrefix,
                derivationSuffix: firstPayment.paymentData.derivationSuffix
              }
            }]
          });
          
          setQrData(pay.toBase64());
          setShowScanner(false);
        }
      }
    };

    loadOutboundPayments();
  }, []);

  const removeCurrentPaymentAndLoadNext = () => {
    const updatedPayments = outboundPayments.slice(1); // Remove first payment
    setOutboundPayments(updatedPayments);
    localStorage.setItem('outboundPayments', JSON.stringify(updatedPayments));
    
    if (updatedPayments.length > 0) {
      // Load next payment
      const nextPayment = updatedPayments[0];
      setPaymentData(nextPayment);
      
      // Create Payment object for QR display
      const pay = new Payment({
        tx: nextPayment.response.tx,
        outputs: [{
          outputIndex: 0,
          protocol: "wallet payment",
          paymentRemittance: {
            senderIdentityKey: nextPayment.paymentData.senderIdentityKey,
            derivationPrefix: nextPayment.paymentData.derivationPrefix,
            derivationSuffix: nextPayment.paymentData.derivationSuffix
          }
        }]
      });
      
      setQrData(pay.toBase64());
    } else {
      // No more payments, reset to scan mode
      setPaymentData(null);
      setQrData('');
      setCounterparty('');
      setSatoshis('');
      setShowScanner(true);
      navigate('/select');
    }
  };

  const handleScan = (result: string) => {
    setCounterparty(result);
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

      const paymentObj = { paymentData, response, timestamp: Date.now(), counterparty, satoshis: satoshiAmount };
      
      // Save to localStorage
      const existingPayments = JSON.parse(localStorage.getItem('outboundPayments') || '[]');
      existingPayments.push(paymentObj);
      localStorage.setItem('outboundPayments', JSON.stringify(existingPayments));
      setOutboundPayments(existingPayments);
      
      // Create Payment object for QR display
      const pay = new Payment({
        tx: response.tx!,
        outputs: [{
          outputIndex: 0,
          protocol: "wallet payment",
          paymentRemittance: {
            senderIdentityKey: paymentData.senderIdentityKey,
            derivationPrefix: paymentData.derivationPrefix,
            derivationSuffix: paymentData.derivationSuffix
          }
        }]
      });
      
      setPaymentData(paymentObj);
      setQrData(pay.toBase64());
    } catch (err) {
      console.error('Payment creation failed:', err);
      setError('Failed to create payment transaction: ' + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  // If payment is created, show QR display
  if (qrData && payment) {
    const NextPaymentButton = () => (
      <button
        onClick={removeCurrentPaymentAndLoadNext}
        style={{
          marginTop: '20px',
          backgroundColor: '#d32f2f',
          border: 'none',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        {outboundPayments.length > 1 ? 'Next Payment' : 'Clear Payment'}
      </button>
    );

    return (
      <QRDisplay
        data={qrData}
        title="Scan Tx"
        description={`Payment of ${payment.satoshis} satoshis to ${payment.counterparty.substring(0, 20)}...`}
        onClose={() => {
          setPaymentData(null);
          setQrData('');
          setCounterparty('');
          setSatoshis('');
          setShowScanner(true);
        }}
        additionalButton={
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {outboundPayments.length > 1 && (
              <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#666' }}>
                {outboundPayments.length} payments queued
              </p>
            )}
            {outboundPayments.length > 0 && <NextPaymentButton />}
            <button
              onClick={() => {
                setPaymentData(null);
                setQrData('');
                setCounterparty('');
                setSatoshis('');
                setShowScanner(true);
              }}
              style={{
                marginTop: '10px',
                backgroundColor: '#1976d2',
                border: 'none',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              New Payment
            </button>
          </div>
        }
      />
    );
  }

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
              <strong style={{ color: '#1976d2' }}>Counterparty:</strong>
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
      scanWhat="Identity Key"
      onClose={() => navigate('/select')}
    />
  );
};
