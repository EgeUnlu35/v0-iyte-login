import { redirect } from "next/navigation"
import { checkAuth, getSession } from "@/app/actions/auth"
import { getAllGraduationLists } from "@/app/actions/depsec"
import DepartmentSecretaryClientLayout from "./DepartmentSecretaryClientLayout"

export default async function DepartmentSecretaryPage() {
  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) {
    redirect("/login?from=/dashboard/department-secretary")
  }

  const session = await getSession()
  const userName = session?.name || "Department Secretary"

  // Fetch graduation lists
  const listsResult = await getAllGraduationLists()
  const graduationLists = listsResult.success ? listsResult.data : []
  const error = listsResult.error || null

  return <DepartmentSecretaryClientLayout userName={userName} graduationLists={graduationLists} error={error} />
}
