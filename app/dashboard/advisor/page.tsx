import { redirect } from "next/navigation"
import { checkAuth, getSession } from "@/app/actions/auth"
import { getPendingApplications } from "@/app/actions/advisor"
import AdvisorClientLayout from "./AdvisorClientLayout"

export default async function AdvisorPage() {
  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) {
    redirect("/login?from=/dashboard/advisor")
  }

  const session = await getSession()
  const userName = session?.name || "Advisor"

  // Fetch pending applications
  const pendingResult = await getPendingApplications()
  const pendingApplications = pendingResult.success ? pendingResult.data.applications : []
  const error = pendingResult.error || null

  return <AdvisorClientLayout userName={userName} pendingApplications={pendingApplications} error={error} />
}
