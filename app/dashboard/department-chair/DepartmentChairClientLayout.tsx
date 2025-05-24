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
import { ArrowLeft, Edit, Send, CheckCircle, Users } from "lucide-react";
import { logout } from "@/app/actions/auth";

interface DepartmentChairClientLayoutProps {
  userName: string;
}

export default function DepartmentChairClientLayout({
  userName,
}: DepartmentChairClientLayoutProps) {
  // Mock data - replace with actual data fetching and props
  const mockCoverLetters = [
    {
      id: "cl1",
      studentName: "Ahmet Yılmaz",
      datePrepared: "2023-11-05",
      status: "Pending Signature",
    },
    {
      id: "cl2",
      studentName: "Elif Kaya",
      datePrepared: "2023-11-04",
      status: "Pending Signature",
    },
  ];

  const handleSignAndSend = (letterId: string, studentName: string) => {
    if (confirm(`Sign and send cover letter for ${studentName}?`)) {
      alert(
        `Mock Action: Cover letter for ${studentName} (ID: ${letterId}) signed and sent back to Department Secretary.`
      );
      // Here you would typically update the status of the letter
    }
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
            <h1 className="text-xl font-bold">Department Chair Portal</h1>
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
            Department Chair Dashboard
          </h2>
          <p className="text-gray-600">
            Review and sign official department documents.
          </p>
        </div>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-500" /> Cover Letters for
              Signature
            </CardTitle>
            <CardDescription>
              Review and sign cover letters prepared by the Department
              Secretary.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mockCoverLetters.length > 0 ? (
              <div className="space-y-4">
                {mockCoverLetters.map((letter) => (
                  <div
                    key={letter.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        Cover Letter for: {letter.studentName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Prepared on: {letter.datePrepared}
                      </p>
                      <p
                        className={`text-sm font-semibold ${
                          letter.status === "Pending Signature"
                            ? "text-orange-600"
                            : "text-green-600"
                        }`}
                      >
                        Status: {letter.status}
                      </p>
                    </div>
                    {letter.status === "Pending Signature" && (
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() =>
                          handleSignAndSend(letter.id, letter.studentName)
                        }
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Sign & Send to Secretary
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No cover letters currently awaiting your signature.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Placeholder for other potential Department Chair actions */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Other Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() =>
                alert("Mock Action: View Departmental Graduation Reports")
              }
            >
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 mx-auto mb-3 text-indigo-500" />
                <h3 className="font-medium mb-2">View Graduation Reports</h3>
                <p className="text-sm text-gray-600">
                  Access departmental graduation statistics.
                </p>
              </CardContent>
            </Card>
          </div>
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
