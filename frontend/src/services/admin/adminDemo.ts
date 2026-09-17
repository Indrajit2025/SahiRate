// This adapter provides local demo data for M11.1 and M11.2.
// It will be replaced by FastAPI/API services during M12.

export type AdminSummary = {
  totalTransactions: number;
  pendingVerification: number;
  activeLots: number;
  openAlerts: number;
};

export type AdminActivityType = "lot_accepted" | "payment_completed" | "verification_pending" | "anomaly_detected";

export type AdminActivity = {
  id: string;
  type: AdminActivityType;
  title: string;
  description: string;
  createdAt: string;
};

export type AdminLifecycleStatus = "created" | "accepted" | "qr_generated" | "collector_confirmed" | "completed";
export type AdminPaymentStatus = "pending" | "completed";

export type AdminTransaction = {
  id: string;
  lotId: string;
  material: string;
  weightKg: number;
  collectorId: string;
  collectorName: string;
  recyclerId: string;
  recyclerName: string;
  ratePerKg: number;
  finalAmount: number;
  lifecycleStatus: AdminLifecycleStatus;
  paymentStatus: AdminPaymentStatus;
  paymentMode?: string;
  createdAt: string;
  updatedAt: string;
  photoUrl?: string; // If available locally
};



export function getRecentActivity(): AdminActivity[] {
  return [
    {
      id: "act_1",
      type: "lot_accepted",
      title: "Lot Accepted",
      description: "Recycler R-102 accepted Lot L-99",
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
      id: "act_2",
      type: "verification_pending",
      title: "Verification Pending",
      description: "Lot L-98 requires weight verification",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: "act_3",
      type: "payment_completed",
      title: "Payment Completed",
      description: "Payment of ₹450 to Collector C-45",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: "act_4",
      type: "anomaly_detected",
      title: "Anomaly Detected",
      description: "Unusual price variance in Lot L-97",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
  ];
}

const DEMO_TRANSACTIONS: AdminTransaction[] = [
  {
    id: "TRX-1001",
    lotId: "LOT-5001",
    material: "PCB",
    weightKg: 2.5,
    collectorId: "COL-045",
    collectorName: "Raju Kumar",
    recyclerId: "REC-102",
    recyclerName: "TechRecycle Ltd",
    ratePerKg: 150,
    finalAmount: 375,
    lifecycleStatus: "completed",
    paymentStatus: "completed",
    paymentMode: "UPI",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
  },
  {
    id: "TRX-1002",
    lotId: "LOT-5002",
    material: "BATTERY",
    weightKg: 15.0,
    collectorId: "COL-089",
    collectorName: "Sanjay Singh",
    recyclerId: "REC-105",
    recyclerName: "Eco Power Solutions",
    ratePerKg: 80,
    finalAmount: 1200,
    lifecycleStatus: "collector_confirmed",
    paymentStatus: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "TRX-1003",
    lotId: "LOT-5003",
    material: "CABLE",
    weightKg: 5.2,
    collectorId: "COL-045",
    collectorName: "Raju Kumar",
    recyclerId: "REC-102",
    recyclerName: "TechRecycle Ltd",
    ratePerKg: 120,
    finalAmount: 624,
    lifecycleStatus: "accepted",
    paymentStatus: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
  },
  {
    id: "TRX-1004",
    lotId: "LOT-5004",
    material: "DISPLAY",
    weightKg: 8.0,
    collectorId: "COL-012",
    collectorName: "Amit Patel",
    recyclerId: "",
    recyclerName: "",
    ratePerKg: 0,
    finalAmount: 0,
    lifecycleStatus: "created",
    paymentStatus: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "TRX-1005",
    lotId: "LOT-5005",
    material: "PCB",
    weightKg: 1.2,
    collectorId: "COL-089",
    collectorName: "Sanjay Singh",
    recyclerId: "REC-105",
    recyclerName: "Eco Power Solutions",
    ratePerKg: 150,
    finalAmount: 180,
    lifecycleStatus: "qr_generated",
    paymentStatus: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  }
];

export function getAdminTransactions(): AdminTransaction[] {
  return DEMO_TRANSACTIONS;
}

export function getAdminTransactionById(id: string): AdminTransaction | undefined {
  return DEMO_TRANSACTIONS.find(t => t.id === id);
}

export type VerificationStatus = "pending" | "verified" | "rejected" | "suspended";
export type VerificationType = "recycler";

export type AdminVerification = {
  id: string;
  type: VerificationType;
  entityId: string;
  name: string;
  location?: string;
  phone?: string;
  submittedAt: string;
  reviewedAt?: string;
  status: VerificationStatus;
  documentLabel?: string;
  documentReference?: string;
  notes?: string;
};

export type AdminAlertType = "anomaly" | "verification" | "sync" | "system";
export type AdminAlertSeverity = "low" | "medium" | "high";
export type AdminAlertStatus = "open" | "resolved";

export type AdminAlert = {
  id: string;
  type: AdminAlertType;
  severity: AdminAlertSeverity;
  title: string;
  description: string;
  createdAt: string;
  status: AdminAlertStatus;
  relatedTransactionId?: string;
  relatedEntityId?: string;
};

let DEMO_VERIFICATIONS: AdminVerification[] = [
  {
    id: "VER-2001",
    type: "recycler",
    entityId: "REC-108",
    name: "Green Future Recycling",
    location: "Dharavi, Mumbai",
    phone: "+91 9876543210",
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    status: "pending",
    documentLabel: "Business License",
    documentReference: "DOC-9943A",
    notes: "Awaiting physical address verification.",
  },
  {
    id: "VER-2002",
    type: "recycler",
    entityId: "REC-109",
    name: "Eco Metals Pvt Ltd",
    location: "Kurla West, Mumbai",
    phone: "+91 9988776655",
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    status: "pending",
    documentLabel: "Trade Certificate",
    documentReference: "DOC-1122B",
  },
  {
    id: "VER-2003",
    type: "recycler",
    entityId: "REC-102",
    name: "TechRecycle Ltd",
    location: "Andheri East, Mumbai",
    phone: "+91 9123456789",
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString(),
    status: "verified",
    documentLabel: "Verified License",
    documentReference: "DOC-0055C",
  },
  {
    id: "VER-2004",
    type: "recycler",
    entityId: "REC-115",
    name: "Scrap Solutions Co.",
    location: "Sion, Mumbai",
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    status: "rejected",
    notes: "Provided invalid GST number. Requested resubmission.",
  },
  {
    id: "VER-2005",
    type: "recycler",
    entityId: "REC-099",
    name: "Old Traders",
    location: "Vikhroli, Mumbai",
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString(),
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    status: "suspended",
    notes: "Suspended due to 3 consecutive anomalies.",
  },
];

let DEMO_ALERTS: AdminAlert[] = [
  {
    id: "ALT-3001",
    type: "anomaly",
    severity: "high",
    title: "Suspicious Transaction Pattern",
    description: "Transaction final amount significantly exceeds expected material market value.",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: "open",
    relatedTransactionId: "TRX-1002",
  },
  {
    id: "ALT-3002",
    type: "verification",
    severity: "high",
    title: "Document Expiry Warning",
    description: "Trade license for verified recycler is expiring in 5 days.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    status: "open",
    relatedEntityId: "VER-2003",
  },
  {
    id: "ALT-3003",
    type: "sync",
    severity: "medium",
    title: "Repeated Sync Failure",
    description: "Collector C-089 has 4 failed sync attempts in the last hour.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    status: "open",
  },
  {
    id: "ALT-3004",
    type: "system",
    severity: "low",
    title: "System Update",
    description: "SahiRate pricing engine will receive an update at midnight.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    status: "resolved",
  },
];

export function getAdminVerifications(): AdminVerification[] {
  return DEMO_VERIFICATIONS;
}

export function updateAdminVerification(id: string, updates: Partial<AdminVerification>) {
  DEMO_VERIFICATIONS = DEMO_VERIFICATIONS.map(v =>
    v.id === id ? { ...v, ...updates, reviewedAt: new Date().toISOString() } : v
  );
}

export function getAdminAlerts(): AdminAlert[] {
  return DEMO_ALERTS;
}

export function updateAdminAlert(id: string, updates: Partial<AdminAlert>) {
  DEMO_ALERTS = DEMO_ALERTS.map(a =>
    a.id === id ? { ...a, ...updates } : a
  );
}

// Override getAdminSummary to use live demo data
export function getAdminSummary(): AdminSummary {
  const pendingVerification = DEMO_VERIFICATIONS.filter(v => v.status === "pending").length;
  const openAlerts = DEMO_ALERTS.filter(a => a.status === "open").length;

  return {
    totalTransactions: 128,
    pendingVerification,
    activeLots: 32,
    openAlerts,
  };
}



export type AdminAuditEventType = "lot_created" | "lot_accepted" | "qr_generated" | "collector_confirmed" | "handover_completed" | "payment_recorded";

export type AdminAuditEvent = {
  id: string;
  transactionId: string;
  lotId: string;
  type: AdminAuditEventType;
  title: string;
  description: string;
  actorType: "collector" | "recycler" | "admin" | "system";
  actorId?: string;
  actorName?: string;
  createdAt: string;
  previousHash?: string;
  eventHash?: string;
  verificationStatus?: "demo" | "unverified" | "verified";
};

let DEMO_AUDIT_EVENTS: AdminAuditEvent[] = [];

// Helper to generate audit events for the demo transactions dynamically
function generateDemoAuditEvents() {
  const events: AdminAuditEvent[] = [];
  let eventCounter = 1000;
  let lastHash = "0000000000000000000000000000000000000000000000000000000000000000";

  const generateHash = (id: string, type: string) => {
    // FAKE deterministic hash for demo purposes ONLY
    return `hash_${id}_${type}_8f2a9d...`.padEnd(64, '0');
  };

  const addEvent = (tr: AdminTransaction, type: AdminAuditEventType, title: string, desc: string, actor: "collector"|"recycler"|"system", offsetMins: number) => {
    const eHash = generateHash(tr.id, type);
    events.push({
      id: `EVT-${eventCounter++}`,
      transactionId: tr.id,
      lotId: tr.lotId,
      type,
      title,
      description: desc,
      actorType: actor,
      actorId: actor === "collector" ? tr.collectorId : (actor === "recycler" ? tr.recyclerId : "SYS"),
      actorName: actor === "collector" ? tr.collectorName : (actor === "recycler" ? tr.recyclerName : "System"),
      createdAt: new Date(new Date(tr.createdAt).getTime() + offsetMins * 60000).toISOString(),
      previousHash: lastHash,
      eventHash: eHash,
      verificationStatus: "demo"
    });
    lastHash = eHash;
  };

  for (const tr of getAdminTransactions()) {
    // 1. lot_created
    addEvent(tr, "lot_created", "Lot Created", `Collection lot ${tr.lotId} created by collector.`, "collector", 0);

    // 2. lot_accepted
    if (tr.lifecycleStatus !== "created") {
      addEvent(tr, "lot_accepted", "Recycler Accepted", `Lot ${tr.lotId} accepted by recycler ${tr.recyclerName}.`, "recycler", 30);
    }

    // 3. qr_generated
    if (["qr_generated", "collector_confirmed", "completed"].includes(tr.lifecycleStatus)) {
      addEvent(tr, "qr_generated", "Handover QR Generated", `Handover QR code generated for ${tr.lotId}.`, "recycler", 35);
    }

    // 4. collector_confirmed
    if (["collector_confirmed", "completed"].includes(tr.lifecycleStatus)) {
      addEvent(tr, "collector_confirmed", "Collector Confirmed", `Collector confirmed handover of ${tr.lotId}.`, "collector", 40);
    }

    // 5. handover_completed
    if (tr.lifecycleStatus === "completed") {
      addEvent(tr, "handover_completed", "Handover Completed", `Handover finalized successfully.`, "system", 42);
    }

    // 6. payment_recorded
    if (tr.paymentStatus === "completed") {
      addEvent(tr, "payment_recorded", "Payment Recorded", `Payment of ₹${tr.finalAmount} completed via ${tr.paymentMode}.`, "system", 45);
    }
  }

  // Sort descending by created at
  return events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

DEMO_AUDIT_EVENTS = generateDemoAuditEvents();

export function getAdminAuditEvents(): AdminAuditEvent[] {
  return DEMO_AUDIT_EVENTS;
}
