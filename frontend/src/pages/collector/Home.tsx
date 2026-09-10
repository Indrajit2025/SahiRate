import { Link } from "react-router-dom";
import { Camera, IndianRupee, ShieldAlert, FileText, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CollectorHome() {
  return (
    <div className="flex flex-col min-h-screen p-4 pb-20 space-y-6">
      <header className="flex justify-between items-center py-4">
        <h1 className="text-2xl font-bold text-primary">SahiRate</h1>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-4">Start a Handover</h2>
        <Link to="/collector/create-lot" className="block w-full">
          <Button size="lg" className="w-full h-24 text-lg bg-primary/10 text-primary hover:bg-primary/20 border-2 border-primary border-dashed flex flex-col items-center justify-center gap-2">
            <Camera className="w-8 h-8" />
            <span>New Collection</span>
          </Button>
        </Link>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <Link to="/collector/price" className="block w-full">
          <Card className="h-full hover:bg-muted/50 transition-colors">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center gap-2">
              <div className="p-3 bg-secondary rounded-full text-secondary-foreground">
                <IndianRupee className="w-6 h-6" />
              </div>
              <span className="font-medium">Price Board</span>
            </CardContent>
          </Card>
        </Link>
        <Link to="/collector/earnings" className="block w-full">
          <Card className="h-full hover:bg-muted/50 transition-colors">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center gap-2">
              <div className="p-3 bg-secondary rounded-full text-secondary-foreground">
                <FileText className="w-6 h-6" />
              </div>
              <span className="font-medium">My Earnings</span>
            </CardContent>
          </Card>
        </Link>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <Link to="/collector/safety" className="block w-full">
          <Card className="border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-colors h-full">
            <CardContent className="flex flex-col items-center justify-center p-4 gap-2 text-center h-full">
              <ShieldAlert className="w-8 h-8 text-destructive" />
              <span className="font-medium text-destructive">Safety</span>
            </CardContent>
          </Card>
        </Link>
        <Link to="/collector/sync" className="block w-full">
          <Card className="border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors h-full">
            <CardContent className="flex flex-col items-center justify-center p-4 gap-2 text-center h-full">
              <RefreshCw className="w-8 h-8 text-slate-600" />
              <span className="font-medium text-slate-700">Sync Center</span>
            </CardContent>
          </Card>
        </Link>
      </section>
    </div>
  );
}
