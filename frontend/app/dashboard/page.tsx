import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-4 text-muted-foreground">
          Welcome to Ecom Pulse. Your monitoring dashboard will appear here
          once you connect a store.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          <Link href="/" className="font-medium text-primary hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
