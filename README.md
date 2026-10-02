# Pay-QuickR

A React and TypeScript demo for sending BSV payments between BRC-100 wallets using QR codes. The recipient presents an identity key, the sender creates a BRC-29 payment, and an animated QR sequence carries the transaction and remittance data back to the recipient.

**Payments are real wallet actions.** The current app connects to an existing wallet through `WalletClient`; it does not generate or store a mock wallet private key. It uses the BSV SDK 2.x and wallet-toolbox client.

## How it works

1. The receiving wallet displays its identity public key as a QR code.
2. The sender scans that key, enters a satoshi amount and authorises `createAction`.
3. The sender derives a BRC-29 payment key and creates a P2PKH output for the recipient.
4. The app serialises the Atomic BEEF transaction and payment-remittance fields into base64.
5. Long payloads are split into an animated sequence of QR chunks.
6. The recipient scans the complete sequence, calls the SDK's transaction verification and asks its wallet to internalise the payment.

QR exchange carries the payment data directly between devices. Wallet services and transaction verification can still require a network connection; this is not an offline-payment guarantee.

## Run locally

Use Node.js 22.12 or newer and npm. A two-party demonstration needs two BRC-100 wallet identities, a funded sending wallet, cameras and permission to access them.

```sh
git clone https://github.com/bsv-blockchain-demos/Pay-QuickR.git
cd Pay-QuickR
npm ci
npm run dev
```

Open the Vite URL, normally `http://localhost:5173`, in an environment that can access the wallet. No application backend or environment variables are required.

Browser camera access requires a secure context. `localhost` can be used for local testing; a phone opening another machine's plain-HTTP LAN address may not be able to use its camera. Use an HTTPS origin for that device and configure any development hostname in [vite.config.ts](vite.config.ts).

The application has no network selector. Configure the participating wallets for the same network and verify compatibility of their payment and verification services before transferring funds.

## Try a payment

1. Connect both wallets. On the recipient device, select **Receive** to display its identity QR code.
2. On the sender device, select **Send** and scan the recipient's identity key.
3. Enter a small whole-number amount in satoshis, then select **Create Payment** and approve the wallet request.
4. Keep the sender's transaction QR sequence visible. On the recipient device, select **Scan Transaction** and collect all chunks.
5. Review the verification and internalisation messages, then inspect the receiving wallet.

Creating the payment is the spending action. **Clear Payment** removes the saved outbound entry from this app; it does not cancel or refund a transaction. There is no recipient acknowledgement channel back to the sender, so confirm receipt with the receiving wallet before clearing the QR entry.

## Local data and limits

Pending outbound payment responses, remittance details, recipient identities, amounts and timestamps are stored in `localStorage` under `outboundPayments`. Reopening the send flow resumes the first saved payment. Clearing browser data removes this local handover record, rather than reversing wallet activity.

The custom QR format uses `CHUNK:<id>:<index>:<total>:<data>`. Payloads longer than 100 characters are split into 80-character pieces, and the display advances at approximately 200-millisecond intervals. This format is intended for another instance of this app; an ordinary address-only QR reader cannot import the transaction.

The UI parses amounts as integers, so enter whole satoshi amounts and review the wallet request. Transaction verification and wallet acceptance do not themselves establish that a transaction is mined.

## Build and checks

| Command | Purpose |
| --- | --- |
| `npm run build` | Type-check and build static assets in `dist/`. |
| `npm run preview` | Preview the production build. |
| `npm run lint` | Run ESLint. |
| `npx vitest run src/utils/payments.test.ts` | Run six payment serialisation and deserialisation tests. |

There is no `npm test` script, but Vitest is included in the dependencies. The tests cover the binary payment format, not cameras, wallet integration or a live transfer.

The app can be served as static files. [vercel.json](vercel.json) and [public/_redirects](public/_redirects) include SPA fallback configuration for the supplied hosting targets.

## Code map

- [src/hooks/useWallet.ts](src/hooks/useWallet.ts): shared SDK wallet client.
- [src/pages/SendPage.tsx](src/pages/SendPage.tsx): recipient scanning, payment creation and saved outbound payments.
- [src/pages/ReceivePage.tsx](src/pages/ReceivePage.tsx): transaction verification and wallet internalisation.
- [src/utils/payments.ts](src/utils/payments.ts): payment serialisation format.
- [src/utils/qrChunking.ts](src/utils/qrChunking.ts): QR splitting and reconstruction.

The active flow is selected in [src/App.tsx](src/App.tsx). Older example files are not an alternative wallet implementation used by that flow.

## Licence

**Apache 2.0 licence.** See [LICENSE.md](LICENSE.md) for the full terms. A browser-served copy is available in [public/LICENSE.txt](public/LICENSE.txt).
