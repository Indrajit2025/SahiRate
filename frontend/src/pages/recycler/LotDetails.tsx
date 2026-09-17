import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  CameraOff,
  CheckCircle2,
  Clock,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { acceptLocalLot, DEMO_RECYCLER_ID } from "@/services/lots";
import { getDemoRefRate } from "@/services/refRates";
import { useTranslation } from "@/i18n";
import AudioGuidance from "@/components/AudioGuidance";

export default function LotDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  const lot = useLiveQuery(() => (id ? db.lots.get(id) : undefined), [id]);
  const photo = useLiveQuery(
    () => (id ? db.photos.where("lot_id").equals(id).first() : undefined),
    [id]
  );
  const handover = useLiveQuery(
    () => (id ? db.handovers.where("lot_id").equals(id).first() : undefined),
    [id]
  );

  if (lot === undefined) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="p-8 text-center flex flex-col items-center gap-4">
        <h2 className="text-xl font-bold">{t("recycler.lot_detail.not_found")}</h2>
        <Button onClick={() => navigate("/recycler/lots")} variant="outline">
          {t("recycler.lot_detail.return_incoming")}
        </Button>
      </div>
    );
  }

  const lotStatus = lot.status || "available";
  const isAvailable = lotStatus === "available";
  const isAcceptedByMe =
    lot.status === "accepted" && lot.accepted_by === DEMO_RECYCLER_ID;

  const refRate = getDemoRefRate(lot.payload.material_id);
  const shortId = lot.id.substring(0, 8).toUpperCase();
  const createdDate = new Date(lot.created_at_local).toLocaleString();

  const handleAccept = async () => {
    if (!id || isAccepting) return;
    setIsAccepting(true);
    try {
      await acceptLocalLot(id);
      navigate(`/recycler/lot/${id}/verify`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAccepting(false);
    }
  };

  // Reject = just navigate away for demo (no destructive action without real backend)
  const handleReject = async () => {
    setRejectOpen(false);
    navigate("/recycler/lots");
  };

  // Verification state indicators
  const materialVerified =
    !!lot.recycler_verified_material || isAcceptedByMe || !!handover;
  const weightVerified = !!lot.recycler_weight_kg || !!handover?.verified_weight_kg;
  const photoPresent = !!photo;

  return (
    <div className="flex flex-col min-h-full bg-[#F7F5EE] pb-28 animate-in fade-in slide-in-from-right-4">
      {/* BACK HEADER */}
      <header className="flex items-center px-4 h-14 border-b border-warm-borders/50 bg-[#F7F5EE] sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="mr-3 text-muted-foreground hover:text-charcoal -ml-1 p-1"
          aria-label={t("common.back")}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-extrabold text-charcoal text-lg">
          {t("recycler.lot_detail.title")}
        </h1>
        <span className="ml-auto text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          #{shortId}
        </span>
      </header>

      {/* PHOTO */}
      {photo ? (
        <img
          src={photo.data_uri}
          alt="Scrap material"
          className="w-full h-56 object-cover"
        />
      ) : (
        <div className="w-full h-40 bg-[#EDE9E0] flex flex-col items-center justify-center text-muted-foreground">
          <CameraOff className="w-10 h-10 mb-2 opacity-30" />
          <span className="text-xs font-semibold">
            {t("recycler.lot_detail.no_photo")}
          </span>
        </div>
      )}

      <div className="p-4 space-y-5">
        {/* AI IDENTIFICATION */}
        <section>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
            {t("recycler.lot_detail.ai_identification")}
          </p>
          <div className="bg-[#FDFCF8] border border-[#E8E4D9] rounded p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-charcoal uppercase tracking-tight">
                  {lot.payload.material_id || t("common.unknown_material")}
                </h2>
                {lot.recycler_verified_material &&
                  lot.recycler_verified_material !== lot.payload.material_id && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Recycler confirmed:{" "}
                      <span className="font-bold text-charcoal">
                        {lot.recycler_verified_material}
                      </span>
                    </p>
                  )}
              </div>
              <Badge className="text-[10px] font-bold bg-primary/10 text-primary border-0 px-2 py-1 rounded uppercase tracking-widest">
                AI
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{createdDate}</p>
          </div>
        </section>

        {/* REFERENCE RATE */}
        {refRate && (
          <section>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
              {t("recycler.lot_detail.ref_rate_section")}
            </p>
            <div className="bg-[#FDFCF8] border border-[#E8E4D9] rounded p-4 flex justify-between items-center">
              <div>
                <p className="text-xl font-extrabold text-[#C56A3D] font-mono">
                  {t("recycler.lot_detail.ref_rate_value", {
                    rate: refRate.midpoint,
                  })}
                </p>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                  Range ₹{refRate.min}–₹{refRate.max}/kg
                </p>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">
                DEMO DATA
              </span>
            </div>
          </section>
        )}

        {/* WEIGHT */}
        <section>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
            {t("recycler.lot_detail.weight_section")}
          </p>
          <div className="bg-[#FDFCF8] border border-[#E8E4D9] rounded p-4">
            <p className="text-2xl font-extrabold text-charcoal font-mono">
              {lot.payload.approx_weight_kg
                ? `${lot.payload.approx_weight_kg} kg`
                : "—"}
            </p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
              {t("recycler.lot_detail.collector_weight")}
            </p>
            {lot.recycler_weight_kg && (
              <p className="text-sm text-muted-foreground mt-1">
                Recycler verified:{" "}
                <span className="font-bold text-charcoal">
                  {lot.recycler_weight_kg} kg
                </span>
              </p>
            )}
          </div>
        </section>

        {/* VERIFICATION STATUS */}
        <section>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
            {t("recycler.lot_detail.verification_section")}
          </p>
          <div className="bg-[#FDFCF8] border border-[#E8E4D9] rounded divide-y divide-[#E8E4D9]">
            <VerifyRow
              label={t("recycler.lot_detail.material_check")}
              verified={materialVerified}
            />
            <VerifyRow
              label={t("recycler.lot_detail.photo_check")}
              verified={photoPresent}
            />
            <VerifyRow
              label={t("recycler.lot_detail.weight_check")}
              verified={weightVerified}
            />
          </div>
        </section>

        {/* AUDIO guidance */}
        {isAvailable && (
          <AudioGuidance audioKey="recycler_lot_inspect" />
        )}
      </div>

      {/* FIXED ACTIONS */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto p-4 bg-[#F7F5EE] border-t border-warm-borders shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 space-y-2">
        {isAvailable && (
          <>
            <Button
              className="w-full h-14 text-base font-bold bg-primary hover:bg-primary/90 text-white"
              onClick={handleAccept}
              disabled={isAccepting}
            >
              {isAccepting ? "Accepting..." : t("recycler.lot_detail.verify_accept")}
            </Button>
            <Button
              variant="outline"
              className="w-full h-11 text-sm font-semibold border-destructive/40 text-destructive hover:bg-destructive/5"
              onClick={() => setRejectOpen(true)}
            >
              {t("recycler.lot_detail.reject")}
            </Button>
          </>
        )}

        {isAcceptedByMe && (
          <>
            {handover ? (
              <Button
                className="w-full h-14 text-base font-bold bg-charcoal hover:bg-charcoal/90 text-white"
                onClick={() => navigate(`/recycler/handover/${handover.id}`)}
              >
                {t("recycler.lot_detail.view_handover")}
              </Button>
            ) : (
              <Button
                className="w-full h-14 text-base font-bold bg-primary hover:bg-primary/90 text-white"
                onClick={() => navigate(`/recycler/lot/${id}/verify`)}
              >
                {t("recycler.lot_detail.start_handover")}
              </Button>
            )}
          </>
        )}

        {!isAvailable && !isAcceptedByMe && (
          <Button
            variant="outline"
            className="w-full h-12"
            onClick={() => navigate("/recycler/lots")}
          >
            {t("recycler.lot_detail.return_incoming")}
          </Button>
        )}
      </div>

      {/* REJECT DIALOG */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-[340px] rounded-xl">
          <DialogHeader>
            <DialogTitle>{t("recycler.lot_detail.reject_confirm_title")}</DialogTitle>
            <DialogDescription>
              {t("recycler.lot_detail.reject_confirm_desc")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setRejectOpen(false)}
            >
              {t("recycler.lot_detail.cancel")}
            </Button>
            <Button
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={handleReject}
            >
              {t("recycler.lot_detail.reject_confirm_btn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Verification row ──────────────────────────────────────────────────────────

function VerifyRow({
  label,
  verified,
}: {
  label: string;
  verified: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm font-semibold text-charcoal">{label}</span>
      {verified ? (
        <span className="flex items-center gap-1 text-xs font-bold text-success">
          <CheckCircle2 className="w-4 h-4" /> ✓
        </span>
      ) : (
        <span className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
          <Clock className="w-3.5 h-3.5" /> Pending
        </span>
      )}
    </div>
  );
}
