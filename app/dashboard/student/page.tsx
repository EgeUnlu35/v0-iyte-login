import { redirect } from "next/navigation"
import { checkAuth, getSession } from "@/app/actions/auth"
import { getMyApplication } from "@/app/actions/student"
import StudentClientLayout from "./StudentClientLayout"

export default async function StudentPage() {
  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) {
    redirect("/login?from=/dashboard/student")
  }

  const session = await getSession()
  const userName = session?.name || "Student"

  // Fetch student's application if exists
  const applicationResult = await getMyApplication()
  const application = applicationResult.success ? applicationResult.data : null
  const applicationError = applicationResult.error || null

  return <StudentClientLayout userName={userName} application={application} applicationError={applicationError} />
}
