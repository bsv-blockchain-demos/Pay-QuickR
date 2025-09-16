/**
 * QR Code chunking utilities for handling large data
 * Splits data into multiple QR codes when over 100 characters
 */

export interface QRChunk {
  id: string;
  index: number;
  total: number;
  data: string;
}

export interface ChunkedData {
  chunks: QRChunk[];
  isChunked: boolean;
}

/**
 * Split data into chunks if over 100 characters
 */
export function chunkData(data: string, maxChunkSize: number = 80): ChunkedData {
  if (data.length <= 100) {
    return {
      chunks: [{
        id: generateChunkId(),
        index: 0,
        total: 1,
        data
      }],
      isChunked: false
    };
  }

  const chunks: QRChunk[] = [];
  const chunkId = generateChunkId();
  
  // Calculate how many chunks we need
  const totalChunks = Math.ceil(data.length / maxChunkSize);
  
  for (let i = 0; i < totalChunks; i++) {
    const start = i * maxChunkSize;
    const end = Math.min(start + maxChunkSize, data.length);
    const chunkData = data.slice(start, end);
    
    // Format: CHUNK:id:index:total:data
    const formattedChunk = `CHUNK:${chunkId}:${i}:${totalChunks}:${chunkData}`;
    
    chunks.push({
      id: chunkId,
      index: i,
      total: totalChunks,
      data: formattedChunk
    });
  }

  return {
    chunks,
    isChunked: true
  };
}

/**
 * Parse a QR code result to check if it's a chunk
 */
export function parseQRChunk(qrData: string): QRChunk | null {
  if (!qrData.startsWith('CHUNK:')) {
    return null;
  }

  const parts = qrData.split(':');
  if (parts.length < 5) {
    return null;
  }

  const [, id, indexStr, totalStr, ...dataParts] = parts;
  const index = parseInt(indexStr, 10);
  const total = parseInt(totalStr, 10);
  const data = dataParts.join(':'); // Rejoin in case original data had colons

  if (isNaN(index) || isNaN(total)) {
    return null;
  }

  return {
    id,
    index,
    total,
    data
  };
}

/**
 * Manage collection of chunked QR codes
 */
export class ChunkCollector {
  private chunks: Map<string, Map<number, string>> = new Map();
  private chunkTotals: Map<string, number> = new Map();

  /**
   * Add a chunk and return the complete data if all chunks are collected
   */
  addChunk(chunk: QRChunk): string | null {
    if (!this.chunks.has(chunk.id)) {
      this.chunks.set(chunk.id, new Map());
      this.chunkTotals.set(chunk.id, chunk.total);
    }

    const chunkMap = this.chunks.get(chunk.id)!;
    chunkMap.set(chunk.index, chunk.data);

    // Check if we have all chunks
    const expectedTotal = this.chunkTotals.get(chunk.id)!;
    if (chunkMap.size === expectedTotal) {
      // Reconstruct the original data
      const sortedChunks: string[] = [];
      for (let i = 0; i < expectedTotal; i++) {
        const chunkData = chunkMap.get(i);
        if (!chunkData) {
          return null; // Missing chunk
        }
        sortedChunks.push(chunkData);
      }

      // Clean up
      this.chunks.delete(chunk.id);
      this.chunkTotals.delete(chunk.id);

      return sortedChunks.join('');
    }

    return null;
  }

  /**
   * Get progress for a specific chunk ID
   */
  getProgress(chunkId: string): { collected: number; total: number } | null {
    const chunkMap = this.chunks.get(chunkId);
    const total = this.chunkTotals.get(chunkId);
    
    if (!chunkMap || !total) {
      return null;
    }

    return {
      collected: chunkMap.size,
      total
    };
  }

  /**
   * Clear all collected chunks
   */
  clear(): void {
    this.chunks.clear();
    this.chunkTotals.clear();
  }

  /**
   * Clear chunks for a specific ID
   */
  clearChunks(chunkId: string): void {
    this.chunks.delete(chunkId);
    this.chunkTotals.delete(chunkId);
  }
}

/**
 * Generate a unique chunk ID
 */
function generateChunkId(): string {
  return Math.random().toString(36).substr(2, 9);
}
