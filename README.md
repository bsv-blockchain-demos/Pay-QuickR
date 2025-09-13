# Pay-QuickR - BSV Wallet Integration Demo

A React TypeScript application demonstrating BSV wallet authentication and integration using the @bsv/sdk v1.7.6.

## Features

✅ **Complete BSV Wallet Integration**
- WalletClient instance creation and management
- `wallet.isAuthenticated()` check functionality
- `wallet.getPublicKey({ identityKey: true })` implementation
- React component with "Connect Wallet" button
- QR code generation for public keys and addresses

✅ **BSV SDK Integration**
- Proper use of BSV terminology (locking/unlocking scripts)
- WalletInterface compliance
- BRC standards following
- Zero-dependency architecture

✅ **TypeScript Support**
- Comprehensive type definitions
- Proper error handling patterns
- Type-safe wallet operations

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Usage

1. **Connect Wallet**: Click the "Connect Wallet" button to create/connect to a demo wallet
2. **View Public Key**: Once connected, view your wallet's public key information
3. **Generate QR Codes**: Create QR codes for your public key or address
4. **Copy Information**: Click on addresses or public keys to copy to clipboard

## Architecture

### Core Components

- **`/src/services/walletService.ts`**: Core BSV wallet functionality with WalletInterface implementation
- **`/src/hooks/useWallet.ts`**: React hook for wallet state management
- **`/src/types/wallet.ts`**: Comprehensive TypeScript type definitions
- **`/src/utils/qrCodeUtils.ts`**: QR code generation utilities
- **`/src/components/WalletConnect.tsx`**: Main wallet interaction component

### BSV SDK Features Used

- `PrivateKey` and `PublicKey` classes for cryptographic operations
- `P2PKH` template for address generation
- `WalletInterface` implementation for standardized operations
- Proper BSV terminology and BRC compliance

## API Reference

### WalletService

```typescript
import { walletService } from './src/services/walletService';

// Connect to wallet
const connected = await walletService.connect();

// Check authentication
const isAuth = await walletService.isAuthenticated();

// Get public key
const publicKey = await walletService.getPublicKey({ identityKey: true });

// Get address
const address = await walletService.getAddress();
```

### useWallet Hook

```typescript
import { useWallet } from './src/hooks/useWallet';

function MyComponent() {
  const {
    status,
    isAuthenticated,
    publicKeyInfo,
    error,
    connect,
    disconnect,
    getPublicKey,
    getAddress
  } = useWallet();

  // ... component logic
}
```

### QR Code Utilities

```typescript
import { generatePublicKeyQR, generateAddressQR } from './src/utils/qrCodeUtils';

// Generate public key QR code
const qrDataUrl = await generatePublicKeyQR(publicKey, {
  size: 256,
  errorCorrectionLevel: 'M'
});

// Generate address QR code
const addressQR = await generateAddressQR(address);
```

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

### TypeScript Configuration

The project is configured with:
- Target: ES2020 (for BigInt support)
- Module: ESNext (for ESM)
- Strict mode enabled
- React 19 support

## Production Considerations

### Current Implementation (Demo)

- Uses randomly generated wallet stored in localStorage
- Simplified error handling
- Mock transaction creation
- Single address reuse (not recommended)

### Production Recommendations

1. **Real Wallet Integration**: Replace demo wallet with:
   - HandCash Connect SDK
   - Browser extension wallets
   - Hardware wallet support

2. **Enhanced Security**:
   - Implement BRC-42 key derivation for privacy
   - Never reuse addresses
   - Proper key management

3. **Transaction Management**:
   - UTXO fetching and selection
   - Proper fee calculation
   - SPV verification
   - ARC broadcasting

4. **Network Support**:
   - Testnet/mainnet switching
   - Multiple node connections
   - Fallback providers

See `/src/examples/productionWalletExample.ts` for production implementation patterns.

## BSV Standards Compliance

This implementation follows these BRC (Bitcoin Request for Comments) standards:

- **BRC-42**: Key derivation scheme (ready for implementation)
- **BRC-29**: Simple P2PKH payment protocol
- **Proper Terminology**: Uses "locking script" and "unlocking script" (not scriptPubKey/scriptSig)
- **WalletInterface**: Compatible with BSV SDK standards

## Dependencies

### Production Dependencies
- `@bsv/sdk`: ^1.7.6 - BSV blockchain operations
- `qrcode`: ^1.5.4 - QR code generation
- `react`: ^19.1.1 - UI framework
- `react-dom`: ^19.1.1 - React DOM rendering

### Development Dependencies
- `typescript`: ~5.8.3
- `vite`: ^7.1.2
- `@vitejs/plugin-react`: ^5.0.0
- Various TypeScript type definitions

## Resources

- [BSV SDK Documentation](https://bsv-blockchain.github.io/ts-sdk)
- [BSV SDK Repository](https://github.com/bsv-blockchain/ts-sdk)
- [BRC Standards](https://github.com/bitcoin-sv/BRCs)
- [BSV Academy](https://academy.bsv.org/)
