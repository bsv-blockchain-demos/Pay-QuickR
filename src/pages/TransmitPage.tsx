import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRDisplay } from '../components/QRDisplay';
import { Payment } from '../utils/payments';

interface TransmitPageProps {
  payment?: any;
}

export const TransmitPage: React.FC<TransmitPageProps> = ({ payment }) => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (payment) {
      const pay = new Payment({
        tx: payment.response.tx,
        outputs: [{
          outputIndex: 0,
          protocol: "wallet payment",
          paymentRemittance: {
            senderIdentityKey: payment.paymentData.senderIdentityKey,
            derivationPrefix: payment.paymentData.derivationPrefix,
            derivationSuffix: payment.paymentData.derivationSuffix
          }
        }]
      })
      setData(pay.toBase64());
    } else {
      const payments = localStorage.getItem('outboundPayments');
      if (payments) {
        const parsedPayments = JSON.parse(payments);
        if (parsedPayments.length > 0) {
          const format = parsedPayments[0];
          const pay = new Payment({
            tx: format.response.tx,
            outputs: [{
              outputIndex: 0,
              protocol: "wallet payment",
              paymentRemittance: {
                senderIdentityKey: format.paymentData.senderIdentityKey,
                derivationPrefix: format.paymentData.derivationPrefix,
                derivationSuffix: format.paymentData.derivationSuffix
              }
            }]
          });
          setData(pay.toBase64());
        }
      }
    }
  }, [payment]);

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
        <h2 style={{ margin: 0 }}>Transmit Transaction</h2>
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
          data={payment || data}
          title="Transmit Transaction"
          description="Scan this QR code to transmit transaction"
          onClose={() => navigate('/select')}
        />
      </div>
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
      </div>
    </div>
  );
};
