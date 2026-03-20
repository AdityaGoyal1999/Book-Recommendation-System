"use client";

import Script from "next/script";
import { createClient } from "@/lib/supabase/client";
import type { accounts, CredentialResponse } from "google-one-tap";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

declare const google: { accounts: accounts };

function generateNonce(): Promise<[string, string]> {
  const nonce = btoa(
    String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))
  );
  const encoder = new TextEncoder();
  const encodedNonce = encoder.encode(nonce);
  return crypto.subtle.digest("SHA-256", encodedNonce).then((hashBuffer) => {
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedNonce = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return [nonce, hashedNonce];
  });
}

interface GoogleOneTapProps {
  /** If set, the official Google sign-in button is rendered into this element (by id). */
  buttonContainerId?: string;
  /** Called when Google One Tap has initialized and can authenticate. */
  onReadyChange?: (ready: boolean) => void;
}

export function GoogleOneTap(
  { buttonContainerId, onReadyChange }: GoogleOneTapProps = {},
) {
  const supabase = createClient();
  const router = useRouter();
  const initialized = useRef(false);

  const initializeGoogleOneTap = async () => {
    if (initialized.current) return;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set; Google One Tap skipped.");
      onReadyChange?.(false);
      return;
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("Error getting session", sessionError);
    }
    if (session) {
      router.push("/dashboard");
      onReadyChange?.(false);
      return;
    }

    const [nonce, hashedNonce] = await generateNonce();

    google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: CredentialResponse) => {
        try {
          const { error } = await supabase.auth.signInWithIdToken({
            provider: "google",
            token: response.credential,
            nonce,
          });

          if (error) throw error;

          router.push("/dashboard");
          router.refresh();
        } catch (err) {
          console.error("Error logging in with Google One Tap", err);
        }
      },
      nonce: hashedNonce,
      use_fedcm_for_prompt: true,
    });
    // Initialized and ready to authenticate.
    onReadyChange?.(true);
    google.accounts.id.prompt();
    if (buttonContainerId) {
      const tryRender = () => {
        const el = document.getElementById(buttonContainerId);
        if (!el) return false;
        const width = el.offsetWidth || 400;
        google.accounts.id.renderButton(el, {
          type: "standard",
          size: "large",
          text: "continue_with",
          width,
        });
        return true;
      };

      // The script can load before the container div is mounted (e.g. Suspense/hydration).
      // Retry briefly so the button is rendered as soon as the element exists.
      if (!tryRender()) {
        const start = Date.now();
        const interval = setInterval(() => {
          if (tryRender() || Date.now() - start > 5000) {
            clearInterval(interval);
          }
        }, 100);
      }
    }
    initialized.current = true;
  };

  // If the Google script has already been loaded (e.g. navigation back to this page),
  // next/script's onLoad may not fire again. In that case, initialize on mount.
  useEffect(() => {
    const canInitialize =
      typeof google !== "undefined" &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (google as any)?.accounts?.id;
    if (canInitialize) void initializeGoogleOneTap();
    // Intentionally depend only on buttonContainerId so we re-render into the right element.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buttonContainerId]);

  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      onLoad={() => {
        initializeGoogleOneTap();
      }}
      onError={() => {
        onReadyChange?.(false);
      }}
    />
  );
}
