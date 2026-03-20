import { redirect } from "next/navigation";

export default function DashboardPage() {
  // Note: In Next.js app router, `redirect` throws to perform a server redirect.
  // This makes /dashboard behave as the app's landing page for logged-in users.
  redirect("/dashboard/new-image");
}
