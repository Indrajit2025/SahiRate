import { useState, useMemo } from "react";
import { useTranslation } from "@/i18n";
import { getAdminVerifications, updateAdminVerification } from "@/services/admin/adminDemo";
import type { AdminVerification, VerificationStatus } from "@/services/admin/adminDemo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ShieldCheck, XCircle, Clock, MapPin, FileText, Phone, Building2, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function AdminVerification() {
  const { t } = useTranslation();
  const [refreshToggle, setRefreshToggle] = useState(0);

  const allVerifications = getAdminVerifications();
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | "all">("all");
  const [selectedRecord, setSelectedRecord] = useState<AdminVerification | null>(null);

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [actionRecordId, setActionRecordId] = useState<string | null>(null);

  const filteredRecords = useMemo(() => {
    let result = [...allVerifications];
    if (statusFilter !== "all") {
      result = result.filter(v => v.status === statusFilter);
    }
    result.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    return result;
  }, [allVerifications, statusFilter, refreshToggle]);

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case "pending": return <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200"><Clock className="w-3 h-3 mr-1"/> {String(t("admin.verification.status_pending"))}</Badge>;
      case "verified": return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><ShieldCheck className="w-3 h-3 mr-1"/> {String(t("admin.verification.status_verified"))}</Badge>;
      case "rejected": return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20"><XCircle className="w-3 h-3 mr-1"/> {String(t("admin.verification.status_rejected"))}</Badge>;
      case "suspended": return <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300"><AlertTriangle className="w-3 h-3 mr-1"/> {String(t("admin.verification.status_suspended"))}</Badge>;
    }
  };

  const handleAction = (id: string, newStatus: VerificationStatus) => {
    if (newStatus === "rejected") {
      setActionRecordId(id);
      setRejectDialogOpen(true);
      return;
    }
    if (newStatus === "suspended") {
      setActionRecordId(id);
      setSuspendDialogOpen(true);
      return;
    }
    executeAction(id, newStatus);
  };

  const executeAction = (id: string, newStatus: VerificationStatus) => {
    updateAdminVerification(id, { status: newStatus });
    setRefreshToggle(prev => prev + 1);
    setSelectedRecord(null);
    setRejectDialogOpen(false);
    setSuspendDialogOpen(false);
    setActionRecordId(null);
  };

  const activeRecordName = actionRecordId ? allVerifications.find(v => v.id === actionRecordId)?.name : "";

  // Detail View Mode
  if (selectedRecord) {
    const record = allVerifications.find(v => v.id === selectedRecord.id)!;
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedRecord(null)}>
            &larr; {String(t("admin.verification.back_to_list"))}
          </Button>
          <h1 className="text-2xl font-bold">{String(t("admin.verification.detail_title"))}</h1>
          <Badge variant="outline" className="ml-auto font-mono">{record.id}</Badge>
        </div>

        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">{String(t("admin.verification.demo_warning_title"))}</h4>
            <p className="text-sm">{String(t("admin.verification.demo_warning_desc"))}</p>
          </div>
        </div>

        <Card>
          <CardHeader className="bg-muted/30 pb-4 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                {record.name}
              </CardTitle>
              {getStatusBadge(record.status)}
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase">{String(t("admin.verification.entity_id"))}</p>
                <p className="font-mono font-medium">{record.entityId}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">{String(t("admin.verification.type"))}</p>
                <p className="font-medium capitalize">{record.type}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase flex items-center gap-1"><MapPin className="w-3 h-3"/> {String(t("admin.verification.location"))}</p>
                <p className="font-medium">{record.location || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase flex items-center gap-1"><Phone className="w-3 h-3"/> {String(t("admin.verification.contact"))}</p>
                <p className="font-medium">{record.phone || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase flex items-center gap-1"><Clock className="w-3 h-3"/> {String(t("admin.verification.submitted_at"))}</p>
                <p className="font-medium text-sm">{new Date(record.submittedAt).toLocaleString()}</p>
              </div>
              {record.reviewedAt && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> {String(t("admin.verification.reviewed_at"))}</p>
                  <p className="font-medium text-sm">{new Date(record.reviewedAt).toLocaleString()}</p>
                </div>
              )}
            </div>

            <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {record.documentLabel && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase flex items-center gap-1 mb-2"><FileText className="w-3 h-3"/> {String(t("admin.verification.document"))}</p>
                  <div className="p-3 border rounded-md bg-muted/20 flex items-center justify-between">
                    <span className="font-medium text-sm">{record.documentLabel}</span>
                    <span className="text-xs text-muted-foreground font-mono">{record.documentReference}</span>
                  </div>
                </div>
              )}
              {record.notes && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-2">{String(t("admin.verification.notes"))}</p>
                  <p className="text-sm bg-muted/20 p-3 rounded-md border text-muted-foreground">{record.notes}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            {record.status === "pending" ? (
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleAction(record.id, "verified")}>
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  {String(t("admin.verification.approve"))}
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => handleAction(record.id, "rejected")}>
                  <XCircle className="w-4 h-4 mr-2" />
                  {String(t("admin.verification.reject"))}
                </Button>
              </div>
            ) : record.status === "verified" ? (
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t justify-end">
                 <Button variant="outline" className="text-slate-600" onClick={() => handleAction(record.id, "suspended")}>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {String(t("admin.verification.suspend"))}
                </Button>
              </div>
            ) : (
              <div className="pt-6 border-t text-sm text-center text-muted-foreground italic">
                Record is currently {record.status}.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{String(t("admin.verification.reject"))}</DialogTitle>
              <DialogDescription>
                {String(t("admin.verification.confirm_reject"))} {activeRecordName && `(${activeRecordName})`}
                <br /><br />
                <strong className="text-orange-600">{String(t("admin.verification.demo_warning_desc"))}</strong>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                {String(t("admin.verification.cancel"))}
              </Button>
              <Button variant="destructive" onClick={() => actionRecordId && executeAction(actionRecordId, "rejected")}>
                {String(t("admin.verification.reject"))}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Suspend Dialog */}
        <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{String(t("admin.verification.suspend"))}</DialogTitle>
              <DialogDescription>
                {String(t("admin.verification.confirm_suspend"))} {activeRecordName && `(${activeRecordName})`}
                <br /><br />
                <strong className="text-orange-600">{String(t("admin.verification.demo_warning_desc"))}</strong>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setSuspendDialogOpen(false)}>
                {String(t("admin.verification.cancel"))}
              </Button>
              <Button variant="destructive" onClick={() => actionRecordId && executeAction(actionRecordId, "suspended")}>
                {String(t("admin.verification.suspend"))}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    );
  }

  // List View Mode
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">{String(t("admin.verification.title"))}</h1>
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-1.5 rounded-full text-xs font-medium">
          {String(t("admin.dashboard.demo_notice"))}
        </div>
      </div>

      <Card className="p-4 bg-muted/30">
        <div className="w-full md:w-[220px]">
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as VerificationStatus | "all")}>
            <SelectTrigger aria-label={String(t("admin.verification.filter_status"))}>
              <SelectValue>
                {statusFilter === "all" ? String(t("admin.verification.filter_status")) :
                  statusFilter === "pending" ? String(t("admin.verification.status_pending")) :
                  statusFilter === "verified" ? String(t("admin.verification.status_verified")) :
                  statusFilter === "rejected" ? String(t("admin.verification.status_rejected")) : String(t("admin.verification.status_suspended"))}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{String(t("admin.verification.filter_status"))}</SelectItem>
              <SelectItem value="pending">{String(t("admin.verification.status_pending"))}</SelectItem>
              <SelectItem value="verified">{String(t("admin.verification.status_verified"))}</SelectItem>
              <SelectItem value="rejected">{String(t("admin.verification.status_rejected"))}</SelectItem>
              <SelectItem value="suspended">{String(t("admin.verification.status_suspended"))}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {filteredRecords.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
          <ShieldCheck className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">{String(t("admin.verification.no_results"))}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecords.map(record => (
            <Card key={record.id} className="flex flex-col hover:border-primary/50 transition-colors">
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  {getStatusBadge(record.status)}
                  <span className="text-xs text-muted-foreground font-mono">{record.id}</span>
                </div>

                <h3 className="font-bold text-lg mb-1">{record.name}</h3>
                <p className="text-sm text-muted-foreground font-mono mb-4">{record.entityId}</p>

                <div className="space-y-2 text-sm mt-auto">
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="truncate">{record.location || "-"}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{new Date(record.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <Button
                  className="w-full mt-6"
                  variant={record.status === 'pending' ? 'default' : 'outline'}
                  onClick={() => setSelectedRecord(record)}
                >
                  Review Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
