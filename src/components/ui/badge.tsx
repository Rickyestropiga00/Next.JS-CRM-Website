import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline";
  color?: "success"; // for green outline/text
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", color, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium transition-colors",
          variant === "default" && "bg-primary text-primary-foreground",
          variant === "outline" &&
            !color &&
            "border border-primary text-primary",
          variant === "outline" &&
            color === "success" &&
            "border border-green-500 text-green-600",
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";
