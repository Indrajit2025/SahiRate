import { useLocation } from "react-router-dom";
import SyncIndicator from "./components/SyncIndicator";

export default function AppSyncWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isPublic = ['/', '/scan', '/rates', '/access'].includes(location.pathname);
  
  return (
    <>
      {!location.pathname.startsWith('/collector') && (
        <div className={`fixed z-[60] pointer-events-none ${isPublic ? 'bottom-[76px] left-4' : 'bottom-6 right-4'}`}>
          <div className="pointer-events-auto">
            <SyncIndicator />
          </div>
        </div>
      )}
      {children}
    </>
  );
}
