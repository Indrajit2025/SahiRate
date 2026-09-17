import { Outlet, Link, useLocation } from "react-router-dom";
import LanguageSelector from "@/components/LanguageSelector";
import { useTranslation } from "@/i18n";
import Logo from "@/components/Logo";
import { ScanLine } from "lucide-react";

export default function PublicLayout() {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground pb-20">
      {/* Global Header */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-warm-borders safe-top">
        <div className="flex items-center justify-between px-4 h-16 max-w-5xl mx-auto pt-safe">
          <Link to="/" className="flex items-center outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
            <Logo className="text-2xl" />
          </Link>
          <LanguageSelector />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md mx-auto w-full flex flex-col relative">
        <Outlet />
      </main>

      {/* Fixed Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-warm-borders pb-safe z-40">
        <div className="max-w-md mx-auto px-4 h-[68px] flex items-center justify-around">
          <Link 
            to="/rates" 
            className={`flex flex-col items-center justify-center w-20 h-full transition-colors ${location.pathname === '/rates' ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-charcoal'}`}
          >
            <span className="text-[13px] tracking-wide mt-1">{t("public.nav.rates")}</span>
          </Link>

          <Link 
            to="/scan" 
            className={`flex items-center justify-center w-16 h-16 rounded-full -mt-7 shadow-lg border-[3px] border-surface transition-transform active:scale-[0.96] ${location.pathname === '/scan' ? 'bg-primary text-white shadow-primary/40' : 'bg-charcoal text-white shadow-charcoal/30'}`}
            aria-label={t("public.nav.scan")}
          >
            <ScanLine className="w-7 h-7" />
          </Link>

          <Link 
            to="/access" 
            className={`flex flex-col items-center justify-center w-20 h-full transition-colors ${location.pathname === '/access' ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-charcoal'}`}
          >
            <span className="text-[13px] tracking-wide mt-1">{t("public.nav.access")}</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
