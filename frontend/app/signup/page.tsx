"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";

const inputClassName =
  "h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function AuthForm() {
  const searchParams = useSearchParams();
  const isLogin = searchParams.get("mode") === "login";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="space-y-6">
      <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground">
        {isLogin ? "Log in to Ecom Pulse" : "Sign up for Ecom Pulse"}
      </h1>

      <div className="space-y-3">
        <input
          type="email"
          placeholder="Email Address"
          className={inputClassName}
          aria-label="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="Password"
          className={inputClassName}
          aria-label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={isLogin ? "current-password" : "new-password"}
        />
        {!isLogin && (
          <input
            type="password"
            placeholder="Re-enter password"
            className={inputClassName}
            aria-label="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
        )}
        <Button
          type="button"
          className="h-10 w-full rounded-md bg-foreground text-background hover:bg-foreground/90"
        >
          {isLogin ? "Log in" : "Sign up"}
        </Button>
      </div>

      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          className="h-10 w-full rounded-md border-border bg-background gap-2"
        >
          <GoogleIcon />
          {isLogin ? "Log in with Google" : "Continue with Google"}
        </Button>
      </div>

      <button
        type="button"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        Show other options
      </button>

      <p className="text-center text-sm text-muted-foreground">
        {isLogin ? (
          <>
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link
              href="/signup?mode=login"
              className="font-medium text-primary hover:underline"
            >
              Log in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

function SignUpPageFallback() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 animate-pulse rounded bg-muted" />
      <div className="space-y-3">
        <div className="h-10 w-full rounded-md border border-border bg-background" />
        <div className="h-10 w-full rounded-md bg-muted" />
      </div>
      <div className="h-10 w-full rounded-md border border-border" />
    </div>
  );
}

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa]">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center px-4 pt-14 pb-8">
        <div className="w-full max-w-[400px] space-y-8">
          <Suspense fallback={<SignUpPageFallback />}>
            <AuthForm />
          </Suspense>

          {/* Footer */}
          {/* <footer className="flex justify-center gap-4 text-center text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="#" className="hover:text-foreground">
              Privacy Policy
            </Link>
          </footer> */}
        </div>
      </main>
    </div>
  );
}
