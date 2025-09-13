import { WalletClient } from '@bsv/sdk';

/**
 * Simple wallet instance for components to use directly
 */
export const wallet = new WalletClient();

export const useWallet = () => {
  return wallet;
};