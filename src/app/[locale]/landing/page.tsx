import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LandingContent } from "@/components/landing/LandingContent";

export default async function LandingPage() {
  // Check if user is logged in
  const user = await getCurrentUser();

  // If logged in, redirect to appropriate dashboard
  if (user) {
    if (user.role === "ADMIN") {
      redirect("/admin");
    } else {
      redirect("/dashboard");
    }
  }

  // Show landing page for non-logged-in users
  return <LandingContent />;
}
