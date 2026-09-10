import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLocalLots } from "@/services/lots";
import type { Lot } from "@/types";

export default function Earnings() {
  const navigate = useNavigate();
  const [lots, setLots] = useState<Lot[]>([]);

  useEffect(() => {
    getLocalLots().then(setLots);
  }, []);

  const totalEarnings = lots
    .filter(l => l.sync_status === 'synced')
    .reduce((sum, l) => sum + (l.payload.estimated_value || 0), 0);

  const pendingEarnings = lots
    .filter(l => l.sync_status !== 'synced')
    .reduce((sum, l) => sum + (l.payload.estimated_value || 0), 0);

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen pb-20">
      <header className="flex items-center py-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <span className="text-lg font-medium">My Earnings</span>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground font-medium mb-1">Total Earned</p>
            <p className="text-2xl font-bold text-primary">₹{totalEarnings}</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/20 border-secondary/30">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground font-medium mb-1">Pending (Offline)</p>
            <p className="text-2xl font-bold text-secondary-foreground">₹{pendingEarnings}</p>
          </CardContent>
        </Card>
      </div>

      <h3 className="font-semibold text-lg mb-4">Transaction History</h3>
      <div className="space-y-3">
        {lots.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No collections yet.</p>
        )}
        {lots.map(lot => (
          <Card key={lot.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">{lot.payload.material_id}</p>
                <p className="text-sm text-muted-foreground">{lot.payload.approx_weight_kg} kg • {new Date(lot.created_at_local).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">₹{lot.payload.estimated_value}</p>
                {lot.sync_status === 'synced' ? (
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 mt-1"><CheckCircle2 className="w-3 h-3 mr-1"/> Paid</Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 mt-1"><Clock className="w-3 h-3 mr-1"/> Offline</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
