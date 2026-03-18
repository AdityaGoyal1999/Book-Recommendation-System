"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function UsageMeter({ used, limit }: { used: number; limit: number }) {
  const remaining = Math.max(0, limit - used);
  const percent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>0</span>
        <span>{limit}</span>
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
      {used >= limit ? (
        <p className="text-sm font-medium text-destructive">You’ve reached your monthly limit.</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          You can scan {remaining} more time{remaining === 1 ? "" : "s"} this month.
        </p>
      )}
    </div>
  );
}

export function FreeUsageCard({ used, resetOn }: { used: number; resetOn: Date }) {
  const limit = 5;
  const remaining = Math.max(0, limit - used);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Plan</p>
          <p className="mt-1 text-base font-semibold text-foreground">Free</p>
          <p className="mt-1 text-sm text-muted-foreground">
            You have <span className="font-semibold text-foreground">{limit}</span> free credits/month.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">This month</p>
          <p className="mt-1 text-base font-semibold text-foreground">
            {used} / {limit} scans
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{remaining} remaining</p>
        </div>
      </div>

      <UsageMeter used={used} limit={limit} />

      <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        Upgrade to Premium for <span className="font-semibold text-foreground">$5/month</span> to get{" "}
        <span className="font-semibold text-foreground">50 scans/month</span>.
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">Credits reset on {formatDate(resetOn)}.</p>
        <Button type="button" disabled className="sm:self-end">
          Upgrade to Premium
        </Button>
      </div>
    </div>
  );
}

export function ProUsageCard({ used, renewsOn }: { used: number; renewsOn: Date }) {
  const limit = 50;
  const remaining = Math.max(0, limit - used);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Plan</p>
          <p className="mt-1 text-base font-semibold text-foreground">Premium</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Limit: <span className="font-semibold text-foreground">{limit}</span> scans/month
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">This month</p>
          <p className="mt-1 text-base font-semibold text-foreground">
            {used} / {limit} scans
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{remaining} remaining</p>
        </div>
      </div>

      <UsageMeter used={used} limit={limit} />

      <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        Billing renews on <span className="font-semibold text-foreground">{formatDate(renewsOn)}</span>.
      </div>
    </div>
  );
}

