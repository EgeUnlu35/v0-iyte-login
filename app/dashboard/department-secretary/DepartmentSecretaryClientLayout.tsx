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
  UploadCloud,
  DownloadCloud,
  FileText,
  Edit3,
  CheckSquare,
  Award,
  Book,
  Users,
  Send,
} from "lucide-react";
import { logout } from "@/app/actions/auth";

interface DepartmentSecretaryClientLayoutProps {
  userName: string;
}

export default function DepartmentSecretaryClientLayout({
  userName,
}: DepartmentSecretaryClientLayoutProps) {
  // Mock data - replace with actual data fetching and props
  const mockStats = {
    pendingIssues: 3,
    approvedFormsReceived: 15,
    studentsRanked: 45,
    curriculumsImported: 1,
  };

  const handleMockAction = (action: string) => {
    alert(`Mock Action: ${action}`);
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
            <h1 className="text-xl font-bold">Department Secretary Portal</h1>
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
          <h2 className="text-3xl font-bold mb-2">
            Department Secretary Dashboard
          </h2>
          <p className="text-gray-600">
            Manage departmental graduation processes and student records.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Issues
              </CardTitle>
              <Edit3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockStats.pendingIssues}
              </div>
              <p className="text-xs text-muted-foreground">
                Graduation record discrepancies
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Approved Forms Received
              </CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockStats.approvedFormsReceived}
              </div>
              <p className="text-xs text-muted-foreground">
                From advisors/chairs
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Students Ranked (GPA)
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockStats.studentsRanked}
              </div>
              <p className="text-xs text-muted-foreground">Graduating cohort</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Curriculums Imported
              </CardTitle>
              <Book className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockStats.curriculumsImported}
              </div>
              <p className="text-xs text-muted-foreground">
                Department undergraduate programs
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-blue-500" /> Import/Export
                Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                onClick={() => handleMockAction("Import Graduation Data")}
              >
                Import Graduation Data
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => handleMockAction("Export Graduation Data")}
              >
                Export Graduation Data
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-500" /> Document
                Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                onClick={() =>
                  handleMockAction("Submit Graduation Documents to Authorities")
                }
              >
                Submit Graduation Documents
              </Button>
              <Button
                className="w-full"
                onClick={() =>
                  handleMockAction("Prepare Cover Letter for Graduation Forms")
                }
              >
                Prepare Cover Letters
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() =>
                  handleMockAction("Receive Approved Graduation Forms")
                }
              >
                Receive Approved Forms
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-orange-500" /> Record & Issue
                Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                onClick={() => handleMockAction("Correct Graduation Issues")}
              >
                Correct Graduation Issues
              </Button>
              <Button
                className="w-full"
                onClick={() =>
                  handleMockAction(
                    "Update Student Record (e.g., approved status)"
                  )
                }
              >
                Update Student Record
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-500" /> Student Ranking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                onClick={() => handleMockAction("Rank Students by GPA")}
              >
                Rank Students by GPA
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() =>
                  handleMockAction("Submit Ranked List to Faculty Secretary")
                }
              >
                Submit Ranked List to Faculty Sec.
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="w-5 h-5 text-indigo-500" /> Curriculum
                Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() =>
                  handleMockAction("Import Undergraduate Curriculum")
                }
              >
                Import Undergraduate Curriculum
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Example List: Recently Processed Students */}
        <Card>
          <CardHeader>
            <CardTitle>Recently Processed Students</CardTitle>
            <CardDescription>
              Overview of recent student record updates or document submissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* This would be a list or table of students */}
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 border rounded-md">
                <div>
                  <p className="font-medium">Zeynep Çelik</p>
                  <p className="text-sm text-gray-500">
                    Graduation documents submitted - 2023-11-01
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMockAction("View Zeynep Çelik's Record")}
                >
                  View Record
                </Button>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-md">
                <div>
                  <p className="font-medium">Barış Aksoy</p>
                  <p className="text-sm text-gray-500">
                    GPA ranking completed - 2023-10-30
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMockAction("View Barış Aksoy's Record")}
                >
                  View Record
                </Button>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-md bg-yellow-50">
                <div>
                  <p className="font-medium">Deniz Arslan</p>
                  <p className="text-sm text-yellow-700">
                    Issue flagged: Missing transcript - 2023-10-28
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    handleMockAction("Address Deniz Arslan's Issue")
                  }
                >
                  Address Issue
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
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
