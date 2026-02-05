import React from "react";

/**
 * Status badge color mappings for different entity types
 */
const statusColorMaps = {
  agent: {
    Active: "var(--badge-active)",
    Inactive: "var(--badge-inactive)",
    "On Leave": "var(--badge-priority-medium)",
  },
  customer: {
    Lead: "var(--badge-lead)",
    Active: "var(--badge-active)",
    Inactive: "var(--badge-inactive)",
    Prospect: "var(--badge-prospect)",
  },
  product: {
    Active: "var(--badge-active)",
    Disabled: "var(--badge-priority-high)",
  },
  order: {
    Pending: "var(--badge-priority-medium)",
    "In Transit": "var(--badge-design)",
    Completed: "var(--badge-active)",
    Canceled: "var(--badge-priority-high)",
  },
  payment: {
    Paid: "var(--foreground)",
    Unpaid: "var(--muted-foreground)",
  },
} as const;

type EntityType = keyof typeof statusColorMaps;

interface StatusBadgeProps {
  status: string;
  type?: EntityType;
  showDot?: boolean;
}

/**
 * Unified StatusBadge component for displaying status indicators
 * @param status - The status text to display
 * @param type - The entity type (agent, customer, product, order, payment)
 * @param showDot - Whether to show the status dot (auto-determined if not specified)
 */
export function StatusBadge({ status, type, showDot }: StatusBadgeProps) {
  // Determine the color based on type and status
  let color = "var(--badge-priority-high)";
  let isPaymentStatus = false;

  if (type) {
    const colorMap = statusColorMaps[type];
    color = colorMap[status as keyof typeof colorMap] || color;
    isPaymentStatus = type === "payment";
  } else {
    // Auto-detect from all maps if type not specified
    for (const [mapType, colorMap] of Object.entries(statusColorMaps)) {
      if (status in colorMap) {
        color = colorMap[status as keyof typeof colorMap];
        isPaymentStatus = mapType === "payment";
        break;
      }
    }
  }

  // Determine if we should show the dot
  const shouldShowDot = showDot !== undefined ? showDot : !isPaymentStatus;

  return (
    <span
      className={`inline-flex items-center gap-1 py-0.5 rounded-full font-medium ${
        isPaymentStatus ? "text-sm" : "text-xs"
      }`}
      style={{ color, borderColor: color, background: "none" }}
    >
      {shouldShowDot && (
        <span
          className="inline-block rounded-full"
          style={{
            width: 8,
            height: 8,
            background: color,
            border: `2px solid ${color}`,
          }}
        />
      )}
      {status}
    </span>
  );
}
