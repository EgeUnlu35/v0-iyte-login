import { redirect } from "next/navigation"
import { checkAuth, getSession } from "@/app/actions/auth"
import { getAllGraduationLists, type GraduationListSummary } from "@/app/actions/depsec"
import { getAllApplications } from "@/app/actions/advisor"
import DepartmentSecretaryClientLayout from "./DepartmentSecretaryClientLayout"

export default async function DepartmentSecretaryPage() {
  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) {
    redirect("/login?from=/dashboard/department-secretary")
  }

  const session = await getSession()
  const userName = session?.name || "Department Secretary"

  // Fetch graduation lists
  let graduationLists: GraduationListSummary[] = []
  let error: string | null = null

  const listsResult = await getAllGraduationLists()

  if (listsResult.success) {
    graduationLists = listsResult.data
  } else {
    error = listsResult.error || "Failed to fetch graduation lists."
  }

  // Fetch all applications (same as Advisor)
  const applicationsResult = await getAllApplications()
  const allApplications = applicationsResult.success ? applicationsResult.data.applications : []
  const applicationsError = applicationsResult.error || null

  return (
    <DepartmentSecretaryClientLayout
      userName={userName}
      graduationLists={graduationLists}
      allApplications={allApplications}
      error={error || applicationsError}
    />
  )
}
