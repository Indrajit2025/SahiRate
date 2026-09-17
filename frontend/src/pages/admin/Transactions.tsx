import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/i18n";
import { getAdminTransactions } from "@/services/admin/adminDemo";
import type { AdminLifecycleStatus, AdminPaymentStatus } from "@/services/admin/adminDemo";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Search, FilterX, Clock, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

export default function AdminTransactions() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const allTransactions = getAdminTransactions();

  const [searchTerm, setSearchTerm] = useState("");
  const [lifecycleFilter, setLifecycleFilter] = useState<AdminLifecycleStatus | "all">("all");
  const [paymentFilter, setPaymentFilter] = useState<AdminPaymentStatus | "all">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const filteredAndSorted = useMemo(() => {
    let result = [...allTransactions];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(tr =>
        tr.id.toLowerCase().includes(lower) ||
        tr.lotId.toLowerCase().includes(lower) ||
        tr.collectorName.toLowerCase().includes(lower) ||
        tr.recyclerName.toLowerCase().includes(lower) ||
        tr.material.toLowerCase().includes(lower)
      );
    }

    if (lifecycleFilter !== "all") {
      result = result.filter(tr => tr.lifecycleStatus === lifecycleFilter);
    }

    if (paymentFilter !== "all") {
      result = result.filter(tr => tr.paymentStatus === paymentFilter);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [allTransactions, searchTerm, lifecycleFilter, paymentFilter, sortOrder]);

  const clearFilters = () => {
    setSearchTerm("");
    setLifecycleFilter("all");
    setPaymentFilter("all");
    setSortOrder("newest");
  };

  const getLifecycleBadge = (status: AdminLifecycleStatus) => {
    switch (status) {
      case "created": return <Badge variant="outline" className="text-slate-600">Created</Badge>;
      case "accepted": return <Badge variant="outline" className="text-blue-600 border-blue-200">Accepted</Badge>;
      case "qr_generated": return <Badge variant="outline" className="text-purple-600 border-purple-200">QR Gen</Badge>;
      case "collector_confirmed": return <Badge variant="outline" className="text-orange-600 border-orange-200">Confirmed</Badge>;
      case "completed": return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">{String(t("admin.transactions.title"))}</h1>
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-1.5 rounded-full text-xs font-medium">
          {String(t("admin.dashboard.demo_notice"))}
        </div>
      </div>

      <Card className="p-4 bg-muted/30">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={String(t("admin.transactions.search_placeholder"))}
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label={String(t("common.search"))}
            />
          </div>

          <div className="w-full md:w-[180px]">
            <Select value={lifecycleFilter} onValueChange={(val) => setLifecycleFilter(val as AdminLifecycleStatus | "all")}>
              <SelectTrigger aria-label={String(t("admin.transactions.filter_lifecycle"))}>
                <SelectValue>
                  {lifecycleFilter === "all" ? String(t("admin.transactions.filter_lifecycle")) :
                    lifecycleFilter === "created" ? "Created" :
                    lifecycleFilter === "accepted" ? "Accepted" :
                    lifecycleFilter === "qr_generated" ? "QR Generated" :
                    lifecycleFilter === "collector_confirmed" ? "Collector Confirmed" : "Completed"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{String(t("admin.transactions.filter_lifecycle"))}</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="qr_generated">QR Generated</SelectItem>
                <SelectItem value="collector_confirmed">Collector Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-[180px]">
            <Select value={paymentFilter} onValueChange={(val) => setPaymentFilter(val as AdminPaymentStatus | "all")}>
              <SelectTrigger aria-label={String(t("admin.transactions.filter_payment"))}>
                <SelectValue>
                  {paymentFilter === "all" ? String(t("admin.transactions.filter_payment")) :
                   paymentFilter === "pending" ? "Pending" : "Completed"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{String(t("admin.transactions.filter_payment"))}</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-[180px]">
            <Select value={sortOrder} onValueChange={(val) => setSortOrder(val as "newest" | "oldest")}>
              <SelectTrigger aria-label="Sort Order">
                <SelectValue>
                  {sortOrder === "newest" ? String(t("admin.transactions.sort_newest")) : String(t("admin.transactions.sort_oldest"))}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{String(t("admin.transactions.sort_newest"))}</SelectItem>
                <SelectItem value="oldest">{String(t("admin.transactions.sort_oldest"))}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(searchTerm || lifecycleFilter !== "all" || paymentFilter !== "all") && (
            <Button variant="ghost" onClick={clearFilters} className="px-3" aria-label={String(t("admin.transactions.clear_filters"))}>
              <FilterX className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">{String(t("admin.transactions.clear_filters"))}</span>
            </Button>
          )}
        </div>
      </Card>

      {filteredAndSorted.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
          <AlertTriangle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{String(t("admin.transactions.no_results"))}</p>
          <Button variant="link" onClick={clearFilters}>{String(t("admin.transactions.clear_filters"))}</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="hidden md:grid grid-cols-7 gap-4 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase bg-muted/50 rounded-t-lg">
            <div className="col-span-1">ID</div>
            <div className="col-span-1">Date</div>
            <div className="col-span-2">Participants</div>
            <div className="col-span-1">Details</div>
            <div className="col-span-2">Status</div>
          </div>

          <div className="space-y-3">
            {filteredAndSorted.map((tr) => (
              <Card
                key={tr.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => navigate(`/admin/transactions/${tr.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/admin/transactions/${tr.id}`)}
              >
                <CardContent className="p-4">
                  {/* Desktop View */}
                  <div className="hidden md:grid grid-cols-7 gap-4 items-center">
                    <div className="col-span-1">
                      <div className="font-mono text-xs font-medium">{tr.id}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{tr.lotId}</div>
                    </div>
                    <div className="col-span-1 text-sm text-muted-foreground">
                      {new Date(tr.createdAt).toLocaleDateString()}
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm font-medium">{tr.collectorName}</div>
                      <div className="text-xs text-muted-foreground">{tr.recyclerName || "—"}</div>
                    </div>
                    <div className="col-span-1">
                      <div className="text-sm">{tr.material}</div>
                      <div className="text-xs font-medium text-muted-foreground">{tr.weightKg} kg</div>
                    </div>
                    <div className="col-span-2 flex items-center justify-between">
                      <div className="flex flex-col gap-1.5">
                        {getLifecycleBadge(tr.lifecycleStatus)}
                        {tr.paymentStatus === 'completed' ? (
                          <span className="text-[10px] font-bold text-green-600 flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" /> PAID ₹{tr.finalAmount || "—"}</span>
                        ) : (
                          <span className="text-[10px] font-bold text-orange-600 flex items-center"><Clock className="w-3 h-3 mr-1" /> PENDING</span>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-50" />
                    </div>
                  </div>

                  {/* Mobile View */}
                  <div className="md:hidden flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-mono text-sm font-medium">{tr.id}</div>
                        <div className="text-xs text-muted-foreground">{new Date(tr.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {getLifecycleBadge(tr.lifecycleStatus)}
                        {tr.paymentStatus === 'completed' ? (
                          <span className="text-xs font-bold text-green-600">PAID ₹{tr.finalAmount || "—"}</span>
                        ) : (
                          <span className="text-xs font-bold text-orange-600">PENDING</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm border-t pt-3 mt-1">
                      <div>
                        <div className="text-muted-foreground text-xs uppercase">Collector</div>
                        <div className="font-medium truncate">{tr.collectorName}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs uppercase">Recycler</div>
                        <div className="font-medium truncate">{tr.recyclerName || "—"}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs uppercase">Material</div>
                        <div className="font-medium truncate">{tr.material} ({tr.weightKg} kg)</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
