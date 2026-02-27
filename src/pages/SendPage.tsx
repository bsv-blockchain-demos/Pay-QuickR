import React, { useState, useEffect } from 'react';
import { QRScanner } from '../components/QRScanner';
import { QRDisplay } from '../components/QRDisplay';
import { PublicKey, P2PKH } from '@bsv/sdk';
import { brc29ProtocolID } from '@bsv/wallet-toolbox-client';
import { wallet } from '../hooks/useWallet';
import { RandomBase64 } from '../utils/cryptoUtils';
import { Payment } from '../utils/payments';
import type { AppView, PaymentState, SendView } from '../App';

interface SendPageProps {
  view: SendView;
  navigate: (v: AppView) => void;
}

export const SendPage: React.FC<SendPageProps> = ({ view, navigate }) => {
  if (view.name === 'send-prompt') return <SendPrompt navigate={navigate} />;
  if (view.name === 'send-scan-key') return <SendScanKey navigate={navigate} />;
  if (view.name === 'send-form')
    return <SendForm counterparty={view.counterparty} navigate={navigate} />;
  if (view.name === 'send-show-qr')
    return (
      <SendShowQR
        payments={view.payments}
        currentPayment={view.currentPayment}
        navigate={navigate}
      />
    );
  return null;
};

// ── Sub-views ────────────────────────────────────────────────────────────────

const SendPrompt: React.FC<{ navigate: (v: AppView) => void }> = ({ navigate }) => {
  // Check localStorage for pending outbound payments and resume if found
  useEffect(() => {
    const stored = localStorage.getItem('outboundPayments');
    if (stored) {
      try {
        const payments: PaymentState[] = JSON.parse(stored);
        if (payments.length > 0) {
          navigate({ name: 'send-show-qr', payments, currentPayment: payments[0] });
        }
      } catch {
        // ignore corrupt data
      }
    }
  }, [navigate]);

  return (
    <div className="page">
      <div className="page-header">
        <h2>Send Payment</h2>
        <button
          className="btn btn-ghost"
          style={{ minHeight: 40, padding: '8px 16px', fontSize: 14 }}
          onClick={() => navigate({ name: 'home' })}
        >
          Back
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
        }}
      >
        <div
          className="glass-card"
          style={{ padding: '40px 32px', textAlign: 'center', maxWidth: 400, width: '100%' }}
        >
          <div style={{ fontSize: 52, marginBottom: 16 }}>📷</div>
          <h3 style={{ margin: '0 0 12px', color: 'var(--text-primary)', fontSize: '1.25rem' }}>
            Scan Receiver's Key
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 28px' }}>
            Scan the receiver's Identity Key QR code to start a payment.
          </p>
          <button
            className="btn btn-red"
            onClick={() => navigate({ name: 'send-scan-key' })}
            style={{ width: '100%' }}
          >
            Scan Identity Key
          </button>
        </div>
      </div>
    </div>
  );
};

const SendScanKey: React.FC<{ navigate: (v: AppView) => void }> = ({ navigate }) => (
  <QRScanner
    scanWhat="Identity Key"
    onScan={(key) => navigate({ name: 'send-form', counterparty: key })}
    onClose={() => navigate({ name: 'send-prompt' })}
  />
);

