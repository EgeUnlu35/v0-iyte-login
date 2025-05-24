"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Award,
  CheckSquare,
  HelpCircle,
  Edit,
  FileText,
  Send,
} from "lucide-react";
import { logout } from "@/app/actions/auth";

interface StudentAffairsClientLayoutProps {
  userName: string;
}

export default function StudentAffairsClientLayout({
  userName,
}: StudentAffairsClientLayoutProps) {
  const handleMockAction = (action: string) => alert(`Mock Action: ${action}`);

  // Mock data
  const universityStats = {
    totalGraduatesUniversity: 1200,
    facultiesPendingDecision: 1,
    coverLettersMissingFromFaculties: 0,
    studentQueriesResolved: 152,
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-[#990000] text-white py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Image
              src="/images/iyte-logo.png"
              alt="IYTE Logo"
              width={40}
              height={40}
              className="rounded-full hidden sm:block"
            />
            <h1 className="text-xl font-bold">Student Affairs Portal</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">Welcome, {userName}</span>
          <form action={logout}>
            <Button
              variant="outline"
              className="text-white bg-[#990000] border-white hover:bg-white/10"
              type="submit"
            >
              Logout
            </Button>
          </form>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Student Affairs Dashboard</h2>
          <p className="text-gray-600">
            Oversee university-wide graduation processes and student support.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total University Graduates
              </CardTitle>
              <Award className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {universityStats.totalGraduatesUniversity}
              </div>
              <p className="text-xs text-muted-foreground">
                Current academic year
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Faculties Pending Decision
              </CardTitle>
              <FileText className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {universityStats.facultiesPendingDecision}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting final lists
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Missing Faculty Cover Letters
              </CardTitle>
              <Send className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {universityStats.coverLettersMissingFromFaculties}
              </div>
              <p className="text-xs text-muted-foreground">Follow-ups needed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Student Queries Resolved
              </CardTitle>
              <HelpCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {universityStats.studentQueriesResolved}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-500" /> University-Level
                Ranking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() =>
                  handleMockAction("Rank Students Among the University")
                }
              >
                Rank University Students
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-500" /> Faculty Coordination
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                onClick={() =>
                  handleMockAction(
                    "Initiate and Request Graduation Decision from Faculties"
                  )
                }
              >
                Request Faculty Decisions
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() =>
                  handleMockAction("Check If Cover Letters Sent by Faculties")
                }
              >
                Check Faculty Cover Letters
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-green-500" /> Student
                Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() => handleMockAction("Answer Students' Questions")}
              >
                Answer Student Questions
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-orange-500" /> Student Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() =>
                  handleMockAction(
                    "Update Student Record (e.g. final graduation status)"
                  )
                }
              >
                Update Student Record
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="bg-[#990000] text-white py-4 px-6 text-center">
        <p>
          © {new Date().getFullYear()} IYTE Graduation Management System. All
          rights reserved.
        </p>
      </footer>
    </div>
  );
}
