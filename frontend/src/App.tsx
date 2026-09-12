import { Routes, Route, Link } from "react-router-dom";
import { useEffect } from "react";
import CollectorHome from "./pages/collector/Home";
import CreateLotWizard from "./pages/collector/CreateLot";
import Earnings from "./pages/collector/Earnings";
import Safety from "./pages/collector/Safety";
import PriceBoard from "./pages/collector/PriceBoard";
import SyncCenter from "./pages/collector/SyncCenter";
import ScanHandover from "./pages/collector/ScanHandover";
import ConfirmHandover from "./pages/collector/ConfirmHandover";
import History from "./pages/collector/History";
import HistoryDetail from "./pages/collector/HistoryDetail";
import SyncIndicator from "./components/SyncIndicator";
import { initSyncManager } from "./services/syncManager";

import RecyclerHome from "./pages/recycler/Home";
import AvailableLots from "./pages/recycler/AvailableLots";
import MyLots from "./pages/recycler/MyLots";
import LotDetails from "./pages/recycler/LotDetails";
import VerifyLot from "./pages/recycler/VerifyLot";
import HandoverDetails from "./pages/recycler/HandoverDetails";

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      <h1 className="text-3xl font-bold text-primary">SahiRate</h1>
      <p className="text-muted-foreground">Select your role to continue</p>

      <div className="flex flex-wrap justify-center gap-4 mt-8">
        <Link
          to="/collector"
          className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90"
        >
          Collector
        </Link>
        <Link
          to="/recycler"
          className="px-6 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium border hover:bg-secondary/80"
        >
          Recycler
        </Link>
        <Link
          to="/admin"
          className="px-6 py-3 rounded-lg bg-muted text-foreground font-medium border hover:bg-muted/80"
        >
          Admin
        </Link>
      </div>
    </div>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold">{title} View</h1>
      <Link to="/" className="mt-4 text-primary hover:underline">
        &larr; Back to Home
      </Link>
    </div>
  );
}

function App() {
  useEffect(() => {
    // Initialize the background sync manager orchestration
    initSyncManager();
  }, []);

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <SyncIndicator />
      </div>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Collector Routes */}
        <Route path="/collector" element={<CollectorHome />} />
        <Route path="/collector/create-lot" element={<CreateLotWizard />} />
        <Route path="/collector/earnings" element={<Earnings />} />
        <Route path="/collector/safety" element={<Safety />} />
        <Route path="/collector/price" element={<PriceBoard />} />
        <Route path="/collector/sync" element={<SyncCenter />} />
        <Route path="/collector/history" element={<History />} />
        <Route path="/collector/history/:lotId" element={<HistoryDetail />} />
        <Route path="/collector/scan" element={<ScanHandover />} />
        <Route path="/collector/handover/:id" element={<ConfirmHandover />} />

        {/* Recycler Routes */}
        <Route path="/recycler" element={<RecyclerHome />} />
        <Route path="/recycler/available" element={<AvailableLots />} />
        <Route path="/recycler/my-lots" element={<MyLots />} />
        <Route path="/recycler/lot/:id" element={<LotDetails />} />
        <Route path="/recycler/lot/:id/verify" element={<VerifyLot />} />
        <Route path="/recycler/handover/:id" element={<HandoverDetails />} />
        <Route path="/recycler/sync" element={<SyncCenter />} />

        {/* Admin Route */}
        <Route path="/admin/*" element={<Placeholder title="Admin" />} />
      </Routes>
    </>
  );
}

export default App;
