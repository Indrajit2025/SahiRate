import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, CameraOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/dexie";
import { acceptLocalLot, DEMO_RECYCLER_ID } from "@/services/lots";

export default function LotDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const lot = useLiveQuery(() => (id ? db.lots.get(id) : undefined), [id]);
  const photo = useLiveQuery(
    () => (id ? db.photos.where("lot_id").equals(id).first() : undefined),
    [id],
  );
  const handover = useLiveQuery(
    () => (id ? db.handovers.where("lot_id").equals(id).first() : undefined),
    [id]
  );

  if (lot === undefined) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading lot...
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="p-8 text-center flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4">Lot not found</h2>
        <Button onClick={() => navigate("/recycler/available")}>
          Return to Available Lots
        </Button>
      </div>
    );
  }

  const isAvailable = (lot.status || "available") === "available";
  const isAcceptedByMe =
    lot.status === "accepted" && lot.accepted_by === DEMO_RECYCLER_ID;

  const handleAccept = async () => {
    if (!id) return;
    try {
      await acceptLocalLot(id);
      navigate("/recycler/my-lots");
    } catch (err) {
      console.error(err);
      alert("Failed to accept lot");
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
        <h1 className="text-2xl font-bold">Lot Details</h1>
      </header>

      <Card className="overflow-hidden border-0 shadow-md">
        {photo ? (
          <img
            src={photo.data_uri}
            alt="Scrap material"
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-slate-100 flex flex-col items-center justify-center text-slate-400">
            <CameraOff className="w-12 h-12 mb-2" />
            <span>No photo provided</span>
          </div>
        )}
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold">
                {lot.payload.material_id || "Unknown Material"}
              </h2>
              <p className="text-muted-foreground mt-1">
                {new Date(lot.created_at_local).toLocaleString()}
              </p>
            </div>
            {isAvailable ? (
              <Badge className="bg-primary text-primary-foreground text-sm py-1">
                Available
              </Badge>
            ) : isAcceptedByMe ? (
              <Badge className="bg-secondary text-secondary-foreground text-sm py-1">
                Accepted
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-sm py-1 text-muted-foreground"
              >
                Unavailable
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 my-6">
            <div className="bg-slate-50 p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground mb-1">Weight</p>
              <p className="text-xl font-semibold">
                {lot.payload.approx_weight_kg
                  ? `${lot.payload.approx_weight_kg} kg`
                  : "--"}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground mb-1">Est. Value</p>
              <p className="text-xl font-semibold text-green-700">
                {lot.payload.estimated_value
                  ? `₹${lot.payload.estimated_value}`
                  : "--"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Footer */}
      {isAvailable && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
          <Button
            className="w-full h-14 text-lg font-bold"
            onClick={handleAccept}
          >
            Accept Lot
          </Button>
        </div>
      )}

      {isAcceptedByMe && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
          {handover ? (
            <Button
              className="w-full h-14 text-lg font-bold bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              onClick={() => navigate(`/recycler/handover/${handover.id}`)}
            >
              View Handover
            </Button>
          ) : (
            <Button
              className="w-full h-14 text-lg font-bold bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              onClick={() => navigate(`/recycler/lot/${id}/verify`)}
            >
              Start Handover
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
