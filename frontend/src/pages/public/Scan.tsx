import React, { useState, useRef } from "react";
import { useTranslation } from "@/i18n";
import { classifyMaterial } from "@/services/ai/inference";
import type { MaterialClassificationResult } from "@/services/ai/inference";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, RotateCcw, AlertTriangle, ArrowRight, ShieldCheck, Tag, ArrowLeft, Calculator, Plus, Minus, Edit3, Check, RotateCw } from "lucide-react";
import { Link } from "react-router-dom";
import { DEMO_REF_RATES, getDemoRefRate } from "@/services/refRates";

export default function Scan() {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MaterialClassificationResult | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [calcQty, setCalcQty] = useState<number>(1);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [isManualEditOpen, setIsManualEditOpen] = useState<boolean>(false);
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
    setSelectedMaterialId(null);
    setIsManualEditOpen(false);

    try {
      const classification = await classifyMaterial(file);
      if (classification && classification.confidence > 0.4) {
        setResult(classification);
        const rateInfo = getDemoRefRate(classification.materialId);
        setCalcQty(rateInfo?.unit === "piece" ? 1 : 1.0);
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
    setSelectedMaterialId(null);
    setIsManualEditOpen(false);
    setCalcQty(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSelectMaterial = (matId: string) => {
    setSelectedMaterialId(matId.toUpperCase());
    setIsManualEditOpen(false);
    const targetRef = getDemoRefRate(matId);
    if (targetRef?.unit === "piece") {
      setCalcQty(1);
    } else {
      setCalcQty(1.0);
    }
  };

  const activeMaterialId = selectedMaterialId || result?.materialId;
  const isManuallyOverridden = Boolean(selectedMaterialId && selectedMaterialId !== result?.materialId);
  const refRate = getDemoRefRate(activeMaterialId);
  const isPiece = refRate?.unit === "piece";
  const unitLabel = refRate?.unitLabel || (isPiece ? "display" : "kg");
  const materialDisplayName = refRate?.label || (result ? result.material : "Material");
  const rateMid = refRate?.midpoint ?? 0;
  const rateMin = refRate?.min ?? 0;
  const rateMax = refRate?.max ?? 0;
  const estimatedTotal = Math.round(calcQty * rateMid);
  const minTotal = Math.round(calcQty * rateMin);
  const maxTotal = Math.round(calcQty * rateMax);

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
                  
                  {/* Header: Identity, Confidence & Manual Edit Button */}
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          {isManuallyOverridden ? "MANUALLY SELECTED" : t("public.result.ai_identified")}
                        </p>
                        {isManuallyOverridden && (
                          <button
                            type="button"
                            onClick={() => setSelectedMaterialId(null)}
                            className="text-[10px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded transition-colors flex items-center gap-1 border border-amber-300"
                            title="Reset to AI detected material"
                          >
                            <RotateCw className="w-2.5 h-2.5" />
                            Reset to AI
                          </button>
                        )}
                      </div>
                      <h2 className="text-3xl font-extrabold text-charcoal leading-none tracking-tight">
                        {materialDisplayName}
                      </h2>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsManualEditOpen((prev) => !prev)}
                        className="h-8 px-2.5 text-xs font-bold border-warm-borders hover:border-primary text-charcoal bg-white shadow-sm flex items-center gap-1.5 active:scale-95"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-primary" />
                        <span>{isManualEditOpen ? "Close" : "Change Material"}</span>
                      </Button>

                      {!isManuallyOverridden && (
                        <div className="bg-success/10 text-success border border-success/20 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          {t("public.result.confidence", { score: result.confidencePercent.toString() })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Manual Material Picker Drawer/Grid */}
                  {isManualEditOpen && (
                    <div className="bg-white border-2 border-primary/30 rounded-xl p-3.5 shadow-sm space-y-2.5 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-charcoal uppercase tracking-wider">
                          Select Correct Material:
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground">
                          7 Materials Available
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {DEMO_REF_RATES.filter((r) => r.id !== "CABLE").map((m) => {
                          const isSelected = m.id === activeMaterialId;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => handleSelectMaterial(m.id)}
                              className={`flex items-center justify-between p-2 rounded-lg border text-left transition-all ${
                                isSelected
                                  ? "bg-primary text-white border-primary shadow-sm"
                                  : "bg-surface hover:bg-warm-borders/40 border-warm-borders text-charcoal"
                              }`}
                            >
                              <div>
                                <p className="text-xs font-bold leading-tight">{m.label}</p>
                                <p className={`text-[10px] font-mono ${isSelected ? "text-white/80" : "text-muted-foreground"}`}>
                                  ₹{m.midpoint}/{m.unitLabel}
                                </p>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* All Detected Components list with click-to-switch */}
                  {result.otherMaterials && result.otherMaterials.length > 0 && (
                    <div className="border-t-2 border-dashed border-warm-borders-dark pt-5">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            ALL DETECTED COMPONENTS
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Tap any component to select as active
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-charcoal bg-surface px-2 py-0.5 rounded border border-warm-borders">
                          {result.detections?.length || result.otherMaterials.length + 1} Objects
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {/* Primary AI detected material */}
                        <button
                          type="button"
                          onClick={() => handleSelectMaterial(result.materialId)}
                          className={`w-full flex justify-between items-center p-2.5 rounded-lg border text-left transition-all ${
                            activeMaterialId === result.materialId.toUpperCase()
                              ? "bg-primary/10 border-primary ring-1 ring-primary"
                              : "bg-white border-warm-borders hover:bg-surface shadow-sm"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${activeMaterialId === result.materialId.toUpperCase() ? "bg-primary" : "bg-muted-foreground"}`} />
                            <span className="font-bold text-charcoal text-sm uppercase">{result.material}</span>
                            <span className="text-[10px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded">AI Top</span>
                            {activeMaterialId === result.materialId.toUpperCase() && (
                              <span className="text-[10px] font-bold bg-primary text-white px-1.5 py-0.5 rounded">Selected</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 font-mono">
                            <span className="text-xs font-bold text-charcoal">
                              ₹{getDemoRefRate(result.materialId)?.midpoint}/{getDemoRefRate(result.materialId)?.unitLabel}
                            </span>
                            <span className="text-xs font-bold text-primary bg-white px-2 py-0.5 rounded border border-primary/20">
                              {result.confidencePercent}%
                            </span>
                          </div>
                        </button>

                        {/* Other detected materials */}
                        {result.otherMaterials.map((om: any, idx: number) => {
                          const omRef = getDemoRefRate(om.materialId);
                          const isThisActive = activeMaterialId === om.materialId.toUpperCase();
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectMaterial(om.materialId)}
                              className={`w-full flex justify-between items-center p-2.5 rounded-lg border text-left transition-all ${
                                isThisActive
                                  ? "bg-primary/10 border-primary ring-1 ring-primary"
                                  : "bg-white border-warm-borders hover:bg-surface shadow-sm"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${isThisActive ? "bg-primary" : "bg-muted-foreground/50"}`} />
                                <span className="font-bold text-charcoal text-sm uppercase">{om.material}</span>
                                {isThisActive && (
                                  <span className="text-[10px] font-bold bg-primary text-white px-1.5 py-0.5 rounded">Selected</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 font-mono">
                                {omRef && (
                                  <span className="text-xs font-semibold text-muted-foreground">
                                    ₹{omRef.midpoint}/{omRef.unitLabel}
                                  </span>
                                )}
                                <span className="text-xs font-bold text-muted-foreground bg-surface px-2 py-0.5 rounded border border-warm-borders">
                                  {om.confidencePercent}%
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Unified Total Estimation Section (Merged Reference Rate & Price Calculation Grid) */}
                  <div className="border-t-2 border-dashed border-warm-borders-dark pt-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-primary" />
                        <h3 className="text-sm font-extrabold text-charcoal uppercase tracking-wider">
                          Total Estimation
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                        <Tag className="w-3 h-3 text-copper" />
                        Updated Today • {isPiece ? "Per Unit Count" : "Net Weight (kg)"}
                      </span>
                    </div>

                    {/* 3-Column Box Grid matching user's sketch [ COUNT or MASS | CURRENT PRICE | TOTAL ESTIMATION ] */}
                    <div className="bg-white border-2 border-warm-borders rounded-2xl overflow-hidden shadow-sm">
                      {/* Grid Header Row (Labels) */}
                      <div className="grid grid-cols-3 bg-surface border-b border-warm-borders divide-x divide-warm-borders text-center py-2.5 px-1">
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-[11px] font-extrabold text-charcoal uppercase tracking-wider">
                            {isPiece ? "Count" : "Mass"}
                          </span>
                          <span className="text-[9px] font-medium text-muted-foreground">Quantity</span>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-[11px] font-extrabold text-charcoal uppercase tracking-wider">
                            Current Price
                          </span>
                          <span className="text-[9px] font-medium text-muted-foreground">Market Benchmark</span>
                        </div>
                        <div className="flex flex-col items-center justify-center bg-primary/5">
                          <span className="text-[11px] font-extrabold text-primary uppercase tracking-wider">
                            Total Estimation
                          </span>
                          <span className="text-[9px] font-medium text-primary/80">Calculated Value</span>
                        </div>
                      </div>

                      {/* Grid Row 2: Active Values & Steppers */}
                      <div className="grid grid-cols-3 divide-x divide-warm-borders p-3 items-center text-center">
                        {/* Column 1: Quantity Stepper */}
                        <div className="flex flex-col items-center justify-center gap-1.5 px-1">
                          <div className="flex items-center justify-center gap-1.5 w-full">
                            <button
                              type="button"
                              onClick={() =>
                                setCalcQty((q) =>
                                  isPiece
                                    ? Math.max(1, q - 1)
                                    : Math.max(0.5, Number((q - 0.5).toFixed(1)))
                                )
                              }
                              className="w-7 h-7 rounded-lg bg-surface border border-warm-borders flex items-center justify-center text-charcoal hover:bg-warm-borders active:scale-95 transition-transform shrink-0 shadow-xs"
                              title="Decrease"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-mono text-charcoal text-lg sm:text-xl font-extrabold min-w-[28px]">
                              {calcQty}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setCalcQty((q) =>
                                  isPiece
                                    ? Math.min(100, q + 1)
                                    : Math.min(100, Number((q + 0.5).toFixed(1)))
                                )
                              }
                              className="w-7 h-7 rounded-lg bg-surface border border-warm-borders flex items-center justify-center text-charcoal hover:bg-warm-borders active:scale-95 transition-transform shrink-0 shadow-xs"
                              title="Increase"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-xs font-bold text-muted-foreground font-mono">
                            {unitLabel}
                          </span>
                        </div>

                        {/* Column 2: Current Price */}
                        <div className="flex flex-col items-center justify-center px-1">
                          <div className="flex items-baseline justify-center">
                            <span className="text-2xl sm:text-3xl font-extrabold text-charcoal font-mono tracking-tight leading-none">
                              ₹{rateMid}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-muted-foreground font-mono mt-0.5">
                            /{unitLabel}
                          </span>
                        </div>

                        {/* Column 3: Total Estimation */}
                        <div className="flex flex-col items-center justify-center px-1 bg-primary/5 py-2 rounded-xl">
                          <span className="text-2xl sm:text-3xl font-extrabold text-primary font-mono tracking-tight leading-none">
                            ₹{estimatedTotal.toLocaleString()}
                          </span>
                          <span className="text-[10px] font-mono text-primary/80 mt-1 font-bold">
                            Total Est.
                          </span>
                        </div>
                      </div>

                      {/* Grid Row 3: Presets, Market Band, and Estimated Value Range */}
                      <div className="grid grid-cols-3 divide-x divide-warm-borders border-t border-warm-borders bg-surface/50 p-2.5 text-center text-[10px] font-mono">
                        {/* Col 1: Preset buttons */}
                        <div className="flex flex-wrap items-center justify-center gap-1 px-1">
                          {(isPiece ? [1, 2, 5, 10] : [0.5, 1, 2, 5]).map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setCalcQty(preset)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                                calcQty === preset
                                  ? "bg-primary text-white shadow-xs"
                                  : "bg-white border border-warm-borders text-charcoal hover:bg-surface"
                              }`}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>

                        {/* Col 2: Market Band */}
                        <div className="flex flex-col items-center justify-center px-1 text-muted-foreground">
                          <span className="text-[9px] uppercase font-sans font-bold text-muted-foreground">
                            Market Band
                          </span>
                          <span className="font-bold text-charcoal text-[11px] mt-0.5">
                            ₹{rateMin}–{rateMax}
                          </span>
                        </div>

                        {/* Col 3: Estimated Value Range */}
                        <div className="flex flex-col items-center justify-center px-1 text-primary">
                          <span className="text-[9px] uppercase font-sans font-bold text-primary/80">
                            Est. Range
                          </span>
                          <span className="font-bold text-primary text-[11px] mt-0.5">
                            ₹{minTotal}–{maxTotal}
                          </span>
                        </div>
                      </div>
                    </div>
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
