import { Outlet } from "react-router-dom";
import RecyclerHeader from "@/components/RecyclerHeader";
import RecyclerBottomNav from "@/components/RecyclerBottomNav";

export default function RecyclerLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background relative max-w-[480px] mx-auto border-x border-warm-borders shadow-xl shadow-black/5 bg-[#F7F5EE]">
      <RecyclerHeader />
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <RecyclerBottomNav />
    </div>
  );
}
