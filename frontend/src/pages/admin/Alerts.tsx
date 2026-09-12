import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useI18nStore } from "@/i18n";
import { getAdminAlerts, updateAdminAlert } from "@/services/admin/adminDemo";
import type { AdminAlertStatus, AdminAlertSeverity } from "@/services/admin/adminDemo";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { AlertTriangle, AlertCircle, Info, FilterX, ArrowRight, CheckCircle2 } from "lucide-react";

export default function AdminAlerts() {
  const { t } = useI18nStore();
  const navigate = useNavigate();
  // Force re-render on demo update
  const [refreshToggle, setRefreshToggle] = useState(0);

  const allAlerts = getAdminAlerts();

  const [statusFilter, setStatusFilter] = useState<AdminAlertStatus | "all">("open");
  const [severityFilter, setSeverityFilter] = useState<AdminAlertSeverity | "all">("all");

  const filteredAlerts = useMemo(() => {
    let result = [...allAlerts];

    if (statusFilter !== "all") {
      result = result.filter(a => a.status === statusFilter);
    }
    if (severityFilter !== "all") {
      result = result.filter(a => a.severity === severityFilter);
    }

    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return result;
  }, [allAlerts, statusFilter, severityFilter, refreshToggle]);

  const clearFilters = () => {
    setStatusFilter("all");
    setSeverityFilter("all");
  };

  const handleResolveToggle = (alertId: string, currentStatus: AdminAlertStatus) => {
    updateAdminAlert(alertId, { status: currentStatus === "open" ? "resolved" : "open" });
    setRefreshToggle(prev => prev + 1);
  };

  const getSeverityBadge = (severity: AdminAlertSeverity) => {
    switch (severity) {
      case "high": return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20"><AlertTriangle className="w-3 h-3 mr-1"/> {String(t("admin.alerts.severity_high"))}</Badge>;
      case "medium": return <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200"><AlertCircle className="w-3 h-3 mr-1"/> {String(t("admin.alerts.severity_medium"))}</Badge>;
      case "low": return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200"><Info className="w-3 h-3 mr-1"/> {String(t("admin.alerts.severity_low"))}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "anomaly": return String(t("admin.alerts.type_anomaly"));
      case "verification": return String(t("admin.alerts.type_verification"));
      case "sync": return String(t("admin.alerts.type_sync"));
      case "system": return String(t("admin.alerts.type_system"));
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">{String(t("admin.alerts.title"))}</h1>
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-1.5 rounded-full text-xs font-medium">
          {String(t("admin.dashboard.demo_notice"))}
        </div>
      </div>

      <Card className="p-4 bg-muted/30">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-[180px]">
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as AdminAlertStatus | "all")}>
              <SelectTrigger aria-label={String(t("admin.alerts.filter_status"))}>
                <SelectValue>
                  {statusFilter === "all" ? String(t("admin.alerts.filter_status")) :
                    statusFilter === "open" ? String(t("admin.alerts.status_open")) : String(t("admin.alerts.status_resolved"))}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{String(t("admin.alerts.filter_status"))}</SelectItem>
                <SelectItem value="open">{String(t("admin.alerts.status_open"))}</SelectItem>
                <SelectItem value="resolved">{String(t("admin.alerts.status_resolved"))}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-[180px]">
            <Select value={severityFilter} onValueChange={(val) => setSeverityFilter(val as AdminAlertSeverity | "all")}>
              <SelectTrigger aria-label={String(t("admin.alerts.filter_severity"))}>
                <SelectValue>
                  {severityFilter === "all" ? String(t("admin.alerts.filter_severity")) :
                    severityFilter === "high" ? String(t("admin.alerts.severity_high")) :
                    severityFilter === "medium" ? String(t("admin.alerts.severity_medium")) : String(t("admin.alerts.severity_low"))}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{String(t("admin.alerts.filter_severity"))}</SelectItem>
                <SelectItem value="high">{String(t("admin.alerts.severity_high"))}</SelectItem>
                <SelectItem value="medium">{String(t("admin.alerts.severity_medium"))}</SelectItem>
                <SelectItem value="low">{String(t("admin.alerts.severity_low"))}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(statusFilter !== "all" || severityFilter !== "all") && (
            <Button variant="ghost" onClick={clearFilters} className="px-3">
              <FilterX className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">{String(t("admin.transactions.clear_filters"))}</span>
            </Button>
          )}
        </div>
      </Card>

      {filteredAlerts.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
          <CheckCircle2 className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">{String(t("admin.alerts.no_results"))}</p>
          <Button variant="link" onClick={clearFilters}>{String(t("admin.transactions.clear_filters"))}</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map(alert => (
            <Card key={alert.id} className={`overflow-hidden transition-colors ${alert.status === 'resolved' ? 'opacity-70 bg-muted/30' : 'bg-card'}`}>
              <div className={`h-1.5 w-full ${
                alert.severity === 'high' ? 'bg-destructive' :
                alert.severity === 'medium' ? 'bg-orange-500' : 'bg-blue-500'
              }`} />
              <CardContent className="p-4 md:p-5">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 mb-2">
                      {getSeverityBadge(alert.severity)}
                      <Badge variant="outline" className="uppercase text-[10px]">{getTypeLabel(alert.type)}</Badge>
                      <span className="text-xs text-muted-foreground ml-auto md:ml-2">
                        {new Date(alert.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-base">{alert.title}</h3>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>

                    {(alert.relatedTransactionId || alert.relatedEntityId) && (
                      <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-border/50">
                        {alert.relatedTransactionId && (
                          <Button variant="link" className="h-auto p-0 text-xs" onClick={() => navigate(`/admin/transactions/${alert.relatedTransactionId}`)}>
                            {String(t("admin.alerts.related_transaction"))}: {alert.relatedTransactionId} <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        )}
                        {alert.relatedEntityId && (
                          <Button variant="link" className="h-auto p-0 text-xs" onClick={() => navigate(`/admin/verification/${alert.relatedEntityId}`)}>
                            {String(t("admin.alerts.related_entity"))}: {alert.relatedEntityId} <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row md:flex-col items-center justify-between w-full md:w-auto gap-3 border-t md:border-t-0 pt-3 md:pt-0">
                    <div className="text-xs font-mono text-muted-foreground">{alert.id}</div>
                    <Button
                      variant={alert.status === 'open' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleResolveToggle(alert.id, alert.status)}
                      className="w-full md:w-28"
                    >
                      {alert.status === 'open' ? (
                        <><CheckCircle2 className="w-4 h-4 mr-2" /> {String(t("admin.alerts.resolve"))}</>
                      ) : (
                        <>{String(t("admin.alerts.reopen"))}</>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
