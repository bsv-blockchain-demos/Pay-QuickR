import { type AtomicBEEF, type InternalizeOutput, Beef, Utils } from "@bsv/sdk";


export class Payment {
    tx: AtomicBEEF;
    outputs: InternalizeOutput[];
    
    constructor(args : { tx: AtomicBEEF, outputs: InternalizeOutput[] }) {
        this.tx = args.tx;
        this.outputs = args.outputs;
    }

    toBase64() {
        const writer = new Utils.Writer()
        writer.write(this.tx)
        writer.writeVarIntNum(this.outputs.length)
        for (const output of this.outputs) {
            writer.writeVarIntNum(output.outputIndex)
            writer.write(Utils.toArray(output!.paymentRemittance!.senderIdentityKey, 'hex'))
            const derivationPrefixBytes = Utils.toArray(output!.paymentRemittance!.derivationPrefix, 'base64')
            writer.writeVarIntNum(derivationPrefixBytes.length)
            writer.write(derivationPrefixBytes)
            const derivationSuffixBytes = Utils.toArray(output!.paymentRemittance!.derivationSuffix, 'base64')
            writer.writeVarIntNum(derivationSuffixBytes.length)
            writer.write(derivationSuffixBytes)
        }

        return Utils.toBase64(writer.toArray())
    }

    static fromBase64(data: string) {
        const reader = new Utils.Reader(Utils.toArray(data, 'base64'))
        const beef = Beef.fromReader(reader)
        const tx = beef.toBinaryAtomic(beef.atomicTxid as string)
        const outputsCount = reader.readVarIntNum()
        const outputs: InternalizeOutput[] = []
        for (let i = 0; i < outputsCount; i++) {
            const outputIndex = reader.readVarIntNum()
            const senderIdentityKey = Utils.toHex(reader.read(33))
            const derivationPreLength = reader.readVarIntNum()
            const derivationPrefix = Utils.toBase64(reader.read(derivationPreLength))
            const derivationSuffixLength = reader.readVarIntNum()
            const derivationSuffix = Utils.toBase64(reader.read(derivationSuffixLength))
            outputs.push({
                outputIndex,
                protocol: "wallet payment",
                paymentRemittance: {
                    senderIdentityKey,
                    derivationPrefix,
                    derivationSuffix
                }
            })
        }

        return new Payment({ tx, outputs })
    }

}