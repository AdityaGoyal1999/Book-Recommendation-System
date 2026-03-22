"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GoogleOneTap } from "@/components/GoogleOneTap";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";

const inputClassName =
  "h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLogin = searchParams.get("mode") === "login";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!isLogin && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) {
          setError(signInError.message);
          return;
        }
        router.push("/dashboard");
        router.refresh();
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (signUpError) {
          setError(signUpError.message);
          return;
        }
        // Supabase may require email confirmation; redirect to dashboard or show message
        router.push("/dashboard");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground">
        {isLogin ? "Log in" : "Sign up"}
      </h1>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

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
          className="h-10 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Please wait…" : isLogin ? "Log in" : "Sign up"}
        </Button>
      </div>

      <div className="space-y-2">
        <GoogleOneTap buttonContainerId="google-signin-button" />

        <div
          id="google-signin-button"
          className="min-h-[44px] w-full max-w-[400px]"
          aria-label={isLogin ? "Log in with Google" : "Continue with Google"}
        />
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
            <Link href="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link
              href="/signup?mode=login"
              className="font-medium text-foreground underline-offset-4 hover:underline"
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
        <div className="h-10 w-full rounded-md border border-border bg-card" />
        <div className="h-10 w-full rounded-md bg-muted" />
      </div>
      <div className="h-10 w-full rounded-md border border-border bg-background" />
    </div>
  );
}

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header
        trailing={
          <Link
            href="/"
            className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to home
          </Link>
        }
      />
      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-12 pt-6 sm:px-10 lg:px-12">
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
