import React from "react";

const orderStatusColorMap: Record<string, string> = {
  Pending: "var(--badge-priority-medium)",
  "In Transit": "var(--badge-design)",
  Completed: "var(--badge-active)",
  Canceled: "var(--badge-priority-high)",
};

const paymentStatusColorMap: Record<string, string> = {
  Paid: "var(--foreground)",
  Unpaid: "var(--muted-foreground)",
};

export function StatusBadge({ status }: { status: string }) {
  // Check if it's a payment status first, then order status
  const color =
    paymentStatusColorMap[status] ||
    orderStatusColorMap[status] ||
    "var(--badge-priority-high)";

  // Check if it's a payment status to determine if we should show the circle
  const isPaymentStatus = status in paymentStatusColorMap;

  return (
    <span
      className={`inline-flex items-center gap-1 py-0.5 rounded-full font-medium ${
        isPaymentStatus ? "text-sm" : "text-xs"
      }`}
      style={{ color, borderColor: color, background: "none" }}
    >
      {!isPaymentStatus && (
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
