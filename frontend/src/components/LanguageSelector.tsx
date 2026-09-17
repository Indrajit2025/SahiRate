import { useI18nStore } from "@/i18n";
import type { Language } from "@/i18n";
import { Globe } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";

export default function LanguageSelector() {
  const { language, setLanguage } = useI18nStore();

  const getLabel = (lang: string) => {
    switch (lang) {
      case "en": return "EN";
      case "hi": return "HI";
      case "mr": return "MR";
      case "or": return "ଓଡ଼ିଆ";
      case "bn": return "BN";
      default: return "EN";
    }
  };

  return (
    <div className="relative z-50">
      <Select value={language} onValueChange={(val) => setLanguage(val as Language)}>
        <SelectTrigger className="flex items-center gap-1.5 rounded-full px-4 h-11 border-warm-borders bg-white shadow-sm w-auto hover:bg-surface transition-colors text-charcoal outline-none focus-visible:ring-2 focus-visible:ring-primary font-bold">
          <Globe className="w-4 h-4 text-primary" />
          <span className="text-[13px] tracking-wide mt-[1px]">{getLabel(language)}</span>
        </SelectTrigger>
        <SelectContent className="min-w-[150px] absolute right-0 mt-2 bg-white border border-warm-borders shadow-lg rounded-xl overflow-hidden p-1 z-50">
          <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-surface rounded-md mb-1">
            Choose language
          </div>
          <SelectItem value="en" className="font-semibold text-[15px] py-2.5 px-3 rounded-lg focus:bg-primary/10 focus:text-primary cursor-pointer transition-colors">English</SelectItem>
          <SelectItem value="hi" className="font-semibold text-[15px] py-2.5 px-3 rounded-lg focus:bg-primary/10 focus:text-primary cursor-pointer transition-colors">हिन्दी</SelectItem>
          <SelectItem value="or" className="font-semibold text-[15px] py-2.5 px-3 rounded-lg focus:bg-primary/10 focus:text-primary cursor-pointer transition-colors">ଓଡ଼ିଆ</SelectItem>
          <SelectItem value="mr" className="font-semibold text-[15px] py-2.5 px-3 rounded-lg focus:bg-primary/10 focus:text-primary cursor-pointer transition-colors">मराठी</SelectItem>
          <SelectItem value="bn" className="font-semibold text-[15px] py-2.5 px-3 rounded-lg focus:bg-primary/10 focus:text-primary cursor-pointer transition-colors">বাংলা</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
