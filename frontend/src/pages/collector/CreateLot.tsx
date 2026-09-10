import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Cpu, Cable, Battery, Monitor, CheckCircle2, IndianRupee } from "lucide-react";
import { useCreateLotStore } from "@/stores/createLotStore";
import { createLocalLot } from "@/services/lots";

const MATERIALS = [
  { id: 'PCB', label: 'PCB Board', icon: Cpu, min: 115, max: 135 },
  { id: 'CABLE', label: 'Wires', icon: Cable, min: 60, max: 80 },
  { id: 'BATTERY', label: 'Battery', icon: Battery, min: 90, max: 110 },
  { id: 'DISPLAY', label: 'Screen', icon: Monitor, min: 40, max: 50 },
];

function MaterialStep() {
  const setMaterial = useCreateLotStore(s => s.setMaterial);
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-2xl font-bold text-center mb-8">What are you selling?</h2>
      <div className="grid grid-cols-2 gap-4">
        {MATERIALS.map(m => (
          <Card key={m.id} className="cursor-pointer hover:border-primary active:bg-muted" onClick={() => setMaterial(m.id)}>
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

function WeightStep() {
  const { material_id, setWeight, setStep } = useCreateLotStore();
  const [val, setVal] = useState("");
  
  const handlePad = (num: string) => setVal(v => v + num);
  const handleDel = () => setVal(v => v.slice(0, -1));
  const material = MATERIALS.find(m => m.id === material_id);

  return (
    <div className="space-y-6 flex flex-col items-center animate-in fade-in slide-in-from-right-4">
      <h2 className="text-2xl font-bold text-center">Approximate Weight</h2>
      <div className="flex items-center gap-2 text-muted-foreground">
        {material && <material.icon className="w-5 h-5" />}
        <span>{material?.label}</span>
      </div>
      
      <div className="text-6xl font-bold py-8 border-b-2 border-primary min-w-[200px] text-center">
        {val || "0"} <span className="text-3xl text-muted-foreground">kg</span>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <Button key={n} variant="outline" className="h-16 text-2xl font-semibold" onClick={() => handlePad(n.toString())}>{n}</Button>
        ))}
        <Button variant="outline" className="h-16 text-2xl font-semibold" onClick={() => handlePad(".")}>.</Button>
        <Button variant="outline" className="h-16 text-2xl font-semibold" onClick={() => handlePad("0")}>0</Button>
        <Button variant="outline" className="h-16 text-xl font-semibold text-destructive" onClick={handleDel}>DEL</Button>
      </div>

      <div className="flex w-full gap-4 pt-4">
        <Button variant="ghost" size="lg" className="flex-1" onClick={() => setStep('material')}>Back</Button>
        <Button size="lg" className="flex-1 text-lg" disabled={!val || parseFloat(val) <= 0} onClick={() => setWeight(parseFloat(val))}>
          Next
        </Button>
      </div>
    </div>
  );
}

function PriceStep() {
  const { material_id, approx_weight_kg, setEstimatedValue } = useCreateLotStore();
  const material = MATERIALS.find(m => m.id === material_id);
  const weight = approx_weight_kg || 0;
  
  const minPrice = material!.min * weight;
  const maxPrice = material!.max * weight;

  return (
    <div className="space-y-8 flex flex-col items-center animate-in fade-in slide-in-from-right-4">
      <h2 className="text-2xl font-bold text-center">Fair Price Range</h2>
      
      <Card className="w-full bg-primary/5 border-primary/20">
        <CardContent className="p-6 text-center space-y-4">
          <p className="text-muted-foreground uppercase tracking-widest text-sm font-semibold">Local Market Value</p>
          <div className="text-4xl font-bold text-primary flex items-center justify-center">
            <IndianRupee className="w-8 h-8 mr-1" />
            {minPrice} - {maxPrice}
          </div>
          <p className="text-sm text-muted-foreground">Based on {material?.label} at ₹{material?.min}-₹{material?.max}/kg</p>
        </CardContent>
      </Card>

      <Button size="lg" className="w-full h-16 text-xl" onClick={() => setEstimatedValue(Math.round((minPrice + maxPrice) / 2))}>
        Save Offline Lot
      </Button>
    </div>
  );
}

function ConfirmStep() {
  const navigate = useNavigate();
  const { material_id, approx_weight_kg, estimated_value, reset } = useCreateLotStore();
  const [saving, setSaving] = useState(false);

  const handleFinish = async () => {
    setSaving(true);
    await createLocalLot({
      material_id: material_id!,
      approx_weight_kg: approx_weight_kg!,
      estimated_value: estimated_value!
    });
    setSaving(false);
    reset();
    navigate('/collector');
  };

  return (
    <div className="space-y-6 flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in">
      <CheckCircle2 className="w-24 h-24 text-green-500" />
      <h2 className="text-3xl font-bold text-center">Ready to Save</h2>
      <p className="text-center text-muted-foreground max-w-[250px]">
        Your collection details are ready to be saved locally.
      </p>
      <Button size="lg" className="w-full h-16 text-xl mt-8" disabled={saving} onClick={handleFinish}>
        {saving ? "Saving..." : "Confirm & Save"}
      </Button>
    </div>
  );
}

export default function CreateLotWizard() {
  const { step, reset } = useCreateLotStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    reset();
  }, [reset]);

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen pb-20">
      <header className="flex items-center py-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <span className="text-lg font-medium text-muted-foreground">New Collection</span>
      </header>

      {step === 'material' && <MaterialStep />}
      {step === 'weight' && <WeightStep />}
      {step === 'price' && <PriceStep />}
      {step === 'confirm' && <ConfirmStep />}
    </div>
  );
}
