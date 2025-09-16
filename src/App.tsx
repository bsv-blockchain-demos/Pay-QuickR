import { Routes, Route, Navigate } from 'react-router-dom';
import { ConnectPage, SelectPage, SendPage, ReceivePage } from './pages';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<ConnectPage />} />
        <Route 
          path="/select" 
          element={<SelectPage />} 
        />
        <Route 
          path="/send" 
          element={<SendPage />} 
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
