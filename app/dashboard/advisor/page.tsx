import { redirect } from "next/navigation"
import { checkAuth, getSession } from "@/app/actions/auth"
import { getAllApplications } from "@/app/actions/advisor"
import AdvisorClientLayout from "./AdvisorClientLayout"

export default async function AdvisorPage() {
  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) {
    redirect("/login?from=/dashboard/advisor")
  }

  const session = await getSession()
  const userName = session?.name || "Advisor"

  // Fetch all applications instead of just pending
  const applicationsResult = await getAllApplications()
  const allApplications = applicationsResult.success ? applicationsResult.data.applications : []
  const error = applicationsResult.error || null

  return <AdvisorClientLayout userName={userName} allApplications={allApplications} error={error} />
}
