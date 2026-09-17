import { Link, useLocation } from "react-router-dom";
import { Home, History, FileText, RefreshCw, QrCode } from "lucide-react";
import { useTranslation } from "@/i18n";

export default function CollectorBottomNav() {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto h-[64px] bg-white border-t border-warm-borders flex items-center justify-between px-2 z-50 pb-safe">
      
      <Link
        to="/collector"
        className={`flex flex-col items-center justify-center w-16 h-full gap-1 active:scale-95 transition-transform relative ${
          pathname === "/collector" ? "text-primary" : "text-[#5F6D69] hover:text-charcoal"
        }`}
      >
        {pathname === "/collector" && <div className="absolute top-0 w-8 h-1 bg-primary rounded-b-full"></div>}
        <Home className={`w-5 h-5 ${pathname === "/collector" ? "fill-primary/10" : ""}`} />
        <span className={`text-[10px] ${pathname === "/collector" ? "font-extrabold" : "font-semibold"}`}>{t("collector.nav.home") || "Home"}</span>
      </Link>

      <Link
        to="/collector/history"
        className={`flex flex-col items-center justify-center w-16 h-full gap-1 active:scale-95 transition-transform relative ${
          pathname === "/collector/history" ? "text-primary" : "text-[#5F6D69] hover:text-charcoal"
        }`}
      >
        {pathname === "/collector/history" && <div className="absolute top-0 w-8 h-1 bg-primary rounded-b-full"></div>}
        <History className={`w-5 h-5 ${pathname === "/collector/history" ? "fill-primary/10" : ""}`} />
        <span className={`text-[10px] ${pathname === "/collector/history" ? "font-extrabold" : "font-semibold"}`}>{t("collector.nav.collections") || "Collections"}</span>
      </Link>

      <div className="relative w-16 h-full flex items-center justify-center">
        <Link
          to="/collector/scan"
          aria-label="Scan handover QR"
          className={`absolute -top-5 flex items-center justify-center w-14 h-14 rounded-full shadow-lg active:scale-95 transition-all border-4 border-white ${
            pathname === "/collector/scan" ? "bg-charcoal" : "bg-primary hover:bg-primary/90"
          }`}
        >
          <QrCode className="w-6 h-6 text-white" />
        </Link>
      </div>

      <Link
        to="/collector/earnings"
        className={`flex flex-col items-center justify-center w-16 h-full gap-1 active:scale-95 transition-transform relative ${
          pathname === "/collector/earnings" ? "text-primary" : "text-[#5F6D69] hover:text-charcoal"
        }`}
      >
        {pathname === "/collector/earnings" && <div className="absolute top-0 w-8 h-1 bg-primary rounded-b-full"></div>}
        <FileText className={`w-5 h-5 ${pathname === "/collector/earnings" ? "fill-primary/10" : ""}`} />
        <span className={`text-[10px] ${pathname === "/collector/earnings" ? "font-extrabold" : "font-semibold"}`}>{t("collector.nav.earnings") || "Earnings"}</span>
      </Link>

      <Link
        to="/collector/sync"
        className={`flex flex-col items-center justify-center w-16 h-full gap-1 active:scale-95 transition-transform relative ${
          pathname === "/collector/sync" ? "text-primary" : "text-[#5F6D69] hover:text-charcoal"
        }`}
      >
        {pathname === "/collector/sync" && <div className="absolute top-0 w-8 h-1 bg-primary rounded-b-full"></div>}
        <RefreshCw className={`w-5 h-5 ${pathname === "/collector/sync" ? "fill-primary/10" : ""}`} />
        <span className={`text-[10px] ${pathname === "/collector/sync" ? "font-extrabold" : "font-semibold"}`}>{t("collector.nav.sync") || "Sync"}</span>
      </Link>

    </nav>
  );
}