const SendForm: React.FC<{ counterparty: string; navigate: (v: AppView) => void }> = ({
  counterparty,
  navigate,
}) => {
  const [satoshis, setSatoshis] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const createPaymentTransaction = async () => {
    const satoshiAmount = parseInt(satoshis);
    if (!satoshiAmount || satoshiAmount < 1 || satoshiAmount > 2100000000000000) {
      setError('Amount must be between 1 and 2,100,000,000,000,000 satoshis');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const { publicKey: senderIdentityKey } = await wallet.getPublicKey({ identityKey: true });

      const paymentData = {
        senderIdentityKey,
        derivationPrefix: RandomBase64(8),
        derivationSuffix: RandomBase64(8),
      };

      const keyID = `${paymentData.derivationPrefix} ${paymentData.derivationSuffix}`;
      const { publicKey: paymentPublicKey } = await wallet.getPublicKey({
        protocolID: brc29ProtocolID,
        keyID,
        counterparty,
      });

      const script = new P2PKH().lock(PublicKey.fromString(paymentPublicKey).toAddress());

      const response = await wallet.createAction({
        description: 'Pay ' + counterparty,
        outputs: [
          {
            satoshis: satoshiAmount,
            lockingScript: script.toHex(),
            outputDescription: `Payment to ${counterparty} of ${satoshiAmount} satoshis`,
            customInstructions: JSON.stringify(paymentData),
          },
        ],
        options: { randomizeOutputs: false },
      });

      const paymentObj: PaymentState = {
        paymentData,
        response,
        timestamp: Date.now(),
        counterparty,
        satoshis: satoshiAmount,
      };

      const existingPayments: PaymentState[] = JSON.parse(
        localStorage.getItem('outboundPayments') || '[]'
      );
      existingPayments.push(paymentObj);
      localStorage.setItem('outboundPayments', JSON.stringify(existingPayments));

      navigate({
        name: 'send-show-qr',
        payments: existingPayments,
        currentPayment: paymentObj,
      });
    } catch (err) {
      setError('Failed to create payment: ' + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Create Payment</h2>
        <button
          className="btn btn-ghost"
          style={{ minHeight: 40, padding: '8px 16px', fontSize: 14 }}
          onClick={() => navigate({ name: 'send-scan-key' })}
        >
          Back
        </button>
      </div>

      <div
        style={{ flex: 1, padding: '32px 20px', maxWidth: 500, margin: '0 auto', width: '100%' }}
      >
        {/* Counterparty display */}
        <div className="glass-card" style={{ padding: '18px 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  color: 'var(--accent-blue)',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  letterSpacing: '0.06em',
                  marginBottom: 6,
                }}
              >
                COUNTERPARTY
              </div>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  wordBreak: 'break-all',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                {counterparty}
              </div>
            </div>
            <button
              className="btn btn-primary"
              style={{ minHeight: 36, padding: '6px 14px', fontSize: 12, flexShrink: 0 }}
              onClick={() => navigate({ name: 'send-scan-key' })}
            >
              Rescan
            </button>
          </div>
        </div>

        {/* Amount input */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: 'block',
              marginBottom: 8,
              fontWeight: 600,
              fontSize: '0.78rem',
              letterSpacing: '0.06em',
              color: 'var(--text-secondary)',
            }}
          >
            AMOUNT (SATOSHIS)
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
              padding: '14px 16px',
              fontSize: 16,
              background: 'var(--surface)',
              border: '1px solid var(--surface-border)',
              borderRadius: 12,
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
            Range: 1 to 2,100,000,000,000,000 satoshis
          </div>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(248,113,113,0.12)',
              border: '1px solid rgba(248,113,113,0.3)',
              borderRadius: 10,
              padding: '12px 16px',
              marginBottom: 16,
              fontSize: '0.88rem',
              color: 'var(--accent-red)',
            }}
          >
            {error}
          </div>
        )}

        <button
          className="btn btn-green"
          onClick={createPaymentTransaction}
          disabled={isProcessing || !satoshis}
          style={{ width: '100%' }}
        >
          {isProcessing ? 'Creating Payment...' : 'Create Payment'}
        </button>
      </div>
    </div>
  );
};

const SendShowQR: React.FC<{
  payments: PaymentState[];
  currentPayment: PaymentState;
  navigate: (v: AppView) => void;
}> = ({ payments, currentPayment, navigate }) => {
  const pay = new Payment({
    tx: currentPayment.response.tx,
    outputs: [
      {
        outputIndex: 0,
        protocol: 'wallet payment',
        paymentRemittance: {
          senderIdentityKey: currentPayment.paymentData.senderIdentityKey,
          derivationPrefix: currentPayment.paymentData.derivationPrefix,
          derivationSuffix: currentPayment.paymentData.derivationSuffix,
        },
      },
    ],
  });
  const qrData = pay.toBase64();

  const handleNext = () => {
    const updatedPayments = payments.slice(1);
    localStorage.setItem('outboundPayments', JSON.stringify(updatedPayments));
    if (updatedPayments.length > 0) {
      navigate({
        name: 'send-show-qr',
        payments: updatedPayments,
        currentPayment: updatedPayments[0],
      });
    } else {
      navigate({ name: 'home' });
    }
  };

  const handleNew = () => {
    navigate({ name: 'send-prompt' });
  };

  return (
    <QRDisplay
      data={qrData}
      title="Scan Transaction"
      description={`${currentPayment.satoshis} sats → ${currentPayment.counterparty.substring(0, 20)}...`}
      onClose={() => navigate({ name: 'home' })}
      additionalButton={
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            marginTop: 20,
            width: '100%',
          }}
        >
          {payments.length > 1 && (
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
              {payments.length} payments queued
            </p>
          )}
          <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 420 }}>
            <button className="btn btn-red" onClick={handleNext} style={{ flex: 1 }}>
              {payments.length > 1 ? 'Next Payment' : 'Clear Payment'}
            </button>
            <button className="btn btn-primary" onClick={handleNew} style={{ flex: 1 }}>
              New Payment
            </button>
          </div>
        </div>
      }
    />
  );
};
