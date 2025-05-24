import { redirect } from "next/navigation";
import { checkAuth, getSession } from "@/app/actions/auth";
import AdvisorClientLayout from "./AdvisorClientLayout"; // Import the new client component

// This page is now a Server Component and can be async
export default async function AdvisorPage() {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    redirect("/login?from=/dashboard/advisor"); // Added 'from' query param
  }

  const session = await getSession();
  const userName = session?.name || "Advisor";

  // TODO: Fetch other necessary advisor data here (e.g., list of students, pending reviews)
  // For now, we'll just pass the userName

  return <AdvisorClientLayout userName={userName} />;
}
