import { useI18nStore } from "@/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminSummary, getRecentActivity } from "@/services/admin/adminDemo";
import { Activity, AlertTriangle, CheckCircle, Clock, Info } from "lucide-react";

export default function AdminHome() {
  const { t } = useI18nStore();
  const summary = getAdminSummary();
  const activities = getRecentActivity();

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg flex items-start gap-3">
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p className="text-sm font-medium">{String(t("admin.dashboard.demo_notice"))}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{String(t("admin.dashboard.total_transactions"))}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalTransactions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{String(t("admin.dashboard.pending_verification"))}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.pendingVerification}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{String(t("admin.dashboard.active_lots"))}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.activeLots}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{String(t("admin.dashboard.open_alerts"))}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{summary.openAlerts}</div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold mt-8 mb-4">{String(t("admin.dashboard.recent_activity"))}</h2>
      <div className="space-y-3">
        {activities.map((activity) => (
          <Card key={activity.id}>
            <CardContent className="p-4 flex items-start gap-4">
              <div className="mt-1">
                {activity.type === 'lot_accepted' && <CheckCircle className="w-5 h-5 text-green-500" />}
                {activity.type === 'verification_pending' && <Clock className="w-5 h-5 text-orange-500" />}
                {activity.type === 'payment_completed' && <Activity className="w-5 h-5 text-blue-500" />}
                {activity.type === 'anomaly_detected' && <AlertTriangle className="w-5 h-5 text-destructive" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold">{activity.title}</h3>
                  <span className="text-xs text-muted-foreground">
                    {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
