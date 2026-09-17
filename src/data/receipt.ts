// The receipt's scan code: a barcode on the first print, a QR code on the reprint. Both point at the same video.
export const receiptCode = {
  barcode: "youtu.be/dQw4w9WgXcQ",
  url: "https://youtu.be/dQw4w9WgXcQ",
} as const;

// Reprints left before the printer runs out of paper.
export const PAPER_FOR_REPRINTS = 1;
