import { redirect } from "next/navigation";
import { checkAuth, getSession } from "@/app/actions/auth";
import { getCoverLettersForReview } from "@/app/actions/faculty-secretary";
import FacultySecretaryClientLayout from "./FacultySecretaryClientLayout";

export default async function FacultySecretaryPage() {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    redirect("/login?from=/dashboard/faculty-secretary");
  }

  const session = await getSession();
  // TODO: Check role from session, if not faculty-secretary, redirect or show error
  const userName = session?.name || "Faculty Secretary";

  // Fetch cover letters needing faculty secretary signature
  const coverLettersResult = await getCoverLettersForReview();
  const coverLetters = coverLettersResult.success
    ? coverLettersResult.data.coverLetters
    : [];
  const error = !coverLettersResult.success ? coverLettersResult.error : null;

  return (
    <FacultySecretaryClientLayout
      userName={userName}
      coverLetters={coverLetters}
      error={error}
    />
  );
}
