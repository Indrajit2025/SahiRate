import { Link } from "react-router-dom";
import { ChevronLeft, Inbox, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/dexie";
import { Badge } from "@/components/ui/badge";
import { DEMO_RECYCLER_ID } from "@/services/lots";

export default function MyLots() {
  const lots = useLiveQuery(() =>
    db.lots
      .filter(
        (l) => l.status === "accepted" && l.accepted_by === DEMO_RECYCLER_ID,
      )
      .reverse()
      .toArray(),
  );

  return (
    <div className="flex flex-col min-h-screen p-4 pb-20 space-y-6 animate-in fade-in slide-in-from-right-4">
      <header className="flex items-center py-4">
        <Link
          to="/recycler"
          className="mr-4 text-muted-foreground hover:text-foreground"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-bold">My Lots</h1>
      </header>

      {lots === undefined ? (
        <div className="flex items-center justify-center p-12 text-muted-foreground">
          Loading...
        </div>
      ) : lots.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground bg-slate-50 rounded-xl border border-dashed">
          <Inbox className="w-12 h-12 mb-4 opacity-20" />
          <p>You haven't accepted any lots yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {lots.map((lot) => (
            <Link
              key={lot.id}
              to={`/recycler/lot/${lot.id}`}
              className="block w-full"
            >
              <Card className="hover:bg-muted/50 transition-colors border-l-4 border-l-secondary shadow-sm">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">
                        {lot.payload.material_id || "Unknown Material"}
                      </h3>
                      <Badge
                        variant="outline"
                        className="text-xs bg-secondary/10 text-secondary border-secondary/20"
                      >
                        Accepted
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {lot.payload.approx_weight_kg
                        ? `${lot.payload.approx_weight_kg} kg`
                        : "Weight unknown"}
                    </p>
                    {lot.payload.estimated_value && (
                      <p className="text-sm font-medium mt-1">
                        ₹{lot.payload.estimated_value}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
