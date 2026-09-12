import { useLocation } from "react-router-dom";
import { AlertCircle } from "lucide-react";

export default function Placeholder() {
  const location = useLocation();
  const pathName = location.pathname.split('/').pop();
  const title = pathName ? pathName.charAt(0).toUpperCase() + pathName.slice(1) : "Section";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
      <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground max-w-md">
        This section will be implemented in a later Admin milestone.
      </p>
    </div>
  );
}
