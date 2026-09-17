import AudioGuidance from "@/components/AudioGuidance";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Cpu,
  Cable,
  Battery,
  Monitor,
  CheckCircle2,
  Camera,
  RefreshCw,
  Box,
  Image as ImageIcon
} from "lucide-react";
import { useCreateLotStore } from "@/stores/createLotStore";
import { createLocalLot } from "@/services/lots";
import { db } from "@/db/dexie";
import { compressImageForLocalDb } from "@/utils/image";
import { useAudio } from "@/hooks/useAudio";
import { useSyncStore } from "@/stores/syncStore";
import { useTranslation } from "@/i18n";

const MATERIALS = [
  { id: "PCB", label: "PCB", icon: Cpu, min: 110, max: 135 },
  { id: "CABLE", label: "Cable", icon: Cable, min: 60, max: 80 },
  { id: "BATTERY", label: "Battery", icon: Battery, min: 72, max: 110 },
  { id: "DISPLAY", label: "Display", icon: Monitor, min: 40, max: 50 },
  { id: "METAL", label: "Metal", icon: Box, min: 20, max: 30 },
  { id: "PLASTIC", label: "Plastic", icon: Box, min: 10, max: 25 },
  { id: "MOTOR", label: "Motor", icon: Box, min: 45, max: 60 },
];

