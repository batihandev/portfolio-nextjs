import QRCode from "qrcode";

/** QR modules as rows of "1" (dark) and "0" (light), computed at build time. */
export const qrModules = (text: string): string[] => {
  const { modules } = QRCode.create(text, { errorCorrectionLevel: "M" });
  return Array.from({ length: modules.size }, (_, row) =>
    Array.from({ length: modules.size }, (_, col) => (modules.get(row, col) ? "1" : "0")).join(""),
  );
};
