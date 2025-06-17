import { redirect } from "next/navigation";
import { checkAuth, getSession } from "@/app/actions/auth";
import { getCoverLettersForReview } from "@/app/actions/student-affairs";
import StudentAffairsClientLayout from "./StudentAffairsClientLayout";

export default async function StudentAffairsPage() {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    redirect("/login?from=/dashboard/student-affairs");
  }

  const session = await getSession();
  // TODO: Check role from session, if not student-affairs, redirect or show error
  const userName = session?.name || "Student Affairs";

  // Fetch cover letters for review
  const coverLettersResult = await getCoverLettersForReview();

  let coverLetters = [];
  let error = null;

  if (coverLettersResult.success) {
    coverLetters = coverLettersResult.data.coverLetters;
  } else {
    error = coverLettersResult.error;
    console.error("Failed to fetch cover letters:", coverLettersResult.error);
  }

  return (
    <StudentAffairsClientLayout
      userName={userName}
      coverLetters={coverLetters}
      error={error}
    />
  );
}
