export const en = {
  common: {
    back: "Back",
    save: "Save",
    retry: "Retry",
    loading: "Loading...",
    offline: "Offline",
    online: "Online",
    synced: "Synced",
    weight: "Weight",
    rate: "Rate",
    amount: "Amount",
    date: "Date",
    total: "Total",
    unknown_material: "Unknown Material",
    error_occurred: "An error occurred",
    no_data: "No data available",
    search: "Search"
  },
  status: {
    available: "Available",
    accepted: "Accepted",
    pending: "Pending",
    failed: "Failed",
    synced: "Synced",
    syncing: "Syncing...",
    offline: "Offline",
    online: "Online",
    completed: "Completed",
    paid: "Paid",
    qr_generated: "QR Generated",
    collector_confirmed: "Collector Confirmed",
    pending_sync: "Pending Sync",
    stable: "Stable"
  },
  material: {
    PCB: "PCB Board",
    CABLE: "Wires",
    BATTERY: "Battery",
    DISPLAY: "Screen"
  },
  collector: {
    home: {
      title: "SahiRate",
      start_handover: "Start a Handover",
      new_collection: "New Collection",
      history: "History",
      scan_qr: "Scan QR",
      price_board: "Price Board",
      earnings: "My Earnings",
      safety: "Safety",
      sync_center: "Sync Center",
      switch_role: "Switch Role"
    },
    create: {
      new_collection: "New Collection",
      choose_material: "Choose Material",
      enter_weight: "Enter Weight",
      approx_weight_kg: "Approx. Weight (kg)",
      fair_price_range: "Fair Price Range",
      local_market_value: "LOCAL MARKET VALUE",
      price_desc: "Based on {{material}} at ₹{{min}}-₹{{max}}/kg",
      photograph_scrap: "Photograph Scrap",
      take_photo: "Take Photo",
      processing: "Processing...",
      choose_gallery: "Choose from Gallery",
      remove_photo: "Remove photo",
      ready_to_save: "Ready to Save",
      ready_desc: "Your collection details are ready to be saved locally.",
      confirm_save: "Confirm & Save",
      saving: "Saving...",
      next: "Next",
      cancel: "Cancel"
    },
    earnings: {
      title: "My Earnings",
      total_earnings: "Total Earnings",
      pending_payments: "Pending Payments",
      this_month: "This Month",
      recent_transactions: "Recent Transactions",
      transaction_id: "Ref",
      no_transactions: "No completed transactions yet."
    },
    history: {
      title: "History",
      filter_all: "All",
      filter_pending: "Pending",
      filter_completed: "Completed",
      offline_awaiting: "Offline — awaiting sync",
      no_history: "No transactions found."
    },
    history_detail: {
      title: "Transaction Details",
      transaction_not_found: "Transaction not found",
      recycler_id: "Recycler ID",
      final_amount: "Final Amount",
      timeline: "Timeline",
      lot_created: "Lot Created",
      accepted_by_recycler: "Accepted by Recycler",
      weight_verified: "Weight Verified",
      collector_confirmed: "Collector Confirmed",
      handover_completed: "Handover Completed"
    },
    safety: {
      title: "Safety Guidelines",
      battery_title: "Battery",
      battery_rules: ["Do not puncture", "Do not burn", "Do not dismantle"],
      monitor_title: "CRT Monitor",
      monitor_rules: ["Handle carefully", "Avoid breaking glass", "Contains toxic dust"],
      cables_title: "Cables & Wires",
      cables_rules: ["Don't burn wires", "Strip manually", "Avoid toxic smoke"],
      wear_gloves: "Wear Gloves",
      wear_gloves_desc: "Always wear thick protective gloves when handling sharp metals or e-waste.",
      heavy_lifting: "Safe Lifting",
      heavy_lifting_desc: "Bend your knees and keep your back straight when lifting heavy items.",
      sharp_objects: "Sharp Objects",
      sharp_objects_desc: "Be careful of exposed nails, broken glass, or sharp edges.",
      emergency: "Emergency",
      emergency_desc: "Keep a basic first-aid kit nearby and know local emergency contacts."
    },
    price_board: {
      title: "Price Board",
      today_rates: "Today's Rates",
      rate_per_kg: "per kg",
      updated_today: "Updated today"
    },
    sync_center: {
      title: "Sync Center",
      status: "Status",
      items_pending: "items pending",
      sync_now: "Sync Now",
      syncing: "Syncing...",
      last_synced: "Last synced",
      auto_sync_desc: "App will automatically sync when connected to the internet."
    },
    scan_handover: {
      title: "Scan Handover",
      position_qr: "Position QR code within frame",
      scanning: "Scanning...",
      enter_manually: "Or enter Reference ID",
      reference_id: "Reference ID",
      find_handover: "Find Handover",
      invalid_qr: "Invalid QR code format",
      cross_device_disclaimer: "Note: In this local demo, cross-device scanning is simulated. Real scanning works in M12."
    },
    confirm_handover: {
      title: "Confirm Handover",
      verifying: "Verifying Handover...",
      handover_details: "Handover Details",
      verified_weight: "Verified Weight",
      final_rate: "Final Rate",
      confirm_handover: "Confirm Handover",
      confirming: "Confirming...",
      success: "Handover Confirmed!",
      return_home: "Return to Home",
      error_not_found: "Handover not found or not in QR generated state."
    }
  }
};

export type TranslationType = typeof en;
