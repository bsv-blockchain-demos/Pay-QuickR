/**
 * Generate a random base64 string of specified length
 * @param length - Number of bytes to generate (will be base64 encoded)
 * @returns Random base64 string
 */
export function RandomBase64(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}
