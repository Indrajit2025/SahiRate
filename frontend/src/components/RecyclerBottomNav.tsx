import { Link, useLocation } from "react-router-dom";
import { Home, PackageOpen, FileText } from "lucide-react";
import { useTranslation } from "@/i18n";

export default function RecyclerBottomNav() {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const tabs = [
    {
      to: "/recycler",
      label: t("recycler.nav.home"),
      icon: Home,
      exact: true,
    },
    {
      to: "/recycler/lots",
      label: t("recycler.nav.incoming"),
      icon: PackageOpen,
      exact: false,
    },
    {
      to: "/recycler/transactions",
      label: t("recycler.nav.transactions"),
      icon: FileText,
      exact: false,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto h-[64px] bg-white border-t border-warm-borders flex items-center justify-around px-2 z-50 pb-safe">
      {tabs.map(({ to, label, icon: Icon, exact }) => {
        const isActive = exact ? pathname === to : pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 active:scale-95 transition-transform relative ${
              isActive
                ? "text-primary"
                : "text-[#5F6D69] hover:text-charcoal"
            }`}
          >
            {isActive && (
              <div className="absolute top-0 w-8 h-1 bg-primary rounded-b-full" />
            )}
            <Icon
              className={`w-5 h-5 ${isActive ? "fill-primary/10" : ""}`}
            />
            <span
              className={`text-[10px] ${
                isActive ? "font-extrabold" : "font-semibold"
              }`}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
