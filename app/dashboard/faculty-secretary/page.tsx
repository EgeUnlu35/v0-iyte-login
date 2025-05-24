import { redirect } from "next/navigation";
import { checkAuth, getSession } from "@/app/actions/auth";
import FacultySecretaryClientLayout from "./FacultySecretaryClientLayout";

export default async function FacultySecretaryPage() {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    redirect("/login?from=/dashboard/faculty-secretary");
  }

  const session = await getSession();
  // TODO: Check role from session, if not faculty-secretary, redirect or show error
  const userName = session?.name || "Faculty Secretary";

  // TODO: Fetch any necessary data specific to the faculty secretary role

  return <FacultySecretaryClientLayout userName={userName} />;
}
