import { redirect } from "next/navigation"
import { checkAuth, getSession } from "@/app/actions/auth"
import { getAllGraduationLists, type GraduationListSummary } from "@/app/actions/depsec"
import DepartmentSecretaryClientLayout from "./DepartmentSecretaryClientLayout"

export default async function DepartmentSecretaryPage() {
  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) {
    redirect("/login?from=/dashboard/department-secretary")
  }

  const session = await getSession()
  const userName = session?.name || "Department Secretary"

  // Fetch real data
  let graduationLists: GraduationListSummary[] = []
  let error: string | null = null

  const listsResult = await getAllGraduationLists()

  if (listsResult.success) {
    graduationLists = listsResult.data
  } else {
    error = listsResult.error || "Failed to fetch graduation lists."
  }

  return <DepartmentSecretaryClientLayout userName={userName} graduationLists={graduationLists} error={error} />
}
