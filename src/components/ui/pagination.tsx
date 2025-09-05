// Shadcn UI Pagination component (Next.js compatible)
import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Pagination({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("flex w-full items-center justify-center gap-2", className)}
      {...props}
    />
  );
}

export function PaginationContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

export function PaginationItem({
  className,
  ...props
}: React.LiHTMLAttributes<HTMLLIElement>) {
  return <li className={cn("", className)} {...props} />;
}

export interface PaginationLinkProps extends React.ComponentProps<typeof Link> {
  isActive?: boolean;
}

export const PaginationLink = React.forwardRef<
  HTMLAnchorElement,
  PaginationLinkProps
>(({ isActive, className, ...props }, ref) => (
  <Link
    ref={ref}
    aria-current={isActive ? "page" : undefined}
    className={cn(
      "flex h-8 w-8 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors",
      isActive
        ? "bg-primary text-primary-foreground border-none hover:bg-primary/90"
        : "bg-transparent border-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
      className
    )}
    {...props}
  />
));
PaginationLink.displayName = "PaginationLink";

export function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof Link>) {
  return (
    <Link
      aria-label="Go to previous page"
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded border border-border bg-background px-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        className
      )}
      {...props}
    >
      <span aria-hidden>«</span>
    </Link>
  );
}

export function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof Link>) {
  return (
    <Link
      aria-label="Go to next page"
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded border border-border bg-background px-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        className
      )}
      {...props}
    >
      <span aria-hidden>»</span>
    </Link>
  );
}

export function PaginationEllipsis({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("flex h-8 w-8 items-center justify-center", className)}
      {...props}
    >
      ...
    </span>
  );
}
