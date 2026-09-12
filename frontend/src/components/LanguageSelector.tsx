import { useI18nStore } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export default function LanguageSelector() {
  const { language, setLanguage } = useI18nStore();

  const handleToggle = () => {
    if (language === "en") setLanguage("hi");
    else if (language === "hi") setLanguage("mr");
    else setLanguage("en");
  };

  const getLabel = () => {
    switch (language) {
      case "hi": return "हिन्दी";
      case "mr": return "मराठी";
      default: return "English";
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-2 rounded-full px-4 h-10 border-slate-300"
      onClick={handleToggle}
      aria-label="Toggle language"
    >
      <Globe className="w-4 h-4 text-muted-foreground" />
      <span className="font-medium">{getLabel()}</span>
    </Button>
  );
}
