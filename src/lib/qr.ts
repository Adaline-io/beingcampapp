import QRCode from 'qrcode';

/**
 * QR generation for the design layer (which reaches shared code via window
 * globals). Zone check-in QRs encode `<app>/?checkin=<zoneId>` — a member scans
 * it with their phone camera, the app opens, and the check-in runs server-side.
 */
export function installQR(): void {
  (window as unknown as Record<string, unknown>).BeingCampQR = {
    toDataURL: (text: string, opts?: Record<string, unknown>) =>
      QRCode.toDataURL(text, {
        margin: 1,
        width: 320,
        errorCorrectionLevel: 'M',
        color: { dark: '#0a0a0b', light: '#f2efe9' },
        ...opts,
      }),
  };
}
