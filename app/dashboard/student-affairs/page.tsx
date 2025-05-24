import { redirect } from "next/navigation";
import { checkAuth, getSession } from "@/app/actions/auth";
import StudentAffairsClientLayout from "./StudentAffairsClientLayout";

export default async function StudentAffairsPage() {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    redirect("/login?from=/dashboard/student-affairs");
  }

  const session = await getSession();
  // TODO: Check role from session, if not student-affairs, redirect or show error
  const userName = session?.name || "Student Affairs";

  // TODO: Fetch any necessary data specific to the student affairs role

  return <StudentAffairsClientLayout userName={userName} />;
}
