import { redirect } from "next/navigation"
import { checkAuth, getSession } from "@/app/actions/auth"
import { getCoverLettersForReview } from "@/app/actions/department-chair"
import DepartmentChairClientLayout from "./DepartmentChairClientLayout"

export default async function DepartmentChairPage() {
  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) {
    redirect("/login?from=/dashboard/department-chair")
  }

  const session = await getSession()
  const userName = session?.name || "Department Chair"

  // Fetch cover letters needing signature
  const coverLettersResult = await getCoverLettersForReview()
  const coverLetters = coverLettersResult.success ? coverLettersResult.data.coverLetters : []
  const error = coverLettersResult.error || null

  return <DepartmentChairClientLayout userName={userName} coverLetters={coverLetters} error={error} />
}
