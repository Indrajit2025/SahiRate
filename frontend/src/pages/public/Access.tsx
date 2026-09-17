import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { User, Factory, ShieldCheck, ChevronRight, ArrowLeft } from "lucide-react";

export default function Access() {
  const { t } = useTranslation();

  const roles = [
    {
      id: "collector",
      title: t("public.access.collector"),
      description: t("public.access.collector_desc"),
      icon: User,
      link: "/collector",
      color: "text-primary",
      bg: "bg-primary/10",
      borderHover: "hover:border-primary"
    },
    {
      id: "recycler",
      title: t("public.access.recycler"),
      description: t("public.access.recycler_desc"),
      icon: Factory,
      link: "/recycler",
      color: "text-copper",
      bg: "bg-copper/10",
      borderHover: "hover:border-copper"
    },
    {
      id: "admin",
      title: t("public.access.admin"),
      description: t("public.access.admin_desc"),
      icon: ShieldCheck,
      link: "/admin",
      color: "text-amber-700",
      bg: "bg-amber-100",
      borderHover: "hover:border-amber-500"
    }
  ];

  return (
    <div className="flex-1 flex flex-col px-4 py-6 space-y-6">
      
      <div className="flex items-center mb-2">
        <Link to="/" className="flex items-center gap-2 text-charcoal hover:text-primary transition-colors active:scale-95 -ml-2 p-2 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold text-[15px]">Access SahiRate</span>
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-charcoal">
          {t("public.access.title")}
        </h1>
        <div className="bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ml-4">
          {t("public.access.demo_access")}
        </div>
      </div>

      <div className="space-y-4 pt-2">
        {roles.map((role) => (
          <Link key={role.id} to={role.link} className="block active:scale-[0.98] transition-transform">
            <Card className={`border-warm-borders ${role.borderHover} transition-colors bg-white shadow-sm hover:shadow-md rounded-2xl overflow-hidden`}>
              <CardContent className="p-0">
                <div className="flex items-center p-5 gap-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${role.bg}`}>
                    <role.icon className={`w-7 h-7 ${role.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-1">{role.title}</h3>
                    <p className="text-base font-bold text-charcoal leading-snug">{role.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-warm-borders-dark shrink-0" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
