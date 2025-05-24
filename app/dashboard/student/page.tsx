import { redirect } from "next/navigation";
import { checkAuth, getSession } from "@/app/actions/auth";
import StudentClientLayout from "./StudentClientLayout"; // Import the new client component

// This page is now a Server Component and can be async
export default async function StudentPage() {
  // Check if the user is authenticated
  const isAuthenticated = await checkAuth();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    redirect("/login?from=/dashboard/student"); // Added 'from' query param for redirect after login
  }

  // Get user session
  const session = await getSession();
  const userName = session?.name || "Student";

  // TODO: Fetch other necessary student data here (e.g., application status, progress, issues)
  // For now, we'll just pass the userName

  return <StudentClientLayout userName={userName} />;
}
