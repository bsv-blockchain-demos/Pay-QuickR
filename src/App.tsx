import { useState, useCallback } from 'react';
import { ConnectPage, SelectPage, SendPage, ReceivePage } from './pages';
import './App.css';

export interface PaymentState {
  paymentData: {
    senderIdentityKey: string;
    derivationPrefix: string;
    derivationSuffix: string;
  };
  response: any;
  timestamp: number;
  counterparty: string;
  satoshis: number;
}

export type AppView =
  | { name: 'connect' }
  | { name: 'home' }
  | { name: 'send-prompt' }
  | { name: 'send-scan-key' }
  | { name: 'send-form'; counterparty: string }
  | { name: 'send-show-qr'; payments: PaymentState[]; currentPayment: PaymentState }
  | { name: 'receive-show-id'; publicKey: string }
  | { name: 'receive-scan-tx'; publicKey: string }
  | { name: 'receive-processing'; scannedData: string; publicKey: string };

export type SendView = Extract<
  AppView,
  { name: 'send-prompt' | 'send-scan-key' | 'send-form' | 'send-show-qr' }
>;
export type ReceiveView = Extract<
  AppView,
  { name: 'receive-show-id' | 'receive-scan-tx' | 'receive-processing' }
>;

function App() {
  const [view, setView] = useState<AppView>({ name: 'connect' });

  const navigate = useCallback((v: AppView) => setView(v), []);

  switch (view.name) {
    case 'connect':
      return <ConnectPage navigate={navigate} />;
    case 'home':
      return <SelectPage navigate={navigate} />;
    case 'send-prompt':
    case 'send-scan-key':
    case 'send-form':
    case 'send-show-qr':
      return <SendPage view={view as SendView} navigate={navigate} />;
    case 'receive-show-id':
    case 'receive-scan-tx':
    case 'receive-processing':
      return <ReceivePage view={view as ReceiveView} navigate={navigate} />;
    default:
      return <ConnectPage navigate={navigate} />;
  }
}

export default App;
