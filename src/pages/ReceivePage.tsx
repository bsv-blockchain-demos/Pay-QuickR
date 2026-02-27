import React, { useState, useEffect } from 'react';
import { Transaction } from '@bsv/sdk';
import { QRDisplay } from '../components/QRDisplay';
import { QRScanner } from '../components/QRScanner';
import { Payment } from '../utils/payments';
import { useWallet } from '../hooks/useWallet';
import type { AppView, ReceiveView } from '../App';

interface ReceivePageProps {
  view: ReceiveView;
  navigate: (v: AppView) => void;
}

export const ReceivePage: React.FC<ReceivePageProps> = ({ view, navigate }) => {
  if (view.name === 'receive-show-id')
    return <ReceiveShowId publicKey={view.publicKey} navigate={navigate} />;
  if (view.name === 'receive-scan-tx')
    return <ReceiveScanTx publicKey={view.publicKey} navigate={navigate} />;
  if (view.name === 'receive-processing')
    return (
      <ReceiveProcessing
        scannedData={view.scannedData}
        publicKey={view.publicKey}
        navigate={navigate}
      />
    );
  return null;
};

// ── Sub-views ────────────────────────────────────────────────────────────────

const ReceiveShowId: React.FC<{ publicKey: string; navigate: (v: AppView) => void }> = ({
  publicKey,
  navigate,
}) => (
  <QRDisplay
    data={publicKey}
    title="Your Identity Key"
    description="Let others scan this QR code to send you payments"
    onClose={() => navigate({ name: 'home' })}
    additionalButton={
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20, width: '100%' }}>
        <button
          className="btn btn-green"
          onClick={() => navigate({ name: 'receive-scan-tx', publicKey })}
          style={{ minWidth: 220 }}
        >
          Scan Transaction
        </button>
      </div>
    }
  />
);

const ReceiveScanTx: React.FC<{ publicKey: string; navigate: (v: AppView) => void }> = ({
  publicKey,
  navigate,
}) => (
  <QRScanner
    scanWhat="Transaction"
    onScan={(data) => navigate({ name: 'receive-processing', scannedData: data, publicKey })}
    onClose={() => navigate({ name: 'receive-show-id', publicKey })}
  />
);

const ReceiveProcessing: React.FC<{
  scannedData: string;
  publicKey: string;
  navigate: (v: AppView) => void;
}> = ({ scannedData, navigate }) => {
  const wallet = useWallet();
  const [logs, setLogs] = useState<{ msg: string; type: 'ok' | 'err' | 'info' }[]>([]);
  const [done, setDone] = useState(false);

  const addLog = (msg: string, type: 'ok' | 'err' | 'info' = 'info') =>
    setLogs((prev) => [...prev, { msg, type }]);

  useEffect(() => {
    const process = async () => {
      try {
        addLog(`Scanned: ${scannedData.substring(0, 12)}...`);

        const pay = Payment.fromBase64(scannedData);
        addLog('Payment parsed successfully', 'ok');

        const transaction = Transaction.fromBEEF(pay.tx);
        const valid = await transaction.verify();

        if (!valid) {
          addLog('Transaction failed SPV verification', 'err');
          setDone(true);
          return;
        }
        addLog('SPV verification passed', 'ok');

        const response = await wallet.internalizeAction({
          tx: pay.tx,
          outputs: pay.outputs,
          description: 'Internalize Payment from Pay-QuickR',
          labels: ['Pay-QuickR', 'inbound'],
        });

        if (response.accepted) {
          addLog('Payment accepted!', 'ok');
        } else {
          addLog('Payment rejected by wallet', 'err');
        }
      } catch (error) {
        addLog(`Error: ${JSON.stringify(error)}`, 'err');
      } finally {
        setDone(true);
      }
    };

    process();
  }, []); // intentionally run once on mount

  return (
    <div
      className="page"
      style={{ alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}
    >
      <div className="glass-card" style={{ maxWidth: 560, width: '100%', padding: '32px 28px' }}>
        <h2 style={{ margin: '0 0 24px', color: 'var(--text-primary)', fontSize: '1.3rem' }}>
          {done ? 'Processing Complete' : 'Processing Payment...'}
        </h2>

        <div style={{ maxHeight: 340, overflowY: 'auto', marginBottom: 24 }}>
          {logs.map((log, i) => (
            <div key={i} className={`log-entry ${log.type}`}>
              {log.msg}
            </div>
          ))}
          {!done && (
            <div className="log-entry info" style={{ opacity: 0.6 }}>
              Working...
            </div>
          )}
        </div>

        {done && (
          <button
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={() => navigate({ name: 'home' })}
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
};
