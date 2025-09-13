import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConnectPage, SelectPage, SendPage, ReceivePage } from './pages';
import './App.css';

function App() {
  const [scannedPublicKey, setScannedPublicKey] = useState<string>('');

  const handleScan = (result: string) => {
    setScannedPublicKey(result);
    alert(`Scanned Public Key: ${result}`);
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
          path="/send" 
          element={<SendPage onScan={handleScan} />} 
        />
        <Route 
          path="/receive" 
          element={<ReceivePage />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
