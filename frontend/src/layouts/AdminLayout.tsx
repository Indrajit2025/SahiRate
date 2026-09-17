import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "@/i18n";
import { LayoutDashboard, Receipt, ShieldCheck, AlertTriangle, FileText, Menu, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import LanguageSelector from "@/components/LanguageSelector";

export default function AdminLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: String(t("admin.layout.dashboard")), path: "/admin", icon: LayoutDashboard },
    { name: String(t("admin.layout.transactions")), path: "/admin/transactions", icon: Receipt },
    { name: String(t("admin.layout.verification")), path: "/admin/verification", icon: ShieldCheck },
    { name: String(t("admin.layout.alerts")), path: "/admin/alerts", icon: AlertTriangle },
    { name: String(t("admin.layout.audit")), path: "/admin/audit", icon: FileText },
  ];

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-background border-b sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle Menu">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
          <div className="flex items-baseline gap-1.5"><Logo className="text-lg" /><span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Admin</span></div>
        </div>
        <LanguageSelector />
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out flex flex-col
        md:relative md:translate-x-0
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="hidden md:flex items-center justify-between p-4 border-b">
          <div className="flex items-baseline gap-2"><Logo className="text-xl" /><span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Admin</span></div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${isActive ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t space-y-4">
          <div className="hidden md:block">
            <LanguageSelector />
          </div>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => { closeMenu(); navigate("/"); }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {String(t("admin.layout.back_to_roles"))}
          </Button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
