import React, { useState, useRef } from "react";
import { useTranslation } from "@/i18n";
import { classifyMaterial } from "@/services/ai/inference";
import type { MaterialClassificationResult } from "@/services/ai/inference";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, RotateCcw, AlertTriangle, ArrowRight, ShieldCheck, Tag, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Scan() {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MaterialClassificationResult | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    return () => {
      if (imageUri) {
        URL.revokeObjectURL(imageUri);
      }
    };
  }, [imageUri]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (imageUri) {
      URL.revokeObjectURL(imageUri);
    }
    setImageUri(URL.createObjectURL(file));
    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const classification = await classifyMaterial(file);
      if (classification && classification.confidence > 0.4) {
        setResult(classification);
      } else {
        setError(t("public.scan.failed_identify"));
      }
    } catch (err) {
      console.error(err);
      setError(t("public.scan.failed_identify"));
    } finally {
      setIsProcessing(false);
    }
  };

  const retry = () => {
    if (imageUri) {
      URL.revokeObjectURL(imageUri);
    }
    setImageUri(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getMockPrice = (materialId: string) => {
    const prices: Record<string, string> = {
      pcb: "₹110 / kg",
      copper: "₹640 / kg",
      aluminium: "₹165 / kg",
      battery: "₹72 / kg",
      plastic: "₹24 / kg",
    };
    return prices[materialId.toLowerCase()] || "₹-- / kg";
  };

  return (
    <div className="flex-1 flex flex-col px-4 py-6">
      
      {/* Header with dynamic Back button */}
      <div className="flex items-center mb-6">
        <Link to="/" className="flex items-center gap-2 text-charcoal hover:text-primary transition-colors active:scale-95 -ml-2 p-2 rounded-lg" onClick={(e) => {
          if (imageUri) {
            e.preventDefault();
            retry();
          }
        }}>
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold text-[15px]">
            {imageUri ? "Material Result" : "Scan Scrap"}
          </span>
        </Link>
      </div>

      {/* Initial Scan State */}
      {!imageUri && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-8 mt-4 animate-in fade-in duration-300">
          <div className="w-40 h-40 bg-surface border-2 border-dashed border-warm-borders-dark rounded-3xl flex items-center justify-center shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5"></div>
            <Camera className="w-12 h-12 text-primary opacity-80" />
          </div>
          
          <div className="text-center space-y-3">
            <h1 className="text-2xl font-extrabold text-charcoal">{t("public.landing.scan_cta")}</h1>
            <p className="text-muted-foreground text-sm max-w-[260px] mx-auto leading-relaxed">
              Take a clear photo of the scrap material to identify it and see its reference value.
            </p>
          </div>
          
          <div className="flex flex-col gap-4 w-full max-w-[280px] mt-8 pt-4">
            <Button size="lg" className="h-14 text-lg bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 flex gap-2 active:scale-[0.98] transition-transform" onClick={() => fileInputRef.current?.click()}>
              <Camera className="w-5 h-5" />
              Open Camera
            </Button>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFile} 
            />
          </div>
        </div>
      )}

      {/* Processing & Result State */}
      {imageUri && (
        <div className="flex-1 flex flex-col space-y-6 animate-in fade-in duration-300 pb-8">
          
          {/* Constrained Image Container (4:3 aspect ratio, ~30-35% viewport max) */}
          <div className="relative aspect-[4/3] w-full max-h-[30vh] rounded-xl overflow-hidden bg-charcoal shadow-md border-2 border-warm-borders">
            <img 
              src={result?.overlayUri || imageUri} 
              alt="Scrap" 
              className="w-full h-full object-contain p-1 " 
            />
            
            {isProcessing && (
              <div className="absolute inset-0 bg-charcoal/70 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
                <div className="w-12 h-12 border-4 border-white/20 border-t-copper rounded-full animate-spin mb-4" />
                <p className="font-bold tracking-wide">{t("public.scan.checking")}</p>
              </div>
            )}
          </div>

          {!isProcessing && error && (
            <Card className="border-amber-200 bg-amber-50 rounded-2xl shadow-sm">
              <div className="p-5 flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <p className="font-bold text-amber-900 text-lg">{error}</p>
                <div className="flex flex-col gap-3 w-full mt-2">
                  <Button size="lg" className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold" onClick={retry}>
                    {t("public.scan.try_again")}
                  </Button>
                  <Button size="lg" variant="outline" className="w-full h-12 bg-white border-amber-200 text-amber-800 hover:bg-amber-100 rounded-xl font-bold">
                    {t("public.scan.choose_manual")}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {!isProcessing && result && (
            <div className="space-y-6">
              {/* Material Specification Slip */}
              <Card className="border-warm-borders bg-surface shadow-sm overflow-hidden border-t-8 border-t-primary rounded-2xl">
                <div className="p-6 space-y-6">
                  
                  {/* Header: Identity & Confidence */}
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                        {t("public.result.ai_identified")}
                      </p>
                      <h2 className="text-3xl font-extrabold text-charcoal leading-none tracking-tight">{result.material}</h2>
                    </div>
                    <div className="bg-success/10 text-success border border-success/20 px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 shrink-0 mt-1">
                      <ShieldCheck className="w-3 h-3" />
                      {t("public.result.confidence", { score: result.confidencePercent.toString() })}
                    </div>
                  </div>

                  {result.otherMaterials && result.otherMaterials.length > 0 && (
                    <div className="border-t-2 border-dashed border-warm-borders-dark pt-5">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                        OTHER DETECTED MATERIALS
                      </p>
                      <div className="flex flex-col gap-2">
                        {result.otherMaterials.map((om: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-warm-borders shadow-sm">
                            <span className="font-bold text-charcoal text-sm">{om.material}</span>
                            <span className="text-xs font-bold text-muted-foreground bg-surface px-2 py-1 rounded border border-warm-borders">{om.confidencePercent}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pricing Divider */}
                  <div className="border-t-2 border-dashed border-warm-borders-dark pt-5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                      {t("public.result.reference_rate")}
                    </p>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-extrabold text-primary font-mono tracking-tight leading-none">{getMockPrice(result.materialId)}</span>
                    </div>
                    <p className="text-xs font-medium text-muted-foreground mt-3 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-copper" />
                      {t("public.result.updated_today")}
                    </p>
                  </div>

                  {/* Details Divider */}
                  <div className="border-t-2 border-dashed border-warm-borders-dark pt-5 space-y-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {t("public.result.material_spec")}
                    </p>
                    <div className="bg-white p-4 rounded-xl border border-warm-borders shadow-sm text-sm text-charcoal">
                      <p className="font-bold mb-2 text-primary">{t("public.result.recoverable")}</p>
                      <ul className="list-disc list-inside text-muted-foreground font-medium space-y-1.5">
                        <li>Standard components</li>
                        <li>Trace metals</li>
                        <li>Recyclable housing</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <Button size="lg" className="w-full text-lg h-14 bg-charcoal hover:bg-black text-white rounded-xl flex gap-2 active:scale-[0.98] transition-transform" onClick={retry}>
                  <RotateCcw className="w-5 h-5" />
                  {t("public.result.check_another")}
                </Button>
                <Link to="/rates">
                  <Button size="lg" variant="outline" className="w-full text-lg h-14 border-2 border-warm-borders bg-surface text-charcoal hover:bg-warm-borders/40 rounded-xl flex gap-2 active:scale-[0.98] transition-transform">
                    <ArrowRight className="w-5 h-5 text-copper" />
                    {t("public.result.view_rates")}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
