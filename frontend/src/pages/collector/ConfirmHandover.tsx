import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, CheckCircle2, IndianRupee, Weight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/dexie";
import { collectorConfirmHandover } from "@/services/handovers";
import { useI18nStore } from "@/i18n";

export default function ConfirmHandover() { const { t } = useI18nStore();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handover = useLiveQuery(() => (id ? db.handovers.get(id) : undefined), [id]);
  const lot = useLiveQuery(() => (handover ? db.lots.get(handover.lot_id) : undefined), [handover]);
  const payment = useLiveQuery(() => (id ? db.payments.where('handover_id').equals(id).first() : undefined), [id]);

  if (handover === undefined || (handover && lot === undefined)) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }

  if (!handover || !lot) {
    return (
      <div className="p-8 text-center flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4">Handover not found</h2>
        <Button onClick={() => navigate("/collector")}>Return Home</Button>
      </div>
    );
  }

  const isConfirmed = handover.status !== "QR_GENERATED" && handover.status !== "VERIFIED";

  const handleConfirm = async () => {
    if (!id || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await collectorConfirmHandover(id);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to confirm handover");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-4 pb-24 space-y-6 animate-in fade-in slide-in-from-right-4">
      <header className="flex items-center py-4">
        <button
          onClick={() => navigate("/collector")}
          className="mr-4 text-muted-foreground hover:text-foreground"
          aria-label="Go back to Dashboard"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">Review Handover</h1>
      </header>

      {isConfirmed ? (
        <Card className="border-green-200 bg-green-50 shadow-md">
          <CardContent className="p-8 flex flex-col items-center justify-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-600" />
            <h2 className="text-2xl font-bold text-center text-green-800">Confirmed!</h2>
            <p className="text-center text-green-700 mb-4">
              Handover confirmed. Waiting for the recycler to finalize and process payment.
            </p>
            {payment && (
              <div className="w-full bg-white p-4 rounded-lg border text-center">
                <p className="text-sm font-semibold text-muted-foreground mb-1">Payment Received</p>
                <p className="text-2xl font-bold text-primary">₹{payment.amount}</p>
                <p className="text-xs text-muted-foreground mt-1">via {payment.payment_mode}</p>
              </div>
            )}
            <Button
              className="w-full mt-2 bg-green-600 hover:bg-green-700"
              onClick={() => navigate("/collector")}
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-primary/20 shadow-sm overflow-hidden">
            <div className="bg-primary/5 p-4 border-b">
              <h2 className="font-semibold text-primary">{lot.payload.material_id || t("common.unknown_material")}</h2>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Weight className="w-5 h-5" />
                  <span>{t("collector.confirm_handover.verified_weight")}</span>
                </div>
                <span className="text-xl font-semibold">{handover.verified_weight_kg} kg</span>
              </div>

              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <IndianRupee className="w-5 h-5" />
                  <span>{t("collector.confirm_handover.final_rate")}</span>
                </div>
                <span className="text-xl font-semibold">₹{handover.final_rate}/kg</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-lg font-bold">Total Amount</span>
                <span className="text-3xl font-black text-primary">₹{handover.final_amount}</span>
              </div>
            </CardContent>
          </Card>

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
            <Button
              className="w-full h-14 text-lg font-bold"
              onClick={handleConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Confirming..." : "Confirm & Accept"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
