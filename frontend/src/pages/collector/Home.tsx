import { Link, useNavigate } from "react-router-dom";
import {
  Camera,
  IndianRupee,
  ShieldAlert,
  FileText,
  RefreshCw,
  QrCode,
  History
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCreateLotStore } from "@/stores/createLotStore";
import { db } from "@/db/dexie";

import LanguageSelector from "@/components/LanguageSelector";
import AudioToggle from "@/components/AudioToggle";
import { useI18nStore } from "@/i18n";

export default function CollectorHome() {
  const navigate = useNavigate();
  const { t } = useI18nStore();

  return (
    <div className="flex flex-col min-h-screen p-4 pb-20 space-y-6">
      <header className="flex justify-between items-center py-4">
        <h1 className="text-2xl font-bold text-primary">{t("collector.home")}</h1>
        <div className="flex gap-2"><AudioToggle /><LanguageSelector /></div>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-4">{t("collector.home.start_handover")}</h2>
        <div className="grid grid-cols-2 gap-4">
          <Link
            to="/collector/create-lot"
            className="block w-full col-span-2"
            onClick={async () => {
              const draft_id = useCreateLotStore.getState().draft_id;
              if (draft_id) {
                const existingLot = await db.lots.get(draft_id);
                if (!existingLot) {
                  await db.photos.where("lot_id").equals(draft_id).delete();
                }
              }
              useCreateLotStore.getState().reset();
            }}
          >
            <Button
              size="lg"
              className="w-full h-24 text-lg bg-primary/10 text-primary hover:bg-primary/20 border-2 border-primary border-dashed flex flex-col items-center justify-center gap-2"
            >
              <Camera className="w-8 h-8" />
              <span>{t("collector.home.new_collection")}</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => navigate('/collector/history')}
          >
            <History className="w-6 h-6 text-muted-foreground" />
            <span>{t("collector.home.history")}</span>
          </Button>
          <Button
            variant="outline"
            className="w-full h-24 flex flex-col items-center justify-center gap-2 border-primary/20 hover:bg-primary/5"
            onClick={() => navigate('/collector/scan')}
          >
            <QrCode className="w-6 h-6 text-primary" />
            <span className="font-medium text-primary">{t("collector.home.scan_qr")}</span>
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <Link to="/collector/price" className="block w-full">
          <Card className="h-full hover:bg-muted/50 transition-colors">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center gap-2">
              <div className="p-3 bg-secondary rounded-full text-secondary-foreground">
                <IndianRupee className="w-6 h-6" />
              </div>
              <span className="font-medium">{t("collector.home.price_board")}</span>
            </CardContent>
          </Card>
        </Link>
        <Link to="/collector/earnings" className="block w-full">
          <Card className="h-full hover:bg-muted/50 transition-colors">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center gap-2">
              <div className="p-3 bg-secondary rounded-full text-secondary-foreground">
                <FileText className="w-6 h-6" />
              </div>
              <span className="font-medium">{t("collector.home.earnings")}</span>
            </CardContent>
          </Card>
        </Link>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <Link to="/collector/safety" className="block w-full">
          <Card className="border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-colors h-full">
            <CardContent className="flex flex-col items-center justify-center p-4 gap-2 text-center h-full">
              <ShieldAlert className="w-8 h-8 text-destructive" />
              <span className="font-medium text-destructive">{t("collector.home.safety")}</span>
            </CardContent>
          </Card>
        </Link>
        <Link to="/collector/sync" className="block w-full">
          <Card className="border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors h-full">
            <CardContent className="flex flex-col items-center justify-center p-4 gap-2 text-center h-full">
              <RefreshCw className="w-8 h-8 text-slate-600" />
              <span className="font-medium text-slate-700">{t("collector.home.sync_center")}</span>
            </CardContent>
          </Card>
        </Link>
      </section>

      <div className="mt-8 text-center">
        <Link to="/" className="text-sm text-muted-foreground hover:underline">
          {t("collector.home.switch_role")}
        </Link>
      </div>
    </div>
  );
}
