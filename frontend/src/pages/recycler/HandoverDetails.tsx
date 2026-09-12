import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, CheckCircle2, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/dexie";
import { recyclerCompleteHandover, recordPayment } from "@/services/handovers";
import type { PaymentMode } from "@/types";

export default function HandoverDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handover = useLiveQuery(() => (id ? db.handovers.get(id) : undefined), [id]);
  const payment = useLiveQuery(() => (id ? db.payments.where('handover_id').equals(id).first() : undefined), [id]);

  if (handover === undefined) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  if (!handover) return <div className="p-8 text-center font-bold">Handover not found</div>;

  const isConfirmedByCollector = handover.status === "COLLECTOR_CONFIRMED";
  const isCompleted = handover.status === "COMPLETED";
  const isPaid = payment !== undefined;

  const handleComplete = async () => {
    if (!id || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await recyclerCompleteHandover(id);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to complete handover");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async (mode: PaymentMode) => {
    if (!id || isSubmitting || !handover.final_amount) return;
    setIsSubmitting(true);
    try {
      await recordPayment(id, handover.final_amount, mode);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const qrPayload = JSON.stringify({
    type: "SAHIRATE_HANDOVER",
    handover_id: handover.id,
    lot_id: handover.lot_id,
    qr_reference: handover.qr_reference,
  });

  return (
    <div className="flex flex-col min-h-screen p-4 pb-24 space-y-6 animate-in fade-in slide-in-from-right-4">
      <header className="flex items-center py-4">
        <button
          onClick={() => navigate("/recycler")}
          className="mr-4 text-muted-foreground hover:text-foreground"
          aria-label="Go back to Dashboard"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">Handover</h1>
      </header>

      {/* State 1: Awaiting Collector / QR Generated */}
      {(handover.status === "QR_GENERATED" || handover.status === "VERIFIED") && (
        <Card className="border-secondary/20 shadow-md">
          <CardContent className="p-8 flex flex-col items-center justify-center space-y-6">
            <h2 className="text-lg font-semibold text-center">Scan to Confirm</h2>
            <div className="bg-white p-4 rounded-xl border-4 border-muted">
              <QRCodeSVG value={qrPayload} size={200} />
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Ask the collector to scan this code to confirm the weight and amount.
            </p>
            <div className="w-full pt-4 border-t border-dashed">
              <p className="text-sm font-medium mb-1">Manual Reference:</p>
              <p className="text-2xl font-mono text-center bg-muted/50 py-2 rounded-lg">{handover.qr_reference}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* State 2: Collector Confirmed -> Recycler Completes */}
      {isConfirmedByCollector && (
        <Card className="border-green-200 bg-green-50 shadow-md">
          <CardContent className="p-8 flex flex-col items-center justify-center space-y-6 text-green-800">
            <CheckCircle2 className="w-16 h-16 text-green-600" />
            <h2 className="text-2xl font-bold text-center">Collector Confirmed!</h2>
            <p className="text-center">The collector has accepted the verified weight and rate.</p>
            <Button
              className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700 text-white"
              onClick={handleComplete}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Finalizing..." : "Complete Handover"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* State 3: Completed -> Payment Pending */}
      {isCompleted && !isPaid && (
        <Card className="border-blue-200 bg-blue-50 shadow-md">
          <CardContent className="p-6 space-y-6">
            <div className="text-center">
              <IndianRupee className="w-12 h-12 text-blue-600 mx-auto mb-2" />
              <h2 className="text-xl font-bold text-blue-900">Record Payment</h2>
              <p className="text-3xl font-black text-blue-700 my-4">₹{handover.final_amount}</p>
              <p className="text-sm text-blue-800/80 mb-6">Select how you paid the collector</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                className="h-14 text-lg border-blue-200 hover:bg-blue-100 font-semibold"
                onClick={() => handlePayment("CASH")}
                disabled={isSubmitting}
              >
                Cash
              </Button>
              <Button
                variant="outline"
                className="h-14 text-lg border-blue-200 hover:bg-blue-100 font-semibold"
                onClick={() => handlePayment("UPI")}
                disabled={isSubmitting}
              >
                UPI
              </Button>
              <Button
                variant="outline"
                className="h-14 text-lg border-blue-200 hover:bg-blue-100 font-semibold"
                onClick={() => handlePayment("BANK")}
                disabled={isSubmitting}
              >
                Bank Transfer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* State 4: Paid */}
      {isPaid && payment && (
        <Card className="border-secondary/20 shadow-md bg-secondary/5">
          <CardContent className="p-8 flex flex-col items-center justify-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-secondary" />
            <h2 className="text-2xl font-bold text-center text-secondary">Payment Recorded</h2>
            <div className="w-full space-y-2 mt-4 p-4 bg-background rounded-lg border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold">₹{payment.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mode</span>
                <span className="font-semibold">{payment.payment_mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="text-sm">{new Date(payment.paid_at!).toLocaleTimeString()}</span>
              </div>
            </div>
            <Button
              className="w-full mt-4"
              variant="outline"
              onClick={() => navigate("/recycler")}
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Handover Summary */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold mb-2">Handover Summary</h3>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Verified Weight</span>
            <span className="font-medium">{handover.verified_weight_kg} kg</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Final Rate</span>
            <span className="font-medium">₹{handover.final_rate}/kg</span>
          </div>
          <div className="flex justify-between text-base font-semibold pt-2 border-t mt-2">
            <span>Total Amount</span>
            <span>₹{handover.final_amount}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
