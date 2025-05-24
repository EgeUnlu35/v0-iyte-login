import Image from "next/image"
import { redirect } from "next/navigation"
import { logout, checkAuth, getSession } from "@/app/actions/auth"
import { uploadCSV } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"
import CSVUploadForm from "@/components/csv-upload-form"
import CSVFormatExample from "@/components/csv-format-example"

export default async function AdminPage() {
  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) {
    redirect("/login")
  }

  const session = await getSession()
  const userName = session?.name || "Administrator"

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-[#990000] text-white py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
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
            <h1 className="text-xl font-bold">Admin Panel - Allowed Users Upload</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">Welcome, {userName}</span>
          <form action={logout}>
            <Button variant="outline" className="text-white bg-[#990000] border-white hover:bg-white/10" type="submit">
              Logout
            </Button>
          </form>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Upload Allowed Users</h2>
          <p className="text-gray-600">Upload CSV file to add allowed users to the system</p>
        </div>

        {/* Upload Instructions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              CSV Format Requirements
            </CardTitle>
            <CardDescription>Your CSV file must include the following columns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-green-700 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Required Columns
                </h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-6">
                  <li>
                    • <strong>email</strong>: User's email address
                  </li>
                  <li>
                    • <strong>role</strong>: User role (ADMIN, STUDENT, etc.)
                  </li>
                  <li>
                    • <strong>studentId</strong>: Required for STUDENT role
                  </li>
                  <li>• First row must contain column headers</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-orange-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Important Notes
                </h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-6">
                  <li>• Duplicate emails will cause an error</li>
                  <li>• All fields are required for each row</li>
                  <li>• studentId is mandatory for STUDENT role</li>
                  <li>• Invalid data will be rejected</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CSV Format Example */}
        <CSVFormatExample />

        {/* CSV Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Allowed Users CSV
            </CardTitle>
            <CardDescription>Select a CSV file containing user information to upload</CardDescription>
          </CardHeader>
          <CardContent>
            <CSVUploadForm uploadAction={uploadCSV} />
          </CardContent>
        </Card>
      </main>

      <footer className="bg-[#990000] text-white py-4 px-6 text-center">
        <p>© {new Date().getFullYear()} IYTE Graduation Management System. All rights reserved.</p>
      </footer>
    </div>
  )
}
