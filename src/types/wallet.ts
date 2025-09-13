import { PublicKey } from '@bsv/sdk';

/**
 * Wallet connection status enum
 */
export const WalletStatus = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error'
} as const;

export type WalletStatus = typeof WalletStatus[keyof typeof WalletStatus];

/**
 * Wallet error types following BSV SDK patterns
 */
export interface WalletError {
  code: string;
  message: string;
  details?: any;
}

/**
 * Wallet connection state
 */
export interface WalletState {
  status: WalletStatus;
  isAuthenticated: boolean;
  publicKey: PublicKey | null;
  error: WalletError | null;
}

/**
 * Wallet service interface following BRC standards
 */
export interface WalletServiceInterface {
  connect(): Promise<boolean>;
  disconnect(): void;
  isAuthenticated(): Promise<boolean>;
  getPublicKey(options?: { identityKey?: boolean }): Promise<PublicKey>;
  getAddress(): Promise<string>;
}

/**
 * QR code generation options
 */
export interface QRCodeOptions {
  size?: number;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Public key info for display
 */
export interface PublicKeyInfo {
  publicKey: PublicKey;
  address: string;
  compressed: boolean;
  hex: string;
}