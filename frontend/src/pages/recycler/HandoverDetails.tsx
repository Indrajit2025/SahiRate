import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  CheckCircle2,
  IndianRupee,
  Clock,
  Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/dexie";
import {
  recyclerCompleteHandover,
  recordPayment,
} from "@/services/handovers";
import type { PaymentMode } from "@/types";
import { useTranslation } from "@/i18n";
import AudioGuidance from "@/components/AudioGuidance";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function HandoverDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const handover = useLiveQuery(
    () => (id ? db.handovers.get(id) : undefined),
    [id]
  );
  const lot = useLiveQuery(
    () => (handover ? db.lots.get(handover.lot_id) : undefined),
    [handover?.lot_id]
  );
  const payment = useLiveQuery(
    () =>
      id ? db.payments.where("handover_id").equals(id).first() : undefined,
    [id]
  );

  if (handover === undefined) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }
  if (!handover) {
    return (
      <div className="p-8 text-center font-bold text-charcoal">
        {t("recycler.handover.not_found")}
      </div>
    );
  }

  const isQRPhase =
    handover.status === "QR_GENERATED" || handover.status === "VERIFIED";
  const isCollectorConfirmed = handover.status === "COLLECTOR_CONFIRMED";
  const isCompleted = handover.status === "COMPLETED";
  const isPaid = !!payment;

  const qrPayload = JSON.stringify({
    type: "SAHIRATE_HANDOVER",
    handover_id: handover.id,
    lot_id: handover.lot_id,
    qr_reference: handover.qr_reference,
  });

  const handleComplete = async () => {
    if (!id || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await recyclerCompleteHandover(id);
    } catch (err: any) {
      console.error("[Handover] Complete failed:", err);
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
      console.error("[Handover] Payment failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-[#F7F5EE] pb-6 animate-in fade-in slide-in-from-right-4">
      {/* HEADER */}
      <header className="flex items-center px-4 h-14 border-b border-warm-borders/50 bg-[#F7F5EE] sticky top-0 z-10">
        <button
          onClick={() => navigate("/recycler")}
          className="mr-3 text-muted-foreground hover:text-charcoal -ml-1 p-1"
          aria-label={t("common.back")}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-extrabold text-charcoal text-lg">
          {t("recycler.handover.title")}
        </h1>
        {handover.qr_reference && (
          <span className="ml-auto text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            #{handover.qr_reference}
          </span>
        )}
      </header>

      <div className="p-4 space-y-5">
        {/* LOT SUMMARY STRIP */}
        <section>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
            {t("recycler.handover.lot_summary")}
          </p>
          <div className="bg-[#FDFCF8] border border-[#E8E4D9] rounded divide-y divide-[#E8E4D9]">
            <SummaryRow
              label={t("recycler.transaction_detail.material")}
              value={lot?.payload.material_id || t("common.unknown_material")}
              bold
            />
            <SummaryRow
              label={t("recycler.transaction_detail.verified_weight")}
              value={`${handover.verified_weight_kg ?? "—"} kg`}
            />
            <SummaryRow
              label={t("recycler.transaction_detail.rate")}
              value={`₹${handover.final_rate}/kg`}
            />
            <SummaryRow
              label={t("recycler.transaction_detail.amount")}
              value={`₹${handover.final_amount?.toLocaleString()}`}
              highlight
            />
          </div>
        </section>

        {/* ── STATE 1: QR GENERATED — show QR ───────────────────── */}
        {isQRPhase && (
          <section>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-3 text-center">
              {t("recycler.handover.qr_instruction")}
            </p>

            <AudioGuidance audioKey="recycler_show_qr" />

            <div className="flex flex-col items-center gap-4 bg-[#FDFCF8] border border-[#E8E4D9] rounded p-6">
              <div className="bg-white p-4 rounded border-4 border-[#DDD8CC] shadow-sm">
                <QRCodeSVG
                  value={qrPayload}
                  size={200}
                  fgColor="#174C4A"
                  bgColor="#FFFFFF"
                />
              </div>
              <p className="text-sm text-center text-muted-foreground font-semibold max-w-xs">
                {t("recycler.handover.qr_sub")}
              </p>

              {/* Manual reference */}
              <div className="w-full border-t border-dashed border-[#DDD8CC] pt-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center mb-1">
                  {t("recycler.handover.manual_ref")}
                </p>
                <p className="text-2xl font-mono font-black text-center text-charcoal tracking-widest bg-[#EDE9E0] rounded py-2">
                  {handover.qr_reference}
                </p>
              </div>
            </div>

            {/* Waiting indicator */}
            <div className="flex items-center justify-center gap-2 mt-3 text-muted-foreground">
              <Clock className="w-4 h-4 animate-pulse" />
              <span className="text-xs font-semibold">
                {t("recycler.handover.waiting")}
              </span>
            </div>

            {/* Cancel handover */}
            <Button
              variant="outline"
              className="w-full mt-3 h-11 text-sm font-semibold border-destructive/30 text-destructive hover:bg-destructive/5"
              onClick={() => setCancelOpen(true)}
            >
              {t("recycler.handover.cancel")}
            </Button>
          </section>
        )}

        {/* ── STATE 2: COLLECTOR CONFIRMED ──────────────────────── */}
        {isCollectorConfirmed && (
          <section>
            <div className="flex flex-col items-center gap-4 bg-[#F0FDF4] border border-green-200 rounded p-6 text-center">
              <CheckCircle2 className="w-14 h-14 text-green-600" />
              <div>
                <h2 className="text-xl font-extrabold text-green-900">
                  {t("recycler.handover.collector_confirmed_title")}
                </h2>
                <p className="text-sm text-green-700 mt-1">
                  {t("recycler.handover.collector_confirmed_desc")}
                </p>
              </div>
              <Button
                className="w-full h-14 text-base font-bold bg-green-700 hover:bg-green-800 text-white"
                onClick={handleComplete}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? t("recycler.handover.completing")
                  : t("recycler.handover.complete_handover")}
              </Button>
            </div>
          </section>
        )}

        {/* ── STATE 3: COMPLETED — PAYMENT PENDING ──────────────── */}
        {isCompleted && !isPaid && (
          <section>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
              {t("recycler.handover.payment_section")}
            </p>
            <div className="bg-[#FDFCF8] border border-[#E8E4D9] rounded p-5 space-y-4">
              <div className="text-center">
                <IndianRupee className="w-10 h-10 text-primary mx-auto mb-1" />
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                  {t("recycler.handover.payment_amount")}
                </p>
                <p className="text-3xl font-extrabold text-primary font-mono tabular-nums mt-1">
                  ₹{handover.final_amount?.toLocaleString()}
                </p>
              </div>
              <p className="text-xs text-center text-muted-foreground font-semibold">
                {t("recycler.handover.payment_prompt")}
              </p>
              <div className="grid gap-2">
                {(["CASH", "UPI", "BANK"] as PaymentMode[]).map((mode) => (
                  <Button
                    key={mode}
                    variant="outline"
                    className="h-14 text-base font-bold border-[#DDD8CC] hover:border-primary hover:bg-primary/5 justify-start gap-3 px-4"
                    onClick={() => handlePayment(mode)}
                    disabled={isSubmitting}
                  >
                    <Banknote className="w-5 h-5 text-muted-foreground" />
                    {mode === "CASH"
                      ? t("recycler.handover.cash")
                      : mode === "UPI"
                      ? t("recycler.handover.upi")
                      : t("recycler.handover.bank")}
                  </Button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── STATE 4: PAID — SETTLEMENT SLIP ──────────────────── */}
        {isPaid && payment && (
          <section>
            <div className="bg-[#FDFCF8] border-t-[4px] border-t-primary border border-[#E8E4D9] rounded p-5 space-y-4">
              {/* Settlement header */}
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-[#E8E4D9]">
                <CheckCircle2 className="w-10 h-10 text-primary mx-auto" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  {t("recycler.handover.settlement_slip_title")}
                </p>
                <p className="text-xs text-muted-foreground font-semibold">
                  {t("recycler.handover.settlement_confirmed")}
                </p>
              </div>

              {/* Slip details */}
              <div className="space-y-2">
                <SlipRow label={t("recycler.transaction_detail.material")} value={lot?.payload.material_id || "—"} />
                <SlipRow label={t("recycler.transaction_detail.verified_weight")} value={`${handover.verified_weight_kg} kg`} />
                <SlipRow label={t("recycler.transaction_detail.rate")} value={`₹${handover.final_rate}/kg`} />
                <SlipRow
                  label={t("recycler.transaction_detail.amount")}
                  value={`₹${handover.final_amount?.toLocaleString()}`}
                  bold
                />
                <SlipRow label={t("recycler.transaction_detail.payment_mode")} value={payment.payment_mode} />
                <SlipRow
                  label={t("recycler.transaction_detail.lot_id")}
                  value={`#${handover.lot_id.substring(0, 8).toUpperCase()}`}
                />
                {payment.paid_at && (
                  <SlipRow
                    label={t("recycler.transaction_detail.payment_time")}
                    value={new Date(payment.paid_at).toLocaleString()}
                  />
                )}
              </div>

              {/* Navigation */}
              <div className="grid gap-2 pt-2">
                <Button
                  className="w-full h-12 font-bold bg-primary text-white"
                  onClick={() => navigate("/recycler/transactions")}
                >
                  {t("recycler.handover.back_to_transactions")}
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-11"
                  onClick={() => navigate("/recycler")}
                >
                  {t("recycler.handover.back_home")}
                </Button>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* CANCEL DIALOG */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="max-w-[340px] rounded-xl">
          <DialogHeader>
            <DialogTitle>{t("recycler.handover.cancel_confirm_title")}</DialogTitle>
            <DialogDescription>
              {t("recycler.handover.cancel_confirm_desc")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setCancelOpen(false)}
            >
              {t("recycler.lot_detail.cancel")}
            </Button>
            <Button
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={() => {
                setCancelOpen(false);
                navigate("/recycler/lots");
              }}
            >
              {t("recycler.handover.cancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── helpers ────────────────────────────────────────────────────────────────

function SummaryRow({
  label,
  value,
  bold,
  highlight,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-center px-4 py-3">
      <span className="text-sm font-semibold text-muted-foreground">{label}</span>
      <span
        className={`text-sm font-mono ${
          highlight
            ? "text-lg font-extrabold text-primary"
            : bold
            ? "font-extrabold text-charcoal uppercase"
            : "font-bold text-charcoal"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function SlipRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-1.5">
      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
        {label}
      </span>
      <span
        className={`text-sm font-mono ${
          bold ? "font-extrabold text-primary text-base" : "font-bold text-charcoal"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
