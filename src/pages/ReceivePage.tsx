import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QRScanner } from '../components/QRScanner';

interface ReceivePageProps {
  onScan: (result: string) => void;
}

export const ReceivePage: React.FC<ReceivePageProps> = ({ onScan }) => {
  const navigate = useNavigate();

  const handleScan = (result: string) => {
    onScan(result);
    navigate('/select');
  };

  return (
    <QRScanner
      onScan={handleScan}
      onClose={() => navigate('/select')}
    />
  );
};
