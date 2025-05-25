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
  Bell,
  FileCheck,
  Send,
  Users,
  Award,
  ClipboardList,
  MessageCircle,
  CheckSquare,
  AlertCircle,
} from "lucide-react";
import { logout } from "@/app/actions/auth";

interface FacultySecretaryClientLayoutProps {
  userName: string;
}

export default function FacultySecretaryClientLayout({
  userName,
}: FacultySecretaryClientLayoutProps) {
  const handleMockAction = (action: string) => alert(`Mock Action: ${action}`);

  // Mock data - replace with actual data
  const mockFacultyStats = {
    departmentsPendingDecision: 2,
    coverLettersMissing: 1,
    totalGraduatingFaculty: 150,
    topStudentsIdentified: true,
    docsSentToDean: 5,
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-[#990000] text-white py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/images/iyte-logo.png"
              alt="IYTE Logo"
              width={40}
              height={40}
              className="rounded-full hidden sm:block"
            />
            <h1 className="text-xl font-bold">Faculty Secretary Portal</h1>
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
            Faculty Secretary Dashboard
          </h2>
          <p className="text-gray-600">
            Coordinate faculty-level graduation processes and student
            notifications.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Depts Pending Decision
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockFacultyStats.departmentsPendingDecision}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting graduation lists
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Missing Cover Letters
              </CardTitle>
              <FileCheck className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockFacultyStats.coverLettersMissing}
              </div>
              <p className="text-xs text-muted-foreground">From departments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Graduating (Faculty)
              </CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockFacultyStats.totalGraduatingFaculty}
              </div>
              <p className="text-xs text-muted-foreground">
                Combined from departments
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Top 3 Identified
              </CardTitle>
              <Award className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockFacultyStats.topStudentsIdentified ? "Yes" : "No"}
              </div>
              <p className="text-xs text-muted-foreground">
                Faculty top performers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-red-500" /> Department
                Communication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                onClick={() =>
                  handleMockAction(
                    "Inform Dept Sec About Not Approved Graduations"
                  )
                }
              >
                Notify Not Approved
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() =>
                  handleMockAction("Request Graduation Decision from Dept Secs")
                }
              >
                Request Decisions
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-500" /> Decision & Document
                Forwarding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                onClick={() =>
                  handleMockAction(
                    "Send Graduation Decision to Faculties (internal)"
                  )
                }
              >
                Send Decision to Faculties
              </Button>
              <Button
                className="w-full"
                onClick={() =>
                  handleMockAction(
                    "Send Transcripts, Cover Letters, Forms to Dean"
                  )
                }
              >
                Send Docs to Dean
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() =>
                  handleMockAction(
                    "Send Docs Approved by Dean to Student Affairs"
                  )
                }
              >
                Send Approved to Student Affairs
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-green-500" /> List &
                Ranking Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                onClick={() =>
                  handleMockAction(
                    "Combine Graduating Students from Departments"
                  )
                }
              >
                Combine Department Lists
              </Button>
              <Button
                className="w-full"
                onClick={() =>
                  handleMockAction("Rank and Decide Top 3 of the Faculty")
                }
              >
                Rank & Decide Faculty Top 3
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-indigo-500" /> Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() =>
                  handleMockAction("Check If Cover Letters Sent by Departments")
                }
              >
                Check Dept Cover Letters
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-purple-500" /> Student
                Notification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() => handleMockAction("Inform Graduated Students")}
              >
                Inform Graduated Students
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