function ProgressIndicator({ currentStep }: { currentStep: string }) {
  const { t } = useTranslation();
  const steps = [
    { id: "ai_scan", label: t("collector.create.capture") },
    { id: "material", label: t("collector.create.identify") },
    { id: "weight", label: t("common.weight") },
    { id: "confirm", label: t("collector.create.slip") }
  ];
  let currentIndex = steps.findIndex(s => s.id === currentStep);
  if (currentStep === "material") currentIndex = 1;
  if (currentStep === "ai_scan") currentIndex = 0;

  return (
    <div className="flex flex-col items-center mb-6 w-full px-2">
      <div className="flex justify-between w-full relative">
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-warm-borders -z-10 -translate-y-1/2"></div>
        {steps.map((s, idx) => {
          const isActive = idx === currentIndex;
          const isPast = idx < currentIndex;
          return (
            <div key={s.id} className="flex flex-col items-center gap-1 bg-background px-1">
              <div className={`w-3 h-3 rounded-full transition-all duration-300 ${isActive ? 'bg-primary ring-4 ring-primary/20' : isPast ? 'bg-primary' : 'bg-warm-borders'}`} />
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-primary' : isPast ? 'text-charcoal' : 'text-muted-foreground'}`}>{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AiScanStep() { 
  const { playAudio } = useAudio(); 
  const { t } = useTranslation();
  const { 
    draft_id, setStep, setMaterial, setAiConfidence,
    aiResult, aiError, previewUri, processing, setAiState
  } = useCreateLotStore();
  
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const processIdRef = useRef<number>(0);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !draft_id) return;
    
    const currentProcessId = ++processIdRef.current;
    
    let savedDataUri: string | null = null;
    try {
      setAiState({ processing: true, aiError: false, aiResult: null });
      const dataUri = await compressImageForLocalDb(file);
      savedDataUri = dataUri;

      await db.transaction("rw", db.photos, async () => {
        await db.photos.where("lot_id").equals(draft_id).delete();
        await db.photos.add({
          id: uuidv4(),
          lot_id: draft_id,
          data_uri: dataUri,
          created_at_local: new Date().toISOString(),
        });
      });

      if (processIdRef.current !== currentProcessId) return;
      setAiState({ previewUri: dataUri });

      const { classifyMaterial } = await import("@/services/ai/inference");
      const result = await classifyMaterial(file);
      
      if (processIdRef.current !== currentProcessId) return;
      
      if (result) {
        setAiState({ aiResult: result });
      } else {
        setAiState({ aiError: true });
      }
    } catch (err) {
      console.error("Failed to compress/save/infer image:", err);
      if (processIdRef.current === currentProcessId) {
        setAiState({ aiError: true });
        if (!savedDataUri) {
          setAiState({ previewUri: null });
        }
      }
    } finally {
      if (processIdRef.current === currentProcessId) {
        setAiState({ processing: false });
      }
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  const handleConfirmAi = () => {
    if (aiResult?.materialId && MATERIALS.some((m) => m.id === aiResult.materialId.toUpperCase() || m.id === aiResult.materialId)) {
      setMaterial(aiResult.materialId.toUpperCase());
      setAiConfidence(aiResult.confidencePercent);
    } else {
      setStep("material");
    }
  };

  return (
    <div className="space-y-6 flex flex-col animate-in fade-in slide-in-from-right-4">
      <h2 className="text-2xl font-extrabold text-charcoal">{t("collector.create.photograph_scrap")}</h2>
      <AudioGuidance audioKey="collector.create.take_photo" />

      {!previewUri ? (
        <div className="flex flex-col gap-4 w-full mt-4">
          <Button
            size="lg"
            className="w-full h-32 bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-lg flex gap-3 active:scale-[0.98] transition-transform"
            onClick={() => cameraInputRef.current?.click()}
            disabled={processing}
          >
            <Camera className="w-8 h-8" />
            <span className="font-bold text-xl">{t("collector.create.take_photo")}</span>
          </Button>

          <Button
            variant="outline"
            className="h-16 text-lg w-full border-2 border-warm-borders text-charcoal hover:bg-surface/80 rounded-xl flex gap-2 active:scale-[0.98] transition-transform"
            onClick={() => galleryInputRef.current?.click()}
            disabled={processing}
          >
            <ImageIcon className="w-5 h-5 text-muted-foreground" />
            {t("collector.create.choose_gallery")}
          </Button>

          <div className="mt-8 text-center">
            <Button variant="link" className="text-muted-foreground hover:text-charcoal font-medium" onClick={() => setStep("material")}>
              {t("collector.create.choose_manually")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full space-y-5">
          <div className="relative w-full h-[200px] rounded-2xl overflow-hidden bg-charcoal shadow-md border-2 border-warm-borders">
            <img
              src={aiResult?.overlayUri || previewUri}
              alt={t("collector.create.photograph_scrap")}
              className="w-full h-full object-cover"
            />
            
            {processing && (
              <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
                <div className="w-10 h-10 border-4 border-white/20 border-t-copper rounded-full animate-spin mb-3" />
                <p className="font-bold tracking-wide">{t("collector.create.analyzing")}</p>
                <p className="text-[10px] text-white/70 mt-2 uppercase tracking-widest">{t("collector.create.ai_material_check")}</p>
              </div>
            )}
          </div>

          {!processing && aiResult && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="bg-surface border-2 border-warm-borders rounded-2xl p-5 shadow-sm">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  {t("collector.create.ai_material_check")}
                </p>
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-3xl font-extrabold text-charcoal tracking-tight">{aiResult.material || aiResult.detections?.[0]?.className}</h3>
                  <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                    {aiResult.confidencePercent}% {t("collector.create.confidence")}
                  </span>
                </div>
                
                {aiResult.otherMaterials && aiResult.otherMaterials.length > 0 && (
                  <div className="mt-4 border-t-2 border-dashed border-warm-borders pt-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                      {t("collector.create.detected_material")}
                    </p>
                    <div className="flex flex-col gap-2">
                      {aiResult.otherMaterials.map((om: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-warm-borders shadow-sm">
                          <span className="font-bold text-charcoal text-sm">{om.material}</span>
                          <span className="text-xs font-bold text-muted-foreground bg-surface px-2 py-1 rounded border border-warm-borders">{om.confidencePercent}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {aiResult.confidencePercent < 60 && (
                  <p className="text-amber-600 text-sm font-medium mt-3 bg-amber-50 p-2 rounded border border-amber-200">
                    {t("collector.create.low_confidence")}
                  </p>
                )}
              </div>
              
              <div className="pt-2 text-center">
                <div className="flex flex-col gap-3">
                  <Button size="lg" className="h-14 text-lg bg-primary hover:bg-primary/90 text-white rounded-xl active:scale-[0.98] transition-transform" onClick={handleConfirmAi}>
                    ✓ {t("collector.create.use_this_material")}
                  </Button>
                  <Button variant="outline" className="h-14 text-lg border-2 border-warm-borders text-charcoal bg-surface hover:bg-warm-borders/40 rounded-xl active:scale-[0.98] transition-transform" onClick={() => setStep("material")}>
                    {t("collector.create.choose_another")}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!processing && (aiError || !aiResult) && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center space-y-4 shadow-sm animate-in fade-in">
              <p className="font-bold text-amber-900 text-lg">{t("collector.create.no_material_detected")}</p>
              <div className="flex flex-col gap-3 pt-2">
                <Button size="lg" className="h-14 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold" onClick={() => setAiState({ previewUri: null, aiResult: null, aiError: false })}>
                  {t("collector.create.try_again")}
                </Button>
                <Button size="lg" variant="outline" className="h-14 bg-white border-amber-200 text-amber-800 hover:bg-amber-100 rounded-xl font-bold" onClick={() => setStep("material")}>
                  {t("collector.create.choose_manually")}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} className="hidden" onChange={handleCapture} />
      <input type="file" accept="image/*" ref={galleryInputRef} className="hidden" onChange={handleCapture} />
    </div>
  );
}

function MaterialStep() { 
  const { playAudio } = useAudio(); 
  const { t } = useTranslation();
  const setMaterial = useCreateLotStore((s) => s.setMaterial);
  
  return (
    <div className="space-y-6 flex flex-col animate-in fade-in slide-in-from-right-4">
      <h2 className="text-2xl font-extrabold text-charcoal">{t("collector.create.choose_material")}</h2>
      <AudioGuidance audioKey="collector.create.choose_material" />
      <div className="grid grid-cols-2 gap-4">
        {MATERIALS.map((m) => (
          <Card
            key={m.id}
            className="cursor-pointer border-2 border-warm-borders hover:border-primary active:scale-[0.98] transition-transform bg-surface shadow-sm rounded-2xl"
            onClick={() => setMaterial(m.id)}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 gap-3">
              <m.icon className="w-10 h-10 text-primary" />
              <span className="font-bold text-charcoal text-base">
                {t(`material.${m.id}` as any) || m.label}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function WeightStep() { 
  const { playAudio } = useAudio(); 
  const { t } = useTranslation();
  const { material_id, setWeight, } = useCreateLotStore();
  const [val, setVal] = useState("");

  const MAX_WEIGHT = 9999; 

  const handlePad = (num: string) => {
    setVal((v) => {
      if (num === "." && v.includes(".")) return v;
      if (num === "." && v === "") return "0.";

      const newVal = v + num;
      if (parseFloat(newVal) > MAX_WEIGHT) return v;
      if (newVal.includes(".") && newVal.split(".")[1].length > 2) return v;
      return newVal;
    });
  };
  
  const handleAdd = (num: number) => {
    setVal((v) => {
      const current = parseFloat(v) || 0;
      const next = current + num;
      if (next > MAX_WEIGHT) return v;
      return next.toString();
    });
  };

  const handleDel = () => setVal((v) => v.slice(0, -1));
  const material = MATERIALS.find((m) => m.id === material_id);

  const parsedWeight = parseFloat(val);
  const isValid = val !== "" && !isNaN(parsedWeight) && parsedWeight > 0 && parsedWeight <= MAX_WEIGHT && !val.endsWith(".");

  const avgPrice = material ? Math.round((material.min + material.max) / 2) : 0;
  const estimatedValue = isValid ? Math.round(avgPrice * parsedWeight) : 0;

  return (
    <div className="space-y-4 flex flex-col items-center animate-in fade-in slide-in-from-right-4 pb-4 w-full">
      <h2 className="text-2xl font-extrabold text-charcoal text-center tracking-tight">{t("collector.create.enter_weight")}</h2>
      <AudioGuidance audioKey="collector.create.enter_weight" />
      
      <div className="flex items-center gap-2 text-primary font-bold bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
        {material && <material.icon className="w-4 h-4" />}
        <span className="text-xs uppercase tracking-widest">
          {t(`material.${material?.id}` as any) || material?.label || t("common.unknown_material")}
        </span>
      </div>

      <div className="w-full bg-[#0A2928] text-[#E0F2F1] rounded-2xl p-4 shadow-inner border border-charcoal relative overflow-hidden flex flex-col justify-between h-[120px]">
        <div className="flex justify-between text-[10px] font-bold text-[#E0F2F1]/60 uppercase tracking-widest">
          <span>Gross <span className="text-[#E0F2F1]">{val || "0"} kg</span></span>
          <span>Tare <span className="text-[#E0F2F1]">0.0 kg</span></span>
        </div>
        <div className="text-right flex items-baseline justify-end gap-2">
          <span className="text-sm font-bold text-[#E0F2F1]/60 uppercase tracking-widest pb-1">Net</span>
          <span className="text-[44px] leading-none font-bold font-mono">{val || "0"}</span> 
          <span className="text-xl font-medium text-[#E0F2F1]/60">kg</span>
        </div>
      </div>

      <div className="flex w-full justify-between items-center bg-surface px-4 py-3 rounded-xl border border-warm-borders">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t("common.rate")}</span>
          <span className="text-sm font-bold text-charcoal font-mono">₹{avgPrice}/kg</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t("common.amount")}</span>
          <span className="text-lg font-extrabold text-primary font-mono">₹{estimatedValue.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex w-full gap-2 mt-1">
        <Button variant="outline" className="flex-1 h-12 border-warm-borders text-primary font-bold bg-primary/5 hover:bg-primary/10 active:scale-95" onClick={() => handleAdd(1)}>+1 kg</Button>
        <Button variant="outline" className="flex-1 h-12 border-warm-borders text-primary font-bold bg-primary/5 hover:bg-primary/10 active:scale-95" onClick={() => handleAdd(5)}>+5 kg</Button>
        <Button variant="outline" className="flex-1 h-12 border-warm-borders text-primary font-bold bg-primary/5 hover:bg-primary/10 active:scale-95" onClick={() => handleAdd(10)}>+10 kg</Button>
      </div>

      <div className="grid grid-cols-3 gap-2 w-full mt-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <Button
            key={n}
            variant="outline"
            className="h-[64px] min-w-[56px] text-2xl font-bold bg-white border border-warm-borders hover:bg-surface text-charcoal rounded-xl active:scale-[0.96] transition-transform shadow-sm"
            onClick={() => handlePad(n.toString())}
          >
            {n}
          </Button>
        ))}
        <Button
          variant="outline"
          className="h-[64px] min-w-[56px] text-3xl font-bold bg-white border border-warm-borders hover:bg-surface text-charcoal rounded-xl active:scale-[0.96] transition-transform shadow-sm"
          onClick={() => handlePad(".")}
        >
          .
        </Button>
        <Button
          variant="outline"
          className="h-[64px] min-w-[56px] text-2xl font-bold bg-white border border-warm-borders hover:bg-surface text-charcoal rounded-xl active:scale-[0.96] transition-transform shadow-sm"
          onClick={() => handlePad("0")}
        >
          0
        </Button>
        <Button
          variant="outline"
          className="h-[64px] min-w-[56px] text-lg font-bold bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 rounded-xl active:scale-[0.96] transition-transform shadow-sm"
          onClick={handleDel}
        >
          ⌫
        </Button>
      </div>

      <Button
        size="lg"
        className="w-full h-14 mt-2 text-lg font-bold tracking-wide uppercase bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg active:scale-[0.98] transition-transform"
        disabled={!isValid}
        onClick={() => setWeight(parsedWeight, estimatedValue)}
      >
        {t("collector.create.next")}
      </Button>
    </div>
  );
}

function ConfirmStep() { 
  const { playAudio } = useAudio(); 
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { draft_id, material_id, approx_weight_kg, estimated_value, reset } = useCreateLotStore();
  const { isOnline } = useSyncStore();
  const [saving, setSaving] = useState(false);
  const [savedLocally, setSavedLocally] = useState(false);

  const material = MATERIALS.find(m => m.id === material_id);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    if (draft_id) {
      db.photos.where("lot_id").equals(draft_id).first().then(p => {
        if (p) setPhotoUri(p.data_uri);
      });
    }
  }, [draft_id]);

  const handleFinish = async () => {
    setSaving(true);
    await createLocalLot(
      {
        material_id: material_id!,
        approx_weight_kg: approx_weight_kg!,
        estimated_value: estimated_value!,
      },
      draft_id!,
    );
    setSaving(false);
    setSavedLocally(true);
    
    setTimeout(() => {
      navigate("/collector/history");
      setTimeout(() => reset(), 100);
    }, 2000);
  };

  if (savedLocally) {
    return (
      <div className="space-y-6 flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-2">
          <CheckCircle2 className="w-12 h-12 text-success" />
        </div>
        <h2 className="text-3xl font-extrabold text-charcoal text-center tracking-tight">{t("collector.create.ready_to_save")}</h2>
        
        <Card className="w-full bg-[#FAF8F3] border border-[#DDD8CC] shadow-sm rounded-xl p-4">
          <div className="flex justify-between items-center text-charcoal font-bold">
            <span>{t(`material.${material?.id}` as any) || material?.label}</span>
            <span>{approx_weight_kg} kg</span>
          </div>
          <div className="text-primary font-mono font-bold text-xl mt-2 text-right">
            ₹{estimated_value?.toLocaleString()} {t("common.amount")}
          </div>
        </Card>
        
        <p className="text-center text-sm font-bold text-muted-foreground bg-surface px-4 py-2 rounded-full border border-warm-borders">
          {isOnline ? t("collector.sync_center.sync_now") : t("collector.sync_center.auto_sync_desc")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 flex flex-col animate-in fade-in slide-in-from-right-4">
      <h2 className="text-2xl font-extrabold text-charcoal text-center">{t("collector.create.ready_to_save")}</h2>
      <AudioGuidance audioKey="collector.create.ready_to_save" />
      
      <div className="w-full bg-[#FAF8F3] border border-[#DDD8CC] shadow-sm relative mx-auto overflow-hidden">
        <div className="p-6 space-y-5">
          <div className="text-center">
            <h3 className="font-extrabold text-xl text-primary tracking-tight uppercase">SahiRate</h3>
            <p className="text-[10px] text-muted-foreground font-bold tracking-widest mt-1">Lot ID: {draft_id?.split('-')[0].toUpperCase()}</p>
          </div>

          <div className="border-t-2 border-dashed border-[#CBC5B4] pt-5 flex justify-between items-center">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{t("common.material" as any) || "Material"}</p>
            <p className="font-extrabold text-[17px] text-charcoal">
              {t(`material.${material?.id}` as any) || material?.label}
            </p>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{t("common.weight")}</p>
            <p className="font-extrabold text-[17px] text-charcoal">{approx_weight_kg} kg</p>
          </div>

          {photoUri && (
             <div className="flex justify-between items-center pb-2">
               <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Photo</p>
               <img src={photoUri} className="w-16 h-12 object-cover rounded border border-[#DDD8CC]" alt="thumbnail" />
             </div>
          )}

          <div className="border-t-2 border-dashed border-[#CBC5B4] pt-4 space-y-3">
            <div className="flex justify-between items-center">
               <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{t("common.rate")}</p>
               <p className="font-bold text-[14px] text-charcoal font-mono tracking-tight">₹{Math.round((estimated_value || 0) / (approx_weight_kg || 1))} / kg</p>
            </div>
            
            <div className="bg-primary text-white p-4 rounded mt-2 flex justify-between items-center shadow-inner">
               <p className="text-[11px] font-bold text-white/80 uppercase tracking-widest">{t("common.amount")}</p>
               <p className="font-extrabold text-2xl font-mono tracking-tight">₹{estimated_value?.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="text-center pt-2 text-[#8A9793] text-[11px] font-medium px-4">
            {t("public.result.updated_today")}
          </div>
        </div>
        
        <div className="absolute -left-2 top-1/2 w-4 h-4 rounded-full bg-background border-r border-[#DDD8CC]"></div>
        <div className="absolute -right-2 top-1/2 w-4 h-4 rounded-full bg-background border-l border-[#DDD8CC]"></div>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <Button size="lg" className="w-full h-14 text-[15px] font-bold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg active:scale-[0.98] transition-transform" disabled={saving} onClick={handleFinish}>
          {saving ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <>✓ {t("collector.create.confirm_save")}</>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function CreateLotWizard() { 
  const { step, initDraft } = useCreateLotStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    initDraft();
  }, [initDraft]);

  const storeGoBack = useCreateLotStore((s) => s.goBack);
  const history = useCreateLotStore((s) => (s as any).history);

  const goBack = () => {
    if (history && history.length > 0) {
      storeGoBack();
    } else {
      navigate(-1);
    }
  };

  const getTitle = () => {
    switch (step) {
      case 'ai_scan': return t("collector.create.new_collection");
      case 'material': return t("collector.create.choose_material");
      case 'weight': return t("collector.create.enter_weight");
      case 'confirm': return t("collector.create.ready_to_save");
      default: return t("collector.create.new_collection");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen pb-20 bg-background flex flex-col">
      <header className="flex items-center py-2 mb-2 h-14">
        <Button
          variant="ghost"
          size="icon"
          onClick={goBack}
          className="mr-2 -ml-2 hover:bg-surface active:scale-95 text-charcoal"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <span className="text-lg font-bold text-charcoal tracking-tight">{getTitle()}</span>
      </header>

      <ProgressIndicator currentStep={step} />

      <div className="flex-1">
        {step === "ai_scan" && <AiScanStep />}
        {step === "material" && <MaterialStep />}
        {step === "weight" && <WeightStep />}
        {step === "confirm" && <ConfirmStep />}
      </div>
    </div>
  );
}
