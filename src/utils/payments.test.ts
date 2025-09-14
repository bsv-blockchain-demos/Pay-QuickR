import { describe, it, expect, beforeEach } from 'vitest';
import { Payment } from './payments';
import { type AtomicBEEF, type InternalizeOutput, Utils } from '@bsv/sdk';

describe('Payment', () => {
  let exampleAtomicBEEF: AtomicBEEF;
  let outputs: InternalizeOutput[];
  let rawPaymentExample: string;

  beforeEach(() => {
    // Create a simple mock transaction
    exampleAtomicBEEF = [1,1,1,1,148,6,97,249,91,104,78,144,220,47,135,205,130,157,120,198,48,241,218,55,26,2,32,120,202,40,101,173,170,65,28,17,2,0,190,239,1,254,211,239,13,0,13,2,253,112,7,2,254,166,7,20,206,241,248,176,86,133,229,118,207,215,10,181,191,2,42,33,251,74,182,226,169,132,65,52,0,97,36,72,253,113,7,0,32,44,26,158,130,65,45,5,8,13,132,145,190,65,166,51,214,202,255,54,49,101,76,53,131,171,255,247,95,52,202,163,1,253,185,3,0,6,19,179,132,164,253,91,138,141,246,51,198,40,79,255,104,29,78,23,232,140,238,63,217,110,201,96,30,229,39,89,49,1,253,221,1,0,83,53,220,59,135,234,179,7,198,7,158,236,166,83,28,139,179,84,90,114,153,159,18,137,172,249,74,231,138,235,125,219,1,239,0,255,50,127,10,111,237,253,57,32,250,149,221,225,221,94,89,11,35,57,138,198,12,194,99,16,10,148,26,32,6,41,88,1,118,0,33,50,160,9,184,40,177,226,107,248,48,80,94,228,232,148,136,78,96,6,67,74,52,118,100,200,163,69,132,20,233,230,1,58,0,80,118,9,220,204,238,251,150,108,191,6,64,142,25,238,69,251,238,161,55,247,126,77,205,114,245,23,224,91,12,64,104,1,28,0,193,198,153,204,94,172,208,36,108,197,177,181,153,227,173,97,249,8,170,140,10,249,137,225,145,26,61,56,149,75,20,55,1,15,0,248,21,34,229,115,119,191,31,25,23,207,164,114,18,169,96,138,69,1,62,93,2,48,146,227,78,57,216,126,74,219,226,1,6,0,150,222,220,57,129,132,127,176,179,247,215,235,174,123,100,73,96,131,202,51,27,107,65,233,13,249,248,160,63,132,93,48,1,2,0,225,33,215,8,128,236,227,25,133,207,7,134,98,72,97,134,188,128,154,9,97,23,146,173,95,147,197,157,111,197,1,89,1,0,0,128,150,195,253,105,196,232,17,111,212,73,99,206,24,252,187,237,107,80,148,21,98,175,169,215,36,108,171,57,206,117,150,1,1,0,232,251,99,29,12,49,41,123,243,78,250,183,35,229,181,12,201,239,2,23,253,52,39,89,210,159,224,38,182,55,177,200,1,1,0,71,188,106,76,115,137,44,78,83,13,127,102,155,192,72,226,153,0,149,66,179,244,220,192,202,157,136,60,61,72,89,87,2,1,0,1,0,0,0,1,16,91,80,13,78,49,22,115,212,203,245,161,116,82,148,211,8,39,141,30,53,164,100,252,103,56,89,22,13,77,88,18,31,0,0,0,106,71,48,68,2,32,63,86,62,215,235,225,156,70,104,244,147,142,69,238,40,118,21,164,129,167,182,188,110,22,46,118,167,64,38,64,65,183,2,32,85,163,148,194,88,225,232,13,36,220,240,16,251,225,174,61,181,87,147,24,238,19,21,219,239,196,249,133,56,125,75,254,65,33,2,129,51,165,158,205,71,209,229,68,7,100,196,155,222,4,108,162,37,22,197,34,144,194,35,96,105,215,17,7,203,216,191,255,255,255,255,3,10,0,0,0,0,0,0,0,25,118,169,20,48,116,131,133,179,242,158,221,144,43,144,143,0,59,167,28,177,32,52,222,136,172,10,0,0,0,0,0,0,0,25,118,169,20,152,75,217,251,207,101,78,111,242,100,87,130,115,42,85,140,181,58,237,171,136,172,11,0,0,0,0,0,0,0,25,118,169,20,239,255,161,119,229,221,104,248,197,49,2,62,29,57,39,66,173,6,48,150,136,172,0,0,0,0,0,1,0,0,0,1,254,166,7,20,206,241,248,176,86,133,229,118,207,215,10,181,191,2,42,33,251,74,182,226,169,132,65,52,0,97,36,72,1,0,0,0,107,72,48,69,2,33,0,185,237,61,13,208,81,179,158,18,21,38,92,194,195,238,77,1,180,58,103,112,34,212,116,57,109,202,163,17,82,226,128,2,32,14,76,169,49,133,239,242,253,175,172,9,229,160,250,150,41,26,22,156,236,8,241,123,20,101,84,132,62,182,122,106,211,65,33,2,3,2,127,88,230,140,12,69,94,180,145,52,47,3,89,188,70,97,212,61,176,237,71,30,70,183,253,218,195,189,110,140,255,255,255,255,2,6,0,0,0,0,0,0,0,25,118,169,20,8,177,187,110,190,178,85,111,97,58,217,115,64,4,87,164,163,25,124,139,136,172,3,0,0,0,0,0,0,0,25,118,169,20,15,57,128,113,74,91,203,52,200,185,190,46,145,80,234,159,174,207,193,29,136,172,0,0,0,0];
    
    outputs = [{
      outputIndex: 1,
      protocol: "wallet payment",
      paymentRemittance: {
        senderIdentityKey: "02ec9b58db65002d0971c3abe2eef3403d23602d8de2af51445d84e1b64c11a646",
        derivationPrefix: "8Vi9pv7Bnv8=",
        derivationSuffix: "gFbWjQ9rNbo="
      }
    }];

    rawPaymentExample = 'AQEBAZQGYflbaE6Q3C+HzYKdeMYw8do3GgIgeMooZa2qQRwRAgC+7wH+0+8NAA0C/XAHAv6mBxTO8fiwVoXlds/XCrW/Aioh+0q24qmEQTQAYSRI/XEHACAsGp6CQS0FCA2Ekb5BpjPWyv82MWVMNYOr//dfNMqjAf25AwAGE7OEpP1bio32M8YoT/9oHU4X6IzuP9luyWAe5SdZMQH93QEAUzXcO4fqswfGB57splMci7NUWnKZnxKJrPlK54rrfdsB7wD/Mn8Kb+39OSD6ld3h3V5ZCyM5isYMwmMQCpQaIAYpWAF2ACEyoAm4KLHia/gwUF7k6JSITmAGQ0o0dmTIo0WEFOnmAToAUHYJ3Mzu+5ZsvwZAjhnuRfvuoTf3fk3NcvUX4FsMQGgBHADBxpnMXqzQJGzFsbWZ461h+QiqjAr5ieGRGj04lUsUNwEPAPgVIuVzd78fGRfPpHISqWCKRQE+XQIwkuNOOdh+StviAQYAlt7cOYGEf7Cz99frrntkSWCDyjMba0HpDfn4oD+EXTABAgDhIdcIgOzjGYXPB4ZiSGGGvICaCWEXkq1fk8Wdb8UBWQEAAICWw/1pxOgRb9RJY84Y/Lvta1CUFWKvqdckbKs5znWWAQEA6PtjHQwxKXvzTvq3I+W1DMnvAhf9NCdZ0p/gJrY3scgBAQBHvGpMc4ksTlMNf2abwEjimQCVQrP03MDKnYg8PUhZVwIBAAEAAAABEFtQDU4xFnPUy/WhdFKU0wgnjR41pGT8ZzhZFg1NWBIfAAAAakcwRAIgP1Y+1+vhnEZo9JOORe4odhWkgae2vG4WLnanQCZAQbcCIFWjlMJY4egNJNzwEPvhrj21V5MY7hMV2+/E+YU4fUv+QSECgTOlns1H0eVEB2TEm94EbKIlFsUikMIjYGnXEQfL2L//////AwoAAAAAAAAAGXapFDB0g4Wz8p7dkCuQjwA7pxyxIDTeiKwKAAAAAAAAABl2qRSYS9n7z2VOb/JkV4JzKlWMtTrtq4isCwAAAAAAAAAZdqkU7/+hd+XdaPjFMQI+HTknQq0GMJaIrAAAAAAAAQAAAAH+pgcUzvH4sFaF5XbP1wq1vwIqIftKtuKphEE0AGEkSAEAAABrSDBFAiEAue09DdBRs54SFSZcwsPuTQG0OmdwItR0OW3KoxFS4oACIA5MqTGF7/L9r6wJ5aD6likaFpzsCPF7FGVUhD62emrTQSECAwJ/WOaMDEVetJE0LwNZvEZh1D2w7UceRrf92sO9boz/////AgYAAAAAAAAAGXapFAixu26+slVvYTrZc0AEV6SjGXyLiKwDAAAAAAAAABl2qRQPOYBxSlvLNMi5vi6RUOqfrs/BHYisAAAAAAEBAuybWNtlAC0JccOr4u7zQD0jYC2N4q9RRF2E4bZMEaZGCPFYvab+wZ7/CIBW1o0PazW6';
  });

  describe('constructor', () => {
    it('should create a Payment instance with tx and outputs', () => {
      const payment = new Payment({
        tx: exampleAtomicBEEF,
        outputs
      });

      expect(payment.tx).toBe(exampleAtomicBEEF);
      expect(payment.outputs).toBe(outputs);
    });
  });

  describe('toBase64', () => {
    it('should serialize payment to base64 string', () => {
      const payment = new Payment({
        tx: exampleAtomicBEEF,
        outputs
      });

      const base64Result = payment.toBase64();
      
      expect(typeof base64Result).toBe('string');
      expect(base64Result).toBe(rawPaymentExample);
      // Should be valid base64
      expect(() => Utils.toArray(base64Result, 'base64')).not.toThrow();
    });
  });

  describe('fromBase64', () => {
    it('should deserialize payment from base64 string', () => {
      const originalPayment = new Payment({
        tx: exampleAtomicBEEF,
        outputs
      });
      const base64Data = originalPayment.toBase64();
      const deserializedPayment = Payment.fromBase64(base64Data);

      expect(deserializedPayment).toBeInstanceOf(Payment);
      expect(deserializedPayment.outputs).toHaveLength(1);
      expect(deserializedPayment.outputs[0].outputIndex).toBe(1);
      expect(deserializedPayment.outputs[0].protocol).toBe("wallet payment");
      expect(deserializedPayment.outputs[0].paymentRemittance?.senderIdentityKey).toBe(
        outputs[0].paymentRemittance?.senderIdentityKey
      );
      expect(deserializedPayment.outputs[0].paymentRemittance?.derivationPrefix).toBe(
        outputs[0].paymentRemittance?.derivationPrefix
      );
      expect(deserializedPayment.outputs[0].paymentRemittance?.derivationSuffix).toBe(
        outputs[0].paymentRemittance?.derivationSuffix
      );
    });

    it('should throw error for invalid base64 data', () => {
      expect(() => Payment.fromBase64('invalid-base64')).toThrow();
    });

    it('should throw error for malformed payment data', () => {
      const invalidBase64 = '*&%GF*7tgsuytgisduyg---+++___&*^ fgssfgsD';
      expect(() => Payment.fromBase64(invalidBase64)).toThrow();
    });
  });

  describe('round-trip serialization', () => {
    it('should maintain data integrity through serialize/deserialize cycle', () => {
      const originalPayment = new Payment({
        tx: exampleAtomicBEEF,
        outputs
      });

      const base64Data = originalPayment.toBase64();
      const deserializedPayment = Payment.fromBase64(base64Data);

      // Verify transaction data
      expect(deserializedPayment.tx).toBeDefined();
      
      // Verify outputs match
      expect(deserializedPayment.outputs).toHaveLength(originalPayment.outputs.length);
      
      for (let i = 0; i < originalPayment.outputs.length; i++) {
        const original = originalPayment.outputs[i];
        const deserialized = deserializedPayment.outputs[i];
        
        expect(deserialized.outputIndex).toBe(original.outputIndex);
        expect(deserialized.protocol).toBe(original.protocol);
        expect(deserialized.paymentRemittance?.senderIdentityKey).toBe(
          original.paymentRemittance?.senderIdentityKey
        );
        expect(deserialized.paymentRemittance?.derivationPrefix).toBe(
          original.paymentRemittance?.derivationPrefix
        );
        expect(deserialized.paymentRemittance?.derivationSuffix).toBe(
          original.paymentRemittance?.derivationSuffix
        );
      }
    });

  });

});
