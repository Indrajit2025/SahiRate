import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Clock, Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/dexie";


export default function History() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "COMPLETED" | "PAID">("ALL");

  const lots = useLiveQuery(() => db.lots.orderBy("created_at_local").reverse().toArray(), []) || [];
  const handovers = useLiveQuery(() => db.handovers.toArray(), []) || [];
  const payments = useLiveQuery(() => db.payments.toArray(), []) || [];

  const getDerivedStatus = (lotId: string) => {
    const handover = handovers.find((h) => h.lot_id === lotId);
    const payment = handover ? payments.find((p) => p.handover_id === handover.id) : null;
    const lot = lots.find((l) => l.id === lotId);

    if (payment) return { label: "PAID", type: "PAID", color: "bg-green-100 text-green-800 border-green-200" };
    if (handover && handover.status === "COMPLETED") return { label: "PAYMENT PENDING", type: "COMPLETED", color: "bg-blue-100 text-blue-800 border-blue-200" };
    if (handover) return { label: "HANDOVER PENDING", type: "PENDING", color: "bg-amber-100 text-amber-800 border-amber-200" };
    if (lot?.status === "accepted") return { label: "ACCEPTED", type: "PENDING", color: "bg-purple-100 text-purple-800 border-purple-200" };
    return { label: "LOT CREATED", type: "PENDING", color: "bg-slate-100 text-slate-800 border-slate-200" };
  };

  const filteredLots = lots.filter((lot) => {
    if (filter === "ALL") return true;
    const status = getDerivedStatus(lot.id);
    return status.type === filter;
  });

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
        <div>
          <h1 className="text-2xl font-bold">History</h1>
          <p className="text-sm text-muted-foreground">Your recycling activity</p>
        </div>
      </header>

      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
        {(["ALL", "PENDING", "COMPLETED", "PAID"] as const).map((f) => (
          <Badge
            key={f}
            variant={filter === f ? "default" : "outline"}
            className="cursor-pointer whitespace-nowrap px-4 py-2 text-sm"
            onClick={() => setFilter(f)}
          >
            {f === "ALL" ? "All Activity" : f === "PENDING" ? "Pending" : f === "COMPLETED" ? "Completed" : "Paid"}
          </Badge>
        ))}
      </div>

      <div className="space-y-4">
        {filteredLots.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl border-muted">
            <Inbox className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-lg">No recycling activity yet.</h3>
            <p className="text-muted-foreground text-sm mt-1">Start a new collection to see history.</p>
          </div>
        ) : (
          filteredLots.map((lot) => {
            const handover = handovers.find((h) => h.lot_id === lot.id);
            const payment = handover ? payments.find((p) => p.handover_id === handover.id) : null;
            const status = getDerivedStatus(lot.id);

            const displayWeight = handover?.verified_weight_kg || lot.payload.approx_weight_kg || "—";
            const displayAmount = payment?.amount || handover?.final_amount || lot.payload.estimated_value || "—";

            return (
              <Card
                key={lot.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors shadow-sm"
                onClick={() => navigate(`/collector/history/${lot.id}`)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{lot.payload.material_id || "Unknown Material"}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        {new Date(lot.created_at_local).toLocaleDateString()} • {displayWeight} kg
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="font-bold text-lg flex items-center">
                        ₹{displayAmount}
                      </span>
                      {lot.sync_status !== "synced" && (
                        <span className="text-[10px] uppercase font-bold text-amber-600 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" /> Pending Sync
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-muted">
                    <Badge variant="outline" className={`${status.color} font-semibold uppercase text-[10px]`}>
                      {status.label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
