"use client";

import { cn } from "@/lib/utils";

type ScanUsageCountsBarProps = {
  used: number;
  limit: number;
};

export function ScanUsageCountsBar({ used, limit }: ScanUsageCountsBarProps) {
  const remaining = Math.max(0, limit - used);
  const percent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {used} / {limit} scans
        </span>
        <span>{remaining} remaining</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-300",
            used >= limit ? "bg-destructive" : "bg-primary"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
