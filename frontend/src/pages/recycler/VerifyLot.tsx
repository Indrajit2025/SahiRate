import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Weight, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/dexie";
import { createHandover } from "@/services/handovers";
import { DEMO_RECYCLER_ID } from "@/services/lots";

export default function VerifyLot() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const lot = useLiveQuery(() => (id ? db.lots.get(id) : undefined), [id]);

  const [weight, setWeight] = useState<string>("");
  const [rate, setRate] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (lot) {
      if (lot.payload.approx_weight_kg) setWeight(lot.payload.approx_weight_kg.toString());
      if (lot.payload.estimated_value && lot.payload.approx_weight_kg) {
        setRate((lot.payload.estimated_value / lot.payload.approx_weight_kg).toFixed(2));
      }
    }
  }, [lot]);

  if (lot === undefined) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  if (!lot) return <div className="p-8 text-center font-bold">Lot not found</div>;

  const verifiedWeight = parseFloat(weight);
  const finalRate = parseFloat(rate);
  const finalAmount = !isNaN(verifiedWeight) && !isNaN(finalRate) ? Math.round(verifiedWeight * finalRate) : 0;

  const isValid = !isNaN(verifiedWeight) && verifiedWeight > 0 && !isNaN(finalRate) && finalRate > 0;

  const handleGenerateHandover = async () => {
    if (!id || !isValid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const handover = await createHandover(
        id,
        DEMO_RECYCLER_ID,
        verifiedWeight,
        finalRate,
        finalAmount
      );
      navigate(`/recycler/handover/${handover.id}`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to create handover");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-4 pb-24 space-y-6 animate-in fade-in slide-in-from-right-4">
      <header className="flex items-center py-4">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 text-muted-foreground hover:text-foreground"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">Verify Lot</h1>
      </header>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-1">{lot.payload.material_id || "Unknown Material"}</h2>
            <p className="text-sm text-muted-foreground">Est. {lot.payload.approx_weight_kg} kg</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-base font-semibold">Verified Weight (kg)</Label>
              <div className="relative">
                <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="weight"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="pl-10 h-14 text-lg"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate" className="text-base font-semibold">Final Rate (₹/kg)</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="rate"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0.1"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="pl-10 h-14 text-lg"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-secondary/10 border-secondary/20 shadow-sm">
        <CardContent className="p-6 flex justify-between items-center">
          <span className="text-lg font-semibold text-secondary-foreground">Final Amount</span>
          <span className="text-3xl font-bold text-secondary-foreground">₹{finalAmount}</span>
        </CardContent>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
        <Button
          className="w-full h-14 text-lg font-bold bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          onClick={handleGenerateHandover}
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? "Generating..." : "Generate Handover QR"}
        </Button>
      </div>
    </div>
  );
}
