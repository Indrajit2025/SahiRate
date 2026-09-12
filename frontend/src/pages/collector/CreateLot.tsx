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
  IndianRupee,
  Camera,
  Trash2,
} from "lucide-react";
import { useCreateLotStore } from "@/stores/createLotStore";
import { createLocalLot } from "@/services/lots";
import { db } from "@/db/dexie";
import { compressImageForLocalDb } from "@/utils/image";
import { useI18nStore } from "@/i18n";

const MATERIALS = [
  { id: "PCB", label: "PCB Board", icon: Cpu, min: 115, max: 135 },
  { id: "CABLE", label: "Wires", icon: Cable, min: 60, max: 80 },
  { id: "BATTERY", label: "Battery", icon: Battery, min: 90, max: 110 },
  { id: "DISPLAY", label: "Screen", icon: Monitor, min: 40, max: 50 },
];

function MaterialStep() { const { t } = useI18nStore();
  const setMaterial = useCreateLotStore((s) => s.setMaterial);
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-2xl font-bold text-center mb-8">
        {t("collector.create.choose_material")}
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {MATERIALS.map((m) => (
          <Card
            key={m.id}
            className="cursor-pointer hover:border-primary active:bg-muted"
            onClick={() => setMaterial(m.id)}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 gap-3">
              <m.icon className="w-12 h-12 text-primary" />
              <span className="font-semibold text-lg">{m.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function WeightStep() { const { t } = useI18nStore();
  const { material_id, setWeight, setStep } = useCreateLotStore();
  const [val, setVal] = useState("");

  const MAX_WEIGHT = 9999; // 9,999 kg max per collection

  const handlePad = (num: string) => {
    setVal((v) => {
      if (num === "." && v.includes(".")) return v;
      if (num === "." && v === "") return "0.";

      const newVal = v + num;
      // Enforce max weight at input time
      if (parseFloat(newVal) > MAX_WEIGHT) return v;
      // Restrict decimal places to 2
      if (newVal.includes(".") && newVal.split(".")[1].length > 2) return v;

      return newVal;
    });
  };
  const handleDel = () => setVal((v) => v.slice(0, -1));
  const material = MATERIALS.find((m) => m.id === material_id);

  const parsedWeight = parseFloat(val);
  const isValid =
    val !== "" &&
    !isNaN(parsedWeight) &&
    parsedWeight > 0 &&
    parsedWeight <= MAX_WEIGHT &&
    !val.endsWith(".");

  return (
    <div className="space-y-6 flex flex-col items-center animate-in fade-in slide-in-from-right-4">
      <h2 className="text-2xl font-bold text-center">{t("collector.create.approx_weight_kg")}</h2>
      <div className="flex items-center gap-2 text-muted-foreground">
        {material && <material.icon className="w-5 h-5" />}
        <span>{material?.label || "Unknown Material"}</span>
      </div>

      <div className="text-6xl font-bold py-8 border-b-2 border-primary min-w-[200px] text-center">
        {val || "0"} <span className="text-3xl text-muted-foreground">kg</span>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <Button
            key={n}
            variant="outline"
            className="h-16 text-2xl font-semibold"
            onClick={() => handlePad(n.toString())}
          >
            {n}
          </Button>
        ))}
        <Button
          variant="outline"
          className="h-16 text-2xl font-semibold"
          onClick={() => handlePad(".")}
        >
          .
        </Button>
        <Button
          variant="outline"
          className="h-16 text-2xl font-semibold"
          onClick={() => handlePad("0")}
        >
          0
        </Button>
        <Button
          variant="outline"
          className="h-16 text-xl font-semibold text-destructive"
          onClick={handleDel}
        >
          DEL
        </Button>
      </div>

      <div className="flex w-full gap-4 pt-4">
        <Button
          variant="ghost"
          size="lg"
          className="flex-1"
          onClick={() => setStep("material")}
        >
          Back
        </Button>
        <Button
          size="lg"
          className="flex-1 text-lg"
          disabled={!isValid}
          onClick={() => setWeight(parsedWeight)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function PriceStep() { const { t } = useI18nStore();
  const { material_id, approx_weight_kg, setEstimatedValue, setStep } =
    useCreateLotStore();
  const material = MATERIALS.find((m) => m.id === material_id);
  const weight = approx_weight_kg || 0;

  if (!material) {
    return (
      <div className="space-y-8 flex flex-col items-center animate-in fade-in slide-in-from-right-4">
        <h2 className="text-2xl font-bold text-center text-destructive">
          Error
        </h2>
        <p className="text-muted-foreground">
          Material not selected. Please go back.
        </p>
      </div>
    );
  }

  const minPrice = material.min * weight;
  const maxPrice = material.max * weight;

  return (
    <div className="space-y-8 flex flex-col items-center animate-in fade-in slide-in-from-right-4">
      <h2 className="text-2xl font-bold text-center">{t("collector.create.fair_price_range")}</h2>

      <Card className="w-full bg-primary/5 border-primary/20">
        <CardContent className="p-6 text-center space-y-4">
          <p className="text-muted-foreground uppercase tracking-widest text-sm font-semibold">
            {t("collector.create.local_market_value")}
          </p>
          <div className="text-4xl font-bold text-primary flex items-center justify-center">
            <IndianRupee className="w-8 h-8 mr-1" />
            {minPrice} - {maxPrice}
          </div>
          <p className="text-sm text-muted-foreground">
            Based on {material.label} at ₹{material.min}-₹{material.max}/kg
          </p>
        </CardContent>
      </Card>

      <div className="flex w-full gap-4">
        <Button
          variant="ghost"
          size="lg"
          className="flex-1"
          onClick={() => setStep("weight")}
        >
          Back
        </Button>
        <Button
          size="lg"
          className="flex-1 text-lg"
          onClick={() =>
            setEstimatedValue(Math.round((minPrice + maxPrice) / 2))
          }
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function PhotoStep() {
  const { draft_id, setStep } = useCreateLotStore();
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // When mounting, check if we already saved a photo to Dexie for this draft
  useEffect(() => {
    if (draft_id) {
      db.photos
        .where("lot_id")
        .equals(draft_id)
        .first()
        .then((photo) => {
          if (photo) setPreviewUri(photo.data_uri);
        });
    }
  }, [draft_id]);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !draft_id) return;

    try {
      setProcessing(true);
      const dataUri = await compressImageForLocalDb(file);

      // Save directly to Dexie using the draft lot id FIRST
      await db.transaction("rw", db.photos, async () => {
        await db.photos.where("lot_id").equals(draft_id).delete();
        await db.photos.add({
          id: uuidv4(),
          lot_id: draft_id,
          data_uri: dataUri,
          created_at_local: new Date().toISOString(),
        });
      });

      // ONLY set preview if the Dexie write was successful
      setPreviewUri(dataUri);
    } catch (err) {
      console.error("Failed to compress/save image:", err);
      setPreviewUri(null); // Clear preview state if it failed
      alert(t("collector.create.photo_failed"));
    } finally {
      setProcessing(false);
      // Reset inputs so the user can try again if they want
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  const clearPhoto = async () => {
    setPreviewUri(null);
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
    if (draft_id) {
      await db.photos.where("lot_id").equals(draft_id).delete();
    }
  };

  const { t } = useI18nStore();

  return (
    <div className="space-y-6 flex flex-col items-center animate-in fade-in slide-in-from-right-4">
      <h2 className="text-2xl font-bold text-center">{t("collector.create.photograph_scrap")}</h2>

      {!previewUri ? (
        <div className="flex flex-col gap-4 w-full">
          <Button
            variant="outline"
            className="w-full h-32 border-dashed border-2 bg-muted/30 hover:bg-muted/50 flex flex-col items-center justify-center p-4 gap-2 text-muted-foreground whitespace-normal"
            onClick={() => cameraInputRef.current?.click()}
            disabled={processing}
            aria-label={t("collector.create.take_photo")}
          >
            <Camera className="w-10 h-10" />
            <span className="font-semibold text-lg">
              {processing ? t("common.loading") : t("collector.create.take_photo")}
            </span>
          </Button>

          <Button
            variant="outline"
            className="h-16 text-lg w-full"
            onClick={() => galleryInputRef.current?.click()}
            disabled={processing}
            aria-label={t("collector.create.choose_gallery")}
          >
            {t("collector.create.choose_gallery")}
          </Button>
        </div>
      ) : (
        <div className="w-full relative rounded-xl overflow-hidden shadow-md">
          <img
            src={previewUri}
            alt="Captured scrap"
            className="w-full h-auto max-h-[60vh] object-cover"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-4 right-4 rounded-full shadow-lg"
            onClick={clearPhoto}
            aria-label={t("collector.create.remove_photo")}
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={cameraInputRef}
        className="hidden"
        onChange={handleCapture}
      />

      <input
        type="file"
        accept="image/*"
        ref={galleryInputRef}
        className="hidden"
        onChange={handleCapture}
      />

      <div className="flex w-full gap-4 pt-4">
        <Button
          variant="ghost"
          size="lg"
          className="flex-1"
          onClick={() => setStep("price")}
        >
          Back
        </Button>
        <Button
          size="lg"
          className="flex-1 text-lg"
          disabled={!previewUri || processing}
          onClick={() => setStep("confirm")}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function ConfirmStep() {
  const navigate = useNavigate();
  const { draft_id, material_id, approx_weight_kg, estimated_value, reset } =
    useCreateLotStore();
  const [saving, setSaving] = useState(false);

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
    reset();
    navigate("/collector");
  };

  const { t } = useI18nStore();

  return (
    <div className="space-y-6 flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in">
      <CheckCircle2 className="w-24 h-24 text-green-500" />
      <h2 className="text-3xl font-bold text-center">{t("collector.create.ready_to_save")}</h2>
      <p className="text-center text-muted-foreground max-w-[250px]">
        {t("collector.create.ready_desc")}
      </p>
      <Button
        size="lg"
        className="w-full h-16 text-xl mt-8"
        disabled={saving}
        onClick={handleFinish}
      >
        {saving ? t("common.loading") : t("collector.create.confirm_save")}
      </Button>
    </div>
  );
}

export default function CreateLotWizard() { const { t } = useI18nStore();
  const { step, initDraft } = useCreateLotStore();
  const navigate = useNavigate();

  useEffect(() => {
    initDraft();
  }, [initDraft]);

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen pb-20">
      <header className="flex items-center py-4 mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mr-2"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <span className="text-lg font-medium text-muted-foreground">{t("collector.create.new_collection")}</span>
      </header>

      {step === "material" && <MaterialStep />}
      {step === "weight" && <WeightStep />}
      {step === "price" && <PriceStep />}
      {step === "photo" && <PhotoStep />}
      {step === "confirm" && <ConfirmStep />}
    </div>
  );
}
