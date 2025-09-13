import QRCode from 'qrcode';
import { PublicKey } from '@bsv/sdk';
import type { QRCodeOptions, PublicKeyInfo } from '../types/wallet';

/**
 * QR Code utilities for BSV wallet integration
 * Supports generating QR codes for public keys, addresses, and payment URIs
 */

/**
 * Generate QR code as data URL for public key
 */
export async function generatePublicKeyQR(
  publicKey: PublicKey | string,
  options: QRCodeOptions = {}
): Promise<string> {
  try {
    let publicKeyHex: string;
    
    if (typeof publicKey === 'string') {
      publicKeyHex = publicKey;
    } else {
      publicKeyHex = publicKey.toString();
    }

    const qrOptions = {
      width: options.size || 256,
      margin: options.margin || 2,
      errorCorrectionLevel: options.errorCorrectionLevel || 'M' as const,
      color: {
        dark: options.color?.dark || '#000000',
        light: options.color?.light || '#FFFFFF'
      }
    };

    return await QRCode.toDataURL(publicKeyHex, qrOptions);
  } catch (error) {
    throw new Error(`Failed to generate QR code for public key: ${error}`);
  }
}

/**
 * Generate QR code as data URL for BSV address
 */
export async function generateAddressQR(
  address: string,
  options: QRCodeOptions = {}
): Promise<string> {
  try {
    const qrOptions = {
      width: options.size || 256,
      margin: options.margin || 2,
      errorCorrectionLevel: options.errorCorrectionLevel || 'M' as const,
      color: {
        dark: options.color?.dark || '#000000',
        light: options.color?.light || '#FFFFFF'
      }
    };

    return await QRCode.toDataURL(address, qrOptions);
  } catch (error) {
    throw new Error(`Failed to generate QR code for address: ${error}`);
  }
}

/**
 * Generate QR code for BSV payment URI
 * Format: bsv:address?amount=0.001&label=Payment
 */
export async function generatePaymentQR(
  address: string,
  amount?: number,
  label?: string,
  message?: string,
  options: QRCodeOptions = {}
): Promise<string> {
  try {
    let uri = `bsv:${address}`;
    const params = new URLSearchParams();

    if (amount !== undefined) {
      params.append('amount', amount.toString());
    }
    if (label) {
      params.append('label', label);
    }
    if (message) {
      params.append('message', message);
    }

    if (params.toString()) {
      uri += `?${params.toString()}`;
    }

    const qrOptions = {
      width: options.size || 256,
      margin: options.margin || 2,
      errorCorrectionLevel: options.errorCorrectionLevel || 'M' as const,
      color: {
        dark: options.color?.dark || '#000000',
        light: options.color?.light || '#FFFFFF'
      }
    };

    return await QRCode.toDataURL(uri, qrOptions);
  } catch (error) {
    throw new Error(`Failed to generate payment QR code: ${error}`);
  }
}

/**
 * Get comprehensive public key information for display
 */
export function getPublicKeyInfo(publicKey: PublicKey): PublicKeyInfo {
  try {
    const address = publicKey.toAddress();
    const hex = publicKey.toString();
    // BSV SDK PublicKey doesn't expose compressed property directly
    // We can determine this from the hex length: compressed = 66 chars, uncompressed = 130 chars
    const compressed = hex.length === 66;

    return {
      publicKey,
      address,
      compressed,
      hex
    };
  } catch (error) {
    throw new Error(`Failed to get public key info: ${error}`);
  }
}

/**
 * Validate BSV address format
 */
export function isValidBSVAddress(address: string): boolean {
  try {
    // Basic validation - in production you might want more robust validation
    return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address);
  } catch (error) {
    return false;
  }
}

/**
 * Format satoshis as BSV with proper decimal places
 */
export function formatBSV(satoshis: number): string {
  const bsv = satoshis / 100000000; // 1 BSV = 100,000,000 satoshis
  return bsv.toFixed(8).replace(/\.?0+$/, '') + ' BSV';
}

/**
 * Parse BSV amount to satoshis
 */
export function parseBSVToSatoshis(bsvAmount: string | number): number {
  const amount = typeof bsvAmount === 'string' ? parseFloat(bsvAmount) : bsvAmount;
  return Math.round(amount * 100000000);
}