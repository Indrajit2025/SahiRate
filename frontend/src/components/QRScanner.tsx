import { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export function QRScanner({ onScan, onError }: { onScan: (text: string) => void, onError: (err: any) => void }) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );
    scannerRef.current.render(
      (decodedText) => {
        if (scannerRef.current) {
          scannerRef.current.clear().catch(console.error);
        }
        onScan(decodedText);
      },
      (error) => {
        onError(error);
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [onScan, onError]);

  return <div id="reader" className="w-full max-w-sm mx-auto overflow-hidden rounded-xl border-2 border-primary"></div>;
}
