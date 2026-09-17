import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import AppSyncWrapper from "./AppWrapper";

// Public Experience
import PublicLayout from "./layouts/PublicLayout";
import PublicHome from "./pages/public/Home";
import PublicScan from "./pages/public/Scan";
import PublicRates from "./pages/public/Rates";
import PublicAccess from "./pages/public/Access";

import CollectorLayout from "./layouts/CollectorLayout";
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
import { initSyncManager } from "./services/syncManager";

import RecyclerLayout from "./layouts/RecyclerLayout";
import RecyclerHome from "./pages/recycler/Home";
import IncomingLots from "./pages/recycler/IncomingLots";
import AvailableLots from "./pages/recycler/AvailableLots";
import MyLots from "./pages/recycler/MyLots";
import LotDetails from "./pages/recycler/LotDetails";
import VerifyLot from "./pages/recycler/VerifyLot";
import HandoverDetails from "./pages/recycler/HandoverDetails";
import Transactions from "./pages/recycler/Transactions";
import TransactionDetail from "./pages/recycler/TransactionDetail";

import AdminLayout from "./layouts/AdminLayout";
import AdminHome from "./pages/admin/Home";
import AdminPlaceholder from "./pages/admin/Placeholder";
import AdminAudit from "./pages/admin/Audit";
import AdminVerification from "./pages/admin/Verification";
import AdminAlerts from "./pages/admin/Alerts";
import AdminTransactions from "./pages/admin/Transactions";
import AdminTransactionDetail from "./pages/admin/TransactionDetail";

function App() {
  useEffect(() => {
    // Initialize the background sync manager orchestration
    initSyncManager();
  }, []);

  return (
    <AppSyncWrapper>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<PublicHome />} />
          <Route path="scan" element={<PublicScan />} />
          <Route path="rates" element={<PublicRates />} />
          <Route path="access" element={<PublicAccess />} />
        </Route>

        {/* Collector Routes */}
        <Route path="/collector" element={<CollectorLayout />}>
          <Route index element={<CollectorHome />} />
          <Route path="earnings" element={<Earnings />} />
          <Route path="sync" element={<SyncCenter />} />
          <Route path="history" element={<History />} />
        </Route>
        
        {/* Collector Standalone Routes (no bottom nav) */}
        <Route path="/collector/create-lot" element={<CreateLotWizard />} />
        <Route path="/collector/safety" element={<Safety />} />
        <Route path="/collector/price" element={<PriceBoard />} />
        <Route path="/collector/history/:lotId" element={<HistoryDetail />} />
        <Route path="/collector/scan" element={<ScanHandover />} />
        <Route path="/collector/handover/:id" element={<ConfirmHandover />} />

        {/* Recycler Routes — in layout (persistent header + bottom nav) */}
        <Route path="/recycler" element={<RecyclerLayout />}>
          <Route index element={<RecyclerHome />} />
          <Route path="lots" element={<IncomingLots />} />
          <Route path="transactions" element={<Transactions />} />
        </Route>

        {/* Recycler Standalone Routes (no bottom nav — focused task screens) */}
        <Route path="/recycler/lot/:id" element={<LotDetails />} />
        <Route path="/recycler/lot/:id/verify" element={<VerifyLot />} />
        <Route path="/recycler/handover/:id" element={<HandoverDetails />} />
        <Route path="/recycler/transactions/:id" element={<TransactionDetail />} />

        {/* Legacy compat routes (kept so old bookmarks/links still work) */}
        <Route path="/recycler/available" element={<AvailableLots />} />
        <Route path="/recycler/my-lots" element={<MyLots />} />
        <Route path="/recycler/sync" element={<SyncCenter />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="transactions/:id" element={<AdminTransactionDetail />} />
          <Route path="verification" element={<AdminVerification />} />
          <Route path="alerts" element={<AdminAlerts />} />
          <Route path="audit" element={<AdminAudit />} />
          <Route path="*" element={<AdminPlaceholder />} />
        </Route>
      </Routes>
    </AppSyncWrapper>
  );
}

export default App;
