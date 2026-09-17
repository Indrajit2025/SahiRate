import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/i18n";
import { getAdminAuditEvents } from "@/services/admin/adminDemo";
import type { AdminAuditEvent, AdminAuditEventType } from "@/services/admin/adminDemo";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Search, FilterX, ShieldCheck, Box, User, ArrowRight, Activity, Lock, Info, CreditCard, ScanLine, Handshake, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function AdminAudit() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const allEvents = getAdminAuditEvents();

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<AdminAuditEventType | "all">("all");
  const [selectedEvent, setSelectedEvent] = useState<AdminAuditEvent | null>(null);

  const filteredEvents = useMemo(() => {
    let result = [...allEvents];

    if (typeFilter !== "all") {
      result = result.filter(e => e.type === typeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e =>
        e.transactionId.toLowerCase().includes(q) ||
        e.lotId.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q) ||
        (e.actorName && e.actorName.toLowerCase().includes(q))
      );
    }

    return result;
  }, [allEvents, typeFilter, searchQuery]);

  const clearFilters = () => {
    setTypeFilter("all");
    setSearchQuery("");
  };

  const getEventIcon = (type: AdminAuditEventType) => {
    switch (type) {
      case "lot_created": return <Box className="w-4 h-4 text-blue-600" />;
      case "lot_accepted": return <CheckCircle2 className="w-4 h-4 text-indigo-600" />;
      case "qr_generated": return <ScanLine className="w-4 h-4 text-purple-600" />;
      case "collector_confirmed": return <User className="w-4 h-4 text-orange-600" />;
      case "handover_completed": return <Handshake className="w-4 h-4 text-green-600" />;
      case "payment_recorded": return <CreditCard className="w-4 h-4 text-emerald-600" />;
    }
  };

  const getTypeLabel = (type: AdminAuditEventType) => {
    switch (type) {
      case "lot_created": return String(t("admin.audit.type_lot_created"));
      case "lot_accepted": return String(t("admin.audit.type_lot_accepted"));
      case "qr_generated": return String(t("admin.audit.type_qr_generated"));
      case "collector_confirmed": return String(t("admin.audit.type_collector_confirmed"));
      case "handover_completed": return String(t("admin.audit.type_handover_completed"));
      case "payment_recorded": return String(t("admin.audit.type_payment_recorded"));
    }
  };

  const getActorLabel = (actor: string) => {
    switch (actor) {
      case "collector": return String(t("admin.audit.actor_collector"));
      case "recycler": return String(t("admin.audit.actor_recycler"));
      case "system": return String(t("admin.audit.actor_system"));
      case "admin": return String(t("admin.audit.actor_admin"));
      default: return actor;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            {String(t("admin.audit.title"))}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{String(t("admin.audit.description"))}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2">
          <Info className="w-4 h-4" />
          {String(t("admin.dashboard.demo_notice"))}
        </div>
      </div>

      <Card className="p-4 bg-muted/30">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={String(t("admin.audit.search_placeholder"))}
              className="pl-9 h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="w-full md:w-[220px]">
            <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val as AdminAuditEventType | "all")}>
              <SelectTrigger aria-label={String(t("admin.audit.filter_event_type"))}>
                <SelectValue>
                  {typeFilter === "all" ? String(t("admin.audit.filter_event_type")) : getTypeLabel(typeFilter)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{String(t("admin.audit.filter_event_type"))}</SelectItem>
                <SelectItem value="lot_created">{String(t("admin.audit.type_lot_created"))}</SelectItem>
                <SelectItem value="lot_accepted">{String(t("admin.audit.type_lot_accepted"))}</SelectItem>
                <SelectItem value="qr_generated">{String(t("admin.audit.type_qr_generated"))}</SelectItem>
                <SelectItem value="collector_confirmed">{String(t("admin.audit.type_collector_confirmed"))}</SelectItem>
                <SelectItem value="handover_completed">{String(t("admin.audit.type_handover_completed"))}</SelectItem>
                <SelectItem value="payment_recorded">{String(t("admin.audit.type_payment_recorded"))}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(typeFilter !== "all" || searchQuery.trim() !== "") && (
            <Button variant="ghost" onClick={clearFilters} className="px-3">
              <FilterX className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">{String(t("admin.audit.clear_filters"))}</span>
            </Button>
          )}
        </div>
      </Card>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
          <Activity className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">{String(t("admin.audit.no_results"))}</p>
          <Button variant="link" onClick={clearFilters}>{String(t("admin.audit.clear_filters"))}</Button>
        </div>
      ) : (
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          {filteredEvents.map(event => (
            <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-background bg-muted shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10">
                {getEventIcon(event.type)}
              </div>
              <Card className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-muted-foreground/20" onClick={() => setSelectedEvent(event)}>
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="uppercase text-[10px] bg-background">
                      {getTypeLabel(event.type)}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">{new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <h3 className="font-semibold text-sm">{event.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 pt-2 border-t text-xs">
                    <span className="font-medium flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {getActorLabel(event.actorType)} {event.actorName && `(${event.actorName})`}
                    </span>
                    <span className="text-muted-foreground font-mono truncate max-w-[120px]">
                      {event.transactionId}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

            {/* Detail Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="max-w-xl w-[calc(100vw-2rem)] sm:w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Event Details
            </DialogTitle>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-6 mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground uppercase">{String(t("admin.audit.transaction_id"))}</p>
                  <p className="font-mono font-medium break-all">{selectedEvent.transactionId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">{String(t("admin.audit.lot_id"))}</p>
                  <p className="font-mono font-medium break-all">{selectedEvent.lotId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">{String(t("admin.audit.timestamp"))}</p>
                  <p className="font-medium">{new Date(selectedEvent.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase flex items-center gap-1"><User className="w-3 h-3"/> Actor</p>
                  <p className="font-medium">{getActorLabel(selectedEvent.actorType)} {selectedEvent.actorName && `(${selectedEvent.actorName})`}</p>
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-md border text-sm">
                <p className="font-semibold text-base mb-1.5">{selectedEvent.title}</p>
                <p className="text-muted-foreground leading-relaxed">{selectedEvent.description}</p>
              </div>

              <div className="border border-blue-100 bg-blue-50/50 rounded-lg overflow-hidden">
                <div className="bg-blue-100/50 px-4 py-3 flex items-center gap-2 border-b border-blue-100 text-blue-800 text-xs font-semibold uppercase">
                  <Lock className="w-4 h-4" />
                  {String(t("admin.audit.metadata_title"))}
                </div>
                <div className="p-4 space-y-4 text-xs">
                  <p className="text-blue-800/80 mb-2 italic flex items-start sm:items-center gap-2 leading-relaxed">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <span>{String(t("admin.audit.metadata_notice"))}</span>
                  </p>
                  <div>
                    <p className="text-muted-foreground uppercase mb-1.5 text-[10px] tracking-wider">{String(t("admin.audit.previous_hash"))}</p>
                    <p className="font-mono text-[10px] sm:text-xs bg-background p-2.5 rounded border break-all text-blue-900 leading-relaxed">{selectedEvent.previousHash || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground uppercase mb-1.5 text-[10px] tracking-wider">{String(t("admin.audit.event_hash"))}</p>
                    <p className="font-mono text-[10px] sm:text-xs bg-background p-2.5 rounded border break-all text-blue-900 leading-relaxed">{selectedEvent.eventHash || "N/A"}</p>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-2 pt-2">
                <Button variant="outline" className="w-full sm:w-auto" onClick={() => setSelectedEvent(null)}>
                  Close
                </Button>
                <Button className="w-full sm:w-auto" onClick={() => navigate(`/admin/transactions/${selectedEvent.transactionId}`)}>
                  {String(t("admin.audit.view_transaction"))} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
