import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConnectPage, SelectPage, ScanPage, DisplayPage, TransmitPage, ReceivePage } from './pages';
import './App.css';

function App() {
  const [scannedPublicKey, setScannedPublicKey] = useState<string>('');
  const [payment, setPayment] = useState<any>(null);
  
  const handlePublicKeyScan = (result: string) => {
    setScannedPublicKey(result);
  };

  const handleTransactionScan = (result: string) => {
    alert(`Scanned Transaction: ${result}`);
  };

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<ConnectPage />} />
        <Route 
          path="/select" 
          element={<SelectPage scannedPublicKey={scannedPublicKey} />} 
        />
        <Route 
          path="/scan" 
          element={<ScanPage onScan={handlePublicKeyScan} setPayment={setPayment} scannedPublicKey={scannedPublicKey} />} 
        />
        <Route 
          path="/display" 
          element={<DisplayPage />}
        />
        <Route 
          path="/transmit" 
          element={<TransmitPage payment={payment} />}
        />
        <Route 
          path="/receive" 
          element={<ReceivePage onScan={handleTransactionScan} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
