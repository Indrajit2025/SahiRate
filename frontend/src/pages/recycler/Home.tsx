import { Link } from "react-router-dom";
import { Package, Inbox, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/dexie";
import { DEMO_RECYCLER_ID } from "@/services/lots";

export default function RecyclerHome() {
  const availableCount = useLiveQuery(() =>
    db.lots.filter((l) => (l.status || "available") === "available" && l.sync_status === "synced").count(),
  );

  const myLotsCount = useLiveQuery(() =>
    db.lots
      .filter(
        (l) => l.status === "accepted" && l.accepted_by === DEMO_RECYCLER_ID,
      )
      .count(),
  );

  return (
    <div className="flex flex-col min-h-screen p-4 pb-20 space-y-6 animate-in fade-in">
      <header className="flex justify-between items-center py-4">
        <h1 className="text-2xl font-bold text-secondary">SahiRate Recycler</h1>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
        <div className="grid grid-cols-2 gap-4">
          <Link to="/recycler/available" className="block w-full">
            <Card className="w-full h-32 flex flex-col items-center justify-center gap-2 relative hover:bg-muted/50 transition-colors cursor-pointer">
              <Package className="w-8 h-8 text-primary" />
              <span className="font-semibold whitespace-normal text-center">
                Available Lots
              </span>
              {availableCount !== undefined && availableCount > 0 && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                  {availableCount}
                </div>
              )}
            </Card>
          </Link>

          <Link to="/recycler/my-lots" className="block w-full">
            <Card className="w-full h-32 flex flex-col items-center justify-center gap-2 relative hover:bg-muted/50 transition-colors cursor-pointer">
              <Inbox className="w-8 h-8 text-secondary" />
              <span className="font-semibold whitespace-normal text-center">
                My Lots
              </span>
              {myLotsCount !== undefined && myLotsCount > 0 && (
                <div className="absolute top-2 right-2 bg-secondary text-secondary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                  {myLotsCount}
                </div>
              )}
            </Card>
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <Link to="/recycler/sync" className="block w-full col-span-2">
          <Card className="border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors h-full">
            <CardContent className="flex flex-row items-center justify-center p-4 gap-4 h-full">
              <RefreshCw className="w-8 h-8 text-slate-600" />
              <span className="font-medium text-slate-700 text-lg">
                Sync Center
              </span>
            </CardContent>
          </Card>
        </Link>
      </section>

      <div className="mt-8 text-center">
        <Link to="/" className="text-sm text-muted-foreground hover:underline">
          Switch Role
        </Link>
      </div>
    </div>
  );
}
