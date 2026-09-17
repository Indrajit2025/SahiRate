import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  CheckCircle2,
  Weight,
  IndianRupee,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/dexie";
import { createHandover } from "@/services/handovers";
import { DEMO_RECYCLER_ID } from "@/services/lots";
import { getDemoRefRate, DEMO_MATERIAL_IDS } from "@/services/refRates";
import { useTranslation } from "@/i18n";
import AudioGuidance from "@/components/AudioGuidance";

/** Tolerance for weight discrepancy warning: 5% */
const WEIGHT_TOLERANCE_PCT = 0.05;

export default function VerifyLot() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const lot = useLiveQuery(() => (id ? db.lots.get(id) : undefined), [id]);

  // ── Section 1: Material verification ────────────────────────────
  const [confirmedMaterial, setConfirmedMaterial] = useState<string | null>(null);
  const [choosingMaterial, setChoosingMaterial] = useState(false);

  // ── Section 2: Weight verification ─────────────────────────────
  const [weight, setWeight] = useState<string>("");

  // ── Section 3: Offer ────────────────────────────────────────────
  const [rate, setRate] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill from lot data
  useEffect(() => {
    if (lot) {
      if (lot.payload.approx_weight_kg) {
        setWeight(lot.payload.approx_weight_kg.toString());
      }
      const refRate = getDemoRefRate(lot.payload.material_id);
      if (refRate) {
        setRate(refRate.midpoint.toString());
      } else if (lot.payload.estimated_value && lot.payload.approx_weight_kg) {
        setRate(
          (lot.payload.estimated_value / lot.payload.approx_weight_kg).toFixed(2)
        );
      }
      setConfirmedMaterial(lot.payload.material_id || null);
    }
  }, [lot]);

  if (lot === undefined) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }
  if (!lot) {
    return (
      <div className="p-8 text-center font-bold text-charcoal">
        {t("recycler.lot_detail.not_found")}
      </div>
    );
  }

  const verifiedWeight = parseFloat(weight);
  const finalRate = parseFloat(rate);
  const collectorWeight = lot.payload.approx_weight_kg ?? 0;
  const weightDiff = !isNaN(verifiedWeight) ? verifiedWeight - collectorWeight : 0;
  const weightDiffPct =
    collectorWeight > 0 ? Math.abs(weightDiff) / collectorWeight : 0;
  const showWeightWarning =
    !isNaN(verifiedWeight) && verifiedWeight > 0 && weightDiffPct > WEIGHT_TOLERANCE_PCT;
  const finalAmount =
    !isNaN(verifiedWeight) && !isNaN(finalRate)
      ? Math.round(verifiedWeight * finalRate)
      : 0;
  const isValid =
    !isNaN(verifiedWeight) &&
    verifiedWeight > 0 &&
    !isNaN(finalRate) &&
    finalRate > 0 &&
    finalAmount > 0 &&
    !!confirmedMaterial;

  const refRate = getDemoRefRate(lot.payload.material_id);

  const handleGenerateHandover = async () => {
    if (!id || !isValid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Persist recycler verification on the lot record
      await db.lots.update(id, {
        recycler_verified_material: confirmedMaterial ?? undefined,
        recycler_weight_kg: verifiedWeight,
      });
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-[#F7F5EE] pb-32 animate-in fade-in slide-in-from-right-4">
      {/* HEADER */}
      <header className="flex items-center px-4 h-14 border-b border-warm-borders/50 bg-[#F7F5EE] sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="mr-3 text-muted-foreground hover:text-charcoal -ml-1 p-1"
          aria-label={t("common.back")}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-extrabold text-charcoal text-lg">
          {t("recycler.verification.title")}
        </h1>
      </header>

      <div className="p-4 space-y-5">
        {/* ── SECTION 1: MATERIAL VERIFICATION ─────────────────── */}
        <section>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
            {t("recycler.verification.material_section")}
          </p>
          <div className="bg-[#FDFCF8] border border-[#E8E4D9] rounded p-4 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">
                {t("recycler.verification.ai_identified_as")}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-extrabold text-charcoal uppercase">
                  {lot.payload.material_id || t("common.unknown_material")}
                </span>
                <Badge className="text-[9px] font-bold bg-primary/10 text-primary border-0 px-1.5 py-0.5 uppercase tracking-wider">
                  AI
                </Badge>
              </div>
            </div>

            {confirmedMaterial ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                <span className="text-sm font-bold text-charcoal">
                  {t("recycler.verification.material_confirmed")}:{" "}
                  <span className="uppercase">{confirmedMaterial}</span>
                </span>
                <button
                  onClick={() => setChoosingMaterial(true)}
                  className="ml-auto text-xs font-bold text-primary hover:underline shrink-0"
                >
                  {t("recycler.verification.choose_another")}
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 h-10 text-xs font-bold bg-primary text-white"
                  onClick={() => setConfirmedMaterial(lot.payload.material_id || "PCB")}
                >
                  {t("recycler.verification.confirm_material")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-10 text-xs font-bold"
                  onClick={() => setChoosingMaterial(true)}
                >
                  {t("recycler.verification.choose_another")}
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* ── SECTION 2: WEIGHT VERIFICATION ───────────────────── */}
        <section>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
            {t("recycler.verification.weight_section")}
          </p>
          <div className="bg-[#FDFCF8] border border-[#E8E4D9] rounded p-4 space-y-3">
            {/* Collector weight label */}
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                {t("recycler.verification.collector_weight_label")}
              </span>
              <span className="text-base font-extrabold text-charcoal font-mono">
                {collectorWeight > 0 ? `${collectorWeight} kg` : "—"}
              </span>
            </div>

            {/* Recycler input */}
            <div className="space-y-1.5">
              <Label htmlFor="weight" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {t("recycler.verification.verified_weight_label")}
              </Label>
              <div className="relative">
                <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="weight"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0.01"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="pl-10 h-12 text-lg font-bold border-[#DDD8CC] bg-white"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Difference */}
            {!isNaN(verifiedWeight) && verifiedWeight > 0 && collectorWeight > 0 && (
              <div className="flex items-center justify-between pt-1 border-t border-dashed border-[#E8E4D9]">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  {t("recycler.verification.difference_label")}
                </span>
                <span
                  className={`text-sm font-extrabold font-mono ${
                    Math.abs(weightDiff) < 0.01
                      ? "text-success"
                      : weightDiff < 0
                      ? "text-destructive"
                      : "text-[#C56A3D]"
                  }`}
                >
                  {weightDiff >= 0 ? "+" : ""}
                  {weightDiff.toFixed(2)} kg
                </span>
              </div>
            )}

            {showWeightWarning && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded p-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-amber-800">
                  {t("recycler.verification.weight_warning")}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── SECTION 3: OFFER ─────────────────────────────────── */}
        <section>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
            {t("recycler.verification.offer_section")}
          </p>
          <div className="bg-[#FDFCF8] border border-[#E8E4D9] rounded p-4 space-y-3">
            {/* Reference rate */}
            {refRate && (
              <div className="flex justify-between items-center pb-2 border-b border-dashed border-[#E8E4D9]">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  {t("recycler.verification.ref_rate_label")}
                </span>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#C56A3D] font-mono">
                    ₹{refRate.midpoint}/kg
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-1">
                    (₹{refRate.min}–₹{refRate.max})
                  </span>
                </div>
              </div>
            )}

            {/* Your offer */}
            <div className="space-y-1.5">
              <Label htmlFor="rate" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {t("recycler.verification.offer_rate_label")}
              </Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="rate"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0.01"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="pl-10 h-12 text-lg font-bold border-[#DDD8CC] bg-white"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Estimated total */}
            <div className="flex justify-between items-center pt-2 border-t border-[#E8E4D9]">
              <span className="text-sm font-bold text-muted-foreground">
                {t("recycler.verification.estimated_total")}
              </span>
              <span className="text-2xl font-extrabold text-primary font-mono tabular-nums">
                ₹{finalAmount > 0 ? finalAmount.toLocaleString() : "—"}
              </span>
            </div>

            {finalAmount <= 0 && (weight || rate) && (
              <p className="text-xs font-semibold text-destructive">
                {t("recycler.verification.amount_zero_error")}
              </p>
            )}
          </div>
        </section>

        {/* Demo note */}
        <p className="text-[10px] text-muted-foreground text-center font-semibold px-2">
          {t("recycler.verification.demo_note")}
        </p>

        <AudioGuidance audioKey="recycler_verify_weight" />
      </div>

      {/* FIXED CTA */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto p-4 bg-[#F7F5EE] border-t border-warm-borders shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
        <Button
          className="w-full h-14 text-base font-bold bg-primary hover:bg-primary/90 text-white"
          onClick={handleGenerateHandover}
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting
            ? t("recycler.verification.generating")
            : t("recycler.verification.generate_qr")}
        </Button>
      </div>

      {/* MATERIAL CHOOSER DIALOG */}
      <Dialog open={choosingMaterial} onOpenChange={setChoosingMaterial}>
        <DialogContent className="max-w-[340px] rounded-xl">
          <DialogHeader>
            <DialogTitle>Choose Material</DialogTitle>
            <DialogDescription>
              Select the correct material for this lot.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            {DEMO_MATERIAL_IDS.map((matId) => (
              <button
                key={matId}
                onClick={() => {
                  setConfirmedMaterial(matId);
                  setChoosingMaterial(false);
                  // Update offer rate to match new material
                  const newRef = getDemoRefRate(matId);
                  if (newRef) setRate(newRef.midpoint.toString());
                }}
                className={`w-full text-left px-4 py-3 rounded border font-bold text-sm uppercase tracking-wide transition-colors ${
                  confirmedMaterial === matId
                    ? "bg-primary text-white border-primary"
                    : "bg-white border-[#DDD8CC] text-charcoal hover:border-primary/50"
                }`}
              >
                {matId}
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setChoosingMaterial(false)}
            >
              {t("recycler.lot_detail.cancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
