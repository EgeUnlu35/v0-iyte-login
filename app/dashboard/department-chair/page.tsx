import { redirect } from "next/navigation";
import { checkAuth, getSession } from "@/app/actions/auth";
import DepartmentChairClientLayout from "./DepartmentChairClientLayout";

export default async function DepartmentChairPage() {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    redirect("/login?from=/dashboard/department-chair");
  }

  const session = await getSession();
  // TODO: Check role from session, if not department-chair, redirect or show error
  const userName = session?.name || "Department Chair";

  // TODO: Fetch any necessary data specific to the department chair role (e.g., cover letters needing signature)

  return <DepartmentChairClientLayout userName={userName} />;
}
