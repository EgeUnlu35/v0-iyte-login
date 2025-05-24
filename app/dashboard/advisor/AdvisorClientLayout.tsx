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
  FileCheck,
  Calendar,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { logout } from "@/app/actions/auth";

interface AdvisorClientLayoutProps {
  userName: string;
  // We might need to pass more props like studentList, pendingReviews, etc. later
}

export default function AdvisorClientLayout({
  userName,
}: AdvisorClientLayoutProps) {
  // Mock data for pending reviews - in a real app, this would come from props/state
  const pendingApplications = [
    {
      id: "1",
      studentName: "Ayşe Vural",
      applicationType: "Graduation Application",
      submittedDate: "2023-10-26",
    },
    {
      id: "2",
      studentName: "Mehmet Özdemir",
      applicationType: "Graduation Application",
      submittedDate: "2023-10-24",
    },
  ];

  const otherRequests = [
    {
      id: "3",
      studentName: "Ali Can",
      requestType: "Course Substitution Request",
      submittedDate: "2023-10-22",
    },
  ];

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
            <h1 className="text-xl font-bold">Advisor Portal</h1>
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
          <h2 className="text-3xl font-bold mb-2">Advisor Portal</h2>
          <p className="text-gray-600">
            Review and approve student graduation plans
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* TODO: Replace with dynamic data */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Reviews</p>
                  <p className="text-2xl font-bold">
                    {pendingApplications.length}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold">15</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Defenses This Month</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() =>
              alert("Mock: Navigating to application review page.")
            }
          >
            <CardContent className="p-6 text-center">
              <FileCheck className="w-8 h-8 mx-auto mb-3 text-green-500" />
              <h3 className="font-medium mb-2">Review Applications</h3>
              <p className="text-sm text-gray-600">
                Approve/Reject graduation plans
              </p>
            </CardContent>
          </Card>
          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() =>
              alert("Mock: Navigating to student list for information update.")
            }
          >
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-3 text-blue-500" />
              <h3 className="font-medium mb-2">My Students & Update Info</h3>
              <p className="text-sm text-gray-600">
                View progress & correct/update info
              </p>
            </CardContent>
          </Card>
          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() =>
              alert("Mock: Navigating to meeting scheduling page.")
            }
          >
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-3 text-purple-500" />
              <h3 className="font-medium mb-2">Schedule Meetings</h3>
              <p className="text-sm text-gray-600">
                Book student consultations
              </p>
            </CardContent>
          </Card>
          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => alert("Mock: Navigating to messages page.")}
          >
            <CardContent className="p-6 text-center">
              <MessageSquare className="w-8 h-8 mx-auto mb-3 text-orange-500" />
              <h3 className="font-medium mb-2">Messages</h3>
              <p className="text-sm text-gray-600">Student communications</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Graduation Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Graduation Applications</CardTitle>
            <CardDescription>
              Students awaiting your decision on their graduation application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApplications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {app.studentName} - {app.applicationType}
                    </p>
                    <p className="text-sm text-gray-600">
                      Submitted: {app.submittedDate}
                    </p>
                    <Link
                      href="#"
                      className="text-sm text-blue-600 hover:underline"
                      onClick={(e) => {
                        e.preventDefault();
                        alert(
                          `Mock: Viewing ${app.studentName}'s application details.`
                        );
                      }}
                    >
                      View Details
                    </Link>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-50"
                      onClick={() =>
                        confirm(
                          `Mock: Are you sure you want to REJECT ${app.studentName}'s application?`
                        )
                          ? alert(
                              `Mock: ${app.studentName}'s application REJECTED.`
                            )
                          : alert("Mock: Action cancelled.")
                      }
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-500 hover:bg-green-600"
                      onClick={() =>
                        confirm(
                          `Mock: Are you sure you want to APPROVE ${app.studentName}'s application?`
                        )
                          ? alert(
                              `Mock: ${app.studentName}'s application APPROVED.`
                            )
                          : alert("Mock: Action cancelled.")
                      }
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
              {pendingApplications.length === 0 && (
                <p className="text-sm text-gray-500">
                  No pending graduation applications.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Other Pending Reviews (e.g., Course Substitution) - Kept for context */}
        {otherRequests.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Other Pending Requests</CardTitle>
              <CardDescription>
                Other requests awaiting your review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {otherRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-700">
                        {req.studentName} - {req.requestType}
                      </p>
                      <p className="text-sm text-gray-500">
                        Submitted: {req.submittedDate}
                      </p>
                      <Link
                        href="#"
                        className="text-sm text-blue-600 hover:underline"
                        onClick={(e) => {
                          e.preventDefault();
                          alert(
                            `Mock: Viewing ${req.studentName}'s ${req.requestType}.`
                          );
                        }}
                      >
                        View Details
                      </Link>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          alert(
                            `Mock: Reviewing ${req.studentName}'s ${req.requestType}.`
                          )
                        }
                      >
                        Review Request
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
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
