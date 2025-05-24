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
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Clock,
  FileText,
  GraduationCap,
  AlertCircle,
} from "lucide-react";
import { logout } from "@/app/actions/auth";

interface StudentClientLayoutProps {
  userName: string;
  // We might need to pass more props like applicationStatus, credits, gpa, actionsRequired later
}

export default function StudentClientLayout({
  userName,
}: StudentClientLayoutProps) {
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
            <h1 className="text-xl font-bold">Student Portal</h1>
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
          <h2 className="text-3xl font-bold mb-2">Student Portal</h2>
          <p className="text-gray-600">
            Track your graduation progress and manage requirements
          </p>
        </div>

        {/* Graduation Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Graduation Progress & Status
              </CardTitle>
              <CardDescription>
                Overall completion status and application details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Progress</span>
                    {/* TODO: Replace with dynamic data */}
                    <span>75%</span>
                  </div>
                  {/* TODO: Replace with dynamic data */}
                  <Progress value={75} className="[&>div]:bg-green-500" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Credits Completed:</span>
                    {/* TODO: Replace with dynamic data */}
                    <span className="font-medium ml-2">180/240</span>
                  </div>
                  <div>
                    <span className="text-gray-600">GPA:</span>
                    {/* TODO: Replace with dynamic data */}
                    <span className="font-medium ml-2">3.45</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Application Status:</span>
                    {/* TODO: Replace with dynamic data */}
                    <span className="font-medium ml-2 text-blue-600">
                      Pending Advisor Review
                    </span>
                  </div>
                </div>
                <Button
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() =>
                    alert(
                      "Mock: Navigating to application submission form/page."
                    )
                  }
                >
                  Submit/Update Graduation Application
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                Action Required / Issues
              </CardTitle>
              <CardDescription>
                Address any pending issues with your application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* TODO: Replace with dynamic data/map over issues */}
                <div className="text-sm p-3 border rounded-md bg-orange-50 border-orange-200">
                  <p className="font-medium text-orange-700">
                    Missing Document: Thesis Approval Form
                  </p>
                  <p className="text-gray-600">
                    Please upload the signed thesis approval form.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 border-orange-600 text-orange-600 hover:bg-orange-100"
                    onClick={() =>
                      alert(
                        "Mock: Opening resolve issue interface for Thesis Approval Form."
                      )
                    }
                  >
                    Resolve Issue
                  </Button>
                </div>
                <div className="text-sm p-3 border rounded-md bg-orange-50 border-orange-200">
                  <p className="font-medium text-orange-700">
                    Final Transcript
                  </p>
                  <p className="text-gray-600">Submit official copy</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 border-orange-600 text-orange-600 hover:bg-orange-100"
                    onClick={() =>
                      alert(
                        "Mock: Opening resolve issue interface for Final Transcript."
                      )
                    }
                  >
                    Resolve Issue
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => alert("Mock: Viewing course requirements.")}
          >
            <CardContent className="p-6 text-center">
              <BookOpen className="w-8 h-8 mx-auto mb-3 text-blue-500" />
              <h3 className="font-medium mb-2">Course Requirements</h3>
              <p className="text-sm text-gray-600">View remaining courses</p>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() =>
              alert("Mock: Navigating to document submission page.")
            }
          >
            <CardContent className="p-6 text-center">
              <FileText className="w-8 h-8 mx-auto mb-3 text-green-500" />
              <h3 className="font-medium mb-2">Submit Documents</h3>
              <p className="text-sm text-gray-600">Upload required files</p>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() =>
              alert("Mock: Navigating to defense scheduling page.")
            }
          >
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-3 text-orange-500" />
              <h3 className="font-medium mb-2">Schedule Defense</h3>
              <p className="text-sm text-gray-600">Book thesis defense</p>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => alert("Mock: Checking application status details.")}
          >
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-3 text-purple-500" />
              <h3 className="font-medium mb-2">Application Status</h3>
              <p className="text-sm text-gray-600">Check graduation status</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Your latest graduation-related activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* TODO: Replace with dynamic data/map over activities */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">Thesis submitted</p>
                  <p className="text-sm text-gray-600">2 days ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <FileText className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium">Transcript requested</p>
                  <p className="text-sm text-gray-600">1 week ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <Clock className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-medium">Defense date pending</p>
                  <p className="text-sm text-gray-600">2 weeks ago</p>
                </div>
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
