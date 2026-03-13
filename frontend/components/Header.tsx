import Link from "next/link";

const navLinks = [
  { href: "#", label: "About us" },
  { href: "#", label: "Features" },
  { href: "#", label: "Pricing" },
  { href: "#", label: "Contact" },
  { href: "#", label: "Sign up" },
];

export function Header() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <Link
          href="/"
          className="font-semibold text-foreground transition-colors hover:text-primary"
        >
          Ecom Pulse
        </Link>
        <nav className="flex items-center gap-6">
          {navLinks.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
