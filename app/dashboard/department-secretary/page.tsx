import { redirect } from "next/navigation";
import { checkAuth, getSession } from "@/app/actions/auth";
import DepartmentSecretaryClientLayout from "./DepartmentSecretaryClientLayout";

export default async function DepartmentSecretaryPage() {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    redirect("/login?from=/dashboard/department-secretary");
  }

  const session = await getSession();
  // TODO: Check role from session, if not department-secretary, redirect or show error
  const userName = session?.name || "Department Secretary";

  // TODO: Fetch any necessary data specific to the department secretary role

  return <DepartmentSecretaryClientLayout userName={userName} />;
}
