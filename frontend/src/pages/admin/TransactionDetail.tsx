import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "@/i18n";
import { getAdminTransactionById } from "@/services/admin/adminDemo";
import type { AdminLifecycleStatus } from "@/services/admin/adminDemo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Clock, Image as ImageIcon, MapPin, Receipt, ShieldAlert, Truck, Wallet } from "lucide-react";

export default function AdminTransactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const tr = getAdminTransactionById(id || "");

  if (!tr) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <ShieldAlert className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">{String(t("admin.transactions.not_found"))}</h1>
        <Button variant="outline" onClick={() => navigate("/admin/transactions")} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {String(t("admin.transactions.back_to_list"))}
        </Button>
      </div>
    );
  }

  const lifecycleOrder: AdminLifecycleStatus[] = ["created", "accepted", "qr_generated", "collector_confirmed", "completed"];
  const currentIndex = lifecycleOrder.indexOf(tr.lifecycleStatus);

  const getStepStatus = (step: AdminLifecycleStatus) => {
    const index = lifecycleOrder.indexOf(step);
    if (index < currentIndex) return "completed";
    if (index === currentIndex) return "current";
    return "pending";
  };

  const getStepLabel = (step: AdminLifecycleStatus) => {
    switch(step) {
      case "created": return "Lot Created";
      case "accepted": return "Accepted by Recycler";
      case "qr_generated": return "Handover QR Generated";
      case "collector_confirmed": return "Collector Confirmed";
      case "completed": return "Handover Completed";
    }
  };

  const paymentCompleted = tr.paymentStatus === "completed";

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/transactions")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">{String(t("admin.transactions.detail_title"))}</h1>
        <Badge variant="outline" className="ml-auto font-mono">{tr.id}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left Column - Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="bg-muted/30 pb-4 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Transaction Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase">{String(t("admin.transactions.transaction_id"))}</p>
                <p className="font-mono font-medium">{tr.id}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">{String(t("admin.transactions.lot_id"))}</p>
                <p className="font-mono font-medium">{tr.lotId}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">{String(t("admin.transactions.material"))}</p>
                <p className="font-medium">{tr.material}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">{String(t("admin.transactions.weight"))}</p>
                <p className="font-medium">{tr.weightKg} kg</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">{String(t("admin.transactions.created"))}</p>
                <p className="text-sm">{new Date(tr.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">{String(t("admin.transactions.updated"))}</p>
                <p className="text-sm">{new Date(tr.updatedAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="bg-muted/30 pb-4 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Participants
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase">{String(t("admin.transactions.collector"))}</p>
                  <p className="font-medium">{tr.collectorName}</p>
                  <p className="font-mono text-xs text-muted-foreground">{tr.collectorId}</p>
                </div>
                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground uppercase">{String(t("admin.transactions.recycler"))}</p>
                  {tr.recyclerId ? (
                    <>
                      <p className="font-medium">{tr.recyclerName}</p>
                      <p className="font-mono text-xs text-muted-foreground">{tr.recyclerId}</p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No recycler assigned</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-muted/30 pb-4 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">{String(t("admin.transactions.rate"))}</p>
                    <p className="font-medium">₹{tr.ratePerKg || "—"} / kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">{String(t("admin.transactions.final_amount"))}</p>
                    <p className="font-medium text-lg">₹{tr.finalAmount || "—"}</p>
                  </div>
                </div>
                <div className="border-t pt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">{String(t("admin.transactions.payment_status"))}</p>
                    {tr.paymentStatus === 'completed' ? (
                       <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mt-1"><CheckCircle2 className="w-3 h-3 mr-1" /> PAID</Badge>
                    ) : (
                       <Badge variant="outline" className="text-orange-600 border-orange-200 mt-1"><Clock className="w-3 h-3 mr-1" /> PENDING</Badge>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">{String(t("admin.transactions.payment_mode"))}</p>
                    <p className="font-medium mt-1">{tr.paymentMode || "—"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column - Timeline & Photo */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="bg-muted/30 pb-4 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {String(t("admin.transactions.lifecycle"))}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {lifecycleOrder.map((step, i) => {
                  const status = getStepStatus(step);
                  const isLast = i === lifecycleOrder.length - 1;

                  return (
                    <div key={step} className="relative flex gap-4">
                      {!isLast && (
                        <div className={`absolute left-[11px] top-6 bottom-[-24px] w-[2px] ${status === 'completed' ? 'bg-primary' : 'bg-muted'}`} />
                      )}
                      <div className={`relative z-10 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-background
                        ${status === 'completed' ? 'border-primary text-primary' : status === 'current' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted text-transparent'}
                      `}>
                        {(status === 'completed' || status === 'current') && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 pb-2">
                        <p className={`text-sm font-medium ${status === 'pending' ? 'text-muted-foreground' : 'text-foreground'}`}>
                          {getStepLabel(step)}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Final Payment Step in Timeline */}
                <div className="relative flex gap-4 mt-6">
                   <div className={`relative z-10 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-background
                        ${paymentCompleted ? 'border-green-500 bg-green-500 text-white' : 'border-muted text-transparent'}
                      `}>
                        {paymentCompleted && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 pb-2">
                        <p className={`text-sm font-medium ${!paymentCompleted ? 'text-muted-foreground' : 'text-green-700'}`}>
                          Payment Recorded
                        </p>
                      </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-muted/30 pb-4 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                {String(t("admin.transactions.photo"))}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex justify-center items-center bg-muted/10 min-h-[160px]">
              {tr.photoUrl ? (
                <img src={tr.photoUrl} alt="Lot photo" className="rounded-md object-cover max-h-[200px]" />
              ) : (
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">{String(t("admin.transactions.no_photo"))}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
