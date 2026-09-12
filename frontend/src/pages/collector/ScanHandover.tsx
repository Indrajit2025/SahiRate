import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, QrCode, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { QRScanner } from "@/components/QRScanner";
import { db } from "@/db/dexie";

export default function ScanHandover() {
  const navigate = useNavigate();
  const [manualRef, setManualRef] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  const handleScanSuccess = async (text: string) => {
    try {
      const payload = JSON.parse(text);
      if (payload.type === "SAHIRATE_HANDOVER" && payload.handover_id) {
        navigate(`/collector/handover/${payload.handover_id}`);
      } else {
        setError("Invalid QR code format.");
      }
    } catch {
      setError("Invalid QR code data. Make sure you scan a valid SahiRate Handover QR.");
    }
  };

  const handleManualSearch = async () => {
    if (!manualRef) return;
    const handover = await db.handovers.where("qr_reference").equals(manualRef.toUpperCase()).first();
    if (handover) {
      navigate(`/collector/handover/${handover.id}`);
    } else {
      setError("No handover found with that reference.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-4 pb-20 space-y-6 animate-in fade-in slide-in-from-right-4">
      <header className="flex items-center py-4">
        <button
          onClick={() => navigate("/collector")}
          className="mr-4 text-muted-foreground hover:text-foreground"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">Scan Handover</h1>
      </header>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {isScanning ? (
        <Card className="border-primary/20 shadow-sm overflow-hidden">
          <CardContent className="p-4 flex flex-col items-center">
            <h2 className="font-semibold mb-4 text-center">Scan Recycler's QR Code</h2>
            <QRScanner
              onScan={handleScanSuccess}
              onError={() => {
                // Ignore frequent scan errors (expected when no QR is in frame)
              }}
            />
            <Button variant="ghost" className="mt-4" onClick={() => setIsScanning(false)}>
              Enter manual reference instead
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-primary/20 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold text-center flex items-center justify-center gap-2">
              <QrCode className="w-5 h-5" />
              Manual Reference
            </h2>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. A1B2C3D4"
                value={manualRef}
                onChange={(e) => setManualRef(e.target.value.toUpperCase())}
                className="font-mono text-lg h-12 uppercase"
              />
              <Button className="h-12 w-12" onClick={handleManualSearch} aria-label="Find handover by reference">
                <Search className="w-5 h-5" />
              </Button>
            </div>
            <Button variant="ghost" className="w-full mt-2" onClick={() => setIsScanning(true)}>
              Back to scanner
            </Button>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground text-center mt-4 px-2">
        Note: QR scanning is currently limited to this local device for demo purposes (M12 feature).
      </p>
    </div>
  );
}
