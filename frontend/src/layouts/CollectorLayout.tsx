import { Outlet } from "react-router-dom";
import CollectorHeader from "@/components/CollectorHeader";
import CollectorBottomNav from "@/components/CollectorBottomNav";

export default function CollectorLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background relative max-w-[480px] mx-auto border-x border-warm-borders shadow-xl shadow-black/5 bg-[#F7F5EE]">
      <CollectorHeader />
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <CollectorBottomNav />
    </div>
  );
}
