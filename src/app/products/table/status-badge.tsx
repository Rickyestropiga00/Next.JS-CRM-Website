import React from "react";

const statusColorMap: Record<string, string> = {
  Active: "var(--badge-active)",
  Disabled: "var(--badge-priority-high)",
};

export function StatusBadge({ status }: { status: string }) {
  const color = statusColorMap[status] || "var(--badge-priority-high)";
  return (
    <span
      className="inline-flex items-center gap-1 py-0.5 rounded-full text-xs font-medium"
      style={{ color, borderColor: color, background: "none" }}
    >
      <span
        className="inline-block rounded-full"
        style={{
          width: 8,
          height: 8,
          background: color,
          border: `2px solid ${color}`,
        }}
      />
      {status}
    </span>
  );
}
