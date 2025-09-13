import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QRScanner } from '../components/QRScanner';

interface SendPageProps {
  onScan: (result: string) => void;
}

export const SendPage: React.FC<SendPageProps> = ({ onScan }) => {
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
