import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, QrCode, Search, Building2, SearchCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { QRScanner } from "@/components/QRScanner";
import { useTranslation } from "@/i18n";
import { db } from "@/db/dexie";

export default function ScanHandover() { const { t } = useTranslation();
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
        setError(t("collector.scan_handover.invalid_qr") || "Invalid QR Code format.");
      }
    } catch {
      setError(t("collector.scan_handover.invalid_qr") || "Invalid QR Code format.");
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
    <div className="flex flex-col min-h-screen p-4 pb-20 space-y-6 animate-in fade-in slide-in-from-right-4 bg-background">
      <header className="flex items-center py-4">
        <button
          onClick={() => navigate("/collector")}
          className="mr-4 text-muted-foreground hover:text-charcoal"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-extrabold text-charcoal tracking-tight">Scan Handover QR</h1>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-bold shadow-sm">
          {error}
        </div>
      )}

      {isScanning ? (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="font-bold text-lg text-charcoal">Recycler Settlement</h2>
            <p className="text-muted-foreground font-medium text-sm">Scan the QR shown by the recycler to verify and settle.</p>
          </div>

          <div className="bg-charcoal p-2 rounded-3xl shadow-xl mx-auto overflow-hidden relative" style={{ width: '100%', maxWidth: '320px', aspectRatio: '1/1' }}>
            {/* Viewfinder corners */}
            <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-primary z-10 rounded-tl"></div>
            <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-primary z-10 rounded-tr"></div>
            <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-primary z-10 rounded-bl"></div>
            <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-primary z-10 rounded-br"></div>
            
            <div className="w-full h-full rounded-2xl overflow-hidden opacity-90">
              <QRScanner
                onScan={handleScanSuccess}
                onError={() => {
                  // Ignore frequent scan errors
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-8">
            <Button variant="outline" className="h-14 bg-surface border-warm-borders text-charcoal font-bold rounded-xl text-base shadow-sm" onClick={() => setIsScanning(false)}>
              Enter Reference Manually
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 mt-4">
          <Card className="border-warm-borders bg-white shadow-md rounded-2xl">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-extrabold text-charcoal text-center flex flex-col items-center justify-center gap-2 mb-2">
                <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center border border-warm-borders text-muted-foreground">
                  <SearchCode className="w-5 h-5" />
                </div>
                Manual Reference
              </h2>
              <div className="space-y-4">
                <Input
                  placeholder="REC-OKHLA-XXXX"
                  value={manualRef}
                  onChange={(e) => {
                    const val = e?.target?.value || "";
                    setManualRef(val.toUpperCase());
                  }}
                  className="font-mono text-xl h-14 text-center uppercase tracking-widest font-bold bg-surface border-warm-borders rounded-xl"
                />
                <Button className="h-14 w-full bg-primary hover:bg-primary/90 text-white font-bold text-lg rounded-xl shadow-lg" onClick={handleManualSearch}>
                  Verify Settlement
                </Button>
              </div>
            </CardContent>
          </Card>
          <Button variant="ghost" className="w-full h-14 font-bold text-muted-foreground" onClick={() => setIsScanning(true)}>
            Back to scanner
          </Button>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-widest text-center mt-auto px-4 pt-10">
        Demo limited to local device
      </p>
    </div>
  );
}
