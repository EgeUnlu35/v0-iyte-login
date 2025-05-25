import { redirect } from "next/navigation";
import { checkAuth, getSession } from "@/app/actions/auth";
import {
  getAllGraduationLists,
  type GraduationListSummary,
} from "@/app/actions/depsec";
import DepartmentSecretaryClientLayout from "./DepartmentSecretaryClientLayout";

// Mock Data for testing
const MOCK_LISTS: GraduationListSummary[] = [
  {
    id: "list-1-spring-2024",
    name: "Spring 2024 Graduates",
    description: "Primary list for Spring 2024 graduation candidates.",
    createdAt: new Date().toISOString(),
    entriesCount: 3,
  },
  {
    id: "list-2-fall-2023",
    name: "Fall 2023 Supplementary",
    description: "Supplementary list for late Fall 2023 applications.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(), // 90 days ago
    entriesCount: 2,
  },
  {
    id: "list-3-empty",
    name: "Summer 2024 Early Birds",
    description: "For early applications for Summer 2024.",
    createdAt: new Date().toISOString(),
    entriesCount: 0,
  },
];

// If your `getGraduationList` in DepartmentSecretaryClientLayout needs to return mock entries,
// you might need to mock that server action too, or adjust the client component to use mock details
// For now, this mock data is for the initial list rendering.
// The `entriesCount` in MOCK_LISTS should ideally match the number of mock entries you'd have for that list if details were also mocked.

export default async function DepartmentSecretaryPage() {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    redirect("/login?from=/dashboard/department-secretary");
  }

  const session = await getSession();
  const userName = session?.name || "Department Secretary";

  // Always fetch real data
  let graduationLists: GraduationListSummary[] = [];
  let error: string | null = null;

  const listsResult = await getAllGraduationLists();

  if (listsResult.success) {
    graduationLists = listsResult.data;
  } else {
    error = listsResult.error || "Failed to fetch graduation lists.";
  }

  return (
    <DepartmentSecretaryClientLayout
      userName={userName}
      graduationLists={graduationLists}
      error={error}
    />
  );
}
