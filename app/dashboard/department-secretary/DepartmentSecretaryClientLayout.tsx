"use client"

import Image from "next/image"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { ArrowLeft, DownloadCloud, FileText, Edit3, CheckSquare, Award, Eye, AlertTriangle, Plus } from "lucide-react"
import { logout } from "@/app/actions/auth"
import {
  createGraduationList,
  exportGraduationList,
  approveGraduationList,
  getGraduationRankings,
  type GraduationList,
} from "@/app/actions/depsec"

interface DepartmentSecretaryClientLayoutProps {
  userName: string
  graduationLists: GraduationList[]
  error?: string | null
}

export default function DepartmentSecretaryClientLayout({
  userName,
  graduationLists,
  error,
}: DepartmentSecretaryClientLayoutProps) {
  const [lists, setLists] = useState(graduationLists)
  const [isUploading, setIsUploading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCreateList = async (formData: FormData) => {
    setIsUploading(true)
    setActionError(null)

    try {
      const result = await createGraduationList(formData)

      if (result.success) {
        alert("Graduation list created successfully!")
        setShowUploadForm(false)
        // Refresh the page to get updated lists
        window.location.reload()
      } else {
        setActionError(result.error || "Failed to create graduation list")
      }
    } catch (error) {
      setActionError("An unexpected error occurred")
    } finally {
      setIsUploading(false)
    }
  }

  const handleExport = async (listId: string) => {
    try {
      const result = await exportGraduationList(listId)
      if (result.success) {
        alert(result.message)
      } else {
        alert(result.error)
      }
    } catch (error) {
      alert("Failed to export graduation list")
    }
  }

  const handleApprove = async (listId: string) => {
    if (!confirm("Are you sure you want to approve this graduation list? This action cannot be undone.")) {
      return
    }

    try {
      const result = await approveGraduationList(listId)
      if (result.success) {
        alert(result.message)
        // Refresh to get updated status
        window.location.reload()
      } else {
        alert(result.error)
      }
    } catch (error) {
      alert("Failed to approve graduation list")
    }
  }

  const handleViewRankings = async (listId: string) => {
    try {
      const result = await getGraduationRankings(listId)
      if (result.success) {
        // For now, just show an alert. In a real app, this would open a modal or navigate to a rankings page
        alert(`Rankings loaded for list. Total students: ${result.data.length}`)
      } else {
        alert(result.error)
      }
    } catch (error) {
      alert("Failed to load rankings")
    }
  }

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
            <h1 className="text-xl font-bold">Department Secretary Portal</h1>
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

      <main className="flex-1 container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Graduation Management</h2>
          <p className="text-gray-600">Manage graduation lists, student records, and departmental processes</p>
        </div>

        {/* Error Alert */}
        {(error || actionError) && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error || actionError}</AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Lists</p>
                  <p className="text-2xl font-bold">{lists.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold">{lists.reduce((sum, list) => sum + list.entriesCount, 0)}</p>
                </div>
                <Award className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Issues</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <Edit3 className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <CheckSquare className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 mb-8">
          <Button onClick={() => setShowUploadForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create New Graduation List
          </Button>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Graduation List</CardTitle>
              <CardDescription>Upload a CSV file to create a new graduation list</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  handleCreateList(formData)
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="name">List Name</Label>
                  <Input id="name" name="name" required placeholder="e.g., Spring 2024 Graduates" />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Brief description of this graduation list"
                  />
                </div>
                <div>
                  <Label htmlFor="file">CSV File</Label>
                  <Input ref={fileInputRef} id="file" name="file" type="file" accept=".csv" required />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={isUploading}>
                    {isUploading ? "Creating..." : "Create List"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowUploadForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Graduation Lists */}
        <Card>
          <CardHeader>
            <CardTitle>Graduation Lists</CardTitle>
            <CardDescription>Manage your graduation lists and student records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lists.map((list) => (
                <div key={list.id} className="border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{list.name}</h3>
                      {list.description && <p className="text-gray-600 text-sm">{list.description}</p>}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>Created: {new Date(list.createdAt).toLocaleDateString()}</span>
                        <span>Students: {list.entriesCount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => alert(`Viewing details for ${list.name}`)}>
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleExport(list.id)}>
                      <DownloadCloud className="w-4 h-4 mr-1" />
                      Export CSV
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleViewRankings(list.id)}>
                      <Award className="w-4 h-4 mr-1" />
                      View Rankings
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-500 hover:bg-green-600"
                      onClick={() => handleApprove(list.id)}
                    >
                      <CheckSquare className="w-4 h-4 mr-1" />
                      Approve List
                    </Button>
                  </div>
                </div>
              ))}

              {lists.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Graduation Lists</h3>
                  <p className="text-gray-500 mb-4">Create your first graduation list by uploading a CSV file.</p>
                  <Button onClick={() => setShowUploadForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First List
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="bg-[#990000] text-white py-4 px-6 text-center">
        <p>© {new Date().getFullYear()} IYTE Graduation Management System. All rights reserved.</p>
      </footer>
    </div>
  )
}
